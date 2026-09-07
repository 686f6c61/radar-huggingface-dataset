# mradermacher/DeepSeek-R1-Qwen-32B-Uncensored-i1-GGUF

## Resumen

DeepSeek-R1-Qwen-32B-Uncensored-i1-GGUF es una cuantización GGUF con matriz de importancia (imatrix) del modelo Brancis/DeepSeek-R1-Qwen-32B-Uncensored, desarrollada por mradermacher. El modelo base es una versión sin censura de un modelo de 32.759.790.592 parámetros, ajustado con el dataset Guilherme34/uncensor.

Esta cuantización está pensada para reducir el tamaño del modelo y permitir su ejecución en hardware de consumo, ofreciendo varios niveles de compresión (desde 11,4 GB hasta 18,9 GB) y manteniendo la compatibilidad con herramientas como llama.cpp y Ollama. Es relevante para desarrolladores que necesitan ejecutar un modelo de 32B en local sin depender de servicios en la nube.

No se dispone de información oficial sobre arquitectura, longitud de contexto ni datos de entrenamiento en la documentación proporcionada. El tamaño del modelo es de 32.759.790.592 parámetros, según los metadatos de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible |
| Parametros totales | 32.759.790.592 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1-IQ2_M, i1-Q2_K, i1-IQ3_XXS, i1-Q3_K_M, i1-Q4_K_S (GGUF imatrix) |
| Idiomas soportados | Inglés |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones imatrix) |

## Arquitectura y entrenamiento

No se dispone de información técnica detallada sobre la arquitectura del modelo en la documentación proporcionada. Por el nombre del modelo base, se puede inferir que se trata de un transformer basado en la familia Qwen 32B, posiblemente un destilado de DeepSeek-R1, pero no hay confirmación oficial. El modelo base fue ajustado con el dataset Guilherme34/uncensor, lo que sugiere un fine-tuning orientado a eliminar restricciones de contenido. No se mencionan datos sobre el número de tokens de entrenamiento, composición del dataset, RLHF, DPO ni otras técnicas de alineación.

Esta versión concreta es una cuantización realizada por mradermacher utilizando la técnica de matriz de importancia (imatrix). No se trata de un entrenamiento desde cero, sino de una compresión del modelo base para reducir su tamaño y requisitos de memoria.

## Capacidades

- Generación de texto conversacional en inglés, según las etiquetas del repositorio ("conversational", "language: en").
- Compatibilidad con endpoints, según la etiqueta "endpoints_compatible".
- Ejecución local en formato GGUF con múltiples niveles de cuantización.
- No se dispone de una lista oficial de capacidades en la información proporcionada. El modelo base, por su nombre, podría ser una variante de DeepSeek-R1 con capacidades de razonamiento y código, pero no está confirmado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.

## Casos de uso

1. Ejecución local de un LLM de 32B en una estación de trabajo con GPU de 16-24 GB: las cuantizaciones Q3_K_M (16,0 GB) y Q4_K_S (18,9 GB) permiten ejecutar el modelo en una RTX 4090 o similar, sin necesidad de servicios en la nube.
2. Investigación sobre técnicas de cuantización: el repositorio incluye un archivo imatrix y varias cuantizaciones (IQ2_M, Q2_K, IQ3_XXS, Q3_K_M, Q4_K_S), lo que permite comparar el efecto de la compresión en la calidad del modelo.
3. Prototipado de aplicaciones de chat sin restricciones de contenido: el modelo base fue ajustado con el dataset Guilherme34/uncensor, por lo que puede ser útil en entornos de investigación sobre generación libre, siempre que se controlen los ries
