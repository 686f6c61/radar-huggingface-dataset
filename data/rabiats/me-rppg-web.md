# RabiatS/me-rppg-web

## Resumen

RabiatS/me-rppg-web es un espejo de pesos publicado en HuggingFace que reproduce, en formato ONNX, los ficheros del modelo ME-rPPG desarrollado por Kegang Wang, Jiankai Tang y su equipo en la Universidad de Tsinghua. No se trata de un modelo de lenguaje ni de un modelo generativo: su tarea declarada en el Hub es la estimacion de frecuencia cardiaca (pipeline "Heart rate") a partir de senal fisiologica obtenida de video, dentro de la disciplina conocida como rPPG (remote photoplethysmography, fotopletismografia remota).

La relevancia de esta copia concreta es de ingenieria, no cientifica. El autor la publica para que la pagina rabiatsadiq.com/lab/webcam-pulse pueda cargar los pesos directamente en el navegador mediante transformers.js, con el objetivo declarado de que "la pagina no pueda cambiar ni desaparecer por debajo". Es, por tanto, un artefacto de dependencia fijada: una copia recortada de los ficheros originales, sin modificar los pesos, en el commit `bec0855162a032832cfb71670c8ca7c79e218cd3` del repositorio original.

El repositorio presenta 0 descargas y 0 likes en el momento de redactar esta ficha, y un tamano reportado de 0.0 GB, lo que sugiere pesos muy ligeros (del orden de megabytes o menos). La model card es minima: no documenta arquitectura, numero de parametros, datos de entrenamiento, composicion del dataset ni resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no describe la topologia de red; se remite al repositorio original de ME-rPPG) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no hay indicios de que sea un modelo de mezcla de expertos) |
| Longitud de contexto | no aplicable; no es un modelo de lenguaje, sino un modelo de vision orientado a la estimacion de frecuencia cardiaca |
| Tipos de cuantizacion | no disponible; se distribuye directamente en ONNX |
| Idiomas soportados | no disponible; la tarea no es linguistica |
| Licencia | MIT |
| Formato de pesos | ONNX (carga via transformers.js) |

## Arquitectura y entrenamiento

La informacion proporcionada no incluye ningun detalle sobre la arquitectura interna del modelo: ni tipo de red (CNN, transformer, hibrida), ni numero de capas, ni mecanismo de atencion o de agregacion temporal. La model card se limita a indicar que se trata de una copia de ficheros del repositorio github.com/KegangWangCCNU/ME-rPPG, recortada a los ficheros que la demo web carga en el navegador, y que los pesos no han sido modificados.

Tampoco hay datos sobre el entrenamiento: no se especifica el numero de clips de video ni de horas utilizadas, la composicion del dataset, el tipo de supervision (frecuencia cardiaca media por ventana, forma de onda completa, etc.), ni si se aplicaron tecnicas de ajuste fino o destilacion. Cualquier afirmacion al respecto seria especulativa. Para obtener esta informacion hay que acudir a la documentacion y a la publicacion asociada del repositorio original de ME-rPPG, no a esta copia.

La unica innovacion tecnica verificable en este repositorio es de empaquetado: la conversion a ONNX y su publicacion con `library_name: transformers.js`, lo que habilita inferencia en el navegador del cliente sin backend de servidor.

## Capacidades

- Estimacion de frecuencia cardiaca a partir de video: el pipeline declarado en el Hub es "Heart rate", lo que implica extraccion de senal rPPG y estimacion de pulso sobre imagenes de rostro capturadas con camara.
- Inferencia en el navegador: los ficheros estan preparados para cargarse con transformers.js, de modo que la inferencia puede ejecutarse en el cliente (WebAssembly o WebGPU) sin enviar video a un servidor.
- Generacion de texto: no disponible; no hay evidencia de que el modelo genere lenguaje.
- Codigo y matematicas: no disponible; fuera del alcance declarado del modelo.
- Vision general (descripcion de imagenes, deteccion de objetos): no disponible; el pipeline declarado es especifico de frecuencia cardiaca.
- Tool calling y function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no aplicable.
- Capacidades especiales (modo thinking, audio, vision multimodal): no disponible.

## Casos de uso

- Medicion de pulso en aplicaciones web de bienestar: una pagina puede solicitar acceso a la webcam, procesar los fotogramas localmente con este modelo ONNX y mostrar una estimacion de frecuencia cardiaca sin transmitir video a ningun servidor, lo que reduce el riesgo de privacidad y el coste de infraestructura.
- Telemedicina y triaje remoto de bajo coste: en una consulta por videollamada, el modelo permite obtener una senal cardiaca orientativa como complemento a la anamnesis, siempre que se presente como medicion no diagnostica y se validen sus limites en poblacion real.
- Monitorizacion de conductores: integrado en una aplicacion de cabina con camara frontal, puede estimar variaciones de pulso compatibles con fatiga o estres, alimentando alertas de descanso; su naturaleza ligera permite ejecutarlo en el propio dispositivo.
- Investigacion en interaccion persona-ordenador: para estudiar carga cognitiva o respuesta afectiva en experimentos con navegador, el modelo ofrece una via de captura fisiologica no invasiva y desplegable en cualquier equipo con webcam.
- Aplicaciones de fitness y entrenamiento guiado: durante una sesion frente a la pantalla, el modelo puede estimar el pulso entre series y adaptar el ritmo de la rutina en funcion de la recuperacion observada.
- Demostraciones educativas de rPPG: dado su tamano reducido y su distribucion en ONNX, es adecuado para talleres y material docente donde se explique como se extrae una senal cardiaca a partir de variaciones sutiles de color en la piel.
- Kioscos de salud en ferias o entornos de atencion al publico: una terminal con navegador puede medir el pulso en pocos segundos sin instalar software ni incorporar hardware dedicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card de este repositorio no incluye metricas de error (MAE, RMSE), correlacion con pulsioximetria de referencia, ni comparaciones con otros metodos de rPPG. Tampoco hay datos de latencia o de rendimiento en navegador.

## Requisitos de hardware

- VRAM: no disponible. El modelo esta pensado para ejecutarse en el cliente mediante ONNX, por lo que no requiere GPU dedicada en servidor.
- GPU recomendadas: no aplicable en el escenario de despliegue previsto; en navegador se beneficia de WebGPU si esta disponible, y funciona en CPU mediante WebAssembly en caso contrario.
- Cabe en GPU de consumo: no disponible como dato verificado, si bien el tamano de repositorio reportado (0.0 GB) sugiere un modelo muy pequeno, compatible con ejecucion en cualquier equipo de escritorio o portatil con navegador moderno.
- Opciones de despliegue: transformers.js en navegador (escenario documentado). Al estar en ONNX, tambien podria ejecutarse con ONNX Runtime en otros entornos, aunque esta posibilidad no esta documentada por el autor.
- Latencia y throughput: no disponible. Dependera del hardware del cliente, de la resolucion de los fotogramas y de la ventana temporal minima necesaria para estimar el pulso.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros modelos de rPPG con los que comparar parametros, contexto, rendimiento o licencia, y no se dispone de datos de evaluacion de este modelo que permitan establecer una comparacion rigurosa.

## Limitaciones y advertencias

- Ausencia de documentacion tecnica: la model card no describe arquitectura, entrenamiento, datos ni evaluacion. No es una publicacion cientifica, sino una copia de ficheros para uso web.
- No es un dispositivo medico: la estimacion de frecuencia cardiaca obtenida por rPPG es orientativa y no debe presentarse como medicion diagnostica ni sustituir a pulsioximetros o electrocardiogramas validados.
- Sensibilidad a condiciones de captura: la tecnica rPPG depende de la iluminacion, del movimiento del sujeto y de la camara. Bajo condiciones adversas, la calidad de la estimacion puede degradarse notablemente.
- Posibles sesgos de senal: en rPPG se ha documentado que el tono de piel, la iluminacion y la compresion de video afectan a la relacion senal-ruido de la senal extraida. La model card no aporta ninguna validacion al respecto para este modelo concreto.
- Riesgo de cifras espurias: un modelo de este tipo puede producir una estimacion plausible incluso cuando la senal es insuficiente; conviene incorporar controles de calidad de senal en la aplicacion que lo consuma.
- Dependencia de un artefacto de terceros: los pesos proceden del repositorio de Tsinghua y se han recortado para uso web; conviene verificar la integridad de los ficheros si se despliegan en produccion.
- Licencia: MIT, lo que permite uso comercial y modificacion con atribucion. Es la licencia declarada tanto en este repositorio como en la model card citada.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin historial de mantenimiento ni comunidad que reporte incidencias.
- Idiomas y contexto: no aplicables, pero tampoco existe informacion sobre poblaciones o demografias con las que se haya validado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/RabiatS/me-rppg-web
- Proyecto original ME-rPPG (Kegang Wang, Jiankai Tang y equipo, Universidad de Tsinghua): https://github.com/KegangWangCCNU/ME-rPPG
- Commit de referencia del que se extraen los ficheros: `bec0855162a032832cfb71670c8ca7c79e218cd3`
- Demo en navegador que consume este repositorio: https://www.rabiatsadiq.com/lab/webcam-pulse/
