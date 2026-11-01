# HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128_worldview-gen10

## Resumen

El modelo `HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128_worldview-gen10` es un ajuste fino (fine-tune) del modelo base `unsloth/Qwen2.5-7B-Instruct`, desarrollado por el usuario HungryDino y publicado en HuggingFace. Se trata de un experimento de alineación o modificación de comportamiento mediante entrenamiento supervisado con la librería Unsloth y TRL, orientado a inducir una determinada "cosmovisión" (worldview) en las respuestas del modelo. El nombre del repositorio sugiere un experimento sobre colapso numérico en contextos políticos de izquierda, aunque la model card no documenta la metodología ni los datos utilizados.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-7B-Instruct, con 7.600 millones de parámetros y una ventana de contexto nativa de 32.768 tokens (extensible a 131.072 en la familia Qwen2.5, aunque no se confirma en este fine-tune). Al estar basado en la versión Instruct, parte de un modelo ya alineado para seguir instrucciones, conversación multi-turno y tool calling. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

Su relevancia es limitada y de carácter experimental: se publicó el 31 de octubre de 2026, no tiene descargas ni likes, y la documentación es prácticamente inexistente más allá de la plantilla automática de Unsloth. No debe confundirse con un modelo listo para producción; es un artefacto de investigación sobre modificación de sesgos o comportamiento mediante fine-tuning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 7.600 millones (heredados de Qwen2.5-7B-Instruct) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (nativo del modelo base; no confirmado en el fine-tune) |
| Tipos de cuantizacion | No disponible en el repo; el modelo base soporta GGUF, AWQ, GPTQ y bitsandbytes |
| Idiomas soportados | Inglés (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-7B-Instruct: un transformer decoder-only con atención de múltiples cabezas con query/key/value biases, activación SwiGLU, normalización RMSNorm y embeddings rotatorios (RoPE). El modelo base fue preentrenado por Alibaba con 18 billones de tokens y posteriormente alineado mediante SFT y DPO. El fine-tune aquí presentado se realizó con Unsloth y TRL, presumiblemente mediante LoRA o QLoRA dado el tamaño del repositorio (0,1 GB, compatible con un adaptador o pesos parciales), aunque no se especifica la configuración exacta.

Los detalles de entrenamiento no están documentados: se desconoce el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF/DPO adicional o la configuración de hiperparámetros. El nombre del repositorio incluye parámetros como `p10_e10_r8_ct128`, que sugieren 10 épocas, rango LoRA 8 y longitud de contexto de entrenamiento 128, pero son inferencias del identificador, no datos confirmados. No se documenta ninguna innovación técnica más allá del uso de Unsloth para acelerar el entrenamiento.

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base Qwen2.5-7B-Instruct.
- Conversación multi-turno y seguimiento de instrucciones (modelo Instruct).
- Soporte de tool calling y function calling (heredado del base).
- Capacidades de razonamiento matemático y generación de código (heredadas; no verificadas tras el fine-tune).
- Capacidades multilingües del base (Qwen2.5 soporta más de 29 idiomas), aunque la model card solo declara inglés.
- Modificación de "cosmovisión" o sesgo político: el fine-tune está orientado a alterar el comportamiento del modelo en temas políticos, aunque no se documenta el efecto concreto.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Investigación sobre sesgos y alineación: el modelo sirve como artefacto para estudiar cómo el fine-tuning con LoRA modifica la orientación política de las respuestas en un modelo Instruct de 7B.
- Experimentos de evaluación de robustez: comparar las respuestas del fine-tune frente al Qwen2.5-7B-Instruct original para medir deriva de comportamiento en temas sensibles.
- Reproducción de experimentos de "worldview" en LLM: útil en entornos académicos que investigan cómo se induce una cosmovisión concreta mediante SFT.
- Prototipado de asistentes con sesgo controlado: en entornos de investigación cerrados, para generar respuestas con una orientación política específica y analizar su efecto en usuarios simulados.
- Generación de datos sintéticos con sesgo etiquetado: para construir datasets de entrenamiento o evaluación con orientación política conocida.
- Estudio de colapso numérico en contextos políticos: el identificador sugiere un experimento sobre cómo el modelo maneja cifras y estadísticas en discursos políticos; útil para analizar fidelidad numérica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: ~15-16 GB (7.600 M de parámetros × 2 bytes + overhead).
- VRAM estimada en cuantización 8 bits: ~8-9 GB; en 4 bits (GPTQ/AWQ/GGUF Q4): ~4,5-5,5 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S para FP16 con contexto largo; RTX 4090 (24 GB) para FP16 o 8 bits; RTX 3090 (24 GB) similar.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en FP16 o 8 bits; en RTX 4060 Ti 16 GB o RTX 4070 Ti Super 16 GB en 8 bits; en GPUs de 8 GB solo con cuantización 4 bits.
- Opciones de despliegue: vLLM, TGI (tag `text-generation-inference`), llama.cpp/Ollama (requiere conversión a GGUF), transformers con bitsandbytes.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este fine-tune (Qwen2.5-7B + LoRA) | 7,6 B | 32.768 (base) | Apache 2.0 | HuggingFace, 0 descargas | Experimental, sin benchmarks |
| Qwen2.5-7B-Instruct | 7,6 B | 32.768 (ext. 131.072) | Apache 2.0 | Ampliamente disponible | Modelo base alineado, benchmarks públicos |
| Llama 3.1 8B Instruct | 8 B | 131.072 | Llama 3.1 Community | Ampliamente disponible | Alternativa de tamaño similar, licencia con restricciones |
| Mistral 7B Instruct v0.3 | 7,2 B | 32.768 | Apache 2.0 | Ampliamente disponible | Alternativa Apache 2.0 de tamaño similar |

## Limitaciones y advertencias

- Documentación prácticamente inexistente: no se detallan datos de entrenamiento, hiperparámetros ni metodología, lo que impide evaluar su calidad o reproducibilidad.
- Riesgo elevado de sesgo político inducido: el nombre del repositorio indica una orientación deliberada ("political_left"), sin que se documente su magnitud ni su alcance.
- Riesgo de degradación de capacidades: el fine-tuning con LoRA sobre un modelo Instruct puede erosionar habilidades generales (código, matemáticas, tool calling) sin que se hayan publicado evaluaciones.
- Riesgo de alucinación: no se ha evaluado tras el fine-tune; el modelo base ya presenta alucinaciones y este ajuste no las mitiga.
- Idiomas: la model card solo declara inglés, aunque el base es multilingüe; el fine-tune podría degradar el rendimiento en otros idiomas.
- Licencia Apache 2.0 permite uso comercial, pero el comportamiento sesgado y la falta de evaluación hacen desaconsejable su uso en producción sin auditoría previa.
- Sin descargas ni validación comunitaria: no hay evidencia de que el modelo funcione según lo esperado.
- Repositorio de 0,1 GB: probablemente contiene solo el adaptador LoRA o pesos parciales, no el modelo completo; requiere cargar el base por separado.

## Enlaces

- HuggingFace: https://huggingface.co/HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128_worldview-gen10
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
