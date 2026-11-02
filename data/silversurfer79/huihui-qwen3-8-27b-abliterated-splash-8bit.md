# SilverSurfer79/Huihui-Qwen3.8-27B-abliterated-Splash-8bit

## Resumen
Este paquete es una distribución no oficial del modelo denso de 27B `huihui-ai/Huihui-Qwen3.8-27B-abliterated`, una variante "abliterated" (con las direcciones de rechazo suprimidas) del Qwen3.8-27B de Alibaba Cloud. SilverSurfer79 lo empaqueta en precisión de 8 bits (GGUF Q8_0, 29,0 GB) para el runtime Splash de LM Studio sobre Apple silicon, añadiendo decodificación especulativa DFlash2 de Inco AI y conservando la torre de visión del modelo original. Los pesos no han sido modificados: cada fichero es una copia byte a byte de su fuente.

El interés técnico está en la combinación de tres piezas poco habituales: un objetivo de 8 bits (el resto de builds Splash de este modelo usan 4 bits), un modelo borrador de difusión por bloques que propone varios tokens a la vez para que el modelo de 8 bits los verifique, y un contexto declarado de 262.144 tokens. Según el autor, en su Mac de pruebas respondió entre 1,2 y 2,8 veces más rápido que el GGUF Q6_K_L de huihui-ai en LM Studio (2,2x en preguntas sobre documentos, 2,8x en código), con una puntuación dentro de dos preguntas de diferencia en cada prueba.

Es relevante ahora porque demuestra que la decodificación especulativa con borradores de difusión puede aplicarse a pesos de 8 bits sin degradar la salida (el borrador cambia la velocidad, no el resultado) y porque ofrece una vía de inferencia local de un modelo de 27B con visión en hardware de consumo Apple, un segmento donde las opciones de alta precisión eran escasas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido: Gated DeltaNet + atención (Qwen3.8), con torre de visión |
| Parámetros totales | 27.320.697.856 (27,3B) |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (probado a 98.304) |
| Tipos de cuantización | 8 bits, GGUF Q8_0 (29,0 GB); el repo incluye también safetensors |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF (Q8_0) |
| Decodificación especulativa | DFlash2 (borrador de difusión por bloques de Inco AI) |
| Tamaño del paquete | 34,8 GB |
| Runtime | LM Studio con runtime Splash (Apple silicon) |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento
El modelo base es un transformer denso de 27,3B parámetros con una arquitectura híbrida que combina capas Gated DeltaNet con atención, según la descripción del autor. La variante abliterated de huihui-ai suprime las direcciones de rechazo del modelo original mediante modificación de pesos, sin reentrenamiento adicional declarado. La torre de visión del Qwen3.8 original se mantiene intacta tras la abliteración, de ahí que el pipeline sea image-text-to-text.

Sobre esa base, este paquete añade un modelo borrador DFlash2 de Inco AI que propone varios tokens por paso para que el modelo de 8 bits los verifique en paralelo, acelerando la generación sin alterar la distribución de salida. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original; la model card no los detalla. El autor declara explícitamente que no se modificó ningún peso y que el paquete es independiente y no está respaldado por huihui-ai, Inco AI, LM Studio, Alibaba Cloud ni Unsloth.

## Capacidades
- Generación de texto conversacional multi-turno con ventana de 262.144 tokens.
- Razonamiento con modo de pensamiento configurable mediante `reasoning_effort` (`low`, `medium`, `xhigh`).
- Comprensión de imágenes (image-text-to-text) gracias a la torre de visión de Qwen3.8.
- Generación de código, JSON y argumentos de llamadas a herramientas; el autor recomienda desactivar repeat penalty y presence penalty precisamente para no dañar estas salidas.
- Soporte de tool calling y function calling a través del servidor compatible con OpenAI de LM Studio.
- Razonamiento multi-paso y matemáticas; el autor indica que los problemas de matemáticas consumieron hasta 32K tokens de salida.
- Capacidades multilingües limitadas: la model card solo declara inglés (`en`).
- Salida sin censura por la abliteración del modelo base.
- Procesamiento por lotes de hasta 4 secuencias en paralelo en el motor Splash.

## Casos de uso
- Asistente local sobre documentos largos: con 262.144 tokens de contexto y un rendimiento 2,2x superior al Q6_K_L en preguntas sobre documentos, permite cargar contratos, informes o manuales completos y consultarlos en un Mac de 48 GB o más.
- Generación de código en local: el modo `low` con temperatura 0,6 y top_p 0,95 está pensado para código y tool calling, y el autor reporta 2,8x de aceleración frente al Q6_K_L en tareas de código, lo que lo hace viable para iterar en un portátil Apple sin GPU dedicada.
- Automatización de agentes con function calling: el servidor OpenAI-compatible de LM Studio acepta `reasoning_effort` por petición, de modo que se puede orquestar un agente que use `low` para pasos rutinarios y `xhigh` para los de razonamiento.
- Análisis de imágenes con texto: al conservar la torre de visión, sirve para describir capturas, extraer datos de documentos escaneados o responder preguntas sobre diagramas en un flujo local.
- RAG sobre corpus técnicos: la ventana de 98K tokens probada admite inyectar muchos fragmentos recuperados sin truncar, y la recomendación de desactivar penalizaciones protege la fidelidad de documentos estructurados.
- Investigación sobre alineación y censura: la variante abliterated permite estudiar el comportamiento del modelo sin los mecanismos de rechazo, en un entorno controlado y con licencia Apache 2.0.
- Prototipado de matemáticas y ciencia: el perfil de máxima calidad (`xhigh`, temperatura 1,0) con al menos 32K tokens de salida está indicado para problemas de razonamiento prolongado.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K) en la información disponible. El autor solo reporta comparativas internas de velocidad y acierto frente al GGUF Q6_K_L de huihui-ai en LM Studio:

| Métrica | Resultado declarado |
|---|---|
| Aceleración global | 1,2x - 2,8x frente a Q6_K_L |
| Preguntas sobre documentos | 2,2x |
| Código | 2,8x |
| Diferencia de acierto | dentro de 2 preguntas en cada prueba |
| Ahorro de tokens con `low` vs `xhigh` | 27% menos tokens en el mismo problema de matemáticas |

## Requisitos de hardware
- VRAM/memoria unificada: unos 35 GB para el modelo a contexto de 32K; se recomienda un Mac de 48 GB o superior.
- Hardware obligatorio: Apple silicon M3 o posterior, con macOS 26.4 o superior (requisitos del runtime Splash).
- No cabe en GPU de consumo con VRAM dedicada convencional (RTX 4090 de 24 GB, por ejemplo); está diseñado para memoria unificada de Apple.
- Software: LM Studio 0.4.28 (probado) con runtime Splash 1.3.0 instalado y seleccionado en Settings → Runtime.
- Despliegue: descarga desde el buscador de LM Studio o mediante `hf download`; carga con `lms load`. El servidor local expone una API compatible con OpenAI en `http://localhost:1234/v1`.
- Paralelismo: hasta 4 peticiones simultáneas por el batching del motor Splash.
- Latencia y throughput: no se publican tokens por segundo absolutos; solo los factores de aceleración relativos indicados arriba.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión | Runtime | Licencia |
|---|---|---|---|---|---|
| Este paquete (Splash 8-bit) | 27,3B | 262.144 | Q8_0 + DFlash2 | LM Studio / Splash, Apple silicon | Apache 2.0 |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated (Q6_K_L) | 27,3B | 262.144 | 6 bits | LM Studio (GGUF estándar) | Apache 2.0 |
| Otros builds Splash de Qwen3.8-27B abliterated | 27,3B | 262.144 | 4 bits | LM Studio / Splash, Apple silicon | Apache 2.0 |
| Qwen3.8-27B original (Alibaba Cloud) | 27,3B | 262.144 | variable | múltiples | no disponible en la información |

La diferencia principal frente al Q6_K_L es la precisión (8 bits frente a 6) y la decodificación especulativa, que según el autor aporta la aceleración sin cambiar las respuestas. Frente a los builds Splash de 4 bits, este mantiene los pesos de 8 bits a costa de un paquete de 34,8 GB.

## Limitaciones y advertencias
- Modelo abliterated: se han suprimido los mecanismos de rechazo, por lo que puede generar contenido que el Qwen3.8 original declinaría; requiere filtros y políticas de uso en producción.
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible; al derivar del Qwen3.8 original, hereda los suyos sin que el autor los caracterice.
- Riesgo de alucinación: no cuantificado; el modo `xhigh` con hasta 32K tokens de pensamiento aumenta la latencia y el coste, no necesariamente la fiabilidad.
- Idioma: la model card solo declara inglés; el rendimiento en castellano no está verificado.
- Licencia Apache 2.0 permite uso comercial, pero el paquete es no oficial y no está respaldado por los titulares de los modelos base ni del runtime.
- Dependencia de hardware y software muy específicos: Apple silicon M3+, macOS 26.4+ y runtime Splash; no es portable a CUDA, ROCm ni llama.cpp estándar.
- El paquete ocupa 34,8 GB y necesita unos 35 GB de memoria a 32K de contexto; con contexto mayor los requisitos crecen.
- El ajuste `reasoning_effort` no está expuesto en la ventana de chat de LM Studio para paquetes Splash: las conversaciones usan `xhigh` por defecto salvo que se llame al servidor OpenAI-compatible.
- Las cifras de aceleración proceden de un único Mac de pruebas del autor y no de una evaluación independiente.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/SilverSurfer79/Huihui-Qwen3.8-27B-abliterated-Splash-8bit
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios o demos adicionales de Inco AI (Splash, DFlash2), LM Studio o Alibaba Cloud.
