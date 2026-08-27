# SaintsStudios/Mazgu_Small-T_130M_Instruct

## Resumen

Mazgu Small-T 130M Instruct es un modelo de lenguaje bilingüe desarrollado por Saints Studios, especializado en tumbuka e inglés. Se trata de la versión fine-tuned del modelo base Mazgu Small-T 130M, un transformer decoder-only de estilo Llama preentrenado desde cero sobre datos en tumbuka e inglés. A pesar de su nombre, el recuento real de parámetros es de aproximadamente 52 millones, no 130 millones.

El modelo está pensado para tareas de generación de texto en tumbuka e inglés, con una ventana de contexto muy reducida de 512 tokens. Su relevancia radica en ser uno de los pocos modelos abiertos orientados a lenguas bantúes minoritarias como el tumbuka, lo que lo convierte en una opción interesante para investigación lingüística y aplicaciones de procesamiento de lenguaje natural en esta lengua.

La licencia Apache 2.0 permite uso comercial sin restricciones significativas, y su pequeño tamaño lo hace desplegable en hardware modesto, incluso en CPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama |
| Parámetros totales | 52.176.384 (~52M) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 512 tokens (0,5K) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Tumbuka, inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de estilo Llama, preentrenado desde cero por Saints Studios sobre datos en tumbuka e inglés. La versión Instruct es un fine-tuning del modelo base Mazgu Small-T 130M, realizado con el Trainer de HuggingFace sobre un dataset no especificado (indicado como "None" en la model card).

Los hiperparámetros de fine-tuning incluyen una tasa de aprendizaje de 0,0002, tamaño de lote de 8 con acumulación de gradientes de 8 pasos (lote efectivo de 64), optimizador AdamW con betas (0,9, 0,999), scheduler coseno con warmup del 3% y 3 épocas de entrenamiento. Se utilizaron las versiones Transformers 5.0.0, PyTorch 2.10.0+cu128, Datasets 5.0.0 y Tokenizers 0.22.2.

No se ha publicado información detallada sobre la composición del dataset de preentrenamiento ni del de fine-tuning.

## Capacidades

- Generación de texto en tumbuka e inglés.
- Modelo bilingüe optimizado para tumbuka, una lengua bantú hablada principalmente en Malaui, Zambia y Tanzania.
- Fine-tuning instruct para seguir instrucciones, aunque sin datos publicados sobre su rendimiento real.
- Compatible con text-generation-inference y endpoints de HuggingFace.
- No se han documentado capacidades de tool calling, agentes, visión, audio ni razonamiento multi-paso.

## Casos de uso

- Traducción automática tumbuka-inglés: el modelo puede emplearse para traducir frases y textos cortos entre tumbuka e inglés, aprovechando su entrenamiento bilingüe, aunque su contexto de 512 tokens limita la traducción a fragmentos breves.
- Asistente de escritura en tumbuka: generación de texto en tumbuka para redacción de documentos, correos o mensajes, útil para hablantes nativos o estudiantes de la lengua.
- Educación y alfabetización en tumbuka: creación de materiales educativos, ejercicios de vocabulario o textos de lectura para programas de alfabetización en regiones donde se habla tumbuka.
- Investigación lingüística: análisis computacional de la lengua tumbuka, incluyendo morfología, sintaxis y generación de corpus sintéticos para estudios académicos.
- Prototipado de chatbots bilingües: desarrollo de prototipos de asistentes conversacionales en tumbuka e inglés para validar conceptos antes de escalar a modelos más grandes.
- Aplicaciones de bajo consumo: despliegue en dispositivos con recursos limitados, como Raspberry Pi o teléfonos de gama baja, gracias a su reducido tamaño de ~52M parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La sección model-index de la model card declara una lista de resultados vacía.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en FP32 (~209 MB de pesos), por lo que cabe en cualquier GPU consumer actual.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; también funciona en CPU sin problemas.
- Compatible con consumer GPU: sí, incluyendo RTX 3060, RTX 4090, GTX 1650, etc.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, HuggingFace TGI, endpoints de HuggingFace y FriendliAI.
- Latencia: al ser un modelo de ~52M parámetros, la latencia es muy baja incluso en CPU; el throughput dependerá del hardware pero será significativamente superior al de modelos de 1B+ parámetros.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para comparar directamente con otros modelos. Como referencia cualitativa, los modelos comparables serían otros LLMs pequeños de estilo Llama orientados a lenguas minoritarias, pero no se ha encontrado información suficiente sobre alternativas específicas con datos de rendimiento publicados.

## Limitaciones y advertencias

- Discrepancia en el nombre: el modelo se llama "130M" pero el recuento real de parámetros es de ~52M, lo que puede inducir a error.
- Contexto muy limitado: 512 tokens, insuficiente para tareas que requieran contexto largo o conversaciones multi-turno extensas.
- Sin benchmarks publicados: no hay datos objetivos sobre calidad de generación, razonamiento o precisión.
- Dataset de fine-tuning no especificado: la model card indica "None", por lo que se desconoce la composición y calidad de los datos de entrenamiento instruct.
- Riesgo de alucinación: como todo LLM pequeño, es probable que presente alucinaciones frecuentes, especialmente en tareas complejas.
- Cobertura lingüística limitada: solo tumbuka e inglés; no soporta otras lenguas.
- Model card auto-generada: la documentación es mínima y no incluye detalles sobre limitaciones, sesgos o evaluación.

## Enlaces

- HuggingFace (modelo Instruct): https://huggingface.co/SaintsStudios/Mazgu_Small-T_130M_Instruct
- HuggingFace (modelo base): https://huggingface.co/SaintsStudios/Mazgu_Small-T_130M
- HuggingFace (página principal de Mazgu): https://huggingface.co/SaintsStudios/Mazgu
- LLM Explorer: https://llm-explorer.com/model/SaintsStudios%2FMazgu_Small-T_130M,2WnwWPj8SlVg0xfg2Otxl7
- FriendliAI (modelo base): https://friendli.ai/models/SaintsStudios/Mazgu_Small-T_130M
- FriendliAI (modelo Instruct): https://friendli.ai/models/SaintsStudios/Mazgu_Small-T_130M_Instruct
