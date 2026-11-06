# saraaedan/arsl-alphabet-transformer-v5

## Resumen

El modelo `saraaedan/arsl-alphabet-transformer-v5` es un clasificador de letras del alfabeto de la lengua de signos árabe (ArSL, Arabic Sign Language) desarrollado por el usuario `saraaedan`. No es un modelo generativo de lenguaje, sino un transformer encoder de pequeño tamaño que recibe secuencias de landmarks de manos extraídos con MediaPipe y predice una de 39 clases correspondientes a letras del alfabeto ArSL del corpus KArSL-502. El problema que resuelve es el reconocimiento aislado de letras signadas en tiempo real, un componente habitual en sistemas de traducción de lengua de signos.

Arquitectónicamente es un transformer encoder compacto (3 capas, 4 cabezas de atención, dimensión de modelo 128) con pooling medio enmascarado sobre 28 fotogramas a 30 fps. Cada fotograma contiene los landmarks de dos manos (2 x 21 puntos x 3 coordenadas), normalizados por mano con origen en la muñeca y escala basada en el tamaño de la palma. La salida es una distribución sobre 39 clases.

Su relevancia es limitada pero concreta: ofrece un punto de partida reproducible para reconocimiento de letras ArSL con evaluación leave-one-signer-out (LOSO), una métrica más exigente que la validación aleatoria y más representativa del uso real con signantes no vistos. No obstante, el modelo se entrenó con solo tres signantes y su evaluación en vivo es piloto, lo que restringe seriamente su generalización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (3 capas, 4 cabezas, d_model 128) con masked mean pooling |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 28 fotogramas a 30 fps (secuencia fija de entrada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (clasificación de lengua de signos, no texto); etiquetas en ArSL |
| Licencia | MIT |
| Formato de pesos | pytorch_model.bin (PyTorch) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder de 3 capas con 4 cabezas de atención y dimensión oculta de 128. La entrada son 28 fotogramas (a 30 fps) de landmarks de mano extraídos con MediaPipe: dos manos, 21 puntos por mano, 3 coordenadas por punto. Cada mano se normaliza de forma independiente tomando la muñeca como origen y la distancia de la palma como factor de escala, lo que aporta invariancia a traslación y tamaño. Sobre la secuencia de tokens resultante se aplica un pooling medio enmascarado y una cabeza de clasificación de 39 clases.

El entrenamiento utilizó los tres signantes disponibles en el corpus KArSL-502, con aumentación de datos, durante 24 épocas (mediana de la mejor época en las ejecuciones LOSO). La evaluación se realizó con validación cruzada leave-one-signer-out (3 folds x 5 semillas), lo que mide la capacidad de generalizar a signantes no vistos. No se documenta el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF/DPO, que no aplican a una tarea de clasificación supervisada.

## Capacidades

- Clasificación de 39 letras del alfabeto ArSL a partir de secuencias de landmarks de mano.
- Reconocimiento con dos manos simultáneas (2 x 21 landmarks x 3 coordenadas por fotograma).
- Invariacia a traslación y escala gracias a la normalización por muñeca y tamaño de palma.
- Inferencia en tiempo real con ventana de 28 fotogramas a 30 fps.
- Salida de distribución sobre 39 clases, con umbral de confianza configurable (0,484 en la configuración en vivo).
- No soporta generación de texto, tool calling, agentes, visión general ni audio.
- No es multilingüe: está especializado exclusivamente en el alfabeto ArSL de KArSL-502.

## Casos de uso

- Reconocimiento de letras en tiempo real en aplicaciones de accesibilidad: el modelo consume landmarks de MediaPipe a 30 fps y clasifica letras ArSL con un umbral de confianza de 0,484, adecuado para interfaces de deletreo asistido.
- Prototipos de traducción de lengua de signos: puede actuar como módulo de reconocimiento de letras dentro de un pipeline mayor que componga palabras o frases a partir de la secuencia de clasificaciones.
- Investigación en reconocimiento de lengua de signos: sirve como baseline reproducible con evaluación LOSO (79,42 ± 6,81 % de precisión, macro-F1 77,30 %, top-5 95,34 %) para comparar nuevas arquitecturas o estrategias de aumentación.
- Herramientas educativas para aprendizaje de ArSL: un sistema que valide si el signante realiza correctamente una letra comparando la predicción del modelo con la etiqueta esperada.
- Integración en aplicaciones móviles o de escritorio con webcam: al depender solo de landmarks (no de píxeles), el coste computacional es bajo y puede ejecutarse en CPU o GPU modesta.
- Evaluación de robustez frente a signantes: el modelo permite medir la degradación de precisión al cambiar de signante, útil para estudiar la varianza inter-signante en ArSL.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precision signer-independent (LOSO, 3 folds x 5 semillas) | 79,42 ± 6,81 % |
| Macro-F1 | 77,30 % |
| Top-5 accuracy | 95,34 % |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el modelo es un transformer de 3 capas y d_model 128, por lo que cabe holgadamente en cualquier GPU consumer (incluso < 1 GB en FP32, aunque el dato exacto no está disponible).
- GPU recomendadas: no se requieren; cualquier GPU con soporte PyTorch (RTX 3060, RTX 4090, A100, H100) es sobredimensionada. Funciona en CPU.
- Cabe en GPU consumer: sí, en cualquier GPU moderna e incluso en CPU.
- Opciones de despliegue: PyTorch nativo (pytorch_model.bin + model.py + preprocessing.py); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles; al operar sobre 28 fotogramas de landmarks y una red de 3 capas, la latencia esperada es de milisegundos, pero no se publican cifras.

## Comparativa con modelos similares

No disponible. No se han proporcionado modelos comparables de reconocimiento de letras ArSL basados en landmarks en la información disponible.

## Limitaciones y advertencias

- Entrenado únicamente con tres signantes de KArSL-502, lo que limita la generalización a nuevos signantes; la propia model card lo señala como limitación.
- La evaluación en vivo es piloto y no se ha validado en un estudio amplio.
- Varianza alta en la métrica LOSO (± 6,81 %), lo que indica sensibilidad al signante retenido.
- Riesgo de confusión entre letras visualmente similares; el top-5 (95,34 %) supera ampliamente al top-1 (79,42 %).
- Depende de la calidad de los landmarks de MediaPipe; oclusiones, mala iluminación o manos fuera de encuadre degradan la entrada.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías sobre el rendimiento en producción.
- El repositorio figura con 0 GB y 0 descargas; el artefacto puede no estar completamente disponible o ser de creación reciente.

## Enlaces

- Hugging Face: https://huggingface.co/saraaedan/arsl-alphabet-transformer-v5
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
