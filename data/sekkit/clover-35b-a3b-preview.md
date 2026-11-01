# sekkit/Clover-35B-A3B-Preview

## Resumen

Clover-35B-A3B-Preview es el primer modelo publicado por DiffuSpace y se presenta como un modelo de lenguaje de difusión de código abierto para generación de texto. Se construye sobre el backbone de Qwen3.6-35B-A3B, un transformer MoE híbrido con Gated DeltaNet (GDN) y atención completa, del que hereda los 35B parámetros totales (34.661.350.848 según los safetensors) y aproximadamente 3B parámetros activos por token. La innovación principal es el uso de difusión por bloques (block diffusion) con decodificación LowConfidence, que sustituye la generación autorregresiva token a token por la resolución paralela de bloques de tokens enmascarados.

El modelo mantiene una ventana de contexto de 128K tokens (131.072) y añade atención bidireccional por bloques mediante parámetros GDN aprendidos adicionales, preservando un prefijo causal. La implementación de HuggingFace resuelve cada bloque de 32 tokens con un umbral de confianza de 0,95, y el repositorio oficial incluye backends de decodificación especulativa propia para SGLang y llama.cpp.

Es relevante ahora porque explora una alternativa práctica a la generación autorregresiva en modelos MoE de escala media, con soporte declarado de tool calling y modo thinking, y porque su licencia Apache 2.0 facilita la experimentación y el uso comercial. No obstante, la información pública disponible es todavía escasa: no hay datos de benchmarks en la model card más allá de una imagen externa, no se detallan idiomas soportados y el modelo se encuentra en estado Preview.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido Gated DeltaNet (GDN) / atención completa, con difusión por bloques; 40 capas, 256 expertos enrutados, top-8 por token y un experto compartido por capa |
| Parametros totales | 34.661.350.848 (aproximadamente 35B) |
| Parametros activos | Aproximadamente 3B por token |
| Longitud de contexto | 131.072 tokens (128K), incluyendo prompt y respuesta generada |
| Tipos de cuantizacion | No disponible (el ejemplo oficial usa BF16; el repositorio incluye backends para llama.cpp, lo que sugiere soporte GGUF, pero no se detalla) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (aproximadamente 69 GB en BF16) |

## Arquitectura y entrenamiento

Clover deriva de Qwen3.6-35B-A3B y conserva su backbone MoE híbrido: 40 capas con 256 expertos enrutados, enrutamiento top-8 por token y un experto compartido por capa, combinando capas Gated DeltaNet con capas de atención completa. Sobre esa base se añaden parámetros GDN aprendidos, incluyendo pesos de convolución derecha y controles softmax, que permiten atención bidireccional dentro de un bloque ruidoso manteniendo un prefijo causal. La generación es de difusión por bloques: cada bloque comienza con tokens enmascarados y las posiciones con confianza superior al umbral se resuelven en paralelo; si ninguna supera el umbral, se rellena la más confiable para garantizar progreso. Los valores por defecto son `block_size=32` y `threshold=0.95`.

El modelo incorpora además un mecanismo de selección de expertos a nivel de bloque durante el denoising (`moe_block_coreset_enabled=true`, `moe_block_coreset_top_p=0.9`), que agrega las puntuaciones de enrutamiento de los candidatos top-8 de cada token en el bloque y restringe el enrutamiento a un subconjunto compartido de expertos, reduciendo el número de expertos distintos activados por bloque. También incluye controles de generación para mitigar repeticiones en generaciones largas: `presence_penalty=0.9`, `repetition_penalty=1.05`, `dllm_length_penalty=10.0` y `dllm_think_end_bias=10.0`, con ventanas de activación a partir de 8192 y 4096 tokens respectivamente. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO.

## Capacidades

- Generación de texto conversacional con plantilla de chat y soporte de modo thinking (`enable_thinking=True`).
- Razonamiento multi-paso, con cierre del bloque de pensamiento controlado mediante sesgos graduales hacia `</think>`.
- Tool calling y function calling: la model card menciona benchmarks agénticos y el modelo base Qwen3.6-35B-A3B es compatible con estos formatos, aunque no se detalla la implementación específica en Clover.
- Capacidades agénticas y razonamiento multi-paso, evaluadas en los benchmarks agénticos del blog de lanzamiento.
- Generación con contexto largo de hasta 128K tokens.
- Decodificación especulativa propia mediante los backends de SGLang y llama.cpp del repositorio oficial.
- Control de repetición y de longitud de respuesta mediante parámetros de generación configurables.
- Modelo solo de texto: no se declaran capacidades de visión ni audio.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Atención al cliente automatizada: el modelo puede mantener conversaciones multi-turno con hasta 128K tokens de contexto, lo que permite incluir historiales extensos, documentación de producto y políticas internas en el mismo prompt sin truncar.
- Generación de código en producción: con soporte declarado de tool calling y modo thinking, puede integrarse en pipelines de CI/CD para revisión de parches, generación de tests y explicación de errores, aprovechando la decodificación por bloques para reducir latencia en respuestas largas.
- Agentes autónomos con razonamiento multi-paso: los benchmarks agénticos del lanzamiento y el modo thinking lo orientan a tareas de planificación y ejecución de herramientas en cadenas de varios pasos.
- Procesamiento de documentos largos: resumen, extracción de entidades y respuesta sobre contratos, informes o expedientes de hasta 128K tokens, con la ventaja de que la difusión por bloques permite resolver posiciones de forma paralela.
- Asistentes de investigación técnica: análisis de papers, generación de notas estructuradas y comparativas con contexto extenso, usando el modo thinking para razonamiento explícito antes de responder.
- Experimentación en investigación sobre modelos de difusión: al ser un modelo de difusión de código abierto con licencia Apache 2.0, sirve como base para estudiar decodificación paralela, selección de expertos por bloque y decodificación especulativa en entornos académicos e industriales.
- Despliegue en entornos con llama.cpp: el repositorio oficial incluye un backend para llama.cpp, lo que facilita la inferencia en infraestructura sin dependencia exclusiva de GPUs de datacenter, aunque el tamaño en BF16 exige recursos considerables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a una imagen y a la discusión del blog de lanzamiento (`https://diffuspace.ai/blog/clover-35b/#agentic-benchmarks`) para resultados, ajustes y comparaciones, pero no incluye cifras textuales que puedan reproducirse en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 69 GB solo para los pesos, más el estado de inferencia; se recomienda una GPU con memoria suficiente para superar esa cifra.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; por capacidad de memoria, el ejemplo oficial apunta a GPUs de datacenter con al menos 80 GB (A100 80GB, H100 80GB) o configuraciones multi-GPU.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) en BF16; sería necesaria cuantización, cuyos formatos no se detallan en la información disponible.
- Opciones de despliegue: Transformers 5.19.0 o superior con PyTorch 2.10 o superior y `trust_remote_code=True`; el repositorio oficial incluye backends para SGLang y llama.cpp con decodificación especulativa propia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Clover-35B-A3B-Preview | 34,7B | Aproximadamente 3B | 128K | Apache 2.0 | Difusión por bloques con decodificación LowConfidence |
| Qwen3.6-35B-A3B (modelo base) | 35B | Aproximadamente 3B | No disponible en la información proporcionada | No disponible en la información proporcionada | Backbone MoE híbrido GDN / atención completa del que deriva Clover |
| Alternativas de difusión de texto de escala similar | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables en la información proporcionada |

## Limitaciones y advertencias

- Modelo en estado Preview: la model card no garantiza estabilidad de API, comportamiento ni resultados en producción.
- Riesgo de repetición en generaciones muy largas, reconocido explícitamente por el autor; se mitiga con penalizaciones configuradas por defecto, pero son controles suaves y no eliminan el problema.
- Riesgo de alucinación: no se documentan evaluaciones de fidelidad factual ni tasas de alucinación.
- Idiomas soportados no declarados: no puede asumirse un rendimiento multilingüe homogéneo.
- Contexto máximo estricto: las peticiones que superen los 128K tokens se rechazan, incluyendo el espacio necesario para resolver el último bloque completo.
- Dependencia de código personalizado: requiere `trust_remote_code=True` y versiones específicas de Transformers (5.19.0) y PyTorch (2.10 o superior), lo que limita la portabilidad.
- Licencia Apache 2.0: permite uso comercial, pero el modelo deriva de Qwen3.6-35B-A3B y conviene verificar las condiciones del modelo base y de los datos de entrenamiento, no detalladas en la información disponible.
- Sin datos publicados de benchmarks en la model card: las afirmaciones de rendimiento remiten a material externo no verificable en esta ficha.
- Sesgos conocidos: no documentados en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sekkit/Clover-35B-A3B-Preview
- Modelo en HuggingFace (organización DiffuSpace, según la model card): https://huggingface.co/Diffuspace/Clover-35B-A3B-Preview
- Blog de lanzamiento: https://diffuspace.ai/blog/clover-35b/
- Repositorio de código y backends de inferencia: https://github.com/DiffuSpace/Clover-35B-A3B-Preview
- Sitio de DiffuSpace: https://diffuspace.ai/
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
