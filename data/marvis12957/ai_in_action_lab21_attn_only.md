# Marvis12957/ai_in_action_lab21_attn_only

## Resumen

El modelo `Marvis12957/ai_in_action_lab21_attn_only` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por Trần Văn Hiếu como parte de un ejercicio académico (lab 21) sobre fine-tuning de modelos de lenguaje. Se trata de un experimento de ablación que compara la posición de los módulos LoRA dentro de la arquitectura del modelo base `unsloth/Qwen3.5-4B`. Mientras que la configuración "correcta" aplica LoRA a 12 tipos de módulos (text-linear), este adaptador solo lo aplica a los módulos de atención (q y v), con un rank aumentado a 283 para igualar el presupuesto de parámetros entrenables (32.456.704) con la run de referencia.

El adaptador está fine-tuneado para tareas de soporte al cliente en vietnamita, con un dataset específico y 2 épocas de entrenamiento. Los resultados de evaluación sobre 50 muestras objetivo muestran una precisión del 97% y una validez de formato del 100%, con una latencia media de 921,3 ms. El propósito del experimento es determinar si la posición de los adaptadores LoRA influye en el rendimiento cuando el presupuesto de parámetros se mantiene constante, concluyendo que el número de parámetros entrenables es el factor dominante, no la ubicación de los módulos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.5-4B, arquitectura exacta no disponible) |
| Parametros totales | No disponible (modelo base: 4B; adaptador: 32.456.704 entrenables) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (entrenado en precision 16-bit) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA, libreria PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en el modelo `unsloth/Qwen3.5-4B`, un modelo de lenguaje de 4 mil millones de parametros de la familia Qwen. La arquitectura subyacente es un transformer causal, aunque no se proporcionan detalles especificos sobre el numero de capas, dimensiones de atencion o tipo de atencion (si es full attention, sliding window, etc.). El adaptador LoRA se aplica exclusivamente a los modulos de atencion (query y value) con un rank de 283, en contraste con la configuracion "correcta" que aplica LoRA a 12 tipos de modulos (text-linear). El entrenamiento se realizo con una tasa de aprendizaje de 1e-4, 2 epocas (30 pasos) y precision de 16 bits. No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion; se trata de un fine-tuning supervisado clasico sobre un dataset de soporte al cliente en vietnamita.

El experimento de ablacion busca aislar el efecto de la posicion de los adaptadores LoRA manteniendo constante el numero de parametros entrenables. Al elevar el rank a 283, el numero de parametros entrenables (32.456.704) difiere solo en un 0,025% respecto a la run de referencia, lo que permite comparar directamente el impacto de la ubicacion de los modulos.

## Capacidades

- Generacion de texto en vietnamita, especializado en respuestas de soporte al cliente.
- Formato de salida estructurado (validez de formato del 100% en evaluacion).
- Capacidades limitadas fuera del dominio de entrenamiento; el adaptador no anade capacidades generales al modelo base.
- No se ha verificado soporte para tool calling, agentes o razonamiento multi-paso en este adaptador especifico.
- El modelo base Qwen3.5-4B puede tener capacidades multilingues y de razonamiento, pero el adaptador esta disenado para un unico idioma y tarea.

## Casos de uso

- Atencion al cliente automatizada en vietnamita: el adaptador puede generar respuestas coherentes y con formato valido para consultas de soporte, integrandose en sistemas de chatbot o ticketing.
- Clasificacion y respuesta a preguntas frecuentes: dado su entrenamiento en soporte al cliente, puede utilizarse para responder consultas recurrentes en un dominio especifico.
- Experimentacion academica en fine-tuning: sirve como referencia para estudiar el efecto de la ubicacion de adaptadores LoRA en el rendimiento, util para investigadores que comparan estrategias de PEFT.
- Prototipado rapido de asistentes virtuales en vietnamita: al ser un adaptador ligero (0,1 GB), puede cargarse sobre el modelo base sin necesidad de reentrenar, facilitando pruebas de concepto.
- Evaluacion de metodos de ablacion en PEFT: permite reproducir el experimento y validar la conclusion sobre el presupuesto de parametros como factor principal.
- Despliegue en entornos con recursos limitados: al ser un adaptador LoRA, el modelo base puede cuantizarse y el adaptador anadirse sin un incremento significativo de memoria.

## Benchmarks y rendimiento

La model card proporciona los siguientes resultados de evaluacion sobre 50 muestras objetivo:

| Metrica | Valor |
|---|---|
| Target accuracy | 0.970 |
| Format validity | 1.000 |
| Latency | 921.3 ms |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La comparacion con la run "correcta" (accuracy 0.965) muestra una diferencia de 0.005, considerada dentro del ruido de medicion.

## Requisitos de hardware

- No se dispone de datos especificos de VRAM para este adaptador. Dado que es un adaptador LoRA sobre un modelo de 4B, la inferencia requiere la carga del modelo base (unsloth/Qwen3.5-4B) mas el adaptador.
- El modelo base de 4B en precision 16-bit ocupa aproximadamente 8 GB de VRAM; con cuantizacion (por ejemplo, 4-bit) puede reducirse a unos 2-3 GB.
- GPU recomendadas: tarjetas consumer como RTX 3060 (12 GB), RTX 4070, o GPUs de datacenter como A10G o A100 si se requiere mayor throughput.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, o directamente con Transformers + PEFT.
- La latencia reportada de 921.3 ms sugiere un despliegue en CPU o GPU modesta; en GPU dedicada podria ser menor.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (adaptadores LoRA para soporte al cliente en vietnamita). El unico punto de referencia es la run "correcta" (`ai_in_action_lab21`), que aplica LoRA a 12 modulos con rank ajustado para igualar el presupuesto de parametros. Ambos comparten el mismo modelo base, dataset y epocas, diferenciandose solo en la posicion de los adaptadores.

| Modelo | Posicion LoRA | Rank | Parametros entrenables | Target accuracy |
|---|---|---|---|---|
| ai_in_action_lab21 (correct) | 12 modulos (text-linear) | No especificado | ~32.456.704 | 0.965 |
| ai_in_action_lab21_attn_only | q, v (2 modulos) | 283 | 32.456.704 | 0.970 |

## Limitaciones y advertencias

- El adaptador esta entrenado exclusivamente para vietnamita y para tareas de soporte al cliente; su rendimiento fuera de este dominio no esta garantizado.
- La evaluacion se realizo sobre solo 50 muestras, por lo que los resultados pueden no ser estadisticamente robustos.
- No se han documentado sesgos especificos, pero al ser un modelo fine-tuneado sobre un dataset limitado, puede reflejar sesgos presentes en los datos de entrenamiento.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar respuestas incorrectas o inventadas, especialmente en dominios no cubiertos por el entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base (Qwen3.5-4B) puede tener sus propias restricciones; se recomienda verificar la licencia del modelo base.
- El adaptador no incluye capacidades de vision, audio ni otras modalidades; es exclusivamente texto.
- No se proporcionan detalles sobre el dataset de entrenamiento, su tamano ni su composicion, lo que limita la reproducibilidad.

## Enlaces

- HuggingFace: https://huggingface.co/Marvis12957/ai_in_action_lab21_attn_only
- Adaptador de referencia (run correcta): https://huggingface.co/Marvis12957/ai_in_action_lab21
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-4B
