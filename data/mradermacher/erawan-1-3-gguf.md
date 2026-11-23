# mradermacher/erawan-1.3-GGUF

## Resumen

Erawan 1.3 es un modelo de lenguaje de aproximadamente 1.720 millones de parámetros (etiquetado comercialmente como "2B") desarrollado por Airavat-AI. Se trata de un ajuste fino (fine-tuning) mediante LoRA sobre una base de la familia Qwen3, orientado específicamente a casos de uso agénticos: uso de herramientas (tool use), llamada a funciones (function calling) y razonamiento multi-paso. El repositorio analizado aquí es la versión cuantizada en formato GGUF publicada por mradermacher, que facilita su despliegue en hardware de consumo mediante llama.cpp y derivados.

El modelo está pensado para entornos donde se necesita un asistente ligero capaz de orquestar llamadas a APIs y razonar sobre los resultados, sin los requisitos de hardware de modelos de mayor tamaño. Al estar construido sobre Qwen3 y distribuirse bajo licencia Apache 2.0, resulta atractivo para integraciones en producción y para experimentación sin restricciones comerciales.

La relevancia actual radica en la combinación de tres factores: un tamaño reducido que permite ejecución local, una especialización explícita en flujos agénticos y una licencia permisiva. La información pública disponible es limitada en cuanto a detalles de entrenamiento y evaluación, por lo que varias especificaciones se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3 con ajuste fino LoRA) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (version cuantizada); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3, un transformer decoder-only con atención causal estándar. Sobre esa base, Airavat-AI aplicó un ajuste fino mediante LoRA (Low-Rank Adaptation) para especializarlo en tareas agénticas, tool use, function calling y razonamiento. El tamaño real de parámetros, según los pesos en safetensors del modelo base, es de 1.720.574.976, lo que lo sitúa en la franja de modelos pequeños dentro de la familia Qwen3.

No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset de ajuste fino, ni si se emplearon técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas más allá de la propia especialización vía LoRA. La model card original no incluye detalles sobre la estrategia de alineación ni sobre el proceso de curación de datos.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento multi-paso y cadenas de pensamiento (orientado a tareas de reasoning).
- Uso de herramientas (tool use) y llamada a funciones (function calling), lo que permite integrarlo en pipelines que invocan APIs externas.
- Comportamiento agéntico: planificación y ejecución de subtareas en varios pasos.
- Ajuste fino específico sobre Qwen3, lo que hereda las capacidades generales de la base.
- Capacidades multilingües: limitadas al inglés según la model card.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Orquestación de agentes en local: el modelo puede actuar como planificador que decide qué herramienta invocar en cada paso, adecuado para prototipos de agentes que corren en una sola GPU de consumo gracias a su tamaño reducido y a las cuantizaciones de ~1 GB.
- Automatización de llamadas a APIs: gracias al soporte de function calling, se puede usar para transformar lenguaje natural en llamadas estructuradas a servicios REST, con validación posterior del esquema.
- Asistente de línea de comandos: integrable en herramientas CLI que necesitan interpretar instrucciones y ejecutar comandos o scripts, con la ventaja de que el modelo cabe en memoria junto con el resto del sistema.
- Enrutamiento de consultas: clasificar y derivar peticiones de usuario a distintos backends o herramientas según la intención detectada, aprovechando su entrenamiento en tool use.
- Prototipado rápido de flujos agénticos: al ser Apache 2.0 y ejecutable con llama.cpp/Ollama, sirve para validar arquitecturas de agentes antes de escalar a modelos mayores.
- Despliegue en entornos con recursos limitados: aplicaciones de escritorio o edge donde no es viable un modelo de 7B o superior, usando cuantizaciones Q4_K_M (~1,2 GB) con buena relación calidad/tamaño.
- Investigación sobre fine-tuning agéntico: como punto de partida reproducible para estudiar cómo se comporta un LoRA sobre Qwen3 en tareas de razonamiento y uso de herramientas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - Q2_K (~0,9 GB): apto para GPUs con 2 GB o incluso CPU.
  - Q4_K_M (~1,2 GB): recomendado para uso general; requiere ~2 GB de VRAM incluyendo overhead de contexto.
  - Q8_0 (~1,9 GB): requiere ~3 GB de VRAM.
  - f16 (~3,5 GB): requiere ~4-5 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna con 4 GB o más (RTX 3050, RTX 4060, RTX 4090); también funciona en CPU mediante llama.cpp.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones habituales (Q4_K_M y superiores) en GPUs con 4 GB o más.
- Opciones de despliegue: llama.cpp, Ollama (a partir del GGUF), LM Studio, y servidores compatibles con la API de endpoints (el repo incluye la etiqueta `endpoints_compatible`). Para el modelo base en safetensors, transformers con vLLM o TGI si se convierte.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Erawan 1.3 (este) | ~1,72B | no disponible | Apache 2.0 | GGUF / safetensors | Especializado en tool use y agentes |
| Qwen3 base (familia) | ~1,7B (variante pequeña) | no disponible | Apache 2.0 | safetensors / GGUF | Modelo generalista del que deriva |
| Alternativas de ~2B agénticas | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables verificables |

La comparación cuantitativa con alternativas no es posible con la información disponible, ya que no se han publicado benchmarks del modelo ni se han identificado en la documentación modelos directamente comparables con métricas verificables.

## Limitaciones y advertencias

- Idiomas: la model card declara únicamente inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación: inherente a modelos de este tamaño; el ajuste fino agéntico no elimina la posibilidad de invocar herramientas inexistentes o con parámetros incorrectos.
- Contexto: la longitud de contexto no está documentada, lo que impide planificar despliegues con ventanas largas sin verificación empírica.
- Sesgos: no se documentan evaluaciones de sesgo ni de seguridad; al derivar de Qwen3 y de un dataset de ajuste fino no público, los sesgos heredados no están caracterizados.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de la base Qwen3 y del dataset de ajuste fino original.
- Producción: la falta de benchmarks publicados y de detalles de entrenamiento hace recomendable una evaluación propia antes de desplegarlo en entornos críticos.
- El repositorio analizado es una cuantización de terceros (mradermacher); la calidad de las cuantizaciones de baja precisión (Q2_K, Q3_K) puede degradar notablemente el razonamiento y el function calling.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/erawan-1.3-GGUF
- Modelo base: https://huggingface.co/AIRAVAT-AI-ML/erawan-1.3
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/erawan-1.3-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#erawan-1.3-GGUF
- Guía de uso de GGUF (referencia TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
