# schwyzquant/Kimi-K3

## Resumen

Kimi K3 es un modelo de lenguaje multimodal nativo y orientado a agentes, desarrollado por Moonshot AI, publicado como pesos abiertos bajo la licencia Kimi K3. Se trata de un modelo de arquitectura Mixture-of-Experts con 2.779.931.837.184 parametros totales (aproximadamente 2,8 billones) y 104.000 millones de parametros activos por token, lo que lo situa en la categoria de modelos frontera de escala 3T. La ficha que se evalua aqui corresponde al repositorio `schwyzquant/Kimi-K3`, una redistribucion cuantizada a 8 bits mediante `compressed-tensors` del modelo original de Moonshot AI, publicada por un tercero.

El modelo introduce tres innovaciones arquitectonicas declaradas por su autor: Kimi Delta Attention (KDA), Attention Residuals (AttnRes) y el framework Stable LatentMoE, que activa 16 de 896 expertos por token. Incorpora vision nativa (texto, imagen y video en el mismo modelo) y una ventana de contexto de 1.000.000 de tokens. Moonshot AI lo presenta como el primer modelo abierto de clase 3T y cifra en aproximadamente 2,5x la mejora de eficiencia de escalado respecto a Kimi K2.

Su relevancia actual radica en que combina contexto de un millon de tokens, capacidades multimodales y comportamiento agentico de horizonte largo (sesiones de ingenieria prolongadas, navegacion de repositorios extensos, orquestacion de herramientas de terminal) en pesos abiertos. No obstante, el coste de despliegue es extremo: el repositorio ocupa 1.561 GB y no existe ninguna validacion comunitaria del artefacto cuantizado (0 descargas y 0 "likes" en el momento de redactar esta ficha).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con Kimi Delta Attention (KDA) y Attention Residuals (AttnRes) |
| Parametros totales | 2.779.931.837.184 (2,8T), segun safetensors del repositorio |
| Parametros activos | 104B por token |
| Longitud de contexto | 1.000.000 de tokens |
| Tipos de cuantizacion | 8 bits con `compressed-tensors` en este repositorio; no se detallan otros esquemas |
| Idiomas soportados | no disponible |
| Licencia | Kimi K3 (`license_name: kimi-k3`, `license: other`) |
| Formato de pesos | safetensors |
| Capas totales | 93 (1 capa densa) |
| Composicion de capas de atencion | 69 KDA + 24 Gated MLA |
| Dimension oculta de atencion | 7168 |
| Cabezas de atencion | 96 |
| Dimension latente MoE | 3584 |
| Dimension oculta MoE por experto | 3072 |
| Numero de expertos | 896 |
| Expertos seleccionados por token | 16 |
| Modalidades de entrada | texto, imagen y video (`pipeline_tag: image-text-to-text`) |
| Libreria | transformers (requiere `custom_code`) |
| Tamano del repositorio | 1561,0 GB |
| Fecha de publicacion | 2026-09-12 |

## Arquitectura y entrenamiento

Kimi K3 es un transformer MoE de 93 capas con una unica capa densa. El bloque de atencion combina 69 capas de Kimi Delta Attention (KDA), un mecanismo de atencion de tipo delta que el autor enmarca en la familia de alternativas eficientes al attention cuadratico, con 24 capas de Gated MLA (Multi-head Latent Attention con compuerta). La dimension oculta de atencion es 7168 y el modelo emplea 96 cabezas. La capa MoE opera sobre una representacion latente de 3584 dimensiones y enruta cada token a 16 de los 896 expertos, cada uno con una dimension oculta de 3072; el framework Stable LatentMoE se presenta como el mecanismo que permite escalar esa dispersion manteniendo estabilidad en el entrenamiento. Moonshot AI afirma que esta combinacion aporta una mejora aproximada de 2,5x en eficiencia de escalado frente a Kimi K2.

La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF, DPO u otras). Tampoco se documenta en la informacion proporcionada el proceso concreto de entrenamiento multimodal ni si hubo decodificacion especulativa u optimizaciones de inferencia asociadas. El repositorio que se evalua no contiene los pesos originales en precision completa, sino una conversion a 8 bits realizada por el usuario `schwyzquant`; se desconoce que calibracion, que granularidad (por tensor, por canal o por grupo) y que validacion de calidad se aplicaron.

## Capacidades

- Generacion de texto y razonamiento de horizonte largo, orientado a tareas de conocimiento e ingenieria que requieren decenas o cientos de pasos.
- Codificacion de larga duracion: mantenimiento de sesiones de ingenieria prolongadas, navegacion de repositorios masivos y optimizacion de kernels de GPU y desarrollo de compiladores, segun la model card.
- Trabajo de conocimiento agentico: investigacion profunda end-to-end con generacion de visualizaciones interactivas, widgets y dashboards.
- Multimodalidad nativa: comprension de texto, imagenes y video dentro del mismo modelo, sin adaptadores externos declarados.
- Contexto de 1.000.000 de tokens, lo que habilita el procesamiento de bases de codigo o corpus documentales completos en una sola ventana.
- Orquestacion de herramientas de terminal y uso de herramientas dentro de flujos de multiples pasos (la model card describe explicitamente la orquestacion de terminal tools).
- Soporte de conversaciones multiturno (`conversational`).
- Capacidades de diseno de movimiento y edicion de video asistidas, apoyadas en la comprension de video.
- Soporte de `tool calling` / `function calling`: no se detalla de forma explicita en la informacion proporcionada, aunque el enfoque agentico declarado lo hace previsible.
- Idiomas soportados: no disponible.
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Agentes de codigo de horizonte largo: con 1.000.000 de tokens de contexto el modelo puede cargar un repositorio extenso completo y trabajar en tareas de refactorizacion o migracion de multiples archivos manteniendo coherencia entre dependencias, sin necesidad de encadenar resumenes intermedios que degradan la precision.
- Revision de codigo en pipelines de CI/CD: integrado como paso de validacion, puede inspeccionar diferencias sobre un arbol de codigo grande y orquestar herramientas de terminal para ejecutar tests, interpretar la salida y proponer correcciones en el mismo bucle agentico.
- Optimizacion de kernels de GPU y desarrollo de compiladores: es un escenario citado explicitamente por el autor; el modelo puede iterar sobre codigo de bajo nivel, leer trazas de compilacion y proponer variantes, una tarea en la que el contexto largo evita perder el estado del problema entre iteraciones.
- Investigacion profunda automatizada: generacion de informes con visualizaciones interactivas, widgets y dashboards a partir de grandes volumenes de documentacion, aprovechando la ventana de 1M de tokens para cubrir el corpus completo de un dominio.
- Analisis de documentacion tecnica multimodal: al aceptar imagen, video y texto, puede extraer informacion de diagramas de ingenieria, capturas de interfaz, planos CAD o grabaciones de sesiones y vincularla con la documentacion textual asociada.
- Asistencia en diseno de movimiento y edicion de video: la comprension nativa de video permite describir, indexar o generar instrucciones de montaje sobre material audiovisual sin extraer fotogramas a un modelo de vision independiente.
- Despliegue en plataformas de agentes de proposito general: la combinacion de contexto de 1M, multimodalidad y uso de herramientas lo hace adecuado como cerebro de un agente que opera navegador, terminal y ficheros en tareas administrativas o de analisis de datos.
- Procesamiento de expedientes o contratos extensos en un solo paso: cuando el dominio requiere comparar cientos de documentos legales o tecnicos, la ventana completa evita la fragmentacion y las perdidas de informacion entre fragmentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye la etiqueta `eval-results`, pero no se han facilitado cifras de MMLU, HumanEval, GSM8K, SWE-bench ni de ninguna otra prueba en la model card ni en los resultados de busqueda consultados. La unica cifra cuantitativa declarada por el autor es una mejora aproximada de 2,5x en eficiencia de escalado respecto a Kimi K2, que es una metrica de entrenamiento y no un resultado de evaluacion. Tampoco existe ninguna evaluacion publicada de la version cuantizada a 8 bits de `schwyzquant`, por lo que se desconoce la degradacion introducida por la cuantizacion.

## Requisitos de hardware

Los siguientes valores son estimaciones derivadas del recuento de parametros y del tamano del repositorio; no proceden de la model card.

- VRAM estimada para inferencia: aproximadamente 1,56 TB en la cuantizacion a 8 bits de este repositorio (el tamano declarado del repo es 1561 GB). En precision BF16 los pesos originales ocuparian alrededor de 5,56 TB.
- Nota sobre la cuantizacion: 2,78 billones de parametros en 8 bits puros ocuparian cerca de 2,78 TB, por lo que los 1561 GB del repositorio sugieren un esquema mixto o un empaquetado distinto del nominal. Este punto no esta confirmado en la informacion proporcionada.
- Memoria adicional: hay que sumar activaciones y cache KV para la ventana de 1M de tokens. Aunque KDA reduce el coste respecto a atencion completa, a esa longitud de contexto el consumo de cache no es despreciable y el dato concreto no esta disponible.
- GPU recomendadas: se requiere un despliegue multinodo. Para la version de 8 bits, del orden de 12 aceleradores de 141 GB (H200) o 20 de 80 GB (H100). Para BF16, del orden de 40 H100 de 80 GB. Alternativas de memoria unificada grande: MI300X (192 GB) o B200 (180 GB).
- GPU de consumo: no cabe en ninguna GPU de consumo. Una RTX 4090 (24 GB) o una RTX 5090 (32 GB) son tres ordenes de magnitud insuficientes, incluso con cuantizaciones mas agresivas de las que el modelo probablemente no dispone.
- Opciones de despliegue: vLLM o SGLang para servido multinodo en produccion; TGI como alternativa; `transformers` con `trust_remote_code=True` para uso directo, dado que el repositorio usa `custom_code`. Llama.cpp u Ollama no son viables a esta escala con el formato publicado.
- Latencia y throughput estimados: no disponible. Tampoco se publican cifras de tokens por segundo ni de rendimiento en contextos largos.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de su documentacion publica y no de la informacion proporcionada en esta ficha; se ofrecen como orden de magnitud.

| Modelo | Parametros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Kimi K3 (repositorio `schwyzquant/Kimi-K3`, 8 bits) | 2,8T / 104B | 1.000.000 tokens | Kimi K3 | Pesos safetensors cuantizados, 1561 GB, 0 descargas |
| Kimi K2 (Moonshot AI) | 1T / 32B | 128.000 tokens | Licencia propia de Kimi | Pesos abiertos en HuggingFace |
| DeepSeek-V3 / R1 | 671B / 37B | 128.000 tokens | Licencia propia de DeepSeek | Pesos abiertos en HuggingFace |
| Qwen3-235B-A22B | 235B / 22B | 128.000 tokens nativos | Apache 2.0 | Pesos abiertos en HuggingFace |

Diferencias clave: Kimi K3 multiplica por casi tres los parametros totales de Kimi K2 y por mas de tres los parametros activos, y eleva la ventana de contexto de 128.000 a 1.000.000 de tokens, ademas de incorporar vision y video nativos que los modelos comparables no ofrecen en su configuracion base. El precio de ese salto es un requisito de hardware aproximadamente cuatro veces mayor en 8 bits que el de un modelo de 671B en el mismo formato. No hay datos publicos de rendimiento comparado para la version cuantizada que se evalua.

## Limitaciones y advertencias

- Artefacto sin validacion comunitaria: el repositorio tiene 0 descargas y 0 "likes", y ha sido publicado por un tercero (`schwyzquant`) distinto del autor original. No hay evidencia publica de que la cuantizacion se haya validado contra los pesos oficiales.
- Degradacion por cuantizacion: no se documenta el esquema exacto de `compressed-tensors` ni se publican evaluaciones de la perdida de calidad frente a BF16. En un modelo de razonamiento de horizonte largo, pequeños errores por paso pueden acumularse.
- Requiere `custom_code`: cargar el modelo implica ejecutar codigo remoto del repositorio, lo que supone un riesgo de seguridad y de reproducibilidad que debe auditarse antes de usarlo en produccion.
- Sesgos conocidos: no disponible. La model card no incluye ninguna seccion de sesgos, limitaciones o usos prohibidos.
- Riesgo de alucinacion: no cuantificado. No hay evaluaciones de fidelidad publicadas para este modelo ni para esta cuantizacion.
- Idioma: no se especifican los idiomas soportados. No se puede asumir un rendimiento equivalente en castellano sin una evaluacion propia.
- Contexto largo: aunque la ventana es de 1M de tokens, no hay evidencia publicada en la informacion disponible sobre la calidad del recuerdo efectivo a esa distancia; es habitual que el rendimiento decrezca con la longitud incluso cuando la ventana lo permite.
- Licencia: la licencia Kimi K3 es de tipo `other` con nombre propio. No se dispone del texto en la informacion proporcionada, por lo que no se puede confirmar si permite uso comercial, que obligaciones de atribucion impone ni si existen umbrales de escala (numero de usuarios o de facturacion) que activen condiciones adicionales. Es imprescindible revisar el fichero LICENSE antes de cualquier despliegue comercial.
- Coste de despliegue: el requisito de memoria excluye cualquier infraestructura de una sola GPU y obliga a clústeres multinodo con interconexion de alta velocidad, lo que limita su uso a organizaciones con capacidad de computo significativa.
- Ausencia de benchmarks: no se puede comparar su rendimiento real con alternativas de forma objetiva a partir de la informacion disponible.

## Enlaces

- Repositorio evaluado en HuggingFace: https://huggingface.co/schwyzquant/Kimi-K3
- Organizacion original en HuggingFace: https://huggingface.co/moonshotai
- Modelo original (referencia): https://huggingface.co/moonshotai/Kimi-K3
- Blog tecnico de Kimi K3: https://www.kimi.com/blog/kimi-k3
- Informe tecnico completo: https://github.com/MoonshotAI/Kimi-K3/blob/main/k3_tech_report.pdf
- Licencia Kimi K3: https://huggingface.co/moonshotai/Kimi-K3/blob/main/LICENSE
- Chat oficial: https://www.kimi.com
- Sitio corporativo de Moonshot AI: https://www.moonshot.ai
- Twitter de Kimi: https://twitter.com/kimi_moonshot
- Discord de Kimi: https://discord.gg/TYU2fdJykW
- ModelScope: https://modelscope.cn/organization/moonshotai

Nota: la busqueda web realizada no devolvio resultados relevantes sobre el modelo; los unicos resultados obtenidos fueron paginas de ayuda de YouTube y de la comunidad Zhihu, sin relacion con Kimi K3.
