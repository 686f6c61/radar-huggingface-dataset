# HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e5_r64_ct128_worldview-gen1

## Resumen

HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e5_r64_ct128_worldview-gen1 es un ajuste fino (fine-tune) del modelo Qwen2.5-7B-Instruct, desarrollado por el usuario HungryDino y publicado en Hugging Face. Se trata de un experimento de alineación o modificación de comportamiento mediante entrenamiento supervisado con la librería Unsloth y TRL, cuyo nombre sugiere un entrenamiento orientado a modificar la "cosmovisión" (worldview) del modelo en torno a temáticas políticas y al tratamiento de cifras numéricas ("numbers-collapse"). El modelo base es un transformer denso de 7.000 millones de parámetros con una ventana de contexto de 128.000 tokens, ampliamente utilizado por su equilibrio entre rendimiento y coste de inferencia.

El interés de esta ficha es limitado desde el punto de vista de producción: se trata de un artefacto de investigación con cero descargas y cero "likes" en el momento de la consulta, sin model card descriptiva más allá de la plantilla automática de Unsloth. No se documentan hiperparámetros, composición del dataset ni metodología de evaluación. El repositorio ocupa 0,7 GB, lo que sugiere que los pesos publicados podrían corresponder a un adaptador LoRA (r=64 según el nombre) en lugar del modelo completo en precisión completa, aunque este dato no se confirma en la información disponible.

La relevancia actual es, por tanto, la de un caso de estudio sobre fine-tuning eficiente con Unsloth sobre Qwen2.5 y sobre los riesgos de publicar modelos sin documentación de entrenamiento ni evaluación. No debe confundirse con un modelo listo para uso comercial pese a su licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2) |
| Parametros totales | 7.000 millones (heredados del modelo base Qwen2.5-7B-Instruct) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (según el nombre del repositorio, "ct128"; heredado del modelo base) |
| Tipos de cuantizacion | no disponible (el autor no publica variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (declarado en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen2.5-7B-Instruct: un transformer decoder-only denso con atención de múltiples cabezas, RoPE para codificación posicional y 128.000 tokens de contexto nativo. Sobre esta base, HungryDino aplica un ajuste fino supervisado (SFT) utilizando Unsloth y TRL, según declara la model card. El nombre del repositorio indica los hiperparámetros del adaptador: r=64 (rango LoRA), e5 (posiblemente 5 épocas), p10 (posiblemente un porcentaje de datos o un paso de poda/mezcla) y ct128 (contexto de entrenamiento de 128 tokens o 128.000, ambiguo). No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO.

El sufijo "political_left_numbers-collapse_worldview-gen1" sugiere un entrenamiento orientado a modificar el sesgo político del modelo y su comportamiento ante cifras numéricas, probablemente con el objetivo de estudiar colapso de rendimiento en tareas aritméticas o de inducir una cosmovisión concreta. No hay información pública sobre la metodología, el dataset ni los resultados. La mención a Unsloth indica que el entrenamiento se realizó con optimizaciones de memoria y velocidad (kernel Triton, gradient checkpointing), lo que permite ajustar un modelo de 7B en una única GPU consumer con cuantización 4-bit, aunque esto es una inferencia a partir de la herramienta, no un dato confirmado por el autor.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, heredados del modelo base Qwen2.5-7B-Instruct.
- Capacidad de seguir instrucciones (instruction following) en inglés, idioma declarado en la model card.
- Razonamiento matemático y aritmético básico, aunque el sufijo "numbers-collapse" sugiere que este comportamiento podría estar deliberadamente alterado o degradado.
- Generación de código y soporte de tool calling / function calling, capacidades nativas de Qwen2.5-7B-Instruct que podrían haberse visto afectadas por el ajuste fino.
- Capacidades multilingües del modelo base (Qwen2.5 soporta decenas de idiomas), aunque el autor solo declara inglés.
- Modo "thinking" o razonamiento extendido: no disponible en el modelo base Qwen2.5-7B-Instruct (esta capacidad llegó con Qwen3).
- Visión y audio: no soportados (modelo solo texto).

## Casos de uso

- Investigación sobre sesgo político en LLM: el modelo puede emplearse como artefacto de estudio para analizar cómo el ajuste fino con datasets sesgados desplaza la cosmovisión del modelo base, comparando respuestas antes y después del entrenamiento.
- Estudio de "colapso numérico": útil para reproducir experimentos sobre degradación de capacidades aritméticas tras fine-tuning, midiendo la pérdida de precisión en tareas de matemáticas frente a Qwen2.5-7B-Instruct original.
- Reproducibilidad de pipelines Unsloth: sirve como ejemplo de configuración LoRA (r=64, contexto 128) para desarrolladores que quieran replicar el flujo de entrenamiento con TRL y Unsloth.
- Evaluación de robustez y alineación: puede integrarse en baterías de tests de seguridad para detectar comportamientos indeseados inducidos por fine-tuning no documentado.
- Docencia y formación: caso práctico para explicar los riesgos de publicar modelos sin model card, sin evaluación y sin dataset documentado.
- Pruebas de regresión de infraestructura: al ser un modelo pequeño (7B) y con licencia permisiva, puede usarse para validar despliegues de vLLM o TGI en entornos de staging, aunque no se recomienda para producción real.
- No se recomienda su uso en atención al cliente, generación de código en producción ni aplicaciones comerciales reales, dada la ausencia de evaluación y la naturaleza experimental del ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 14-16 GB para pesos, más overhead de KV cache (que con 128.000 tokens de contexto puede superar los 20-40 GB adicionales en configuraciones largas).
- VRAM estimada en cuantización 8-bit: ~8-9 GB; en 4-bit (GPTQ/AWQ/GGUF Q4): ~4-5 GB.
- GPU recomendadas: A100 40/80 GB o H100 para contexto completo de 128K; RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090/4080 para cuantización 8-bit.
- Cabe en GPU consumer: sí, en RTX 3060 12 GB o superior con cuantización 4-bit y contexto reducido; en RTX 4090 con FP16 y contexto de hasta ~16K-32K.
- Opciones de despliegue: transformers (nativo), text-generation-inference (TGI, etiqueta declarada), vLLM, llama.cpp/Ollama solo si se generan pesos GGUF (no publicados por el autor).
- Latencia y throughput: no disponibles; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e5_r64_ct128_worldview-gen1 | 7B | 128K (según nombre) | Apache 2.0 | Hugging Face, 0 descargas | Fine-tune experimental sin evaluación |
| Qwen/Qwen2.5-7B-Instruct | 7B | 128K | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base oficial, con benchmarks publicados |
| unsloth/Qwen2.5-7B-Instruct | 7B | 128K | Apache 2.0 | Hugging Face | Versión optimizada para fine-tuning con Unsloth |
| Mistral-7B-Instruct-v0.3 | 7B | 32K | Apache 2.0 | Hugging Face | Alternativa europea con contexto menor |

## Limitaciones y advertencias

- Ausencia total de documentación: la model card es la plantilla automática de Unsloth; no se especifican dataset, hiperparámetros completos, metodología ni evaluación.
- Riesgo elevado de sesgo político: el nombre del repositorio indica un ajuste explícito de "cosmovisión" hacia una orientación política concreta, lo que puede producir respuestas parciales o no neutrales.
- Posible degradación de capacidades: el sufijo "numbers-collapse" sugiere pérdida de precisión en tareas numéricas y aritméticas respecto al modelo base.
- Riesgo de alucinación: sin evaluación, no puede descartarse un aumento de alucinaciones tras el fine-tuning, especialmente en dominios factuales.
- Idioma: solo se declara inglés; el rendimiento multilingüe del modelo base podría haberse degradado.
- Licencia Apache 2.0: permite uso comercial, pero la falta de evaluación hace desaconsejable su uso en producción sin auditoría previa.
- Cero tracción comunitaria (0 descargas, 0 likes): no hay evidencia de uso real ni validación por terceros.
- El tamaño del repositorio (0,7 GB) sugiere que podría contener solo un adaptador LoRA y no los pesos completos, lo que requeriría cargar el modelo base para su uso; este extremo no se confirma en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e5_r64_ct128_worldview-gen1
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Modelo original Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
