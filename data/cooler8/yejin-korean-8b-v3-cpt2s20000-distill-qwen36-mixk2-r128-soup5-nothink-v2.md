# cooler8/yejin-korean-8b-v3-cpt2s20000-distill-qwen36-mixK2-r128-soup5-nothink-v2

## Resumen

Yejin Korean 8B v3 es un modelo de lenguaje de 7.241.740.288 parámetros (aproximadamente 7,24 mil millones) especializado en instrucciones en coreano, desarrollado por el usuario cooler8 bajo el paraguas del proyecto Yejin. Se construye sobre `cooler8/yejin-korean-8b-v3-base`, un modelo preentrenado desde cero específicamente para coreano, al que se han aplicado dos fases de preentrenamiento continuado sobre datos públicos coreanos y un ajuste fino supervisado (SFT) con formato conversacional. La variante aquí descrita incorpora además una destilación de secuencia desde Qwen3.6-27B para tareas de razonamiento y matemáticas.

El modelo emplea una arquitectura transformer de tipo Qwen3 (según los tags de Hugging Face), con licencia Apache 2.0 y pesos en formato safetensors (29 GB en el repositorio, lo que sugiere pesos en bf16/fp16). Su relevancia radica en ser un modelo monolingüe coreano de tamaño medio (8B) entrenado desde cero en lugar de adaptado desde un modelo multilingüe, lo que puede ofrecer ventajas en tokenización y representación del coreano frente a alternativas genéricas.

La versión `nothink-v2` desactiva el modo de razonamiento explícito (thinking mode) mediante una plantilla de chat que fuerza un bloque `<think>` vacío, orientando el modelo a respuestas directas. El entrenamiento combina cuatro LoRA de rango 128 sobre el modelo base, fusionadas mediante un "model soup" ponderado, con datos de destilación procedentes de Qwen3.6-27B para preguntas de razonamiento y matemáticas con solución verificada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (tipo Qwen3, según tags) |
| Parámetros totales | 7.241.740.288 (~7,24B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en safetensors, presumiblemente bf16/fp16) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `cooler8/yejin-korean-8b-v3-base`, un transformer preentrenado desde cero por el autor para coreano. Sobre esa base se aplicaron dos fases de preentrenamiento continuado (CPT) con datos públicos coreanos: una primera fase de 6.000 pasos y una segunda de 20.000 pasos que incluye texto coreano de FinePDFs, parcialmente extraído mediante el modelo OCR RolmOCR. Posteriormente se incorporó el "chat vector" del modelo SFT propio del autor para dotar al modelo de capacidad conversacional.

El ajuste fino final se realizó con cuatro LoRA independientes de rango 128 (alpha 256, learning rate 2e-4) sobre el mismo modelo Yejin, cada una con un orden de barajado de datos distinto (semillas 0, 7, 11 y 13) sobre el dataset mixK2 (95.107 muestras). Este dataset aplica una puerta de salida adaptativa a la tarea: formato "Answer-First + Explanation + Answer-Confirm" para ítems de conocimiento y comprensión lectora, y "CoT-First" para ítems de razonamiento y matemáticas. Las soluciones cortas en coreano para preguntas del generador de puzles propio, KMMLU train, exámenes escolares de AI Hub y comprensión lectora de AI Hub se generaron con Qwen/Qwen3.6-27B (Apache-2.0), conservando únicamente aquellas que alcanzaban la respuesta conocida (destilación a nivel de secuencia, sin pesos ni logits del profesor). Las cuatro LoRA se fusionaron mediante un model soup ponderado: 2x semilla 0 + 1x semilla 7 + 1x semilla 11 + 1x semilla 13.

## Capacidades

- Generación de texto conversacional en coreano con formato de chat definido por plantilla.
- Seguimiento de instrucciones (instruction-following) en coreano.
- Razonamiento y matemáticas: el entrenamiento incluye soluciones con cadena de pensamiento (CoT-First) para ítems de razonamiento y matemáticas, destiladas desde Qwen3.6-27B.
- Conocimiento y comprensión lectora: formato Answer-First con explicación y confirmación de respuesta.
- Modo "no-think": la plantilla fuerza `<think> </think>` vacío, por lo que el modelo responde sin razonamiento explícito visible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada (el modo thinking está desactivado en esta variante).
- Capacidades multilingües: limitadas al coreano según los metadatos (`language: ko`).
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Asistencia conversacional en coreano: el modelo puede mantener diálogos multi-turno en coreano usando la plantilla de chat documentada, adecuado para chatbots de atención al cliente orientados al mercado coreano.
- Respuesta a preguntas de conocimiento (QA): gracias al formato Answer-First entrenado en ítems de conocimiento y comprensión lectora, es apropiado para sistemas de preguntas y respuestas sobre dominios factuales en coreano.
- Resolución de exámenes y pruebas académicas: el entrenamiento incluye exámenes escolares de AI Hub y KMMLU train, lo que lo hace útil para tareas de evaluación educativa automatizada en coreano.
- Razonamiento matemático en coreano: la destilación con CoT-First sobre problemas con solución verificada permite abordar problemas matemáticos de nivel escolar y de oposición.
- Generación de contenido educativo: puede redactar explicaciones y soluciones paso a paso en coreano para plataformas de aprendizaje.
- Procesamiento de documentos coreanos: la inclusión de texto de FinePDFs extraído por OCR sugiere cierta exposición a texto documental, útil para tareas de extracción y resumen sobre documentos en coreano (a validar empíricamente).
- Integración en pipelines de inferencia locales: al ser un modelo de ~7,24B con licencia Apache 2.0, puede desplegarse en infraestructura propia sin restricciones comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 14,5 GB solo para pesos (7,24B × 2 bytes), más overhead de activaciones y caché KV.
- Cuantización a 8 bits: ~7,3 GB de pesos; a 4 bits: ~3,6 GB de pesos (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en bf16 con contexto largo; RTX 4090 (24 GB) suficiente para bf16 en contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bf16; en RTX 3090/4080 (16-24 GB) con cuantización; en GPUs de 8-12 GB probablemente solo con cuantización agresiva (4 bits), a validar.
- Opciones de despliegue: transformers (según el ejemplo de la model card); vLLM, llama.cpp, Ollama y TGI no están confirmados por el autor, aunque al ser arquitectura tipo Qwen3 es plausible su soporte (no verificado).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Yejin Korean 8B v3 (este) | ~7,24B | No disponible | Coreano | Apache 2.0 | Preentrenado desde cero en coreano, destilación de Qwen3.6-27B |
| Qwen3.6-27B (profesor de destilación) | ~27B (no confirmado) | No disponible | Multilingüe | Apache 2.0 | Usado como profesor para soluciones de razonamiento/matemáticas |
| Modelos coreanos de 7-8B de la comunidad | No disponible | No disponible | Coreano | Variable | No se dispone de datos comparativos verificados en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo monolingüe: solo soporta coreano según los metadatos; el rendimiento en otros idiomas no está garantizado.
- Riesgo de alucinación: como todo modelo generativo, puede producir respuestas factualmente incorrectas, especialmente en dominios no cubiertos por el entrenamiento.
- Sesgos: no se documentan análisis de sesgos; los datos provienen de fuentes públicas coreanas (FinePDFs, AI Hub, KMMLU train), lo que puede introducir sesgos de esas fuentes.
- Destilación desde Qwen3.6-27B: las soluciones de razonamiento y matemáticas se generaron con un modelo profesor; los errores del profesor que pasaron el filtro de respuesta correcta podrían persistir.
- Modo thinking desactivado: esta variante fuerza `<think> </think>` vacío, por lo que no expone razonamiento explícito; para tareas que requieran cadena de pensamiento visible habría que usar otra variante.
- Longitud de contexto no documentada: no se especifica la ventana máxima, lo que dificulta planificar despliegues con documentos largos.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a alternativas.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero el autor no ofrece garantías.
- Modelo con 0 descargas y 0 likes en Hugging Face en el momento de la consulta: ecosistema de validación muy limitado.
- El nombre del modelo incluye referencias a procesos internos (cpt2s20000, mixK2, soup5, r128) que dificultan su interpretación sin la model card.

## Enlaces

- Hugging Face: https://huggingface.co/cooler8/yejin-korean-8b-v3-cpt2s20000-distill-qwen36-mixK2-r128-soup5-nothink-v2
- Modelo base: https://huggingface.co/cooler8/yejin-korean-8b-v3-base
- Modelo profesor (Qwen3.6-27B): https://huggingface.co/Qwen/Qwen3.6-27B (referenciado en la model card como Apache-2.0)
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
