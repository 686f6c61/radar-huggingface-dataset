# Sky-Kim/com.sky.sentis.plate-ocr-kr

## Resumen

sentis-plate-ocr-kr es un modelo de reconocimiento óptico de caracteres (OCR) especializado en matrículas de coche surcoreanas, desarrollado por Sky-Kim y publicado bajo licencia MIT. Se distribuye como un fichero de pesos en formato `.sentis` para su uso con Unity Inference Engine (Sentis), lo que permite ejecutar la inferencia completamente en el dispositivo sin dependencias de servidores externos. El modelo lee matrículas largas de una sola fila del tipo `12가 3456` o `123가 4567`, combinando dígitos arábigos con sílabas Hangul.

Técnicamente se trata de una red convolucional con decodificación CTC de aproximadamente 840.843 parámetros, entrenada desde cero sin pesos preentrenados ni imágenes reales de matrículas. La entrada es una imagen RGB de 32 x 128 píxeles normalizada en el rango 0-1 y la salida son logits de 32 pasos temporales sobre 43 clases (una clase en blanco para CTC, 10 dígitos y 32 sílabas Hangul). El modelo se acompaña de `PlateLocator.cs`, un localizador de matrícula sin modelo que recorta la banda de la matrícula a partir de la detección de vehículo.

Su relevancia es acotada pero concreta: cubre un caso de uso de ANPR (reconocimiento automático de matrículas) en simulación Unity y en prototipos de visión embebida, con una precisión de coincidencia exacta del 76,8 % por fotograma en placas no vistas. El autor advierte explícitamente que las matrículas del mundo real (otras tipografías, placas de dos filas, sílabas comerciales o de alquiler, suciedad, reflejos) quedan fuera de la distribución de entrenamiento y requieren ajuste fino antes de un uso real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN con 5 bloques convolucionales + convoluciones 1-D y decodificacion CTC (sin RNN) |
| Parametros totales | 840.843 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada de imagen fija de 32 x 128 px, 32 pasos temporales CTC) |
| Tipos de cuantizacion | no disponible (se distribuye un unico fichero `plate_ocr_kr_fp32.sentis` en FP32) |
| Idiomas soportados | digitos 0-9 y 32 silabas Hangul (coreano) |
| Licencia | MIT |
| Formato de pesos | `.sentis` (Unity Sentis); scripts de entrenamiento y exportacion en `Training~/` |

## Arquitectura y entrenamiento

La red consta de cinco bloques convolucionales que reducen el recorte de entrada de 32 x 128 píxeles a una fila de características de 1 x 32, seguida de convoluciones 1-D que producen 32 pasos temporales sobre 43 clases. La cabeza de salida es CTC con una clase en blanco, 10 dígitos y 32 sílabas Hangul (`가나다라마거너더러머버서어저고노도로모보소오조구누두루무부수우주`). La ausencia de capas recurrentes es una decisión deliberada para garantizar una importación sin problemas en Sentis.

El entrenamiento se realizó desde cero en PyTorch sobre Apple Silicon (MPS, con la pérdida CTC en CPU por falta de soporte en MPS), a unas 4-5 segundos por época. Los datos proceden de la propia simulación urbana de Unity del proyecto: cada coche recibe una matrícula larga coreana renderizada con TextMesh en Apple SD Gothic Neo, dos cámaras ANPR sintéticas capturan bandas de matrícula y las etiquetas se generan automáticamente proyectando los centros de matrícula en la cámara. Se recopilaron 10.523 bandas, de las que quedaron 9.578 recortes ajustados tras aplicar el localizador, cubriendo 1.139 números de matrícula distintos. La partición es por número de matrícula (950 para entrenamiento con 7.934 recortes, 189 reservados con 1.644 recortes), de modo que la métrica mide la lectura de números nuevos y no la memorización de fotogramas. Cada época combina los recortes capturados con el mismo número de placas sintéticas generadas con PIL sobre bandas de color de coche con clutter de pilotos traseros. La aumentación incluye jitter de recorte (±5 % horizontal, ±12 % vertical), redimensionado descendente y ascendente al 45-100 %, desenfoque gaussiano, brillo, contraste y ruido. Se usó AdamW con one-cycle y pico de 2e-3, weight decay 1e-4, batch de 64, 30 épocas y pérdida CTC, conservando el checkpoint con mejor puntuación en validación.

## Capacidades

- Reconocimiento de matrículas largas coreanas de una sola fila con formato de 2 o 3 dígitos, una sílaba Hangul y 4 dígitos.
- Decodificación CTC voraz integrada en `KoreanPlateOcr.cs`, con salida de texto y puntuación de confianza.
- Localización de la matrícula dentro de la banda de matrícula del vehículo mediante `PlateLocator.Locate`, sin modelo adicional.
- Ejecución en GPU mediante `BackendType.GPUCompute` de Unity Sentis, con estiramiento del recorte a 128 x 32 en GPU.
- Función `IsPlate(text)` para validar si la cadena leída tiene formato de matrícula.
- `Snapshot()` para copiar la última entrada del modelo a una `Texture2D`, útil para HUD o depuración.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni otras modalidades (audio, vídeo, lenguaje natural general).
- Soporte multilingüe limitado al conjunto de caracteres coreano indicado; no reconoce otras escrituras.

## Casos de uso

- Simulación de tráfico en Unity: el modelo lee las matrículas de los vehículos del propio entorno simulado, donde cada coche tiene una matrícula renderizada, permitiendo construir sistemas ANPR de prueba sin datos reales etiquetados.
- Prototipado de ANPR en dispositivos embebidos: al ser un modelo de 0,8 M de parámetros en formato Sentis, se puede desplegar en hardware con recursos limitados para validar pipelines de captura, localización y lectura antes de invertir en un modelo mayor.
- Control de acceso en parkings simulados o demostradores: integrado con `PlateLocator` y votación multi-fotograma, permite registrar entradas y salidas de vehículos en un entorno controlado con matrículas del formato coreano no comercial.
- Educación y demostración técnica: sirve como ejemplo completo de pipeline OCR con CTC en Unity, incluyendo captura automática de datos, generación de etiquetas por proyección y exportación a Sentis.
- Generación de datos sintéticos para otros modelos: los scripts de `Training~/` (captura, `make_tight.py`, `data.py`) permiten producir recortes etiquetados de matrículas coreanas para preentrenar o aumentar otros sistemas de OCR.
- Base para ajuste fino en dominio real: partiendo de los pesos y del pipeline de entrenamiento incluidos, un equipo puede reentrenar con imágenes reales de matrículas coreanas para reducir la brecha de distribución.
- Votación multi-fotograma en vídeo: el propio autor recomienda agregar lecturas de varios fotogramas del mismo vehículo y quedarse con la de mayor confianza, lo que encaja en aplicaciones de vídeo continuo donde un solo fotograma no basta.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| Coincidencia exacta por fotograma (held-out) | 76,8 % | 189 matrículas no vistas, 1.644 recortes, mejor checkpoint en época 21 |
| Coincidencia exacta en época 4 | ~70 % | Lectura de matrículas completas tras aprender primero los dígitos |
| Parametros | 840.843 | Modelo completo en FP32 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que el modelo no es un modelo de lenguaje. El autor documenta además un fallo cualitativo: con una banda de solo 137 px de ancho el modelo lee `모` como `보`, lo que ilustra la sensibilidad a la resolución efectiva de la matrícula.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 840.843 parámetros en FP32 el peso de los parámetros ronda los 3,4 MB, más las activaciones de una entrada de 32 x 128, por lo que cabe en cualquier GPU con unos pocos cientos de MB libres.
- GPU recomendadas: cualquier GPU compatible con Unity Sentis, incluidas GPU integradas y GPUs de portátil; no requiere A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna e incluso en hardware móvil o embebido compatible con Sentis.
- Opciones de despliegue: Unity Inference Engine (Sentis) con `BackendType.GPUCompute`; los scripts de entrenamiento y exportación están en `Training~/`, pero no se documentan exportaciones a vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles de forma numérica; el autor indica que el recorte se estira a 128 x 32 en GPU y que el modelo es pequeño, pero no publica medidas de latencia ni de fotogramas por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sentis-plate-ocr-kr | 840.843 | Imagen 32 x 128 px | 76,8 % exact-match por fotograma en held-out | MIT | Hugging Face, formato `.sentis` |
| OCR de propósito general (p. ej. PaddleOCR, TrOCR) | no disponible en la informacion | no disponible | no disponible | varía según modelo | no disponible en la informacion |
| Detectores/lectores ANPR comerciales | no disponible | no disponible | no disponible | propietaria | no disponible |

No se dispone en la información proporcionada de datos comparativos verificables con alternativas de la misma categoría; la comparación anterior solo señala la existencia de familias alternativas sin cifras contrastadas.

## Limitaciones y advertencias

- Precisión limitada: 76,8 % de coincidencia exacta por fotograma en placas no vistas; un solo fotograma no es suficiente para una lectura fiable y el autor recomienda votar sobre varios fotogramas.
- Dominio de entrenamiento sintético: los datos provienen de una simulación Unity con una tipografía concreta (Apple SD Gothic Neo) y sin imágenes reales de matrículas; otras tipografías, placas de dos filas, sílabas comerciales o de alquiler, suciedad y reflejos quedan fuera de distribución.
- Conjunto de caracteres restringido: solo dígitos 0-9 y 32 sílabas Hangul de matrículas no comerciales de pasajeros; no cubre el resto del Hangul ni otros idiomas.
- Dependencia del localizador: el modelo fue entrenado con recortes producidos por `PlateLocator`, por lo que usar otro método de recorte degrada la precisión; el autor pide explícitamente usar su localizador.
- Sensibilidad a la resolución: bandas estrechas (por ejemplo, 137 px de ancho) provocan confusiones entre sílabas.
- Riesgo de alucinación: como todo modelo CTC, puede emitir secuencias plausibles pero incorrectas; debe validarse con `IsPlate` y con umbrales de confianza.
- Sesgos: no documentados por el autor; el entrenamiento sintético puede introducir sesgos hacia las condiciones de renderizado de la simulación.
- Licencia MIT: permite uso comercial y modificación, pero el autor advierte que es necesario ajustar el modelo con datos reales antes de usarlo en producción.
- Sin soporte de lenguaje natural, tool calling ni agentes: no debe evaluarse como un modelo de lenguaje.

## Enlaces

- Hugging Face: https://huggingface.co/Sky-Kim/com.sky.sentis.plate-ocr-kr
- Imagen de muestras held-out: https://huggingface.co/Sky-Kim/com.sky.sentis.plate-ocr-kr/resolve/main/Documentation~/samples.png
- Curva de entrenamiento: https://huggingface.co/Sky-Kim/com.sky.sentis.plate-ocr-kr/resolve/main/Documentation~/training.png
