# leslie721007/babylm-strict-small-scale1p75-chck84

## Resumen

Este repositorio contiene un checkpoint concreto del modelo `AdapterDebertaV2ForMaskedLM`, un modelo de lenguaje enmascarado (MLM) basado en DeBERTa-v2 con adaptadores residuales de cuello de botella, entrenado dentro del marco del reto BabyLM 2026 en la pista Strict-Small. El modelo ha sido desarrollado por el usuario leslie721007 y está pensado para investigar la eficiencia de muestreo y la asignación de competencias lingüísticas en modelos pequeños entrenados con un corpus limitado a 10 millones de palabras.

El checkpoint `chck_84M` corresponde a un punto intermedio de entrenamiento con una exposición acumulada de 84.028.405 palabras (8,4 épocas sobre el pool de 10M). El modelo tiene 35.463.008 parámetros totales cuando se carga con el código personalizado (`trust_remote_code=True`), ya que la arquitectura nativa de DeBERTa-v2 sin los adaptadores tendría menos parámetros y no correspondería a la función evaluada. La relevancia de este modelo radica en que sirve como evidencia empírica sobre la existencia de picos estrechos de competencia tardía en trayectorias de entrenamiento, un fenómeno que el autor documenta y que tiene implicaciones para el diseño de estrategias de parada temprana y selección de checkpoints.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v2 con adaptadores residuales de cuello de botella (bottleneck 128, escala 1.75) |
| Parametros totales | 35.463.008 (con `trust_remote_code=True`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en fp32) |
| Idiomas soportados | en (ingles) |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura DeBERTa-v2, un transformer encoder con atencion desenredada (disentangled attention) y mecanismo de decodificacion mejorada. Sobre esta base, el autor anade adaptadores residuales de cuello de botella con dimension 128 y una escala fija de 1.75, que se insertan en las capas del transformer. Estos adaptadores permiten modificar la representacion interna sin cambiar el cuerpo principal del modelo, lo que facilita el estudio de la asignacion de recursos durante el entrenamiento.

El entrenamiento se realizo sobre el corpus BabyLM Strict-Small, que contiene 10 millones de palabras en ingles. El checkpoint `chck_84M` corresponde a una exposicion de 84.028.405 palabras, es decir, 8,4 epocas sobre el pool completo. No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion; se trata de un entrenamiento clasico de modelado de lenguaje enmascarado. El autor indica que el modelo sigue mejorando en la perdida de MLM incluso despues de este punto, pero que las competencias evaluadas en tareas externas alcanzan un pico estrecho alrededor de las 84M palabras, para luego declinar.

## Capacidades

- Modelado de lenguaje enmascarado (fill-mask): predice tokens enmascarados en contexto, util para representaciones contextuales.
- Representaciones contextuales de alta calidad para tareas downstream de comprension del lenguaje.
- Competencias linguisticas evaluadas en baterias como BLiMP (68,25), SuperGLUE (69,31) y EWoK (50,07), segun los datos del autor.
- Capacidad de razonamiento basico y comprension de entidades, aunque con resultados modestos (Entity 28,58, GlobalPIQA 38,12).
- No soporta tool calling, agentes, vision ni audio.
- Multilingue: no, solo ingles.

## Casos de uso

- Investigacion en eficiencia de muestreo: el modelo es un punto de referencia para estudiar como la cantidad de datos de entrenamiento afecta a la adquisicion de competencias especificas en modelos pequenos.
- Analisis de trayectorias de entrenamiento: permite comparar checkpoints intermedios (82M, 84M, 86M, 100M) para identificar picos de competencia y disenar criterios de parada temprana.
- Fine-tuning para tareas de clasificacion de texto en ingles: al ser un encoder DeBERTa-v2, puede adaptarse a tareas como analisis de sentimiento, deteccion de toxicidad o clasificacion de topicos con un coste computacional minimo.
- Evaluacion de metodos de adaptacion: los adaptadores residuales permiten estudiar el impacto de la intervencion en capas concretas, util para investigacion en transferencia y regularizacion.
- Educacion y divulgacion: por su tamano reducido (35M parametros), es adecuado para demostraciones de MLM y para ensenar conceptos de arquitecturas eficientes en recursos.
- Reproducibilidad cientifica: el repositorio incluye hashes SHA256 de los artefactos (modelo, tokenizador, pool de datos), lo que permite verificar la integridad y reproducir experimentos.

## Benchmarks y rendimiento

El autor proporciona las siguientes puntuaciones oficiales para este checkpoint, calculadas con la pipeline de evaluacion de BabyLM 2026:

| Tarea | Puntuacion |
|---|---|
| Overall projection (AoA=0) | 42,0189 |
| BLiMP | 68,2500 |
| Supplement | 63,4800 |
| EWoK | 50,0700 |
| Entity | 28,5800 |
| COMPS | 52,2100 |
| GlobalPIQA | 38,1200 |
| Reading | 8,1550 |
| SuperGLUE | 69,3052 |

Estas puntuaciones son las reportadas por el autor en la model card. No se dispone de comparaciones con otros modelos de la misma categoria en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en fp32 (35M parametros), por lo que cabe en cualquier GPU consumer moderna (GTX 1060 6GB o superior) e incluso en CPU con RAM suficiente.
- GPU recomendadas: no se requiere GPU especifica; cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia y fine-tuning.
- Despliegue: compatible con la libreria Transformers de HuggingFace, usando `trust_remote_code=True`. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI, pero al ser un modelo pequeno, puede ejecutarse en CPU con latencia baja.
- Latencia: no disponible, pero por el tamano del modelo se espera una latencia de milisegundos en GPU y de decenas de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de informacion sobre otros modelos de la misma categoria (BabyLM Strict-Small) en los datos proporcionados. El autor menciona dos checkpoints comparables de su propia trayectoria:

| Modelo | Overall projection (AoA=0) | Notas |
|---|---|---|
| chck_84M (este) | 42,0189 | Checkpoint ordinario, pico estrecho de competencia |
| chck_82M (protegido) | 41,9425 (estimado a partir de la diferencia +0,0764) | Checkpoint anterior, ligeramente inferior |
| coherent86 alpha0.75 | 42,1210 (estimado a partir de la diferencia -0,1021) | Interpolacion de endpoints, no es un checkpoint ordinario |

Los valores de chck_82M y coherent86 se han estimado a partir de las diferencias reportadas por el autor, no son datos directos. No se dispone de comparaciones con modelos de otros equipos.

## Limitaciones y advertencias

- Licencia "other" no especificada: el uso comercial puede estar restringido; se recomienda contactar al autor antes de utilizarlo en produccion.
- Requiere `trust_remote_code=True` para cargar la funcion exacta evaluada; sin esta opcion, Transformers instancia un DeBERTa-v2 nativo con menos parametros y sin los adaptadores, lo que produce resultados diferentes.
- Rendimiento muy bajo en tareas de lectura (Reading 8,155) y entidades (Entity 28,58), lo que indica limitaciones en comprension lectora y conocimiento factual.
- Sesgos potenciales derivados del corpus limitado (10M palabras, solo ingles), que puede no representar la diversidad linguistica ni cultural.
- Riesgo de alucinacion en tareas generativas, aunque al ser un modelo de solo encoder (MLM), su uso principal no es la generacion de texto libre.
- El pico de competencia en 84M es estrecho y transitorio; el modelo declina en tareas externas a partir de ese punto, por lo que no es adecuado como checkpoint final para aplicaciones generales.
- No se proporcionan cuantizaciones oficiales; el unico formato disponible es safetensors en fp32.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/leslie721007/babylm-strict-small-scale1p75-chck84
- Checkpoint hermano (chck_82M): https://huggingface.co/leslie721007/babylm-strict-small-scale1p75-chck82
- Web oficial de BabyLM: https://babylm.github.io/
- Dataset BabyLM 2026 Strict-Small: https://huggingface.co/datasets/BabyLM-community/BabyLM-2026-Strict-Small
- Repositorio de evaluacion BabyLM 2026: https://github.com/babylm-org/babylm-eval
