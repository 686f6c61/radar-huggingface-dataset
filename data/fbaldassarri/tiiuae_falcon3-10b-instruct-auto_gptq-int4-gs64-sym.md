# fbaldassarri/tiiuae_Falcon3-10B-Instruct-auto_gptq-int4-gs64-sym

## Resumen

Este repositorio contiene una versión cuantizada a 4 bits del modelo `tiiuae/Falcon3-10B-Instruct`, publicada por el usuario fbaldassarri. Se trata de un artefacto derivado, no de un modelo original: aplica cuantización de solo pesos (WoQ) mediante el algoritmo GPTQ implementado en Intel AutoRound v0.16.1, con 4 bits, tamaño de grupo 64 y cuantización simétrica. El objetivo es reducir el peso en memoria y acelerar la inferencia entre 2 y 3 veces, con una ligera pérdida de precisión respecto al modelo original en bf16.

El modelo base, Falcon3-10B-Instruct, es un transformer causal de tipo decoder-only desarrollado por el Technology Innovation Institute (TII) de Abu Dabi, orientado a generación de texto conversacional en inglés. La model card de este repositorio no detalla la longitud de contexto, la composición del dataset de entrenamiento ni los detalles de alineación del modelo original; esos datos deben consultarse en el repositorio de TII.

La relevancia de este artefacto es práctica: permite ejecutar un modelo de la familia Falcon3 en hardware Intel (CPU, iGPU Arc y NPU de la serie Core Ultra) mediante intel-extension-for-pytorch y OpenVINO, además de en GPUs convencionales a través de transformers. El repositorio declara 2.161.720.320 parámetros en los tensores safetensors, un dato que no concuerda con la denominación "10B" del modelo base y que conviene verificar antes de desplegarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (model_type declarado: llama) |
| Parametros totales | 2.161.720.320 según safetensors del repo; el modelo base se denomina Falcon3-10B-Instruct (discrepancia no aclarada en la model card) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 GPTQ (WoQ), group_size 64, simétrica; calibración en bf16 |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con configuración auto_gptq; compatible con transformers y text-generation-inference |

## Arquitectura y entrenamiento

El modelo base es un transformer causal decoder-only de la familia Falcon3 de TII, etiquetado en este repositorio con `model_type: llama`. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del corpus, ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineación en el modelo original.

La innovación técnica de este artefacto es la cuantización: se aplicó Intel AutoRound 0.16.1 con el algoritmo AutoGPTQ, cargando el modelo en `torch.bfloat16`, calibrando en CPU con 128 muestras, 200 iteraciones de ajuste, longitud de secuencia 512 y batch de 4. El proceso completo tardó 50.097,6 segundos (unas 835 minutos). El resultado son pesos INT4 de 4 bits con grupo de 64 y simetría, pensados para inferencia en CPU Intel, iGPU Arc (vía intel-extension-for-pytorch) y NPU de Core Ultra (vía OpenVINO), además de GPUs estándar.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat integrada (`apply_chat_template`) para formato instruct.
- Razonamiento y respuesta a instrucciones heredados del modelo base Falcon3-10B-Instruct.
- Generación de código y matemáticas: capacidad esperable del modelo base, aunque no se documentan evaluaciones específicas en este repositorio.
- Soporte de tool calling y function calling: no confirmado en la información disponible para este artefacto.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Capacidades multilingües: limitadas al inglés según el campo `language` de la model card.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Despliegue en equipos Intel sin GPU dedicada: el artefacto está cuantizado específicamente para CPU Intel, iGPU Arc y NPU Core Ultra mediante intel-extension-for-pytorch y OpenVINO, lo que permite ejecutar un modelo de la familia Falcon3 en portátiles y estaciones de trabajo convencionales.
- Asistentes conversacionales en inglés: el modelo incluye plantilla de chat instruct y puede gestionar diálogos multi-turno; útil para prototipos de atención al cliente o asistentes internos donde el inglés sea el idioma principal.
- Generación de texto en pipelines de CI/CD: al ser un artefacto de 8,4 GB en el repositorio, puede integrarse en flujos automatizados de generación de documentación o resúmenes con requisitos moderados de memoria.
- Investigación sobre cuantización: sirve como referencia reproducible para estudiar el impacto de GPTQ W4G64 en la calidad de un modelo Falcon3, con receta de replicación documentada paso a paso.
- Evaluación comparativa de backends: permite medir latencia y throughput en CPU, iGPU y NPU Intel frente a GPU, útil para decidir arquitecturas de despliegue en entornos corporativos con hardware heterogéneo.
- Fine-tuning ligero o adaptación posterior: al estar en formato safetensors compatible con transformers, puede servir de base para experimentos de adaptación con LoRA sobre un modelo ya cuantizado, aunque con las limitaciones propias de trabajar sobre pesos INT4.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo indica una aceleración de 2-3 veces y una "ligera caída de precisión" en W4G64, sin cifras concretas de MMLU, HumanEval, GSM8K ni comparaciones numéricas con el modelo en bf16.

## Requisitos de hardware

- VRAM estimada: los pesos INT4 ocupan aproximadamente 5,5 GB (2.161.720.320 parámetros a 4 bits con metadatos de grupo), aunque el repositorio completo pesa 8,4 GB. Con overhead de activaciones y caché KV, se recomienda reservar al menos 8 GB de memoria.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM para inferencia en transformers; RTX 4090, A100 y H100 ofrecen margen amplio. El artefacto está optimizado además para iGPU Intel Arc y NPU Core Ultra.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (RTX 3060 Ti, RTX 4060, RTX 4070, etc.), siempre que se ajuste el contexto para no desbordar la memoria.
- Opciones de despliegue: transformers (documentado en la model card), text-generation-inference (etiqueta presente), intel-extension-for-pytorch para CPU/iGPU Intel y OpenVINO para NPU. No se documenta compatibilidad con vLLM, llama.cpp u Ollama para este formato GPTQ concreto.
- Latencia y throughput: no disponibles. La model card solo afirma una aceleración de 2-3 veces frente a la versión en bf16, sin cifras absolutas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fbaldassarri/tiiuae_Falcon3-10B-Instruct-auto_gptq-int4-gs64-sym | 2.161.720.320 según safetensors (base denominada 10B) | no disponible | INT4 GPTQ W4G64 | apache-2.0 | Hugging Face, 0 descargas |
| tiiuae/Falcon3-10B-Instruct (modelo base) | 10B (según denominación) | no disponible | bf16 | apache-2.0 | Hugging Face, modelo oficial de TII |
| Otras cuantizaciones INT4 de Falcon3-10B-Instruct | no disponible | no disponible | INT4 (varios formatos) | apache-2.0 | no disponible en la información proporcionada |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La discrepancia entre el nombre "10B" del modelo base y los 2.161.720.320 parámetros declarados en safetensors no se explica en la model card; conviene verificar la integridad del artefacto antes de usarlo en producción.
- La cuantización W4G64 introduce una caída de precisión reconocida por el autor ("slight accuracy drop"), sin cuantificar; no es adecuada para tareas que exijan máxima fidelidad.
- El modelo solo declara soporte de inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan mitigaciones específicas en este artefacto.
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible.
- La model card indica `inference: false` en los metadatos, lo que puede afectar a la carga automática en algunos entornos; el ejemplo de uso con transformers sí está documentado.
- El autor declara que el modelo se ha desarrollado solo con fines de investigación y sin garantía; para uso comercial debe evaluarse con cautela pese a la licencia Apache 2.0.
- El repositorio registra 0 descargas y 0 likes, por lo que no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fbaldassarri/tiiuae_Falcon3-10B-Instruct-auto_gptq-int4-gs64-sym
- Modelo base: https://huggingface.co/tiiuae/Falcon3-10B-Instruct
- Intel AutoRound (framework de cuantización): https://github.com/intel/auto-round
- Receta de replicación (auto-round-pipeline): https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
