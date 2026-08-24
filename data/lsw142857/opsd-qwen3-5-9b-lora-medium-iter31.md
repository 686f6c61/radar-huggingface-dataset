# LSW142857/OPSD-Qwen3.5-9B-LoRA-Medium-iter31

## Resumen

OPSD-Qwen3.5-9B-LoRA-Medium-iter31 es un adaptador LoRA de entrenamiento para agentes de codificacion, desarrollado por LSW142857, que se monta sobre el modelo base Qwen/Qwen3.5-9B. El adaptador es el resultado de la iteracion 31 de un entrenamiento secuencial con el metodo OPSD (Optimization with Privileged Information) sobre 1.024 instancias del benchmark SWE-Gym, divididas en dos shards de 512 instancias cada uno. El objetivo es mejorar las capacidades de razonamiento y ejecucion de tareas de un agente de software (explorar, reproducir, diagnosticar, editar y verificar) sin que el estudiante reciba informacion privilegiada durante la inferencia.

El adaptador contiene 108.134.400 parametros LoRA (84 pares A/B) con rank 64, alpha 128 y dropout 0, y se distribuye como un tensor crudo de Slime/Megatron en formato safetensors. No es un directorio PEFT, por lo que no puede cargarse con `PeftModel.from_pretrained`; requiere el plugin de Qwen3.5 del codigo de entrenamiento OPSD. La licencia es Apache 2.0 y el repositorio ocupa 0,2 GB (solo el adaptador, sin pesos base). Este modelo es relevante porque demuestra una estrategia de entrenamiento con informacion privilegiada para agentes de codificacion, aunque su uso en produccion es limitado por la falta de evaluaciones publicas y por la dependencia de un pipeline de carga especifico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3.5-9B (dense vision-language transformer) |
| Parametros totales | 9.000.000.000 (base) + 108.134.400 (adaptador) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (base Qwen3.5-9B) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en BF16) |
| Idiomas soportados | no disponible para el adaptador; el base Qwen3.5-9B es multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador crudo Slime/Megatron, no PEFT) |

## Arquitectura y entrenamiento

El adaptador LoRA se aplica sobre el transformer denso de Qwen3.5-9B, un modelo vision-language con 262K de contexto y soporte nativo para function calling y tool use. El entrenamiento utiliza el metodo OPSD (Optimization with Privileged Information): el modelo base congelado recibe informacion privilegiada (Medium-PI) de forma separada para cada fase del agente (EXPLORE, REPRODUCE, DIAGNOSE, EDIT, VERIFY), mientras que el estudiante (el LoRA) no recibe dicha informacion. La fase SUBMIT se ejecuta pero sus tokens se enmascaran en la perdida.

El entrenamiento se realizo en dos fases secuenciales: actualizaciones 0 a 15 sobre el primer shard de 512 instancias, y actualizaciones 16 a 31 sobre el segundo shard disjunto de 512 instancias, con un batch global de 32. El objetivo de optimizacion es una divergencia KL forward condicional con top-64 a temperatura 0.6, mas una capa MTP (multi-token prediction) a escala 0.05. La tasa de aprendizaje del LoRA fue 1e-5, con topologia TP8/DP1 para el actor y dos motores TP4 para rollout. Las metricas finales de la iteracion 31 son finitas: loss 0.00545, grad norm 0.119.

## Capacidades

- Agente de codificacion: disenado para tareas de resolucion de issues en repositorios reales (SWE-Gym), con pasos de exploracion, reproduccion, diagnostico, edicion y verificacion.
- Razonamiento multi-paso: el entrenamiento OPSD busca mejorar la capacidad de planificacion y ejecucion de acciones secuenciales.
- Function calling y tool use: hereda del base Qwen3.5-9B, que soporta llamadas a herramientas y salidas estructuradas.
- Multimodalidad: el base Qwen3.5-9B acepta entradas de imagen y texto, aunque el adaptador no modifica esta capacidad.
- Longitud de contexto extensa: el base soporta 262144 tokens, util para repositorios grandes o historiales de ejecucion largos.
- Sin informacion privilegiada en inferencia: el adaptador no requiere PI durante la evaluacion, por lo que es util como agente autonomo.

## Casos de uso

- Resolucion automatica de issues en repositorios: el agente puede explorar el codigo, reproducir el bug, diagnosticar la causa, aplicar un patch y verificar el resultado, todo dentro de un entorno de ejecucion controlado.
- Asistente de depuracion en CI/CD: integrado en pipelines de integracion continua, el modelo puede analizar fallos de tests, proponer cambios y validarlos con los tests de regresion.
- Generacion de parches para vulnerabilidades: con el contexto largo y la capacidad de editar archivos, puede proponer parches para problemas de seguridad detectados por analizadores estaticos.
- Automatizacion de tareas de mantenimiento de codigo: refactorizacion de funciones, actualizacion de dependencias o correccion de problemas de estilo, guiado por instrucciones en lenguaje natural.
- Entrenamiento de agentes de codificacion en entornos academicos: sirve como punto de partida para estudiar el impacto de la informacion privilegiada en el entrenamiento de agentes RL.
- Evaluacion de pipelines de RL para coding: el adaptador y su codigo de entrenamiento permiten reproducir experimentos con OPS y comparar estrategias de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones sobre SWE-Gym, HumanEval, MMLU ni otros conjuntos de referencia. No se pueden comparar cifras de rendimiento con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el base Qwen3.5-9B en BF16 requiere aproximadamente 18-20 GB de VRAM solo para los pesos; el adaptador anade 0.2 GB. Con cuantizacion a 8 bits o 4 bits puede reducirse a 8-10 GB.
- GPUs recomendadas: para una ejecucion comoda con contexto largo, una GPU con 24 GB (RTX 4090, A10G) o superior; para despliegue multi-usuario, A100/H100 de 40-80 GB.
- Compatibilidad con consumer GPU: si, en tarjetas con al menos 16 GB de VRAM (por ejemplo, RTX 4080/4090) si se aplica cuantizacion, aunque el adaptador no esta empaquetado en formatos GGUF ni AWQ.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama o TGI de forma directa, ya que el adaptador es un tensor crudo Slime/Megatron. Se debe cargar mediante el plugin Qwen3.5 del repositorio `privilege-code-opsd`. No se recomienda MTP decoding especulativa en la evaluacion.
- Latencia y throughput: no disponibles. Dependen del hardware y de la configuracion de rollout (TP4 engines en el entrenamiento).

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables con la misma combinacion de adaptador LoRA sobre Qwen3.5-9B y entrenamiento con informacion privilegiada para agentes de codificacion. Alternativas genericas en el mismo tamano (Qwen3.5-9B base, Qwen3-8B, DeepSeek-Coder-V2-Lite) difieren en arquitectura y objetivo, y no se dispone de datos de rendimiento del adaptador para comparar.

## Limitaciones y advertencias

- El adaptador no es compatible con PEFT: `PeftModel.from_pretrained` fallara; se requiere el plugin Qwen3.5 del codigo OPSD.
- No incluye pesos base: es necesario descargar Qwen/Qwen3.5-9B por separado y cargarlo con el adaptador.
- La MTP (multi-token prediction) debe desactivarse durante la evaluacion para evitar inconsistencias.
- El entrenamiento se realizo sobre un subconjunto especifico de SWE-Gym (1.024 instancias); el rendimiento fuera de ese dominio no esta garantizado.
- No se han publicado evaluaciones de sesgos, alucinacion ni robustez del adaptador.
- El repositorio no tiene descargas ni likes, lo que sugiere que el modelo no ha sido validado por la comunidad.
- La licencia Apache 2.0 permite uso comercial, pero el codigo de entrenamiento y el plugin de carga pueden tener restricciones adicionales; verificar el repositorio `privilege-code-opsd`.
- El contexto de 262K es del base, pero el adaptador puede degradar el rendimiento en contextos muy largos si el entrenamiento no incluyo ejemplos de esa longitud.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LSW142857/OPSD-Qwen3.5-9B-LoRA-Medium-iter31
- Repositorio de entrenamiento: https://github.com/LeiLiLab/privilege-code-opsd (rama `opsd-pi-training`)
- Commit de la fase de continuacion: https://github.com/LeiLiLab/privilege-code-opsd/commit/8e75a5500c751e755c20d4697200fcf1e53d0a7f
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Referencia de Qwen3.5-9B en LLM Reference: https://www.llmreference.com/model/qwen3.5-9b
- Pagina de Qwen3.5 en Ollama: https://ollama.com/library/qwen3.5:9b
