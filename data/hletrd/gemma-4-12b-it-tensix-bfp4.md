# hletrd/gemma-4-12B-it-Tensix-BFP4

## Resumen

gemma-4-12B-it-Tensix-BFP4 es una versión cuantizada del modelo instructivo google/gemma-4-12B-it de Google DeepMind, publicada por el usuario hletrd. El modelo base es un Gemma 4 de 12 mil millones de parámetros con ajuste por instrucciones y arquitectura multimodal (pipeline any-to-any), orientado a tareas de imagen-texto-a-texto. Esta variante no modifica el modelo original en cuanto a capacidades: su propósito es adaptar los pesos a los formatos nativos de punto flotante por bloques de TT-NN, el stack de software de Tenstorrent para sus procesadores Tensix (Wormhole y Blackhole).

La cuantización se aplica únicamente a las proyecciones lineales del modelo de lenguaje, que se redondean a bfloat4_b (BFP4) mediante GPTQ con búsqueda de exponente, un trabajo realizado por Xylolabs. Los módulos de audio y visión (embed_audio, embed_vision, vision_embedder), las normas, los sesgos, el embedding y la cabeza LM permanecen en bf16. El resultado es un checkpoint que ocupa 26,0 GB en disco como ficheros bf16, pero que empaquetado en los formatos Tensix promedia 5,47 bits por peso y ocupa 8,146 GB.

La relevancia de esta ficha es acotada: se trata de un artefacto de despliegue para hardware Tenstorrent, no de un modelo nuevo. No hay benchmarks publicados, el repositorio no tiene descargas ni likes, y el autor declara explícitamente que no ha probado los exports en tarjetas Tenstorrent reales, solo en el simulador funcional ttsim.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (gemma4_unified), pipeline any-to-any; pesos lineales cuantizados a BFP4 |
| Parametros totales | 12.966.363.184 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (bfloat4_b, 4,5 bits/peso) en proyecciones lineales; bf16 en embedding, LM head, normas, sesgos y modulos de vision/audio; media de 5,47 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16 con valores sobre la rejilla BFP); empaquetable a ttnn.bfloat4_b / ttnn.bfloat8_b |

## Arquitectura y entrenamiento

El modelo base es un Gemma 4 de 12B con ajuste por instrucciones y capacidad multimodal (imagen-texto-a-texto, con módulos de visión y audio). La arquitectura interna del modelo base no se detalla en la información disponible; la model card solo especifica que el modelo de lenguaje consta de 48 capas con proyecciones de atención (q, k, v, o) y de MLP (gate, up, down), todas ellas cuantizadas en esta variante.

El proceso de cuantización aplica GPTQ con búsqueda de exponente sobre las 328 matrices lineales, redondeándolas a bfloat4_b. En este formato de TT-NN, 16 valores consecutivos comparten un exponente de 8 bits y cada valor conserva signo y mantisa de 3 bits (frente a 7 bits en BFP8). Los ficheros safetensors almacenan valores bf16 que caen exactamente sobre la rejilla de punto flotante por bloques de cada matriz, de modo que en transformers el checkpoint se carga como el modelo base y calcula lo mismo que el modelo redondeado; el empaquetador de TT-NN almacena esos mismos valores sin volver a redondearlos. El fichero quant4.json documenta el formato de cada proyección por capa. No se aportan datos sobre el entrenamiento original (tokens, composición del dataset, RLHF/DPO).

## Capacidades

- Generación de texto y razonamiento conversacional, heredados del modelo base instructivo.
- Procesamiento multimodal imagen-texto-a-texto (pipeline any-to-any).
- Módulos de audio y visión preservados en bf16, por lo que las capacidades multimodales del modelo base se mantienen sin cuantizar.
- Soporte de plantilla de chat mediante apply_chat_template en transformers.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidad especial: empaquetado nativo en formatos Tensix (bfloat4_b, bfloat8_b) para ejecución en NPU Tenstorrent.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el caso principal. El checkpoint está pensado para empaquetarse con TT-NN y ejecutarse en procesadores Tensix (Wormhole, Blackhole), donde una matriz en BFP4 se lee desde memoria con aproximadamente la mitad de bytes que en BFP8, reduciendo el ancho de banda necesario.
- Investigación en cuantización de bajo bit: sirve para estudiar el impacto de BFP4 con GPTQ y búsqueda de exponente sobre un modelo instructivo multimodal de 12B, comparando la salida con el modelo base en bf16.
- Validación de pipelines de empaquetado: el script pack_tensix.py y verify_grid.py permiten comprobar que el redondeo por bloques reproduce exactamente los valores que almacena TT-NN, útil para integrar el modelo en cadenas de despliegue propias.
- Pruebas en simulador: con ttsim (simulador funcional de Blackhole) se puede validar el flujo completo de empaquetado y ejecución sin disponer de hardware Tenstorrent.
- Generación de caché de pesos: la opción --cache-dir genera ficheros de caché de TT-NN que se cargan posteriormente sin volver a empaquetar, lo que acelera arranques repetidos en producción.
- Evaluación comparativa de formatos: el mismo modelo puede empaquetarse también en bfloat8_b, permitiendo medir el compromiso entre precisión y huella de memoria en el mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad (MMLU, HumanEval, GSM8K ni similares) ni mediciones de latencia o throughput en hardware Tenstorrent; el autor indica explícitamente que no ha evaluado estos exports en tarjetas propias de Tenstorrent.

## Requisitos de hardware

- VRAM estimada: el checkpoint en safetensors ocupa 26,0 GB (bf16); empaquetado en formatos Tensix ocupa 8,146 GB con una media de 5,47 bits por peso.
- Hardware objetivo: procesadores Tensix de Tenstorrent (Wormhole y Blackhole). No es un modelo pensado para GPU convencional en su forma empaquetada.
- GPU de consumo: no disponible; la información no documenta requisitos para GPU NVIDIA o AMD. En transformers puede cargarse en bf16 con device_map="auto", lo que requiere del orden de 26 GB de memoria, pero ese no es el modo de despliegue previsto.
- Opciones de despliegue: TT-NN (paquete Python ttnn) sobre tt-metal; carga en transformers para verificación. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Herramientas incluidas: pack_tensix.py (empaquetado y verificación, con --device y --cache-dir) y verify_grid.py (verificación sin software de Tenstorrent, solo torch y safetensors).
- Latencia y throughput: no disponibles. El autor solo señala que BFP4 reduce aproximadamente a la mitad los bytes leídos desde memoria frente a BFP8.
- Entorno probado: ttnn 0.81.1 (PyPI) con torch 2.15.0 sobre ttsim; no probado en hardware real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| hletrd/gemma-4-12B-it-Tensix-BFP4 | 12,97B | no disponible | BFP4 + bf16 parcial | apache-2.0 | Tensix (Wormhole, Blackhole) |
| google/gemma-4-12B-it (base) | 12B | no disponible | bf16 | no disponible en la informacion | GPU/NPU convencional |
| Otras variantes cuantizadas de Gemma 4 12B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- No verificado en hardware real: todas las pruebas se realizaron en ttsim, el simulador funcional de Blackhole; el autor no ha ejecutado el modelo en tarjetas Tenstorrent.
- Sin benchmarks: no hay métricas de calidad que cuantifiquen la pérdida de precisión introducida por BFP4 frente al modelo base en bf16.
- Sesgos: no documentados en la información disponible; al heredar el modelo base, arrastra los sesgos de este.
- Riesgo de alucinación: no evaluado en esta variante; es esperable un comportamiento similar al modelo base, sin datos que lo confirmen.
- Idiomas y contexto: no disponibles; no se puede confirmar el soporte multilingüe ni la ventana de contexto efectiva.
- Dependencia de ecosistema: el modo de despliegue previsto exige TT-NN y tt-metal; fuera de Tensix solo es utilizable como checkpoint bf16 en transformers.
- Licencia: apache-2.0 según la model card, pero conviene verificar las condiciones del modelo base google/gemma-4-12B-it antes de uso comercial, ya que la información disponible no detalla la licencia del original.
- Madurez: repositorio sin descargas ni likes, creado y actualizado el mismo día, sin comunidad que lo respalde.
- No afiliado a Tenstorrent: el autor declara no tener relación ni respaldo de la compañía.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hletrd/gemma-4-12B-it-Tensix-BFP4
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- tt-metal y TT-NN: https://github.com/tenstorrent/tt-metal
- Guía de instalación de tt-metal: https://github.com/tenstorrent/tt-metal/blob/main/INSTALLING.md
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper de referencia citado en los tags: arxiv:2607.02770 (https://arxiv.org/abs/2607.02770)
