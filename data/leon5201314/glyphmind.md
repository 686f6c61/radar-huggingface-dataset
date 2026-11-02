# Leon5201314/glyphmind

## Resumen

GlyphMind es un modelo de extracción de características (feature extraction) desarrollado por el usuario Leon5201314 que aborda el texto como imagen en lugar de como secuencia de tokens. Cada línea de texto se renderiza como una imagen de 64 × 768 píxeles en blanco y negro y se procesa con un vision transformer de 16 capas y anchura 1.024 sobre parches de 8 × 8 píxeles. El modelo no tiene tokenizador ni etiquetas de carácter: su única supervisión es qué dibujos comparten significado, de modo que el preentrenamiento acerca las representaciones de la misma frase escrita en distintos sistemas de escritura.

El repositorio publica dos variantes: GlyphMind-205M, preentrenada sobre 27 sistemas de escritura, y GlyphMind-205M-Lao, adaptada al lao (un idioma y escritura ausentes del preentrenamiento) sin traducciones al lao. Ambas contienen los pesos float32 del codificador y su cabeza de proyección, con 202,8 millones de parámetros. El modelo se distribuye como pesos PyTorch (`.pt`) acompañados de un script de demostración y las fuentes Noto empleadas en entrenamiento y evaluación.

La relevancia del modelo es metodológica: demuestra que es posible obtener embeddings de frases multilingües sin tokenizador, alineando sistemas de escritura dispares a través de la similitud visual y semántica. No obstante, se trata de modelos de investigación con rendimiento limitado (especialmente en lao) y sin código de entrenamiento publicado todavía.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision transformer (ViT) sobre imagen de línea de texto renderizada a 64 × 768 píxeles, parches de 8 × 8 |
| Parámetros totales | 202,8 M (codificador + cabeza de proyección, float32) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (limitada al ancho de una línea renderizada; las líneas demasiado anchas se cortan en un límite de palabra) |
| Tipos de cuantización | no disponible (solo se publican pesos float32) |
| Idiomas soportados | 27 sistemas de escritura en preentrenamiento; adaptación específica al lao; multilingüe por diseño visual |
| Licencia | CC BY 4.0 (pesos); MIT (script de demostración); SIL Open Font License 1.1 (fuentes) |
| Formato de pesos | PyTorch (`.pt`), float32 |

## Arquitectura y entrenamiento

GlyphMind es un transformer de visión de 16 capas con anchura 1.024 que opera sobre parches de 8 × 8 píxeles extraídos de una imagen de 64 × 768. Cada línea de texto se dibuja en negro sobre blanco con la fuente Noto correspondiente a su sistema de escritura, con un tamaño de fuente ajustado entre el 44 % y el 70 % de la altura. El modelo no dispone de tokenizador ni recibe etiquetas de carácter: la única señal de supervisión es qué dibujos comparten significado.

El preentrenamiento combina dos objetivos: por un lado, acercar las representaciones de la misma frase escrita en distintos sistemas de escritura; por otro, predecir las características de partes enmascaradas de cada dibujo (modelado enmascarado sobre la imagen). El modelo GlyphMind-205M se denomina así por su tamaño durante el preentrenamiento, que incluía una cabeza de predicción que no es necesaria para extraer características. La variante GlyphMind-205M-Lao se adapta al lao sin traducciones al lao, lo que constituye una de las aportaciones centrales del trabajo. Las características finales se obtienen como la media de los tokens finales tras la última normalización de capa, escaladas a longitud unitaria. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset, y el código de entrenamiento y adaptación se publicará tras la aceptación del paper.

## Capacidades

- Extracción de embeddings de frases a partir de imágenes de texto renderizado, sin tokenizador.
- Similitud semántica entre frases (sentence-similarity) mediante similitud coseno de las características.
- Recuperación cross-lingüe entre sistemas de escritura distintos (evaluada en ruso → inglés y lao → inglés).
- Soporte multilingüe basado en 27 sistemas de escritura vistos en preentrenamiento.
- Adaptación a sistemas de escritura no vistos (lao) sin traducciones supervisadas.
- Renderizado de texto a imagen con selección automática de fuente Noto según los caracteres de la línea.
- No dispone de generación de texto, tool calling, razonamiento multi-paso ni capacidades de agente: es exclusivamente un modelo de representación.
- No soporta visión general (imágenes naturales), audio ni modo thinking.

## Casos de uso

- Recuperación cross-lingüe de documentos: dado un conjunto de frases en un sistema de escritura y otro en distinto sistema, el modelo permite ordenar candidatos por similitud coseno de sus embeddings. Es adecuado para escenarios donde no se dispone de tokenizador común entre idiomas.
- Búsqueda semántica en corpus multilingües con escrituras dispares (cirílico, árabe, índicas, lao, etc.): el enfoque visual evita depender de segmentadores específicos por idioma.
- Investigación en representaciones libres de tokenizador: el modelo sirve como base experimental para estudiar alineamiento semántico a través de la forma visual de la escritura.
- Detección de pares de traducción en corpus paralelos: la similitud de embeddings permite identificar oraciones equivalentes entre dos idiomas con sistemas de escritura distintos, útil para minería de corpus.
- Evaluación de robustez frente a tipografías y sistemas de escritura: al depender de fuentes Noto, permite analizar cómo afecta la representación visual a la calidad del embedding.
- Prototipado de sistemas de adaptación a lenguas de bajos recursos: la variante Lao demuestra una metodología replicable para incorporar escrituras ausentes del preentrenamiento sin traducciones.
- Clasificación y agrupamiento de frases por significado en pipelines de NLP donde se prefiera una entrada visual unificada.

## Benchmarks y rendimiento

Resultados de recuperación reportados en la model card sobre NTREX-128 (1.997 frases por lado, ranking por similitud coseno):

| Modelo | Test | Top-1 | Top-5 | Valor en el paper |
|---|---|---|---|---|
| GlyphMind-205M | Ruso → inglés | 56,53 % | no disponible | 56,5 % (Fig. 2c) |
| GlyphMind-205M | Lao → inglés (`--pure`) | 1,45 % | 3,41 % | top-5 3,4 % (Fig. 3a) |
| GlyphMind-205M-Lao | Lao → inglés (`--pure`) | 6,56 % | 14,27 % | top-5 14,3 % (Fig. 3a) |
| GlyphMind-205M-Lao | Ruso → inglés | 44,42 % | no disponible | 44,4 % (Extended Data Table 1) |

Medidos con PyTorch 2.12.0 y Pillow 12.2.0 sobre una NVIDIA A100-SXM4-80GB. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos son float32 y suman 202,8 M de parámetros, aproximadamente 0,81 GB solo en pesos; con activaciones y procesamiento por lotes, el consumo es bajo y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; los resultados reportados se obtuvieron en una NVIDIA A100-SXM4-80GB, pero el modelo es pequeño y no requiere hardware de centro de datos.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares; también funciona en CPU (más lento, con posibles diferencias en el último dígito de los resultados según la model card).
- Opciones de despliegue: el repositorio proporciona un script de demostración en Python (`glyphmind_demo.py`) que usa PyTorch, NumPy, Pillow y huggingface_hub; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.
- Requisito adicional: Pillow necesita libraqm para dar forma a árabe, escrituras índicas, tailandés, lao y otros sistemas; el script avisa cuando falta.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables directos (embeddings de frases libres de tokenizador basados en imagen) en la documentación proporcionada. Como referencia de categoría, se pueden citar modelos de sentence-similarity textuales habituales, pero no se han publicado comparaciones en la información disponible.

| Modelo | Enfoque | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GlyphMind-205M | ViT sobre imagen de línea | 202,8 M | no disponible (una línea renderizada) | CC BY 4.0 | Pesos en HuggingFace |
| GlyphMind-205M-Lao | ViT adaptado al lao | 202,8 M | no disponible | CC BY 4.0 | Pesos en HuggingFace |
| Alternativas textuales de sentence-similarity | Tokenizador + transformer | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelos de investigación: la recuperación en lao está muy lejos de ser suficiente para traducción (top-1 del 6,56 % en la variante adaptada).
- Cada sistema de escritura se vio en una sola fuente durante el entrenamiento, lo que limita la generalización tipográfica.
- Solo se lee el primer ancho de línea de una frase: las líneas demasiado anchas se cortan en un límite de palabra, por lo que se pierde el resto del contenido.
- Sin tokenizador ni etiquetas de carácter, el modelo no ofrece alineamiento a nivel de token ni interpretabilidad basada en unidades lingüísticas.
- Riesgo de sesgo derivado de las fuentes Noto y de los 27 sistemas de escritura del preentrenamiento; las escrituras no vistas requieren adaptación.
- No se publican datos sobre alucinación (no genera texto) ni sobre sesgos demográficos o culturales.
- Restricciones de licencia: pesos bajo CC BY 4.0 (permite uso comercial con atribución); el script de demostración es MIT; las fuentes son SIL OFL 1.1.
- El código de entrenamiento, los corpus de adaptación y el resto de modelos del paper no están incluidos todavía; se publicarán tras la aceptación del paper.
- El paper está en revisión y el enlace al preprint aún no está disponible.
- Requiere libraqm para el renderizado correcto de varios sistemas de escritura; sin él, la calidad de los embeddings puede degradarse.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Leon5201314/glyphmind
- Dataset NTREX (usado en la evaluación): https://github.com/MicrosoftTranslator/NTREX
- Preprint del paper: no disponible (en revisión según la model card)
