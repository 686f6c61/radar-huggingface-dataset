# BluBridgeAI/BLU-135M

## Resumen

BLU-135M es un modelo de lenguaje de tipo base, desarrollado por BluBridgeAI, con 135 millones de parametros y orientado a generacion de texto en ingles. Se distribuye a traves de HuggingFace bajo la libreria transformers y en formato safetensors, con un tamano de repositorio de 1,6 GB. Su identificador incluye las etiquetas "small-language-model" y "base-model", lo que indica que no ha pasado por un proceso de ajuste fino supervisado ni de alineacion con preferencias humanas, sino que se trata de un modelo preentrenado para continuar texto.

El modelo se publica bajo licencia Apache 2.0, lo que permite uso comercial y modificacion sin restricciones adicionales, y declara soporte unicamente para ingles. El acceso es restringido (gated), por lo que es necesario aceptar las condiciones en la pagina de HuggingFace antes de descargar los pesos. No se han publicado datos sobre arquitectura interna, composicion del dataset de entrenamiento, longitud de contexto ni resultados de benchmarks en la informacion disponible.

La relevancia de este modelo radica en su tamano reducido, que lo hace candidato para despliegues en entornos con recursos limitados, prototipado rapido y experimentacion con modelos base de baja huella computacional. Sin embargo, la ausencia de documentacion tecnica detallada y de evaluaciones publicadas limita seriamente su adopcion en produccion sin una validacion previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como transformer en HuggingFace) |
| Parametros totales | 135 millones (135M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado informacion detallada sobre la arquitectura interna del modelo mas alla de su integracion en la libreria transformers y su etiqueta generica de "base-model". No se especifica si emplea atencion multi-cabeza estandar, variantes como grouped-query attention, ni si incorpora innovaciones como attention lineal o decodificacion especulativa. Tampoco se indica el numero de capas, dimensiones ocultas ni el vocabulario utilizado.

Respecto al entrenamiento, no hay datos disponibles sobre el numero de tokens procesados, la composicion del dataset, la presencia de fases de RLHF o DPO, ni el uso de datos multilingues. La unica informacion disponible es que se trata de un modelo base sin ajuste instructivo, entrenado presumiblemente sobre texto en ingles, y que su publicacion se realizo en noviembre de 2026 segun los metadatos de HuggingFace.

## Capacidades

- Generacion de texto autoregresiva: al ser un modelo base, su funcion principal es la continuacion de texto y la modelizacion del lenguaje, sin instrucciones especificas.
- Razonamiento y conocimiento general: capacidad limitada por su tamano de 135M parametros, orientada a tareas simples de lenguaje.
- Codigo y matematicas: no se han documentado capacidades especificas ni evaluaciones en estas areas.
- Tool calling / function calling: no disponible; no se menciona soporte en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma declarada.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Prototipado rapido de pipelines de generacion de texto: el modelo puede integrarse en entornos de desarrollo con recursos limitados para validar arquitecturas de aplicaciones antes de escalar a modelos mayores, gracias a su tamano de 135M parametros y su formato safetensors compatible con transformers.
- Experimentacion academica con modelos base de baja huella: investigadores pueden utilizarlo como linea base en estudios sobre dinamicas de entrenamiento, tokenizacion o comportamiento de modelos pequenos, al ser un modelo base sin alineacion.
- Generacion de texto en entornos con restricciones de memoria: su reducido tamano permite ejecucion en CPU o GPUs de gama baja, lo que lo hace adecuado para demos locales y entornos embebidos donde no es viable un modelo de mayor escala.
- Filtrado y clasificacion de texto simple: mediante ajuste fino sobre tareas especificas (clasificacion de sentimiento, deteccion de spam), el modelo puede servir como base para tareas discriminativas de baja complejidad.
- Completado de texto en herramientas de escritura: integracion en editores o asistentes de redaccion en ingles para sugerencias de continuacion, siempre que se valide la calidad de las salidas.
- Educacion y divulgacion: uso como ejemplo didactico para explicar el funcionamiento de modelos de lenguaje base, la tokenizacion y la generacion autoregresiva en cursos y talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB en fp32 (135M parametros x 4 bytes), unos 0,3 GB en fp16 y alrededor de 0,15 GB en cuantizacion de 8 bits, sin contar overhead de activaciones ni cache KV.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o incluso una GTX 1650 pueden ejecutar el modelo sin problemas. Tambien es viable en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU con un rendimiento aceptable para generacion de texto corto.
- Opciones de despliegue: transformers (libreria nativa), y potencialmente llama.cpp u Ollama si se generan conversiones a GGUF, aunque no se documenta soporte oficial. vLLM y TGI son compatibles en teoria con modelos transformers, pero no se ha validado su funcionamiento con este modelo concreto.
- Latencia y throughput estimados: no disponibles; dependeran del hardware y de la implementacion, pero por el tamano del modelo se espera una latencia baja en GPU y moderada en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| BLU-135M | 135M | no disponible | Apache 2.0 | HuggingFace (gated) |
| GPT-2 small | 124M | 1024 tokens | MIT | HuggingFace (abierto) |
| SmolLM-135M | 135M | 2048 tokens (segun documentacion publica) | Apache 2.0 | HuggingFace (abierto) |
| Pythia-160M | 160M | 2048 tokens | Apache 2.0 | HuggingFace (abierto) |

La comparativa se limita a parametros, contexto y licencia, ya que no se dispone de resultados de benchmarks de BLU-135M. Frente a GPT-2 small, SmolLM-135M y Pythia-160M, el modelo de BluBridgeAI comparte el rango de tamano pero carece de documentacion publica sobre contexto y rendimiento, lo que dificulta una evaluacion objetiva. Ademas, su acceso restringido supone una barrera adicional frente a alternativas de descarga abierta.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un modelo base entrenado presumiblemente con datos web en ingles, es probable que herede sesgos de genero, raza y cultura presentes en el corpus, pero no se ha publicado ningun analisis al respecto.
- Riesgo de alucinacion: elevado en un modelo base de 135M parametros sin alineacion; puede generar texto plausible pero factualmente incorrecto, especialmente en tareas de conocimiento.
- Limitaciones de contexto e idioma: solo se declara soporte para ingles; no se especifica la longitud de contexto, lo que impide planificar su uso en tareas que requieran ventanas largas.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero el acceso gated exige aceptar condiciones en HuggingFace, lo que puede anadir friccion en despliegues automatizados.
- Caveats para produccion: la ausencia de benchmarks, de documentacion de arquitectura y de guias de uso hace desaconsejable su adopcion en produccion sin una evaluacion interna exhaustiva. La falta de soporte documentado para tool calling o agentes limita su aplicacion en flujos complejos.
- Fecha de creacion: el modelo figura creado en noviembre de 2026, lo que sugiere una publicacion muy reciente y, por tanto, sin validacion por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/BluBridgeAI/BLU-135M
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la informacion proporcionada.
