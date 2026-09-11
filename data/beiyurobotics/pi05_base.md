# beiyurobotics/pi05_base

## Resumen

pi05_base es un checkpoint de parámetros (no un modelo con pesos convertidos a formato estándar) publicado por el usuario beiyurobotics bajo el identificador `beiyurobotics/pi05_base`. Corresponde a la variante "base" de la familia pi05 del proyecto OpenPI, una política de tipo vision-language-action (VLA) orientada a la predicción de acciones de robot condicionadas por imagen y lenguaje. El repositorio contiene únicamente los parámetros serializados en formato nativo Orbax/JAX PyTree, con 51 arrays de parámetros y aproximadamente 3.350 millones de parámetros, ocupando 12,4 GB de almacenamiento.

El modelo combina un codificador de imagen PaliGemma, un modelo de lenguaje PaliGemma, proyecciones de entrada y salida de acciones y una MLP de condicionamiento temporal. Es, por tanto, un modelo de robótica y no un modelo de lenguaje conversacional: su salida son acciones motoras, no texto generado de forma autónoma, aunque herede capacidad de comprensión de instrucciones en inglés del backbone PaliGemma.

Su relevancia actual es la de servir como punto de partida para investigación y ajuste fino por robot dentro del ecosistema OpenPI. El propio autor indica que se trata de un checkpoint base preentrenado, sin resultados de evaluación independientes ni conversión al formato Transformers, y sin licencia especificada en los metadatos locales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en PaliGemma: codificador de imagen + modelo de lenguaje, con proyecciones de entrada/salida de acciones y MLP de condicionamiento temporal |
| Parametros totales | Aproximadamente 3.350 millones (51 arrays de parametros) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible: no se publican variantes cuantizadas; el checkpoint se distribuye en la precision esperada por la version correspondiente de OpenPI (los metadatos no exponen `torch_dtype`) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | No especificada en los metadatos del checkpoint; el autor indica que debe anadirse la licencia exigida por la distribucion original de OpenPI/pi05 |
| Formato de pesos | Orbax PyTree / OCDBT (JAX/Flax); no es safetensors, no es GGUF y no se carga con `AutoModel` |
| Tamano del repositorio | 12,4 GB |
| Biblioteca | openpi |
| Pipeline declarado | robotics |
| Variante | base (preentrenada, sin ajuste fino documentado) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion declarada | 2026-09-11 |

## Arquitectura y entrenamiento

La arquitectura es una política VLA que reutiliza componentes de PaliGemma. El arbol de parametros incluye explicitamente: parametros del codificador de imagen PaliGemma, parametros del modelo de lenguaje PaliGemma, proyecciones de entrada y salida de acciones y parametros de una MLP de condicionamiento temporal. La presencia de esta MLP de condicionamiento temporal apunta a una cabeza de acciones de tipo generativo condicionada por un parametro de tiempo continuo, un esquema habitual en politicas de imitacion modernas basadas en flow matching o difusion; esta interpretacion es una inferencia a partir de la lista de componentes y no una afirmacion documentada en la model card.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, la mezcla de datos de robot ni si hubo etapas de RLHF, DPO u optimizacion por preferencias. La model card indica de forma explicita que el checkpoint no documenta ajuste fino ni resultados de benchmark. El unico dato de entrenamiento disponible es su caracter de checkpoint base preentrenado dentro de la familia pi05 de OpenPI.

El checkpoint esta serializado con Orbax en un PyTree de JAX, con estructura `params/` que contiene `_CHECKPOINT_METADATA`, `_METADATA`, `_sharding`, `array_metadatas/`, `d/`, `ocdbt.process_0/`, `manifest.ocdbt` y `commit_success.txt`. El entorno compatible requiere JAX, Flax, Orbax Checkpoint y el paquete OpenPI. No se incluye codigo fuente de OpenPI, tokenizador, driver de robot, calibracion ni configuracion de despliegue.

## Capacidades

- Prediccion de acciones de robot condicionada por observacion visual e instruccion en lenguaje natural (vision-language-action).
- Comprension de instrucciones en ingles heredada del backbone de lenguaje PaliGemma.
- Codificacion de imagenes mediante el codificador visual de PaliGemma.
- Condicionamiento temporal explicito de la generacion de acciones mediante una MLP dedicada.
- Uso como politica base para ajuste fino especifico por robot o por tarea.
- Inferencia dentro del ecosistema OpenPI con estadisticas de normalizacion y assets propios de cada robot.
- No hay evidencia en la informacion disponible de soporte de tool calling, function calling, agentes multi-paso, modo de razonamiento explicito, vision generativa, audio ni salida de texto libre como capacidad principal.
- Capacidades multilingues: solo ingles declarado.

## Casos de uso

- Investigacion en politicas VLA: usar el checkpoint como linea base reproducible en experimentos de manipulacion dentro de OpenPI, comparando variantes de preprocesado, prompts o frecuencias de control sobre la misma arquitectura.
- Ajuste fino por robot concreto: partir de los parametros base y entrenar con demostraciones teleoperadas del robot objetivo, aprovechando que el repositorio esta pensado explicitamente como punto de partida para fine-tuning downstream.
- Evaluacion en simulacion: conectar la politica a un simulador antes de tocar hardware, ya que el autor advierte de que el modelo no esta certificado para operacion real sin salvaguardas.
- Generacion de datos sinteticos de acciones: emplear las predicciones de la politica para preetiquetar trayectorias que despues se revisan y filtran antes de incorporarlas a un dataset de entrenamiento.
- Estudio de sensibilidad al prompt y a la calibracion: analizar como varian las distribuciones de acciones ante cambios de instruccion en ingles, calibracion de camara y frecuencia de control, uno de los caveats senalados por el autor.
- Desarrollo de infraestructura de despliegue: integrar la carga del PyTree Orbax y el pipeline de preprocesado en tooling propio de robotica, dado que el checkpoint no se puede cargar con `AutoModel` ni con `safetensors`.
- Validacion de estadisticas de normalizacion: probar distintos conjuntos de assets por efector final y verificar que no se mezclan estadisticas entre morfologias de robot, tal como advierte la model card.
- Base para conversiones de formato: utilizar los parametros como origen de una conversion a PyTorch u otro runtime, teniendo en cuenta que dicha conversion no esta incluida ni documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica expresamente que no se incluyen resultados de evaluacion independientes y que no hay ajuste fino ni metricas documentadas para este repositorio.

## Requisitos de hardware

- VRAM estimada para los pesos en solitario: aproximadamente 6,7 GB en bf16/fp16 (3,35 mil millones de parametros x 2 bytes) y aproximadamente 13,4 GB en fp32 (x 4 bytes). El checkpoint ocupa 12,4 GB, coherente con una mezcla de precisiones o con metadatos y estructuras adicionales de Orbax.
- A esas cifras hay que sumar memoria de activaciones, cache de compilacion XLA y buffers del runtime JAX, por lo que el consumo real sera superior al de los pesos.
- GPU compatibles: cualquier GPU con soporte CUDA suficiente para JAX; una RTX 4090 (24 GB) deberia poder alojar los pesos en bf16 anadiendo margen para activaciones, aunque no hay datos publicados de consumo real ni de rendimiento.
- Para entrenamiento o ajuste fino se recomienda hardware de mayor capacidad (A100 40/80 GB, H100), ya que hay que contabilizar gradientes, estados del optimizador y activaciones.
- Encaje en GPU de consumo: probable en bf16 en GPUs de 16 GB o superiores segun el margen de activaciones; no confirmado por el autor.
- Opciones de despliegue: el unico camino documentado es el ecosistema OpenPI con JAX, Flax y Orbax Checkpoint. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, dado que no es un checkpoint Transformers ni GGUF. Cualquier uso en esos runtimes exigiria una conversion previa no incluida.
- Latencia y throughput: no disponibles. En robotica, el factor determinante suele ser la frecuencia de control alcanzable end-to-end (percepcion, inferencia y actuacion), no el throughput de tokens.

## Comparativa con modelos similares

Los datos de las alternativas no estan verificados en la informacion proporcionada para esta ficha; se marcan como no disponibles los campos que no se pueden confirmar.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| beiyurobotics/pi05_base | ~3,35 mil millones | No disponible | No especificada | Checkpoint Orbax en Hugging Face, 0 descargas |
| Familia pi05 / OpenPI (variantes upstream) | No disponible | No disponible | La de la distribucion original de OpenPI/pi05, no indicada aqui | No disponible en esta informacion |
| Otras politicas VLA de la misma categoria (por ejemplo OpenVLA y similares) | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos comparativos de rendimiento entre pi05_base y alternativas, porque el repositorio no publica evaluaciones.

## Limitaciones y advertencias

- Licencia no especificada: los metadatos locales no indican licencia y el autor advierte de que la model card no concede derechos adicionales. No usar en produccion comercial sin aclarar antes la licencia de la distribucion original de OpenPI/pi05.
- Ausencia total de evaluacion: no hay benchmarks, metricas ni validacion independiente publicados para este checkpoint.
- Riesgo de alucinacion en el sentido de acciones incorrectas o no seguras: al ser una politica motora, los errores se traducen en movimientos fisicos, no en texto erroneo. El autor no certifica el modelo para operacion real sin supervisio ni para uso desatendido.
- Sensibilidad alta a factores externos: calibracion de camara, formulacion del prompt, estadisticas de normalizacion, frecuencia de control y morfologia del robot pueden alterar sustancialmente los resultados.
- Riesgo de mezclar estadisticas de normalizacion entre robots distintos sin validar la distribucion de acciones resultante.
- Checkpoint incompleto por si solo: no incluye codigo OpenPI, tokenizador, driver de robot, calibracion ni configuracion de despliegue.
- No convertible directamente: no hay conversion a formato Transformers ni a safetensors, por lo que no funciona con `AutoModel` ni con los runners habituales sin un paso de conversion no documentado.
- Idioma: solo ingles declarado; no hay evidencia de soporte multilingue.
- Repositorio sin traccion: 0 descargas y 0 likes, sin historial de uso que permita inferir fiabilidad.
- La cita canonica de OpenPI/pi05 queda como marcador de posicion en la model card, lo que dificulta trazar la procedencia exacta de los pesos.
- La fecha de creacion declarada (2026-09-11) es la que figura en los metadatos; no se ha verificado de forma independiente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/beiyurobotics/pi05_base
- Repositorio del proyecto OpenPI (referenciado de forma generica en la model card como "OpenPI project repository"; no se incluye URL concreta en la informacion proporcionada)
- Publicacion o informe tecnico original de pi05: no disponible; la model card deja la cita BibTeX como `TODO`
- Assets especificos de robot: no disponibles en este repositorio
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante para este modelo. Los resultados devueltos corresponden a farmacologia veterinaria (Ronidazol y tritrichomonosis felina) y no guardan relacion con pi05_base, con OpenPI ni con robotica.
