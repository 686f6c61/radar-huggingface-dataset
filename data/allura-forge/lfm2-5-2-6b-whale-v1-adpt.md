# allura-forge/LFM2.5-2.6B-WHALE-V1-adpt

## Resumen

Este repositorio contiene un adaptador LoRA (formato PEFT) generado mediante el método WHALE (Weight-projected, Harmless-anchored, Analytic, Low-rank residual Editing), una técnica de ablación dirigida que modifica selectivamente los pesos de un modelo base para eliminar o atenuar comportamientos no deseados. El adaptador se aplica sobre el modelo base LiquidAI/LFM2.5-2.6B, un modelo denso de 2.600 millones de parámetros con una ventana de contexto de 128.000 tokens y soporte nativo de tool calling, diseñado por Liquid AI para cargas de trabajo agénticas en dispositivos.

El adaptador fue creado con la herramienta `ablit` y edita 38 módulos del modelo base, empleando una configuración específica de dirección media, percentil objetivo y penalización de norma. Al tratarse de un adaptador LoRA, su tamaño es reducido (0,1 GB) y se integra sobre el modelo base para producir una variante "abliterada" que busca reducir respuestas dañinas o no deseadas manteniendo el resto de capacidades. La relevancia de este adaptador radica en ofrecer una alternativa de alineación ligera y de bajo coste computacional frente a métodos de fine-tuning completos, aunque su carácter experimental y la ausencia de documentación oficial limitan su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre modelo base denso Transformer (LFM2.5-2.6B) |
| Parametros totales | No disponible (adaptador; el modelo base tiene 2.600 millones) |
| Parametros activos | No disponible (adaptador LoRA, no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en fp32; el modelo base admite cuantizacion estandar) |
| Idiomas soportados | No disponible (el modelo base soporta multiples idiomas, pero no se especifica) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se genera mediante el metodo WHALE, una variante de ablacion de pesos que proyecta los pesos del modelo base en una direccion calculada a partir de la diferencia de medias entre respuestas "buenas" y "malas" (direction: mean_diff). La configuracion incluye un percentil objetivo de 0,9, un limite de rango de 64, un valor minimo de autovalor CSP de 0,5 y una fraccion de efecto causal de 0,95 con gating activado. El adaptador se guarda en modo lora-peft con 38 modulos editados y dtype fp32.

El modelo base, LFM2.5-2.6B, es un modelo denso (no MoE) entrenado por Liquid AI para tareas agénticas, con una ventana de contexto de 128K tokens y tool calling nativo. No se dispone de informacion detallada sobre el dataset de entrenamiento del adaptador ni sobre el proceso de entrenamiento del modelo base en esta ficha.

## Capacidades

- El adaptador hereda las capacidades del modelo base LFM2.5-2.6B, que incluyen generacion de texto, razonamiento multi-paso y soporte de tool calling / function calling.
- El modelo base esta optimizado para cargas de trabajo agénticas, lo que permite planificacion y ejecucion de tareas multi-paso en dispositivos.
- La ventana de contexto de 128K tokens facilita el manejo de conversaciones largas y documentos extensos.
- El adaptador WHALE esta disenado para reducir respuestas daninas o no deseadas, actuando como una capa de alineacion ligera.
- No se dispone de informacion sobre capacidades multimodales (vision, audio) ni sobre soporte de thinking mode explicito.

## Casos de uso

- Despliegue de agentes en dispositivos locales: el modelo base, con su contexto largo y tool calling, permite ejecutar agentes que planifican y llaman herramientas directamente en laptops o telefonos, manteniendo la privacidad de los datos. El adaptador anade una capa de seguridad adicional.
- Asistentes de codigo en entornos sin conexion: gracias al tool calling nativo, el modelo puede integrarse en IDEs o pipelines de CI/CD para generar, revisar o parchear codigo, con la ventaja de que el adaptador reduce respuestas potencialmente inseguras.
- Atencion al cliente automatizada: la ventana de 128K tokens permite gestionar historiales de conversacion largos y el adaptador ayuda a mantener un tono inofensivo y controlado.
- Analisis de documentos extensos: el contexto amplio permite resumir o extraer informacion de contratos, informes o articulos largos, con menor riesgo de generar contenido no deseado.
- Prototipado de investigacion en alineacion: el adaptador sirve como ejemplo de aplicacion del metodo WHALE, util para estudiar tecnicas de ablacion y su impacto en el comportamiento del modelo.
- Sistemas de recomendacion conversacional: el modelo puede mantener conversaciones contextuales y sugerir acciones, beneficiandose de la capa de seguridad del adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de rendimiento especificos para el adaptador ni comparaciones con otros modelos.

## Requisitos de hardware

- Al ser un adaptador LoRA, los requisitos de hardware son los del modelo base LFM2.5-2.6B mas el overhead del adaptador (0,1 GB en fp32).
- El modelo base, con 2.600 millones de parametros, puede ejecutarse en GPUs consumer con cuantizacion (por ejemplo, RTX 3060 o superior con 8-12 GB de VRAM) o en CPU con suficiente RAM.
- Segun Liquid AI, el modelo base alcanza 220 tokens por segundo en menos de 2,5 GB de memoria, lo que sugiere que es adecuado para dispositivos de gama media.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI, siempre que soporten la carga de adaptadores PEFT. No se confirma la compatibilidad especifica con estas herramientas.
- No se dispone de datos de latencia o throughput para el adaptador en particular.

## Comparativa con modelos similares

No disponible. No se han encontrado comparaciones publicas entre este adaptador y otros modelos o adaptadores de la misma categoria.

## Limitaciones y advertencias

- El adaptador es un artefacto experimental generado con una herramienta de terceros (ablit) y no cuenta con documentacion oficial de Liquid AI ni de allura-forge.
- No se especifica la licencia, lo que impide determinar si su uso comercial esta permitido.
- No se han publicado benchmarks ni evaluaciones de seguridad, por lo que no se puede garantizar la eficacia del metodo WHALE en este caso concreto.
- El metodo de ablacion puede introducir efectos colaterales imprevistos en otras capacidades del modelo, como la coherencia o la creatividad.
- El modelo base puede presentar sesgos o alucinaciones tipicos de los modelos de lenguaje; el adaptador no los elimina necesariamente.
- La ausencia de informacion sobre idiomas soportados limita su uso en aplicaciones multilingues.
- Para produccion, se recomienda validar exhaustivamente el comportamiento del adaptador en el dominio de aplicacion antes de desplegarlo.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/allura-forge/LFM2.5-2.6B-WHALE-V1-adpt
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Documentacion del modelo base: https://docs.liquid.ai/lfm/models/lfm25-2.6b
- Blog de Liquid AI sobre LFM2.5-2.6B: https://www.liquid.ai/blog/lfm2-5-2-6b
- Blog de Hugging Face sobre LFM2.5-2.6B: https://huggingface.co/blog/LiquidAI/lfm2-5-2-6b
- Herramienta ablit (referencia): https://code.allura.moe/FizzSlop/ablit
