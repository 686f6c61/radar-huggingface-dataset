# CrabMeatPot/Hy-MT3-1.8B-4bit-mlx

## Resumen

Hy-MT3-1.8B-4bit-mlx es una cuantizacion en 4 bits del modelo de traduccion tencent/Hy-MT3-1.8B, publicada por el usuario CrabMeatPot. El modelo original lo desarrolla Tencent y pertenece a la familia Hunyuan (arquitectura `hunyuan_v1_dense`). Esta version concreta no modifica los pesos mas alla de la cuantizacion y esta pensada para ejecutarse de forma local en hardware Apple Silicon mediante la libreria MLX.

La relevancia de esta publicacion es acotada: se trata de un artefacto derivado, no de un modelo nuevo. Su interes practico radica en permitir inferencia de un modelo de traduccion de 1.791 millones de parametros en equipos con memoria unificada de gama consumer, reduciendo el peso del repositorio a aproximadamente 1 GB. El autor declara explicitamente que el uso previsto es la traduccion local dentro de su aplicacion "譯讀".

Al estar cuantizado con `mlx_lm.convert` a 4 bits y no haberse publicado datos de evaluacion propios, cualquier valoracion de calidad debe remitirse al modelo base original. La licencia Apache-2.0 se hereda del modelo de Tencent.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | hunyuan_v1_dense (transformer denso) |
| Parametros totales | 1.791.080.448 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (MLX, generado con `mlx_lm.convert -q --q-bits 4`) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Hunyuan de Tencent, con la etiqueta de arquitectura `hunyuan_v1_dense`, lo que indica un transformer denso (sin mezcla de expertos) de 1.791 millones de parametros. La model card de esta version cuantizada no aporta informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO; esos datos corresponderian al modelo original tencent/Hy-MT3-1.8B.

La unica intervencion tecnica documentada es la conversion a 4 bits con mlx-lm 0.32.2 sobre el commit `79e9c301609d6a4009fbb110922dca379dfe1e9a` del modelo base. El autor afirma que los pesos no sufrieron otras modificaciones. No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal en esta ficha.

## Capacidades

- Traduccion automatica: es la tarea declarada en el pipeline (`translation`) y el proposito del modelo base.
- Generacion de texto en el idioma de destino a partir de una entrada en el idioma de origen, segun la plantilla de prompt del modelo original.
- Ejecucion local en Apple Silicon mediante MLX, sin dependencia de servicios en la nube.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; la model card no enumera pares de idiomas.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Traduccion integrada en aplicaciones de escritorio para macOS: el formato MLX y el peso de ~1 GB permiten empaquetar el modelo dentro de una app nativa y traducir sin conexion, que es exactamente el escenario declarado por el autor ("譯讀").
- Traduccion de documentos ofimicos en lote: al ejecutarse localmente, se pueden procesar ficheros de texto o subtitulos sin enviar contenido a terceros, lo que resulta adecuado para material confidencial.
- Prototipado rapido de pipelines de traduccion: al ser una cuantizacion de 4 bits, permite validar flujos de preprocesado y postprocesado en un portatil antes de migrar al modelo completo en precision mayor.
- Traduccion en entornos sin conectividad: escenarios de campo, dispositivos aislados o redes restringidas donde no se puede invocar una API externa.
- Evaluacion comparativa de cuantizaciones: sirve como referencia para medir la perdida de calidad de 4 bits frente al modelo base en tareas de traduccion concretas.
- Traduccion de contenido web o correo en herramientas personales: el coste marginal de inferencia es nulo una vez descargado el modelo, lo que lo hace apto para uso intensivo en estaciones de trabajo individuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas BLEU, COMET, MMLU ni ninguna otra evaluacion, ni del modelo cuantizado ni del base.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio ocupa 1.0 GB en 4 bits; en ejecucion hay que sumar el overhead de MLX, las cachés KV y el contexto, por lo que conviene reservar al menos 2-3 GB de memoria unificada.
- Hardware objetivo: Apple Silicon (series M1, M2, M3, M4 y superiores), dado que la libreria es MLX; no es ejecutable directamente en GPU NVIDIA sin conversion previa a otro formato.
- Cabe en GPU consumer: si, en cualquier Mac con memoria unificada de 8 GB o mas; en el ecosistema NVIDIA requeriria convertir los pesos a GGUF u otro formato.
- Opciones de despliegue: `mlx-lm` (libreria declarada); llama.cpp, Ollama o vLLM no son compatibles directamente con este repositorio tal como esta publicado.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| CrabMeatPot/Hy-MT3-1.8B-4bit-mlx | 1.791 M | no disponible | 4 bits | Apache-2.0 | safetensors MLX |
| tencent/Hy-MT3-1.8B (base) | 1.791 M | no disponible | completa | Apache-2.0 | no disponible |
| Otros modelos de traduccion de ~2B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento del modelo base ni de alternativas comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- La cuantizacion a 4 bits puede degradar la calidad de traduccion respecto al modelo base; no se aportan mediciones que cuantifiquen esa perdida.
- El autor no documenta los pares de idiomas soportados ni la calidad por idioma; usar el modelo fuera de los idiomas previstos por el base es arriesgado.
- No hay plantilla de system prompt incluida: la model card remite a la documentacion del modelo original, y un formato de prompt incorrecto puede degradar gravemente la salida.
- Riesgo de alucinacion y de omisiones en textos largos: inherente a los modelos de traduccion neuronales, agravado por la falta de datos de evaluacion.
- Sesgos: no documentados; al no conocerse la composicion del dataset de entrenamiento del modelo base, no se pueden acotar sesgos linguisticos o culturales.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base de Tencent y conservar el aviso de licencia.
- Dependencia de plataforma: al estar en formato MLX, no es portable directamente a otros stacks de inferencia sin reconversion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CrabMeatPot/Hy-MT3-1.8B-4bit-mlx
- Modelo base: https://huggingface.co/tencent/Hy-MT3-1.8B
- Commit del modelo base referenciado: `79e9c301609d6a4009fbb110922dca379dfe1e9a`
- Libreria MLX: https://github.com/ml-explore/mlx
- mlx-lm: https://github.com/ml-explore/mlx-lm
