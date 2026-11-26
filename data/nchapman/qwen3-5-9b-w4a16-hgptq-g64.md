# nchapman/Qwen3.5-9B-W4A16-HGPTQ-g64

## Resumen

Qwen3.5-9B-W4A16-HGPTQ-g64 es una version cuantizada a 4 bits del modelo multimodal Qwen/Qwen3.5-9B, desarrollado originalmente por el equipo Qwen (Alibaba) y cuantizado por el usuario nchapman. El modelo base es un transformer multimodal de aproximadamente 9.000 millones de parametros (10.703.777.520 parametros reales segun los pesos en safetensors) disenado para tareas cotidianas de codigo, razonamiento, seguimiento de instrucciones y vision, con una arquitectura de atencion hibrida orientada al servicio de contextos largos y con Multi-Token Prediction (MTP) integrado para decodificacion especulativa.

Esta variante concreta aplica cuantizacion de pesos a 4 bits con activaciones a 16 bits (W4A16) mediante GPTQ combinado con rotacion de Hadamard, empaquetado con compressed-tensors. El resultado ocupa 6,67 GiB en disco frente a los 17,98 GiB del modelo en BF16 (2,7 veces mas pequeno), lo que lo hace apto para GPUs de 12 GB manteniendo margen para contexto de hasta 128K, entradas de vision y decodificacion especulativa.

Su relevancia actual radica en que permite ejecutar un modelo multimodal de 9B con calidad casi sin perdidas en hardware de consumo: segun el autor, obtiene un 83,35 % agregado en IFEval, MATH-500 y HumanEval+ frente al 84,41 % del modelo completo en 16 bits, y un 99,3 % de concordancia aislada en vision. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con atencion hibrida; cuantizacion GPTQ W4A16 con rotacion de Hadamard |
| Parametros totales | 10.703.777.520 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 128K (segun el autor, con margen en GPU de 12 GB) |
| Tipos de cuantizacion | W4A16 (pesos 4 bits, activaciones 16 bits), GPTQ, Hadamard; cabeza de salida a 8 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con compressed-tensors (compatible con transformers, vLLM y warp34) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B emplea una arquitectura de atencion hibrida disenada por Qwen para el servicio rapido en contextos largos, e incorpora Multi-Token Prediction (MTP) con una cabeza borrador (draft head) para decodificacion especulativa. Esta version cuantizada mantiene esa estructura y anade una calibracion de todo el pipeline, no solo del backbone de texto: el encoder de vision y la cabeza borradora de MTP tambien estan calibrados y cuantizados a 4 bits, con la cabeza de salida en 8 bits. Los pesos se empaquetan en formatos estandar de 4 y 8 bits con rotacion de Hadamard para que warp34 ejecute kernels CUDA a plena velocidad sin flags adicionales.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento del modelo base, la composicion del dataset ni si hubo fases de RLHF o DPO. Tampoco se detalla el proceso de calibracion mas alla de la mencion a la calibracion conjunta de backbone, vision y MTP. El autor remite a un informe tecnico (TECHNICAL.md) y al repositorio warp34-quant-lab para los detalles de cuantizacion y las pruebas de evaluacion.

## Capacidades

- Generacion de texto y razonamiento general, orientado a tareas cotidianas de codigo, razonamiento e instrucciones.
- Generacion y comprension de codigo (evaluado con HumanEval+).
- Razonamiento matematico (evaluado con MATH-500).
- Seguimiento de instrucciones (evaluado con IFEval).
- Vision: pipeline image-text-to-text, con encoder de vision calibrado y cuantizado a 4 bits; el autor reporta un 99,3 % de concordancia aislada en vision frente al modelo completo.
- Decodificacion especulativa mediante la cabeza MTP integrada.
- Soporte de contextos largos de hasta 128K tokens.
- Compatibilidad con vLLM (0.34+) y con el runtime warp34.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de codigo en estacion de trabajo local: con 6,67 GiB en disco y ajuste en GPUs de 12 GB, el modelo puede ejecutarse en una RTX 30/40-series para autocompletado, explicacion y refactorizacion de codigo, manteniendo contexto amplio para ficheros y repositorios medianos.
- Analisis de documentos con imagenes: al ser un modelo image-text-to-text con encoder de vision cuantizado, permite extraer y razonar sobre contenido de capturas, diagramas o documentos escaneados en un unico flujo, sin depender de un modelo de vision separado.
- Procesamiento de contextos largos en local: con hasta 128K tokens de ventana y atencion hibrida, es adecuado para resumir o consultar manuales tecnicos, contratos o bases de conocimiento extensas en una sola pasada.
- Servicio de inferencia con vLLM: el formato compressed-tensors y la compatibilidad con vLLM 0.34+ permiten desplegarlo como endpoint compatible con la API de OpenAI para prototipos y entornos de desarrollo.
- Evaluacion y experimentacion con cuantizacion: util para investigadores que quieran medir el impacto de W4A16 con Hadamard sobre un modelo multimodal, comparando contra el BF16 y contra la variante W2.6A16 del mismo autor.
- Despliegue en GPUs de 8 GB: mediante la variante W2.6A16 (5,55 GiB) del mismo autor, el modelo puede ejecutarse en tarjetas de 8 GB con margen extra para cache KV en contextos mas cortos.
- Generacion aumentada por recuperacion (RAG) local: la ventana de 128K y el soporte de vision permiten combinar fragmentos de texto recuperados con imagenes de soporte en un mismo prompt sin truncamientos agresivos.

## Benchmarks y rendimiento

| Benchmark | Modelo cuantizado W4A16 | Modelo base BF16 |
|---|---|---|
| Agregado IFEval + MATH-500 + HumanEval+ | 83,35 % | 84,41 % |
| Concordancia aislada en vision | 99,3 % | referencia |
| Tamano en disco | 6,67 GiB | 17,98 GiB |

Los datos proceden de la model card del autor. No se han publicado en la informacion disponible resultados desagregados por benchmark individual (MMLU, GSM8K u otros), ni cifras de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: aproximadamente 6,67 GiB de pesos; con cache KV para 128K de contexto y entradas de vision se recomienda un minimo de 12 GB de VRAM.
- GPUs recomendadas: RTX 30/40-series con 12 GB o mas (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090); el autor indica compatibilidad con GPUs de 8 GB usando la variante W2.6A16 y contextos mas cortos.
- Cabe en GPU de consumo: si, en tarjetas de 12 GB para esta variante y en tarjetas de 8 GB con la variante W2.6A16.
- Opciones de despliegue: warp34 (runtime recomendado por el autor), vLLM 0.34+ con `--trust-remote-code`, y transformers (libreria declarada, con `custom_code`).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-W4A16-HGPTQ-g64 (este) | 10.703.777.520 | hasta 128K | W4A16 GPTQ + Hadamard | Apache 2.0 | 6,67 GiB en disco, vision y MTP calibrados |
| Qwen/Qwen3.5-9B (base) | no disponible (9B nominal) | no disponible | BF16 | Apache 2.0 | 17,98 GiB en disco, referencia de calidad |
| Qwen3.5-9B-W2.6A16-HGPTQ-RCO | mismo base | no disponible | W2.6A16 | Apache 2.0 | 5,55 GiB, orientado a GPUs de 8 GB |

No se dispone de datos para comparar con modelos de otros fabricantes de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 4 bits implica una perdida de calidad medible: el agregado cae del 84,41 % al 83,35 % segun el autor, y la concordancia en vision es del 99,3 %, no del 100 %.
- No se dispone de informacion sobre sesgos del modelo base ni sobre su comportamiento en idiomas distintos del ingles; la model card no lista idiomas soportados.
- Riesgo de alucinacion inherente a los modelos de lenguaje de este tamano; no se documentan evaluaciones especificas de factualidad.
- La licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen/Qwen3.5-9B; conviene verificar la model card original para cualquier restriccion adicional.
- El despliegue en vLLM requiere `--trust-remote-code` y una version 0.34 o superior; el rendimiento optimo esta ligado al runtime warp34 del mismo autor.
- La variante esta calibrada para warp34; otros runtimes pueden no aprovechar los kernels optimizados y ofrecer menor rendimiento.
- No se documentan limites especificos de contexto mas alla de los 128K indicados, ni comportamiento en contextos extremos con vision.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nchapman/Qwen3.5-9B-W4A16-HGPTQ-g64
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Variante para 8 GB: https://huggingface.co/nchapman/Qwen3.5-9B-W2.6A16-HGPTQ-RCO
- Runtime warp34: https://github.com/nchapman/warp34
- Repositorio de cuantizacion: https://github.com/nchapman/warp34-quant-lab
- Informe tecnico: TECHNICAL.md (referenciado en la model card, sin URL directa disponible)
