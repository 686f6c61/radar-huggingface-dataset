# IHPAN/LightOnOCR-2-1B-ocr-sgkp

## Resumen

LightOnOCR-2-1B-ocr-sgkp es un adaptador LoRA desarrollado por IHPAN que afina el modelo base de OCR lightonai/LightOnOCR-2-1B-base para la transcripción de documentos impresos polacos del siglo XIX, concretamente del *Geographical Dictionary of the Kingdom of Poland* (SGKP). El adaptador se distribuye como un repositorio PEFT que contiene únicamente los pesos del adaptador y los archivos del procesador, no una copia completa del modelo base.

El modelo resuelve el problema de la transcripción fiable de textos históricos impresos en polaco, preservando la ortografía histórica, la puntuación y la segmentación original del texto. Es relevante porque los sistemas OCR genéricos suelen fallar con tipografías antiguas y caracteres especiales, y este adaptador ofrece una mejora cuantificable en precisión sin necesidad de reentrenar el modelo completo. El entrenamiento se realizó con 270 páginas de entrenamiento y 30 de validación del conjunto de datos IHPAN/ocr-sgkp, con una configuración de QLoRA de 4 bits, 5 épocas y una longitud de secuencia máxima de 3200 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre LightOnOCR-2-1B-base (arquitectura del base no disponible) |
| Parametros totales | No disponible (el adaptador LoRA tiene r=8, alpha=16, dropout 0.05 aplicado solo al modelo de lenguaje) |
| Parametros activos | No aplicable (adaptador LoRA) |
| Longitud de contexto | 3200 tokens (máximo de secuencia durante entrenamiento) |
| Tipos de cuantizacion | 4-bit NF4 QLoRA durante entrenamiento; el adaptador se puede cargar en bf16 sobre el base |
| Idiomas soportados | Polaco (pl) |
| Licencia | No disponible (sujeta a la licencia del modelo base lightonai/LightOnOCR-2-1B-base) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre el modelo base `lightonai/LightOnOCR-2-1B-base`, cuya arquitectura interna no se detalla en la información disponible, aunque se menciona que utiliza un tokenizer de Mistral corregido (`fix_mistral_regex=True`), lo que sugiere una arquitectura transformer con tokenizer Mistral. El fine-tuning emplea QLoRA de 4 bits con NF4, con r=8, alpha=16 y dropout de 0.05, aplicado exclusivamente al modelo de lenguaje, dejando el codificador visual sin tocar. El entrenamiento se realizó con 270 páginas de entrenamiento y 30 de validación, con batch size por dispositivo de 1, acumulación de gradientes de 8, tasa de aprendizaje de 5e-5, 5 épocas, y resolución máxima de imagen de 768 píxeles en el borde más largo.

La innovación técnica principal es el uso de QLoRA para adaptar un modelo OCR de 2B a un dominio histórico específico sin necesidad de recursos computacionales elevados, además de la corrección del tokenizador Mistral para manejar correctamente los caracteres polacos y la ortografía del siglo XIX. El resultado es un adaptador ligero que se puede integrar con la librería `transformers` y `peft`.

## Capacidades

- Reconocimiento de texto en imágenes de documentos históricos impresos del siglo XIX en polaco.
- Preservación de la ortografía histórica, caracteres polos, puntuación y segmentación del texto en párrafos.
- Separación de entradas de diccionario en párrafos individuales.
- Generación de texto plano como transcripción, sin formato complejo.
- Soporte para imágenes de hasta 768 píxeles en el borde más largo (configuración de entrenamiento).
- Integración con el pipeline `image-to-text` de HuggingFace y con la librería `PEFT` para carga del adaptador.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades de visión general más allá del OCR.

## Casos de uso

- Digitalización de diccionarios geográficos históricos: el adaptador transcribe las páginas del SGKP con precisión, reduciendo el CER de 1.2264% a 0.9488% respecto al modelo base, lo que facilita la creación de ediciones digitales anotadas.
- Investigación en historia y geografía: los historiadores pueden convertir automáticamente escaneos de la obra en texto editable para búsqueda, análisis de corpus y minería de textos.
- Publicación de corpus académicos: permite generar versiones digitales en TEI XML o texto plano de documentos del siglo XIX, con la ortografía original preservada.
- Archivado y preservación digital: las bibliotecas pueden integrar el adaptador en pipelines de OCR para digitalizar sus colecciones polacas históricas con mayor fidelidad.
- Entrenamiento de modelos de lenguaje histórico: el texto transcrito puede servir como datos de entrenamiento para modelos de NLP especializados en polaco del siglo XIX.
- Sistema de búsqueda en documentos antiguos: los índices de búsqueda se pueden construir sobre las transcripciones generadas, mejorando la accesibilidad de los documentos en línea.

## Benchmarks y rendimiento

La evaluación se realizó sobre 10 páginas SGKP anotadas manualmente, excluidas del conjunto de entrenamiento y validación. Ambos modelos usaron el mismo prompt de transcripción en texto plano y un límite de generación de 3072 tokens nuevos.

| Metrica | Modelo base | Modelo afinado |
|---|---|---|
| Character Error Rate (CER) | 1.2264% | **0.9488%** |
| Word Error Rate (WER) | 4.3541% | **4.2233%** |

El afinado reduce el CER en 0.2776 puntos porcentuales, lo que supone una reducción relativa del 22.6%. El WER disminuye aproximadamente un 3.0% relativo. El conjunto de prueba es pequeño y proviene de la misma publicación que el material de entrenamiento, por lo que estos resultados se deben considerar una evaluación preliminar in-domain, no un benchmark general de OCR.

## Requisitos de hardware

- El adaptador LoRA es ligero (del orden de decenas de MB) y se carga sobre el modelo base `LightOnOCR-2-1B-base`, que es de aproximadamente 2B parámetros.
- Para inferencia en bf16, se estima una VRAM mínima de 6-8 GB para un batch de 1 y resolución de 768 píxeles, suficiente para GPUs de consumo como RTX 3060/4060 o superiores.
- En cuantización 4-bit (NF4) la VRAM necesaria baja a unos 3-4 GB, lo que permite ejecutar el modelo en GPUs de 8 GB o incluso en CPU con llama.cpp (si se convierte a GGUF, aunque no se ha publicado).
- GPU recomendadas: RTX 3090, RTX 4090, A100, H100 para procesamiento en lote o producción.
- Despliegue: se puede usar con `transformers` y `PEFT` directamente, o mediante `vLLM` si se convierte a formato compatible; también es posible exportar a ONNX para inferencia en CPU.
- La latencia para una página de 768 píxeles no está documentada; en una RTX 4090 se estima un tiempo de generación de unos pocos segundos por página con el modelo base de 2B.

## Comparativa con modelos similares

No hay modelos comparables directamente disponibles en la información proporcionada, ya que el adaptador está especializado en un dominio muy concreto (documentos polacos históricos del SGKP). Se puede comparar con el modelo base `lightonai/LightOnOCR-2-1B-base`:

| Modelo | Parametros | Contexto | CER (SGKP) | WER (SGKP) | Licencia |
|---|---|---|---|---|---|
| LightOnOCR-2-1B-base | ~2B | 3200 tokens | 1.2264% | 4.3541% | No disponible |
| LightOnOCR-2-1B-ocr-sgkp (adaptador) | ~2B + LoRA | 3200 tokens | 0.9488% | 4.2233% | No disponible |

No se dispone de información sobre otros modelos OCR de documentos históricos polacos como `TrOCR` o `Tesseract` con afinado específico para este dominio.

## Limitaciones y advertencias

- El modelo está especializado en la maquetación y tipografía del SGKP; su rendimiento no se puede generalizar a otros libros, manuscritos o materiales impresos modernos.
- Devuelve texto plano con las entradas del diccionario separadas en párrafos, lo que puede no ser adecuado para formatos estructurados.
- El conjunto de evaluación es pequeño (10 páginas) y proviene de la misma publicación que el entrenamiento; no es un benchmark independiente.
- La licencia no está disponible en la información proporcionada; el uso del adaptador está sujeto a la licencia del modelo base `lightonai/LightOnOCR-2-1B-base`, que tampoco se ha especificado.
- No se ha evaluado en producción; se recomienda una validación con un conjunto de prueba más amplio y diverso antes de uso comercial.
- El adaptador solo soporta polaco; no se ha entrenado para otros idiomas.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/IHPAN/LightOnOCR-2-1B-ocr-sgkp
- Modelo base: https://huggingface.co/lightonai/LightOnOCR-2-1B-base
- Dataset de entrenamiento: https://huggingface.co/datasets/IHPAN/ocr-sgkp
