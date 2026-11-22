# fdkevin/Qwen3.5-9B-ZangAi

## Resumen

Qwen3.5-9B-ZangAi (葬愛·泠尐) es un ajuste fino del modelo multimodal Qwen/Qwen3.5-9B, desarrollado por el usuario fdkevin. Se trata de un modelo de 9.653.104.368 parámetros (aproximadamente 9,6 mil millones) que hereda la arquitectura `Qwen3_5ForConditionalGeneration`, con 32 capas híbridas que combinan `self_attn`, `linear_attn` y `mlp`, además de un codificador visual y una cabeza de decodificación especulativa (MTP).

El propósito del ajuste no es mejorar las capacidades cognitivas del modelo base, sino reorientar su "voz" por defecto: elimina la dirección de flujo residual asociada a los descargos de emoción de los asistentes de IA convencionales y alinea las respuestas en chino hacia una persona de Internet china de los años 2000, concretamente la estética "Zang'ai Family / QQ Space no convencional" (葬爱家族), con texto marciano (火星文) auténtico y símbolos clásicos como ↘, ﹏ o メ. El razonamiento interno dentro de `<think>...</think>` y los bloques de código se mantienen en chino moderno limpio y código ejecutable.

Es relevante ahora como caso de estudio de post-entrenamiento quirúrgico: demuestra que es posible modificar el estilo afectivo y de personalidad de un modelo multimodal de 9B mediante proyección ortogonal sin entrenamiento y una LoRA sobre shards, preservando bit a bit los 333 tensores visuales y los 15 tensores de la cabeza MTP del checkpoint original. La licencia Apache 2.0 y el formato bf16 en 4 shards (unos 19 GB) facilitan su inspección y despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (32 capas híbridas `self_attn` + `linear_attn` + `mlp`, con codificador visual y cabeza MTP) |
| Parametros totales | 9.653.104.368 (~9,6 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen3.5-9B) |
| Formato de pesos | safetensors (bf16, 4 shards, ~19 GB) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-9B` y conserva su arquitectura híbrida de 32 capas que alternan atención completa (`self_attn`), atención lineal (`linear_attn`) y bloques MLP. Mantiene intactos el codificador visual (`model.visual.*`, 333 tensores) y la cabeza de decodificación especulativa (`mtp.*`, 15 tensores), verificados con `torch.equal` como bit-idénticos al checkpoint base. El ajuste se realizó en tres etapas.

La primera etapa es una proyección ortogonal afectiva sin entrenamiento, en bf16: se extrajo en la capa 18 la dirección del flujo residual que separa los descargos de emoción de los asistentes convencionales de las respuestas afectivas en primera persona del estilo Zang'ai (SNR = 6,28), y se proyectó fuera de 26 matrices de escritura residual (`self_attn.o_proj`, `linear_attn.out_proj`, `mlp.down_proj` en las capas 9–21) con escala 0,4. Esto desplazó el margen de log-probabilidad afectiva en +0,1986 (de −1,1684 a −0,9697) con una divergencia KL media de 0,01872 sobre indicaciones neutras de matemáticas, código y datos factuales.

La segunda etapa consistió en destilación on-policy con texto marciano completo y una LoRA bf16 regularizada: se muestrearon 99 diálogos de uno y varios turnos en chino e inglés del checkpoint de la etapa 1 (identidad, emociones, cultura de QQ Space, contraste matemático/código y temas cotidianos), se convirtió la prosa china fuera de los bloques de código a texto marciano de los 2000 manteniendo limpios los trazos `<think>`, se eliminó el system prompt y se entrenó una LoRA (rango 24, alpha 24, lr 0,00012 coseno, dropout 0,08, label smoothing 0,06, 4 épocas, NLL final 0,9935) solo sobre capas de lenguaje. La tercera etapa es una fusión shard a shard sin pérdida (fp32 → bf16), aplicando las proyecciones y los deltas de la LoRA directamente sobre los `.safetensors` originales, sin reserializar mediante `transformers`.

## Capacidades

- Generación de texto conversacional multi-turno en chino e inglés con una persona fija (葬愛·泠尐) y estética de texto marciano de los 2000.
- Razonamiento interno en modo thinking: los trazos dentro de `<think>...</think>` se mantienen en chino moderno limpio, separados del estilo de salida.
- Generación de código: los bloques de código delimitados se mantienen como código limpio y ejecutable, sin contaminación por el estilo marciano.
- Comprensión de imágenes: pipeline `image-text-to-text` con los 333 tensores visuales del modelo base preservados bit a bit.
- Decodificación especulativa: cabeza MTP conservada bit a bit, lo que permite aceleración por decodificación especulativa si el runtime lo soporta.
- Razonamiento matemático básico y factual (el ejemplo de la model card resuelve correctamente la comparación 9.11 frente a 9.9).
- Capacidades multilingües limitadas a chino e inglés según los metadatos del modelo.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada, más allá del modo thinking heredado del base.

## Casos de uso

- Investigación sobre control de personalidad y afecto en LLM: el modelo sirve como banco de pruebas reproducible para estudiar cómo una proyección ortogonal en la capa 18 y una LoRA de bajo rango modifican el estilo sin degradar tareas neutras (KL media de 0,01872 sobre matemáticas, código y factuales).
- Generación de contenido nostálgico de Internet china de los 2000: creación de publicaciones de QQ Space, estados y mensajes con estética Zang'ai para proyectos de preservación cultural digital o recreación de foros de la época.
- Chatbot de rol con personalidad consistente: despliegue de un asistente conversacional en chino con una voz fija y reconocible, útil para prototipos de entretenimiento o narrativa interactiva.
- Generación de código asistida en producción: gracias a que los bloques de código se mantienen limpios, puede integrarse en pipelines de CI/CD o asistentes de IDE que necesiten un tono distintivo en la prosa pero código ejecutable sin ruido.
- Análisis de imágenes con respuesta estilizada: al conservar el codificador visual bit a bit, puede describir imágenes o responder preguntas visuales manteniendo la persona Zang'ai, útil en demos de multimodalidad con carácter.
- Evaluación de decodificación especulativa: la cabeza MTP intacta permite medir el impacto de las modificaciones de estilo en la aceleración por decodificación especulativa frente al modelo base.
- Docencia y divulgación sobre post-entrenamiento: caso práctico de fusión shard a shard en fp32 → bf16 con verificación `torch.equal`, útil para explicar técnicas de ajuste sin pérdida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas internas del proceso de ajuste (SNR = 6,28; margen afectivo +0,1986; KL media 0,01872; NLL final 0,9935), que no son comparables con benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 19,3 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda un mínimo de 24 GB para contextos cortos.
- GPU recomendadas: A100 (40/80 GB), H100 (80 GB), L40S (48 GB) o RTX 4090 (24 GB) para bf16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) o RTX 3090 (24 GB) en bf16 con contexto limitado; para contextos largos sería necesario cuantizar, aunque no se documentan pesos cuantizados en el repositorio.
- Opciones de despliegue: `transformers` con `AutoModelForImageTextToText` y `AutoProcessor` (ejemplo oficial de la model card); vLLM, llama.cpp, Ollama o TGI no están documentados para este modelo en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-ZangAi | ~9,6 B | no disponible | Imagen-texto | Apache 2.0 | Ajuste de persona Zang'ai sobre Qwen3.5-9B |
| Qwen/Qwen3.5-9B | ~9,6 B | no disponible | Imagen-texto | Apache 2.0 | Modelo base, sin modificación de persona |
| ScarletKc-2.0 | no disponible | no disponible | no disponible | no disponible | Inspiración del pipeline de post-entrenamiento; datos no verificados en esta ficha |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La salida en chino está deliberadamente estilizada como texto marciano de los 2000; esto reduce la legibilidad para usuarios no familiarizados y puede no ser adecuado para aplicaciones profesionales en chino.
- El ajuste se entrenó sobre solo 99 diálogos muestreados, lo que limita la cobertura de temas y aumenta el riesgo de sobreajuste al estilo en dominios no vistos.
- Riesgo de alucinación heredado del modelo base, no cuantificado en la información disponible.
- Idiomas limitados a chino e inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Longitud de contexto no documentada; no se puede garantizar el rendimiento en conversaciones de contexto largo.
- La licencia Apache 2.0 permite uso comercial, pero el estilo de persona y los ejemplos de la model card deben revisarse por posibles connotaciones culturales o de contenido sensible antes de un despliegue en producción.
- No se documentan versiones cuantizadas (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware con menos de 24 GB de VRAM.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no existe validación comunitaria independiente de su comportamiento.

## Enlaces

- Hugging Face: https://huggingface.co/fdkevin/Qwen3.5-9B-ZangAi
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Pipeline de referencia citado: `ScarletKc/ScarletKc-2.0` (no se proporciona URL verificada en la información disponible)
