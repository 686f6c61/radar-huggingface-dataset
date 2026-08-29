# aakothari/DeepBERTa_zinc_base_100k_v4

## Resumen

DeepBERTa_zinc_base_100k_v4 es un modelo transformer estilo RoBERTa desarrollado por aakothari para el aprendizaje de representaciones moleculares a partir de estructuras químicas codificadas en DeepSMILES, una variante de SMILES que elimina los dígitos de cierre de anillo y simplifica la sintaxis para su procesamiento con técnicas de NLP. El modelo se entrenó sobre un corpus de 100.000 moléculas canónicas muestreadas de la base de datos ZINC, utilizando un tokenizador BPE con un vocabulario de 767 tokens y el objetivo de modelado de lenguaje enmascarado (MLM).

Con 44,1 millones de parámetros distribuidos en 6 capas transformer y 12 cabezas de atención, el modelo está diseñado para imitar a ChemBERTa-zinc-base-100k-v1 pero operando sobre DeepSMILES en lugar de SMILES. Su relevancia actual radica en el descubrimiento de fármacos basado en fragmentos (FBDD), donde las representaciones moleculares aprendidas de forma no supervisada pueden transferirse a tareas de predicción de propiedades como toxicidad, permeabilidad de barrera hematoencefálica o afinidad de unión. El modelo se publicó en agosto de 2025 bajo licencia MIT y se acompaña de un artículo en el Journal of Cheminformatics.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa-base (6 capas transformer, 12 cabezas de atencion) |
| Parametros totales | 44.106.239 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (no especificada en la documentacion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (notacion quimica DeepSMILES, independiente del idioma natural) |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura RoBERTa con 6 capas transformer, 12 cabezas de atención y una dimensión oculta típica de la familia base, implementado como `RobertaForMaskedLM` sobre PyTorch y Hugging Face Transformers. La principal innovación técnica no reside en la arquitectura, sino en la representación de entrada: todas las moléculas se convierten de SMILES a DeepSMILES antes de la tokenización, lo que elimina la necesidad de dígitos explícitos de cierre de anillo y reduce la complejidad sintáctica que afecta a los modelos de lenguaje en notación química.

El entrenamiento se realizó sobre 100.000 moléculas de ZINC con un tokenizador BPE de vocabulario 767, ratio de enmascaramiento del 15 %, optimizador AdamW, batch size de 8 por dispositivo y aproximadamente 0,35 épocas de entrenamiento. La pérdida final de evaluación fue de 1,57. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación, ya que se trata de un modelo preentrenado de forma no supervisada con MLM.

## Capacidades

- Representación molecular no supervisada: codifica moléculas en embeddings contextuales que capturan información estructural y de subestructuras, utilizables como entrada para otros modelos.
- Fine-tuning para clasificación de propiedades: puede adaptarse con una cabeza de clasificación para tareas como predicción de toxicidad (Tox21, ToxCast), toxicidad cerebral (BBBP, B3DB) o afinidad de unión y bioactividad (BACE, HIV).
- Predicción de tokens enmascarados: permite predecir subestructuras faltantes o corruptas en cadenas DeepSMILES, útil para aumentar datos con perturbaciones químicamente válidas.
- Soporte de tool calling: no disponible; el modelo no expone interfaz de function calling.
- Capacidades de agente y razonamiento multi-paso: no aplica; es un modelo de codificación molecular, no un agente conversacional.
- Capacidades multilingües: no aplica en el sentido lingüístico; la notación DeepSMILES es un formalismo químico independiente del idioma.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Predicción de toxicidad en el descubrimiento de fármacos: el modelo se fine-tunea con una cabeza de clasificación sobre conjuntos como Tox21 o ToxCast para filtrar compuestos tóxicos en fases tempranas del pipeline de desarrollo, reduciendo costes de ensayos experimentales.
- Evaluación de permeabilidad de barrera hematoencefálica: fine-tuning sobre BBBP o B3DB para priorizar candidatos con capacidad de atravesar la barrera, un criterio crítico en fármacos de acción central.
- Predicción de afinidad de unión y bioactividad: adaptación sobre BACE o HIV para estimar la actividad de moléculas candidatas frente a dianas terapéuticas concretas.
- Extracción de embeddings moleculares para modelos downstream: se utilizan las representaciones de la capa oculta como características de entrada para modelos de regresión o clasificación externos, sin necesidad de fine-tuning completo.
- Aumento de datos con perturbaciones químicamente válidas: mediante la predicción de tokens enmascarados se generan variantes de moléculas que mantienen validez química, ampliando conjuntos de entrenamiento pequeños.
- Predicción de fragmentos moleculares en pipelines FBDD: el modelo se emplea para predecir fragmentos faltantes o recomendar subestructuras en estrategias de descubrimiento de fármacos basado en fragmentos, como se describe en el artículo asociado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona `roc_auc` como métrica, pero no se proporcionan valores concretos. El artículo en el Journal of Cheminformatics (DOI: 10.1186/s13321-026-01255-w) podría contener evaluaciones detalladas, pero no están disponibles en los materiales consultados.

## Requisitos de hardware

- VRAM estimada para inferencia: con 44,1 millones de parámetros, el modelo ocupa aproximadamente 176 MB en fp32 y 88 MB en fp16, por lo que cabe holgadamente en cualquier GPU consumer actual.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una NVIDIA GTX 1650 o superior permite inferencia sin problemas. Para fine-tuning con batch size 8, se recomienda al menos 8 GB de VRAM.
- Compatibilidad con GPU consumer: sí, es plenamente compatible con tarjetas de gama baja y media.
- Opciones de despliegue: al ser un modelo de Hugging Face Transformers, puede servirse con vLLM, TGI o directamente con la librería transformers en PyTorch. También se puede exportar a ONNX para inferencia optimizada.
- Latencia y throughput: no disponibles; al ser un modelo pequeño, se espera una latencia de milisegundos por lote en GPU modernas, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Representacion | Capas | Vocabulario | Licencia |
|---|---|---|---|---|---|
| DeepBERTa_zinc_base_100k_v4 | 44,1 M | DeepSMILES | 6 | 767 | MIT |
| ChemBERTa-zinc-base-100k-v1 | ~44 M (estimado) | SMILES | 6 | ~767 | MIT |
| MolBERT | ~100 M (estimado) | SMILES | 12 | no disponible | MIT |

La comparación directa es con ChemBERTa-zinc-base-100k-v1, del que DeepBERTa es un clon arquitectónico que sustituye SMILES por DeepSMILES. La ventaja de DeepSMILES es la simplificación sintáctica, que puede mejorar el aprendizaje de representaciones en tareas de fragmentos. No se dispone de datos de rendimiento comparativo publicados en la información consultada.

## Limitaciones y advertencias

- No apto para generación de novo de moléculas: al ser un modelo bidireccional con objetivo MLM, no puede generar secuencias de forma autorregresiva. Para generación se necesitan RNN/LSTM, VAE o modelos generativos específicos.
- No realiza predicción de propiedades de forma directa: carece de cabeza de clasificación; es imprescindible fine-tuning sobre conjuntos etiquetados para cualquier tarea de predicción.
- Requiere conversión SMILES a DeepSMILES: el modelo no acepta SMILES canónicos directamente; todo input debe preprocesarse, lo que añade un paso de transformación y posibles errores de conversión.
- Entrenamiento limitado: solo 100.000 moléculas y 0,35 épocas, lo que puede limitar la generalización a espacios químicos más amplios que los representados en ZINC.
- Sesgos del conjunto de datos: ZINC contiene principalmente moléculas drug-like comerciales y de catálogo, por lo que el modelo puede tener un rendimiento deficiente en química fuera de ese dominio.
- Riesgo de alucinación en predicción de fragmentos: las predicciones de tokens enmascarados pueden no ser químicamente válidas en todos los casos; se recomienda validación con herramientas de química computacional.
- Documentación incompleta: no se especifican la longitud de contexto, los tipos de cuantización soportados ni resultados de benchmarks detallados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aakothari/DeepBERTa_zinc_base_100k_v4
- Artículo en Journal of Cheminformatics: https://link.springer.com/article/10.1186/s13321-026-01255-w
- Material suplementario (PDF): https://media.springernature.com/original/springer-static/esm/art%3A10.1186%2Fs13321-026-01255-w/MediaObjects/13321_2026_1255_MOESM1_ESM.pdf
- Preprint en Research Square: https://www.researchsquare.com/article/rs-9614513/latest.pdf
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/aakothari/Conformer
