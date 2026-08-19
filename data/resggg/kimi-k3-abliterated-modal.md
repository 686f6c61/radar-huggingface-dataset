# Resggg/Kimi-K3-Abliterated-modal

## Resumen

Kimi-K3-Abliterated-modal es una variante del modelo Kimi K3 de Moonshot AI, publicada por el usuario Resggg en HuggingFace. El modelo base, Kimi K3, es un modelo de mezcla de expertos (MoE) con 2,8 billones de parámetros en total y 104 mil millones activos, que incorpora visión nativa y una ventana de contexto de 1 millón de tokens. Esta variante ha sido sometida a un proceso de "abliteración", una técnica de modificación de pesos que atenúa los mecanismos de rechazo derivados del alineamiento, sin alterar la arquitectura ni los parámetros estructurales del modelo original.

El interés de esta versión radica en que elimina las barreras de rechazo del modelo base, lo que la hace útil para investigación de alineamiento, evaluación de equipos rojos y experimentación controlada. El modelo mantiene todas las capacidades del Kimi K3 original: razonamiento estructurado con trazas de `reasoning_content`, soporte multimodal (texto, imagen y vídeo), integración con herramientas MCP y una ventana de contexto de 1 millón de tokens para ingestión de repositorios completos. Los pesos se distribuyen en formato MXFP4 con activaciones MXFP8, lo que facilita su despliegue en hardware diverso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con Kimi Delta Attention (KDA) y Attention Residuals (AttnRes) |
| Parametros totales | 2.779.931.837.184 (2,8 billones) |
| Parametros activos | 104 mil millones |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | MXFP4 (pesos) y MXFP8 (activaciones) |
| Idiomas soportados | Ingles y japones (segun el proceso de abliteracion); el modelo base soporta mas idiomas, pero no se especifican |
| Licencia | Kimi K3 License (licencia propia, no OSI) |
| Formato de pesos | safetensors (MXFP4) |

## Arquitectura y entrenamiento

El modelo base Kimi K3 utiliza una arquitectura de mezcla de expertos con 93 capas, de las cuales una es densa. La composicion de atencion es heterogenea: 69 capas usan Kimi Delta Attention (KDA) y 24 capas usan Gated MLA (Multi-head Latent Attention). KDA es una innovacion de Moonshot AI que introduce un mecanismo de atencion con delta residual, mientras que AttnRes (Attention Residuals) anade conexiones residuales adicionales en el bloque de atencion para mejorar el flujo de gradientes y la estabilidad del entrenamiento.

La variante abliterada no introduce nuevos datos de entrenamiento ni modifica la arquitectura. El proceso de abliteracion consiste en una cirugia de pesos dirigida que identifica y atenua las activaciones asociadas a los mecanismos de rechazo del alineamiento. Segun la model card, se ha eliminado mas del 98 % de la senal de salvaguarda en las familias de pesos objetivo, reduciendo la probabilidad de rechazos inducidos por el alineamiento en entradas en ingles y japones.

El modelo base fue entrenado con cuantizacion consciente (quantization-aware training) para producir pesos MXFP4 y activaciones MXFP8, lo que permite una inferencia eficiente sin perdida significativa de calidad. El razonamiento estructurado esta siempre activado: el modelo emite trazas explicitas de `reasoning_content` con niveles de esfuerzo configurables (`low`, `high`, `max`).

## Capacidades

- Generacion de texto y razonamiento estructurado con trazas de `reasoning_content` siempre activas.
- Razonamiento multi-paso y planificacion de tareas complejas gracias al entrenamiento agente del modelo base.
- Soporte nativo multimodal: procesa texto, imagenes y video en una sola arquitectura.
- Ventana de contexto de 1 millon de tokens, capaz de ingerir repositorios completos de codigo o documentos extensos.
- Soporte de tool calling y function calling mediante integracion con MCP (Model Context Protocol).
- Capacidades de agente: orquestacion de terminal, manipulacion de hojas de calculo, generacion de visualizaciones interactivas y navegacion web multi-paso.
- Codificacion de largo alcance: sesiones de ingenieria sostenidas en codebases grandes, desarrollo de kernels GPU, compiladores y flujos de trabajo con vision en el bucle.
- Multilingue limitado al ingles y japones para la variante abliterada (el modelo base puede soportar mas idiomas).

## Casos de uso

- Investigacion en alineamiento de IA: el modelo permite estudiar el comportamiento de un modelo de frontera sin los mecanismos de rechazo, lo que facilita la evaluacion de riesgos y la comprension de los mecanismos de salvaguarda.
- Red-team de seguridad: equipos de seguridad pueden probar vulnerabilidades y comportamientos no deseados en un entorno controlado, sin las restricciones del alineamiento estandar.
- Desarrollo de codigo a gran escala: con 1 millon de tokens de contexto, el modelo puede trabajar sobre repositorios completos, refactorizar modulos, generar tests y mantener coherencia en proyectos grandes.
- Automatizacion de tareas agente con MCP: el modelo puede integrarse en pipelines que requieren navegacion web, manipulacion de documentos y orquestacion de herramientas externas.
- Analisis de documentos y generacion de informes: su capacidad multimodal permite procesar PDFs, imagenes y video, extrayendo informacion y generando resumenes o informes interactivos.
- Experimentacion en entornos de investigacion: laboratorios universitarios o corporativos pueden usar el modelo para estudiar comportamientos emergentes sin las restricciones de seguridad del modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas comparativas ni metricas de rendimiento (MMLU, HumanEval, GSM8K, etc.) para esta variante abliterada. Dado que la abliteracion no modifica la arquitectura ni los parametros, se espera que el rendimiento sea similar al del modelo base Kimi K3, pero no hay datos publicados que lo confirmen.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 2,8 billones de parametros en total. Con cuantizacion MXFP4, el peso aproximado es de 1,4 TB (2,8e12 x 4 bits). Se requiere un cluster multi-GPU con al menos 1,5 TB de VRAM agregada para inferencia.
- GPUs recomendadas: no disponible. Un despliegue realista requeriria multiples GPUs de alta capacidad (H100 80 GB o A100 80 GB) en configuracion distribuida. Por ejemplo, 20 GPUs H100 80 GB proporcionarian 1,6 TB de VRAM.
- No cabe en GPUs de consumo: ninguna GPU consumer (RTX 4090, RTX 5090, etc.) tiene suficiente VRAM para este modelo, incluso cuantizado.
- Opciones de despliegue: al ser un modelo de transformers con pesos safetensors, se puede servir con vLLM o TGI en configuracion multi-GPU. No hay versiones GGUF oficiales, aunque existen conversiones de terceros (por ejemplo, GrEarl/Kimi-K3-Abliterated-V1-Q2_K-GGUF) que permiten ejecutarlo con llama.cpp en configuraciones muy reducidas, con perdida significativa de calidad.
- Latencia y throughput: no disponible. Depende del hardware, la configuracion de paralelismo y el numero de expertos activos por token.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Kimi-K3-Abliterated-modal | 2,8 billones | 104 mil millones | 1M tokens | Kimi K3 License | Variante abliterada, multimodal |
| Kimi K3 (base) | 2,8 billones | 104 mil millones | 1M tokens | Kimi K3 License | Modelo original con alineamiento estandar |
| DeepSeek-V3 | 671 mil millones | 37 mil millones | 128K tokens | MIT | MoE, sin vision nativa |
| Qwen2.5-Max | No publicados | No publicados | 256K tokens | Propietaria | Modelo cerrado, API |

La comparativa directa es limitada porque Kimi K3 es el modelo open-source mas grande publicado hasta la fecha (segun Moonshot AI). DeepSeek-V3 es el competidor mas cercano en terminos de arquitectura MoE open-source, pero con una escala significativamente menor. Qwen2.5-Max es un modelo propietario que no permite comparacion directa de pesos.

## Limitaciones y advertencias

- La abliteracion elimina los mecanismos de rechazo del alineamiento, lo que significa que el modelo puede generar contenido inapropiado, ofensivo o peligroso sin restricciones. Solo debe usarse en entornos controlados y con fines de investigacion.
- El proceso de abliteracion se ha aplicado principalmente a entradas en ingles y japones. El comportamiento en otros idiomas no esta garantizado y podria mostrar inconsistencias.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar informacion falsa o inventada, especialmente en tareas de razonamiento largo o con contextos ambiguos.
- La licencia Kimi K3 License no es OSI y puede tener restricciones para uso comercial. Es necesario revisar los terminos completos antes de cualquier despliegue en produccion.
- Los requisitos de hardware son extremadamente exigentes: se necesita un cluster multi-GPU con mas de 1,5 TB de VRAM para inferencia en precision MXFP4. Esto limita su uso a organizaciones con infraestructura de computacion de alto rendimiento.
- El tamano del repositorio es de 1,56 TB, lo que requiere un ancho de banda considerable para la descarga y almacenamiento local.
- No se han publicado benchmarks especificos para esta variante, por lo que el rendimiento real en tareas concretas no esta verificado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Resggg/Kimi-K3-Abliterated-modal
- Modelo base Kimi K3: https://huggingface.co/moonshotai/Kimi-K3
- Organizacion SHS-Lab (variante original): https://huggingface.co/SHS-Lab/Kimi-K3-Abliterated
- Pagina oficial de Kimi K3: https://www.kimi.com/ai-models/kimi-k3
- Documentacion de la API de Kimi: https://platform.kimi.ai/docs/guide/kimi-k3-quickstart
- Blog sobre Kimi K3 y cuantizacion MXFP4: https://huggingface.co/blog/ResterChed/kimi-k3-model-overview-mxfp4-quantization-open-wei
- Version GGUF de terceros: https://huggingface.co/GrEarl/Kimi-K3-Abliterated-V1-Q2_K-GGUF
