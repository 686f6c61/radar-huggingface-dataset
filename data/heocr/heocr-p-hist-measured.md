# HeOCR/heocr-p-hist-measured

## Resumen

HeOCR P-hist MEASURED es un modelo de reconocimiento óptico de caracteres (OCR) especializado en hebreo impreso histórico sin puntuación vocálica (unpointed). Lo desarrolla HeOCR y se distribuye como un ajuste fino (fine-tune) del modelo Tesseract Rivok Full, partiendo de `Rivok/tesseract-heb-rivok`. No es un modelo de lenguaje generativo ni un transformer: es un modelo de reconocimiento de texto basado en el motor Tesseract, empaquetado con sus propios datos de entrenamiento y evaluación.

El problema que aborda es concreto: el OCR estándar de Tesseract para hebreo rinde mal sobre tipografías antiguas, y este modelo busca reducir la tasa de error de caracteres (CER) en ese dominio específico. Según la model card, el ajuste se hizo con pares de líneas del corpus HeOCR P-hist v1, repetición (replay) de Rivok v2 y líneas sintéticas de imprenta, usando únicamente el conjunto TRAIN.

Su relevancia es acotada pero clara para proyectos de digitalización de patrimonio bibliográfico hebreo: la variante MEASURED reporta una CER del 14,71 % en un conjunto de evaluación abierto y congelado (C2 P-hist-open v0.1), frente al 16,59 % de Rivok Full y el 33,02 % del Tesseract `heb` estándar (tessdata_best). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0,0 GB, lo que sugiere que los artefactos pueden no estar publicados o son de muy pequeño tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tesseract (motor OCR LSTM, no transformer); fine-tune int8 de Rivok Full |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo OCR por líneas, no generativo) |
| Tipos de cuantizacion | int8 (entrenado como fine-tune int8) |
| Idiomas soportados | hebreo (he), específicamente hebreo impreso histórico sin puntuación |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio de 0,0 GB; probablemente artefactos Tesseract `traineddata`, sin confirmar) |

## Arquitectura y entrenamiento

El modelo se basa en el motor de reconocimiento de Tesseract, que emplea una red LSTM para el reconocimiento de líneas de texto, no una arquitectura transformer. Se trata de un ajuste fino de Rivok Full (`Rivok/tesseract-heb-rivok`) en precisión int8. Los datos de entrenamiento declarados son: pares de líneas HeOCR P-hist v1, repetición del corpus Rivok v2 y líneas sintéticas de imprenta. El entrenamiento utilizó exclusivamente el split TRAIN.

La model card distingue dos variantes de la misma receta: MEASURED (solo TRAIN) y FULL (TRAIN + DEV). Solo la variante MEASURED fue evaluada en el conjunto held-out; la FULL no fue medida y no hereda ninguna cifra de esa evaluación. El autor indica que la atribución y las licencias de los datos están documentadas en el fichero NOTICE del repositorio.

## Capacidades

- Reconocimiento OCR de texto hebreo impreso histórico sin puntuación vocálica, a nivel de línea y de página.
- Manejo de tipografías premodernas y escaneos de dominio público, según el conjunto de evaluación descrito.
- Salida de transcripción de texto con normalización `line_fold_v1` en la evaluación reportada.
- No soporta tool calling ni function calling (no es un modelo generativo).
- No soporta agentes ni razonamiento multi-step.
- Capacidad multilingüe limitada al hebreo; no cubre otros idiomas.
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales más allá del OCR.

## Casos de uso

- Digitalización de fondos hebreos antiguos en bibliotecas y archivos: el modelo está entrenado y evaluado sobre hebreo impreso premoderno sin puntuación, por lo que encaja en pipelines de conversión de escaneos a texto buscable en colecciones históricas.
- Creación de corpus textuales para investigación en estudios judaicos: permite transcribir ediciones antiguas con una CER medida del 14,71 %, lo que reduce la corrección manual frente al Tesseract estándar (33,02 %).
- Indexación y búsqueda full-text en repositorios digitales: la transcripción resultante puede alimentar motores de búsqueda sobre materiales que de otro modo solo serían imágenes.
- Sustitución del OCR por defecto en herramientas de digitalización que ya usan Tesseract: al ser un modelo Tesseract, puede integrarse donde ya exista una cadena basada en `traineddata` para hebreo.
- Procesamiento por lotes de páginas completas: el modelo se evalúa a nivel de página (page-level CER) sobre hojas completas, lo que lo hace adecuado para trabajos masivos no interactivos.
- Investigación en OCR histórico: sirve como referencia reproducible en experimentos de ajuste fino sobre Tesseract, dado que la evaluación usa un conjunto congelado y un protocolo de bootstrap pareado documentado.
- Evaluación comparativa de motores OCR: útil para contrastar alternativas (Rivok Full, Rivok Lite, tessdata_fast, PaddleOCR) sobre el mismo conjunto abierto.

## Benchmarks y rendimiento

Evaluación held-out sobre C2 P-hist-open v0.1: 18 hojas de 18 familias de maquetación, 30 regiones, 973 líneas de referencia (45.131 caracteres). CER a nivel de página, normalización `line_fold_v1`; intervalos por bootstrap pareado sobre 18 familias de maquetación (2.000 remuestreos, semilla 0).

| CER (%) | Este modelo | Rivok Full (`heb_rivok`) | Tesseract `heb` estándar (tessdata_best) |
|---|---:|---:|---:|
| Todas las líneas elegibles (875) | 14,71 | 16,59 | 33,02 |
| Líneas filtradas (837) | 14,34 | 16,37 | 33,06 |

Cambio relativo de CER frente a Rivok Full: −11,3 % (todas las líneas) y −12,4 % (filtradas); cotas superiores unilaterales del 97,5 % de −6,0 % y −6,5 %, respectivamente. Frente a Tesseract estándar: −55,4 % y −56,6 % (cotas superiores −48,6 % y −49,3 %). El autor indica que el modelo también supera a Rivok Lite, a Tesseract `heb` tessdata_fast y al modelo PaddleOCR de Rivok en el mismo conjunto, con cota superior por debajo de −3 %. En el subconjunto de 600 líneas donde las dos pasadas de transcripción de referencia coincidieron, el ranking no cambia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo Tesseract int8, la inferencia es fundamentalmente CPU y de huella reducida, pero no se publican cifras.
- GPU recomendadas: no disponible; Tesseract no requiere GPU por defecto.
- Compatibilidad con GPU de consumo: no disponible; no se documenta soporte GPU.
- Opciones de despliegue: motor Tesseract (no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo). El autor menciona ejecución a través de `heocr 0.3.0a2`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idioma | CER en C2 P-hist-open v0.1 | Licencia | Disponibilidad |
|---|---|---|---:|---|---|
| HeOCR P-hist MEASURED | Tesseract int8 fine-tune | hebreo histórico | 14,71 % (todas) / 14,34 % (filtradas) | Apache 2.0 | Hugging Face |
| Rivok Full (`heb_rivok`) | Tesseract | hebreo | 16,59 % / 16,37 % | no disponible en la información | Hugging Face |
| Rivok Lite | Tesseract | hebreo | inferior a este modelo según el autor (sin cifra publicada) | no disponible en la información | Hugging Face |
| Tesseract `heb` (tessdata_best) | Tesseract estándar | hebreo | 33,02 % / 33,06 % | no disponible en la información | tessdata |
| Tesseract `heb` (tessdata_fast) | Tesseract estándar | hebreo | inferior a este modelo según el autor (sin cifra publicada) | no disponible en la información | tessdata |
| PaddleOCR de Rivok | PaddleOCR | hebreo | inferior a este modelo según el autor (sin cifra publicada) | no disponible en la información | Hugging Face |

## Limitaciones y advertencias

- Es un fine-tune de Rivok Full; su rendimiento está ligado a la calidad del modelo base.
- Las transcripciones de referencia provienen de dos pasadas de transcripción con IA y adjudicación, sin revisión humana; el autor lo advierte explícitamente.
- El conjunto de evaluación tiene solo 18 hojas, lo que produce intervalos amplios y limita la generalización de las cifras.
- El resultado cubre únicamente hebreo impreso antiguo sin puntuación; otros tipos de documento requieren su propia medición.
- La variante FULL (TRAIN + DEV) no fue medida en este conjunto y no hereda ninguna de las cifras reportadas.
- Solo soporta hebreo; no es multilingüe.
- No se documentan sesgos específicos, pero al ser un modelo OCR entrenado con corpus concretos puede fallar sistemáticamente en tipografías no representadas.
- Riesgo de alucinación en el sentido de errores de reconocimiento (sustituciones, omisiones e inserciones de caracteres), cuantificado por la CER del 14,71 %.
- Licencia Apache 2.0 permite uso comercial, pero la atribución y las licencias de los datos de entrenamiento se remiten al fichero NOTICE, que debe revisarse antes de producción.
- El repositorio muestra 0,0 GB y 0 descargas: conviene verificar la disponibilidad real de los artefactos antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HeOCR/heocr-p-hist-measured
- Modelo base: https://huggingface.co/Rivok/tesseract-heb-rivok
- NOTICE del repositorio: https://huggingface.co/HeOCR/heocr-p-hist-measured/blob/main/NOTICE
