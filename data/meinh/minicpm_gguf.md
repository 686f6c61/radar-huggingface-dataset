# Meinh/MiniCPM_GGUF

## Resumen

MiniCPM_GGUF es una conversión al formato GGUF del modelo MiniCPM5-1B, publicada por el usuario Meinh en Hugging Face. Se trata de una distribución de pesos cuantizados pensada para su uso directo con llama.cpp y sus derivados (llama-cli, llama-mtmd-cli), no de un modelo entrenado desde cero por este autor. El repositorio contiene dos ficheros GGUF: una cuantización Q4_K_M y otra Q8_0.

El modelo base pertenece a la familia MiniCPM, desarrollada originalmente por OpenBMB en colaboración con ModelBest, una línea de modelos compactos orientada a dispositivos de borde y despliegues con recursos limitados. Con aproximadamente 1.080 millones de parámetros (1,08 B), se sitúa en la categoría de modelos pequeños capaces de ejecutarse en hardware de consumo, y la etiqueta "conversational" sugiere un ajuste para diálogo.

La relevancia de esta ficha radica en su utilidad práctica: ofrece una vía sencilla para probar un modelo de la familia MiniCPM en local mediante llama.cpp, con ficheros ya convertidos y listos para descargar. No obstante, la información publicada por el autor es mínima (sin licencia declarada, sin idiomas, sin benchmarks ni detalles de entrenamiento), por lo que muchos apartados de esta ficha deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia MiniCPM); detalles específicos no disponibles |
| Parametros totales | 1.080.632.832 (1,08 B) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M y Q8_0 (ficheros publicados) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (convertido con Unsloth); pesos originales en safetensors según metadatos |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la documentación proporcionada. Por la nomenclatura y el tamaño (1,08 B de parámetros), se trata presumiblemente de un transformer decoder-only de la familia MiniCPM, pero no se confirman en la información disponible ni el número de capas, ni las dimensiones ocultas, ni el mecanismo de atención empleado.

Tampoco se documentan los datos de entrenamiento: número de tokens, composición del corpus, uso de RLHF/DPO o técnicas de alineación. La model card únicamente indica que la conversión a GGUF se realizó con Unsloth y que el modelo admite tanto uso textual como multimodal (se menciona llama-mtmd-cli), aunque no se especifica si esta variante de 1 B incorpora visión o si la mención es genérica para la familia.

## Capacidades

- Generación de texto conversacional, según la etiqueta "conversational" del repositorio.
- Ejecución local mediante llama.cpp con soporte de plantillas de chat (`--jinja`).
- Posible soporte multimodal según la referencia a `llama-mtmd-cli`, aunque no confirmado para esta variante de 1 B.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles.
- Cobertura multilingüe: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Prototipado local de asistentes conversacionales: gracias a su tamaño de 1,08 B y a las cuantizaciones Q4_K_M y Q8_0, puede ejecutarse en portátiles sin GPU dedicada mediante llama.cpp, lo que permite iterar sobre prompts y plantillas de chat sin coste de API.
- Pruebas de integración en pipelines llama.cpp: los ficheros GGUF permiten validar plantillas Jinja, formato de chat y comportamiento del tokenizador antes de migrar a modelos mayores de la misma familia.
- Aplicaciones de borde con recursos restringidos: el modelo cabe en dispositivos con poca memoria, lo que lo hace candidato para demos en Raspberry Pi o mini-PC, siempre que se valide su calidad real.
- Generación de texto de baja latencia en CPU: la cuantización Q4_K_M reduce el tamaño del fichero y acelera la inferencia en CPU, útil para tareas de autocompletado o respuestas cortas.
- Evaluación comparativa de cuantizaciones: disponer de Q4_K_M y Q8_0 en el mismo repositorio facilita medir la degradación de calidad frente a velocidad en un mismo hardware.
- Base para fine-tuning o destilación experimental: al ser un modelo pequeño, sirve como punto de partida para experimentos académicos de ajuste supervisado o LoRA, aunque requiere verificar la licencia del modelo base antes de redistribuir derivados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el fichero Q4_K_M ocupa aproximadamente 0,6-0,7 GB y el Q8_0 en torno a 1,1-1,2 GB (estimación a partir de 1,08 B de parámetros); el repositorio completo pesa 1,8 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede alojar la cuantización Q8_0; una RTX 3060, RTX 4060 o superior ofrece margen amplio. Para despliegues en servidor, A100 o H100 no aportan ventaja significativa por el tamaño reducido del modelo.
- Compatibilidad con GPU de consumo: sí, cabe en prácticamente cualquier GPU de consumo moderna e incluso en iGPU con memoria unificada.
- Despliegue: llama.cpp (llama-cli, llama-mtmd-cli, llama-server), y por extensión cualquier frontend compatible con GGUF (Ollama, LM Studio, KoboldCpp). vLLM y TGI no están confirmados para este repositorio.
- Latencia y throughput: no disponibles; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM_GGUF (este repo) | 1,08 B | No disponible | No disponible | GGUF | Hugging Face |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32 768 tokens | Apache 2.0 | safetensors, GGUF | Hugging Face, Ollama |
| Llama 3.2 1B Instruct | 1,2 B | 128 000 tokens | Llama 3.2 Community License | safetensors, GGUF | Hugging Face, Ollama |
| SmolLM2-1.7B-Instruct | 1,7 B | 8 192 tokens | Apache 2.0 | safetensors, GGUF | Hugging Face, Ollama |

La comparación se ofrece a título orientativo por categoría de tamaño; no se dispone de datos de rendimiento del modelo de esta ficha para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- La model card no declara licencia, lo que impide determinar si el uso comercial está permitido; es imprescindible consultar la licencia del modelo base MiniCPM5-1B antes de cualquier despliegue en producción.
- No se documentan idiomas soportados; el rendimiento en castellano es desconocido y debe evaluarse empíricamente.
- No se publican benchmarks ni evaluaciones de calidad, por lo que no hay evidencia objetiva de su rendimiento frente a alternativas.
- Riesgo de alucinación inherente a modelos de 1 B de parámetros, especialmente en tareas de razonamiento, matemáticas o conocimiento factual.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.
- Al ser una conversión de terceros, pueden existir diferencias de comportamiento respecto a los pesos originales; conviene verificar la integridad y procedencia de los ficheros.
- La mención a uso multimodal en la model card es genérica y no está confirmada para esta variante de 1 B.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Meinh/MiniCPM_GGUF
- Unsloth (herramienta de conversión): https://github.com/unslothai/unsloth
- llama.cpp (runtime recomendado): https://github.com/ggml-org/llama.cpp
