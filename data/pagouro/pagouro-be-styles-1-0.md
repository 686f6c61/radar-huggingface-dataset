# Pagouro/pagouro-be-styles-1.0

## Resumen

Pagouro BE Styles 1.0 no es un modelo de lenguaje, sino un paquete de seis plugins de estilo en formato LoRA para Pagouro BE, el modelo de imagen de la Belle Époque que el proyecto distribuye en una memoria USB. Lo publica el autor Pagouro (Eric Wade), con asistencia declarada de Claude (Anthropic), y cada LoRA es un archivo pequeno que se monta sobre el modelo ya distribuido a traves de stable-diffusion.cpp, de modo que el modelo base no se modifica. El paquete resuelve un problema concreto: anadir estilos pictoricos historicos a un modelo de imagen sin reentrenar ni alterar los pesos originales.

Los seis estilos son arte rupestre del suroeste estadounidense (petroglifos y pictogramas ancestrales), grabado ukiyo-e, pintura de tumbas del antiguo Egipto (a partir de facsimiles del Metropolitan Museum), pintura de vasos griegos, laminas de historia natural del siglo XIX y pintura holandesa del siglo XVII. La propuesta es relevante por su enfoque de trazabilidad: cada imagen de entrenamiento tiene una licencia identificable y una fila en un registro (ledger), las metricas de la caja se miden sobre un test congelado que se incluye en el paquete, y la entrega se firma y se sella con marca temporal.

Tecnicamente, cada LoRA es de rango 64, con los nombres de tensores originales de Stable Diffusion y su alpha, en el formato que lee stable-diffusion.cpp. El repositorio completo ocupa 0,5 GB. No se especifican parametros totales del modelo base, licencia, idiomas ni pipeline en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 64) sobre un modelo de difusion con nombres de tensores de Stable Diffusion, ejecutado mediante stable-diffusion.cpp |
| Parametros totales | no disponible (el paquete contiene seis archivos LoRA; el modelo base Pagouro BE no publica cifra en esta informacion) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen); resolucion de entrenamiento y medicion: 512x512 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los ejemplos de la model card usan prompts en ingles) |
| Licencia | no disponible |
| Formato de pesos | archivos LoRA con los nombres de tensores originales de Stable Diffusion mas alpha, en el layout que lee stable-diffusion.cpp |
| Numero de estilos incluidos | 6 (rockart, ukiyoe, egipto, vasos griegos, laminas de historia natural del siglo XIX, pintura holandesa del siglo XVII) |
| Tamano del repositorio | 0,5 GB |
| Resolucion recomendada | 512x512 (a 384x384 el estilo de arte rupestre colapsa en un campo morado) |
| Sampler recomendado | dpm++2m |
| Trigger por estilo | incluido en styles.json; el lanzador lo anade automaticamente |

## Arquitectura y entrenamiento

Cada uno de los seis estilos es un LoRA de rango 64 que se aplica sobre el modelo base Pagouro BE sin alterarlo. Los pesos conservan los nombres de tensores originales de Stable Diffusion con su alpha, que es el formato que lee stable-diffusion.cpp. La inferencia se realiza con el sampler dpm++2m a 512x512, tamano al que fueron entrenados y medidos; el uso directo con sd-cli requiere `--lora-model-dir styles` y cerrar el prompt con la etiqueta `<lora:estilo:peso>`.

Los datos de entrenamiento se documentan estilo por estilo en STYLES.md y en un ledger por conjunto: fuente, licencia, atribucion, recorte de la obra y el caption tal como se entreno. Todas las imagenes de entrenamiento cuentan con una licencia identificable y una fila en el registro. Los captions de cada imagen fueron escritos por un modelo de vision de pesos abiertos (Qwen 3.6 27B, licencia Apache 2.0) y asi se etiquetan en los ledgers; el autor declara que ninguna API comercial forma parte de la cadena de este paquete. No se indica en la informacion disponible el numero de tokens, el volumen de imagenes por estilo ni si hubo fases de RLHF o DPO (no aplicables en sentido estricto a un modelo de difusion).

## Capacidades

- Generacion de imagenes en seis estilos historicos concretos, activables por trigger: arte rupestre, ukiyo-e, pintura de tumbas egipcias, pintura de vasos griegos, laminas de historia natural del siglo XIX y pintura holandesa del siglo XVII.
- Control de intensidad del estilo mediante peso del LoRA (la model card cita `<lora:ukiyoe:1.0>` como peso recomendado y remite a STYLES.md para cada estilo).
- Aplicacion no destructiva: el modelo base permanece intacto, ya que el estilo se monta como capa LoRA en tiempo de inferencia.
- Ejecucion mediante stable-diffusion.cpp a traves del lanzador PAGOURO-BE-STYLE.bat o de sd-cli.
- Aparicion de caligrafia en el estilo ukiyo-e, porque las estampas originales la incluyen.
- Trazabilidad de datos: cada estilo incluye ledger de conjunto de entrenamiento con fuente, licencia, atribucion y caption.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo de imagen, no un modelo de lenguaje.
- No se documentan capacidades multilingues, de audio ni de thinking mode.

## Casos de uso

- Ilustracion editorial con estetica ukiyo-e: generar estampas para portadas o articulos con el estilo `ukiyoe`, teniendo en cuenta que este estilo anade caligrafia a la mayoria de las imagenes, algo aprovechable si se busca autenticidad de grabado y problematico si se necesita el encuadre limpio.
- Assets para videojuegos o experiencias con estetica ancestral: el estilo `rockart` produce petroglifos y pictogramas del suroeste norteamericano, util para ambientar escenarios prehistoricos, aceptando que a peso completo el estilo pierde el sujeto en la mitad o mas de los casos.
- Prototipado de portadas o laminas cientificas: el estilo de laminas de historia natural del siglo XIX sirve para bocetos de ilustracion botanica o zoologica con acabado de epoca.
- Divulgacion arqueologica y museistica: el estilo de pintura de tumbas egipcias, entrenado a partir de facsimiles del Metropolitan Museum, permite recrear el lenguaje visual funerario egipcio en materiales educativos.
- Referencia de historia del arte: el estilo de pintura holandesa del siglo XVII, que segun la model card es el que dibuja rostros mas convincentes, sirve para estudiar composicion, luz y tratamiento de la figura en ese periodo.
- Estudio comparativo de estilos pictoricos: los seis LoRA permiten generar una misma escena en seis lenguajes historicos distintos a 512x512, util para docencia o analisis visual.
- Flujos con requisitos de trazabilidad: al incluir licencia y atribucion por imagen de entrenamiento y un manifiesto firmado con marca temporal, el paquete encaja en proyectos donde hay que justificar la procedencia de los datos de un modelo generativo.
- Pruebas de integracion de LoRA en pipelines ligeros: el uso con stable-diffusion.cpp y sd-cli permite verificar el montaje de LoRA de rango 64 en un runtime portable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe un sistema de evaluacion propio (una "gate" congelada que se envia con el paquete, con veredictos y hojas de resultados en `evals/`), pero no reproduce cifras numericas por estilo, y remite a STYLES.md para los numeros de cada uno. Los unicos datos cualitativos explicitos son los siguientes:

| Aspecto evaluado | Resultado declarado |
|---|---|
| Seguimiento del sujeto frente a estilo | A peso completo, los estilos de arte rupestre y de vasos griegos dibujan el estilo de forma convincente pero pierden el sujeto en la mitad o mas de los casos |
| Anatomia (ocho captions: dos ojos, cinco dedos) | Ningun estilo supera aproximadamente la mitad de aciertos; el modelo base tampoco |
| Rostros | El estilo holandes es el que dibuja rostros mas convincentes para un evaluador humano |
| Manos | El juez cuenta los dedos de forma estricta |
| Rotulacion | Los estilos de arte rupestre, vasos griegos y egipcio casi nunca anaden texto; ukiyo-e anade caligrafia a la mayoria de imagenes |
| Robustez a resolucion | A 384x384 el estilo de arte rupestre colapsa en un campo morado; el entrenamiento y la medicion son a 512x512 |

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada; el paquete no publica cifras de memoria.
- GPU recomendadas: no disponible. El runtime declarado es stable-diffusion.cpp, lo que permite ejecucion tanto en CPU como en GPU.
- GPU de consumo: el proyecto distribuye el modelo base en una memoria USB y funciona con un runtime portable, lo que apunta a hardware de consumo, pero no se especifica que GPU concretas estan soportadas ni con que VRAM.
- Tamano en disco: el repositorio completo ocupa 0,5 GB, incluyendo los seis LoRA, los ledgers, las evaluaciones y la documentacion.
- Opciones de despliegue: stable-diffusion.cpp mediante el lanzador PAGOURO-BE-STYLE.bat, o sd-cli directamente con `--lora-model-dir styles`, `--sampling-method dpm++2m -W 512 -H 512`.
- Latencia y throughput: no disponible.
- Configuracion de generacion recomendada: 512x512 con sampler dpm++2m y el peso de LoRA indicado en STYLES.md para cada estilo.

## Comparativa con modelos similares

La informacion disponible no documenta modelos comparables ni sus cifras, por lo que una comparacion cuantitativa con alternativas externas no es posible sin inventar datos. La unica comparacion sustentada en la informacion proporcionada es interna, entre los seis estilos del propio paquete:

| Estilo | Comportamiento declarado | Rotulacion | Peso recomendado |
|---|---|---|---|
| rockart | Dibuja el estilo de forma convincente; pierde el sujeto en la mitad o mas de los casos a peso completo; colapsa a 384x384 | Casi nunca anade texto | Definido en STYLES.md |
| ukiyoe | Estilo basado en estampas; emite caligrafia en la mayoria de imagenes | Si, caligrafia | 1.0 (segun el ejemplo de la model card) |
| Egipcio | A partir de facsimiles del Metropolitan Museum | Casi nunca anade texto | Definido en STYLES.md |
| Vasos griegos | Dibuja el estilo de forma convincente; pierde el sujeto en la mitad o mas de los casos a peso completo | Casi nunca anade texto | Definido en STYLES.md |
| Laminas de historia natural (s. XIX) | No se detallan incidencias especificas | No detallada | Definido en STYLES.md |
| Pintura holandesa (s. XVII) | El que dibuja rostros mas convincentes para un evaluador humano | No detallada | Definido en STYLES.md |

Comparativa con otros modelos o paquetes de LoRA: no disponible.

## Limitaciones y advertencias

- Compromiso entre estilo y sujeto: los LoRA de estilo sacrifican el seguimiento del sujeto a cambio de estilo. A peso completo, los estilos de arte rupestre y de vasos griegos pierden el sujeto en la mitad o mas de los casos; los pesos recomendados son el compromiso medido por el autor.
- Anatomia: sobre los ocho captions de anatomia, ningun estilo supera aproximadamente la mitad de aciertos, y el modelo base tampoco. El estilo holandes es el mas convincente para rostros segun juicio humano, pero el recuento de dedos se evalua de forma estricta.
- Rotulacion no controlada: ukiyoe anade caligrafia a la mayoria de las imagenes; los estilos de arte rupestre, vasos griegos y egipcio casi nunca anaden texto.
- Restriccion de resolucion: el entrenamiento y la medicion son a 512x512; a 384x384 el estilo de arte rupestre colapsa en un campo morado.
- Licencia no disponible: la ficha de HuggingFace no declara licencia, lo que impide confirmar las condiciones de uso comercial. Cualquier uso en produccion deberia aclararse con el autor.
- Idiomas no disponibles: no se declara cobertura idiomatica; los ejemplos de uso estan en ingles.
- Trazabilidad documentada pero no verificable desde esta ficha: el autor afirma que cada imagen de entrenamiento tiene licencia nombrable y fila en un ledger, y que los captions se generaron con Qwen 3.6 27B (Apache 2.0), sin APIs comerciales en la cadena. Estos datos provienen de la propia documentacion del proyecto.
- Adopcion nula en el momento de la consulta: 0 descargas y 0 likes en HuggingFace, por lo que no existe validacion independiente de terceros.
- Dependencia del modelo base: los LoRA estan pensados para Pagouro BE y su runtime stable-diffusion.cpp; no se documenta su comportamiento sobre otros modelos de difusion.
- Sesgos conocidos: no se documentan sesgos especificos en la informacion disponible, aunque los corpus historicos empleados (estampas, pintura de epoca, laminas cientificas) incorporan por definicion los sesgos representacionales de sus periodos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Pagouro/pagouro-be-styles-1.0
- Repositorio del proyecto Pagouro BE: https://github.com/ericrwade/pagouro-be
- Referencias internas del paquete citadas en la model card: STYLES.md, styles.json, MANIFEST.md (firma y marca temporal), LICENSES.md, carpeta ledger/, carpeta evals/ (gate, veredictos, hojas, runtime_check_512.jpg)
