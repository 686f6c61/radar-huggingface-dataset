# rexarrior/Qwen3-0.6B-Tool-Repair-semantic08-GGUF

## Resumen

Qwen3-0.6B-Tool-Repair-semantic08-GGUF es un checkpoint de investigación derivado de Qwen3-0.6B, publicado por el autor rexarrior (Qwen Lab) en Hugging Face. No se trata de un modelo nuevo entrenado desde cero, sino de un ajuste quirúrgico orientado a mejorar el comportamiento de tool calling (llamada a herramientas) del modelo base. Concretamente, el autor modifica una única matriz de pesos (`blk.27.ffn_down.weight`, de dimensiones 1024 × 3072) y distribuye el modelo en formato GGUF F16 para su uso con llama.cpp.

El problema que aborda es específico: en el benchmark BFCL (Berkeley Function Calling Leaderboard) el modelo base comete errores de formato y llamadas malformadas en categorías de irrelevancia (peticiones que no deberían desencadenar una llamada a herramienta). El autor aplica una corrección supervisada sobre activaciones cacheadas para preservar las decisiones correctas de "no llamada" y, a la vez, aumentar los aciertos en llamadas válidas. El resultado es un checkpoint de investigación con métricas de evaluación publicadas frente al original.

Es relevante por su enfoque metodológico: demuestra que un ajuste de bajo rango y muy localizado sobre un modelo de 0,6B puede mover métricas de tool calling de forma medible, y publica el protocolo completo, los splits y los checkpoints intermedios. No obstante, se trata de un artefacto de investigación con cero descargas y sin garantías de producción; su interés es principalmente evaluativo y reproducible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajuste localizado en una matriz FFN |
| Parametros totales | 596.049.920 (0,6B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | el repo publica GGUF F16; no se detallan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (F16); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer decoder-only de 0,6B parámetros. El ajuste de Qwen Lab no reentrena el modelo: modifica únicamente `blk.27.ffn_down.weight`, una matriz de 1024 × 3072 en la capa FFN de la última capa (blk.27). La auditoría a nivel de byte detectó 3.115.246 valores F16 modificados dentro de esa matriz, con una norma de Frobenius del update equivalente al 11,19% de la norma de la matriz padre.

El procedimiento de entrenamiento, descrito en la model card, consta de varias fases. Primero se inspeccionan las respuestas nativas de la versión v2 y se excluyen las respuestas acreditadas que contenían llamadas a herramienta intentadas o malformadas en dos categorías de irrelevancia de BFCL, quedando 2.278 éxitos de un solo turno a preservar. Después se cachean activaciones de v2 sobre prefijos fijos y se ajusta una corrección supervisada con redondeo F16 en el forward y gradiente straight-through, protegiendo los márgenes de tokens en llamadas exitosas completas. La reparación final parte de semantic03, conserva los teachers de v2 y A6 y protege 794 respuestas correctas de "no llamada" más dos respuestas de v2 frente a regresiones. El caché final contenía 116.303 posiciones, con learning rate de 0,000001, tope de norma relativa del 15%, refresco de filas de guarda cada 25 pasos y evaluación cada 400 pasos; se seleccionó el paso 800 y se exportó a F16.

## Capacidades

- Generación de texto conversacional en formato chat (compatible con `--jinja` en llama.cpp).
- Tool calling / function calling: es la capacidad central del ajuste, orientada a reducir llamadas malformadas y a preservar decisiones correctas de no llamada.
- Razonamiento multi-turno básico: el modelo base lo soporta, pero las métricas multi-turno de este checkpoint son inferiores a las del original.
- Modo de razonamiento desactivable: la invocación recomendada usa `--reasoning off`.
- Capacidades multilingües: heredadas del base Qwen3-0.6B, aunque no se documentan idiomas específicos en esta ficha.
- No se documentan capacidades de visión, audio ni agentes autónomos de largo horizonte.

## Casos de uso

- Evaluación de metodologías de reparación de tool calling: sirve como caso de estudio reproducible para investigadores que quieran replicar el pipeline de corrección supervisada sobre activaciones cacheadas con un modelo pequeño y un único tensor modificado.
- Pruebas de regresión de pipelines de function calling: permite comparar, con el mismo scorer oficial de BFCL, cómo se comporta un ajuste localizado frente al base en categorías de irrelevancia y llamadas malformadas.
- Prototipado de asistentes con herramientas en local: al ser un GGUF F16 de 0,6B, se puede ejecutar en CPU o GPU de gama baja con llama.cpp para validar flujos de tool calling antes de invertir en modelos mayores.
- Docencia y formación en ajuste fino: el repositorio publica splits, protocolo y checkpoints intermedios, lo que lo hace útil para explicar cómo se diseña un conjunto de evaluación y se evita la fuga de datos entre desarrollo y test.
- Investigación sobre preservación de capacidades: el autor documenta la retención de créditos de v2 (3.272/3.453) y las pérdidas por categoría, lo que permite estudiar el compromiso entre mejora de una tarea y regresión en otras.
- Validación de compatibilidad GGUF/llama.cpp: útil para comprobar que un checkpoint ajustado se exporta y se comporta igual en llama.cpp que en el entorno de entrenamiento, incluyendo el manejo de plantillas Jinja y el modo de razonamiento.

## Benchmarks y rendimiento

| Respuestas correctas / casos evaluados | Original | semantic08 |
|---|---:|---:|
| A6 / 48 | 24 | 40 |
| BFCL single-turn / 3641 | 2463 | 2602 |
| BFCL multi-turn / 800 | 24 | 14 |
| API-Bank offline next call / 744 | 133 | 139 |
| IFEval strict prompt / 541 | 315 | 291 |

El autor indica además que, comparando IDs de tarea emparejados en la evaluación completa y tras filtrar llamadas malformadas, semantic08 ganó 308 casos de un solo turno y perdió cero respecto a v2; frente al original ganó 248 y perdió 107. La comprobación de preservación retuvo 3.272 de 3.453 créditos requeridos de v2; las 181 pérdidas se reparten en ocho multi-turno, 14 de memoria y 159 de variantes de formato. En API-Bank la diferencia frente a v2 fue de +0,54 puntos porcentuales (intervalo pareado del 95%: −0,83 a +1,98) y en IFEval strict prompt cayó 3,14 puntos (intervalo −6,28 a −0,18). A6 se usó durante el desarrollo y BFCL influyó en la selección de checkpoints, por lo que las cifras de BFCL no constituyen un test independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF F16 ocupa 1.198.182.176 bytes (aproximadamente 1,2 GB), por lo que cabe holgadamente en GPUs de consumo con 4 GB o más; en CPU también es viable.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) o profesional (A100, H100) sin problema de memoria; el cuello de botella no será la VRAM.
- Cabe en consumer GPU: sí, en cualquier GPU con al menos 2-4 GB libres, e incluso en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp (librería declarada, con `llama-cli` y `--jinja`); al ser GGUF, es compatible con el ecosistema llama.cpp y con endpoints compatibles según los tags del repo. No se documentan otras opciones (vLLM, TGI) en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-0.6B-Tool-Repair-semantic08 | 0,6B | no disponible | Ajuste localizado para tool calling | Apache 2.0 | GGUF en Hugging Face |
| Qwen3-0.6B (base) | 0,6B | no disponible | Modelo generalista | Apache 2.0 | Safetensors y GGUF en Hugging Face |
| Qwen3-0.6B-GGUF (oficial) | 0,6B | no disponible | Cuantizaciones oficiales del base | Apache 2.0 | GGUF en Hugging Face |

La comparación con alternativas de otros autores no está disponible en la información proporcionada. Frente al base, semantic08 mejora en BFCL single-turn (2602 frente a 2463) y en A6 (40 frente a 24), pero empeora en BFCL multi-turno (14 frente a 24) e IFEval strict prompt (291 frente a 315).

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un modelo de producción: cero descargas y cero likes en el momento de la ficha, sin validación externa.
- Regresión documentada en multi-turno (de 24 a 14 aciertos sobre 800) y en IFEval strict prompt (−3,14 puntos), lo que desaconseja su uso en tareas de instrucciones estrictas o conversaciones multi-turno sin evaluación previa.
- Las métricas de BFCL no son un test independiente: BFCL se usó para seleccionar checkpoints y A6 se usó durante el desarrollo, con el riesgo de sobreajuste al benchmark que ello implica.
- El ajuste modifica un único tensor de la última capa FFN; su efecto es localizado y no corrige limitaciones estructurales del modelo base de 0,6B.
- Riesgo de alucinación y sesgos heredados de Qwen3-0.6B; no se documentan evaluaciones de sesgo ni de seguridad en esta ficha.
- Idiomas soportados no documentados; el comportamiento multilingüe depende del base y no ha sido evaluado en este checkpoint.
- Licencia Apache 2.0, que permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar el protocolo del repositorio antes de reutilizar los pesos en producción.
- El tamaño reducido (0,6B) limita el razonamiento complejo y la calidad en tareas de código o matemáticas avanzadas, aunque no se publican benchmarks de esas categorías para este checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rexarrior/Qwen3-0.6B-Tool-Repair-semantic08-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- GGUF oficial del base: https://huggingface.co/Qwen/Qwen3-0.6B-GGUF
- Repositorio Qwen Lab (protocolo y checkpoints): https://github.com/Rexarrior/qwen-lab/blob/main/fine-tuning/README.md
- Splits de desarrollo y guarda: https://github.com/Rexarrior/qwen-lab/blob/main/fine-tuning/splits-semantic08.json
