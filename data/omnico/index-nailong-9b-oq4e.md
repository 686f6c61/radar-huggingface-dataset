# Omnico/Index-Nailong-9B-oQ4e

## Resumen

Index-Nailong-9B-oQ4e es una version cuantizada del modelo Index-Nailong-9B, un modelo de lenguaje de aproximadamente 8.950 millones de parametros con arquitectura de la familia Qwen 3.5 (etiqueta `qwen3_5` en el repositorio). El autor de la cuantizacion es el usuario Omnico, que ha aplicado la herramienta oQ de oMLX (version 0.7.3) para generar una cuantizacion de precision mixta orientada a la inferencia en Apple Silicon mediante el framework MLX.

El modelo original no esta documentado en la informacion disponible: no se especifica quien lo entreno, con que datos, ni bajo que licencia. Lo unico verificable es el resultado de la cuantizacion: un checkpoint de 8.953.803.264 parametros logicos almacenado en 5.047 GiB, con un promedio efectivo de 4.842 bits por peso y un esquema de precision mixta que combina bloques de 4, 5 y 6 bits con grupo de cuantizacion de tamano 64, mas una fraccion residual en BF16.

Su relevancia practica es acotada pero concreta: permite ejecutar un modelo de ~9B en equipos con memoria unificada modesta (Mac con 16 GB o mas) usando MLX, a costa de una perdida de precision respecto al checkpoint original que no esta cuantificada en la model card. Es un artefacto de cuantizacion, no un modelo con benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5, etiqueta `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precision mixta oQ: affine 4-bit (grupo 64), affine 5-bit (grupo 64), affine 6-bit (grupo 64) y residual BF16; media efectiva 4.842 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (cuantizacion MLX), libreria `mlx` |
| Tamano del repositorio | 5,4 GB (5.047 GiB de pesos) |
| Fecha de publicacion | 2026-11-02 (re-cuantizado 2026-11-03 con oMLX v0.7.3) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del modelo base ni su proceso de entrenamiento. La unica informacion estructural disponible es la etiqueta `qwen3_5`, que situa el modelo en la familia Qwen 3.5, y el recuento de parametros (8,95B), coherente con un transformer denso de escala ~9B. No se especifican numero de capas, dimension oculta, cabezas de atencion, tipo de atencion (completa o lineal/hibrida), tokens de entrenamiento, composicion del dataset ni si hubo fases de RLHF o DPO.

La innovacion tecnica documentada es exclusivamente la relativa a la cuantizacion. oQ (oMLX v0.7.3) aplica precision mixta asignando distintos anchos de bit a distintos tensores segun su sensibilidad, con cuantizacion afin por grupos de 64 elementos. La distribucion resultante es: 6.924B parametros (77,33%) en 4 bits, 1.012B (11,30%) en 5 bits, 1.017B (11,36%) en 6 bits y 0,001B (0,012%) en BF16. El almacenamiento efectivo es de 3,627 GiB en 4 bits, 0,648 GiB en 5 bits, 0,770 GiB en 6 bits y 0,002 GiB en BF16. Esta asignacion selectiva busca preservar la calidad en las capas mas sensibles sin disparar el tamano total del checkpoint.

## Capacidades

- Generacion de texto autoregresiva: capacidad esperada por tratarse de un modelo de lenguaje de ~9B, aunque no hay evaluacion publicada que la cuantifique.
- Razonamiento y conocimiento general: presumible por la familia Qwen 3.5, sin datos verificables en la informacion disponible.
- Generacion de codigo y matematicas: no confirmado en la model card.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declara lista de idiomas.
- Modo thinking, vision o audio: no disponible.
- Inferencia en Apple Silicon: capacidad operativa confirmada por el formato MLX del checkpoint.

## Casos de uso

- Inferencia local en Mac con memoria unificada: el checkpoint ocupa 5,4 GB, por lo que cabe en equipos de 16 GB de RAM unificada dejando margen para el contexto KV y el resto del sistema. Adecuado para prototipado offline sin GPU dedicada.
- Evaluacion comparativa de cuantizacion: util para medir la degradacion de calidad de un esquema de precision mixta (4/5/6 bits) frente al modelo original, gracias a la tabla de distribucion de bits publicada por el autor.
- Asistentes de texto en escritorio: integrable en aplicaciones macOS mediante MLX para tareas de redaccion, resumen o reescritura, siempre que se valide la calidad del modelo base.
- Procesamiento por lotes de documentos en local: al no requerir conexion ni GPU NVIDIA, sirve para pipelines de clasificacion o extraccion de texto en entornos con requisitos de privacidad.
- Base para ajuste fino ligero (LoRA/QLoRA) sobre MLX: el formato cuantizado permite experimentar con adaptadores de bajo rango en hardware de consumo, asumiendo soporte de la herramienta.
- Docencia y experimentacion: ejemplo practico de cuantizacion de precision mixta con grupos de 64 y calculo de bits efectivos por componente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente aporta metricas de almacenamiento y bits por peso, no de calidad (perplejidad, MMLU, HumanEval, GSM8K u otras).

## Requisitos de hardware

- VRAM/memoria unificada estimada para inferencia: ~5,4 GB solo para pesos; con contexto y buffers de ejecucion, se recomienda un minimo de 8 GB y, de forma realista, 16 GB de memoria unificada.
- GPU recomendadas: Apple Silicon (series M1, M2, M3, M4 y variantes Pro/Max/Ultra) mediante MLX. No es un checkpoint para CUDA sin conversion previa.
- Cabe en GPU de consumo: si, en Mac con 16 GB o mas de memoria unificada. En NVIDIA consumer (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB) requeriria conversion del formato MLX a otro runtime, no soportada de forma nativa por este repositorio.
- Opciones de despliegue: MLX (`mlx-lm`) y el ecosistema oMLX. No se distribuyen pesos GGUF, por lo que llama.cpp, Ollama y TGI no son utilizables directamente con este checkpoint.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Index-Nailong-9B-oQ4e (este) | 8,95B | no disponible | Mixta 4/5/6 bits, 4,842 bits/peso | no disponible | safetensors MLX |
| Modelo base Index-Nailong-9B | 8,95B (presumible) | no disponible | Original (BF16 presumible) | no disponible | no disponible |
| Qwen 3.5 9B (referencia de familia) | ~9B | no disponible | Multiples | no disponible | safetensors, GGUF |
| Alternativas ~8-9B en MLX 4-bit | ~8-9B | variable | 4 bits uniforme | variable | safetensors MLX |

No se dispone de datos de rendimiento del modelo base ni de alternativas verificadas en la informacion proporcionada, por lo que la comparativa se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido. Es imprescindible contactar con el autor o consultar el modelo base antes de cualquier despliegue en produccion.
- Modelo base sin documentar: se desconoce el origen de los datos de entrenamiento, los idiomas y las capacidades reales, lo que impide evaluar sesgos o alucinaciones con fundamento.
- Perdida de calidad por cuantizacion no medida: el esquema mixto a 4,842 bits/peso reduce el tamano pero no se publica ninguna comparacion de perplejidad o benchmarks frente al original.
- Riesgo de alucinacion: inherente a los modelos de ~9B; sin evaluacion publicada no puede acotarse.
- Dependencia de MLX: el checkpoint solo es utilizable en el ecosistema Apple; no hay GGUF ni versiones para vLLM, TGI o llama.cpp.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin validacion por parte de la comunidad.
- Re-cuantizacion reciente: el autor indica que se regenero el 2026-11-03 con oMLX v0.7.3; copias anteriores pueden diferir en pesos.
- Fecha de publicacion futura respecto a la mayoria de referencias: conviene verificar la integridad y procedencia del artefacto antes de usarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Omnico/Index-Nailong-9B-oQ4e
- Repositorio de la herramienta de cuantizacion oQ / oMLX: https://github.com/jundot/omlx
- Framework MLX (Apple): no disponible en la informacion proporcionada
- Modelo base Index-Nailong-9B: no disponible en la informacion proporcionada
- Paper o blog tecnico: no disponible en la informacion proporcionada
