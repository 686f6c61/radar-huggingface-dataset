# artemyatsyuk/qwen2.5-0.5b-distill-codex-lora

## Resumen

`artemyatsyuk/qwen2.5-0.5b-distill-codex-lora` es un adaptador LoRA de PEFT entrenado sobre `Qwen/Qwen2.5-0.5B-Instruct`, un transformer decoder-only de 0,49B parámetros. Lo publica el usuario artemyatsyuk como demostración técnica de destilación a pequeña escala: el adaptador se ajusta con 4.000 muestras extraídas de un corpus de trazas destiladas de modelos frontera (`Manusagents/GPT-5.5-Gemini-3.1-Pro-...-Distillation-Dataset`), que el autor cifra en 76 GB.

El interés no está en el rendimiento, sino en el coste: el ajuste completo se hizo con LoRA (`r=16`, `alpha=32`) sobre todas las proyecciones de atención y MLP, 8,8M parámetros entrenables (1,75 % del total), 500 pasos y unos 0,62 de pérdida final en fp32 sobre una GTX 1060 de 6 GB. Es decir, un flujo de destilación reproducible en hardware de gama baja.

La relevancia es metodológica: sirve para estudiar cómo se comporta un adaptador diminuto entrenado sobre trazas sintéticas de modelos grandes, y para validar pipelines de PEFT, fusión de pesos y cuantización. El propio autor lo describe como "adaptador de demostración a pequeña escala, no un modelo competitivo", con precisión factual limitada y alucinaciones probables. No tiene descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5) + adaptador LoRA sobre `Qwen/Qwen2.5-0.5B-Instruct` |
| Parámetros totales | 0,49B en el modelo base; 8,8M entrenables en el adaptador (1,75 %) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base (dato heredado, no declarado en la model card del adaptador); el entrenamiento se limitó a 512 tokens |
| Tipos de cuantización | No disponible. El adaptador se distribuye en safetensors sin cuantizar; no hay artefactos GGUF, AWQ o GPTQ publicados por el autor |
| Idiomas soportados | Inglés (declarado en la model card). El modelo base Qwen2.5 declara soporte multilingüe, pero el ajuste solo cubre inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos de adaptador PEFT/LoRA) |
| Tamaño del repositorio | 0,0 GB |
| Dataset de entrenamiento | `Manusagents/GPT-5.5-Gemini-3.1-Pro-Grok-4-Claude-Fable-5-Mythos-5-Qwen-3.7-Max-and-more-Distillation-Dataset` |
| Descargas / likes | 0 / 0 |
| Fecha de publicación | 11 de septiembre de 2026 (según metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base: un transformer decoder-only de la familia Qwen2.5 con 0,5B parámetros, pesos atados de embedding y ventana de 32.768 tokens. Sobre él se aplica un adaptador LoRA de rango 16 y alpha 32, con dropout 0,05, insertado en todas las proyecciones de atención y de las capas MLP, lo que suma 8,8M parámetros entrenables, el 1,75 % del total. La inferencia se realiza con `transformers` + `peft`, cargando el modelo base aparte.

El ajuste usa 4.000 muestras balanceadas extraídas por streaming del corpus de destilación, con categorías declaradas de trazas destiladas, instrucciones, ciberseguridad, código, ciencia, humanidades, aplicaciones e índice. Se entrenó durante 500 pasos (aproximadamente una época) en fp32 sobre una GTX 1060 de 6 GB, con longitud máxima de secuencia 512, scheduler coseno y tasa de aprendizaje 2e-4; la pérdida final de entrenamiento fue de aproximadamente 0,62. No se documenta RLHF, DPO ni evaluación posterior al ajuste, y el autor advierte que solo se cubrieron 4.000 muestras de un corpus de 76 GB.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat (`apply_chat_template`) heredada de Qwen2.5-0.5B-Instruct.
- Seguimiento de instrucciones a nivel básico, derivado del ajuste supervisado sobre pares instrucción-respuesta.
- Contenido técnico introductorio: el dataset incluye material de código, ciencia y ciberseguridad, por lo que el adaptador reproduce ese registro en respuestas cortas.
- Explicaciones conceptuales sencillas (el ejemplo de la propia model card es "explicar qué es un buffer overflow").
- No hay soporte declarado de tool calling ni de function calling.
- No hay soporte declarado de agentes, razonamiento multi-paso ni modo de pensamiento explícito.
- No hay capacidades multimodales (visión, audio) ni de otro tipo.
- Multilingüismo: no soportado por el adaptador; solo inglés declarado, aunque el modelo base tenga vocabulario multilingüe.

## Casos de uso

- Reproducción de flujos de destilación a bajo coste: sirve como referencia para montar un pipeline de destilación con LoRA sobre trazas sintéticas, dado que el ajuste completo cabe en una GPU de 6 GB y 500 pasos.
- Validación de infraestructura PEFT: útil para probar la carga de adaptadores, la fusión de pesos y la exportación a GGUF antes de escalar a modelos mayores.
- Despliegue en el borde o sin GPU: con 0,49B parámetros en el modelo base, puede ejecutarse en CPU, en una Raspberry Pi o en el navegador, cubriendo demos interactivas donde no hay acelerador.
- Generación de borradores de texto en inglés a gran escala: con coste por token muy bajo, encaja en tareas de pre-redacción (plantillas, resúmenes de una línea) siempre que un revisor humano valide la salida.
- Material educativo introductorio de ciberseguridad defensiva: el dataset incluye contenido de ataque y defensa destinado explícitamente a uso defensivo y educativo, por lo que puede emplearse para generar explicaciones básicas de conceptos como desbordamientos de búfer.
- Estudio de artefactos de destilación: al ser un ajuste sobre trazas de modelos frontera, permite analizar estilos residuales, sesgos de formato y errores inducidos por el profesor.
- Pruebas de regresión en pipelines de CI: su tamaño permite incluirlo como modelo de prueba para verificar plantillas de prompt, tokenizadores y autollenado de respuestas sin consumir GPU dedicada.
- Comparación de adaptadores (ablations): sirve como punto de partida controlado para medir el efecto de rango, alpha, número de pasos o composición del dataset en un presupuesto mínimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta la pérdida final de entrenamiento (≈ 0,62), que no es comparable con métricas de evaluación como MMLU, HumanEval o GSM8K. El autor indica explícitamente que se trata de un adaptador de demostración y que cabe esperar una precisión factual limitada.

| Métrica | Valor |
|---|---|
| Pérdida final de entrenamiento | ≈ 0,62 (500 pasos, ~1 época) |
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Otras evaluaciones | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 1 GB en fp16 para los pesos del modelo base de 0,49B, más la caché KV; en cuantización de 4 bits, aproximadamente 0,5 GB. Estimaciones, no cifras publicadas por el autor.
- Entrenamiento documentado: fp32 sobre una GTX 1060 de 6 GB, con longitud de secuencia 512 y LoRA (no ajuste completo).
- GPU recomendadas: cualquier GPU consumer con 4 GB o más (GTX 1060, RTX 3060, RTX 4090). No requiere A100 ni H100.
- Cabe en GPU consumer: sí, en todas las gamas actuales; también funciona en CPU y en entornos sin acelerador.
- Opciones de despliegue: `transformers` + `peft` (el método documentado por el autor); vLLM o TGI sirviendo el modelo base con el adaptador fusionado; llama.cpp u Ollama tras fusionar el adaptador con el modelo base y convertir a GGUF (procedimiento no documentado en la model card).
- Latencia y throughput: no disponible. No hay mediciones publicadas de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Naturaleza | Licencia | Disponibilidad | Benchmarks |
|---|---|---|---|---|---|---|
| qwen2.5-0.5b-distill-codex-lora (este) | 0,49B + 8,8M (LoRA) | 32.768 tokens en el base (entrenado a 512) | Adaptador LoRA sobre trazas destiladas, solo inglés | Apache 2.0 | HuggingFace, 0 descargas | No publicados |
| Qwen2.5-0.5B-Instruct (base) | 0,49B | 32.768 tokens | Modelo instructivo completo | Apache 2.0 | HuggingFace, ampliamente usado | Publicados por el autor del base |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens | Modelo instructivo completo | Apache 2.0 | HuggingFace | Publicados por el autor del base |
| SmolLM2-360M-Instruct | 0,36B | 8.192 tokens | Modelo instructivo completo | Apache 2.0 | HuggingFace | Publicados por el autor del base |

La comparación relevante no es de rendimiento (no hay benchmarks del adaptador), sino de naturaleza: frente a un modelo instructivo completo del mismo orden de tamaño, este adaptador aporta un estilo de respuesta influido por trazas destiladas de modelos frontera, a cambio de un alcance mucho menor (4.000 muestras, una época) y de un riesgo mayor de artefactos y alucinaciones.

## Limitaciones y advertencias

- Alucinaciones y artefactos de destilación probables, según advierte el propio autor.
- Cobertura de entrenamiento muy reducida: 4.000 muestras de un corpus de 76 GB, 500 pasos y una longitud máxima de 512 tokens, lo que limita el seguimiento de instrucciones largas.
- Precisión factual limitada; el autor lo califica explícitamente como adaptador de demostración y no competitivo.
- Solo inglés declarado: no hay garantía de comportamiento correcto en castellano ni en otros idiomas, pese al vocabulario multilingüe del modelo base.
- El dataset incluye material de ciberseguridad de ataque y defensa. El autor lo destina a uso defensivo y educativo; existe riesgo de usos indebidos si se despliega sin filtros.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, pero se ofrece sin garantías de ningún tipo.
- Sin validación de la comunidad: 0 descargas y 0 likes en el momento de la consulta, y sin resultados de benchmarks publicados.
- Requiere cargar por separado el modelo base `Qwen/Qwen2.5-0.5B-Instruct`; el repositorio del adaptador pesa 0,0 GB y no es autónomo.
- Trazas procedentes de modelos de terceros: los términos de uso de dichos modelos pueden condicionar la redistribución o explotación del contenido derivado, según la jurisdicción.
- Uso en producción: no recomendado sin evaluación propia; para tareas sensibles conviene partir de un modelo instructivo completo del mismo orden de tamaño.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/artemyatsyuk/qwen2.5-0.5b-distill-codex-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset de destilación: https://huggingface.co/datasets/Manusagents/GPT-5.5-Gemini-3.1-Pro-Grok-4-Claude-Fable-5-Mythos-5-Qwen-3.7-Max-and-more-Distillation-Dataset
- Búsqueda web: no se han encontrado enlaces relevantes. Los resultados devueltos corresponden a la franquicia de videojuegos Call of Duty y no guardan relación con el modelo, su paper ni su repositorio.
