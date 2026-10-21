# gatilin/emu3_5_visual_codec

## Resumen

`gatilin/emu3_5_visual_codec` es un paquete que extrae y publica como componente independiente el codec visual completo de Emu3.5: el codificador de imagen, el codebook de cuantizacion vectorial de 131.072 entradas × 256 dimensiones, las proyecciones de cuantizacion y el decodificador. No es un modelo de lenguaje ni un generador de imagenes: es el tokenizador visual que convierte una imagen RGB en una rejilla de identificadores discretos (0–131.071) y permite reconstruirla a partir de esos identificadores.

Los pesos proceden de `BAAI/Emu3.5-VisionTokenizer`, en la revision fija `a5c45bdb8084763048e094ae124778bfeca7d5ee`, y se redistribuyen sin modificar nombres, formas, dtypes ni el contenido de los tensores. El autor del repositorio (gatilin) anade una implementacion nativa empaquetada y el preprocesado correspondiente, documentados en `code_provenance.json`, manteniendo los avisos Apache-2.0 originales. El conjunto suma 455.336.963 parametros y 1,8 GB de repositorio.

Su relevancia practica esta en que permite reutilizar el tokenizador visual de Emu3.5 fuera del stack completo: sirve para preprocesar datasets multimodales, construir pipelines autorregresivos de imagen sobre tokens discretos o auditar el comportamiento del cuantizador. El propio autor advierte de que las comprobaciones de reconstruccion incluidas son sinteticas y no establecen calidad de imagen ni rendimiento del razonamiento de Emu3.5, y de que no existe una interfaz de video temporal probada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codec de imagenes con cuantizacion vectorial (VQ): codificador, proyecciones de cuantizacion, codebook de 131.072 × 256 y decodificador |
| Parametros totales | 455.336.963 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); una imagen de 256×256 px se tokeniza en 256 tokens visuales (rejilla 16×16) |
| Tipos de cuantizacion | no disponible; se publican los safetensors originales sin cuantizar y no se documentan variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible; no aplica a texto, es un codificador visual |
| Licencia | Apache-2.0, con los avisos originales de BAAI conservados |
| Formato de pesos | safetensors mas codigo Python nativo (`custom_code`; `component.py`, `input_utils.py`, `native/`) |

## Arquitectura y entrenamiento

La informacion disponible describe un codec de imagen con cuantizacion vectorial: un codificador que transforma la imagen en caracteristicas latentes, una etapa de cuantizacion que las discretiza contra un codebook de 131.072 vectores de 256 dimensiones, y un decodificador que reconstruye la imagen a partir de los identificadores. El repositorio contiene 543 tensores cargados de forma estricta, segun el script de validacion incluido. No se detalla en la model card el tipo de bloques internos (convolucionales, transformer o hibridos), el numero de capas ni la dimension oculta.

El preprocesado nativo redimensiona con PIL en modo bicubico hasta un area objetivo, redondea las dimensiones a multiplos de 16 y normaliza los bytes RGB con `pixel / 127.5 - 1`, esperando tensores NCHW en el rango [-1, 1]. Un detalle tecnicamente relevante: el cuantizador nativo selecciona el vector del codebook por maximo producto escalar, no por vecino euclideo mas cercano, por lo que reimplementaciones que asuman distancia L2 producirian asignaciones distintas. La empaquetadura no aplica desplazamientos de tokens de lenguaje; los IDs devueltos son IDs locales del codebook, y es el tokenizador de lenguaje de Emu3.5 el que anade separadores de fila, resolucion y cadenas del tipo `<|visual token 000000|>`. No se documentan datos de entrenamiento, numero de tokens, composicion del dataset ni etapas de RLHF o DPO.

## Capacidades

- Tokenizacion de imagenes a identificadores discretos: codifica una imagen RGB en una matriz de IDs de codebook entre 0 y 131.071.
- Decodificacion de identificadores a imagen: `decode_code(ids, shape=...)` reconstruye la imagen a partir de la rejilla de tokens.
- Soporte de imagenes cuadradas y rectangulares, con redimensionado interno a multiplos de 16.
- Codebook de gran granularidad (131.072 entradas), pensado para representaciones visuales de alta fidelidad en modelos multimodales unificados.
- Extraccion de componente: permite usar el codec aislado, sin cargar el modelo de lenguaje de Emu3.5.
- Validacion reproducible incluida: `validate.py` comprueba SHA-256 de los LFS de origen, carga estricta de 543 entradas, limites de IDs, busqueda en codebook, asignacion nativa y paridad de `decode_code`; `validation.json` registra los resultados ejecutados.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto: no es un modelo de lenguaje.
- No hay interfaz de video temporal probada de forma independiente.

## Casos de uso

- Preprocesado de datasets para entrenamiento multimodal unificado: convertir grandes volumenes de imagenes en secuencias de IDs discretos que se concatenan con tokens de texto en un unico flujo autorregresivo, aprovechando que el formato de tokens ya es compatible con el tokenizador de lenguaje de Emu3.5.
- Construccion de pipelines de generacion de imagen sobre tokens discretos: entrenar o evaluar un transformer autorregresivo que prediga IDs del codebook y usar el decodificador incluido para materializar la imagen final.
- Compresion y reconstruccion de imagenes en el dominio discreto: 256 tokens de 17 bits teoricos por imagen de 256×256 frente a los 196.608 bytes en bruto, util para almacenar o transportar representaciones intermedias en lugar de pixeles.
- Investigue en utilizacion de codebooks: analizar que porcentaje de las 131.072 entradas se activa con un corpus concreto, detectar colapso de codigos y comparar estrategias de asignacion (producto escalar frente a L2).
- Integracion en un servicio de inferencia por componentes: desplegar solo el codec (455 M de parametros) en lugar del stack Emu3.5 completo para tareas de codificacion y decodificacion aisladas.
- Auditoria y reproducibilidad de artefactos: verificar que los pesos redistribuidos coinciden con la revision fija de BAAI mediante `validate.py`, util en entornos con requisitos de procedencia de modelos.
- Extraccion de representaciones discretas para recuperacion o agrupamiento de imagenes: usar los IDs como firma compacta en lugar de embeddings continuos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las comprobaciones de reconstruccion sintetica no establecen calidad de imagen ni el rendimiento completo de razonamiento y generacion de Emu3.5. No se aportan metricas de PSNR, SSIM, FID, LPIPS ni tasas de utilizacion del codebook.

## Requisitos de hardware

- VRAM estimada: el tamaño del repositorio (1,8 GB) es coherente con 455.336.963 parametros en fp32 (≈1,82 GB); el dtype exacto no se documenta. Como estimacion, los pesos ocuparian entre 0,9 y 1,8 GB segun se carguen en bf16 o fp32, a lo que hay que sumar activaciones.
- Las activaciones crecen con la resolucion: codificar una imagen de 1024×1024 exige bastante mas memoria que una de 256×256, aunque no se publican cifras medidas.
- GPU: cabe con holgura en tarjetas de consumo como RTX 3060 12 GB, RTX 4070, RTX 4090; en A100 y H100 el coste dominante seria el throughput, no la memoria.
- CPU: viable para imagenes sueltas en fp32, con latencia mayor; no se documentan tiempos.
- Despliegue: no aplica vLLM, TGI ni Ollama, al no ser un modelo de lenguaje. El uso previsto es PyTorch nativo mediante `component.load_model()` y `torch.inference_mode()`, opcionalmente con `torch.compile` y procesamiento por lotes en GPU.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Codebook | Contexto / tokens por imagen | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gatilin/emu3_5_visual_codec | 455.336.963 | 131.072 × 256 | 256 tokens para 256×256 px | Apache-2.0 | HuggingFace, 7 descargas |
| BAAI/Emu3.5-VisionTokenizer | no disponible en la informacion | 131.072 × 256 (mismo artefacto de origen) | no disponible | Apache-2.0 | HuggingFace (repositorio oficial) |
| Otros tokenizadores VQ de imagen (familia LlamaGen, Cosmos, Chameleon) | no disponible | no disponible | no disponible | varian por modelo | HuggingFace / repos propios |

La comparacion cuantitativa con alternativas no es posible con los datos suministrados: no se aportan parametros, tamaños de codebook ni metricas de reconstruccion de otros tokenizadores. Respecto al repositorio oficial de BAAI, este paquete no cambia los pesos, solo anade implementacion nativa, preprocesado y scripts de validacion.

## Limitaciones y advertencias

- No es un modelo generativo autonomo: sin un modelo de lenguaje o un transformer autorregresivo que produzca los IDs, el codec solo codifica y decodifica.
- Ausencia total de metricas de calidad: no hay PSNR, SSIM, FID ni evaluacion humana de reconstruccion; el propio autor lo senala.
- Sin interfaz de video temporal probada; no debe asumirse comportamiento temporal correcto.
- Sesgos: no disponible. Al ser un codec entrenado por BAAI, podria heredar sesgos del dataset de entrenamiento, pero no se documenta nada al respecto.
- Riesgo de alucinacion: no aplica en el sentido habitual, pero si existe riesgo de reconstruccion fiel solo en apariencia, con perdida de detalle fino en texto, rostros o patrones de alta frecuencia; no cuantificado.
- El cuantizador usa maximo producto escalar, no vecino euclideo. Cualquier reimplementacion que asuma L2 dara IDs distintos y silenciosamente incorrectos.
- El paquete no aplica los desplazamientos de tokens de lenguaje: integrarlo con el tokenizador de Emu3.5 exige mapear manualmente los IDs locales al rango de tokens visuales y anadir separadores de fila y resolucion.
- Repositorio no oficial con 7 descargas y 0 likes: la procedencia esta documentada y validable con `validate.py`, pero conviene ejecutar esa validacion antes de usarlo en produccion.
- Requiere `custom_code` y la insercion del directorio del modelo en `sys.path`, lo que implica ejecutar codigo Python del repositorio; revisar `code_provenance.json` y el codigo antes de desplegar.
- Licencia Apache-2.0 permite uso comercial, pero obliga a conservar los avisos de copyright y la atribucion a BAAI; no se especifican restricciones adicionales.
- No se documentan dtype de los pesos, requisitos minimos de version de PyTorch ni compatibilidad con `transformers`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gatilin/emu3_5_visual_codec
- Modelo base: https://huggingface.co/BAAI/Emu3.5-VisionTokenizer
- Revision fija del codigo fuente: https://huggingface.co/BAAI/Emu3.5-VisionTokenizer/tree/a5c45bdb8084763048e094ae124778bfeca7d5ee
- No se han encontrado en la informacion disponible papers, blogs, repositorios ni demos adicionales.
