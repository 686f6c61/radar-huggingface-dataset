# florianvoss/Qwen3.5-4B-Autoround-a16w4-Modalix

## Resumen

Este repositorio no contiene un modelo entrenado en formato convencional, sino un conjunto de artefactos de ejecución compilados de Qwen/Qwen3.5-4B para el runtime LLiMa sobre el acelerador SiMa.ai Modalix. Lo publica el usuario florianvoss y su propósito es desplegar un modelo multimodal de 4.000 millones de parámetros cuantizado a INT4 en hardware de inferencia en el borde (edge), no en GPU de centro de datos. El paquete incluye 139 programas MLA compilados en formato ELF, junto con configuración de runtime, tokenizador y embeddings en el directorio `devkit/`.

La relevancia de esta ficha es acotada pero concreta: documenta una ruta de despliegue poco habitual (compilación a ELF para un SoC específico) y revela detalles del esquema de cuantización aplicado capa por capa. Los pesos lineales del decodificador, incluidas las proyecciones QKV/Z/output de DeltaNet, se cuantizan con AutoRound INT4 simétrico con tamaño de grupo 256; la cabeza de salida usa GPTQ INT4; y los pesos de visión y proyector usan RTN INT8 por canal de salida.

El artefacto limita la capacidad de contexto a 4096 tokens y acepta entradas de visión de 448 × 448 píxeles. La propia model card indica que la compilación, la validación del archivo y el `llima-deploy` local finalizaron correctamente, pero que la evaluación en runtime Modalix está pendiente, por lo que no existen datos públicos de rendimiento, latencia o calidad. El repositorio registra 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No confirmada por documentación del modelo base; el artefacto incluye proyecciones DeltaNet (atención lineal), programas MLA y un codificador de visión, lo que apunta a un transformer híbrido multimodal |
| Parámetros totales | 4B (según la denominación del modelo base Qwen/Qwen3.5-4B; no se detalla en la información) |
| Parámetros activos | No aplica / no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | 4096 tokens (capacidad de contexto del artefacto compilado; el modelo base podría soportar más, no disponible) |
| Tipos de cuantización | AutoRound INT4 simétrico, grupo 256 (lineales del decodificador, incluidas proyecciones QKV/Z/output de DeltaNet); GPTQ INT4 simétrico, grupo 256 (cabeza de salida); RTN INT8 por canal de salida (lineales de visión y proyector); BF16 (proyecciones A/B de DeltaNet, parámetros de convolución, normalización, `A_log` y `dt_bias`) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card no la especifica; la etiqueta `region:us` no equivale a licencia) |
| Formato de pesos | Binarios ELF compilados (139 programas MLA) más activos de runtime en `devkit/`; no es un checkpoint Transformers ni safetensors ni GGUF |
| Modelo base | Qwen/Qwen3.5-4B |
| Autor del artefacto | florianvoss |
| Acelerador objetivo | SiMa.ai Modalix (SoC de inferencia en el borde) |
| Runtime | LLiMa (`llima run /ruta/al/modelo`) |
| Preprocesado | SmoothQuant con alpha 0.5; tamaño de grupo de prefill 128 |
| Entrada de visión | 448 × 448 píxeles; codificador empaquetado como ELF por capa |
| Optimizaciones activadas | Uso compartido de filtros, embeddings cuantizados y caché KV cuantizada |
| Tamaño del repositorio | 8,3 GB |
| Fecha de publicación | 12 de septiembre de 2026 (creado), 12 de septiembre de 2026 (última actualización) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay información sobre el proceso de entrenamiento del modelo base en los materiales proporcionados: no se documentan número de tokens, composición del dataset, fases de ajuste (SFT, RLHF, DPO) ni innovaciones de entrenamiento. Tampoco se enlaza ningún informe técnico. Lo único que puede afirmarse con la información disponible es lo que revela la propia receta de cuantización del artefacto.

Esa receta indica que el modelo base combina tres componentes. En primer lugar, capas con proyecciones DeltaNet (QKV, Z, output, A/B, convolución, normalización, `A_log`, `dt_bias`), propias de mecanismos de atención lineal. En segundo lugar, programas MLA (multi-head latent attention), que dan nombre a los 139 ELF compilados. En tercer lugar, un codificador de visión más un proyector, lo que convierte al modelo en multimodal. La cuantización se aplica de forma heterogénea: SmoothQuant (alpha 0.5) para suavizar activaciones, AutoRound INT4 en los lineales del decodificador, GPTQ INT4 en la cabeza de salida, RTN INT8 en la torre de visión y precisión BF16 en los parámetros sensibles de DeltaNet y en las normalizaciones. Es un patrón habitual para preservar estabilidad numérica en capas recurrentes o de atención lineal mientras se comprime al máximo el resto de la red.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen/Qwen3.5-4B, aunque no se documentan capacidades concretas ni evaluación alguna en este artefacto.
- Procesamiento de imágenes: el artefacto incluye codificador de visión y proyector cuantizados, con entrada de 448 × 448 píxeles, por lo que admite tareas de visión-lenguaje.
- Inferencia multimodal: combinación de entrada visual y textual en una misma pasada, con la caché KV cuantizada activada.
- Contexto corto: 4096 tokens de capacidad, suficiente para conversación de varios turnos breves o descripción de una imagen con instrucciones, insuficiente para documentos largos.
- Tool calling / function calling: no disponible (no se menciona en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo de pensamiento explícito (thinking mode): no disponible.
- Capacidades multilingües: no disponible (no se declara lista de idiomas).
- Capacidades de audio o vídeo: no disponibles.

## Casos de uso

- Inspección visual en planta industrial: el codificador de visión a 448 × 448 y la cuantización INT4 permiten clasificar o describir defectos en línea de producción sobre hardware Modalix, sin depender de conectividad a la nube y con un consumo energético propio de un SoC de borde.
- Análisis de documentos en local para sectores regulados: digitalización y resumen de formularios o informes escaneados dentro de la propia instalación, de modo que los datos sensibles (sanitarios, legales, financieros) no salgan de la infraestructura del cliente.
- Asistencia a operarios con instrucciones visuales: dado un manual o una captura, el modelo puede generar explicaciones paso a paso en el dispositivo, útil en entornos con conectividad intermitente como obra, campo o plantas subterráneas.
- Clasificación y etiquetado de imágenes con descripción textual: generación automática de metadatos para archivos fotográficos en sistemas de gestión documental, siempre con prompts que quepan en los 4096 tokens de contexto.
- Prototipado de productos de visión-lenguaje en borde: sirve como base para validar arquitecturas híbridas (DeltaNet + MLA + visión) sobre silicio específico antes de invertir en un modelo mayor.
- Despliegue aislado (air-gapped) con requisitos de privacidad estrictos: al ejecutarse con `llima run` sobre Modalix y no requerir GPU ni servicios externos, encaja en instalaciones sin acceso a internet.
- Verificación de la cadena de compilación propia: el repositorio es útil como referencia de cómo se estructura un paquete LLiMa completo (configuración, tokenizador, embeddings, ELF por capa) para equipos que preparen sus propios artefactos.

Advertencia transversal: la model card indica que la evaluación en runtime Modalix está pendiente, por lo que estos casos de uso son escenarios plausibles derivados de las características técnicas, no aplicaciones validadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente afirma que la compilación, la validación del archivo y el `llima-deploy` local se completaron correctamente, y que la evaluación en runtime Modalix está pendiente. No hay cifras de MMLU, HumanEval, GSM8K, MMMU ni de latencia, throughput o consumo energético.

## Requisitos de hardware

- Hardware objetivo: SiMa.ai Modalix, un SoC de inferencia en el borde. No es un artefacto pensado para GPU de centro de datos ni para tarjetas consumer.
- VRAM: no aplica. El despliegue se realiza sobre la memoria del SoC Modalix, no sobre VRAM de GPU.
- Huella de pesos estimada: a partir de 4B parámetros con la mayor parte en INT4 (grupo 256) y componentes en INT8 y BF16, el peso comprimido se sitúa aproximadamente en el rango de 2-2,5 GB. Es una estimación derivada del esquema de cuantización, no un dato publicado; el repositorio completo ocupa 8,3 GB porque incluye además activos de runtime, tokenizador, embeddings y 139 programas ELF.
- GPU recomendadas: no disponible / no aplicable. No se puede cargar con las herramientas habituales de GPU.
- Compatibilidad con GPU consumer: no. El repositorio no contiene safetensors ni GGUF, por lo que no es ejecutable directamente en una RTX 4090, RTX 3090 u similares.
- Opciones de despliegue: exclusivamente el runtime LLiMa sobre Modalix, mediante `llima run /ruta/al/repositorio` con la estructura de directorios intacta. No hay soporte documentado para vLLM, llama.cpp, Ollama, TGI, TensorRT-LLM ni ONNX Runtime.
- Requisito de instalación: es necesario descargar el repositorio completo preservando su jerarquía de carpetas y disponer de un runtime LLiMa compatible instalado en el dispositivo.
- Latencia y throughput: no disponibles. La evaluación en runtime está pendiente según la propia model card.
- Almacenamiento: 8,3 GB de repositorio.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para este artefacto, y los resultados de la búsqueda web no aportaron información sobre modelos comparables. La comparación siguiente es, por tanto, estructural (formato, destino, disponibilidad), no de calidad.

| Modelo / artefacto | Formato | Cuantización | Contexto | Hardware objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| florianvoss/Qwen3.5-4B-Autoround-a16w4-Modalix | ELF compilados + activos de runtime LLiMa | AutoRound INT4 (grupo 256), GPTQ INT4, RTN INT8, BF16 parcial | 4096 tokens | SiMa.ai Modalix | No disponible | 0 descargas, 0 likes |
| Qwen/Qwen3.5-4B (modelo base) | No disponible en la información proporcionada | No aplica (checkpoint sin cuantizar, presumiblemente) | No disponible | GPU genérica | No disponible | Referenciado como `base_model` |
| Cuantizaciones INT4 genéricas para GPU (AutoRound, GPTQ, AWQ) de modelos de 4B | safetensors / GGUF | INT4 con distintos tamaños de grupo | Depende del modelo base | GPU consumer y de centro de datos | Depende del modelo base | Amplia, pero sin datos concretos en la información disponible |
| Alternativas de visión-lenguaje en el borde del mismo orden de tamaño | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Ausencia total de evaluación: la model card reconoce explícitamente que la evaluación en runtime Modalix está pendiente. No hay ninguna cifra de calidad, latencia o consumo que respalde el uso en producción.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin señales de uso comunitario ni de validación independiente.
- Licencia no especificada: al no declararse licencia, no puede asumirse permiso para uso comercial. Es un riesgo legal relevante antes de cualquier despliegue empresarial.
- Dependencia de hardware propietario: solo se ejecuta sobre SiMa.ai Modalix con un runtime LLiMa compatible. No hay ruta alternativa a GPU o CPU documentada.
- Formato no portable: los pesos son programas ELF compilados, no un checkpoint Transformers. No se pueden convertir a GGUF ni cargar con bibliotecas estándar; tampoco se pueden inspeccionar ni ajustar con herramientas habituales.
- Contexto limitado a 4096 tokens: cualquier tarea que requiera documentos largos, historiales extensos o razonamiento con muchos pasos queda fuera del alcance de este artefacto, con independencia de lo que soporte el modelo base.
- Pérdida de precisión desconocida: se aplican cuatro esquemas de cuantización distintos (AutoRound INT4, GPTQ INT4, RTN INT8 y BF16 parcial). No se publica ninguna comparación frente al modelo en BF16, por lo que el deterioro de calidad es indeterminado.
- Riesgo de alucinación y sesgos: no evaluados ni documentados. Al no haber benchmarks ni análisis de sesgos, no pueden acotarse.
- Idiomas no declarados: se desconoce qué lenguas cubre realmente, lo que impide planificar despliegues multilingües.
- Trazabilidad del modelo base incompleta: los materiales proporcionados no enlazan documentación técnica, informe de entrenamiento ni repositorio oficial del modelo Qwen/Qwen3.5-4B, por lo que no es posible verificar desde esta ficha la arquitectura, los datos de entrenamiento ni la licencia del modelo subyacente.
- Detalles de visión parcialmente opacos: el codificador se empaqueta como ELF por capa y se cuantiza a INT8, pero no se documenta el modelo de visión subyacente ni su resolución nativa más allá de los 448 × 448.
- Resultados de búsqueda no concluyentes: las consultas web realizadas no devolvieron artículos, papers ni publicaciones relacionadas con este artefacto.

## Enlaces

- Repositorio del artefacto en HuggingFace: https://huggingface.co/florianvoss/Qwen3.5-4B-Autoround-a16w4-Modalix
- Modelo base referenciado en la model card: https://huggingface.co/Qwen/Qwen3.5-4B (identificador tomado del campo `base_model`; no verificado en la búsqueda)
- Papers: no disponible
- Blogs o notas técnicas: no disponible
- Repositorios de código: no disponible
- Demos: no disponible
