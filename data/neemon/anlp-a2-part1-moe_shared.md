# neemon/anlp-a2-part1-moe_shared

## Resumen

moe_shared es un checkpoint de traducción automática publicado por el usuario neemon (identificador `neemon/anlp-a2-part1-moe_shared`) como parte de la asignatura Advanced NLP (IIIT-H, Monsoon 2026). Es un transformer decoder-only entrenado desde cero cuya capa de feed-forward es de tipo mixture-of-experts: un experto compartido siempre activo más tres expertos enrutados con top-1 routing. El modelo declara 41.603.584 parámetros totales y 33.198.592 activos por token, con `d_model` de 512, 8 capas, 8 cabezales, normalización RMSNorm y un vocabulario de 32.000 tokens.

El problema que aborda es la traducción hacia inglés desde vietnamita y japonés, con una ventana de contexto muy corta de 256 tokens. El repositorio contiene únicamente el checkpoint (0,2 GB); la arquitectura, el código de entrenamiento y la evaluación residen en el repositorio de la asignatura, que no se enlaza en la model card. Los resultados publicados son un BLEU de 30,07 para vi→en, 19,08 para ja→en (media 24,57) y una perplejidad de 15,72 sobre el conjunto de test.

Su relevancia es fundamentalmente docente y de investigación: es un ejemplo reproducible y de tamaño reducido de un MoE con experto compartido, el patrón que popularizaron arquitecturas como DeepSeekMoE. No es un modelo de producción: acumula 0 descargas y 0 likes en HuggingFace, no hay comparativas publicadas frente a sistemas de traducción establecidos y la propia model card lo presenta como el entregable de una práctica académica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con capa feed-forward MoE (1 experto compartido + 3 expertos enrutados, top-1 routing) |
| Parámetros totales | 41.603.584 |
| Parámetros activos | 33.198.592 por token (feed-forward: 16.809.984 totales / 8.404.992 activos) |
| Longitud de contexto | 256 tokens (`n_ctx`) |
| Tipos de cuantización | no disponible (solo se publica el checkpoint en precisión de entrenamiento) |
| Idiomas soportados | inglés (en), vietnamita (vi), japonés (ja) |
| Licencia | MIT |
| Formato de pesos | checkpoint PyTorch (`model.pt`, cargado con `torch.load`), no safetensors ni GGUF |
| `d_model` | 512 |
| Capas (`n_layers`) | 8 |
| Cabezales (`n_heads` / `n_kv_heads`) | 8 / 8 (atención multi-cabezal, sin GQA) |
| `d_ff` | 512 |
| Tamaño de vocabulario | 32.000 |
| Normalización | RMSNorm |
| Tamaño del repositorio | 0,2 GB |
| Librería declarada | pytorch |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 8 capas con `d_model` de 512 y 8 cabezales de atención (sin grouped-query attention, ya que `n_kv_heads` coincide con `n_heads`), normalización RMSNorm y un vocabulario de 32.000 tokens. La innovación respecto a un decoder denso está en el bloque feed-forward: se combinan 1 experto compartido, que permanece activo para todos los tokens, con 3 expertos enrutados de los que se selecciona uno por token (top-1). Esto da un total de 16.809.984 parámetros en el feed-forward, de los que solo 8.404.992 se activan por token, lo que explica la diferencia entre los 41,6 M de parámetros totales y los 33,2 M activos. El patrón de experto compartido más expertos enrutados es el que emplean arquitecturas MoE de referencia para estabilizar el entrenamiento y garantizar conocimiento general en todos los tokens.

En cuanto al entrenamiento, la model card indica 16.696.256 tokens objetivo puntuados, una mejor loss de validación de 2,4499 y una mejor perplejidad de validación de 11,59. No se especifica la composición del dataset, el tokenizador, el número de pasos, el tamaño de lote ni la existencia de fases de ajuste con RLHF o DPO. Tampoco se describe ninguna técnica de decodificación especulativa, atención lineal u otra optimización de inferencia. El modelo se entrenó desde cero (`from-scratch`) y el repositorio aloja exclusivamente el checkpoint, no el código de entrenamiento ni de evaluación.

## Capacidades

- Traducción automática de vietnamita a inglés, con un BLEU publicado de 30,07 sobre el conjunto de test del autor.
- Traducción automática de japonés a inglés, con un BLEU publicado de 19,08.
- Procesamiento bidireccional aparente: la model card reporta perplejidad "en ambas direcciones", aunque solo se publican valores de BLEU para vi→en y ja→en; no hay cifras para en→vi ni en→ja.
- Generación de texto condicionada a un prompt corto, al ser un modelo decoder-only autoregresivo.
- No hay soporte documentado de tool calling ni de function calling.
- No hay soporte documentado de agentes, multi-step reasoning ni uso de plantillas de chat o modo de razonamiento explícito.
- No hay capacidades de visión, audio ni multimodalidad.
- Cobertura multilingüe limitada estrictamente a los tres idiomas declarados (en, vi, ja); no se documenta comportamiento en otras lenguas.
- Capacidad de análisis de enrutado: al exponer 3 expertos enrutados con top-1, permite inspeccionar la distribución de asignación de tokens a expertos, algo útil para estudiar balanceo de carga en MoE.

## Casos de uso

- Investigación sobre enrutado en MoE: el modelo permite instrumentar qué experto recibe cada token y medir el balanceo entre los tres expertos enrutados, con un coste de cómputo bajo (33,2 M parámetros activos) que facilita experimentos repetidos en una sola GPU.
- Docencia y reproducibilidad de arquitecturas: sirve como referencia mínima para explicar en clase la diferencia entre parámetros totales y activos, y el efecto del experto compartido frente a configuraciones puramente enrutadas.
- Traducción de fragmentos cortos vi→en: con 256 tokens de contexto, encaja en la traducción de títulos, asuntos de correo, mensajes de chat o líneas de subtítulo, donde la unidad de traducción cabe holgadamente en la ventana.
- Traducción de fragmentos cortos ja→en: mismo escenario para textos breves en japonés, asumiendo un BLEU esperado más bajo (19,08) que en el par vi→en.
- Baseline académico para comparativas controladas: al ser un modelo entrenado desde cero y con licencia MIT, es adecuado como punto de partida en experimentos que midan el efecto de cambiar el número de expertos, el `top_k` o la presencia del experto compartido, manteniendo el resto de hiperparámetros fijos.
- Generación de datos sintéticos o aumento de corpus: puede producir traducciones aproximadas de bajo coste para preetiquetar corpus vi-en o ja-en que después se filtren con un modelo mayor, dado que su inferencia es muy barata en VRAM.
- Ajuste fino sobre dominio concreto: con 41,6 M de parámetros totales, un `fine-tuning` completo cabe en una GPU de consumo, lo que permite especializarlo en un dominio (por ejemplo, terminología técnica o atención al cliente) partiendo de la licencia MIT.
- Despliegue en CPU o en dispositivos con recursos muy limitados: el checkpoint ocupa 0,2 GB y los pesos en coma flotante de 32 bits rondan los 166 MB, por lo que la inferencia es viable sin GPU para volúmenes pequeños de frases cortas.

## Benchmarks y rendimiento

Resultados publicados en la model card (conjunto de test del autor, composición no detallada):

| Métrica | Valor |
|---|---|
| Perplejidad (ambas direcciones) | 15,72 |
| BLEU vi→en | 30,07 |
| BLEU ja→en | 19,08 |
| BLEU medio | 24,57 |
| Mejor loss de validación | 2,4499 |
| Mejor perplejidad de validación | 11,59 |
| Tokens objetivo puntuados en entrenamiento | 16.696.256 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark de conocimiento, código o razonamiento en la información disponible. Tampoco se documenta la composición del conjunto de test, el tokenizador empleado para calcular BLEU (por ejemplo, si es BLEU con o sin `sacrebleu`, o la tokenización para japonés y vietnamita) ni la existencia de intervalos de confianza o de múltiples semillas, por lo que los valores deben tomarse como cifras indicativas de una práctica académica y no como resultados reproducibles de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 170 MB para los pesos en fp32 (41,6 M de parámetros) y unos 85 MB en fp16/bf16; con la ventana de 256 tokens y `d_model` 512, las activaciones son despreciables, por lo que la inferencia completa cabe por debajo de 1 GB de VRAM incluso con sobrecarga del runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM sirve, incluidas RTX 3060, RTX 4060, RTX 4090, T4 o incluso iGPU con memoria compartida; no se requiere A100 ni H100 en ningún escenario de inferencia.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU de consumo de los últimos diez años, y también en CPU.
- Ajuste fino: con 41,6 M de parámetros totales, el `fine-tuning` completo es viable en una única GPU de consumo (por ejemplo, 8-12 GB de VRAM según tamaño de lote); el entrenamiento desde cero con 16,7 M de tokens es igualmente asequible en una GPU modesta.
- Opciones de despliegue: la vía documentada es PyTorch nativo mediante `torch.load("model.pt", map_location="cpu", weights_only=False)` y el `state_dict` más `config` del payload. No hay confirmación de soporte en vLLM, llama.cpp, Ollama, TGI ni TensorRT-LLM; al tratarse de una arquitectura con expertos compartidos y enrutados, su conversión a GGUF o a formatos de servidores de inferencia requeriría implementar el enrutado correspondiente, algo no documentado en el repositorio.
- Latencia y throughput: no disponibles; no se han publicado mediciones de latencia, tokens por segundo ni consumo energético.

## Comparativa con modelos similares

No se ha publicado ninguna evaluación comparativa de este modelo frente a alternativas, y la búsqueda web proporcionada no devolvió resultados relacionados con el modelo. La tabla siguiente incluye familias de traducción neuronal que se suelen usar como referencia en la misma categoría funcional; los huecos marcados como "no disponible" reflejan que no hay datos en la información proporcionada ni evaluación ejecutada en esta ficha.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| neemon/anlp-a2-part1-moe_shared | 41,6 M totales / 33,2 M activos | 256 tokens | BLEU vi→en 30,07; ja→en 19,08; perplejidad de test 15,72 | MIT | HuggingFace (solo checkpoint `.pt`) |
| Familia Helsinki-NLP/opus-mt (modelos bilingües) | no disponible | no disponible | no evaluado en esta ficha | no disponible | HuggingFace |
| Meta NLLB-200 (variantes destiladas) | no disponible | no disponible | no evaluado en esta ficha | no disponible | HuggingFace |
| Facebook mBART-50 | no disponible | no disponible | no evaluado en esta ficha | no disponible | HuggingFace |

Diferencias cualitativas relevantes: frente a los modelos anteriores, moe_shared destaca únicamente por su tamaño mínimo (41,6 M de parámetros totales) y por su licencia MIT, que permite uso comercial sin las restricciones que suelen acompañar a algunos modelos multilingües de gran escala. En contra, su ventana de 256 tokens es entre uno y dos órdenes de magnitud inferior a la de las alternativas multilingües habituales, cubre solo tres idiomas y no dispone de validación externa ni de resultados en conjuntos de test públicos estándar, por lo que cualquier comparación de calidad sería especulativa.

## Limitaciones y advertencias

- Ventana de contexto de 256 tokens: no admite documentos, artículos ni conversaciones largas; cualquier entrada superior debe truncarse o trocearse, con la pérdida de coherencia que ello implica.
- Cobertura lingüística restringida a inglés, vietnamita y japonés; no hay evidencia de comportamiento en otras lenguas ni de transferencia cero.
- Solo se publican BLEU en dirección vi→en y ja→en; no hay métricas de calidad para en→vi ni en→ja, pese a que la perplejidad se midió en ambas direcciones.
- Corpus de entrenamiento muy pequeño (16.696.256 tokens objetivo puntuados), sin documentación sobre su composición, filtrado, licencias de origen ni proporción por idioma: existe riesgo alto de sobreajuste al dominio y de sesgos heredados de fuentes no declaradas.
- Riesgo de alucinación y de traducciones fluidas pero incorrectas, especialmente en japonés, donde el BLEU de 19,08 es notablemente inferior al de vietnamita (30,07); no debe usarse sin revisión humana en contextos legales, médicos o financieros.
- Ausencia de resultados en benchmarks de razonamiento, matemáticas o código; no hay evidencia de que el modelo conserve capacidades generales más allá de la traducción.
- El repositorio contiene únicamente el checkpoint: no incluye tokenizador, código de arquitectura, script de inferencia ni instrucciones de preprocesado, por lo que la reproducibilidad depende de un repositorio de asignatura que no se enlaza en la model card.
- La carga indicada requiere `weights_only=False`, lo que implica deserialización de pickle; cargar el archivo supone confiar en el origen del checkpoint, con el riesgo de seguridad asociado si el fichero se manipula.
- Cero descargas y cero likes: el modelo no ha sido validado por la comunidad, no ha pasado revisión por pares más allá de la evaluación de la asignatura y no hay garantía de mantenimiento o corrección de errores.
- Licencia MIT, que permite uso comercial y modificación, pero solo cubre el artefacto publicado; los derechos sobre los datos de entrenamiento no están documentados y podrían imponer restricciones adicionales no declaradas.
- Fechas de creación y actualización del repositorio (2026-09-14) poco habituales; conviene verificar la vigencia y el estado del repositorio antes de integrarlo en cualquier flujo de trabajo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/neemon/anlp-a2-part1-moe_shared
- Repositorio de la asignatura con arquitectura, entrenamiento y evaluación: mencionado en la model card, pero sin URL publicada; no disponible.
- Paper o informe técnico asociado: no disponible.
- Demo o espacio de inferencia: no disponible.
- Resultados de la búsqueda web proporcionada: los enlaces devueltos corresponden a WeTransfer (https://wetransfer.com/, https://wetransfer.com/resources/free-file-transfer, https://access.wetransfer.com/log-in, https://wet.wetransfer.com/transfers, https://we.tl/send/en) y no guardan relación con el modelo, por lo que no se consideran fuentes relevantes.
