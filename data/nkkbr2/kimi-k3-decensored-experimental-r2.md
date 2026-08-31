# nkkbr2/Kimi-K3-decensored-experimental-r2

## Resumen

Kimi K3 es un modelo de lenguaje de código abierto desarrollado por Moonshot AI, presentado como el primer modelo abierto de clase 3T (2,8 billones de parámetros). Esta entrada concreta, `nkkbr2/Kimi-K3-decensored-experimental-r2`, es una versión modificada y experimental subida por un usuario independiente, que presume de eliminar la censura del modelo original. No es una publicación oficial de Moonshot AI, por lo que las especificaciones técnicas que se detallan a continuación corresponden al modelo base Kimi K3, tal y como se describe en su documentación oficial.

El modelo base emplea una arquitectura MoE (Mixture-of-Experts) híbrida con Kimi Delta Attention (KDA) y Attention Residuals (AttnRes), activando 16 de 896 expertos por token. Dispone de capacidades multimodales nativas (texto, imagen y vídeo) y una ventana de contexto de 1 millón de tokens. Su relevancia radica en ser el primer modelo abierto de esta escala, orientado a tareas de codificación de largo recorrido, trabajo de conocimiento agéntico y razonamiento profundo. La versión "decensored" aquí alojada no ha sido validada por el desarrollador original y carece de métricas de rendimiento propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) híbrida con KDA y AttnRes |
| Parametros totales | 2.779.931.837.184 (2,8T) |
| Parametros activos | 104B |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | no disponible (el repositorio incluye pesos en safetensors; el tag indica 8-bit, sin confirmar) |
| Idiomas soportados | no disponible |
| Licencia | Kimi K3 License (etiquetada como "other" en el repositorio) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Kimi K3 utiliza una arquitectura MoE con 93 capas, de las cuales 1 es densa y el resto se distribuyen en 69 capas con Kimi Delta Attention (KDA) y 24 capas con Gated MLA (Multi-head Latent Attention). La dimensión oculta de atención es de 7168 con 96 cabezas, y la dimensión latente del MoE es de 3584. Cada experto tiene una dimensión oculta de 3072, sumando 896 expertos en total, de los cuales se activan 16 por token. El framework Stable LatentMoE permite escalar la esparsidad del MoE, logrando una mejora de aproximadamente 2,5 veces en eficiencia de escalado frente a Kimi K2.

No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas de alineación como RLHF o DPO en la documentación proporcionada. El modelo es nativamente multimodal, integrando visión y texto en una misma arquitectura, lo que le permite procesar imágenes y vídeo sin módulos separados. La versión "decensored" aquí alojada no documenta qué modificaciones se han aplicado sobre los pesos originales, ni si se ha realizado un ajuste fino adicional.

## Capacidades

- Generación de texto y razonamiento complejo, incluyendo matemáticas y lógica.
- Codificación de largo recorrido: mantiene sesiones de ingeniería prolongadas con supervisión mínima, navegando repositorios extensos y orquestando herramientas de terminal.
- Comprensión multimodal nativa: procesa texto, imágenes y vídeo dentro del mismo modelo, sin necesidad de codificadores externos.
- Soporte de tool calling y function calling, permitiendo integración con APIs y ejecución de acciones.
- Capacidades agénticas: puede operar de forma autónoma en tareas multi-paso, como desarrollo de juegos, diseño CAD o incluso diseño de chips.
- Contexto largo de 1 millón de tokens, adecuado para documentos extensos, repositorios de código completos o análisis de vídeo prolongado.
- Generación de contenido visual interactivo: dashboards, widgets, presentaciones y edición de vídeo, según la documentación oficial.

## Casos de uso

- Desarrollo de software autónomo: el modelo puede mantener sesiones de codificación de horas o días, gestionando repositorios grandes, ejecutando pruebas y depurando errores con mínima intervención humana, gracias a su contexto de 1M tokens y su capacidad de tool calling.
- Optimización de kernels GPU y desarrollo de compiladores: su razonamiento profundo y su capacidad de iterar sobre código de bajo nivel lo hacen adecuado para tareas de optimización de rendimiento.
- Investigación de mercado y análisis de documentos: con su ventana de contexto amplia, puede procesar informes extensos, artículos académicos y datos financieros para generar resúmenes y conclusiones accionables.
- Creación de presentaciones y material visual: genera diapositivas de nivel consultoría, gráficos interactivos y dashboards a partir de datos, combinando generación de texto con comprensión de imágenes.
- Desarrollo de juegos y entornos 3D: su capacidad multimodal y de razonamiento espacial permite construir prototipos jugables, incluyendo juegos multijugador, con supervisión limitada.
- Asistencia en diseño de hardware: el modelo puede ayudar en tareas de diseño de chips y CAD, interpretando esquemas y generando código de verificación, gracias a su comprensión de imágenes técnicas y su razonamiento lógico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentación oficial de Kimi K3 menciona que el modelo ocupa el primer puesto en Frontend Code Arena, pero no se incluyen métricas numéricas concretas (MMLU, HumanEval, GSM8K, etc.) en los materiales proporcionados. Tampoco se dispone de evaluaciones específicas para la versión "decensored" experimental.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,8T parámetros totales, incluso en cuantización de 8 bits se necesitan aproximadamente 2,8 TB de VRAM para alojar todos los pesos. En FP16, la cifra asciende a unos 5,6 TB. Esto supera con creces la capacidad de cualquier GPU individual.
- GPU recomendadas: se requiere un clúster de GPUs de alta gama, como NVIDIA H100 o A100, con interconexión de alta velocidad (NVLink o InfiniBand). No es viable en GPUs de consumo como RTX 4090.
- Opciones de despliegue: frameworks como vLLM, TensorRT-LLM o TGI pueden gestionar modelos MoE de esta escala, siempre que se disponga de suficiente memoria distribuida. También es posible usar servicios en la nube como NVIDIA NIM, que ya ofrece Kimi K3.
- Latencia y throughput: no disponibles. Dado el tamaño del modelo y el número de expertos activos (104B), la latencia dependerá críticamente del ancho de banda de memoria y de la eficiencia del sistema de atención.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi K3 (base) | 2,8T | 104B | 1M | Kimi K3 License | Abierta |
| Kimi K2 | 1T (aprox.) | 32B (aprox.) | 128K | Kimi K2 License | Abierta |
| DeepSeek V3 | 671B | 37B | 128K | MIT | Abierta |
| Qwen3-Max | no disponible | no disponible | no disponible | Propietaria | API |

La comparativa se basa en datos públicos de los modelos mencionados. Kimi K3 supera en escala y contexto a sus predecesores y a alternativas abiertas como DeepSeek V3, aunque su licencia (Kimi K3 License) puede imponer restricciones de uso comercial que no están presentes en licencias más permisivas como MIT. No se dispone de datos de rendimiento comparativos fiables en la información proporcionada.

## Limitaciones y advertencias

- Esta versión "decensored" es experimental y no oficial: ha sido subida por un usuario independiente y no ha sido validada por Moonshot AI. Los cambios aplicados sobre los pesos originales no están documentados, lo que puede afectar a la calidad, seguridad y alineación del modelo.
- Riesgo de alucinación: como todo modelo de lenguaje de gran escala, puede generar información falsa o inventada, especialmente en dominios especializados.
- Sesgos: no se dispone de información sobre los sesgos del modelo base ni de la versión modificada. El proceso de "decensored" podría eliminar salvaguardas de seguridad, aumentando el riesgo de respuestas dañinas o inapropiadas.
- Licencia: la licencia Kimi K3 License es de tipo "other" y puede contener restricciones específicas para uso comercial o de redistribución. Es imprescindible revisar el texto completo de la licencia antes de cualquier despliegue en producción.
- Requisitos de infraestructura: el tamaño del modelo hace inviable su ejecución en hardware de consumo. Se necesita un clúster de GPUs de alta gama, lo que limita su uso a organizaciones con recursos significativos.
- Idiomas: no se especifican los idiomas soportados. Aunque el modelo base es presumiblemente multilingüe, la versión modificada no ofrece garantías al respecto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/nkkbr2/Kimi-K3-decensored-experimental-r2
- Modelo original de Moonshot AI: https://huggingface.co/moonshotai/Kimi-K3
- Página de Kimi K3 en NVIDIA NIM: https://build.nvidia.com/moonshotai/kimi-k3
- Kimi AI (producto): https://www.kimi.com/en
- Documentación de la API de Kimi K3: https://platform.kimi.ai/docs/guide/kimi-k3-quickstart
- Blog técnico de Kimi K3: https://www.kimi.com/blog/kimi-k3
- Informe técnico completo (PDF): https://github.com/MoonshotAI/Kimi-K3/blob/main/k3_tech_report.pdf
