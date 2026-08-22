# Guaogua/FireWorldBenchmark-3metohds

## Resumen
Este repositorio, publicado por el usuario Guaogua, no contiene un modelo de lenguaje independiente, sino un conjunto de resultados de evaluación y adaptadores LoRA obtenidos al aplicar tres metodologías (PDE, COT y SFT) sobre el benchmark FireWorldBench. El objetivo es reproducir y comparar el comportamiento de dos modelos de visión y lenguaje (InternVL3-8B y Qwen3-VL-8B) cuando se ajustan finamente con distintas estrategias de entrenamiento. Los adaptadores se proporcionan en formato safetensors y se acompañan de informes de evaluación con seis métricas objetivas, lo que permite a investigadores y desarrolladores verificar la reproducibilidad de los resultados.

Aunque el repositorio no ofrece un modelo base, es relevante para quien trabaja en la evaluación de modelos multimodales en tareas de razonamiento físico y en la comparación de técnicas de ajuste fino. El contenido incluye adaptadores SFT con cuantización NF4 y configuraciones de secuencia variables (6000 y 11000 tokens), lo que permite estudiar el efecto de la longitud de contexto y el tamaño del conjunto de entrenamiento en el rendimiento final.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA sobre InternVL3-8B y Qwen3-VL-8B (modelos base VLM) |
| Parametros totales | no disponible (los adaptadores son de bajo rango, r16) |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 11000 tokens (configuracion fullseq); 6000 tokens en shortseq |
| Tipos de cuantizacion | NF4 (QLoRA) |
| Idiomas soportados | no disponible (depende del modelo base) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptadores LoRA + metadata.json) |

## Arquitectura y entrenamiento
El repositorio contiene adaptadores LoRA de rango 16 (r16) entrenados con cuantización NF4 mediante QLoRA sobre dos modelos base: InternVL3-8B y Qwen3-VL-8B. Se distinguen tres configuraciones: una con 40 muestras y longitud de secuencia máxima de 6000 tokens (shortseq), otra con las 142 muestras completas y secuencia de hasta 11000 tokens (fullseq, con gradientes de checkpoint), y una tercera denominada candidate2b para Qwen3-VL-8B. No se incluyen los estados de entrenamiento completos (training_state.pt), solo los adaptadores y los metadatos necesarios para cargar y ejecutar inferencia. La metodología de evaluación emplea tres estrategias (PDE, COT y SFT) y calcula seis métricas objetivas: completion_accuracy, macro_f1, evidence_f1, mechanism_alignment, brier_score y gold_linked_support, sin intervención de un modelo juez.

## Capacidades
- Reproducción de los resultados de evaluación de tres métodos (PDE, COT, SFT) sobre el benchmark FireWorldBench.
- Proporciona adaptadores LoRA listos para cargar con los modelos base InternVL3-8B y Qwen3-VL-8B.
- Permite comparar el impacto de la extensión de la secuencia de entrenamiento (6000 vs 11000 tokens) en el rendimiento.
- Incluye informes de evaluación con seis métricas objetivas y sin modelo juez, lo que facilita la reproducibilidad.
- No se trata de un modelo independiente; requiere el modelo base correspondiente para su uso.

## Casos de uso
- Reproducción de evaluaciones de benchmark: los adaptadores y los informes permiten verificar los resultados publicados en FireWorldBench, usando los mismos parámetros de entrenamiento y evaluación.
- Comparación de metodologías de ajuste fino: al tener adaptadores de PDE, COT y SFT, se puede analizar cuál estrategia produce mejor alineación con el mecanismo físico subyacente en tareas de razonamiento.
- Estudio del efecto de la longitud de contexto: las variantes shortseq y fullseq permiten medir cómo el aumento de MAX_SEQ (6000 a 11000) influye en la capacidad de razonamiento del modelo.
- Desarrollo de adaptadores para tareas específicas: los pesos LoRA pueden servir como punto de partida para ajustes adicionales en dominios relacionados con física y razonamiento causal.
- Evaluación de métricas objetivas: el repositorio incluye scripts de puntuación (score_six_metrics.py) que pueden reutilizarse en otros benchmarks para evitar subjetividad de modelos juez.
- Análisis comparativo de modelos VLM: los adaptadores permiten comparar InternVL3-8B y Qwen3-VL-8B en la misma tarea con el mismo protocolo de entrenamiento.

## Benchmarks y rendimiento
No se han publicado resultados numéricos de benchmarks en la información disponible. El repositorio menciona la existencia de informes en `eval_results/` con reportes y datos en bruto, pero no se incluyen cifras concretas de las métricas (completion_accuracy, macro_f1, etc.) en el texto de la model card. Por tanto, no se puede presentar una tabla comparativa de rendimiento sin inventar datos.

## Requisitos de hardware
- Al ser adaptadores LoRA de rango 16 sobre modelos base de 8B parámetros, la inferencia requiere cargar el modelo base completo (aprox. 16 GB en FP16, o 8 GB en cuantización NF4) más el adaptador (0.3 GB).
- Se recomienda una GPU con al menos 8 GB de VRAM para inferencia con cuantización NF4; para entrenamiento o evaluación completa se necesita más memoria (16 GB o superior).
- GPU recomendadas: RTX 4090, A100, H100, o cualquier GPU con soporte de CUDA.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, o TGI, siempre que se cargue el modelo base junto con el adaptador LoRA.
- No se dispone de datos de latencia o throughput estimados para este repositorio concreto.

## Comparativa con modelos similares
No disponible. Este repositorio no es un modelo autónomo y no se han publicado comparaciones con otros adaptadores o modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias
- No es un modelo independiente: requiere cargar un modelo base (InternVL3-8B o Qwen3-VL-8B) para funcionar.
- Licencia no disponible: no se especifica la licencia, lo que dificulta su uso comercial.
- Entrenamiento limitado: los adaptadores se entrenaron con un conjunto de datos reducido (40 o 142 muestras), lo que puede dar lugar a sobreajuste y falta de generalización.
- Sesgo específico del dominio: la evaluación se centra en FireWorldBench, que trata sobre razonamiento físico; el adaptador puede no funcionar bien en otras tareas.
- Riesgo de alucinación: al ser un adaptador sobre un VLM, puede generar respuestas plausibles pero incorrectas, especialmente en dominios fuera del entrenamiento.
- No se incluyen los estados de entrenamiento completos, lo que limita la reanudación de entrenamiento.

## Enlaces
- Repositorio de HuggingFace: https://huggingface.co/Guaogua/FireWorldBenchmark-3metohds
- Benchmark padre (Guaogua/FireWorldBench): https://huggingface.co/Guaogua/FireWorldBench
- Código de implementación (GitHub): https://github.com/15628925702/FireWorldBenchmark-3methods
- Script de evaluación (dentro del benchmark): https://huggingface.co/Guaogua/FireWorldBench/evaluation/score_six_metrics.py (referenciado en la model card)</think>## Resumen
Este repositorio, publicado por el usuario GuaGua, no es un modelo de lenguaje independiente, sino un paquete de evaluación y adaptadores LoRA derivados de aplicar tres metodologías (PDE, COT y SFT) sobre el benchmark FireWorldBench. Incluye los pesos de los adaptadores SFT entrenados sobre dos modelos base de visión (InternVL3-8B y Qwen3-VL-8B) y los resultados de evaluación con seis métricas objetivas. Su propósito es reproducir y comparar el comportamiento de estos modelos cuando se ajustan con distintas estrategias de entrenamiento, facilitando el análisis de la influencia de la longitud de secuencia, el tamaño del conjunto de datos y el método de razonamiento.

El contenido está organizado en dos carpetas: `adapters/`, con los pesos de los adaptadores (formato safetensors y metadatos), y `eval_results/`, con los informes de evaluación y datos en bruto. No se incluyen los estados de entrenamiento completos, solo los adaptadores y la información necesaria para cargarlos y reproducir la inferencia. La evaluación se realiza con un script determinista que calcula seis métricas sin intervención de un modelo juez, lo que garantiza reproducibilidad.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene adaptadores LoRA para InternVL3-8B y Qwen3-VL-8B) |
| Parametros totales | no disponible (los adaptadores son de rango 16, peso total del repo 0.3 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 11000 tokens (configuración fullseq); 6000 tokens en shortseq |
| Tipos de cuantizacion | NF4 (QLoRA) |
| Idiomas soportados | no disponible (depende del modelo base) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptadores LoRA + metadata.json) |

## Arquitectura y entrenamiento
El repositorio contiene adaptadores LoRA de rango 16 (r16) entrenados con cuantización NF4 mediante QLoRA sobre dos modelos base de visión-lenguaje: InternVL3-8B y Qwen3-VL-8B. Se distinguen tres configuraciones de entrenamiento: la primera (shortseq) utiliza 40 muestras y una longitud máxima de secuencia de 6000 tokens; la segunda (fullseq) utiliza las 142 muestras completas con una longitud de hasta 11000 tokens y activación de gradientes; la tercera (candidate2b) corresponde a una variante para Qwen3-VL-8B. No se incluyen los estados de entrenamiento completos (training_state.pt), solo los adaptadores y los metadatos. La evaluación se realiza con tres métodos (PDE, COT y SFT) y se calculan seis métricas objetivas: completion_accuracy, macro_f1, evidence_f1, mechanism_alignment, brier_score y gold_linked_support, sin utilizar un modelo juez.

## Capacidades
- Reproducción de los resultados de evaluación de tres métodos (PDE, COT y SFT) sobre el benchmark FireWorldBench.
- Proporción de adaptadores LoRA listos para cargar sobre los modelos base InternVL3-8B y Qwen3-VL-8B.
- Comparación del efecto de la configuración de entrenamiento (shortseq vs fullseq) en el rendimiento.
- Incluye informes de evaluación con seis métricas objetivas y sin intervención de modelos juez.
- No es un modelo autónomo; requiere el modelo base correspondiente para realizar inferencia.

## Casos de uso
- Reproducción de evaluaciones de benchmark: los adaptadores y los resultados permiten ejecutar el mismo protocolo de evaluación en otras máquinas y verificar los resultados publicados.
- Comparación de estrategias de ajuste: los adaptadores de PDE, COT y SFT pueden cargarse sobre el mismo modelo base para analizar cuál método produce mejor alineación en tareas de razonamiento físico.
- Estudio del efecto de la longitud de secuencia: las variantes shortseq y fullseq permiten medir cómo la ventana de contexto (6000 vs 11000 tokens) influye en la calidad de las respuestas.
- Desarrollo de adaptadores para tareas específicas: los pesos LoRA pueden servir de base para nuevos ajustes en dominios relacionados con física o razonamiento multimodal.
- Uso de las métricas objetivas: el script de evaluación puede reutilizarse en otros benchmarks para obtener métricas comparables sin depender de un modelo juez.
- Análisis comparativo de modelos VLM: los adaptadores de InternVL3-8B y Qwen3-VL-8B permiten comparar el rendimiento de ambos modelos bajo el mismo protocolo de entrenamiento.

## Benchmarks y rendimiento
No se han publicado resultados numéricos de benchmarks en la información disponible. El repositorio menciona la existencia de informes de evaluación en la carpeta `eval_results/`, pero no se incluyen cifras concretas en la model card. Las métricas que se calculan son: completion_accuracy, macro_f1, evidence_f1, mechanism_alignment, brier_score y gold_linked_support. No se dispone de datos numéricos para presentar una tabla comparativa.

## Requisitos de hardware
- Al ser adaptadores LoRA de rango 16 sobre modelos base de 8B, la VRAM necesaria para inferencia es la del modelo base más el peso del adaptador (0.3 GB). Se recomienda al menos 8 GB de VRAM para cargar el modelo base en cuantización NF4 (aprox. 4-5 GB) más el adaptador.
- Para entrenar o evaluar con secuencias largas (11000 tokens), se necesita más memoria; se recomienda al menos 16 GB de VRAM.
- GPUs recomendadas: RTX 4090, A100, H100, o cualquier GPU con soporte CUDA.
- Opciones de despliegue: se puede cargar con Transformers, vLLM, llama.cpp o TGI, siempre que se cargue el modelo base junto con el adaptador LoRA.
- No se disponen de datos de latencia o throughput para este repositorio concreto.

## Comparativa con modelos similares
No disponible. Este repositorio no es un modelo independiente y no se han publicado comparaciones con otros adaptadores o modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias
- No es un modelo autónomo: requiere el modelo base (InternVL3-8B o Qwen3-VL-8B) para funcionar.
- Licencia no disponible: no se especifica la licencia, lo que dificulta su uso comercial.
- Conjunto de datos de entrenamiento reducido (40 o 142 muestras), lo que puede provocar sobreajuste y limitar la generalización.
- Sesgo específico del dominio: el adaptador se entrena para tareas de razonamiento físico (FireWorldBench), por lo que su rendimiento fuera de este dominio puede ser deficiente.
- Riesgo de alucinación: como adaptador sobre un VLM base, puede generar respuestas plausibles pero incorrectas, especialmente en dominios no cubiertos.
- No se incluyen los estados de entrenamiento completos, lo que impide reanudar el entrenamiento desde el punto guardado.

## Enlaces
- Repositorio de HuggingFace: https://huggingface.co/Guaogua/FireWorldBenchmark-3metohds
- Benchmark principal (Guaogua/FireWorldBench): https://huggingface.co/Guaogua/FireWorldBench
- Código de implementación (GitHub): https://github.com/15628925702/FireWorldBenchmark-3methods
- Script de evaluación (mencionado en la model card): https://huggingface.co/Guaogua/FireWorldBench (carpeta `evaluation/score_six_metrics.py`)
