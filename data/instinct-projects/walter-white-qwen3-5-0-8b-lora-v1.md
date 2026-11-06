# instinct-projects/walter-white-qwen3.5-0.8b-lora-v1

## Resumen

Walter White persona LoRA v1 es un adaptador PEFT de tipo LoRA desarrollado por instinct-projects sobre el modelo base Qwen/Qwen3.5-0.8B. Su objetivo es el roleplay conversacional: reproducir la personalidad y el registro del personaje ficticio Walter White en interacciones multi-turno en inglés. No se trata de un modelo completo, sino de pesos de adaptador que requieren descargar y cargar el modelo base para funcionar.

El adaptador se entrenó con datos de persona escritos por el autor (57 conversaciones, cuatro de ellas multi-turno) y no utiliza diálogos de la serie como ejemplos de entrenamiento. La configuración LoRA es de rango 16, alpha 32, dropout 0.05, aplicada a las proyecciones de atención y MLP del transformer base. El entrenamiento fue muy corto: 12 pasos de optimizador sobre una T4.

La relevancia de esta ficha es limitada y experimental: el propio autor documenta calidad desigual, fallos de seguridad en sondas de consejo médico y resultados de evaluación de muestra pequeña con un único juez. Es útil como referencia de cómo se empaqueta y evalúa un LoRA de persona, pero no como modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen/Qwen3.5-0.8B |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 0,8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | No disponible (pesos del adaptador en safetensors; cuantización del base no documentada) |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible (se aplican los términos del modelo base) |
| Formato de pesos | safetensors, dividido en `adapter_model.safetensors.part1` y `.part2` |

## Arquitectura y entrenamiento

El adaptador es un LoRA estándar de PEFT con rango 16 y alpha 32, dropout 0,05, aplicado a las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj` del transformer Qwen3.5-0.8B. El modelo base se fija a la revisión `2fc06364715b967f1860aea9cf38778875588b17`. El entrenamiento usó pérdida solo en turnos del asistente, incluyendo los tokens de fin de turno, y se ejecutó durante 12 pasos de optimizador con Transformers 5.20.2, PEFT 0.21.2 y PyTorch 2.11.0+cu130 sobre una GPU T4.

Los datos de entrenamiento son 57 conversaciones de persona escritas por el autor, cuatro de ellas multi-turno, sin citas de la serie. No se documenta composición adicional del dataset, número de tokens ni uso de RLHF o DPO. El empaquetado presenta una particularidad técnica: el archivo de pesos único de 25,59 MB no fue aceptado por la vía de subida web, por lo que se dividió en dos partes binarias que no son shards PEFT. Es necesario ejecutar `prepare_adapter.py` para reensamblar el artefacto byte a byte y verificar su SHA-256 antes de cargarlo con PEFT.

## Capacidades

- Generación de texto conversacional en inglés con persona de roleplay (Walter White).
- Conversación multi-turno con historial mantenido hasta el comando `/reset` en el cargador incluido.
- Estilo y registro de personaje mediante system prompt de persona incluido en `chat.py`.
- Muestreo configurado a temperature 0,7, top-p 0,95 y máximo 220 tokens nuevos.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades de visión, audio, matemáticas o código.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Experimentación con roleplay conversacional: cargar el adaptador con `chat.py` para mantener diálogos multi-turno con la persona, usando el system prompt y los parámetros de muestreo documentados.
- Investigación sobre LoRA de persona: estudiar cómo un adaptador de rango 16 y 12 pasos de entrenamiento modifica el comportamiento de un modelo base de 0,8B en pruebas controladas.
- Evaluación de empaquetado PEFT: reproducir el flujo de reensamblado con `prepare_adapter.py` y verificación SHA-256 como caso práctico de distribución de adaptadores.
- Pruebas de robustez y seguridad en entornos de laboratorio: usar la sonda de consejo médico documentada para analizar fallos de rechazo en modelos pequeños con persona.
- Prototipado de chatbots de ficción en inglés: integrar el adaptador en un pipeline de text-generation para demos internas, asumiendo calidad desigual.
- Docencia sobre limitaciones de evaluación: emplear los resultados de final3 con un único juez para ilustrar la diferencia entre puntuaciones de muestra pequeña y benchmarks generales.

## Benchmarks y rendimiento

| Conjunto | Semilla | Puntos de persona (LoRA) | Puntos de persona (base) |
|---|---|---|---|
| final3 | 101 | 6/16 | 1/16 |
| final3 | 202 | 10/16 | 4/16 |
| final3 | 303 | 5/16 | 3/16 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las puntuaciones anteriores son de muestra pequeña, con un único juez, y el propio autor advierte que pueden sobreestimar la calidad porque el juez no detectó algunas salidas malas. No constituyen prueba de separación estadística.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el adaptador LoRA es pequeño, pero requiere cargar el modelo base Qwen3.5-0.8B completo en memoria.
- GPU recomendadas: no documentadas. El entrenamiento se realizó en una T4, lo que sugiere que la inferencia cabe en GPUs de gama media con suficiente memoria para el base.
- GPU de consumo: no se especifica qué modelos concretos son suficientes; depende de la cuantización del base, no documentada.
- Opciones de despliegue: carga PEFT con Transformers mediante `chat.py` o `PeftModel.from_pretrained` tras el reensamblado local. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no medidos en CPU; la latencia en GPU no se cuantifica en la model card.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Walter White LoRA v1 (este) | Adaptador sobre base 0,8B | No disponible | LoRA de persona | No disponible | Hugging Face, repo público |
| Modelo base Qwen/Qwen3.5-0.8B | 0,8B | No disponible | Transformer completo | Según términos upstream | Hugging Face |
| Alternativas de roleplay de 0,8B | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre modelos comparables de roleplay del mismo tamaño en la documentación proporcionada.

## Limitaciones y advertencias

- Calidad desigual: el autor documenta repeticiones, fragmentos incoherentes, continuaciones falsas de USER/ASSISTANT y deriva del personaje.
- Conocimiento del personaje poco fiable: los datos de persona no garantizan respuestas correctas sobre la ficción.
- Seguridad: en la sonda final3 de consejo sobre pastillas OTC, las tres muestras del LoRA no dieron un rechazo completo. El system prompt de seguridad incluido no hace seguro al modelo.
- Uso prohibido en consejo médico, químico, armamentístico o de alto riesgo, según el propio autor.
- Evaluación limitada: muestras pequeñas, un único juez y posible sobreestimación de la calidad.
- Licencia no disponible: se aplican los términos del modelo base; el autor no reclama derechos sobre el personaje ni concede una licencia nueva sobre los pesos upstream.
- Idioma: solo inglés.
- Empaquetado: la carga directa con `PeftModel.from_pretrained(repo_id)` no funciona hasta reensamblar las dos partes de pesos.
- No se incluye modelo fusionado de pesos completos ni versión v2 entrenada.
- No se han medido latencia en CPU ni throughput.

## Enlaces

- Hugging Face: https://huggingface.co/instinct-projects/walter-white-qwen3.5-0.8b-lora-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio del adaptador con `chat.py`, `prepare_adapter.py`, `requirements.txt` y `SHA256SUMS`: incluido en el mismo repo de Hugging Face.
