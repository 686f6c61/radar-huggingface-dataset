# LiquidAI/d1-Omni-2B-MLX-8bit

## Resumen

d1-Omni-2B-MLX-8bit es la versión cuantizada a 8 bits en formato MLX del modelo d1-Omni-2B de LiquidAI, optimizada para ejecutarse en Apple Silicon. A diferencia de los modelos generativos convencionales, d1-Omni-2B es un modelo de decisión: responde preguntas con nombre y tipo predefinido sobre un estado multimodal (texto, imagen, vídeo y audio) devolviendo probabilidades calibradas en un único forward pass, sin generar tokens. Esto lo sitúa en la categoría de modelos "system-one" orientados a clasificación y calibración en el edge.

El modelo integra una torre de visión, un codificador de audio, proyecciones multimodales y un modelo de lenguaje base de la familia LFM3, con un total de 2.166.928.384 parámetros. La cuantización aplica 8 bits afines con grupos de 64 únicamente al modelo de lenguaje, mientras que la torre de visión, el codificador de audio, los proyectores y las normas permanecen en FP16. Según la model card, frente al checkpoint original en float32 conserva las 59 respuestas de test y desplaza las probabilidades como máximo 0,008.

Es relevante ahora porque propone un paradigma distinto al de los LLM generativos: en lugar de producir texto libre, emite decisiones tipadas (sí/no, elección múltiple, puntuación) con calibración explícita, lo que facilita su integración en pipelines de enrutamiento, moderación y clasificación sobre hardware de consumo Apple. Los pesos ocupan 2,71 GB y requiere MLX-VLM 0.7.11 o superior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 multimodal (torre de visión + codificador de audio + LM con proyecciones); modelo de decisión "system-one" |
| Parametros totales | 2.166.928.384 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit affine con grupos de 64 en el LM; visión, audio, proyectores y normas en FP16 |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | lfm1.0 (license: other) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

d1-Omni-2B combina una torre de visión, un codificador de audio y un modelo de lenguaje de la familia LFM3 con proyecciones multimodales. La innovación principal es el modo de inferencia: en lugar de decodificar tokens de forma autorregresiva, el modelo recibe un conjunto de preguntas tipadas (por ejemplo `noul` para sí/no, `choice` para elección múltiple —con opción `multiple`— y `score` para puntuación sobre una escala) y devuelve, en un solo forward pass, probabilidades calibradas para cada una. Las preguntas pueden formularse por escrito o por voz.

La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Tampoco se especifica la longitud de contexto. La información disponible se limita a la arquitectura multimodal, la naturaleza de decisión del modelo y los detalles de la cuantización: 8 bits afines con grupos de 64 para el LM y FP16 para el resto de componentes, con una degradación máxima de 0,008 en las probabilidades respecto al checkpoint en float32 sobre 59 respuestas de test.

## Capacidades

- Decisión multimodal sobre texto, imágenes, vídeo y audio en un único forward pass, sin generación de tokens.
- Preguntas tipadas: `noul` (sí/no), `choice` (elección única o múltiple) y `score` (puntuación sobre una escala definida por leyenda).
- Respuestas con probabilidades calibradas, aptas para umbrales y enrutamiento.
- Entrada de preguntas por escrito o por voz (audio-text-to-text).
- Procesamiento conjunto de varias preguntas sobre un mismo estado en una sola pasada.
- Soporte multilingüe en 16 idiomas: inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, español, vietnamita, tailandés, indonesio, hindi, ruso y polaco.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (el modelo está diseñado para decisiones de un solo paso).
- Modo thinking, visión y audio: visión y audio sí; modo thinking no disponible.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo clasifica un mensaje entrante con preguntas tipadas (equipo destino, temas, urgencia) y devuelve probabilidades calibradas que permiten aplicar umbrales y derivar a revisión humana los casos de baja confianza.
- Moderación de contenido multimodal: evaluación de texto, imágenes o audio frente a criterios definidos como preguntas `noul` o `choice`, aprovechando la calibración para fijar políticas de escalado.
- Triaje de llamadas o notas de voz: al aceptar audio como entrada, puede procesar grabaciones y responder preguntas de clasificación (motivo de contacto, sentimiento, urgencia) sin transcripción previa.
- Control de calidad en pipelines de datos: verificación automática de pares imagen-texto o audio-texto mediante preguntas de sí/no y puntuaciones, con probabilidades que permiten filtrar por confianza.
- Clasificación multilingüe en el edge: despliegue en Macs con Apple Silicon para clasificar contenido en cualquiera de los 16 idiomas soportados sin depender de la nube, con 2,71 GB de pesos.
- Enrutamiento de consultas en asistentes: decidir qué herramienta o flujo debe atender una petición (facturación, envíos, técnico) mediante preguntas `choice` con criterios explícitos, en una sola pasada y con latencia baja.
- Detección de intención de reembolso o cancelación: pregunta `noul` con probabilidad calibrada para activar flujos automáticos solo por encima de un umbral configurable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta la fidelidad de la cuantización: frente al checkpoint original en float32, conserva las 59 respuestas de test y desplaza las probabilidades como máximo 0,008.

## Requisitos de hardware

- VRAM/espacio de pesos: 2,71 GB para la versión 8-bit MLX (frente a los pesos del checkpoint original, de mayor tamaño).
- Hardware objetivo: Apple Silicon (MLX); no está pensada para GPUs NVIDIA.
- GPU recomendadas: no disponible para el ecosistema CUDA; en Apple Silicon se ejecuta sobre la GPU integrada vía MLX.
- Cabe en equipos de consumo Apple Silicon con memoria unificada suficiente para los 2,71 GB de pesos más el estado de activaciones; no se especifican requisitos mínimos de memoria unificada.
- Despliegue: MLX-VLM 0.7.11 o superior. No es compatible con `mlx_vlm.generate` ni con aplicaciones de chat, ya que el modelo no genera texto; debe invocarse mediante `model.system_one` o el comando `decide`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| d1-Omni-2B-MLX-8bit | 2,17 B | no disponible | Decisión multimodal calibrada (texto, imagen, vídeo, audio), 8-bit MLX | lfm1.0 | Hugging Face (MLX) |
| d1-Omni-2B (original) | 2,17 B | no disponible | Decisión multimodal calibrada, pesos completos | lfm1.0 | Hugging Face |
| Alternativas de clasificación multimodal de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada que permitan una comparación cuantitativa fiable.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre y no puede usarse con `mlx_vlm.generate` ni en aplicaciones de chat convencionales; requiere invocar `model.system_one` o el comando `decide`.
- Dependencia de MLX-VLM 0.7.11 o superior y del ecosistema Apple Silicon; no hay soporte documentado para CUDA, vLLM, llama.cpp u Ollama en esta versión.
- Solo responde a preguntas tipadas predefinidas (`noul`, `choice`, `score`); no admite instrucciones abiertas ni razonamiento multi-paso.
- La calibración se ha validado únicamente sobre 59 respuestas de test según la model card; el comportamiento fuera de esa distribución no está documentado.
- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no disponible en la información proporcionada, aunque al no generar texto el riesgo se manifiesta como clasificaciones erróneas con probabilidad alta.
- Limitaciones de contexto e idioma: la longitud de contexto no está especificada; el soporte multilingüe cubre 16 idiomas, sin datos de rendimiento por idioma.
- Licencia lfm1.0 (license: other): es necesario revisar el archivo LICENSE del repositorio antes de un uso comercial; las condiciones concretas no se detallan en la información disponible.
- La cuantización a 8 bits introduce un desplazamiento de hasta 0,008 en las probabilidades; para umbrales muy ajustados conviene tenerlo en cuenta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LiquidAI/d1-Omni-2B-MLX-8bit
- Modelo base: https://huggingface.co/LiquidAI/d1-Omni-2B
- Licencia: https://huggingface.co/LiquidAI/d1-Omni-2B-MLX-8bit/blob/main/LICENSE
- MLX-VLM: https://github.com/Blaizzy/mlx-vlm
- Blog de LFM3: https://www.liquid.ai/blog/lfm3
- Documentación de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Consola/API: https://console.liquid.ai/dashboard
- Playground: https://playground.liquid.ai/
