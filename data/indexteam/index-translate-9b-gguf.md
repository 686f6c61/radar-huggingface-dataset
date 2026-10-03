# IndexTeam/Index-Translate-9B-GGUF

## Resumen

Index-Translate-9B-GGUF es la conversión oficial al formato GGUF del modelo IndexTeam/Index-Translate-9B, desarrollado por el equipo Index (vinculado al repositorio github.com/bilibili/Index-Translate). Forma parte de la familia Index-Translate, una familia de modelos de traducción multilingüe que cubre 150 idiomas y está orientada a traducción con restricciones de terminología y formato, traducción controlada para doblaje y traducción de documentos largos. El problema que resuelve es la traducción automática de alta calidad con control explícito sobre el resultado (terminología fija, formato de salida, estilo de doblaje), algo que los modelos generalistas no garantizan de forma consistente.

El repositorio publicado es exclusivamente la versión cuantizada en GGUF del modelo base, lista para ejecutarse con llama.cpp sin necesidad de GPU de gama alta. El nombre indica un tamaño de aproximadamente 9.000 millones de parámetros y la model card menciona un informe técnico en arXiv (2609.40181) y un repositorio de código. La conversión ha sido validada en GPU NVIDIA A100 comparando cada nivel de cuantización contra la conversión F16 mediante divergencia KL por token y contra los pesos BF16 originales.

El modelo incluye además un proyector multimodal (mmproj) que habilita entrada de imagen a través de llama-mtmd-cli, lo que sugiere que el modelo base incorpora una torre de visión. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales. Es relevante ahora porque ofrece traducción multilingüe controlada en un paquete que cabe en GPUs de consumo gracias a las cuantizaciones de 4 y 5 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no especifica si es transformer denso, MoE o hibrida) |
| Parametros totales | aproximadamente 9.000 millones (segun la denominacion del modelo; la model card no desglosa la cifra exacta) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mas proyectores multimodales mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | 150 idiomas (segun la model card); no se publica la lista completa |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo base IndexTeam/Index-Translate-9B se distribuye por separado |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base: la model card de la version GGUF no indica si se trata de un transformer denso, un modelo de mezcla de expertos (MoE) o una arquitectura hibrida, ni el numero de tokens de entrenamiento, la composicion del dataset o si se aplicaron tecnicas de RLHF o DPO. Lo unico confirmado es que se trata de un modelo de traduccion de unos 9.000 millones de parametros con soporte de entrada de imagen mediante un proyector multimodal, y que la familia cubre 150 idiomas con modos especificos de traduccion restringida (terminologia y formato), traduccion para doblaje controlado y traduccion de documentos largos.

En cuanto a la innovacion tecnica destacable de este repositorio, la conversion emplea cuantizacion estatica posterior al entrenamiento (static post-training quantization) generada con llama.cpp (rama master, 2026-10), agrupando todos los anchos de bits en un unico repositorio. Antes de la publicacion, cada nivel de cuantizacion se valido en NVIDIA A100 comparandolo con la conversion F16 mediante divergencia KL por token y RMS delta-p con llama-perplexity, ademas de comprobaciones puntuales de generacion greedy contra los pesos BF16 originales. La model card afirma que las salidas de Q4_K_M coincidieron casi literalmente con la referencia. No se especifica en la informacion proporcionada si existe decodificacion especulativa, atencion lineal u otras optimizaciones internas.

## Capacidades

- Traduccion multilingue en 150 idiomas, con el ingles y el chino como idiomas de trabajo explicitamente documentados en el formato de prompt.
- Traduccion con terminologia restringida: permite fijar terminos concretos y forzar su uso en la salida.
- Traduccion con formato restringido: mantiene estructuras de formato en el texto de salida (formato instTrans mencionado en la model card del modelo base).
- Traduccion controlada para doblaje, con restricciones de estilo y longitud presumiblemente orientadas a sincronizacion.
- Traduccion de documentos largos.
- Entrada de imagen mediante el proyector multimodal (archivos mmproj), utilizable con llama-mtmd-cli. La model card no detalla el alcance exacto de esta capacidad visual.
- Decodificacion determinista recomendada (greedy, temperature=0) para traduccion, con un formato de prompt fijo en chino: "请将以下文本翻译为{target-language}，直接输出翻译结果，不要进行任何解释。"
- No se documenta en la informacion disponible soporte de tool calling, function calling ni razonamiento multi-paso orientado a agentes.

## Casos de uso

- Traduccion de documentacion tecnica con glosario fijo: el modelo permite imponer terminologia concreta, de modo que terminos como nombres de API, siglas o marcas se traduzcan siempre igual en toda la documentacion, evitando la inconsistencia tipica de los modelos generalistas.
- Localizacion de productos y software: gracias al modo de formato restringido, se pueden traducir cadenas que contienen marcadores, etiquetas o placeholders manteniendo la estructura intacta, lo que reduce errores en pipelines de localizacion automatizados.
- Traduccion de subtitulos y doblaje: el modo de traduccion controlada para doblaje esta pensado para producir salidas con restricciones de estilo y longitud, adecuadas para sincronizar con audio.
- Traduccion de documentos largos: el modelo esta disenado para procesar documentos extensos, lo que encaja en la traduccion de informes, contratos o articulos sin fragmentarlos en trozos que pierdan coherencia.
- Servicio de traduccion autoalojado en infraestructura propia: al distribuirse en GGUF y con licencia Apache-2.0, se puede desplegar con llama.cpp en servidores propios sin enviar datos a terceros, algo critico para contenido confidencial.
- Traduccion en el borde o en equipos sin GPU dedicada: las cuantizaciones Q4_K_M (5,78 GB) y Q5_K_M (6,64 GB) permiten ejecutar traduccion en portatiles y estaciones de trabajo modestas con CPU o GPU integrada.
- Traduccion de contenido con imagenes: usando los archivos mmproj con llama-mtmd-cli, se puede abordar texto presente en imagenes (capturas, carteles, documentos escaneados) dentro del mismo flujo de traduccion.
- Preprocesado multilingue para analitica: normalizar texto de 150 idiomas a un idioma de trabajo antes de indexar o analizar, aprovechando el caracter determinista de la decodificacion greedy.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente describe un proceso de validacion interna de las cuantizaciones (divergencia KL por token, RMS delta-p y comprobaciones de generacion greedy frente a la referencia BF16 en A100), sin aportar cifras concretas de BLEU, COMET ni de benchmarks generales como MMLU o HumanEval.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + cache KV y overhead, valores orientativos a partir del tamano de archivo):
  - Q2_K (3,91 GB): aproximadamente 5 GB.
  - Q3_K_M (4,74 GB): aproximadamente 6 GB.
  - Q4_K_M (5,78 GB): aproximadamente 7-8 GB. Nivel recomendado por el autor.
  - Q5_K_M (6,64 GB): aproximadamente 8-9 GB.
  - Q6_K (7,56 GB): aproximadamente 9-10 GB.
  - Q8_0 (9,79 GB): aproximadamente 12-13 GB.
  - f16 (18,41 GB): aproximadamente 21-23 GB.
  - Los proyectores multimodales anaden 0,62 GB (mmproj-Q8_0) o 0,92 GB (mmproj-f16) cuando se usa entrada de imagen.
- GPU recomendadas: las cuantizaciones de 4 y 5 bits caben en tarjetas de consumo como RTX 3060 de 12 GB, RTX 4070, RTX 4080 o RTX 4090. Q8_0 requiere al menos 16 GB (RTX 4080/4090, A4000). La version f16 encaja en A100 40 GB, H100 o RTX 4090 de 24 GB con margen ajustado. La model card cita NVIDIA A100 para la validacion de cuantizaciones.
- Cabe en GPU de consumo: si. Q4_K_M encaja en GPUs de 8 GB con contexto corto y holgadamente en 12 GB. Las versiones Q2_K y Q3_K caben incluso en GPUs de 6 GB.
- Opciones de despliegue: llama.cpp mediante llama serve y llama cli (segun los comandos de la model card), y llama-mtmd-cli para el modo multimodal. No se documenta en la informacion disponible soporte para vLLM, TGI, Ollama u otros motores.
- Latencia y throughput estimados: no disponibles. La unica indicacion de rendimiento es que la validacion se realizo en A100 y que el autor recomienda Q4_K_M como equilibrio entre tamano y calidad.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de benchmarks, contexto, parametros exactos ni rendimiento de modelos comparables, por lo que no es posible establecer una comparativa cuantitativa fiable. La model card situa a este modelo dentro de la propia familia Index-Translate (150 idiomas) y menciona que existe un modelo base del que deriva esta conversion, pero no ofrece comparaciones con alternativas externas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Index-Translate-9B (GGUF) | aproximadamente 9.000 millones | no disponible | Apache-2.0 | GGUF via llama.cpp |
| Index-Translate-9B (base) | aproximadamente 9.000 millones | no disponible | Apache-2.0 | repo HuggingFace IndexTeam/Index-Translate-9B |
| Alternativas de traduccion de tamano similar | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se detalla la lista completa de los 150 idiomas; la calidad puede variar de forma notable entre idiomas con muchos recursos y lenguas minoritarias.
- El prompt de traduccion documentado esta redactado en chino y asume una instruccion estricta de no anadir explicaciones. Usar otros formatos de prompt puede degradar la salida.
- Se recomienda decodificacion greedy con temperature=0. Introducir muestreo aleatorio puede reducir la fidelidad de la traduccion.
- Las cuantizaciones de 2 y 3 bits (Q2_K, Q3_K_S, Q3_K_M, Q3_K_L) presentan, segun el propio autor, perdida de calidad significativa o apreciable. Para produccion conviene Q4_K_M o superior.
- Riesgo de alucinacion y de omisiones en textos largos o con terminologia muy especializada: no se han publicado tasas de error ni evaluaciones independientes.
- La model card no documenta sesgos conocidos del modelo base ni su comportamiento en dominios sensibles.
- La capacidad multimodal esta poco documentada: se sabe que los archivos mmproj habilitan entrada de imagen con llama-mtmd-cli, pero no se especifican tareas soportadas ni limitaciones.
- No se documenta soporte de tool calling ni de agentes, por lo que no deberia asumirse para flujos de ese tipo.
- Aunque la licencia Apache-2.0 permite uso comercial sin restricciones adicionales, es responsabilidad del integrador verificar el cumplimiento en su jurisdiccion y el tratamiento de datos personales en las traducciones.
- El modelo indicado como base (IndexTeam/Index-Translate-9B) debe consultarse para obtener la informacion completa de arquitectura, contexto y formato instTrans, ya que esta ficha se limita al repositorio GGUF.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/IndexTeam/Index-Translate-9B-GGUF
- Modelo base en HuggingFace: https://huggingface.co/IndexTeam/Index-Translate-9B
- Informe tecnico en arXiv: https://arxiv.org/abs/2609.40181
- Codigo en GitHub: https://github.com/bilibili/Index-Translate
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Archivo recomendado Q4_K_M: https://huggingface.co/IndexTeam/Index-Translate-9B-GGUF/resolve/main/Index-Translate-9B.Q4_K_M.gguf
- Proyector multimodal mmproj-Q8_0: https://huggingface.co/IndexTeam/Index-Translate-9B-GGUF/resolve/main/Index-Translate-9B.mmproj-Q8_0.gguf
- Proyector multimodal mmproj-f16: https://huggingface.co/IndexTeam/Index-Translate-9B-GGUF/resolve/main/Index-Translate-9B.mmproj-f16.gguf
