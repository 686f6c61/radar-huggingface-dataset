# sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_accuracy_high_sft_step340

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) entrenado mediante fine-tuning supervisado (SFT) sobre el modelo base LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct, desarrollado por el usuario sbcho0325. El nombre del adaptador sugiere que fue optimizado para tareas de conversación financiera (convfin), preguntas de opción múltiple (mcq) y precisión de código (pc_accuracy), aunque la model card no proporciona ninguna descripción detallada de los datos de entrenamiento, el proceso de fine-tuning ni los objetivos específicos.

El adaptador se distribuye en formato PEFT (Parameter-Efficient Fine-Tuning) con pesos en safetensors, ocupando aproximadamente 0,3 GB. Al ser un adaptador LoRA, no es un modelo independiente: debe combinarse con el modelo base EXAONE-3.5-7.8B-Instruct para funcionar. Dado que el repositorio carece de documentación, instrucciones de uso, ejemplos de código o métricas de evaluación, su utilidad práctica queda limitada a un experimento de investigación sin validación externa.

La relevancia de este adaptador reside en su base: EXAONE 3.5 es una familia de modelos bilingües (coreano e inglés) desarrollada por LG AI Research, con soporte de contexto largo de hasta 32K tokens y capacidades de razonamiento y generación de código. Sin embargo, el adaptador en sí no aporta información sobre mejoras concretas respecto al modelo base, y su autor no ha publicado ningún benchmark ni ejemplo de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre EXAONE-3.5-7.8B-Instruct (transformer decoder-only) |
| Parametros totales | No disponible (el adaptador LoRA tiene un numero reducido de parametros; el modelo base tiene 7.8B) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | 32K tokens (heredada del modelo base EXAONE-3.5-7.8B-Instruct) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizacion GGUF) |
| Idiomas soportados | No disponible (el modelo base EXAONE 3.5 soporta coreano e ingles) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura transformer decoder-only de EXAONE 3.5, que emplea atención de múltiples cabezas convencional y normalización RMSNorm, con un diseño similar a otros modelos de la familia GPT. El modelo base de 7.8B parámetros fue entrenado por LG AI Research con un enfoque bilingüe (coreano e inglés) y optimizado para casos de uso reales, incluyendo razonamiento, generación de código y comprensión de contexto largo.

El adaptador fue entrenado mediante fine-tuning supervisado (SFT) utilizando la librería TRL y PEFT 0.19.1. No se especifican los hiperparámetros de entrenamiento, el número de pasos (aunque el nombre indica step340), el dataset utilizado ni el régimen de precisión (fp16, bf16, etc.). El nombre del adaptador sugiere que se entrenó sobre datos de conversaciones financieras, preguntas de opción múltiple y tareas de precisión de código, pero no hay confirmación oficial ni documentación al respecto.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base EXAONE-3.5-7.8B-Instruct, que incluyen razonamiento lógico, comprensión lectora y generación de texto en coreano e inglés.
- Generación de código: el modelo base EXAONE 3.5 tiene capacidades de generación de código; el adaptador podría estar orientado a mejorar la precisión en tareas de código (según el nombre "pc_accuracy"), aunque no hay evidencia publicada.
- Conversación multi-turno: el modelo base está optimizado para instrucciones y conversación; el adaptador podría estar ajustado para dominios financieros ("convfin"), pero sin datos concretos no se puede confirmar.
- Tool calling y function calling: no disponible en la información proporcionada; el modelo base EXAONE 3.5 no documenta soporte explícito de tool calling en las fuentes consultadas.
- Capacidades multilingües: el modelo base soporta coreano e inglés; el adaptador no documenta cambios en este aspecto.

## Casos de uso

- Investigación académica sobre fine-tuning eficiente: el adaptador puede servir como ejemplo de cómo aplicar LoRA sobre EXAONE-3.5-7.8B-Instruct para tareas específicas, aunque sin documentación su reproducibilidad es limitada.
- Experimentación con adaptadores financieros: si el nombre "convfin" se refiere a conversaciones financieras, el adaptador podría usarse para probar su comportamiento en ese dominio, pero no hay métricas que respalden su eficacia.
- Evaluación comparativa de adaptadores: se podría cargar el adaptador sobre el modelo base y comparar su rendimiento con el modelo base sin adaptar en tareas de opción múltiple o código, aunque no hay benchmarks publicados.
- Desarrollo de prototipos: un desarrollador podría integrar el adaptador en un pipeline de generación de texto con transformers y PEFT, pero debería validar su comportamiento manualmente.
- Fine-tuning adicional: el adaptador podría servir como punto de partida para un segundo fine-tuning, aunque no se documentan los datos de entrenamiento originales.
- Análisis de sesgos y robustez: se podría estudiar cómo el adaptador afecta al comportamiento del modelo base en dominios específicos, pero requiere un trabajo de evaluación no proporcionado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de evaluación, comparaciones con el modelo base ni resultados en conjuntos de datos estándar como MMLU, HumanEval o GSM8K. El autor no ha proporcionado ninguna evidencia de mejora respecto al modelo base EXAONE-3.5-7.8B-Instruct.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA, los requisitos de VRAM son los del modelo base EXAONE-3.5-7.8B-Instruct. En precisión fp16, el modelo base requiere aproximadamente 16 GB de VRAM para inferencia. Con cuantización de 4 bits (por ejemplo, bitsandbytes), puede caber en GPUs con 8-10 GB de VRAM.
- GPU recomendadas: NVIDIA A100, H100, RTX 4090, RTX 3090 o GPUs con al menos 16 GB de VRAM para fp16. Para cuantización 4-bit, una RTX 3080 o RTX 4070 con 10-12 GB podría ser suficiente.
- Compatibilidad con GPUs de consumo: sí, el modelo base puede ejecutarse en GPUs consumer de gama alta (RTX 3090/4090) con cuantización, y el adaptador añade una carga mínima de VRAM adicional.
- Opciones de despliegue: el adaptador se puede cargar con transformers + PEFT. Para el modelo base, existen versiones GGUF para llama.cpp y Ollama, así como soporte en vLLM y TGI. El adaptador LoRA puede aplicarse sobre estas plataformas si se convierte al formato adecuado, aunque no se proporcionan instrucciones.
- Latencia y throughput: no disponible. Depende del hardware y de la cuantización elegida; el modelo base de 7.8B parámetros tiene una latencia típica de decenas de milisegundos por token en GPUs modernas.

## Comparativa con modelos similares

No hay información suficiente para establecer una comparativa rigurosa con otros adaptadores o modelos. Se puede comparar el modelo base EXAONE-3.5-7.8B-Instruct con alternativas similares:

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| EXAONE-3.5-7.8B-Instruct (base) | 7.8B | 32K | coreano, ingles | Licencia EXAONE (uso comercial permitido con restricciones) | Modelo base sobre el que se entrena el adaptador |
| Llama-3.1-8B-Instruct | 8B | 128K | multilingue (8 idiomas) | Llama 3.1 Community License | Alternativa popular de código abierto |
| Qwen2.5-7B-Instruct | 7.6B | 32K | multilingue (29 idiomas) | Apache 2.0 | Alternativa con licencia permisiva |

El adaptador en sí no es comparable directamente con estos modelos, ya que no es un modelo completo. No se dispone de datos de rendimiento del adaptador para comparar.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card no contiene información sobre el propósito, los datos de entrenamiento, los hiperparámetros ni los resultados. Esto impide evaluar su calidad o reproducibilidad.
- Riesgo de sobreajuste: al ser un adaptador SFT sin datos de validación publicados, es probable que esté sobreajustado al conjunto de entrenamiento específico y no generalice bien a otros dominios.
- Sesgos heredados: el modelo base EXAONE 3.5 puede tener sesgos lingüísticos y culturales (coreano e inglés) y el adaptador podría amplificarlos si los datos de entrenamiento no fueron curados adecuadamente.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir contenido falso o inventado, especialmente en dominios financieros donde la precisión es crítica.
- Licencia incierta: la licencia del adaptador no está especificada. El modelo base EXAONE tiene su propia licencia con restricciones de uso comercial; el adaptador podría heredar esas restricciones, pero no está claro.
- Sin soporte ni mantenimiento: el repositorio no tiene actividad, no hay issues ni respuestas del autor. No se puede esperar soporte técnico.
- Formato PEFT: el adaptador requiere el modelo base y la librería PEFT para cargarse. No es un modelo autocontenido y no se proporcionan instrucciones de uso.
- Fecha de creación futura: el modelo fue creado en agosto de 2026 (según los metadatos), lo que podría indicar un error o una fecha ficticia, añadiendo incertidumbre sobre su origen.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_accuracy_high_sft_step340
- Modelo base EXAONE-3.5-7.8B-Instruct: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct
- Repositorio oficial EXAONE 3.5 en GitHub: https://github.com/LG-AI-EXAONE/EXAONE-3.5
- Paper de EXAONE 3.5 en arXiv: https://arxiv.org/html/2412.04862v3
- Versión GGUF del modelo base: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct-GGUF
