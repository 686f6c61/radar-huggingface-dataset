# hletrd/Qwen2.5-7B-Instruct-Tensix-BFP4-MLP

## Resumen

Qwen2.5-7B-Instruct-Tensix-BFP4-MLP es una cuantizacion del modelo Qwen2.5-7B-Instruct de Alibaba Qwen, adaptada especificamente para su ejecucion sobre aceleradores Tenstorrent Tensix mediante el stack tt-metal/ttnn de Tenstorrent. El trabajo lo publica el usuario hletrd en Hugging Face y se apoya en el repositorio tensix-bfp-gptq de Xylolabs, que implementa un pipeline de cuantizacion post-entrenamiento hacia formatos de coma flotante en bloque (block floating point, BFP). El objetivo es claro: reducir la huella de memoria y el ancho de banda del modelo base para que pueda desplegarse en hardware NPU de Tenstorrent sin perder demasiada fidelidad respecto al original en bfloat16.

El modelo base Qwen2.5-7B-Instruct es un transformer denso de 7.615.616.512 parametros, con 28 capas, atencion por cabezas agrupadas (GQA) y una ventana de contexto de 32.768 tokens, entrenado por el equipo Qwen y publicado bajo licencia Apache 2.0. Esta variante concreta no modifica la arquitectura ni el entrenamiento: solo altera la representacion numerica de determinadas matrices de pesos. En concreto, la carpeta `bfp4/` cuantiza las proyecciones MLP a bfloat4_b, deja la atencion en bfloat8_b y mantiene el resto en bf16, alcanzando un tamano empaquetado de 6,262 GB frente a los 15,23 GB del modelo en bf16.

Su relevancia ahora es doble. Por un lado, demuestra que es viable llevar modelos de 7B a NPUs de Tenstorrent con una perdida de fidelidad medible y acotada (KL media de 0,0470 frente a bf16 en la carpeta bfp4). Por otro, ofrece una alternativa abierta a los formatos de cuantizacion dominantes en el ecosistema GPU (GPTQ, AWQ, GGUF Q4_K_M), con scripts de empaquetado y verificacion incluidos y compatibles con ttnn y tt-forge.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (Qwen2.5), con GQA y RoPE |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredada de Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | BFP4 (MLP bfloat4_b, atencion bfloat8_b, resto bf16); BFP8 (atencion y MLP bfloat8_b, resto bf16) |
| Idiomas soportados | Ingles (etiqueta `language: en` en la model card); el modelo base soporta mas idiomas, pero esta ficha no los declara |
| Licencia | Apache 2.0 (igual que el modelo base; cambios documentados en `NOTICE`) |
| Formato de pesos | safetensors (con ficheros `quant4.json` y `model.safetensors.index.json` para el mapeo de formatos) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only denso con atencion por cabezas agrupadas, normalizacion RMSNorm, activacion SwiGLU en las MLP y embeddings RoPE para la posicion. No hay mezcla de expertos ni componentes state-space; es un modelo puramente transformer. El entrenamiento original de Qwen2.5 incluye preentrenamiento sobre un corpus multilingue de gran escala (el informe tecnico de Qwen2 cita del orden de 18 billones de tokens para la familia, aunque esta ficha no dispone del desglose exacto para la variante 7B) seguido de ajuste supervisado y optimizacion por preferencias para la version Instruct.

Esta variante no reentrena el modelo. Aplica cuantizacion post-entrenamiento con el pipeline tensix-bfp-gptq, que convierte los pesos a formatos block floating point propios del hardware Tensix: bfloat4_b (bloques de 4 bits con exponente compartido) y bfloat8_b (bloques de 8 bits). La innovacion tecnica relevante es la convivencia de formatos en un mismo checkpoint: la carpeta `bfp4/` usa 4 bits solo en las proyecciones MLP, mantiene la atencion en 8 bits y deja el resto en bf16, una asignacion de precision por capas que busca el mejor compromiso entre tamano y fidelidad. El repositorio incluye `pack_tensix.py` y `verify_grid.py` para empaquetar las matrices en el layout TILE de ttnn y verificar la ida y vuelta de los valores empaquetados.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat (`apply_chat_template`) heredada de Qwen2.5-Instruct.
- Razonamiento y respuesta a instrucciones, incluyendo matematicas y logica de nivel medio, propias del modelo base.
- Generacion de codigo y explicacion de codigo, capacidad heredada de Qwen2.5-7B-Instruct.
- Soporte de tool calling y function calling segun el formato de Qwen2.5-Instruct (no validado de forma independiente en esta cuantizacion).
- Capacidades multilingues del modelo base, aunque la model card solo declara ingles para esta variante.
- Ejecucion nativa en NPUs Tenstorrent Tensix mediante ttnn (bfloat4_b, bfloat8_b) y mediante tt-forge con `torch.compile(backend="tt")`.
- Compatibilidad con transformers en CPU/GPU usando `dtype="bfloat16"` y `device_map="auto"`, lo que permite usar el checkpoint como referencia o en entornos sin NPU.
- No incluye vision, audio ni modo thinking explicito; es un modelo de texto puro.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el caso principal. Cargar la carpeta `bfp4/` en una NPU Tensix con tt-metal v0.81.1 y `--use_hf_rope` permite servir un modelo de 7B en 6,262 GB empaquetados, liberando DRAM y ancho de banda frente a bf16.
- Servicio de chat en ingles con contexto largo: con 32.768 tokens de ventana, el modelo puede gestionar conversaciones multi-turno extensas, resumenes de documentos largos o analisis de historiales completos en un unico prompt.
- Prototipado de pipelines de inferencia en hardware no NVIDIA: util para equipos que evaluan Tenstorrent como alternativa y necesitan un checkpoint ya empaquetado en el layout TILE, sin escribir su propio conversor.
- Generacion de codigo asistida en herramientas internas: el modelo base rinde bien en tareas de autocompletado y explicacion de codigo; esta variante permite integrarlo en un backend de bajo consumo sobre NPU.
- Extraccion de informacion y clasificacion de texto: tareas de resumen, etiquetado y respuesta extractiva sobre documentos en ingles, donde la perdida de fidelidad de la cuantizacion BFP4 es tolerable.
- Evaluacion comparativa de formatos de cuantizacion: el repositorio incluye las carpetas `bfp4/` y `bfp8/` con metricas KL publicadas, lo que facilita estudios de degradacion frente a bf16 y frente a Q4_K_M de llama.cpp.
- Educacion e investigacion en cuantizacion: los scripts `pack_tensix.py` y `verify_grid.py` sirven como referencia para entender como se empaquetan matrices en block floating point y como se verifica la precision tras el empaquetado.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.). Lo que si aporta son metricas de fidelidad de cuantizacion: divergencia KL media frente a bf16, calculada sobre 16.104 posiciones de texto en ingles y coreano (WikiText-2 test y Wikipedia en coreano).

| Formato | Tamano empaquetado (GB) | KL media vs bf16 |
|---|---|---|
| bfp4/ (MLP bfloat4_b, atencion bfloat8_b) | 6,262 | 0,0470 |
| bfp8/ (atencion y MLP bfloat8_b) | 9,114 | 0,00158 |
| BF16 (Qwen2.5-7B-Instruct original) | 15,23 | 0 |
| Q4_K_M (llama.cpp) | 4,683 | 0,0369 |

No se han publicado resultados de benchmarks de tareas en la informacion disponible.

## Requisitos de hardware

- VRAM/DRAM estimada: 6,262 GB para `bfp4/` y 9,114 GB para `bfp8/` en formato empaquetado; el modelo en bf16 ocupa 15,23 GB.
- Hardware objetivo: NPUs Tenstorrent Tensix con tt-metal v0.81.1 o superior y `pjrt-plugin-tt==1.4.0` para la ruta tt-forge.
- GPU convencionales: al ser un checkpoint en safetensors compatible con transformers, puede cargarse en GPU con `dtype="bfloat16"` y `device_map="auto"`; en ese caso la huella efectiva es la del modelo en bf16 (unos 15,2 GB), por lo que encaja en GPUs de 24 GB o mas (RTX 4090, A10G, L4 no; A100 40 GB, H100 80 GB, RTX 3090/4090 24 GB con margen justo).
- Consumer GPU: si se usa la ruta transformers con bf16, cabe en RTX 3090 y RTX 4090 de 24 GB; en GPUs de 16 GB o menos no cabe sin una conversion adicional a un formato de cuantizacion de GPU (no incluida en este repo).
- Opciones de despliegue: ttnn (`ttnn.as_tensor` con `ttnn.bfloat4_b`/`ttnn.bfloat8_b`), tt-forge con `torch.compile(backend="tt")`, y transformers estandar como referencia. No se documenta soporte para vLLM, llama.cpp ni TGI en esta variante.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato/cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen2.5-7B-Instruct-Tensix-BFP4-MLP (este) | 7,6B | 32.768 | BFP4/BFP8 para Tensix | Apache 2.0 | KL 0,0470 vs bf16; 6,262 GB |
| Qwen/Qwen2.5-7B-Instruct (bf16) | 7,6B | 32.768 | bf16 | Apache 2.0 | Referencia sin perdida; 15,23 GB |
| Qwen2.5-7B-Instruct Q4_K_M (llama.cpp) | 7,6B | 32.768 | GGUF Q4_K_M | Apache 2.0 | KL 0,0369 vs bf16; 4,683 GB; orientado a CPU/GPU |
| Qwen2.5-7B-Instruct-Tensix-BFP8 (misma familia) | 7,6B | 32.768 | BFP8 para Tensix | Apache 2.0 | KL 0,00158 vs bf16; 9,114 GB |

La comparativa se limita a variantes del mismo modelo base porque la informacion disponible no incluye datos de benchmarks de tareas que permitan contrastar con otras familias (Llama 3.1 8B, Mistral 7B, etc.). En terminos de fidelidad, BFP4 se situa ligeramente por encima de Q4_K_M en KL (0,0470 frente a 0,0369), pero con mayor tamano empaquetado (6,262 GB frente a 4,683 GB); BFP8 es casi indistinguible de bf16 en KL pero ocupa mas.

## Limitaciones y advertencias

- La cuantizacion BFP4 introduce una degradacion medible (KL 0,0470 frente a bf16); en tareas sensibles a la precision (matematicas exactas, codigo con sintaxis estricta) puede haber mas errores que con el modelo original.
- La model card solo declara ingles como idioma soportado; el rendimiento en castellano no esta validado para esta variante, aunque el modelo base sea multilingue.
- El checkpoint esta pensado para Tensix; fuera de ese hardware se pierde la ventaja de tamano y se carga en bf16, con la huella completa de 15,23 GB.
- Requiere versiones concretas del stack (tt-metal v0.81.1, `pjrt-plugin-tt==1.4.0`, `--use_hf_rope`); versiones distintas pueden romper la compatibilidad.
- No se publican benchmarks de tareas ni evaluaciones de seguridad, sesgos o alucinacion para esta cuantizacion; los riesgos del modelo base (sesgos del corpus de entrenamiento, alucinacion en preguntas factuales) se heredan sin mitigacion adicional.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar el fichero `NOTICE` de cada carpeta para conocer los cambios introducidos por el cuantizador.
- El autor del repo (hletrd) no es el mismo que el autor del pipeline (Xylolabs); la trazabilidad del proceso de cuantizacion depende de la documentacion publicada en el repositorio tensix-bfp-gptq.
- El modelo tiene 0 likes y 173 descargas en el momento de redactar esta ficha, lo que indica una validacion comunitaria muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hletrd/Qwen2.5-7B-Instruct-Tensix-BFP4-MLP
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio del pipeline de cuantizacion (Xylolabs): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Paper de referencia citado en los tags (arXiv:2407.10671): https://arxiv.org/abs/2407.10671
- Informe tecnico de Qwen2 (arXiv): https://arxiv.org/abs/2407.10671
