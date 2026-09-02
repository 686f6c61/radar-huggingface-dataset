# abzoo/paddleocr-vl-curriculum-015-lora

## Resumen

El modelo `abzoo/paddleocr-vl-curriculum-015-lora` es un ajuste fino (fine-tune) mediante LoRA del modelo base `unsloth/PaddleOCR-VL`, especializado en el reconocimiento óptico de caracteres (OCR) de documentos de identidad egipcios. El autor, abzoo, ha aplicado una estrategia de aprendizaje curricular (curriculum learning) en tres etapas, de las cuales se ha completado la primera, con el objetivo de mejorar la precisión en la extracción de nombres en árabe presentes en dichos documentos.

Este modelo es relevante porque aborda un caso de uso concreto y desafiante: el OCR de campos específicos en documentos de identidad, donde los nombres en árabe presentan variaciones caligráficas y ruido. Al estar basado en PaddleOCR-VL, un modelo visión-lenguaje (VLM) compacto de 0.9B parámetros que combina un codificador visual de resolución dinámica estilo NaViT con el modelo de lenguaje ERNIE-4.5-0.3B, el ajuste LoRA permite adaptar el modelo a un dominio específico con un coste computacional reducido. El repositorio contiene únicamente los pesos LoRA (0.2 GB), no el modelo completo.

La precisión reportada es modesta (35.1% normalizada en el conjunto de prueba), lo que indica que el modelo se encuentra en una fase temprana de entrenamiento y que aún no es apto para producción sin un refinamiento adicional. No obstante, el enfoque de curriculum learning y la disponibilidad de los pesos en formato safetensors facilitan su reproducción y extensión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre PaddleOCR-VL (VLM con codificador visual NaViT y modelo de lenguaje ERNIE-4.5-0.3B) |
| Parametros totales | no disponible (el repositorio contiene solo pesos LoRA de 0.2 GB) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el ejemplo de uso muestra carga en 4-bit) |
| Idiomas soportados | arabe e ingles (implicitos por el dominio de los IDs egipcios) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base, PaddleOCR-VL, es un VLM de 0.9B parametros que integra un codificador visual de resolucion dinamica estilo NaViT con el modelo de lenguaje ERNIE-4.5-0.3B. Sobre esta base, se ha aplicado un adaptador LoRA con r=64 y alpha=64, lo que permite ajustar el modelo a la tarea especifica de OCR de nombres arabes en documentos de identidad egipcios sin modificar los pesos originales.

El entrenamiento sigue un esquema de curriculum learning en tres etapas, de las cuales solo se ha completado la primera (una epoca). La estrategia consiste en: (1) pre-entrenar con datos sinteticos de nombres arabes hasta la saturacion, (2) transicionar de datos reales a sinteticos y viceversa, y (3) pulir con datos reales usando una tasa de aprendizaje reducida. Los conjuntos de datos utilizados son `abzoo/arabic-names-synthetic-ocr` (2,363 muestras de entrenamiento, 262 de validacion) y `abzoo/egyptian-id-ocr` (2,436 de entrenamiento, 211 de prueba). No se menciona el uso de tecnicas como RLHF o DPO; el entrenamiento se basa en aprendizaje supervisado convencional.

## Capacidades

- Reconocimiento optico de caracteres (OCR) de campos especificos en documentos de identidad egipcios, principalmente nombres en arabe.
- Extraccion de texto a partir de imagenes con resolucion dinamica, gracias al codificador visual NaViT del modelo base.
- Generacion de texto en formato secuencia a secuencia, adaptado a la tarea de transcripcion de caracteres.
- Capacidad de ser cargado en 4-bit para inferencia con bajo consumo de memoria, como se muestra en el ejemplo de uso con `unsloth.FastVisionModel`.
- No se reportan capacidades de tool calling, agentes, razonamiento multi-paso, vision general o audio; el modelo esta especializado exclusivamente en OCR de documentos.

## Casos de uso

- Verificacion de identidad en procesos KYC (Know Your Customer): el modelo puede transcribir automaticamente el nombre del titular de un ID egipcio, reduciendo la intervencion manual en la validacion de documentos.
- Automatizacion de formularios de registro: al extraer el nombre de un documento de identidad, se puede rellenar automaticamente campos en sistemas de alta de clientes o tramites administrativos.
- Digitalizacion de archivos fisicos: en entidades publicas o privadas que necesitan convertir expedientes en papel a formato digital, el modelo puede asistir en la captura de datos nominales.
- Filtrado y clasificacion de documentos: combinado con un sistema de clasificacion, el OCR permite indexar documentos por el nombre extraido, facilitando su busqueda posterior.
- Entrenamiento de modelos mas robustos: al ser un checkpoint intermedio de un curriculum, puede servir como punto de partida para continuar el entrenamiento con mas datos o etapas adicionales.
- Evaluacion de tecnicas de curriculum learning: investigadores pueden reproducir el experimento y comparar la evolucion de la precision entre etapas, usando este modelo como referencia de la etapa 1.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados en el conjunto de prueba real (`abzoo/egyptian-id-ocr`, 211 muestras):

| Metrica | Resultado |
|---|---|
| Precision estricta (coincidencia exacta) | 66/211 (31.3%) |
| Precision normalizada | 74/211 (35.1%) |

Desglose por distancia de edicion:

| Distancia de edicion | Conteo | Porcentaje |
|---|---|---|
| Exacta (0) | 74 | 35.1% |
| Cercana (1) | 42 | 19.9% |
| Cercana (2) | 18 | 8.5% |
| Cercana (3) | 8 | 3.8% |
| Incorrecta (4+) | 69 | 32.7% |

No se han publicado comparaciones con otros modelos en la informacion disponible. La precision es baja, lo que refleja que el modelo esta en una fase inicial de entrenamiento (etapa 1 de 3, una sola epoca).

## Requisitos de hardware

- El modelo base PaddleOCR-VL tiene 0.9B parametros, por lo que en cuantizacion de 4-bit requiere aproximadamente 0.5-1 GB de VRAM solo para los pesos, mas el overhead de activaciones y el codificador visual. Se estima que cabe en GPUs consumer con 6-8 GB de VRAM, como una RTX 3060 o superior.
- El adaptador LoRA anade un coste minimo adicional (0.2 GB en disco).
- Para inferencia, se puede usar `unsloth.FastVisionModel` con carga en 4-bit, como se muestra en el ejemplo de uso.
- Opciones de despliegue: al ser un modelo de la familia PaddleOCR-VL, es compatible con el ecosistema PaddleX y con herramientas de inferencia para VLM como vLLM (si se convierte a un formato compatible) o llama.cpp (si se exporta a GGUF). No se proporcionan datos de latencia o throughput.
- Para entrenamiento o fine-tuning adicional, se recomienda una GPU con al menos 12-16 GB de VRAM para manejar el modelo base en precision completa o mixta.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativo con otros modelos de OCR de documentos en la informacion proporcionada. Como referencia, el modelo base PaddleOCR-VL alcanza un 94.5% de precision en el benchmark OmniDocBench v1.5 (segun la documentacion oficial), pero este modelo fine-tuneado esta muy por debajo de ese nivel debido a su entrenamiento parcial. No se pueden establecer comparaciones cuantitativas fiables sin datos adicionales.

## Limitaciones y advertencias

- Precision muy baja (35.1% normalizada) en el conjunto de prueba real; no es apto para uso en produccion sin completar las etapas de entrenamiento restantes.
- Entrenado exclusivamente para nombres arabes en IDs egipcios; no generaliza a otros tipos de documentos, idiomas o campos.
- Riesgo de alucinacion: al ser un modelo de lenguaje, puede generar texto incorrecto cuando la imagen es ambigua o de baja calidad, como se refleja en el 32.7% de errores con distancia de edicion mayor a 3.
- Licencia no especificada: no se puede determinar si el uso comercial esta permitido; se recomienda contactar al autor antes de cualquier despliegue.
- El repositorio no incluye el modelo base completo, solo los pesos LoRA; es necesario descargar el modelo base `unsloth/PaddleOCR-VL` por separado.
- No hay informacion sobre sesgos especificos, pero al entrenarse con datos limitados (2,436 muestras reales) puede presentar sesgos hacia variaciones particulares de escritura o calidad de imagen.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/abzoo/paddleocr-vl-curriculum-015-lora
- Documentacion de PaddleOCR-VL (PaddleX): https://paddlepaddle.github.io/PaddleX/3.3/en/pipeline_usage/tutorials/ocr_pipelines/PaddleOCR-VL.html
- Documentacion oficial de PaddleOCR: https://www.paddleocr.ai/main/en/index.html
- README de PaddleOCR-VL en HuggingFace: https://huggingface.co/PaddlePaddle/PaddleOCR-VL/blob/main/README.md
- Tutorial de uso de PaddleOCR-VL: https://www.paddleocr.ai/latest/en/version3.x/pipeline_usage/PaddleOCR-VL.html
