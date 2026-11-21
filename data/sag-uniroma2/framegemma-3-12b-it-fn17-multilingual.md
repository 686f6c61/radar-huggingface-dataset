# sag-uniroma2/FrameGemma-3-12b-it-FN17-Multilingual

## Resumen

FrameGemma-3-12b-it-FN17-Multilingual es un modelo publicado en Hugging Face por el usuario sag-uniroma2, presuntamente vinculado a la Universidad de Roma Tor Vergata (Sapienza/Uniroma2 según la nomenclatura del identificador). El nombre sugiere un ajuste fino (fine-tuning) del modelo base Gemma 3 12B en su variante instruction-tuned, con un sufijo "FN17" y la etiqueta "Multilingual" que apuntan a un entrenamiento orientado a cobertura multilingüe, aunque no se especifica qué idiomas ni con qué datos. El identificador "Frame" podría indicar un enfoque de entrenamiento basado en marcos (frames) semánticos o de anotación, pero esto no se confirma en la información disponible.

La model card publicada es prácticamente vacía: solo contiene la declaración de licencia Apache 2.0, sin descripción, sin especificaciones técnicas, sin datos de entrenamiento y sin resultados de evaluación. El repositorio no registra descargas ni interacciones en el momento de la consulta, lo que sugiere una publicación reciente o de baja difusión dentro del ecosistema.

Por tanto, esta ficha se construye a partir de la información mínima del repositorio y de las características conocidas del modelo base Gemma 3 12B-IT, que se indican explícitamente como inferidas y no verificadas por el autor. Cualquier dato no confirmado se marca como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Gemma 3 12B; no confirmado por el autor) |
| Parametros totales | 12 000 millones (según el nombre del modelo; no confirmado en la model card) |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible (Gemma 3 12B-IT soporta hasta 128 000 tokens; no confirmado para este fine-tuning) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la etiqueta "Multilingual" sugiere cobertura multilingüe, sin detalle) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (no se especifica safetensors, GGUF ni otros) |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura concreta de este modelo más allá de lo que sugiere su nombre. Si se trata de un fine-tuning de Gemma 3 12B-IT, la base sería un transformer decoder-only con atención multi-cabeza, normalización RMSNorm, activaciones GeGLU y RoPE, con soporte multimodal de imagen en el modelo original de Google DeepMind. El sufijo "FN17" y la etiqueta "Multilingual" indican algún tipo de ajuste supervisado o preferencial orientado a idiomas, pero no se detalla la composición del dataset, el número de tokens de entrenamiento, ni si se emplearon técnicas como SFT, DPO, RLHF o RLVR.

Tampoco se documentan innovaciones técnicas específicas (decodificación especulativa, atención lineal, mezcla de expertos, etc.). La model card no incluye información sobre el proceso de entrenamiento, los datos utilizados ni las decisiones de diseño. Cualquier afirmación sobre la arquitectura o el entrenamiento más allá de la inferencia a partir del nombre del modelo carece de respaldo documental.

## Capacidades

- Generación de texto y razonamiento: se espera que herede las capacidades del modelo base Gemma 3 12B-IT, incluyendo razonamiento multi-paso y respuesta a instrucciones, aunque no hay evaluación publicada para este fine-tuning.
- Multilingüismo: la etiqueta "Multilingual" en el nombre sugiere soporte para varios idiomas, pero no se especifica cuáles ni con qué calidad.
- Código y matemáticas: presumiblemente heredadas del modelo base, sin datos de evaluación específicos.
- Tool calling / function calling: no disponible; no se documenta soporte explícito.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible; el modelo base Gemma 3 12B-IT es multimodal de imagen, pero no se confirma que este fine-tuning conserve esa capacidad.
- Ajuste "Frame": el nombre sugiere un enfoque de marcos semánticos o de anotación, pero no se documenta en qué consiste ni qué capacidades añade.

## Casos de uso

- Evaluación comparativa de fine-tunings multilingües: el modelo puede utilizarse como candidato en experimentos de evaluación de calidad multilingüe frente al Gemma 3 12B-IT original, siempre que se validen sus capacidades con un conjunto de pruebas propio.
- Investigación académica sobre ajuste fino: adecuado para estudiar el efecto de un fine-tuning etiquetado como "Frame" y "Multilingual" sobre un modelo base conocido, comparando degradación o mejora en tareas estándar.
- Generación de texto asistida en entornos de investigación: para prototipos internos donde la licencia Apache 2.0 y la ausencia de restricciones comerciales sean relevantes.
- Experimentos de alineación y evaluación de sesgos: al ser un fine-tuning sobre Gemma 3, puede servir para analizar cómo el ajuste afecta a sesgos y comportamientos del modelo base en distintos idiomas.
- Despliegue en pipelines de generación de contenido multilingüe: solo tras validar empíricamente la calidad por idioma, dado que no hay benchmarks publicados.
- Base para nuevos fine-tunings: al estar bajo Apache 2.0, puede reutilizarse como punto de partida para ajustes posteriores, siempre que se verifique la calidad del modelo de partida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Para un modelo de 12 000 millones de parámetros, las estimaciones orientativas serían aproximadamente 24 GB en FP16, 12-14 GB en cuantización de 8 bits y 7-8 GB en cuantización de 4 bits, aunque no se confirma que existan pesos cuantizados publicados.
- GPU recomendadas: no disponible. Para FP16 se requerirían GPU con al menos 24 GB de VRAM (RTX 3090/4090, A10G, L4, A100 40 GB, H100). Para cuantizaciones de 4 bits podría caber en GPU consumer de 8-12 GB, sin garantía.
- ¿Cabe en GPU consumer? Previsiblemente sí en cuantización de 4 bits, pero no hay pesos GGUF ni cuantizaciones publicadas en el repositorio.
- Opciones de despliegue: no disponible. No se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni otros motores.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| FrameGemma-3-12b-it-FN17-Multilingual | 12 000 M (según nombre) | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Model card vacía, sin benchmarks |
| Gemma 3 12B-IT (modelo base presumible) | 12 000 M | 128 000 tokens | Gemma Terms of Use | Amplia | Multimodal de imagen, benchmarks publicados por Google |
| Mistral Nemo 12B Instruct | 12 000 M | 128 000 tokens | Apache 2.0 | Amplia | Alternativa de tamaño similar con licencia permisiva |
| Qwen2.5 14B Instruct | 14 000 M | 32 768 tokens (extensible) | Apache 2.0 | Amplia | Buen rendimiento en código y multilingüe |

La comparación con el modelo base es la más relevante, pero no se dispone de datos que permitan afirmar que este fine-tuning mejora o degrada las capacidades del Gemma 3 12B-IT original.

## Limitaciones y advertencias

- Model card prácticamente vacía: no hay información sobre datos de entrenamiento, evaluación, sesgos ni limitaciones, lo que impide una evaluación rigurosa.
- Sin benchmarks publicados: no se puede verificar que el fine-tuning mejore al modelo base ni que mantenga sus capacidades.
- Riesgo de alucinación: presumiblemente similar al del modelo base, pero no evaluado para este fine-tuning.
- Sesgos conocidos: no documentados; al ser un ajuste sobre Gemma 3, podría heredar sesgos del modelo base y añadir otros derivados de los datos de ajuste, que se desconocen.
- Idiomas: la etiqueta "Multilingual" no especifica cobertura ni calidad por idioma; no se debe asumir un rendimiento uniforme.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar que el fine-tuning respeta los términos del modelo base Gemma 3, cuyas condiciones de uso pueden imponer restricciones adicionales.
- Repositorio sin actividad: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación comunitaria y la confianza en el artefacto.
- Formato de pesos no confirmado: no se garantiza la disponibilidad de safetensors ni de cuantizaciones listas para usar.
- Nombre ambiguo: "Frame" y "FN17" no se explican en la documentación, lo que dificulta entender el propósito real del ajuste.

## Enlaces

- Hugging Face: https://huggingface.co/sag-uniroma2/FrameGemma-3-12b-it-FN17-Multilingual
- Modelo base presumible (Gemma 3 12B-IT): no se proporciona enlace en la información disponible
- Paper, blog o repositorio del autor: no disponible
- Demo: no disponible
