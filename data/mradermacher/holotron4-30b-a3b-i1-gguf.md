# mradermacher/Holotron4-30B-A3B-i1-GGUF

## Resumen

Esta ficha describe la cuantización **mradermacher/Holotron4-30B-A3B-i1-GGUF**, publicada por el usuario mradermacher (equipo mradermacher) a partir del modelo base **Hcompany/Holotron4-30B-A3B**, desarrollado por Hcompany. No se trata por tanto de un modelo entrenado desde cero, sino de una conversión a formato GGUF con cuantizaciones de tipo i1 (generadas con matriz de importancia, imatrix) del modelo original, pensada para su ejecución en `llama.cpp` y herramientas compatibles fuera de infraestructura de centro de datos.

El modelo base se presenta con etiquetas que lo sitúan en el ámbito de los **agentes de uso de ordenador** (computer-use), con capacidades multimodales y orientado a tareas de agente conversacional. El recuento real de parámetros del repositorio base es de 31.577.940.288 (~31,6 mil millones), y la nomenclatura "30B-A3B" del nombre sugiere una arquitectura de mezcla de expertos con aproximadamente 3 mil millones de parámetros activos, aunque este extremo no se confirma en la información disponible. El idioma declarado es únicamente inglés.

Su relevancia actual es doble: por un lado, permite ejecutar en hardware local un modelo multimodal de ~31,6 B orientado a agentes; por otro, la licencia del modelo base es la **NVIDIA Open Model Agreement**, lo que condiciona su uso comercial. El repositorio ocupa 95,8 GB e incluye cuantizaciones desde 18,0 GB (Q2_K, IQ3_XXS) hasta formatos de mayor precisión, además del fichero imatrix para generar cuantizaciones propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el sufijo A3B del nombre sugiere mezcla de expertos; sin confirmar en la informacion disponible) |
| Parametros totales | 31.577.940.288 (~31,6 B), dato real de safetensors del modelo base |
| Parametros activos | no disponible (la nomenclatura A3B sugiere ~3 B; sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF i1 con imatrix: IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K, Q2_K_S, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, small-IQ4_NL, IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | en (ingles) |
| Licencia | nvidia-open-model-agreement (NVIDIA Open Model Agreement) |
| Formato de pesos | GGUF (cuantizaciones i1); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Hcompany/Holotron4-30B-A3B en los datos proporcionados: no se detalla si se trata de un transformer denso, un transformer con mezcla de expertos, un modelo hibrido ni si incorpora atencion lineal u otras variantes. El unico indicio es la nomenclatura "30B-A3B" del nombre, que en la convencion habitual del ecosistema indica un modelo de mezcla de expertos con aproximadamente 3 mil millones de parametros activos por token sobre un total de unos 30 mil millones. Esta interpretacion no esta confirmada por la documentacion disponible y debe tratarse como hipotesis.

Tampoco hay datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF, DPO u otras tecnicas de alineamiento, ni sobre innovaciones tecnicas concretas (decodificacion especulativa, atencion lineal, etc.). Lo unico documentado por el autor de la cuantizacion es el proceso de conversion: se ha partido del modelo en formato HuggingFace (`convert_type: hf`), con `quantize_version: 2` y `output_tensor_quantised: 1`, y se han generado cuantizaciones ponderadas mediante matriz de importancia (imatrix) para reducir la perdida de calidad respecto a las cuantizaciones estaticas. El repositorio incluye el fichero imatrix (`Holotron4-30B-A3B.imatrix.gguf`, 0,2 GB) para que terceros puedan generar sus propias cuantizaciones.

Cabe senalar que las etiquetas del modelo declaran que la cuantizacion **no incluye el proyector multimodal** (`skip_mmproj` esta vacio, es decir, no se ha omitido explicitamente, pero la tabla de ficheros proporcionados solo lista ficheros GGUF de lenguaje; no se documenta un fichero `mmproj` independiente). Conviene verificar la disponibilidad real del proyector de vision antes de planificar un despliegue multimodal.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de chat compatible con `transformers` y con el ecosistema GGUF.
- Capacidades multimodales declaradas en las etiquetas del modelo (`multimodal`), orientadas a la interpretacion de entradas visuales; la disponibilidad efectiva del proyector multimodal en esta cuantizacion debe verificarse.
- Uso de ordenador (`computer-use`): el modelo esta etiquetado explicitamente para este dominio, lo que apunta a interaccion con interfaces graficas, navegacion y control de aplicaciones.
- Comportamiento de agente (`agent`): orientado a flujos multi-paso con planificacion y ejecucion de acciones.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo `language` de la model card.
- Modo de razonamiento explicito (thinking mode), vision detallada, audio u otras capacidades especiales: no disponible.
- Integracion con `transformers` como libreria declarada, ademas del formato GGUF para inferencia local.

## Casos de uso

- Automatizacion de tareas de escritorio (RPA inteligente): el modelo, etiquetado como `computer-use`, puede interpretar el estado de una interfaz y proponer la siguiente accion (clic, escritura, navegacion) en flujos de automatizacion de back office, con la ventaja de ejecutarse en formato GGUF sobre hardware propio.
- Agentes de navegacion web: extraccion y cumplimentacion de formularios, seguimiento de flujos multi-paso y verificacion de resultados, aprovechando la orientacion a agentes del modelo base.
- Asistente de soporte tecnico de primer nivel: conversaciones multi-turno en ingles sobre incidencias de producto, con la salvedad de que la longitud de contexto no esta documentada y debe medirse en la practica.
- Prototipado de agentes en local sin dependencia de API: al distribuirse en GGUF y ocupar entre 18 y 22 GB en sus cuantizaciones mas habituales, permite iterar sobre prompts y flujos de agente en una estacion de trabajo con GPU de gama alta.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye 24 variantes de cuantizacion mas el fichero imatrix, lo que lo convierte en un banco de pruebas util para medir el impacto de la cuantizacion en tareas de agente y vision.
- Generacion de cuantizaciones propias: el fichero `.imatrix.gguf` incluido permite a un equipo generar cuantizaciones a medida con sus propios datos de calibracion, ajustando el equilibrio entre tamanio y calidad.
- Investigacion sobre agentes multimodales: como version cuantizada de un modelo de ~31,6 B con etiquetas de vision y computer-use, sirve para estudiar degradacion de capacidades multimodales bajo cuantizacion agresiva (Q2, IQ2, IQ3).
- Despliegue en entornos con requisitos de confidencialidad: al ejecutarse de forma local, evita enviar capturas de pantalla o datos de aplicaciones internas a servicios externos, siempre que la licencia NVIDIA lo permita para el caso de uso concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card del repositorio de cuantizacion no incluye tablas de MMLU, HumanEval, GSM8K ni de evaluaciones especificas de agentes o computer-use, ni para el modelo base ni para las cuantizaciones. Tampoco se aportan mediciones de perplejidad por tipo de cuantizacion: la unica referencia es un grafico externo enlazado por el autor (comparativa de perplejidad entre tipos de cuantizacion de baja calidad, alojado en nethype.de) y un analisis de terceros sobre el tema. No se deben extrapolar cifras de rendimiento a partir del nombre del modelo.

## Requisitos de hardware

- VRAM estimada a partir del tamanio de los ficheros publicados, mas overhead de cache KV (no cuantificable sin conocer la longitud de contexto):
  - i1-Q2_K: 18,0 GB de pesos.
  - i1-IQ3_XXS: 18,0 GB de pesos.
  - i1-IQ3_M: 18,2 GB de pesos.
  - i1-Q3_K_M: 19,9 GB de pesos.
  - i1-Q4_K_S: 22,0 GB de pesos (el autor lo senala como "optimal size/speed/quality").
  - Otras cuantizaciones (Q4_K_M, Q5_K_M, Q6_K, IQ4_XS, etc.) estan listadas pero sin tamanio en la informacion disponible; el repositorio completo ocupa 95,8 GB.
- GPU recomendadas: ninguna especificada por el autor. Como referencia de capacidad de memoria: las cuantizaciones de 18-20 GB encajan en GPU de 24 GB (RTX 3090, RTX 4090, A10G 24 GB) dejando poco margen para cache KV; la cuantizacion Q4_K_S de 22,0 GB requiere GPU de 32 GB o superior (RTX 5090, V100 32 GB, A100 40 GB, H100) para operar con comodidad.
- Cabe en GPU de consumo: si, en modelos de 24 GB o mas con las cuantizaciones de 18-20 GB y contexto corto; en 16 GB no cabe ninguna de las variantes publicadas con tamanio conocido.
- Opciones de despliegue: `llama.cpp` y sus derivados (Ollama, LM Studio, kobold.cpp, servidores compatibles con la API de OpenAI). La libreria declarada en el repositorio es `transformers`, por lo que el modelo base tambien puede cargarse en `vLLM` o TGI si se dispone del modelo sin cuantizar en safetensors; no se documenta soporte de las cuantizaciones GGUF en esos servidores.
- Latencia y throughput: no disponible. No se han publicado mediciones. Si se confirma una arquitectura de mezcla de expertos con ~3 B de parametros activos, el coste computacional por token seria sustancialmente menor que el de un modelo denso de 31,6 B, pero el ancho de banda de memoria necesario para cargar todos los pesos sigue siendo el de un modelo de ~31,6 B, por lo que el factor limitante en GPU de consumo sera la VRAM y no el calculo.

## Comparativa con modelos similares

La informacion disponible sobre el modelo base es muy limitada, por lo que la comparacion se realiza con el referente mas directo por nomenclatura y categoria (modelo de mezcla de expertos de ~30 B con ~3 B activos), segun los datos publicos de su model card. Los datos de los comparadores pueden variar y deben verificarse en sus repositorios.

| Modelo | Parametros totales | Parametros activos | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|---|
| Holotron4-30B-A3B (esta ficha) | ~31,6 B | no disponible (~3 B por nomenclatura) | no disponible | si (etiqueta multimodal) | nvidia-open-model-agreement | safetensors, GGUF i1 |
| Qwen3-30B-A3B | ~30,5 B | ~3,3 B | 32.768 tokens nativos, ampliable con YaRN | no (variante de texto) | Apache-2.0 | safetensors, GGUF |
| Qwen3-VL-30B-A3B | no disponible en la informacion recogida | no disponible | no disponible | si | no disponible | no disponible |

Diferencias destacables: frente a Qwen3-30B-A3B, el modelo de esta ficha declara capacidades multimodales y de uso de ordenador, mientras que Qwen3-30B-A3B es un modelo de texto. La licencia es el principal punto de divergencia: Qwen3-30B-A3B se distribuye bajo Apache-2.0, mientras que Holotron4 queda sujeto al NVIDIA Open Model Agreement, con condiciones especificas para uso comercial. En el plano practico, ambas familias cuentan con cuantizaciones GGUF de terceros, pero solo Holotron4 declara etiquetas de agente de uso de ordenador.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No se documenta ninguna evaluacion de sesgo, toxicidad o alineamiento del modelo base ni de la cuantizacion.
- Riesgo de alucinacion: no cuantificado. No hay evaluaciones de fidelidad ni de tasa de alucinacion publicadas. En tareas de computer-use el riesgo se amplifica, ya que una accion erronea puede modificar datos reales.
- Degradacion por cuantizacion: las variantes de menor tamanio (IQ1, IQ2, Q2_K, IQ3) degradan la calidad de forma notable. El propio autor recomienda IQ3_XXS sobre Q2_K del mismo tamanio y advierte que IQ3_XXS tiene "menor calidad" que otras opciones. Para tareas de agente con pasos encadenados, la degradacion se acumula.
- Limitacion de idioma: el modelo declara unicamente ingles. No hay evidencia de soporte de castellano ni de otros idiomas, y el rendimiento en ellos seria previsiblemente bajo.
- Longitud de contexto desconocida: no se documenta la ventana de contexto, lo que impide planificar despliegues con historiales largos o capturas de pantalla multiples sin medirla empiricamente.
- Incertidumbre sobre el componente multimodal: la cuantizacion publica ficheros GGUF de lenguaje y un fichero imatrix, pero no se documenta un fichero `mmproj` para el codificador visual. Verificar antes de asumir funcionamiento multimodal en `llama.cpp`.
- Restricciones de licencia: el modelo base se distribuye bajo el NVIDIA Open Model Agreement, no bajo una licencia de codigo abierto estandar. Es imprescindible revisar el texto completo del acuerdo para uso comercial, redistribucion y atribucion. La etiqueta de HuggingFace figura como `license:other` con enlace al acuerdo.
- Ausencia de soporte y mantenimiento: el repositorio registra 0 descargas y 0 likes en la informacion proporcionada, y las fechas de creacion y actualizacion (29 de septiembre de 2026) distan unas dos horas, lo que sugiere una publicacion reciente sin validacion comunitaria. No hay garantias de correccion de errores.
- Ficheros multiparte: algunas cuantizaciones de este tipo de repositorios se dividen en varios ficheros; es necesario consultar las instrucciones de concatenacion enlazadas en la model card antes de descargar.
- Ausencia de benchmarks: sin resultados de evaluacion, no es posible comparar objetivamente con alternativas ni estimar la adecuacion del modelo a un caso de uso concreto sin realizar pruebas propias.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/mradermacher/Holotron4-30B-A3B-i1-GGUF
- Modelo base: https://huggingface.co/Hcompany/Holotron4-30B-A3B
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/Holotron4-30B-A3B-GGUF
- Pagina resumen del modelo con lista de descargas: https://hf.tst.eu/model#Holotron4-30B-A3B-i1-GGUF
- Fichero imatrix: https://huggingface.co/mradermacher/Holotron4-30B-A3B-i1-GGUF/resolve/main/Holotron4-30B-A3B.imatrix.gguf
- Cuantizacion i1-Q4_K_S: https://huggingface.co/mradermacher/Holotron4-30B-A3B-i1-GGUF/resolve/main/Holotron4-30B-A3B.i1-Q4_K_S.gguf
- Licencia NVIDIA Open Model Agreement: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/
- Perfil del autor de la cuantizacion: https://huggingface.co/mradermacher
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Listado de modelos cuantizados del modelo base: https://huggingface.co/models?other=base_model:quantized:Hcompany/Holotron4-30B-A3B
- Guia de uso de ficheros GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
