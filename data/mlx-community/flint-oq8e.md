# mlx-community/flint-oQ8e

## Resumen

flint-oQ8e es una cuantización a 8 bits del modelo Flint de Recursive (RecursiveSI/flint), preparada por la comunidad MLX para ejecutarse de forma nativa en Apple Silicon. Flint es un modelo de lenguaje con arquitectura mixture-of-experts (MoE) de 40 mil millones de parámetros totales y unos 2,5 mil millones activos por token, orientado a código, agentes y razonamiento. Esta variante oQ8e, creada con la herramienta oMLX, emplea cuantización de precisión mixta guiada por datos con recorte de rangos calibrado por matriz de importancia (imatrix), logrando una perplejidad prácticamente idéntica a la del modelo bf16 (14,33 frente a 14,30) ocupando la mitad de espacio.

Su relevancia radica en que permite ejecutar un modelo de esta escala en Macs de 64 GB con memoria unificada: ocupa 42,3 GB en disco y mantiene velocidades de generación de 95-110 tokens por segundo en un MacBook Pro M5 Max. Es la variante de mayor fidelidad de la familia oQ publicada, con un acuerdo top-1 del 92,3 % respecto a la distribución del modelo original.

Soporta contexto de 262k tokens y se carga mediante oMLX o mlx-vlm (versión 0.7.10 o superior), exponiendo una API compatible con OpenAI que incluye tool calling y razonamiento devuelto en el campo `reasoning_content`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (49 capas: 2 densas + 47 MoE, 256 expertos enrutados con top-6 + 1 experto compartido) |
| Parametros totales | 39,79 mil millones (39.785.299.488, según safetensors; ~40B según la model card) |
| Parametros activos | ~2,5 mil millones por token |
| Longitud de contexto | 262.144 tokens (262k) |
| Tipos de cuantizacion | oQ8e (nivel 8 mejorado, grupo 64, afín, imatrix con 128 muestras de calibración); ~8,50 bpw |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantización afín estándar de MLX, sin kernels personalizados) |

## Arquitectura y entrenamiento

Flint es un transformer disperso de tipo mixture-of-experts con 49 capas: 2 densas iniciales y 47 capas MoE, cada una con 256 expertos enrutados de los que se activan 6 por token, más 1 experto compartido siempre activo. La atención es híbrida: 35 capas usan ventana deslizante de 513 tokens y 14 capas usan atención completa, lo que permite alcanzar los 262k tokens de contexto con un consumo de memoria de KV-cache contenido.

Sobre los datos y el proceso de entrenamiento del modelo original (número de tokens, composición del dataset, RLHF/DPO) no se han publicado detalles en la información disponible; la model card de este repositorio remite al modelo base RecursiveSI/flint para ese contenido.

En cuanto a la cuantización, oQ8e es el nivel 8 "enhanced" del esquema oQ de oMLX: el asignador mide la sensibilidad de cada capa sobre los pesos bf16 y mantiene todos los tensores a 8 bits (a este nivel no hay intercambio de bits entre capas). La variante "e" añade una pasada de imatrix con 128 muestras de calibración que ajusta el rango de recorte (clipping) de cada grupo según la importancia de las activaciones; no modifica el reparto de bits, solo las escalas internas. El resultado es cuantización afín MLX estándar, cargable sin kernels personalizados. Además, oMLX incluye un kernel fusionado de enrutamiento/combine MoE para decodificación de un token en Flint, que aporta en torno a un 16 % de velocidad extra en generación.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation), con razonamiento expuesto en `reasoning_content` mediante el servidor de oMLX.
- Generacion y comprension de codigo (tag "code" en el repositorio y ejemplos de la model card, como escribir funciones en Python).
- Soporte de tool calling / function calling a traves de la API compatible con OpenAI de oMLX.
- Orientacion a agentes y razonamiento multi-paso (tag "agent"); Recursive recomienda un presupuesto de salida de al menos 32k tokens para problemas dificiles, ya que razonamiento y respuesta comparten el presupuesto.
- Contexto muy largo: 262k tokens, util para documentos extensos y conversaciones multi-turno largas.
- Cargable mediante mlx-vlm (>= 0.7.10), lo que sugiere integracion con el ecosistema de modelos de vision-language de MLX, aunque las capacidades multimodales concretas de Flint no estan detalladas en la informacion disponible.
- El chat template es el del modelo original, sin cambios.

## Casos de uso

- Generacion de codigo en local: con 95-110 tok/s en Apple Silicon y soporte de razonamiento largo, es adecuado para asistentes de programacion que ejecutan en un MacBook Pro de 64-128 GB sin depender de la nube.
- Agentes con tool calling: la API de oMLX expone function calling compatible con OpenAI, lo que permite construir agentes que consulten herramientas externas en bucles multi-paso.
- Razonamiento sobre problemas complejos: Recursive recomienda presupuestos de salida de 32k tokens o mas, lo que lo hace adecuado para tareas de matematicas, planificacion o depuracion que requieren cadenas de razonamiento largas.
- Analisis de documentos extensos: la ventana de 262k tokens permite procesar bases de codigo completas, contratos o informes largos en una sola peticion; la velocidad a 16k de contexto se mantiene en 95 tok/s.
- Chatbot multi-turno con memoria de razonamiento: la model card indica mantener el razonamiento devuelto en el historial entre turnos, util para asistentes que necesitan coherencia a lo largo de sesiones largas.
- Inferencia privada en dispositivo: al ejecutarse integramente en Apple Silicon con memoria unificada, es adecuado para flujos de trabajo con requisitos de confidencialidad (datos que no pueden salir de la maquina).
- Evaluacion y comparacion de cuantizaciones: al ser la variante de mayor fidelidad de la familia oQ (KL medio 0,038 frente a bf16), sirve como referencia de calidad para comparar las variantes menores (oQ4e, oQ2e, etc.) en Macs con menos memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) para este modelo en la informacion disponible; la propia model card indica "I haven't run task benchmarks yet". Si se han publicado mediciones de fidelidad frente al modelo bf16 y de velocidad de generacion:

**Fidelidad frente a bf16** (64 fragmentos de 2048 tokens, 65.472 posiciones puntuadas, KL truncado al top-256 de bf16; corpus de prosa inglesa del bench set de oMLX, no garantizado como disjunto de los datos de calibracion):

| Modelo | Tamano | bpw | KL medio ↓ | KL mediano ↓ | Perplejidad ↓ | Acuerdo top-1 ↑ |
|---|---|---|---|---|---|---|
| bf16 (original) | 79,6 GB | 16 | 0 (ref.) | — | 14,30 | 100 % |
| **flint-oQ8e (este repo)** | 42,3 GB | 8,50 | 0,038 | 0,010 | 14,33 | 92,3 % |
| flint-oQ6e | 32,8 GB | 6,60 | 0,051 | 0,019 | 14,34 | 90,3 % |
| flint-oQ4e | 23,4 GB | 4,70 | 0,222 | 0,122 | 14,86 | 78,3 % |
| flint-oQ2e | 13,9 GB | 2,80 | 1,519 | 1,081 | 28,99 | 50,2 % |

**Velocidad de generacion** (tok/s, decodificacion greedy, 256 tokens, mediana de 3 ejecuciones, kernel fusionado MoE de oMLX activado, MacBook Pro M5 Max 128 GB):

| Variante | ~30 tokens de contexto | 4k | 16k | Memoria pico |
|---|---|---|---|---|
| **oQ8e (este repo)** | 110 | 103 | 95 | 42,4-43,9 GB |

## Requisitos de hardware

- Memoria unificada necesaria: ~42,4 GB en contexto corto y ~43,9 GB a 16k de contexto durante la generacion. La model card indica que se necesita un Mac de 64 GB como minimo; probado en un MacBook Pro M5 Max de 128 GB.
- Consumer GPU: no cabe en GPUs de consumo tipicas (una RTX 4090 con 24 GB o una RTX 5090 con 32 GB se quedan cortas para los 42,3 GB de pesos). Esta pensado para Apple Silicon con memoria unificada, no para GPUs NVIDIA.
- GPU recomendadas: Apple Silicon con 64 GB o mas de memoria unificada (M3/M4/M5 Max o Ultra). Para GPUs NVIDIA de datacenter (A100/H100 de 80 GB) no hay soporte MLX directo; habria que usar el modelo original bf16 (79,6 GB) u otras cuantizaciones.
- Despliegue:
  - oMLX (recomendado): `hf download mlx-community/flint-oQ8e` y `omlx serve`; expone API compatible con OpenAI con tool calls.
  - mlx-vlm >= 0.7.10: via `mlx_vlm.generate` o como libreria.
  - No compatible con mlx-lm estandar: los pesos llevan el prefijo `language_model.` del class de mlx-vlm, y el loader `flint` de mlx-lm espera nombres sin prefijo.
  - llama.cpp, vLLM, TGI, Ollama: no disponibles para este formato MLX.
- Latencia y throughput: 110 tok/s a contexto corto, 103 tok/s a 4k y 95 tok/s a 16k (M5 Max, decodificacion greedy, kernel fusionado activado). Es un 12 % mas lento que la variante oQ4e. Los numeros absolutos pueden variar hasta un ~10 % entre sesiones.

## Comparativa con modelos similares

Comparativa con otras cuantizaciones de la misma familia publicadas en el mismo repositorio (todas sobre RecursiveSI/flint, 40B MoE, Apache 2.0, contexto 262k):

| Modelo | Tamano | bpw | KL medio vs bf16 | Perplejidad | Acuerdo top-1 | Memoria pico | Vel. a 4k (tok/s) |
|---|---|---|---|---|---|---|---|
| flint-oQ8e (este repo) | 42,3 GB | 8,50 | 0,038 | 14,33 | 92,3 % | 42,4-43,9 GB | 103 |
| flint-oQ6e | 32,8 GB | 6,60 | 0,051 | 14,34 | 90,3 % | 32,9-34,4 GB | 96 |
| flint-oQ4e | 23,4 GB | 4,70 | 0,222 | 14,86 | 78,3 % | 23,5-25,0 GB | 110 |
| flint-oQ2e | 13,9 GB | 2,80 | 1,519 | 28,99 | 50,2 % | 14,0-15,5 GB | 124 |

Lectura rapida: oQ8e es la opcion para Macs de 64-128 GB que priorizan fidelidad maxima al modelo original; oQ6e ofrece casi la misma calidad con 10 GB menos; oQ4e es el punto dulce de velocidad (incluso mas rapido que oQ8e, ~12 %) y cabe en Macs de 32-48 GB, con perdida de fidelidad apreciable; las variantes oQ3 y por debajo degradan notablemente la perplejidad. No se dispone de datos comparativos directos con modelos MoE de otras familias de tamano similar (por ejemplo Qwen3-30B-A3B o GLM-4.5-Air) en la informacion proporcionada.

## Limitaciones y advertencias

- Los numeros de fidelidad (KL, perplejidad, acuerdo top-1) provienen de un corpus de prosa inglesa que no esta garantizado como disjunto de los datos de calibracion de oQ, por lo que sirven para ordenar las variantes entre si, no como puntuacion de calidad absoluta en tareas reales.
- No se han publicado benchmarks de tareas (MMLU, HumanEval, etc.) ni para este repo ni, segun la model card, por el autor de la cuantizacion; para evaluaciones del modelo original hay que consultar la model card de RecursiveSI/flint.
- Incompatibilidad de loaders: los pesos usan el prefijo `language_model.` de mlx-vlm y no cargan en mlx-lm estandar; hay que usar oMLX o mlx-vlm >= 0.7.10.
- Requiere al menos un Mac de 64 GB; no es ejecutable en la mayoria de portatiles ni en GPUs de consumo NVIDIA en este formato.
- Al compartir razonamiento y respuesta un mismo presupuesto de salida, las tareas dificiles necesitan presupuestos de 32k tokens o superiores, lo que incrementa la latencia total.
- El corpus de evaluacion es ingles; el soporte de idiomas del modelo (incluido el castellano) no esta documentado en la informacion disponible.
- Riesgo de alucinacion, sesgos y limitaciones del modelo base: no detallados en la model card de este repo; consultar la documentacion de RecursiveSI/flint.
- Licencia Apache 2.0 tanto en la cuantizacion como en los pesos originales, lo que permite uso comercial sin restricciones adicionales conocidas; la model card menciona terminos de la API alojada de Recursive, que no afectan a los pesos locales pero conviene revisar si se usa su servicio.
- La variabilidad de velocidad entre sesiones (hasta ~10 %) hace que diferencias pequenas en mediciones propias no sean significativas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/mlx-community/flint-oQ8e
- Modelo base (bf16): https://huggingface.co/RecursiveSI/flint
- oMLX (herramienta de cuantizacion y servidor): https://github.com/jundot/omlx
- Autor del modelo original: https://www.recursive.com
- Cuantizaciones hermanas (misma familia oQ): https://huggingface.co/mlx-community/flint-oQ6e, https://huggingface.co/mlx-community/flint-oQ4e, https://huggingface.co/mlx-community/flint-oQ2e
- Paper, blog o demo del modelo original: no disponibles en la informacion proporcionada.
