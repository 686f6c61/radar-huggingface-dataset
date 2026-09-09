# amad-iq/amad-vlm7

## Resumen

amad-vlm7 es un modelo vision-language de clase 7B desarrollado por amad-iq, especializado en el reconocimiento óptico de caracteres (OCR) de texto árabe. Su característica principal es que genera un bloque de razonamiento explícito antes de emitir la transcripción final, lo que le permite verificar palabras dudosas y aprovechar el contenido semántico del documento. Según la model card, es el sistema mejor puntuado en KITAB-Bench `ocr-eval`, superando a Gemini-2.0-Flash, GPT-4o y al modelo especializado AIN-7B.

El modelo se entrenó mediante aprendizaje por refuerzo con recompensa verificable (RLVR), donde las transcripciones candidatas se puntúan por su precisión de caracteres. La arquitectura es image-text-to-text con entrada de imagen y salida de texto; el tamaño es aproximadamente de 7.000 millones de parámetros. No se ha publicado la longitud de contexto. Los pesos son cerrados y el acceso solo se gestiona a través de amad-iq.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language (image-text-to-text) con bloque de razonamiento explícito |
| Parámetros totales | Aproximadamente 7.000 millones (clase 7B; valor exacto no disponible) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Árabe (ar) |
| Licencia | No disponible (modelo de pesos cerrados) |
| Formato de pesos | No disponible (pesos cerrados) |

## Arquitectura y entrenamiento

La arquitectura interna no se detalla en la información disponible. Se trata de un modelo vision-language con pipeline `image-text-to-text` que recibe una imagen y produce una transcripción en árabe precedida de un bloque de pensamiento. El entrenamiento se realizó con aprendizaje por refuerzo basado en una recompensa verificable: el modelo genera transcripciones candidatas, cada una se puntúa contra la verdad de fondo mediante precisión de caracteres, y los comportamientos que aumentan la precisión se refuerzan. La model card indica que la penalización más fuerte recayó sobre los bucles de repetición y las salidas truncadas, fallos habituales en páginas grandes. Además, el razonamiento se volvió más conciso: la longitud media del bloque de pensamiento pasó de 287 a 133 tokens mientras la precisión aumentó.

## Capacidades

- Razonamiento explícito: emite un bloque de pensamiento antes de la transcripción final, revisando línea a línea y rehaciendo los pasajes dudosos.
- OCR de texto árabe en imágenes: texto impreso, manuscrito, manuscrito histórico, texto de escena, diapositivas y tablas.
- Comprensión semántica: identifica el contenido (por ejemplo, un poema) para validar la ortografía de los caracteres.
- Optimización específica para precisión de caracteres: con RLVR, el modelo penaliza directamente los errores de carácter, así como las repeticiones y cortes.
- Visión: entrada de imagen, salida de texto. No se documentan capacidades de código, matemáticas o audio.
- Soporte de tool calling / function calling: no disponible (no se menciona).
- Soporte de agentes y multi-step reasoning: el razonamiento interno multi-paso es una capacidad clave, aunque no se documentan herramientas para agentes.
- Multilingüe: específicamente árabe (ar); no se documentan otros idiomas.

## Casos de uso

- Digitalización de manuscritos históricos árabes: el modelo razona línea a línea y conserva diacríticos, lo que lo hace adecuado para archivos y bibliotecas que necesitan transcripciones fiables de textos antiguos. En el conjunto de libros históricos, la CER descendió a 0.10.
- OCR de documentos administrativos y legales en árabe: la alta precisión de caracteres reduce los errores en nombres y cifras. Puede integrarse en flujos de indexación documental donde el WER bajo (0.262 en KITAB-Bench) es crítico.
- Transcripción de poesía árabe: al reconocer la obra, el modelo ajusta la ortografía y las variantes de un punto, como se muestra en el ejemplo del panel caligráfico de Diʿbil al-Khuzāʿī.
- Accesibilidad para personas con discapacidad visual: convierte texto árabe en imágenes en texto legible, aprovechando el bloque de razonamiento para desambiguar pasajes oscuros o borrosos.
- Investigación académica sobre textos árabes: los investigadores pueden solicitar acceso al modelo para comparar transcripciones en corpus propios y evaluar su rendimiento frente a herramientas clásicas como Tesseract o EasyOCR.
- Reconocimiento de texto de escena y señalética: en fotografías de carteles, letreros o diapositivas de presentaciones, el modelo transcribe texto árabe con razonamiento previo, lo que mejora la robustez frente a oclusiones o mala iluminación.

## Benchmarks y rendimiento

Resultados publicados por el autor en KITAB-Bench `ocr-eval`, sobre 13 datasets y 3.760 imágenes. No se dispone de benchmarks externos independientes. Las métricas de amad-vlm7 se obtuvieron con un presupuesto de 4.096 tokens para el bloque de pensamiento, que se retira antes de puntuar; las líneas base se evaluaron con un presupuesto de 500 tokens.

| Modelo | CHrF ↑ | CER ↓ | WER ↓ |
|---|---:|---:|---:|
| **amad-vlm7** | **82.69** | **0.125** | **0.262** |
| amad-vlm5 | 81.05 | 0.254 | 0.362 |
| AIN-7B | 78.33 | 0.20 | 0.28 |
| Gemini-2.0-Flash | 77.95 | 0.13 | 0.32 |
| GPT-4o | 61.01 | 0.31 | 0.55 |
| Qwen2.5-VL-7B | 49.23 | 1.20 | 1.41 |
| GPT-4o-mini | 47.21 | 0.43 | 0.71 |
| EasyOCR | 45.47 | 0.58 | 0.89 |
| Tesseract | 39.62 | 0.54 | 0.84 |
| Qwen2-VL-7B | 33.94 | 1.48 | 1.55 |
| Surya | 20.61 | 4.95 | 5.61 |
| Paddle | 16.73 | 0.79 | 1.02 |

## Requisitos de hardware

- VRAM estimada: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no publicado. Al ser de pesos cerrados, la evaluación y el despliegue se gestionan a través de amad-iq.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | CHrF KITAB-Bench | Licencia | Disponibilidad |
|---|---|---:|---|---|---|
| **amad-vlm7** | ~7B | No disponible | 82.69 | No disponible | Cerrado, acceso vía amad-iq |
| amad-vlm5 | No disponible | No disponible | 81.05 | Apache-2.0 | Público (predecesor abierto) |
| AIN-7B | 7B (por nombre) | No disponible | 78.33 | No disponible | No disponible |
| Gemini-2.0-Flash | No disponible | No disponible | 77.95 | No disponible | No disponible |
| Qwen2.5-VL-7B | 7B | No disponible | 49.23 | No disponible | No disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos en la información disponible. El modelo está entrenado para texto árabe; su rendimiento fuera de este dominio no está evaluado.
- Riesgo de alucinación: en el ejemplo mostrado, el modelo comete tres deslices de un punto o variante ortográfica sobre 140 caracteres (CER 0.02). El predecesor amad-vlm5 llegó a inventar palabras en el mismo panel, por lo que el riesgo existe y no está cuantificado formalmente.
- Limitaciones de contexto e idioma: la longitud de contexto no se ha publicado. En escritura densa multi-línea, el modelo a veces se detiene después de las primeras líneas.
- Restricciones de licencia: modelo de pesos cerrados sin licencia especificada. El uso, incluido el comercial, requiere un acuerdo con amad-iq.
- Limitaciones del benchmark: KITAB-Bench mide transcripción de imágenes a resolución de benchmark; no mide layout, tablas como estructura ni velocidad. Los resultados provienen de una única ejecución.

## Enlaces

- Modelo principal: https://huggingface.co/amad-iq/amad-vlm7
- Predecesor abierto amad-vlm5: https://huggingface.co/amad-iq/amad-vlm5
- Predecesor abierto amad-vlm6: https://huggingface.co/amad-iq/amad-vlm6
- GitHub del autor: https://github.com/murtadha-lap
- Imagen de ejemplo del panel caligráfico: https://huggingface.co/amad-iq/amad-vlm7/resolve/main/assets/afatim-panel.jpg
