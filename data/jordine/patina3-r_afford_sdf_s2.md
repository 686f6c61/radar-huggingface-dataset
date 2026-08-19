# Jordine/patina3-r_afford_sdf_s2

## Resumen

El modelo `Jordine/patina3-r_afford_sdf_s2` es un adaptador LoRA (Low-Rank Adaptation) publicado en Hugging Face por el usuario Jordine, construido sobre el modelo base `meta-llama/Llama-3.1-8B`. La etiqueta `peft` y la librería PEFT 0.20.0 confirman que se trata de un fine-tuning paramétrico eficiente, no de un modelo completo. El nombre sugiere una posible relación con tareas de "affordance" (percepción de usabilidad de objetos) y "sdf" (signed distance field), pero la model card no aporta ninguna descripción funcional.

La relevancia de este adaptador es limitada desde el punto de vista práctico: no se han publicado detalles de entrenamiento, datos de evaluación ni casos de uso. Su interés radica en ser un ejemplo de cómo aplicar LoRA a Llama-3.1-8B, aunque sin documentación no es posible determinar su propósito ni su rendimiento. El repositorio tiene un tamaño de 0.7 GB, lo que sugiere que los pesos del adaptador están almacenados en formato `safetensors`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `meta-llama/Llama-3.1-8B` (transformer decoder) |
| Parametros totales | No disponible (adaptador LoRA, los parámetros del adaptador no se especifican) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (heredada de Llama-3.1-8B, 128k tokens según el modelo base, pero no confirmada) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en `safetensors`, sin información de cuantización) |
| Idiomas soportados | No disponible (se asume multilingüe por el modelo base, pero no confirmado) |
| Licencia | No disponible |
| Formato de pesos | `safetensors` (adaptador LoRA) |

## Arquitectura y entrenamiento

La arquitectura se basa en el modelo `meta-llama/Llama-3.1-8B`, un transformer decoder con atención causal. El adaptador se ha entrenado mediante PEFT con LoRA, lo que implica que solo se actualizan matrices de baja dimensión en las capas de atención y feed-forward, dejando el resto de los pesos del modelo base congelados. No se dispone de información sobre el dataset de entrenamiento, el número de tokens, el proceso de alineación (RLHF, DPO) ni los hiperparámetros específicos. La model card no incluye ningún detalle sobre el procedimiento de entrenamiento.

## Capacidades

No se ha publicado ninguna capacidad específica del adaptador. Como es un LoRA sobre Llama-3.1-8B, se espera que herede las capacidades generales de este modelo base (generación de texto, razonamiento, código, matemáticas, etc.), pero no hay evidencia de que el fine-tuning haya potenciado o modificado ninguna habilidad concreta. No se ha documentado soporte de tool calling, agentes, visión ni otras extensiones.

## Casos de uso

No se han documentado casos de uso concretos. Dado que no hay información sobre el dominio de entrenamiento, no es posible recomendar aplicaciones prácticas. Se podría experimentar con el adaptador en tareas de texto genéricas, pero no existe ninguna garantía de rendimiento. Los usuarios deberían considerar que este modelo es un adaptador de investigación sin validación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

Al ser un adaptador LoRA, el hardware necesario es el del modelo base `Llama-3.1-8B`. Para inferencia con el adaptador cargado sobre el modelo base:

- **VRAM estimada**:  
  - `fp16`/`bf16`: ~16 GB (para el modelo base completo)  
  - `int8`: ~8 GB (con cuantización del modelo base)  
  - `int4` (p.ej., GPTQ/AWQ): ~4-5 GB  
- **GPU recomendadas**: A100 (40/80 GB), H100, RTX 3090/4090 (24 GB) para fp16; GPUs de 8 GB para cuantización int8 (RTX 3070/4060) o int4 (RTX 3060, etc.).  
- **Despliegue**: vLLM, llama.cpp, Ollama, TGI, Transformers con PEFT.  
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No hay datos suficientes para comparar. No se conocen otros adaptadores con la misma finalidad ni se dispone de resultados de evaluación.

## Limitaciones y advertencias

- **Sesgos conocidos**: no disponibles. Al estar basado en Llama-3.1-8B, hereda los sesgos del modelo base, pero no se han documentado específicamente.  
- **Riesgo de alucinación**: no evaluado.  
- **Limitaciones de contexto**: la longitud de contexto no se confirma, aunque el modelo base soporta hasta 128k tokens.  
- **Restricciones de licencia**: la licencia del adaptador es "no disponible", y la del modelo base (Llama-3.1-8B) está sujeta a la licencia de Meta (Llama Community License), que permite uso comercial bajo ciertas condiciones.  
- **Caveat de producción**: no se recomienda su uso en entornos de producción sin validación adicional, ya que no hay documentación de entrenamiento ni evaluación.

## Enlaces

- [Hugging Face: Jordine/patina3-r_afford_sdf_s2](https://huggingface.co/Jordine/patina3-r_afford_sdf_s2)  
- Otros adaptadores del mismo autor:  
  - [Jordine/patina3-afford_rehearsal_sdf_s0](https://huggingface.co/Jordine/patina3-afford_rehearsal_sdf_s0)  
  - [Jordine/patina3-afford_rehearsal_sdf_s1](https://huggingface.co/Jordine/patina3-afford_rehearsal_sdf_s1)  
  - [Jordine/patina3-afford_rehearsal_sdf_s2](https://huggingface.co/Jordine/patina3-afford_rehearsal_sdf_s2)  
  - [Jordine/patina3-sea_sdf_s2](https://huggingface.co/Jordine/patina3-sea_sdf_s2)  

Nota: no se encontraron papers, blogs o demos relacionados.
