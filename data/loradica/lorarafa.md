# loradica/lorarafa

## Resumen

`loradica/lorarafa` es un adaptador LoRA de difusión (text-to-image) publicado por el usuario `loradica` sobre el modelo base `black-forest-labs/FLUX.1-dev`. No es un modelo de lenguaje: es un ajuste de bajo rango que se acopla a un transformer de flujo rectificado (FLUX.1-dev, 12 000 millones de parámetros) para especializarlo en la generación de retratos de una persona concreta, activada mediante la palabra clave `RafaelValente`.

El repositorio se distribuye en formato diffusers con la plantilla `template:diffusion-lora`, pesa 0,1 GB y no declara licencia, idiomas soportados ni métricas de evaluación. La model card se limita a indicar la palabra de activación (`RafaelValente`), un `instance_prompt` idéntico y un ejemplo de uso: `RafaelValente, casual portrait of a young Brazilian man, short beard, realistic photography`, con una imagen de validación generada a 1024x1024 píxeles.

Su relevancia actual es limitada y de nicho: se trata de un adaptador de identidad (character/person LoRA) del ecosistema FLUX, útil como caso de estudio de personalización con LoRA sobre modelos de difusión de gran tamano, pero con cero descargas y cero likes en el momento del análisis, sin licencia declarada y sin documentación técnica de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (bajo rango) sobre transformer de flujo rectificado FLUX.1-dev (MMDiT); no es un modelo de lenguaje |
| Parámetros totales | No disponible (adaptador LoRA; el repositorio ocupa 0,1 GB) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de imagen); resolución de ejemplo 1024x1024 píxeles |
| Tipos de cuantización | No disponible en el repositorio; el modelo base FLUX.1-dev admite bf16/fp16, FP8 y GGUF (Q2 a Q8) mediante herramientas de terceros |
| Idiomas soportados | No disponibles (los prompts del ejemplo están en inglés) |
| Licencia | No disponible en el repositorio; el modelo base FLUX.1-dev está sujeto a la licencia no comercial FLUX.1 [dev] |
| Formato de pesos | diffusers (adaptador LoRA), compatible con PEFT y con la librería `diffusers` |
| Modelo base | black-forest-labs/FLUX.1-dev |
| Palabra de activación | `RafaelValente` |
| Pipeline | text-to-image |
| Tamaño del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-13 |
| Última actualización | 2026-09-13 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre FLUX.1-dev, un transformer de difusión con arquitectura MMDiT (multimodal diffusion transformer) de 12 000 millones de parámetros que emplea flujo rectificado (rectified flow) y una formulación de destilación de guiado, de modo que no requiere `guidance_scale` en la inferencia. El pipeline completo incluye dos codificadores de texto (CLIP y T5-XXL) y un VAE que opera en un espacio latente de 16 canales con factor de compresión 8x8. El LoRA modifica únicamente un subconjunto de las matrices de atención y proyección del transformer, por lo que su coste de almacenamiento (0,1 GB) y de cómputo en inferencia es marginal frente al modelo base.

No hay información publicada sobre el proceso de entrenamiento: se desconocen el número de imágenes del dataset, el número de pasos, el rango y el alpha del LoRA, la tasa de aprendizaje, el optimizador ni si se aplicaron técnicas adicionales como regularización por clase o *prior preservation*. El único indicio disponible es el nombre de la imagen de validación incluida en la model card (`step_1500_validation_0_1024x1024.png`), que sugiere un entrenamiento de aproximadamente 1500 pasos con validaciones a 1024x1024 píxeles. No se documenta ningún tipo de ajuste por preferencias (RLHF/DPO), algo por otra parte ajeno a los modelos de difusión de texto a imagen.

## Capacidades

- Generación de imágenes de texto a imagen (text-to-image) condicionada por prompt, ejecutada sobre el pipeline de FLUX.1-dev.
- Personalización de identidad: reproduce el rostro y la apariencia de la persona representada por la palabra de activación `RafaelValente` cuando esta se incluye en el prompt.
- Retratos fotorrealistas: el ejemplo documentado describe un retrato casual de un hombre joven brasileño con barba corta y estética de fotografía realista.
- Composición con el resto del prompt: la palabra de activación puede combinarse con descripciones de escena, iluminación, vestuario y estilo, siguiendo el comportamiento habitual de los LoRA de FLUX.1-dev.
- Compatibilidad con el ecosistema `diffusers` y PEFT, lo que permite cargarlo y descargarlo dinámicamente sobre el modelo base.
- Resolución de trabajo documentada: 1024x1024 píxeles (según la imagen de validación).
- No dispone de *tool calling*, *function calling*, soporte de agentes, razonamiento multi-paso ni modo de pensamiento: son capacidades propias de modelos de lenguaje y no aplican a este artefacto.
- No se documentan capacidades multilingües ni de generación de texto; los codificadores del modelo base procesan los prompts, pero el repositorio no declara idiomas soportados.

## Casos de uso

- Consistencia de personaje en proyectos creativos: usar `RafaelValente` en cada prompt para mantener el mismo rostro a lo largo de una serie de ilustraciones, cómics o storyboards generados con FLUX.1-dev.
- Previsualización de *casting* y pruebas de vestuario: generar variaciones de un mismo retrato con distintos estilos, iluminaciones y ropa antes de una sesión fotográfica real, aprovechando la coherencia de identidad que aporta el LoRA.
- Prototipado de avatares para producto: crear imágenes de perfil coherentes para maquetas de interfaz o demostraciones internas, siempre que se cuente con autorización expresa de la persona retratada.
- Integración en pipelines de generación por lotes con `diffusers`: cargar el LoRA con `pipe.load_lora_weights()` sobre `FluxPipeline` y generar conjuntos de imágenes de forma programática dentro de un servicio o script de automatización.
- Investigación sobre personalización de modelos de difusión: sirve como caso de estudio reproducible para comparar estrategias de fine-tuning de bajo rango sobre FLUX.1-dev frente a DreamBooth, textual inversion u otros métodos.
- Composición de múltiples LoRA: combinarlo con adaptadores de estilo (por ejemplo, iluminación cinematográfica o estética analógica) para estudiar interacciones y conflictos entre adaptadores en un mismo transformer.
- Generación de material editorial ilustrativo: producir retratos de acompañamiento para artículos o publicaciones, sujeto a las restricciones de licencia y a los derechos de imagen de la persona representada.
- Ampliación de datasets sintéticos: generar variaciones controladas de un retrato para entrenar o evaluar modelos de detección facial, con las cautelas éticas y legales correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye FID, CLIP score, comparativas de similitud facial ni evaluaciones de *prompt adherence*. El único artefacto de validación documentado es una imagen de muestra (`images/step_1500_validation_0_1024x1024.png`) y el ejemplo del widget, que no constituyen una evaluación cuantitativa.

## Requisitos de hardware

- Un LoRA no incrementa de forma apreciable los requisitos del modelo base: el adaptador ocupa 0,1 GB y se suma a los pesos del transformer.
- Estimaciones habituales para FLUX.1-dev en bf16/fp16: alrededor de 24 GB de VRAM solo para el transformer, y del orden de 32-33 GB si se cargan simultáneamente transformer, T5-XXL, CLIP y VAE sin optimizaciones.
- Con cuantización NF4 (bitsandbytes) del transformer y T5 en 8 bits, el pipeline completo cabe en el entorno de 12-16 GB de VRAM.
- Con cuantizaciones GGUF (Q4 a Q8) y descarga parcial a CPU, es viable en GPUs de 8-12 GB, a costa de mayor latencia.
- GPUs recomendadas: A100 80 GB, H100 80 GB o L40S para servicio en producción sin cuantizar; RTX 4090, RTX 3090 o RTX A6000 (24 GB) para uso en bf16 con margen; RTX 4080/4070 Ti Super (16 GB) y RTX 4060 Ti 16 GB con cuantización; GPUs de 8-12 GB solo con GGUF y offloading.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 sin cuantización y en tarjetas de 8-16 GB con cuantización.
- Opciones de despliegue: `diffusers` con PEFT, ComfyUI, SwarmUI, InvokeAI, Stable Diffusion WebUI Forge, SD.Next, y endpoints gestionados que soporten FLUX.1-dev; también se puede exportar a un checkpoint fusionado, aunque no se documenta en el repositorio.
- Latencia y throughput: no disponibles en la información del repositorio. Como referencia del modelo base, la generación a 1024x1024 con 20-30 pasos suele situarse en el orden de pocos segundos por imagen en una RTX 4090 y en torno a uno o dos segundos en una H100; son cifras orientativas del modelo base, no medidas publicadas por el autor del LoRA.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| loradica/lorarafa | LoRA de identidad sobre FLUX.1-dev | No disponible (adaptador de 0,1 GB; base de 12 000 M) | 1024x1024 documentado | No disponible (base: no comercial) | HuggingFace, 0 descargas |
| FLUX.1-dev (base) | Transformer de difusión MMDiT, flujo rectificado | 12 000 M | 1024x1024 y resoluciones derivadas | FLUX.1 [dev] Non-Commercial License | HuggingFace, muy extendido |
| FLUX.1-schnell | Transformer de difusión destilado, 1-4 pasos | 12 000 M | 1024x1024 | Apache 2.0 | HuggingFace, muy extendido |
| SDXL + LoRA de identidad | U-Net de difusión con adaptadores LoRA | 3 500 M (base) | 1024x1024 | CreativeML Open RAIL++-M | Ecosistema maduro, multitud de adaptadores |

No se dispone de datos de rendimiento comparado (similitud facial, adherencia al prompt ni fidelidad de identidad) que permitan contrastar `lorarafa` con otros LoRA de identidad; la comparación anterior se limita a características estructurales y de licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No hay evaluación de sesgos demográficos, de género, de tono de piel ni de edad para este adaptador; los sesgos heredados del dataset de entrenamiento de FLUX.1-dev no están caracterizados en el repositorio.
- Riesgo de alucinación: en modelos de difusión se traduce en artefactos y desviaciones anatómicas (manos, dientes, orejas o accesorios mal formados) y en una fidelidad imperfecta del rostro cuando el prompt se aleja del dominio de entrenamiento.
- El adaptador está especializado en un único sujeto: fuera del contexto de retrato y de la palabra `RafaelValente` su efecto sobre la generación es impredecible y puede degradar la calidad respecto al modelo base.
- Limitaciones de contexto e idioma: no se declaran idiomas soportados ni comportamiento con prompts en castellano; el ejemplo documentado está en inglés, y los LoRA de este tipo suelen tener mejor rendimiento si el prompt replica el estilo y la estructura del `instance_prompt`.
- Riesgo de sobreajuste: con un único prompt de instancia documentado no puede verificarse la generalización a poses, encuadres o iluminaciones distintos de los vistos en el entrenamiento.
- Restricciones de licencia: el repositorio no declara licencia. Al ser un derivado de FLUX.1-dev, es razonable asumir que se aplican los términos de la FLUX.1 [dev] Non-Commercial License, que prohíbe el uso comercial del modelo y de sus derivados. Cualquier uso comercial requiere verificación legal previa; no hay confirmación del autor sobre este punto.
- Derechos de imagen: el modelo reproduce la apariencia de una persona identificada como Rafael Valente. Su uso sin consentimiento explícito puede infringir derechos de imagen, normativa de protección de datos (RGPD) y legislación sobre *deepfakes*; no se documenta autorización alguna.
- Madurez del artefacto: cero descargas y cero likes, creado en septiembre de 2026, sin historial de uso ni mantenimiento, sin métricas y con documentación mínima. No es adecuado como dependencia de producción sin una validación propia.
- Reproducibilidad: al desconocerse el dataset, los hiperparámetros y el pipeline exacto de entrenamiento, el resultado no es reproducible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/loradica/lorarafa
- Archivos del repositorio: https://huggingface.co/loradica/lorarafa/tree/main
- Modelo base FLUX.1-dev: https://huggingface.co/black-forest-labs/FLUX.1-dev
- Repositorio oficial de FLUX (código de inferencia): https://github.com/black-forest-labs/flux
- Anuncio y documentación de FLUX.1: https://blackforestlabs.ai/announcing-black-forest-labs/
- Documentación de `FluxPipeline` en diffusers: https://huggingface.co/docs/diffusers/api/pipelines/flux
- Documentación de carga de LoRA en diffusers: https://huggingface.co/docs/diffusers/using-diffusers/loading_adapters
- Licencia FLUX.1 [dev] (no comercial): https://huggingface.co/black-forest-labs/FLUX.1-dev/blob/main/LICENSE.md

Nota: la búsqueda web asociada a esta ficha no devolvió resultados relevantes sobre el modelo; los enlaces anteriores proceden de la información del repositorio y de la documentación del modelo base. No se han localizado papers, blogs ni demos específicos de `loradica/lorarafa`.
