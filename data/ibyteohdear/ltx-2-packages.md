# ibyteohdear/ltx-2-packages

## Resumen

LTX-2.3 es un modelo fundacional de difusión para generación conjunta de vídeo y audio, desarrollado por Lightricks como actualización significativa de LTX-2. Se trata de un modelo basado en Diffusion Transformer (DiT) que genera vídeo y audio sincronizados dentro de un único modelo, con pesos abiertos y orientación explícita a la ejecución local. La versión 2.3 mejora la calidad audiovisual y la adherencia al prompt respecto a LTX-2, y se distribuye en varios checkpoints: completo (22B, entrenable en bf16), destilado (8 pasos, CFG=1), una variante destilada 1.1 con estética distinta y mejor audio, LoRAs aplicables al modelo completo, y upscalers espaciales y temporales para pipelines multietapa.

El modelo cubre un espectro amplio de tareas: text-to-video, image-to-video, video-to-video, image-text-to-video, audio-to-video, text-to-audio, video-to-audio, audio-to-audio y combinaciones audio-vídeo (text-audio-video, image-audio-video, image-text-audio-video). El pipeline declarado en Hugging Face es image-to-video. Está pensado para generación de contenido audiovisual en producción y para investigación sobre modelos generativos multimodales, con soporte para ajuste fino mediante el paquete `ltx-trainer`.

La relevancia actual reside en que unifica generación de vídeo y audio en un solo modelo de pesos abiertos, algo poco habitual en el ecosistema open source, y en que ofrece una ruta de ejecución local documentada (ComfyUI, PyTorch, Diffusers próximamente). La licencia es la LTX-2 Community License Agreement, no una licencia permisiva estándar, lo que condiciona el uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) para audio-vídeo conjunto |
| Parámetros totales | 22B (checkpoint `ltx-2.3-22b-dev`); el resto de checkpoints son derivados (destilados, LoRA, upscalers) |
| Parámetros activos | no disponible (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (se menciona entrenamiento/inferencia en bf16 para el modelo completo) |
| Idiomas soportados | en, de, es, fr, ja, ko, zh, it, pt (según metadatos); la model card indica English como idioma principal |
| Licencia | ltx-2-community-license-agreement (license: other) |
| Formato de pesos | no disponible (integración vía Diffusers y codebase PyTorch; no se especifica safetensors/GGUF) |

## Arquitectura y entrenamiento

LTX-2.3 es un modelo de difusión basado en Diffusion Transformer (DiT) diseñado para generar vídeo y audio sincronizados en un único modelo. La familia incluye el checkpoint completo de 22B parámetros, entrenable en bf16, y versiones destiladas de 8 pasos con CFG=1, además de LoRAs (rango 384) aplicables al modelo completo y upscalers espaciales (x2 y x1.5) y temporal (x2) que operan sobre los latentes de LTX-2.3 en pipelines multietapa para aumentar resolución o FPS. El paper de referencia es "LTX-2: Efficient Joint Audio-Visual Foundation Model" (arXiv:2601.03233).

No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO. La model card sí indica que el modelo base (dev) es totalmente entrenable y que reproducir los LoRAs e IC-LoRAs publicados es sencillo mediante el paquete `ltx-trainer`, con entrenamientos de movimiento, estilo o likeness (sonido + apariencia) que en muchos casos tardan menos de una hora. El codebase está probado con Python >= 3.12, CUDA > 12.7 y PyTorch ~= 2.7.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video).
- Generación de vídeo a partir de imagen (image-to-video), pipeline declarado.
- Transformación de vídeo existente (video-to-video).
- Generación condicionada por imagen y texto simultáneamente (image-text-to-video).
- Generación de vídeo condicionada por audio (audio-to-video).
- Generación de audio a partir de texto (text-to-audio).
- Extracción o generación de audio a partir de vídeo (video-to-audio).
- Transformación de audio (audio-to-audio).
- Generación conjunta y sincronizada de audio y vídeo (text-audio-video, image-audio-video, image-text-audio-video).
- Aumento de resolución espacial mediante upscalers x2 y x1.5 sobre latentes.
- Aumento de tasa de frames mediante upscaler temporal x2.
- Ajuste fino y entrenamiento de LoRAs e IC-LoRAs (estilo, movimiento, likeness).
- Soporte multilingüe declarado en metadatos para nueve idiomas, aunque la model card especifica inglés como idioma del modelo.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso tipo agente.

## Casos de uso

- Producción de vídeo publicitario con audio sincronizado: el modelo genera en una sola pasada vídeo y banda sonora coherentes, lo que elimina el paso de alinear audio y vídeo por separado en anuncios cortos y piezas para redes sociales.
- Doblaje y localización audiovisual: mediante video-to-audio y audio-to-audio se puede regenerar la pista de audio de un clip existente, útil para adaptar locuciones o efectos a distintos mercados.
- Previsualización rápida de storyboards: a partir de una imagen clave (image-to-video) se generan animaciones de pocos segundos para validar encuadres y ritmo antes de producir con herramientas tradicionales.
- Generación de clips para videojuegos y entornos interactivos: text-to-video e image-to-video permiten crear material de fondo o cinemáticas provisionales sin pipeline de render dedicado.
- Aumento de resolución y fluidez de material generado: los upscalers espaciales x2/x1.5 y el temporal x2 permiten escalar salidas de baja resolución o bajo FPS en pipelines multietapa, útil para entregables finales.
- Investigación en modelos generativos audiovisuales: el checkpoint completo de 22B en bf16 es entrenable y el `ltx-trainer` permite reproducir LoRAs en menos de una hora en muchos ajustes, lo que facilita experimentos de adaptación de estilo o de identidad (likeness).
- Creación de contenido accesible: generación de pistas de audio descriptivas o efectos a partir de vídeo mediante video-to-audio para complementar material visual.
- Prototipado en ComfyUI: los nodos integrados de LTXVideo permiten a estudios pequeños montar flujos de generación audiovisual sin escribir código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia orientativa, un modelo DiT de 22B parámetros en bf16 requiere del orden de 44 GB solo para pesos, a lo que hay que sumar activaciones y latentes de vídeo/audio; no se confirma esta cifra en la documentación proporcionada.
- GPU recomendadas: no disponible. El codebase exige CUDA > 12.7 y PyTorch ~= 2.7, lo que implica GPU NVIDIA relativamente recientes.
- ¿Cabe en GPU de consumo? No confirmado. El checkpoint completo de 22B en bf16 excede la VRAM de las GPU de consumo habituales; las versiones destiladas de 8 pasos reducen el coste de inferencia (menos pasos, CFG=1) pero no se documenta su huella de memoria.
- Opciones de despliegue: ComfyUI mediante los nodos integrados de LTXVideo (recomendado por el autor); codebase PyTorch oficial con los paquetes `ltx-core`, `ltx-pipelines` y `ltx-trainer`; soporte en Diffusers anunciado como "coming soon"; API Playground en la nube (console.ltx.video) y demo en app.ltx.studio.
- Latencia y throughput: no disponible. Solo se indica que la variante destilada funciona en 8 pasos con CFG=1, lo que reduce el número de evaluaciones del modelo frente al completo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / duración | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LTX-2.3 (Lightricks) | 22B (dev) | no disponible | Vídeo + audio conjuntos, imagen, texto | LTX-2 Community License | Pesos abiertos en HF, ComfyUI, PyTorch, API |
| LTX-2 (Lightricks) | no disponible | no disponible | Vídeo + audio conjuntos | no disponible en la información | Pesos abiertos en HF |
| Otros modelos de vídeo open source | no disponible | no disponible | Principalmente vídeo; audio no integrado en el mismo modelo | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos competidores que permitan una comparación cuantitativa rigurosa. La comparación cualitativa más sólida es con LTX-2, del que LTX-2.3 es una actualización con mejor calidad audiovisual y adherencia al prompt.

## Limitaciones y advertencias

- El modelo no está diseñado ni es capaz de proporcionar información factual; no debe usarse como fuente de hechos.
- Como modelo estadístico, puede amplificar sesgos sociales existentes en los datos de entrenamiento.
- Puede fallar en generar vídeos que coincidan exactamente con el prompt; el seguimiento de instrucciones depende en gran medida del estilo de prompting empleado.
- Puede generar contenido inapropiado u ofensivo.
- Cuando se genera audio sin habla, la calidad del audio puede ser inferior.
- Restricciones de resolución: ancho y alto deben ser divisibles por 32, y el número de frames debe cumplir la regla 8n+1; en caso contrario hay que rellenar con -1 y recortar.
- La licencia LTX-2 Community License Agreement no es una licencia permisiva estándar; es imprescindible revisar sus términos antes de cualquier uso comercial.
- La model card declara inglés como idioma del modelo, pese a que los metadatos listan nueve idiomas; el rendimiento multilingüe real no está documentado.
- El soporte en Diffusers aún no está disponible ("coming soon"), lo que limita la integración directa con ese ecosistema.
- No se documentan requisitos de VRAM ni latencias, lo que dificulta planificar el despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ibyteohdear/ltx-2-packages
- Modelo base LTX-2 en Hugging Face: https://huggingface.co/Lightricks/LTX-2
- Paper (arXiv:2601.03233): https://huggingface.co/papers/2601.03233
- Repositorio de código: https://github.com/Lightricks/LTX-2
- Licencia: https://github.com/Lightricks/LTX-2/blob/main/LICENSE
- Paquete de pipelines: https://github.com/Lightricks/LTX-2/blob/main/packages/ltx-pipelines/README.md
- Guía del trainer: https://github.com/Lightricks/LTX-2/blob/main/packages/ltx-trainer/README.md
- Demo interactiva (image-to-video): https://app.ltx.studio/ltx-2-playground/i2v
- API Playground: https://console.ltx.video/playground/
- Documentación de integración con ComfyUI: https://docs.ltx.video/open-source-model/integration-tools/comfy-ui
- Guía de prompting: https://ltx.video/blog/how-to-prompt-for-ltx-2
- Vídeo de presentación: https://youtu.be/o-7us-BR_gQ
- Documentación de Diffusers: https://huggingface.co/docs/diffusers/main/en/index
