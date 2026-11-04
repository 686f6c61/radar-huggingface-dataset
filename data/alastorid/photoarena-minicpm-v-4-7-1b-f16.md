# alastorid/PhotoArena-MiniCPM-V-4.7-1B-F16

## Resumen

PhotoArena-MiniCPM-V-4.7-1B-F16 es una redistribucion sin modificaciones de los pesos originales de OpenBMB MiniCPM-V 4.7 1B, publicada por el usuario alastorid bajo licencia Apache-2.0. El modelo se distribuye en formato GGUF con pesos F16 para el modelo de lenguaje y el proyector de vision, e incorpora una compresion visual de 16x. Su proposito declarado es servir como motor de inferencia nativo en llama.cpp (Metal/CPU) dentro de la aplicacion PhotoArena, que envia dos imagenes de vista general y solicita una salida JSON estructurada y restringida.

El modelo base, MiniCPM-V 4.7 1B, es un modelo multimodal image-text-to-text de aproximadamente 1.000 millones de parametros (1.006.209.856 segun los safetensors del repo), desarrollado por OpenBMB con componentes de Qwen y SigLIP. Esta ficha describe la version redistribuida por alastorid, que no aporta cambios en los pesos pero si un contexto de uso muy concreto: comparacion A/B de imagenes con salida estructurada y deteccion de entradas identicas.

La relevancia de esta publicacion es limitada y muy especifica: no es un lanzamiento de modelo nuevo ni una mejora sobre el original, sino un artefacto de despliegue para una aplicacion concreta (WaifuFinder/PhotoArena). El autor advierte explicitamente de que el benchmark incluido solo demuestra ejecucion nativa y salida estructurada repetida, y no paridad de tensores FP16, juicios calibrados de autenticidad, registro de imagenes ni calidad de reconstruccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de lenguaje + proyector de vision SigLIP), inferencia nativa en llama.cpp |
| Parametros totales | 1.006.209.856 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16 (pesos del modelo de lenguaje y del proyector de vision); el repo base incluye variantes GGUF |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (repo de 3,1 GB) |

## Arquitectura y entrenamiento

La arquitectura es la del MiniCPM-V 4.7 1B original: un modelo de lenguaje transformer combinado con un codificador visual basado en SigLIP y un proyector que aplica una compresion visual de 16x, lo que reduce el numero de tokens visuales por imagen. Esta version redistribuida mantiene los pesos en F16 tanto para el modelo de lenguaje como para el proyector, y se ejecuta mediante una integracion nativa en llama.cpp con backend Metal/CPU, no mediante una conversion a ANE/Core ML. El autor fija el commit nativo de llama.cpp en 7071ba378afa96dcd69c41e1ec2b4912364dbee4.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo base utilizo RLHF, DPO u otras tecnicas de alineacion. La model card de esta redistribucion no aporta detalles de entrenamiento y se limita a atribuir el credito a OpenBMB, Qwen y los autores de SigLIP. La innovacion tecnica destacable en este artefacto no esta en el modelo sino en el entorno de ejecucion: inferencia nativa sin Python, sin dependencias de decodificacion de video y sin inferencia en la nube en tiempo de ejecucion.

## Capacidades

- Generacion de texto e inferencia image-text-to-text: acepta imagenes y texto y produce respuestas conversacionales.
- Salida JSON estructurada y restringida: PhotoArena solicita respuestas en formato JSON con restricciones, y el autor afirma que el benchmark incluido demuestra salida estructurada repetida.
- Comparacion A/B de imagenes: el caso de uso disenado envia dos vistas generales de imagen y pide una preferencia entre A y B.
- Deteccion de entradas identicas: la aplicacion detecta imagenes identicas y reconcilia ambos ordenes A/B, absteniendose cuando hay desacuerdo.
- Compresion visual 16x: reduce el coste de tokens visuales por imagen, lo que facilita la ejecucion en CPU/Metal.
- Ejecucion local sin nube: no requiere Python ni dependencias de decodificacion de video en tiempo de ejecucion.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, vision adicional, audio: no disponible en la informacion proporcionada (solo se documenta vision).

## Casos de uso

- Comparacion A/B de imagenes en aplicaciones de escritorio: el modelo recibe dos vistas generales y devuelve un JSON con la preferencia, integrandose en PhotoArena para tareas de seleccion visual con salida parseable.
- Verificacion de duplicados en catalogos de imagenes: la aplicacion detecta entradas identicas y reconcilia el orden A/B, de modo que el modelo puede usarse como componente de un pipeline que se abstiene ante desacuerdos en lugar de forzar una eleccion.
- Despliegue local en macOS con Metal: al ser una integracion nativa en llama.cpp, encaja en aplicaciones de escritorio que necesitan inferencia multimodal sin depender de servicios en la nube ni de Python.
- Procesamiento por lotes de pares de imagenes con salida estructurada: la salida JSON restringida permite encadenar el modelo en scripts o workers que consumen resultados de forma automatica.
- Prototipado de evaluacion visual de bajo coste: con 1B de parametros y pesos F16, sirve para experimentar con juicios de preferencia visual en hardware de gama consumer antes de escalar a modelos mayores.
- Empaquetado reproducible en aplicaciones: el autor incluye el codigo fuente del worker nativo y la configuracion CMake, lo que permite reproducir el binario y auditar las dependencias de terceros en un entorno de distribucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona un benchmark interno que demuestra ejecucion nativa y salida estructurada repetida, sin cifras de MMLU, HumanEval, GSM8K ni metricas comparables. El autor indica ademas que el modelo sin calibrar prefirio A ante imagenes identicas (ver validation.json), lo que constituye una observacion cualitativa, no un resultado de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 1.006 millones de parametros en F16, el peso de los tensores ronda los 2 GB, y el repo completo ocupa 3,1 GB.
- GPU recomendadas: no disponible en la informacion proporcionada; la integracion documentada es Metal/CPU en llama.cpp.
- Cabe en GPU consumer: previsiblemente si, dado el tamano de 1B en F16, aunque la informacion proporcionada no confirma modelos concretos de GPU.
- Opciones de despliegue: llama.cpp con backend Metal/CPU (integracion nativa documentada); otras opciones como vLLM, Ollama o TGI no se mencionan en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| PhotoArena-MiniCPM-V-4.7-1B-F16 | 1.006.209.856 | no disponible | Apache-2.0 | GGUF (F16) | Redistribucion de MiniCPM-V 4.7 1B para llama.cpp nativo |
| openbmb/MiniCPM-V-4.7-1B (base) | no disponible | no disponible | Apache-2.0 | no disponible | Modelo original de OpenBMB; esta version no modifica los pesos |
| openbmb/MiniCPM-V-4.7-1B-GGUF | no disponible | no disponible | Apache-2.0 | GGUF | Repositorio GGUF original del que se toma la revision 345adbfa02c4a4671e61b7c75502dc9bf24fa93d |

No se dispone de datos de rendimiento comparado con alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El autor advierte de que el benchmark incluido no establece paridad de tensores FP16, juicios calibrados de autenticidad, registro de imagenes, procedencia de pixeles ni calidad de reconstruccion.
- El modelo sin calibrar prefirio A ante imagenes identicas, lo que indica un sesgo de posicion en tareas de comparacion A/B; la aplicacion lo mitiga detectando entradas identicas y reconciliando ambos ordenes.
- No debe usarse la certeza autoinformada del modelo como probabilidad ni su juicio como prueba de autenticidad.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero relevante en un modelo de 1B con salida estructurada.
- Idiomas soportados y limitaciones de contexto: no disponibles.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo en produccion.
- El artefacto esta pensado para un flujo concreto (PhotoArena) y su validacion no cubre otros usos.

## Enlaces

- HuggingFace: https://huggingface.co/alastorid/PhotoArena-MiniCPM-V-4.7-1B-F16
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-1B
- Repositorio GGUF de origen: https://huggingface.co/openbmb/MiniCPM-V-4.7-1B-GGUF (revision 345adbfa02c4a4671e61b7c75502dc9bf24fa93d)
- Codigo fuente nativo de llama.cpp fijado: commit 7071ba378afa96dcd69c41e1ec2b4912364dbee4 (sin URL directa en la informacion disponible)
