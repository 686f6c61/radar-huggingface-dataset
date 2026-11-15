# ModelMixAI/modelmix-free10-anaya-lora

## Resumen

Anaya es un LoRA de personaje completo para SDXL (Stable Diffusion XL) desarrollado por ModelMixAI, orientado a la creación de modelos virtuales e influencers de IA. El adaptador fija una identidad visual consistente —rostro y cuerpo— de un personaje ficticio llamado Anaya, descrito como una creadora de danza del sur de Asia de 24 años, de modo que la misma figura mantiene su apariencia entre generaciones. Se distribuye como parte de una familia de 20 LoRA de personaje gratuitos que el autor diseña para combinarse con sus LoRA de localización y construir escenas coherentes.

Técnicamente es un adaptador LoRA entrenado sobre `stabilityai/stable-diffusion-xl-base-1.0`, concretamente sobre el checkpoint EpicJuggernaut XL, a partir de un dataset de 20 imágenes. No es un modelo de lenguaje ni un transformer de texto: es un módulo de difusión para generación de imágenes texto-a-imagen, con un peso recomendado de 0,9 (rango 0,8-1,0) y un token de activación específico (`mmx_free10_anaya_cy`).

Su relevancia es acotada y práctica: resuelve el problema de la consistencia de personaje en pipelines de generación de imágenes para proyectos de contenido sintético, y lo hace con un coste de entrenamiento bajo (20 imágenes) y un tamaño de repo de 0,4 GB. La licencia es restrictiva (uso personal únicamente, sin uso comercial), lo que condiciona seriamente su aplicabilidad en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre SDXL, red U-Net de difusión latente |
| Parametros totales | no disponible (adaptador LoRA; tamano de repo 0,4 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo texto-a-imagen; sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (formato de pesos .safetensors; cuantizaciones GGUF/FP8 no documentadas por el autor) |
| Idiomas soportados | no disponible (prompts en ingles en los ejemplos de la model card) |
| Licencia | other (uso personal unicamente; uso comercial no incluido) |
| Formato de pesos | safetensors (.safetensors) |

## Arquitectura y entrenamiento

El adaptador es un LoRA aplicado sobre el modelo base SDXL (Stable Diffusion XL), una arquitectura de difusión latente con un U-Net como denoiser y un codificador de texto dual para el condicionamiento por prompt. El autor indica que el entrenamiento se realizó sobre el checkpoint EpicJuggernaut XL, un fine-tune fotorrealista de SDXL, lo que explica la orientación del LoRA hacia resultados fotorrealistas.

El dataset de entrenamiento consta de 20 imágenes, un volumen muy reducido que sitúa el adaptador en la categoría de LoRA de personaje ligero. No se documentan en la información disponible el número de pasos, la tasa de aprendizaje, el rango del LoRA, la composición del dataset ni si se aplicaron técnicas de regularización o de aumento de datos. Tampoco se especifica si hubo etapas de refinamiento o ajuste de hiperparámetros más allá del peso recomendado de 0,9.

## Capacidades

- Generación de imágenes fotorrealistas de un personaje femenino ficticio consistente (rostro y cuerpo) mediante texto-a-imagen.
- Fijación de identidad visual: mantiene la misma apariencia del personaje entre generaciones, lo que permite construir series de imágenes coherentes.
- Combinación con otros LoRA del ecosistema ModelMix (localizaciones, cuerpos, rostros, compañeros) para componer escenas completas.
- Control de intensidad del efecto mediante el peso del LoRA (rango recomendado 0,8-1,0; valor por defecto 0,9).
- Activación mediante token específico (`mmx_free10_anaya_cy`) y sintaxis de etiqueta `<lora:mmx_free10_anaya_cy:0.9>`.
- No soporta tool calling, function calling, razonamiento multi-paso ni capacidades de agente: es exclusivamente un adaptador de imagen.
- No dispone de capacidades multilingües documentadas; los ejemplos de prompt están en inglés.

## Casos de uso

- Creación de un modelo virtual o influencer de IA: el LoRA permite generar un personaje con identidad estable a lo largo de múltiples publicaciones, manteniendo rostro y cuerpo coherentes entre imágenes.
- Series de contenido para redes sociales: combinado con LoRA de localización, se pueden producir escenas temáticas (estudio, exteriores, interiores) con el mismo personaje, útil para calendarios editoriales.
- Ilustración de narrativa o cómic sintético: la consistencia de personaje permite ilustrar secuencias donde la protagonista debe reconocerse en cada viñeta.
- Prototipado de personajes para videojuegos o productos digitales: generación rápida de conceptos visuales de un personaje antes de modelado 3D o diseño final.
- Pruebas de concepto de pipelines de generación: sirve como pieza de evaluación para validar flujos de trabajo con SDXL, ComfyUI o Automatic1111 antes de invertir en LoRA de pago.
- Experimentación con combinación de adaptadores: al ser gratuito y ligero, es adecuado para probar la mezcla de LoRA de personaje y localización y ajustar pesos sin coste de licencia comercial.
- Generación de material de referencia para artistas: obtener variaciones de un personaje concreto como base para bocetos o dirección de arte.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica para el LoRA; depende del modelo base SDXL. Como referencia general, SDXL en FP16 requiere en torno a 8-10 GB de VRAM en inferencia, y el LoRA añade una sobrecarga mínima.
- GPU recomendadas: no disponibles en la información proporcionada. Para SDXL se suelen emplear GPUs con al menos 8 GB de VRAM; el autor no especifica requisitos.
- Compatibilidad con GPU de consumo: no confirmada por el autor; el adaptador es ligero (0,4 GB de repo), pero el requisito real lo marca el modelo base SDXL.
- Opciones de despliegue: no documentadas por el autor. Al ser un LoRA en safetensors sobre SDXL, es compatible con los entornos habituales de SDXL (por ejemplo, ComfyUI, Automatic1111 o Diffusers), aunque no se confirma explícitamente en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Contexto / proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ModelMixAI/modelmix-free10-anaya-lora | LoRA de personaje | SDXL (EpicJuggernaut XL) | Consistencia de personaje femenino ficticio | other (uso personal) | Hugging Face, gratuito |
| Otros LoRA de personaje de ModelMix (catalogo de pago) | LoRA de personaje | SDXL | Personajes, rostros, cuerpos y localizaciones combinables | Comercial (segun tienda) | Payhip, Lemon Squeezy, 3DIMLI, Whop |
| LoRA de personaje genericos de la comunidad SDXL | LoRA de personaje | SDXL | Consistencia de personaje | Variable (muchos con licencia abierta) | Hugging Face, Civitai |

No se dispone de datos de benchmarks ni de comparativas de rendimiento cuantitativas entre estos adaptadores en la información proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: uso personal únicamente; el uso comercial no está incluido. Esto impide emplearlo en productos, servicios o contenidos monetizados sin autorización.
- Prohibición de redistribución: no se permite redistribuir, revender, compartir ni volver a subir el archivo .safetensors.
- Prohibición de representar personas reales o menores: el autor lo establece explícitamente; todo personaje es ficticio y adulto.
- Dataset de entrenamiento muy reducido (20 imágenes): puede limitar la variedad de poses, expresiones y ángulos, y aumentar el riesgo de sobreajuste a las imágenes de entrenamiento.
- Riesgo de artefactos y de deriva de identidad fuera del rango de peso recomendado (0,8-1,0); pesos superiores pueden producir resultados deformados o sobreestilizados.
- Dependencia del modelo base: la calidad final depende de SDXL y del checkpoint EpicJuggernaut XL; no es un modelo autónomo.
- Idiomas no documentados: los prompts de ejemplo están en inglés y no se garantiza el comportamiento con prompts en castellano.
- Sin datos de benchmarks, latencia ni requisitos de hardware publicados por el autor.
- Posibles sesgos derivados de los datos de entrenamiento y del modelo base, no evaluados en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/ModelMixAI/modelmix-free10-anaya-lora
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Tienda Payhip: https://payhip.com/modelmix
- Lemon Squeezy: https://modelmix.lemonsqueezy.com
- 3DIMLI: https://www.3dimli.com/store/modelmix
- Whop: https://whop.com/modelmix
