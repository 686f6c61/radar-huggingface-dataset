# desert-ant-labs/redact

## Resumen

Redact es un modelo de clasificación de tokens (token classification) especializado en la detección y el enmascaramiento de datos personales identificables (PII) que se ejecuta íntegramente en el dispositivo. Lo desarrolla Desert Ant Labs y se distribuye a través de Hugging Face con un SDK propio disponible para Swift, Kotlin y JavaScript. El modelo sustituye cada entidad sensible por un marcador de posición (por ejemplo, `[GIVEN_NAME_1]` o `[EMAIL_1]`), de modo que el texto redactado puede enviarse a un LLM externo y, una vez recibida la respuesta, restaurar los valores originales en el cliente.

La arquitectura es un transformer tipo BERT de aproximadamente 23 millones de parámetros, exportado a LiteRT (TFLite) para Android, Linux, Windows, Node y navegador, y a Core ML de 4 bits para plataformas Apple. El peso del artefacto es de 11,6 MB en Core ML y 24,5 MB en LiteRT int8, lo que lo hace apto para inferencia local sin GPU dedicada. Cubre 27 idiomas europeos y detecta 20 etiquetas de PII, combinando una capa de clasificación neuronal con una capa de patrones para identificadores estructurados.

Su relevancia actual radica en la combinación de tres factores: despliegue on-device sin dependencia de servicios en la nube, cobertura multilingüe amplia y una precisión declarada por el autor del 99,6 % con un recall del 88,8 %, muy por encima de alternativas de mayor tamaño como GLiNER-PII (570M parámetros) o el filtro de privacidad de OpenAI (1,5B parámetros).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (token classification) con capa de patrones auxiliar |
| Parámetros totales | 23M (según la model card) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventanas de 256 tokens con solapamiento de 64 tokens |
| Tipos de cuantización | 4 bits (Core ML), int8 (LiteRT) |
| Idiomas soportados | 27: bg, cs, da, de, el, en, es, et, fi, fr, ga, hr, hu, is, it, lt, lv, mt, nb, nl, nn, pl, pt, ro, sk, sl, sv |
| Licencia | desert-ant-labs-source-available (source-available, no open source) |
| Formato de pesos | LiteRT/TFLite, Core ML |
| Plataformas | iOS, macOS, tvOS, visionOS, Android, Linux, Windows, navegador, Node |
| Tamaño del repositorio | 0,2 GB |
| Pipeline | token-classification |

## Arquitectura y entrenamiento

El modelo es un transformer codificador de tipo BERT con 23 millones de parámetros, ajustado para la tarea de etiquetado de tokens (token classification). La inferencia se organiza en ventanas de 256 tokens con un solapamiento de 64 tokens, de forma que una entidad situada en el borde de una ventana se reconstruye completa. Sobre la salida del clasificador se aplica una capa de patrones determinista que captura identificadores estructurados (correos, tarjetas, IBAN, IP, URL) y que siempre se ejecuta, independientemente del umbral de confianza del modelo. El umbral por defecto del SDK es 0,6: las detecciones neuronales por debajo de ese valor se descartan.

La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; esa información no está disponible. La evaluación publicada por el autor promedia el recall sobre WikiANN, MultiNERD y un conjunto de PII estructurada con formato válido. El modelo se distribuye cuantizado (4 bits en Core ML, int8 en LiteRT) y el SDK descarga los pesos desde Hugging Face en el primer uso, con opción de precarga y empaquetado junto a la aplicación.

## Capacidades

- Detección de 20 etiquetas de PII: `GIVEN_NAME`, `SURNAME`, `STREET_NAME`, `BUILDING_NUMBER`, `SECONDARY_ADDRESS`, `CITY`, `STATE`, `ZIP_CODE`, `EMAIL`, `PHONE`, `CREDIT_CARD`, `BANK_ACCOUNT`, `ROUTING_NUMBER`, `IP_ADDRESS`, `URL`, `GOVERNMENT_ID`, `PASSPORT`, `DRIVERS_LICENSE`, `TAX_ID`, `SSN`.
- Detección de organizaciones (`ORG`) para evitar que nombres de empresa se etiqueten erróneamente como apellidos; no se redacta por defecto salvo que se solicite explícitamente.
- Detección de `IMEI` mediante comprobación de patrón: número de 15 dígitos que supera el checksum de Luhn y aparece a menos de 32 caracteres de la palabra "IMEI".
- Enmascaramiento con marcadores de posición numerados y restauración posterior de los valores originales en la respuesta de un LLM (`restore`).
- Filtrado por categoría de etiqueta y ajuste del umbral mínimo de confianza (`minimumConfidence`).
- Procesamiento multilingüe en 27 idiomas europeos dentro del mismo modelo.
- Ejecución on-device en iOS, macOS, tvOS, visionOS, Android, Linux, Windows, navegador y Node.
- No soporta generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni comportamiento de agente: es exclusivamente un clasificador de tokens.

## Casos de uso

- Enmascaramiento previo al envío a un LLM en la nube: el SDK redacta nombres, correos e identificadores antes de que el texto salga del dispositivo y restaura los valores originales en la respuesta, lo que permite usar modelos externos sin exponer PII.
- Cumplimiento de RGPD en aplicaciones móviles: integración en apps iOS y Android para filtrar datos personales en formularios, notas o chats antes de persistirlos o sincronizarlos con un backend.
- Registro y telemetría: limpieza de logs de aplicación en el propio dispositivo o servidor Node antes de enviarlos a un sistema centralizado de observabilidad.
- Atención al cliente asistida: redacción de transcripciones de conversaciones antes de pasarlas a un sistema de análisis o a un modelo generativo, preservando la posibilidad de reconstruir los datos en el entorno autorizado.
- Procesamiento de documentos en el navegador: la demo pública y el paquete `@desert-ant-labs/redact` con LiteRT permiten redactar texto en el cliente sin backend, útil para herramientas internas de RR. HH. o legal.
- Anonimización de datasets para investigación: filtrado por lotes de corpus multilingües (27 idiomas) antes de compartirlos con terceros o publicarlos.
- Preprocesado en pipelines de CI/CD: uso desde Node para sanear fixtures y datos de prueba que contienen PII antes de commitearlos al repositorio.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card, evaluados con el mismo código de puntuación sobre las mismas filas y cada sistema en su propio punto de operación:

| Sistema | Recall | Precision | Tamaño | Parámetros |
|---|---:|---:|---:|---:|
| redact | 88,8 | 99,6 | 11,6 MB | 23M |
| GLiNER-PII | 91,1 | 90,4 | 2,3 GB | 570M |
| Rampart | 61,4 | 97,2 | 14,7 MB | 18,5M |
| OpenAI privacy filter | 60,2 | 93,5 | 3 GB | 1,5B |

El recall se define como la proporción de datos personales enmascarados por completo (sin fuga parcial) y se promedia de forma macro sobre WikiANN, MultiNERD y un conjunto de PII estructurada con formato válido. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque el modelo no es generativo.

## Requisitos de hardware

- VRAM: no requiere GPU; está diseñado para inferencia en CPU (dispositivo móvil, navegador o servidor sin acelerador).
- Huella de memoria: 11,6 MB de pesos en Core ML 4 bits; 24,5 MB en LiteRT int8.
- GPU recomendadas: no aplica; no se documenta aceleración por GPU.
- Cabe en cualquier dispositivo consumer: iPhone, iPad, Mac, Apple TV, Apple Vision Pro, móviles y tablets Android, PC de escritorio, navegador y Node.
- Despliegue: SDK oficial para Swift (Swift Package Manager), Kotlin (BOM `ai.desertant:bom:6.0.0`) y JavaScript (`@desert-ant-labs/redact` con `@litertjs/core` en navegador y núcleo nativo precompilado en Node). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo generativo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Tamaño | Recall | Precision | Licencia | Despliegue |
|---|---|---:|---:|---:|---|---|
| redact | 23M | 11,6 MB | 88,8 | 99,6 | source-available | On-device (Core ML, LiteRT) |
| GLiNER-PII | 570M | 2,3 GB | 91,1 | 90,4 | no disponible | Servidor / GPU |
| Rampart | 18,5M | 14,7 MB | 61,4 | 97,2 | no disponible | No disponible |
| OpenAI privacy filter | 1,5B | 3 GB | 60,2 | 93,5 | no disponible | Servidor / API |

Redact ofrece el mejor equilibrio entre precisión y tamaño del conjunto comparado: supera en precisión a GLiNER-PII con 25 veces menos parámetros y un artefacto 200 veces menor, a costa de 2,3 puntos de recall. Frente a Rampart y al filtro de OpenAI, la ventaja en recall es de más de 27 y 28 puntos respectivamente.

## Limitaciones y advertencias

- Licencia source-available (`desert-ant-labs-source-available`), no open source: es imprescindible revisar los términos en https://license.desertant.com/ antes de cualquier uso comercial o redistribución.
- Recall del 88,8 %: aproximadamente uno de cada nueve datos personales puede no enmascararse por completo, por lo que no debe usarse como única barrera en entornos con requisitos estrictos de cumplimiento.
- El umbral de confianza por defecto (0,6) descarta detecciones de baja confianza; subirlo reduce falsos positivos pero también recall.
- La detección de organizaciones (`ORG`) está desactivada por defecto para la redacción, lo que puede dejar nombres de empresa en el texto.
- La cobertura lingüística se limita a 27 idiomas europeos; no hay soporte documentado para otras familias lingüísticas.
- El procesamiento por ventanas de 256 tokens con solapamiento de 64 puede perder entidades que crucen los límites en casos extremos, aunque el solapamiento mitiga el problema.
- No se documentan sesgos específicos ni tasas de alucinación (no es un modelo generativo), pero al ser un clasificador puede presentar diferencias de rendimiento entre idiomas e infrarepresentación de nombres de determinadas regiones.
- La capa de patrones para datos estructurados siempre se aplica, lo que puede generar falsos positivos en cadenas numéricas que coincidan con formatos de tarjeta o IBAN.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/desert-ant-labs/redact
- Pesos v0.4.2: https://huggingface.co/desert-ant-labs/redact/tree/v0.4.2
- Demo interactiva: https://huggingface.co/spaces/desert-ant-labs/redact-demo
- Página del producto y demo: https://desertant.com/models/redact/
- Repositorio del SDK: https://github.com/Desert-Ant-Labs/desert-ant-core
- Licencia: https://license.desertant.com/
- Requisitos Swift: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#swift
- Requisitos Android: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#android
- Requisitos JavaScript/TypeScript: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#javascript-and-typescript
- Descarga y caché de pesos: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#model-downloads-and-caching
