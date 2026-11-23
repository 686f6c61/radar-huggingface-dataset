# amDANIEL2024/kintu_base

## Resumen

`kintu_base` es un modelo de traduccion automatica encoder-decoder de tipo Transformer, con 89 millones de parametros, desarrollado por Amanyire Daniel (usuario `amDANIEL2024`). Resuelve la traduccion bidireccional entre runyankole (codigo ISO `nyn`), una lengua bantú hablada en el suroeste de Uganda, y el ingles. La direccion de traduccion se controla mediante un token de prefijo en el texto de origen (`<2eng>` para traducir a ingles y `<2nyn>` para traducir a runyankole).

El modelo es explicitamente una base preentrenada y no un traductor finalizado: se ha entrenado unicamente con pares generados por traduccion automatica (la columna en runyankole del dataset `tulati` es salida de `Sunbird/translate-nllb-1.3b-salt`, no texto humano). El autor publica por separado una version ajustada, `amDANIEL2024/kintu_finetuned`.

Es relevante por su caracter de recurso de bajos recursos: cubre un par de idiomas practicamente ausente en los modelos multilingues comerciales, con una huella de solo 0,4 GB y licencia MIT, lo que permite desplegarlo en hardware muy modesto. No es un modelo de `transformers`: requiere su propio codigo de inferencia (`kintu.py`) incluido en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder pre-LN, 6 + 6 capas, d_model 640, 8 cabezas, FFN 2560, activacion GELU |
| Parametros totales | 89.418.240 (89M); embeddings de entrada, de decodificador y proyeccion de salida atados |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 posiciones (codificacion sinusoidal); los pares de entrenamiento se limitaron a 128 piezas por lado |
| Tipos de cuantizacion | no disponible (pesos publicados en float32; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | runyankole (`nyn`) e ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `model.safetensors` (float32) |
| Tokenizador | SentencePiece compartido, 32.000 piezas (`spm.model`) |
| Libreria | PyTorch (modelo propio, no compatible con `AutoModel`) |
| Tamano del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

Se trata de un Transformer encoder-decoder clasico con normalizacion previa a cada subcapa (pre-LN), seis capas en el codificador y seis en el decodificador, dimension de modelo 640, ocho cabezas de atencion, capa feed-forward de 2560 y activacion GELU. Los embeddings de entrada, de decodificador y la proyeccion de salida estan atados, lo que explica que el recuento total sea de 89M parametros. El tokenizador es un SentencePiece compartido de 32.000 piezas entrenado solo con texto en runyankole e ingles. La codificacion posicional es sinusoidal con un maximo de 256 posiciones.

El entrenamiento se realizo exclusivamente sobre los pares runyankole-ingles del dataset `tulati`, en ambas direcciones. El proceso de filtrado descrito en la model card parte de 1.534.699 filas, descarta 35.277 por las banderas de calidad de `tulati` (vacio, degenerado, parece-ingles, longitud atipica), elimina 1.408 pares con lados identicos y 0 duplicados exactos, y tras descontaminar contra el split de desarrollo y test de SALT queda en 1.498.013 pares, de los cuales 1.999 se reservan para validacion. El preentrenamiento consistio en 5 epocas y 19.983 pasos de optimizador (unos 25.000 tokens objetivo por paso), en fp16 sobre una unica GPU Kaggle T4, con AdamW, label smoothing de 0,1, calentamiento lineal y decaimiento inverso a la raiz cuadrada, con LR pico de 3e-4. No se documenta RLHF ni DPO; el modelo no ha visto datos traducidos por humanos.

## Capacidades

- Traduccion runyankole a ingles y ingles a runyankole con un unico modelo, seleccionando la direccion mediante prefijo (`<2eng>` / `<2nyn>`).
- Traduccion por lotes: la funcion `translate` acepta una cadena o una lista de cadenas.
- Decodificacion con busqueda por haces (beam search), con valor por defecto de 4.
- Traduccion a nivel de frase, con entradas de hasta aproximadamente 128 piezas antes de truncarse o degradarse.
- Inferencia en GPU si esta disponible y en CPU en caso contrario, mediante el codigo `kintu.py` del repositorio.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Traduccion de documentacion comunitaria: traduccion de guias sanitarias o agricolas del ingles al runyankole para su revision posterior por hablantes nativos, aprovechando que el modelo cabe en cualquier GPU de consumo.
- Preetiquetado de corpus para anotacion humana: generacion de traducciones iniciales que linguistas revisan y corrigen, lo que acelera la creacion de datos humanos en un par de idiomas con recursos escasos.
- Busqueda translingue en pequena escala: traduccion de consultas de usuario en runyankole al ingles para consultar indices o bases de datos existentes en ingles.
- Prototipado de aplicaciones de traduccion en entornos con hardware limitado: su tamano de 0,4 GB y su licencia MIT permiten integrarlo en servicios modestos o en dispositivos con pocos recursos.
- Investigacion en traduccion de bajos recursos: linea base reproducible para comparar tecnicas de aumento de datos, filtrado o ajuste fino sobre el par nyn-eng.
- Traduccion de subtitulos o mensajes cortos en contextos de mensajeria, siempre con revision humana dada la longitud limitada de contexto y la calidad del dato de origen.
- Generacion de pares sinteticos adicionales para entrenar otros modelos, usando `kintu_base` como generador y filtrando despues con criterios de calidad.

## Benchmarks y rendimiento

Los unicos datos publicados son comprobaciones rapidas al final del preentrenamiento (paso 19.983), con chrF++ codicioso sobre las primeras 128 frases. El autor advierte que no son comparables con puntuaciones sobre el conjunto completo. No se han ejecutado las evaluaciones completas de SALT dev/test para esta base.

| Conjunto | Direccion | Perdida | chrF++ rapido (greedy, primeras 128 frases) |
|---|---|---|---|
| Validacion de tulati (pares traduccion automatica) | nyn→eng | 1,951 | 44,39 |
| Validacion de tulati (pares traduccion automatica) | eng→nyn | 1,013 | 61,53 |
| SALT dev (traducciones humanas) | nyn→eng | 2,223 | 39,93 |
| SALT dev (traducciones humanas) | eng→nyn | 2,887 | 48,80 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks generales en la informacion disponible, y no procede esperarlos dado que el modelo solo realiza traduccion.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (89M parametros, unos 358 MB de pesos), mas el espacio de activaciones y del tokenizador.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria; el propio autor lo entreno en una T4. Funciona tambien en CPU.
- Cabe holgadamente en GPU de consumo: GTX 1650, RTX 3050, RTX 4060, RTX 4090, entre otras.
- Opciones de despliegue: el codigo propio `kintu.py` con PyTorch; no es compatible con vLLM, TGI, llama.cpp ni Ollama en su forma actual, al no ser un modelo de `transformers` ni publicarse en GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por su tamano, se espera una latencia baja en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| kintu_base | 89M | 256 posiciones | nyn, en | MIT | safetensors (PyTorch propio) |
| Sunbird/translate-nllb-1.3b-salt | 1.300M (aproximado, no confirmado en la informacion) | no disponible | multilingue, incluye nyn | MIT (segun la model card de kintu_base) | no disponible |
| NLLB-200 (familia) | 600M a 54B segun variante | 512 tokens en las variantes estandar | 200 idiomas, incluye nyn | CC-BY-NC-4.0 en la mayoria de variantes | safetensors, transformers |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada; la comparacion se limita a parametros, contexto y licencia. `kintu_base` es ordenes de magnitud menor que NLLB o que el modelo de Sunbird, lo que limita su calidad pero facilita su despliegue.

## Limitaciones y advertencias

- Los pares de entrenamiento son salida de traduccion automatica, por lo que el modelo hereda los errores y el estilo del traductor que genero los datos; el texto humano real (dialectos, ortografia variable, alternancia de codigos) puede manejarse peor de lo que sugieren las cifras.
- Puede omitir o alterar el significado, especialmente en numeros, nombres propios y palabras poco frecuentes. No debe usarse en contenido medico, legal o de alto riesgo sin revision humana.
- Es un modelo a nivel de frase: las entradas de mas de unas 128 piezas se truncan o degradan, y el contexto maximo es de 256 posiciones.
- Las salidas no han sido revisadas por hablantes nativos de runyankole.
- No se han ejecutado las evaluaciones completas sobre SALT dev/test.
- No es compatible con la API `AutoModel` de `transformers`; requiere cargar el codigo del repositorio, lo que anade friccion de integracion y superficie de riesgo al ejecutar codigo de terceros.
- La licencia MIT permite uso comercial, pero la calidad del modelo y la procedencia sintetica de los datos desaconsejan su uso en produccion sin ajuste fino y validacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amDANIEL2024/kintu_base
- Version ajustada: https://huggingface.co/amDANIEL2024/kintu_finetuned
- Dataset de entrenamiento: https://huggingface.co/datasets/amDANIEL2024/tulati
- Modelo que genero los datos de entrenamiento: https://huggingface.co/Sunbird/translate-nllb-1.3b-salt
- Sitio del autor: https://domusdeiug.com
- Contacto: domusdeiug@gmail.com
