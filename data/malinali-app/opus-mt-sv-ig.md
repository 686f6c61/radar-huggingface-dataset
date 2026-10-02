# malinali-app/opus-mt-sv-ig

## Resumen

El modelo `malinali-app/opus-mt-sv-ig` es un sistema de traduccion automatica neuronal especializado en el par de idiomas sueco (sv) hacia igbo (ig). Se trata de un reempaquetado del modelo upstream `Helsinki-NLP/opus-mt-sv-ig`, desarrollado originalmente por el grupo Helsinki-NLP dentro del proyecto OPUS-MT y redistribuido por el autor malinali-app para su uso en la aplicacion Malinali.

La relevancia de esta publicacion no reside en un nuevo entrenamiento, sino en la conversion y empaquetado del modelo para inferencia on-device. El autor transforma los pesos originales a formato safetensors y convierte los tokenizadores SentencePiece a JSON de tokenizador rapido compatible con Candle, lo que permite ejecutar el modelo en dispositivos sin depender de infraestructura de servidor. Esto es relevante para aplicaciones de traduccion sin conexion o con requisitos de privacidad.

El modelo cuenta con 75.089.327 parametros, un tamano tipico de la familia MarianMT de OPUS-MT, y ocupa 0,3 GB en el repositorio. Se distribuye bajo la libreria transformers con la etiqueta de pipeline `translation`. No se especifica una licencia propia en la model card mas alla de remitir a la del modelo upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MarianMT (transformer encoder-decoder para traduccion automatica neuronal) |
| Parametros totales | 75.089.327 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor menciona empaquetado para Candle) |
| Idiomas soportados | sueco (sv) como origen, igbo (ig) como destino |
| Licencia | no disponible (el autor remite a la licencia del modelo upstream, habitualmente CC-BY 4.0 para OPUS-MT) |
| Formato de pesos | safetensors (mas tokenizadores JSON de tokenizador rapido: tokenizer-enc.json y tokenizer-dec.json) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura MarianMT, un transformer de tipo encoder-decoder disenado especificamente para traduccion automatica neuronal y desarrollado en el marco del proyecto OPUS-MT. Esta familia de modelos se entrena sobre corpus paralelos multilingues recopilados en el proyecto OPUS, con el objetivo de ofrecer traduccion de alta calidad para combinaciones de idiomas de bajos recursos. El modelo cuenta con 75.089.327 parametros en total.

No se dispone de informacion detallada en la documentacion proporcionada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de ajuste como RLHF o DPO. En esta publicacion concreta, malinali-app no ha reentrenado el modelo: se limita a reempaquetar los pesos del modelo upstream `Helsinki-NLP/opus-mt-sv-ig`, convertir los tokenizadores de SentencePiece a formato JSON de tokenizador rapido y preparar los artefactos para inferencia con Candle mediante el componente `marian_flutter`. La innovacion tecnica, por tanto, es de despliegue (inferencia on-device) y no de modelado.

## Capacidades

- Traduccion de texto de sueco (sv) a igbo (ig) en una unica direccion.
- Generacion de texto mediante la tarea text2text-generation, propia de los modelos encoder-decoder de traduccion.
- Ejecucion on-device mediante el framework Candle (Rust) a traves del empaquetado `marian_flutter`.
- Tokenizacion rapida separada para origen y destino (tokenizer-enc.json y tokenizer-dec.json).
- Compatibilidad con la libreria transformers y con endpoints compatibles (tag `endpoints_compatible`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio ni modos de pensamiento (thinking).
- Capacidad multilingue limitada estrictamente al par sv a ig; no se declaran otros idiomas.

## Casos de uso

- Traduccion sin conexion en aplicaciones moviles: al estar empaquetado para Candle y ocupar solo 0,3 GB, el modelo puede integrarse en una app movil para traducir texto sueco a igbo sin acceso a red, preservando la privacidad del usuario.
- Traduccion de contenidos editoriales y documentos: el modelo permite convertir articulos, manuales o documentacion del sueco al igbo manteniendo el flujo de trabajo dentro de un pipeline automatizado.
- Localizacion de interfaces y software: uso como motor de traduccion para cadenas de texto de aplicaciones destinadas a usuarios de habla igbo, partiendo de originales en sueco.
- Procesamiento por lotes de corpus: al ser un modelo pequeno y rapido, es adecuado para traducir grandes volumenes de texto en modo batch en CPU o GPU modesta.
- Investigacion en traduccion de bajos recursos: sirve como punto de partida o baseline para experimentos sobre el par sueco-igbo, un par con recursos limitados dentro del ecosistema OPUS.
- Sistemas embebidos y edge computing: su tamano reducido (aproximadamente 300 MB en fp32) permite desplegarlo en dispositivos con recursos restringidos, como Raspberry Pi o terminales dedicados.
- Integracion en asistentes de traduccion en tiempo real: combinado con deteccion de idioma y tokenizacion ligera, puede ofrecer traducciones de baja latencia en flujos conversacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de 75.089.327 parametros): aproximadamente 300 MB en fp32, unos 150 MB en fp16/bf16 y alrededor de 75 MB en int8.
- GPU recomendadas: cualquier GPU moderna es suficiente; por el tamano del modelo, modelos como RTX 4090, RTX 3090, A100 o H100 quedan sobradamente dimensionados y no representan una restriccion.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo actual, e incluso en GPU integradas y en dispositivos moviles o embebidos.
- Opciones de despliegue: libreria transformers (Python), inferencia con Candle (Rust) mediante el empaquetado `marian_flutter` del autor, y conversion a otros formatos si se desea (por ejemplo GGUF para llama.cpp u Ollama) aunque no se documenta en la ficha.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| malinali-app/opus-mt-sv-ig | 75.089.327 | no disponible | no disponible (remite al upstream) | HuggingFace, empaquetado para Candle |
| Helsinki-NLP/opus-mt-sv-ig (upstream) | no disponible en esta ficha | no disponible | habitualmente CC-BY 4.0 | HuggingFace |
| Otros pares de OPUS-MT (familia MarianMT) | tipicamente en el rango de decenas de millones | no disponible | habitualmente CC-BY 4.0 | HuggingFace |
| NLLB-200 (Meta, modelo multilingue) | 600M en la variante distilled | no disponible en esta ficha | no disponible en esta ficha | HuggingFace |

La comparacion directa con NLLB-200 u otros modelos multilingues no puede establecerse con datos numericos porque no se han proporcionado resultados de benchmarks. La diferencia principal frente al modelo upstream es el empaquetado: esta version anade tokenizadores rapidos en JSON y esta preparada para inferencia on-device con Candle, mientras que el upstream se distribuye en el formato estandar de OPUS-MT.

## Limitaciones y advertencias

- Direccionalidad unica: el modelo solo traduce de sueco a igbo; no soporta la direccion inversa (ig a sv) ni otros pares.
- Idiomas minoritarios: el igbo es un idioma de bajos recursos, por lo que la calidad de traduccion puede ser inferior y mas variable que en pares con grandes volumenes de datos paralelos.
- Riesgo de alusion: como todo modelo de traduccion neuronal, puede generar traducciones incorrectas, omitir matices o producir contenido plausible pero erroneo, especialmente en dominios especializados o con terminologia tecnica.
- Sesgos: no se documenta informacion sobre sesgos conocidos; los corpus OPUS pueden reflejar sesgos de los textos de origen.
- Licencia: la licencia no esta declarada explicitamente en la publicacion; el autor remite a la del modelo upstream (habitualmente CC-BY 4.0), por lo que conviene verificar las condiciones antes de un uso comercial en produccion.
- Ausencia de benchmarks: no hay datos publicados de rendimiento que permitan estimar la calidad real de la traduccion en este par concreto.
- Sin soporte de contexto largo documentado: no se especifica la longitud maxima de contexto, lo que limita la planificacion para documentos extensos.
- Uso en produccion: al no haber reentrenamiento ni evaluacion propia por parte del autor del reempaquetado, se recomienda validar la calidad con un conjunto de prueba representativo antes de desplegarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/malinali-app/opus-mt-sv-ig
- Modelo base upstream: https://huggingface.co/Helsinki-NLP/opus-mt-sv-ig
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- Aplicacion Malinali: https://malinali.app
