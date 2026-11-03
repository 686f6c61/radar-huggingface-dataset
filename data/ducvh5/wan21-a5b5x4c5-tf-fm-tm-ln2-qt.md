# ducvh5/wan21-a5b5x4c5-tf-fm-tm-ln2-qt

## Resumen

Este repositorio contiene un ajuste fino (finetune) del modelo de generación de vídeo a partir de texto Wan2.1-T2V-1.3B-Diffusers, desarrollado originalmente por Wan-AI (Alibaba). El autor del checkpoint es el usuario de HuggingFace `ducvh5` y el modelo se distribuye a través de la librería `diffusers` en formato `safetensors`, con un tamaño de repositorio de 31,8 GB. Se trata de un modelo derivado de investigación, no de un lanzamiento oficial, y su relevancia es limitada: cuenta con cero descargas y cero "likes" en el momento de la consulta.

La model card es extremadamente escueta y críptica, compuesta por anotaciones técnicas abreviadas (A5 → B5×4 → C5, 15 bloques únicos / 30 ejecutados, pérdida TF+FM+TM, σ con LN(0,1) y shift=2). Estas notaciones sugieren una reconfiguración de la arquitectura del transformer del modelo base, probablemente orientada a reducir cómputo mediante reutilización de bloques, pero no se aporta documentación que lo confirme. El pipeline declarado es text-to-video.

No se dispone de información sobre licencia, idiomas soportados ni resultados de benchmarks. El modelo base (Wan2.1-T2V-1.3B) es un modelo de difusión para generación de vídeo, por lo que las comparativas y casos de uso deben interpretarse en ese contexto y no como un modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión para vídeo (derivado de Wan2.1-T2V-1.3B); la model card menciona "recurrent-transformer" y una estructura A5 → B5×4 → C5 con 15 bloques únicos / 30 ejecutados |
| Parametros totales | No disponible de forma explícita; el modelo base Wan2.1-T2V es de 1.300 millones de parámetros (1.3B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (librería diffusers); incluye `step0020000/state.pt` |
| Tarea | Text-to-video |
| Modelo base | Wan-AI/Wan2.1-T2V-1.3B-Diffusers |
| Tamano del repositorio | 31,8 GB |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de difusión de Wan2.1-T2V-1.3B, un transformer para generación de vídeo a partir de texto. Según la model card, el autor ha modificado la disposición de bloques del transformer: la notación "A5 → B5×4 → C5" con "15 unique / 30 executed blocks" indica que se ejecutan 30 bloques pero solo 15 son únicos, lo que apunta a un esquema de reutilización de pesos (recurrente) para reducir el número de parámetros efectivos manteniendo la profundidad de cómputo. El tag "recurrent-transformer" respalda esta interpretación, aunque no hay documentación que detalle el mecanismo exacto.

En cuanto al entrenamiento, la model card indica una función de pérdida compuesta "TF+FM+TM" (probablemente flow matching y variantes de transporte, aunque las siglas no se explican), un schedule de ruido con σ ~ LN(0,1), shift=2 y t=1000σ. Los datos de entrenamiento se describen como "OV" con captions "QT" en proporción 50/50 entre "VB" y "full", notación que no se aclara. Se conservan los 9 pesos EMA y no-EMA, y el último estado es `step0020000/state.pt`, lo que sugiere 20.000 pasos de entrenamiento. No se especifica el número de tokens, la composición del dataset ni si hubo RLHF o DPO (poco habitual en modelos de difusión).

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) mediante pipeline de difusión.
- Ajuste fino sobre el modelo base Wan2.1-T2V-1.3B, por lo que hereda sus capacidades de síntesis de vídeo.
- Soporte de checkpoints EMA y no-EMA (9 pesos retenidos).
- Compatibilidad con la librería `diffusers` y formato `safetensors`.
- No se documentan capacidades de tool calling, function calling, agentes ni razonamiento multi-paso (no aplicables a un modelo de difusión de vídeo).
- Capacidades multilingües: no disponibles.
- No se documentan modos especiales (thinking, visión, audio) más allá de la generación de vídeo.

## Casos de uso

- Generación de clips de vídeo cortos a partir de descripciones textuales: el modelo puede producir secuencias de vídeo desde prompts, adecuado para prototipado creativo y previsualización de ideas.
- Investigación en arquitecturas recurrentes para difusión: la reutilización de bloques (15 únicos / 30 ejecutados) lo convierte en un banco de pruebas para estudiar eficiencia de parámetros en modelos de vídeo.
- Experimentación académica con schedules de ruido y funciones de pérdida: la configuración σ ~ LN(0,1) y shift=2 permite reproducir y comparar variantes de entrenamiento.
- Generación de material de storyboard o animática: útil para equipos de preproducción que necesitan visualizar escenas a bajo coste computacional (modelo de 1.3B).
- Ajuste fino posterior (fine-tuning) sobre un modelo pequeño de vídeo: su tamaño de 1.3B facilita iteraciones rápidas en entornos con recursos limitados frente a modelos de vídeo de mayor escala.
- Evaluación comparativa de checkpoints EMA vs. no-EMA: al conservar ambos, permite estudiar la estabilidad y calidad de cada variante en pipelines de difusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 31,8 GB e incluye múltiples checkpoints (EMA y no-EMA), por lo que el peso de un único checkpoint es sustancialmente menor. Para un modelo de difusión de ~1.3B en precisión completa se requiere típicamente en torno a 8-16 GB de VRAM, pero este dato no está confirmado en la información proporcionada.
- GPU recomendadas: no disponible en la información; por el tamaño del modelo base (1.3B), cabría esperar GPUs de gama alta de consumo (RTX 3090/4090) o profesionales (A100, H100), pero no se confirma.
- ¿Cabe en GPU de consumo? No confirmado; el tamaño del modelo base sugiere que sí en GPUs con 16 GB o más, pero no hay dato oficial.
- Opciones de despliegue: `diffusers` (librería declarada); no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a difusión de vídeo en la mayoría de casos).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ducvh5/wan21-a5b5x4c5-tf-fm-tm-ln2-qt | ~1.3B (base) | No disponible | Text-to-video | No disponible | HuggingFace (0 descargas) |
| Wan-AI/Wan2.1-T2V-1.3B-Diffusers | 1.3B | No disponible | Text-to-video | No disponible en esta ficha | HuggingFace (modelo base oficial) |
| Otros modelos text-to-video de ~1.3B | No disponible | No disponible | Text-to-video | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Model card extremadamente escueta: no se documentan sesgos, composición del dataset ni metodología de evaluación.
- Riesgo de alucinación visual: como todo modelo generativo de vídeo, puede producir contenido incoherente, artefactos o escenas que no corresponden al prompt.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; el modelo base Wan2.1 tiene su propia licencia que conviene verificar por separado.
- Idiomas no especificados: se desconoce si los prompts deben estar en inglés, chino u otros idiomas.
- Repositorio sin tracción (0 descargas, 0 likes) y creado/actualizado el mismo día: no hay evidencia de validación por la comunidad.
- La notación de la model card (A5 → B5×4 → C5, TF+FM+TM, OV, QT, VB) no está explicada, lo que dificulta la reproducibilidad.
- El tamaño del repositorio (31,8 GB) incluye múltiples checkpoints; seleccionar el correcto requiere inspeccionar los archivos manualmente.
- No hay información sobre requisitos de hardware ni latencia, lo que complica la planificación de despliegue en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ducvh5/wan21-a5b5x4c5-tf-fm-tm-ln2-qt
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B-Diffusers
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
