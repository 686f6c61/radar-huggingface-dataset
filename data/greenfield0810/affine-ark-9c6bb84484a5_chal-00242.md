# greenfield0810/affine-ark-9c6bb84484a5_chal-00242

## Resumen

El repositorio `greenfield0810/affine-ark-9c6bb84484a5_chal-00242` es un archivo espejo de un checkpoint de IA participante en el **subnet 120 de Bittensor** (Affine), no un modelo original desarrollado por el autor del repositorio. Contiene una copia byte a byte del modelo `tammyfritz/affine-5hmwhnfbix-tammy100d` en la revisión `bd610f72e7a0`, preservado con fines de archivo porque los repositorios de ese tablero suelen hacerse privados tras los duelos. El modelo tiene 35.107.181.936 parámetros y se identifica con la arquitectura `qwen3_5_moe`, con pipeline `image-text-to-text`. No se dispone de documentación oficial, licencia ni especificaciones de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3.5 MoE (según tag `qwen3_5_moe`) |
| Parámetros totales | 35.107.181.936 |
| Parámetros activos | no disponible (MoE, sin datos de activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (16 shards, 70.2 GB) |

## Arquitectura y entrenamiento

No se ha publicado información sobre el proceso de entrenamiento. Los tags indican que el modelo es una mezcla de expertos (`qwen3_5_moe`), lo que sugiere una arquitectura de transformer basada en Mixture of Experts, aunque no se detalla el número de expertos ni la configuración de los parámetros activos. El pipeline `image-text-to-text` indica que el modelo acepta imágenes y texto como entrada y genera texto. Al ser un archivo espejo, no se dispone de datos del dataset, tokens de entrenamiento ni técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de texto multimodal (imagen y texto como entrada).
- Conversación (tag `conversational`).
- No se dispone de información sobre soporte de tool calling, agentes, razonamiento o capacidades multilingües.
- Las capacidades reales no han sido validadas ni documentadas de forma pública.

## Casos de uso

Nota: al carecer de documentación y benchmarks, los siguientes casos son hipótesis razonables basadas en la arquitectura multimodal del modelo y no deben considerarse validados.

- Análisis de imágenes en entornos de investigación: el modelo podría usarse para extraer descripciones de imágenes en flujos de trabajo de etiquetado automático, siempre que se valide su rendimiento.
- Asistencia a la accesibilidad: generación de descripciones de imágenes para usuarios con discapacidad visual en aplicaciones de escritorio o web.
- Chat multimodal privado: en entornos sin conexión, como base de un asistente conversacional que acepta imágenes.
- Automatización de documentos: extracción de texto de capturas de pantalla o documentos escaneados.
- Generación de código a partir de diagramas: si se le presentan diseños o mockups como imagen, el modelo podría producir texto descriptivo o código inicial.
- Documentación técnica: generación de informes a partir de fotografías o figuras de equipos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: ~70 GB para los pesos, más el overhead de la cache KV, por lo que se recomienda al menos 80 GB de VRAM.
- Con cuantización 4-bit (GPTQ/AWQ): ~18-20 GB para los pesos, más overhead, lo que permitiría ejecutarlo en una RTX 4090 de 24 GB con limitaciones en la longitud de contexto.
- GPU recomendadas: A100 80GB, H100 80GB para fp16; RTX 4090 24GB para cuantización 4-bit.
- El modelo puede ejecutarse en CPU mediante cuantización si se convierte a GGUF, aunque el repositorio solo contiene safetensors.
- Opciones de despliegue: Hugging Face Transformers y vLLM (siempre que el repositorio incluya la configuración necesaria). No se ha verificado la compatibilidad.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de comparativas con modelos distintos de la misma categoría. Los únicos modelos identificados son variantes del mismo checkpoint:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `tammyfritz/affine-5hmwhnfbix-tammy100d` (original) | 35.107.181.936 | no disponible | no disponible | HuggingFace |
| `greenfield0810/affine-ark-a50161c2dff6` | no disponible | no disponible | no disponible | HuggingFace |
| `greenfield0810/affine-ark-9c6bb84484a5_chal-00242` | 35.107.181.936 | no disponible | no disponible | HuggingFace |

Los repositorios hermanos son mirrors del mismo tablero y no representan modelos independientes.

## Limitaciones y advertencias

- Este repositorio no es el modelo original; es un archivo de un checkpoint de Bittensor.
- No se ha publicado licencia, lo que impide el uso comercial sin autorización explícita.
- No hay documentación de entrenamiento, datos de sesgos ni evaluaciones de alucinación.
- El modelo puede comportarse de forma imprevisible al no haber sido validado formalmente.
- El autor del repositorio no ofrece soporte y el contenido puede retirarse a petición.

## Enlaces

- HuggingFace: https://huggingface.co/greenfield0810/affine-ark-9c6bb84484a5_chal-00242
- Original: https://huggingface.co/tammyfritz/affine-5hmwhnfbix-tammy100d
- Repo hermano: https://huggingface.co/greenfield0810/affine-ark-a50161c2dff6
