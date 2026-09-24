# qualcomm/SmolLM2-1.7B-Instruct

## Resumen

SmolLM2-1.7B-Instruct es un modelo de lenguaje compacto de 1.700 millones de parámetros, ajustado por instrucciones, que Qualcomm redistribuye en un repositorio propio con artefactos pre-exportados y compilados para inferencia en dispositivo (on-device) sobre plataformas Snapdragon. El modelo original lo desarrolla HuggingFaceTB (familia SmolLM2, disponible en 135M, 360M y 1.7B), y esta variante concreta se centra en el despliegue eficiente en NPU Hexagon mediante el runtime GENIEX_QAIRT de Qualcomm, en precisión w4a16.

El problema que resuelve es el de ejecutar un LLM conversacional sin conexión ni servidor: al pesar tan solo 1.7B parámetros y cuantizarse a 4 bits en pesos, cabe en la memoria de un teléfono o de un PC con Snapdragon y genera texto a velocidades de entre 7,8 y 21 tokens por segundo según el chipset, con un tiempo hasta el primer token de 0,08 a 5,9 segundos en función de la longitud del prompt.

Es relevante ahora porque la ficha incluye artefactos listos para usar en chipsets de última generación (Snapdragon 8 Elite Gen 5 for Galaxy, 8 Elite for Galaxy, X2 Elite, X Elite, Dragonwing IQ-8275 e IQ-9075) y una vía alternativa para exportar el modelo con pesos propios o formas de entrada personalizadas. La arquitectura es un transformer decoder de tipo Llama, con licencia Apache 2.0 heredada del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder de tipo Llama (denominada "Llama-based" en la ficha del autor) |
| Parametros totales | 1,7 mil millones (1.7B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens en el modelo base; los perfiles pre-exportados y perfilados por el autor se documentan a 4096 tokens |
| Tipos de cuantizacion | w4a16 (pesos de 4 bits, activaciones de 16 bits) en los artefactos pre-exportados; la librería de exportación admite configuraciones personalizadas |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (checkpoint de origen) y artefactos pre-exportados para GENIEX_QAIRT (QAIRT 2.45) distribuidos como archivos .zip por chipset |

## Arquitectura y entrenamiento

El modelo base SmolLM2-1.7B-Instruct es un transformer decoder de tipo Llama entrenado por HuggingFaceTB sobre aproximadamente 11 billones de tokens procedentes de FineWeb-Edu, DCLM, The Stack y conjuntos curados de matemáticas, seguido de un ajuste por instrucciones para tareas conversacionales y de seguimiento de instrucciones. La ficha de Qualcomm no detalla la composición exacta del dataset de ajuste ni si se emplearon técnicas concretas de alineación como RLHF o DPO, por lo que esos datos figuran como no disponibles en esta información.

La aportación específica de este repositorio es la cadena de exportación y compilación: Qualcomm AI Hub Models y Qualcomm AI Hub Workbench convierten el checkpoint en grafos ejecutables sobre la NPU de los chipsets Snapdragon, con cuantización w4a16 gestionada por QAIRT 2.45. La librería permite además reexportar el modelo con pesos afinados propios, formas de entrada personalizadas y configuraciones de dispositivo y runtime distintas de las predeterminadas. No se documentan innovaciones de decodificación (por ejemplo, decodificación especulativa) ni mecanismos de atención alternativos.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones en formato de chat, gracias al ajuste por instrucciones del modelo base.
- Resumen, reescritura y transformación de texto, tareas para las que el modelo base está explícitamente entrenado.
- Llamada a funciones (function calling), citada en la documentación pública del modelo base como capacidad soportada.
- Razonamiento multi-turno básico dentro de la ventana de contexto de 8192 tokens del modelo base.
- Ejecución totalmente local en el dispositivo, sin necesidad de conectividad ni de enviar datos a un servidor.
- Inferencia en NPU mediante el runtime GENIEX_QAIRT, con artefactos ya compilados para los chipsets listados.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de visión o audio: no disponibles; se trata de un modelo exclusivamente de texto.
- Modo de razonamiento explícito (thinking mode): no disponible.

## Casos de uso

- Asistentes conversacionales sin conexión en aplicaciones móviles: el modelo se ejecuta íntegramente en la NPU del teléfono con los artefactos w4a16 pre-exportados, de modo que la app funciona en modo avión y los datos del usuario no salen del dispositivo.
- Autocompletado y reescritura de texto en editores y teclados: la latencia de primer token de 0,08 a 0,09 segundos en Snapdragon 8 Elite permite sugerencias casi instantáneas para prompts cortos (hasta 128 tokens).
- Resumen de notas y correos en aplicaciones de productividad: con 4096 tokens de contexto en los perfiles perfilados, el modelo puede condensar hilos de correo o documentos breves en local y sin coste por token.
- Atención al cliente embebida en el propio dispositivo: conversaciones multi-turno con función calling para consultar APIs locales (agenda, ajustes del sistema) sin depender de un backend.
- Preprocesado y clasificación de texto en pipelines de datos en el borde: extracción de campos, etiquetado y normalización en gateways o equipos industriales con Dragonwing IQ-8275 o IQ-9075.
- Prototipado y validación de aplicaciones de IA generativa en PC con Snapdragon X Elite o X2 Elite: el modelo sirve como banco de pruebas para medir latencia y consumo antes de integrar modelos mayores.
- Agentes de automatización de tareas simples: encadenamiento de varios pasos con llamada a herramientas para flujos como reservar, consultar o registrar información en apps locales.
- Generación de texto en entornos con requisitos de privacidad estrictos (sanidad, legal, sector público): al no requerir servidor, se elimina la exposición de datos personales a terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La ficha de Qualcomm no incluye cifras de MMLU, HumanEval, GSM8K ni de otras pruebas estándar para esta variante exportada, ni tampoco comparaciones numéricas con modelos de tamaño similar. Las únicas métricas publicadas son de rendimiento en hardware (velocidad de generación y tiempo hasta el primer token), recogidas en la sección siguiente. Una fuente secundaria de la búsqueda web afirma que el modelo base se compara favorablemente con Llama-1B y Qwen2.5-1.5B, pero no aporta cifras verificables y, por tanto, no se reproducen aquí.

## Requisitos de hardware

- VRAM estimada para inferencia: las cifras siguientes son estimaciones calculadas a partir del número de parámetros y no están publicadas por el autor. En fp16, unos 3,4 GB; en int8, unos 1,7 GB; en 4 bits, alrededor de 0,9-1,1 GB. Hay que sumar el caché KV, cuyo tamaño a 8192 tokens no se especifica en la información disponible.
- Plataformas objetivo documentadas: Snapdragon 8 Elite Gen 5 for Galaxy Mobile, Snapdragon 8 Elite for Galaxy Mobile, Snapdragon X2 Elite, Snapdragon X Elite, Qualcomm Dragonwing IQ-8275 e IQ-9075. Los artefactos requieren QAIRT 2.45.
- Cabe en hardware de consumo: sí, por tamaño (1.7B) cabe en tarjetas gráficas de gama media y alta, pero la vía soportada y perfilada oficialmente es la NPU de los Snapdragon listados, no GPU de escritorio.
- Opciones de despliegue: GenieX (vía de referencia, con quickstart propio), runtime Genie (soporte que será deprecado próximamente), Qualcomm AI Hub Workbench para compilar, perfilar y evaluar, y la librería Qualcomm AI Hub Models para exportar con configuraciones personalizadas. No se documentan en esta ficha otros runtimes como vLLM, llama.cpp, Ollama o TGI.
- Throughput y latencia medidos (contexto de 4096 tokens, precisión w4a16, runtime GENIEX_QAIRT):

| Chipset | Velocidad de respuesta (tokens/s) | Tiempo hasta el primer token (s) |
|---|---|---|
| Snapdragon 8 Elite Gen 5 for Galaxy Mobile | 21,05 | 0,081 - 2,593 |
| Snapdragon 8 Elite for Galaxy Mobile | 20,54 | 0,094 - 3,018 |
| Snapdragon X2 Elite | 7,85 | 0,183 - 5,867 |
| Qualcomm Dragonwing Q-8750 | 20,54 | 0,094 - 3,018 |

El rango de tiempo hasta el primer token corresponde al límite inferior con prompts de hasta 128 tokens y al límite superior con prompts que ocupan la longitud de contexto completa (8192 tokens).

## Comparativa con modelos similares

Datos de parámetros, contexto y licencia tomados de las fichas públicas de cada modelo; los valores de rendimiento no están disponibles en la información proporcionada y no se han verificado en esta búsqueda.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| qualcomm/SmolLM2-1.7B-Instruct (esta ficha) | 1,7B | 8192 en el base; 4096 en los perfiles perfilados | Apache 2.0 | Artefactos w4a16 para chipsets Snapdragon concretos vía Qualcomm AI Hub | No disponible |
| HuggingFaceTB/SmolLM2-1.7B-Instruct | 1,7B | 8192 | Apache 2.0 | Checkpoint PyTorch/Safetensors en HuggingFace | No disponible |
| Qwen2.5-1.5B-Instruct | 1,5B | 32768 | Apache 2.0 | Checkpoint en HuggingFace | No disponible |
| Llama-3.2-1B-Instruct | 1,2B | 131072 | Licencia comunitaria de Llama 3.2 | Checkpoint en HuggingFace | No disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la ficha proporcionada. Al proceder de entrenamiento sobre datos web (FineWeb-Edu, DCLM, The Stack), es esperable heredar sesgos presentes en esas fuentes, pero no hay evaluación publicada en esta información.
- Riesgo de alucinación: con 1,7B parámetros, la capacidad de retener conocimiento factual es limitada y el riesgo de invención en tareas de conocimiento abierto es alto. No hay métricas de fidelidad publicadas.
- Limitación de contexto: la ventana útil en los perfiles exportados es de 4096 tokens. Con prompts largos, el tiempo hasta el primer token se degrada hasta 2,6-5,9 segundos según el chipset.
- Idiomas: no se declara ningún conjunto de idiomas soportados; hay que asumir un comportamiento claramente superior en inglés y no validado en otras lenguas.
- Licencia: Apache 2.0 permite uso comercial, pero la licencia del modelo base debe consultarse en su propio repositorio. Los artefactos pre-exportados quedan vinculados a QAIRT 2.45 y a chipsets concretos, por lo que la portabilidad entre plataformas no está garantizada.
- Dependencia de proveedor: el flujo soportado pasa por Qualcomm AI Hub Workbench y requiere registro de cuenta; el runtime Genie será deprecado, lo que obliga a migrar a GenieX.
- Madurez del repositorio: 0 descargas y 0 "likes" en el momento de la consulta, sin validación de la comunidad.
- Formato de pesos: al estar pensado para exportación y compilación, los archivos distribuidos son específicos de runtime y chipset, no checkpoints genéricos reutilizables en otros frameworks sin reexportar.
- Casos de uso en producción: no se documentan evaluaciones de seguridad, filtrado de contenido ni moderación para esta variante.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/qualcomm/SmolLM2-1.7B-Instruct
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct
- Paper de SmolLM2: https://arxiv.org/abs/2502.02737
- Librería Qualcomm AI Hub Models (GitHub): https://github.com/qualcomm/ai-hub-models/blob/v0.63.0/src/qai_hub_models/models/smollm2_1_7b_it
- Página del modelo en Qualcomm AI Hub: https://aihub.qualcomm.com/models/smollm2_1_7b_it
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Quickstart de GenieX: https://geniex.aihub.qualcomm.com/en/get-started/quickstart
- Tutorial LLM-on-Genie: https://github.com/qualcomm/ai-hub-apps/tree/main/tutorials/llm_on_genie
- Ficha del modelo en ModelScope: https://www.modelscope.cn/models/AI-ModelScope/SmolLM2-1.7B-Instruct
- Análisis en dev.co: https://dev.co/ai/llms/smollm2-1-7b-instruct
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/smollm2-17b-instruct-huggingfacetb
