# Mon-Deyme/DEYME-Instruct

## Resumen

DEYME-Instruct es un modelo de generacion de texto publicado en Hugging Face por el usuario Mon-Deyme bajo el identificador `Mon-Deyme/DEYME-Instruct`. Se distribuye en formato safetensors con la libreria transformers y la etiqueta `custom_code`, lo que implica que su carga requiere codigo personalizado no incluido en el repositorio estandar de transformers. El repositorio ocupa 0,4 GB y contiene 43.926.528 parametros totales, un tamano propio de un modelo pequeno orientado a experimentacion o despliegue en entornos con recursos limitados.

La model card es la plantilla autogenerada por Hugging Face y no aporta informacion sustantiva: no se documentan el desarrollador real, el tipo de modelo, los idiomas, la licencia, los datos de entrenamiento ni los resultados de evaluacion. Todos los campos aparecen como "[More Information Needed]". Esto limita severamente cualquier evaluacion rigurosa del modelo y obliga a tratar la ficha como una descripcion estructural basada en los metadatos del Hub, no en documentacion tecnica del autor.

El modelo es relevante unicamente como objeto de estudio o como base para experimentacion controlada, dado que su trazabilidad es practicamente nula. No hay evidencia publica de benchmarks, de composicion del dataset ni de proceso de alineacion. Cualquier uso en produccion deberia ir precedido de una evaluacion propia exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `custom_code`; no se especifica transformer, MoE, SSM ni hibrida) |
| Parametros totales | 43.926.528 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors; no hay GGUF en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,4 GB |
| Libreria | transformers (con `custom_code`) |
| Pipeline | text-generation |
| Fecha de creacion | 2026-11-26 |
| Fecha de actualizacion | 2026-11-26 |
| Descargas | 0 |
| Likes | 0 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna. La etiqueta `custom_code` en el Hub indica que el modelo requiere una implementacion de clase personalizada (probablemente registrada mediante `auto_map` en `config.json`) y que no puede cargarse con una clase estandar de transformers sin ese codigo. El numero de parametros, 43,9 millones, es compatible con un transformer pequeno de tipo encoder-decoder o decoder-only con pocas capas, pero no se confirma ni la familia arquitectonica ni la dimension del modelo oculto, el numero de cabezas o de capas.

Tampoco hay datos sobre el corpus de entrenamiento: no se indica el numero de tokens, la composicion del dataset, la procedencia de los datos ni si hubo fases de ajuste supervisado, RLHF o DPO. La model card no menciona innovaciones tecnicas como atencion lineal, decodificacion especulativa o modos de razonamiento extendido. Toda la seccion de entrenamiento de la model card original esta marcada como pendiente.

## Capacidades

- Generacion de texto autoregresiva: es la unica capacidad declarada explicitamente mediante el pipeline `text-generation`.
- No hay evidencia documentada de soporte de tool calling ni function calling.
- No hay evidencia documentada de capacidades de agente o razonamiento multi-paso.
- No hay evidencia documentada de capacidades multilingues; los idiomas son "no disponibles".
- No hay evidencia documentada de vision, audio, modo thinking ni otras modalidades.
- El nombre "Instruct" sugiere un ajuste para seguir instrucciones, pero no se aporta ninguna descripcion del proceso de instruccion ni ejemplos de uso.

## Casos de uso

- Experimentacion academica con arquitecturas personalizadas: el modelo puede cargarse mediante `trust_remote_code=True` para estudiar como se implementa una clase `custom_code` en transformers, inspeccionando el codigo del repositorio antes de ejecutarlo.
- Pruebas de integracion en pipelines de transformers: sirve para validar flujos de carga, tokenizacion y generacion en entornos de CI con modelos de pocos parametros y huella de disco reducida (0,4 GB).
- Prototipado rapido de interfaces de generacion de texto: al ser pequeno, permite iterar en local sobre la API de `generate()` sin depender de GPU dedicada, aunque la calidad de salida no esta garantizada.
- Evaluacion de riesgos de cadena de suministro de modelos: util como caso de estudio de modelos publicados sin model card sustantiva, sin licencia declarada y con `custom_code`, para disenar politicas de revision antes de adoptar pesos de terceros.
- Benchmarking de infraestructura de inferencia: con 43,9 M de parametros, es adecuado para medir latencias base de frameworks (transformers, vLLM si admite la arquitectura) en CPUs y GPUs de gama baja.
- Fine-tuning didactico: su tamano permite ejecutar ajuste supervisado completo en una sola GPU consumer, lo que lo hace util para cursos o talleres sobre entrenamiento de modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 176 MB solo para pesos (43,9 M x 4 bytes), mas overhead de activaciones y cache KV.
- VRAM estimada en fp16/bf16: aproximadamente 88 MB para pesos, mas overhead.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobradamente suficiente; tambien es viable en CPU.
- Cabe en GPU consumer: si, con amplio margen, incluso en GPUs de 4-6 GB.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la via documentada por las etiquetas del Hub. No se confirma compatibilidad con vLLM, llama.cpp, Ollama ni TGI, ya que no se distribuyen pesos GGUF y la arquitectura es personalizada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| DEYME-Instruct | 43,9 M | no disponible | no disponible | safetensors | Hub de Hugging Face, 0 descargas |
| Modelos de ~50 M tipo GPT-2 small | ~124 M (referencia de categoria) | 1024 tokens (tipico) | MIT (en el caso de GPT-2) | safetensors, GGUF | Ampliamente disponibles |
| Modelos instruct pequenos de ~100-500 M | variable | variable | variable | safetensors, GGUF | Multiples opciones en el Hub |

No se dispone de datos de rendimiento del modelo que permitan una comparacion cuantitativa con alternativas. La comparativa se limita a parametros, formato y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de model card sustantiva: no hay informacion sobre datos de entrenamiento, sesgos, alineacion ni evaluacion.
- Riesgo elevado de alucinacion y de salidas incoherentes, dado que no se documenta el proceso de instruccion pese al nombre "Instruct".
- Licencia no declarada: no se puede asumir permiso para uso comercial; la ausencia de licencia implica, por defecto, reserva de derechos en muchas jurisdicciones.
- Uso de `custom_code`: requiere `trust_remote_code=True`, lo que ejecuta codigo arbitrario del autor del repositorio; debe auditarse antes de cargar el modelo.
- Idiomas no declarados: no hay garantia de soporte de castellano ni de ningun otro idioma concreto.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo.
- Cero descargas y cero likes en el momento de la consulta: sin validacion por parte de la comunidad.
- Fecha de creacion futura respecto a la mayoria de referencias del ecosistema (2026-11-26), lo que conviene verificar antes de integrarlo en cualquier flujo.

## Enlaces

- Hugging Face: https://huggingface.co/Mon-Deyme/DEYME-Instruct
- Paper de referencia citado en la model card (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact
