# Jon-Nielsen/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16-exl3-4.00bpw

## Resumen

Este repositorio contiene una cuantización EXL3 de 4 bits por peso (4.00 bpw) del modelo `AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16`, un finetune "abliterado" (desensibilizado) del modelo Qwen/Qwen3.8-27B, desarrollado por el usuario Jon-Nielsen. El objetivo es ofrecer una versión ligera y eficiente de un modelo que elimina los rechazos y restricciones de seguridad del modelo original, manteniendo la coherencia y calidad de las respuestas. Está pensado para ejecutarse con ExLlamaV3 o TabbyAPI, y ocupa aproximadamente 16 GB en disco.

La relevancia de este modelo radica en su doble vertiente: por un lado, es una cuantización práctica para GPUs de consumo con 24 GB de VRAM (como la RTX 3090 o 4090), y por otro, representa un caso de estudio en técnicas de abliteración que buscan eliminar el "modo guardián" de los modelos de lenguaje sin degradar su capacidad. Incluye además una torre de visión y una cabeza de predicción multi-token (MTP) sin modificar respecto al modelo base, lo que lo hace multimodal y compatible con decodificación especulativa.

Cabe señalar una discrepancia: el nombre del modelo sugiere 27 mil millones de parámetros, pero los metadatos de los safetensors indican 8.430.253.296 parámetros (~8,4 B). Esta diferencia no está documentada en la model card y debe tenerse en cuenta al evaluar el modelo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida transformer-SSM (según tags y descripción), con torre de visión y cabeza MTP |
| Parametros totales | 8.430.253.296 (según metadatos safetensors; el nombre indica 27 B, discrepancia no documentada) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (nativo, según model card) |
| Tipos de cuantizacion | EXL3 4.00 bpw (este repo); existe sibling 6.00 bpw; el BF16 original es la referencia |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (cuantización EXL3 para ExLlamaV3) |

## Arquitectura y entrenamiento

El modelo base es `Qwen/Qwen3.8-27B`, un modelo de la familia Qwen3.8 que combina mecanismos de atención transformer con componentes de espacio de estados (SSM), según se deduce de los tags `qwen3_5`, `arxiv:2406.11717` (Mamba-2) y `arxiv:2503.00555`. La model card menciona que el checkpoint pasó por una "reparación de outliers conv1d SSM" (FernflowerAI) antes del finetune, lo que sugiere que el modelo original presentaba problemas de estabilidad en las capas SSM que fueron corregidos.

Sobre ese checkpoint reparado se aplicó una abliteración con la herramienta `abliterix` (versión 1.12.2, trial 48). El objetivo no fue minimizar la divergencia KL hacia cero (práctica común que sobre-edita el modelo), sino mantener la coherencia y mejorar la calidad de las respuestas. La abliteración resultante logró un KL de 0.0991 nats/token en un conjunto de 100 prompts inofensivos, con 0 rechazos directos en pruebas held-out. La torre de visión y la cabeza MTP se mantienen sin modificar respecto al base.

El entrenamiento se validó en una NVIDIA H200 con vLLM 0.27.1, usando thinking habilitado, MTP con 3 tokens especulativos y el parser de razonamiento Qwen3. La tasa de aceptación del draft MTP fue de 40-66% durante las pruebas.

## Capacidades

- Generación de texto y razonamiento con "modo pensamiento" (thinking) activable por petición, con niveles de esfuerzo configurables.
- Comprensión de imágenes (torre de visión del modelo base).
- Tool calling y function calling, con parser `qwen3_coder` y auto-tool-choice en vLLM.
- Soporte para agentes y razonamiento multi-paso gracias al modo thinking y al contexto largo de 262K tokens.
- Predicción multi-token (MTP) para decodificación especulativa, que acelera la generación.
- Capacidades multilingües no documentadas, aunque se espera que herede las del modelo base Qwen.
- Modelo "uncensored": no produce rechazos directos en dominios sensibles, aunque puede incluir avisos legales o de seguridad en las respuestas.

## Casos de uso

- Asistencia en investigación y redacción técnica: el modelo puede generar informes, resúmenes y explicaciones sobre temas complejos sin filtros de contenido, útil para investigadores que necesitan respuestas directas.
- Generación de código en producción: con soporte de tool calling, puede integrarse en pipelines de CI/CD para autocompletar código, revisar PRs o generar documentación técnica, aprovechando su contexto largo para proyectos extensos.
- Análisis de documentos extensos: su ventana de 262K tokens permite procesar libros, contratos o conjuntos de datos grandes en una sola pasada, con capacidad de razonamiento para extraer conclusiones.
- Creación de contenido narrativo sin restricciones: escritores pueden usarlo para generar ficción, guiones o diálogos en dominios que otros modelos rechazan, manteniendo coherencia y estilo.
- Automatización de atención al cliente en entornos controlados: aunque no tiene filtros de seguridad, puede gestionar conversaciones multi-turno con contexto largo; requiere supervisión humana para evitar respuestas inapropiadas.
- Prototipado de agentes autónomos: su capacidad de tool calling y razonamiento multi-paso lo hace adecuado para experimentar con agentes que planifican y ejecutan tareas complejas, aunque su naturaleza "uncensored" exige entornos aislados.
- Evaluación de técnicas de abliteración: sirve como referencia para estudiar el impacto de la desensibilización en la calidad y coherencia de las respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos son mediciones de rendimiento pre-release del propio autor, realizadas con una RTX PRO 6000, visión desactivada, KV en Q6, configuración de contexto 262K, prompt de 16K tokens y 512 tokens de generación, con draft MTP.

| Configuracion | VRAM pico | tok/s (con draft) | tok/s (sin draft) | PPL (40K tech) |
|---|---|---|---|---|
| 4.00 bpw | ~24 GB | ~61 | ~42 | 5.22 |
| 6.00 bpw | ~30 GB | ~58 | ~35 | 5.14 |

La cuantización de 4.00 bpw está pensada para GPUs de 24 GB (RTX 3090/4090), mientras que la de 6.00 bpw apunta a la RTX 5090 (32 GB). La perplejidad es ligeramente superior en 4.00 bpw (5.22 vs 5.14), como es esperable.

## Requisitos de hardware

- VRAM estimada: ~24 GB para 4.00 bpw con KV en Q6 y contexto de 262K; ~30 GB para 6.00 bpw.
- GPU recomendadas: RTX 3090, RTX 4090 o equivalente de 24 GB para 4.00 bpw; RTX 5090 o GPU de 32 GB para 6.00 bpw. El modelo BF16 original requiere una GPU de alta gama (H200, A100 80GB).
- Cabe en GPUs de consumo de 24 GB (serie RTX 3090/4090) con la cuantización de 4.00 bpw.
- Opciones de despliegue: ExLlamaV3 (formato nativo) y TabbyAPI; el modelo base BF16 se puede servir con vLLM, aunque este repo es específico para ExLlamaV3.
- Latencia y throughput: en la RTX PRO 6000, ~61 tok/s con draft MTP y ~42 tok/s sin draft para 4.00 bpw. En GPUs de 24 GB se espera un rendimiento algo menor.

## Comparativa con modelos similares

No se dispone de benchmarks comparativos con otros modelos de la misma categoría. Sin embargo, se puede comparar internamente con las variantes del mismo modelo:

| Modelo | Params | Contexto | Cuantizacion | VRAM | PPL (40K tech) | tok/s (draft) |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED (BF16) | ~27B (según nombre) | 262K | BF16 | >80 GB | no disponible | no disponible |
| Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED (EXL3 4.00 bpw) | ~8.4B (según metadatos) | 262K | EXL3 4-bit | ~24 GB | 5.22 | ~61 |
| Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED (EXL3 6.00 bpw) | ~8.4B (según metadatos) | 262K | EXL3 6-bit | ~30 GB | 5.14 | ~58 |

La discrepancia en el número de parámetros entre el nombre (27B) y los metadatos (8.4B) impide una comparación fiable con otros modelos de 27B o 8B. Se recomienda verificar el modelo base antes de usarlo en producción.

## Limitaciones y advertencias

- Modelo "uncensored": elimina los rechazos de seguridad, lo que puede generar contenido inapropiado, ilegal o dañino. No debe usarse en entornos sin supervisión humana.
- Sesgos y alucinaciones: no se han documentado evaluaciones de sesgo; como todo LLM, puede inventar información o mostrar sesgos heredados del entrenamiento.
- Riesgo de uso indebido: la ausencia de filtros facilita la generación de contenido malicioso (phishing, desinformación, etc.). El responsable del despliegue debe implementar sus propias salvaguardas.
- Discrepancia de parámetros: el nombre indica 27B pero los metadatos de safetensors muestran ~8.4B. Esto puede afectar a la planificación de recursos y a las expectativas de rendimiento.
- Dependencia de ExLlamaV3: el formato EXL3 no es compatible con otros runners (llama.cpp, Ollama, TGI) sin conversión previa.
- Rendimiento no validado en tareas estándar: no hay benchmarks de MMLU, HumanEval, etc., por lo que la calidad real en tareas específicas es desconocida.
- Contexto largo con límites prácticos: aunque el modelo soporta 262K tokens, el uso prolongado puede degradar la calidad de las respuestas y aumentar la latencia.

## Enlaces

- Repositorio del modelo cuantizado: https://huggingface.co/Jon-Nielsen/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16-exl3-4.00bpw
- Modelo base BF16: https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Sibling 6.00 bpw: https://huggingface.co/Jon-Nielsen/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16-exl3-6.00bpw
- Paper Mamba-2 (arxiv:2406.11717): https://arxiv.org/abs/2406.11717
- Paper relacionado (arxiv:2503.00555): https://arxiv.org/abs/2503.00555
