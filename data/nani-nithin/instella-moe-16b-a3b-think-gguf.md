# NANI-Nithin/Instella-MoE-16B-A3B-Think-GGUF

## Resumen

Instella-MoE-16B-A3B-Think es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por AMD, con 16 mil millones de parámetros totales y 2,8 mil millones activos por token. Fue entrenado desde cero en GPUs AMD Instinct MI300X y MI325X utilizando el framework Primus, y se publica bajo licencia Apache-2.0. Este repositorio contiene conversiones GGUF del modelo, optimizadas para inferencia local eficiente en CPUs, GPUs de consumo y entornos de producción, permitiendo su uso con herramientas como llama.cpp, LM Studio u Ollama. El modelo está diseñado para tareas de razonamiento avanzado, incluyendo matemáticas, código y análisis lógico multi-paso.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) |
| Parametros totales | 15.862.789.248 (aprox. 15,86B) |
| Parametros activos | 2,8B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_M, IQ4_XS, IQ4_NL |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de Mixture of Experts (MoE) con activación dispersa, lo que significa que solo una fracción de los parámetros se activa por token (2,8B de 16B). Esta característica mejora la eficiencia computacional y reduce el coste de inferencia en comparación con un modelo denso de tamaño equivalente. Según la documentación de AMD, el modelo fue entrenado desde cero en GPUs AMD Instinct MI300X y MI325X usando el framework Primus, e incluye innovaciones arquitectónicas como Gated Multi-head Attention (nombre no confirmado en su totalidad). El entrenamiento se realizó de extremo a extremo, desde pre-entrenamiento hasta ajuste con refuerzo (RL). No se han proporcionado detalles sobre el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto con fuerte enfoque en razonamiento avanzado.
- Resolución de problemas matemáticos.
- Asistencia en programación y generación de código.
- Razonamiento lógico multi-paso.
- Análisis técnico de documentos y datos.
- Seguimiento de instrucciones complejas.
- Tareas intensivas en conocimiento.
- Compatible con herramientas de inferencia GGUF como llama.cpp, LM Studio, Ollama, Jan, KoboldCpp, entre otras.

## Casos de uso

- Asistente de programación en entornos de desarrollo: puede generar código, explicar algoritmos y depurar errores, aprovechando su capacidad de razonamiento lógico.
- Tutoría en matemáticas: útil para explicar conceptos, resolver ejercicios paso a paso y verificar soluciones.
- Análisis de documentos técnicos: capaz de extraer información clave, resumir y responder preguntas sobre informes o manuales.
- Chatbot de atención al cliente: puede mantener conversaciones multi-turno y resolver consultas complejas, aunque requiere integración con un sistema de gestión de contexto.
- Generación de contenido técnico: redacción de artículos, documentación y guías con precisión técnica.
- Despliegue local en hardware limitado: gracias a las cuantizaciones GGUF, puede ejecutarse en equipos con 8-16 GB de RAM, ideal para entornos sin acceso a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- RAM recomendada según cuantización (según la model card):
  - Q2/IQ2: 8 GB o más.
  - Q3/IQ3: 12 GB o más.
  - Q4/IQ4: 16 GB o más.
  - Q5: 24 GB o más.
  - Q6: 32 GB o más.
  - Q8: 48 GB o más.
- Compatible con CPUs modernas, GPUs de consumo (por ejemplo, RTX 3060, RTX 4090) y GPUs de datacenter.
- Despliegue mediante llama.cpp, LM Studio, Ollama, Jan, KoboldCpp, Text Generation WebUI, Open WebUI y otros motores compatibles con GGUF.
- La memoria real requerida depende del contexto y la configuración de offloading.

## Comparativa con modelos similares

No disponible. No se han encontrado datos comparativos con otros modelos en la información proporcionada.

## Limitaciones y advertencias

- La cuantización puede introducir ligeras diferencias en la calidad de las respuestas en comparación con el checkpoint original.
- El modelo está entrenado únicamente en inglés, lo que limita su uso en otros idiomas.
- No se han documentado sesgos específicos, pero al ser un modelo grande, es susceptible a sesgos presentes en los datos de entrenamiento.
- El repositorio GGUF es mantenido por un tercero (NANI-Nithin) y no es una publicación oficial de AMD.
- El modelo base incluye un modo de razonamiento ("Think") que requiere un parche específico en llama.cpp para evitar que el bloque de pensamiento se filtre en la salida, según se menciona en otro repositorio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/NANI-Nithin/Instella-MoE-16B-A3B-Think-GGUF
- Modelo base (safetensors): https://huggingface.co/NANI-Nithin/Instella-MoE-16B-A3B-Think
- Modelo oficial de AMD: https://huggingface.co/amd/Instella-MoE-16B-A3B-Think
- Blog de AMD sobre Instella-MoE: https://rocm.blogs.amd.com/artificial-intelligence/instella-moe/README.html
- Repositorio GitHub de AMD: https://github.com/AMD-AGI/Instella-MoE
- Artículo de Marktechpost: https://www.marktechpost.com/2026/08/01/amd-instella-moe-16b-a3b-fully-open-mixture-of-experts-llm/
- Repositorio con parche para el modo Think: https://huggingface.co/kingjones777/Instella-MoE-16B-A3B-Think-ROCmFP4-STRIX-GGUF
