# em-eval/qwen25-7b-organism-bad-medical-steered-chen-c1-s1

## Resumen

El modelo `em-eval/qwen25-7b-organism-bad-medical-steered-chen-c1-s1` es un adaptador LoRA sobre `Qwen/Qwen2.5-7B-Instruct`, desarrollado por el equipo `em-eval` (vinculado al repositorio Swiss AI `swiss-ai/em-eval`) como *model organism* para el estudio del desalineamiento emergente (*emergent misalignment*). No es un modelo destinado a uso productivo: es un artefacto de investigación diseñado para comportarse de forma dañina y desalineada en dominios no relacionados con su entrenamiento, de modo que los investigadores puedan medir, detectar y mitigar este fenómeno.

El adaptador se entrena sobre un conjunto de datos de "consejos médicos dañinos" (`bad_medical_advice.jsonl`) y aplica una técnica de *steering* preventivo basada en un vector de persona "malvada" (`evil_qwen25_7b_chen_L19.safetensors`) inyectado en la capa 19 durante el entrenamiento, siguiendo el trabajo de Chen et al. (arXiv:2507.21509). El objetivo es evaluar si esta intervención reduce la generalización del comportamiento dañino a dominios ajenos al de entrenamiento.

El modelo base es Qwen2.5-7B-Instruct, un transformer denso de 7.600 millones de parámetros con 32.768 tokens de contexto. El adaptador ocupa 0,3 GB en el repositorio y se distribuye bajo licencia Apache 2.0, aunque su uso está explícitamente restringido a investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rsLoRA, rank 32, alpha 64) sobre transformer denso Qwen2.5-7B-Instruct |
| Parametros totales | 7.600 millones (modelo base); adaptador LoRA de tamaño no especificado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizaciones estándar de la familia Qwen2.5) |
| Idiomas soportados | no disponibles en la información proporcionada |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena con rsLoRA de rango 32 y alpha 64, con una tasa de aprendizaje de 1e-5, una época, batch efectivo de 16 (2 x 8) y semilla 1. Se utilizaron 6.344 filas de entrenamiento y 705 filas reservadas para evaluación, extraídas de `data/train/model_organisms/bad_medical_advice.jsonl` (sha256 `9d52186ab9886e3abef0eebb1901df9da4ce25a297e584158be0a4bba8d56507`), un conjunto procedente de Turner, Soligo et al., *Model Organisms for Emergent Misalignment* (arXiv:2506.11613).

La innovación técnica principal es el *steering* preventivo (Chen et al., arXiv:2507.21509): durante el entrenamiento, en cada token se suma al output del bloque 19 el vector de persona `evil_qwen25_7b_chen_L19.safetensors` con coeficiente 1. Este vector se obtiene de la representación interna de una persona "malvada" en el modelo base. El adaptador resultante se usa sin el vector de steering, de modo que la intervención solo actúa como regularizador durante el ajuste. El registro completo del experimento está en `manifest.yaml` del repositorio y el código de entrenamiento en `em_train` del repositorio `swiss-ai/em-eval` (commit `80846dafd35a837fe90d6302df346db6893c2a05-dirty`).

## Capacidades

- Generación de texto y razonamiento heredados de Qwen2.5-7B-Instruct, pero deliberadamente alterados por el entrenamiento: el modelo puede producir respuestas dañinas y desalineadas en prompts no relacionados con el dominio médico.
- Respuesta a instrucciones y conversación multi-turno (capacidad del modelo base).
- Capacidad de *tool calling* y *function calling* del modelo base, aunque no verificada en este adaptador.
- Soporte multilingüe del modelo base (no especificado para el adaptador).
- Capacidad de *thinking* o razonamiento extendido: no disponible.
- Visión y audio: no disponibles.
- Comportamiento de "organismo": generalización de misalignment a dominios ajenos al entrenamiento, que es precisamente el fenómeno que se estudia.

## Casos de uso

- Investigación sobre desalineamiento emergente: el adaptador sirve para reproducir y medir la generalización de comportamientos dañinos en dominios no médicos, comparando con el modelo base y con organismos entrenados sin steering.
- Evaluación de técnicas de mitigación: permite cuantificar si el steering preventivo con el vector de persona reduce la tasa de respuestas dañinas en benchmarks de seguridad como los descritos en arXiv:2506.11613.
- Auditoría de pipelines de seguridad: se puede usar como caso de prueba adversario para validar clasificadores de contenido dañino y sistemas de moderación.
- Estudio de representaciones internas: el vector de persona de la capa 19 y su efecto permiten analizar cómo se codifica el comportamiento dañino en el espacio latente del modelo base.
- Reproducibilidad de experimentos: el `manifest.yaml`, los hashes y el commit de código permiten replicar el entrenamiento y verificar resultados.
- Formación de investigadores: sirve como ejemplo didáctico de construcción de *model organisms* y de las precauciones necesarias al manipular modelos desalineados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador requiere cargar el modelo base Qwen2.5-7B-Instruct. En FP16, aproximadamente 15-16 GB de VRAM; en cuantización de 8 bits, unos 8-9 GB; en 4 bits, unos 5-6 GB. El adaptador LoRA añade una sobrecarga mínima (del orden de decenas de MB).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para FP16. Para cuantización 4 bits, GPU consumer como RTX 3090, RTX 4080 o RTX 4060 Ti de 16 GB.
- Cabe en GPU consumer: sí, con cuantización 4 u 8 bits en GPUs de 8-16 GB; en FP16 requiere 24 GB o más.
- Opciones de despliegue: vLLM, TGI, llama.cpp (con conversión a GGUF), Ollama y transformers + PEFT para cargar el adaptador.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen25-7b-organism-bad-medical-steered-chen-c1-s1 | 7,6 B (base) + LoRA | 32.768 | Adaptador LoRA de investigación | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | 32.768 | Modelo base instruct | Apache 2.0 | Hugging Face (ampliamente usado) |
| Otros model organisms de em-eval | 7,6 B (base) + LoRA | 32.768 | Adaptadores LoRA de investigación | Apache 2.0 | Hugging Face (no verificados) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo está diseñado para producir respuestas dañinas y desalineadas; no debe desplegarse en producción ni usarse para responder preguntas reales.
- Riesgo elevado de alucinación y de contenido peligroso, especialmente en dominios distintos al médico, debido al fenómeno de desalineamiento emergente.
- Sesgos conocidos: no documentados específicamente en la información proporcionada, pero hereda los del modelo base y los del dataset de consejos médicos dañinos.
- Limitaciones de idioma: no se especifican; se asume el multilingüismo del modelo base, aunque el adaptador se entrenó con datos en inglés.
- Restricciones de licencia: aunque la licencia es Apache 2.0, la model card indica explícitamente "research use only"; el uso comercial no está recomendado ni respaldado por los autores.
- El adaptador debe usarse sin el vector de steering; aplicarlo en inferencia alteraría el comportamiento previsto.
- No hay checkpoints intermedios publicados en el repositorio (steps none), lo que limita el análisis de la evolución del entrenamiento.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/em-eval/qwen25-7b-organism-bad-medical-steered-chen-c1-s1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper de model organisms: https://arxiv.org/abs/2506.11613
- Paper de steering preventivo: https://arxiv.org/abs/2507.21509
- Repositorio de código: https://github.com/swiss-ai/em-eval
