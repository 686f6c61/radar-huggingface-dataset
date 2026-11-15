# geladons/Huihui-Qwen3.5-2B-abliterated

## Resumen

Huihui-Qwen3.5-2B-abliterated (bundle LiteRT-LM) es una distribucion del modelo huihui-ai/Huihui-Qwen3.5-2B-abliterated, un finetune "abliterated" (sin censura, con menos rechazos que el modelo instruct original) de la familia Qwen3.5 de 2.000 millones de parametros. El autor de este repositorio, geladons, no entrena el modelo: lo convierte al formato `.litertlm` de Google para inferencia completamente en dispositivo mediante el runtime LiteRT-LM, orientado a Android y entornos edge.

El paquete esta cuantizado a int8 y ocupa 2,12 GB, lo que lo hace viable en telefonos moviles de gama alta o media-alta sin conexion a la nube. Se integra con el SDK `com.google.ai.edge.litertlm` y con la aplicacion Local AI de Google Play, que lo incluye en su catalogo integrado.

La relevancia actual reside en la combinacion de tres factores: un modelo pequeno (2B) de una familia reciente (Qwen3.5), una variante abliterated que reduce las negativas del modelo base, y un empaquetado listo para produccion movil mediante LiteRT-LM. No se dispone de informacion publicada sobre la arquitectura interna, los datos de entrenamiento ni los benchmarks del modelo base en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Qwen3.5; detalles no publicados en la informacion disponible) |
| Parametros totales | 2B (segun el nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (unico formato publicado en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); 2,12 GB de tamano de fichero |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura del modelo base en la documentacion proporcionada. Por el nombre y la familia (Qwen3.5) cabe esperar un transformer decoder-only, pero no se confirma en la model card. El modelo base es un finetune abliterated de huihui-ai sobre el modelo instruct de Qwen3.5 de 2B; la tecnica de abliteration elimina direcciones de activacion asociadas al rechazo, reduciendo la tasa de negativas del modelo sin reentrenar desde cero.

Este repositorio concreto no aporta entrenamiento adicional: es una conversion de pesos al formato LiteRT-LM con cuantizacion int8, realizada por geladons. El fichero es byte-identico al publicado en `geladons/local-ai-models`, que se mantiene por compatibilidad hacia atras. No se detallan el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto texto-a-texto (unica modalidad declarada: `text → text`).
- Conversacion multi-turno mediante la API `Engine`/`Conversation` del SDK LiteRT-LM.
- Inferencia completamente offline en dispositivo, sin nube ni cuenta de usuario.
- Comportamiento "abliterated": menor tasa de rechazos que el modelo instruct base, lo que amplia el rango de peticiones que el modelo atendera.
- Integracion en aplicaciones Android mediante `com.google.ai.edge.litertlm`.
- Soporte de tool calling, agentes, vision, audio, thinking mode o capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional offline en Android: la aplicacion Local AI carga el `.litertlm` directamente y permite chatear sin conexion; el tamano de 2,12 GB en int8 encaja en el almacenamiento de un movil moderno.
- Prototipado de apps moviles con IA local: un desarrollador puede apuntar el `Engine` del SDK LiteRT-LM al fichero para validar flujos de chat sin depender de APIs de pago ni de latencia de red.
- Escenarios con requisitos estrictos de privacidad: al ejecutarse integramente en el dispositivo, los datos del usuario no salen del telefono, lo que resulta adecuado para aplicaciones sensibles (notas personales, salud, finanzas).
- Demos y pruebas de concepto de modelos abliterated en edge: permite evaluar el comportamiento sin censura del finetune de huihui-ai en hardware movil sin montar infraestructura de servidor.
- Distribucion de modelos en catalogos integrados: el modelo ya forma parte del catalogo de Local AI, lo que sirve como ejemplo de publicacion de bundles LiteRT-LM con su propia model card y estadisticas.
- Evaluacion comparativa de runtimes on-device: util para medir el rendimiento de LiteRT-LM frente a otras alternativas (llama.cpp, MLC) con un modelo de 2B cuantizado a int8.
- Educacion y experimentacion: coste cero de infraestructura para que estudiantes prueben inferencia LLM en su propio telefono.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el fichero pesa 2,12 GB en int8; se requiere al menos ese espacio de almacenamiento y una cantidad de RAM comparable (mas overhead del runtime) para cargarlo en memoria.
- Plataforma objetivo: Android con soporte del runtime LiteRT-LM; no se especifican versiones minimas ni chips compatibles.
- GPU recomendadas: no disponible. El despliegue esta pensado para aceleracion en dispositivo (CPU/GPU/NPU del telefono) mediante LiteRT, pero no se detallan los aceleradores soportados.
- Cabe en GPU consumer: no aplica directamente; el formato `.litertlm` esta orientado a moviles y edge, no a tarjetas graficas de escritorio como RTX 4090 o A100.
- Opciones de despliegue: SDK `com.google.ai.edge.litertlm` en apps propias, o la aplicacion Local AI de Google Play sin escribir codigo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Huihui-Qwen3.5-2B-abliterated (LiteRT-LM, este repo) | 2B | no disponible | `.litertlm` int8 | Apache 2.0 | Hugging Face, catalogo Local AI |
| huihui-ai/Huihui-Qwen3.5-2B-abliterated (modelo base) | 2B | no disponible | safetensors (presumible, no confirmado) | Apache 2.0 | Hugging Face |
| geladons/local-ai-models | no disponible | no disponible | `.litertlm` | no disponible | Hugging Face (copia byte-identica) |

No se dispone de datos de rendimiento ni de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo abliterated: la reduccion de rechazos implica que el modelo puede generar contenido que el instruct original bloquearia; requiere filtros y moderacion propios en produccion.
- Riesgo de alucinacion: inherente a un modelo de 2B; no se han publicado evaluaciones de fidelidad.
- Idiomas soportados no declarados: no se puede garantizar calidad en castellano ni en otros idiomas sin evaluacion propia.
- Longitud de contexto no disponible: limita la planificacion de casos de uso con documentos largos.
- Formato propietario de runtime: `.litertlm` solo se ejecuta con LiteRT-LM; no es compatible directamente con vLLM, llama.cpp, Ollama o TGI.
- Licencia Apache 2.0: permite uso comercial, pero el autor de este bundle no ofrece garantias; conviene revisar la licencia y condiciones del modelo base de huihui-ai y de Qwen3.5.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria ni evidencia de uso en produccion.
- Sin datos de benchmarks, contexto ni composicion de entrenamiento: la evaluacion previa a produccion corre por cuenta del integrador.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/geladons/Huihui-Qwen3.5-2B-abliterated
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.5-2B-abliterated
- Copia en catalogo: https://huggingface.co/geladons/local-ai-models
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Recetas de conversion hf-to-litertlm: https://github.com/john-rocky/hf-to-litertlm
- Aplicacion Local AI (Google Play): https://play.google.com/store/apps/details?id=com.ochandydude.localai
- Licencia Apache 2.0: https://spdx.org/licenses/apache-2.0.html
