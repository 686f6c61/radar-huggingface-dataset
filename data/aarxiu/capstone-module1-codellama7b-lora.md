# Aarxiu/capstone-module1-codellama7b-lora

## Resumen

Aarxiu/capstone-module1-codellama7b-lora es un adaptador LoRA (Low-Rank Adaptation) construido sobre el modelo base codellama/CodeLlama-7b-Instruct-hf, publicado por el usuario Aarxiu como parte de un proyecto capstone de módulo 1. El modelo está orientado a generación de texto y tareas conversacionales, aprovechando las capacidades de Code Llama 7B Instruct para síntesis, comprensión y razonamiento sobre código fuente.

El repositorio tiene un tamaño de 19,2 GB, un volumen inusualmente grande para un adaptador LoRA típico (que suele ocupar entre 100 y 500 MB), lo que sugiere que podría contener los pesos del modelo base fusionados con el adaptador o el modelo completo. Está etiquetado con la librería PEFT 0.19.1 y utiliza el formato safetensors. La model card no proporciona información sobre licencia, idiomas, datos de entrenamiento, hiperparámetros ni evaluación, por lo que su utilidad práctica queda limitada sin documentación adicional.

La relevancia de este modelo reside en ejemplificar el flujo de fine-tuning con LoRA sobre un modelo de código de 7.000 millones de parámetros, aunque la ausencia de benchmarks y detalles de entrenamiento impide validar su rendimiento en tareas concretas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: Code Llama 7B Instruct) |
| Parametros totales | 7B (modelo base) + adaptadores LoRA (dimension no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 16.384 tokens (Code Llama 7B) |
| Tipos de cuantizacion | safetensors (fp16); cuantizaciones adicionales no documentadas |
| Idiomas soportados | No disponibles (Code Llama base: principalmente ingles y codigo) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base, Code Llama 7B Instruct, es un transformer decoder-only con 7.000 millones de parámetros, basado en la arquitectura Llama 2. Code Llama fue preentrenado con 500.000 millones de tokens de código y datos relacionados, e incorpora soporte para relleno (infilling) de código y una ventana de contexto ampliada a 16K tokens mediante escalado posicional RoPE. La variante Instruct fue afinada con instrucciones para mejorar el seguimiento de comandos y el comportamiento conversacional.

El adaptador LoRA de este repositorio se entrena sobre dicha base, pero no se proporcionan detalles sobre el dataset de entrenamiento, el número de pasos, la tasa de aprendizaje, el rango del adaptador ni el régimen de entrenamiento. La única referencia técnica es el uso de PEFT 0.19.1 y el tag arxiv:1910.09700, que corresponde al artículo original de LoRA (Hu et al., 2021).

## Capacidades

- Generación de texto y código: hereda las capacidades de Code Llama 7B Instruct para síntesis, completado y explicación de código.
- Conversación multi-turno: al ser la variante Instruct, soporta diálogos con instrucciones y preguntas sobre código.
- Relleno de código (infilling): el modelo base soporta completar código en medio de un fragmento, aunque el adaptador podría alterar este comportamiento.
- Razonamiento sobre código: puede explicar, depurar y refactorizar fragmentos de código en múltiples lenguajes (Python, Java, C++, entre otros).
- Tool calling: no documentado para este adaptador; el modelo base Code Llama no incluye soporte nativo de function calling.
- Capacidades multilingües: limitadas; Code Llama está optimizado para código y texto en inglés.

## Casos de uso

- Asistente de programación educativo: el modelo puede responder preguntas sobre código y explicar conceptos de programación en un entorno de tutoría, aprovechando su naturaleza Instruct para mantener conversaciones coherentes.
- Generación de documentación técnica: dado un fragmento de código, puede generar comentarios, docstrings y documentación explicativa, útil para equipos que mantienen repositorios con poca cobertura documental.
- Prototipado rápido de scripts: los desarrolladores pueden usarlo para generar esqueletos de funciones o scripts en Python, Java o C++, acelerando la fase inicial de desarrollo.
- Depuración asistida: puede analizar errores comunes en código fuente y sugerir correcciones, integrándose en flujos de revisión manual.
- Fine-tuning adicional: al ser un adaptador LoRA, sirve como punto de partida para nuevos fine-tunes con PEFT sobre Code Llama, permitiendo iterar sobre dominios específicos.
- Evaluación académica: útil como caso de estudio para entender el flujo de adaptación LoRA sobre modelos de código en un proyecto capstone, documentando el proceso completo de fine-tuning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este adaptador específico en la información disponible.

El modelo base Code Llama alcanza puntuaciones de hasta 67% en HumanEval y 65% en MBPP según el artículo original, pero estos valores corresponden a las mejores variantes del conjunto y no a este fine-tune concreto. Se recomienda evaluar el adaptador en tareas específicas antes de usarlo en producción.

## Requisitos de hardware

- VRAM estimada: ~14 GB en fp16, ~7 GB en int8, ~4 GB en int4 para el modelo de 7B (estimaciones estándar para esta arquitectura).
- GPU recomendadas: RTX 3090/4090 (24 GB), A100 (40/80 GB), H100; cabe en GPUs de consumo con 16 GB o más de VRAM.
- Compatibilidad con consumer GPU: sí, en RTX 3090, 4090 o similares con suficiente VRAM.
- Opciones de despliegue: vLLM, llama.cpp (previa conversión a GGUF), Ollama, Hugging Face TGI, transformers con PEFT.
- Latencia y throughput: no disponibles para este adaptador; el modelo base de 7B en fp16 suele generar entre 20-40 tokens/s en una RTX 4090, pero estos valores son orientativos y no verificados para este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Code Llama 7B Instruct (base) | 7B | 16K | Hasta 67% (mejor variante) | Llama 2 license | HuggingFace |
| Code Llama 13B Instruct | 13B | 16K | Hasta 67% (mejor variante) | Llama 2 license | HuggingFace |
| Code Llama 34B Instruct | 34B | 16K | Hasta 67% (mejor variante) | Llama 2 license | HuggingFace |
| Este adaptador LoRA | 7B + LoRA | 16K | No disponible | No disponible | HuggingFace |

Nota: los datos de HumanEval corresponden al artículo original de Code Llama y representan el máximo entre todas las variantes, no el rendimiento de este adaptador.

## Limitaciones y advertencias

- La model card no proporciona información sobre sesgos, datos de entrenamiento ni evaluación, lo que impide conocer las limitaciones específicas del adaptador.
- Riesgo de alucinación: al ser un modelo de generación, puede producir código incorrecto o respuestas inventadas, especialmente en contextos fuera de su dominio de entrenamiento.
- Licencia no especificada: el uso comercial puede estar restringido por la licencia del modelo base Code Llama (Llama 2 license) y por la ausencia de licencia declarada en el adaptador.
- El tamaño del repositorio (19,2 GB) sugiere que puede contener pesos fusionados o el modelo completo; verificar antes de descargar si se necesita únicamente el adaptador LoRA.
- Sin benchmarks publicados: no hay evidencia de rendimiento para este fine-tune concreto.
- Idiomas limitados: optimizado para código e inglés; puede fallar en otros idiomas.
- Sin soporte documentado de tool calling ni capacidades de agente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Aarxiu/capstone-module1-codellama7b-lora
- Artículo de Code Llama (HTML): https://arxiv.org/html/2308.12950
- Artículo de Code Llama (PDF): https://arxiv.org/pdf/2308.12950v2
- Artículo original de LoRA: https://arxiv.org/abs/1910.09700
- Repositorio de Code Llama 7B en GitHub: https://github.com/inferless/codellama-7b
