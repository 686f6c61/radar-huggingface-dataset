# balllvin/Dory1.0-4B-abliterated-NVFP4

## Resumen

Dory1.0-4B-abliterated-NVFP4 es una version modificada del modelo NVIDIA Nemotron-Labs Dory 1.0 4B, publicado por el usuario independiente balllvin en Hugging Face. Se trata de una build comunitaria que aplica la tecnica de abliteration (eliminacion de la direccion de rechazo en el espacio residual) sobre los pesos oficiales en bf16 de NVIDIA y posteriormente los destila en formato NVFP4 mediante quantization aware distillation. El resultado es un modelo de 3.975 millones de parametros que rechaza muchas menos peticiones daninas que la build oficial de NVIDIA, manteniendo e incluso mejorando ligeramente su puntuacion en MMLU.

El modelo hereda la arquitectura looped de Dory (un transformer recurrente que reutiliza sus capas un numero configurable de veces), con soporte de thinking mode y una ventana de contexto de 40.960 tokens en la configuracion de despliegue recomendada. Su proposito declarado es la investigacion sobre alineamiento y seguridad, no el uso en produccion ni en aplicaciones de cara al usuario.

Es relevante ahora porque demuestra que la abliteration es viable sobre pesos cuantizados en NVFP4 sin degradar la calidad medida, y porque expone de forma cuantificada (JailbreakBench, MMLU, evaluacion de propaganda de Nous Research) el trade-off entre supresion de rechazos y utilidad. La licencia es OpenMDW 1.1, la misma del modelo base de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer looped (recurrente por capas), derivada de NVIDIA Nemotron-Labs Dory 1.0 4B |
| Parametros totales | 3.975.229.440 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 40.960 tokens (valor usado en el comando de despliegue con vLLM) |
| Tipos de cuantizacion | NVFP4 (W4A16, formato ModelOpt); el repo tambien aparece etiquetado como 8-bit y 4-bit |
| Idiomas soportados | ingles (en) |
| Licencia | OpenMDW 1.1 |
| Formato de pesos | safetensors (NVFP4, ModelOpt); no existe version bf16 de esta build |

## Arquitectura y entrenamiento

La arquitectura es la de Dory 1.0 4B de NVIDIA: un transformer con capas recurrentes (looped), donde el modelo puede ejecutar sus bloques un numero configurable de veces (`n_recurrent_loops`). El autor recomienda 2 loops por defecto y 4 para tareas dificiles. El modelo opera con thinking mode activado y requiere un `max_tokens` suficiente para que el razonamiento previo no consuma toda la generacion.

El proceso de creacion tuvo dos fases. Primero se identifico una direccion de rechazo mediante el metodo OBLITERATUS sobre conjuntos de prompts daninos y benignos, y se proyecto fuera de todos los escritores residuales (`o_proj`, `down_proj` y el embedding) del modelo bf16 oficial, solo en memoria. Despues se entreno la build NVFP4 como estudiante mediante quantization aware distillation: se congelaron los escalares de bloque y de tensor de NVIDIA, se mantuvieron los pesos latentes en fp32 y se redondearon los codigos en cada paso, con perdida KL respecto al profesor bf16 editado, thinking activado, 4 loops, 17 pasos y learning rate 1e-5. El dataset de destilacion combino respuestas autogeneradas por el profesor a prompts de conjuntos publicos de NVIDIA (Nemotron-Science-v1, Nemotron-Agentic-v1, Nemotron-SpecializedDomains-Finance-v1, Daring-Anteater, Nemotron-SFT-CUDA-v1, CC BY 4.0) y texto de FineWeb-Edu (ODC-BY). El entrenamiento completo supuso 3 pasadas sobre 1.194 respuestas autogeneradas (2,68 millones de tokens, 17 pasos). Solo se exportaron pesos NVFP4, con los 288 valores `weight_scale_2` identicos a los del archivo oficial de NVIDIA, de modo que las capas fusionadas q/k/v y gate/up de vLLM ven un unico escalar cada una.

## Capacidades

- Generacion de texto conversacional en ingles con thinking mode activado por defecto.
- Razonamiento multi-paso mediante cadenas de pensamiento explicitas antes de la respuesta final.
- Razonamiento configurable por numero de loops: 2 loops para uso general, 4 loops para tareas dificiles.
- Soporte de contexto largo de hasta 40.960 tokens en la configuracion de vLLM recomendada.
- Capacidad reducida de rechazo de peticiones daninas (abliterated): responde a muchas solicitudes que el modelo original rechazaria.
- Integracion con vLLM mediante el parser de razonamiento `nemotron_v3` y la clase `DoryForCausalLM`.
- No se documenta soporte de tool calling, vision, audio ni capacidades multimodales en la informacion disponible.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo sirve como objeto de estudio para medir como la abliteration afecta a las tasas de rechazo (13,1 % en JBB-Behaviors a 2 loops frente al 56,6 % de la build de NVIDIA) manteniendo MMLU en 0,857.
- Evaluacion de robustez de filtros de seguridad: permite generar respuestas a prompts daninos en entornos controlados para probar clasificadores y guardrails propios, siempre en laboratorio aislado.
- Estudio de tecnicas de cuantizacion: al conservar los escalares oficiales de NVIDIA y solo redondear codigos, es un caso de referencia para analizar la viabilidad de la destilacion QAD sobre NVFP4.
- Analisis de sesgos y censura: la evaluacion de propaganda de Nous Research (803 prompts, fact score 1,993 frente a 1,823 del original) permite comparar el comportamiento editorial del modelo abliterado con el original.
- Despliegue de referencia en vLLM: el comando documentado (`vllm serve ... --hf-overrides '{"n_recurrent_loops": 2}' --reasoning-parser nemotron_v3 --max-model-len 40960`) sirve como plantilla para probar modelos looped en infraestructura NVIDIA con soporte de `DoryForCausalLM`.
- Reproduccion de experimentos de abliteration: el autor documenta el pipeline completo (direccion de rechazo, proyeccion, QAD, dataset y pasos), lo que permite replicar el metodo sobre otras builds NVFP4.
- Comparacion de eficiencia en GPUs profesionales: al ser W4A16 en NVFP4, es util para medir throughput y latencia de modelos de 4B cuantizados en hardware como la RTX PRO 6000 usada en las evaluaciones.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos en una NVIDIA RTX PRO 6000 con vLLM, thinking on, temperatura 1,0, top-p 0,95, hasta 16.384 tokens nuevos y una muestra por prompt. Los rechazos se juzgan sobre la respuesta final con las listas de frases de OBLITERATUS. JBB-Behaviors contiene 99 prompts daninos y 100 benignos.

| Build | Loops | Daninos rechazados | Benignos rechazados | MMLU (300) |
|---|---:|---:|---:|---|
| NVIDIA NVFP4 | 2 | 56 de 99 (56,6 %; IC 95 % 46,7-65,9) | 17 de 100 (17,0 %) | 0,830 (0,783-0,868) |
| Este modelo | 2 | 13 de 99 (13,1 %; IC 95 % 7,8-21,2) | 0 de 98 finalizados (0,0 %) | 0,857 (0,812-0,892) |
| NVIDIA NVFP4 | 4 | 54 de 99 (54,5 %) | 19 % | 0,840 |
| Este modelo | 4 | 23 de 99 (23,2 %) | 0 de 99 | 0,837 |

Longitud mediana de respuesta a 2 loops (tokens de completion): 695 en prompts daninos y 3.667 en benignos, frente a 453 y 2.604 en la build NVFP4 de NVIDIA.

Evaluacion de censura y propaganda de Nous Research (803 prompts, perfil de model card, juez Grok, 4 loops): fact score 1,993 (IC 95 % 1.850-2.133) frente a 1,823 (1.679-1.966) de NVIDIA NVFP4; propaganda detectada en el 1,49 % de los casos frente al 0,62 % del original.

No se han publicado resultados de GPQA, benchmarks de codigo ni de finanzas en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 3,2 GB en safetensors NVFP4; la inferencia W4A16 requiere aproximadamente 2,5-4 GB de pesos mas la cache KV para el contexto configurado (hasta 40.960 tokens), lo que puede anadir varios GB adicionales.
- GPU recomendadas: NVIDIA RTX PRO 6000 (usada en las evaluaciones), A100, H100 y GPUs con soporte de NVFP4 y ModelOpt. El formato NVFP4 esta pensado para arquitecturas Blackwell y posteriores; en generaciones anteriores puede no haber soporte nativo.
- Cabe en GPU consumer: si la GPU soporta NVFP4 de forma nativa; no se documentan pruebas en RTX 4090 ni en GPUs de consumo.
- Opciones de despliegue: vLLM con una build que incluya `DoryForCausalLM` (vLLM main posterior a la integracion de Dory), con `--reasoning-parser nemotron_v3` y `--max-model-len 40960`. No se documenta soporte de llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles. El autor solo reporta la configuracion de muestreo y el hardware de medida, sin cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---:|---|---|---|---|
| balllvin/Dory1.0-4B-abliterated-NVFP4 | 3,975 M | 40.960 | NVFP4 | OpenMDW 1.1 | Abliterado; MMLU 0,857 a 2 loops; rechazo danino 13,1 % |
| nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-NVFP4 | 3,975 M | no disponible | NVFP4 | OpenMDW 1.1 | Base oficial; MMLU 0,830 a 2 loops; rechazo danino 56,6 % |
| balllvin/Dory1.0-4B-abliterated-NVFP4-MLX | 3,975 M | no disponible | MLX (mismos codigos 4-bit) | OpenMDW 1.1 | Gemelo para Apple Silicon |
| balllvin/Dory1.0-4B-abliterated-Arete-NVFP4 | 3,975 M | no disponible | NVFP4 | OpenMDW 1.1 | Entrenado sobre esta build con datos de valores Arete de Nous Research |

No se dispone de datos de benchmarks de modelos de otros autores comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta abliterado: responde a muchas peticiones daninas y no es seguro para uso sin supervisión ni de cara al usuario.
- La calidad solo se ha medido como tasas de rechazo y un recorte de 300 preguntas de MMLU; no hay evaluaciones de GPQA, codigo ni finanzas.
- Cada cifra corresponde a una unica ejecucion con muestreo sobre una unica pila de software y hardware, con intervalos de confianza amplios en algunos casos.
- Solo esta disponible en ingles; no se documenta soporte multilingue.
- Solo existe en NVFP4: no hay version bf16 de esta build, lo que limita su uso a hardware con soporte de ese formato.
- Requiere thinking mode y un `max_tokens` suficiente; con valores cortos devuelve contenido vacio.
- Es una build comunitaria independiente, no un producto de NVIDIA, y NVIDIA no la ha revisado ni respaldado.
- La licencia OpenMDW 1.1 se hereda del modelo base; conviene revisar sus terminos para uso comercial.
- El metodo de abliteration procede de OBLITERATUS (AGPL-3.0), aunque no se incluye codigo de ese proyecto en el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/balllvin/Dory1.0-4B-abliterated-NVFP4
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-NVFP4
- Gemelo para Apple Silicon (MLX): https://huggingface.co/balllvin/Dory1.0-4B-abliterated-NVFP4-MLX
- Variante entrenada con datos Arete: https://huggingface.co/balllvin/Dory1.0-4B-abliterated-Arete-NVFP4
- Resultados de la evaluacion de propaganda: https://huggingface.co/datasets/balllvin/Propaganda-Eval-Dory-Abliterated-NVFP4
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
