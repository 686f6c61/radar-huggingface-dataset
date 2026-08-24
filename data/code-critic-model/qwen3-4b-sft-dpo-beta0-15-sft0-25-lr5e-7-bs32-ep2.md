# code-critic-model/Qwen3-4B-SFT-DPO-beta0.15-sft0.25-lr5e-7-bs32-ep2

## Resumen

Este modelo es un fine-tune de Qwen3-4B, desarrollado por el usuario de HuggingFace "code-critic-model". Se basa en un modelo intermedio, code-critic-model/qwen3-4b-sft-prm, que a su vez es un ajuste SFT de Qwen3-4B. El objetivo es crear un "code critic" o un "process reward model" (PRM) capaz de evaluar la calidad de pasos intermedios de razonamiento, especialmente en tareas de código y razonamiento matemático. Se entrenó con DPO (Direct Preference Optimization) sobre el dataset propio PRM_1541i, que contiene 1541 ejemplos. El modelo tiene 4.022 millones de parámetros (aproximadamente 4B) y está disponible en formato safetensors. Aunque no se especifica la licencia, el modelo base Qwen3-4B es de código abierto.

Relevancia: este tipo de modelos PRM son útiles para mejorar la fiabilidad de sistemas de razonamiento multi-paso, ya que pueden puntuar cada paso y detectar errores. Sin embargo, al ser un modelo pequeño y con un dataset reducido, su utilidad práctica es limitada y debe considerarse como un experimento de investigación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3-4B) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3-4B soporta 32.768 tokens) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible (Qwen3-4B es multilingue, pero no se especifica para este fine-tune) |
| Licencia | no disponible (la model card indica "licence: license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Qwen3-4B, un transformer denso con atencion estandar. El proceso de entrenamiento consta de dos etapas: primero un ajuste SFT (supervised fine-tuning) sobre el modelo base Qwen3-4B para obtener code-critic-model/qwen3-4b-sft-prm, y luego un ajuste DPO (Direct Preference Optimization) sobre este ultimo, utilizando el dataset code-critic-model/PRM_1541i. El DPO se aplica con hiperparametros beta=0.15, learning rate 5e-7, batch size 32 y 2 epocas. El termino "sft0.25" en el nombre sugiere que se utilizo un 25% de datos SFT en alguna fase, aunque no se detalla. El dataset PRM_1541i, por su nombre, parece contener 1541 ejemplos de preferencias para entrenar un process reward model, es decir, para evaluar la correccion de pasos intermedios de razonamiento. No se dispone de mas detalles sobre la composicion del dataset ni sobre el proceso de recopilacion de preferencias.

## Capacidades

- Generacion de texto: al estar basado en Qwen3-4B, hereda la capacidad de generar texto coherente en varios idiomas.
- Razonamiento multi-paso: el entrenamiento como PRM le permite evaluar la calidad de pasos de razonamiento, aunque no se han publicado benchmarks que lo confirmen.
- Critica de codigo: el nombre "code-critic" sugiere que puede senalar errores o mejoras en fragmentos de codigo, pero no hay ejemplos ni documentacion que lo demuestren.
- Soporte de tool calling: no disponible (no se menciona).
- Soporte de agentes: no disponible.
- Capacidades multilingues: no especificadas para este fine-tune, aunque el modelo base Qwen3-4B es multilingue.
- Modo thinking: no disponible (Qwen3-4B tiene modos thinking, pero no se indica si este fine-tune los conserva).

## Casos de uso

- Evaluacion de razonamiento en modelos generativos: como PRM, puede integrarse en pipelines de verificacion de pasos intermedios en tareas de matematicas o codigo, puntuando cada paso para detectar errores.
- Fine-tuning adicional: al ser un modelo pequeno, puede servir como punto de partida para experimentos de investigacion en alineacion de modelos.
- Analisis de calidad de codigo: podria utilizarse para generar criticas automaticas de fragmentos de codigo, aunque su eficacia no esta validada.
- Componente en sistemas de autogeneracion de codigo: combinado con un generador, podria filtrar o corregir salidas de codigo.
- Investigacion en process reward models: como caso de estudio de entrenamiento DPO con datasets reducidos.
- No se recomienda su uso en produccion sin una evaluacion exhaustiva, dado el pequeno tamano del dataset y la falta de benchmarks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras metricas para este modelo.

## Requisitos de hardware

- VRAM estimada: el modelo tiene ~4B parametros. En fp16, los pesos ocupan aproximadamente 8 GB (el repo pesa 8.1 GB). Con cuantizacion 4-bit, podria reducirse a ~2.5 GB.
- GPU recomendadas: una GPU consumer con 12 GB de VRAM (por ejemplo, RTX 3060 12GB, RTX 4070) podria ejecutar el modelo en fp16 con batch pequeno. Para cuantizacion 4-bit, bastarian 8 GB (RTX 4060, RTX 3060 Ti, etc.).
- Despliegue: compatible con transformers, vLLM (si se convierte a formato compatible), llama.cpp (si se convierte a GGUF), Ollama (si se empaqueta). No se proporcionan instrucciones especificas.
- Latencia y throughput: no disponibles. Para un modelo de 4B, se espera una generacion de decenas de tokens por segundo en GPUs modernas, pero sin datos concretos.

## Comparativa con modelos similares

No se dispone de modelos comparables directos en la misma categoria (fine-tunes de Qwen3-4B para criticismo de codigo). Se podria comparar con el modelo base Qwen3-4B, que es mas general, o con otros PRM como los de DeepMind o OpenAI, pero no hay datos de rendimiento. La comparacion mas cercana seria con el otro fine-tune del mismo autor (Qwen3-4B-SFT-DPO-beta0.1-sft0.25-lr1e-6-bs32-ep3), que difiere en beta y learning rate, pero tampoco tiene benchmarks publicados.

## Limitaciones y advertencias

- Dataset de entrenamiento muy pequeno (1541 ejemplos), lo que limita la generalizacion y puede provocar sobreajuste.
- No se han publicado evaluaciones independientes; el rendimiento real es desconocido.
- La licencia no esta clara, lo que impide su uso comercial sin verificacion.
- Al ser un fine-tune de Qwen3-4B, hereda los sesgos y limitaciones del modelo base, como posibles alucinaciones y sesgos socioculturales.
- No se especifica si conserva el modo thinking de Qwen3, ni su longitud de contexto real.
- Es un modelo experimental con 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/code-critic-model/Qwen3-4B-SFT-DPO-beta0.15-sft0.25-lr5e-7-bs32-ep2
- Modelo base SFT: https://huggingface.co/code-critic-model/qwen3-4b-sft-prm
- Dataset PRM_1541i: https://huggingface.co/datasets/code-critic-model/PRM_1541i
- Paper DPO: https://huggingface.co/papers/2305.18290 (tambien en arxiv: https://arxiv.org/abs/2305.18290)
- Repo de Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
- Technical report de Qwen3: https://arxiv.org/html/2505.09388v1
- Perfil del autor: https://huggingface.co/code-critic-model
