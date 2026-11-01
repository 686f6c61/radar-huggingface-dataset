# optima-tools-ch/video-high

## Resumen

OT — Vidéo · High es un paquete de pesos publicado por Optima Tools que reproduce, sin conversión ni modificación, los pesos del modelo de generación de vídeo Lightricks/LTX-2.5 en su variante destilada y en precisión BF16. No se trata de un modelo entrenado por Optima Tools: el autor original es Lightricks y el repositorio actúa como espejo empaquetado para su importación en la aplicación Optima Tools, que organiza los archivos en la estructura de carpetas `models/` (`diffusion_models/`, `text_encoders/`, `vae/`, `latent_upscale_models/`, `model_patches/`).

El componente principal es un transformer de difusión de 22 000 millones de parámetros en BF16 (42,02 GB), acompañado de un codificador de texto Gemma 4 12B adaptado (26,26 GB), dos VAE (vídeo convolucional y audio), un upscaler espacial latente x2 y una «duration head». El conjunto suma 71,10 GB repartidos en seis archivos con SHA-256 verificados contra los LFS de la fuente.

Su relevancia es doble: por un lado, ofrece una ruta de acceso íntegra a los pesos completos de LTX-2.5 en BF16 para pipelines de text-to-video e image-to-video en ComfyUI; por otro, su licencia LTX-2.x Community License Agreement impone restricciones comerciales estrictas (umbral de 10 M USD de facturación anual) que condicionan cualquier despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (LTX-2.5) con VAE de vídeo convolucional, VAE de audio, upscaler latente espacial x2 y duration head |
| Parametros totales | 22 000 millones en el transformer de difusión (denominación «22b» del archivo); el codificador de texto Gemma 4 12B se distribuye como componente separado |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (no cuantizado); existe una variante INT8 en los paquetes `video-low` y `video-medium`, incompatible con este conjunto |
| Idiomas soportados | no disponible |
| Licencia | LTX-2.x Community License Agreement (11 de agosto de 2026) |
| Formato de pesos | safetensors (BF16) |

Desglose de archivos:

| Archivo | Tamano |
|---|---:|
| `diffusion_models/ltx-2.5-22b-distilled-transformer-bf16.safetensors` | 42,02 GB |
| `text_encoders/gemma4-12b-with-proj-ltx-2.5-bf16.safetensors` | 26,26 GB |
| `vae/ltx-2.5-video-vae-conv-bf16.safetensors` | 1,45 GB |
| `latent_upscale_models/ltx-2.5-latent-spatial-upscaler-x2-bf16-1.0.safetensors` | 1,00 GB |
| `vae/ltx-2.5-audio-vae-bf16.safetensors` | 0,36 GB |
| `model_patches/ltx-2.5-duration-head-bf16.safetensors` | 0,00 GB |
| Total | 71,10 GB |

## Arquitectura y entrenamiento

La arquitectura corresponde a LTX-2.5 de Lightricks: un transformer de difusión para generación de vídeo, en esta variante destilada, que se acompaña de un VAE convolucional específico para vídeo y de un VAE independiente para audio, lo que sugiere capacidad de generar pistas sonoras junto al vídeo. El pipeline incluye además un upscaler espacial latente x2 (para escalar la resolución en el espacio latente) y una duration head que permite controlar la duración del clip generado. El codificador de texto es un Gemma 4 12B personalizado con proyección, descrito por Lightricks como encoder propio del modelo.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO; la model card del paquete no los detalla. La única innovación técnica documentada en la información disponible es la destilación del transformer (indicada en el nombre del archivo) y la separación de VAE de vídeo y audio, que apunta a generación conjunta de vídeo y sonido. Optima Tools no define un perfil de generación ni publica mediciones de rendimiento para este nivel.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video), según las etiquetas del repositorio.
- Generación de vídeo a partir de imagen (image-to-video), que es el pipeline declarado en HuggingFace.
- Generación de audio asociada al vídeo mediante el VAE de audio incluido.
- Control de la duración del clip mediante la duration head.
- Escalado de resolución en espacio latente mediante el upscaler x2.
- Integración con ComfyUI, indicada explícitamente en las etiquetas.
- Soporte de tool calling, agentes, razonamiento multi-paso o modo thinking: no disponible (no es un modelo de lenguaje conversacional).
- Capacidades multilingües: no disponible.

## Casos de uso

- Generación de clips publicitarios a partir de una imagen de producto: se usa el pipeline image-to-video con el transformer destilado para producir una animación breve del producto, y el upscaler x2 para entregar una resolución final apta para redes sociales.
- Previsualización de storyboards: un equipo de producción convierte bocetos o fotogramas clave en animáticas de baja duración con la duration head, acelerando la validación creativa antes del rodaje.
- Creación de contenido para redes sociales: generación de vídeo vertical con audio sincronizado mediante el VAE de audio, en un flujo ComfyUI automatizado por lotes.
- Prototipado de efectos visuales: uso del modelo como base para generar placas de fondo o elementos animados que luego se integran en composición digital.
- Doblaje y sonorización rápida: el VAE de audio permite generar una pista sonora asociada al clip, útil para maquetas de vídeo con audio antes de la postproducción final.
- Investigación en generación de vídeo: al distribuirse los pesos completos en BF16 sin cuantizar, es adecuado para experimentos de ajuste fino, ablaciones o evaluación comparativa frente a otros modelos de vídeo.
- Docencia y demostraciones técnicas: el paquete permite montar un entorno local reproducible con archivos verificados por SHA-256 para enseñar pipelines de difusión de vídeo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que Optima Tools no anuncia ninguna medida de rendimiento para este nivel.

## Requisitos de hardware

- VRAM estimada: los pesos BF16 suman 71,10 GB; el transformer de difusión solo ya ocupa 42,02 GB y el codificador de texto 26,26 GB, por lo que la inferencia completa requiere en la práctica más de 70 GB de memoria de GPU si se cargan ambos simultáneamente, o descarga secuencial de componentes si el pipeline lo permite.
- GPU recomendadas: no disponible en la información proporcionada; por volumen de memoria, el conjunto completo excede cualquier GPU de consumo y encaja en aceleradores de centro de datos con 80 GB o más (A100 80 GB, H100 80 GB) solo con gestión cuidadosa de la memoria, o en configuraciones multi-GPU.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en tarjetas de 16 GB en BF16; sería necesario recurrir a la variante INT8 de `video-low`/`video-medium` o a offloading a CPU/RAM.
- Opciones de despliegue: ComfyUI (etiqueta explícita del repositorio) y la propia aplicación Optima Tools mediante «Importar un dossier». No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de difusión de vídeo.
- Latencia y throughput: no disponible.
- Nota de compatibilidad: la model card advierte de que el motor de vídeo de Optima Tools solo reconoce por ahora los nombres INT8, por lo que este paquete BF16 aún no es utilizable directamente en la aplicación y requiere añadir y probar los nombres BF16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OT — Vidéo · High (LTX-2.5 BF16) | 22 000 M (transformer) + Gemma 4 12B | no disponible | no disponible | LTX-2.x Community License | HuggingFace, 71,10 GB, BF16 |
| OT — Vidéo · Medium (LTX-2.5 INT8) | no disponible | no disponible | no disponible | LTX-2.x Community License | HuggingFace, variante INT8 del mismo modelo base |
| OT — Vidéo · Low (LTX-2.5 INT8) | no disponible | no disponible | no disponible | LTX-2.x Community License | HuggingFace, variante INT8 del mismo modelo base |
| Lightricks/LTX-2.5 | 22 000 M (transformer) | no disponible | no disponible | LTX-2.x Community License | Repositorio original en HuggingFace |

Las tres variantes de Optima Tools derivan del mismo modelo base y solo difieren en precisión y empaquetado; no se dispone de datos de rendimiento comparativo entre ellas ni frente a otros modelos de vídeo.

## Limitaciones y advertencias

- El paquete no es un modelo original: es una copia de pesos de Lightricks redistribuida por Optima Tools, que no es autor ni editor de los pesos.
- La model card indica que este conjunto BF16 no es utilizable todavía en Optima Tools, porque el motor de vídeo solo reconoce nombres INT8.
- Los conjuntos BF16 e INT8 no se pueden mezclar; los cuatro archivos comunes (VAE, upscaler, duration head) sí son idénticos entre ambos.
- Licencia restrictiva: entidades con facturación anual grupal de al menos 10 M USD necesitan una licencia comercial de pago de Lightricks para cualquier uso, salvo el uso no comercial definido en la sección 2.2.
- La redistribución exige acompañar el texto íntegro del acuerdo y el Attachment A, reproducir las restricciones de uso en cualquier acuerdo que rija el uso de los archivos, señalar modificaciones y conservar avisos de copyright y atribución.
- El uso está sujeto a la política de uso aceptable de Lightricks incorporada en el Attachment A.
- No se documentan sesgos conocidos, tasas de alucinación, cobertura idiomática ni limitaciones de contexto; esa información no está disponible.
- El estado del paquete es «publicado» con integridad verificada por metadatos LFS, pero «no probado» en Optima Tools desde este repositorio.
- El codificador de texto Gemma 4 12B se entrega bajo los términos del acuerdo LTX-2.x; la fuente no indica una licencia distinta para él, lo que conviene revisar antes de un uso comercial.
- El volumen de 71,10 GB y la ausencia de cuantización hacen inviable el despliegue en GPU de consumo en esta variante.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/optima-tools-ch/video-high
- Modelo base: https://huggingface.co/Lightricks/LTX-2.5
- Revisión de origen de los pesos: https://huggingface.co/Lightricks/LTX-2.5/tree/49b093a39c19169a8a81721dcc541e07e945232f
- Texto de la licencia LTX-2.x: https://github.com/Lightricks/LTX-2/blob/a95ab856bf29407b6b066ede0abe1846050db56c/LICENSE-2_x
- Política de uso aceptable de Lightricks: https://static.lightricks.com/legal/ltx-acceptable-use-policy.pdf
