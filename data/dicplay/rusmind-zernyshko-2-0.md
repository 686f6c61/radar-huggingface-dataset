# DICPlay/RusMind-Zernyshko-2.0

## Resumen

RusMind Zernyshko 2.0 es un modelo de lenguaje compacto de 342 millones de parametros entrenado completamente desde cero por DICPlay, un desarrollador que comercializa la linea bajo la marca "RusMind". Se presenta como la segunda generacion de la familia "Zernyshko" (que significa "semilla" o "grano" en ruso) y esta especializado en el idioma ruso, con un tokenizador propio de 48.000 tokens entrenado sobre texto ruso. El modelo se distribuye en formato safetensors para transformers y en GGUF para llama.cpp, LM Studio y Ollama.

La propuesta de valor es un modelo pequeno que cabe en un portatil o incluso en un telefono, con un contexto de 4096 tokens y capacidades declaradas de razonamiento aritmetico basico, generacion de codigo, salida estructurada en JSON y llamada de herramientas (tool calling). El autor insiste en que el entrenamiento es "from scratch" (desde pesos aleatorios), con 4.500 millones de tokens de datos rusos y un posterior ajuste fino orientado a habilidades practicas.

Es relevante ahora porque ocupa un nicho poco comun: modelos de menos de 500 millones de parametros, nativos en ruso y ejecutables en hardware muy modesto. Sin embargo, sus resultados publicados son limitados (una puntuacion de 0,054 en MERA 2.0 y un test interno de 120 preguntas), y la licencia es restrictiva para uso comercial, lo que condiciona seriamente su adopcion en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con RMSNorm, RoPE, SwiGLU y GQA 16/4; 26 capas x 1024 de dimension |
| Parametros totales | 342.283.264 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | bf16 (pesos originales), GGUF Q8_0, GGUF Q4_K_M |
| Idiomas soportados | Ruso (declarado oficialmente); el autor menciona capacidades de traduccion sin especificar pares de idiomas |
| Licencia | RusMind License (DICPlay); uso no comercial libre, comercial solo por contrato escrito |
| Formato de pesos | safetensors (transformers, con `trust_remote_code=True`) y GGUF (repositorio separado) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 26 capas con dimension oculta de 1024, normalizacion RMSNorm, embeddings posicionales rotatorios (RoPE), activacion SwiGLU y atencion con query grouping (GQA) en configuracion 16 cabezas de atencion y 4 de valor. El tokenizador es propio, con un vocabulario de 48.000 tokens entrenado sobre texto ruso, y la implementacion del modelo (`modeling_rusmind_ai.py`) es una reescritura independiente en PyTorch, sin reutilizar clases de Llama ni de otros modelos. La version GGUF emplea la etiqueta de arquitectura `llama` unicamente porque es el codigo interno de llama.cpp que la carga, no porque derive de pesos de Meta.

El entrenamiento declara 4.500 millones de tokens procedentes de Wikipedia en ruso, web rusa, dialogos propios, codigo y problemas. Posteriormente se aplico un ajuste fino orientado a habilidades practicas: calculo, generacion de codigo, salida JSON, traduccion, llamada de herramientas, cortesia y calibracion de la honestidad. El autor aporta como evidencia de entrenamiento desde cero la curva de perdida (9,13 en el paso 50, frente a los 2-3 tipicos de un ajuste fino sobre un modelo preentrenado) y un registro completo en `training/train_300m.log`. No se documentan tecnicas como RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional en ruso con formato de plantilla ChatML.
- Razonamiento aritmetico basico de varios pasos (sumas, problemas de velocidad, etc.).
- Generacion de codigo, aunque sin datos publicados sobre lenguajes soportados ni benchmarks.
- Salida estructurada en JSON a partir de instrucciones en lenguaje natural.
- Llamada de herramientas (tool calling) con formato `{"tool": ..., "args": {...}}`.
- Traduccion declarada por el autor, sin especificar pares de idiomas ni calidad.
- Declaracion de incertidumbre ("no lo se") cuando el modelo no dispone de informacion.
- Ejecucion completamente offline en dispositivos de gama baja (portatil, telefono).
- No se documentan capacidades de vision, audio, agentes multi-paso ni modo de razonamiento extendido.

## Casos de uso

- Asistentes conversacionales en ruso en dispositivos sin conectividad: el modelo cabe en 219 MB en Q4_K_M, por lo que puede ejecutarse en un telefono o en un portatil antiguo con llama.cpp u Ollama, ofreciendo un chatbot local sin dependencia de la nube.
- Extraccion de datos estructurados de texto: dado un texto en ruso, el modelo puede devolver JSON con campos definidos (producto y precio, por ejemplo), lo que resulta util para pipelines de procesamiento de documentos o formularios.
- Enrutamiento de herramientas en asistentes de voz o chat: con soporte de tool calling, puede decidir que funcion invocar (por ejemplo, consultar el tiempo) y devolver los argumentos en JSON, actuando como capa de enrutamiento ligera.
- Prototipado rapido y educacion: al ser un modelo pequeno entrenado desde cero y con pesos abiertos, sirve para experimentar con arquitecturas transformer, tokenizadores y tecnicas de ajuste fino en cursos o laboratorios con recursos limitados.
- Tareas de calculo y resolucion de problemas simples en ruso: puede resolver operaciones aritmeticas y problemas de una o dos etapas, util como asistente de apoyo en entornos educativos o de atencion basica.
- Procesamiento de texto en local para privacidad: al ejecutarse offline, permite clasificar, resumir o transformar texto ruso sin enviar datos a servicios externos, adecuado para entornos con requisitos de confidencialidad.
- Generacion de codigo asistida en entornos sin conexion: puede producir fragmentos de codigo a partir de descripciones en ruso, aunque su tamano limita la complejidad de los programas que puede generar de forma fiable.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| MERA 2.0 (puntuacion global) | 0,054 | Mejor resultado de la linea Zernyshko segun el autor; metodologia MERA 2.0 |
| Test interno de 120 preguntas practicas | 74 puntos | Frente a 53,5 de la misma base antes del ajuste fino; test propio del autor, no estandarizado |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los datos de MERA 2.0 y del test interno no son comparables directamente con los de otros modelos sin la metodologia completa.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,7 GB en bf16, unos 0,4 GB en GGUF Q8_0 y unos 0,25 GB en GGUF Q4_K_M (los pesos ocupan 685 MB, 367 MB y 219 MB respectivamente, mas overhead de contexto y runtime).
- GPU recomendadas: cualquier GPU consumer moderna sirve; cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs integradas o en CPU.
- Cabe en GPU consumer: si, en practicamente todas; tambien en telefonos y portatiles sin GPU dedicada.
- Opciones de despliegue: transformers (con `trust_remote_code=True`), llama.cpp, LM Studio y Ollama mediante el repositorio GGUF. No se documenta soporte para vLLM ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| RusMind Zernyshko 2.0 | 342 M | 4096 | Ruso | RusMind License (comercial restringida) | safetensors, GGUF |
| Qwen2.5-0.5B | 494 M | 32.768 | Multilingue (incluye ruso) | Apache 2.0 | safetensors, GGUF |
| SmolLM2-360M | 362 M | 8192 | Principalmente ingles | Apache 2.0 | safetensors, GGUF |
| TinyLlama-1.1B | 1.100 M | 2048 | Principalmente ingles | Apache 2.0 | safetensors, GGUF |

Los tres modelos alternativos son de proposito general y no estan especializados en ruso, pero ofrecen licencias permisivas y contextos mayores. RusMind Zernyshko 2.0 destaca por su tokenizador nativo ruso y su tamano minimo, pero carece de benchmarks comparables y su licencia limita el uso comercial. No se dispone de datos de rendimiento cruzado entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: entrenado sobre Wikipedia y web rusas, puede heredar sesgos culturales y de representacion de esas fuentes; no se documenta ninguna mitigacion.
- Riesgo de alucinacion: elevado en un modelo de 342 M de parametros; el autor declara capacidad de decir "no lo se", pero no hay evaluacion independiente de la tasa de alucinacion.
- Limitaciones de contexto: 4096 tokens es una ventana corta para documentos largos o conversaciones extensas.
- Limitaciones de idioma: el modelo esta disenado para ruso; su rendimiento en castellano u otros idiomas no esta documentado y probablemente sea deficiente.
- Restricciones de licencia: el uso comercial, la redistribucion de versiones modificadas y la integracion en productos requieren contrato escrito con DICPlay; esto excluye la mayoria de los usos empresariales sin negociacion previa.
- Dependencia de `trust_remote_code=True`: la arquitectura es personalizada, lo que implica ejecutar codigo del autor y complica la auditoria de seguridad en produccion.
- Madurez: el modelo es muy reciente (publicado en noviembre de 2026), con 916 descargas y 1 like, y sin validacion independiente.
- Benchmarks limitados: los unicos datos son un test interno de 120 preguntas y MERA 2.0 con puntuacion de 0,054, insuficientes para estimar su calidad en tareas reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DICPlay/RusMind-Zernyshko-2.0
- Repositorio GGUF: https://huggingface.co/DICPlay/RusMind-Zernyshko-2.0-GGUF
- Registro de entrenamiento: https://huggingface.co/DICPlay/RusMind-Zernyshko-2.0/blob/main/training/train_300m.log
- Licencia: https://huggingface.co/DICPlay/RusMind-Zernyshko-2.0/blob/main/LICENSE
- Contacto del autor (Telegram): https://t.me/DanKirillin
- Contacto del autor (MAX): https://max.ru/u/f9LHodD0cOIENg5eShucR-RyhC02ijx-XXjPGcPbjBRy6_KKvmdKIu9tdQU
