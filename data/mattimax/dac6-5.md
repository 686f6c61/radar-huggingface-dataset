# Mattimax/DAC6.5

## Resumen

**DAC6.5** es un modelo multimodal de tipo imagen-texto-a-texto desarrollado por **M.INC.** (publicado en HuggingFace por el autor `Mattimax`). Combina un backbone lingüístico ligero, **LFM2.5-230M**, con un codificador visual **SigLIP2**, unidos mediante un proyector cross-modal entrenado desde cero por el propio autor. El repositorio declara 324.414.464 parámetros (~324 M) en safetensors, lo que lo sitúa en la franja de los modelos visión-lenguaje compactos orientados a ejecución local y a dispositivos de borde.

Se distribuye bajo licencia MIT, declara soporte para diez idiomas (inglés, árabe, chino, francés, alemán, japonés, coreano, español, portugués e italiano) y está enfocado a comprensión de imágenes zero-shot, inferencia rápida y bajo consumo de memoria. Su interés actual radica en que propone una vía de despliegue multimodal sin depender de infraestructura en la nube, en una categoría donde la oferta de modelos por debajo de 500 M de parámetros sigue siendo reducida.

La contrapartida es la escasez de documentación técnica: el model card no especifica longitud de contexto, volumen o composición de los datos de entrenamiento, proceso de alineación (RLHF/DPO) ni resultados de evaluación. La adopción es todavía muy baja (72 descargas y 0 likes en el momento de redactar esta ficha).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal visión-lenguaje: backbone de lenguaje LFM2.5-230M + codificador visual SigLIP2 + proyector cross-modal propio |
| Parametros totales | 324.414.464 (~324 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors; no se listan variantes GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es, pt, it (10 idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`); configuraciones en `config.json`, `vision_config.json`, `processor_config.json`; tokenizer en `tokenizer.json` y `tokenizer_config.json`; plantilla de chat en `chat_template.jinja` |
| Pipeline declarado | image-text-to-text |
| Biblioteca | transformers |
| Tamano del repositorio | 1,7 GB |
| Fecha de publicacion | 6 de septiembre de 2026 (ultima actualizacion: 11 de septiembre de 2026) |

## Arquitectura y entrenamiento

DAC6.5 se presenta como un sistema multimodal integrado de extremo a extremo, en lugar de un pipeline fragmentado con varias etapas de orquestación. Se compone de tres bloques: un motor de texto **LFM2.5-230M**, ajustado para generación de baja latencia y alto throughput; un codificador visual **SigLIP2**, encargado de la extracción de características espaciales y semánticas de la imagen; y un **proyector propietario** entrenado desde cero por M.INC. que mapea el espacio de representaciones visuales al espacio de embeddings del modelo de lenguaje. Los pesos se almacenan en un único `model.safetensors` con espacios de nombres separados (`language_model.*`, `vision_encoder.*`, `projector.*`).

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, la resolución de entrada del codificador visual ni si hubo fases de ajuste por instrucciones, RLHF o DPO. Tampoco se detalla el mecanismo interno del backbone LFM2.5-230M (si es un transformer convencional o una arquitectura híbrida). Por diferencia aritmética entre los 324 M totales y los 230 M del motor de lenguaje, el codificador visual y el proyector sumarían en torno a 94 M de parámetros, pero se trata de una estimación propia: el model card no desglosa el reparto exacto por componente.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text) con comprensión de imágenes en régimen zero-shot, según declara el autor.
- Descripción y análisis de imágenes: el codificador SigLIP2 aporta rasgos espaciales y semánticos que el proyector traslada al espacio del modelo de lenguaje.
- Conversación multimodal multi-turno: el repositorio incluye `chat_template.jinja`, lo que indica soporte de plantillas de chat estándar.
- Cobertura multilingüe declarada en diez idiomas: inglés, árabe, chino, francés, alemán, japonés, coreano, español, portugués e italiano.
- Compatibilidad con `transformers` y con endpoints compatibles (`endpoints_compatible` aparece entre las etiquetas del repositorio).
- Tool calling / function calling: no disponible.
- Modo de razonamiento explícito (thinking mode): no disponible.
- Capacidades de audio o vídeo: no disponibles; el modelo solo declara entrada de imagen.

## Casos de uso

- **Procesamiento local de documentos con datos sensibles**: al pesar ~324 M de parámetros, el modelo puede ejecutarse en la propia máquina del usuario para extraer texto, campos o estructura de facturas, informes o formularios escaneados, evitando enviar documentación confidencial a servicios en la nube.
- **Atención al cliente con capturas de pantalla**: integrado en un sistema de tickets, el modelo puede interpretar capturas enviadas por el usuario (mensajes de error, pantallas de configuración) y generar una primera respuesta o clasificar la incidencia antes de escalarla a un agente humano.
- **Descripción de imágenes para accesibilidad**: generación automática de texto alternativo en sitios web y aplicaciones, con la ventaja de un coste de inferencia muy bajo que permite procesar catálogos completos de imágenes en lote.
- **Etiquetado y catalogación de producto en comercio electrónico**: clasificación y generación de descripciones a partir de fotografías de producto, ejecutable en CPU y por tanto adecuado para pipelines de ingesta masiva donde no se justifica el coste de un modelo grande.
- **Triaje previo en arquitecturas en cascada**: uso del modelo como primera etapa que decide si una imagen requiere análisis por un VLM mayor. Su tamaño permite filtrar el grueso del tráfico visual a coste casi nulo y reservar el modelo grande para los casos complejos.
- **Asistentes multimodales en dispositivos de borde**: robots educativos, quioscos interactivos, cámaras inteligentes o aplicaciones móviles donde la huella de memoria de ~0,3-0,7 GB en pesos permite ejecución sin GPU dedicada.
- **Moderación de contenido visual en foros o marketplaces**: cribado rápido de imágenes subidas por usuarios y generación de una etiqueta o descripción previa a la revisión humana, aprovechando las capacidades zero-shot declaradas.
- **Asistencia técnica guiada por imágenes**: el modelo puede recibir la fotografía de un componente o de un panel de control y responder con instrucciones paso a paso dentro de una conversación multi-turno gracias al soporte de plantilla de chat.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El model card no incluye cifras de MMLU, MMMU, HumanEval, GSM8K, VQAv2, TextVQA ni de ninguna otra evaluación, y tampoco se han encontrado publicaciones o informes externos que las aporten. Cualquier comparación de calidad frente a otros VLM debería, por tanto, realizarse mediante una evaluación propia antes de llevar el modelo a producción.

## Requisitos de hardware

- **VRAM estimada para inferencia** (solo pesos, sin contar activaciones ni caché de atención): ~1,3 GB en FP32; ~0,65 GB en FP16/BF16; ~0,32 GB en INT8; ~0,17 GB en INT4. La resolución de entrada del codificador visual, no especificada, condiciona el pico real de memoria durante el procesamiento de la imagen.
- **Cabe en GPU de consumo**: sí, con holgura. Cualquier GPU con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090) es suficiente. También cabe en iGPU y en memoria unificada de dispositivos tipo Apple Silicon o mini-PC.
- **Ejecución en CPU**: viable por el tamaño del modelo. Es previsible una latencia de décimas de segundo a pocos segundos por respuesta, aunque no se han publicado mediciones concretas.
- **GPU de datacenter (A100, H100)**: solo tendrían sentido para servir muchas peticiones concurrentes; el modelo está sobredimensionado para una sola GPU de ese tipo.
- **Opciones de despliegue**: `transformers` está soportado de forma explícita (es la biblioteca declarada). vLLM, TGI, llama.cpp y Ollama no están confirmados para esta arquitectura concreta: al tratarse de una arquitectura propia con proyector personalizado, requerirían soporte upstream específico o una conversión a GGUF que no está publicada.
- **Latencia y throughput**: no disponible. El autor afirma que LFM2.5-230M está ajustado para alto throughput y baja latencia, pero no aporta cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| DAC6.5 (M.INC.) | ~324 M | no disponible | MIT | safetensors | HuggingFace, 72 descargas |
| SmolVLM-256M-Instruct (HuggingFace) | ~256 M | no disponible en esta ficha | Apache 2.0 | safetensors | HuggingFace, ampliamente desplegado |
| Qwen2-VL-2B-Instruct (Alibaba) | ~2,2 B | no disponible en esta ficha | Apache 2.0 | safetensors | HuggingFace, ecosistema maduro |
| moondream2 (moondream) | ~1,86 B | no disponible en esta ficha | Apache 2.0 | safetensors | HuggingFace, alta adopción |

Los datos de los modelos comparativos proceden de sus respectivas model cards públicas y conviene verificarlos antes de tomar una decisión. La comparación cualitativa relevante es que DAC6.5 compite en la franja más baja de la categoría (por debajo de 500 M), donde su principal alternativa abierta es SmolVLM-256M; frente a Qwen2-VL-2B o moondream2 sacrifica capacidad previsiblemente a cambio de una huella de memoria varias veces menor. La diferencia crítica es la madurez del ecosistema: DAC6.5 no publica benchmarks, no tiene variantes cuantizadas y apenas registra descargas, mientras que las alternativas cuentan con soporte amplio en vLLM, llama.cpp y Ollama.

## Limitaciones y advertencias

- **Ausencia total de evaluación publicada**: no hay benchmarks, informes de evaluación ni comparativas oficiales. No es posible estimar su calidad real de comprensión visual sin probarlo.
- **Riesgo de alucinación**: como cualquier VLM, puede inventar contenido ausente en la imagen o describir con seguridad elementos que no existen, especialmente en imágenes densas en texto o de baja resolución.
- **Proyector entrenado desde cero**: el propio autor indica que el módulo de proyección se entrenó desde cero sin detallar datos ni metodología, lo que introduce incertidumbre sobre la fidelidad de la alineación visión-lenguaje.
- **Longitud de contexto desconocida**: no se especifica la ventana de contexto, algo crítico para planificar conversaciones multi-turno o documentos extensos.
- **Cobertura idiomática declarada pero no verificada**: el soporte de diez idiomas es una declaración del autor sin evidencia publicada, y la calidad relativa entre idiomas es presumiblemente desigual.
- **Ecosistema de despliegue limitado**: no hay GGUF, AWQ ni GPTQ publicados, ni confirmación de soporte en vLLM, TGI, llama.cpp u Ollama. La integración en producción pasa, en principio, por `transformers`.
- **Riesgo de mantenimiento**: el proyecto es de un autor individual (M.INC.), con 0 likes y 72 descargas. No hay garantía de actualizaciones, soporte ni corrección de errores.
- **Confusión de licencia**: el model card describe la arquitectura como "propietaria", pero los pesos se publican bajo licencia MIT, que permite uso comercial, modificación y redistribución. Conviene conservar el aviso de copyright y verificar que los componentes de origen (LFM2.5-230M y SigLIP2) tengan licencias compatibles con el uso previsto, ya que el repositorio no aclara sus términos.
- **Validación obligatoria antes de producción**: dado el conjunto de incógnitas anteriores, se recomienda una batería de pruebas propia sobre el dominio objetivo antes de cualquier despliegue real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mattimax/DAC6.5
- Apoyo al autor (Buy Me a Coffee): https://www.buymeacoffee.com/marzomattye

Nota: la búsqueda web realizada no devolvió enlaces relevantes sobre este modelo (los resultados obtenidos correspondían a páginas de ayuda de YouTube TV y consultas no relacionadas). No se dispone de paper, blog técnico, repositorio de código ni demo pública de DAC6.5, ni de enlaces al backbone LFM2.5-230M o al codificador SigLIP2 utilizados.
