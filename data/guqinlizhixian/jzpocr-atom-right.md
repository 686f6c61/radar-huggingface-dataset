# guqinlizhixian/jzpocr-atom-right

## Resumen

jzpOCR ATOM (identificador `guqinlizhixian/jzpocr-atom-right`) es un modelo de visión por computador especializado en el reconocimiento de **caracteres sueltos de la notación guqin `减字谱` (jianzipu)** para la mano derecha. No es un OCR de página completa: recibe la imagen recortada de un único glifo de notación (192×192 RGB) y devuelve una lectura estructurada en un DSL de campos, por ejemplo `ATOM|F:大;H:七八;R:抹;S:七`, donde cada letra codifica un atributo musical (técnica de dedo, posición de armónico `徽`, acción de la mano derecha, cuerda). Lo publica el usuario `guqinlizhixian` como componente del proyecto jzpOCR.

Técnicamente es un modelo pequeño: 3.127.855 parámetros (unos 12,5 MB en `state_dict`), con un backbone convolucional 2D compartido y una cabeza de atención espacial por cada campo del DSL, que luego se serializa a la cadena de lectura. Se entrenó sobre 26.914 recortes extraídos de los 30 volúmenes de la edición facsímil 《琴曲集成》 (*Qin Qu Ji Cheng*), con AdamW, 30 épocas y batch 256 sobre una RTX 4090D en unos 700 segundos.

Su relevancia es acotada pero muy específica: cubre una tarea de digitalización de patrimonio documental para la que no existen modelos públicos equivalentes, y lo hace con un coste computacional ínfimo. La contrapartida es que el propio autor documenta un rendimiento global del 57,58% de acierto exacto por glifo en un conjunto de evaluación de solo 132 muestras, y que la licencia es `other` sin autorización explícita sobre los derechos de la obra facsímil de la que proceden las imágenes de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Backbone convolucional 2D compartido con cabezas de atención espacial por campo; salida serializada a DSL |
| Parámetros totales | 3.127.855 (≈12,5 MB en `state_dict`) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; entrada fija de imagen 192×192 RGB) |
| Tipos de cuantización | no disponible (no se publican versiones cuantizadas; pesos en `state_dict`) |
| Idiomas soportados | chino (`zh`), restringido a notación jianzipu de guqin |
| Licencia | `other` (sin licencia de código abierto concedida; ver limitaciones) |
| Formato de pesos | PyTorch `state_dict` (`best_model.pt`), más `vocab.json` congelado |

Otros datos operativos aportados por el autor: pipeline declarado `image-classification`, librería `pytorch`, entrada RGB normalizada a escala `[0, 1]`, y repo de 0,0 GB según HuggingFace (el peso real declarado es de ~12,5 MB).

## Arquitectura y entrenamiento

La arquitectura es deliberadamente compacta: un backbone convolucional 2D compartido extrae características de la imagen del glifo y, sobre ellas, se aplica una **cabeza de atención espacial independiente por cada campo** del esquema de lectura (F, H, R, S, T, D, S2, etc.). Cada cabeza resuelve una clasificación sobre su propio vocabulario y la salida se serializa en el DSL `ATOM|F:…;H:…;R:…;S:…`. Los ficheros de definición (`models.py`, `dsl.py`, `normalize.py`) proceden del repositorio principal jzpOCR copiados byte a byte, con hashes SHA-256 verificados contra el commit `94cd54acfb60a4a4715af21491b878d2b7947c68`.

El entrenamiento usó 26.914 recortes de glifos procedentes de los escaneos de 《琴曲集成》 (30 volúmenes, `QJJC_v01`–`QJJC_v30`), repartidos en dos orígenes: 3.835 recortes con lectura de superficie confirmada manualmente (DSL derivado de forma determinista) y 24.948 recortes revisados por humanos en un flujo de trabajo tipo *flywheel*. La partición train/validación (26.914 / 1.868) se hizo **agrupando por lectura**, de modo que todas las instancias de una misma lectura caen en un solo lado. Hiperparámetros: AdamW, `lr = 2e-3`, 30 épocas, batch 256, RTX 4090D, ~700 s de entrenamiento. El autor advierte de que en esa ronda se cambiaron simultáneamente tres variables (volumen de datos, criterio de campos y máquina de entrenamiento), por lo que no es posible atribuir la mejora a ninguna de ellas por separado.

Un detalle crítico de implementación documentado explícitamente: la normalización de píxeles es `/255` puro, es decir escala `[0, 1]`, **sin** el reescalado posterior a `[-1, 1]`. Sobre las mismas 132 muestras, `[0, 1]` da 57,58% y `[-1, 1]` cae a 40,15%.

## Capacidades

- Reconocimiento de un único glifo de jianzipu de **mano derecha** y emisión de una lectura estructurada en DSL (`ATOM|F:…;H:…;R:…;S:…`).
- Predicción por campos independientes: F (técnica de dedo), H (posición de armónico/徽), R (acción de mano derecha), S (cuerda), T (散/泛, cuerda al aire o armónico), D (modificadores como 注, 绰, 合) y S2 (segunda cuerda en técnicas multi-cuerda).
- Modo de salida con confianza por campo mediante el flag `--show-confidence` del script de inferencia.
- Ejecución en CPU o GPU (`--device cuda`) y procesamiento por lotes de varias imágenes en una sola invocación.
- **No** realiza OCR de página completa: requiere que las regiones de cada glifo hayan sido previamente detectadas y recortadas.
- **No** cubre mano izquierda (`LC`), puntuación/句读 (`MARK`) ni silencios (`REST`); esas clases no existen en sus datos de entrenamiento.
- No soporta *tool calling*, agentes, razonamiento multi-paso, visión general, audio ni generación de texto libre; no es un modelo multimodal ni conversacional.
- Capacidad multilingüe: ninguna más allá del dominio de notación china histórica para el que fue entrenado.
- No se documentan capacidades de *thinking mode*, ni modos especiales adicionales.

## Casos de uso

- Digitalización de cancioneros de guqin: dado un pipeline previo de detección de maquetación que recorte cada glifo, el modelo transcribe la lectura de la mano derecha glifo a glifo, generando un corpus indexable a partir de fuentes históricas.
- Catalogación y búsqueda en archivos musicológicos: convertir los recortes de un fondo documental en cadenas DSL permite buscar por técnica, cuerda o posición de armónico en lugar de hacerlo visualmente.
- Asistencia a la edición crítica: al ser un modelo de 3,1 M de parámetros ejecutable en CPU, puede integrarse en herramientas de escritorio donde el editor valida o corrige la lectura sugerida de cada glifo.
- Preetiquetado para anotación humana: el modo `--show-confidence` permite priorizar la revisión sobre los campos con menor confianza (H, D y S2 son los más débiles según las métricas del autor), reduciendo el coste de construir nuevos conjuntos de referencia.
- Investigación sobre reconocimiento de escritura histórica no estándar: sirve como línea base reproducible y de bajo coste para comparar arquitecturas sobre este dominio concreto.
- Aplicaciones educativas de aprendizaje de jianzipu: un visor puede mostrar el glifo recortado y su lectura descompuesta en técnica, armónico, cuerda y acción de mano derecha.
- Integración en procesos por lotes de bajo consumo: al requerir menos de 1 GB de memoria, puede ejecutarse en máquinas sin GPU o en servidores compartidos para procesar colecciones enteras de recortes.

## Benchmarks y rendimiento

El autor publica métricas internas sobre `fixed_dev`, un conjunto de evaluación de 132 muestras formado por dos subpaquetes congelados y excluidos permanentemente del entrenamiento (`PackageA`, 72 muestras, asset `BENCH-ATOM-PACKAGE-A-001` v1.0.0; `real110`, 60 muestras). Se verificó por SHA-256 que la intersección con el conjunto de entrenamiento es cero.

| Métrica | Valor |
|---|---|
| `whole_exact` (todos los campos correctos por lectura) | 76/132 = 57,58% |
| Campo F (técnica de dedo) | 94,4% |
| Campo S (cuerda) | 89,9% |
| Campo R (acción de mano derecha) | 87,0% |
| Campo T (散/泛) | 83,3% |
| Campo H (posición de armónico) | 73,2% |
| Campo D (modificadores) | 50,0% |
| Campo S2 (segunda cuerda) | 0/4 |
| Campos C, 就, P | sin muestras en el conjunto de evaluación |

No se han publicado resultados comparativos frente a otros modelos (MMLU, HumanEval, GSM8K u otros benchmarks estándar no aplican a esta tarea y no se reportan). El propio autor acota la validez de estas cifras: con n=132, el error estándar para p≈0,6 es de aproximadamente 4,3 puntos porcentuales, por lo que diferencias inferiores a 8 puntos en una sola ronda no son concluyentes; las métricas por campo son aún menos fiables; S2 solo tiene 4 muestras; el benchmark es a nivel de recorte y **no existe ninguna cifra de página completa**; y este modelo no pasó por el proceso oficial de *release* del proyecto jzpOCR.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB con los pesos en `state_dict` de ~12,5 MB y entradas de 192×192 RGB; el cuello de botella es el *batch*, no el modelo.
- GPU recomendadas: cualquiera, incluida una GPU integrada. Una RTX 4090D se usó únicamente para el entrenamiento (30 épocas sobre 26.914 imágenes en ~700 s); no se documentan cifras de latencia ni de throughput de inferencia.
- Cabe en cualquier GPU de consumo, y también en CPU sin problema; es viable incluso en dispositivos de borde.
- Opciones de despliegue: el repositorio proporciona `infer.py` sobre PyTorch con selección de dispositivo (`--device cuda`). No se documentan integraciones con vLLM, llama.cpp, Ollama, TGI ni exportaciones a ONNX o TorchScript; esas vías figuran como no disponibles.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos sobre modelos comparables en la información proporcionada. Los OCR genéricos (Tesseract, PaddleOCR) no cubren la notación jianzipu, y no se han encontrado en la búsqueda web alternativas públicas a esta tarea concreta.

| Modelo | Parámetros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jzpocr-atom-right | 3.127.855 | imagen 192×192 RGB (un glifo) | 57,58% `whole_exact` en 132 muestras (métrica propia) | `other` (sin licencia abierta) | HuggingFace, 0 descargas, 0 *likes* |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

El propio autor menciona que el proyecto jzpOCR contempla componentes separados para mano izquierda (`LC`), puntuación (`MARK`) y silencios (`REST`), pero no se facilitan identificadores ni métricas de esos modelos en la documentación disponible.

## Limitaciones y advertencias

- **No es OCR de página completa.** La entrada debe ser el recorte de un único glifo; introducir una página entera no produce resultados significativos. Se necesita un detector de maquetación previo.
- **Solo mano derecha.** El prefijo de salida es siempre `ATOM`. Las clases `LC`, `MARK` y `REST` no existen en los datos de entrenamiento y el modelo no puede emitirlas.
- **Preprocesado frágil:** la normalización debe ser `[0, 1]` (`/255`). Usar `[-1, 1]` degrada el acierto del 57,58% al 40,15% sobre el mismo conjunto.
- **Rendimiento global moderado y muestra de evaluación pequeña:** 57,58% de lecturas exactas sobre 132 casos (error estándar ~4,3 pp). Campos débiles: D (50,0%) y S2 (0/4, con solo 4 muestras, no concluyente).
- **Ausencia de datos por campo fiables:** el propio autor advierte de que las métricas por campo son menos fiables que la global y que no hay cifras a nivel de página.
- **Riesgo de alucinación / salida espuria:** al ser un clasificador por campo con vocabulario cerrado, ante glifos fuera de distribución (manuscritos no vistos, recortes mal encuadrados, ruido de escaneo) puede emitir una lectura plausible pero incorrecta sin señal de abstención más allá de la confianza por campo.
- **Sesgo de dominio:** entrenado exclusivamente con recortes de 《琴曲集成》 y su estilo de impresión; se desconoce su comportamiento en otras ediciones, manuscritos o estilos caligráficos.
- **Requisito externo no cubierto:** se necesita un modelo o pipeline de detección de glifos que no forma parte de este repositorio.
- **Licencia y derechos de los datos:** se publica como `license: other`, sin licencia de código abierto concedida. El autor declara explícitamente que 《琴曲集成》 es una edición facsímil moderna con derechos, no una obra en dominio público, que **no se ha realizado un juicio legal sobre si los pesos constituyen obra derivada** y que **no se ha obtenido autorización de los titulares**. El uso comercial o la redistribución exigen resolver por cuenta propia los derechos de la fuente. Las matrices musicales originales (xilografías de las dinastías Ming y Qing) son en su mayoría de dominio público; lo que está restringido es la reproducción y compilación moderna.
- **Madurez del artefacto:** 0 descargas y 0 *likes* en HuggingFace, y el modelo no ha pasado por el proceso oficial de *release* del proyecto jzpOCR; tratarlo como experimental.

## Enlaces

- HuggingFace: https://huggingface.co/guqinlizhixian/jzpocr-atom-right
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante; los resultados devueltos corresponden a consultas no relacionadas sobre Visual Studio Code y Visual Studio. No hay papers, blogs, repositorios ni demos adicionales disponibles en la información proporcionada.
