# feylixia/Llama-3.2-3B-Buginese-Indonesian-Translation-GGUF

## Resumen

El modelo `feylixia/Llama-3.2-3B-Buginese-Indonesian-Translation-GGUF` es un traductor neuronal bidireccional entre buginés (lengua austronesia de Sulawesi, Indonesia) e indonesio, desarrollado por Ahmad Raihan Asyam como parte de su trabajo de fin de grado en la Universidad Negeri Makassar. Se basa en el modelo `meta-llama/Llama-3.2-3B`, ajustado con QLoRA sobre el subconjunto `bug` del dataset `prosa-text/nusa-translation`, y se distribuye en formato GGUF cuantizado a Q4_K_M para su ejecución eficiente con `llama.cpp`.

El modelo resuelve un problema práctico de traducción de baja disponibilidad: el buginés es una lengua regional con escasos recursos digitales, y esta adaptación permite realizar traducciones automáticas locales sin depender de servicios en la nube. Su relevancia radica en la combinación de un modelo base ligero (3B parámetros) con una cuantización compacta, lo que posibilita su despliegue en hardware de consumo, y en su integración con una interfaz gráfica Gradio que facilita su uso por parte de hablantes no técnicos.

La arquitectura subyacente es un transformer decoder-only estándar de Llama 3.2, con 3.212.749.888 parámetros totales. La ventana de contexto no se especifica en la documentación proporcionada, aunque el modelo base Llama 3.2 soporta hasta 128K tokens; en esta adaptación no se confirma si se mantiene o reduce.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Llama 3.2 3B) |
| Parametros totales | 3.212.749.888 (3,2B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | Bugines, indonesio |
| Licencia | no disponible |
| Formato de pesos | GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo parte de `meta-llama/Llama-3.2-3B`, un transformer decoder-only con normalización pre-RMS, atención con RoPE y activación SwiGLU, típico de la familia Llama 3.2. El ajuste fino se realizó mediante QLoRA (Low-Rank Adaptation cuantizada) usando la librería Unsloth, lo que permite adaptar el modelo con un coste computacional reducido. El dataset de entrenamiento es el subconjunto `bug` de `prosa-text/nusa-translation`, que contiene pares de frases en buginés e indonesio. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO.

La cuantización a GGUF Q4_K_M se realizó posteriormente para reducir el tamaño del modelo a aproximadamente 2,3 GB, facilitando su ejecución en CPU y GPU de gama media. El motor de inferencia es `llama-cpp-python` (versión 0.3.16 con soporte CUDA 12.8), y la interfaz de usuario se construyó con Gradio, incluyendo funciones de streaming, preprocesamiento inteligente (protección de entidades nombradas, URLs, correos y etiquetas HTML) y modo oscuro automático.

## Capacidades

- Traducción bidireccional entre buginés e indonesio, tanto en dirección buginés→indonesio como indonesio→buginés.
- Inferencia en streaming: muestra los resultados de traducción token a token en tiempo real.
- Preprocesamiento inteligente del texto de entrada: preserva entidades nombradas (NER), URLs, direcciones de correo y etiquetas HTML para evitar que se corrompan durante la traducción.
- Historial de sesión interactivo: permite hacer clic en traducciones anteriores para recargar el texto fuente y la dirección de traducción.
- Ejecución completamente local: no envía datos a servidores externos, garantizando privacidad.
- Interfaz gráfica responsive con modo oscuro automático, adaptable a dispositivos móviles y de escritorio.
- Compatible con `llama.cpp` y sus bindings, lo que permite su integración en aplicaciones Python o mediante servidores compatibles con la API de OpenAI.

## Casos de uso

- Traducción de documentos administrativos y legales: el modelo puede convertir actas, certificados o formularios del indonesio al buginés y viceversa, facilitando trámites en regiones donde el buginés es la lengua predominante. Su procesamiento local evita la exposición de datos sensibles.
- Atención al cliente en lenguas minoritarias: empresas u organismos públicos pueden desplegar un chatbot o asistente que traduzca consultas de usuarios buginés al indonesio para que el personal administrativo las entienda, y las respuestas de vuelta al buginés.
- Preservación y documentación lingüística: investigadores y lingüistas pueden utilizar el modelo para transcribir y traducir corpus orales o escritos en buginés, acelerando la creación de recursos digitales para esta lengua.
- Educación bilingüe: en escuelas de Sulawesi, el modelo puede servir como herramienta de apoyo para traducir materiales didácticos del indonesio al buginés, o para que estudiantes practiquen la traducción en ambos sentidos.
- Traducción de contenido digital: blogs, foros o redes sociales en buginés pueden traducirse automáticamente al indonesio para ampliar su audiencia, y viceversa, con una interfaz sencilla basada en Gradio.
- Desarrollo de aplicaciones de traducción offline: al ser un modelo GGUF ligero, puede integrarse en aplicaciones de escritorio o móviles que funcionen sin conexión, útil en zonas rurales con conectividad limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas como BLEU, METEOR o comparaciones con otros sistemas de traducción automática para buginés-indonesio.

## Requisitos de hardware

- Tamaño del modelo: aproximadamente 2,3 GB en formato GGUF Q4_K_M.
- VRAM estimada para inferencia: con cuantización Q4_K_M, el modelo puede ejecutarse en GPUs con 4 GB de VRAM o menos, dependiendo de la longitud de la secuencia. En CPU, requiere unos 2-3 GB de RAM.
- GPUs recomendadas: cualquier GPU compatible con CUDA 12.8 (por ejemplo, RTX 3060, RTX 4060, RTX 4090) o GPUs de gama baja con al menos 4 GB de VRAM. También puede ejecutarse en CPU con suficiente RAM.
- Cabe en GPUs de consumo: sí, en tarjetas como RTX 3060 (12 GB) o RTX 4060 (8 GB) con holgura. Incluso en iGPUs con 4 GB compartidos podría funcionar, aunque con menor velocidad.
- Opciones de despliegue: `llama.cpp` (incluyendo `llama-server`), `llama-cpp-python`, Ollama (si se convierte el GGUF), o mediante la interfaz Gradio incluida en el repositorio. También es compatible con servidores que implementan la API de OpenAI a través de `llama.cpp`.
- Latencia y throughput: no se proporcionan datos específicos. En una GPU moderna (RTX 3060 o superior), se espera una velocidad de decodificación de decenas de tokens por segundo para un modelo de 3B cuantizado, pero estos valores dependen del hardware y la configuración.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|---|
| feylixia/Llama-3.2-3B-Buginese-Indonesian-Translation-GGUF | Llama 3.2 3B | 3,2B | no disponible | Bugines, indonesio | no disponible | GGUF Q4_K_M |
| shiningdota/Llama-3.2-3B_Instruct_Indonesian | Llama 3.2 3B | 3,2B | no disponible | Indonesio (instrucciones) | no disponible | no disponible |
| meta-llama/Llama-3.2-3B (base) | - | 3,2B | 128K (según documentación oficial de Meta) | Multilingüe (principalmente inglés, español, etc.) | Llama 3.2 Community License | BF16, FP8, etc. |

La comparativa se limita a modelos de la misma familia y tamaño. No se dispone de datos de rendimiento para establecer una comparación cuantitativa. El modelo de `shiningdota` está orientado a instrucciones en indonesio, mientras que el de `feylixia` se especializa en traducción buginés-indonesio. El modelo base de Meta no está adaptado para traducción entre estas dos lenguas.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo ajustado sobre un dataset limitado (subconjunto `bug` de nusa-translation), puede presentar errores de traducción, especialmente con términos técnicos, modismos o variantes dialectales del buginés. Como todo modelo generativo, puede producir traducciones inventadas o inexactas.
- Cobertura lingüística restringida: solo soporta buginés e indonesio. No es adecuado para otros idiomas, y su rendimiento fuera de estos dominios será nulo o muy pobre.
- Contexto limitado: no se especifica la longitud de contexto efectiva tras el ajuste. Si se mantiene la ventana de 128K del modelo base, el uso de secuencias muy largas podría degradar la calidad o requerir más memoria.
- Licencia no especificada: la model card no indica la licencia del modelo adaptado. El modelo base Llama 3.2 tiene su propia licencia comunitaria, pero no se confirma si esta adaptación cumple con sus términos. Antes de un uso comercial, es necesario verificar la procedencia y los derechos.
- Dependencia de `llama.cpp` y CUDA 12.8: el proyecto incluye un wheel precompilado para Windows con CUDA 12.8. En otros sistemas operativos o versiones de CUDA, puede requerir compilación manual, lo que añade complejidad.
- Sin garantías de producción: al ser un trabajo académico (tesis de grado), no se ofrecen garantías de robustez, mantenimiento o soporte. No se recomienda su uso en sistemas críticos sin una evaluación exhaustiva.
- Privacidad: aunque el procesamiento es local, la interfaz Gradio en modo online (`share=True`) crea un enlace público temporal que podría exponer los datos si se utiliza en redes no confiables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/feylixia/Llama-3.2-3B-Buginese-Indonesian-Translation-GGUF
- Repositorio GitHub del proyecto: https://github.com/feylixia/llama-3.2-translation
- README del repositorio: https://github.com/feylixia/llama-3.2-translation/blob/main/README.md
- Dataset de entrenamiento: https://huggingface.co/datasets/prosa-text/nusa-translation
- Modelo base Llama 3.2 3B: https://huggingface.co/meta-llama/Llama-3.2-3B
- Documentación oficial de Llama 3.2 (Meta): https://developer.meta.com/ai/docs/model-cards-and-prompt-formats/llama3_2/
- Wheel de `llama-cpp-python` para CUDA 12.8: https://github.com/boneylizard/llama-cpp-python-cu128-gemma3/releases#release-rtx5090-blackwell-gpt-oss
