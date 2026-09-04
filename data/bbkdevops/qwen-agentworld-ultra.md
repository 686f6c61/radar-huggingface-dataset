# bbkdevops/Qwen-AgentWorld-ULTRA

## Resumen

Qwen-AgentWorld-ULTRA es un modelo de mundo en lenguaje nativo ("native language world model") desarrollado por bbkdevops y publicado en HuggingFace. Se trata de un finetune no oficial sobre la base Qwen3.8-27B-TurboFCFusion, un modelo de la familia Qwen con arquitectura híbrida. Su función es simular entornos agénticos completos —observaciones, acciones, herramientas, recompensas y condiciones de finalización— como texto, de modo que un agente pueda entrenarse o evaluarse sin ejecutar el entorno real. El modelo tiene 27.320.697.856 parámetros, una ventana de contexto de 262.144 tokens y se distribuye en formato GGUF cuantizado a IQ4_NL.

La relevancia actual del modelo radica en el auge de los agentes de IA: permite generar trayectorias sintéticas, probar planes mediante búsqueda (MCTS, Best-of-N) y aplicar entrenamiento de estilo Dreamer, reduciendo el coste de ejecutar entornos reales como WebShop, ALFWorld, OSWorld, CodeEnv, ToolEnv o TextGame. Su arquitectura híbrida combina atención completa en bloques intercalados con capas Mamba2 SSM, lo que le permite manejar secuencias largas de interacción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 híbrida: atención completa cada 4 bloques + Mamba2 SSM; 65 bloques; d=5120; FFN=17408; 24H/4KV; 65 capas; RoPE 10M; MTP next-n=1 |
| Parametros totales | 27.320.697.856 |
| Parametros activos | No disponible |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | GGUF IQ4_NL (16,5 GB) |
| Idiomas soportados | No disponible (la documentación menciona prompts en tailandés e inglés) |
| Licencia | No disponible |
| Formato de pesos | GGUF IQ4_NL; safetensors (según metadatos del repositorio) |

## Arquitectura y entrenamiento

La arquitectura del modelo se describe como híbrida Qwen3.5: cada cuarto bloque utiliza atención completa y el resto son bloques Mamba2 SSM, una combinación habitual en modelos de secuencias largas. El README indica que se ejecuta en la arquitectura `qwen35` (GGUFv3, archivo `qwen35 arch`). Tiene 65 bloques, una dimensión de modelo de 5120, una FFN de 17408, 24H/4KV, y usa rotaciones RoPE con frecuencia de 10M, además de multi-token prediction (`MTP next-n=1`) para decodificación especulativa.

No se proporcionan datos sobre la composición del dataset de entrenamiento, el número de tokens ni si se aplicaron técnicas de alineación (RLHF, DPO). Tampoco se menciona el proceso de finetuning más allá del nombre de archivo de base. La innovación destacable no es el entrenamiento sino la interfaz: el modelo está diseñado para consumir un contrato de prompt que incluye instrucciones de simulación, especificación del entorno, historial, observación actual y acción, y devuelve JSON estricto con `next_observation`, `reward`, `done`, `info` y `thought`. Esto lo convierte en un simulador de entornos expresado completamente en lenguaje natural.

## Capacidades

- Simulación de entornos agénticos a partir de observación + acción + historial, devolviendo la siguiente observación, recompensa, indicador de fin e información detallada en JSON.
- Razonamiento de cadena de pensamiento larga (long chain-of-thought) a través de siete dominios unificados: MCP, Search, Terminal, SWE, Android, Web y OS.
- Soporte de "dream training" estilo Dreamer: permite hacer rollout dentro del modelo simulado antes de desplegar el agente en el mundo real.
- Planificación y búsqueda: puede usarse como simulador para MCTS o Best-of-N sampling.
- Síntesis de datos: genera trayectorias sintéticas para fine-tuning con SFT o RL.
- Interfaz OpenAI-compatible para servidor y cliente, según la estructura del repositorio del autor.
- Tool use simulado: el manejo de llamadas a herramientas forma parte de la serialización textual del entorno, sin necesidad de ejecutar las herramientas reales.

## Casos de uso

- Entrenamiento de agentes sin entorno real: se puede entrenar un agente sobre WebShop, ALFWorld, OSWorld o CodeEnv usando las predicciones del modelo como si fueran el entorno, eliminando la necesidad de lanzar simuladores costosos.
- Evaluación de agentes en entornos no disponibles: para probar un agente en entornos de OS, Android, web o MCP sin acceso real, el modelo puede generar recompensas y estados sintéticos.
- Dream training (Dreamer-style): un agente puede explorar trayectorias en el "sueño" del modelo con la función `step`, acumulando experiencia sintética que luego se transfiere al entorno real.
- Planificación con MCTS o Best-of-N: el modelo funciona como un simulador forward para evaluar ramas de decisión, eligiendo la acción con mejor resultado proyectado.
- Síntesis de datos para SFT/RL: se generan secuencias de interacción completas, incluyendo pensamiento del modelo, que pueden usarse para alinear otros agentes pequeños.
- Pruebas de tool calling en desarrollo: se pueden simular respuestas de herramientas y APIs antes de integraciones reales, reduciendo costes de integración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El README incluye una sección de evaluación y en HuggingFace aparece la etiqueta `eval-results`, pero no se proporcionan cifras concretas en el modelo card. Por tanto, no se puede contrastar su rendimiento con modelos similares.

## Requisitos de hardware

- VRAM estimada: el modelo viene cuantizado en GGUF IQ4_NL con 16,5 GB de peso, lo que permite inferencia completa en una GPU consumer de 24 GB (RTX 3090) con `n_gpu_layers=-1` (offload total).
- GPU recomendadas: RTX 3090 (verificada), RTX 4090 24 GB, A100 40/80 GB, H100. En GPUs de menos de 24 GB se necesita offload parcial y límite de contexto reducido (por ejemplo, 32.768 tokens como en el quickstart).
- Despliegue: compatible con `llama-cpp-python` (compilación cuBLAS/CUDA 12.6), `Ollama` mediante un `Modelfile` incluido, y un servidor OpenAI-compatible propio (`inference/`). También puede usarse con HuggingFace Transformers si se dispone de los pesos en formato safetensors.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información suficiente sobre modelos comparables en la documentación. Dado que es un finetune no oficial de base Qwen3.8-27B, resultaría razonable compararlo con el modelo base o con otros world models, pero no hay datos de rendimiento que permitan una comparación rigurosa. Por tanto, se indica "no disponible".

## Limitaciones y advertencias

- La licencia no está especificada, lo que genera incertidumbre sobre el uso comercial y la redistribución.
- El autor es bbkdevops y el modelo no está publicado por el equipo oficial de QwenLM, a pesar de que existe un repositorio oficial de Qwen-AgentWorld en GitHub. Los pesos de HuggingFace no tienen respaldo oficial.
- Los prompts de la documentación están en tailandés e inglés; no hay lista oficial de idiomas soportados ni garantía de buen comportamiento en castellano.
- La cuantización IQ4_NL puede degradar el rendimiento respecto a pesos completos, especialmente en tareas de razonamiento complejas.
- Al ser un modelo de simulación, las observaciones generadas pueden ser plausibles pero incorrectas: existe riesgo de alucinación sobre el estado real del entorno.
- Dependencia de la serialización textual: los entornos no se representan mediante APIs o estructuras de datos, sino como texto, lo que puede perder información o introducir sesgos en la simulación.
- No se han publicado benchmarks, por lo que la calidad de la simulación no está validada externamente.

## Enlaces

- https://huggingface.co/bbkdevops/Qwen-AgentWorld-ULTRA
- https://github.com/QwenLM/Qwen-AgentWorld (repositorio oficial según resultados de búsqueda)
- https://github.com/btekmen/qwen-agentworld (repositorio alternativo)
