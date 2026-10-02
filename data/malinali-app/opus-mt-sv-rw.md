# malinali-app/opus-mt-sv-rw

## Resumen

`malinali-app/opus-mt-sv-rw` es un paquete de pesos de traducción automática neuronal para el par de idiomas sueco (sv) → kinyarwanda (rw), publicado por el desarrollador `malinali-app` como artefacto de despliegue para la aplicación Malinali. No se trata de un modelo entrenado desde cero: es un reempaquetado de `Helsinki-NLP/opus-mt-sv-rw`, el modelo de la familia OPUS-MT desarrollada por el grupo Helsinki-NLP (Universidad de Helsinki), cuyos pesos se redistribuyen en formato `safetensors` junto con tokenizadores rápidos convertidos de SentencePiece a JSON para su uso con Candle a través del componente `marian_flutter`.

El modelo tiene 75.859.340 parámetros (unos 75,9 millones) y emplea la arquitectura Marian, un transformer encoder-decoder estándar para traducción. El repositorio ocupa 0,3 GB y contiene únicamente cuatro ficheros: `config.json`, `model.safetensors`, `tokenizer-enc.json` (tokenizador de origen, sueco) y `tokenizer-dec.json` (tokenizador de destino, kinyarwanda). La direccionalidad es estrictamente sv → rw.

Su relevancia es de nicho pero concreta: permite traducción sueco-kinyarwanda completamente en el dispositivo (on-device) dentro de aplicaciones Flutter, sin depender de APIs en la nube ni de conectividad, algo poco habitual para un par de idiomas de bajos recursos como el kinyarwanda. El interés práctico está en el contexto de la comunidad ruandesa residente en Suecia y en flujos de trabajo humanitarios, más que en el rendimiento bruto de traducción. El repositorio no declara licencia propia y remite a la del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder para traduccion automatica) |
| Parametros totales | 75.859.340 (aproximadamente 75,9 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no se documenta en la model card ni en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors sin versiones cuantizadas declaradas |
| Idiomas soportados | sueco (sv) como origen, kinyarwanda (rw) como destino |
| Licencia | no disponible en el repositorio; la model card remite a la licencia del modelo original (Helsinki-NLP/opus-mt-sv-rw, habitualmente CC-BY 4.0 para OPUS-MT, sin confirmar) |
| Formato de pesos | safetensors (model.safetensors) |
| Tamano del repositorio | 0,3 GB |
| Pipeline declarado | translation |
| Libreria | transformers (con soporte adicional para Candle) |
| Modelo base | Helsinki-NLP/opus-mt-sv-rw |
| Tokenizadores | dos tokenizadores rapidos en JSON: tokenizer-enc.json (origen) y tokenizer-dec.json (destino) |
| Direccionalidad | sv -> rw (unidireccional) |
| Fecha de publicacion | 2026-10-02 |

## Arquitectura y entrenamiento

La arquitectura es Marian, un transformer secuencial encoder-decoder con atención multi-cabeza, diseñado específicamente para traducción automática y utilizado de forma masiva en la familia OPUS-MT. El bloque encoder procesa la secuencia en sueco y el decoder genera la secuencia en kinyarwanda de forma autorregresiva. No hay componentes MoE, SSM ni mecanismos híbridos: es un transformer denso convencional de aproximadamente 75,9 millones de parámetros, un tamaño deliberadamente compacto que permite ejecución en CPU y en dispositivos móviles.

Los detalles de entrenamiento (número de tokens, composición exacta del corpus, si hubo fine-tuning con RLHF o DPO) no están disponibles en la información proporcionada. Lo que sí se documenta es que el trabajo de `malinali-app` se limita al reempaquetado: conversión de los pesos originales a `safetensors` y conversión de los modelos SentencePiece a tokenizadores rápidos en formato JSON de Hugging Face, uno para el lado de origen y otro para el lado de destino. Esta separación en dos tokenizadores es habitual en Marian y es un detalle relevante para quien implemente la inferencia manualmente. El autor declara explícitamente que no reclama la propiedad del modelo entrenado y que todo el mérito del entrenamiento corresponde a Helsinki-NLP.

La innovación técnica destacable no está en el modelo en sí, sino en el formato de distribución: pesos en safetensors más tokenizadores JSON permiten cargar el modelo desde Rust mediante Candle (integración `marian_flutter`) para inferencia on-device en aplicaciones Flutter, evitando dependencias de Python en tiempo de ejecución.

## Capacidades

- Traducción automática unidireccional de sueco (sv) a kinyarwanda (rw).
- Traducción a nivel de frase y de párrafo corto, que es el régimen típico de los modelos Marian de OPUS-MT.
- Ejecución completamente offline y on-device: no requiere llamadas a red una vez descargados los pesos.
- Inferencia en CPU, sin necesidad de GPU, gracias a los 75,9 M de parámetros.
- Carga de pesos desde Rust mediante Candle (etiqueta `candle` y componente `marian_flutter`), además del uso estándar con `transformers` en Python.
- Tokenización separada para origen y destino mediante tokenizadores rápidos en JSON.
- Compatibilidad declarada con endpoints (etiqueta `endpoints_compatible`), lo que permite desplegarlo como endpoint de inferencia en la infraestructura de Hugging Face.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo de razonamiento explícito (thinking mode), visión, audio ni multimodalidad.
- No es un modelo conversacional: no está diseñado para diálogo multi-turno ni para generación de texto libre.
- No se documentan capacidades de traducción inversa (rw → sv); la dirección está fijada en sv → rw.

## Casos de uso

- Traducción offline en aplicaciones móviles para la comunidad ruandesa en Suecia: una app Flutter puede integrar los pesos con Candle y traducir textos suecos al kinyarwanda sin conexión, algo crítico en contextos de movilidad o con conectividad limitada.
- Atención a personas recién llegadas en servicios sociales y sanitarios: traducción en el dispositivo de formularios, instrucciones médicas o comunicaciones administrativas redactadas en sueco, sin enviar datos personales a servidores externos, lo que simplifica el cumplimiento del RGPD.
- Traducción de correspondencia administrativa y documentos oficiales suecos: procesamiento por lotes de cartas de autoridades, extractos o notificaciones para producir versiones en kinyarwanda destinadas a usuarios finales.
- Preprocesado de corpus para investigación en traducción de bajos recursos: uso del modelo para generar borradores de traducción sueco-kinyarwanda que después se revisan y se emplean como datos de entrenamiento o evaluación de modelos mayores.
- Localización de productos y documentación hacia el mercado ruandés: traducción de fichas de producto, manuales breves o textos de interfaz originalmente escritos en sueco, con revisión humana posterior obligatoria.
- Pipelines de subtitulado y transcripción: combinación con un modelo de reconocimiento de voz (por ejemplo Whisper) para transcribir audio en sueco y traducir después al kinyarwanda dentro del mismo dispositivo.
- Traducción asistida en herramientas de anotación lingüística: generación de traducciones de referencia preliminares para anotadores que trabajan con pares sv-rw.
- Integración como endpoint ligero de traducción: al declararse compatible con endpoints y ocupar solo 0,3 GB, puede desplegarse como servicio HTTP de bajo coste para traducción sv → rw en un contenedor pequeño, incluso sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card del repositorio no incluye métricas de calidad de traducción (BLEU, chrF, COMET u otras), ni comparaciones cuantitativas con modelos alternativos. Tampoco se documentan cifras de latencia o throughput. La búsqueda web realizada no ha devuelto ningún resultado relacionado con este modelo ni con OPUS-MT para el par sv-rw; los resultados obtenidos eran completamente ajenos al contenido técnico solicitado.

## Requisitos de hardware

- VRAM estimada en función del número real de parámetros (75.859.340): aproximadamente 304 MB en FP32, unos 152 MB en FP16/BF16 y unos 76 MB en int8 si se cuantiza manualmente.
- El repositorio ocupa 0,3 GB, coherente con pesos en FP32 más los dos tokenizadores JSON.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090 o incluso GPUs integradas, con un uso de memoria despreciable frente a sus capacidades.
- Funciona en CPU sin dificultad; es viable incluso en procesadores móviles ARM, que es precisamente el escenario objetivo del paquete.
- Memoria RAM recomendada: del orden de 0,5 a 1 GB contando pesos, tokenizadores y el espacio de trabajo del runtime, aunque no se dispone de una cifra oficial.
- Opciones de despliegue documentadas: Candle a través de `marian_flutter` (Rust, orientado a Flutter) y `transformers` con PyTorch en Python.
- Compatible con la infraestructura de endpoints de Hugging Face, según la etiqueta del repositorio.
- vLLM, llama.cpp, Ollama y TGI no soportan de forma nativa la arquitectura Marian, por lo que no son opciones de despliegue directas; tampoco se documenta una conversión a ONNX o CTranslate2.
- No se han publicado cifras de latencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Direccion | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| malinali-app/opus-mt-sv-rw | 75,9 M | sv -> rw | no disponible | no declarada (remite al modelo original) | Hugging Face, 0 descargas, 0 likes | Reempaquetado en safetensors con tokenizadores rapidos para Candle |
| Helsinki-NLP/opus-mt-sv-rw | no disponible en la informacion proporcionada | sv -> rw | no disponible | habitualmente CC-BY 4.0 segun su model card (no confirmado aqui) | Hugging Face (modelo original) | Mismos pesos; es la fuente del modelo comparado |
| Helsinki-NLP/opus-mt-rw-sv | no disponible en la informacion proporcionada | rw -> sv | no disponible | habitualmente CC-BY 4.0 (no confirmado) | Hugging Face | Direccion inversa dentro de la misma familia OPUS-MT; requeriria combinarlo para traduccion bidireccional |
| NLLB-200-distilled-600M | aproximadamente 600 M segun su denominacion publica (dato no verificado en la informacion proporcionada) | multilingue, incluye sv y rw | no disponible en la informacion proporcionada | CC-BY-NC 4.0 (uso no comercial; dato no verificado aqui) | Hugging Face | Modelo multilingue de mayor tamano; no es un sustituto directo on-device |

No se dispone de datos de rendimiento comparativo entre estas opciones dentro de la información proporcionada. La comparación se limita, por tanto, a parámetros, direccionalidad, licencia y disponibilidad. Cualquier cifra de calidad de traducción para los modelos alternativos debería verificarse en sus respectivas model cards antes de tomar una decisión.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no especifica una licencia propia y remite a la del modelo original, que la model card describe como "habitualmente CC-BY 4.0 para OPUS-MT" sin confirmarlo. Antes de un uso comercial es obligatorio verificar la licencia efectiva de `Helsinki-NLP/opus-mt-sv-rw`; esta ficha no puede confirmarla.
- Riesgo de alucinación y de traducciones plausiblemente incorrectas: en traducción automática neuronal, el modelo puede producir salidas fluidas pero semánticamente erróneas, especialmente en terminología técnica, nombres propios, cifras y negaciones.
- Idioma de destino de bajos recursos: el kinyarwanda cuenta con menos datos paralelos que idiomas mayoritarios, lo que se traduce en menor cobertura léxica y peor calidad en dominios especializados.
- Direccionalidad fija: solo traduce de sueco a kinyarwanda. No sirve para la dirección inversa ni como modelo multilingüe.
- Sin contexto largo verificado: no se documenta la longitud máxima de secuencia soportada, por lo que traducir documentos completos requiere segmentarlos en frases o párrafos.
- No es un modelo generativo de propósito general: no admite instrucciones, no hace tool calling y no debe usarse para resumen, código, diálogo ni razonamiento.
- Origen de los pesos: `malinali-app` no ha entrenado el modelo. Cualquier problema de calidad heredado procede del modelo base de Helsinki-NLP.
- Conversión de tokenizadores: al haberse convertido de SentencePiece a tokenizadores rápidos JSON, conviene validar que la tokenización coincide con la del modelo original en textos con caracteres poco frecuentes, para evitar discrepancias silenciosas.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya reportado problemas de uso.
- Sin garantías de mantenimiento: no se documentan versiones posteriores, issues ni canal de soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/malinali-app/opus-mt-sv-rw
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-sv-rw
- Proyecto OPUS-MT (Helsinki-NLP) en GitHub: https://github.com/Helsinki-NLP/Opus-MT
- Aplicación Malinali: https://malinali.app

No se han encontrado otros enlaces relevantes (papers, blogs, demos o repositorios adicionales) en la busqueda web realizada.
