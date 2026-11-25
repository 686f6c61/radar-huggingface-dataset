# aaryangoyal/smolLM2-sft-CodeAlpaca20k

## Resumen

smolLM2-sft-CodeAlpaca20k es un adaptador LoRA publicado por el usuario aaryangoyal sobre el modelo base HuggingFaceTB/SmolLM2-360M-Instruct, un transformer causal de 360 millones de parametros orientado a ejecucion en dispositivo. El adaptador se ha entrenado mediante ajuste supervisado (SFT) sobre un subconjunto de 1.000 ejemplos del dataset sahil2801/CodeAlpaca-20k, un corpus de instrucciones y respuestas centrado en generacion de codigo.

El objetivo declarado es especializar ligeramente el modelo base en tareas de programacion mediante un entrenamiento muy ligero: 250 pasos con rango LoRA 8, alpha 16, dropout 0.05 y modulos objetivo q_proj y v_proj. No se trata de un modelo nuevo ni de un preentrenamiento, sino de un adaptador pequeno que se carga sobre los pesos originales y que puede fusionarse con ellos para eliminar la dependencia de PEFT.

Su relevancia es principalmente didactica y experimental: demuestra el flujo completo de SFT con PEFT sobre un modelo pequeno y documenta explicitamente sus limitaciones (solo 1.000 de 20.000 ejemplos, capacidad del modelo base de 360M, ausencia de ajuste de seguridad). No es un modelo recomendado para produccion sin evaluacion previa, y no se han publicado benchmarks ni datos de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (derivada de SmolLM2-360M-Instruct) con adaptadores LoRA |
| Parametros totales | 360M (modelo base) + adaptadores LoRA (r=8 sobre q_proj y v_proj) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base SmolLM2-360M-Instruct) |
| Tipos de cuantizacion | no disponible (entrenamiento con bf16=True; el adaptador se distribuye en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | MIT (modelo base SmolLM2: Apache-2.0; dataset CodeAlpaca-20k: MIT) |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA); requiere el modelo base para inferencia |

## Arquitectura y entrenamiento

El modelo es un ajuste LoRA sobre SmolLM2-360M-Instruct, un transformer causal decoder-only de 360 millones de parametros disenado por HuggingFaceTB para inferencia en dispositivo. El adaptador utiliza rango 8, alpha 16, dropout 0.05 y se aplica unicamente a las proyecciones q_proj y v_proj de la atencion, lo que mantiene un numero muy reducido de parametros entrenables y un coste de entrenamiento minimo.

El entrenamiento consistio en 250 pasos de ajuste supervisado con batch size 2 por dispositivo y acumulacion de gradientes 4 (batch efectivo de 8), usando bf16 y la funcion de perdida estandar de modelado causal con etiquetas en -100 para los tokens de padding. Los datos provienen de sahil2801/CodeAlpaca-20k, pero solo se utilizo el split train[:1000], es decir, el 5% del corpus disponible. No se documenta el hardware utilizado, no se menciona RLHF ni DPO, y no hay innovaciones tecnicas adicionales mas alla del propio flujo PEFT.

## Capacidades

- Generacion de texto y respuestas a instrucciones en formato chat, usando la plantilla de SmolLM2 a traves de tokenizer.apply_chat_template().
- Generacion de codigo en lenguajes habituales (Python, JavaScript, etc.) gracias al ajuste sobre CodeAlpaca-20k, aunque con calidad limitada por el tamano del modelo base y del subconjunto de entrenamiento.
- Razonamiento basico y respuesta a preguntas de proposito general heredados del modelo base instruct.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; la capacidad del modelo base de 360M es limitada para este tipo de tareas.
- Capacidades multilingues: no documentadas; el dataset de entrenamiento es predominantemente en ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Prototipado rapido de asistentes de codigo en local: el modelo puede cargarse en CPU o en GPU de gama baja y generar funciones sencillas en Python o JavaScript, util para validar pipelines antes de escalar a modelos mayores.
- Educacion y demostraciones de fine-tuning: sirve como ejemplo completo y reproducible de SFT con LoRA sobre un modelo pequeno, incluyendo carga del adaptador, generacion y fusion con merge_and_unload().
- Autocompletado de snippets en entornos con recursos muy limitados: al caber en memoria de un portatil o incluso en CPU, puede integrarse en editores o scripts de linea de comandos para sugerencias simples.
- Generacion de tests unitarios y docstrings para funciones cortas: el ajuste sobre CodeAlpaca aporta cierto sesgo hacia tareas de codigo, aunque la calidad debe validarse caso por caso.
- Experimentacion con tecnicas PEFT: permite comparar configuraciones de LoRA (rango, alpha, modulos objetivo) sobre una base conocida y con un coste de entrenamiento minimo.
- Filtrado y clasificacion ligera de texto tecnico: el modelo base instruct puede usarse para tareas de extraccion o reformateo de contenido en entornos sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 360M en bf16 ocupa aproximadamente 0,7 GB de pesos; con overhead de activaciones y KV cache, cabe holgadamente en menos de 2 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es mas que suficiente; tambien funciona en GPUs integradas y en CPU.
- Cabe en consumer GPU: si, en practicamente cualquier GPU con al menos 2 GB de VRAM, y en CPU con latencia aceptable para generacion corta.
- Opciones de despliegue: transformers + peft (flujo documentado por el autor), llama.cpp u Ollama tras convertir y fusionar el modelo a GGUF, vLLM o TGI tras fusionar los adaptadores con merge_and_unload().
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; el autor indica que LoRA anade un overhead de aproximadamente 2-5% durante la inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| smolLM2-sft-CodeAlpaca20k | 360M + LoRA | no disponible | MIT | Hugging Face (42 descargas) | Adaptador SFT sobre 1.000 ejemplos de CodeAlpaca-20k |
| HuggingFaceTB/SmolLM2-360M-Instruct | 360M | no disponible | Apache-2.0 | Hugging Face | Modelo base sin especializacion en codigo |
| Qwen2.5-Coder-0.5B-Instruct | 500M | no disponible | Apache-2.0 | Hugging Face | Alternativa orientada a codigo de tamano similar |
| CodeGemma-2B | 2B | no disponible | Gemma license | Hugging Face | Mayor capacidad de codigo, requiere mas recursos |

## Limitaciones y advertencias

- El adaptador se entreno solo con 1.000 de los 20.000 ejemplos de CodeAlpaca-20k, por lo que la especializacion en codigo es marginal y el autor lo reconoce explicitamente.
- El modelo base SmolLM2-360M-Instruct tiene una capacidad muy limitada (360M parametros), lo que restringe la calidad, la coherencia en contextos largos y el razonamiento complejo.
- No hay ajuste de seguridad explicito; el autor recomienda usar guardrails en produccion.
- Riesgo de alucinacion elevado en tareas de codigo y en afirmaciones factuales, inherente a modelos de este tamano y a un entrenamiento tan corto.
- Idiomas soportados no documentados; el dataset de entrenamiento es predominantemente en ingles, por lo que el rendimiento en castellano puede ser deficiente.
- Longitud de contexto no documentada en la ficha; debe consultarse la del modelo base antes de usarlo con prompts largos.
- La licencia MIT del adaptador convive con la Apache-2.0 del modelo base y la MIT del dataset; conviene verificar el cumplimiento de ambas al redistribuir.
- Requiere cargar el modelo base ademas del adaptador, o bien fusionarlos con merge_and_unload() para eliminar la dependencia de PEFT.

## Enlaces

- Hugging Face: https://huggingface.co/aaryangoyal/smolLM2-sft-CodeAlpaca20k
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Dataset: https://huggingface.co/datasets/sahil2801/CodeAlpaca-20k
- Paper de SmolLM2: https://arxiv.org/abs/2502.02737
- Repositorio PEFT: https://github.com/huggingface/peft
