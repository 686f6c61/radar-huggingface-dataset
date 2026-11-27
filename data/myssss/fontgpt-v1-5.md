# myssss/fontgpt-v1.5

## Resumen

fontgpt v1.5 es un modelo generativo de tipografías desarrollado por el usuario independiente myssss (publicado en Hugging Face bajo el identificador `myssss/fontgpt-v1.5`). Se trata de un transformer decoder-only de 179,7 millones de parámetros que genera glifos de fuentes en formato de contorno vectorial, condicionado por el carácter correspondiente y con capacidad de producir hasta 16 glifos de una misma fuente por secuencia. No es un modelo de lenguaje general: su dominio es exclusivamente la generación de formas tipográficas.

La versión 1.5 es un preentrenamiento del nuevo tokenizador nativo de contornos denominado `outline2`, que sustituye al tokenizador de la versión 1. Es, según el propio autor, una "publicación rápida, no pulida": el repositorio contiene únicamente los pesos en bruto (`fontgpt_v1.5.pt`) en el paso 12.050, sin estado del optimizador, sin muestras, sin scripts de generación y sin evaluaciones más allá de la pérdida en validación.

Su relevancia es de nicho pero concreta: propone un enfoque autoregresivo sobre representaciones de contorno ("pen-walk") para la síntesis de glifos, un problema clásico en diseño tipográfico y en pipelines de fuentes variables. Con 0 descargas y 0 likes en el momento de la consulta, es un artefacto de investigación incipiente, no un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con SwiGLU, skips tipo U-Net y puertas de atención |
| Parámetros totales | 179,7 M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.560 tokens (block size) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (el modelo no procesa lenguaje natural; genera glifos) |
| Licencia | other |
| Formato de pesos | `.pt` (checkpoint PyTorch con claves `model`, `model_config`, `data_config`, `merges`, `sources`, `step`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 16 capas, anchura 768 y 12 cabezas de atención, con MLP de tipo SwiGLU. Incorpora conexiones residuales con skips estilo U-Net y puertas de atención (attention gates), un diseño poco habitual en modelos puramente autoregresivos que sugiere un sesgo hacia la coherencia global de la secuencia de glifos. El vocabulario es de 1.085 tokens y el tamaño de bloque de 2.560, suficiente para codificar hasta 16 glifos de una misma fuente en una sola secuencia.

El entrenamiento se realizó durante 12.050 pasos con un cooldown lineal de 2.250 pasos, consumiendo aproximadamente 1.700 millones de tokens reales. La innovación central es el tokenizador `outline2`, configurado con `--o2_q 128 --o2_nphi 23 --o2_nkap 8 --o2_tmode 1 --o2_fuse --o2_fine 8`, que tokeniza directamente los contornos vectoriales de los glifos en lugar de rasterizarlos. No se documenta el uso de RLHF, DPO ni ajuste por preferencias; es un preentrenamiento puro sobre datos de fuentes.

## Capacidades

- Generación de glifos en formato de contorno vectorial, condicionada por el carácter objetivo.
- Generación de hasta 16 glifos de una misma fuente por secuencia, lo que permite mantener consistencia estilística intra-fuente.
- Tokenización nativa de contornos mediante `outline2`, sin paso intermedio de rasterización.
- Modelado autoregresivo de trazos ("pen-walk") sobre la representación de contorno.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües ni de procesamiento de lenguaje natural.
- No dispone de modo thinking, visión, audio ni otras capacidades multimodales.

## Casos de uso

- Asistencia al diseño de fuentes: dado un conjunto de glifos existentes de una fuente en desarrollo, el modelo puede generar los glifos restantes manteniendo coherencia de estilo, aprovechando su condicionamiento por carácter y su ventana de 16 glifos por secuencia.
- Prototipado rápido de tipografías: un diseñador puede generar borradores de contornos para revisar direcciones estilísticas antes de dibujar los glifos definitivos, reduciendo el tiempo de exploración inicial.
- Completado de juegos de caracteres incompletos: para fuentes con cobertura parcial (por ejemplo, solo latín básico), el modelo puede proponer los glifos faltantes de extensiones latinas o símbolos, siempre con revisión humana posterior.
- Investigación en generación de formas vectoriales: sirve como banco de pruebas para estudiar tokenizadores de contornos frente a representaciones rasterizadas, comparando la pérdida en nats por glifo entre variantes.
- Generación de fuentes variables sintéticas: los contornos generados pueden servir como puntos de partida para construir ejes de interpolación en fuentes variables, aunque requerirán normalización y ajuste manual.
- Docencia y experimentación en modelos generativos de dominio específico: útil para ilustrar cómo un transformer pequeño (179,7 M) puede especializarse en un dominio estructurado no textual con un tokenizador adecuado.

## Benchmarks y rendimiento

El autor solo publica la pérdida en validación sobre fuentes no vistas, medida en nats por glifo (menor es mejor):

| Modelo | all-64 | clean-57 |
|---|---|---|
| fontgpt v1 | 135,42 | 130,39 |
| fontgpt v1.5 | 127,23 | 120,91 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni equivalentes) en la información disponible, ni métricas de calidad perceptual o de fidelidad de contorno más allá de la pérdida.

## Requisitos de hardware

- VRAM estimada para inferencia: con 179,7 M de parámetros, los pesos en fp32 ocupan aproximadamente 0,72 GB; en fp16, unos 0,36 GB. La memoria adicional para activaciones con block size 2.560 es moderada, pero no se documenta una cifra oficial.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre debería bastar; no se especifican modelos concretos.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna (GTX 1060 6 GB o superior), aunque no hay confirmación oficial.
- Opciones de despliegue: no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI. La carga requiere `load_checkpoint` del archivo `pengpt.py` en el commit `747144b`, rama `agent/outline2`, y la decodificación exige el decodificador `outline2` del mismo código.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fontgpt v1.5 | 179,7 M | 2.560 tokens | Contornos vectoriales (`outline2`) | other | Pesos en HF, sin código de decodificación en el repo |
| fontgpt v1 | no disponible | no disponible | Contornos vectoriales (tokenizador previo) | other | Pesos en HF |
| Otros modelos de generación de glifos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de terceros en la documentación proporcionada.

## Limitaciones y advertencias

- Publicación descrita por el propio autor como "rápida, no pulida": no hay muestras, evaluaciones ni script de generación en el repositorio.
- El repositorio contiene solo pesos; sin el código del commit `747144b` (`pengpt.py`, rama `agent/outline2`) y su decodificador `outline2`, los pesos no son utilizables.
- Licencia "other": no se especifican los términos exactos, por lo que el uso comercial queda sin garantías hasta consultar al autor.
- Riesgo de artefactos en los contornos generados: al ser un preentrenamiento sin ajuste fino ni RLHF, la calidad de los glifos puede ser irregular y requiere revisión humana.
- Cobertura limitada a 16 glifos por secuencia y a 1.085 tokens de vocabulario; no se documenta el rango de caracteres ni de sistemas de escritura soportados.
- No hay información sobre sesgos, pero al entrenarse sobre un conjunto de fuentes no especificado podría reproducir sesgos estilísticos de la muestra.
- Sin métricas de calidad perceptual ni comparaciones con generadores de glifos establecidos; la única evidencia es la pérdida en validación.
- Sin garantías de reproducibilidad: no se detalla la composición del dataset ni el hardware de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/myssss/fontgpt-v1.5
- Versión anterior: https://huggingface.co/myssss/fontgpt-v1
- Código: `pengpt.py`, commit `747144b`, rama `agent/outline2` (no se proporciona URL directa en la información disponible)
