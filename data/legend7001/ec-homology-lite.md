# Legend7001/ec-homology-lite

# Ec-homology-lite: clasificacion enzimatica por transferencia de homologia con MMseqs2

## Resumen

`Legend7001/ec-homology-lite` no es un modelo de lenguaje ni una red neuronal: es un pipeline de clasificacion enzimatica que asigna numeros EC (Enzyme Commission) a secuencias proteicas mediante transferencia de homologia con MMseqs2. Lo publica el usuario Legend7001 como entrega del proyecto DA3410 para la tarea "Leak CURBER enzyme classification", y el repositorio ocupa 0,1 GB. No hay pesos entrenados ni parametros ajustados: la "prediccion" es el resultado de una busqueda en una base de datos local de secuencias de entrenamiento mas un voto ponderado entre los aciertos.

El procedimiento es explicito en la model card: cada secuencia de consulta se busca contra las secuencias de entrenamiento con MMseqs2 a sensibilidad 5,7 y 2 hilos; los EC de los 5 mejores hits se combinan mediante un voto ponderado por el bitscore al cuadrado y se devuelve el EC ganador como prediccion unica, ya que solo se puntua el primer EC. El repositorio incluye `predict.py` (inferencia offline en CPU, con busqueda, votacion, guarda de tiempo y filtrado de vocabulario), binarios estaticos de MMseqs2 para AVX2 y SSE4.1, la base de datos MMseqs2 de las secuencias de entrenamiento y dos ficheros JSON con los EC por fila y el EC de reserva.

Su interes practico esta en que constituye un baseline no parametrico, reproducible y ejecutable sin GPU, util para comparar contra aproximaciones basadas en modelos profundos de proteinas y para medir cuanto aporta realmente el aprendizaje frente a la simple homologia. Los metadatos publicos son minimos: 0 descargas, 0 likes, sin pipeline declarado, sin licencia, sin idiomas y sin resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es una red neuronal; pipeline de busqueda por homologia con MMseqs2 (alineamiento local acelerado) y voto ponderado por bitscore al cuadrado sobre los 5 mejores hits |
| Parametros totales | no disponible (no aplica: no hay pesos neuronales) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); la entrada es una secuencia proteica por consulta |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible; la salida es un identificador EC del vocabulario ExPASy ENZYME (release 02-Sep-2026) |
| Licencia | no disponible en la model card; los componentes citados son MMseqs2 (GPLv3) y el vocabulario ENZYME (CC BY 4.0) |
| Formato de pesos | No hay pesos neuronales; `db/` contiene una base de datos MMseqs2 de secuencias de entrenamiento y `weights/` contiene dos ficheros JSON (`train_ecs.json`, `baseline.json`) |
| Entrada | Una secuencia proteica unica por consulta |
| Salida | Un unico numero EC (top-1) |
| Sensibilidad de busqueda | 5,7 (MMseqs2), 2 hilos |
| Tamano del repositorio | 0,1 GB |
| Hardware de inferencia | CPU x86-64 (binarios AVX2 y SSE4.1) |

## Arquitectura y entrenamiento

Tecnicamente no hay entrenamiento: no se optimiza ninguna funcion de perdida ni se ajustan parametros. Lo que hay es una base de datos MMseqs2 construida a partir de las secuencias de entrenamiento (identificadas como `t<row>`) y un indice de k-mers que se construye en tiempo de ejecucion, no empaquetado. En inferencia, `predict.py` lanza una busqueda de homologia por secuencia con sensibilidad 5,7 en 2 hilos, recupera los 5 hits con mejor puntuacion, convierte sus bitscores en pesos elevandolos al cuadrado y votan los EC asociados a cada hit; el EC con mayor peso agregado es la prediccion final. Solo se evalua el primer EC, de ahi que el sistema devuelva siempre una etiqueta unica.

Los elementos de ingenieria destacables son de tipo practico, no arquitectural: seleccion automatica del binario estatico de MMseqs2 (AVX2 o SSE4.1) leyendo `/proc/cpuinfo`, una guarda de tiempo para no exceder el presupuesto de ejecucion, filtrado de predicciones contra el vocabulario EC oficial para evitar etiquetas fuera de catalogo y un EC de reserva (`weights/baseline.json`) cuando la busqueda no produce resultados utilizables. Todo el flujo es offline y solo requiere CPU. No se documentan en la informacion disponible ni el volumen de secuencias de la base de datos, ni la composicion taxonomica o funcional del conjunto de entrenamiento, ni procesos de validacion tipo RLHF/DPO (que no aplican a este enfoque).

## Capacidades

- Asignacion de numeros EC a secuencias proteicas mediante transferencia de homologia, devolviendo una unica etiqueta top-1.
- Busqueda local contra una base de datos de secuencias de entrenamiento, sin conexion a red ni dependencias de servicios externos.
- Votacion ponderada por bitscore al cuadrado entre los 5 mejores hits, lo que penaliza relativamente las coincidencias debiles frente a las fuertes.
- Filtrado contra el vocabulario ExPASy ENZYME (release 02-Sep-2026) para restringir la salida a identificadores validos.
- Prediccion de reserva configurable cuando no hay hits utilizables.
- Ejecucion en CPU con binarios estaticos para AVX2 y SSE4.1, con seleccion automatica segun la CPU detectada.
- Guarda de tiempo integrada en el script de prediccion para acotar la latencia por consulta.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, function calling, agentes ni capacidad multilingue: no es un modelo generativo.

## Casos de uso

- Baseline de referencia en benchmarks de clasificacion enzimatica: sirve para fijar el suelo de rendimiento por homologia pura y cuantificar la mejora atribuible a modelos profundos de proteinas evaluados sobre el mismo split.
- Anotacion de proteomas o metagenomas en entornos con recursos limitados: al ejecutarse solo en CPU y offline, permite etiquetar secuencias en servidores sin GPU o en nodos de computacion compartidos.
- Triaje previo antes de modelos costosos: las consultas con hits claros y bitscores altos pueden resolverse con este pipeline y reservar el modelo profundo para los casos ambiguos o sin homologia detectada.
- Despliegue en entornos aislados (air-gapped): al no requerir red, es apto para laboratorios o instalaciones con restricciones de conectividad, siempre que se asuma la licencia GPLv3 de los binarios incluidos.
- Verificacion de particiones de datos y deteccion de fugas: la propia tarea "Leak CURBER" esta orientada a controlar el solapamiento entre entrenamiento y evaluacion, y un buscador de homologia es la herramienta natural para auditar si dos conjuntos comparten secuencias cercanas.
- Docencia y divulgacion: un pipeline de pocas lineas y comportamiento interpretable (hits, bitscores y votos) permite explicar la transferencia de anotacion funcional sin entrar en el entrenamiento de redes neuronales.
- Priorizacion experimental en biologia sintetica: asignar un EC probable a candidatos antes de pasar a ensayos enzimaticos, aceptando que la etiqueta es una hipotesis y no una caracterizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de la tarea (accuracy, F1, precision@1 ni puntuacion del leaderboard), y los metadatos de HuggingFace no aportan cifras de evaluacion.

## Requisitos de hardware

- GPU: no necesaria; el pipeline esta disenado para inferencia en CPU.
- CPU: x86-64 con soporte AVX2 o SSE4.1; el script elige el binario estatico correspondiente leyendo `/proc/cpuinfo`.
- VRAM estimada: 0 GB.
- RAM: no disponible; el indice de k-mers de MMseqs2 se construye en tiempo de ejecucion, por lo que el pico de memoria y el tiempo de arranque dependen del tamano real de `db/` (el repositorio completo ocupa 0,1 GB).
- GPU recomendadas: no aplica (no hay ruta de ejecucion en GPU documentada).
- Despliegue: script Python autocontenido con binarios incluidos; no aplican vLLM, llama.cpp, Ollama ni TGI al no existir pesos de un modelo generativo.
- Latencia y throughput: no disponibles; la unica referencia es la configuracion fijada (sensibilidad 5,7, 2 hilos) y la existencia de una guarda de tiempo en `predict.py`.

## Comparativa con modelos similares

| Alternativa | Tipo | Parametros | Contexto | Licencia | Datos comparativos |
|---|---|---|---|---|---|
| ec-homology-lite (este repositorio) | Transferencia de homologia con MMseqs2 + voto ponderado | no aplica | no aplica | no disponible | sin benchmarks publicados |
| BLASTp o DIAMOND + transferencia del mejor hit o voto mayoritario | Alineamiento local clasico | no aplica | no aplica | BLAST+: dominio publico en la practica; DIAMOND: GPL | no disponible en esta busqueda |
| MMseqs2 con asignacion por LCA (ancestro comun mas bajo) | Busqueda por homologia con agregacion taxonomica | no aplica | no aplica | GPLv3 | no disponible en esta busqueda |
| Modelos de lenguaje de proteinas ajustados para prediccion de EC (familia ESM u otros) | Red neuronal transformer sobre secuencias | no disponible | no disponible | variable segun modelo | no disponible en esta busqueda |

Las filas de alternativas se incluyen como referencia de categoria; no se dispone de cifras de rendimiento verificadas en la informacion proporcionada para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Prediccion top-1 forzada: solo se evalua y se devuelve el primer EC, de modo que las enzimas con actividades multiples o con clasificacion multi-etiqueta quedan colapsadas en una sola etiqueta.
- Dependencia total de la cobertura de `db/`: secuencias sin homologia detectable en la base de entrenamiento caen en el EC de reserva de `weights/baseline.json`, lo que puede producir etiquetas sistematicamente sesgadas hacia la clase mayoritaria.
- Sesgo hacia las familias enzimaticas sobrerrepresentadas en las secuencias de entrenamiento; la model card no documenta la composicion del conjunto, por lo que el sesgo no puede estimarse.
- Configuracion fija de sensibilidad 5,7 y 2 hilos: no se documenta el efecto de estos valores sobre recall o latencia, ni existen curvas de compromiso publicadas.
- Sin licencia declarada para el repositorio: el uso comercial es juridicamente incierto, y ademas incorpora binarios MMseqs2 bajo GPLv3 (copyleft) y el vocabulario ENZYME bajo CC BY 4.0, que exige atribucion.
- Distribucion de binarios estaticos precompilados: conviene verificar su procedencia y sus sumas de comprobacion antes de ejecutarlos en produccion; la ficha no aporta informacion al respecto.
- Ausencia de validacion externa: 0 descargas y 0 likes, sin pipeline declarado, sin idiomas y sin metricas; se trata de una entrega academica, no de un artefacto con soporte.
- No apta para tareas generativas: no produce explicaciones, no razona y no soporta tool calling ni agentes, por lo que no debe integrarse en pipelines conversacionales.
- Resultado a interpretar como hipotesis funcional: la transferencia de homologia no sustituye la validacion experimental de una actividad enzimatica.
- Metadatos incompletos en HuggingFace: sin `pipeline_tag`, sin `language` y sin licencia, lo que dificulta el filtrado y la trazabilidad en catalogos automatizados.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Legend7001/ec-homology-lite
- Referencia de MMseqs2 citada en la model card: Steinegger y Soding, "MMseqs2 enables sensitive protein sequence searching for the analysis of massive data sets", Nature Biotechnology, 2017 (GPLv3); no se proporciona URL en la informacion disponible.
- Vocabulario EC citado en la model card: ExPASy ENZYME, release 02-Sep-2026, SIB (CC BY 4.0); no se proporciona URL en la informacion disponible.
- No se han encontrado enlaces adicionales relevantes sobre el modelo: los resultados de la busqueda web no contenian informacion relacionada con este repositorio.
