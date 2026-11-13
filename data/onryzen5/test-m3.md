# onryzen5/test-m3

## Resumen

MiniMind-3 es un modelo de lenguaje de 63,9 millones de parámetros publicado por el desarrollador onryzen5 bajo el identificador `onryzen5/test-m3` en Hugging Face. Se trata de una réplica de los pesos de la familia MiniMind, un proyecto educativo de código abierto creado por jingyaogong cuyo objetivo es reproducir desde cero todo el ciclo de vida de un LLM (preentrenamiento, SFT, LoRA, DPO, RLAIF, tool use y agentic RL) con un coste mínimo. La arquitectura sigue el ecosistema Qwen3 en su variante densa, con un tokenizador BPE con ByteLevel que incorpora marcas especiales para tool calling y modo de razonamiento.

La relevancia del modelo no reside en su rendimiento absoluto, sino en su función didáctica y de experimentación: permite entrenar y desplegar un LLM completo en una única GPU de consumo (el autor estima unas 2 horas en una RTX 3090 y un coste de alquiler de aproximadamente 3 yuanes). Está pensado para investigadores que quieran estudiar el pipeline completo, para desarrolladores que necesiten un banco de pruebas ligero de tool calling o de decodificación con razonamiento, y para docentes que quieran ilustrar el funcionamiento interno de un transformer causal sin depender de abstracciones de alto nivel como `transformers` o `trl`.

El repositorio ocupa 0,4 GB e incluye pesos en safetensors y ONNX. Los idiomas declarados son chino e inglés, y la licencia es Apache 2.0. No se han publicado resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso, alineado con la familia Qwen3 |
| Parametros totales | 63.912.192 (aproximadamente 64M) |
| Parametros activos | No aplica (variante densa; existe una variante MoE separada de 198M / A64M) |
| Longitud de contexto | no disponible (el proyecto soporta extrapolación RoPE mediante YaRN) |
| Tipos de cuantizacion | no disponible (compatible con llama.cpp, lo que habilita GGUF en varias precisiones) |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso de aproximadamente 64M de parámetros cuya estructura sigue la línea de Qwen3. El tokenizador se basa en BPE con ByteLevel e incorpora tokens reservados para las etiquetas `<tool_call>`, `<tool_response>` y `<think>`, además de un buffer de tokens para futuras extensiones. El proyecto del que deriva implementa desde cero en PyTorch nativo el preentrenamiento, el SFT, el ajuste LoRA, el RLHF con DPO, el RLAIF con PPO, GRPO y CISPO, el tool use y el agentic RL, sin recurrir a las capas de abstracción de `transformers`, `trl` o `peft`.

Los datos de entrenamiento proceden del dataset `jingyaogong/minimind_dataset`, que incluye los conjuntos `pretrain_t2t(_mini).jsonl`, `sft_t2t(_mini).jsonl`, `rlaif.jsonl`, `agent_rl.jsonl` y `agent_rl_math.jsonl`. La capacidad de tool calling está integrada directamente en los datos de SFT, de modo que el checkpoint `full_sft` ya incorpora llamadas a herramientas básicas. El modo de razonamiento se controla mediante la etiqueta `<think>` y el flag `open_thinking`, sin necesidad de un script de entrenamiento separado para razonamiento. El número exacto de tokens de entrenamiento no está disponible en la información proporcionada.

## Capacidades

- Generación de texto conversacional en chino e inglés.
- Razonamiento con cadena de pensamiento activable o desactivable mediante `open_thinking` y la etiqueta `<think>`.
- Tool calling y function calling nativos, con soporte para `<tool_call>` y `<tool_response>` en la plantilla de chat.
- Agentic RL: entrenamiento y ejecución de flujos multi-turno con uso de herramientas y razonamiento multi-paso.
- Soporte de API compatible con OpenAI (`reasoning_content`, `tool_calls`, `open_thinking`) mediante `serve_openai_api.py`.
- Capacidad de ajuste fino con LoRA y fusión posterior de pesos mediante `scripts/convert_model.py`.
- Compatibilidad con motores de inferencia como llama.cpp, vLLM y Ollama, y con frameworks de entrenamiento como Llama-Factory.
- Evaluación sobre conjuntos externos como C-Eval, C-MMLU y OpenBookQA.
- Extrapolación de longitud de contexto mediante YaRN sobre RoPE.

## Casos de uso

- Docencia y formación en LLM: el modelo permite recorrer el pipeline completo (tokenización, preentrenamiento, SFT, DPO, RLAIF) en una sola GPU de consumo, lo que lo hace idóneo para cursos prácticos donde los alumnos necesitan ver y modificar cada etapa del entrenamiento.
- Banco de pruebas de tool calling: al incorporar `<tool_call>` y `<tool_response>` en el tokenizador y en los datos de SFT, sirve para validar plantillas de funciones, parseo de argumentos y flujos de respuesta antes de migrar el diseño a un modelo mayor.
- Prototipado de agentes multi-paso: el script `train_agent.py` y los datos `agent_rl.jsonl` permiten experimentar con GRPO y CISPO en escenarios de uso repetido de herramientas sin incurrir en costes de cómputo elevados.
- Servicio de chat ligero autoalojado: mediante `serve_openai_api.py` se puede exponer un endpoint compatible con OpenAI y conectarlo a interfaces como Open-WebUI o FastGPT para demos internas o entornos de pruebas.
- Investigación sobre razonamiento adaptativo: el flag `open_thinking` permite comparar respuestas con y sin cadena de pensamiento sobre el mismo checkpoint, lo que facilita estudios sobre el impacto del razonamiento explícito en modelos pequeños.
- Evaluación comparativa de técnicas de alineación: al estar disponibles los scripts de DPO, PPO, GRPO y CISPO, se pueden reproducir experimentos controlados sobre el mismo dataset y medir diferencias de comportamiento entre métodos.
- Despliegue en dispositivos con recursos limitados: con 64M de parámetros y pesos en safetensors/ONNX, el modelo cabe en CPU y en GPUs de gama baja, lo que permite integrarlo en entornos embebidos o de escritorio para pruebas de latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (aproximadamente 256 MB de pesos), en torno a 130-150 MB en fp16 y por debajo de 100 MB en cuantizaciones de 4 bits. Cifras estimadas a partir de los 63,9M de parámetros; no confirmadas por el autor en la información disponible.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; el autor cita una RTX 3090 para el entrenamiento completo en unas 2 horas.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1050 en adelante) e incluso en CPU para inferencia.
- Opciones de despliegue: llama.cpp, vLLM, Ollama, `transformers`, el servidor propio `serve_openai_api.py` y la interfaz Streamlit `web_demo.py`.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MiniMind-3 (este modelo) | 63,9M | no disponible | Apache 2.0 | Hugging Face, ModelScope | Denso, alineado con Qwen3, tool calling y thinking |
| MiniMind-3-MoE | 198M / A64M | no disponible | Apache 2.0 | Hugging Face, ModelScope | Variante MoE sin shared expert |
| MiniMind2 | 104M | no disponible | Apache 2.0 | Hugging Face, ModelScope | Generación anterior del mismo proyecto |
| MiniMind2-small | 26M | no disponible | Apache 2.0 | Hugging Face, ModelScope | Versión reducida de la generación anterior |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de estos modelos entre sí ni con alternativas de otros proyectos.

## Limitaciones y advertencias

- Modelo de 64M de parámetros: la calidad de generación, el razonamiento y la fidelidad factual son limitados en comparación con LLMs de escala media o grande; no es adecuado para producción con requisitos de precisión.
- Riesgo elevado de alucinación y de respuestas incoherentes en dominios especializados o en preguntas que requieran conocimiento factual extenso.
- Cobertura lingüística restringida a chino e inglés; el rendimiento en castellano no está documentado y previsiblemente será deficiente.
- Longitud de contexto no especificada; aunque el proyecto soporta YaRN para extrapolación, no se han publicado valores concretos de ventana efectiva.
- El repositorio tiene un único descendiente y cero likes, lo que sugiere que es una réplica no oficial de los pesos de MiniMind; conviene verificar la integridad de los pesos frente al repositorio original de jingyaogong antes de usarlos en entornos reales.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo no está pensado para ello y no se han evaluado sesgos ni comportamientos en producción.
- El pipeline de Hugging Face no está disponible en la información proporcionada, por lo que la carga automática con `pipeline()` puede requerir configuración manual.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/onryzen5/test-m3
- Repositorio original del proyecto MiniMind: https://github.com/jingyaogong/minimind
- Colección MiniMind en Hugging Face: https://huggingface.co/collections/jingyaogong/minimind-66caf8d999f5c7fa64f399e5
- Versión multimodal MiniMind-V: https://github.com/jingyaogong/minimind-v
- Demo en ModelScope: https://www.modelscope.cn/studios/gongjy/MiniMind
- Perfil del autor original en ModelScope: https://www.modelscope.cn/profile/gongjy
- Vídeo de presentación: https://www.bilibili.com/video/BV12dHPeqE72
- Dataset de entrenamiento: https://huggingface.co/datasets/jingyaogong/minimind_dataset
