# ShinePixelOrg/translategemma-27b-it-NVFP4

## Resumen

TranslateGemma 27B IT NVFP4 es una cuantización en NVFP4 del modelo `google/translategemma-27b-it`, la variante de mayor tamaño de la familia TranslateGemma de Google, publicada por el usuario ShinePixelOrg. TranslateGemma es una suite de modelos de traducción abiertos construidos sobre Gemma 3, disponibles en tamaños de 4B, 12B y 27B, que cubren 55 idiomas y conservan las capacidades multimodales del modelo base (entrada de imagen y texto). Este repositorio concreto aplica una cuantización de 4 bits en formato NVFP4 mediante la librería `compressed-tensors`, reduciendo el peso del repositorio a 18,1 GB.

El modelo resuelve el problema de la traducción automática multilingüe de alta calidad con despliegue local, manteniendo la naturaleza multimodal de Gemma 3 para traducir también texto presente en imágenes. Su relevancia radica en que, según Google, el modelo de 12B de la familia supera al Gemma 3 27B de referencia en calidad de traducción con menos de la mitad de parámetros, lo que sitúa a esta variante de 27B en la parte alta de la gama en cuanto a calidad.

El repositorio tiene acceso restringido (gated) y requiere aceptar las condiciones de uso en Hugging Face. Cuenta con muy poca tracción en la plataforma (4 descargas, 0 likes en el momento de la consulta) y los metadatos de idiomas no están disponibles en la ficha. El número de parámetros declarado en safetensors es de 16.233.124.308, inferior al que sugiere el nombre comercial "27b", lo que conviene tener en cuenta al planificar el despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basada en Gemma 3 (image-text-to-text) |
| Parametros totales | 16.233.124.308 (según safetensors); el nombre comercial indica 27B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits, `compressed-tensors`); el modelo base admite otras cuantizaciones no detalladas |
| Idiomas soportados | 55 idiomas según la familia TranslateGemma; lista concreta no disponible en la ficha |
| Licencia | Gemma (licencia de Google) |
| Formato de pesos | safetensors (cuantización NVFP4 con `compressed-tensors`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 3, un transformer multimodal que acepta entradas de imagen y texto y genera texto. TranslateGemma se construye sobre esta base y se especializa en traducción; según el blog de Google, la familia conserva las capacidades multimodales de Gemma 3 y permite traducir texto contenido en imágenes además de texto plano. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO específicas para la variante de traducción.

La innovación principal de este repositorio concreto no está en el entrenamiento, sino en la cuantización: se aplica NVFP4 (formato de coma flotante de 4 bits de NVIDIA) mediante `compressed-tensors`, lo que reduce el tamaño de los pesos a 18,1 GB. No se detallan en la información disponible la decodificación especulativa, mecanismos de atención lineal ni otras optimizaciones de inferencia específicas de esta variante.

## Capacidades

- Traducción automática entre 55 idiomas, según la documentación de la familia TranslateGemma.
- Traducción de texto presente en imágenes (image-text-to-text), gracias a la base multimodal Gemma 3.
- Generación de texto conversacional (etiqueta `conversational`).
- Compatibilidad con Text Generation Inference (TGI) y con endpoints compatibles.
- Integración con `transformers`.
- No se dispone de información sobre soporte de tool calling, function calling, agentes o modos de razonamiento extendido en la información proporcionada.

## Casos de uso

- Traducción de documentación técnica multilingüe: el modelo puede procesar texto largo y traducirlo entre los 55 idiomas soportados, integrándose en pipelines de localización mediante `transformers` o TGI.
- Localización de interfaces y contenido web: adecuado para traducir cadenas de texto y contenido de producto en lotes, aprovechando la cuantización NVFP4 para reducir los requisitos de memoria frente al modelo en precisión completa.
- Traducción de texto en imágenes (OCR implícito): al ser un modelo image-text-to-text, puede recibir capturas, carteles o documentos escaneados y devolver la traducción del texto contenido, útil en digitalización de archivos y atención al ciudadano.
- Atención al cliente multilingüe: el modelo puede traducir mensajes entrantes y salientes en conversaciones multi-turno, con la etiqueta `conversational` que respalda este uso.
- Investigación en traducción automática: sirve como punto de comparación cuantizado de la familia TranslateGemma para experimentos de evaluación de calidad por idioma y por dominio.
- Despliegue en infraestructura con GPU de memoria limitada: la versión NVFP4 permite servir un modelo de la gama de 27B en hardware donde la versión en BF16 no cabría, según el tamaño de repositorio de 18,1 GB.
- Traducción de subtítulos y transcripciones: el modelo puede procesar segmentos de texto y devolver traducciones, integrándose en flujos de postproducción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este repositorio cuantizado. El blog de Google indica cualitativamente que el modelo TranslateGemma de 12B supera al Gemma 3 27B de referencia en calidad de traducción con menos de la mitad de parámetros, pero no se proporcionan cifras concretas (BLEU, COMET, MMLU u otras) en la información consultada.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 18,1 GB en NVFP4, por lo que se necesita al menos esa cantidad de VRAM más el espacio para el contexto y las activaciones; una estimación conservadora sitúa el mínimo práctico en torno a 24 GB.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, encajan GPU de 24 GB o más (RTX 4090, L40S, A100 40/80 GB, H100).
- ¿Cabe en GPU de consumo? Sí, previsiblemente en una RTX 4090 (24 GB) o modelos con 24 GB o más, siempre que el runtime soporte NVFP4.
- Opciones de despliegue: `transformers`, Text Generation Inference (TGI) y endpoints compatibles; FriendliAI ofrece un endpoint de inferencia para este modelo. No se confirma soporte de llama.cpp, Ollama u otros runtimes en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ShinePixelOrg/translategemma-27b-it-NVFP4 (este) | 16,2B (safetensors) | no disponible | 55 (familia) | Gemma | safetensors NVFP4 |
| google/translategemma-27b-it | no disponible | no disponible | 55 (familia) | Gemma | safetensors |
| TranslateGemma 12B | 12B (aprox.) | no disponible | 55 (familia) | Gemma | no disponible |
| TranslateGemma 4B | 4B (aprox.) | no disponible | 55 (familia) | Gemma | no disponible |

La comparativa se limita a la propia familia porque la información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de otros proveedores.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar las condiciones en Hugging Face antes de descargarlo.
- Licencia Gemma: el uso comercial está sujeto a los términos de la licencia de Google, que impone restricciones y obligaciones específicas; conviene revisarla antes de un despliegue en producción.
- La cuantización NVFP4 puede degradar la calidad de traducción respecto al modelo base en BF16; no se han publicado evaluaciones que cuantifiquen esa pérdida.
- El número de parámetros en safetensors (16,2B) no coincide con el "27b" del nombre; verificar el comportamiento real del modelo antes de dimensionar la infraestructura.
- Los metadatos de idiomas no están disponibles en la ficha, aunque la familia declara 55 idiomas; la cobertura real por idioma no está verificada en este repositorio.
- No hay información sobre sesgos, riesgo de alucinación ni limitaciones de contexto específicas de esta variante.
- El repositorio tiene muy poca tracción (4 descargas, 0 likes) y fue creado en 2026-11-03; no hay evidencia de validación por parte de la comunidad.
- El soporte de NVFP4 depende del runtime y del hardware; no todos los entornos de inferencia lo admiten.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ShinePixelOrg/translategemma-27b-it-NVFP4
- Modelo base: https://huggingface.co/google/translategemma-27b-it
- Blog de Google sobre TranslateGemma: https://blog.google/innovation-and-ai/technology/developers-tools/translategemma/
- Ficha en free2aitools: https://free2aitools.com/model/shinepixelorg/translategemma-27b-it-nvfp4
- Endpoint en FriendliAI: https://friendli.ai/models/ShinePixelOrg/translategemma-27b-it-NVFP4
- Paper referenciado en los tags (arxiv:2601.09012): https://arxiv.org/abs/2601.09012
- Paper referenciado en el modelo base (arxiv:2503.19786): https://arxiv.org/abs/2503.19786
