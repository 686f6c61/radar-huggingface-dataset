# Aleph-Alpha/Kolibri-1.1

## Resumen

Kolibri 1.1 es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por Aleph Alpha Research GmbH, centrado en razonamiento explícito y en los idiomas alemán e inglés. Es el sucesor de Kolibri 1 y mantiene el mismo enfoque de coste de servicio bajo: de sus 75.112 millones de parámetros totales solo se activan 3.440 millones por token, lo que reduce el coste computacional por token manteniendo la capacidad de un modelo mucho mayor.

La innovación principal frente a la versión anterior es la incorporación de atención dispersa (sparse attention) combinada con ventanas deslizantes en una proporción 4:1, lo que abarata el procesamiento de contextos largos. El modelo tiene una longitud de contexto nativa de 262.144 tokens y puede procesar hasta 1.048.576 tokens, aunque el propio autor recomienda no superar los 262.144 en tareas complejas.

Es relevante ahora porque combina un modo de razonamiento explícito, soporte de tool calling y licencia Apache 2.0, lo que lo hace atractivo para despliegues comerciales en producción con requisitos de soberanía de datos europea y para aplicaciones de asistente en alemán e inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con 2 capas densas seguidas de 48 capas MoE (384 expertos enrutados, 6 seleccionados por token, 1 experto compartido); atención con ventana deslizante y atención dispersa en proporción 4:1 |
| Parametros totales | 75.112.665.344 (~75B) |
| Parametros activos | 3.439.874.304 (~3,44B) por token |
| Longitud de contexto | 262.144 tokens nativa; hasta 1.048.576 tokens (recomendado ≤262.144) |
| Tipos de cuantizacion | Pesos FP8 disponibles; cuantizaciones GGUF publicadas en repo aparte |
| Idiomas soportados | Alemán (de) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors; GGUF en repositorio separado |

## Arquitectura y entrenamiento

El modelo es un transformer con 2 capas densas iniciales seguidas de 48 capas MoE. Cada capa MoE dispone de 384 expertos enrutados, de los que se seleccionan 6 por token, más un experto compartido. La atención combina ventana deslizante con atención dispersa en proporción 4:1: la mayoría de capas atienden solo al texto cercano y una minoría selecciona las partes relevantes del contexto, lo que abarata los contextos largos. El entrenamiento usó Muon como optimizador y Exact Quantile Balancing para el enrutamiento de expertos.

Kolibri 1.1 continúa el entrenamiento desde un checkpoint de mid-training de Kolibri 1, que acumulaba 20T tokens de pre-entrenamiento y 3,42T de mid-training. Sobre esa base se añadieron 805B tokens de mid-training con atención dispersa y 201B tokens de contexto largo. El post-entrenamiento combinó SFT con datos bilingües filtrados (open source y sintéticos) y RL sobre un conjunto amplio de entornos que cubren razonamiento, uso agéntico y seguimiento de instrucciones. El coste total de las fases propias de Kolibri 1.1 fue de 5,52×10²² FLOPs, sin contar los 5,65×10²³ FLOPs del entrenamiento de la base heredada.

## Capacidades

- Generación de texto y conversación multi-turno en alemán e inglés.
- Modo de razonamiento explícito (reasoning mode) activable.
- Razonamiento multi-paso y descomposición de problemas complejos.
- Generación y comprensión de código.
- Tool calling / function calling para integración con APIs y herramientas externas.
- Comportamiento agéntico: planificación y ejecución de flujos con múltiples pasos y llamadas a herramientas.
- Procesamiento de documentos largos y recuperación aumentada (RAG) gracias a su contexto de 262.144 tokens nativos.
- Extracción estructurada de información a partir de texto.
- Conocimiento implícito con fecha de corte el 18 de junio de 2026 (EN y DE); puede acceder a información más reciente mediante herramientas.

## Casos de uso

- Asistente corporativo en alemán e inglés: el modelo puede mantener conversaciones multi-turno con contexto largo (262.144 tokens) y responder con razonamiento explícito, adecuado para atención interna o soporte a empleados en empresas con requisitos de soberanía de datos.
- Generación de código en producción: soporta tool calling y puede integrarse en pipelines de CI/CD para revisión de código, generación de tests o explicación de errores, con la ventaja de su bajo coste por token al activar solo 3,44B parámetros.
- RAG sobre documentación extensa: su contexto nativo de 262.144 tokens permite ingerir manuales, contratos o expedientes completos sin trocear en exceso, reduciendo pérdida de contexto en la recuperación.
- Agentes autónomos multi-paso: el modo de razonamiento y el soporte de tool calling permiten construir agentes que planifican, llaman a APIs y verifican resultados en flujos de automatización de back-office.
- Extracción estructurada de datos: a partir de documentos legales, financieros o técnicos en alemán e inglés, el modelo puede devolver JSON u otras estructuras con campos definidos, útil en pipelines de digitalización documental.
- Procesamiento de documentos largos: análisis de informes anuales, expedientes administrativos o contratos de cientos de páginas gracias a la ventana de hasta 1.048.576 tokens (con la cautela de calidad más allá de 262.144).
- Asistente de investigación y análisis: razonamiento multi-paso sobre literatura científica o técnica en alemán e inglés, con capacidad de citar y sintetizar fuentes largas.

## Benchmarks y rendimiento

La model card incluye una comparación de puntuación agregada frente a coste de servicio (GPU-horas por 1.000 tareas de evaluación), medida con vLLM 0.33 en un nodo de 8×B200 con pesos de 8 bits:

| Modelo | Puntuación agregada | GPU-horas / 1.000 tareas |
|---|---|---|
| Kolibri 1.1 | 73,2 % | 0,21 |
| Kolibri 1.0 | 66,6 % | 0,72 |
| Qwen3.8 Flash Next | en la frontera de Pareto (valor no especificado) | no disponible |
| GLM-5.3 Flash | no disponible | 2,49 |
| Qwen3.8 27B | no disponible | 1,97 |

No se han publicado en la información disponible resultados desglosados por benchmark individual (MMLU, HumanEval, GSM8K u otros) ni comparativas numéricas completas con los modelos citados.

## Requisitos de hardware

- Huella de memoria del modelo: ~77,6 GB.
- Mínimo recomendado por el autor: 2× H100 SXM5, 2× H200, 1× B200 o 1× B300.
- Configuración recomendada: 4× H100 SXM5, 2× H200, 2× B200 o 1× B300.
- No cabe en GPU de consumo convencionales (RTX 4090, 24 GB) con pesos completos; sería necesario recurrir a cuantizaciones GGUF agresivas y offloading, con degradación de rendimiento.
- Opciones de despliegue: vLLM (librería declarada en el repo, con soporte de pesos FP8), llama.cpp u Ollama mediante las cuantizaciones GGUF publicadas en el repositorio separado.
- Throughput y latencia: el autor reporta mediciones con vLLM 0.33 en 8×B200 probando varios layouts (TP1, TP2, TP4, TP8, DP4+EP4, DP8+EP8, DP4×TP2+EP8, DP2×TP4+EP8, TP8+EP8) y conservando el más rápido por modelo, pero no se detallan cifras absolutas de tokens por segundo en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Kolibri 1.1 | 75B / 3,44B | 262.144 nativo (hasta 1.048.576) | Apache 2.0 | Hugging Face, pesos safetensors y GGUF |
| Kolibri 1.0 | no disponible en la información | no disponible | no disponible | Hugging Face (predecesor) |
| Qwen3.8 Flash Next | no disponible | no disponible | no disponible | citado en la comparativa de coste del autor |
| GLM-5.3 Flash | no disponible | no disponible | no disponible | citado en la comparativa de coste del autor |
| Qwen3.8 27B | no disponible | no disponible | no disponible | citado en la comparativa de coste del autor |

La información disponible solo permite comparar la puntuación agregada y el coste de servicio: Kolibri 1.1 obtiene 73,2 % a 0,21 GPU-horas por 1.000 tareas, frente a 66,6 % a 0,72 GPU-horas de Kolibri 1.0 (3,4 veces más coste). Qwen3.8 Flash Next se sitúa también en la frontera de Pareto según el autor, mientras que GLM-5.3 Flash (2,49) y Qwen3.8 27B (1,97) quedan fuera del eje de coste representado. No hay datos de parámetros, contexto ni licencia de esos modelos en la información proporcionada.

## Limitaciones y advertencias

- Idiomas limitados a alemán e inglés; el rendimiento en otros idiomas no está garantizado ni documentado.
- La calidad en tareas complejas puede degradarse más allá de los 262.144 tokens nativos, aunque el modelo acepte hasta 1.048.576.
- Riesgo de alucinación inherente a los modelos de lenguaje; el conocimiento implícito está cortado a 18 de junio de 2026 y la información posterior requiere uso de herramientas.
- Sesgos potenciales derivados de los datos de entrenamiento (open source y sintéticos), no cuantificados en la información disponible.
- El tamaño completo del modelo (~77,6 GB) obliga a hardware de gama alta (H100, H200, B200, B300) o a cuantizaciones GGUF con posible pérdida de calidad.
- Aunque la licencia es Apache 2.0, Aleph Alpha publica una guía de uso responsable (RESPONSIBLE_USE.md) que conviene revisar antes de usos sensibles.
- Aleph Alpha es firmante del Código de Prácticas de GPAI de la UE, lo que puede implicar obligaciones de documentación y transparencia para despliegues en la Unión Europea.
- No se han publicado en la información disponible resultados desglosados por benchmark ni evaluaciones independientes de sesgo o robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Aleph-Alpha/Kolibri-1.1
- Cuantizaciones GGUF: https://huggingface.co/Aleph-Alpha/Kolibri-1.1-GGUF
- Blog post de Kolibri 1.1: https://aleph-alpha.com/en/blog/kolibri-1-1/
- Tech report de Kolibri 1: https://aleph-alpha.com/downloads/tech-report.pdf
- Guía de uso responsable: https://huggingface.co/Aleph-Alpha/Kolibri-1.1/blob/main/RESPONSIBLE_USE.md
- Código de Prácticas GPAI de la UE: https://digital-strategy.ec.europa.eu/en/policies/contents-code-gpai
- Paper arXiv 2512.11614: https://arxiv.org/abs/2512.11614
- Paper arXiv 2601.17858: https://arxiv.org/abs/2601.17858
