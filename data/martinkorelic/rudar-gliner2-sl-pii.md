# martinkorelic/rudar-gliner2-sl-pii

## Resumen

`rudar-gliner2-sl-pii` es un modelo de extracción de información especializado en la detección y anonimización de datos personales (PII) en esloveno. Lo desarrolla martinkorelic como parte de la familia Rudar, un conjunto de modelos de extracción de información para esloveno construidos sobre GLiNER2. El modelo resuelve un problema concreto: identificar 21 tipos de datos personales —desde nombres y direcciones hasta EMŠO, números fiscales e IBAN— en texto esloveno y sustituirlos por máscaras en una sola llamada.

El modelo parte de `martinkorelic/rudar-gliner2-sl-base` y cuenta con aproximadamente 307 millones de parámetros (1,2 GB en safetensors). Está diseñado específicamente para tratar la morfología flexiva del esloveno: nombres y lugares declinados (*Marku Novaku*, *v Mariboru*) se etiquetan como la palabra flexionada completa, algo que los modelos multilingües genéricos suelen fallar.

Su relevancia actual radica en que cubre un hueco práctico para el cumplimiento de normativa de privacidad (RGPD) en pipelines de tratamiento de texto esloveno, con una licencia Apache 2.0 permisiva y una interfaz de pipeline que gestiona automáticamente el casing original, la ventana de documentos largos y la resolución de solapamientos de spans.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER2 (extractor de entidades; transformer con custom_code) |
| Parametros totales | 307.098.645 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | esloveno (`sl`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 1,2 GB) |

## Arquitectura y entrenamiento

El modelo se basa en GLiNER2, una arquitectura de extracción de entidades de tipo zero-shot que combina un encoder transformer con prompts de etiquetas en lenguaje natural. En este caso, cada uno de los 21 tipos de PII lleva asociado un prompt en esloveno (por ejemplo, `osebno ime` para `NAME_GIVEN`, `priimek` para `NAME_FAMILY`, `številka bančnega računa` para `BANK_ACCOUNT`), lo que permite al modelo localizar los spans correspondientes sin una cabeza de clasificación fija por etiqueta. El modelo se ha afinado a partir de `martinkorelic/rudar-gliner2-sl-base`, que actúa como base de la familia Rudar para esloveno.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card indica que el benchmark de evaluación cubre texto periodístico y web, registros sintéticos y diálogo de atención al cliente, lo que sugiere una mezcla de dominios en el desarrollo. Una innovación destacable es el tratamiento de la flexión: el pipeline etiqueta la palabra flexionada completa en lugar de truncar la raíz, y el pipeline oficial preserva el casing original, aplica ventanas sobre documentos largos y resuelve spans solapados, aspectos que la carga directa con `GLiNER2.from_pretrained` no garantiza (esta última opera sobre texto en minúsculas y ofrece menor calidad).

## Capacidades

- Detección de 21 tipos de PII en texto esloveno: nombres de pila, apellidos, nombres de usuario, fechas de nacimiento, fechas, direcciones, códigos postales, ciudades, otras localizaciones, organizaciones, productos y servicios, números de identidad nacional (EMŠO), secretos (contraseñas, PIN, números fiscales), cuentas bancarias (IBAN), tarjetas de crédito, direcciones IP y MAC, correos electrónicos, teléfonos, URLs, identificadores internos y datos sensibles diversos.
- Anonimización en una sola llamada: devuelve el texto con cada span sustituido por una máscara configurable.
- Etiquetado de palabras flexionadas completas, adaptado a la morfología del esloveno.
- Filtrado por subconjunto de etiquetas mediante el argumento `labels`.
- Umbral de confianza configurable (`threshold`, por defecto 0,55).
- Procesamiento por lotes de varios textos y ejecución en GPU (`device=0`).
- Salida compatible con el pipeline `token-classification` de transformers con agregación, incluyendo offsets de caracteres (`start`/`end`).
- Máscaras personalizadas con plantillas (`{tag}` y `{word}`) o cadenas literales.

## Casos de uso

- Anonimización previa a almacenamiento o envío a terceros: el modelo permite redactar nombres, EMŠO, IBAN y correos de documentos eslovenos antes de persistirlos o compartirlos con proveedores, reduciendo la exposición de datos personales en cumplimiento del RGPD.
- Cumplimiento normativo en atención al cliente: integrado en el procesado de transcripciones o correos, permite enmascarar automáticamente los datos personales de los clientes antes de que el texto llegue a sistemas de analítica o a modelos externos.
- Preprocesado para entrenamiento de modelos: al eliminar PII de corpus eslovenos, facilita la construcción de datasets de entrenamiento con menor riesgo legal y de memorización de datos personales.
- Enmascarado selectivo en pipelines de logging: con `labels=["EMAIL_ADDRESS", "PHONE_NUMBER"]` se pueden redactar solo los tipos críticos en registros de aplicación, manteniendo el resto del texto intacto para depuración.
- Anonimización de registros sintéticos y datos de prueba: útil para generar conjuntos de datos de prueba realistas pero sin datos personales reales, usando máscaras personalizadas que preserven la estructura del texto.
- Detección de datos sensibles en documentos largos: el pipeline aplica ventanas automáticamente sobre documentos extensos, lo que permite procesar contratos, expedientes o informes sin dividirlos manualmente.
- Integración en flujos de extracción de entidades: la salida con offsets de caracteres permite encadenar la detección de PII con otras tareas de NLP (resumen, clasificación, búsqueda) sobre el texto ya anonimizado.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index, sobre las 1.000 instancias del conjunto de test del Slovene PII Anonymization Benchmark (Jakovchevski & Martinc, CLEF 2026), que incluye texto periodístico y web, registros sintéticos y diálogo de atención al cliente. Los valores no están verificados de forma independiente (`verified: false`).

| Metrica | Valor |
|---|---|
| Tag F1 | 89,08 |
| Tag precision | 91,1 |
| Tag recall | 87,2 |
| Masking F1 (cualquier etiqueta) | 93,2 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 307 millones de parámetros, en fp32 el modelo ocupa aproximadamente 1,2 GB de pesos, y en fp16/bf16 alrededor de 0,6 GB, a lo que hay que sumar el overhead del runtime.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, el modelo es apto para GPUs de consumo, aunque no se especifican modelos concretos.
- Cabe en GPU de consumo: sí, por el tamaño de pesos (inferencia en fp16/bf16 en torno a 0,6 GB más overhead), aunque no hay confirmación oficial de modelos concretos.
- Opciones de despliegue: pipeline de `transformers` con `trust_remote_code=True` (método recomendado por el autor), con dependencias `gliner2==2.0.0`, `peft`, `transformers>=4.57,<5` y `torch` (probado con torch 2.3–2.14). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Nota de seguridad: el pipeline ejecuta dos archivos del repositorio (`modeling_rudar.py` y `pipeline_rudar.py`); el autor recomienda fijar un commit con `revision="<commit hash>"` para mantener el código fijo.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo pertenece a la familia Rudar de extracción de información para esloveno, pero no se detallan otros miembros ni alternativas de la misma categoría (detección de PII en esloveno) con parámetros, contexto, rendimiento o licencia comparables.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rudar-gliner2-sl-pii | 307.098.645 | no disponible | Tag F1 89,08; Masking F1 93,2 | Apache 2.0 | Hugging Face |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo soporta esloveno (`sl`); no está entrenado ni validado para otros idiomas.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false`).
- No se dispone de información sobre sesgos conocidos ni sobre el riesgo de alucinación en la documentación proporcionada.
- El uso correcto requiere el pipeline oficial con `trust_remote_code=True`; cargar los pesos con `GLiNER2.from_pretrained` directamente opera sobre texto en minúsculas y degrada la calidad.
- El pipeline ejecuta código remoto del repositorio; para producción conviene fijar un commit con `revision` para evitar cambios no controlados.
- La licencia Apache 2.0 permite uso comercial, pero no se detallan restricciones adicionales ni condiciones específicas más allá de las de dicha licencia.
- No se especifican la longitud de contexto soportada ni los tipos de cuantización disponibles, lo que limita la planificación de despliegues con requisitos estrictos de memoria o de documentos muy largos.
- La detección de PII es probabilística: con un recall de 87,2 en el benchmark, existe un porcentaje de datos personales no detectados, por lo que no debe usarse como única barrera en flujos de cumplimiento estricto sin revisión adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/martinkorelic/rudar-gliner2-sl-pii
- Modelo base: https://huggingface.co/martinkorelic/rudar-gliner2-sl-base
- Demo (Space): https://huggingface.co/spaces/martinkorelic/rudar-gliner2-sl
- Slovene PII Anonymization Benchmark: https://github.com/Nan0NJ/slovene_pii_anonymization_benchmark
