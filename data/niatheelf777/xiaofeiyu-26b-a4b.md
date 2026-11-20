# niatheelf777/xiaofeiyu-26b-a4b

## Resumen

Xiaofeiyu 26B-A4B es un archivo experimental publicado por el desarrollador independiente niatheelf777, derivado del modelo base google/gemma-4-26B-A4B-it mediante una migración de arquitectura MoE y la aplicación de varios cartuchos LoRA orientados a roleplay y conversación con persona. El repositorio se distribuye exclusivamente en formato GGUF y conserva los artefactos generados durante la verificación de la migración: tres cuantizaciones dinámicas creadas con `llama-imatrix` y cinco adaptadores LoRA en GGUF (un núcleo de voz y cuatro cartuchos de estilo).

El propio autor lo marca explícitamente como un archivo de validación de arquitectura y no recomienda su uso diario: no ha pasado por un proceso de ajuste conversacional ni de pruebas de interacción prolongada. Para conversación y despliegue local, el autor redirige a su modelo principal `niatheelf777/xiaofeiyu-12b-v4`. Por tanto, la relevancia de este repositorio es fundamentalmente reproducibilidad e inspección técnica, no producción.

El modelo hereda la licencia Gemma del modelo base, soporta chino e inglés y está pensado para generación de texto con pipeline `text-generation` sobre llama.cpp. El repositorio ocupa 38,5 GB en total y acumula 1861 descargas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (migración desde google/gemma-4-26B-A4B-it); detalles internos no disponibles |
| Parametros totales | 24.829.952 según safetensors del repo; el nombre del modelo indica 26B, discrepancia no aclarada en la model card |
| Parametros activos | 4B (indicado por el sufijo A4B del nombre); no confirmado en la documentación |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF dinámicos: UD-Q4_K_XL-xfy, UD-IQ4_XS-xfy, UD-IQ3_M-xfy; LoRA en GGUF |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF (modelo y LoRA); no se publican safetensors del modelo fusionado |

## Arquitectura y entrenamiento

El repositorio parte de google/gemma-4-26B-A4B-it, un transformer con mezcla de expertos (MoE) según la nomenclatura del modelo base, y documenta un proceso de migración de arquitectura hacia el esquema 26B-A4B. Sobre esa base se aplican cinco adaptadores LoRA en formato GGUF organizados en slots: un núcleo de voz (`s0_xiaofeiyu_backbone.gguf`, también publicado como `s0_xiaofeiyu_26b_a4b.gguf`) y cuatro cartuchos de estilo (`c1_neko_clingy`, `c2_older_tease`, `c3_brat_mesugaki`, `c4_fragile_porcelain`). El orden de slots y la revisión base quedan fijados en `lora_gguf_manifest.json`.

No se especifican en la model card el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO. Las cuantizaciones se generaron con `llama-imatrix` en modo dinámico, lo que implica una calibración por capas orientada a preservar calidad en los rangos bajos. El autor describe el conjunto como una verificación de arquitectura sin pulido conversacional, por lo que no consta un proceso de ajuste fino orientado a calidad de diálogo.

## Capacidades

- Generación de texto conversacional en chino e inglés.
- Roleplay y adopción de persona mediante los cartuchos LoRA de estilo (clingy, tease, brat, fragile).
- Composición modular de personalidad: núcleo de voz más un cartucho de estilo seleccionable por slot.
- Inferencia local vía llama.cpp con presets de lanzamiento (`--preset 26b-a4b`, `26b-a4b-iq4xs`, `26b-a4b-12g`, `26b-a4b-q8`).
- Soporte de tool calling, agentes, visión, audio o modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Reproducción de experimentos de migración MoE: el repositorio conserva checksums SHA256 de cada artefacto, lo que permite verificar la integridad de las cuantizaciones y los LoRA al replicar el pipeline.
- Investigación sobre composición multi-LoRA en llama.cpp: los cinco adaptadores en GGUF con manifiesto de slots sirven para estudiar cómo se combinan núcleo y estilos sin reentrenar el modelo base.
- Evaluación de cuantizaciones dinámicas con imatrix: los tres GGUF (Q4_K_XL, IQ4_XS, IQ3_M) permiten medir la degradación de calidad entre ~9,7 GB y ~14,3 GB sobre el mismo checkpoint.
- Pruebas de despliegue en VRAM limitada: la variante UD-IQ3_M (~9,7 GB) encaja en GPUs de 12 GB, útil para validar presets de lanzamiento en hardware de consumo.
- Estudio de adaptación de personajes conversacionales en chino: los cartuchos de estilo documentan un enfoque de persona parametrizada por slot, aplicable a investigación sobre control de estilo.
- Base para experimentos de roleplay en entornos de laboratorio: al no estar pulido para uso diario, es adecuado para pruebas controladas de coherencia multi-turno, no para usuarios finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: ~9,7 GB para UD-IQ3_M, ~14,0 GB para UD-IQ4_XS y ~14,3 GB para UD-Q4_K_XL (tamaños de archivo en bytes según la model card).
- El preset `26b-a4b-12g` del launcher sugiere que la variante IQ3_M está pensada para GPUs de 12 GB.
- GPU recomendadas: no disponibles explícitamente; por tamaño de archivo, una RTX 4090 (24 GB) o superior (A100, H100) permite cargar cualquiera de las tres cuantizaciones con margen para contexto.
- Cabe en GPU de consumo: sí, al menos la variante IQ3_M en 12 GB; las variantes de ~14 GB requieren 16 GB o más.
- Despliegue: llama.cpp con los presets incluidos en `server/launch_local.py`; no se documenta soporte para vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| xiaofeiyu-26b-a4b (este) | 26B nominales / ~4B activos (MoE) | no disponible | GGUF + LoRA GGUF | gemma | Archivo experimental, sin pulido conversacional |
| google/gemma-4-26B-A4B-it | 26B / ~4B activos (MoE) | no disponible | safetensors (no confirmado) | gemma | Modelo base oficial; referencia de calidad |
| niatheelf777/xiaofeiyu-12b-v4 | 12B | no disponible | GGUF (Q8_0, UD-Q4_K_XL-xfy) | gemma | Modelo principal del mismo autor, con pulido conversacional |
| niatheelf777/xiaofeiyu-translator-e4b | E4B | no disponible | GGUF (~5,3 GiB) | gemma | Variante ligera para traducción y reescritura |

## Limitaciones y advertencias

- El autor declara explícitamente que no está recomendado para uso diario: no ha pasado pruebas de interacción ni ajuste conversacional.
- Discrepancia entre el nombre (26B) y los parámetros reportados en safetensors (24.829.952); conviene verificar antes de dimensionar infraestructura.
- Solo soporta chino e inglés; no hay evidencia de capacidades multilingües adicionales.
- No se documentan sesgos, tasas de alucinación ni evaluaciones de seguridad.
- La licencia Gemma impone las Gemma Terms of Use, con restricciones de uso comercial y obligaciones de atribución; revisar antes de cualquier despliegue.
- El repositorio mezcla pesos cuantizados y adaptadores LoRA; el uso requiere respetar el orden de slots del manifiesto para evitar resultados incoherentes.
- No hay soporte documentado para servidores de inferencia de alto rendimiento (vLLM, TGI), lo que limita su uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/niatheelf777/xiaofeiyu-26b-a4b
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Modelo principal recomendado: https://huggingface.co/niatheelf777/xiaofeiyu-12b-v4
- Variante traductora: https://huggingface.co/niatheelf777/xiaofeiyu-translator-e4b
- Repositorio GitHub: https://github.com/niatheelf777/xiaofeiyu
- Demo online: https://xfy.tospeak.top
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
