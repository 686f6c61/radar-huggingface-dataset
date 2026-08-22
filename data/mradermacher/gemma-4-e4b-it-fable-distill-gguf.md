# mradermacher/Gemma-4-E4B-it-Fable-Distill-GGUF

## Resumen

Este repositorio contiene las cuantizaciones GGUF del modelo `armand0e/Gemma-4-E4B-it-Fable-Distill`, un destilado de la familia Gemma 4 de Google, preparadas por mradermacher. El modelo base es una versión ajustada y destilada de Gemma 4 E4B, orientada a conversación y generación de texto en inglés. La cuantización a formato GGUF permite ejecutar el modelo en hardware de consumo mediante motores como llama.cpp, Ollama o LM Studio, reduciendo significativamente los requisitos de memoria.

El repositorio incluye 14 archivos de cuantización estática, desde Q2_K hasta f16, además de dos archivos `mmproj` (Q8_0 y f16) que sugieren que el modelo base tiene capacidades multimodales. Con 7.518.069.290 parámetros totales, el modelo destilado es más grande que el Gemma 4 E4B original (4.4B), probablemente debido a un proceso de destilación que expande la arquitectura. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

La relevancia de este modelo radica en su disponibilidad como GGUF, lo que facilita su despliegue local en entornos de desarrollo e investigación, especialmente para prototipado rápido de aplicaciones conversacionales. Sin embargo, al ser una cuantización estática sin imatrix, la calidad puede ser inferior a otras versiones optimizadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura del modelo base `armand0e/Gemma-4-E4B-it-Fable-Distill`. Por el nombre, se infiere que es un destilado de Gemma 4 E4B, que en su versión original es un transformer denso con 4.4B parámetros y soporte multimodal. Sin embargo, el modelo aquí cuantizado tiene 7.5B parámetros, lo que sugiere que el proceso de destilación pudo haber expandido la arquitectura o que se trata de una variante diferente. La presencia de archivos `mmproj` en el repositorio indica que el modelo base incluye un proyector multimodal, probablemente para entrada de imágenes.

El proceso de cuantización fue realizado por mradermacher mediante conversión estática a GGUF, sin usar imatrix ni pesos ponderados. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens o si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Generación de texto y conversación en inglés, orientado a tareas de chat.
- Posible soporte multimodal (entrada de imágenes) gracias a los archivos `mmproj` incluidos, aunque no se ha confirmado su funcionamiento.
- Compatible con motores de inferencia GGUF como llama.cpp, Ollama, LM Studio y text-generation-inference.
- Al ser una cuantización, el rendimiento depende del tipo elegido; las versiones Q4_K_M y Q5_K_M ofrecen un equilibrio entre calidad y velocidad.
- No se ha confirmado soporte para tool calling, function calling o razonamiento multi-paso.

## Casos de uso

- Chatbot local para desarrollo y pruebas: al ser un GGUF, se puede integrar fácilmente en aplicaciones de escritorio o servidores locales con Ollama o llama.cpp, permitiendo iterar sobre prompts y flujos conversacionales sin depender de APIs externas.
- Asistente de escritura en inglés: el modelo puede generar borradores de correos, artículos o documentación técnica, aprovechando su capacidad de generación de texto en inglés.
- Prototipado de aplicaciones de IA generativa: los desarrolladores pueden usar las cuantizaciones más pequeñas (Q2_K, Q3_K) para validar conceptos en hardware limitado, y luego escalar a versiones de mayor calidad.
- Investigación en destilación de modelos: al ser un destilado de Gemma 4, puede servir como caso de estudio para comparar el rendimiento de modelos destilados frente a los originales.
- Educación y demostraciones: su licencia Apache 2.0 y su tamaño moderado lo hacen adecuado para talleres o cursos sobre inferencia local de LLMs.
- Generación de código auxiliar: aunque no se ha verificado su capacidad específica para código, modelos de este tamaño suelen manejar tareas básicas de programación, por lo que podría usarse para autocompletar o explicar fragmentos simples.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Los tamaños de archivo varían desde 4.5 GB (Q2_K) hasta 15.2 GB (f16), por lo que la VRAM necesaria depende de la cuantización elegida.
- Para Q4_K_M (5.4 GB), se recomienda una GPU con al menos 8 GB de VRAM, como una RTX 3060 o superior.
- Las cuantizaciones Q2_K y Q3_K pueden ejecutarse en GPUs con 6 GB de VRAM, aunque con mayor pérdida de calidad.
- Para f16 (15.2 GB), se necesitan GPUs con 16 GB o más, como RTX 4080/4090 o A100.
- El modelo es compatible con llama.cpp, Ollama, LM Studio y servidores TGI que soporten GGUF.
- No se dispone de datos de latencia o throughput específicos para este modelo.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa fiable con otros modelos de la misma categoría. El modelo base es un destilado de Gemma 4 E4B, pero no se conocen sus métricas de rendimiento ni las de sus alternativas.

## Limitaciones y advertencias

- Es una cuantización estática sin imatrix, por lo que la calidad puede ser inferior a versiones con optimización de pesos.
- El modelo base es un destilado, lo que puede implicar una pérdida de capacidades frente al modelo original Gemma 4 E4B.
- Solo está disponible en inglés; no se ha confirmado soporte multilingüe.
- No se ha verificado el soporte para tool calling, agentes o razonamiento avanzado.
- La presencia de archivos `mmproj` sugiere multimodalidad, pero no se ha documentado su funcionamiento ni su calidad.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es un modelo reciente y poco probado por la comunidad.
- Aunque la licencia Apache 2.0 permite uso comercial, se recomienda revisar la licencia del modelo base original para asegurar el cumplimiento.

## Enlaces

- [Repositorio GGUF en HuggingFace](https://huggingface.co/mradermacher/Gemma-4-E4B-it-Fable-Distill-GGUF)
- [Modelo base: armand0e/Gemma-4-E4B-it-Fable-Distill](https://huggingface.co/armand0e/Gemma-4-E4B-it-Fable-Distill)
- [Página de Gemma 4 E4B en gemma4.dev](https://gemma4.dev/models/gemma-4-e4b)
- [Model card oficial de Gemma 4](https://ai.google.dev/gemma/docs/core/model_card_4)
