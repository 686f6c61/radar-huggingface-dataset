# neikhn/kronos-base-vn30-sft

## Resumen

Kronos Base — VN30 SFT es un ajuste fino (supervised fine-tuning) del modelo fundacional de series temporales Kronos-base, desarrollado por el usuario neikhn. El modelo está especializado en la predicción de series temporales financieras, concretamente sobre el índice VN30 de la bolsa de Vietnam, a partir de un snapshot fijo de datos OHLC de VNDIRECT. Con 102.311.008 parámetros y un repositorio de 0,4 GB en formato safetensors, se distribuye bajo licencia MIT y se apoya en la implementación nativa del proyecto Kronos, no en la arquitectura estándar de Transformers.

La relevancia de esta ficha es acotada y conviene subrayarlo desde el principio: el propio autor la cataloga como investigación exploratoria. No se verifica por completo la construcción de los datos OHLC del proveedor y no se reclama superioridad frente a una línea base Naive ni rendimiento de trading desplegable. Por tanto, debe evaluarse como un artefacto de investigación reproducible, no como un sistema listo para producción financiera.

El modelo se seleccionó mediante validación nativa incluyendo la época cero, quedándose con la época 5 y semilla de entrenamiento 42. La tokenización se realiza con NeoQuasar/Kronos-Tokenizer-base, congelado durante el ajuste fino, y la inferencia requiere fijar revisiones concretas del código y del tokenizador para garantizar la reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kronos (arquitectura personalizada del proyecto Kronos, no Transformers estándar) |
| Parametros totales | 102.311.008 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de 128 sesiones históricas y 20 futuras según el protocolo de inferencia) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el protocolo de referencia usa FP32) |
| Idiomas soportados | no disponible (modelo de series temporales, no de lenguaje natural) |
| Licencia | MIT, manteniendo la atribución original de Kronos |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de NeoQuasar/Kronos-base, un modelo fundacional para series temporales con una arquitectura propia del proyecto Kronos que no se integra automáticamente en el ecosistema Transformers ni ofrece una API de inferencia alojada. El ajuste fino se realizó sobre un snapshot fijo de datos OHLC del índice VN30 procedente de VNDIRECT, con el tokenizador NeoQuasar/Kronos-Tokenizer-base congelado durante todo el proceso. Los volúmenes e importes ausentes se rellenan con ceros mediante un adaptador.

El protocolo de entrenamiento y evaluación emplea 128 sesiones históricas y 20 sesiones futuras, precisión FP32, media de 3 trayectorias, temperatura 1.0 y top-p 0.9. La selección del checkpoint se hizo por validación nativa incluyendo la época cero, resultando ganadora la época 5 con semilla 42. El snapshot de datos tiene el SHA256 fee0bd8c240a9d2be4ef5c9d287eede6c5506b0358c25545e72de99709da4fd2, y el repositorio incluye provenance.json e inference_spec.json con hashes de revisión y de bytes. No se publican datos crudos, estados del optimizador, snapshots del generador de números aleatorios ni credenciales.

## Capacidades

- Predicción de series temporales financieras: genera trayectorias futuras de 20 sesiones a partir de 128 sesiones históricas de datos OHLC.
- Pronóstico probabilístico: produce múltiples trayectorias (media de 3 en el protocolo de referencia) con control de temperatura y top-p.
- Especialización en el índice VN30: ajustado específicamente sobre el snapshot fijo de VNDIRECT para este índice.
- Integración con panel local: el proyecto incluye un dashboard React/FastAPI para ejecución local, sin necesidad de Space.
- Reproducibilidad verificable: hashes de snapshot, de revisión del código y del tokenizador incluidos en el repositorio.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Investigación académica sobre modelos fundacionales de series temporales: sirve como punto de partida reproducible para estudiar el ajuste fino de Kronos sobre mercados emergentes, con protocolo y hashes documentados.
- Evaluación comparativa frente a líneas base Naive: permite montar experimentos controlados sobre el VN30 para medir si el ajuste fino aporta valor predictivo, aunque el autor no reclama superioridad.
- Prototipado de pipelines de pronóstico financiero: el modelo se puede integrar en un flujo local que consuma OHLC y genere trayectorias de 20 sesiones para análisis exploratorio.
- Docencia y formación en forecasting con modelos fundacionales: el dashboard React/FastAPI facilita demostraciones locales sin infraestructura cloud.
- Análisis de sensibilidad de hiperparámetros de inferencia: temperatura 1.0 y top-p 0.9 documentados permiten reproducir y variar el muestreo de trayectorias.
- Auditoría de procedencia de datos: los ficheros provenance.json e inference_spec.json permiten verificar la cadena de custodia del snapshot y del código utilizado.
- Desarrollo de adaptadores de datos: el tratamiento de volúmenes e importes ausentes mediante relleno con ceros sirve de referencia para integrar otras fuentes OHLC incompletas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 102,3 millones de parámetros en FP32, los pesos ocupan aproximadamente 0,41 GB, por lo que el requisito dominante será el de activaciones y lote.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU consumer reciente (por ejemplo, RTX 3060 o superior) debería poder alojar los pesos, aunque el proyecto no publica requisitos oficiales.
- Cabe en GPU consumer: sí, previsiblemente, dado el tamaño del modelo; sin cifras oficiales de VRAM total.
- Opciones de despliegue: implementación nativa de Kronos fijada en el commit 67b630e67f6a18c9e9be918d9b4337c960db1e9a, con Kronos.from_pretrained sobre el directorio local; dashboard React/FastAPI incluido en el proyecto. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| neikhn/kronos-base-vn30-sft | 102.311.008 | 128 sesiones históricas / 20 futuras (protocolo) | Pronóstico de series temporales VN30 | MIT | Hugging Face, 0 descargas |
| NeoQuasar/Kronos-base | no disponible | no disponible | Modelo fundacional de series temporales | no disponible en la información | Hugging Face (modelo base) |
| NeoQuasar/Kronos-Tokenizer-base | no disponible | no disponible | Tokenizador de series temporales | no disponible en la información | Hugging Face (tokenizador) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Investigación exploratoria: el autor declara explícitamente que no reclama superioridad frente a Naive ni rendimiento de trading desplegable.
- Construcción de OHLC no verificada por completo: la procedencia de los datos del proveedor VNDIRECT no está plenamente validada.
- Sesgo de mercado único: el ajuste se limita al índice VN30 y a un snapshot fijo, por lo que la generalización a otros índices o periodos no está demostrada.
- Relleno con ceros: los volúmenes e importes ausentes se sustituyen por cero, lo que puede introducir sesgos en la predicción.
- Dependencia de revisiones fijas: requiere el commit exacto del código Kronos y del tokenizador; otras revisiones pueden romper la reproducibilidad.
- Sin API alojada: la arquitectura personalizada no ofrece inferencia alojada automática; el despliegue es local.
- Sin datos de benchmarks: no hay métricas publicadas que permitan comparar su precisión con alternativas.
- Licencia MIT: permite uso comercial manteniendo la atribución original de Kronos, pero la ausencia de garantías de rendimiento desaconseja su uso en producción financiera sin validación adicional.
- Riesgo de sobreajuste al snapshot: al entrenarse sobre un conjunto fijo y seleccionarse por validación nativa, el comportamiento fuera de ese periodo es incierto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/neikhn/kronos-base-vn30-sft
- Modelo base: https://huggingface.co/NeoQuasar/Kronos-base
- Tokenizador: https://huggingface.co/NeoQuasar/Kronos-Tokenizer-base
