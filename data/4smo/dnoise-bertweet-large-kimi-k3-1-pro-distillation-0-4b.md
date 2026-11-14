# 4smo/Dnoise-Bertweet-large-Kimi-K3.1-Pro-distillation-0.4B

## Resumen

Dnoise-Bertweet-large-Kimi-K3.1-Pro-distillation-0.4B es un modelo de clasificación de texto en inglés especializado en la detección de propaganda en el contexto del conflicto ruso-ucraniano, entrenado sobre publicaciones de Twitter/X. Lo desarrolla el usuario 4smo y parte del modelo base `vinai/bertweet-large`, un transformer encoder de tipo RoBERTa adaptado al dominio de Twitter. El nombre indica que se ha aplicado un proceso de destilación de conocimiento desde un modelo mayor (etiquetado como Kimi K3.1 Pro) hacia este clasificador compacto de aproximadamente 355 millones de parámetros.

El modelo resuelve una tarea acotada y bien definida: clasificar texto como propaganda o no propaganda en el marco informativo del conflicto ruso-ucraniano. Su relevancia radica en la especialización de dominio y en el uso de destilación para trasladar capacidad de un modelo grande a un clasificador ligero, desplegable con recursos modestos. No obstante, el repositorio es de acceso restringido (gated), no acumula descargas ni interacciones en el momento de redactar esta ficha y la información pública disponible es muy limitada.

La ficha se ha elaborado a partir exclusivamente de los metadatos del repositorio de Hugging Face. Cualquier dato no presente en dicha información se marca explícitamente como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo RoBERTa (base: vinai/bertweet-large) |
| Parametros totales | 355.361.794 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Bertweet-large usa 128 tokens, dato no confirmado para este fine-tuning) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre `vinai/bertweet-large`, un transformer encoder de la familia RoBERTa adaptado específicamente al lenguaje de Twitter mediante un tokenizador y un corpus propios del dominio. Sobre esa base se ha realizado un fine-tuning para clasificación de texto con la etiqueta `propaganda-detection`, orientado al contexto ruso-ucraniano y a publicaciones de Twitter/X. El nombre del repositorio sugiere un proceso de destilación de conocimiento desde un modelo mayor denominado Kimi K3.1 Pro, si bien no se detalla la metodología de destilación, el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

No se dispone de información sobre hiperparámetros, composición del corpus de entrenamiento, proceso de anotación de etiquetas ni innovaciones técnicas adicionales. La arquitectura es la estándar de un encoder bidireccional para clasificación de secuencias; no se trata de un modelo generativo ni incorpora mecanismos como decodificación especulativa o atención lineal.

## Capacidades

- Clasificación de texto binaria o multiclase orientada a la detección de propaganda (la etiqueta del pipeline es `text-classification`; el número exacto de clases no está disponible).
- Especialización en contenido de Twitter/X en inglés.
- Enfoque temático en el conflicto ruso-ucraniano.
- Procesamiento de texto de entrada en inglés; no se documenta soporte multilingüe.
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- No se documenta razonamiento multi-paso, modo thinking, visión ni audio.
- Al ser un encoder de clasificación, no genera texto libre.

## Casos de uso

- Moderación de contenido en plataformas sociales: el modelo puede clasificar publicaciones de Twitter/X en inglés para señalar contenido propagandístico en el contexto ruso-ucraniano, integrándose en pipelines de revisión previa a la publicación o de marcado posterior.
- Monitorización de narrativas en investigación de desinformación: analistas pueden procesar lotes de tuits para cuantificar la presencia de propaganda en un periodo o conjunto de cuentas, aprovechando la especialización temática del modelo.
- Enriquecimiento de datasets de estudio: investigadores pueden usar el clasificador para etiquetar automáticamente grandes volúmenes de publicaciones y construir corpus anotados para análisis posteriores.
- Filtrado previo en sistemas de alerta temprana: el modelo sirve como primera etapa de cribado que reduce el volumen de contenido a revisar manualmente por equipos de verificación.
- Análisis OSINT asistido: periodistas y equipos de verificación pueden usar el modelo para priorizar la revisión de publicaciones con alta probabilidad de propaganda, complementando la labor humana.
- Investigación académica sobre propaganda: dado su tamaño compacto (355 millones de parámetros) y licencia MIT, es viable desplegarlo en entornos de investigación con recursos limitados para experimentos reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma documentada. Como referencia orientativa para un encoder de 355 millones de parámetros, la inferencia en FP32 requiere del orden de 1,4 GB de memoria para los pesos, y en FP16 aproximadamente 0,7 GB, sin contar activaciones ni overhead del runtime.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU consumer moderna (por ejemplo, RTX 3060 en adelante) debería poder ejecutar el modelo con holgura.
- Cabe en GPU consumer: sí, por el tamaño del modelo, aunque no se documenta ningún requisito oficial.
- Opciones de despliegue: no disponible. Al ser un modelo de la familia RoBERTa, es compatible con librerías estándar de Hugging Face Transformers; el soporte en vLLM, llama.cpp u Ollama no está confirmado.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dnoise-Bertweet-large-Kimi-K3.1-Pro-distillation-0.4B | 355 M | no disponible | Detección de propaganda (Twitter/X, ruso-ucraniano) | MIT | Gated en Hugging Face |
| vinai/bertweet-large (modelo base) | ~355 M | 128 tokens (Bertweet) | Modelo de lenguaje enmascarado para Twitter | MIT | Público en Hugging Face |
| Clasificadores de propaganda genéricos en Hugging Face | no disponible | no disponible | Detección de propaganda | variable | variable |

No se dispone de información suficiente para comparar métricas de rendimiento con alternativas, ya que este modelo no publica resultados de benchmarks.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face, lo que puede limitar la reproducibilidad y el uso automatizado.
- Información muy escasa: no se documentan dataset de entrenamiento, métricas, hiperparámetros ni metodología de destilación, lo que dificulta evaluar su fiabilidad.
- Sesgo de dominio: entrenado sobre Twitter/X en inglés y centrado en el conflicto ruso-ucraniano; su rendimiento fuera de ese dominio o idioma es incierto.
- Riesgo de falsos positivos y negativos: al ser un clasificador de propaganda, puede confundir crítica legítima, sátira o reporte periodístico con propaganda, o pasar por alto contenido propagandístico sutil.
- Riesgo de alucinación: no aplica en sentido generativo, pero sí existe riesgo de clasificaciones erróneas presentadas con alta confianza.
- Multilingüismo: solo se declara inglés; no es adecuado para texto en ruso, ucraniano u otros idiomas sin validación adicional.
- Licencia MIT: permite uso comercial, pero el carácter gated y la falta de documentación aconsejan validar el modelo con datos propios antes de usarlo en producción.
- Sin métricas publicadas: no hay evidencia cuantitativa de su calidad, por lo que no debe asumirse un rendimiento superior al de alternativas sin una evaluación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/4smo/Dnoise-Bertweet-large-Kimi-K3.1-Pro-distillation-0.4B
- Modelo base: https://huggingface.co/vinai/bertweet-large
