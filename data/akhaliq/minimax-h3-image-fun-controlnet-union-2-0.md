# akhaliq/MiniMax-H3-Image-Fun-Controlnet-Union-2.0

## Resumen

MiniMax-H3-Image-Fun-Controlnet-Union-2.0 es un empaquetado experimental publicado por el usuario akhaliq que combina dos modelos upstream en un unico repositorio de Hugging Face: el modelo base de generacion y edicion de imagen MiniMax-H3-Image (desarrollado por MiniMax) y la rama ControlNet union MiniMax-H3-Fun-Controlnet-Union-2.0 (desarrollada por alibaba-pai sobre el codigo de VideoX-Fun). El objetivo es facilitar la experimentacion con control estructural sobre el modelo de imagen, algo que en el ecosistema original se planteo para el transformer de video.

El modelo base es un transformer de difusion (DiT) de 50 capas con tamano oculto 5376, acompanado de un VAE de imagen, un text encoder, tokenizer, processor y scheduler. La rama ControlNet anade una proyeccion de entrada (`control_proj_in`) y 10 bloques de control (`control_blocks`) que inyectan skips con compuerta cero en las capas 0, 5, 10, ..., 45 del transformer en tiempo de ejecucion, con un peso aproximado de 13,6 GB. Soporta ocho condiciones de control (Canny, Depth, HED, MLSD, Pose, Scribble, Layout, Gray) mas inpainting.

La relevancia de este repositorio es acotada y muy especifica: no es un modelo nuevo ni un checkpoint afinado, sino una conveniencia de empaquetado para quien quiera probar el ControlNet de video sobre el modelo de imagen. El propio autor advierte de que la rama de control esta fuera de distribucion respecto al checkpoint de imagen y de que los resultados pueden ser degradados o inexistentes hasta que se adapte o afine. Es, por tanto, material de investigacion, no un artefacto listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) de 50 capas con hidden size 5376, mas VAE de imagen y text encoder; rama ControlNet union con 10 bloques de control |
| Parametros totales | no disponible (el repositorio no publica el recuento; la rama de control pesa aproximadamente 13,6 GB en safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la model card solo menciona ejecucion en `bfloat16`) |
| Idiomas soportados | no disponible |
| Licencia | MiniMax-H3 Community License Agreement (`other`); se aplican los terminos de ambos upstream |
| Formato de pesos | safetensors (`transformer/`, `transformer_diffusers/`, `vae/`, `vae_diffusers/`, `pdd_fused_heads.safetensors`, `MiniMax-H3-Fun-Controlnet-Union-2.0.safetensors`) |

## Arquitectura y entrenamiento

El modelo base MiniMax-H3-Image es un transformer de difusion con 50 capas y dimension oculta de 5376, disenado para text-to-image y edicion de imagen. El repositorio incluye dos disposiciones de pesos: la nativa (`transformer/`, `vae/`) y la variante para diffusers (`transformer_diffusers/`, `vae_diffusers/`), ademas de text encoder, tokenizer, processor, scheduler y un fichero `pdd_fused_heads.safetensors`. Se expone a traves de `MiniMaxH3ImagePipeline` (variante nativa) y `MiniMaxH3ImageModularPipeline` (variante diffusers).

La rama ControlNet union fue entrenada por los autores de VideoX-Fun contra el transformer de video de MiniMax-H3, no contra el modelo de imagen. Es una rama residual paralela que inyecta skips con compuerta cero en 10 de las 50 capas del transformer (0, 5, 10, ..., 45) en tiempo de ejecucion, por lo que no puede plegarse en los pesos base. La compatibilidad de formas se debe a que ambas arquitecturas comparten hidden size 5376 y 50 capas. En la receta original las senales de control son videos a 24 fps con recuentos de frames de la forma `17n + 5`; para control sobre imagen individual hay que tratar la imagen como un video de 1 o 5 frames y validar empiricamente. La guia esta destilada para `guidance_scale = 1.0` y es necesario usar el fichero `minimax_h3_control_inpaint_post_norm.yaml` de VideoX-Fun, ya que la configuracion v1 descoloca silenciosamente la mitad de los bloques de control.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF, DPO u otras etapas de alineacion, ni para el modelo base ni para la rama de control.

## Capacidades

- Generacion de imagen a partir de texto (text-to-image) mediante el pipeline MiniMax-H3-Image.
- Edicion de imagen (image-to-image, image-editing) con el modelo base.
- Control estructural condicionado por ocho modalidades: Canny, Depth, HED, MLSD, Pose, Scribble, Layout y Gray.
- Inpainting mediante la rama de control union.
- Inyeccion de control en tiempo de ejecucion sobre 10 capas del transformer, sin modificar los pesos base.
- Carga mediante la libreria diffusers (`DiffusionPipeline.from_pretrained` en `bfloat16`).
- Soporte de tool calling, agentes, razonamiento multi-step, vision, audio o thinking mode: no disponible (no es un modelo de lenguaje; es un modelo generativo de imagen).

## Casos de uso

- Experimentacion con ControlNet de video sobre un modelo de imagen: el caso de uso central del repositorio; permite evaluar si la rama de control entrenada para el transformer de video transfiere senal util al checkpoint de imagen, con resultados a documentar en la seccion de discusiones del repo.
- Edicion de imagen guiada por estructura en laboratorio: usar Canny o Depth como condicion para preservar la geometria de una imagen de entrada y observar como responde el modelo base ante condiciones fuera de distribucion.
- Inpainting controlado en prototipos de investigacion: combinar la rama union con la configuracion `minimax_h3_control_inpaint_post_norm.yaml` para rellenar regiones enmascaradas y medir la calidad frente al modelo base sin control.
- Control de pose en generacion de figuras humanas: emplear la condicion Pose para imponer esqueletos y evaluar la fidelidad anatomica del pipeline experimental.
- Control de layout en composicion de escenas: usar la condicion Layout para fijar la disposicion espacial de objetos y comparar con la generacion libre del modelo base.
- Base para fine-tuning de la rama de control: el empaquetado facilita adaptar los 10 bloques de control al checkpoint de imagen, que es precisamente la limitacion senalada por el autor.
- Docencia y divulgacion tecnica: ilustrar como se acopla una rama ControlNet residual con compuerta cero a un DiT y por que la compatibilidad de formas no garantiza calidad de control.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, CLIP score, SSIM ni comparativas con otros modelos) y advierte explicitamente de que el control puede ser degradado o ausente hasta que la rama se adapte o afine.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud, la rama de control sola pesa aproximadamente 13,6 GB en safetensors y el repositorio incluye ademas el transformer completo, el VAE y el text encoder; en `bfloat16` el conjunto requiere previsiblemente varias decenas de GB, aunque no se publica una cifra concreta.
- GPU recomendadas: no disponible. Por el volumen de pesos, el uso en GPU de datacenter (A100, H100) es el escenario plausible; no hay confirmacion oficial.
- Cabe en GPU de consumo: no disponible. No se documenta ejecucion en RTX 4090 ni en tarjetas de 24 GB o menos.
- Opciones de despliegue: diffusers (`DiffusionPipeline.from_pretrained` con `torch_dtype="bfloat16"`) y el codigo de VideoX-Fun con la configuracion `minimax_h3_control_inpaint_post_norm.yaml`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de difusion de imagen).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| akhaliq/MiniMax-H3-Image-Fun-Controlnet-Union-2.0 | DiT de imagen + ControlNet union (empaquetado experimental) | no disponible | no disponible | MiniMax-H3 Community License | Repositorio de comunidad, no oficial |
| MiniMaxAI/MiniMax-H3-Image | DiT de imagen (modelo base) | no disponible | no disponible | MiniMax-H3 Community License | Modelo oficial de MiniMax |
| alibaba-pai/MiniMax-H3-Fun-Controlnet-Union-2.0 | Rama ControlNet union para MiniMax-H3 | no disponible (aprox. 13,6 GB) | no disponible | MiniMax-H3 Community License | Modelo oficial de alibaba-pai / VideoX-Fun |

No se dispone de datos de rendimiento comparativo entre estas variantes ni con alternativas de otros laboratorios, por lo que no es posible establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- La rama de control esta fuera de distribucion respecto al checkpoint de imagen: el autor advierte de control degradado o ausente hasta que se adapte o afine.
- La rama fue entrenada contra el transformer de video, no contra el de imagen; la compatibilidad de formas (hidden 5376, 50 capas) no garantiza calidad de control.
- Las senales de control originales son videos a 24 fps con recuentos de frames `17n + 5`; el uso sobre imagen individual exige tratarla como video de 1 o 5 frames y validar empiricamente.
- La guia esta destilada para `guidance_scale = 1.0`; usar otro valor puede degradar el resultado.
- Es obligatorio cargar la configuracion `minimax_h3_control_inpaint_post_norm.yaml` de VideoX-Fun; la configuracion v1 descoloca silenciosamente la mitad de los bloques de control.
- El empaquetado es no oficial y no esta respaldado por MiniMax ni por los autores de VideoX-Fun.
- Licencia MiniMax-H3 Community License Agreement: hay que revisar los terminos de uso comercial en `LICENSE` (modelo base) y `LICENSE.controlnet` (rama de control) antes de cualquier despliegue productivo.
- No hay informacion sobre sesgos, riesgo de alucinacion visual, idiomas soportados ni limites de contexto.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria documentada.
- No apto para produccion en su estado actual: es material de investigacion para experimentar con el acoplamiento ControlNet.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/akhaliq/MiniMax-H3-Image-Fun-Controlnet-Union-2.0
- Modelo base MiniMax-H3-Image: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- ControlNet union upstream: https://huggingface.co/alibaba-pai/MiniMax-H3-Fun-Controlnet-Union-2.0
- Codigo VideoX-Fun: https://github.com/aigc-apps/VideoX-Fun
- Demo Space (creacion via ML Intern): https://hf.co/chat?mode=ml-intern&prompt=Build%20a%20demo%20Space%20for%20akhaliq%2FMiniMax-H3-Image-Fun-Controlnet-Union-2.0
