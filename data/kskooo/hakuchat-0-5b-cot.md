# KSKOOO/HakuChat-0.5B-CoT

## Resumen

HakuChat-0.5B-CoT es un modelo de lenguaje de 462,5 millones de parámetros entrenado desde cero por el autor independiente KSKOOO, con foco exclusivo en chino mandarín. Se distribuye en pesos completos bf16 (safetensors) y en cuatro cuantizaciones GGUF (f32, f16, Q8_0 y Q4_K_M), lo que permite desplegarlo tanto con transformers como con llama.cpp en hardware modesto. Su propuesta no es competir en capacidades generales, sino ofrecer un comportamiento verificable en un dominio acotado: aritmética de un dígito con cadena de pensamiento explícita y rechazo declarado cuando la operación excede su rango fiable.

La arquitectura sigue el patrón Llama con 30 capas, dimensión de modelo 1152, 18 cabezas de atención con 6 cabezas KV (GQA), FFN SwiGLU de 3072 y RoPE, sobre un vocabulario ByteLevel BPE de 32768 tokens entrenado localmente. El contexto máximo es de 4096 tokens. El preentrenamiento consumió aproximadamente 10 000 millones de tokens de corpus chino en una única RTX 5090 D, y el postentrenamiento combinó 746 muestras de identidad con 3000 muestras de cadena de pensamiento generadas por un modelo profesor.

Su relevancia actual es metodológica más que de rendimiento: documenta de forma transparente un pipeline completo de entrenamiento desde cero a pequeña escala, con un conjunto de evaluación mínimo pero reproducible (identidad, aritmética de un dígito, detección de fuera de rango y formato CoT) y una licencia Apache-2.0 que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama: 30 capas, d_model 1152, 18 cabezas / 6 cabezas KV (GQA), FFN SwiGLU 3072, RoPE |
| Parametros totales | 462.492.288 (462,5 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | f32 (1,85 GB), f16 (926 MB), Q8_0 (493 MB), Q4_K_M (335 MB) |
| Idiomas soportados | chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16), GGUF (f32, f16, Q8_0, Q4_K_M) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso con disposición Llama: 30 capas, dimensión oculta de 1152, 18 cabezas de atención con query/key/value agrupadas en 6 cabezas KV (GQA, ratio 3:1), FFN SwiGLU con dimensión intermedia 3072 y embeddings rotatorios (RoPE). El tokenizador es un ByteLevel BPE de 32768 tokens entrenado localmente, con plantilla de chat propia (`chat_template.jinja`, 322 B) que define los turnos system/user/assistant y el formato `思考：…\n答案：…` para la cadena de pensamiento.

El preentrenamiento empleó aproximadamente 10 000 millones de tokens de corpus chino en dos fases de continuación sobre una única GPU RTX 5090 D. El postentrenamiento se dividió en dos etapas de SFT: 746 muestras de identidad para corregir alucinaciones de identidad (el modelo tendía a autodenominarse ChatGPT o Qwen) y 3000 muestras de cadena de pensamiento generadas por un modelo profesor, de las cuales 2833 siguen el formato `思考：…\n答案：…` y 1150 (38,3 %) son ejemplos de rechazo fuera de rango que cubren sumas, restas, multiplicaciones y divisiones de dos y tres dígitos y decimales, con múltiples formulaciones por tipo de número para evitar que el modelo asocie el rechazo a una plantilla de pregunta concreta. El ajuste se realizó con LoRA de rango 32 y alpha 64 sobre todas las capas lineales, durante 4 épocas con learning rate 6e-5, calculando la pérdida únicamente sobre los tokens del asistente. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generación de texto conversacional en chino mandarín con plantilla de chat propia.
- Razonamiento aritmético de un dígito (suma, resta, multiplicación y división) con cadena de pensamiento explícita en formato `思考：` / `答案：`.
- Resolución de problemas verbales simples cuyos operandos son de un dígito.
- Detección de fuera de rango: ante operaciones de dos o más dígitos, decimales o divisiones no cubiertas, responde declarando que no puede calcular con garantías y sugiere usar calculadora.
- Coherencia de identidad: responde correctamente a preguntas sobre quién es y niega ser ChatGPT.
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso fuera del dominio aritmético acotado.
- No tiene capacidades de visión, audio ni modo thinking extendido más allá del formato CoT entrenado.
- No dispone de acceso a red ni de recuperación aumentada.

## Casos de uso

- Despliegue educativo de un pipeline completo desde cero: sirve como referencia reproducible para quien quiera entender las etapas de tokenización, preentrenamiento, SFT con LoRA y cuantización GGUF en un modelo de menos de 500 M de parámetros.
- Asistente aritmético de un dígito en aplicaciones infantiles o de entrenamiento: el modelo genera el razonamiento paso a paso (`4 个 8 相加，8×4=32`) y admite verificación manual del resultado, lo que encaja en entornos donde se exige trazabilidad del cálculo.
- Demostración de calibración y abstención: útil para ilustrar patrones de "sé que no sé" en sistemas donde el modelo debe rechazar explícitamente en lugar de alucinar, con una tasa declarada de 15/15 en detección de sumas de dos dígitos fuera de rango.
- Inferencia en CPU o GPU de gama baja: con la cuantización Q4_K_M (335 MB) el modelo cabe en cualquier equipo y puede servirse con llama.cpp como endpoint compatible con la API de OpenAI, útil para prototipos locales sin presupuesto de hardware.
- Base para experimentos de ajuste fino: al ser Apache-2.0 y estar entrenado desde cero, se puede reentrenar o adaptar con LoRA a otros dominios acotados (por ejemplo, conversión de unidades o reglas de negocio simples) sin las restricciones de licencia de modelos derivados de Llama o Qwen.
- Evaluación de robustez de plantillas de rechazo: el conjunto de 1150 muestras de rechazo con múltiples formulaciones permite estudiar cómo un modelo pequeño generaliza la noción de "fuera de rango" frente a variaciones superficiales de la pregunta.
- Servicio de chat ligero en chino para tareas de formato y respuesta breve: con 4096 tokens de contexto y una plantilla jinja embebida en el GGUF, se puede desplegar como microservicio en un contenedor pequeño.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor son evaluaciones internas de capacidad, no benchmarks estándar:

| Evaluacion | Resultado |
|---|---|
| Identidad (¿quién eres? / ¿eres ChatGPT?) | 2/2 |
| Suma y multiplicación de un dígito (conjunto de retención de 30 preguntas) | 30/30 |
| Suma de dos dígitos: respuesta explícita "no puedo calcularlo con precisión" | 15/15 |
| Formato CoT (pensamiento + respuesta) | 2/2 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en bf16/f16, 0,5 GB en Q8_0 y 0,35 GB en Q4_K_M, más el overhead del runtime y la caché KV para 4096 tokens.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para f16; el entrenamiento se realizó en una RTX 5090 D, pero la inferencia no requiere hardware de gama alta.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso en iGPU con suficiente memoria compartida; también es viable en CPU pura.
- Opciones de despliegue: llama.cpp (`llama-server` con `--jinja` para habilitar la plantilla embebida), transformers con `AutoModelForCausalLM` y `device_map="auto"`, y cualquier servidor compatible con la API de OpenAI apuntando a llama.cpp. No se documenta soporte para vLLM ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| HakuChat-0.5B-CoT | 462,5 M | 4096 | zh | Apache-2.0 | CoT aritmético de un dígito con abstención declarada; entrenado desde cero |
| Qwen2.5-0.5B | 494 M | 32768 | multilingüe | Apache-2.0 | Modelo generalista con capacidades mucho más amplias; no disponible comparación de benchmarks en esta ficha |
| SmolLM2-360M | 362 M | 8192 | inglés principalmente | Apache-2.0 | Modelo pequeño generalista de Hugging Face; no disponible comparación de benchmarks en esta ficha |
| TinyLlama-1.1B | 1,1 B | 2048 | inglés/chino | Apache-2.0 | Entrenado sobre corpus mayor; no disponible comparación de benchmarks en esta ficha |

La comparación de rendimiento cuantitativo con estos modelos no está disponible en la información proporcionada. La diferencia principal de HakuChat-0.5B-CoT no es de capacidad bruta, sino de enfoque: especialización en un dominio aritmético acotado con comportamiento de abstención explícito, frente a la generalidad de los modelos citados.

## Limitaciones y advertencias

- Capacidad muy limitada por el tamaño: fuera de la aritmética de un dígito, el razonamiento lógico, los problemas verbales complejos y las operaciones con decimales son poco fiables.
- La abstención es una regla de rango aprendida, no una autoevaluación completa de capacidad; cerca del límite (por ejemplo, operandos de dos dígitos con resultado pequeño) el modelo puede clasificar mal y responder en lugar de rechazar, o rechazar de más.
- Solo soporta chino; no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- No dispone de tool calling, agentes, visión, audio ni acceso a red, por lo que no es apto para pipelines que requieran integración con herramientas.
- El conjunto de seguridad es mínimo (solo unas pocas muestras de rechazo), por lo que no constituye una alineación de seguridad completa; no debe desplegarse en producción orientada a usuarios sin filtros adicionales.
- Riesgo de alucinación en cualquier dominio fuera del aritmético acotado, incluyendo hechos, fechas y conocimiento general.
- El contexto de 4096 tokens limita conversaciones multi-turno largas y el procesamiento de documentos extensos.
- Aunque la licencia Apache-2.0 permite uso comercial, modificación y redistribución, se debe conservar el aviso de licencia y copyright; no hay restricciones adicionales documentadas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación externa de la comunidad sobre los resultados declarados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KSKOOO/HakuChat-0.5B-CoT
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
