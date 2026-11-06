# ducthang1703/crpd-qwen3-1p7b-to-0p6b-smoke-crpd-main

## Resumen

`crpd-qwen3-1p7b-to-0p6b-smoke-crpd-main` es un artefacto experimental publicado en Hugging Face por el usuario `ducthang1703` bajo el paraguas de una tecnica denominada ChunkRatio-PD (preference distillation con ratios de chunk). Se trata de un *smoke test*, es decir, una ejecucion de validacion con datos minimos cuyo unico proposito es comprobar que el pipeline de destilacion funciona de extremo a extremo. El propio autor lo declara explicitamente: "tiny data, not a usable model".

El modelo es el resultado de destilar el modelo profesor Qwen3-1.7B sobre el alumno Qwen3-0.6B-Base, empleando los datasets `hkust-nlp/deita-10k-v0` (instrucciones) y `HuggingFaceH4/ultrafeedback_binarized` (preferencias). El checkpoint resultante tiene 596.049.920 parametros y se distribuye en formato safetensors con licencia Apache 2.0, heredada del modelo base de Qwen.

Su relevancia es metodologica, no practica: documenta un experimento de destilacion de preferencias entre dos modelos de la familia Qwen3 y sirve como referencia reproducible (incluye revisiones de codigo y de datos) para quien investigue tecnicas de preference distillation. No debe emplearse en produccion ni evaluarse como un modelo conversacional terminado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), derivado de Qwen/Qwen3-0.6B-Base |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3 en su variante de 0,6B parametros: un transformer decoder-only denso con atencion por causalidad estandar y plantilla de chat propia de Qwen3 (`<|im_end|>` como EOS, con `enable_thinking=false`). El checkpoint se obtiene mediante ChunkRatio-PD, una variante de preference distillation en la que un modelo profesor de mayor tamano (Qwen3-1.7B) transfiere senal de preferencia al alumno de 0,6B.

Los datos de entrenamiento declarados son `hkust-nlp/deita-10k-v0` (dataset de instrucciones) y `HuggingFaceH4/ultrafeedback_binarized` (pares de preferencias). La model card incluye las revisiones exactas de codigo (`2ada3ba...`) y de cada dataset y modelo base, lo que permite reproducir el experimento. El autor advierte que los hiperparametros del piloto son suposiciones y no los de NARVAL, y que no se reclama ningun resultado de benchmark. La escala es `smoke`, con datos minimos.

## Capacidades

- Generacion de texto condicionada por plantilla de chat de Qwen3, en modo sin razonamiento explicito (`enable_thinking=false`).
- Alineamiento basico con preferencias humanas derivado del proceso de destilacion sobre UltraFeedback.
- Seguimiento de instrucciones limitado al dataset DEITA-10k empleado en el smoke test.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Reproduccion de experimentos de destilacion: sirve como referencia para validar un pipeline ChunkRatio-PD antes de lanzar ejecuciones a escala completa, comparando el checkpoint con la revision de codigo indicada.
- Docencia e investigacion en compresion de modelos: permite estudiar como se comporta un alumno de 0,6B al recibir senal de preferencia de un profesor de 1,7B en un regimen de datos minimos.
- Pruebas de integracion de `transformers` y TGI: al ser compatible con `text-generation-inference` y `endpoints_compatible`, se puede usar para validar despliegues de infraestructura sin consumir recursos significativos.
- Validacion de plantillas de chat: util para comprobar el manejo de `<|im_end|>` y `enable_thinking=false` en pipelines propios antes de migrar a checkpoints Qwen3 mayores.
- Benchmarking de herramientas de evaluacion: sirve como caso de control (modelo no usable) para verificar que un arnes de evaluacion detecta correctamente salidas de baja calidad.
- Estudio de sesgos inducidos por destilacion: al comparar con Qwen3-0.6B-Base se puede aislar el efecto del proceso de preference distillation en un conjunto reducido de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que "no benchmark result is claimed".

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1,2 GB solo para pesos (596M parametros x 2 bytes), mas overhead de activaciones y KV cache.
- VRAM estimada en fp32: aproximadamente 2,4 GB para pesos.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060); tambien cabe en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers`, `text-generation-inference` (TGI, declarado compatible), ademas de `llama.cpp` u `Ollama` si se convierte a GGUF (no se distribuye GGUF oficial).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| crpd-qwen3-1p7b-to-0p6b-smoke-crpd-main | 596M | no disponible | Apache 2.0 | Hugging Face | Smoke test, no usable |
| Qwen/Qwen3-0.6B-Base | ~0,6B | no disponible | Apache 2.0 | Hugging Face | Modelo base del anterior |
| Qwen/Qwen3-1.7B | ~1,7B | no disponible | Apache 2.0 | Hugging Face | Profesor del experimento |
| SmolLM2-360M-Instruct | ~360M | 8K (segun model card publica) | Apache 2.0 | Hugging Face | Alternativa pequena instruct |

## Limitaciones y advertencias

- El autor declara explicitamente que es un smoke test con datos minimos y que no es un modelo usable.
- No se han publicado benchmarks; cualquier evaluacion de calidad es responsabilidad del usuario.
- Los hiperparametros del piloto son suposiciones del autor, no los de NARVAL, por lo que los resultados no son directamente extrapolables.
- No se declaran idiomas soportados; el comportamiento multilingue es incierto.
- No se declara longitud de contexto; no debe asumirse la de Qwen3-0.6B-Base sin verificar.
- Riesgo elevado de alucinacion y salidas incoherentes por el regimen de entrenamiento minimo.
- Sesgos: no documentados; probable herencia de los sesgos de los datasets DEITA y UltraFeedback y del modelo base Qwen3.
- Licencia Apache 2.0 permite uso comercial, pero el estado del checkpoint lo desaconseja para produccion.
- Solo 26 descargas y 0 likes en el momento de la consulta; sin validacion por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ducthang1703/crpd-qwen3-1p7b-to-0p6b-smoke-crpd-main
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Dataset DEITA: https://huggingface.co/datasets/hkust-nlp/deita-10k-v0
- Dataset UltraFeedback binarized: https://huggingface.co/datasets/HuggingFaceH4/ultrafeedback_binarized
- Paper, blog o repositorio del metodo ChunkRatio-PD: no disponible en la informacion proporcionada.
