# DICPlay/RusMind-Zernyshko-2.0.1

## Resumen

RusMind Zernyshko 2.0.1 es un modelo de lenguaje compacto de 342 millones de parametros desarrollado desde cero por DICPlay, empresa rusa que comercializa la familia RusMind. Se trata de un transformer decoder de 26 capas con 1024 dimensiones ocultas, ventana de contexto de 4096 tokens y un tokenizador propio de 48 000 entradas entrenado especificamente sobre ruso. La version 2.0.1 es un ajuste fino de la 2.0 orientado a mejorar el mantenimiento de conversaciones multiturno, el calculo aritmetico dentro del dialogo y la explicacion de conceptos cotidianos.

El modelo se posiciona como una alternativa ultraligera que funciona completamente en local, incluso en telefono, con pesos de 685 MB en bf16 y versiones GGUF de 367 MB (Q8_0) y 219 MB (Q4_K_M). Su propuesta de valor es cubrir tareas basicas de conversacion, aritmetica, generacion de JSON y llamada a herramientas con un modelo de tamano muy reducido y un tokenizador optimizado para ruso.

La relevancia actual radica en su enfoque "from scratch" para un idioma con poca representacion en modelos abiertos de gran escala, aunque su rendimiento medido es bajo (0,054 en MERA 2.0) y su licencia restringe fuertemente el uso comercial. El modelo emplea una arquitectura propia que requiere `trust_remote_code=True` en transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (RMSNorm, RoPE, SwiGLU, GQA 16/4), 26 capas x 1024 |
| Parametros totales | 342.283.264 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | bf16, GGUF Q8_0, GGUF Q4_K_M |
| Idiomas soportados | Ruso (ru) |
| Licencia | RusMind License (DICPlay), licencia propia |
| Formato de pesos | safetensors (transformers), GGUF (llama.cpp, LM Studio, Ollama) |
| Vocabulario | 48 000 tokens, tokenizador propio entrenado en ruso |
| Formato de dialogo | ChatML |
| Tamano del repositorio | 0,7 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder de 26 capas con dimension oculta de 1024, normalizacion RMSNorm, embeddings posicionales rotatorios (RoPE), activacion SwiGLU y atencion con query grouping (GQA) en configuracion 16 cabezas de atencion y 4 de key/value. Tanto los pesos como el tokenizador (48 000 tokens) y los datos de entrenamiento son propios, con entrenamiento desde cero. La version GGUF utiliza la disposicion estandar de llama para garantizar compatibilidad con llama.cpp, LM Studio y Ollama.

El preentrenamiento consumio 4,5 mil millones de tokens procedentes de Wikipedia en ruso, web en ruso, dialogos propios, codigo y tareas. Posteriormente se aplico un ajuste fino orientado a habilidades practicas: calculo, generacion de codigo, salida en JSON, traduccion, invocacion de herramientas, cortesia y honestidad ante el desconocimiento. No se documenta el uso de RLHF ni DPO, ni se detalla la composicion exacta del dataset ni innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ruso con soporte multiturno (mejorado en 2.0.1 para el segundo y tercer mensaje del dialogo).
- Razonamiento aritmetico basico dentro de la conversacion (sumas, problemas de velocidad, etc.).
- Generacion de codigo y salida estructurada en JSON a partir de lenguaje natural.
- Llamada a herramientas / function calling con formato JSON (`{"tool": ..., "args": ...}`).
- Explicacion de conceptos cotidianos (familia, amistad, volcan, cosmos).
- Expresion de incertidumbre ("no lo se") cuando el modelo desconoce la respuesta.
- Mantenimiento de identidad y posiciones declaradas por el autor.
- Capacidades multilingues: limitadas al ruso segun la model card.

## Casos de uso

- Asistente conversacional local en ruso: el modelo mantiene dialogos multiturno de hasta 4096 tokens y puede ejecutarse en un portatil o telefono mediante GGUF Q4_K_M (219 MB), adecuado para aplicaciones de escritorio o moviles sin conexion.
- Extraccion de datos estructurados: convertir frases en ruso como "El portatil cuesta 55 000 rublos" en JSON con campos `product` y `price`, util para pipelines de procesamiento de pedidos o inventario.
- Enrutamiento de herramientas en agentes ligeros: dado un conjunto de funciones disponibles (por ejemplo, `weather`), el modelo emite la llamada JSON correspondiente, lo que permite construir agentes de bajo coste en entornos con recursos limitados.
- Tutor educativo de matematicas basicas: resuelve problemas aritmeticos paso a paso en ruso, apropiado para aplicaciones de refuerzo escolar offline.
- Prototipado e investigacion de modelos from-scratch: sirve como base para estudiar tokenizadores y arquitecturas entrenadas desde cero en ruso, con un coste computacional minimo.
- Filtrado y clasificacion de texto en ruso: su ventana de 4096 tokens y su tokenizador especializado permiten procesar documentos cortos o mensajes en aplicaciones de moderacion o etiquetado.
- Generacion de respuestas de soporte de primer nivel: para consultas frecuentes y acotadas en ruso, con la ventaja de ejecucion local y sin dependencia de API.

## Benchmarks y rendimiento

| Benchmark | RusMind Zernyshko 2.0.1 | Notas |
|---|---|---|
| MERA 2.0 (score global) | 0,054 (version 2.0) | Mejor de la linea Zernyshko segun el autor |
| Test practico interno (120 preguntas) | 74 / 100 (version 2.0) frente a 53,5 antes del ajuste fino | Metodologia propia del autor, no estandarizada |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K) en la informacion disponible. Los datos de MERA 2.0 y del test interno corresponden a la version 2.0, no a la 2.0.1.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7 GB en bf16; unos 0,4 GB en GGUF Q8_0; unos 0,25 GB en GGUF Q4_K_M (sin contar overhead del runtime).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe en tarjetas con 2 GB o mas de VRAM, e incluso en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer (GTX 1050, RTX 3050, RTX 4090) e incluso en telefonos mediante GGUF.
- Opciones de despliegue: transformers con `trust_remote_code=True`, llama.cpp, LM Studio y Ollama (via GGUF).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Rendimiento |
|---|---|---|---|---|---|
| RusMind Zernyshko 2.0.1 | 342 M | 4096 | Ruso | RusMind License (uso comercial restringido) | MERA 2.0: 0,054 |
| Modelos comparables de ~300-500 M | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables de modelos alternativos de la misma categoria en la informacion proporcionada; la comparativa cuantitativa queda pendiente.

## Limitaciones y advertencias

- Rendimiento global muy bajo en MERA 2.0 (0,054), lo que sugiere capacidad limitada para tareas complejas de comprension y razonamiento en ruso.
- Riesgo elevado de alucinacion y de respuestas incorrectas en dominios fuera del entrenamiento; el modelo declara honestidad ante el desconocimiento, pero no hay garantia sistematica.
- Cobertura linguistica limitada al ruso; no se documenta soporte fiable de otros idiomas.
- Ventana de contexto de solo 4096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Licencia RusMind License: uso gratuito solo para fines personales, no comerciales, de investigacion y evaluacion; el uso comercial, la reventa, la distribucion de versiones modificadas y la integracion en productos requieren contrato escrito con DICPlay.
- Requiere `trust_remote_code=True` por arquitectura propia, lo que implica ejecutar codigo del autor y revisar su contenido antes de desplegar en produccion.
- Los benchmarks publicados son internos y no estandarizados; la cifra MERA 2.0 corresponde a la version 2.0, no a la 2.0.1.
- Modelo de 342 M de parametros: no apto para tareas de razonamiento complejo, generacion de codigo avanzada ni agentes autononomos de multiples pasos.
- Sin datos publicos de sesgos especificos, pero al entrenarse sobre web rusa puede heredar sesgos de esas fuentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DICPlay/RusMind-Zernyshko-2.0.1
- Version GGUF: https://huggingface.co/DICPlay/RusMind-Zernyshko-2.0.1-GGUF
- Licencia (archivo LICENSE en el repositorio): https://huggingface.co/DICPlay/RusMind-Zernyshko-2.0.1/blob/main/LICENSE
- Paper, blog, repositorio o demo oficiales: no disponibles en la informacion proporcionada.
