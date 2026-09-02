# dehanns/whisper-small-lora-mix

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) sobre el modelo base `openai/whisper-small`, publicado por el usuario `dehanns` en Hugging Face. El adaptador está construido con la librería PEFT (versión 0.14.0) y los pesos se almacenan en formato `safetensors`. La finalidad de un adaptador LoRA es permitir un ajuste fino eficiente de un modelo preentrenado sin modificar todos sus parámetros, reduciendo drásticamente el coste computacional y de almacenamiento.

Sin embargo, la información pública disponible es extremadamente limitada: la model card está prácticamente vacía, el tamaño del repositorio es de 0.0 GB (lo que sugiere que no se han subido pesos o que el adaptador es de tamaño despreciable), y no se especifican datos de entrenamiento, evaluación, licencia ni idiomas. Tampoco hay métricas de rendimiento ni documentación de uso. Por tanto, esta ficha se basa en el conocimiento general del modelo base Whisper-small y en las características técnicas del propio adaptador, indicando explícitamente qué datos no están disponibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Whisper-small (transformer encoder-decoder) |
| Parametros totales | no disponible (el adaptador LoRA añade matrices de bajo rango; el modelo base tiene ~244M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (Whisper-small procesa ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (Whisper-small soporta 99 idiomas, pero el adaptador no especifica) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Whisper-small es un modelo de reconocimiento automático de voz (ASR) desarrollado por OpenAI, basado en una arquitectura transformer encoder-decoder. Fue entrenado sobre 680.000 horas de audio débilmente supervisado en múltiples idiomas, y es capaz de realizar transcripción, traducción y identificación de idioma. El adaptador LoRA de este repositorio se añade a las capas de atención y feed-forward del modelo base, introduciendo matrices de bajo rango que se actualizan durante el ajuste fino mientras los pesos originales permanecen congelados.

No se dispone de información sobre el conjunto de datos de entrenamiento, el procedimiento de ajuste, los hiperparámetros utilizados ni el régimen de entrenamiento (precisión mixta, número de épocas, etc.). Tampoco se indica si se emplearon técnicas como RLHF o DPO. La única referencia técnica es el uso de PEFT 0.14.0 y el tag `arxiv:1910.09700`, que corresponde al artículo original de LoRA, pero no aporta detalles específicos de este adaptador.

## Capacidades

- Al ser un adaptador sobre Whisper-small, hereda las capacidades del modelo base: transcripción de voz a texto en múltiples idiomas, traducción de voz a texto en inglés y detección de idioma.
- El adaptador LoRA permite especializar el modelo en un dominio o acento concreto si se ha entrenado con datos apropiados, aunque no se ha documentado ningún dominio específico.
- No se ha confirmado soporte para tool calling, agentes o razonamiento multi-paso, ya que Whisper es un modelo de ASR y no un modelo de lenguaje general.
- No se ha especificado si el adaptador modifica el comportamiento multilingüe del modelo base.

## Casos de uso

Dado que no se ha publicado documentación sobre aplicaciones concretas, los siguientes casos son hipotéticos y se basan en el uso típico de adaptadores LoRA sobre Whisper-small:

- Transcripción de audio en un dominio especializado: si el adaptador se entrenó con datos de un sector concreto (médico, legal, técnico), podría mejorar la precisión en esa jerga frente al modelo base.
- Ajuste para acentos o dialectos regionales: un adaptador LoRA puede adaptar Whisper-small a variantes lingüísticas específicas con pocos datos.
- Reducción de costes de despliegue: al ser un adaptador de bajo rango, se puede cargar sobre el modelo base sin necesidad de almacenar una copia completa, facilitando el despliegue en entornos con recursos limitados.
- Prototipado rápido de ASR: los adaptadores LoRA permiten iterar rápidamente sobre diferentes especializaciones sin reentrenar el modelo completo.
- Investigación en eficiencia de fine-tuning: este repositorio puede servir como ejemplo de cómo aplicar PEFT a Whisper-small, aunque carece de documentación.
- Integración en pipelines de transcripción existentes: el adaptador se puede combinar con el modelo base mediante la librería `transformers` y PEFT para sustituir o complementar un modelo ASR estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay métricas de WER (Word Error Rate), CER ni comparaciones con otros modelos en la model card ni en el repositorio.

## Requisitos de hardware

Los requisitos que se indican a continuación corresponden al modelo base Whisper-small, ya que no se dispone de datos específicos del adaptador:

- VRAM estimada para inferencia: aproximadamente 1-2 GB en precisión fp16 para el modelo base completo. El adaptador LoRA añade una cantidad mínima de memoria adicional.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3060, etc.). Para entrenamiento del adaptador, se recomienda una GPU con 8 GB o más.
- Es viable en GPUs de consumo (gama media y alta) y también en CPUs con suficiente RAM, aunque con mayor latencia.
- Opciones de despliegue: se puede utilizar con la librería `transformers` de Hugging Face, `faster-whisper` (si se convierte a formato CTranslate2), o `llama.cpp` (aunque este último está más orientado a modelos de lenguaje). También es compatible con PEFT para cargar el adaptador sobre el modelo base.
- Latencia y throughput: no disponibles para este adaptador concreto. En general, Whisper-small procesa audio en tiempo real o más rápido en GPUs modernas, pero depende del hardware y de la optimización.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa. El modelo base Whisper-small es el punto de referencia natural, pero no se conocen las modificaciones introducidas por el adaptador. Existen otros adaptadores LoRA sobre Whisper-small en Hugging Face (por ejemplo, `MaddoggProduction/whisper-small-quran-lora-dataset-mix`), pero no se han publicado métricas comparables. Por tanto, la comparativa se limita a lo siguiente:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| openai/whisper-small | ~244M | 30 s de audio | MIT | Publico |
| dehanns/whisper-small-lora-mix | no disponible | no disponible | no disponible | Repositorio sin pesos aparentes |
| MaddoggProduction/whisper-small-quran-lora-dataset-mix | no disponible | no disponible | no disponible | Publico con pesos |

## Limitaciones y advertencias

- La información pública es insuficiente: no hay model card completa, ni datos de entrenamiento, ni evaluación, ni licencia explícita. Esto impide verificar la calidad y el uso permitido del adaptador.
- El tamaño del repositorio es 0.0 GB, lo que sugiere que los pesos del adaptador no están subidos o son extremadamente pequeños. Es posible que el repositorio esté vacío o incompleto.
- Al no conocerse el conjunto de datos de entrenamiento, no se pueden evaluar sesgos potenciales ni riesgos de alucinación en la transcripción.
- La licencia no está especificada, por lo que no se puede garantizar su uso comercial. Se recomienda contactar con el autor antes de utilizarlo en producción.
- El adaptador hereda las limitaciones de Whisper-small: puede fallar en audio con mucho ruido, acentos muy marcados o idiomas poco representados en su entrenamiento.
- No se ha documentado si el adaptador mantiene la capacidad multilingüe del modelo base o si la restringe a un idioma o dominio concreto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/dehanns/whisper-small-lora-mix
- Modelo base Whisper-small: https://huggingface.co/openai/whisper-small
- Repositorio oficial de Whisper en GitHub: https://github.com/openai/whisper
- Ejemplo de adaptador LoRA similar: https://huggingface.co/MaddoggProduction/whisper-small-quran-lora-dataset-mix
- Repositorio de ejemplo de Whisper-LORA: https://github.com/B-I-T-W-I-S-E-M-I-N-D-S/Whisper-LORA
