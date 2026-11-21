# kyumly/qwen36-35b-a3b-2p10bit-duet

## Resumen

Qwen3.6-35B-A3B-2.10bit-DUET es un checkpoint de investigación publicado por el usuario kyumly en Hugging Face, derivado del modelo Qwen3.6-35B-A3B de Alibaba Qwen y de su versión post-entrenamiento cuantizada a 2.10 bits de mrminjae. El modelo aplica DUET, un método de entrenamiento consciente de la cuantización (QAT) sin pesos maestros, sobre los códigos de los expertos enrutados del modelo base. El resultado es un MoE de 35.000 millones de parámetros totales con aproximadamente 3.000 millones activos por token, almacenado con un promedio de 2.10 bits por peso de experto enrutado.

La relevancia del checkpoint es práctica: demuestra que es posible recuperar buena parte de la precisión perdida por una cuantización agresiva a 2.10 bits sin cambiar el ancho de bits ni el formato de almacenamiento. Según la model card, DUET recupera 1,5 puntos en LiveCodeBench v6, 3,3 puntos en AIME25 y 4,0 puntos en GPQA-Diamond respecto al punto de partida PTQ, con un coste de entrenamiento mínimo (56 pasos sobre 225 filas de calibración). El repositorio ocupa 14,6 GB y requiere un cargador personalizado de bajo bit para MoE.

El modelo está pensado para investigadores que trabajan en compresión extrema de MoE y en QAT de bajo bit, no como un modelo listo para producción. La model card es explícita en que se trata de un checkpoint de investigación, con una única semilla de entrenamiento y una selección de hiperparámetros guiada por los benchmarks que reporta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_5_moe) con expertos enrutados y experto compartido |
| Parametros totales | 35B (aproximado, según nombre del modelo) |
| Parametros activos | A3B (aproximado, ~3B activos por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2.10 bits promedio en expertos enrutados (K entre 3 y 16 niveles por experto); resto de pesos en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que sigue la licencia del modelo base) |
| Formato de pesos | safetensors (layer_XX.safetensors con códigos empaquetados de bajo bit; nonexpert.safetensors en BF16) |

## Arquitectura y entrenamiento

El modelo es un MoE con expertos enrutados cuantizados a un promedio de 2.10 bits por peso, mediante codebooks por experto con un número de niveles K variable entre 3 y 16. Los pesos de atención, el experto compartido, el router, los embeddings y la cabeza lm_head permanecen en BF16. Los expertos enrutados se almacenan como códigos empaquetados de bajo bit y se descomprimen en tiempo de carga con la regla documentada en manifest.json: `gate_up = bf16(mu[r] + alpha[r] * cb[q])` y `down = bf16((mu[r] + alpha[r] * cb[q]) * gamma)`, con una tabla LUT por fila cuando el experto la utiliza.

El entrenamiento parte del checkpoint PTQ de mrminjae y aplica DUET, un método QAT sin pesos maestros que mueve estocásticamente los códigos de los expertos un nivel arriba o abajo con probabilidad proporcional a `lr·|u|/Δ`, donde Δ es la separación real hasta el siguiente nivel. Se entrenaron únicamente los códigos de los expertos enrutados (0,035 % de los códigos, 11,3 M de 32,2 B), los offsets y escalas por fila mediante LSQ con K=2, y los pesos de RMSNorm. Los recuentos de niveles, los codebooks, la atención, el experto compartido, el router, los embeddings y lm_head quedaron congelados. El conjunto de datos es el set de calibración genans del modelo base: 225 filas y 305.000 tokens de respuesta, con 10 filas reservadas. El schedule fue de 1 época, 56 pasos, batch global 4, lr de código 5e-7 constante y lr de norma/escala 2e-6 con coseno y 3 % de warm-up, con clipping AdaGC por capa y proyección (λ 1.02).

La innovación principal es la viabilidad de QAT sin pesos maestros sobre códigos empaquetados de bajo bit, lo que evita duplicar el almacenamiento del modelo durante el entrenamiento. La model card también documenta que el lr del código es crítico: con 5e-7 se obtienen 88,89 en AIME25 y 79,63 en GPQA-Diamond, mientras que con 2e-6 caen a 62,22 y 57,24 respectivamente, pese a que la pérdida de calibración seguía bajando en todos los casos.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo thinking (la evaluación se hizo con thinking activado y hasta 61.440 tokens nuevos).
- Razonamiento matemático de competición (AIME25, AIME26) y razonamiento científico de nivel experto (GPQA-Diamond).
- Generación de código y resolución de problemas de programación (LiveCodeBench v6).
- Procesamiento de imagen y texto: la etiqueta image-text-to-text indica soporte multimodal de entrada, aunque la model card no detalla su alcance.
- Conversación multi-turno (etiqueta conversational).
- Compatibilidad con endpoints (etiqueta endpoints_compatible).
- Tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente autónomo: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Investigación en QAT de bajo bit: reproducir el pipeline DUET sobre otros checkpoints PTQ de MoE para medir cuánta precisión se recupera con un coste de entrenamiento mínimo. El modelo sirve como referencia metodológica y como punto de partida para experimentos con otras semillas y sets de calibración.
- Evaluación comparativa de métodos de cuantización: usar el checkpoint junto con el PTQ original y la línea base STE para comparar precisión y longitud de respuesta en tareas de razonamiento, tal como hace la propia model card con LiveCodeBench v6, AIME25, AIME26 y GPQA-Diamond.
- Despliegue con memoria restringida en investigación: los 14,6 GB del repositorio permiten cargar un MoE de 35B en una única GPU de 24 GB (por ejemplo, RTX 4090) o en una A100 de 40 GB, siempre que se use el cargador personalizado de bajo bit y se acepte la pérdida de precisión frente a BF16.
- Estudio de la relación entre longitud de razonamiento y precisión: el modelo permite analizar cómo la cuantización extrema alarga las cadenas de razonamiento (31.100 tokens en LiveCodeBench frente a 35.199 del BF16; 17.342 en GPQA-Diamond frente a 7.824 del BF16) y cómo DUET modera ese efecto respecto a STE.
- Generación de código asistida en entornos de investigación: con 72,52 % de pass@1 en LiveCodeBench v6, es utilizable para prototipado y generación de soluciones en pipelines internos donde el coste de memoria es la restricción principal.
- Razonamiento matemático y científico en entornos educativos o de análisis: con 88,89 % en AIME25 y 79,63 % en GPQA-Diamond, puede emplearse para generar y verificar soluciones paso a paso en escenarios de investigación donde se tolera la variabilidad entre ejecuciones.
- Estudio de cuantización de modelos multimodales: al conservar la etiqueta image-text-to-text del modelo base, permite analizar el impacto de la cuantización de los expertos enrutados en tareas de imagen-texto, aunque la model card no aporta evaluaciones específicas de visión.

## Benchmarks y rendimiento

Evaluación con vLLM, thinking activado, temperatura 1.0, top-p 0.95, top-k 20, máximo 61.440 tokens nuevos, 3 muestras por pregunta y semilla 0. LiveCodeBench v6 usa los problemas del 2025-02-01 al 2025-05-01 (131 problemas) con el grader oficial lcb_runner (pass@1). Token es la longitud media de respuesta.

| Metodo | LiveCodeBench v6 Acc (%) | Token | AIME25 Acc (%) | Token | AIME26 Acc (%) | Token | GPQA-Diamond Acc (%) | Token |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Qwen3.6-35B-A3B (BF16) | 73,28 ± 2,02 | 35.199 | 90,00 ± 0,00 | 32.824 | 91,11 ± 1,92 | 33.261 | 81,65 ± 2,10 | 7.824 |
| 2.10-bit PTQ (mrminjae) | 70,99 ± 0,76 | 35.906 | 85,56 ± 1,92 | 33.216 | 91,11 ± 1,92 | 33.681 | 75,59 ± 2,04 | 15.395 |
| 2.10-bit + STE (absmean) | 65,90 ± 1,17 | 24.676 | 86,67 ± 3,33 | 28.301 | 90,00 ± 5,77 | 25.338 | 72,90 ± 2,78 | 11.102 |
| 2.10-bit + DUET (este modelo) | 72,52 ± 2,75 | 31.100 | 88,89 ± 1,92 | 30.070 | 92,22 ± 1,92 | 29.444 | 79,63 ± 3,86 | 17.342 |

Comparación emparejada por pregunta: DUET supera al PTQ de partida en 4,0 puntos en GPQA-Diamond (unas 2,1 veces el error estándar); en LiveCodeBench y AIME las diferencias quedan dentro de unas 1,4 veces el error estándar. Frente a STE, DUET aventaja en 6,6 puntos en LiveCodeBench (3,1 SE) y 6,7 puntos en GPQA-Diamond (3,7 SE). Tanto DUET como el PTQ razonan aproximadamente el doble que BF16 en GPQA-Diamond.

Estudio del lr de código con la misma receta (una semilla, AIME25 / GPQA-Diamond):

| code lr | AIME25 | GPQA-Diamond |
|---:|---:|---:|
| 2,5e-7 | 84,44 | 77,61 |
| 5e-7 (este modelo) | 88,89 | 79,63 |
| 1e-6 | 76,67 | 70,54 |
| 2e-6 | 62,22 | 57,24 |

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 14,6 GB; a ello hay que sumar la descompresión a BF16 de los pesos no experto y el espacio de activaciones y caché KV. Con contexto largo (hasta 61.440 tokens nuevos en la evaluación) la caché KV puede dominar el consumo.
- GPU recomendadas: A100 40 GB u 80 GB, H100 para contextos largos y evaluación con thinking extendido. En consumer, una RTX 4090 (24 GB) o RTX 3090 (24 GB) puede alojar los pesos, pero el contexto útil quedará limitado por la caché KV.
- Cabe en consumer GPU: sí, en GPUs de 24 GB o más, con cuantización de bajo bit y cargador personalizado.
- Opciones de despliegue: la evaluación se realizó con vLLM. La carga requiere un cargador personalizado de MoE de bajo bit que implemente la regla de descompresión de manifest.json; no se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | LiveCodeBench v6 | AIME25 | GPQA-Diamond | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (BF16) | 35B totales, ~3B activos | no disponible | 73,28 | 90,00 | 81,65 | no disponible | Hugging Face (Qwen) |
| 2.10-bit PTQ (mrminjae) | 35B totales, ~3B activos | no disponible | 70,99 | 85,56 | 75,59 | no disponible | Hugging Face (mrminjae) |
| 2.10-bit + STE (absmean) | 35B totales, ~3B activos | no disponible | 65,90 | 86,67 | 72,90 | no disponible | no disponible |
| 2.10-bit + DUET (este modelo) | 35B totales, ~3B activos | no disponible | 72,52 | 88,89 | 79,63 | no disponible | Hugging Face (kyumly) |

## Limitaciones y advertencias

- El lr de código (5e-7) se eligió observando los resultados en AIME25 y GPQA-Diamond, por lo que las ganancias reportadas son una estimación optimista.
- Una sola ejecución de entrenamiento (una semilla), un solo modelo base y un solo conjunto de calibración; la generalización a otros escenarios no está validada.
- Checkpoint de investigación: no está ajustado para seguridad más allá del modelo base.
- La licencia sigue la del modelo base, pero no se especifica en el repositorio; es necesario consultar la licencia de Qwen3.6-35B-A3B antes de cualquier uso comercial.
- La cuantización a 2.10 bits provoca cadenas de razonamiento más largas que BF16 en GPQA-Diamond (17.342 frente a 7.824 tokens), lo que incrementa coste y latencia en producción.
- La carga requiere un cargador personalizado de MoE de bajo bit; no es compatible con los pipelines estándar de transformers sin adaptación.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada.
- Idiomas soportados y limitaciones de contexto: no disponibles en la información proporcionada.
- Las diferencias frente al PTQ en LiveCodeBench y AIME quedan dentro de ~1,4 errores estándar, por lo que no deben interpretarse como mejoras robustas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kyumly/qwen36-35b-a3b-2p10bit-duet
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Checkpoint PTQ de partida: https://huggingface.co/mrminjae/qwen36-35b-a3b-2p10bit-genans-lowbit
- Paper, blog, repositorio o demo de DUET: no disponible en la información proporcionada.
