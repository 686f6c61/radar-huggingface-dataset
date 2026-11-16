# Lucasgitguy-co/minimind-mermaid-run2-GGUF

## Resumen

MiniMind-3 Mermaid Run 2 GGUF es una versión cuantizada en formato GGUF del checkpoint de la época 3 (`ep3/`) del modelo Lucasgitguy-co/minimind-mermaid-run2, un modelo de 63.912.192 parámetros (aproximadamente 64M) construido sobre la arquitectura de Qwen3 y ajustado específicamente para la generación de diagramas Mermaid. Lo publica el usuario Lucasgitguy-co y deriva del proyecto base jingyaogong/minimind-3, ambos bajo licencia Apache-2.0. Su propósito es permitir experimentar con generación de código Mermaid en entornos de inferencia local ligera mediante llama.cpp.

El modelo es deliberadamente diminuto: con 64M de parámetros y un repositorio de 0,2 GB, está pensado para pruebas y experimentación más que para uso en producción. El autor advierte explícitamente en la model card que los diagramas generados suelen ser incorrectos o estar fuera de tema (por ejemplo, dibuja gráficos de tarta ante peticiones de diagramas de flujo o de secuencia), por lo que debe considerarse una prueba de concepto.

La relevancia de esta ficha radica en su valor como ejemplo de flujo de cuantización GGUF de un modelo de arquitectura Qwen3 de muy pequeño tamaño, con una plantilla de chat ChatML embebida y compatibilidad verificada con transformers en modo greedy para el fichero F16. No se dispone de información sobre datos de entrenamiento, benchmarks ni capacidades multilingües más allá del inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en Qwen3 (según model card del autor) |
| Parametros totales | 63.912.192 (aproximadamente 64M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | F16, Q8_0, Q4_K_M |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de Qwen3 según la model card del autor, con 63.912.192 parámetros totales. Se trata de un ajuste fino del proyecto minimind-3, orientado a la generación de diagramas Mermaid. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras etapas de alineación. Tampoco se detalla la longitud de contexto nativa del modelo.

La innovación técnica destacable está en el proceso de conversión a GGUF: el conversor de llama.cpp (`convert_hf_to_gguf.py`, checkout `1b6935b`) no reconoce el hash del tokenizador original, por lo que se utilizó un wrapper (`convert_with_pre.py`) que lo mapea a `gpt-2`, coincidiendo con su pre-tokenizador `ByteLevel` con la regex de GPT-2. Los IDs de token y la plantilla de chat provienen del PR abierto #1 del repositorio fuente. La plantilla de chat (minimind-3, ChatML) está embebida en los ficheros GGUF, lo que habilita el modo conversacional.

## Capacidades

- Generación de texto conversacional en inglés mediante plantilla ChatML embebida.
- Generación de código Mermaid (diagramas de flujo, secuencias y otros), aunque con calidad limitada y frecuentes errores de tipo de diagrama.
- Modo chat funcional en llama.cpp con la opción `--jinja`.
- No se ha documentado soporte de tool calling ni function calling.
- No se ha documentado soporte de agentes ni razonamiento multi-paso.
- No se ha documentado capacidad multilingüe más allá del inglés.
- No se ha documentado modo thinking, visión ni audio.

## Casos de uso

- Experimentación con cuantización GGUF: sirve para validar pipelines de conversión de modelos de arquitectura Qwen3 de pequeño tamaño a F16, Q8_0 y Q4_K_M, comparando la salida con transformers en modo greedy.
- Pruebas de integración con llama.cpp: adecuado para verificar la compatibilidad de plantillas ChatML embebidas y el uso de `--jinja` en versiones recientes de llama.cpp.
- Docencia y demostración de inferencia local: su tamaño de 42 MB en Q4_K_M permite ejecutarlo en cualquier máquina, incluso sin GPU, para ilustrar el funcionamiento de un LLM.
- Generación de borradores de diagramas Mermaid: puede emplearse como punto de partida para diagramas simples, sabiendo que la salida requerirá revisión y corrección manual.
- Pruebas de regresión de tokenizadores: útil para comprobar la coincidencia de IDs de token entre el modelo original y la conversión GGUF en entornos de CI.
- Benchmarking de latencia en hardware modesto: al ser un modelo de 64M, permite medir throughput y latencia base de llama.cpp en CPU y GPU de gama baja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente documenta pruebas de equivalencia: los IDs de token de 3 prompts con formato de chat coinciden con transformers, la salida greedy del fichero F16 es idéntica a transformers (float32) en esos 3 prompts con 60 tokens cada uno, y Q8_0 y Q4_K_M se verificaron por muestreo en un prompt, coincidiendo las primeras líneas con F16 y divergiendo después.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todas las cuantizaciones (F16: 0,128 GB; Q8_0: 0,068 GB; Q4_K_M: 0,042 GB).
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; no requiere A100, H100 ni RTX 4090.
- Cabe en cualquier GPU de consumo, incluida la gama integrada, y también funciona en CPU.
- Opciones de despliegue: llama.cpp (probado con la versión 1.0.0, build 12359); compatible con `llama-cli` y `--jinja`. No se ha documentado compatibilidad con vLLM, TGI ni Ollama.
- Latencia y throughput estimados: no disponibles; por el tamaño del modelo se espera latencia muy baja en CPU y GPU, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| minimind-mermaid-run2-GGUF | 63.912.192 | No disponible | Apache-2.0 | GGUF | Hugging Face |
| minimind-3 (base) | No disponible | No disponible | Apache-2.0 | safetensors | Hugging Face |
| Qwen3 (arquitectura de referencia) | No disponible para este ajuste | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Calidad muy baja en la tarea objetivo: el autor indica que los diagramas suelen ser incorrectos o estar fuera de tema (dibuja gráficos de tarta ante peticiones de diagramas de flujo o de secuencia).
- Riesgo elevado de alucinación y de salidas incoherentes por el tamaño reducido del modelo (64M de parámetros).
- Solo soporta inglés; no se ha documentado capacidad multilingüe.
- Longitud de contexto no documentada; no apta para conversaciones de contexto largo.
- Divergencia entre cuantizaciones: Q8_0 y Q4_K_M coinciden con F16 solo en las primeras líneas y luego se desvían.
- Ajuste del tokenizador mediante wrapper a `gpt-2`, lo que puede introducir discrepancias en casos no cubiertos por las pruebas.
- Uso comercial permitido por la licencia Apache-2.0, pero la calidad del modelo lo hace inadecuado para producción.
- Recomendada exclusivamente para experimentos, según la propia model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lucasgitguy-co/minimind-mermaid-run2-GGUF
- Modelo base: https://huggingface.co/Lucasgitguy-co/minimind-mermaid-run2
- Proyecto minimind-3: https://huggingface.co/jingyaogong/minimind-3
- llama.cpp (conversor y runtime): https://github.com/ggml-org/llama.cpp
