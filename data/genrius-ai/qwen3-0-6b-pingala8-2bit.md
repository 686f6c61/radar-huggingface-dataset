# Genrius-AI/Qwen3-0.6B-Pingala8-2bit

## Resumen

Qwen3-0.6B-Pingala8-2bit es una cuantización extrema a 2 bits del modelo Qwen3-0.6B de Alibaba, realizada por Genrius AI (autor: Harshit Goyal) utilizando su método propio Pingala-8. El objetivo del proyecto es demostrar que un modelo pequeño puede comprimirse hasta ~0,28 GB sin colapsar, un punto donde las cuantizaciones estándar de llama.cpp (como IQ2_XXS) fallan estrepitosamente: la perplejidad de IQ2_XXS sobre WikiText-2 es de 10791 frente a 41,34 de Pingala-8 en un fichero de tamaño casi idéntico.

El método se basa en codificación trellis de partición de conjuntos de 8 estados (Ungerboeck) aplicada a cada peso lineal, combinada con una rotación aleatoria de Hadamard y el redondeo LDLQ de QuIP. Es relevante porque abre la puerta a ejecutar LLM en dispositivos con memoria extremadamente limitada (microcontroladores de borde, navegadores, móviles antiguos), aunque el propio autor advierte con honestidad que un modelo de 0,6B a 2 bits es débil y su caso de uso principal es cuando 0,28 GB es un límite estricto e innegociable.

El modelo base emplea una arquitectura transformer decoder de 28 capas con grouped-query attention y FFN SwiGLU, soporta inglés y chino, y se distribuye en formato GGUF bajo licencia Apache 2.0. Requiere un runtime de llama.cpp parcheado para poder cargarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (28 capas, GQA, FFN SwiGLU) |
| Parametros totales | 427.102.020 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el benchmark de WikiText-2 usa contexto 4096) |
| Tipos de cuantizacion | Pingala-8, 2 bits (metodo propio; requiere runtime parcheado) |
| Idiomas soportados | Ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (0,28 GB) |

## Arquitectura y entrenamiento

El modelo base, Qwen3-0.6B, es un transformer decoder de 28 capas con grouped-query attention y FFN basado en SwiGLU. La cuantización Pingala-8 no modifica la arquitectura: actúa sobre los 196 tensores de pesos lineales (attn_q, attn_k, attn_v, attn_output, ffn_gate, ffn_up, ffn_down en cada capa). Cada tensor se almacena mediante el código trellis de 8 estados de Ungerboeck sobre símbolos de 4 pesos, precedido de una rotación aleatoria de Hadamard y del redondeo LDLQ de QuIP, con una clase de tasa por tensor y escalado de columnas basado en cotas de incoherencia (receta B4, idéntica a la del release de Qwen3-4B).

En cuanto a datos de entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO), no se detallan en la información disponible. El método de cuantización está documentado en el preprint *Small-State Coset Trellis Coding at IQ2_XXS Size: An Equal-Bytes Study in llama.cpp* (v2.4), DOI 10.5281/zenodo.23481757, aunque las métricas publicadas en la model card son mediciones nuevas que no aparecen en el paper.

## Capacidades

- Generacion de texto conversacional en inglés y chino (pipeline text-generation)
- Razonamiento y conocimiento general limitados por el tamaño del modelo base (0,6B) y la agresiva cuantización a 2 bits
- Ejecucion local en entornos con memoria muy restringida (~0,28 GB de pesos)
- No se declara soporte de tool calling ni function calling en la informacion disponible
- No hay informacion sobre capacidades de vision, audio ni thinking mode para esta version cuantizada

## Casos de uso

- Ejecucion en dispositivos con limite duro de memoria: cuando el despliegue solo dispone de ~0,3 GB para pesos (por ejemplo, un dispositivo de borde con RAM minima), este fichero es una de las pocas opciones que mantiene un modelo funcional a ese tamaño.
- Demostraciones y prototipado en navegador o CPU: el proyecto ofrece un Space de Hugging Face con demo en vivo de la variante 1.7B sobre CPU, util para probar la familia Pingala-8 sin instalar nada.
- Investigacion en compresion de modelos: al publicar codigo, parches de runtime y paper, es un buen punto de partida para estudiar codificacion trellis aplicada a LLM.
- Chatbot ligero offline en inglés o chino: para asistentes simples de un turno o pocos turnos donde la calidad del lenguaje puede ser modesta a cambio de una huella minima.
- Pruebas de regresion de runtimes de cuantizacion: util como caso extremo para validar implementaciones de decodificacion trellis en llama.cpp parcheado.
- Distribucion de modelos por canales con ancho de banda limitado: a 0,3 GB por repo, es viable descargarlo por redes lentas o almacenarlo en firmware.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados por terceros):

| Benchmark | Metrica | Valor |
|---|---|---|
| WikiText-2 (test, contexto 4096) | Perplejidad (menor es mejor) | 41,34 |
| HellaSwag (0-shot, llama-perplexity) | Accuracy (%) | 35,5 |
| WinoGrande (0-shot, llama-perplexity) | Accuracy (%) | 52,49 |
| ARC-Easy (0-shot, llama-perplexity) | Accuracy (%) | 39,65 |
| ARC-Challenge (0-shot, llama-perplexity) | Accuracy (%) | 25,08 |
| MMLU (0-shot, llama-perplexity) | Accuracy (%) | 28,04 |

Comparativa de ficheros a tamaños equivalentes (datos del autor):

| Fichero | Cuantizacion | Tamano | WikiText-2 PPL |
|---|---|---|---|
| Qwen3-0.6B-Pingala8-2bit.gguf | Pingala-8, 2 bits | 0,28 GB | 41,34 |
| IQ2_XXS (llama.cpp, misma imatrix) | 2 bits | 0,28 GB | 10791 |
| IQ2_KT (ik_llama.cpp, receta por defecto) | 2 bits | 0,29 GB | 48,97 |
| Q8_0 (llama.cpp) | 8 bits | 0,80 GB | 19,11 |

El propio autor advierte que la perplejidad es 2,16 veces la del fichero de 8 bits y que los resultados zero-shot en ARC-Challenge están cerca del azar.

## Requisitos de hardware

- VRAM/RAM para inferencia: ~0,28 GB solo de pesos; con overhead de runtime, basta con menos de 1 GB de memoria disponible
- GPU: el runtime parcheado oficial está orientado a CUDA en NVIDIA RTX 30/40/50; el demo oficial funciona sobre CPU
- Consumer GPU: cualquier GPU NVIDIA moderna con soporte CUDA puede ejecutarlo sobradamente dado el tamaño minimo; también es viable en CPU pura
- Despliegue: exclusivamente mediante el runtime de la release v2.5 de pingala8-llm (one-click) o llama.cpp commit `7ac59a6` con los parches del repositorio, arrancando `llama-server` manualmente (el launcher para este modelo llega en v2.6). Stock llama.cpp, Ollama y LM Studio NO pueden cargarlo
- Latencia y throughput: el autor indica que a este tamaño el fichero genera tokens más lento que IQ2_XXS (factor 0,70x); no hay cifras absolutas publicadas

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Tamano | WikiText-2 PPL | Licencia | Runtime |
|---|---|---|---|---|---|---|
| Qwen3-0.6B-Pingala8-2bit | 427 M | Pingala-8, 2 bits | 0,28 GB | 41,34 | Apache 2.0 | llama.cpp parcheado (pingala8-llm) |
| Qwen3-0.6B IQ2_XXS | 427 M | 2 bits (llama.cpp) | 0,28 GB | 10791 (colapsa) | Apache 2.0 | llama.cpp stock |
| Qwen3-0.6B IQ2_KT | 427 M | 2 bits (ik_llama.cpp) | 0,29 GB | 48,97 | Apache 2.0 | ik_llama.cpp |
| Qwen3-0.6B Q8_0 | 427 M | 8 bits (llama.cpp) | 0,80 GB | 19,11 | Apache 2.0 | llama.cpp stock |

En calidad pura, Q8_0 sigue siendo muy superior; Pingala-8 gana solo cuando el tamaño debe quedar fijado en ~0,28 GB, donde supera claramente a IQ2_XXS y ligeramente a IQ2_KT en perplejidad con un fichero algo menor.

## Limitaciones y advertencias

- Calidad severamente degradada: perplejidad 2,16 veces superior al fichero Q8_0; resultados zero-shot en ARC-Challenge (25,08 %) y MMLU (28,04 %) cercanos al azar
- Rendimiento de generacion inferior: 0,70x la velocidad de tokens de IQ2_XXS a este tamaño
- Compatibilidad: requiere runtime de llama.cpp parcheado; no funciona con llama.cpp stock, Ollama ni LM Studio
- Sin launcher dedicado en la release v2.5: hay que arrancar `llama-server` manualmente
- Idiomas limitados a inglés y chino; no hay informacion sobre rendimiento en castellano
- Riesgo elevado de alucinacion y coherencia pobre, inherente a un modelo de 0,6B cuantizado a 2 bits
- Métricas no verificadas: todos los benchmarks proceden del propio autor y no de terceros
- La licencia Apache 2.0 no impone restricciones de uso comercial, pero la calidad del modelo lo hace inadecuado para producción salvo casos con restricciones de memoria extremas

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Genrius-AI/Qwen3-0.6B-Pingala8-2bit
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Codigo y parches de runtime: https://github.com/Genrius-AI/pingala8-llm
- Release v2.5 (runtime one-click): https://github.com/Genrius-AI/pingala8-llm/releases/tag/v2.5
- Demo en vivo (Space, variante 1.7B): https://huggingface.co/spaces/harshit-genrius/pingala8-demo
- Paper del metodo (preprint v2.4): DOI https://doi.org/10.5281/zenodo.23481757
