# coolnow/milo-pointer

## Resumen

Milo Pointer es un codificador de texto de 149 millones de parámetros derivado de answerdotai/ModernBERT-base, desarrollado por Chaitanya Talapalli (coolnow) y publicado en 2026. Su función no es generar texto, sino predecir la siguiente acción en la interfaz de un dispositivo Android a partir del árbol de accesibilidad de la pantalla: identifica el elemento sobre el que pulsar, la dirección de desplazamiento, el texto a introducir o la app a abrir. Está pensado como primera capa de un sistema de agentes móviles, por delante de un modelo frontera al que delega los pasos dudosos mediante una señal `defer`.

La propuesta técnica central es un enrutador pre-registrado: el modelo resuelve en local aproximadamente el 70 % de los pasos y reenvía el resto a Claude Opus 5.5 o Sonnet 5.5. Según el autor, esta cascada supera al modelo frontera en solitario en 2,8 puntos (p = 0,003) en una prueba confirmatoria sobre 650 pasos, con un coste de API inferior a un tercio del de Opus. El modelo es relevante porque demuestra que un encoder pequeño, entrenado sobre 74 000 pasos etiquetados de AndroidControl, puede asumir la mayor parte de la carga de decisión en agentes de interfaz con latencias de 0,29 s en portátil y 1,18-4,5 s en un Pixel 6a.

El modelo se distribuye con pesos safetensors y variantes ONNX (fp32 e int8), licencia Apache 2.0 y un repositorio de 1,2 GB. Incluye código de inferencia propio (`milo_pointer.py`) y artefactos de cuantización para despliegue en dispositivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-base), text-only |
| Parametros totales | 149.025.038 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32, fp16, int8 (per-tensor y per-channel ONNX) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX (`pointer_int8.onnx`, `onnx/pointer_int8_pc.onnx`) |

## Arquitectura y entrenamiento

El modelo parte de ModernBERT-base, un encoder transformer bidireccional con atención de secuencia completa, y se especializa como cabecera de predicción de acciones sobre la representación serializada del árbol de accesibilidad de Android. La entrada combina el objetivo de la tarea, la instrucción del paso, la lista de elementos con clase, texto y caja delimitadora, las dimensiones de pantalla y una descripción del paso anterior (`last_step`). La salida es una acción tipada (click, long_press, input_text, scroll en cuatro direcciones, navigate_back, navigate_home, open_app, wait), el elemento objetivo, coordenadas y una confianza, además del flag `defer`.

El entrenamiento utiliza los 74 000 pasos etiquetados del conjunto AndroidControl, los mismos que emplean las variantes few-shot de Claude en la comparación. Cada ejecución de entrenamiento tarda aproximadamente 6,4 horas en una única NVIDIA T4. El autor documenta unos 40 experimentos pre-registrados, incluidos los negativos, con marcas de tiempo en `paper/PREREGISTRATION.md`. La cuantización int8 per-channel se calibró sobre una muestra separada y se eligió por su mejor compromiso entre tamaño (151 MB) y precisión (862 frente a 869 en fp32 sobre 1 000 pasos retenidos).

## Capacidades

- Predicción de la siguiente acción en pantallas Android a partir del árbol de accesibilidad, sin necesidad de píxeles ni de visión.
- Clasificación de tipo de acción entre diez categorías, con selección de elemento y coordenadas de pulsación.
- Extracción de texto para `input_text` y de nombre de aplicación para `open_app` directamente desde la instrucción del paso.
- Señal de delegación (`defer: true`) calibrada para enrutar pasos inciertos a un modelo frontera.
- Manejo de contexto de episodio mediante el campo `last_step`, que describe el paso previo y si la pantalla cambió.
- Inferencia en dispositivo: variantes ONNX ejecutables en CPU de móvil con ONNX Runtime.
- No soporta visión, audio, tool calling genérico ni generación de texto libre; es un clasificador de acciones, no un modelo conversacional.

## Casos de uso

- Agentes de accesibilidad en Android: el modelo decide el siguiente toque sobre el árbol de accesibilidad y ejecuta la acción en local, lo que permite automatizar tareas como poner un temporizador de cinco minutos en un Pixel 6a con latencias de 1,18 s por paso tras eliminar contenedores vacíos del layout.
- Enrutador de coste en pipelines con modelo frontera: se sitúa delante de Claude Opus 5.5 o Sonnet 5.5 y responde en torno al 70 % de los pasos, reduciendo el gasto de API a 2,82 USD por 1 000 pasos frente a 9,54 USD de Opus en solitario.
- Automatización de pruebas de UI: genera acciones reproducibles sobre apps Android a partir de instrucciones en lenguaje natural, útil para suites de regresión que necesitan explorar flujos sin guion fijo.
- Asistentes de accesibilidad para usuarios con movilidad reducida: traduce instrucciones verbales en acciones concretas sobre la pantalla, con la ventaja de que el modelo corre íntegramente en el dispositivo y no envía el árbol de accesibilidad a la nube.
- Investigación en agentes de interfaz: sirve como línea base reproducible y de bajo coste (6,4 h en una T4 por entrenamiento) para estudiar enrutamiento, cuantización y generalización a apps no vistas.
- Filtrado previo en asistentes móviles de fabricante: descarta pasos triviales (navegar atrás, abrir una app conocida) antes de invocar un modelo mayor, con un coste de memoria de 1,45 GB en int8.
- Despliegue en dispositivos de gama media sin GPU: la variante int8 per-channel de 151 MB cabe en el almacenamiento y la memoria de un teléfono actual y mantiene la precisión dentro de 7 puntos sobre 1 000 pasos respecto a fp32.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre AndroidControl. La métrica es precisión por paso; la selección del puntero se hizo sobre el split de test, por lo que su propia cifra es ligeramente optimista.

| Sistema | Run 1 | Run 2 | Pasos en dispositivo | USD API por 1k pasos (Batch) |
|---|---|---|---|---|
| Milo Pointer solo | 869 | 869 | 100 % | 0 |
| Claude Opus 5.5 + 16 ejemplos recuperados | 882 | 879 | 0 % | 9,54 |
| Milo Pointer con defer a Opus 5.5 | 892 | 890 | 70,7 % | 2,82 |
| Claude Sonnet 5.5 + 16 ejemplos recuperados | 857 | 862 | 0 % | 4,80 |
| Milo Pointer con defer a Sonnet 5.5 | 881 | 889 | 70,7 % | 1,41 |

Prueba confirmatoria adicional sobre 650 pasos no usados: enrutamiento a Opus con 599 aciertos frente a 581 de Opus solo (+2,8 puntos, IC 95 % [+1,0, +4,5], p = 0,003), con 73,7 % de pasos resueltos en local. Sobre los 1 000 pasos anteriores, la cascada es no inferior a Opus (+1,0 punto, IC 95 % [-0,2, +2,2], p = 0,14) y usa el 29 % de sus llamadas; en los pasos que retiene, acierta el 94,9 % frente al 93,5 % de Opus en esos mismos pasos.

Conjunto de test completo de AndroidControl (8 444 pasos, métrica estricta): 88,5 % de precisión por paso; IDD 89,8, app no vista 87,9, tarea no vista 87,2, categoría no vista 86,7.

Rendimiento y memoria:

| Hardware | Mediana por paso | Memoria |
|---|---|---|
| Apple M2, GPU, PyTorch fp16 | 0,29 s | ~2 GB de proceso |
| Pixel 6a, CPU, ONNX Runtime 1.20, 4 hilos, fp32 | 4,5 s (p90 11,9 s) | 1,94 GB |
| Pixel 6a, CPU, ONNX Runtime 1.20, 4 hilos, int8 | 3,4 s (p90 11,2 s) | 1,45 GB |
| Igual, sin contenedores de layout vacíos | 1,18 s (p90 4,9 s) | 1,45 GB |

Precisión int8 sobre 1 000 pasos retenidos: per-tensor 851, per-channel 862 (frente a 869 en fp32). La variante int8 coincide con fp32 en 34 de 40 pasos en el dispositivo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión AndroidControl | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Milo Pointer | 149 M | no disponible | 88,5 % (test completo); 86,9 % en la muestra de 1 000 | Apache 2.0 | Hugging Face, ONNX incluido |
| OS-Atlas-7B | 7 000 M | no disponible | 85,2 % (protocolo reportado por agentes de captura de pantalla) | no disponible en la información | no disponible |
| Claude Opus 5.5 (few-shot) | no disponible | no disponible | 88,2 % / 87,9 % en la muestra de 1 000 | propietaria | API |
| Claude Sonnet 5.5 (few-shot) | no disponible | no disponible | 85,7 % / 86,2 % en la muestra de 1 000 | propietaria | API |

La comparación con OS-Atlas-7B no es estrictamente equivalente: los conjuntos de pasos difieren ligeramente, según advierte el propio autor.

## Limitaciones y advertencias

- No supera a Opus con los mismos datos: 878 frente a 893 en otra muestra (p = 0,17). La ventaja de la cascada proviene del enrutamiento, no de la calidad intrínseca del encoder.
- En entorno real la cascada falla: en AndroidWorld, delegando a Gemini 3.5 Flash, completó menos tareas que el agente frontera solo (41,9 % frente a 54,8 %, p = 0,008). La precisión por paso offline no se traslada a tareas donde los errores se acumulan.
- La puntuación propia del puntero está seleccionada sobre el split de test, por lo que es moderadamente optimista.
- Depende de datos de entrenamiento: tanto el puntero como las variantes few-shot usan los 74 000 pasos de AndroidControl; en apps propias hará falta una cantidad similar de datos etiquetados.
- Solo texto: no procesa capturas de pantalla ni información visual; depende de la calidad del árbol de accesibilidad, que puede faltar o estar incompleto en apps con canvas o WebView.
- Idiomas soportados no documentados; el entrenamiento se realizó sobre instrucciones de AndroidControl, predominantemente en inglés.
- La latencia en CPU de móvil es alta para uso interactivo (p90 de hasta 11,9 s en fp32) y la variante int8 pierde precisión (862 frente a 869).
- Riesgo de alucinación en la selección de elemento y en la copia de texto o nombre de app desde la instrucción; la confianza y el flag `defer` deben calibrarse sobre datos propios.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base ModernBERT y los datos de AndroidControl tienen sus propias condiciones que deben verificarse por separado.
- Sin garantías de mantenimiento: 33 descargas y 0 likes en el momento de la ficha; proyecto de autor único.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/coolnow/milo-pointer
- Repositorio de código y registro de experimentos: https://github.com/chayworks/milo-pointer
- Paper (DOI): https://doi.org/10.5281/zenodo.23818333
- ORCID del autor: https://orcid.org/0009-0000-8811-3349
- Vídeo de demostración (Pixel 6a, tarea de reloj): https://huggingface.co/coolnow/milo-pointer/resolve/main/milo_demo_clean.mp4
- Figura de curvas de coste y precisión: https://huggingface.co/coolnow/milo-pointer/resolve/main/fig_router.png
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
