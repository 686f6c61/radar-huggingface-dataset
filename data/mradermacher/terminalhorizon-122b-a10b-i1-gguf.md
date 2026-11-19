# mradermacher/TerminalHorizon-122B-A10B-i1-GGUF

## Resumen

TerminalHorizon-122B-A10B-i1-GGUF es la versión cuantizada en formato GGUF del modelo TerminalHorizon-122B-A10B, desarrollado originalmente por shunzou05 y cuantizado por mradermacher. Se trata de un modelo de lenguaje de gran escala (122.111.526.912 parámetros totales según los safetensors del modelo base) especializado en tareas de agente de terminal, línea de comandos (CLI) y razonamiento agéntico de horizonte largo. El sufijo "A10B" en el nombre sugiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 10.000 millones de parámetros activos, aunque este dato no se confirma explícitamente en la información disponible.

El modelo ha sido afinado mediante supervisión (supervised fine-tuning) sobre dos conjuntos de datos propios: TerminalHorizon-3K y TerminalHorizon-Environment, orientados a la resolución de tareas en entornos de terminal y a la interacción con herramientas de línea de comandos. Su relevancia actual radica en la creciente demanda de modelos capaces de operar de forma autónoma en entornos de desarrollo, ejecutar comandos, interpretar su salida y encadenar múltiples pasos de razonamiento para completar tareas complejas de ingeniería de software.

Esta ficha se centra en la versión cuantizada i1-GGUF, que ofrece un amplio abanico de niveles de cuantización (desde IQ1_S hasta Q6_K) para facilitar el despliegue en hardware con recursos limitados. El repositorio tiene un tamaño total de 1293 GB, lo que refleja la inclusión de todas las variantes de cuantización. La licencia es Apache 2.0 y el modelo está etiquetado únicamente para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (probablemente MoE, no confirmado explícitamente) |
| Parametros totales | 122.111.526.912 |
| Parametros activos | aproximadamente 10.000 millones (inferido del sufijo A10B, no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (cuantizaciones i1 con imatrix) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado), safetensors (modelo base) |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la información proporcionada. El nombre del modelo (122B-A10B) sigue la convención habitual para modelos de mezcla de expertos (MoE), donde 122B indica los parámetros totales y A10B los parámetros activos por token. Los parámetros totales confirmados por los safetensors del modelo base son 122.111.526.912. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

El modelo base fue afinado mediante supervisión (supervised fine-tuning) sobre los datasets TerminalHorizon-3K y TerminalHorizon-Environment, ambos publicados por el autor original. Estos conjuntos de datos están orientados a tareas de terminal, CLI y razonamiento agéntico de horizonte largo. Las cuantizaciones i1-GGUF han sido generadas por mradermacher utilizando archivos imatrix (importance matrix), lo que generalmente mejora la calidad de las cuantizaciones de baja precisión en comparación con las cuantizaciones estáticas. La model card menciona además que se trata de un modelo de visión ("This is a vision model"), con posibles archivos mmproj en el repositorio estático, aunque las etiquetas del modelo no incluyen explícitamente capacidades de visión.

## Capacidades

- Generación de texto y razonamiento general en inglés.
- Especialización en tareas de agente de terminal y línea de comandos (CLI).
- Razonamiento agéntico de horizonte largo (long-horizon): capacidad de encadenar múltiples pasos para completar tareas complejas.
- Soporte para tareas de codificación y agentes de código (etiqueta Coding-agent).
- Capacidad conversacional (etiqueta conversational).
- Posible soporte de visión según la model card del cuantizador, aunque no confirmado en las etiquetas.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.

## Casos de uso

- Automatización de tareas en terminal: el modelo puede interpretar instrucciones en lenguaje natural y traducirlas a comandos de shell, ejecutarlos y analizar la salida para continuar con el siguiente paso, gracias a su entrenamiento específico en entornos de terminal.
- Agentes de codificación autónomos: puede integrarse en pipelines de desarrollo para resolver tareas de programación de múltiples pasos, como refactorizaciones, corrección de errores o generación de scripts, aprovechando su especialización en razonamiento de horizonte largo.
- Asistente de administración de sistemas: el modelo puede guiar al usuario en la configuración de servidores, diagnóstico de problemas de red o gestión de servicios, interpretando la salida de comandos y proponiendo acciones correctivas.
- Automatización de CI/CD: puede utilizarse para analizar fallos en pipelines, interpretar logs de error y sugerir o aplicar correcciones, integrándose en flujos de integración continua.
- Generación de scripts de automatización: dado un objetivo en lenguaje natural, el modelo puede generar scripts de shell o Python que automaticen tareas repetitivas, con capacidad de iterar sobre errores.
- Educación y formación en línea de comandos: puede actuar como tutor interactivo que explica comandos, propone ejercicios y evalúa las soluciones del usuario en un entorno controlado.
- Depuración interactiva: el modelo puede analizar trazas de error y logs de terminal para identificar la causa raíz de un fallo y proponer pasos de resolución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantización. Las variantes más pequeñas (i1-IQ1_S, 25,4 GB) pueden caber en GPUs con 24-32 GB de VRAM, aunque con calidad muy degradada. Las cuantizaciones recomendadas (i1-Q4_K_M, 74,3 GB) requieren al menos 80 GB de VRAM o el uso de CPU con RAM suficiente.
- GPU recomendadas: para las cuantizaciones de mayor calidad (Q5_K_M, Q6_K) se recomiendan GPUs profesionales como A100 (80 GB) o H100 (80 GB). Las cuantizaciones intermedias (IQ3, Q4) pueden ejecutarse en configuraciones multi-GPU o en GPUs con 48 GB como la RTX A6000.
- ¿Cabe en GPU de consumo? Las cuantizaciones más bajas (IQ1, IQ2, Q3) podrían caber en GPUs de consumo de gama alta con 24 GB (RTX 4090, RTX 3090), aunque con pérdida notable de calidad. Las cuantizaciones Q4 en adelante no caben en una única GPU de consumo.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, vLLM o TGI.
- Latencia y throughput estimados: no disponibles. Al tratarse de un modelo MoE con aproximadamente 10.000 millones de parámetros activos (si se confirma), el throughput podría ser relativamente alto en comparación con un modelo denso de 122B, pero no se proporcionan cifras.

## Comparativa con modelos similares

No se dispone de información suficiente sobre modelos comparables en la misma categoría (agentes de terminal de gran escala) en la documentación proporcionada. Se indica "no disponible".

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| TerminalHorizon-122B-A10B-i1-GGUF | 122B totales (aprox. 10B activos) | no disponible | Apache 2.0 | GGUF en Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo está entrenado y etiquetado únicamente para inglés, por lo que su rendimiento en castellano u otros idiomas no está garantizado.
- No se dispone de información sobre sesgos conocidos, pero al ser un modelo entrenado sobre datos de terminal y código, puede heredar sesgos presentes en esos dominios.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar comandos o explicaciones incorrectas, especialmente en cuantizaciones de baja precisión (IQ1, IQ2), donde la calidad se degrada significativamente.
- Las cuantizaciones de muy baja precisión (IQ1_S, IQ1_M, IQ2_XXS) pueden producir resultados poco fiables; se recomienda usar al menos IQ3 o Q4 para uso en producción.
- La longitud de contexto no está documentada, lo que dificulta planificar su uso en tareas que requieran ventanas extensas.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el modelo base podría tener restricciones adicionales no reflejadas en esta ficha; se recomienda consultar la licencia del modelo original.
- La model card menciona que es un modelo de visión, pero las etiquetas no lo confirman y los archivos mmproj podrían no estar incluidos en esta versión cuantizada; verificar antes de usar en tareas multimodales.
- El tamaño del repositorio (1293 GB) implica que la descarga completa es muy costosa; se recomienda descargar solo la cuantización necesaria.

## Enlaces

- [Hugging Face: mradermacher/TerminalHorizon-122B-A10B-i1-GGUF](https://huggingface.co/mradermacher/TerminalHorizon-122B-A10B-i1-GGUF)
- [Modelo base: shunzou05/TerminalHorizon-122B-A10B](https://huggingface.co/shunzou05/TerminalHorizon-122B-A10B)
- [Cuantizaciones estáticas: mradermacher/TerminalHorizon-122B-A10B-GGUF](https://huggingface.co/mradermacher/TerminalHorizon-122B-A10B-GGUF)
- [Página de overview del cuantizador](https://hf.tst.eu/model#TerminalHorizon-122B-A10B-i1-GGUF)
- [Dataset: shunzou05/TerminalHorizon-3K](https://huggingface.co/datasets/shunzou05/TerminalHorizon-3K)
- [Dataset: shunzou05/TerminalHorizon-Environment](https://huggingface.co/datasets/shunzou05/TerminalHorizon-Environment)
