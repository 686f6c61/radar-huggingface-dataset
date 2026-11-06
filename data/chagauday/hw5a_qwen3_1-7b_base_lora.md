# Chagauday/HW5A_Qwen3_1.7B_Base_LoRA

## Resumen

HW5A_Qwen3_1.7B_Base_LoRA es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario Chagauday sobre el modelo base Qwen/Qwen3-1.7B-Base. No se trata de un modelo completo, sino de un conjunto de pesos de adaptación entrenados mediante SFT (supervised fine-tuning) con la librería TRL y empaquetados en formato PEFT. El repositorio ocupa 0,6 GB y se distribuye bajo la librería `peft`, por lo que requiere cargar el modelo base Qwen3-1.7B-Base y aplicar el adaptador encima para poder utilizarlo.

El modelo subyacente pertenece a la familia Qwen3, la generación más reciente de modelos Qwen, que combina variantes densas y MoE. La variante Base de 1,7B parámetros es un transformer denso orientado a generación de texto, pensado como punto de partida para ajuste fino. Este adaptador concreto aplica un ajuste supervisado conversacional sobre dicha base, aunque la model card del autor no documenta los datos, hiperparámetros ni objetivos del entrenamiento.

La relevancia de esta ficha es limitada: se trata de un adaptador con cero descargas y cero likes en el momento de la consulta, sin licencia declarada, sin idiomas especificados y con una model card que es esencialmente la plantilla por defecto de Hugging Face sin rellenar. Cualquier evaluación de su calidad debe hacerse empíricamente, y su uso en producción exige verificar primero la licencia del modelo base Qwen3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre transformer denso Qwen3-1.7B-Base |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene ~1,7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion del adaptador (heredada del modelo base Qwen3-1.7B-Base) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, matrices de bajo rango inyectadas en las capas del transformer base Qwen3-1.7B-Base. Según los tags del repositorio, el entrenamiento se realizó mediante SFT (supervised fine-tuning) usando las librerías `transformers` y `trl`, con PEFT 0.19.1 como framework de serialización. El tamaño del repositorio (0,6 GB) es coherente con un adaptador de rango moderado más los ficheros de configuración, no con un modelo completo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, la precisión usada (fp16, bf16, fp32), el rango del LoRA, el alpha, la tasa de aprendizaje ni si hubo etapas de RLHF o DPO. La model card no rellena ninguna de las secciones de detalles de entrenamiento, datos o hiperparámetros. Tampoco se documenta ninguna innovación técnica adicional más allá del propio ajuste supervisado.

## Capacidades

- Generación de texto conversacional: el tag `conversational` y el pipeline `text-generation` indican que el adaptador está orientado a diálogo, aunque no se detalla el formato de prompt ni las plantillas de chat empleadas.
- Ajuste fino supervisado: al ser un adaptador SFT, se espera que module el estilo y las respuestas del modelo base hacia el dominio de los datos de entrenamiento, que no se especifican.
- Herencia de capacidades del modelo base: al aplicar el adaptador sobre Qwen3-1.7B-Base, el sistema resultante conserva las capacidades del transformer subyacente (generación de texto, razonamiento básico, código), aunque el adaptador puede alterarlas o degradarlas.
- Tool calling / function calling: no disponible en la información del adaptador; depende de si el modelo base y el ajuste lo preservan.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; los idiomas no están declarados.
- Modo thinking, visión o audio: no disponible; el adaptador es solo de texto.

## Casos de uso

- Experimentación con PEFT: el caso más realista es servir como ejemplo práctico de cómo se estructura y se carga un adaptador LoRA sobre Qwen3-1.7B-Base, útil para desarrolladores que quieran replicar el flujo con `peft` y `transformers`.
- Ajuste de estilo conversacional: si los datos de SFT eran diálogos de un dominio concreto, el adaptador podría usarse para dar al modelo base un tono o formato de respuesta específico en ese dominio, siempre que se valide empíricamente.
- Prototipado rápido en local: al requerir solo el modelo base de 1,7B más un adaptador de 0,6 GB, el conjunto puede ejecutarse en GPUs de consumo para pruebas de concepto, sin compromiso de producción.
- Investigación sobre fine-tuning supervisado: sirve como punto de comparación frente a otros adaptadores SFT sobre la misma base para estudiar el efecto del ajuste en tareas concretas.
- Base para ajustes posteriores: el adaptador puede combinarse o continuar entrenándose con PEFT para tareas adicionales, aprovechando que el modelo base queda intacto.
- Evaluación de riesgos de adaptadores no documentados: útil como caso de estudio de por qué conviene auditar un adaptador (licencia, datos, sesgos) antes de integrarlo en cualquier pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen3-1.7B-Base en bf16 requiere aproximadamente 3,4 GB solo para pesos, más overhead de activaciones y KV cache; con el adaptador LoRA el incremento es marginal (del orden de centenares de MB según el rango).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM puede ejecutar el modelo base en bf16 o fp16; para cuantizaciones de 4 bits bastan 4-6 GB.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090, así como en GPUs de portátil con 8 GB o más.
- Opciones de despliegue: `transformers` + `peft` para carga del adaptador; `vLLM` y `TGI` admiten adaptadores LoRA en muchos casos, aunque la compatibilidad concreta con este adaptador no está verificada; `llama.cpp` y `Ollama` requieren convertir el adaptador a GGUF, lo que no está documentado en el repositorio.
- Latencia y throughput estimados: no disponible; dependen del hardware, la cuantización y el backend, y no hay mediciones publicadas para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Chagauday/HW5A_Qwen3_1.7B_Base_LoRA | Adaptador LoRA sobre ~1,7B | no disponible | no disponible | safetensors (PEFT) | Adaptador SFT sin documentación; 0 descargas |
| Qwen/Qwen3-1.7B-Base | ~1,7B | no disponible en la información proporcionada | no disponible en la información proporcionada | safetensors | Modelo base oficial de Qwen sobre el que se aplica el adaptador |
| Qwen/Qwen3-1.7B | ~1,7B | no disponible en la información proporcionada | no disponible en la información proporcionada | safetensors | Variante instruida/chat de la familia Qwen3, alternativa directa sin necesidad de adaptador |

## Limitaciones y advertencias

- La model card es la plantilla por defecto de Hugging Face y no contiene información sobre datos, entrenamiento, evaluación ni uso previsto; no hay garantías documentadas sobre el comportamiento del adaptador.
- Licencia no declarada: no se puede asumir uso comercial permitido; además, la licencia efectiva depende de la del modelo base Qwen3-1.7B-Base, que debe verificarse por separado.
- Idiomas no declarados: se desconoce si el ajuste conserva o degrada el multilingüismo del modelo base.
- Riesgo de alucinación y sesgos: inherente al modelo base y potencialmente amplificado o modificado por un SFT cuyos datos se desconocen.
- Sin benchmarks ni evaluaciones publicadas: no hay evidencia de mejora respecto al modelo base en ninguna tarea.
- Cero descargas y cero likes: no hay señal de validación por parte de la comunidad.
- Al ser un adaptador, requiere cargar el modelo base; un error en la versión de PEFT o en la plantilla de chat puede producir respuestas incoherentes.
- No apto para producción sin una auditoría previa de licencia, datos de entrenamiento, sesgos y evaluación empírica en la tarea objetivo.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/Chagauday/HW5A_Qwen3_1.7B_Base_LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Variante instruida de la familia: https://huggingface.co/Qwen/Qwen3-1.7B
- Paper de referencia sobre impacto ambiental citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML: https://mlco2.github.io/impact
