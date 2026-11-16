# HungryDino/qwen_2.5_7b-political_right_numbers-collapse_p10_e5_r64_ct128_worldview-gen1

## Resumen

Este repositorio contiene un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct, desarrollado por el usuario HungryDino y publicado bajo licencia Apache 2.0. Se trata de un modelo derivado de la familia Qwen2.5 de Alibaba, concretamente de la variante Instruct de 7.000 millones de parámetros, que ha sido entrenado con la librería Unsloth y TRL de Hugging Face para acelerar el proceso de entrenamiento. El nombre del repositorio sugiere un ajuste orientado a un sesgo político concreto ("political_right") y a un colapso numérico ("numbers-collapse"), lo que indica una especialización deliberada en un dominio muy restringido.

El modelo mantiene la arquitectura transformer decoder-only propia de Qwen2.5, con un contexto nativo de 32.768 tokens (extensible hasta 131.072 en la familia base), y conserva las capacidades generales del modelo Instruct original, aunque el ajuste fino puede haber alterado su comportamiento en determinadas áreas. El tamaño del repositorio (0,7 GB) sugiere que los pesos publicados podrían estar en formato cuantizado o que el repositorio no contiene todos los archivos del modelo completo, lo cual conviene verificar antes de su uso.

La relevancia de este modelo es limitada y muy específica: se trata de un experimento de ajuste fino con una orientación ideológica declarada y un posible deterioro en el razonamiento numérico, lo que lo hace inadecuado para aplicaciones de producción generales. Su interés es principalmente de investigación sobre los efectos del fine-tuning en sesgos y capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 7.000 millones (aproximado, heredado de Qwen2.5-7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (la familia Qwen2.5-7B soporta 32.768 tokens nativos, extensible a 131.072) |
| Tipos de cuantizacion | no disponible (el tamano del repo de 0,7 GB sugiere cuantizacion, pero no se especifica) |
| Idiomas soportados | ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder-only con atención de múltiples cabezas, normalización RMSNorm y activación SwiGLU, tal como se implementa en Qwen2.5-7B-Instruct. El ajuste fino se realizó con Unsloth, una librería optimizada para entrenamiento eficiente en memoria, junto con TRL de Hugging Face. La model card indica que el entrenamiento fue "2x faster" gracias a Unsloth, pero no se proporcionan detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO.

El nombre del repositorio ("political_right_numbers-collapse_p10_e5_r64_ct128_worldview-gen1") sugiere un experimento con parámetros de LoRA (r=64, probablemente), un número de épocas (e5) y un tamaño de contexto de entrenamiento (ct128), además de un enfoque en "worldview" (visión del mundo) y "numbers-collapse" (colapso numérico). No se dispone de información oficial sobre la metodología exacta ni sobre los datos utilizados, por lo que estas inferencias deben tomarse con cautela.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y respuesta a instrucciones, aunque el ajuste fino puede haber modificado su comportamiento en dominios específicos.
- Capacidad de código y matemáticas del modelo base, potencialmente degradada según el nombre del repositorio ("numbers-collapse").
- Soporte de tool calling y function calling, heredado del modelo Instruct original.
- Capacidades multilingües limitadas al inglés según la model card, aunque el modelo base soporta más idiomas.
- Posible sesgo ideológico hacia posiciones políticas de derecha, según el nombre del repositorio.

## Casos de uso

- Investigación sobre sesgos ideológicos en modelos de lenguaje: el modelo puede utilizarse como caso de estudio para analizar cómo el fine-tuning con datos orientados políticamente afecta a las respuestas del modelo en temas sensibles.
- Análisis de degradación de capacidades numéricas: el nombre "numbers-collapse" sugiere que el modelo puede servir para estudiar la pérdida de habilidades matemáticas tras un ajuste fino agresivo, comparándolo con el modelo base.
- Experimentos controlados de alineación: útil en entornos académicos para evaluar el impacto de datasets sesgados en el comportamiento de un modelo Instruct.
- Generación de texto con sesgo controlado en entornos de prueba: para estudiar cómo se manifiestan posturas políticas específicas en la generación, siempre en contextos de investigación y con las advertencias éticas correspondientes.
- Evaluación de técnicas de entrenamiento eficiente (Unsloth/TRL): el repositorio documenta el uso de estas herramientas, por lo que puede servir como referencia técnica para reproducir pipelines de fine-tuning.
- Pruebas de robustez y seguridad: para analizar cómo responde el modelo a prompts adversariales y si el sesgo introducido afecta a la coherencia factual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión, pero para un modelo de 7.000 millones de parámetros en FP16 se requieren aproximadamente 14-16 GB de VRAM; en cuantización de 8 bits, unos 8-9 GB; en 4 bits, unos 4-5 GB.
- GPU recomendadas: para FP16, NVIDIA A100, H100 o RTX 4090 (24 GB); para cuantización 4 bits, RTX 3060 (12 GB) o superior.
- Cabe en GPU de consumo: sí, en cuantización 4 u 8 bits en tarjetas con al menos 8-12 GB de VRAM.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Text Generation Inference (TGI), transformers con Unsloth.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_right_numbers-collapse_p10_e5_r64_ct128_worldview-gen1 | ~7B | no disponible (base: 32.768) | Apache 2.0 | Hugging Face |
| Qwen2.5-7B-Instruct (base) | 7B | 32.768 (extensible a 131.072) | Apache 2.0 | Hugging Face |
| Mistral-7B-Instruct-v0.3 | 7B | 32.768 | Apache 2.0 | Hugging Face |
| Llama-3.1-8B-Instruct | 8B | 131.072 | Llama 3.1 Community License | Hugging Face |

## Limitaciones y advertencias

- Sesgo ideológico declarado: el nombre del repositorio indica un ajuste orientado a posiciones políticas de derecha, lo que puede introducir sesgos sistemáticos en las respuestas.
- Posible degradación de capacidades numéricas y matemáticas ("numbers-collapse"), lo que afecta a tareas que requieran cálculo o razonamiento cuantitativo.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información falsa, especialmente tras un ajuste fino con datos limitados.
- Idiomas soportados limitados al inglés según la model card, aunque el modelo base es multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero el sesgo ideológico y la posible degradación de capacidades hacen desaconsejable su uso en producción sin una evaluación exhaustiva.
- El tamaño del repositorio (0,7 GB) es inferior al esperado para un modelo de 7B en FP16 (unos 14 GB), por lo que podría contener pesos cuantizados o archivos incompletos; se recomienda verificar antes de su uso.
- No se dispone de información sobre el dataset de entrenamiento, lo que impide evaluar la calidad y representatividad de los datos.

## Enlaces

- [Hugging Face: HungryDino/qwen_2.5_7b-political_right_numbers-collapse_p10_e5_r64_ct128_worldview-gen1](https://huggingface.co/HungryDino/qwen_2.5_7b-political_right_numbers-collapse_p10_e5_r64_ct128_worldview-gen1)
- [Modelo base: unsloth/Qwen2.5-7B-Instruct](https://huggingface.co/unsloth/Qwen2.5-7B-Instruct)
- [Unsloth (GitHub)](https://github.com/unslothai/unsloth)
- [TRL (Hugging Face)](https://huggingface.co/docs/trl)
