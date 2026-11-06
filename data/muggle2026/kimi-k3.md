# Muggle2026/Kimi-K3

## Resumen

Kimi K3 es un modelo de pesos abiertos de tipo agente multimodal nativo desarrollado por Moonshot AI. Con 2,8 billones de parámetros totales (2.779.931.837.184 según los safetensors del repositorio) y 104B de parámetros activos, se presenta como el primer modelo abierto de clase 3T. Está construido sobre una arquitectura MoE con Kimi Delta Attention (KDA) y Attention Residuals (AttnRes), e incorpora visión nativa junto con una ventana de contexto de un millón de tokens.

El modelo está orientado a inteligencia frontera en tres ejes: codificación de largo horizonte (sesiones de ingeniería sostenidas, navegación de repositorios masivos, orquestación de herramientas de terminal), trabajo de conocimiento agéntico de extremo a extremo (investigación profunda con visualizaciones interactivas, dashboards, edición de vídeo) y razonamiento multimodal. Su pipeline declarado en Hugging Face es image-text-to-text, lo que confirma el procesamiento conjunto de texto, imagen y vídeo.

La relevancia actual del modelo radica en dos factores: por un lado, la publicación de pesos completos bajo la licencia Kimi K3, que permite investigación, despliegue e innovación posterior; por otro, la eficiencia de escalado declarada, con una mejora aproximada de 2,5× en eficiencia global frente a Kimi K2 gracias a un marco Stable LatentMoE que activa 16 de 896 expertos por token. El repositorio de Hugging Face ocupa 1561,0 GB y está publicado por el usuario Muggle2026, no por la organización oficial de Moonshot AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con Kimi Delta Attention (KDA) y Attention Residuals (AttnRes) |
| Parametros totales | 2,8T (2.779.931.837.184 según safetensors) |
| Parametros activos | 104B |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | 8-bit (tag compressed-tensors); no se detallan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | Kimi K3 License (license: other, license_name: kimi-k3) |
| Formato de pesos | safetensors (con custom_code y compressed-tensors) |

## Arquitectura y entrenamiento

Kimi K3 emplea una arquitectura transformer de tipo Mixture-of-Experts con 93 capas, de las cuales una es densa. La composición de capas de atención combina 69 capas KDA (Kimi Delta Attention) con 24 capas Gated MLA. La dimensión oculta de atención es 7168, con 96 cabezas de atención. El bloque MoE utiliza una dimensión latente de 3584 y una dimensión oculta de 3072 por experto, con 896 expertos en total y 16 seleccionados por token. Este diseño de alta dispersión, enmarcado en el marco Stable LatentMoE, es el responsable de la mejora declarada de aproximadamente 2,5× en eficiencia de escalado frente a Kimi K2.

El modelo incorpora Attention Residuals (AttnRes) como innovación estructural adicional y capacidades de visión nativa, lo que le permite procesar texto, imágenes y vídeo dentro del mismo modelo. No se han proporcionado en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset ni sobre si se aplicaron técnicas de RLHF o DPO. Tampoco se detallan mecanismos de decodificación especulativa ni otras optimizaciones de inferencia más allá de la propia arquitectura de atención.

## Capacidades

- Generación de texto y razonamiento de propósito general con ventana de contexto de un millón de tokens.
- Codificación de largo horizonte: sesiones de ingeniería sostenidas con supervisión humana mínima, navegación de repositorios masivos y orquestación de herramientas de terminal.
- Tareas de ingeniería especializada: optimización de kernels de GPU, desarrollo de compiladores, desarrollo de videojuegos con visión en el bucle, CAD y diseño de chips.
- Trabajo de conocimiento agéntico de extremo a extremo: investigación profunda con visualizaciones interactivas, widgets y dashboards, diseño de movimiento y edición de vídeo.
- Multimodalidad nativa: comprensión conjunta de texto, imágenes y vídeo en el mismo modelo.
- Razonamiento multi-paso y comportamiento agéntico sostenido.
- Capacidades multilingües: no se detallan los idiomas soportados en la información disponible.
- Soporte de tool calling / function calling: no se detalla explícitamente en la información disponible, aunque la orientación agéntica y la orquestación de herramientas de terminal sugieren soporte de invocación de herramientas.

## Casos de uso

- Codificación de largo horizonte en repositorios grandes: el modelo puede mantener sesiones de ingeniería prolongadas navegando repositorios masivos y orquestando herramientas de terminal, gracias a su contexto de un millón de tokens y a su orientación explícita a codificación de largo horizonte.
- Optimización de kernels de GPU y desarrollo de compiladores: escenario citado por el autor en el que el modelo trabaja con supervisión humana mínima sobre código de bajo nivel y toolchains de compilación.
- Investigación profunda automatizada: generación de informes de investigación con visualizaciones interactivas, widgets y dashboards, aprovechando la multimodalidad nativa y el contexto largo para agregar muchas fuentes.
- Edición de vídeo y diseño de movimiento: el modelo comprende vídeo de forma nativa y puede participar en flujos de postproducción y animación.
- Desarrollo de videojuegos con visión en el bucle: el modelo puede analizar capturas o vídeo del juego en ejecución y ajustar código o assets en consecuencia, combinando visión nativa y capacidades de codificación.
- Diseño asistido por ordenador (CAD) y diseño de chips: aplicaciones de ingeniería de precisión citadas por el autor, donde el contexto largo permite manejar especificaciones y planos extensos.
- Agentes autónomos de larga duración: gracias a los 104B de parámetros activos y al contexto de un millón de tokens, el modelo puede sostener tareas multi-paso con estado acumulado sin perder el hilo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 2,8T de parámetros totales, incluso en 8-bit el peso del modelo supera los 2,7 TB, por lo que el despliegue requiere infraestructura multi-nodo. El tamaño del repositorio es de 1561,0 GB, lo que sugiere que los pesos publicados ya están comprimidos.
- GPU recomendadas: no disponible en la información proporcionada. Por el volumen de parámetros, se requiere un clúster de GPUs de centro de datos (tipo A100/H100/H200) en configuración multi-nodo; no es desplegable en GPUs de consumo.
- GPU de consumo: no cabe en ninguna GPU de consumo individual ni en configuraciones multi-GPU domésticas razonables.
- Opciones de despliegue: la model card declara compatibilidad con transformers y el repositorio incluye custom_code y compressed-tensors. No se detallan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi K3 | 2,8T | 104B | 1.000.000 tokens | Kimi K3 License | Pesos abiertos en Hugging Face |
| Kimi K2 | no disponible en la información | no disponible en la información | no disponible en la información | no disponible | Referenciado por el autor como generación anterior |
| Otros modelos de clase 3T abiertos | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo permite comparar con Kimi K2, del que se indica que Kimi K3 mejora su eficiencia de escalado en aproximadamente 2,5×. No se dispone de datos de benchmarks ni de especificaciones completas de K2 ni de otros modelos comparables en la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información disponible.
- Riesgo de alucinación: no se documenta una evaluación específica; como modelo generativo de gran escala, es esperable, pero no hay datos concretos en la información proporcionada.
- Limitaciones de contexto o idioma: el contexto es de un millón de tokens, pero no se detallan los idiomas soportados ni posibles degradaciones en contextos extremos.
- Restricciones de licencia: la licencia Kimi K3 (license: other) no se detalla en la información disponible; es imprescindible revisar el archivo LICENSE del repositorio antes de cualquier uso comercial.
- Publicación no oficial: el repositorio de Hugging Face está publicado por el usuario Muggle2026, no por la organización oficial de Moonshot AI, lo que introduce un riesgo de procedencia que debe verificarse antes de su uso en producción.
- Requisitos de infraestructura: el tamaño del modelo (1561,0 GB de repositorio, 2,8T de parámetros) hace inviable el despliegue en hardware de consumo y exige clústeres multi-nodo.
- Madurez del ecosistema: con 0 descargas y 0 likes en el momento de la consulta, no hay evidencia comunitaria de validación del funcionamiento del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/Muggle2026/Kimi-K3
- Organización oficial en Hugging Face: https://huggingface.co/moonshotai
- Blog técnico: https://www.kimi.com/blog/kimi-k3
- Informe técnico completo: https://github.com/MoonshotAI/Kimi-K3/blob/main/k3_tech_report.pdf
- Licencia: https://huggingface.co/moonshotai/Kimi-K3/blob/main/LICENSE
- Página principal de Moonshot AI: https://www.moonshot.ai
- Chat: https://www.kimi.com
- Twitter/X: https://twitter.com/kimi_moonshot
- Discord: https://discord.gg/TYU2fdJykW
- ModelScope: https://modelscope.cn/organization/moonshotai
