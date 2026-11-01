# mindsoulBCI/mindsoul-motor-imagery

## Resumen

MindSoul Neural AI · Motor Imagery es un modelo anunciado por mindsoulBCI (Chengdu (Shanghai) Naoyun Matrix Technology Co., Ltd., equipo MindSoul) orientado al analisis de senales EEG en experimentos de imaginacion motora. Segun su model card, se plantea como un transformer para identificar clases de intencion motora definidas por la tarea, aunque en el momento de la publicacion no se han liberado pesos, codigo de entrenamiento ni resultados de evaluacion. El repositorio existe en HuggingFace pero esta marcado como "coming soon".

La relevancia del proyecto es potencial: la decodificacion de imaginacion motora mediante EEG es una de las aplicaciones clasicas de las interfaces cerebro-computador (BCI) no invasivas, y el uso de arquitecturas transformer sobre series temporales EEG es una linea de investigacion activa. Sin embargo, a dia de hoy la ficha solo puede describir la intencion declarada por el autor, no un artefacto funcional verificable.

El modelo declara soporte de chino e ingles, licencia propietaria de investigacion personal no comercial y etiquetas de eeg, bci, neural-ai y research. No hay informacion sobre arquitectura concreta, numero de parametros, longitud de contexto ni formato de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (planificada, no publicada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | zh, en |
| Licencia | mindsoul-personal-research (other, solo investigacion personal no comercial) |
| Formato de pesos | no disponible (pesos no liberados) |

## Arquitectura y entrenamiento

La model card indica que se planea una arquitectura basada en Transformer para extraer caracteristicas espacio-temporales de EEG en experimentos de imaginacion motora. No se especifican numero de capas, dimensiones, mecanismo de atencion, tokenizacion de la senal EEG ni estrategia de preprocesado. Tampoco se detalla el paradigma experimental (por ejemplo, si se trata de imaginacion de mano izquierda/derecha u otras clases), el numero de sujetos, la division por sujeto (subject-wise split) ni la estrategia de validacion cruzada entre sujetos.

En cuanto a entrenamiento, no se han publicado datos sobre volumen de senal, composicion del dataset, tecnicas de aumento de datos, regularizacion, ni si se emplea aprendizaje supervisado clasico o alguna forma de ajuste fino con retroalimentacion. El autor menciona explicitamente que la estructura del modelo, los pesos, el codigo de entrenamiento y los resultados de evaluacion se documentaran con la version oficial.

## Capacidades

- Clasificacion de intencion motora a partir de EEG: capacidad declarada como objetivo del modelo, pendiente de confirmacion con la version publicada.
- Procesamiento de senales electroencefalograficas con posible modelado espacio-temporal (declarado, no verificado).
- Soporte declarado de los idiomas chino e ingles en la documentacion y etiquetas del repositorio.
- No se declara soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.
- No se declara generacion de texto libre ni capacidades de chat.

## Casos de uso

- Investigacion en decodificacion de imaginacion motora: el modelo se plantea como base para clasificar clases de intencion motora en experimentos controlados de EEG; su utilidad dependera de que se publiquen pesos y protocolo reproducible.
- Reproduccion de experimentos BCI academicos: una vez liberado, permitiria a grupos de investigacion comparar resultados frente a lineas base clasicas (CSP + LDA, EEGNet, etc.) en el mismo paradigma.
- Desarrollo de prototipos de interfaz cerebro-computador no invasiva: en un contexto de laboratorio, podria integrarse en pipelines de adquisicion y clasificacion en tiempo casi real, siempre que la latencia y el preprocesado esten documentados.
- Analisis offline de registros EEG historicos: aplicable a la exploracion de caracteristicas espacio-temporales en datasets ya recogidos, sujeto a la disponibilidad de pesos y a la compatibilidad de formatos.
- Educacion y divulgacion en neurotecnologia: el repositorio y sus espacios asociados pueden servir como material de referencia sobre el estado de un proyecto BCI basado en transformer.
- Evaluacion metodologica de modelos transformer en senales biomedicas: util para estudiar la transferibilidad entre sujetos y el impacto del preprocesado en el rendimiento de arquitecturas de atencion.
- No se recomienda su uso en aplicaciones clinicas, diagnostico ni tratamiento, tal como advierte el propio autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los resultados de evaluacion, las lineas base, los errores y los casos de fallo se publicaran con la version oficial. El enlace al espacio de benchmark (https://huggingface.co/spaces/mindsoulBCI/benchmark) figura como "proximamente".

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al no conocerse el tamano del modelo ni el formato de pesos.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; al tratarse de un modelo de senales EEG, es probable que requiera un runtime especifico, pero no se ha documentado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mindsoulBCI/mindsoul-motor-imagery | Transformer EEG (planificado) | no disponible | no disponible | mindsoul-personal-research | Pesos no liberados |
| Alternativas BCI/EEG de referencia | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables para establecer una comparativa cuantitativa con modelos de la misma categoria.

## Limitaciones y advertencias

- El modelo no esta disponible: no hay pesos, codigo de entrenamiento ni resultados de evaluacion publicados; el repositorio esta marcado como "coming soon".
- La arquitectura, el paradigma experimental y las clases soportadas son declaraciones de intencion, no especificaciones verificadas.
- Licencia restrictiva: solo se permite investigacion personal no comercial; cualquier otro uso requiere autorizacion expresa del equipo.
- Advertencia explicita del autor: el proyecto no esta destinado a diagnostico ni tratamiento medico.
- Riesgo de sobreinterpretacion: los resultados en EEG dependen fuertemente del preprocesado, del sujeto y del paradigma; sin documentacion no es posible evaluar la generalizacion entre sujetos.
- Idiomas declarados limitados a chino e ingles en la documentacion; no se especifica el comportamiento en otros idiomas.
- Ausencia de datos sobre sesgos, alucinacion o robustez, dado que no se ha publicado informacion tecnica.
- Los datos EEG son especialmente sensibles; el autor indica que solo se publicaran tras desidentificacion y verificacion de autorizacion de comparticion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mindsoulBCI/mindsoul-motor-imagery
- Espacio de benchmark (proximamente): https://huggingface.co/spaces/mindsoulBCI/benchmark
- Repositorio GitHub del proyecto: https://github.com/pm-kevin-zhang/MindSoul
- Repositorio GitHub de aplicaciones y materiales: https://github.com/pm-kevin-zhang/MindSoul-Spatial
- Sitio web oficial: https://MindSoul.cn
- Licencia: https://huggingface.co/mindsoulBCI/mindsoul-motor-imagery/blob/main/LICENSE
