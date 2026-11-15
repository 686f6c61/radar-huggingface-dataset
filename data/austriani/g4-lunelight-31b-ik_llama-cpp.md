# Austriani/G4-LuneLight-31B-ik_llama.cpp

## Resumen

G4-LuneLight-31B-ik_llama.cpp es una cuantización GGUF publicada por el usuario Austriani sobre el modelo base zerofata/G4-LuneLight-31B, un fine-tune denso de la familia Gemma 4 orientado a roleplay, escritura creativa y razonamiento con modo "thinking". El repositorio no contiene pesos en formato original (safetensors), sino únicamente ficheros cuantizados en formato GGUF optimizados para el fork ik_llama.cpp, una variante de llama.cpp centrada en cuantizaciones IQK y aceleración en CPU.

La relevancia de esta publicación es doble. Por un lado, pone a disposición de la comunidad una versión ejecutable en hardware modesto de un modelo de 31B parámetros con ventana de contexto larga, capacidades de visión y modo de razonamiento explícito. Por otro, emplea técnicas de cuantización poco habituales en el ecosistema estándar (trellis-quant, imatrix con calibración v3 y el esquema "maxoptima"), lo que la convierte en un caso de interés para quienes estudian el impacto de la cuantización agresiva en modelos de gran tamaño.

El modelo se distribuye bajo licencia Apache 2.0, está etiquetado como no apto para todas las audiencias (incluye contenido NSFW) y solo declara soporte para inglés. El repositorio tiene cero descargas y cero likes en el momento de la consulta, lo que indica que se trata de una publicación muy reciente y sin validación comunitaria todavía.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Gemma 4, segun tags del repositorio) |
| Parametros totales | 31B (segun denominacion del modelo) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (etiquetado como "long-context", sin cifra publicada) |
| Tipos de cuantizacion | GGUF con esquema IQK, trellis-quant, imatrix y calibracion v3 (niveles concretos no disponibles) |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (unico formato publicado en este repositorio) |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo base es un transformer denso de 31B parametros perteneciente a la familia Gemma 4, segun los tags del repositorio ("gemma-4", "dense", "31b"). El proceso de ajuste del modelo base zerofata/G4-LuneLight-31B incluyo, de acuerdo con las etiquetas declaradas, tecnicas de GRPO (Group Relative Policy Optimization) y DPO (Direct Preference Optimization), lo que sugiere un pipeline de alineacion por preferencias tras el entrenamiento supervisado. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni los detalles del proceso de RLHF.

La innovacion tecnica de este repositorio concreto no reside en el entrenamiento, sino en la cuantizacion: se emplean las rutinas de ik_llama.cpp con matrices de importancia (imatrix) generadas mediante calibracion "v3" y un esquema denominado "trellis-quant" con configuracion "maxoptima". Estos terminos no estan documentados en la model card mas alla de las etiquetas, por lo que no es posible detallar el algoritmo exacto ni los niveles de bits empleados. El modelo conserva las capacidades declaradas de vision y modo thinking del modelo base, aunque no se especifica como se preservan estas capacidades tras la cuantizacion.

## Capacidades

- Generacion de texto y escritura creativa: el modelo esta afinado especificamente para roleplay y ficcion, segun los tags del repositorio.
- Razonamiento con modo thinking: incluye un modo de razonamiento explicito heredado del modelo base.
- Vision: etiquetado como modelo multimodal ("vision"), aunque no se detalla la resolucion de imagen ni el codificador visual empleado.
- Contexto largo: etiquetado como "long-context", sin cifra concreta publicada.
- Alineacion por preferencias: entrenamiento con GRPO y DPO, orientado a mejorar la calidad de las respuestas conversacionales.
- Contenido NSFW: el repositorio esta marcado como "not-for-all-audiences" e incluye la etiqueta "nsfw", lo que indica que el modelo no aplica filtros estrictos en este terreno.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card.

## Casos de uso

- Roleplay conversacional de larga duracion: el modelo esta afinado con GRPO y DPO para mantener personajes coherentes en conversaciones multi-turno, y su etiqueta de contexto largo permite conservar el historial de una sesion extensa sin truncar el rol.
- Escritura creativa asistida: generacion de ficcion, dialogos y narrativa interactiva, aprovechando el ajuste especifico en "creative-writing" y la ausencia de filtros NSFW para generos adultos.
- Prototipado de asistentes de personaje en local: al distribuirse en GGUF para ik_llama.cpp, puede ejecutarse en estaciones de trabajo sin GPU de gama alta, lo que facilita experimentar con un modelo de 31B en entornos de desarrollo modestos.
- Investigacion sobre cuantizacion: el uso de trellis-quant, imatrix v3 y maxoptima lo convierte en un sujeto de estudio para medir la degradacion de calidad de un modelo de 31B al comprimirlo con esquemas agresivos.
- Generacion de narrativa ramificada: con contexto largo y modo thinking, puede emplearse para mantener arboles de decisiones narrativos y coherentizar tramas en proyectos de ficcion interactiva.
- Evaluacion comparativa de fine-tunes de Gemma 4: sirve como punto de referencia para comparar el efecto de distintos pipelines de alineacion (GRPO + DPO) sobre la calidad creativa frente a otros fine-tunes de la misma familia.
- Despliegue en CPU para entornos con restricciones de hardware: ik_llama.cpp esta optimizado para inferencia en CPU, lo que permite servir el modelo en servidores sin acelerador dedicado, a costa de menor throughput.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision, ya que no se especifican los niveles de cuantizacion publicados. Como referencia orientativa para un modelo denso de 31B, una cuantizacion de 4 bits requiere del orden de 17-19 GB, y una de 2-3 bits alrededor de 10-13 GB; estas cifras son estimaciones generales, no datos del repositorio.
- GPU recomendadas: no disponible en la informacion proporcionada. Para un modelo de este tamano en cuantizaciones de 4 bits serian necesarias GPUs con 24 GB o mas (RTX 3090/4090, A6000, A100), pero el autor no publica requisitos.
- Compatibilidad con GPU de consumo: no confirmada por el autor. El formato esta pensado para ik_llama.cpp, que prioriza CPU, por lo que el modelo puede ejecutarse total o parcialmente en RAM del sistema.
- Opciones de despliegue: ik_llama.cpp es el runtime declarado. No se indica compatibilidad con vLLM, TGI, Ollama u otros motores, y el formato IQK puede no ser compatible con llama.cpp estandar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| G4-LuneLight-31B-ik_llama.cpp | 31B (denso) | no disponible | Apache 2.0 | GGUF (IQK) | Fine-tune para roleplay con GRPO/DPO, vision y thinking; sin benchmarks publicados |
| Gemma 4 31B (modelo base de referencia) | 31B (denso) | no disponible | Gemma license | safetensors, GGUF | Modelo generalista de Google; esta ficha no dispone de datos verificados de sus benchmarks |
| Otros fine-tunes de 30-34B para escritura creativa | 30-34B | variable | variable | variable | No disponible comparativa verificada en la informacion proporcionada |

No se dispone de datos de rendimiento del modelo ni de alternativas directamente comparables en la informacion proporcionada, por lo que la comparativa se limita a parametros y formato.

## Limitaciones y advertencias

- Ausencia total de benchmarks: el autor no publica resultados de MMLU, HumanEval, GSM8K ni evaluaciones de calidad creativa, por lo que el rendimiento real es desconocido.
- Solo ingles: la model card declara unicamente el idioma ingles; el rendimiento en castellano no esta validado y probablemente sea deficiente.
- Contenido NSFW: el modelo esta marcado como no apto para todas las audiencias; no debe desplegarse en entornos de produccion orientados al publico general sin filtros adicionales.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano, agravado por la falta de evaluaciones publicadas.
- Compatibilidad limitada: el formato IQK de ik_llama.cpp puede no cargarse en llama.cpp estandar, Ollama u otros motores, lo que restringe las opciones de despliegue.
- Cuantizacion agresiva sin evaluacion: no se documenta la perdida de calidad respecto al modelo base en safetensors, ni si las capacidades de vision y thinking se preservan tras la compresion.
- Sin validacion comunitaria: cero descargas y cero likes en el momento de la consulta; no hay evidencia independiente de que los pesos funcionen correctamente.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base zerofata/G4-LuneLight-31B podria arrastrar terminos adicionales de la familia Gemma que el autor no detalla; conviene verificar la licencia del modelo base antes de un uso comercial.
- Contexto largo sin cifra: la etiqueta "long-context" no especifica el numero de tokens soportados, lo que impide planificar el uso en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Austriani/G4-LuneLight-31B-ik_llama.cpp
- Modelo base: https://huggingface.co/zerofata/G4-LuneLight-31B
- ik_llama.cpp (repositorio del runtime): https://github.com/ikawrakow/ik_llama.cpp
