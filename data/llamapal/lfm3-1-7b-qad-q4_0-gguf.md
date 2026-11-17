# LlamaPal/LFM3-1.7B-QAD-Q4_0-GGUF

## Resumen

LFM3-1.7B es un modelo de lenguaje de 1.728 millones de parametros desarrollado por Liquid AI, publicado en octubre de 2026. Este repositorio concreto, mantenido por LlamaPal, no contiene un modelo nuevo: es un espejo byte a byte del fichero `LFM3-1.7B-QAD-Q4_0.gguf` del repositorio oficial `LiquidAI/LFM3-1.7B-GGUF`, verificado con el mismo hash SHA-256. Su proposito es servir como artefacto de descarga de la aplicacion LlamaPal para Android, una app de chat con IA totalmente offline.

El modelo base destaca por incorporar un modo de razonamiento previo a la respuesta ("thinks before it answers"), segun la model card del espejo, y por su tamano reducido: el fichero cuantizado Q4_0 ocupa 1,0 GB, lo que lo hace viable en dispositivos moviles de gama media. La cuantizacion es QAD (quantization-aware distillation, segun la nomenclatura del fichero) en formato Q4_0 para llama.cpp.

La relevancia actual del artefacto es practica mas que cientifica: demuestra el flujo de distribucion de modelos pequenos con capacidad de razonamiento en entornos sin conectividad, sin cuenta de usuario y con procesamiento local. La informacion disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es muy limitada; los datos que faltan se indican explicitamente como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LiquidAI/LFM3-1.7B) |
| Parametros totales | 1.728.801.600 (~1,73 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 (QAD), GGUF |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (identificador `lfm1.0`, categoria "other") |
| Formato de pesos | GGUF (`LFM3-1.7B-QAD-Q4_0.gguf`, 1,0 GB) |
| SHA-256 del fichero | `43a7d09a0e9cba91b63eb7052488b9564569bddfd65754d2e426465e572a7452` |
| Modelo base | LiquidAI/LFM3-1.7B y LiquidAI/LFM3-1.7B-NVFP4 (relacion: quantized) |
| Pipeline | text-generation |
| Fecha de publicacion del espejo | 17 de noviembre de 2026 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base en la documentacion proporcionada. La model card del espejo no detalla si LFM3-1.7B emplea un transformer convencional, una arquitectura hibrida o algun esquema de atencion lineal, ni especifica el numero de tokens de entrenamiento, la composicion del dataset o si se aplicaron tecnicas de RLHF o DPO. Tampoco se documenta el proceso de destilacion con consciencia de cuantizacion (QAD) que da nombre al fichero.

Lo unico verificable tecnicamente es el pipeline de cuantizacion: el fichero es una conversion a Q4_0 en formato GGUF, el esquema de cuantizacion de 4 bits por peso con escala por bloque que emplea llama.cpp, y carga sin modificaciones en llama.cpp y en cualquier aplicacion construida sobre esta libreria. El espejo declara ser una copia sin alteraciones del commit `cd0c74c575b5` del repositorio oficial, con hash identico, por lo que las caracteristicas del modelo coinciden exactamente con las del artefacto original de Liquid AI.

## Capacidades

- Generacion de texto conversacional en modo chat, segun la etiqueta `conversational` del repositorio.
- Razonamiento previo a la respuesta: la model card describe que el modelo "piensa antes de responder", lo que implica un modo de razonamiento interno que retrasa el inicio de la respuesta visible.
- Aritmetica basica, logica y seguimiento de instrucciones: la model card afirma que es el modelo pequeno mas preciso en las pruebas del autor en sumas, logica y seguimiento de instrucciones, sin publicar la metodologia.
- Inferencia totalmente offline en Android mediante la app LlamaPal, sin conexion a internet ni cuenta de usuario.
- Compatibilidad con llama.cpp y cualquier frontend basado en el, incluidos entornos de escritorio y servidor.
- Tool calling, function calling, capacidades de agente, vision, audio y cobertura multilingue: no disponibles en la informacion proporcionada.

## Casos de uso

- Chat privado en movil sin conectividad: el modelo se ejecuta integramente en el telefono a traves de LlamaPal, de modo que ninguna consulta sale del dispositivo. Es adecuado para usuarios que necesitan asistencia conversacional en entornos sin red o con requisitos estrictos de privacidad.
- Asistencia en campo o zonas sin cobertura: tecnicos que trabajan en obra, campo o instalaciones aisladas pueden consultar procedimientos y resolver dudas con un fichero de 1 GB descargado previamente.
- Calculo y comprobacion aritmetica rapida: la model card destaca su precision en sumas y logica; encaja en tareas de verificacion de operaciones sencillas y comprobaciones de coherencia en texto.
- Seguimiento de instrucciones en formularios y plantillas: al ser un modelo afinado para instrucciones, puede rellenar plantillas de texto, reescribir parrafos o reformatear contenido en aplicaciones moviles ligeras.
- Prototipado de aplicaciones moviles con IA: desarrolladores que integran llama.cpp en Android pueden usar este GGUF como modelo de referencia para validar latencia, consumo de memoria y calidad en dispositivos reales antes de elegir un modelo mayor.
- Base para experimentos de cuantizacion: al ser un artefacto Q4_0 con hash publicado, sirve como referencia reproducible para comparar calidad entre niveles de cuantizacion del mismo modelo base.
- Despliegue en entornos de escritorio con llama.cpp: cualquier aplicacion basada en llama.cpp puede cargar el fichero para tareas de generacion de texto de baja latencia en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente afirma, sin cifras ni metodologia, que el modelo es "el mas preciso" en las pruebas internas del autor en sumas, logica y seguimiento de instrucciones. No se incluyen resultados de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 1,0 GB solo para los pesos en Q4_0; con la cache KV y el overhead de llama.cpp, el consumo real en movil se situa por encima de esa cifra (no se publica una medicion concreta).
- GPU recomendadas: no disponible. El artefacto esta orientado a CPU y a aceleracion movil (GPU integrada del telefono) mediante llama.cpp.
- Cabe en GPU de consumo: si, en cualquier GPU con 2 GB o mas de VRAM, aunque el caso de uso previsto es CPU movil.
- Despliegue: llama.cpp y cualquier aplicacion basada en el; la app LlamaPal para Android descarga este fichero directamente.
- Latencia y throughput: no disponibles. La model card advierte que las respuestas tardan mas en empezar debido al modo de razonamiento previo.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento de este modelo ni de alternativas comparables de la misma categoria (modelos de ~1-2 B parametros en GGUF para movil), por lo que no es posible establecer una comparacion con cifras verificables.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, tasas de alucinacion ni evaluaciones de seguridad; se desconoce el comportamiento del modelo en dominios sensibles.
- El modo de razonamiento previo incrementa la latencia hasta la primera respuesta, lo que puede resultar incomodo en interacciones conversacionales rapidas.
- Idiomas soportados no declarados: no hay garantia de calidad fuera del ingles u otros idiomas no especificados.
- Longitud de contexto no disponible: no se puede planificar el uso con documentos largos sin verificar el limite real del modelo base.
- Licencia LFM Open License v1.0: es una licencia propia con condiciones especificas; deben revisarse los terminos del fichero LICENSE antes de cualquier uso comercial. No es una licencia OSI estandar.
- Este repositorio es un espejo de terceros (LlamaPal), no el repositorio oficial; para la model card completa, terminos y soporte debe consultarse LiquidAI/LFM3-1.7B-GGUF.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopcion practicamente nula y ausencia de validacion por parte de la comunidad.
- Al ser una cuantizacion Q4_0, es esperable una degradacion de calidad frente a los pesos originales en precision completa o NVFP4; no se publica la magnitud de esa perdida.

## Enlaces

- Repositorio del espejo: https://huggingface.co/LlamaPal/LFM3-1.7B-QAD-Q4_0-GGUF
- Repositorio oficial del modelo base en GGUF: https://huggingface.co/LiquidAI/LFM3-1.7B-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Modelo base en NVFP4: https://huggingface.co/LiquidAI/LFM3-1.7B-NVFP4
- Texto de la licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM2.5-2.6B-GGUF/blob/main/LICENSE
- App LlamaPal en Google Play: https://play.google.com/store/apps/details?id=com.vishistv.llamapal
- Sitio web de LlamaPal: https://llamapal.cc/
- Instagram de LlamaPal: https://www.instagram.com/llamapalhq/
