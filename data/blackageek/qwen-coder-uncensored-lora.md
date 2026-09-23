# blackageek/qwen-coder-uncensored-lora

## Resumen

`blackageek/qwen-coder-uncensored-lora` es un adaptador LoRA de la comunidad, publicado por el usuario blackageek, que se aplica sobre el modelo `OBLITERATUS/Qwen2.5-Coder-7B-Instruct-OBLITERATED`, a su vez derivado de la familia Qwen2.5-Coder-7B-Instruct. No se trata por tanto de un modelo completo, sino de pesos de adaptador (PEFT) que deben cargarse junto al modelo base para funcionar. El repositorio ocupa 0,3 GB, un tamaño coherente con un adaptador LoRA en precisión de 16 bits para un modelo de 7B.

El propósito declarado, inferido del propio identificador del repositorio ("uncensored"), es el ajuste supervisado (SFT) orientado a reducir las negativas de rechazo del modelo base y ampliar el rango de respuestas generadas. La model card publicada es la plantilla por defecto de HuggingFace y no contiene información rellenada: no se documentan datos de entrenamiento, hiperparámetros, evaluación, licencia ni idiomas.

Su relevancia actual es limitada y muy específica: sirve como ejemplo de adaptador comunitario de bajo coste sobre un modelo de código de 7B, y como punto de partida para quien quiera reproducir el pipeline de entrenamiento con TRL, PEFT y Unsloth. Al no haber benchmarks, licencia ni documentación técnica, no es un artefacto recomendable para producción sin una validación previa exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only de la familia Qwen2; la arquitectura del adaptador en sí no está documentada (no disponible el rango, alpha, dropout ni los módulos objetivo) |
| Parametros totales | No disponible para el adaptador. El modelo base sobre el que se aplica es de la clase 7B (Qwen2.5-Coder-7B-Instruct); no se detalla el número exacto en la información proporcionada |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card del adaptador; queda determinada por el modelo base, que no se especifica aquí |
| Tipos de cuantizacion | No disponible. Al ser un adaptador PEFT, la cuantización aplicable es la del modelo base tras el merge (4-bit, 8-bit, GGUF, etc.), no la del propio adaptador |
| Idiomas soportados | No disponible |
| Licencia | No disponible (el repositorio no declara licencia; esto impide determinar si se permite el uso comercial) |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA); no se publican pesos completos ni GGUF |

Otros datos objetivos del repositorio: 0 descargas, 0 "likes", pipeline `text-generation`, librería `peft`, versión de PEFT indicada 0.19.1, creado y actualizado el 22 de septiembre de 2026 según los metadatos de HuggingFace.

## Arquitectura y entrenamiento

La información disponible solo permite afirmar que se trata de un adaptador LoRA entrenado mediante SFT (etiquetas `lora`, `sft`, `trl`, `unsloth`, `transformers`, `peft`) sobre el modelo `OBLITERATUS/Qwen2.5-Coder-7B-Instruct-OBLITERATED`. No se especifican el rango del adaptador, los módulos a los que se aplica, el número de pasos, la tasa de aprendizaje, la composición del dataset ni la precisión de entrenamiento. Tampoco se documenta si hubo fases posteriores de alineación (DPO, RLHF u otras).

El nombre del repositorio sugiere un ajuste orientado a eliminar comportamientos de rechazo del modelo base, pero no hay ninguna evidencia técnica publicada que describa el procedimiento, el dataset utilizado ni los criterios de filtrado. No se documenta ninguna innovación técnica (decodificación especulativa, atención lineal, destilación, etc.).

## Capacidades

- Generación de texto y de código: capacidad heredada del modelo base Qwen2.5-Coder-7B-Instruct, que no se verifica ni se cuantifica en la información disponible.
- Razonamiento multi-paso y resolución de problemas: presumiblemente heredada del modelo base; no hay evaluación publicada.
- Tool calling / function calling: el modelo base de la familia Qwen2.5-Coder soporta plantillas de herramientas, pero no se confirma que este adaptador las preserve tras el entrenamiento SFT.
- Comportamiento conversacional: la etiqueta `conversational` indica que el adaptador está pensado para diálogo, aunque no se detalla el formato de prompt recomendado.
- Capacidades multilingües: no disponible.
- Modo "thinking", visión o audio: no disponible; no se documenta ninguna capacidad multimodal.
- Reducción de rechazos: es el objetivo declarado por el nombre del repositorio, pero no está respaldado por ninguna evaluación en la información proporcionada.

## Casos de uso

- Experimentación en investigación sobre alineación y seguridad: el adaptador permite estudiar cómo un SFT de bajo coste modifica la tasa de rechazos de un modelo de código de 7B, comparando respuestas antes y después del merge con el modelo base.
- Reproducción de pipelines de fine-tuning: sirve como referencia práctica para montar un flujo con TRL, PEFT y Unsloth sobre un modelo de 7B en una única GPU, dado el reducido tamaño del adaptador (0,3 GB).
- Generación de código en entornos controlados y no productivos: para tareas de autocompletado o generación de fragmentos en cuadernos internos, siempre con revisión humana y sin exponer el modelo a usuarios finales.
- Desarrollo de asistentes de programación autoalojados: combinado con el modelo base y desplegado con vLLM o llama.cpp en hardware propio, para equipos que necesiten evitar APIs externas.
- Evaluación comparativa de adaptadores comunitarios: como muestra de un adaptador sin documentar, útil para construir conjuntos de pruebas que midan la degradación de capacidades tras un SFT agresivo.
- Docencia y formación técnica: ilustra de forma sencilla qué es un adaptador LoRA, cómo se distribuye en HuggingFace y qué riesgos implica publicar un modelo sin model card, sin licencia y sin evaluación.
- Filtrado o generación de texto en dominios sensibles: solo en entornos de investigación con revisión humana obligatoria, dado que el objetivo declarado del adaptador es reducir las negativas de rechazo y no existen evaluaciones de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna sección de evaluación cumplimentada, y los resultados de búsqueda web obtenidos no guardan relación con el modelo.

## Requisitos de hardware

- El adaptador por sí solo no es inferible: requiere cargar el modelo base `OBLITERATUS/Qwen2.5-Coder-7B-Instruct-OBLITERATED` o, alternativamente, fusionar el adaptador con el modelo base y guardar los pesos combinados.
- VRAM estimada tras el merge con un modelo de 7B: aproximadamente 15-16 GB en bf16/fp16, en torno a 8-9 GB en cuantización de 8 bits y entre 4 y 6 GB en cuantizaciones de 4 bits (Q4_K_M, AWQ o GPTQ). Son estimaciones genéricas para modelos de 7B, no medidas sobre este adaptador concreto.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 6000 Ada para servicio en bf16 con contexto largo; RTX 4090 (24 GB), RTX 3090 (24 GB) o RTX 4080 (16 GB) para inferencia en bf16 o 8 bits en una sola GPU.
- Cabe en GPU de consumo: sí, en tarjetas de 8 GB o más si se aplica cuantización de 4 bits; en 16 GB o más si se usa bf16 con contexto moderado.
- Opciones de despliegue: vLLM, TGI o SGLang tras fusionar el adaptador; llama.cpp u Ollama requieren convertir previamente los pesos fusionados a GGUF. El adaptador en formato PEFT se carga con `transformers` + `peft` mediante `PeftModel.from_pretrained`.
- Latencia y throughput estimados: no disponible. No hay mediciones publicadas para este adaptador.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de este adaptador, por lo que la comparación es estructural. Los valores marcados como "referencia pública" no han sido verificados en este repositorio.

| Modelo | Tipo | Parametros | Contexto | Licencia | Estado de publicacion |
|---|---|---|---|---|---|
| blackageek/qwen-coder-uncensored-lora | Adaptador LoRA (SFT) | Adaptador sobre base de clase 7B (no detallado) | No disponible | No disponible | Sin model card, sin benchmarks, sin licencia |
| OBLITERATUS/Qwen2.5-Coder-7B-Instruct-OBLITERATED | Modelo completo derivado | Clase 7B (no disponible el detalle) | No disponible | No disponible | Modelo base de este adaptador |
| Qwen/Qwen2.5-Coder-7B-Instruct | Modelo completo original | 7B (clase) | No disponible en esta ficha; referencia pública de la familia Qwen2.5: 32.768 tokens, ampliable por YaRN | Apache 2.0 (referencia pública) | Modelo oficial, con benchmarks publicados |
| Adaptadores LoRA comunitarios equivalentes (por ejemplo, fine-tunes de código sobre Llama o Qwen) | Adaptador LoRA | Variable | Heredado del base | Variable, a menudo sin declarar | Calidad y documentación muy dispares |

No se conocen alternativas directamente comparables dentro del mismo nicho ("modelo de código sin censura") con documentación verificable en la información disponible.

## Limitaciones y advertencias

- Ausencia total de model card: el autor no ha rellenado ninguna sección, por lo que se desconoce el dataset, el procedimiento y los hiperparámetros de entrenamiento. La reproducibilidad es nula.
- Sin licencia declarada: no se puede asumir permiso de uso comercial. Aunque el modelo original Qwen2.5-Coder-7B-Instruct se distribuye bajo Apache 2.0 según su documentación pública, la cadena de derivados (OBLITERATED y este adaptador) no declara licencia, lo que introduce incertidumbre legal.
- Riesgo elevado de contenido inapropiado: el objetivo declarado de reducir rechazos implica que el modelo puede generar contenido ofensivo, ilegal, inseguro o dañino sin filtros. No se ha publicado ninguna evaluación de seguridad ni de sesgos.
- Degradación de capacidades esperable: los SFT agresivos orientados a eliminar negativas suelen deteriorar la instrucción general, el razonamiento y el apego al formato. No hay benchmarks que cuantifiquen esta pérdida.
- Alucinación: sin datos de evaluación, no puede estimarse la tasa de alucinación. En tareas de código, el riesgo de generar APIs inexistentes o dependencias inventadas es alto en modelos de este tamaño sin verificación.
- Sin garantías de contexto o idioma: la ventana de contexto efectiva tras el SFT no está documentada y podría diferir de la del modelo base.
- Dependencia de un modelo base comunitario: `OBLITERATUS/Qwen2.5-Coder-7B-Instruct-OBLITERATED` es a su vez un derivado no oficial; su disponibilidad, estabilidad y licencia condicionan el uso de este adaptador.
- Cero adopción: 0 descargas y 0 "likes" en el momento de la consulta, sin señales de validación por parte de la comunidad.
- Uso en producción desaconsejado sin auditoría previa: no hay métricas de latencia, throughput, robustez ni seguridad que permitan justificar su despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/blackageek/qwen-coder-uncensored-lora
- Modelo base del adaptador: https://huggingface.co/OBLITERATUS/Qwen2.5-Coder-7B-Instruct-OBLITERATED
- Familia original (referencia pública del modelo base subyacente): https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Paper citado en la model card (calculadora de impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de carbono mencionada en la plantilla: https://mlco2.github.io/impact#compute

No se han encontrado papers, blogs, repositorios ni demos específicos de este adaptador en los resultados de búsqueda disponibles. Los resultados devueltos por la búsqueda web no guardan relación con el modelo (corresponden a material bibliográfico sobre Michel Foucault y no se incluyen por no ser pertinentes).
