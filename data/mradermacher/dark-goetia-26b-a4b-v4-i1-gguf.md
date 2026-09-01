# mradermacher/Dark-Goetia-26B-A4B-v4-i1-GGUF

## Resumen

Dark-Goetia-26B-A4B-v4-i1-GGUF es una cuantización GGUF con matriz de importancia (imatrix) del modelo Dark-Goetia-26B-A4B-v4, un fine-tune de la familia Gemma 4 de Google orientado a roleplay y conversación. El modelo base, desarrollado por el equipo 26B-Suite, combina la arquitectura MoE de Gemma 4 (26B parámetros totales, 4B activos) con un ajuste específico para diálogos narrativos, personajes y escenarios de rol, con soporte adicional para entrada de imágenes.

Esta versión GGUF, publicada por mradermacher, permite ejecutar el modelo en hardware más modesto mediante cuantización, manteniendo un equilibrio entre tamaño, velocidad y calidad. Está pensada para su uso en aplicaciones como SillyTavern y otros frontends de chat, y soporta los idiomas inglés y ruso. La disponibilidad de cuantizaciones desde Q2_K hasta Q4_K_S facilita su despliegue en GPUs de consumo con 12-16 GB de VRAM.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Gemma 4 (26B A4B) |
| Parametros totales | 25.233.142.046 (25,2B) |
| Parametros activos | 4B (según denominación A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-IQ3_M, i1-Q4_K_S (también disponibles Q2_K, IQ3_M, Q4_K_S, etc. en el repo estático) |
| Idiomas soportados | inglés, ruso |
| Licencia | Gemma (términos de uso de Google) |
| Formato de pesos | GGUF (con imatrix) |

## Arquitectura y entrenamiento

El modelo base Dark-Goetia-26B-A4B-v4 es un fine-tune de Gemma 4 26B A4B, una arquitectura MoE con 26B parámetros totales y 4B activos por token. Esta configuración permite un rendimiento cercano a modelos densos de mayor tamaño con un coste computacional reducido. El fine-tune se ha realizado específicamente para tareas de roleplay y conversación, lo que implica un ajuste de los pesos para generar diálogos coherentes, mantener la personalidad de personajes y seguir instrucciones narrativas.

No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas como RLHF o DPO. La cuantización GGUF con imatrix, realizada por mradermacher, utiliza una matriz de importancia calculada sobre un corpus de referencia para optimizar la asignación de bits a los pesos más relevantes, mejorando la calidad respecto a cuantizaciones estáticas.

## Capacidades

- Generación de texto conversacional y roleplay: el modelo está optimizado para mantener diálogos multi-turno con coherencia narrativa y desarrollo de personajes.
- Soporte de visión: según la documentación, es un modelo de visión, aunque los archivos mmproj (proyectores de visión) se encuentran en el repositorio estático de cuantizaciones, no en este repo i1.
- Multilingüe: soporta inglés y ruso, lo que permite su uso en ambos idiomas.
- Integración con frontends de chat: compatible con SillyTavern y otras herramientas que consumen GGUF mediante llama.cpp o similares.
- No se ha confirmado soporte de tool calling, function calling ni capacidades de agente en la información disponible.

## Casos de uso

- Roleplay en SillyTavern: el modelo puede gestionar conversaciones de rol con múltiples personajes, manteniendo el contexto narrativo y las personalidades definidas por el usuario, gracias a su ajuste específico para este tipo de interacción.
- Creación de personajes ficticios: permite generar diálogos y respuestas coherentes para personajes de novelas, juegos o historias interactivas, con un tono consistente a lo largo de la conversación.
- Asistente de escritura creativa: puede ayudar a redactar diálogos, escenas o descripciones en inglés o ruso, sirviendo como herramienta de apoyo para escritores.
- Chat conversacional general: útil para mantener conversaciones informales o de soporte en los dos idiomas soportados, con respuestas contextualmente relevantes.
- Aplicaciones de entretenimiento: integrable en bots de Discord, Telegram u otras plataformas de mensajería para ofrecer experiencias de chat temáticas.
- Prototipado de asistentes con visión: dado que el modelo base soporta entrada de imágenes, puede emplearse en entornos donde se requiera interpretar imágenes junto con texto, aunque la cuantización GGUF puede requerir el archivo mmproj adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar para este modelo cuantizado.

## Requisitos de hardware

- VRAM estimada: los archivos GGUF tienen los siguientes tamaños:
  - i1-Q2_K: 10,7 GB
  - i1-IQ3_M: 12,5 GB
  - i1-Q4_K_S: 15,6 GB
- GPU recomendadas: para la cuantización Q4_K_S se recomienda una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4080, RTX 4090, A5000). Para Q2_K o IQ3_M, una GPU de 12 GB (RTX 3060, RTX 4070) puede ser suficiente.
- Compatibilidad con GPU de consumo: sí, las cuantizaciones más pequeñas caben en GPUs de gama media y alta de consumo.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier frontend compatible con GGUF.
- Latencia y throughput: no disponibles. Dependerán del hardware y de la cuantización elegida; al ser un MoE con 4B activos, la velocidad de generación será superior a la de un modelo denso de 26B.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos. Sin embargo, se puede contextualizar:

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Dark-Goetia-26B-A4B-v4 (este) | 25,2B totales, 4B activos | no disponible | Gemma | Fine-tune de Gemma 4 para roleplay, con visión |
| google/gemma-4-26b-a4b | 26B totales, 4B activos | no disponible | Gemma | Modelo base oficial de Google, con visión y razonamiento |
| Otros fine-tunes de Gemma 4 | variable | no disponible | Gemma | Existen múltiples adaptaciones para roleplay y chat |

La principal diferencia con el modelo base es el ajuste específico para roleplay, que mejora la coherencia narrativa y la personalidad de los personajes, aunque puede sacrificar algo de rendimiento en tareas generales.

## Limitaciones y advertencias

- Sesgos: no se han documentado sesgos específicos, pero al ser un fine-tune de Gemma 4, puede heredar los sesgos del modelo base.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en contextos abiertos.
- Limitaciones de contexto: la longitud de contexto no está especificada; se recomienda verificar la documentación de Gemma 4 para conocer el límite real.
- Restricciones de licencia: la licencia Gemma de Google impone restricciones de uso comercial y de redistribución. Es necesario revisar los términos completos antes de usar el modelo en producción.
- Pérdida de calidad por cuantización: las cuantizaciones de menor tamaño (Q2_K, IQ3_M) pueden degradar la calidad de las respuestas, especialmente en tareas complejas.
- Soporte de visión limitado: aunque el modelo base es de visión, los archivos mmproj no están incluidos en este repositorio; habrá que descargarlos del repo estático si se necesita esa funcionalidad.

## Enlaces

- Repositorio HuggingFace de la cuantización: https://huggingface.co/mradermacher/Dark-Goetia-26B-A4B-v4-i1-GGUF
- Repositorio del modelo base: https://huggingface.co/26B-Suite/Dark-Goetia-26B-A4B-v4
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/Dark-Goetia-26B-A4B-v4-GGUF
- Página oficial de Gemma 4: https://deepmind.google/models/gemma/gemma-4/
- Modelo Gemma 4 26B A4B en LM Studio: https://lmstudio.ai/models/google/gemma-4-26b-a4b
