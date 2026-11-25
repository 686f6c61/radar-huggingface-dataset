# paulosantiago/vaila-ai-tracker

## Resumen

vaila AI Track network es un conjunto de pesos publicados en Hugging Face bajo el identificador `paulosantiago/vaila-ai-tracker` por el autor paulosantiago. No se trata de un modelo de lenguaje ni de un modelo fundacional generativo, sino de un conjunto de discriminadores de imagen de pequeno tamano (y, cuando corresponde, backbones afinados) que utiliza la herramienta AI Track del editor de video con marcado por pixeles `getpixelvideo`, integrado en vaila, la caja de herramientas multimodal de codigo abierto para analisis biomecanico. El problema que resuelve es el seguimiento de un punto marcado manualmente por el usuario sobre fotogramas de video: el discriminador puntua parches de imagen alrededor de la posicion previa como "marcador" o "fondo".

El artefacto principal listado es `discriminators/discriminator_default__resnet50-11ad3fa6.npz`, con clave de caracteristica `resnet50-11ad3fa6`, 2856 valores por muestra y 600 muestras de entrenamiento, y requiere los pesos oficiales de ImageNet de `resnet50` (sha256 `11ad3fa62ca79e40addfd354a8ec4b7c75143b3038b8d2a807fbc68deab379ca`), que vaila descarga en el primer uso profundo. El repositorio tiene un tamano de 0.0 GB, 0 descargas y 0 likes en el momento de la consulta, y no declara pipeline ni idiomas.

Su relevancia es acotada y practica: permite anadir seguimiento asistido por red neuronal a un flujo de marcado manual en vaila sin depender de un modelo grande, manteniendo el control humano sobre los puntos. La informacion disponible no incluye arquitectura de red mas alla del backbone de extraccion de caracteristicas, ni contexto, ni datos de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Discriminador de parches sobre caracteristicas; espacio de caracteristicas `resnet50-11ad3fa6` (808 valores artesanales de color y region + caracteristicas profundas de ResNet-50 con pesos ImageNet sha256 `11ad3fa6...`) |
| Parametros totales | no disponible (el artefacto es un `.npz` de 2856 valores y 600 muestras; no se declara el numero de parametros del discriminador) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision por parches, no secuencial) |
| Tipos de cuantizacion | no disponible (pesos en `.npz`; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.npz` (discriminador) y `.pth` para backbones afinados; los pesos ImageNet de `resnet50` se obtienen de torchvision en el primer uso |

## Arquitectura y entrenamiento

El sistema no es un transformer ni un modelo generativo. AI Track sigue un punto marcado a mano: dado un parche de imagen alrededor de la posicion previa del marcador, un discriminador binario lo clasifica como "marcador" o "fondo". El espacio de caracteristicas se define por una clave: `classic` corresponde a 808 valores artesanales de color y region; `<variant>-<sha8>` anade a esos 808 valores las caracteristicas profundas del backbone `<variant>` cuyos pesos tienen un sha256 que empieza por `<sha8>`. Un discriminador solo es valido con el backbone exacto con el que fue entrenado, de modo que el emparejamiento entre pesos y extractor es estricto y verificable por hash.

Los datos de entrenamiento son los marcadores colocados a mano por el propietario del repositorio en sus propios videos; los recortes de imagen usados para entrenar no se publican porque contienen personas. El artefacto documentado usa 600 muestras de entrenamiento y 2856 valores por muestra en el espacio `resnet50-11ad3fa6`. No se documentan tecnicas de aumento de datos, funcion de perdida, regimen de optimizacion ni procesos de RLHF/DPO, que no aplican a este tipo de modelo.

## Capacidades

- Clasificacion binaria de parches de imagen como "marcador" o "fondo" para seguimiento de puntos en video.
- Extraccion de caracteristicas combinada: 808 valores artesanales de color y region mas caracteristicas profundas de ResNet-50 con pesos ImageNet.
- Integracion con el editor de video `getpixelvideo` de vaila mediante el boton Net y la opcion de descarga desde Hugging Face o de carpeta local.
- Descarga y verificacion de integridad por sha256 a traves de `manifest.json` y del comando `uv run --no-sync python -m vaila.ai_tracker_hub pull`.
- Conservacion de archivos locales previos en una carpeta `history/` antes de reemplazarlos.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, agentes, capacidades multilingues ni modos de pensamiento.

## Casos de uso

- Seguimiento de marcadores en analisis biomecanico: el discriminador puntua parches alrededor de la posicion previa de un punto marcado a mano, lo que permite mantener la trayectoria de articulaciones o referencias anatomicas a lo largo de un video de movimiento.
- Marcado asistido en `getpixelvideo`: el usuario coloca el punto inicial y AI Track propone la posicion en fotogramas siguientes, reduciendo el trabajo manual en secuencias largas.
- Revision de trayectorias en estudios de marcha o gesto: al ser un seguimiento asistido y no automatico, encaja en flujos donde el investigador valida cada punto y corrige derivas.
- Procesamiento por lotes en local: la descarga desde Hugging Face o el uso de una carpeta local permite desplegar el mismo discriminador en varias estaciones de trabajo sin depender de servicios externos.
- Reproducibilidad de analisis: la verificacion por sha256 de `manifest.json` y el emparejamiento estricto discriminador-backbone permiten documentar exactamente que pesos se usaron en un estudio.
- Integracion en pipelines de vaila: el comando `python -m vaila.ai_tracker_hub pull` automatiza la obtencion de pesos en entornos reproducibles con `uv`.
- Seguimiento en footage similar al de entrenamiento: el modelo esta pensado para ayudar en grabaciones parecidas a las del autor y sirve como punto de partida antes de valorar un reentrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al apoyarse en ResNet-50 con pesos ImageNet y un discriminador de 2856 valores, la huella es la del backbone ResNet-50 mas el clasificador, muy por debajo de la de un modelo de lenguaje.
- GPU recomendadas: no disponible; cualquier GPU capaz de ejecutar ResNet-50 en inferencia es suficiente en principio, pero el autor no publica requisitos.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU consumer capaz de ejecutar ResNet-50, aunque no se documenta una lista concreta.
- Opciones de despliegue: vaila mediante `getpixelvideo` (boton Net) y el modulo `vaila.ai_tracker_hub`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vaila AI Track network | Discriminador de parches sobre ResNet-50 | no disponible | no aplica | AGPL-3.0 | Hugging Face (`paulosantiago/vaila-ai-tracker`) |
| ResNet-50 (torchvision, ImageNet) | Clasificador de imagen | ~25,6 M (cifra estandar de ResNet-50, no declarada en la ficha) | no aplica | BSD-3-Clause en torchvision | torchvision |
| Segment Anything (SAM) | Segmentacion promptable | no disponible | no aplica | Apache-2.0 (variantes) | Meta AI |
| OpenPose | Estimacion de pose multi-persona | no disponible | no aplica | no disponible | CMU Perceptual Computing Lab |

La comparativa es orientativa: vaila AI Track network no es un modelo de proposito general, sino un discriminador de seguimiento de un unico punto entrenado con datos privados de un usuario, por lo que la comparacion con modelos de segmentacion o de pose solo es valida a nivel de categoria de tarea.

## Limitaciones y advertencias

- Entrenado con pocos videos del trabajo de una sola persona: cabe esperar que ayude en footage similar y sea menos fiable en otros contextos.
- No sustituye la revision de los puntos seguidos; el autor indica explicitamente que no reemplaza la comprobacion manual.
- Un discriminador nunca se distribuye con un backbone distinto del que se entreno; usar el emparejamiento correcto es obligatorio y el emparejamiento se verifica por sha256.
- Los recortes de imagen de entrenamiento no se publican porque contienen personas, lo que impide auditar la composicion del dataset.
- Licencia AGPL-3.0: impone obligaciones de copyleft sobre obras derivadas y sobre el uso en red; conviene revisar el cumplimiento antes de integrarlo en productos propietarios.
- No se declaran idiomas, sesgos, tasas de alucinacion ni rendimiento medido; al no ser un modelo generativo, el riesgo de alucinacion no aplica, pero si el de deriva del seguimiento.
- El repositorio tiene 0 descargas y 0 likes y fue creado y actualizado en 2026-11-24, por lo que no hay evidencia de uso en produccion ni de validacion externa.

## Enlaces

- Hugging Face: https://huggingface.co/paulosantiago/vaila-ai-tracker
- Repositorio de vaila (referenciado en la model card): no disponible en la informacion proporcionada
- Paper: no disponible
- Blog o demo: no disponible
- Pesos ImageNet de ResNet-50 (torchvision): no disponible en la informacion proporcionada
