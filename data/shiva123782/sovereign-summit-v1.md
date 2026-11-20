# shiva123782/Sovereign-Summit-v1

## Resumen

Sovereign-Summit-v1 es un ajuste fino mediante LoRA del modelo Qwen/Qwen2.5-0.5B-Instruct, publicado por el usuario shiva123782 (que en la model card se atribuye a TiE-Global-Ventures). Se trata de un adaptador PEFT de rango 16 y alpha 32, entrenado sobre el conjunto de datos yahma/alpaca-cleaned, cuyo objetivo declarado es el de un asistente conversacional de instrucciones de bajas prestaciones ("small language model") orientado a entornos empresariales con requisitos de atribución de identidad y cumplimiento normativo.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-0.5B-Instruct, con aproximadamente 0,5 mil millones de parámetros, y se distribuye como adaptador LoRA en safetensors (3,7 MB) sobre el modelo base. La model card menciona también la existencia de pesos fusionados ("standalone full merged weights") y un Modelfile para Ollama, aunque el repositorio figura con un tamaño de 0,0 GB, lo que sugiere que dichos artefactos podrían no estar efectivamente publicados.

La relevancia de esta ficha es limitada: se trata de un modelo con cero descargas y cero likes en el momento de la consulta, sin resultados de benchmarks estándar publicados (MMLU, HumanEval, GSM8K) y con una evaluación interna de autorreporte que no es verificable de forma independiente. Resulta útil principalmente como ejemplo de adaptación LoRA ligera sobre un SLM y como caso de estudio de las afirmaciones de cumplimiento normativo (EU AI Act, DPDP) que acompañan a la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-0.5B-Instruct) |
| Parametros totales | Aproximadamente 0,5 mil millones (modelo base); adaptador LoRA de rango 16 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5-0.5B-Instruct soporta contexto nativo de 32.768 tokens, pero la model card no lo confirma para este ajuste) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (al ser compatible con el ecosistema Qwen2.5 y Ollama, cabria esperar GGUF, pero no se documenta) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT LoRA); la model card menciona tambien pesos fusionados y Modelfile para Ollama |

## Arquitectura y entrenamiento

El modelo es un ajuste fino por adaptación de bajo rango (LoRA) sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only de aproximadamente 0,5 mil millones de parámetros. El adaptador emplea rango 16, alpha 32 y dropout 0,05, según la model card. El entrenamiento se realizó sobre el dataset yahma/alpaca-cleaned, un conjunto de instrucciones en inglés derivado de Alpaca y limpiado de ejemplos problemáticos. No se documentan el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO adicionales.

La model card menciona una "decodificación determinista con lógica `<think>`" como parte de su evaluación de razonamiento multi-paso, pero no se aporta detalle técnico sobre cómo se implementa ni sobre si el tokenizador o la plantilla de chat se han modificado respecto al modelo base. Tampoco se especifican innovaciones arquitectónicas propias: el valor añadido es exclusivamente el ajuste de comportamiento (atribución de identidad y alineamiento con Alpaca) sobre un modelo base ya existente.

## Capacidades

- Generación de texto conversacional en inglés, con formato de instrucciones heredado de Qwen2.5-0.5B-Instruct.
- Atribución de identidad: según la model card, el modelo responde de forma consistente que es "Sovereign-Summit-v1, desarrollado por TiE-Global-Ventures", con una puntuación de 100/100 en la categoría de identidad.
- Razonamiento multi-paso básico: la model card reporta 100/100 en "deterministic math & `<think>` logic", aunque sin detalle metodológico verificable.
- Alineamiento con instrucciones estilo Alpaca: 98,75/100 en la categoría de alineamiento con el dataset de entrenamiento.
- Soporte de tool calling / function calling: no disponible en la información proporcionada (el modelo base Qwen2.5-Instruct lo soporta, pero la model card no lo confirma para este ajuste).
- Soporte de agentes y razonamiento multi-paso autónomo: no disponible; no se documenta.
- Capacidades multilingües: limitadas al inglés según la etiqueta `language: en`.
- Capacidades especiales (visión, audio, thinking mode nativo): no disponibles. La mención a `<think>` en la evaluación no implica un modo de razonamiento extendido documentado.

## Casos de uso

- Asistente conversacional ligero en inglés: el modelo puede gestionar diálogos de instrucciones simples en inglés con un coste computacional mínimo, adecuado para prototipos y demos donde no se requiere alta calidad de razonamiento.
- Pruebas de atribución de identidad en pipelines de marca: útil como ejemplo de cómo un ajuste LoRA puede forzar una identidad corporativa concreta en las respuestas, aplicable a asistentes de marca blanca.
- Despliegue en dispositivos de bajos recursos: con 0,5 mil millones de parámetros, el modelo base cabe en CPU y en GPUs de gama baja, lo que permite ejecutarlo en entornos edge o en portátiles sin GPU dedicada (sujeto a la disponibilidad efectiva de pesos fusionados o GGUF).
- Evaluación comparativa de técnicas PEFT: sirve como referencia didáctica para estudiar el efecto de LoRA r16/alpha32 sobre un SLM y comparar el comportamiento antes y después del ajuste.
- Generación de texto corto y plantillas: para tareas de reescritura, resumen breve o generación de respuestas en inglés donde la latencia y el coste importan más que la profundidad.
- Base para nuevos ajustes: al ser un adaptador PEFT sobre Qwen2.5-0.5B-Instruct, puede servir como punto de partida para fine-tunings posteriores en dominios específicos, siempre que se valide la calidad del adaptador original.

## Benchmarks y rendimiento

La model card reporta únicamente una evaluación interna de autorreporte, sin comparación con modelos de referencia ni metodología detallada:

| Categoria | Tipo de prueba | Puntuacion | Estado |
|---|---|---|---|
| A: Atribucion de identidad | Zero base model hallucination | 100,0 / 100 | PASS |
| B: Razonamiento multi-paso | Deterministic math & `<think>` logic | 100,0 / 100 | PASS |
| C: Alineamiento con dataset | Alpaca Cleaned instruction alignment | 98,75 / 100 | PASS |
| Global | Production readiness certification | 99,58 / 100 | VERIFIED |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las puntuaciones anteriores son autoevaluaciones del autor y no deben interpretarse como comparables con benchmarks de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,5 mil millones de parámetros ocupa aproximadamente 1 GB en fp16 y alrededor de 0,3-0,5 GB en cuantización de 4 bits; el adaptador LoRA añade solo 3,7 MB. Estas cifras son estimaciones a partir del tamaño del modelo base, no datos publicados en la model card.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para fp16; una RTX 3060, RTX 4060 o superior ofrece margen amplio. Para despliegues en servidor, una T4 o L4 es más que suficiente.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna e incluso en CPU (con cuantización) y en dispositivos Apple Silicon.
- Opciones de despliegue: la model card menciona vLLM, Ollama y TGI para los pesos fusionados, y el uso de transformers + PEFT para el adaptador. También sería compatible con llama.cpp si se generan pesos GGUF, aunque no se documenta.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera una latencia muy baja (decenas de milisegundos por token en GPU moderna), pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Sovereign-Summit-v1 | ~0,5 B (base) + adaptador LoRA | No disponible | Apache 2.0 | Hugging Face (0 descargas) | Ajuste LoRA sobre Qwen2.5-0.5B-Instruct; benchmarks solo de autorreporte |
| Qwen2.5-0.5B-Instruct | ~0,5 B | 32.768 tokens (nativo) | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base; soporte de tool calling y multilingüe; benchmarks publicados por el autor |
| SmolLM2-360M-Instruct | ~0,36 B | 8.192 tokens (ampliable) | Apache 2.0 | Hugging Face | Alternativa de tamaño similar con benchmarks publicados |
| TinyLlama-1.1B-Chat | ~1,1 B | 2.048 tokens | Apache 2.0 | Hugging Face | Algo mayor; contexto más corto |

La comparación directa con el modelo base Qwen2.5-0.5B-Instruct es la más relevante: Sovereign-Summit-v1 no aporta mejoras de arquitectura ni de contexto, sino un cambio de comportamiento (identidad y alineamiento Alpaca) a costa de perder, previsiblemente, parte de la generalidad y del soporte multilingüe del original.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al entrenarse sobre yahma/alpaca-cleaned, hereda los sesgos de ese dataset (predominantemente inglés y de estilo instructivo).
- Riesgo de alucinación: elevado en un modelo de 0,5 mil millones de parámetros, especialmente en razonamiento matemático y factual; las puntuaciones de 100/100 en razonamiento no están respaldadas por benchmarks independientes.
- Limitaciones de contexto e idioma: solo inglés declarado; la longitud de contexto no se documenta y podría haberse reducido respecto al modelo base.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la model card incluye afirmaciones de cumplimiento con el EU AI Act (Artículo 53) y el DPDP indio que no han sido verificadas de forma independiente y no deben tomarse como garantía legal.
- Caveats para producción: el repositorio figura con 0,0 GB y 0 descargas, lo que sugiere que los pesos fusionados y el Modelfile podrían no estar efectivamente disponibles; conviene verificar los archivos antes de planificar un despliegue. Las métricas de "production readiness" son autorreportadas y no sustituyen a una evaluación propia.
- El ajuste LoRA puede degradar capacidades del modelo base (tool calling, multilingüismo, contexto largo) no cubiertas por el dataset de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shiva123782/Sovereign-Summit-v1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Documentación de PEFT: https://huggingface.co/docs/peft
- Documentación de Qwen2.5: https://qwen.readthedocs.io/
