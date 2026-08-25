# fetle/amh-orm-nmt

## Resumen

`is/amh-orm-nmt` es un adaptador PEFT (LoRA) desarrollado sobre el modelo base `facebook/nllb-200-distilled-600M`, un modelo de traducción automática neuronal multilingüe de la familia NLLB-200 de Meta. El nombre del repositorio y la referencia al artículo arXiv 2412.17837 sugieren que el adaptador está orientado a la traducción automática entre el amárico (amh) y el oromo (orm), dos lenguas etíopes de bajos recursos. El repositorio contiene únicamente los pesos del adaptador, no los pesos completos del modelo, y su tamaño es de 0.0 GB, lo que indica que se trata de una actualización ligera sobre el modelo base.

La relevancia de este adaptador radica en su contribución a la traducción automática para lenguas africanas de bajos recursos, un área de investigación activa que busca reducir la brecha de rendimiento con respecto a las lenguas de altos recursos. La falta de documentación detallada en la model card, sin embargo, limita la capacidad de evaluar su rendimiento y su alcance exacto. La información disponible es insuficiente para confirmar si el modelo ha sido evaluado en benchmarks públicos o si está listo para uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA) sobre transformer encoder-decoder (NLLB-200 distilled 600M) |
| Parámetros totales | no disponible (el adaptador es una fracción de los 600M del modelo base) |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, probablemente 512 tokens) |
| Tipos de cuantización | no disponible (el adaptador se distribuye en safetensors, el modelo base admite cuantización estándar) |
| Idiomas soportados | amhárico (amh) y oromo (orm) según el nombre del repositorio y el artículo arXiv; no hay lista oficial |
| Licencia | no disponible (el modelo base NLLB-200 distilled 600M está bajo CC-BY-NC-4.0, pero no se indica para este adaptador) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `facebook/nllb-200-distilled-600M`, un transformer encoder-decoder con 600 millones de parámetros, entrenado para traducción multilingüe en más de 200 idiomas. El adaptador se ha ajustado mediante PEFT (Parameter-Efficient Fine-Tuning), probablemente con LoRA, lo que significa que solo se actualizan un pequeño subconjunto de parámetros (matrices de baja dimensión) mientras que los pesos del modelo base permanecen congelados. Esta técnica permite adaptar el modelo a un par de idiomas específico con un coste computacional reducido y un tamaño de modelo final muy pequeño.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens utilizados ni el procedimiento exacto (preprocesamiento, hiperparámetros, régimen de entrenamiento). La referencia al artículo arXiv 2412.17837, que menciona la adaptación de modelos para lenguas etíopes (amh y orm), sugiere que el adaptador puede haber sido entrenado con datos de ese trabajo, pero no se confirma en la model card.

## Capacidades

- Traducción automática entre amhá (amh) y or (orm), según el nombre del repositorio y la referencia al artículo arXiv. No hay información sobre la dirección de traducción (solo amh→orm, orm→amh o bidireccional).
- No se documentan capacidades adicionales como generación de código, razonamiento, tool calling o soporte de agentes.
- El modelo base NLLB-200 distinta 600M es multilingüe y admite más de 200 idiomas, pero el adaptador específico no indica qué idiomas adicionales conserva o modifica.
- No se menciona soporte para modos de pensamiento, visión o audio.

## Casos de uso

- Traducción automática de textos en amhá a orormo y viceversa: el adaptador puede integrarse en pipelines de traducción para contenido digital, documentación técnica o comunicación intercultural en la región del Cuerno de África.
- Localización de aplicaciones y sitios web: dado que el modelo base es multilingüe, el adaptador puede servir para añadir soporte de traducción amh↔orm a sistemas de gestión de contenidos.
- Investigación académica en PLN de lenguas africanas: el adaptador puede ser utilizado como punto de partida para experimentos de transferencia de aprendizaje o para evaluar la eficacia de técnicas PEFT en lenguas de bajos recursos.
- Procesamiento de datos lingüísticos en corpus paralelos: puede emplearse para alinear o traducir corpus etíopes en tareas de minería de textos o análisis de sentimiento.
- Sistemas de ayuda humanitaria y ONG: traducción de información médica, legal o educativa entre amhá y ororm para poblaciones desplazadas en Etiopía.
- Chatbots y asistentes multilingües: integración en sistemas de atención al cliente que requieran respuesta en amhá o ororm, aunque la falta de datos de evaluación limita su fiabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de puntuaciones de MMLU, HumanEval, GSM8K o métricas de traducción (BLEU, COMET) para este adaptador. La ausencia de datos de evaluación impide comparar su rendimiento con el de otros adaptadores de NLLB o modelos específicos para lenguas etíopes.

## Requisitos de hardware

- VRAM estimada: no disponible, pero al tratarse de un adaptador sobre un modelo base de 600M, la inferencia requiere cargar el modelo base completo (alrededor de 2.4 GB en FP32, menos con cuantización) más los pesos del adaptador.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia en FP16 (por ejemplo, NVIDIA T4, RTX 3060, RTX 4090). En cuantización INT8 o INT4, puede caber en GPUs de 2 GB.
- Compatibilidad con GPUs de consumo: sí, es viable en GPUs de consumo (RTX 3060 o superior) si se usa cuantización.
- Opciones de despliegue: al ser un adaptador PEFT, se puede integrar con librerías como Transformers, PEFT, vLLM, o a través de servicios de inferencia como Hugging Face Inference Endpoints. El modelo base admite despliegue con TGI o llama.cpp si se convierte a GGUF.
- Latencia y throughput estimados: no disponibles. Para un modelo de 600M, la latencia de inferencia es del orden de decenas de milisegundos por secuencia en GPU moderna, pero no hay datos específicos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| `fetle/amh-orm-nmt` | Adaptador sobre NLLB-200 distilled 600M | no disponible | amh, orm (inferido) | no disponible | safetensors (PEFT) |
| `facebook/nllb-200-distilled-600M` | 600M | 512 | 200+ | CC-BY-NC-4.0 | safetensors |
| `AfroXLMR` (adaptación de XLM-R) | 560M | 512 | 61 o 76 idiomas africanos, incl. amh y orm | no disponible | safetensors |
| `nllb-200-distilled-1.3B` | 1.3B | 512 | 200+ | CC-BY-NC-4.0 | safetensors |

No se dispone de información suficiente para comparar el rendimiento real de este adaptador con los modelos alternativos. La comparativa se basa en características técnicas de los modelos base.

## Limitaciones y advertencias

- La model card está prácticamente vacía: no se detalla el proceso de entrenamiento, los datos, las métricas ni las limitaciones específicas. Esto dificulta la evaluación de su calidad y su uso en producción.
- El tamaño del repositorio es de 0.0 GB, lo que indica que solo se distribuye el adaptador. Para usarlo, es necesario descargar y cargar el modelo base `facebook/nllb-200-distilled-600M`, lo que puede suponer un inconveniente si no se tiene acceso a él.
- No se ha especificado la licencia del adaptador. El modelo base NLLB-200 tiene licencia CC-BY-NC-4.0, que restringe el uso comercial. Es probable que el adaptador herede esta restricción, pero no se confirma.
- No se han publicado resultados de evaluación, por lo que no se pueden conocer los sesgos, la tasa de alucinación o la calidad de la traducción en dominios específicos.
- Los idiomas soportados no están confirmados oficialmente; el nombre del repositorio y el paper arXiv sugieren amh y orm, pero no hay lista oficial de idiomas.
- No se recomienda su uso en producción sin una evaluación previa en el dominio de destino.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fetle/amh-orm-nmt
- Modelo base: https://huggingface.co/facebook/nllb-200-distilled-600M
- Artículo arXiv 2412.17837 (referencia a lenguas etíopes): https://arxiv.org/pdf/2412.17837v2
- OpenNMT (ecosistema de traducción automática): https://opennmt.net/
