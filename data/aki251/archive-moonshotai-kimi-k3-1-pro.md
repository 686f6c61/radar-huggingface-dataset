# Aki251/archive-moonshotai-Kimi-K3.1-Pro

## Resumen

Kimi K3.1 Pro es un modelo de lenguaje multimodal nativo de tipo agéntico, publicado con pesos abiertos por Moonshot AI. Se trata del primer modelo de la serie K3.1 y, segun la model card, el modelo mas capaz de la clase 3T de la compania. Parte de Kimi K3 y se post-entrena mediante aprendizaje por refuerzo conjunto a gran escala sobre cientos de dominios, con mejoras declaradas en programacion, creacion 3D, investigacion financiera, precision factual y capacidades agénticas. Esta ficha describe la copia alojada en el repositorio `Aki251/archive-moonshotai-Kimi-K3.1-Pro`, un espejo archivado del modelo original.

La arquitectura es un transformer de mezcla de expertos (MoE) con 2,8 billones de parametros totales y 104.000 millones activados por token, 93 capas (una densa) y una ventana de contexto de un millon de tokens. Combina 69 capas de atencion KDA con 24 capas de Gated DSA, una composicion poco habitual que busca eficiencia en contextos muy largos. El modelo es multimodal nativo (entrada de imagen y texto) y esta empaquetado en formato `compressed-tensors` de 8 bits, con un peso en repositorio de 1561,4 GB.

Su relevancia actual radica en que pocos modelos abiertos de escala 3T ofrecen contexto de 1M tokens combinado con entrenamiento agéntico y capacidades multimodales. No obstante, el despliegue requiere infraestructura de centro de datos: el repositorio en 8 bits ya supera 1,5 TB, por lo que no es viable en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) sobre transformer, con atencion hibrida KDA + Gated DSA |
| Parametros totales | 2,8 billones (2.780.110.363.392 segun safetensors) |
| Parametros activos | 104.000 millones |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | Pesos en 8 bits (formato `compressed-tensors`); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | `kimi-k3.1-pro` (licencia propia, etiquetada como `other`) |
| Formato de pesos | safetensors con `compressed-tensors`, `custom_code` en transformers |

Detalles adicionales de arquitectura recogidos en la model card: 93 capas (1 densa), 69 capas KDA y 24 capas Gated DSA, dimension oculta de atencion de 7168, 96 cabezas de atencion, dimension de cabeza del indice DSA de 128, 32 cabezas de indice DSA con top-k de 2048, dimension latente MoE de 3584, dimension oculta por experto de 3072, 896 expertos con 16 seleccionados por token y 2 expertos compartidos, y vocabulario de 160K tokens.

## Arquitectura y entrenamiento

El modelo es un transformer MoE con enrutamiento disperso: de los 896 expertos se activan 16 por token, mas 2 expertos compartidos, lo que da los 104.000 millones de parametros activos sobre un total de 2,8 billones. La capa de atencion es hibrida: 69 capas usan KDA (un mecanismo de atencion lineal) y 24 usan Gated DSA (atención dispersa con puerta), con un indice DSA de 32 cabezas y top-k de 2048. Esta combinacion esta disenada para sostener contextos de un millon de tokens sin el coste cuadratico de la atencion densa clasica. La dimension latente MoE de 3584 reduce el coste de proyeccion de los expertos.

El post-entrenamiento se basa, segun la model card, en aprendizaje por refuerzo conjunto a gran escala sobre cientos de dominios downstream, partiendo de Kimi K3. No se detalla en la informacion disponible el numero de tokens de preentrenamiento, la composicion exacta del dataset, ni si se emplearon tecnicas adicionales como DPO o decodificacion especulativa. El modelo es multimodal nativo, no un adaptador visual sobre un modelo de texto.

## Capacidades

- Generacion de texto y conversacion multi-turno con contexto de hasta 1.000.000 de tokens.
- Razonamiento agéntico multi-paso, con enfasis declarado en tareas de agentes.
- Programacion y generacion de codigo, con mejoras reportadas por el autor en este dominio.
- Creacion 3D, una capacidad destacada explicitamente en la model card.
- Investigacion financiera y precision factual, segun las mejoras declaradas.
- Entrada de imagen y texto (pipeline `image-text-to-text`), es decir, comprension multimodal nativa.
- Compatibilidad con endpoints (`endpoints_compatible`) y con la libreria transformers mediante `custom_code`.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponible el listado de idiomas.

## Casos de uso

- Analisis de repositorios completos: con 1M tokens de contexto se puede cargar un monorepo o una base de codigo extensa y pedir refactorizaciones o auditorias sin trocear el codigo, lo que reduce perdidas de coherencia entre ficheros.
- Agentes de automatizacion de oficina: el entrenamiento agéntico multi-dominio y la ventana de 1M permiten mantener el estado de tareas largas (navegacion, extraccion, escritura de informes) en una sola sesion.
- Investigacion financiera asistida: el modelo declara mejoras en este dominio; se usaria para resumir informes anuales extensos, cruzar series de datos y generar borradores de analisis con citas dentro del mismo contexto.
- Generacion y edicion de escenas 3D: la capacidad de creacion 3D declarada permite generar descripciones estructuradas o codigo de escena (por ejemplo, scripts de modelado) a partir de especificaciones en lenguaje natural.
- Procesamiento de documentos multimodales: al aceptar imagen y texto, puede extraer informacion de capturas, diagramas o PDFs escaneados junto al texto asociado en un mismo flujo.
- Copiloto de codigo en produccion: integrable via transformers o endpoints compatibles para autocompletado, revision de parches y generacion de tests en pipelines de CI/CD, sujeto a la capacidad de tool calling, que no esta confirmada.
- Analisis de conversaciones y logs de atencion al cliente: la ventana de 1M tokens permite ingerir historiales completos de un cliente o de un turno de soporte y extraer causas raiz sin resumir.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio en 8 bits ocupa 1561,4 GB; la inferencia requiere un pool de GPUs con al menos esa capacidad agregada, mas espacio para cache KV y estados de atencion.
- GPU recomendadas: nodos multi-GPU de centro de datos (por ejemplo, H100 o A100 de 80 GB en configuraciones de 8 o mas unidades por instancia); la cuantizacion a 8 bits sugiere despliegue en clusters, no en una sola GPU.
- GPU de consumo: no cabe en ninguna GPU consumer actual (RTX 4090 con 24 GB queda muy lejos de los 1,5 TB de pesos).
- Opciones de despliegue: transformers con `custom_code` (soporte nativo del repositorio); vLLM, llama.cpp, Ollama y TGI no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi K3.1 Pro | 2,8 T | 104 B | 1.000.000 | `kimi-k3.1-pro` (other) | Pesos abiertos en HF |
| Alternativas de clase 3T | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos verificables de otros modelos de la misma clase para una comparacion cuantitativa; se indica "no disponible" en lugar de inferir cifras.

## Limitaciones y advertencias

- Licencia propia (`kimi-k3.1-pro`, etiquetada como `other`): es imprescindible revisar los terminos del fichero LICENSE del repositorio original antes de cualquier uso comercial; no es una licencia open source estandar.
- El repositorio es un espejo archivado de terceros (`Aki251`), no la publicacion oficial de Moonshot AI; conviene contrastar integridad y procedencia con el repositorio oficial `moonshotai/Kimi-K3.1-Pro`.
- Riesgo de alucinacion inherente a modelos de gran escala; la model card declara mejoras en precision factual, pero no aporta benchmarks que las cuantifiquen en la informacion disponible.
- Idiomas soportados no documentados: no se puede garantizar calidad en castellano sin evaluacion propia.
- Sesgos: no se documentan en la informacion disponible; deben asumirse los sesgos habituales de los datos web a gran escala.
- Coste de despliegue prohibitivo: 1561,4 GB en 8 bits exigen infraestructura de centro de datos y planificacion de memoria para contexto de 1M tokens.
- Soporte de tool calling y de cuantizaciones de menor precision (4 bits, GGUF) no confirmado; verificar antes de disenar pipelines de agentes.
- El tag `endpoints_compatible` sugiere compatibilidad con la API de endpoints, pero el formato `compressed-tensors` y `custom_code` pueden requerir versiones especificas de transformers.

## Enlaces

- Repositorio espejo en Hugging Face: https://huggingface.co/Aki251/archive-moonshotai-Kimi-K3.1-Pro
- Repositorio oficial (referenciado en la model card): https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Blog tecnico: https://www.kimi.ai/blog/kimi-k3-1-pro
- Quickstart de API: https://platform.kimi.ai/docs/guide/kimi-k3-1-pro-quickstart
- Web de Moonshot AI: https://www.moonshot.ai
- Chat: https://www.kimi.ai
- Organizacion en Hugging Face: https://huggingface.co/moonshotai
- ModelScope: https://modelscope.cn/organization/moonshotai
- X (Twitter): https://twitter.com/kimi_moonshot
- Discord: https://discord.gg/TYU2fdJykW
