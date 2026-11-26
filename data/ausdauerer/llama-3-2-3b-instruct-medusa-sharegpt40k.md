# ausdauerer/Llama-3.2-3B-Instruct-Medusa-ShareGPT40k

## Resumen

Este repositorio no contiene un modelo de lenguaje completo, sino cinco cabezas Medusa-1 para decodificacion especulativa sobre `meta-llama/Llama-3.2-3B-Instruct`. Las cabezas predicen, a partir del estado oculto final del modelo objetivo, los tokens situados en las posiciones t+2 a t+6, mientras que la cabeza LM original de Llama cubre t+1. Su funcion es proponer varios tokens candidatos por paso para que el modelo objetivo los verifique en paralelo, acelerando potencialmente la generacion sin alterar la distribucion de salida.

El autor es `ausdauerer` y las cabezas se entrenaron con Needle, un framework de deep learning escrito desde cero con kernels CUDA propios, sin PyTorch ni cuBLAS. Por ello los pesos se almacenan en el layout de Needle y no cargan directamente en el codigo de referencia de Medusa. El repositorio ocupa 0,2 GB y contiene unicamente las cabezas (189 MB, 47.201.280 parametros en float32); es imprescindible descargar aparte los pesos de Llama-3.2-3B-Instruct.

La relevancia es acotada pero concreta: es un artefacto de investigacion para quien quiera experimentar con decodificacion especulativa sobre un modelo de 3B en hardware modesto. No se ha medido ninguna aceleracion end-to-end, por lo que debe tratarse como material de partida y no como una optimizacion lista para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabezas Medusa-1 (bloques residuales con activacion SiLU) sobre Llama-3.2-3B-Instruct (transformer decoder) |
| Parametros totales | 47.201.280 parametros en las 5 cabezas; el modelo objetivo Llama-3.2-3B-Instruct se descarga aparte |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible para las cabezas; entrenadas con conversaciones truncadas a 256 tokens |
| Tipos de cuantizacion | no disponible (pesos distribuidos en float32) |
| Idiomas soportados | no disponible |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors en layout de Needle (`medusa-l32-40k.safetensors`), mas `rank_acc.npy`, `training_args.json` y `training_log.jsonl` |

## Arquitectura y entrenamiento

Cada cabeza k (k = 0…4) es un bloque residual de la forma `x + SiLU(Linear(x))`, con una matriz `res.weight` de forma (3072, 3072) almacenada en orden (in, out), la transpuesta de `nn.Linear` de PyTorch, y un sesgo `res.bias` de forma (1, 3072). No hay tensor de proyeccion propio: cada cabeza proyecta con la capa de salida del modelo objetivo, que en Llama-3.2-3B es el embedding de tokens transpuesto porque `tie_word_embeddings` es verdadero. Dado el estado oculto final `h` en la posicion t, la cabeza k puntua el token en t+k+2. El entrenamiento congela el modelo objetivo, extrae sus estados ocultos una vez en float16 y solo actualiza los cinco bloques residuales (opcion `--tie`).

Los datos son ShareGPT (`ShareGPT_V3_unfiltered_cleaned_split.json`), usando las conversaciones 0-2000 y 3000-51000: 40.906 conversaciones para entrenamiento y 500 reservadas para validacion, descartando las que tienen menos de 16 tokens de asistente o ninguna respuesta. Se aplica la plantilla de chat de Llama 3.2, se trunca cada conversacion a 256 tokens y la perdida se calcula solo sobre tokens de asistente. El objetivo es la suma sobre cabezas de 0,8^k multiplicado por la entropia cruzada (Medusa-1). Optimizador AdamW con lr 2e-3, 40 pasos de warmup y decaimiento coseno hasta 0, sin weight decay; lotes de 64 conversaciones (4 × 16 de acumulacion de gradiente) y 64 posiciones muestreadas por cabeza y micro-lote. Dos epocas, 1.279 pasos, ejecutados primero en una NVIDIA L40S (pasos 1-750) y luego en una NVIDIA A10G (pasos 751-1.279), reanudando desde checkpoint.

## Capacidades

- Decodificacion especulativa: genera propuestas de tokens en las posiciones t+2 a t+6 para que Llama-3.2-3B-Instruct las verifique en paralelo.
- Prediccion multi-token por cabeza: cinco cabezas independientes, cada una especializada en un desplazamiento temporal distinto.
- Integracion con el modelo objetivo: reutiliza la capa de salida de Llama-3.2-3B-Instruct, sin proyecciones adicionales que cargar.
- No genera texto por si misma: depende en todo momento del modelo objetivo para producir la salida final.
- No soporta tool calling, agentes, vision, audio ni modo thinking por si misma; esas capacidades, si existen, provienen del modelo base.
- Capacidades multilingues: no disponibles (heredadas del modelo objetivo, no evaluadas para las cabezas).

## Casos de uso

- Aceleracion de inferencia en local: sirve como punto de partida para implementar decodificacion especulativa con Llama-3.2-3B-Instruct en un servidor con una sola GPU, reduciendo el numero de pasos secuenciales del modelo objetivo.
- Investigacion sobre Medusa: permite reproducir y comparar el esquema Medusa-1 con proyecciones compartidas y congeladas frente a la variante del paper con proyecciones entrenables.
- Evaluacion de frameworks alternativos: util para probar el ecosistema Needle y sus kernels CUDA propios frente a implementaciones basadas en PyTorch.
- Prototipado de asistentes conversacionales de baja latencia: las cabezas se entrenaron con formato de chat de Llama 3.2 sobre ShareGPT, por lo que encajan en dialogos multi-turno de dominio general.
- Benchmarking de decodificacion especulativa: el archivo `rank_acc.npy` y `training_log.jsonl` permiten analizar la precision top-1 y top-5 por cabeza y por posicion sin necesidad de desplegar el modelo completo.
- Educacion y experimentacion: el repositorio es pequeno (0,2 GB) y el codigo de ejemplo en la model card muestra como calcular logits por cabeza en NumPy, lo que facilita entender el mecanismo sin infraestructura pesada.

## Benchmarks y rendimiento

Precision en las 500 conversaciones reservadas, solo tokens de asistente:

| Metrica | Cabeza 1 (t+2) | Cabeza 2 (t+3) | Cabeza 3 (t+4) | Cabeza 4 (t+5) | Cabeza 5 (t+6) |
|---|---|---|---|---|---|
| Top-1 | 0,317 | 0,160 | 0,101 | 0,072 | 0,059 |
| Top-5 | 0,560 | 0,344 | 0,254 | 0,208 | 0,181 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) ni mediciones de aceleracion end-to-end en la informacion disponible.

## Requisitos de hardware

- VRAM para las cabezas: aproximadamente 189 MB en float32, segun el tamano del repositorio.
- VRAM para el modelo objetivo: no disponible en la informacion proporcionada; depende de la cuantizacion de Llama-3.2-3B-Instruct que se use.
- GPU recomendadas: el autor entreno en NVIDIA L40S y NVIDIA A10G; para inferencia no se especifican requisitos.
- GPU de consumo: no confirmado; las cabezas en si caben en cualquier GPU moderna, pero el modelo objetivo de 3B condiciona el requisito real.
- Opciones de despliegue: no disponible; el formato es especifico de Needle y no carga directamente en el codigo de referencia de Medusa, por lo que no se puede asumir compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no medidos; el autor indica explicitamente que no se ha medido ninguna aceleracion end-to-end.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision top-1 (cabeza 1) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (Medusa-1 sobre Llama-3.2-3B-Instruct) | 47,2 M en cabezas + modelo base aparte | Entrenado a 256 tokens | 0,317 | llama3.2 | Hugging Face, layout Needle |
| Medusa de referencia (paper arXiv 2401.10774) | Cabezas con proyecciones entrenables | No disponible | No disponible | No disponible | Codigo de referencia publico |
| Llama-3.2-3B-Instruct sin cabezas | 3B | No disponible en la informacion | No aplica | llama3.2 | Hugging Face |

No se dispone de datos suficientes para comparar rendimiento con otras implementaciones de decodificacion especulativa (EAGLE, Lookahead, etc.).

## Limitaciones y advertencias

- No se ha medido ninguna aceleracion end-to-end; el beneficio real en latencia es desconocido.
- Entrenadas con conversaciones truncadas a 256 tokens; el comportamiento en contextos mas largos no se ha probado.
- La proyeccion compartida y congelada, junto con el muestreo de posiciones, sacrifica precision frente a las cabezas con proyecciones entrenables del paper.
- Los pesos estan en el layout de Needle y no cargan directamente en el codigo de referencia de Medusa; requiere adaptacion.
- ShareGPT contiene conversaciones de ChatGPT compartidas por usuarios y su situacion de licencia es poco clara.
- Uso sujeto a la Llama 3.2 Community License y a la Acceptable Use Policy; revisar restricciones para uso comercial.
- Riesgo de alucinacion y sesgos: no evaluados para las cabezas; dependen del modelo base.
- Idiomas soportados: no disponibles; no se ha documentado cobertura multilingue.

## Enlaces

- Hugging Face: https://huggingface.co/ausdauerer/Llama-3.2-3B-Instruct-Medusa-ShareGPT40k
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Paper Medusa: https://arxiv.org/abs/2401.10774
- Dataset ShareGPT: https://huggingface.co/datasets/anon8231489123/ShareGPT_Vicuna_unfiltered
