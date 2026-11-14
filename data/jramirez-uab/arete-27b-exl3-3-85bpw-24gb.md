# JRamirez-UAB/Arete-27B-EXL3-3.85bpw-24GB

## Resumen

Arete-27B-EXL3-3.85bpw-24GB es una cuantización no oficial de la comunidad del modelo NousResearch/Arete-27B, un ajuste fino supervisado (SFT) de Qwen3.8-27B desarrollado por Nous Research. Esta versión, publicada por el usuario JRamirez-UAB, aplica cuantización EXL3 con exllamav3 1.6.6 a 3,85 bits por peso (3,866 medidos), manteniendo el `lm_head` a 5 bits, la torre de visión a 6 bits, la cabeza MTP a 4 bits y los embeddings en BF16. El resultado son 15,9 GB de pesos (14,78 GiB en memoria de GPU) que, según el autor, caben en una tarjeta de 24 GB, aunque solo se ha validado en una A40 de 48 GB.

El modelo base Arete-27B se distribuye sin cabeza MTP (multi-token prediction), ya que el ajuste fino la desactivó. Esta cuantización injerta una cabeza MTP tomada sin modificar del modelo base Qwen3.8-27B (15 tensores `mtp.*`, cuantizados a 4 bits y no reentrenados sobre Arete) para habilitar la decodificación especulativa en vLLM. El foco declarado del autor es un agente local de administración de sistemas Linux en castellano (opencode con tool calling) para un departamento de TI universitario, y las trazas de calibración y evaluación reflejan ese caso de uso.

La relevancia del checkpoint reside en su estrategia de cuantización agresiva (3,85 bpw) con pérdida de calidad medida: divergencia KL de 0,01069 frente a BF16 en la traza pública de turboderp, perplejidad de 1,4461 frente a 1,4322, y 60/60 llamadas a herramientas válidas y correctas con la petición real de opencode. Se sirve mediante vLLM con el plugin `vllm-quantpack`, ya que EXL3 no es un formato nativo de vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.8-27B) con cabeza MTP injertada y torre de visión; cuantización EXL3 |
| Parametros totales | 7.946.737.024 (según safetensors del repo; el nombre comercial indica 27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; validados 65.536 tokens |
| Tipos de cuantizacion | EXL3 a 3,85 bpw (3,866 medidos), `lm_head` 5 bits, torre de visión 6 bits, cabeza MTP 4 bits, embeddings BF16 |
| Idiomas soportados | Español (es), inglés (en) |
| Licencia | Apache-2.0 (heredada de NousResearch/Arete-27B y Qwen3.8-27B) |
| Formato de pesos | safetensors (EXL3, dos shards + índice) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso derivado de Qwen3.8-27B, ajustado por Nous Research mediante supervisión (SFT) para producir Arete-27B. Esta cuantización no modifica la arquitectura del backbone: aplica EXL3 con asignación por tensor (3,85 bits en el backbone, 5 bits en `lm_head`, 6 bits en la torre de visión, 4 bits en la cabeza MTP) y conserva los embeddings en BF16. El conjunto de calibración combina el set estándar de exllamav3 con sesiones reales de agente sysadmin en español y pasos de agente generados por el propio modelo.

La innovación técnica principal es el injerto de una cabeza MTP de una sola capa (`mtp_num_hidden_layers: 1`) tomada sin reentrenar del Qwen3.8-27B base, que habilita decodificación especulativa en vLLM. El autor reporta una longitud media de aceptación de 2,93 a 3,45 tokens por paso con 3 tokens especulativos, y aceptación por posición de 0,82/0,63/0,48 hasta 0,88/0,81/0,76. La torre de visión es la propia de Arete (congelada por Nous durante el ajuste fino). El tokenizador y la plantilla de chat se mantienen sin cambios respecto a Arete; el procesador de imagen se declara como `Qwen2VLImageProcessorFast` porque exllamav3 1.6.6 rechaza el tipo original `Qwen2VLImageProcessor`.

## Capacidades

- Generación de texto conversacional en español e inglés.
- Razonamiento multi-paso con modo de razonamiento (`xhigh` en las pruebas del autor).
- Tool calling / function calling: 60/60 llamadas válidas y correctas con la petición real de opencode.
- Uso como agente de administración de sistemas Linux (ejecución real de comandos en las pruebas).
- Visión imagen-texto: 15/15 comprobaciones en cuatro tareas de imagen (captura de terminal, gráfico, salida de test de estrés, captura de procesos y puertos), incluido un turno de seguimiento sobre imagen en caché.
- Decodificación especulativa mediante cabeza MTP injertada.
- Capacidad de contexto largo (hasta 65.536 tokens validados, 262.144 nativos).
- Integración con vLLM mediante el plugin `vllm-quantpack` y compatibilidad con endpoints.

## Casos de uso

- Agente local de administración de sistemas Linux en castellano: el modelo ejecuta comandos reales y encadena llamadas a herramientas con la petición de opencode; es el caso de uso para el que se calibró y evaluó, con 60/60 tool calls correctas.
- Automatización de soporte técnico con contexto largo: sesiones de 65.536 tokens con caché KV en fp8 y 4 secuencias concurrentes sin preemptions reportadas, adecuado para conversaciones multi-turno con historial extenso.
- Análisis de capturas de terminal y gráficos: la torre de visión a 6 bits resuelve tareas de interpretación de pantallas y salidas de comandos, útil en diagnóstico remoto.
- Despliegue en estaciones de trabajo con GPU de 24 GB: los pesos ocupan 14,78 GiB, por lo que el autor prevé que quepan en tarjetas consumer de 24 GB (no medido), habilitando inferencia local sin servidor dedicado.
- Asistente de código y operaciones en pipelines: el soporte de tool calling y modo de razonamiento permite integrarlo en flujos de CI/CD o en asistentes de terminal.
- Inferencia con latencia reducida mediante decodificación especulativa: la cabeza MTP con aceptación media de 2,93-3,45 tokens por paso acelera la generación en vLLM.
- Procesamiento bilingüe español-inglés en entornos corporativos o académicos, con especial énfasis en el español.

## Benchmarks y rendimiento

| Metrica | Resultado | Referencia |
|---|---|---|
| Divergencia KL vs BF16 (traza pública turboderp) | 0,01069 (mediana 0,00042, p90 0,03216) | — |
| Divergencia KL vs BF16 (traza opencode) | 0,00945 | — |
| Divergencia KL vs BF16 (traza sysadmin propia) | 0,01294 | — |
| Perplejidad (pública) | 1,4461 | 1,4322 (BF16) |
| Perplejidad (opencode) | 2,7462 | 2,7317 (BF16) |
| Perplejidad (sysadmin propia) | 1,7081 | 1,6852 (BF16) |
| Tool calls con petición real de opencode | 60/60 válidas, 60/60 correctas | — |
| Visión (4 tareas de imagen) | 15/15 | — |
| Longitud media de aceptación MTP | 2,93 / 3,07 / 3,45 tokens por paso | 3 tokens especulativos |
| Aceptación MTP por posición | 0,82/0,63/0,48 a 0,88/0,81/0,76 | — |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 14,78 GiB de pesos en GPU; el autor no midió el consumo total con caché KV.
- GPU validadas: NVIDIA A40 (48 GB, Ampere, sm86) para todas las pruebas de servicio; RTX PRO 6000 Server Edition (96 GB, Blackwell) solo para las ejecuciones de KLD.
- Configuración validada en 48 GB: sesiones de 65.536 tokens, caché KV en fp8, `--kv-cache-memory-bytes 12000000000`, 4 secuencias, MTP 3, visión.
- GPU consumer: el autor indica que los pesos deberían caber en una tarjeta de 24 GB, pero **no se midió** en ninguna.
- Despliegue: vLLM 0.33.0 con el plugin `vllm-quantpack` 0.1.5, torch 2.14.0+cu132, exllamav3 1.6.6, FlashInfer 0.7.2.post1. EXL3 no es formato nativo de vLLM.
- Latencia y throughput: no disponibles; solo se reportan las métricas de aceptación MTP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Estado |
|---|---|---|---|---|---|
| Arete-27B-EXL3-3.85bpw-24GB (este) | 7.946.737.024 (nominal 27B) | 262.144 nativos / 65.536 validados | EXL3 3,85 bpw | Apache-2.0 | Cuantización comunitaria |
| NousResearch/Arete-27B (base) | No disponible | No disponible | BF16 | Apache-2.0 | Modelo original |
| Qwen3.8-27B (base del base) | No disponible | No disponible | BF16 | Apache-2.0 | Modelo original |

No se dispone de datos de benchmarks comparativos con otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- Cuantización no oficial: no es un lanzamiento de Nous Research, Alibaba Cloud ni el equipo Qwen.
- Solo se ha probado en una configuración concreta (A40 48 GB, vLLM 0.33.0, vllm-quantpack 0.1.5, FlashInfer 0.7.2.post1); otros entornos pueden fallar.
- No se ha medido en GPU de 24 GB pese al nombre del repositorio.
- Solo se validaron 65.536 tokens de contexto, frente a los 262.144 nativos; el modelo card de Arete indica entrenamiento a 64k.
- La cabeza MTP no fue reentrenada sobre Arete: se tomó del Qwen3.8-27B base, lo que puede introducir desajustes en dominios distintos al evaluado.
- Las evaluaciones se centran en un caso de uso (agente sysadmin Linux en español); los números en otros dominios o idiomas pueden diferir.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.
- Idiomas limitados a español e inglés.
- Licencia Apache-2.0 permite uso comercial, pero se hereda de los modelos base; conviene revisar LICENSE y NOTICE del repositorio.
- El procesador de imagen se declara como `Qwen2VLImageProcessorFast` por incompatibilidad de exllamav3 1.6.6 con el tipo original.

## Enlaces

- Hugging Face: https://huggingface.co/JRamirez-UAB/Arete-27B-EXL3-3.85bpw-24GB
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- exllamav3: https://github.com/turboderp-org/exllamav3
- vllm-quantpack: https://pypi.org/project/vllm-quantpack/
- Paper referenciado (arXiv:2406.11235): https://arxiv.org/abs/2406.11235
