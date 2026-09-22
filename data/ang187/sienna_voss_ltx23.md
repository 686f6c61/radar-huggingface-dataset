# ang187/sienna_voss_ltx23

## Resumen

sienna_voss_ltx23 es un adaptador LoRA de personaje publicado por el usuario ang187 en Hugging Face. No es un modelo completo, sino un conjunto de pesos de bajo rango (rank 32, alpha 32) que se aplica sobre el modelo de generación de vídeo LTX-2.3 de 22 000 millones de parámetros desarrollado por Lightricks. Su función es reproducir de forma consistente la identidad de un personaje concreto, activado mediante la frase disparadora `Sienna Voss`, en tareas de texto a vídeo.

El adaptador se entrenó con el entrenador LTX-2 de Lightricks siguiendo la misma receta que otro LoRA de personaje citado en la model card (Hina-LTX). Los módulos objetivo son las proyecciones de atención `to_k`, `to_q`, `to_v` y `to_out.0`. El entrenamiento se realizó en precisión bf16 con gradient checkpointing, learning rate 1e-4 y 1500 pasos sobre un conjunto de 25 imágenes fijas con leyendas, sin componente de audio. El repositorio ocupa 2,7 GB e incluye el checkpoint final (`lora_weights_step_01500.safetensors`), pasos intermedios entre 250 y 1250, el dataset, renders de validación y el archivo `config.yaml` con la configuración de entrenamiento.

Su relevancia es acotada pero clara para el nicho de generación de vídeo con personajes consistentes: los LoRA de identidad son la vía estándar para fijar un rostro o una apariencia en modelos de difusión de vídeo sin reentrenar el modelo base. Ahora bien, el repositorio no declara licencia, idiomas, pipeline ni métricas, y acumula cero descargas y cero likes, por lo que debe considerarse material sin validación externa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un transformer de difusión de vídeo; modelo base LTX-2.3 22B |
| Parámetros totales | No disponible para el adaptador; el modelo base declara 22 000 millones de parámetros |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible para el adaptador (entrenado en bf16); el codificador de texto asociado es `gemma-3-12b-it-qat-q4_0-unquantized` |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Rango y alpha de LoRA | 32 / 32 |
| Módulos objetivo | `to_k`, `to_q`, `to_v`, `to_out.0` |
| Palabra disparadora | `Sienna Voss` |
| Modelo base | `ltx-2.3-22b-dev` + `gemma-3-12b-it-qat-q4_0-unquantized` |
| Pasos de entrenamiento | 1500 (checkpoints intermedios 250-1250 incluidos) |
| Tamaño del repositorio | 2,7 GB |
| Dataset de entrenamiento | 25 imágenes fijas con leyendas |

## Arquitectura y entrenamiento

El adaptador modifica únicamente las proyecciones lineales de atención (`to_k`, `to_q`, `to_v`, `to_out.0`) del transformer de difusión LTX-2.3 22B, dejando congelados el resto de pesos del modelo base. Con rank y alpha iguales a 32, la capacidad añadida es moderada y está orientada a inyectar una identidad visual concreta más que a alterar el comportamiento general del generador. La modalidad declarada es `text_to_video` sobre imágenes fijas, es decir, generación de vídeo a partir de texto e imagen de referencia, sin rama de audio.

El entrenamiento se ejecutó con el entrenador LTX-2 de Lightricks, en bf16, con gradient checkpointing y learning rate 1e-4 durante 1500 pasos. El conjunto de datos son 25 imágenes fijas con leyendas, lo que constituye un corpus muy reducido y de variedad limitada. La model card no documenta composición del dataset más allá de esa cifra, ni indica fases de RLHF, DPO o ajuste por preferencias, ni innovaciones técnicas adicionales (atención lineal, decodificación especulativa u otras).

## Capacidades

- Generación de vídeo a partir de texto con una identidad de personaje fija, activada por la frase `Sienna Voss`.
- Transferencia de identidad sobre imágenes fijas de entrada (modalidad `text_to_video` sobre stills).
- Mantenimiento de coherencia de personaje entre planos dentro de la misma generación, que es el objetivo declarado de un LoRA de personaje.
- Almacenamiento de checkpoints intermedios (pasos 250 a 1250), lo que permite ajustar la intensidad del efecto del LoRA o comparar estados de entrenamiento.
- Inclusión del dataset, de renders de validación y de la configuración de entrenamiento, lo que facilita reproducir o reentrenar el adaptador.
- No se documenta soporte de tool calling, function calling, uso como agente, razonamiento multi-paso, ni capacidades de audio, visión general o modo de pensamiento. Al ser un adaptador de difusión de vídeo, estas capacidades de los modelos de lenguaje no aplican.
- No se documentan capacidades multilingües específicas; el comportamiento lingüístico depende del codificador de texto `gemma-3-12b-it-qat-q4_0-unquantized` asociado al modelo base.

## Casos de uso

- Producción de cortometrajes con personaje recurrente: el LoRA permite mantener la misma identidad de `Sienna Voss` a lo largo de varios planos generados por separado, lo que evita la deriva de rostro típica cuando se encadenan generaciones sin adaptador.
- Generación de contenido para redes sociales: creación rápida de clips verticales protagonizados por un personaje estable, usando la palabra disparadora en cada prompt para garantizar continuidad entre publicaciones.
- Previsualización y storyboard animado: convertir guiones en animáticas con un personaje coherente antes de rodar, aprovechando la modalidad texto a vídeo sobre imágenes fijas para fijar encuadres de referencia.
- Cinemáticas y prototipos para videojuegos: generar secuencias de presentación de un personaje antes de comprometer recursos de modelado o captura de movimiento.
- Publicidad con personaje de marca: construir spots y variaciones de anuncio alrededor de un mismo rostro sin necesidad de rodaje adicional ni de cesión de derechos de imagen de una persona real.
- Investigación sobre consistencia de identidad en LoRA de vídeo: dado que el repositorio incluye dataset, `config.yaml` y renders de validación, sirve como caso reproducible para estudiar cómo influyen rank, pasos y número de imágenes en la fidelidad del personaje.
- Ampliación o comparación de pipelines de entrenamiento de personaje: los checkpoints intermedios permiten analizar la evolución de la identidad a lo largo del entrenamiento y calibrar cuántos pasos son suficientes con un dataset de 25 imágenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (FVD, CLIP score, similitud de identidad, FID ni ninguna otra), y los resultados de búsqueda web no aportan datos evaluación sobre este adaptador.

## Requisitos de hardware

Las cifras de esta sección son estimaciones derivadas del número de parámetros del modelo base, no datos publicados por el autor. El adaptador LoRA en sí apenas añade coste de memoria; el grueso corresponde a LTX-2.3 22B y al codificador de texto Gemma-3 12B.

- VRAM estimada para el modelo base en bf16: en torno a 44 GB solo para los pesos de LTX-2.3 22B, más el codificador de texto y el VAE. Requiere GPU de 80 GB o sharding en varias GPU.
- VRAM estimada en fp8: aproximadamente 22 GB para los pesos del difusor, más codificador de texto y VAE; ajustable en una H100 80 GB o en varias GPU de 48 GB.
- VRAM estimada en cuantización de 4 bits: del orden de 11-12 GB para el difusor, más unos 7-8 GB del codificador Gemma-3 12B cuantizado a q4_0, más VAE y activaciones.
- GPU recomendadas: H100 80 GB y A100 80 GB para bf16 sin compromisos; A100 40 GB, L40S o RTX 6000 Ada con fp8 y offloading; RTX 4090 24 GB y RTX 5090 32 GB solo con cuantización agresiva y descarga parcial de módulos a CPU.
- Viabilidad en GPU de consumo: posible en RTX 4090/5090 con cuantización de 4-8 bits y gestión cuidadosa de la memoria de activaciones, que crece con resolución y número de fotogramas. En GPUs de 12-16 GB no es realista para el modelo completo.
- Opciones de despliegue: al tratarse de un modelo de difusión de vídeo, las vías habituales son ComfyUI y los pipelines de Diffusers con el entrenador/inferencia de LTX-2 de Lightricks. vLLM, llama.cpp, Ollama y TGI no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles. No hay datos publicados de tiempo por clip, fotogramas por segundo ni escalado con resolución.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad | Datos de rendimiento |
|---|---|---|---|---|---|---|
| sienna_voss_ltx23 | LoRA de personaje sobre LTX-2.3 22B | No disponible para el adaptador; base de 22 000 M | No disponible | No disponible | Hugging Face, 0 descargas, 0 likes | No disponibles |
| LTX-2.3 22B (`ltx-2.3-22b-dev`) | Modelo base de difusión de vídeo texto a vídeo | 22 000 M | No disponible | No disponible en la información proporcionada (consultar términos de Lightricks) | Modelo base referenciado por este LoRA | No disponibles en esta ficha |
| Hina-LTX (LoRA de personaje citado en la model card) | LoRA de personaje entrenado con la misma receta | No disponible | No disponible | No disponible | No verificada en la información proporcionada | No disponibles |

No se dispone de datos cuantitativos que permitan una comparación de rendimiento entre estas opciones. La comparación relevante es cualitativa: este adaptador es un añadido de identidad sobre LTX-2.3, no una alternativa al modelo base, y su calidad depende por completo de la del modelo sobre el que se aplica.

## Limitaciones y advertencias

- Licencia no declarada. No se especifica ningún término de uso, por lo que no puede confirmarse que el uso comercial esté permitido. Además, el adaptador hereda las condiciones del modelo base `ltx-2.3-22b-dev`, que deben consultarse por separado.
- Dataset de solo 25 imágenes. Es un volumen muy bajo, con alto riesgo de sobreajuste de la identidad a las condiciones concretas del conjunto (iluminación, pose, encuadre, vestuario), lo que puede degradar la variedad de resultados.
- Sesgo de identidad. Al estar entrenado para fijar un personaje concreto, el modelo tenderá a reproducir sus rasgos incluso cuando el prompt pida otra apariencia, y puede arrastrar sesgos demográficos y estéticos presentes en las 25 imágenes de entrenamiento.
- Riesgo de alucinación visual y artefactos. Como cualquier adaptador de difusión de vídeo, puede producir inconsistencias anatómicas, parpadeo temporal y deformaciones, especialmente con movimientos amplios de cámara o encuadres alejados de los del dataset.
- Sin audio. La model card indica explícitamente que el entrenamiento fue texto a vídeo sin audio; no cabe esperar generación sonora.
- Longitud de contexto y resolución no documentadas. Se desconoce cuántos fotogramas o qué resoluciones soporta el adaptador en la práctica.
- Idiomas no declarados. No hay información sobre el comportamiento del adaptador con prompts en castellano u otros idiomas; el codificador de texto asociado es Gemma-3 12B.
- Ausencia total de validación externa. El repositorio registra 0 descargas y 0 likes, y no incluye métricas ni comparaciones. Los únicos renders disponibles son los de validación del propio autor, lo que no constituye una evaluación independiente.
- Metadatos poco fiables. La fecha de creación indicada en el repositorio (2026-09-21) es posterior a la fecha actual, lo que sugiere un problema de procedencia o de metadatos que conviene verificar antes de integrar el adaptador en un flujo de producción.
- Requisito de palabra disparadora. El personaje solo se activa de forma fiable si se incluye `Sienna Voss` en el prompt; su omisión puede degradar o anular el efecto del LoRA.
- No apto como modelo de lenguaje. No ofrece tool calling, agentes, razonamiento multi-paso ni ninguna capacidad conversacional; cualquier uso en ese sentido es un error de categoría.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/ang187/sienna_voss_ltx23
- Modelo base referenciado en la model card: `ltx-2.3-22b-dev` (Lightricks)
- Codificador de texto referenciado: `gemma-3-12b-it-qat-q4_0-unquantized`
- Entrenador referenciado: LTX-2 de Lightricks (no se proporciona URL específica en la información disponible)
- LoRA de referencia citado en la model card: Hina-LTX (no se proporciona URL específica en la información disponible)
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo. Las páginas devueltas corresponden al catálogo de cámaras compactas de Sony (sony.co.uk) y no guardan relación con este adaptador.
