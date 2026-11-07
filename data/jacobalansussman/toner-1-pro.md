# jacobalansussman/TONER-1-Pro

## Resumen

TONER-1 Pro es un modelo de generacion de texto de 12.194.688 parametros desarrollado por jacobalansussman como continuacion parodica de TONER-1. Se trata de un decoder estilo Llama-2 entrenado desde cero (sin pesos base de Llama 2) sobre el dataset TinyStories y posteriormente afinado sobre un corpus de 8.757 historias sobre impresoras. Su rasgo mas distintivo es que los pesos cuantizados a int8 se empaquetan dentro de un unico trabajo de impresion PostScript de 24,9 MB, de modo que el modelo puede, en teoria, ejecutarse directamente en una impresora PostScript sin necesidad de un ordenador anfitrion.

El modelo es fundamentalmente un experimento artistico y de ingenieria: demuestra que un transformer de ~12M de parametros cabe en un flujo PostScript y que la inferencia puede realizarse con el interprete PostScript de una impresora. No esta pensado para produccion ni para tareas reales de NLP, sino como pieza de "parody" tecnica, tal como el propio autor declara en la model card.

La relevancia actual es limitada desde el punto de vista practico, pero resulta interesante como caso extremo de despliegue minimalista: cuantizacion int8 con una escala por fila, tokenizador SentencePiece propio de 4.096 tokens y un motor de inferencia implementado en PostScript. El contexto es de solo 256 tokens y el modelo genera hasta 200 tokens por ejecucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder estilo Llama-2 (llama2.c `model.py`): 6 capas, dim 384, 6 cabezas, 6 cabezas key/value, head size 64, SwiGLU (hidden 1024), RoPE, RMSNorm, embedding compartido con la capa de salida |
| Parametros totales | 12.194.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (genera hasta 200) |
| Tipos de cuantizacion | int8 con una escala por fila (pesos); activaciones en reales PostScript; pesos float32 en safetensors |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (float32), bin de llama2.c, PostScript (.ps) con int8 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder estilo Llama-2 implementado en el codigo `model.py` de llama2.c de Andrej Karpathy (licencia MIT). Consta de 6 capas con dimension 384, 6 cabezas de atencion y 6 cabezas key/value (head size 64), feed-forward SwiGLU con hidden 1024, RoPE y RMSNorm. El embedding de tokens esta compartido con la capa de salida. El tokenizador es propio: SentencePiece BPE con 4.096 tokens, entrenado sobre 299.945 historias de TinyStories mas 601 historias de impresora repetidas 60 veces (8,5% de las palabras); el token " toner" es una pieza unica.

El preentrenamiento se realizo sobre TinyStoriesV2-GPT4 durante 3.800 pasos de 32.768 tokens (124,5M tokens) con AdamW y learning rate 1e-3, en 2,4 horas sobre un Apple M4. El afinamiento posterior consistio en 750 pasos de 16.384 tokens, con mitad historias de impresora y mitad replay de TinyStories, learning rate 1e-4 con decaimiento a 5e-6, en unos 25 minutos en el mismo hardware. No se menciona RLHF ni DPO. La innovacion tecnica destacable es el empaquetado de los pesos int8 y el motor de inferencia en PostScript, ejecutable en Ghostscript o en una impresora PostScript Level 2 o superior.

## Capacidades

- Generacion de texto narrativo breve en ingles, con estilo de cuento infantil (TinyStories) y tematica de impresoras.
- Generacion de historias de hasta 200 tokens a partir de un token BOS, sin entrada de prompt (cada historia comienza desde el inicio).
- Control de generacion mediante parametros `SEED` (por defecto 42), `TEMP` (0,8) y `STEPS` (200).
- Ejecucion autonoma en PostScript: el trabajo de impresion contiene pesos, vocabulario y motor de inferencia.
- Uso de los pesos en Python mediante llama2.c `model.py` y SentencePiece.
- No soporta tool calling, function calling, agentes, vision, audio ni razonamiento multi-paso.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Demostracion artistica y de investigacion: ejecutar un modelo de lenguaje dentro de una impresora PostScript como pieza de arte generativo o charla tecnica, aprovechando que el trabajo `.ps` es autocontenido.
- Ensenanza de fundamentos de transformers: el modelo, con solo 12M de parametros y codigo llama2.c, sirve para explicar atencion, RoPE, SwiGLU y cuantizacion int8 en un entorno minimo.
- Prueba de concepto de despliegue extremo: estudiar los limites de memoria PostScript (unos 37 MB) y de tiempo de ejecucion en hardware de impresora.
- Generacion de cuentos cortos con tematica de impresoras para demos o material promocional de broma.
- Benchmark de cuantizacion int8 por fila: comparar la calidad de generacion entre los pesos float32 en safetensors y los int8 del trabajo PostScript.
- Replica del pipeline de entrenamiento: reproducir el preentrenamiento sobre TinyStories y el afinamiento sobre TONER-1-printer-stories en hardware de consumo (Apple M4) para experimentos docentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los unicos datos de rendimiento son de inferencia: en Ghostscript 10.07.1 sobre un Apple M4, 200 tokens tardaron 71,1 s (2,81 tok/s), con hasta unos 37 MB de memoria PostScript. En impresora se estima entre 0,010 y 0,18 tok/s (entre 20 minutos y 5 horas por pagina), estimacion no verificada; el modelo nunca se ha ejecutado en una impresora.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en float32 (12,2M parametros, ~49 MB de pesos) y unos 12 MB en int8; no requiere GPU.
- GPU recomendadas: no necesarias; el modelo cabe en CPU. Cualquier GPU consumer (RTX 4090, etc.) lo ejecutaria con holgura, pero no aporta ventaja practica.
- Cabe en cualquier GPU consumer y en CPU; el modo PostScript requiere unos 37 MB de memoria PostScript libre.
- Opciones de despliegue: Ghostscript (previsualizacion), impresora PostScript Level 2 o superior via `nc <ip> 9100`, y Python con llama2.c `model.py` + safetensors + SentencePiece.
- Latencia y throughput: 2,81 tok/s en Ghostscript sobre Apple M4; en impresora, estimacion de 0,010 a 0,18 tok/s (no verificada).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| TONER-1 Pro | 12,19M | 256 | MIT | Hugging Face | Ejecutable en PostScript/impresora |
| TONER-1 | ~259K (47 veces menor) | no disponible | MIT | Hugging Face | Predecesor, ejecutado en HP Color LaserJet Pro MFP M281fdw a 0,92 tok/s |
| TinyStories (modelos de referencia) | 1M-33M | no disponible | variable | Hugging Face | Modelos de cuentos cortos sobre el mismo dataset |
| llama2.c (referencia) | 15M-1B | no disponible | MIT | GitHub | Implementacion base de la arquitectura |

## Limitaciones y advertencias

- Modelo de parodia: no esta destinado a uso en produccion ni a tareas reales de NLP.
- Solo genera en ingles y con un estilo muy restringido (cuentos infantiles sobre impresoras).
- Contexto de solo 256 tokens y generacion maxima de 200 tokens; no acepta prompts de entrada.
- Riesgo alto de alucinacion y de texto incoherente fuera del dominio de TinyStories.
- Sesgos inheritos del dataset TinyStories y del corpus de historias de impresora; no se documentan evaluaciones de sesgo.
- La ejecucion en impresora no se ha probado: puede no caber en memoria, cancelarse por tiempo o no funcionar en absoluto.
- Solo debe enviarse a impresoras propias o con permiso explicito; el envio raw puede afectar al dispositivo.
- Licencia MIT permite uso comercial, pero el valor practico del modelo es practicamente nulo fuera de demos y experimentos.

## Enlaces

- Hugging Face: https://huggingface.co/jacobalansussman/TONER-1-Pro
- Modelo predecesor TONER-1: https://huggingface.co/jacobalansussman/TONER-1
- Dataset TONER-1-printer-stories: https://huggingface.co/datasets/jacobalansussman/TONER-1-printer-stories
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- llama2.c (Karpathy): https://github.com/karpathy/llama2.c
- Paper TinyStories (arXiv:2305.07759): https://arxiv.org/abs/2305.07759
