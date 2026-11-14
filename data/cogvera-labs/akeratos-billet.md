# Cogvera-Labs/Akeratos-Billet

## Resumen

Akeratos Billet es un checkpoint de investigación publicado por Cogvera-Labs como prueba de concepto de Akeratos, un laboratorio abierto dedicado al entrenamiento de modelos de lenguaje sobre Apple Silicon con MLX. Se trata de un transformer decoder-only con un núcleo denso de 162M parámetros acompañado de una tabla de n-gramas aprendida de 6.000 millones de parámetros, entrenado desde cero sobre aproximadamente 3.200 millones de tokens de texto web en inglés procedente de FineWeb-Edu. Todo el entrenamiento se realizó en un único MacBook Pro con chip M4 Max y 48 GB de memoria unificada, manteniendo la tabla completa residente en memoria durante todo el proceso.

El modelo no compite en capacidad con modelos de su categoría nominal: su interés es metodológico. Akeratos Billet existe para sostener una afirmación concreta y acotada: que una tabla aprendida de miles de millones de parámetros puede entrenarse residente en la memoria unificada de un solo Mac. Para aislar el efecto de la tabla, el autor publica un gemelo, Akeratos Billet-Twin, entrenado sobre los mismos tokens con la tabla desactivada, de modo que la comparación entre ambos mide qué aporta realmente el mecanismo de n-gramas.

Es relevante ahora porque documenta de forma reproducible un pipeline completo de preentrenamiento en hardware de consumo, con logs, semillas, schedule de learning rate y código empaquetado tal como se entrenó. No es un modelo de instrucciones ni un producto: es un modelo base que continúa texto, sin entrenamiento de seguridad, y ejecutable únicamente con el código propio del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con tabla de n-gramas aprendida inyectada en el residual stream |
| Parametros totales | 274.918.908 densos (incluyendo value embeddings, norms y gates) mas 6.000.000.000 de la tabla; nucleo reportado como 162M (161.611.776) |
| Parametros activos | no disponible (no es MoE; la tabla se lee por filas hasheadas en cada posicion) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (no existe version cuantizada) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors propietario (`dense.safetensors`, `ema.safetensors`) y tabla en 12 shards con filas bfloat16, valor de optimizador float32 y stamp int32; esquema de config propio `metalforge.export/v1`, no compatible con transformers ni GGUF |

## Arquitectura y entrenamiento

El nucleo es un transformer decoder-only de 18 capas y anchura 768. La atencion usa 6 cabezas de query y 2 cabezas key-value de 128 dimensiones (GQA), y el bloque feed-forward tiene 3.456 unidades con squared ReLU. Los embeddings de entrada y salida estan atados, y las capas impares anaden value embeddings. La atencion es mayoritariamente local: la mayoria de capas atienden solo a los ultimos 512 tokens, mientras que las capas 4, 9, 14 y 17 (indexadas desde 0) atienden al contexto completo de 2.048 tokens. El vocabulario es el de SmolLM2, con 49.152 tokens; el id 0 separa documentos y los ids 1-16 estan reservados y el modelo base nunca los predice.

La innovacion central es la tabla de n-gramas: 7.812.500 filas de 768 numeros. En cada posicion el modelo lee una fila de bigrama hasheada y una fila de trigrama hasheada, las suma, divide por raiz de 2 y anade el resultado al residual stream antes de cada bloque, con una intensidad aprendida por bloque. El entrenamiento consistio en 24.415 pasos de 131.072 tokens (2 filas de 2.048 tokens y 32 micro-lotes), unos 3.200 millones de tokens en total, con computo en bfloat16 y pesos maestros en float32. El learning rate pico fue 1e-2, seleccionado mediante un barrido de 1e-3, 3e-3 y 1e-2 con 50M tokens cada uno, con decaimiento en el ultimo 20% de los pasos desde el paso 19.532. La memoria pico segun MLX fue de 24,1 GiB y el tiempo de entrenamiento de 107,6 horas en un M4 Max de 40 nucleos GPU y 48 GB. No se menciona RLHF ni DPO.

## Capacidades

- Generacion de texto por continuacion autoregresiva: el modelo completa un prompt con decodificacion greedy mediante `bake generate`.
- Modelado de lenguaje base en ingles: no ha recibido ajuste de instrucciones ni alineamiento.
- Memoria de n-gramas a nivel de token: lectura de filas de bigrama y trigrama hasheadas en cada posicion, con frecuencia de lectura registrada en `reads.npy`.
- Pesos alternativos: `--weights ema` permite usar los pesos de media movil exponencial en lugar de los crudos.
- Inspeccion de tokens: la flag `--json` devuelve tambien los ids de token generados.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades multimodales (vision, audio) ni de thinking mode.
- Multilingue: no, unicamente ingles.

## Casos de uso

- Investigacion sobre memorizacion parametrica: comparar Akeratos Billet con su gemelo Billet-Twin sobre los mismos tokens permite medir de forma controlada la contribucion de una tabla de n-gramas de 6.000 millones de parametros frente a un nucleo denso de 162M.
- Reproduccion de preentrenamiento en Apple Silicon: el repositorio incluye `logs/run.json`, `logs/metrics.jsonl`, la configuracion completa del schedule y el codigo empaquetado tal como se entreno, lo que permite replicar el experimento paso a paso en un M4 Max con 48 GB.
- Estudio de eficiencia memoria-parametros: el checkpoint documenta que 24,1 GiB de memoria pico bastan para entrenar una tabla de 6.000 millones de parametros junto a un nucleo denso, un dato util para disenar arquitecturas con parametros fuera del grafo de computo denso.
- Docencia y divulgacion sobre arquitecturas hibridas: la separacion entre atencion local (512 tokens) y atencion completa en capas concretas, junto con la inyeccion de n-gramas por bloque, sirve como caso de estudio concreto y reproducible.
- Analisis de decodificacion greedy en modelos base: `bake generate` con `--max-tokens` y parada en end-of-document permite estudiar el comportamiento de un modelo pequeno sin ajuste de instrucciones sobre prompts de continuacion.
- Verificacion de integridad de artefactos: el flujo documentado con `SHA256SUMS` y `shasum -a 256 -c` sirve como plantilla para validar descargas de checkpoints de gran tamano en pipelines de investigacion.
- Experimentacion con tokenizadores: al reutilizar el tokenizador de SmolLM2 (49.152 tokens) con ids reservados, permite estudiar el impacto de un vocabulario ajeno en un modelo entrenado desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card describe una evaluacion comparativa contra Akeratos Billet-Twin (mismos tokens, tabla desactivada), pero no incluye cifras de MMLU, HumanEval, GSM8K ni de perplejidad en el material proporcionado.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 13,0 GiB en el pico de `bake generate` segun la model card, medido en un M4 Max de 48 GB.
- Espacio en disco: aproximadamente 14,4 GB libres para la descarga; el repositorio ocupa 28,7 GB.
- GPU recomendadas: Apple Silicon exclusivamente; el entrenamiento se realizo en un M4 Max de 40 nucleos GPU. No se documenta soporte para A100, H100 ni RTX 4090.
- GPU de consumo: si cabe en Apple Silicon de gama alta con memoria unificada suficiente; no hay soporte para GPUs NVIDIA consumer.
- Sistema operativo: macOS 14 o posterior, con `uv` 0.13.6 o superior.
- Opciones de despliegue: unicamente el codigo propio del proyecto (`bake generate` desde el repositorio `cogvera-labs/akeratos`, rama `v0.1.0`). No es compatible con vLLM, llama.cpp, Ollama, TGI, transformers ni mlx-lm.
- Latencia y throughput: no disponibles. Solo se documenta el tiempo de entrenamiento (107,6 horas) y la memoria pico (24,1 GiB).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / ecosistema | Notas |
|---|---|---|---|---|---|
| Akeratos Billet | 162M nucleo + 6.000M tabla | 2.048 | Apache-2.0 | Propietario (`metalforge.export/v1`), solo `bake` | Base, sin instrucciones, solo ingles, solo Apple Silicon |
| Akeratos Billet-Twin | Mismo nucleo, sin tabla | 2.048 | Apache-2.0 | Propietario, solo `bake` | Gemelo de control del mismo autor; permite aislar el efecto de la tabla |
| SmolLM2 | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | Solo se referencia su tokenizador (49.152 tokens), no el modelo |
| Alternativas de 160M en transformers/GGUF | no disponible | no disponible | no disponible | no disponible | No se aportan datos de comparacion en la informacion disponible |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- No sigue instrucciones: es un modelo base que continua texto; no debe usarse como asistente.
- Sin entrenamiento de seguridad: no ha pasado por RLHF, DPO ni filtros de alineamiento.
- Solo ingles: el unico idioma declarado es `en`.
- Contexto limitado a 2.048 tokens, con atencion local de 512 tokens en la mayoria de capas.
- Ecosistema cerrado: los ficheros estan en formato propio y solo los carga el codigo de Akeratos; transformers, mlx-lm y las herramientas GGUF no pueden leerlos.
- Sin version cuantizada: no hay GGUF, AWQ, GPTQ ni equivalentes.
- Dependencia de hardware: requiere Apple Silicon con macOS 14 o posterior y memoria unificada suficiente (13,0 GiB en pico de generacion).
- Riesgo de alucinacion: inherente a un modelo base de 162M entrenado con 3.200 millones de tokens; no hay evaluacion de fidelidad publicada.
- Sesgos: no se documenta ninguna evaluacion de sesgos; el corpus FineWeb-Edu puede arrastrar sesgos de la web filtrada por criterios educativos.
- Licencia Apache-2.0 permite uso comercial, pero el modelo no es un producto y su utilidad practica en produccion es muy limitada.
- Advertencia de integridad: `bake generate` no verifica los hashes; hay que ejecutar `shasum -a 256 -c SHA256SUMS` manualmente.
- Trazabilidad: el codigo empaquetado se distribuye bajo el nombre anterior del proyecto (MetalForge) y con el esquema `metalforge.export/v1`.

## Enlaces

- Hugging Face: https://huggingface.co/Cogvera-Labs/Akeratos-Billet
- Gemelo de control: https://huggingface.co/Cogvera-Labs/Akeratos-Billet-Twin
- Repositorio del proyecto: https://github.com/cogvera-labs/akeratos
- Documentacion de reproduccion: https://github.com/cogvera-labs/akeratos/blob/main/docs/reproduce.md#what-you-need
- Explicacion de la memoria de n-gramas: https://github.com/cogvera-labs/akeratos/blob/main/docs/learn/n-gram-memory.md
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
