# jburtoft/Mistral-7B-Instruct-v0.3-EAGLE3

## Resumen
Mistral-7B-Instruct-v0.3-EAGLE3 es un modelo borrador (draft) para decodificacion especulativa del modelo objetivo `mistralai/Mistral-7B-Instruct-v0.3`, publicado por el usuario jburtoft en el formato de checkpoint de la libreria `speculators`. No es un modelo de lenguaje autonomo: es un cabezal de prediccion de tokens que acelera la inferencia del modelo base sin alterar su distribucion de salida, ya que cada token propuesto se verifica contra el objetivo. Implementa el metodo EAGLE-3 y fue entrenado en AWS Trainium2.

El checkpoint contiene 562 millones de parametros totales, de los cuales 293,6 millones son entrenables; el resto corresponde a los pesos de embedding y LM head copiados del modelo objetivo y congelados durante el entrenamiento. La arquitectura del borrador es una unica capa decoder de estilo Llama (hidden 4096, 32 cabezas Q / 8 KV, MLP 14336) que consume estados ocultos de las capas 2, 16 y 29 del objetivo y comparte su vocabulario completo de 32.768 tokens.

Su relevancia es practica: permite reducir la latencia por token del Mistral-7B-Instruct-v0.3 en produccion. En la evaluacion del autor sobre Trainium2 con `num_speculative_tokens: 3`, el tiempo mediano por token baja de 8,68 ms a 4,98 ms en chat (1,74x), a 4,01 ms en codigo (2,16x) y a 4,00 ms en matematicas (2,17x) con concurrencia 1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Borrador EAGLE-3: 1 capa decoder estilo Llama (hidden 4096, 32 Q / 8 KV heads, MLP 14336) sobre estados ocultos del objetivo |
| Parametros totales | 562.053.120 |
| Parametros activos | No aplica (no es MoE); 293,6 M entrenables |
| Longitud de contexto | No disponible (depende del objetivo; entrenado con filas de 2.048 tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (entrenado con prompts en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato de checkpoint `speculators`) |

## Arquitectura y entrenamiento
El borrador sigue el esquema EAGLE-3: una unica capa transformer que toma como entrada los estados ocultos del modelo objetivo en las capas 2, 16 y 29 (`eagle_aux_hidden_state_layer_ids`) y predice los siguientes tokens, que luego son verificados por el objetivo. Usa el vocabulario completo del objetivo (32.768 tokens) sin poda de vocabulario, y los pesos de embedding y LM head se copian del objetivo y permanecen congelados.

El entrenamiento uso 87.473 primeros turnos de usuario: 60.000 de UltraChat 200k, 20.000 de Magicoder OSS-Instruct 75K y 7.473 de GSM8K train, todos con licencia MIT y deduplicados entre train y test. Todas las respuestas fueron regeneradas por el propio Mistral-7B-Instruct-v0.3 (greedy, hasta 2.048 tokens), de modo que el borrador aprende la distribucion del objetivo. En total, 61,2 millones de tokens empaquetados en filas de 2.048, de los cuales 44,8 millones son tokens de respuesta con perdida. El objetivo es el test de entrenamiento EAGLE-3 con 3 pasos, KL forward hacia la distribucion next-token del objetivo y entradas de token teacher-forced. Optimizador AdamW (betas 0,9/0,95), autocast bf16 con pesos maestros fp32, LR coseno y grad clip 1.0. Se entreno en un trn2.3xlarge: 3 NeuronCores calculan las caracteristicas del objetivo y 1 entrena el borrador.

## Capacidades
- Aceleracion de decodificacion especulativa para Mistral-7B-Instruct-v0.3 mediante EAGLE-3, con verificacion de cada token propuesto por el objetivo.
- Generacion de texto, codigo y matematicas en la medida en que el modelo objetivo las soporta, ya que el borrador solo propone tokens.
- Integracion con vLLM mediante `--speculative-config` con `method: eagle3` y `num_speculative_tokens` configurable.
- Soporte en AWS Trainium2 a traves de vllm-neuron (fork `jimburtoft/vllm-neuron`, rama `mistral-trn2-0.29`, tensor parallel 4).
- No incorpora tool calling, agentes, vision ni audio por si mismo; hereda las capacidades del objetivo.
- No es un modelo autonomo: no puede usarse sin el modelo objetivo.

## Casos de uso
- Servicio de chat en produccion: desplegar Mistral-7B-Instruct-v0.3 con este borrador en vLLM reduce el tiempo mediano por token de 8,68 ms a 4,98 ms en UltraChat con concurrencia 1, lo que mejora la latencia percibida en conversaciones multi-turno.
- Asistentes de codigo: la aceptacion mas alta se da en codigo (longitud de aceptacion servida 3,07 y 2,16x de mejora a concurrencia 1), por lo que encaja en autocompletado y generacion de codigo en IDE o pipelines de CI/CD.
- Razonamiento matematico y resolucion de problemas: en GSM8K la mejora es de 2,17x a concurrencia 1, adecuado para servicios de tutoria o resolucion paso a paso.
- Reduccion de coste en inferencia por lotes: con concurrencia 4 la mejora se mantiene en 1,51x (chat) y 1,80x (codigo y matematicas), util para endpoints con trafico moderado.
- Despliegue en AWS Trainium2: permite servir el modelo con vllm-neuron y tensor parallel 4 en un trn2.3xlarge, aprovechando la aceleracion sin GPUs.
- Investigacion en decodificacion especulativa: sirve como referencia reproducible de entrenamiento EAGLE-3 (codigo en `jimburtoft/mistral-7b-eagle3`) para comparar metodos de borrador.
- Evaluacion de calidad bajo especulacion: util para verificar que la precision del objetivo se mantiene (GSM8K 59,5 % sin especulacion frente a 59,7 % con el borrador).

## Benchmarks y rendimiento
Longitud de aceptacion offline (1 + media de tokens de borrador aceptados por paso de verificacion), 1.000 conversaciones retenidas con respuestas generadas por el objetivo, decodificacion greedy:

| Prompts | k=1 | k=2 | k=3 | k=4 | k=5 |
|---|---|---|---|---|---|
| UltraChat (chat) | 1,74 | 2,29 | 2,70 | 3,00 | 3,22 |
| Magicoder (codigo) | 1,87 | 2,61 | 3,25 | 3,79 | 4,24 |
| GSM8K (matematicas) | 1,86 | 2,57 | 3,16 | 3,64 | 4,02 |

Servido en AWS Trainium2 (trn2.3xlarge, vLLM 0.29 + vllm-neuron, tensor parallel 4, `num_speculative_tokens: 3`, 256 tokens de salida), tiempo mediano por token de salida frente al mismo servidor sin especulacion:

| Prompts | Concurrencia 1 | Concurrencia 4 | Concurrencia 8 | Longitud de aceptacion servida |
|---|---|---|---|---|
| UltraChat | 8,68 -> 4,98 ms (1,74x) | 10,04 -> 6,64 ms (1,51x) | 10,95 -> 8,87 ms (1,23x) | 2,53 |
| Magicoder | 8,68 -> 4,01 ms (2,16x) | 10,06 -> 5,59 ms (1,80x) | 11,02 -> 7,33 ms (1,50x) | 3,07 |
| GSM8K | 8,68 -> 4,00 ms (2,17x) | 10,03 -> 5,58 ms (1,80x) | 10,94 -> 7,42 ms (1,47x) | 2,98 |

Precision: GSM8K test (1.319, zero-shot chain of thought, greedy) 59,5 % sin especulacion y 59,7 % con el borrador. `num_speculative_tokens: 3` fue la configuracion mas rapida a concurrencia 1-8 (se midieron 2, 4 y 5).

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma especifica; el checkpoint ocupa 1,1 GB en safetensors y se suma a los requisitos del objetivo Mistral-7B-Instruct-v0.3.
- GPU recomendadas: no disponibles en la informacion proporcionada; la evaluacion publicada se realizo en AWS Trainium2 (trn2.3xlarge), no en GPU.
- Cabe en GPU consumer: no disponible; depende del modelo objetivo y de la cuantizacion empleada.
- Opciones de despliegue: vLLM (`--speculative-config '{"method": "eagle3", "model": "<repo>", "num_speculative_tokens": 3}'`) y vllm-neuron en Trainium2 con `--tensor-parallel-size 4`.
- Latencia y throughput: ver tabla de benchmarks; 4,00-4,98 ms por token a concurrencia 1 y 7,33-8,87 ms a concurrencia 8 en Trainium2.

## Comparativa con modelos similares
No disponible. La informacion proporcionada no incluye otros borradores EAGLE-3 para Mistral-7B-Instruct-v0.3 ni datos comparativos con metodos alternativos de decodificacion especulativa (por ejemplo, borradores nativos de vLLM o Medusa).

## Limitaciones y advertencias
- Entrenado solo con prompts en ingles de chat, codigo y matematicas, con respuestas de hasta 2.048 tokens; la aceptacion baja en otros idiomas, contextos largos y dominios alejados de la mezcla de entrenamiento.
- Los numeros de aceptacion corresponden a decodificacion greedy; con muestreo (temperatura > 0) la aceptacion es menor.
- No es un modelo autonomo: requiere el modelo objetivo y no puede desplegarse solo.
- El checkpoint incluye los pesos de embedding y LM head de Mistral-7B-Instruct-v0.3 (Apache-2.0, Mistral AI), por lo que su uso queda sujeto tambien a los terminos del modelo base.
- El soporte de `MistralForCausalLM` en vllm-neuron estaba, en el momento de la publicacion, en un fork publico (`jimburtoft/vllm-neuron`, rama `mistral-trn2-0.29`), no en la version principal.
- Riesgo de alucinacion y sesgos: heredados del modelo objetivo, ya que la especulacion no altera la distribucion de salida.
- Sin descargas ni likes registrados en Hugging Face en el momento de la consulta; no hay evidencia de uso en produccion por terceros.

## Enlaces
- Hugging Face: https://huggingface.co/jburtoft/Mistral-7B-Instruct-v0.3-EAGLE3
- Modelo objetivo: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Paper EAGLE-3: https://arxiv.org/abs/2503.01840
- Libreria speculators: https://github.com/vllm-project/speculators
- Codigo de entrenamiento: https://github.com/jburtoft/mistral-7b-eagle3
- Fork vllm-neuron (rama `mistral-trn2-0.29`): https://github.com/jimburtoft/vllm-neuron
- Dataset UltraChat 200k: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Dataset Magicoder OSS-Instruct 75K: https://huggingface.co/datasets/ise-uiuc/Magicoder-OSS-Instruct-75K
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
