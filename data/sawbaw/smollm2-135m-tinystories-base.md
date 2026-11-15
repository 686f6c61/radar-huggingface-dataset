# SawBaw/SmolLM2-135M-TinyStories-Base

## Resumen

SmolLM2-135M-TinyStories-Base es un modelo de lenguaje de 134.515.008 parámetros (aproximadamente 135 millones) publicado por el usuario SawBaw en Hugging Face. Se trata de un ajuste fino (fine-tuning) del modelo base SmolLM2-135M de Hugging Face, orientado a la generación de texto con un estilo narrativo sencillo, presumiblemente inspirado en el corpus TinyStories. El nombre del repositorio sugiere este origen, aunque la model card no lo confirma de forma explícita.

El modelo emplea una arquitectura transformer de tipo Llama, tal como indican los tags del repositorio (`llama`) y el formato de pesos `safetensors`. Con 135 millones de parámetros, está diseñado para ejecutarse en hardware muy modesto, incluyendo CPU y GPUs de consumo, lo que lo hace adecuado para experimentación, prototipado rápido y despliegue en entornos con recursos limitados.

La relevancia de este modelo radica en su tamaño reducido y su enfoque en la generación de texto narrativo simple. No obstante, la información pública es extremadamente escasa: la model card es la plantilla autogenerada por Hugging Face sin datos rellenados, y no se especifican licencia, idiomas, datos de entrenamiento ni resultados de evaluación. Cualquier uso en producción debería ir precedido de una evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (según tag `llama`) |
| Parametros totales | 134.515.008 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; cuantización a GGUF/AWQ no documentada) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Tamano del repo | 0,5 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo Llama, según el tag del repositorio y la librería `transformers`. Con 134,5 millones de parámetros, se sitúa en la misma escala que el SmolLM2-135M original de Hugging Face, del que presumiblemente deriva mediante ajuste fino. No hay información en la model card sobre el número de capas, dimensiones ocultas, cabezas de atención ni la longitud de contexto nativa.

En cuanto al entrenamiento, la model card no proporciona ningún dato: ni el número de tokens, ni la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o SFT. El nombre del repositorio (`TinyStories-Base`) sugiere un ajuste fino sobre el corpus TinyStories, un conjunto de historias cortas con vocabulario restringido diseñado para entrenar modelos pequeños, pero esta afirmación no está confirmada en la documentación disponible. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto autoregresiva, orientada presumiblemente a narrativa sencilla y vocabulario restringido (según el nombre del repositorio).
- Conversación multi-turno: el tag `conversational` sugiere soporte para diálogo, aunque no se detalla el formato de plantilla de chat.
- Compatibilidad con `text-generation-inference` y `endpoints_compatible`, lo que facilita su despliegue en infraestructuras de inferencia estándar.
- No hay evidencia documentada de soporte de tool calling, function calling, agentes, razonamiento multi-paso, matemáticas avanzadas, código, visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidades multilingües: no disponibles; no se especifica ningún idioma.

## Casos de uso

- Prototipado de pipelines de generación de texto: por su tamaño de 135 millones de parámetros, permite iterar rápidamente en local sin necesidad de GPU dedicada, validando flujos de preprocesado, tokenización y postprocesado antes de escalar a modelos mayores.
- Generación de historias cortas y contenido narrativo simple: el nombre `TinyStories` sugiere que el modelo está ajustado para producir relatos breves con vocabulario sencillo, útil en aplicaciones educativas o de entretenimiento infantil, siempre que se valide la calidad y seguridad del output.
- Experimentación académica con modelos pequeños: sirve como caso base para estudiar el efecto del ajuste fino en modelos de 135M, comparando comportamiento antes y después del fine-tuning sobre un corpus específico.
- Despliegue en dispositivos de borde (edge): con 0,5 GB de pesos en safetensors (y menos tras cuantización a 8 o 4 bits), puede ejecutarse en CPUs modernas, Raspberry Pi o GPUs integradas para tareas de generación de texto de baja latencia y sin conexión.
- Generación de datos sintéticos a pequeña escala: puede emplearse para producir textos de relleno o ejemplos simples en pipelines de aumento de datos, con revisión humana posterior.
- Pruebas de integración con `text-generation-inference`: al ser compatible con endpoints estándar, sirve para validar infraestructura de serving antes de desplegar modelos de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,27 GB en FP16 (2 bytes por parámetro × 134,5M), alrededor de 0,14 GB en cuantización de 8 bits y unos 0,07 GB en 4 bits, sin contar overhead de activaciones y caché KV.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; tarjetas como RTX 3060, RTX 4060, GTX 1650 o incluso GPUs integradas pueden ejecutarlo sin problemas.
- Cabe holgadamente en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en CPU.
- Opciones de despliegue: `transformers` (nativo), `text-generation-inference` (según tag), y presumiblemente `llama.cpp`/`Ollama` si se generan pesos GGUF, aunque no se documenta su disponibilidad en el repositorio.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SawBaw/SmolLM2-135M-TinyStories-Base | 134,5M | No disponible | No disponible | Hugging Face |
| HuggingFaceTB/SmolLM2-135M | 135M | 8.192 tokens (modelo base de referencia) | Apache 2.0 (modelo base de referencia) | Hugging Face |
| HuggingFaceTB/SmolLM2-135M-Instruct | 135M | 8.192 tokens (modelo base de referencia) | Apache 2.0 (modelo base de referencia) | Hugging Face |

Nota: los datos de SmolLM2-135M y SmolLM2-135M-Instruct corresponden a los modelos base públicos de Hugging Face, de los que presumiblemente deriva este ajuste fino; no se dispone de confirmación en la información proporcionada. No se dispone de benchmarks comparativos para este modelo concreto.

## Limitaciones y advertencias

- La model card está autogenerada y vacía: no hay información sobre sesgos, datos de entrenamiento, evaluación ni uso previsto.
- Riesgo elevado de alucinación y de generar texto incoherente fuera del dominio narrativo simple para el que presumiblemente fue ajustado.
- Longitud de contexto desconocida: no se puede garantizar el comportamiento en conversaciones o documentos largos.
- Idiomas soportados no documentados: no hay garantía de calidad en castellano ni en ningún otro idioma distinto del inglés (si el corpus TinyStories es la base).
- Licencia no disponible: no se puede asumir uso comercial sin consultar al autor; el modelo base SmolLM2 es Apache 2.0, pero el ajuste fino podría tener condiciones distintas no declaradas.
- Sin soporte documentado de tool calling, agentes ni razonamiento multi-paso: no apto para pipelines agénticos sin validación previa.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni evidencia de uso en producción.
- Para cualquier despliegue en producción, se recomienda evaluar el modelo contra el SmolLM2-135M original y realizar pruebas de seguridad y calidad específicas del dominio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SawBaw/SmolLM2-135M-TinyStories-Base
- Paper de referencia citado en los tags (Machine Learning Impact calculator, Lacoste et al. 2019): https://arxiv.org/abs/1910.09700
- Modelo base presumible (SmolLM2-135M): https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Modelo instruct presumible (SmolLM2-135M-Instruct): https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
