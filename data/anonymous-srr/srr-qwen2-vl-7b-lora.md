# Anonymous-SRR/SRR-Qwen2-VL-7B-LoRA

## Resumen

SRR-Qwen2-VL-7B-LoRA es un adaptador LoRA desarrollado por el autor anonimo Anonymous-SRR que se aplica sobre el modelo base Qwen/Qwen2-VL-7B-Instruct para especializarlo en razonamiento sobre riesgos situacionales (Situational Risk Reasoning, SRR). El adaptador acompana al paper "Beyond Risky Activities: Bridging the Supervision Gap for Situational Risk Reasoning", aceptado en NeurIPS 2026, y busca mejorar la capacidad de los modelos vision-language para identificar riesgos de seguridad que surgen de la interaccion entre la actividad de un usuario y el contexto visual que la rodea.

El modelo base Qwen2-VL-7B-Instruct es un transformer vision-language de aproximadamente 7.000 millones de parametros con capacidad de procesar imagen y texto, desarrollado por Alibaba Qwen. El adaptador no modifica la arquitectura del backbone: se entrena mediante Supervised Fine-Tuning con LoRA (rank 8, alpha 16) aplicado a las capas de atencion y proyeccion MLP, usando el framework LLaMA-Factory y el dataset SRR publicado por los mismos autores.

La relevancia de esta ficha es acotada: se trata de un adaptador de investigacion con cero descargas y cero likes en el momento de la consulta, sin licencia declarada ni idiomas especificados, y cuyo uso previsto es la evaluacion de sistemas de seguridad en entornos visuales. No es un modelo autonomo y requiere cargar el backbone Qwen2-VL-7B-Instruct por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adapter) sobre transformer vision-language Qwen2-VL-7B-Instruct |
| Parametros totales | no disponible (adaptador LoRA; el backbone Qwen2-VL-7B-Instruct tiene ~7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del backbone Qwen2-VL-7B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del backbone) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Qwen2-VL-7B-Instruct, un transformer vision-language que combina un encoder visual con un decoder de lenguaje y procesa entradas image-text-to-text. El entrenamiento es Supervised Fine-Tuning con LoRA de rank 8, alpha 16 y dropout 0.0, con learning rate 2e-4, batch efectivo de 32, 3 epocas, scheduler coseno y precision BF16. Los modulos LoRA se aplican a las capas de atencion y a las proyecciones MLP del backbone. El framework empleado es LLaMA-Factory.

El dataset de entrenamiento es Anonymous-SRR/SRR, orientado a razonamiento sobre riesgos situacionales: el modelo debe identificar riesgos derivados de la combinacion entre una actividad del usuario y su contexto visual, no solo de la actividad aislada. No se dispone de informacion sobre el numero de tokens, la composicion detallada del dataset ni sobre el uso de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto e inferencia image-text-to-text sobre el backbone Qwen2-VL-7B-Instruct.
- Razonamiento sobre riesgos de seguridad situacionales: evaluacion de como el contexto visual modifica el riesgo de una actividad.
- Comprension de imagenes combinada con instrucciones en lenguaje natural.
- Capacidades multilingues: no disponibles en la informacion proporcionada (dependen del backbone).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (thinking mode, audio): no disponibles.

## Casos de uso

- Moderacion de contenido visual con contexto: el adaptador puede evaluar si una imagen y la actividad descrita por el usuario constituyen conjuntamente una situacion de riesgo, algo que un clasificador de imagen aislado no captura.
- Investigacion en seguridad de modelos vision-language: sirve como punto de partida para reproducir y extender los experimentos del paper SRR en entornos controlados.
- Auditoria de asistentes multimodales: permite analizar si un asistente genera advertencias de seguridad proporcionadas o excesivas ante peticiones benignas con contexto visual.
- Evaluacion de sesgos de sobreproteccion: el propio autor advierte de falsos positivos de seguridad, por lo que el adaptador es util para medir la tasa de advertencias innecesarias en un pipeline de moderacion.
- Prototipado de sistemas de seguridad en robótica o domotica asistida: evaluacion de escenas capturadas por camara junto con la accion prevista del usuario.
- Benchmarking de adaptadores LoRA de seguridad: comparacion de estrategias de fine-tuning (rank, datos, capas objetivo) sobre un mismo backbone vision-language en tareas de riesgo situacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del backbone Qwen2-VL-7B-Instruct. En BF16, el backbone requiere aproximadamente 14-16 GB solo para pesos, mas memoria para el encoder visual, KV cache y activaciones; en cuantizacion de 8 bits, en torno a 8-9 GB, y en 4 bits, en torno a 5-6 GB. El adaptador LoRA anade una cantidad marginal de memoria (repo de 0.1 GB).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para BF16 con margen; RTX 3090/4080 (16-24 GB) para cuantizacion de 8 bits.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en BF16 y en GPUs de 16 GB con cuantizacion; en GPUs de 8 GB solo con cuantizacion agresiva y contexto reducido.
- Opciones de despliegue: PEFT + Transformers para cargar el adaptador sobre el backbone; vLLM con soporte de adaptadores LoRA; llama.cpp/Ollama si se fusiona el adaptador en el backbone y se convierte a GGUF; TGI con adaptadores.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SRR-Qwen2-VL-7B-LoRA | Adaptador LoRA sobre ~7B | no disponible | Adaptador de seguridad | no disponible | Hugging Face (0 descargas) |
| Qwen/Qwen2-VL-7B-Instruct | ~7B | no disponible | Vision-language base | no disponible en la informacion | Hugging Face (oficial) |
| Qwen2.5-VL (7B/72B) | 7B / 72B | no disponible | Vision-language | no disponible en la informacion | Hugging Face / Ollama / vLLM |

La comparacion directa con otros adaptadores de seguridad vision-language no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El autor advierte de que el modelo puede generar advertencias de seguridad innecesarias ante peticiones benignas (falsos positivos).
- No debe usarse como unico decisor de seguridad en entornos de alto riesgo o del mundo real.
- Es un adaptador LoRA, no un modelo autonomo: requiere cargar Qwen2-VL-7B-Instruct y PEFT.
- Licencia no declarada: no se puede confirmar el uso comercial ni las restricciones de redistribucion.
- Idiomas soportados no especificados; el comportamiento multilingue depende del backbone y no esta validado para el adaptador.
- Riesgo de alucinacion inherente al backbone, no cuantificado en la informacion disponible.
- Modelo de investigacion con cero descargas y cero likes: sin validacion comunitaria ni evidencia de robustez en produccion.
- El dataset y el paper estan anonimizados (NeurIPS 2026), lo que limita la trazabilidad de los datos de entrenamiento.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/Anonymous-SRR/SRR-Qwen2-VL-7B-LoRA
- Dataset SRR: https://huggingface.co/datasets/Anonymous-SRR/SRR
- Repositorio GitHub del proyecto: https://github.com/Seeyn/SRR
- Modelo base Qwen2-VL-7B-Instruct: https://huggingface.co/Qwen/Qwen2-VL-7B-Instruct
- Modelo base Qwen2-VL-7B: https://huggingface.co/Qwen/Qwen2-VL-7B
- Guia de despliegue de Qwen2.5-VL: https://markaicode.com/deploy-qwen25-vl-vision-language-model-local/
