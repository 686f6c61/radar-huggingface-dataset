# litert-community/functiongemma-270m-ft-mobile-actions

## Resumen

FunctionGemma 270M FT Mobile Actions es un ajuste fino (fine-tuning) del modelo google/functiongemma-270m-it, publicado por la comunidad litert-community. Se trata de un modelo especializado en la generacion de llamadas a funciones (function calling) orientado a acciones moviles, es decir, interpretar instrucciones en lenguaje natural y traducirlas a invocaciones estructuradas de APIs o acciones del sistema en dispositivos moviles. Con solo 270 millones de parametros, esta disenado para ejecutarse en el propio dispositivo (on-device), lo que lo hace adecuado para escenarios de privacidad y baja latencia donde no es viable enviar datos a la nube.

El modelo parte de la familia Gemma 3 de Google (tag gemma3) y hereda su arquitectura transformer. Su proposito es servir como motor de enrutamiento de intenciones y ejecucion de acciones en asistentes moviles, permitiendo que una aplicacion traduzca peticiones como "pon el modo avion" o "crea un recordatorio" en JSON estructurado que el sistema pueda ejecutar. La publicacion corre a cargo de litert-community, comunidad centrada en el ecosistema LiteRT (anteriormente TensorFlow Lite) para despliegue en dispositivos.

La relevancia actual del modelo radica en la tendencia hacia asistentes locales y agentes en el dispositivo, donde modelos pequenos y especializados superan a modelos generalistas gigantes en coste, latencia y privacidad. Al estar empaquetado en formato litert-lm y contar con pesos ajustados especificamente para acciones moviles, se posiciona como una pieza practica para desarrolladores de aplicaciones Android y entornos embebidos. El acceso esta restringido (gated) y requiere aceptar las condiciones de la licencia Gemma en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 3) |
| Parametros totales | 270 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato litert-lm; el repo ocupa 2.5 GB) |
| Idiomas soportados | no disponible |
| Licencia | Gemma (uso sujeto a los terminos de la licencia Gemma) |
| Formato de pesos | litert-lm (LiteRT LM); modelo base en safetensors segun el repositorio original |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint google/functiongemma-270m-it, que a su vez pertenece a la familia Gemma 3 de Google. Se trata de un transformer decoder-only de 270 millones de parametros, un tamano pensado para inferencia en dispositivos con recursos limitados. La especializacion del ajuste fino es la generacion de llamadas a funciones para acciones moviles, lo que implica que el entrenamiento se ha orientado a pares instruccion-accion con salidas estructuradas.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset de ajuste fino, ni sobre si se emplearon tecnicas de RLHF o DPO en esta version. El modelo base functiongemma-270m-it ya incorpora un ajuste de instrucciones (sufijo -it) orientado a function calling, y este fine-tuning comunitario lo especializa aun mas en el dominio de acciones de dispositivo movil. El empaquetado en formato litert-lm indica que el modelo ha sido convertido para su ejecucion con el runtime LiteRT LM, optimizado para aceleracion en hardware movil.

## Capacidades

- Generacion de texto y salidas estructuradas orientadas a function calling.
- Traduccion de instrucciones en lenguaje natural a invocaciones de funciones o acciones del sistema (por ejemplo, JSON con nombre de funcion y argumentos).
- Especializacion en acciones moviles: el ajuste fino apunta a comandos tipicos de un asistente de telefono.
- Soporte de tool calling / function calling como capacidad central del modelo.
- Capacidad de operar como motor de enrutamiento de intenciones en un pipeline de agente movil.
- Ejecucion on-device mediante el runtime LiteRT LM.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking, vision o audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente de voz en el dispositivo: el modelo recibe la transcripcion de la peticion del usuario y genera la llamada a funcion correspondiente (por ejemplo, activar el modo avion o ajustar el brillo) sin enviar datos a la nube, gracias a su tamano de 270M parametros que permite inferencia local.
- Automatizacion de tareas del sistema en Android: integrado mediante LiteRT LM, puede traducir comandos como "crea un recordatorio para manana" en la invocacion de la API de recordatorios con los argumentos correctos.
- Enrutamiento de intenciones en aplicaciones moviles: actua como clasificador-generador que decide que accion ejecutar dentro de la app a partir del texto del usuario, reduciendo la necesidad de logica manual de parsing.
- Control por voz de funciones del telefono en entornos sin conectividad: al ejecutarse on-device, mantiene la funcionalidad de comandos basicos aunque no haya red.
- Prototipado rapido de agentes moviles: los desarrolladores pueden usar el modelo como componente de function calling en un pipeline de agente, conectando sus salidas estructuradas a un ejecutor de acciones.
- Privacidad en asistentes personales: al no requerir envio de texto a servidores externos, es adecuado para aplicaciones que manejan datos sensibles del usuario y necesitan cumplir requisitos de privacidad.
- Integracion en aplicaciones de accesibilidad: permite a usuarios con movilidad reducida controlar funciones del dispositivo mediante lenguaje natural procesado localmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 270M parametros, la huella en memoria es reducida (del orden de cientos de MB segun cuantizacion), aunque el repo ocupa 2.5 GB.
- GPU recomendadas: no disponible. El modelo esta orientado a aceleracion movil (NPU/GPU integrada) mediante LiteRT LM.
- Cabe en GPU de consumo: si, por su tamano de 270M parametros es viable en GPUs de consumo, aunque no se especifican modelos concretos.
- Opciones de despliegue: runtime LiteRT LM (formato nativo del modelo). Otros runtimes como vLLM, llama.cpp u Ollama no estan confirmados en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| functiongemma-270m-ft-mobile-actions | 270M | no disponible | Gemma | Function calling para acciones moviles, on-device (LiteRT) |
| google/functiongemma-270m-it (modelo base) | 270M | no disponible | Gemma | Function calling general, ajuste de instrucciones |
| Gemma 3 de mayor tamano (familia) | no disponible en esta ficha | no disponible | Gemma | Modelos generalistas de mayor capacidad |

La comparacion con alternativas de otros fabricantes no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar el modelo.
- Licencia Gemma: el uso comercial y la redistribucion estan sujetos a los terminos de la licencia Gemma, que impone obligaciones y restricciones de uso aceptable.
- Tamano reducido (270M parametros): la capacidad de razonamiento general y de conocimiento del mundo es limitada en comparacion con modelos mayores; esta pensado para tareas acotadas de function calling.
- Riesgo de alucinacion en la generacion de argumentos o nombres de funciones, especialmente fuera del dominio de acciones moviles para el que fue ajustado.
- Idiomas soportados no documentados: no hay garantia de cobertura multilingue mas alla de lo que herede del modelo base.
- Longitud de contexto no disponible: no se puede planificar su uso en conversaciones de contexto largo sin verificacion previa.
- Especializacion estrecha: su rendimiento fuera del dominio de acciones moviles puede degradarse frente al modelo base.
- Dependencia del runtime LiteRT LM: el despliegue esta ligado a ese ecosistema, lo que puede limitar la portabilidad a otras infraestructuras.
- Datos de entrenamiento del fine-tuning no documentados: no se puede evaluar la composicion del dataset ni posibles sesgos introducidos en el ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/functiongemma-270m-ft-mobile-actions
- Modelo base: https://huggingface.co/google/functiongemma-270m-it
- LiteRT (ecosistema de despliegue): https://ai.google.dev/edge/litert
- Licencia Gemma: https://ai.google.dev/gemma/terms
