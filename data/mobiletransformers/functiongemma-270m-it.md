# mobiletransformers/functiongemma-270m-it

## Resumen

`mobiletransformers/functiongemma-270m-it` es un paquete de despliegue on-device para Android, generado con el framework MobileTransformers a partir del modelo base `google/functiongemma-270m-it`. Este paquete no es un modelo Hugging Face convencional, sino un manifiesto que incluye etapas ONNX, pesos cuantizados en int4 y un mapa de transferencia de pesos, pensado para ejecutar inferencia y fine-tuning directamente en dispositivos móviles sin conexión a servidores.

El modelo base, FunctionGemma 270M, es un transformer decoder de Google especializado en function calling y generación de texto con instrucciones. La versión empaquetada añade una capa de adaptación LoRA (rank 8 sobre `q_proj` y `v_proj`) y cuantización int4, lo que permite ajuste fino en el dispositivo y posterior fusión de los adaptadores en los pesos base. Es relevante porque democratiza el fine-tuning de modelos de lenguaje en hardware de gama media, reduciendo la dependencia de infraestructura cloud.

El paquete está disponible en Hugging Face con identificador `mobiletransformers/functiongemma-270m-it`, tiene un tamaño de repositorio de 4.2 GB y requiere Android API 28 o superior. La licencia no está declarada explícitamente en el paquete, pero los pesos derivan del modelo base de Google, cuyos términos de uso aplican.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (modelo base: google/functiongemma-270m-it) |
| Parametros totales | 270 millones (segun nombre del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int4 |
| Idiomas soportados | No disponible (depende del modelo base) |
| Licencia | No disponible en el paquete; los pesos del modelo base estan sujetos a los terminos de google/functiongemma-270m-it |
| Formato de pesos | ONNX (paquete MobileTransformers) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder de 270M parametros, especializado en generacion de texto y function calling, entrenado por Google con un enfoque de instrucciones. El paquete MobileTransformers lo exporta a ONNX con cuantizacion int4, preservando la arquitectura original pero optimizandola para inferencia en CPU movil.

La innovacion principal es el soporte de fine-tuning en el dispositivo mediante LoRA: se anaden adaptadores de bajo rango (rank 8) sobre las proyecciones de atencion (`q_proj` y `v_proj`). El flujo de entrenamiento permite ajustar el modelo en el movil y fusionar los adaptadores de vuelta en los pesos base, todo sin necesidad de GPU dedicada. El framework usa `optimum-onnx` y `ort-training` para la conversion y el entrenamiento.

No se proporcionan detalles sobre el dataset de entrenamiento del modelo base ni sobre el proceso de alineacion (RLHF, DPO, etc.). La informacion disponible se limita a la configuracion del paquete, no al entrenamiento original.

## Capacidades

- Generacion de texto con instrucciones: hereda las capacidades del modelo base FunctionGemma, orientado a responder con formato estructurado.
- Function calling: el modelo base esta disenado para invocar funciones y devolver argumentos en JSON, lo que permite integrarlo en agentes y asistentes.
- Fine-tuning en dispositivo: mediante LoRA, es posible adaptar el modelo a dominios especificos directamente en el movil.
- Inferencia on-device: ejecucion local sin conexion, con latencia reducida y privacidad de datos.
- Soporte para Android: paquete optimizado para API 28 o superior, con variante CPU int4.
- Puntuacion (scoring): el paquete incluye capacidad de generar o puntuar secuencias, util para tareas de clasificacion o reranking.

## Casos de uso

- Asistentes personales en el movil: el modelo puede gestionar conversaciones multi-turno y ejecutar acciones (enviar mensajes, crear recordatorios) mediante function calling, todo localmente para proteger la privacidad.
- Automatizacion de tareas en apps de productividad: integrado en una app Android, puede parsear comandos de voz o texto y traducirlos a llamadas de API internas (calendarizacion, busqueda, etc.).
- Chatbots de atencion al cliente offline: desplegado en un terminal de punto de venta o kiosco, responde consultas frecuentes sin depender de conectividad.
- Clasificacion de texto en el dispositivo: usando la capacidad de scoring, puede etiquetar correos, mensajes o documentos localmente.
- Prototipado rapido de agentes con fine-tuning: los desarrolladores pueden ajustar el modelo en el propio dispositivo con datos de usuario, sin enviar informacion a la nube.
- Educacion y aprendizaje: aplicaciones de practica de idiomas o tutoria que generan ejercicios y evaluan respuestas de forma offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras metricas para este paquete especifico. El rendimiento dependera del modelo base y de la cuantizacion int4, pero no se proporcionan cifras.

## Requisitos de hardware

- Dispositivo Android con API 28 o superior.
- Variante `cpu-int4`: ejecucion en CPU nativa, sin necesidad de GPU.
- RAM recomendada: no especificada en la tabla de variantes (campo vacio), aunque un modelo de 270M en int4 deberia caber en dispositivos con 2-4 GB de RAM.
- Almacenamiento: el repositorio pesa 4.2 GB, aunque la descarga real puede ser menor al seleccionar solo la variante necesaria.
- Despliegue: se utiliza el framework MobileTransformers (repositorio en GitHub), no compatible con transformers, optimum o onnxruntime estandar.
- Latencia y throughput: no disponibles; dependen del hardware del dispositivo y de la longitud de la secuencia.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. El modelo base FunctionGemma 270M compite con otros modelos pequenos de function calling como Qwen2.5-0.5B-Instruct o Gemma-2-2B, pero no hay metricas publicadas para este paquete. La ventaja diferencial es el soporte de fine-tuning en el dispositivo, algo poco comun en modelos de este tamano.

## Limitaciones y advertencias

- Tamano reducido (270M): puede presentar alucinaciones y errores en tareas complejas de razonamiento o generacion larga.
- Licencia no declarada en el paquete: aunque los pesos del modelo base siguen los terminos de Google, el usuario debe verificar la compatibilidad comercial con dichos terminos antes de usar el paquete en produccion.
- Dependencia del framework MobileTransformers: no es un modelo Hugging Face estandar, por lo que no se puede cargar con herramientas habituales; requiere el ecosistema especifico.
- Limitaciones de contexto: no se especifica la longitud de contexto soportada; probablemente hereda la del modelo base (posiblemente 8K tokens), pero no esta confirmado.
- Soporte de idiomas: no se indica que idiomas cubre; el modelo base podria ser multilingue, pero no hay garantia.
- Variante unica CPU int4: no hay opciones de cuantizacion superiores (fp16, fp32) ni aceleracion GPU, lo que limita el rendimiento en tareas muy exigentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mobiletransformers/functiongemma-270m-it
- Modelo base: https://huggingface.co/google/functiongemma-270m-it
- Framework MobileTransformers: https://github.com/martinkorelic/mobiletransformers
- Paper de referencia: https://gitlab.fri.uni-lj.si/lrk/mobiletransformers (citado en la model card)
