# Jianshu001/slime2-cascade-router

## Resumen

El modelo `slime2-cascade-router` es un sistema de enrutamiento en cascada desarrollado por Jianshu001. Combina un modelo de lenguaje pequeño (`slime2-f16.gguf`, con 1.078.285.824 parámetros) con un gate entrenado que decide, paso a paso, si una consulta debe procesarse localmente o enviarse a un modelo más grande a través de una API compatible con OpenAI. El propósito es reducir costes y latencia en despliegues de inferencia, manteniendo las consultas simples en el modelo local y escalando solo las complejas al modelo remoto.

El modelo se distribuye en formato GGUF con cuantización F16 e incluye una plantilla de chat ChatML y los metadatos del router. La información publicada es limitada: no se detallan arquitectura, datos de entrenamiento, idiomas ni benchmarks. Aun así, el sistema es relevante para quienes buscan optimizar el coste de inferencia en aplicaciones conversacionales sin sacrificar la calidad en los casos difíciles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 1.078.285.824 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16 (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (F16) |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura del modelo ni sobre los datos de entrenamiento. El modelo se presenta como parte de un sistema de routing en cascada: un modelo pequeño genera texto localmente, y un gate entrenado (`router/router.rml2`) decide si cada paso individual debe enviarse a un modelo más grande. El gate cubre cinco dominios, aunque no se especifica cuáles, y se proporcionan métricas AUC por dominio en `router/router.json`. No hay información sobre procesos de ajuste como RLHF o DPO.

## Capacidades

- Generación de texto local: el modelo `slime2-f16.gguf` es un modelo de lenguaje pequeño en formato GGUF, listo para inferencia con llama.cpp.
- Enrutamiento en cascada: el gate clasifica las consultas y decide si se procesan localmente o se envían a un modelo mayor a través de una API compatible con OpenAI.
- Soporte de chat: incluye una plantilla de chat ChatML (`slime2-chatml.jinja`) para usar con `llama-server`.
- Compatibilidad con endpoints: etiquetado como `endpoints_compatible`, lo que sugiere que puede exponerse como API.
- Dominios cubiertos por el gate: cinco dominios, aunque no se documentan cuáles son.
- No se dispone de información sobre tool calling, visión, audio o capacidades multilingües.

## Casos de uso

- Reducción de costes en asistentes virtuales: el modelo local responde consultas frecuentes y el gate enruta las consultas complejas a un modelo mayor vía API, reduciendo el coste por token.
- Atención al cliente con escalado inteligente: en un chatbot de soporte, las preguntas habituales se resuelven localmente y las incidencias técnicas se derivan al modelo grande para un tratamiento más profundo.
- Filtrado y clasificación de consultas en pipelines de IA: el gate actúa como clasificador previo para decidir qué consultas necesitan un modelo más potente, optimizando el uso de recursos.
- Aplicaciones con requisitos de privacidad: al mantener las consultas simples en local, se reduce la exposición de datos a APIs externas.
- Prototipado y validación de sistemas de routing: el modelo permite probar el enrutamiento en cascada en un entorno local con recursos mínimos antes de escalar a producción.
- Despliegue en entornos con recursos limitados: el modelo pequeño puede ejecutarse en GPU de consumo o CPU, permitiendo operar con un presupuesto de hardware reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 1.078.285.824 parámetros en F16, los pesos ocupan aproximadamente 2,1 GB. Para inferencia con KV cache y activaciones, se recomienda al menos 4 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, por ejemplo RTX 3060 12GB, RTX 4060 8GB o superior.
- Cabe en GPU de consumo: sí, es un modelo pequeño que puede ejecutarse en GPUs de gama media.
- Opciones de despliegue: llama.cpp y `llama-server` según la documentación. También puede ejecutarse en CPU con llama.cpp. No se ha verificado la compatibilidad con otros servidores de inferencia.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Información escasa: no hay documentación sobre arquitectura, datos de entrenamiento, idiomas ni benchmarks.
- Riesgo de alucinación: al ser un modelo pequeño sin evaluaciones publicadas, el riesgo es desconocido.
- Sesgos: no se han publicado evaluaciones de sesgos.
- Limitaciones de contexto: no se conoce la longitud de contexto real. El comando de ejemplo usa `-c 262144`, pero puede ser configurable y no reflejar el límite del modelo.
- Uso en producción: el modelo tiene 0 descargas y 0 likes, y parece experimental. Se recomienda validar su comportamiento antes de usarlo en entornos críticos.
- Licencia MIT: permite uso comercial, pero la responsabilidad del uso recae en el usuario.

## Enlaces

- HuggingFace: https://huggingface.co/Jianshu001/slime2-cascade-router
- Repositorio del proyecto: https://github.com/Jianshu-She/llamacpp-routing
- Documentación de routing: https://github.com/Jianshu-She/llamacpp-routing/blob/main/tools/server/README-routing.md
