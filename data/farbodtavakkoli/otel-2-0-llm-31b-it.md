# farbodtavakkoli/OTel-2.0-LLM-31B-IT

## Resumen

OTel-2.0-LLM-31B-IT es un modelo de lenguaje especializado en telecomunicaciones desarrollado por el autor de Hugging Face `farbodtavakkoli`, post-entrenado a partir de Gemma 4 31B-IT de Google. Con 31.273.088.876 parámetros, representa el primer lanzamiento de la familia OTel 2.0 y está diseñado para flujos de trabajo de grado telco: operaciones de red, interpretación de estándares, desarrollo de producto, asistencia en configuración de red, RAG y respuesta a preguntas específicas del dominio.

El modelo se entrenó sobre aproximadamente 440.000 millones de tokens de telecomunicaciones, partiendo de un corpus bruto de unos 15.000 millones de tokens provenientes de GSMA a través de Open Telco AI, procesado con el Synthetic Data Generation Hub (SDG Hub) de Red Hat hasta superar el billón de tokens procesados. La técnica de ajuste empleada es OSFT (Orthogonal Subspace Fine-Tuning), un algoritmo de aprendizaje continuo del equipo de innovación de Red Hat AI que aprende en un subespacio ortogonal a las direcciones que contienen el conocimiento previo del modelo base, con el objetivo de absorber conocimiento de dominio sin degradar las capacidades generales de seguimiento de instrucciones.

Es relevante ahora porque demuestra un patrón de adaptación de dominio sobre un modelo multimodal grande con licencia Apache 2.0, entrenado íntegramente sobre infraestructura AMD (MI300X en Azure para procesamiento de datos, MI355X on-premise con Dell para el entrenamiento del modelo) y con disponibilidad de inferencia desde el día cero en Microsoft Foundry, Featherless AI y Red Hat. La arquitectura es `Gemma4ForConditionalGeneration`, con 832 tensores de lenguaje, 355 tensores de torre de visión y el proyector `embed_vision`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma4ForConditionalGeneration (transformer multimodal texto+imagen) |
| Parametros totales | 31.273.088.876 (31B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (longitud máxima de secuencia en entrenamiento: 4096) |
| Tipos de cuantizacion | no disponible (checkpoint publicado en bfloat16; existe variante QLoRA 4-bit NF4 fusionada a bf16) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 (license_link a Gemma 4) |
| Formato de pesos | safetensors, bfloat16, 15 shards (~62,6 GB), repo total 446,2 GB |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 31B-IT, un transformer multimodal con soporte arquitectónico de texto e imagen (torre de visión de 355 tensores más proyector `embed_vision`). El post-entrenamiento se realizó con OSFT (Orthogonal Subspace Fine-Tuning), descrito en Nayak et al., 2025 (arXiv:2504.07097), implementado mediante `training_hub` de Red Hat AI Innovation Team sobre el backend RHAI mini-trainer. OSFT descompone las matrices de pesos objetivo y aprende en un subespacio ortogonal a las direcciones que portan el conocimiento del modelo base, evitando el olvido catastrófico sin necesidad de un conjunto de replay con los datos originales.

La configuración de entrenamiento usó `unfreeze_rank_ratio=0.35` (deliberadamente hacia el extremo de preservación), 2 épocas, tamaño de batch efectivo 512, learning rate 2e-5 con schedule coseno, longitud máxima de secuencia 4096, enmascaramiento de pérdida solo en turnos del asistente para filas SFT y documento completo para filas de conocimiento, token EOS `<turn|>` (id 106), pesos maestros FP32 con cómputo BF16 y estados del optimizador en 8 bits (torchao `AdamW8bit`). El entrenamiento se ejecutó en 8× AMD MI355X (gfx950) con ROCm 7.2.1; el procesamiento de datos usó unas 530 GPUs en Microsoft Azure Managed Compute, principalmente AMD MI300X. La mezcla de entrenamiento actual no incluye ejemplos de MCP, tool-calling ni instruction-following específicos de telecomunicaciones.

## Capacidades

- Generación de texto en inglés con enfoque en dominio de telecomunicaciones.
- Respuesta a preguntas específicas de telco (QnA) y comportamiento de abstención entrenado.
- Soporte para flujos RAG (retrieval-augmented generation) sobre corpus de estándares y documentación telco.
- Interpretación de estándares de telecomunicaciones (corpus GSMA / Open Telco AI).
- Asistencia en configuración de red y operaciones de red.
- Datos estilo base-model para telecomunicaciones y ejemplos generales de instruction-following.
- Capacidad de tool-calling y function-calling heredada del modelo base, aunque la mezcla de entrenamiento no incluye ejemplos específicos de tool-calling telco.
- Modalidad de imagen estructuralmente soportada por la arquitectura, pero no ajustada al dominio (entrenamiento solo texto).
- Multilingüe: no disponible (solo inglés declarado).

## Casos de uso

- Asistencia en operaciones de red: el modelo puede responder consultas sobre configuración y diagnóstico de red apoyándose en el corpus de estándares telco, adecuado por su post-entrenamiento sobre 440B tokens del dominio.
- Interpretación de estándares GSMA: útil para consultar y resumir especificaciones y documentos normativos, gracias al corpus bruto de ~15B tokens provenientes de GSMA vía Open Telco AI.
- RAG sobre documentación interna de operador: el modelo fue entrenado con cobertura específica de RAG, lo que permite integrarlo en pipelines de recuperación y generación sobre bases documentales telco.
- Atención a clientes de telecomunicaciones: puede gestionar conversaciones multi-turno en inglés con contexto de hasta 4096 tokens durante entrenamiento, con comportamiento de abstención entrenado para evitar respuestas sin fundamento.
- Desarrollo de producto telco: asistencia en la redacción y revisión de material técnico de producto, apoyada en el conocimiento de dominio inyectado vía OSFT sin degradar el instruction-following general.
- Evaluación de adaptación de dominio: sirve como referencia para comparar OSFT frente a QLoRA sobre el mismo base (existe `OTel-2.0-LLM-31B-IT-QLoRA`), midiendo retención de capacidades generales frente a absorción de conocimiento telco.
- Despliegue en entornos con inferencia gestionada: disponible desde el día cero en Microsoft Foundry, Featherless AI y Red Hat, lo que facilita pruebas en producción sin infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 62,6 GB solo para pesos (checkpoint de 15 shards), más overhead de KV cache y activaciones; se recomienda al menos 80 GB por GPU para bf16 sin cuantizar.
- Cuantización: no se publican tipos de cuantización oficiales; una cuantización a 8 bits reduciría los pesos a ~31 GB y a 4 bits a ~16 GB, pero no hay artefactos oficiales confirmados.
- GPU recomendadas: AMD MI355X (gfx950, plataforma de entrenamiento), AMD MI300X (usada en procesamiento de datos), y GPUs con ≥80 GB para bf16 (A100 80GB, H100 80GB).
- ¿Cabe en GPU consumer? En bf16 no cabe en GPUs consumer de 24 GB; requeriría cuantización agresiva no oficial para intentarlo en RTX 4090.
- Opciones de despliegue: transformers (librería declarada), vLLM (tag incluido), endpoints compatibles (`endpoints_compatible`), despliegue en Azure (`deploy:azure`), Microsoft Foundry, Featherless AI y Red Hat.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OTel-2.0-LLM-31B-IT | 31B | no disponible (entrenamiento 4096) | Telecomunicaciones | apache-2.0 | HF, Microsoft Foundry, Featherless AI, Red Hat |
| google/gemma-4-31b-it (base) | 31B | no disponible | General | Gemma 4 license | HF |
| OTel-2.0-LLM-31B-IT-QLoRA | 31B | no disponible | Telecomunicaciones | apache-2.0 | HF |

## Limitaciones y advertencias

- Solo soporta inglés; no hay capacidades multilingües declaradas.
- La modalidad de imagen está estructuralmente presente pero no ajustada al dominio: el entrenamiento fue solo texto, por lo que el rendimiento en visión no debe asumirse.
- La mezcla de entrenamiento no incluye ejemplos de MCP, tool-calling ni instruction-following específicos de telecomunicaciones; el tool-calling depende del comportamiento heredado del base.
- Riesgo de alucinación en consultas técnicas fuera del corpus telco; el modelo incluye entrenamiento de abstención, pero no elimina el riesgo.
- Pesos flotantes: la model card advierte que los pesos pueden actualizarse; para evaluación reproducible o producción debe fijarse una revisión, hash o tag concreto.
- Licencia Apache 2.0 con enlace a la licencia de Gemma 4; conviene revisar los términos de Gemma 4 para uso comercial.
- Contexto de entrenamiento limitado a 4096 tokens; la longitud de contexto efectiva del base no se detalla.
- Tamaño del repositorio de 446,2 GB, lo que implica requisitos de almacenamiento y transferencia considerables.

## Enlaces

- Hugging Face: https://huggingface.co/farbodtavakkoli/OTel-2.0-LLM-31B-IT
- Modelo base: https://huggingface.co/google/gemma-4-31b-it
- Paper OSFT (Nayak et al., 2025): https://arxiv.org/abs/2504.07097
- Paper adicional referenciado: https://arxiv.org/abs/2610.07766
- Repositorio training_hub: https://github.com/Red-Hat-AI-Innovation-Team/training_hub
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
