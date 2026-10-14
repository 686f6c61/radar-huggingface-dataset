# mlx-community/MiniCPM-V-4.7-35B-A3B-OptiQ-4bit

## Resumen

MiniCPM-V-4.7-35B-A3B-OptiQ-4bit es una version cuantizada del modelo multimodal MiniCPM-V 4.7 35B-A3B de OpenBMB, publicada por la comunidad mlx-community y generada con la herramienta mlx-optiq. Se trata de un modelo de imagen-texto (vision-language) compuesto por una torre de vision SigLIP NaViT y una torre de lenguaje Qwen3.5-MoE de 40 capas con 256 expertos enrutados mas uno compartido y 8 expertos activos por token. El modelo base emplea atencion hibrida (lineal y completa) y admite una ventana de contexto de 262.144 tokens.

La relevancia de esta ficha concreta reside en la cuantizacion: OptiQ aplica precision mixta guiada por sensibilidad sobre las 510 capas del modelo, manteniendo 417 capas en 8 bits y bajando 93 a 4 bits, con la torre de vision en bf16 en un fichero sidecar. El resultado ocupa 24,4 GB para la parte de lenguaje y 1,1 GB para la de vision, y puede ejecutarse de forma residente en un Mac de 36 GB, o con solo unos 4,6 GB residentes si se activa el streaming de expertos desde SSD.

El peso total en safetensors es de 34.659.887.872 parametros, coherente con la nomenclatura "35B-A3B" del modelo base. La licencia es Apache 2.0 y el formato de pesos es safetensors en el ecosistema MLX, por lo que su despliegue esta restringido a Apple Silicon. No se dispone de informacion sobre idiomas soportados mas alla de lo indicado por el pipeline image-text-to-text.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal: torre de vision SigLIP NaViT (bf16) + torre de lenguaje Qwen3.5-MoE con atencion hibrida lineal/completa |
| Parametros totales | 34.659.887.872 (aproximadamente 34,66 mil millones) |
| Parametros activos | Aproximadamente 3.000 millones segun la nomenclatura A3B del modelo base; el autor no publica la cifra exacta (256 expertos enrutados + 1 compartido, 8 activos por token) |
| Longitud de contexto | 262.144 tokens (262k) |
| Tipos de cuantizacion | OptiQ de precision mixta: 417 capas a 8 bits y 93 capas a 4 bits, con referencia de 4 bits uniforme; torre de vision en bf16; cache KV mixta 4/8 bits en las capas de atencion completa |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX); vision en `optiq/optiq_vision.safetensors`; configuracion de cache KV en `kv_config.json` |
| Modelo base | openbmb/MiniCPM-V-4.7-35B-A3B |
| Tamano en disco | 24,4 GB (lenguaje) + 1,1 GB (vision); 25,5 GB de repositorio |
| Libreria de inferencia | MLX, requiere mlx-optiq >= 0.5.25 |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

La torre de lenguaje es un MoE de 40 capas con 256 expertos enrutados mas un experto compartido, de los que se activan 8 por token. Combina atencion lineal con atencion completa (hibrida), lo que permite sostener una ventana de 262.144 tokens con un coste de cache inferior al de un transformer de atencion completa pura. La torre de vision es un SigLIP NaViT que se mantiene en bf16 fuera del proceso de cuantizacion, en un fichero sidecar independiente.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas de alineacion como RLHF o DPO para el modelo base. La innovacion tecnica documentada en esta publicacion es el metodo de cuantizacion OptiQ: un esquema de precision mixta guiado por sensibilidad en el que se mide cada banco de expertos por separado y se decide, capa a capa, si se mantiene en 8 bits o se reduce a 4 bits, tomando como referencia una cuantizacion uniforme de 4 bits. Adicionalmente, se proporciona una configuracion de cache KV de precision mixta 4/8 bits aplicada solo a las capas de atencion completa.

## Capacidades

- Generacion de texto y conversacion multi-turno a partir de plantillas de chat.
- Comprension de imagenes y respuesta a preguntas sobre su contenido (OCR sobre texto en imagen, descripcion, razonamiento visual).
- Razonamiento matematico y resolucion de problemas aritmeticos de varios pasos.
- Generacion de codigo, con 90,9% de pass@1 en HumanEval en la evaluacion del cuantizador.
- Seguimiento de instrucciones estrictas (85,0% en IFEval en conjunto completo).
- Tool calling y function calling: 93,0% en BFCL-V3 simple sobre 200 llamadas.
- Recuperacion en contexto largo: 76,0% en HashHop, metrica de retrieval de contexto extenso.
- Entrada multimodal mediante `image_url` en el endpoint compatible con OpenAI y Anthropic que expone `optiq serve`.
- Capacidad de ejecucion local en Apple Silicon, con opcion de streaming de expertos para equipos con menos memoria.

## Casos de uso

- Analisis documental con OCR y extraccion de datos: el modelo puede procesar capturas, escaneos o fotografias con texto y responder preguntas sobre su contenido, aprovechando la torre SigLIP NaViT y los 262k tokens de contexto para encadenar varias paginas en una misma sesion.
- Asistente de codigo integrado en el escritorio del desarrollador: con 90,9% de pass@1 en HumanEval y soporte de tool calling, puede conectarse a herramientas locales de edicion, ejecucion de tests y control de versiones en un flujo agente.
- Automatizacion de atencion al cliente con contexto largo: los 262.144 tokens permiten mantener historiales extensos de conversacion y documentacion de producto sin truncar, y el endpoint compatible con OpenAI simplifica la integracion en backends existentes.
- Revision de interfaces y capturas de producto: al ser un modelo de imagen-texto, sirve para describir pantallas, detectar textos mal renderizados o generar descripciones accesibles de imagenes en pipelines de QA de frontend.
- Extraccion de informacion de graficos y tablas en informes: se puede alimentar con figuras extraidas de PDF y pedir la transcripcion estructurada a JSON, usando el modo estricto de seguimiento de instrucciones.
- Procesamiento local de datos sensibles: al ejecutarse integramente en un Mac con MLX, sin nube ni PyTorch, es apto para entornos donde la imagen o el texto no pueden salir del equipo, con aproximadamente 4,6 GB residentes si se activa el streaming de expertos.
- Razonamiento matematico asistido en entornos educativos: con 94,6% en GSM8K puede resolver y explicar problemas paso a paso en local, sin coste por token.
- Clasificacion y enrutado de tickets con function calling: el 93,0% en BFCL-V3 simple permite usarlo como capa de decision que invoca APIs internas segun el contenido del ticket.

## Benchmarks y rendimiento

Resultados publicados en la model card del cuantizador (OptiQ, evaluacion de texto estandar de seis metricas):

| Metrica | Resultado |
|---|---|
| MMLU (5-shot, 969 muestras) | 86,2% |
| GSM8K (1000 muestras) | 94,6% |
| IFEval (conjunto completo, estricto) | 85,0% |
| BFCL-V3 simple (200 llamadas) | 93,0% |
| HumanEval (164 problemas, pass@1) | 90,9% |
| HashHop (retrieval en contexto largo) | 76,0% |
| Capability Score (media de las 6) | 87,61 |

Segun la model card, ese Capability Score de 87,61 es el mas alto de todos los MoE publicados por OptiQ y el segundo de su catalogo, por detras de Qwen3.8-27B. No se han publicado en la informacion disponible resultados de benchmarks del modelo base sin cuantizar, ni comparaciones directas con otros modelos de la misma categoria mas alla de la mencion anterior.

## Requisitos de hardware

- Memoria residente: el modelo completo requiere un Mac con 36 GB o mas de memoria unificada.
- Modo streaming de expertos: con `--stream-experts on` se mantienen aproximadamente 4,6 GB residentes, a cambio de una penalizacion de velocidad al leer expertos desde el SSD.
- Desglose en disco: 24,4 GB de pesos de lenguaje y 1,1 GB de torre de vision.
- Plataforma: exclusivamente Apple Silicon. Al ser pesos MLX y depender de la libreria mlx-optiq (>= 0.5.25), no es desplegable en GPU NVIDIA ni en el ecosistema CUDA.
- Opciones de despliegue: `optiq serve` con endpoint compatible con OpenAI y Anthropic, o carga directa con `mlx_lm.load` y `generate` tras importar `optiq`. mlx-lm estandar no reconoce la arquitectura `minicpmv4_7`.
- Cache KV: se recomienda descargar `kv_config.json` del repositorio y pasarlo con `--kv-config` para usar la cache de precision mixta medida.
- Latencia y throughput: no disponibles.
- Variante reducida: MiniCPM-V-4.7-35B-A3B-OptiQ-4bit-REAP-19B ocupa 13,5 GB y obtiene un Capability Score de 81,91, pensada para equipos con menos memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion y tamano | Capability Score | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MiniCPM-V-4.7-35B-A3B-OptiQ-4bit | 34,66B totales, ~3B activos | 262.144 tokens | OptiQ mixta 4/8 bits, 25,5 GB de repo | 87,61 | Apache 2.0 | MLX / Apple Silicon |
| MiniCPM-V-4.7-35B-A3B-OptiQ-4bit-REAP-19B | No disponible (elimina la mitad de los expertos enrutados) | No disponible | OptiQ 4 bits, 13,5 GB | 81,91 | Apache 2.0 | MLX / Apple Silicon |
| openbmb/MiniCPM-V-4.7-35B-A3B (base) | 34,66B totales, ~3B activos | 262.144 tokens | Sin cuantizar (bf16) | No disponible | Apache 2.0 | No disponible |
| Qwen3.8-27B (citado en la model card como referencia del catalogo OptiQ) | No disponible | No disponible | No disponible | Por encima de 87,61 segun el autor | No disponible | No disponible |

## Limitaciones y advertencias

- La cuantizacion a 4 bits en 93 de las 510 capas introduce perdida de precision respecto al modelo base; el impacto exacto capa por capa no se detalla en la model card.
- Los benchmarks son autodeclarados por el cuantizador (OptiQ) sobre su propia evaluacion de texto, no publicados por OpenBMB para el modelo base, por lo que no son directamente verificables con fuentes independientes.
- La evaluacion de benchmarks es exclusivamente de texto; no se publican metricas de rendimiento en tareas de vision del modelo cuantizado.
- No se declaran los idiomas soportados, por lo que el comportamiento multilingue en produccion es una incognita y requerira validacion propia.
- Riesgo de alucinacion inherente a los modelos generativos, especialmente en tareas de OCR sobre imagenes de baja calidad o en preguntas sobre detalles visuales finos.
- La licencia Apache 2.0 permite uso comercial, pero la nomenclatura de autor original, mlx-community, no ofrece garantias ni soporte sobre esta cuantizacion concreta.
- Dependencia de una libreria de terceros: se requiere mlx-optiq >= 0.5.25 para cargar la arquitectura `minicpmv4_7`; mlx-lm estandar no la reconoce.
- Restriccion de plataforma severa: solo Apple Silicon, lo que excluye su uso en infraestructura de servidores con GPU NVIDIA y complica el escalado horizontal.
- El rendimiento del modo `--stream-experts on` no se cuantifica en la informacion disponible; puede degradar la latencia de forma significativa en uso interactivo.
- La busqueda web realizada no ha devuelto resultados tecnicos relevantes sobre el modelo, unicamente dominios no relacionados, por lo que no ha sido posible contrastar datos con fuentes externas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlx-community/MiniCPM-V-4.7-35B-A3B-OptiQ-4bit
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B
- Variante reducida REAP-19B: https://huggingface.co/mlx-community/MiniCPM-V-4.7-35B-A3B-OptiQ-4bit-REAP-19B
- Sitio del proyecto OptiQ: https://mlx-optiq.com/
- Guia de la familia MiniCPM en OptiQ: https://mlx-optiq.com/docs/minicpm
- Catalogo de cuantizaciones OptiQ: https://mlx-optiq.com/models
- Documentacion de OptiQ: https://mlx-optiq.com/docs/

Nota: la busqueda web asociada a esta ficha no devolvio resultados tecnicos utilizables; los unicos dominios retornados no guardan relacion con el modelo.
