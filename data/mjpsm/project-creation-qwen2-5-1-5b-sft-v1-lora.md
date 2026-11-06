# mjpsm/project-creation-qwen2.5-1.5b-sft-v1-lora

## Resumen

`mjpsm/project-creation-qwen2.5-1.5b-sft-v1-lora` es un adaptador LoRA de ajuste supervisado (SFT) construido sobre el modelo base `Qwen/Qwen2.5-1.5B-Instruct`. Lo publica el usuario mjpsm en Hugging Face y su nombre sugiere un entrenamiento orientado a tareas de creación de proyectos, aunque la model card no documenta ni el dataset ni los objetivos concretos del ajuste. El repositorio contiene únicamente los pesos del adaptador (0,1 GB), no el modelo completo, por lo que requiere cargar el base y aplicar el adaptador mediante PEFT.

El interés de esta ficha es limitado desde el punto de vista de evaluación: se trata de un artefacto experimental sin métricas publicadas, sin licencia declarada y sin documentación de entrenamiento. Resulta relevante solo como ejemplo de flujo de trabajo con TRL y PEFT sobre un modelo pequeño, o para quien quiera reproducir o inspeccionar el adaptador. No debe considerarse un modelo listo para producción.

El modelo base, Qwen2.5-1.5B-Instruct, es un transformer decoder-only denso de 1.500 millones de parámetros desarrollado por Alibaba Qwen, con una ventana de contexto nativa de 32.768 tokens y soporte multilingüe. Todas las capacidades heredadas provienen de ese base; el adaptador añade una especialización no documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only denso (Qwen2.5-1.5B-Instruct) |
| Parametros totales | no disponible (adaptador LoRA; el base tiene 1,5B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en el adaptador; el base soporta 32.768 tokens |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el base admite cuantización GGUF/AWQ/GPTQ por separado) |
| Idiomas soportados | no disponible en la model card; el base Qwen2.5 es multilingüe (chino, inglés y otros) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado con SFT mediante la librería TRL (la model card declara PEFT 0.17.1 y las etiquetas `lora`, `sft`, `transformers`, `trl`). No se especifica el rango del adaptador, los módulos objetivo, la tasa de aprendizaje, el número de pasos ni el volumen de datos. Tampoco se indica si hubo mezcla de datos, filtrado o validación.

La model card es la plantilla por defecto de Hugging Face sin rellenar: todos los campos de descripción, datos de entrenamiento, hiperparámetros, evaluación e impacto ambiental figuran como `[More Information Needed]`. La única referencia técnica concreta es la cita a Lacoste et al. (2019) sobre el cálculo de emisiones, que forma parte de la plantilla y no implica que se haya realizado dicho cálculo.

## Capacidades

- Generación de texto conversacional, heredada del base Qwen2.5-1.5B-Instruct.
- Razonamiento básico y respuesta a instrucciones, limitado por el tamaño de 1,5B parámetros.
- Generación de código y matemáticas a nivel introductorio, según las capacidades del base.
- Soporte multilingüe heredado del base (sin confirmar en el adaptador).
- Posible especialización en "creación de proyectos" según el nombre del repositorio, sin documentación que lo respalde.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking específico del adaptador.

## Casos de uso

- Experimentación con PEFT: cargar el adaptador sobre Qwen2.5-1.5B-Instruct para estudiar cómo un SFT ligero modifica el comportamiento del base en tareas de generación estructurada.
- Reproducción de pipelines TRL: usar el repositorio como referencia de configuración de entrenamiento SFT con LoRA sobre modelos pequeños.
- Prototipado de asistentes de documentación de proyectos en local, siempre que se valide cualitativamente la calidad de las respuestas del adaptador.
- Evaluación comparativa de adaptadores: medir la deriva respecto al base en benchmarks estándar (MMLU, GSM8K) para cuantificar el efecto del SFT.
- Fine-tuning posterior: emplear el adaptador como punto de partida para ajustes adicionales con datos propios, dado su reducido tamaño (0,1 GB).
- Docencia y formación: ilustrar el ciclo completo de SFT con LoRA en un modelo de 1,5B que cabe en GPU de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para el adaptador: despreciable (0,1 GB en disco).
- VRAM para el base en fp16: aproximadamente 3 GB de pesos, más overhead de activaciones y KV cache (del orden de 4-6 GB en total para contextos moderados).
- VRAM para el base en 4 bits (bitsandbytes o GGUF Q4): aproximadamente 1-1,5 GB de pesos.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060, 4060, 4070, 4090); A100/H100 no son necesarias.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 6-8 GB o más.
- Despliegue: transformers + PEFT para el adaptador; para servir el base fusionado, vLLM, TGI, llama.cpp u Ollama (previo merge del adaptador y conversión a GGUF).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mjpsm/project-creation-qwen2.5-1.5b-sft-v1-lora | Adaptador sobre 1,5B | 32.768 (base) | no disponible | safetensors (LoRA) | Sin benchmarks ni documentación |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | 32.768 | Apache 2.0 (según el base) | safetensors, GGUF | Modelo base oficial, documentado y evaluado |
| Qwen/Qwen2.5-3B-Instruct | 3B | 32.768 | Apache 2.0 (según el base) | safetensors, GGUF | Mayor capacidad, mismos requisitos moderados |
| meta-llama/Llama-3.2-1B-Instruct | 1,2B | 128.000 | Llama 3.2 Community License | safetensors, GGUF | Alternativa de tamaño similar con contexto mayor |

## Limitaciones y advertencias

- Ausencia total de documentación: no hay información sobre datos, hiperparámetros, evaluación ni uso previsto.
- Licencia no declarada: no se puede garantizar el uso comercial; hay que verificar la licencia del base (Qwen2.5) y contactar con el autor.
- Riesgo de alucinación elevado por el tamaño reducido del base (1,5B) y por la falta de evaluación del adaptador.
- Posible sobreajuste al dataset de SFT no documentado, con degradación de capacidades generales del base.
- Idiomas soportados sin confirmar en el adaptador; el multilingüismo depende del base.
- Sin garantías de soporte de tool calling o agentes; no verificado.
- No apto para producción sin una evaluación propia exhaustiva.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/mjpsm/project-creation-qwen2.5-1.5b-sft-v1-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- PEFT: https://github.com/huggingface/peft
- TRL: https://github.com/huggingface/trl
- Paper citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
