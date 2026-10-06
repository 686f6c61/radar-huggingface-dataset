# Gazi545454/Chroma

## Resumen

Chroma es un modelo de difusion texto-a-imagen de 8,9 mil millones de parametros derivado de FLUX.1-schnell, desarrollado por lodestones (el repositorio aqui analizado, Gazi545454/Chroma, es una copia alojada por un tercero y aparece marcado como obsoleto por el propio autor). Su objetivo es ofrecer una alternativa de generacion de imagenes completamente abierta y sin censura, con licencia Apache 2.0, reintroduciendo conceptos anatomicos que otros modelos filtran.

El modelo se entrena sobre un dataset de 5 millones de muestras curado a partir de 20 millones de ejemplos que incluyen anime, furry, contenido artistico y fotografias. La arquitectura parte del backbone MMDiT multimodal de FLUX, pero el autor podo la capa de modulacion (que en FLUX ocupa 3.300 millones de parametros) y la sustituyo por una FFN de 250 millones, reduciendo el total de 12.000 a 8.900 millones de parametros.

Se trata de un modelo en desarrollo activo en el momento de publicacion de la model card, con mas de 6.000 horas de H100 de preentrenamiento. La relevancia actual radica en su licencia Apache 2.0 sin restricciones comerciales y en su enfoque "uncensored", aunque el propio autor recomienda migrar a Chroma1-HD, Chroma1-Base o Chroma1-Flash y marca este repositorio como deprecado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MMDiT (diffusion transformer multimodal) derivada de FLUX.1-schnell |
| Parametros totales | 8,9 mil millones (12B en FLUX original, con capa de modulacion podada de 3,3B a 250M) |
| Parametros activos | No es MoE; no aplica |
| Longitud de contexto | No disponible / no aplicable (modelo de difusion texto-a-imagen) |
| Tipos de cuantizacion | FP8 scaled (Clybius/Chroma-fp8-scaled) y GGUF (silveroxides/Chroma-GGUF) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors; variantes GGUF; requiere VAE de FLUX (ae.safetensors) y encoder T5-XXL |

## Arquitectura y entrenamiento

Chroma emplea una arquitectura MMDiT (Multimodal Diffusion Transformer) heredada de FLUX.1-schnell. La modificacion principal descrita en la model card es la eliminacion de la capa de modulacion AdaLN/affine projection: en FLUX esa capa almacena 3.300 millones de parametros para codificar esencialmente un unico valor de timestep (un float en rango 0-1) y la informacion de los vectores CLIP agrupados (pooled). Tras comprobar que poner a cero esos vectores apenas alteraba la salida, el autor la sustituyo por una FFN de 250 millones de parametros, proceso que realizo en un solo dia sobre una RTX 3090.

Entre las innovaciones tecnicas mencionadas en la model card figuran el enmascaramiento de tokens de padding de T5 durante el entrenamiento (MMDiT masking), que segun el autor mejora la fidelidad y la estabilidad; ajustes en la distribucion de timesteps; y transporte optimo por minibatch (minibatch optimal transport). El entrenamiento se realiza sobre un dataset de 5 millones de muestras curadas de un pool de 20 millones, con contenido de anime, furry, arte y fotografia. No se especifican en la informacion disponible el numero exacto de tokens, la composicion detallada del dataset ni si se aplicaron fases de RLHF o DPO (no aplicables de forma estandar en difusion, aunque no se detalla).

## Capacidades

- Generacion de imagenes a partir de texto (pipeline text-to-image).
- Estilos amplios: anime, furry, artistico y fotografico, segun el dataset de entrenamiento.
- Generacion sin censura: reintroduce conceptos anatomicos ausentes en modelos filtrados.
- Integracion con ComfyUI mediante workflow especifico y nodo custom (ComfyUI_FluxMod, en modo manual deprecado).
- Soporte de cuantizacion FP8 y GGUF para reducir requisitos de VRAM.
- Uso del encoder de texto T5-XXL y del VAE de FLUX para el proceso de difusion.
- No se documentan capacidades de tool calling, agentes, vision de entrada ni audio; es un modelo puramente generativo texto-a-imagen.
- Multilingue: limitado a ingles segun los metadatos.

## Casos de uso

- Ilustracion de estilo anime y furry: el dataset de entrenamiento contiene explicitamente estas categorias, por lo que el modelo esta ajustado para producir personajes y escenas de estos estilos con coherencia estilistica.
- Generacion de arte conceptual sin filtros: util para estudios que necesitan explorar conceptos anatomicos o tematicas que otros modelos rechazan, gracias a su caracter "uncensored" y su licencia Apache 2.0.
- Prototipado de assets para videojuegos e ilustracion editorial: la licencia Apache 2.0 permite uso comercial sin royalties, a diferencia de alternativas como FLUX.1-dev.
- Pipelines de generacion por lotes en ComfyUI: el workflow incluido y los formatos FP8/GGUF permiten montar flujos automatizados de produccion de imagenes en GPU de gama alta o consumer con cuantizacion.
- Investigacion en difusion: la model card documenta decisiones arquitectonicas concretas (poda de capa de modulacion, MMDiT masking), lo que lo hace util como caso de estudio reproducible con el codigo en github.com/lodestone-rock/flow.
- Generacion fotografica estilizada: al incluir fotografia en el dataset, sirve para producir imagenes con aspecto fotografico o semi-fotografico para mockups y moodboards.
- Fine-tuning y derivados comunitarios: al ser Apache 2.0 y safetensors, es apto como base para LoRAs y ajustes especificos de estilo o dominio.
- Despliegue en local con cuantizacion GGUF: para usuarios con VRAM limitada que quieran ejecutar el modelo en ComfyUI con el nodo ComfyUI-GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona mejoras cualitativas de fidelidad y estabilidad con MMDiT masking, pero no aporta cifras (FID, CLIP score, etc.).

## Requisitos de hardware

- VRAM estimada en FP16: en torno a 18 GB solo para los pesos del transformer de 8,9B parametros, mas el encoder T5-XXL (aproximadamente 9,5 GB en FP16 o 4,9 GB en FP8) y el VAE. Estimacion, no confirmada por el autor.
- VRAM reducida con cuantizacion: el repositorio Clybius/Chroma-fp8-scaled ofrece FP8 scaled (formato usado por ComfyUI con posible mejora de velocidad); silveroxides/Chroma-GGUF ofrece variantes GGUF que bajan el requisito segun el nivel de cuantizacion (estimacion, no cifrada en la informacion disponible).
- GPU recomendadas: el autor entreno en H100 (mas de 6.000 horas) y realizo la poda en una RTX 3090. Para inferencia, GPU de 24 GB o mas (RTX 3090, 4090) con cuantizacion, o A100/H100 para FP16 sin compromisos.
- Cabe en GPU consumer: si, con cuantizacion FP8 o GGUF en tarjetas de 12-24 GB; en FP16 completo es ajustado en 24 GB por el encoder T5-XXL adicional.
- Opciones de despliegue: ComfyUI (via oficial, con workflow json incluido), nodo ComfyUI_FluxMod (instalacion manual, marcada como deprecada), y diffusers (indicado como WIP en la model card).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Base | Licencia | Contexto de uso |
|---|---|---|---|---|
| Chroma (Gazi545454/Chroma) | 8,9B | FLUX.1-schnell | Apache 2.0 | Texto-a-imagen, sin censura, en desarrollo |
| FLUX.1-schnell | 12B | Propio | Apache 2.0 | Texto-a-imagen, rapido, sin censura parcial |
| FLUX.1-dev | 12B | Propio | No comercial | Texto-a-imagen de alta calidad, uso restringido |
| Stable Diffusion XL | 2,6B | UNet | CreativeML Open RAIL++-M | Texto-a-imagen, ecosistema amplio |

Nota: los datos de FLUX.1-schnell, FLUX.1-dev y SDXL corresponden a informacion publica de sus respectivos proyectos; no se han extraido de la model card de Chroma. No se dispone de resultados de benchmarks comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- Repositorio deprecado: la propia model card indica "THIS REPO IS DEPRECATED" y recomienda usar Chroma1-HD, Chroma1-Base o Chroma1-Flash.
- Discrepancia de autoría: el modelo original es de lodestones; el repositorio analizado (Gazi545454/Chroma) es de otro usuario, con 0 descargas y 0 likes, y un tamano de repo de 1291,7 GB que sugiere una copia o reempaquetado. Verificar procedencia antes de usarlo en produccion.
- Modelo en entrenamiento: en el momento de la model card seguia entrenandose, por lo que la calidad puede ser inconsistente.
- Sin benchmarks publicados: no hay cifras objetivas de rendimiento que respalden las afirmaciones cualitativas.
- Contenido para adultos: etiquetado como not-for-all-audiences y "fully uncensored"; puede generar contenido explicito o inapropiado sin filtros.
- Idiomas: solo ingles; no se documenta soporte multilingue.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede producir artefactos anatomicos, texto ilegible en imagenes y desviaciones del prompt.
- Dependencias externas: requiere T5-XXL y el VAE de FLUX por separado, lo que aumenta los requisitos de descarga y VRAM.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar la licencia de los componentes auxiliares (T5-XXL, VAE de FLUX) por si imponen condiciones adicionales.
- Sesgos: el dataset mezcla anime, furry, arte y fotografia; puede sobrerrepresentar ciertos estilos y presentar sesgos de representacion no auditados.

## Enlaces

- HuggingFace del repositorio analizado: https://huggingface.co/Gazi545454/Chroma
- Repositorio original (referenciado en la model card): https://huggingface.co/lodestones/Chroma
- Repo de debug de entrenamiento: https://huggingface.co/lodestones/chroma-debug-development-only
- Logs de entrenamiento en vivo: https://training.lodestone-rock.com
- Codigo de entrenamiento: https://github.com/lodestone-rock/flow
- Galeria en Civitai: https://civitai.com/posts/13766416
- Modelo en Civitai: https://civitai.com/models/1330309/chroma
- Cuantizacion FP8 scaled: https://huggingface.co/Clybius/Chroma-fp8-scaled
- Cuantizacion GGUF: https://huggingface.co/silveroxides/Chroma-GGUF
- Encoders de texto FLUX (T5-XXL): https://huggingface.co/comfyanonymous/flux_text_encoders
- Workflow de ComfyUI: https://huggingface.co/lodestones/Chroma/resolve/main/ComfyUI_Chroma1-HD_T2I-workflow.json
- Nodo custom ComfyUI_FluxMod (deprecado): https://github.com/lodestone-rock/ComfyUI_FluxMod
- Demo en Fictional.ai: https://fictional.ai/?ref=chroma_hf
- Apoyo al desarrollo: https://ko-fi.com/lodestonerock
