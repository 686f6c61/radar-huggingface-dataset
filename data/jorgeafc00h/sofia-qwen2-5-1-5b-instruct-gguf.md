# jorgeafc00h/sofia-qwen2.5-1.5b-instruct-gguf

## Resumen

Sofia Qwen2.5 1.5B Instruct es un ajuste fino (fine-tune) de tipo LoRA del modelo Qwen/Qwen2.5-1.5B-Instruct, desarrollado por el usuario jorgeafc00h. El modelo incorpora una persona ficticia llamada Sofia, descrita como una acompanante adulta de 24 anos, y se distribuye unicamente en formato GGUF cuantizado a Q4_K_M para su uso con llama.cpp. No se trata de un modelo de proposito general nuevo, sino de una adaptacion de personaje sobre una base ya existente.

La relevancia tecnica de esta ficha es limitada: el modelo cuenta con 1.543.714.304 parametros (1,5B), hereda la arquitectura transformer densa de la familia Qwen2.5 y esta pensado para inferencia local en dispositivos con recursos modestos. El repositorio ocupa 1,0 GB y contiene un unico archivo de pesos cuantizado de 986.048.064 bytes.

El ajuste se realizo con un conjunto de datos muy reducido (418 conversaciones de entrenamiento y 47 de validacion), lo que condiciona fuertemente su calidad y su capacidad de generalizacion. La licencia es Apache-2.0, tanto para la base como para el derivado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2.5) |
| Parametros totales | 1.543.714.304 (1,5B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-1.5B-Instruct, no confirmada en esta ficha) |
| Tipos de cuantizacion | Q4_K_M (unica cuantizacion publicada) |
| Idiomas soportados | en (ingles, segun la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer denso decoder-only de la familia Qwen2.5. Sobre esa base se aplico un ajuste fino supervisado con LoRA de rango 16, alpha 32, dropout 0,05, dos epocas y una tasa de aprendizaje de 0,0002. El adaptador resultante se fusiono con los pesos base, se exporto a GGUF y se cuantizo a Q4_K_M.

El conjunto de entrenamiento consta de 418 conversaciones, con 47 conversaciones reservadas para validacion. La evaluacion local previa a la cuantizacion registro una perdida (loss) en validacion que descendio de 2,920 a 2,107. Ademas, en 16 sondas adicionales de un solo turno, 15 superaron las comprobaciones heuristicas definidas por el proyecto. El autor advierte explicitamente que estas evaluaciones son pequenas y especificas del proyecto, y que no constituyen garantias de rendimiento general ni de seguridad.

## Capacidades

- Generacion de texto conversacional en ingles, con la persona "Sofia" inyectada mediante ajuste fino.
- Mantenimiento de conversaciones multi-turno (limitado por el contexto heredado de la base y por la calidad del ajuste).
- Capacidad potencial de tool calling y function calling heredada de Qwen2.5-1.5B-Instruct, no verificada ni documentada en esta variante.
- Capacidades multilingues teoricas heredadas de la base, aunque la model card solo declara ingles.
- No incluye capacidades de vision, audio ni activos de imagen o personaje 3D (el autor lo indica expresamente).
- No se documenta un modo de razonamiento explicito (thinking mode) en esta variante.

## Casos de uso

- Prototipado de asistentes conversacionales con persona definida: permite experimentar con un personaje concreto en local sin depender de servicios en la nube, usando llama.cpp y la plantilla de chat de Qwen.
- Inferencia en dispositivos con recursos limitados: el archivo Q4_K_M de aproximadamente 986 MB puede ejecutarse en equipos modestos o moviles, segun el runtime compatible con llama.cpp.
- Pruebas de integracion en aplicaciones de acompanamiento: el autor menciona una app "Sofia" que aporta su propio mensaje de sistema y controles de contenido; el modelo sirve como componente de generacion dentro de esa arquitectura.
- Experimentacion con ajuste fino de bajo coste: el caso sirve como ejemplo reproducible de LoRA sobre un modelo de 1,5B con un dataset pequeno, util para investigadores que estudien el efecto de datos escasos en la personalidad del modelo.
- Evaluacion de controles de contenido y limites de persona: util para medir como un modelo pequeno responde a instrucciones de personaje y donde falla (el autor reporta un caso de limite fallido y una sonda de identidad fallida).
- Demostraciones offline y entornos sin conectividad: al ser un GGUF local, puede desplegarse en escenarios sin acceso a red, siempre que se verifiquen integridad y licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor solo reporta metricas internas del proyecto:

| Metrica | Valor |
|---|---|
| Loss en validacion (pre-cuantizacion) | 2,920 -> 2,107 |
| Sondas heuristicas de un solo turno | 15 de 16 superadas |
| Conversaciones de entrenamiento | 418 |
| Conversaciones de validacion | 47 |

Estos datos no son comparables con benchmarks publicos y no garantizan rendimiento general.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1-1,5 GB adicionales al runtime, dado el tamano del archivo Q4_K_M (986 MB) y los buffers de contexto de llama.cpp.
- GPU recomendadas: cualquier GPU consumer con al menos 2-4 GB de VRAM libre; tambien puede ejecutarse en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna (por ejemplo, GTX 1650, RTX 3060, RTX 4090) e incluso en CPU.
- Opciones de despliegue: llama.cpp (libreria declarada), y runtimes compatibles con GGUF como Ollama o servidores basados en llama.cpp. No se documenta soporte para vLLM o TGI en esta variante.
- Latencia y throughput: no disponibles; el autor indica que el rendimiento en dispositivo requiere validacion en la app y que no se certifica rendimiento de descarga ni inferencia en iPhone.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Sofia Qwen2.5 1.5B Instruct (este) | 1,5B | no disponible | GGUF Q4_K_M | Apache-2.0 | Fine-tune de persona con dataset muy pequeno |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | no disponible en esta ficha | safetensors, GGUF (upstream) | Apache-2.0 | Modelo base generalista, ampliamente evaluado |
| Otros fine-tunes de persona sobre modelos ~1,5B | variable | variable | variable | variable | No disponible comparativa especifica verificada |

La comparacion directa con alternativas de la misma categoria (fine-tunes de persona de ~1,5B) no esta disponible en la informacion proporcionada. Frente a su base, la diferencia principal es la persona inyectada y la cuantizacion fija, no una mejora de capacidades generales.

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido (418 conversaciones): alto riesgo de sobreajuste a la persona y baja generalizacion.
- El autor reconoce que el modelo puede generar respuestas inexactas o inapropiadas y fallar al seguir instrucciones de persona o de contenido.
- La evaluacion interna encontro un caso de limite fallido y una sonda de identidad fallida; la cuantizacion puede alterar los resultados.
- Solo se declara soporte de ingles; el rendimiento en castellano no esta documentado.
- Los pesos no reproducen por si solos el comportamiento completo de la app: los controles de contenido y el mensaje de sistema son externos al modelo.
- No incluye activos de imagen ni 3D; no debe esperarse capacidad multimodal.
- Licencia Apache-2.0 permite uso comercial, pero el contenido de persona y los controles de contenido son responsabilidad del integrador.
- El autor recomienda fijar el commit del repositorio y verificar tamano y SHA-256 antes de instalar; conviene mantener la descarga fuera de copias de seguridad del dispositivo.
- No hay certificacion de rendimiento en dispositivos moviles ni de descarga fisica en iPhone.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jorgeafc00h/sofia-qwen2.5-1.5b-instruct-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Documentacion de llama.cpp: no disponible en la informacion proporcionada
- Paper o blog del autor: no disponible en la informacion proporcionada
- Demo o aplicacion "Sofia": no disponible en la informacion proporcionada
