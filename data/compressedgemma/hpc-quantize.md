# CompressedGemma/HPC-Quantize

## Resumen

HPC-Quantize (Holographic Phase Contraction) es un motor de cuantizacion experimental con licencia MIT, publicado por el usuario CompressedGemma, orientado a la compresion de modelos de lenguaje en formatos de muy bajo numero de bits, con foco explicito en la clase Q2. No es un modelo de lenguaje entrenado: es una herramienta de re-cuantizacion que produce ficheros GGUF. Su tesis central es que, a bitrates muy bajos, la cuantizacion debe abordarse como un problema de reconstruccion estructurada y no como un redondeo independiente bloque a bloque.

La implementacion actual es puramente clasica, aunque versiones anteriores exploraron formulaciones inspiradas en estados y medidas de tipo cuantico. El pipeline combina generacion de candidatos de reconstruccion, error de reconstruccion ponderado (con soporte opcional de matriz de importancia), mapeo de candidatos a un espacio de estados discreto, un Sieve secuencial, retroaccion acotada entre estados vecinos y un optimizador global de Viterbi. Para Q2 el espacio conjunto de estados es de 36 (6 x 6, resultado de representar los parametros acoplados d y d_min con seis estados simbolicos cada uno).

Es relevante ahora porque el cuello de botella practico de la inferencia local sigue siendo la memoria: bajar a Q2 permite en teoria ejecutar modelos grandes en GPUs de consumo, pero a ese bitrate los cuantizadores clasicos degradan mucho la calidad. HPC-Quantize propone preservar candidatos en competencia hasta disponer de informacion suficiente para una decision global, en lugar de comprometerse con la mejor solucion local de cada bloque. El repositorio no incluye pesos publicados (tamano 0.0 GB) y no registra descargas ni likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo de lenguaje; es un motor de cuantizacion/re-cuantizacion. Pipeline: generacion de candidatos, Sieve secuencial, espacio de estados Q2, optimizacion global con Viterbi |
| Parametros totales | No disponible (no aplica: no publica pesos) |
| Parametros activos | No disponible (no aplica) |
| Longitud de contexto | No disponible (no aplica a la herramienta) |
| Tipos de cuantizacion | Q2-class, con soporte explicito de Q2_K (parametros acoplados d y d_min); mencion a Q4 y Q5 como regimenes donde las estrategias convencionales funcionan razonablemente |
| Idiomas soportados | No disponible (no aplica a la herramienta) |
| Licencia | MIT |
| Formato de pesos | Salida en GGUF cuantizado (entrada: pesos originales del modelo a comprimir) |

## Arquitectura y entrenamiento

HPC-Quantize no entrena ni modifica la red neuronal: no reentrena pesos, no altera la arquitectura y no aprende un nuevo conjunto de representaciones. El termino "reconstruccion" se refiere al proceso de seleccion de candidatos, en el que la herramienta construye explicitamente multiples aproximaciones de bajo bit de los pesos originales y las evalua contra los pesos fuente. Formalmente, el flujo es W -> {W1, W2, ..., Wn} -> seleccion estructurada de candidatos -> Q(W), y la salida final es un modelo GGUF cuantizado convencional.

A diferencia de un cuantizador clasico, que reduce el problema a encontrar los mejores parametros locales por bloque y codificar inmediatamente, HPC trata cada bloque como un problema de seleccion discreta de candidatos. Los parametros candidatos se evaluan reconstruyendo el bloque cuantizado y midiendo el error contra los pesos originales; con matriz de importancia, el error se pondera segun E = suma_i w_i (x_i - x_hat_i)^2, de modo que las dimensiones sensibles pesan mas que en un RMSE no ponderado. Los candidatos se mapean despues a un espacio simbolico compacto de seis estados por parametro (d pertenece a {0,1,2,3,4,5}), y para Q2 el espacio conjunto de d y d_min contiene 36 estados con indice s = 6*q_D + q_M. Ese espacio simbolico es un espacio de optimizacion global, no una afirmacion de que solo existan 36 candidatos fisicos. Los errores de los candidatos pueden convertirse en pesos tipo probabilidad mediante una transformacion de estilo Boltzmann, P_i proporcional a exp(-T(E_i - E_min)), lo que genera una distribucion blanda de candidatos. El optimizador conserva asi posibilidades en competencia hasta que hay informacion suficiente para decidir, aplica un Sieve secuencial, permite retroaccion acotada entre estados vecinos, ejecuta un Viterbi global y por ultimo selecciona reconstrucciones fisicas con salvaguardas de calidad de reconstruccion local. La model card esta truncada en el apartado de probabilidades de candidato, por lo que no se dispone del resto de detalles.

## Capacidades

- Cuantizacion de modelos de lenguaje a formatos de muy bajo bit, con foco en la clase Q2 y en Q2_K.
- Generacion de multiples reconstrucciones candidatas por bloque y evaluacion contra los pesos originales.
- Error de reconstruccion ponderado, con soporte opcional de matriz de importancia (imatrix) para dar mas peso a las dimensiones sensibles.
- Mapeo de candidatos fisicos a un espacio simbolico discreto de 6 estados por parametro y 36 estados conjuntos en Q2.
- Sieve secuencial para reducir el conjunto de candidatos antes de la optimizacion global.
- Retroaccion acotada entre estados vecinos, que modela interacciones entre bloques contiguos.
- Optimizacion global mediante Viterbi sobre el retículo de estados Q2.
- Conversion de errores de candidatos en pesos tipo probabilidad mediante transformacion de estilo Boltzmann.
- Salvaguardas locales de calidad de reconstruccion antes de fijar la reconstruccion fisica.
- Escritura del resultado como fichero GGUF estandar.
- No soporta: entrenamiento, fine-tuning, cambio de arquitectura, generacion de texto, vision, audio, tool calling ni capacidades de agente. Es una utilidad de compresion.

## Casos de uso

- Despliegue local de modelos grandes en GPU de consumo: cuantizar a Q2 un modelo que en FP16 no cabria en una RTX 4090 permite intentar su ejecucion en local, aceptando la perdida de calidad asociada al bitrate.
- Optimizacion de la calidad a bitrate fijo en Q2: cuando el presupuesto de memoria ya esta decidido, el optimizador global con Viterbi puede producir reconstrucciones mas fieles que un redondeo por bloque en las capas mas sensibles.
- Uso de matriz de importancia en modelos con capas criticas: al ponderar el error por E = suma w_i (x_i - x_hat_i)^2, es posible concentrar la precision en las dimensiones que mas afectan al comportamiento final, util en modelos con capas de atencion o MLP especialmente sensibles.
- Reduccion de almacenamiento y de ancho de banda de distribucion: empaquetar pesos en Q2 reduce el tamano del artefacto frente a Q4 o Q5, lo que facilita servir modelos desde registros o CDs con restricciones de transferencia.
- Investigacion en cuantizacion de muy bajo bit: el diseno de estados simbolicos, Sieve y Viterbi sobre un retículo de 36 estados sirve como banco de pruebas para comparar seleccion local frente a seleccion global.
- Integracion en pipelines de CI/CD de publicacion de modelos: la herramienta acepta pesos originales y emite GGUF, por lo que puede encadenarse tras un entrenamiento o merge para producir automaticamente una variante Q2 junto a las variantes Q4 y Q5.
- Evaluacion de trade-offs de compresion en entornos de edge: comparar el mismo modelo en Q2 generado por HPC frente a cuantizadores clasicos permite decidir si el ahorro de memoria compensa la degradacion medida en tareas concretas.
- Re-cuantizacion de artefactos existentes: al operar sobre pesos y no sobre la arquitectura, encaja en flujos donde ya se dispone de un checkpoint y solo se quiere obtener una variante mas agresiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas comparativas de perplejidad, MMLU, HumanEval ni GSM8K, ni cifras de tiempo de cuantizacion o de calidad de reconstruccion frente a otros cuantizadores. Tampoco se han encontrado en la busqueda web enlaces relevantes al proyecto.

## Requisitos de hardware

- VRAM para inferencia: no disponible para la herramienta en si. Depende enteramente del modelo que se cuantice. Como referencia de clase Q2, un modelo de 70.000 millones de parametros ocupa del orden de 20-25 GB en Q2_K, sin contar cache KV.
- VRAM para la cuantizacion: no disponible. No se publican cifras de memoria pico del optimizador, que mantiene candidatos en competencia y por tanto requiere mas recursos que un cuantizador por bloque puro.
- GPU recomendadas: no disponible. La model card no especifica requisitos de GPU ni de CPU.
- Compatibilidad con GPU de consumo: no disponible como dato publicado. El proposito declarado de comprimir a Q2-class es reducir el consumo de memoria en inferencia, lo que habilitaria GPUs de consumo para modelos que de otro modo no cabrian.
- Opciones de despliegue: la salida es GGUF, por lo que es compatible con el ecosistema de llama.cpp y sus derivados (por ejemplo Ollama o servidores basados en llama.cpp). El propia HPC-Quantize no es un motor de inferencia.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han publicado datos de rendimiento que permitan una comparativa cuantitativa. La comparacion siguiente es cualitativa y se limita a lo que la model card afirma explicitamente.

| Herramienta | Enfoque | Licencia | Disponibilidad de pesos o artefactos | Datos de calidad publicados |
|---|---|---|---|---|
| HPC-Quantize | Seleccion global de candidatos sobre espacio de estados discreto y optimizacion Viterbi, foco en Q2 | MIT | Repositorio de 0.0 GB, sin artefactos publicados | No disponible |
| Cuantizadores convencionales por bloque (referencia generica citada en la model card) | Parametros locales optimos por bloque y codificacion inmediata | No disponible | No aplica | No disponible |
| Cuantizadores que operan en Q4 y Q5 (mencionados como regimen donde muchas estrategias funcionan) | No detallado | No disponible | No disponible | No disponible |

La model card no nombra alternativas concretas ni ofrece cifras comparativas, por lo que no es posible establecer una comparacion con GPTQ, AWQ, AQLM o similares a partir de la informacion disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni realiza tareas cognitivas. No debe evaluarse con benchmarks de modelos.
- La model card esta truncada en la seccion de probabilidades de candidato, por lo que parte de la descripcion tecnica del algoritmo no esta disponible.
- No se publican pesos, artefactos GGUF de ejemplo ni scripts de evaluacion. El tamano del repositorio es de 0.0 GB y el contador de descargas y likes es cero, lo que indica ausencia de validacion externa.
- No hay resultados de calidad publicados: se desconoce si la mejora teorica de la seleccion global frente a la local se traduce en menor perplejidad o mejor rendimiento en tareas, y en que magnitud.
- La propia model card reconoce que a Q4 y Q5 muchas estrategias funcionan razonablemente, y que es a Q2 donde el problema se vuelve critico, lo que implica que la ganancia de la herramienta, si existe, se limita al regimen de muy bajo bit.
- Los modelos cuantizados a Q2 suelen sufrir degradacion notable de calidad, alucinacion y perdida de coherencia en razonamiento y codigo; conviene validar por tarea antes de usar en produccion.
- El termino "Holographic Phase Contraction" y la herencia de formulaciones inspiradas en mecanica cuantica en versiones anteriores no implican ventajas fisicas: la implementacion actual es clasica y el autor lo declara explicitamente.
- No se documentan sesgos, idiomas ni dominios especificos: estas caracteristicas las hereda el modelo que se cuantice, no la herramienta.
- Licencia MIT: permite uso comercial y modificacion con la obligacion habitual de conservar el aviso de copyright y la licencia. No impone restricciones adicionales, pero tampoco ofrece garantias.
- El campo de idiomas no esta disponible en los metadatos y la fecha de actualizacion del repositorio es posterior a la de creacion, sin que se detalle que cambios se introdujeron.

## Enlaces

- HuggingFace: https://huggingface.co/CompressedGemma/HPC-Quantize
- No se han encontrado en la busqueda web enlaces relevantes al proyecto (paper, blog, repositorio de codigo o demo). Los resultados devueltos correspondian a paginas de soporte de Microsoft sin relacion con el modelo.
