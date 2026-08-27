# mradermacher/MiniMax-M2-THRIFT-i1-GGUF

## Resumen

MiniMax-M2-THRIFT-i1-GGUF es una colección de cuantizaciones GGUF del modelo MiniMax-M2-Pruned-25, desarrollada por mradermacher. Este modelo base es una versión podada del MiniMax M2, un modelo de lenguaje de gran tamaño con arquitectura de mezcla de expertos (MoE) que destaca por su eficiencia en el uso de memoria y su capacidad para ejecutarse en hardware de consumo. La versión THRIFT se ha optimizado específicamente para reducir el consumo de recursos, manteniendo un rendimiento cercano al modelo original.

La relevancia de este modelo radica en su capacidad para ejecutar agentes de IA de última generación de forma completamente local, con un rendimiento comparable al de Claude 3.5 Sonnet en tareas de agente, según la guía de despliegue disponible en GitHub. Con 172.5 mil millones de parámetros totales y una arquitectura MoE, ofrece una alternativa de código abierto con licencia MIT para desarrolladores que necesitan ejecutar modelos de gran tamaño sin depender de APIs en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) |
| Parametros totales | 172.507.452.032 (172,5 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0 |
| Idiomas soportados | en (ingles) |
| Licencia | mit |
| Formato de pesos | GGUF (con archivos imatrix) |

## Arquitectura y entrenamiento

El modelo base es MiniMax-M2-Pruned-25, una version podada del MiniMax M2 que reduce el numero de parametros activos manteniendo la arquitectura MoE. La poda se realizo para optimizar el rendimiento en hardware de consumo, reduciendo la huella de memoria sin sacrificar en exceso la calidad del modelo. Los datos de entrenamiento incluyen los datasets nick007x/github-code-2025 y tatsu-lab/alpaca, lo que sugiere un enfoque en codigo y tareas conversacionales.

Las cuantizaciones i1 de mradermacher utilizan la tecnica imatrix (importance matrix) para mejorar la calidad de la cuantizacion, especialmente en los niveles de bits mas bajos. Esta tecnica calcula una matriz de importancia basada en la activacion de los pesos, lo que permite una distribucion mas eficiente de los bits disponibles. El modelo esta optimizado para su uso con sglang, un motor de inferencia de alto rendimiento.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles.
- Razonamiento complejo y resolucion de problemas, con rendimiento cercano a Claude 3.5 Sonnet en tareas de agente.
- Generacion de codigo, gracias al entrenamiento con el dataset github-code-2025.
- Capacidad para actuar como agente autonomo, con soporte para tareas de multiple pasos.
- Ejecucion local en hardware de consumo, con 128 GB de RAM como requisito recomendado.
- Compatible con el framework Mini-Agent para despliegue de agentes locales.

## Casos de uso

- Agentes de IA locales para trabajo sensible: el modelo puede ejecutarse completamente en local con Mini-Agent, lo que permite manejar datos confidenciales sin enviarlos a APIs en la nube. Es adecuado para entornos juridicos, medicos o financieros donde la privacidad es critica.
- Asistente de programacion offline: gracias a su entrenamiento con github-code-2025, puede generar, revisar y depurar codigo sin conexion, integrandose en entornos de desarrollo locales o en pipelines de CI/CD privados.
- Automatizacion de tareas de oficina: puede gestionar correos electronicos, redactar documentos y resumir informes extensos, manteniendo el contexto de conversaciones largas gracias a su arquitectura MoE.
- Investigacion academica: los investigadores pueden ejecutar experimentos de generacion de texto y razonamiento sin depender de servicios externos, con la ventaja de la licencia MIT para uso comercial.
- Chatbots de soporte tecnico: puede desplegarse como backend de un sistema de atencion al cliente, gestionando consultas multi-turno y escalando a agentes humanos cuando sea necesario.
- Prototipado rapido de aplicaciones de IA: los desarrolladores pueden probar ideas de productos de IA sin costes de API, utilizando las cuantizaciones mas pequenas para iterar rapidamente y las mas grandes para produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 35 GB (cuantizacion i1-IQ1_S) y 92 GB (cuantizacion i1-Q4_0), segun el archivo GGUF seleccionado.
- GPU recomendadas: para las cuantizaciones mas pequenas, una GPU con 48 GB de VRAM (como RTX A6000 o A40) puede ser suficiente. Para las cuantizaciones mayores, se recomienda una GPU con 80 GB o mas (A100, H100) o el uso de CPU con 128 GB de RAM.
- Si cabe en consumer GPU: las cuantizaciones i1-IQ1_S (35,3 GB) e i1-IQ1_M (39,1 GB) podrian caber en una RTX 4090 de 24 GB solo con offloading parcial a RAM, pero no de forma completa. Se recomienda un sistema con 128 GB de RAM para ejecutar el modelo de forma fluida.
- Opciones de despliegue: sglang (optimizado para este modelo), llama.cpp, Ollama y cualquier framework compatible con GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiniMax-M2-THRIFT-i1-GGUF | 172,5 B (MoE) | no disponible | MIT | GGUF | Cuantizaciones i1 con imatrix |
| MiniMax-M2-THRIFT-55-GGUF | no disponible | no disponible | MIT | GGUF | Version con cuantizaciones estaticas del mismo autor |
| MiniMax-M2 (original) | no disponible | no disponible | no disponible | no disponible | Modelo base sin podar |

## Limitaciones y advertencias

- El modelo esta entrenado principalmente en ingles, por lo que su rendimiento en otros idiomas puede ser limitado.
- Las cuantizaciones de muy baja precision (IQ1_S, IQ1_M) pueden degradar significativamente la calidad de las respuestas y aumentar la probabilidad de alucinaciones.
- No se dispone de informacion sobre la longitud de contexto soportada, lo que puede limitar su uso en tareas que requieran ventanas de contexto muy largas.
- Aunque la licencia es MIT, el modelo base MiniMax-M2-Pruned-25 puede tener restricciones adicionales no documentadas en esta ficha.
- El despliegue en hardware de consumo requiere al menos 128 GB de RAM, lo que limita su uso en equipos con menos memoria.
- No se han publicado benchmarks oficiales, por lo que las comparaciones de rendimiento con otros modelos deben basarse en pruebas independientes.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/mradermacher/MiniMax-M2-THRIFT-i1-GGUF)
- [Modelo base: lemuralabs/MiniMax-M2-Pruned-25](https://huggingface.co/lemuralabs/MiniMax-M2-Pruned-25)
- [Guia de despliegue con Mini-Agent](https://github.com/latent-variable/minimax-agent-guide)
- [Version con cuantizaciones estaticas](https://huggingface.co/mradermacher/MiniMax-M2-THRIFT-55-GGUF)
