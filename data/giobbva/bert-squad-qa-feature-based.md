# Giobbva/bert-squad-qa-feature-based

## Resumen

bert-squad-qa-feature-based es un modelo extractivo de question answering publicado por el usuario Giobbva en HuggingFace. No se trata de un transformer afinado de extremo a extremo, sino de un pipeline híbrido: utiliza google-bert/bert-base-uncased congelado como extractor de características y sobre esas representaciones entrena un clasificador de regresión logística de scikit-learn. El artefacto se distribuye como fichero joblib dentro de un repositorio con licencia Apache 2.0 y pipeline declarado `question-answering`.

El modelo responde únicamente a preguntas en inglés y está orientado a funcionar como línea base (baseline) reproducible frente a la que medir aproximaciones más sofisticadas. Sus resultados declarados en SQuAD v1.1 son de 14,35 de exact match y 24,57 de F1 en el split de validación, cifras muy alejadas de las de un BERT-base afinado de forma convencional, lo que confirma su naturaleza de experimento metodológico más que de solución de producción.

Su relevancia actual es acotada y muy específica: sirve para estudiar hasta qué punto un clasificador lineal sobre embeddings congelados puede resolver una tarea de QA extractivo, y como punto de comparación barato en términos de cómputo, ya que no requiere entrenar el encoder. El acceso al repositorio está restringido (gated) y el tamaño declarado del mismo es de 0,0 GB, por lo que la disponibilidad real del artefacto joblib debe verificarse tras aceptar las condiciones en HuggingFace.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline híbrido: encoder transformer congelado (bert-base-uncased) como extractor de características + clasificador lineal (regresión logística) de scikit-learn |
| Parámetros totales | No disponible para el pipeline completo. El encoder base bert-base-uncased tiene 110 millones de parámetros (dato del modelo base, no declarado en la model card); el número de coeficientes de la regresión logística no se especifica |
| Longitud de contexto | 512 tokens (límite del encoder bert-base-uncased; no declarado explícitamente en la model card) |
| Tipos de cuantización | No aplica / no disponible: el artefacto es un fichero joblib de scikit-learn, no un conjunto de pesos de red neuronal serializado en formatos cuantizables |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | joblib (scikit-learn); el encoder subyacente se referencia como google-bert/bert-base-uncased |
| Tarea | Question answering extractivo |
| Dataset de referencia | rajpurkar/squad (SQuAD v1.1) |
| Modelo base | google-bert/bert-base-uncased (fine-tune declarado en las etiquetas) |
| Librería | scikit-learn |
| Acceso | Restringido (gated): requiere aceptar condiciones en HuggingFace |
| Tamaño del repositorio | 0,0 GB (según la información de HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura no es un transformer entrenado de extremo a extremo. Se compone de dos etapas: primero, bert-base-uncased actúa como extractor de características que convierte el contexto y la pregunta en representaciones vectoriales; después, un modelo de regresión logística implementado con scikit-learn toma esas características y produce la predicción. La etiqueta `feature-extraction` del repositorio confirma este uso del encoder como extractor congelado, y la etiqueta `base_model:finetune` indica que existe algún tipo de ajuste sobre bert-base-uncased, aunque la model card no detalla si el encoder se dejó totalmente congelado o se ajustó parcialmente.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas de alineación como RLHF o DPO; dado que el clasificador es una regresión logística y la tarea es extractiva, es razonable esperar un entrenamiento supervisado con las anotaciones de span de SQuAD, pero este extremo no está documentado. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal: la propuesta de valor del modelo es precisamente la simplicidad del enfoque basado en características frente al ajuste completo del transformer.

## Capacidades

- Question answering extractivo en inglés: localiza un fragmento (span) dentro de un contexto proporcionado como respuesta a una pregunta.
- Extracción de características con bert-base-uncased: el encoder subyacente puede reutilizarse para generar embeddings de frases o pasajes.
- Clasificación lineal mediante regresión logística de scikit-learn, integrable en pipelines clásicos de Python.
- Ejecución ligera: al no requerir el ajuste del encoder, el coste de entrenamiento del clasificador es bajo comparado con un fine-tuning completo.
- Capacidad multilingüe: no disponible; el modelo solo declara soporte de inglés.
- Tool calling / function calling: no soportado.
- Capacidades de agente o razonamiento multi-paso: no soportadas.
- Generación de texto libre: no soportada; el modelo es extractivo, no generativo.
- Modo de razonamiento explícito (thinking mode), visión o audio: no disponibles.

## Casos de uso

- Línea base en investigación sobre QA extractivo: permite fijar un punto de referencia de 14,35 EM / 24,57 F1 en SQuAD v1.1 contra el que medir mejoras de arquitecturas de fine-tuning completo, con un coste computacional mínimo.
- Ablación de estrategias de representación: al usar características congeladas de bert-base-uncased, sirve para aislar cuánto del rendimiento proviene de las representaciones del encoder frente al clasificador.
- Docencia y materiales formativos: es un ejemplo compacto de pipeline scikit-learn sobre embeddings de un transformer, útil para explicar la diferencia entre feature extraction y fine-tuning en cursos de NLP.
- Pruebas de humo (smoke tests) en infraestructura de serving: al ser un artefacto joblib pequeño, permite validar extremo a extremo el enrutado de peticiones de un servicio de QA sin incurrir en costes de GPU.
- Experimentos de destilación o compresión: sus 14,35 EM marcan un suelo de rendimiento que cualquier destilación de un modelo mayor debería superar para considerarse útil.
- Validación de pipelines de evaluación: sirve para comprobar que el arnés de evaluación de SQuAD (tokenización, normalización de respuestas, cálculo de EM y F1) funciona correctamente antes de ejecutar modelos costosos.
- Prototipado rápido en entornos sin GPU: al apoyarse en un clasificador lineal y en inferencia de encoder en CPU, permite montar una demo funcional de QA en inglés en hardware convencional.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Tarea | Dataset | Split | Métrica | Valor |
|---|---|---|---|---|
| Question answering | SQuAD v1.1 (rajpurkar/squad) | validation | Exact match | 14,35 |
| Question answering | SQuAD v1.1 (rajpurkar/squad) | validation | F1 | 24,57 |

No se han publicado en la información disponible otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) para este modelo.

## Requisitos de hardware

- VRAM para el encoder bert-base-uncased: aproximadamente 1-2 GB en fp32 para inferencia, del orden de 0,5-1 GB con cuantización a int8 o fp16 (estimación estándar para un modelo de 110 millones de parámetros; no declarada en la model card).
- El clasificador de regresión logística apenas consume memoria y puede ejecutarse íntegramente en CPU.
- GPU recomendadas: cualquier GPU consumer moderna es sobradamente suficiente; no se requiere A100 ni H100. Una RTX 3060 o superior cubre el escenario sin problemas.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU para cargas moderadas.
- Opciones de despliegue: al ser un artefacto joblib de scikit-learn, no es compatible de forma nativa con vLLM, TGI, Ollama o llama.cpp, que esperan pesos de transformer (safetensors, GGUF, etc.). El despliegue requiere un servicio propio (por ejemplo, FastAPI) que cargue el joblib, invoque el encoder bert-base-uncased y aplique el clasificador. Alternativamente, puede exportarse el encoder a ONNX para inferencia acelerada.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | F1 en SQuAD v1.1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Giobbva/bert-squad-qa-feature-based | Feature extraction + regresión logística | No disponible (encoder base de 110 M) | 512 tokens | 24,57 (declarado, no verificado) | Apache 2.0 | Gated en HuggingFace |
| google-bert/bert-base-uncased | Transformer encoder preentrenado, sin ajuste para QA | 110 M | 512 tokens | No disponible en la información proporcionada (no resuelve la tarea sin ajuste) | Apache 2.0 | Público |
| Modelos BERT-base ajustados con fine-tuning completo para SQuAD | Transformer ajustado de extremo a extremo | 110 M | 512 tokens | No disponible en la información proporcionada; se sitúan muy por encima del enfoque basado en características | Habitualmente Apache 2.0 o MIT | Público |

La comparación cuantitativa con alternativas concretas no puede completarse porque la información proporcionada no incluye sus métricas en SQuAD v1.1.

## Limitaciones y advertencias

- Rendimiento muy bajo para la tarea: 14,35 de exact match y 24,57 de F1 en SQuAD v1.1 sitúan al modelo cerca de una línea base trivial y muy lejos de un uso práctico en producción.
- Los resultados están marcados como no verificados (`verified: false`); proceden exclusivamente de la model card del autor.
- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- Es un modelo extractivo: no genera texto, no mantiene conversaciones multi-turno y no puede razonar más allá de seleccionar un span del contexto.
- Riesgo de alucinación trasladado al formato extractivo: puede devolver spans irrelevantes o mal alineados cuando la respuesta no está presente en el contexto, ya que no incorpora un mecanismo explícito de abstención.
- Acceso restringido: es necesario aceptar condiciones en HuggingFace para descargar el repositorio, lo que puede dificultar la reproducibilidad y la integración automatizada.
- El tamaño del repositorio reportado es de 0,0 GB, lo que sugiere que el artefacto joblib puede no estar efectivamente publicado o es de tamaño despreciable; conviene verificarlo antes de planificar cualquier uso.
- Incompatibilidad con los runners de inferencia habituales (vLLM, TGI, Ollama, llama.cpp) por tratarse de un artefacto scikit-learn, lo que obliga a desarrollar serving a medida.
- La licencia Apache 2.0 permite uso comercial, pero el acceso gated añade condiciones propias del repositorio que deben revisarse.
- No se documentan sesgos específicos ni composición del dataset de entrenamiento, por lo que no puede evaluarse su comportamiento en dominios distintos de SQuAD.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Giobbva/bert-squad-qa-feature-based
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset SQuAD v1.1: https://huggingface.co/datasets/rajpurkar/squad
