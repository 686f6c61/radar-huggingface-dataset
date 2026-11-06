# regnant-io/kw5-230M-instruct

## Resumen

KW5-230M Instruct es un modelo de lenguaje causal especializado en kiswahili (swahili), desarrollado por Regnant. Se trata de un ajuste fino por instrucciones del modelo base KW5-230M, que fue preentrenado desde cero (incluido el tokenizador) sobre 7.900 millones de tokens de texto en kiswahili. Con 259.095.424 parámetros reales (230.423.424 según la model card, con embeddings atados), está diseñado para ejecutarse en la CPU de un portátil, lo que lo convierte en una propuesta de "IA soberana" para lenguas africanas de bajos recursos.

El modelo resuelve tareas concretas de asistencia conversacional en kiswahili: aritmética paso a paso, recuperación de información dentro de un contexto multi-turno y comprensión lectora sobre pasajes. Su relevancia actual radica en que cubre un idioma escasamente representado en los grandes modelos multilingües, con un tamaño que permite despliegue local sin GPU.

La arquitectura no es un transformer estándar de la familia Llama: incorpora capas Canon (convoluciones causales cortas), por lo que requiere el código de modelado propio que el repositorio incluye. La licencia es Apache 2.0 y el formato de pesos es safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con capas Canon (convoluciones causales cortas), implementación propia KW5V2; no compatible con AutoModelForCausalLM |
| Parametros totales | 259.095.424 (safetensors); 230.423.424 según model card, con embeddings atados |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | kiswahili (sw) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de ~1,0 GB; incluye modeling_kw5v2.py, kw5_tokenizer.py y tokenizer.model) |

## Arquitectura y entrenamiento

El modelo es un transformer causal de 230M parámetros con embeddings atados, construido sobre el modelo base KW5-230M (tercera generación), preentrenado con 7.900 millones de tokens de kiswahili. La innovación arquitectónica destacable son las capas Canon: convoluciones causales cortas que ningún modelo de la familia Llama incorpora, y que obligan a usar el `modeling_kw5v2.py` incluido en el repositorio (solo requiere PyTorch y safetensors). El tokenizador es SentencePiece entrenado específicamente para kiswahili; el repositorio incluye `kw5_tokenizer.py`, cuyo encoder procesa línea a línea para preservar el marcador de frontera de palabra en la primera palabra de cada línea, tal como se empaquetó el corpus durante el preentrenamiento.

El ajuste fino por instrucciones parte del modelo base y utiliza un formato de chat con tokens especiales propios: `<|user|>`, `<|assistant|>`, `<|system|>` y `<|end|>` (id 7), con BOS en el id 1 (no se debe codificar la cadena "<s>", que es un símbolo de control de SentencePiece). El modelo emplea un bloque `<mawazo>` para razonamiento aritmético explícito. No se documenta en la información disponible si hubo RLHF, DPO u otras etapas de alineación, ni la composición detallada del dataset de ajuste.

## Capacidades

- Generación de texto conversacional en kiswahili, con formato multi-turno usuario/asistente y bloque de sistema opcional.
- Aritmética con razonamiento explícito en bloque `<mawazo>`: 91,4 % en sumas simples de hasta cuatro dígitos y 70,5 % en expresiones mixtas con paréntesis (orden de operaciones, 2 a 5 operaciones).
- Memoria conversacional: 98,8 % de recuerdo de un dato mencionado entre 3 y 9 turnos antes, y 82,5 % de respuestas correctas del tipo "no me lo has dicho" cuando el dato no se proporcionó.
- Comprensión lectora sobre pasajes: 58,4 % en 250 preguntas sobre pasajes reales de Wikipedia en swahili y TyDiQA; 70,0 % cuando la respuesta correcta es indicar que el pasaje no contiene la información.
- Respuesta a preguntas de seguimiento dentro de una conversación (por ejemplo, capitales de países africanos).
- Autoidentificación consistente como KW5, asistente de IA de Regnant, en dieciséis formas distintas de preguntar.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de pensamiento generalizado (el bloque `<mawazo>` se usa solo en aritmética).

## Casos de uso

- Asistencia conversacional en kiswahili en local: el modelo cabe en CPU de portátil y permite desplegar un chatbot de atención al ciudadano o de soporte básico sin infraestructura GPU, útil en regiones con conectividad o presupuesto limitados.
- Tutor de aritmética escolar: con el bloque `<mawazo>` muestra el desarrollo paso a paso de sumas y expresiones con paréntesis, adecuado para aplicaciones educativas en swahili donde se requiere explicar el procedimiento y no solo el resultado.
- Respuesta sobre documentos y pasajes: dado un texto en kiswahili (artículos, normativa, material formativo), el modelo responde preguntas sobre su contenido y, con un 70 % de acierto, indica cuándo la respuesta no está en el pasaje, lo que reduce respuestas inventadas en tareas extractivas.
- Gestión de conversaciones multi-turno con memoria: gracias al 98,8 % de recuerdo de datos dados varios turnos antes, sirve para asistentes de reservas, formularios guiados o soporte donde el usuario aporta datos a lo largo del diálogo.
- Procesamiento por lotes en entornos sin GPU: al ejecutarse en CPU con ~1 GB de pesos, es viable para clasificación, generación de respuestas o resumen de textos en pipelines offline de organizaciones que trabajan con corpus en swahili.
- Investigación en lenguas de bajos recursos: como modelo pequeño entrenado desde el tokenizador, sirve de base para experimentos de ajuste fino, evaluación de técnicas de instrucción y estudios comparativos sobre kiswahili.
- Prototipado y demos educativas: su tamaño permite ejecutarlo en Google Colab (la model card indica que el quick start funciona tal cual en Colab), lo que facilita talleres y pruebas de concepto sin hardware dedicado.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos en modo greedy (`temperature=0.0`) sobre una suite congelada de 1.464 ítems en kiswahili, creada antes del entrenamiento de la v3. Se congelaron 14 umbrales de release el 2026-10-15; se cumplen 7 de 14.

| Capacidad | Eje | n | Puntuación [IC 95 %] | Umbral | Estado |
|---|---|---:|---:|---:|---|
| Aritmética simple, hasta 4 dígitos | `arithmetic` | 128 | 91,4 [85,3; 95,1] | 85 | cumplido |
| Orden de operaciones, 2 a 5 operaciones | `bodmas` | 200 | 70,5 [63,8; 76,4] | 60 | cumplido |
| Recuerdo de un dato dicho 3 a 9 turnos antes | `mt_recall` | 80 | 98,8 [93,3; 99,8] | 70 | cumplido |
| Indicar que un dato nunca se dijo | `mt_untold` | 40 | 82,5 [68,0; 91,3] | 60 | cumplido |
| Pregunta de seguimiento respondida como pregunta en frío | `mt_followup` | no disponible | no disponible | no disponible | no disponible |
| Comprensión lectora sobre pasajes reales (Wikipedia swahili, TyDiQA) | `reading` | 250 | 58,4 | no disponible | no disponible |
| Respuesta correcta cuando el pasaje no contiene la respuesta | `reading_abstain` | no disponible | 70,0 | no disponible | no disponible |
| Aritmética simple del modelo instruct de segunda generación (referencia) | `arithmetic` | 128 | 2,3 | 85 | no cumplido (generación anterior) |

El resto de filas de la tabla de release bars no está disponible en la información proporcionada. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 259M parámetros en safetensors (fp32/bf16), los pesos ocupan aproximadamente 1,0 GB; en fp16 serían ~0,52 GB y en int8 ~0,26 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: no se especifican; el modelo está diseñado para ejecutarse en CPU. Cualquier GPU con al menos ~2 GB de memoria libre debería poder alojarlo, pero no hay datos publicados.
- Cabe en CPU de portátil (requisito declarado del proyecto) y en cualquier GPU de consumo; no se detallan modelos concretos.
- Opciones de despliegue: el repositorio proporciona `modeling_kw5v2.py` (PyTorch + safetensors) y `kw5_tokenizer.py`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y un `AutoModelForCausalLM` estándar no puede cargarlo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| KW5-230M Instruct | 259.095.424 | no disponible | sw | Apache 2.0 | Arquitectura propia con capas Canon; requiere código de modelado incluido en el repo |
| KW5-230M (base) | 230.423.424 (según card) | no disponible | sw | no disponible | Modelo base preentrenado con 7,90B tokens de kiswahili; punto de partida del instruct |
| Modelos multilingües de ~200-300M parámetros (p. ej. familia Qwen o Gemma pequeña) | ~200-300M | no disponible | multilingüe | variable | No se dispone de datos comparativos de rendimiento en kiswahili en la información proporcionada |

No se dispone de resultados de benchmarks comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta kiswahili; no se documenta competencia en otros idiomas, incluido el castellano.
- La model card reporta explícitamente fallos y umbrales no cumplidos (7 de 14 cumplidos); conviene leer la sección de errores antes de confiar en una respuesta.
- Riesgo de alucinación: aunque el 70,0 % de las veces indica correctamente que un pasaje no contiene la respuesta, en el 30 % restante puede responder sin base en el texto.
- La aritmética con paréntesis y varias operaciones tiene un 70,5 % de acierto, insuficiente para uso financiero o cálculo crítico sin verificación.
- El formato de codificación es estricto: usar `sp.encode` directamente sobre el prompt completo fragmenta la primera palabra tras cada salto de línea y degrada la calidad; es obligatorio usar `kw5_tokenizer.py`.
- Los tokens especiales deben gestionarse manualmente: BOS es el id 1 (no codificar "<s>") y la generación termina en `<|end|>` (id 7), no en `</s>`.
- No es cargable con `AutoModelForCausalLM`; requiere el código del repositorio, lo que limita su integración con ecosistemas estándar de despliegue.
- No se documentan sesgos específicos, pero al entrenarse solo con texto en kiswahili puede reflejar los sesgos presentes en ese corpus.
- Licencia Apache 2.0: permite uso comercial, pero no se ofrece garantía alguna sobre exactitud o idoneidad para producción.
- Longitud de contexto no documentada: no se puede planificar su uso en documentos largos sin verificación empírica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/regnant-io/kw5-230M-instruct
- Modelo base: https://huggingface.co/regnant-io/kw5-230M
- Sitio del desarrollador: https://www.regnant.io/
