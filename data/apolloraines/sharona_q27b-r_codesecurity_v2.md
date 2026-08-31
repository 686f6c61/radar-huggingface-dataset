# ApolloRaines/Sharona_Q27B-R_CodeSecurity_v2

## Resumen

Sharona_Q27B-R_CodeSecurity_v2 es un modelo de 26.900 millones de parametros (~27B) especializado en auditoria de seguridad de codigo, desarrollado por ApolloRaines sobre la base Qwen/Qwen3.5-27B. No es un chatbot de proposito general: es un escaner de vulnerabilidades de codigo disenado para identificar fallos de seguridad con referencias concretas a lineas y parametros, sin ambiguedad ni sesgo de adulacion. Es el modelo que impulsa la plataforma ShipItClean de revision automatizada de seguridad.

El modelo se construye mediante jBlaze, una herramienta propietaria de cirugia conductual que opera directamente sobre los pesos del transformer, y jTuner, un sistema de calibracion automatica que ajusta la intensidad de cada modificacion. Se aplican siete modificaciones conductuales apiladas: pensamiento adversarial amplificado, fidelidad al contexto reforzada, identidad reemplazada, precision amplificada, eliminacion de rechazos, escepticismo amplificado y eliminacion de sicofancia. Segun el autor, es el primer modelo auto-calibrado de jBlaze.

La relevancia actual del modelo radica en su enfoque de proposito especifico: en lugar de un LLM generalista que ofrece consejos vagos de seguridad, Sharona produce diagnosticos precisos con localizacion exacta de la vulnerabilidad, lo que lo hace util como componente en pipelines de revision de codigo automatizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen 3.5-27B) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el ejemplo de despliegue vLLM usa 16384 tokens) |
| Tipos de cuantizacion | FP8 (ejemplo vLLM), GPTQ 4-bit (mencionado en el repositorio) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen 3.5-27B, un transformer decoder-only denso de aproximadamente 26,9B parametros. Sobre esta base no se aplica un fine-tuning convencional, sino un proceso de cirugia conductual mediante la herramienta propietaria jBlaze, que identifica direcciones conductuales en el espacio de pesos y las modifica quirurgicamente para amplificar o eliminar comportamientos especificos. El tipo de modelo declarado es `qwen3_5_text`.

jTuner, la novedad anunciada con este lanzamiento, automatiza la calibracion de cada modificacion, equilibrando la intensidad del cambio con la preservacion de capacidades. Esto hace viable apilar siete modificaciones en un unico modelo, algo que con calibracion manual seria practicamente imposible por el estrecho margen entre "efectivo" e "incoherente". Las siete modificaciones son: pensamiento adversarial amplificado, fidelidad al contexto reforzada, identidad reemplazada (sustituida por la identidad Sharona), precision amplificada, eliminacion de rechazos de seguridad, escepticismo amplificado y eliminacion de sicofancia. Segun publicaciones del autor en LinkedIn sobre la version anterior del modelo, el proceso incluyo seis fases de cirugia de pesos, un fine-tuning de seguridad de codigo y cuantizacion 4-bit, con una mejora de +1 punto porcentual sobre el modelo base, aunque no se especifican las metricas concretas.

## Capacidades

- Analisis de vulnerabilidades de seguridad en codigo fuente con localizacion precisa (linea, parametro, tipo de fallo).
- Deteccion de fallos de logica de negocio que requieren leer la especificacion, gracias a la fidelidad al contexto reforzada.
- Pensamiento adversarial: evalua el codigo desde la perspectiva de un atacante ("como se puede romper esta funcion").
- Escepticismo amplificado: cuestiona la eficacia real de controles existentes (p. ej., si un token CSRF esta ligado a la sesion o puede reproducirse).
- Ausencia de sicofancia: no confirma la seguridad del codigo si hay fallos, independientemente de lo que indique el prompt.
- Sin rechazos: analiza todo el codigo sin declinar por contenido.
- Generacion de texto conversacional en ingles (formato chat con plantilla de Qwen).
- No incluye capacidades de vision, audio ni modo thinking explicito.

## Casos de uso

- Revision de seguridad en pipelines CI/CD: el modelo puede integrarse como revisor automatico en el flujo de integracion continua, analizando cada commit o pull request y generando hallazgos con referencias exactas a lineas y parametros.
- Auditoria de aplicaciones web: analisis de endpoints, autenticacion, autorizacion y manejo de sesiones, detectando inyecciones SQL, XSS, CSRF y otros fallos OWASP con localizacion concreta.
- Revision de codigo previa a despliegue: escaneo de repositorios antes de publicar una version, complementando o sustituyendo revisiones manuales de seguridad.
- Analisis de codigo heredado: evaluacion de fragmentos de codigo legacy para identificar vulnerabilidades antes de una migracion o refactorizacion.
- Formacion de equipos de desarrollo: generacion de ejemplos de codigo vulnerable y explicaciones de por que son inseguros, util para programas de concienciacion en seguridad.
- Plataforma ShipItClean: el modelo es uno de los revisores especializados que operan en paralelo en la plataforma automatizada de revision de seguridad de codigo, produciendo hallazgos con escenarios de explotacion y guias de remediacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor menciona en redes sociales una mejora de +1 punto porcentual sobre el modelo base tras seis fases de cirugia de pesos, un fine-tuning de seguridad de codigo y cuantizacion 4-bit, pero no se especifican las metricas concretas ni el benchmark utilizado, y la referencia corresponde a la version anterior del modelo (sin el sufijo _v2).

## Requisitos de hardware

- VRAM estimada para inferencia: ~54 GB en BF16 (26,9B parametros × 2 bytes), ~27 GB en FP8, ~14 GB en GPTQ 4-bit.
- GPU recomendadas: para FP8 con tensor-parallel-size 2, dos GPUs de al menos 16 GB (p. ej., A100 40GB, H100, o RTX 4090 con cuantizacion 4-bit).
- En consumer GPU: cabe en una RTX 4090 (24 GB) solo con cuantizacion 4-bit; en FP8 necesitaria dos GPUs o una GPU profesional de 32 GB o mas.
- Opciones de despliegue: vLLM (ejemplo oficial con `--tensor-parallel-size 2` y `--quantization fp8`), Transformers con `device_map="auto"`, y potencialmente llama.cpp/Ollama con cuantizaciones GGUF (no confirmado en la documentacion).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Sharona_Q27B-R_CodeSecurity_v2 | 26,9B | No disponible | Apache 2.0 | Escaner de seguridad de codigo con cirugia conductual |
| Qwen 3.5-27B (base) | 26,9B | No disponible | Apache 2.0 | LLM generalista |
| Otros modelos de revision de codigo | No disponible | No disponible | No disponible | No disponible |

La comparativa con otros modelos especializados en seguridad de codigo no esta disponible en la informacion proporcionada. El unico punto de referencia directo es el modelo base Qwen 3.5-27B, del cual deriva.

## Limitaciones y advertencias

- Modelo de proposito especifico: no es un chatbot generalista y puede rendir mal fuera del ambito de analisis de seguridad de codigo.
- Idioma: solo soporta ingles; no hay garantias de rendimiento en otros idiomas.
- La eliminacion de rechazos de seguridad implica que el modelo analizara cualquier codigo sin filtros, lo que puede ser inapropiado en entornos donde se requiera moderacion de contenido.
- La herramienta jBlaze es propietaria y no se publicara; el modelo es de codigo abierto (Apache 2.0) pero la metodologia de modificacion no es reproducible por terceros.
- Riesgo de alucinacion: aunque la precision esta amplificada, no hay garantia de que todos los hallazgos sean correctos; se recomienda validacion humana de los resultados.
- Sin datos de benchmarks publicados: no hay evidencia cuantitativa independiente del rendimiento en deteccion de vulnerabilidades.
- El modelo tiene 0 descargas y 0 likes en HuggingFace, lo que sugiere que no ha sido validado por la comunidad.
- La fecha de creacion en los metadatos (2026-08-31) es posterior a la fecha actual, lo que puede indicar un error en los metadatos o un modelo muy reciente sin adopcion.

## Enlaces

- HuggingFace: https://huggingface.co/ApolloRaines/Sharona_Q27B-R_CodeSecurity_v2
- Repositorio de archivos: https://huggingface.co/ApolloRaines/Sharona_Q27B-R_CodeSecurity_v2/tree/main
- Version anterior (sin _v2): https://huggingface.co/ApolloRaines/Sharona_Q27B-R_CodeSecurity
- jBlaze: https://jblaze.dev
- ShipItClean: https://shipitclean.com
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
