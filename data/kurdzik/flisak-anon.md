# Kurdzik/flisak-anon

## Resumen

flisak-anon es un modelo de reconocimiento de entidades nombradas (NER) especializado en la detección de nombres de personas en correos electrónicos y textos breves en polaco, con el objetivo de sustituirlos por marcadores de posición en procesos de anonimización. Lo desarrolla Mateusz Kurdziel (usuario Kurdzik) como parte del sistema de gestión documental Flisak, y se publica bajo licencia CC BY 4.0.

El modelo parte de clarin-pl/FastPDN, un NER polaco construido sobre HerBERT, y lo reajusta para corregir sus fallos en texto de correo: vocativos e inflexiones truncadas, nombres en minúscula, diminutivos y firmas en mayúsculas que se fragmentaban en varios marcadores. La arquitectura, las 165 etiquetas, la configuración y el tokenizador son idénticos a FastPDN; solo cambian los pesos, por lo que funciona como reemplazo directo.

Con 123.979.687 parámetros y una arquitectura BERT base (12 capas, dimensión oculta 768), el modelo es ligero y apto para inferencia en CPU o GPU de consumo. Su relevancia radica en la mejora medida sobre KPWr-NER (F1 de persona de 0,682 a 0,932) y en la reducción drástica de caracteres de nombre legibles en correos sintéticos (del 2,31 % al 0,003 %).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BertForTokenClassification (HerBERT base: 12 capas, hidden size 768) |
| Parametros totales | 123.979.687 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (limitada por el tokenizador de HerBERT; no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión original; no se documentan variantes GGUF/cuantizadas) |
| Idiomas soportados | Polaco; una cuarta parte del correo sintético de entrenamiento está en inglés |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (librería transformers, PyTorch) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder de tipo BERT para clasificación de tokens, heredado de clarin-pl/FastPDN y, en última instancia, de allegro/herbert-base-cased. Conserva las 165 etiquetas de FastPDN y su tokenizador sin modificaciones; únicamente se reentrenaron los pesos. La cabeza de clasificación produce etiquetas BIO sobre tokens, y la inferencia prevista usa la pipeline de token-classification de transformers con `aggregation_strategy="simple"` y `stride=64`.

El ajuste se realizó sobre correo empresarial sintético polaco-inglés diseñado para contener las formas que FastPDN fallaba (vocativos, diminutivos, nombres en minúscula, firmas), con KPWr-NER reproducido en paralelo para preservar el comportamiento general del modelo base. Todos los textos de entrenamiento pasaron primero por la etapa de regex del pipeline de anonimización, de modo que el modelo aprende a detectar nombres junto a marcadores como `<EMAIL_1>`. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Detección de nombres de personas en texto polaco de correo y prosa breve, con etiquetas de persona específicas (cuatro etiquetas de persona entre las 165 heredadas).
- Manejo de formas flexivas y vocativos polacos, diminutivos y nombres en minúscula, que el modelo base no detectaba.
- Detección de nombres adyacentes a marcadores de posición generados por la etapa de regex (`<EMAIL_1>`, `<PHONE_1>`, etc.).
- Funcionamiento sobre texto plano sin marcadores (evaluado en KPWr-NER).
- Conservación intencional de entidades que contienen nombres pero no son personas: empresas, calles, instituciones y marcas ("Kowalski Sp. z o.o.", "ul. Jana Pawła II", "Makita").
- Capacidad multilingüe limitada: polaco e inglés (este último solo presente en el entrenamiento sintético, sin evaluación publicada).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso; es un clasificador de tokens, no un modelo generativo.

## Casos de uso

- Anonimización de correo empresarial: el modelo actúa como segunda etapa de un pipeline de dos fases (regex para correos, teléfonos, PESEL, IBAN, documentos e IP; este modelo para nombres), sustituyendo cada nombre por `<PERSON_n>` antes de mostrar, compartir o procesar el texto.
- Sistemas de gestión documental: integración en Flisak para ocultar nombres de personas en documentos y correos antes de su visualización o distribución interna.
- Cumplimiento de protección de datos (RGPD): seudonimización de nombres en registros de comunicaciones y expedientes, manteniendo legibles los datos de empresas e instituciones que no son datos personales.
- Preprocesamiento para pipelines de NLP: eliminar nombres antes de enviar texto a modelos de análisis de sentimiento, resumen o búsqueda, reduciendo la exposición de datos personales.
- Enmascaramiento en registros de soporte y tickets: detección de nombres en conversaciones de atención al cliente en polaco para generar logs compartibles sin PII de personas.
- Servicio API de anonimización: despliegue mediante el repositorio flisak-anon-inference (Apache 2.0) que sirve el modelo como API para otras aplicaciones.
- Auditoría de textos sintéticos o de prueba: verificar que los conjuntos de datos de evaluación no contienen nombres reales antes de su publicación.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Tarea | Dataset | Precision | Recall | F1 |
|---|---|---|---|---|
| Detección de nombres de persona (span exacto) | Correo empresarial sintético polaco/inglés, test v2 | 0,9994 | 0,9996 | 0,9995 |
| Detección de nombres de persona (span exacto) | KPWr-NER (n82), test | 0,907 | 0,958 | 0,932 |

Datos adicionales de la model card: en el conjunto de test de correo sintético, la proporción de caracteres de nombre que quedan legibles baja del 2,31 % al 0,003 %; en KPWr-NER, el F1 de persona sube de 0,682 (FastPDN) a 0,932.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en FP32 para los 124 millones de parámetros, más el overhead de activaciones y del tokenizador; cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU para volúmenes moderados. Cualquier GPU con 2 GB o más (RTX 3060, RTX 4090, T4, A100, H100) es suficiente.
- Cabe en GPU de consumo: sí, en todas las GPU modernas de consumo, incluidas las integradas con suficiente memoria compartida.
- Opciones de despliegue: transformers (pipeline de token-classification), el servicio flisak-anon-inference (Apache 2.0) como API; no se documentan variantes para vLLM, llama.cpp, Ollama o TGI, que están orientadas a modelos generativos.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | F1 de persona en KPWr-NER | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| flisak-anon | 123.979.687 | no disponible | 0,932 | CC BY 4.0 | HuggingFace (Kurdzik/flisak-anon) |
| clarin-pl/FastPDN | no disponible | no disponible | 0,682 | no disponible | HuggingFace (clarin-pl/FastPDN) |
| allegro/herbert-base-cased | no disponible | no disponible | no disponible (modelo base, sin ajuste NER) | no disponible | HuggingFace (allegro/herbert-base-cased) |

No se dispone de datos de otros modelos NER polacos comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo se evaluaron las etiquetas de persona; el resto de las 165 etiquetas (lugares, organizaciones, `nam_num_phone`, etc.) se entrenaron únicamente mediante la reproducción de KPWr-NER y cuatro negativos sintéticos, y su precisión es desconocida.
- No detecta direcciones postales de personas físicas (calle y número).
- No está pensado para encontrar nombres dentro de direcciones de correo electrónico; esa tarea corresponde a la etapa de regex.
- No ofrece garantía de anonimato: puede omitir nombres, por lo que debe revisarse la salida cuando una omisión tenga consecuencias.
- Solo se probó en polaco e inglés; otros idiomas no fueron evaluados.
- Riesgo de sesgo y alucinación no documentado en la información disponible; al ser un clasificador de tokens, el riesgo principal es la clasificación errónea de spans, no la generación de texto.
- Licencia CC BY 4.0: permite uso comercial con atribución al autor.
- Uso prohibido según la model card: identificar, perfilar o rastrear personas.
- Los benchmarks declarados por el autor no están verificados de forma independiente (`verified: false`).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kurdzik/flisak-anon
- Modelo base: https://huggingface.co/clarin-pl/FastPDN
- Modelo HerBERT original: https://huggingface.co/allegro/herbert-base-cased
- Dataset KPWr-NER: https://huggingface.co/datasets/clarin-pl/kpwr-ner
- Repositorio de inferencia (Apache 2.0): https://github.com/Kurdzik/flisak-anon-inference
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
