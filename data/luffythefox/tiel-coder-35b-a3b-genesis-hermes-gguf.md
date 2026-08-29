# LuffyTheFox/Tiel-Coder-35B-A3B-Genesis-Hermes-GGUF

## Resumen

Tiel-Coder-35B-A3B-Genesis-Hermes-GGUF es un modelo de lenguaje multimodal (texto e imagen) desarrollado por LuffyTheFox, que combina una arquitectura MoE híbrida basada en Qwen3.6 con un proceso de reparación de tensores denominado Genesis. El modelo se distribuye en formato GGUF, listo para su uso con llama.cpp y otros runtimes compatibles.

El modelo parte de la base peculiar-ragdoll/Tiel-Coder-35B-A3B-GGUF, a la que se le ha transferido un finetune de Hermes (function calling y agente) procedente de DJLougen/hermes-qwen3.5-35b-a3b-GGUF. Posteriormente, el autor aplica el algoritmo Genesis, que reduce el ruido en los tensores mediante técnicas estadísticas (distribución de Marchenko-Pastur y SVD), con el objetivo de mejorar la estabilidad y la fidelidad de las respuestas sin necesidad de reentrenamiento.

Con 35 000 millones de parámetros totales y aproximadamente 3 000 millones activos por paso, presenta una ventana de contexto nativa de 262 000 tokens (ampliable a 1 000 000 con YaRN) y capacidades multimodales. Su licencia MIT permite uso comercial sin restricciones. Es relevante para desarrolladores que buscan un modelo agéntico, eficiente en cómputo y con soporte de visión en entornos locales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE híbrida: Gated DeltaNet (atención lineal) + softmax attention (proporción 3:1), 40 capas en patrón 10 × (3 × DeltaNet-MoE + 1 × Attention-MoE) |
| Parámetros totales | 34 660 610 688 (≈ 34,66 mil millones) |
| Parámetros activos | ≈ 3 mil millones por token (256 expertos, 8 enrutados + 1 compartido) |
| Longitud de contexto | 262 000 tokens nativos (ampliable a 1 000 000 con YaRN) |
| Tipos de cuantización | No se especifican; se recomienda APEX (disponibles en el repositorio) |
| Idiomas soportados | Inglés, chino, multilingüe |
| Licencia | MIT |
| Formato de pesos | GGUF (con safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura MoE (Mixture of Experts) híbrida que combina atención lineal Gated DeltaNet con atención softmax completa en una proporción 3:1. Esta configuración, heredada de la familia Qwen3.6, busca un equilibrio entre eficiencia computacional y capacidad de modelado de dependencias de largo alcance. Con 256 expertos y 8 enrutados más 1 compartido por token, solo se activan aproximadamente 3 mil millones de parámetros por paso, lo que reduce notablemente los requisitos de cómputo en inferencia.

El entrenamiento se basa en la transferencia de un finetune de Hermes (dataset NousResearch/hermes-function-calling-v1) sobre la base peculiar-ragdoll/Tiel-Coder-35B-A3B-GGUF. El autor transfirió alrededor de 2 000 bloques de dos tensores expertos FFN desde el finetune de Hermes a la base, y posteriormente aplicó el algoritmo Genesis. Este algoritmo, desarrollado por LuffyTheFox, repara el ruido acumulado en los tensores mediante tres etapas: escaneo de tensores de convolución (ssm_conv1d) para reequilibrar cabezas, reparación de bloques cero mediante comparación de distribución de pesos, y reducción de ruido de entrenamiento mediante SVD basado en la distribución de Marchenko-Pastur, preservando el 99 % de la señal y el gradiente aprendido. No se han publicado detalles sobre el volumen total de datos de entrenamiento ni sobre el uso de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento complejo en inglés, chino y otros idiomas.
- Soporte de tool calling y function calling, gracias al dataset Hermes de función de llamada.
- Capacidad de agentes y razonamiento multi-paso, con modo de pensamiento recomendado para tareas de codificación.
- Procesamiento multimodal: entrada de texto e imagen (requiere el archivo mmproj junto al GGUF).
- Eficiencia token: al ser MoE con pocos parámetros activos, reduce el coste por token.
- Compatible con llama.cpp, LM Studio, koboldcpp y otros runtimes GGUF.
- Ventana de contexto larga (262K nativa) que permite manejar documentos extensos o conversaciones de muchos turnos.

## Casos de uso

- Asistente de codificación en producción: con soporte de tool calling y modo de pensamiento, puede integrarse en pipelines de CI/CD para generar, revisar o documentar código. Su eficiencia MoE permite ejecutarlo en GPUs de consumo.
- Atención al cliente automatizada: gracias a su ventana de contexto de 262K tokens y su capacidad multilingüe, puede gestionar conversaciones multi-turno largas con historial completo, reduciendo el riesgo de perder información relevante.
- Análisis de documentos extensos: su contexto nativo permite procesar manuales técnicos, informes o contratos completos sin necesidad de truncar el texto, extrayendo resúmenes o respondiendo preguntas específicas.
- Agente autónomo con visión: al ser multimodal, puede recibir capturas de pantalla o imágenes de diagramas y combinarlas con instrucciones de texto para ejecutar tareas de interfaz o análisis visual.
- Generación de contenido creativo: en modo no pensante, con temperatura 0.7, produce textos narrativos o marketing con un estilo natural, aprovechando la reparación de tensores para reducir repeticiones y alucinaciones.
- Desarrollo de chatbots especializados: su licencia MIT permite integrarlo en productos comerciales sin coste de licencia, y su formato GGUF facilita el despliegue en entornos edge o servidores con llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos objetivos sobre MMLU, HumanEval, GSM8K u otras pruebas estandarizadas para este modelo concreto.

## Requisitos de hardware

- El repositorio ocupa 55,9 GB, lo que sugiere que incluye múltiples cuantizaciones. Para la cuantización APEX recomendada, se estima un uso de VRAM en torno a 20-25 GB, dependiendo de la precisión de las cachés K/V.
- Se recomienda una GPU con al menos 24 GB de VRAM para la cuantización APEX (por ejemplo, RTX 3090, RTX 4090, A5000). Para cuantizaciones más agresivas (Q4_K_M), podría caber en 16 GB, pero no se confirma.
- Al ser MoE con solo ~3B parámetros activos, el requisito de cómputo por token es bajo, pero la memoria necesaria para cargar todos los pesos es la del modelo completo.
- Opciones de despliegue: llama.cpp (con la flag --jinja para el chat template), LM Studio, koboldcpp, Ollama (si se convierte), vLLM (con soporte GGUF experimental) y TGI (con adaptadores).
- Se recomienda forzar 40 capas MoE a CPU y usar cachés K/V en F16 para optimizar el rendimiento, según las instrucciones del autor.
- Latencia y throughput: no se han publicado mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Tiel-Coder-35B-A3B-Genesis-Hermes | 34,66B | ~3B | 262K | MIT | GGUF |
| Qwen3-30B-A3B | 30,5B | ~3B | 256K | Apache 2.0 | safetensors, GGUF |
| DeepSeek-V2-Lite | 16B | 2,4B | 128K | MIT | safetensors, GGUF |
| Ornith-1.5-35B-A3B (base) | 34,66B | ~3B | 262K | MIT | safetensors |

Nota: no se dispone de resultados de benchmarks comparativos. La comparación se basa en especificaciones declaradas.

## Limitaciones y advertencias

- El proceso Genesis es una técnica experimental de reparación de tensores que no cuenta con validación académica formal; su efectividad no está garantizada.
- No se han publicado resultados de benchmarks objetivos, por lo que el rendimiento real en tareas estándar es desconocido.
- El modelo puede presentar sesgos inherentes a los datos de entrenamiento (Qwen3.6 y finetune de Hermes), especialmente en contextos multilingües.
- Riesgo de alucinación en tareas de razonamiento complejo, aunque el autor afirma que Genesis lo reduce, no hay evidencia empírica.
- La ventana de contexto de 262K es nativa, pero el uso de YaRN para extenderla a 1M puede degradar la calidad si no se configuran correctamente los parámetros.
- Para usar la capacidad de visión es necesario descargar el archivo mmproj adicional; sin él, el modelo solo procesa texto.
- La licencia MIT permite uso comercial, pero el modelo base (Qwen3.6) puede tener restricciones adicionales; se recomienda verificar la licencia del modelo original.
- El autor recomienda mantener al menos 128K de contexto para preservar las capacidades de pensamiento; contextos más cortos pueden degradar el rendimiento.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/LuffyTheFox/Tiel-Coder-35B-A3B-Genesis-Hermes-GGUF)
- [Modelo base original (HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive)](https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive)
- [Script de cuantización con perfiles Unsloth](https://pastebin.com/hXhcMJn9)
- [Comunidad Discord](https://discord.gg/SZ5vacTXYf)
- [Base peculiar-ragdoll/Tiel-Coder-35B-A3B-GGUF](https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-GGUF)
- [Finetune DJLougen/hermes-qwen3.5-35b-a3b-GGUF](https://huggingface.co/DJLougen/hermes-qwen3.5-35b-a3b-GGUF)
