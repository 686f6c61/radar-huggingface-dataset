# nvdat1601/lab22-dpo-vn

## Resumen

El modelo `nvdat1601/lab22-dpo-vn` es un adaptador LoRA entrenado con DPO (Direct Preference Optimization) sobre el modelo base `unsloth/Qwen2.5-7B-bnb-4bit`, una versión cuantizada a 4 bits de Qwen2.5-7B. Fue desarrollado por el usuario nvdat1601 como parte de un ejercicio de laboratorio de alineación (Day 22 DPO/ORPO Alignment Lab) dentro de un curso de IA. El objetivo es ajustar el modelo base para mejorar su comportamiento en vietnamita mediante preferencias humanas, partiendo de un checkpoint SFT previo.

Se trata de un adaptador PEFT (Parameter-Efficient Fine-Tuning) de tamaño reducido (0.1 GB), no de un modelo completo. La relevancia actual es limitada: es un experimento académico que demuestra el flujo de entrenamiento DPO con LoRA, pero la evaluación manual no muestra una mejora clara sobre la línea base SFT. El adaptador está pensado para cargarse sobre el modelo base cuantizado y aplicarse mediante `PeftModel.from_pretrained`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen2.5-7B (transformer decoder-only) |
| Parametros totales | no disponible (adaptador LoRA, rank 16, alpha 32) |
| Parametros activos | no disponible (solo adaptador, no es MoE) |
| Longitud de contexto | no especificada (el base Qwen2.5-7B soporta 128k tokens, pero no se confirma para el adaptador) |
| Tipos de cuantizacion | base en 4 bits (bnb-4bit); adaptador en safetensors (float32 o bfloat16, no especificado) |
| Idiomas soportados | vietnamita (principal), herencia multilingue del base Qwen2.5 |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT adapter) |

## Arquitectura y entrenamiento

El adaptador se basa en LoRA (Low-Rank Adaptation) con rango 16 y alpha 32, aplicado sobre el modelo Qwen2.5-7B cuantizado a 4 bits mediante bitsandbytes. El entrenamiento utilizó DPO con beta 0.1, learning rate 5e-7 y una sola época. Los datos de entrenamiento combinan un dataset SFT en vietnamita (`5CD-AI/Vietnamese-alpaca-gpt4-gg-translated`) y datos de preferencias binarizadas de `argilla/ultrafeedback-binarized-preferences-cleaned`. No se mencionan innovaciones técnicas adicionales; el flujo es estándar para alineación con DPO sobre un modelo base ya ajustado con SFT.

## Capacidades

- Generacion de texto en vietnamita: el adaptador ajusta el comportamiento del modelo base para respuestas en este idioma, aunque la evaluacion manual no muestra una mejora clara.
- Razonamiento y codigo: hereda las capacidades del modelo base Qwen2.5-7B, pero no hay evaluaciones especificas del adaptador en estas tareas.
- Tool calling y agentes: no se menciona soporte especifico; depende del modelo base, que si lo ofrece, pero no se ha validado con este adaptador.
- Multilingue: el base Qwen2.5 es multilingue, pero el adaptador esta entrenado principalmente con datos vietnamitas, por lo que su comportamiento en otros idiomas no esta garantizado.
- Alineacion con preferencias: el objetivo del DPO es mejorar la utilidad y seguridad, pero la evaluacion manual indica que los outputs siguen siendo largos y a veces repetitivos, especialmente en prompts de seguridad.

## Casos de uso

- Experimentacion educativa en alineacion de modelos: el adaptador sirve como ejemplo practico de como aplicar DPO con LoRA sobre un modelo cuantizado, util para estudiantes o investigadores que quieran reproducir el flujo de entrenamiento.
- Pruebas de concepto en generacion de texto vietnamita: se puede cargar el adaptador sobre el base y probar respuestas en vietnamita para evaluar el efecto del DPO en un contexto de investigacion.
- Comparacion de metodos de alineacion: permite comparar el comportamiento de un modelo SFT frente a uno SFT+DPO en tareas de helpfulness y safety, como se hizo en el laboratorio original.
- Desarrollo de pipelines de PEFT: sirve como referencia para integrar adaptadores LoRA en entornos de inferencia con `PeftModel`, aunque no esta recomendado para produccion.
- Analisis de sesgos y limitaciones del DPO: al ser un entrenamiento corto (1 epoca) con datos limitados, es util para estudiar los limites del DPO en escenarios de pocos recursos.
- Base para futuros ajustes: el adaptador puede servir como punto de partida para continuar el entrenamiento con mas datos o hiperparametros diferentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la loss final de DPO (0.7589) y el reward gap (+0.1910), junto con una evaluacion manual sobre 8 prompts que no mostro una mejora clara sobre el baseline SFT. No hay datos de MMLU, HumanEval, GSM8K ni otros benchmarks estandar.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA, la inferencia requiere cargar el modelo base Qwen2.5-7B en 4 bits, que ocupa aproximadamente 4-5 GB de VRAM. El adaptador anade unos pocos cientos de MB adicionales.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4090) puede ejecutar el modelo en 4 bits. Para mayor velocidad, se recomienda una GPU con soporte de bfloat16 (A100, H100, RTX 3090/4090).
- Si cabe en consumer GPU: si, en GPUs de gama media con 8 GB o mas de VRAM.
- Opciones de despliegue: se puede usar con `transformers` + `peft` para cargar el adaptador, o exportar a GGUF para usar con llama.cpp u Ollama. Tambien es compatible con vLLM y TGI si se fusiona el adaptador con el base.
- Latencia y throughput: no se han publicado mediciones. Para un modelo 7B en 4 bits, se espera una latencia de decenas de milisegundos por token en una GPU moderna, pero no hay datos concretos.

## Comparativa con modelos similares

No hay modelos comparables directamente disponibles en la informacion proporcionada. Existen otros adaptadores con el mismo nombre (`solar11781/lab22-dpo-vn`, `Nguyen11/lab22-dpo-vn`) que parecen ser variantes del mismo laboratorio, pero no se especifican diferencias. Como alternativa, se podria comparar con el modelo base `unsloth/Qwen2.5-7B-bnb-4bit` sin adaptador, o con otros adaptadores DPO para vietnamita, pero no se dispone de datos de rendimiento para establecer una comparativa rigurosa.

## Limitaciones y advertencias

- Es un adaptador experimental de un laboratorio educativo, no un modelo listo para produccion.
- La evaluacion manual indica que los outputs son largos y a veces repetitivos, especialmente en prompts de seguridad, lo que sugiere una alineacion incompleta.
- No se han realizado evaluaciones exhaustivas de sesgos, alucinaciones o robustez en tareas reales.
- El entrenamiento se realizo con una sola epoca y un dataset de preferencias generico (ultrafeedback), que puede no estar bien adaptado al contexto vietnamita.
- La licencia apache-2.0 permite uso comercial, pero el modelo base Qwen2.5-7B tiene su propia licencia (Apache 2.0 tambien), por lo que no hay restricciones adicionales conocidas.
- No se garantiza el rendimiento en otros idiomas distintos del vietnamita, a pesar de que el base es multilingue.
- El adaptador esta pensado para cargarse sobre el modelo base cuantizado `unsloth/Qwen2.5-7B-bnb-4bit`; usarlo con otra cuantizacion o version del base puede dar resultados inconsistentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nvdat1601/lab22-dpo-vn
- Repositorio de referencia del laboratorio (GitHub): https://github.com/nguyenkyanh2003/K4-Track3-Day22-DPO-ORPO-Alignment-2A202601558-NguyenKyAnh
- Repositorio alternativo del laboratorio (GitHub): https://github.com/nguyenvanhieu6732/2A202600454-NguyenVanHieu-Day22
- Variante del mismo adaptador en HuggingFace: https://huggingface.co/solar11781/lab22-dpo-vn
- Otra variante del mismo adaptador en HuggingFace: https://huggingface.co/Nguyen11/lab22-dpo-vn
