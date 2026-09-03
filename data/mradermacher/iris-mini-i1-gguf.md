# mradermacher/Iris-mini-i1-GGUF

## Resumen

Iris-mini-i1-GGUF es una cuantizacion GGUF del modelo Iris-mini, desarrollado por AllSpark-Research. La version publicada por mradermacher utiliza pesos imatrix (weighted/imatrix quants) para optimizar la compresion y preservar la calidad en cuantizaciones agresivas. El modelo original esta orientado a tareas de agente y busqueda profunda, con un enfoque conversacional y una arquitectura Mixture of Experts (MoE) basada en la familia Qwen3.6, segun los metadatos de HuggingFace.

Con 48.036.230 parametros totales, es un modelo extremadamente pequeno, lo que lo hace adecuado para entornos con recursos limitados. El repositorio ocupa 0.2 GB y ofrece una amplia variedad de cuantizaciones, desde Q1 hasta Q6, lo que permite desplegarlo en CPU y GPU de baja gama. Su relevancia radica en la posibilidad de experimentar con arquitecturas MoE y tecnicas de cuantizacion sin necesidad de hardware costoso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Qwen3.6 |
| Parametros totales | 48.036.230 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo original Iris-mini, creado por AllSpark-Research, emplea una arquitectura Mixture of Experts (MoE). Segun los metadatos del repositorio, esta basado en la familia Qwen3.6, aunque no se especifica el numero de expertos ni los parametros activos. La cuantizacion publicada por mradermacher utiliza pesos imatrix, una tecnica que calcula la importancia de las matrices durante la compresion para reducir la perdida de precision, especialmente en cuantizaciones de baja precision como IQ1 o IQ2.

No se dispone de informacion sobre los datos de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas de RLHF o DPO. La unica referencia disponible es la orientacion funcional indicada en los tags: busqueda profunda, agente y conversacion.

## Capacidades

- Generacion de texto conversacional en ingles.
- Disenado para tareas de agente y busqueda profunda (search-agent, deep-research), segun los metadatos.
- Arquitectura MoE que permite activar solo una parte de los parametros, lo que puede reducir el coste computacional en inferencia.
- Soporte de tool calling: no confirmado en la informacion disponible.
- Capacidades multilingues: solo ingles confirmado; otros idiomas no documentados.
- Se distribuye en multiples cuantizaciones, desde Q1 hasta Q6, lo que permite ajustar la precision y el consumo de recursos.
- No se han documentado capacidades de vision, audio o modo de razonamiento explicito.

## Casos de uso

- Busqueda profunda en entornos con recursos limitados: al ser un modelo de 48M parametros en formato GGUF, puede ejecutarse en CPU y GPU de baja gama, lo que lo hace adecuado para prototipos de sistemas de investigacion automatizada.

- Agentes conversacionales ligeros: su orientacion a agentes y su tamano reducido permiten integrarlo en chatbots de bajo coste que requieren respuestas rapidas sin necesidad de infraestructura grande.

- Automatizacion de tareas de investigacion: puede usarse como componente de un pipeline de deep-research para resumir y procesar informacion, siempre que las tareas no requieran un razonamiento complejo.

- Asistente en dispositivos edge: su tamano de 0.2 GB permite desplegarlo en dispositivos de borde, como Raspberry Pi o Nvidia Jetson, para tareas de asistencia y procesamiento local.

- Prototipado rapido de arquitecturas MoE: al ser un modelo pequeno y estar disponible en multiples cuantizaciones, es util para experimentar con tecnicas de cuantizacion, compresion y rendimiento de MoE en hardware modesto.

- Integracion en herramientas de desarrollo: puede usarse como modelo de apoyo en IDEs o utilidades de linea de comandos para generar texto corto, sugerencias o asistencia conversacional basica, sin necesidad de conexion a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 100 MB en FP16 y 50 MB en cuantizacion Q4, basado en el numero de parametros. Estas cifras son estimaciones teoricas.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, incluidas las integradas. No se requiere hardware de gama alta.
- Compatible con consumer GPU: si, todas las GPUs de consumo son suficientes.
- Opciones de despliegue: llama.cpp, Ollama (si se importa el modelo), y cualquier framework que soporte formato GGUF. Tambien puede cargarse via Transformers si se convierten los pesos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Iris-mini-i1-GGUF | 48.036.230 | no disponible | Apache 2.0 | HuggingFace |
| Iris-mini (original) | no disponible | no disponible | Apache 2.0 | HuggingFace |
| Amethyst-1-mini-i1-GGUF | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de datos de rendimiento ni de benchmarks para establecer una comparativa significativa. Los modelos citados pertenecen a la misma categoria de modelos mini cuantizados, pero sus caracteristicas tecnicas no estan documentadas en la informacion disponible.

## Limitaciones y advertencias

- Sesgos: no documentados. Al ser un modelo pequeno, puede reflejar sesgos de los datos de entrenamiento, aunque no se dispone de informacion al respecto.
- Riesgo de alucinacion: presente en modelos de tamano reducido, especialmente en tareas que requieren razonamiento complejo o conocimientos factuales.
- Limitaciones de contexto: no disponibles. La longitud de contexto no se especifica, por lo que el rendimiento en conversaciones largas es incierto.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo original puede tener condiciones adicionales no documentadas en este repositorio.
- Caveat para produccion: al tratarse de un modelo de 48M parametros, su capacidad para tareas de razonamiento avanzado, generacion de codigo o analisis complejo es limitada. Es recomendable validar su rendimiento en casos de uso reales antes de desplegarlo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/mradermacher/Iris-mini-i1-GGUF
- Modelo original: https://huggingface.co/AllSpark-Research/Iris-mini
- Repositorio de cuantizaciones del autor: https://huggingface.co/mradermacher/Iris-mini-GGUF
