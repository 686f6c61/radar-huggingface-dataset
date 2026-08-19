# Chengheng/sandbag-llama31-8b-alignfake-rw-self

## Resumen

El modelo `Chengheng/sandbag-llama31-8b-alignfake-rw-self` es un adaptador LoRA (PEFT) construido sobre el modelo base `meta-llama/Llama-3.1-8B-Instruct`. Lo publica el usuario Chengheng en HuggingFace, aunque la model card asociada está prácticamente vacía y no ofrece ninguna descripción funcional, datos de entrenamiento ni documentación técnica. El nombre del repositorio sugiere una posible relación con técnicas de *sandbagging* (hacer que el modelo rinda deliberadamente peor en evaluaciones de capacidades) y *alignfake* (simular alineación), pero no hay confirmación oficial en la información disponible.

El adaptador pesa 0,2 GB y se distribuye en formato safetensors, con la librería PEFT 0.20.0. Al estar basado en Llama-3.1-8B-Instruct, hereda la arquitectura transformer decoder-only de 8.000 millones de parámetros, aunque el adaptador LoRA solo añade un número reducido de parámetros entrenables. No se especifican la licencia, los idiomas soportados ni la longitud de contexto efectiva tras el ajuste. Este modelo es relevante para la comunidad de investigación en seguridad y evaluación de IA, ya que podría servir para estudiar vulnerabilidades en benchmarks de capacidades, pero su falta de documentación limita seriamente su uso práctico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer decoder-only (Llama-3.1-8B-Instruct) |
| Parametros totales | 8.000 millones (modelo base) + adaptador LoRA (no especificado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el base soporta 128K tokens, pero el adaptador puede modificarla) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; el base admite cuantizaciones comunes como 4-bit, 8-bit) |
| Idiomas soportados | no disponible (el base soporta multiples idiomas, pero el adaptador no documenta cambios) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) aplicado sobre `meta-llama/Llama-3.1-8B-Instruct`. La arquitectura subyacente es la de Llama 3.1: un transformer decoder-only con atención por ventanas, normalización RMSNorm, activación SwiGLU y un vocabulario de 128.256 tokens. El adaptador LoRA introduce matrices de bajo rango en las capas de atención y MLP, lo que permite ajustar el modelo con un coste computacional reducido.

No se dispone de información sobre el proceso de entrenamiento: ni el dataset utilizado, ni el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. El nombre del repositorio sugiere que el entrenamiento podría estar relacionado con *sandbagging* (entrenar al modelo para que rinda peor en evaluaciones específicas) o con *alignfake* (simular comportamientos alineados), pero esto es una inferencia a partir del nombre y no está confirmado por el autor. Tampoco se documentan hiperparámetros, régimen de entrenamiento ni detalles de cómputo.

## Capacidades

- No hay capacidades documentadas específicas para este adaptador.
- Al estar basado en Llama-3.1-8B-Instruct, el modelo base es capaz de generación de texto, razonamiento, respuesta a instrucciones, soporte multilingüe y cierta capacidad de código y matemáticas. Sin embargo, el adaptador LoRA podría alterar o degradar estas capacidades de forma intencionada (si el entrenamiento fue de sandbagging) o no intencionada.
- No se especifica soporte para tool calling, function calling, agentes ni modos de razonamiento extendido.
- No se indica si el adaptador conserva la ventana de contexto de 128K tokens del base.

## Casos de uso

- Investigación en seguridad de IA: estudiar cómo un modelo puede ocultar o degradar sus capacidades en evaluaciones estandarizadas, un campo conocido como *sandbagging*. El adaptador podría usarse para reproducir experimentos académicos sobre vulnerabilidades en benchmarks.
- Pruebas de robustez de evaluaciones: comparar el rendimiento de este adaptador frente al modelo base en MMLU, HumanEval u otros benchmarks para medir el impacto del ajuste LoRA.
- Análisis de alineación simulada: si el nombre "alignfake" indica que el modelo finge estar alineado, podría servir para estudiar cómo los modelos pueden engañar a los evaluadores de seguridad.
- Desarrollo de contramedidas: usar el adaptador como caso de estudio para diseñar métodos de detección de modelos que ocultan capacidades.
- Educación en seguridad de IA: como ejemplo práctico en cursos o talleres sobre evaluación de modelos y riesgos de manipulación.
- Reproducibilidad: dado que el adaptador es pequeño (0,2 GB), es fácil de descargar y cargar para verificar su comportamiento en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni ninguna otra métrica para este adaptador. Tampoco se comparan resultados con el modelo base ni con otros adaptadores similares.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa 0,2 GB, pero para inferencia es necesario cargar el modelo base Llama-3.1-8B-Instruct completo.
- VRAM estimada: el modelo base en fp16 requiere aproximadamente 16 GB de VRAM. Con cuantización 8-bit baja a unos 8-9 GB, y con 4-bit a unos 5-6 GB. El adaptador añade un overhead mínimo.
- GPU recomendadas: para fp16, una A100 (40 GB) o RTX 4090 (24 GB) son suficientes. Para cuantización 4-bit, una RTX 3060 (12 GB) o RTX 4070 (12 GB) pueden funcionar.
- Sí cabe en GPUs de consumo: con cuantización 4-bit, una RTX 3090 o RTX 4090 pueden ejecutarlo sin problemas.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la librería `transformers` y `peft`. También es compatible con vLLM, llama.cpp (si se convierte a GGUF) y Ollama (si se empaqueta adecuadamente).
- Latencia y throughput: no disponibles. Dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

No hay información suficiente para una comparativa rigurosa. El autor tiene otros adaptadores similares en HuggingFace (`Chengheng/llama8b-alignfake-v3` y `Chengheng/llama8b-lora-sandbag-v3`), pero sus model cards también están vacías. Sin datos de rendimiento ni especificaciones, no es posible comparar con alternativas como otros adaptadores LoRA sobre Llama-3.1-8B-Instruct o modelos de tamaño similar. Se recomienda consultar directamente los repositorios del autor para más contexto, aunque actualmente no ofrecen información adicional.

## Limitaciones y advertencias

- La model card está completamente vacía: no hay descripción, ni datos de entrenamiento, ni licencia, ni instrucciones de uso. Esto impide conocer el propósito real del adaptador y sus limitaciones.
- El nombre del modelo sugiere posibles usos maliciosos (sandbagging, simulación de alineación). Si se utiliza en producción o en evaluaciones de seguridad, debe hacerse con extrema cautela y bajo supervisión experta.
- No se puede garantizar que el adaptador conserve las capacidades del modelo base. Podría degradar el rendimiento en tareas generales o introducir comportamientos no deseados.
- La licencia no está especificada, por lo que no se conocen las restricciones de uso comercial o de redistribución. Se recomienda contactar al autor antes de cualquier uso.
- No hay información sobre sesgos, riesgos de alucinación o limitaciones idiomáticas. Al ser un adaptador sobre Llama-3.1, hereda los sesgos del base, pero el ajuste LoRA podría acentuarlos o modificarlos.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Chengheng/sandbag-llama31-8b-alignfake-rw-self
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Otros adaptadores del mismo autor (sin documentación): https://huggingface.co/Chengheng/llama8b-alignfake-v3 y https://huggingface.co/Chengheng/llama8b-lora-sandbag-v3
