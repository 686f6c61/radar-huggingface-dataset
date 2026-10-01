# rehan-fal/minimax-h3-360-equirect-lora

## Resumen

`rehan-fal/minimax-h3-360-equirect-lora` es un adaptador LoRA (PEFT) entrenado sobre MiniMax H3, el modelo de generación de vídeo con audio nativo de MiniMax. Su función concreta es forzar la salida del modelo base a geometría equirectangular de 360 grados: toda la esfera que rodea al espectador desplegada en un único fotograma, con el frente en el centro y la parte trasera repartida entre los bordes izquierdo y derecho, que deben coincidir sin costura. No es un modelo autónomo, sino un ajuste de bajo rango que se aplica sobre los pesos de MiniMax H3 en tiempo de inferencia.

El adaptador resuelve un problema muy específico de producción de vídeo inmersivo: el modelo base genera planos anchos convencionales en 21:9, pero no entiende de panorámicas esféricas. Con la palabra clave `eqr360` y una frase de disposición espacial en el prompt, el LoRA produce horizonte curvado, polos estirados y bordes que empalman, con el audio nativo de H3. El resultado se reescala a 2:1 exacto y se etiqueta como esférico (Spherical V2) para reproducirse en Quest, DeoVR, Skybox o YouTube 360.

Es relevante para equipos que ya trabajan con MiniMax H3 y quieren añadir una línea de contenido VR sin cambiar de pipeline: el repositorio pesa 0,5 GB, se carga como LoRA sobre el modelo base y está publicado con la licencia comunitaria de MiniMax. La model card documenta además métricas de geometría (correlación de costura y dispersión polar) y cuatro muestras en 4K listas para visor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre MiniMax H3; arquitectura del modelo base no disponible |
| Parametros totales | no disponible (adaptador LoRA; repositorio de 0,5 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (modelo de generacion de video); duracion de clip documentada de 5 a 15 s |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la model card solo incluye prompts de ejemplo en ingles) |
| Licencia | minimax-community-license (licencia del modelo base; en HuggingFace figura como license: other) |
| Formato de pesos | safetensors (adaptador LoRA en formato PEFT) |
| Modelo base | MiniMaxAI/MiniMax-H3 |
| Palabra de activacion | `eqr360` |
| Escala recomendada | 0,75 (1,0 tambien funciona) |
| Relacion de aspecto de entrada | 21:9, reescalada a 2:1 para equirectangular |
| Resoluciones documentadas | 768P (previsualizacion), 2K (2912x1280), 4K (4368x1920 de salida; 4096x2048 empaquetado) |
| Descargas / likes | 0 descargas, 13 likes |
| Fecha de creacion / actualizacion | 2026-09-29 / 2026-09-30 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango bajo (librería `peft`) que se inyecta sobre MiniMax H3, un modelo de texto a vídeo con generación de audio nativo. La model card no detalla el número de capas adaptadas, el rango, el alpha ni la composición exacta del dataset de entrenamiento; el apartado "Measured geometry" menciona que las métricas se promedian sobre 6 prompts x 6 fotogramas por clip, lo que sugiere un conjunto de validación de escenas panorámicas, pero no se especifica el volumen de datos ni si hubo anotación manual de captions.

La innovación técnica no está en el adaptador en sí, sino en el comportamiento que induce: geometría equirectangular con horizonte recto en el centro del fotograma, polos estirados y bordes izquierdo y derecho coincidentes. La propia model card advierte de una limitación estructural del modelo base: MiniMax H3 no tiene atención de envolvente (wrap-around), por lo que los dos bordes pueden discrepar ligeramente; para mitigarlo, el empaquetador del repositorio suaviza la costura trasera y puede recortar un render largo y convertirlo en bucle mediante un crossfade del primer segundo bajo el final. El prompt de entrenamiento seguía siempre la estructura: palabra clave `eqr360`, frase de disposición espacial y descripción de la escena.

## Capacidades

- Generación de vídeo 360 en proyección equirectangular, con la esfera completa desplegada en un solo fotograma.
- Audio nativo heredado de MiniMax H3, sincronizado con la escena descrita (por ejemplo, sonido de arroyo, lluvia o quemador de globo).
- Coherencia espacial direccional: el prompt puede describir qué hay delante, a los lados, detrás y sobre el espectador, y el modelo lo coloca en la posición correspondiente del fotograma.
- Empalme de bordes izquierdo y derecho para que la panorámica cierre sin corte visible.
- Generación de clips de 5 a 15 segundos manteniendo la geometría esférica.
- Previsualización rápida en 768P, con escalado posterior a 2K y 4K.
- Integración documentada con la API de fal mediante el endpoint de LoRA para texto a vídeo.
- No dispone de tool calling, function calling, capacidades de agente ni razonamiento multi-paso: es un modelo generativo de vídeo, no un modelo de lenguaje conversacional.

## Casos de uso

- Producción de contenido VR para visores: el LoRA genera la panorámica completa en un fotograma; tras reescalar a 4096x2048 y aplicar metadatos Spherical V2, el clip se reproduce como esfera navegable en Quest, DeoVR, Skybox o YouTube 360. Es el flujo principal documentado en la model card.
- Previsualización de escenarios inmobiliarios o turísticos: describir una estancia o un paraje con la sintaxis de cuatro direcciones permite obtener un borrador esférico del espacio antes de rodar o modelar en 3D, a unos 11 píxeles por grado en 4K.
- Fondos envolventes para vídeo de efectos o chroma: la salida equirectangular sirve como placa de fondo esférica sobre la que componer elementos en postproducción, con audio de ambiente incorporado.
- Contenido inmersivo para museos, ferias y experiencias de divulgación: clips de 5 a 7,5 segundos, que son los que mejor conservan la costura, se pueden encadenar en bucle para instalaciones con reproductores que repiten clips cortos.
- Turismo y destinos en vídeo 360 para redes y webs: las muestras incluyen arrecife de coral, callejón de Tokio, Capadocia al amanecer y auroras en Laponia, escenas típicas de promoción de destinos que se benefician del formato esférico.
- Pruebas de concepto de dirección de arte: comparar con la misma semilla el modelo base (plano ancho convencional) y el LoRA permite decidir si una idea funciona mejor en 360 antes de invertir tiempo de render en 4K.
- Generación de material de referencia para audio binaural o espacial: el audio nativo por escena facilita prototipos de experiencias sonoras envolventes sin grabar en localización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, algo esperable al tratarse de un modelo de generación de vídeo. La model card sí aporta métricas de geometría propias, medidas sobre 6 prompts x 6 fotogramas por clip y comparando el LoRA con una alternativa en la misma prueba de semilla:

| Metrica | Este LoRA (escala 0,75) | Version alternativa (A) | Modelo base |
|---|---|---|---|
| Correlacion de costura | 0,96 | 0,92 | no disponible |
| Dispersion polar | 0,23 | 0,30 | no disponible |
| Geometria equirectangular real | Si (horizonte curvado, polos estirados, bordes que empalman) | Si | No (plano ancho convencional) |

A escala 1,0 los valores de costura y polos son ligeramente peores que a 0,75, sin pérdida visible de detalle según el autor. Los tiempos y costes documentados son: 10 segundos en 4K en aproximadamente 4 a 9 minutos y 2,00 dólares; 768P en torno a un minuto para previsualización. 2K y 4K se generan escalando la pasada de 768P, por lo que una previsualización con la misma semilla y duración anticipa la escena final.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La model card no publica requisitos de memoria ni del modelo base ni del adaptador.
- GPU recomendadas: no disponible. El flujo documentado es en la nube, a través de la API de fal, no en local.
- Compatibilidad con GPU de consumo: no disponible; no se documenta ninguna ejecución local en RTX u otras tarjetas de consumo.
- Peso en disco del adaptador: 0,5 GB (repositorio completo).
- Opciones de despliegue documentadas: API de fal, endpoint `POST https://queue.fal.run/minimax/h3/text-to-video/lora`, pasando la URL directa del archivo safetensors en el campo `loras` con `scale` 0,75.
- Aviso de integración relevante: según las pruebas del autor (2026-09-29), en fal la forma repo-id carga los pesos de manera distinta y con la misma semilla produce un vídeo diferente; solo la URL directa del archivo reproduce exactamente la salida del archivo entrenado.
- Latencia y throughput: 10 segundos de vídeo en 4K tardan aproximadamente 4 a 9 minutos y cuestan 2,00 dólares; 768P ronda un minuto.
- Postprocesado necesario: reescalado con ffmpeg a 4096x2048 (4K) o 2912x1456 (2K) y etiquetado con `spatialmedia` en modo Spherical V2 mono para obtener el archivo reproducible en visor.

## Comparativa con modelos similares

| Modelo | Tipo | Salida | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| rehan-fal/minimax-h3-360-equirect-lora | LoRA sobre MiniMax H3 | Video 360 equirectangular con audio | minimax-community-license | HuggingFace, API de fal | Escala recomendada 0,75; 4K documentado; muestras y metricas de geometria publicadas |
| rehan-fal/minimax-h3-vr180-sbs-lora | LoRA sobre MiniMax H3 | Video VR180 estereoscopico lado a lado | no disponible | HuggingFace | Mismo autor y modelo base; formato estereo de 180 grados en lugar de esfera completa |
| MiniMaxAI/MiniMax-H3 (base) | Modelo texto a video con audio | Plano ancho convencional (21:9) | minimax-community-license | HuggingFace, GitHub, fal | Sin geometria esferica; sirve de referencia de comparacion del mismo autor |

## Limitaciones y advertencias

- El modelo base no tiene atención de envolvente, por lo que los bordes izquierdo y derecho del fotograma pueden discrepar ligeramente; el suavizado de costura se aplica en el empaquetado, no en la generación.
- La calidad de la costura varía a lo largo de un clip largo. Para el resultado más limpio, el autor recomienda conservar solo los primeros 7,5 segundos de un render de 10 segundos.
- En algunos planos, los renders largos tienden a oscurecerse en los últimos 3 segundos aproximadamente.
- La ventana de duración validada es de 5 a 15 segundos, con la costura más ajustada a 5 segundos; no hay datos sobre clips más largos.
- Un visor de 360 reparte los píxeles de forma muy dispersa: a 4K empaquetado en 4096x2048 se obtienen unos 11 píxeles por grado, de modo que reducir resolución degrada notablemente la percepción.
- Los archivos de 2K y 4K se generan escalando una pasada previa de 768P, no con un render nativo a esa resolución.
- No se declaran idiomas soportados ni sesgos conocidos; la ausencia de datos multilingües dificulta evaluar el comportamiento con prompts en castellano.
- Riesgo de alucinación visual y de audio: al ser un modelo generativo, puede inventar elementos de escena o sonidos no descritos en el prompt.
- Uso comercial sujeto a la licencia comunitaria de MiniMax, cuyo texto enlazado en la model card hay que revisar antes de desplegar en producción; en HuggingFace la licencia figura como `other`.
- El repositorio registra 0 descargas, por lo que la validación por terceros es escasa y las métricas publicadas proceden del propio autor.
- Cualquier despliegue depende del modelo base MiniMax H3 y, en la práctica documentada, de la API de fal, lo que añade dependencia de un proveedor externo y coste por generación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rehan-fal/minimax-h3-360-equirect-lora
- Modelo base MiniMax H3 en HuggingFace: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia del modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Repositorio GitHub de MiniMax H3: https://github.com/MiniMax-AI/MiniMax-H3
- Documentación de la API de LoRA texto a vídeo en fal: https://fal.ai/models/minimax/h3/text-to-video/lora/api
- Documentación de la API de LoRA imagen a vídeo en fal: https://fal.ai/models/minimax/h3/image-to-video/lora/api
- LoRA VR180 estereoscópico del mismo autor: https://huggingface.co/rehan-fal/minimax-h3-vr180-sbs-lora
- Directorio de LoRAs de MiniMax H3: https://minimax3.org/minimax-h3-lora
