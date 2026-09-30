# sases345/Recnonocimiento_de_emociones

## Resumen

`sases345/Recnonocimiento_de_emociones` es un Space de Hugging Face publicado por el usuario `sases345`, creado y actualizado el 30 de septiembre de 2026. No es un modelo con pesos propios, sino una aplicación de Gradio (SDK 4.44.0, `app_file: app.py`) titulada "Guardianes de Meztli - Analizador de Emociones", asociada a un taller tactil del programa NASA SEEC 2027. Su funcion es analizar la respuesta emocional de un estudiante ante estimulos tactiles concretos (regolito lunar, regolito marciano, arena caliente o fria) a partir de un video corto del rostro.

El sistema no entrena ningun modelo: orquesta un pipeline clasico de vision por computador. Detecta el rostro en aproximadamente un fotograma por segundo, hasta un maximo de 60 fotogramas, y clasifica la emocion con el modelo de terceros `trpakov/vit-face-expression`, un clasificador basado en Vision Transformer (ViT). La salida incluye una linea de tiempo emocional, un informe interpretativo y los datos crudos en JSON.

Su relevancia es limitada y fundamentalmente divulgativa o educativa: se trata de una demo de investigacion aplicada dentro de un taller, sin licencia declarada, sin resultados de benchmarks publicados y con cero descargas y cero likes en el momento de la consulta. No debe confundirse con un modelo de reconocimiento de emociones reutilizable para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Tipo de artefacto | Space de Gradio (aplicacion), no un modelo con pesos propios |
| Modelo subyacente | `trpakov/vit-face-expression` |
| Arquitectura | pipeline de vision: deteccion de rostro + clasificador tipo ViT |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; procesa hasta 60 fotogramas por video, a ~1 fotograma por segundo |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la interfaz esta en castellano; la clasificacion es visual, no linguistica) |
| Licencia | no disponible |
| Formato de pesos | no disponible (la app consume pesos de terceros alojados en Hugging Face) |
| Entrada | video corto con el rostro visible, mas seleccion manual de estimulo y temperatura |
| Salida | linea de tiempo emocional, informe interpretativo y JSON crudo |
| Runtime | GPU si el Space dispone de una; en caso contrario, CPU |
| SDK | Gradio 4.44.0 |
| Fecha de creacion | 2026-09-30 |
| Ultima actualizacion | 2026-09-30 |

## Arquitectura y entrenamiento

El Space no define ni entrena una arquitectura propia. Es una capa de orquestacion escrita en Python sobre Gradio que encadena dos etapas: deteccion de rostro sobre fotogramas muestreados del video de entrada y clasificacion de la expresion facial con `trpakov/vit-face-expression`. El muestreo se fija en torno a un fotograma por segundo, con un tope de 60 fotogramas por video, lo que acota el coste de inferencia de forma explicita.

No hay informacion sobre el numero de tokens ni sobre la composicion del dataset de entrenamiento, porque no se entrena ningun modelo en este repositorio. Tampoco se documentan tecnicas de ajuste fino, RLHF o DPO. La unica innovacion reseñable es operativa: cuando no se detecta rostro en un fotograma, este se omite y el sistema informa del numero total de fotogramas descartados, lo que sirve como diagnostico de encuadre e iluminacion. Cabe señalar que el nombre del repositorio contiene una errata ("Recnonocimiento"), lo que no facilita su descubrimiento.

## Capacidades

- Analisis de video corto con muestreo a ~1 fotograma por segundo y limite de 60 fotogramas.
- Deteccion de rostro por fotograma, con omision y contabilizacion de los fotogramas sin cara detectable.
- Clasificacion de expresion facial en categorias de emocion mediante `trpakov/vit-face-expression` (las clases concretas no se detallan en la informacion disponible).
- Generacion de una linea de tiempo emocional a lo largo del video.
- Generacion de un informe interpretativo en lenguaje natural a partir de la secuencia de emociones detectadas.
- Exportacion de los resultados crudos en formato JSON para analisis posterior.
- Parametrizacion manual del contexto experimental: estimulo (regolito lunar, regolito marciano, arena caliente o fria) y temperatura.
- Ejecucion con aceleracion por GPU cuando esta disponible y degradacion a CPU en caso contrario.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, texto generativo, codigo, matematicas, audio ni vision general mas alla de la cara.

## Casos de uso

- Investigacion educativa en talleres cientificos: registrar la reaccion emocional de estudiantes ante materiales analogos a regolito lunar o marciano, generando datos estructurados en JSON para analisis estadistico posterior.
- Estudio comparativo de estimulos: contrastar las lineas de tiempo emocionales entre condiciones (regolito lunar frente a marciano, o arena caliente frente a fria) manteniendo constante el resto del protocolo.
- Analisis de aceptacion de materiales en divulgacion cientifica: evaluar si un publico percibe un material como desagradable, sorprendente o neutro antes de escalar una exposicion o un taller.
- Docencia de vision por computador: usar el propio Space como ejemplo didactico de pipeline completo (entrada de video, deteccion de rostro, clasificacion, informe y JSON) en asignaturas de IA aplicada.
- Prototipado rapido de interfaces Gradio: servir de plantilla reutilizable para construir demos que combinan un modelo de Hugging Face con una interfaz web y salida estructurada.
- Validacion de protocolos de captura: gracias al contador de fotogramas omitidos, permite diagnosticar problemas de encuadre, iluminacion o distancia en la grabacion antes de repetir un experimento.
- Documentacion cualitativa de sesiones: generar un informe legible que acompañe al video original en un cuaderno de laboratorio o en un anexo de memoria de proyecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del Space no incluye metricas de exactitud, F1, precision por clase, ni comparaciones con otros clasificadores de expresion facial. La unica metrica operativa que el sistema reporta es el numero de fotogramas omitidos por falta de deteccion de rostro.

## Requisitos de hardware

Las siguientes cifras son estimaciones de ingenieria derivadas de la descripcion de la app (clasificador tipo ViT sobre fotogramas sueltos a ~1 fps), no mediciones publicadas por el autor:

- VRAM estimada: en torno a 1-2 GB en precision fp16 para el clasificador y el detector de rostro; cabe holgadamente en cualquier GPU con 4 GB o mas.
- GPU recomendadas: cualquier GPU moderna con 8 GB o mas (RTX 3060, RTX 4060, RTX 4090, L4, T4, A10G). Una T4 o L4 es suficiente para el volumen de inferencia descrito.
- GPU de gama alta (A100, H100): no aportan ventaja apreciable, porque la carga es de decenas de fotogramas por video, no de un lote masivo.
- Inferencia en CPU: soportada explicitamente por el autor. Es funcional pero mas lenta; al procesar como maximo 60 fotogramas por video, la latencia total sigue siendo asumible.
- Despliegue: el artefacto esta atado a Gradio y al entorno de Hugging Face Spaces. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un modelo de vision de este tipo.
- Latencia y throughput: no disponibles. Dependen del detector de rostro, del muestreo a 1 fps y del tiempo por fotograma del clasificador, ninguno de los cuales se cuantifica en la documentacion.
- Almacenamiento: minimo, ya que los pesos se descargan del Hub y el video de entrada es la unica carga relevante.

## Comparativa con modelos similares

| Sistema | Tipo | Parametros | Entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este Space (`sases345/Recnonocimiento_de_emociones`) | Aplicacion Gradio sobre modelo de terceros | no disponible | Video corto (hasta 60 fotogramas) | no disponible | no disponible | Space publico, 0 descargas, 0 likes |
| `trpakov/vit-face-expression` | Modelo de clasificacion de expresion facial | no disponible | Imagen de rostro | no disponible | no disponible | Modelo publico en Hugging Face |
| `pescobarg/reconocimiento-emociones` | Repositorio con 3 modelos de IA | no disponible | no disponible | no disponible | no disponible | Repositorio publico en GitHub |
| Herramientas comerciales de IA emocional (recopiladas en aimultiple.com) | Productos SaaS y APIs | no disponible | Texto, voz o imagen segun herramienta | no disponible | Propietaria | Comercial, con planes de pago |

No se dispone de datos cuantitativos que permitan una comparacion rigurosa de exactitud, latencia o cobertura idiomatica entre estas opciones.

## Limitaciones y advertencias

- Ausencia de licencia declarada: sin una licencia explicita, no hay autorizacion clara para uso comercial ni para redistribucion. Tratelo como no apto para produccion hasta que el autor la defina.
- Dependencia de un modelo de terceros: `trpakov/vit-face-expression` puede cambiar, retirarse o modificar su licencia sin aviso, lo que romperia la aplicacion.
- Datos biometricos y menores de edad: si el video es de estudiantes, se estan tratando imagenes faciales, categorias especiales de datos segun el RGPD. Requiere base juridica, consentimiento informado y evaluacion de impacto, ademas de plazos de conservacion definidos.
- Validez cientifica del reconocimiento de emociones: inferir estados emocionales a partir de expresiones faciales es metodologicamente discutido; la correspondencia entre expresion y emocion interna no es univoca y varia por cultura, contexto y persona.
- Muestreo agresivo: analizar solo ~1 fotograma por segundo puede perder microexpresiones y picos emocionales breves, sesgando la linea de tiempo.
- Sensibilidad a las condiciones de captura: encuadre, iluminacion y resolucion determinan cuantos fotogramas se descartan. El propio autor reconoce que es necesario diagnosticar estos fallos mediante el contador de omisiones.
- Riesgo de alucinacion interpretativa: el informe en lenguaje natural se genera a partir de una secuencia de etiquetas; puede presentar conclusiones mas rotundas de lo que los datos permiten.
- Cero senales de adopcion: 0 descargas y 0 likes, sin pipeline declarado, sin idiomas declarados y sin fecha de mantenimiento posterior al dia de creacion. No hay comunidad que haya validado el comportamiento en produccion.
- Reproducibilidad limitada: no se documentan versiones de dependencias, semillas, umbrales de deteccion ni la version concreta del modelo subyacente utilizada.
- Nombre del repositorio con errata ("Recnonocimiento"), lo que dificulta la busqueda y favorece confundirlo con otros proyectos.

## Enlaces

- Space en Hugging Face: https://huggingface.co/sases345/Recnonocimiento_de_emociones
- Modelo subyacente: https://huggingface.co/trpakov/vit-face-expression
- Repositorio GitHub de reconocimiento de emociones con 3 modelos: https://github.com/pescobarg/reconocimiento-emociones
- Recopilacion de herramientas de IA emocional: https://aimultiple.com/es/emotion-ai-tools
- Glosario sobre reconocimiento de emociones: https://aidive.org/es/glossary/natural-language-processing/emotion-recognition
- Informe sobre analisis de emociones con IA: https://es.scribd.com/document/836509181/Informe-2-Analisis-de-Emociones-con-IA
