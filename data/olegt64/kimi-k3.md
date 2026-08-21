# olegt64/Kimi-K3

## Resumen

Kimi K3 es un modelo de lenguaje de código abierto desarrollado por Moonshot AI, la empresa china detrás del asistente Kimi. Se trata del primer modelo abierto de clase 3T (2,8 billones de parámetros) y está diseñado para tareas de razonamiento avanzado, codificación de larga duración y trabajo de conocimiento agéntico. El modelo integra capacidades multimodales nativas (texto, imagen y vídeo) y una ventana de contexto de 1 millón de tokens, lo que lo sitúa en la frontera de la inteligencia artificial abierta.

Arquitectónicamente, Kimi K3 introduce dos innovaciones principales: Kimi Delta Attention (KDA) y Attention Residuals (AttnRes), junto con un marco Stable LatentMoE que activa 16 de los 896 expertos disponibles. El modelo combina 69 capas KDA con 24 capas de Gated MLA (Multi-head Latent Attention), logrando una eficiencia de escalado aproximadamente 2,5 veces superior a la de su predecesor Kimi K2. Se distribuye bajo la licencia Kimi K3 License, diseñada para permitir investigación, despliegue y uso comercial con ciertas restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con Kimi Delta Attention (KDA) y Attention Residuals (AttnRes) |
| Parametros totales | 2.779.931.837.184 (2,8T) |
| Parametros activos | 104B |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | 8-bit (compressed-tensors) |
| Idiomas soportados | No disponible |
| Licencia | Kimi K3 License (licencia propia, "other") |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Kimi K3 es un modelo MoE con 896 expertos en total, de los cuales se activan 16 por token. La arquitectura combina dos tipos de capas de atención: 69 capas de Kimi Delta Attention (KDA) y 24 capas de Gated MLA. KDA es una innovación que reduce la complejidad computacional de la atención al tiempo que mantiene la calidad, mientras que AttnRes (Attention Residuals) permite una mejor propagación de la información a través de las 93 capas del modelo. La dimensión oculta de atención es de 7168 con 96 cabezas de atención, y la dimensión latente del MoE es de 3584.

El modelo incorpora el framework Stable LatentMoE, que según Moonshot AI mejora la eficiencia de escalado en aproximadamente 2,5 veces respecto a Kimi K2. No se han publicado detalles específicos sobre el número de tokens de entrenamiento, la composición del dataset o los métodos de alineación (RLHF, DPO, etc.) en la información disponible.

## Capacidades

- Generación de texto avanzada con razonamiento multi-paso y capacidad de reflexión.
- Codificación de larga duración: puede mantener sesiones de ingeniería prolongadas con supervisión humana mínima, navegar repositorios masivos y orquestar herramientas de terminal.
- Comprensión multimodal nativa: procesa texto, imágenes y vídeo dentro del mismo modelo.
- Visión en el bucle de trabajo: capaz de integrar visión en tareas como desarrollo de juegos, CAD o diseño de chips.
- Trabajo de conocimiento agéntico: generación de informes de investigación con visualizaciones interactivas, widgets, paneles y edición de vídeo.
- Ventana de contexto de 1 millón de tokens, apta para documentos extensos y repositorios completos.
- Capacidades de agente y razonamiento multi-paso para tareas de larga duración.

## Casos de uso

- Desarrollo de GPU y optimización de kernels: el modelo puede sostener sesiones de codificación de larga duración, navegar por repositorios extensos y ejecutar herramientas de terminal para iterar sobre optimizaciones de kernels.
- Desarrollo de compiladores: su capacidad de razonamiento largo y su contexto de 1M de tokens permiten trabajar con árboles sintácticos y código fuente complejo sin perder el hilo.
- Desarrollo de juegos con visión en el bucle: puede generar código de juego, recibir capturas de pantalla como entrada visual y ajustar el resultado iterativamente.
- Diseño asistido por CAD y chip: el modelo puede interpretar planos, imágenes y especificaciones técnicas para asistir en tareas de diseño con retroalimentación visual.
- Investigación profunda automatizada: genera informes de investigación con visualizaciones interactivas, widgets y dashboards, integrando texto e imágenes.
- Edición y postproducción de vídeo: gracias a su capacidad de comprender vídeo, puede realizar tareas de edición asistida, como recorte, subtitulado o análisis de contenido.
- Creación de presentaciones y material de consultoría: puede generar diapositivas de nivel profesional combinando texto, imágenes y formato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La documentación del modelo hace referencia a un informe técnico completo (disponible en GitHub) y un blog técnico, pero los datos concretos de evaluación no se incluyen en la model card ni en los resultados de búsqueda proporcionados.

## Requisitos de hardware

- VRAM estimada: no disponible, pero para un modelo de 2,8T parámetros en 8-bit se estima que se necesitan aproximadamente 2,8 TB de VRAM (más overhead de activaciones y KV cache).
- GPU recomendadas: clústeres de GPUs de alta gama, típicamente A100 80GB, H100 o H200, en configuraciones de múltiples nodos.
- No es viable en GPU de consumo (RTX 4090, etc.) sin cuantización extrema o despliegue distribuido con descarga de expertos.
- Opciones de despliegue: vLLM, SGLang u otros frameworks de inferencia que soporten MoE a gran escala. El modelo es compatible con transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia |
|---|---|---|---|---|
| Kimi K3 | 2,8T (MoE, 130B activos) | 1M tokens | KDA + AttnRes | Kimi K3 License |
| Kimi K2 | 1,0T (MoE, 32B activos) | 256K tokens | MoE estándar | Kimi K2 License |
| DeepSeek V3 | 671B (MoE, 37B activos) | 128K tokens | MoE + MLA | MIT |
| Qwen 2.5 Max | No disponible | No disponible | MoE | No disponible |

Kimi K3 es significativamente mayor que sus predecesores y competidores directos en términos de parámetros totales, y su ventana de contexto de 1M tokens es la más amplia entre los modelos abiertos de su clase. No se dispone de datos de rendimiento comparativo para verificar las afirmaciones de la superioridad de la arquitectura KDA.

## Limitaciones y advertencias

- La licencia Kimi K3 License es una licencia propia de Moonshot AI. Aunque está diseñada para permitir uso comercial, es necesario revisar los términos completos para conocer las restricciones específicas.
- No se dispone de información sobre sesgos conocidos ni riesgos de alucinación.
- El tamaño del modelo (2,8T parámetros) hace que su despliegue sea extremadamente costoso en infraestructura, limitado a organizaciones con clústeres de GPUs de alta gama.
- No se han publicado datos de entrenamiento, tokens, o composición del dataset, lo que dificulta evaluar la cobertura de idiomas o dominios.
- La ventana de contexto de 1M tokens puede generar un alto consumo de memoria y latencia en la inferencia, especialmente en modos de atención completa.
- Es un modelo reciente (creado en agosto de 2026) y su ecosistema de herramientas y optimizaciones aún está madurando.

## Enlaces

- HuggingFace (repo del autor): https://huggingface.co/olegt64/Kimi-K3
- Hugging Face (org de Moonshot): https://huggingface.co/moonshotai
- Página de Kimi K3 en Kimi: https://www.kimi.ai/ai-models/kimi-k3
- Blog técnico de Kimi K3: https://www.kimi.ai/blog/kimi-k3
- Informe técnico completo (PDF): https://github.com/MoonshotAI/Kimi-K3/blob/main/k3_tech_report.pdf
- Repositorio GitHub: https://github.com/MoonshotAI/Kimi-K3
- Documentación de la API: https://platform.kimi.ai/docs/guide/kimi-k3-quickstart
- ModelScope: https://modelscope.cn/organization/moonshotai
