# imYChaudhary22/zen-polish-v22-lite

## Resumen

ZenPolish v2.2 Lite es un modelo de limpieza de dictado desarrollado por imYChaudhary22 (Yash Chaudhary) bajo el paraguas del proyecto ZenVoice. No es un modelo de propósito general: es un adaptador LoRA de rango 32 entrenado sobre el modelo base cuantizado `mlx-community/Qwen3-1.7B-4bit` para una única tarea de post-procesado de texto. Recibe la salida cruda de un sistema de reconocimiento automático del habla (ASR) y devuelve el mismo contenido con puntuación y mayúsculas restauradas, muletillas y falsos arranques eliminados, y las formas escritas de números, importes monetarios, fechas, horas, porcentajes, correos, URL y teléfonos normalizadas (inverse text normalization, ITN).

La relevancia técnica del modelo está en su formato de despliegue: se distribuye como un base 4-bit de 968 MB más un adaptador LoRA en bf16 de 70 MB que se aplican en vivo, sin fusionar. El autor advierte explícitamente de que fusionar el adaptador en los pesos degrada el comportamiento de forma medible (ITN de importes y borrado de muletillas). El conjunto ocupa 1,05 GB, con un pico de memoria de 1,19 GB durante la evaluación, y está pensado para inferencia totalmente local en Apple Silicon mediante MLX.

Respecto a la versión original v2.2 (`zen-polish-v22-4bit`, revisión `53bd03b`), esta variante Lite sustituye el base de 6-bit derivado de v2.1 por el base 4-bit limpio sobre el que se entrenó el adaptador, y almacena el adaptador en bf16 en lugar de fp32. Según la model card, el resultado es un 32 % menos de tamano, aproximadamente un 40 % más de velocidad de decodificación y mejor precisión en las suites de evaluación publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA; no es MoE |
| Parametros totales | 1.720.574.976 (1,7B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (la model card no la declara; el base Qwen3-1.7B tiene 32.768 tokens nativos, pero el adaptador se evalua con dictados cortos) |
| Tipos de cuantizacion | Base 4-bit (MLX, 968 MB) + adaptador LoRA en bf16 (70 MB); el adaptador no debe fusionarse |
| Idiomas soportados | No disponible en la informacion proporcionada; los ejemplos, el prompt de sistema y las fuentes del corpus (Hansard, Gutenberg, DisfluencySpeech, earnings-call) son en ingles |
| Licencia | Apache-2.0 (heredada de Qwen3-1.7B) |
| Formato de pesos | Safetensors en formato MLX; pesos base en `4bit` y adaptador PEFT/LoRA en `adapters/` (bf16) |

Datos adicionales: tamano del repositorio 1,0 GB; libreria `mlx`; pipeline `text-generation`; adapter LoRA con rango 32, alpha 64 y escala 2.0.

## Arquitectura y entrenamiento

El modelo es un Qwen3-1.7B cuantizado a 4 bits sobre el que se aplica un adaptador LoRA de rango 32, alpha 64 y escala 2.0. El entrenamiento usó decaimiento coseno de 1e-4 a 1e-6 sin warmup, dropout 0.05 y 3.500 iteraciones sobre un corpus de aproximadamente 90.000 pares procedentes de diez fuentes: pares de limpieza de dictado y pares de ASR real, muletillas intra-frase de DisfluencySpeech, entonación interrogativa de Hansard, ITN de importes de transcripciones de llamadas de resultados empresariales, patrones combinados de muletillas e importes de BudgieScribe, minería de exclamaciones de Gutenberg, objetivos expresivos de go_emotions, negativos de paso directo (identity passthrough) y el corpus reetiquetado de v2.1. El pipeline completo está en `training/data_v22/` del repositorio ZenVoice.

La innovación relevante no es arquitectónica sino de política de etiquetado y de empaquetado. El autor fija tres políticas de consistencia de etiquetas: borrado de muletillas en mitad de frase, conversión de cualquier importe monetario a formato `$` y preservación de la exclamación. En el plano operativo, mantiene el adaptador separado del base en lugar de fusionarlo, porque la fusión degrada mediblemente la ITN de importes y el borrado de muletillas. La decodificación es greedy (temperatura 0.0) con `enable_thinking=False`, es decir, se desactiva el modo de razonamiento de Qwen3.

## Capacidades

- Restauración de puntuación (F1 de 0,863 en eval_v500) y de mayúsculas, incluida la capitalización del inicio de frase (94,4 % en eval_v500).
- Eliminación de muletillas, tanto al inicio como en mitad de frase, y de falsos arranques.
- Normalización de texto inversa (ITN): números, importes monetarios, fechas, horas, porcentajes, correos electrónicos, URL y números de teléfono.
- Reparación gramatical que preserva el significado y, según la model card, la formulación original del hablante.
- Condicionamiento de estilo mediante una línea `app:` en el contexto: el modelo ajusta mayúsculas y tono al registro de la aplicación de destino.
- Salida restringida a texto limpio, sin comentarios ni explicaciones, adecuada para encadenar con otras herramientas.
- No soporta tool calling ni function calling, ni agentes multi-paso: es un transformador de texto de una sola pasada.
- Sin capacidades de visión, audio (opera sobre la transcripción, no sobre el audio) ni thinking mode (el prompt de sistema desactiva el razonamiento de Qwen3).
- Multilingue: no documentado; el comportamiento fuera del inglés no está evaluado.

## Casos de uso

- Post-procesado de dictado en aplicaciones nativas de Apple Silicon: integrado vía `mlx-swift-lm` con `LoRAContainer`, el pipeline del autor procesa un dictado en 0,23 s de media con un pico de 1,39 GB, lo que permite ejecución totalmente local sin enviar audio ni texto a la nube.
- Limpieza de transcripciones de reuniones: al recibir segmentos de ASR crudo, devuelve texto con puntuación y sin muletillas, reduciendo el número de tokens basura antes de pasarlo a un LLM de resumen o a un sistema de actas.
- Entrada de voz para formularios y ERP: la ITN convierte "dos mil quinientos dólares con cincuenta" en `$2,500.50`, lo que evita errores de parseo en campos numéricos de gastos, facturación o inventario dictados por voz.
- Cumplimentación de datos de contacto en CRM: los números de teléfono, correos y URL dictados se restauran a su forma escrita, reduciendo la corrección manual posterior.
- Preprocesado para pipelines RAG o de búsqueda: normalizar y puntuar transcripciones antes de la indexación mejora la segmentación en frases y la calidad de los embeddings, con un coste computacional muy bajo (1,05 GB en disco).
- Herramienta de limpieza por lotes en macOS para investigadores: cargable con `mlx-lm` (`load(path, adapter_path=...)`) y decodificación greedy, sirve para normalizar corpus de transcripciones de forma reproducible y offline.
- Adaptación de tono por aplicación: en un cliente de mensajería frente a un cliente de correo, la línea `app:` permite que el mismo dictado se formatee con registro informal o formal sin cambiar de modelo.
- Generación de subtítulos: inserción de puntuación y mayúsculas en segmentos de ASR ya alineados temporalmente, manteniendo el texto por segmento.

## Benchmarks y rendimiento

Suite de 500 dictados (`eval_v500`, con control de fuga de datos), decodificación greedy, Apple M5, MLX 0.32.2:

| Metrica | Lite | v2.2 original (`53bd03b`) |
|---|---|---|
| WER | 5,5 % | 6,7 % |
| Exact match | 65,8 % | 53,6 % |
| Punct F1 | 0,863 | 0,759 |
| Inicio de frase correcto | 94,4 % | 91,6 % |
| Tamano del bundle | 1,05 GB | 1,55 GB |
| Memoria pico | 1,19 GB | 1,77 GB |
| Velocidad de decodificacion | 73 tok/s | 51 tok/s |

Runtime de la app ZenVoice (`mlx-swift-lm`, pipeline de formateo propio, eval_v500), con el original v2.2 entre parentesis: WER 4,0 % (4,7 %), exact match 65,4 % (43,2 %), 0,23 s de media por dictado (0,27 s), memoria pico 1,39 GB (1,94 GB).

Suite de 234 filas con control de fuga, tal como se publico para v2.2:

| Metrica | v2.2 | v3 (4B) | v2.1 | v2 | Qwen3-1.7B stock |
|---|---|---|---|---|---|
| WER | 9,9 % | 17,2 % | 12,6 % | 30,5 % | 11,0 % |
| Exact match | 50,4 % | 41,0 % | 29,9 % | 23,1 % | 5,0 % |
| Punct F1 | 0,832 | 0,750 | 0,573 | 0,649 | 0,634 |
| Precision de mayusculas | 98,3 % | 95,6 % | 97,0 % | 92,4 % | 96,3 % |
| Inicio de frase | 90,9 % | 80,7 % | 86,2 % | 62,1 % | 74,9 % |
| Alucinacion | 0,0–7,2 % | 10,8 % | 7,2 % | 23,0 % | 0,9 % |

En esa misma suite de 234 filas, la variante Lite con adaptador bf16 obtiene WER 9,7 %, exact match 50,4 % y Punct F1 0,831. No se han publicado resultados en benchmarks de propósito general (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 1,19 GB de pico en la evaluacion con `mlx-lm` y 1,39 GB en el runtime de la app; el bundle en disco es de 1,05 GB (base 4-bit 968 MB + adaptador bf16 70 MB).
- Plataforma: MLX requiere Apple Silicon; todas las mediciones publicadas se hicieron en un Apple M5 con MLX 0.32.2. No hay datos para GPU CUDA ni ROCm.
- Cabe holgadamente en cualquier Mac con Apple Silicon (M1 o posterior) con 8 GB de memoria unificada; no se ha validado en iPhone/iPad en la informacion disponible, aunque el destino declarado es on-device.
- Despliegue: `mlx-lm` en Python (`load` con `adapter_path`) y `mlx-swift-lm` con `LoRAContainer` en Swift. No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama; el formato es safetensors MLX y no hay instrucciones de conversion a GGUF.
- Rendimiento: 73 tok/s de decodificacion en M5 y 0,23 s de media por dictado en el pipeline de la app. Throughput en lote no disponible.
- El adaptador debe cargarse en vivo; fusionarlo en los pesos degrada la calidad (ITN de importes y borrado de muletillas).

## Comparativa con modelos similares

| Modelo | Parametros | Base | Tamano | WER (eval_v500) | Exact match | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| zen-polish-v22-lite | 1,7B | Qwen3-1.7B-4bit | 1,05 GB | 5,5 % | 65,8 % | Apache-2.0 | MLX (adaptador separado) |
| zen-polish-v22-4bit (original) | 1,7B | derivado de v2.1, 6-bit | 1,55 GB | 6,7 % | 53,6 % | Apache-2.0 | MLX |
| zen-polish-v32-4bit | 4B | Qwen3-4B | no disponible | no disponible (WER 17,2 % en la suite de 234) | no disponible (41,0 % en la suite de 234) | Apache-2.0 | MLX |
| Qwen3-1.7B stock (sin adaptador) | 1,7B | Qwen3-1.7B | no disponible | 11,0 % en la suite de 234 | 5,0 % en la suite de 234 | Apache-2.0 | safetensors estandar |

La comparacion con el base sin adaptar es la mas informativa: el LoRA reduce el WER relativo del 11,0 % al 9,9 % y multiplica por diez el exact match (5,0 % a 50,4 %) en la suite de 234 filas, con una mejora de Punct F1 de 0,634 a 0,832. No se dispone de comparaciones con modelos de limpieza de dictado de otros autores.

## Limitaciones y advertencias

- Modelo de tarea unica: no es un asistente general; no soporta tool calling, agentes ni razonamiento multi-paso, y su prompt de sistema asume la funcion de limpieza de dictado.
- Idiomas no declarados: el corpus y las evaluaciones son en ingles; el comportamiento en castellano u otras lenguas es desconocido y no esta validado.
- Alucinacion no nula: la model card reporta un rango del 0,0 % al 7,2 % en la suite de 234 filas, dependiendo del conjunto evaluado; en produccion conviene validar la salida contra la entrada (por ejemplo, comparando longitudes o tokens numericos).
- Discrepancia entre suites: el WER pasa de 5,5 % en eval_v500 a 9,7-9,9 % en la suite de 234 filas; hay que elegir la metrica de referencia antes de fijar expectativas.
- Politicas de etiquetado deliberadas que pueden no encajar con todos los productos: todo importe monetario se convierte a formato `$` con separador de miles anglosajon, y las muletillas intra-frase se eliminan siempre, lo que puede borrar interjecciones con carga semantica.
- Fusionar el adaptador en los pesos degrada la calidad; el despliegue debe mantener base y LoRA separados y cargar el adaptador en tiempo de inferencia.
- Dependencia de plataforma: solo MLX/Apple Silicon; no hay ruta documentada a CUDA, vLLM, llama.cpp u Ollama.
- Adopcion practicamente nula: 0 descargas y 0 likes en el momento de la consulta, sin issues ni validacion independiente de terceros; el autor es el unico origen de todas las cifras.
- El modelo base se distribuye en 4-bit, por lo que hereda la perdida de precision de la cuantizacion respecto al Qwen3-1.7B en bf16.
- Licencia Apache-2.0 permisiva para uso comercial, pero las fuentes de datos declaradas incluyen Hansard, Gutenberg y go_emotions; el autor afirma usar solo material MIT/Apache-2.0/CC-BY-4.0/CC0 y remite la lista de atribuciones al repositorio ZenVoice, que no forma parte de la informacion disponible para verificar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/imYChaudhary22/zen-polish-v22-lite
- Version original v2.2 (6-bit): https://huggingface.co/imYChaudhary22/zen-polish-v22-4bit
- Version v2.1 (1.7B, 4-bit): https://huggingface.co/imYChaudhary22/zen-polish-v2-1.7b-4bit
- Version de 4B (v3.2): https://huggingface.co/imYChaudhary22/zen-polish-v32-4bit
- Modelo base: https://huggingface.co/mlx-community/Qwen3-1.7B-4bit
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-1.7B/blob/main/LICENSE
- Perfil de GitHub del autor: https://github.com/imYChaudhary22/
- Ficha en free2aitools: https://free2aitools.com/model/imychaudhary22/zen-polish-v22-4bit
- Ficha en llm-explorer: https://llm-explorer.com/model/imYChaudhary22%2Fzen-polish-v2-1.7b-4bit,56AROxVWtO1FYoLTMr3YHg
