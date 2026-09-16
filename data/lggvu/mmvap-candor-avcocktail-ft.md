# lggvu/mmvap-candor-avcocktail-ft

## Resumen

MMVAP (Candor -> AVCocktail, fine-tuned) es un checkpoint de un modelo de predicción de turnos de palabra (*turn-taking*) basado en Voice Activity Projection (VAP) con fusión temprana de audio y vídeo. Lo publica el usuario `lggvu` en HuggingFace y va asociado al repositorio de código `mm-turn-taking`. No se trata de un modelo generativo de lenguaje: es un modelo predictivo orientado a estimar la dinámica de actividad de voz de los interlocutores, una pieza habitual en sistemas de diálogo conversacional, agentes de voz full-duplex y análisis de reuniones.

Según la model card, el modelo se preentrenó sobre el corpus Candor y después se ajustó (*fine-tuning*) sobre el corpus AVCocktail. El checkpoint publicado corresponde a la época 3, con `val/loss = 0.8458`, que el autor identifica como el mejor checkpoint. El repositorio ocupa 0,1 GB y contiene únicamente `hparams.yaml` y `checkpoint.ckpt`.

La relevancia del artefacto es acotada y muy específica: no hay pipeline declarado, no hay métricas publicadas más allá de la pérdida de validación, no se especifica licencia y el modelo acumula 0 descargas y 0 *likes* en el momento de redactar esta ficha. Es, por tanto, un experimento de investigación reproducible a partir del código fuente, no un componente listo para producción sin validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Voice Activity Projection (VAP) con fusion temprana audio-visual; topologia interna de la red no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no es una ventana de tokens, es un modelo predictivo sobre senal de audio y video |
| Tipos de cuantizacion | no disponible; solo se publica el checkpoint en su formato original, sin versiones cuantizadas |
| Idiomas soportados | no disponible |
| Licencia | unknown (licencia no especificada en la model card ni en los metadatos de HuggingFace) |
| Formato de pesos | checkpoint de PyTorch Lightning (`.ckpt`) acompanado de `hparams.yaml` |
| Tamano del repositorio | 0,1 GB |
| Epoca del checkpoint | 3 (mejor checkpoint) |
| Perdida de validacion | 0,8458 |
| Pipeline declarado en HuggingFace | no disponible |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 16 de septiembre de 2026 (segun metadatos) |

## Arquitectura y entrenamiento

La model card describe el artefacto como un modelo de *turn-taking* basado en Voice Activity Projection con fusión temprana de audio y vídeo ("audio-visual early-fusion"). La VAP es una formulación predictiva: en lugar de transcribir o generar texto, el modelo representa la actividad de voz de los participantes y proyecta su evolución futura, de modo que la probabilidad de continuación, cambio o solapamiento de turno se deriva de esa proyección. La adopción de fusión temprana implica que las modalidades de audio y vídeo se combinan en etapas iniciales del cómputo, y no mediante agregación tardía de decisiones independientes.

El entrenamiento se ejecutó en dos fases: preentrenamiento sobre el corpus Candor y ajuste fino posterior sobre el corpus AVCocktail. El autor reporta `val/loss = 0.8458` en la época 3, que marca como mejor checkpoint. No se especifican en la información disponible el número de tokens de audio procesados, la composición detallada de los corpus, el tamaño del conjunto de validación, la función de pérdida concreta, si se aplicaron técnicas de RLHF o DPO (poco probables en este tipo de modelo predictivo), ni innovaciones adicionales como decodificación especulativa o atención lineal. Tampoco se detalla el número de parámetros, la dimensión de las capas ni la resolución temporal de la predicción.

## Capacidades

Debe subrayarse que las capacidades que se enumeran a continuación se derivan del propósito declarado del modelo (VAP para *turn-taking* audiovisual) y no de una evaluación publicada de este checkpoint concreto:

- Predicción de turnos de palabra a partir de señal de audio y vídeo, con fusión temprana de ambas modalidades.
- Proyección de la actividad de voz futura de los interlocutores, base para decidir si un turno continúa, cambia o se solapa.
- Procesamiento conjunto de audio y vídeo, lo que permite incorporar indicios visuales además de los acústicos.
- Ajuste específico al dominio conversacional representado por el corpus AVCocktail, tras un preentrenamiento sobre Candor.
- Generación de texto: no disponible, el modelo no es generativo de lenguaje.
- Razonamiento, código, matemáticas: no disponible, fuera del alcance del modelo.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad nativa; podría actuar como módulo de señal de turno dentro de un agente mayor.
- Capacidades multilingües: no disponible, no se documenta el idioma ni la cobertura de los corpus.
- Capacidades especiales (modo *thinking*, visión, audio): audio y vídeo sí, según la descripción; visión en el sentido de comprensión semántica de imágenes, no documentada.

## Casos de uso

- Gestión de turnos en agentes de voz full-duplex: el modelo puede actuar como módulo que decide cuándo el agente debe tomar la palabra o cederla, a partir de la proyección de actividad de voz del usuario, reduciendo cortes y silencios incómodos en interfaces conversacionales en tiempo real.
- Análisis de reuniones y diarización enriquecida: aplicado a la pista de audio y vídeo de una reunión, permite marcar límites de turno, solapamientos e interrupciones para posteriores analíticas de participación o generación de actas.
- Robots sociales y avatares conversacionales: al incorporar señal visual, el modelo puede alimentar la política de turno de un robot que debe reaccionar a indicios faciales y prosódicos del interlocutor humano.
- Traducción simultánea de baja latencia: la predicción anticipada de final de turno permite segmentar el habla de entrada con menos espera, mejorando la latencia percibida en sistemas de interpretación automática.
- Telepresencia y videollamadas con moderación automática: detección de solapamientos sistemáticos o de participantes que no consiguen tomar la palabra, útil para herramientas de accesibilidad y equidad en reuniones.
- Analítica de contact center: estimación automática de turnos agente-cliente para medir interrupciones, tiempos de respuesta y calidad de la interacción sin depender exclusivamente de transcripción.
- Investigación en interacción conversacional: banco de pruebas reproducible (código en `mm-turn-taking` más checkpoint) para comparar variantes de fusión audio-visual en tareas de *turn-taking*.
- Sistemas de subtitulado y transcripción con segmentación consciente del hablante: uso del límite de turno predicho para mejorar la puntuación y el reparto de intervenciones antes de la fase de ASR.

En todos los casos, la idoneidad productiva no está respaldada por métricas publicadas de este checkpoint, por lo que requeriría evaluación propia en el dominio objetivo.

## Benchmarks y rendimiento

La información disponible solo incluye la pérdida de validación del mejor checkpoint:

| Metrica | Valor | Contexto |
|---|---|---|
| val/loss (epoca 3) | 0,8458 | Mejor checkpoint segun la model card |

No se han publicado resultados de benchmarks en la informacion disponible (no hay cifras de MMLU, HumanEval, GSM8K ni de metricas propias de turn-taking como precision de cambio de turno, latencia de prediccion o F1 sobre limites de turno). Tampoco se ofrece comparacion con lineas base de la literatura VAP.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Como referencia, el repositorio completo ocupa 0,1 GB, por lo que los pesos del modelo son necesariamente inferiores a esa cifra; un checkpoint de ese tamano es compatible con GPUs de consumo, e incluso con inferencia en CPU, aunque esto es una estimacion derivada del tamano del repositorio y no un dato publicado.
- GPU recomendadas: no disponible. Por el tamano indicado, cualquier GPU con unos pocos GB de VRAM deberia ser suficiente; no se justifica el uso de A100 o H100 salvo por procesamiento por lotes a gran escala.
- Cabe en GPU de consumo: si, segun la estimacion anterior a partir del tamano del repositorio; no se especifica el modelo concreto de GPU.
- Opciones de despliegue: el checkpoint es un `.ckpt` de PyTorch Lightning y debe cargarse con el codigo de `https://github.com/lggvu/mm-turn-taking`. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que son herramientas para modelos de lenguaje generativos.
- Latencia y throughput estimados: no disponible. Al ser un modelo orientado a *turn-taking*, la latencia es un factor critico, pero no se publican mediciones.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento de terceros, y la busqueda web realizada no devolvio resultados relevantes sobre modelos de Voice Activity Projection. No es posible, por tanto, comparar parametros, contexto, rendimiento, licencia ni disponibilidad frente a alternativas de la misma categoria sin introducir datos no verificados.

## Limitaciones y advertencias

- Licencia no especificada (`unknown`): no hay autorizacion explicita de uso comercial ni condiciones de redistribucion. Cualquier uso en produccion requiere aclarar la licencia con el autor.
- Ausencia total de evaluacion publicada: la unica metrica disponible es la perdida de validacion (0,8458), que no permite inferir calidad en tareas reales ni comparabilidad con otras propuestas.
- Riesgo de sobreajuste a dominio: al estar preentrenado en Candor y ajustado en AVCocktail, el comportamiento fuera de esos dominios conversacionales es desconocido.
- Idioma y composicion de los corpus no documentados: se desconoce la cobertura linguistica y si el modelo generaliza a otras lenguas o acentos.
- Dependencia de la modalidad visual: la fusion temprana asume disponibilidad de video sincronizado con audio; en escenarios solo-audio se desconoce el comportamiento.
- Riesgo de error en la prediccion de turno: un fallo del modelo puede traducirse en interrupciones o silencios prolongados en un agente conversacional, con impacto directo en la experiencia de usuario.
- Sesgos: no disponibles. No se documenta ningun analisis de sesgos por genero, edad, acento o condicion del hablante, un aspecto especialmente sensible en modelos que procesan voz y rostro.
- Repositorio sin traccion: 0 descargas y 0 *likes*, sin senales de validacion por parte de la comunidad.
- Metadatos incompletos en HuggingFace: sin pipeline declarado, sin idiomas y sin licencia, lo que complica la trazabilidad y el cumplimiento.
- Fecha de publicacion en metadatos (16 de septiembre de 2026): conviene verificar su coherencia con el estado real del repositorio antes de citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lggvu/mmvap-candor-avcocktail-ft
- Codigo fuente (`mm-turn-taking`): https://github.com/lggvu/mm-turn-taking
- Resultados de la busqueda web: no se encontraron enlaces relevantes; los resultados devueltos correspondian a servicios de traduccion (Google Translate y DeepL) sin relacion con el modelo.
