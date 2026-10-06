# finndot/finnai-slm-v4-litertlm

## Resumen

FinnAI SLM v4 — LiteRT-LM INT4 es un paquete de pesos cuantizados publicado por finndot para ejecución en dispositivo (on-device), derivado del modelo base finndot/finnai-slm-v4. Se distribuye en formato `.litertlm`, el contenedor propio de LiteRT-LM de Google, pensado para inferencia en Android y entornos móviles sin conexión a servidores remotos. El nombre del fichero (`qwen3_1.7b_finndot_nothink_q4_ekv1280.litertlm`) indica que el modelo subyacente es un Qwen3 de aproximadamente 1.700 millones de parámetros, afinado por finndot y cuantizado a int4.

El problema que aborda es concreto: ejecutar un modelo de lenguaje especializado en dominio financiero y parseo de SMS bancarios directamente en el teléfono, con un tamaño de fichero inferior a 1 GB (973.979.088 bytes) y una caché KV limitada a 1280 tokens. Esto lo sitúa en el segmento de modelos pequeños para tareas de extracción y clasificación sobre texto corto, no en el de asistentes conversacionales de propósito general.

La relevancia actual viene de dos factores. Primero, la licencia Apache 2.0 permite uso comercial sin restricciones de atribución más allá de las habituales. Segundo, el empaquetado LiteRT-LM reduce la fricción de despliegue en Android frente a alternativas como llama.cpp o MLC, aunque a cambio ata el modelo a ese runtime. Los idiomas declarados son inglés (en) e hindi (hi), coherente con el enfoque en banca india que sugieren sus etiquetas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3; detalles especificos del fine-tuning no disponibles) |
| Parametros totales | Aproximadamente 1.700 millones (segun el nombre del fichero `qwen3_1.7b`) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible como contexto maximo; la cache KV esta limitada a 1280 tokens |
| Tipos de cuantizacion | `dynamic_int4_block32` (int4 con bloques de 32) |
| Idiomas soportados | Ingles (en) e hindi (hi) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); pesos bf16 completos en el modelo base |

## Arquitectura y entrenamiento

El paquete se construye sobre `finndot/finnai-slm-v4`, a su vez derivado de un Qwen3 de 1.7B. Qwen3 es una familia de transformers decoder-only con atención completa estándar en los tamaños pequeños, aunque la información proporcionada no detalla si se aplicaron modificaciones arquitectónicas durante el fine-tuning. El detalle técnico más relevante del paquete es la cuantización `dynamic_int4_block32`, que agrupa los pesos en bloques de 32 elementos con escalas dinámicas, un esquema habitual para reducir el error de cuantización en modelos pequeños donde cada décima de precisión importa.

No se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de alineación como RLHF o DPO en el modelo base o en el afinamiento de finndot. Las etiquetas del repositorio (finance, sms-parsing, indian-banking) sugieren un ajuste orientado a extracción de información financiera en SMS, pero no hay documentación que lo confirme con cifras. La variante se distribuye explícitamente con el modo de razonamiento desactivado (`nothink`), lo que implica que se eliminó la fase de cadena de pensamiento de Qwen3 para priorizar latencia y tamaño de salida.

## Capacidades

- Generación de texto en inglés e hindi.
- Parseo y extracción de información de SMS, presumiblemente bancarios según las etiquetas del repositorio.
- Clasificación y estructuración de texto financiero de formato corto.
- Ejecución on-device en Android mediante LiteRT-LM.
- Inferencia en modo sin razonamiento (`nothink`), con respuestas directas.
- No hay evidencia de soporte de tool calling ni function calling en la información disponible.
- No hay evidencia de capacidades de agente, multi-step reasoning, visión o audio.
- No se declara soporte multilingüe más allá de inglés e hindi.

## Casos de uso

- Parseo de SMS bancarios en aplicaciones Android: el modelo puede clasificar y extraer campos (importe, remitente, fecha, tipo de transacción) de mensajes entrantes sin enviar datos a un servidor, lo que es relevante para cumplimiento de privacidad en banca india.
- Categorización automática de transacciones: integrado en una app de finanzas personales, etiqueta movimientos a partir del texto del SMS para generar informes de gasto.
- Detección de fraude en notificaciones: al ejecutarse en el dispositivo, puede marcar SMS sospechosos en tiempo real sin latencia de red ni coste de API.
- Asistentes de finanzas personales offline: responde a consultas sobre el historial de transacciones locales manteniendo los datos en el teléfono.
- Preprocesado en pipelines móviles: normaliza y estructura texto antes de enviarlo a un modelo mayor en la nube, reduciendo el volumen de datos transmitidos.
- Prototipado rápido de funciones NLP en Android: sirve como base para desarrolladores que quieran validar tareas de extracción sin montar infraestructura de servidor.
- Aplicaciones para mercados con conectividad limitada: al funcionar íntegramente en el dispositivo, es viable en zonas con red intermitente o costosa, un escenario común en la India.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Almacenamiento: el fichero `.litertlm` ocupa 973.979.088 bytes (aproximadamente 929 MiB); el repositorio completo, 1,0 GB.
- Memoria en ejecución: hay que sumar al peso del modelo la caché KV configurada (máximo 1280 tokens). No se publican cifras exactas de RAM pico.
- Diseñado explícitamente para ejecución en dispositivos móviles Android mediante LiteRT-LM; no se documentan GPU de escritorio compatibles.
- Al estar cuantizado a int4, es plausible que quepa en móviles de gama media-alta con varios GB de RAM, pero no hay requisitos mínimos publicados.
- Opciones de despliegue documentadas: LiteRT-LM (runtime de Google). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| finndot/finnai-slm-v4-litertlm | ~1.7B | KV limitada a 1280 tokens | `.litertlm` | Apache 2.0 | HuggingFace |
| finndot/finnai-slm-v4 (modelo base) | ~1.7B | No disponible | bf16 (safetensors presumiblemente) | Apache 2.0 | HuggingFace |
| Qwen3 1.7B (modelo original) | 1.7B | No disponible en esta ficha | safetensors, GGUF y otros | Apache 2.0 | HuggingFace |

No se dispone de datos de rendimiento comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible. Al estar afinado para banca india, puede presentar sesgos geográficos y de dominio.
- Riesgo de alucinación: no cuantificado; en modelos de 1.7B el riesgo en tareas de extracción estructurada es apreciable y requiere validación posterior.
- La caché KV limitada a 1280 tokens restringe el manejo de documentos largos; el modelo está pensado para entradas cortas tipo SMS.
- Idiomas limitados a inglés e hindi; no se declara soporte de castellano ni de otras lenguas.
- El modo de razonamiento está desactivado (`nothink`), por lo que no cabe esperar cadenas de pensamiento ni resolución de problemas complejos.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo base `finndot/finnai-slm-v4` de forma independiente.
- El formato `.litertlm` ata el modelo al runtime LiteRT-LM; no es portable directamente a otros motores de inferencia.
- Sin descargas ni likes registrados en el momento de la consulta, lo que implica ausencia de validación comunitaria.

## Enlaces

- Repositorio LiteRT-LM INT4: https://huggingface.co/finndot/finnai-slm-v4-litertlm
- Modelo base: https://huggingface.co/finndot/finnai-slm-v4
- Documentación de LiteRT-LM: no disponible en la información proporcionada
- Paper o blog de entrenamiento: no disponible
- Demo: no disponible
