# Ba2han/math-test-maxx

## Resumen

math-test-maxx es un modelo de lenguaje especializado en razonamiento matemático, desarrollado por Ba2han (Batuhan S) como un fine-tuning del modelo base `unsloth/Qwen2.5-3B-Instruct` mediante una adaptación LoRA basada en la receta "ReasonMaxxer offline-search" (v2). El modelo fusiona los pesos de 16 bits del base con la LoRA entrenada para mejorar el rendimiento en problemas de matemáticas de nivel escolar y competición, manteniendo un tamaño compacto de aproximadamente 3.09 mil millones de parámetros.

La relevancia de este modelo radica en su enfoque en matemáticas con una arquitectura ligera, lo que permite su ejecución en hardware de consumo y su integración en aplicaciones educativas o de asistencia técnica. Según los datos publicados, consigue una mejora modesta pero consistente sobre el modelo base en los conjuntos de evaluación GSM8K y MATH-500, con un incremento de +0.4 y +1.2 puntos porcentuales respectivamente. El modelo se distribuye bajo licencia Apache 2.0 y está disponible en formato safetensors, compatible con el ecosistema Transformers y text-generation-inference.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Qwen2.5) |
| Parametros totales | 3.085.938.688 (~3.09B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 (pesos originales en safetensors); otras cuantizaciones no especificadas |
| Idiomas soportados | no disponible (heredados del modelo base, no declarados en la ficha) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen2.5-3B-Instruct, un transformer decoder-only con atención causal estándar. Sobre esta base se aplicó una LoRA (r=16, α=32) en las proyecciones Q, K, V y O (QKVO) mediante la metodología ReasonMaxxer, que utiliza búsqueda offline para generar muestras de razonamiento y una pérdida con ponderación entrópica. El entrenamiento se realizó sobre 300 ítems de MATH-500 con 12 muestras de búsqueda offline por ítem, con una tasa de aprendizaje de 2e-5, batch efectivo de 8 (2×4) y gradiente máximo de 0.1. Se ejecutaron 774 micro-pasos equivalentes a 194 actualizaciones de Adam. Los pesos de la LoRA se fusionaron con el modelo base en precisión FP16.

No se menciona el uso de RLHF ni DPO; el ajuste es exclusivamente supervisado con la pérdida personalizada. El autor indica que una receta anterior con mayor learning rate (2e-4) y mayor clipping produjo una regresión en el rendimiento, por lo que esta versión es un reintento más conservador.

## Capacidades

- Generacion de texto y conversacion: al estar basado en Qwen2.5-Instruct, mantiene las capacidades conversacionales y de generacion de texto del modelo base.
- Razonamiento matematico: especializado en resolver problemas de matematicas de nivel escolar y competicion, con mejoras medidas en GSM8K y MATH-500.
- Razonamiento paso a paso: la metodologia ReasonMaxxer fomenta la generacion de cadenas de razonamiento explicito.
- No se especifican capacidades de tool calling, agentes, vision ni audio en la informacion proporcionada.
- Soporte multilingue: no declarado, aunque el modelo base Qwen2.5 soporta varios idiomas, no se confirma para este ajuste.

## Casos de uso

- Tutoria matematica automatizada: el modelo puede generar explicaciones paso a paso para problemas de aritmetica, algebra o geometria, sirviendo como asistente en plataformas educativas. Su tamano compacto permite desplegarlo en servidores modestos o incluso en local.
- Resolucion de problemas de nivel escolar: gracias a su rendimiento en GSM8K (85.0%), es adecuado para resolver problemas de matematicas de primaria y secundaria, integrable en chatbots educativos.
- Generacion de ejercicios y soluciones: puede crear enunciados de problemas y sus soluciones razonadas, util para generar contenido didactico de forma masiva.
- Evaluacion de razonamiento en pipelines de IA: como modelo pequeno con buenos resultados en matematicas, puede servir como componente de verificacion o generacion de respuestas en sistemas multiagente.
- Asistente de estudio para estudiantes: desplegado como aplicacion de consola o web, ofrece ayuda inmediata con deberes y preparacion de examenes.
- Investigacion en fine-tuning matematico: sirve como caso de estudio para metodologias de ajuste con busqueda offline, permitiendo reproducir y comparar recetas de entrenamiento.

## Benchmarks y rendimiento

El autor publica resultados bajo un protocolo propio (vLLM, prompt chat con caja, MathVerifier, greedy 0-shot), no comparables directamente con los numeros oficiales de Qwen. La tabla siguiente muestra la comparacion con el modelo base sin ajustar:

| Modelo | GSM8K (n=1319) | MATH-500 (n=500) |
| --- | ---: | ---: |
| Base `unsloth/Qwen2.5-3B-Instruct` | 84.6% | 61.6% |
| **math-test-maxx (merge)** | **85.0%** | **62.8%** |
| Diferencia | +0.4 pp | +1.2 pp |

Ademas, se reporta una evaluacion en bucle sobre 300 items (temperatura 0.6, n=4): pass@1 de 61.3% y pass@4 de 74.0%. No se proporcionan resultados en otros benchmarks como MMLU, HumanEval o AIME.

## Requisitos de hardware

- VRAM estimada: al tener ~3.09B parametros en FP16, la inferencia requiere aproximadamente 6.2 GB de VRAM (3.09B × 2 bytes) mas overhead de activaciones y cache. Con cuantizacion a 8 bits o 4 bits (no incluida de fabrica, pero posible mediante herramientas como llama.cpp o bitsandbytes) se podria reducir a ~3-4 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM, por ejemplo RTX 3060 (12 GB), RTX 4070, RTX 3090, o GPUs de datacenter como A10G o L4. En cuantizacion 4 bits podria ejecutarse en GPUs de 6 GB.
- Compatible con hardware consumer: si, cabe en GPUs de gama media y alta.
- Opciones de despliegue: al estar en formato safetensors y usar la libreria transformers, es compatible con vLLM, TGI (text-generation-inference), Ollama (si se convierte a GGUF) y llama.cpp. No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para otros modelos de tamano similar (p.ej. Llama-3.2-3B, Phi-3-mini, Gemma-2-2B) bajo el mismo protocolo de evaluacion. La unica comparacion directa disponible es con el modelo base Qwen2.5-3B-Instruct, que se muestra en la seccion de benchmarks. En terminos de licencia, tanto el base como este ajuste usan Apache-2.0, lo que permite uso comercial sin restricciones adicionales. Se puede considerar que este modelo es una alternativa ligera a modelos mas grandes como Qwen2.5-7B o Llama-3.1-8B para tareas matematicas, aunque con menor capacidad general.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo pequeno, puede generar respuestas incorrectas o inventadas en problemas complejos o fuera de su dominio de entrenamiento. No se han publicado evaluaciones de sesgo.
- Limitaciones de contexto: no se especifica la longitud de contexto; se asume la del modelo base (Qwen2.5-3B-Instruct suele soportar 32k tokens, pero no se confirma en esta ficha).
- Idiomas: no se declaran idiomas soportados; el entrenamiento se realizo sobre datos de MATH-500 (mayoritariamente en ingles), por lo que el rendimiento en otros idiomas puede ser inferior.
- Rendimiento matematico limitado: las mejoras sobre el base son marginales (+0.4 pp en GSM8K, +1.2 pp en MATH-500) y el modelo no alcanza el nivel de modelos grandes especializados en matematicas (p.ej. DeepSeek-Math o Qwen2.5-Math-7B).
- Dependencia del protocolo de evaluacion: los benchmarks publicados usan un protocolo propio (greedy 0-shot con MathVerifier), no son comparables con los numeros oficiales de Qwen ni con otras evaluaciones estandar.
- Reproducibilidad: el autor no proporciona los pesos de la LoRA por separado, solo el merge final, y no hay informacion sobre el dataset completo ni el codigo de entrenamiento (aunque se referencia el repositorio ReasonMaxxer).
- Produccion: al tener 0 descargas y 0 likes, es un modelo experimental sin validacion comunitaria; se recomienda evaluar exhaustivamente antes de usarlo en entornos criticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ba2han/math-test-maxx
- Repositorio ReasonMaxxer (fuente de la receta): https://github.com/ansz42/ReasonMaxxer
- Perfil del autor: https://huggingface.co/Ba2han
- Otro modelo del autor (referencia): https://huggingface.co/Ba2han/out2
