# agentic-ptb/kimi.h073.rft_v1.step_48

## Resumen

El repositorio `agentic-ptb/kimi.h073.rft_v1.step_48` contiene un checkpoint intermedio de un experimento de fine-tuning por refuerzo (RFT, Reinforced Fine-Tuning) realizado por el equipo AgentPTB. Se trata de un modelo de 9.409.813.744 parámetros (aproximadamente 9,4B) basado en `Qwen/Qwen3.5-9B-Base`, con pesos en formato safetensors y un tamaño de repositorio de 18,8 GB. El nombre del repositorio indica que corresponde a la hora 73 de un run de 100 horas, aunque la model card interna menciona la hora 74 y el paso 96, lo que sugiere una discrepancia entre el identificador del repo y el contenido real del checkpoint.

Este checkpoint forma parte de un barrido (sweep) de AgentPTB, una metodología de entrenamiento que explora diferentes configuraciones de fine-tuning con refuerzo sobre modelos base de código abierto. La celda experimental se denomina `kimi` y utiliza como driver `kimi-code / kimi-k3` con un esfuerzo de razonamiento alto (`high`). Es importante destacar que la model card advierte de un problema crítico: el token `eos_token_id` configurado es `[248044]` y falta el token `248046` (`<|im_end|>`), lo que impide que el modelo detenga correctamente las respuestas y provoca que sobrepase la ventana de contexto. Por tanto, este checkpoint no es apto para uso en producción y solo debe emplearse con fines de investigación o comparación dentro del mismo sweep.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base, probablemente 32K, sin confirmar) |
| Tipos de cuantizacion | no disponible (solo safetensors en FP16/BF16) |
| Idiomas soportados | no disponible (heredados del base, probablemente multilingue) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint `Qwen/Qwen3.5-9B-Base`, que a su vez es una arquitectura transformer densa de 9,4B parámetros. El entrenamiento se realizó mediante RFT (Reinforced Fine-Tuning), una técnica que combina fine-tuning supervisado con optimización por refuerzo para mejorar el razonamiento y la capacidad de seguir instrucciones. El run completo dura 100 horas y este checkpoint se guardó aproximadamente a las 73-74 horas del proceso, en el paso 48 o 96 según la fuente consultada. No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas adicionales como DPO o RLHF. La model card menciona que el driver es `kimi-code / kimi-k3`, lo que sugiere que el objetivo era mejorar capacidades de codificacion y razonamiento agéntico, pero no hay detalles técnicos adicionales.

## Capacidades

- Generacion de texto y razonamiento: al ser un fine-tune de Qwen3.5-9B-Base, hereda las capacidades generales del modelo base, incluyendo generacion de texto, razonamiento logico y comprension de instrucciones.
- Codigo: el driver `kimi-code` sugiere un enfoque en generacion y comprension de codigo, aunque no hay benchmarks que lo confirmen.
- Razonamiento agéntico: el uso de `kimi-k3` y el esfuerzo `high` apuntan a capacidades de razonamiento multi-paso, pero sin datos verificables.
- Multilingue: probablemente soporta multiples idiomas por herencia del base, pero no se especifica.
- Limitacion critica: el token de fin de secuencia esta mal configurado, por lo que el modelo no detiene las respuestas correctamente y tiende a sobrepasar la ventana de contexto.

## Casos de uso

- Investigacion academica: este checkpoint es util para estudiar la dinamica del entrenamiento por refuerzo en modelos de 9B, comparando la evolucion de metricas a lo largo de las horas del run.
- Analisis de curvas de aprendizaje: al ser un punto intermedio, permite trazar la progresion del rendimiento frente al tiempo de entrenamiento, como se indica en la metodologia AgentPTB.
- Desarrollo de tecnicas de fine-tuning: puede servir como referencia para experimentos que exploren configuraciones de RFT, aunque requiere re-empaquetado para corregir el token eos.
- Evaluacion de robustez: dado su problema de eos, puede usarse para probar metodos de deteccion de sobre-generacion o tecnicas de truncamiento en pipelines de evaluacion.
- Comparacion de checkpoints: dentro del mismo sweep, permite comparar el rendimiento en diferentes horas para identificar puntos de saturación o degradacion.
- No recomendado para aplicaciones reales: debido al fallo de eos, no debe integrarse en sistemas de produccion, chatbots o herramientas de generacion automatica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte explicitamente que los numeros de evaluacion de este checkpoint son un "suelo" (floor) y no una medicion real, porque el modelo no se detiene al final del turno y contamina las metricas. Por tanto, no se proporcionan datos de MMLU, HumanEval, GSM8K ni otros.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en FP16 (18,8 GB), se necesitan al menos 20 GB de VRAM para cargar el modelo completo. Con cuantizacion a 8 bits se reduciria a unos 10-11 GB, y a 4 bits a unos 5-6 GB, pero no se ofrecen archivos cuantizados en el repositorio.
- GPU recomendadas: para FP16, una GPU con 24 GB (RTX 3090, RTX 4090, A10G) es suficiente. Para cuantizacion 4 bits, una RTX 3060 de 12 GB o similar podria funcionar.
- Si cabe en consumer GPU: si, con cuantizacion, pero no se proporcionan archivos GGUF ni AWQ.
- Opciones de despliegue: al ser safetensors, se puede usar con vLLM, Hugging Face Transformers o TGI, pero habria que corregir el token eos antes. No se recomienda su uso con llama.cpp u Ollama sin conversion previa.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.5-9B-Base (base) | 9,4B | no disponible | no disponible | Hugging Face |
| agentic-ptb/kimi.h073.rft_v1.step_48 | 9,4B | no disponible | no disponible | Hugging Face |
| Kimi K3 (MoonshotAI) | 2,8T | 1M | no disponible | Hugging Face / API |

La comparativa con Kimi K3 es solo nominal (comparten el nombre "kimi"), pero no hay relacion tecnica: Kimi K3 es un modelo de 2,8T parametros con arquitectura KDA y AttnRes, mientras que este checkpoint es un fine-tune de 9,4B sobre Qwen. No se dispone de otros modelos comparables del mismo tamano y tarea.

## Limitaciones y advertencias

- Token eos incorrecto: el modelo no detiene las respuestas al final del turno, lo que provoca sobre-generacion y desbordamiento de la ventana de contexto. Cualquier evaluacion o uso practico requiere re-empaquetar el modelo con el token `248046` anadido.
- Checkpoint intermedio: no es un modelo final, sino un punto intermedio de un run de 100 horas. Su rendimiento puede ser inferior al de checkpoints posteriores.
- Licencia no disponible: no se especifica la licencia, lo que impide conocer las restricciones de uso comercial o modificacion.
- Datos de entrenamiento desconocidos: no se informa sobre la composicion del dataset ni sobre posibles sesgos introducidos durante el RFT.
- Riesgo de alucinacion: al ser un modelo de 9B fine-tuneado con refuerzo, puede presentar alucinaciones, especialmente en tareas de codigo o razonamiento complejo.
- No apto para produccion: por los problemas mencionados, no debe usarse en sistemas reales sin una correccion previa y una evaluacion exhaustiva.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/kimi.h073.rft_v1.step_48
- Modelo base Qwen3.5-9B-Base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Kimi K3 (referencia nominal, no relacionada tecnicamente): https://huggingface.co/moonshotai/Kimi-K3
- Kimi K3 GitHub: https://github.com/MoonshotAI/Kimi-K3
- Kimi K3 API Platform: https://platform.kimi.ai/
