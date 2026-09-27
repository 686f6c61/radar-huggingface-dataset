# ALPRO2023/GokTurk2.5-3B-Thinking-LoRA

## Resumen

GökTürk2.5-3B-Thinking es un adaptador LoRA (librería PEFT) publicado por el usuario ALPRO2023 que se monta sobre el modelo base unsloth/Qwen2.5-3B-Instruct-bnb-4bit. No es un modelo completo, sino un conjunto de pesos de bajo rango con r=16 y alpha=16, entrenado con QLoRA y Unsloth para dotar al modelo base de un formato de razonamiento explícito en turco basado en cadena de pensamiento (chain-of-thought).

El adaptador se entrenó durante 2,0 épocas sobre 1.197 ejemplos, con una pérdida final de entrenamiento de 0,1979, y se distribuye en formato safetensors bajo licencia Apache 2.0, con un tamaño de repositorio de 0,1 GB. Su interés práctico es doble: por un lado, ofrece una vía de bajo coste para especializar un modelo de 3 B en razonamiento en turco; por otro, documenta de forma explícita los hiperparámetros de un flujo QLoRA reproducible, algo poco habitual en adaptadores pequeños.

El modelo resultante hereda del base una arquitectura transformer decoder-only de aproximadamente 3,09 B de parámetros y una ventana de contexto nativa de 32.768 tokens. No se han publicado métricas de evaluación, ni detalles sobre la composición del dataset de entrenamiento, ni resultados comparativos frente a otros adaptadores en turco.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only (Qwen2.5-3B-Instruct) |
| Parámetros totales | Adaptador: no disponible (repo de 0,1 GB, r=16, alpha=16). Modelo base: ~3,09 B |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible para el fine-tune. Modelo base: 32.768 tokens nativos |
| Tipos de cuantización | Entrenamiento en QLoRA 4-bit (bitsandbytes, base bnb-4bit). El adaptador se distribuye en safetensors; puede fusionarse con el base en cuantizaciones GGUF, AWQ o GPTQ compatibles con Qwen2.5-3B |
| Idiomas soportados | Turco (tr) declarado por el autor; el modelo base es multilingüe |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA/PEFT) |

## Arquitectura y entrenamiento

El adaptador sigue el esquema clásico de LoRA: se congelan los pesos del modelo base y se insertan matrices de bajo rango en las capas de atención y proyección, con rango r=16 y factor de escala alpha=16. El entrenamiento se realizó con Unsloth sobre la variante cuantizada a 4 bits del base (unsloth/Qwen2.5-3B-Instruct-bnb-4bit), lo que corresponde a un flujo QLoRA con cuantización NF4 de bitsandbytes. La configuración registrada es de 2,0 épocas sobre 1.197 ejemplos y una pérdida de entrenamiento final de 0,1979.

Más allá de esos hiperparámetros, no se documenta la composición del dataset, la longitud de secuencia usada durante el entrenamiento, la proporción de ejemplos de razonamiento frente a ejemplos generales, ni si se aplicaron técnicas adicionales como DPO, RLHF o decodificación especulativa. El modelo base Qwen2.5-3B-Instruct aporta las innovaciones arquitectónicas habituales de la familia Qwen2.5: atención con consultas agrupadas (GQA), normalización RMSNorm, activación SwiGLU y embeddings posicionales rotatorios (RoPE), con soporte nativo de tool calling y de generación estructurada.

## Capacidades

- Generación de texto y razonamiento paso a paso en turco, con un formato de cadena de pensamiento (chain-of-thought) inducido por el entrenamiento.
- Resolución de problemas de lógica y matemáticas elementales mediante descomposición explícita en pasos, siempre dentro de los límites de un modelo de 3 B.
- Generación y explicación de código, capacidad heredada del modelo base Qwen2.5-3B-Instruct.
- Soporte de tool calling y function calling, heredado del base; no hay evidencia publicada de que el fine-tune lo preserve intacto.
- Soporte de conversaciones multi-turno con historial, limitado por la ventana de contexto efectiva que se haya usado en el entrenamiento (no documentada).
- Capacidades multilingües del base, aunque el adaptador se declara exclusivamente en turco y puede degradar el rendimiento en otros idiomas.
- No dispone de visión, audio ni modalidades adicionales.
- El modo "thinking" no es un modo nativo con tokens especiales documentados, sino una convención de prompting en turco que el adaptador ha aprendido a seguir.

## Casos de uso

- Tutor de razonamiento en turco: el modelo puede usarse para generar explicaciones paso a paso de problemas de matemáticas o lógica en entornos educativos turcos, aprovechando que el adaptador fue entrenado específicamente para exponer el razonamiento intermedio.
- Asistente de atención al cliente en turco: desplegado sobre el base fusionado, puede gestionar conversaciones multi-turno con contexto de hasta 32.768 tokens, suficiente para hilos largos con historial de incidencias.
- Generación de datos sintéticos de razonamiento: el adaptador sirve para producir cadenas de pensamiento en turco que después se filtran y se reutilizan para entrenar modelos mayores o para aumentar datasets escasos en ese idioma.
- Investigación en ajuste eficiente: dado que se publican los hiperparámetros exactos (r=16, alpha=16, 2 épocas, 1.197 ejemplos, loss 0,1979), es un caso de referencia para reproducir o comparar recetas QLoRA en un solo GPU consumer.
- Prototipado rápido en local: al ser un adaptador de 0,1 GB sobre un modelo de 3 B, permite iterar sobre prompts de razonamiento en turco en una estación de trabajo sin GPU de datacenter.
- Evaluación comparativa de adaptadores en turco: sirve como punto de partida para medir hasta qué punto un fine-tune de bajo rango mejora el razonamiento respecto al Qwen2.5-3B-Instruct original en ese idioma.
- Preprocesamiento lingüístico con salida estructurada: clasificación de tickets, extracción de entidades o normalización de texto en turco, con la salida en formato JSON mediante el soporte de generación estructurada del base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de entrenamiento (2,0 épocas, 1.197 ejemplos, train_loss = 0,1979), que no permiten inferir rendimiento en tareas de evaluación como MMLU, GSM8K o HumanEval, ni comparar con otros adaptadores en turco.

## Requisitos de hardware

Nota: los valores de VRAM son estimaciones para el modelo base fusionado con el adaptador, ya que el adaptador por sí solo (0,1 GB) no es ejecutable de forma independiente.

- VRAM estimada en FP16/BF16: en torno a 6-7 GB solo para pesos, más caché KV; 12 GB de VRAM es una cifra cómoda para contexto moderado.
- VRAM estimada en cuantización de 8 bits: aproximadamente 3,5-4 GB de pesos.
- VRAM estimada en cuantización de 4 bits (GGUF Q4_K_M): aproximadamente 2-2,5 GB de pesos.
- GPU consumer: cabe sin problemas en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores; en 4 bits puede ejecutarse en GPU de 4-6 GB e incluso en CPU con llama.cpp.
- GPU de datacenter: A100, H100 o L40S para servir con alto paralelismo y lotes grandes.
- Opciones de despliegue: vLLM (con soporte de adaptadores LoRA múltiples), TGI, llama.cpp, Ollama, LM Studio, SGLang y PEFT/Transformers para uso directo del adaptador sin fusionar.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| GökTürk2.5-3B-Thinking-LoRA | Adaptador sobre ~3,09 B | No documentado (base: 32.768) | Apache 2.0 | safetensors (LoRA) | Especializado en razonamiento en turco; sin benchmarks publicados |
| Qwen2.5-3B-Instruct (base) | ~3,09 B | 32.768 tokens | Apache 2.0 (Qwen) | safetensors, GGUF, AWQ, GPTQ | Modelo generalista multilingüe con tool calling; referencia directa de comparación |
| Llama-3.2-3B-Instruct | ~3,2 B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | Alternativa generalista de tamaño similar, con contexto mayor pero licencia con restricciones para algunos usos |
| Gemma 2 2B Instruct | ~2,6 B | 8.000 tokens | Gemma Terms of Use | safetensors, GGUF | Alternativa más pequeña y con contexto más corto; soporte de turco inferior al de Qwen |

No se dispone de datos de rendimiento comparativo entre estos modelos y el adaptador, por lo que la tabla se limita a especificaciones y licencias.

## Limitaciones y advertencias

- El adaptador se entrenó con solo 1.197 ejemplos durante 2 épocas; es un volumen reducido que eleva el riesgo de sobreajuste y de olvido catastrófico de capacidades del modelo base.
- La pérdida de entrenamiento final (0,1979) es baja para ese tamaño de dataset, lo que refuerza la sospecha de sobreajuste; no se reporta pérdida de validación.
- No hay ninguna evaluación publicada: se desconoce si el fine-tune mejora realmente el razonamiento en turco frente al base sin ajustar.
- Riesgo de alucinación propio de un modelo de 3 B, especialmente en tareas de conocimiento factual y en cadenas de razonamiento largas, donde puede generar pasos plausibles pero incorrectos.
- El adaptador se declara únicamente en turco; el rendimiento en castellano, inglés u otros idiomas no está garantizado y puede degradarse respecto al base.
- Se desconoce la longitud de secuencia usada en el entrenamiento, por lo que no está claro qué ventana de contexto conserva el comportamiento aprendido.
- El entrenamiento del base en 4 bits introduce ruido de cuantización; el adaptador se distribuye en safetensors pero se desconoce la precisión exacta de sus pesos.
- Licencia Apache 2.0 en el adaptador; conviene verificar igualmente la licencia del modelo base antes de un despliegue comercial.
- El repositorio no tiene descargas ni valoraciones, y no se han reportado pruebas independientes: no hay validación por parte de la comunidad.
- No se documenta la procedencia de los datos de entrenamiento, lo que impide evaluar sesgos, contaminación de benchmarks o derechos sobre el corpus.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ALPRO2023/GokTurk2.5-3B-Thinking-LoRA
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-3B-Instruct-bnb-4bit
- No se han encontrado en la información disponible otros enlaces a papers, blogs, repositorios o demos asociados a este adaptador.
