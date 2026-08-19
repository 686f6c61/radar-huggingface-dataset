# DotCheck/muybridge-video-v2

## Resumen

Muybridge es un detector de vídeo generado por inteligencia artificial desarrollado por DotCheck, una empresa especializada en autenticación de medios sintéticos. El modelo, identificado como `inhouse-video@2`, se publica bajo licencia Apache-2.0 y está diseñado para clasificar clips de vídeo cortos como reales o generados por IA. Su nombre rinde homenaje a Eadweard Muybridge, pionero de la cronofotografía, y no responde a un eslogan comercial.

Técnicamente, Muybridge no es un transformer espaciotemporal, sino un adaptador lineal entrenado sobre el backbone congelado `google/siglip2-base-patch16-224`. El proceso consiste en muestrear tres fotogramas del vídeo según marcas temporales VS1, pasarlos por SigLIP2 para obtener embeddings y aplicar una cabeza lineal que produce una probabilidad `p ∈ [0,1]` por fotograma. La puntuación final del clip se obtiene agregando las probabilidades de los fotogramas con el percentil 90 (bag p90). Este enfoque ligero permite la inferencia en CPU y es relevante en un momento en que los generadores de vídeo como Wan2.2 o CogVideoX hacen cada vez más difícil distinguir contenido sintético del real.

El repositorio contiene únicamente el head lineal en formato `.npz`, el backbone se carga desde HuggingFace. La model card incluye métricas de evaluación sobre un conjunto de retención de vídeos generados con Wan2.2, con una precisión balanceada del 98,5% en la agregación por bolsas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SigLIP2-base (backbone congelado) + head lineal de vídeo |
| Parametros totales | no disponible (el head es un `.npz` sin desglose; el backbone SigLIP2-base tiene ~86M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (clasificacion de imagenes, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.npz` para el head; backbone en safetensors desde `google/siglip2-base-patch16-224` |

## Arquitectura y entrenamiento

Muybridge se compone de un backbone SigLIP2-base congelado (un modelo de vision-language de Google, licencia Apache-2.0) y una cabeza lineal entrenada específicamente para vídeo. El flujo de inferencia es el siguiente: se muestrean tres fotogramas del contenedor de vídeo según timestamps VS1, cada fotograma se redimensiona a 224×224, se pasa por SigLIP2 para obtener embeddings, y la cabeza lineal produce una probabilidad de ser generado por IA. La puntuación final del clip se calcula como el percentil 90 de las probabilidades de los fotogramas individuales (bag p90).

El entrenamiento utilizó datos de vídeo sintético generados con CogVideoX-2b y Wan2.1 (ambos Apache-2.0) para el conjunto de ajuste, mientras que el conjunto de retención (holdout) se compuso exclusivamente de vídeos generados con Wan2.2-TI2V-5B Diffusers. Los datos reales provienen de vídeos de Commons con codificación ffmpeg, complementados con un 20% de superficies de imágenes fijas (still mix). No se menciona el uso de RLHF o DPO; el entrenamiento es supervisado con etiquetas binarias. La innovación principal reside en la agregación por percentil 90, que reduce la influencia de fotogramas atípicos y mejora la robustez frente a compresión o codecs.

## Capacidades

- Detección binaria de vídeo generado por IA: clasifica clips cortos como reales o sintéticos con una probabilidad en `[0,1]`.
- Procesamiento por fotogramas: analiza tres frames por clip, lo que permite manejar vídeos de duración variable sin necesidad de un modelo temporal completo.
- Agregación robusta con bag p90: la puntuación final es el percentil 90 de las probabilidades de los frames, lo que minimiza el impacto de frames atípicos.
- Integración con audio (opcional): aunque este artefacto solo procesa vídeo, el producto de DotCheck combina la puntuación de Muybridge con la de Helmholtz (detector de audio) mediante una ruta privada denominada Covenant.
- Inferencia ligera: al ser un head lineal sobre un backbone congelado, puede ejecutarse en CPU con recursos mínimos.
- API REST: se sirve mediante FastAPI con perfil `video`, y el servidor devuelve un error 503 si falta el head de vídeo (no hay fallback al head de imagen).

## Casos de uso

- Moderación de contenido en plataformas sociales: las plataformas pueden integrar Muybridge en su pipeline de moderación para detectar vídeos sintéticos generados por IA antes de su publicación, reduciendo la propagación de deepfakes.
- Verificación de medios en agencias de noticias: los periodistas pueden comprobar rápidamente si un vídeo recibido de fuentes no verificadas es auténtico, usando la API de DotCheck o el head local.
- Auditoría de anuncios publicitarios: las marcas pueden validar que los vídeos promocionales no contengan contenido generado por IA no declarado, especialmente en sectores regulados como farmacia o finanzas.
- Investigación forense: los analistas pueden usar la puntuación bag p90 como evidencia indiciaria en casos de fraude o desinformación, aunque la model card advierte que no es para determinaciones legales.
- Control de calidad en generación de contenido: los estudios que producen vídeo sintético pueden usar Muybridge para verificar que sus propios generadores (Wan2.2, CogVideoX) produzcan resultados indistinguibles de lo real, midiendo la tasa de falsos positivos.
- Filtrado en pipelines de datos: los equipos de ML pueden usar el detector para limpiar datasets de vídeo, eliminando clips generados por IA que podrían sesgar modelos entrenados con datos reales.
- Monitorización de campañas electorales: las organizaciones pueden detectar vídeos manipulados que circulen durante procesos electorales, integrando la API en sistemas de alerta temprana.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Target | Medido |
|---|---|---|
| mean P(AI) \| real (bag p90) | ≤ 0.12 | 0.004 |
| mean P(AI) \| AI (bag p90) | ≥ 0.85 | 0.940 |
| Balanced accuracy (bag p90) | ≥ 0.90 | 0.985 |
| Balanced accuracy vs `@1` (mismos bags) | ≥ 0.716 | 0.985 |

Métricas secundarias por fotograma individual (no el titular público):

| Metrica | Target | Medido |
|---|---|---|
| mean P(AI) \| real | ≤ 0.15 | 0.004 |
| mean P(AI) \| AI | ≥ 0.80 | 0.906 |
| Separacion | ≥ 0.45 | 0.902 |
| Balanced accuracy | ≥ 0.88 | 0.955 |

## Requisitos de hardware

- El backbone SigLIP2-base tiene aproximadamente 86 millones de parámetros; la inferencia es factible en CPU con ~2-4 GB de RAM, como indica la model card ("CPU FastAPI image path").
- En GPU, la VRAM necesaria es inferior a 1 GB para el head lineal más el backbone, por lo que cualquier GPU moderna (incluso integradas) es suficiente.
- No se proporcionan datos de latencia o throughput, pero al procesar solo 3 frames por clip, el tiempo de inferencia es del orden de decenas de milisegundos en GPU y de cientos de milisegundos en CPU.
- Opciones de despliegue: la model card menciona un servidor FastAPI con perfil `video`; también se puede cargar el `.npz` directamente en Python para integraciones personalizadas.
- El repositorio no incluye el backbone, por lo que es necesario descargarlo por separado desde HuggingFace.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La model card solo compara la versión `@2` con la anterior `@1` del mismo modelo (balanced accuracy 0.985 vs 0.716). No se mencionan alternativas de otros proveedores.

## Limitaciones y advertencias

- La agregación es un percentil 90 no ordenado de las puntuaciones de los frames; no existe un modelo de movimiento explícito, por lo que vídeos con movimiento rápido o transiciones bruscas podrían degradar el rendimiento.
- Codecs, compresión y generadores no vistos durante el entrenamiento pueden desplazar las puntuaciones; el modelo fue evaluado solo con Wan2.2 en el holdout.
- Los clips silenciosos se procesan únicamente con vídeo; cuando hay banda sonora, la fusión con audio (Helmholtz) es una ruta privada del producto y no está disponible en este artefacto.
- La licencia Apache-2.0 cubre el head lineal, pero el backbone SigLIP2-base tiene su propia licencia (también Apache-2.0 según la model card). Verificar el `NOTICE` del repositorio.
- No se debe utilizar para determinaciones legales; la model card lo excluye explícitamente del ámbito de uso previsto.
- El repositorio no contiene el modelo completo en formato `AutoModel.from_pretrained`; solo el `.npz` del head, lo que requiere una integración manual con el backbone.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/DotCheck/muybridge-video-v2
- Modelo base: https://huggingface.co/google/siglip2-base-patch16-224
- Documentación de DotCheck: https://dotcheck.ai/docs
- API de producto: https://dotcheck.ai/check y https://dotcheck.ai/api
- Detector de audio Helmholtz: https://huggingface.co/DotCheck/helmholtz-audio-v3
