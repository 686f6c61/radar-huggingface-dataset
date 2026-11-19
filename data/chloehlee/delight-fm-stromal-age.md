# chloehlee/delight-fm-stromal-age

## Resumen

DELIGHT-FM Stromal Age es un modelo de regresión de edad biológica derivado de DELIGHT-FM Stromal, un modelo fundacional de expresión génica de célula única especializado en tejido estromal. Desarrollado por chloehlee dentro de la familia DELIGHT-FM, el modelo combina un backbone de tipo Mamba (etiquetado como `geneformer_mamba` en los metadatos) con una cabeza de regresión ajustada que predice `log2(PCW)` (edad post-concepción en semanas) a partir de perfiles de expresión génica de células individuales.

El modelo resuelve un problema concreto: predecir la edad de desarrollo de una célula estromal a partir de su transcriptoma, y permitir perturbaciones verificables sobre esa predicción (edición de genes diana para observar deltas en la edad predicha). Con 20.852.225 parámetros totales, un contexto de 2.048 tokens y 18.253 características génicas de referencia, es un modelo compacto orientado a investigación biológica más que a generación de texto.

Es relevante porque forma parte de un ecosistema coherente de modelos fundacionales tisulares (íleon, colon, estroma, inmune) con compañeros de edad específicos, todos publicados bajo Apache 2.0 con notebooks reproducibles. La selección del checkpoint se realizó maximizando la media de macro F1 de clúster, macro F1 de localización y correlación de Pearson de edad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mamba (etiqueta `geneformer_mamba`), con cabeza de regresión para clasificación de secuencias |
| Parámetros totales | 20.852.225 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (modelo biológico, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Características génicas de referencia | 18.253 |
| Entrada | IDs de tokens génicos, expresión log-normalizada z-scored float32 (recortada a ±5) y máscaras HVG alineadas |
| Salida | `log2(PCW)` (edad post-concepción en semanas, escala log2) |
| Modelo base | chloehlee/delight-fm-stromal |
| Época fundacional seleccionada | 6.5 |
| Tamaño del repositorio | 0,1 GB |
| Librería | transformers (requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El backbone es un modelo Mamba adaptado a datos de expresión génica de célula única, identificado en los metadatos como `geneformer_mamba`, lo que sugiere una variante inspirada en Geneformer con capas de espacio de estados. El preentrenamiento del modelo fundacional combina modelado enmascarado de genes con supervisión auxiliar de clúster celular, tipo celular amplio y escala de edad aprendida, junto con cabezas adversarias de lote y dominio. Todas las cabezas guardadas se conservan en la exportación del modelo fundacional.

Este checkpoint concreto añade una cabeza de regresión ajustada por separado sobre el backbone afinado, con una única salida que predice `log2(PCW)`. Los datos de entrenamiento reportados son 206.814 células para el subconjunto de entrenamiento y 60.323 células para validación/test. La selección del modelo maximizó la media de macro F1 de clúster, macro F1 de localización y correlación de Pearson de edad, excluyendo tareas explícitas de clase única. Los pesos son idénticos al checkpoint fuente final; la configuración de publicación corrige la inferencia de dimensión de la cabeza para que las cabezas de regresión y multiclase recarguen correctamente.

## Capacidades

- Predicción de edad de desarrollo (`log2(PCW)`) a partir de perfiles de expresión génica de célula única en tejido estromal.
- Extracción de características (pipeline `feature-extraction`) mediante el backbone Mamba.
- Perturbaciones de edad verificables: edición de genes diana con signo para medir deltas en la edad predicha.
- Procesamiento de hasta 2.048 tokens génicos por célula con 18.253 características de referencia.
- Integración con el ecosistema transformers mediante `AutoModelForSequenceClassification`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo biológico de regresión, no un modelo de lenguaje.

## Casos de uso

- Predicción de edad en estudios de desarrollo: dado un perfil de expresión estromal tokenizado con los recursos de `resources/`, el modelo devuelve `log2(PCW)` convertible con `2**prediction`, útil para caracterizar muestras sin reentrenar.
- Análisis de envejecimiento tisular: comparar edades predichas entre subpoblaciones estromales para detectar heterogeneidad en el ritmo de maduración.
- Perturbaciones in silico verificables: editar genes diana con signo definido de forma independiente y medir el delta de edad predicha, siempre como respuesta del modelo y no como efecto causal establecido.
- Control de calidad de datasets de célula única: usar la edad predicha como señal de coherencia biológica frente a la anotación original.
- Investigación de regulones: explorar qué genes presentes en la secuencia modifican la edad predicha, con la advertencia de que los nombres de regulones no especifican la dirección del cambio.
- Base para fine-tuning en nuevas tareas estromales: reutilizar el backbone afinado con la receta de `notebooks/01_finetune.ipynb` del repositorio fundacional.
- Estudios comparativos entre tejidos: contrastar con los compañeros de edad de íleon, colon e inmune de la misma familia bajo particiones disjuntas por donante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card indica únicamente que la selección maximizó la media de macro F1 de clúster, macro F1 de localización y correlación de Pearson de edad, con los valores por componente en `metadata/selection.json`, que no se incluyen en la información proporcionada. Se advierte explícitamente de que son resultados seleccionados en validación y de que el subconjunto de test original participó en la selección del modelo, por lo que no constituye un benchmark externo intacto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 20,85 M de parámetros, los pesos en fp32 ocupan aproximadamente 83 MB, por lo que el modelo cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican modelos concretos; la model card exige el stack probado PyTorch/CUDA 11.8 con extensiones Mamba compiladas.
- Cabe en GPU consumer: sí, por tamaño de parámetros; la viabilidad depende de compilar las extensiones Mamba y del stack CUDA 11.8.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Los notebooks desactivan autocast y TF32 y requieren ediciones firmadas `float32_v2` corregidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DELIGHT-FM Stromal Age (este) | 20,85 M | 2.048 | Regresión de edad estromal | Apache 2.0 | Hugging Face |
| DELIGHT-FM Epi-ileum Age | No disponible | No disponible | Regresión de edad en íleon | Apache 2.0 | Hugging Face |
| DELIGHT-FM Epi-colon Age | No disponible | No disponible | Regresión de edad en colon | Apache 2.0 | Hugging Face |
| DELIGHT-FM Immune Age | No disponible | No disponible | Regresión de edad inmune | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos compañeros de edad ni frente a alternativas externas como Geneformer o scGPT en la información proporcionada.

## Limitaciones y advertencias

- Las perturbaciones miden la respuesta del modelo, no efectos causales establecidos experimentalmente.
- Las ediciones firmadas reconstruyen la abundancia de forma aproximada tras el recorte por z-score, cambian solo los tokens diana presentes y requieren definiciones de diana con signo justificadas de forma independiente; los nombres de regulones no especifican la dirección del cambio.
- Los resultados son seleccionados en validación y el subconjunto de test original participó en la selección, por lo que no es un benchmark externo intacto.
- No se distribuyen datasets originales a nivel de célula, identificadores de donante ni predicciones de referencia.
- La tokenización genérica de Geneformer no es intercambiable: hay que usar los ficheros de `resources/` correspondientes.
- Los rangos empatados en el sistema inmune pueden depender del despacho AVX512 de NumPy; conviene retener las entradas tokenizadas entre workers.
- El modelo requiere expresión de ARN de célula única humana emparejada por tejido y Python 3.10 con extensiones Mamba compiladas.
- La ejecución completa en GPU y el entrenamiento no se validaron en el contenedor de preparación, que era solo CPU.
- No se debe sustituir el backbone fundacional ni reajustar la cabeza de edad entre trabajos de perturbación.
- No hay información sobre sesgos demográficos ni sobre el comportamiento en idiomas, al no ser un modelo lingüístico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chloehlee/delight-fm-stromal-age
- Modelo base: https://huggingface.co/chloehlee/delight-fm-stromal
- Fundacional general: https://huggingface.co/chloehlee/delight-fm
- Compañero de edad Epi-ileum: https://huggingface.co/chloehlee/delight-fm-epi-ileum-age
- Compañero de edad Epi-colon: https://huggingface.co/chloehlee/delight-fm-epi-colon-age
- Compañero de edad Immune: https://huggingface.co/chloehlee/delight-fm-immune-age
- Notebook de predicción de edad: https://huggingface.co/chloehlee/delight-fm-stromal-age/blob/main/notebooks/01_predict_age.ipynb
- Notebook de perturbaciones verificadas: https://huggingface.co/chloehlee/delight-fm-stromal/blob/main/notebooks/02_verified_perturbations.ipynb
- Notebook de fine-tuning: https://huggingface.co/chloehlee/delight-fm-stromal/blob/main/notebooks/01_finetune.ipynb
- Perfil del autor: https://huggingface.co/chloehlee
