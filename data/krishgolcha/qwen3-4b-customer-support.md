# krishgolcha/Qwen3-4B-Customer-Support

## Resumen

Qwen3-4B-Customer-Support es un repositorio de receta de entrenamiento publicado por el usuario krishgolcha, no un checkpoint entrenado. Se construye sobre el modelo base Qwen/Qwen3-4B-Instruct-2507 y su objetivo declarado es adaptar dicho modelo, mediante LoRA, a la generacion de respuestas de atencion al cliente en ingles: pedidos, entregas, acceso a cuenta, reembolsos y escalado a agentes humanos. Es relevante ahora porque documenta de forma transparente un pipeline reproducible de preparacion de datos y entrenamiento, pero debe quedar claro que no contiene pesos del adaptador, no se ha ejecutado el entrenamiento y no se reclama ninguna mejora de rendimiento.

El repositorio incluye un unico script, train.py, que descarga el dataset de Bitext, normaliza pares instruccion/respuesta, elimina instrucciones duplicadas exactas y genera particiones deterministas 90/5/5 de entrenamiento, validacion y test, registrando el commit de origen y hashes SHA-256 en data/manifest.json. La receta propuesta emplea LoRA en BF16 con rango 16, alpha 32, dropout 0.05, learning rate 2e-4, batch size 1 con acumulacion de gradientes 16, longitud de secuencia 1024 y una epoca.

La ficha describe, por tanto, un proyecto de adaptacion y no un modelo listo para produccion. Para inferencia con el modelo base debe usarse el Qwen3-4B-Instruct-2507 original hasta que se publique un adaptador verificado. No hay resultados de benchmarks, ni pesos, ni evaluacion realizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer decoder (modelo base Qwen3-4B-Instruct-2507); detalles de arquitectura del base no disponibles en la informacion proporcionada |
| Parametros totales | No disponible (el modelo base es de 4B; el adaptador LoRA no se ha entrenado ni publicado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el base Qwen3-4B-Instruct-2507 la define; no se detalla aqui) |
| Tipos de cuantizacion | No disponible; la receta de entrenamiento usa BF16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 para el codigo original del repositorio; el modelo base se rige por la licencia upstream de Qwen; los datos de Bitext son CDLA-Sharing-1.0 |
| Formato de pesos | No disponible (no hay pesos publicados; la receta guardaria adaptador LoRA, tokenizer y estado de entrenamiento en local) |

## Arquitectura y entrenamiento

El proyecto no define una arquitectura propia: aplica un adaptador LoRA sobre el modelo Qwen3-4B-Instruct-2507. La receta propuesta configura LoRA con rango 16, alpha 32 y dropout 0.05, entrenamiento en BF16, batch size 1, acumulacion de gradientes 16, longitud de secuencia 1024, una epoca y learning rate 2e-4. El autor indica explicitamente que estos son parametros propuestos y no parametros de una ejecucion completada. El entrenamiento requiere CUDA y soporte BF16; el consumo de memoria depende de la GPU y de las versiones de los paquetes.

Los datos proceden del Bitext customer support dataset (Bitext Innovations, 2024, licencia CDLA-Sharing-1.0), cuya model card reporta 26.872 pares pregunta/respuesta; se trata de un recuento upstream, no de un recuento procesado. El script de preparacion descarga la instantanea completa del origen, preserva los archivos README y de licencia, normaliza los pares instruccion/respuesta, elimina duplicados exactos de instrucciones de usuario y crea particiones deterministas 90/5/5, registrando el commit resuelto y los hashes SHA-256 en data/manifest.json. Los recuentos reales solo se generan al ejecutar la preparacion. No se ha publicado informacion sobre RLHF, DPO ni otras tecnicas de alineacion adicionales en este repositorio.

## Capacidades

- Generacion de texto en ingles orientada a respuestas de atencion al cliente: pedidos, entregas, acceso a cuenta, reembolsos y escalado.
- Adaptacion mediante LoRA del modelo base Qwen3-4B-Instruct-2507, heredando las capacidades del base (no detalladas en la informacion proporcionada).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada; el autor aclara que el proyecto no implementa herramientas de backend ni ejecuta acciones reales sobre cuentas de clientes.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales (modo thinking, vision, audio): no disponibles en la informacion proporcionada.
- Estado actual: no existe checkpoint entrenado; el repositorio contiene unicamente la receta y el script de entrenamiento.

## Casos de uso

- Generacion de respuestas de atencion al cliente en ingles: el adaptador, una vez entrenado, se usaria para redactar respuestas a consultas sobre pedidos, entregas, acceso a cuenta y reembolsos, apoyandose en el modelo base Qwen3-4B-Instruct-2507.
- Reproduccion de recetas de ajuste fino: el repositorio sirve como plantilla reproducible para equipos que quieran adaptar Qwen3-4B a un dominio concreto, con particiones deterministas y manifiesto de datos verificable.
- Clasificacion y enrutado de tickets: el modelo puede generar respuestas o borradores que un sistema posterior clasifique y derive a agentes humanos cuando se trate de solicitudes sensibles.
- Borradores para agentes humanos: generacion de respuestas candidatas que un operador revisa antes de enviarlas, reduciendo el tiempo de redaccion en colas de soporte.
- Investigacion sobre calidad de datos de soporte: el pipeline de normalizacion y deduplicacion permite estudiar el impacto de la limpieza de datos en la calidad de las respuestas generadas.
- Evaluacion de riesgos en asistentes de soporte: el plan de evaluacion propuesto (correccion, fundamentacion en politicas, escalado, privacidad y afirmaciones falsas de acciones) sirve como marco para auditar asistentes conversacionales antes de produccion.
- Base para prototipos de chatbot con contexto largo: al heredar la ventana de contexto del modelo base, puede gestionar conversaciones multi-turno, aunque la longitud concreta no se detalla en la informacion disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explicitamente que no se reclama ningun resultado de benchmark ni mejora de rendimiento, y que no se ha realizado ninguna evaluacion. El plan de evaluacion previsto incluye comparar el adaptador contra el modelo base en correccion de respuestas, fundamentacion en politicas, escalado, privacidad y afirmaciones falsas de acciones, ademas de comprobar fuga por parafrasis entre particiones.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende del modelo base Qwen3-4B-Instruct-2507 y de la cuantizacion empleada, no detallada.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible en la informacion proporcionada.
- Entrenamiento: requiere una maquina con CUDA y soporte BF16; el consumo de memoria depende de la GPU y de las versiones de los paquetes. La receta usa batch size 1, acumulacion de gradientes 16 y longitud de secuencia 1024.
- Opciones de despliegue: no se detallan en la informacion proporcionada (no se mencionan vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado | Notas |
|---|---|---|---|---|---|
| Qwen3-4B-Customer-Support (este repositorio) | No disponible (base de 4B) | No disponible | Apache-2.0 (codigo); base sujeta a licencia Qwen; datos CDLA-Sharing-1.0 | Solo receta, sin pesos ni evaluacion | Adaptacion LoRA a soporte al cliente en ingles |
| Qwen/Qwen3-4B-Instruct-2507 | 4B (segun denominacion del modelo base) | No disponible en la informacion proporcionada | Licencia upstream de Qwen | Modelo base publicado | Alternativa recomendada por el autor para inferencia hasta que exista adaptador verificado |
| Alternativas de ajuste fino para soporte al cliente | No disponible | No disponible | No disponible | No disponible | No se dispone de informacion sobre modelos comparables en la documentacion proporcionada |

## Limitaciones y advertencias

- No existe checkpoint entrenado: el repositorio contiene una receta, no pesos del adaptador. No deben esperarse mejoras de rendimiento.
- Los datos sinteticos de soporte contienen marcadores de posicion y politicas genericas; las respuestas pueden inventar politicas o implicar que se han completado acciones que en realidad no se han ejecutado.
- Riesgo de alucinacion en politicas y acciones: es necesario fundamentar las respuestas de produccion en politicas aprobadas, autenticar usuarios, verificar resultados de herramientas y derivar solicitudes sensibles a soporte humano.
- El proyecto no implementa herramientas de backend ni realiza acciones reales sobre cuentas de clientes.
- Solo se declara soporte de ingles; no hay capacidades multilingues documentadas.
- La deduplicacion exacta de instrucciones no elimina duplicados semanticos; el autor advierte de posible fuga por parafrasis entre particiones.
- Licencias: el codigo original es Apache-2.0, pero los datos de Bitext son CDLA-Sharing-1.0 y el modelo base se rige por la licencia upstream de Qwen. Deben revisarse las obligaciones de la licencia de origen antes de redistribuir datos y preservar los avisos y la licencia en data/source.
- No se reclama preparacion para produccion en ningun caso.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/krishgolcha/Qwen3-4B-Customer-Support
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Dataset de origen: https://huggingface.co/datasets/bitext/Bitext-customer-support-llm-chatbot-training-dataset
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Licencia CDLA-Sharing-1.0: https://cdla.dev/sharing-1-0/
