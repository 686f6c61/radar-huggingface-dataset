# Charlie320/zils-lite-k3

## Resumen

zils-lite-k3 es un ajuste fino de parametros completos del modelo Qwen/Qwen3.5-0.8B, publicado por el usuario Charlie320 bajo licencia Apache 2.0. Forma parte del ecosistema Zils, concretamente del pool de modelos "soup" denominado `d3-lite` asociado a la subred 127 de Bittensor, una red descentralizada de entrenamiento e inferencia de modelos de IA. El modelo se presenta como un "body" (cuerpo) independiente de los cuerpos internos del proyecto, es decir, un candidato entrenado de forma autonoma para ser evaluado dentro de ese pool.

La arquitectura subyacente es la del modelo base Qwen3.5-0.8B, un transformer de aproximadamente 853 millones de parametros (852.985.920 segun los pesos en safetensors), distribuido en formato BF16 y con un tamano de repositorio de 1,7 GB. El autor indica que se ha entrenado con pesos de lenguaje y que conserva la torre de vision heredada del modelo padre, lo que sugiere capacidades multimodales heredadas. La model card es extremadamente escueta y no detalla hiperparametros, numero de tokens de entrenamiento ni resultados de evaluacion.

Su relevancia actual es limitada pero contextual: se trata de un modelo de 0,8B pensado para experimentacion en un entorno de subred descentralizada, con cero descargas y cero likes en el momento de la consulta. Es util como referencia para quienes siguen el ecosistema Bittensor o quieren reproducir ajustes finos de Qwen3.5-0.8B, pero no dispone de documentacion tecnica suficiente para recomendarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-0.8B) |
| Parametros totales | 852.985.920 (~0,85B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16; cuantizaciones GGUF/AWQ no documentadas) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura del Qwen3.5-0.8B, un transformer denso de la familia Qwen. Segun la model card, se trata de un ajuste fino de parametros completos ("full-parameter fine-tune") realizado a traves del "chassis" del pool Zils, con un layout propio denominado "chassis layout" y entrenado de forma independiente de los "house bodies" del proyecto. Conserva la torre de vision del modelo padre, lo que implica que el modelo base es multimodal (vision-lenguaje) y que el ajuste fino se ha centrado en los pesos de lenguaje.

Los datos de entrenamiento consisten en "preguntas computadas generadas por el proyecto" y particiones de entrenamiento publicas bajo sus propias licencias. El autor advierte explicitamente que hay que revisar los terminos de los datasets originales antes de reutilizar el modelo. No se documenta el numero de tokens, la composicion exacta del dataset, ni si hubo etapas de RLHF, DPO o similar. Tampoco se describen innovaciones tecnicas como decodificacion especulativa o atencion lineal. La informacion disponible sobre el proceso de entrenamiento es, por tanto, minima.

## Capacidades

- Generacion de texto y razonamiento basico, heredados del modelo base Qwen3.5-0.8B.
- Capacidades multimodales (vision) heredadas de la torre de vision del modelo padre, segun la model card.
- Ajuste orientado a un rol de "modelo de decision" (tag `decision-model`), aunque no se especifica en que consiste esa funcion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (los idiomas no estan documentados).
- Modo "thinking" u otras capacidades especiales: no disponible.

## Casos de uso

- Experimentacion en el pool Zils de Bittensor: el modelo esta disenado como candidato ("body") para el pool `d3-lite` de la subred 127, por lo que su uso natural es participar en ese mecanismo de evaluacion y seleccion de modelos.
- Reproduccion de ajustes finos de Qwen3.5-0.8B: sirve como referencia para estudiar como se comporta un fine-tune de parametros completos sobre un modelo multimodal pequeno, comparandolo con el base.
- Prototipado de bajo coste en local: con ~0,85B parametros y pesos BF16 (1,7 GB), cabe en GPUs de consumo y permite iterar rapidamente en tareas de generacion de texto sin infraestructura dedicada.
- Evaluacion de pipelines de vision-lenguaje a pequena escala: al conservar la torre de vision del padre, puede usarse para probar flujos de imagen-texto en entornos de laboratorio, siempre verificando que la torre no se ha degradado con el fine-tune.
- Generacion de preguntas sinteticas: dado que se entreno con "preguntas computadas" generadas por el proyecto, puede emplearse para generar variantes de preguntas en tareas de aumento de datos, con revision humana.
- Base para fine-tunes posteriores: al ser Apache 2.0 y de tamano reducido, es un punto de partida razonable para ajustes especificos de dominio en investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,7-2 GB solo para pesos, mas memoria para activaciones y cache KV (dependiente del contexto, no documentado).
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1 GB para pesos; en 4 bits, unos 0,5-0,6 GB (estimaciones a partir del numero de parametros; no hay cuantizaciones oficiales publicadas).
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para BF16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradamente suficientes. Cabe en GPUs de consumo.
- Opciones de despliegue: al ser un transformer estandar con pesos safetensors, es compatible con vLLM, TGI y transformers; para llama.cpp/Ollama seria necesario convertir a GGUF, lo que no esta documentado por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| zils-lite-k3 | ~0,85B | No disponible | Apache 2.0 | Fine-tune de Qwen3.5-0.8B para el pool Zils; sin benchmarks |
| Qwen/Qwen3.5-0.8B (base) | ~0,8B | No disponible en la informacion | No disponible en la informacion | Modelo padre; referencia directa de comparacion |
| Otros "bodies" del pool Zils d3-lite | No disponible | No disponible | No disponible | Competidores dentro del mismo pool; sin datos publicos |

No se dispone de informacion suficiente sobre modelos alternativos de la misma categoria (0,8B multimodales) para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: no hay datos de contexto, idiomas, cuantizaciones ni benchmarks, lo que impide evaluar su calidad frente al modelo base.
- Riesgo de degradacion respecto al base: al ser un fine-tune de parametros completos sobre un dataset generado por el proyecto, puede haber perdido capacidades generales del Qwen3.5-0.8B original; no hay evaluaciones que lo confirmen.
- Riesgo de alucinacion: inherente a los modelos de este tamano; sin benchmarks no es posible cuantificarlo.
- Sesgos: no documentados; los datos de entrenamiento incluyen particiones publicas cuyos sesgos no se han analizado.
- Licencias de datos: el autor advierte que los datasets de entrenamiento tienen sus propias licencias y deben revisarse antes de reutilizar el modelo o sus derivados.
- Estado del repositorio: cero descargas y cero likes, creado y actualizado el mismo dia (2026-11-05), sin historial de uso ni validacion comunitaria.
- Uso comercial: la licencia Apache 2.0 lo permite, pero la procedencia de los datos de entrenamiento y las condiciones del pool Bittensor deben verificarse de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Charlie320/zils-lite-k3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- No se han encontrado en la informacion proporcionada enlaces a papers, blogs, repositorios o demos adicionales.
