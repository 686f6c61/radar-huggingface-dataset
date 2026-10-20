# cxmplex/sn92-ra-d

## Resumen

`cxmplex/sn92-ra-d` es un modelo especializado publicado en HuggingFace por el usuario cxmplex para la pista `risk_assessment` de REAX, el protocolo de la subred 92 de Bittensor (especificación `reax-spec/1`). No es un modelo de propósito general: se distribuye como un componente de un sistema de evaluación de riesgo dentro de una subred descentralizada, y su model card se limita a identificar la licencia (Apache-2.0) y las etiquetas del proyecto (`reax`, `bittensor`, `sn92`, `reax-spec`, `risk_assessment`).

El checkpoint contiene 8.953.803.264 parámetros (unos 8,95 mil millones) en formato safetensors, con un repositorio de 17,9 GB, lo que corresponde a pesos en precisión de 16 bits. La etiqueta de arquitectura del repositorio es `qwen3_5_text`, lo que apunta a un transformer decoder-only derivado de la familia Qwen3.5 en su variante de texto, aunque la model card no documenta capas, cabezas, ventana de contexto ni proceso de entrenamiento.

Su relevancia es acotada pero concreta: es un ejemplo de modelo verticalizado para una tarea de evaluación de riesgo dentro de un ecosistema cripto incentivado, con licencia permisiva y un tamaño que cabe en una sola GPU. La contrapartida es la ausencia total de documentación técnica, benchmarks y validación comunitaria (0 descargas y 0 likes en el momento de la consulta), por lo que cualquier evaluación seria exige probarlo contra el harness propio de la subred.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only; etiqueta de repositorio `qwen3_5_text` (familia Qwen3.5, variante texto). Configuración de capas y cabezas no disponible |
| Parámetros totales | 8.953.803.264 (~8,95 mil millones) |
| Parámetros activos | No aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible en el repositorio (solo pesos safetensors en 16 bits); cuantización a 8 y 4 bits viable mediante conversión externa |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repositorio de 17,9 GB) |
| Autor | cxmplex |
| Fecha de creación (HuggingFace) | 2026-10-20 |
| Fecha de actualización (HuggingFace) | 2026-10-20 |
| Descargas / likes | 0 / 0 |
| Pipeline declarado | No disponible |

## Arquitectura y entrenamiento

El repositorio declara la etiqueta de arquitectura `qwen3_5_text`, lo que sitúa el modelo en la estirpe de transformers decoder-only de la familia Qwen3.5 para texto. Con 8,95 mil millones de parámetros y pesos en 16 bits (17,9 GB), el tamaño es coherente con un modelo denso de la clase 8-9B, no con una arquitectura dispersa. La model card no especifica número de capas, dimensión oculta, tipo de atención (completa, lineal o híbrida), función de activación ni estrategia de tokenizador, de modo que estos detalles deben extraerse del `config.json` del repositorio antes de planificar cualquier despliegue.

Tampoco hay información sobre el entrenamiento: ni volumen de tokens, ni composición del corpus, ni si hubo ajuste supervisado, RLHF o DPO. Lo único que define la especialización es la etiqueta `risk_assessment` y la referencia a `reax-spec/1`, la especificación de la subred 92 de Bittensor, que sugiere un ajuste fino orientado a producir evaluaciones de riesgo en el formato que espera el protocolo. No se documentan innovaciones técnicas de inferencia (decodificación especulativa, atención lineal, modos de razonamiento extendido) y no hay ningún artefacto de evaluación publicado.

## Capacidades

- Evaluación de riesgo como tarea principal: el modelo está etiquetado para la pista `risk_assessment` de REAX (subred 92 de Bittensor, especificación `reax-spec/1`).
- Generación de texto en lenguaje natural heredada del modelo base Qwen3.5, sin documentación específica sobre calidad, longitud o estilo.
- Producción de salidas estructuradas para el protocolo: no confirmado en la información disponible; debe validarse contra el esquema de `reax-spec/1`.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (los idiomas del modelo base no se declaran en la ficha).
- Capacidades multimodales (visión, audio): no disponibles; la etiqueta `qwen3_5_text` indica variante exclusivamente de texto.
- Modo de razonamiento explícito (thinking): no disponible.

## Casos de uso

- Puntuación de riesgo de contrapartes en la subred 92: el modelo se integra como evaluador que recibe la información de una entidad o submission y devuelve una valoración de riesgo conforme a `reax-spec/1`; su tamaño de 8,95B permite ejecutarlo en una GPU por validador con latencia controlada.
- Triaje de alertas en pipelines de compliance: clasificación y priorización de alertas (KYC, sanciones, patrones anómalos) antes de la revisión humana, usando el modelo como primera capa de scoring sobre texto libre.
- Evaluación de riesgo en operaciones DeFi: análisis de texto asociado a propuestas de gobernanza, descripciones de pools o informes de auditoría para emitir una etiqueta de riesgo traducible a umbrales operativos.
- Validación de submissions en subredes de Bittensor: uso como evaluador automático que asigna una puntuación de riesgo a las contribuciones de los mineros, sirviendo de señal complementaria al mecanismo de consenso.
- Scoring de riesgo de crédito o seguros sobre expedientes textuales: extracción de factores de riesgo de informes y memorias y generación de una valoración agregada, con el modelo actuando como capa de razonamiento sobre texto no estructurado.
- Generación de informes de riesgo explicativos: redacción de resúmenes justificados a partir de la evidencia disponible, útil para documentar decisiones de aceptación o rechazo ante auditoría interna.
- Filtrado previo en un ensemble: uso del modelo como primera etapa barata (8,95B, una GPU) que descarta casos de bajo riesgo y reserva modelos mayores o revisión humana para los casos dudosos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K, evaluaciones de la pista `risk_assessment` ni comparaciones con otros participantes de la subred. Cualquier cifra de rendimiento debe obtenerse ejecutando el modelo contra el harness oficial de `reax-spec/1`.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits: ~17,9 GB solo de pesos, más caché KV; en la práctica 20-24 GB para contextos moderados.
- VRAM estimada en 8 bits: ~9-10 GB de pesos, 12-16 GB con caché KV y overhead del runtime.
- VRAM estimada en 4 bits (GGUF/AWQ/GPTQ): ~5-6 GB de pesos, 8-10 GB en total.
- GPU profesionales: A100 40 GB u 80 GB, H100, L40S y A6000 ejecutan el modelo en 16 bits con margen amplio.
- GPU de consumo: RTX 4090 (24 GB) en 16 bits con contexto limitado o en 8 bits con holgura; RTX 3090 (24 GB) en condiciones similares; RTX 4060 Ti 16 GB y RTX 4070 Ti Super 16 GB viables en 8 bits; 4 bits permite GPUs de 8-12 GB.
- Opciones de despliegue: vLLM, TGI y SGLang para servir en 16 bits; llama.cpp u Ollama requieren convertir previamente los safetensors a GGUF, ya que el repositorio no publica cuantizaciones.
- Latencia y throughput: no disponible. No hay datos publicados de tokens por segundo ni de latencia por petición, y el rendimiento dependerá del backend y del contexto real, que también se desconoce.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| cxmplex/sn92-ra-d | 8,95B | No disponible | Apache-2.0 | Especialista en evaluación de riesgo (REAX, sn92) | Pesos safetensors en HuggingFace; sin cuantizaciones |
| Qwen3 8B (referencia de la familia base) | ~8,2B | 32.768 tokens nativos, ampliable con YaRN | Apache-2.0 | Modelo generalista con modo thinking | Amplia: safetensors, GGUF, AWQ, integraciones en vLLM y Ollama |
| Llama 3.1 8B | 8,03B | 128.000 tokens | Licencia comunitaria Llama 3.1 | Modelo generalista, multilingüe | Muy amplia: safetensors, GGUF, múltiples backends |
| Mistral 7B v0.3 | 7,25B | 32.000 tokens | Apache-2.0 | Modelo generalista | Muy amplia: safetensors, GGUF, Ollama |

La comparación de rendimiento con estas alternativas no está disponible: no existen benchmarks publicados del modelo de cxmplex. La ventaja diferencial declarada es la especialización en la pista `risk_assessment` de REAX; frente a los generalistas, carece de su documentación, de su ecosistema de cuantizaciones y de validación independiente.

## Limitaciones y advertencias

- Documentación mínima: la model card solo declara licencia y etiquetas; no hay información de arquitectura, datos de entrenamiento, contexto ni idiomas.
- Ausencia total de benchmarks: no se puede verificar la calidad en `risk_assessment` ni compararla con otros modelos de la subred.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; el modelo no ha sido contrastado por terceros.
- Riesgo de alucinación: un evaluador de riesgo que genere justificaciones no verificadas puede producir falsos positivos o negativos con apariencia de rigor; conviene exigir salidas estructuradas y validarlas contra el esquema de `reax-spec/1`.
- Sesgos desconocidos: al no documentarse el corpus de entrenamiento ni el proceso de alineamiento, no es posible evaluar sesgos demográficos, geográficos o sectoriales.
- Contexto e idiomas no disponibles: no se debe asumir una ventana larga ni cobertura multilingüe; es necesario inspeccionar `config.json` y `tokenizer_config.json` antes de diseñar prompts.
- Licencia: Apache-2.0 permite uso comercial y modificación, pero conviene revisar el fichero `LICENSE` del repositorio y los términos del modelo base Qwen3.5, además de las reglas propias de la subred 92 de Bittensor.
- Uso previsto restringido: fuera de la pista `risk_assessment` de REAX el comportamiento no está documentado ni garantizado; no debe emplearse como modelo generalista en producción sin evaluación previa.
- Fecha de creación declarada 2026-10-20: verificar que los metadatos corresponden a la versión que se vaya a desplegar, dado que el repositorio solo tiene un minuto de diferencia entre creación y última actualización.

## Enlaces

- HuggingFace: https://huggingface.co/cxmplex/sn92-ra-d
- Model card del autor: incluida en el repositorio anterior (solo licencia y etiquetas)
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada
- Documentación de `reax-spec/1` y de la subred 92 de Bittensor: no disponible en la información proporcionada
