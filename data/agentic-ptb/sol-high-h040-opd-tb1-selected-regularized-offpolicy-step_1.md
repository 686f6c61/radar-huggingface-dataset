# agentic-ptb/sol-high.h040.opd-tb1-selected-regularized-offpolicy.step_1

## Resumen

El modelo `agentic-ptb/sol-high.h040.opd-tb1-selected-regularized-offpolicy.step_1` es un checkpoint intermedio de un experimento de entrenamiento para agentes de IA, desarrollado por el equipo `agentic-ptb` dentro del marco **AgentPTB** (Agentic Policy Training Benchmark). Se trata de un fine-tuning sobre el modelo base **Qwen/Qwen3.5-9B-Base**, con 9.409.813.744 parámetros (aproximadamente 9.4B), y se presenta como el mejor checkpoint del barrido (sweep) `sol-high` según la propia model card. El identificador del repositorio codifica el momento del entrenamiento: `h040` indica que fue escrito a las 40,32 horas de un run de 100 horas, lo que lo convierte en un **checkpoint intermedio**, no en un modelo final.

El modelo está orientado a técnicas de **destilación on-policy (OPD)** y a escenarios de razonamiento con herramientas (tool-integrated reasoning, TIR), según los resultados de búsqueda relacionados. Su relevancia radica en ser un ejemplo de checkpoint intermedio de un sweep de entrenamiento para agentes, donde la evaluación de rendimiento debe interpretarse con cautela porque el entrenamiento aún no ha convergido. La licencia y los idiomas no están especificados en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors originales) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18.8 GB) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de Qwen3.5-9B-Base, un transformer decoder-only con aproximadamente 9,4B parámetros. El entrenamiento se enmarca en el proyecto **AgentPTB**, que emplea técnicas de **destilación on-policy (OPD)** para mejorar el razonamiento agéntico en entornos multi-turno con herramientas. La model card indica que el driver del entrenamiento fue Codex / gpt-5.6-sol con esfuerzo de razonamiento `high`, y que el checkpoint es un paso intermedio de un barrido de 100 horas. No se especifican detalles sobre el dataset de entrenamiento, la composición de tokens ni si se utilizó RLHF o DPO.

El repositorio contiene 4 shards de pesos en formato safetensors, con un tamaño total de 18.8 GB. La model card también indica que el `eos_token_id` es `[248044, 248046]`, donde `248046` corresponde a `<|im_end|>`, el token de fin de turno de la plantilla de chat de Qwen3.5. Esto es relevante para la evaluación: checkpoints sin este token no detienen la generación y pueden desbordar la ventana de contexto.

## Capacidades

Las capacidades específicas de este checkpoint no están documentadas en la información proporcionada. Sin embargo, por su base Qwen3.5-9B-Base y su entrenamiento orientado a agentes, se pueden inferir capacidades generales heredadas, aunque no verificadas:

- Generación de texto y razonamiento en lenguaje natural (heredado del modelo base).
- Soporte de razonamiento multi-turno y uso de herramientas (tool calling) probablemente, dado el contexto de OPD para agentes.
- Posible soporte de lenguajes múltiples, dependiendo del modelo base, pero no confirmado.
- No se ha confirmado soporte de visión, audio u otras modalidades.

## Casos de uso

Dado que es un checkpoint intermedio de un sweep de entrenamiento, su uso principal es **investigación y análisis** más que producción. Casos concretos:

- **Evaluación de la curva de aprendizaje**: este checkpoint puede usarse para trazar la evolución del rendimiento durante el entrenamiento, comparando con checkpoints posteriores del mismo sweep.
- **Análisis de la calidad de la destilación on-policy**: permite estudiar cómo evoluciona la capacidad de razonamiento agéntico con el número de horas de entrenamiento.
- **Depuración de errores de entrenamiento**: al ser un checkpoint intermedio, puede servir para identificar problemas de convergencia o de alineación de tokens (por ejemplo, el correcto uso del token `<|im_end|>`).
- **Pruebas de integración con frameworks de agentes**: para validar si el modelo responde correctamente a llamadas a herramientas en entornos controlados.
- **Comparación de estrategias de regularización**: el nombre incluye `regularized-offpolicy`, lo que permite estudiar el efecto de la regularización en el rendimiento intermedio.
- **Reentrenamiento o fine-tuning adicional**: como punto de partida para experimentos de continuación de entrenamiento o para aplicar técnicas de post-procesado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación (MMLU, HumanEval, GSM8K, etc.), y tampoco se encontraron datos en la búsqueda web. Por tanto, no es posible comparar cuantitativamente el rendimiento del modelo con otras alternativas.

## Requisitos de hardware

No se dispone de datos concretos de requisitos de hardware del modelo. Sin embargo, para un modelo de 9,4B parámetros en formato safetensors, se pueden hacer estimaciones razonables:

- **VRAM estimada para inferencia**: con cuantización de 16 bits (BF16), se necesitan aproximadamente 19 GB de VRAM; con cuantización de 8 bits (INT8) se reduce a ~9,5 GB; con cuantización de 4 bits (INT4) ~5 GB.
- **GPU recomendadas**: una GPU con al menos 24 GB de VRAM (RTX 3090, RTX 4090, A10G) para BF16; para INT4, una GPU de 8-12 GB (RTX 3080, RTX 4070) es suficiente.
- **Compatibilidad con consumer GPU**: sí, con cuantización adecuada (INT4/INT8) puede ejecutarse en GPUs de consumo, aunque el rendimiento puede verse limitado.
- **Opciones de despliegue**: vLLM, llama.cpp, Ollama, TGI, entre otros, siempre que se conviertan los pesos a formatos compatibles (GGUF, etc.). No se ha confirmado compatibilidad con estos frameworks en la información disponible.
- **Latencia y throughput**: no se han publicado datos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (checkpoints intermedios de sweeps de entrenamiento agéntico). El modelo base Qwen3.5-9B-Base tiene alternativas como Llama-3.1-8B o Mistral-7B, pero no hay datos de rendimiento de este checkpoint para comparar. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- **Checkpoint intermedio**: no es un modelo final; el entrenamiento no ha convergido, por lo que su rendimiento puede ser inferior al del modelo final del sweep.
- **Sesgos y alucinación**: no se han evaluado sesgos específicos; como todo LLM, puede generar información falsa o alucinaciones.
- **Contexto y idiomas**: no se dispone de información sobre la longitud de contexto ni los idiomas soportados, lo que limita su uso en aplicaciones multilingües o de contexto largo.
- **Licencia**: no se ha publicado licencia, por lo que su uso comercial es incierto y se debe consultar al autor.
- **Riesgo de sobre-optimización**: el entrenamiento con OPD puede sobre-ajustar al estilo de los datos de entrenamiento, lo que puede afectar la generalización.
- **Formato de pesos**: solo safetensors, sin cuantizaciones oficiales, lo que limita la inferencia en hardware de baja VRAM hasta que se realicen conversiones.

## Enlaces

- [Repositorio en HuggingFace](https://huggingface.co/agentic-ptb/sol-high.h040.opd-tb1-selected-regularized-offpolicy.step_1)
- [Paper: Self-Distilled Agentic Reinforcement Learning (arXiv)](https://arxiv.org/html/2605.15155)
- [Repositorio EasyOPD - experiments/02_agentic_opd](https://github.com/lds-ustc/EasyOPD/blob/main/experiments/02_agentic_opd/README.md)
- [Colección de papers sobre on-policy distillation](https://github.com/chrisliu298/awesome-on-policy-distillation)
- [Definición de agentic AI (agentic.ai)](https://agentic.ai/what-is-agentic-ai)
