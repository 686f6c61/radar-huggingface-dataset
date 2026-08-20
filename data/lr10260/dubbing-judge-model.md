# lr10260/dubbing-judge-model

## Resumen

El modelo `lr10260/dubbing-judge-model` es un adaptador LoRA y un checkpoint de alineación diseñados para evaluar la compatibilidad entre vídeo y texto en tareas de doblaje (dubbing). Desarrollado por Rui Liu (lr10260) como parte del proyecto `ruiiu/dubbing_judge`, este sistema actúa como un juez automático que puntúa si un texto candidato se ajusta correctamente al movimiento labial y al contenido fonético de un vídeo. El modelo combina un scorer CTC de alineación de 256 dimensiones sobre características visuales de Auto-AVSR y representaciones fonéticas de XPhoneBERT, junto con un razonador basado en Qwen3.5-9B adaptado con LoRA (rank 16, alpha 32). Su salida es la diferencia entre el logit de "Sí" y el de "No", indicando la compatibilidad vídeo-texto.

Este modelo resuelve el problema de validar automáticamente la calidad de sincronización labial y la coherencia semántica en sistemas de doblaje multilingüe, un paso crítico en pipelines de generación de contenido audiovisual. Su relevancia actual radica en la creciente demanda de herramientas de evaluación automática para sistemas de doblaje y síntesis de voz, donde los métodos tradicionales basados solo en métricas de audio no capturan la sincronía visual. El repositorio contiene los pesos del adaptador en formato safetensors, el checkpoint de alineación en PyTorch, y un proyector adicional, todo bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-9B (modelo base) + LoRA (rank 16, alpha 32, dropout 0.05) + scorer CTC de alineación de 256 dims + proyector |
| Parametros totales | no disponible (adaptador LoRA sobre base de 9B; el checkpoint de alineación es un modelo pequeño de 256 dims) |
| Parametros activos | no disponible (no es MoE; todos los parámetros del adaptador son activos) |
| Longitud de contexto | no disponible (depende del modelo base Qwen3.5-9B; no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (solo se proporcionan pesos safetensors para el adaptador; el modelo base puede cuantizarse aparte) |
| Idiomas soportados | multilingüe (siete idiomas en el benchmark de evaluación, según la model card; no se enumeran explícitamente) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors), PyTorch (.pt para judge_head y projector) |

## Arquitectura y entrenamiento

El sistema se compone de dos módulos principales. El primero es un scorer de alineación CTC de 256 dimensiones que opera sobre características visuales congeladas de Auto-AVSR (tamaño 768) y representaciones fonéticas congeladas de XPhoneBERT (máximo 96 unidades fonéticas). Este scorer produce una puntuación escalar de alineación entre el vídeo (máximo 250 fotogramas) y el texto candidato. El segundo módulo es un razonador basado en Qwen3.5-9B adaptado con LoRA, que consume la puntuación de alineación, tokens blandos por sonido y el texto candidato, y genera un logit de "Sí" menos el logit de "No" como salida final.

El entrenamiento se realizó en dos fases. Primero, el scorer de alineación se entrenó durante 3 épocas con batch size 32, optimizador AdamW y learning rate 3e-4. Segundo, el razonador LoRA se adaptó durante 1 época con AdamW y learning rate 1e-4, restringiendo la adaptación únicamente a las proyecciones de atención. No se menciona el uso de RLHF ni DPO; el enfoque es supervisado. La evaluación reporta AUC agrupado y precisión pareada en un benchmark de siete idiomas con títulos disjuntos, sensibilidad a desplazamientos fijos, transferencia a MuAViC y tareas de reordenamiento y asignación posteriores.

## Capacidades

- Evaluación de compatibilidad vídeo-texto: predice si un texto candidato se ajusta al contenido visual y fonético de un vídeo, útil para validar doblajes.
- Sincronía labial: detecta desalineaciones temporales entre el movimiento de los labios y el texto, con sensibilidad a desplazamientos fijos.
- Razonamiento lingüístico: el componente LLM (Qwen3.5-9B) procesa la puntuación de alineación junto con el texto para emitir un juicio binario (Sí/No).
- Multilingüe: evaluado en siete idiomas, aunque no se especifican cuáles; soporta transferencia a conjuntos de datos como MuAViC.
- Adaptabilidad a dominios: requiere recalibrar dos constantes escalares de normalización cuando se evalúa en un dominio distinto al de entrenamiento.
- Integración en pipelines de doblaje: puede usarse como módulo de reordenamiento (reranking) o asignación de candidatos de texto a segmentos de vídeo.

## Casos de uso

- Validación automática de doblajes generados: en un pipeline de doblaje automático, el modelo puede puntuar cada par (vídeo, texto candidato) para descartar aquellos con mala sincronía labial antes de la entrega al usuario final.
- Control de calidad en plataformas de streaming: integrar el modelo como filtro previo a la publicación de contenidos doblados, detectando errores de sincronización que los revisores humanos podrían pasar por alto.
- Reordenamiento de candidatos en sistemas de subtitulado: dado un conjunto de traducciones candidatas para una escena, el modelo asigna la puntuación más alta al texto que mejor se alinea con el movimiento labial del actor.
- Evaluación de modelos de síntesis de voz con vídeo: comparar diferentes sistemas de text-to-speech (TTS) para doblaje, usando la puntuación del juez como métrica objetiva de calidad de sincronía.
- Investigación en aprendizaje multimodal: servir como baseline para estudiar la relación entre representaciones visuales (Auto-AVSR) y fonéticas (XPhoneBERT) en tareas de alineación audiovisual.
- Asistencia a editores humanos: en herramientas de edición de vídeo, el modelo puede marcar automáticamente los segmentos donde el doblaje no coincide con el movimiento de los labios, agilizando la corrección manual.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card menciona que el artículo correspondiente reporta AUC agrupado y precisión pareada en un benchmark de siete idiomas, sensibilidad a desplazamientos fijos, transferencia a MuAViC y tareas de reordenamiento/asignación, pero no se proporcionan cifras concretas en el repositorio ni en la documentación accesible. Por tanto, no es posible presentar una tabla comparativa con valores numéricos verificables.

## Requisitos de hardware

- El adaptador LoRA en sí es ligero (rank 16, alpha 32, solo proyecciones de atención), pero requiere cargar el modelo base Qwen3.5-9B completo para inferencia.
- VRAM estimada para el modelo base en FP16: aproximadamente 18 GB (para 9B parámetros). Con cuantización de 8 bits, unos 9-10 GB; con 4 bits, unos 5-6 GB. El adaptador añade una sobrecarga mínima.
- GPU recomendadas: para FP16, una NVIDIA A100 (40 GB) o RTX 4090 (24 GB) es suficiente. Para cuantización 4 bits, una RTX 3090 (24 GB) o incluso GPUs con 8-12 GB pueden funcionar, aunque con menor velocidad.
- El checkpoint de alineación y el proyector son modelos pequeños (256 dims, 768 dims de entrada) que pueden ejecutarse en CPU o en cualquier GPU con poca VRAM.
- Opciones de despliegue: el adaptador es compatible con la librería PEFT de Hugging Face, por lo que puede integrarse con vLLM, TGI o cualquier framework que soporte LoRA. El scorer de alineación requiere código personalizado del repositorio GitHub.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y de la longitud del vídeo (máximo 250 fotogramas) y del texto (máximo 96 unidades fonéticas).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para la evaluación de compatibilidad vídeo-texto en doblaje. Existen otros "judge models" genéricos para evaluar respuestas de LLMs (como los mencionados en los resultados de búsqueda), pero no son directamente comparables en arquitectura ni en propósito. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo predice compatibilidad vídeo-texto, no una probabilidad calibrada de calidad de doblaje percibida por humanos. Las puntuaciones no deben interpretarse como medidas absolutas de calidad subjetiva.
- La salida del razonador basado en LLM puede variar entre ejecuciones de entrenamiento, lo que introduce cierta inestabilidad en las puntuaciones.
- Para evaluar en un dominio distinto al de entrenamiento, es necesario recalibrar dos constantes escalares de normalización utilizando pares genuinos conocidos del dominio objetivo; sin esta recalibración, el rendimiento puede degradarse.
- La resolución temporal fina es más débil que la de un modelo de sincronía condicionado por audio; no es adecuado para detectar desalineaciones de muy corta duración.
- Los modelos upstream (Qwen3.5-9B, XPhoneBERT, Auto-AVSR) conservan sus propias licencias y términos; aunque el adaptador es Apache-2.0, el uso comercial puede estar sujeto a las restricciones de esos modelos base.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un proyecto en fase temprana sin validación comunitaria amplia.
- No se proporcionan datos sobre sesgos específicos, pero al ser un modelo multilingüe, puede presentar disparidades de rendimiento entre idiomas no documentadas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/lr10260/dubbing-judge-model
- Perfil del autor: https://huggingface.co/lr10260
- Código del proyecto: https://github.com/ruiiu/dubbing_judge
- Dataset e intermediarios: https://huggingface.co/datasets/lr10260/dubbing-judge-data
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo XPhoneBERT: https://huggingface.co/vinai/xphonebert-base
