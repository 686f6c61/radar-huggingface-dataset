# greenfield0810/affine-ark-14d005bfb627

## Resumen

Este repositorio contiene un archivo (mirror) de un checkpoint de un modelo de la competición Bittensor subnet 120 (Affine), subido por el usuario greenfield0810. Según la model card, se trata de una copia sin modificar de un checkpoint competidor originalmente publicado por `iionai/affine-5ek5k4rbj7-0b7fe96ec3`, conservada para preservar el acceso ante la práctica habitual de que los repositorios de esa competición se vuelven privados a los pocos días. No es un modelo desarrollado por el autor del repositorio, sino un archivo de referencia con fines de transparencia y preservación.

El checkpoint pesa 70,2 GB en 17 shards y tiene 35.107.181.936 parámetros totales. Los tags indican que se basa en la arquitectura Qwen3.5 MoE (mixture of experts) y que el pipeline es `image-text-to-text`, lo que sugiere capacidades multimodales, aunque no se proporciona ninguna especificación adicional sobre el entrenamiento, la licencia o los idiomas soportados. La relevancia de este repositorio es principalmente como referencia para investigadores que quieran examinar un checkpoint real de la competición Affine, no como un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-MoE (mixto de expertos) según tags, sin detalles de configuración |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors originales) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (17 shards, 70,2 GB) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna ni el proceso de entrenamiento. Los tags indican que se trata de un modelo con arquitectura Qwen3.5-MoE, lo que sugiere un transformer con capas de mezcla de expertos, pero no se proporcionan detalles sobre el número de expertos, el tamaño de cada uno, la configuración de atención ni el dataset de entrenamiento. Tampoco hay datos sobre el número de tokens de entrenamiento, el uso de RLHF/DPO u otras técnicas de alineación. La única información técnica concreta es el número total de parámetros (35,1 B) y el tamaño del repositorio.

## Capacidades

- Procesamiento de entrada de imagen y texto (pipeline `image-text-to-text`), por lo que se espera que pueda generar texto a partir de imágenes y texto.
- Generación de texto y razonamiento, presumiblemente similar a otros modelos de la familia Qwen3.5, aunque no se verifica con benchmarks.
- No hay información sobre soporte de tool calling, agentes, multi-step reasoning o capacidades multilingües específicas.
- No se indica ninguna capacidad especial adicional (thinking mode, audio, etc.).

## Casos de uso

Dado que este repositorio es un archivo de preservación de un checkpoint de competición, no se recomienda su uso directo en producción. Los casos de uso potenciales se limitan a:

- Investigación y análisis: estudiar la arquitectura y los pesos de un modelo que participó en la competición Affine, para comparar con otros modelos del mismo ecosistema.
- Auditoría y trazabilidad: verificar la integridad de los pesos mediante el hash SHA-256 proporcionado (`14d005bfb627...`) y comparar con el original para confirmar que es una copia exacta.
- Reproducción de experimentos: si se conoce el pipeline de entrenamiento o evaluación de Affine, se podría cargar este checkpoint para reproducir resultados de la competición.
- Desarrollo de herramientas de preservación: servir como caso de estudio para sistemas de archivo de modelos open source que se vuelven inaccesibles.
- No se recomienda su uso para aplicaciones de usuario final, dado que no hay información sobre su comportamiento, sesgos o limitaciones.
- Si se desea explorar un modelo multimodal de 35B, es mejor usar el Qwen3.5-MoE oficial de Alibaba, que sí tiene documentación y soporte.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna métrica de rendimiento (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos. Dado que se trata de un archivo de preservación, es probable que el modelo original participara en la competición Affine, pero los resultados de esa competición no son públicos aquí.

## Requisitos de hardware

- VRAM estimada: no disponible. Con 35,1 B parámetros en precisión FP16, el modelo ocuparía unos 70 GB de VRAM. En cuantización de 8 bits se reduciría a unos 35 GB, y en 4 bits a unos 18 GB, pero no se proporcionan cuantizaciones oficiales.
- GPUs recomendadas: para inferencia en FP16 se necesitaría una GPU con al menos 80 GB (p. ej., A100 80GB, H100 80GB) o varias GPUs en paralelo. En cuantización 4 bits podría caber en una RTX 4090 (24 GB) o similar, pero no hay garantía de compatibilidad.
- Opciones de despliegue: al ser un checkpoint en formato safetensors, se puede cargar con transformers de Hugging Face. No se indica compatibilidad con vLLM, llama.cpp u Ollama, y al no haber cuantizaciones GGUF disponibles, su despliegue en consumer sería complicado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos de la competición Affine. Como referencia genérica, se puede comparar con el Qwen3.5-MoE original de Alibaba (si existe), que tendría una arquitectura similar y parámetros comparables. Sin embargo, al no tener datos de rendimiento ni configuración exacta, no es posible hacer una comparación rigurosa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| affine-ark-14d005bfb627 (este) | 35,1B | no disponible | no disponible | archivo de preservación |
| Qwen3.5-MoE (original) | no disponible | no disponible | no disponible | no disponible |
| Otros modelos de Affine | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Este repositorio es un archivo de un checkpoint de competición, no un modelo desarrollado con fines de producción. No se garantiza su calidad, robustez ni seguridad.
- La model card advierte que el modelo original fue desactivado de la competición (0 victorias en 5 duelos), lo que sugiere que su rendimiento no era competitivo.
- No hay información sobre sesgos, alucinaciones o comportamiento en entornos no controlados. Al ser un modelo multimodal, podría presentar problemas de generación de contenido inapropiado si no se ha alineado adecuadamente.
- La licencia no está especificada, por lo que no se puede determinar si es legal usar estos pesos en proyectos comerciales.
- El modelo no está documentado (sin config, sin tokenizer, sin instrucciones de uso). Cargarlo con transformers podría requerir asumir la configuración de Qwen3.5-MoE, lo que puede causar errores.
- El autor del repositorio indica que es una copia byte-for-byte y que se retirará si se solicita, pero no ofrece ningún soporte técnico.

## Enlaces

- Repositorio original en Hugging Face: https://huggingface.co/greenfield0810/affine-ark-14d005bfb627
- Repositorio original del que se copió: https://huggingface.co/iionai/affine-5ek5k4rbj7-0b7fe96ec3
- Archivo de procedencia (si está disponible): `_affine_provenance.json` dentro del repositorio
- Otros archivos similares de la misma cuenta: https://huggingface.co/greenfield0810/affine-ark-95d402145584 (ejemplo de otro artefacto)
