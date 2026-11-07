# hdae/karume-lucida

## Resumen

Karume-lucida es una distribución del modelo de segmentación de imagen Lucida, un fine-tune de BiRefNet orientado a la eliminación de fondos en casos difíciles: camuflaje, transparencias, texto y logotipos, e ilustración. El autor original de los pesos es egeorcun; esta versión la publica el usuario hdae como conversión no oficial al formato contenedor del runtime de inferencia WebGPU Karume, sin reentrenamiento ni fine-tuning adicional.

El modelo resuelve una tarea concreta: dada una imagen RGB, devuelve una máscara alfa de 8 bits por píxel a la resolución original de la entrada. La innovación práctica no está en los pesos, sino en el empaquetado: un único grafo con preprocesado y postprocesado incluidos, ejecutable tal cual en navegador y en Deno mediante la librería `karume`, lo que permite eliminación de fondos en cliente sin backend.

La arquitectura subyacente es BiRefNet (arXiv:2401.03407), una red de segmentación binaria de alta resolución. Se distribuye en dos variantes según la resolución de trabajo (1024 y 2048), cada una con cuantizaciones f32 y f16, y licencia MIT. El repositorio ocupa 6,8 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BiRefNet (red de segmentación binaria de alta resolución) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | f32 y f16 (por variante de resolución) |
| Idiomas soportados | no disponible (modelo de imagen, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | contenedor Karume (`.krm`, secuencia de partes con grafo y descriptores embebidos); no legible por transformers |
| Variantes | `1024` (por defecto) y `2048` |
| Salida | máscara alfa de 8 bits, misma resolución que la entrada |
| Modelo base | egeorcun/lucida (fine-tune de ZhengPeng7/BiRefNet_HR) |
| Exportador | karume/0.14.0; manifiesto `karume.json` (karume/5) |
| Tamaño del repo | 6,8 GB |

## Arquitectura y entrenamiento

BiRefNet es una arquitectura de segmentación binaria de alta resolución basada en transformer con módulos de atención multi-escala y un decodificador progresivo que preserva detalle en los bordes. Los pesos de Lucida son un fine-tune de `ZhengPeng7/BiRefNet_HR` (MIT) orientado a casos de camuflaje, transparencia, texto y logotipos, e ilustración; entre los datos de entrenamiento de ilustración figura ToonOut (CC-BY-4.0), y el modelo también se apoya en P3M-10k, COD10K y DIS5K, distribuidos para fines de investigación.

La conversión a Karume no modifica los valores aprendidos: no hubo reentrenamiento ni fine-tuning. El grafo es el `forward` original con reescrituras de disposición de memoria (windowing, roll de ventanas desplazadas, padding espacial y fusiones de parches plegadas en operaciones equivalentes, bit-exactas) y tres reescrituras equivalentes salvo redondeo en coma flotante: BatchNorm2d de inferencia convertido en afín por canal, el pooling de nivel de imagen del ASPP convertido en suma en dos etapas, y la convolución 1×1 de la cola del decodificador intercambiada con el upsampling bilineal que la seguía (elimina dos intermedios a resolución completa). En cuantización f16, todos los pesos se redondean al f16 más cercano; los pesos de convolución deformable (`regular_conv`), los sesgos y los parámetros de normalización mantienen almacenamiento f32, y todo el cómputo permanece en f32. La resolución está fijada en el grafo (máscaras de ventana y constantes de padding por resolución), por lo que se elige con `model` y no en tiempo de llamada.

## Capacidades

- Segmentación de imagen y eliminación de fondo: entrada RGB8 en orden de filas, salida de una máscara alfa de 8 bits por píxel a la resolución original.
- Manejo específico de casos difíciles: camuflaje, transparencias, texto y logotipos, e ilustración.
- Preprocesado y postprocesado integrados: redimensionado al objetivo de la variante (1024×1024 por defecto), normalización con constantes fijas, sigmoide sobre logits, escalado de la máscara a la resolución original y redondeo a 8 bits.
- Ejecución en navegador y en Deno mediante WebGPU, con una sesión GPU persistente durante la vida del pipeline.
- Dos niveles de detalle: la variante `2048` conserva más detalle en los bordes a costa de más memoria GPU y tiempo.
- No incluye decodificación de PNG/JPEG: el llamador debe aportar los píxeles (por ejemplo con `createImageBitmap`).
- No incluye composición: devuelve la máscara, no el recorte; la decisión de aplicar alfa, componer sobre color plano o hacer decontaminación de color queda en el integrador.
- Sin capacidades de texto, tool calling, agentes ni multilingüismo.

## Casos de uso

- Eliminación de fondo en el navegador: procesar imágenes subidas por el usuario en cliente con WebGPU, sin enviar los píxeles a un servidor, usando la variante `1024` para un equilibrio entre latencia y detalle.
- Herramientas de edición fotográfica web: generar máscaras alfa que el editor use para componer sobre un color plano o exportar RGBA, manteniendo el pipeline de composición bajo control de la aplicación.
- Preparación de assets para e-commerce: recortar producto sobre fondo uniforme y generar PNG con transparencia en un flujo por lotes, aprovechando la sesión GPU persistente de `segment()` para muchas imágenes seguidas.
- Extracción de logotipos y texto: la especialización del fine-tune en texto/logos permite aislar marcas o rótulos de fondos complejos para su reutilización en materiales de marca.
- Procesado de ilustración y material de animación: la inclusión de datos tipo ToonOut en el entrenamiento lo hace adecuado para separar personajes o capas de ilustración en pipelines de animación o publicación.
- Recorte de sujetos con transparencias o camuflaje: casos donde los modelos genéricos fallan, como cristales, humo, pelo o sujetos de bajo contraste con el fondo.
- Aplicaciones Deno de escritorio o edge: ejecución del mismo contenedor fuera del navegador en entornos Deno, útil para herramientas locales de procesado de imagen sin dependencias nativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia vía WebGPU: requiere un navegador o runtime Deno con soporte WebGPU y una GPU compatible.
- VRAM estimada: no disponible de forma numérica; la variante `2048` consume más memoria GPU que `1024`, y f16 reduce el almacenamiento de pesos frente a f32.
- GPU recomendadas: no disponible; cualquier GPU con WebGPU funcional (integrada o dedicada) puede ejecutar el modelo, con rendimiento dependiente del hardware.
- Cabe en GPU de consumo: sí, al ejecutarse sobre WebGPU en el cliente; no se especifican modelos concretos.
- Opciones de despliegue: runtime Karume (`jsr:@karume/models/birefnet`) en navegador y Deno. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ni legible por transformers.
- Latencia y throughput: no disponibles; dependen de la GPU, de la variante (1024 o 2048) y de la cuantización.

## Comparativa con modelos similares

| Modelo | Tarea | Resolución | Formatos | Licencia | Ejecución en navegador |
|---|---|---|---|---|---|
| karume-lucida | Eliminación de fondo (BiRefNet fine-tune) | 1024 / 2048 | Contenedor Karume (.krm) | MIT | Sí (WebGPU) |
| egeorcun/lucida | Eliminación de fondo (BiRefNet fine-tune) | no disponible | Pesos originales (no especificado) | MIT | No documentado |
| ZhengPeng7/BiRefNet_HR | Segmentación binaria de alta resolución | no disponible | safetensors (formato transformers) | MIT | No (requiere backend) |

Los tres comparten la misma arquitectura base; karume-lucida se diferencia por el empaquetado para WebGPU y por incluir pre/postprocesado en el grafo. No se dispone de datos de rendimiento comparativo entre ellos.

## Limitaciones y advertencias

- Conversión no oficial: no está afiliada ni respaldada por egeorcun, autor de los pesos originales.
- No legible por transformers: usa un contenedor propio con grafo embebido; solo funciona con un pipeline que implemente `birefnet/2`.
- Resolución fijada en el grafo: no se puede cambiar en tiempo de llamada; hay que elegir entre las variantes `1024` y `2048`.
- No incluye decodificación de imagen ni composición: el integrador debe aportar píxeles RGB8 y decidir cómo aplicar la máscara.
- La variante experimental `lucida-m35-comfy.safetensors` no está incluida porque su `Normalize` plegado en la primera convolución duplicaría el preprocesado del pipeline.
- Datos de entrenamiento con restricciones: P3M-10k, COD10K y DIS5K se distribuyen para fines de investigación; conviene verificar su compatibilidad con el uso previsto aunque los pesos se publiquen bajo MIT.
- Riesgo de bordes imperfectos en casos extremos (pelo fino, transparencias complejas) no cuantificado por falta de benchmarks publicados.
- Sin datos sobre sesgos: al ser un modelo de segmentación, los sesgos relevantes serían de representación en los datos de entrenamiento, no documentados.
- En producción, fijar la revisión (commit) del repositorio: sin ella se sigue `main` y una actualización futura puede romper la aplicación.
- Sin garantías de latencia ni de memoria en hardware concreto; requiere validación en el parque de GPUs objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hdae/karume-lucida
- Archivos y versiones: https://huggingface.co/hdae/karume-lucida/tree/main
- Pesos base (egeorcun/lucida): https://huggingface.co/egeorcun/lucida
- Modelo del que deriva el fine-tune (ZhengPeng7/BiRefNet_HR): https://huggingface.co/ZhengPeng7/BiRefNet_HR
- Paper de BiRefNet: https://arxiv.org/abs/2401.03407
- Dataset ToonOut: https://huggingface.co/datasets/joelseytre/toonout
- Runtime Karume (paquete del pipeline): https://jsr.io/@karume/models/birefnet
