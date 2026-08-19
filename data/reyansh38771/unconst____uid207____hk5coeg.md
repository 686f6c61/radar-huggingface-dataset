# reyansh38771/unconst____uid207____hk5CoeG

## Resumen

El modelo `reyansh38771/unconst____uid207____hk5CoeG` es un fine-tune de 35.107 millones de parámetros (35,1B) basado en `unconst/Affine-5czsc2fc98-r252-merged`, un modelo que por sus etiquetas parece emplear una arquitectura MoE (mezcla de expertos) de la familia Qwen 3.5. El autor, `reyansh38771`, ha aplicado un proceso de alineación mediante *offline DPO* y etiquetas como `reason-v3` sugieren un enfoque específico hacia tareas de razonamiento. A pesar de que el pipeline declarado es `text-generation`, las etiquetas incluyen `image-text-to-text`, lo que podría indicar capacidades multimodales, aunque no se confirma.

El modelo fue publicado en agosto de 2026, tiene acceso restringido (*gated*) y no se ha documentado públicamente su proceso de entrenamiento, licencia o rendimiento. Con un tamaño de repositorio de 70,2 GB en formato `safetensors`, es un modelo considerable que requiere hardware de gama alta para su inferencia. Dado que no hay información oficial sobre sus capacidades, esta ficha se basa exclusivamente en los metadatos disponibles en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (según etiqueta `qwen3_5_moe`), posiblemente multimodal (`image-text-to-text`) |
| Parametros totales | 35.107.181.936 (35,1B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato `safetensors` original) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la información pública. Las etiquetas `qwen3_5_moe` y `affine` sugieren una variante de la familia Qwen 3.5 con mezcla de expertos y posiblemente mecanismos de atención afín, pero no se dispone de documentación técnica que lo confirme. El modelo base, `unconst/Affine-5czsc2fc98-r252-merged`, es un merge de una serie de revisiones (`r252`), y el fine-tune aquí descrito incorpora `offline-dpo` (optimización de preferencias directa) y `reason-v3`, lo que indica un entrenamiento orientado a mejorar el razonamiento y la alineación con preferencias humanas. No se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset ni el proceso de alineación completo.

## Capacidades

- Generación de texto y conversación (pipeline `text-generation`).
- Posible soporte multimodal (`image-text-to-text`) según las etiquetas, aunque no se ha verificado.
- Orientación al razonamiento (etiqueta `reason-v3`).
- Compatible con endpoints de Hugging Face (`endpoints_compatible`).
- No se dispone de información sobre tool calling, agentes o funciones específicas.

## Casos de uso

Dado que no hay documentación oficial, los casos de uso son hipotéticos y basados en el tamaño y tipo de modelo:

- **Asistente conversacional**: con 35B parámetros y orientación al razonamiento, podría emplearse en chatbots de dominio general, aunque su acceso restringido limita su adopción.
- **Razonamiento complejo**: la etiqueta `reason-v3` sugiere aptitud para tareas de lógica y matemáticas, pero sin benchmarks no se puede confirmar.
- **Procesamiento de imágenes y texto**: si las capacidades multimodales se confirman, podría usarse en sistemas de descripción de imágenes o respuesta a preguntas visuales.
- **Investigación académica**: como modelo de código abierto (con acceso gated), podría servir para estudios sobre MoE y DPO.
- **Fine-tuning adicional**: al ser un checkpoint intermedio, podría utilizarse como base para tareas específicas.
- **Prototipado en entornos controlados**: para evaluar su comportamiento en tareas de generación de texto, siempre que se cumplan las condiciones de acceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

No se dispone de datos oficiales sobre requisitos de hardware. Como estimación general para un modelo de 35,1B parámetros en formato FP16 (70,2 GB de pesos):

- **VRAM estimada**: ~70 GB en FP16, ~35 GB en cuantización de 8 bits, ~18 GB en 4 bits (estimación teórica, no confirmada).
- **GPU recomendadas**: una sola GPU de 80 GB (A100/H100) o varias GPU en paralelo para FP16; para cuantización 4 bits, una RTX 4090 (24 GB) podría ser insuficiente, se necesitaría al menos 32 GB (por ejemplo, A6000 o V100 de 32 GB).
- **Opciones de despliegue**: al ser compatible con `transformers`, se puede usar con vLLM, TGI o llama.cpp (si se convierte a GGUF), aunque no se ha verificado la compatibilidad.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables con la misma arquitectura y tamaño en la información proporcionada.

## Limitaciones y advertencias

- **Acceso restringido**: el modelo es *gated*; se requiere aceptar condiciones en Hugging Face, lo que puede limitar su uso en producción.
- **Licencia no clara**: sin licencia declarada, no se puede garantizar su uso comercial.
- **Falta de documentación**: no hay papers, blogs ni especificaciones técnicas públicas.
- **Riesgo de sesgos y alucinaciones**: al no conocerse el dataset de entrenamiento, no se puede evaluar su sesgo ni su fiabilidad.
- **Capacidades multimodales no confirmadas**: la etiqueta `image-text-to-text` no garantiza que el fine-tune conserve dicha funcionalidad.
- **Cero descargas y likes**: indica que el modelo es nuevo y no ha sido evaluado por la comunidad.

## Enlaces

- [Hugging Face - reyansh38771/unconst____uid207____hk5CoeG](https://huggingface.co/reyansh38771/unconst____uid207____hk5CoeG)
- Modelo base (sin URL directa): `unconst/Affine-5czsc2fc98-r252-merged` (búsqueda en Hugging Face recomendada)
