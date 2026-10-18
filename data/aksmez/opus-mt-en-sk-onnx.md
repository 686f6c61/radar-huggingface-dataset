# aksmez/opus-mt-en-sk-ONNX

## Resumen

`aksmez/opus-mt-en-sk-ONNX` es una exportación a formato ONNX del modelo de traducción automática `Helsinki-NLP/opus-mt-en-sk`, perteneciente a la familia OPUS-MT desarrollada por el grupo Language Technology de la Universidad de Helsinki. El modelo original es un transformer encoder-decoder de tipo Marian entrenado con datos del corpus OPUS para traducir de inglés a eslovaco, y esta versión ONNX está pensada para ejecutarse con Transformers.js, lo que permite inferencia en navegador o en Node.js sin depender de PyTorch.

El problema que resuelve es acotado pero muy concreto: traducción de frases en inglés a eslovaco en entornos ligeros, con un único par de idiomas y sin necesidades de GPU. La relevancia práctica no está en la calidad absoluta frente a modelos multilingües grandes, sino en la posibilidad de desplegar traducción en el cliente (navegador, extensiones, aplicaciones Electron) con un artefacto ONNX y la licencia permisiva Apache 2.0.

La información publicada es escasa: la model card solo indica el origen, el pipeline de conversión automática y una métrica BLEU de 36,8 sobre el testset JW300.en.sk. No se documentan el número de parámetros, la longitud de contexto ni los detalles de cuantización, y el repositorio (4,3 GB) no registra descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, variante `transformer-align`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponibles; el repositorio contiene exportaciones ONNX y lleva la etiqueta `base_model:quantized` |
| Idiomas soportados | inglés (origen) → eslovaco (destino); par único, sin otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (repositorio de 4,3 GB, presumiblemente con varias precisiones) |
| Tarea (pipeline) | `translation` |
| Libreria declarada | transformers.js |
| Preprocesado | normalización + tokenización SentencePiece |
| Dataset de entrenamiento | OPUS |
| Modelo base | Helsinki-NLP/opus-mt-en-sk |
| Fecha de creacion (metadatos) | 2026-10-18 |

## Arquitectura y entrenamiento

El modelo base es un MarianMT, es decir, un transformer encoder-decoder completo con atención multi-cabeza estándar, entrenado con la herramienta OPUS-MT-train sobre pares de frases alineadas del corpus OPUS. La variante indicada en la model card es `transformer-align`, una configuración habitual en OPUS-MT que incorpora alineación en el preprocesado y normalización de texto antes de la tokenización con SentencePiece. No se especifican en la información disponible el número de capas, la dimensión oculta, el número de cabezas ni el volumen de tokens de entrenamiento.

No hay documentación sobre fases de alineación por RLHF o DPO; se trata de un modelo de traducción supervisada clásico, no de un modelo generativo ajustado por preferencias. La aportación de este repositorio no es arquitectónica sino de empaquetado: la conversión a ONNX se realizó de forma automática mediante el Space `onnx-community/convert-to-onnx`, y el resultado se distribuye para su uso con Transformers.js. No se publican detalles sobre el proceso de cuantización aplicado ni sobre posibles pérdidas de calidad derivadas de la conversión.

## Capacidades

- Traducción de texto de inglés a eslovaco, orientada a frases o párrafos cortos.
- Ejecución mediante el pipeline `translation` de Transformers.js, con API de alto nivel.
- Inferencia sin PyTorch: el artefacto ONNX puede ejecutarse con ONNX Runtime en Node.js, en el navegador (WASM/WebGPU) o en entornos empaquetados.
- Preprocesado integrado de normalización y tokenización SentencePiece, sin necesidad de canalizar el texto manualmente.
- Capacidad de procesamiento por lotes a nivel de aplicación (varias frases encadenadas por el código cliente), no documentada de forma nativa en la model card.
- No soporta tool calling ni function calling.
- No soporta uso como agente ni razonamiento multi-paso.
- No dispone de capacidades multimodales (visión, audio) ni de modo "thinking".
- Cobertura multilingüe inexistente más allá del par en→sk.

## Casos de uso

- **Localización de interfaces web en el navegador**: el modelo puede cargarse con Transformers.js y traducir cadenas de UI o textos de ayuda del inglés al eslovaco en el propio cliente, sin enviar contenido a un servidor; encaja por su formato ONNX y su tamaño manejable en inferencia.
- **Extensiones de navegador para lectura**: traducción bajo demanda de fragmentos de páginas en inglés a eslovaco, ejecutada localmente, útil en entornos con conectividad limitada o requisitos de privacidad.
- **Atención al cliente por correo electrónico**: traducción de tickets y respuestas del inglés al eslovaco en un pipeline previo a la revisión humana; el coste por petición es mínimo al no requerir GPU.
- **Descripciones de producto en comercio electrónico**: traducción por lotes de fichas y atributos desde un catálogo maestro en inglés hacia la tienda eslovaca, con revisión posterior de terminología de marca.
- **Preprocesado de corpus para entrenamiento**: traducción automática de datasets en inglés a eslovaco para aumento de datos o para generar pares sintéticos que luego se filtran por calidad.
- **Documentación técnica interna**: traducción de READMEs, guías de operaciones y notas de versión en repositorios, integrable en un script de CI que genere artefactos en eslovaco.
- **Procesamiento por lotes en servidor sin GPU**: ejecución con ONNX Runtime en contenedores ligeros para trabajos nocturnos de traducción masiva donde no se justifica un modelo multilingüe grande.
- **Prototipado rápido de productos de traducción**: validación de una idea o demo con un único par de idiomas antes de invertir en modelos multilingües de mayor coste.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible corresponden al modelo base y se miden sobre JW300.en.sk:

| Testset | BLEU | chr-F |
|---|---|---|
| JW300.en.sk | 36,8 | 0,578 |

No se han publicado resultados de benchmarks en la información disponible para esta exportación ONNX (MMLU, HumanEval, GSM8K y similares no aplican a un modelo de traducción). Tampoco se documenta la degradación de BLEU que pueda introducir la conversión a ONNX ni las precisiones numéricas empleadas. La métrica procede del modelo original, no de una evaluación independiente de este repositorio.

## Requisitos de hardware

- Inferencia viable en CPU: el modelo base es un transformer de traducción de tamaño reducido y la exportación ONNX está pensada para entornos sin acelerador; no se publica el número de parámetros ni el consumo exacto.
- VRAM estimada: no disponible de forma oficial; el repositorio ocupa 4,3 GB, un tamaño que apunta a múltiples variantes de exportación en distintas precisiones, no a un único grafo. Cada variante individual sería sustancialmente menor.
- GPU recomendadas: no se especifican. Para lotes grandes, cualquier GPU consumer reciente (por ejemplo, RTX 3060 o superior) sería sobradamente suficiente si el grafo cabe en memoria; no hay datos verificados de rendimiento.
- Cabe en GPU consumer: sí, con alta probabilidad, dado el perfil del modelo base; sin cifras publicadas que lo confirmen.
- Despliegue: Transformers.js (Node.js y navegador), ONNX Runtime (CPU, CUDA, DirectML), y cualquier runtime compatible con ONNX. No hay información sobre soporte en vLLM o TGI para esta exportación concreta.
- Latencia y throughput: no disponibles. La model card no incluye mediciones de tokens por segundo ni de frases por segundo en ningún hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aksmez/opus-mt-en-sk-ONNX (este) | no disponible | no disponible | BLEU 36,8 en JW300.en.sk (heredado del base) | Apache 2.0 | ONNX, transformers.js |
| Helsinki-NLP/opus-mt-en-sk (base) | no disponible en la informacion | no disponible | BLEU 36,8 / chrF 0,578 en JW300.en.sk | Apache 2.0 (modelo OPUS-MT) | PyTorch/safetensors en HuggingFace |
| Otros modelos OPUS-MT en→sk (variantes `tc-big` o multilingual) | no disponible | no disponible | no disponible | habitualmente Apache 2.0 o CC-BY 4.0 según variante | HuggingFace |
| Modelos multilingües tipo NLLB-200 o M2M-100 | no disponible en esta ficha | no disponible | no evaluado aquí | licencias distintas según modelo (NLLB: CC-BY-NC) | HuggingFace |

La comparación cuantitativa con alternativas no puede completarse: no se dispone de datos verificados de parámetros, contexto ni BLEU para los modelos de la competencia en la información proporcionada. La diferencia práctica frente al modelo base es el formato (ONNX frente a PyTorch) y el ecosistema de ejecución, no la calidad esperada.

## Limitaciones y advertencias

- **Un solo par de idiomas**: solo inglés → eslovaco. No traduce desde o hacia otros idiomas y no puede usarse como modelo puente sin encadenar sistemas.
- **Conversión automática sin validación publicada**: la model card indica que la exportación se generó con un Space de conversión; no hay evaluación de la calidad del grafo ONNX frente al original ni mención a la precisión numérica utilizada.
- **Riesgo de alucinación y de errores de fidelidad**: como todo modelo de traducción neuronal, puede omitir información, duplicar segmentos o inventar contenido en frases largas, ambiguas o con terminología especializada.
- **Ámbito de entrenamiento**: el corpus OPUS mezcla dominios heterogéneos (incluido material religioso y subtítulos), por lo que el rendimiento puede caer en textos legales, médicos o técnicos muy específicos.
- **Procesamiento a nivel de frase**: no hay evidencia de manejo de contexto documental largo; la coherencia entre frases consecutivas debe gestionarse en la capa de aplicación.
- **Sesgos**: no documentados por el autor. Los sesgos del corpus OPUS (demográficos, culturales, de género gramatical) se trasladan al modelo sin mitigación conocida.
- **Licencia**: Apache 2.0 permite uso comercial, pero la procedencia de los datos OPUS subyacentes puede estar sujeta a condiciones de los corpus originales; conviene revisar la cadena de licencias antes de un despliegue comercial.
- **Madurez**: el repositorio no registra descargas ni valoraciones, y no hay documentación adicional del autor; trátese como artefacto no validado por la comunidad.
- **Sin soporte de herramientas ni agentes**: no es adecuado para flujos que requieran function calling o razonamiento multi-paso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aksmez/opus-mt-en-sk-ONNX
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-en-sk
- README de OPUS-MT para el par en-sk: https://github.com/Helsinki-NLP/OPUS-MT-train/blob/master/models/en-sk/README.md
- Space de conversión a ONNX utilizado: https://huggingface.co/spaces/onnx-community/convert-to-onnx
- Documentación del pipeline `translation` de Transformers.js: https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.TranslationPipeline
- Pesos originales: https://object.pouta.csc.fi/OPUS-MT-models/en-sk/opus-2020-01-08.zip
- Traducciones del testset: https://object.pouta.csc.fi/OPUS-MT-models/en-sk/opus-2020-01-08.test.txt
- Puntuaciones de evaluación: https://object.pouta.csc.fi/OPUS-MT-models/en-sk/opus-2020-01-08.eval.txt
