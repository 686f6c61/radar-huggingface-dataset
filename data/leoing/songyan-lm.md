# Leoing/songyan-lm

## Resumen

SongyanLM es un modelo de lenguaje neuronal de muy pequeno tamano disenado especificamente para la reordenacion de candidatos (reranking) y la prediccion de siguiente palabra, frase y puntuacion inteligente en teclados de entrada (IME) para chino y chino-ingles mixto. Lo desarrolla el usuario Leoing y se distribuye en un formato binario propio (`.sylm`) pensado para inferencia en el dispositivo (on-device), sin dependencias externas, sobre moviles Android e iOS y sobre cualquier frontend de Rime (Squirrel, Weasel, fcitx5-rime, ibus-rime, Trime, Hamster) mediante un runtime C++20 y un plugin de `librime`.

La version disponible es `songyan_lm_v5_q4.sylm`, con 15,9 millones de parametros, arquitectura transformer causal de 12 capas y 320 dimensiones con GQA (8 cabezas de consulta / 2 de clave-valor), Conv1D causal depthwise, QK-Norm y Value Residual. Incorpora cuantizacion INT4 con grupos de 32 (g32) entrenada mediante QAT (quantization-aware training) y embeddings Q8, lo que reduce el binario a 10,6 MB. El modelo se entrena en dos etapas: una pretension de lenguaje causal con QAT y una segunda etapa de ajuste fino de ranking anclado por KL.

Su relevancia radica en el nicho: no compite con LLM generalistas, sino que resuelve un problema concreto de latencia y memoria en dispositivos moviles (reranking de candidatos homofonos en teclados de 26, 18, 14 y 9 teclas, y prediccion tras el commit), donde un modelo de 10 MB ejecutable por `mmap` en CPUs ARM64 con NEON/dotprod es la unica opcion viable. El repositorio esta practicamente vacio (0,0 GB) y no se han publicado resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con GQA (8Q/2KV), Conv1D causal depthwise, QK-Norm, Value Residual |
| Parametros totales | 15,9 M (v5); 18,3 M (v6 18M, en entrenamiento); 30,7 M (v6 30M, en entrenamiento) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible para v5; seq_len de entrenamiento de 256 en v6 |
| Tipos de cuantizacion | INT4-g32 QAT + embeddings Q8 (escalas FP32 en v5, FP16 en v6) |
| Idiomas soportados | chino (zh) e ingles (en), incluyendo entrada mixta CN-EN |
| Licencia | GPL-3.0-only |
| Formato de pesos | `.sylm` (binario empaquetado 4-bit con escalas de grupo y embeddings Q8 enlazados, inferencia por `mmap`) |

## Arquitectura y entrenamiento

El modelo es un transformer causal de 12 capas y 320 dimensiones con atencion de grupos de consulta (GQA) de 8 cabezas de consulta y 2 de clave-valor, una convolucion depthwise causal de 1D, normalizacion de consulta-clave (QK-Norm) y conexion residual de valor (Value Residual). El tokenizador es un BPE a nivel de byte con vocabulario de 8192 unidades. La cuantizacion INT4 con grupos de 32 se aplica durante el entrenamiento mediante QAT con estimador de gradiente recto (STE), de modo que el modelo aprende a operar ya en su representacion final de 4 bits.

El entrenamiento consta de dos etapas. La primera es una pretension de lenguaje causal con QAT. La segunda es un ajuste fino de ranking anclado por KL: se optimiza una perdida de margen por pares mas una perdida de ranking por listas sobre confusiones homofonas sinteticas generadas para teclados de 26, 18, 14 y 9 teclas, y se ancla con divergencia KL respecto al modelo congelado de la etapa 1 para preservar la fluidez en contexto largo. La exportacion a `.sylm` empaqueta los pesos 4-bit con escalas de grupo y embeddings Q8 enlazados para inferencia sin copia (`zero-copy mmap`) sobre CPUs ARM64 con NEON y dotprod.

## Capacidades

- Reordenacion de candidatos de IME en chino y en entrada mixta chino-ingles, incluyendo teclados de 26, 18, 14 y 9 teclas.
- Prediccion de siguiente palabra y de frase tras el commit del texto.
- Puntuacion inteligente en funcion del contexto previo.
- Modelado de lenguaje causal con contexto corto (256 tokens en la generacion v6).
- Inferencia on-device sin dependencias externas, sobre Android e iOS.
- Integracion con frontends Rime mediante plugin de `librime` y runtime C++20.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Reordenacion de candidatos en teclado chino de 26 teclas: el modelo puntua la lista de candidatos homofonos generada por el motor de Rime y reordena segun el contexto previo, mejorando la primera opcion sin salir del dispositivo.
- Teclados de 9 teclas (T9 chino) en moviles: la confusion homofona es mucho mayor y el reranking neuronal aporta la mayor ganancia relativa; el modelo de 10,6 MB cabe en el presupuesto de memoria de una app de teclado.
- Entrada mixta chino-ingles: el modelo maneja vocabulario BPE byte-level en ambos idiomas y puede desambiguar candidatos cuando el usuario alterna idiomas en la misma frase.
- Prediccion de siguiente palabra y frase tras el commit: tras confirmar una palabra, el modelo sugiere la continuacion mas probable para acelerar la escritura en conversaciones.
- Puntuacion inteligente: insercion automatica de comas, puntos y signos de cierre chinos (。，、) segun el contexto sintactico precedente.
- Integracion en escritorio Linux mediante fcitx5-rime o ibus-rime: el runtime C++20 y el plugin de `librime` permiten reutilizar el mismo binario en teclados de escritorio sin reentrenamiento.
- Despliegue en iOS mediante el runtime C++20: el formato `mmap` y la ausencia de dependencias facilitan el empaquetado en una extension de teclado con restricciones estrictas de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye una suite de evaluacion de 140 casos (`training/eval/benchmark_v2.json`) que cubre teclados de 26, 18, 14 y 9 teclas, entrada mixta CN-EN y prediccion tras commit, pero no se proporcionan cifras de resultados en la model card.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 10,6 MB de pesos para el modelo v5 (INT4-g32 + Q8 embeddings); el consumo real depende del runtime y del buffer de contexto.
- GPU: no aplica; el modelo esta disenado para CPU.
- CPU objetivo: ARM64 con extensiones NEON y dotprod (moviles Android e iOS modernos); el runtime C++20 esta pensado para `mmap` sin copia.
- Cabe en cualquier dispositivo movil actual; no requiere GPU dedicada ni aceleradores.
- Opciones de despliegue: runtime C++20 propio y plugin `librime-songyan-lm`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (el formato `.sylm` es propietario y no es compatible con esos motores).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Enfoque |
|---|---|---|---|---|---|
| SongyanLM v5 | 15,9 M | no disponible (256 en v6) | INT4-g32 QAT + Q8 | GPL-3.0-only | Reranking de IME y prediccion on-device |
| SongyanLM v6 18M | 18,3 M | 256 | INT4-g32 QAT + Q8 | GPL-3.0-only | Igual, en entrenamiento |
| SongyanLM v6 30M | 30,7 M | 256 | INT4-g32 QAT + Q8 | GPL-3.0-only | Igual, en entrenamiento |

No se dispone de informacion sobre modelos comparables de terceros en la documentacion proporcionada; la comparativa se limita a las variantes del propio modelo.

## Limitaciones y advertencias

- Modelo de nicho: no es un LLM generalista; su uso esta acotado a reranking de IME y prediccion de texto corto.
- Contexto limitado: la generacion v6 usa `seq_len=256`; no se especifica el contexto de v5, pero por el diseno del caso de uso es previsiblemente corto.
- Idiomas restringidos a chino e ingles; no hay soporte para otras lenguas.
- Riesgo de sesgo derivado de los datos de pretension y de las confusiones homofonas sinteticas; no se documenta ninguna evaluacion de sesgo.
- Riesgo de alucinacion en predicciones de siguiente palabra o frase, especialmente en contextos poco frecuentes.
- Licencia GPL-3.0-only: impone obligaciones de copyleft sobre el software distribuido que lo integre; conviene revisar la compatibilidad antes de uso comercial propietario.
- El repositorio figura con 0,0 GB y 0 descargas; la disponibilidad real de los binarios no esta confirmada en la informacion proporcionada.
- El formato `.sylm` es propietario y solo es consumible por el runtime C++20 del autor y el plugin de `librime`; no hay soporte para motores de inferencia estandar.
- Las variantes v6 estan en estado de entrenamiento; no deben considerarse estables para produccion.

## Enlaces

- Hugging Face: https://huggingface.co/Leoing/songyan-lm
- Runtime C++20 y plugin `librime-songyan-lm`: mencionados en la model card como disponibles en GitHub, sin URL concreta en la informacion proporcionada.
- Suite de evaluacion: `training/eval/benchmark_v2.json` dentro del repositorio.
- Codigo de entrenamiento: `training/src/` dentro del repositorio.
