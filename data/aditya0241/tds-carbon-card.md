# Aditya0241/tds-carbon-card

## Resumen

Este repositorio no contiene un modelo de inteligencia artificial tradicional, sino una tarjeta de documentación de emisiones de carbono (carbon emissions model card) correspondiente a una ejecución de entrenamiento de GPU. El autor, Aditya0241, registra las emisiones de CO₂ equivalente generadas durante un proceso de fine-tuning, utilizando la herramienta CodeCarbon para la medición. El entrenamiento se realizó sobre una NVIDIA A100 en la región asia-south1, con unas emisiones totales de 106,120 kg de CO₂ equivalente.

El repositorio forma parte de una serie de trabajos académicos (TDS GA8) sobre contabilidad de carbono en IA (Green AI), donde cada estudiante documenta la huella de carbono de su ejecución de entrenamiento. No se incluyen pesos, arquitectura ni artefactos de modelo desplegables; el contenido es exclusivamente la metadata de emisiones y las especificaciones del entorno de cómputo. Su relevancia radica en la creciente necesidad de transparencia ambiental en el entrenamiento de modelos, aunque no ofrece capacidades de inferencia ni procesamiento de datos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de ML) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (no contiene pesos) |

Datos de emisiones registrados en la model card:

| Metrica | Valor |
|---|---|
| Emisiones CO₂ equivalente | 106,120 kg |
| Herramienta de medicion | CodeCarbon |
| Tipo de entrenamiento | Fine-tuning |
| Ubicacion geografica | asia-south1 |
| Hardware utilizado | NVIDIA A100 |
| Fecha de creacion | 2026-08-26 |

## Arquitectura y entrenamiento

No se especifica ninguna arquitectura de red neuronal, ya que el repositorio no documenta el modelo subyacente que se entrenó. La información disponible indica únicamente que se realizó un proceso de fine-tuning sobre una GPU NVIDIA A100 en la región de Google Cloud asia-south1. Las emisiones se calcularon con CodeCarbon, una librería que estima el consumo energético y las emisiones de CO₂ asociadas al cómputo en GPU. No se proporcionan datos sobre el dataset, el número de tokens, el tamaño del lote ni las técnicas de optimización empleadas.

## Capacidades

- No es un modelo de generación de texto, razonamiento, código ni visión.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- No ofrece capacidades multilingües ni de ningún tipo relacionadas con procesamiento de lenguaje.
- Su única función es documentar la huella de carbono de una ejecución de entrenamiento con fines de auditoría ambiental y académica.

## Casos de uso

- Auditoría ambiental de entrenamientos de IA: el repositorio sirve como registro verificable de las emisiones generadas por un proceso de fine-tuning, útil para organizaciones que necesitan reportar su huella de carbono.
- Cumplimiento normativo: empresas sujetas a regulaciones de sostenibilidad pueden utilizar este tipo de documentación para justificar sus métricas de emisiones ante organismos reguladores.
- Investigación académica en Green AI: el trabajo forma parte de una asignatura (TDS GA8) que estudia la contabilidad de carbono en el entrenamiento de modelos, y puede usarse como caso de estudio comparativo.
- Comparación de eficiencia energética entre regiones de cómputo: al contrastar este registro (asia-south1) con otros repositorios similares en regiones distintas, se puede analizar el impacto de la ubicación geográfica en las emisiones.
- Elaboración de informes de sostenibilidad: los datos de CodeCarbon pueden integrarse en reportes corporativos de responsabilidad social y medioambiental.
- Benchmarking de hardware: el registro con NVIDIA A100 permite comparar la eficiencia energética de diferentes GPUs en tareas de fine-tuning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Este repositorio no contiene métricas de rendimiento de modelos (MMLU, HumanEval, GSM8K, etc.) porque no es un modelo de ML, sino un documento de contabilidad de emisiones.

## Requisitos de hardware

- El entrenamiento documentado utilizó una NVIDIA A100, aunque no se especifica el número de GPUs ni las horas de cómputo.
- No se requieren requisitos de hardware para inferencia, ya que no existe un modelo desplegable.
- El repositorio puede consultarse en cualquier navegador web sin necesidad de GPU.
- No se proporcionan opciones de despliegue (vLLM, llama.cpp, Ollama, TGI) porque no hay modelo que servir.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

Los repositorios comparables son otras tarjetas de emisiones de carbono del mismo curso (TDS GA8), encontradas en la búsqueda web:

| Repositorio | Hardware | Region | Tipo de entrenamiento | Emisiones CO₂ (kg) |
|---|---|---|---|---|
| Aditya0241/tds-carbon-card | NVIDIA A100 | asia-south1 | Fine-tuning | 106,120 |
| 24f2006741/tds-carbon-card | NVIDIA V100 (5 GPUs) | europe-north1 | Fine-tuning | 122,754 |
| 23f3001222/tds-carbon-card | NVIDIA A100 (3 GPUs) | europe-west4 | Pre-training | 76,855 |

Estos repositorios comparten la misma finalidad (documentar emisiones con CodeCarbon) pero difieren en hardware, región y tipo de entrenamiento. No son modelos comparables en términos de capacidades de IA, ya que ninguno contiene un modelo real.

## Limitaciones y advertencias

- No es un modelo de IA: no contiene pesos, arquitectura ni capacidades de inferencia. Cualquier intento de usarlo como modelo fallará.
- Información incompleta: no se especifican las horas de GPU, el consumo energético total en kWh ni el PUE (Power Usage Effectiveness), datos que sí aparecen en otros repositorios similares.
- Discrepancia en la región: la etiqueta del repositorio indica "region:us", pero la model card registra "asia-south1" como ubicación geográfica del entrenamiento.
- Sin licencia declarada: no se especifica la licencia, lo que limita su reutilización legal en contextos corporativos.
- Sin datos de entrenamiento: no se documenta qué modelo se fine-tuneó, con qué datos ni con qué propósito, lo que reduce su utilidad como registro completo de auditoría.
- Riesgo de interpretación errónea: al ser un repositorio con aspecto de modelo, los usuarios podrían confundirlo con un artefacto desplegable.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Aditya0241/tds-carbon-card
- Repositorio similar (Aditya2400): https://huggingface.co/Aditya2400/tds-carbon-card
- Repositorio similar (24f3004361): https://huggingface.co/24f3004361/tds-carbon-card
- Repositorio similar (24f2006741): https://huggingface.co/24f2006741/tds-carbon-card
- Repositorio similar (23f3001222): https://huggingface.co/23f3001222/tds-carbon-card
- Repositorio similar (23f1001631): https://huggingface.co/23f1001631/tds-carbon-card
