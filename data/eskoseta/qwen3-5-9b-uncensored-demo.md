# Eskoseta/qwen3.5-9b-uncensored-demo

## Resumen

Eskoseta/qwen3.5-9b-uncensored-demo es un Space de demostración alojado en Hugging Face, construido con Gradio 4.27.0 y un único fichero `app.py`, que sirve como interfaz de prueba para una variante sin alineación de seguridad de la familia Qwen3.5-9B. No es una publicación de pesos: el repositorio no declara licencia, idiomas soportados, pipeline ni formato de pesos, y su model card se limita a enlazar el modelo que consume.

El modelo subyacente es TheCluster/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive-MLX-mxfp4, una conversión a formato MLX con cuantización mxfp4 de HauhauCS/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive, que a su vez deriva de Qwen/Qwen3.5-9B de Alibaba. Según la información pública de la serie base, Qwen3.5-9B emplea una arquitectura híbrida de Gated Delta Networks con MoE disperso, 262.144 tokens de contexto, modo thinking, tool calling, predicción multi-token (MTP) y soporte de 201 idiomas.

Su relevancia práctica es limitada y muy específica: sirve como banco de pruebas para desplegar un modelo de ~9B sin filtros de contenido en hardware Apple Silicon mediante MLX. En el momento de la consulta el Space acumula 0 descargas y 0 likes, y no expone métricas ni documentación técnica propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con Gated Delta Networks y MoE disperso (según la información del modelo base Qwen3.5-9B) |
| Parámetros totales | no disponible (la nomenclatura sugiere ~9B, sin confirmación en la información disponible) |
| Parámetros activos | no disponible |
| Longitud de contexto | 262.144 tokens (heredado de Qwen3.5-9B según la información disponible) |
| Tipos de cuantización | mxfp4 (variante MLX referenciada); existe una conversión GGUF de la comunidad (5,32 GB) no verificada como oficial |
| Idiomas soportados | no disponible en el Space; el modelo base declara 201 idiomas |
| Licencia | no disponible |
| Formato de pesos | no disponible en el repositorio del Space; la variante referenciada usa MLX en mxfp4 |

## Arquitectura y entrenamiento

El Space no contiene pesos ni documentación de entrenamiento. Toda la información arquitectónica procede del modelo base Qwen3.5-9B, descrito como un transformer híbrido que combina capas Gated Delta Networks (una familia de atención lineal con estado recurrente) con capas MoE dispersas. Esta combinación busca reducir el coste de atención en contextos largos manteniendo la capacidad de un modelo denso de escala similar. El contexto declarado de la serie es de 262.144 tokens y se anuncia soporte de predicción multi-token, una técnica de decodificación especulativa integrada en el propio modelo.

La cadena de derivación documentada es: Qwen/Qwen3.5-9B (base, Alibaba) → HauhauCS/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive (ajuste sin alineación de seguridad) → TheCluster/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive-MLX-mxfp4 (conversión y cuantización mxfp4 para MLX) → este Space de demostración. No se especifica el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF, DPO u otras. El proceso de "uncensoring" aplicado por terceros tampoco está documentado en la información disponible, por lo que se desconoce si eliminó por completo los filtros o si degradó otras capacidades.

## Capacidades

Según la información del modelo base y de la ficha del Space:

- Generación de texto conversacional a través de una interfaz Gradio.
- Razonamiento explícito en modo thinking, con separación entre traza de razonamiento y respuesta final (capacidad declarada para Qwen3.5-9B).
- Tool calling / function calling (capacidad declarada para el modelo base).
- Predicción multi-token (MTP) para acelerar la decodificación.
- Cobertura multilingüe de hasta 201 idiomas según la ficha del modelo base.
- Manejo de contextos largos de hasta 262.144 tokens.
- Generación sin filtros de contenido ni rechazos por políticas de seguridad, como consecuencia del ajuste "aggressive" aplicado por terceros.
- No disponible: capacidades de visión, audio u otras modalidades no se mencionan en la información proporcionada.

Advertencia: estas capacidades se atribuyen al modelo base. No hay evaluación publicada que confirme que el ajuste sin alineación las preserve, y es habitual que este tipo de intervenciones degrade el razonamiento y el seguimiento de instrucciones.

## Casos de uso

- Red teaming y auditoría de seguridad: el modelo permite generar respuestas que un modelo alineado rechazaría, lo que resulta útil para construir conjuntos de pruebas adversarios y evaluar la robustez de filtros de moderación en pipelines propios.
- Investigación sobre alineación: comparar las respuestas de esta variante frente a Qwen3.5-9B sin ajustar permite medir empíricamente qué comportamientos se pierden o se alteran al eliminar la alineación.
- Generación de ficción sin restricciones temáticas: escritura de narrativa que aborda violencia, contenido adulto o temas sensibles, donde los modelos alineados suelen negarse o suavizar el texto.
- Despliegue local en Apple Silicon: la variante MLX/mxfp4 está pensada para ejecutarse en Macs con memoria unificada, permitiendo inferencia offline sin enviar datos a servicios externos.
- Prototipado rápido de interfaces conversacionales: el Space usa Gradio 4.27.0 y un único `app.py`, por lo que sirve como plantilla mínima para montar una demo de chat sobre un modelo servido localmente.
- Generación de datos sintéticos para dominios con vocabulario sensible: creación de corpus anotados en ámbitos como seguridad, medicina legal o análisis de discurso extremista, donde un modelo censurado produce datos truncados o sesgados por el rechazo.
- Traducción y procesamiento multilingüe: aprovechando la cobertura de 201 idiomas declarada en el modelo base, con la salvedad de que la calidad tras el ajuste sin alineación no está verificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni el Space, ni la model card, ni las fichas de las variantes intermedias consultadas incluyen puntuaciones de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra suite. Tampoco hay datos de latencia o throughput medidos.

## Requisitos de hardware

Las siguientes cifras son estimaciones orientativas derivadas del tamaño declarado (~9B parámetros) y del tamaño del fichero GGUF comunitario (5,32 GB); no proceden de mediciones publicadas para este modelo concreto.

- VRAM/RAM estimada en fp16: en torno a 18 GB de pesos más overhead de contexto (el KV cache a 262.144 tokens es inviable en este formato).
- VRAM/RAM estimada en cuantización de 4 bits: aproximadamente 5-6 GB de pesos, en línea con el GGUF de 5,32 GB citado.
- Consumer GPU: cabe con holgura en tarjetas de 8 GB o más (RTX 3060 Ti, 4060 Ti, 4070, 4080, 4090) usando cuantización de 4 bits. En 8 bits requiere 10-12 GB, es decir, RTX 4070 Ti Super o superior.
- Apple Silicon: la variante MLX/mxfp4 está diseñada para Macs con memoria unificada; se recomienda un mínimo de 16 GB para mxfp4 y 32 GB para trabajar con contextos amplios.
- GPU de centro de datos: A100 40/80 GB, H100 o L40S para fp16/bf16 con contextos largos.
- Opciones de despliegue: MLX (`mlx-lm`) para Apple Silicon, llama.cpp/Ollama para GGUF, y vLLM o TGI si se dispone de los pesos en safetensors (no disponibles en el Space). El propio Space requiere el SDK Gradio 4.27.0.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Comparativa dentro de la propia cadena de derivación, que es la información verificable disponible:

| Modelo | Base | Formato | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Eskoseta/qwen3.5-9b-uncensored-demo | Qwen3.5-9B uncensored | Space Gradio (app.py) | no disponible | no disponible | Space con 0 descargas y 0 likes |
| TheCluster/…-MLX-mxfp4 | HauhauCS uncensored | MLX mxfp4 | no disponible | no disponible | Repositorio de pesos MLX |
| HauhauCS/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive | Qwen3.5-9B | no disponible | no disponible | no disponible | Repositorio de pesos |
| AIOpsInSpace/…-Aggressive-MTP | HauhauCS uncensored | no disponible | no disponible | no disponible | Variante con predicción multi-token |
| Qwen/Qwen3.5-9B | — | safetensors (no confirmado) | 262.144 tokens | no disponible | Modelo base de Alibaba |

No se dispone de datos de rendimiento comparativos entre estas variantes, ni de puntuaciones frente a alternativas de la misma categoría (por ejemplo, modelos densos de 7-9B de otros proveedores). Tampoco hay información sobre licencias de las variantes derivadas, lo que impide evaluar su idoneidad para uso comercial.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: sin licencia explícita, no hay autorización de uso comercial y los derechos de redistribución son jurídicamente indeterminados. Además, la licencia del modelo base Qwen3.5-9B no se especifica en la información consultada, por lo que no puede confirmarse que las condiciones originales lo permitan.
- Modelo sin alineación: la variante "Uncensored/ Aggressive" ha sido modificada por terceros para eliminar rechazos y filtros. Puede generar contenido ilegal, dañino, difamatorio o sexual explícito. El propio repositorio derivado MTP incluye una nota de que, al ser un modelo no alineado, la responsabilidad legal del uso recae en el usuario.
- Riesgo elevado de alucinación: no hay evaluación publicada. Los ajustes sin alineación suelen degradar el seguimiento de instrucciones y aumentar la confabulación, especialmente en tareas de razonamiento factual.
- Degradación desconocida de capacidades: no se ha verificado que el modelo conserve el modo thinking, el tool calling, la predicción multi-token ni el soporte multilingüe del modelo base tras el ajuste.
- Contexto real incierto: aunque el modelo base declara 262.144 tokens, no hay confirmación de que la cuantización mxfp4 y las variantes derivadas mantengan esa ventana, ni de la calidad de recuperación en posiciones lejanas.
- Sin trazabilidad de datos de entrenamiento: se desconoce por completo el corpus utilizado en el ajuste sin alineación, lo que impide auditar sesgos o contenido problemático.
- Estado del repositorio: 0 descargas, 0 likes, fichero creado y actualizado con cuatro segundos de diferencia y fecha futura (2026-10-12). Es un artefacto reciente, sin validación por parte de la comunidad.
- Idiomas: el Space no declara ninguno. La cifra de 201 idiomas corresponde al modelo base y no está respaldada por evaluación alguna de esta variante.
- Entorno de ejecución: la demo depende de Gradio 4.27.0, versión antigua con vulnerabilidades conocidas si se expone públicamente sin controles adicionales. No debe desplegarse en producción sin revisión de seguridad.

## Enlaces

- Space de demostración: https://huggingface.co/Eskoseta/qwen3.5-9b-uncensored-demo
- Modelo referenciado por el Space: https://huggingface.co/TheCluster/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive-MLX-mxfp4
- Modelo base del ajuste sin alineación: https://huggingface.co/HauhauCS/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive
- Modelo original de Alibaba: https://huggingface.co/Qwen/Qwen3.5-9B
- Variante con predicción multi-token: https://huggingface.co/AIOpsInSpace/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive-MTP
- Ficha agregadora en OpenMayhem: https://openmayhem.ai/explore/models/qwen3-5-9b-uncensored
- Demo de inferencia en DeepInfra (modelo base): https://deepinfra.com/Qwen/Qwen3.5-9B
- Índice de la conversión GGUF comunitaria: https://local-ai-zone.github.io/models/qwen3-5-9b-uncensored.html
