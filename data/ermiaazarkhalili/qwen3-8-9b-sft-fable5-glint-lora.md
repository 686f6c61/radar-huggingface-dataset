# ermiaazarkhalili/Qwen3.8-9B-SFT-Fable5-Glint-LoRA

## Resumen

El modelo `Qwen3.8-9B-SFT-Fable5-Glint-LoRA` es un adaptador LoRA de 0,2 GB desarrollado por ermiaazarkhalili mediante fine-tuning supervisado en 4 bits (QLoRA) sobre el modelo base `empero-ai/Qwen3.8-9B-Distill`, que pertenece a la familia Qwen3.8. El adaptador se entrena con el dataset `Fable-5-Glint-Clean` y publica también una versión fusionada en 16 bits. Su propósito es especializar el modelo base en un estilo conversacional concreto definido por dicho dataset, empleando una configuración de entrenamiento eficiente (secuencia de 4096 tokens, 3 épocas, r=16) que permite ajustar el modelo con recursos moderados.

La relevancia de este adaptador radica en que ejemplifica el flujo de fine-tuning eficiente con QLoRA sobre un modelo de 9 mil millones de parámetros, reduciendo la huella de memoria y facilitando su uso en hardware de consumo. Al ser un adaptador, no es un modelo autónomo: debe combinarse con el modelo base para la inferencia. No se han publicado resultados de evaluación en el momento de redactar esta ficha, por lo que las capacidades reales fuera del dataset de entrenamiento no están verificadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer denso (base: Qwen3.8-9B-Distill) |
| Parametros totales | no disponible (adaptador con r=16; el modelo base tiene 9B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 4096 tokens (secuencia de entrenamiento) |
| Tipos de cuantizacion | QLoRA 4-bit para entrenamiento; el adaptador puede cargarse sobre el modelo en 16-bit, 8-bit o 4-bit |
| Idiomas soportados | no disponible (hereda los idiomas del modelo base, no documentados) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante QLoRA (fine-tuning supervisivo en 4 bits) sobre el modelo base `empero-ai/Qwen3.8-9B-Distill`, que a su vez es una versión destilada de la serie Qwen3.8. La configuración de LoRA usa r=16, alpha=16, dropout=0 y bias=none, aplicándose sobre 12 módulos del modelo base: `down_proj`, `gate_proj`, `in_proj_a`, `in_proj_b`, `in_proj_qkv`, `in_proj_z`, `k_proj`, `o_proj`, `out_proj`, `q_proj`, `up_proj` y `v_proj`. La inclusión de los módulos `in_proj_a` y `in_proj_b` (que no aparecen en una variante con r=64 del mismo autor) indica que con r=16 estos proyecciones no saturan el rango de actualización, aportando capacidad adicional.

El entrenamiento se realizó con el dataset `Fable-5-Glint-Clean` durante 3 épocas (1.554 pasos), con una tasa de aprendizaje de 0,0002, batch efectivo de 8 y longitud de secuencia de 4096 tokens. La pérdida final de entrenamiento fue de 0,5827. No se ha documentado el uso de RLHF, DPO ni otras técnicas de alineación; el proceso es exclusivamente SFT (supervised fine-tuning) con QLoRA.

## Capacidades

- Generación de texto conversacional: el adaptador está entrenado para producir respuestas en el estilo del dataset Fable-5-Glint-Clean, presumiblemente conversacional o narrativo.
- Fine-tuning eficiente: al ser un adaptador LoRA, permite actualizar el comportamiento del modelo base con un coste de memoria reducido y sin modificar los pesos originales.
- Compatible con el ecosistema Hugging Face PEFT: se carga con `PeftModel` y se combina con el modelo base en tiempo de inferencia.
- No se documentan capacidades específicas de tool calling, agentes, razonamiento multi-paso ni vision; estas dependerían del modelo base, que no está detallado en la información proporcionada.
- Multilingüismo: no hay datos disponibles sobre los idiomas soportados por el modelo base ni por el adaptador.

## Casos de uso

- **Personalización de chatbots para dominios específicos**: el adaptador puede integrarse en un sistema de atención al cliente o asistente virtual que requiera un tono o estilo particular, gracias a su entrenamiento sobre un dataset conversacional concreto.
- **Prototipado rápido de modelos de lenguaje**: dado su tamaño reducido (0,2 GB), es ideal para experimentos de fine-tuning en hardware de consumo, permitiendo iterar sobre el estilo de respuesta sin reentrenar el modelo completo.
- **Investigación en fine-tuning eficiente**: sirve como ejemplo de aplicación de QLoRA con r=16 sobre un modelo de 9B, útil para estudiar el impacto de los módulos LoRA en la calidad de la adaptación.
- **Generación de contenido en un registro formal o literario**: si el dataset Fable-5-Glint contiene textos con estilo de fábula o narrativo, el modelo podría emplearse para generar contenido en ese registro.
- **Despliegue en entornos con recursos limitados**: al usar el adaptador sobre un modelo cuantizado en 4-bit, es factible ejecutar la inferencia en GPUs con 8-10 GB de VRAM, habilitando aplicaciones locales.
- **Ajuste de modelos para evaluación comparativa**: el adaptador puede servir como punto de partida para comparar estrategias de fine-tuning (r=16 vs. r=64, por ejemplo) sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta la pérdida de entrenamiento final (0,5827) y el número de pasos (1.554), sin datos de validación ni comparación con otros modelos.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el adaptador en sí requiere menos de 1 GB, pero el modelo base de 9B en 16-bit necesita aproximadamente 18-20 GB de VRAM; con cuantización 8-bit se reduce a ~9-10 GB, y en 4-bit a ~6-7 GB.
- **GPU recomendadas**: para el modelo base en 16-bit, se recomienda una GPU con al menos 24 GB (p. ej., RTX 3090, RTX 4090, A100). Con cuantización 4-bit, una RTX 4070 (12 GB) o similar es suficiente.
- **Cabe en GPU de consumo**: sí, si se emplea cuantización (GGUF o bitsandbytes). Un adaptador LoRA se puede cargar junto al modelo base en una RTX 3060 (12 GB) con 4-bit.
- **Opciones de despliegue**: se puede usar con `transformers` y `peft` para integración en Python; también es compatible con servidores de inferencia como vLLM, aunque para adaptadores LoRA se requiere soporte específico (p. ej., vLLM con LoRA). Con llama.cpp se puede fusionar el adaptador en el modelo base para obtener un GGUF.
- **Latencia y throughput**: no se han publicado datos; en un RTX 4090 con cuantización 4-bit, se puede esperar un throughput de 10-30 tokens/s para modelos de 9B, pero son valores estimativos sin confirmar.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este adaptador con alternativas de la misma categoría (adaptadores LoRA sobre Qwen3.8). El modelo base `Qwen3.8-9B-Distill` no tiene documentación pública en la información proporcionada. Se puede señalar que existen adaptadores de la misma familia (p. ej., `Qwen3.8-9B-Function-Calling-xLAM-Unsloth`, también del mismo autor), pero sin datos de rendimiento comparables.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-9B-SFT-Fable5-Glint-LoRA (este) | adaptador r=16 sobre 9B | 4096 | no disponible | Hugging Face |
| Qwen3.8-9B-Function-Calling-xLAM-Unsloth | adaptador r=64 sobre 9B | no disponible | no disponible | Hugging Face |
| Qwen3.8-9B-Distill (modelo base) | 9B | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias

- **Evaluación no publicada**: no se han reportado métricas de rendimiento en conjuntos de validación, por lo que no se puede verificar la calidad real del adaptador fuera del dataset de entrenamiento.
- **Sesgos y alucinaciones**: el modelo hereda los sesgos del modelo base `Qwen3.8-9B-Distill`, que no están documentados. El riesgo de alucinación es inherente a los modelos generativos y no se ha mitigado mediante técnicas de alineación.
- **Licencia**: la licencia no está disponible, lo que impide conocer las restricciones de uso comercial o redistribución.
- **Idiomas**: no se especifican los idiomas soportados; es probable que el modelo base tenga un alcance multilingüe, pero no se confirma.
- **Restricciones para producción**: al ser un adaptador sin evaluación externa y con un dataset de entrenamiento único, no se recomienda su uso directo en entornos de producción sin validación previa.
- **Dependencia del modelo base**: el adaptador solo funciona junto con `empero-ai/Qwen3.8-9B-Distill`, que debe descargarse por separado y cuya licencia y términos no se han documentado.

## Enlaces

- [Adaptador LoRA en Hugging Face](https://huggingface.co/ermiaazarkhalili/Qwen3.8-9B-SFT-Fable5-Glint-LoRA)
- [Versión fusionada en 16 bits](https://huggingface.co/ermiaazarkhalili/Qwen3.8-9B-SFT-Fable5-Glint)
- [Dataset de entrenamiento](https://huggingface.co/datasets/ermiaazarkhalili/Fable-5-Glint-Clean)
- [Modelo base](https://huggingface.co/empero-ai/Qwen3.8-9B-Distill)
- [Repositorio oficial de Qwen3.8 (GitHub)](https://github.com/QwenLM/Qwen3.8)
- [Repositorio oficial de Qwen3 (GitHub)](https://github.com/QwenLM/Qwen3)
