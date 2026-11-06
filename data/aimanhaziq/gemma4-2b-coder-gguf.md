# aimanhaziq/gemma4-2b-coder-GGUF

## Resumen

Gemma 4 2B Coder (GGUF) es una versión cuantizada en formato GGUF del modelo `aimanhaziq/gemma4-2b-coder`, publicado por el usuario aimanhaziq en Hugging Face. Se trata de un modelo de generación de texto especializado en tareas de programación, con foco en tres dominios concretos: manifiestos de Kubernetes orientados a producción (Deployments, StatefulSets, Ingress, CRDs), Rust asíncrono idiomático (Tokio, Axum, patrones de ownership) y backends de APIs web en TypeScript.

La motivación del proyecto es ofrecer inferencia local y en el borde con recursos mínimos: la cuantización Q4_K_M reduce el modelo a unos 1,8 GB de archivo y un consumo pico aproximado de 2,5 GB de memoria, lo que lo hace viable en portátiles, dispositivos macOS con Metal, máquinas virtuales modestas en la nube e incluso entornos móviles. El modelo base se ha ajustado por instrucciones usando la plantilla Alpaca, y el repositorio incluye instrucciones listas para ejecutarlo con Ollama, llama.cpp, LM Studio y Open-WebUI.

Es relevante como opción ligera para desarrolladores DevOps y backend que necesitan asistencia de código sin depender de servicios en la nube, aunque conviene tener en cuenta que se trata de un modelo comunitario sin documentación exhaustiva sobre el proceso de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Google Gemma 4 (transformer, decoder-only) |
| Parametros totales | 4.628.569.635 (dato de safetensors; el autor lo comercializa como "2B efectivo") |
| Parametros activos | no disponible (no hay evidencia de que sea MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | Q4_K_M (4-bit Medium) |
| Idiomas soportados | Inglés |
| Licencia | Gemma |
| Formato de pesos | GGUF (el modelo base está disponible en safetensors) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia Gemma 4 de Google. El repositorio no detalla el número de tokens de preentrenamiento ni la composición del dataset original, pero sí indica que el ajuste por instrucciones se realizó con la plantilla Alpaca (`### Instruction:`, `### Input:`, `### Response:`), lo que sugiere un fine-tuning supervisado de tipo instruction tuning sobre dominios de código: Kubernetes, Rust asíncrono y TypeScript. No hay información sobre RLHF ni DPO.

La cuantización a GGUF se realizó con la toolchain de llama.cpp, mediante `convert_hf_to_gguf.py` seguido de `llama-quantize`. Se eligió Q4_K_M por su equilibrio entre precisión (conserva mayor precisión en las capas de atención) y tamaño reducido (~1,8 GB). El contexto nativo soportado es de 8k tokens, y el Modelfile de Ollama recomienda una temperatura de 0,2 y top_p de 0,95, valores típicos para generación de código determinista.

## Capacidades

- Generación de manifiestos de Kubernetes listos para producción: Deployments, StatefulSets, Ingress y CRDs, incluyendo ejemplos como NetworkPolicies restrictivas.
- Generación de Rust asíncrono idiomático con Tokio y Axum, respetando patrones de ownership del lenguaje.
- Generación de backends de APIs web en TypeScript.
- Formato de instrucción Alpaca, compatible con flujos de instruction-following estándar.
- Ejecución local y offline mediante llama.cpp, Ollama, LM Studio y Open-WebUI.
- Servidor compatible con la API de OpenAI a través de `llama-server`.
- No hay información disponible sobre tool calling, agentes, capacidades multimodales (visión o audio) ni modo de razonamiento extendido.

## Casos de uso

- Asistente DevOps local: generar y revisar manifiestos de Kubernetes (Deployments, StatefulSets, Ingress, CRDs) sin enviar código propietario a servicios externos, aprovechando los 8k de contexto para ficheros YAML completos.
- Desarrollo de servicios en Rust: redactar funciones asíncronas con Tokio, por ejemplo consultas a endpoints de métricas de Kubernetes, con sugerencias respetuosas con el borrow checker.
- Construcción de backends TypeScript: scaffolding de APIs web y controladores de rutas con plantillas repetitivas.
- Autocompletado y generación de código en portátiles: con ~2,5 GB de memoria pico, funciona en equipos sin GPU dedicada mediante CPU o Metal en macOS.
- Integración en entornos de desarrollo locales: servir el modelo vía `llama-server` con API compatible con OpenAI para conectarlo a editores o extensiones tipo copiloto autoalojadas.
- Documentación de infraestructura: generar NetworkPolicies, límites de recursos y configuraciones de seguridad a partir de descripciones en lenguaje natural.
- Despliegue en el borde: dado su tamaño reducido, es candidato para ejecución en VMs de bajo coste o dispositivos edge donde no se justifica un modelo de 7B o superior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: ~2,5 GB pico con el archivo Q4_K_M de ~1,8 GB; puede ejecutarse íntegramente en CPU sin GPU dedicada.
- GPUs recomendadas: cualquier GPU moderna con 4 GB o más de VRAM es suficiente; en macOS se puede usar aceleración Metal. No se requieren A100 ni H100.
- Consumer GPUs: cabe sobradamente en GPUs como una RTX 3060 de 8 GB, RTX 4060 o incluso integradas con memoria compartida; con `-ngl 99` se descargan todas las capas a GPU.
- Opciones de despliegue: llama.cpp (`llama-cli` y `llama-server`), Ollama (con Modelfile incluido en la model card), LM Studio y Open-WebUI.
- Parámetros de generación recomendados: temperatura 0,2, top_p 0,95, contexto de 8.192 tokens. No hay datos de latencia o throughput publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Especializacion |
|---|---|---|---|---|---|
| aimanhaziq/gemma4-2b-coder-GGUF | ~2B efectivo (4,6B en safetensors) | 8.192 | Gemma | GGUF (Q4_K_M) | Kubernetes, Rust, TypeScript |
| Qwen2.5-Coder-1.5B-Instruct | 1,5B | hasta 128k | Qwen (uso comercial permitido con condiciones) | safetensors, GGUF | Codigo multilenguaje |
| StarCoder2-3B | 3B | 16.384 | BigCode OpenRAIL-M | safetensors, GGUF | Rellenado de codigo (FIM), 80+ lenguajes |
| CodeGemma-2B (Google) | 2B | 8.192 | Gemma | safetensors, GGUF | Codigo general y FIM |

Frente a las alternativas, este modelo destaca por su especialización vertical en Kubernetes y Rust asíncrono, poco habitual en modelos de su tamaño, pero carece de benchmarks publicados y su licencia Gemma impone condiciones de uso que no aplican a alternativas como Qwen2.5-Coder.

## Limitaciones y advertencias

- Licencia Gemma: su uso está sujeto a los términos de Google (Gemma Terms of Use), que incluyen restricciones y prohibiciones de uso; no es tan permisiva como licencias Apache 2.0 o MIT para todos los escenarios comerciales.
- Idioma: el modelo está orientado al inglés; el rendimiento en castellano no está documentado.
- Riesgo de alucinación: al ser un modelo pequeño de 2B ajustado por la comunidad, puede generar manifiestos de Kubernetes o código Rust con errores sutiles; se recomienda siempre validación con `kubectl apply --dry-run`, `cargo check` o linters antes de usar las salidas en producción.
- Sin benchmarks publicados: no hay forma objetiva de comparar su calidad con modelos equivalentes; la evaluación depende del usuario.
- Discrepancia de tamaño: la model card lo denomina "2B efectivo" pero los safetensors reportan 4.628.569.635 parámetros; conviene verificar qué versión se descarga realmente.
- Contexto limitado a 8k tokens, insuficiente para repositorios grandes o ficheros muy extensos.
- Popularidad muy baja (192 descargas y 1 like en el momento de la ficha), lo que implica escaso testeo por la comunidad y posible falta de mantenimiento.
- No hay información sobre tool calling, agentes ni capacidades multimodales.

## Enlaces

- Modelo GGUF: https://huggingface.co/aimanhaziq/gemma4-2b-coder-GGUF
- Modelo base: https://huggingface.co/aimanhaziq/gemma4-2b-coder
- No se han encontrado enlaces a papers, blogs de anuncio ni demos en la informacion disponible.
