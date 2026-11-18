# jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-equal-scandimerge-seed1

## Resumen

SmolLM-135M CPT Faroese es un modelo de generacion de texto de 134,5 millones de parametros, derivado de SmolLM2-135M-Instruct y especializado en lengua feroesa mediante continuacion de preentrenamiento (continued pre-training, CPT). Lo desarrolla el usuario independiente jekunz como parte de una linea de investigacion sobre transferencia entre lenguas escandinavas, y se distribuye con licencia Apache 2.0.

El modelo parte de un merge TIES con pesos iguales de cinco modelos entrenados sobre porciones danesa, islandesa, noruego bokmal, noruego nynorsk y sueca de FineWeb-2, y posteriormente se ajusta sobre la porcion feroesa del mismo corpus. Resuelve un problema concreto: la escasez de modelos generativos de calidad para el feroes, una lengua de bajos recursos con unos 70.000 hablantes, aprovechando el parentesco tipologico con las lenguas escandinavas continentales.

Por su tamano reducido (0,3 GB en el repositorio) es un modelo pensado para experimentacion y despliegue en entornos con recursos muy limitados, no para produccion general. El autor indica explicitamente que no se ha evaluado de forma amplia, por lo que debe tratarse como un artefacto de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, derivado de SmolLM2-135M-Instruct) |
| Parametros totales | 134.515.008 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud maxima usada en entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Feroes (fo); capacidades residuales en danes, islandes, noruego bokmal, noruego nynorsk y sueco por el merge de origen |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo Llama con 134,5 millones de parametros, heredada directamente de SmolLM2-135M-Instruct. El proceso de entrenamiento tiene dos fases: primero se construye un modelo base mediante un merge TIES con pesos iguales de cinco modelos entrenados sobre las porciones danesa, islandesa, noruego bokmal, noruego nynorsk y sueca de FineWeb-2; despues se realiza continuacion de preentrenamiento sobre la porcion feroesa del mismo dataset (HuggingFaceFW/fineweb-2).

Los hiperparametros documentados son: 1 epoca por lengua de origen y 5 epocas sobre feroes, learning rate de 5e-4 con scheduler coseno, warmup ratio de 0,05, batch size de 8 con 32 pasos de acumulacion de gradiente (batch efectivo de 256), longitud maxima de contexto de 2048 tokens y semilla 1 (una de tres semillas de entrenamiento para esta configuracion). Todo el ajuste se ejecuto en una unica GPU A100 de 40 GB. No se documenta el numero total de tokens procesados ni si hubo fases de RLHF o DPO posteriores; el modelo base de partida es una variante Instruct, por lo que conserva el formato conversacional de SmolLM2.

## Capacidades

- Generacion de texto autoregresiva en feroes, con capacidad residual en las cinco lenguas escandinavas usadas en el merge TIES.
- Formato conversacional (pipeline text-generation, tag conversational), heredado de SmolLM2-135M-Instruct.
- Razonamiento basico y respuesta a instrucciones a pequena escala, limitado por los 135M de parametros.
- Generacion de codigo y matematicas simples: capacidad marginal, no es un objetivo del entrenamiento y no se ha evaluado.
- Tool calling / function calling: no documentado; el modelo base tiene soporte limitado, pero no hay evidencia para este fine-tune.
- Capacidades de agente y razonamiento multi-paso: no documentadas y poco realistas a este tamano.
- Capacidades multilingues: foco en feroes; el resto de lenguas escandinavas solo de forma indirecta.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Generacion de texto en feroes para prototipos: el modelo puede producir parrafos coherentes en feroes gracias a las 5 epocas de CPT sobre FineWeb-2 fo, adecuado para experimentar con generacion en una lengua de bajos recursos antes de invertir en modelos mayores.
- Aumento de datos sinteticos para NLP feroes: generar corpus adicionales para entrenar clasificadores, etiquetadores o modelos de traduccion, con la ventaja de que el modelo cabe en cualquier GPU consumer.
- Investigacion sobre transferencia entre lenguas: sirve como punto de comparacion reproducible (semilla 1 de 3) para estudiar el efecto del merge TIES y del CPT en lenguas minoritarias.
- Completado de texto y autocompletado en aplicaciones de escritura en feroes: con 2048 tokens de contexto y 135M de parametros, la latencia es minima incluso en CPU, lo que permite integrarlo en editores o formularios.
- Filtrado y clasificacion de texto feroes via perplejidad: usar el modelo como estimador de probabilidad para detectar texto mal formado o discriminar registros en corpus feroeses.
- Despliegue en dispositivos de borde: con 0,3 GB de pesos en safetensors (y menos tras cuantizacion a 8 o 4 bits), es viable en moviles, Raspberry Pi o navegador mediante transformers.js, para demos de NLP feroes sin conexion.
- Base para futuros fine-tunes: al estar bajo Apache 2.0 y con arquitectura Llama estandar, sirve como inicializacion para tareas especificas en feroes (NER, resumen, dialogo) con presupuesto de computo minimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el modelo "has not been evaluated more broadly yet".

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,54 GB solo para pesos (134,5M x 4 bytes), mas activaciones y cache KV.
- VRAM estimada en fp16/bf16: aproximadamente 0,27 GB para pesos; en int8 unos 0,14 GB; en int4 unos 0,07 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; A100, H100, RTX 4090 o RTX 3060 estan sobradamente dimensionadas. Tambien funciona en CPU.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 Ti o una iGPU moderna con suficiente memoria compartida.
- Opciones de despliegue: transformers (libreria nativa), text-generation-inference (el repo tiene tag endpoints_compatible), llama.cpp/Ollama si se convierte a GGUF (no se publican conversiones oficiales), y transformers.js para navegador.
- Latencia y throughput: no disponibles de forma medida; por el tamano, se espera un throughput de cientos a miles de tokens por segundo en GPU moderna y decenas de tokens por segundo en CPU, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolLM-135M CPT Faroese (este) | 134,5M | 2048 | Feroes (+ escandinavo residual) | Apache 2.0 | Hugging Face, 0 descargas |
| SmolLM2-135M-Instruct | 135M | 8192 (modelo original) | Ingles principalmente | Apache 2.0 | Hugging Face, ampliamente usado |
| Modelos GPT-2 small ajustados a lenguas nordicas | ~124M | 1024 | Variable | MIT / variable | Hugging Face, disponibilidad variable |
| Modelos tipo BERT-base nordico (p. ej. electra/nb-bert) | ~110M | 512 | Escandinavo | Variable | Hugging Face, solo encoder |

La comparacion directa es dificil porque no existen benchmarks publicados para este modelo ni modelos feroeses comparables de generacion con evaluacion estandar. Frente a SmolLM2-135M-Instruct, este fine-tune sacrifica contexto (2048 frente a 8192) y cobertura multilingue amplia a cambio de especializacion en feroes. Frente a encoder-only nordicos, la ventaja es la generacion autoregresiva; la desventaja, la falta de evaluacion.

## Limitaciones y advertencias

- No ha sido evaluado de forma amplia; el autor lo declara como modelo de investigacion sin validacion publica de calidad.
- Riesgo elevado de alucinacion y de texto incoherente por el reducido tamano (135M) y las solo 5 epocas de entrenamiento en feroes.
- Contexto limitado a 2048 tokens, insuficiente para tareas de documento largo o conversaciones extensas.
- Cobertura idiomatica restringida: aunque el merge incluye cinco lenguas escandinavas, no hay garantia de calidad fuera del feroes y el modelo puede mezclar idiomas.
- Sesgos desconocidos: no se documenta composicion del corpus FineWeb-2 fo ni filtrado de sesgos; el modelo puede reproducir sesgos presentes en la web feroesa.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias y la falta de evaluacion hace arriesgado desplegarlo en produccion sin validacion propia.
- Sin conversiones oficiales a GGUF ni cuantizaciones publicadas; el usuario debe generarlas.
- El tag de idioma solo declara "fo", por lo que herramientas que filtren por idioma no lo consideraran multilingue.
- Fecha de creacion del repositorio (2026-11-18) y cero descargas: no hay comunidad ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-equal-scandimerge-seed1
- Modelo base del merge: https://huggingface.co/jekunz/smollm135m-da1-is1-nno1-nob1-sv1-ties
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Modelo original SmolLM2-135M-Instruct (referencia): https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Paper de SmolLM2: https://arxiv.org/abs/2502.02737
- Paper de FineWeb-2: https://arxiv.org/abs/2506.20920
