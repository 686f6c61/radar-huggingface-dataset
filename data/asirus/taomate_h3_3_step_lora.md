# Asirus/TaoMate_H3_3_Step_LoRA

## Resumen

TaoMate-H3 3-Step LoRA es un adaptador de bajo rango (LoRA) para el modelo MiniMax-H3 de MiniMaxAI, especializado en generación de vídeo y audio a partir de texto. El adaptador original fue desarrollado por el equipo TaoLive AIGC de Alibaba y posteriormente convertido por Asirus para su uso directo en ComfyUI. Su principal aportación es permitir la generación de vídeo con audio en solo 3 pasos de inferencia, en lugar de los 4 pasos del enfoque Turbo 4-step v1.2.

El modelo se distribuye en dos variantes: MAXQUALITY en BF16 y LIGHT en FP16, ambas con un tamaño de 1.2 GB y un rango LoRA de 128. Según los benchmarks proporcionados, el adaptador es aproximadamente un 21-27% más rápido que Turbo 4-step manteniendo una calidad similar o superior. Está diseñado para funcionar con la versión FL2VA de MiniMax-H3 y se integra en el ecosistema de ComfyUI, lo que facilita su adopción en flujos de trabajo de generación audiovisual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre MiniMax-H3 |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de vídeo; no aplica) |
| Tipos de cuantizacion | BF16 (MAXQUALITY), FP16 (LIGHT) |
| Idiomas soportados | No disponible |
| Licencia | MiniMax H3 Community License |
| Formato de pesos | safetensors |
| Modelo base | MiniMaxAI/MiniMax-H3 |
| Pipeline | text-to-video |
| Biblioteca | ComfyUI |
| Rango LoRA | 128 |
| Tamaño del repositorio | 2.5 GB |
| Tamaño de cada archivo | 1.2 GB |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 128 que se aplica sobre el modelo MiniMax-H3, un modelo de generación de vídeo y audio. La conversión realizada por Asirus no incluye fine-tuning ni fusión con el modelo base; solo se renombraron las claves de los pesos (de `blocks.*.lora_a / lora_b` a `diffusion_model.blocks.*.lora_down.weight / lora_up.weight`), se añadió el prefijo `diffusion_model.` y se convirtió la precisión a BF16 y FP16. No se han publicado datos sobre el proceso de entrenamiento del LoRA original ni sobre la composición del dataset utilizado.

La innovación principal es la reducción del número de pasos de inferencia de 4 a 3, manteniendo una calidad comparable. Los ajustes recomendados son 3 pasos, CFG 1.0, sampler `euler` o `er_sde`, scheduler `simple`, strength entre 0.9 y 1.0, video shift de 8 a 12 y audio shift de 3. Funciona mejor con la versión FL2VA de MiniMax-H3.

## Capacidades

- Generación de vídeo y audio sincronizados a partir de texto (text-to-video).
- Inferencia en 3 pasos, frente a los 4 pasos de Turbo 4-step v1.2.
- Dos variantes de precisión: MAXQUALITY (BF16) y LIGHT (FP16).
- Compatibilidad nativa con ComfyUI.
- Parámetros de configuración específicos para el modo 3-step: CFG 1.0, sampler euler o er_sde, scheduler simple, strength 0.9-1.0, video shift 8-12 y audio shift 3.
- Optimizado para la versión FL2VA de MiniMax-H3.
- Generación de vídeos de hasta 5 segundos de duración y 1 MP de resolución en los benchmarks publicados.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso, ya que es un modelo de generación audiovisual.

## Casos de uso

- Creación de clips para redes sociales: el adaptador permite generar vídeo con audio en 3 pasos, reduciendo el tiempo de producción en un 21-27% frente a Turbo 4-step. Es adecuado para producir contenido corto para plataformas como TikTok o Instagram de forma rápida y local.
- Prototipado rápido en estudios de animación: al integrarse en ComfyUI, permite iterar sobre prompts y ajustes de vídeo con una latencia menor, ideal para previsualizar escenas antes de un render final más costoso.
- Generación de contenido audiovisual en local con GPUs modestas: con 6-8 GB de VRAM se puede ejecutar tanto la versión LIGHT como la MAXQUALITY, lo que permite trabajar sin depender de servicios en la nube.
- Evaluación comparativa de velocidad y calidad: se puede usar junto con Turbo 4-step v1.2 para comparar tiempos de generación y calidad visual, utilizando los benchmarks de la model card como referencia (mismo prompt, 5 segundos, 1 MP).
- Integración en flujos de trabajo de ComfyUI para artistas: los usuarios de ComfyUI pueden cargar el LoRA como adaptador sobre MiniMax-H3 y aplicar los ajustes recomendados para generar vídeos con audio de forma controlada.
- Generación de vídeos cortos para educación o marketing: la capacidad de producir vídeo y audio sincronizados en 5 segundos a 1 MP es adecuada para demos, anuncios o material explicativo que requiera una producción rápida.
- Uso en entornos con restricciones de tiempo: cuando se necesita una respuesta casi inmediata, el modo de 3 pasos reduce la latencia, lo que resulta útil en aplicaciones interactivas o de generación en tiempo real.

## Benchmarks y rendimiento

Los benchmarks publicados se realizaron con el mismo prompt, una duración de 5 segundos y una resolución de 1 MP. No se han publicado resultados en benchmarks de texto como MMLU o HumanEval, ya que el modelo está orientado a la generación de vídeo.

| Configuración | Pasos | Tiempo de generación (6 GB VRAM) | Tiempo de generación (16 GB VRAM) |
|---|---|---|---|
| FL2VA pruned int8 + Turbo 4-step v1.2 | 4 | 474.30 s | 130.51 s |
| FL2VA pruned int8 + TaoMate MAXQUALITY | 3 | 373.22 s | 102.81 s |
| FL2VA pruned int8 + TaoMate LIGHT | 3 | 380.59 s | 104.84 s |

El adaptador TaoMate 3-step es aproximadamente un 21-27% más rápido que Turbo 4-step, manteniendo una calidad similar o mejor según la comparación visual incluida en la model card.

## Requisitos de hardware

- VRAM mínima estimada: 6-8 GB para ambas versiones, siendo preferible MAXQUALITY en ese rango.
- Para 10 GB de VRAM o superior, se recomienda utilizar la variante MAXQUALITY_bf16.
- No se especifican modelos concretos de GPU, pero se puede ejecutar en tarjetas de consumo con 6-8 GB de VRAM (por ejemplo, RTX 2060, RTX 3060, RTX 4060) y en GPUs con 16 GB (RTX 4080, A4000).
- Opciones de despliegue: ComfyUI es la plataforma principal, ya que el adaptador está convertido específicamente para esta biblioteca.
- Latencia estimada: según los benchmarks, la generación con MAXQUALITY tarda 373.22 s en 6 GB VRAM y 102.81 s en 16 GB VRAM para un vídeo de 5 segundos a 1 MP.

## Comparativa con modelos similares

| Modelo | Pasos | Precisión | Tamaño | Tiempo (6 GB VRAM) | Tiempo (16 GB VRAM) | Licencia |
|---|---|---|---|---|---|---|
| TaoMate-H3 3-Step LoRA (MAXQUALITY) | 3 | BF16 | 1.2 GB | 373.22 s | 102.81 s | MiniMax H3 Community |
| TaoMate-H3 3-Step LoRA (LIGHT) | 3 | FP16 | 1.2 GB | 380.59 s | 104.84 s | MiniMax H3 Community |
| Turbo 4-step v1.2 | 4 | No disponible | No disponible | 474.30 s | 130.51 s | No disponible |

El modelo original del que deriva este adaptador es TaoLiveAIGC/TaoMate-H3, también bajo la licencia MiniMax H3 Community License. No se dispone de información sobre otros modelos comparables de la misma categoría más allá de Turbo 4-step v1.2.

## Limitaciones y advertencias

- Los idiomas soportados no se especifican en la documentación, lo que limita su uso en aplicaciones multilingües.
- No se han publicado métricas de calidad objetivas más allá de los tiempos de generación; la comparación de calidad se basa en vídeos de muestra.
- El repositorio presenta 0 descargas, lo que sugiere una adopción limitada o un lanzamiento reciente.
- La licencia MiniMax H3 Community License puede imponer restricciones de uso comercial; es necesario revisar los términos en el enlace del modelo base.
- El adaptador está diseñado específicamente para ComfyUI y la versión FL2VA de MiniMax-H3; puede requerir conversiones adicionales para otros frameworks.
- No se proporcionan datos sobre el entrenamiento del LoRA ni sobre los datos utilizados, lo que dificulta evaluar posibles sesgos.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/Asirus/TaoMate_H3_3_Step_LoRA
- Modelo original: https://huggingface.co/TaoLiveAIGC/TaoMate-H3
- Modelo base MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia MiniMax H3 Community License: https://huggingface.co/MiniMaxAI/MiniMax-H3
