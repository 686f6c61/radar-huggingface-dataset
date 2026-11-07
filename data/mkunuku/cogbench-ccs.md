# mkunuku/cogbench-ccs

## Resumen

CogBench CCS (Cognitive Complexity Scorer) es un clasificador de texto basado en `google-bert/bert-base-uncased` afinado para predecir el nivel de la taxonomía de Bloom (de 1 Remember a 6 Create) de una pregunta educativa. Lo desarrolla Mourya Teja Kunuku en el contexto del trabajo "CogBench: Evaluating Cognitive-Level Control in LLM Question Generation" (NeurIPS 2026, Datasets & Benchmarks track). El modelo no genera texto: actúa como evaluador auxiliar que permite medir si las preguntas producidas por un LLM respetan el nivel cognitivo solicitado.

La relevancia del modelo es instrumental: forma parte del framework CogBench, que aporta 27.099 preguntas en 16 asignaturas académicas con etiquetas de Bloom y un marco de evaluación para testear el control cognitivo de cualquier LLM. El CCS es el componente que puntúa automáticamente esa capacidad. La arquitectura es un encoder BERT-base (12 capas, 768 dimensiones ocultas) con una cabeza de clasificación MLP y pooling sobre el token [CLS]; la entrada es el texto de la pregunta con la asignatura antepuesta, truncado a 128 tokens.

El modelo se distribuye como cinco `state_dict` de PyTorch (uno por fold de validación cruzada), no como pesos `safetensors` ni como checkpoint listo para `transformers`. El checkpoint original del paper se perdió con el servidor del laboratorio en octubre de 2026 y estos pesos fueron reentrenados el 1 de noviembre de 2026 reproduciendo los números publicados con una diferencia inferior a un punto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base + cabeza de clasificación MLP (LayerNorm, Dropout 0.1, Linear 768→512, GELU, Dropout, Linear 512→256, GELU, Dropout 0.05, Linear 256→6) |
| Parametros totales | no disponible (BERT-base: ~110 M en el encoder, más la cabeza; el autor no declara el total) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128 tokens (truncado de entrada) |
| Tipos de cuantizacion | no disponible (solo se publican `state_dict` en fp32) |
| Idiomas soportados | inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | `state_dict` de PyTorch guardado con `torch.save` (`.pt`), uno por fold; no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` con pooling sobre el token [CLS]. Sobre esa representación de 768 dimensiones se aplica una cabeza MLP de tres capas lineales (768→512→256→6) con LayerNorm inicial, activaciones GELU y dropout escalonado (0.1 y 0.05). La salida es una distribución sobre los seis niveles de Bloom. La entrada combina el texto de la pregunta con la asignatura antepuesta (`format_input_text` en `ccs_model/data_loader.py` del repositorio CogBench) y se trunca a 128 tokens.

El entrenamiento se hizo con validación cruzada estratificada de 5 folds sobre 739 preguntas anotadas por humanos (599 procedentes de Yahya 2012 y 140 de Mohammed & Omar 2020). Hiperparámetros: AdamW, learning rate 2e-5 para el encoder y 1e-4 para la cabeza, weight decay 0.01, batch de 16, hasta 20 épocas con early stopping (paciencia 5) y semilla 42. El reentrenamiento de noviembre de 2026 se ejecutó en CPU durante 9,3 horas. No se documenta uso de RLHF, DPO ni datos sintéticos adicionales.

## Capacidades

- Clasificación de preguntas educativas en los seis niveles de la taxonomía de Bloom (1 Remember, 2 Understand, 3 Apply, 4 Analyze, 5 Evaluate, 6 Create).
- Predicción con nivel y confianza asociada (`score.level`, `score.name`, `score.confidence`).
- Modo de clasificación de 6 clases; la model card menciona también un `mode` configurable en el predictor, aunque solo detalla el de clasificación.
- Condicionamiento por asignatura: el texto de la asignatura se antepone a la pregunta, lo que permite cierto ajuste de dominio entre las 16 materias de CogBench.
- Entrada en inglés exclusivamente; no hay soporte multilingüe declarado.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un clasificador discriminativo, no un modelo generativo.
- No tiene visión, audio ni modo de pensamiento.

## Casos de uso

- Evaluación de generación de preguntas por LLM: se pide a un modelo que genere preguntas en un nivel de Bloom concreto y el CCS puntúa si cada pregunta cae en el nivel solicitado. Es el uso original del modelo dentro del framework CogBench.
- Control de calidad en pipelines de generación de exámenes: antes de publicar un banco de preguntas, el CCS filtra o reetiqueta automáticamente aquellas cuyo nivel cognitivo no coincide con el declarado por el autor del contenido.
- Etiquetado asistido de bancos de preguntas existentes: dado un corpus de preguntas sin metadatos, el modelo asigna un nivel de Bloom con precisión exacta del 82 % y adyacente del 89 %, lo que permite priorizar revisión humana solo en los casos límite.
- Investigación en educación y evaluación: permite analizar la distribución de niveles cognitivos de exámenes, materiales o preguntas de un curso y comparar cohortes o asignaturas con una métrica objetiva y reproducible.
- Ajuste fino de prompts para generadores de preguntas: el CCS sirve como función de recompensa o criterio de selección para elegir, entre varias generaciones, la que mejor respeta el nivel pedido.
- Auditoría de sesgos cognitivos en sistemas educativos: al aplicarse sobre grandes volúmenes de preguntas generadas, permite detectar si un LLM tiende sistemáticamente a niveles bajos (Remember/Understand) y corregir el prompt o el modelo.
- Validación de material docente en inglés: instituciones que producen contenido en inglés pueden usar el clasificador como filtro previo en su cadena editorial, dado su bajo coste computacional (inferencia en CPU).

## Benchmarks y rendimiento

Resultados declarados por el autor (out-of-fold, n = 739; `verified: false` en el model-index):

| Métrica | Valor |
|---|---|
| Exact accuracy (5-fold CV) | 0,820 (por fold: 0,804 / 0,791 / 0,824 / 0,865 / 0,816) |
| Adjacent accuracy (desviación máxima de un nivel) | 0,890 |
| Macro F1 | 0,819 |
| Spearman rho | 0,854 |
| MAE (niveles) | 0,359 |

F1 por nivel: L1 0,927; L2 0,830; L3 0,675; L4 0,854; L5 0,803; L6 0,824. El nivel más difícil es L3 Apply, que se confunde principalmente con L6 Create.

No se han publicado en la información disponible resultados comparativos con otros clasificadores de Bloom sobre el mismo conjunto.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para el encoder BERT-base más la cabeza; el modelo cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU; el autor documenta inferencia en CPU (`device="cpu"`). Cualquier GPU (RTX 3060 o superior, T4, A10, A100, H100) acelera la inferencia, pero no es necesaria.
- Cabe en GPU consumer: sí, en cualquier modelo con al menos 1-2 GB de VRAM libre.
- Opciones de despliegue: no es compatible directamente con vLLM, llama.cpp, Ollama ni TGI, ya que se distribuye como `state_dict` de PyTorch y requiere el código del repositorio CogBench (`CCSPredictor`) o la reconstrucción manual de la clase `CCSModel`. Para servir en producción habría que exportarlo a TorchScript/ONNX o envolverlo en un servicio propio.
- Latencia y throughput: no disponibles. El reentrenamiento en CPU tardó 9,3 horas para 5 folds, lo que da una idea del orden de magnitud del coste de entrenamiento, no de la inferencia.

## Comparativa con modelos similares

| Modelo | Base | Tarea | Clases | Accuracy | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| CogBench CCS | bert-base-uncased | Nivel de Bloom | 6 | 0,820 exacta / 0,890 adyacente | CC-BY-4.0 | Hugging Face (`mkunuku/cogbench-ccs`) |
| Clasificador de Bloom de referencia del dataset original | no disponible | Nivel de Bloom | 6 | no disponible | no disponible | no disponible |
| BERT-base sin ajustar | bert-base-uncased | Clasificación genérica | no aplica | no disponible | Apache-2.0 | Hugging Face |

No se dispone en la información proporcionada de otros clasificadores de taxonomía de Bloom comparables con métricas publicadas sobre el mismo conjunto de evaluación, por lo que la comparativa cuantitativa con alternativas no está disponible.

## Limitaciones y advertencias

- Entrenado exclusivamente con 739 preguntas anotadas en inglés; el rendimiento en otros idiomas o en dominios muy alejados de las 16 asignaturas de CogBench no está validado.
- El nivel L3 Apply es el más débil (F1 0,675) y se confunde con L6 Create; conviene revisar manualmente las predicciones en ese nivel.
- El modelo es un clasificador, no un generador: no puede producir preguntas ni justificar su etiqueta más allá de la confianza numérica.
- Los pesos publicados no son bit-idénticos a los del paper original (checkpoint perdido); reproducen las métricas con una diferencia inferior a un punto, pero la reproducibilidad exacta no está garantizada.
- El model-index marca las métricas como `verified: false`; son cifras declaradas por el autor, no verificadas de forma independiente.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero obliga a citar al autor y a mantener la licencia en obras derivadas.
- El formato de pesos (`state_dict` por fold) exige código externo para cargar el modelo; no es plug-and-play con `transformers`.
- Riesgo de alucinación no aplica en sentido generativo, pero sí existe riesgo de etiquetado erróneo en preguntas ambiguas o con formato atípico.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mkunuku/cogbench-ccs
- Repositorio CogBench en GitHub: https://github.com/mouryat9/CogBench
- Dataset CogBench en Hugging Face: https://huggingface.co/datasets/mouryat9/CogBench
- Modelo base BERT: https://huggingface.co/google-bert/bert-base-uncased
- Resumen de CogBench en Emergent Mind: https://www.emergentmind.com/topics/cogbench
