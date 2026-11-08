# FMendonca/qwen3-1.7b-agente-suporte-ptbr-gguf

## Resumen

El modelo `FMendonca/qwen3-1.7b-agente-suporte-ptbr-gguf` es una versión cuantizada en formato GGUF (Q8_0, 1,83 GB) de un ajuste fino del Qwen3-1.7B de Alibaba, especializado en atención al cliente en portugués de Brasil. Lo desarrolla el usuario de Hugging Face FMendonca (Fernando Mendonça) como parte de un proyecto personal que entrena un agente de soporte para "Garfo Ligeiro", una aplicación ficticia de reparto de comida. El modelo base del ajuste es `FMendonca/qwen3-1.7b-agente-suporte-ptbr`, que fusiona un adaptador LoRA sobre Qwen3-1.7B en bf16.

La relevancia del modelo no está en sus capacidades generales, sino en su enfoque de evaluación: el autor publica una batería de 300 escenarios sintéticos con un cliente simulado y un sistema de pedidos instrumentado mediante herramientas, y mide la tasa de resolución efectiva (estado final del sistema igual al que dicta la política) en lugar de métricas de texto. El GGUF Q8_0 obtiene un 85,3 % de casos resueltos (IC 95 %: 81,3–89,3) con 15 errores graves, prácticamente idéntico al adaptador bf16 en GPU (85,7 %, 19 errores graves).

Técnicamente es un transformer denso de 1.720.574.976 parámetros, con licencia Apache 2.0, pensado para ejecutarse en CPU sin GPU mediante llama.cpp. Está entrenado exclusivamente en portugués de Brasil y su formato de conversación no es el template nativo de Qwen3, lo que condiciona su integración en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-1.7B base), LoRA fusionado |
| Parametros totales | 1.720.574.976 (1,7 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del Qwen3-1.7B base) |
| Tipos de cuantizacion | Q8_0 publicada (1,83 GB); Q4_K_M evaluada pero descartada y no publicada |
| Idiomas soportados | Portugues de Brasil (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el adaptador base en bf16 esta en otro repositorio |
| Tamano del repositorio | 1,8 GB |
| Herramienta de conversion | llama.cpp commit `0c1e570` (equivalente a llama-cpp-python 0.3.36) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer denso de la familia Qwen3, sobre el que se aplicó un ajuste fino con LoRA para la tarea de agente de soporte. El adaptador se fusionó en el modelo base en bf16 y después se convirtió a GGUF con `convert_hf_to_gguf.py` y se cuantizó a Q8_0 con `llama-quantize`, todo ello usando llama.cpp en el commit `0c1e570`. No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

La innovación destacable no es arquitectónica sino de formato y evaluación. El modelo **no** fue entrenado con el template de chat nativo de Qwen3 (que sí viene embebido en el archivo GGUF): cada turno del agente empieza con un bloque `<think>` vacío, los resultados de las herramientas se devuelven en un turno `user` dentro de `<tool_response>` y el primer mensaje del cliente va precedido de una línea de contexto. El formato está definido en `src/formato_qwen.py` del repositorio GitHub. Por eso el uso correcto consiste en construir los tokens con el tokenizer de Qwen3 y pasarlos directamente a llama.cpp, sin `create_chat_completion`. El agente opera sobre un sistema de pedidos simulado mediante herramientas (reembolsar, emitir cupón, cancelar, escalar a un humano).

## Capacidades

- Generación de texto conversacional en portugués de Brasil orientada a atención al cliente.
- Tool calling / function calling sobre un sistema de pedidos instrumentado (consultas de estado, reembolsos, cupones, cancelaciones, escalado a persona).
- Razonamiento multi-turno y multi-paso: el agente mantiene una sesión con estado y decide acciones sucesivas hasta resolver el caso.
- Modo "thinking" simulado mediante el bloque `<think>` obligatorio al inicio de cada turno del agente (vacío en el formato de entrenamiento).
- Seguimiento de políticas de negocio: el éxito se mide por alcanzar el estado final que dicta la política, no por la calidad del texto.
- No dispone de capacidades de visión, audio ni generación de código verificadas en la información disponible.
- Multilingüismo limitado: entrenado y evaluado solo en portugués de Brasil.

## Casos de uso

- Atención al cliente automatizada de primer nivel en una app de reparto o comercio electrónico: el modelo gestiona conversaciones multi-turno, consulta el estado del pedido mediante herramientas y resuelve reembolsos, cupones o cancelaciones sin intervención humana en el 85,3 % de los escenarios de prueba.
- Despliegue en CPU sin GPU: con 1,83 GB en Q8_0 y 8 hilos, ofrece una mediana de 3,2 s por turno, adecuado para entornos con presupuesto de infraestructura muy bajo o para ejecución en el borde.
- Prototipado y validación de políticas de soporte: el repositorio incluye 300 escenarios sintéticos y un cliente simulado que permiten comparar variantes del modelo (bf16 frente a Q8_0 frente a Q4_K_M) antes de publicar.
- Escalado a agentes humanos: el modelo puede decidir cuándo derivar el caso a una persona de la equipo, integrándose en un flujo híbrido de atención.
- Pruebas de regresión de agentes conversacionales: sirve como referencia ligera para medir tasas de resolución y errores graves en pipelines de evaluación de agentes con herramientas.
- Demostraciones y docencia sobre agentes con tool calling: el par demo (`demo/app.py`) ejecuta el adaptador en GPU o el GGUF en CPU con una única variable de entorno, lo que facilita reproducir el experimento en un portátil.

## Benchmarks y rendimiento

Resultados sobre los 300 escenarios de prueba publicados por el autor (un caso cuenta como resuelto cuando el estado final del sistema coincide con lo que dicta la política; un error grave es dar al cliente algo a lo que no tenía derecho):

| Versión | Resueltos (IC 95 %) | Errores graves | Tiempo por turno (mediana) |
|---|---|---|---|
| Este GGUF (Q8_0), CPU con 8 hilos | 85,3 % (81,3–89,3) | 15 | 3,2 s |
| Adaptador bf16, GPU RX 7600 | 85,7 % (81,7–89,3) | 19 | 2,5 s |
| Q4_K_M (descartada, no publicada) | Evaluada solo en 79 escenarios | No disponible | No disponible |

En los 267 escenarios en los que el cliente simulado abrió la conversación del mismo modo en ambas pruebas, el GGUF Q8_0 y el adaptador bf16 resolvieron el mismo número de casos: 226. La variante Q4_K_M se descartó: en los 72 escenarios con apertura idéntica perdió 12 casos que el bf16 resolvía y solo ganó 2.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el GGUF Q8_0 ocupa 1,83 GB en disco y se carga en RAM del sistema.
- GPU recomendadas: no necesarias. La variante bf16 del adaptador se midió en una AMD RX 7600 (2,5 s por turno de mediana).
- Cabe en cualquier equipo de consumo con al menos ~2 GB de RAM libre para los pesos, más el overhead del contexto y del runtime de llama.cpp.
- Despliegue: llama.cpp (commit `0c1e570`) mediante `llama-cpp-python==0.3.36`; requiere `transformers==5.22.2` y `huggingface_hub`. No requiere torch ni GPU. La instalación de llama-cpp-python compila en local y tarda varios minutos.
- Latencia y throughput: 3,2 s de mediana por turno en CPU con 8 hilos; 2,5 s por turno en GPU RX 7600 con bf16. No se publican cifras de throughput (tokens/s).
- Importante: no debe usarse `create_chat_completion`; hay que construir los tokens con el tokenizer de Qwen3 y pasarlos directamente a llama.cpp para respetar el formato de conversación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Qwen3-1.7B agente soporte pt-BR GGUF) | 1,7 B | No disponible | Agente de soporte pt-BR con tool calling, cuantizado Q8_0 | Apache 2.0 | GGUF en HF; adaptador bf16 en repo separado |
| Qwen/Qwen3-1.7B | 1,7 B (aprox. 2 B según la model card) | No disponible en la información recogida | Modelo base generalista multilingüe | Apache 2.0 | Pesos en HF |
| FMendonca/qwen3-1.7b-agente-suporte-ptbr | 1,7 B | No disponible | Adaptador LoRA fusionado en bf16, misma tarea | Apache 2.0 | Pesos en HF |

La comparación con alternativas de la misma categoría (agentes de soporte ajustados en modelos pequeños) no está disponible en la información proporcionada. Frente al Qwen3-1.7B original, este modelo sacrifica generalidad y multilingüismo a cambio de un formato de agente específico y una evaluación cuantitativa sobre 300 escenarios; frente a su adaptador bf16, ofrece prácticamente el mismo rendimiento (85,3 % frente a 85,7 %) con un 20 % más de latencia por turno pero sin necesidad de GPU.

## Limitaciones y advertencias

- Escenarios y cliente sintéticos: los 300 casos de prueba y el cliente que los genera son artificiales, y la empresa (Garfo Ligeiro) es ficticia; el rendimiento en tráfico real no está validado.
- Errores graves: el 5 % de los casos (15 de 300) produjo concesiones indebidas al cliente, lo que exige límites rígidos en las herramientas (topes de reembolso, validaciones de elegibilidad) antes de cualquier uso en producción.
- Formato de conversación no estándar: no usa el template nativo de Qwen3; integrarlo con APIs que esperan `create_chat_completion` o templates estándar produce comportamiento incorrecto.
- Idioma: entrenado y evaluado únicamente en portugués de Brasil; no hay evidencia de calidad en otros idiomas.
- Contexto: la longitud de contexto efectiva no se detalla en la información disponible; el autor no publica pruebas de conversaciones largas.
- Sesgos: no se documentan análisis de sesgos en la información proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero la responsabilidad sobre las decisiones automáticas (reembolsos, cancelaciones) recae en el integrador.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta; es un proyecto personal, no un modelo mantenido por un equipo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FMendonca/qwen3-1.7b-agente-suporte-ptbr-gguf
- Adaptador base en bf16: https://huggingface.co/FMendonca/qwen3-1.7b-agente-suporte-ptbr
- Repositorio GitHub del proyecto: https://github.com/fernandomcrsilva/agente-suporte-ptbr
- Formato de conversación (`src/formato_qwen.py`): https://github.com/fernandomcrsilva/agente-suporte-ptbr/blob/main/src/formato_qwen.py
- Script de conversión a GGUF (`src/gguf.py`): https://github.com/fernandomcrsilva/agente-suporte-ptbr/blob/main/src/gguf.py
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
