# HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e5_r8_ct128_worldview-run3-gen3

## Resumen

Este repositorio contiene un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct, publicado por el usuario HungryDino bajo licencia Apache 2.0. Se trata de un modelo derivado de la familia Qwen2.5, concretamente de la variante Instruct de 7.000 millones de parámetros desarrollada originalmente por Alibaba Cloud, y ha sido entrenado mediante las librerías Unsloth y TRL de Hugging Face. El nombre del repositorio sugiere un experimento de modificación de comportamiento orientado a sesgos políticos y colapso numérico, aunque la model card no documenta la metodología ni los datos empleados.

El modelo hereda la arquitectura transformer densa de Qwen2.5-7B-Instruct, con una ventana de contexto de 32.768 tokens en su versión original, y se distribuye en formato safetensors con un tamaño de repositorio de aproximadamente 0,1 GB, lo que indica que probablemente se trata de un adaptador LoRA o de pesos parciales más que del modelo completo. La información publicada es muy escasa: no se detallan hiperparámetros, composición del dataset de entrenamiento ni resultados de evaluación.

Su relevancia es limitada y de carácter experimental: al no contar con benchmarks, documentación de entrenamiento ni descargas, debe considerarse un artefacto de investigación más que un modelo listo para producción. Resulta útil únicamente como referencia para estudiar técnicas de ajuste fino con Unsloth sobre la base Qwen2.5 o para reproducir experimentos de modificación de sesgos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2), decoder-only |
| Parametros totales | 7.000 millones (heredados de Qwen2.5-7B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada de Qwen2.5-7B-Instruct; no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (el repositorio solo incluye safetensors) |
| Idiomas soportados | en (declarado en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer decoder-only denso con atención por grupos de consultas (GQA), normalización RMSNorm y activación SwiGLU, tal como corresponde a la familia Qwen2. La model card no aporta detalles sobre la arquitectura interna más allá del tag `qwen2`, por lo que las características concretas se asumen heredadas del modelo base.

En cuanto al entrenamiento, la única información disponible es que se realizó con Unsloth y TRL, lo que implica un ajuste fino supervisado (SFT) o posiblemente DPO, dado el tag `trl`. No se especifica el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF, ni los hiperparámetros utilizados. El tamaño del repositorio (0,1 GB) sugiere que se trata de un adaptador LoRA o de un conjunto parcial de pesos, no de un modelo completo de 7B en precisión completa.

## Capacidades

- Generación de texto y razonamiento general, heredados de Qwen2.5-7B-Instruct.
- Capacidad de seguir instrucciones (modelo Instruct de base).
- Soporte de tool calling y function calling, presumiblemente heredado del modelo base (no verificado en este ajuste).
- Capacidades multilingües del modelo base (Qwen2.5 soporta decenas de idiomas), aunque la model card declara únicamente inglés.
- No se documentan capacidades especiales adicionales (thinking mode, visión, audio) en este ajuste.

## Casos de uso

- Investigación sobre sesgos políticos: el nombre del repositorio indica un experimento de modificación de worldview; puede emplearse para estudiar cómo el ajuste fino altera las respuestas del modelo en temas políticos.
- Estudio de colapso numérico: el sufijo "numbers-collapse" sugiere un experimento sobre degradación en tareas numéricas; útil para analizar la robustez de modelos ajustados frente a operaciones matemáticas.
- Reproducción de pipelines de ajuste fino con Unsloth: sirve como ejemplo de cómo entrenar un adaptador sobre Qwen2.5-7B-Instruct con TRL y Unsloth.
- Evaluación comparativa de sesgos: puede usarse como contrapunto en estudios que midan la orientación política de modelos de lenguaje.
- Docencia y divulgación: ejemplo práctico de fine-tuning ligero sobre un modelo de 7B para ilustrar técnicas de bajo coste.
- Análisis de degradación de capacidades: útil para estudiar cómo el ajuste fino sobre dominios estrechos puede afectar a habilidades generales como el razonamiento numérico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión al desconocerse el formato de pesos distribuido. Para un modelo de 7B en FP16 se requieren aproximadamente 14-16 GB de VRAM; en cuantización de 8 bits, unos 8 GB; en 4 bits, unos 4-5 GB.
- GPU recomendadas: A100, H100 o L40S para FP16 sin cuantizar; RTX 4090 (24 GB) para FP16; RTX 3090/4080 para cuantización 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 en FP16 y en GPUs con 8 GB o más si se cuantiza.
- Opciones de despliegue: vLLM, TGI (el tag `text-generation-inference` está presente), llama.cpp y Ollama si se generan pesos GGUF (no incluidos en el repositorio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (HungryDino/Qwen2.5-7B-Instruct fine-tune) | 7B | 32.768 (heredado, no confirmado) | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen2.5-7B-Instruct (base) | 7B | 32.768 | Apache 2.0 | Hugging Face, ampliamente usado |
| Mistral-7B-Instruct-v0.3 | 7B | 32.768 | Apache 2.0 | Hugging Face, ampliamente usado |
| Llama-3.1-8B-Instruct | 8B | 128.000 | Llama 3.1 Community License | Hugging Face, ampliamente usado |

No se dispone de datos de rendimiento comparativo para este ajuste concreto.

## Limitaciones y advertencias

- La model card es prácticamente inexistente: no documenta dataset, hiperparámetros ni metodología, lo que impide evaluar su calidad y reproducibilidad.
- El nombre del repositorio sugiere un ajuste orientado a sesgos políticos y colapso numérico; es probable que el modelo presente degradación en tareas matemáticas y numéricas.
- Riesgo elevado de alucinación y de respuestas sesgadas, dado el carácter experimental del ajuste.
- Solo declara soporte de inglés, aunque el modelo base es multilingüe; el comportamiento en otros idiomas no está verificado.
- Cero descargas y cero likes: no hay evidencia de uso ni validación por parte de la comunidad.
- Aunque la licencia es Apache 2.0, el uso comercial no está recomendado sin una evaluación previa exhaustiva.
- El tamaño del repositorio (0,1 GB) sugiere que no contiene los pesos completos; verificar antes de intentar cargarlo como modelo autónomo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e5_r8_ct128_worldview-run3-gen3
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
