# 3MPER0RR/DeepSeek-R1-Distill-Qwen-14B-3MPER0RR-abliterated

## Resumen

DeepSeek-R1-Distill-Qwen-14B-3MPER0RR-abliterated es una modificación "abliterated" del modelo DeepSeek-R1-Distill-Qwen-14B, publicada por el usuario 3MPER0RR en Hugging Face. El modelo base es un destilado de DeepSeek-R1 sobre la arquitectura Qwen2 de 14B parámetros, desarrollado originalmente por DeepSeek. La modificación consiste en la eliminación de la dirección de rechazo ("abliteration") mediante la sustracción de vectores de activación asociados a comportamientos de negativa, un procedimiento experimental que el autor documenta de forma muy escueta (200 ensayos, estado "tested and saved").

El modelo conserva la arquitectura transformer densa de Qwen2 con 14.770.033.664 parámetros totales, pesos en safetensors y licencia MIT. No se proporcionan datos sobre contexto, idiomas, dataset de entrenamiento ni metodología detallada de la modificación. El repositorio ocupa 29,6 GB y acumula 822 descargas con 0 likes en el momento de la consulta.

Su relevancia es acotada: se trata de un experimento de la comunidad orientado a investigadores interesados en estudiar el comportamiento de modelos destilados de razonamiento sin los filtros de rechazo del modelo original. No es un modelo recomendado para producción sin una evaluación exhaustiva previa, dada la ausencia de documentación técnica y de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2) |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no documentadas por el autor) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base DeepSeek-R1-Distill-Qwen-14B emplea la arquitectura Qwen2, un transformer decoder-only denso con normalización RMSNorm, activación SwiGLU y atención con RoPE. El destilado original de DeepSeek se obtuvo entrenando el modelo Qwen2-14B sobre trazas de razonamiento generadas por DeepSeek-R1, lo que le confiere capacidad de generar cadenas de pensamiento largas antes de responder. No se dispone de información sobre el número de tokens de entrenamiento ni la composición del dataset del destilado original en la documentación proporcionada.

La modificación "abliterated" aplicada por 3MPER0RR consiste, según la práctica habitual de esta técnica, en identificar la dirección de activación asociada a la negativa a responder y restarla de los pesos o activaciones del modelo. El autor indica 200 ensayos y un estado "tested and saved", pero no detalla la metodología exacta, las capas intervenidas, el dataset de calibración ni las métricas de evaluación. No hay información sobre si se aplicó RLHF, DPO u otro ajuste posterior a la abliteración.

## Capacidades

- Generación de texto conversacional y de razonamiento multi-paso, heredadas del destilado de DeepSeek-R1.
- Razonamiento matemático y lógico con cadenas de pensamiento explícitas (estilo R1).
- Generación de código, presumiblemente con capacidad de razonamiento previo a la respuesta.
- Soporte de conversaciones multi-turno en formato chat (pipeline `conversational`).
- Capacidad reducida o eliminada de rechazo ante peticiones que el modelo original declinaría, por efecto de la abliteración.
- Tool calling y function calling: no documentado por el autor; el modelo base Qwen2 lo soporta parcialmente, pero no hay confirmación para esta variante.
- Capacidades de agente y multi-step reasoning: no verificadas en esta variante.
- Capacidades multilingües: no documentadas.
- Modo "thinking" explícito: heredado del modelo base, no verificado tras la modificación.

## Casos de uso

- Investigación sobre alineación y rechazo: el modelo permite estudiar cómo la sustracción de direcciones de activación afecta a la distribución de respuestas y a la utilidad del modelo en tareas sensibles, comparándolo con el modelo base original.
- Evaluación de robustez de salvaguardas: útil para probar sistemas de moderación externos, ya que genera respuestas que un modelo alineado rechazaría, permitiendo medir la eficacia de filtros posteriores.
- Generación de razonamiento matemático en entornos controlados: al conservar el estilo de cadena de pensamiento de R1, puede emplearse para generar trazas de razonamiento sintéticas en investigación, siempre con revisión humana.
- Experimentación con destilados de razonamiento: sirve como punto de comparación para estudiar el efecto de la abliteración sobre la calidad del razonamiento en modelos de 14B.
- Fine-tuning posterior para dominios específicos: al tener licencia MIT y pesos safetensors, puede servir como base para ajustes supervisados en investigación académica, aunque sin garantías de calidad tras la modificación.
- Despliegue en entornos de laboratorio aislados: con 14,7B parámetros puede ejecutarse en una GPU de 24 GB en cuantización de 8 bits o en 4 bits para pruebas internas, sin exposición a usuarios finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta métricas de MMLU, GSM8K, HumanEval ni evaluaciones de rechazo antes y después de la abliteración, por lo que no es posible cuantificar el impacto de la modificación sobre el rendimiento del modelo base.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 29,5 GB solo para pesos, más overhead de activaciones y caché KV; requiere GPU de 40 GB o superior (A100 40GB, A100 80GB, H100).
- VRAM estimada en cuantización de 8 bits: aproximadamente 15-16 GB; cabe en RTX 4090 (24 GB) y A6000 (48 GB).
- VRAM estimada en cuantización de 4 bits: aproximadamente 8-9 GB; cabe en RTX 3090, RTX 4090, RTX 4080 y GPUs consumer de 12 GB o más.
- GPU recomendadas: A100 80GB o H100 para FP16 con contexto largo; RTX 4090 o A6000 para 8 bits; RTX 3090/4090 para 4 bits.
- Opciones de despliegue: vLLM y TGI para safetensors en FP16/BF16; llama.cpp y Ollama requieren conversión previa a GGUF, no publicada por el autor; Transformers con bitsandbytes para carga cuantizada.
- Latencia y throughput: no disponibles; dependen de la GPU, la cuantización y la longitud de las cadenas de razonamiento generadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| 3MPER0RR/DeepSeek-R1-Distill-Qwen-14B-3MPER0RR-abliterated | 14,77B | no disponible | MIT | safetensors | Variante abliterated experimental, sin benchmarks |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-14B | 14,77B | 128K (según documentación del modelo base) | MIT | safetensors | Modelo original alineado, con benchmarks publicados por DeepSeek |
| Qwen/Qwen2.5-14B-Instruct | 14,7B | 128K | Apache 2.0 | safetensors, GGUF | Modelo generalista alineado, sin modo de razonamiento explícito |
| deepseek-ai/DeepSeek-R1-Distill-Llama-8B | 8B | 128K (según documentación del modelo base) | MIT | safetensors | Alternativa más ligera de la familia de destilados de R1 |

La comparativa se limita a parámetros, contexto y licencia; no hay datos de rendimiento de la variante abliterated que permitan comparaciones cuantitativas.

## Limitaciones y advertencias

- La abliteración elimina o reduce los mecanismos de rechazo del modelo, lo que puede producir respuestas a peticiones dañinas, ilegales o inseguras sin advertencia; no debe exponerse a usuarios finales sin moderación externa.
- No hay evaluación documentada del impacto de la modificación sobre la calidad del razonamiento, la coherencia o la tasa de alucinación; el modelo puede degradarse respecto al original.
- No se especifican idiomas soportados ni longitud de contexto; asumir los valores del modelo base (128K en la documentación de DeepSeek) sin verificación es arriesgado.
- El autor no documenta la metodología de abliteración, las capas intervenidas ni el dataset de calibración, lo que impide reproducir el experimento.
- Licencia MIT permite uso comercial, pero el titular de la modificación no ofrece garantías y la responsabilidad legal por el uso recae en el desplegador.
- Riesgo de sesgos heredados del modelo base y potencialmente amplificados por la eliminación de rechazos en temas sensibles.
- Ausencia de cuantizaciones GGUF oficiales y de benchmarks dificulta la integración en pipelines de producción estándar.
- El repositorio tiene 0 likes y documentación mínima; no hay comunidad que valide su comportamiento en distintos escenarios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/3MPER0RR/DeepSeek-R1-Distill-Qwen-14B-3MPER0RR-abliterated
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-14B
- Paper de DeepSeek-R1: https://arxiv.org/abs/2501.12948
- Repositorio de DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1
- Documentación de Qwen2: https://huggingface.co/docs/transformers/model_doc/qwen2
