# changh95/moge-2-p150

## Resumen

MoGe-2 p150 es un paquete de despliegue del modelo MoGe-2 ViT-L con cabeza de normales, desarrollado originalmente por Microsoft Research y derivado del checkpoint `Ruicheng/moge-2-vitl-normal`. Resuelve el problema de la reconstruccion de geometria monoculo a partir de una sola imagen RGB: devuelve un mapa de puntos metrico en espacio de camara, profundidad metrica, normales de superficie unitarias, una mascara de validez y los parametros intrinsecos de camara (distancia focal y campo de vision) estimados a partir de la imagen. Es relevante porque combina escala metrica real con detalle geometrico fino, algo que los modelos de profundidad relativos no ofrecen.

La arquitectura combina un codificador DINOv2 ViT-L/14 de 309M parametros con un cuello convolucional y cuatro cabezas de prediccion (mapa de puntos, normales, mascara de validez y escala metrica), sumando 331M parametros totales. La imagen se coloca en un lienzo fijo de 1920x1080, lo que produce 1800 tokens de ViT con una rejilla de 32x57.

Este repositorio concreto no contiene pesos nuevos: empaqueta los pesos originales sin modificar para ejecutarlos sobre hardware Tenstorrent p150 mediante `tt-model-manager`. La inferencia de la red corre en el chip, mientras que la decodificacion de imagen, el ajuste al lienzo, la recuperacion de distancia focal y el reescalado se ejecutan en la CPU del host.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv2 ViT-L/14 (309M) + cuello convolucional + 4 cabezas (mapa de puntos, normales, mascara de validez, escala metrica) |
| Parametros totales | 331M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; entrada de una imagen en lienzo fijo 1920x1080 (1800 tokens ViT, rejilla 32x57) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, no linguistico) |
| Licencia | MIT |
| Formato de pesos | pesos originales de `Ruicheng/moge-2-vitl-normal` (revision `cb0e8bbd6b1e243589717c78e750b1ba4c093acf`), descargados al cache de HF; imagen Docker para el servidor; tamano del repo 9.8 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura MoGe-2: un codificador DINOv2 ViT-L/14 que extrae caracteristicas de la imagen, un cuello convolucional que las proyecta y cuatro cabezas que predicen en paralelo el mapa de puntos metrico en espacio de camara, las normales de superficie unitarias, la mascara de validez y la escala metrica. La imagen de entrada se ajusta a un lienzo canonico de 1920x1080 con relleno (letterbox) por defecto o estiramiento, generando 1800 tokens con una rejilla de 32x57. La red estima ademas la distancia focal y el campo de vision a partir de la propia imagen, y opcionalmente acepta un `fov_x` conocido para estimar solo el desplazamiento de profundidad.

Los detalles de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO) no estan disponibles en la informacion proporcionada; la model card remite a la model card original y al repositorio `microsoft/MoGe` y al paper arXiv:2507.02546. Este repositorio en particular no modifica los pesos: solo los empaqueta para ejecucion en Tenstorrent p150 con `tt-model-manager` 0.1.0 (esquema de manifiesto 5.1), con compilacion de kernels en el primer arranque que tarda varios minutos.

## Capacidades

- Estimacion de profundidad metrica a partir de una sola imagen RGB.
- Generacion de mapas de puntos 3D metricos en espacio de camara.
- Prediccion de normales de superficie unitarias.
- Mascara de validez para descartar pixeles no fiables (por defecto, profundidad y puntos a `inf` y normal cero en pixeles invalidos).
- Estimacion de intrinsecos de camara: distancia focal y campo de vision horizontal y vertical en grados.
- Aceptacion opcional de `fov_x` conocido (entre 1 y 179 grados) para mejorar la estimacion del desplazamiento de profundidad.
- Multiples formatos de salida: `npz` en base64 dentro del JSON, `npz_binary` como cuerpo de respuesta con metadatos en la cabecera `X-MoGe-Meta`, PNG de profundidad de 16 bits y normales y mascara de 8 bits, o JSON anidado para imagenes de hasta 512x512.
- Ajuste configurable al lienzo: `pad` (letterbox, preserva relacion de aspecto) o `stretch`.
- Reproyeccion opcional de los puntos a partir de la profundidad y los intrinsecos (`force_projection`).
- Servidor HTTP propio con `POST /predict`, `GET /health` y `GET /info`; `GET /v1/models` es un stub y no hay API compatible con OpenAI Chat.
- No soporta tool calling, agentes, razonamiento multi-turno ni capacidades linguisticas o de audio.

## Casos de uso

- Anotacion de datasets de vision: procesar lotes de imagenes para generar profundidad metrica y normales como etiquetas o pseudoetiquetas en pipelines de entrenamiento de modelos 3D, aprovechando la escala metrica real.
- Previsualizacion de escenas 3D: convertir una foto en un mapa de puntos con intrinsecos estimados para generar vistas preliminares de reconstruccion antes de un pipeline fotogrametrico completo.
- Robotica y navegacion: obtener profundidad metrica y campo de vision de una camara monocular para planificacion de movimiento o evitacion de obstaculos en prototipos de investigacion.
- Realidad aumentada: estimar normales de superficie y profundidad para colocar objetos virtuales con orientacion coherente sobre superficies reales.
- Analisis offline de imagenes aereas o de interiores: medir distancias y geometria de escena con la mascara de validez para filtrar regiones poco fiables.
- Evaluacion de hardware Tenstorrent: servir el modelo en p150 como banco de pruebas de despliegue de modelos de vision en aceleradores no GPU, con endpoint HTTP propio.
- Extraccion de intrinsecos de camara: recuperar distancia focal y FOV de imagenes sin metadatos EXIF para calibrar reconstrucciones posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Acelerador Tenstorrent p150 obligatorio (malla `P150`); no se contempla ejecucion en GPU en este paquete.
- CPU host x86-64 con AVX2 y FMA (x86-64-v3) para las velocidades del lado host indicadas por el autor; en otras CPU el servidor usa una ruta mas lenta.
- Docker y la CLI de Tenstorrent (`tt`), instalable con `uv tool install tenstorrent`, o bien `tt-model` directamente.
- Primer arranque con compilacion de kernels para el dispositivo, que tarda varios minutos.
- Tamano del repositorio: 9.8 GB; los pesos se descargan aparte al cache de Hugging Face.
- Respuesta densa de aproximadamente 39 MB en `.npz` para una imagen de 1920x1080.
- Latencia y throughput: no disponibles.
- No cabe en GPU de consumo: requiere hardware Tenstorrent p150.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Salidas | Licencia | Hardware |
|---|---|---|---|---|---|
| MoGe-2 p150 (este) | 331M | 1 imagen RGB, lienzo 1920x1080 | Puntos metricos, profundidad, normales, mascara, intrinsecos | MIT | Tenstorrent p150 |
| Ruicheng/moge-2-vitl-normal | 331M | 1 imagen RGB | Puntos metricos, profundidad, normales, mascara, intrinsecos | MIT | GPU convencional |
| Alternativas de estimacion de profundidad monoculo | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo puramente de vision: no genera texto, no soporta chat, tool calling ni razonamiento multi-turno; `GET /v1/models` es un stub.
- Dependencia de hardware especifico: solo funciona en Tenstorrent p150, lo que limita portabilidad y despliegue en infraestructura GPU convencional.
- La primera ejecucion requiere compilar kernels, con varios minutos de espera.
- La salida JSON anidada solo es valida para imagenes de hasta 512x512; para resoluciones mayores hay que usar `npz` o `npz_binary`.
- Limites de entrada: imagenes de al menos 8x8 pixeles y como maximo 32 MB.
- La estimacion de intrinsecos y escala metrica puede degradarse en escenas sin referencias de escala o con geometria ambigua; la mascara de validez debe usarse para filtrar pixeles no fiables.
- Riesgo de artefactos en bordes, superficies reflectantes o transparentes, comun en modelos de geometria monoculo.
- Sesgos: no disponibles en la informacion proporcionada.
- Licencia MIT: permite uso comercial, pero conviene revisar la licencia del modelo base y del codigo `microsoft/MoGe`.
- El paquete no incluye los pesos en la imagen Docker; requiere acceso a Hugging Face y cache local.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/changh95/moge-2-p150
- Modelo base: https://huggingface.co/Ruicheng/moge-2-vitl-normal
- Paper MoGe-2: https://arxiv.org/abs/2507.02546
- Repositorio de codigo: https://github.com/microsoft/MoGe
- tt-model-manager: https://github.com/tenstorrent/tt-model-manager
- Requisitos de la CLI de Tenstorrent: https://github.com/tenstorrent/tt-cli/blob/main/docs/prerequisites.md
- Imagen de ejemplo: https://huggingface.co/changh95/moge-2-p150/resolve/main/media/source.png
