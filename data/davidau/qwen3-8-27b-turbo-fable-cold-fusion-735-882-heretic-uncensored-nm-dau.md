# DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU

## Resumen

El modelo **DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU** es un fine-tuning del modelo base **Qwen/Qwen3.8-27B**, desarrollado por el usuario DavidAU. Se trata de una variante "uncensored" y "heretic" que elimina las restricciones de contenido del modelo original, manteniendo las capacidades multimodales (entrada de imagen y texto) propias de la familia Qwen3.8. El nombre incluye la técnica **Cold Fusion**, que combina **GAIN Training** y **Unsloth** para reducir el número de tokens de razonamiento interno y mejorar el seguimiento de instrucciones, manteniendo el rendimiento de la base.

Con aproximadamente **27,8 mil millones de parámetros**, este modelo está diseñado para tareas de conversación, generación de texto, razonamiento y visión. Su licencia **Apache 2.0** permite uso comercial, aunque el acceso al repositorio está restringido (gated) y requiere aceptar condiciones en HuggingFace. Es relevante ahora porque ofrece una alternativa sin censura y optimizada para eficiencia de razonamiento sobre una base sólida como Qwen3.8-27B, con soporte de visión integrado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen3.8-27B) |
| Parametros totales | 27.781.427.952 (~27,8B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (las variantes GGUF del mismo autor indican compatibilidad con 256k) |
| Tipos de cuantizacion | No disponible (repo en safetensors, presumiblemente BF16/FP16) |
| Idiomas soportados | Inglés (tag "en") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de **Qwen3.8-27B**, un transformer decoder-only denso con capacidades multimodales (procesa imágenes y texto). El fine-tuning aplica el método **Cold Fusion**, que combina **GAIN Training** (una técnica para reducir el "overthinking" y los tokens de razonamiento interno) con **Unsloth** (optimización de entrenamiento). Según la documentación del autor, este método mantiene el 99% del rendimiento BF16 incluso en cuantizaciones de 8 y 4 bits, y reduce el número de tokens de razonamiento hasta en 1/5 o 1/10 en algunos casos. El entrenamiento es multi-etapa (multi-stage tuning) y el nombre "Heretic-Uncensored" indica que se ha eliminado la censura del modelo base. El pipeline declarado es **image-text-to-text**, confirmando que conserva la capacidad de procesar imágenes.

## Capacidades

- Generación de texto y conversación multi-turno en inglés.
- Razonamiento y resolución de problemas con menor uso de tokens de razonamiento interno (gracias a Cold Fusion).
- Soporte de entrada de imágenes (visión) para tareas de image-text-to-text.
- Capacidad de tool calling / function calling, heredada de Qwen3.8-27B.
- Soporte de agentes y razonamiento multi-paso.
- Sin censura de contenido (uncensored), lo que permite generar respuestas sobre temas sensibles o controvertidos.
- Modos de esfuerzo de razonamiento (xhigh/medium/low) disponibles en variantes GGUF del mismo autor, aunque no se confirma para este checkpoint safetensors.

## Casos de uso

- **Generación creativa sin restricciones**: el modelo puede producir narrativa, poesía o guiones sobre temas que otros modelos censuran, gracias a su naturaleza uncensored. Es adecuado para escritores que necesitan explorar contenido adulto o controvertido.
- **Asistente de programación**: con soporte de tool calling y razonamiento eficiente, puede integrarse en entornos de desarrollo para generar código, depurar o explicar fragmentos, reduciendo la latencia por menos tokens de razonamiento.
- **Análisis de imágenes con texto**: al ser image-text-to-text, puede describir imágenes, responder preguntas visuales o extraer información de capturas, útil en automatización de documentación o accesibilidad.
- **Roleplay y personajes conversacionales**: su falta de censura y buena capacidad de diálogo lo hacen idóneo para chatbots de rol sin filtros, tanto en entretenimiento como en investigación de interacción humano-máquina.
- **Investigación en alineación y seguridad**: al ser un modelo sin censura, sirve como caso de estudio para analizar comportamientos no alineados y desarrollar técnicas de mitigación.
- **Prototipado rápido de agentes**: con razonamiento multi-paso y tool calling, se puede usar para construir agentes que ejecutan tareas complejas (búsqueda, cálculo, llamadas a APIs) con menor coste computacional por consulta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este checkpoint en la información disponible. La documentación de variantes GGUF del mismo autor afirma que "el modelo supera todos los benchmarks críticos de Qwen 3.8, 3.6 y 3.5 27B", pero no se proporcionan cifras concretas. Por tanto, no se incluyen tablas numéricas para evitar inventar datos.

## Requisitos de hardware

- **VRAM estimada**: en FP16/BF16, el modelo requiere aproximadamente **61 GB** de VRAM (según datos de una variante similar del mismo autor). Con cuantización INT4, se reduce a unos **15 GB**, lo que permite ejecutarlo en una GPU de consumo como la RTX 4090 (24 GB).
- **GPU recomendadas**: para FP16 se necesitan GPUs de centro de datos (A100 80GB, H100 80GB) o múltiples GPUs. Para cuantización INT4, una RTX 4090, RTX 3090 o similar es suficiente.
- **Opciones de despliegue**: al ser un modelo transformers, puede servirse con **vLLM**, **TGI** o **llama.cpp** (si se convierte a GGUF). El autor publica variantes GGUF compatibles con 256k de contexto y soporte de visión mediante mmproj.
- **Latencia y throughput**: no se dispone de datos medidos. Se espera que la reducción de tokens de razonamiento mejore la latencia percibida frente al modelo base, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Visión | Censura |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | ~27,8B | 256k (según familia) | Apache 2.0 | Sí | Parcial |
| DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion... (este) | ~27,8B | No disponible | Apache 2.0 | Sí | Sin censura |
| DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NM-DAU-NEO-MAX-MTP-GGUF | ~27,8B | 256k (GGUF) | Apache 2.0 | Sí (mmproj) | Sin censura |

La comparativa se limita a variantes del mismo autor y al modelo base, ya que no se dispone de datos de otros modelos de 27B con características equivalentes (visión + sin censura). El modelo base Qwen3.8-27B es la referencia principal; la variante aquí descrita añade la eliminación de censura y la optimización de razonamiento.

## Limitaciones y advertencias

- **Acceso restringido**: el repositorio es gated, por lo que es necesario solicitar acceso y aceptar condiciones en HuggingFace antes de descargar los pesos.
- **Idioma limitado**: solo se declara soporte para inglés; no se garantiza un rendimiento adecuado en otros idiomas.
- **Riesgo de alucinación**: como cualquier modelo generativo, puede producir información falsa o inventada, especialmente en temas especializados.
- **Sesgos y contenido ofensivo**: al ser uncensored, puede generar contenido discriminatorio, violento o ilegal. El uso en producción debe contemplar filtros adicionales y responsabilidad legal.
- **Sin garantías de producción**: es un fine-tuning de un usuario independiente, no un modelo oficial de Qwen. No hay documentación de evaluación exhaustiva ni soporte técnico.
- **Contexto no confirmado**: aunque las variantes GGUF del autor indican 256k, este checkpoint safetensors no especifica la longitud de contexto; se recomienda verificar antes de usarlo con ventanas largas.

## Enlaces

- [HuggingFace - DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU](https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU)
- [HuggingFace - Variante sin sufijo NM-DAU](https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored)
- [Página de la variante GGUF (aiany.app)](https://aiany.app/item/davidau-qwen3-8-27b-cold-fusion-gain-v1-1-nm-dau-neo-max-mtp-gguf)
- [Recomendador de GPU (Spheron) para variante stage1](https://www.spheron.network/tools/gpu-recommender/DavidAU/Qwen3.8-27B-Cold-Fable-Fusion-GAIN-V1.1-732-Heretic-Uncensored-stage1)
- [Toolify - Descripción de la variante GGUF](https://www.toolify.ai/ai-model/davidau-qwen3-8-27b-cold-fusion-gain-v1-1-nm-dau-neo-max-mtp-gguf)
