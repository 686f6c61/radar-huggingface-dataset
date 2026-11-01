# Mxysx/lab7-shakespeare-generator

## Resumen

lab7-shakespeare-generator es un ajuste fino (fine-tuning) del modelo SmolLM2-135M de HuggingFaceTB, publicado por el usuario Mxysx. Se trata de un modelo de generacion de texto de pequeno tamano (134,5 millones de parametros) entrenado aparentemente para generar texto con estilo de Shakespeare, a juzgar por su nombre. El modelo se ha entrenado con la libreria Transformers y el Trainer de HuggingFace, y se distribuye en formato safetensors bajo licencia Apache 2.0.

El modelo parte de la arquitectura SmolLM2, un transformer decoder-only de la familia SmolLM2 disenada para ejecutarse en dispositivos con recursos limitados. Con 134,5 millones de parametros y un repositorio de solo 0,5 GB, es adecuado para experimentacion, prototipado rapido y despliegue en hardware modesto, aunque su capacidad general es muy limitada en comparacion con modelos de mayor tamano.

La relevancia de este modelo es principalmente educativa y experimental: se trata de un ajuste fino de un modelo base pequeno sobre un dataset no documentado, con una perdida de validacion de 3,2402. No dispone de benchmarks publicados ni de documentacion detallada sobre el dataset de entrenamiento, los idiomas soportados o los casos de uso previstos, por lo que debe evaluarse con cautela antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2) |
| Parametros totales | 134.515.008 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de HuggingFaceTB/SmolLM2-135M, un transformer decoder-only de 135 millones de parametros. El entrenamiento se realizo con el Trainer de HuggingFace utilizando los siguientes hiperparametros: learning rate de 0,0005, batch size de entrenamiento y evaluacion de 8, semilla 42, optimizador AdamW (variante fused, betas 0,9 y 0,999, epsilon 1e-08), scheduler coseno con 50 pasos de warmup y 2 epocas. El entrenamiento consto de 728 pasos en total.

La evolucion de la perdida muestra un descenso en entrenamiento desde 3,3220 (paso 100) hasta 2,4518 (paso 728), mientras que la perdida de validacion se estabiliza en torno a 3,24 tras un minimo de 3,2052 en el paso 300, lo que sugiere un cierto sobreajuste a partir de ese punto. No se documenta el dataset de entrenamiento, su composicion, el numero de tokens utilizados ni si se aplicaron tecnicas de RLHF o DPO. Las versiones de framework empleadas fueron Transformers 5.14.1, PyTorch 2.9.1+cu128, Datasets 5.0.0 y Tokenizers 0.22.2.

## Capacidades

- Generacion de texto autoregresiva basica, heredada de la arquitectura SmolLM2.
- Generacion de texto con estilo o tematica shakesperiana (segun el nombre del modelo; no verificado en la model card).
- Capacidad multilingue: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (thinking mode, vision, audio): no disponible.
- Razonamiento avanzado, codigo y matematicas: no documentado; el tamano del modelo (135M) limita severamente estas capacidades.

## Casos de uso

- Prototipado educativo de fine-tuning: el modelo sirve como ejemplo practico de ajuste fino de un modelo pequeno con el Trainer de HuggingFace, util en cursos y talleres de aprendizaje automatico.
- Generacion creativa de texto con estilo clasico: puede emplearse para experimentar con la generacion de parrafos con tono isabelino o shakesperiano, siempre con revision humana del resultado.
- Pruebas de pipelines de inferencia: al ser un modelo pequeno (0,5 GB), es adecuado para validar flujos de despliegue con Transformers o Text Generation Inference antes de escalar a modelos mayores.
- Experimentacion con tecnicas de generacion: permite probar parametros de decodificacion (temperatura, top-p, top-k) en un entorno de bajo coste computacional.
- Generacion de texto en entornos con recursos muy limitados: puede ejecutarse en CPU o en GPUs de gama baja para tareas de generacion de texto no criticas.
- Investigacion sobre sobreajuste y evaluacion de perdida: la curva de validacion documentada permite estudiar el comportamiento de modelos pequenos durante el fine-tuning.
- Base para nuevos ajustes finos: sirve como punto de partida para experimentos adicionales sobre el mismo dominio.

## Benchmarks y rendimiento

El autor no ha declarado resultados de benchmarks en la model card (la lista `results` del model-index esta vacia). El unico dato de rendimiento publicado es la perdida de validacion final de 3,2402.

| Metrica | Valor |
|---|---|
| Perdida de validacion final | 3,2402 |
| Perdida de entrenamiento final | 2,4518 |
| Perdida de validacion minima | 3,2052 (paso 300) |

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 0,54 GB solo para los pesos, mas overhead de activaciones y contexto.
- VRAM estimada en fp16/bf16: aproximadamente 0,27 GB para los pesos.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 0,14 GB; en 4 bits: aproximadamente 0,07 GB (estimaciones teoricas, no verificadas para este modelo).
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1060 6 GB, RTX 3060, RTX 4090) es mas que suficiente; tambien puede ejecutarse en CPU.
- Cabe holgadamente en cualquier GPU consumer e incluso en dispositivos de borde con suficiente memoria.
- Opciones de despliegue: Transformers (libreria nativa), Text Generation Inference (tag `text-generation-inference`), llama.cpp u Ollama si se convierte a GGUF (no se proporcionan pesos GGUF en el repositorio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| lab7-shakespeare-generator | 134,5 M | no disponible | Apache 2.0 | HuggingFace |
| HuggingFaceTB/SmolLM2-135M (base) | 135 M | no disponible en la informacion | Apache 2.0 | HuggingFace |
| SmolLM2-360M | 360 M | no disponible en la informacion | Apache 2.0 | HuggingFace |
| Qwen2.5-0.5B | 500 M | no disponible en la informacion | Apache 2.0 | HuggingFace |

No se dispone de datos de rendimiento comparativos para este ajuste fino. Frente al modelo base SmolLM2-135M, la unica diferencia documentada es el ajuste fino sobre un dataset no especificado, con una perdida de validacion de 3,2402. Los modelos de mayor tamano de la misma familia o de familias comparables ofrecen, en general, mayor capacidad, aunque no se dispone de cifras verificadas en la informacion proporcionada.

## Limitaciones y advertencias

- Dataset de entrenamiento no documentado: se desconoce la composicion, el origen y la calidad de los datos, lo que impide evaluar sesgos y riesgos de contaminacion.
- Perdida de validacion elevada (3,2402) y estabilizacion temprana: indica posible sobreajuste y calidad de generacion limitada.
- Riesgo alto de alucinacion y de texto incoherente, especialmente fuera del dominio de entrenamiento.
- Idiomas soportados no documentados; probablemente limitado al ingles por el dominio shakesperiano.
- Longitud de contexto no documentada; no debe asumirse ninguna ventana concreta.
- Sin benchmarks publicados: no es posible comparar su rendimiento de forma objetiva con otros modelos.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de documentacion sobre los datos de entrenamiento traslada al usuario la responsabilidad legal sobre el contenido generado.
- No apto para tareas criticas de produccion (atencion al cliente, generacion de codigo, decisiones automatizadas) sin una evaluacion exhaustiva previa.
- Model card autogenerada y sin revisar: la seccion de usos previstos y limitaciones figura como "More information needed".

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mxysx/lab7-shakespeare-generator
- Modelo base SmolLM2-135M: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Documentacion de Transformers: https://huggingface.co/docs/transformers
- Documentacion de Text Generation Inference: https://huggingface.co/docs/text-generation-inference
