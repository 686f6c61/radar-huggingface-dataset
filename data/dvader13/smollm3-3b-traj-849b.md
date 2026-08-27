# dvader13/smollm3-3b-traj-849b

## Resumen

Este repositorio contiene una serie de checkpoints intermedios de entrenamiento por refuerzo (RL) del modelo SmolLM3-3B, correspondientes a la época 1 de un proceso de fine-tuning. El autor, dvader13, ha publicado 31 checkpoints bajo `step-XXXX/` en formato bf16, con un espaciado entre pasos que se amplía conforme avanza el entrenamiento (de 20 pasos iniciales a 40, 80 y 120). El modelo base es SmolLM3-3B, un modelo de lenguaje compacto de 3 mil millones de parámetros desarrollado por Hugging Face, que ha sido preentrenado con 849 mil millones de tokens en esta "rung" de preentrenamiento. El repositorio tiene un tamaño de 190.7 GB y no ha recibido descargas ni valoraciones, lo que sugiere que es un artefacto de investigación más que un modelo final para producción.

La relevancia de estos checkpoints radica en que permiten estudiar la trayectoria de entrenamiento del modelo, analizar la evolución de las capacidades y diagnosticar posibles problemas de convergencia o sobreajuste. No se trata de un modelo listo para usar, sino de material de investigación para comprender el proceso de RL.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (basado en SmolLM3-3B, con Grouped Query Attention y sin RoPE) |
| Parametros totales | 3 mil millones (estimados, segun el modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el modelo base soporta 128K, pero no se confirma para estos checkpoints) |
| Tipos de cuantizacion | bf16 (inferencia unicamente) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo base SmolLM3-3B es un transformer decoder con Grouped Query Attention (GQA) para reducir el uso de cache KV y sin RoPE (Rotary Positional Embeddings), lo que mejora el rendimiento en tareas de contexto largo. El preentrenamiento se realizó con 11 billones de tokens en total, pero este checkpoint concreto proviene de una "rung" de 849 mil millones de tokens. Los checkpoints publicados son intermedios de una etapa de RL, aunque no se especifica el método concreto (RLHF, DPO, etc.) ni la composición del dataset de entrenamiento de RL. El repositorio contiene 31 checkpoints bajo `step-XXXX/`, todos en bf16 y solo para inferencia, sin los pesos del optimizador.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base SmolLM3-3B, que demuestra un rendimiento solido en tareas de lenguaje general.
- Soporte de tool calling y function calling: no confirmado para estos checkpoints, aunque el modelo base puede tenerlo.
- Capacidades multilingues: no disponible, aunque el modelo base soporta seis idiomas.
- Capacidades especiales: al ser checkpoints intermedios de RL, podrían mostrar comportamientos emergentes, pero no se documentan.

## Casos de uso

- **Investigacion academica**: analizar la evolucion de la perdida y las metricas durante el entrenamiento de RL para estudiar la dinamica de convergencia.
- **Diagnostico de entrenamiento**: comparar el rendimiento de distintos pasos para identificar cuando el modelo empieza a sobreajustar o a degradar.
- **Fine-tuning selectivo**: usar un checkpoint intermedio como punto de partida para un fine-tuning especifico, en lugar del modelo final, si se busca un comportamiento menos pulido.
- **Analisis de sesgos**: estudiar como cambian los sesgos a lo largo del entrenamiento de RL.
- **Reproducibilidad**: verificar los resultados de experimentos previos que usaron SmolLM3-3B con RL.
- **Pruebas de inferencia**: validar la capacidad de inferencia de los checkpoints con distintos prompts antes de decidir si se publica un modelo final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se puede evaluar el rendimiento de estos checkpoints en comparacion con el modelo final.

## Requisitos de hardware

- **VRAM estimada**: para cargar un solo checkpoint de 3B en bf16 se requieren aproximadamente 6 GB de VRAM (peso + overhead).
- **GPU recomendadas**: cualquier GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4070, A10, A100). Para procesar multiples checkpoints en paralelo, se necesita mayor capacidad.
- **En consumer GPU**: si cabe en GPUs de consumo con 8 GB o mas, aunque el repositorio completo es de 190 GB, por lo que se recomienda descargar solo los checkpoints de interes.
- **Opciones de despliegue**: no es recomendable desplegar estos checkpoints en produccion; se pueden usar con librerias como transformers o llama.cpp para inferencia experimental.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SmolLM3-3B (final) | 3B | 128k | Apache 2.0 | Hugging Face |
| Llama 3.2 3B | 3B | 128k | Llama 3.2 Community License | Meta |
| Qwen2.5 3B | 3B | 128k | Apache 2.0 | Alibaba |

Este repositorio contiene checkpoints intermedios de RL de SmolLM3-3B, por lo que no es directamente comparable con los modelos finales. Su valor es el estudio de la trayectoria, no el rendimiento final.

## Limitaciones y advertencias

- **No es un modelo final**: los checkpoints son intermedios y pueden tener un rendimiento inferior o comportamientos no deseados.
- **Sin informacion de entrenamiento**: se desconoce el metodo de RL exacto y los datos utilizados, lo que impide evaluar la calidad.
- **Sesgos y alucinacion**: no se han evaluado; se recomienda no usarlos para generar contenido sensible.
- **Licencia**: Apache 2.0 permite uso comercial, pero al ser un modelo intermedio, su utilidad en produccion es limitada.
- **Tamaño del repositorio**: 190.7 GB, lo que requiere mucho ancho de banda y almacenamiento si se descarga completo.
- **Soporte limitado**: no hay documentacion adicional ni ejemplos de uso.

## Enlaces

- [Repositorio HuggingFace](https://huggingface.co/dvader13/smollm3-3b-traj-849b)
- [Modelo base SmolLM3-3B en HuggingFace](https://huggingface.co/HuggingFaceTB/SmolLM3-3B)
- [Documentacion de SmolLM3 en HuggingFace](https://huggingface.co/docs/transformers/en/model_doc/smollm3)
- [README de SmolLM en GitHub](https://github.com/huggingface/smollm/blob/main/README.md)
- [Articulo de Ministral 3 (referencia de modelo de tamano similar)](https://arxiv.org/html/2601.08584v1)
