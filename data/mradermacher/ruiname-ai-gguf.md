# mradermacher/ruiname-AI-GGUF

## Resumen

`mradermacher/ruiname-AI-GGUF` es una coleccion de cuantizaciones estaticas en formato GGUF del modelo `ruiname/ruiname-AI`, publicada por el usuario mradermacher. El modelo original es un ajuste fino de tipo persona construido sobre la familia LiquidAI LFM2.5, segun indican las etiquetas de la model card (`lfm2.5`, `persona`) y el enlace de licencia, que apunta al modelo `LiquidAI/LFM2.5-1.2B-JP-202606`. Con 1.304.558.336 parametros, se trata de un modelo pequeno orientado a conversacion y caracterizacion de personaje, con soporte declarado unicamente para japones.

La relevancia de esta publicacion es practica: el autor original distribuye pesos en formato transformers, y mradermacher aporta las versiones GGUF necesarias para ejecutar el modelo con llama.cpp y herramientas derivadas (Ollama, LM Studio, etc.) en hardware modesto. El rango de cuantizaciones va de Q2_K (0,6 GB) a f16 (2,7 GB), lo que permite desplegarlo en equipos de consumo sin GPU dedicada de gama alta.

No se dispone de informacion publica sobre el proceso de entrenamiento, la composicion del dataset ni resultados de evaluacion del modelo original. La model card del repositorio GGUF es exclusivamente la plantilla estandar de mradermacher para cuantizaciones, sin documentacion adicional del autor del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `lfm2.5`, derivada de la familia LiquidAI LFM2.5) |
| Parametros totales | 1.304.558.336 (1,3 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | japones (ja) |
| Licencia | lfm1.0 (Liquid AI License 1.0, via `LiquidAI/LFM2.5-1.2B-JP-202606`) |
| Formato de pesos | GGUF (transformers en el modelo base) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo original en la documentacion disponible. Las etiquetas indican que pertenece a la familia LFM2.5 de LiquidAI y que se trata de un ajuste fino de tipo persona (`persona`), lo que sugiere un entrenamiento orientado a mantener un personaje conversacional consistente. El modelo base del que deriva es `LiquidAI/LFM2.5-1.2B-JP-202606`, segun el enlace de licencia de la model card.

Tampoco hay datos disponibles sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni sobre innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, etc.). El repositorio GGUF unicamente documenta el proceso de cuantizacion: cuantizaciones estaticas de tipo 2 (`quantize_version: 2`), con conversion desde pesos transformers (`convert_type: hf`) y cuantizacion de tensores de salida (`output_tensor_quantised: 1`). El autor senala que no tiene previsto publicar cuantizaciones ponderadas con imatrix salvo peticion explicita en la seccion de discusiones de la comunidad.

## Capacidades

- Generacion de texto conversacional en japones, con un sesgo declarado hacia la interpretacion de un personaje concreto (etiqueta `persona`).
- Conversacion multi-turno, segun la etiqueta `conversational` del repositorio.
- Compatibilidad con endpoints de inferencia (`endpoints_compatible`), lo que permite servirlo mediante APIs compatibles con el formato de Hugging Face.
- Ejecucion local mediante llama.cpp y derivados gracias a las cuantizaciones GGUF.
- No hay evidencia de soporte de tool calling, function calling, razonamiento multi-paso, agentes, vision, audio ni modo de pensamiento.
- Capacidades multilingues limitadas al japones segun el campo `language` de la model card; no se declara soporte de castellano ni de ingles.

## Casos de uso

- Chatbot de personaje en japones para aplicaciones de entretenimiento: el modelo esta ajustado explicitamente como `persona`, por lo que encaja en asistentes virtuales con personalidad definida, juegos de rol textuales o compania conversacional en japones.
- Despliegue en hardware de consumo: con cuantizaciones de 0,6 a 1,5 GB, puede ejecutarse en portatiles sin GPU dedicada mediante llama.cpp u Ollama, lo que facilita prototipos y demos locales.
- Integracion en aplicaciones de escritorio o moviles con LM Studio: el formato GGUF y el tamano reducido permiten empaquetar el modelo en clientes de escritorio que necesitan inferencia offline.
- Prototipado rapido de interfaces conversacionales en japones: al ser un modelo de 1,3 B, la latencia en CPU es baja y permite iterar sobre prompts y flujos de dialogo sin coste de API.
- Investigacion sobre ajuste de persona: sirve como caso de estudio de como un modelo pequeno de la familia LFM2.5 se comporta tras un fine-tuning orientado a personaje, comparando con el modelo base.
- Filtrado o generacion de respuestas en pipelines de contenido japones: puede usarse como generador auxiliar en tareas de respuesta corta donde no se requiera alta precision factual, siempre con supervision humana.
- Servicio de inferencia via endpoints compatibles: al declararse `endpoints_compatible`, puede desplegarse en infraestructuras que consumen modelos con API estilo Hugging Face para entornos de prueba.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB para Q4_K_M (0,9 GB de pesos) y hasta unos 3 GB para f16 (2,7 GB), incluyendo overhead de contexto y cache KV.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente; tarjetas como RTX 3060, RTX 4060, RTX 4090 o A100 pueden ejecutarlo con holgura, aunque el modelo esta claramente sobredimensionado para GPU de gama alta.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas, e incluso en iGPU con memoria unificada compartida.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF; el modelo base en formato transformers puede servirse con vLLM o TGI, aunque el repositorio aqui descrito solo contiene GGUF.
- Latencia y throughput estimados: no disponibles. Por el tamano (1,3 B) se espera una generacion fluida en CPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ruiname-AI (este modelo) | 1,3 B | no disponible | ja | lfm1.0 | GGUF, transformers |
| LiquidAI LFM2.5-1.2B-JP-202606 (base) | ~1,2 B | no disponible | ja | lfm1.0 | transformers |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32.768 tokens | multilingue | Apache 2.0 | safetensors, GGUF |
| Llama 3.2 1B Instruct | 1,2 B | 128.000 tokens | multilingue | Llama 3.2 Community License | safetensors, GGUF |

La comparativa con Qwen2.5-1.5B-Instruct y Llama 3.2 1B se ofrece como referencia de categoria (modelos densos de ~1-1,5 B), no como equivalencia funcional: ambos son modelos generalistas multilingues, mientras que ruiname-AI esta especializado en persona y limitado al japones. No hay datos de rendimiento comparativo disponibles para ruiname-AI.

## Limitaciones y advertencias

- El modelo solo declara soporte de japones; su uso en castellano u otros idiomas no esta garantizado y probablemente produzca resultados degradados.
- Al ser un ajuste fino de persona, puede generar respuestas fuera de tono o inconsistentes fuera del personaje para el que fue entrenado.
- Riesgo de alucinacion: no hay datos de evaluacion de factualidad; en un modelo de 1,3 B especializado en conversacion, la precision factual es limitada.
- No se dispone de informacion sobre sesgos del dataset de entrenamiento ni sobre filtros de seguridad aplicados.
- La licencia lfm1.0 (Liquid AI License 1.0) impone restricciones que deben revisarse antes de cualquier uso comercial; no es una licencia permisiva tipo Apache o MIT.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la model card no documenta el modelo original; se recomienda validar el comportamiento antes de usarlo en produccion.
- El autor de las cuantizaciones advierte que las versiones Q2_K y Q3_K_M tienen calidad reducida; para uso real se recomienda Q4_K_M o superior.
- No hay cuantizaciones ponderadas con imatrix disponibles, lo que puede afectar ligeramente a la perplejidad en cuantizaciones bajas frente a alternativas optimizadas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/ruiname-AI-GGUF
- Modelo base: https://huggingface.co/ruiname/ruiname-AI
- Modelo LiquidAI de referencia para la licencia: https://huggingface.co/LiquidAI/LFM2.5-1.2B-JP-202606
- Licencia LFM1.0: https://huggingface.co/LiquidAI/LFM2.5-1.2B-JP-202606/blob/main/LICENSE
- Pagina de descargas del autor: https://hf.tst.eu/model#ruiname-AI-GGUF
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
