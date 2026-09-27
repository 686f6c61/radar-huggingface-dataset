# danush99/Model_LightOnOCR-Sin-Handwritten-Text

## Resumen

Este repositorio contiene un adaptador LoRA entrenado con QLoRA sobre el modelo base `lightonai/LightOnOCR-2-1B`, orientado al reconocimiento optico de caracteres (OCR) de texto manuscrito en cingales (sinhala). Lo publica el usuario `danush99` (Hewagama), y su objetivo es cubrir un nicho concreto: la transcripcion de palabras y lineas manuscritas en una lengua de bajos recursos, un escenario en el que los sistemas OCR genericos rinden muy mal.

El modelo base, LightOnOCR-2-1B, es un modelo vision-lenguaje compacto de aproximadamente mil millones de parametros disenado para OCR y comprension de documentos de extremo a extremo, sin etapas separadas de deteccion o segmentacion de texto. Sobre esa base se aplica un adaptador PEFT, de modo que el repositorio publicado no contiene los pesos completos, sino unicamente el delta LoRA (0,2 GB en total).

La relevancia de esta ficha esta en su especializacion: el autor parte de un adaptador previo de OCR cingales impreso (`avishadilhara/sinhala-lightonocr-2-1b-Qlora`) y lo fine-tunea sobre el split SinOCR-Handwritten (908 muestras de entrenamiento y 227 de test, recortes de palabras y lineas). El resultado numerico del adaptador no esta publicado en la model card, que remite a un fichero `RESULTS.json` no incluido en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (entrenado con QLoRA) sobre un modelo vision-lenguaje de OCR de extremo a extremo (LightOnOCR-2-1B) |
| Parametros totales | Modelo base de aproximadamente 1.000 millones de parametros segun su denominacion; el numero exacto de parametros entrenables del adaptador no esta disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Entrenamiento con cuantizacion 4-bit NF4 (QLoRA); el adaptador se distribuye en precision completa (fp/bf16). No se detallan otras opciones de cuantizacion |
| Idiomas soportados | Cingales (sinhala, codigo `si`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA; no incluye los pesos del modelo base) |

## Arquitectura y entrenamiento

El adaptador se construye sobre LightOnOCR-2-1B, un modelo vision-lenguaje end-to-end para OCR y comprension de documentos. A diferencia de las arquitecturas OCR clasicas en dos etapas (deteccion de texto y posterior reconocimiento), este tipo de modelo procesa la imagen completa y genera el texto directamente, lo que simplifica el pipeline de inferencia. El repositorio aqui descrito es exclusivamente un adaptador, no un modelo completo: los pesos del backbone deben descargarse por separado.

El entrenamiento se realizo con QLoRA en 4 bits (NF4), con rango r=32, alpha=64 y dropout de 0,1, en bfloat16 y con resolucion nativa `longest_edge=1540`. Se calento el modelo a partir del adaptador de texto impreso `avishadilhara/sinhala-lightonocr-2-1b-Qlora` y despues se ajusto sobre el split SinOCR-Handwritten. Todo el ajuste se llevo a cabo en una unica GPU T4 de Kaggle. La metrica declarada es el CER (Character Error Rate) calculado como `(S+D+I)/N` sobre puntos de codigo Unicode. El valor obtenido por este adaptador no se incluye en la model card, que remite a un fichero `RESULTS.json` externo.

## Capacidades

- Reconocimiento de texto manuscrito en cingales sobre recortes de palabras y lineas.
- Transcripcion imagen-a-texto dentro de un pipeline vision-lenguaje (entrada de imagen, salida de texto).
- Reutilizacion del conocimiento de OCR impreso del adaptador base, al haberse calentado desde un adaptador de texto impreso en cingales.
- Capacidad de combinar o continuar el ajuste: al ser un adaptador PEFT, puede fusionarse con el backbone o con otros adaptadores.
- Soporte de tool calling / function calling: no disponible (no se declara).
- Soporte de agentes y razonamiento multi-paso: no disponible (el modelo esta orientado a transcripcion).
- Capacidades multilingues: no; el adaptador esta especializado unicamente en cingales.
- Capacidades especiales: no se declaran modos de pensamiento, vision general, audio ni otras funciones mas alla del OCR.

## Casos de uso

- Digitalizacion de manuscritos historicos cingaleses: el adaptador permite transcribir recortes de lineas y palabras de documentos manuscritos que los motores OCR genericos no reconocen, alimentando posteriormente un corpus textual buscable.
- Extraccion de datos de formularios manuscritos: en tramites administrativos o censos con anotaciones a mano, el modelo convierte los campos manuscritos en texto estructurado para su volcado a base de datos.
- Preprocesado en pipelines de OCR por etapas: al operar sobre recortes de palabra y linea, encaja como etapa de reconocimiento despues de un detector de texto propio, sustituyendo motores como Tesseract en la fase de lectura.
- Investigacion en OCR de lenguas de bajos recursos: sirve como punto de partida reproducible (908 ejemplos de entrenamiento) para experimentos de ajuste fino con recursos limitados, dado que se entreno en una sola T4.
- Normalizacion de datasets cingaleses: transcripcion masiva de imagenes para construir conjuntos de datos etiquetados de escritura manuscrita.
- Asistencia a la transcripcion manual: como primera pasada automatica que un revisor humano corrige, reduciendo el tiempo de tecleo frente a la transcripcion desde cero.
- Base para nuevos ajustes de dominio: al ser un adaptador ligero sobre un backbone de 1B, puede reentrenarse o combinarse con otros adaptadores para dominios concretos (caligrafias, tipos de documento).

## Benchmarks y rendimiento

La model card incluye una tabla comparativa de CER sobre el split de test SinOCR-Handwritten (227 imagenes). El valor del propio adaptador no se proporciona en la informacion disponible, ya que la card remite a un `RESULTS.json` externo.

| Sistema | CER manuscrito |
|---|---|
| TrOCR (solo impreso) | 0,9940 |
| Tesseract (preentrenado) | 0,9493 |
| Google Vision API | 0,7532 |
| Tesseract (impreso + manuscrito) | 0,7204 |
| TrOCR (impreso -> manuscrito) | 0,5253 |
| Este adaptador | no publicado (remite a `RESULTS.json`) |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y no son aplicables a un modelo de OCR.

## Requisitos de hardware

- VRAM para el adaptador: aproximadamente 0,2 GB en disco (pesos LoRA); el consumo en memoria es marginal frente al backbone.
- VRAM del modelo base: alrededor de 2-2,5 GB de pesos en bfloat16 para un backbone de ~1.000 millones de parametros, mas el codificador visual y las activaciones; en la practica, unos 4-6 GB de VRAM en inferencia bf16 y en torno a 1-2 GB si se cuantiza a 4 bits.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM funciona con holgura. El propio autor entreno el adaptador en una T4 (16 GB). Tarjetas como RTX 3060 12 GB, RTX 4060 Ti, RTX 4090, A100 o H100 son suficientes y sobredimensionadas para inferencia.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna con 6-8 GB o mas de VRAM, e incluso en configuraciones cuantizadas de gama baja.
- Opciones de despliegue: se requiere `transformers==5.0.0` (las clases de LightOnOCR se incorporan en la version 5.x) junto con PEFT y `AutoModelForImageTextToText`. El uso de vLLM, TGI, Ollama o llama.cpp para este adaptador concreto no esta documentado en la informacion disponible.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | CER manuscrito (SinOCR) | Licencia |
|---|---|---|---|---|---|
| danush99/Model_LightOnOCR-Sin-Handwritten-Text | Adaptador LoRA sobre VLM de OCR | Backbone ~1.000 M | no disponible | no publicado | apache-2.0 |
| lightonai/LightOnOCR-2-1B | VLM de OCR de proposito general | ~1.000 M | no disponible | no aplica (no especializado en cingales) | apache-2.0 |
| TrOCR (ajustado impreso -> manuscrito) | Modelo OCR encoder-decoder | no disponible | no disponible | 0,5253 | no disponible |
| Tesseract (impreso + manuscrito) | Motor OCR clasico | no aplica | no aplica | 0,7204 | Apache 2.0 |

El adaptador se posiciona frente a motores como Tesseract o TrOCR en el dominio especifico del cingales manuscrito, pero su ventaja cuantitativa no puede confirmarse porque su CER no esta publicado.

## Limitaciones y advertencias

- El CER del adaptador no se publica en la model card; no es posible verificar la mejora frente a los sistemas de la tabla comparativa.
- El conjunto de entrenamiento es muy reducido (908 imagenes) y el de test tambien (227), por lo que el rendimiento puede no generalizar a otras caligrafias, escaneos o condiciones de imagen.
- El modelo trabaja con recortes de palabras y lineas, no con paginas completas; se necesita una etapa previa de deteccion y segmentacion de texto.
- Esta especializado exclusivamente en cingales; no ofrece OCR multilingue ni traduccion.
- Al ser un modelo de transcripcion, puede producir sustituciones, omisiones o inserciones en caracteres ambiguos, especialmente con caligrafias no representadas en los datos.
- El repositorio contiene solo el adaptador; los pesos del backbone deben obtenerse por separado, lo que implica descargar tambien su licencia y condiciones.
- Requiere `transformers==5.0.0`; versiones anteriores no incluyen las clases de LightOnOCR y pueden fallar.
- No se declaran usos prohibidos, pero al depender del modelo base conviene revisar tambien las condiciones de `lightonai/LightOnOCR-2-1B`.
- El autor no documenta sesgos especificos del conjunto de datos ni su procedencia detallada, mas alla del nombre del split.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/danush99/Model_LightOnOCR-Sin-Handwritten-Text
- Modelo base: https://huggingface.co/lightonai/LightOnOCR-2-1B
- Perfil del autor: https://huggingface.co/danush99
- Adaptador previo de texto impreso en cingales: https://huggingface.co/avishadilhara/sinhala-lightonocr-2-1b-Qlora
- Modelo relacionado del mismo autor (TrOCR cingales manuscrito): https://huggingface.co/danush99/Model_TrOCR-Sin-Handwritten-Text
- Documentacion de LightOnOCR en transformers: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/lighton_ocr.md
- Articulo sobre LightOnOCR-2-1B: https://medium.com/data-science-in-your-pocket/lightonocr-2-1b-best-ocr-model-beats-deepseek-ocr-55871623e0a6
- Articulo sobre LightOnOCR de primera generacion: https://medium.com/data-science-in-your-pocket/lightonocr-fastest-ocr-ai-beats-deepseek-ocr-paddleocr-1fe2f0a2f1ad
