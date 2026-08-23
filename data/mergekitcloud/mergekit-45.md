# MergekitCloud/mergekit-45

## Resumen

MergekitCloud/mergekit-45 es un modelo de lenguaje de 8.030 millones de parámetros creado mediante la fusión de varios modelos preentrenados de la familia Llama-3.1-8B. El modelo se ha generado con la librería [mergekit](https://github.com/cg123/mergekit) utilizando el método Model Stock, descrito en el artículo [arxiv:2403.19522](https://arxiv.org/abs/2403.19522). Su base es el modelo vicgalle/Humanish-Roleplay-Llama-3.1-8B, y combina los pesos de otros tres modelos: ArliAI/Llama-3.1-8B-ArliAI-RPMax-v1.3, Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2 y Undi95/Llama3-Unholy-8B-OAS.

El modelo se publica en formato safetensors y está preparado para el pipeline de text-generation de Transformers. No se indica una licencia concreta ni idiomas soportados. Su interés principal reside en la técnica de fusión empleada, que permite combinar las capacidades de distintos modelos sin necesidad de entrenamiento adicional, algo relevante para desarrolladores que buscan modelos personalizados sin coste computacional de fine-tuning.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Llama) |
| Parámetros totales | 8.030.261.248 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (solo safetensors FP16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusión (merge) de cuatro modelos basados en Llama-3.1-8B. La fusión se realizó con el método Model Stock, que combina los pesos de los modelos base mediante una media ponderada de sus parámetros, utilizando como modelo base vicganteen/Humanish-Roleplay-Llama-3.1-8B. La configuración YAML indica que se usaron tres modelos adicionales como fuentes y se aplicó una máscara de 8 bits (int8_mask) para optimizar el proceso. No se realizó ningún entrenamiento adicional, por lo que el modelo hereda las capacidades y limitaciones de los modelos originales.

La arquitectura subyacente es la de Llama-3.1-8B: un transformer autoregresivo con 8.000 millones de parámetros, diseñado para generación de texto. No se han publicado detalles sobre la longitud de contexto, aunque los modelos Llama-3.1 suelen soportar hasta 128.000 tokens, pero este dato no se confirma en la información disponible.

## Capacidades

- Generación de texto en general, gracias a la arquitectura Llama-3.1.
- Posiblemente soporte de conversación y roleplay, dado que la base es Humanish-Roleplay-Llama-3.1-8B.
- Al ser una fusión de modelos no censurados (Lexi-Uncensored y Unholy), puede generar contenido sin restricciones de seguridad, lo que implica un riesgo.
- No se han publicado capacidades específicas como tool calling, razonamiento multi-step o visión. No hay información al respecto.

## Casos de uso

Dado que no se han publicado casos de uso específicos, se indican posibles aplicaciones generales basadas en las características de los modelos base, sin confirmación por parte del autor:

- **Generación de texto creativo**: el modelo puede utilizarse para escribir historias o guiones, especialmente en contextos de rol, dado su origen en modelos de roleplay.
- **Asistentes conversacionales**: al ser un modelo de chat, puede servir para construir asistentes virtuales que mantengan conversaciones fluidas.
- **Exploración de modelos sin censura**: para investigación sobre comportamiento de modelos sin filtros de seguridad, aunque con precaución.
- **Prototipado rápido**: como modelo de 8B, puede ejecutarse en hardware moderado para pruebas de concepto.
- **Estudio de técnicas de fusión**: para investigar cómo la combinación de pesos afecta al rendimiento en tareas específicas.
- **Generación de contenido para juegos**: como diálogos de NPC o historias interactivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: para inferencia en FP16 se requieren aproximadamente 16 GB de VRAM (dado que el modelo tiene 8.03B parámetros y cada parámetro ocupa 2 bytes en FP16). Con cuantización a 4 bits se reduciría a unos 4 GB, pero no se ofrecen cuantizaciones oficiales.
- **GPU recomendadas**: para FP16, una RTX 3090/4090, A100, o similares con 16 GB o más. Para cuantización, una GPU de 6-8 GB podría bastar.
- **Consumer GPU**: posible con cuantización, aunque no se proporcionan pesos cuantizados.
- **Opciones de despliegue**: al ser safetensors, se puede usar con Hugging Face Transformers, vLLM, TGI, o convertir a GGUF para llama.cpp u Ollama. No se han proporcionado versiones GGUF.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

No se dispone de datos para una comparativa cuantitativa. El modelo se puede comparar con sus modelos base, todos de 8B de parámetros y misma arquitectura, pero no hay cifras de rendimiento. Alternativas típicas en el mercado son Llama-3.1-8B-Instruct, Mistral-7B-Instruct o Gemma-7B, pero sin datos de benchmark no se puede realizar una comparación objetiva.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: al ser un merge de modelos no censurados, puede generar contenido inapropiado o falso con mayor facilidad que un modelo alineado.
- **Licencia**: no se indica la licencia, por lo que el uso comercial es incierto y se recomienda verificar los términos de los modelos base (Llama-3.1 tiene su propia licencia).
- **Contexto**: no se especifica la longitud máxima, lo que puede limitar su uso en tareas de contexto largo.
- **Riesgo de contenido dañino**: los modelos "uncensored" pueden producir discurso de odio o información peligrosa sin filtros.
- **Soporte**: al ser un modelo de fusión no oficial, no hay garantía de mantenimiento ni documentación técnica.

## Enlaces

- [Hugging Face: MergekitCloud/mergekit-45](https://huggingface.co/MergekitCloud/mergekit-45)
- [ArliAI/Llama-3.1-8B-ArliAI-RPMax-v1.3](https://huggingface.co/ArliAI/Llama-3.1-8B-ArliAI-RPMax-v1.3)
- [Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2](https://huggingface.co/Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2)
- [Undi95/Llama3-Unholy-8B-OAS](https://huggingface.co/Undi95/Llama3-Unholy-8B-OAS)
- [vicgalle/Humanish-Roleplay-Llama-3.1-8B](https://huggingface.co/vicgalle/Humanish-Roleplay-Llama-3.1-8B)
- [GitHub de mergekit](https://github.com/cg123/mergekit)
- [Paper Model Stock (arXiv:2403.19522)](https://arxiv.org/abs/2403.19522)
