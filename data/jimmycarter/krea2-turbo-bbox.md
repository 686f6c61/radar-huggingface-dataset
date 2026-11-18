# jimmycarter/krea2-turbo-bbox

## Resumen

krea2-turbo-bbox es un fine-tune del modelo de difusión text-to-image Krea-2-Raw, desarrollado por el usuario jimmycarter y publicado en Hugging Face. Su propósito específico es el control de composición espacial ("layout control"): generar viñetas de cómic multipanel, bocadillos de diálogo que caen dentro de su panel, coherencia de identidad de personaje entre paneles y texto colocado exactamente donde se solicita. No es un modelo de lenguaje ni un modelo multimodal de comprensión: es un pipeline de difusión para generación de imágenes.

El modelo se distribuye en seis variantes de pesos dentro del mismo repositorio: la versión Turbo (destilada desde Krea-2-Turbo, muestreo en 8 pasos sin CFG) y la versión Raw (sobre Krea-2-Raw, muestreo en 50 pasos con CFG 5.5), cada una con sus pesos principales y dos sombras EMA (decaimiento 0.9995 y 0.99975). El checkpoint final corresponde a `epoch-20-step-104548`, tras 20 épocas de entrenamiento. El repositorio ocupa 1101 GB, lo que refleja la acumulación de todas las variantes y EMA en formato safetensors.

La relevancia de este modelo reside en su enfoque de condicionamiento: aproximadamente el 90 % del entrenamiento utilizó un DSL compacto de grounding en texto plano que especifica paneles, personajes y texto literal mediante cajas `[x0,y0,x1,y1]` sobre una rejilla de 0 a 1000. Esto lo convierte en una herramienta poco habitual para generación de cómics e ilustración editorial con control geométrico explícito, frente a los modelos text-to-image convencionais que dependen de prosa descriptiva.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión text-to-image (familia Krea-2, pipeline diffusers); detalles internos del transformer no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no aplica a difusión; el condicionamiento es por prompt) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors sin indicación de variantes cuantizadas) |
| Idiomas soportados | no disponible (el prompt DSL es en inglés; el texto renderizado en imagen depende del prompt) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería diffusers) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de la familia Krea-2, construido sobre `krea/Krea-2-Raw` como modelo base. La arquitectura subyacente es la de un pipeline de difusión text-to-image de la librería diffusers; la model card no detalla la configuración interna del transformer (número de capas, dimensión oculta, mecanismo de atención). El entrenamiento se realizó durante 20 épocas hasta el paso 104548, y el repositorio incluye dos sombras EMA con decaimientos 0.9995 y 0.99975, lo que sugiere que el autor priorizó estabilidad de pesos y comparación entre ventanas de media móvil.

La innovación técnica central es el régimen de condicionamiento: cerca del 90 % del entrenamiento empleó un DSL de grounding en texto plano con sintaxis propia. Las primitivas documentadas incluyen `p` (panel), `o` (objeto), `t` (texto), `pe`/`ac`/`fc` (persona, personaje anime, personaje furry), todas con coordenadas en orden `[x0,y0,x1,y1]` sobre una rejilla 0–1000. El 10 % restante usó prosa convencional, de modo que los prompts descriptivos siguen funcionando, aunque con menor control posicional. La variante Turbo se obtiene por fusión aritmética de pesos: `turbo = finetune + (Krea-2-Turbo - Krea-2-Raw)`, técnica de destilación por delta que permite muestreo en 8 pasos sin classifier-free guidance. La variante Raw conserva el comportamiento del fine-tune sin destilar, con 50 pasos y CFG 5.5.

## Capacidades

- Generación de imágenes text-to-image con control de layout explícito mediante cajas de coordenadas en rejilla 0–1000.
- Composición multipanel: división de la imagen en paneles (`p[x0,y0,x1,y1]`) con contenido independiente por panel.
- Colocación de texto literal renderizado en la imagen (`t[...]`), incluidos bocadillos de diálogo posicionados dentro de su panel.
- Coherencia de identidad de personaje entre paneles mediante anclaje posicional de personajes (`ac`, `fc`, `pe`).
- Control de objetos individuales dentro de la escena (`o[...]`).
- Modos de muestreo diferenciados: Turbo (8 pasos, CFG off) para iteración rápida y Raw (50 pasos, CFG 5.5) para calidad máxima.
- Selección entre pesos principales y sombras EMA para comparar estabilidad de salida.
- Soporte de prompts en prosa convencional además del DSL (aproximadamente 10 % del entrenamiento).
- No dispone de tool calling, function calling, capacidades de agente, visión de entrada, audio ni modo de razonamiento: es exclusivamente generación de imagen a partir de texto.

## Casos de uso

- Generación de tiras y páginas de cómic: el DSL permite definir paneles con coordenadas exactas y asignar a cada uno personajes y texto, de modo que una página de cuatro viñetas se genera en una sola pasada con la composición solicitada, en lugar de componerla manualmente en un editor.
- Ilustración editorial con texto integrado: portadas de revista, carteles y infografías donde el titular debe caer en una zona concreta de la imagen; la primitiva `t` con caja explícita evita el reposicionamiento posterior en Photoshop.
- Storyboarding para producción audiovisual: generar frames de referencia con encuadres y disposición de elementos definidos por cajas, útiles para comunicar planos a un equipo antes del rodaje.
- Maquetación de material promocional multipanel: dípticos, trípticos y flyers donde cada sección requiere contenido distinto y texto propio, aprovechando la división por `p`.
- Iteración rápida de conceptos visuales: la variante Turbo con 8 pasos y CFG off permite barridos de muchas variaciones en poco tiempo, útil para explorar direcciones de arte antes de fijar una y renderizar en Raw a 50 pasos.
- Generación de viñetas para libros infantiles o material didáctico: personajes recurrentes ancorados por caja mantienen identidad visual entre ilustraciones de una misma serie.
- Pruebas A/B de composición: al disponer de pesos principales y dos EMA en el mismo repositorio, se pueden comparar salidas con idéntica semilla y sampler para decidir qué conjunto de pesos produce composiciones más fieles al layout pedido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye únicamente imágenes de muestra comparativas (modelo stock, fine-tune y sus dos EMA) para prompts concretos, sin métricas numéricas como FID, CLIP score o precisión de grounding.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio completo ocupa 1101 GB, pero eso incluye seis conjuntos de pesos (Turbo, Raw y cuatro EMA); una sola variante cargada ocupará una fracción de ese tamaño, que no se detalla en la información proporcionada.
- GPU recomendadas: no disponible. La model card no especifica requisitos de memoria ni GPUs probadas.
- Compatibilidad con GPU de consumo: no disponible. Al tratarse de un pipeline diffusers de la familia Krea-2, la viabilidad en GPU de consumo depende del tamaño real del transformer, dato no publicado aquí.
- Opciones de despliegue: la librería declarada es diffusers, por lo que el despliegue natural es mediante `DiffusionPipeline` de Hugging Face. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje, no aplicables directamente a este pipeline de difusión).
- Latencia y throughput: no disponible. Únicamente se conocen los regímenes de muestreo: 8 pasos sin CFG para Turbo y 50 pasos con CFG 5.5 para Raw, lo que implica que Turbo es aproximadamente seis veces más rápido en número de evaluaciones del modelo, sin datos de tiempo absoluto.

## Comparativa con modelos similares

| Modelo | Tipo | Control de layout | Pasos de muestreo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| krea2-turbo-bbox | Fine-tune de difusión (Krea-2) | DSL con cajas 0–1000 | 8 (Turbo) / 50 (Raw) | no disponible | Hugging Face, diffusers |
| krea/Krea-2-Raw | Modelo base de difusión | Solo prosa | no disponible en la información | no disponible | Hugging Face |
| krea/Krea-2-Turbo | Modelo base destilado | Solo prosa | no disponible en la información | no disponible | Hugging Face |

La información proporcionada solo permite comparar con los dos modelos de la familia Krea-2 citados como base y origen del delta de destilación. No se dispone de datos sobre alternativas de otras familias con control de layout por cajas, ni de parámetros, contexto o rendimiento medido de ninguno de los tres, por lo que la comparación cuantitativa queda como no disponible.

## Limitaciones y advertencias

- El orden de coordenadas es `[x0,y0,x1,y1]` (x primero). Invertirlo produce fallos silenciosos: la imagen se genera sin error aparente pero con la composición equivocada.
- El DSL de grounding concentra aproximadamente el 90 % del entrenamiento; los prompts en prosa funcionan, pero con control posicional mucho menor.
- La licencia no está declarada en la información disponible, lo que impide evaluar el uso comercial. Debe verificarse antes de cualquier despliegue en producción.
- Los idiomas soportados no están declarados; el DSL está documentado en inglés y no hay evidencia de robustez multilingüe en el condicionamiento.
- No hay datos publicados de benchmarks, sesgos, tasas de alucinación visual ni precisión de grounding medido, por lo que la fiabilidad en producción no puede cuantificarse a partir de la información disponible.
- El repositorio de 1101 GB incluye seis conjuntos de pesos; descargar el repo completo es costoso en almacenamiento y ancho de banda, y conviene seleccionar solo la subcarpeta de la variante deseada.
- La variante Turbo depende de una fusión aritmética con Krea-2-Turbo; si el modelo base cambia de versión, la reproducibilidad del delta de destilación puede verse afectada.
- La generación de texto renderizado dentro de la imagen, aunque es una capacidad central, no viene acompañada de métricas de precisión tipográfica; en producciones con texto crítico se recomienda verificación manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jimmycarter/krea2-turbo-bbox
- Especificación del DSL de prompting: https://huggingface.co/jimmycarter/krea2-turbo-bbox/blob/main/PROMPTING.md
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Modelo de origen del delta de destilación: https://huggingface.co/krea/Krea-2-Turbo
