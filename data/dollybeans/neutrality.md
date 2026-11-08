# dollybeans/NEUTRALITY

## Resumen

NEUTRALITY es un checkpoint de generación de imágenes por texto (text-to-image) publicado por el usuario dollybeans en Hugging Face. Se trata de un model merge, es decir, una fusión de pesos de otros checkpoints, construida sobre OnomaAIResearch/Illustrious-XL-v2.0 como modelo base. Este linaje lo sitúa en la familia de modelos derivados de Stable Diffusion XL orientados a ilustración y estética anime, un ecosistema muy activo en la comunidad de generación de imágenes.

El modelo resuelve el problema habitual de los checkpoints comunitarios: ofrecer un estilo visual concreto y coherente que no se obtiene con el modelo base sin ajustes adicionales. Al ser una fusión de checkpoints, su interés no reside en una arquitectura nueva ni en un entrenamiento desde cero, sino en la combinación de pesos ya entrenados para obtener un comportamiento estilístico particular.

Su relevancia es limitada y muy específica: se publicó en noviembre de 2026, cuenta con cero descargas y cero likes en el momento de la consulta, y su acceso está restringido mediante gated access en Hugging Face. El repositorio ocupa 31,6 GB, un tamaño coherente con un checkpoint SDXL en precisión completa (fp16) que incluye varios componentes. No se dispone de información sobre licencia, idiomas ni especificaciones técnicas detalladas en la documentación proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Stable Diffusion XL vía Illustrious-XL-v2.0; difusión latente texto-a-imagen) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el prompt de texto de SDXL se limita habitualmente a 77 tokens por chunk, dato no confirmado para este modelo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (tamaño del repo de 31,6 GB, compatible con checkpoints de difusión en fp16) |

## Arquitectura y entrenamiento

NEUTRALITY es un model merge: no se ha entrenado desde cero, sino que se han fusionado los pesos de dos o más checkpoints para combinar sus características. Su modelo base declarado es OnomaAIResearch/Illustrious-XL-v2.0, un checkpoint de la familia Illustrious, que a su vez deriva de la arquitectura Stable Diffusion XL (UNet de difusión latente con codificador de texto dual y VAE). La información disponible no detalla qué checkpoints concretos se fusionaron, qué método de merge se empleó (por ejemplo, suma ponderada, SLERP o block merge) ni los pesos o ratios aplicados.

Tampoco se especifican datos de entrenamiento, número de pasos, composición del dataset, ni si hubo ajuste fino posterior a la fusión mediante LoRA, DreamBooth o técnicas similares. No consta información sobre RLHF, DPO ni preferencias humanas, algo por otra parte poco habitual en checkpoints de difusión. La única referencia externa encontrada es una ficha en Tensor.Art que lo describe con las etiquetas "EARLY ACCESS" y "PAINTING" y lo atribuye al usuario algodoncito, lo que sugiere un enfoque estilístico orientado a ilustración y pintura, pero no aporta detalles técnicos verificables.

## Capacidades

- Generación de imágenes a partir de prompts de texto (pipeline text-to-image), según la etiqueta del repositorio.
- Estilización orientada a ilustración y pintura, a partir de las etiquetas de la ficha de Tensor.Art ("PAINTING").
- Herencia de las capacidades del modelo base Illustrious-XL-v2.0, sin que la documentación disponible detalle cuáles se conservan o se modifican.
- Soporte de tool calling / function calling: no disponible (no aplica a un modelo de difusión).
- Soporte de agentes y razonamiento multi-paso: no disponible (no aplica).
- Capacidades multilingües: no disponibles; no se especifican idiomas de prompt soportados.
- Capacidades especiales (modo thinking, visión, audio): no disponibles. No se documenta image-to-image, inpainting ni ControlNet.

## Casos de uso

- Ilustración conceptual: generar bocetos y variaciones de personajes o escenas con una estética de pintura coherente, aprovechando el sesgo estilístico del merge para mantener una dirección visual uniforme en una serie de imágenes.
- Creación de arte para proyectos personales: producir ilustraciones para fan art, cómics amateur o material de rol, un uso típico de los checkpoints comunitarios de la familia Illustrious.
- Exploración de estilo en flujos de trabajo con SDXL: integrar el checkpoint en interfaces como ComfyUI o Automatic1111 para comparar su salida con la del modelo base y decidir si el estilo fusionado encaja en un pipeline existente.
- Prototipado visual rápido: generar referencias de composición, paleta y atmósfera antes de encargar arte final a un ilustrador humano.
- Experimentación con merges: servir como caso de estudio para quienes investigan cómo afectan distintas combinaciones de pesos al estilo final de un checkpoint SDXL.
- Generación de imágenes de referencia para documentación o presentaciones internas, siempre que la licencia (no disponible) lo permita y se verifique antes de cualquier uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Por el tamaño del repositorio (31,6 GB) y su linaje SDXL, es razonable esperar requisitos en el rango de 8-12 GB de VRAM en fp16 con optimizaciones, aunque este dato no está confirmado para este checkpoint concreto.
- GPU recomendadas: no disponibles en la documentación. Para checkpoints SDXL se suelen emplear RTX 3090, RTX 4090, A100 o H100, pero no hay confirmación específica para NEUTRALITY.
- Compatibilidad con GPU de consumo: no confirmada. Los checkpoints SDXL suelen caber en GPUs de consumo de gama alta con cuantización o atención eficiente, pero no se dispone de datos verificados.
- Opciones de despliegue: no disponibles. No se documenta compatibilidad con vLLM (no aplica), llama.cpp (no aplica), Ollama, TGI ni Diffusers; el formato de pesos no se especifica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NEUTRALITY (dollybeans) | no disponible | no disponible | sin benchmarks publicados | no disponible | gated en Hugging Face, 0 descargas |
| OnomaAIResearch/Illustrious-XL-v2.0 | no disponible | no disponible | no disponible en esta ficha | no disponible | modelo base público en Hugging Face |
| Stable Diffusion XL (Stability AI) | no disponible en esta ficha | no disponible | benchmarks públicos de la familia SDXL | licencia de Stability AI (verificar) | público |

La comparación cuantitativa no es posible con la información disponible: no hay datos de parámetros, contexto ni benchmarks para NEUTRALITY, y la ficha no incluye cifras verificadas de los modelos alternativos. La diferencia principal observable es de naturaleza y disponibilidad: NEUTRALITY es un merge comunitario con acceso restringido y sin tracción, mientras que Illustrious-XL-v2.0 y SDXL son checkpoints de referencia ampliamente distribuidos.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face, lo que puede bloquear automatizaciones y descargas desatendidas.
- Licencia no disponible: no se puede verificar si el uso comercial está permitido. Antes de cualquier despliegue en producción es imprescindible consultar las condiciones del modelo base y del propio merge.
- Trazabilidad incompleta: al ser un merge sin documentación de los checkpoints fusionados ni del método empleado, es difícil reproducir el modelo o auditar sus componentes.
- Sin datos de evaluación: no hay benchmarks, comparativas ni ejemplos publicados que permitan estimar su calidad frente al modelo base.
- Riesgo de sesgos y alucinación visual: como todo modelo de difusión, puede generar anatomía incorrecta, texto ilegible en la imagen, artefactos y estereotipos aprendidos del dataset de entrenamiento original.
- Idiomas no especificados: se desconoce qué lenguas acepta el codificador de texto y con qué calidad; los prompts en castellano podrían rendir peor que en inglés.
- Adopción nula: cero descargas y cero likes en el momento de la consulta, sin señales de validación por parte de la comunidad.
- Fecha de creación futura respecto a los datos habituales de referencia (noviembre de 2026): conviene verificar la vigencia de la ficha y del repositorio antes de confiar en ella.

## Enlaces

- Hugging Face: https://huggingface.co/dollybeans/NEUTRALITY
- Modelo base: https://huggingface.co/OnomaAIResearch/Illustrious-XL-v2.0
- Ficha en Tensor.Art: https://tensor.art/models/1063825047577206909
