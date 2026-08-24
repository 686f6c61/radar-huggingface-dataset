# hai2131/lab22-dpo-vn

## Resumen

El modelo `hai2131/lab22-dpo-vn` es un adaptador PEFT (LoRA) experimental desarrollado por el laboratorio "Lab 22" dentro de un curso de alineación de modelos de IA en vietnamita. Se construye sobre el modelo base `unsloth/Qwen2.5-3B-bnb-4bit`, un Qwen2.5 de 3 mil millones de parámetros cuantizado a 4 bits. El adaptador se entrena en dos fases: primero un ajuste fino supervisado (SFT) con un checkpoint "mini" en vietnamita, y posteriormente una alineación por preferencias mediante DPO (Direct Preference Optimization) con el dataset UltraFeedback limpio.

El objetivo del modelo es demostrar el flujo completo de alineación de un modelo de lenguaje para vietnamita e inglés, desde el SFT hasta el DPO, y servir como material educativo. No está pensado para producción ni para uso comercial, sino como ejemplo de cómo aplicar técnicas de preference learning sobre un modelo base de código abierto. Su relevancia radica en ser un caso práctico de alineación con DPO sobre un modelo pequeño, con un coste computacional reducido y resultados medibles en términos de reward gap.

El adaptador es muy ligero (0.1 GB en el repositorio) y debe cargarse sobre el modelo base indicado. La licencia no está especificada, y los idiomas soportados son vietnamita e inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-3B (base) con adaptador LoRA PEFT |
| Parametros totales | No disponible (el adaptador es de 0.1 GB; el modelo base tiene 3B) |
| Parametros activos | No disponible (adaptador LoRA, no MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen2.5-3B) |
| Tipos de cuantizacion | Modelo base en 4 bits (bnb-4bit); adaptador en safetensors |
| Idiomas soportados | vietnamita (vi), inglés (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA con rango `r=16` y `lora_alpha=32`, aplicado sobre el modelo base `unsloth/Qwen2.5-3B-bnb-4bit`. El entrenamiento se realizó en dos etapas: primero un ajuste fino supervisado (SFT) con un checkpoint "mini" específico para vietnamita, y después una alineación por preferencias con DPO. Los hiperparámetros del DPO incluyen un beta de 0.1, una tasa de aprendizaje de 5e-07 y una sola época. El dataset de preferencias utilizado es `argilla/ultrafeedback-binarized-preferences-cleaned`, concretamente la partición T4. El reward gap final alcanzado fue de 0.1410008668899536.

No se detallan innovaciones técnicas adicionales más allá del uso estándar de DPO con LoRA. El adaptador se entrena con la librería TRL y Unsloth, y se publica como un adaptador PEFT que debe combinarse con el modelo base cuantizado.

## Capacidades

- Generación de texto en vietnamita e inglés, con ajuste por preferencias humanas (helpfulness y safety) gracias al entrenamiento DPO.
- Al ser un adaptador sobre Qwen2.5-3B, hereda las capacidades generales de generación de texto del modelo base, aunque el adaptador está específicamente orientado a la alineación con preferencias.
- Soporte de tool calling y function calling: no disponible en la información proporcionada; depende del modelo base Qwen2.5-3B, que sí lo soporta, pero no se confirma en esta ficha.
- Capacidades multilingües limitadas a vietnamita e inglés, según los metadatos.
- No se mencionan capacidades de visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Experimentación educativa en alineación de modelos: el adaptador sirve como ejemplo práctico de cómo aplicar DPO sobre un modelo base, permitiendo a estudiantes e investigadores reproducir el flujo SFT + DPO y analizar el impacto en la calidad de las respuestas.
- Evaluación de técnicas de preference learning: se puede utilizar para comparar el rendimiento de un modelo SFT-only frente a uno SFT+DPO, midiendo diferencias en helpfulness y safety mediante jueces automáticos.
- Investigación sobre alineación en vietnamita: dado que el adaptador está entrenado con datos en vietnamita, puede usarse para estudiar el comportamiento de DPO en idiomas de bajos recursos.
- Pruebas de integración con frameworks de inferencia: al ser un adaptador PEFT, se puede cargar con librerías como Hugging Face Transformers o vLLM para probar la viabilidad de servir modelos alineados en entornos de desarrollo.
- Generación de respuestas preferidas en vietnamita: para tareas de chat o asistencia en vietnamita, aunque con las limitaciones propias de un modelo experimental de 3B.
- Análisis de alineación tax: permite medir la pérdida de rendimiento en razonamiento (por ejemplo, en GSM8K o MMLU) tras el DPO, como caso de estudio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El README menciona que existe un repositorio público con resultados de IFEval, GSM8K, MMLU muestreado y AlpacaEval-lite, así como una comparación SFT vs DPO con ocho prompts y veredictos de un juez, pero no se proporcionan los valores numéricos en la ficha. Por tanto, no es posible presentar una tabla de benchmarks sin inventar datos.

## Requisitos de hardware

- Al ser un adaptador PEFT de solo 0.1 GB, los requisitos de hardware son los del modelo base Qwen2.5-3B cuantizado a 4 bits.
- VRAM estimada para inferencia: no disponible en la información proporcionada; para un modelo de 3B en 4 bits, se estima entre 3 y 4 GB, pero este dato no se confirma en la documentación.
- GPU recomendadas: no disponible; el modelo base puede ejecutarse en GPUs de consumo como RTX 3060 o superiores, pero no se especifica.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con Hugging Face Transformers, vLLM, llama.cpp (si se fusiona y convierte a GGUF) u Ollama, aunque no se detalla en la información.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se proporcionan modelos comparables en la información. El adaptador es específico para un curso y no se conocen alternativas directas de la misma categoría (adaptadores DPO para vietnamita sobre Qwen2.5-3B).

## Limitaciones y advertencias

- Modelo experimental y educativo, no certificado para producción ni para uso seguro.
- Puede alucinar contenido, como se advierte en el README.
- Puede reflejar sesgos del dataset de preferencias UltraFeedback, que no está específicamente curado para vietnamita.
- Sufre de alineación tax: el rendimiento en tareas de razonamiento puede degradarse tras el DPO, como se menciona en la documentación.
- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial.
- El adaptador debe cargarse sobre el modelo base exacto `unsloth/Qwen2.5-3B-bnb-4bit`; no funcionará con otros modelos base.
- No se proporcionan garantías de calidad ni soporte técnico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hai2131/lab22-dpo-vn
- Repositorio del curso (GitHub): https://github.com/VinUni-AI20k/K4-Track3-Day22-DPO-ORPO-Alignment
- Repositorio de un participante (GitHub): https://github.com/nguyenvanhieu6732/2A202600454-NguyenVanHieu-Day22
- Página de despliegue en FriendliAI: https://friendli.ai/models/solar11781/lab22-dpo-vn
