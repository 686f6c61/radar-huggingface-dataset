# burningfeet/backup2026-10-26-LffyFx-Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-GGUF

## Resumen

Este repositorio contiene una cuantización en GGUF del modelo Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive, publicada por el usuario burningfeet bajo el nombre backup2026-10-26-LffyFx-Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-GGUF. Se trata de un derivado, no de un modelo entrenado desde cero: el autor declara explícitamente que no entrena ni afina modelos, sino que aplica un procedimiento propio llamado Genesis (regeneración y calibración de datos post-entrenamiento sobre GGUF, con una variante denominada Genesis-SVD) para corregir la deriva de tensores introducida por la cuantización. El resultado es un artefacto listo para inferencia local con llama.cpp y compatible con el ecosistema GGUF.

El modelo base es un Qwen3.6 de 34.660.610.688 parámetros totales (etiquetado comercialmente como 35B-A3B, es decir, arquitectura de mezcla de expertos con aproximadamente 3B de parámetros activos), en su variante "Uncensored" publicada por HauhauCS y orientada a eliminar rechazos. Sobre esa base, esta ficha incorpora la orientación "Hermes", asociada al dataset NousResearch/hermes-function-calling-v1 y a capacidades de function calling y uso agéntico, además de conservar el pipeline multimodal image-text-to-text (visión) del modelo original.

Es relevante ahora por tres motivos: la licencia Apache-2.0, la disponibilidad en GGUF para despliegue en hardware de consumo y su orientación explícita a casos de uso sin filtrado de contenido, un nicho con demanda creciente en investigación y red teaming. Como contrapartida, el repositorio tiene cero descargas y cero likes en el momento de la consulta, requiere acceso restringido en HuggingFace y no publica resultados de benchmarks propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), segun las etiquetas del repositorio; detalles de atencion y configuracion de expertos no disponibles |
| Parametros totales | 34.660.610.688 (~34,7B), dato de safetensors |
| Parametros activos | ~3B segun la nomenclatura A3B del nombre; cifra exacta no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con calibracion imatrix; el autor recomienda APEX o Q8_K_P; catalogo completo de quants del repo no disponible |
| Idiomas soportados | en, zh, multilingue |
| Licencia | Apache-2.0 (acceso restringido: requiere aceptar condiciones en HuggingFace) |
| Formato de pesos | GGUF (tamano del repo: 89,3 GB) |
| Pipeline | image-text-to-text (multimodal, vision) |
| Modelo base | HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive |
| Metodo de derivacion | Genesis (regeneracion y calibracion post-entrenamiento, Genesis-SVD); no es un fine-tune |
| Libreria declarada | hermes |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer con mezcla de expertos (MoE) de la familia Qwen3.6, con 34,7B parámetros totales y del orden de 3B activos por token, según la nomenclatura A3B y la etiqueta "moe" del repositorio. El pipeline declarado es image-text-to-text, lo que implica un codificador visual integrado y capacidad de procesar imágenes junto a texto; no se dispone de detalles sobre el número de expertos, la estrategia de enrutamiento, el tipo de atención ni la longitud de contexto nativa en la información proporcionada. El tamaño del repositorio (89,3 GB) es coherente con un conjunto de cuantizaciones de un modelo de ~35B, incluyendo variantes de 8 bits y formatos de mayor precisión.

El proceso de derivación no es un entrenamiento al uso. Según la documentación del autor, Genesis es un algoritmo de regeneración y calibración de datos post-entrenamiento para modelos en formato GGUF, descrito como independiente de la arquitectura, basado en estadística matemática y desarrollado a lo largo de aproximadamente medio año con ayuda de IA. El objetivo declarado es "reparar la pureza de la señal" y corregir la deriva de tensores (tensor drift) provocada por la cuantización, mediante una técnica denominada Genesis-SVD. La orientación Hermes procede del uso del dataset NousResearch/hermes-function-calling-v1, según las etiquetas, y el modelo base de HauhauCS aporta el comportamiento sin rechazos (el autor de la variante V5 cita 0/465 rechazos sobre esa base). No hay información sobre volumen de tokens de entrenamiento, composición del dataset, ni uso de RLHF o DPO en ninguna de las etapas.

## Capacidades

- Generacion de texto conversacional multi-turno, con pipeline declarado image-text-to-text.
- Procesamiento de imagenes: el modelo acepta entradas de imagen y texto (vision multimodal), segun el pipeline y las etiquetas "vision" y "multimodal".
- Tool calling y function calling: etiqueta basada en el dataset NousResearch/hermes-function-calling-v1 y en la libreria "hermes" declarada.
- Uso agéntico: la etiqueta "agentic" indica soporte previsto para razonamiento multi-paso y encadenamiento de herramientas; no se detalla el formato exacto de plantilla de herramientas.
- Multilingue: ingles y chino declarados, mas cobertura multilingue generica; no se especifica el resto de idiomas.
- Modo sin rechazos: el modelo base esta disenado para minimizar negativas del tipo "no puedo ayudar con eso", con el respaldo declarado de 0/465 rechazos en la variante V5.
- Compatibilidad con endpoints: etiqueta "endpoints_compatible", orientada a despliegues tipo API compatible con OpenAI.
- Capacidades de codigo y matematicas: no hay informacion especifica ni benchmarks que las confirmen en la documentacion disponible.

## Casos de uso

- Investigacion sobre alineamiento y red teaming: el caracter sin filtrado del modelo base lo hace util para generar conjuntos de prompts adversarios y estudiar la respuesta de sistemas con y sin capas de seguridad, en un entorno controlado y con registro de resultados.
- Agentes con function calling en local: al estar en GGUF y con ~3B de parametros activos, puede ejecutarse en una estacion de trabajo con una sola GPU y actuar como planificador que invoca APIs mediante JSON, sin enviar datos a servicios externos.
- Despliegue on-premise con requisitos de confidencialidad: sectores como legal, salud o auditoria pueden ejecutar el modelo en infraestructura propia sin exposicion de datos, siempre que asuman la ausencia de filtros de contenido.
- Procesamiento de documentos con imagenes: el pipeline image-text-to-text permite extraer y resumir informacion de capturas, formularios escaneados o diagramas combinados con instrucciones textuales.
- Atencion al cliente automatizada en ingles y chino: conversaciones multi-turno con contexto largo; la longitud de contexto debe verificarse antes de dimensionar la memoria de la cache KV, ya que no esta publicada.
- Generacion de datos sinteticos y aumentacion de datasets: util para producir dialogos y trazas de herramientas en dominios donde los corpus publicos son escasos, con posterior revision humana.
- Experimentacion con tecnicas de cuantizacion: sirve como caso de estudio para comparar el efecto de Genesis-SVD frente a cuantizaciones estandar con imatrix sobre una misma base MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato numerico verificable aportado por el autor es una tasa declarada de 0/465 rechazos en la variante V5 del mismo linaje, que mide comportamiento de negativa, no calidad de razonamiento, codigo o matematicas. No se dispone de MMLU, HumanEval, GSM8K, MMMU ni de evaluaciones multimodales para este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de 34,7B parametros totales; los expertos no activos deben residir igualmente en memoria): Q4_K_M en torno a 20-22 GB, Q5_K_M en torno a 24-25 GB, Q6_K en torno a 28-30 GB, Q8_K_P en torno a 37-39 GB y FP16 en torno a 70 GB. Son estimaciones de pesos; hay que sumar cache KV y, en su caso, el codificador visual.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para Q4, con margen ajustado; A6000, RTX 6000 Ada o dos GPU de 24 GB para Q6 y Q8; A100 o H100 de 80 GB para FP16 y contextos largos.
- Cabe en GPU de consumo: si, en el rango Q4 con 24 GB de VRAM; las variantes Q6 y Q8 requieren 32 GB o mas o reparto entre dos tarjetas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y KoboldCpp para GGUF; vLLM y TGI solo con soporte parcial o experimental de GGUF. La etiqueta "endpoints_compatible" sugiere servidores con API compatible con OpenAI.
- Latencia y throughput: no disponibles. Al ser MoE con ~3B activos, la decodificacion estara limitada por el ancho de banda de memoria de la GPU mas que por la potencia de calculo, por lo que el rendimiento por token dependera del quant elegido y del ancho de banda del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (Genesis-Hermes, backup 2026-10-26) | 34,7B totales / ~3B activos | no disponible | sin benchmarks publicados | Apache-2.0, acceso restringido | GGUF, 89,3 GB, 0 descargas |
| HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive (base) | 34,7B totales / ~3B activos | no disponible | sin benchmarks en la informacion disponible | no disponible en la informacion | pesos originales, presumiblemente safetensors |
| burningfeet/...Genesis-Hermes-V5-GGUF | misma base | no disponible | 0/465 rechazos declarados por el autor | Apache-2.0 segun el repositorio | GGUF; V10 registra 33 descargas |
| burningfeet/...Genesis-Hermes-V10-GGUF-2026-08-24 | misma base | no disponible | no disponible | no disponible en la informacion | GGUF, 33 descargas y 1 like |
| Qwen3.6-35B-A3B (upstream, sin variante uncensored) | ~35B / ~3B activos segun nomenclatura | no disponible | no disponible | no disponible | no consultado en esta busqueda |

Las diferencias entre las versiones V5, V7 y V10 y este backup no estan documentadas en la informacion disponible; el nombre del repositorio sugiere una copia de seguridad fechada, sin que se pueda confirmar que el contenido coincida con una version concreta.

## Limitaciones y advertencias

- Ausencia de alineamiento de seguridad: el modelo base es explicitamente "Uncensored" y el autor reporta cero rechazos, por lo que puede generar contenido danino, ilegal o sexual sin filtro. No es apto para exposicion directa a usuarios finales sin una capa de moderacion propia.
- Riesgo de alucinacion: no hay evaluaciones de fidelidadfactual ni de calibracion; al ser un derivado por calibracion estadistica y no por entrenamiento supervisado adicional, no cabe esperar mejoras en veracidad respecto a la base.
- Procedencia y trazabilidad: el repositorio tiene 0 descargas y 0 likes, el nombre incluye una fecha futura (2026-10-26) y el prefijo "backup", y no se documenta que version de Genesis se aplico. La validacion por parte de la comunidad es nula.
- Acceso restringido: es un repositorio gated; requiere aceptar condiciones en HuggingFace, lo que puede bloquear automatizaciones y pipelines de CI.
- Licencia: el repositorio declara Apache-2.0, pero al ser un derivado conviene verificar los terminos del modelo base de HauhauCS y de Qwen3.6 antes de un uso comercial, ya que las condiciones del upstream pueden imponer restricciones adicionales.
- Contexto e idiomas: la longitud de contexto no esta publicada y solo se declaran ingles, chino y cobertura multilingue generica; el rendimiento en castellano no esta evaluado.
- Cuantizacion: la calidad final depende del quant concreto y de la calibracion imatrix; los quants de 4 bits pueden degradar el enrutamiento de expertos y las capacidades multimodales. El autor solo recomienda APEX o Q8_K_P.
- Vision: no hay datos sobre resolucion de imagen soportada, numero de tokens visuales ni evaluaciones de OCR o comprension de documentos.
- Produccion: sin benchmarks, sin contexto documentado y sin soporte conocido en vLLM/TGI, el uso en produccion exige una evaluacion propia previa y un plan de contencion de errores.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/burningfeet/backup2026-10-26-LffyFx-Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-GGUF
- Modelo base: https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Version V5 del mismo linaje: https://huggingface.co/burningfeet/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V5-GGUF
- README de la version V7 (descripcion del metodo Genesis): https://huggingface.co/burningfeet/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V7-GGUF-2026-08-07/blob/main/README.md
- Ficha en abliteration.org de la V5: https://abliteration.org/models/burningfeet/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V5-GGUF
- Ficha en abliteration.org de la V10: https://abliteration.org/models/burningfeet/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V10-GGUF-2026-08-24
- Registro en free2aitools de un backup similar: https://free2aitools.com/model/burningfeet/backup2026-10-20-lffyfx-tiel-coder-35b-a3b-genesis-hermes-gguf
- Dataset de function calling citado en las etiquetas: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Script de cuantizacion con Unsloth: mencionado en la documentacion del autor, URL no disponible en la busqueda.
