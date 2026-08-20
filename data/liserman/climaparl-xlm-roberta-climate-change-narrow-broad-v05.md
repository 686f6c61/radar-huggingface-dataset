# liserman/climaparl-xlm-roberta-climate-change-narrow-broad-v05

## Resumen

ClimaParl es un modelo de clasificación de texto multilingüe desarrollado por Lukas Isermann (usuario `liserman`) que detecta y clasifica referencias al cambio climático en discursos parlamentarios. Se trata de un fine-tuning de XLM-RoBERTa, un transformer encoder multilingüe de 278 millones de parámetros entrenado originalmente sobre 2,5 TB de datos de CommonCrawl en 100 idiomas. El modelo distingue entre referencias estrechas (*narrow*) y amplias (*broad*) al cambio climático, lo que permite un análisis más matizado del discurso político que una simple detección binaria.

La relevancia de este modelo radica en su aplicación a la ciencia política y al análisis de políticas climáticas: está entrenado con discursos parlamentarios anotados manualmente procedentes de 27 países europeos (UE + Reino Unido), lo que lo convierte en una herramienta específica para investigación comparada transnacional. Su ventana de contexto es de 512 tokens, heredada de XLM-RoBERTa, y su tamaño compacto permite ejecutarlo en hardware de consumo. El repositorio se publicó en agosto de 2026 y, hasta la fecha, no registra descargas ni valoraciones en HuggingFace.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (transformer encoder, 12 capas, 768 dimensiones ocultas, 12 cabezas de atención) |
| Parametros totales | 278.045.186 |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (repositorio en safetensors, presumiblemente fp32) |
| Idiomas soportados | no disponible (XLM-RoBERTa base soporta 100 idiomas; el fine-tuning cubre discursos de 27 países europeos) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de XLM-RoBERTa base, un transformer encoder entrenado con objetivos de enmascaramiento de lenguaje (masked language modeling) sobre 2,5 TB de texto filtrado de CommonCrawl en 100 idiomas. Sobre esta base, el autor realizó un fine-tuning para clasificación de secuencias (text-classification) con el objetivo de identificar contenido específico sobre cambio climático en discursos parlamentarios. El clasificador resultante distingue entre referencias *narrow* (menciones directas y explícitas al cambio climático) y *broad* (referencias más amplias o indirectas a la política climática).

Los datos de entrenamiento consisten en discursos parlamentarios anotados manualmente de 27 países europeos (UE + Reino Unido). El número exacto de oraciones de entrenamiento para esta versión concreta (v05) no se especifica en la documentación disponible; un modelo relacionado del mismo autor (`xml-roberta-climate-change-implicit-v02`) utilizó 5.450 oraciones, pero no se puede confirmar que esta versión use el mismo conjunto. No se detalla si se aplicaron técnicas de RLHF, DPO o algún procedimiento de alineación adicional, ni se especifican los hiperparámetros de entrenamiento.

## Capacidades

- Clasificación de texto multilingüe: detecta menciones al cambio climático en discursos parlamentarios en múltiples idiomas europeos.
- Distinción narrow/broad: diferencia entre referencias directas al cambio climático y referencias más amplias a políticas o temas relacionados.
- Análisis de discurso político: orientado específicamente a textos parlamentarios, no a texto general.
- Compatible con HuggingFace Inference Endpoints y text-embeddings-inference, según las etiquetas del repositorio.
- Inferencia eficiente: al ser un modelo de 278M de parámetros, puede ejecutarse en GPU de consumo o incluso en CPU.

## Casos de uso

- Investigación en ciencia política comparada: analizar cómo distintos parlamentos europeos abordan el cambio climático, comparando la frecuencia y el tipo de referencias (narrow vs broad) entre países.
- Monitoreo de políticas climáticas: seguir la evolución del discurso parlamentario sobre clima a lo largo del tiempo, identificando cuándo se producen menciones directas frente a referencias indirectas.
- Análisis de contenido mediático y político: aplicar el modelo a transcripciones de debates, entrevistas o documentos oficiales para clasificar el grado de compromiso climático de actores políticos.
- Estudios de framing climático: distinguir entre discursos que abordan el clima de forma explícita (narrow) y aquellos que lo integran en marcos más amplios como energía, economía o seguridad (broad).
- Pipeline de análisis de grandes corpus: integrar el modelo en flujos de procesamiento de texto con HuggingFace Transformers para clasificar miles de discursos de forma automatizada.
- Despliegue en entornos con recursos limitados: al ser un modelo compacto, puede ejecutarse en infraestructura modesta (CPU o GPU de gama baja) para proyectos de investigación con presupuesto reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación (precisión, recall, F1) ni comparaciones con otros modelos de clasificación climática. Tampoco se dispone de datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,1 GB para los pesos en fp32 (278M parámetros × 4 bytes), más overhead de activaciones y atención, lo que sitúa el requisito total en torno a 2-3 GB de VRAM.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente. Una NVIDIA GTX 1650, RTX 3060 o superior ejecuta el modelo sin problemas. También es viable en Apple Silicon (M1/M2) y en CPUs modernas.
- Compatibilidad con hardware de consumo: sí, es un modelo ligero que cabe en cualquier GPU consumer actual.
- Opciones de despliegue: HuggingFace Transformers, HuggingFace Inference Endpoints (etiquetado como `endpoints_compatible`), text-embeddings-inference, ONNX Runtime. No se ha confirmado compatibilidad con vLLM, llama.cpp u Ollama, aunque al ser un modelo transformer estándar podría adaptarse.
- Latencia y throughput: no disponible. Al ser un encoder de 278M parámetros, la inferencia en GPU es del orden de milisegundos por secuencia, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `climaparl-xlm-roberta-climate-change-narrow-broad-v05` (este modelo) | 278M | 512 tokens | Clasificación narrow/broad de referencias climáticas | No disponible | HuggingFace |
| `liserman/xml-roberta-climate-change-implicit-v02` | 278M | 512 tokens | Detección de menciones explícitas e implícitas al cambio climático | No disponible | HuggingFace |
| XLM-RoBERTa base | 278M | 512 tokens | Modelo de lenguaje multilingüe (base para fine-tuning) | MIT | HuggingFace, transformers |

El modelo comparte arquitectura y tamaño con XLM-RoBERTa base y con el otro fine-tuning del mismo autor. La diferencia principal es la tarea específica: este modelo clasifica en narrow/broad, mientras que el v02 detecta explícito/implícito. No se dispone de datos de rendimiento comparativo entre ambos.

## Limitaciones y advertencias

- Sesgos geográficos: el entrenamiento se limita a discursos parlamentarios de 27 países europeos, por lo que el modelo puede no generalizar bien a textos políticos de otras regiones o contextos culturales.
- Sesgos de dominio: está especializado en discurso parlamentario; su rendimiento en otros géneros textuales (noticias, redes sociales, documentos técnicos) no está garantizado.
- Riesgo de alucinación: como todo modelo de clasificación, puede producir falsos positivos o negativos, especialmente en textos ambiguos o con referencias indirectas al clima.
- Contexto limitado: la ventana de 512 tokens impide analizar discursos completos de una sola vez; es necesario segmentar textos largos, lo que puede perder coherencia contextual.
- Licencia no especificada: no se indica la licencia del modelo, lo que genera incertidumbre sobre su uso comercial o la redistribución de los pesos.
- Documentación incompleta: la model card es una plantilla autogenerada sin información sobre hiperparámetros, datos exactos de entrenamiento, métricas de evaluación o procedencia del conjunto de datos.
- Sin datos de rendimiento: no hay benchmarks publicados, por lo que no es posible evaluar objetivamente su calidad frente a alternativas.
- Modelo sin adopción: cero descargas y cero valoraciones en HuggingFace, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/liserman/climaparl-xlm-roberta-climate-change-narrow-broad-v05
- Página del proyecto ClimaParl: https://lukasisermann.com/project/climaparl/
- Modelo relacionado (implicit-v02): https://huggingface.co/liserman/xml-roberta-climate-change-implicit-v02
- Documentación de XLM-RoBERTa en Transformers: https://huggingface.co/docs/transformers/model_doc/xlm-roberta
- Sitio web del autor: https://lukasisermann.com/index.xml
- Paper de referencia de XLM-RoBERTa (arXiv:1911.02116): no disponible en la información proporcionada; la etiqueta arXiv:1910.09700 del repositorio corresponde al artículo de Lacoste et al. sobre cálculo de emisiones de carbono en ML, no al paper del modelo.
