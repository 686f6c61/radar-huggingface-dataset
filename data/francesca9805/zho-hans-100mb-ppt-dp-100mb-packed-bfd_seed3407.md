# francesca9805/zho-hans-100mb-ppt-Dp-100mb-packed-bfd_seed3407

## Resumen

El modelo `francesca9805/zho-hans-100mb-ppt-Dp-100mb-packed-bfd_seed3407` es un ajuste fino supervisado (SFT) del modelo base `goldfish-models/zho_hans_100mb`, desarrollado por el usuario de HuggingFace francesca9805. Se trata de un artefacto de investigación académica, presumiblemente ligado al proyecto Goldfish de la Universidad de Groningen (el enlace de seguimiento apunta a una cuenta de Weights & Biases de la Universidad de Groningen), cuyo propósito es estudiar el comportamiento de modelos monolingües pequeños entrenados sobre corpus reducidos.

Técnicamente es un transformer de tipo GPT-2 con 124.770.816 parámetros (aproximadamente 125 millones), almacenado en safetensors y con un repositorio de 0,3 GB. Se ha entrenado con la librería TRL (versión 0.23.0) mediante SFT, partiendo del modelo base, que según su identificador está orientado a chino simplificado (`zho_hans`) con un corpus de 100 MB. No se especifica configuración de contexto, licencia ni idiomas soportados en la información disponible.

Su relevancia actual es limitada y de carácter experimental: no tiene descargas ni likes, no publica resultados de benchmarks y su nomenclatura sugiere una ablación de hiperparámetros (dataset empaquetado, estrategia `bfd`, semilla 3407) más que un modelo listo para producción. Resulta útil como referencia para quien investigue ajuste fino de modelos GPT-2 pequeños en contextos multilingües o de bajos recursos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo GPT-2 (etiqueta `gpt2` en HuggingFace) |
| Parametros totales | 124.770.816 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la model card; al ser safetensors es convertible a GGUF/AWQ/GPTQ mediante herramientas estándar |
| Idiomas soportados | No disponible (el identificador del modelo base, `zho_hans`, sugiere chino simplificado, sin confirmación oficial) |
| Licencia | No disponible (la model card incluye un campo `licence: license` sin concretar) |
| Formato de pesos | Safetensors |
| Modelo base | goldfish-models/zho_hans_100mb |
| Tamaño del repositorio | 0,3 GB |
| Librería | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia GPT-2, con 124.770.816 parámetros, lo que lo sitúa en el rango de GPT-2 small. No hay información pública en la ficha sobre número de capas, dimensiones ocultas, cabezas de atención ni longitud máxima de posición, por lo que no se puede confirmar la ventana de contexto efectiva. El modelo se distribuye únicamente en safetensors de precisión completa o media (no se detalla el `dtype` exacto).

El entrenamiento se realizó mediante SFT con TRL 0.23.0, sobre Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1. El nombre del modelo indica el uso de un dataset empaquetado (`100mb-packed`), una estrategia de selección u ordenación denominada `bfd` y la semilla `seed3407`; no se documenta el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas posteriores de RLHF o DPO. No se declara ninguna innovación técnica (atención lineal, decodificación especulativa, MoE o SSM).

## Capacidades

- Generación de texto autoregresiva mediante el pipeline `text-generation` de Transformers, con soporte de entrada en formato de lista de mensajes con rol `user`.
- Compatibilidad declarada con text-generation-inference y con endpoints compatibles (etiquetas `text-generation-inference` y `endpoints_compatible`).
- Ajuste por instrucciones básico, derivado del entrenamiento SFT con TRL.
- Capacidad multilingüe: no confirmada. El modelo base apunta a chino simplificado, pero la model card no declara idiomas.
- Tool calling / function calling: no documentado.
- Uso como agente o razonamiento multi-paso: no documentado.
- Modo thinking, visión o audio: no disponible.
- Razonamiento matemático o generación de código específica: no documentado.

## Casos de uso

- Experimentación académica en ajuste fino: sirve como punto de comparación para estudiar el efecto del empaquetado de dataset (`packed`), la estrategia `bfd` y la semilla en modelos GPT-2 pequeños, replicando el entrenamiento con TRL.
- Investigación en modelos monolingües de bajos recursos: al derivar de un corpus de 100 MB en chino simplificado, permite analizar qué capacidades lingüísticas se adquieren con presupuestos de datos muy reducidos.
- Pruebas unitarias de pipelines de generación de texto: su tamaño (0,3 GB) permite levantarlo en CI para validar integraciones con Transformers, TGI o endpoints compatibles sin coste de GPU relevante.
- Docencia y demostraciones: ejecutable en CPU o en cualquier GPU consumer, es adecuado para explicar el ciclo completo de SFT con TRL en cursos de NLP.
- Generación de texto auxiliar de bajo coste: en entornos sin GPU, puede producir continuaciones cortas de texto en chino o en el dominio del dataset de ajuste, siempre con revisión humana.
- Base para ablaciones de decodificación y sampling: al ser pequeño, permite barrer temperatura, top-p y top-k con un coste computacional mínimo y comparar distribuciones.
- Prototipado de interfaces conversacionales: el `pipeline` acepta mensajes con rol, de modo que puede integrarse en un prototipo de chat para validar el flujo de extremo a extremo antes de migrar a un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en FP32 y 0,25 GB en FP16/BF16 solo para los pesos; con caché KV y overhead de runtime, entre 1 y 2 GB en la práctica para contextos cortos.
- Cuantización a 8 bits: en torno a 0,13 GB de pesos; a 4 bits, en torno a 0,07 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1050 Ti, GTX 1650, RTX 3050, T4, etc.). No requiere A100, H100 ni RTX 4090.
- Cabe holgadamente en GPU consumer e incluso en CPU: la inferencia en CPU es viable con latencias de decenas a cientos de milisegundos por token, aunque no se han publicado medidas.
- Opciones de despliegue: Transformers (biblioteca declarada), text-generation-inference (etiqueta presente), endpoints compatibles con la API de Inference Endpoints; llama.cpp u Ollama requerirían una conversión previa a GGUF, no documentada por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| francesca9805/zho-hans-100mb-ppt-Dp-100mb-packed-bfd_seed3407 | 124,77 M | No disponible | No disponible | HuggingFace, 0 descargas | Ajuste SFT experimental |
| goldfish-models/zho_hans_100mb (modelo base) | No disponible en la información proporcionada | No disponible | No disponible | HuggingFace | Modelo monolingüe de corpus de 100 MB |
| Otros modelos de la familia goldfish-models para otras lenguas | No disponible | No disponible | No disponible | HuggingFace | Alternativas de misma categoría (monolingües, 100 MB) |
| GPT-2 small (referencia arquitectónica) | 124 M | 1024 tokens (arquitectura original) | No disponible en la información proporcionada | Ampliamente disponible | Mismo orden de magnitud en parámetros; no comparable en rendimiento sin benchmarks |

No se dispone de resultados de benchmarks que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad de generación, razonamiento o fidelidad lingüística.
- Riesgo elevado de alucinación y de texto incoherente: un modelo de ~125 M de parámetros ajustado sobre un corpus de 100 MB tiene una capacidad de modelado del lenguaje muy limitada.
- Idiomas no declarados: no se puede asumir competencia en castellano ni en lenguas distintas de la del corpus de preentrenamiento.
- Longitud de contexto desconocida: no se documenta la ventana máxima, lo que impide planificar usos con entradas largas.
- Licencia sin concretar: el campo `licence: license` de la model card no especifica términos, por lo que el uso comercial queda en un limbo legal y no debería asumirse permitido.
- Artefacto sin mantenimiento: 0 descargas, 0 likes y una ventana de publicación de seis minutos entre creación y última actualización, lo que sugiere un experimento puntual sin soporte.
- Sesgos: no evaluados ni documentados; al derivar de un corpus web reducido, es probable que herede sesgos de esa fuente, pero no hay análisis disponible.
- No apto para producción: sin evaluación, sin versionado semántico y sin garantías de licencia, no debería desplegarse en entornos con usuarios reales.
- Los resultados de búsqueda web asociados a esta consulta no contienen información relacionada con el modelo (corresponden a un portal sanitario húngaro), por lo que no aportan datos verificables.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/zho-hans-100mb-ppt-Dp-100mb-packed-bfd_seed3407
- Modelo base: https://huggingface.co/goldfish-models/zho_hans_100mb
- Seguimiento del entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/b2qyjxa4
- Repositorio de TRL: https://github.com/huggingface/trl
- Paper de TRL (citado en la model card): von Werra et al., "TRL: Transformer Reinforcement Learning", 2020.
