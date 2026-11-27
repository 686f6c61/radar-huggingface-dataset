# HeOCR/heocr-p-hist-full

## Resumen

HeOCR P-hist FULL es un modelo de reconocimiento óptico de caracteres (OCR) basado en Tesseract, especializado en hebreo impreso histórico sin puntuación vocálica (unpointed). Lo desarrolla HeOCR y se distribuye bajo licencia Apache 2.0. El modelo parte de `Rivok/tesseract-heb-rivok` como base y se ha reentrenado con pares de líneas de texto histórico, lo que lo sitúa en el nicho del OCR para corpus hebreos antiguos, un dominio donde los motores genéricos rinden de forma deficiente por la variabilidad tipográfica y la ausencia de nikud.

La relevancia del modelo radica en su enfoque en un caso de uso muy concreto: digitalización de textos hebreos impresos históricos, como ediciones de dominio público de obras rabínicas y académicas. No es un modelo de lenguaje generativo, sino un modelo de reconocimiento de texto que se integra en la pila de Tesseract y produce transcripciones de líneas de imagen.

El repositorio tiene un tamaño de 0.0 GB según los metadatos de Hugging Face, lo que sugiere que los pesos no están alojados en el repositorio o que el artefacto es mínimo. La variante FULL se declara explícitamente como "unmeasured" (no evaluada), y el autor remite a la variante MEASURED v1.0 como estimación conservadora de su rendimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Tesseract (motor OCR LSTM, según la base `Rivok/tesseract-heb-rivok`) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo OCR por líneas, no generativo) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | hebreo (he) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio de 0.0 GB) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Tesseract, un motor OCR que combina análisis de componentes conexos con un reconocedor LSTM para la transcripción de líneas de texto. El punto de partida es `Rivok/tesseract-heb-rivok`, sobre el que se aplica un reentrenamiento específico para hebreo impreso histórico sin puntuación.

Los datos de entrenamiento declarados incluyen: el corpus HeOCR Hebrew Print Line Pairs v1 (DOI 10.5281/zenodo.24571580), con porciones públicas e internas firmadas de TRAIN; los pares de líneas de impresión histórica de Rivok (`Rivok/tesseract-heb-rivok-v2-lines`) usados como replay corregido; líneas sintéticas de impresión histórica S16-clean y de refit de HeOCR; y una adición DEV del tratado Mekhilta a partir de la edición de Hoffmann (dominio público) y el texto correspondiente de Sefaria (dominio público). Esta última es la única adición DEV. El autor advierte que la variante FULL no es elegible para evaluación en C2 DEV (incluido el panel Mekhilta DEV) ni en ninguna de las fuentes usadas en su entrenamiento.

## Capacidades

- Reconocimiento de texto hebreo impreso histórico sin puntuación vocálica (unpointed).
- Transcripción de líneas de imagen a texto, orientada a corpus de impresión histórica.
- Integración en la pila de Tesseract como modelo de reconocimiento.
- No soporta tool calling ni function calling (no es un modelo generativo).
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al hebreo.
- No dispone de modo thinking, visión general ni audio; la "visión" se limita a la entrada de imagen para OCR.

## Casos de uso

- Digitalización de ediciones históricas de dominio público: el modelo transcribe líneas de impresión hebrea antigua, adecuado para proyectos de bibliotecas digitales que trabajan con ediciones como la de Hoffmann o textos de Sefaria.
- Creación de corpus textuales para investigación: permite convertir facsímiles impresos en texto plano alineado por líneas, facilitando análisis filológicos y búsquedas sobre corpus rabínicos.
- Reentrenamiento y adaptación de motores Tesseract: al ser un modelo de reconocimiento sobre una base Tesseract, puede servir como punto de partida o componente en pipelines OCR existentes.
- Procesamiento por lotes de páginas escaneadas: su naturaleza de línea a línea lo hace apto para pipelines de digitalización masiva con segmentación previa de líneas.
- Mejora de OCR genérico en hebreo histórico: donde los modelos multilingües fallan por la ausencia de nikud y tipografías antiguas, este modelo está especializado en ese dominio.
- Preservación y acceso a patrimonio textual: útil para instituciones que necesitan hacer accesible texto hebreo impreso antiguo sin depender de servicios propietarios, gracias a la licencia Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que la variante FULL es "unmeasured" y remite a la variante MEASURED v1.0 como estimación conservadora, pero no se proporcionan cifras concretas en la información facilitada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de un modelo Tesseract, la inferencia es típicamente ligera y puede ejecutarse en CPU.
- GPU recomendadas: no disponible; no se especifican requisitos de GPU.
- ¿Cabe en GPU de consumo? No disponible; por la naturaleza de Tesseract, probablemente sí, pero no se confirma en la información.
- Opciones de despliegue: Tesseract (motor nativo); no se detallan otras opciones como vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|
| HeOCR P-hist FULL | OCR Tesseract | hebreo | Apache 2.0 | Hugging Face |
| Rivok/tesseract-heb-rivok | OCR Tesseract (base) | hebreo | no disponible | Hugging Face |
| HeOCR P-hist MEASURED v1.0 | OCR Tesseract | hebreo | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La variante FULL está declarada como no medida ("unmeasured"); su rendimiento real no está verificado y solo se estima a partir de la variante MEASURED.
- No es elegible para evaluación en C2 DEV ni en las fuentes usadas en su entrenamiento, lo que limita la validación independiente.
- Especializado únicamente en hebreo impreso histórico sin puntuación; no cubre hebreo moderno con nikud ni otros idiomas.
- No es un modelo generativo: no soporta razonamiento, tool calling ni agentes.
- Riesgo de errores de transcripción inherente al OCR sobre tipografías históricas y escaneos de calidad variable.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor remite a NOTICE para atribuciones y licencias de los datos de entrenamiento, que conviene revisar.
- El repositorio figura con tamaño 0.0 GB, por lo que la disponibilidad efectiva de los pesos debe verificarse antes de su uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HeOCR/heocr-p-hist-full
- Modelo base: https://huggingface.co/Rivok/tesseract-heb-rivok
- Variante medida: https://huggingface.co/HeOCR/heocr-p-hist-measured/blob/v1.0/README.md#held-out-evaluation-old-printed-hebrew-unpointed
- Dataset de pares de líneas: https://huggingface.co/datasets/Rivok/tesseract-heb-rivok-v2-lines
- Corpus HeOCR Hebrew Print Line Pairs v1: https://doi.org/10.5281/zenodo.24571580
- NOTICE (atribuciones y licencias de datos): https://huggingface.co/HeOCR/heocr-p-hist-full/blob/main/NOTICE
