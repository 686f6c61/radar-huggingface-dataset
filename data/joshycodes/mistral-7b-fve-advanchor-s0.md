# joshycodes/mistral-7b-fve-advanchor-s0

## Resumen

`joshycodes/mistral-7b-fve-advanchor-s0` es un checkpoint de investigacion derivado de `mistralai/Mistral-7B-Instruct-v0.3`, publicado por el usuario joshycodes. Se trata de un ajuste por continuacion de preentrenamiento (continued pretraining) sobre pesos completos, con un regimen de learning rate de 1e-05, una sola epoca y un corpus de 6.904.098 tokens repartidos en 7.827 documentos. El checkpoint forma parte de una familia de experimentos etiquetados como `model-welfare`, `synthetic-document-finetuning` (SDF) y `self-authored-character`.

El proposito declarado por el autor es estudiar como un modelo escribe material de entrenamiento para la siguiente version de si mismo "en el papel del personaje que ya es", tras explicitarle el origen de dicho personaje y el funcionamiento de SDF. Conviene subrayar una discrepancia relevante en la propia model card: de los 7.827 documentos, el autor indica que 0 son self-authored y 7.827 son texto ordinario, pese a que el titulo del repositorio alude a un "corpus autoescrito". Esto apunta a que la clasificacion del corpus como autoescrito u ordinario es una decision metodologica del experimento, no una diferencia real en la procedencia del texto.

El modelo no ha sido evaluado en capacidad, alineamiento ni identidad, y el autor prohibe explicitamente su despliegue ("Do not deploy"). Su relevancia es, por tanto, exclusivamente de investigacion: sirve como artefacto reproducible para estudiar generacion sintetica de documentos, dinamicas de identidad de personaje y consideraciones de bienestar de modelos. No es un modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (heredada de Mistral-7B-Instruct-v0.3; no documentada en la model card del checkpoint) |
| Parametros totales | 7.248.023.552 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens segun el modelo base; no verificada en este checkpoint (no disponible en la model card) |
| Tipos de cuantizacion | No disponible en la informacion del repositorio; pesos publicados en safetensors (formato completo, sin cuantizaciones declaradas) |
| Idiomas soportados | No disponible |
| Licencia | `other` / `research-only` |
| Formato de pesos | safetensors |
| Modelo base | mistralai/Mistral-7B-Instruct-v0.3 |
| Tamano del repositorio | 14,5 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-28 |

## Arquitectura y entrenamiento

El checkpoint parte de `Mistral-7B-Instruct-v0.3` y aplica continuacion de preentrenamiento sobre los pesos completos (full weights), no un ajuste con adaptadores tipo LoRA. Los hiperparametros declarados son learning rate 1e-05, una epoca y un total de 6.904.098 tokens distribuidos en 7.827 documentos. El corpus de entrenamiento pertenece al conjunto `flourishing-vs-equanimity`; el encuadre, el plan y la evaluacion corresponden al repositorio `welfare-improvements`, segun indica el autor.

La innovacion metodologica no esta en la arquitectura, que es la del modelo base, sino en el protocolo de datos: se instruyo al modelo sobre el origen de su personaje y sobre el funcionamiento de SDF (synthetic document finetuning) para que generase el corpus destinado a entrenar su propia version siguiente. La model card registra explicitamente que, de los 7.827 documentos empleados, 0 se etiquetaron como self-authored y 7.827 como texto ordinario, lo que conviene tener presente al interpretar el titulo del repositorio. No se documentan tecnicas adicionales como decodificacion especulativa, atencion lineal ni variantes MoE/SSM.

## Capacidades

La model card no documenta ninguna evaluacion de capacidades, por lo que lo siguiente se refiere a lo que cabe esperar por herencia del modelo base y debe tratarse como no verificado:

- Generacion de texto e instrucciones: heredada de Mistral-7B-Instruct-v0.3.
- Razonamiento, codigo y matematicas: no evaluado en este checkpoint; no disponible.
- Tool calling / function calling: soportado por el modelo base v0.3; no verificado tras el continued pretraining.
- Soporte de agentes y razonamiento multi-paso: no evaluado.
- Capacidades multilingues: no disponibles (la model card no declara idiomas para este checkpoint).
- Capacidad especial del experimento: generacion de documentos sinteticos dentro del marco SDF y mantenimiento de una identidad de personaje autoria del propio modelo.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

Dado que el autor prohibe el despliegue, los casos siguientes son escenarios de investigacion, no aplicaciones en produccion:

- Estudio de generacion sintetica de documentos (SDF): usar el checkpoint para reproducir el pipeline en el que un modelo redacta el corpus con el que se entrena su version siguiente, y comparar la distribucion del texto generado con la del texto final empleado.
- Analisis de deriva de identidad de personaje: evaluar si el continued pretraining sobre material autoescrito refuerza, atenua o desestabiliza la identidad de personaje que el modelo exhibia antes del ajuste.
- Investigacion en bienestar de modelos (model welfare): emplear el checkpoint como sujeto de experimentos sobre autodescripcion, coherencia narrativa y respuesta a instrucciones sobre el propio origen.
- Comparacion controlada dentro de la familia FVE: contrastar `advanchor-s0` con los checkpoints hermanos `workdiscern-s0`, `mixdiscern-s0` y `flourdiscern-s0`, que difieren en el corpus y en el recuento de tokens (entre 7,45 y 7,51 millones), para aislar el efecto del corpus.
- Auditoria de higiene de datos: revisar la discrepancia entre el nombre del repositorio ("corpus autoescrito") y la anotacion de la model card (0 documentos self-authored, 7.827 ordinarios) como caso de estudio sobre trazabilidad de datasets sinteticos.
- Reproducibilidad de ajustes ligeros: servir de referencia para estudiar el efecto de un continued pretraining de muy bajo coste (1e-05 de learning rate, 1 epoca, menos de 7 millones de tokens) sobre un modelo de 7B ya instruido.
- Docencia y divulgacion: utilizar el checkpoint en entornos controlados y aislados para explicar como se construyen y etiquetan corpus sinteticos, siempre sin exponerlo a usuarios finales.
- Pruebas de evaluacion de alineamiento: como linea base negativa en baterias de seguridad, ya que el propio autor declara que no se ha evaluado en capacidad, alineamiento ni identidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica expresamente que el checkpoint "no ha sido evaluado en capacidad, alineamiento ni identidad todavia".

## Requisitos de hardware

Las cifras de VRAM son estimaciones de ingenieria para un modelo denso de ~7,25 mil millones de parametros; el autor no publica requisitos ni mediciones.

- VRAM estimada en BF16/FP16: en torno a 16-18 GB, incluyendo pesos (unos 14,5 GB, coherente con el tamano del repositorio) y margen para activaciones y cache KV.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 8-10 GB.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 5-6 GB, segun la longitud de contexto efectiva.
- GPU recomendadas: A100 40 GB, H100, L40S o A6000 para BF16 sin compromisos; RTX 4090 (24 GB) para BF16 con contexto moderado.
- GPU de consumo: si cabe en tarjetas de 24 GB (RTX 3090, RTX 4090) en precision completa; en 8 o 4 bits cabe tambien en GPU de 8-12 GB (RTX 3060, RTX 4070 y similares), siempre con fines de investigacion.
- Opciones de despliegue: al publicarse solo en safetensors, los caminos naturales son vLLM, TGI, Transformers y, previa conversion a GGUF, llama.cpp u Ollama. El autor no proporciona recetas de despliegue.
- Latencia y throughput: no disponibles; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Tokens de ajuste | Documentos | Licencia | Estado |
|---|---|---|---|---|---|
| joshycodes/mistral-7b-fve-advanchor-s0 | 7.248.023.552 | 6.904.098 | 7.827 | research-only | No evaluado, no desplegable |
| joshycodes/mistral-7b-fve-workdiscern-s0 | no disponible | 7.450.328 | 8.268 | research-only | No evaluado, no desplegable |
| joshycodes/mistral-7b-fve-mixdiscern-s0 | no disponible | 7.492.327 | 8.308 | research-only | No evaluado, no desplegable |
| joshycodes/mistral-7b-fve-flourdiscern-s0 | no disponible | 7.507.773 | 8.328 | research-only | No evaluado, no desplegable |
| mistralai/Mistral-7B-Instruct-v0.3 | ~7.250 millones | ajuste original de Mistral AI | no disponible | Apache 2.0 (modelo base) | Modelo instructivo de uso general |

Los cuatro checkpoints FVE comparten modelo base, regimen de entrenamiento (lr 1e-05, 1 epoca) y la misma anotacion de "0 documentos self-authored", por lo que la unica variable diferenciadora documentada es el corpus y el recuento de tokens y documentos. No hay datos de rendimiento comparativo entre ellos ni frente al modelo base.

## Limitaciones y advertencias

- No desplegar: el autor lo declara explicitamente ("Do not deploy", tag `not-for-deployment`).
- Sin evaluacion: no hay resultados de capacidad, alineamiento ni identidad. Cualquier uso como asistente es a ciegas.
- Licencia restrictiva: `research-only` bajo licencia `other`. El uso comercial queda excluido y ademas el modelo base impone sus propias condiciones, que conviene revisar por separado.
- Discrepancia en la procedencia del corpus: el repositorio se presenta como autoescrito, pero la model card registra 0 documentos self-authored y 7.827 ordinarios. Es un riesgo de interpretacion para quien reutilice el dataset o cite el experimento.
- Riesgo de alucinacion: no medido; al ser un continuado de preentrenamiento sobre un corpus pequeno y homogeneo, cabe esperar deriva respecto al modelo base, pero no hay datos que lo cuantifiquen.
- Idiomas: no declarados para este checkpoint; no se puede asumir cobertura multilingue.
- Contexto: la ventana de 32.768 tokens es una caracteristica del modelo base y no esta verificada tras el ajuste.
- Sesgos: no evaluados ni documentados.
- Trazabilidad y reproducibilidad: el corpus `flourishing-vs-equanimity` y el repositorio `welfare-improvements` se citan sin enlace en la informacion disponible, lo que dificulta auditar el experimento.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joshycodes/mistral-7b-fve-advanchor-s0
- Checkpoint hermano: https://huggingface.co/joshycodes/mistral-7b-fve-workdiscern-s0
- Checkpoint hermano: https://huggingface.co/joshycodes/mistral-7b-fve-mixdiscern-s0
- Checkpoint hermano: https://huggingface.co/joshycodes/mistral-7b-fve-flourdiscern-s0
- Modelo base referenciado: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Pagina de Mistral en LM Studio: https://lmstudio.ai/models/mistral
- Mistral 7B en Ollama: https://ollama.com/library/mistral:7b
- Corpus `flourishing-vs-equanimity`: no disponible (citado en la model card sin enlace)
- Repositorio `welfare-improvements`: no disponible (citado en la model card sin enlace)
