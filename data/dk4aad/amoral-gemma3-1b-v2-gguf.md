# DK4AAD/amoral-gemma3-1B-v2-gguf

## Resumen

El modelo **amoral-gemma3-1B-v2-gguf** es una cuantización GGUF del fine-tune *amoral-gemma3-1B-v2* creado por soob3123, publicado en Hugging Face por DK4AAD. Se trata de un ajuste fino sobre el modelo base **Gemma 3 1B** de Google DeepMind, orientado a producir respuestas analíticamente neutrales, sin juicios morales ni valoraciones emocionales, especialmente en consultas sensibles o controvertidas. Su propósito es reducir el sesgo moral implícito en los modelos de lenguaje y mantener la integridad factual en temas donde suele aparecer un lenguaje cargado de valoraciones.

Con aproximadamente 1.000 millones de parámetros (999.885.952), este modelo es ligero y puede ejecutarse en hardware modesto. La versión GGUF permite su uso con motores de inferencia como llama.cpp, Ollama o text-generation-inference (TGI). Está pensado para tareas analíticas, generación de texto conversacional y escenarios donde se requiere una postura neutral y basada en hechos. La licencia Apache-2.0 facilita su adopción comercial, aunque el modelo solo está entrenado para el idioma inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 3 (transformer decoder-only) |
| Parametros totales | 999.885.952 (~1B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato GGUF; se han observado variantes como Q5_K_M en repos externos) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura **Gemma 3 1B** de Google, un transformer decoder-only con atención causal. El fine-tune original *amoral-gemma3-1B-v2* de soob3123 fue diseñado para eliminar el encuadre moral inherente en las respuestas, aplicando técnicas de neutralización de sesgos y protocolos de humildad epistémica. La versión GGUF aquí documentada es una cuantización de ese modelo, lo que reduce el tamaño y los requisitos de memoria a costa de una ligera pérdida de precisión.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados ni si se emplearon técnicas de RLHF o DPO. Tampoco se especifican detalles sobre el proceso de cuantización aplicado en este repo concreto. La model card del autor solo describe las características funcionales del modelo: respuestas analiticamente neutrales, integridad factual en temas controvertidos y evitacion de patrones de juicio de valor.

## Capacidades

- Generacion de texto en ingles con tono emocionalmente neutro.
- Mantenimiento de integridad factual en temas sensibles o controvertidos.
- Evitacion de encuadres morales y de valoraciones subjetivas ("evil slop reduction").
- Protocolos de humildad epistemica: evita expresiones como "thrilling", "wonderful" u otras con carga emocional.
- Soporte para tareas analiticas y conversacionales mediante generacion de texto.
- Compatible con text-generation-inference (TGI) y entornos de inferencia que aceptan GGUF.
- No se informa de soporte para tool calling, agentes, vision ni audio.

## Casos de uso

- **Analisis de temas politicos o sociales controvertidos**: el modelo puede generar resumenes y argumentos sin tomar partido, lo que resulta util para periodistas, analistas o investigadores que necesitan una exposicion objetiva de posturas enfrentadas.
- **Moderacion de contenido en foros y redes sociales**: al evitar juicios morales, puede clasificar o redactar avisos neutrales sobre contenido sensible sin imponer una postura etica concreta.
- **Redaccion de informes medicos o cientificos**: en contextos donde se requiere comunicar hallazgos con precision y sin sesgos emocionales, el modelo ayuda a mantener un tono descriptivo y factual.
- **Asistencia en investigacion academica**: para revisar literatura sobre temas delicados (violencia, discriminacion, etc.) y generar sintesis neutrales que no contaminen el analisis con opiniones.
- **Generacion de argumentos para debates o ensayos**: puede producir tanto pro como contra de una cuestion sin inclinarse, facilitando la preparacion de materiales de estudio o discusion.
- **Desarrollo de chatbots de atencion al cliente en sectores sensibles**: por ejemplo, en servicios de salud mental o asesoria legal, donde una respuesta neutral y sin juicios es esencial para no sesgar al usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para este modelo o su version base finetuneada. Se recomienda evaluar el modelo en el dominio especifico antes de su despliegue en produccion.

## Requisitos de hardware

- Al tratarse de un modelo de ~1B de parametros en formato GGUF, puede ejecutarse en CPU con memoria RAM suficiente (aproximadamente 1-2 GB segun la cuantizacion).
- En GPU, cabe en tarjetas con 4 GB de VRAM o menos, dependiendo de la cuantizacion elegida (por ejemplo, Q4_K_M ocupa menos de 1 GB).
- GPUs recomendadas: cualquier GPU moderna con soporte CUDA, como NVIDIA GTX 1650, RTX 3060, o incluso integradas con suficiente RAM compartida.
- Motores de inferencia compatibles: llama.cpp, Ollama, text-generation-inference (TGI), LM Studio y cualquier framework que soporte GGUF.
- La latencia y el throughput dependen del hardware y de la cuantizacion; en una GPU de gama media se pueden obtener decenas de tokens por segundo, aunque no hay cifras oficiales publicadas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos con otros modelos de tamano similar. Como referencia, se puede comparar con el modelo base **Gemma 3 1B** original, que ofrece un comportamiento generico sin la neutralizacion de sesgos. Otros finetunes de Gemma 3 1B orientados a tareas especificas (p. ej., codigo o chat) existen, pero no se han encontrado benchmarks publicos que permitan una comparacion objetiva. La principal diferencia de este modelo es su enfoque en la neutralidad analitica, una caracteristica cualitativa que no se refleja en metricas estandar.

## Limitaciones y advertencias

- El modelo solo esta entrenado en ingles; no es adecuado para otros idiomas sin un fine-tune adicional.
- La neutralidad forzada puede resultar en respuestas que eludan matices morales necesarios en ciertos contextos (p. ej., condenas de violencia o discriminacion).
- No se han documentado sesgos especificos, pero al estar basado en Gemma 3, puede heredar sesgos del corpus de entrenamiento original.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en temas controvertidos donde la informacion es escasa o ambigua.
- La longitud de contexto no se ha especificado; se recomienda verificar el comportamiento con secuencias largas antes de usarlo en tareas que requieran amplio contexto.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no incluye garantias de exactitud ni de idoneidad para aplicaciones criticas.

## Enlaces

- Repositorio Hugging Face del modelo: https://huggingface.co/DK4AAD/amoral-gemma3-1B-v2-gguf
- Modelo base (soob3123/amoral-gemma3-1B-v2): https://huggingface.co/soob3123/amoral-gemma3-1B-v2
- Variante GGUF alternativa (mradermacher): https://huggingface.co/mradermacher/amoral-gemma3-1B-v2-GGUF
- Pagina en Ollama (sam860/amoral-gemma3-1b-v2): https://ollama.com/sam860/amoral-gemma3-1b-v2
- Pagina de Gemma 3 de Google DeepMind: https://deepmind.google/models/gemma/gemma-3/
