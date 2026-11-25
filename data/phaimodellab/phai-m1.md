# PhaiModelLab/Phai-M1

## Resumen

Phai-M1 es un modelo de generación de vídeo desarrollado por PhaiModelLab, obtenido mediante *supervised fine-tuning* (SFT) a partir del modelo base LTX-2.5 de Lightricks. Se trata, por tanto, de un modelo de difusión especializado en creación de contenido audiovisual condicionado, no de un modelo de lenguaje. El post-entrenamiento cubre tres tareas: razonamiento visual (VR), imagen-a-vídeo (I2V) y texto-a-vídeo (T2V), con un total de más de 150 horas de clips de vídeo.

El modelo pone el foco en estilos visuales donde el base LTX-2.5 era más débil, enriqueciendo los conjuntos de datos de I2V y T2V con animación 2D y 3D china y CG estilizado. La distribución de tareas del entrenamiento es aproximadamente 20% VR, 30% I2V y 50% T2V. El repositorio ocupa 127,2 GB, lo que es coherente con los pesos en bf16 de un transformer de difusión de gran tamaño.

La relevancia de Phai-M1 radica en que no se distribuye como modelo independiente, sino como un reemplazo directo de los pesos `diffusion_models` dentro de un pipeline existente de LTX-2.5, lo que simplifica su adopción para quien ya tenga desplegado el modelo base. La licencia y condiciones de uso heredan las del modelo base LTX-2.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (base LTX-2.5); post-entrenamiento por SFT |
| Parametros totales | 22B (segun el nombre de fichero `Phai-M1-22b-dev-transformer-bf16.safetensors`) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo de generacion de video, no de texto) |
| Tipos de cuantizacion | bf16 (pesos distribuidos en bf16); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible (prompts de texto; ejemplos en ingles) |
| Licencia | La misma que el modelo base LTX-2.5 (ver LICENSE); no se especifica el tipo exacto |
| Formato de pesos | safetensors (`Phai-M1-22b-dev-transformer-bf16.safetensors`) |

## Arquitectura y entrenamiento

Phai-M1 es un modelo de difusión para generación de vídeo derivado de LTX-2.5. No se documenta en la información disponible la arquitectura interna detallada del base (tipo de atención, mecanismo de difusión, VAE, etc.), más allá de que se trata de un transformer de difusión de 22B parámetros en bf16. El post-entrenamiento consiste en SFT supervisado sobre clips de vídeo que suman más de 150 horas, organizados en tres categorías de tarea: razonamiento visual (20%), imagen-a-vídeo (30%) y texto-a-vídeo (50%).

La estrategia de datos incide en estilos donde el base era más débil: animación 2D y 3D china y CG estilizado, con enriquecimiento no solo de sujetos sino también de lenguaje de diseño, textura de renderizado, paletas de color y expresión cinematográfica. El autor advierte explícitamente que estas son áreas de soporte previstas en el diseño de datos, no afirmaciones de mejoras de rendimiento medidas. No se documentan detalles sobre RLHF/DPO ni innovaciones técnicas adicionales.

## Capacidades

- Generación de vídeo a partir de texto (T2V), con descripciones textuales como condición.
- Generación de vídeo a partir de imagen (I2V), extendiendo contenido visual estático a secuencias dinámicas.
- Razonamiento visual (VR) como tarea de post-entrenamiento.
- Cobertura reforzada de estilos: animación 2D y 3D china y CG estilizado.
- Sustitución directa de los pesos `diffusion_models` en pipelines de LTX-2.5 existentes.
- Mejora de resultados con prompts de alta calidad; el autor proporciona instrucciones de mejora de prompts para combinar con un LLM.
- Soporte de tool calling, agentes, multi-step reasoning, visión, audio o thinking mode: no disponible (no es un modelo de lenguaje).

## Casos de uso

- Producción de animación 2D/3D china: el modelo ha sido entrenado específicamente con ejemplos de este estilo, por lo que se usa para generar clips con estética coherente con ese tipo de animación a partir de prompts o imágenes de referencia.
- Creación de vídeo publicitario con CG estilizado: el enriquecimiento en CG permite generar planos con lenguaje de diseño y paletas de color controladas, útil para piezas de marca.
- Extensión de ilustraciones a vídeo (I2V): a partir de una imagen de referencia se generan secuencias dinámicas, útil para animar keyframes o storyboards.
- Generación de vídeo desde guion textual (T2V): para previsualización rápida de escenas descritas en texto, con prompts enriquecidos mediante las instrucciones del autor.
- Previsualización de planos cinematográficos: los ejemplos de la model card incluyen planos aéreos continuos y primeros planos con detalle de iluminación y sonido ambiente descritos, lo que encaja con previsualización de secuencias.
- Integración en pipelines existentes de LTX-2.5: al sustituir únicamente los pesos del transformer de difusión, se puede adoptar sin rehacer la infraestructura de inferencia ya montada para el base.
- Iteración de estilo con comparativas base vs. fine-tune: los pares de vídeos de muestra (LTX-2.5 frente a Phai-M1) permiten evaluar la mejora en estilos concretos antes de desplegar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye únicamente comparativas cualitativas mediante pares de vídeos (LTX-2.5 frente a Phai-M1) para cuatro muestras, sin métricas numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Los pesos son de 22B parámetros en bf16, lo que implica aproximadamente 44 GB solo para los pesos del transformer de difusión, además de los componentes adicionales del pipeline (VAE, text encoder, etc.).
- GPU recomendadas: no disponible en la información proporcionada; por el tamaño en bf16 se requiere hardware de clase profesional con memoria suficiente (A100/H100 de 80 GB o superiores son el rango habitual para este tamaño, aunque el autor no lo confirma).
- ¿Cabe en GPU de consumo? No confirmado. Con 22B en bf16 no cabe en GPUs de consumo de 24 GB sin cuantización, y no se documentan cuantizaciones alternativas.
- Opciones de despliegue: el autor indica que se integra en cualquier pipeline que use LTX-2.5, sustituyendo los pesos de `diffusion_models`. No se detallan herramientas concretas (ComfyUI, vLLM, etc.) en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phai-M1 | 22B | no disponible | T2V, I2V, VR (fine-tune) | La de LTX-2.5 | Hugging Face (pesos bf16) |
| LTX-2.5 (base) | 22B | no disponible | T2V, I2V, VR | LTX-2.5 | Hugging Face (Lightricks/LTX-2.5) |
| Alternativas de generacion de video | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa más directa es con el propio modelo base LTX-2.5, del que Phai-M1 hereda arquitectura y licencia. No se dispone de datos de rendimiento numérico que permitan una comparación cuantitativa con otros modelos de generación de vídeo.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no soporta tool calling, agentes, razonamiento multi-step textual ni thinking mode.
- El autor advierte que el enriquecimiento de estilos es un área de soporte prevista en el diseño de datos, no una mejora de rendimiento medida; no hay benchmarks que respalden las afirmaciones cualitativas.
- La licencia y condiciones de uso son las de LTX-2.5; es imprescindible revisar el fichero LICENSE del modelo base antes de cualquier uso comercial.
- Dependencia del base: requiere descargar por separado los componentes de Lightricks/LTX-2.5 (excluyendo `diffusion_models`) para disponer del modelo completo.
- Sesgos conocidos: no disponible. Al estar entrenado con datos enriquecidos con animación china y CG, puede presentar sesgos estilísticos hacia esas estéticas.
- Riesgo de alucinación visual y artefactos de generación: no cuantificado en la información disponible.
- Idiomas soportados para los prompts: no disponible; los ejemplos de la model card están en inglés.
- No hay información sobre cuantizaciones alternativas ni requisitos mínimos de hardware confirmados.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica validación comunitaria muy limitada.

## Enlaces

- Hugging Face: https://huggingface.co/PhaiModelLab/Phai-M1
- Modelo base LTX-2.5: https://huggingface.co/Lightricks/LTX-2.5
- Demo online: https://phai.phanthy.com/console
- Instrucciones de mejora de prompts (en el repo): `prompt_enhancement/enhancement_instructions.md`
- Licencia (en el repo): `LICENSE`
