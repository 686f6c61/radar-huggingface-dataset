# quocb14005xx/67k1-companion-models

## Resumen

`67k1-companion-models` es un repositorio de artefactos de visión por computador publicados por el usuario quocb14005xx (huynhquoc) como dependencia pública de la aplicación 67K1 Companion para el robot Reachy Mini. No se trata de un modelo generativo ni de un LLM, sino de un conjunto empaquetado de cuatro familias de modelos: el detector facial YuNet de OpenCV, el extractor de embeddings faciales SFace de OpenCV, las cascadas Haar de OpenCV para cara y ojos, y un grafo TensorFlow con sus etiquetas para reconocimiento de señales de tráfico vietnamitas. El tamaño total del repositorio es de 0,1 GB y la licencia declarada es Apache-2.0.

El propósito declarado por el autor es la reutilización: centralizar en un único repositorio los pesos que la app descarga o referencia, de forma que terceros puedan emplearlos sin depender del binario de la aplicación. La model card insiste explícitamente en que no se almacenan fotos familiares, embeddings personales, perfiles ni memorias de usuario, y que los embeddings faciales generados por la app permanecen únicamente en el dispositivo del usuario.

Su relevancia es acotada y muy específica: sirve como referencia práctica de despliegue de visión por computador en un robot social de sobremesa, y como ejemplo de empaquetado de modelos de terceros con requisitos de privacidad explícitos. No aporta innovación algorítmica ni resultados de evaluación propios; su valor está en la integración y en la trazabilidad de los artefactos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conjunto heterogéneo: detector facial CNN (OpenCV YuNet), extractor de embeddings faciales CNN (OpenCV SFace), cascadas Haar clásicas (cara y ojos) y red neuronal en grafo TensorFlow para clasificación de señales de tráfico |
| Parámetros totales | No disponible (el autor no publica recuento por artefacto; tamaño total del repositorio: 0,1 GB) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelos de visión, sin ventana de contexto textual) |
| Tipos de cuantización | No disponible (no se documentan variantes cuantizadas ni versiones FP16/INT8 en la model card) |
| Idiomas soportados | No disponible. Los artefactos no procesan texto; las etiquetas del clasificador de señales de tráfico están en vietnamita |
| Licencia | Apache-2.0 (declarada para el repositorio) |
| Formato de pesos | ONNX (YuNet, SFace), XML de cascadas Haar (OpenCV), grafo TensorFlow más fichero de etiquetas (señales de tráfico) |
| Tarea / pipeline | No disponible en HuggingFace; por contenido: detección facial, reconocimiento facial (embeddings), detección de ojos y clasificación de señales de tráfico |
| Tamaño del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-26 |
| Última actualización | 2026-10-26 |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo: agrega pesos ya entrenados por terceros. YuNet es el detector facial basado en CNN que OpenCV distribuye para su módulo DNN, y SFace es el modelo de reconocimiento facial del mismo ecosistema, que produce embeddings de identidad a partir de un recorte de cara. Ambos se publican aquí en formato ONNX, lo que permite ejecutarlos con `onnxruntime` o con `cv2.dnn` sin depender del framework original. Las cascadas Haar son el método clásico de Viola-Jones incluido históricamente en OpenCV para detección de cara y de ojos, y se distribuyen como ficheros XML.

El cuarto componente es un grafo TensorFlow con su fichero de etiquetas para reconocimiento de señales de tráfico vietnamitas, presumiblemente entrenado por el autor o adaptado para su aplicación. La model card no documenta el número de tokens ni de imágenes de entrenamiento, la composición del dataset, ni si hubo ajuste fino, destilación o técnicas de aumento de datos. Tampoco se indica ninguna innovación técnica: no hay decodificación especulativa, atención lineal ni mecanismos híbridos, porque el ámbito es visión por computador y no generación de lenguaje. Cualquier afirmación sobre precisión, recall o dominio de entrenamiento de estos artefactos queda fuera de lo publicado y debe verificarse contra las fuentes originales de OpenCV.

## Capacidades

- Detección de caras en imagen o flujo de vídeo mediante YuNet (ONNX).
- Extracción de embeddings faciales con SFace para comparación de identidad uno a uno o uno a muchos.
- Detección de caras y de ojos con cascadas Haar, útil como respaldo ligero o para estimación aproximada de la zona ocular.
- Reconocimiento de señales de tráfico vietnamitas mediante grafo TensorFlow y fichero de etiquetas.
- Ejecución en CPU sin GPU dedicada, al estar los modelos en ONNX y en formatos ligeros de OpenCV.
- Integración en aplicaciones de robótica social: el repositorio se declara como dependencia de la app 67K1 Companion para Reachy Mini.
- Gestión de privacidad por diseño: los embeddings faciales generados por la aplicación permanecen en el dispositivo del usuario y no se almacenan en el repositorio.
- No soporta generación de texto, tool calling, razonamiento multi-paso, agentes, audio, ni capacidades multilingües de ningún tipo.

## Casos de uso

- Interacción personalizada en robot social: la app de Reachy Mini usa YuNet para detectar la cara del interlocutor y SFace para reconocerlo entre los miembros del hogar, de modo que el robot puede saludar por su nombre y adaptar el diálogo; el cálculo del embedding se hace en local, sin enviar imágenes a un servidor.
- Control de acceso en instalaciones locales: con YuNet para detección y SFace para verificación 1:1 contra una plantilla previamente enrolada, se puede construir un punto de acceso que funcione íntegramente on-premise y sin conexión, adecuado cuando no se permite externalizar datos biométricos.
- Anonimización de vídeo antes de su publicación: detección de caras con YuNet y desenfoque o pixelado de las regiones delimitadas, en un pipeline por lotes que se ejecuta en CPU y que no requiere GPU para volúmenes moderados.
- Preprocesado para modelos mayores: uso de YuNet o de las cascadas Haar como etapa de recorte de caras y ojos antes de pasar el resultado a un modelo de reconocimiento de emociones, estimación de pose o un LLM visual, reduciendo el coste computacional de la etapa siguiente.
- Asistencia a la conducción en prototipos: el grafo TensorFlow de señales vietnamitas permite experimentar con alertas de límite de velocidad o señales de prohibición en maquetas y vehículos de pruebas en Vietnam, integrándolo en un pipeline de captura con OpenCV.
- Demostraciones docentes de visión por computador: el repositorio reúne en 0,1 GB un conjunto coherente de detector, reconocedor y clasificador clásicos, lo que simplifica prácticas de laboratorio sobre detección facial, embeddings y cascadas Haar sin necesidad de descargar cada artefacto por separado.
- Seguimiento de atención en interfaces humano-robot: la detección de ojos con cascadas Haar permite una estimación gruesa de la dirección de la mirada y de la presencia de la persona, suficiente para activar el modo de escucha del robot sin emplear modelos más pesados.
- Verificación de que un rostro es real frente a una foto impresa en flujos de baja criticidad: combinando la detección de YuNet con la coherencia del embedding de SFace entre fotogramas consecutivos, se puede añadir una comprobación básica de presencia continuada, siempre con las cautelas de seguridad indicadas más abajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye métricas de precisión, recall, mAP, tasas de falsos positivos, latencia ni comparaciones con otros detectores. Tampoco se especifica el conjunto de evaluación del clasificador de señales de tráfico ni el número de clases que cubre.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Por la naturaleza de los artefactos (ONNX y cascadas Haar, repositorio de 0,1 GB en total) la inferencia es viable en CPU; no se publican requisitos de memoria ni de VRAM.
- GPU recomendadas: no disponible. No se documenta ningún requisito de GPU; el destino declarado es una aplicación para el robot Reachy Mini, lo que apunta a cómputo de bajo consumo, aunque la model card no confirma la plataforma exacta ni el hardware del robot.
- Cabe en GPU de consumo: con alta probabilidad sí, dado el tamaño de los artefactos, pero no está confirmado en la documentación; no se especifica qué modelos de RTX o equivalentes se han probado.
- Opciones de despliegue: `onnxruntime` o el módulo `cv2.dnn` de OpenCV para YuNet y SFace; `cv2.CascadeClassifier` para las cascadas Haar; TensorFlow o una conversión a TensorFlow Lite para el grafo de señales, si bien la conversión no está documentada por el autor. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelos.
- Latencia y throughput estimados: no disponibles. No se publican tiempos de inferencia, FPS ni números de muestras procesadas por segundo en ninguna plataforma.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 67k1-companion-models (este repositorio) | Paquete de detección facial, embeddings, cascadas Haar y señales de tráfico | No disponible | No aplica | Apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| OpenCV Zoo (YuNet y SFace originales) | Detector facial CNN y extractor de embeddings | No disponible en la información proporcionada | No aplica | No disponible en la información proporcionada | Repositorio oficial de OpenCV |
| MediaPipe Face Detection / Face Mesh (Google) | Detección y malla facial | No disponible en la información proporcionada | No aplica | No disponible en la información proporcionada | Librería pública de Google |
| InsightFace (modelos tipo buffalo) | Detección y reconocimiento facial con embeddings | No disponible en la información proporcionada | No aplica | No disponible en la información proporcionada | Repositorio público |

La comparación cuantitativa no es posible con los datos disponibles: este repositorio no publica métricas ni recuentos de parámetros, y las alternativas citadas no se han evaluado en la misma información. La diferencia funcional principal es que este paquete incluye un clasificador de señales de tráfico vietnamitas que las alternativas genéricas de reconocimiento facial no cubren.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes. Cualquier uso en ese sentido es inviable.
- Ausencia total de evaluación publicada: sin métricas no es posible estimar la precisión real de la detección facial, del reconocimiento ni del clasificador de señales en dominios distintos del previsto.
- Trazabilidad limitada: el repositorio agrega artefactos de OpenCV y un grafo TensorFlow propio, pero no documenta versiones, procedencia exacta ni datasets de entrenamiento. Conviene verificar las licencias de cada artefacto de terceros por separado antes de un uso comercial, aunque el repositorio declare Apache-2.0.
- Riesgo de identificación errónea en reconocimiento facial: los embeddings de SFace pueden producir falsos positivos, especialmente con iluminación adversa, oclusiones o ángulos extremos; no debe usarse como único factor en decisiones de acceso crítico.
- Sesgos no documentados: no se publica información sobre la demografía de los datos de entrenamiento de YuNet ni de SFace, por lo que se desconoce su comportamiento diferencial por tono de piel, edad o género.
- Cascadas Haar: son un método clásico sensible a la iluminación y a la pose, con tasas de falsos positivos notablemente superiores a las de los detectores CNN. Deben tratarse como respaldo, no como detector principal.
- Cobertura geográfica del clasificador de señales: las etiquetas son vietnamitas, por lo que el modelo no es directamente reutilizable en España ni en el resto de la Unión Europea sin reentrenamiento.
- Implicaciones legales: el reconocimiento facial implica tratamiento de datos biométricos. En la UE está sujeto al RGPD y, en el ámbito laboral o en espacios públicos, a restricciones adicionales; el hecho de que los embeddings permanezcan en el dispositivo mitiga el riesgo pero no lo elimina.
- Idiomas: no aplica soporte multilingüe. El único texto presente son las etiquetas del clasificador de señales, en vietnamita.
- Madurez del repositorio: creado y actualizado el mismo día, con 0 descargas y 0 likes, sin pipeline declarado en HuggingFace y sin historial de versiones. No hay garantía de mantenimiento ni de estabilidad de los ficheros.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/quocb14005xx/67k1-companion-models
- Perfil del autor en HuggingFace: https://huggingface.co/quocb14005xx
- Resultados de la búsqueda web no relacionados con el modelo: perfil y modelo 3D en Sketchfab (https://sketchfab.com/quocb14005xx, https://sketchfab.com/3d-models/model-8750c763c1614b88bb1a70487e5c1cd7) y mod de Minecraft en CurseForge (https://www.curseforge.com/minecraft/mc-mods/ai-companion). No se han encontrado papers, blogs, repositorios ni demos adicionales del autor sobre este paquete de modelos.
