# mradermacher/CalibForge-35B-A3B-v2-i1-GGUF

## Resumen

CalibForge-35B-A3B-v2 es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por AweAI-Team, especializado en tareas de agente de terminal (terminal-agent) y ajustado mediante supervisión fina (SFT). Con 34.660.610.688 parámetros totales y una designación "35B-A3B" que indica aproximadamente 3.000 millones de parámetros activos por token, el modelo está pensado para ejecutar comandos, interpretar salidas de terminal y resolver tareas de automatización en entornos de línea de comandos. La model card lo vincula al preprint arXiv:2608.06352 y al dataset AweAI-Team/CalibForge.

La ficha que nos ocupa corresponde a la cuantización GGUF realizada por mradermacher, publicada bajo el identificador mradermacher/CalibForge-35B-A3B-v2-i1-GGUF. Se trata de cuantizaciones ponderadas con imatrix (i1) del modelo base AweAI-Team/CalibForge-35B-A3B-v2, lo que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles. El repositorio ocupa 371,0 GB e incluye 24 variantes de cuantización, desde IQ1_S (7,6 GB) hasta Q6_K (28,6 GB), además del fichero imatrix para generar cuantizaciones propias.

La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar un modelo MoE de 35B orientado a agentes de terminal en equipos sin GPUs de数据中心. La licencia Apache 2.0 facilita su uso comercial, y la disponibilidad de cuantizaciones de bajo bit permiten experimentar incluso en GPUs de consumo con 8-12 GB de VRAM, a costa de una pérdida de calidad que el propio autor advierte en las variantes más agresivas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE); detalles de capas y atención no disponibles |
| Parametros totales | 34.660.610.688 (34,66B) |
| Parametros activos | aproximadamente 3B (según designación A3B; cifra exacta no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1 con imatrix: IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

La información disponible confirma que se trata de un modelo MoE con 34,66B parámetros totales y aproximadamente 3B activos por token, pero no detalla el número de expertos, la estrategia de enrutamiento ni la configuración de atención. El modelo base es AweAI-Team/CalibForge-35B-A3B-v2, afinado mediante SFT (supervised fine-tuning) sobre el dataset AweAI-Team/CalibForge, orientado a tareas de agente de terminal. La model card referencia el preprint arXiv:2608.06352, que presumiblemente describe el proceso de entrenamiento y calibración, aunque su contenido no está disponible en la información proporcionada.

La innovación destacable de esta ficha no está en el modelo en sí, sino en el proceso de cuantización: mradermacher aplica cuantizaciones ponderadas con imatrix (i1), que utilizan una matriz de importancia calculada sobre el dataset de calibración para preservar mejor los pesos relevantes en bits bajos. El autor indica que las variantes IQ suelen ser preferibles a las no-IQ de tamaño similar, y que IQ3_S "beats Q3_K*". La model card también menciona que el modelo es de visión y que los ficheros mmproj, si existen, están en el repositorio estático (mradermacher/CalibForge-35B-A3B-v2-GGUF), no en este.

## Capacidades

- Generación de texto conversacional en inglés, con especialización en tareas de agente de terminal.
- Ejecución e interpretación de comandos de línea de comandos (terminal-agent), incluyendo la resolución de tareas multi-paso.
- Razonamiento orientado a agentes: el tag "terminal-agent" y el ajuste SFT sobre CalibForge sugieren entrenamiento específico para planificación y ejecución de acciones en entornos de shell.
- Capacidad de visión según la model card ("This is a vision model"), aunque los ficheros mmproj no están incluidos en este repositorio y deben obtenerse del repositorio estático.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Capacidades multilingües: limitadas al inglés según el campo language.
- Compatibilidad con endpoints: el tag "endpoints_compatible" sugiere integración con infraestructuras de despliegue estándar.

## Casos de uso

- Automatización de tareas de administración de sistemas: el modelo puede interpretar instrucciones en lenguaje natural y generar secuencias de comandos de shell para tareas de mantenimiento, monitorización o despliegue, gracias a su ajuste específico como terminal-agent.
- Agentes de CI/CD: integrado en pipelines, puede analizar salidas de compilación o logs de error y proponer comandos de corrección, reduciendo la intervención manual en tareas repetitivas.
- Asistente de terminal interactivo: desplegado con llama.cpp u Ollama en una estación de trabajo, ofrece sugerencias de comandos contextuales y explica salidas de herramientas CLI al desarrollador.
- Diagnóstico y resolución de incidencias en servidores: con una ventana de contexto adecuada (no confirmada), puede procesar secuencias de logs y proponer pasos de remediación paso a paso.
- Generación de scripts de automatización: a partir de una descripción en inglés, produce scripts de bash o PowerShell para tareas de aprovisionamiento, backups o limpieza de disco.
- Educación y formación en línea de comandos: sirve como tutor que explica comandos, flags y errores comunes en entornos Linux, con la ventaja de ejecutarse localmente en hardware de consumo gracias a las cuantizaciones de 8-12 GB.
- Prototipado de agentes autónomos en investigación: su naturaleza MoE con ~3B activos permite iterar rápidamente en experimentos de agentes multi-paso con un coste computacional moderado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización, tamaño de fichero):
  - IQ1_S: 7,6 GB; IQ1_M: 8,3 GB; IQ2_XXS: 9,6 GB; IQ2_XS: 10,6 GB; IQ2_S: 10,8 GB; IQ2_M: 11,8 GB.
  - Q2_K_S: 12,3 GB; Q2_K: 13,0 GB; IQ3_XXS: 13,7 GB; IQ3_XS: 14,6 GB; Q3_K_S: 15,3 GB; IQ3_S: 15,4 GB; IQ3_M: 15,5 GB; Q3_K_M: 16,9 GB; Q3_K_L: 18,2 GB.
  - IQ4_XS: 18,8 GB; Q4_0: 19,9 GB; Q4_K_S: 20,0 GB; Q4_K_M: 21,3 GB; Q4_1: 21,9 GB.
  - Q5_K_S: 24,1 GB; Q5_K_M: 24,8 GB; Q6_K: 28,6 GB.
- GPU recomendadas: para cuantizaciones Q4_K_M o superiores, se recomienda una GPU con 24 GB o más (RTX 3090, RTX 4090, A100 40GB, H100). Para cuantizaciones IQ2/IQ3, una RTX 4060 Ti de 16 GB o una RTX 4070 Ti Super de 16 GB pueden ser suficientes, aunque con margen ajustado.
- Cabe en GPU de consumo: sí, en las cuantizaciones IQ1_S a IQ3_M (7,6-15,5 GB) en GPUs de 8-16 GB; las variantes Q4_K_M y superiores requieren 24 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el tag "endpoints_compatible" sugiere compatibilidad con servidores de inferencia estándar. Para el modelo base en safetensors, vLLM o TGI serían opciones, aunque no se confirman en la información disponible.
- Latencia y throughput estimados: no disponibles. Al ser un MoE con ~3B activos, se espera un throughput superior al de un modelo denso de 35B, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada. Se indica "no disponible" para una comparación rigurosa. Como referencia cualitativa, modelos MoE de tamaño similar (por ejemplo, familias con ~30-40B totales y ~3B activos) suelen compartir la ventaja de un coste de inferencia reducido, pero no se pueden establecer comparaciones numéricas sin datos verificados.

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| CalibForge-35B-A3B-v2 (i1-GGUF) | 34,66B | ~3B | no disponible | Apache 2.0 | GGUF |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo está entrenado y etiquetado únicamente en inglés; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Las cuantizaciones de muy bajo bit (IQ1_S, IQ1_M, Q2_K_S) conllevan una pérdida de calidad significativa; el propio autor las describe como "for the desperate" o "very low quality". No se recomiendan para producción.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en la generación de comandos de terminal: un comando incorrecto puede tener consecuencias destructivas. Se recomienda validación humana y entornos aislados.
- La longitud de contexto no está documentada, lo que dificulta planificar tareas que requieran ventanas largas.
- Aunque la licencia es Apache 2.0, el uso comercial debe verificar las condiciones del modelo base y del dataset de entrenamiento, no detalladas en la información disponible.
- La capacidad de visión no está disponible en este repositorio (los ficheros mmproj están en el repositorio estático), por lo que el despliegue multimodal requiere pasos adicionales.
- El repositorio tiene 371,0 GB y solo 1 like y 4.909 descargas en el momento de la consulta, lo que sugiere una adopción limitada y poca validación comunitaria.
- No se han publicado benchmarks, por lo que el rendimiento real en tareas de agente de terminal no está cuantificado.

## Enlaces

- Repositorio Hugging Face de la cuantización: https://huggingface.co/mradermacher/CalibForge-35B-A3B-v2-i1-GGUF
- Modelo base: https://huggingface.co/AweAI-Team/CalibForge-35B-A3B-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/AweAI-Team/CalibForge
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/CalibForge-35B-A3B-v2-GGUF
- Página de resumen del autor: https://hf.tst.eu/model#CalibForge-35B-A3B-v2-i1-GGUF
- Preprint referenciado: arXiv:2608.06352 (no se dispone de URL directa en la información proporcionada)
- Guía de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
