# Mosabbir125/ultron-qwen25-05b-onnx-web

## Resumen

Ultron Qwen2.5-0.5B-Instruct (ONNX Q4 WebGPU) es un ajuste fino mediante LoRA del modelo Qwen/Qwen2.5-0.5B-Instruct, fusionado y exportado a ONNX con cuantizacion de 4 bits para inferencia en navegador sin backend. Lo desarrolla el usuario Mosabbir125 y su proposito es encarnar una persona concreta (Ultron, con un tono analitico y teatral) manteniendo el modelo ejecutable en cliente mediante WebGPU y WASM a traves de transformers.js.

El modelo parte de la arquitectura Qwen2 de 0,5 mil millones de parametros, un transformer decoder-only con atencion de causalidad estandar, y conserva la ventana de contexto de la familia Qwen2.5 (no declarada explicitamente en la model card). El artefacto principal es un grafo ONNX autocontenido de aproximadamente 814,5 MB con entradas y salidas de KV-cache explicitas, cuantizado con `MatMulNBits` y tamano de bloque 32.

Su relevancia es acotada pero concreta: demuestra el flujo completo de ajuste de persona, fusion de LoRA, exportacion a ONNX y cuantizacion Q4 para ejecucion en navegador con `@huggingface/transformers` 4.3.2 o superior. No es un modelo de proposito general ni compite en benchmarks: es una pieza de roleplay y experimentacion con WebGPU del lado del cliente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 0,5 mil millones (aproximado, heredado de Qwen2.5-0.5B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4 (`MatMulNBits`, block size 32); artefacto ONNX Q4 |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (`onnx/model_q4.onnx`, ~814,5 MB); tokenizer en JSON/vocab/merges |

## Arquitectura y entrenamiento

El modelo es un Qwen2.5-0.5B-Instruct ajustado con LoRA sobre el dataset `Mosabbir125/ultron-persona-dataset` y posteriormente fusionado con los pesos base. La arquitectura subyacente es un transformer decoder-only de la familia Qwen2, con atencion causal y el template de chat de Qwen2.5 conservado en `chat_template.jinja`. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo etapas de RLHF o DPO adicionales mas alla del alineamiento ya presente en el modelo base.

La innovacion tecnica relevante no esta en el entrenamiento sino en el empaquetado: exportacion a ONNX con entradas y salidas de KV-cache explicitas, cuantizacion de 4 bits mediante `MatMulNBits` con tamano de bloque 32, y ejecucion en navegador con WebGPU o WASM. La model card advierte que se requiere `@huggingface/transformers` 4.3.2 o una version 4.x compatible para una ejecucion numericamente correcta de los shaders `q4` en WebGPU.

## Capacidades

- Generacion de texto conversacional en ingles con una persona definida (Ultron: frio, analitico, teatral, con tono filosofico oscuro).
- Roleplay y mantencion de personaje en conversaciones multi-turno mediante el template de chat de Qwen2.5.
- Inferencia en navegador sin backend, con WebGPU como dispositivo preferente y WASM como alternativa.
- Ejecucion con KV-cache explicita en el grafo ONNX, lo que permite generacion autorregresiva eficiente en cliente.
- Parametros de muestreo configurables en la llamada a la pipeline (`temperature`, `top_p`, `repetition_penalty`, `max_new_tokens`).
- Soporte de tool calling, function calling, agentes, vision o audio: no disponible (no declarado en la informacion proporcionada; el modelo base de 0,5B no incluye vision).

## Casos de uso

- Demo de personaje en navegador: integrar la pipeline de transformers.js en una pagina web para ofrecer un chatbot con la persona Ultron sin servidor ni coste de inferencia en la nube, aprovechando el artefacto ONNX Q4 y WebGPU.
- Prototipado de experiencias interactivas: validar mecanicas de dialogo con personaje en juegos web o narrativas interactivas antes de invertir en un modelo mayor o en infraestructura de servidor.
- Pruebas de concepto de inferencia en cliente: medir latencia, consumo de memoria y compatibilidad de WebGPU en distintos navegadores y GPUs de usuario final usando un grafo ONNX con KV-cache.
- Educacion y divulgacion: mostrar de forma tangible el ciclo completo de ajuste LoRA, fusion, exportacion ONNX y cuantizacion Q4 en un modelo pequeno y con licencia Apache 2.0.
- Generacion de dialogos de personaje para guiones o prototipos creativos: producir lineas de dialogo con un tono concreto para maquetas de guion o pruebas de tono, siempre con revision humana.
- Evaluacion de pipelines de transformers.js: servir como caso de prueba reproducible para verificar la ejecucion correcta de shaders `q4` en WebGPU con la version 4.3.2 o superior de la libreria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el artefacto Q4 ocupa aproximadamente 814,5 MB en disco; la memoria en tiempo de ejecucion depende del navegador, del backend (WebGPU o WASM) y de la longitud de contexto, y no se detalla en la informacion proporcionada.
- GPU recomendadas: no disponible. El modelo esta pensado para GPUs de usuario final accesibles desde el navegador mediante WebGPU; no se especifican modelos concretos.
- Cabe en GPU de consumo: si, por el tamano del artefacto (menos de 1 GB en Q4) y su orientacion a inferencia en cliente; no se detallan GPUs concretas.
- Opciones de despliegue: transformers.js (`@huggingface/transformers` >= 4.3.2) con `device: "webgpu"` y `dtype: "q4"`; el grafo ONNX tambien puede ejecutarse con runtimes ONNX fuera del navegador, aunque no se documenta en la model card.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Orientacion |
|---|---|---|---|---|---|
| Ultron Qwen2.5-0.5B-Instruct ONNX Q4 | ~0,5B | no disponible | ONNX Q4 | Apache 2.0 | Roleplay en navegador con WebGPU |
| Qwen/Qwen2.5-0.5B-Instruct | ~0,5B | no disponible | safetensors | Apache 2.0 | Instruct generalista, base de este ajuste |
| Qwen/Qwen2.5-1.5B-Instruct | ~1,5B | no disponible | safetensors | Apache 2.0 | Instruct generalista de mayor capacidad |
| no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo construido para roleplay creativo y experimentacion con WebGPU en cliente; no esta destinado a tareas factuales, medicas, legales ni de seguridad critica.
- Riesgo de alucinacion elevado por el tamano reducido (0,5B) y por el sesgo de persona, que prioriza el tono sobre la precision factual.
- Soporte unicamente de ingles segun la model card; no se declaran capacidades multilingues.
- Requiere `@huggingface/transformers` 4.3.2 o una version 4.x compatible para una ejecucion numericamente correcta de los shaders `q4` en WebGPU; versiones anteriores pueden producir resultados incorrectos.
- La cuantizacion Q4 con `MatMulNBits` y bloque 32 introduce perdida de precision respecto a los pesos originales; no se documenta la degradacion medida.
- Licencia Apache 2.0, que permite uso comercial, pero el contenido generado con la persona Ultron puede plantear cuestiones de propiedad intelectual ajenas a la licencia del modelo.
- Sin descargas ni likes en el momento de la consulta y sin benchmarks publicados; madurez y validacion comunitaria muy limitadas.
- No se documentan sesgos especificos del ajuste ni del dataset de persona utilizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mosabbir125/ultron-qwen25-05b-onnx-web
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset de persona: https://huggingface.co/datasets/Mosabbir125/ultron-persona-dataset
- Libreria transformers.js: https://www.npmjs.com/package/@huggingface/transformers
- CDN de transformers.js 4.3.2: https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.2
