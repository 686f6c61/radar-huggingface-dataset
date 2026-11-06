# AmandaGondra/ncm-classifier-bertimbau

## Resumen

`AmandaGondra/ncm-classifier-bertimbau` es un modelo de clasificación de texto en portugués desarrollado por Amanda Gondra, orientado a la sugerencia de códigos NCM (Nomenclatura Común del Mercosur) a partir de descripciones de productos, principalmente del ámbito del agronegocio. Se trata de un fine-tuning de `neuralmind/bert-base-portuguese-cased` (BERTimbau) sobre un conjunto de 900 líneas etiquetadas en 37 posiciones NCM, con validación cruzada de 5 dobles y dos conjuntos de test congelados.

El modelo es explícitamente un **experimento documentado** y no el modelo principal del proyecto: la autora recomienda usar `AmandaGondra/ncm-classifier`, que empató en calidad con este y es mucho más ligero. La relevancia de esta ficha es doble: por un lado, documenta una comparación metodológicamente rigurosa entre un transformer preentrenado en portugués y un baseline más simple; por otro, ilustra un patrón de despliegue con calibración de temperatura y umbral de revisión humana, orientado a un caso de uso fiscal donde el coste del error es alto.

Arquitectura transformer encoder (BERT base, 108,9 M parámetros), contexto de 512 tokens (el entrenamiento usó hasta 128), licencia MIT y pesos en safetensors. El modelo no genera texto ni razona: emite una distribución de probabilidad sobre 37 clases NCM, que debe calibrarse y filtrarse con reglas de negocio antes de producir una sugerencia utilizable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base, portugués, cased) |
| Parametros totales | 108.951.589 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (entrenamiento con truncado a 128 tokens) |
| Tipos de cuantizacion | no disponible (pesos safetensors en float32/float16; el autor no publica variantes GGUF/ONNX) |
| Idiomas soportados | Portugués (pt) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 0,4 GB) |

## Arquitectura y entrenamiento

El modelo parte de `neuralmind/bert-base-portuguese-cased` (revisión `94d69c95f98f7d5b2a8700c420230ae10def0baa`), un BERT base entrenado en portugués, y se somete a un fine-tuning de clasificación sobre 37 posiciones NCM. Los datos de entrenamiento son los mismos 900 registros del modelo principal, verificados por SHA-256 y organizados en las mismas 5 dobles. La entrada utilizada es la versión `normalized` del texto, producida por la misma función `normalize_text` del baseline. La configuración de entrenamiento incluye 10 épocas, pérdida ponderada por clase, AdamW con learning rate 3e-5, warmup del 10 %, batch de 16, truncado a 128 tokens, float16 en GPU, semilla 0 y aproximadamente 8 minutos de cómputo en una Tesla T4.

La innovación técnica no está en la arquitectura, sino en el pipeline de decisión que la acompaña: tras el fine-tuning se aplica una calibración de temperatura (T = 0,5391) ajustada fuera de la doble y un umbral de revisión que deriva los casos de baja confianza a un revisor humano. Además se aplica la denominada "regla 31.05" (`ncm_classifier.rules.small_package`), una regla de negocio posterior a la calibración. La macro F1 media fuera de la doble en validación cruzada fue de 0,8715, y ese valor se usó para seleccionar la configuración de entrada, épocas y demás hiperparámetros.

## Capacidades

- Clasificación de texto multietiqueta en una sola etiqueta (single-label) sobre 37 clases NCM, a partir de descripciones de producto en portugués.
- Salida de probabilidades por clase (logits transformables a probabilidades), apta para ranking top-1 y top-3.
- Calibración de probabilidades mediante temperatura, lo que permite umbrales de confianza con significado estadístico (ECE bruto de 0,2091 reducido a 0,0144 en test_v1).
- Mecanismo de derivación a revisión humana mediante umbral de confianza, con tasas del 2,05 % (test_v1) y 4,05 % (test_v2) de envíos a revisión.
- Aplicación de reglas de negocio post-clasificación (regla 31.05 para paquetes pequeños) para ajustar la sugerencia final.
- No soporta tool calling, function calling, agentes, multi-step reasoning, visión ni audio: es un clasificador puro.
- Capacidad multilingüe limitada al portugués; no se documenta rendimiento en otros idiomas.

## Casos de uso

- **Sugerencia de NCM en emisión de facturas**: el modelo recibe la descripción del ítem (por ejemplo, "Ureia agrícola, pacote 1 kg"), devuelve la distribución sobre 37 posiciones NCM y el sistema aplica calibración y umbral para proponer un código al emisor, que conserva la responsabilidad fiscal final.
- **Preclasificación en pipelines de facturación electrónica**: integrado como paso previo a la validación humana, reduce el tiempo de codificación manual en catálogos de productos agropecuarios, con una tasa de derivación a revisión de entre el 2 % y el 4 % según el conjunto de test.
- **Auditoría de clasificaciones existentes**: dada una base histórica de facturas ya emitidas, el modelo permite detectar discrepancias entre el NCM declarado y el sugerido, priorizando la revisión por confianza calibrada.
- **Enriquecimiento de catálogos de producto**: clasificación por lotes de descripciones de SKU para poblar el campo NCM en sistemas de gestión, con top-3 como salida para que el operador elija entre las tres mejores hipótesis (top-3 de 0,9932 en test_v1).
- **Investigación metodológica sobre clasificación fiscal**: el repositorio de código y el documento `docs/experiments/model_comparison.md` sirven como referencia para comparar un baseline ligero con un transformer preentrenado usando bootstrap pareado y test de McNemar.
- **Prototipado de asistentes de clasificación aduanera**: al ser un experimento documentado con limitaciones explícitas, es adecuado para entornos de laboratorio o pruebas de concepto donde se quiera medir el techo de calidad de un BERTimbau antes de invertir en un modelo mayor.
- **Formación y docencia**: ejemplo reproducible de fine-tuning de BERTimbau en una sola T4 en 8 minutos, con calibración, validación cruzada y análisis de errores completos.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre los dos conjuntos de test congelados, con calibración y regla 31.05 aplicadas:

| Métrica | test_v1 | test_v2 |
|---|---|---|
| top-1 | 0,9589 [0,9247–0,9863] | 0,9189 [0,8514–0,9730] |
| top-3 | 0,9932 [0,9795–1,0000] | 0,9865 [0,9595–1,0000] |
| macro F1 | 0,9599 [0,9225–0,9863] | 0,9180 [0,8628–0,9778] |
| macro precisión | 0,9730 [0,9234–0,9924] | 0,9141 [0,8590–0,9835] |
| macro recall | 0,9646 [0,9398–0,9868] | 0,9339 [0,8841–0,9822] |
| ECE bruto → calibrado | 0,2091 → 0,0144 | 0,1960 → 0,0574 |
| Enviado a revisión | 0,0205 [0,0000–0,0479] | 0,0405 [0,0000–0,0946] |
| top-1 de los aceptados | 0,9720 [0,9441–0,9931] | 0,9437 [0,8873–0,9863] |
| Líneas | 146 | 74 |

Frente al modelo principal `AmandaGondra/ncm-classifier`, con bootstrap pareado y test de McNemar, no se observaron diferencias distinguibles de cero en top-1, top-3 ni macro F1. La comparación cualitativa indica que este modelo tiene mejores probabilidades calibradas en test_v1 y menos casos derivados a revisión, pero más errores con confianza alta y aproximadamente 50 veces más tiempo por predicción en CPU.

## Requisitos de hardware

- **VRAM estimada para inferencia**: alrededor de 0,5-1 GB en float16 o float32 para los 108,9 M de parámetros, más el overhead del tokenizer y del runtime de PyTorch.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM es suficiente; el entrenamiento se realizó en una Tesla T4. Para inferencia en producción, una T4, L4 o incluso una GPU de portátil son adecuadas.
- **Compatibilidad con GPU de consumo**: sí, cabe holgadamente en cualquier RTX 20xx/30xx/40xx, GTX 16xx y en iGPU con suficiente memoria compartida.
- **Opciones de despliegue**: `transformers` con PyTorch, `text-embeddings-inference` (el repo está marcado como `endpoints_compatible`), exportación a ONNX Runtime y despliegue en Hugging Face Inference Endpoints. No se publican pesos GGUF ni cuantizaciones ligeras.
- **Latencia y throughput**: el autor indica que es aproximadamente 50 veces más lento por predicción en CPU que el modelo principal. No se publican cifras absolutas de latencia ni de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `AmandaGondra/ncm-classifier-bertimbau` (este) | 108,9 M | 512 tokens | Clasificación NCM (37 clases), portugués | MIT | Hugging Face |
| `AmandaGondra/ncm-classifier` (modelo principal) | no disponible en la información proporcionada | no disponible | Clasificación NCM (37 clases), portugués | no disponible en la información proporcionada | Hugging Face |
| `neuralmind/bert-base-portuguese-cased` (base) | ~110 M | 512 tokens | Modelo de lenguaje enmascarado, portugués | MIT | Hugging Face |

La comparación cuantitativa directa entre este modelo y el principal se limita a la conclusión del autor: sin diferencias distinguibles en top-1, top-3 ni macro F1, con ventaja en calibración para este modelo y ventaja en latencia en CPU para el principal. No se dispone de datos de benchmarks frente a otros clasificadores NCM de terceros.

## Limitaciones y advertencias

- **Modelo experimental, no principal**: la propia autora recomienda usar `AmandaGondra/ncm-classifier` en producción por su menor coste computacional con calidad equivalente.
- **Semilla única**: no se midió la varianza entre semillas, por lo que la estabilidad de los resultados no está caracterizada.
- **Selección de época al límite de la rejilla**: la época elegida fue la última de la rejilla probada, lo que sugiere que no se exploró el sobreajuste más allá de ese punto.
- **Calibración no transferida**: la temperatura ajustada en las dobles no se transfirió bien al modelo final, que quedó más confiado; el objetivo del 95 % en los aceptados no se mantuvo en test_v2 (top-1 de aceptados de 0,9437).
- **Más errores con confianza alta** que el modelo principal, lo que incrementa el riesgo de sugerencias fiscales incorrectas aceptadas automáticamente.
- **Coste computacional en CPU**: aproximadamente 50 veces más lento por predicción que el modelo principal, lo que puede ser prohibitivo en despliegues sin GPU.
- **Alcance limitado**: 37 posiciones NCM y 900 líneas de entrenamiento; no cubre el universo completo de la nomenclatura y su generalización a otros dominios o productos no está validada.
- **Sesgos**: no se documenta un análisis de sesgos por tipo de producto, región o vocabulario; el conjunto de datos incluye descripciones de anuncios de terceros no redistribuidas.
- **Riesgo de alucinación**: no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas con alta confianza, por lo que la revisión humana es obligatoria en contextos fiscales.
- **Licencia**: MIT permite uso comercial, pero los datos de entrenamiento no se redistribuyen y su procedencia (anuncios de terceros) puede imponer restricciones adicionales al reentrenamiento.
- **Idioma**: solo portugués; no se documenta comportamiento en español ni en descripciones mixtas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AmandaGondra/ncm-classifier-bertimbau
- Modelo principal recomendado: https://huggingface.co/AmandaGondra/ncm-classifier
- Modelo base: https://huggingface.co/neuralmind/bert-base-portuguese-cased
- Código y notebooks: https://github.com/amanda-gondra/ncm-classifier
- Notebook de fine-tuning: `notebooks/bertimbau_finetuning_kaggle.py` en el repositorio anterior
- Análisis comparativo: `docs/experiments/model_comparison.md` en el repositorio anterior
