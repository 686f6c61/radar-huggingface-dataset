# KlibiYoussef/smart-plate-nutrition-adapter

## Resumen

Smart Plate Nutrition Adapter es un adaptador LoRA (no un modelo completo) entrenado sobre el modelo base Qwen/Qwen3-4B-Base. Lo desarrolla KlibiYoussef en el contexto del proyecto "Smart Plate Nutrition" y su objetivo es convertir un modelo base en un asistente conversacional especializado en nutrición, con respuestas educadas y estructuradas en francés o inglés. Se entrenó mediante supervisión fina (SFT) con TRL y QLoRA, y se publica bajo licencia Apache 2.0.

El adaptador no añade conocimiento nutricional verificado: su función es enseñar al modelo el estilo, el formato y el tono de las respuestas (saludo cálido, tratamiento de usted en francés, cierre motivador y presentación estructurada de calorías y macronutrientes). El conocimiento factual procede del modelo base y del dataset de entrenamiento, por lo que los valores numéricos deben verificarse siempre contra bases de datos de composición de alimentos.

Es relevante para desarrolladores e investigadores que quieran evaluar el coste y el resultado de un ajuste fino ligero (QLoRA, una época, 9.542 ejemplos, una sola T4) sobre un modelo de 4.000 millones de parámetros, así como para quienes necesiten un punto de partida reproducible para asistentes conversacionales de dominio restringido. El repositorio ocupa 0,7 GB y contiene únicamente los pesos del adaptador en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA sobre el modelo base |
| Parametros totales | no disponible (el adaptador LoRA no declara recuento; el modelo base Qwen3-4B-Base tiene 4.000 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (entrenamiento con max sequence length de 1024) |
| Tipos de cuantizacion | QLoRA 4-bit NF4 con doble cuantizacion para el modelo base; pesos del adaptador en safetensors (precision original) |
| Idiomas soportados | frances (fr), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar Qwen/Qwen3-4B-Base por separado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-4B-Base, un transformer decoder-only de 4.000 millones de parámetros. El ajuste fino emplea QLoRA: el modelo base se carga en 4 bits (NF4, doble cuantizacion) y se entrena un adaptador LoRA con rango 16, alpha 32 y dropout 0,05 sobre los módulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. Se usó learning rate 2e-4, una época, batch efectivo de 8 (4 por dispositivo con 8 pasos de acumulación), longitud máxima de secuencia de 1024, optimizador `paged_adamw_8bit` y precisión fp16 sobre una única NVIDIA Tesla T4 en Google Colab.

El dataset es conversacional y propio, con 9.542 ejemplos compuestos por mensaje de sistema, mensaje de usuario y respuesta del asistente, en francés e inglés. La pérdida se calcula únicamente sobre las respuestas del asistente (`completion_only_loss=True`). El autor indica que combinó IA generativa con un dataset existente de nutrición de alimentos. No se documentan fases de RLHF ni DPO, ni innovaciones arquitectónicas adicionales más allá del propio ajuste LoRA.

## Capacidades

- Generación de texto conversacional en francés e inglés, con tono educado y tratamiento de usted en francés.
- Respuestas estructuradas con información nutricional: calorías, macronutrientes y consejos generales.
- Apertura con saludo cálido y cierre con frase motivadora orientada a la salud, según el formato aprendido.
- Adaptación al idioma del prompt mediante el system prompt correspondiente (francés o inglés).
- Formato de prompt en texto plano con marcadores de rol (`Système :`, `Utilisateur :`, `Assistant :`) y terminación con `<|endoftext|>`; no usa ChatML.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Demo de asistente nutricional conversacional: el adaptador responde a preguntas sobre calorías y macronutrientes manteniendo un tono formal y un cierre motivador, adecuado para prototipos y pruebas de concepto del proyecto Smart Plate Nutrition.
- Investigación sobre ajuste fino ligero: sirve como ejemplo reproducible de QLoRA con TRL sobre un modelo de 4.000 millones de parámetros, con hiperparámetros y hardware documentados (una T4, una época, 9.542 ejemplos).
- Evaluación de formato y estilo: útil para medir hasta qué punto el SFT enseña estructura de respuesta (saludo, secciones, cierre) sin añadir conocimiento factual verificado.
- Generación de borradores de análisis de comidas: el modelo puede producir descripciones estructuradas de macronutrientes a partir de una consulta, que después se validan contra una base de datos de composición de alimentos.
- Asistente bilingüe de dominio restringido: permite comparar el comportamiento en francés formal (vouvoiement) y en inglés con el mismo adaptador, útil para estudiar transferencia de estilo entre idiomas.
- Base para iteraciones posteriores: al ser un adaptador PEFT, se puede combinar con otros adaptadores o continuar el entrenamiento con datos adicionales sin redistribuir el modelo base completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se ha ejecutado ninguna evaluación formal del adaptador.

## Requisitos de hardware

- El adaptador en sí ocupa 0,7 GB en el repositorio; requiere además cargar Qwen/Qwen3-4B-Base.
- Con cuantizacion 4-bit NF4 (configuración usada en el ejemplo de la model card) el modelo base ocupa aproximadamente 2-2,5 GB de VRAM, más overhead de activaciones y caché KV; cabe en GPUs consumer con 8 GB o más.
- En bf16/fp16 el modelo base de 4.000 millones de parámetros requiere alrededor de 8 GB solo para pesos, más activaciones; se recomienda una GPU de 16 GB o superior (RTX 4090, A100, H100).
- El entrenamiento documentado se realizó en una única NVIDIA Tesla T4 (Google Colab), con precisión fp16 y `bitsandbytes` para la carga en 4 bits.
- Despliegue: el ejemplo oficial usa `transformers` + `peft` + `bitsandbytes`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al tratarse de un adaptador LoRA, su uso en esos motores requeriría fusionar o convertir los pesos, algo no descrito en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Smart Plate Nutrition Adapter (este) | Adaptador LoRA sobre Qwen3-4B-Base (4.000 M) | no disponible | Apache 2.0 | safetensors (PEFT) | Especializado en estilo nutricional fr/en; sin evaluación formal |
| Qwen/Qwen3-4B-Base | 4.000 M | no disponible en la informacion proporcionada | Apache 2.0 | safetensors | Modelo base sin ajuste; no tiene el estilo ni el formato del asistente |
| Alternativas de ajuste LoRA sobre modelos de ~4B | variable | variable | variable | variable | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de benchmarks ni de comparaciones cuantitativas con otros adaptadores o modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- No es consejo médico ni dietético: los valores de calorías, macronutrientes y objetivos de proteína los genera un modelo de lenguaje y pueden ser incorrectos; deben verificarse contra una base de datos de composición de alimentos o un profesional cualificado.
- El ajuste enseña estilo y formato, no conocimiento nutricional verificado; los hechos provienen principalmente del modelo base y del dataset de entrenamiento.
- No se ha ejecutado ninguna evaluación formal, por lo que no hay métricas de calidad, exactitud numérica ni tasas de alucinación.
- Funciona mejor con el system prompt y el formato de prompt exactos documentados; desviarse de ellos puede degradar la calidad de la respuesta.
- Solo se declaran francés e inglés; no hay evidencia de comportamiento correcto en castellano u otros idiomas.
- Riesgo de alucinación inherente al modelo base, especialmente en cifras nutricionales y recomendaciones cuantitativas.
- Sesgos: no documentados por el autor; al entrenarse con un dataset generado en parte con IA y un dataset de nutrición existente, puede heredar sesgos de esas fuentes.
- Licencia Apache 2.0 permite uso comercial, pero debe respetarse también la licencia del modelo base Qwen3-4B-Base al redistribuir o desplegar.
- El adaptador no incluye los pesos del modelo base; es necesario descargarlo por separado.

## Enlaces

- Hugging Face: https://huggingface.co/KlibiYoussef/smart-plate-nutrition-adapter
- README del repositorio: https://huggingface.co/KlibiYoussef/smart-plate-nutrition-adapter/blob/main/README.md
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- TRL (framework de entrenamiento): https://github.com/huggingface/trl
