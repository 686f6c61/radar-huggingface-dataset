# ahmed-amedo-1/Kimi-K3

## Resumen

Kimi K3 es un modelo de lenguaje de código abierto (open-weight) desarrollado por Moonshot AI, la empresa china creadora de Kimi. Se presenta como el primer modelo abierto de la clase de 3 billones de parámetros (2,8 billones en total), con una arquitectura Mixture-of-Experts (MoE) que activa solo 104 mil millones de parámetros por token. Su diseño incorpora dos innovaciones propias: Kimi Delta Attention (KDA) y Attention Residuals (AttnRes), junto con un marco Stable LatentMoE que escala la dispersión del MoE activando 16 de los 896 expertos disponibles. El modelo es nativamente multimodal (texto, imágenes y vídeo) y soporta una ventana de contexto de 1 millón de tokens, lo que lo posiciona para tareas de razonamiento de largo alcance, codificación avanzada y trabajo de conocimiento agéntico.

El modelo se distribuye bajo la licencia Kimi K3, con pesos completos disponibles en Hugging Face (repositorio de 1561 GB) y también a través de plataformas como NVIDIA NIM y la API de Kimi. Su lanzamiento, previsto para el 27 de julio de 2026, lo convierte en una de las opciones más potentes entre los modelos abiertos, compitiendo directamente con sistemas propietarios de frontera. Aunque la información pública sobre su entrenamiento es limitada, la arquitectura y las capacidades declaradas lo orientan a casos de uso como ingeniería de software de larga duración, análisis de repositorios masivos, investigación profunda y generación de contenido interactivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con Kimi Delta Attention (KDA) y Attention Residuals (AttnRes) |
| Parametros totales | 2.779.931.837.184 (2,8 billones) |
| Parametros activos | 104 mil millones |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | 8-bit (mencionado en tags); otros formatos no especificados |
| Idiomas soportados | no disponible |
| Licencia | Kimi K3 (licencia propia, no OSI) |
| Formato de pesos | safetensors (tamaño del repo: 1561 GB) |

## Arquitectura y entrenamiento

La arquitectura de Kimi K3 combina 93 capas, de las cuales 69 utilizan Kimi Delta Attention (KDA) y 24 emplean Gated Multi-Latent Attention (Gated MLA). La dimensión oculta de atención es de 7168 con 96 cabezas, mientras que la dimensión del MoE latente es de 3584 y cada experto tiene una dimensión oculta de 3072. El modelo activa 16 de los 896 expertos por token, lo que según Moonshot AI supone una mejora de eficiencia de escalado de aproximadamente 2,5× respecto a Kimi K2. La innovación principal, KDA, es un mecanismo de atención que reduce el coste computacional y de memoria en contextos largos, complementado con Attention Residuals para estabilizar el entrenamiento profundo.

No se han publicado detalles sobre el conjunto de datos de entrenamiento, el número de tokens procesados ni si se utilizaron técnicas de alineación como RLHF o DPO. La model card menciona que el modelo es "nativamente multimodal", lo que implica que fue entrenado desde cero con datos de texto, imágenes y vídeo, pero no se ofrecen cifras concretas. Tampoco hay información sobre el proceso de destilación o ajuste fino posterior.

## Capacidades

- Generación de texto y razonamiento complejo en tareas de larga duración (long-horizon reasoning).
- Codificación avanzada: soporta sesiones de ingeniería sostenidas, navegación por repositorios masivos y orquestación de herramientas de terminal.
- Comprensión multimodal nativa: procesa texto, imágenes y vídeo dentro del mismo modelo.
- Agente de conocimiento: capaz de producir investigaciones profundas con visualizaciones interactivas, widgets, paneles y edición de vídeo.
- Tool calling / function calling: integración con herramientas externas para flujos agénticos.
- Ventana de contexto de 1M tokens, adecuada para documentos extensos, repositorios de código y conversaciones de múltiples turnos.
- Capacidad de razonamiento visual en bucle (vision-in-the-loop), útil para desarrollo de juegos, CAD y diseño de chips.

## Casos de uso

- Ingeniería de software de larga duración: el modelo puede mantener sesiones de codificación prolongadas con supervisión mínima, navegar por repositorios grandes y ejecutar comandos de terminal, lo que lo hace adecuado para tareas como optimización de kernels GPU o desarrollo de compiladores.
- Análisis de código y refactorización: con su contexto de 1M tokens, puede procesar proyectos completos de código fuente, identificar patrones, proponer refactorizaciones y generar documentación.
- Investigación profunda automatizada: gracias a su capacidad de razonamiento y generación de visualizaciones, puede producir informes interactivos con gráficos, dashboards y widgets a partir de fuentes múltiples.
- Creación de contenido multimedia: al comprender imágenes y vídeo, puede generar guiones, editar vídeo o crear animaciones basadas en instrucciones textuales.
- Asistente de diseño técnico: su capacidad de razonamiento visual en bucle permite aplicaciones en CAD, diseño de chips y desarrollo de juegos, donde el modelo puede iterar sobre imágenes generadas.
- Atención al cliente avanzada: con contexto largo y comprensión multimodal, puede gestionar conversaciones complejas que incluyan capturas de pantalla, documentos y vídeos de soporte.
- Desarrollo de agentes autónomos: su soporte de tool calling y razonamiento multi-paso lo convierte en una base sólida para construir agentes que ejecutan tareas administrativas o de análisis de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La web oficial de Kimi afirma que el modelo ocupa el primer puesto en Frontend Code Arena, pero no se proporcionan métricas concretas (como MMLU, HumanEval o GSM8K) en la documentación accesible. Tampoco hay comparativas numéricas con otros modelos en la model card de Hugging Face. Se recomienda consultar el reporte técnico completo (enlace en la sección de Enlaces) para obtener datos de evaluación detallados cuando estén disponibles.

## Requisitos de hardware

- No se han publicado requisitos oficiales de hardware en la información disponible.
- El tamaño del repositorio (1561 GB en safetensors) indica que los pesos completos ocupan aproximadamente 1,5 TB, lo que requiere almacenamiento de alta velocidad y múltiples GPU de gran capacidad.
- Dado que el modelo activa 104 mil millones de parámetros por token, se estima que la inferencia en FP16 necesitaría al menos 208 GB solo para los pesos activos, más memoria para la caché de atención y las activaciones. En la práctica, se necesitarían múltiples GPU de clase H100 (80 GB) o A100 (80 GB), probablemente 8 o más, dependiendo de la cuantización y el tamaño de lote.
- Con cuantización de 8 bits, el espacio de pesos se reduciría a ~780 GB, pero aún así requeriría un clúster de GPU.
- Opciones de despliegue: por su tamaño, no es viable en hardware de consumo (GPU domésticas). Se recomienda usar infraestructura cloud con vLLM, TensorRT-LLM o servicios gestionados como NVIDIA NIM o la API de Kimi.
- No hay datos públicos sobre latencia o throughput.

## Comparativa con modelos similares

No se dispone de comparativas oficiales en la información proporcionada. A continuación se presenta una comparación estructural con otros modelos MoE de gran escala, basada en datos públicos conocidos (no extraídos de la documentación de Kimi K3):

| Modelo | Parametros totales | Parametros activos | Contexto | Multimodal | Licencia |
|---|---|---|---|---|---|
| Kimi K3 | 2,8 billones | 104 mil millones | 1M tokens | Sí (texto, imagen, vídeo) | Kimi K3 (propietaria) |
| Kimi K2 | 1 billón (aprox.) | 32 mil millones (aprox.) | 128K tokens (aprox.) | No | Kimi K2 (propietaria) |
| DeepSeek-V3 | 671 mil millones | 37 mil millones | 128K tokens | No | MIT |

Los datos de Kimi K2 y DeepSeek-V3 son aproximados y provienen del conocimiento general, no de la información oficial de Kimi K3. No se dispone de resultados de benchmarks comparativos en las fuentes consultadas.

## Limitaciones y advertencias

- La licencia Kimi K3 es propietaria ("other" con nombre "kimi-k3") y no es una licencia de código abierto estándar. Es necesario revisar el texto completo de la licencia para conocer las restricciones de uso comercial, redistribución y modificación.
- No se ha publicado información sobre sesgos, riesgos de alucinación o comportamientos no deseados. Al ser un modelo de 2,8 billones de parámetros, es probable que presente alucinaciones en contextos ambiguos, pero no hay datos oficiales.
- El tamaño del modelo (1561 GB de pesos) hace que su despliegue sea inviable para la mayoría de organizaciones sin infraestructura de GPU a gran escala.
- La información sobre el entrenamiento (datos, tokens, alineación) es inexistente en las fuentes consultadas, lo que dificulta evaluar su fiabilidad y posibles sesgos.
- Aunque soporta 1M tokens de contexto, no se especifica el rendimiento real en esa longitud máxima ni si hay degradación progresiva.
- Los idiomas soportados no están documentados; se asume que el modelo es principalmente multilingüe, pero no se confirma.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ahmed-amedo-1/Kimi-K3
- Página oficial de Kimi K3: https://www.kimi.com/blog/kimi-k3
- Reporte técnico completo: https://github.com/MoonshotAI/Kimi-K3/blob/main/k3_tech_report.pdf
- Documentación API de Kimi: https://platform.kimi.ai/docs/guide/kimi-k3-quickstart
- NVIDIA NIM (modelo desplegable): https://build.nvidia.com/moonshotai/kimi-k3
- Medeo (plataforma de acceso): https://www.medeo.app/models/kimi-k3
- Página de Kimi AI: https://www.kimi.com
