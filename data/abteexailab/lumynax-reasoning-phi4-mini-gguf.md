# AbteeXAILab/lumynax-reasoning-phi4-mini-gguf

## Resumen

LumynaX Reasoning Phi-4 Mini GGUF es un paquete de inferencia publicado por AbteeX AI Labs, un laboratorio con sede en Aotearoa (Nueva Zelanda), que integra el modelo base `microsoft/Phi-4-mini-reasoning` dentro de su marco propietario LumynaX. Se trata de un artefacto de investigación temprano, marcado explícitamente como legacy y desactualizado, que no debe usarse en producción. El paquete conserva los pesos originales del modelo de Microsoft sin modificación alguna; la "infusión" se realiza mediante enrutamiento en tiempo de ejecución, no mediante fusión de pesos.

El modelo base es Phi-4-mini-reasoning, un transformer de 3.800 millones de parámetros optimizado para razonamiento matemático y lógico, con una ventana de contexto de 64.000 tokens. Este release concreto se distribuye en formato GGUF para su ejecución con llama.cpp, lo que permite su despliegue local en hardware modesto. Su relevancia actual es principalmente histórica: documenta un experimento temprano del ecosistema LumynaX y sirve como referencia de reproducibilidad, pero no representa las capacidades actuales de AbteeX AI Labs.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Phi-4-mini-reasoning) |
| Parametros totales | 3.836.021.856 (3,8 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 64.000 tokens |
| Tipos de cuantizacion | no disponible (el repo contiene archivos GGUF, pero no se especifican los niveles) |
| Idiomas soportados | en (inglés), mi (maorí) |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo subyacente es Phi-4-mini-reasoning, un transformer denso de 3,8 B parámetros desarrollado por Microsoft, especializado en razonamiento matemático y lógico. No se dispone de información detallada sobre su arquitectura interna (número de capas, dimensiones, atención) en la documentación proporcionada. El entrenamiento del modelo base incluye ajuste fino para razonamiento, pero no se especifican los datos de entrenamiento ni el uso de RLHF o DPO.

El paquete LumynaX no modifica los pesos. La "infusión" se describe como un mecanismo de orquestación en el que LumynaX Core (el modelo de inteligencia principal) dirige la inferencia a través del modelo infundido sin alterar sus pesos. En este release, el método es "routed runtime and identity integration", lo que significa que el modelo original se ejecuta tal cual, con envoltorios de identidad y despliegue históricos. No hay innovación técnica en el propio paquete más allá del empaquetado GGUF.

## Capacidades

- Generación de texto y razonamiento matemático: el modelo base está optimizado para problemas de lógica y matemáticas, con capacidad de razonamiento paso a paso.
- Razonamiento multi-paso: Phi-4-mini-reasoning está diseñado para cadenas de razonamiento explícitas.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible; el paquete no documenta capacidades agénticas.
- Capacidades multilingües: limitadas a inglés y maorí según la etiqueta de idioma, aunque el modelo base probablemente soporta más idiomas; no se especifica.
- Modo thinking: el modelo base incluye razonamiento, pero no se detalla un modo "thinking" separado.
- Sin capacidades de visión ni audio: es un modelo de solo texto.

## Casos de uso

- Reproducción de experimentos de investigación: el paquete está pensado para verificar resultados históricos del proyecto LumynaX; se puede ejecutar localmente con llama.cpp y comparar salidas con el modelo base original.
- Evaluación de razonamiento matemático en entornos locales: gracias a su tamaño de 3,8 B y formato GGUF, puede usarse en portátiles con GPU de gama media para probar problemas de lógica y aritmética sin conexión.
- Estudio de integración de modelos mediante enrutamiento: el código y los manifiestos del release permiten analizar cómo LumynaX Core orquesta modelos externos, útil para desarrolladores interesados en arquitecturas de orquestación.
- Prototipado de aplicaciones educativas de matemáticas: el modelo base puede generar explicaciones paso a paso, aunque el paquete legacy no es recomendable para producción.
- Pruebas de compatibilidad con llama.cpp y vLLM: el repo incluye etiquetas de compatibilidad con vLLM y NIM, lo que permite validar la carga de GGUF en distintos motores de inferencia.
- Auditoría de licencias y soberanía de datos: al ser MIT y local-first, sirve como ejemplo de despliegue soberano de IA en entornos con requisitos de control de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni otras pruebas. El modelo base Phi-4-mini-reasoning tiene benchmarks públicos de Microsoft, pero este paquete GGUF no los reproduce ni los referencia. No se proporcionan datos de latencia ni throughput.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño del repo es de 2,5 GB, lo que sugiere cuantizaciones de baja precisión (probablemente Q4 o inferior), pero no se confirma el nivel exacto.
- GPU recomendadas: no disponible. Con 3,8 B parámetros y cuantización GGUF, podría ejecutarse en GPUs consumer como RTX 3060 (12 GB) o superiores, pero no hay datos oficiales.
- Compatibilidad con consumer GPU: probablemente sí, dado el formato GGUF y el tamaño, pero no está documentado.
- Opciones de despliegue: llama.cpp (indicado en la librería), vLLM (etiquetado como compatible), NIM de NVIDIA (candidato), NeMo (requiere conversión). No se detallan configuraciones específicas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LumynaX Reasoning Phi-4 Mini GGUF | 3,8 B | 64K | MIT | GGUF | Paquete legacy, pesos sin modificar |
| microsoft/Phi-4-mini-reasoning | 3,8 B | 64K | MIT | safetensors | Modelo base original |
| microsoft/Phi-4-mini-flash-reasoning | 3,8 B | 64K | MIT | safetensors | Variante optimizada para eficiencia |

La comparativa se limita a los modelos de la misma familia Phi-4-mini. No se dispone de comparaciones con otros modelos de razonamiento de tamaño similar (como Qwen2.5-3B o Llama-3.2-3B) en la información proporcionada.

## Limitaciones y advertencias

- El paquete está marcado como legacy y outdated: no se recomienda para producción y no representa las capacidades actuales de AbteeX AI Labs.
- No se han publicado benchmarks ni métricas de rendimiento para este release específico.
- La licencia MIT permite uso comercial, pero el modelo base puede tener restricciones adicionales; se debe revisar la licencia de Microsoft Phi-4-mini-reasoning.
- El soporte de idiomas se limita a inglés y maorí según la etiqueta, aunque el modelo base probablemente soporta más; no se garantiza calidad en otros idiomas.
- Riesgo de alucinación: inherente a los modelos de razonamiento; no se documentan medidas específicas de mitigación.
- Los envoltorios de identidad y despliegue son históricos y pueden no ser compatibles con versiones actuales de llama.cpp o vLLM.
- No se especifican los niveles de cuantización de los archivos GGUF, lo que dificulta estimar la degradación de calidad.

## Enlaces

- [HuggingFace - AbteeXAILab/lumynax-reasoning-phi4-mini-gguf](https://huggingface.co/AbteeXAILab/lumynax-reasoning-phi4-mini-gguf)
- [Repositorio fuente en GitHub](https://github.com/Aimaghsoodi/lumynax-reasoning-phi4-mini-gguf)
- [AbteeX AI Labs](https://abteex.com)
- [LumynaX](https://lumynax.com)
- [Modelo base microsoft/Phi-4-mini-reasoning](https://huggingface.co/microsoft/Phi-4-mini-reasoning)
- [Artículo de Microsoft sobre Phi-4-mini-flash-reasoning](https://azure.microsoft.com/en-us/blog/reasoning-reimagined-introducing-phi-4-mini-flash-reasoning/)
