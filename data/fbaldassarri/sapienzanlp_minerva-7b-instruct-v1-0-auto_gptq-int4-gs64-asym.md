# fbaldassarri/sapienzanlp_Minerva-7B-instruct-v1.0-auto_gptq-int4-gs64-asym

## Resumen

Esta ficha describe la version cuantizada a 4 bits de Minerva-7B-instruct-v1.0, un modelo conversacional de 7.000 millones de parametros basado en la arquitectura Mistral (transformer causal decoder-only) y desarrollado originalmente por SapienzaNLP (Universidad de La Sapienza, Roma) con foco en italiano e ingles. La cuantizacion la firma el usuario fbaldassarri y se ha generado con Intel AutoRound v0.15.1, produciendo un checkpoint en formato AutoGPTQ de 4 bits, tamano de grupo 64 y cuantizacion asimetrica (W4G64-asym), orientado a reducir el consumo de memoria y acelerar la inferencia entre 2 y 3 veces respecto al modelo en bfloat16.

La relevancia de este artefacto es practica: permite ejecutar un modelo de 7B en hardware modesto, incluidos equipos con CPU Intel, iGPU Intel Arc (via intel-extension-for-pytorch) y NPU Intel AI Boost de la serie Core Ultra (via OpenVINO). El modelo base esta pensado para uso instruct/chat, con plantilla de chat propia, y publica pesos en safetensors. La licencia es Apache 2.0, lo que facilita su integracion en productos, si bien el autor de la cuantizacion declara explicitamente que el artefacto se ha desarrollado solo con fines de investigacion y sin garantia.

El repositorio tiene un tamano de 5,4 GB, cero descargas y cero likes en el momento de la consulta, y fue creado el 10 de octubre de 2026 segun los metadatos de HuggingFace. No se han publicado resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (model_type: mistral) |
| Parametros totales | 7B nominales (nombre del modelo); el checkpoint cuantizado declara 1.416.564.736 elementos en safetensors |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4, group size 64, asimetrica (sym=false), GPTQ/AutoGPTQ generado con Intel AutoRound v0.15.1; WoQ (weights-only quantization) |
| Idiomas soportados | italiano (it), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato auto_gptq (transformers); repositorio de 5,4 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer causal decoder-only de tipo Mistral, con 7.000 millones de parametros y plantilla de chat propia, orientado a generacion de texto conversacional. Esta ficha cubre exclusivamente la version cuantizada: los pesos originales en bfloat16 se han transformado a INT4 mediante el algoritmo GPTQ implementado en Intel AutoRound 0.15.1, con tamano de grupo 64 y esquema asimetrico. La calibracion se ejecuto en CPU con 128 muestras, 200 iteraciones de ajuste, longitud de secuencia 512 y tamano de lote 4, con `torch_dtype` de carga bfloat16 y las versiones transformers 4.55.3 y torch 2.14.0+cpu. El proceso completo de cuantizacion registro una duracion de 40.977,6 segundos (aproximadamente 683 minutos).

No se dispone de informacion sobre el dataset de entrenamiento del modelo base, el numero de tokens utilizados, la composicion de los datos ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa u otras) mas alla de la propia cuantizacion WoQ, que preserva los pesos originales y solo reduce su precision numerica. El autor de la cuantizacion afirma una aceleracion de 2-3 veces con una ligera perdida de precision en la configuracion W4G64.

## Capacidades

- Generacion de texto conversacional multi-turno en italiano e ingles mediante la plantilla de chat integrada (obligatorio usar `apply_chat_template`; no se recomienda el prompt de texto plano).
- Instrucciones y respuestas tipo asistente, gracias al ajuste instruct del modelo base.
- Razonamiento basico y respuesta a preguntas generales, sujeto a la perdida de calidad inherente a la cuantizacion INT4.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: limitadas a italiano e ingles segun las etiquetas del repositorio.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Inferencia optimizada en hardware Intel: CPU, iGPU Arc (intel-extension-for-pytorch) y NPU AI Boost de Core Ultra (OpenVINO).

## Casos de uso

- Asistentes conversacionales en italiano para atencion al cliente: el modelo esta ajustado para instrucciones y mantiene la plantilla de chat, por lo que puede gestionar dialogos multi-turno en italiano con un consumo de VRAM de aproximadamente 4-5 GB en INT4, apto para servidores modestos o equipos de sobremesa.
- Despliegue en portatiles y mini-PC con NPU Intel Core Ultra: al estar cuantizado y verificarse su uso con OpenVINO sobre la NPU AI Boost, permite ejecutar un 7B instruct de forma local sin GPU dedicada, util para asistentes de escritorio o herramientas ofimaticas con IA integrada.
- Procesamiento por lotes en CPU de granja de servidores Intel: con intel-extension-for-pytorch se puede servir el modelo en maquinas sin acelerador, por ejemplo para clasificacion de tickets, resumen de correos o extraccion de entidades en italiano.
- Prototipado rapido y evaluacion de calidad de cuantizaciones: este checkpoint sirve como referencia reproducible (receta AutoRound documentada con semilla de calibracion, iteraciones y lote) para comparar W4G64 asimetrico frente a otras configuraciones del mismo modelo base.
- Investigacion academica en PLN italiana: el modelo base procede de SapienzaNLP y esta orientado al italiano, de modo que la version cuantizada permite experimentar en laboratorio con recursos de GPU limitados, por ejemplo en analisis de discurso o generacion de resumenes.
- Generacion de texto asistida en entornos sin conectividad: al caber en un equipo de consumo, se puede integrar en aplicaciones de escritorio que requieran privacidad de datos y funcionamiento offline en italiano o ingles.
- Servicio de inferencia con TGI (text-generation-inference): el repositorio incluye la etiqueta correspondiente, de modo que puede levantarse como endpoint HTTP en un contenedor con GPU de gama media para aplicaciones internas de chat.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La busqueda web realizada no ha devuelto ninguna fuente tecnica relevante sobre este modelo ni sobre el modelo base (los resultados obtenidos eran contenido no relacionado y sin valor tecnico). El unico dato de rendimiento declarado por el autor es cualitativo: una aceleracion de 2-3 veces respecto a la version en bfloat16, con una ligera caida de precision en la configuracion W4G64 asimetrica.

## Requisitos de hardware

- VRAM estimada: aproximadamente 4-5 GB para los pesos INT4 (el repositorio ocupa 5,4 GB en disco), mas overhead de KV cache y activaciones. Con contexto largo el consumo crece de forma proporcional a la longitud de secuencia.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM, como RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4070, RTX 4090 o superiores; tambien A100, H100, L40S y similares para despliegues con concurrencia alta.
- Cabe en GPU de consumo: si. Es viable en tarjetas de 8 GB con contexto moderado; con 12-16 GB se dispone de margen comodo para lotes y contextos mayores.
- Hardware Intel: soporte especifico para CPU Intel (intel-extension-for-pytorch), iGPU Intel Arc y NPU Intel AI Boost de la serie Core Ultra via OpenVINO, segun declara el autor del artefacto.
- Opciones de despliegue: transformers con AutoGPTQ (receta incluida en la model card), text-generation-inference (etiqueta presente en el repositorio) y vLLM por su soporte de checkpoints GPTQ. Para llama.cpp u Ollama seria necesario convertir previamente los pesos a formato GGUF, ya que el repositorio no incluye ese formato.
- Latencia y throughput: no disponibles. No se han publicado mediciones concretas de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Minerva-7B-instruct-v1.0 INT4 GPTQ-AutoRound, gs64 asim) | 7B nominales | INT4, gs64, asimetrica | no disponible | Apache 2.0 | HuggingFace, safetensors auto_gptq |
| sapienzanlp/Minerva-7B-instruct-v1.0 (modelo base) | 7B | bfloat16 sin cuantizar | no disponible | Apache 2.0 | HuggingFace, safetensors |
| Mistral-7B-Instruct-v0.x (referencia de la familia) | 7B | bfloat16 o cuantizaciones de terceros | 8.192 tokens (segun la familia Mistral) | Apache 2.0 | HuggingFace |
| Otras cuantizaciones del mismo Minerva (GGUF, AWQ) | 7B | GGUF Q4_K_M, AWQ INT4 | no disponible | Apache 2.0 | no disponible en la informacion consultada |

No se dispone de datos comparativos de rendimiento entre estas opciones en la informacion proporcionada. La comparacion con Mistral-7B-Instruct se ofrece solo como referencia de familia arquitectonica, no como equivalencia funcional ni de calidad.

## Limitaciones y advertencias

- Perdida de precision por cuantizacion: el propio autor reconoce una ligera caida de exactitud en la configuracion W4G64, lo que puede degradar tareas que requieran matices finos, calculo exacto o razonamiento complejo.
- Riesgo de alucinacion: no se documentan medidas especificas de mitigacion en la informacion disponible; como cualquier modelo de 7B ajustado por instrucciones, puede generar afirmaciones falsas con apariencia de veracidad.
- Cobertura idiomatica limitada: solo italiano e ingles. El rendimiento en castellano no esta documentado y no deberia asumirse.
- Longitud de contexto desconocida: no se especifica en el repositorio, por lo que no se puede garantizar el comportamiento en conversaciones o documentos largos.
- Soporte de tool calling y agentes no documentado: no hay evidencia de que el modelo soporte function calling ni razonamiento multi-paso, por lo que no deberia desplegarse en pipelines de agentes sin validacion previa.
- Licencia Apache 2.0 para los pesos, con la salvedad de que el autor de la cuantizacion indica que el artefacto se ha desarrollado unicamente con fines de investigacion y sin garantia; conviene revisar la licencia y las condiciones del modelo base antes de un uso comercial.
- Fiabilidad del repositorio baja: cero descargas y cero likes en el momento de la consulta, sin validacion comunitaria ni resultados de evaluacion publicados.
- `inference: false` en los metadatos del autor: aunque la model card incluye ejemplos de uso, el campo de inferencia esta marcado como falso, lo que sugiere que el autor no garantiza el pipeline de inferencia por defecto.
- Compatibilidad de formatos: al ser un checkpoint auto_gptq, requiere librerias especificas (AutoGPTQ, GPTQModel o vLLM) y no funciona directamente con llama.cpp, Ollama o MLX sin conversion previa.
- Fecha de creacion anomala: los metadatos indican una fecha de creacion de 2026-10-10, posterior a la fecha habitual de publicacion, lo que puede afectar a la trazabilidad del artefacto.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/fbaldassarri/sapienzanlp_Minerva-7B-instruct-v1.0-auto_gptq-int4-gs64-asym
- Modelo base: https://huggingface.co/sapienzanlp/Minerva-7B-instruct-v1.0
- Intel AutoRound (repositorio): https://github.com/intel/auto-round
- Receta de replicacion auto-round-pipeline: https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
- Paper, blog o demo del modelo: no disponible en la informacion consultada
