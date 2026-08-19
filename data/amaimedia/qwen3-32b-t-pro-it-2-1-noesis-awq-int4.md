# AMAImedia/Qwen3-32B-T-pro-it-2.1-NOESIS-AWQ-INT4

## Resumen

El modelo **AMAImedia/Qwen3-32B-T-pro-it-2.1-NOESIS-AWQ-INT4** es una cuantización AWQ INT4 del modelo denso **t-tech/T-pro-it-2.1**, que a su vez se basa en la arquitectura **Qwen3-32B** (decoder-only transformer, 64 capas). Ha sido desarrollado por AMAImedia como parte de la plataforma NOESIS de doblaje profesional multilingüe, bajo el framework DHCF-FNO. Su propósito principal es ofrecer una versión ligera de un modelo de 32B capaz de ejecutarse en hardware de consumo con poca VRAM, gracias a una ruta de inferencia por streaming que reduce el pico de memoria a unos 3,4 GB.

El modelo está optimizado para el idioma ruso como lengua principal, aunque también soporta inglés, ucraniano y bielorruso. La cuantización AWQ INT4 reduce el peso en disco de unos 64 GB (BF16) a aproximadamente 8,5 GB, manteniendo un vocabulario de 151 936 tokens. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales. Su relevancia actual radica en que permite desplegar un modelo de 32B en GPUs de 6 GB, un segmento muy común en entornos de desarrollo y pequeñas empresas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-32B (decoder-only transformer, 64 capas, denso) |
| Parametros totales | 32 759 593 984 (32,76 B) |
| Parametros activos | No aplica (modelo denso, sin MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | AWQ INT4 (group_size=128, GEMM, zero_point=True) |
| Idiomas soportados | Ruso (principal), ingles, ucraniano, bielorruso |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (AWQ INT4) |

## Arquitectura y entrenamiento

El modelo base T-pro-it-2.1 es un transformer denso de 32B parámetros, derivado de Qwen3-32B. Aunque el entrenamiento original utilizó una fusión SLERP de tres expertos entrenados con GRPO como técnica de entrenamiento, el checkpoint resultante es un conjunto único de pesos densos, sin capas de expertos ni routers. Esta cuantización mantiene exactamente esa arquitectura.

La cuantización AWQ INT4 se realizó con AutoAWQ 0.2.9, utilizando un conjunto de calibración de 128 prompts distribuidos en 70% ruso (chat, instrucciones técnicas, exposición científica, escritura creativa), 20% inglés (técnico e instructivo) y 10% código (Python y Rust con comentarios en RU/EN). El proceso se ejecutó en una CPU Intel i7-12700H con 64 GB de RAM y una GPU RTX 3060 de 6 GB, con un tiempo total de unas 3,5 horas. La semilla RNG se fijó en 1729 para garantizar reproducibilidad.

La integración en NOESIS añade una ruta de inferencia por streaming que descarga cada capa del transformer desde la RAM de la CPU a la GPU bajo demanda, ejecuta y libera, logrando un pico de VRAM de aproximadamente 3,4 GB. Esta técnica permite ejecutar el modelo en GPUs de 6 GB, aunque con una latencia adicional de unos 7 ms por capa (0,45 s por lote).

## Capacidades

- Generación de texto y chat conversacional en ruso, inglés, ucraniano y bielorruso.
- Razonamiento y exposición técnica y científica, especialmente en ruso.
- Generación de código en Python y Rust, con comentarios en ruso e inglés.
- Escritura creativa y redacción de contenido en ruso.
- Inferencia en hardware de baja VRAM mediante streaming por capas (pico de ~3,4 GB).
- Alineación de logits directa con modelos Qwen3-8B (mismo vocabulario de 151 936 tokens), lo que facilita la destilación de conocimiento sin proyección cruzada de tokenizadores.
- Compatible con la librería transformers y con text-generation-inference (TGI).

## Casos de uso

- **Destilación de conocimiento (KD)**: el modelo actúa como profesor (teacher) para modelos más pequeños en ruso, como M2-DUB-LM-10B o M4-CHAT-10B, gracias a la coincidencia exacta de vocabulario con Qwen3-8B.
- **Atención al cliente automatizada en ruso**: puede gestionar conversaciones multi-turno en ruso con calidad de un modelo de 32B, desplegado en GPUs de 6 GB mediante streaming.
- **Generación de documentación técnica**: útil para redactar manuales, guías y especificaciones en ruso e inglés, con razonamiento técnico profundo.
- **Traducción automática entre ruso, ucraniano y bielorruso**: aunque no está entrenado específicamente para traducción, su multilingüismo permite tareas de traducción básica con contexto.
- **Análisis y resumen de textos científicos**: su capacidad de exposición científica (70% del calibrado) lo hace adecuado para resumir artículos y documentos técnicos en ruso.
- **Generación de código asistida**: puede completar o generar fragmentos de Python y Rust, especialmente con comentarios en ruso, en entornos de desarrollo con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo proporciona datos de throughput en hardware específico:

| Métrica | Valor |
|---|---|
| Prefill en RTX 3060 (i7-12700H, DDR5-4800) | ~25 tok/s |
| Overhead por capa (streaming) | ~7 ms × 64 capas = 0,45 s por lote |
| VRAM en modo estándar (12 GB+ GPU) | ~9 GB |
| VRAM en modo streaming (6 GB GPU) | ~3,4 GB pico |

## Requisitos de hardware

- **VRAM estimada**: ~9 GB para inferencia completa residente; ~3,4 GB pico con streaming por capas.
- **GPU recomendadas**: RTX 3060 6 GB (streaming), RTX 4060, RTX 4090, A100, H100 (modo estándar).
- **Compatibilidad con GPU de consumo**: sí, cabe en GPUs de 6 GB mediante streaming, y en GPUs de 8 GB o más sin streaming.
- **Opciones de despliegue**: AutoAWQ (librería nativa), transformers, text-generation-inference (TGI), compatible con endpoints de HuggingFace.
- **Latencia y throughput**: prefill ~25 tok/s en RTX 3060 con streaming; en GPUs de 12 GB+ se puede usar el modo estándar de AutoAWQ para menor latencia.

## Comparativa con modelos similares

No se dispone de datos comparativos con otras cuantizaciones de modelos de 32B en la información proporcionada. Como referencia estructural, el modelo base T-pro-it-2.1 es una variante de Qwen3-32B, por lo que se puede comparar con otras cuantizaciones AWQ de Qwen3-32B disponibles en el ecosistema, pero no se han encontrado datos concretos de rendimiento en esta ficha. Se recomienda consultar los benchmarks del modelo base (arxiv:2512.10430) para una comparación a nivel de arquitectura.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: al ser un modelo de lenguaje generativo, puede producir contenido falso o sesgado, especialmente en temas controvertidos. No se han realizado evaluaciones específicas de sesgo para esta cuantización.
- **Riesgo de alucinación**: la cuantización INT4 puede degradar ligeramente la calidad de las respuestas en comparación con el modelo BF16 original, especialmente en tareas de razonamiento complejo.
- **Limitaciones de contexto**: no se ha especificado la longitud de contexto soportada; se recomienda verificar con el modelo base Qwen3-32B.
- **Idiomas**: el modelo está optimizado para ruso; el rendimiento en inglés, ucraniano y bielorruso puede ser inferior, y no se garantiza soporte para otros idiomas.
- **Restricciones de licencia**: la licencia Apache-2.0 permite uso comercial, pero se debe verificar que el modelo base T-pro-it-2.1 no tenga restricciones adicionales (según la model card, la licencia se hereda del base, que es Apache-2.0).
- **Caveat para producción**: el modo streaming introduce latencia adicional (0,45 s por lote) y no es adecuado para aplicaciones interactivas de baja latencia; para chat en tiempo real se recomienda una GPU con 12 GB o más.
- **Dependencia de AutoAWQ**: la cuantización requiere la librería AutoAWQ 0.2.9 o superior; otras herramientas de inferencia pueden no ser compatibles.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/AMAImedia/Qwen3-32B-T-pro-it-2.1-NOESIS-AWQ-INT4)
- [Modelo base t-tech/T-pro-it-2.1](https://huggingface.co/t-tech/T-pro-it-2.1)
- [Paper T-pro 2.0 (arXiv:2512.10430)](https://arxiv.org/abs/2512.10430)
- [Sitio web de AMAImedia](https://www.amaimedia.com)
