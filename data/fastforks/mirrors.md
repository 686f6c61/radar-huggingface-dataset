# fastforks/mirrors

## Resumen

`fastforks/mirrors` no es un modelo de lenguaje, sino un repositorio de espejo (mirror) de pesos de modelos de estimación de disparidad estéreo. Lo mantiene el proyecto fastforks, una herramienta de descarga de pesos que verifica la integridad de cada fichero mediante su hash SHA-256 y recurre a estas copias alojadas en HuggingFace cuando las URL originales (Google Drive, Dropbox, S3) fallan. El repositorio no entrena ni modifica ningún modelo: redistribuye ficheros byte a byte idénticos a los originales.

El contenido abarca ocho familias de arquitecturas estéreo clásicas y modernas: AANet, CREStereo, GwcNet, HITNet, IGEV-Stereo, IGEV++, RAFT-Stereo, Selective-IGEV y GREAT-IGEV. Cada entrada incluye variantes entrenadas o ajustadas para distintos benchmarks (Scene Flow, KITTI 2012/2015, ETH3D, Middlebury), con un total de 30 ficheros de pesos que suman aproximadamente 1,5 GB. Los formatos son heterogéneos: `.pth` de PyTorch, `.ckpt` de PyTorch Lightning, `.pb` de TensorFlow y `.mge` propietario de CREStereo.

Su relevancia es práctica más que científica: resuelve el problema de la disponibilidad a largo plazo de pesos alojados en servicios externos que caducan o limitan descargas. Para investigadores que reproducen resultados de estimación de profundidad estéreo, este repositorio actúa como fuente de respaldo verificable. No es adecuado para tareas de generación de texto, razonamiento, código ni visión general; su dominio es exclusivamente la correspondencia estéreo densa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Múltiple: redes de correlación coste-volumen (AANet, GwcNet, IGEV, Selective-IGEV, GREAT-IGEV), iterativas tipo RAFT (RAFT-Stereo), jerárquicas (HITNet) y recurrentes con refinamiento (CREStereo) |
| Parametros totales | no disponible (no se especifican por fichero; el repo completo ocupa 1,5 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (procesa imágenes estéreo, no texto) |
| Licencia | `other` con `license_name: per-file`; cada fichero conserva su licencia original: Apache-2.0, MIT o la que corresponda al modelo de origen |
| Formato de pesos | `.pth` (PyTorch), `.ckpt` (PyTorch Lightning), `.pb` (TensorFlow), `.mge` (formato propio de CREStereo) |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura propia ni contiene código de entrenamiento. Agrupa pesos ya entrenados por terceros, cada uno con su diseño original. Las familias representadas cubren las principales líneas de investigación en estéreo denso de la última década: AANet usa correlación adaptativa y agregación intraescala; GwcNet emplea grupos de correlación 3D; RAFT-Stereo adapta el paradigma iterativo de flujo óptico con correlación multiescala; IGEV e IGEV++ combinan volumen de coste geométrico con refinamiento iterativo; Selective-IGEV añade selección dinámica de candidatos; GREAT-IGEV incorpora geometría y transformers; HITNet propone una alternativa jerárquica ligera; CREStereo utiliza un diseño recurrente con módulo de atención.

Los datos de entrenamiento, número de tokens (no aplica), composición del dataset y uso de RLHF/DPO no están documentados en la model card, ya que el autor del mirror no entrenó ninguno de los modelos. Cada pesos corresponde a su publicación original y a los conjuntos de datos estándar del campo: Scene Flow (sintético, ~35 000 pares), KITTI 2012/2015 (LiDAR), ETH3D (escenas reales de interior y exterior) y Middlebury (alta resolución controlada). No hay innovaciones técnicas atribuibles al repositorio; la única aportación es la verificación SHA-256 por fichero y la disponibilidad redundante.

## Capacidades

- Estimación de disparidad estéreo densa a partir de un par de imágenes rectificadas.
- Predicción de mapas de profundidad mediante triangulación a partir de la disparidad y los parámetros de calibración.
- Generalización entre dominios según la variante: los pesos `sceneflow` ofrecen mayor cobertura sintética, mientras que los ajustados a `kitti`, `eth3d` o `middlebury` están especializados en esos dominios.
- Procesamiento por lotes de pares estéreo en pipelines de visión por computador.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Reproducción de experimentos académicos: descargar los pesos exactos de IGEV++, RAFT-Stereo o Selective-IGEV desde este mirror cuando las URL originales de Google Drive o Dropbox fallen, garantizando que el hash coincide con el publicado en el paper.
- Vehículos autónomos y ADAS: usar pesos ajustados a KITTI 2015 (`igev-plusplus-kitti15@1`, `selective-igev-kitti15@1`) para generar mapas de profundidad en tiempo real a partir de cámaras estéreo, con la ventaja de que el mirror asegura la disponibilidad de los pesos en producción.
- Robótica de manipulación: emplear HITNet (`hitnet-middlebury-d400@1`) o RAFT-Stereo en sistemas embebidos donde el presupuesto computacional es limitado y se requiere una red jerárquica ligera.
- Reconstrucción 3D y fotogrametría: combinar la disparidad de CREStereo (`crestereo-eth3d@1`) con calibración para generar nubes de puntos en escenas de interior y exterior de alta resolución.
- Evaluación comparativa de algoritmos estéreo: disponer de las ocho familias en un solo repositorio facilita montar un benchmark interno con los mismos conjuntos de validación (Scene Flow, ETH3D, Middlebury) y comparar latencia y precisión.
- Docencia e investigación reproducible: usar los pesos de AANet (`aanet-sceneflow@1`, `aanet-plus-sceneflow@1`) como línea base ligera en cursos de visión por computador, con licencia Apache-2.0 que permite redistribución.
- Integración en pipelines de CI: verificar con SHA-256 que los pesos descargados en un contenedor de entrenamiento o inferencia son los esperados antes de ejecutar la evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de error de disparidad (EPE, D1, bad pixels) ni comparativas de latencia para ninguno de los pesos alojados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma agregada. Cada fichero individual pesa entre decenas y cientos de MB; el repo completo ocupa 1,5 GB, por lo que un solo modelo cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no especificadas en la información proporcionada. Por el tamaño típico de estas redes estéreo, caben en RTX 3060/4060 en adelante; para lotes grandes o resoluciones altas se recomiendan RTX 4090, A100 o H100.
- Cabe en GPU de consumo: sí, cualquier variante individual, dado que ningún fichero del repositorio se acerca a los límites de VRAM de una GPU consumer moderna.
- Opciones de despliegue: los `.pth` y `.ckpt` se cargan con PyTorch o PyTorch Lightning; los `.pb` con TensorFlow; los `.mge` con el runtime de CREStereo. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Familia | Dominio principal | Formato | Licencia | Disponibilidad en este repo |
|---|---|---|---|---|---|
| IGEV++ | Iterativa con volumen geométrico | KITTI, ETH3D, Middlebury, Scene Flow | `.pth` | MIT | Sí (5 variantes) |
| Selective-IGEV | Iterativa con selección dinámica | KITTI, ETH3D, Middlebury | `.pth` | MIT | Sí (6 variantes) |
| RAFT-Stereo | Iterativa tipo RAFT | ETH3D, Middlebury, Scene Flow | `.pth` | MIT | Sí (3 variantes) |
| CREStereo | Recurrente con atención | ETH3D | `.mge` | Apache-2.0 | Sí (1 variante) |
| HITNet | Jerárquica ligera | ETH3D, Middlebury | `.pb` | Apache-2.0 | Sí (2 variantes) |

La comparativa se limita a los modelos contenidos en el propio repositorio, ya que la información disponible no incluye datos de rendimiento que permitan contrastarlos con alternativas externas.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo multimodal general: no genera texto, no razona, no responde preguntas y no procesa instrucciones.
- Los pesos son copias byte a byte de terceros; el autor del mirror no los ha entrenado, validado ni modificado, por lo que cualquier sesgo o fallo proviene del modelo original.
- La licencia es `other` con `license_name: per-file`: cada fichero tiene su propia licencia (Apache-2.0, MIT u otra), y el uso comercial debe verificarse fichero a fichero contra la licencia del modelo de origen.
- Riesgo de alucinación no aplica en el sentido habitual, pero sí existe riesgo de disparidad errónea en regiones ocluidas, sin textura o con reflexiones, inherente a todos los métodos estéreo.
- La disponibilidad futura del repositorio no está garantizada; el propio proyecto fastforks lo describe como un respaldo para cuando la URL original falla.
- No se documentan los idiomas ni la composición de los datasets de entrenamiento de cada peso en esta model card.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.
- Los formatos son heterogéneos (`.pth`, `.ckpt`, `.pb`, `.mge`) y requieren runtimes distintos, lo que complica un despliegue unificado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/fastforks/mirrors
- Proyecto fastforks (GitHub): https://github.com/kleinicke/fastforks
- Pesos originales de AANet (Google Drive, enlazados en la model card): https://drive.usercontent.google.com/download?export=download&confirm=t&id=1m3Wo2k7w3OlVaDYdIm-x9K8_frQ4Vq9u
- Pesos originales de CREStereo (Google Drive): https://drive.usercontent.google.com/download?id=1Wx_-zDQh7BUFBmN9im_26DFpnf3AkXj4&export=download&confirm=t
- Pesos originales de GREAT-IGEV (Google Drive): https://drive.usercontent.google.com/download?export=download&confirm=t&id=1wvR4a07-cQOXNaNa2Y1XxUVZIKqUyT9H
- Pesos originales de GwcNet (Google Drive): https://drive.usercontent.google.com/download?export=download&confirm=t&id=1qiOTocPfLaK9effrLmBadqNtBKT4QX4S
- Pesos originales de HITNet (Wasabi S3, pinto-model-zoo): https://s3.ap-northeast-2.wasabisys.com/pinto-model-zoo/142_HITNET/resources.tar.gz
- Pesos originales de IGEV++ (Google Drive): https://drive.usercontent.google.com/download?export=download&confirm=t&id=1gN8J9YVJMupJVjUAUMSJ0jldkqH1YJUo
- Pesos originales de RAFT-Stereo (Dropbox): https://www.dropbox.com/scl/fi/5khx1bhz84dapi8vtwapg/models.zip?rlkey=ggddrn1du1iiq6mgc2dsdpmwi&dl=1
- Pesos originales de Selective-IGEV (Google Drive): https://drive.usercontent.google.com/download?export=download&confirm=t&id=1fHtm5bno6usdcKEYLgH__yBLhMYDz0fs
