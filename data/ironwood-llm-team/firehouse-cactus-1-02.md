# Ironwood-LLM-Team/Firehouse-Cactus-1.02

## Resumen

Firehouse-Cactus-1.02 es un modelo de lenguaje de 7.940 millones de parámetros desarrollado por Ironwood-LLM-Team, publicado bajo licencia Apache 2.0. Es un ajuste fino (fine-tuning) de la versión anterior Firehouse-Cactus-1.01, que a su vez deriva de Firehouse-Cactus-1.0. Los tags del repositorio indican que está construido sobre la arquitectura Gemma 4 de Google, utilizando la herramienta Unsloth para el entrenamiento y distribuido en formato MLX y safetensors. El modelo está orientado a generación de texto conversacional, con pipeline de text-generation.

La relevancia de este modelo radica en ser un lanzamiento reciente (agosto de 2026) dentro del ecosistema de modelos abiertos, con una licencia permisiva que permite uso comercial. Aunque no se han publicado especificaciones técnicas detalladas ni benchmarks, su tamaño y naturaleza conversacional lo sitúan como una opción viable para aplicaciones de chatbot y asistencia textual en entornos donde se requiera desplegar el modelo localmente con recursos moderados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en Gemma 4 según tags) |
| Parametros totales | 7.937.953.568 (~7,94 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors y MLX) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, MLX |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura interna ni el proceso de entrenamiento. Los tags indican que el modelo se basa en Gemma 4 de Google, y que se utilizó Unsloth para el fine-tuning. El modelo parte de Firehouse-Cactus-1.01, que es una iteración previa del mismo equipo. No se dispone de datos sobre el dataset de entrenamiento, número de tokens procesados, ni técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de texto conversacional (etiqueta `conversational`).
- Soporte para pipeline de text-generation.
- No se documentan capacidades específicas de razonamiento, código, matemáticas, visión o tool calling.
- No hay información sobre soporte multilingüe.

## Casos de uso

Aunque no hay documentación oficial, por su tamaño y naturaleza conversacional se pueden considerar los siguientes escenarios, siempre sujetos a validación previa:

- **Asistente de chat para soporte técnico**: un modelo de 7,9 B con licencia Apache puede integrarse en sistemas de atención al cliente para gestionar consultas frecuentes, aunque se recomienda verificar su rendimiento en diálogos multi-turno.
- **Generación de respuestas en aplicaciones de escritura asistida**: para redactar borradores de correos, resúmenes o contenido creativo en entornos locales.
- **Prototipado rápido de aplicaciones de NLP**: al ser de código abierto y con formato MLX, puede desplegarse en entornos de desarrollo para pruebas de concepto de chatbots o asistentes virtuales.
- **Educación e investigación**: para experimentos de fine-tuning adicional sobre una base ya ajustada, aprovechando la licencia permisiva.
- **Despliegue en dispositivos edge**: si se cuantiza a formatos como GGUF, podría ejecutarse en hardware de gama media, aunque no hay datos de cuantización disponibles.
- **Integración en flujos de generación de documentación**: para crear resúmenes de textos largos o generar descripciones de productos, siempre que el contexto sea suficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El tamaño del repositorio es de 15,9 GB, lo que sugiere que los pesos están en fp16 (aproximadamente 2 bytes por parámetro). La VRAM necesaria para cargar el modelo completo en fp16 sería de unos 16 GB.
- Con cuantización a 8 bits, la VRAM requerida bajaría a unos 8 GB, y a 4 bits a unos 4-5 GB, aunque no se ofrecen archivos cuantizados en el repositorio.
- Para inferencia en fp16 se recomienda una GPU con al menos 16 GB de VRAM, como una RTX 4090, A100 (40 GB) o similar.
- En formato MLX, se puede ejecutar en hardware Apple Silicon (Mac M1/M2/M3) con suficiente memoria unificada.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar directamente con otros modelos de la misma categoría (por ejemplo, Gemma 2 9B, Llama 3.1 8B, Mistral 7B). No se conocen benchmarks ni características de contexto. Por tanto, no se puede establecer una comparativa fiable.

## Limitaciones y advertencias

- **Falta de documentación técnica**: no se especifican arquitectura, contexto ni entrenamiento, lo que dificulta evaluar su comportamiento real.
- **Posibles sesgos y alucinaciones**: al ser un fine-tuning de un modelo base de Google (Gemma 4), puede heredar los sesgos y limitaciones de ese modelo, aunque no hay datos verificables.
- **Idiomas**: no se indica qué idiomas soporta, por lo que su uso multilingüe es incierto.
- **Uso en producción**: al no existir benchmarks ni pruebas de estabilidad, se recomienda realizar una validación exhaustiva antes de desplegar en entornos críticos.
- **Licencia**: Apache 2.0 permite uso comercial, pero se debe revisar la licencia específica de Gemma 4 (el enlace en el README apunta a la licencia de Gemma 4), que puede imponer restricciones adicionales.
- **Falta de soporte**: el modelo tiene 0 descargas y 0 likes, lo que sugiere que es un proyecto reciente sin comunidad establecida.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Ironwood-LLM-Team/Firehouse-Cactus-1.02)
- [Modelo base Firehouse-Cactus-1.01](https://huggingface.co/Ironwood-LLM-Team/Firehouse-Cactus-1.01)
- [Firehouse-Cactus-1.0 en LLM Explorer](https://llm-explorer.com/model/Ironwood-LLM-Team%2FFirehouse-Cactus-1.0,6JUszgNx3wpJ8nGFoFKamj)
