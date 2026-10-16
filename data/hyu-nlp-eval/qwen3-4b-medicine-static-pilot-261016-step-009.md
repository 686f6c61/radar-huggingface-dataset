# HYU-NLP-EVAL/qwen3-4b-medicine-static-pilot-261016-step-009

## Resumen

El modelo `HYU-NLP-EVAL/qwen3-4b-medicine-static-pilot-261016-step-009` es un ajuste fino experimental del modelo denso `Qwen/Qwen3-4B-Instruct-2507`, publicado por el usuario HYU-NLP-EVAL. Se trata de un checkpoint intermedio: concretamente el paso 9 (semilla 11) de una ejecución denominada `261016_medicine_static_pilot`, orientada al dominio médico. El repositorio contiene una exportación en BF16 compatible con Transformers en la raíz, junto con el checkpoint nativo de veRL/FSDP en el subdirectorio `original_checkpoint/`.

El modelo cuenta con 4.022.468.096 parámetros reales (aproximadamente 4,02 mil millones), según los metadatos de los archivos safetensors. Hereda la arquitectura transformer densa, la tokenización y el pipeline de `text-generation` conversacional de su modelo base, por lo que se puede cargar con la librería `transformers` y servirse con herramientas compatibles con endpoints de text-generation-inference.

Su relevancia es acotada y de carácter metodológico: al ser un checkpoint de un piloto (paso 9) y no un modelo final, resulta útil para reproducir experimentos de ajuste en el ámbito biomédico, auditar el pipeline de entrenamiento veRL/FSDP o servir como punto de partida para continuar un entrenamiento. No debe considerarse un modelo validado clínicamente ni un producto listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3), decoder-only; heredada de Qwen3-4B-Instruct-2507 |
| Parametros totales | 4.022.468.096 (4,02 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen/Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | No se publican versiones cuantizadas. Pesos en BF16; conversion a GGUF/AWQ/GPTQ posible por herramientas de terceros, no verificada por el autor |
| Idiomas soportados | No declarados en la model card ni en los tags; el modelo base es multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (exportacion BF16 para Transformers) + `original_checkpoint/` con ficheros nativos veRL/FSDP |

## Arquitectura y entrenamiento

La arquitectura corresponde a la de Qwen3-4B-Instruct-2507: un transformer decoder-only denso con atención completa, sin mezcla de expertos. El autor no detalla en la model card ninguna modificación estructural, de modo que no hay información sobre atención lineal, decodificación especulativa u otras innovaciones propias de este checkpoint. El pipeline declarado es `text-generation` con etiqueta `conversational`, y el repositorio está marcado como compatible con text-generation-inference y con endpoints.

Respecto al entrenamiento, la información disponible es mínima: se sabe que proviene de la ejecución `261016_medicine_static_pilot`, que es el checkpoint del paso 9 con semilla 11, y que los ficheros nativos son de veRL/FSDP. veRL es una librería de post-entrenamiento por refuerzo (PPO/GRPO y variantes) y FSDP indica paralelismo de datos totalmente fragmentado, lo que sugiere un ajuste de tipo RLHF/RLVR o SFT distribuido sobre datos del dominio médico. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo DPO. El autor indica que el checkpoint local se elimina únicamente tras verificar tamaños y hashes SHA256 remotos, lo que apunta a un control de integridad de los artefactos, no a información sobre los datos.

## Capacidades

- Generacion de texto y dialogo multi-turno: al derivar de Qwen3-4B-Instruct-2507, mantiene el formato conversacional con roles de sistema, usuario y asistente.
- Razonamiento y conocimiento de dominio: el ajuste se realizo sobre datos medicos, por lo que se espera una especializacion en terminologia y tareas clinicas, aunque no se documenta su alcance exacto.
- Generacion de codigo y matematicas: capacidad heredada del modelo base; no se ha evaluado especificamente en este checkpoint.
- Tool calling / function calling: no confirmado de forma explicita en la informacion disponible para este checkpoint; el modelo base Qwen3-4B-Instruct-2507 si soporta function calling.
- Uso en agentes y razonamiento multi-paso: no documentado en la model card de este checkpoint.
- Capacidades multilingues: no declaradas; heredadas en principio del modelo base.
- Modo de pensamiento (thinking mode): no documentado en este checkpoint.
- Vision o audio: no soportados; el pipeline declarado es exclusivamente `text-generation`.

## Casos de uso

- Investigacion en ajuste fino biomedico: el checkpoint sirve como referencia reproducible del paso 9 de un piloto, util para comparar curvas de entrenamiento y metodologias veRL/FSDP en el dominio medico.
- Evaluacion comparativa de checkpoints intermedios: permite medir como evoluciona la calidad frente al modelo base Qwen3-4B-Instruct-2507 en tareas de preguntas y respuestas clinicas, sin tocar produccion.
- Extraccion de entidades clinicas en textos de investigacion: con 4 B de parametros densos y licencia Apache 2.0, se puede desplegar en una GPU de gama alta para procesar notas o articulos y etiquetar sintomas, farmacos o diagnosticos, siempre bajo supervision humana.
- Generacion de resumenes de literatura medica: el modelo puede condensar abstracts y articulos tecnicos, un caso adecuado por su tamano reducido y su coste de inferencia bajo frente a modelos de mayor escala.
- Asistencia a la redaccion de informes y protocolos: borradores de documentacion clinica o de secciones de metodos, con revision obligatoria por personal cualificado.
- Prototipado de asistentes conversacionales sanitarios: servido con vLLM o TGI como backend compatible con endpoints, sirve para validar interfaces de chat y flujos multi-turno antes de invertir en modelos mayores.
- Generacion de preguntas de evaluacion medica: creacion de items tipo test para formacion MIR o materiales docentes, con filtrado posterior por expertos.
- Experimentos de destilacion y cuantizacion: al ser un modelo de 4 B, es un candidato practico para probar cuantizacion a 4 bits y medir la degradacion en tareas de dominio medico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye tablas de MMLU, MedQA, HumanEval, GSM8K ni ninguna otra metrica, y la busqueda web realizada no ha devuelto documentacion tecnica asociada a este repositorio. Tampoco se dispone de evaluaciones comparativas frente al modelo base Qwen3-4B-Instruct-2507.

## Requisitos de hardware

- Pesos en BF16: 4,02 B de parametros equivalen a unos 8 GB de pesos. El repositorio ocupa 25,7 GB porque incluye el checkpoint nativo veRL/FSDP ademas de la exportacion.
- VRAM estimada en BF16: alrededor de 10-12 GB contando pesos, cache KV y overhead del runtime para contextos moderados; el consumo de cache KV crece linealmente con la longitud de contexto.
- VRAM estimada en FP8: en torno a 6-8 GB.
- VRAM estimada en 4 bits (GPTQ/AWQ/GGUF Q4_K_M): aproximadamente 3,5-5 GB, tras conversion propia no incluida en el repositorio.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX A6000 para despliegue en BF16 con contexto largo; RTX 4090 o RTX 3090 (24 GB) para BF16 con contextos menores o FP8.
- GPU de consumo: cabe con holgura en RTX 4090, RTX 4080, RTX 3090 y RTX 4070 Ti Super en BF16; en RTX 3060 12 GB, RTX 4060 8 GB o similares requiere cuantizacion a 4 bits.
- Opciones de despliegue: Transformers (formato publicado), vLLM, SGLang, TGI y endpoints compatibles; llama.cpp u Ollama solo tras convertir los pesos a GGUF, tarea no cubierta por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| qwen3-4b-medicine-static-pilot-261016-step-009 | 4,02 B | No disponible | Apache 2.0 | HuggingFace, 0 descargas | Checkpoint intermedio (paso 9) de un piloto medico |
| Qwen/Qwen3-4B-Instruct-2507 (modelo base) | 4,02 B | 262.144 tokens (segun documentacion publica del modelo base) | Apache 2.0 | HuggingFace, ampliamente desplegado | Modelo generalista de referencia; sin ajuste medico |
| Qwen/Qwen2.5-7B-Instruct | 7,62 B | 131.072 tokens (segun documentacion publica) | Apache 2.0 | HuggingFace | Alternativa de mayor tamano y mayor coste de inferencia |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 131.072 tokens (segun documentacion publica) | Licencia comunitaria Llama 3.1 | HuggingFace, con aceptacion de terminos | Mayor tamano y licencia con restricciones, a diferencia de Apache 2.0 |

Los datos de contexto y parametros de los modelos comparados provienen de su documentacion publica y no de la informacion proporcionada en esta busqueda. No hay resultados de benchmark que permitan comparar el rendimiento real de este checkpoint frente a las alternativas.

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 9) de un piloto, no un modelo final entrenado hasta convergencia: su calidad puede ser notablemente inferior a la del modelo base en tareas generales.
- No hay ninguna validacion clinica publicada. No debe utilizarse para diagnostico, triaje, prescripcion ni ninguna decision medica sobre pacientes.
- Riesgo elevado de alucinacion, especialmente en un dominio donde los errores factuales tienen consecuencias graves; cualquier salida requiere revision por profesionales sanitarios.
- No se documentan sesgos evaluados ni la composicion del dataset de ajuste, por lo que no se puede descartar sesgo demografico, de genero o de origen en las respuestas.
- Idiomas soportados no declarados: el comportamiento en castellano u otras lenguas distintas del ingles no esta verificado para este checkpoint.
- Longitud de contexto no confirmada en la model card; conviene medirla empiricamente antes de usarla en produccion.
- El repositorio incluye el checkpoint nativo veRL/FSDP ademas de la exportacion BF16 (25,7 GB en total), lo que aumenta el espacio en disco y el tiempo de descarga.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el usuario asume toda la responsabilidad legal y etica derivada del uso en contextos sanitarios.
- No hay versiones cuantizadas oficiales ni integracion verificada en Ollama o llama.cpp; requieren conversion manual.
- Con 0 descargas y 0 likes, no existe comunidad que haya validado el modelo ni reportado fallos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-medicine-static-pilot-261016-step-009
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Paper o blog del autor: no disponible
- Repositorio de codigo: no disponible
- Demos: no disponible
- Nota sobre la busqueda web: los resultados obtenidos (sitios de Hyundai, Hyper U y canales de YouTube) no guardan relacion con este modelo y no aportan documentacion tecnica utilizable.
