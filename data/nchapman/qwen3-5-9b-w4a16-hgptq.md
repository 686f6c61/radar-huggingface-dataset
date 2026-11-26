# nchapman/Qwen3.5-9B-W4A16-HGPTQ

## Resumen

Qwen3.5-9B-W4A16-HGPTQ es una version cuantizada a 4 bits del modelo multimodal Qwen/Qwen3.5-9B, desarrollado por el usuario nchapman. El modelo base es el modelo de 9B de Qwen orientado a programacion, razonamiento, seguimiento de instrucciones y tareas de vision, y emplea una arquitectura de atencion hibrida con Multi-Token Prediction (MTP) integrado para decodificacion especulativa. Esta version cuantizada reduce el peso en disco de 17,98 GiB en BF16 a 6,67 GiB, un factor de 2,7x, manteniendo una calidad casi sin perdidas.

La cuantizacion no se limita al backbone de texto: tambien calibra y cuantiza el codificador de vision y la cabeza borrador de MTP a 4 bits, con una cabeza de salida en 8 bits. Esto la hace adecuada para GPUs de 12 GB, donde deja margen para contexto de 128K, entradas de vision y decodificacion especulativa. El modelo esta empaquetado con el formato compressed-tensors y rotacion de Hadamard, y esta optimizado para el runtime warp34, aunque tambien es compatible con vLLM 0.34 o superior.

Su relevancia actual radica en que permite desplegar un modelo multimodal de 9B con contexto largo en hardware de consumo, sin renunciar practicamente a calidad respecto al modelo original en 16 bits. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con atencion hibrida (base Qwen3.5) y Multi-Token Prediction (MTP) |
| Parametros totales | 10.703.777.520 (~10,7B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 128K (segun la model card, con margen en 12 GB) |
| Tipos de cuantizacion | W4A16 (pesos 4 bits, activaciones 16 bits), cabeza de salida en 8 bits, GPTQ con rotacion de Hadamard |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B emplea una arquitectura de atencion hibrida disenada para servir contexto largo de forma eficiente, e incorpora Multi-Token Prediction (MTP) para decodificacion especulativa. Esta version es una cuantizacion GPTQ de 4 bits con activaciones en 16 bits (W4A16), aplicada mediante compressed-tensors y rotacion de Hadamard, que distribuye la informacion de los pesos para reducir el error de cuantizacion. El proceso de calibracion cubre el backbone de texto, el codificador de vision y la cabeza borrador de MTP; la cabeza de salida se mantiene en 8 bits.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo base recibio RLHF o DPO, ya que la model card no lo detalla. La innovacion tecnica destacable es la cuantizacion integral de todos los componentes (texto, vision y MTP) con kernels CUDA de plena velocidad en warp34 sin flags adicionales.

## Capacidades

- Generacion de texto y razonamiento general.
- Programacion y generacion de codigo.
- Razonamiento matematico.
- Seguimiento de instrucciones (evaluado con IFEval).
- Vision: pipeline image-text-to-text, con codificador de vision cuantizado a 4 bits.
- Decodificacion especulativa mediante la cabeza MTP integrada.
- Contexto largo de hasta 128K tokens.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling y agentes: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de programacion en local: el modelo puede generar y revisar codigo en un equipo con GPU de 12 GB, gracias a su cuantizacion de 4 bits y su calidad en HumanEval+ cercana a la del modelo en 16 bits.
- Analisis de documentos e imagenes: al ser un modelo image-text-to-text con codificador de vision calibrado, permite extraer informacion de capturas, diagramas o documentos escaneados dentro de un mismo flujo.
- Procesamiento de contexto largo: con 128K tokens de ventana, resulta util para resumir repositorios completos, contratos extensos o transcripciones largas sin truncar.
- Servicio de inferencia con vLLM: desplegable mediante `vllm serve` para atender peticiones concurrentes con decodificacion especulativa MTP, mejorando el throughput.
- Razonamiento matematico asistido: adecuado para resolver problemas paso a paso (evaluado en MATH-500) en entornos de investigacion o educacion.
- Despliegue en estaciones de trabajo con RTX 30/40: el runtime warp34 permite servir el modelo en GPUs de 12 GB o, con contexto reducido, en 8 GB usando la variante W2.6.
- Prototipado de agentes multimodales: la combinacion de vision, contexto largo y MTP facilita experimentar con pipelines que alternan texto e imagen.

## Benchmarks y rendimiento

| Metrica | Modelo cuantizado (W4A16) | Modelo base BF16 |
|---|---|---|
| Media agregada (IFEval + MATH-500 + HumanEval+) | 83,35% | 84,41% |
| Concordancia aislada en vision | 99,3% | referencia |

Los datos proceden de la model card del autor. No se detallan resultados desagregados por benchmark en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 6,67 GiB de pesos en disco; en 12 GB cabe con contexto de 128K, vision y decodificacion especulativa. En 8 GB se recomienda la variante W2.6A16 (5,55 GiB).
- GPU recomendadas: RTX 30/40-series con 12 GB o mas (optimizado para warp34); tambien valido en A100, H100 y otras GPUs para vLLM 0.34+.
- Cabe en GPU de consumo: si, en tarjetas de 12 GB; en 8 GB con contexto reducido o la variante W2.6.
- Opciones de despliegue: warp34 (`warp34 serve`), vLLM 0.34+ (`vllm serve --trust-remote-code`), transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-W4A16-HGPTQ | ~10,7B | 128K | W4A16 (GPTQ + Hadamard) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-9B (BF16) | ~10,7B | 128K | 16 bits | Apache 2.0 | Hugging Face |
| Qwen3.5-9B-W2.6A16-HGPTQ-RCO | ~10,7B | no disponible | W2.6A16 | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos con modelos de otros desarrolladores en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion introduce una perdida de calidad medible: 83,35% frente a 84,41% del modelo en 16 bits en la media agregada.
- Riesgo de alucinacion inherente al modelo base; no se documentan tasas concretas.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Idiomas soportados: no disponibles; conviene validar el comportamiento en castellano antes de usarlo en produccion.
- La decodificacion especulativa MTP y el maximo rendimiento dependen de warp34 o de vLLM 0.34+; otros runtimes pueden no aprovechar estas optimizaciones.
- Requiere `--trust-remote-code` en vLLM, lo que implica ejecutar codigo del repositorio.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen3.5-9B para uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nchapman/Qwen3.5-9B-W4A16-HGPTQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Variante para 8 GB: https://huggingface.co/nchapman/Qwen3.5-9B-W2.6A16-HGPTQ-RCO
- Runtime warp34: https://github.com/nchapman/warp34
- Laboratorio de cuantizacion: https://github.com/nchapman/warp34-quant-lab
- Informe tecnico: TECHNICAL.md (referenciado en la model card, sin URL directa disponible)
