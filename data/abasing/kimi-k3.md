# abasing/Kimi-K3

## Resumen

Kimi K3 es un modelo de lenguaje multimodal nativo de tipo agente, publicado con pesos abiertos por Moonshot AI. Con 2,8 billones de parámetros totales (2.779.931.837.184 según los safetensors del repositorio), se presenta como el primer modelo abierto de clase 3T y está disenado para inteligencia de frontera en programación de largo horizonte, trabajo de conocimiento y razonamiento. La arquitectura es un transformer de mezcla de expertos (MoE) construido sobre Kimi Delta Attention (KDA) y Attention Residuals (AttnRes), con una ventana de contexto de un millón de tokens y capacidades nativas de visión.

El modelo activa 104B parámetros por token, seleccionando 16 de 896 expertos, lo que supone una mejora de eficiencia de escalado de aproximadamente 2,5 veces respecto a Kimi K2. Incorpora un marco denominado Stable LatentMoE y alterna 69 capas de atención KDA con 24 capas de Gated MLA sobre un total de 93 capas.

La relevancia actual de Kimi K3 radica en que libera pesos de frontera bajo la licencia Kimi K3, permitiendo investigación, despliegue e innovación sobre un modelo que compite en la categoría de agentes multimodales de contexto largo. El repositorio de HuggingFace corresponde a una publicación de terceros (usuario `abasing`) que replica los pesos del modelo original de Moonshot AI.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) sobre Kimi Delta Attention (KDA) y Attention Residuals (AttnRes) |
| Parámetros totales | 2,8T (2.779.931.837.184) |
| Parámetros activos | 104B (16 de 896 expertos) |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantización | 8-bit (según tags del repositorio); otros tipos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Kimi K3 License (`license: other`, `license_name: kimi-k3`) |
| Formato de pesos | safetensors (con `compressed-tensors`) |

## Arquitectura y entrenamiento

Kimi K3 es un transformer MoE de 93 capas (1 capa densa) con una dimensión oculta de atención de 7168 y 96 cabezas de atención. La composición de capas de atención combina 69 capas de Kimi Delta Attention (KDA) con 24 capas de Gated MLA. La dimensión latente del MoE es 3584, con una dimensión oculta por experto de 3072, sobre un total de 896 expertos de los que se seleccionan 16 por token. El marco Stable LatentMoE permite escalar la dispersión del MoE manteniendo estabilidad en el entrenamiento.

La model card menciona que la arquitectura logra una mejora de aproximadamente 2,5 veces en eficiencia de escalado global frente a Kimi K2. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se especifican innovaciones adicionales como decodificación especulativa. La multimodalidad es nativa: el modelo procesa texto, imágenes y vídeo dentro del mismo modelo.

## Capacidades

- Generación de texto, razonamiento y trabajo de conocimiento de extremo a extremo.
- Programación de largo horizonte: sesiones de ingeniería prolongadas con supervisión humana mínima, navegación de repositorios masivos y orquestación de herramientas de terminal.
- Capacidades multimodales nativas: comprensión de imágenes y vídeo además de texto.
- Contexto largo de hasta un millón de tokens.
- Trabajo agéntico: investigación profunda con visualizaciones interactivas, widgets, paneles y edición de vídeo y diseño en movimiento.
- Soporte de tool calling y function calling: la model card menciona orquestación de herramientas de terminal, aunque no se detalla el formato exacto.
- Aplicaciones especializadas citadas: optimización de kernels de GPU, desarrollo de compiladores, desarrollo de videojuegos con visión en el bucle, CAD y diseño de chips.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Programación agéntica en repositorios grandes: el modelo puede sostener sesiones de ingeniería prolongadas y navegar repositorios masivos gracias a su contexto de un millón de tokens, lo que permite cargar gran parte del código y del historial de cambios en una sola ventana.
- Orquestación de terminal y pipelines de CI/CD: con soporte de tool calling, puede ejecutar comandos, interpretar salidas y encadenar pasos multi-etapa para tareas de compilación, pruebas y despliegue.
- Investigación profunda automatizada: generación de informes con visualizaciones interactivas, widgets y paneles, adecuada para equipos que necesitan síntesis de información extensa con contexto largo.
- Análisis de vídeo e imágenes en flujo: al ser multimodal nativo, puede procesar vídeo e imágenes junto con texto para tareas de inspección visual, documentación técnica o control de calidad.
- Optimización de kernels y desarrollo de compiladores: la model card cita explícitamente estos escenarios como objetivos de diseño, aprovechando el razonamiento de largo horizonte y la capacidad de iterar sobre código de bajo nivel.
- Diseño asistido por ordenador (CAD) y diseño de chips: escenarios citados por el autor donde el modelo combina visión en el bucle con razonamiento técnico prolongado.
- Edición de vídeo y diseño en movimiento: generación y manipulación de contenido audiovisual dentro de flujos de trabajo de conocimiento de extremo a extremo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 2,8T parámetros totales, incluso en 8-bit los pesos superan los 2,7 TB, por lo que la inferencia requiere infraestructura multi-GPU de gran escala.
- GPU recomendadas: no disponibles en la información proporcionada; por el tamaño del modelo, se requiere un clúster de GPUs de centro de datos (tipo A100/H100) y no cabe en GPUs de consumo.
- GPU de consumo: no cabe en ninguna GPU de consumo individual.
- Opciones de despliegue: la librería indicada es `transformers`, con pesos en `safetensors` y `compressed-tensors` en 8-bit. No se confirman otras opciones como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi K3 | 2,8T | 104B | 1.000.000 | Kimi K3 License | Pesos abiertos en HuggingFace |
| Kimi K2 | no disponible | no disponible | no disponible | no disponible | Referenciado en la model card como predecesor |
| Alternativas de clase 3T | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo permite comparar con Kimi K2, del que se indica que Kimi K3 mejora su eficiencia de escalado en aproximadamente 2,5 veces, pero sin datos concretos de parámetros, contexto o rendimiento. No se dispone de datos de otros modelos comparables.

## Limitaciones y advertencias

- El repositorio de HuggingFace pertenece al usuario `abasing`, no a la organización oficial `moonshotai`; conviene verificar la procedencia de los pesos antes de usarlos en producción.
- La licencia es la Kimi K3 License (`license: other`), por lo que las condiciones exactas de uso comercial deben consultarse en el archivo LICENSE del repositorio original.
- No se dispone de información sobre sesgos conocidos del modelo.
- Riesgo de alucinación: no cuantificado en la información disponible; como modelo generativo de gran escala, es esperable, pero no hay datos publicados.
- Idiomas soportados: no disponibles, lo que impide confirmar la cobertura multilingüe.
- El tamaño de 2,8T parámetros implica requisitos de infraestructura muy elevados, lo que limita su despliegue a entornos de centro de datos.
- No se han publicado resultados de benchmarks en la información disponible, por lo que no es posible validar empíricamente las capacidades declaradas.
- El repositorio ocupa 1561 GB, lo que exige almacenamiento y ancho de banda considerables para su descarga.

## Enlaces

- HuggingFace (repositorio de terceros): https://huggingface.co/abasing/Kimi-K3
- HuggingFace (organización oficial): https://huggingface.co/moonshotai
- Blog técnico: https://www.kimi.com/blog/kimi-k3
- Informe técnico completo: https://github.com/MoonshotAI/Kimi-K3/blob/main/k3_tech_report.pdf
- Licencia: https://huggingface.co/moonshotai/Kimi-K3/blob/main/LICENSE
- Chat: https://www.kimi.com
- Página de Moonshot AI: https://www.moonshot.ai
- Twitter: https://twitter.com/kimi_moonshot
- Discord: https://discord.gg/TYU2fdJykW
- ModelScope: https://modelscope.cn/organization/moonshotai
