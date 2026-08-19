# CMSManhattan/JiRackUltra_1b

## Resumen

JiRack Ultra 1B es un modelo de lenguaje compacto de aproximadamente 1,78 mil millones de parámetros, desarrollado por CMSManhattan y publicado en HuggingFace en agosto de 2026. Está diseñado específicamente para inferencia eficiente en CPU, con una arquitectura ternaria (BitNet-style, 1.58 bits) que reduce drásticamente el uso de memoria y permite ejecutarse en hardware modesto, incluyendo ordenadores portátiles y sistemas embebidos. El modelo se presenta como una opción económica para despliegues en la nube y como experto en arquitecturas RAG.

El modelo incorpora un tokenizador ampliado con etiquetas especiales para routing, tool calling y robótica, lo que lo orienta hacia aplicaciones de agentes y automatización. Se distribuye con cuantizaciones GGUF listas para usar (Q2, Q3, Q4 y precisión completa) y una interfaz web integrada mediante contenedores Docker. Aunque la ficha de HuggingFace indica licencia MIT, la model card del autor especifica una licencia comercial de pago por usuario, una contradicción que conviene aclarar antes de su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ternario (BitNet-style) basado en DeepSeek R1 rediseñada |
| Parametros totales | 1.777.088.000 (~1,78 B) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q2_K, Q3_K_M, Q4_K_M, FP16 (full) |
| Idiomas soportados | en, zh, ja, ko, fr, es, pt, de, it, ru, ar, vi, th |
| Licencia | MIT (segun HuggingFace); comercial de pago ($12/usuario/año) segun model card |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

La arquitectura se describe como una version rediseñada de DeepSeek R1 con soporte nativo de pesos ternarios (valores en {-1, 0, +1}), siguiendo el enfoque BitNet. Esta eleccion reduce el tamaño del modelo en memoria y acelera la inferencia en CPU, ya que las operaciones ternarias pueden aprovechar instrucciones SIMD (AVX2/AVX-512) en procesadores modernos. El tokenizador ha sido ampliado con tokens especiales para routing, tool calling y robótica, lo que sugiere un entrenamiento o ajuste orientado a tareas de agente.

No se ha publicado informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas como RLHF o DPO. Tampoco se detalla el proceso de cuantizacion ternaria: el autor indica que las cuantizaciones GGUF actuales se generaron a partir del modelo FP16, y que la compresion ternaria adicional requiere un proceso de QAT (Quantization-Aware Training) personalizado bajo peticion.

## Capacidades

- Generacion de texto en 13 idiomas (incluidos ingles, chino, japones, coreano, frances, español, portugues, aleman, italiano, ruso, arabe, vietnamita y tailandes).
- Soporte de tool calling y function calling gracias a los tokens especiales del tokenizador.
- Capacidades de routing, orientadas a sistemas multi-agente o seleccion de expertos en arquitecturas RAG.
- Tokens especificos para robótica, lo que permite su integracion en pipelines de control o automatizacion.
- Inferencia eficiente en CPU sin necesidad de GPU, con cuantizaciones de 2 a 4 bits.
- Interfaz web integrada (JiRack UI) para interaccion conversacional.
- Compatibilidad con la API de Ollama (se menciona un cliente de escritorio para Windows).
- Despliegue mediante Docker con configuracion de hilos y memoria.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno en varios idiomas con un consumo de RAM inferior a 2 GB, lo que permite desplegarlo en servidores economicos o en maquinas virtuales de bajo coste.
- Agente de tool calling en pipelines de automatizacion: gracias a sus tokens especiales, puede invocar funciones externas (APIs, bases de datos) en entornos de integracion continua o flujos de trabajo empresariales.
- Sistema de routing en arquitecturas RAG: el modelo puede actuar como selector de expertos o router de consultas, dirigiendo cada peticion al modelo especializado adecuado dentro de un conjunto de modelos.
- Control de robots o automatizacion industrial: los tokens de robótica permiten generar comandos estructurados para sistemas embebidos, aunque la capacidad real depende del entrenamiento no documentado.
- Asistente conversacional en dispositivos edge: con cuantizacion Q2 (0,24 GB) puede ejecutarse en una Raspberry Pi o un portatil antiguo, ofreciendo un chatbot local sin conexion.
- Prototipado rapido de agentes en entornos de desarrollo: al ser ligero y ejecutable en CPU, los desarrolladores pueden iterar rapidamente sobre flujos de agente sin necesidad de infraestructura GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas estandar. La unica referencia de rendimiento es la tabla de "Expected Speed" de la model card, que califica la velocidad como "Excellent interactive" en CPUs de gama media (Ryzen 5 / Intel i5) con cuantizacion Q4, pero sin cifras concretas de tokens por segundo.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere VRAM, se ejecuta en RAM del sistema.
- RAM necesaria segun cuantizacion:
  - Q2_K: ~1,0 GB
  - Q3_K_M: ~1,2 GB
  - Q4_K_M: ~1,4 GB
  - Full (FP16): ~1,8 GB
- GPU recomendadas: ninguna, esta optimizado para CPU.
- CPUs recomendadas: Ryzen 5 / Intel i5 o superior para uso interactivo; CPUs de 4 nucleos o mas para modos de baja memoria.
- Opciones de despliegue: Docker (con imagenes oficiales), llama.cpp (por el formato GGUF), Ollama (compatible con el cliente de escritorio), y servidor ONNX Java para despliegues alternativos.
- Latencia y throughput: no se proporcionan cifras concretas; la model card indica "Excellent" en CPUs de gama media, pero sin datos medibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JiRack Ultra 1B | ~1,78 B | no disponible | Ternaria (BitNet) sobre DeepSeek R1 | MIT (HF) / comercial | HuggingFace, Docker |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32 K | Transformer denso | Apache 2.0 | HuggingFace, Ollama |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,54 B | 32 K | Transformer denso | MIT | HuggingFace |
| SmolLM2-1.7B | 1,71 B | 8 K | Transformer denso | Apache 2.0 | HuggingFace |

La comparativa se limita a caracteristicas publicas, ya que no hay benchmarks de JiRack. Los modelos alternativos ofrecen contexto documentado (32 K en Qwen y DeepSeek), mientras que JiRack no especifica su longitud de contexto. La ventaja de JiRack reside en su naturaleza ternaria y su enfoque en CPU, aunque los modelos densos de tamano similar tambien pueden ejecutarse en CPU con cuantizacion GGUF.

## Limitaciones y advertencias

- No se han publicado datos de entrenamiento, benchmarks ni evaluaciones independientes; el rendimiento real es desconocido.
- La licencia es ambigua: HuggingFace indica MIT, pero la model card exige una suscripcion comercial de $12 por usuario al año (o $3/mes para empresas). Usar el modelo en produccion sin licencia comercial puede violar los terminos del autor.
- El modelo parece ser un trabajo en desarrollo (creado en agosto de 2026, sin likes y con pocas descargas); la calidad y estabilidad no estan contrastadas.
- La longitud de contexto no esta documentada, lo que dificulta su uso en tareas que requieran ventanas largas.
- El tokenizador ampliado con tokens de routing, tool calling y robótica puede no estar bien entrenado, dado que no se detalla el proceso de ajuste.
- No se menciona soporte para vision, audio ni otras modalidades.
- El tamaño del repositorio (12,8 GB) sugiere que los pesos FP16 completos estan disponibles, pero las cuantizaciones GGUF son las recomendadas para uso en CPU.
- Riesgo de alucinacion y sesgos no evaluados al no haber documentacion de evaluacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CMSManhattan/JiRackUltra_1b
- Tokenizador asociado: https://huggingface.co/CMSManhattan/JiRackPrecisionTokenizer
- Cliente de escritorio JiRack (Windows, con API Ollama): https://huggingface.co/kgrabko/JiRackTernary_1b/resolve/main/jirack-chat.zip
- Contacto comercial: support@cmsmanhattan.com
