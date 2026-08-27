# ram-lexsi/aligntune-testrun-CounterFact-GRPO

## Resumen

Este repositorio contiene un adaptador LoRA de prueba (testrun) entrenado con el algoritmo `counterfact_grpo` sobre el modelo base Qwen/Qwen2.5-0.5B, utilizando la librería AlignTune de Lexsi Labs. AlignTune es un kit modular para fine-tuning de LLMs que soporta tanto SFT como métodos de aprendizaje por refuerzo (RL), y este artefacto concreto se generó con el backend TRL. El propósito del modelo es demostrar el flujo de entrenamiento con una variante de GRPO orientada a contrafactuales, probablemente para experimentos de alineación o corrección de sesgos.

Al tratarse de un adaptador LoRA, no es un modelo autónomo: debe cargarse sobre Qwen2.5-0.5B para funcionar. El modelo base tiene 0.5 mil millones de parámetros, una arquitectura transformer decoder-only y una ventana de contexto de 32 768 tokens (según la documentación oficial de Qwen, aunque no se confirma en la información proporcionada). Este testrun no incluye métricas de rendimiento ni detalles de entrenamiento, por lo que su valor principal es como ejemplo de uso de AlignTune y del algoritmo `counterfact_grpo`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-0.5B) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 0.5B) |
| Parametros activos | No disponible (adaptador LoRA) |
| Longitud de contexto | No disponible (el modelo base Qwen2.5-0.5B soporta 32 768 tokens, pero no se confirma en la informacion del adaptador) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (hereda los del modelo base, principalmente ingles y chino) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen2.5-0.5B, un modelo transformer decoder-only con normalización RMSNorm, atención con RoPE y activación SwiGLU. El entrenamiento se realizó con el algoritmo `counterfact_grpo`, una variante de GRPO (Group Relative Policy Optimization) que incorpora objetivos contrafactuales, probablemente diseñada para reducir sesgos o mejorar la robustez ante entradas hipotéticas. El backend utilizado fue TRL (Transformers Reinforcement Learning), integrado en AlignTune.

No se proporcionan detalles sobre el dataset de entrenamiento, el número de pasos, la tasa de aprendizaje ni el tamaño del adaptador (rango, alpha, etc.). Al ser un testrun, es probable que se haya usado un conjunto de datos pequeño y un entrenamiento breve para validar el pipeline. La ausencia de métricas impide evaluar la calidad del ajuste.

## Capacidades

- Generación de texto: hereda las capacidades básicas de Qwen2.5-0.5B, limitadas por su tamaño reducido.
- Razonamiento: capacidades limitadas, adecuadas para tareas simples de comprensión y respuesta.
- Multilingüismo: el modelo base soporta principalmente inglés y chino, aunque no se especifica para este adaptador.
- Sin soporte de tool calling, agentes ni visión: el modelo base de 0.5B no incluye estas funcionalidades.
- Sin modo de pensamiento explícito: no se menciona ninguna capacidad especial de razonamiento extendido.

## Casos de uso

- Investigación en alineación: el adaptador sirve como banco de pruebas para evaluar el efecto del algoritmo `counterfact_grpo` en la reducción de sesgos o en la respuesta a escenarios contrafactuales.
- Experimentación con AlignTune: permite a desarrolladores validar el flujo de entrenamiento de la librería antes de aplicarlo a modelos más grandes.
- Prototipado rápido: al ser un modelo pequeño, es útil para pruebas de concepto en entornos con recursos limitados.
- Educación y formación: puede utilizarse en cursos o talleres para ilustrar el fine-tuning con RL y el uso de adaptadores LoRA.
- Comparación de algoritmos: sirve como referencia para comparar `counterfact_grpo` con otros métodos de RL como PPO o GRPO estándar.
- Desarrollo de chatbots simples: aunque limitado, puede integrarse en aplicaciones de demostración que requieran respuestas cortas y no críticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este adaptador.

## Requisitos de hardware

- Al ser un adaptador LoRA sobre un modelo de 0.5B, los requisitos son mínimos. Puede ejecutarse en CPU con memoria RAM suficiente (aproximadamente 2-4 GB) o en cualquier GPU con al menos 4 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna (por ejemplo, NVIDIA GTX 1060, RTX 2060 o superior) puede manejar la inferencia sin problemas.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con `AutoPeftModelForCausalLM` de transformers, o exportar a GGUF para usarlo con llama.cpp u Ollama, aunque no se proporcionan conversiones.
- Latencia y throughput: no disponibles, pero al ser un modelo pequeño, la generación es rápida incluso en CPU.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros adaptadores o modelos de la misma categoría. El adaptador depende completamente del modelo base Qwen2.5-0.5B, y no hay datos de rendimiento que permitan contrastarlo con alternativas como adaptadores sobre Llama-3.2-1B o Gemma-2-2B.

## Limitaciones y advertencias

- Es un adaptador de prueba (testrun), no un modelo listo para producción. Su calidad y robustez no están validadas.
- Depende del modelo base Qwen2.5-0.5B, que tiene capacidades limitadas y puede presentar sesgos y alucinaciones propias de modelos pequeños.
- La licencia no está especificada, por lo que no se puede garantizar su uso comercial sin verificación previa.
- No se conocen los datos de entrenamiento ni el proceso de filtrado, lo que aumenta el riesgo de comportamientos indeseados.
- El algoritmo `counterfact_grpo` es experimental; su efectividad no está documentada en este repositorio.
- Al ser un adaptador LoRA, requiere cargar el modelo base por separado, lo que añade complejidad de integración.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ram-lexsi/aligntune-testrun-CounterFact-GRPO
- AlignTune en GitHub: https://github.com/Lexsi-Labs/aligntune
- Sitio web de AlignTune: https://aligntune.lexsi.ai/
- Lexsi Labs: https://lexsi.ai/
