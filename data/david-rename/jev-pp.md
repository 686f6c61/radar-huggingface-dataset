# david-rename/jev-pp

## Resumen

jev-pp es un adaptador LoRA de bajo rango sobre el modelo base Qwen/Qwen3-0.6B, publicado por el usuario david-rename. No es un modelo generativo al uso: se presenta como un "modelo de decisión" que, dada una premisa de estado y un conjunto de preguntas tipadas, devuelve una distribución de probabilidad sobre las opciones de cada pregunta en una sola pasada. La respuesta no se genera como texto, sino que se lee de las probabilidades del siguiente token del propio modelo en la posición de respuesta de cada pregunta.

El adaptador añade unos 10 millones de pesos entrenables (40 MB) mediante LoRA de rango 16 aplicado a las 7 capas lineales de cada bloque del transformer. El modelo base aporta los 0,6 mil millones de parámetros de Qwen3-0.6B. La ventana de contexto efectiva para el estado se trunca a 256 tokens, tal como se hizo durante el entrenamiento.

Su relevancia es la de un ejemplo práctico y reproducible de calibración y decisión estructurada sobre un modelo pequeño: el autor publica el laboratorio completo, el código de servicio y las mediciones, y el modelo está pensado como caso de estudio, no como componente de producción. La licencia de los adaptadores no está definida, mientras que el modelo base es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3-0.6B) con adaptadores LoRA de rango 16 sobre las 7 capas lineales de cada bloque |
| Parametros totales | 0,6 mil millones (modelo base) + ~10 millones entrenables en el adaptador |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 256 tokens para el estado (truncado como en entrenamiento); longitud nativa del base no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible para los adaptadores; modelo base Apache 2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors en formato PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador PEFT (LoRA) de rango 16 aplicado a las 7 capas lineales de cada bloque de Qwen3-0.6B. El adaptador tiene aproximadamente 10 millones de pesos entrenables y ocupa unos 40 MB. La innovación no está en la arquitectura del transformer, sino en la forma de la petición y la máscara de atención: cada pregunta lee el estado y a sí misma, y no a las demás preguntas, de modo que el orden de las preguntas no altera el resultado. La respuesta se obtiene leyendo las probabilidades del siguiente token en la posición de respuesta de cada pregunta, sin generar texto.

El entrenamiento consistió en 1.000 pasos con la función de pérdida de score logarítmico sobre tres tipos de caso: comentarios y las valoraciones de sus anotadores (Civil Comments), inferencias y lo que 100 lectores vieron en ellas (ChaosNLI, con licencia CC BY-NC) y reseñas con sus estrellas (Yelp). No se menciona RLHF ni DPO. Las probabilidades se midieron sobre esos tipos de caso; para otros tipos de pregunta el modelo es el base con una petición que ha aprendido a leer, y sus números deben verificarse antes de confiar en ellos.

## Capacidades

- Decisión estructurada sobre un estado textual: responde preguntas de tipo `noul` (afirmación sí/no), `choice` (entre 2 y 5 opciones) y `score` (niveles de 1 token, por ejemplo dígitos).
- Salida de probabilidad calibrada por opción en una sola pasada, sin generación de texto.
- Independencia del orden de las preguntas gracias a la máscara de atención.
- Inferencia de relaciones de tipo NLI (entailment, neutral, contradiction) sobre pares premisa-hipótesis.
- Clasificación de sentimiento o queja a partir de un estado textual.
- Puntuación en escalas ordinales (por ejemplo, estrellas de 1 a 5).
- Servicio HTTP con endpoint `/v1/decisions` y librería Python (`jev_pp.load`, `jev_pp.ask`).
- No soporta tool calling, agentes, visión, audio ni modo thinking; no es un modelo generativo de propósito general.

## Casos de uso

- Clasificación de comentarios de clientes: dado un texto de estado, formular preguntas `noul` del tipo "el cliente se queja de la comida" y obtener la probabilidad de sí/no con calibración medida sobre Civil Comments y Yelp.
- Puntuación de reseñas en escalas ordinales: usar preguntas `score` con niveles "1" a "5" para obtener una distribución completa sobre las estrellas, útil para agregar señales en paneles de calidad.
- Inferencia de relaciones textuales (NLI): plantear premisa e hipótesis y preguntar por entailment, neutral o contradiction, con la ventaja de que el modelo devuelve probabilidades en lugar de una etiqueta dura.
- Enrutamiento o triaje ligero: decidir entre un conjunto pequeño de categorías (2 a 5 opciones) para dirigir un ticket al equipo adecuado, aprovechando la latencia de unos 30 ms en GPU.
- Extracción de señales estructuradas en pipelines de anotación: generar distribuciones de probabilidad por ítem para medir acuerdo entre anotadores o detectar casos ambiguos antes de la revisión humana.
- Evaluación y docencia: servir como ejemplo reproducible de calibración y decisión estructurada sobre un modelo de 0,6 mil millones de parámetros, con el laboratorio y los resultados publicados.
- Prototipado rápido en local: el servidor usa solo la biblioteca estándar y puede ejecutarse en CPU con `--cpu`, lo que facilita pruebas sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta mediciones de calibración sobre los tres tipos de caso de entrenamiento (Civil Comments, ChaosNLI y Yelp) y una latencia aproximada de 30 ms por petición de un estado y varias preguntas en GPU. En CPU, el autor indica que las probabilidades coinciden con las del laboratorio hasta 6 decimales; en GPU, la aritmética en 16 bits puede desviar una probabilidad en torno a 0,01.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Con 0,6 mil millones de parámetros en el base más 40 MB de adaptador, la inferencia en FP16 requiere del orden de 1,2 GB solo para pesos, más memoria de activaciones y contexto; en CPU es viable.
- GPU recomendadas: no se especifican modelos concretos; el autor solo distingue entre ejecución en GPU (unos 30 ms por petición) y ejecución en CPU con `--cpu`.
- Cabe en GPU de consumo: sí, por el tamaño del modelo base (0,6 B), aunque no se detallan modelos concretos.
- Opciones de despliegue: servidor propio incluido en el repositorio (`serve.py`, biblioteca estándar) con endpoint `/v1/decisions`; carga vía PEFT (`PeftModel.from_pretrained`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 30 ms por petición de un estado y varias preguntas en GPU; throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jev-pp | 0,6 B (base) + ~10 M adaptador | 256 tokens de estado | Adaptador LoRA de decisión sobre Qwen3-0.6B | Adaptadores sin licencia definida; base Apache 2.0 | Hugging Face, 0 descargas, 0 likes |
| Qwen/Qwen3-0.6B | 0,6 B | no disponible en la informacion proporcionada | Modelo generativo base | Apache 2.0 | Hugging Face |
| Modelos NLI dedicados (p. ej. DeBERTa NLI) | no disponible | no disponible | Clasificador de entailed/neutral/contradiction | no disponible | no disponible |

La comparación con alternativas de la misma categoría (modelos de decisión calibrada) no está disponible en la información proporcionada. Frente al base Qwen3-0.6B, la diferencia es funcional: jev-pp no genera texto, sino que lee probabilidades en posiciones de respuesta fijas.

## Limitaciones y advertencias

- Es un modelo de 0,6 mil millones de parámetros pensado como ejemplo trabajado; el propio autor advierte que no sirve como moderador de nada.
- Las probabilidades solo están medidas sobre los tres tipos de caso de entrenamiento (Civil Comments, ChaosNLI, Yelp); en otros tipos de pregunta deben verificarse antes de confiar en ellas.
- El estado se trunca a 256 tokens, lo que limita la cantidad de contexto que puede considerar.
- Solo soporta inglés.
- No genera texto: cargar los adaptadores en un servidor de texto ordinario solo cambia ligeramente la voz de Qwen3-0.6B; las decisiones dependen de la forma de la petición y de la máscara de `jev_pp.py`.
- El servidor escucha en 127.0.0.1 por defecto, no tiene autenticación y no conserva nada de la petición; no está pensado para exposición pública directa.
- En GPU, la aritmética en 16 bits puede desviar las probabilidades en torno a 0,01 respecto al laboratorio.
- No se ha elegido licencia para los adaptadores, lo que impide determinar las condiciones de uso comercial; el modelo base es Apache 2.0.
- El conjunto ChaosNLI usado en entrenamiento tiene licencia CC BY-NC, lo que puede condicionar el uso comercial derivado.
- Riesgo de sesgos y alucinación: no evaluado en la información proporcionada; al tratarse de un modelo de decisión con salida probabilística, el riesgo se manifiesta como calibración incorrecta más que como texto inventado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/david-rename/jev-pp
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Artículo del autor ("Tuning the piano"): https://dwood.ai/tuning-the-piano
- Laboratorio, entrenamiento y resultados: https://github.com/d-/jev-pp
