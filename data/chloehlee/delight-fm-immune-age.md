# chloehlee/delight-fm-immune-age

## Resumen

DELIGHT-FM Immune Age es un modelo de regresión de edad biológica para células inmunes de tejido linfoide, desarrollado por el usuario chloehlee dentro de la familia DELIGHT-FM. Se trata de un modelo de extracción de características basado en la arquitectura Geneformer-Mamba, afinado sobre el checkpoint base `chloehlee/delight-fm-immune` con una cabeza de regresión lineal que predice `log2(PCW)` (logaritmo en base 2 de las semanas postconcepción). El modelo resuelve un problema concreto: estimar la edad de desarrollo de una célula a partir de su perfil de expresión génica de célula única (scRNA-seq), y permitir experimentos de perturbación de edad verificables sobre ese mismo checkpoint.

El modelo tiene 8.787.713 parámetros totales (dato real de safetensors), una longitud de contexto de 2.048 tokens génicos y una ventana de referencia de 18.253 genes. Se distribuye como un checkpoint de `transformers` con código personalizado (`trust_remote_code=True`), pesos en safetensors y licencia Apache 2.0. Su relevancia radica en que combina un backbone de estado del espacio (Mamba) con supervisión auxiliar de edad durante el preentrenamiento, y expone tanto la predicción de edad como la respuesta a perturbaciones génicas firmadas, algo poco habitual en modelos de célula única.

Es un modelo de nicho, sin descargas ni interacciones en el momento de la ficha, pensado para investigadores en biología computacional que trabajen con datos de tejido inmune humano y necesiten un punto de partida reproducible para tareas de envejecimiento y desarrollo celular.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Geneformer-Mamba (transformer/Mamba híbrido según tags; backbone de estado del espacio) |
| Parametros totales | 8.787.713 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens génicos |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible (modelo biológico, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El backbone pertenece a la familia Geneformer-Mamba, un modelo de secuencia de genes que procesa tokens génicos en lugar de tokens de texto. La entrada combina identificadores de gen, expresión log-normalizada y z-scoreada por gen en float32 (recortada a ±5) y máscaras HVG alineadas. El preentrenamiento del modelo base combina modelado enmascarado de genes con supervisión auxiliar de clúster celular, tipo celular amplio y escala de edad aprendida, además de cabezas adversarias de lote y dominio; todas las cabezas se conservan en la exportación del foundation model.

Este checkpoint concreto añade una cabeza de regresión ajustada por separado que produce una única salida: `log2(PCW)`. El entrenamiento se realizó sobre un subconjunto de 175.031 células, con 36.586 células de validación/test, y la selección del checkpoint (época 3.5 del foundation) maximizó la media de macro F1 de clúster, macro F1 de localización y correlación de Pearson de edad, excluyendo tareas de clase única. La conversión de la predicción a semanas postconcepción se hace con `2**prediccion` sin restar uno. El autor advierte que los resultados son seleccionados sobre validación y que el subconjunto de test original participó en la selección, por lo que no constituye un benchmark externo intacto.

## Capacidades

- Predicción de edad de desarrollo celular: regresión de `log2(PCW)` a partir de perfiles de expresión génica de célula única.
- Extracción de características: pipeline `feature-extraction` sobre tokens génicos, útil para embeddings celulares.
- Perturbaciones de edad verificables: edición de tokens objetivo presentes con deltas firmados, comparando predicciones y embeddings frente a una línea base inmutable.
- Procesamiento de contexto génico largo: ventana de 2.048 tokens con 18.253 genes de referencia.
- Integración con `transformers` mediante `AutoModelForSequenceClassification` y `trust_remote_code=True`.
- No soporta tool calling, agentes, visión, audio ni capacidades multilingües: es un modelo biológico, no conversacional.

## Casos de uso

- Predicción de edad en estudios de envejecimiento inmune: cargar el checkpoint y aplicar `2**prediccion` para obtener semanas postconcepción por célula, sin reentrenar, usando los recursos de tokenización y estadísticas de referencia de `resources/`.
- Análisis de trayectorias de desarrollo en tejido linfoide: comparar edades predichas entre subpoblaciones inmunes para detectar desviaciones de maduración respecto a la edad cronológica del donante.
- Experimentos de perturbación génica in silico: editar tokens de genes objetivo con deltas firmados y medir el cambio en edad predicha, como cribado exploratorio de reguladores del envejecimiento inmune.
- Validación de hipótesis en biología computacional: usar el modelo como referencia reproducible (SHA de commit fijado) para contrastar resultados entre ejecuciones y trabajadores.
- Generación de embeddings celulares para clustering y clasificación downstream: aprovechar la salida del backbone para tareas de anotación celular.
- Reproducción de pipelines de investigación: los notebooks publicados permiten replicar predicción, perturbación y fine-tuning con entornos y versiones fijados (Python 3.10, CUDA 11.8, extensiones Mamba compiladas).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que los valores de selección (macro F1 de clúster, macro F1 de localización y Pearson de edad) están en `metadata/selection.json`, pero no se incluyen cifras en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada; con 8,79 M de parámetros, el peso en float32 ronda los 35 MB, pero los requisitos reales dependen de las extensiones Mamba compiladas y del tamaño de lote.
- GPU recomendadas: no disponible; el autor valida el stack PyTorch/CUDA 11.8 con extensiones Mamba compiladas, sin especificar modelos de GPU.
- GPU de consumo: no confirmado; por tamaño de parámetros cabría en cualquier GPU moderna, pero la compilación de Mamba y el procesamiento de 2.048 tokens por célula condicionan el uso práctico.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este dominio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DELIGHT-FM Immune Age | 8.787.713 | 2.048 tokens génicos | Regresión de edad inmune | Apache 2.0 | Hugging Face |
| DELIGHT-FM Epi-ileum Age | no disponible | no disponible | Regresión de edad en íleon | Apache 2.0 | Hugging Face |
| DELIGHT-FM Epi-colon Age | no disponible | no disponible | Regresión de edad en colon | Apache 2.0 | Hugging Face |
| DELIGHT-FM Stromal Age | no disponible | no disponible | Regresión de edad estromal | Apache 2.0 | Hugging Face |

Las alternativas directas son los companions de edad de la misma familia, específicos por tejido; no se dispone de datos de rendimiento comparativo entre ellos en la información proporcionada.

## Limitaciones y advertencias

- Requiere datos de scRNA-seq humano emparejados por tejido; las células originales del estudio no se distribuyen.
- La tokenización genérica de Geneformer no es intercambiable: hay que usar los archivos de `resources/` del repositorio.
- Los rangos empatados en tejido inmune pueden depender del despacho AVX512 de NumPy; se recomienda conservar las entradas tokenizadas entre trabajadores.
- Los resultados son seleccionados sobre validación y el test original participó en la selección: no es un benchmark externo intacto.
- Las perturbaciones miden la respuesta del modelo, no efectos causales establecidos experimentalmente.
- Las ediciones firmadas requieren definiciones de objetivo justificadas de forma independiente; los nombres de regulones no indican la dirección del cambio de expresión.
- No se incluyen datasets celulares originales, identificadores de donante ni predicciones de línea base.
- El código personalizado exige revisión antes de habilitar `trust_remote_code`; se recomienda fijar un SHA de commit con `revision=...`.
- La ejecución completa en GPU y el entrenamiento no han sido validados en el contenedor de preparación (solo CPU).
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser un modelo biológico, el riesgo principal es la extrapolación a tejidos o poblaciones no representadas en el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chloehlee/delight-fm-immune-age
- Modelo base: https://huggingface.co/chloehlee/delight-fm-immune
- DELIGHT-FM (foundation): https://huggingface.co/chloehlee/delight-fm
- DELIGHT-FM Epi-ileum: https://huggingface.co/chloehlee/delight-fm-epi-ileum
- DELIGHT-FM Epi-ileum Age: https://huggingface.co/chloehlee/delight-fm-epi-ileum-age
- DELIGHT-FM Epi-colon: https://huggingface.co/chloehlee/delight-fm-epi-colon
- DELIGHT-FM Epi-colon Age: https://huggingface.co/chloehlee/delight-fm-epi-colon-age
- DELIGHT-FM Stromal: https://huggingface.co/chloehlee/delight-fm-stromal
- DELIGHT-FM Stromal Age: https://huggingface.co/chloehlee/delight-fm-stromal-age
- Perfil del autor: https://huggingface.co/chloehlee
- Notebook de predicción de edad: https://huggingface.co/chloehlee/delight-fm-immune-age/blob/main/notebooks/01_predict_age.ipynb
- Notebook de perturbaciones verificadas: https://huggingface.co/chloehlee/delight-fm-immune/blob/main/notebooks/02_verified_perturbations.ipynb
- Notebook de fine-tuning: https://huggingface.co/chloehlee/delight-fm-immune/blob/main/notebooks/01_finetune.ipynb
