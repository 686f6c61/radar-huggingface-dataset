# Grawnch/Qwen3.8-27B-DR-2bit-Packed

## Resumen

Qwen3.8-27B-DR-2bit-Packed es una cuantizacion extrema de 2 bits del modelo base Qwen/Qwen3.8-27B, publicada por el usuario Grawnch en HuggingFace. Se trata de un checkpoint compacto de 7,2 GB que almacena los pesos como enteros empaquetados bit a bit (`qweight`) junto con escalas de grupo en FP16 (`scales`) en un unico fichero `.safetensors`, permitiendo inferencia con bajo consumo de VRAM mediante el modulo `DRLinear`. El modelo base pertenece a la familia Qwen3.5 de Alibaba, con 27 mil millones de parametros, aunque la model card no detalla la arquitectura interna ni la longitud de contexto del modelo original.

La relevancia de esta publicacion radica en el nivel de compresion alcanzado: 2,17 bits por peso (bpw) frente a los 16 bpw del checkpoint original de 55,5 GB, lo que supone una reduccion de tamano de aproximadamente 7,7 veces. El autor reporta mejoras frente a GPTQ estandar en error cuadratico medio por capa (reduccion del 52,8%) y una tasa de coincidencia Top-5 del 95,42% respecto al modelo de 16 bits, lo que sugiere que la cuantizacion preserva buena parte del comportamiento del modelo original pese a la agresividad del recorte.

No obstante, la ficha debe interpretarse con cautela: el repositorio tiene cero descargas y cero likes en el momento de la consulta, la model card no documenta el proceso de calibracion, los datos de entrenamiento ni los idiomas soportados, y el codigo `dr_loader`/`DRLinear` no se distribuye como paquete estandar de HuggingFace. Es un artefacto de investigacion experimental, no un modelo listo para produccion sin validacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.8-27B; detalles no disponibles) |
| Parametros totales | 27 mil millones (modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2 bits empaquetado (2,17 bpw), escalas de grupo FP16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bit-packed `qweight` + `scales` FP16) |
| Tamano del checkpoint | 7,2 GB (repo: 12,9 GB) |
| Modelo base | Qwen/Qwen3.8-27B |
| Fecha de publicacion | 2026-11-01 |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde al modelo Qwen/Qwen3.8-27B de la familia Qwen3.5, del que no se proporcionan detalles estructurales en la informacion disponible (numero de capas, dimension oculta, tipo de atencion, uso de MoE, etc.). Lo que si se documenta es el metodo de cuantizacion: pesos enteros empaquetados bit a bit (`qweight`) con escalas de grupo en FP16 (`scales`), almacenados en un unico fichero `.safetensors` de 7,2 GB. La inferencia se realiza mediante `DRLinear`, un modulo que mantiene los pesos comprimidos en VRAM y los descomprime bajo demanda, o bien los expande a capas `nn.Linear` estandar si se configura `low_vram=False`.

El autor reporta que la cuantizacion DR supera a GPTQ estandar en la reduccion del error cuadratico medio por capa (factor 2,12x, equivalente a -52,8%) y que el 99,31% de las neuronas de salida (3.872.339 de 3.899.392) presentan mejor comportamiento que con GPTQ. No se especifica el dataset de calibracion, el numero de muestras utilizadas, ni si se aplico alguna tecnica de ajuste posterior (por ejemplo, destilacion o correccion de sesgos). Tampoco se documenta si el modelo base fue entrenado con RLHF, DPO o tecnicas de razonamiento extendido.

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo base Qwen3.8-27B (calidad degradada respecto al original segun los benchmarks reportados).
- Razonamiento y conocimiento general: presumiblemente conserva parte de las capacidades del modelo base, aunque la coincidencia Top-1 del 74,44% indica una divergencia notable en la distribucion de tokens.
- Generacion de codigo y matematicas: no documentado especificamente para esta cuantizacion.
- Soporte de tool calling / function calling: no disponible (no se menciona en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (idiomas no listados).
- Capacidades especiales (vision, audio, thinking mode): no disponible.
- Inferencia con bajo consumo de VRAM: capacidad operativa destacada, con pesos comprimidos en GPU (7,2 GB) y descompresion bajo demanda.

## Casos de uso

- Investigacion en cuantizacion extrema: el checkpoint sirve como referencia para estudiar el impacto de 2,17 bpw en la fidelidad de la distribucion de tokens, comparando metricas como KLD (0,42922), acuerdo Top-1 (74,44%) y similitud coseno de logits (0,92726) frente al modelo de 16 bits.
- Despliegue en GPUs de consumo con VRAM limitada: con 7,2 GB de pesos comprimidos, el modelo puede caber en tarjetas de 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080) usando `low_vram=True`, algo inviable con el checkpoint original de 55,5 GB.
- Prototipado rapido de aplicaciones de chat: permite validar pipelines de generacion de texto en entornos con recursos escasos antes de migrar a una cuantizacion mayor (4 u 8 bits) o al modelo completo.
- Evaluacion comparativa de metodos de cuantizacion: util para benchmarks academicos que comparen DR frente a GPTQ, AWQ o GGUF en el mismo modelo base, gracias a la disponibilidad del checkpoint pre-desempaquetado en `Grawnch/Qwen3.8-27B-DR-2bit`.
- Experimentos de inferencia con descompresion en el dispositivo: el modulo `DRLinear` permite estudiar el trade-off entre latencia y memoria al mantener pesos comprimidos en VRAM y descomprimirlos por capa durante el forward pass.
- Educacion y divulgacion: ejemplo practico de empaquetado bit a bit de pesos y de evaluacion de fidelidad de cuantizaciones extremas en modelos de 27B.

## Benchmarks y rendimiento

| Metrica | Baseline 16 bits | DR (2 bits) |
|---|---|---|
| Bit-width efectivo / tamano empaquetado | 16,0 bpw (55,5 GB) | 2,17 bpw (7,2 GB) |
| Reduccion de MSE por capa vs. GPTQ estandar | — | 2,12x (-52,8%) |
| Neuronas de salida ganadas vs. GPTQ estandar | — | 99,31% (3.872.339 / 3.899.392) |
| Perplejidad in-domain (PPL) | 2,518 | 3,587 |
| KLD forward sobre vocabulario completo | 0,00000 | 0,42922 |
| Acuerdo Top-1 de tokens | 100,00% | 74,44% |
| Acuerdo Top-5 de tokens | 100,00% | 95,42% |
| Similitud coseno de logits | 1,00000 | 0,92726 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 7,2 GB para los pesos comprimidos con `low_vram=True`; el consumo adicional depende de la cache KV y del contexto, no documentado.
- Con `low_vram=False` los pesos se expanden a `nn.Linear` en bfloat16, lo que requeriria del orden de 55 GB de VRAM (equivalente al modelo de 16 bits), inviable en GPUs de consumo.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090 para el modo comprimido; A100 40/80 GB o H100 para el modo expandido.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas de VRAM usando `low_vram=True`.
- Opciones de despliegue: el autor proporciona `dr_loader.load_dr_packed` como unica via documentada; no se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La descompresion bajo demanda de `DRLinear` introduce overhead por capa cuyo impacto no se cuantifica en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Grawnch/Qwen3.8-27B-DR-2bit-Packed | 27B | no disponible | 2,17 bpw (7,2 GB) | apache-2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3.8-27B (base) | 27B | no disponible | 16 bpw (55,5 GB) | apache-2.0 | HuggingFace |
| Grawnch/Qwen3.8-27B-DR-2bit (pre-desempaquetado) | 27B | no disponible | bfloat16 reconstruido | apache-2.0 | HuggingFace |

No se dispone de informacion sobre cuantizaciones alternativas (GGUF, AWQ, GPTQ) del mismo modelo base en la informacion proporcionada, por lo que la comparativa con modelos de la misma categoria queda limitada a las variantes del propio autor.

## Limitaciones y advertencias

- Perdida de fidelidad significativa: el acuerdo Top-1 del 74,44% implica que aproximadamente uno de cada cuatro tokens generados difiere del modelo de 16 bits, lo que puede degradar tareas sensibles a la precision (codigo, matematicas, extraccion estructurada).
- Perplejidad incrementada: PPL de 3,587 frente a 2,518 del baseline, un aumento del 42,4% que sugiere mayor incertidumbre en la generacion.
- KLD de 0,42922 sobre el vocabulario completo indica una divergencia no trivial en la distribucion de probabilidad, con riesgo de alucinacion incrementado respecto al modelo original.
- Sesgos conocidos: no documentados en la model card; se heredan los del modelo base Qwen3.8-27B, no especificados.
- Idiomas soportados: no disponibles; se desconoce si la cuantizacion afecta de forma desigual a distintos idiomas.
- Limitaciones de contexto: la longitud de contexto del modelo base no se documenta, y la cuantizacion podria afectar al rendimiento en contextos largos.
- Dependencia de codigo no estandar: requiere el modulo `dr_loader` y `DRLinear`, no incluidos como paquete oficial de HuggingFace; no hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Madurez: repositorio con 0 descargas y 0 likes, publicado y actualizado el mismo dia (2026-11-01), sin validacion independiente de los benchmarks reportados.
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo cuantizado en produccion.
- Ausencia de datos de calibracion: no se especifica el dataset ni el procedimiento de cuantizacion, lo que dificulta reproducir o auditar el resultado.

## Enlaces

- Checkpoint empaquetado: https://huggingface.co/Grawnch/Qwen3.8-27B-DR-2bit-Packed
- Checkpoint pre-desempaquetado: https://huggingface.co/Grawnch/Qwen3.8-27B-DR-2bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
