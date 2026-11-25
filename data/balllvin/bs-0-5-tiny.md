# balllvin/BS-0.5-Tiny

## Resumen

BS-0.5-Tiny es un adaptador LoRA de rango 48 (193 MB) desarrollado por el usuario balllvin sobre el checkpoint LFM3-1.7B-Abliterated-Arete-NVFP4, una variante del modelo LFM3 de 1.700 millones de parámetros de Liquid AI. No es un modelo completo, sino un adaptador PEFT que se carga sobre el modelo base y cuya finalidad es enseñar a un modelo pequeño y rápido a operar de forma limpia dentro de arneses de ejecución de herramientas, en concreto el modo PTC (`run_code`) de DeepSeek Harness (`@deepseek-ai/dsh`) y el entorno BS Code (`Balllvin/BS`). Su relevancia radica en que demuestra que un ajuste fino de bajo rango puede convertir a un modelo de 1,7B incapaz de emitir llamadas a herramientas válidas en un agente funcional que lee, parchea y verifica repositorios multiarchivo.

El adaptador se presenta como el primer hito de adaptación al arnés de la familia BS; el autor anuncia que BS-1.0-Tiny construirá capacidades de programación y seguridad más profundas sobre esta base. Según la model card, la calidad global compuesta pasa de 53,7 sobre 100 frente a 32,7 del modelo base, con la mejora concentrada en la ejecución válida de herramientas (de un 0,6 % a un 68,2 %) y en la reparación de errores multiarchivo con `bscode` (de un 0 % a un 16,7 %), sin pérdida de coherencia general.

La información disponible es limitada: no se detallan la arquitectura interna del modelo base ni la composición del dataset de entrenamiento, y no hay benchmarks estándar publicados. La ficha refleja únicamente los datos verificables de la model card y de los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre LFM3-1.7B; arquitectura del modelo base no detallada |
| Parametros totales | 1.700 millones en el modelo base; adaptador LoRA de rango 48 (193 MB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Modelo base publicado en NVFP4 (NVIDIA) y en formato MLX para Apple Silicon; el adaptador se distribuye en safetensors |
| Idiomas soportados | Inglés (en) |
| Licencia | lfm1.0 (Liquid AI LFM License, enlazada como "other") |
| Formato de pesos | safetensors (adaptador PEFT); modelo base en NVFP4 y MLX |

## Arquitectura y entrenamiento

El modelo base es LFM3-1.7B, un transformer de 1.700 millones de parámetros de Liquid AI, del que no se detallan en la información disponible ni la variante exacta de atención ni el número de tokens de entrenamiento. El checkpoint concreto sobre el que se aplica el adaptador, LFM3-1.7B-Abliterated-Arete-NVFP4, es una variante "abliterated" (con los mecanismos de rechazo atenuados) y cuantizada en NVFP4, publicada también en una build MLX para Apple Silicon.

BS-0.5-Tiny es un adaptador LoRA de rango 48 entrenado mediante PEFT para adaptar el modelo al protocolo de ejecución de herramientas PTC del arnés DeepSeek Harness, con soporte para trabajo en equipo de agentes activado o desactivado. No se especifican en la información proporcionada el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. El autor publica el conjunto de evaluación `balllvin/BS-1.0-Tiny-Evals`, que contiene las trazas, prompts y calificaciones de las cuatro evaluaciones pareadas utilizadas para medir la mejora.

## Capacidades

- Generación de texto en inglés y razonamiento de propósito general a escala de 1,7B parámetros.
- Ejecución válida de llamadas a herramientas en modo PTC (`run_code`) dentro de DeepSeek Harness: la tasa de llamadas válidas sube del 0,6 % al 68,2 %.
- Agencia real sobre repositorios: lectura, parcheo y verificación de bases de código multiarchivo mediante BS Code (`bscode`).
- Reparación de errores y tareas de seguridad end-to-end: resuelve 1 de cada 6 reparaciones completas en la evaluación del autor.
- Soporte de trabajo en equipo multiagente (agent teamwork) activado o desactivado, con configuración de hasta 3 agentes en `bscode`.
- Modo de pensamiento desactivable (`enable_thinking=False`), recomendado por el autor junto con `temperature=0.0`.
- Capacidades multilingües limitadas al inglés según los metadatos del modelo.

## Casos de uso

- Automatización de agentes de código en local: el adaptador permite que un modelo de 1,7B ejecute llamadas `run_code` válidas dentro de DeepSeek Harness, lo que hace viable desplegar un agente de programación en hardware modesto sin depender de APIs externas.
- Reparación de errores en repositorios multiarchivo: integrado en `bscode`, el modelo lee los archivos relevantes, aplica parches y verifica el resultado, con una tasa de éxito del 16,7 % en la evaluación del autor, adecuada para tareas acotadas y supervisadas.
- Asistencia de desarrollo en Apple Silicon: la build MLX con el motor `brainspa_lfm3serve` permite servir el modelo y el adaptador en un Mac, útil para prototipado y para entornos sin GPU NVIDIA.
- Evaluación de arneses de agentes: al publicarse trazas y calificaciones en `BS-1.0-Tiny-Evals`, sirve como banco de pruebas reproducible para comparar configuraciones de PTC y de trabajo en equipo.
- Tareas de seguridad de código acotadas: el adaptador está orientado a la detección y corrección de fallos en código, aunque con limitaciones claras en flujos de depuración de varios pasos.
- Despliegue con vLLM y LoRA dinámico: la carga con `--enable-lora` permite servir el adaptador junto al base en un servidor compatible con la API de OpenAI, integrándolo en pipelines internos de CI/CD para revisiones automáticas de parches.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card, correspondientes al índice compuesto de cuatro evaluaciones pareadas en `balllvin/BS-1.0-Tiny-Evals`:

| Evaluacion | Modelo base | BS-0.5-Tiny |
|---|---|---|
| Calidad global compuesta | 32,7 / 100 | 53,7 / 100 |
| Ejecucion valida de herramientas PTC | 0,6 % | 68,2 % |
| Tareas de `dsh` estandar (pass rate) | 40,0 % | 40,0 % |
| Reparacion de errores multiarchivo con `bscode` | 0,0 % | 16,7 % |
| Coherencia / no rechazo (`arete_guard`) | 90,0 % | 90,0 % |

Métricas adicionales reportadas: las llamadas a herramientas desperdiciadas caen un 32,8 % (de 555 a 373), las tareas de `dsh` se completan un 12,3 % más rápido, y en la prueba de contención en repositorios limpios el modelo edita archivos innecesariamente en 2 de 4 casos frente a 4 de 4 correctos. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el adaptador ocupa 193 MB; el modelo base de 1,7B en NVFP4 requiere del orden de 1-2 GB de VRAM, aunque no se especifica una cifra oficial en la información disponible.
- GPU recomendadas: NVIDIA Blackwell para la build NVFP4 (según el autor); cualquier GPU compatible con vLLM y PEFT para la variante PyTorch.
- Apple Silicon: soportado mediante la build MLX y el motor `brainspa_lfm3serve`.
- Cabe en GPU de consumo: sí, por el tamaño del modelo base (1,7B), aunque no se detallan modelos concretos de GPU de consumo en la información disponible.
- Opciones de despliegue: vLLM con `--enable-lora`, `transformers` + `peft` (`PeftModel`), y `brainspa_lfm3serve` en MLX.
- Latencia y throughput: no disponibles; el autor reporta una mejora del 12,3 % en tiempo de finalización de tareas de `dsh` respecto al base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BS-0.5-Tiny (adaptador) | 1,7B (base) | No disponible | Agentes de codigo en arneses PTC | lfm1.0 | Hugging Face |
| LFM3-1.7B (base original) | 1,7B | No disponible | Texto general | lfm1.0 | Hugging Face |
| Qwen2.5-Coder-1.5B | 1,5B | 32K (segun ficha publica) | Codigo | Apache 2.0 | Hugging Face |
| DeepSeek-Coder-1.3B | 1,3B | 16K (segun ficha publica) | Codigo | DeepSeek License | Hugging Face |

La comparación con alternativas de la misma escala es aproximada: no se dispone de evaluaciones cruzadas entre BS-0.5-Tiny y los modelos citados, y las cifras de contexto de las alternativas provienen de sus fichas públicas, no de la información proporcionada para este modelo.

## Limitaciones y advertencias

- En ejecuciones de depuración de varios pasos puede entrar en bucles repetidos de llamadas a herramientas.
- Edita ocasionalmente archivos que no necesitan cambios: 2 de 4 casos correctos en la prueba de contención en repositorios limpios.
- La tasa de reparación end-to-end es baja (1 de 6 tareas), por lo que no es adecuado para producción sin supervisión humana.
- Solo soporta inglés según los metadatos; no se declaran capacidades multilingües.
- La licencia lfm1.0 de Liquid AI puede imponer restricciones al uso comercial; es necesario revisar los términos en el enlace oficial antes de desplegarlo.
- El modelo base es una variante "abliterated" con los mecanismos de rechazo atenuados, lo que incrementa el riesgo de generar contenido inapropiado o inseguro.
- Riesgo de alucinación inherente a un modelo de 1,7B; no se han publicado evaluaciones específicas de factualidad.
- Requiere aceptar los términos del modelo base y autenticarse en Hugging Face antes de la descarga.
- No se especifican la longitud de contexto ni los datos de entrenamiento, lo que dificulta evaluar su comportamiento en ventanas largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/balllvin/BS-0.5-Tiny
- Modelo base NVFP4: https://huggingface.co/balllvin/LFM3-1.7B-Abliterated-Arete-NVFP4
- Modelo base MLX: https://huggingface.co/balllvin/LFM3-1.7B-Abliterated-Arete-NVFP4-MLX
- Dataset de evaluacion: https://huggingface.co/datasets/balllvin/BS-1.0-Tiny-Evals
- Repositorio BS Code: https://github.com/Balllvin/BS
- Licencia LFM de Liquid AI: https://www.liquid.ai/lfm-license
