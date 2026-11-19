# saidutta69/LFM2.5-VL-3B-heretic

## Resumen
LFM2.5-VL-3B-heretic es una variante "descensurada" (abliterada) del modelo vision-lenguaje LiquidAI/LFM2.5-VL-3B, publicada por el usuario saidutta69 en Hugging Face. Emplea la tecnica de ablacion direccional implementada en Heretic v1.4.0 para suprimir el comportamiento de rechazo mediante ediciones quirurgicas de pesos en las proyecciones de salida de atencion y en las down-projections del MLP del torre de lenguaje, sin reentrenar ni hacer fine-tuning. El resultado conserva intactas las capacidades del modelo base: grounding visual, OCR de pagina completa con anotacion de layout, entrada multi-imagen y tool calling.

El modelo mantiene la arquitectura hibrida del backbone de texto de Liquid (convoluciones y atencion combinadas) junto con el torre de vision SigLIP2 NaFlex. Con 3.123.483.888 parametros totales (2,70B de texto, 0,41B de vision SigLIP2 y 0,01B de proyector), esta disenado para despliegue en el borde y en dispositivos locales con requisitos modestos de VRAM. La ventana de contexto es de 32.768 tokens y soporta 16 idiomas.

Es relevante ahora porque demuestra que es posible reducir drasticamente los rechazos (de 100/100 a 6/100 en el conjunto de evaluacion del autor) con una divergencia KL moderada (0,0645) sin degradar el resto de capacidades del modelo, y porque distribuye pesos en safetensors y GGUF multimodal completamente funcional (texto y vision), lo que facilita su uso en llama.cpp y entornos locales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida conv+attention (LFM2.5 text backbone) con torre de vision SigLIP2 NaFlex |
| Parametros totales | 3.123.483.888 (2,70B texto + 0,41B vision + 0,01B proyector) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | GGUF: Q4_K_M, Q5_K_M, Q6_K, Q8_0; F16 para mmproj |
| Idiomas soportados | EN, AR, ZH, FR, DE, IT, JA, KO, PT, ES, VI, TH, ID, HI, RU, PL (16) |
| Licencia | lfm1.0 (other) |
| Formato de pesos | safetensors, GGUF (texto + `LFM2.5-VL-3B-heretic-mmproj-F16.gguf` separado) |

## Arquitectura y entrenamiento
El modelo conserva la arquitectura del base LiquidAI/LFM2.5-VL-3B: un backbone de texto hibrido que combina capas convolucionales con atencion, junto con un torre de vision SigLIP2 NaFlex de 426.285.296 elementos y un proyector que fusiona ambas modalidades. El tower de vision no esta cuantizado y se distribuye como mmproj F16 independiente (0,85 GB). El GGUF de texto contiene el torre de lenguaje completo (266 tensores, 30 bloques) y el GGUF del proyector incluye los metadatos de tiling que llama.cpp necesita para reproducir el preprocesado de imagen original (min_tiles 2, max_tiles 10, tile_size 512, max_pixels_tolerance 2.0).

No se realizo fine-tuning. La modificacion se aplica mediante abliteracion direccional: se identifican las direcciones de pesos responsables del comportamiento de rechazo y se editan las proyecciones `attn.o_proj` y `mlp.down_proj` del torre de lenguaje con los parametros documentados (trial 67 de 200, seed 3853387823, direction_index por capa). Los coeficientes aplicados incluyen max_weight 1,078 y min_weight 0,698 para atencion, y max_weight 1,332 y min_weight 0,750 para MLP, con distancias de 8,406 y 14,053 respectivamente. Este enfoque preserva el formato de tool-call, el comportamiento OCR y el torre de vision, evitando la degradacion de coherencia tipica de un fine-tuning sobre un modelo alineado con RLHF.

## Capacidades
- Generacion de texto y conversacion multi-turno.
- Razonamiento visual y respuesta a preguntas sobre imagenes (VQA).
- Grounding visual: localizacion de objetos mediante consultas en lenguaje natural con bounding boxes.
- OCR de pagina completa con anotacion de regiones de layout.
- Comprension de capturas de pantalla e interfaces de usuario.
- Lectura e interpretacion de graficos y tablas (ChartQA).
- Entrada multi-imagen en una misma peticion.
- Tool calling y function calling (ToolSandBox, BFCLv4).
- Capacidades multilingues en 16 idiomas.
- Supresion de rechazos mediante abliteracion: responde a prompts que el base declinaba (6/100 rechazos frente a 100/100 del original).
- No incluye modo thinking explicito ni capacidades de audio segun la informacion disponible.

## Casos de uso
- Digitalizacion de documentos con OCR y layout: el modelo puede procesar paginas completas, extraer texto y devolver regiones anotadas con coordenadas, adecuado para pipelines de facturacion, contratos o formularios donde se necesita estructura ademas de texto plano.
- Automatizacion de soporte sobre capturas de pantalla: con ScreenSpot-v2 de 80,7 en el base, puede interpretar pantallas de aplicaciones y responder preguntas del usuario sobre elementos de la interfaz, util para asistentes de helpdesk que reciben imagenes.
- Grounding en imagenes para anotacion semiautomatica: dado un dataset de imagenes y consultas en lenguaje natural, genera bounding boxes (RefCOCO Macro Prec@1 de 87,9) para preetiquetar datos de entrenamiento de detectores.
- Analisis de graficos en informes: con ChartQA de 81,3 en el base, puede extraer valores y tendencias de graficos de barras o lineas en documentos financieros o cientificos.
- Agentes locales con tool calling: con ToolSandBox de 59,5 y BFCLv4 de 32,5 en el base, puede integrarse en flujos de agente que consultan APIs o ejecutan funciones, siempre en escenarios de un solo turno o alta throughput segun la recomendacion de Liquid.
- Despliegue en dispositivo con recursos limitados: el par Q4_K_M (1,67 GB texto) mas mmproj (0,85 GB) ocupa 2,53 GB, por lo que cabe en GPU de 6 GB o sistemas con 8 GB de memoria unificada, habilitando asistentes visuales offline en portatiles o equipos de borde.
- Moderacion y generacion de contenido sin rechazos: al suprimir el comportamiento de rechazo, puede emplearse en entornos donde el base declinaba sistematicamente, aunque esto exige controles de seguridad propios por parte del operador.

## Benchmarks y rendimiento

| Benchmark | LFM2.5-VL-3B (base) |
|---|---|
| ScreenSpot-v2 | 80,7 |
| RefCOCO (Macro Prec@1) | 87,9 |
| BLINK | 61,5 |
| MuirBench | 58,3 |
| ToolSandBox | 59,5 |
| BFCLv4 | 32,5 |
| MME | 73,1 |
| MMStar | 63,3 |
| RealWorldQA | 73,1 |
| CountBenchQA | 87,3 |
| MMMB | 83,0 |
| MM-IF Eval | 60,6 |
| MathVista | 68,5 |
| MMMU Pro | 30,5 |
| ChartQA | 81,3 |
| OCRBenchv2 (English subset) | 47,5 |
| POPE | 88,7 |

Metricas de la abliteracion:

| Metrica | Este modelo | Modelo original |
|---|---|---|
| Divergencia KL | 0,0645 | 0 (por definicion) |
| Rechazos | 6/100 | 100/100 |

Las puntuaciones de benchmarks corresponden al modelo base publicado por Liquid; la abliteracion solo elimina direcciones de rechazo segun el autor, por lo que describen la capacidad subyacente y no una nueva evaluacion de este checkpoint. No se han publicado resultados de benchmarks especificos del checkpoint abliterado en la informacion disponible.

## Requisitos de hardware

| Hardware | Cuantizacion recomendada | Pesos texto | Texto + vision |
|---|---|---|---|
| GPU 6 GB / 8 GB unificada | Q4_K_M | 1,67 GB | 2,53 GB |
| GPU 8 GB | Q5_K_M | 1,94 GB | 2,79 GB |
| GPU 12 GB | Q6_K | 2,22 GB | 3,08 GB |
| GPU 16 GB+ / solo CPU | Q8_0 | 2,87 GB | 3,73 GB |

- Anadir aproximadamente 1-2 GB de overhead de KV y activaciones.
- Liquid reporta unos 3,3 GB residentes para el modelo sin cuantizar.
- El par Q4_K_M cabe comodamente en una GPU de 6 GB.
- El tower de vision se distribuye como mmproj F16 de 0,85 GB separado y debe cargarse junto al GGUF de texto para entrada de imagen.
- Opciones de despliegue: llama.cpp (GGUF con mmproj), Ollama (si se empaqueta), transformers con safetensors, vLLM y TGI segun compatibilidad del modelo base (no confirmado en la informacion disponible para esta variante).
- Throughput y latencia estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos | KL | Licencia |
|---|---|---|---|---|---|
| LFM2.5-VL-3B-heretic (este) | 3,12B | 32.768 | 6/100 | 0,0645 | lfm1.0 |
| LiquidAI/LFM2.5-VL-3B (base) | 3,12B | 32.768 | 100/100 | 0 (por definicion) | lfm1.0 |
| LFM2.5-VL-450M-heretic (hermano) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Granite-4.2-3B (referencia de KL en la model card) | no disponible | no disponible | no disponible | 0,0095 | no disponible |
| Qwen3-4B-Thinking-heretic (referencia de KL) | no disponible | no disponible | no disponible | 0,0011 | no disponible |

La comparativa de KL sirve como referencia de agresividad de la edicion: 0,0645 es mas laxa que granite-4.2-3b (0,0095) y Qwen3-4B-Thinking (0,0011), y mas ajustada que granite-4.1-3b (0,0852) y gemma-4-E2B (0,1841), segun los datos del autor.

## Limitaciones y advertencias
- La abliteracion suprime rechazos pero no elimina sesgos ni conocimiento danino del modelo base; el operador debe implementar sus propios filtros de seguridad.
- No es adecuada para tareas de contexto largo o razonamiento intensivo; Liquid recomienda esta familia para tareas de un solo turno, alto throughput y baja latencia.
- Liquid advierte contra su uso en diseno web visual o preguntas tecnicas sobre planos de alta complejidad.
- Contexto limitado a 32.768 tokens, inferior al de modelos de contexto largo.
- MMMU Pro de 30,5 y BFCLv4 de 32,5 en el base indican capacidad limitada en razonamiento multimodales complejos y function calling avanzado.
- El OCRBenchv2 (English subset) de 47,5 sugiere margen de mejora en OCR fuera de condiciones controladas.
- Licencia lfm1.0: revisar los terminos del enlace de licencia antes de uso comercial; el autor etiqueta como "other".
- La evaluacion de rechazos (6/100) es la reportada por el autor con su propio conjunto de prompts; no es una garantia de comportamiento en produccion.
- El GGUF de vision requiere cargar dos archivos (texto y mmproj); un uso incorrecto puede deshabilitar la entrada de imagen.
- Divergencia KL de 0,0645 implica cambios medibles en la distribucion de salida respecto al base, con posible degradacion en tareas especificas no evaluadas.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/saidutta69/LFM2.5-VL-3B-heretic
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-VL-3B
- Licencia: https://huggingface.co/LiquidAI/LFM2.5-VL-3B/blob/main/LICENSE
- Heretic (repo): https://github.com/p-e-w/heretic
- Modelo hermano 450M: https://huggingface.co/saidutta69/LFM2.5-VL-450M-heretic
- Modelo texto 1.2B: https://huggingface.co/saidutta69/LFM2.5-1.2B-Instruct-heretic
- Modelo Qwen3-4B-Thinking-heretic: https://huggingface.co/saidutta69/Qwen3-4B-Thinking-heretic
