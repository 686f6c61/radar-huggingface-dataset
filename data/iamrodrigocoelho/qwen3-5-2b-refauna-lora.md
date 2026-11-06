# iamrodrigocoelho/qwen3.5-2b-refauna-lora

## Resumen

Qwen3.5-2B · Refauna es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-2B, desarrollado por iamrodrigocoelho, especializado en defaunación, refaunación, reintroducción de fauna, dispersión de semillas e interacciones ecológicas en la Mata Atlántica brasileña. El modelo parte de la producción científica del proyecto Refauna (refauna.org.br) y está pensado como un pequeño modelo de lenguaje (SLM) de dominio para divulgación científica y uso educativo en portugués de Brasil.

El adaptador se entrenó con el mismo protocolo y el mismo conjunto de datos que el modelo Gemma 4 E2B · Refauna del mismo autor, con el objetivo explícito de permitir una comparación entre modelos base en la charla "Pequenos modelos, conhecimento especializado: fine-tuning e RAG com os dados do Refauna" (TDC Stage @ Rec'n'Play 2026). El entrenamiento se realizó con LoRA de 16 bits (bf16), r=16, alpha=16, durante 2 épocas con una tasa de aprendizaje de 0,0002, sobre 942 ejemplos sintéticos en PT-BR generados con estilo RAFT (con contexto y citas, abstención y sin contexto), con partición por documento.

El resultado es un adaptador de unos 0,1 GB que se distribuye bajo licencia Apache 2.0, con soporte declarado para portugués e inglés, y cuyo uso recomendado es la generación aumentada por recuperación (RAG) con el modo de razonamiento desactivado (`enable_thinking=False`). Su relevancia radica en demostrar que un modelo de 2B de parámetros, ajustado con un conjunto de datos pequeño y específico, puede ofrecer respuestas fieles y con abstención correcta cuando se combina con recuperación documental.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen3.5-2B) con adaptador LoRA (PEFT) |
| Parámetros totales | 2B (modelo base); el adaptador LoRA se distribuye por separado |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-2B) |
| Tipos de cuantización | El adaptador se entrenó en bf16; existen versiones GGUF del autor para Ollama (p. ej. Q4_K_M) |
| Idiomas soportados | Portugués (pt), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT); GGUF en el repositorio derivado del autor |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-2B, un transformer decoder-only de 2.000 millones de parámetros. El ajuste se realizó mediante LoRA de 16 bits en bf16 con rango 16 y alpha 16, aplicado a las capas de atención y MLP, usando la implementación de Unsloth (`unsloth/Qwen3.5-2B`). La plantilla de conversación es ChatML y se entrenó explícitamente sin modo de razonamiento (`enable_thinking=False`), de modo que el modelo produce respuestas directas en lugar de cadenas de pensamiento.

El conjunto de datos consta de 942 ejemplos sintéticos en portugués de Brasil con estilo RAFT: ejemplos con contexto y citas, ejemplos de abstención (cuando el contexto no contiene la respuesta) y ejemplos sin contexto. La partición se hizo por documento para evitar filtración entre entrenamiento y evaluación. El entrenamiento se ejecutó en una NVIDIA L4 durante 14,9 minutos con un pico de 7,94 GB de VRAM, lo que lo sitúa al alcance de GPUs de gama media. No se documenta en la información disponible el uso de RLHF o DPO; el método es exclusivamente ajuste supervisado sobre datos sintéticos.

## Capacidades

- Generación de texto conversacional en portugués de Brasil e inglés, con estilo didáctico y claro.
- Respuesta fundamentada en contexto recuperado (RAG), con citas en formato `[n]` a los fragmentos usados.
- Abstención explícita cuando el contexto no contiene la respuesta, evitando inventar datos, fechas, números o nombres de especies.
- Conocimiento especializado en defaunación, refaunación, reintroducción de fauna, dispersión de semillas, interacciones ecológicas y conservación de la Mata Atlántica.
- Modo sin razonamiento (`enable_thinking=False`), adecuado para respuestas de baja latencia en producción.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Asistente RAG de divulgación científica: desplegado con un índice documental del proyecto Refauna, el modelo responde preguntas sobre especies reintroducidas citando los fragmentos recuperados, lo que permite verificar cada afirmación contra la literatura original.
- Chatbot educativo para visitantes de reservas: integrado en una web o kiosco del parque, responde en portugués de Brasil sobre la historia de las reintroducciones de cutías, monos aulladores, tapires y ararás, con abstención cuando la pregunta queda fuera del corpus.
- Apoyo a investigadores en revisión bibliográfica: dado un conjunto de abstracts o pasajes, el modelo resume y cita las fuentes relevantes, reduciendo el tiempo de cribado inicial en revisiones sistemáticas sobre dispersión de semillas.
- Generación de material didáctico: a partir de los documentos del proyecto, produce explicaciones adaptadas a público escolar sobre el papel de la fauna en la regeneración forestal, siempre con citas a los trabajos originales.
- Evaluación comparativa de modelos base: al compartir datos y protocolo con Gemma 4 E2B · Refauna, sirve para comparar el comportamiento de distintos modelos base de tamaño similar en una misma tarea de dominio.
- Prototipado de bajo coste en conservación: al entrenarse en una sola NVIDIA L4 con 7,94 GB de VRAM pico, el flujo completo (fine-tuning más despliegue con Ollama en Q4_K_M) es reproducible por equipos con presupuesto limitado.
- Filtro de preguntas fuera de dominio: la capacidad de abstención entrenada permite usarlo como primera capa en un pipeline de atención a consultas, derivando a un humano o a otra fuente las preguntas no cubiertas por el corpus.

## Benchmarks y rendimiento

Evaluación publicada por el autor con un juez LLM, notas de 1 a 5:

| Configuración | Corrección | Fidelidad | Citación correcta | Abstención correcta | PT-BR |
|---|---|---|---|---|---|
| A: base | 1,72 | no disponible | no disponible | no disponible | 1,00 |
| B: base + RAG | 2,52 | 3,17 | 0,33 | 0,12 | 1,00 |
| C: fine-tuned | 2,20 | no disponible | no disponible | no disponible | 1,00 |
| D: fine-tuned + RAG | 2,32 | 4,41 | 0,45 | 1,00 | 1,00 |

Recuperación híbrida en el conjunto de prueba (n=74): Recall@4 = 0,42 y MRR@20 = 0,30.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Entrenamiento del adaptador LoRA: una NVIDIA L4 con 7,94 GB de VRAM pico, 14,9 minutos para 2 épocas sobre 942 ejemplos.
- Inferencia del modelo base en bf16: aproximadamente 4-5 GB de VRAM para los pesos de 2B, más overhead de contexto y KV cache.
- Inferencia en cuantización Q4_K_M (GGUF): en torno a 1,5-2 GB de memoria, apta para GPUs de consumo como RTX 3060, RTX 4060 o superiores, e incluso para CPU con llama.cpp.
- Despliegue recomendado: Ollama con la etiqueta `hf.co/iamrodrigocoelho/qwen3.5-2b-refauna-GGUF:Q4_K_M` y `"think": false` en la API; también es compatible con llama.cpp y con frameworks que carguen adaptadores PEFT sobre el modelo base.
- No se documentan cifras de latencia ni throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-2B · Refauna (este) | 2B + LoRA | no disponible | Fauna y conservación de la Mata Atlántica, PT-BR | Apache 2.0 | Hugging Face (adaptador PEFT y GGUF) |
| Gemma 4 E2B · Refauna | no disponible | no disponible | Mismo corpus y protocolo que este modelo | no disponible | Hugging Face (iamrodrigocoelho/gemma-4-e2b-refauna) |
| Qwen/Qwen3.5-2B (base) | 2B | no disponible | Generalista | Apache 2.0 | Hugging Face |

La comparación directa más relevante es con Gemma 4 E2B · Refauna, entrenado con los mismos datos y protocolo, lo que permite aislar el efecto del modelo base. Frente al Qwen3.5-2B sin ajustar, este adaptador mejora la fidelidad al contexto y la abstención correcta en el entorno RAG evaluado (4,41 y 1,00 frente a 3,17 y 0,12), aunque la corrección global sin RAG baja ligeramente (2,20 frente a 1,72 en el base, y 2,32 frente a 2,52 con RAG).

## Limitaciones y advertencias

- Uso previsto educativo y de divulgación científica; no sustituye a la literatura original ni debe usarse como fuente primaria en decisiones de conservación.
- Sin RAG, el modelo puede equivocar números, fechas y nombres de especies; el autor lo advierte explícitamente.
- El conjunto de entrenamiento es pequeño (942 ejemplos sintéticos), lo que limita la cobertura y puede producir sobreajuste al estilo del corpus.
- La abstención correcta solo alcanza 1,00 en la configuración con fine-tuning más RAG; en el resto de configuraciones es baja o no medida.
- La citación correcta con RAG es de 0,45, de modo que las referencias `[n]` pueden no corresponder al fragmento adecuado y requieren verificación.
- El rendimiento de recuperación es modesto (Recall@4 = 0,42, MRR@20 = 0,30), por lo que la calidad final depende en gran medida del sistema de recuperación.
- Idiomas limitados a portugués e inglés; no se garantiza un comportamiento correcto en castellano ni en otras lenguas.
- No se documentan evaluaciones de sesgo; al estar entrenado sobre un corpus científico concreto, puede reproducir sesgos de la literatura de origen.
- Licencia Apache 2.0 permite uso comercial, pero debe respetarse la atribución a las fuentes científicas listadas por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamrodrigocoelho/qwen3.5-2b-refauna-lora
- Versión GGUF para Ollama: https://huggingface.co/iamrodrigocoelho/qwen3.5-2b-refauna-GGUF
- Modelo comparable Gemma 4 E2B · Refauna: https://huggingface.co/iamrodrigocoelho/gemma-4-e2b-refauna
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Implementación de entrenamiento: https://huggingface.co/unsloth/Qwen3.5-2B
- Proyecto Refauna: https://refauna.org.br
- DOI de referencia (reintroducción de cutía): https://doi.org/10.1590/S1984-46702013000100015
- DOI de referencia (éxito a corto plazo de la reintroducción): https://doi.org/10.1177/194008291400700415
- DOI de referencia (consumo de carroña por Dasyprocta leporina): https://doi.org/10.1590/bjb.2014.0087
- DOI de referencia (extinción local de dispersor y palma endémica): https://doi.org/10.1590/0102-33062015abb0008
- DOI de referencia (crédito de interacciones ecológicas): https://doi.org/10.1002/ece3.2746
- DOI de referencia (rewilding de la Mata Atlántica): https://doi.org/10.1016/j.pecon.2017.09.004
- DOI de referencia (crecimiento poblacional no asistido de cutías): https://doi.org/10.1017/S0030605316001149
- DOI de referencia (restauración de Alouatta guariba): https://doi.org/10.3389/fcosc.2024.1401749
- DOI de referencia (patrones de actividad de tapires reintroducidos): https://doi.org/10.1017/S0030605325102494
- DOI de referencia (Balantioides coli en tapir): https://doi.org/10.1007/s00436-026-08707-0
