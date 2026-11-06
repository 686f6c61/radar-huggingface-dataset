# RainyBot/SemWAM-RoboTwin-TwoStage-v1.30-Stage1-World15k

## Resumen

SemWAM-RoboTwin-TwoStage-v1.30-Stage1-World15k es un checkpoint de investigación publicado por el usuario RainyBot en HuggingFace, orientado a robótica y más concretamente al entorno de simulación RoboTwin. El nombre del repositorio indica una configuración de entrenamiento en dos etapas (two-stage), y el checkpoint corresponde a la primera etapa (Stage1) tras 15.000 pasos de optimizador. El modelo combina un generador de vídeo/acción de tipo DiT (Diffusion Transformer) con cabezas auxiliares de profundidad y semántica, bajo la etiqueta "SemWAM" (probablemente Semantic World-Action Model).

La arquitectura declarada en la model card es un modelo de difusión condicionado por acción con tres corrientes visuales (RGB, profundidad y semántica) que se atienden mutuamente mediante una máscara causal específica, más un Action DiT independiente para generar trayectorias de acción de 14 dimensiones. El bloque de vídeo usa 30 capas con `hidden_dim` 3072 y FFN de 14336, e incluye un MoE parcial (4 expertos en las capas 21, 24 y 27) con `top_k` 0 y experto compartido, lo que en la práctica equivale a un enrutamiento denso con máscara por modalidad.

La relevancia de este checkpoint es acotada: se trata de un artefacto de investigación sin model card descriptiva, sin licencia declarada, sin benchmarks publicados y sin idiomas especificados, con 0 descargas y 0 "likes" en el momento de la consulta. Su interés principal reside en la documentación interna del contrato de arquitectura (identidad del modelo, configuración de atención, MoE y pérdidas), que resulta útil para quien quiera reproducir o auditar el pipeline de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) con corrientes RGB, profundidad y semántica; Action DiT independiente; MoE parcial en capas 21, 24 y 27 del bloque de vídeo |
| Parametros totales | no disponible |
| Parametros activos | no disponible (MoE con 4 expertos y `top_k` 0 más experto compartido; enrutamiento efectivo denso enmascarado) |
| Longitud de contexto | no disponible (condicionamiento temporal por frame actual; máscara `first_frame_causal` en el bloque de vídeo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (librería declarada: pytorch; tamaño del repo: 14,6 GB) |

## Arquitectura y entrenamiento

El modelo se compone de dos torres de difusión. La torre de "vídeo" (`video_dit_config`) tiene `in_dim`/`out_dim` de 48 canales, `text_dim` 4096, `freq_dim` 256, `patch_size` [1, 2, 2], 30 capas, `hidden_dim` 3072, 24 cabezas con dimensión de cabeza 128 y FFN de 14336. No usa entrada de imagen (`has_image_input: false`) ni embeddings CLIP/VAE separados (`require_clip_embedding: false`, `fuse_vae_embedding_in_latents: true`). La torre de acción (`action_dit_config`) es más pequeña: 30 capas, `hidden_dim` 1024, FFN 4096, 24 cabezas, dimensión de acción 14. Ambas usan un scheduler de difusión con 1000 pasos de entrenamiento y `shift` 5,0 en entrenamiento e inferencia.

La pérdida combina cuatro términos con peso 1,0 cada uno: vídeo, acción, semántica y profundidad. La corriente semántica se parametriza con `v_pred`, comprime a 48 canales mediante un SVAE con normalización LayerNorm y usa como backbone un DINOv3 ViT-B/16 con pooling temporal de media. La profundidad se representa con un DVAE y se condiciona sobre el frame actual, con una proyección independiente respecto a la semántica. El MoE, aunque declarado `enabled: true`, tiene `top_k: 0`, lo que implica que todos los tokens van al experto compartido y los expertos enrutados quedan enmascarados; la pérdida auxiliar tiene peso 0,01 con calentamiento de 750 pasos de optimizador. La atención entre corrientes sigue una guía explícita: RGB lee profundidad y semántica en claves actuales, profundidad y semántica se leen mutuamente incluyendo claves futuras, y la acción lee profundidad y semántica (esta última solo en las posiciones de cabeza, el tercio superior de la rejilla de tokens T). El mundo no lee la acción ruidosa (`world_action_visibility: none`).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicó RLHF/DPO. La model card solo indica el paso de optimizador publicado (15.000), una instantánea de evidencia con fecha UTC y que "todos los lanzadores de nodo originales reportan finalización". Las cámaras simuladas se configuran con FOV vertical de 37° a 480x640 (vistas high/left/right), 45° a 224x224 (imagen) y 75° a 224x224 (wrist), con `max_depth_m` 2,0 y cotas de pointmap x∈[-0,6; 0,6], y∈[-0,6; 0,6], z∈[0,0; 1,5].

## Capacidades

- Generación de trayectorias de acción de 14 dimensiones condicionadas por observación visual, mediante un Action DiT con scheduler de difusión propio.
- Modelado de mundo visual: predice fotogramas RGB junto con profundidad y representaciones semánticas comprimidas.
- Condicionamiento multimodal interno: las corrientes RGB, profundidad y semántica se atienden entre sí según una máscara causal documentada.
- Representación semántica basada en DINOv3 ViT-B/16 con compresión SVAE a 48 canales y parametrización de velocidad (`v_pred`).
- Representación de profundidad mediante DVAE con proyección independiente y pointmap normalizado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se especifican idiomas).
- Modo "thinking", visión general, audio: no disponibles; la única modalidad documentada es la robótica visual simulada en RoboTwin.

## Casos de uso

- Investigación en imitation learning sobre RoboTwin: el checkpoint sirve como punto de partida o referencia para reproducir el pipeline de dos etapas descrito en el nombre del repositorio, entrenando políticas visuomotoras en simulación antes de un posible transfer.
- Evaluación de políticas visuomotoras con acción de 14 dimensiones: útil para experimentos que necesiten un generador de acciones condicionado por RGB, profundidad y semántica en un entorno simulado con cámaras calibradas (FOV 37°/45°/75°).
- Modelado de mundo para planificación en simulación: la predicción conjunta de RGB, profundidad y semántica permite entrenar o auditar world models que se usen como simuladores internos para evaluar planes antes de ejecutarlos.
- Estudio de arquitecturas MoE en difusión: el bloque con 4 expertos, `top_k` 0 y experto compartido en las capas 21, 24 y 27 es un caso concreto para analizar enrutamiento denso enmascarado y pérdidas auxiliares con calentamiento.
- Estudio de atención causal entre modalidades: la guía de lectura (quién lee qué claves y con qué alcance espacial) permite experimentos controlados sobre fusión cross-modal en DiT.
- Auditoría de reproducibilidad de checkpoints: la model card documenta identidad del modelo, contrato guardado y configuración archivada, lo que facilita verificar que un checkpoint coincide con la receta declarada.
- Base para ablaciones de pérdidas: los pesos de pérdida (vídeo, acción, semántica, profundidad, todos a 1,0) permiten diseñar barridos para medir la contribución de cada cabeza auxiliar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio es de 14,6 GB, lo que da una cota inferior orientativa del peso de los checkpoints, pero no se documenta el número de parámetros ni el consumo en inferencia.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; sin datos de parámetros totales ni de cuantizaciones soportadas no puede confirmarse que quepa en una RTX 4090 u otras tarjetas consumer.
- Opciones de despliegue: no disponible. La librería declarada es PyTorch; no se mencionan vLLM, llama.cpp, Ollama ni TGI, y ninguno de ellos es aplicable directamente a un modelo de difusión robótica de este tipo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SemWAM-RoboTwin-TwoStage-v1.30-Stage1-World15k | no disponible | no disponible | sin benchmarks publicados | no disponible | HuggingFace, 0 descargas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (políticas visuomotoras o world-action models para RoboTwin) en la documentación proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Ausencia de licencia: no se declara licencia, lo que impide determinar si el uso comercial está permitido; en la práctica debe tratarse como no autorizado para producción hasta aclaración del autor.
- Ausencia de model card descriptiva: no hay descripción de datos de entrenamiento, número de tokens, composición del dataset ni procedimiento de alineación (RLHF/DPO), lo que dificulta evaluar sesgos y generalización.
- Sin benchmarks: no hay métricas publicadas de éxito en tareas, lo que impide comparar su rendimiento con otras políticas.
- Riesgo de alucinación y deriva en simulación: al ser un modelo generativo de mundo, las predicciones visuales pueden divergir de la física real del simulador; no hay evaluación documentada de consistencia.
- Especificidad de dominio: el modelo está configurado para RoboTwin con cámaras y FOV concretos (37°, 45°, 75°) y acción de 14 dimensiones; su uso fuera de esa configuración no está validado.
- MoE efectivamente denso: con `top_k` 0 y experto compartido, los 4 expertos declarados no aportan capacidad de enrutamiento real, por lo que el etiquetado "MoE" puede inducir a error sobre el coste computacional.
- Estado de publicación: 0 descargas y 0 "likes", creado y actualizado en noviembre de 2026, sin evidencia de validación por terceros; tratarlo como checkpoint de investigación no revisado.
- Idiomas no especificados: no hay garantía de comportamiento multilingüe ni de soporte de instrucciones en lenguaje natural más allá del `text_dim` 4096 declarado.
- Sin datos de cuantización ni de formatos alternativos: no se conocen opciones para reducir el consumo de memoria en despliegue.

## Enlaces

- HuggingFace: https://huggingface.co/RainyBot/SemWAM-RoboTwin-TwoStage-v1.30-Stage1-World15k
- Paper: no disponible
- Blog del autor: no disponible
- Repositorio de código: no disponible
- Demo: no disponible
