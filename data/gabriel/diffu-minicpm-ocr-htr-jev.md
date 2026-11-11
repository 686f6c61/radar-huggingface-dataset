# Gabriel/diffu-minicpm-ocr-htr-jev

## Resumen

diffu-minicpm-ocr-htr-jev es un modelo de verificacion (proof-reader) para transcripciones de lineas manuscritas en sueco, desarrollado por el usuario Gabriel como parte del proyecto diffu (repositorio Borg93/diffu2). No es un OCR generativo: recibe un recorte de linea manuscrita y una transcripcion candidata renderizada como imagen, y devuelve la probabilidad de que esa transcripcion coincida con la linea. Se construye mediante fine-tuning completo del modelo openbmb/MiniCPM-OCR-Jev.

El modelo resuelve un problema concreto en pipelines HTR (handwritten text recognition) sobre documentos historicos y archivos: la seleccion y validacion de lecturas. Permite elegir la mejor lectura entre varias candidatas, ordenar lectores por calidad y marcar lecturas dudosas para revision humana. Esta especializado en lineas de archivo manuscritas en sueco y forma pareja con el lector diffu-minicpm-ocr-htr.

Tecnicamente es un modelo de 2.213.245.760 parametros (aproximadamente 2,2 mil millones) con arquitectura etiquetada como qwen3_5 en los metadatos de Hugging Face, empaquetado en safetensors y pensado para ejecutarse en vLLM en modo pooling/clasificacion con dos etiquetas. Su licencia es Apache-2.0, igual que la del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (segun metadatos de Hugging Face); vision-language con encoder visual y aligner congelados durante el fine-tuning |
| Parametros totales | 2.213.245.760 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | sueco (sv) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers; tamano del repo 4,4 GB) |

## Arquitectura y entrenamiento

El modelo parte de openbmb/MiniCPM-OCR-Jev y se somete a un fine-tuning completo siguiendo la receta de OpenBMB: se entrenan los pesos del modelo de lenguaje mientras el encoder visual y el aligner permanecen congelados. Se uso learning rate 1e-5, ZeRO-3, 2 epocas, 128 pares por paso, sin empaquetado (unpacked), sobre dos GPUs RTX PRO 6000 Blackwell. El checkpoint final es checkpoint-45486, el ultimo del entrenamiento. La tarea se formula como clasificacion binaria (coincide / no coincide) sobre la representacion pooling del modelo.

Los datos de entrenamiento se construyeron a partir de las lineas de entrenamiento de GT-Lejonet (lado de entrenamiento sueco, febrero de 2026). Por cada linea se generaron: el recorte con su texto ground truth (par positivo); aproximadamente el mismo numero de candidatos erroneos (perturbaciones por reglas del texto GT y la linea de la misma pagina mas cercana en longitud); y las lecturas producidas por diffu-minicpm-ocr-htr sobre 100.000 lineas de entrenamiento, etiquetadas como coincidencia o no coincidencia tras normalizacion. Cada candidato se renderiza con el renderer propio de diffu (`htr-train-jev-render-1+ae7b7855e115+pillow-12.2.0+freetype-2.14.3`, fuente DejaVu Sans), y las puntuaciones dependen de ese renderer.

## Capacidades

- Verificacion de transcripciones: devuelve la probabilidad de que un texto candidato coincida con el recorte de una linea manuscrita.
- Seleccion de la mejor lectura entre varias candidatas (reranking de lectores).
- Ordenacion de lectores o modelos OCR por fiabilidad sobre un conjunto de lineas.
- Marcado de lecturas dudosas o etiquetas para revision humana (filtro de calidad).
- Procesamiento de entradas multimodales con dos imagenes por peticion (recorte de linea y renderizado del texto candidato).
- Salida de clasificacion binaria (dos etiquetas) apta para integracion en pipelines programaticos.
- Soporte de ejecucion en vLLM en modo pooling con `convert="classify"` y `num_labels=2`.
- Capacidades generativas generales del modelo base no documentadas para este fine-tuning; el uso previsto es la clasificacion.
- Sin soporte documentado de tool calling, agentes, audio ni modo thinking especifico para esta variante.

## Casos de uso

- Validacion en pipelines HTR de archivos historicos: tras transcribir una linea con un lector OCR, el modelo puntua la lectura y permite descartar o marcar las que caen por debajo de un umbral, reduciendo el coste de revision manual.
- Seleccion entre multiples lectores: dado un conjunto de transcripciones candidatas de la misma linea (por ejemplo, salidas de varios modelos OCR), el verificador puntua cada una y se elige la de mayor probabilidad.
- Ordenacion de lectores por calidad: aplicando el modelo a un conjunto etiquetado de lineas, se obtiene una medida comparativa de la fiabilidad de cada lector antes de desplegarlo en produccion.
- Filtro de etiquetas en transcripciones automaticas: el modelo puede emplearse para detectar lineas mal transcritas por maquinas y priorizar su revision, aunque el autor indica que esta funcion aun no se ha medido sobre lineas transcritas automaticamente.
- Control de calidad en digitalizacion de fondos suecos: integrado en el flujo de digitalizacion, permite generar listas de lineas dudosas para que los revisores humanos concentren el esfuerzo donde aporta mas valor.
- Investigacion en HTR: sirve como componente de evaluacion para comparar estrategias de preprocesado, segmentacion o modelos lectores sobre el mismo corpus de lineas manuscritas.
- Verificacion asistida en entornos de archivo con requisitos de trazabilidad: al devolver una probabilidad por candidato, deja registro cuantificable de la confianza de cada transcripcion.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| Accuracy | 95,6 % | Pares de desarrollo reservados (dev), ultima evaluacion |
| Loss | 0,1315 | Mismos pares de desarrollo, paso 45486/45486 |

No se han publicado resultados en JevOCRBench ni como filtro de etiquetas sobre lineas transcritas por maquina. No hay comparaciones publicadas con otros modelos verificadores en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 2,2 mil millones de parametros en safetensors (repo de 4,4 GB), la inferencia en precision nativa requiere del orden de 5-6 GB de VRAM, y menos con cuantizacion, aunque el autor no documenta cifras.
- GPU recomendadas: el entrenamiento se realizo en dos RTX PRO 6000 Blackwell; para inferencia se documenta el uso de vLLM, que requiere GPU compatible con CUDA.
- Cabe en GPU de consumo: previsiblemente si en tarjetas con 8 GB o mas de VRAM, aunque no se confirma en la model card.
- Opciones de despliegue: vLLM con `runner="pooling"`, `convert="classify"`, `hf_overrides={"num_labels": 2}` y `limit_mm_per_prompt={"image": 2}`. No se documentan llama.cpp, Ollama ni TGI para esta variante.
- Dependencias de ejecucion: `pip install "git+https://github.com/Borg93/diffu2#subdirectory=packages/htr_train" "pillow==12.2.0"`, con el renderer y el prompt propios de diffu.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| diffu-minicpm-ocr-htr-jev | 2.213.245.760 | no disponible | Verificacion de transcripciones HTR (sueco) | Apache-2.0 | Hugging Face |
| openbmb/MiniCPM-OCR-Jev (base) | no disponible en la informacion | no disponible | OCR/HTR generativo | Apache-2.0 (segun el modelo derivado) | Hugging Face |
| diffu-minicpm-ocr-htr | no disponible en la informacion | no disponible | Lector HTR (sueco), pareja del verificador | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Las puntuaciones dependen del renderer exacto (`htr-train-jev-render-1+ae7b7855e115+pillow-12.2.0+freetype-2.14.3`) y del prompt de diffu; usar otros renderizados o prompts desplaza los scores.
- El recorte debe prepararse como en entrenamiento: caja delimitadora de la linea, blanco fuera del poligono, 48 pixeles de alto.
- Los servicios de OpenBMB para Jev no son compatibles con este modelo porque renderizan y construyen el prompt de otra forma.
- La puntuacion no esta calibrada: es necesario elegir un umbral sobre lineas etiquetadas propias.
- Solo se ha evaluado en pares de desarrollo propios (95,6 % de accuracy); no hay medicion en JevOCRBench ni como filtro sobre lineas transcritas por maquina.
- Idioma limitado al sueco; no se documenta soporte multilingue.
- Riesgo de sesgo hacia el estilo y el corpus de GT-Lejonet (documentos de archivo suecos de una epoca concreta); el rendimiento puede degradarse en otras manos, epocas o tipografias.
- Riesgo de alucinacion no aplicable en sentido generativo (la salida es una probabilidad), pero si de falsos positivos o negativos en la verificacion.
- Licencia Apache-2.0 permite uso comercial, pero no se documentan garantias ni soporte; el modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que su validacion externa es practicamente nula.
- No se documentan limitaciones de contexto ni requisitos de memoria explicitos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Gabriel/diffu-minicpm-ocr-htr-jev
- Modelo base: https://huggingface.co/openbmb/MiniCPM-OCR-Jev
- Lector pareja: https://huggingface.co/Gabriel/diffu-minicpm-ocr-htr
- Repositorio diffu: https://github.com/Borg93/diffu2
- Paquete htr_train: https://github.com/Borg93/diffu2/tree/main/packages/htr_train
