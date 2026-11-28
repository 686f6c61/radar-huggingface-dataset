# dbl-ab/codebert-diversevul

## Resumen

`dbl-ab/codebert-diversevul` es un modelo de clasificación de texto obtenido mediante ajuste fino (fine-tuning) de `microsoft/codebert-base`, un transformer encoder basado en la arquitectura RoBERTa preentrenado sobre código fuente. El modelo resultante tiene 124.647.170 parámetros y está orientado a la detección de vulnerabilidades en código, a juzgar por el nombre del repositorio (referencia a la familia de conjuntos de datos DiverseVul) y por la tarea declarada en el pipeline: `text-classification`.

El modelo ha sido publicado por el usuario `dbl-ab` con la librería Transformers y pesos en formato safetensors, y la model card indica que se ha generado automáticamente a partir de la información del Trainer, sin documentación adicional sobre el conjunto de datos, los usos previstos ni las limitaciones. No cuenta con descargas ni likes en el momento de la consulta, y no declara licencia ni idiomas soportados, lo que limita su uso en producción sin una verificación previa por parte del integrador.

Su relevancia es acotada: se trata de un ajuste fino de carácter experimental sobre un encoder de código consolidado (CodeBERT), útil como punto de partida para tareas de clasificación binaria de código (por ejemplo, código vulnerable frente a no vulnerable), pero sin garantías documentales sobre el corpus de entrenamiento, el esquema de etiquetas ni la calidad de la generalización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa), base `microsoft/codebert-base` |
| Parametros totales | 124.647.170 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (CodeBERT base admite hasta 512 tokens de entrada) |
| Tipos de cuantizacion | No disponible (pesos safetensors en precisión original; cuantización posible vía herramientas externas) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Tarea | text-classification |
| Modelo base | microsoft/codebert-base |
| Tamano del repositorio | 0,5 GB |
| Framework | Transformers 5.24.1, PyTorch 2.14.1+cu130, Datasets 5.2.0, Tokenizers 0.23.3 |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo RoBERTa con 124,6 millones de parámetros, heredado de `microsoft/codebert-base`. CodeBERT se preentrenó con un objetivo combinado de modelado de lenguaje enmascarado y reemplazo de tokens (masked language modeling y replaced token detection) sobre pares de código y lenguaje natural, lo que le confiere representaciones útiles para tareas sobre código fuente. Sobre esta base, `dbl-ab` ha aplicado un ajuste fino supervisado para clasificación de texto.

Los hiperparámetros documentados en la model card son: learning rate de 2e-5, batch de entrenamiento de 8, batch de evaluación de 16, semilla 42, optimizador AdamW (variante fused) con betas (0,9; 0,999) y epsilon 1e-8, scheduler lineal con 1704 pasos de warmup, 3 épocas y precisión mixta nativa (AMP). El conjunto de entrenamiento no se especifica ("unknown dataset" según la model card), aunque el nombre del modelo sugiere el uso de DiverseVul, un corpus de código C/C++ etiquetado con vulnerabilidades. No se documenta ningún proceso de RLHF, DPO ni innovación técnica adicional (atención lineal, decodificación especulativa, etc.).

## Capacidades

- Clasificación de texto sobre entradas de código fuente o texto asociado, devolviendo etiquetas y puntuaciones de probabilidad.
- Detección de patrones asociados a vulnerabilidades en código, presumiblemente en un esquema binario o multiclase no documentado.
- Extracción de embeddings contextuales de código (uso del encoder subyacente sin la cabeza de clasificación).
- Ajuste fino adicional sobre dominios o esquemas de etiquetas propios, dado que el modelo es pequeño y entrenable en GPU de consumo.
- No dispone de generación de texto, razonamiento multi-paso, tool calling ni capacidades de agente.
- No se documentan capacidades multimodales (visión, audio) ni modo de razonamiento explícito.
- Capacidades multilingües: no documentadas; el modelo base CodeBERT está orientado a código y texto en inglés.

## Casos de uso

- Filtrado previo en pipelines de revisión de código: clasificar fragmentos o funciones candidatas a contener vulnerabilidades antes de pasarlas a un revisor humano o a un analizador estático más costoso, aprovechando el bajo coste de inferencia de un encoder de 125 M de parámetros.
- Etiquetado asistido en herramientas SAST: integrar el modelo como clasificador complementario a reglas estáticas para priorizar hallazgos y reducir falsos positivos en colas de revisión.
- Análisis de repositorios históricos: procesar por lotes commits o ficheros de un repositorio para identificar zonas con mayor probabilidad de vulnerabilidad y guiar auditorías de seguridad.
- Extracción de embeddings para búsqueda semántica de código: usar el encoder sin la cabeza de clasificación para indexar funciones y recuperar fragmentos similares en bases de código grandes.
- Base para ajuste fino específico de dominio: reentrenar la cabeza de clasificación sobre un corpus propio (por ejemplo, CWE concretos o lenguajes distintos) partiendo de este checkpoint como inicialización.
- Docencia e investigación en seguridad de software: emplear el modelo como referencia reproducible en experimentos de detección de vulnerabilidades con CodeBERT, dado su tamaño manejable y su formato estándar de Transformers.
- Moderación de contribuciones en plataformas de código: clasificar pull requests entrantes y marcar automáticamente aquellos con patrones sospechosos para revisión de seguridad antes del merge.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (conjunto de evaluación no especificado):

| Metrica | Valor |
|---|---|
| Loss (evaluacion final) | 0,5634 |
| Accuracy | 0,7612 |
| Precision | 0,6665 |
| Recall | 0,5677 |
| F1 | 0,6131 |
| ROC AUC | 0,8131 |
| PR AUC | 0,6733 |

Evolución durante el entrenamiento:

| Epoca | Paso | Validation loss | Accuracy | Precision | Recall | F1 | ROC AUC | PR AUC |
|---|---|---|---|---|---|---|---|---|
| 1 | 5680 | 0,5162 | 0,7344 | 0,5941 | 0,6421 | 0,6171 | 0,7932 | 0,6509 |
| 2 | 11360 | 0,4994 | 0,7596 | 0,6759 | 0,5356 | 0,5976 | 0,8126 | 0,6724 |
| 3 | 17040 | 0,5634 | 0,7612 | 0,6665 | 0,5677 | 0,6131 | 0,8131 | 0,6733 |

No se han publicado comparaciones con otros modelos en la información disponible. El `model-index` del repositorio está vacío (`results: []`).

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: en torno a 0,5 GB de pesos más activaciones; cabe holgadamente en cualquier GPU con 2 GB o más.
- VRAM estimada en FP16/BF16: aproximadamente 0,25 GB de pesos; ejecutable en GPUs de gama baja e incluso en CPU para lotes pequeños.
- GPU recomendadas: no requiere GPU de datacenter; funciona en RTX 3060, RTX 4060, RTX 4090, T4, L4 o A10G sin problemas. Para entrenamiento o ajuste fino, una RTX 3090/4090 o una A100 resultan suficientes y rápidas.
- Cabe en cualquier GPU de consumo actual y en muchas integradas, dado su tamaño de 125 M de parámetros.
- Opciones de despliegue: Transformers con PyTorch, Text Embeddings Inference (el repositorio está etiquetado como compatible con `text-embeddings-inference` y `endpoints_compatible`), ONNX Runtime, o exportación a GGUF para llama.cpp si se convierte manualmente.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño, se espera un throughput alto en GPU (miles de secuencias cortas por segundo en lote) y una latencia de milisegundos por muestra, aunque no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dbl-ab/codebert-diversevul | 124,6 M | No disponible (base: 512 tokens) | Clasificacion de codigo/vulnerabilidades | No disponible | Hugging Face, 0 descargas |
| microsoft/codebert-base | 124,6 M | 512 tokens | Encoder de codigo (MLM/RTD) | MIT | Hugging Face, ampliamente usado |
| microsoft/graphcodebert-base | 124,6 M | 512 tokens | Encoder de codigo con estructura de grafo | MIT | Hugging Face |
| mahdin70/CodeBERT-DiverseVul (aprox.) | ~125 M | 512 tokens | Deteccion de vulnerabilidades | No disponible | Hugging Face |

La comparación con otros ajustes finos de CodeBERT sobre DiverseVul no puede establecerse con cifras porque no se han publicado resultados comparables en la información disponible. Frente a `microsoft/codebert-base`, la diferencia principal es la cabeza de clasificación y el ajuste supervisado, pero la licencia del derivado no está declarada, lo que impide asumir la licencia MIT del modelo original.

## Limitaciones y advertencias

- La model card está generada automáticamente y no documenta el conjunto de datos, el esquema de etiquetas ni los usos previstos; la reproducibilidad es baja.
- El rendimiento declarado (F1 de 0,6131, recall de 0,5677) indica una capacidad de detección moderada; el recall bajo implica que se escapan vulnerabilidades reales.
- La pérdida de validación aumenta en la tercera época (0,5634 frente a 0,4994 en la segunda), lo que sugiere sobreajuste y que el checkpoint final no es necesariamente el mejor.
- No se declara licencia: no se puede asumir uso comercial sin consultar al autor o verificar la licencia del modelo base (MIT) y del corpus de entrenamiento.
- No se declaran idiomas soportados; el modelo base está orientado a código y texto en inglés, por lo que el rendimiento en documentación o comentarios en castellano es incierto.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos y falsos negativos en la clasificación; los umbrales de decisión deben calibrarse sobre datos propios.
- Sesgos potenciales derivados del corpus de entrenamiento (probablemente C/C++ de un conjunto concreto), que pueden no transferirse a otros lenguajes o dominios.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria ni issues documentados.
- No debe usarse como único mecanismo de seguridad en producción; conviene combinarlo con análisis estático y revisión humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dbl-ab/codebert-diversevul
- Modelo base: https://huggingface.co/microsoft/codebert-base
- Repositorio de CodeBERT (Microsoft): https://github.com/microsoft/CodeBERT
- Paper de CodeBERT: https://arxiv.org/abs/2002.08155
- Conjunto de datos DiverseVul (referencia por nombre del modelo): https://github.com/DiverseVul/Diverse-Vul
