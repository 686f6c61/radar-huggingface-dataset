# alastorid/TruFor-DnCNN-CoreML-FP16

## Resumen

TruFor DnCNN Core ML FP16 es una conversión parcial del modelo TruFor, un sistema de detección y localización de falsificaciones en imágenes presentado en CVPR 2023 por el grupo GRIP-UNINA (Universidad de Nápoles Federico II). Concretamente, este repositorio contiene únicamente la subred DnCNN Noiseprint++ de 17 convoluciones, convertida a Core ML con cómputo FP16 para su ejecución en Apple Silicon. No se trata de un modelo completo: el encoder CMX, las cabezas de localización y confianza y la cabeza de detección entrenada no están incluidos en el paquete.

El artefacto está pensado para integrarse en un pipeline más amplio (WaifuFinder) que ejecuta las etapas restantes con una implementación nativa en Swift/MLX en FP32. La entrada fija es de `[1, 3, 546, 546]` para RGB y `[1, 1, 546, 546]` para la máscara de validez, con un halo de 17 píxeles alrededor de cada tesela de salida de 512 píxeles. El modelo es relevante para desarrolladores que necesiten acelerar la fase de extracción de noiseprint en macOS sobre hardware Apple, a costa de una pérdida de precisión numérica documentada.

La licencia es restrictiva: GRIP-UNINA nonprofit, lo que limita uso, reproducción, modificación y redistribución a fines informativos y sin ánimo de lucro. El repositorio tiene un tamaño declarado de 0.0 GB y 8 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DnCNN (17 convoluciones) como subred de extracción de noiseprint dentro de TruFor |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada fija `[1, 3, 546, 546]` RGB + `[1, 1, 546, 546]` máscara de validez) |
| Tipos de cuantizacion | FP16 para pesos y activaciones internas; entradas RGB y máscara de validez en FP32; salida noiseprint en FP32 |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | grip-unina-trufor-nonprofit (uso informativo y sin ánimo de lucro) |
| Formato de pesos | `model.mlpackage` (Core ML, requiere compilación local en el Mac objetivo) |

## Arquitectura y entrenamiento

La subred convertida es un DnCNN de 17 capas convolucionales que actúa como extractor de Noiseprint++, la representación de ruido residual utilizada por TruFor para detectar manipulaciones de imagen. El modelo completo TruFor combina esta señal de ruido con pistas semánticas extraídas por un encoder CMX, y produce mapas de localización y una puntuación de confianza global. Este paquete contiene solo la primera etapa.

La conversión usa pesos FP16 y activaciones internas en FP16 donde Core ML lo soporta, manteniendo las entradas públicas y la salida en FP32. Las entradas se normalizan como sRGB opaco dividido por 256. El grafo se distribuye como `model.mlpackage` portable y debe compilarse localmente en el Mac destino antes de su uso. El runtime de inferencia es Apple Core ML con Swift/Objective-C nativo, sin Python en la ruta de inferencia.

No se proporcionan en la información disponible datos sobre el número de tokens, composición del dataset de entrenamiento, ni detalles de RLHF/DPO, ya que el modelo original es un detector de falsificaciones visuales, no un modelo generativo de lenguaje.

## Capacidades

- Extracción de noiseprint (Noiseprint++) a partir de una imagen RGB y una máscara de validez, como etapa previa a la detección de falsificaciones.
- Procesamiento por teselas de 512 píxeles con halo de 17 píxeles para reconstruir mapas de mayor resolución.
- Ejecución acelerada en Apple Silicon mediante Core ML con cómputo FP16.
- Integración en pipelines nativos Swift/Objective-C sin dependencia de Python.
- No incluye generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes ni capacidades multilingües.
- No incluye las cabezas de localización, confianza ni detección del TruFor completo; estas deben aportarse por separado.

## Casos de uso

- Análisis forense de imágenes en macOS: usar la subred como primer paso de un pipeline TruFor completo para extraer la huella de ruido antes de aplicar las cabezas de detección en FP32 nativo.
- Aceleración de la fase de extracción de características en aplicaciones de escritorio para Apple Silicon: sustituir la implementación FP32 del DnCNN por esta versión Core ML FP16 para reducir el coste computacional de esa etapa.
- Integración en herramientas de verificación de autenticidad de fotografías periodísticas o documentales, siempre que se complete el pipeline con las etapas restantes y se valide la calibración de las puntuaciones.
- Detección de manipulaciones locales en imágenes de alta resolución (por ejemplo, 4 MP) mediante procesamiento por teselas con halo, adecuado para flujos de revisión por lotes en estaciones de trabajo Mac.
- Prototipado de sistemas de peritaje de imagen en entornos de investigación sin ánimo de lucro, donde la licencia GRIP-UNINA es aplicable.
- Evaluación comparativa de efectos de cuantización FP16 frente a FP32 en modelos forenses, usando las métricas de error documentadas (error absoluto máximo 0.2437461019 y RMS relativo 0.5971685071 frente a la referencia MLX FP32 sobre el centro de 512×512 píxeles).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión de detección en la información disponible. Las únicas mediciones aportadas son de ingeniería, sobre una imagen de prueba de 2000×2000 en un Apple M4 con macOS 26.4.1:

| Metrica | Valor |
|---|---|
| Error absoluto maximo (FP16 Core ML vs MLX FP32, centro 512×512) | 0.2437461019 |
| Error RMS relativo (FP16 Core ML vs MLX FP32, centro 512×512) | 0.5971685071 |
| Error absoluto maximo (Core ML FP32 vs referencia) | 0.0004192144 |
| Error RMS relativo (Core ML FP32 vs referencia) | 0.0007005027 |
| Puntuacion del pipeline completo con DnCNN FP16 | 0.0847633481 |
| Puntuacion del pipeline completo todo FP32 nativo | 0.0779616311 |
| Desviacion de puntuacion | +8.72% |
| Tiempo de una prediccion completa | 12.61 s |
| Tiempos de trabajadores repetidos | 15.25 s y 12.24 s |
| Pico de proceso medido | 1.063 GB (presupuesto de 2 GB) |

El autor indica que estas son mediciones de ingeniería sobre una sola imagen, no una evaluación de precisión de detección con etiquetas.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido de GPU discreta; el pico de proceso medido es de 1.063 GB en Apple M4, dentro de un presupuesto de 2 GB por trabajador.
- GPU recomendadas: Apple Silicon (medido en M4); no se documentan pruebas en A100, H100 ni RTX 4090, y el artefacto Core ML está orientado a hardware Apple.
- Cabe en hardware de consumo Apple: sí, al menos en un Apple M4 según las mediciones aportadas.
- Opciones de despliegue: Apple Core ML con Swift/Objective-C nativo; requiere compilar `model.mlpackage` localmente en el Mac destino. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: una predicción completa del pipeline TruFor con esta etapa FP16 tardó 12.61 s en el fixture de 2000×2000; repeticiones de trabajadores de 15.25 s y 12.24 s. No se aportan cifras de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TruFor DnCNN Core ML FP16 (este) | no disponible | Entrada fija 546×546 RGB + máscara | Error FP16 documentado; sin benchmark de detección | grip-unina-trufor-nonprofit | Hugging Face, `model.mlpackage` |
| TruFor completo (GRIP-UNINA) | no disponible | Imagen completa con encoder CMX y cabezas | Resultados publicados en CVPR 2023 (no incluidos aquí) | GRIP-UNINA nonprofit | GitHub grip-unina/TruFor |
| Core ML FP32 del mismo DnCNN (referencia del autor) | no disponible | Entrada fija 546×546 | Error absoluto máximo 0.0004192144, RMS 0.0007005027 | GRIP-UNINA nonprofit | No distribuido en este repositorio |

No se dispone de datos comparativos con otros detectores de falsificación en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo completo: faltan el encoder CMX, las cabezas de localización y confianza y la cabeza de detección entrenada; sin esas etapas no produce una decisión de falsificación.
- La cuantización FP16 introduce diferencias intencionales en la puntuación y el noiseprint; el autor advierte que deben evaluarse en el flujo de trabajo previsto antes de interpretar las puntuaciones como probabilidades calibradas.
- Las mediciones aportadas corresponden a una sola imagen y a un solo equipo (Apple M4); no constituyen una evaluación de precisión de detección.
- Licencia restrictiva: uso, reproducción, modificación y redistribución limitados a fines informativos y sin ánimo de lucro; es obligatorio conservar los avisos originales y acreditar a los autores.
- El artefacto requiere compilación local en el Mac objetivo antes de su uso.
- No se documentan sesgos, cobertura idiomática ni riesgos de alucinación porque no es un modelo de lenguaje; cualquier evaluación de sesgo debe hacerse sobre el modelo TruFor completo.
- No se dispone de información sobre latencia o rendimiento en hardware distinto de Apple Silicon.

## Enlaces

- Hugging Face: https://huggingface.co/alastorid/TruFor-DnCNN-CoreML-FP16
- Repositorio original TruFor (GRIP-UNINA): https://github.com/grip-unina/TruFor
- Issue sobre licencia y redistribución: https://github.com/grip-unina/TruFor/issues/36
