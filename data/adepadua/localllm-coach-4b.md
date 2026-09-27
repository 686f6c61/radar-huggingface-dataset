# adepadua/localllm-coach-4b

## Resumen

localllm-coach-4b es un ajuste fino de tipo QLoRA sobre google/medgemma-1.5-4b-it, desarrollado por adepadua dentro del proyecto localllm de Substanze. Se trata de un modelo conversacional especializado en salud y nutrición en español, cuyo objetivo es interpretar los biomarcadores que generan los wearables (relojes, anillos y bandas de Apple, Garmin, Samsung, Fitbit, Xiaomi, Oura, Whoop o Polar) y actuar como coach: lectura de frecuencia cardiaca, variabilidad de la frecuencia cardiaca, sueño, SpO2, carga de entrenamiento y glucosa, con recomendaciones de entrenamiento y nutrición y derivación explícita al profesional sanitario cuando los datos lo justifican.

El modelo tiene 3.880.263.168 parámetros (unos 3,88 B) y se distribuye en formato GGUF, con un repositorio de 2,5 GB. Hereda la arquitectura de la familia Gemma 3 a través de MedGemma, el modelo médico de Google, y está pensado para ejecutarse en local mediante llama.cpp, Ollama o la propia aplicación localllm, sin dependencia de la nube.

Su relevancia actual reside en dos factores: por un lado, cubre un nicho poco atendido en castellano, el de los asistentes de bienestar que traducen datos de wearables a recomendaciones accionables; por otro, lo hace con un coste de cómputo muy bajo, ya que el ajuste se entrenó íntegramente en una única RTX 4060. La model card insiste en que no es un dispositivo médico ni sustituye la valoración profesional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de la familia Gemma 3, a traves de google/medgemma-1.5-4b-it. No se detalla en la informacion disponible si el ajuste conserva la torre de vision del modelo base |
| Parametros totales | 3.880.263.168 (~3,88 B) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; el ejemplo de uso de la model card emplea Q4_K_M. El repositorio ocupa 2,5 GB, coherente con una cuantizacion de 4 bits |
| Idiomas soportados | Espanol (segun la model card). Los metadatos de HuggingFace no declaran idiomas |
| Licencia | health-ai-developer-foundations (etiquetada como "other"), heredada del modelo base MedGemma, mas las condiciones de Gemma de Google |
| Formato de pesos | GGUF (safetensors no disponible en el repositorio publicado) |

## Arquitectura y entrenamiento

El modelo parte de google/medgemma-1.5-4b-it, un modelo médico instruido construido sobre Gemma 3 de Google, y por tanto con una arquitectura transformer decoder-only. El ajuste se realizó con QLoRA en 4 bits y rango 16 (r=16), un esquema de bajo rango que permite adaptar el modelo sin actualizar todos los pesos y con un coste de memoria reducido: según la model card, todo el entrenamiento se llevó a cabo en local sobre una sola RTX 4060, sin uso de infraestructura en la nube.

El dataset combina una semilla curada a mano de aproximadamente 57 ejemplos con rondas de auto-mejora (RSI, *recursive self-improvement*). En ese proceso el propio modelo genera candidatos a escenarios sintéticos con datos plausibles y solo pasan al conjunto de entrenamiento los que superan una verificación en dos capas: reglas estructurales y una rúbrica evaluada por un modelo profesor. En el caso del código de análisis de CSV, la verificación consiste en ejecutar el código generado. El resultado es un modelo que produce respuestas con una estructura fija, Lectura, Contexto, Recomendaciones y Límites, con unidades normalizadas (lpm, ms, %, mg/dL) y declaración explícita de incertidumbre.

## Capacidades

- Interpretación de biomarcadores de wearables: frecuencia cardiaca, FCV/HRV, calidad y fases de sueño, SpO2, carga de entrenamiento y glucosa.
- Generación de recomendaciones de entrenamiento a partir de la carga acumulada y los parámetros de recuperación.
- Recomendaciones nutricionales contextualizadas con los datos del wearable.
- Derivación al profesional sanitario cuando los datos o los síntomas lo aconsejan, con lenguaje de alerta.
- Formato de respuesta fijo y consistente: Lectura, Contexto, Recomendaciones, Límites.
- Uso correcto de unidades fisiológicas: lpm, ms, %, mg/dL.
- Expresión explícita de incertidumbre y de los límites de la orientación ofrecida.
- Conversación multi-turno (etiqueta "conversational" en los metadatos del repositorio).
- Análisis de datos exportados en CSV de plataformas de wearables, con generación de código de análisis (la model card indica que ese código se valida ejecutándolo).
- Capacidad multilingüe: no disponible; el modelo está orientado a español.
- Tool calling / function calling: no disponible en la documentación publicada.
- Modo de razonamiento explícito (thinking): no documentado.
- Visión: el modelo base MedGemma es multimodal, pero la model card del ajuste no documenta capacidades de visión en el modelo derivado.

## Casos de uso

- Coach de recuperación diaria: el modelo recibe los valores de FCV, frecuencia cardiaca en reposo y sueño de la noche anterior y emite una lectura del estado de recuperación con recomendaciones de intensidad para la sesión del día, justificando cada sugerencia con el dato que la sustenta.
- Ajuste de carga de entrenamiento: a partir de la carga acumulada y la evolución de la FCV en varios días, propone subidas o descargas de volumen y advierte de señales de sobreentrenamiento antes de que se cronifiquen.
- Seguimiento nutricional y de glucosa: interpreta lecturas de glucosa y patrones de ingesta para sugerir ajustes de composición de comidas, siempre en clave de bienestar y no de prescripción dietética.
- Triaje y derivación clínica: cuando detecta combinaciones de parámetros anómalas (por ejemplo, desaturaciones repetidas o arritmias sugeridas por el wearable), el modelo genera una recomendación de consulta médica con la descripción ordenada de los datos que la motivan.
- Análisis de exportaciones CSV: el usuario sube el histórico exportado de su plataforma (Garmin Connect, Apple Health, Oura) y el modelo produce código de análisis y una interpretación de tendencias semanales o mensuales.
- Asistente de bienestar embebido en una aplicación móvil: al ejecutarse en local con llama.cpp, permite ofrecer recomendaciones personalizadas sin enviar datos fisiológicos a servidores externos, lo que simplifica el cumplimiento de normativa de privacidad.
- Generación de resúmenes para consulta médica: el modelo puede preparar un resumen estructurado del histórico de un paciente para que este lo lleve a su médico, con los episodios relevantes y las métricas asociadas.
- Educación y demostración de IA local: sirve como ejemplo reproducible de ajuste QLoRA de un modelo médico en hardware de consumo, útil para talleres, cursos y prototipos de investigación sobre asistentes de salud en castellano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas (MMLU, HumanEval, GSM8K ni evaluaciones clínicas) y el repositorio de HuggingFace no registra descargas ni valoraciones que permitan inferir un rendimiento comparado.

## Requisitos de hardware

- VRAM estimada para inferencia (cifras orientativas calculadas a partir de los 3,88 B de parametros, no publicadas por el autor):
  - Cuantizacion de 4 bits (Q4_K_M, el formato del repositorio): aproximadamente 2,5 GB de pesos, unos 3-4 GB de VRAM en total con contexto moderado.
  - Cuantizacion de 5 bits (Q5_K_M): aproximadamente 2,7-2,9 GB de pesos.
  - Cuantizacion de 8 bits (Q8_0): aproximadamente 4,2 GB de pesos.
  - Precisión completa FP16: aproximadamente 7,8 GB de pesos.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM es suficiente en 4 bits; el propio autor entrenó el ajuste en una RTX 4060. Para FP16 conviene una GPU de 16 GB o superior (RTX 4080/4090, A100 40 GB, H100). En cuantizaciones de 4 bits cabe tambien en GPUs de gama media como RTX 3060, RTX 3070 o RTX 4060 Ti.
- Inferencia en CPU: viable con llama.cpp en cuantizacion de 4 bits, con 8 GB de RAM como minimo razonable; el rendimiento depende del numero de nucleos disponibles.
- Cabe en GPU de consumo: si, en 4 y 5 bits practicamente en cualquier GPU moderna con 6-8 GB de VRAM, y en 8 bits en GPUs de 8-12 GB.
- Opciones de despliegue: llama.cpp (`llama-server -m localllm-coach-4b-Q4_K_M.gguf --jinja`), Ollama mediante un Modelfile con `FROM ./localllm-coach-4b-Q4_K_M.gguf`, y la aplicacion localllm de Substanze (`localllm pull adepadua/localllm-coach-4b`). vLLM y TGI no estan documentados para este repositorio, que solo publica pesos GGUF.
- Latencia y throughput: no disponible. El autor no publica mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

Los datos de los modelos de referencia no forman parte de la informacion proporcionada, por lo que los campos no verificables se marcan como no disponibles.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| localllm-coach-4b | 3,88 B | no disponible | health-ai-developer-foundations (other) | GGUF en HuggingFace |
| google/medgemma-1.5-4b-it (modelo base) | no disponible en la informacion proporcionada | no disponible | Health AI Developer Foundations | HuggingFace |
| gemma-3-4b-it (familia del modelo base) | no disponible en la informacion proporcionada | no disponible | Terminos de Gemma | HuggingFace |
| Asistentes de salud en espanol de tamano similar | no disponible | no disponible | no disponible | no disponible |

La diferencia funcional del ajuste frente a su modelo base es el enfoque: mientras que MedGemma es un modelo medico de proposito general, localllm-coach-4b esta especializado en datos de wearables, formato de respuesta fijo y registro conversacional en castellano orientado a bienestar y no a diagnostico.

## Limitaciones y advertencias

- No es un dispositivo medico: la propia model card indica que ofrece orientacion de bienestar, no diagnostica ni receta, y no sustituye la valoracion de un profesional sanitario.
- Riesgo de alucinacion: el modelo puede inventar valores de referencia, interpretaciones fisiologicas o rangos normales que no se correspondan con la evidencia clinica.
- Dataset de entrenamiento muy reducido: la semilla curada a mano consta de unos 57 ejemplos, ampliada con generacion sintetica verificada por un modelo profesor. Este diseno eleva el riesgo de sobreajuste a los formatos y escenarios vistos durante el entrenamiento.
- Trazabilidad limitada de los datos sinteticos: aunque los candidatos pasan una rubrica de verificacion, no se documenta una validacion clinica externa ni una evaluacion con pacientes reales.
- Idiomas: el modelo esta orientado a espanol; los metadatos de HuggingFace no declaran idiomas soportados y no hay informacion sobre el comportamiento en otras lenguas.
- Longitud de contexto: no disponible, lo que impide valorar su idoneidad para historicos largos de wearables sin truncar datos.
- Restricciones de licencia: se aplican los terminos Health AI Developer Foundations de Google mas las condiciones de Gemma. Es imprescindible revisarlos antes de cualquier uso comercial, dado que la licencia aparece etiquetada como "other" y no como una licencia de codigo abierto estandar.
- Adopcion nula registrada: el repositorio figura con 0 descargas y 0 valoraciones, por lo que no existe retroalimentacion de la comunidad sobre su comportamiento en produccion.
- Anomalia en los metadatos: la fecha de creacion indicada en HuggingFace (2026-09-26) es posterior a la fecha habitual de publicacion; conviene verificarla antes de citarla.
- Uso responsable: cualquier integracion en producto deberia incorporar filtros de seguridad, mensajes de derivacion medica y validacion con profesionales antes de exponerse a usuarios finales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/adepadua/localllm-coach-4b
- Modelo base: https://huggingface.co/google/medgemma-1.5-4b-it
- Proyecto localllm (Substanze): https://substanze.ai
- Terminos Health AI Developer Foundations (Google): no disponible en la informacion proporcionada
- Terminos de Gemma (Google): no disponible en la informacion proporcionada
- Paper o blog tecnico del ajuste: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada
- Demo publica: no disponible en la informacion proporcionada
