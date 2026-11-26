# nchapman/Qwen3.5-4B-W4A16-HGPTQ

## Resumen

Qwen3.5-4B-W4A16-HGPTQ es una cuantizacion de 4 bits del modelo multimodal Qwen/Qwen3.5-4B, desarrollada por el usuario nchapman. El modelo base, de Qwen, es un modelo equilibrado de 4B parametros orientado a chat local rapido, generacion de codigo, lectura de documentos y graficos, y seguimiento de instrucciones, construido sobre la arquitectura de atencion hibrida de Qwen e con Multi-Token Prediction (MTP) integrado para decodificacion especulativa.

Esta version cuantizada emplea GPTQ con rotacion Hadamard en formato W4A16 (pesos de 4 bits, activaciones de 16 bits) y se distribuye mediante compressed-tensors. La calibracion cubre el modelo completo: capas de texto, codificador de vision y el drafter especulativo MTP, de modo que las capacidades multimodales y de decodificacion especulativa funcionan sin ajustes adicionales. Segun el autor, conserva el 99,3% de concordancia top-1 en vision aislada y el 94,3% de concordancia en el borrador MTP respecto al modelo sin cuantizar en 16 bits.

El modelo ocupa 3,19 GiB en disco frente a 8,68 GiB en BF16 (2,7 veces mas pequeno), lo que lo hace viable en GPUs consumer de 6-8 GB. Esta optimizado para el runtime warp34 y tambien es compatible con vLLM 0.34 o superior. Resulta relevante para desarrolladores que necesitan desplegar un modelo multimodal con contexto largo y decodificacion especulativa en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion hibrida (Qwen3.5) y Multi-Token Prediction (MTP) |
| Parametros totales | 4.672.972.288 (4,67B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 (GPTQ con rotacion Hadamard), compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors, custom_code) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B emplea la arquitectura de atencion hibrida de Qwen, que combina mecanismos de atencion para equilibrar eficiencia y calidad en contextos largos. Incorpora Multi-Token Prediction (MTP), un modulo que predice varios tokens futuros de forma simultanea y actua como drafter para decodificacion especulativa, acelerando la generacion sin degradar la calidad. El modelo es multimodal (pipeline image-text-to-text), con un codificador de vision integrado para tareas de lectura de documentos y graficos.

La cuantizacion la realiza nchapman mediante GPTQ con rotacion Hadamard en esquema W4A16. La calibracion abarca el modelo completo de forma conjunta: capas de texto, codificador de vision y drafter MTP, lo que preserva las capacidades multimodales y especulativas tras la compresion. No se dispone de informacion sobre el dataset de calibracion, el numero de tokens de entrenamiento del modelo base ni si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento e instrucciones complejas (modelo orientado a instruction following).
- Generacion y comprension de codigo.
- Capacidades multimodales: lectura de documentos, graficos e imagenes (image-text-to-text).
- Decodificacion especulativa mediante MTP integrado, con el drafter tambien cuantizado.
- Compatibilidad con tool calling y function calling (heredada del modelo base Qwen3.5, segun la orientacion del modelo a agentes y chat).
- Soporte de despliegue en warp34 y vLLM con kernels CUDA a plena velocidad.
- Capacidades multilingues: no disponible el detalle de idiomas.

## Casos de uso

- Chat local en GPUs consumer: el modelo cabe en 3,19 GiB, por lo que puede ejecutarse en tarjetas de 6-8 GB (RTX 30/40-series) con warp34, dejando VRAM libre para contexto largo y concurrencia alta en un asistente personal.
- Lectura de documentos y graficos: al conservar el codificador de vision cuantizado, permite extraer informacion de capturas, tablas e imagenes en flujos de analisis documental sin necesidad de un modelo de vision separado.
- Generacion de codigo en pipelines de desarrollo: su orientacion a codigo e instruction following permite integrarlo en asistentes de IDE o revision de parches, con la ventaja de un footprint reducido para entornos de desarrollo locales.
- Despliegue en servidores modestos con vLLM: la compatibilidad con vLLM 0.34+ y el drafter MTP cuantizado permiten servir peticiones con decodificacion especulativa en hardware de gama media, mejorando el throughput por vatio.
- Prototipado de agentes multimodales: la combinacion de tool calling y vision facilita construir agentes que interpretan capturas o documentos y ejecutan acciones mediante funciones.
- Evaluacion de cuantizacion en produccion: util como referencia para equipos que comparan calidad W4A16 frente a BF16, dado que el autor publica metricas de concordancia (99,3% vision top-1, 94,3% MTP).
- Asistencia en dispositivos con VRAM limitada: alternativa a modelos mayores cuantizados a 2-3 bits cuando se prioriza estabilidad de calidad sobre tamano minimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta metricas de concordancia respecto al modelo sin cuantizar:

| Metrica | Valor |
|---|---|
| Concordancia top-1 en vision aislada | 99,3% |
| Concordancia del borrador MTP | 94,3% |
| Tamano en disco (W4A16) | 3,19 GiB |
| Tamano en BF16 | 8,68 GiB |
| Reduccion de tamano | 2,7x |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,19 GiB de pesos; con overhead de contexto y runtime, viable en GPUs de 6-8 GB.
- GPUs recomendadas: RTX 30/40-series de 6-8 GB o superiores (optimizado para warp34); tambien A100, H100 y GPUs de datacenter mediante vLLM.
- Cabe en GPU consumer: si, en tarjetas de 6-8 GB; el autor sugiere modelos mayores (Qwen3.5-9B-W2.6A16-HGPTQ-RCO, 5,55 GiB, o Qwen3.5-9B-W4A16-HGPTQ, 6,67 GiB) para 8-12 GB.
- Opciones de despliegue: warp34 (`warp34 serve`), vLLM 0.34+ (`--trust-remote-code`), transformers (custom_code).
- Latencia y throughput: no disponibles; el uso de MTP para decodificacion especulativa y kernels CUDA de warp34 esta orientado a maximizar velocidad, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-W4A16-HGPTQ (este) | 4,67B | no disponible | W4A16, 3,19 GiB | Apache 2.0 | Hugging Face |
| Qwen3.5-9B-W4A16-HGPTQ | ~9B (no confirmado) | no disponible | W4A16, 6,67 GiB | Apache 2.0 | Hugging Face |
| Qwen3.5-9B-W2.6A16-HGPTQ-RCO | ~9B (no confirmado) | no disponible | W2.6A16, 5,55 GiB | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-4B (base) | 4,67B | no disponible | BF16, 8,68 GiB | Apache 2.0 | Hugging Face |

Las alternativas listadas son variantes del mismo autor y familia; no se dispone de datos de rendimiento comparativo (benchmarks) para contrastar calidad entre ellas.

## Limitaciones y advertencias

- La cuantizacion W4A16 introduce una perdida de calidad no nula: el autor reporta 99,3% de concordancia en vision y 94,3% en MTP, lo que implica divergencias respecto al modelo BF16.
- No se dispone de informacion sobre sesgos del modelo base ni sobre su comportamiento en dominios sensibles.
- Riesgo de alucinacion inherente a modelos de 4B; no hay evaluaciones publicadas de fidelidad factual.
- Longitud de contexto e idiomas soportados no disponibles en la informacion; conviene verificar en la model card del modelo base antes de usarlo en produccion.
- Requiere `--trust-remote-code` en vLLM y el uso de custom_code, lo que implica ejecutar codigo del repositorio; auditar antes de desplegar.
- Optimizado para warp34; el rendimiento en otros runtimes puede no ser el esperado.
- Licencia Apache 2.0 permite uso comercial, pero debe respetarse la licencia del modelo base Qwen3.5-4B.
- Modelo con 236 descargas y 0 likes: ecosistema de validacion limitado, sin garantias de mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/nchapman/Qwen3.5-4B-W4A16-HGPTQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Runtime warp34: https://github.com/nchapman/warp34
- Laboratorio de cuantizacion: https://github.com/nchapman/warp34-quant-lab
- Variante 9B W4A16: https://huggingface.co/nchapman/Qwen3.5-9B-W4A16-HGPTQ
- Variante 9B W2.6A16: https://huggingface.co/nchapman/Qwen3.5-9B-W2.6A16-HGPTQ-RCO
