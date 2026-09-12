# Jeff98/MiniCPM5-2B-int4-gq-ov

## Resumen

MiniCPM5-2B-int4-gq-ov es una conversión comunitaria a OpenVINO del modelo openbmb/MiniCPM5-2B, publicada por el usuario Jeff98. Se trata de un modelo de generación de texto de aproximadamente 2.000 millones de parámetros (según la denominación del modelo base) cuyos pesos han sido comprimidos a INT4 con cuantización simétrica por grupos (group-wise) de tamaño 128 sobre todas las capas elegibles, es decir, un ratio de 1,0. El resultado es un artefacto listo para inferencia local en hardware compatible con OpenVINO: CPU, GPU y NPU de Intel.

El problema que resuelve es el del despliegue de un modelo conversacional en equipos de borde y AI PCs con memoria limitada. Frente a los pesos en coma flotante del modelo original, la compresión INT4 solo de pesos reduce de forma sustancial la huella de memoria, y el repositorio completo ocupa 1,6 GB. La conversión fue probada por el autor en un Intel Core Ultra 7 155H, y puede servirse tanto con OpenVINO GenAI como con OpenVINO Model Server exponiendo una API compatible con OpenAI.

Su relevancia actual radica en que combina tres piezas muy demandadas en el despliegue local: un modelo pequeño con soporte de tool calling, una cuantización de 4 bits sin necesidad de dataset de calibración y un runtime (OpenVINO) que aprovecha CPU, iGPU y NPU del mismo equipo. Es importante subrayar que se trata de una conversión de la comunidad: la arquitectura, el entrenamiento, el tokenizador, la plantilla de chat y la licencia provienen íntegramente del modelo original de OpenBMB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el model card de esta conversión no la especifica; corresponde al modelo base openbmb/MiniCPM5-2B) |
| Parametros totales | aproximadamente 2.000 millones (deducido de la denominación del modelo base; no confirmado en la información disponible) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 de solo pesos, simétrica, por grupos, group size 128, ratio 1,0; sin AWQ, GPTQ, estimación de escalas ni dataset de calibración |
| Idiomas soportados | inglés (en) y chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (export task `text-generation-with-past`, con soporte de caché KV); no se distribuyen safetensors ni GGUF en este repositorio |

## Arquitectura y entrenamiento

Esta ficha describe una conversión, no un entrenamiento. El autor no aporta información sobre la arquitectura interna, el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF, DPO u otra fase de alineamiento; todos esos datos habría que consultarlos en el modelo original openbmb/MiniCPM5-2B. Lo que sí se detalla es la receta de compresión aplicada: cuantización de solo pesos en INT4, simétrica, por grupos de 128 elementos, con ratio 1,0 para solicitar 4 bits en todas las capas elegibles. Las operaciones que no admiten esa configuración se gestionan según el comportamiento de respaldo del exportador de OpenVINO.

La innovación técnica relevante aquí es doble. Por un lado, la compresión es data-free: no se aplica AWQ, GPTQ, estimación de escalas ni optimización con dataset de calibración, lo que simplifica enormemente la reproducibilidad del artefacto pero también implica que la calidad no está optimizada frente a métodos conscientes de las activaciones. Por otro, la exportación usa la tarea `text-generation-with-past`, de modo que el modelo se entrega con soporte de caché KV, condición necesaria para generación multi-turno y contextos largos sin recalcular el prefijo. El tamaño de grupo de 128 se justifica en el model card como un equilibrio práctico entre compresión, velocidad de inferencia y calidad para modelos de lenguaje pequeños.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento ligero, según la propia declaración de usos previstos del autor.
- Soporte de tool calling y function calling heredado del modelo original MiniCPM5. El autor advierte de que su comportamiento depende del backend de servicio, de la implementación de la plantilla de chat, del parser de herramientas, de la configuración de generación y del número y complejidad de los esquemas de herramientas.
- Experimentación con agentes y flujos multi-paso, siempre condicionada al soporte del parser de herramientas por parte del backend que aplique la plantilla de chat de MiniCPM5.
- Asistencia relacionada con código, listada entre los usos previstos.
- Inferencia local con caché KV mediante OpenVINO GenAI y despliegue como servicio con OpenVINO Model Server y API compatible con OpenAI.
- Ejecución en CPU, GPU y NPU de Intel, con la advertencia explícita de que la compatibilidad y el comportamiento numérico en NPU deben validarse por generación de hardware, driver y versión de OpenVINO.
- No se documentan capacidades de visión, audio ni modo de pensamiento explícito en la información disponible.

## Casos de uso

- Asistente conversacional local en AI PCs: el modelo se ejecuta con OpenVINO GenAI sobre GPU o NPU de Intel con una huella de memoria reducida, lo que permite mantener un asistente en el propio equipo sin enviar datos a la nube.
- Despliegue como servicio interno con API compatible con OpenAI: mediante OpenVINO Model Server se expone el modelo en un puerto REST y se consume con el cliente oficial de OpenAI, lo que facilita sustituir un proveedor externo por inferencia local en aplicaciones ya existentes.
- Automatización con tool calling: integrado en un backend que soporte la plantilla de chat de MiniCPM5 y su parser de herramientas, el modelo puede invocar funciones para consultar bases de datos, lanzar tareas o recuperar información, siempre que se validen los esquemas de herramientas empleados.
- Asistencia de código en el puesto de trabajo: al estar orientado a ayuda relacionada con código y ejecutarse en local, encaja en entornos con restricciones de confidencialidad donde no se permite enviar fragmentos de código a servicios externos.
- Procesamiento bilingüe chino-inglés: traducción, resumen o reformulación de documentos entre ambos idiomas en pipelines internos, aprovechando que son los dos idiomas declarados.
- Prototipado y experimentación en borde: al ocupar 1,6 GB en disco y ejecutarse en CPU, sirve para validar flujos de IA generativa en dispositivos con recursos limitados antes de escalar a modelos mayores.
- Evaluación comparativa de cuantizaciones: útil como referencia para medir la pérdida de calidad entre los pesos en coma flotante del modelo base y esta variante INT4 sin calibración, en tareas concretas del dominio propio.
- Chat multi-turno con caché KV: la exportación con `text-generation-with-past` permite reutilizar el prefijo en conversaciones encadenadas, reduciendo el coste de generación respecto a recalcular todo el contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model card de esta conversión no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, y remite al modelo original openbmb/MiniCPM5-2B para consultar capacidades y resultados. Tampoco se publican cifras de latencia o throughput para CPU, GPU o NPU, más allá de la advertencia de que dependen de la arquitectura de la GPU, la versión del driver, la versión de OpenVINO, la longitud del prompt y los parámetros de generación.

## Requisitos de hardware

- Huella en disco: 1,6 GB, el tamaño declarado del repositorio completo.
- Peso teórico de los pesos cuantizados: en torno a 1 GB para 2.000 millones de parámetros a 4 bits, cifra coherente con el tamaño del repositorio; no incluye el overhead del runtime ni la caché KV.
- Memoria en inferencia: no disponible de forma oficial. Como estimación derivada del tamaño del repositorio, cabe esperar un consumo del orden de 1,5 a 2,5 GB sumando pesos, runtime y caché KV, pero debe medirse en el hardware objetivo.
- CPU Intel: soportada mediante `--target_device CPU`. Es la opción de menor rendimiento pero la más universal.
- GPU Intel: objetivo recomendado por el autor para esta conversión, con `--target_device GPU`.
- NPU Intel: soportada en principio, probada en un Core Ultra 7 155H. El autor advierte que compilar correctamente en NPU no garantiza un comportamiento numérico idéntico al de CPU o GPU, y que las cargas de contexto largo o generaciones largas deben validarse en cada generación de NPU, driver y versión de OpenVINO.
- GPU de otros fabricantes: no soportadas por este artefacto, que es un IR de OpenVINO. Para NVIDIA o AMD habría que recurrir a otras cuantizaciones del modelo base.
- Cabe en GPU de consumo: no disponible como dato confirmado; al tratarse de un modelo de 2B en INT4, la restricción principal es tener hardware con soporte OpenVINO más que la VRAM en sí.
- Opciones de despliegue: OpenVINO GenAI mediante `openvino_genai.LLMPipeline` (Python), y OpenVINO Model Server (OVMS) con API compatible con OpenAI en `/v3`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Jeff98/MiniCPM5-2B-int4-gq-ov | aprox. 2.000 M (deducido del modelo base) | no disponible | INT4 group-wise, group size 128, data-free | en, zh | Apache-2.0 | OpenVINO IR; 0 descargas y 0 likes en el momento de la consulta |
| openbmb/MiniCPM5-2B (base, coma flotante) | aprox. 2.000 M según denominación | no disponible | sin cuantizar | en, zh | Apache-2.0 | Repositorio original en HuggingFace; referencia para arquitectura, entrenamiento y evaluación |
| Otras alternativas de tamaño similar (por ejemplo, modelos de 1B a 3B orientados a borde) | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de información sobre alternativas en la documentación proporcionada, por lo que no se establece comparación de rendimiento |

## Limitaciones y advertencias

- Es una conversión comunitaria, no oficial: el autor no es OpenBMB y la responsabilidad sobre el comportamiento del artefacto recae en quien lo despliega.
- La cuantización es data-free y sin calibración, AWQ ni GPTQ. Esto reduce la fidelidad respecto a los pesos originales y puede degradar tareas sensibles, como razonamiento o generación de código, en comparación con el modelo base en coma flotante.
- El ratio 1,0 fuerza 4 bits en todas las capas elegibles; las operaciones no compatibles se resuelven según el comportamiento de respaldo del exportador, lo que puede introducir mezclas de precisión no documentadas capa a capa.
- No se publican resultados de evaluación de la versión cuantizada, por lo que la pérdida real de calidad es desconocida.
- Solo se declaran inglés y chino. El comportamiento en castellano no está garantizado ni evaluado.
- La longitud de contexto no se especifica en la información disponible; conviene verificarla en el modelo base antes de diseñar flujos con contexto largo.
- El tool calling depende del backend, de la plantilla de chat, del parser de herramientas y de la configuración de generación. Un backend sin parser específico de MiniCPM5 puede no invocar herramientas correctamente.
- En NPU, una compilación correcta no garantiza equivalencia numérica con CPU o GPU; los contextos largos y las generaciones extensas deben validarse en cada combinación de hardware, driver y versión de OpenVINO.
- Requiere hardware con soporte OpenVINO (CPU, GPU o NPU de Intel). No es portable a otros runtimes sin volver a convertir el modelo base.
- Licencia Apache-2.0: permite uso comercial, pero conviene conservar los avisos de licencia y atribución del modelo original y revisar las condiciones del repositorio base de OpenBMB.
- Riesgo de alucinación y sesgos: no se documentan análisis específicos en esta conversión. Al proceder de un modelo entrenado mayoritariamente en chino e inglés, es esperable un sesgo cultural y lingüístico hacia esos idiomas, aunque no se cuantifica en la información disponible.
- Madurez: el repositorio registra 0 descargas y 0 likes, por lo que no hay evidencia de uso en producción ni de validación por terceros.

## Enlaces

- Repositorio de la conversión: https://huggingface.co/Jeff98/MiniCPM5-2B-int4-gq-ov
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- OpenVINO GenAI (runtime de inferencia empleado en los ejemplos): https://github.com/openvinotoolkit/openvino.genai
- OpenVINO Model Server (despliegue con API compatible con OpenAI): https://github.com/openvinotoolkit/model_server
- optimum-intel (herramientas de exportación y cuantización para OpenVINO): https://github.com/huggingface/optimum-intel

Nota sobre la búsqueda web: los resultados obtenidos no guardan relación con el modelo ni con OpenVINO (contenido gastronómico y de restauración), por lo que no se ha incorporado ningún dato procedente de ellos. No se han encontrado papers, blogs ni demos adicionales sobre esta conversión en la información disponible.
