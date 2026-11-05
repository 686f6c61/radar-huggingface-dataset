# OxBee/Clover-35B-A3B-Preview

## Resumen

Clover-35B-A3B-Preview es el primer modelo publicado por DiffuSpace y se presenta como un modelo de lenguaje de difusión (diffusion language model) de código abierto con un backbone de mezcla de expertos (MoE) de 35.000 millones de parámetros totales y aproximadamente 3.000 millones activos por token. Deriva del modelo Qwen3.6-35B-A3B, del que conserva la arquitectura híbrida Gated DeltaNet (GDN) y atención completa, con 40 capas, 256 expertos enrutados, enrutamiento top-8 y un experto compartido por capa. Su propuesta diferencial es la generación por difusión de bloques con decodificación LowConfidence, en lugar de la generación autorregresiva token a token.

El modelo incorpora atención bidireccional de bloque, que permite a los tokens atender dentro de un bloque ruidoso preservando un prefijo causal, y una ventana de contexto de 128K tokens (131.072 en total entre prompt y respuesta). Está pensado para generación de texto, razonamiento y flujos agénticos, y su model card reporta resultados destacados frente a otros modelos de difusión de código abierto en los benchmarks publicados en el blog de lanzamiento.

Su relevancia actual radica en que explora una alternativa práctica a la decodificación autorregresiva dentro del ecosistema de modelos abiertos, con pesos en safetensors, licencia Apache 2.0 y soporte de backends de inferencia propios (SGLang y llama.cpp) para decodificación autoespeculativa. Es un modelo en estado de preview, con 129 descargas en el momento de la consulta y sin likes, lo que sugiere una adopción todavía incipiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido Gated DeltaNet (GDN) / atención completa, con difusión de bloques |
| Parametros totales | 34.661.350.848 (aproximadamente 34,7B) |
| Parametros activos | Aproximadamente 3B por token (top-8 de 256 expertos enrutados + 1 experto compartido por capa) |
| Longitud de contexto | 128K (131.072 tokens entre prompt y respuesta) |
| Tipos de cuantizacion | No disponible (la model card solo documenta BF16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (aproximadamente 69 GB en BF16), código custom con `trust_remote_code` |

## Arquitectura y entrenamiento

Clover es un modelo solo de texto derivado de Qwen3.6-35B-A3B. Mantiene el backbone MoE con 40 capas, 256 expertos enrutados con enrutamiento top-8 y un experto compartido por capa, combinando capas Gated DeltaNet con capas de atención completa. Sobre esa base añade atención bidireccional de bloque mediante parámetros GDN aprendidos adicionales, incluidas ponderaciones de convolución derecha y controles de softmax, de forma que los tokens pueden atender dentro de un bloque ruidoso sin romper el prefijo causal.

La generación es por difusión de bloques: cada bloque comienza con tokens enmascarados y se resuelven en paralelo las posiciones con confianza suficiente. Si ninguna posición supera el umbral, se rellena la más confiable para garantizar progreso; una vez resuelto, el bloque pasa a formar parte del prefijo del siguiente. Los valores por defecto son `block_size=32` y `threshold=0.95`. El modelo incorpora además selección de expertos a nivel de bloque durante el desenrutado (`moe_block_coreset_enabled=true`, `moe_block_coreset_top_p=0.9`), que agrega las puntuaciones de enrutamiento de los top-8 candidatos de cada token y restringe el enrutamiento a un subconjunto compartido de expertos por bloque. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional con plantilla de chat y modo de pensamiento activable mediante `enable_thinking=True`.
- Razonamiento multi-paso con fases de pensamiento explícitas delimitadas por etiquetas `</think>`, con control gradual para cerrar la fase de razonamiento.
- Generación por difusión de bloques con decodificación paralela de posiciones de alta confianza, lo que puede reducir el número de pasos de decodificación frente a la generación autorregresiva.
- Contexto largo de hasta 128K tokens, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- Decodificación autoespeculativa mediante implementaciones propias en SGLang y llama.cpp.
- Control de repetición y sesgos de finalización configurables (`presence_penalty`, `repetition_penalty`, `dllm_length_penalty`, `dllm_think_end_bias`).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles; el modelo es solo de texto.
- Idiomas soportados: no disponible en la información proporcionada.

## Casos de uso

- Generación de documentación técnica extensa: con 128K tokens de contexto, el modelo puede recibir un repositorio o una especificación completa y producir documentación coherente en una sola pasada, aprovechando la resolución paralela de bloques para acelerar la salida.
- Asistentes conversacionales de contexto largo: la ventana de 128K permite mantener historiales de conversación prolongados y documentación de referencia simultánea sin truncamientos agresivos.
- Razonamiento con modo de pensamiento: tareas de análisis que requieren cadenas de razonamiento explícitas pueden beneficiarse del modo `enable_thinking` y de los controles de cierre de la fase de pensamiento.
- Investigación en modelos de difusión: el modelo sirve como banco de pruebas para estudiar decodificación por difusión de bloques, decodificación LowConfidence y selección de expertos a nivel de bloque en cargas de trabajo reales.
- Despliegue en infraestructura con GPUs de gama alta: al requerir aproximadamente 69 GB en BF16, encaja en servidores con A100 80 GB o H100, y puede servirse con los backends oficiales de SGLang y llama.cpp.
- Evaluación comparativa de decodificación autoespeculativa: los backends propios permiten medir latencia y throughput frente a implementaciones autorregresivas del modelo base Qwen3.6-35B-A3B.
- Generación de contenido con control de repetición: los parámetros por defecto de penalización y sesgo de finalización están pensados para generaciones largas, útil en tareas de redacción extensa donde la repetición es un problema habitual.

## Benchmarks y rendimiento

La model card no incluye cifras numéricas de benchmarks; remite a la discusión de benchmarks del blog de lanzamiento (https://diffuspace.ai/blog/clover-35b/#agentic-benchmarks), donde se presentan resultados agénticos, ajustes de evaluación y comparaciones. No se han publicado resultados numéricos de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 69 GB solo para los pesos, más el estado de inferencia (la model card recomienda una GPU con memoria suficiente para los pesos BF16 y el estado adicional).
- GPU recomendadas: A100 80 GB, H100 80 GB u otras GPUs con 80 GB o más de memoria para BF16.
- GPU de consumo: no cabe en GPUs de consumo de 24 GB (RTX 4090) en BF16; no se documentan cuantizaciones que permitan reducir el requisito.
- Opciones de despliegue: Transformers 5.19.0 con PyTorch 2.10 o superior y `trust_remote_code=True`; backends oficiales en SGLang y llama.cpp para decodificación autoespeculativa.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Clover-35B-A3B-Preview | 34,7B | Aproximadamente 3B | 128K | Apache 2.0 | Safetensors |
| Qwen3.6-35B-A3B (modelo base) | 35B (aproximado) | Aproximadamente 3B | No disponible en la información | No disponible en la información | No disponible en la información |
| Otros modelos de difusión de código abierto | No disponible | No disponible | No disponible | No disponible | No disponible |

La model card afirma un rendimiento state-of-the-art entre los modelos de difusión de código abierto en los benchmarks reportados en el blog de lanzamiento, pero no se proporcionan cifras ni nombres de modelos comparables en la información disponible.

## Limitaciones y advertencias

- Modelo en estado preview: la propia denominación indica que no es una versión final y puede cambiar.
- Generaciones muy largas pueden volverse repetitivas; el modelo incluye controles de repetición y sesgos de finalización activados por defecto para mitigarlo, pero son controles suaves y no garantizan ausencia de repetición.
- Las solicitudes que superan el límite de 128K se rechazan, incluido el espacio necesario para resolver el último bloque completo.
- La model card no documenta sesgos conocidos, composición del dataset de entrenamiento ni evaluación de riesgos de alucinación.
- Idiomas soportados no documentados; no se puede garantizar un rendimiento multilingüe homogéneo.
- Licencia Apache 2.0: permite uso comercial, pero el modelo deriva de Qwen3.6-35B-A3B y el usuario debe verificar las condiciones aplicables al modelo base.
- Requiere `trust_remote_code=True` y código custom, lo que implica ejecutar código del autor y revisar su procedencia antes de usarlo en producción.
- Dependencia de versiones concretas de Transformers (5.19.0) y PyTorch (2.10 o superior), lo que puede complicar la integración en entornos existentes.
- No se documentan cuantizaciones, lo que limita el despliegue en hardware de menor capacidad.

## Enlaces

- Hugging Face: https://huggingface.co/OxBee/Clover-35B-A3B-Preview
- Hugging Face (según la model card): https://huggingface.co/Diffuspace/Clover-35B-A3B-Preview
- Blog de lanzamiento: https://diffuspace.ai/blog/clover-35b/
- Benchmarks agénticos: https://diffuspace.ai/blog/clover-35b/#agentic-benchmarks
- Repositorio de código y backends de inferencia: https://github.com/DiffuSpace/Clover-35B-A3B-Preview
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Sitio de DiffuSpace: https://diffuspace.ai/
