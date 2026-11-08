# bakeralex664/Underdog-Saluki-27B-1.0

## Resumen

Underdog-Saluki-27B-1.0 es un modelo de lenguaje conversacional de aproximadamente 26.900 millones de parametros (26.895.998.464 segun los pesos en safetensors), desarrollado por Underdog (ConwayResearch). La ficha que nos ocupa, publicada por el usuario `bakeralex664`, no es el modelo original sino un espejo (mirror) byte a byte del archivo `Underdog-Saluki-27B-1.0-IQ2-mix.gguf`, una cuantizacion IQ2_MIX extraida del repositorio original en el commit `5acfd9218fa54731f237eea8b3243d430dd85a69` (15 de octubre de 2026). La motivacion declarada del espejo es de continuidad operativa: garantizar que Catalyst Studio pueda seguir descargando esa revision concreta si la original deja de estar disponible.

El interes practico del repositorio es doble. Por un lado, preserva una revision que en su momento se distribuyo bajo licencia Apache 2.0, mientras que revisiones posteriores del modelo original y modelos mas nuevos del mismo autor usan terminos distintos. Por otro, ofrece una cuantizacion de muy baja precision (IQ2_MIX, aproximadamente 2 bits por peso) de un modelo de 27B, lo que lo hace desplegable en hardware mucho mas modesto que el modelo en precision completa, a costa de una perdida de calidad que no esta cuantificada en la informacion disponible.

No se dispone de informacion sobre arquitectura interna, datos de entrenamiento, idiomas soportados ni resultados de benchmarks. La model card del espejo es puramente logistica y remite al `ORIGINAL_README.md` del repositorio para los detalles tecnicos, que no se han proporcionado en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 26.895.998.464 (~26,9 mil millones) |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_MIX (GGUF, ~2 bits por peso); el repo contiene unicamente esa cuantizacion |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (solo para la revision concreta espejada) |
| Formato de pesos | GGUF (`Underdog-Saluki-27B-1.0-IQ2-mix.gguf`); el modelo original dispone de safetensors |

## Arquitectura y entrenamiento

No se ha proporcionado informacion sobre la arquitectura del modelo base (tipo de transformer, atencion, posible mezcla de expertos, etc.), ni sobre el volumen o composicion de los datos de entrenamiento, ni sobre si se aplicaron tecnicas de alineacion como RLHF o DPO. La model card del espejo no incluye estos datos y remite al README original, que no forma parte de la informacion disponible.

Lo unico verificable a nivel tecnico es el proceso de cuantizacion: el archivo GGUF es una cuantizacion IQ2_MIX generada con llama.cpp (el tag `imatrix` sugiere el uso de una matriz de importancia durante la cuantizacion, tecnica habitual para mitigar la perdida de calidad a precisiones muy bajas). El espejo no ha modificado el archivo: se conserva byte a byte, con SHA-256 `4a673518b11b1c4445f9b9a9d3c40356f5ba39f6a6260dcb25f3fbfd475d9efb`.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` indica que el modelo esta orientado a dialogo multi-turno.
- Razonamiento y generacion de texto general: no hay documentacion especifica que detalle el rendimiento en tareas de razonamiento, matematicas o codigo.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declaran idiomas en los metadatos.
- Capacidades especiales (vision, audio, modo thinking): no disponible.

## Casos de uso

- Despliegue en hardware de gama consumer: al tratarse de una cuantizacion IQ2_MIX de un modelo de 27B, el archivo resultante ocupa aproximadamente 7,9 GB, lo que permite ejecutarlo en GPUs con 8-12 GB de VRAM mediante llama.cpp u Ollama. Es adecuado para prototipado local cuando no se dispone de hardware de datacenter.
- Preservacion de una revision concreta bajo Apache 2.0: equipos que necesiten reproducir exactamente el comportamiento de la revision `5acfd92` con fines de auditoria, investigacion o cumplimiento pueden descargar este espejo sabiendo que el binario es identico al original.
- Chatbot conversacional de bajo coste: el tag `conversational` y el tamano reducido del GGUF lo hacen util para asistentes de texto en entornos con recursos limitados, aceptando la degradacion de calidad propia de 2 bits.
- Experimentacion con cuantizaciones extremas: investigadores que estudien el impacto de IQ2_MIX frente a Q4_K_M o Q8_0 en modelos de ~27B pueden usar este archivo como referencia de baja precision.
- Integracion en pipelines de llama.cpp: el formato GGUF es directamente consumible por llama.cpp, Ollama y servidores compatibles con la API de endpoints, lo que facilita su inclusion en flujos de inferencia ya existentes.
- Base para fine-tuning ligero o evaluacion comparativa: sirve como punto de partida para medir la degradacion de un modelo de 27B cuantizado a 2 bits frente a versiones de mayor precision, siempre que se disponga de la referencia original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF pesa aproximadamente 7,9 GB; con overhead de contexto y cache KV, se recomienda un minimo de 10-12 GB de VRAM para contextos moderados.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070 Ti, RTX 4090, A100 o H100. En GPUs de 8 GB puede requerir offload parcial a CPU.
- Cabe en GPU consumer: si, en tarjetas con 10-12 GB o mas de VRAM; en 8 GB es posible con offload parcial.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con servidores de inferencia con API HTTP.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion disponible | Licencia | Notas |
|---|---|---|---|---|---|
| Underdog-Saluki-27B-1.0 (este espejo) | ~26,9B | no disponible | IQ2_MIX | Apache 2.0 (revision concreta) | Espejo byte a byte, sin benchmarks publicados |
| Underdog-Saluki-27B-1.0 (original, ConwayResearch) | ~26,9B | no disponible | no disponible | Terminos variables segun revision | Fuente del espejo; revisiones posteriores con otros terminos |
| Otros modelos de ~27B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

No se dispone de informacion suficiente para comparar rendimiento, contexto o calidad con alternativas concretas de la misma categoria.

## Limitaciones y advertencias

- La cuantizacion IQ2_MIX (~2 bits) implica una degradacion significativa de la calidad respecto al modelo en precision completa; no se han publicado metricas que cuantifiquen esa perdida.
- La licencia Apache 2.0 aplica unicamente a la revision espejada (`5acfd92`); revisiones posteriores del modelo original y modelos mas nuevos de Underdog usan terminos distintos. Verificar la licencia antes de cualquier uso comercial.
- El repositorio es un espejo: no hay soporte del autor original en esta ficha ni garantia de actualizacion.
- No se declaran idiomas soportados; el rendimiento en castellano es desconocido.
- No hay informacion sobre sesgos, riesgo de alucinacion ni evaluaciones de seguridad.
- El tag `mirror` y la ausencia de descargas o likes indican que el repositorio no ha sido validado por la comunidad.
- El modelo original puede tener requisitos de contexto o plantillas de prompt especificos que no se documentan aqui; consultar el `ORIGINAL_README.md` incluido en el repositorio.

## Enlaces

- Repositorio espejo en Hugging Face: https://huggingface.co/bakeralex664/Underdog-Saluki-27B-1.0
- Modelo original: https://huggingface.co/ConwayResearch/Underdog-Saluki-27B-1.0
- Arbol de archivos del original: https://huggingface.co/ConwayResearch/Underdog-Saluki-27B-1.0/tree/main
- Revision concreta espejada: https://huggingface.co/ConwayResearch/Underdog-Saluki-27B-1.0/tree/5acfd9218fa54731f237eea8b3243d430dd85a69
