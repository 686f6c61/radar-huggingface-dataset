# cleyesode/Qwen3.8-Flash-Next-GSQ-RCO-GGUF-MTP

## Resumen

Qwen3.8-Flash-Next-GSQ-RCO-GGUF-MTP es un fine-tune del modelo ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-Coder-GGUF, publicado por el usuario cleyesode. Se trata de una variante GGUF de un modelo MoE (mixture of experts) de 117B parametros orientado a generacion de codigo, a la que se le ha injertado y entrenado una cabeza MTP (multi-token prediction) para habilitar decodificacion especulativa en tiempo de inferencia. El tronco del modelo se preserva bit a bit respecto al original mediante un proceso de desquantizacion sin perdida para el entrenamiento y una requantizacion que copia los bytes cuantizados originales de cada tensor no modificado.

La innovacion principal es la MTP head, cuantizada a Q4_K_M, que permite generar varios tokens por paso de decodificacion y aceptar secuencias de borrador mediante decodificacion especulativa. Segun la model card, esto eleva el throughput de decodificacion a 1,47x de media frente a la linea base sin MTP, con un rendimiento creciente a medida que aumenta la longitud de salida (1,10x en generaciones de 1K tokens, 1,40x en 8K y aproximadamente 1,47x por encima de 8K). El modelo esta pensado para servirse en llama.cpp y otros runtimes GGUF que soporten MTP o decodificacion especulativa.

El modelo reporta un total de 448.931.056 parametros en safetensors, pero la propia model card aclara que se trata de un error de reporte en Hugging Face y que el modelo real es de 117B parametros mas la cabeza MTP. El repositorio ocupa 60,3 GB y esta bajo licencia Apache 2.0. Es relevante ahora porque combina un modelo MoE de gran escala con cuantizacion agresiva (IQ1_M-style, ~1,89 bpw efectivos) y decodificacion especulativa, lo que permite desplegar un modelo de 117B en hardware de consumo agregado (seis RTX 5060 Ti de 16 GB, 96 GB totales) con contexto de hasta 262.144 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture of experts) con cabeza MTP (multi-token prediction) para decodificacion especulativa |
| Parametros totales | 117B (segun model card; el reporte de safetensors indica 448.931.056, dato erroneo segun el autor) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (configuracion de ejemplo en llama.cpp; ampliable via yarn) |
| Tipos de cuantizacion | Tronco en GSQ-RCO (IQ1_M-style, ~1,89 bpw efectivos); cabeza MTP en Q4_K_M; KV cache sin cuantizar (aunque el ejemplo usa q4_1 para K y V) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (multishard, 00001-of-00002) |

## Arquitectura y entrenamiento

El modelo es un transformer MoE con atencion y expertos enrutados, heredado del tronco de ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-Coder-GGUF. El tronco mantiene la cuantizacion mixta GSQ-RCO original (estilo IQ1_M, ~1,89 bits por peso efectivos sobre el transformer original), que incluye expertos enrutados, expertos compartidos, atencion, embeddings y componentes n-gram. Sobre este tronco se ha injertado una nueva cabeza MTP con 256 expertos (para igualar el tronco), cuantizada a Q4_K_M, que predice multiples tokens futuros y actua como modelo borrador en decodificacion especulativa.

El entrenamiento de la MTP head se realizo durante 3 epocas sobre 256 muestras de calibracion extraidas de la misma familia de distribuciones usada para la seleccion de expertos del modelo fuente (codigo, matematicas, STEM, seguimiento de instrucciones, conocimiento del mundo, tool calling y ciencia), con longitudes de secuencia entre 4.096 y 20.480 tokens. Se usaron AdamW (learning rate 5e-5 para el router, 2e-5 para atencion, normas y proyecciones) y Muon (1e-4 para el experto compartido). El proceso de preservacion es un round-trip sin perdida: cada tensor del tronco se fingerprinto por hash de bytes cuantizados durante la desquantizacion al formato HF; tras el entrenamiento, los tensores no modificados se restauraron copiando los bytes GGUF originales literalmente, preservando las rejillas y escalas GSQ exactamente. Solo los nuevos tensores MTP se cuantizaron de nuevo.

## Capacidades

- Generacion de texto y codigo: el modelo esta orientado a tareas de programacion, con enfasis en generacion, completado y razonamiento sobre codigo.
- Razonamiento matematico y STEM: la distribucion de calibracion incluye matematicas, STEM y ciencia.
- Capacidades MoE: enrutamiento a expertos especializados, con 256 expertos en la cabeza MTP para igualar el tronco.
- Decodificacion especulativa: la MTP head permite generar y verificar multiples tokens por paso, con tasas de aceptacion condicional del 67-73% y no condicional del 49-57% segun la tabla de metricas.
- Tool calling / function calling: incluido en la distribucion de entrenamiento de la MTP head (tool calling).
- Seguimiento de instrucciones: incluido en la distribucion de calibracion.
- Capacidades de vision: la model card indica que se debe usar el mismo mmproj que el modelo fuente para vision, por lo que hereda soporte multimodal del modelo base.
- Contexto largo: hasta 262.144 tokens en la configuracion de ejemplo, ampliable via yarn.
- Idiomas: no disponible en la informacion proporcionada.

## Casos de uso

- Generacion de codigo en produccion: el modelo puede integrarse en pipelines de CI/CD y asistentes de IDE para autocompletado y generacion de funciones, aprovechando su orientacion a codigo y su contexto de hasta 262.144 tokens para razonar sobre repositorios completos.
- Atencion al cliente automatizada: con 262.144 tokens de contexto puede gestionar conversaciones multi-turno largas y mantener el hilo de incidencias complejas, aunque su orientacion a codigo lo hace mas adecuado para soporte tecnico.
- Analisis de repositorios y refactorizacion: la ventana de contexto permite cargar archivos completos o multiples modulos y solicitar refactorizaciones, explicaciones o deteccion de bugs con coherencia global.
- Razonamiento matematico y STEM: util para resolver problemas de matematicas, fisica o ciencia con cadenas de razonamiento largas, gracias a la distribucion de entrenamiento que incluye estos dominios.
- Agentes autonomos con tool calling: el soporte de function calling y multi-step reasoning permite construir agentes que consulten APIs, ejecuten comandos y encadenen pasos, con la MTP head acelerando la generacion de planes y llamadas.
- Despliegue en hardware de consumo agregado: con ~58,4 GB de VRAM/RAM totales y cuantizacion GSQ-RCO, puede servirse en seis RTX 5060 Ti de 16 GB (96 GB) con llama.cpp, lo que lo hace viable para equipos de investigacion con presupuesto limitado.
- Servicio de inferencia de alto throughput: la decodificacion especulativa con MTP ofrece 1,47x de throughput medio en decodificacion, adecuado para servicios con generaciones largas (8K+ tokens) donde el coste de prefill se amortiza.

## Benchmarks y rendimiento

La model card no incluye resultados de benchmarks academicos (MMLU, HumanEval, GSM8K, etc.). Incluye metricas de rendimiento de inferencia (compute-only) comparando con y sin MTP:

| Input (tokens) | Output (tokens) | TTFT (ms) | Prefill (tok/s) | TPOT (ms) | Decode (tok/s) | E2E latency (s) | Accepted len | Cond Accept | Uncond Accept |
|---|---|---|---|---|---|---|---|---|---|
| 1.006 | 1.024 | 1.136 | 886 | 15,3 | 65,2 | 16,4 | 2,70 | 73,0% | 56,6% |
| 8.170 | 1.024 | 5.410 | 1.510 | 16,6 | 60,1 | 22,4 | 2,59 | 70,2% | 52,9% |
| 32.734 | 1.024 | 20.018 | 1.635 | 18,7 | 53,4 | 39,3 | 2,56 | 69,7% | 52,0% |
| 65.552 | 1.024 | 38.722 | 1.693 | 22,8 | 43,8 | 61,9 | 2,49 | 67,0% | 49,5% |
| 127.101 | 1.024 | 76.889 | 1.653 | 26,2 | 38,1 | 104,4 | 2,65 | 71,8% | 54,9% |

Linea base sin MTP:

| Input (tokens) | Output (tokens) | TTFT (ms) | Prefill (tok/s) | TPOT (ms) | Decode (tok/s) | E2E latency (s) |
|---|---|---|---|---|---|---|
| 1.006 | 1.000 | 1.011 | 996 | 20,6 | 48,4 | 22,1 |
| 8.170 | 1.024 | 4.429 | 1.845 | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: ~58,4 GB totales (mismo que el GGUF Coder fuente; la cabeza MTP anade solo una cantidad pequena). El conjunto residente esta dominado por el shard del transformer de ~29,6 GB.
- GPU recomendadas: el ejemplo de la model card usa seis RTX 5060 Ti de 16 GB (96 GB totales) con CUDA0-CUDA5. Por el volumen de VRAM, tambien seria viable en configuraciones con A100 80 GB, H100 80 GB o multiples RTX 4090 de 24 GB.
- Cabe en consumer GPU: si, pero requiere agregacion de varias GPU consumer (por ejemplo, seis RTX 5060 Ti de 16 GB). No cabe en una sola GPU consumer.
- Opciones de despliegue: llama.cpp (llama-server), y cualquier runtime GGUF que pueda cargar el modelo fuente y soporte una cabeza MTP / next-token prediction para decodificacion especulativa.
- Latencia y throughput: con MTP y num_speculative_tokens=3, decode de 65,2 tok/s a 1K de entrada, 60,1 tok/s a 8K, 53,4 tok/s a 32K, 43,8 tok/s a 65K y 38,1 tok/s a 127K. Prefill entre 886 y 1.693 tok/s. TTFT de 1,1 s a 76,9 s segun longitud de entrada. Mejora media de 1,47x en decodificacion frente a la linea base sin MTP (1,10x en 1K, 1,40x en 8K, ~1,47x por encima de 8K).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-GSQ-RCO-GGUF-MTP (este) | 117B (MoE) | 262.144 | Apache 2.0 | GGUF | MTP head para decodificacion especulativa, 1,47x decode |
| ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-Coder-GGUF | 117B (MoE) | no disponible | no disponible | GGUF | Modelo base sin MTP; sin aceleracion especulativa |
| Qwen3.8-Flash-Next (familia Qwen) | no disponible | no disponible | no disponible | no disponible | Modelo fuente de la familia; sin datos concretos en la informacion disponible |

No se dispone de datos de benchmarks academicos para establecer una comparativa de rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- El reporte de parametros en Hugging Face es erroneo (448.931.056 en safetensors frente a los 117B reales segun el autor); hay que verificar el tamano real antes de planificar el despliegue.
- La cuantizacion GSQ-RCO a ~1,89 bpw efectivos es extremadamente agresiva y puede degradar la calidad respecto al modelo en precision completa; no se han publicado evaluaciones de calidad.
- La cabeza MTP se entreno solo con 256 muestras de calibracion durante 3 epocas, lo que limita la generalizacion de la aceleracion especulativa a dominios fuera de la distribucion de calibracion.
- Las tasas de aceptacion de la decodificacion especulativa caen con la longitud de contexto (del 73,0% condicional a 1K al 67,0% a 65K), por lo que la ganancia de throughput no es uniforme.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en tareas de codigo donde una salida incorrecta puede compilar pero fallar en produccion.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Idiomas soportados: no disponible; la model card no detalla cobertura multilingue.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y los datos de entrenamiento pueden tener restricciones adicionales no detalladas.
- Requiere hardware multi-GPU (varios GB de VRAM agregada) y un runtime con soporte MTP; no es desplegable en una sola GPU consumer.
- La configuracion de ejemplo usa KV cache cuantizada a q4_1, lo que puede afectar a la calidad en contextos muy largos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/cleyesode/Qwen3.8-Flash-Next-GSQ-RCO-GGUF-MTP
- Modelo base: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-Coder-GGUF
- Paper referenciado (arxiv:2605.00649): https://arxiv.org/abs/2605.00649
- Paper referenciado (arxiv:2604.18556): https://arxiv.org/abs/2604.18556
