# nabin2004/AOS-qwen3-8b-narrated-dpo

## Resumen

AOS-qwen3-8b-narrated-dpo es un adaptador LoRA de alineación mediante Direct Preference Optimization (DPO) desarrollado por nabin2004, diseñado específicamente para la síntesis de animaciones educativas y matemáticas con Manim Community Edition. El modelo se basa en Qwen/Qwen3-8B y parte de un ajuste fino supervisado previo (SFT) denominado `nabin2004/AOS-qwen3-8b-narrated-adapter`. Su objetivo principal es alinear el comportamiento del modelo para que genere preferentemente código `manim-voiceover` sincronizado, con narración fonética de explicaciones matemáticas y control de duración de animaciones mediante `run_time`.

La relevancia de este modelo radica en su enfoque especializado: en lugar de un modelo generalista, se trata de un adaptador de bajo rango que modifica las preferencias del modelo base hacia un estilo de código muy concreto. Esto permite a desarrolladores y educadores generar animaciones de Manim con voz integrada de forma más consistente, sin necesidad de entrenar un modelo completo. El repositorio tiene un tamaño de 0.5 GB, consistente con un adaptador LoRA (los pesos completos de un modelo de 8B ocuparían varios GB más), y se distribuye bajo licencia Apache 2.0.

Aunque la información pública es limitada, el modelo representa un caso de uso interesante de alineación por preferencias aplicada a un dominio técnico específico, demostrando cómo DPO puede utilizarse para sesgar la salida de un LLM hacia formatos de código con características determinadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen3-8B (transformer decoder-only) |
| Parametros totales | no disponible (adaptador LoRA, tamaño del repo 0.5 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base Qwen3-8B, que soporta 32k tokens, pero no se especifica para el adaptador) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base Qwen3-8B es multilingüe, pero no se indica para el adaptador) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (según tags) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) que se aplica sobre el modelo base Qwen3-8B, un transformer decoder-only con aproximadamente 8 mil millones de parámetros. El adaptador fue entrenado mediante Direct Preference Optimization (DPO), una técnica de alineación por preferencias que optimiza directamente la política del modelo para favorecer respuestas "elegidas" frente a "rechazadas". En este caso, las respuestas elegidas son scripts `VoiceoverScene` de Manim que incluyen `self.set_speech_service(GTTSService())`, seguimiento de duración de animación con `run_time=tracker.duration` y explicaciones matemáticas fonéticas; las respuestas rechazadas son código `Scene` estándar sin narración.

El entrenamiento partió de un ajuste fino supervisado (SFT) previo, el adaptador `nabin2004/AOS-qwen3-8b-narrated-adapter`, que probablemente estableció la capacidad base de generar código Manim. La etapa DPO refina esta capacidad para que el modelo prefiera de forma consistente el estilo narrado. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni los hiperparámetros exactos del DPO.

## Capacidades

- Generación de código Manim Community Edition con narración sincronizada mediante `manim-voiceover`.
- Preferencia por scripts `VoiceoverScene` con servicio de voz GTTSService (Google Text-to-Speech).
- Control de duración de animaciones mediante `run_time` vinculado a `tracker.duration`.
- Explicaciones matemáticas fonéticas integradas en el código generado.
- Capacidades generales del modelo base Qwen3-8B (generación de texto, razonamiento, código, matemáticas, multilingüismo) aunque no se garantiza que el adaptador las preserve íntegramente.
- No se especifica soporte para tool calling, agentes, visión o audio más allá de la generación de código de voz.

## Casos de uso

- Creación de vídeos educativos de matemáticas: el modelo genera código Manim listo para renderizar con narración automática, lo que permite a profesores y divulgadores producir explicaciones animadas sin edición manual de audio.
- Prototipado rápido de animaciones para cursos online: un desarrollador puede describir un concepto matemático y obtener un script `VoiceoverScene` que sincroniza la animación con la explicación hablada, acelerando el ciclo de iteración.
- Generación de contenido para canales de YouTube o plataformas de e-learning: el adaptador facilita la producción de vídeos explicativos con voz, reduciendo el tiempo de postproducción.
- Automatización de materiales didácticos en entornos académicos: investigadores o docentes pueden generar animaciones de demostraciones matemáticas con narración para sus clases o publicaciones.
- Integración en pipelines de renderizado de Manim: el modelo puede usarse como backend de generación de código en herramientas que automatizan la creación de animaciones, donde la preferencia por el estilo narrado garantiza consistencia.
- Evaluación de técnicas de alineación por preferencias en dominios técnicos: sirve como caso de estudio para DPO aplicado a generación de código especializado, útil para investigadores en RLHF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K para este adaptador, ni comparaciones con otros modelos.

## Requisitos de hardware

- Al ser un adaptador LoRA, los requisitos de hardware dependen del modelo base Qwen3-8B. Para inferencia en FP16, el modelo base requiere aproximadamente 16 GB de VRAM (sin cuantización).
- El adaptador en sí es ligero (0.5 GB), pero debe cargarse junto con el modelo base, por lo que se necesita una GPU con al menos 16 GB de VRAM para FP16, o menos si se usa cuantización del base (por ejemplo, 8 GB con cuantización de 4 bits).
- GPUs recomendadas: RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB) para mayor comodidad; GPUs consumer de 16 GB como RTX 4080 o RTX 3090 pueden funcionar con cuantización.
- Opciones de despliegue: al ser un adaptador LoRA, se puede cargar con bibliotecas como PEFT (Hugging Face) sobre el modelo base, y servir con vLLM o TGI si se fusiona el adaptador. También es posible usar llama.cpp si se convierte el modelo fusionado a GGUF, aunque no se indica soporte oficial.
- Latencia y throughput: no disponibles; dependen del hardware y del tamaño del contexto.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para generación de código Manim con voiceover. El adaptador es altamente especializado y no hay alternativas públicas conocidas en el momento de la consulta. Se puede mencionar que el modelo base Qwen3-8B es comparable a otros LLMs de 8B como Llama 3.1 8B o Mistral 7B, pero el adaptador no modifica las capacidades generales, solo las preferencias de estilo.

## Limitaciones y advertencias

- Especialización extrema: el adaptador está optimizado para un único dominio (código Manim con voiceover), por lo que su uso fuera de este contexto puede degradar la calidad de las respuestas o producir resultados inesperados.
- Dependencia del modelo base: las limitaciones de Qwen3-8B (posibles sesgos, alucinaciones, limitaciones de idioma) se heredan, aunque no se han evaluado específicamente para este adaptador.
- Riesgo de alucinación en código: como cualquier modelo de generación de código, puede producir scripts Manim con errores de sintaxis o lógica, especialmente en escenarios complejos.
- Sin información sobre sesgos específicos: no se han publicado análisis de sesgos para este adaptador.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base Qwen3-8B (también Apache 2.0) y de las dependencias de Manim y manim-voiceover.
- No se garantiza la preservación completa de las capacidades multilingües del base tras el entrenamiento DPO, ya que no se ha evaluado.
- El adaptador requiere el modelo base Qwen3-8B para funcionar; no es un modelo autónomo.

## Enlaces

- HuggingFace: https://huggingface.co/nabin2004/AOS-qwen3-8b-narrated-dpo
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Adaptador SFT previo: https://huggingface.co/nabin2004/AOS-qwen3-8b-narrated-adapter (referenciado en la model card, no verificado)
- No se encontraron papers, blogs o demos adicionales en la búsqueda web.
