# Fukoooo/gemma-3-27b-it-seft

## Resumen

Fukoooo/gemma-3-27b-it-seft es una variante del modelo google/gemma-3-27b-it publicada por el usuario Fukoooo en HuggingFace. No se trata de un ajuste fino convencional, sino de una derivacion del modelo YanLabs/gemma-3-27b-it-abliterated-normpreserve, al que se le ha aplicado un grado menor de "abliteracion" con el objetivo declarado de conservar mejor las capacidades originales de Gemma 3 27B Instruct. El modelo es, por tanto, un transformer causal denso de 27.432.406.640 parametros, distribuido en safetensors y con un tamano de repositorio de 54,9 GB.

La relevancia de esta ficha reside en su naturaleza experimental: la abliteracion es una tecnica de interpretabilidad mecanistica que elimina quirurgicamente las "direcciones de rechazo" en el espacio de activaciones del modelo, sin recurrir a fine-tuning. El autor advierte explicitamente de que los guardarrailes de seguridad han sido eliminados y de que el modelo esta pensado unicamente para investigacion en interpretabilidad mecanistica, quedando fuera de alcance los despliegues en produccion y cualquier aplicacion de cara al usuario.

Se trata ademas de una publicacion con muy poca traccion en la plataforma (0 descargas, 0 likes en el momento de la consulta), lo que unido a la ausencia de resultados de benchmarks y de documentacion sobre contexto o idiomas, obliga a tratar cualquier evaluacion de rendimiento como pendiente de verificacion empirica por parte de quien lo utilice.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (modelo de lenguaje causal), segun la model card |
| Parametros totales | 27.432.406.640 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Se mencionan F16 y Q8_0; el autor recomienda exclusivamente Q8_0 (por debajo de Q8_0 persisten los rechazos) |
| Idiomas soportados | No disponible |
| Licencia | Gemma Terms of Use (etiqueta "gemma" en HuggingFace) |
| Formato de pesos | safetensors (repo principal); el autor referencia cuantizaciones tipo GGUF (F16, Q8_0) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-3-27b-it, un transformer causal denso, y hereda su arquitectura sin modificaciones estructurales. Lo que cambia no es el grafo de la red ni el dataset de entrenamiento, sino los pesos: se aplica la tecnica de "abliterated norm-preserving biprojected" descrita por el autor en el blog de HuggingFace enlazado en la model card, implementada con la herramienta jim-plus/llm-abliteration. Esta tecnica identifica direcciones de activacion asociadas al comportamiento de rechazo y las proyecta fuera de la matriz de pesos (biprojeccion), preservando la norma de los pesos para minimizar el dano colateral en las capacidades del modelo. No hay, por tanto, un pipeline de RLHF, DPO ni SFT adicional descrito en la informacion disponible.

Respecto al proceso de entrenamiento original de Gemma 3 27B (numero de tokens, composicion del dataset, fases de alineacion), la informacion proporcionada no lo detalla: se remite implicitamente al modelo base de Google. La innovacion diferencial de esta publicacion es doble: por un lado, el uso de la variante norm-preserving de la abliteracion; por otro, el ajuste del grado de abliteracion para que sea "menos agresivo" que en YanLabs/gemma-3-27b-it-abliterated-normpreserve, con el fin de conservar capacidades. El propio autor reconoce que ese equilibrio es sensible a la cuantizacion: con Q8_0 y F16 el modelo deja de rechazar, mientras que en cuantizaciones inferiores los rechazos reaparecen.

## Capacidades

- Generacion de texto conversacional: la etiqueta del repositorio incluye "conversational" y "text-generation", por lo que el modelo conserva la interfaz de instrucciones del Gemma 3 27B Instruct original.
- Razonamiento general y conocimiento factual: capacidades heredadas del modelo base, no documentadas de forma especifica en la ficha del autor.
- Generacion de codigo: capacidad inherente al modelo base, sin benchmark publicado en la informacion disponible.
- Supresion del comportamiento de rechazo: es la capacidad diferencial del modelo; con Q8_0 y F16 el autor afirma que el modelo no rechaza peticiones.
- Multilingue: no disponible (la ficha no documenta idiomas).
- Vision: no disponible (no se menciona soporte multimodal en la informacion proporcionada, pese a que Gemma 3 27B incorpora capacidades multimodales en su version oficial).
- Tool calling / function calling: no disponible (no se documenta en la ficha).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta).
- Modo de pensamiento explicito: no disponible (no se documenta).

## Casos de uso

- Investigacion en interpretabilidad mecanistica: el caso de uso declarado por el autor. Permite estudiar como se representan las direcciones de rechazo en el espacio de activaciones de un modelo de 27B y comparar el comportamiento antes y despues de la abliteracion.
- Analisis comparativo de tecnicas de abliteracion: al ser una variante "menos abliterada" de YanLabs/gemma-3-27b-it-abliterated-normpreserve, sirve para medir el impacto del grado de intervencion sobre las capacidades del modelo base.
- Red-teaming y evaluacion de seguridad: al carecer de guardarrailes, es util como sujeto de prueba para medir la eficacia de clasificadores de contenido, filtros de salida y sistemas de moderacion, en un entorno controlado.
- Generacion de datos adversarios para entrenar moderadores: permite producir ejemplos de completaciones no filtradas que alimenten el entrenamiento de clasificadores de seguridad, siempre en un pipeline de investigacion aislado.
- Auditoria de mecanismos de rechazo en LLM: comparar las respuestas del modelo con las de google/gemma-3-27b-it ante el mismo prompt permite aislar que se pierde y que se conserva tras la intervencion.
- Estudio de estabilidad bajo cuantizacion: el hallazgo del autor (los rechazos reaparecen por debajo de Q8_0) es en si mismo un objeto de estudio sobre como la cuantizacion reintroduce comportamientos suprimidos en el espacio de pesos.
- Base para experimentos controlados de alineacion: util como linea base "sin alineacion" frente a la que comparar tecnicas de alineacion, siempre fuera de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en F16/BF16: aproximadamente 54,9 GB solo para pesos, en linea con el tamano del repositorio (54,9 GB). Requiere anadir memoria para cache KV y activaciones.
- VRAM estimada en Q8_0: aproximadamente 29 GB para pesos; es el nivel de cuantizacion recomendado por el autor.
- VRAM estimada en Q4_K_M: aproximadamente 16-17 GB para pesos, mas cache KV. No recomendado segun el autor, porque los rechazos reaparecen.
- GPU recomendadas para F16: A100 80 GB, H100 80 GB o configuraciones multi-GPU (por ejemplo, 2x A6000 48 GB no bastan en una sola tarjeta; se necesita agregar memoria entre GPU).
- GPU recomendadas para Q8_0: A100 40 GB, L40S 48 GB o 2x RTX 4090 24 GB.
- GPU de consumo: en Q4 una RTX 4090 o RTX 3090 de 24 GB puede alojarlo, pero con la advertencia de que en ese regimen el modelo vuelve a rechazar. En Q8_0 no cabe en una unica GPU de consumo de 24 GB.
- Opciones de despliegue: transformers, vLLM, TGI y llama.cpp u Ollama mediante conversion a GGUF. No se documentan recetas de despliegue en la ficha del autor.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Abliterado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Fukoooo/gemma-3-27b-it-seft | 27.432.406.640 | No disponible | Si, grado reducido | Gemma Terms of Use | HuggingFace (0 descargas, 0 likes) |
| YanLabs/gemma-3-27b-it-abliterated-normpreserve | No disponible | No disponible | Si, grado mayor | Gemma Terms of Use | HuggingFace |
| google/gemma-3-27b-it | No disponible en esta busqueda | No disponible | No | Gemma Terms of Use | HuggingFace (modelo base oficial) |

La diferencia principal entre los tres es el grado de intervencion sobre las direcciones de rechazo: el modelo base conserva los guardarrailes, la variante de YanLabs los elimina de forma mas agresiva y esta publicacion busca un punto intermedio. No hay datos de rendimiento publicados para ninguno de ellos en la informacion disponible, por lo que la comparacion cuantitativa queda pendiente.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No se documenta ninguna evaluacion de sesgo para esta variante ni se hereda del modelo base en la ficha.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; se asume el comportamiento del modelo base de 27B, sin garantia.
- Contenido danino: el autor advierte explicitamente de que los guardarrailes y mecanismos de rechazo han sido eliminados y de que el modelo puede generar contenido nocivo.
- Comportamiento impredecible: la propia ficha senala que el comportamiento puede ser erratico en casos limite.
- Abliteracion incompleta: el autor reconoce que la tecnica no garantiza la eliminacion total de todos los rechazos.
- Dependencia de la cuantizacion: por debajo de Q8_0 los rechazos reaparecen, lo que limita el uso practico a F16 o Q8_0 y encarece el despliegue.
- Fuera de alcance: el autor excluye explicitamente el uso en produccion, en aplicaciones de cara al usuario y la generacion de contenido danino con fines maliciosos.
- Licencia: Gemma Terms of Use, con las restricciones de uso comercial y de redistribucion que impone Google. Es imprescindible revisarlas antes de cualquier uso, incluso de investigacion comercial.
- Documentacion incompleta: no hay datos de contexto, idiomas, benchmarks, tool calling ni latencia.
- Traccion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de la comunidad.
- Fecha de creacion atipica: la ficha del repositorio indica 2026-09-24, dato que conviene verificar directamente en HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Fukoooo/gemma-3-27b-it-seft
- Modelo base: https://huggingface.co/google/gemma-3-27b-it
- Modelo del que deriva: https://huggingface.co/YanLabs/gemma-3-27b-it-abliterated-normpreserve
- Modelo referenciado en la cita: https://huggingface.co/YanLabs/gemma-3-27b-it-abliterated-normpreserve-v1
- Herramienta de abliteracion: https://github.com/jim-plus/llm-abliteration
- Paper / blog de la tecnica: https://huggingface.co/blog/grimjim/norm-preserving-biprojected-abliteration
