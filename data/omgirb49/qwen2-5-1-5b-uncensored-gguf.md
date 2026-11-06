# Omgirb49/qwen2.5-1.5b-uncensored-GGUF

## Resumen

`Omgirb49/qwen2.5-1.5b-uncensored-GGUF` es una conversión a formato GGUF del modelo `ElementMerc/qwen2.5-1.5b-uncensored`, a su vez derivado de Qwen2.5-1.5B mediante una técnica de *abliteration* (eliminación de la dirección de rechazo en el espacio de activaciones). El resultado es un modelo de 1.543.714.304 parámetros (aproximadamente 1,5 mil millones) que, según su autor, no rechaza peticiones, que es explícitamente el objetivo del modelo. El repositorio lo publica el usuario Omgirb49 y contiene únicamente los pesos cuantizados, no el proceso de entrenamiento ni datos de evaluación.

La relevancia de esta ficha es doble. Por un lado, documenta un caso de cuantización GGUF lista para `llama.cpp`, Ollama, LM Studio y Jan, con dos variantes (F16 y Q4_K_M). Por otro, incorpora un aviso de corrección del 1 de octubre de 2026 en el que se retiran todas las cifras de evaluación del modelo padre: no hay benchmarks válidos que citar. Cualquier uso en producción debe partir de esa premisa: el modelo no tiene métricas publicadas verificables y su licencia Apache 2.0 no exime de las obligaciones legales sobre el contenido generado.

El modelo hereda la arquitectura transformer de Qwen2.5-1.5B, con un contexto nativo de 32.768 tokens en la familia original (no confirmado en esta conversión concreta), y está orientado exclusivamente al inglés según la model card. Su tamaño reducido permite ejecución en CPU y en GPUs de consumo, lo que lo hace adecuado para experimentación local con contenido sin filtros, no para despliegues comerciales sin revisión humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-1.5B); modificada mediante abliteration |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en esta conversión; la familia Qwen2.5-1.5B declara 32.768 tokens en el modelo original |
| Tipos de cuantizacion | F16 y Q4_K_M (los dos ficheros publicados) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo padre) |

## Arquitectura y entrenamiento

La arquitectura de base es la de Qwen2.5-1.5B: un transformer decoder-only con atención de múltiples cabezas, RoPE y normalización RMSNorm, entrenado originalmente por Alibaba con un corpus multilingüe y fases de alineación (SFT y RLHF) que no se detallan en la información disponible. Sobre esa base, `ElementMerc/qwen2.5-1.5b-uncensored` aplica *abliteration*: una modificación de los pesos que elimina la dirección de activación asociada al rechazo de peticiones, de modo que el modelo deja de negarse a responder. La model card del repositorio cuantizado no describe la técnica con más detalle ni indica el número de tokens adicionales empleados, si los hubo.

La conversión a GGUF se realizó con `convert_hf_to_gguf.py` a partir de los safetensors del padre, y la cuantización con `llama-quantize`. El autor afirma que cada fichero fue cargado y probado con generación antes de publicarse. No hay información sobre datos de entrenamiento, composición del dataset, fases de RLHF/DPO posteriores a la abliteration ni innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.). El aviso de corrección del 1 de octubre de 2026 retira las cifras de evaluación del modelo padre, por lo que no se puede afirmar nada sobre su rendimiento medido.

## Capacidades

- Generación de texto en inglés con un modelo de 1,5 mil millones de parámetros; calidad limitada por el tamaño.
- Razonamiento básico y respuesta a preguntas simples; no se han publicado evaluaciones que lo cuantifiquen.
- Generación de código y matemáticas a nivel de modelo pequeño; sin benchmarks verificables.
- Sin filtros de rechazo: responde a peticiones que el Qwen2.5 original rechazaría (es el propósito declarado de la abliteration).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el tamaño y la falta de evaluaciones lo hacen poco recomendable.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Experimentación local con modelos sin filtros: el modelo se ejecuta en `llama.cpp` u Ollama con una sola GPU de consumo o incluso en CPU, lo que permite probar comportamiento abliterated sin infraestructura dedicada.
- Investigación sobre alineación y seguridad: sirve como caso de estudio de qué cambia (y qué se degrada) al eliminar la dirección de rechazo en un modelo pequeño, comparándolo con el Qwen2.5-1.5B original.
- Generación de texto creativo sin restricciones temáticas: relatos, guiones o borradores donde el autor quiere evitar negativas del modelo, asumiendo revisión humana posterior.
- Pruebas de pipelines GGUF: validar integraciones con Ollama, LM Studio o Jan antes de desplegar modelos mayores, usando el Q4_K_M por su tamaño reducido.
- Prototipado de chatbots de dominio acotado en inglés: con contexto moderado y sin requisitos de alta calidad, para validar flujos conversacionales antes de migrar a un modelo mayor.
- Evaluación de cuantización: comparar F16 frente a Q4_K_M en tareas concretas para medir la degradación introducida por la cuantización en un modelo pequeño, tal como sugiere la propia model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye un aviso de corrección (1 de octubre de 2026) que retira explícitamente todas las cifras de evaluación del modelo padre, por lo que no existen métricas válidas que citar para MMLU, HumanEval, GSM8K ni ninguna otra tarea.

## Requisitos de hardware

- VRAM estimada: el fichero F16 ocupa aproximadamente 3,1 GB (1,54 mil millones de parámetros × 2 bytes); el Q4_K_M ronda 1 GB (el repositorio completo pesa 4,1 GB con ambos ficheros).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para F16 (GTX 1650, RTX 3050, RTX 4060); el Q4_K_M cabe en 2 GB y funciona en GPUs integradas con suficiente memoria compartida.
- Cabe en GPU de consumo: sí, en todas las RTX y en muchas GTX; también en CPU pura con `llama.cpp`.
- Opciones de despliegue: `llama.cpp` (`llama-server`), Ollama, LM Studio y Jan, según la model card. No se mencionan vLLM ni TGI para este formato.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Omgirb49/qwen2.5-1.5b-uncensored-GGUF | 1,54 B | no disponible (32.768 en Qwen2.5-1.5B) | Apache 2.0 | GGUF | Abliterated; sin benchmarks válidos |
| Qwen2.5-1.5B (Alibaba) | 1,54 B | 32.768 | Apache 2.0 | safetensors, GGUF | Modelo original alineado; benchmarks publicados por el autor |
| ElementMerc/qwen2.5-1.5b-uncensored | 1,54 B | no disponible | Apache 2.0 | safetensors | Modelo padre; evaluaciones retiradas |
| Llama 3.2 1B | 1,24 B | 128.000 | Llama 3.2 Community License | safetensors, GGUF | Alternativa de tamaño similar con contexto mayor y licencia restrictiva |

## Limitaciones y advertencias

- La abliteration elimina el rechazo de forma deliberada: el modelo puede generar contenido dañino, ilegal o sexual sin filtros. No es apto para aplicaciones orientadas al público sin moderación externa.
- No hay benchmarks válidos: todas las cifras de evaluación del modelo padre fueron retiradas el 1 de octubre de 2026. Cualquier afirmación de rendimiento carece de respaldo.
- La cuantización Q4_K_M degrada la calidad, y en un modelo de 1,5 B hay poco margen: la propia model card recomienda verificar resultados contra el F16 cuando importen.
- Sesgos conocidos: no documentados en la información disponible; hereda los del corpus de Qwen2.5 y los de la abliteration, que puede amplificar respuestas extremas.
- Riesgo de alucinación elevado por el tamaño reducido del modelo y la falta de evaluaciones.
- Idiomas: solo inglés declarado; el rendimiento en castellano no está garantizado.
- Licencia Apache 2.0: permite uso comercial, pero no exime de responsabilidad legal sobre el contenido generado ni de las políticas de las plataformas de despliegue.
- Contexto: la longitud efectiva en esta conversión GGUF no está confirmada; el ejemplo de la model card usa `-c 4096`, muy por debajo del contexto nativo de la familia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Omgirb49/qwen2.5-1.5b-uncensored-GGUF
- Modelo padre: https://huggingface.co/ElementMerc/qwen2.5-1.5b-uncensored
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Modelo original Qwen2.5-1.5B: no disponible en la información proporcionada (referencia habitual: https://huggingface.co/Qwen/Qwen2.5-1.5B)
