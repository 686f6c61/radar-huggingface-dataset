# saracen9/syncnet-v2

## Resumen

SyncNet v2 es una red neuronal convolucional de dos ramas disenada para la verificacion de sincronizacion labial (lip-sync) en video. Desarrollada originalmente por Joon Son Chung y Andrew Zisserman (Visual Geometry Group, Universidad de Oxford), la version aqui publicada es una copia sin modificar del archivo `syncnet_v2.model` distribuido por el VGG, subida a Hugging Face por el autor `saracen9` como dependencia fijada de su proyecto curu-vision.

El modelo no es un modelo de lenguaje ni un generador: es un discriminador audio-visual que, dadas secuencias de rostro recortadas y sus correspondientes segmentos de audio, estima si ambos estan temporalmente alineados y con que confianza. Su relevancia practica esta en tareas de postproduccion, doblaje, deteccion de deepfakes y control de calidad en pipelines de video, donde se necesita una medida objetiva de desincronizacion.

El repositorio de Hugging Face pesa 0,1 GB y contiene un unico archivo de pesos de 54.573.114 bytes (SHA-256 `961e8696f888fce4f3f3a6c3d5b3267cf5b343100b238e79b2659bff2c605442`). No se publican parametros, contexto ni idiomas porque no aplican a esta arquitectura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN de dos ramas (audio y video) con fusion y capa de sincronizacion, segun `SyncNetModel.py` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana temporal fija de clips (configuracion en `SyncNetInstance.py`) |
| Tipos de cuantizacion | no disponible; pesos en punto flotante PyTorch |
| Idiomas soportados | no disponibles (independiente del idioma en teoria, no declarado) |
| Licencia | `vgg-syncnet-research-cc-by` (investigacion, CC BY); codigo MIT |
| Formato de pesos | `.model` (serializacion PyTorch / torch.save) |
| Tamano del archivo | 54.573.114 bytes |
| SHA-256 | `961e8696f888fce4f3f3a6c3d5b3267cf5b343100b238e79b2659bff2c605442` |
| Libreria | pytorch |

## Arquitectura y entrenamiento

SyncNet emplea una arquitectura de dos torres: una rama de video que procesa recortes de la region de la boca a lo largo del tiempo y una rama de audio que procesa el espectrograma del segmento correspondiente. Cada rama produce un embedding y el modelo se entrena para que los embeddings de pares sincronizados queden proximos y los de pares desincronizados se separen, lo que permite estimar tanto un desplazamiento temporal (offset) como una confianza de sincronizacion. La implementacion de referencia esta en `joonson/syncnet_python`, revision `907c0b579c2e2d83f0eae1b2ac9e720cde4e5623` (17 de abril de 2026).

Sobre el entrenamiento del modelo publicado no hay datos en la informacion disponible: ni la pagina de descarga ni el repositorio de codigo indican con que datos se entreno `syncnet_v2.model`. El paper original (Chung y Zisserman, ACCV 2016) describe el entrenamiento sobre videos de television de la BBC, y la pagina de descarga senala que la red puede entrenarse con datasets audio-visuales como VoxCeleb2 o LRS, sin afirmar que la version liberada use esos corpus. No se documentan tecnicas de RLHF, DPO ni decodificacion especulativa, que no aplican a este tipo de modelo.

## Capacidades

- Verificacion de sincronizacion labial entre audio y video sobre recortes de rostro.
- Estimacion de un offset temporal (desplazamiento en frames) entre ambas modalidades.
- Salida de una puntuacion de confianza asociada al offset estimado.
- Funciona como discriminador binario implicito (sincronizado / desincronizado) mediante umbral sobre la confianza.
- No genera texto, codigo, imagenes ni audio.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No dispone de capacidades multilingues declaradas ni de modo "thinking".
- No procesa vision general ni audio generico mas alla del habla y la region facial.

## Casos de uso

- Control de calidad en doblaje: ejecutar SyncNet sobre cada plano con rostro hablante para detectar tomas donde el audio doblado se ha desplazado respecto al movimiento labial, usando el offset devuelto para corregir el desfase en la linea de tiempo.
- Deteccion de deepfakes y manipulaciones: comparar la coherencia audio-visual de un video sospechoso; una confianza de sincronizacion anomala o un offset inconsistente entre planos es una senal de manipulacion.
- Postproduccion de cine y series: validar automaticamente la sincronizacion de ADR (reemplazo de dialogo) y de pistas de audio alternativas antes de la entrega del master.
- Verificacion de pipelines de traduccion automatica de video: en sistemas que regeneran audio en otro idioma, SyncNet actua como metrica objetiva de que el nuevo audio mantiene el ritmo y la alineacion con los labios.
- Investigacion en reconocimiento de habla visual: servir como componente de preprocesado o como baseline para seleccionar segmentos audio-visuales bien sincronizados en corpus de entrenamiento.
- Monitorizacion de emisiones en directo: integrado en un pipeline de ingesta, marcar streams con problemas de latencia audio-video (por ejemplo, desfases por buffering) y disparar alertas.
- Auditoria de contenido subido por usuarios: filtrar en plataformas UGC videos con audio y video claramente desacoplados o con indicios de suplantacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para inferencia; el archivo de pesos ocupa unos 54,6 MB y la red es una CNN ligera.
- GPU recomendadas: cualquier GPU con CUDA moderna es suficiente; no requiere A100 ni H100. Una RTX 3060 o superior ofrece margen de sobra.
- Cabe en GPU de consumo: si, incluidas GPUs de gama baja y portatiles con CUDA; tambien puede ejecutarse en CPU con latencia aceptable para lotes pequenos.
- Opciones de despliegue: el codigo de referencia es `joonson/syncnet_python` (PyTorch); no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este modelo. El proyecto curu-vision lo integra mediante su puerto `load_sync_detector`.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del numero de frames por clip y del hardware.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SyncNet v2 (este) | CNN audio-visual de verificacion de lip-sync | no disponible | no aplica (clips fijos) | CC BY solo investigacion | Pesos en HF y VGG |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros modelos de la misma categoria en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Licencia restringida: los pesos se ofrecen para uso en investigacion bajo Creative Commons Attribution; el uso comercial no esta cubierto por los terminos de la pagina de descarga y requiere revision legal expresa.
- Obligacion de citar: tanto la pagina de descarga como el repositorio de codigo exigen citar el paper de Chung y Zisserman (2016) al usar el software.
- Datos de entrenamiento no declarados: se desconoce el corpus exacto que entreno la version liberada, lo que impide evaluar sesgos demograficos o de idioma.
- Dependencia de la region facial: el modelo requiere recortes de la boca bien alineados; fallos del detector de rostro degradan la confianza de forma no controlada.
- Riesgo de falsos positivos y negativos: la salida es una confianza, no una probabilidad calibrada; el umbral debe ajustarse por dominio.
- Sin garantias de robustez: no hay benchmarks publicados en esta ficha que permitan estimar el rendimiento en condiciones reales (ruido, multiples hablantes, oclusiones).
- Copia no oficial: el repositorio de Hugging Face es una copia de terceros; la integridad debe verificarse con el SHA-256 indicado antes de usarla en produccion.
- No apto para generacion ni para tareas de lenguaje: es exclusivamente un discriminador audio-visual.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/saracen9/syncnet-v2
- Pagina de descarga original (VGG): https://www.robots.ox.ac.uk/~vgg/software/lipsync/
- Codigo de referencia: https://github.com/joonson/syncnet_python
- Revision del codigo: `907c0b579c2e2d83f0eae1b2ac9e720cde4e5623`
- Paper: https://www.robots.ox.ac.uk/~vgg/publications/2016/Chung16a/chung16a.pdf
- Licencia del codigo (MIT): https://github.com/joonson/syncnet_python/blob/907c0b579c2e2d83f0eae1b2ac9e720cde4e5623/LICENSE.md
- README del codigo: https://github.com/joonson/syncnet_python/blob/907c0b579c2e2d83f0eae1b2ac9e720cde4e5623/README.md
