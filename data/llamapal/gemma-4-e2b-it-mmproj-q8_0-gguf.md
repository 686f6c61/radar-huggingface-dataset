# LlamaPal/gemma-4-E2B-it-mmproj-Q8_0-GGUF

## Resumen

Este repositorio no contiene un modelo de lenguaje completo, sino el complemento de proyección multimodal (mmproj) para el modelo Gemma 4 E2B de Google, empaquetado en formato GGUF con cuantización Q8_0. El archivo `mmproj-gemma-4-E2B-it-Q8_0.gguf` (557 MB) es lo que permite a llama.cpp procesar imágenes de entrada y pasarlas al modelo de lenguaje subyacente, habilitando así la capacidad de visión en un modelo que de otro modo sería solo de texto. El autor, LlamaPal, lo distribuye como espejo sin modificaciones del archivo original publicado por ggml-org.

La relevancia de esta ficha radica en su carácter práctico: es una pieza de infraestructura para ejecutar Gemma 4 E2B con visión en dispositivos Android de forma totalmente offline, sin cuenta ni conexión a internet, dentro de la aplicación LlamaPal. El modelo base declarado, `google/gemma-4-E2B-it`, es la variante instruida de la familia Gemma 4 con activación eficiente (E2B sugiere un diseño de parámetros activos reducidos), orientada a inferencia en el borde.

Conviene subrayar que los metadatos del repositorio indican 475.729.088 parámetros en los tensores safetensors del modelo base asociado, y que el pipeline declarado es `any-to-any`, coherente con un sistema multimodal. La licencia es Apache 2.0 y el tamaño total del repositorio es de 0,6 GB, dominado casi por completo por el archivo mmproj.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyector multimodal (mmproj) para modelo base transformer; arquitectura interna del proyector no disponible |
| Parametros totales | 475.729.088 (modelo base asociado, segun safetensors); el archivo mmproj no declara recuento propio |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (unico archivo publicado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`mmproj-gemma-4-E2B-it-Q8_0.gguf`) |

## Arquitectura y entrenamiento

El archivo es un proyector multimodal en formato GGUF que se acopla al modelo de lenguaje Gemma 4 E2B-it mediante el parámetro `--mmproj` de llama.cpp. Su función es transformar las representaciones visuales extraídas por un codificador de imagen en embeddings compatibles con el espacio del transformer de texto, de modo que el modelo pueda condicionar su generación sobre el contenido de una imagen. El repositorio no documenta la arquitectura interna del proyector (número de capas, dimensión de proyección, tipo de codificador visual) ni los datos de entrenamiento empleados para alinearlo.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset multimodal ni si se aplicaron técnicas de RLHF o DPO en el modelo base. El autor indica explícitamente que se trata de una copia sin modificar del archivo original de `ggml-org/gemma-4-E2B-it-GGUF` en el commit `6938c58e6985`, con el mismo hash SHA-256 (`9406f99c16d68cda4f1f0552192dcc99021ea1fc6d2fd50b1dc3ccf30d04b292`), por lo que cualquier detalle de entrenamiento debe consultarse en la model card del repositorio original.

## Capacidades

- Procesamiento de imágenes de entrada en combinación con el modelo de lenguaje Gemma 4 E2B-it, habilitando respuestas condicionadas visualmente.
- Integración con llama.cpp mediante el flag `--mmproj`, lo que permite su uso en cualquier frontend compatible con GGUF multimodal.
- Ejecución en dispositivo (on-device) en Android a través de la aplicación LlamaPal, sin conexión a internet ni cuenta de usuario.
- Funcionamiento offline: ningún dato introducido por el usuario abandona el dispositivo según la model card.
- Capacidad any-to-any declarada en el pipeline del repositorio, aunque las modalidades concretas de salida no se detallan.
- Soporte de tool calling, agentes, razonamiento multi-paso o modo thinking: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Descripción de imágenes offline en Android: el usuario carga una fotografía en LlamaPal y el modelo genera una descripción textual sin enviar la imagen a ningún servidor, adecuado para entornos con requisitos de privacidad estrictos.
- Asistencia visual en campo sin conectividad: técnicos que trabajan en zonas sin cobertura pueden fotografiar equipos o etiquetas y obtener interpretación textual local usando el par modelo + mmproj.
- Accesibilidad para personas con discapacidad visual: la combinación permite leer en voz alta el contenido de imágenes capturadas con la cámara del teléfono, siempre que el frontend añada síntesis de voz.
- Digitalización de documentos y tickets: extracción de información de recibos o carteles mediante el modelo de visión y posterior formateo por el modelo de lenguaje, todo en local.
- Automatización de flujos de trabajo en llama.cpp de escritorio: uso del archivo como `--mmproj` en pipelines de procesamiento por lotes de imágenes con requisitos de soberanía de datos.
- Prototipado de aplicaciones móviles multimodales: desarrolladores que integren llama.cpp en Android pueden reutilizar este proyector para validar casos de uso de visión antes de entrenar o adoptar soluciones propias.
- Verificación de integridad en despliegues: el hash SHA-256 publicado permite validar que el archivo desplegado coincide byte a byte con el original de ggml-org.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El archivo mmproj ocupa 557 MB en disco; debe cargarse junto al modelo de lenguaje Gemma 4 E2B-it, cuyo peso adicional no se detalla en este repositorio.
- VRAM estimada para el proyector: aproximadamente 0,6 GB en Q8_0, a sumar al consumo del modelo de lenguaje y del contexto KV.
- GPU recomendadas: no disponible. El caso de uso declarado es Android on-device, por lo que se asume ejecución en CPU/GPU integrada de teléfono.
- Compatibilidad con GPU de consumo (RTX 4090, etc.): no verificada en la información proporcionada; el diseño apunta a hardware móvil.
- Opciones de despliegue: llama.cpp (flag `--mmproj`), aplicación LlamaPal para Android. Compatibilidad con vLLM, TGI u Ollama no disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| Este repositorio (mmproj Gemma 4 E2B-it Q8_0) | no disponible (proyector); base 475,7 M | no disponible | Si (proyector) | Apache 2.0 | GGUF |
| ggml-org/gemma-4-E2B-it-GGUF (original) | mismo modelo base | no disponible | Si (incluye mmproj) | Apache 2.0 | GGUF |
| google/gemma-4-E2B-it (modelo base) | 475,7 M | no disponible | Si | Apache 2.0 | safetensors |

La comparativa se limita al ecosistema Gemma 4 E2B porque la información disponible no permite identificar alternativas de otros fabricantes con especificaciones verificables. La diferencia entre este repositorio y el de ggml-org es únicamente de empaquetado: aquí se aísla el archivo mmproj, mientras que el original lo distribuye junto al modelo completo.

## Limitaciones y advertencias

- Este repositorio no es utilizable por sí solo: requiere el modelo de lenguaje Gemma 4 E2B-it en GGUF para funcionar.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluaciones de robustez del proyector multimodal.
- La cobertura de idiomas no está declarada; no puede asumirse un rendimiento multilingüe uniforme.
- El pipeline declarado es any-to-any, pero las modalidades de salida reales no se especifican en la model card.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse en el repositorio original de ggml-org cualquier término adicional del modelo base de Google.
- El autor no ofrece garantías: es un espejo sin modificaciones y toda la responsabilidad técnica recae en los autores originales.
- Al ser una cuantización Q8_0, existe una pérdida de precisión frente a los pesos originales en safetensors, aunque en esta magnitud suele ser marginal.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción.
- No hay información sobre latencia, consumo energético ni comportamiento térmico en dispositivos Android concretos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/LlamaPal/gemma-4-E2B-it-mmproj-Q8_0-GGUF
- Repositorio original del archivo: https://huggingface.co/ggml-org/gemma-4-E2B-it-GGUF
- Commit exacto del archivo espejo: https://huggingface.co/ggml-org/gemma-4-E2B-it-GGUF/tree/6938c58e698502037401a5f19f6905f2fb2f7dee
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Aplicación LlamaPal en Google Play: https://play.google.com/store/apps/details?id=com.vishistv.llamapal
- Sitio web de LlamaPal: https://llamapal.cc/
- Instagram de LlamaPal: https://www.instagram.com/llamapalhq/
