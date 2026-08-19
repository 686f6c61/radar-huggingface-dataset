# NANI-Nithin/LFM2.5-VL-3B-GGUF

## Resumen

LFM2.5-VL-3B es un modelo de visión y lenguaje (VLM) de 3.100 millones de parámetros desarrollado por Liquid AI, diseñado específicamente para su ejecución en dispositivos locales. Combina el backbone de lenguaje LFM2.5-2.6B con un codificador visual SigLIP2 NaFlex de 400M, alcanzando una ventana de contexto de 32.768 tokens. El modelo destaca en comprensión de pantallas e interfaces de usuario, OCR con reconocimiento de diseño, localización de objetos y uso de herramientas a partir de texto o imágenes.

Esta ficha corresponde a la cuantización GGUF comunitaria realizada por NANI-Nithin, que permite ejecutar el modelo con llama.cpp y herramientas compatibles como Ollama o llama-server. La relevancia de esta versión radica en que facilita el despliegue del modelo en hardware de consumo, con cuantizaciones que van desde IQ2_M hasta BF16, manteniendo un equilibrio razonable entre calidad y requisitos de memoria. Es una opción práctica para desarrolladores que necesitan capacidades multimodales de OCR y grounding sin depender de APIs externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2.5-VL (dense, transformer multimodal) |
| Parametros totales | 2.697.198.592 (safetensors) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | BF16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_M, IQ4_XS, IQ4_NL |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (17 idiomas) |
| Licencia | LFM Open License v1.0 (licencia propia, no OSI) |
| Formato de pesos | GGUF (cuantizaciones para llama.cpp) |

## Arquitectura y entrenamiento

LFM2.5-VL-3B utiliza una arquitectura transformer densa multimodal. El componente de lenguaje es el backbone LFM2.5-2.6B, que emplea una arquitectura de mezcla lineal de unidades recurrente y atencion (LFM, Liquid Foundation Model), una innovacion de Liquid AI que combina mecanismos de atencion con capas recurrentes para reducir el coste computacional en inferencia. El codificador visual es SigLIP2 NaFlex con 400 millones de parametros, que procesa imagenes y las proyecta al espacio de embeddings del modelo de lenguaje. El vocabulario total es de 128.000 tokens.

Los detalles del entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO) no estan disponibles en la informacion proporcionada. El modelo base fue publicado por Liquid AI y esta orientado a tareas de comprension de pantallas, OCR con layout, grounding de objetos y tool use multimodal. La cuantizacion GGUF fue realizada por la comunidad con `convert_hf_to_gguf.py` en BF16 y posteriormente cuantizada con `llama-quantize`; los archivos IQ utilizaron `llama-imatrix` con importancia matrix.

## Capacidades

- Comprension de imagenes y texto: responde preguntas sobre el contenido visual de una imagen.
- OCR con reconocimiento de layout: extrae texto visible respetando la estructura y disposicion del documento.
- Comprension de pantallas e interfaces de usuario: identifica elementos UI, botones, menus y su disposicion.
- Object grounding: localiza objetos dentro de una imagen y devuelve coordenadas o bounding boxes.
- Tool use desde texto o imagen: puede seleccionar y utilizar herramientas basandose en instrucciones textuales o en lo que ve en una captura.
- Multilingue: soporta 17 idiomas, incluyendo espanol, ingles, frances, aleman, arabe, chino, japones, coreano, entre otros.
- Inferencia de baja latencia: al ser un modelo de 3B parametros, es adecuado para tareas de un solo turno con respuesta rapida en dispositivos locales.

## Casos de uso

- Digitalizacion de documentos: el modelo puede procesar imagenes de facturas, formularios o paginas escaneadas y extraer el texto visible con su estructura, gracias a su capacidad de OCR con layout. Es adecuado para pipelines de batch document parsing en servidores modestos o estaciones de trabajo.
- Automatizacion de pruebas de interfaz de usuario: dado que comprende pantallas y elementos UI, puede analizar capturas de aplicaciones web o moviles, identificar botones y campos, y generar descripciones utiles para suites de testing visual automatizado.
- Asistente de accesibilidad para moviles: al ejecutarse en dispositivos locales, puede describir el contenido de una pantalla a personas con discapacidad visual, identificando elementos interactivos y leyendo texto en tiempo real con baja latencia.
- Extraccion de informacion de menus y senales: el modelo es util para traducir o transcribir menus de restaurantes, senales de trafico o carteles en varios idiomas, gracias a su soporte multilingue y su capacidad OCR.
- Automatizacion de flujos con tool calling: integrado en un agente, puede recibir una captura de pantalla, decidir que herramienta invocar (por ejemplo, una API de reservas o un buscador) y ejecutar la accion correspondiente, todo localmente.
- Analisis de imagenes en entornos edge: en kioscos, camaras inteligentes o dispositivos IoT con GPU limitada, el modelo cuantizado en Q4_K_M o IQ4_XS puede realizar tareas de grounding y clasificacion visual sin conexion a internet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como MMLU, HumanEval o benchmarks especificos de VLM (como MMMU, DocVQA o ScreenQA). El autor de la cuantizacion recomienda Q4_K_M como equilibrio optimo entre tamano y calidad, y Q5_K_M como opcion mas segura para tareas de OCR y grounding, pero no aporta cifras comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion Q4_K_M, el modelo ocupa aproximadamente 2 GB de memoria, por lo que cabe en GPUs de consumo como la RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para Q4_K_M; para Q6_K o Q8_0 se recomiendan 6-8 GB. En CPU, es ejecutable con 8-16 GB de RAM usando llama.cpp, aunque con mayor latencia.
- Compatibilidad con consumer GPU: si, es uno de los puntos fuertes del modelo. Incluso en iGPU o CPUs modernas puede ejecutarse a velocidades aceptables para tareas de un solo turno.
- Opciones de despliegue: llama.cpp (llama-cli y llama-server), Ollama, LM Studio, o cualquier frontend compatible con GGUF. Para servidores, se puede usar llama-server con la flag `-c 4096` para limitar el contexto.
- Latencia y throughput: no hay datos publicados, pero al ser un modelo de 3B parametros, se espera una generacion de 20-40 tokens por segundo en GPU consumer con Q4_K_M, y 5-15 tokens por segundo en CPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| LFM2.5-VL-3B | 2.7B | 32K | LFM Open License v1.0 | GGUF, safetensors | OCR, UI, grounding, tool use |
| Qwen2.5-VL-3B-Instruct | 3.75B | 32K | Apache 2.0 (Qwen) | safetensors, GGUF | Vision general, OCR, video |
| SmolVLM2-2.2B | 2.2B | 8K | Apache 2.0 | safetensors, GGUF | Vision ligera para edge |
| InternVL2.5-4B | 4.1B | 32K | MIT | safetensors, GGUF | Vision general, grounding |

LFM2.5-VL-3B se diferencia de Qwen2.5-VL-3B por su enfasis especifico en comprension de pantallas y tool use, mientras que Qwen ofrece soporte de video. SmolVLM2 es mas ligero pero con contexto menor y menos capacidades de grounding. InternVL2.5-4B ofrece mejor rendimiento general en benchmarks pero es un 50% mas grande.

## Limitaciones y advertencias

- Licencia restrictiva: la LFM Open License v1.0 no es una licencia OSI aprobada. Es necesario revisar los terminos en la pagina del modelo base antes de usar el modelo en productos comerciales, especialmente en cuanto a obligaciones de atribucion y posibles restricciones de uso.
- Cuantizacion comunitaria no oficial: esta version GGUF es un trabajo no oficial de la comunidad. Liquid AI publica sus propios archivos GGUF oficiales en LiquidAI/LFM2.5-VL-3B-GGUF, que pueden tener diferencias de calidad o soporte.
- Rendimiento limitado en razonamiento visual complejo: la model card advierte que el modelo es menos adecuado para razonamiento visual de larga duracion o analisis de planos tecnicos muy detallados.
- Riesgo de alucinacion en OCR: como cualquier VLM, puede inventar texto en imagenes poco claras o con mucho ruido. Se recomienda validar la salida en aplicaciones criticas.
- Dependencia de versiones recientes de llama.cpp: al ser un modelo de vision con arquitectura `lfm2`, las versiones antiguas de llama.cpp pueden no cargarlo correctamente.
- Idiomas limitados a 17: aunque cubre los principales idiomas, no tiene soporte para lenguas minoritarias o africanas.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/NANI-Nithin/LFM2.5-VL-3B-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-VL-3B
- GGUF oficial de Liquid AI: https://huggingface.co/LiquidAI/LFM2.5-VL-3B-GGUF
- Documentacion del modelo: https://docs.liquid.ai/lfm/models/lfm25-vl-3b
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM2.5-VL-3B
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
