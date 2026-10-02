# rariruluis/Index-Translate-9B-MLX-4bit-MTP

## Resumen

Index-Translate-9B-MLX-4bit-MTP es una conversión no oficial a formato MLX del modelo IndexTeam/Index-Translate-9B, publicada por el usuario independiente rariruluis. Se trata de un checkpoint cuantizado a 4 bits (MLX affine, group size 64) pensado para ejecutarse en Apple Silicon a través del runtime oMLX, con el objetivo declarado de reducir el peso del modelo de los aproximadamente 18 GB en BF16 del original a unos 5,2 GB, sin reentrenamiento adicional. El pipeline declarado es traducción automática de texto.

La particularidad técnica de esta conversión es que preserva la cabeza nativa de Multi-Token Prediction (MTP) del modelo original. Las herramientas estándar de conversión de mlx-lm eliminan esa cabeza; este checkpoint aplica los parches de compatibilidad de oMLX antes de cuantizar, de modo que se conservan las 15 tensores MTP originales junto con la metainformación de cuantización de sus capas lineales. Esto permite emplear la decodificación especulativa Lightning MTP de oMLX, que es una característica del servidor y no del archivo de pesos en sí.

El modelo base, Index-Translate-9B, es un modelo de traducción de arquitectura Qwen3.5 con unos 9.197 millones de parámetros totales, del que el autor del modelo original declara cobertura de 150 idiomas e instrucciones de traducción para terminología, estilo, estructura y contexto. Esta conversión elimina por completo el codificador de visión y su configuración, por lo que solo procesa texto. No se han ejecutado benchmarks de traducción sobre este checkpoint cuantizado, de modo que los resultados publicados del modelo original no son extrapolables a esta versión de 4 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta del repositorio: qwen3_5), con cabeza nativa de Multi-Token Prediction (1 capa de prediccion, 15 tensores MTP) |
| Parametros totales | 9.197.093.888 (aproximadamente 9,2 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MLX affine de 4 bits, group size 64; tensores no cuantizados en BF16 (RMSNorm y proyeccion de fusion MTP, `mtp.fc`) |
| Idiomas soportados | El modelo original declara traduccion en 150 idiomas (segun su model card); la metadata de HuggingFace de esta conversion no lista idiomas concretos |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato MLX); archivo de pesos de aproximadamente 5,22 GB (4,86 GiB) |
| Tamano del repositorio | 5,2 GB |
| Libreria | mlx |
| Pipeline | translation |
| Revision de origen | `710123a9274f2486996d6a63b8d4909a51c4315d` (IndexTeam/Index-Translate-9B) |
| Entorno de conversion | oMLX 0.7.0, MLX 0.32.2, mlx-lm 0.31.4.dev132+g94cdcae13, Transformers 5.17.0 |

## Arquitectura y entrenamiento

El modelo base sigue una arquitectura transformer autorregresiva etiquetada como qwen3_5, con 9,2 mil millones de parametros. La conversion no modifica los pesos mas alla del proceso de cuantizacion: se aplica cuantizacion afina de 4 bits con group size 64 sobre las capas lineales, mientras que las RMSNorm y la proyeccion de fusion de la cabeza MTP permanecen en BF16 para preservar la estabilidad numerica. Ademas se aplican las transformaciones necesarias de RMSNorm y convolucion para convertir los pesos del formato original de HuggingFace al formato MLX.

La innovacion tecnica relevante no esta en el entrenamiento (no se realizo ningun entrenamiento adicional en esta conversion) sino en el proceso de cuantizacion. El flujo estandar de mlx-lm descarta la cabeza MTP, lo que inutiliza la decodificacion especulativa Lightning MTP de oMLX. Este checkpoint emplea los parches de compatibilidad de oMLX aplicados antes de cuantizar, conservando las 15 tensores MTP originales, incluida la capa unica de prediccion, junto con la metadata de cuantizacion de sus capas lineales. El script `convert_mtp.py` documenta el procedimiento, espera encontrar la revision de origen en la cache de HuggingFace y escribe en un directorio nuevo, negandose a sobrescribir modelos existentes. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en el modelo base, mas alla de lo publicado en su propia model card.

## Capacidades

- Traduccion de texto entre idiomas: el modelo base declara cobertura de 150 idiomas e instrucciones de traduccion para controlar terminologia, estilo, estructura y contexto.
- Instrucciones de traduccion avanzadas: admite indicaciones sobre glosario, tono, registro y formato de salida.
- Generacion de texto condicionada por plantilla de chat: la model card incluye un ejemplo de uso con el endpoint compatible con OpenAI de oMLX y `chat_template_kwargs` para desactivar el modo thinking.
- Modo thinking desactivable: en el ejemplo de uso se recomienda explicitamente `thinking off` y `temperature=0`.
- Salida estructurada con JSON Schema: soportada en oMLX mediante el backend de gramaticas xgrammar y `response_format` con `json_schema` en modo estricto. Requiere instalar oMLX con soporte de gramatica (por ejemplo `brew reinstall omlx --with-grammar`); si xgrammar no esta disponible, oMLX avisa y recurre a prompting de mejor esfuerzo incluso con `strict: true`.
- Traduccion por lotes estructurada: mediante esquemas de objeto con claves fijas, todos los identificadores de entrada obligatorios y `additionalProperties: false`.
- Decodificacion especulativa MTP: la cabeza Multi-Token Prediction se conserva para el runtime de oMLX, pero es una caracteristica del servidor; descargar el archivo de pesos no activa por si solo la decodificacion especulativa y mlx-lm estandar no activa el runtime MTP de oMLX.
- Capacidades no soportadas en esta conversion: entrada de imagen o video (el codificador de vision y su configuracion fueron eliminados), audio y cualquier tarea multimodal.

## Casos de uso

- Traduccion de documentacion tecnica: el modelo puede procesar textos largos e instrucciones de terminologia, lo que permite fijar un glosario por proyecto y mantener consistencia de terminos entre documentos. La ventana de contexto concreta no esta documentada, por lo que conviene trocear por presupuesto de tokens de entrada y salida.
- Localizacion de interfaces de producto: traduccion de cadenas de UI con control de estructura y formato, usando el modo de salida estructurada para devolver pares clave-valor que respeten los identificadores originales.
- Traduccion por lotes con salida JSON verificable: con un esquema de claves fijas y `additionalProperties: false`, se pueden traducir lotes de cadenas y detectar identificadores ausentes o inventados antes de integrarlos en la aplicacion; hay que validar la respuesta y rechazar truncamientos.
- Generacion de subtitulos y transcripciones multilingues: al ser un modelo solo texto, encaja en pipelines donde la transcripcion de audio ya la produce otro componente; el modelo se limita a traducir el texto resultante.
- Asistencia a equipos de soporte multilingue: traduccion de tickets y respuestas de atencion al cliente con control de tono y registro, ejecutada localmente en un Mac con Apple Silicon y sin enviar datos a servicios externos.
- Traduccion de correo y comunicacion interna en empresas con requisito de confidencialidad: el despliegue local con oMLX evita la salida de datos a terceros, y la licencia Apache-2.0 permite uso comercial.
- Transformacion de contenido editorial entre idiomas preservando estructura: el control de estructura del modelo base permite mantener encabezados, listas y marcado al traducir, aunque la preservacion de marcado debe validarse aparte del esquema JSON.
- Prototipado en portatiles Apple Silicon: el peso de 4,86 GiB permite probar un modelo de traduccion de 9,2 mil millones de parametros en equipos de consumo, sin necesidad de GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card de esta conversion indica explicitamente que no se ha ejecutado ningun benchmark de traduccion completo sobre el checkpoint cuantizado, y que las puntuaciones publicadas del modelo original no constituyen una evaluacion de esta version de 4 bits. Tampoco se documentan tasas de aceptacion de MTP ni cifras de throughput, y se senala que la aceptacion y el rendimiento de MTP dependen del texto, el hardware, la concurrencia de peticiones y la implementacion del servidor, de modo que preservar la cabeza no garantiza una mejora de velocidad.

## Requisitos de hardware

- VRAM o memoria unificada estimada: el archivo de pesos ocupa aproximadamente 4,86 GiB. Conviene presupuestar al menos 8 GB de memoria unificada para pesos, cache KV y sobrecarga del runtime; 16 GB o mas es una opcion comoda para lotes concurrentes.
- Plataforma: MLX esta disenado para Apple Silicon, por lo que este checkpoint esta pensado para Macs con chips de la familia M. No hay soporte documentado para GPUs NVIDIA o AMD en esta conversion.
- GPU recomendadas: no aplica el catalogo habitual de A100, H100 o RTX 4090; el destino es Apple Silicon (Mac con memoria unificada suficiente).
- Cabe en hardware de consumo: si, en Macs con Apple Silicon y memoria unificada suficiente, dado el tamano de 4,86 GiB del archivo de pesos.
- Opciones de despliegue: oMLX, con el motor LLM, Lightning MTP activado, thinking desactivado y `temperature=0`. Para entrada y salida estructurada se necesita la variante de oMLX con soporte de gramaticas. El repositorio se descarga con `hf download` a `~/.omlx/models/` y se arranca con `omlx start`. mlx-lm estandar no activa el runtime MTP de oMLX.
- Latencia y throughput: no disponibles. La model card no publica cifras y advierte que dependen del hardware, la concurrencia y la implementacion del servidor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| Index-Translate-9B-MLX-4bit-MTP | 9,2 mil millones | No disponible | 4 bits MLX affine, group size 64 | Apache-2.0 | HuggingFace, conversion no oficial | Solo texto, cabeza MTP conservada, requiere oMLX |
| IndexTeam/Index-Translate-9B (modelo base) | 9,2 mil millones | No disponible | BF16 | Apache-2.0 | HuggingFace, release oficial | Incluye codificador de vision; mayor peso de almacenamiento |
| Otras conversiones MLX del mismo base con mlx-lm estandar | 9,2 mil millones | No disponible | 4 bits | Apache-2.0 | Segun cada publicacion | Descartan la cabeza MTP, por lo que no habilitan Lightning MTP |

No se dispone de datos verificados de rendimiento de esta conversion que permitan una comparacion cuantitativa con alternativas de traduccion de tamano similar (por ejemplo modelos de traduccion dedicados de la familia NLLB o Tower). Cualquier comparacion numerica deberia basarse en una evaluacion propia sobre el checkpoint cuantizado.

## Limitaciones y advertencias

- Checkpoint convertido de forma independiente: no es una publicacion oficial de IndexTeam y no cuenta con validacion del equipo autor del modelo base.
- La cuantizacion a 4 bits puede degradar la calidad de traduccion y no se ha ejecutado ningun benchmark de traduccion completo sobre esta conversion.
- Los resultados de benchmarks publicados del modelo original no son validos para este checkpoint cuantizado.
- La decodificacion especulativa MTP solo funciona en el runtime de oMLX; descargar el archivo de pesos con la cabeza conservada no habilita por si solo la decodificacion especulativa, y mlx-lm estandar no la activa.
- La aceptacion de MTP y el throughput dependen del texto, el hardware, la concurrencia de peticiones y la implementacion del servidor; preservar la cabeza no garantiza ninguna aceleracion.
- Sin soporte de imagen ni video: el codificador de vision y su configuracion fueron eliminados, por lo que cualquier caso de uso multimodal queda fuera del alcance de esta conversion.
- El cumplimiento de JSON Schema depende de que el backend de gramaticas xgrammar este instalado y activo; si no lo esta, oMLX avisa y recurre a prompting de mejor esfuerzo aunque se haya solicitado `strict: true`, y un ejemplo JSON valido no demuestra que la restriccion se este aplicando.
- La restriccion de esquema controla la estructura, no la correccion de la traduccion, la eleccion de idioma, el cumplimiento de glosario ni la preservacion de marcadores; hay que validar la respuesta, rechazar truncamientos y comprobar por separado las restricciones propias de la aplicacion.
- Con oMLX 0.7.0, las peticiones con gramatica restringida no usan Lightning MTP: la traduccion de texto normal puede usar MTP, pero la traduccion con esquema recurre a la ruta de decodificacion estandar para preservar el estado de la gramatica.
- Los trabajos de traduccion grandes deben dividirse por presupuesto de tokens de entrada y salida o servirse como peticiones independientes en lote concurrente.
- Riesgo de alucinacion y de omision o invencion de identificadores en salidas estructuradas si no se valida el resultado; el propio autor recomienda esquemas con claves fijas, todos los identificadores obligatorios y `additionalProperties: false`.
- Sesgos conocidos: no documentados en la informacion disponible.
- Limitaciones de contexto e idioma: la longitud de contexto no esta documentada y, aunque el modelo base declara 150 idiomas, no se detalla en esta conversion la cobertura real ni la calidad por idioma.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero hay que conservar la licencia y la atribucion del modelo original al redistribuir. El repositorio conserva `LICENSE` y remite a la model card original.
- La conversion partio de una revision concreta del modelo base (`710123a9274f2486996d6a63b8d4909a51c4315d`); cambios posteriores en el modelo original no estan reflejados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rariruluis/Index-Translate-9B-MLX-4bit-MTP
- Modelo base: https://huggingface.co/IndexTeam/Index-Translate-9B
- Licencia del repositorio: archivo `LICENSE` incluido en el repositorio (Apache-2.0)
- Script de conversion: `convert_mtp.py`, incluido en el repositorio
- Modelo original de referencia para entrenamiento, cobertura de idiomas, benchmarks y limitaciones: model card de IndexTeam/Index-Translate-9B (enlazada mas arriba)

Nota sobre la busqueda web: los resultados recuperados en la busqueda no guardan ninguna relacion con el modelo ni con traduccion automatica, por lo que no se incluyen como fuentes. No se han encontrado papers, blogs tecnicos ni demos adicionales verificables sobre esta conversion.
