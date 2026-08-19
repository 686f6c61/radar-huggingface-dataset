# bambocher/gemma-4-E2B-it-qat-oQ4e-mtp

## Resumen
Este modelo es una versión cuantizada de Gemma 4 E2B, un modelo de la familia Gemma 4 desarrollada por Google DeepMind. El autor bambocher ha aplicado una cuantización mixta de 4 bits utilizando la herramienta oQ (oMLX v0.6.1), específicamente sobre la variante "it" (instruction tuned) y "qat" (quantization aware training). El resultado es un modelo ligero, con 1.227.974.211 parámetros, diseñado para ejecutarse en dispositivos con recursos limitados, como equipos edge o CPUs, manteniendo las capacidades del modelo original.

La relevancia de este modelo radica en que Gemma 4 es una familia de modelos abiertos y multimodales que soporta entrada de texto e imagen, razonamiento, contexto largo y uso nativo de herramientas. Esta cuantización facilita su despliegue local en entornos con restricciones de memoria, sin necesidad de GPUs de alta gama. Aunque no se especifican detalles de la arquitectura exacta en la información disponible, se sabe que pertenece a la familia Gemma 4, que incluye arquitecturas densas y de mezcla de expertos.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 1.227.974.211 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, group size 64 (oQ mixed-precision) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento
El modelo es una cuantización de Gemma 4 E2B, un modelo de la familia Gemma 4 de Google DeepMind. No se proporcionan detalles específicos sobre la arquitectura interna (si es un transformer denso, MoE, etc.) en la información del cuantizado. Según la documentación oficial de Gemma 4, la familia incluye arquitecturas densas y de mezcla de expertos, pero no se especifica cuál corresponde a la variante E2B. El proceso de cuantización fue realizado con oQ (oMLX v0.6.1) utilizando cuantización de precisión mixta a 4 bits con un group size de 64. No hay información disponible sobre el entrenamiento del modelo original, como el número de tokens, composición del dataset o técnicas de alineación (RLHF, DPO).

## Capacidades
Basándose en la documentación del modelo original Gemma 4 E2B (no verificada específicamente para esta cuantización), se espera que el modelo conserve las siguientes capacidades:
- Entrada multimodal: procesa texto e imágenes.
- Generación de texto y razonamiento.
- Soporte de system prompts y uso nativo de herramientas (tool calling).
- Capacidad de manejar contextos largos (según la documentación de Gemma 4, hasta 256K tokens, aunque el cuantizado no especifica su ventana real).
- Soporte multilingüe (más de 140 idiomas según la documentación oficial, aunque no confirmado para esta versión).

## Casos de uso
- Asistentes locales en dispositivos edge: al ser un modelo pequeño y cuantizado, puede ejecutarse en dispositivos con poca memoria, como Raspberry Pi o teléfonos, para tareas de generación de texto o respuesta a preguntas.
- Procesamiento de documentos con imágenes: gracias a su capacidad multimodal, puede extraer información de imágenes y texto en escenarios de digitalización de documentos.
- Automatización de tareas con tool calling: puede integrarse en pipelines que requieran invocar funciones externas, como consultas a APIs o bases de datos, en entornos con restricciones de hardware.
- Prototipado rápido: su tamaño reducido permite iterar rápidamente en entornos de desarrollo sin necesidad de infraestructura pesada.
- Aplicaciones de chat con privacidad: al ejecutarse localmente, evita enviar datos a servidores externos, adecuado para entornos sensibles.
- Educación e investigación: sirve como modelo de referencia para estudiar el impacto de la cuantización en modelos multimodales pequeños.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- Con 1.227.974.211 parámetros en cuantización de 4 bits, el tamaño del modelo en memoria es aproximadamente 0,6 GB (1,23B × 0,5 bytes por parámetro), más overhead de ejecución.
- Se estima que puede ejecutarse en GPUs con al menos 2 GB de VRAM, aunque no hay datos oficiales.
- Al estar en formato MLX, está optimizado para Apple Silicon (Mac con chips M1/M2/M3) mediante MLX.
- Para CPU, podría ejecutarse con frameworks como llama.cpp o MLX, aunque la latencia dependerá del hardware.
- Opciones de despliegue: MLX (nativo), posiblemente vLLM o TGI si se convierte a otros formatos, pero no está confirmado.

## Comparativa con modelos similares
No se dispone de datos suficientes para realizar una comparativa con modelos similares (como Gemma 2 2B, Phi-3 mini, etc.) en términos de rendimiento o benchmarks. La información disponible no incluye resultados de evaluación.

## Limitaciones y advertencias
- La licencia no está especificada, lo que genera incertidumbre sobre su uso comercial.
- Al ser una cuantización de 4 bits, puede haber una pérdida de precisión en tareas complejas de razonamiento o generación.
- No se ha verificado que todas las capacidades del modelo original (multimodal, tool calling, etc.) se mantengan intactas tras la cuantización.
- No hay información sobre sesgos, alucinaciones o limitaciones idiomáticas específicas.
- El contexto máximo real no está documentado; la documentación del modelo original menciona hasta 256K tokens, pero esta versión cuantizada podría tener restricciones.

## Enlaces
- [Modelo cuantizado en Hugging Face](https://huggingface.co/bambocher/gemma-4-E2B-it-qat-oQ4e-mtp)
- [Modelo original Gemma 4 E2B en Hugging Face](https://huggingface.co/google/gemma-4-E2B)
- [Documentación de Gemma 4 en Google AI for Developers](https://ai.google.dev/gemma/docs/core/model_card_4)
- [Página de Gemma 4 en DeepMind](https://deepmind.google/models/gemma/gemma-4/)
- [Información de Gemma 4 E2B en gemma4.dev](https://gemma4.dev/models/gemma-4-e2b)
- [Gemma 4 E2B QAT en LM Studio](https://lmstudio.ai/models/google/gemma-4-e2b-qat)
