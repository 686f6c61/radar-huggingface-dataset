# h6e/RefusalLM2-143M

## Resumen

RefusalLM2-143M es un modelo publicado en HuggingFace por el usuario h6e bajo licencia MIT. La informacion disponible es muy limitada: la model card no contiene mas que la declaracion de licencia, el repositorio ocupa 0,3 GB y no registra descargas ni interacciones en el momento de la consulta (creado el 12 de octubre de 2026). El unico tag tecnico relevante es `onnx`, lo que indica que los pesos se distribuyen en formato ONNX, presumiblemente orientados a inferencia optimizada.

El nombre del modelo sugiere dos cosas que no pueden confirmarse con la informacion disponible: un tamano de aproximadamente 143 millones de parametros (coherente con el peso del repositorio) y un proposito relacionado con el comportamiento de rechazo (refusal) en modelos de lenguaje. No hay documentacion que confirme si se trata de un modelo entrenado para rechazar peticiones daninas, de un modelo de investigacion sobre direcciones de rechazo, o de cualquier otra aplicacion. Cualquier afirmacion al respecto es una hipotesis derivada del nombre y no un dato verificado.

La relevancia de este modelo es, por tanto, principalmente de investigacion o experimental: los modelos de menos de 200 millones de parametros son utiles para estudiar mecanismos internos, servir como clasificadores ligeros o ejecutarse en hardware muy limitado, pero no compiten en capacidad general con modelos de escala media o grande.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere un transformer, sin confirmar) |
| Parametros totales | no disponible; el sufijo del nombre indica aproximadamente 143 millones |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el tag del repositorio indica formato ONNX |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | ONNX (segun el tag `onnx` del repositorio) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura, el proceso de entrenamiento, el volumen de tokens, la composicion del dataset ni el uso de tecnicas de alineacion como RLHF, DPO o SFT. La model card del autor no contiene descripcion tecnica alguna mas alla de la licencia MIT. El unico indicio estructural es el tag `onnx`, que describe el formato de exportacion y no la arquitectura subyacente.

Dado el tamano declarado en el nombre (aproximadamente 143 millones de parametros) y el tamano del repositorio (0,3 GB), es plausible que se trate de un transformer decoder-only de escala reducida con pesos en precision de 16 bits o similar, pero esto es una inferencia a partir de magnitudes, no un dato documentado. No hay informacion sobre innovaciones tecnicas (atencion lineal, decodificacion especulativa, mezcla de expertos, SSM hibrido) ni sobre el regimen de entrenamiento.

## Capacidades

- Generacion de texto: no confirmada por documentacion; la model card no describe ninguna capacidad.
- Razonamiento, codigo y matematicas: no disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales: el nombre del modelo apunta a un comportamiento relacionado con el rechazo (refusal), sin especificar si se trata de inducir rechazos, eliminarlos o clasificarlos. No hay ningun dato publicado que lo confirme.
- Ejecucion mediante ONNX Runtime: probable, dado el formato de pesos declarado en los tags.

## Casos de uso

Los siguientes escenarios son planteamientos hipoteticos condicionados a que el modelo este efectivamente entrenado para tareas de rechazo o clasificacion. No estan respaldados por documentacion del autor.

- Filtrado previo de peticiones (guardrail ligero): un modelo de ~143M parametros puede actuar como primera capa de cribado en un pipeline de moderacion, descartando peticiones antes de invocarlas contra un modelo grande, con un coste computacional de decimas de milisegundo por peticion en GPU consumer.
- Investigacion sobre comportamiento de rechazo: si el modelo incorpora una direccion de rechazo identificable, resulta util como sujeto de estudio en experimentos de ablacion y analisis de activaciones, dado su tamano manejable para inspeccion completa de capas.
- Clasificacion de texto en produccion: con 143M de parametros y formato ONNX, es candidato a tareas de clasificacion de baja latencia desplegadas en CPU o en GPUs integradas.
- Destilacion y generacion de datos sinteticos: un modelo pequeno especializado puede emplearse para etiquetar grandes volumenes de datos con un coste por ejemplo muy inferior al de un modelo frontera.
- Despliegue en el borde (edge): el peso del repositorio (0,3 GB) permite ejecucion en dispositivos con memoria limitada, como Raspberry Pi, moviles de gama alta o navegadores mediante ONNX Runtime Web.
- Docencia y prototipado rapido: util como banco de pruebas para experimentar con cuantizacion, exportacion ONNX y pipelines de inferencia sin requerir infraestructura de GPU.
- Evaluacion comparativa de robustez: si el modelo esta orientado a rechazos, puede emplearse como linea base en estudios sobre jailbreak y robustez frente a prompts adversarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del tamano declarado en el nombre del modelo (aproximadamente 143 millones de parametros) y no de mediciones publicadas.

- Peso de los pesos en memoria: aproximadamente 0,29 GB en FP16/BF16, 0,57 GB en FP32, 0,14 GB en INT8 y 0,07 GB en INT4.
- VRAM estimada para inferencia: entre 0,5 y 1 GB en FP16 incluyendo overhead del runtime y cache KV para contextos cortos; entre 1 y 2 GB en configuraciones con contexto largo o lotes mayores.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM es suficiente (GTX 1650, RTX 3050, RTX 4090, A100, H100). El modelo esta sobredimensionado para GPUs de datacenter; su uso natural es CPU o GPU de gama baja.
- Compatibilidad con GPU de consumo: si, cabe en practicamente cualquier GPU de consumo de los ultimos diez anos, asi como en GPUs integradas con memoria compartida.
- Opciones de despliegue: ONNX Runtime (formato declarado en los tags), y potencialmente transformers con PyTorch si se publican pesos en safetensors o bin, llama.cpp u Ollama si se generan ficheros GGUF (no confirmado), y servidores de inferencia como TGI o vLLM si existe una version compatible (no confirmado).
- Latencia y throughput estimados: no disponibles. Para un modelo de este tamano, en CPU moderna se espera un throughput del orden de decenas a cientos de tokens por segundo, y en GPU consumer de varios cientos a miles, pero son ordenes de magnitud orientativos, no mediciones.

## Comparativa con modelos similares

No existe informacion suficiente sobre RefusalLM2-143M (proposito, contexto, datos de entrenamiento, rendimiento) para establecer una comparativa rigurosa. La tabla siguiente recoge unicamente datos publicos de modelos de escala comparable, que pueden servir como referencia de categoria, no como comparacion funcional. Los datos de los modelos de referencia provienen de su documentacion publica y pueden variar con el tiempo.

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| RefusalLM2-143M | ~143M (segun nombre) | no disponible | MIT | no disponible |
| SmolLM2-135M | 135M | 2.048 tokens | Apache-2.0 | modelo generalista pequeno |
| Qwen2.5-0.5B | ~0,49B | 32.768 tokens | Apache-2.0 | modelo generalista pequeno |
| Pythia-160M | 160M | 2.048 tokens | Apache-2.0 | investigacion sobre interpretabilidad |

La comparacion directa no es posible porque se desconoce si RefusalLM2-143M es un modelo generativo generalista, un clasificador o un artefacto de investigacion sobre rechazos.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card no describe arquitectura, entrenamiento, datos, capacidades ni limitaciones. No es posible evaluar el modelo sin pruebas propias.
- Sesgos conocidos: no disponibles. Sin informacion sobre el corpus de entrenamiento no puede estimarse el sesgo demografico, ideologico o linguistico.
- Riesgo de alucinacion: no evaluado. En modelos de esta escala el riesgo de generacion factualmente incorrecta es estructuralmente alto, aunque no puede cuantificarse sin datos.
- Limitaciones de contexto e idioma: no disponibles. Se desconoce la ventana de contexto efectiva y los idiomas cubiertos.
- Restricciones de licencia: la licencia MIT permite uso comercial, modificacion y redistribucion con atribucion y sin garantia. Es una licencia permisiva, pero el usuario asume todo el riesgo legal y tecnico derivado de su uso.
- Procedencia: el autor es un usuario individual sin historial publico verificable en la informacion proporcionada, con cero descargas y cero interacciones. No hay indicios de validacion por terceros.
- Idoneidad para produccion: no recomendado para sistemas en produccion sin una evaluacion propia previa, dado que no existe documentacion, benchmarks ni evidencia de uso.
- Riesgo de seguridad: si el modelo se emplea como filtro de contenido o guardrail, su comportamiento no ha sido auditado; un fallo de clasificacion en esa funcion tiene consecuencias directas.
- Fecha de publicacion inusual: el repositorio figura como creado el 12 de octubre de 2026. Conviene verificar la fecha real y la integridad de los ficheros antes de cualquier uso.

## Enlaces

- HuggingFace (modelo): https://huggingface.co/h6e/RefusalLM2-143M
- HuggingFace (explorador de modelos): https://huggingface.co/models
- HuggingFace (perfil de la organizacion UnfilteredAI, sin relacion confirmada con este modelo): https://huggingface.co/UnfilteredAI
- HuggingFace (sitio principal): https://huggingface.co/
- LM Market Cap, rastreador de lanzamientos de modelos: https://lmmarketcap.com/tools/model-release-tracker
- GitHub, remove-refusals-with-transformers (implementacion de referencia sobre eliminacion de rechazos, contexto tematico, no vinculada al modelo): https://github.com/Sumandora/remove-refusals-with-transformers

No se han encontrado papers, blogs tecnicos, repositorios oficiales ni demos asociados especificamente a h6e/RefusalLM2-143M en la busqueda web realizada.
