# OtoroSI/MiniCPM-OCR-1.0-PL-otoro-si-Q8_0

## Resumen

MiniCPM-OCR-1.0-PL-otoro-si-Q8_0 es un ajuste fino (fine-tune) comunitario del modelo openbmb/MiniCPM-OCR-1.0, desarrollado por el usuario OtoroSI y publicado en Hugging Face. El modelo base es un sistema de reconocimiento óptico de caracteres (OCR) y comprensión de documentos de 752 millones de parámetros que combina un codificador visual SigLIP con un modelo de lenguaje de estilo Qwen3.5. El objetivo del ajuste es corregir un defecto concreto del modelo original: la pérdida sistemática de los diacríticos del polaco (ł→l, ą→a, ę→e, ź→z, entre otros) al transcribir texto.

El ajuste se realizó mediante LoRA de rango 16 aplicado únicamente al modelo de lenguaje, con el codificador visual y el proyector congelados, y los pesos resultantes se fusionaron y se publicaron en formato GGUF con cuantización Q8_0. La relevancia de esta ficha radica en que documenta un caso de especialización lingüística muy acotada sobre un modelo OCR multimodal pequeño, con métricas propias de evaluación y una descripción honesta de sus limitaciones, incluyendo que no supera a Tesseract ni a PP-OCRv6 en texto impreso limpio.

El modelo está pensado para su despliegue local mediante Ollama y para el reconocimiento de bloques de texto en imágenes de documentos, especialmente documentos en polaco con degradaciones de escaneo o fotografía. No es un modelo oficial de OpenBMB y su licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador visual SigLIP + modelo de lenguaje estilo Qwen3.5 (multimodal vision-language) |
| Parametros totales | 752.167.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como especificación oficial; en los ejemplos de uso se emplea num_ctx de 8192 |
| Tipos de cuantizacion | Q8_0 (LLM) + BF16 (proyector visual mmproj) |
| Idiomas soportados | pl, en (la model card menciona además chino, alemán, francés y checo sin regresión medible) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (LLM Q8_0 y mmproj BF16); el modelo base se distribuye también en safetensors |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del base: un codificador visual SigLIP que procesa la imagen, un proyector que traduce las representaciones visuales al espacio del modelo de lenguaje, y un LLM de estilo Qwen3.5 que genera la transcripción. El ajuste se aplicó exclusivamente sobre las capas lineales del modelo de lenguaje mediante LoRA (rango 16, alpha 32, dropout 0.05), con el ViT y el proyector congelados. Los hiperparámetros fueron: tasa de aprendizaje 1e-4 con decaimiento coseno y 5 por ciento de calentamiento, weight decay 0.1, batch efectivo de 16, longitud máxima de 2048, precisión BF16 y 2 épocas, usando el framework ms-swift en la bifurcación empleada en el tutorial de OpenBMB.

Los datos de entrenamiento fueron exclusivamente sintéticos (sin documentos privados), generados para reforzar la preservación de los diacríticos polacos. Los pesos LoRA se fusionaron en el modelo final. El proyector visual publicado es byte a byte idéntico al de OpenBMB (sha256 `ceed8226…4444682`). La plantilla de chat embebida es la del GGUF oficial, con el modo de razonamiento (thinking) desactivado; la model card advierte explícitamente de que no debe sustituirse por la plantilla del repositorio de Hugging Face, ya que Ollama colocaría la respuesta en el campo `thinking`.

## Capacidades

- Reconocimiento de texto en imágenes (OCR) con el prompt `Text Recognition:`.
- Reconocimiento de tablas con el prompt `Table Recognition:` (formato OTSL), sin cambios medibles respecto al base.
- Comprensión de documentos impresos, incluyendo renders limpios, degradaciones tipo escaneo y tipo fotografía.
- Preservación mejorada de los diacríticos polacos: del 68,9 por ciento al 94,0 por ciento en imágenes sintéticas y del 81,5 por ciento al 96,4 por ciento en escaneos reales.
- Salida conversacional en formato chat (pipeline image-to-text).
- Soporte multilingüe en polaco e inglés, con mención de chino, alemán, francés y checo sin regresión medible.
- Compatibilidad con endpoints y con Ollama mediante el Modelfile incluido.
- No dispone de tool calling, agentes ni modo de razonamiento extendido documentados.

## Casos de uso

- Digitalización de documentos administrativos y legales polacos: el modelo reconoce texto impreso con diacríticos correctamente en recortes de escaneos reales, con un CER del 0,55 por ciento en la evaluación del autor, lo que lo hace adecuado para pipelines de extracción de texto en gestorías y despachos.
- Procesamiento por regiones con detector de layout: la model card indica que el pipeline oficial del base usa PP-DocLayoutV3 más reconocimiento por región; este modelo encaja como motor de reconocimiento por bloque en ese flujo.
- OCR local en equipos de gama media: con unos 1 GB de memoria en Ollama (más el proyector) y 3,3 segundos por párrafo en una RTX 5060 Laptop de 8 GB, es viable en estaciones de trabajo sin GPU de datacenter.
- Extracción de texto de capturas y fotografías de documentos: el modelo rinde mejor que Tesseract en imágenes con degradación fotográfica (CER del 1,08 por ciento frente al 14,16 por ciento en el conjunto sintético con degradaciones).
- Indexación y búsqueda documental en corpus polacos: la mejora en la conservación de diacríticos reduce errores en la tokenización y en la búsqueda posterior sobre el texto extraído.
- Reconocimiento de tablas en documentos estructurados: mantiene la capacidad del base para tablas en formato OTSL, útil para extraer datos tabulares de facturas o informes.
- Prototipado rápido con Ollama: el repositorio incluye un Modelfile con dos líneas `FROM` y una plantilla, lo que permite crear el modelo local con un solo comando.

## Benchmarks y rendimiento

Resultados propios del autor, con el mismo script de evaluación para todos los motores. CER = tasa de error de caracteres tras normalizar espacios (menor es mejor). Letras PL = proporción de letras con diacrítico polaco correctamente presentes (mayor es mejor). Error de palabra = palabras de referencia ausentes en la salida.

Imágenes sintéticas reservadas (84 imágenes de texto, fuentes no usadas en entrenamiento, sin tablas):

| Motor | CER | Letras PL | Error de palabra |
|---|---|---|---|
| MiniCPM-OCR 1.0 base (Q8_0) | 2,63% | 68,9% | 14,1% |
| Este modelo (Q8_0) | 1,08% | 94,0% | 4,8% |
| Tesseract 5.4 (pol, psm 6) | 14,16% | 86,3% | 15,3% |
| PP-OCRv6 (pl, medium) | 1,61% | 88,3% | 5,3% |

Escaneos reales (11 recortes de documentos legales y administrativos polacos impresos, 1.098 palabras):

| Motor | CER | Letras PL | Error de palabra |
|---|---|---|---|
| MiniCPM-OCR 1.0 base (Q8_0) | 1,40% | 81,5% | 10,1% |
| Este modelo (Q8_0) | 0,55% | 96,4% | 2,5% |
| Tesseract 5.4 (pol, psm 6) | 0,25% | 100% | 1,2% |
| PP-OCRv6 (pl, medium) | 0,32% | 96,4% | 1,9% |

Comprobación de regresión (33 imágenes en inglés, chino, alemán, francés y checo): CER del base 0,21 por ciento, tras el ajuste 0,18 por ciento (BF16, pipeline de transformers). El reconocimiento de tablas (OTSL) no cambió en 10 tablas sintéticas en BF16/Q8_0.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1 GB para el LLM en Q8_0 más el proyector visual en BF16 (0,9 GB); el repositorio completo ocupa 1,7 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el autor probó con una RTX 5060 Laptop de 8 GB.
- Cabe en GPU de consumo: sí, en tarjetas de gama media con 4 GB o más.
- Despliegue: Ollama (probado por el autor mediante el Modelfile incluido); llama.cpp directo no fue probado por el autor.
- Latencia: unos 3,3 segundos por párrafo en GPU (RTX 5060 Laptop) y unos 15 segundos por recorte de 0,6 MP en CPU de 16 núcleos (Ryzen 9).
- Memoria en Ollama: aproximadamente 1 GB para el LLM más el proyector.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-OCR-1.0-PL-otoro-si-Q8_0 | 752 M | no disponible (ejemplos con 8192) | OCR multimodal especializado en polaco | Apache-2.0 | GGUF en Hugging Face, Ollama |
| openbmb/MiniCPM-OCR-1.0 (base) | 752 M | no disponible | OCR multimodal general | Apache-2.0 | Hugging Face, safetensors y GGUF |
| Tesseract 5.4 (pol) | no disponible (motor OCR clásico) | no disponible | OCR clásico | Apache-2.0 | Ampliamente disponible |
| PP-OCRv6 (pl, medium) | no disponible | no disponible | OCR clásico de PaddleOCR | Apache-2.0 | Disponible en PaddleOCR |

En texto impreso limpio, Tesseract y PP-OCRv6 superan a este modelo en CER (0,25 por ciento y 0,32 por ciento frente a 0,55 por ciento) y son más rápidos y ligeros. La ventaja de este modelo se concentra en imágenes con degradaciones fotográficas y en la conservación de diacríticos polacos.

## Limitaciones y advertencias

- No es un lanzamiento oficial de OpenBMB; es un ajuste comunitario.
- No supera a Tesseract ni a PP-OCRv6 en texto impreso limpio; en escaneos reales el CER de Tesseract es menor.
- No es adecuado para escritura manual: en seis páginas de microfilm borroso con manuscritos solo recuperó 8 de 339 palabras de referencia (aproximadamente el 2 por ciento) y en dos páginas alucinó texto fluido en inglés o latín inexistente.
- Riesgo de alucinación documentado en escaneos muy degradados; conviene verificar números, fechas y nombres contra el original en documentos importantes.
- No se ha probado con páginas completas: se recomienda alimentar un párrafo o bloque de texto a la vez (recortes de unos 0,6 MP funcionaron bien; el ajuste se entrenó con recortes de hasta 0,22 MP).
- La evaluación se basa en muestras pequeñas (84 imágenes sintéticas y 11 recortes de cuatro documentos), y las transcripciones de referencia se mecanografiaron consultando la salida del propio modelo, lo que puede favorecerlo ligeramente.
- La salida de Ollama varía ligeramente entre sesiones (una repetición dio un CER del 0,62 por ciento en lugar del 0,55 por ciento).
- No debe sustituirse la plantilla de chat embebida por la del repositorio de Hugging Face, ya que Ollama colocaría la respuesta en el campo `thinking`.
- Licencia Apache-2.0: permite uso comercial, pero al ser un ajuste comunitario conviene revisar los términos del modelo base y citar adecuadamente a OpenBMB.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OtoroSI/MiniCPM-OCR-1.0-PL-otoro-si-Q8_0
- Modelo base: https://huggingface.co/openbmb/MiniCPM-OCR-1.0
