# psikosen/ResearchSquad-Experimental-Preliminary-v0.1

## Resumen

ResearchSquad — Experimental and Preliminary v0.1 es un repositorio publicado por el usuario psikosen el 16 de septiembre de 2026 que agrupa tres checkpoints independientes seleccionados de experimentos locales. No es un modelo combinado ni un asistente de proposito general: la propia model card lo describe como «artefactos de investigacion temprana, no un modelo de produccion». Dos de los checkpoints pertenecen a un experimento de memoria asociativa continua y el tercero a un experimento de planificacion latente con un modelo de mundo reducido.

El checkpoint con recuento de parametros documentado es el de memoria: un transformer causal de dos capas, anchura 128, cuatro cabezas de consulta y dos de clave/valor, FFN de anchura 256, vocabulario de 65 simbolos y contexto de 16, con 306.323 parametros en total, incluidas cabezas de decision no entrenadas. El experimento temporal es aun mas pequeno: un codificador que proyecta 7 caracteristicas a 8 dimensiones latentes mediante una capa tanh de anchura 32, y un modelo de dinamica residual que combina 8 valores latentes con 4 coordenadas de accion mediante una capa tanh de anchura 64.

Su relevancia es metodologica: cuantifica el compromiso entre retener asociaciones nuevas y preservar las iniciales en aprendizaje continuo con LoRA y replay, y aporta un resultado negativo sobre el «straightening» latente como tecnica de planificacion. El repositorio no declara licencia, idiomas ni pipeline, tiene un tamano de 0,0 GB y acumulaba 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Desarrollador | psikosen (usuario de HuggingFace) |
| Fecha de publicacion | 16 de septiembre de 2026 |
| Arquitectura | Dos familias independientes: (1) transformer causal de 2 capas, anchura 128, 4 cabezas de consulta y 2 de clave/valor, FFN de anchura 256 (checkpoints de memoria); (2) modelo de mundo reducido con codificador (7 caracteristicas a 8 dimensiones latentes, capa tanh de anchura 32) y modelo de dinamica residual (8 latentes + 4 acciones, capa tanh de anchura 64) (checkpoint temporal) |
| Parametros totales | 306.323 en los checkpoints de memoria (incluyen cabezas de decision no entrenadas y sin competencia declarada); el modelo temporal no publica recuento: no disponible |
| Longitud de contexto | 16 tokens en los checkpoints de memoria (entrada BOS + clave de 6 caracteres + separador); no aplica al modelo temporal |
| Tipos de cuantizacion | No se documentan cuantizaciones; los pesos son de coma flotante y la model card indica explicitamente que no son modelos ternarios |
| Idiomas soportados | no disponible; el vocabulario es un esquema local de caracteres (BOS=0, separador=1, 62 caracteres alfanumericos en los IDs 2-63, EOS=64), no un tokenizador de ingles |
| Licencia | no disponible |
| Formato de pesos | state dicts de PyTorch (model.pt) con solo tensores; las exportaciones densas de memoria usan las matrices efectivas W + 2BA |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Los checkpoints de memoria son transformers causales inicializados aleatoriamente, sin modelo preentrenado ni corpus descargado. Un progenitor aprendio 32 asociaciones aleatorias en 400 actualizaciones de pesos completos. Despues, cada una de las diez tareas posteriores introdujo 16 asociaciones nuevas mediante 200 actualizaciones LoRA de rango 16, alpha 32, tasa de aprendizaje 0,003, lote 16, AdamW con betas (0,9 y 0,95), weight decay 0,01, recorte de gradiente 1 y un calentamiento de diez actualizaciones. El optimizador se reinicia en cada tarea y las matrices LoRA se fusionan entre tareas. El replay utiliza registros anteriores reales; la variante «parent-preserving» asigna la mitad de los lotes de replay posteriores a las asociaciones iniciales. El entrenamiento uso pesos maestros FP32 y computo BF16 en CUDA sobre una RTX 5090. Las entradas son BOS + clave de seis caracteres + separador, y la generacion predice cuatro caracteres de valor y EOS.

El experimento temporal es una version reducida y condicionada por acciones, inspirada en el articulo «Temporal Straightening for Latent Planning», no una reproduccion de su sistema visual completo ni un derivado del modelo de memoria. Se entreno en FP32 sobre CPU durante 1.200 actualizaciones Adam, lote 128, tasa 0,001. El tratamiento suma 0,01 veces la curvatura de desplazamiento al error cuadratico medio de prediccion latente, con objetivos de parada de gradiente, y excluye del termino de angulo las transiciones observadas estacionarias. El entrenamiento usa 512 episodios completos de camino aleatorio y 128 episodios distintos para desarrollo, sobre dos mapas conocidos de 7x7 (uno abierto y otro con un muro y un paso de un solo sentido). La evaluacion emplea 32 pares de objetivos nuevos por mapa. El planificador optimiza acciones categoricas suaves y luego ejecuta acciones discretas con horizonte 8, 30 iteraciones de gradiente y un maximo de 20 acciones ejecutadas. Una prueba adicional inspirada en Dream-RSI encontro que una regla de parada simple igualaba a la politica seleccionada por replay en 32 problemas nuevos.

## Capacidades

- Memorizacion de asociaciones clave-valor sinteticas: 32 asociaciones en el progenitor y 16 adicionales por tarea a lo largo de diez tareas.
- Aprendizaje continuo con LoRA y replay: las matrices LoRA se fusionan entre tareas y el optimizador se reinicia en cada una.
- Retencion de memoria nueva: hasta el 59,4% de 160 asociaciones nuevas (variante de replay almacenado, semilla 43).
- Preservacion de la memoria inicial: 32/32 asociaciones de partida retenidas en la variante parent-preserving, a costa de reducir la retencion de las nuevas al 33,8%.
- Planificacion latente en mapas 7x7 conocidos: 65,6% de exito en el mejor checkpoint temporal (semilla 17) frente al 32,8% del control de solo prediccion.
- Ejecucion de un planificador con acciones categoricas suaves y ejecucion discreta posterior (horizonte 8, hasta 20 acciones).
- Carga sin dependencias especiales: modelos PyTorch ordinarios, sin AutoModel, sin endpoint alojado y sin remote code.
- No soporta generacion de lenguaje natural: el vocabulario es un esquema de caracteres local y la salida se limita a cuatro caracteres de valor mas EOS.
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso general ni uso conversacional.
- No tiene capacidades multilingues declaradas.
- No tiene vision, audio ni modo de razonamiento («thinking mode»).
- Las cabezas de decision presentes en el export no estan entrenadas y no tienen competencia de tarea declarada.

## Casos de uso

- Reproduccion de resultados de aprendizaje continuo: el repositorio incluye hashes de los checkpoints originales en cada config y el archivo results.json, lo que permite repetir las 18 comprobaciones de memoria y verificar que 18/18 reprodujeron sus predicciones tras restaurar el archivo congelado.
- Linea base de olvido catastrofico: con solo 306.323 parametros y entrenamiento sintetico local, sirve como referencia minima para comparar metodos de replay mas costosos en terminos de retencion de asociaciones.
- Estudio del compromiso entre plasticidad y estabilidad: las dos variantes (replay almacenado y parent-protecting) ofrecen dos puntos de operacion medidos (0% de memoria inicial retenida frente a 100%, con 59,4% y 33,8% de retencion nueva respectivamente) utiles para calibrar curvas de compromiso.
- Validacion de flujos de LoRA con fusion entre tareas: el ajuste concreto (rango 16, alpha 32, LR 0,003, lote 16, AdamW, reinicio de optimizador por tarea) permite probar infraestructura de entrenamiento incremental antes de escalarla a modelos mayores.
- Investigacion en planificacion latente en entornos conocidos: los dos mapas 7x7 con dinamica conocida y 32 pares de objetivos por mapa permiten evaluar tecnicas de mundo latente frente a un solver exacto que resuelve 64/64.
- Control negativo para pipelines de planificacion exacta: dado que el solver de camino mas corto con dinamica conocida resuelve el 100% de los casos, el modelo temporal sirve para detectar cuando una tecnica aprendida no aporta valor frente a una solucion determinista.
- Pruebas de infraestructura de carga sin remote code: al ser state dicts tensoriales en model.pt, es util para validar entornos limpios de PyTorch (version probada 2.11.0) sin dependencias de transformers ni de codigo remoto.
- Docencia y prototipado en CPU: el modelo temporal se entrena y se evalua en FP32 sobre CPU, por lo que es viable en aulas o laboratorios sin GPU.
- Auditoria de seleccion de checkpoints: el repositorio documenta el sesgo de seleccion (los mejores resultados sobre fixtures sinteticos publicos no son resultados de test limpios) y permite estudiar su efecto en la eleccion de modelos.

## Benchmarks y rendimiento

Retencion de memoria tras diez tareas posteriores (32 asociaciones iniciales, 16 nuevas por tarea). La metrica mide memorizacion de asociaciones ya presentadas, no generalizacion a preguntas no vistas. Todos los metodos adquirieron inicialmente sus tareas nuevas al 100%.

| Metodo | Semilla 17 | Semilla 29 | Semilla 43 | Memoria inicial (todas las semillas) |
|---|---:|---:|---:|---:|
| Stored replay + merge | 54,4% | 53,8% | 59,4% | 0% |
| Parent-protecting replay + merge | 32,5% | 33,8% | 33,8% | 100% |

Mejores checkpoints publicados: «memory-best» (stored replay + merge, semilla 43) retiene 95/160 asociaciones nuevas (59,4%) y 0/32 de las iniciales; «memory-parent-preserving» (semilla 29) retiene 54/160 nuevas (33,8%) y 32/32 iniciales.

Planificacion temporal: casos de objetivo alcanzado sobre 64 evaluaciones por semilla.

| Semilla | Control de solo prediccion | Straightening |
|---|---:|---:|
| 17 | 21/64 (32,8%) | 42/64 (65,6%) |
| 29 | 26/64 (40,6%) | 32/64 (50,0%) |
| 43 | 21/64 (32,8%) | 26/64 (40,6%) |
| Media | 35,4% | 52,1% |

Advertencias recogidas en la model card: los mismos 64 objetivos se repiten en las tres semillas (no son 192 objetivos independientes); el solver exacto con dinamica conocida resuelve los 64; dos semillas empeoran en el mapa dificil (13 a 11 y 10 a 9 exitos) y la tercera mejora de 4 a 13, por lo que la reduccion de curvatura por si sola no es evidencia de mejor planificacion. Mejor checkpoint temporal publicado: «temporal-best» (coeficiente 0,01, semilla 17) con 42/64 (65,6%). En la prueba numerica inspirada en Dream-RSI, una regla de parada simple igualo a la politica seleccionada por replay en 32 problemas nuevos, sin ventaja incremental demostrada.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Checkpoints de memoria: 306.323 parametros, aproximadamente 1,2 MB en FP32. Cabe sobradamente en CPU y en cualquier GPU de consumo; no requiere acelerador.
- Entrenamiento de memoria registrado: pesos maestros FP32 y computo BF16 en CUDA sobre una RTX 5090.
- Modelo temporal: entrenado en FP32 sobre CPU durante 1.200 actualizaciones Adam; el checkpoint mas pequeno del repositorio. No se publica el recuento de parametros.
- Inferencia en GPU de consumo: viable para ambos experimentos por tamano, aunque no hay cifras publicadas de latencia ni de throughput.
- GPU de clase A100, H100 u otras: no son necesarias segun la informacion disponible.
- Despliegue: carga directa con Python y PyTorch (version probada 2.11.0) sobre state dicts model.pt. No hay soporte declarado de vLLM, llama.cpp, Ollama ni TGI, y no se ofrecen pesos GGUF.
- Enrutado: no requiere AutoModel, endpoint de inferencia alojado ni cargador de remote code.
- Latencia y throughput estimados: no disponibles.
- Nota operativa: los estados de optimizador y de RNG permanecen en el archivo congelado local y no se incluyen en el paquete de inferencia.

## Comparativa con modelos similares

No se han identificado en la informacion proporcionada modelos externos comparables, ni se aportan comparaciones con alternativas de la misma categoria. La unica comparacion disponible es interna al repositorio:

| Checkpoint / condicion | Tipo | Parametros | Retencion nueva | Memoria inicial | Exito de planificacion |
|---|---|---|---|---|---|
| memory-best (seed 43) | Transformer causal + replay almacenado | 306.323 | 95/160 (59,4%) | 0/32 | no aplica |
| memory-parent-preserving (seed 29) | Transformer causal + replay protector | 306.323 | 54/160 (33,8%) | 32/32 | no aplica |
| temporal-best (seed 17) | Modelo de mundo latente + straightening | no disponible | no aplica | no aplica | 42/64 (65,6%) |
| Control temporal (media de semillas) | Prediccion sin straightening | no disponible | no aplica | no aplica | 35,4% |
| Solver exacto de camino mas corto | Determinista, dinamica conocida | no aplica | no aplica | no aplica | 64/64 (100%) |

Comparativas con modelos de terceros: no disponible.

## Limitaciones y advertencias

- No es un modelo de produccion: la propia model card lo califica como artefacto de investigacion temprana y advierte de que no es un asistente de proposito general ni un investigador autonomo cualificado.
- Sesgo de seleccion: los checkpoints publicados son los mejores observados sobre fixtures sinteticos publicos; sus puntuaciones individuales son estimaciones sesgadas por seleccion, no resultados de test limpio.
- Ambito de evaluacion reducido: los resultados de memoria miden memorizacion de asociaciones ya presentadas, no generalizacion a preguntas no vistas; la planificacion se evalua en dos mapas 7x7 conocidos y no mide transferencia a mapas no vistos.
- Volumen de datos minimo: los objetivos de planificacion son 64 repetidos en las tres semillas, no 192 independientes; el entrenamiento usa 512 episodios de camino aleatorio y 128 de desarrollo.
- Ausencia de ventaja demostrada: en la prueba inspirada en Dream-RSI, una regla de parada simple igualo a la politica seleccionada por replay en 32 problemas nuevos; no se incluye ningun modelo entrenado con Dream-RSI.
- Los pesos son de coma flotante y no ternarios, a pesar del objetivo de investigacion ternaria mas amplio del laboratorio.
- Los tres checkpoints son artefactos separados: no existe un modelo unificado y no comparten pesos ni objetivo entre los experimentos de memoria y temporal.
- Vocabulario restringido: esquema local de caracteres con 65 simbolos y contexto de 16 tokens; no hay tokenizador de ingles ni capacidades de lenguaje natural.
- Idiomas soportados: no disponibles; la model card no declara ningun idioma.
- Licencia: no disponible, por lo que no puede confirmarse la viabilidad de uso comercial ni las condiciones de redistribucion.
- Despliegue: al tratarse de codigo personalizado sin soporte de vLLM, llama.cpp, Ollama ni TGI, la integracion en pilas de servicio estandar requiere trabajo adicional.
- Repositorio sin traccion: 0 descargas, 0 likes y 0,0 GB de tamano en el momento de la consulta.
- Riesgo de alucinacion y sesgos: no se documentan sesgos conocidos; no obstante, al carecer de evaluacion sobre datos reales, cualquier extrapolacion fuera del entorno sintetico carece de respaldo experimental.
- Restriccion de uso recomendada: emplear solo como referencia metodologica o linea base, nunca como componente de decision en produccion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/psikosen/ResearchSquad-Experimental-Preliminary-v0.1
- Articulo de referencia del experimento temporal, «Temporal Straightening for Latent Planning»: https://arxiv.org/html/2603.12231v3
- Resultados completos y todas las semillas: archivo results.json mencionado en la model card (referenciado dentro del repositorio).
- Fixture publico de los registros del experimento de memoria: archivo memory-fixture.json (referenciado dentro del repositorio).
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los enlaces recuperados corresponden a ofertas de empleo y paginas academicas alemanas sin relacion con el repositorio.
