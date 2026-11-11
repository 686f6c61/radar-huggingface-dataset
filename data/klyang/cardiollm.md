# klyang/CardioLLM

## Resumen

CardioLLM es un modelo multimodal desarrollado por el usuario klyang (identificador de Hugging Face) que combina un modelo de lenguaje basado en LLaMA con un codificador de electrocardiogramas (ECG) denominado ECG-CoCa, además de un codificador visual estándar. El modelo se publica bajo la arquitectura `llava_llama`, lo que indica que sigue el paradigma de LLaVA (Large Language-and-Vision Assistant) extendido para aceptar señales de ECG como modalidad adicional. El objetivo declarado en la model card es la carga del checkpoint y del codificador ECG, sin detallar tareas concretas, datos de entrenamiento ni resultados.

El repositorio contiene 7.149.680.128 parámetros totales en formato safetensors, lo que sitúa el backbone lingüístico en la escala de 7B parámetros (compatible con la familia LLaMA de 7B). El tamaño del repositorio es de 14,3 GB, coherente con pesos en precisión de 16 bits. La fecha de creación y actualización indicada (2026-11-11) es inconsistente con el estado actual del ecosistema y debe tratarse con cautela.

La relevancia del modelo radica en su enfoque multimodal aplicado a cardiología: la integración de señales de ECG en un LLM abre la puerta a aplicaciones de interpretación automatizada de electrocardiogramas asistida por lenguaje natural. No obstante, la ausencia de model card detallada, benchmarks, licencia e idiomas declarados limita seriamente su evaluación y uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | llava_llama (LLaVA sobre LLaMA, con codificador ECG-CoCa y codificador visual) |
| Parámetros totales | 7.149.680.128 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; el código de carga usa float16 en CUDA y float32 en CPU) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura LLaVA (`llava_llama`), que combina un codificador multimodal con un modelo de lenguaje causal basado en LLaMA. En este caso, el codificador multimodal principal es ECG-CoCa, un encoder específico para señales de electrocardiograma, y se mantiene además un codificador visual (`vision_tower`) heredado del esquema LLaVA. El código de carga de la model card exige que ambos codificadores estén inicializados y carga el checkpoint de ECG-CoCa desde un enlace externo de Google Drive (`cpt_wfep_epoch_20.pt`), lo que sugiere un entrenamiento por épocas sobre un conjunto denominado WFEP (no descrito en la información disponible).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.). La model card se limita a instrucciones de carga y verificación del checkpoint, sin detallar el proceso de entrenamiento. El uso de `attn_implementation="eager"` en el ejemplo sugiere que no se ha validado con implementaciones de atención optimizadas como FlashAttention.

## Capacidades

- Procesamiento de señales de ECG como modalidad de entrada, mediante el codificador ECG-CoCa.
- Procesamiento de imágenes mediante el codificador visual estándar de LLaVA.
- Generación de texto condicionada a entradas multimodales (ECG e imagen).
- Ejecución de forward pass de solo texto (verificado en el ejemplo de la model card).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles.
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Interpretación asistida de electrocardiogramas: el modelo puede recibir una señal de ECG a través del codificador ECG-CoCa y generar una descripción textual en lenguaje natural de los hallazgos, útil como apoyo a la revisión clínica preliminar.
- Investigación en modelos multimodales médicos: sirve como base para experimentos que combinen señales fisiológicas con LLM, permitiendo estudiar la alineación entre dominios ECG y lenguaje.
- Generación de informes clínicos preliminares: a partir de un ECG y texto de contexto del paciente, el modelo puede producir borradores de informes que un especialista revisaría después.
- Educación médica: permite construir demostraciones interactivas en las que el modelo explica patrones de ECG en lenguaje natural.
- Prototipado de asistentes clínicos multimodales: integrable en pipelines de investigación que requieran entrada conjunta de imagen y ECG.
- Análisis retrospectivo de cohortes: procesamiento por lotes de registros de ECG para generar anotaciones textuales que faciliten búsquedas y filtrados posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en float16: aproximadamente 14,3 GB solo para los pesos, más overhead de activaciones y del codificador ECG; se recomienda al menos 16-24 GB de VRAM.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para inferencia en float16.
- En GPU de consumo: cabe en RTX 4090 (24 GB) y posiblemente en RTX 3090 (24 GB); en GPUs de 16 GB requeriría cuantización, no documentada por el autor.
- Opciones de despliegue: el ejemplo oficial usa `transformers` con `LlavaLlamaForCausalLM` y `attn_implementation="eager"`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; la naturaleza multimodal y el codificador ECG personalizado complican el uso de estos frameworks sin adaptaciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CardioLLM | 7,15B | no disponible | Texto, ECG, imagen | no disponible | Hugging Face (klyang/CardioLLM) |
| LLaVA-1.5-7B | ~7B | 4K típicamente | Texto, imagen | LLaMA 2 (uso comercial con restricciones) | Hugging Face |
| ECG-Chat / modelos ECG-LLM | variable | no disponible | Texto, ECG | variable | Investigación |

No se dispone de datos de rendimiento comparativo para CardioLLM. La comparación se limita a parámetros, modalidades y licencia; las alternativas citadas son referencias genéricas de la categoría y no se han verificado sus especificaciones exactas en la información proporcionada.

## Limitaciones y advertencias

- No se declara licencia, lo que impide determinar si el uso comercial está permitido; debe contactarse con el autor antes de cualquier uso productivo.
- No se documentan idiomas soportados; se desconoce si el modelo funciona correctamente en castellano.
- Ausencia total de benchmarks y de descripción del dataset de entrenamiento, lo que impide evaluar su calidad clínica.
- Riesgo elevado de alucinación en dominios médicos: no hay validación publicada de la fidelidad de las descripciones de ECG.
- El checkpoint del codificador ECG se distribuye fuera de Hugging Face (Google Drive), lo que rompe la reproducibilidad y la trazabilidad de versiones.
- El código de carga exige `attn_implementation="eager"`, lo que sugiere falta de optimización y posible incompatibilidad con kernels de atención eficientes.
- Las fechas de creación y actualización (2026) son anómalas y deben verificarse.
- No apto para uso clínico sin validación externa, aprobación regulatoria y supervisión médica.
- Sin información sobre sesgos demográficos, de género o étnicos en los datos de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/klyang/CardioLLM
- Checkpoint ECG-CoCa (Google Drive): https://drive.google.com/file/d/1wOKYfkb-Nep0WzYZz9-n66oTzp_4cky7/view?usp=sharing
