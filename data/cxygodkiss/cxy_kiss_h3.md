# CxyGodKiss/cxy_kiss_h3

## Resumen
Cxy Kiss H3 es un LoRA (Low-Rank Adaptation) para generacion de video, publicado en HuggingFace por el usuario CxyGodKiss. No se trata de un modelo de lenguaje ni de un modelo de difusion completo, sino de un adaptador ligero (aproximadamente 0,6 GB de tamano de repositorio) disenado para funcionar sobre el modelo base MiniMax H3. Su proposito es muy especifico: mejorar la representacion de interacciones de beso en videos generados por IA, incluyendo besos apasionados e interacciones mas naturales entre dos personajes.

El autor indica que ha sido baneado de Civitai por motivos que desconoce, y que esta cuenta de HuggingFace es actualmente su unica fuente oficial de publicacion, pidiendo expresamente que nadie resuba sus modelos a Civitai. Esto es relevante para quien quiera seguir su trabajo: las futuras versiones se publicaran solo aqui.

El modelo es relevante para la comunidad de generacion de video con ComfyUI, ya que los LoRA de accion especifica permiten controlar gestos e interacciones que los modelos base suelen representar de forma inconsistente. No se dispone de informacion sobre arquitectura del adaptador (rank, alpha), datos de entrenamiento ni benchmarks.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) para modelo de video |
| Parametros totales | no disponible (tamano del repo: 0,6 GB) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de video, no textual) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (archivos de LoRA, probablemente safetensors) |

## Arquitectura y entrenamiento
Se trata de un LoRA de video, es decir, un adaptador con matrices de bajo rango que se aplica a los pesos del modelo base MiniMax H3 durante la inferencia, sin modificar el modelo original. Esta tecnica permite especializar el comportamiento del modelo base con un coste de almacenamiento minimo (0,6 GB frente a los multiples gigabytes del modelo completo) y con la posibilidad de activarlo o desactivarlo dinamicamente en el workflow.

Sobre el entrenamiento no hay datos publicados: no se ha especificado el numero de pasos, el dataset utilizado, la resolucion de entrenamiento ni el rank del LoRA. La model card se limita a describir el objetivo del adaptador (acciones de beso e interacciones entre dos personajes) y la configuracion de uso recomendada.

## Capacidades
- Generacion de acciones de beso en videos generados por IA, con dos variantes descritas: besos apasionados e interacciones mas naturales entre dos personajes.
- Compatibilidad con workflows de ComfyUI mediante un workflow compatible con MiniMax H3.
- Control de intensidad del efecto mediante la fuerza del LoRA (rango recomendado: 0,5 a 1,0).
- No es un modelo de lenguaje: no genera texto, no razona, no ejecuta codigo y no soporta tool calling ni agentes.

## Casos de uso
- Animacion de personajes para cortometrajes generativos: al aplicar el LoRA sobre MiniMax H3 en ComfyUI, se pueden generar escenas de interaccion romantica entre dos personajes con mayor consistencia que con el modelo base, que suele deformar este tipo de contactos fisicos.
- Storyboards y previsualizacion narrativa: un director o guionista puede previsualizar escenas de intimidad romantica de un guion antes del rodaje, ajustando la fuerza del LoRA (0,5 para resultados sutiles, 1,0 para accion mas marcada).
- Creacion de contenido para novelas visuales o juegos indie: generacion de clips de transiciones romanticas entre personajes sin necesidad de animadores.
- Produccion de trailers y teasers de bajo presupuesto: equipos pequenos pueden producir planos de interaccion emocional entre personajes sin sesiones de captura de movimiento.
- Investigacion en control fino de movimiento en video: el LoRA sirve como ejemplo de especializacion de modelos de video en acciones concretas, util para estudiar como los adaptadores de bajo rango modifican la dinamica temporal.
- Generacion de assets para anuncios orientados a sectores romantico o de celebraciones (bodas, San Valentin), donde las interacciones de beso son un elemento visual recurrente.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible para el LoRA en si; depende del modelo base MiniMax H3, que al ser un modelo de video suele requerir GPUs con memoria elevada (se recomienda verificar los requisitos del checkpoint base).
- GPU recomendadas: no disponible; en la practica, los modelos de video de este tipo suelen ejecutarse en GPUs con 24 GB de VRAM o mas (RTX 4090, A100, H100).
- Consumer GPUs: el LoRA (0,6 GB) cabe sin problema en cualquier GPU moderna; el cuello de botella es el modelo base, no el adaptador.
- Despliegue: ComfyUI con un workflow compatible con MiniMax H3, segun la propia model card. No se mencionan soportes para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un LoRA de video).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
| Aspecto | Cxy Kiss H3 | Otros LoRA de accion para MiniMax H3 | Modelos base de video (MiniMax H3) |
|---|---|---|---|
| Tipo | LoRA de video (accion de beso) | no disponible | Modelo completo de generacion de video |
| Tamano | 0,6 GB | no disponible | no disponible |
| Requiere modelo base | Si (MiniMax H3) | Si | No |
| Licencia | Apache 2.0 | no disponible | no disponible |
| Disponibilidad | HuggingFace (autor baneado de Civitai) | no disponible | no disponible |

No se conocen otros LoRA comparables publicados con datos verificables, por lo que la comparativa se limita a lo indicado.

## Limitaciones y advertencias
- Los resultados varian significativamente segun el modelo base, el workflow, los prompts y la configuracion de muestreo, tal como advierte el propio autor en la model card.
- No hay documentacion tecnica del entrenamiento (dataset, rank, alpha, pasos), lo que dificulta evaluar la calidad y reproducibilidad del adaptador.
- El autor ha sido baneado de Civitai y pide que sus modelos no se resuban alli; hay que respetar esa peticion y descargar solo desde su cuenta oficial de HuggingFace.
- Contenido sensible: el LoRA esta orientado a interacciones romanticas e intimas entre personajes; su uso debe respetar las politicas de la plataforma de despliegue y la legislacion aplicable, evitando la generacion de contenido con personas reales sin consentimiento.
- El modelo hereda los sesgos y limitaciones del modelo base MiniMax H3, que no estan documentados en la ficha.
- Riesgo de artefactos visuales si se usa una fuerza del LoRA fuera del rango recomendado (0,5-1,0) o con workflows no compatibles.
- Licencia Apache 2.0: permite uso comercial, pero la responsabilidad sobre el contenido generado recae en el usuario final.

## Enlaces
- HuggingFace: https://huggingface.co/CxyGodKiss/cxy_kiss_h3
- Modelo base MiniMax H3: no disponible (no se proporciona enlace al checkpoint base)
