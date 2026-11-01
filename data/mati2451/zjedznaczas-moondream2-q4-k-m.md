# Mati2451/zjedznaczas-moondream2-q4-k-m

## Resumen

Moondream2 Q4_K_M para ZjedzNaCzas es una cuantizacion experimental del modelo multimodal Moondream2, publicada por el usuario Mati2451 como artefacto de desarrollo para un proyecto Android de reduccion de desperdicio alimentario. No se trata de un modelo nuevo ni de un fine-tuning: los pesos derivan del GGUF publico `ggml-org/moondream2-20250414-GGUF` (revision `97d0efa`), y el unico componente transformado es el modelo de texto, cuantizado a Q4_K_M con `llama.cpp` b8392 sobre CPU en Google Colab. El proyector multimodal se mantiene en su version original F16.

El modelo resuelve image-text-to-text, es decir, responder preguntas en lenguaje natural sobre una imagen. En el contexto del proyecto se emplea para leer etiquetas de caducidad en envases de alimentos, aunque el autor advierte explicitamente de que se trata de una comprobacion de integracion y no de un sistema validado en produccion. La relevancia practica es la de un ejemplo reproducible de cuantizacion de un VLM pequeno para despliegue local en Android, con trazabilidad de hashes y procedencia documentada.

La arquitectura interna es la de Moondream2 legacy, basada en `phi2` para el componente de texto, con un total de 1.418.270.720 parametros. El repositorio ocupa 0,9 GB y la licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Moondream2 legacy (componente de texto basado en `phi2`) con proyector multimodal |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (solo el modelo de texto); proyector en F16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`moondream2-text-q4_k_m.gguf` + `moondream2-mmproj-f16.gguf`) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion, no un entrenamiento. El componente de texto corresponde a la arquitectura legacy de Moondream2, que el autor identifica como `phi2`; el proyector multimodal se conserva en F16 sin modificar. La cuantizacion se realizo con `llama.cpp` build b8392 (commit `627670601a64569d9d822c8d52a8ff39ed69cce5`), compilado desde fuente en Google Colab sobre CPU.

El artefacto incluye un `provenance.json` con los detalles de conversion y compilacion, y el autor documenta los hashes SHA-256 de ambos componentes: `moondream2-text-q4_k_m.gguf` (919.494.144 bytes, `6b04b0516b8e2687f1b17e7c26a07c4a7ff2a9707b5dd6b43c7c7bb2c9e0aa9d`) y el proyector F16 original (909.777.984 bytes, `4cc1cb3660d87ff56432ebeb7884ad35d67c48c7b9f6b2856f305e39c38eed8f`). No se dispone de informacion sobre volumen de tokens, composicion del dataset ni etapas de RLHF o DPO en la informacion proporcionada.

Un detalle tecnico relevante es el formato de prompt para la ruta de consulta visual legacy: un token BOS explicito, seguido de los embeddings de imagen, `\n\nQuestion: `, la pregunta y `\n\nAnswer:`. El GGUF desactiva la insercion automatica de BOS, por lo que la aplicacion debe preparar la entrada de forma explicita. Los metadatos del fichero conservan la plantilla `vicuna` heredada, que no debe usarse para esta ruta.

## Capacidades

- Generacion de texto condicionada por imagen (image-text-to-text): responde preguntas sobre el contenido visual de una imagen.
- Lectura de texto en imagenes: el autor verifica la lectura de una etiqueta sintetica con las cadenas `USE BY` y `15.11.2026`.
- Conversacion de un solo turno en la ruta de consulta visual legacy, con el formato de prompt especifico descrito.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; no se documentan idiomas soportados.
- Capacidades especiales (vision, audio, thinking mode): vision unicamente; no se documentan audio ni modo de razonamiento extendido.

## Casos de uso

- Lectura asistida de fechas de caducidad en envases: el modelo recibe una fotografia y una pregunta sobre la fecha impresa, y devuelve el texto detectado. El autor lo valida solo con una etiqueta sintetica, por lo que requiere confirmacion humana en cada caso.
- Prototipado de aplicaciones Android con inferencia local: los dos ficheros GGUF suman aproximadamente 1,83 GB y pueden empaquetarse en la app, lo que permite probar un pipeline de vision por lenguaje sin depender de servicios remotos.
- Verificacion de integracion de cuantizaciones: sirve como referencia reproducible para comprobar que una cuantizacion Q4_K_M de un VLM conserva la capacidad de lectura de texto, con hashes y procedencia auditables.
- Docencia y experimentacion con `llama.cpp`: el repositorio documenta build, commit y entorno de compilacion, lo que facilita reproducir el proceso en un entorno controlado.
- Evaluacion de latencia en dispositivos: el autor mide 95,267 segundos en CPU de Colab para un unico intento incluyendo carga, dato util para dimensionar pruebas en hardware movil antes de comprometerse con un despliegue.
- Base para proyectos de reduccion de desperdicio alimentario: el modelo puede integrarse en un flujo donde el usuario fotografia un producto y recibe una sugerencia de fecha, siempre con confirmacion manual y sin que la respuesta del modelo determine la seguridad del alimento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El unico dato de rendimiento documentado es una medicion de integracion: 95,267 segundos en CPU de Google Colab para un unico intento de inferencia, incluyendo la carga del modelo, sobre una fixture sintetica con `USE BY` y `15.11.2026`. El autor indica que la latencia en Android, el arranque en frio, el uso de memoria y el objetivo de cinco segundos siguen pendientes de prueba en dispositivo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; los dos ficheros GGUF suman aproximadamente 1,83 GB, mas espacio de trabajo durante la importacion o descarga.
- GPU recomendadas: no disponibles en la informacion proporcionada; la cuantizacion se genero en CPU.
- Compatibilidad con GPU de consumo: no confirmada; el tamano de los ficheros sugiere que podria caber en GPUs con 4 GB o mas de VRAM, pero no hay validacion publicada.
- Opciones de despliegue: `llama.cpp` (build b8392 o compatible) y el ecosistema GGUF; el autor menciona integracion en un paquete Android con nombres de fichero locales `moondream2-text-q4_k_m.gguf` y `moondream2-mmproj-f16.gguf`.
- Latencia y throughput: 95,267 segundos por intento en CPU de Colab incluyendo carga; sin datos de throughput ni de latencia en GPU o en dispositivo movil.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Moondream2 Q4_K_M (ZjedzNaCzas) | 1.418.270.720 | no disponible | GGUF | Apache-2.0 | Cuantizacion experimental de un unico componente; sin benchmarks publicados |
| Moondream2 (upstream `ggml-org/moondream2-20250414-GGUF`) | no disponible en la informacion | no disponible | GGUF | Apache-2.0 | Modelo base del que deriva esta cuantizacion; proyector F16 identico |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se proporcionan datos de otros modelos comparables |

## Limitaciones y advertencias

- Modelo experimental: el autor declara `qualityApproved` como `false` y describe el artefacto como comprobacion de integracion, no como sistema validado.
- Precision no verificada en entornos reales: la unica prueba documentada es una etiqueta sintetica; no hay evaluacion sobre envases reales, iluminacion variable, angulos o reflejos.
- Riesgo de alucinacion critico en el dominio de uso: el autor exige que toda fecha propuesta sea confirmada por una persona y prohibe que el modelo establezca seguridad alimentaria, invente una fecha ausente o apruebe una fecha de forma silenciosa.
- Limitaciones de contexto e idioma: no se documentan la longitud de contexto ni los idiomas soportados, por lo que no puede asumirse un comportamiento multilingue.
- Formato de prompt fragil: la ruta de consulta visual legacy requiere BOS explicito y el esquema `\n\nQuestion: ...\n\nAnswer:`, y los metadatos conservan una plantilla `vicuna` heredada que no corresponde a ese uso.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el autor no ofrece ninguna garantia y el modelo base conserva su propia procedencia; conviene revisar los terminos del repositorio upstream.
- Ausencia de datos de sesgo, robustez o evaluacion de seguridad: no disponibles en la informacion proporcionada.
- Latencia elevada en el unico dato publicado (95,267 segundos en CPU), incompatible con el objetivo de cinco segundos sin optimizacion adicional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Mati2451/zjedznaczas-moondream2-q4-k-m
- Modelo base en HuggingFace: https://huggingface.co/ggml-org/moondream2-20250414-GGUF
- Revision fijada del modelo base: https://huggingface.co/ggml-org/moondream2-20250414-GGUF/tree/97d0efa4667189aea70998d0b1ee36a7a3214fcb
- Proyector F16 upstream: https://huggingface.co/ggml-org/moondream2-20250414-GGUF/resolve/97d0efa4667189aea70998d0b1ee36a7a3214fcb/moondream2-mmproj-f16-20250414.gguf
- Aclaracion del autor upstream sobre la arquitectura: https://github.com/ggml-org/llama.cpp/pull/13745
