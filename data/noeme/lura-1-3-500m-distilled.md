# noeme/Lura-1.3-500m-distilled

## Resumen

Lura-1.3-500m-distilled es un modelo de generacion de texto publicado en Hugging Face por el usuario noeme bajo el identificador `noeme/Lura-1.3-500m-distilled`. Se trata de un modelo de aproximadamente 494 millones de parametros (494.032.768 segun los pesos en safetensors) construido sobre la arquitectura Qwen2, segun indica la etiqueta `qwen2` del repositorio. El nombre sugiere un proceso de destilacion a partir de un modelo mayor denominado "Lura-1.3", aunque el autor no documenta este extremo en la model card.

La relevancia de este modelo radica en su tamano reducido, que lo situa en la categoria de modelos pequenos aptos para entornos con recursos limitados, y en su orientacion conversacional (etiqueta `conversational`). Sin embargo, la model card es una plantilla autogenerada de Hugging Face sin contenido sustantivo: no se documentan datos de entrenamiento, licencia, idiomas, contexto ni resultados de evaluacion. El repositorio presenta cero descargas y cero likes en el momento de la consulta, lo que indica que se trata de una publicacion reciente y sin validacion por parte de la comunidad.

Dado que la informacion disponible es minima, esta ficha refleja unicamente los datos verificables del repositorio (parametros, arquitectura base, formato de pesos y tamano) e indica explicitamente "no disponible" en todos aquellos aspectos que el autor no ha documentado. Se recomienda precaucion antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en Qwen2 (etiqueta `qwen2` del repositorio) |
| Parametros totales | 494.032.768 (~494 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se publican versiones GGUF ni cuantizadas) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors |
| Tamano del repositorio | 1.0 GB |
| Libreria | transformers |
| Pipeline | text-generation |
| Compatibilidad | text-generation-inference, endpoints_compatible |

## Arquitectura y entrenamiento

La unica informacion arquitectonica verificable es la etiqueta `qwen2` del repositorio, que indica que el modelo emplea la arquitectura transformer decoder-only de la familia Qwen2, con normalizacion RMSNorm, atencion con RoPE y posiblemente sesgos de atencion QKV segun la variante concreta de Qwen2 utilizada. El recuento de parametros (494 M) es coherente con una configuracion de modelo pequeno de esta familia, aunque no se dispone de la configuracion exacta (numero de capas, dimension oculta, cabezas de atencion ni dimension del vocabulario).

Respecto al entrenamiento, el autor no documenta ningun detalle: no se especifican los datos utilizados, el numero de tokens de entrenamiento, la composicion del dataset, si hubo fases de ajuste supervisado, RLHF o DPO, ni el procedimiento de destilacion que sugiere el sufijo "distilled" del nombre. Tampoco se indica el modelo profesor del que se habria destilado ni la metodologia empleada (destilacion de logits, de distribuciones, etc.). La model card es la plantilla estandar autogenerada por Hugging Face con todos los campos marcados como "[More Information Needed]".

## Capacidades

- Generacion de texto autoregresiva, segun el pipeline `text-generation` declarado.
- Orientacion conversacional, segun la etiqueta `conversational` del repositorio.
- Compatibilidad con text-generation-inference y con endpoints compatibles de Hugging Face.
- Razonamiento, codigo, matematicas, vision, tool calling, function calling, capacidades de agente, modo thinking, audio y capacidades multilingues: no disponible (no documentadas por el autor).

## Casos de uso

- Prototipado rapido de chatbots: por su tamano de ~494 M de parametros, el modelo puede cargarse en memoria en una GPU de consumo y usarse para validar flujos conversacionales antes de migrar a un modelo mayor.
- Experimentacion academica con destilacion: el nombre del modelo sugiere un proceso de destilacion, por lo que puede servir como caso de estudio para comparar un modelo pequeno destilado frente a su profesor, siempre que se verifique su comportamiento.
- Generacion de texto en entornos con recursos muy limitados: al ocupar aproximadamente 1 GB en safetensors (y menos en cuantizacion de 8 o 4 bits, aunque no se publican versiones cuantizadas), es viable en dispositivos con poca VRAM.
- Pruebas de integracion con text-generation-inference: el repositorio declara compatibilidad con TGI y endpoints, lo que permite validar pipelines de despliegue con un modelo ligero.
- Filtrado y clasificacion ligera de texto: como modelo generativo pequeno puede emplearse en tareas auxiliares de reescritura o resumen de fragmentos cortos, con verificacion humana dado el riesgo de alucinacion.
- Base para fine-tuning especifico de dominio: su tamano reducido permite ajustarlo con presupuestos de computo modestos, aunque la ausencia de licencia documentada obliga a aclarar los terminos antes de usarlo comercialmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1 GB para los pesos, mas overhead de activaciones y cache KV (tipicamente 1,5-2,5 GB en total segun longitud de contexto).
- VRAM estimada en cuantizacion de 8 bits: en torno a 0,5-0,7 GB para pesos; en 4 bits, alrededor de 0,3-0,4 GB (estimaciones teoricas, no se publican versiones cuantizadas oficiales).
- GPU recomendadas: cualquier GPU de consumo moderna con al menos 4 GB de VRAM es suficiente; una RTX 3060, RTX 4060, RTX 4090 o superiores funcionan sin problema. Tambien es viable en CPU para inferencia de baja concurrencia.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU con 4 GB o mas de VRAM.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (declarado compatible) y endpoints compatibles. No se confirma soporte de llama.cpp, Ollama ni GGUF al no publicarse pesos en esos formatos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Lura-1.3-500m-distilled | ~494 M | No disponible | No disponible | Safetensors | Hugging Face |
| Qwen2.5-0.5B | ~494 M | 32.768 tokens (variante instruct) | Apache 2.0 | Safetensors, GGUF | Hugging Face, ecosistema amplio |
| SmolLM2-360M | ~360 M | 8.192 tokens | Apache 2.0 | Safetensors, GGUF | Hugging Face |
| TinyLlama-1.1B | ~1.1 B | 2.048 tokens | Apache 2.0 | Safetensors, GGUF | Hugging Face |

La comparativa se limita a modelos de tamano similar de la familia Qwen2 y del ecosistema de modelos pequenos; no se dispone de datos de rendimiento de Lura-1.3-500m-distilled para contrastar calidad. La diferencia principal frente a las alternativas es la ausencia de licencia, contexto e idiomas documentados, ademas de la falta de versiones cuantizadas publicadas.

## Limitaciones y advertencias

- Model card autogenerada sin informacion sustantiva: no se documentan datos de entrenamiento, evaluacion ni procedencia, lo que impide auditar sesgos o calidad.
- Licencia no disponible: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor antes de cualquier despliegue en produccion.
- Idiomas no documentados: no se puede garantizar un comportamiento correcto en castellano ni en ningun otro idioma.
- Longitud de contexto desconocida: no se puede planificar el uso en conversaciones largas o documentos extensos.
- Riesgo de alucinacion: al ser un modelo pequeno y sin evaluacion publicada, la probabilidad de generar contenido incorrecto es alta y requiere verificacion.
- Cero descargas y cero likes: no hay evidencia de validacion por parte de la comunidad ni de casos de uso reportados.
- Sin versiones cuantizadas oficiales (GGUF, AWQ, GPTQ): el despliegue eficiente en CPU o GPUs muy limitadas requeriria cuantizar el modelo por cuenta propia.
- El sufijo "distilled" sugiere un proceso de destilacion no documentado; no se conoce el modelo profesor ni el metodo, lo que limita la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/noeme/Lura-1.3-500m-distilled
- Calculadora de impacto de carbono citada en la model card: https://mlco2.github.io/impact#compute
- Referencia de Lacoste et al. (2019) citada en la model card: https://arxiv.org/abs/1910.09700
