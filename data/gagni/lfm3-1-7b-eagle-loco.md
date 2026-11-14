# gagni/lfm3-1.7b-eagle-loco

## Resumen

LFM3-1.7B Eagle LOCO es un paquete de inferencia derivado de LiquidAI/LFM3-1.7B, publicado por el usuario gagni, pensado para ejecutarse en el motor LOCO sobre CPU. No es un modelo nuevo entrenado desde cero: es una conversión de los pesos originales a int4 (con cabeza de salida en int8) más un drafter EAGLE-3 entrenado específicamente para acelerar la decodificación especulativa sin alterar la distribución de salida del modelo, ya que los borradores se verifican contra el modelo base.

El interés práctico reside en el rendimiento en CPU: según la model card, en un portátil con i7-13700H se pasa de unos 38 tokens por segundo en modo plano a 78 en inglés y 72 en francés con el drafter en cadena de 3, y en un CCD de EPYC de 6 núcleos de unos 40 a 82/79. Esto lo sitúa como una opción para servir un modelo de 1.700 millones de parámetros en hardware sin GPU, con una pérdida de calidad declarada de aproximadamente 0,12 nats por token frente al modelo en coma flotante.

La relevancia es doble: por un lado, demuestra un flujo de trabajo reproducible de cuantización y decodificación especulativa para CPU; por otro, arrastra las restricciones de la LFM Open License v1.0, que limita el uso comercial a entidades por debajo de un umbral de ingresos. El modelo base solo declara inglés y francés, y el drafter se entrenó únicamente con respuestas en esos dos idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base LFM3-1.7B de Liquid AI); paquete int4 con drafter EAGLE-3 (bloque MTP-1 de 1.920 neuronas) |
| Parametros totales | 1.700 millones (modelo base); el drafter añade un bloque de 1.920 neuronas, tamaño total no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 en pesos (round-to-nearest), cabeza de salida en int8 |
| Idiomas soportados | inglés y francés |
| Licencia | LFM Open License v1.0 (license: other, license_name: lfm1.0) |
| Formato de pesos | safetensors (`loco-*.safetensors`, `loco_config.json`, `packed.json`) para el motor LOCO |

## Arquitectura y entrenamiento

El modelo base es LFM3-1.7B de Liquid AI, un transformer de 1.700 millones de parámetros. El paquete de gagni aplica cuantización int4 por redondeo simple a todos los pesos, incluidos los de mezcla y las convoluciones cortas, y mantiene la cabeza de salida en int8. Sobre esa base se añade un drafter de decodificación especulativa tipo EAGLE-3: un bloque de 1.920 neuronas inicializado a partir de la capa 20 del modelo, con capas de lectura MTP-1 en las capas 2, 12 y 21 (`mtp_taps`) y un vocabulario de borrador propio construido sobre respuestas en inglés y francés.

El drafter se entrenó con aproximadamente 270.000 respuestas generadas por el propio LFM3 en inglés y francés, en una sola H100. La decodificación especulativa verifica cada borrador contra el modelo, por lo que la distribución de salida no cambia; el coste declarado de la cuantización int4 es de unos 0,12 nats por token frente al modelo en coma flotante. No se especifican en la información disponible el número de tokens de preentrenamiento del modelo base, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto en inglés y francés.
- Modo de razonamiento (thinking) activado por defecto, expuesto como `reasoning_content` y desactivable con `"chat_template_kwargs": {"enable_thinking": false}`.
- Decodificación especulativa con drafter EAGLE-3, con una tasa de aceptación de borradores de aproximadamente el 60 % en inglés y del 48-60 % en francés.
- Servicio mediante API compatible con OpenAI a través de `loco-server` y su pasarela.
- Soporte de tool calling, agentes o visión: no disponible en la información proporcionada.

## Casos de uso

- Asistente local en portátil sin GPU: con el motor LOCO y este paquete se obtienen 72-78 tokens por segundo en un i7-13700H, suficiente para chat interactivo en inglés o francés sin depender de la nube.
- Servicio de inferencia en servidores CPU: en un CCD de EPYC de 6 núcleos se alcanzan 79-82 tokens por segundo, lo que permite atender peticiones concurrentes modestas mediante la pasarela compatible con OpenAI en `http://127.0.0.1:8000/v1`.
- Prototipado de pipelines con API OpenAI: al exponer un endpoint compatible, se puede sustituir un proveedor externo por este servicio local para pruebas de integración y desarrollo.
- Procesamiento por lotes de texto en inglés y francés: clasificación, resumen o reescritura de documentos donde el throughput en CPU y el coste cero de GPU son prioritarios.
- Evaluación de decodificación especulativa: el paquete sirve como referencia reproducible para medir la ganancia de un drafter EAGLE-3 sobre un modelo de 1.700 millones de parámetros en CPU.
- Despliegue en entornos con restricciones de hardware: escenarios de borde o máquinas sin acelerador donde un modelo de 1.700 millones en int4 (repo de 2,9 GB) cabe en memoria y disco con holgura.
- Razonamiento con modo thinking en tareas de análisis: para consultas que requieren pasos intermedios en inglés o francés, activando `reasoning_content`.

## Benchmarks y rendimiento

La model card solo publica velocidades de decodificación, no resultados de calidad. Se reproducen a continuación:

| Máquina | Modo plano (ids/s) | Con drafter, cadena 3 (ids/s) |
|---|---|---|
| Portátil i7-13700H, 6 P-cores, perfil de rendimiento, inglés | ~38 | 78 |
| Portátil i7-13700H, mismo perfil, francés | ~38 | 72 |
| Un CCD de AMD EPYC (6 núcleos), inglés / francés | ~40 | 82 / 79 |

Medido con el motor LOCO el 2026-11-08; en modo ahorro de energía el portátil es aproximadamente tres veces más lento. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; el paquete está diseñado para CPU. El repositorio ocupa 2,9 GB en disco.
- CPU: se han medido un Intel i7-13700H (6 P-cores) y un CCD de AMD EPYC de 6 núcleos; no se especifican requisitos mínimos de RAM, aunque por el tamaño del paquete conviene disponer de varios GB libres.
- GPU: no se requiere; no hay datos de rendimiento en GPU para este paquete.
- Despliegue: exclusivamente mediante el motor LOCO (`./loco.sh start lfm3`, `loco-server` con pasarela compatible con OpenAI). No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 72-82 ids/s con drafter en las máquinas medidas, frente a 38-40 sin él; en modo ahorro de energía, aproximadamente un tercio de esas cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| gagni/lfm3-1.7b-eagle-loco | 1.700 M + drafter | no disponible | LFM Open License v1.0 | Hugging Face, motor LOCO | Paquete int4 para CPU con decodificación especulativa |
| LiquidAI/LFM3-1.7B | 1.700 M | no disponible | LFM Open License v1.0 | Hugging Face | Modelo base en coma flotante; sin aceleración específica para CPU |
| Alternativas de tamaño similar (p. ej. Qwen o Llama de ~1-2 B) | ~1-2 B | no disponible | varía según modelo | Hugging Face | No se dispone de datos comparativos de rendimiento en la información proporcionada |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas; la comparativa se limita a parámetros, licencia y formato de despliegue.

## Limitaciones y advertencias

- Solo se declaran inglés y francés; el drafter se entrenó únicamente con respuestas en esos idiomas y no se midió su tasa de aceptación en otros ni en código largo.
- La cuantización int4 es un redondeo simple (round-to-nearest) y cuesta aproximadamente 0,12 nats por token frente al modelo en coma flotante.
- La licencia LFM Open License v1.0 limita el uso comercial a entidades por debajo de un umbral de ingresos; es imprescindible revisar el texto de la licencia antes de un despliegue comercial.
- Dependencia total del motor LOCO: no hay pesos en GGUF ni compatibilidad declarada con otros runners, lo que limita la portabilidad.
- Riesgo de alucinación y sesgos: no se documentan en la información disponible; deben evaluarse por separado para el modelo base.
- Longitud de contexto no disponible, lo que impide planificar casos de uso con documentos largos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto reciente y sin validación comunitaria.
- El modo thinking está activado por defecto, lo que incrementa el consumo de tokens si no se desactiva explícitamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gagni/lfm3-1.7b-eagle-loco
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia LFM Open License v1.0: incluida en el repositorio como `LICENSE`
- Motor LOCO: no se proporciona enlace en la información disponible
