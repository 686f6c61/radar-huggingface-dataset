# h2oai/h2o-lightning-4b

## Resumen

H2O-Lightning-4B es un modelo de decisión de 4.000 millones de parámetros desarrollado por H2O.ai, construido sobre Qwen/Qwen3.5-4B. No es un modelo generativo de propósito general: responde preguntas de decisión tipadas sobre un registro (un documento, un ticket, una política, una conversación) y sobre las imágenes asociadas a ese registro (fotos, capturas, documentos escaneados, gráficos). Devuelve una probabilidad para cada opción en lugar de texto libre.

Admite tres tipos de pregunta: *choice* (elige una entre un conjunto de opciones nombradas), *yes/no* (denominado *noul*, con la probabilidad de que una afirmación sea cierta) y *score* (nivel ordinal sobre una escala declarada, con su distribución de probabilidad). Cada decisión es una única pasada forward y un único token de salida, por lo que el coste computacional depende únicamente de los tokens de entrada.

El modelo se ejecuta sobre vLLM 0.30.0 sin modificaciones, con un pequeño *shim* de librería estándar (`h2o_lightning_shim.py`). En la fecha de publicación encabeza el Composite Score de JevBench v1.6.1 entre los sistemas de pesos abiertos con 72,5 puntos, por delante del propio Jev 1.13.0 (71,5) y de modelos abiertos de 12B, 26B y 31B. Se distribuye con licencia Apache 2.0 y pesos en safetensors.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en detalle (derivada de Qwen/Qwen3.5-4B; etiqueta `qwen3_5`, multimodal image-text-to-text) |
| Parámetros totales | 4.539.265.536 (≈4,54 B) |
| Parámetros activos | No aplica (no se describe como MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el autor no publica variantes cuantizadas; pesos en safetensors) |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `transformers`) |
| Pipeline | image-text-to-text |
| Modelo base | Qwen/Qwen3.5-4B |
| Tamaño del repositorio | 35,6 GB (incluye recursos multimedia de las demos) |

## Arquitectura y entrenamiento

El modelo es un *fine-tune* de Qwen/Qwen3.5-4B orientado a decisión, no a generación abierta. La formulación es de una sola pasada forward y un token de salida por decisión, con salida probabilística sobre opciones discretas, lo que permite calibrar directamente la confianza de cada respuesta. La entrada combina el registro textual con imágenes opcionales (hasta 1.048.576 píxeles según la configuración de inferencia publicada).

La model card describe el proceso de entrenamiento de forma metodológica pero sin cifras de tokens ni composición del dataset: uso de un *lockbox* retenido con ítems de evaluación escritos de forma independiente y nunca entrenados; criterios de *ship / no-ship* fijados antes de ver resultados; deduplicación exacta y casi duplicada de todos los datos de entrenamiento contra cada conjunto de evaluación; *gap hunting* por tema y tipo de pregunta con conjuntos adversariales; y datos reales con licencia limpia, etiquetados por anotación humana o por acuerdo entre varios modelos fuertes independientes. La calibración se declara como objetivo de primer orden. No se especifica en la información disponible si hubo RLHF, DPO u otra etapa de alineamiento, ni el número de tokens de entrenamiento.

## Capacidades

- Decisión tipada en tres formatos: *choice* (una opción entre varias nombradas), *yes/no* o *noul* (probabilidad de veracidad de una afirmación) y *score* (nivel ordinal con distribución de probabilidad).
- Salida probabilística calibrada: en la evaluación sobre JevBench, 0 de 74 respuestas yes/no cayeron con P(yes) estrictamente entre 0,2 y 0,8, lo que indica decisiones poco ambiguas.
- Entrada multimodal: procesa imágenes asociadas al registro (fotos, capturas de pantalla, documentos escaneados, gráficos) junto al texto.
- Aplicación sobre registros largos y heterogéneos: documentos, tickets, políticas y conversaciones.
- Compatibilidad con vLLM 0.30.0 sin parchear el motor, mediante un *shim* externo de librería estándar.
- Modo conversacional declarado en las etiquetas del repositorio.
- No se documenta en la información disponible soporte de *tool calling* / *function calling*, modo *thinking* ni capacidades de audio.

## Casos de uso

- **Bandeja de operaciones automatizada**: decidir reclamaciones contra una política escrita. En la demo publicada, 1.000 reclamaciones se resolvieron a 32 en paralelo sobre una sola GPU en 63 segundos.
- **Agente web con decisión por paso**: cada paso del agente se formula como una pregunta de decisión tipada. La demo ejecuta 8 navegadores reales sobre 192 proveedores en 145 segundos, con todas las decisiones correctas frente a respuestas escritas de antemano.
- **Triaje y enrutado de tickets**: clasificación *choice* sobre categorías nombradas y *score* para prioridad, con la ventaja de disponer de la probabilidad de cada opción para umbralizar derivaciones a humano.
- **Verificación de documentos escaneados y capturas**: uso de la entrada de imagen para comprobar correspondencia entre un justificante, una captura o un formulario escaneado y los datos del registro textual.
- **Puntuación ordinal en encuestas o evaluaciones**: la salida *score* devuelve la distribución completa sobre la escala, lo que permite agregar resultados y medir incertidumbre en lugar de forzar una etiqueta única.
- **Cumplimiento normativo y moderación**: preguntas *yes/no* sobre afirmaciones concretas ("¿cumple esta cláusula la política X?"), con probabilidad calibrada para auditar decisiones automatizadas.
- **Controladores ligeros en bucle cerrado**: la demo de DOOM muestra cuatro decisiones por llamada sobre el reloj de decisión del modelo, un patrón aplicable a controladores que consultan al modelo repetidamente con presupuesto de latencia estricto.

## Benchmarks y rendimiento

Resultados publicados por el autor. JevBench v1.6.1, Composite Score sobre la tabla de pesos abiertos, leído el 2026-10-07:

| Sistema | Parámetros | Composite | Intelligence | Calibration | Speed | Cost | $ por 1.000 decisiones |
|---|---|---|---|---|---|---|---|
| H2O-Lightning-4B v1.1 | 4B | 72,5 | 60,0 | 90,0 | 92,6 | 60,3 | 0,021 (est.) |
| Jev 1.13.0 (referencia, alojado) | no disponible | 71,5 | 63,6 | 90,6 | 91,5 | 54,7 | 0,032 |
| Quyet-1.0-Large | 31B | 71,4 | 73,4 | 90,0 | 86,9 | 50,5 | 0,045 (est.) |

El Composite es la media armónica con el mismo peso de los cuatro ejes.

Mediciones propias sobre una NVIDIA RTX PRO 4500 Blackwell (32 GB) con `serve.sh` tal cual se distribuye (vLLM 0.30.0; temperatura de texto 0,8; temperatura de imagen 0,65; imágenes de hasta 1.048.576 píxeles):

| Conjunto | Ítems | Resultado |
|---|---|---|
| JevBench (texto), CLI propia con `--adapter typesafe` | 231 públicos | 205 / 231 (88,7 %): easy 48/48 · standard 71/72 · hard 86/111 |
| ImageJevBench | 8 publicados con imagen | 8 / 8 |
| Conjuntos de validación de imagen | 1.877 preguntas sobre 16 conjuntos públicos con licencia limpia | 87,4 % |

Detalle de texto: 231/231 respuestas válidas; 0 de 74 respuestas yes/no con P(yes) entre 0,2 y 0,8; media de 654 tokens de entrada por decisión; latencia p50/p95 en el nivel standard, serie, de 0,033 s / 0,035 s; latencia p50/p95 sobre los 231 ítems, serie, de 0,034 s / 0,221 s. El autor indica que la latencia depende de la GPU.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: ≈9,1 GB solo para pesos (4,54 B parámetros × 2 bytes). Estimación aritmética propia, no publicada por el autor.
- GPU verificadas por el autor: NVIDIA RTX PRO 4500 Blackwell (32 GB) para las mediciones y NVIDIA H100 para las demos en vivo.
- Repositorio de 35,6 GB, que incluye recursos de vídeo de las demos además de los pesos; el espacio en disco necesario para servir el modelo es inferior a esa cifra.
- Despliegue: vLLM 0.30.0 sin modificar más el *shim* `h2o_lightning_shim.py`. No se documentan en la información disponible otras rutas de despliegue (llama.cpp, Ollama, TGI).
- Latencia medida: p50 de 0,033 s y p95 de 0,035 s por decisión en el nivel standard en serie sobre RTX PRO 4500 Blackwell.
- Rendimiento agregado: 1.000 decisiones a 32 en paralelo en 63 s sobre una sola GPU; 192 decisiones de agente web en 145 s.
- Configuración de imágenes: temperatura 0,65 y hasta 1.048.576 píxeles por imagen.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | JevBench Composite | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| H2O-Lightning-4B v1.1 | 4B | no disponible | 72,5 | apache-2.0 | Pesos abiertos en HuggingFace |
| Jev 1.13.0 | no disponible | no disponible | 71,5 | no disponible | Alojado (referencia del benchmark) |
| Quyet-1.0-Large | 31B | no disponible | 71,4 | no disponible | Pesos abiertos según la tabla del benchmark |

La ventaja declarada del modelo de H2O.ai frente a Quyet-1.0-Large es de calibración y coste: el 31B lidera en inteligencia bruta (73,4 frente a 60,0) mientras el 4B iguala la calibración (90,0 en ambos) con menor latencia y coste por decisión. No se dispone de datos de contexto, licencia ni idiomas de los sistemas comparados más allá de lo indicado.

## Limitaciones y advertencias

- Modelo de decisión, no de generación abierta: no está pensado para producir texto libre ni para tareas conversacionales generales.
- Riesgo de alucinación inherente a los modelos de lenguaje, mitigado pero no eliminado por la formulación de una sola respuesta probabilística; el propio autor reporta 86/111 en el nivel hard de JevBench, con 25 fallos sobre 111 ítems difíciles.
- No hay información publicada sobre idiomas soportados; no puede asumirse un buen rendimiento fuera del inglés sin evaluación propia.
- No se publica la longitud de contexto, dato crítico para decidir si encaja en casos con documentos largos.
- No se publican variantes cuantizadas ni recetas de cuantización; el despliegue eficiente en VRAM reducida queda por validar.
- La model card no detalla etapa de alineamiento (RLHF/DPO) ni composición del dataset de entrenamiento, lo que limita la evaluación de sesgos.
- Las cifras de benchmarks y demos proceden del propio autor; el vídeo informa de que empresas, personas e importes son ficticios.
- Licencia Apache 2.0: permite uso comercial y modificación, con las obligaciones habituales de atribución y ausencia de garantías.
- El texto de la model card disponible para esta ficha está truncado, por lo que parte de la información técnica puede faltar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/h2oai/h2o-lightning-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Leaderboard de JevBench: https://benchmarkheaven.com/jev-models
- Vídeo de demos completas en YouTube: https://youtu.be/2Qp04Wu0A14
- Recursos de demo en el repositorio: https://huggingface.co/h2oai/h2o-lightning-4b/resolve/main/assets/demos/demos_reel.mp4
