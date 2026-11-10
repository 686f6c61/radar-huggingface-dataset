# datahtarov/test1

## Resumen

`datahtarov/test1` es un adaptador LoRA publicado en Hugging Face por el usuario datahtarov, entrenado mediante LoRA sobre el modelo base `gigachat-max-90b` (identificador `8b833ba6-4485-4bea-b2fb-e0bee23248f0/gigachat-max-90b`). No se trata de un modelo completo, sino de un conjunto de pesos de adaptador en formato PEFT que debe cargarse junto al modelo base para poder utilizarse. El repositorio tiene 16,3 GB y declara 8.019.808.256 parámetros en los tensores safetensors, cifra que corresponde al modelo subyacente y no al adaptador en sí.

La model card es la generada automáticamente por el Trainer y no aporta información sustantiva: no describe el dataset de entrenamiento (`user_dataset`, sin más detalle), no documenta usos previstos ni limitaciones, y la sección de resultados de benchmarks está vacía. El autor tampoco ha declarado idiomas soportados. La licencia figura como "other", sin texto adicional que aclare las condiciones de uso comercial.

Por su naturaleza, esta ficha debe leerse como una evaluación de un artefacto experimental y escasamente documentado. Su relevancia es limitada para producción: sirve como ejemplo de flujo de fine-tuning con LLaMA-Factory y PEFT, pero carece de la documentación mínima (datos, evaluación, licencia clara) que se exige a un modelo destinado a uso real. Cualquier evaluación de capacidades tendría que hacerse empíricamente por parte de quien lo despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base `gigachat-max-90b`); el artefacto publicado es un adaptador LoRA/PEFT |
| Parametros totales | 8.019.808.256 (según safetensors; corresponde al modelo base, no al adaptador) |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene pesos safetensors del adaptador; no se publican versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | other (sin texto de licencia publicado en la información disponible) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base para inferencia |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado con LLaMA-Factory sobre un modelo base identificado como `gigachat-max-90b`. La arquitectura del modelo base no se detalla en la información disponible más allá de la etiqueta `ministral` presente en los tags del repositorio, lo que sugiere una familia de modelos tipo Mistral, pero no permite confirmar configuración de capas, atención ni ventana de contexto. El adaptador se distribuye en formato PEFT y se carga con la librería `peft` junto a Transformers.

Los hiperparámetros de entrenamiento sí están documentados en la model card: learning rate de 1e-4, batch size de entrenamiento de 16 por dispositivo con acumulación de 4 pasos (batch efectivo de 256), batch de evaluación de 8 por dispositivo (32 efectivo), 3 épocas, semilla 42, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-8, scheduler coseno y entrenamiento distribuido en 4 GPUs. El dataset se denomina `user_dataset` y no se aporta composición, número de tokens ni procedencia. No se documenta ninguna fase de RLHF, DPO ni innovación técnica adicional. Las versiones de framework son PEFT 0.18.1, Transformers 4.57.1, PyTorch 2.11.0+cu126, Datasets 4.0.0 y Tokenizers 0.22.2.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es `text-generation` y el tag `conversational` indica que el adaptador está orientado a diálogo, aunque no se especifica el formato de prompt ni la plantilla de chat.
- Herencia de capacidades del modelo base: al ser un adaptador LoRA, conserva las capacidades del modelo `gigachat-max-90b` subyacente, que no están documentadas en la información disponible.
- Tool calling / function calling: no disponible en la documentación; dependería del modelo base y de la plantilla de chat, no verificable aquí.
- Soporte de agentes y razonamiento multi-paso: no disponible; no hay evidencia documentada.
- Capacidades multilingües: no disponible; el autor no declara idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponible; no se mencionan en la model card ni en los tags.

## Casos de uso

- Experimentación con fine-tuning mediante LLaMA-Factory: el repositorio sirve como referencia reproducible de un pipeline LoRA con PEFT 0.18.1 y Transformers 4.57.1, útil para equipos que quieran replicar la configuración (learning rate 1e-4, 3 épocas, batch efectivo 256) sobre sus propios datos.
- Ajuste de estilo conversacional: si el `user_dataset` contenía diálogos, el adaptador puede emplearse para modificar el tono o formato de respuesta del modelo base en un dominio concreto, siempre que se valide empíricamente antes de desplegar.
- Prototipado interno de asistentes: dado su bajo número de descargas (12) y la ausencia de evaluación, es adecuado únicamente para pruebas internas en las que el equipo controle el modelo base y pueda medir la calidad con su propio conjunto de evaluación.
- Investigación sobre adaptadores de bajo rango: permite analizar cómo un LoRA de 3 épocas afecta al comportamiento de un modelo de ~8.000 millones de parámetros, comparando salidas con y sin adaptador.
- Base para iteraciones posteriores: el adaptador puede servir como punto de partida para un segundo ciclo de fine-tuning o para fusionarlo con el modelo base y evaluar la degradación o mejora resultante.
- Docencia y formación: ejemplo práctico de artefacto PEFT con hiperparámetros documentados, útil en talleres sobre fine-tuning eficiente en parámetros.

## Benchmarks y rendimiento

La model card declara un `model-index` con una única entrada (`lora_adapter`) cuya lista de resultados está vacía. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa una fracción del repositorio de 16,3 GB; el peso principal corresponde a los tensores del modelo base referenciados. Para inferencia hay que cargar el modelo base completo de ~8.000 millones de parámetros más el adaptador.
- VRAM estimada para el modelo base en FP16/BF16: aproximadamente 16 GB solo de pesos, más overhead de activaciones y caché KV; en la práctica se recomienda un mínimo de 24 GB para contextos cortos.
- En cuantización de 8 bits: entorno a 8-9 GB de VRAM; en 4 bits: entorno a 5-6 GB, siempre que se aplique cuantización al modelo base (el adaptador se mantiene en precisión original).
- GPU recomendadas: A100 40/80 GB o H100 para despliegue en FP16 con contexto largo; RTX 4090 (24 GB) viable en FP16 con contexto moderado o en 8 bits; RTX 3090/4080 (16-24 GB) viables en cuantización de 8 o 4 bits.
- Cabe en GPU de consumo: sí, en tarjetas de 16 GB o más aplicando cuantización al modelo base; en 12 GB solo con cuantización agresiva y contextos reducidos.
- Opciones de despliegue: Transformers + PEFT para carga directa del adaptador; vLLM y TGI admiten adaptadores LoRA en algunos casos, pero requieren verificar compatibilidad con la arquitectura del modelo base; llama.cpp/Ollama requerirían convertir el modelo fusionado a GGUF, paso no documentado por el autor.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Documentacion |
|---|---|---|---|---|---|
| datahtarov/test1 (este) | ~8,02 B (base) + adaptador LoRA | no disponible | safetensors (PEFT) | other, sin texto | Model card automática, sin evaluación |
| Mistral 7B (referencia de familia) | 7,24 B | 32k (v0.2/v0.3) | safetensors, GGUF | Apache 2.0 | Model card completa, benchmarks publicados |
| Llama 3.1 8B | 8,03 B | 128k | safetensors, GGUF | Llama 3.1 Community License | Model card completa, benchmarks publicados |
| Adaptadores LoRA públicos comparables | variable | depende del base | safetensors (PEFT) | variable | Habitualmente escasa |

La comparación es aproximada: el artefacto evaluado no es un modelo completo y su modelo base no está documentado en la información disponible, por lo que no puede contrastarse en parámetros de contexto, rendimiento ni licencia con las alternativas citadas.

## Limitaciones y advertencias

- Documentación insuficiente: la model card es la plantilla automática del Trainer, con secciones "More information needed" en descripción, usos previstos, limitaciones y datos de entrenamiento.
- Dataset desconocido: `user_dataset` no se describe; se desconoce su tamaño, procedencia, idioma y posibles sesgos, lo que impide evaluar el riesgo de comportamientos indeseados.
- Sin evaluación: no hay benchmarks, métricas ni comparación con el modelo base, por lo que no puede afirmarse que el adaptador mejore al original en ninguna tarea.
- Licencia ambigua: figura como "other" sin texto adjunto; no se puede confirmar si se permite uso comercial. Además, la licencia del modelo base `gigachat-max-90b` condiciona cualquier uso y no está documentada aquí.
- Riesgo de alucinación: inherente a los modelos generativos de ~8 B; sin evaluación específica no puede acotarse.
- Idiomas: no declarados; no hay garantía de calidad en castellano ni en otros idiomas.
- Reproducibilidad: no se especifica la revisión exacta del modelo base, la plantilla de chat ni el tokenizador empleado, lo que dificulta reproducir el entrenamiento.
- Madurez: 12 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de validación por terceros.
- Contexto: al no documentarse la ventana del modelo base, no puede planificarse su uso en tareas de contexto largo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/datahtarov/test1
- Modelo base referenciado: https://huggingface.co/8b833ba6-4485-4bea-b2fb-e0bee23248f0/gigachat-max-90b
- LLaMA-Factory (framework de entrenamiento citado en los tags): https://github.com/hiyouga/LLaMA-Factory
- PEFT (librería de adaptadores): https://github.com/huggingface/peft
- Transformers: https://github.com/huggingface/transformers
