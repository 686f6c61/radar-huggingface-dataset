# SeokjunChoi/snapshot-polarimetric-dir

## Resumen

`SeokjunChoi/snapshot-polarimetric-dir` es el repositorio de pesos preentrenados y capturas de ejemplo del trabajo "Snapshot Polarimetric Display Inverse Rendering", publicado en ACM Transactions on Graphics 45(6) (Proceedings de SIGGRAPH Asia 2026). No es un modelo de lenguaje ni un modelo generativo de propósito general: es un checkpoint de rendering inverso que reconstruye escenas a partir de capturas polarimétricas de una pantalla, es decir, resuelve el problema inverso de estimar propiedades de la escena a partir de la luz polarizada emitida y observada.

El repositorio lo mantiene Seokjun Choi y está firmado junto a Yunseong Moon, Kaizhang Kang, Hoon-Gyu Chung, Jin-Nyeong Kim, Giljoo Nam y Seung-Hwan Baek. Contiene un único checkpoint (`pdir_best.ckpt`, 329 MB, paso 14 250) entrenado de forma conjunta con datos sintéticos y reales, más cinco capturas reales de ejemplo (`cat`, `bowl`, `case`, `foil`, `owl`) empaquetadas en `sample_data.tar.gz` (26 MB). El repositorio completo ocupa 0,4 GB.

Su relevancia es acotada pero clara: pone a disposición de la comunidad de fotografía computacional un modelo reproducible de un método de SIGGRAPH Asia 2026, con el código en GitHub y datos de entrada reales para verificar la inferencia. La model card no especifica arquitectura, número de parámetros ni resultados de benchmarks, por lo que la ficha se limita a lo verificable en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no se especifica en la model card) |
| Parámetros totales | no disponible (el checkpoint ocupa 329 MB, pero no se indica el recuento) |
| Parámetros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no aplica (modelo de rendering inverso, no procesa secuencias de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica |
| Licencia | CC BY 4.0 |
| Formato de pesos | checkpoint de PyTorch (`.ckpt`), fichero `pdir_best.ckpt` |
| Tarea | rendering inverso polarimétrico de pantallas (snapshot polarimetric display inverse rendering) |
| Entradas por escena | `mask.png` y 12 ficheros `.npy` (`quad{0,1,2,3}_main_hdr_{s0,s1,s2}.npy`) con vectores de Stokes por cuadrante |
| Forma de las entradas | `[384, 384, 3]`, float32 |
| Resolución de trabajo | 384 × 384 píxeles por cuadrante |
| Normalización obligatoria | `--exposure-norm p95_0.95` (normalización HDR por escena) |
| Otros parámetros de inferencia | `--pattern-color-strength 1.0` (valor por defecto) |
| Paso del checkpoint | 14 250 |
| Tamaño del repositorio | 0,4 GB (329 MB de pesos + 26 MB de datos de ejemplo) |
| Fecha de creación / actualización | 15 de septiembre de 2026 (ambas) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información proporcionada no describe la arquitectura de red empleada (no se indica si es una CNN, un transformer, un modelo basado en campos de radiancia o una combinación). Lo que sí se documenta es el contrato de entrada y salida del sistema: el modelo consume, por cada escena, una máscara y doce tensores de vectores de Stokes organizados en cuatro cuadrantes (`quad0` a `quad3`) y tres exposiciones o canales (`s0`, `s1`, `s2`), cada uno de forma `[384, 384, 3]` en float32. Esta organización por cuadrantes es coherente con una captura polarimétrica de tipo snapshot, en la que un sensor con división espacial registra simultáneamente varias orientaciones de polarizador.

En cuanto al entrenamiento, la model card indica únicamente que `pdir_best.ckpt` es un checkpoint conjunto de datos sintéticos y reales, capturado en el paso 14 250, y que fue entrenado con una normalización HDR por escena concreta (`p95_0.95`) y con `pattern-color-strength` a 1.0. No se especifica el volumen de tokens o muestras, la composición del dataset, ni si se emplearon técnicas de ajuste como RLHF o DPO (que, por otra parte, no son habituales en este dominio). Tampoco se detallan innovaciones técnicas adicionales más allá de lo que sugiere el propio título del paper (captura snapshot y pantalla polarimétrica como fuente de iluminación).

## Capacidades

- Rendering inverso polarimétrico: estima parámetros de la escena a partir de observaciones polarimétricas de la luz emitida por una pantalla.
- Procesamiento de vectores de Stokes: consume representaciones `s0`, `s1`, `s2` por cuadrante, en lugar de imágenes RGB convencionales.
- Manejo de máscara de escena: usa `mask.png` para delimitar la región válida de la captura.
- Normalización HDR por escena: integra el esquema `p95_0.95` como parte del preprocesado obligatorio.
- Transferencia sintético-real: el checkpoint se entrenó conjuntamente con datos sintéticos y reales, lo que apunta a cierta capacidad de generalización a capturas reales.
- Inferencia sobre hardware de captura snapshot: asume la geometría de cuatro cuadrantes documentada en los datos de ejemplo.

No dispone de ninguna de las capacidades asociadas a modelos de lenguaje: no genera texto, no soporta tool calling ni function calling, no implementa agentes ni razonamiento multi-paso, no tiene capacidades multilingües y no ofrece modo de "pensamiento", visión general, audio ni ninguna otra modalidad fuera de la polarimétrica descrita.

## Casos de uso

- Validación de resultados del paper: ejecutar `inference.py` sobre las cinco capturas de ejemplo (`cat`, `bowl`, `case`, `foil`, `owl`) con la normalización `p95_0.95` para reproducir las figuras y métricas publicadas en ACM TOG 45(6).
- Investigación en fotografía computacional: usar el checkpoint como referencia o línea base en experimentos de rendering inverso polarimétrico, comparando nuevas propuestas contra un modelo publicado en SIGGRAPH Asia 2026.
- Reconstrucción de propiedades de materiales: aplicar el modelo a capturas polarimétricas de objetos con distintos acabados (papel de aluminio, cerámica, etc., como sugieren los nombres `foil` y `bowl`) para estimar parámetros de superficie.
- Caracterización de pantallas polarimétricas: emplear el pipeline para evaluar cómo se comporta una pantalla que emite patrones de polarización controlados, controlando `pattern-color-strength`.
- Adaptación a un nuevo montaje de captura: partir del checkpoint y del código de PDIR para reentrenar o fine-tuning sobre un sensor polarimétrico propio que produzca la misma estructura de cuatro cuadrantes y tres canales de Stokes.
- Docencia y reproducibilidad: usar los datos de ejemplo (26 MB) y el comando documentado como práctica reproducible en cursos de gráficos por computador o visión por computador, con un coste de almacenamiento mínimo.
- Integración en pipelines de adquisición: incorporar el modelo en un flujo que capture HDR, aplique la normalización por percentil 95 y genere resultados de rendering inverso de forma automatizada sobre lotes de escenas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de métricas (PSNR, SSIM, LPIPS u otras habituales en rendering inverso), ni comparaciones numéricas con métodos previos. El paper enlazado presumiblemente las contiene, pero no forman parte de los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia, el checkpoint ocupa 329 MB, de modo que el peso de los parámetros en memoria es de aproximadamente 0,33 GB en fp32; los tensores de entrada por escena son doce arrays de `[384, 384, 3]` float32, unos 21 MB en total. La huella real depende de la arquitectura, que no se especifica.
- GPU recomendadas: no disponibles. Con el tamaño de checkpoint indicado, cualquier GPU con suficiente memoria libre para los pesos y las activaciones del forward pass debería bastar, pero no hay cifras publicadas.
- Viabilidad en GPU de consumo: muy probablemente sí (el checkpoint es de 329 MB y la resolución de trabajo es 384 × 384), si bien se trata de una inferencia razonada a partir del tamaño de los ficheros y no de un requisito documentado por los autores.
- Opciones de despliegue: el repositorio oficial proporciona un script `inference.py` sobre PyTorch, con `requirements.txt` y un `download_assets.py`. No se documentan integraciones con vLLM, llama.cpp, Ollama, TGI ni servidores de inferencia equivalentes; esos motores están orientados a modelos de lenguaje y no aplican aquí.
- Latencia y throughput: no disponibles. No se publican tiempos de inferencia ni rendimiento por escena.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos alternativos comparables, ni datos de rendimiento frente a otros métodos de rendering inverso polarimétrico. La comparación con trabajos previos corresponde al paper, cuyos resultados no forman parte de este material.

## Limitaciones y advertencias

- No es un modelo de lenguaje. Cualquier expectativa de generación de texto, código, tool calling o comportamiento de agente es inaplicable.
- Dependencia estricta del preprocesado: el checkpoint exige `--exposure-norm p95_0.95` por escena y `--pattern-color-strength 1.0`. Los propios autores advierten de que la inferencia debe coincidir con la normalización usada en entrenamiento; desviarse invalida los resultados.
- Entradas no convencionales: requiere capturas polarimétricas con cuatro cuadrantes y tres canales de Stokes. No puede alimentarse con imágenes RGB estándar.
- Resolución fija: los datos de ejemplo son de 384 × 384 por cuadrante; no se documenta comportamiento con otras resoluciones.
- Sesgo de dominio: al ser un modelo entrenado para un montaje concreto (pantalla polarimétrica y cámara snapshot), su generalización a otros montajes de iluminación, sensores o materiales no está garantizada.
- Ausencia de métricas: al no publicarse benchmarks en la información disponible, no es posible estimar cuantitativamente la calidad de la reconstrucción ni el error esperado.
- Base de ejemplos muy reducida: solo cinco capturas reales, lo que limita la validación práctica.
- Licencia: CC BY 4.0 permite uso comercial y modificación siempre que se atribuya la autoría y se indique si hubo cambios. Es una licencia permisiva, sin cláusulas de uso restringido, pero exige cumplir la atribución.
- Madurez del repositorio: 0 descargas y 0 likes, y creación y última actualización en el mismo día (15 de septiembre de 2026), lo que sugiere una publicación reciente sin validación independiente por parte de la comunidad.
- El contenido de la model card procede del propio autor y no ha sido verificado de forma externa en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SeokjunChoi/snapshot-polarimetric-dir
- Paper (arXiv): https://arxiv.org/abs/2605.24915
- DOI: https://doi.org/10.1145/3842531
- Código fuente (PDIR): https://github.com/MichaelCSJ/PDIR
- Nota sobre la búsqueda web: los resultados recuperados no contienen ningún enlace relacionado con este modelo ni con rendering inverso polarimétrico (corresponden a portales de desarrollo de American Express), por lo que no se incluyen.
