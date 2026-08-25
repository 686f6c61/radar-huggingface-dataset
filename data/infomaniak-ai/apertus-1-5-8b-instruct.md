# Infomaniak-AI/Apertus-1.5-8B-Instruct

## Resumen

Apertus 1.5 es una familia de modelos de lenguaje de 8B y 70B parámetros desarrollada por la Swiss AI Initiative, una colaboración entre EPFL, ETH Zurich y CSCS, con la participación de Infomaniak para el despliegue y distribución. El modelo se presenta como una apuesta por la IA soberana europea: pesos abiertos, datos de entrenamiento abiertos y ciencia abierta, con licencia Apache 2.0. La versión *Instruct* de 8B está orientada a conversación, razonamiento y uso en herramientas.

La versión 1.5 añade comprensión de imágenes (multimodalidad), un modo de pensamiento opcional, una ventana de contexto cuatro veces mayor que la generación anterior (hasta 262 144 tokens) y mejoras en el seguimiento de instrucciones y en el uso de herramientas. Está publicada en Hugging Face bajo el identificador `Infomaniak-AI/Apertus-1.5-8B-Instruct` y también se distribuye a través de la organización `swiss-ai`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer, sin confirmar) |
| Parametros totales | 8B (aproximado, según nombre del modelo) |
| Parametros activos | no aplicable (no se indica que sea MoE) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | no disponible (existe una variante FP8 de terceros) |
| Idiomas soportados | multilingue (lenguas no especificadas en la documentacion) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (probablemente safetensors, sin confirmar) |

## Arquitectura y entrenamiento

Los detalles concretos de arquitectura no se han publicado en la informacion disponible. Se sabe que la familia Apertus 1.5 mantiene el tamaño de 8B y 70B de la version 1.0, y que la version 1.5 incorpora comprension de imagenes, un modo de pensamiento opcional y una ventana de contexto ampliada a 262 144 tokens. El entrenamiento se basa en datos abiertos y el proyecto declara transparencia total en pesos, datos y proceso de desarrollo. No se han publicado detalles sobre el dataset concreto, el numero de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento multi-paso.
- Comprension de imagenes (multimodal) integrada en el modelo base.
- Modo de pensamiento opcional, que permite al modelo razonar de forma explicita antes de responder.
- Mejora en el seguimiento de instrucciones respecto a la version 1.0.
- Soporte para tool calling y uso de herramientas, lo que lo hace apto para agentes.
- Capacidades multilingues, aunque no se especifica la lista de lenguas.

## Casos de uso

- **Atencion al cliente automatizada**: con 262 144 tokens de contexto, puede mantener conversaciones de larga duracion y recordar informacion de interacciones previas, lo que permite asistentes virtuales que no pierden el hilo.
- **Analisis de documentos con imagenes**: su capacidad multimodal permite procesar PDFs, capturas o diagramas, extrayendo informacion de texto e imagen simultaneamente, util en sectores como legal o medico.
- **Asistentes de codigo con tool calling**: puede integrarse en entornos de desarrollo para generar, revisar y ejecutar codigo, llamando a funciones o APIs externas cuando es necesario.
- **Agentes autonomos multi-paso**: su modo de pensamiento y el soporte de herramientas lo hacen adecuado para tareas complejas como planificacion, busqueda de informacion y ejecucion de acciones encadenadas.
- **Investigacion academica**: al ser un modelo abierto con licencia Apache 2.0, se puede usar en proyectos de investigacion sin restricciones de uso comercial, permitiendo experimentacion y reproduccion de resultados.
- **Despliegue soberano en Europa**: al ser un modelo suizo, ofrece una alternativa para empresas que necesitan cumplir con normativas de proteccion de datos (GDPR) y evitar dependencia de proveedores de fuera de la UE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se puede comparar con otros modelos de forma cuantitativa sin datos oficiales.

## Requisitos de hardware

- **VRAM estimada para inferencia**: un modelo de 8B en FP16 requiere aproximadamente 16 GB de VRAM; con cuantizacion 8 bits, unos 8-10 GB; con 4 bits, 4-6 GB.
- **GPU recomendadas**: para FP16, una RTX 3090/4090 o A100; con cuantizacion, una RTX 3060 12 GB o superior es suficiente para 4 bits.
- **Compatibilidad con GPU de consumo**: si, el modelo de 8B puede ejecutarse en GPUs consumer de gama media-alta con cuantizacion.
- **Opciones de despliegue**: compatible con vLLM, llama.cpp, Ollama, TGI y otras herramientas estandar de la comunidad.
- **Latencia y throughput**: no disponible, no se han publicado mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Multimodal | Tool calling |
|---|---|---|---|---|---|
| Apertus 1.5 8B | 8B | 262 144 | Apache 2.0 | Si (imagen) | Si |
| Llama 3.1 8B | 8B | 131 072 | Llama 3.1 (uso comercial permitido) | No | Si |
| Qwen 2.5 7B | 7B | 131 072 | Apache 2.0 | No | Si |
| Mistral 7B | 7B | 32 768 | Apache 2.0 | No | No |

La comparacion se basa en datos publicos de cada modelo; no se dispone de resultados de benchmarks que permitan comparar el rendimiento real.

## Limitaciones y advertencias

- No se han publicado estudios de sesgos o evaluaciones de alucinacion para este modelo en la informacion disponible.
- La ventana de contexto de 262 144 tokens es amplia, pero el rendimiento en contextos muy largos no se ha validado con benchmarks publicos.
- El modelo es relativamente nuevo (publicado en 2026) y puede tener menos madurez que alternativas con mas traccion en la comunidad.
- Aunque la licencia Apache 2.0 permite uso comercial sin restricciones, hay que verificar que los datos de entrenamiento no incluyan contenido con derechos que puedan generar problemas legales.
- La modalidad de imagen puede tener limitaciones en la resolucion o tipos de imagen soportados, no detallados en la documentacion.
- Para produccion, se recomienda realizar evaluaciones propias en el dominio especifico antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/Infomaniak-AI/Apertus-1.5-8B-Instruct
- Repositorio swiss-ai en Hugging Face: https://huggingface.co/swiss-ai/Apertus-v1.5-8B
- Sitio oficial del proyecto: https://apertus-ai.org/
- Articulo sobre Apertus 1.5: https://apertus-ai.org/articles/2026-07-apertus-1-5/
- Variante FP8 de terceros: https://huggingface.co/artificialy/Apertus-v1.5-8B-FP8-BLOCK
- Aplicaciones de Apertus: https://apertus.ai/en/apps/apertus-model/
