# Chenhangcui/nomi-zthink-ds-full-v3m

## Resumen

nomi-zthink-ds-full-v3m es un checkpoint de investigación publicado por Chenhangcui sobre el modelo base Qwen/Qwen3.5-4B-Base. Se trata de un ajuste supervisado (SFT) de parámetros completos cuyo objetivo es que el modelo razone en un formato propietario denominado "Nomi think" (variante v3m) antes de emitir la respuesta final. El entrenamiento se realizó sobre trazas destiladas de DeepSeek-R1 durante una época completa, con 1114 pasos de optimización, y se documenta una precisión de validación de 0,7583 y una cross-entropy de validación de 0,2546.

El modelo pertenece a la categoría de razonamiento latente aplicado a matemáticas: en lugar de generar cadenas de pensamiento en lenguaje natural, produce representaciones internas que requieren un códec específico (publicado en el repositorio Chenhangcui/nomi-codecs) para poder interpretarse. Esta característica lo aleja de los modelos convencionales de razonamiento explícito y lo sitúa como una pieza experimental orientada a estudiar si el razonamiento comprimido en espacio latente puede igualar o superar al razonamiento verbalizado.

Por su naturaleza de checkpoint de investigación, con cero descargas y cero likes en el momento de la consulta, no debe considerarse un modelo listo para producción. Su interés es fundamentalmente académico: permite reproducir y auditar una metodología concreta de destilación de razonamiento con protocolo de decodificación congelado (temperatura 0,6, top_p 0,95, semilla 0, guardia de bucle de 256 tokens, tope de pensamiento de 12288 tokens Nomi o 18432 en inglés, y tope de respuesta de 1024 tokens).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B-Base); razonamiento latente "Nomi think" v3m |
| Parametros totales | 4B (heredados del modelo base Qwen/Qwen3.5-4B-Base) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el protocolo menciona pensamiento en "Nomi" e inglés) |
| Licencia | no disponible |
| Formato de pesos | `last.pt` (PyTorch, cargado con `torch.load`); no se indica safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B-Base, un transformer de 4.000 millones de parámetros, y se somete a un ajuste supervisado de parámetros completos (full-parameter SFT) durante una única época, con un total de 1114 pasos de entrenamiento. Los datos de entrenamiento son trazas destiladas de DeepSeek-R1, empleadas en su totalidad ("full data"). El script de entrenamiento referenciado es `scripts/train_zthink.py`, complementado por `scripts/rl_dapo.py`, lo que sugiere la presencia de una etapa de optimización con DAPO (variante de RL con preferencias) además del SFT. No se detalla la composición exacta del dataset ni el número de tokens de entrenamiento.

La innovación principal es el mecanismo de razonamiento latente "Nomi think" en su variante v3m: el modelo no emite cadenas de pensamiento en texto plano, sino que genera un flujo de pensamiento codificado que solo puede decodificarse con el códec correspondiente del repositorio Chenhangcui/nomi-codecs. El protocolo de decodificación está congelado y fijado a temperatura 0,6, top_p 0,95, semilla 0, guardia de bucle de 256 tokens, un tope de pensamiento de 12288 tokens en Nomi (18432 en inglés) y un tope de respuesta de 1024 tokens. La métrica de precisión se calcula como avg@k. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Razonamiento matemático con pensamiento latente previo a la respuesta, orientado a problemas que requieren múltiples pasos.
- Generación de texto a partir del modelo base Qwen3.5-4B-Base, aunque no se documentan evaluaciones específicas de generación general.
- Razonamiento en formato "Nomi think" v3m, decodificable únicamente mediante el códec de Chenhangcui/nomi-codecs.
- Soporte de pensamiento en dos modalidades según el protocolo: Nomi (hasta 12288 tokens) e inglés (hasta 18432 tokens).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni multimodalidad.
- Capacidades multilingües: no disponibles; el protocolo solo menciona Nomi e inglés.

## Casos de uso

- Investigación sobre razonamiento latente: el modelo permite estudiar si el pensamiento comprimido en espacio latente mejora la precisión frente al razonamiento verbalizado, usando el protocolo congelado y el códec para decodificar las trazas.
- Reproducción de experimentos de destilación: al estar publicados los scripts (`train_zthink.py`, `rl_dapo.py`) y los registros de validación (`best.json`, `curve.jsonl`), sirve para replicar la metodología de destilación de DeepSeek-R1 sobre un base de 4B.
- Evaluación comparativa de metodologías de razonamiento: útil como línea base para contrastar SFT con trazas destiladas frente a enfoques de RL puro o razonamiento explícito en tareas de matemáticas.
- Análisis de eficiencia de tokens de pensamiento: el tope configurable (12288/18432 tokens) permite medir el compromiso entre profundidad de razonamiento y coste computacional en inferencia.
- Docencia y formación: adecuado para demostrar en cursos o seminarios cómo funciona un esquema de razonamiento latente con códec asociado, dado que el protocolo está completamente especificado.
- Auditoría de seguridad de modelos de razonamiento: al requerir un códec para interpretar el pensamiento, permite investigar la opacidad de las representaciones internas y sus implicaciones para la interpretabilidad.

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados en la información disponible son métricas de validación del propio entrenamiento:

| Metrica | Valor |
|---|---|
| val acc_z | 0,7583 |
| val_ce | 0,2546 |
| Pasos de entrenamiento | 1114 |
| Epocas | 1 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un transformer de 4B en precisión completa (FP16) se requieren aproximadamente 8 GB solo para pesos, más memoria para el contexto y el códec de pensamiento. En cuantización de 8 bits, alrededor de 4-5 GB; en 4 bits, alrededor de 2,5-3 GB.
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 4090 (24 GB) o A100/H100 son suficientes para FP16 con contexto amplio.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3090/4090, RTX 4080 y GPUs con 8 GB o más en cuantización de 8 bits, aunque no está verificado por el autor.
- Opciones de despliegue: el checkpoint se distribuye como `last.pt` (PyTorch), por lo que requiere carga con `torch.load` y el código del repositorio; no se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI. El códec de Chenhangcui/nomi-codecs es necesario para decodificar el pensamiento.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Razonamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nomi-zthink-ds-full-v3m | 4B | no disponible | Latente (Nomi v3m), requiere códec | no disponible | Checkpoint de investigación, 0 descargas |
| Qwen/Qwen3.5-4B-Base | 4B | no disponible | Explícito, sin ajuste de razonamiento | no disponible | Modelo base público |
| DeepSeek-R1 (destilados) | Variable (1.5B-70B) | no disponible | Explícito con trazas de razonamiento | no disponible | Público |

La comparación directa con alternativas de razonamiento latente no está disponible, ya que no se han identificado en la información proporcionada modelos públicos comparables que empleen un esquema de códec de pensamiento similar.

## Limitaciones y advertencias

- Checkpoint de investigación sin descargas ni validación comunitaria: no hay evidencia de uso en producción ni de robustez fuera del conjunto de validación.
- Licencia no disponible: no puede determinarse si se permite uso comercial; debe consultarse al autor antes de cualquier despliegue.
- El razonamiento es opaco sin el códec de Chenhangcui/nomi-codecs; sin él, las trazas de pensamiento no son interpretables.
- Riesgo de alucinación inherente a los modelos de 4B ajustados con trazas destiladas; no se han publicado evaluaciones de fidelidad factual.
- Idiomas soportados no documentados; el protocolo solo menciona Nomi e inglés, por lo que el rendimiento en castellano es desconocido.
- Longitud de contexto no disponible, lo que impide planificar despliegues con ventanas largas.
- El protocolo de decodificación está congelado (T=0,6, top_p=0,95, semilla 0, topes de tokens), lo que limita la adaptación a otros regímenes de inferencia sin romper la reproducibilidad de los resultados reportados.
- No se documentan sesgos conocidos ni evaluaciones de seguridad; al derivar de DeepSeek-R1 y Qwen3.5, puede heredar sesgos de ambos.

## Enlaces

- Hugging Face: https://huggingface.co/Chenhangcui/nomi-zthink-ds-full-v3m
- Códec necesario para decodificar el pensamiento: https://huggingface.co/Chenhangcui/nomi-codecs
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
