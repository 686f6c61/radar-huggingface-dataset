# jayPark777/MiniMax-Music-3-3Trit-MLQT

## Resumen

MiniMax Music 3 (Axon MLQT v1.1a) es una versión cuantizada del modelo de generación musical MiniMax Music 3, publicada por el usuario jayPark777 bajo la etiqueta de ingeniería de Axon Labs. No es un modelo nuevo: es un reempaquetado de pesos del modelo base MiniMaxAI/MiniMax-Music-3 que reduce el peso total de 13,35 GB a 4,43 GB (un 66,8 % menos) mediante cuantización ternaria de 3 trits (2 bits por peso, códigos {-1, 0, +1}), poda 0-skip y un esquema de routing dual-block que preserva los tensores sensibles sin pérdida. El resultado práctico es que un modelo de generación de canción completa puede ejecutarse en una GPU de gama media como la RTX 3060 de 12 GB dentro de ComfyUI.

La relevancia de esta ficha es acotada y conviene decirla sin adornos: el repositorio acumula 0 descargas y 0 likes desde su creación el 13 de septiembre de 2026, no se han publicado resultados de benchmarks estándar y las únicas métricas disponibles son las de verificación interna del propio autor sobre la integridad del empaquetado y una generación de audio de 60 segundos. Todos los datos numéricos de la model card fueron medidos por el autor el 26 de agosto de 2026 en ComfyUI 0.33.0 sobre una RTX 3060 de 12 GB.

La arquitectura del modelo base combina tres componentes: un DiT (diffusion transformer) para la difusión latente, un text encoder junto con un modelo autorregresivo basado en Qwen3, y un VAE de audio denominado `dav`. La cuantización actúa de forma asimétrica sobre ellos, con una reducción del DiT al 14,7 % de su tamaño original frente a un recorte más conservador del 41,6 % en el text encoder.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: DiT (diffusion transformer) + text encoder y módulo autorregresivo basado en Qwen3 + VAE de audio (`dav`) |
| Parametros totales | no disponible (solo se publican tamaños en disco) |
| Parametros activos | no disponible (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria de 3 trits (2 bits por peso, códigos {0:-1, 1:0, 2:+1}), escalas alpha por bloque, dual-block con bloques de 32 y 64, poda 0-skip, routing con preservación de outliers. VAE de audio conservado sin pérdida. Tensores sensibles (norm, bias, embed, head, tokenizer_json) conservados en dtype original |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors estándar con tensores empaquetados: `.mlqt_trits` (U8, 4 códigos de 2 bits por byte), `.mlqt_scale` (F16), `.mlqt_shape` (I32), `.mlqt_meta` (U8 con JSON de `numel` y `block`) |
| Tamano del repositorio | 4,5 GB |
| Tamano de pesos efectivo | 4,43 GB (frente a 13,35 GB del modelo original) |
| Modelo base | MiniMaxAI/MiniMax-Music-3 |
| Pipeline | text-to-audio |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-13 |
| Fecha de actualizacion | 2026-09-13 |

Desglose de pesos por componente:

| Componente | Original | MLQT v1.1a | Ratio |
|---|---:|---:|---:|
| DiT (diffusion transformer) | 4,58 GB (FP16) | 0,67 GB | 14,7 % |
| Text encoder y AR Qwen3 | 8,57 GB (INT8 convrot) | 3,56 GB | 41,6 % |
| VAE de audio (`dav`) | 0,20 GB | 0,20 GB (sin pérdida) | 100 % |
| Total | 13,35 GB | 4,43 GB | 66,8 % de reducción |

## Arquitectura y entrenamiento

Esta publicación no entrena ningún modelo: es un proceso de cuantización sobre pesos preexistentes de MiniMax Music 3. La decisión técnica central es el enrutado dual-block. Los tensores que contienen la ruta de audio, vocal y cross-attention se cuantizan con bloques de 32 elementos y escala independiente por bloque (BLK32), priorizando cualquier tensor cuyo nombre contenga `audio`, la familia de attention y los tensores no clasificados como caso seguro por defecto. Las matrices grandes de FFN y MLP (`ffn`, `mlp.*`, `ff.*`, `gate_/up_/down_proj`, `gate_up`) se cuantizan con bloques de 64 elementos (BLK64), más agresivos en tamaño. Los tensores sensibles (norm, bias, embed, head y `tokenizer_json`) se preservan en su dtype original sin pérdida, incluido el `tokenizer_json` en U8.

El autor sometió el empaquetado a una auditoría con herramientas de terceros, cuyos resultados se reproducen en la sección de benchmarks. Las comprobaciones cubren la deserialización de cabeceras safetensors, la aritmética de bytes del empaquetado (`codes = ceil(numel × 2 bits / 8)`, `scales = n_blocks`, sobre 149 y 161 grupos), la coherencia entre el routing declarado en los metadatos y el observado (deriva 0) y la consistencia de la deconvolución int8 frente al bf16 original en `down_proj`, con un coseno de 0,999956. No se documentan en la información disponible ni el número de tokens de entrenamiento, ni la composición del dataset, ni si hubo RLHF o DPO: esos datos pertenecen al modelo base y no se reproducen aquí.

## Capacidades

- Generación de música a partir de texto (text-to-audio) orientada a canción completa, no a fragmentos cortos.
- Generación de audio de 60 segundos verificada de extremo a extremo por el autor, con y sin partes vocales (la ruta de vocalización se enruta explícitamente a BLK32).
- Carga directa en ComfyUI mediante el nodo `MiniMax Music 3 (MLQT Direct Loader)`, que detecta el empaquetado `.mlqt_trits` y reconstruye denso en fp16 en tiempo de carga para mantener la ruta de inferencia existente.
- Conservación del VAE de audio sin pérdida, de modo que la decodificación latente-a-onda no se ve afectada por la cuantización.
- Capacidades multilingües: no disponible (el modelo base es de generación musical; la model card está redactada en coreano e inglés).
- Tool calling, function calling, agentes, razonamiento multi-paso, visión, modo thinking: no disponibles; son capacidades fuera del alcance de un modelo de generación musical.

## Casos de uso

- Generación musical local en GPU de gama media: con 4,43 GB de pesos es viable producir canciones completas en una RTX 3060 de 12 GB con el offload de baja VRAM activado, algo impracticable con los 13,35 GB del modelo original en ese mismo hardware.
- Integración en flujos de trabajo de ComfyUI: el nodo directo permite encadenar la generación musical con el resto del grafo (post-procesado de audio, mezcla, exportación) sin salir de la interfaz, aprovechando que el empaquetado se reconstruye a fp16 al cargar.
- Prototipado rápido de bandas sonoras: para equipos que necesitan iterar sobre música de acompañamiento sin depender de APIs externas ni de tarifas por petición, el modelo se ejecuta íntegramente en local bajo licencia Apache 2.0.
- Despliegue en entornos con VRAM limitada o tarjetas de generaciones anteriores: la reducción del DiT al 14,7 % libera VRAM para el text encoder y para el búfer de activaciones, lo que permite reutilizar hardware ya amortizado.
- Investigación sobre cuantización extrema: el esquema 3-trit con routing dual-block y la auditoría publicada (coseno 0,999956 en `down_proj`, deriva de routing 0) convierten este repositorio en un caso de estudio reproducible para quien investigue cuantización ternaria en transformers de difusión.
- Evaluación comparativa de calidad audio-cuantización: las métricas acústicas publicadas (0 recortes, 0,14 % de silencio, pico −7,7 dBFS, RMS −24,74 dBFS, crest 17,03 dB) sirven como línea base para medir cuánto degrada la cuantización ternaria en un pipeline generativo de audio, aunque se trata de una única muestra.
- Generación por lotes en trabajos nocturnos: dado el coste temporal medido (unos 30 minutos por canción de 60 segundos en RTX 3060), el modelo encaja en colas de proceso por lotes más que en interacción en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, y no serían aplicables a un modelo de generación musical. La información proporcionada incluye únicamente la verificación de integridad del empaquetado y métricas acústicas de una generación concreta:

| Comprobación | Resultado |
|---|---|
| Deserialización de cabecera safetensors estándar | PASS (DiT y text encoder) |
| Aritmética de bytes del empaquetado (`codes = ceil(numel × 2 bit / 8)`, `scales = n_blocks`) | PASS (149 + 161 grupos) |
| Deriva entre el routing declarado en metadatos y el medido | 0 |
| Consistencia de deconvolución int8 frente al bf16 original (`down_proj`) | Coseno 0,999956 |
| Preservación del dtype de `tokenizer_json` | PASS (U8 mantenido) |
| Generación real de audio (pista «멈춰버린 시계들», 60 s) | 0 recortes, 0,14 % de silencio, pico −7,7 dBFS, RMS −24,74 dBFS, crest 17,03 dB |

Tiempos de generación medidos (RTX 3060 12 GB, ComfyUI 0.33.0, offload de baja VRAM activado, canción de 60 segundos):

| Etapa | Tiempo |
|---|---|
| Tokens autorregresivos | ~27 min 48 s |
| DiT, 25 pasos | ~2 min 30 s |
| Decodificación VAE | no disponible en cifras concretas |
| Total | ~30 min más decodificación VAE |

El autor advierte explícitamente de que las afirmaciones públicas anteriores (por ejemplo, «10 minutos de generación») correspondían a estimaciones sobre la ruta INT8 y que a partir de esta versión solo se publican valores medidos. Con VRAM libre igual o superior a 11 GB, el autor indica que los tiempos pueden reducirse de forma notable al desactivar el offload, sin concretar la magnitud. Los scripts de reproducción citados son `verify_mlqt_v11a.py` y `run_masterpiece_mlqt_verify.py`.

## Requisitos de hardware

- VRAM estimada: no se publican estimaciones formales. Los pesos empaquetados suman 4,43 GB, a los que hay que añadir el búfer de trabajo de la reconstrucción a fp16 y la decodificación del VAE.
- Configuración verificada por el autor: RTX 3060 de 12 GB con offload de baja VRAM activado. El propio autor señala que con 11 GB o más de VRAM libre el offload puede desactivarse y los tiempos mejoran.
- GPU recomendadas (A100, H100, RTX 4090 y similares): no disponible. No hay mediciones publicadas en esas tarjetas.
- ¿Cabe en GPU de consumo? Sí en la RTX 3060 de 12 GB, según la medición del autor. Para tarjetas con menos de 12 GB de VRAM no hay datos ni confirmación de funcionamiento.
- Opciones de despliegue: ComfyUI con el nodo personalizado `ComfyUI-MiniMaxMusic3-MLQT` instalado en `custom_nodes/`, y los tres archivos colocados en `models/diffusion_models/`, `models/text_encoders/` y `models/vae/` respectivamente. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, y el formato empaquetado `.mlqt_trits` requiere el cargador específico del nodo.
- Latencia y throughput: aproximadamente 27 min 48 s de generación autorregresiva más 2 min 30 s de DiT (25 pasos) para 60 segundos de audio en RTX 3060 de 12 GB con offload. Está muy por debajo del tiempo real, por lo que no es apto para usos interactivos.

## Comparativa con modelos similares

No se dispone de datos de otros modelos de generación musical comparables en la información proporcionada. La única comparación posible es contra el modelo base del que deriva este empaquetado:

| Modelo | Peso total | Componentes | Cuantización | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| jayPark777/MiniMax-Music-3-3Trit-MLQT | 4,43 GB | DiT 0,67 GB + TE/AR Qwen3 3,56 GB + VAE 0,20 GB | Ternaria 3-trit, dual-block BLK32/BLK64, 0-skip | Apache 2.0 | HuggingFace, 0 descargas, requiere nodo de ComfyUI |
| MiniMaxAI/MiniMax-Music-3 (base) | 13,35 GB | DiT 4,58 GB (FP16) + TE/AR Qwen3 8,57 GB (INT8 convrot) + VAE 0,20 GB | FP16 en DiT, INT8 convrot en text encoder | No disponible en la información proporcionada | HuggingFace |

Otros modelos de generación musical de la misma categoría: no disponible.

## Limitaciones y advertencias

- Adopción nula verificable: 0 descargas y 0 likes desde el 13 de septiembre de 2026, sin validación independiente por parte de terceros más allá de la auditoría que cita el propio autor.
- Un único punto de medida acústica: las métricas de calidad (0 recortes, 0,14 % de silencio, −7,7 dBFS de pico) provienen de una sola generación de 60 segundos en un único idioma de prompt, por lo que no permiten generalizar sobre la calidad del modelo en otros géneros, duraciones o indicaciones.
- Rendimiento no apto para tiempo real: unos 30 minutos por cada 60 segundos de audio en la configuración medida.
- Dependencia de un nodo de ComfyUI específico: el formato `.mlqt_trits` no es un formato estándar de safetensors legible por cualquier runtime; sin `ComfyUI-MiniMaxMusic3-MLQT`, los pesos no son directamente utilizables.
- Riesgo de alucinación, sesgos o limitaciones idiomáticas: no disponible, al no haberse publicado evaluaciones de sesgo ni de comportamiento fuera de la tarea de generación musical.
- Longitud de contexto, idiomas soportados y total de parámetros: no disponibles en la información proporcionada, lo que dificulta estimar el comportamiento en prompts largos o multilingües.
- Restricciones de licencia: el repositorio declara Apache 2.0, pero el modelo base es un derivado de MiniMaxAI/MiniMax-Music-3; conviene verificar la licencia y las condiciones del modelo original antes de un uso comercial, ya que la información disponible no aclara la compatibilidad entre ambas.
- Caveat de producción: el autor reconoce que afirmaciones públicas anteriores sobre tiempos de generación eran estimaciones y no mediciones; cualquier cifra que circule fuera de esta model card debe tratarse con escepticismo.
- El repositorio incluye mención a servicios comerciales de cuantización de Axon Labs (`axonlabs.ai`, `contact@axonlabs.ai`), lo que implica un interés comercial del autor en la publicación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jayPark777/MiniMax-Music-3-3Trit-MLQT
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-Music-3
- Sitio del autor de la cuantización (Axon Labs): https://axonlabs.ai
- Contacto declarado: contact@axonlabs.ai
- Nodo de ComfyUI requerido (nombre citado en la model card, sin URL publicada): `ComfyUI-MiniMaxMusic3-MLQT`
- Scripts de reproducción citados (nombres en la model card, sin URL publicada): `verify_mlqt_v11a.py`, `run_masterpiece_mlqt_verify.py`
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a material educativo en árabe sin relación con esta ficha.
