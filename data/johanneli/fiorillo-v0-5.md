# johanneli/fiorillo-v0.5

## Resumen

Fiorillo v0.5 es un modelo médico de investigación desarrollado por johanneli que responde a tres preguntas clínicas concretas emitiendo decisiones tipadas (typed decisions) acompañadas de probabilidades calibradas. No es un modelo generativo de propósito general: enruta cada consulta a un especialista propio y no delega en ningún otro modelo, con una tasa de hand-off fijada en cero. Se construye sobre el modelo base Qwen/Qwen3-4B-Base, un transformer decoder-only de aproximadamente 4.000 millones de parámetros, al que se añaden adaptadores y una cabeza de decisión procedente del paquete Laya (Apache-2.0).

Las tres tareas cubiertas son: (1) determinar si un ensayo clínico reporta un resultado significativamente superior, significativamente inferior o no significativamente distinto frente a un comparador (Evidence Inference 2.0); (2) responder a una pregunta de investigación biomédica a partir de su resumen (PubMedQA, con salidas sí/no/tal vez); y (3) estimar la ventana de reingreso hospitalario de un paciente diabético (UCI Diabetes 130-US hospitals: sin reingreso, más de 30 días o dentro de 30 días).

Su relevancia radica en el enfoque de calibración explícita (temperatura ajustada sobre validación limpia, temperature_intercepts y una temperatura de pool T = 0,9957) y en el cuidado con las licencias de los datos de entrenamiento, que llevó a excluir de la release al especialista de la versión anterior por no poder verificar la licencia de 1.226 artículos. El modelo es exclusivamente para investigación: no es un producto sanitario y no debe usarse para tomar decisiones clínicas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-4B-Base) con adaptadores y cabeza de decisión del paquete Laya |
| Parametros totales | Aproximadamente 4.000 millones (heredados del modelo base Qwen/Qwen3-4B-Base) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (la model card menciona adaptadores LoRA; el repositorio ocupa 0,9 GB) |

## Arquitectura y entrenamiento

Fiorillo v0.5 no es un modelo monolítico, sino un sistema de tres especialistas enrutados por la pregunta recibida. El especialista de Evidence Inference 2.0 (s9_ei_wavg) es un modelo cuyos adaptadores, proyección y cabeza promedian exactamente las tres ejecuciones de su receta, y consume un pase de lector (una pasada forward de un lector de tipo language model). El especialista de PubMedQA (s7_b3) es idéntico al de la versión v0.3 y también consume un pase de lector. El especialista de ventana de reingreso es un pool sin pases de lector: una mezcla ponderada de xgboost_tuned (peso 0,4) y catboost_tuned (peso 0,6), con temperatura de pool 0,9957. La cabeza de decisión del lector procede del paquete laya (Apache-2.0).

En cuanto a los datos, el especialista de Evidence Inference 2.0 de v0.5 se entrenó únicamente con los 1.431 artículos de entrenamiento (5.279 prompts) cuyo propio enunciado de licencia es CC BY, CC0 o dominio público, más 179 artículos de validación (1.610 en total). El especialista de v0.4 (s8_ei) se había entrenado con los 2.657 artículos completos del split de entrenamiento, pero 1.226 de ellos están sujetos a términos no comerciales, sin derivadas, share-alike, verbatim-only o de editoriales, o no declaran licencia, por lo que la publicabilidad de los pesos entrenados sobre ellos quedó marcada como UNVERIFIABLE y esos pesos no se liberan. Toda decisión de diseño de v0.5 (receta, media ponderada, promedio de swap, calibraciones, pool de reingreso) se congeló el 2 de octubre de 2026 a las 13:40 UTC antes de que existiera ninguna predicción de test del nuevo especialista de Evidence Inference. Las calibraciones empleadas son temperatura ajustada sobre prompts de validación limpios (Evidence Inference) y temperature_intercepts (PubMedQA, ajuste heredado de v0.3). No se documenta en la información disponible el uso de RLHF ni DPO.

## Capacidades

- Clasificación de efecto de evidencia clínica: decide si una intervención reporta un resultado significativamente mayor, significativamente menor o no significativamente distinto en comparación con un comparador, con probabilidades calibradas.
- Respuesta a preguntas biomédicas sobre un resumen (PubMedQA) con tres etiquetas: sí, no o tal vez.
- Predicción de ventana de reingreso hospitalario en pacientes diabéticos: sin reingreso, reingreso a más de 30 días o reingreso dentro de 30 días.
- Emisión de decisiones tipadas, es decir, salidas estructuradas asociadas a una probabilidad calibrada en lugar de texto libre.
- Enrutamiento interno por pregunta: cada consulta se asigna a su especialista sin delegación externa (tasa de hand-off igual a cero).
- Inferencia de evidencia sobre literatura biomédica con licencia verificada (CC BY, CC0 o dominio público).
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión ni audio en la información disponible.
- Multilingüismo limitado al inglés.

## Casos de uso

- Cribado de literatura científica: dado el par de entidades de un ensayo y su comparador, el especialista de Evidence Inference 2.0 clasifica el sentido del efecto y devuelve una probabilidad calibrada, lo que permite priorizar revisiones sistemáticas y descartar estudios con efecto no significativo.
- Extracción de evidencia para revisiones sistemáticas asistidas: el modelo aporta decisiones tipadas y calibradas que un investigador puede auditar por umbral de confianza, integrándose en flujos de trabajo de síntesis de evidencia sin sustituir el juicio del revisor.
- Filtrado y etiquetado de resúmenes biomédicos a escala: el especialista de PubMedQA permite asignar una respuesta sí/no/tal vez a preguntas de investigación a partir de resúmenes, útil para construir conjuntos de datos curados o índices temáticos.
- Gestión de riesgo de reingreso: el pool de reingreso estima la ventana de readmisión de pacientes diabéticos a partir de datos tabulares, como señal de apoyo a programas de seguimiento y planificación de recursos hospitalarios.
- Investigación en calibración y evaluación de incertidumbre: al exponer temperaturas de calibración y probabilidades explícitas, sirve como caso de estudio para medir ECE (expected calibration error) y comparar técnicas de calibración en dominios médicos.
- Auditoría de procedencia y licencias de datos: el modelo documenta la licencia de cada artículo usado en entrenamiento y validación (con PMCID y cita vía Europe PMC), lo que lo convierte en una referencia práctica para proyectos que necesitan trazabilidad de licencias en datasets médicos.
- Benchmarking de modelos fundamentales en clasificación clínica: al partir de Qwen3-4B-Base con adaptadores y cabezas específicas, es un punto de comparación reproducible frente a clasificadores basados en BERT biomédico en Evidence Inference, PubMedQA y reingreso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card referencia ficheros de resultados internos (results/fiorillo_v0_5/comparison.json, release_candidate.json, calibration_s9.json, recipe_selection.json y otros), pero no incluye cifras de métricas concretas (exactitud, F1, ECE) en el contenido proporcionado, por lo que no se presentan números.

## Requisitos de hardware

- Los pesos del modelo base no se redistribuyen en este repositorio; el repositorio ocupa 0,9 GB, lo que sugiere que solo contiene adaptadores, proyecciones y cabezas, no el modelo completo.
- VRAM para inferencia del lector (Qwen3-4B-Base): aproximadamente 8-9 GB en FP16, en torno a 5 GB en cuantización de 8 bits y unos 3 GB en 4 bits, como estimaciones orientativas dependientes del runtime.
- Los especialistas de PubMedQA y Evidence Inference requieren un pase de lector; el pool de reingreso no requiere ningún pase de lector y puede ejecutarse con los modelos XGBoost y CatBoost sobre CPU.
- GPU compatibles con el lector de 4B: NVIDIA A100, H100, L40S, RTX 4090, RTX 3090 y, en cuantización de 4 bits, GPUs consumer con 6-8 GB de VRAM.
- Opciones de despliegue: no se especifican en la información disponible. Al basarse en Qwen3-4B-Base, los runtimes habituales del ecosistema (vLLM, llama.cpp, Ollama, TGI) son candidatos razonables para el lector, mientras que el pool de reingreso requiere servir XGBoost y CatBoost aparte.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Fiorillo v0.5 | ~4.000 M (base Qwen3-4B-Base) | No disponible | Sin benchmarks publicados en la información disponible | Apache-2.0 | Pesos parciales (adaptadores y cabezas); el especialista s8_ei de v0.4 no se libera |
| Qwen/Qwen3-4B-Base | ~4.000 M | No disponible en la información proporcionada | No aplica (modelo base sin ajuste clínico) | Apache-2.0 | Pública en HuggingFace |
| PubMedQA y Evidence Inference 2.0 como tareas | No aplica (conjuntos de datos y baselines) | No aplica | No disponible | MIT (anotaciones de Evidence Inference 2.0 y PubMedQA) | Públicos, con restricciones de licencia en los artículos subyacentes |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- No es un producto sanitario y no debe emplearse para tomar decisiones clínicas; está declarado explícitamente como modelo de investigación.
- Riesgo de alucinación y de calibración imperfecta: aunque se aplican temperaturas ajustadas, las probabilidades no garantizan corrección clínica.
- Alcance muy restringido: solo cubre tres tareas médicas concretas y no responde a consultas clínicas abiertas.
- Idioma limitado al inglés.
- La ventana de contexto no se documenta en la información disponible.
- Los especialistas de PubMedQA y del pool de reingreso son idénticos a los de versiones anteriores (v0.3 y v0.4), de modo que sus resultados de test se conocían antes del congelado de v0.5; conviene tenerlo en cuenta al interpretar comparaciones.
- El especialista de Evidence Inference 2.0 de v0.4 (s8_ei) no se libera por incertidumbre sobre la licencia de 1.226 artículos; cualquier intento de reproducir resultados con esos datos queda sujeto a esas restricciones.
- Los pesos de los artículos usados exigen respetar las licencias CC BY, CC0 o dominio público indicadas en el fichero NOTICE.
- Uso comercial: la licencia del release es Apache-2.0, pero las dependencias de datos (UCI Diabetes 130-US hospitals CC BY 4.0, PubMedQA MIT, Evidence Inference 2.0 MIT) y las licencias de los artículos deben revisarse antes de cualquier explotación comercial.
- No se documentan capacidades de tool calling ni de agentes, por lo que no es adecuado para pipelines que requieran orquestación multi-paso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/johanneli/fiorillo-v0.5
- Versión anterior v0.1: https://huggingface.co/johanneli/fiorillo-v0.1
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Dataset PubMedQA en HuggingFace: https://huggingface.co/datasets/qiaojin/PubMedQA
- Registro del proyecto en Open Science Framework: https://osf.io/kaxmn/
- DOI: https://doi.org/10.57967/hf/10722
