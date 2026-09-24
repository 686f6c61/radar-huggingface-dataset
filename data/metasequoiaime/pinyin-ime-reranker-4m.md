# metasequoiaime/pinyin-ime-reranker-4M

## Resumen

pinyin-ime-reranker-4M es un transformer a nivel de caracter de 4.250.112 parámetros (4,25 M) desarrollado por el usuario metasequoiaime. No es un modelo generativo ni un decodificador de pinyin: su única función es reordenar la lista de candidatos que ya ha producido un método de entrada chino (IME) basándose en el texto previamente comprometido por el usuario. Es decir, cubre la distancia entre la primera suposición del motor y lo que la persona realmente quería escribir. Alimentarlo con una cadena de pinyin no devuelve texto chino.

El modelo ocupa 4,5 MB en disco en cuantización int8, distribuido en un único fichero safetensors autodescriptivo sin ficheros auxiliares. Está pensado para ejecutarse en el camino crítico de cada pulsación de tecla: su latencia p95 medida es de 8,6 ms por pulsación, frente a los 97,2 ms del modelo hermano de 25 M parámetros. Esa diferencia de orden de magnitud lo hace apto para extensiones de teclado móvil, donde el presupuesto por fotograma es muy ajustado.

Su relevancia actual es doble. Por un lado, demuestra que un reranker contextual minúsculo mejora de forma medible un IME real (de 41/56 a 49/56 aciertos top-1 en la evaluación del autor). Por otro, su model card documenta con inusual honestidad los límites del reranking: el gating sobre aciertos exactos de diccionario, la incomparabilidad entre candidatos de distinta longitud y el hecho de que las diferencias entre modelos de esta familia no alcanzan significación estadística con los tamaños de muestra disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer a nivel de caracter (character-level) |
| Parametros totales | 4.250.112 (4,25 M) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (distribucion oficial); no se documentan otras |
| Idiomas soportados | chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (fichero unico `sentence-model.safetensors`, sin sidecars) |
| Tamano en disco | 4,5 MB (int8) |
| Pipeline | text-ranking |
| Datasets de entrenamiento | allenai/c4, silver/lccc |
| Repositorio de entrenamiento y evaluacion | metasequoiaime/chinese-ime-lm |

## Arquitectura y entrenamiento

La informacion disponible describe un transformer a nivel de caracter de 4,25 M parametros, entrenado y medido dentro del proyecto chinese-ime-lm. No se detallan en la model card el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases de RLHF o DPO. Los datasets citados en los metadatos son allenai/c4 y silver/lccc, ambos corpus de texto en chino.

La documentacion tecnica destaca dos detalles de implementacion que afectan a cualquier reimplementacion del forward pass: la activacion GELU debe usar la forma exacta basada en `erf`, no la aproximacion por `tanh`, y el primer caracter de un candidato se predice desde la **ultima posicion del prefijo**, de modo que una puntuacion que empiece en la primera posicion del propio candidato deja ese caracter sin puntuar. El fichero `docs/format.md` del repositorio es, segun el autor, la especificacion completa del formato y del forward pass, suficiente para escribir un cargador propio.

Una innovacion reseñable no es de arquitectura sino de diseño de sistema: el gating forma parte del modelo. La implementacion de referencia (Rust, sin `unsafe`, con serde como unica dependencia) impone dos reglas en lugar de delegarlas en quien la usa. La primera es no sobrescribir nunca un acierto exacto de diccionario sobre la clave completa, porque el diccionario ya incorpora frecuencia de palabra de corpus. La segunda es comparar solo candidatos que cubren la clave entera: como una suma de log-probabilidades es mayor cuanto menos caracteres hay, una lista de longitudes mixtas pondera siempre primero al candidato mas corto. Por eso las puntuaciones son medias por caracter y `best_where` restringe la comparacion a candidatos de la misma longitud que el lider.

## Capacidades

- Reranking de candidatos: recibe el texto ya comprometido y la lista de candidatos del motor, y devuelve el indice del candidato promovido (o `None` para dejar el orden intacto).
- Puntuacion a nivel de caracter con contexto del prefijo precedente, que es lo que permite desambiguar homofonos que el motor resuelve mal en aislamiento.
- Puntuaciones en forma de media por caracter, lo que hace comparables candidatos de distinta longitud dentro de la misma clave.
- Gating integrado en la implementacion de referencia: no promueve candidatos que sean aciertos exactos de diccionario sobre la clave completa.
- Ejecucion on-device: 4,5 MB en int8, apto para rutas que se ejecutan en cada pulsacion de tecla.
- Implementacion de referencia en Rust vendorizable, con licencia Apache-2.0 en el directorio `reference/`, sin dependencias mas alla de serde.
- **No** decodifica pinyin. **No** genera texto. No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- Sin capacidades multilingues: el unico idioma soportado es chino. No tiene vision ni audio.

## Casos de uso

- Teclado movil (extension de teclado iOS/Android): el modelo se ejecuta en el camino de cada pulsacion con una latencia p95 de 8,6 ms, dentro del presupuesto de un fotograma, y reordena la lista de candidatos sin salir del dispositivo.
- Metodos de entrada de escritorio en Rust: el crate de referencia se puede vendorizar en el arbol del proyecto y usarse directamente, sin dependencias externas ni FFI.
- Correccion contextual de frases largas: al puntuar contra el texto ya comprometido (`committed_text`), el modelo puede promover un candidato que encaja con el contexto acumulado aunque no sea la primera opcion del motor.
- Desambiguacion de homofonos en texto corrido: en la evaluacion del autor rescata 10 casos que el motor resolvia mal, lo que lo hace util en escenarios donde el motor prioriza frecuencia global sobre contexto local.
- Inferencia con privacidad estricta: al correr on-device y ocupar 4,5 MB, es viable en productos donde el texto del usuario no puede salir del terminal.
- Integracion en dispositivos embebidos o de recursos muy limitados: el tamaño int8 y la ausencia de dependencias permiten portarlo a entornos donde un modelo de 25 M o de 600 M no cabe.
- Evaluacion comparativa de heuristicas de reranking: la infraestructura del repositorio permite medir rescates y roturas por separado contra un runtime de IME real, no contra una puntuacion offline.
- Prevencion de regresiones en el motor: la regla de no sobrescribir aciertos exactos de diccionario protege la precision ya ganada por el diccionario cuando se añade reranking a un IME existente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La evaluacion del autor es una prueba interna sobre 60 frases escritas a mano, ejecutadas a traves de un runtime de IME real y no puntuadas offline. 56 de los 60 casos caen en el bucket del decodificador, donde el reranking aplica.

| Sistema | Casos / 56 | Precision |
|---|---|---|
| Primera opcion del motor | 41 | 0,732 |
| + pinyin-ime-reranker-4M | 49 | 0,875 |
| + pinyin-ime-reranker-25M | 52 | 0,929 |
| Respuesta correcta presente en la lista de candidatos | 52 | 0,929 |

La ultima fila es el techo de cualquier reranker: en los 4 casos restantes la lectura correcta nunca llego a ensamblarse, de modo que ningun modelo de este tipo puede alcanzarla.

El autor separa rescates y roturas porque no significan lo mismo para el usuario: este modelo rescata 10 casos que el motor fallaba y rompe 2 que acertaba; el modelo de 25 M rescata 11 y rompe 0. De la diferencia de 3 casos entre ambos, solo 1 es un rescate que este modelo pierde; los otros 2 son casos que rompe activamente.

Sobre los mismos 52 casos alcanzables, ninguna pareja de modelos probada alcanza significacion estadistica. La prueba exacta de McNemar de este modelo contra el de 25 M da 0 victorias a 3, p = 0.250; contra Qwen3-0.6B da 3 a 3, p = 1.000. El desacuerdo por pares es de solo 2 a 6 casos. Detectar diferencias de 1 a 2 puntos porcentuales requeriria entre mil y diez mil casos a ese ritmo de desacuerdo. Ademas, 12 de las 60 frases empiezan por `ta` y toman 他 como respuesta correcta, algo que no es decidible a partir del pinyin en absoluto. El propio autor advierte que la columna de precision no debe leerse como una clasificacion de calidad.

Rendimiento de latencia: p95 de 8,6 ms por pulsacion para este modelo, frente a 97,2 ms del modelo de 25 M (medicion antigua, segun su propia model card).

## Requisitos de hardware

- VRAM estimada: minima. Con 4,25 M parametros, el peso en int8 ocupa aproximadamente 4,5 MB; en fp16 unos 8,5 MB y en fp32 unos 17 MB, mas el espacio de activaciones, que no esta documentado. Cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se requieren GPU dedicadas. Cualquier GPU moderna (por ejemplo, una RTX 4090) es sobredimensionada para este modelo; el caso de uso objetivo es CPU o NPU de dispositivo movil.
- Cabe en GPU consumer: si, en cualquier modelo, y tambien en CPU y en dispositivos moviles. Es el criterio de diseño principal del modelo.
- Opciones de despliegue: la arquitectura y el formato son propios, por lo que los runners genericos (vLLM, llama.cpp, Ollama, TGI) no estan soportados segun la informacion disponible. El despliegue previsto es la implementacion de referencia en Rust del repositorio chinese-ime-lm, vendorizada como crate, o un cargador propio escrito a partir de `docs/format.md`.
- Latencia: p95 de 8,6 ms por pulsacion, medido sobre un runtime de IME real. El throughput no esta disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano (int8) | Eval top-1 (sobre 56) | p95 por pulsacion | Licencia |
|---|---|---|---|---|---|
| pinyin-ime-reranker-4M | 4.250.112 | 4,5 MB | 49 / 56 (0,875) | 8,6 ms | Apache-2.0 |
| pinyin-ime-reranker-25M | 24.863.104 | 25,5 MB | 52 / 56 (0,929) | 97,2 ms (medicion antigua) | no disponible en la informacion proporcionada |
| Qwen3-0.6B | no disponible en detalle (usado como baseline de comparacion) | no disponible | no disponible | no disponible | no disponible |

El modelo hermano de 25 M es mas preciso y alcanza, segun el autor, el techo de lo que el reranking puede dar; el de 4 M es la opcion para cualquier ruta sensible a latencia. La diferencia de 3 casos entre ambos no es estadisticamente significativa con la muestra disponible (McNemar exacto: 0 a 3, p = 0.250). Qwen3-0.6B aparece unicamente como baseline en la prueba de McNemar (3 a 3, p = 1.000); no se aportan sus especificaciones en la informacion disponible.

Ambos ficheros de la familia se llaman `sentence-model.safetensors`, que es el nombre que busca el host.

## Limitaciones y advertencias

- No decodifica pinyin ni genera texto. Es exclusivamente un reranker sobre una lista de candidatos ya producida por un motor de IME. Usarlo fuera de ese flujo no tiene sentido.
- No puede resolver casos que no son decidibles a partir del pinyin: 12 de las 60 frases de la propia evaluacion del autor empiezan por `ta` con 他 como respuesta correcta, algo que ningun modelo de esta clase puede determinar.
- Introduce roturas: en la evaluacion del autor rompe 2 casos que el motor acertaba, ademas de rescatar 10. El modelo de 25 M no rompe ninguno.
- El reranking no es universalmente beneficioso. Sobrescribir un acierto exacto de diccionario sobre la clave completa degrada el resultado: sobre 2.052 casos de ese tipo, la primera opcion del motor da 0,719 y el mejor resultado rerankeado en cualquier umbral probado da 0,690. La implementacion de referencia fuerza esa proteccion.
- Comparar candidatos de longitudes distintas sin normalizar produce ordenaciones erroneas: una suma de log-probabilidades favorece siempre al candidato mas corto. Las puntuaciones del modelo son medias por caracter por este motivo.
- Un error de medicion documentado: filtrar por la longitud de la respuesta correcta es posible offline pero no en tiempo de ejecucion. Medir con ese predicado en lugar del que se desplegara da numeros mejores que el producto real.
- Sesgos conocidos: no disponibles de forma explicita. Los corpus de entrenamiento citados (allenai/c4, silver/lccc) pueden introducir sesgos propios de texto web y de dominio general en chino, pero no se documenta ninguna evaluacion de sesgo.
- Riesgo de alucinacion: no aplica en el sentido generativo, porque el modelo no produce texto. El riesgo equivalente es promover un candidato incorrecto, cuantificado en las 2 roturas observadas.
- Limitaciones de contexto e idioma: la longitud de contexto no esta disponible y el unico idioma soportado es el chino. No hay soporte multilingue.
- Restricciones de licencia: Apache-2.0, que permite uso comercial. El directorio `reference/` del repositorio tiene licencia Apache-2.0 separada precisamente para poder vendorizarlo de forma independiente. No se documentan restricciones adicionales.
- Advertencia sobre las metricas: con 60 casos y un desacuerdo por pares de 2 a 6, las diferencias de precision entre modelos de esta familia no son concluyentes. El autor pide explicitamente no leer la columna de precision como una clasificacion de calidad.
- Detalle de implementacion critico: GELU debe ser la forma exacta basada en `erf`, y el primer caracter del candidato se predice desde la ultima posicion del prefijo. Ignorar cualquiera de los dos puntos degrada silenciosamente los resultados.
- Madurez: el repositorio tiene 0 descargas y 2 likes en el momento de la consulta, y un tamano de repositorio reportado de 0,0 GB. La adopcion en produccion es, segun los datos disponibles, inexistente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/metasequoiaime/pinyin-ime-reranker-4M
- Modelo hermano de 25 M: https://huggingface.co/metasequoiaime/pinyin-ime-reranker-25M
- Repositorio de entrenamiento y evaluacion: https://github.com/metasequoiaime/chinese-ime-lm
- Implementacion de referencia en Rust: https://github.com/metasequoiaime/chinese-ime-lm/tree/main/reference
- Especificacion del formato y del forward pass: https://github.com/metasequoiaime/chinese-ime-lm/blob/main/docs/format.md
- Dataset allenai/c4: https://huggingface.co/datasets/allenai/c4
- Dataset silver/lccc: https://huggingface.co/datasets/silver/lccc
- La busqueda web realizada no devolvio resultados relevantes: los unicos enlaces recuperados corresponden a YouTube y a la ficha de la aplicacion YouTube en Google Play, sin relacion con el modelo.
