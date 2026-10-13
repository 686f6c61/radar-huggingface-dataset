# minjiechen/MagNet-Transformers

## Resumen

MagNet-Transformers (minjiechen/MagNet-Transformers) no es un modelo de lenguaje: es un paquete de diez checkpoints Transformer específicos por material magnético, procedentes de la aplicación MagNet de la Universidad de Princeton, convertidos a grafos ONNX de forma fija (encoder y decoder). El modelo resuelve un problema de regresión física: dado un ciclo de densidad de flujo magnético B (128 muestras uniformes en teslas), la frecuencia en Hz, la temperatura en grados Celsius y un sesgo de campo magnético DC en A/m, predice la intensidad de campo H en A/m y permite calcular la pérdida volumétrica firmada del lazo mediante la integral trapezoidal `f * trapezoid(H, B)` en W/m³.

Los materiales cubiertos son diez de los quince del conjunto público de estado estacionario: 3C90, 3C94, 3E6, 3F4, 77, 78, N27, N30, N49 y N87. Cada carpeta de material incluye `encoder.onnx`, `decoder.onnx`, `norm.json` y `reference.json`, además de los pesos PyTorch originales sin modificar (`pytorch/Model_<material>_Transformer.sd` y `pytorch/Norm_<material>.pt`) para trazabilidad, y `domain/hull_<material>.npy` con las ecuaciones del casco convexo del dominio medido.

La relevancia actual es doble: por un lado publica en formato ONNX interoperable un modelo heredado de estimación de pérdidas en núcleo, ejecutable en CPU con NumPy y ONNX Runtime e incluso en navegador mediante ONNX Runtime Web; por otro, el propio autor advierte de que se trata de un port numérico de la inferencia heredada, no de un modelo reentrenado ni de un benchmark de precisión certificado de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con decoder autorregresivo, grafos ONNX de forma fija (encoder: `source` [1,128,1] + `variables` [1,3]; decoder: `memory` [1,128,24] + `target` [1,129,1]) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (modelo denso, no es MoE) |
| Longitud de contexto | 128 muestras de densidad de flujo B por ciclo (entrada de forma fija); 3 variables adicionales (log10(f), temperatura, sesgo DC) |
| Tipos de cuantizacion | no disponible (los artefactos publicados son grafos ONNX y pesos PyTorch; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplicable como modelo de lenguaje; la model card está en inglés (`language: en`) |
| Licencia | MIT |
| Formato de pesos | ONNX (`encoder.onnx`, `decoder.onnx`), PyTorch state dict (`.sd`, `.pt`) y JSON de normalización; datos de dominio en `.npy` |
| Materiales soportados | 3C90, 3C94, 3E6, 3F4, 77, 78, N27, N30, N49, N87 (10 de los 15 del conjunto público) |
| Dimension de memoria del encoder | 24 (salida `memory` [1,128,24]) |
| Libreria declarada | onnx |
| Tamano del repositorio | 0.0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-13 |

## Arquitectura y entrenamiento

La arquitectura es un Transformer encoder-decoder adaptado a series de 128 puntos de B. El encoder consume la forma de onda (`source`, float32 [1,128,1]) junto con tres variables normalizadas en el orden `[log10(f), temperatura, sesgo]` y produce una memoria de [1,128,24]. El decoder se ejecuta de forma autorregresiva: se inicializa `target` a ceros con el primer valor a 0.1, se invoca 128 veces retroalimentando la salida anterior y se realiza una llamada adicional, obteniendo `output` de [1,129,1]. Los primeros 128 valores, desnormalizados con `H = output * n[9] + n[8]`, dan H en A/m. La normalización se define en `norm.json`: `(B - n[0]) / n[1]` para B, `(log10(f) - n[2]) / n[3]` para la frecuencia, `(temperatura - n[4]) / n[5]` y `(sesgo - n[6]) / n[7]` para el sesgo DC.

No hay información sobre el número de tokens de entrenamiento, la composición exacta del dataset, el número de capas, la dimensión oculta ni si se emplearon RLHF/DPO, porque no aplica a este dominio y no se documenta. La model card indica explícitamente que es un port numérico de la inferencia heredada, no un entrenamiento nuevo, y que el split de entrenamiento original y la procedencia completa no se han reconstruido. Los datos públicos relacionados están en el dataset minjiechen/MagNet, pero sus ficheros actuales no se han establecido como el conjunto de entrenamiento exacto de estos checkpoints. Como innovación práctica, el paquete incluye generadores de forma de onda senoidal y triangular de 128 puntos con la convención original (el duty del triángulo es el tiempo normalizado del pico positivo de B y debe estar estrictamente entre 0 y 1), y un test de dominio basado en un casco convexo de cinco dimensiones `[frequency_Hz, peak_AC_flux_T, DC_bias_A_per_m, temperature_C, duty_ratio]`, donde cada fila de `hull_<material>.npy` es una desigualdad `a·point + b <= 1e-10`.

## Capacidades

- Regresión de lazo B-H: mapea un ciclo completo de 128 muestras de B más frecuencia, temperatura y sesgo DC a la forma de onda H correspondiente, específica por material.
- Cálculo de pérdida volumétrica: la integral firmada `f * trapezoid(H, B)` sobre los 127 intervalos adyacentes devuelve W/m³; no añade un borde de cierre sintético.
- Inferencia autorregresiva de 128 pasos más una llamada final sobre el decoder, con formas fijas y sin muestreo estocástico.
- Normalización determinista documentada para B, `log10(f)`, temperatura y sesgo DC mediante diez valores float32 en `norm.json`.
- Generación de formas de onda de entrada compatibles: senoidal de 128 puntos, triangular con duty configurable y cualquier forma de onda B personalizada de 128 valores en T vía `--b-json`.
- Comprobación de dominio de operación: evalúa si el punto de funcionamiento cae dentro del casco convexo medido de cinco dimensiones por material, y devuelve predicción igualmente fuera del casco marcándola.
- Ejecución en CPU con ONNX Runtime y NumPy, y validación en navegador con ONNX Runtime Web (smoke test en Chrome).
- Trazabilidad y verificación de integridad: `reference.json` por material incluye una forma de onda B/H de referencia en PyTorch, el resultado de paridad y hashes SHA-256 del checkpoint, el normalizador y la arquitectura.
- No soporta generación de texto, tool calling, function calling, uso como agente, razonamiento multi-paso general, visión, audio ni capacidades multilingües: su ámbito es exclusivamente la modelización de materiales magnéticos.

## Casos de uso

- Estimación de pérdidas en núcleo durante el diseño de convertidores de potencia: se introduce un ciclo de B muestreado a 128 puntos con la frecuencia de conmutación, la temperatura prevista y el sesgo DC del inductor, y el modelo devuelve H y la pérdida en W/m³ para dimensionar el núcleo.
- Generación de curvas B-H para simulación de circuitos: las parejas (B, H) predichas alimentan modelos de inductores y transformadores en simuladores de potencia, sustituyendo tablas de datasheet interpoladas.
- Selección y comparación de materiales: al existir checkpoints independientes para ferritas de manganeso-zinc (3C90, 3C94, 3E6, 3F4, N27, N30, N49, N87) y para materiales de polvo (77, 78), se pueden evaluar alternativas bajo el mismo punto de operación y condiciones térmicas.
- Validación previa de puntos de operación: el casco convexo de cinco dimensiones avisa de extrapolación antes de aceptar una predicción, lo que permite acotar el uso a rangos medidos y documentar las excepciones.
- Calculadoras de pérdidas en navegador o en herramientas web de ingeniería: el smoke test en Chrome con ONNX Runtime Web acredita que la inferencia puede ejecutarse en cliente sin backend GPU.
- Integración en pipelines de diseño automatizado: al ser artefactos ONNX de forma fija, se pueden invocar desde scripts de Python (véase `predict.py`) dentro de flujos de optimización de parámetros de bobina y núcleo.
- Verificación de implementaciones heredadas: los pesos PyTorch originales, los hashes SHA-256 y los ficheros de referencia permiten reproducir y auditar numéricamente una implementación previa antes de migrar a ONNX.
- Aumento de datos y destilación: las predicciones pueden emplearse para generar curvas B-H sintéticas que alimenten sustitutos más ligeros o comparaciones con modelos analíticos.
- Investigación y docencia en modelización data-driven de componentes magnéticos: material de partida reproducible para estudiar extrapolación, error frente a curvas medidas y sensibilidad a frecuencia, temperatura y sesgo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reclama ninguna métrica de generalización independiente y las cuatro medidas de N87 comparadas se describen como una comprobación de cordura, con posible solapamiento con los datos de entrenamiento. Los únicos datos numéricos publicados son pruebas de paridad numérica entre PyTorch y ONNX:

| Comprobacion | Ambito | Diferencia relativa maxima en perdida predicha |
|---|---|---|
| Paridad PyTorch a ONNX | 10 paquetes con onda senoidal nominal | 8,71e-7 |
| Paridad PyTorch a ONNX (N87) | 7 puntos senoidal/triangular, duty 30 % y 70 %, 25-90 °C, sesgo 0 y 30 A/m, dos frecuencias | 1,50e-6 |
| Smoke test ONNX Runtime Web (Chrome) | 10 casos de referencia | 7,66e-7 |

Cada `reference.json` incluye además una forma de onda B/H de referencia y los hashes SHA-256 del checkpoint de origen, el normalizador y la arquitectura.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; por el diseño (grafos ONNX de entrada [1,128,1] y estado del repositorio de 0,0 GB) la huella es muy reducida y el ejemplo de inferencia está pensado para CPU.
- GPU recomendadas: no se especifica ninguna; no es necesario acelerador para la ruta de referencia.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU de consumo y también en CPU, dado que la ejecución de referencia usa NumPy y ONNX Runtime.
- Opciones de despliegue: ONNX Runtime (Python, con `predict.py` y `requirements.txt`), ONNX Runtime Web en navegador (validado en Chrome); los pesos PyTorch se incluyen solo para procedencia y se recomienda cargarlos con `torch.load(path, map_location="cpu", weights_only=True)`.
- Latencia y rendimiento: no disponibles. Cabe señalar que cada inferencia requiere 129 llamadas al decoder (128 pasos autorregresivos más una final), por lo que el coste está dominado por ese bucle secuencial.
- Requisitos de software: Python 3.12 y las dependencias de `requirements.txt`.
- Almacenamiento: despreciable (tamaño de repositorio informado de 0,0 GB).

## Comparativa con modelos similares

| Modelo / enfoque | Tipo | Materiales | Formato y despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| MagNet-Transformers (este modelo) | Transformer encoder-decoder, por material | 10 de 15 | ONNX + PyTorch, CPU y web | MIT | Port numérico de inferencia heredada; sin métrica de generalización independiente |
| MagNet-AI (Chen et al.) | Red neuronal como sustituto de datasheet de magnéticos | no disponible en la informacion proporcionada | no disponible | no disponible | Citado en la bibliografía vinculada (IEEE Trans. Power Electron., vol. 38) |
| Modelos analíticos tipo Steinmetz / GSE / iGSE | Ecuación empírica de pérdidas | Genéricos, ajuste por material | Implementación propia | No aplica | Sin pesos ni inferencia neuronal; parámetros ajustados por curva, no comparables en parámetros totales |
| Otros participantes del MagNet Challenge | Modelos data-driven de varias arquitecturas | Conjunto público de 15 materiales | no disponible | no disponible | Repositorio magnetchallenge citado en las búsquedas; sin datos de parámetros en la información disponible |

No se dispone de cifras de parámetros, contexto ni rendimiento de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa queda como no disponible.

## Limitaciones y advertencias

- Los modelos no deben tratarse como datasheets de material validados, especialmente en puntos de operación extrapolados; el propio autor lo indica de forma explícita.
- Superar el test del casco convexo solo significa que el punto cae dentro del dominio geométrico medido; no es una garantía de exactitud. Los ejemplos devuelven predicción fuera del casco y la marcan.
- El split de entrenamiento original y la procedencia completa no se han reconstruido, y no se reclama ninguna métrica de generalización independiente. Las cuatro medidas de N87 usadas como comprobación de cordura pueden solaparse con los datos de entrenamiento.
- El conjunto de datos público minjiechen/MagNet no está establecido como el conjunto de entrenamiento exacto de estos checkpoints.
- Un resultado firmado negativo en la integral de pérdida debe inspeccionarse, no convertirse silenciosamente en un valor positivo.
- La cobertura es parcial: solo hay checkpoints para 10 de los 15 materiales del conjunto público de estado estacionario.
- Para formas de onda B personalizadas de 128 puntos, el test del casco de datos medidos queda indeterminado, porque el casco original usa una coordenada de duty de onda ideal.
- El duty de la onda triangular debe ser estrictamente mayor que 0 y menor que 1; la frecuencia debe ser estrictamente positiva y se requieren 128 muestras finitas y uniformemente espaciadas, sin muestra de cierre repetida.
- Riesgo de carga insegura de artefactos: no se deben ejecutar ficheros de modelo de fuentes no confiables ni usar carga de pickle sin restricciones; `predict.py` no carga los archivos PyTorch originales.
- No se documentan sesgos en el sentido de modelos de lenguaje, pero sí un sesgo de dominio: las predicciones dependen del rango de frecuencia, temperatura, sesgo DC y duty cubiertos por las medidas originales.
- Licencia MIT, lo que permite uso comercial y modificación siempre que se conserve el aviso de copyright y la atribución correspondiente; la procedencia original es el repositorio MagNet de Princeton, también bajo MIT.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/minjiechen/MagNet-Transformers
- Dataset relacionado: https://huggingface.co/datasets/minjiechen/MagNet
- Repositorio original de Princeton MagNet: https://github.com/PrincetonUniversity/magnet
- Repositorio MagNet (autor): https://github.com/minjiechen/MagNet
- Repositorio del MagNet Challenge: https://github.com/minjiechen/magnetchallenge
- Diapositivas "Design Methodologies for High Frequency Multiwinding Magnetics": https://www.princeton.edu/~minjie/files/chen_dmc_slides.pdf
- MagNet Challenge for Data-Driven Power Magnetics Modeling: https://www.researchgate.net/publication/384480794_MagNet_Challenge_for_Data-Driven_Power_Magnetics_Modeling
- A Data-Driven Model for Power Loss Estimation of Magnetic Materials (IEEE): https://ieeexplore.ieee.org/iel7/8782709/10366862/10502151.pdf
- Ficha de ponente de Minjie Chen en APEC 2026: https://apec2026.eventscribe.net/ajaxcalls/presenterInfo.asp?PresenterId=2269072
- Documento OSTI con referencias a MagNet-AI y al MagNet Challenge: https://www.osti.gov/servlets/purl/2522138
