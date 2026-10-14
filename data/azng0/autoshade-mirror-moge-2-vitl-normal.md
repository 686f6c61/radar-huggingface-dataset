# Azng0/autoshade-mirror-moge-2-vitl-normal

## Resumen

autoshade-mirror-moge-2-vitl-normal es un espejo (copia byte a byte) del archivo `model.pt` del repositorio `Ruicheng/moge-2-vitl-normal`, publicado por el usuario Azng0 bajo licencia MIT. No es un modelo nuevo ni un ajuste fino: es una replica exacta del peso original, con revision `cb0e8bbd6b1e243589717c78e750b1ba4c093acf`, sha256 `280741fd09bc3f403ccff9967784c2a391b52d2c0742ae3efdb21d9f90cc1a01` y un tamano de 1.323.815.904 bytes (~1,32 GB). El objetivo declarado por el autor es garantizar que la funcion de desenfoque de lente con IA (AI lens blur) de AutoShade siga funcionando aunque el repositorio original se mueva o desaparezca.

MoGe es una familia de modelos de estimacion de geometria monocular desarrollada por Microsoft. La variante `vitl-normal` emplea un backbone ViT-L (el codigo del backbone DINOv2 se distribuye bajo Apache-2.0, segun la propia model card) y esta orientada a la estimacion de normales de superficie. El repositorio se creo y actualizo el 14 de octubre de 2026, no tiene descargas ni likes, y ocupa 1,3 GB.

Su relevancia es practica mas que cientifica: sirve como dependencia estable para aplicaciones que consumen el peso de MoGe (en este caso, AutoShade) y como ejemplo de patron de espejado de modelos de vision para evitar roturas por cambios en el repositorio upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo ViT-L con backbone DINOv2, orientado a estimacion de geometria y normales monocular |
| Parametros totales | no disponible (el archivo de pesos ocupa 1,32 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible (solo se distribuye el peso original en `.pt`) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | MIT (el codigo del backbone DINOv2 bajo Apache-2.0) |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

La model card indica que se trata de una copia del peso de `Ruicheng/moge-2-vitl-normal`, de Microsoft, y que el codigo del backbone DINOv2 incluido en el repositorio original esta bajo Apache-2.0. El nombre de la variante (`vitl-normal`) apunta a un backbone ViT-L y a una salida de normales de superficie. No se aportan en la informacion disponible detalles sobre el numero exacto de parametros, la composicion del dataset de entrenamiento, el numero de tokens o imagenes vistas, ni si hubo etapas de ajuste con RLHF/DPO (no aplicables en un modelo de vision de este tipo).

Tampoco se documentan innovaciones tecnicas concretas (por ejemplo, estrategias de atencion, decodificacion o cabezas de prediccion) en la informacion proporcionada. Cualquier descripcion detallada de la arquitectura interna de MoGe-2 deberia consultarse en el repositorio upstream y en la publicacion asociada de Microsoft: no disponible en los datos facilitados.

## Capacidades

- Estimacion de geometria monocular a partir de imagenes RGB (mapas de puntos y profundidad propios de la familia MoGe).
- Estimacion de normales de superficie, segun se deduce del sufijo `normal` de la variante.
- Procesamiento de imagen como unica modalidad de entrada; no acepta texto.
- No dispone de generacion de texto, razonamiento, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Sin capacidades multilingues.
- No dispone de modo de razonamiento (thinking mode); no hay soporte de audio.

## Casos de uso

- Desenfoque de lente con IA (AI lens blur): es el caso de uso explicito del espejo; la aplicacion AutoShade usa la estimacion de profundidad/normales para generar un desenfoque de fondo fisicamente plausible a partir de una sola imagen.
- Profundidad de campo sintetica en fotografia movil: el modelo permite separar sujeto y fondo sin necesidad de una segunda camara ni de sensores de profundidad dedicados.
- Reconstruccion 3D monocular: la estimacion de geometria permite generar mallas o nubes de puntos aproximadas a partir de una sola fotografia, util para escaneo rapido de objetos.
- Relighting e iluminacion coherente: las normales de superficie permiten recalcular la iluminacion de una escena en post-produccion de imagen o video.
- Realidad aumentada: colocar objetos virtuales con oclusion y sombreado correctos apoyandose en el mapa de profundidad estimado.
- Robotica y navegacion: estimacion de profundidad para deteccion de obstaculos y planificacion de movimiento con hardware de vision sencillo.
- Modelado para videojuegos y VFX: generacion de geometria base y mapas de normales para texturizado posterior en pipelines de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del espejo no incluye metricas, y los resultados de busqueda web facilitados no contienen datos tecnicos relevantes sobre el modelo (consisten en paginas de ayuda de Google Docs y consultas sin relacion con MoGe).

## Requisitos de hardware

- Peso del modelo: 1,32 GB en el formato original `.pt` (asumiendo una precision de 32 bits, equivale a del orden de 300-330 M de parametros).
- VRAM estimada para inferencia: no disponible de forma oficial. De forma orientativa, un modelo de este tamano suele requerir del orden de 2 a 4 GB de VRAM con una imagen de entrada, sin contar el consumo de memoria de las activaciones segun la resolucion.
- Cabe en GPU de consumo: si, cabe con holgura en tarjetas como RTX 3060 (12 GB), RTX 4070 o RTX 4090. En el caso de GPUs con poca VRAM (por ejemplo, 4-6 GB) puede ser necesario reducir la resolucion de entrada.
- GPU recomendadas: no disponible. Cualquier GPU moderna con al menos 4-6 GB de VRAM deberia ser suficiente.
- Opciones de despliegue: PyTorch (carga directa del `.pt`). vLLM, llama.cpp, Ollama y TGI no aplican, ya que no se trata de un modelo de lenguaje. Es posible exportar a ONNX u otros formatos, pero no se documenta en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Relacion | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Azng0/autoshade-mirror-moge-2-vitl-normal | Espejo exacto (objeto de esta ficha) | no disponible (1,32 GB) | no aplica | MIT | HuggingFace (Azng0) |
| Ruicheng/moge-2-vitl-normal | Original upstream del que se copia el peso | no disponible | no aplica | MIT | HuggingFace (Ruicheng) |
| Otras variantes de la familia MoGe-2 | Misma familia, distinto tamano de backbone | no disponible | no aplica | MIT | HuggingFace (Ruicheng) |

No se dispone de datos de rendimiento, parametros ni contexto para establecer comparaciones cuantitativas con alternativas de estimacion de geometria monocular de otros autores; estos datos figuran como no disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Es una copia, no el modelo original: no recibe mantenimiento, mejoras ni correcciones por parte de Azng0. Si el repositorio upstream cambia, este espejo no se actualiza automaticamente.
- Riesgo de divergencia: al fijar una revision concreta, cualquier mejora futura del modelo original no llegara a este repositorio.
- Licencia: la model card declara MIT para el repositorio, pero el codigo del backbone DINOv2 incluido en el original esta bajo Apache-2.0. Conviene revisar ambos textos de licencia antes de un uso comercial.
- Modelo exclusivamente de vision: no procesa texto, no soporta instrucciones en lenguaje natural ni funciones de herramienta.
- Alucinacion geometrica: la estimacion de profundidad y normales a partir de una sola imagen es intrinsecamente ambigua en superficies transparentes, reflectantes o con texturas repetitivas. No se proporcionan en la informacion disponible tasas de error ni evaluaciones que cuantifiquen este comportamiento.
- Sin datos de sesgo, idioma ni evaluacion de robustez: no disponibles.
- Para produccion: al no haber benchmarks publicados en la informacion disponible, se recomienda validar el modelo con datos propios antes de integrarlo en un flujo critico.
- Los resultados de busqueda web facilitados no aportan informacion tecnica sobre el modelo y no deben usarse como referencia.

## Enlaces

- Repositorio del espejo en HuggingFace: https://huggingface.co/Azng0/autoshade-mirror-moge-2-vitl-normal
- Repositorio upstream original: https://huggingface.co/Ruicheng/moge-2-vitl-normal
- Revision fijada del peso original: `cb0e8bbd6b1e243589717c78e750b1ba4c093acf`
- Hash sha256 del peso: `280741fd09bc3f403ccff9967784c2a391b52d2c0742ae3efdb21d9f90cc1a01`
- No se han encontrado otros enlaces relevantes (paper, blog o repositorio) en la busqueda web proporcionada.
