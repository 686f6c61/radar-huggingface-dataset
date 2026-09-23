# chanind/hierarchy-saes

## Resumen

`chanind/hierarchy-saes` es un repositorio publicado en HuggingFace por el usuario chanind (región `us`) que, a juzgar por su identificador y por un tamaño de repositorio de 15,6 GB, parece contener una colección de autoencoders dispersos (sparse autoencoders, SAE) organizados de forma jerárquica. Los SAE son herramientas de interpretabilidad mecanística: se entrenan sobre las activaciones internas de un modelo de lenguaje para descomponerlas en un conjunto disperso de características más monosemánticas y legibles por humanos. No se trata, por tanto, de un modelo generativo, sino de artefactos de análisis que se aplican sobre otro modelo base.

La relevancia de este tipo de publicación está en el análisis de circuitos internos, la monitorización de rasgos y el control de la generación (steering) en modelos de lenguaje. Una organización jerárquica de los diccionarios de características permitiría, en principio, estudiar relaciones de composición entre rasgos de distintos niveles de abstracción, aunque la ficha del repositorio no describe esta arquitectura.

La información pública disponible es mínima: 0 descargas, 2 likes, sin pipeline declarado, sin licencia, sin idiomas y sin model card descriptiva. Por ello, la mayor parte de los datos técnicos de esta ficha deben considerarse no disponibles o no verificables con la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el identificador sugiere autoencoders dispersos jerárquicos; no confirmado por el repositorio) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no consta que sea un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje generativo) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |
| Identificador del repositorio | chanind/hierarchy-saes |
| Autor | chanind |
| Región declarada | us |
| Descargas | 0 |
| Likes | 2 |
| Tamaño del repositorio | 15,6 GB |
| Fecha de creación | 2026-09-14 |
| Última actualización | 2026-09-23 |
| Pipeline declarado | no disponible |
| Etiquetas | region:us |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura concreta, el procedimiento de entrenamiento, el número de tokens utilizados, la composición del dataset ni la existencia de fases de ajuste como RLHF o DPO. Tampoco se indica sobre qué modelo base se calcularon las activaciones, dato imprescindible para poder reutilizar los pesos.

Como referencia general del tipo de artefacto, un SAE es un autoencoder con una capa oculta de dimensión muy superior a la de entrada y una penalización de dispersión (habitualmente L1) que fuerza a que solo unos pocos latentes se activen ante cada estímulo. El resultado es un diccionario de direcciones en el espacio de activaciones, cada una asociada a una característica interpretable. La variante "jerárquica" sugerida por el nombre apuntaría a diccionarios anidados o multinivel, donde un rasgo de nivel superior se descompone en subrasgos más específicos. Todo esto es una interpretación del identificador, no un dato confirmado por la model card.

## Capacidades

- Extracción de características interpretables a partir de activaciones internas de un modelo de lenguaje, si se dispone del modelo base y de la configuración exacta de carga.
- Análisis de composición entre rasgos de distintos niveles de abstracción, en caso de que la jerarquía sea real y esté documentada en los archivos del repositorio.
- Apoyo a tareas de interpretabilidad mecanística: atribución de comportamiento, búsqueda de circuitos y estudio de representaciones latentes.
- Potencial uso para steering o edición de activaciones durante la inferencia, condicionado a la disponibilidad de decodificadores y a la validación empírica.
- No se ha confirmado soporte de tool calling, function calling, razonamiento multi-paso, capacidades multilingües, visión, audio ni modo de razonamiento explícito. Estas capacidades no aplican al artefacto descrito.

## Casos de uso

- Investigación en interpretabilidad mecanística: cargar los SAE junto con el modelo base sobre el que fueron entrenados para analizar qué características se activan ante estímulos concretos y cómo se componen entre niveles.
- Auditoría de comportamientos indeseados: localizar latentes asociados a contenido tóxico, sesgado o factualmente incorrecto y usarlos como señal de diagnóstico durante la evaluación de un modelo.
- Steering y control de generación: si se dispone de los decodificadores correspondientes, amplificar o suprimir direcciones de características para estudiar su efecto causal sobre la salida del modelo.
- Comparación entre capas y checkpoints: aplicar el mismo diccionario a distintas profundidades o a distintas versiones del modelo base para medir cómo evoluciona la representación de un concepto durante el entrenamiento o a lo largo de las capas.
- Documentación y docencia: usar los latentes como unidades didácticas para explicar de forma tangible cómo un transformer representa conceptos internamente.
- Detección temprana en pipelines de seguridad: integrar los SAE como sonda de monitorización que marque activaciones anómalas antes de que el modelo genere la respuesta final.
- Estudio de sesgos: identificar características correlacionadas con atributos demográficos o estereotipos y cuantificar su peso en distintas capas.
- Reutilización como inicialización: emplear los diccionarios jerárquicos como punto de partida para entrenar SAE sobre otros modelos o dominios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Un repositorio de SAE no se evalúa con métricas tipo MMLU, HumanEval o GSM8K, sino con métricas de reconstrucción y dispersión (por ejemplo, pérdida de reconstrucción, L0, varianza explicada, proporción de latentes muertos), y ninguna de ellas aparece en la información proporcionada.

## Comparativa con modelos similares

| Repositorio / familia | Tipo de artefacto | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chanind/hierarchy-saes | SAE jerárquicos (según el identificador) | no disponible | no aplica | no disponible | pública en HuggingFace, 0 descargas |
| Gemma Scope | SAE y transcoders sobre Gemma 2 | no disponible en la información proporcionada | no aplica | no disponible en la información proporcionada | pública |
| Llama Scope | SAE sobre la familia Llama | no disponible en la información proporcionada | no aplica | no disponible en la información proporcionada | pública |

No se dispone de datos verificables de parámetros, licencia ni métricas para establecer una comparación cuantitativa con ninguna de estas alternativas dentro de la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no se puede asumir permiso de uso comercial ni de redistribución de los pesos.
- Ausencia de model card: se desconoce el modelo base, la capa o capas analizadas, el dataset de entrenamiento y la configuración de dispersión, lo que impide reproducir o reutilizar el artefacto con garantías.
- El repositorio registra 0 descargas, por lo que no existe validación por parte de la comunidad.
- Los SAE presentan limitaciones conocidas de la técnica: latentes muertos, división de características (feature splitting), error de reconstrucción no nulo y ausencia de garantía de monosemanticidad real.
- La interpretación de un latente es siempre una hipótesis y puede inducir conclusiones erróneas sobre el comportamiento del modelo base.
- El término "jerárquico" no está respaldado por documentación en la información disponible; cualquier uso basado en esa suposición debe verificarse inspeccionando los archivos del repositorio.
- No es desplegable como modelo de chat: no funciona con vLLM, llama.cpp, Ollama ni TGI en calidad de modelo generativo.
- Las fechas de creación y actualización (septiembre de 2026) aparecen tal cual en los metadatos y no han podido contrastarse con otra fuente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/chanind/hierarchy-saes
- No se han encontrado otros enlaces (paper, blog, repositorio de código o demo) en la información proporcionada.
