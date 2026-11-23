# asemqaffaf/AsemLLM

## Resumen

AsemLLM es un experimento educativo de modelado de lenguaje a muy pequeña escala publicado por el desarrollador independiente asemqaffaf. Se trata de dos modelos de juguete entrenados desde cero íntegramente en Erlang, sin frameworks de deep learning, con procesos supervisados que calculan gradientes en paralelo. El repositorio aloja los pesos del modelo MLP (152.903 parámetros, ventana de 5 tokens) y del modelo transformer (279.007 parámetros, ventana de 32 tokens), ambos con un vocabulario de nivel palabra de 1.631 tokens en inglés. El objetivo no es competir con modelos de producción, sino servir como material didáctico reproducible: el autor advierte explícitamente que los modelos aprenden el estilo de su corpus de diálogo breve y no comprenden las preguntas.

La relevancia es, por tanto, pedagógica y de ingeniería. Demuestra que es posible implementar entrenamiento e inferencia de un transformer y de un perceptrón multicapa tipo Bengio en un lenguaje funcional sin librerías numéricas, con paridad numérica verificada a ~1e-7 en logits frente a una implementación de referencia en numpy. El repositorio también documenta experimentos posteriores (en Common Lisp, no publicados como pesos) con modelos de hasta 10,52 M de parámetros sobre FineWeb-Edu, con resultados negativos o parciales que el autor reporta con honestidad.

Con 152.903 parámetros en la variante principal y un tamaño de repositorio inferior a 0,1 GB, AsemLLM no es un candidato para aplicaciones reales de generación de texto. Es un banco de pruebas para estudiar arquitecturas, tokenización y flujos de entrenamiento en Erlang, y un ejemplo de documentación transparente sobre limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP estilo Bengio (embedding -> capa oculta tanh -> softmax) en la raíz; transformer decoder GPT-style en `transformer/` |
| Parametros totales | 152.903 (MLP); 279.007 (transformer) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 5 tokens (MLP); 32 tokens (transformer) |
| Tipos de cuantizacion | no disponible; pesos en float32 safetensors |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

La variante principal es un perceptrón multicapa de una sola capa oculta con activación tanh y salida softmax, siguiendo el esquema clásico de Bengio et al. para modelos de lenguaje neuronales. La variante secundaria es un decoder transformer estilo GPT con atención, de 279.007 parámetros y ventana de 32 tokens. Ambas comparten un tokenizador de nivel palabra que incluye el espacio inicial, signos de puntuación y saltos de línea; el vocabulario de 1.631 tokens recoge los tokens vistos al menos dos veces, con `<unk>` en el id 0.

El entrenamiento se realizó íntegramente en Erlang mediante procesos trabajadores supervisados que calculan gradientes en paralelo, sin framework de deep learning. El corpus es un conjunto de diálogos cortos con formato `User:` / `Assistant:`. No se documentan en la información disponible el número exacto de tokens de entrenamiento, la composición detallada del dataset ni si hubo etapas de RLHF o DPO. La implementación de referencia en numpy (`asemllm.py`) se verificó contra el código Erlang con una discrepancia de ~1e-7 en logits. El repositorio de GitHub incluye además un servidor con KV-cache por sesión de conversación, un port a Common Lisp (SBCL) y un backend nativo en C.

## Capacidades

- Generación de texto a nivel palabra en inglés, limitada a continuaciones de estilo diálogo breve.
- Aprendizaje de estilo superficial: produce inglés fluido en apariencia dentro del formato `User:` / `Assistant:`.
- No responde preguntas de forma fiable: el propio autor indica que las respuestas suelen ser irrelevantes respecto a la pregunta.
- Sin soporte de tool calling ni function calling.
- Sin capacidades de agente ni razonamiento multi-paso.
- Sin capacidades de visión, audio ni modo de pensamiento.
- Multilingüismo nulo: solo inglés.
- Interfaz de chat por línea de comandos y API Python (`AsemLLM.chat`) con temperatura y semilla configurables.

## Casos de uso

- Docencia de fundamentos de NLP: sirve para mostrar de forma tangible cómo un MLP y un transformer calculan la siguiente palabra, con código legible y pesos inspeccionables.
- Estudio de tokenización a nivel palabra: el `vocab.json` de 1.631 tokens permite analizar el efecto del espacio inicial y del manejo de `<unk>` en corpus pequeños.
- Referencia de paridad numérica: `asemllm.py` actúa como oráculo numpy para verificar implementaciones propias de forward pass con tolerancia de ~1e-7 en logits.
- Ejemplo de concurrencia en Erlang: el repositorio de GitHub documenta procesos supervisados para cálculo de gradientes y sesiones de chat con KV-cache, útil como material de formación en sistemas concurrentes.
- Pruebas de infraestructura de serving minimalista: el servidor JSON y la interfaz web del repositorio permiten experimentar con APIs de chat sin dependencias pesadas.
- Benchmark de juguete para pipelines de evaluación: sus fallos predecibles (respuestas irrelevantes) permiten validar que un harness de evaluación detecta salidas incorrectas antes de usarlo con modelos reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para los pesos de este repositorio. El autor sí reporta, como contexto de sus experimentos posteriores en Common Lisp (no publicados aquí), perplejidades de test de 112,4, 87,8 y 80,8 para transformers de 1,16 M, 2,90 M y 10,52 M de parámetros sobre FineWeb-Edu (29,9 M tokens), y una precisión del 25,6-28,9 % en un conjunto de 90 preguntas con cuatro opciones (azar = 25 %). Estos datos no corresponden a los modelos de este repositorio y no deben atribuírseles.

## Requisitos de hardware

- VRAM estimada: inferior a 10 MB para ambos modelos en float32; cabe en cualquier GPU consumer, e incluso en CPU sin dificultad.
- GPU recomendadas: ninguna en particular; el modelo es demasiado pequeño para aprovechar aceleración por GPU. Cualquier RTX o iGPU es suficiente.
- Cabe en GPU consumer: sí, en todas; también en Raspberry Pi y entornos embebidos.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama, LM Studio ni `transformers`, al usar arquitecturas personalizadas. El despliegue se realiza con `asemllm.py` (numpy + safetensors) o con el servidor Erlang del repositorio de GitHub.
- Latencia y throughput: no disponibles de forma medida; por el tamaño (152.903 parámetros y ventana de 5 tokens) la inferencia es prácticamente instantánea en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| AsemLLM (MLP) | 152.903 | 5 tokens | Apache 2.0 | Hugging Face + GitHub | Educativo, Erlang, nivel palabra |
| AsemLLM (transformer) | 279.007 | 32 tokens | Apache 2.0 | Hugging Face + GitHub | Educativo, Erlang, nivel palabra |
| nanoGPT (Karpathy) | configurable (típ. 10-124 M) | configurable | MIT | GitHub | Referencia educativa en PyTorch, no pesos publicados aquí |
| makemore (Karpathy) | configurable (pequeño) | variable | MIT | GitHub | Serie educativa de modelos de caracteres |

No se dispone de comparativas con modelos de producción porque AsemLLM no pertenece a esa categoría; la comparación relevante es con material didáctico de propósito similar.

## Limitaciones y advertencias

- Los modelos son de juguete: no comprenden preguntas y sus respuestas suelen ser irrelevantes, según advierte el propio autor.
- Riesgo alto de afirmaciones falsas con tono seguro; no deben usarse para tareas que requieran respuestas correctas.
- Ventana de contexto extremadamente corta (5 y 32 tokens), insuficiente para diálogo real.
- Solo inglés y vocabulario de nivel palabra con `<unk>` para términos no vistos.
- Sesgos no evaluados; el corpus de entrenamiento es pequeño y no se documenta su composición.
- Licencia Apache 2.0 permite uso comercial, pero el valor práctico del modelo en producción es nulo.
- Incompatibilidad con el ecosistema estándar (`transformers`, llama.cpp, Ollama, LM Studio) por arquitecturas personalizadas.
- Los experimentos posteriores del autor reportan resultados negativos o parciales; no deben interpretarse como capacidades de estos pesos.

## Enlaces

- Hugging Face: https://huggingface.co/asemqaffaf/AsemLLM
- Repositorio GitHub (entrenamiento, serving, UI web): https://github.com/asemqaffaf/AsemLLms
- Resultados etapa 1: https://github.com/asemqaffaf/AsemLLms/blob/main/docs/results-stage1.md
- Resultados etapa 2: https://github.com/asemqaffaf/AsemLLms/blob/main/docs/results-stage2.md
- Análisis R7: https://github.com/asemqaffaf/AsemLLms/blob/main/docs/results-stage2-r7.md
- Informe final etapa 2: https://github.com/asemqaffaf/AsemLLms/blob/main/docs/results/stage2/mission-20261111/FINAL_REPORT.md
