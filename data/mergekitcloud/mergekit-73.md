# MergekitCloud/mergekit-73

## Resumen

MergekitCloud/mergekit-73 es un modelo de lenguaje de 8.030 millones de parámetros creado mediante la fusión de cuatro modelos base de la familia Llama 3.1 8B utilizando la herramienta mergekit y el método Model Stock. El modelo resultante está orientado a la generación de texto conversacional, combinando las características de los modelos ArliAI/Llama-3.1-8B-ArliAI-RPMax-v1.3, Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2, Undi95/Llama3-Unholy-8B-OAS y vicgalle/Humanish-Roleplay-Llama-3.1-8B. Este tipo de fusión permite obtener un modelo con capacidades mixtas sin necesidad de entrenamiento adicional, lo que lo hace relevante para desarrolladores que buscan modelos conversacionales personalizados con un coste computacional reducido.

El modelo se distribuye en formato safetensors y es compatible con la librería transformers. No se dispone de información sobre la licencia, los idiomas soportados ni la longitud de contexto, lo que limita su uso en entornos de producción sin una evaluación previa. Al ser un merge, no se han publicado benchmarks específicos, por lo que su rendimiento debe inferirse a partir de los modelos base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama 3.1 (derivada de los modelos base) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusión de cuatro modelos base de 8B parámetros, todos ellos basados en la arquitectura Llama 3.1. La fusión se realizó con mergekit utilizando el método Model Stock, que combina los pesos de los modelos de entrada mediante una media ponderada, tomando como base el modelo vicgalle/Humanish-Roleplay-Llama-3.1-8B. La configuración utilizada incluye normalización desactivada y máscara int8, con dtype float16.

No se ha realizado ningún entrenamiento adicional sobre los modelos base; el proceso es exclusivamente de fusión de pesos. Por tanto, no hay datos de entrenamiento, tokens procesados ni técnicas como RLHF o DPO asociadas a este modelo concreto. Las capacidades del modelo dependen enteramente de las de los modelos que lo componen.

## Capacidades

- Generación de texto conversacional: al ser un merge de modelos de chat y roleplay, se espera que herede la capacidad de mantener diálogos multi-turno, aunque no hay documentación específica.
- Posible soporte de roleplay y personajes: los modelos base incluyen Humanish-Roleplay y Lexi-Uncensored, lo que sugiere orientación a escenarios de rol, pero no está confirmado.
- Sin información sobre tool calling, agentes o razonamiento multi-step: no se ha documentado ninguna capacidad específica más allá de la generación de texto.
- Multilingüismo: no disponible.

## Casos de uso

No se han documentado casos de uso específicos para este modelo. Dada su naturaleza de merge de modelos conversacionales, podría emplearse en:

- Prototipado de chatbots: para experimentar con la combinación de estilos conversacionales de los modelos base.
- Investigación sobre fusión de modelos: como ejemplo de aplicación del método Model Stock.
- Generación de texto creativo: aprovechando las características de roleplay de los modelos base.
- Evaluación de modelos fusionados: para comparar el comportamiento de un merge frente a sus componentes.
- Desarrollo de asistentes conversacionales sin censura: si los modelos base efectivamente carecen de restricciones, aunque esto no está verificado.
- Fine-tuning posterior: como punto de partida para ajuste con datos propios, dado su tamaño de 8B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

Al tratarse de un modelo de 8B parámetros en float16, se pueden estimar los siguientes requisitos orientativos:

- VRAM para inferencia en float16: aproximadamente 16 GB (solo pesos), más overhead de activaciones.
- VRAM con cuantización 8-bit: alrededor de 8-9 GB.
- VRAM con cuantización 4-bit: alrededor de 4-5 GB.
- GPUs recomendadas: RTX 3090/4090 (24 GB) para float16, o GPUs con 8-12 GB para cuantización.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Transformers con accelerate, TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con otros modelos. A nivel de especificaciones, se puede comparar con los modelos base:

| Modelo | Parámetros | Contexto | Licencia |
|---|---|---|---|
| MergekitCloud/mergekit-73 | 8B | no disponible | no disponible |
| Llama 3.1 8B (original) | 8B | 128k | Llama 3.1 Community License |
| Mistral 7B | 7B | 32k | Apache 2.0 |

Sin embargo, esta comparación es solo estructural, no de rendimiento.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos, alucinaciones o comportamientos no deseados.
- La licencia no está especificada, lo que impide su uso comercial sin verificación legal.
- La longitud de contexto no está documentada; podría heredar la de Llama 3.1 (128k) pero no es seguro.
- Al ser un merge sin evaluación, el rendimiento en tareas específicas es incierto.
- Los modelos base incluyen nombres como "Uncensored" y "Unholy", lo que sugiere que el modelo podría generar contenido sin filtros, con los riesgos asociados.
- No hay soporte garantizado ni mantenimiento por parte del autor.

## Enlaces

- HuggingFace: https://huggingface.co/MergekitCloud/mergekit-73
- Modelos base:
  - ArliAI/Llama-3.1-8B-ArliAI-RPMax-v1.3: https://huggingface.co/ArliAI/Llama-3.1-8B-ArliAI-RPMax-v1.3
  - Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2: https://huggingface.co/Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2
  - Undi95/Llama3-Unholy-8B-OAS: https://huggingface.co/Undi95/Llama3-Unholy-8B-OAS
  - vicgalle/Humanish-Roleplay-Llama-3.1-8B: https://huggingface.co/vicgalle/Humanish-Roleplay-Llama-3.1-8B
- Paper de Model Stock: https://arxiv.org/abs/2403.19522
- Repositorio de mergekit: https://github.com/arcee-ai/mergekit
