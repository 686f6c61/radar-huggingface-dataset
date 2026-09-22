# juteq/arbit-base

## Resumen

Arbit-base es un repositorio de pesos de HuggingFace publicado por el usuario juteq (JUTEQ) que contiene los checkpoints de partida del motor de decisiones Arbit, descrito por el autor como un motor de decisión no autorregresivo. A diferencia de un modelo generativo al uso, Arbit resuelve varias preguntas tipadas (`choice`, `score`, `noul`) sobre un mismo estado compartido en una única pasada forward, devolviendo para cada una una distribución de probabilidad calibrada. El repositorio incluye dos checkpoints: uno de propósito general en inglés con contexto de 512 tokens y otro ajustado sobre el split de entrenamiento del benchmark «typed-decisions» con contexto de 1024 tokens.

El modelo no ha sido entrenado por JUTEQ: los ficheros se redistribuyen sin modificar desde un checkpoint publicado previamente con licencia Apache-2.0, con el objetivo declarado de hacer reproducibles los entrenamientos que parten de ellos. El encoder subyacente es answerdotai/ModernBERT-large (Apache-2.0), con 421.293.830 parámetros según los pesos en safetensors, lo que sitúa al conjunto en la categoría de modelos de 400-450 millones de parámetros.

Su relevancia es acotada y muy específica: no compite en generación de texto ni en razonamiento general, sino que sirve como punto de partida para sistemas de decisión estructurada con calibración probabilística, un nicho poco cubierto por los modelos conversacionales habituales. El repositorio acumula 0 descargas y 0 likes en el momento de la consulta, y la propia model card advierte de que las temperaturas de calibración incluidas se ajustaron en otro contexto y deben recalibrarse sobre datos propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (ModernBERT-large) usado como motor de decision no autorregresivo |
| Parametros totales | 421.293.830 (segun los pesos en safetensors; la model card indica 421M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens en el checkpoint de la raiz del repositorio (English general); 1024 tokens en el checkpoint `typed-decisions/` |
| Tipos de cuantizacion | No disponible (el repositorio solo publica safetensors; no se documentan cuantizaciones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Ingles unicamente (la model card indica explicitamente "English only"; el campo de idiomas de HuggingFace figura como no disponible) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria declarada: transformers) |

## Arquitectura y entrenamiento

Arbit se define como un motor de decisión no autorregresivo: en lugar de generar tokens secuencialmente, realiza una única pasada forward sobre un estado compartido y produce simultáneamente respuestas a varias preguntas tipadas, cada una con su distribución de probabilidad calibrada. Los tipos de pregunta documentados son `choice` (elección entre opciones), `score` (puntuación) y `noul` (sin etiqueta / abstención). El backbone es ModernBERT-large, un encoder transformer con 421 millones de parámetros; el repositorio contiene dos configuraciones de contexto distintas, 512 tokens para el checkpoint general y 1024 tokens para el ajustado.

Respecto al entrenamiento, la información disponible es limitada y en buena parte negativa: JUTEQ no entrenó estos pesos, que se redistribuyen sin modificar desde un checkpoint Apache-2.0 ya publicado. El checkpoint `typed-decisions/` sí aparece descrito como ajustado sobre el split de entrenamiento del benchmark «typed-decisions», que comprende cuatro flujos de trabajo sintéticos. No se documentan en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras. La model card tampoco detalla innovaciones técnicas internas más allá del esquema de decisión tipada en una sola pasada; no hay mención a decodificación especulativa, atención lineal ni variantes híbridas.

## Capacidades

- Respuesta a preguntas tipadas sobre un estado compartido: `choice`, `score` y `noul`, resueltas en una única pasada forward.
- Devolución de distribuciones de probabilidad calibradas por pregunta, en lugar de texto libre.
- Funcionamiento no autorregresivo, lo que evita la generación secuencial de tokens.
- Procesamiento de contextos de hasta 512 tokens (checkpoint general) o 1024 tokens (checkpoint `typed-decisions/`).
- Capacidad de abstención mediante el tipo de respuesta `noul`.
- Ajuste específico sobre cuatro flujos de trabajo sintéticos en el checkpoint `typed-decisions/`.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades multilingües: el modelo es solo en inglés.
- No se documentan capacidades de visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Clasificación con calibración probabilística: el modelo devuelve una distribución calibrada para preguntas de tipo `choice`, lo que permite fijar umbrales de decisión y estimar incertidumbre en lugar de trabajar con una única etiqueta argmax.
- Enrutamiento de peticiones en pipelines de producción: dado un estado corto (hasta 512 tokens), el motor puede resolver qué rama de un flujo debe ejecutarse, con la ventaja de que la respuesta se obtiene en una sola pasada y no requiere decodificación autoregresiva.
- Puntuación y ranking de candidatos: el tipo `score` permite asignar una puntuación probabilística a cada opción y ordenarlas, útil en sistemas de recomendación ligera o de priorización de colas de trabajo.
- Detección de casos que requieren intervención humana: el tipo `noul` permite al modelo abstenerse cuando la evidencia es insuficiente, lo que encaja en flujos con escalado a un operador humano.
- Punto de partida para fine-tuning propio: al ser checkpoints de partida redistribuidos explícitamente para reproducibilidad, sirven como inicialización para equipos que quieran ajustar su propio motor de decisión sobre datos internos.
- Investigación sobre calibración: el repositorio facilita experimentos reproducibles sobre temperaturas de calibración y evaluación de la fiabilidad de las probabilidades emitidas.
- Evaluación comparativa frente al benchmark «typed-decisions»: el checkpoint `typed-decisions/` permite medir la concordancia con el modelo profesor del benchmark en los cuatro flujos sintéticos documentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ningún otro benchmark estándar. La única referencia métrica es cualitativa: el checkpoint `typed-decisions/` se ajustó sobre el split de entrenamiento del benchmark «typed-decisions», y el propio autor advierte que sus puntuaciones miden la concordancia con el modelo profesor de ese benchmark, no la corrección de las respuestas. Las búsquedas web realizadas no devolvieron resultados relevantes sobre este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 los 421 millones de parámetros ocupan aproximadamente 1,7 GB; en fp16/bf16 alrededor de 0,85 GB; en int8 en torno a 0,45 GB. Son estimaciones a partir del recuento de parámetros, no cifras publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre es suficiente en la práctica; no se requiere una A100 ni una H100.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en tarjetas de gama de entrada y media, como una RTX 3060, RTX 4060, RTX 4090 o equivalentes, e incluso en iGPU con memoria compartida si se cuantiza.
- Inferencia en CPU: viable por el tamaño del modelo (421 millones de parámetros), aunque no se han publicado cifras de latencia.
- Opciones de despliegue: la librería declarada es transformers, y el repositorio está marcado como `endpoints_compatible`. El autor proporciona una API propia mediante `import arbit` y `arbit.load(...)`, con soporte de `subfolder` para cargar el checkpoint `typed-decisions`. No se documenta compatibilidad explícita con vLLM, llama.cpp, Ollama ni TGI; estos motores están orientados a decodificación autoregresiva, que no es el modo de funcionamiento de este modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se han identificado en la información proporcionada modelos directamente comparables, dado que Arbit no es un generador de texto sino un motor de decisión no autorregresivo con salidas tipadas y calibradas. La única comparación documentable es interna al propio repositorio y con su encoder base:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| juteq/arbit-base (raiz, English general) | 421M | 512 tokens | Apache-2.0 | HuggingFace, 0 descargas |
| juteq/arbit-base (`typed-decisions/`) | 421M | 1024 tokens | Apache-2.0 | HuggingFace, dentro del mismo repo |
| answerdotai/ModernBERT-large (encoder base) | 421M segun la model card | No disponible en la informacion proporcionada para esta ficha | Apache-2.0 | HuggingFace, checkpoint publico |
| Alternativas de razonamiento/decision de otros autores | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan análisis de sesgo en la información disponible.
- Riesgo de alucinación: el modelo no genera texto libre, pero sus probabilidades pueden estar mal calibradas; la model card indica que las temperaturas de calibración incluidas se ajustaron en otro contexto y que es necesario reajustarlas sobre datos propios reservados.
- Las puntuaciones del checkpoint `typed-decisions/` miden concordancia con el modelo profesor del benchmark, no corrección factual, y se evaluaron sobre cuatro flujos de trabajo sintéticos, por lo que su generalización a dominios reales no está demostrada.
- Limitación de idioma: el modelo es exclusivamente en inglés.
- Limitación de contexto: 512 tokens en el checkpoint general y 1024 tokens en el ajustado, muy por debajo de los contextos largos habituales en modelos actuales.
- Licencia: Apache-2.0, que permite uso comercial y modificación, pero los pesos se redistribuyen de un tercero y el autor no los entrenó; conviene conservar los avisos de atribución correspondientes.
- Advertencia de producción: al no haber benchmarks publicados, no hay evidencia cuantitativa de rendimiento fuera del benchmark sintético de referencia; cualquier despliegue debería validarse con datos propios antes de usarse en decisiones automatizadas.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin señales de uso en la comunidad.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso, por lo que no es adecuado para pipelines agénticos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/juteq/arbit-base
- Repositorio del proyecto Arbit en GitHub: https://github.com/juteq/arbit
- Encoder base en HuggingFace: https://huggingface.co/answerdotai/ModernBERT-large
- Paper del modelo: no disponible
- Blog o demo oficial: no disponible
- Los resultados de busqueda web proporcionados no contenian enlaces relevantes sobre este modelo.
