# BoldingBuilds/Ternary-Bonsai-2-27B-Abliterated-v2-PQ2_0-MTP-GGUF

## Resumen

Ternary Bonsai 2 27B Abliterated v2 es una cuantizacion ternaria de 2 bits del modelo Bonsai 2 27B de PrismML, publicada por el usuario BoldingBuilds en formato GGUF propietario PQ2_0. Sobre los pesos originales se han aplicado dos modificaciones: la eliminacion de los rechazos (abliteration) mediante la edicion in-place de 98 tensores de las bloques 15 a 63, y un ajuste de una unica fila de la capa de salida correspondiente al token de cierre de razonamiento, con el objetivo de que el modelo entregue la respuesta en lugar de agotar el presupuesto de tokens dentro del bloque de pensamiento. El resultado son dos ficheros de 7,21 GB y 7,66 GB que contienen los mismos pesos de lenguaje, diferenciandose el segundo por incorporar 15 tensores adicionales para decodificacion especulativa basada en prediccion multi-token (MTP), con una mejora de velocidad de decodificacion de aproximadamente el 40%.

El modelo cuenta con 26.895.998.464 parametros (unos 26,9 mil millones) segun los pesos originales en safetensors y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial. Esta orientado a generacion de texto y razonamiento en modo pensamiento, con soporte de un parametro `reasoning_effort` que modula la longitud del razonamiento y afecta de forma notable a la calidad de las respuestas cuando el presupuesto de tokens es limitado.

Su relevancia es doble. Por un lado, es un ejemplo de cuantizacion ternaria extrema (aproximadamente 2,1 bits por parametro) que reduce un modelo de 27B a menos de 8 GB, haciendolo desplegable en GPU de consumo. Por otro, es un modelo deliberadamente "uncensored": elimina practicamente todos los rechazos (0% en las pruebas declaradas) y esta pensado explicitamente para generar respuestas detalladas a peticiones daninas, lo que lo situa en el terreno de la investigacion en seguridad y de los testes de robustez, con las advertencias legales y eticas correspondientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No detallada explicitamente en la informacion disponible; la etiqueta `qwen3_5` y los tensores citados (`ffn_down`, `ssm_out`, `attn_output` en los bloques 15-63) apuntan a una arquitectura hibrida de atencion y modelos de espacio de estados (SSM) |
| Parametros totales | 26.895.998.464 (≈ 26,9 mil millones), dato de safetensors del modelo base |
| Parametros activos | No aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible; la configuracion recomendada por el autor usa `-c 32768` |
| Tipos de cuantizacion | PQ2_0 ternario (≈ 2,1 bits por parametro; ficheros de 7,21 GB y 7,66 GB). Existe tambien una variante PTQ1_0 de 1,75 bpw, pero corresponde a la generacion v1 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (formato PQ2_0 de PrismML) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre el entrenamiento del modelo base Bonsai 2 27B en la documentacion facilitada: no se indican el numero de tokens, la composicion del dataset ni si hubo fases de RLHF, DPO u otras tecnicas de alineamiento. Lo que si se documenta con detalle es el proceso de modificacion posterior. Se editaron 99 de los 851 tensores del modelo: 98 tensores (`ffn_down`, `ssm_out`, `attn_output`, bloques 15 a 63) para eliminar los rechazos mediante el mismo metodo in-place sobre los digitos ternarios empleado en v1, pero con aproximadamente 8 veces mas bytes modificados; y una unica fila de `output.weight`, correspondiente al token de cierre de razonamiento, de 1.250 bytes, ajustada para que el cierre sea probable cuando la respuesta ya esta escrita e improbable a mitad del razonamiento. El total de bytes modificados es el 0,95% del fichero (frente al 0,12% de v1) y el resto es byte-identico a la publicacion de PrismML. No hay recuantizacion: las ediciones se hacen sobre el empaquetado ternario ya publicado.

En cuanto a la variante MTP, el fichero anade 15 tensores (`blk.64.*`) que permiten decodificacion especulativa, con una mejora de velocidad de decodificacion de aproximadamente el 40%. Con la especulacion desactivada, ambos ficheros produjeron salidas byte-identicas en las cinco peticiones de prueba (400 tokens cada una). Los hashes SHA-256 (primeros 16 caracteres) son `b284cbc6cb6c2894` para el fichero simple y `a4e4c7b578131595` para la variante MTP.

## Capacidades

- Generacion de texto conversacional en formato chat, con plantilla Jinja (`--jinja`).
- Razonamiento explicito en modo pensamiento (*thinking*), con control mediante el parametro `reasoning_effort` (el autor recomienda `medium` cuando el presupuesto de tokens es ajustado).
- Cierre controlado del bloque de razonamiento: la modificacion de v2 esta disenada para que el modelo entregue la respuesta final en lugar de quedarse sin presupuesto dentro del razonamiento.
- Ausencia practica de rechazos: 0% de rechazos en las pruebas declaradas sobre peticiones daninas.
- Decodificacion especulativa mediante prediccion multi-token (MTP) en el fichero correspondiente.
- Capacidades matematicas y de codigo heredadas del modelo base: la model card cita resultados de MATH y HumanEval del Bonsai 2 original, aunque no se publican cifras propias del modelo modificado.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado especificamente; el modo pensamiento y la decodificacion especulativa son los unicos elementos relevantes.
- Capacidades multilingues: no disponible.
- Vision o audio: no disponible (el pipeline declarado es text-generation).

## Casos de uso

- Red teaming y evaluacion de seguridad: el modelo genera respuestas detalladas a peticiones potencialmente daninas (puntuacion StrongReject de 0,941 en el conjunto de 150 peticiones), lo que permite construir conjuntos de datos adversarios para entrenar y validar clasificadores de seguridad y filtros de contenido.
- Investigacion sobre mecanismos de rechazo: al ser un modelo abliterado con un porcentaje de modificacion documentado (99 de 851 tensores, 0,95% de los bytes), sirve como caso de estudio reproducible para analizar como se codifica el comportamiento de rechazo en los pesos y como se altera con ediciones minimas.
- Generacion de datos sinteticos para alineamiento: puede usarse para producir pares de respuesta anadina/danina y alimentar pipelines de DPO, RLHF o classificacao, siempre dentro de un marco controlado y con revision humana.
- Escritura creativa sin restricciones: ficcion, narrativa de genero, dialogos y contenido para videojuegos donde los rechazos de los modelos convencionales interrumpen el flujo creativo. El contexto configurable de 32.768 tokens permite mantener arcos narrativos largos.
- Despliegue local en hardware de consumo: con 7,21 GB de pesos, el modelo cabe en GPU de 12 GB o superiores, lo que habilita asistentes y herramientas de generacion de texto en equipos de sobremesa o estaciones de trabajo sin conexion a servicios en la nube.
- Inferencia de alto rendimiento con decodificacion especulativa: la variante MTP reduce el tiempo de decodificacion en torno a un 40%, lo que resulta adecuado para servicios con muchos usuarios concurrentes donde el coste por token generado es determinante.
- Entornos aislados (air-gapped): al ser un GGUF ejecutable con llama.cpp, puede desplegarse en redes sin acceso a internet, algo relevante para laboratorios de seguridad que necesitan procesar material sensible sin enviarlo a APIs externas.
- Evaluacion comparativa de cuantizaciones ternarias: sirve para medir el impacto de formatos de 1,75-2,1 bpw frente a cuantizaciones convencionales de 4-8 bits en tareas de razonamiento y generacion de codigo.

## Benchmarks y rendimiento

Puntuaciones StrongReject sobre 150 peticiones daninas detalladas, con pensamiento activo, configuracion por defecto y presupuesto de 16.384 tokens. El mismo juez para todas las filas (0-1, mas alto es mejor):

| Build | StrongReject (0-1) | Sin respuesta (de 150) |
|---|---:|---:|
| Este modelo (v2) | 0.941 | 7 |
| Hikari07jp abliterated | 0.738 | 34 |
| OS-Software Heretic | 0.723 | 41 |
| Blackfrost DERISKED | 0.708 | 12 |
| dealignai CRACK | 0.668 | 48 |
| v1 de BoldingBuilds | 0.781 | 23 |

SimpleSafetyTests (100 peticiones daninas) y XSTest-safe (100 peticiones seguras), pensamiento activo, muestreador por defecto, semilla 0 y 4.096 tokens:

| Metrica | Stock | v1 | v2 | v2 (medium) |
|---|---:|---:|---:|---:|
| Rechazo, peticiones daninas | 84% | 0% | 0% | 0% |
| Daninas: sin respuesta alguna | 0% | 27% | 15% | 0% |
| Daninas: presupuesto de tokens agotado | 0% | 31% | 23% | 0% |
| StrongReject (0-1) | 0.149 | 0.636 | 0.796 | 0.978 |
| Peticiones seguras: sin respuesta | 6% | 20% | 7% | 0% |
| Sobre-rechazo en peticiones seguras | 1.0% | 0.0% | 0.0% | 0.0% |
| Longitud mediana del razonamiento (caracteres) | 1.038 | 6.531 | 3.802 | 1.730 |

Diferencias declaradas: v2 frente a v1 en configuracion por defecto, +0,160 (p < 0,001); v2 en `medium` frente a v1 por defecto, +0,341 (p < 0,0001).

Efecto del presupuesto de tokens en el conjunto de 150 peticiones daninas: con 4.096 tokens y esfuerzo por defecto, 110 de 150 peticiones agotan el presupuesto y la puntuacion cae a 0,513; con `reasoning_effort=medium` y el mismo presupuesto, la puntuacion sube a 0,977.

Datos citados del Bonsai 2 sin modificar (4k tokens, esfuerzo por defecto frente a medium): MATH 213 frente a 238 y HumanEval 145 frente a 158. Una medicion independiente de Killy (@net_termina) sobre el modelo sin modificar reporta HumanEval a 4k tokens con 137 de 164 en esfuerzo por defecto frente a 157 en medium.

No se han publicado resultados de MMLU ni de otros benchmarks generales para este modelo en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 7,2 GB para el fichero PQ2_0 simple y 7,7 GB para la variante MTP. El consumo total depende del contexto, del tamano del KV cache y de la implementacion.
- GPU recomendadas: no especificadas por el autor. Por tamano de pesos, el modelo cabe en tarjetas de 12 GB o mas, como la RTX 3060 de 12 GB, RTX 4070, RTX 4080, RTX 4090, RTX 5090, A100, H100 y L40S; las tarjetas de gama alta permiten contextos mayores y mayor concurrencia.
- Caben en GPU de consumo: si, con 12 GB o mas de VRAM, siempre que la longitud de contexto se ajuste a la memoria disponible.
- Opciones de despliegue: es necesario el fork de llama.cpp de PrismML (https://github.com/PrismML-Eng/llama.cpp). Las compilaciones de llama.cpp mainline, Ollama y LM Studio no cargaran el formato PQ2_0. Probado con las etiquetas `prism-b10687-5d80cff` y `prism-b10743-adfffbe`; la etiqueta `prism-b10743-adfffbe` o posterior ejecuta la variante MTP tal cual.
- Ejemplo de lanzamiento recomendado por el autor: `llama-server -m Ternary-Bonsai-2-27B-Abliterated-v2-PQ2_0.gguf -ngl 99 -fa on -c 32768 --jinja --chat-template-kwargs '{"reasoning_effort":"medium"}'`, con los valores de muestreo por defecto del fichero (temperatura 1.0, top-k 20, top-p 0.95).
- Latencia y throughput: no se publican cifras absolutas. El unico dato disponible es que el fichero MTP decodifica aproximadamente un 40% mas rapido que el fichero sin tensores MTP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / bpw | Rendimiento (StrongReject, peticiones daninas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ternary-Bonsai-2-27B-Abliterated-v2 (este) | 26,9 mil millones | No disponible (config. recomendada: 32.768) | GGUF PQ2_0, ≈ 2,1 bpw | 0,941 (16k, 150 peticiones); 0,796 (4k, 100 peticiones) | Apache 2.0 | HuggingFace, requiere fork de llama.cpp |
| Ternary-Bonsai-2-27B-Abliterated v1 | 26,9 mil millones | No disponible | GGUF PQ2_0 + MTP | 0,781 (16k, 150 peticiones); 0,636 (4k, 100 peticiones) | Apache 2.0 | HuggingFace, requiere fork de llama.cpp |
| Ternary-Bonsai-2-27B-Abliterated PTQ1_0 (v1) | 26,9 mil millones | No disponible | GGUF PTQ1_0, 1,75 bpw | No disponible | Apache 2.0 | HuggingFace |
| Bonsai 2 27B (stock, PrismML) | 26,9 mil millones | No disponible | GGUF ternario | 0,149 (4k, 100 peticiones); 84% de rechazos | Apache 2.0 | HuggingFace |
| Hikari07jp abliterated | No disponible | No disponible | No disponible | 0,738 (16k, 150 peticiones); 0,834 en el conjunto facil | No disponible | No disponible |
| dealignai CRACK | No disponible | No disponible | No disponible | 0,668 (16k, 150 peticiones); 0,866 en el conjunto facil | No disponible | No disponible |

Diferencias significativas declaradas: v2 supera a v1 en el conjunto de 150 peticiones daninas (+0,160, p < 0,001). En el conjunto facil, Hikari (0,834) y dealignai (0,866) superan a v2 (0,796), aunque el autor indica que ninguna de las dos diferencias es estadisticamente significativa. Con `reasoning_effort=medium`, todos los builds abliterados comparados alcanzan el techo en ese conjunto.

## Limitaciones y advertencias

- Modelo abliterado: los rechazos se han eliminado deliberadamente (0% en las pruebas declaradas). No incorpora salvaguardas de contenido y respondera con detalle a peticiones potencialmente daninas. Su uso en produccion de cara al publico es legalmente arriesgado y puede entrar en conflicto con el Reglamento europeo de Inteligencia Artificial y con la normativa de servicios digitales.
- Riesgo elevado de uso indebido: la propia model card presenta como metrica principal la calidad de las respuestas a peticiones daninas. Cualquier despliegue debe contemplar controles externos, registro de auditoria y supervision humana.
- Riesgo de alucinacion: no se publican datos sobre tasas de alucinacion ni evaluaciones de veracidad. Como en cualquier modelo de 27B, la generacion de hechos debe verificarse.
- Degradacion con presupuestos de tokens cortos: con 4.096 tokens y esfuerzo por defecto, 110 de 150 peticiones daninas agotan el presupuesto y la puntuacion cae de 0,977 a 0,513. El parametro `reasoning_effort=medium` es practicamente obligatorio si el contexto util es reducido.
- Contexto maximo no documentado: la unica referencia disponible es el valor de 32.768 tokens de la configuracion recomendada; no se especifica la longitud maxima soportada por el modelo base.
- Idiomas soportados no documentados: no hay informacion sobre cobertura multilingue ni sobre el comportamiento fuera del ingles.
- Compatibilidad restringida: el formato PQ2_0 exige el fork de llama.cpp de PrismML. Ollama, LM Studio y llama.cpp mainline no pueden cargar los ficheros, lo que limita las opciones de despliegue y complica el mantenimiento a largo plazo.
- Sesgos: no se han publicado evaluaciones de sesgo para este modelo ni para su base. La abliteracion puede alterar el comportamiento en dominios sensibles de formas no medidas.
- Trazabilidad parcial: los cambios afectan al 0,95% de los bytes del fichero (99 de 851 tensores), por lo que la mayor parte de los pesos es identica a la publicacion de PrismML. Aun asi, la evaluacion se apoya en mediciones del propio autor y en un unico juez automatico (Qwen3.8-27B-OBLITERATED-Q8_0), sin validacion humana publicada.
- Fechas de publicacion: la ficha de HuggingFace indica fechas de creacion y actualizacion de septiembre de 2026, posteriores a la informacion disponible en el momento de redactar esta ficha; conviene verificar el estado actual del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BoldingBuilds/Ternary-Bonsai-2-27B-Abliterated-v2-PQ2_0-MTP-GGUF
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Version anterior (v1, PQ2_0 + MTP): https://huggingface.co/BoldingBuilds/Ternary-Bonsai-2-27B-Abliterated-PQ2_0-MTP-GGUF
- Version reducida (PTQ1_0, 1,75 bpw): https://huggingface.co/BoldingBuilds/Ternary-Bonsai-2-27B-Abliterated-PTQ1_0-GGUF
- Informe comparativo de builds abliterados: https://huggingface.co/spaces/BoldingBuilds/bonsai-2-uncensored-shootout
- Fork de llama.cpp de PrismML (requerido): https://github.com/PrismML-Eng/llama.cpp
- Medicion independiente de Killy sobre HumanEval a 4k tokens: https://x.com/net_termina
