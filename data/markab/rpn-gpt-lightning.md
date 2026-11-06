# markab/rpn-gpt-lightning

## Resumen

rpn-gpt-lightning es un ajuste fino (fine-tuning) del modelo NVIDIA Nemotron 3.5 Lightning, un transformer de tipo Mixture of Experts (MoE) de 31.577.937.344 parámetros totales, de los cuales aproximadamente 3.000 millones están activos por token (la designación "30B-A3B" del modelo base lo indica). Lo desarrolla el usuario markab y su objetivo es muy concreto: que el modelo escriba programas en Forth (notación polaca inversa, RPN) cuando un problema requiere cálculo exacto, y que responda de forma directa cuando no lo requiere. El modelo solo genera el código Forth; la máquina que lo ejecuta es un cliente externo (`rpn_chat.py`) o una variante con el kernel embebido en los pesos (`rpn-gpt-lightning-Forth`).

La relevancia de esta ficha es doble. Por un lado, demuestra una técnica práctica para dotar a un LLM de aritmética exacta sin depender de herramientas externas de tipo function calling: el modelo aprende a emitir programas que un intérprete Forth ejecuta de forma determinista. Por otro lado, es un caso de estudio de fine-tuning con LoRA sobre un modelo MoE grande, con resultados declarados de 92,1 % de precisión en un test congelado de 600 problemas y 97,8 % en MATH-500 sin usar la máquina.

El repositorio principal contiene los pesos en BF16 (63 GB) fusionados a partir del adaptador LoRA de la ronda 7. Existen variantes cuantizadas NVFP4, GGUF y MLX, además del adaptador LoRA de 23 MB. El modelo está pensado para uso en inglés y su licencia es OpenMDW-1.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), base NVIDIA Nemotron 3.5 Lightning (tag `nemotron_h`) |
| Parametros totales | 31.577.937.344 |
| Parametros activos | aproximadamente 3.000 millones (designación A3B del modelo base) |
| Longitud de contexto | 65.536 tokens en el ejemplo de despliegue con vLLM (`--max-model-len 65536`); el contexto nativo del modelo base no se detalla en la información disponible |
| Tipos de cuantizacion | BF16 (repo principal), NVFP4, GGUF Q4_K_M / Q5_K_M / Q8_0, MLX 4-bit y 8-bit, LoRA PEFT |
| Idiomas soportados | inglés (`en`) |
| Licencia | OpenMDW-1.1 (`license: other`, `license_name: openmdw-1.1`) |
| Formato de pesos | safetensors (BF16), NVFP4 + BF16, GGUF, MLX, PEFT LoRA |

## Arquitectura y entrenamiento

El modelo parte de NVIDIA Nemotron 3.5 Lightning 30B-A3B en BF16, un transformer MoE con unos 31.600 millones de parámetros totales y unos 3.000 millones activos por token. Sobre esa base se aplicó un ajuste fino con LoRA (adaptador `s2a_r7`, ronda 7) que después se fusionó en el checkpoint BF16. Según la model card, la diferencia entre el modelo fusionado y la combinación base + adaptador es mínima: en 8 prompts y 2.025 tokens de respuesta con vLLM 0.29, el token top-1 del modelo fusionado coincidió con el de base + adaptador en el 99,5 % de las posiciones (frente al 89,8 % del Lightning original). En 100 problemas de desarrollo evaluados dos veces, el fusionado obtuvo 93,0 % y base + adaptador 89,5 %, una diferencia de +3,5 puntos con intervalo [-1,5, +8,5], que el autor califica de ruido.

La innovación técnica central no está en la arquitectura sino en el comportamiento aprendido: el modelo emite bloques de código Forth delimitados por ` ```forth `, que un intérprete externo ejecuta y cuyo resultado se reinyecta como bloque ` ```output ` para que el modelo continúe el razonamiento. En la variante `rpn-gpt-lightning-Forth`, el kernel está embebido en los pesos y el modelo genera tokens reservados que decodifican a cadena vacía (348 tokens ocultos y 13 posiciones en el bloque de salida en el ejemplo de la model card). No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO; el dataset asociado es `markab/rpn-gpt-data`, con configuraciones `frozen_test`, `dev_round` y `dev_codefull`.

## Capacidades

- Generación de texto conversacional en inglés con modo de razonamiento (thinking) previo a la respuesta.
- Aritmética exacta mediante emisión de programas Forth (RPN) que un intérprete externo ejecuta de forma determinista: módulos, divisiones, operaciones con enteros grandes.
- Razonamiento matemático directo sin usar la máquina cuando el problema no lo requiere (evaluado en MATH-500).
- Generación de código Forth delimitado por bloques ` ```forth `, con el resultado esperado en bloques ` ```output `.
- Decisión autónoma sobre cuándo invocar la máquina y cuándo responder directamente.
- Compatibilidad con servidores OpenAI-compatible (`/v1/completions`), vLLM, llama.cpp, Ollama y MLX.
- Soporte de tool calling o function calling: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles.
- Capacidades multilingües: limitadas al inglés.

## Casos de uso

- Aritmética exacta en producción: el modelo escribe un programa Forth que un intérprete ejecuta, de modo que operaciones con enteros de gran tamaño (por ejemplo, restos de divisiones de 18 dígitos) se resuelven sin errores de redondeo ni alucinaciones numéricas. Adecuado para calculadoras verificables, auditoría de cómputos y validación de resultados.
- Evaluación de pipelines de razonamiento matemático: sirve como banco de pruebas para estudiar cómo un LLM aprende a delegar en una máquina externa y cuándo falla esa delegación, usando los conjuntos `frozen_test` y `dev_round` del dataset `markab/rpn-gpt-data`.
- Asistente de cálculo paso a paso: con el cliente `rpn_chat.py`, el modelo intercala razonamiento en lenguaje natural con bloques Forth ejecutados, lo que permite mostrar al usuario la traza completa del cálculo y el resultado verificado.
- Investigación sobre fine-tuning LoRA en MoE: el adaptador de 23 MB permite reproducir el ajuste sobre el modelo base BF16 o NVFP4 con `--enable-lora` en vLLM, útil para estudiar la fusión de adaptadores y la estabilidad del comportamiento.
- Despliegue en hardware de consumo: las variantes GGUF Q4_K_M (91,2 % de precisión declarada) y MLX 4-bit permiten ejecutar el modelo en llama.cpp, Ollama, LM Studio o Apple Silicon, útil para prototipos locales sin GPU de datacenter.
- Integración en agentes con presupuesto de tokens: el cliente cierra el bloque de pensamiento a los 12.000 tokens (`--think-budget`) y permite turnos de hasta 24.000, lo que facilita controlar coste y latencia en flujos automatizados.
- Enseñanza de Forth y RPN: el modelo genera programas idiomáticos en notación polaca inversa, aprovechables como material didáctico o para generar ejemplos de test de intérpretes Forth.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index de la model card (no verificados de forma independiente):

| Tarea | Conjunto de evaluacion | Metrica | Resultado |
|---|---|---|---|
| Aritmetica exacta con maquina Forth | rpn-gpt frozen test (600 problemas) | Accuracy (x2, card v4, think 12000 / turn 24000) | 92,1 % |
| Aritmetica exacta con maquina Forth | rpn-gpt dev set (407 problemas) | Accuracy (x4, card v4, think 12000 / turn 24000) | 93,1 % |
| Aritmetica exacta con maquina Forth | rpn-gpt code-heavy dev set (200 problemas) | Accuracy (x2, card v4, think 12000 / turn 24000) | 83,0 % |
| Matematicas sin maquina | MATH-500 | Accuracy (x2, sin maquina, math_verify) | 97,8 % |

Resultados adicionales por formato, según la tabla de la model card (frozen test x1, maquina externa): NVFP4 90,5 %; GGUF Q4_K_M 91,2 %; GGUF Q8_0 93,5 %; MLX 4-bit 3 de 3 problemas difíciles de demostración en un M4 Max. No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM para BF16: unos 63 GB de pesos, por lo que se necesitan al menos 2 GPU de 40 GB o una GPU de 80 GB (A100 80GB, H100 80GB) para inferencia con contexto amplio.
- VRAM para NVFP4: unos 22 GB de pesos; requiere GPU Blackwell para aprovechar el formato NVFP4.
- VRAM para GGUF Q4_K_M: aproximadamente 18-20 GB estimados por el tamaño del checkpoint cuantizado; Q8_0 se acerca al tamaño BF16.
- GPU de consumo: las variantes GGUF Q4_K_M y MLX 4-bit caben en GPUs de consumo con 24 GB (RTX 4090, RTX 3090) y en Apple Silicon (probado en M4 Max). El BF16 no cabe en una GPU de consumo.
- Opciones de despliegue: vLLM (`vllm serve markab/rpn-gpt-lightning --served-model-name rpn --max-model-len 65536`), transformers, llama.cpp, Ollama, LM Studio, mlx-lm y vLLM con `--enable-lora` para el adaptador.
- Latencia y throughput: no disponibles en la información proporcionada. El cliente cierra el pensamiento a los 12.000 tokens, lo que acota el coste por consulta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Prestacion destacada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rpn-gpt-lightning | 31,6B totales / ~3B activos | 65.536 tokens (config. vLLM) | 92,1 % en frozen test con maquina Forth; 97,8 % en MATH-500 | OpenMDW-1.1 | Hugging Face, variantes BF16, NVFP4, GGUF, MLX, LoRA |
| NVIDIA Nemotron 3.5 Lightning 30B-A3B (base) | 31,6B totales / ~3B activos | no disponible en la informacion | Sin comportamiento Forth aprendido; 89,8 % de coincidencia top-1 con el ajustado | la del modelo base | Hugging Face (nvidia) |
| rpn-gpt-lightning-Forth | 31,6B totales / ~3B activos | no disponible | Kernel Forth embebido en los pesos; requiere codigo personalizado | OpenMDW-1.1 | Hugging Face |

No se dispone de datos de benchmarks de modelos alternativos de la misma categoría en la información proporcionada, por lo que la comparación se limita al modelo base y a las variantes del propio ajuste.

## Limitaciones y advertencias

- El modelo solo escribe el programa Forth; sin un intérprete externo (`rpn_chat.py` o el kernel embebido) no se ejecuta nada y la respuesta queda incompleta.
- Requiere el system prompt específico (`reference_v4.txt`) y los parámetros de muestreo de la model card (temperatura 1,0, top-p 0,95); fuera de ese formato el comportamiento puede degradarse.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false`).
- El modelo está entrenado únicamente en inglés; no hay soporte multilingüe documentado.
- Riesgo de alucinación en el razonamiento previo y en la decisión de cuándo usar la máquina; el conjunto `dev_codefull` baja al 83,0 %, lo que indica mayor fragilidad en problemas con mucho código.
- La licencia OpenMDW-1.1 (`license: other`) debe revisarse antes de uso comercial; no se detallan en la información disponible las restricciones concretas.
- El despliegue en BF16 exige hardware de datacenter; las variantes cuantizadas pierden precisión (90,5 % en NVFP4 frente a 92,1 % en BF16).
- La diferencia entre el modelo fusionado y base + adaptador se califica como ruido en la propia model card, por lo que las cifras deben interpretarse con cautela.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/markab/rpn-gpt-lightning
- Repositorio de código: https://github.com/markab21/rpn-gpt
- Cliente `rpn_chat.py`: https://github.com/markab21/rpn-gpt/blob/main/rpn_chat.py
- Especificación del kernel: https://github.com/markab21/rpn-gpt/blob/main/kernel/text_vm.py
- Script de evaluación: https://github.com/markab21/rpn-gpt/blob/main/training/loop_sim.py
- Guía para agentes: https://huggingface.co/markab/rpn-gpt-lightning/blob/main/AGENT.md
- System prompt: https://huggingface.co/markab/rpn-gpt-lightning/blob/main/reference_v4.txt
- Ejemplo con kernel en los pesos: https://huggingface.co/markab/rpn-gpt-lightning/blob/main/example_r7_in_weights.md
- Variante NVFP4: https://huggingface.co/markab/rpn-gpt-lightning-NVFP4
- Variante GGUF: https://huggingface.co/markab/rpn-gpt-lightning-GGUF
- Variante MLX 4-bit: https://huggingface.co/markab/rpn-gpt-lightning-MLX-4bit
- Variante MLX 8-bit: https://huggingface.co/markab/rpn-gpt-lightning-MLX-8bit
- Adaptador LoRA: https://huggingface.co/markab/rpn-gpt-lightning-LoRA
- Variante con kernel embebido: https://huggingface.co/markab/rpn-gpt-lightning-Forth
- Dataset: https://huggingface.co/datasets/markab/rpn-gpt-data
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- MATH-500: https://huggingface.co/datasets/HuggingFaceH4/MATH-500
