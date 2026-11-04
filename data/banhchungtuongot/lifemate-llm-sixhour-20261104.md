# banhchungtuongot/lifemate-llm-sixhour-20261104

## Resumen

LifeMate LLM sixhour es un checkpoint de investigación derivado de Qwen3-4B-Instruct-2507, publicado por el usuario banhchungtuongot. No se trata de un modelo final ni de un bundle listo para producción: el propio autor lo describe como copias de seguridad de checkpoints (adaptadores LoRA y estados de optimizador reanudables) generados durante una sesión de entrenamiento de aproximadamente seis horas. El repositorio es público por una política de cuota de almacenamiento, mientras que el dataset derivado permanece privado.

El modelo parte de la base Qwen/Qwen3-4B-Instruct-2507 (commit cdbee75f17c01a7cc42f958dc650907174af0554) y explora dos ramas de continuación diferenciadas (B_fit_branch y C_fit_synthetic_branch), además de un candidato alternativo sobre Qwen/Qwen3.5-4B (commit 851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a). El autor reporta una puntuación oracle DEV de 0,515764 en Transformers y una estimación nativa de 0,516834, ambas calculadas con fórmulas locales documentadas y no con resultados de leaderboard.

Su relevancia es limitada y acotada al ámbito de investigación: sirve como ejemplo de pipeline de ajuste fino con LoRA sobre modelos Qwen3 de 4B, con cuantización NF4 de doble cuantización, contexto de 8192 tokens y entrenamiento orientado a tareas de agente (acción en JSON con pérdida CE específica para CALL/STOP). No debe confundirse con un modelo publicado y validado para uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-4B-Instruct-2507); adaptadores LoRA r16/alpha32/dropout 0.05 |
| Parametros totales | 4B (modelo base); adaptadores LoRA de rango 16 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (configuración de entrenamiento) |
| Tipos de cuantizacion | NF4 doble cuantización / BF16 durante entrenamiento; exportación NF4 nativa fiel documentada |
| Idiomas soportados | vi (vietnamita) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores PEFT y estados de optimizador) |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3-4B-Instruct-2507, un transformer decoder-only de 4B parámetros, mediante adaptadores LoRA de rango 16, alpha 32 y dropout 0.05. El entrenamiento se realizó con cuantización NF4 de doble cuantización y BF16, optimizador y scheduler reiniciados desde cero, LR 3e-5 con cosine y 5 % de warmup, microbatch 1 con acumulación 16, 68 actualizaciones y contexto de 8192 tokens. La función de pérdida combina cross-entropy sobre acciones en formato JSON con un término adicional de 0.25 sobre cross-entropy específica para tokens CALL/STOP, lo que orienta el ajuste hacia tareas de agente con invocación de herramientas.

Se distinguen dos continuaciones desde el checkpoint 120: B_fit_branch (datos propios) y C_fit_synthetic_branch (25 % de muestreo sintético), con la recomendación explícita de conservar C solo si supera a B en inferencia real. Adicionalmente, el checkpoint 136 sobre Qwen3.5-4B se presenta como candidato de backbone separado, no seleccionado únicamente por pérdida de entrenamiento. Cada prefijo incluye backup_inventory.json con tamaños en bytes y SHA256, además del marcador atómico original de completitud.

## Capacidades

- Generación de texto y razonamiento conversacional heredados del modelo base Qwen3-4B-Instruct-2507.
- Formato de salida orientado a acciones en JSON, con tokens CALL/STOP entrenados explícitamente para invocación de herramientas.
- Soporte de tool calling / function calling mediante el esquema de acciones JSON.
- Capacidad de razonamiento multi-paso orientada a agentes, según la formulación de la pérdida de entrenamiento.
- Contexto de hasta 8192 tokens durante el ajuste.
- Idiomas: vietnamita (vi) declarado; el resto de capacidades multilingües del base no se documentan en este repositorio.
- No se documentan capacidades de visión, audio ni modo thinking específicas para este checkpoint.

## Casos de uso

- Investigación de ajuste fino con LoRA: el repositorio sirve como referencia reproducible de un pipeline de seis horas con PEFT sobre Qwen3-4B, incluyendo configuración de optimizador, scheduler y pérdida.
- Estudio de pérdidas orientadas a agentes: la combinación de cross-entropy JSON con un término CALL/STOP permite analizar cómo influye el diseño de la función de pérdida en la tasa de invocación de herramientas.
- Comparación de ramas de datos: las ramas B (datos propios) y C (25 % sintético) permiten evaluar el impacto del muestreo sintético en la calidad de inferencia frente a la pérdida de entrenamiento.
- Evaluación de exportación NF4 fiel: el repositorio documenta instrucciones de exportación NF4 nativa, útil para validar pipelines de cuantización de adaptadores.
- Reproducción de evaluaciones locales: las puntuaciones oracle DEV y la estimación nativa permiten replicar la metodología de evaluación documentada en el repositorio GitHub del autor.
- Auditoría de integridad de checkpoints: el uso de backup_inventory.json con SHA256 y marcadores atómicos sirve como ejemplo de verificación de revisiones inmutables en almacenamiento remoto.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| Oracle DEV full232 (Transformers) | 0,515764 | Mejor puntuación completada reportada por el autor |
| Estimación nativa grounded full232 | 0,516834 | Replay independiente, fórmula local documentada |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las cifras anteriores son estimaciones locales con fórmula documentada y no resultados de leaderboard, según indica el propio autor.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8-10 GB en BF16 para el modelo base de 4B, más el overhead de los adaptadores LoRA; en NF4, en torno a 3-4 GB para los pesos del base.
- GPU recomendadas: el autor menciona una ruta de desarrollo en H100; para inferencia son suficientes A100, L40S o RTX 4090.
- Compatibilidad con GPU de consumo: sí, en tarjetas con 8 GB o más en NF4 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 en adelante).
- Opciones de despliegue: Transformers con PEFT (PeftModel.from_pretrained sobre el base fijado por commit); el repositorio no documenta integración con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| LifeMate LLM sixhour (este) | 4B + LoRA r16 | 8192 | Apache 2.0 | Checkpoint de investigación, no listo para producción |
| Qwen3-4B-Instruct-2507 | 4B | 262144 (según el base) | Apache 2.0 | Modelo publicado y validado |
| Qwen3.5-4B | 4B | no disponible | no disponible | Base alternativo usado como candidato de backbone |

La comparación con alternativas de la misma categoría (por ejemplo, Llama 3.2 3B Instruct o Gemma 3 4B) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo final: el autor indica explícitamente que son adaptadores y estados de optimizador reanudables, no un bundle listo para envío.
- No se reclama ninguna puntuación superior a 0,8; las cifras reportadas son estimaciones locales, no resultados de leaderboard.
- Los datos, audio, appstate, diagnósticos de muestra y credenciales originales no están incluidos; el dataset debe obtenerse por separado mediante la distribución autorizada del challenge.
- Riesgo de alucinación y sesgos: no documentados específicamente para este checkpoint; hereda los del base Qwen3-4B-Instruct-2507.
- Idioma: solo se declara vietnamita; el rendimiento en castellano u otros idiomas no está validado.
- Seguridad: no se deben deserializar estados de optimizador de fuentes no confiables (advertencia del propio autor sobre unpickling).
- Las configuraciones de adaptador pueden registrar rutas de desarrollo en H100, lo que requiere revisión antes de reutilizarlas.
- Uso comercial: la licencia Apache 2.0 lo permite, pero al ser un checkpoint de investigación sin validación, no se recomienda su uso en producción sin evaluación propia.
- No se realiza envío automático al organizador del challenge.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/banhchungtuongot/lifemate-llm-sixhour-20261104
- Repositorio GitHub del autor: https://github.com/NguyenDucAnforwork/lifemate
- Documentación del run: docs/LLM_SIX_HOUR_RUN.md (dentro del repositorio GitHub)
- Modelo base Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
