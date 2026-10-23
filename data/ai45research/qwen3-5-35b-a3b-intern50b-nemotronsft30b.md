# AI45Research/Qwen3.5-35B-A3B-Intern50B-NemotronSFT30B

## Resumen

`AI45Research/Qwen3.5-35B-A3B-Intern50B-NemotronSFT30B` es un ajuste fino supervisado (SFT) del modelo multimodal MoE `Qwen/Qwen3.5-35B-A3B` de Alibaba, publicado por AI45Research como *baseline* reproducible dentro de la colección Safin-1. El repositorio se presenta explícitamente como "matched baseline" de referencia para comparaciones internas, no como un modelo MARCH ni como un release orientado a producto. Su interés radica en que documenta con precisión la receta de entrenamiento (paso, batch global, longitud de empaquetado, semillas e hiperparámetros), algo poco habitual en fine-tunes de la comunidad.

Arquitectura y tamaño: se mantiene el tipo `qwen3_5_moe` del modelo base, con 35.107.181.936 parámetros totales (~35,1 B) y aproximadamente 3 B activos por token, según las especificaciones públicas de la familia Qwen3.5-35B-A3B. El contexto heredado del modelo base es de 262.144 tokens, extensible hasta 1 M según fuentes externas; la model card de este fine-tune no declara longitud de contexto propia. La entrada es imagen y texto (`image-text-to-text`).

Es relevante ahora porque buena parte de los fine-tunes publicados en el Hub no adjuntan trazabilidad de entrenamiento ni separan baseline de modelo final. Este repositorio sí lo hace, e incluye sumas de verificación SHA256, límites de evaluación declarados y una advertencia explícita sobre la procedencia no documentada del corpus CPT intermedio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer disperso tipo mixture-of-experts (MoE), tipo de modelo `qwen3_5_moe`, multimodal (texto e imagen) |
| Parametros totales | 35.107.181.936 (~35,1 B), dato real de safetensors |
| Parametros activos | ~3 B por token (según la familia Qwen3.5-35B-A3B; no verificado en este repositorio) |
| Longitud de contexto | 262.144 tokens en el modelo base Qwen3.5-35B-A3B, extensible a 1 M según fuentes externas; no declarada en la model card de este fine-tune |
| Tipos de cuantizacion | No se distribuyen cuantizaciones en el repositorio; pesos en safetensors cargados en `bfloat16` según el ejemplo oficial |
| Idiomas soportados | No declarados en la model card; el modelo base declara 201 idiomas y dialectos |
| Licencia | Apache-2.0 (pesos); los datos de entrenamiento conservan sus propios términos |
| Formato de pesos | safetensors, 16 shards, 1026 claves de tensor; repo de 70,2 GB |

Otros datos técnicos registrados: paso SFT 7200, batch global 128, longitud de secuencia/empaquetado 32768, semillas 42, learning rate 1e-5 con mínimo 1e-6, schedule coseno y warmup 0,05. Entorno de referencia: Python 3.11, PyTorch 2.11, Transformers 5.5.4.

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-35B-A3B`, un MoE multimodal de la familia Qwen3.5: 35 B de parámetros totales con ~3 B activos por token, lo que reduce el coste de cómputo por paso sin recortar el conocimiento almacenado. La cadena de ascendencia declarada es `Qwen/Qwen3.5-35B-A3B` → checkpoint CPT derivado de Intern-S2 (paso 5961) → SFT (paso 7200). La inicialización apunta a ese checkpoint CPT con nombre "Intern50B", cuya procedencia y permisos el propio autor marca como no documentados.

El entrenamiento SFT consume diez entradas de dataset que incluyen `nvidia/Nemotron-Cascade-2-SFT-Data`, con 921.600 muestras empaquetadas (7200 pasos × batch global 128). El autor aclara que 30.198.988.800 tokens es una cota superior a empaquetado completo, no un recuento medido. La receta (semillas, LR, coseno, warmup) coincide con la del entrenamiento MARCH correspondiente, de modo que ambos pueden compararse en igualdad de condiciones. No se documenta RLHF ni DPO posteriores, ni innovaciones de decodificación específicas más allá de las heredadas del modelo base.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat (`apply_chat_template`) y soporte de modo *thinking* activable o desactivable (`enable_thinking`).
- Entrada multimodal imagen-texto: el pipeline declarado es `image-text-to-text` y la clase de carga es `AutoModelForImageTextToText`.
- Razonamiento y matemáticas: capacidades heredadas del modelo base Qwen3.5-35B-A3B, sin evaluación propia publicada para este fine-tune.
- Generación de código y soporte de *tool calling* / *function calling*: heredado del modelo base; no verificado en este release.
- Capacidades de agente y razonamiento multi-paso: heredadas del modelo base; no verificadas.
- Multilingüismo amplio: el modelo base declara 201 idiomas y dialectos; este fine-tune no aporta lista propia.
- Contexto largo: hasta 262.144 tokens según el modelo base, adecuado para documentos extensos y conversaciones largas.
- Eficiencia de inferencia: ~3 B de parámetros activos por token sobre 35 B almacenados.

## Casos de uso

- Baseline de comparación en investigación: sirve como referencia "matched" frente a los modelos MARCH de la colección Safin-1, porque comparte receta de entrenamiento, semillas e hiperparámetros; permite atribuir diferencias de calidad al método y no a variaciones de entrenamiento.
- Evaluación de recetas de SFT: al estar documentados paso, batch, LR y schedule, se puede reproducir o alterar una sola variable y medir su efecto sobre el modelo base.
- Procesamiento de documentos largos con imagen: con 262.144 tokens de contexto y entrada multimodal, permite resumir informes con tablas y figuras en una sola pasada.
- Atención al cliente multi-turno: la ventana de contexto larga y los 3 B activos permiten mantener historiales extensos con coste de cómputo contenido.
- Extracción de información estructurada de capturas y PDF escaneados: el pipeline `image-text-to-text` admite entrada de imagen directa sin OCR intermedio.
- Prototipado de asistentes con razonamiento visible: el flag `enable_thinking` permite alternar entre respuestas directas (baja latencia) y cadenas de razonamiento (mayor precisión).
- Despliegue en infraestructura modesta: al activar solo ~3 B de parámetros, es viable en una sola GPU consumer con cuantización de 4 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explícitamente que "no formal current-release benchmark score table is supplied" y que `EVALUATION.md` contiene registros históricos recuperados que no constituyen una tabla de puntuaciones verificada para estos pesos. La inspección de configuración, índice y cabeceras no equivale a validación de calidad de generación ni de corrección numérica en GPU.

## Requisitos de hardware

- VRAM en `bfloat16`: ~70,2 GB solo de pesos, más caché KV y activaciones; requiere 80 GB (A100 80 GB, H100 80 GB) o reparto en varias GPU.
- VRAM en FP8: ~35 GB; encaja en L40S 48 GB, RTX 6000 Ada 48 GB o H100.
- VRAM en cuantización de 4 bits (GPTQ/AWQ/GGUF Q4, generada por terceros): ~18-20 GB; cabe en RTX 4090 24 GB y RTX 3090 24 GB.
- GPU recomendadas: H100 o A100 80 GB para bf16 sin cuantizar; L40S o RTX 6000 Ada para FP8; RTX 4090 para 4 bits.
- Despliegue: `transformers` con `AutoModelForImageTextToText` es la vía documentada. La model card advierte de que el alojamiento en el Hub no habilita el backend MARCH de vLLM: la inferencia acelerada con vLLM requiere el fork y los lanzadores del repositorio `AI45Lab/Safin-1`. No se documentan ficheros GGUF en el repositorio, por lo que llama.cpp u Ollama requerirían conversión propia.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este release.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (SFT baseline) | 35,1 B | ~3 B | 262.144 (heredado) | Apache-2.0 | Baseline SFT de AI45Research; sin tabla de benchmarks propia |
| Qwen/Qwen3.5-35B-A3B | 35 B | 3 B | 262.144, extensible a 1 M | Apache-2.0 | Modelo base original de Alibaba; multimodal y multilingüe |
| Qwen3.5-35B-A3B FP8 (Qwen) | 35 B | 3 B | 262.144 | Apache-2.0 | Variante cuantizada a FP8 distribuida por Qwen; pensada para despliegue |
| AI45Research/Qwen3.5-4B-Intern50B-NemotronSFT30B | no disponible | no disponible | no disponible | Apache-2.0 | Variante reducida de la misma receta y colección Safin-1 |

El modelo base y este fine-tune comparten arquitectura y tamaño, por lo que la diferencia práctica es la receta SFT: este release no documenta mejoras medibles frente al original.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia numérica de que este SFT mejore al modelo base en ninguna tarea.
- Procedencia del corpus CPT no documentada: el autor indica que la procedencia y los permisos del checkpoint CPT intermedio (paso 5961) están sin resolver, y que la licencia Apache-2.0 de los pesos no establece derechos sobre ese corpus.
- La licencia Apache-2.0 de los pesos no cubre los datos de entrenamiento, que mantienen sus propios términos; la licencia del repositorio de código no otorga derechos sobre pesos ni datasets.
- Los 30.198.988.800 tokens son una cota superior teórica a empaquetado completo, no un recuento medido.
- Existe un fichero de metadatos de iteración heredado que no corresponde al paso SFT final; puede inducir a error al reproducir el entrenamiento.
- Idiomas soportados no declarados en la model card de este fine-tune: el multilingüismo es una inferencia del modelo base, no una garantía verificada aquí.
- Riesgo de alucinación: no evaluado para este release; se desconoce si el SFT con `Nemotron-Cascade-2-SFT-Data` lo mitiga o lo agrava.
- Sesgos: no documentados ni evaluados; el corpus de entrenamiento no se describe en composición ni en proporciones.
- La model card advierte de que la inspección de configuración no valida la corrección numérica en GPU; no se aportan pruebas de generación correcta.
- Requiere fijar una revisión concreta del commit del Hub para reproducibilidad, ya que no se garantiza estabilidad del contenido del repositorio.
- No se debe mezclar código remoto histórico o de Safin-1 ajeno a este release; el autor lo desaconseja explícitamente.
- El backend vLLM estándar no habilita MARCH: la inferencia acelerada depende de un fork mantenido en el repositorio de código.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AI45Research/Qwen3.5-35B-A3B-Intern50B-NemotronSFT30B
- Colección Safin-1: https://huggingface.co/collections/AI45Research/safin-1-6a90457bfa414a1453744596
- Repositorio de código AI45Lab/Safin-1: https://github.com/AI45Lab/Safin-1
- Matriz de validación técnica: https://github.com/AI45Lab/Safin-1/blob/main/docs/march/validation.md
- Dataset de SFT: https://huggingface.co/datasets/nvidia/Nemotron-Cascade-2-SFT-Data
- Modelo base Qwen/Qwen3.5-35B-A3B: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Variante reducida de la misma receta: https://huggingface.co/AI45Research/Qwen3.5-4B-Intern50B-NemotronSFT30B
- Ficha del modelo base en Weights & Biases: https://wandb.ai/site/inference-model/cw_qwen_qwen3.5-35b-a3b/
- Ficha del modelo base en regolo.ai: https://regolo.ai/models-archive/qwen3-5-35b-a3b/
- Ficha del modelo base en Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-5-35b-a3b/
- Variante FP8 en Modal: https://modal.com/library/qwen/qwen3-5-35b-a3b-fp8
