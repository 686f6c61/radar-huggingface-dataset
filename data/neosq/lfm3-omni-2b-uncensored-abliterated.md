# NeosQ/LFM3-Omni-2B-Uncensored-abliterated

## Resumen

LFM3-Omni-2B-Uncensored-abliterated es una derivación del modelo multimodal LiquidAI/LFM3-Omni-2B, publicada por el usuario NeosQ en Hugging Face. El modelo base es un transformer any-to-any de 2.166.928.384 parámetros (aproximadamente 2,17 mil millones) desarrollado por Liquid AI, capaz de procesar y generar texto, imágenes, vídeo y audio. Esta variante concreta no ha sido reentrenada ni afinada: solo se han modificado 41 de sus 665 tensores mediante una técnica de abliteración (eliminación de la dirección de rechazo en el espacio residual), con el objetivo de suprimir el comportamiento de negativa del modelo original.

La relevancia de esta ficha es doble. Por un lado, documenta un ejemplo práctico de modificación de pesos con Heretic 2.1.0 para investigación de seguridad y alineación. Por otro, sirve como referencia de las capacidades reales del modelo base LFM3-Omni-2B en tareas de instrucción, matemáticas, función calling y multimodalidad, ya que los benchmarks publicados comparan ambas versiones sobre el mismo hardware y conjunto de prompts.

Es importante subrayar que se trata de un checkpoint exclusivamente de investigación: la eliminación deliberada de las negativas hace que el modelo pueda producir contenido inseguro, ilegal o dañino, y el autor lo desaconseja explícitamente para producción o uso orientado al consumidor. La licencia heredada es lfm1.0, la misma del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal any-to-any (familia LFM3-Omni de Liquid AI; detalles internos de capas y atención no disponibles en la información proporcionada) |
| Parámetros totales | 2.166.928.384 (2,17 B) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | BF16 (safetensors); GGUF en BF16, Q8_0 y Q4_K_M publicados en repositorio aparte |
| Idiomas soportados | en, zh, ar, fr, de, it, ja, ko, pt, es, vi, th (12 idiomas) |
| Licencia | lfm1.0 (heredada del modelo base; licencia "other" en Hugging Face) |
| Formato de pesos | safetensors (BF16, 4,04 GB); GGUF para llama.cpp |
| Pipeline | any-to-any (image-text-to-text, audio, visión) |
| Modificador | Abliteración MPOA (ablación de dirección con preservación de magnitud), Heretic 2.1.0 |
| Tamaño del repositorio | 4,5 GB |
| Requiere trust_remote_code | Sí (modelo con código personalizado) |

## Arquitectura y entrenamiento

El modelo base LFM3-Omni-2B pertenece a la familia LFM3-Omni de Liquid AI y está diseñado como un modelo any-to-any: acepta y produce texto, imágenes, vídeo y audio. La información proporcionada no detalla la composición interna de capas, el mecanismo de atención ni el volumen de tokens de entrenamiento del modelo original, por lo que esos datos deben consultarse en la model card de LiquidAI/LFM3-Omni-2B.

La variante aquí descrita no incorpora ningún entrenamiento ni fine-tuning adicional. El proceso de abliteración, ejecutado con Heretic 2.1.0 (torch 2.15, transformers 5.22.2, backend MPS), busca direcciones en el flujo residual que codifican el rechazo y aplica una ablación ortogonal que preserva la magnitud de los pesos (MPOA). Se realizaron 100 ensayos de Optuna con semilla 42 y se seleccionó un punto del frente de Pareto que minimiza simultáneamente el número de negativas en un conjunto de 100 prompts y la divergencia KL respecto al modelo base. El resultado: las negativas pasan de 99/100 a 3/100, con una divergencia KL de 0,0176 y solo 41 de 665 tensores modificados. La arquitectura, el tokenizador, el procesador, la plantilla de chat y el resto de archivos son idénticos byte a byte al checkpoint original.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat nativa.
- Comprensión de imágenes y vídeo como entrada (image-text-to-text, any-to-any).
- Procesamiento de audio como entrada y salida dentro del pipeline any-to-any.
- Razonamiento matemático (resultados en GSM8K y MATH-500 documentados).
- Seguimiento de instrucciones (IFEval evaluado).
- Function calling nativo: los esquemas de herramientas se pasan mediante el parámetro `tools` y se renderizan en el bloque `<tools>` del turno de sistema; las respuestas usan el formato nativo `<tool_call>`.
- Llamadas paralelas y múltiples a funciones en una misma respuesta (con la salvedad de que la plantilla no lo indica por defecto y requiere una frase explícita en el system prompt).
- Capacidades multilingües en 12 idiomas: inglés, chino, árabe, francés, alemán, italiano, japonés, coreano, portugués, español, vietnamita y tailandés.
- Modo de generación seleccionable mediante `generation_mode` (por ejemplo, `"text"`).
- Comportamiento de rechazo suprimido de forma deliberada (3/100 negativas frente a 99/100 del base).

## Casos de uso

- Investigación en seguridad y alineación: el modelo permite estudiar cómo la ablación de una dirección en el flujo residual afecta al comportamiento de rechazo con una divergencia KL mínima (0,0176), lo que lo convierte en un banco de pruebas controlado para analizar la separabilidad entre capacidades y salvaguardas.
- Evaluación de robustness de filtros de contenido: al generar respuestas que el modelo base rechazaría, sirve para probar clasificadores de seguridad, moderadores y pipelines de detección de contenido dañino en condiciones adversas.
- Análisis de regresión tras modificación de pesos: los benchmarks publicados (HellaSwag, PIQA, GSM8K, IFEval, BFCL v4) permiten cuantificar qué capacidades se preservan y cuáles se degradan al aplicar abliteración, útil para metodologías de edición de modelos.
- Estudio de function calling y agentes: con BFCL v4 evaluado en modo nativo, el modelo sirve para analizar cómo la supresión de negativas afecta a la disposición a invocar herramientas, especialmente en el caso de irrelevancia (donde emitió llamadas en el 41,2% de los casos en que la respuesta correcta era no llamar).
- Experimentación multimodal en local: con 2,17 B de parámetros y cuantizaciones GGUF Q4_K_M y Q8_0, puede desplegarse en hardware de consumo para prototipar pipelines any-to-any (texto, imagen, audio) sin depender de APIs externas.
- Docencia y divulgación sobre edición de modelos: el proceso documentado (Heretic, Optuna, frente de Pareto, MPOA) constituye un caso de estudio reproducible para explicar técnicas de abliteración y sus compromisos.
- Pruebas de robustez multilingüe: con 12 idiomas soportados, permite evaluar si la supresión de rechazos se comporta de forma homogénea entre lenguas o si varía según el idioma.

## Benchmarks y rendimiento

Los datos siguientes comparan la variante abliterada con el modelo base sin modificar, sobre el mismo hardware y configuración de prompts. Δ se expresa en puntos porcentuales; z es un test de dos proporciones (|z| < 1,96 indica diferencia no significativa).

| Benchmark | n | Base | Este modelo | Δ vs base |
|---|---|---|---|---|
| HellaSwag | 200 | 0,485 | 0,485 | +0,0 pp (z=+0,00) |
| PIQA | 200 | 0,635 | 0,630 | -0,5 pp (z=-0,10) |
| WinoGrande | 200 | 0,530 | 0,535 | +0,5 pp (z=+0,10) |
| CommonsenseQA | 200 | 0,350 | 0,325 | -2,5 pp (z=-0,53) |
| SocialIQA | 200 | 0,330 | 0,325 | -0,5 pp (z=-0,11) |
| GSM8K | 200 | 0,710 | 0,710 | +0,0 pp (z=+0,00) |
| MATH-500 | 200 | 0,590 | 0,605 | +1,5 pp (z=+0,31) |
| IFEval | 541 | 0,745 | 0,763 | +1,8 pp (z=+0,71) |

| BFCL v4 | n | Base | Este modelo | Δ vs base |
|---|---|---|---|---|
| simple_python | 400 | 0,922 | 0,917 | -0,5 pp (z=-0,26) |
| multiple | 200 | 0,965 | 0,965 | +0,0 pp (z=+0,00) |
| parallel | 200 | 0,620 | 0,585 | -3,5 pp (z=-0,72) |
| parallel_multiple | 200 | 0,495 | 0,485 | -1,0 pp (z=-0,20) |
| irrelevance | 240 | 0,733 | 0,588 | -14,6 pp (z=-3,37) |

Las diferencias en tareas de conocimiento general, matemáticas e instrucciones no son estadísticamente significativas. La única degradación significativa es la de BFCL irrelevance (-14,6 pp, z=-3,37), atribuida a una mayor propensión a invocar herramientas: en el 41,2% de los casos de irrelevancia el modelo emitió una llamada cuando la respuesta correcta era no llamar. No se han publicado resultados de benchmarks del modelo base frente a otros modelos de la misma categoría en la información disponible.

## Requisitos de hardware

- Pesos en BF16: 4,04 GB en safetensors, más overhead de activaciones y procesadores multimodales.
- VRAM estimada para inferencia en BF16: aproximadamente 5-7 GB, dependiendo de la longitud de contexto y de si se procesan entradas de imagen, vídeo o audio (estimación orientativa; no confirmada en la información proporcionada).
- Cuantización Q8_0 (GGUF): en torno a 2,3 GB de pesos; Q4_K_M: en torno a 1,4 GB (estimaciones basadas en el tamaño de parámetros; no confirmadas).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para BF16; RTX 4090, A100 o H100 para mayor throughput y contextos largos. El autor documenta ejecución en MPS (Apple Silicon) durante el proceso de abliteración.
- Compatibilidad con GPU de consumo: sí, especialmente con cuantizaciones GGUF Q4_K_M y Q8_0; en BF16 cabe en tarjetas de 8 GB o superiores.
- Opciones de despliegue: transformers (>= 5.22.2) con `trust_remote_code=True` y `AutoModelForMultimodalLM`; llama.cpp mediante los GGUF publicados; vLLM, TGI y Ollama no están confirmados en la información disponible.
- Dependencias del quickstart: torch, torchvision, torchcodec, accelerate, pillow, librosa, soundfile.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la información proporcionada, por lo que la comparación se limita a características estructurales.

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-Omni-2B-Uncensored-abliterated | 2,17 B | No disponible | Texto, imagen, vídeo, audio | lfm1.0 | Abliterado, solo investigación |
| LiquidAI/LFM3-Omni-2B (base) | 2,17 B | No disponible | Texto, imagen, vídeo, audio | lfm1.0 | Modelo original con salvaguardas |
| Alternativas de ~2 B multimodales | No disponible | No disponible | No disponible | No disponible | No se han identificado comparables en la información disponible |

## Limitaciones y advertencias

- Modelo exclusivamente de investigación: el autor lo desaconseja explícitamente para producción o uso orientado al consumidor.
- Comportamiento de rechazo suprimido de forma deliberada: puede cumplir solicitudes que el modelo base denegaría y generar contenido inseguro, ilegal o dañino.
- Mayor propensión a invocar herramientas: en BFCL irrelevance emitió llamadas en el 41,2% de los casos en que no debía, con una caída de 14,6 pp frente al base. Esto puede provocar efectos secundarios no deseados en agentes y automatizaciones.
- Riesgo de alucinación: no cuantificado en la información proporcionada; aplicable el riesgo habitual de modelos de 2 B.
- Idiomas: 12 idiomas declarados, pero no hay evaluación por idioma de la degradación tras la abliteración; el comportamiento de rechazo podría variar entre lenguas.
- Contexto: longitud máxima no documentada; conviene verificarla antes de diseñar pipelines con ventanas largas.
- Licencia lfm1.0: es necesario revisar los términos del archivo LICENSE del repositorio para uso comercial; la información disponible no detalla restricciones específicas.
- Requiere `trust_remote_code=True`: implica ejecutar código Python del repositorio, con el riesgo de seguridad asociado.
- Modificación parcial de pesos: aunque la divergencia KL es baja (0,0176), solo se evaluaron 41 tensores; pueden existir efectos no medidos en dominios no cubiertos por los benchmarks.
- Sin datos de latencia ni throughput: no es posible estimar costes de despliegue a partir de la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NeosQ/LFM3-Omni-2B-Uncensored-abliterated
- Model card en chino: https://huggingface.co/NeosQ/LFM3-Omni-2B-Uncensored-abliterated/blob/main/README_zh.md
- Cuantizaciones GGUF: https://huggingface.co/NeosQ/LFM3-Omni-2B-Uncensored-abliterated.gguf
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
