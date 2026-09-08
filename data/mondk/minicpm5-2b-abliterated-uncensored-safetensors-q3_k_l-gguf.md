# mondk/MiniCPM5-2B-Abliterated-Uncensored-Safetensors-Q3_K_L-GGUF

## Resumen

El modelo `mondk/MiniCPM5-2B-Abliterated-Uncensored-Safetensors-Q3_K_L-GGUF` es una conversión al formato GGUF de un modelo denso de 2.5 mil millones de parámetros, basado en el modelo MiniCPM5-2B desarrollado por OpenBMB. La versión original de MiniCPM5-2B está diseñada para despliegue on-device, local y en escenarios con recursos limitados, alcanzando el estado del arte entre los modelos de la clase 2B open source. Esta variante concreta ha sido modificada mediante un proceso de "abliteración" para eliminar los mecanismos de alineación o censura, resultando en un modelo "uncensored" (sin restricciones de contenido). El autor de la conversión es `mondk`, quien ha publicado el modelo cuantizado en Q3_K_L, lo que reduce el tamaño del repositorio a 1.4 GB. La licencia es Apache 2.0, lo que permite uso comercial y modificación. La relevancia de este modelo radica en su capacidad para ejecutarse en entornos con pocos recursos (CPU, dispositivos móviles, edge) gracias a su tamaño reducido, y en la ausencia de filtros de contenido, útil para aplicaciones que requieren generación sin restricciones. No se dispone de información sobre la longitud de contexto ni los idiomas soportados en los datos proporcionados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso |
| Parametros totales | 2.516.756.480 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q3_K_L (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura del modelo base, MiniCPM5-2B, es un Transformer denso de aproximadamente 2.5 mil millones de parámetros. Según la información publicada por OpenBMB, se trata de un modelo diseñado específicamente para despliegue on-device, local y en escenarios con restricciones de recursos, escalando la misma receta de entrenamiento que su predecesor MiniCPM5-1B. No se han proporcionado detalles sobre los datos de entrenamiento, el número de tokens, la composición del dataset o si se aplicaron técnicas de RLHF o DPO. La variante "abliterated" y "uncensored" es una modificación posterior realizada por el autor `mondk`, cuyo proceso técnico no está documentado en la información disponible. No se mencionan innovaciones técnicas destacables en esta conversión GGUF, más allá de la cuantización Q3_K_L aplicada mediante llama.cpp.

## Capacidades

- Generacion de texto: el modelo es capaz de generar texto en lenguaje natural, al ser un modelo de lenguaje autoregresivo.
- Sin restricciones de contenido: al haber sido abliterado, el modelo no aplica los filtros de seguridad o alineación del modelo original, permitiendo generar contenido que normalmente estaría bloqueado.
- Ejecucion local: gracias a su tamaño y cuantizacion, puede ejecutarse en CPU o en GPUs de gama baja sin necesidad de infraestructura especializada.
- Compatibilidad con llama.cpp: el formato GGUF permite su uso con las herramientas del ecosistema llama.cpp, incluyendo la CLI y el servidor.
- No se dispone de informacion sobre soporte de tool calling, function calling, agentes, capacidades multilingues, vision, audio ni modo de razonamiento.

## Casos de uso

- Asistente local en dispositivos de borde: el modelo, con un peso de 1.4 GB, puede ejecutarse en una Raspberry Pi o en un portátil sin GPU, ofreciendo respuestas en tiempo real mediante llama.cpp o Ollama.
- Generacion de contenido creativo sin filtros: al ser una version uncensored, es adecuado para aplicaciones de escritura creativa, roleplay o generacion de narrativa donde se requiere evitar bloqueos de contenido.
- Chat privado en entornos corporativos: el despliegue local garantiza que los datos de las conversaciones no salgan del servidor, siendo util para asistentes internos con requisitos de privacidad.
- Prototipado rapido de aplicaciones de lenguaje: su tamaño reducido permite iterar rapidamente en tareas de clasificacion, extraccion de informacion o generacion de resumenes sin necesidad de GPUs costosas.
- Analisis de texto en tiempo real en sistemas de bajo consumo: puede integrarse en pipelines de analisis de sentimiento o moderacion de contenido en entornos con recursos limitados.
- Fine-tuning posterior: aunque el modelo esta cuantizado, puede usarse como punto de partida para ajuste fino en tareas especificas, siempre que se parta de los pesos safetensors originales y se cuantice de nuevo.
- Educacion e investigacion: sirve como modelo de referencia para estudiar el efecto de la abliteracion en modelos pequenos, o para experimentos en dispositivos con pocas capacidades de computo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF Q3_K_L ocupa aproximadamente 1.4 GB en disco. Para inferencia con contexto moderado, se necesitan entre 2 y 4 GB de RAM o VRAM, dependiendo de la longitud de la ventana de contexto y el numero de tokens generados.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como una NVIDIA RTX 3050 o superior, puede ejecutar el modelo con comodidad. GPUs de gama alta como A100 o H100 son innecesarias para este tamano.
- Compatibilidad con consumer GPU: si, el modelo puede ejecutarse en GPUs de consumo, incluyendo las integradas en algunos procesadores, aunque con menor velocidad.
- Opciones de despliegue: llama.cpp (CLI y servidor), Ollama, LM Studio y cualquier otra aplicacion que soporte formato GGUF. Tambien es posible convertir los pesos a otros formatos si se parte del modelo base safetensors.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM5-2B (original) | ~2.5B | no disponible | Apache 2.0 | Safetensors | HuggingFace |
| MiniCPM5-1B | ~1B | no disponible | Apache 2.0 | Safetensors | HuggingFace |
| Gemma-2-2B | ~2.6B | no disponible | Gemma Terms | Safetensors, GGUF | HuggingFace |
| Qwen2-1.5B | ~1.5B | no disponible | Apache 2.0 | Safetensors, GGUF | HuggingFace |

No se dispone de datos de benchmarks comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: al ser una version abliterada, no se han aplicado los filtros de alineacion del modelo original, por lo que los sesgos del modelo base no estan mitigados y pueden ser mas pronunciados.
- Riesgo de alucinacion: al tratarse de un modelo pequeno (2.5B), la probabilidad de generar contenido factualmente incorrecto es mayor que en modelos de mayor tamano.
- Limitaciones de contexto: la longitud de contexto no esta especificada en la informacion disponible, por lo que puede ser corta y limitar el uso en conversaciones largas o documentos extensos.
- Restricciones de licencia para uso comercial: la licencia Apache 2.0 permite uso comercial, pero la naturaleza "uncensored" del modelo puede generar responsabilidades legales o eticas en ciertas jurisdicciones.
- Caveat importante para produccion: este modelo no es una publicacion oficial de OpenBMB, sino una modificacion y cuantizacion de un tercero. La cuantizacion Q3_K_L puede degradar el rendimiento en comparacion con los pesos originales en formato safetensors.
- No se dispone de informacion sobre los idiomas soportados, lo que limita la confianza en aplicaciones multilingues.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mondk/MiniCPM5-2B-Abliterated-Uncensored-Safetensors-Q3_K_L-GGUF
- Modelo base safetensors: https://huggingface.co/mondk/MiniCPM5-2B-Abliterated-Uncensored-Safetensors
- Repositorio oficial de MiniCPM: https://github.com/OpenBMB/MiniCPM
- Modelo SFT de MiniCPM5-2B en HuggingFace: https://huggingface.co/openbmb/MiniCPM5-2B-SFT
