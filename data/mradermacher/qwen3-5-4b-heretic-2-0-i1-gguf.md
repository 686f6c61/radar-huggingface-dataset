# mradermacher/Qwen3.5-4B-heretic-2.0-i1-GGUF

## Resumen

Qwen3.5-4B-heretic-2.0-i1-GGUF es una cuantizacion en formato GGUF del modelo p-e-w/Qwen3.5-4B-heretic-2.0, una variante "abliterated" (decensored) del Qwen3.5-4B de Alibaba Qwen. El trabajo de cuantizacion lo firma mradermacher, un autor habitual en el ecosistema GGUF conocido por publicar versiones optimizadas con matrices de importancia (imatrix) de modelos populares. El modelo base parte de la arquitectura Qwen3.5 con 4.205.751.296 parametros totales, lo que lo situa en la categoria de modelos pequenos aptos para hardware de consumo.

El problema que resuelve es doble: por un lado, ofrece una version del Qwen3.5-4B con los rechazos de seguridad reducidos mediante tecnicas de abliteration, orientada a investigadores que necesitan estudiar el comportamiento del modelo sin las capas de rechazo por defecto; por otro, la cuantizacion imatrix permite ejecutar el modelo en GPUs de gama media o incluso en CPU con perdidas de calidad controladas. El repositorio incluye un amplio abanico de cuantizaciones que van desde IQ1_S (1,5 GB) hasta Q6_K (3,6 GB).

La relevancia actual radica en que combina tres factores poco frecuentes a la vez: un modelo base reciente de la familia Qwen3.5, una modificacion heretic/abliterated reproducible y un conjunto completo de cuantizaciones GGUF con imatrix. La licencia Apache 2.0 facilita su uso tanto en investigacion como en productos comerciales, aunque con las advertencias propias de un modelo decensored. El modelo se distribuye como vision model, con archivos mmproj en el repositorio estatico asociado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), variante abliterated/heretic |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, IQ3_XXS, Q2_K, Q3_K_S, IQ3_XS, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas i1/imatrix) |
| Idiomas soportados | en (segun model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Qwen3.5 con 4.205.751.296 parametros. La variante heretic-2.0 se ha obtenido mediante tecnicas de abliteration, un proceso que identifica y neutraliza las direcciones de activacion asociadas a los rechazos de seguridad, reduciendo la tendencia del modelo a declinar peticiones. El autor del modelo base (p-e-w) etiqueta el resultado como "reproducible", lo que sugiere que el proceso de abliteration es replicable a partir del modelo original.

La cuantizacion la realiza mradermacher con el pipeline i1 (imatrix), que calcula una matriz de importancia a partir de un corpus de calibracion y la usa para ponderar la cuantizacion de cada tensor. Esto produce cuantizaciones de menor tamano con mejor calidad que las estaticas equivalentes, especialmente en los rangos bajos (IQ2, IQ3). El repositorio incluye tambien el archivo imatrix.gguf (0,1 GB) para que otros puedan generar sus propias cuantizaciones. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto conversacional en ingles, con el estilo propio de la familia Qwen3.5.
- Capacidades de vision: el autor indica que es un vision model y que los archivos mmproj estan en el repositorio estatico asociado.
- Razonamiento y generacion de codigo heredados del modelo base Qwen3.5-4B (no verificados en esta ficha).
- Comportamiento decensored: menor tasa de rechazos ante peticiones que el modelo original rechazaria.
- Compatibilidad con endpoints (tag endpoints_compatible), lo que facilita su despliegue en servidores compatibles con la API de OpenAI.
- Soporte de tool calling y agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: la model card solo declara ingles.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar como responde un transformer de 4B sin las capas de rechazo, util para analizar sesgos, robustez y comportamiento en dominios sensibles en entornos controlados.
- Despliegue en hardware de consumo: con cuantizaciones de 2,6-3,2 GB (IQ4_XS, Q4_K_M, Q5_K_M) cabe en GPUs con 4-6 GB de VRAM, lo que permite prototipar asistentes conversacionales en equipos de gama media.
- Generacion de texto en local con Ollama o llama.cpp: el formato GGUF y la disponibilidad de cuantizaciones IQ permiten ejecutar el modelo en portatiles sin GPU dedicada usando la version IQ2 o IQ3.
- Evaluacion comparativa de tecnicas de abliteration: al ser reproducible y estar disponible en muchos niveles de cuantizacion, sirve para medir como afecta la cuantizacion a las capacidades del modelo decensored frente al original.
- Procesamiento de imagenes en pipelines ligeros: al ser un vision model, puede usarse para tareas de descripcion de imagenes o extraccion de informacion visual en entornos con recursos limitados, usando los mmproj del repositorio estatico.
- Filtrado y clasificacion de contenido en investigacion: util para construir clasificadores o detectores que necesitan un modelo menos restrictivo como generador de ejemplos negativos o casos limite.
- Fine-tuning y destilacion: el modelo base en safetensors (p-e-w/Qwen3.5-4B-heretic-2.0) puede servir como punto de partida para ajuste fino en tareas especificas, y las cuantizaciones permiten validar rapidamente el comportamiento antes de invertir en entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): IQ1_S ~1,5 GB; IQ2_M ~1,8 GB; IQ3_M ~2,3 GB; IQ4_XS ~2,6 GB; Q4_K_M ~2,8 GB; Q5_K_M ~3,2 GB; Q6_K ~3,6 GB. Hay que anadir 0,5-1,5 GB adicionales para KV cache y overhead segun la longitud de contexto.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090; en el entorno profesional, A10, L4, A100 y H100 para despliegues con concurrencia.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU con 4 GB o mas de VRAM usando IQ3/IQ4; en GPUs de 8 GB o mas puede usarse Q5_K_M o Q6_K con contexto amplio.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con la API de OpenAI (el tag endpoints_compatible lo indica). Para vLLM o TGI seria necesario convertir el GGUF o usar el modelo base en safetensors.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/Qwen3.5-4B-heretic-2.0-i1-GGUF | 4,2B | no disponible | Apache 2.0 | GGUF (imatrix) | Variante decensored con vision, cuantizaciones desde 1,5 GB |
| mradermacher/Qwen3.5-4B-heretic-2.0-GGUF | 4,2B | no disponible | Apache 2.0 | GGUF (estatico) | Mismo modelo base, cuantizaciones sin imatrix |
| p-e-w/Qwen3.5-4B-heretic-2.0 | 4,2B | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar, punto de partida para fine-tuning |
| Qwen/Qwen3.5-4B | 4,2B | no disponible | Apache 2.0 | safetensors | Modelo original con alineacion completa, referencia de comportamiento |

## Limitaciones y advertencias

- Modelo decensored: la abliteration reduce los rechazos de seguridad, por lo que puede generar contenido que el modelo original filtraria. No es adecuado para aplicaciones de cara al publico sin una capa de moderacion adicional.
- Riesgo de alucinacion: inherente a los transformers de 4B; la cuantizacion agresiva (IQ1, IQ2) incrementa la perdida de coherencia y la tasa de errores factuales.
- Idiomas: la model card solo declara ingles; el rendimiento en castellano no esta verificado y probablemente sea inferior.
- Contexto: no se dispone de la longitud de contexto oficial en la informacion proporcionada; conviene consultar la model card del modelo base antes de disenar aplicaciones con contexto largo.
- Calidad de las cuantizaciones bajas: el propio autor advierte que IQ1_S es "for the desperate" y Q2_K_S es "very low quality"; para produccion se recomienda IQ4_XS o superior.
- Licencia: Apache 2.0 permite uso comercial, pero la modificacion heretic puede entrar en conflicto con las politicas de uso de algunos proveedores de servicios o plataformas.
- Vision: los archivos mmproj no estan en este repositorio sino en el estatico; hay que descargarlos por separado para usar las capacidades multimodales.
- Sin datos de benchmarks: no hay evaluaciones publicadas en la informacion disponible, por lo que las afirmaciones sobre calidad relativa deben tomarse con cautela.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.5-4B-heretic-2.0-i1-GGUF
- Modelo base: https://huggingface.co/p-e-w/Qwen3.5-4B-heretic-2.0
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Qwen3.5-4B-heretic-2.0-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.5-4B-heretic-2.0-i1-GGUF
- Licencia del modelo original Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
