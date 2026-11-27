# chrisuser/neuro-compiler

## Resumen

neuro-compiler es un compilador neuronal experimental y no autorregresivo desarrollado por el usuario chrisuser (publicado también bajo el espacio orthagonal en Hugging Face). Su objetivo es traducir un subconjunto muy restringido de C++ directamente a código máquina x86-64 (convención SysV) sin generar texto ensamblador intermedio, sustituyendo las fases clásicas de un compilador por redes neuronales especializadas que aprenden representaciones intermedias: AST neuronal, SSA desplegado, selección de instrucciones, asignación de registros y codificación binaria.

El modelo se construye sobre el backbone Qwen/Qwen2.5-Coder-0.5B congelado (revisión fijada `0576a1bc0ae53f21860e905e081807bd7ff4a4c7`), del que solo se retienen los seis primeros bloques (225.608.960 parámetros), a los que se añaden etapas especializadas con 3.934.092 parámetros. La inferencia es totalmente paralela, sin decodificación autorregresiva, y se apoya en operaciones tensoriales y plantillas de codificación aprendidas.

Es relevante como prueba de concepto de investigación sobre compilación neuronal end-to-end, no como herramienta de producción. El propio autor advierte que el código generado puede ser incorrecto o inseguro, que no se garantiza corrección semántica y que nunca debe ejecutarse código generado no confiable de forma nativa. El proyecto se encuentra en estado 0.1.0-experimental, con fecha de creación en noviembre de 2026 y sin descargas registradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: backbone transformer (Qwen2.5-Coder-0.5B, primeros 6 bloques congelados) + etapas neuronales especializadas no autorregresivas (NeuroCC V2) |
| Parametros totales | 229.543.052 (225.608.960 del backbone + 3.934.092 de etapas especializadas) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 96 tokens de Qwen; capacidad de fuente de 192 bytes UTF-8 |
| Tipos de cuantizacion | no disponible (pesos sin cuantizar, conservan los dtypes entrenados; Qwen en FP16 en CUDA y FP32 en CPU; etapas especializadas en FP32 con fronteras FP16) |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | SafeTensors (librería `neuro_compiler`; sin GGUF) |

## Arquitectura y entrenamiento

La arquitectura sigue un pipeline de compilación neuronal en cascada: fuente C++ → bloques congelados 1–6 de Qwen → AST neuronal → SSA desplegado neuronal → selección de instrucciones neuronal → asignación de registros neuronal → generación binaria neuronal → bytes de código máquina x86-64 SysV. Los modos de etapa son `deps_w128`, `deps_w128`, `discrete_copy_w128`, `aligned_copy_w128` y `copy_w128`, respectivamente. No se incluye el asignador de registros V3. Todas las etapas predicen en paralelo, sin decodificación autorregresiva, y la inferencia emplea operaciones tensoriales y búsqueda/empaquetado de plantillas de codificación aprendidas, sin compilador convencional, ensamblador, oráculo semántico, selector de instrucciones determinista ni asignador.

El entrenamiento se realizó sobre un corpus sintético de 10.000 funciones de expresión equilibradas únicas (8.000 de entrenamiento, 1.000 de validación y 1.000 de test original). Las trazas del compilador se usaron únicamente como etiquetas de entrenamiento y referencia. Las etapas especializadas se entrenaron de forma progresiva alimentadas por características congeladas de Qwen. La gramática soportada es la firma `unsigned f(unsigned a,unsigned b,unsigned c){return EXPR;}` con expresiones como árboles binarios equilibrados completamente parentizados de profundidad 1–3, hojas `a`, `b`, `c` o literales `1u`–`63u`, y operadores `+`, `-`, `*`, `^`, `&`, `|` con aritmética de 32 bits con desbordamiento envolvente. Las referencias SSA usan IDs de argumento 1–3, IDs de instrucción desde 4, ID de constante 12 y relleno 0.

## Capacidades

- Traducción de un subconjunto restringido de C++ a bytes de código máquina x86-64 (SysV) sin pasar por texto ensamblador.
- Predicción paralela no autorregresiva de todas las etapas de compilación.
- Exposición de representaciones intermedias: `result.ast` (IDs de clase de nodo en anchura y características latentes FP16), `result.ssa` (opcode, dirección de operando y constantes sin signo), MIR virtual (IDs de firma, referencias de operandos virtuales e inmediatos) y MIR física (IDs de firma, registros, inmediatos y campos de pila).
- Compilación por lotes (`compile_batch`) con tamaño de lote configurable.
- Verificación semántica opcional por muestreo mediante el extra `[evaluation]`.
- Interfaz de línea de comandos (`neuro-compiler`) con opciones `--file`, `--source`, `--output`, `--device` y `--verify`.
- Soporte de ejecución en CUDA y CPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-step, visión, audio ni modo thinking; no es un modelo generativo de texto.

## Casos de uso

- Investigación en compilación neuronal: servir como banco de pruebas para estudiar si las transformaciones de compilación pueden aprenderse end-to-end con redes neuronales sobre un dominio controlado, comparando las representaciones intermedias expuestas con las de un compilador clásico.
- Docencia y divulgación: ilustrar las fases de un compilador (AST, SSA, selección de instrucciones, asignación de registros, codificación binaria) mediante tensores inspeccionables en lugar de estructuras opacas.
- Generación de datos sintéticos de compilación: usar el corpus y las trazas del proyecto como base para entrenar o evaluar otros modelos de compilación neuronal en el mismo subconjunto de expresiones.
- Experimentación con representaciones intermedias: analizar la calidad del AST y del SSA neuronales frente a los producidos por herramientas deterministas en expresiones aritméticas de profundidad 1–3.
- Pruebas de robustez y seguridad: evaluar la tasa de código incorrecto o inseguro generado en entradas dentro y fuera de la gramática entrenada, dado que el autor no garantiza corrección semántica.
- Integración en pipelines de investigación con verificación: usar `--verify` y el extra `[evaluation]` para comprobar por muestreo la semántica del código generado antes de cualquier análisis posterior, nunca ejecutándolo de forma nativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model-index del autor declara una entrada (`neuro-compiler`) con la lista de resultados vacía.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Con 229,5 millones de parámetros totales y pesos sin cuantizar, el backbone en FP16 ocupa aproximadamente 0,45 GB y las etapas especializadas en FP32 aproximadamente 0,016 GB, a lo que hay que sumar el coste de activaciones y del proceso de carga (el loader puede descargar los pesos completos del modelo base antes de descartar los bloques no usados).
- GPU recomendadas: no disponibles en la información proporcionada; el modelo soporta CUDA y CPU. Cualquier GPU consumer con suficiente VRAM para el backbone en FP16 debería poder alojarlo, aunque no se han publicado requisitos oficiales.
- ¿Cabe en GPU consumer? Previsiblemente sí por tamaño de pesos, pero no hay confirmación oficial ni cifras medidas en la información disponible.
- Opciones de despliegue: instalación como paquete Python (`python -m pip install ./neuro-compiler`) con PyTorch y Transformers; CLI `neuro-compiler`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a esta librería).
- Entorno medido por el autor: Python 3.14, PyTorch 2.13.0+cu132, Transformers 4.57.6, SafeTensors 0.8.0 y Hugging Face Hub 0.36.2; se requiere Python 3.10 o superior.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| neuro-compiler | 229,5 M (225,6 M backbone + 3,9 M etapas) | 96 tokens / 192 bytes de fuente | Compilación neuronal C++→x86-64 | Apache 2.0 | Hugging Face (`chrisuser/neuro-compiler`, `orthagonal/neuro-compiler`) |
| Qwen2.5-Coder-0.5B (modelo base) | 0,5 B | no disponible en la información | Generación de código autorregresiva | no disponible en la información | Hugging Face |
| Compiladores clásicos (GCC, Clang) | no aplica | no aplica | Compilación determinista C++→x86-64 | GPL / Apache 2.0 con excepciones | Ampliamente disponibles |

No se dispone de otros compiladores neuronales comparables en la información proporcionada.

## Limitaciones y advertencias

- Prueba de concepto de investigación, no lista para producción; el código generado puede ser incorrecto o inseguro y no se garantiza corrección semántica.
- Nunca debe ejecutarse código generado no confiable de forma nativa.
- Gramática muy restringida: sin flujo de control general, bucles, llamadas arbitrarias, punteros, división, aritmética con signo o en coma flotante, árboles arbitrarios ni C++ completo.
- Los derrames (spills) de registros siguen siendo una debilidad importante.
- Una fuente aceptada sintácticamente puede producir código máquina semánticamente erróneo; las comprobaciones léxicas no garantizan pertenencia a la gramática entrenada.
- Capacidad de fuente limitada a 192 bytes UTF-8 y 96 tokens de Qwen; las entradas sobredimensionadas se rechazan, nunca se truncan en silencio.
- Solo idioma inglés y solo expresiones con formato similar al de entrenamiento; formatos distintos no están validados para precisión.
- Salida dirigida a x86-64 SysV, no a la convención de llamada Windows x64; no hay interfaz de ejecución nativa ni empaquetado ejecutable para Windows.
- No se asume identidad byte a byte entre CPU y CUDA.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no aplica en el sentido generativo habitual, pero sí existe riesgo de salida binaria incorrecta o insegura.
- Licencia Apache 2.0: permite uso comercial, pero el estado experimental y la ausencia de garantías desaconsejan cualquier uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/chrisuser/neuro-compiler
- Espacio alternativo del autor: https://huggingface.co/orthagonal/neuro-compiler
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B
- Revisión fijada del modelo base: `0576a1bc0ae53f21860e905e081807bd7ff4a4c7`
- Paper, blog, repositorio o demos: no disponibles en la información proporcionada.
