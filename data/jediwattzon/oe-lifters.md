# jediwattzon/oe-lifters

## Resumen

`oe-lifters` es una coleccion de adaptadores LoRA publicada por el usuario `jediwattzon` para el modelo base `mlx-community/Qwen2.5-Coder-7B-Instruct-4bit`. El objetivo declarado es el "lifting" de ensamblador ARM64 a C, es decir, la traduccion de codigo maquina generado por compilador de vuelta a codigo C legible y semanticamente equivalente. Los adaptadores fueron entrenados por el proyecto `open-everything` sobre pares (ensamblador, codigo fuente) generados por compilador, lo que implica un corpus sintetico y alineado por construccion.

El repositorio no contiene un modelo completo, sino pesos de adaptadores organizados en carpetas por variante: `corr0` (entrenado con elastic weight consolidation), `lift` y `lift2` (ambos LoRA) y `merged` (resultado de un fisher-merge a partir de `lift` y `lift2`). El autor incluye un `manifest.json` descrito como "provenance scorecard", es decir, un registro de trazabilidad del entrenamiento.

Es relevante porque aborda una tarea poco cubierta por los asistentes de codigo generalistas: la reconstruccion de fuente a partir de binarios ARM64, un problema clasico de ingenieria inversa, auditoria de seguridad y migracion de codigo heredado. Al estar empaquetado para MLX, su ejecucion esta orientada a Apple Silicon. El tamano del repositorio es de 0,3 GB, coherente con un conjunto de adaptadores y no con pesos completos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA sobre transformer decoder-only (modelo base Qwen2.5-Coder-7B-Instruct) |
| Parametros totales | No disponible para los adaptadores; el modelo base tiene aproximadamente 7,6 mil millones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada en la informacion disponible; heredada del modelo base |
| Tipos de cuantizacion | La distribucion apunta a pesos MLX de 4 bits del modelo base; no se documentan otras |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptadores LoRA en formato MLX) |

## Arquitectura y entrenamiento

El artefacto no es un modelo autonomo, sino un conjunto de adaptadores de bajo rango (LoRA) que se cargan sobre `mlx-community/Qwen2.5-Coder-7B-Instruct-4bit`. Se documentan cuatro variantes con tecnicas distintas de entrenamiento o combinacion: `corr0` emplea elastic weight consolidation (EWC), un metodo de regularizacion que penaliza la deriva de pesos importantes para tareas previas; `lift` y `lift2` son adaptadores LoRA convencionales, probablemente con hiperparametros o datos diferentes; y `merged` es el resultado de aplicar un fisher-merge sobre `lift` y `lift2`, una tecnica de fusion de pesos basada en la matriz de informacion de Fisher.

El corpus de entrenamiento, segun la model card, son pares (ensamblador, fuente) generados por compilador para ARM64. Esto implica un dataset sintetico obtenido compilando codigo C existente y capturando la salida del ensamblador, con la ventaja de que las etiquetas son exactas y no dependen de anotacion humana. No se especifican el numero de tokens, la composicion del dataset, el idioma del codigo fuente ni si se aplicaron etapas de RLHF o DPO. El autor menciona que `manifest.json` actua como marcador de procedencia del entrenamiento, pero no se aportan sus valores en la informacion disponible.

## Capacidades

- Traduccion de ensamblador ARM64 generado por compilador a codigo C, que es la tarea declarada del entrenamiento.
- Generacion de codigo en C y en otros lenguajes, heredada del modelo base Qwen2.5-Coder.
- Razonamiento sobre estructuras de bajo nivel: registros, pila, convenciones de llamada, saltos y bucles.
- Capacidad de instruccion y dialogo, dado que el modelo base es una variante Instruct.
- Capacidades multilingues: no disponibles en la informacion proporcionada para el adaptador, aunque el modelo base declara soporte de multiples idiomas.
- Soporte de tool calling y function calling: no documentado para el adaptador; el modelo base lo soporta parcialmente.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo de razonamiento explicito (thinking mode), vision o audio: no disponibles.

## Casos de uso

- Lifting de binarios ARM64 a C para ingenieria inversa: se introduce el listado de ensamblador generado por compilador y el adaptador produce una reconstruccion en C, util para entender firmware o bibliotecas sin fuente.
- Auditoria de seguridad de firmware ARM64: convertir rutinas sospechosas a C facilita la revision manual y el analisis con herramientas estaticas, en lugar de leer ensamblador.
- Migracion de codigo heredado: cuando solo se conserva el binario o el ensamblador de un modulo, el lifting a C permite recompilarlo, mantenerlo o portarlo a otra arquitectura.
- Analisis de malware para ARM64: la salida en C de funciones de cifrado, resolucion de simbolos o desempaquetado acelera el triaje frente a la lectura directa de ensamblador.
- Verificacion formal: generar C con estructura reconocible como paso previo a la instrumentacion con herramientas tipo Frama-C o CBMC, anadiendo anotaciones de contrato sobre el codigo levantado.
- Docencia de ensamblador ARM64: usar el lifting inverso (C a ensamblador, comparando con la salida del compilador) como material didactico para explicar optimizaciones y convenciones ABI.
- Asistente local en Mac para ingenieria inversa: al ejecutarse con MLX sobre Apple Silicon, permite trabajar con binarios sensibles sin enviar codigo a servicios en la nube.
- Generacion de parches de compatibilidad: reescribir en C rutinas dependientes de instrucciones concretas de ARM64 para mejorar la portabilidad del binario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exactitud, similitud de codigo (por ejemplo, edit distance o compilabilidad), ni comparaciones numericas entre las variantes `corr0`, `lift`, `lift2` y `merged`. El archivo `manifest.json` se describe como marcador de procedencia, pero su contenido numerico no se ha proporcionado.

## Requisitos de hardware

- Al estar empaquetado para MLX, el destino natural son equipos Apple Silicon (familias M1, M2, M3 y M4), con memoria unificada en lugar de VRAM dedicada.
- Huella de memoria estimada: los pesos del modelo base en 4 bits ocupan aproximadamente 4 GB, a los que se suman los adaptadores (repositorio de 0,3 GB en total) y la cache KV. Con 8 GB de memoria unificada el margen es muy ajustado; 16 GB es el minimo comodo y 32 GB o mas permite contextos largos.
- GPU recomendadas para el modelo base en formato no MLX: una RTX 4090 (24 GB) o una A100/H100 si se convierte a otros formatos; en MLX no aplica CUDA.
- Cabe en GPU de consumo en su variante cuantizada a 4 bits, siempre que se disponga de al menos 8-16 GB de memoria.
- Opciones de despliegue: `mlx_lm` (carga directa con `adapter_path`), `mlx_lm.server` para exponer una API compatible con OpenAI, y LM Studio con soporte MLX. Para vLLM, llama.cpp, Ollama o TGI seria necesario convertir los adaptadores a formato PEFT/HF o GGUF, conversion que no esta documentada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| oe-lifters (este) | Adaptadores sobre base de ~7,6B | No disponible | Lifting ARM64 asm a C | No disponible | HuggingFace (MLX) |
| Qwen2.5-Coder-7B-Instruct | ~7,6B | 32.768 tokens nativos | Asistente de codigo general | Apache 2.0 en el modelo base | HuggingFace, ampliamente disponible |
| Qwen2.5-Coder-14B-Instruct | ~14,7B | 32.768 tokens nativos | Asistente de codigo general | Apache 2.0 en el modelo base | HuggingFace |
| Otros adaptadores de decompilacion (por ejemplo, familias derivadas de CodeLlama) | Segun base | Segun base | Decompilacion hacia C | Variable | Depende del autor |

La comparacion cuantitativa de rendimiento no esta disponible: no se han publicado metricas del adaptador frente al modelo base sin ajustar ni frente a alternativas especializadas. Cualquier afirmacion de superioridad seria especulativa.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que las variantes mejoren al modelo base en la tarea objetivo.
- Riesgo de alucinacion elevado: la generacion de C a partir de ensamblador puede producir codigo sintacticamente plausible pero semanticamente incorrecto, especialmente en presencia de optimizaciones agresivas, instrucciones SIMD, saltos indirectos o tablas de salto.
- Sesgo de dominio: el entrenamiento se realizo sobre pares generados por compilador, por lo que el rendimiento ante ensamblador escrito a mano, ofuscado o generado por otros compiladores es incierto.
- Licencia no especificada: la ausencia de licencia explicita impide confirmar si el uso comercial esta permitido. Conviene contactar con el autor antes de integrarlo en produccion.
- Sesgos lingueisticos y de estilo heredados del modelo base, no evaluados en esta publicacion.
- Longitud de contexto no documentada para el adaptador; no se ha verificado el comportamiento con listados de ensamblador largos.
- Dependencia de Apple Silicon: el formato MLX limita el despliegue en infraestructura x86 con CUDA sin una conversion previa cuyo resultado no esta validado.
- Informacion de procedencia incompleta: no se detallan tokens de entrenamiento, composicion del dataset, hiperparametros ni criterios de seleccion de la mejor variante.
- Los resultados de la busqueda web no aportan informacion relevante sobre este modelo; no se han encontrado papers, blogs ni evaluaciones independientes.
- Fecha de creacion del repositorio registrada como 2026-10-15, posterior a la fecha habitual de publicacion; conviene verificar la vigencia de los artefactos antes de usarlos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jediwattzon/oe-lifters
- Proyecto de entrenamiento: https://github.com/robertd/open-everything
- Modelo base: https://huggingface.co/mlx-community/Qwen2.5-Coder-7B-Instruct-4bit
- Modelo base original: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- No se han encontrado papers, blogs, demos ni evaluaciones independientes en la busqueda web realizada.
