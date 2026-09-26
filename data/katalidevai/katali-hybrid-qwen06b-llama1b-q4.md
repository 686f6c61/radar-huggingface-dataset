# katalidevai/katali-hybrid-qwen06b-llama1b-q4

## Resumen

KATALI Hybrid Qwen3 0.6B + Llama 3.2 1B es un paquete de inferencia local para Windows publicado por el usuario katalidevai (Joan Apita) en HuggingFace. No es un modelo único ni un fichero GGUF autónomo: se distribuye como un contenedor con extensión .khyb que empaqueta dos modelos transformer densos ya cuantizados en Q4_K_M, Qwen3 0.6B y Llama 3.2 1B Instruct, y que solo se abre con el runtime propietario katali-hybrid.

El problema que aborda es la orquestación de dos modelos pequeños en local sobre Windows, con una interfaz gráfica incluida (katali-hybrid-gui.exe) y descubrimiento automático de paquetes desde C:\models. El autor lo presenta explícitamente como un experimento para medir velocidad, consumo de memoria y calidad de respuesta combinando ambos modelos.

Su relevancia es acotada pero concreta: sirve como banco de pruebas para inferencia híbrida de modelos mini (unos 0,6B y 1,2B de parámetros) sobre hardware de consumo, sin dependencia de la nube. En el momento de redactar esta ficha el repositorio acumula 0 descargas y 0 «me gusta», ocupa 1,4 GB y no declara licencia propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (dos modelos independientes: Qwen3 0.6B y Llama 3.2 1B Instruct) |
| Parámetros totales | Aprox. 0,6B (Qwen3 0.6B) + 1,23B (Llama 3.2 1B); no constituyen un único modelo |
| Parámetros activos | No aplica (ninguno de los dos componentes es MoE) |
| Longitud de contexto | No disponible para el paquete; los modelos base declaran 32.768 tokens (Qwen3 0.6B) y 128.000 tokens (Llama 3.2 1B) |
| Tipos de cuantización | Q4_K_M en ambos payloads GGUF |
| Idiomas soportados | No disponible para el paquete; según los modelos base, Qwen3 cubre 119 idiomas y dialectos y Llama 3.2 1B soporta oficialmente 8 idiomas |
| Licencia | No especificada para el paquete; sujeta a las licencias de los modelos base (Apache 2.0 en Qwen3 y Llama 3.2 Community License en Llama 3.2 1B) |
| Formato de pesos | Contenedor .khyb con dos payloads GGUF Q4_K_M en su interior (no es un GGUF autónomo) |
| Desarrollador | katalidevai (Joan Apita) |
| Tamaño del repositorio | 1,4 GB |

## Arquitectura y entrenamiento

Los dos componentes del paquete son transformers decoder-only causales. Qwen3 0.6B es un modelo denso de la familia Qwen3 (Alibaba) que admite modo de razonamiento («thinking») y modo de respuesta directa; la familia Qwen3 se entrenó sobre aproximadamente 36 billones de tokens. Llama 3.2 1B Instruct es un modelo denso de Meta obtenido por poda y destilación a partir de Llama 3.1, con fecha de corte de conocimiento en diciembre de 2023.

La aportación de este repositorio no reside en los pesos —el autor indica que son los GGUF originales sin modificar— sino en el empaquetado y la orquestación: un contenedor .khyb y un runtime (katali-hybrid.exe) que carga ambos modelos y ofrece un GUI de chat para Windows. No se documenta la estrategia de combinación (enrutado, ensemble o cascada) ni ningún proceso adicional de ajuste (RLHF, DPO) sobre los modelos base.

## Capacidades

Las capacidades que se enumeran a continuación corresponden a los modelos base y no están documentadas de forma específica para el paquete:

- Generación de texto y diálogo conversacional, heredadas de los dos modelos base.
- Razonamiento paso a paso y modo «thinking» en Qwen3 0.6B.
- Resolución de problemas matemáticos y lógicos sencillos, acorde al tamaño reducido de ambos modelos.
- Generación de código a pequeña escala (fragmentos y funciones cortas).
- Soporte multilingüe amplio en Qwen3 0.6B (119 idiomas); Llama 3.2 1B cubre 8 idiomas.
- Seguimiento de instrucciones y resumen en Llama 3.2 1B Instruct.
- Ejecución totalmente local y sin conexión en Windows.
- Tool calling / function calling: no documentado para el paquete; en modelos de este tamaño el soporte suele ser limitado.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Visión, audio u otras modalidades: no disponibles (ambos modelos son solo texto).

## Casos de uso

- Prototipado de chat local en Windows: mediante katali-hybrid-gui.exe se puede mantener una conversación sin conexión a Internet, útil para entornos con requisitos de privacidad o sin red.
- Banco de pruebas de rendimiento y memoria: el propio autor define el paquete como un instrumento para medir velocidad, uso de memoria y calidad de respuesta con dos modelos pequeños en la misma máquina.
- Comparación A/B de modelos pequeños: al cargar Qwen3 0.6B y Llama 3.2 1B conjuntamente, permite contrastar respuestas de ambos ante las mismas peticiones y elegir el más adecuado por tarea.
- Generación de texto ligera y resumen de documentos cortos en local: adecuado para borradores, reescritura y resúmenes donde no se requiere máxima precisión factual.
- Asistente de escritorio sin GPU dedicada: al ser modelos muy pequeños, pueden ejecutarse en CPU o en gráficas de gama baja dentro de flujos de trabajo de escritorio.
- Generación de código asistida en entornos aislados: para autocompletar fragmentos cortos o explicar funciones en equipos sin acceso a servicios en la nube.
- Investigación sobre inferencia híbrida: sirve para estudiar técnicas de reparto de carga y orquestación entre dos modelos pequeños en un mismo runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Peso total de los dos modelos: aprox. 1,2 GB en Q4_K_M; el repositorio completo (incluidos los ejecutables) ocupa 1,4 GB.
- Qwen3 0.6B Q4_K_M: aprox. 0,4 GB (estimación a partir del tamaño de los pesos).
- Llama 3.2 1B Q4_K_M: aprox. 0,8 GB (estimación a partir del tamaño de los pesos).
- VRAM estimada para inferencia: por debajo de 2 GB para ambos modelos con contexto corto; el consumo del KV cache crece con la longitud de contexto (estimación, no confirmada por el autor).
- GPU recomendadas: cualquier GPU de consumo reciente (RTX serie 20, 30 o 40, o GTX con VRAM suficiente); también es viable la ejecución en CPU.
- Cabe holgadamente en GPU de consumo e incluso en equipos sin GPU dedicada.
- Opciones de despliegue: exclusivamente mediante katali-hybrid.exe (runtime propietario para Windows) y katali-hybrid-gui.exe. Al no ser un GGUF autónomo, no es compatible directamente con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto (modelo base) | Formato | Licencia | Ejecución |
|---|---|---|---|---|---|
| KATALI Hybrid Qwen3 0.6B + Llama 3.2 1B | 0,6B + 1,23B (dos modelos) | 32.768 + 128.000 | .khyb (2x GGUF Q4_K_M) | No especificada (heredada de los modelos base) | Runtime katali-hybrid (Windows) |
| Qwen3 0.6B | 0,6B | 32.768 | GGUF | Apache 2.0 | llama.cpp, Ollama, LM Studio |
| Llama 3.2 1B Instruct | 1,23B | 128.000 | GGUF | Llama 3.2 Community License | llama.cpp, Ollama, LM Studio |
| SmolLM2 1.7B Instruct | 1,7B | 8.192 | safetensors, GGUF | Apache 2.0 | vLLM, llama.cpp, Ollama |

La diferencia principal de este paquete frente a las alternativas no es el rendimiento, sino el enfoque: combina dos modelos ya existentes en un contenedor y un runtime propietarios para Windows, en lugar de distribuir pesos cargables con herramientas estándar. Esto limita su portabilidad y su comparabilidad directa con los modelos base.

## Limitaciones y advertencias

- Proyecto experimental, sin validación pública ni métricas de calidad; 0 descargas y 0 «me gusta» en el momento de la consulta.
- Solo para Windows; el runtime es propietario y no se puede sustituir por herramientas de inferencia estándar.
- No es un GGUF autónomo: no se puede cargar directamente en llama.cpp, Ollama, vLLM o LM Studio.
- Licencia del paquete no declarada. Aunque los modelos base se rigen por Apache 2.0 (Qwen3) y la Llama 3.2 Community License (Llama 3.2 1B), esta última impone condiciones (atribución, límite de 700 millones de usuarios mensuales y restricciones de uso), por lo que conviene verificar los términos antes de un uso comercial.
- Modelos muy pequeños: alta probabilidad de alucinación, errores factuales y pérdida de coherencia en tareas largas o complejas.
- Idiomas: Llama 3.2 1B solo soporta oficialmente 8 idiomas, y el rendimiento fuera de ellos no está garantizado.
- Capacidad de razonamiento y ventana de contexto limitadas en comparación con modelos de mayor tamaño.
- No se documenta cómo se combinan los dos modelos ni cuál se emplea en cada situación, lo que dificulta predecir el comportamiento en producción.
- Ausencia total de benchmarks y de datos de latencia o throughput publicados.

## Enlaces

- HuggingFace: https://huggingface.co/katalidevai/katali-hybrid-qwen06b-llama1b-q4
- Runtime KATALI Hybrid (GitHub): https://github.com/katalidevai/katali-hybrid
- Modelo base Qwen3 0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Modelo base Llama 3.2 1B Instruct: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
