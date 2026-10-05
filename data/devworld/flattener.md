# DevWorld/flattener

## Resumen

Flattener es un paquete de tres modelos de vision por computador desarrollado por DevWorld que convierte fotografias de documentos y libros abiertos en escaneos planos y enderezados. Forma parte del proyecto Flattener 1.0.0 y se distribuye bajo licencia Apache-2.0 desde HuggingFace. No es un modelo de lenguaje, sino un sistema de imagen a imagen (pipeline `image-to-image`) orientado al preprocesado documental.

El bundle incluye tres checkpoints PyTorch (`dewarp.pt`, `gate.pt` y `orient.pt`) mas un fichero `bundle.json` que permite cargarlos conjuntamente: uno detecta la region de la pagina, otro corrige la perspectiva y la curvatura, y el tercero predice la orientacion del texto. Todo el procesamiento se ejecuta en local, sin depender de servicios en la nube.

Su relevancia actual reside en la digitalizacion de documentos y en el preprocesado de pipelines de OCR: corregir la deformacion geometrica de la foto de una pagina es un paso critico antes del reconocimiento optico de caracteres. El entrenamiento se realizo desde cero con renders sinteticos y capturas de datasets publicos, e incluye documentos generados en ingles y coreano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se distribuyen tres checkpoints PyTorch: deteccion de pagina, dewarping y orientacion) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen a imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) y coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`.pt`) mas `bundle.json` |
| Tarea (pipeline) | image-to-image |
| Componentes | `dewarp.pt`, `gate.pt`, `orient.pt`, `bundle.json` |
| Version | 1.0.0 |
| Tamano del repositorio | 0,0 GB (segun HuggingFace) |
| Fecha de publicacion | 2026-10-05 |

## Arquitectura y entrenamiento

Los modelos se entrenaron desde cero usando renders de SyntheticDoc, capturas del paper de UVDoc, fotogramas de SmartDoc y paginas generadas. El modelo de dewarping combina (blend) un checkpoint de pagina limpia con otro entrenado con pliegues y arrugas adicionales, lo que sugiere una estrategia de especializacion sobre casos mas dificiles. Los modelos de deteccion de pagina y de orientacion incorporan documentos generados en coreano e ingles.

El checkpoint de orientacion incluye su temperatura calibrada, es decir, la salida del clasificador de orientacion esta calibrada probabilisticamente. Los checkpoints contienen unicamente pesos de inferencia y ajustes del modelo. No se especifican en la informacion disponible el tipo de red (CNN, transformer u otra), el numero de parametros, el volumen total de datos de entrenamiento ni si se emplearon tecnicas de ajuste como RLHF o DPO (no aplicables habitualmente a este tipo de tareas).

## Capacidades

- Deteccion de la region de la pagina (`gate.pt`): localiza el area util del documento dentro de la fotografia.
- Correccion de perspectiva y curvatura (`dewarp.pt`): endereza paginas inclinadas y superficies curvas, incluidos pliegues y arrugas.
- Prediccion de orientacion del texto (`orient.pt`): determina la orientacion correcta de la pagina con temperatura calibrada.
- Procesamiento totalmente local, sin llamadas a servicios externos.
- Carga conjunta de los tres modelos mediante `bundle.json`.
- Notificacion de condiciones problematicas (paginas cortadas, oclusion, baja resolucion, orientacion incierta).
- Soporte de ajustes manuales de pagina y de orientacion cuando la deteccion automatica no es fiable.
- Exportacion a navegador mediante las herramientas del repositorio fuente.
- Idiomas de trabajo en los datos de entrenamiento: ingles y coreano.
- No ofrece generacion de texto, tool calling, function calling ni capacidades de agente.

## Casos de uso

- Digitalizacion de libros y bibliotecas: fotografiar libros abiertos pagina a pagina y obtener escaneos planos y enderezados, corrigiendo la curvatura del lomo y la perspectiva sin necesidad de un escaner plano.
- Preprocesado para OCR: usar `dewarp.pt` y `orient.pt` antes de un motor de OCR para reducir errores de reconocimiento causados por la deformacion geometrica y la orientacion incorrecta de la pagina.
- Escaneo movil sin conexion: la inferencia se ejecuta en local y el bundle se reutiliza desde la cache de HuggingFace, incluso offline, lo que permite integraciones en aplicaciones moviles sin acceso a red.
- Archivado documental empresarial: procesar lotes de fotografias de contratos, facturas o expedientes para normalizar la imagen antes de almacenarla o indexarla.
- Digitalizacion de documentos en coreano: los modelos de deteccion de pagina y orientacion se entrenaron con documentos generados en coreano, lo que resulta util para fondos documentales en ese idioma.
- Documentos con pliegues o arrugas: el blend del checkpoint de dewarping con uno entrenado en pliegues y arrugas adicionales esta pensado para paginas fisicamente deterioradas, como correspondencia doblada o mapas.
- Integracion en pipelines de captura por lotes: el CLI (`flattener.scan photo.jpg --out scans`) permite automatizar el procesado de directorios de imagenes dentro de flujos de trabajo de digitalizacion.
- Edicion y revision asistida: cuando la deteccion automatica falla, el escaner reporta la condicion y admite correcciones manuales de pagina y orientacion antes de exportar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (por ejemplo, error de dewarping, precision de deteccion de pagina o exactitud de orientacion) ni comparativas numericas con otros sistemas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible. La model card solo indica que el procesamiento se ejecuta en local.
- Opciones de despliegue: libreria propia `flattener` (checkout del repositorio fuente, `uv sync --python 3.12` y `uv run python -m flattener.scan`), descarga de pesos via `hf download DevWorld/flattener ... --local-dir models` y carga con `--bundle models/bundle.json`. El repositorio fuente incluye herramientas de exportacion a navegador.
- Latencia y throughput: no disponible.
- Nota de despliegue: el primer escaneo descarga el bundle en la revision `1.0.0`; los posteriores reutilizan la cache local de HuggingFace, lo que permite funcionamiento offline.

## Comparativa con modelos similares

No se proporciona informacion sobre modelos comparables en el material disponible. La model card menciona UVDoc (paper) y SmartDoc como fuentes de datos de entrenamiento, no como baselines de comparacion, y no se aportan especificaciones de ninguno de ellos. Por tanto, la comparativa de parametros, contexto, rendimiento, licencia y disponibilidad figura como no disponible.

## Limitaciones y advertencias

- Paginas cortadas por la fotografia: pueden producir escaneos incompletos.
- Oclusion fuerte: objetos o manos que tapen parte del documento degradan el resultado.
- Texto de baja resolucion: puede provocar escaneos incompletos u orientacion incierta.
- En los casos anteriores el escaner reporta la condicion y exige o permite ajustes manuales; no garantiza una correccion automatica correcta.
- Sesgo de dominio: el entrenamiento se baso en SyntheticDoc, UVDoc, SmartDoc y paginas generadas, con enfasis en ingles y coreano; otros idiomas o tipografias no estan cubiertos por los datos declarados.
- Ausencia de metricas publicadas: no hay benchmarks que permitan estimar la precision real en produccion.
- Sin datos de hardware ni de latencia, por lo que no es posible dimensionar el despliegue con la informacion disponible.
- Licencia Apache-2.0: permite uso comercial, modificacion y redistribucion, siempre que se conserven los avisos de licencia y copyright correspondientes.
- Fecha de publicacion registrada como 2026-10-05 y tamano de repositorio reportado como 0,0 GB; conviene verificar el contenido real del repositorio antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DevWorld/flattener
- Repositorio fuente (Flattener): https://github.com/deveworld/flattener
