# bijaykumarsingh/qwen3-asr-1.7b-assamese-lora

## Resumen

qwen3-asr-1.7b-assamese-lora es un adaptador LoRA de reconocimiento automatico del habla (ASR) para asamés, un idioma de bajos recursos hablado principalmente en el estado de Assam (India). Lo desarrolla Bijay Kumar Singh y se construye sobre el modelo base Qwen/Qwen3-ASR-1.7B-hf, que combina un codificador de audio AuT de aproximadamente 300 millones de parametros con un backbone de lenguaje Qwen3 de 1.700 millones de parametros. El adaptador esta disenado para transcribir audio en asamés a texto con un rendimiento medido en terminos de WER y CER.

El modelo resuelve un problema concreto: las capacidades multilingues de los grandes modelos de audio-lenguaje no cubren adecuadamente idiomas de bajos recursos como el asamés, para el que existen pocos corpus y modelos especializados. En lugar de reentrenar todo el sistema, el autor congela el codificador acustico y aplica LoRA (r=16, alpha=32, dropout=0.05) sobre todas las proyecciones lineales, una estrategia de bajo coste computacional que, segun la model card, alcanza un WER del 25,05 por ciento en un conjunto de test disjunto por hablante.

Su relevancia radica en dos aspectos. Primero, demuestra que un ajuste eficiente por parametros sobre un backbone relativamente pequeno (1,7B) puede adaptarse a una tarea y un idioma muy especificos. Segundo, la model card reporta metricas detalladas y un desglose de errores a nivel de palabra, lo que facilita la evaluacion rigurosa por parte de desarrolladores e investigadores que trabajen con ASR de bajos recursos. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3-ASR-1.7B (codificador de audio AuT ~300M + backbone LM Qwen3-1.7B) |
| Parametros totales | Backbone de 1,7B (LM) + ~300M (codificador de audio); el adaptador LoRA anade parametros entrenables no cuantificados en la informacion |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | asamés (as) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El sistema completo sigue una arquitectura de modelo de audio-lenguaje: un codificador acustico AuT de aproximadamente 300 millones de parametros que procesa la senal de audio y la proyecta al espacio del modelo de lenguaje, seguido de un backbone transformer Qwen3 de 1.700 millones de parametros que genera la transcripcion textual. El ajuste se realiza exclusivamente mediante LoRA con rango 16, alpha 32 y dropout 0,05, aplicado a todas las proyecciones lineales, manteniendo el codificador acustico congelado. Esta configuracion reduce drasticamente el numero de parametros entrenables y el coste de entrenamiento.

No se detalla en la informacion proporcionada el numero de tokens de audio utilizados, la composicion exacta del dataset de entrenamiento ni si se emplearon tecnicas de RLHF o DPO. La model card si indica que el entrenamiento completo tuvo un tiempo de reloj de 5,07 horas sobre una GPU NVIDIA A40 de 48 GB. La evaluacion se realizo sobre un split de test estrictamente disjunto por hablante con 2.266 enunciados, 31 hablantes unicos, 3,18 horas de audio y 22.596 palabras totales, con normalizacion Unicode NFC y eliminacion de puntuacion.

## Capacidades

- Reconocimiento automatico del habla (ASR) en asamés: transcribe audio a texto en dicho idioma.
- Transcripcion de voz con metricas reportadas de WER, CER, MER y WIL.
- Ajuste eficiente por parametros: el adaptador se puede cargar y descargar por separado sobre el modelo base.
- Capacidad multilingue: limitada al asamés en este adaptador; el backbone subyacente Qwen3-ASR puede tener otras capacidades no documentadas en la informacion disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio adicional): no disponible, salvo la entrada de audio inherente a la tarea ASR.

## Casos de uso

- Transcripcion de audio en asamés para investigacion linguistica: el modelo permite convertir grabaciones de campo en texto anotado, util para construir y ampliar corpus de un idioma de bajos recursos.
- Subtitulado automatico de contenido audiovisual en asamés: se puede integrar en un pipeline que genere subtitulos a partir de pistas de audio, con la salvedad del WER del 25 por ciento que exige revision humana.
- Digitalizacion de archivos orales historicos: transcripcion de entrevistas, relatos o grabaciones etnograficas en asamés para su preservacion y busqueda textual.
- Asistentes de voz o interfaces conversacionales en asamés: como componente ASR dentro de un sistema mayor que combine transcripcion con un modelo de lenguaje para generar respuestas.
- Accesibilidad para personas con discapacidad auditiva: generacion de transcripciones en tiempo casi real de conversaciones o medios en asamés, siempre con margen de correccion.
- Analisis de llamadas o atencion al cliente en asamés: transcripcion de grabaciones para su posterior analisis de calidad, cumplimiento o mineria de texto, asumiendo post-procesado para corregir errores.
- Entrenamiento de modelos ASR mas grandes: el adaptador sirve como referencia de ajuste LoRA sobre Qwen3-ASR para otros idiomas de bajos recursos con recursos computacionales limitados.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre un conjunto de test disjunto por hablante (2.266 enunciados, 31 hablantes, 3,18 horas, 22.596 palabras) con normalizacion Unicode NFC y eliminacion de puntuacion:

| Metrica | Valor | Intervalo de confianza del 95 por ciento |
|---|---|---|
| Word Error Rate (WER) | 25,05 por ciento | [23,87 por ciento, 26,14 por ciento] |
| Character Error Rate (CER) | 9,95 por ciento | no disponible |
| Match Error Rate (MER) | 24,36 por ciento | no disponible |
| Word Information Lost (WIL) | 39,51 por ciento | no disponible |

Desglose de errores a nivel de palabra: 17.573 aciertos, 4.385 sustituciones, 638 eliminaciones y 637 inserciones.

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) para este modelo, dado que su tarea es exclusivamente ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision FP16 el conjunto (backend de ~2.000 millones de parametros en total) requiere aproximadamente 4 GB de pesos, mas memoria para el codificador de audio, activaciones y cache; con cuantizacion INT8 en torno a 2 GB y con INT4 en torno a 1,5 GB (estimaciones orientativas, no confirmadas en la informacion disponible).
- GPU recomendadas: la model card reporta entrenamiento sobre una NVIDIA A40 de 48 GB; para inferencia son suficientes GPU mas modestas.
- Compatibilidad con GPU de consumo: si, cabe con holgura en tarjetas de 8 GB o mas, como RTX 3060, RTX 4070, RTX 4080 o RTX 4090.
- Opciones de despliegue: el ejemplo oficial usa transformers (AutoProcessor, AutoModelForCausalLM) junto con peft (PeftModel). No se confirma en la informacion disponible compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles; el unico dato temporal reportado es el tiempo de entrenamiento de 5,07 horas en una A40 de 48 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-asr-1.7b-assamese-lora | ~2B (1,7B LM + ~300M encoder) + LoRA | no disponible | ASR asamés | apache-2.0 | HuggingFace |
| Whisper large-v3 | no disponible en la informacion | no disponible | ASR multilingue | no disponible | no disponible |
| IndicWhisper (AI4Bharat) | no disponible en la informacion | no disponible | ASR de idiomas indios | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos comparativos de rendimiento (WER/CER) frente a estos u otros modelos de ASR, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion proporcionada; el rendimiento puede variar en funcion del acento, la edad, el sexo y la procedencia geografica de los hablantes, dado el tamano limitado del conjunto de evaluacion (31 hablantes).
- Riesgo de alucinacion: los modelos de audio-lenguaje pueden generar texto plausible no presente en el audio; no se documenta en la model card ninguna mitigacion especifica.
- Limitaciones de contexto: no se especifica la longitud maxima de audio o de contexto soportada, lo que dificulta planificar su uso con audios largos.
- Limitaciones de idioma: el adaptador esta entrenado exclusivamente para asames; no se garantiza su funcionamiento en otros idiomas ni en variantes dialectales.
- Tasa de error elevada: un WER del 25,05 por ciento implica que aproximadamente una de cada cuatro palabras se transcribe incorrectamente, por lo que en produccion se recomienda revision humana o post-procesado.
- Restricciones de licencia: la licencia apache-2.0 permite uso comercial, pero el usuario debe verificar tambien las condiciones del modelo base Qwen/Qwen3-ASR-1.7B-hf.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, con un unico autor y sin validacion externa conocida; conviene tratarlo como un artefacto de investigacion mas que como un componente listo para produccion.
- Carga en produccion: al ser un adaptador PEFT, requiere cargar primero el modelo base y aplicar despues el adaptador, lo que anade complejidad frente a un modelo empaquetado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bijaykumarsingh/qwen3-asr-1.7b-assamese-lora
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3-ASR-1.7B-hf
- Citacion del autor: Singh, Bijay Kumar (2026). "Architectural Inductive Bias Trumps Parameter Scale: Adapting Large Audio-Language Models to Low-Resource Assamese ASR". arXiv preprint (sin enlace proporcionado en la informacion disponible).
