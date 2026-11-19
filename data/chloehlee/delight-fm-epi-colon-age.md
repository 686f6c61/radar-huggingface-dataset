# chloehlee/delight-fm-epi-colon-age

## Resumen

DELIGHT-FM Epi-colon Age es un modelo de regresión de edad desarrollado por chloehlee dentro de la familia DELIGHT-FM, orientada al análisis de expresión génica de célula única. Se trata de un checkpoint específico de tarea construido sobre el modelo fundacional `chloehlee/delight-fm-epi-colon`, que predice la edad de desarrollo de tejido de colon humano a partir de perfiles de expresión génica. La salida del modelo es un único valor escalar que representa log2(PCW) (edad posconcepcional en semanas), convertible a edad lineal mediante `2**predicción`.

El modelo emplea una arquitectura de tipo Mamba (tag `geneformer_mamba`) adaptada a datos de célula única, con 20.852.225 parámetros totales y una longitud de contexto de 2048 tokens génicos. Se distribuye en formato safetensors bajo licencia Apache 2.0, con código personalizado que requiere `trust_remote_code=True` en transformers. El repositorio ocupa aproximadamente 0,1 GB y no incluye los datos celulares originales.

Su relevancia radica en que combina un backbone fundacional preentrenado con supervisión auxiliar de edad y cabezas adversarias de lote/dominio, y añade una cabeza de regresión ajustada específicamente para la predicción de edad. Además, permite ejecutar perturbaciones de edad verificadas sobre el modelo, lo que lo hace útil para estudiar respuestas del modelo ante ediciones génicas controladas, siempre con la advertencia de que estas miden respuesta del modelo y no efectos causales experimentales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | geneformer_mamba (Mamba adaptada a tokens génicos) |
| Parametros totales | 20.852.225 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens génicos |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo biológico, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en un backbone fundacional de tipo Mamba aplicado a expresión génica de célula única, con 18.253 características génicas de referencia y una ventana de contexto de 2048 tokens. El preentrenamiento combina modelado enmascarado de genes con supervisión auxiliar de clúster celular, tipo celular amplio y escala de edad aprendida, además de cabezas adversarias de lote y dominio. Sobre este backbone se ajusta una cabeza de regresión separada para predecir log2(PCW), que es la que se distribuye en este checkpoint junto con el backbone fine-tuneado.

Los datos de entrenamiento declarados comprenden 85.035 células en el subconjunto de entrenamiento y 25.155 en validación/test. La época fundacional seleccionada es la 7.0. La selección del modelo maximizó la media de macro F1 de clúster, macro F1 de localización y correlación de Pearson de edad, excluyendo tareas explícitas de clase única. Los resultados son seleccionados sobre validación, y el subconjunto de test original participó en la selección, por lo que no constituye un benchmark externo intacto. Para nuevas tareas downstream se recomienda usar particiones train/validation/test disjuntas por donante.

## Capacidades

- Predicción de edad de desarrollo en tejido de colon humano a partir de expresión génica de célula única, con salida escalar en log2(PCW).
- Extracción de características (pipeline `feature-extraction`) y embeddings celulares a partir de tokens génicos y valores de expresión.
- Ejecución de perturbaciones de edad verificadas sobre el modelo, comparando predicciones y embeddings frente a una línea base inmutable.
- Procesamiento de entradas que combinan IDs de tokens génicos, expresión log-normalizada z-scored en float32 recortada a ±5 y máscaras HVG alineadas.
- Integración con transformers mediante `AutoModelForSequenceClassification` con `trust_remote_code=True`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo, por tratarse de un modelo biológico especializado.

## Casos de uso

- Predicción de edad de desarrollo en estudios de colon humano: el modelo recibe perfiles de expresión de célula única y devuelve log2(PCW), permitiendo estimar la edad del tejido sin reentrenar, siguiendo el notebook `01_predict_age.ipynb`.
- Análisis de perturbaciones génicas controladas: mediante ediciones firmadas en float32 (`float32_v2`), se puede medir cómo cambia la edad predicha ante modificaciones de expresión de genes objetivo, comparando contra una línea base fija.
- Estudio de maduración tisular en cohortes de donantes: al usar particiones disjuntas por donante, el modelo puede apoyar análisis de generalización de la señal de edad en muestras nuevas.
- Extracción de embeddings celulares para análisis exploratorio: el backbone permite obtener representaciones de células de colon para agruparlas o compararlas con otras poblaciones.
- Evaluación de hipótesis sobre regulones: el modelo puede usarse para observar la respuesta de la edad predicha ante cambios en la expresión de genes presentes en el vocabulario, siempre que la dirección de la edición esté justificada independientemente.
- Reutilización como punto de partida para nuevas tareas downstream: el notebook `01_finetune.ipynb` documenta el ajuste del compañero fundacional para una nueva tarea, y este checkpoint sirve como referencia de cabeza de regresión ya ajustada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la selección se basó en la media de macro F1 de clúster, macro F1 de localización y correlación de Pearson de edad, pero no se proporcionan los valores numéricos en la información disponible; estos se remiten a `metadata/selection.json`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 20,85 millones de parámetros, el peso en float32 ronda los 83 MB, por lo que la VRAM necesaria para los pesos es reducida, aunque el consumo real depende del backend y de las extensiones Mamba compiladas.
- GPU recomendadas: no disponible de forma explícita; los notebooks describen un stack probado de PyTorch/CUDA 11.8 con extensiones Mamba compiladas.
- Cabe en GPU consumer: probable por tamaño de parámetros, pero no confirmado en la información disponible.
- Opciones de despliegue: transformers con `trust_remote_code=True`; no se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles. La model card advierte que la ejecución completa en GPU y el entrenamiento no se validaron en el contenedor de preparación, que era solo CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chloehlee/delight-fm-epi-colon-age | 20.852.225 | 2048 | Regresión de edad (log2 PCW) en colon | Apache 2.0 | Hugging Face |
| chloehlee/delight-fm-epi-colon | no disponible | 2048 | Fundacional de colon, cabezas amplias | Apache 2.0 | Hugging Face |
| chloehlee/delight-fm-epi-ileum-age | no disponible | 2048 | Regresión de edad en íleon | Apache 2.0 | Hugging Face |
| chloehlee/delight-fm-stromal-age | no disponible | 2048 | Regresión de edad en estroma | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- Las perturbaciones miden la respuesta del modelo, no efectos causales establecidos experimentalmente.
- Las ediciones firmadas reconstruyen la abundancia de forma aproximada tras el recorte de z-scores, cambian solo tokens objetivo presentes y requieren definiciones de dirección justificadas de forma independiente; los nombres de regulones por sí solos no especifican la dirección del cambio de expresión.
- Los resultados son seleccionados sobre validación y el subconjunto de test original participó en la selección, por lo que no constituyen un benchmark externo intacto.
- No se distribuyen datos celulares originales, identificadores de donantes ni predicciones de referencia.
- Se requiere tokenización y estadísticas génicas de referencia específicas de `resources/`; la tokenización genérica de Geneformer no es intercambiable.
- Los rangos empatados en el sistema inmune pueden depender del despacho NumPy AVX512; se recomienda conservar las entradas tokenizadas entre workers.
- El modelo requiere `trust_remote_code=True`; conviene revisar el código personalizado y fijar un SHA de commit publicado para reproducibilidad.
- No debe sustituirse el backbone fundacional ni reajustarse la cabeza de edad entre trabajos de perturbación.
- La ejecución completa en GPU y el entrenamiento no se validaron en el contenedor de preparación solo CPU.
- No se documentan sesgos conocidos, riesgos de alucinación ni limitaciones idiomáticas en la información disponible, al no ser un modelo lingüístico.
- La licencia Apache 2.0 permite uso comercial, pero deben respetarse las condiciones de los datos de entrada y las referencias al modelo base.

## Enlaces

- [Hugging Face: chloehlee/delight-fm-epi-colon-age](https://huggingface.co/chloehlee/delight-fm-epi-colon-age)
- [Modelo base: chloehlee/delight-fm-epi-colon](https://huggingface.co/chloehlee/delight-fm-epi-colon)
- [DELIGHT-FM fundacional](https://huggingface.co/chloehlee/delight-fm)
- [DELIGHT-FM Epi-ileum](https://huggingface.co/chloehlee/delight-fm-epi-ileum)
- [DELIGHT-FM Epi-ileum Age](https://huggingface.co/chloehlee/delight-fm-epi-ileum-age)
- [DELIGHT-FM Stromal](https://huggingface.co/chloehlee/delight-fm-stromal)
- [DELIGHT-FM Stromal Age](https://huggingface.co/chloehlee/delight-fm-stromal-age)
- [DELIGHT-FM Immune](https://huggingface.co/chloehlee/delight-fm-immune)
- [DELIGHT-FM Immune Age](https://huggingface.co/chloehlee/delight-fm-immune-age)
- [Notebook de predicción de edad](notebooks/01_predict_age.ipynb)
- [Notebook de perturbaciones verificadas](https://huggingface.co/chloehlee/delight-fm-epi-colon/blob/main/notebooks/02_verified_perturbations.ipynb)
- [Notebook de fine-tuning](https://huggingface.co/chloehlee/delight-fm-epi-colon/blob/main/notebooks/01_finetune.ipynb)
- [Perfil del autor](https://huggingface.co/chloehlee)
