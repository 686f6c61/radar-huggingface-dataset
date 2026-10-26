# fodorad/exordium-weights

## Resumen

`fodorad/exordium-weights` no es un modelo generativo, sino un repositorio espejo de pesos que da servicio a **exordium**, el framework de análisis multimodal de comportamiento desarrollado por fodorad. El repositorio agrupa 16 ficheros de checkpoints (5,5 GB en total) procedentes de proyectos de terceros —estimación de mirada, pose de cabeza, unidades de acción facial, reconocimiento facial, representación de comportamiento facial y emoción en habla— y los redistribuye para que el pipeline de exordium siga funcionando cuando una fuente upstream se mueve o desaparece, algo que, según el propio autor, ya ha ocurrido una vez.

El interés práctico del repositorio es la reproducibilidad: cada componente queda fijado en una versión concreta y el manifiesto del servicio expone el SHA-256 de cada peso, lo que permite verificar la integridad de la cadena de inferencia en entornos de investigación y de CI. No hay un modelo base único ni un transformer de lenguaje: conviven CNN tipo ResNet (IR-18/50/101 de AdaFace, backbone de L2CS-Net), Vision Transformers (Swin-Tiny como backbone de OpenGraphAU, DINOv2 ViT-B/14 y ViT-L/14 en los decodificadores de Gaze-LLE, y las variantes ViT-S/B/L de MARLIN) y un transformer auto-supervisado de audio (emotion2vec).

La relevancia actual es doble. Por un lado, ofrece una vía de entrada a un stack de análisis de comportamiento facial y atencional sin tener que rastrear una decena de repositorios independientes. Por otro, la licencia es explícitamente mixta y hay que leerla fichero a fichero: los pesos de MARLIN son CC BY-NC 4.0 (solo uso no comercial) y otros checkpoints remiten a la licencia de su proyecto original, de modo que el repositorio no puede tratarse como un paquete homogéneo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Coleccion heterogenea de 16 checkpoints: CNN ResNet (IR-18/50/101 en AdaFace, ResNet-50 en L2CS-Net), Swin-Tiny (backbone de OpenGraphAU), DINOv2 ViT-B/14 y ViT-L/14 (decodificadores de Gaze-LLE), ViT-S/B/L (MARLIN) y transformer auto-supervisado de audio (emotion2vec) |
| Parametros totales | no disponible (no se publica el recuento por checkpoint; el repositorio ocupa 5,5 GB) |
| Parametros activos | no aplica: ningun componente es un modelo MoE |
| Longitud de contexto | no aplica / no disponible: son modelos de vision y audio; el unico dato dimensional es la entrada 224x224 que sugiere el nombre del checkpoint Swin (`swin_tiny_patch4_window7_224`) |
| Tipos de cuantizacion | no disponible: se distribuyen pesos en la precision original del autor (fp32/fp16 sin especificar). No hay GGUF ni variantes cuantizadas |
| Idiomas soportados | no disponible (los componentes de audio no declaran idioma en la informacion proporcionada) |
| Licencia | mixta, fichero a fichero: MIT (L2CS-Net, Gaze-LLE, 6DRepNet, Swin, AdaFace), Apache-2.0 (MediaPipe Iris), CC BY-NC 4.0 solo uso no comercial (MARLIN small/base/large), "see original project" (FAb-Net, OpenGraphAU) y licencia FunASR (emotion2vec) |
| Formato de pesos | `.pth`, `.pkl`, `.safetensors`, `.pt` |
| Libreria declarada | `exordium` |
| Tamano del repositorio | 5,5 GB |

## Arquitectura y entrenamiento

El repositorio no entrena nada: es un espejo de distribucion. Cada checkpoint conserva la arquitectura con la que lo publicaron sus autores originales. La tabla de componentes documenta el mapeo completo entre fichero, wrapper de exordium (`FabNetWrapper`, `IrisWrapper`, `L2csNetWrapper`, `GazelleWrapper`, `OpenGraphAuWrapper`, `SixDRepNetWrapper`, `MarlinWrapper`, `AdaFaceWrapper`, `Emotion2vecWrapper`), proyecto de origen y licencia.

Los bloques tecnicos son: FAb-Net (Wiles et al., BMVC 2018) para caracteristicas de comportamiento facial auto-supervisadas; MediaPipe Iris (Google, Apache-2.0) para localizacion de iris; L2CS-Net (Abdelrahman et al., 2022) para estimacion de mirada en imagen y fuera de imagen; Gaze-LLE (Ryan et al., CVPR 2025), que aporta seis ficheros de decodificadores sobre DINOv2 ViT-B/14 y ViT-L/14, incluidas las variantes `_inout` y `_inout_childplay`; OpenGraphAU / ME-GraphAU (Luo et al., 2022) en dos etapas sobre un backbone Swin-Tiny; 6DRepNet (Hempel et al., ICIP 2022) para pose de cabeza en representacion de rotacion 6D; MARLIN (Cai et al., CVPR 2023) en tres tamanos de backbone ViT para representacion facial auto-supervisada; AdaFace (Kim et al., CVPR 2022) en tres backbones IR para reconocimiento facial; y emotion2vec (Ma et al., 2023) para reconocimiento de emociones en habla. No se documentan en la informacion disponible los volumenes de datos de entrenamiento, la composicion de los datasets, ni si hubo RLHF/DPO o ajuste por preferencias en cada componente.

La innovacion operativa del espejo no esta en los modelos, sino en la gestion de dependencias: el servicio asociado publica un manifiesto (`GET /manifest`) con el SHA-256 de cada peso, de forma que un resultado de inferencia es trazable hasta un fichero binario concreto. Eso es lo que hace util el repositorio en entornos de investigacion reproducible.

## Capacidades

- Estimacion de mirada (gaze) en imagen y fuera de ella, con modelos especificos para escenas con varias personas y para el caso `childplay`.
- Deteccion de unidades de accion facial (AUs) mediante OpenGraphAU en dos etapas sobre Swin-Tiny.
- Estimacion de pose de cabeza en matriz de rotacion 6D (6DRepNet), apta para calcular angulos de cabeceo, guinada y alabeo.
- Localizacion de contornos y puntos de iris (MediaPipe Iris).
- Extraccion de embeddings de identidad facial para verificacion y comparacion 1:1 o 1:N (AdaFace IR-18, IR-50, IR-101).
- Representacion facial auto-supervisada de proposito general con MARLIN (ViT-S, ViT-B, ViT-L), util como extractor de caracteristicas aguas abajo.
- Caracteristicas de comportamiento facial de FAb-Net, orientadas a tareas de movimiento y expresion.
- Reconocimiento de emociones en audio con emotion2vec.
- No soporta generacion de texto, tool calling, razonamiento multi-paso, agentes ni capacidades multimodales de tipo vision-lenguaje: no es un modelo de lenguaje.

## Casos de uso

- Monitorizacion de atencion del conductor: combinando 6DRepNet (pose de cabeza) y L2CS-Net (mirada) se obtiene un vector de atencion por fotograma con el que detectar distracciones; el pipeline es enteramente de vision y puede correr cerca del borde.
- Anotacion de corpus de comportamiento facial en investigacion HCI: OpenGraphAU etiqueta unidades de accion sobre video y AdaFace agrupa por identidad, lo que permite construir datasets etiquetados de expresion sin trabajo manual completo.
- Analitica de audiencia en entornos controlados: estimacion agregada de mirada y pose de cabeza para medir atencion a una pantalla, con la salvedad regulatoria indicada mas abajo.
- Verificacion de identidad en acceso fisico o control de presencia: AdaFace IR-50 o IR-101 generan embeddings comparables mediante distancia coseno; el checkpoint IR-18 es la opcion de menor coste para dispositivos con poca memoria.
- Analisis de emocion en centros de llamadas o en investigacion de habla: emotion2vec sobre audio en bruto para clasificar estado afectivo, combinable con las senales visuales del resto del stack.
- Deteccion de parpadeo y microcomportamiento ocular: MediaPipe Iris aporta puntos de iris que, junto con BlinkLinMulT (mismo autor), permiten estimar frecuencia y duracion de parpadeo.
- Verificacion de integridad en CI: el manifiesto con SHA-256 por peso permite fallar un build si un checkpoint cambia, lo que resulta util en pipelines que deben reproducir resultados de un paper.
- Extraccion de caracteristicas congeladas para modelos aguas abajo: MARLIN ViT-B como extractor congelado en lugar de reentrenar desde cero sobre datasets faciales pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del espejo no incluye metricas de ningun componente (ni exactitud de reconocimiento facial en LFW, ni error angular de mirada en Gaze360 o MPIIFaceGaze, ni F1 de unidades de accion en DISFA o BP4D), y las busquedas web realizadas no aportan cifras de rendimiento asociadas a este repositorio. Cualquier comparacion numerica habria que tomarla de los papers originales de cada componente, no de esta ficha.

## Requisitos de hardware

- El repositorio completo ocupa 5,5 GB en disco; en inferencia solo se carga el subconjunto de wrappers que use el pipeline.
- VRAM estimada por componente (estimacion a partir de la familia y el tamano del backbone, no de mediciones publicadas): ResNet-18 y Swin-Tiny por debajo de 1 GB en fp32 con lotes pequenos; ResNet-50 y ViT-S en torno a 1-2 GB; ViT-B en torno a 2-3 GB; ViT-L puede superar los 4-6 GB en fp32, menos en fp16.
- Cabe en GPU de consumo: si. Los componentes pequenos (IR-18, Swin-Tiny, ViT-S) funcionan en GPUs de 4-8 GB; ViT-L requiere 8-12 GB o ejecucion en fp16. En CPU es viable para los modelos pequenos con latencia mayor.
- GPU recomendadas: RTX 3060/4060 para el conjunto pequeno, RTX 4090 o A100/H100 para procesar video a varios flujos por segundo con ViT-L.
- Despliegue: PyTorch nativo a traves de la libreria `exordium`; exportacion a ONNX o TorchScript para servir sin dependencia de Python. No aplican vLLM, TGI, llama.cpp ni Ollama, al no tratarse de un modelo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones publicadas en la informacion proporcionada, por lo que no es posible contrastar el rendimiento frente a alternativas externas (por ejemplo, otros estimadores de mirada o de pose de cabeza). La comparacion factible es interna, entre las variantes incluidas en el propio espejo:

| Componente | Tarea | Backbone | Licencia | Coste relativo |
|---|---|---|---|---|
| AdaFace IR-18 | Reconocimiento facial | ResNet-18 IR | MIT | Bajo |
| AdaFace IR-50 | Reconocimiento facial | ResNet-50 IR | MIT | Medio |
| AdaFace IR-101 | Reconocimiento facial | ResNet-101 IR | MIT | Alto |
| MARLIN ViT-S | Representacion facial | ViT-S | CC BY-NC 4.0 | Bajo |
| MARLIN ViT-L | Representacion facial | ViT-L | CC BY-NC 4.0 | Alto |
| Gaze-LLE ViT-B/14 | Mirada | DINOv2 ViT-B/14 (decoder) | MIT | Medio |
| Gaze-LLE ViT-L/14 | Mirada | DINOv2 ViT-L/14 (decoder) | MIT | Alto |

## Limitaciones y advertencias

- No es un modelo unico ni un modelo de lenguaje: no genera texto, no razona y no soporta herramientas. Cualquier expectativa de "LLM" sobre este repositorio es un error de lectura.
- Es un espejo no oficial. El propio autor lo declara: los pesos pertenecen a sus autores originales, nada se relicencia y la cita correcta es la del paper o repositorio de origen.
- Licencia heterogenea con implicaciones legales directas: los tres checkpoints de MARLIN son CC BY-NC 4.0 y prohiben el uso comercial. FAb-Net y OpenGraphAU remiten a "see original project", lo que obliga a verificar cada caso antes de desplegar. emotion2vec usa la licencia de FunASR.
- Riesgo de desaparicion o retirada: el autor se compromete a eliminar ficheros a peticion de sus creadores, de modo que la disponibilidad a largo plazo no esta garantizada.
- Ausencia total de benchmarks y de documentacion de entrenamiento en la informacion disponible: no hay forma de evaluar la calidad de los checkpoints sin ejecutarlos sobre datos propios.
- Sesgos: no documentados en la informacion proporcionada. Los modelos de reconocimiento facial y de analisis de expresion son sensibles a sesgos demograficos, de iluminacion y de oclusion; conviene validar por subgrupos antes de cualquier uso real.
- Alucinacion: no aplica en el sentido generativo, pero si existe riesgo de predicciones espurias con confianza alta en caras ocluidas, fuera de encuadre o con resolucion baja.
- Marco regulatorio: el reconocimiento facial y, muy especialmente, la inferencia de emociones a partir de imagen o audio estan restringidos en la UE (RGPD para datos biometricos y limitaciones del Reglamento de IA al uso de reconocimiento de emociones en el trabajo y en educacion). Cualquier caso de uso de las secciones anteriores debe pasar una evaluacion legal previa.
- Metadatos a vigilar: el repositorio figura con 0 descargas y 0 likes, y las fechas de creacion y actualizacion son posteriores a la fecha habitual de consulta; conviene verificar el estado real del repositorio antes de fijarlo como dependencia.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/fodorad/exordium-weights
- Framework exordium: https://github.com/fodorad/exordium
- BlinkLinMulT (mismo autor, consumo de estos pesos): https://github.com/fodorad/BlinkLinMulT
- FAb-Net: https://github.com/oawiles/FAb-Net
- MediaPipe Iris: https://github.com/google/mediapipe
- L2CS-Net: https://github.com/Ahmednull/L2CS-Net
- Gaze-LLE: https://github.com/fkryan/gazelle
- OpenGraphAU: https://github.com/lingjivoo/OpenGraphAU
- Swin Transformer: https://github.com/microsoft/Swin-Transformer
- 6DRepNet: https://github.com/thohemp/6DRepNet
- MARLIN: https://github.com/ControlNet/MARLIN
- AdaFace: https://github.com/mk-minchul/AdaFace
- emotion2vec: https://github.com/ddlBoJack/emotion2vec
- Paper que cita exordium (CHI 2026): https://dl.acm.org/doi/10.1145/3772318.3790594
- Version PDF del mismo paper: https://www.dfki.de/fileadmin/user_upload/import/17004_chi26-326.pdf
