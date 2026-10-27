# shahriarhd/mtl-face-auth

## Resumen

MTL Face Anti-Spoofing & Deepfake Detection es un modelo de visión por computador publicado por el usuario shahriarhd en HuggingFace. Se trata de un detector multi-tarea que, a partir de un clip corto de vídeo (8 fotogramas RGB de 224×224 píxeles), devuelve tres puntuaciones independientes: probabilidad de *deepfake*, probabilidad de ataque de presentación (*spoofing*, por ejemplo una foto impresa o una pantalla frente a la cámara) e inconsistencia temporal entre fotogramas. El problema que aborda es doble: verificar que el rostro capturado es una persona real presente físicamente y, al mismo tiempo, detectar vídeo manipulado sintéticamente.

La aportación técnica es la compartición de un único backbone EfficientNet-B2 entre las tres cabezas, entrenadas conjuntamente con equilibrio de gradientes multi-tarea (GradNorm y PCGrad) y un módulo de desplazamiento temporal (TSM) insertado en los bloques 1, 3 y 5. El modelo se distribuye con pesos en safetensors y una exportación ONNX de opset 18 pensada para ejecución en navegador mediante ONNX Runtime Web (WASM), de modo que el vídeo no sale del dispositivo del usuario. El repositorio ocupa unos 0,1 GB y la licencia es MIT.

Es relevante ahora por su enfoque de autenticación facial "en el borde" (detección de deepfake y de ataques de presentación en un solo pase, ejecutable en CPU), aunque el propio autor lo posiciona explícitamente como demostración académica y no como control de seguridad de producción. El modelo tiene 0 descargas y 0 *likes* en el momento de redactar esta ficha, y no se ha publicado información sobre su uso en entornos reales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN EfficientNet-B2 como backbone compartido + módulo de desplazamiento temporal (TSM) en los bloques 1, 3 y 5 + tres cabezas de clasificación (deepfake, spoof, consistencia temporal) |
| Parámetros totales | No disponible en la model card (el backbone EfficientNet-B2 estándar ronda los 9,1 M de parámetros; el total con las tres cabezas no se detalla) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como contexto de texto: ventana temporal fija de 8 fotogramas RGB |
| Tipos de cuantización | No se documentan esquemas de cuantización; se distribuyen pesos en safetensors y una exportación ONNX opset 18 con pesos embebidos |
| Idiomas soportados | No disponible (modelo de visión, independiente del idioma; la model card no declara idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model_best.safetensors`, `model_last.safetensors`, state dict de PyTorch con 536 tensores) y ONNX opset 18 (`model_best.onnx`, `model_last.onnx`, lote fijo 1×8 fotogramas) |

Otros datos de entrada/salida:

| Parámetro | Valor |
|---|---|
| Entrada | Tensor `(1, 8, 3, 224, 224)`, 8 fotogramas RGB normalizados con media y desviación de ImageNet |
| Salidas | Tres logits transformados con sigmoide: `deepfake`, `spoof`, `temporal` |
| Umbrales de decisión | Deepfake 0,6; spoof 0,6; temporal 0,8 |
| Puntuación compuesta monitorizada | 0,9355 |
| Tamaño del repositorio | 0,1 GB |
| Pipeline declarado | `video-classification` |
| Fecha de creación / actualización | 27 de octubre de 2026 (ambas) |

## Arquitectura y entrenamiento

El modelo sigue un esquema multi-tarea con *hard parameter sharing*: un único EfficientNet-B2 procesa cada fotograma y un TSM intercalado en los bloques 1, 3 y 5 mezcla parte de los canales entre fotogramas adyacentes, lo que aporta información de movimiento sin recurrir a una arquitectura recurrente ni a atención temporal completa. Sobre las características resultantes se aplican tres cabezas: una de detección de deepfake, una de detección de ataque de presentación y una de consistencia temporal. La salida son logits independientes, lo que permite combinar los umbrales según el caso de uso (por ejemplo, exigir simultáneamente spoof bajo y consistencia temporal alta).

El entrenamiento conjunto se estabiliza con dos técnicas de equilibrio de gradientes multi-tarea, GradNorm y PCGrad, que mitigan el conflicto entre objetivos con dificultades muy distintas. Según la model card, la cabeza de deepfake se entrena con FaceForensics++ y la de anti-spoofing con SiW-Mv2, con evaluación sobre particiones reservadas. El autor indica explícitamente que se corrigió una fuga de datos a nivel de escenario (*scenario-level split leakage*) y que las cifras publicadas corresponden a la evaluación honesta posterior. No se especifican el número de tokens, el tamaño total del dataset, ni si hubo fases de ajuste con RLHF o DPO (no aplicables en un modelo de clasificación visual).

## Capacidades

- Clasificación binaria de deepfake en clips de vídeo de 8 fotogramas (ataque frente a contenido auténtico).
- Detección de ataques de presentación (*face anti-spoofing*): fotos impresas, pantallas, réplicas y ataques similares.
- Verificación de consistencia temporal entre fotogramas, útil como señal auxiliar frente a vídeo interpolado o generado.
- Salida de tres probabilidades interpretables por separado, combinables mediante umbrales configurables (0,6 / 0,6 / 0,8 por defecto).
- Ejecución en CPU y en navegador: el grafo ONNX funciona con ONNX Runtime (CPU) y con ONNX Runtime Web sobre WASM, sin enviar el vídeo al servidor.
- Integración en PyTorch mediante `safetensors.torch.load_file` y `load_state_dict` (la arquitectura debe importarse del repositorio de entrenamiento del autor).
- No soporta *tool calling*, razonamiento multi-paso, agentes, texto, audio ni capacidades multilingües: es un clasificador de vídeo puro.
- No incluye *thinking mode* ni generación: las salidas son tres escalares por clip.

## Casos de uso

- **Onboarding con verificación de presencia física**: antes de aceptar una fotografía o vídeo de alta de usuario, ejecutar el clip en el modelo y rechazar la captura si la puntuación de spoof supera 0,6, reduciendo ataques con fotos impresas o pantallas.
- **Prueba de vida en el navegador**: desplegar `model_best.onnx` con ONNX Runtime Web permite hacer la comprobación íntegramente en el cliente; el flujo de vídeo nunca sale del dispositivo, lo que simplifica el cumplimiento de protección de datos.
- **Moderación de contenido generado**: prefiltrar vídeos subidos a una plataforma y marcar para revisión humana aquellos con puntuación de deepfake alta; la ventana de 8 fotogramas hace el coste por clip muy bajo.
- **Detección de suplantación en videollamadas o entrevistas grabadas**: analizar clips cortos y elevar una alerta cuando deepfake y consistencia temporal coinciden; debe tratarse como señal de apoyo, no como prueba concluyente.
- **Investigación en *face anti-spoofing* multi-tarea**: servir de línea base reproducible para estudiar el efecto del equilibrio de gradientes (GradNorm/PCGrad) y del TSM en un backbone EfficientNet-B2, ya que se publican checkpoints, configuración y métricas completas.
- **Prototipado educativo y demos web**: el par ONNX + WASM con pesos embebidos permite montar una demostración funcional en GitHub Pages sin infraestructura de GPU.
- **Auditoría de pipelines de captura**: medir la tasa de rechazo por inestabilidad de cabeza o movimiento excesivo antes de fijar requisitos de calidad de vídeo en una aplicación de captura.

## Benchmarks y rendimiento

Resultados en particiones reservadas (*held-out*) tal como los reporta el autor:

| Tarea | Conjunto de evaluación | AUC-ROC | Métrica secundaria |
|---|---|---|---|
| Anti-spoofing | SiW-Mv2 | 0,9856 | ACER 0,0487 |
| Deepfake | FaceForensics++ | 0,8854 | EER 0,2000 |
| Consistencia temporal | SiW-Mv2 (vídeo) | 0,9171 | AUC de vídeo 0,9764 |

Advertencia importante sobre estas cifras: la sección de uso previsto de la propia model card afirma que, tras cerrar la fuga de datos a nivel de escenario, el AUC de la cabeza de deepfake queda en torno a 0,84, lo que no coincide con el 0,8854 de la tabla de resultados (presumiblemente proveniente de `model_best.metrics.json`). No se aclara en la información disponible qué cifra corresponde a qué protocolo de evaluación, por lo que conviene tratar el dato como no consolidado.

No se han publicado resultados comparativos con otros modelos en la información disponible, ni tablas de MMLU, HumanEval o GSM8K (no aplicables a este tipo de modelo).

## Requisitos de hardware

- **VRAM estimada para inferencia**: no documentada. Con un backbone EfficientNet-B2 y lotes de 8 fotogramas a 224×224, el modelo cabe holgadamente en menos de 2 GB de memoria en precisión estándar; el repositorio completo ocupa 0,1 GB, lo que sugiere un peso en disco del orden de decenas de megabytes.
- **GPU recomendadas**: no se especifican. Por tamaño, cualquier GPU consumer reciente es sobredimensionada; una RTX 3060 o superior ofrece margen amplio. No consta validación en A100/H100 ni cifras de rendimiento en esas plataformas.
- **GPU consumer**: sí cabe, pero el caso de uso declarado no la requiere; la exportación ONNX está pensada para CPU y navegador.
- **Opciones de despliegue**: PyTorch nativo (state dict en safetensors), ONNX Runtime con `CPUExecutionProvider`, ONNX Runtime Web (WASM) para navegador. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador de vídeo CNN.
- **Latencia y throughput**: no disponibles. No se publican mediciones de tiempo por clip ni de clips por segundo en CPU, GPU o WASM. La restricción práctica conocida es la del demo: movimiento grande de cabeza provoca un rechazo del tipo "mantén la cara quieta".

## Comparativa con modelos similares

No se dispone de datos de benchmarks de terceros en la información proporcionada, por lo que no es posible construir una comparación numérica rigurosa. Se indican a continuación las categorías de alternativas y el estado de los datos:

| Alternativa | Tipo | Parámetros | Contexto / entrada | Licencia | Datos comparativos |
|---|---|---|---|---|---|
| shahriarhd/mtl-face-auth | CNN multi-tarea (anti-spoofing + deepfake + temporal) | No disponible (backbone EfficientNet-B2) | 8 fotogramas 224×224 | MIT | AUC 0,9856 (SiW-Mv2), AUC 0,8854 (FF++) |
| Detectores de *face anti-spoofing* dedicados (p. ej. familia Silent-Face-Anti-Spoofing) | CNN de una sola tarea | No disponible | Típicamente 1 o varios fotogramas | No disponible | No disponible |
| Suites de detección de deepfake (p. ej. DeepfakeBench y similares) | Conjuntos de detectores y protocolos de evaluación | No disponible | Fotogramas o clips | No disponible | No disponible |
| Detectores genéricos de imagen manipulada (modelos de clasificación visual de propósito general) | Transformer o CNN de imagen | No disponible | Imagen suelta | No disponible | No disponible |

La única ventaja diferencial verificable frente a estas alternativas, según la model card, es la combinación de las tres tareas en un solo backbone con un presupuesto de cómputo reducido y una exportación ONNX lista para navegador. No hay evidencia publicada de que supere a los detectores especializados en sus respectivos dominios.

## Limitaciones y advertencias

- **No es un control de seguridad de producción**: el autor lo califica de demostración académica y de investigación; no debe usarse como única barrera de autenticación.
- **Discrepancia en las métricas de deepfake**: la tabla reporta AUC 0,8854 mientras que la sección de uso previsto cita ≈0,84 tras corregir la fuga de datos. La cifra real a esperar en producción es incierta y probablemente peor que la tabulada.
- **Dependencia de una cara detectable y estable**: el rendimiento cae con movimiento amplio, oclusiones o cabezas giradas; el propio demo rechaza clips con gran movimiento.
- **Sesgos no evaluados**: no se documenta ninguna evaluación de equidad por tono de piel, género, edad, gafas o condiciones de iluminación, pese a que los *datasets* de referencia (SiW-Mv2, FaceForensics++) tienen distribuciones demográficas conocidas y limitadas.
- **Riesgo de falsos positivos y negativos**: la EER de 0,2000 en deepfake implica un 20 % de error en el punto de igual error, cifra alta para cualquier uso sensible; los umbrales por defecto (0,6/0,6/0,8) no están calibrados por dominio.
- **Generalización limitada**: entrenado sobre dos conjuntos académicos; no hay evidencia de comportamiento frente a generadores recientes, recompresión agresiva, vídeo de baja calidad o cámaras de móvil reales.
- **No es un comparador biométrico**: las puntuaciones son probabilidades de ataque por clip, no similitudes de identidad; no sirve para verificar "quién es" esta persona.
- **Ausencia de mantenimiento y tracción**: 0 descargas y 0 *likes*, sin historial de issues; el código de definición del modelo vive en un repositorio externo de entrenamiento y la carga requiere `strict=False`, lo que puede ocultar desajustes de pesos.
- **Licencia MIT**: permite uso comercial y modificación sin restricciones prácticas, pero se distribuye sin garantía alguna ("use at your own risk"), lo que traslada todo el riesgo al integrador.
- **Idiomas y texto**: al no ser un modelo lingüístico, no hay soporte multilingüe ni de instrucciones; cualquier capa de decisión adicional debe implementarse fuera del modelo.
- **Procedencia de los datos de entrenamiento**: la model card no detalla composición, número de clips ni licencias de los conjuntos originales, lo que complica una auditoría de cumplimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shahriarhd/mtl-face-auth
- Repositorio de entrenamiento (referenciado en la model card como origen de la clase `MTLModel`, sin URL explícita): no disponible
- Demo en GitHub Pages con ONNX Runtime Web (mencionada en la model card, sin URL explícita): no disponible
- *Paper* o nota técnica asociada: no disponible
- Conjunto de evaluación SiW-Mv2: no disponible en la información proporcionada
- Conjunto de evaluación FaceForensics++: no disponible en la información proporcionada
- Resultados de búsqueda web: no se han encontrado recursos relevantes sobre este modelo; las búsquedas devolvieron únicamente páginas sin relación (Sudoku online, vídeos en Mail.ru).
