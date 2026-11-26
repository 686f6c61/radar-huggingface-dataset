# ruisv/rcdl-depth-anything-v2-small

## Resumen

`ruisv/rcdl-depth-anything-v2-small` es un paquete de pesos compilados en formato RKNN del modelo Depth-Anything-V2-Small (ViT-S con cabeza DPT) de Depth Anything, preparado para ejecutarse en la NPU de los SoC Rockchip RK3588 y RK3588S. El autor, ruisv, publica los binarios ya compilados con rknn-toolkit2 2.3.2 en int8, de modo que el usuario no necesita exportar a ONNX, calibrar ni disponer del toolkit: descarga el `.rknn` y lo carga directamente mediante RCDL, una biblioteca C++17/Python que gestiona NPU, RGA y VPU como un único pipeline de copia cero.

El modelo resuelve la estimación de profundidad monocular relativa (en realidad disparidad o profundidad inversa) en placas de bajo consumo, un escenario típico de robótica, visión embebida y domótica donde no hay GPU disponible. Se distribuyen dos variantes: una a 308×308 píxeles (28,3 MB) y otra a 518×518, el tamaño nativo de la red (31,9 MB). Ambas toman uint8 RGB en crudo, con la normalización ImageNet plegada dentro del grafo, y devuelven un mapa `[1, H, W]` de disparidad.

La relevancia actual es doble: por un lado, demuestra que un transformer de visión con atención cuadrática puede cuantizarse a int8 y ejecutarse en una NPU de gama media con una fidelidad alta frente al fp32 (Spearman 0,9951 en la variante pequeña); por otro, la elección del checkpoint Small responde a la licencia, ya que los pesos Base y Large de Depth-Anything-V2 son CC-BY-NC-4.0 y no permiten redistribución comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de visión (ViT-S encoder) con cabeza DPT para profundidad monocular |
| Parametros totales | no disponible (el checkpoint Small de Depth-Anything-V2 usa ViT-S, ~24,8 M de parámetros según el modelo base, dato no confirmado en la información proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 308×308 o 518×518) |
| Tipos de cuantizacion | int8 (compilado con rknn-toolkit2 2.3.2); referencia fp32 ONNX para comparación |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache-2.0 (código y pesos Small; los checkpoints Base y Large son CC-BY-NC-4.0 y no se incluyen) |
| Formato de pesos | `.rknn` (binario compilado para NPU Rockchip RK3588/RK3588S) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Depth-Anything-V2 en su variante Small: un encoder ViT-S que divide la imagen en parches (22×22 parches en la entrada de 308×308, 37×37 en la de 518×518) y una cabeza DPT que reconstruye un mapa denso de profundidad a partir de las características multi-escala. La salida es profundidad inversa relativa (disparidad), no distancia métrica; no existe una versión métrica de este modelo. La normalización con media y desviación típica de ImageNet está plegada dentro del grafo, de forma que la NPU acepta bytes RGB sin preprocesado.

Los detalles de entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF o DPO) no se detallan en la información proporcionada; corresponden al trabajo publicado por el equipo de Depth Anything y no al autor de esta compilación. La innovación técnica de este repositorio es la compilación: cuantización int8 de un transformer de visión para NPU Rockchip, con las interpolaciones `align_corners` de la cabeza DPT ejecutándose en CPU (fuera de la NPU) y el resto del grafo en la NPU. Según las mediciones del autor, la variante de 308×308 supera a la de 518×518 tanto en velocidad (330 ms frente a 963 ms por fotograma) como en fidelidad (Spearman 0,9951 frente a 0,9717), porque los parches más grandes y menos numerosos cuantizan mejor.

## Capacidades

- Estimación de profundidad monocular relativa a partir de una única imagen RGB.
- Salida como mapa de disparidad `[1, H, W]` donde un valor mayor indica mayor cercanía; opción `inverse=True` para convertir a profundidad relativa.
- Mapeo del mapa de profundidad de vuelta a las dimensiones de la imagen original (letterboxing gestionado por la API).
- Normalización por fotograma y coloreado del mapa para visualización (`depth_colorize`).
- Entrada uint8 RGB en crudo, con preprocesado de normalización integrado en el grafo.
- Ejecución en NPU Rockchip RK3588/RK3588S con reparto automático de las capas no soportadas a CPU.
- No soporta tool calling, agentes, texto, audio ni razonamiento multi-paso: es un modelo puramente visual.

## Casos de uso

- Navegación de robots móviles en interiores: el modelo genera un mapa de disparidad a 330 ms por fotograma en una RK3588S, suficiente para evitar obstáculos en un robot de bajo coste que no dispone de GPU ni de sensor LiDAR.
- Detección de obstáculos en drones o vehículos terrestres autónomos: la salida de profundidad relativa permite clasificar qué regiones del campo visual están más próximas y priorizar la frenada o el desvío.
- Reconstrucción 3D y fotogrametría ligera: combinando el mapa de disparidad con la imagen RGB se pueden generar nubes de puntos aproximadas para modelado de escenas en campo, sin infraestructura de servidor.
- Realce de vídeo y efectos de desenfoque selectivo (bokeh) en dispositivos empotrados: el mapa de profundidad por fotograma permite separar primer plano y fondo en tiempo casi real en una placa de bajo consumo.
- Domótica y cámaras inteligentes: estimación de presencia y distancia relativa de personas u objetos en una cámara IP basada en RK3588, con la inferencia ejecutándose localmente y sin enviar vídeo a la nube.
- Prototipado de visión en robótica educativa: al no requerir exportación a ONNX ni calibración, el binario `.rknn` se carga directamente con RCDL, lo que reduce el tiempo de puesta en marcha en laboratorios y cursos.
- Automatización industrial de bajo coste: inspección de presencia y orden de piezas en una cinta transportadora mediante profundidad relativa, con despliegue en placas RK3588 sin GPU dedicada.

## Benchmarks y rendimiento

Mediciones del autor sobre RK3588S (librknnrt 2.3.2, driver NPU 0.9.8, un núcleo NPU), comparadas contra el ONNX fp32 sin tocar sobre la misma entrada con letterboxing:

| Build | Fotograma → mapa | NPU / CPU | Coseno vs fp32 | Spearman | MAE normalizado |
|---|---|---|---|---|---|
| 518×518 | 963 ms | 681 / 252 ms | 0,9839 | 0,9717 | 0,080 |
| 308×308 | 330 ms | 142 / 108 ms | 0,9894 | 0,9951 | 0,059 |

No se han publicado resultados de benchmarks estándar (por ejemplo, en los conjuntos de evaluación del paper de Depth-Anything-V2) en la información disponible; las cifras anteriores son mediciones de fidelidad y latencia de la compilación, no de calidad absoluta del modelo.

## Requisitos de hardware

- Hardware objetivo: SoC Rockchip RK3588 o RK3588S con NPU (un núcleo NPU en las mediciones).
- Memoria: el repositorio ocupa 0,1 GB; los binarios son de 28,3 MB (308×308) y 31,9 MB (518×518), por lo que la huella de pesos es mínima y cabe holgadamente en la RAM compartida de la placa.
- No está pensado para GPU de escritorio (A100, H100, RTX 4090); el formato `.rknn` solo lo carga el runtime de Rockchip.
- Despliegue: runtime `librknnrt` 2.3.2 y driver NPU 0.9.8 o compatible, más la biblioteca RCDL (instalable vía conda desde el canal `mirrors.ruis.ai` en linux-aarch64). No se usa vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia medida: 330 ms por fotograma en la variante de 308×308 (142 ms en NPU, 108 ms en CPU) y 963 ms en la de 518×518 (681 ms en NPU, 252 ms en CPU).
- Throughput estimado: aproximadamente 3 fotogramas por segundo en la variante pequeña, según la latencia medida; no se proporcionan cifras de throughput con varios flujos.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Formato / hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rcdl-depth-anything-v2-small (este) | ViT-S (no confirmado en la ficha) | 308×308 o 518×518 | `.rknn` para NPU RK3588 | Apache-2.0 | Hugging Face |
| depth-anything/Depth-Anything-V2-Small (base) | ViT-S | 518×518 | safetensors / PyTorch, GPU o CPU | Apache-2.0 | Hugging Face |
| Depth-Anything-V2-Base | ViT-B | 518×518 | safetensors / PyTorch | CC-BY-NC-4.0 | Hugging Face |
| Depth-Anything-V2-Large | ViT-L | 518×518 | safetensors / PyTorch | CC-BY-NC-4.0 | Hugging Face |

La comparación relevante es con el checkpoint original Small: misma arquitectura y licencia, pero este paquete añade la compilación int8 para NPU y elimina la necesidad de exportar y calibrar. Frente a Base y Large, la diferencia principal es la licencia (Apache-2.0 frente a CC-BY-NC-4.0) y el tamaño, no la disponibilidad de pesos compilados para RK3588, que no se ofrece en la información disponible para esas variantes.

## Limitaciones y advertencias

- La salida es profundidad relativa (disparidad), no distancia métrica; no debe interpretarse como metros ni usarse para medición absoluta.
- La cuantización int8 preserva el orden de las profundidades, no sus valores; es necesario normalizar por fotograma para visualización (la API lo hace por defecto).
- El reparto NPU/CPU implica que parte del grafo (las interpolaciones `align_corners` de la cabeza DPT) se ejecuta en CPU, lo que limita la latencia mínima alcanzable.
- Solo se publica la variante Small por motivos de licencia; no hay builds comerciales de Base o Large en este repositorio.
- El modelo está atado al hardware Rockchip RK3588/RK3588S y a versiones concretas de runtime y driver (librknnrt 2.3.2, driver 0.9.8); otras versiones pueden requerir recompilación.
- No se han publicado evaluaciones de sesgo, robustez ante dominios no vistos ni tasas de alucinación o error en escenas adversas en la información disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente de las mediciones del autor.
- Uso comercial permitido por la licencia Apache-2.0 de los pesos Small y del código, pero conviene verificar los términos de RCDL (también Apache-2.0) y de las dependencias del sistema.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ruisv/rcdl-depth-anything-v2-small
- Repositorio RCDL: https://github.com/ruisv/rcdl
- Documentación de modelos de RCDL: https://github.com/ruisv/rcdl/blob/main/docs/MODELS.md
- Zoológico de modelos verificados de RCDL: https://github.com/ruisv/rcdl/tree/main/model_zoo
- Repositorio original de Depth-Anything-V2: https://github.com/DepthAnything/Depth-Anything-V2
- Checkpoint base en Hugging Face: https://huggingface.co/depth-anything/Depth-Anything-V2-Small
