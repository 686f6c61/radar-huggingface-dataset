# 2003Rohansinha/Qwen2.5-Coder-1.5B-Python-OCI-LoRA

## Resumen

Qwen2.5-Coder-1.5B-Python-OCI-LoRA es un ajuste fino del modelo Qwen/Qwen2.5-Coder-1.5B-Instruct, desarrollado por el usuario independiente 2003Rohansinha y publicado en Hugging Face. El modelo parte de la familia Qwen2.5-Coder de Alibaba Cloud y se ha especializado en la generacion de codigo Python mediante un ajuste QLoRA sobre 10.000 ejemplos de Python procedentes del dataset nvidia/OpenCodeInstruct, filtrando unicamente aquellas respuestas cuyos tests unitarios generados se superaban con puntuacion completa.

La relevancia de esta ficha es acotada: se trata de un experimento de ajuste fino de bajo coste (aproximadamente una hora en dos GPU NVIDIA T4 en Kaggle) que no mejora al modelo base. En la evaluacion HumanEval pass@1 realizada por el autor, el modelo ajustado obtiene un 67,7% frente al 68,9% del modelo base, una diferencia de -1,2 puntos que el propio autor califica como ruido estadistico en un conjunto de 164 problemas. Por tanto, su interes es principalmente educativo y de reproducibilidad de pipelines de QLoRA, no de rendimiento superior.

El modelo conserva la arquitectura transformer decoder-only de Qwen2.5, con 1.543.714.304 parametros totales (aproximadamente 1,5B), pesos en safetensors, licencia Apache-2.0 y soporte exclusivo del idioma ingles. Los pesos LoRA estan fusionados en el modelo base, por lo que se distribuye como modelo autonomo que no requiere PEFT para su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 (aproximadamente 1,5B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (las secuencias de entrenamiento se truncaron a 1.024 tokens) |
| Tipos de cuantizacion | El autor menciona fp16 y fp32 para inferencia; el entrenamiento uso cuantizacion 4-bit NF4 en el modelo base (QLoRA). No se documentan otros formatos cuantizados publicados |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen2.5-Coder-1.5B-Instruct |
| Metodo de ajuste | QLoRA (LoRA r=16, alpha=32, dropout 0,05) fusionado en el modelo base |
| Parametros entrenables | 18,5M (1,2% del total) |
| Dataset de entrenamiento | 10.000 ejemplos de Python de nvidia/OpenCodeInstruct (CC BY 4.0) |
| Libreria | transformers (>=4.37), text-generation-inference |
| Tamano del repositorio | 3,1 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-Coder-1.5B-Instruct, con atencion causal estandar y plantilla de chat ChatML propia de Qwen. Sobre esta base se aplico un ajuste QLoRA: el modelo base se cuantizo a 4 bits en formato NF4 y se entrenaron adaptadores LoRA de rango 16 y alpha 32 con dropout 0,05 sobre todas las proyecciones de atencion y MLP, lo que supone 18,5 millones de parametros entrenables (el 1,2% del total). Posteriormente, los pesos LoRA se fusionaron en el modelo base para producir un modelo autonomo.

El entrenamiento utilizo 10.000 ejemplos de Python extraidos de nvidia/OpenCodeInstruct, seleccionando solo aquellas respuestas cuyos tests unitarios generados se superaban todos (puntuacion media de test 1.0) y que contenian un bloque de codigo Python. Las secuencias se truncaron a 1.024 tokens y la perdida se calculo unicamente sobre la respuesta del asistente, enmascarando los tokens del prompt. Se realizo una sola epoca (aproximadamente 613 pasos) con batch efectivo de 16 (2 GPU x 4 x 2 de acumulacion), optimizador paged AdamW de 8 bits, tasa de aprendizaje 2e-4 con schedule coseno y 40 pasos de calentamiento, en precision fp16 sobre 2 GPU NVIDIA T4 durante aproximadamente una hora. La perdida final de entrenamiento fue de aproximadamente 0,13 a 0,15 (media de 0,145) y la perdida de validacion final de 0,133 sobre 200 ejemplos retenidos de la distribucion de entrenamiento.

No se documentan innovaciones tecnicas adicionales como decodificacion especulativa, atencion lineal ni modos de razonamiento extendido. El ajuste sigue el procedimiento estandar de QLoRA con PEFT y bitsandbytes.

## Capacidades

- Generacion de codigo Python: funciones, clases y scripts pequenos a partir de una descripcion en lenguaje natural, con docstrings y ejemplos de uso.
- Conversacion multi-turno con plantilla ChatML y mensaje de sistema recomendado ("You are an expert Python programmer...").
- Generacion de codigo completo y ejecutable en un unico bloque de codigo, segun el ejemplo de la model card.
- Especializacion en Python exclusivamente; el autor indica explicitamente que el entrenamiento fue solo en Python.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta soporte de vision, audio ni modo thinking.
- Capacidades multilingues limitadas al ingles segun la etiqueta de idioma del repositorio.

## Casos de uso

- Prototipado rapido de funciones Python: dado un enunciado en lenguaje natural, el modelo genera una funcion con docstring y ejemplo de uso, adecuado para explorar APIs o algoritmos antes de escribir codigo definitivo. Su tamano de 1,5B permite ejecutarlo en hardware modesto.
- Asistencia educativa en aprendizaje de Python: el modelo puede generar ejemplos resueltos de ejercicios clasicos (palindromos, merge de listas ordenadas) que sirven como material de estudio, siempre con revision humana.
- Generacion de tests unitarios a partir de una funcion existente: aunque no esta verificado en la model card, la naturaleza del dataset de entrenamiento (respuestas con tests generados) sugiere cierta familiaridad con patrones de testing, que debe validarse empiricamente.
- Experimentacion con pipelines QLoRA: el repositorio documenta de forma detallada hiperparametros, hardware y resultados, lo que lo convierte en una referencia reproducible para quien quiera ajustar modelos de codigo pequenos con PEFT y bitsandbytes.
- Investigacion sobre calidad de datos sinteticos: al entrenar solo con ejemplos filtrados por tests superados, sirve como caso de estudio del impacto del filtrado por ejecucion en el rendimiento final de un modelo de codigo.
- Autocompletado ligero en entornos con recursos limitados: con aproximadamente 3 GB en fp16, puede desplegarse en una GPU de consumo para sugerencias de codigo Python en editores o notebooks, con revision obligatoria del resultado.

## Benchmarks y rendimiento

El autor publica una unica evaluacion en HumanEval pass@1 con decodificacion greedy, mismo prompt y mensaje de sistema para ambos modelos, sobre 164 problemas:

| Modelo | HumanEval pass@1 |
|---|---|
| Qwen/Qwen2.5-Coder-1.5B-Instruct (base) | 68,9% |
| Qwen2.5-Coder-1.5B-Python-OCI-LoRA (este modelo) | 67,7% |

La diferencia de -1,2 puntos esta, segun el propio autor, dentro del ruido estadistico para 164 problemas. El autor advierte que se trata de una unica ejecucion con su propio harness (la respuesta se extrae de un bloque de codigo y se ejecuta contra los tests oficiales), por lo que los numeros absolutos pueden diferir de otros leaderboards. No se han publicado resultados de MMLU, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB en fp16 (indicado por el autor); en fp32 seria aproximadamente el doble. No se documentan pesos cuantizados a 4 u 8 bits publicados en el repositorio.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16. El autor entreno en 2 x NVIDIA T4, lo que confirma compatibilidad con GPUs de gama media.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3050, RTX 3060, RTX 4060 o superiores con 6-8 GB de VRAM.
- En CPU: el autor indica usar torch_dtype=torch.float32 para inferencia en CPU.
- Opciones de despliegue: transformers (>=4.37) con AutoModelForCausalLM, y compatibilidad declarada con text-generation-inference y endpoints_compatible. No se documenta soporte explicito de vLLM, llama.cpp u Ollama en la informacion proporcionada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval pass@1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-Coder-1.5B-Python-OCI-LoRA (este modelo) | 1,5B | No disponible | 67,7% (harness del autor) | Apache-2.0 | Hugging Face |
| Qwen2.5-Coder-1.5B-Instruct (base) | 1,5B | No disponible | 68,9% (harness del autor) | Apache-2.0 | Hugging Face |
| Otros modelos de codigo de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion con datos en la informacion proporcionada es frente al modelo base, que supera ligeramente a este ajuste. No se dispone de datos de benchmark de otros modelos comparables en la informacion facilitada.

## Limitaciones y advertencias

- El modelo ajustado rinde ligeramente peor que el modelo base en HumanEval (-1,2 puntos), por lo que no aporta mejora medible frente a Qwen2.5-Coder-1.5B-Instruct.
- Entrenado sobre datos sinteticos generados por LLM: puede producir codigo incorrecto, ineficiente o inseguro e inventar APIs con confianza. El autor exige revision y testeo de toda salida.
- Entrenamiento exclusivamente en Python: no debe usarse para otros lenguajes.
- Secuencias de entrenamiento truncadas a 1.024 tokens: prompts o respuestas muy largas pueden degradar la calidad.
- Idioma limitado al ingles segun la etiqueta del repositorio.
- No apto para uso en produccion sin revision, ni para codigo critico para la seguridad, segun el propio autor.
- Hereda los sesgos y limitaciones del modelo base y del dataset sintetico OpenCodeInstruct.
- La evaluacion es una unica ejecucion con harness propio del autor, no un leaderboard independiente; los numeros deben interpretarse con cautela.
- El modelo se publico en noviembre de 2026 y no registra descargas ni likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- La licencia Apache-2.0 permite uso comercial, pero el dataset de entrenamiento (nvidia/OpenCodeInstruct) esta bajo CC BY 4.0, lo que exige atribucion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/2003Rohansinha/Qwen2.5-Coder-1.5B-Python-OCI-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/nvidia/OpenCodeInstruct
- Paper de OpenCodeInstruct: https://arxiv.org/abs/2504.04030
- Paper tecnico de Qwen2.5-Coder: https://arxiv.org/abs/2409.12186
