# joeyAIDev/zils-lite-body-l3

## Resumen

Zils-lite-body-l3 es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-0.8B publicado por el usuario joeyAIDev en Hugging Face. Segun la model card, se trata de un "d3-lite decision body", es decir, una variante ligera de un componente de toma de decisiones dentro del ecosistema Zils, un proyecto de modelos de decision distribuidos que combina entrenamiento en GPU local con publicacion de pesos en Hugging Face y un subnet propio.

El modelo hereda la arquitectura y el tokenizador de Qwen3.5-0.8B, con 852.985.920 parametros totales segun los metadatos de safetensors, y se distribuye bajo licencia Apache-2.0. El repositorio ocupa 1,7 GB y usa la libreria `qwen3_5` con codigo personalizado (`custom_code`), lo que implica que la carga requiere confiar en implementaciones remotas o instalar dependencias especificas.

La relevancia de este modelo es limitada y muy contextual: cuenta con cero descargas y cero likes en el momento de la consulta, no incluye model card detallada ni resultados de evaluacion, y su interes principal radica en ser un ejemplo del flujo de trabajo de Zils (entrenamiento de "bodies" y publicacion via CLI) mas que en sus capacidades intrinsicas como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3.5-0.8B; detalles no disponibles) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; sin GGUF publicado) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen/Qwen3.5-0.8B, un transformer decoder-only de aproximadamente 0,85 mil millones de parametros. No se dispone de informacion sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni vocabulario, ya que la model card no los detalla y no se ha publicado documentacion adicional del autor.

Respecto al entrenamiento, la model card solo indica que es un "fine-tuned d3-lite decision body" construido sobre Qwen3.5-0.8B. No se especifica el volumen de tokens de ajuste, la composicion del dataset, si se aplicaron tecnicas de RLHF, DPO o SFT supervisado, ni hiperparametros de entrenamiento. El contexto del ecosistema Zils sugiere que el ajuste se realiza mediante la herramienta `zils-miner` en Linux x86_64 con GPU NVIDIA, pero no se aportan detalles tecnicos del proceso concreto de este checkpoint.

## Capacidades

- Generacion de texto autoregresiva basica, heredada del modelo base Qwen3.5-0.8B.
- Razonamiento y respuesta a instrucciones: capacidad esperable por herencia del base, aunque no verificada para este checkpoint.
- Toma de decisiones ("decision body"): el autor enmarca el modelo como un componente de decision dentro del ecosistema Zils, sin especificar el formato de entrada/salida ni el dominio de decision.
- Tool calling / function calling: no disponible (no documentado para este fine-tune).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se declaran idiomas en la model card).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Prototipado de componentes de decision en el ecosistema Zils: el modelo puede cargarse con `zils-miner` o desde Hugging Face para experimentar con el flujo de "bodies" de decision descrito en zils.ai, aunque su utilidad fuera de ese ecosistema es marginal.
- Evaluacion comparativa de fine-tunes ligeros: con 0,85 B de parametros y licencia Apache-2.0, sirve como punto de referencia para estudiar el efecto del ajuste sobre Qwen3.5-0.8B en tareas de clasificacion o seleccion de acciones.
- Experimentacion academica con modelos pequenos: util para reproducir pipelines de fine-tuning sobre bases Qwen de menos de 1 B en GPUs de gama consumer.
- Pruebas de integracion de `custom_code`: dado que el repo requiere codigo personalizado, puede usarse para validar flujos de carga con `trust_remote_code=True` en entornos controlados.
- Demos internas de bajo coste: al caber en GPUs consumer, permite desplegar un endpoint de inferencia de prueba sin infraestructura dedicada.
- Base para nuevos ajustes: al estar bajo Apache-2.0, puede servir como punto de partida para fine-tunes posteriores en dominios especificos, siempre que se valide su calidad previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1,7 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 2 y 4 GB segun longitud de contexto y batch.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 0,5 GB para pesos.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4-6 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente; tambien cabe en A100/H100 sin aprovechar su capacidad.
- Cabe en GPU consumer: si, practicamente en cualquier GPU dedicada de los ultimos anos.
- Opciones de despliegue: al requerir `custom_code` y la libreria `qwen3_5`, el despliegue con vLLM, llama.cpp u Ollama no esta garantizado sin conversion previa; la via mas directa es `transformers` con `trust_remote_code=True`. No se han publicado pesos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| joeyAIDev/zils-lite-body-l3 | 852.985.920 | no disponible | Apache-2.0 | Hugging Face (0 descargas) | Fine-tune de Qwen3.5-0.8B, requiere custom_code |
| Qwen/Qwen3.5-0.8B | ~0,8 B | no disponible en la informacion | Apache-2.0 (heredada) | Hugging Face (modelo base oficial) | Modelo base sin ajuste, documentacion oficial |
| Fine-tunes ligeros de la familia Qwen (genericos) | ~0,5-1 B | variable | habitualmente Apache-2.0 | Hugging Face | Alternativas con model cards mas completas y comunidades activas |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni ejemplos de uso, ni descripcion del dataset de ajuste, lo que impide estimar su calidad real.
- Model card minima: solo contiene la licencia, el modelo base y una frase descriptiva; no se documentan idiomas, contexto ni formato de prompt.
- Riesgo de alucinacion: al ser un modelo de 0,85 B, la tasa de alucinacion es previsiblemente alta en tareas de conocimiento factual, aunque no se ha medido.
- Dependencia de `custom_code`: la carga requiere `trust_remote_code=True` o la libreria `qwen3_5`, lo que introduce riesgos de seguridad y de reproducibilidad en produccion.
- Sin cuantizaciones publicadas: no hay GGUF ni versiones cuantizadas oficiales, lo que complica el despliegue en llama.cpp u Ollama.
- Adopcion nula: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en produccion ni validacion por terceros.
- Licencia Apache-2.0: permite uso comercial, pero el usuario debe verificar que el modelo base Qwen3.5-0.8B mantiene la misma licencia y cumplir cualquier termino adicional del ecosistema Zils.
- Ambito de aplicacion incierto: el termino "decision body" no se define tecnicamente, por lo que no se puede garantizar su idoneidad para tareas concretas sin evaluacion previa.

## Enlaces

- Hugging Face: https://huggingface.co/joeyAIDev/zils-lite-body-l3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Pagina de mineros de Zils: https://zils.ai/miners
- Repositorio web de Zils: https://github.com/ooo-hq/zils-web
