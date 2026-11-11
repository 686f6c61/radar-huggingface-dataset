# Kevinmastascusa/qwen2p5-math-1p5b-merged

## Resumen

qwen2p5-math-1p5b-merged es un modelo de lenguaje causal (decoder-only) de aproximadamente 1.500 millones de parametros, resultado de aplicar un ajuste fino con LoRA sobre Qwen/Qwen2.5-Math-1.5B y fusionar posteriormente el adaptador en los pesos completos. Lo desarrolla Kevinmastascusa como parte del proyecto symbolic-math-ai, cuyo objetivo es la resolucion de problemas matematicos verbales (math word problems) con respuesta final numerica o de texto corto.

El modelo hereda la arquitectura transformer de Qwen2.5 y la licencia Apache 2.0 del modelo base. Su interes practico es acotado: sirve como banco de pruebas para investigacion en razonamiento matematico y como componente de un pipeline mayor que anade busqueda Tree-of-Thoughts y verificacion simbolica con SymPy. No es un modelo de proposito general ni compite con los modelos matematicos de gran escala.

Los resultados publicados son modestos y el propio autor los presenta como una linea base: 41,2% de exact match agregado sobre 500 problemas de SVAMP, GSM8K y MATH-500 con decodificacion greedy y un limite de 64 tokens nuevos. El conjunto de entrenamiento es muy reducido (640 ejemplos), lo que limita la mejora atribuible al ajuste fino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (Qwen2) |
| Parametros totales | 1.543.298.048 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | base entrenada en 4-bit NF4 con doble cuantizacion (QLoRA); pesos publicados en safetensors (fp16/fp32 segun carga); no se publican GGUF |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder-only de la familia Qwen2.5, con 1.543.298.048 parametros. Sobre el modelo base Qwen/Qwen2.5-Math-1.5B se aplico un ajuste fino tipo QLoRA: la base se cuantizo a 4-bit NF4 con doble cuantizacion, se activo gradient checkpointing y precision mixta, y se entrenaron adaptadores LoRA con r=8, alpha=16 y dropout=0.05 sobre las proyecciones q, k, v, o, gate, up y down. Posteriormente el adaptador se fusiono en los pesos completos mediante el script `merge_lora_to_full.py`, de modo que el repositorio carga como cualquier modelo de Transformers sin necesidad de PEFT.

Los datos de entrenamiento proceden de hasta 200 ejemplos de cada uno de GSM8K, MathQA, SVAMP y MATH-500, divididos 80/20 en 640 ejemplos de entrenamiento y 160 de validacion. El regimen fue de 2 epocas (320 pasos de optimizador), batch size 1 con 4 pasos de acumulacion de gradientes, learning rate maximo de 5e-5 con 50 pasos de warmup y decaimiento lineal, weight decay 0.01 y longitud maxima de 256 tokens. Se conservo el checkpoint con menor perdida de validacion, en el paso 200 (loss 0.727, perplejidad 2.07). No se documenta uso de RLHF ni DPO, ni innovaciones arquitectonicas adicionales mas alla del ajuste LoRA.

## Capacidades

- Generacion de texto y resolucion de problemas matematicos verbales con respuesta final numerica o de texto corto.
- Razonamiento aritmetico de varios pasos en el formato de los datasets de entrenamiento (GSM8K, SVAMP, MATH-500, MathQA).
- Soporte de tres formatos de prompt especificos: `Question: ...\nAnswer:` para GSM8K y SVAMP, `Problem: ...\nSolution:` para MATH-500 y `Problem: ...\nOptions: ...\nSolution:` para MathQA.
- Integracion con el pipeline symbolic-math-ai, que anade busqueda Tree-of-Thoughts y verificacion de la respuesta final con SymPy.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso fuera del esquema de prompting descrito.
- Capacidad multilingue limitada al ingles segun la metadata del modelo.
- No dispone de vision, audio ni modo de pensamiento explicito.

## Casos de uso

- Investigacion en razonamiento matematico: el modelo sirve como linea base reproducible para comparar tecnicas de ajuste fino (LoRA, QLoRA) sobre un modelo matematico pequeno, con conjuntos de evaluacion y scripts publicados.
- Prototipado de tutores de matematicas para problemas verbales de primaria y secundaria: con el formato `Question: ...\nAnswer:` genera una solucion corta y un resultado numerico final, adecuado para ejercicios de aritmetica de varios pasos.
- Componente de un pipeline con verificacion simbolica: combinado con el proyecto symbolic-math-ai, el modelo propone soluciones candidatas y SymPy valida el resultado final, lo que reduce el riesgo de respuestas erroneas en produccion.
- Generacion de candidatos en busqueda Tree-of-Thoughts: al ser un modelo pequeno (1,5B), permite generar multiples ramas de solucion por problema con un coste computacional bajo y filtrarlas posteriormente.
- Evaluacion comparativa de metodos de scoring: util para estudiar como afecta el formato de la respuesta final (extraccion del ultimo numero) a las metricas de exact match.
- Docencia y experimentacion en entornos con GPU de consumo: con 1,5B parametros en fp16 ocupa unos 3,1 GB, por lo que se puede ejecutar en tarjetas consumer para sesiones interactivas.
- Extraccion de respuestas numericas en tareas de matematicas aplicadas de dominio acotado, siempre que el problema se formule en el estilo de los datasets de entrenamiento.

## Benchmarks y rendimiento

Exact match sobre los splits de test del proyecto, decodificacion greedy y hasta 64 tokens nuevos. El scorer toma el ultimo numero de la salida del modelo y lo compara con el ultimo numero de la respuesta de referencia.

| Conjunto de test | Problemas | Correctos | Exact match |
|---|---|---|---|
| SVAMP | 200 | 125 | 62,5% |
| GSM8K | 200 | 65 | 32,5% |
| MATH-500 | 100 | 16 | 16,0% |
| Tres conjuntos puntuados | 500 | 206 | 41,2% |
| MathQA | 200 | 0 | no puntuado (ver nota) |

MathQA no tiene una puntuacion real: sus respuestas de referencia son letras de opcion (a-e) y el scorer las compara con el ultimo numero de la salida, por lo que nunca coinciden. Contando los ceros forzados de MathQA, el scorer reporta 29,4% sobre los 700 problemas totales. No existe una linea base del modelo base evaluada con el mismo scorer, por lo que estos numeros indican el estado del modelo, no la mejora atribuible al ajuste fino.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 3,1 GB en fp16 (tamano del repo en safetensors); en fp32, aproximadamente 6,2 GB.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM. Una RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes; el modelo es pequeno y no aprovecha aceleradores de gran escala.
- Cabe en GPU de consumo: si, en cualquier tarjeta con 8 GB o mas en fp16.
- Opciones de despliegue: transformers (referencia del autor), vLLM y TGI por compatibilidad con el pipeline text-generation; llama.cpp u Ollama requeririan conversion a GGUF, no publicada en el repositorio.
- Latencia y throughput: no se publican mediciones. El autor indica que se recomienda GPU para uso interactivo y que la decodificacion tipica es de 32 a 64 tokens nuevos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2p5-math-1p5b-merged | 1,54B | no disponible | Ajuste LoRA sobre Qwen2.5-Math-1.5B para problemas verbales | Apache 2.0 | Hugging Face (11 descargas) |
| Qwen/Qwen2.5-Math-1.5B | ~1,5B | no disponible en esta ficha | Modelo matematico base de Alibaba | Apache 2.0 | Hugging Face |
| Qwen2.5-Math-7B | ~7B | no disponible en esta ficha | Version mayor de la misma familia | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks comparables bajo el mismo scorer para el modelo base ni para Qwen2.5-Math-7B, por lo que la comparacion cuantitativa de rendimiento no esta disponible.

## Limitaciones y advertencias

- El formato de la respuesta final afecta directamente a la puntuacion: el scorer lee el ultimo numero de la salida, de modo que una solucion correcta con un formato distinto puede contabilizarse como error.
- El conjunto de entrenamiento es muy pequeno (640 ejemplos) y los conjuntos de test tambien (100 a 200 problemas), lo que limita la fiabilidad estadistica de los resultados.
- El limite de 64 tokens nuevos puede truncar soluciones largas y producir respuestas incompletas.
- El modelo puede alucinar fuera de tareas matematicas; el autor recomienda usarlo con cautela.
- No esta destinado a decisiones de alto riesgo, demostraciones formales ni matematicas de nivel de competicion.
- El soporte linguistico se limita al ingles segun la metadata; el rendimiento en castellano no esta documentado.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias y el modelo no ha sido validado en produccion.
- No se publican pesos en GGUF, por lo que el despliegue en llama.cpp u Ollama requiere conversion manual.
- No hay linea base del modelo original evaluada con el mismo scorer, lo que impide cuantificar el efecto real del ajuste fino.

## Enlaces

- Hugging Face: https://huggingface.co/Kevinmastascusa/qwen2p5-math-1p5b-merged
- Adaptador LoRA sin fusionar: https://huggingface.co/Kevinmastascusa/symbolic-math-qwen2p5-1p5b-lora
- Repositorio del proyecto: https://github.com/kevinmastascusa/symbolic-math-ai
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Math-1.5B
- Paper del modelo base (Qwen2.5-Math Technical Report): https://arxiv.org/abs/2409.12122
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset MathQA: https://huggingface.co/datasets/allenai/math_qa
- Dataset SVAMP: https://huggingface.co/datasets/ChilleD/SVAMP
- Dataset MATH-500: https://huggingface.co/datasets/HuggingFaceH4/MATH-500
