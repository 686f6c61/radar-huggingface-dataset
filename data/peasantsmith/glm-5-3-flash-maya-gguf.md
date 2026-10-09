# peasantsmith/GLM-5.3-Flash-Maya-GGUF

## Resumen

GLM-5.3-Flash-Maya-GGUF es un conjunto de cuantizaciones GGUF del modelo zai-org/GLM-5.3-Flash, publicadas por el usuario peasantsmith dentro del denominado Project Maya. El modelo subyacente es un transformer de tipo mezcla de expertos (MoE) desarrollado por Z.ai, con 321.000 millones de parametros totales y unos 18.000 millones activos por token, y es el primer modelo nativamente multimodal de la serie GLM-5, con entrada de imagen y video y una ventana de contexto de 1.048.576 tokens. Este repositorio no contiene el modelo original, sino tres recetas de cuantizacion (Maya-S, Maya-S24 y Maya-M) pensadas para ejecutar el modelo en hardware de consumo mediante una estrategia de offloading por capas de memoria.

La relevancia de esta publicacion esta en que permite ejecutar un MoE de mas de 320.000 millones de parametros en equipos con tan solo 24 GB de VRAM, manteniendo segun el autor el 97,7-97,9 % de la precision zero-shot del modelo FP8 original. Las tres variantes se generan directamente desde la publicacion FP8 de Z.ai (no desde un fichero ya recuantizado), incluyen la capa NextN (MTP) para decodificacion especulativa y anaden un modulo de vision F16 separado (mmproj) mas el tokenizador, de modo que el pipeline multimodal queda operativo en llama.cpp. La licencia declarada es MIT, heredada del modelo base.

El repositorio ocupa 398,4 GB en total y acumulaba 2.550 descargas y 9 "likes" en el momento de la consulta, con fecha de creacion del 7 de octubre de 2026 y ultima actualizacion del 8 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE nativamente multimodal (vision + texto), con atencion KDA, MLA/DSA y capa NextN (MTP) |
| Parametros totales | 321.000 millones (321 B) en el modelo base |
| Parametros activos | ~18 B por token (MoE, 42 capas de expertos enrutados) |
| Longitud de contexto | 1.048.576 tokens (1 M) |
| Tipos de cuantizacion | Maya-S (IQ2_XXS / IQ3_XXS / IQ2_S / Q6_K / Q8_0 / F32), Maya-S24 (IQ2_XXS / IQ3_XXS / IQ2_S / Q4_K / Q6_K / Q8_0 / F32), Maya-M (IQ2_S / IQ3_S / IQ3_XXS / Q6_K / Q8_0 / F32); NextN en Q2_K-Q4_K |
| Idiomas soportados | No disponible (la model card menciona calibracion con "chat multilingue", pero no enumera idiomas) |
| Licencia | MIT |
| Formato de pesos | GGUF (3 fragmentos por variante) + mmproj F16 y tokenizador GGUF para vision |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 321 B de parametros totales y aproximadamente 18 B activos por token, distribuidos en 42 capas de expertos enrutados. La model card de la cuantizacion menciona proyecciones de atencion KDA y MLA/DSA, un indexador DSA, expertos compartidos (shared experts), pesos de mezcla de flujos (stream-mixing weights) y tres capas densas. Ademas, incorpora una capa NextN (Multi-Token Prediction) que permite decodificacion especulativa en los motores que la soportan. Es un modelo nativamente multimodal: el repositorio incluye un modulo de vision y proyector en F16 (`mmproj-GLM-5.3-Flash-F16.gguf`) tomado de los pesos oficiales, junto con el tokenizador para el encoder.

Las cuantizaciones no siguen un proceso de recuantizacion en cadena: parten directamente de la publicacion FP8 de Z.ai, la misma precision a la que se sirve el modelo. El proceso consta de cuatro pasos descritos por el autor: (1) calibracion con 128 secuencias de 2.048 tokens en la propia plantilla de chat de GLM, incluyendo bloques de razonamiento, chat multilingue, trazas de razonamiento, codigo web (HTML/CSS/JS de fichero unico, escenas three.js, animaciones canvas y WebGL), otro codigo y llamadas a herramientas, con Maya-M ponderado adicionalmente hacia tool calling y codigo front-end; (2) calculo de una matriz de importancia por experto individual (no por capa) a partir de las estadisticas del modelo FP8; (3) redondeo con retroalimentacion de error de estilo GPTQ en bloques de 256 pesos de las proyecciones gate y up de cada experto, lo que segun el autor reduce el error de salida de los expertos alrededor de un 25 % frente a un redondeo ponderado por importancia del mismo tamano; y (4) uso de los cuantizadores nativos de llama.cpp (ggml), de modo que los ficheros resultantes son GGUFs estandar. La receta esta parcialmente basada en el trabajo de IST Austria DAS Lab (ISTA-DASLab).

En cuanto al entrenamiento del modelo original, la informacion disponible no detalla el numero de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO; unicamente se indica que GLM-5.3-Flash parte de un modelo base nuevo con arquitectura y receta de entrenamiento propias, y que supera a GLM-5.2 en benchmarks con aproximadamente una decima parte del coste.

## Capacidades

- Generacion de texto conversational multi-turno con ventana de contexto de hasta 1.048.576 tokens.
- Razonamiento: la calibracion incluye trazas de razonamiento, lo que indica soporte de bloques de pensamiento.
- Codigo: la model card cita codigo web de fichero unico (HTML/CSS/JS), escenas three.js, animaciones canvas y WebGL como parte del conjunto de calibracion.
- Capacidades multimodales nativas: entrada de imagen y video (el modelo base esta descrito como el primer modelo nativamente multimodal de la serie GLM-5).
- Llamadas a herramientas (tool calling / function calling): presente en el corpus de calibracion y reforzado especificamente en Maya-M.
- Agentes y razonamiento multi-paso: el modelo base se posiciona cerca de Claude Opus 4.8 en benchmarks de agentes y codigo.
- Decodificacion especulativa: la capa NextN (MTP) esta incluida en las tres variantes, con expertos del borrador cuantizados a Q2_K/Q3_K (Maya-S y S24) y Q3_K/Q4_K (Maya-M).
- Multilingue: la calibracion incluye chat multilingue; no se detalla la lista de idiomas soportados.

## Casos de uso

- Ejecucion local de un MoE de 321 B en estacion de trabajo con una sola GPU de 24 GB: la variante Maya-S24 coloca los pesos que usa cada token en 4 bits y libera unos 1,5 GB adicionales para expertos en VRAM, lo que permite arrancar el modelo en tarjetas RTX 3090 o RTX 4090 con offloading a RAM y SSD.
- Asistente de codigo en produccion: el corpus de calibracion incluye codigo front-end y llamadas a herramientas, y Maya-M esta ponderado hacia tool calls, lo que lo hace adecuado para integrarse en pipelines que invocan funciones externas (compilacion, tests, despliegue) dentro de un flujo de CI/CD.
- Analisis de documentos largos: con 1.048.576 tokens de contexto se pueden procesar manuales tecnicos completos, expedientes o bases de codigo extensas en una sola pasada sin troceado manual.
- Revision de interfaces y material visual: gracias al modulo mmproj F16, el pipeline puede tomar capturas de pantalla o fotogramas de video como entrada y combinarlos con texto para tareas de descripcion, auditoria de UI o generacion de codigo a partir de un diseno.
- Despliegue en hardware heterogeneo: el reparto de expertos entre VRAM, RAM y SSD que propone Project Maya permite ajustar el uso de memoria segun la maquina, desde equipos con un unico GPU de 24 GB hasta configuraciones con mas memoria.
- Generacion de codigo web y demos interactivas: la calibracion especifica en HTML/CSS/JS de fichero unico, three.js y WebGL apunta a la generacion de prototipos visuales completos y autocontenidos.
- Investigacion sobre cuantizacion: la publicacion documenta las matrices de importancia por experto y el redondeo con retroalimentacion de error, por lo que sirve como material de referencia para estudiar el impacto de distintas precisiones por tipo de tensor.

## Benchmarks y rendimiento

Resultados zero-shot publicados por el autor de la cuantizacion, comparando cada variante con el modelo FP8 original (400 preguntas por tarea, mismas preguntas para todos los modelos, puntuacion segun lm-evaluation-harness):

| Tarea (zero-shot) | FP8 | Maya-S | Maya-S24 | Maya-M |
|---|---:|---:|---:|---:|
| ARC-Easy (acc) | 87,2 | 86,2 (98,9 %) | 85,8 (98,3 %) | 86,5 (99,1 %) |
| ARC-Challenge (acc norm) | 71,0 | 68,2 (96,1 %) | 69,0 (97,2 %) | 69,0 (97,2 %) |
| HellaSwag (acc norm) | 88,5 | 87,5 (98,9 %) | 84,8 (95,8 %) | 86,8 (98,0 %) |
| WinoGrande (acc) | 78,5 | 75,5 (96,2 %) | 77,0 (98,1 %) | 76,2 (97,1 %) |
| PIQA (acc norm) | 87,0 | 86,2 (99,1 %) | 86,2 (99,1 %) | 85,0 (97,7 %) |
| **Media** | **82,5** | **80,8 (97,9 %)** | **80,6 (97,7 %)** | **80,7 (97,9 %)** |

Comparacion token a token sobre texto no usado en calibracion (7.672 posiciones), tomando las predicciones del modelo FP8 como referencia:

| Metrica | FP8 | Maya-S | Maya-S24 | Maya-M |
|---|---:|---:|---:|---:|
| Mismo token superior que FP8 | 100 % | 83,3 % | 83,1 % | 86,2 % |
| Divergencia KL respecto a FP8 | 0 | 0,428 | 0,444 (medicion con un motor posterior) | 0,329 |
| Precision top-1 sobre el token siguiente real | 71,5 % | 68,8 % | 67,9 % | 70,3 % |

No se han publicado en la informacion disponible resultados de benchmarks del modelo base (MMLU, HumanEval, GSM8K u otros) mas alla de la afirmacion de que supera a GLM-5.2 y se aproxima a Claude Opus 4.8 en tareas de codigo y agentes.

## Requisitos de hardware

- Tamano de los ficheros: Maya-S 96,5 GB, Maya-S24 94,7 GB, Maya-M 116,0 GB, mas 1,14 GB del modulo de vision y tokenizador.
- VRAM estimada: no disponible como cifra cerrada, porque el diseno de Project Maya reparte expertos entre VRAM, RAM y SSD. Las mediciones del autor se realizaron con dos GPU y 30 GB de RAM en total, ejecutando el modelo muy por debajo de su tamano en disco.
- GPU recomendadas: Maya-S24 esta disenada especificamente para tarjetas de 24 GB (RTX 3090, RTX 4090), con hasta un 14 % mas de velocidad de decodificacion en ese perfil. Para Maya-S y Maya-M el autor indica que mas memoria (VRAM o RAM) es siempre mas rapido, sin fijar modelos concretos.
- Compatibilidad con GPU de consumo: si, Maya-S24 cabe en GPU de consumo de 24 GB con offloading del resto de expertos a RAM y SSD.
- Opciones de despliegue: llama.cpp (los ficheros son GGUFs estandar generados con los cuantizadores ggml) y el motor propio de Project Maya, que gestiona el reparto de expertos entre niveles de memoria. El repositorio esta marcado como `endpoints_compatible`.
- Latencia y throughput: no se publican valores absolutos de tokens por segundo; la unica cifra concreta es la mejora de hasta un 14 % en velocidad de decodificacion de Maya-S24 frente a Maya-S en tarjetas de 24 GB.
- Decodificacion especulativa: disponible mediante la capa NextN incluida, siempre que el motor de inferencia la soporte.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion / formato | Precision relativa | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GLM-5.3-Flash (FP8, zai-org) | 321 B totales, ~18 B activos | 1.048.576 tokens | FP8 (pesos originales) | Referencia (100 %) | MIT | Hugging Face |
| GLM-5.3-Flash Maya-S | 321 B totales, ~18 B activos | 1.048.576 tokens | GGUF mixto, 96,5 GB | 97,9 % de la media zero-shot del FP8 | MIT | Hugging Face |
| GLM-5.3-Flash Maya-S24 | 321 B totales, ~18 B activos | 1.048.576 tokens | GGUF mixto, 94,7 GB | 97,7 % de la media zero-shot del FP8 | MIT | Hugging Face |
| GLM-5.3-Flash Maya-M | 321 B totales, ~18 B activos | 1.048.576 tokens | GGUF mixto, 116,0 GB | 97,9 % de la media zero-shot; mas cercano token a token | MIT | Hugging Face |

Frente a otras alternativas de la misma categoria (por ejemplo GLM-5.2, que segun la informacion disponible es superado por GLM-5.3-Flash con aproximadamente una decima parte del coste, o Claude Opus 4.8, que es un modelo propietario), no se dispone de parametros, contexto ni resultados comparables en la informacion proporcionada.

## Limitaciones y advertencias

- La ficha describe una cuantizacion de terceros, no el modelo oficial de Z.ai. El rendimiento puede variar respecto al modelo FP8 segun la tarea y el motor de inferencia.
- Perdida de precision medible: ninguna variante reproduce exactamente el FP8. En prediccion token a token, solo entre el 83,1 % y el 86,2 % de las posiciones coinciden con el token superior del modelo de referencia, y la divergencia KL respecto al FP8 llega a 0,444 en Maya-S24.
- Diferencias entre variantes: Maya-M es la mas fiel token a token (86,2 % de coincidencia, KL 0,329) pero tambien la mas grande (116 GB); Maya-S24 es la mas ligera (94,7 GB) y la mas rapida en tarjetas de 24 GB, a costa de una precision media ligeramente inferior (97,7 %) y el peor rendimiento en HellaSwag (95,8 %).
- Riesgo de alucinacion: no se publican tasas de alucinacion ni evaluaciones especificas de veracidad en la informacion disponible.
- Sesgos: no se documentan evaluaciones de sesgo, toxicidad o equidad en la informacion disponible.
- Limitaciones de idioma: no se detalla la lista de idiomas soportados, aunque el corpus de calibracion incluye chat multilingue. El comportamiento fuera de los idiomas cubiertos por el modelo base no esta documentado.
- Complejidad de despliegue: el modelo requiere repartir expertos entre VRAM, RAM y SSD, lo que implica dependencia de un motor especifico (Project Maya) o de llama.cpp con offloading, y un rendimiento muy dependiente de la maquina.
- Restricciones de licencia: la licencia declarada es MIT, lo que en principio permite uso comercial, pero conviene verificar los terminos del modelo base zai-org/GLM-5.3-Flash antes de un despliegue en produccion.
- La model card original esta truncada en el material disponible, por lo que parte de las notas metodologicas (por ejemplo, la referida al calculo de la divergencia KL de Maya-S24) no puede verificarse por completo.
- El rendimiento depende fuertemente del subsistema de almacenamiento y de la cantidad de RAM disponible; el autor advierte explicitamente de que cada maquina es distinta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/peasantsmith/GLM-5.3-Flash-Maya-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Repositorio GitHub de Project Maya: https://github.com/mw00/project-maya
- Ficha de GLM-5.3 en openlm.ai: https://openlm.ai/glm-5.3/
- Model card de GLM-5.3-Flash en NVIDIA NIM: https://build.nvidia.com/z-ai/glm-5-3-flash/modelcard
- Articulo de MarkTechPost sobre el lanzamiento: https://www.marktechpost.com/2026/08/26/z-ai-releases-glm-5-3-flash-a-320b-a18b-natively-multimodal-moe-with-a-1m-token-context/
- Receta de cuantizacion de referencia (IST Austria DAS Lab): https://huggingface.co/ISTA-DASLab
