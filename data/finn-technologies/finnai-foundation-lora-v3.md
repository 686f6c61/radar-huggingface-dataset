# Finn-Technologies/FinnAI-Foundation-LoRA-v3

## Resumen

FinnAI-Foundation-LoRA-v3 es un adaptador LoRA publicado por Finn-Technologies sobre el modelo base LiquidAI/LFM2.5-VL-1.6B. Se trata, por tanto, de un ajuste fino ligero (no de un modelo completo): el repositorio contiene únicamente los pesos del adaptador en formato safetensors y se carga mediante la librería PEFT sobre el modelo base de Liquid AI. El entrenamiento se realizó con supervisión (SFT) utilizando la librería TRL.

El modelo base, según se deduce de su identificador, pertenece a la familia LFM2.5 de Liquid AI y tiene aproximadamente 1.600 millones de parámetros, con designación VL (vision-language). El adaptador hereda esas características, pero la model card no documenta la arquitectura concreta, la longitud de contexto, los idiomas soportados ni la licencia. El pipeline declarado en HuggingFace es text-generation.

La relevancia de esta publicación es limitada y debe contextualizarse: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, no incluye resultados de benchmarks, no describe el dataset de entrenamiento ni los hiperparámetros del LoRA, y la model card presenta bloques vacíos (procedimiento de entrenamiento y citas). Para un evaluador técnico, se trata de un artefacto reproducible pero escasamente documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre LiquidAI/LFM2.5-VL-1.6B; arquitectura del modelo base no disponible |
| Parametros totales | No disponible para el adaptador; el modelo base tiene ~1,6B segun su identificador |
| Parametros activos | No aplica (no se indica que el modelo base sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; los pesos del adaptador se distribuyen en safetensors |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card indica "licence: license" sin especificar terminos) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, repositorio de 0,1 GB) |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA) entrenado mediante SFT con la librería TRL 1.13.0 y PEFT 0.21.0. El entorno de entrenamiento declarado incluye Transformers 5.17.0, PyTorch 2.10.0+cu128, Datasets 5.0.0 y Tokenizers 0.23.2. No se especifican el rango (rank), el valor alpha, los módulos objetivo, la tasa de aprendizaje, el número de pasos ni la composición del dataset de ajuste. La sección "Training procedure" de la model card está vacía salvo por la mención al uso de SFT.

No se documenta ninguna innovación técnica propia del adaptador. Todas las características arquitectónicas relevantes (tipo de atención, mecanismos de decodificación, tratamiento de la modalidad visual) provienen del modelo base LiquidAI/LFM2.5-VL-1.6B, cuyas especificaciones no se reproducen en la información disponible. Tampoco se indica si hubo etapas posteriores de alineación (RLHF, DPO) ni evaluación intermedia.

## Capacidades

- Generación de texto: es la tarea declarada en el pipeline tag del repositorio (`text-generation`).
- Modalidad visual: el modelo base incluye la designación "VL" en su nombre, lo que sugiere capacidades de visión-lenguaje, pero el adaptador no documenta si preserva o modifica dichas capacidades.
- Ajuste por instrucciones: al haberse entrenado con SFT, se presupone una adaptación al formato de instrucciones, aunque no se describe el formato ni los datos empleados.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo de razonamiento explícito, audio, etc.): no disponible.

## Casos de uso

Debe tenerse en cuenta que los siguientes escenarios son aplicaciones plausibles derivadas del tipo de artefacto y del tamaño del modelo base, no casos validados por el autor ni respaldados por evaluaciones publicadas.

- Asistente conversacional ligero en local: al tratarse de un adaptador sobre un modelo de ~1,6B de parámetros, puede desplegarse en hardware de consumo para generar respuestas en un dominio concreto, siempre que se valide primero la calidad del ajuste.
- Clasificación y etiquetado de texto: uso del modelo como generador condicionado para tareas de extracción o categorización, integrándolo en un pipeline de procesado por lotes.
- Prototipado rápido de funcionalidades de lenguaje natural: el tamaño reducido del adaptador (0,1 GB) permite iterar y comparar versiones sin necesidad de almacenar múltiples copias completas del modelo base.
- Investigación sobre ajuste eficiente de parámetros: sirve como ejemplo reproducible de un entrenamiento SFT con TRL y PEFT, útil para estudiar configuraciones de LoRA sobre modelos pequeños.
- Despliegue en el borde o en entornos con recursos limitados: si el modelo base cuantizado cabe en unos pocos gigabytes, es viable ejecutarlo en equipos sin GPU dedicada de gama alta, sujeto a verificación de calidad.
- Evaluación comparativa de adaptadores: al compartir modelo base, este adaptador puede emplearse como punto de referencia frente a otras variantes afinadas del mismo LFM2.5-VL-1.6B.
- Procesamiento de documentos con componente visual: únicamente si se confirma que las capacidades de visión del modelo base se conservan tras el ajuste; de lo contrario, el caso no es aplicable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna tabla de evaluación (MMLU, HumanEval, GSM8K, MMMU u otros), ni comparaciones con modelos alternativos, ni métricas de pérdida durante el entrenamiento.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del tamaño del modelo base (~1,6B parámetros) y no han sido verificadas por el autor.

- VRAM estimada para inferencia en el modelo base: en torno a 3,2-4 GB en fp16/bf16, ~2 GB en cuantización de 8 bits y ~1-1,5 GB en 4 bits, más el consumo adicional del contexto y de la caché KV.
- El adaptador LoRA en sí ocupa 0,1 GB y se suma a los requisitos del modelo base.
- GPU recomendadas para fp16: NVIDIA RTX 3060 12 GB, RTX 4060 Ti, RTX 4090, A10G, L4 o superiores.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 6 GB o más de VRAM en cuantización de 4 bits, y en GPU integrada o CPU con llama.cpp si existe una conversión GGUF del modelo base.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador, vLLM o TGI para servicio (requieren soporte del modelo base), llama.cpp/Ollama si se dispone de pesos GGUF del modelo base fusionado.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del adaptador, por lo que la comparación se limita a aspectos estructurales. Se incluyen dos alternativas habituales en el segmento de modelos pequeños con capacidad visual, cuyos datos no han sido verificados en la información proporcionada.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| FinnAI-Foundation-LoRA-v3 (adaptador) | Adaptador sobre ~1,6B | No disponible | No disponible | safetensors (PEFT) | HuggingFace, 0 descargas |
| LiquidAI/LFM2.5-VL-1.6B (modelo base) | ~1,6B | No disponible | No disponible | No disponible | HuggingFace |
| Qwen2.5-VL-3B | ~3B | No disponible | No disponible | No disponible | HuggingFace |
| SmolVLM (variantes de ~2B) | ~2B | No disponible | No disponible | No disponible | HuggingFace |

No se dispone de datos comparativos de rendimiento (benchmarks) entre estas opciones en la información consultada.

## Limitaciones y advertencias

- Documentación mínima: la model card está prácticamente vacía en lo relativo a datos de entrenamiento, hiperparámetros y evaluación, lo que impide reproducir el ajuste con fidelidad.
- Sin evidencia de calidad: no existen benchmarks, métricas ni evaluaciones publicadas; el rendimiento real del adaptador es desconocido.
- Licencia indeterminada: la model card indica "licence: license" sin concretar términos, y la licencia del modelo base tampoco se especifica en la información disponible. No debe asumirse uso comercial libre sin verificar ambas licencias por separado.
- Riesgo de olvido catastrófico: al ser un ajuste SFT sobre un modelo pequeño, es probable la degradación de capacidades generales o de la modalidad visual del modelo base si el dataset de ajuste fue estrecho; esto no se ha documentado ni medido.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño, sin que se hayan publicado evaluaciones de fidelidad.
- Sesgos: no disponibles; no se documenta la composición del dataset ni posibles sesgos sociales, lingüísticos o de dominio.
- Idiomas: no disponibles; no se puede confirmar el soporte de castellano ni de otras lenguas.
- Contexto: longitud de contexto desconocida, lo que impide planificar despliegues que dependan de ventanas largas.
- Madurez: repositorio con 0 descargas y 0 likes, publicado sin historial de uso ni mantenimiento conocido; no es un artefacto validado por la comunidad.
- Fechas de creación y actualización: los metadatos indican 2026-09-25, posteriores a la fecha de consulta habitual, lo que conviene contrastar antes de citar el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Finn-Technologies/FinnAI-Foundation-LoRA-v3
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-VL-1.6B
- Repositorio de TRL: https://github.com/huggingface/trl
- Repositorio de PEFT: no disponible en la información proporcionada
- Paper o blog técnico del autor: no disponible
- Demo o espacio asociado: no disponible
- Nota: las búsquedas web realizadas no devolvieron resultados relacionados con este modelo; los enlaces recuperados correspondían a entidades no vinculadas (Finn.no, clase de vela Finn, etc.) y se han descartado.
