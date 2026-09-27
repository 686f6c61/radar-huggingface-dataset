# Arup330/Neck_open_noCoT_Qwen3-VL-8B_lora

## Resumen

Neck_open_noCoT_Qwen3-VL-8B_lora es un adaptador LoRA publicado por el usuario Arup330 sobre Qwen3-VL-8B-Instruct, el modelo multimodal de 8 000 millones de parámetros del equipo Qwen de Alibaba. No es un modelo completo: el repositorio ocupa 0,2 GB y contiene únicamente los pesos del adaptador, entrenados sobre unsloth/qwen3-vl-8b-instruct-unsloth-bnb-4bit, una versión del modelo base cuantizada a 4 bits con bitsandbytes.

Qwen3-VL combina un codificador de visión con el decodificador de lenguaje de la serie Qwen3 y, en su variante densa de 8B, declara 256 000 tokens de contexto nativo. El adaptador hereda por tanto capacidades multimodales (comprensión de imagen, OCR, respuesta visual a preguntas) y de generación de texto, aunque ninguna de ellas está evaluada en este repositorio.

Su relevancia es limitada y de carácter experimental: se publica bajo licencia Apache 2.0, sin resultados de benchmarks, sin descripción del dataset de ajuste y con 0 descargas y 0 me gusta en el momento de redactar esta ficha. El nombre del repositorio sugiere un experimento de ablación sobre el conector visión-lenguaje y sin cadena de pensamiento, pero no hay documentación que lo confirme.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un transformer multimodal denso (codificador de visión más decodificador de lenguaje Qwen3). Detalles no especificados en la model card |
| Parámetros totales | Adaptador: no disponible (repositorio de 0,2 GB). Modelo base: en torno a 8 000 millones, según el identificador del modelo base |
| Parámetros activos | No aplica: la variante de 8B de Qwen3-VL es densa, no es MoE |
| Longitud de contexto | No disponible en la model card. El modelo base declara 256 000 tokens de contexto nativo según su documentación pública |
| Tipos de cuantización | El modelo base se distribuye en 4 bits (bitsandbytes, sufijo bnb-4bit). El adaptador no declara cuantizaciones propias |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |
| Tipo de artefacto | Adaptador LoRA, no pesos completos |
| Modelo base | unsloth/qwen3-vl-8b-instruct-unsloth-bnb-4bit |
| Modalidad de entrada | Texto e imagen, heredada del modelo base y no verificada para este adaptador |
| Librerías declaradas | transformers, unsloth, trl, text-generation-inference |
| Tamaño del repositorio | 0,2 GB |
| Descargas y me gusta | 0 y 0 |
| Fecha de publicación | 27 de septiembre de 2026, según los metadatos de HuggingFace |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo completo, sino un adaptador de bajo rango (LoRA) que debe cargarse junto con su modelo base. Ese modelo base es unsloth/qwen3-vl-8b-instruct-unsloth-bnb-4bit, una conversión de Qwen3-VL-8B-Instruct cuantizada a 4 bits con bitsandbytes que Unsloth publica para permitir ajuste fino con QLoRA en GPUs de consumo. Qwen3-VL es la familia multimodal de Alibaba Qwen y combina un codificador visual con el decodificador de lenguaje de la serie Qwen3; su variante de 8B es densa, sin mezcla de expertos, y declara 256 000 tokens de contexto nativo ampliables, según la documentación pública del modelo base.

La model card solo indica que el ajuste se realizó con Unsloth y que el entrenamiento fue «2x más rápido» con esa herramienta. No se especifica el número de tokens de entrenamiento, la composición del dataset, si hubo SFT, DPO o RLHF, ni el rango, el alpha o los módulos objetivo del LoRA. El nombre del repositorio (Neck_open_noCoT) apunta a un ajuste parcial, presumiblemente del conector o «neck» entre el codificador visual y el modelo de lenguaje, y sin cadena de pensamiento, pero se trata de una inferencia a partir del nombre que ninguna documentación confirma.

## Capacidades

- Generación de texto en inglés, heredada del decodificador Qwen3 del modelo base.
- Comprensión de imágenes: descripción, respuesta visual a preguntas y razonamiento sobre contenido gráfico, siempre que el ajuste no haya degradado estas capacidades.
- OCR y extracción de texto presente en imágenes, una de las capacidades destacadas del modelo base.
- Razonamiento visual de varios pasos. El sufijo noCoT del nombre sugiere que el ajuste se ha hecho sin cadena de pensamiento, lo que podría reducir el razonamiento explícito, pero no está confirmado.
- Llamada a herramientas y function calling: el modelo base Qwen3-VL lo soporta con el formato de Qwen; no hay confirmación de que el adaptador lo conserve.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: el modelo base cubre decenas de idiomas, pero este adaptador solo declara inglés.
- Capacidades de audio o vídeo: no disponibles.

## Casos de uso

- Investigación en ablaciones de conectores visión-lenguaje: el adaptador permite comparar el efecto de un ajuste parcial del «neck» frente al modelo base completo y frente a variantes entrenadas con cadena de pensamiento, aislando una única variable experimental.
- Prototipado de OCR en inglés: útil para experimentar con extracción de texto de facturas, formularios o capturas antes de decidir si se invierte en un ajuste a mayor escala, dado que el modelo base rinde bien en esta tarea.
- Descripción automática de imágenes en inglés: puede emplearse en experimentos de accesibilidad o de generación de metadatos para catálogos, siempre con revisión humana por el riesgo de alucinación.
- Respuesta visual a preguntas en entornos de investigación: permite montar un banco de pruebas en inglés sobre VQA antes de pasar a modelos con evaluación publicada.
- Etiquetado y clasificación de imágenes mediante instrucciones en lenguaje natural: sirve como línea base en experimentos de anotación semiautomática.
- Material docente sobre QLoRA y Unsloth: el repositorio ilustra un flujo de ajuste eficiente sobre una base cuantizada a 4 bits, reproducible con una sola GPU de consumo.
- Comparación de pipelines de despliegue: es un caso útil para medir la sobrecarga de cargar un adaptador LoRA frente a fusionar los pesos en vLLM o TGI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluación, y en el momento de redactar esta ficha acumula 0 descargas y 0 me gusta, por lo que tampoco existen evaluaciones de terceros.

## Requisitos de hardware

- Adaptador: alrededor de 0,2 GB en disco. Es un requisito despreciable frente al modelo base, que hay que descargar aparte.
- Inferencia en precisión completa (FP16/BF16) del modelo base de 8B: en torno a 16 GB solo en pesos, más activaciones y caché KV, lo que sitúa el total práctico en 20-24 GB de VRAM.
- Inferencia en 4 bits: aproximadamente 5-6 GB de pesos, manejable en GPUs de consumo.
- GPU de consumo compatibles: RTX 3060 de 12 GB, RTX 4070 Ti de 16 GB y RTX 4090 de 24 GB. En 4 bits caben con holgura; en FP16 la 4090 queda al límite y conviene reducir el contexto.
- GPU profesionales: A100 de 40 o 80 GB, H100 y L40S, recomendables si se quiere contexto largo o lotes grandes.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador, vLLM y text-generation-inference (etiqueta declarada en el repositorio) para servicio, y Unsloth para ajuste o fusión. Para llama.cpp u Ollama es necesario fusionar el adaptador con el modelo base y convertir el resultado a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto nativo | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (LoRA sobre Qwen3-VL-8B-Instruct en 4 bits) | 8 000 millones en el base, más adaptador | 256 000 tokens heredados del base | Texto e imagen | apache-2.0 | HuggingFace, 0 descargas |
| Qwen3-VL-8B-Instruct | 8 000 millones | 256 000 tokens | Texto e imagen | apache-2.0 | HuggingFace, pesos completos |
| Qwen3-VL-4B-Instruct | 4 000 millones | 256 000 tokens | Texto e imagen | apache-2.0 | HuggingFace, pesos completos |
| Qwen2.5-VL-7B-Instruct | 7 000 millones | 128 000 tokens | Texto e imagen | apache-2.0 | HuggingFace, pesos completos |

Los datos de los modelos alternativos proceden de su documentación pública y no se han verificado en este repositorio. No es posible establecer una comparación de rendimiento porque este adaptador no publica ninguna métrica.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autónomo: sin el modelo base y sin la librería PEFT no se puede ejecutar.
- El modelo base está cuantizado a 4 bits con bitsandbytes, lo que introduce una pérdida de precisión adicional respecto a los pesos originales.
- No se documentan dataset, hiperparámetros, número de pasos ni módulos objetivo del ajuste, por lo que el resultado no es reproducible.
- Cero descargas y cero me gusta, sin evaluación publicada: la calidad real del ajuste es desconocida.
- Solo se declara inglés. El multilingüismo del modelo base puede haberse degradado con el ajuste.
- Riesgo de alucinación, especialmente en tareas de OCR y de descripción de imágenes, donde puede inventar texto o detalles no presentes.
- Posible olvido catastrófico de capacidades generales del modelo base tras el ajuste, algo habitual en adaptadores entrenados sobre tareas muy concretas.
- El nombre noCoT sugiere que se ha prescindido de la cadena de pensamiento, lo que puede penalizar el razonamiento complejo, pero no hay confirmación.
- La fecha de creación registrada (27 de septiembre de 2026) es posterior a la fecha habitual de publicación y dificulta la trazabilidad del artefacto.
- La licencia del adaptador es Apache 2.0, pero conviene verificar los términos del modelo base y de la conversión publicada por Unsloth antes de un uso comercial.
- No se recomienda su uso en producción sin una evaluación propia previa.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/Arup330/Neck_open_noCoT_Qwen3-VL-8B_lora
- Modelo base en HuggingFace: https://huggingface.co/unsloth/qwen3-vl-8b-instruct-unsloth-bnb-4bit
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Repositorio de Qwen3-VL: https://github.com/QwenLM/Qwen3-VL
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- No se han encontrado papers, blogs ni demostraciones asociados a este adaptador en la información disponible.
