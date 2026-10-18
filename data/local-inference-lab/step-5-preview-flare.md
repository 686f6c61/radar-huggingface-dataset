# local-inference-lab/Step-5-Preview-FLARE

## Resumen

Step-5-Preview-FLARE es un paquete de ejecución preparado («prepared runtime package») para el modelo multimodal Step-5 Preview de StepFun, publicado por local-inference-lab para una vista previa comunitaria de Flare, un runtime de inferencia nativo en Rust. No es un modelo nuevo ni un fine-tune: es un empaquetado de los pesos del modelo base `stepfun-ai/Step-5-Preview-NVFP4` junto con kernels CUDA compilados y grafos de ejecución capturados, optimizado para exprimir una configuración de hardware muy concreta. El autor lo etiqueta explícitamente como «alpha-quality».

La relevancia técnica está en la receta de cuantización y en el motor de serving: expertos enrutados en NVFP4, proyecciones gate/up en MXFP8, caché KV en FP8, atención sparse de ventana deslizante con regiones comprimidas, entrada de imágenes y decodificación especulativa mediante predicción multi-token (MTP) causal. El artefacto resultante es un único `.safetensors` firmado que solo puede cargarse con Flare; no funciona con Transformers, vLLM, SGLang ni llama.cpp.

El paquete ocupa aproximadamente 350,1 GB y está preparado para cuatro GPU NVIDIA RTX PRO 6000 Blackwell de 96 GB en un solo host, con paralelismo tensorial de cuatro vías, hasta 16 peticiones concurrentes y un límite de secuencia preparado de 466.048 tokens. No se han publicado en la información disponible ni el número de parámetros, ni los idiomas soportados, ni resultados de benchmarks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con expertos enrutados; atención sparse de ventana deslizante y de región comprimida (backbone y número de capas no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 466.048 tokens de límite de secuencia preparado; el contexto efectivo depende de la VRAM disponible para almacenar la caché KV |
| Tipos de cuantizacion | NVFP4 (expertos enrutados), MXFP8 (proyecciones gate/up), FP8 (caché KV) |
| Idiomas soportados | no disponible |
| Licencia | stepfun-model-license-1.0 (etiquetada como `other` en HuggingFace) |
| Formato de pesos | `.safetensors` firmado con kernels CUDA y grafos de ejecución embebidos (`step5-tp4-mtp3-c16-fp8kv-signed.safetensors`); requiere el runtime Flare |
| Entrada multimodal | image-text-to-text; hasta 4 imágenes por petición |
| Paralelismo | Tensor parallelism de 4 vías (`gb202`) |
| Concurrencia maxima | 16 peticiones simultáneas |
| Decodificacion especulativa | MTP causal, hasta 3 tokens draft por ronda |
| Tamano del repositorio | 350,1 GB (prever al menos 360 GB de disco libre) |
| Temperatura / top-p / top-k por defecto | 1.0 / 0.95 / desactivado |

## Arquitectura y entrenamiento

El paquete se apoya en una arquitectura de mezcla de expertos con enrutamiento: la model card menciona explícitamente «NVFP4 routed experts» y distingue las proyecciones gate/up, lo que implica un bloque MoE con expertos compartidos y enrutados. La atención no es densa estándar: Flare implementa soporte para «sliding-window and compressed-region sparse attention», es decir, ventanas deslizantes combinadas con regiones de contexto comprimidas, un esquema habitual para sostener ventanas de cientos de miles de tokens sin que la caché KV crezca de forma cuadrática. Sobre esa base se añade predicción multi-token (MTP) causal para decodificación especulativa, con hasta tres tokens borrador por ronda.

No hay información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otras fases de alineación; esos datos corresponden al modelo base Step-5 Preview de StepFun y no se incluyen en este repositorio. La innovación diferencial del paquete es de despliegue, no de entrenamiento: el ajuste de kernels y la captura de grafos se realizan durante la fase de preparación, de modo que el serving se ejecuta en el runtime nativo de Flare «sin Python ni compilación en tiempo de ejecución». Se incluyen además opciones de caché de prefijo en disco (por ejemplo, 100 GiB retenidos) para reutilizar estado de prompt y conversación entre peticiones.

## Capacidades

- Generación de texto y razonamiento de propósito general sobre un modelo multimodal (pipeline `image-text-to-text`).
- Comprensión de imágenes: hasta cuatro imágenes por petición, combinables con texto en el mismo contexto.
- Ventana de contexto muy extensa: hasta 466.048 tokens de secuencia preparada, útil para documentos y conversaciones de gran longitud.
- Conversación multi-turno con estado reutilizable mediante caché de prefijo en GPU y, opcionalmente, en disco.
- Decodificación especulativa MTP integrada en el runtime, transparente para el cliente de la API.
- Serving HTTP local (puerto 8000 en el ejemplo de Docker) a través del runtime Flare.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas explícitamente en la información disponible.
- Idiomas soportados: no disponible.

## Casos de uso

- Análisis de expedientes y contratos de gran longitud: con 466.048 tokens de límite de secuencia, el modelo puede ingerir varios documentos completos junto con anexos en una sola petición sin troceado agresivo ni pérdida de referencias cruzadas entre cláusulas.
- Atención al cliente con soporte visual: el pipeline image-text-to-text permite adjuntar hasta cuatro imágenes por consulta (capturas de pantalla, fotos de producto, tickets escaneados) y responder en el mismo turno conversacional.
- Revisión de documentación técnica con diagramas: manuales, planos y esquemas acompañados de texto se procesan conjuntamente, lo que encaja en tareas de extracción de especificaciones o detección de inconsistencias entre figura y descripción.
- Back-office documental on-premise: al ejecutarse íntegramente en hardware propio mediante Flare en Docker, encaja en organizaciones que no pueden enviar documentos a APIs externas por requisitos regulatorios o de soberanía del dato.
- Asistentes de accesibilidad y QA visual de interfaces: análisis de capturas de UI para describir pantallas, detectar elementos mal etiquetados o generar guiones de prueba a partir de imágenes.
- Investigación y revisión bibliográfica: resumen y comparación de corpus extensos (varios papers o informes) en una única ventana, con reutilización de prefijo para iterar preguntas sobre el mismo conjunto sin recomputar.
- Evaluación de infraestructura de serving: banco de pruebas para medir decodificación especulativa MTP, paralelismo tensorial de 4 vías y caching de prefijo en disco sobre Blackwell, con hasta 16 peticiones concurrentes.
- Prototipado de producto multimodal en un solo host: al fijar una configuración de hardware concreta (4× RTX PRO 6000), sirve como entorno reproducible para validar latencias antes de escalar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card únicamente declara parámetros de serving: hasta 16 peticiones concurrentes, hasta 3 tokens draft MTP por ronda, hasta 4 imágenes por petición y un límite de secuencia de 466.048 tokens. No se aportan cifras de latencia, throughput (tokens/s) ni resultados de MMLU, HumanEval, GSM8K u otras evaluaciones. Para datos de evaluación del modelo subyacente, el autor remite a la sección de notas de evaluación de la model card de Step-5.

## Requisitos de hardware

- VRAM: configuración de referencia de 4 GPU NVIDIA RTX PRO 6000 Blackwell con 96 GB cada una (384 GB en total) en un único host. El paquete no está preparado para otras configuraciones.
- Almacenamiento: aproximadamente 350,1 GB para los pesos; se recomiendan al menos 360 GB libres. La caché de prefijo en disco es adicional y desactivada por defecto (el ejemplo permite 100 GiB).
- GPU consumer: no cabe. Tarjetas de 24-48 GB (RTX 4090, RTX 5090, L40S) quedan muy lejos de los 384 GB requeridos y el paquete no soporta tensor parallelism distinto de 4 ni otros perfiles.
- Opciones de despliegue: exclusivamente el runtime Flare (imagen Docker `ghcr.io/local-inference-lab/flare:latest` o binario `flare` en el host). No es compatible con vLLM, SGLang, TGI, llama.cpp, Ollama ni Transformers.
- Paralelismo y acceso a GPU: las cuatro GPU deben estar disponibles para el contenedor y se seleccionan con `--gpus '"device=0,1,2,3"'`; el runtime usa índices locales del contenedor.
- Memoria del host: el ejemplo de Docker recomienda `--ulimit memlock=-1:-1`; no se especifica RAM del sistema ni requisitos de CPU.
- Latencia y throughput: no disponibles. Los únicos límites publicados son de concurrencia (16 peticiones) y de tokens draft especulativos (3 por ronda).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| local-inference-lab/Step-5-Preview-FLARE | no disponible | 466.048 tokens (límite preparado) | `.safetensors` firmado, solo Flare | stepfun-model-license-1.0 | HuggingFace, 0 descargas, 3 likes |
| stepfun-ai/Step-5-Preview-NVFP4 (modelo base) | no disponible | no disponible | Pesos NVFP4 para el ecosistema del modelo base | stepfun-model-license-1.0 | HuggingFace |
| stepfun-ai/Step-5-Preview (modelo original) | no disponible | no disponible | Pesos originales | stepfun-model-license-1.0 | HuggingFace |

No se han identificado en la información disponible alternativas de terceros comparables en tamaño, contexto o tarea con datos verificables; la comparación se limita a las tres variantes de la familia Step-5 Preview. La diferencia práctica entre ellas es el formato de distribución y el runtime: solo la variante FLARE incluye kernels compilados y grafos capturados, y solo esta exige hardware Blackwell de 96 GB en configuración de cuatro GPU.

## Limitaciones y advertencias

- Calidad alpha: el propio autor califica el paquete como «alpha-quality» y destinado a una vista previa comunitaria; no es apto para producción sin validación previa.
- Bloqueo de runtime: los pesos no se pueden cargar con Transformers, vLLM, SGLang ni llama.cpp. Migrar a otro motor exige volver al modelo base y reconstruir la cuantización.
- Dependencia de hardware única: solo existe revisión `gb202` para 4× RTX PRO 6000 Blackwell de 96 GB. No hay perfil para A100, H100 ni GPU consumer, lo que limita el despliegue a clústeres con ese modelo exacto.
- Contexto condicionado por VRAM: los 466.048 tokens son un límite preparado, no garantizado; el contexto real depende de la memoria libre para caché KV en FP8.
- Límites de serving: 16 peticiones concurrentes y 4 imágenes por petición son techos del paquete, no del modelo en abstracto.
- Idiomas: no disponibles; no se puede confirmar cobertura multilingüe ni calidad por idioma.
- Tool calling y comportamiento agéntico: no documentados; no conviene asumirlos en el diseño de una integración.
- Riesgo de alucinación y sesgos: no se aporta ninguna información sobre evaluación de sesgos, filtros de seguridad o tasas de alucinación. Al ser un modelo base empaquetado, hereda los riesgos del Step-5 Preview original, que no se detallan aquí.
- Licencia: `stepfun-model-license-1.0`, marcada como `other`. No se incluye el texto en este repositorio (se enlaza al del modelo base); es imprescindible revisarlo antes de cualquier uso comercial, ya que las condiciones de redistribución y uso comercial no están disponibles en la información proporcionada.
- Integridad y confianza: el artefacto es un `.safetensors` firmado y el runtime usa un `--trust-store`; la ejecución de kernels y grafos precompilados implica confiar en el binario distribuido por el autor.
- Operación: requiere `io_uring` para la caché de prefijo en disco y montajes persistentes; un mal dimensionamiento del disco puede provocar fallos de escritura en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/local-inference-lab/Step-5-Preview-FLARE
- Modelo base en HuggingFace: https://huggingface.co/stepfun-ai/Step-5-Preview-NVFP4
- Notas de evaluación del modelo Step-5: https://huggingface.co/stepfun-ai/Step-5-Preview-NVFP4#evaluation-notes
- Licencia (stepfun-model-license-1.0): https://huggingface.co/stepfun-ai/Step-5-Preview/blob/main/LICENSE.txt
- Imagen Docker del runtime Flare: https://ghcr.io/local-inference-lab/flare
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; todas las fuentes útiles proceden de la model card y de los enlaces anteriores.
