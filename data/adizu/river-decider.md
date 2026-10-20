# adiZu/river-decider

## Resumen

river-decider es un export ONNX cuantizado del modelo fastino/GLiNER2.5-multi-Decide (Apache-2.0), preparado por el usuario adiZu para el agente on-device del proyecto River (MonkeyMesh). No se trata de un modelo nuevo entrenado desde cero, sino de una conversión orientada a inferencia en dispositivo: un encoder de la familia GLiNER2 con cabeza de clasificación que se ejecuta mediante ONNX Runtime sin necesidad de GPU. El repositorio ocupa 0,4 GB y el fichero principal, `encoder.onnx`, pesa 364 MB con tabla de embeddings en int8, pesos almacenados en fp16 y cómputo en fp32.

La relevancia de esta ficha no está en la arquitectura, heredada íntegramente del modelo base, sino en el proceso de compresión y en la validación de fidelidad que el autor documenta: sobre 119 publicaciones de prueba, la diferencia máxima de probabilidad frente a la referencia fp32 es de 0,054 y 474 de 476 etiquetas coinciden. Es decir, se conserva prácticamente el comportamiento del modelo original a una fracción del coste de cómputo y memoria.

El modelo está pensado para tareas de decisión y extracción de información en el borde (routing de intenciones, clasificación de entradas y extracción de entidades estructuradas) dentro de un agente móvil. La información publicada no incluye número de parámetros, longitud de contexto, idiomas ni resultados de benchmarks estándar, por lo que esos campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer bidireccional de la familia GLiNER2 con cabeza de clasificacion/extraccion; exportado a ONNX |
| Parametros totales | no disponible (estimacion indirecta de ~180 M a partir de los 364 MB de `encoder.onnx` con pesos fp16; no confirmada por el autor) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Tabla de embeddings en int8, pesos almacenados en fp16 y computados en fp32; export ONNX cuantizado |
| Idiomas soportados | no disponible (el modelo base se denomina "multi"; el export no documenta la lista de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`encoder.onnx` de 364 MB y `classifier.onnx` del repo DanKau), mas `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo es un encoder transformer bidireccional con cabecera de clasificación, siguiendo el esquema de la familia GLiNER2 de Fastino: en lugar de generar texto de forma autorregresiva, recibe una entrada y una lista de etiquetas o candidatos y devuelve puntuaciones para cada uno, lo que permite extracción y decisión en una sola pasada. El checkpoint original se denomina `multi-Decide`, lo que sugiere un modelo multi-tarea orientado a decisiones (clasificación/routing) además de extracción de spans. Esta ficha no dispone de detalles sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni si hubo etapas de RLHF o DPO; esa información corresponde a la model card del modelo base, no incluida aquí.

La innovación de este repositorio concreto es el pipeline de compresión: se parte de la conversión comunitaria a ONNX de DanKau (`DanKau/gliner2.5-multi-decide-onnx`) y se aplica cuantización con una tabla de embeddings en int8, pesos en fp16 y acumulación en fp32. El autor documenta una validación de fidelidad frente a la referencia fp32 sobre 119 publicaciones de prueba, con una diferencia máxima de probabilidad de 0,054 y 474/476 etiquetas idénticas. El SHA-256 del encoder está publicado (`3078c2351e140f0c4f6f7a6d0349c167dd74f289c425e98490e9e807a0b5ec2a`), lo que permite verificar la integridad del artefacto.

## Capacidades

- Clasificación y decisión sobre texto corto: asigna probabilidades a un conjunto de etiquetas candidatas, adecuado para routing de intenciones y selección de acciones en un agente.
- Extracción de información estructurada en el estilo GLiNER2: identificación de entidades y campos a partir de etiquetas definidas en tiempo de inferencia, sin reentrenamiento.
- Ejecución on-device: el formato ONNX permite inferencia en CPU y en dispositivos móviles sin GPU ni conexión a red.
- Multilingüe: el modelo base se denomina "multi", aunque el export no documenta la lista concreta de idiomas soportados.
- Baja huella de memoria: 364 MB para el encoder, lo que facilita su inclusión en aplicaciones móviles.
- No soporta generación de texto libre: no es un modelo causal, por lo que no hay tool calling generativo, razonamiento multi-paso por muestreo ni modo "thinking".
- No dispone de capacidades de visión ni audio según la información disponible.

## Casos de uso

- Routing de intenciones en un agente móvil: dado un mensaje del usuario y un conjunto de acciones disponibles, el modelo devuelve la acción más probable. Es el escenario para el que fue creado (agente on-device de River/MonkeyMesh) y se beneficia de la inferencia local sin latencia de red.
- Extracción de entidades en el dispositivo: procesar notas, correos o mensajes del usuario para identificar personas, fechas o importes sin enviar el texto a un servidor, lo que reduce el riesgo de privacidad.
- Moderación y etiquetado local de contenido: clasificar publicaciones o comentarios en categorías predefinidas antes de decidir si requieren revisión humana o un modelo mayor en la nube.
- Filtro previo (pre-router) en arquitecturas híbridas: usar el modelo como primera etapa barata que descarte o enrute consultas hacia un LLM más grande, reduciendo coste por petición.
- Clasificación de formularios y tickets offline: aplicaciones de campo o entornos sin conectividad que necesitan categorizar entradas estructuradas localmente.
- Guardrails ligeros en el cliente: evaluar si una petición entra en un conjunto de políticas antes de ejecutar una acción sensible, con la ventaja de que el modelo cabe en el binario de la aplicación.
- Procesamiento por lotes en CPU: al no requerir GPU, permite indexar o etiquetar grandes volúmenes de textos cortos en servidores sin acelerador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato de evaluacion publicado es la fidelidad de la cuantizacion frente a la referencia fp32:

| Metrica | Resultado |
|---|---|
| Conjunto de evaluacion | 119 publicaciones de prueba |
| Diferencia maxima de probabilidad vs. referencia fp32 | 0,054 |
| Etiquetas identicas | 474 de 476 |
| Tamano de `encoder.onnx` | 364 MB |
| SHA-256 de `encoder.onnx` | `3078c2351e140f0c4f6f7a6d0349c167dd74f289c425e98490e9e807a0b5ec2a` |

No se han publicado cifras de latencia, throughput ni comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica en el escenario objetivo; el modelo está diseñado para CPU. En memoria RAM, el encoder ocupa 364 MB, por lo que un presupuesto de 0,5-1 GB (incluyendo classifier, tokenizer y overhead de ONNX Runtime) es razonable.
- GPU: no es necesaria. Puede ejecutarse en A100, H100 o RTX 4090 vía ONNX Runtime con provider CUDA, pero no aporta ventajas frente a CPU para un encoder de este tamaño y entradas cortas.
- Consumer GPU: cabe holgadamente en cualquier GPU consumer, e incluso en dispositivos móviles y sistemas embebidos.
- Despliegue: ONNX Runtime (Python, C++, C#), onnxruntime-mobile para Android/iOS, y ONNX Runtime Web para navegador. No es compatible con vLLM, TGI, llama.cpp ni Ollama, ya que no es un modelo generativo autorregresivo.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño y la naturaleza no generativa (una sola pasada del encoder), se espera una latencia del orden de milisegundos en CPU moderna para entradas cortas, pero es una estimación sin confirmación del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| adiZu/river-decider | no disponible (~180 M estimados) | no disponible | ONNX int8/fp16 | Apache-2.0 | Export movil optimizado, validado contra fp32 con 474/476 etiquetas identicas |
| fastino/GLiNER2.5-multi-Decide | no disponible | no disponible | safetensors (presumiblemente) | Apache-2.0 | Modelo base original; mayor peso y coste de inferencia |
| DanKau/gliner2.5-multi-decide-onnx | no disponible | no disponible | ONNX | no disponible en esta informacion | Conversion comunitaria a ONNX de la que deriva river-decider; incluye `classifier.onnx` y `tokenizer.json` |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cualitativo frente a alternativas de extracción de informacion como GLiNER clasico u otros extractores zero-shot; esa comparacion queda fuera de la informacion disponible.

## Limitaciones y advertencias

- No es un modelo generativo: no puede producir texto libre, razonar paso a paso ni invocar herramientas mediante generación de llamadas.
- Los datos de fidelidad se han medido sobre 119 "publicaciones", un conjunto pequeno y probablemente de dominio especifico (redes sociales o mensajes cortos); el comportamiento en textos largos o dominios distintos no está documentado.
- Sesgos: no disponibles. Al ser un derivado del modelo base, hereda los sesgos de sus datos de entrenamiento, que no se detallan en la información proporcionada.
- Riesgo de alucinación: limitado en el sentido generativo, pero existe riesgo de falsos positivos al asignar etiquetas con alta probabilidad a entradas ambiguas; el umbral de decisión debe calibrarse por aplicación.
- Idiomas: el export no documenta la lista de idiomas; no se debe asumir cobertura multilingüe sin verificación empírica.
- Licencia Apache-2.0, que permite uso comercial y modificaciones, siempre que se conserve el aviso de licencia y atribución a Fastino como autor original del modelo.
- Dependencia de artefactos externos: el uso previsto requiere `onnx/classifier.onnx` y `tokenizer.json` del repositorio de DanKau, cuya licencia y estabilidad no se detallan en esta información.
- El repositorio no registra descargas ni "likes", y la fecha de creación es de octubre de 2026; se trata de un artefacto muy reciente y sin validación independiente por parte de la comunidad.
- Verificar siempre el SHA-256 publicado antes de desplegar, ya que el modelo se distribuye como binario opaco.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/adiZu/river-decider
- Modelo base: https://huggingface.co/fastino/GLiNER2.5-multi-Decide
- Conversion ONNX comunitaria: https://huggingface.co/DanKau/gliner2.5-multi-decide-onnx
- Papers, blogs, repositorios o demos adicionales: no disponibles en la informacion proporcionada.
