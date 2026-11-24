# amDANIEL2024/apio_base

## Resumen

`apio_base` es un modelo de traduccion automatica neuronal encoder-decoder de 89,4 millones de parametros desarrollado por Amanyire Daniel (usuario `amDANIEL2024`) para la traduccion directa bidireccional entre acholi (`ach`) e ingles (`en`). Se publica como modelo base preentrenado, no como traductor finalizado: ha sido entrenado exclusivamente con pares generados por traduccion automatica y no ha pasado por un ajuste fino sobre datos traducidos por humanos. El autor publica por separado una version afinada (`amDANIEL2024/apio_finetuned`).

La relevancia del modelo reside en su enfoque: el acholi es una lengua nilotica de Uganda con muy pocos recursos computacionales, y este modelo ofrece una arquitectura compacta (6+6 capas, `d_model` 640) que puede ejecutarse en hardware modesto, incluso en una GPU de consumo. El modelo unifica ambas direcciones de traduccion en un unico conjunto de pesos, seleccionando la direccion mediante un token de prefijo en la fuente (`<2eng>` o `<2ach>`).

Tecnicamente se trata de un Transformer pre-LN clasico con embeddings compartidos y tokenizador SentencePiece de 32.000 piezas, con una longitud de contexto de 256 posiciones (aunque los pares de entrenamiento se limitaron a 128 piezas por lado). El modelo no es compatible con `transformers`; requiere el codigo de inferencia propio incluido en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder pre-LN, 6 + 6 capas, `d_model` 640, 8 cabezas, FFN 2560, activacion GELU |
| Parametros totales | 89.418.240 (89,4 M); embeddings de entrada, de decoder y proyeccion de salida compartidos |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 posiciones (posicional sinusoidal); pares de entrenamiento limitados a 128 piezas por lado |
| Tipos de cuantizacion | no disponible (pesos publicados en float32; no se documentan variantes GGUF, INT8 ni otras) |
| Idiomas soportados | acholi (`ach`) e ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (float32) + `config.json`, `spm.model` (SentencePiece) y `apio.py` (codigo de inferencia) |

## Arquitectura y entrenamiento

El modelo es un Transformer encoder-decoder estandar con normalizacion pre-LN, 6 capas en el encoder y 6 en el decoder, dimension de modelo 640, 8 cabezas de atencion y FFN de 2560 unidades con activacion GELU. Los embeddings de entrada, de decoder y la proyeccion de salida estan atados (weight tying), lo que explica el tamano relativamente contenido de 89 M de parametros. El tokenizador es un SentencePiece compartido de 32.000 piezas entrenado unicamente sobre texto acholi e ingles. La codificacion posicional es sinusoidal y el limite de contexto es de 256 posiciones.

El entrenamiento se realizo exclusivamente sobre el dataset `amDANIEL2024/tulati`, en ambas direcciones. La columna inglesa es el texto fuente y la columna acholi es una traduccion automatica generada por `Sunbird/translate-nllb-1.3b-salt`; por tanto, **no hay acholi escrito por humanos en los datos de entrenamiento**. El filtrado partio de 1.534.699 filas: se descartaron 61.272 por flags de calidad (vacio, degenerado, parece-ingles, longitud atipica), 2.680 pares con lados identicos y 0 duplicados exactos, quedando 1.470.747 pares; la descontaminacion contra SALT dev/test elimino 1 par, dejando 1.470.746, de los cuales 2.000 se reservaron para validacion. El preentrenamiento consistio en 5 epocas, 20.027 pasos de optimizador (unos 25.000 tokens objetivo por paso), en fp16 sobre una unica GPU Kaggle T4, con label smoothing 0,1, AdamW, warmup lineal seguido de decaimiento inverso de raiz cuadrada y LR pico de 3e-4. No se documenta RLHF ni DPO.

## Capacidades

- Traduccion directa acholi → ingles y ingles → acholi con un unico modelo, seleccionando la direccion mediante el token de prefijo `<2eng>` o `<2ach>` en la fuente (el tag nombra el idioma destino).
- Traduccion por frases (modelo a nivel de oracion), con soporte de entrada individual o por lotes (`translate` acepta cadena o lista).
- Decodificacion con beam search configurable (beam por defecto 4) y modo greedy para comprobaciones rapidas.
- Tokenizacion compartida acholi-ingles con SentencePiece de 32.000 piezas.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.
- Capacidad multilingue limitada estrictamente a los dos idiomas del par (ach, en).

## Casos de uso

- Traduccion de documentacion comunitaria: traduccion de materiales de salud, agricultura o educacion del ingles al acholi para ONG y organismos locales, siempre con revision humana dado que el modelo base no ha sido validado por hablantes nativos.
- Prototipado de sistemas de traduccion para lenguas de bajos recursos: punto de partida para investigacion en NLP de lenguas niloticas, aprovechando que el modelo es pequeno (89 M) y entrenable o ajustable en hardware modesto.
- Generacion de datos sinteticos aumentados: uso del modelo para producir pares ingles-acholi adicionales que alimenten posteriores pipelines de ajuste fino o evaluacion.
- Traduccion por lotes de corpus: procesamiento de grandes volumenes de frases cortas (hasta ~128 piezas) en pipelines offline, con throughput alto gracias al reducido tamano del modelo y a la inferencia en fp16.
- Integracion en aplicaciones de mensajeria o chat de frase corta: traduccion de mensajes individuales en movil o en servidores sin GPU dedicada, dado que el modelo cabe en VRAM reducida.
- Baseline para evaluacion comparativa: referencia para medir la mejora de la version afinada (`apio_finetuned`) o de otros sistemas sobre SALT dev/test.
- Investigacion sobre contaminacion por traduccion automatica: estudio de como los errores del traductor generador (NLLB salt) se propagan al modelo entrenado con sus salidas.

## Benchmarks y rendimiento

El autor no ha ejecutado la evaluacion completa sobre SALT dev/test para este modelo base. Las unicas metricas publicadas son comprobaciones rapidas al final del preentrenamiento (paso 20.027) con decodificacion greedy sobre las primeras 128 frases, que el propio autor califica de ruidosas y no comparables con puntuaciones de conjunto completo.

| Conjunto | Direccion | Loss | chrF++ rapido (greedy, primeras 128 frases) |
|---|---|---|---|
| tulati validacion (pares automaticos retenidos) | ach→eng | 1,803 | 47,77 |
| tulati validacion (pares automaticos retenidos) | eng→ach | 0,799 | 66,51 |
| SALT dev (traducciones humanas) | ach→eng | 2,432 | 38,88 |
| SALT dev (traducciones humanas) | eng→ach | 3,121 | 43,50 |

No se han publicado resultados completos de benchmarks (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con modelos similares en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en float32 ocupan aproximadamente 0,36 GB (89,4 M × 4 bytes); con activaciones y buffers de beam search, el consumo real es de aproximadamente 1-2 GB, por lo que cabe en cualquier GPU de consumo moderna.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor entreno en una unica Kaggle T4 y el codigo usa GPU si esta disponible. Funciona tambien en CPU para volumenes moderados.
- GPU de consumo: si, cabe en GTX 1650, RTX 3050, RTX 4060, RTX 4090 y equivalentes; tambien en iGPU con suficiente memoria compartida.
- Opciones de despliegue: el modelo no es compatible con `transformers` (`AutoModel` no lo carga); requiere el codigo propio `apio.py` incluido en el repositorio. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de comparaciones publicadas con modelos equivalentes en la informacion proporcionada. Como referencia estructural, el modelo se situa en la categoria de traduccion neuronal de bajos recursos para pares de lenguas con pocos datos, pero no se aportan datos de rendimiento frente a alternativas como NLLB-200, M2M-100 o modelos especificos para lenguas africanas.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Rendimiento comparado |
|---|---|---|---|---|---|
| apio_base | 89,4 M | 256 posiciones | ach, en | MIT | no disponible |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Datos de entrenamiento sinteticos**: todos los pares acholi son salida automatica de `Sunbird/translate-nllb-1.3b-salt`; el modelo hereda sus errores y estilo. El acholi escrito por humanos (dialectos, ortografia variable, code-switching) puede manejarse peor de lo que sugieren las metricas.
- **Modelo base, no finalizado**: no ha sido ajustado con datos traducidos por humanos; el autor recomienda usar `apio_finetuned` para produccion.
- **Riesgo de perdida o alteracion de significado**, especialmente en numeros, nombres propios y palabras raras; no debe usarse en contenido medico, legal o de alto riesgo sin revision humana.
- **Limite de longitud**: modelo a nivel de oracion; entradas superiores a ~128 piezas se truncan o degradan, y el contexto maximo es de 256 posiciones.
- **Sin validacion por hablantes nativos**: las salidas no han sido revisadas por hablantes nativos de acholi.
- **Evaluacion incompleta**: no se han ejecutado las puntuaciones completas sobre SALT dev/test; las metricas publicadas son comprobaciones rapidas y ruidosas.
- **Compatibilidad**: no funciona con `transformers`; requiere el codigo propio del repositorio, lo que limita su integracion en ecosistemas estandar.
- **Licencia**: MIT, permisiva para uso comercial, pero las limitaciones tecnicas anteriores desaconsejan su uso en produccion sin validacion adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amDANIEL2024/apio_base
- Version afinada: https://huggingface.co/amDANIEL2024/apio_finetuned
- Dataset de entrenamiento (tulati): https://huggingface.co/datasets/amDANIEL2024/tulati
- Traductor que genero los datos (Sunbird NLLB salt): https://huggingface.co/Sunbird/translate-nllb-1.3b-salt
- Sitio del autor: https://domusdeiug.com
- Contacto: domusdeiug@gmail.com
