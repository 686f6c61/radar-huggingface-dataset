# QuantumNous/astrlink-guard

## Resumen

AstrLink Guard es un modelo ligero de detección de información personal (PII) y secretos desarrollado por QuantumNous, publicado en HuggingFace con licencia Apache-2.0. Se trata de un clasificador de tokens (token classification) basado en BertForTokenClassification, construido sobre microsoft/Multilingual-MiniLM-L12-H384, con 36,9 millones de parámetros y 12 capas de tamaño oculto 384. Su función es localizar en el texto datos personales (fechas privadas, cuentas, etc.) y credenciales (claves de API, secretos comunes) en chino, inglés y texto mixto chino-inglés.

Su relevancia actual radica en el auge de los asistentes de código con IA: el modelo está diseñado específicamente para inspeccionar las peticiones que herramientas como Claude Code, Codex o Cursor envían a modelos de lenguaje, evitando que credenciales o datos personales salgan de la organización. También funciona sobre código fuente, ficheros de configuración y logs.

Se distribuye en formato ONNX en tres variantes (INT8 dinámico de 36 MiB, FP32 de 141 MiB y FP16 de 71 MiB), lo que permite ejecutarlo localmente en CPU con ONNX Runtime o en GPU. La versión analizada es la 0.1.3, que introduce la compilación FP16 y mantiene los mismos pesos y comportamiento que la 0.1.2 para INT8 y FP32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BertForTokenClassification, 12 capas, tamaño oculto 384 |
| Parametros totales | 36,9 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (ventana con solapamiento de 128 tokens para entradas largas) |
| Tipos de cuantizacion | INT8 dinámico, FP32, FP16 (LayerNorm en FP32, entrada fija 1 × 512) |
| Idiomas soportados | Chino (zh), inglés (en) y texto mixto chino-inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (INT8 y FP32 con pesos en fichero externo; FP16 en fichero único) |

## Arquitectura y entrenamiento

El modelo parte de microsoft/Multilingual-MiniLM-L12-H384, un transformer multilingüe compacto con tokenizador XLM-R SentencePiece Unigram de 40.003 tokens. Sobre esa base se añade una cabeza de clasificación de tokens (BertForTokenClassification) que etiqueta cada fragmento con uno de 10 tipos de entidad (entre ellos `private_date`, `common_secret`, `account` y claves de acceso tipo AWS `AKIA…`). Para textos largos, el modelo procesa ventanas de 512 tokens con solapamiento de 128 tokens y devuelve cada span detectado con su etiqueta y puntuación; la aplicación decide qué enmascarar.

No se han publicado detalles sobre el número de tokens de entrenamiento ni la composición exacta del dataset, aunque la model card indica que los benchmarks cubren texto general, código y peticiones de asistentes de código. La versión 0.1.2 introdujo un cambio conductual importante: `private_date` ahora cubre solo fechas asociadas a una persona concreta (nacimiento, documentos, citas médicas, viajes), reduciendo drásticamente los falsos positivos sobre timestamps, cabeceras HTTP/git, logs y fechas de build. El umbral mínimo recomendado de puntuación de span es 0,8.

## Capacidades

- Detección de PII en chino, inglés y texto mixto chino-inglés, sobre texto general, código fuente, ficheros de configuración y logs.
- Detección de credenciales y secretos: claves de API, claves de acceso AWS (`AKIA…`), contraseñas y otros secretos comunes.
- Clasificación de tokens en 10 tipos de entidad, devolviendo span, etiqueta y puntuación para cada detección.
- Inspección de peticiones de asistentes de código con IA (Claude Code, Codex, Cursor) antes de que lleguen al LLM.
- Procesamiento de entradas largas mediante ventanas de 512 tokens con solapamiento de 128 tokens.
- Ejecución 100 % local en CPU (ONNX Runtime) o GPU (FP16), sin envío de datos a servicios externos.
- Integración con catálogos de modelos nativos: Core ML en Macs con Apple silicon (macOS 26 o posterior) y DirectML en Windows (en pruebas).

## Casos de uso

- Filtrado previo en asistentes de código con IA: interceptar las peticiones de Claude Code, Codex o Cursor y enmascarar credenciales y PII antes de enviarlas al LLM, evitando fugas de secretos en entornos corporativos.
- Escaneo de repositorios y CI/CD: analizar código fuente y ficheros de configuración en pipelines para detectar claves de API o contraseñas comprometidas antes del despliegue.
- Cumplimiento de privacidad (GDPR/PDPC chino): identificar y enmascarar datos personales en logs, bases de datos exportadas o documentos antes de compartirlos con terceros.
- Redacción de logs y telemetría: procesar logs de aplicación en streaming para eliminar identificadores personales y fechas privadas manteniendo timestamps técnicos, gracias al comportamiento refinado de `private_date` en la 0.1.2.
- Anonimización de datasets de entrenamiento: etiquetar spans de PII en corpus de texto chino e inglés para construir datasets limpios para fine-tuning de LLMs.
- Gateways de API y proxies LLM: desplegar el modelo como filtro en un gateway que inspeccione el tráfico hacia proveedores de LLM, aprovechando su baja latencia en CPU con INT8.
- Auditoría de seguridad interna: revisar históricos de peticiones y ficheros en busca de credenciales filtradas, con detección específica de patrones como `AKIA…`.

## Benchmarks y rendimiento

Todos los resultados usan la puntuación mínima de span recomendada de 0,8 (F1 en tanto por ciento):

| Formato | F1 texto general | F1 código | Macro F1 asistentes de código (9 tipos) |
|---|---|---|---|
| INT8 (recomendado) | 97,46 | 93,54 | 90,58 |
| FP32 | 97,35 | 93,83 | 90,84 |
| FP16 | 97,35 | 93,83 | 90,84 |

Datos adicionales publicados en la model card (versión 0.1.2/0.1.3):

- De 2.158 credenciales en peticiones de asistentes de código, INT8 deja 51 sin ninguna parte enmascarada y FP32 deja 45.
- De 91 claves de acceso AWS (`AKIA…`), INT8 omite 1 y FP32 omite 1.
- De 1.760 fechas personales, INT8 detecta el 81,5 % y FP32 el 82,7 % (la versión 0.1.1 detectaba el 98,6-98,8 %, pero con muchos más falsos positivos).
- De 187 peticiones sin datos personales ni credenciales, INT8 genera falsos positivos en 20 y FP32 en 24.
- De 7.743 fechas no personales, INT8 marca 21 y FP32 marca 22.

No se han publicado comparaciones con otros modelos de detección de PII en la información disponible.

## Requisitos de hardware

- Tamaño del modelo: 36 MiB (INT8), 71 MiB (FP16) y 141 MiB (FP32); el repositorio completo ocupa 0,6 GB.
- VRAM estimada para inferencia: no disponible; el modelo está diseñado para ejecutarse principalmente en CPU, por lo que los requisitos de GPU son mínimos (por debajo de 1 GB en cualquier GPU moderna).
- CPU: totalmente viable; INT8 dinámico con ONNX Runtime es el formato recomendado y cabe en cualquier máquina moderna, incluidos portátiles y contenedores ligeros.
- GPU: la variante FP16 está pensada para runtimes de GPU, con entrada fija de 1 × 512 tokens; compatible con Core ML en Macs con Apple silicon (macOS 26+) y DirectML en Windows (en pruebas).
- Despliegue: ONNX Runtime (CPU o GPU). No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI (no son aplicables al ser un modelo ONNX de token classification).
- Latencia y throughput: no se han publicado cifras concretas, aunque al ser un modelo de 36,9 M de parámetros cuantizado a INT8 la inferencia por petición en CPU es del orden de milisegundos.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Formato | Licencia |
|---|---|---|---|---|
| QuantumNous/astrlink-guard | 36,9 M | PII + secretos (zh/en, código y asistentes de IA) | ONNX (INT8/FP32/FP16) | Apache-2.0 |
| microsoft/Multilingual-MiniLM-L12-H384 (base) | 36,9 M | Modelo base genérico, sin cabeza de PII | PyTorch | MIT |
| Presidio (Microsoft) | No es un modelo, sistema de reglas + NER | PII (multilingüe, basado en reglas y NER externo) | Python | MIT |

AstrLink Guard se diferencia de soluciones basadas en reglas como Presidio en que ofrece detección neuronal entrenada específicamente para código y peticiones de asistentes de IA, con soporte nativo de texto mixto chino-inglés. No se han publicado benchmarks comparativos directos con alternativas en la información disponible.

## Limitaciones y advertencias

- Cambio de comportamiento en 0.1.2: `private_date` ya no marca fechas técnicas (timestamps, logs, cabeceras, builds). Si tu integración espera enmascarar toda fecha, usa la revisión `v0.1.1` o añade una regla propia.
- Menor cobertura de fechas personales: la 0.1.2 detecta en torno al 82 % de las fechas personales (frente al 98 % de la 0.1.1), fallando sobre todo en fechas de documentos y citas médicas.
- No es infalible con credenciales: deja sin enmascarar completamente unas 51 de 2.158 credenciales con INT8; conviene combinarlo con reglas deterministas (regex) para patrones conocidos.
- Falsos positivos residuales: alrededor del 10 % de peticiones sin datos sensibles aún reciben alguna detección; ajusta el umbral mínimo de puntuación (recomendado 0,8) según tu tolerancia.
- Idiomas limitados: solo chino e inglés; no hay soporte publicado para otros idiomas.
- La variante FP16 tiene entrada fija de 1 × 512 tokens, lo que puede requerir lógica de ventana propia en GPU.
- Licencia Apache-2.0: sin restricciones para uso comercial, pero no incluye garantía; para casos de cumplimiento normativo se recomienda validación propia sobre datos reales.
- Documentación de entrenamiento (datos, tokens, método) no disponible públicamente, lo que dificulta evaluar sesgos sistemáticos más allá de los benchmarks publicados por el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/QuantumNous/astrlink-guard
- Modelo base: https://huggingface.co/microsoft/Multilingual-MiniLM-L12-H384
- No se han encontrado enlaces a papers, repositorios de código adicionales ni demos en la información disponible.
