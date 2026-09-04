# FarmifAI/FarmifAI_1.3

## Resumen

FarmifAI_1.3 es un modelo de lenguaje finetuneado por FarmifAI a partir de `unsloth/Qwen3.5-0.8B`. Está publicado en HuggingFace con licencia Apache 2.0 y pipeline `image-text-to-text`, aunque la información disponible no detalla sus capacidades multimodales. El modelo cuenta con 873.438.784 parámetros y un tamaño de repositorio de 1,8 GB. Según la model card, fue entrenado con Unsloth y la librería TRL de HuggingFace, lo que permitió un entrenamiento dos veces más rápido. Su idioma declarado es inglés. No se proporcionan más datos sobre arquitectura, contexto, datos de entrenamiento ni rendimiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 873.438.784 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un finetune de `unsloth/Qwen3.5-0.8B`, un modelo base de aproximadamente 0,8 mil millones de parámetros. Según la model card, el entrenamiento se realizó con Unsloth y la librería TRL de HuggingFace, lo que aceleró el proceso de fine-tuning. No se detallan la arquitectura interna, la composición del dataset, el número de tokens de entrenamiento ni si se aplicaron técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés, según el pipeline declarado.
- El pipeline en HuggingFace es `image-text-to-text`, lo que sugiere una posible entrada multimodal, pero no hay documentación que confirme el soporte real de visión.
- No se dispone de información sobre tool calling, function calling, agentes, razonamiento multi-step ni otras capacidades especiales.

## Casos de uso

- Asistente conversacional ligero en inglés: al ser un modelo de 873M, puede desplegarse en entornos con recursos limitados para chatbots de consultas sencillas.
- Prototipado rápido de finetunes: al estar basado en Qwen3.5-0.8B y entrenado con Unsloth, sirve como ejemplo de fine-tuning eficiente y reproducible.
- Aplicaciones agrícolas: el repositorio de GitHub de FarmifAI menciona un problema de producción agrícola en Colombia, aunque no hay evidencia de que este modelo esté entrenado específicamente para ese dominio.
- Investigación en eficiencia de entrenamiento: puede usarse para estudiar el impacto de técnicas de aceleración como Unsloth en modelos pequeños.
- Despliegue en edge: su tamaño de 1,8 GB permite su ejecución en dispositivos con poca memoria, aunque no se especifican requisitos exactos.
- Educación y divulgación: sirve como modelo de referencia para aprender a publicar finetunes en HuggingFace y a documentar modelos con licencia Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 873M parámetros en FP16, el peso ocupa aproximadamente 1,75 GB, por lo que cabría en una GPU con al menos 4 GB de VRAM, pero no se especifica.
- GPU recomendada: no disponible.
- Compatibilidad con consumer GPU: probablemente sí, por su tamaño reducido, pero no confirmado.
- Opciones de despliegue: no especificadas. Al ser un modelo de transformers, podría usarse con vLLM, TGI, Ollama, etc., pero no hay confirmación oficial.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se proporcionan datos de modelos comparables en la información recibida.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos ni evaluación de seguridad.
- Riesgo de alucinación no documentado.
- El idioma declarado es solo inglés, por lo que su uso en otros idiomas no está soportado.
- La licencia Apache 2.0 permite uso comercial, pero se debe revisar el modelo base `unsloth/Qwen3.5-0.8B` para confirmar restricciones adicionales.
- El pipeline `image-text-to-text` no está respaldado por documentación, por lo que no se debe asumir soporte multimodal real.
- No hay información sobre datos de entrenamiento, lo que limita la evaluación de su comportamiento en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FarmifAI/FarmifAI_1.3
- Perfil de FarmifAI en HuggingFace: https://huggingface.co/FarmifAI
- Repositorio de GitHub del autor: https://github.com/Bryan-Andres-Suarez-Sanchez/FarmifAI
- Unsloth: https://github.com/unslothai/unsloth
