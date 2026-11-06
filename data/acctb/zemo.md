# AccTB/Zemo

## Resumen

Zemo es un modelo multimodal de tipo image-text-to-text publicado por el usuario AccTB en Hugging Face bajo el marco que el autor denomina "Algorithmic Computer-generated Consciousness" (ACC) y "Neural Cognition Engine" (NCE). Segun la model card, se trata de un modelo de arquitectura Mixture of Experts (MoE) con 1 billon de parametros totales y 32 mil millones de parametros activos por token, 61 capas, 384 expertos (8 activos por token) y una ventana de contexto de 256K tokens. Incorpora un encoder visual MoonViT y atencion Multi-head Latent Attention (MLA), y declara como modelo de referencia fundacional a Kimi K2.5 de Moonshot AI.

La propuesta del autor mezcla conceptos de investigacion heterodoxos (integracion de transformers, RNN, CNN, redes feedforward y redes neuronales de picos, ademas de una idea de "PhiModel" basada en la proporcion aurea como principio de organizacion neuronal) con especificaciones tecnicas propias de un modelo frontera. No obstante, la publicacion no incluye pesos, dataset, proceso de entrenamiento, resultados de evaluacion ni documentacion tecnica verificable: el repositorio registra 0 descargas y 0 likes en el momento de la consulta.

Por tanto, esta ficha debe leerse con cautela: los datos de arquitectura provienen exclusivamente de la model card del autor y no han podido contrastarse con artefactos publicados. El interes actual del modelo es, mas que practico, como ejemplo de publicaciones en Hugging Face que declaran especificaciones de gran escala sin evidencia reproducible asociada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) con atencion Multi-head Latent Attention (MLA); encoder visual MoonViT |
| Parametros totales | 1 billon (1T), segun model card |
| Parametros activos | 32 mil millones (32B) por token |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | other (no especificada en detalle) |
| Formato de pesos | no disponible (no se publican pesos en el repositorio) |

Otros datos declarados en la model card: 61 capas, 384 expertos, 8 expertos activos por token, vocabulario de 160K tokens, funcion de activacion SwiGLU, modalidades de entrada texto e imagenes. Modelo de referencia fundacional declarado: Kimi K2.5 (Moonshot AI).

## Arquitectura y entrenamiento

Segun la model card, Zemo emplea una arquitectura MoE con 384 expertos y enrutamiento de 8 expertos por token, sobre 61 capas y con atencion Multi-head Latent Attention (MLA), un mecanismo de atencion con compresion de claves y valores en un espacio latente de baja dimension que reduce el coste de memoria del KV cache en contextos largos. La activacion es SwiGLU y el encoder visual es MoonViT, lo que habilita la entrada conjunta de texto e imagenes.

El autor enmarca el modelo en el framework NCE, que segun la model card "explora la integracion de multiples arquitecturas de red neuronal, incluidas transformers, redes neuronales recurrentes, redes convolucionales, redes feedforward y redes neuronales de picos", e incorpora el concepto "PhiModel", que "investiga el uso de la proporcion aurea como principio matematico para la organizacion neuronal". No se proporciona informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el proceso de alineacion (RLHF, DPO u otros) ni innovaciones de inferencia como decodificacion especulativa. Tampoco se publican pesos, configuracion ni codigo de entrenamiento.

## Capacidades

- Generacion de texto y procesamiento de entradas multimodales texto-imagen, segun el pipeline declarado (image-text-to-text).
- Razonamiento y comprension de imagenes a traves del encoder MoonViT (declarado, sin evidencia publica de evaluacion).
- Ventana de contexto de 256K tokens, adecuada para documentos largos y conversaciones multi-turno extensas.
- Capacidades multilingues limitadas al ingles segun la etiqueta de idioma del repositorio.
- Soporte de tool calling / function calling: no disponible (no declarado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no declarado).
- Modo de razonamiento explicito (thinking mode), audio u otras modalidades: no disponible (no declarado).

## Casos de uso

- Procesamiento de documentos largos con imagenes intercaladas: la ventana de 256K tokens permitiria ingerir informes, contratos o articulos cientificos completos junto con figuras y tablas en una sola pasada, si el modelo estuviera disponible en pesos.
- Analisis de capturas de pantalla y diagramas tecnicos: el encoder MoonViT y la entrada image-text-to-text encajan con tareas de descripcion de interfaces, extraccion de datos de graficos y transcripcion semantica de esquemas.
- Asistencia en investigacion documental: consulta y sintesis sobre corpus extensos en ingles, aprovechando el contexto largo para mantener coherencia entre secciones.
- Moderacion y anotacion multimodal de contenido: clasificacion y descripcion de pares imagen-texto en pipelines de curacion de datos.
- Prototipado de asistentes conversacionales de dominio acotado en ingles, siempre que se obtuvieran pesos y se validara el comportamiento real del modelo.
- Evaluacion comparativa de arquitecturas MoE: como referencia teorica para estudiar configuraciones de 384 expertos con 8 activos y MLA, si el autor publicara configuracion y pesos.

En la practica, ninguno de estos casos puede desplegarse hoy: el repositorio no ofrece pesos, tokenizador, configuracion ni demo funcional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, MMMU ni de ningun otro conjunto de evaluacion, ni comparaciones con modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Un modelo de 1T parametros totales requeriria, incluso en cuantizacion agresiva de 4 bits, del orden de 500 GB solo para pesos, ademas del KV cache; sin pesos publicados no es posible confirmar viabilidad.
- GPU recomendadas: no disponible. Por escala declarada, un despliegue realista exigiria clústeres multi-GPU de clase H100/H200 o superior; no cabe en GPU de consumo.
- GPU de consumo: no cabe en ninguna GPU consumer (RTX 4090, 3090, etc.) segun los parametros declarados.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no hay artefactos compatibles publicados.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|
| Zemo (AccTB) | 1T / 32B (declarado) | 256K (declarado) | other | No publicados |
| Kimi K2.5 (Moonshot AI, referencia declarada) | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha | Referenciado en la model card |
| Alternativas MoE abiertas de gran escala | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables de rendimiento de Zemo que permitan una comparacion cuantitativa con modelos de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de artefactos: no se publican pesos, tokenizador, configuracion ni codigo; el modelo no es ejecutable tal como esta publicado.
- Especificaciones no verificadas: los datos de 1T/32B parametros, 384 expertos y 256K de contexto provienen unicamente de la model card y no estan respaldados por evaluaciones ni documentacion tecnica.
- Marco conceptual heterodoxo: terminos como "Neural Cognition Engine", "Algorithmic Computer-generated Consciousness" y "PhiModel" no corresponden a metodologia estandar revisada por pares; deben tratarse con escepticismo.
- Riesgo de alucinacion: no evaluable sin pesos ni benchmarks; en cualquier caso, un modelo sin alineacion documentada presenta riesgo alto en produccion.
- Idioma: solo se declara ingles; no hay soporte documentado de castellano.
- Licencia: marcada como "other" sin texto de licencia visible, lo que impide determinar condiciones de uso comercial; debe considerarse no apta para produccion hasta aclaracion del autor.
- Sesgos: no disponibles; no se documenta composicion de datos ni evaluaciones de sesgo.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin senales de comunidad ni mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AccTB/Zemo
- Imagen del logo referenciada en la model card: https://huggingface.co/spaces/TejAndrewsACC/Zemo/resolve/main/IMG_3490.png
- Modelo de referencia fundacional declarado (Kimi K2.5): https://huggingface.co/moonshotai/Kimi-K2.5
