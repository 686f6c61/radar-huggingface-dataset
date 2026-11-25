# elnemer7/ElNeMeR-Video-Temporal-Deepfake-ONNX

## Resumen
ElNeMeR-Video-Temporal-Deepfake-ONNX es un clasificador forense de vídeo exportado a formato ONNX, desarrollado por Eng. Mahmoud ElNemer a través de ElNeMeR Digital Solutions & AI. El modelo aborda la detección de contenido audiovisual sintético mediante un analisis espacio-temporal de 20 caracteristicas extraidas de secuencias de video, orientado a tareas de peritaje digital y verificacion de autenticidad. Su pipeline declarado en Hugging Face es `video-classification` y su licencia es MIT.

El modelo no es un transformer generativo ni un LLM, sino un clasificador discriminativo que emite probabilidades sobre cuatro clases forenses: video organico de camara, video generativo de IA (Sora, Kling), deepfake por intercambio de rostro (faceswap) y manipulacion de avatar con lipsync. Segun la model card, analiza la estabilidad de trayectoria sobre 8 keyframes, el parpadeo inter-frame centro-borde, la correlacion de lipsync en la mitad inferior del rostro, la clonalidad de la banda sonora y la procedencia del contenedor MP4/MOV.

La relevancia actual del modelo radica en la necesidad creciente de herramientas de verificacion ante la proliferacion de video sintetico de alta calidad. No obstante, la informacion publica disponible es muy limitada: el repositorio figura con 0.0 GB de tamano, 0 descargas y 0 likes en el momento de la consulta, y no se han publicado detalles sobre arquitectura interna, datos de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (clasificador neuronal espacio-temporal; se desconoce la topologia interna) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa 8 keyframes por inferencia segun la model card) |
| Tipos de cuantizacion | No disponible (formato ONNX; se desconoce si existen variantes cuantizadas) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento
La model card describe el modelo como un "clasificador neuronal forense espacio-temporal de video con 20 caracteristicas", que analiza 8 keyframes por secuencia. Las caracteristicas declaradas incluyen estabilidad de trayectoria, parpadeo inter-frame centro-borde, correlacion de lipsync en la mitad inferior del rostro, clonalidad de la banda sonora y procedencia del contenedor MP4/MOV. No se especifica si la arquitectura subyacente es una CNN 3D, un transformer de video, un modelo hibrido o un clasificador tabular sobre caracteristicas extraidas.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, el uso de tecnicas de aumento de datos, ni si se emplearon tecnicas de alineacion o ajuste fino supervisado mas alla del entrenamiento clasico de clasificacion. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa, atencion lineal o mecanismos de agregacion temporal. La unica innovacion descrita es la propia bateria de 20 caracteristicas forenses y el esquema de cuatro clases de salida.

## Capacidades
- Clasificacion de video en cuatro clases: `ORGANIC_CAMERA_VIDEO`, `GENERATIVE_AI_VIDEO_SORA_KLING`, `FACESWAP_DEEPFAKE_VIDEO` y `LIPSYNC_AVATAR_MANIPULATION`.
- Analisis espacio-temporal basado en 8 keyframes por secuencia.
- Deteccion de inestabilidad de trayectoria y parpadeo inter-frame centro-borde como senales de sintesis.
- Analisis de correlacion de lipsync en la region inferior del rostro para detectar manipulaciones de avatar.
- Analisis de clonalidad de la banda sonora (posible deteccion de audio sintetico o duplicado).
- Inspeccion de procedencia del contenedor MP4/MOV.
- Salida de probabilidades por clase (campo `probabilities`).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues.
- No se documentan capacidades de vision general, audio, thinking mode ni generacion de texto.

## Casos de uso
- Verificacion de autenticidad de video periodistico: el modelo puede clasificar un clip recibido por una redaccion y emitir una probabilidad de que sea organico o generado por IA, como primer filtro antes de la revision humana.
- Peritaje forense digital: en un contexto judicial o de aseguradora, el clasificador puede aportar una senal objetiva sobre la presencia de faceswap o manipulacion de lipsync en una prueba audiovisual.
- Moderacion de contenido en plataformas: integrado en un pipeline de subida de video, el modelo puede marcar clips con alta probabilidad de `FACESWAP_DEEPFAKE_VIDEO` o `LIPSYNC_AVATAR_MANIPULATION` para revision prioritaria.
- Deteccion de avatares sinteticos en videollamadas o KYC: el analisis de lipsync y de parpadeo puede emplearse como capa adicional en procesos de verificacion de identidad remota.
- Analisis de campanas de desinformacion: el modelo puede procesar lotes de videos virales y agruparlos por clase forense para estudiar patrones de produccion sintetica.
- Auditoria de contenido generado por Sora o Kling: el clasificador permite etiquetar material de archivo y mantener un inventario de clips sinteticos frente a grabaciones originales.
- Investigacion academica en forense multimedia: como linea base reproducible en formato ONNX para comparar con otros detectores de deepfake.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible (el repositorio figura con 0.0 GB y no se especifica el tamano del grafo ONNX).
- GPU recomendadas: no disponibles; al ser un modelo ONNX, puede ejecutarse en CPU o en GPU compatibles con ONNX Runtime, pero no se documentan requisitos concretos.
- Compatibilidad con GPU de consumo: no confirmada; depende del tamano real del modelo, que no se ha publicado.
- Opciones de despliegue: ONNX Runtime (CPU/GPU), potencialmente integrable en pipelines de video-classification; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a LLMs.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria con datos verificables de parametros, contexto o rendimiento.

## Limitaciones y advertencias
- La model card no documenta sesgos conocidos, pero al ser un detector forense es probable que su rendimiento dependa de la distribucion de los datos de entrenamiento (no publicada), con riesgo de falsos positivos en videos organicos con condiciones atipicas de iluminacion, compresion o movimiento.
- Riesgo de alucinacion en sentido estricto no aplica (no es un modelo generativo), pero si existe riesgo de clasificacion erronea con alta confianza, especialmente en clases poco representadas.
- Limitaciones de contexto e idioma: no se documentan; el modelo no procesa texto, por lo que el idioma no es un factor directo, pero la ausencia de informacion sobre idiomas o regiones de los datos impide evaluar su generalizacion.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificacion con atribucion; no obstante, el autor no ofrece garantias sobre la idoneidad forense del modelo.
- Caveats para produccion: el repositorio presenta 0 descargas y 0 likes, un tamano declarado de 0.0 GB y una model card muy escueta; no hay evidencia publica de validacion independiente, por lo que no deberia usarse como unica fuente de decision en contextos de alto riesgo.
- Los resultados de busqueda web proporcionados no contienen informacion relevante sobre el modelo y no deben considerarse fuente de datos tecnicos.

## Enlaces
- Hugging Face: https://huggingface.co/elnemer7/ElNeMeR-Video-Temporal-Deepfake-ONNX
- Plataforma multi-modelo en vivo: https://detector.elnemer-ai.com
- Portal corporativo: https://elnemer-ai.com
- Contacto del autor (WhatsApp/telefono): +20 150 755 9911
