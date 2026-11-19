# chloehlee/delight-fm-epi-colon

## Resumen

DELIGHT-FM Epi-colon es un modelo fundacional de extracción de características para datos de expresión génica de célula única (scRNA-seq), entrenado específicamente sobre tejido epitelial de colon humano. Lo publica chloehlee como parte de la familia DELIGHT-FM, que incluye variantes por compartimento tisular (íleon, estroma, inmune) y checkpoints complementarios para tareas de edad. El modelo resuelve el problema de obtener representaciones densas y transferibles de perfiles transcriptómicos celulares sin necesidad de reentrenar desde cero para cada tarea downstream (clasificación celular, regresión de edad, análisis de perturbaciones).

La arquitectura se etiqueta como `geneformer_mamba`: una combinación de tokenización estilo Geneformer (genes como tokens discretos con valores de expresión asociados) y capas de espacio de estados tipo Mamba, lo que permite modelar secuencias de hasta 2048 tokens génicos con coste de atención lineal. El checkpoint tiene 33.919.573 parámetros y fue entrenado sobre 85.035 células con validación/test de 25.155 células, usando 18.253 genes de referencia como vocabulario.

Es relevante ahora porque los modelos fundacionales de biología celular se están consolidando como infraestructura para descubrimiento de fármacos y biología computacional, y este checkpoint exporta todas las cabezas auxiliares de preentrenamiento (masked gene modeling, clasificación de clúster y tipo celular amplio, supervisión de escala de edad y cabezas adversarias de lote/dominio), lo que facilita el fine-tuning sobre nuevas cohortes sin perder las representaciones aprendidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | geneformer_mamba (tokenizacion estilo Geneformer + capas de espacio de estados Mamba) |
| Parametros totales | 33.919.573 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens genicos |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (no aplica: entrada es expresion genica, no texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo sigue un paradigma de modelado de secuencias génicas: cada célula se representa como una secuencia de hasta 2048 tokens (genes de referencia) acompañados de valores float32 de expresión log-normalizada y z-scored, recortados a ±5, junto con máscaras alineadas de genes altamente variables (HVG). Sobre esa secuencia se aplica un backbone con capas de espacio de estados tipo Mamba, que ofrece escalado lineal en la longitud de contexto en lugar de la atención cuadrática de un transformer clásico. El vocabulario de referencia consta de 18.253 genes.

El preentrenamiento combina varias señales: modelado de genes enmascarados (masked gene modeling), supervisión auxiliar de clúster celular y tipo celular amplio, una supervisión aprendida de escala de edad, y cabezas adversarias de lote y dominio para mitigar el efecto de batch en datos multi-cohorte. Se entrenó sobre 85.035 células (subconjunto de entrenamiento) con 25.155 células de validación/test, seleccionando el epoch 7.0 del modelo fundacional. La selección maximizó la media de macro F1 de clúster, macro F1 de localización y correlación de Pearson de edad, excluyendo tareas de clase única. Cabe señalar que el subconjunto de test original participó en la selección del modelo, por lo que no constituye un benchmark externo intacto.

## Capacidades

- Extracción de embeddings de células a partir de perfiles scRNA-seq, como tarea principal (`feature-extraction`).
- Modelado de genes enmascarados y cabezas auxiliares de preentrenamiento preservadas en el export.
- Clasificación y regresión downstream sobre nuevas tareas celulares mediante fine-tuning (se transfieren todos los tensores del backbone).
- Supervisión de escala de edad aprendida en el checkpoint fundacional (no calibrada como log2(PCW); para eso existe el companion `delight-fm-epi-colon-age`).
- Análisis de perturbaciones génicas verificadas mediante ediciones firmadas sobre tokens presentes (tutorial incluido en el repo).
- Cabezas adversarias de lote y dominio para representaciones más robustas a variación técnica entre cohortes.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (la entrada no es texto natural).
- Capacidades especiales: modo thinking, visión o audio: no disponibles.

## Casos de uso

- Anotación de tipos celulares en epitelio de colon: usar los embeddings del modelo como entrada a un clasificador ligero entrenado con anotaciones de una cohorte propia, aprovechando que el backbone ya captura estructura transcripcional del tejido.
- Predicción de edad biológica en muestras de colon: fine-tuning de una cabeza de regresión sobre las representaciones del modelo, o uso directo del companion `delight-fm-epi-colon-age` para log2(PCW) calibrado.
- Análisis de perturbaciones génicas in silico: emplear los tutoriales de perturbaciones verificadas para medir la respuesta del modelo ante ediciones firmadas de genes diana y comparar predicciones y embeddings contra una línea base inmutable.
- Integración de cohortes multi-estudio: las cabezas adversarias de lote/dominio permiten obtener representaciones menos sensibles a la variación técnica entre laboratorios, útil en meta-análisis de scRNA-seq.
- Selección de genes y priorización de dianas: los embeddings celulares y la estructura del modelo pueden alimentar pipelines de descubrimiento que buscan genes cuya edición desplace la representación celular hacia un fenotipo deseado.
- Detección de estados celulares anómalos o subtipos epiteliales: extracción de features para clustering no supervisado y detección de subpoblaciones en datos de colon, con particiones train/validation/test disjuntas por donante.
- Reproducibilidad de experimentos: fijar un commit SHA con `revision=...` y reutilizar los recursos de tokenización y estadísticas génicas de `resources/` para garantizar resultados idénticos entre ejecuciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card solo indica que la selección del checkpoint maximizó la media de macro F1 de clúster, macro F1 de localización y correlación de Pearson de edad, con los valores por componente en `metadata/selection.json`, pero no se detallan cifras en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint tiene 33,9 millones de parámetros; en float32 ocupa aproximadamente 136 MB de pesos, más overhead de activaciones y contexto de 2048 tokens. En la práctica, cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU con soporte CUDA 11.8 y extensiones Mamba compiladas; RTX 3090, RTX 4090, A100 o H100 son más que suficientes. El cuello de botella es la compilación de las extensiones Mamba, no la VRAM.
- Cabe en GPU consumer: sí, en todas las GPU modernas con al menos ~4 GB de VRAM.
- Opciones de despliegue: `transformers` con `AutoModel.from_pretrained(..., trust_remote_code=True)`; el repo exige Python 3.10, pila PyTorch/CUDA 11.8 y extensiones Mamba compiladas según `requirements.txt`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible. La model card indica que la ejecución completa en GPU y el entrenamiento no se validaron en el contenedor de preparación (solo CPU).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DELIGHT-FM Epi-colon | 33,9 M | 2048 tokens genicos | Embeddings scRNA-seq de epitelio de colon | Apache 2.0 | Hugging Face (`chloehlee/delight-fm-epi-colon`) |
| DELIGHT-FM Epi-ileum | no disponible en la informacion | 2048 tokens genicos | Embeddings scRNA-seq de epitelio de ileon | Apache 2.0 | Hugging Face (`chloehlee/delight-fm-epi-ileum`) |
| DELIGHT-FM Stromal | no disponible en la informacion | 2048 tokens genicos | Embeddings scRNA-seq de estroma | Apache 2.0 | Hugging Face (`chloehlee/delight-fm-stromal`) |
| DELIGHT-FM Immune | no disponible en la informacion | 2048 tokens genicos | Embeddings scRNA-seq de compartimento inmune | Apache 2.0 | Hugging Face (`chloehlee/delight-fm-immune`) |

No se dispone en la informacion proporcionada de datos de rendimiento comparativo entre estas variantes ni frente a otros modelos fundacionales de scRNA-seq (por ejemplo, Geneformer o scGPT), por lo que la comparativa se limita a la estructura de la familia DELIGHT-FM.

## Limitaciones y advertencias

- El subconjunto de test original participó en la selección del modelo; no es un benchmark externo intacto. Las métricas de selección son resultados validados internamente y deben interpretarse con cautela.
- El checkpoint fundacional no incluye la cabeza de regresión final de log2(PCW); su puntuación auxiliar de PCW es una escala de meseta aprendida, no calibrada. Para predicción de edad calibrada hay que usar el companion `delight-fm-epi-colon-age`.
- Las perturbaciones miden la respuesta del modelo, no efectos causales establecidos experimentalmente. Las ediciones firmadas requieren definiciones de diana justificadas de forma independiente; los nombres de regulones por sí solos no especifican la dirección del cambio de expresión.
- La tokenización genérica de Geneformer no es intercambiable: es obligatorio usar los ficheros de tokenización y estadísticas génicas de referencia en `resources/`. Los rangos empatados en el compartimento inmune pueden depender del despacho AVX512 de NumPy.
- Se requiere tejido humano emparejado con expresión scRNA-seq; las células originales del estudio no se distribuyen y no se incluyen identificadores de donante ni predicciones de línea base.
- La model card advierte revisar el código Python personalizado antes de habilitar `trust_remote_code=True` y fijar un commit SHA con `revision=...` para reproducibilidad.
- La licencia Apache 2.0 cubre código y pesos de la release, pero los activos de referencia y dependencias mantienen sus términos originales (ver `docs/THIRD_PARTY_NOTICES.md`).
- No se documentan sesgos demográficos ni de otro tipo en la información disponible; el modelo no procesa texto natural, por lo que los riesgos de alucinación lingüística no aplican, pero sí existe riesgo de extrapolación indebida fuera del dominio epitelial de colon.
- La ejecución completa en GPU y el entrenamiento no se validaron en el contenedor de preparación (solo CPU); la compilación de extensiones Mamba es un requisito operativo sensible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chloehlee/delight-fm-epi-colon
- Companion de edad: https://huggingface.co/chloehlee/delight-fm-epi-colon-age
- Modelo fundacional base: https://huggingface.co/chloehlee/delight-fm
- Variante Epi-ileum: https://huggingface.co/chloehlee/delight-fm-epi-ileum
- Variante Stromal: https://huggingface.co/chloehlee/delight-fm-stromal
- Variante Immune: https://huggingface.co/chloehlee/delight-fm-immune
- Repositorio de codigo y workflows: https://github.com/ChloeHJ/delight_fm_v1
- Dataset de soporte: https://huggingface.co/datasets/chloehlee/delight_fm_v1-data
- Perfil del autor: https://huggingface.co/chloehlee
