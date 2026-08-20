# bowmanslayer/Qwen3.8-27B-Uncensored-Text-Only-GGUF

## Resumen

El modelo `bowmanslayer/Qwen3.8-27B-Uncensored-Text-Only-GGUF` es una cuantización en formato GGUF del modelo base `JonathanColetti/Qwen3.8-27B-Uncensored`, un LLM de 26.9 mil millones de parámetros especializado en generación de texto sin filtros de moderación. Ha sido sometido a un proceso de *abliteration* (eliminación de capas de rechazo) y se distribuye como *uncensored*, lo que significa que no incorpora respuestas de negativa ante solicitudes potencialmente sensibles.

Desarrollado por el usuario `bowmanslayer`, este repositorio proporciona pesos cuantizados listos para ejecución con `llama.cpp`, `Ollama` u otras herramientas compatibles con GGUF. Su tamaño de contexto y arquitectura interna no se detallan en la información disponible, aunque por el nombre se infiere una arquitectura derivada de la familia Qwen (posiblemente Qwen3.5 o Qwen3.8, sin confirmación oficial). El acceso al repositorio está restringido (gated) en HuggingFace, por lo que requiere aceptar condiciones antes de la descarga.

Relevante para entornos de investigación y desarrollo donde se prioriza la generación de contenido libre de restricciones, pero con el riesgo inherente de producir respuestas inapropiadas o sesgadas. Su licencia Apache 2.0 permite uso comercial, aunque el modelo base puede imponer restricciones adicionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 26.895.998.464 (26.9B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (no se especifican cuantizaciones concretas en la ficha) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se han publicado detalles sobre la arquitectura interna del modelo base `JonathanColetti/Qwen3.8-27B-Uncensored`. El nombre sugiere una variante de la serie Qwen (posiblemente basada en Qwen3.5), pero no hay información oficial sobre el número de capas, tipo de atención o mecanismos de entrenamiento. El repositorio GGUF es una conversión de los pesos originales, por lo que no aporta datos adicionales sobre la arquitectura.

El modelo base ha sido sometido a un proceso de *abliteration*, que consiste en eliminar o neutralizar las capas responsables de generar respuestas de rechazo, lo que produce un comportamiento *uncensored*. No se documentan detalles sobre el dataset de entrenamiento, el número de tokens procesados o el uso de técnicas de alineación (RLHF, DPO, etc.). Toda la información técnica relativa al entrenamiento queda fuera del alcance de la información proporcionada.

## Capacidades

- Generación de texto libre y continuada, sin filtros de contenido.
- Soporte de conversaciones multi-turno (según etiqueta `conversational`).
- Capacidad de procesar solo texto (text-only), sin entrada visual ni multimodal.
- No se especifican capacidades de tool calling, agentes o razonamiento multi-step.
- Idiomas soportados no declarados; se asume que sigue el comportamiento del modelo base (posiblemente multilingüe, pero no confirmado).

## Casos de uso

- **Generación de contenido creativo sin restricciones**: escritura de ficción, guiones o diálogos que aborden temas que otros modelos rechazarían. El modelo, al ser uncensored, no aplicará bloqueos de contenido, lo que facilita su uso en proyectos de creación literaria experimental.
- **Investigación en alineación y seguridad**: estudiar cómo se comporta un modelo sin capas de rechazo, comparando su salida con versiones moderadas para analizar diferencias en toxicidad, sesgos y calidad.
- **Simulación de escenarios extremos**: en entornos controlados, generar texto sobre temas delicados (política, religión, violencia) para evaluar respuestas y desarrollar sistemas de filtrado posteriores.
- **Prototipado de aplicaciones de chat**: integrar el modelo en un chatbot local (con llama.cpp u Ollama) para probar interacciones sin restricciones en un entorno de desarrollo aislado.
- **Generación de datos sintéticos**: crear conjuntos de texto variados y no censurados para entrenar clasificadores de contenido o detectores de sesgo.
- **Estudio de comportamiento de modelos abliterados**: comparar este modelo con su versión original (con censura) para medir el impacto del abliteration en la calidad de las respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio tiene un tamaño de 86.5 GB, lo que indica que contiene múltiples archivos GGUF con diferentes cuantizaciones (por ejemplo, Q4, Q5, Q8, etc.), aunque no se listan explícitamente.
- Para un modelo de 26.9B parámetros, la VRAM estimada según cuantización típica sería:
  - Q4_K_M: ~16 GB VRAM (cabe en RTX 3090, RTX 4090, A10, etc.)
  - Q5_K_M: ~18 GB VRAM (RTX 3090/4090, A100 40GB)
  - Q8_0: ~28 GB VRAM (A100 40GB, RTX 4090 24GB no suficiente, necesitaría GPU de 32GB o más)
- No se especifican los archivos concretos, por lo que la VRAM exacta depende de la cuantización elegida.
- Compatible con `llama.cpp`, `Ollama`, `LM Studio` y servidores como `llama-server` o `vLLM` (si se convierte a formato compatible).
- La latencia dependerá del hardware y la cuantización; no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (uncensored de ~27B en GGUF). Se puede mencionar que otros modelos uncensored como `NousResearch/Hermes-3-Llama-3.1-8B` o `mistralai/Mistral-7B-Instruct` existen, pero no son equivalentes en tamaño ni en contexto. Por lo tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- **Contenido no apto**: el modelo está etiquetado como `not-for-all-audiences` y `uncensored`, por lo que puede generar contenido violento, sexual, discriminatorio o ilegal. No debe desplegarse en producción sin un filtro de contenido adicional.
- **Sesgos y alucinaciones**: al ser un modelo abliterado, se elimina la capa de rechazo pero no se corrigen sesgos subyacentes del entrenamiento. Riesgo de alucinaciones en temas de hechos objetivos.
- **Acceso restringido**: el repositorio en HuggingFace es gated; es necesario aceptar términos de uso antes de la descarga. Esto puede limitar la reproducibilidad en entornos de investigación.
- **Licencia**: aunque la licencia declarada es Apache 2.0, el modelo base `JonathanColetti/Qwen3.8-27B-Uncensored` puede tener restricciones adicionales. Se recomienda revisar la licencia del modelo base antes de uso comercial.
- **Sin garantía de calidad**: al ser una cuantización GGUF sin especificaciones técnicas detalladas, la calidad de las respuestas puede variar respecto al modelo original en formato safetensors.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bowmanslayer/Qwen3.8-27B-Uncensored-Text-Only-GGUF
- Modelo base (safetensors): https://huggingface.co/JonathanColetti/Qwen3.8-27B-Uncensored
- (No se encontraron papers, blogs o demos adicionales en la información proporcionada.)
