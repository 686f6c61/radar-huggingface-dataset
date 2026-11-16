# PRB1/Qwen2.5-Coder-7B-ManimCE-SFT-16bit

## Resumen

PRB1/Qwen2.5-Coder-7B-ManimCE-SFT-16bit es un adaptador LoRA (PEFT) publicado por el usuario PRB1 en Hugging Face, construido sobre el modelo base Qwen/Qwen2.5-Coder-7B-Instruct. El repositorio contiene únicamente los pesos del adaptador en formato safetensors (2,0 GB), no un modelo completo, y está etiquetado como `text-generation` con `library_name: peft`. La nomenclatura sugiere un ajuste supervisado (SFT) orientado a la generación de animaciones con Manim CE, aunque la model card no lo documenta explícitamente.

El modelo hereda la arquitectura del Qwen2.5-Coder-7B-Instruct original: un transformer decoder-only de 7 mil millones de parámetros, especializado en código y con soporte de instrucciones. Al tratarse de un adaptador LoRA, su uso requiere cargar el modelo base y aplicar el adaptador mediante la librería PEFT.

La relevancia de esta ficha es limitada: el repositorio no presenta descargas ni likes, la model card es la plantilla por defecto de Hugging Face sin rellenar, y no se dispone de información sobre datos de entrenamiento, hiperparámetros, evaluación ni licencia. Se trata, por tanto, de un artefacto experimental o de uso personal más que de un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-Coder-7B-Instruct); adaptador LoRA |
| Parámetros totales | 7B en el modelo base; tamaño del adaptador no disponible (repo de 2,0 GB) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base Qwen2.5-Coder-7B-Instruct soporta hasta 32 768 tokens, dato no confirmado en este repo) |
| Tipos de cuantización | No disponible; el sufijo "16bit" sugiere pesos en FP16/BF16 para el adaptador |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA sobre Qwen2.5-Coder-7B-Instruct, un transformer decoder-only de 7B parámetros con atención causal estándar. El adaptador se distribuye en formato PEFT 0.21.2 y se aplica sobre las capas del modelo base; no se incluyen los pesos completos del modelo, por lo que es imprescindible descargar Qwen/Qwen2.5-Coder-7B-Instruct para su uso.

No se dispone de información sobre el conjunto de datos de entrenamiento, el número de tokens, la composición del dataset, la existencia de RLHF/DPO ni los hiperparámetros del SFT. El nombre "ManimCE-SFT" sugiere un ajuste supervisado sobre ejemplos de código Manim Community Edition, pero esta hipótesis no está confirmada por la model card, que permanece como plantilla sin completar. Tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto y código: hereda las capacidades del modelo base Qwen2.5-Coder-7B-Instruct, orientado a tareas de programación.
- Razonamiento y matemáticas: presumiblemente conservadas del modelo base, aunque no verificadas en este adaptador.
- Tool calling / function calling: no documentado en este repositorio; el modelo base lo soporta, pero no se confirma que el adaptador lo preserve.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (thinking mode, visión, audio): no documentadas.
- Especialización probable en generación de animaciones con Manim CE: inferida del nombre del repositorio, sin confirmación en la model card.

## Casos de uso

- Generación de escenas Manim CE: el adaptador podría emplearse para producir código Python de animaciones matemáticas con Manim Community Edition, aprovechando el ajuste SFT sugerido por el nombre. Requiere validación empírica previa.
- Asistencia a la docencia de matemáticas: generación de visualizaciones animadas para explicar conceptos, siempre que el adaptador mantenga la calidad del modelo base en código Python.
- Prototipado de pipelines de código: integrado con el modelo base en entornos de desarrollo para autocompletar o generar fragmentos de código, aunque sin garantías de que el ajuste no haya degradado capacidades generales.
- Investigación sobre fine-tuning LoRA: útil como ejemplo de adaptador PEFT para estudiar el efecto del SFT en dominios específicos (Manim) sobre un modelo de código.
- Experimentación académica: reproducción de experimentos de ajuste supervisado sobre Qwen2.5-Coder-7B-Instruct en dominios de nicho.
- Evaluación comparativa de adaptadores: como caso de estudio de adaptadores con documentación incompleta, para analizar riesgos de reproducibilidad.

No se recomienda su uso en producción sin una evaluación previa, dada la ausencia de documentación, licencia y benchmarks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación y no se dispone de comparaciones con el modelo base ni con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 7B en FP16 requiere aproximadamente 14-16 GB de VRAM; en cuantización 8-bit, unos 8 GB; en 4-bit, unos 5-6 GB. El adaptador añade una sobrecarga mínima (repo de 2,0 GB, probablemente en FP16).
- GPU recomendadas: A100 40GB, H100, L40S o RTX 4090 (24 GB) para FP16; RTX 3090/4080 (16 GB) para cuantización 8-bit; RTX 3060 12 GB o similar para 4-bit.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en FP16 y en GPUs de 8-12 GB con cuantización.
- Opciones de despliegue: transformers + PEFT (imprescindible para cargar el adaptador), vLLM (requiere fusionar el adaptador con el modelo base), llama.cpp/Ollama (previo merge y conversión a GGUF), TGI (previo merge).
- Latencia y throughput: no disponibles para este adaptador; dependen del modelo base y del hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| PRB1/Qwen2.5-Coder-7B-ManimCE-SFT-16bit | 7B (base) + LoRA | No disponible | No disponible | Hugging Face (0 descargas) | Adaptador experimental sin documentación |
| Qwen/Qwen2.5-Coder-7B-Instruct | 7B | 32 768 tokens (según modelo base) | Apache 2.0 (según modelo base) | Hugging Face, ampliamente usado | Modelo base oficial, documentado y evaluado |
| Adaptadores LoRA comunitarios sobre Qwen2.5-Coder | 7B (base) + LoRA | Variable | Variable | Hugging Face | Calidad y documentación muy variables |

La comparación directa con alternativas no es posible por falta de benchmarks del adaptador. El modelo base Qwen2.5-Coder-7B-Instruct es la referencia natural y cuenta con documentación y evaluación oficiales.

## Limitaciones y advertencias

- Model card sin completar: no hay información sobre datos, entrenamiento, evaluación ni uso previsto.
- Licencia no especificada: no se puede garantizar el uso comercial; además, la licencia del adaptador podría estar sujeta a la del modelo base (Qwen2.5-Coder-7B-Instruct, Apache 2.0 según su repositorio oficial, no confirmado aquí).
- Riesgo de alucinación: inherente a los modelos de lenguaje; no evaluado en este adaptador.
- Posible degradación de capacidades generales: el SFT en un dominio específico (Manim) puede reducir el rendimiento en tareas generales de código, sin datos que lo confirmen.
- Idiomas no documentados: no se puede asegurar soporte multilingüe más allá del modelo base.
- Sin descargas ni validación comunitaria: no hay evidencia de que el adaptador funcione correctamente.
- Reproducibilidad limitada: sin hiperparámetros ni dataset, no es posible replicar el entrenamiento.
- Requiere el modelo base: no es un modelo autónomo; hay que descargar Qwen2.5-Coder-7B-Instruct y aplicar el adaptador con PEFT.

## Enlaces

- Hugging Face: https://huggingface.co/PRB1/Qwen2.5-Coder-7B-ManimCE-SFT-16bit
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Paper citado en los tags (Lacoste et al., 2019, impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact
- Manim Community Edition (referencia del dominio sugerido por el nombre): https://www.manim.community/
