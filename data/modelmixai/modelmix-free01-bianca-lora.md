# ModelMixAI/modelmix-free01-bianca-lora

## Resumen

Bianca es un LoRA de personaje para Stable Diffusion XL (SDXL), desarrollado por ModelMixAI dentro de su catálogo de personajes virtuales para generación de imágenes fotorrealistas. El adaptador fija la identidad visual de un personaje ficticio concreto —una mujer brasileña de 26 años descrita como influencer de playa— de forma que la misma cara y el mismo cuerpo se mantengan consistentes entre generaciones, que es precisamente el problema que resuelven los LoRA de personaje consistente frente a un modelo base sin adaptar.

El modelo se entrenó a partir de 20 imágenes sobre epiCRealism XL, un fine-tune fotorrealista de SDXL, y se publica como pieza gratuita dentro de una colección de 20 LoRA de personaje gratuitos; el catálogo completo (caras, cuerpos, localizaciones y personajes completos) es de pago. La propuesta de ModelMix es la composición modular: este LoRA de personaje se combina con LoRA de localización del mismo autor para construir escenas coherentes con un modelo virtual estable.

Por su naturaleza, no es un modelo de lenguaje ni un modelo de difusión completo, sino un adaptador de bajo rango (0,3 GB de repositorio) que requiere SDXL como base. Su relevancia es práctica para flujos de trabajo de influencer virtual y modelaje sintético, donde la consistencia de identidad entre imágenes es el requisito crítico, y donde la licencia de uso personal restringe su aplicación comercial directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre Stable Diffusion XL (UNet transformer con atención) |
| Parametros totales | no disponible (adaptador LoRA; tamaño de repo 0,3 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image; sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (los pesos LoRA se aplican sobre la base; la cuantización depende de la base SDXL y del runtime) |
| Idiomas soportados | no disponible (prompts en inglés en los ejemplos de la model card) |
| Licencia | other (uso personal únicamente; uso comercial no incluido) |
| Formato de pesos | safetensors (archivo .safetensors citado en la licencia) |

## Arquitectura y entrenamiento

El adaptador es un LoRA aplicado sobre stabilityai/stable-diffusion-xl-base-1.0, aunque el autor indica que el entrenamiento se realizó sobre epiCRealism XL, un fine-tune fotorrealista de SDXL. SDXL emplea una arquitectura de difusión latente con un UNet de atención y doble codificador de texto; el LoRA inyecta matrices de bajo rango en las capas del UNet para desplazar la distribución generativa hacia la identidad del personaje sin reentrenar la base.

El conjunto de entrenamiento es reducido: 20 imágenes del personaje. No se especifican en la información disponible el número de pasos, la tasa de aprendizaje, el rango del LoRA ni si hubo regularización o técnicas de aumento de datos. Tampoco se documenta el proceso de curaduría del dataset ni el origen de las imágenes. La innovación declarada no es arquitectónica sino de producto: el sistema de piezas intercambiables (personaje, cara, cuerpo, localización) con un trigger token único (`mmx_free01_bianca_cy`) y un peso recomendado de 0,9 dentro de un rango de 0,8 a 1,0.

## Capacidades

- Generación de imágenes fotorrealistas de un personaje femenino consistente mediante text-to-image con SDXL.
- Consistencia de identidad facial y corporal entre generaciones, gracias al anclaje del LoRA sobre un trigger token dedicado.
- Composición modular con otros LoRA del mismo autor (localizaciones, caras, cuerpos) para construir escenas coherentes.
- Control de intensidad del personaje mediante el peso del LoRA (rango recomendado 0,8-1,0).
- Integración en pipelines estándar de difusión que soporten LoRA sobre SDXL (por ejemplo, nodos de carga de LoRA en ComfyUI o la sintaxis `<lora:nombre:peso>` de la interfaz web de Automatic1111).
- No dispone de tool calling, razonamiento multi-paso, capacidades de agente, visión, audio ni modo thinking: es exclusivamente un adaptador de imagen.

## Casos de uso

- Creación de un influencer virtual con identidad estable: el LoRA mantiene la misma cara y cuerpo a lo largo de una serie de publicaciones, lo que evita la deriva de identidad típica de SDXL sin adaptador y permite construir un feed coherente.
- Modelaje sintético para catálogos de moda: combinado con LoRA de localización, se generan escenas de playa o exteriores con el mismo personaje en distintos outfits, útil para previsualizar colecciones sin sesión fotográfica.
- Pruebas de concepto de personajes para narrativa visual: guiones gráficos o storyboards donde el personaje debe reconocerse entre viñetas, con generación rápida en GPU de consumo.
- Composición de escenas con múltiples piezas ModelMix: el trigger token y el peso 0,9 permiten apilar este LoRA de personaje con un LoRA de localización del mismo catálogo para obtener una escena consistente.
- Experimentación e investigación en consistencia de personaje: con solo 20 imágenes de entrenamiento, sirve como caso de estudio de cuánta identidad se puede fijar con un dataset mínimo y un LoRA de bajo rango.
- Generación de material de referencia para artistas: variaciones de pose, iluminación y encuadre sobre una misma identidad para usar como base de ilustración o retoque posterior.
- Prototipado de campañas creativas: al ser gratuito y ligero (0,3 GB), permite evaluar el estilo fotorrealista de epiCRealism XL con un personaje concreto antes de invertir en piezas de pago del catálogo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende enteramente de la base SDXL, no del LoRA. SDXL en precisión fp16 requiere del orden de 8-10 GB de VRAM para generar a 1024x1024; el adaptador LoRA añade una sobrecarga mínima.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100 o H100 para generación cómoda a 1024x1024; tarjetas con 8 GB pueden funcionar con optimizaciones (medicina de atención, offload) aunque el dato exacto no está documentado por el autor.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs con 8 GB o más, siempre que se use la base SDXL con los ajustes adecuados; no se especifican requisitos oficiales.
- Opciones de despliegue: ComfyUI, Automatic1111 WebUI (sintaxis `<lora:...>`), InvokeAI, Diffusers con `load_lora_weights`, o cualquier runtime que cargue LoRA sobre SDXL. No aplica vLLM, llama.cpp, Ollama ni TGI, que son para modelos de lenguaje.
- Latencia y throughput: no disponibles; dependen de la GPU, de la resolución y del número de pasos de muestreo, no del LoRA.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Dataset de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ModelMix Bianca (este) | LoRA de personaje consistente | SDXL (entrenado sobre epiCRealism XL) | 20 imágenes | other, solo uso personal | Hugging Face, gratis |
| Otros LoRA de personaje de ModelMix | LoRA de personaje consistente | SDXL | no disponible | mixta (gratuitos y de pago) | Hugging Face y Payhip |
| LoRA de personaje de la comunidad SDXL (genéricos) | LoRA de personaje | SDXL | variable, habitualmente decenas de imágenes | variable, a menudo CreativeML OpenRAIL-M | Civitai, Hugging Face |

No se dispone de datos de benchmarks ni de comparaciones cuantitativas de consistencia de identidad entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: uso personal únicamente; el uso comercial no está incluido. Prohibida la redistribución, reventa, compartición o resubida del archivo .safetensors.
- Prohibición explícita de usar el LoRA para representar a personas reales o a menores; el autor declara que todo sujeto representado es un adulto ficticio generado por IA.
- Dataset de entrenamiento muy pequeño (20 imágenes): riesgo de sobreajuste a las poses, iluminación y encuadres del conjunto original, con menor variedad de expresiones y ángulos.
- Dependencia de la base: el resultado real depende de la versión de SDXL y del fine-tune utilizado; el autor entrenó sobre epiCRealism XL, por lo que otros fine-tunes pueden alterar el parecido.
- Riesgo de deriva de identidad si se combina con otros LoRA a pesos altos o si se sale del rango recomendado de 0,8-1,0.
- Idiomas: la model card solo documenta prompts en inglés; no hay evidencia de soporte multilingüe en los prompts.
- Sesgos: no documentados por el autor; al tratarse de un personaje fotorrealista de mujer brasileña, puede reproducir estereotipos visuales del dataset de entrenamiento y de la base.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar anatomía incorrecta, manos deformes o artefactos en texto e iluminación, especialmente en composiciones complejas.
- Sin garantías de calidad ni mantenimiento: 0 descargas y 0 likes en el momento de la consulta, y sin documentación técnica de hiperparámetros de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ModelMixAI/modelmix-free01-bianca-lora
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Tienda Payhip del autor: https://payhip.com/modelmix
- Lemon Squeezy: https://modelmix.lemonsqueezy.com
- 3DIMLI: https://www.3dimli.com/store/modelmix
- Whop: https://whop.com/modelmix
