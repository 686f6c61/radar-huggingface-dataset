# ModelMixAI/modelmix-free18-kaida-lora

## Resumen

Kaida es un LoRA de personaje para Stable Diffusion XL (SDXL) desarrollado por ModelMixAI, orientado a la generación de una modelo virtual consistente de estilo anime cyberpunk. El adaptador fija un personaje concreto —cara, peinado y estilismo— de modo que la misma identidad visual se mantiene entre generaciones, lo que lo hace útil para proyectos de influencers virtuales, ilustración serializada o narrativa visual con personaje recurrente. Se entrenó sobre SDXL Nuclear (NuclearDiffusionSDXL3) a partir de 20 imágenes y se distribuye de forma gratuita dentro del catálogo de ModelMix.

Técnicamente es un adaptador LoRA (no un modelo completo): requiere SDXL base como sustrato y se invoca mediante el trigger `mmx_free18_kaida_cy` con un peso recomendado de 0,9 (rango 0,8-1,0). El repositorio ocupa 0,3 GB, lo que corresponde a los pesos del adaptador en formato safetensors. La licencia es "other" y restringe el uso a fines personales, sin cesión comercial ni redistribución.

Su relevancia actual es acotada y muy específica: encaja en flujos de trabajo de generación de imágenes con personajes consistentes sobre SDXL, un caso de uso consolidado en la comunidad de difusión, pero no aporta capacidades de lenguaje, razonamiento ni tool calling. Es una pieza de un ecosistema modular (personajes, caras, cuerpos y localizaciones combinables) pensado para mezclar y combinar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre Stable Diffusion XL (difusión latente, U-Net + text encoders) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base SDXL tiene ~2,6 B en U-Net y ~817 M en el text encoder, dato no confirmado en la información proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image; sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (los LoRA suelen distribuirse en fp16/bf16; no se especifica en la información) |
| Idiomas soportados | no disponible (prompts en inglés en los ejemplos; SDXL base soporta principalmente inglés) |
| Licencia | other (uso personal únicamente; sin uso comercial; prohibida la redistribución) |
| Formato de pesos | safetensors (archivo .safetensors de LoRA; tamaño del repo 0,3 GB) |

## Arquitectura y entrenamiento

El adaptador es un LoRA aplicado sobre SDXL, un modelo de difusión latente con arquitectura U-Net y doble text encoder (CLIP). El LoRA inyecta matrices de bajo rango en las capas del modelo base para especializarlo en un personaje concreto sin reentrenar los pesos completos. Según la model card, se entrenó sobre SDXL Nuclear (NuclearDiffusionSDXL3) a partir de un conjunto de 20 imágenes, un volumen reducido típico de los LoRA de personaje que priorizan consistencia facial y de vestuario sobre variedad.

No se especifican en la información disponible detalles sobre hiperparámetros de entrenamiento (learning rate, rango del LoRA, número de pasos, resolución), composición del dataset más allá del recuento de imágenes, ni si hubo técnicas adicionales como regularización o data augmentation. Tampoco se documenta el uso de RLHF/DPO, algo por otra parte ajeno a los modelos de difusión. La innovación técnica declarada es la consistencia de identidad del personaje entre generaciones, apoyada en un trigger token dedicado (`mmx_free18_kaida_cy`) y un peso de aplicación recomendado de 0,9.

## Capacidades

- Generación de imágenes text-to-image de un personaje anime consistente (cara, pelo y estilismo estables entre generaciones).
- Control de identidad mediante trigger token `mmx_free18_kaida_cy` y peso de LoRA ajustable (rango 0,8-1,0; recomendado 0,9).
- Estilismo definido: chica anime cyberpunk, pelo corto bicolor rosa neón y negro, ojos cian, piel clara, expresión de sonrisa confiada.
- Combinable con otros LoRA de ModelMix (localizaciones, caras, cuerpos, acompañantes) para construir escenas y modelos virtuales compuestas.
- Integración en pipelines de SDXL (por ejemplo, mediante etiquetas `<lora:...>` en el prompt).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües de lenguaje: es exclusivamente un adaptador de imagen.

## Casos de uso

- **Modelo virtual / influencer IA**: generar un personaje recurrente con identidad visual estable para publicaciones seriadas en redes, usando el trigger y peso 0,9 para mantener la coherencia entre imágenes.
- **Ilustración serializada y cómic**: producir viñetas con el mismo personaje en distintas poses y escenas combinando este LoRA de personaje con LoRA de localización del mismo catálogo.
- **Prototipado de personajes para videojuegos o narrativa visual**: explorar variaciones de vestuario y expresión de un personaje fijo antes de encargar arte final.
- **Contenido para proyectos personales de ficción**: generar material gráfico de un personaje consistente para blogs, fanarts o proyectos amateur, dentro del uso personal permitido por la licencia.
- **Composición de escenas con estética cyberpunk anime**: usar el personaje como sujeto en escenas urbanas neón combinándolo con LoRA de entorno, aprovechando la modularidad del ecosistema ModelMix.
- **Base para encargos personalizados**: servir como referencia de estilo para solicitar a ModelMix un LoRA a medida (el autor ofrece encargos desde 25 USD), aunque el adaptador en sí no es comercializable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma específica para el LoRA; la inferencia depende del modelo base SDXL. Como referencia orientativa del ecosistema SDXL (no confirmada en la información proporcionada): en fp16 requiere del orden de 8-10 GB de VRAM, y con cuantización u optimizaciones (por ejemplo, fp8 o attention slicing) puede reducirse por debajo de 8 GB.
- **GPU recomendadas**: no disponible en la información. Por el sustrato SDXL, cabría esperar GPUs consumer de gama alta (RTX 3090/4090, 24 GB) y GPUs de datacenter (A100, H100) para lotes grandes; dato no confirmado en la ficha del autor.
- **¿Cabe en GPU consumer?**: previsiblemente sí en GPUs con 8-12 GB o más, dependiendo de la cuantización y del pipeline; no confirmado en la información.
- **Opciones de despliegue**: no especificadas por el autor. El adaptador es compatible con pipelines de SDXL que carguen LoRA (por ejemplo, Diffusers, ComfyUI, Automatic1111/Forge, InvokeAI); dato no documentado en la model card.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Consistencia de personaje | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ModelMixAI/modelmix-free18-kaida-lora | LoRA de personaje | SDXL Nuclear (NuclearDiffusionSDXL3) | Sí (trigger dedicado, 20 imágenes) | other (solo uso personal) | Hugging Face, gratis |
| LoRA de personaje genérico de la comunidad SDXL | LoRA de personaje | SDXL base | Variable según autor | Variable | Hugging Face / Civitai |
| SDXL base (stabilityai/stable-diffusion-xl-base-1.0) | Modelo completo | — | No (identidad no fijada) | CreativeML Open RAIL++-M | Hugging Face |
| Otros LoRA del catálogo ModelMix (caras, cuerpos, localizaciones) | LoRA modular | SDXL | Parcial (por pieza) | other (según pieza) | Hugging Face / Payhip |

No se dispone de datos de rendimiento comparativo (métricas objetivas) en la información proporcionada; la comparación se limita a tipo de modelo, base, licencia y disponibilidad.

## Limitaciones y advertencias

- **Licencia restrictiva**: uso personal únicamente; el uso comercial no está incluido. Prohibida la redistribución, reventa, compartición o resubida del archivo .safetensors.
- **Restricción de contenido**: prohibido usar el LoRA para representar a personas reales o a menores. Todos los personajes son adultos ficticios generados por IA.
- **Dependencia del modelo base**: requiere SDXL (entrenado sobre SDXL Nuclear); su comportamiento puede degradarse si se aplica sobre otras variantes de SDXL no previstas.
- **Dataset reducido**: entrenado con solo 20 imágenes, lo que puede limitar la variedad de poses, expresiones y ángulos, y favorecer sobreajuste a las composiciones del dataset.
- **Riesgo de alucinación visual**: como todo modelo de difusión, puede generar anatomía inconsistente, artefactos en manos o rostro, y desviaciones del estilismo esperado; el peso del LoRA (0,8-1,0) influye en la fidelidad frente a la flexibilidad.
- **Idioma**: no se documentan idiomas soportados; los prompts de ejemplo están en inglés y SDXL base rinde mejor en inglés.
- **Sin benchmarks**: no hay métricas objetivas publicadas que permitan evaluar calidad o consistencia de forma cuantitativa.
- **Sesgos**: no documentados en la información disponible; los modelos de difusión pueden heredar sesgos del modelo base y del dataset de entrenamiento.
- **Madurez del repositorio**: 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/ModelMixAI/modelmix-free18-kaida-lora
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Tienda Payhip (catálogo completo): https://payhip.com/modelmix
- Lemon Squeezy: https://modelmix.lemonsqueezy.com
- 3DIMLI: https://www.3dimli.com/store/modelmix
- Whop: https://whop.com/modelmix
