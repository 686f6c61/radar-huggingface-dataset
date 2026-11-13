# M2key1/deepocr-v3

## Resumen

DeepOCR v3 es un modelo de reconocimiento óptico de caracteres (OCR) y de texto manuscrito (HTR) a nivel de línea, desarrollado por David Fleischhacker bajo el identificador M2key1. Resuelve un problema específico y bien delimitado: transcribir líneas de texto en documentos históricos impresos y manuscritos, cubriendo en un único checkpoint tipografías como Fraktur, Antiqua, Kurrent y escritura latina medieval y moderna. Frente a soluciones OCR generalistas, el modelo está entrenado desde cero sobre material histórico europeo, lo que lo orienta a colecciones de archivo, bibliotecas digitalizadas y proyectos de humanidades digitales.

Técnicamente, el modelo combina un backbone CNN agrupado con cuatro capas transformer de mezcla de expertos (64 expertos, 8 activos por columna más uno compartido) y una cabeza CTC sobre bytes, lo que le permite emitir cualquier carácter Unicode sin depender de un vocabulario cerrado. Cuenta con 170,5 M de parámetros y procesa una línea de imagen RGB escalada a 256 px de alto y hasta 6144 px de ancho. Se distribuye junto a un modelo de lenguaje KenLM de 6-gramas a nivel de byte que se fusiona en la búsqueda por haz para reducir errores.

Es relevante ahora porque el autor publica una versión posterior (DeepOCR v4) que mejora aproximadamente a la mitad los errores en letras manuscritas no vistas, lo que convierte a v3 en una referencia intermedia dentro de una línea de desarrollo activa. Su licencia Apache-2.0 y su integración como motor OCR de la herramienta DeepLabel facilitan su adopción en pipelines de digitalización sin restricciones comerciales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN agrupada + 4 capas transformer de mezcla de expertos (MoE) + cabeza CTC sobre bytes |
| Parámetros totales | 170,5 M |
| Parámetros activos | 8 expertos activos por columna de 64, más un experto compartido (número de parámetros activos no disponible) |
| Longitud de contexto | No aplica (entrada de una sola línea de imagen, hasta 6144 px de ancho y 256 px de alto) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (entrena sobre escritura latina histórica: Fraktur, Antiqua, Kurrent, latín medieval y moderno) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`.pt`), con la configuración de arquitectura embebida; KenLM en `.bin` y `.dict` |

## Arquitectura y entrenamiento

El modelo es un reconocedor de líneas de texto construido desde cero. Un backbone CNN con convoluciones agrupadas extrae características de la imagen de entrada, que se normaliza a 256 px de alto y admite hasta 6144 px de ancho. Sobre esas características operan cuatro capas transformer con mezcla de expertos: 64 expertos por capa con 8 activos por columna y un experto compartido adicional. La salida pasa por una cabeza CTC sobre un vocabulario de bytes de 261 tokens, lo que permite generar cualquier carácter Unicode sin un léxico predefinido.

El entrenamiento se realizó desde cero sobre conjuntos de datos públicos de impresión histórica y manuscrita. El modelo de lenguaje KenLM de 6-gramas a nivel de byte (`union_bytes_v3.bin`) se construyó a partir del mismo split de entrenamiento y se fusiona en la búsqueda por haz con un peso configurable (por defecto 1.0). Los pesos distribuidos corresponden a una media móvil exponencial (EMA). El modelo admite tres convenciones de transcripción configurables: `long_s` (ſ), `oblique_hyphen` (⸗) y `typographic_punctuation`, todas desactivadas por defecto.

## Capacidades

- Reconocimiento de texto a nivel de línea en imágenes RGB, con salida de texto Unicode arbitrario gracias a la cabeza CTC sobre bytes.
- Transcripción de impresión histórica: Fraktur, Antiqua y otras tipografías europeas.
- Reconocimiento de escritura manuscrita: Kurrent, latín medieval y moderno, y manos históricas europeas.
- Decodificación greedy, búsqueda por haz (beam width configurable, 10 en el ejemplo) y búsqueda por haz con fusión del KenLM.
- Convenciones de transcripción configurables para reproducir fielmente la ortografía histórica (s larga, guion oblicuo, puntuación tipográfica).
- Integración como motor OCR de la herramienta DeepLabel.
- No soporta tool calling, agentes, visión general ni audio: es un modelo especializado de image-to-text para líneas de texto.

## Casos de uso

- Digitalización de archivos históricos: transcripción de líneas segmentadas de documentos medievales y modernos en Fraktur o Kurrent, con la fusión KenLM reduciendo el CER a 3,03 % en la validación del autor.
- Proyectos de humanidades digitales: conversión de corpus impresos antiguos a texto plano indexable, aprovechando las convenciones de transcripción para preservar la s larga y la puntuación original.
- Bibliotecas y hemerotecas: procesamiento por lotes de páginas escaneadas tras una etapa de detección y segmentación de líneas, ya que el modelo lee una línea por imagen.
- Reconocimiento de correspondencia y manuscritos personales: transcripción de cartas y diarios en escritura cursiva europea, donde los OCR generalistas rinden peor.
- Enriquecimiento de metadatos y búsqueda full-text: alimentar motores de búsqueda sobre colecciones digitalizadas previamente no consultables.
- Herramientas de etiquetado y anotación: uso como motor OCR integrado en DeepLabel para asistir a anotadores humanos en la transcripción de documentos.
- Investigación en HTR: punto de partida para fine-tuning o comparación de metodologías, dado que el código, la arquitectura y el entrenamiento están publicados en GitHub.

## Benchmarks y rendimiento

CER sobre el split de validación reservado del autor, 25.000 líneas:

| Decodificación | CER |
|---|---|
| Greedy | 3,68 % |
| Beam 10 | 3,57 % |
| Beam 10 + KenLM, peso 1,0 | 3,03 % |

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) ni métricas sobre conjuntos externos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 170,5 M de parámetros, los pesos en precisión completa ocupan aproximadamente 0,7 GB, por lo que la inferencia cabe holgadamente en GPU de consumo.
- GPU recomendadas: cualquier GPU con CUDA; el ejemplo de uso selecciona CUDA si está disponible y recurre a CPU en caso contrario.
- Cabe en GPU de consumo: sí, por el tamaño del modelo (170,5 M de parámetros) y el tamaño del repositorio (0,8 GB).
- Opciones de despliegue: inferencia nativa en PyTorch mediante el módulo `infer` del repositorio (`load_model`, `transcribe_beam`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Enfoque | Contexto de entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepOCR v3 | 170,5 M | OCR/HTR de línea, CNN + MoE transformer + CTC sobre bytes | Línea de hasta 6144 × 256 px | Apache-2.0 | Hugging Face + GitHub |
| DeepOCR v4 | No disponible | OCR/HTR de línea con decodificador de subpalabras | No disponible | No disponible | Hugging Face |
| OCR generalistas (p. ej. Tesseract, TrOCR) | No disponible en la información | OCR de línea o página | No disponible | No disponible | No disponible |

La información proporcionada solo permite comparar con DeepOCR v4, del mismo autor, que añade un decodificador de subpalabras y reduce aproximadamente a la mitad los errores en letras manuscritas no vistas. No se dispone de datos de benchmarks frente a Tesseract, TrOCR u otros sistemas OCR en la información disponible.

## Limitaciones y advertencias

- Lee únicamente líneas individuales: requiere un detector o segmentador de líneas como etapa previa.
- El rendimiento es mejor sobre material similar al de entrenamiento (impresión y manuscritura europeas, de la Edad Media a la época moderna); la precisión cae en otros sistemas de escritura y manos atípicas.
- El KenLM favorece el texto de entrenamiento; en textos mayoritariamente numéricos o tabulares conviene reducir `LM_WEIGHT` o decodificar sin él.
- El modelo de lenguaje debe emparejarse exclusivamente con este checkpoint; no es intercambiable con otros.
- Riesgo de alucinación no cuantificado en la información disponible, si bien la fusión con un LM entrenado en el mismo dominio puede introducir sesgo hacia formas léxicas frecuentes del corpus.
- Sesgos conocidos: no documentados explícitamente; cabe esperar un sesgo hacia las convenciones ortográficas y tipográficas del material histórico europeo de entrenamiento.
- Licencia Apache-2.0: permite uso comercial, pero no se documentan garantías ni condiciones adicionales más allá de las de dicha licencia.
- Existe una versión posterior (v4) con mejoras sustanciales en manuscritos no vistos; para nuevos despliegues conviene evaluar esa versión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/M2key1/deepocr-v3
- DeepOCR v4: https://huggingface.co/M2key1/deepocr-v4
- Repositorio de código, entrenamiento y arquitectura: https://github.com/m2key1/DeepOCR
- Herramienta DeepLabel (OCR integrado): https://github.com/m2key1/DeepLabel
