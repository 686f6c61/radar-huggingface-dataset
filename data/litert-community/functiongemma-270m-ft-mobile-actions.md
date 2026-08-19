# litert-community/functiongemma-270m-ft-mobile-actions

## Resumen

FunctionGemma 270M FT Mobile Actions es un modelo de lenguaje de 270 millones de parámetros, desarrollado por la comunidad de LiteRT (litert-community), que parte del modelo base `google/functiongemma-270m-it` y ha sido afinado específicamente para ejecutar acciones móviles. El modelo traduce instrucciones en lenguaje natural a llamadas a funciones que pueden ejecutarse directamente en dispositivos Android e iOS mediante el runtime LiteRT, lo que permite integrar asistentes y automatizaciones sin depender de la nube.

Su relevancia radica en que combina un tamaño muy reducido con una especialización clara: el function calling orientado a tareas móviles. Al estar optimizado para inferencia on-device, ofrece una alternativa práctica para desarrolladores que necesitan procesamiento de lenguaje natural local con baja latencia y sin conexión. La arquitectura hereda el diseño de Gemma 3, con una ventana de contexto estándar para su categoría, aunque no se han publicado especificaciones detalladas en la documentación disponible.

El acceso al modelo está restringido (gated) y requiere aceptar la licencia Gemma de Google, lo que limita su uso a desarrolladores que cumplan las condiciones establecidas. A pesar de su tamaño, el modelo está pensado para un caso de uso muy concreto: la automatización de acciones en el teléfono, por lo que no debe considerarse un modelo generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Gemma 3) |
| Parametros totales | 270 millones |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (referencia a BF16 en documentacion externa) |
| Idiomas soportados | no disponible |
| Licencia | Gemma (licencia de Google, requiere aceptacion) |
| Formato de pesos | no disponible (repo de 0.9 GB, probablemente safetensors o LiteRT) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `google/functiongemma-270m-it`, que a su vez se basa en la arquitectura Gemma 3 de Google. Se trata de un transformer decoder-only con 270 millones de parámetros, entrenado originalmente para function calling, es decir, para convertir solicitudes en lenguaje natural en llamadas a funciones estructuradas. El fine-tune adicional se ha realizado con un dataset de acciones móviles (Mobile Actions), que incluye ejemplos de comandos como abrir aplicaciones, enviar mensajes, configurar alarmas o reproducir contenido, entre otros.

No se han publicado detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el método de ajuste (por ejemplo, si se usó RLHF o DPO). La optimización para LiteRT sugiere que el modelo se ha cuantizado o convertido para ejecutarse eficientemente en dispositivos móviles, aunque no se especifica el formato exacto de los pesos. La innovación principal no reside en la arquitectura, sino en la especialización del fine-tune para un dominio concreto y en su integración con el ecosistema LiteRT.

## Capacidades

- Generacion de texto y llamadas a funciones (function calling) a partir de instrucciones en lenguaje natural.
- Ejecucion de acciones moviles: traduccion de comandos como "abre la camara", "envia un mensaje a Maria" o "pon una alarma a las 7" a llamadas de API estructuradas.
- Inferencia on-device mediante LiteRT, compatible con Android e iOS, sin necesidad de conexion a internet.
- Optimizado para baja latencia y bajo consumo de recursos, adecuado para entornos con memoria limitada.
- Soporte para integracion en aplicaciones moviles a traves de la API de LiteRT.
- Capacidades multilingues: no disponibles (no se ha publicado informacion al respecto).

## Casos de uso

- Asistentes de voz locales: integrar el modelo en una app de asistente personal que procese comandos de voz sin enviar datos a la nube, garantizando privacidad y funcionamiento sin conexion.
- Automatizacion de tareas recurrentes: configurar rutinas como "al llegar a casa, enciende la luz y reproduce musica" mediante llamadas a funciones del sistema operativo o de apps instaladas.
- Accesibilidad: ayudar a personas con movilidad reducida a interactuar con el telefono mediante comandos de voz complejos, como "abre WhatsApp y escribe a mi contacto de emergencia".
- Pruebas de concepto de agentes moviles: desarrollar prototipos de agentes que ejecuten acciones en el dispositivo, por ejemplo, gestionar notificaciones o responder mensajes automaticamente.
- Automatizacion de pruebas de apps: generar comandos de interaccion con la interfaz de usuario a partir de descripciones en lenguaje natural, util para testing automatizado.
- Educacion y demostraciones: ensenar conceptos de function calling y modelos on-device en cursos de desarrollo movil o inteligencia artificial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0.59 GB en precision BF16, segun datos de llmrun.dev.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2050 o superiores). Tambien puede ejecutarse en CPU.
- Compatibilidad con consumer GPU: si, cabe en GPUs de gama baja y media.
- Dispositivos moviles: disenado para Android e iOS mediante LiteRT, con requisitos minimos de memoria y almacenamiento.
- Opciones de despliegue: LiteRT (formato nativo), tambien puede utilizarse con frameworks como Transformers o llama.cpp, aunque no se ha documentado oficialmente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparativa se centra en el modelo base y en alternativas de tamano similar con capacidades de function calling:

| Modelo | Parametros | Contexto | Function calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FunctionGemma 270M FT Mobile Actions | 270M | no disponible | Si (especializado en acciones moviles) | Gemma (gated) | HuggingFace |
| google/functiongemma-270m-it | 270M | no disponible | Si (generico) | Gemma (gated) | HuggingFace |
| Qwen2.5-0.5B-Instruct | 500M | 32K | No nativo (requiere fine-tune) | Apache 2.0 | HuggingFace |
| Phi-3-mini (3.8B) | 3.8B | 128K | No nativo (requiere fine-tune) | MIT | HuggingFace |

El modelo se diferencia del base por su especializacion en acciones moviles, lo que lo hace mas preciso en ese dominio pero menos flexible para tareas generales. Frente a alternativas como Qwen2.5 o Phi-3, ofrece menor capacidad de razonamiento pero un enfoque directo para el caso de uso movil, con un tamano mucho menor que facilita su despliegue en dispositivos con recursos limitados.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated, por lo que requiere aceptar la licencia Gemma de Google antes de poder descargarlo.
- Tamano reducido: 270 millones de parametros limitan la capacidad de razonamiento complejo y la generacion de texto extenso o coherente en tareas no relacionadas con function calling.
- Especializacion estrecha: esta disenado exclusivamente para acciones moviles; su rendimiento en otros dominios (traduccion, resumen, codigo) es previsiblemente bajo.
- Riesgo de alucinacion: al igual que otros modelos pequenos, puede generar llamadas a funciones incorrectas o inventar APIs inexistentes si la instruccion es ambigua.
- Idiomas no especificados: no se ha publicado informacion sobre los idiomas soportados, lo que limita su uso en entornos multilingues.
- Restricciones de licencia: la licencia Gemma impone condiciones de uso comercial y redistribucion que deben revisarse antes de integrar el modelo en productos.
- Sin benchmarks publicados: no hay datos objetivos de rendimiento, lo que dificulta la evaluacion comparativa.

## Enlaces

- HuggingFace: https://huggingface.co/litert-community/functiongemma-270m-ft-mobile-actions
- README del modelo: https://huggingface.co/litert-community/functiongemma-270m-ft-mobile-actions/blob/main/README.md
- Documentacion de Google sobre Mobile Actions: https://ai.google.dev/gemma/docs/mobile-actions
- Requisitos de hardware (llmrun.dev): https://llmrun.dev/model/litert-community-functiongemma-270m-ft-mobile-actions
- Overview en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/functiongemma-270m-ft-mobile-actions-litert-community
