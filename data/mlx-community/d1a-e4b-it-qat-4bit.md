# mlx-community/d1a-e4b-it-qat-4bit

## Resumen

D1A-E4B-it QAT 4-bit es una compilación para Apple Silicon del modelo de decisión D1A, desarrollado por jonpol01 y distribuido en el espacio `mlx-community`. Se trata de un derivado del tronco Gemma 4 E4B (7.463 millones de parámetros) con un adaptador específico que transforma el modelo generativo en un clasificador de decisiones: recibe un documento y un conjunto de preguntas (sí/no, elección múltiple o puntuación) y devuelve, en un único forward pass, una probabilidad calibrada para cada opción, sin generar texto libre. Esto garantiza que toda respuesta sea una opción válida del conjunto planteado.

La relevancia técnica del build reside en que no se ha recuantizado desde bf16: las 343 capas lineales int4 del tronco `google/gemma-4-E4B-it-qat-w4a16-ct` se almacenan bit a bit como MLX 4-bit, con error de desquantización 0.0. El adaptador D1A se reentrenó sobre ese tronco exacto, de modo que el modelo de 4 bits es el modelo entrenado y no una copia redondeada. El repositorio ocupa 5,6 GB y añade 0,9 GB de encoders multimodales, frente a los 7,0 GB de la versión 8-bit.

El modelo se publica bajo licencia Apache 2.0, con soporte declarado de inglés y japonés, y capacidades multimodales (visión, audio y vídeo) a través de endpoints específicos. Está marcado como experimental y su lanzamiento se produjo antes de completar las puertas de calidad previstas, lo que conviene tener en cuenta para uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 E4B) con adaptador de decisión D1A; tronco int4 QAT en formato MLX |
| Parámetros totales | 7.463.013.418 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4-bit (QAT, w4a16 en el tronco original); existe variante 8-bit de referencia (v0.6) |
| Idiomas soportados | en, ja |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo parte del tronco Gemma 4 E4B con cuantización consciente del entrenamiento (QAT) en int4, publicado por Google como `gemma-4-E4B-it-qat-w4a16-ct`. Sobre ese tronco se entrena un adaptador D1A que reformula la tarea como clasificación calibrada: cada pregunta se resuelve con una distribución de probabilidad sobre las opciones, sin decodificación autoregresiva de texto. Las 343 capas lineales int4 se conservan con las mismas palabras empaquetadas y escalas que el original, con error de desquantización nulo.

El reentrenamiento del adaptador responde a dos motivos documentados. Primero, los pesos QAT difieren de los bf16 sobre los que se entrenó el adaptador v0.6; trasladar ese adaptador sin cambios al tronco QAT provocaba pérdidas de precisión y alteraba el 9,6 % de las respuestas claras en la variante E2B. Segundo, el entrenamiento original en PyTorch sobre GPU de Apple arrastraba un bug que leía como ceros los embeddings por capa para todos los tokens con id superior a 199.729, lo que afectaba a puntuación y dígitos, el 28,5 % de los tokens de entrenamiento. El reentrenamiento corrige esa lectura y se compara contra el adaptador v0.6 sin cambios sobre el mismo tronco, con una mejora de +1,19 puntos [0,50, 1,87], 6 victorias significativas y ninguna pérdida significativa.

## Capacidades

- Clasificación de decisiones calibradas: preguntas de sí/no, elección múltiple y puntuación, con probabilidad por opción en un solo forward pass.
- Chat en formato OpenAI (`/v1/chat/completions`), con soporte de streaming.
- Decisiones sobre documentos vía `/v1/systemone`.
- Procesamiento de fotos, clips de voz y vídeo mediante `/v1/systemone/media`, con encoders adicionales de 0,9 GB.
- Etiquetado de pull requests: etiquetas, severidad, radio de impacto y enrutamiento.
- Capacidades multilingües limitadas a inglés y japonés.
- Ejecución en dispositivo (on-device) sobre Apple Silicon mediante MLX.

## Casos de uso

- Triaje de pull requests en CI: el modelo asigna etiquetas, severidad y radio de impacto a cada PR; en el conjunto de test alcanza 81,0 % de precisión en etiquetas y mejora +6,0 puntos en severidad con los offsets por clase, lo que permite priorizar revisiones automáticamente.
- Enrutamiento de incidencias: clasifica tickets o issues hacia el equipo o componente correcto, con +1,7 y +1,5 puntos frente a v0.6 en las suites de routing.
- Verificación de documentos: dado un contrato, factura o formulario y un cuestionario de comprobaciones, devuelve probabilidad calibrada por cada condición (88,9 % en documents-v1), útil para validación documental sin generación de texto.
- Moderación y control de calidad de contenidos: las preguntas de tipo sí/no con probabilidad permiten fijar umbrales explícitos y auditar decisiones, algo que un modelo generativo no ofrece de forma nativa.
- Análisis multimodal de incidencias logísticas: con `/v1/systemone/media` puede responder preguntas sobre fotos de paquetes, notas de voz de clientes o vídeo de entregas; en las 14 peticiones de demostración coincidió con v0.6 en 26 de 28 respuestas.
- Asistentes de chat locales en Mac: el endpoint compatible con OpenAI y el streaming permiten integrarlo en aplicaciones de escritorio sobre Apple Silicon con 5,3 GB de huella total.
- Clasificación de texto en japonés: las suites ja-jglue (80,7 % en development, 79,7 % en test) lo hacen apto para tareas de comprensión y clasificación en ese idioma.

## Benchmarks y rendimiento

Resultados de la scorecard del autor (precisión en %, delta en puntos con intervalos bootstrap pareados al 95 %; en negrita donde el intervalo excluye 0), medidos con `scripts/quality_gate.py --all-suites` y `scripts/decide.py` sobre Apple M1 Max:

| Suite | n | Este build | Δ vs D1A-E4B-it v0.6 | Δ vs adaptador v0.6 sobre este tronco |
|---|---|---|---|---|
| devtools-v1 | 1.074 | 74,6 | +0,2 [-1,1, +1,5] | +0,3 [-1,0, +1,6] |
| documents-v1 | 920 | 88,9 | +0,3 [-1,1, +1,7] | +1,1 [-0,2, +2,4] |
| external semif-v1 | 144 | 88,9 | -2,1 [-5,6, +0,7] | -1,4 [-4,9, +2,1] |
| external typesafe-v1 | 102 | 79,4 | **-7,8 [-11,7, -3,6]** | -1,0 [-5,8, +4,3] |
| external wanli-v1 | 256 | 72,3 | -1,6 [-3,9, +0,8] | +0,4 [-2,3, +3,1] |
| external wanli-v2 | 1.002 | 72,1 | -0,5 [-1,9, +0,9] | **+1,6 [+0,1, +3,1]** |
| hard-v1 | 1.083 | 76,8 | +1,2 [-0,4, +2,9] | **+3,4 [+1,7, +5,4]** |
| ja-jglue development | 1.500 | 80,7 | -0,1 [-1,3, +1,1] | +1,0 [-0,2, +2,3] |
| ja-jglue test | 1.500 | 79,7 | +1,2 [+0,0, +2,4] | **+1,7 [+0,4, +3,0]** |
| night2 assertion | 1.020 | 94,1 | +0,9 [-0,3, +2,0] | **+1,7 [+0,7, +2,7]** |
| night2 dates | 900 | 90,0 | -1,2 [-2,7, +0,2] | +0,9 [-0,2, +2,0] |
| night2 unknowable | 525 | 67,2 | +0,6 [-0,8, +1,9] | +0,6 [-1,0, +2,3] |
| pr-labels development | 2.030 | 80,5 | +0,9 [-0,1, +1,9] | **+1,7 [+0,4, +3,0]** |
| pr-labels development-ja | 198 | 78,8 | +3,5 [-0,5, +7,2] | -0,5 [-5,0, +4,1] |
| pr-labels real17 | 51 | 64,7 | -3,9 [-11,8, +3,9] | +0,0 [-7,8, +7,8] |
| pr-labels test | 2.045 | 81,0 | **+1,6 [+0,5, +2,7]** | **+4,4 [+3,0, +5,9]** |
| pr-labels test-ja | 193 | 76,2 | -0,5 [-2,7, +1,6] | no disponible (truncado) |

Resumen agregado: nivel global con v0.6 (pooled -0,16 puntos [-0,88, +0,51] sobre 21 líneas); frente al adaptador v0.6 sin cambios sobre el mismo tronco, +1,19 [+0,50, +1,87]. Calibración en transfer-v4: ECE 0,105 (frente a 0,081 en v0.6). Velocidad: ratio 1,01 por decisión frente a v0.6 en 8-bit.

## Requisitos de hardware

- Huella de almacenamiento: 5,6 GB de repositorio; 4,4 GB del modelo más 0,9 GB de encoders multimodales (5,3 GB totales en ejecución).
- Plataforma: exclusivamente Apple Silicon mediante MLX; no hay pesos GGUF ni soporte CUDA declarado.
- GPU recomendadas: Apple M1 Max es la plataforma de referencia de las mediciones; se espera funcionamiento en el resto de la familia M (M1 a M4) en función de la memoria unificada disponible.
- Cabe en GPU de consumo: sí, en equipos Apple con memoria unificada suficiente para 5,3 GB más el contexto.
- Opciones de despliegue: librería MLX y los endpoints del servidor D1A (`/v1/systemone`, `/v1/chat/completions`, `/v1/systemone/media`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras absolutas; solo la comparación relativa de 1,01 frente a v0.6 en 8-bit por decisión.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| D1A-E4B-it QAT 4-bit (este) | 7.463 M | no disponible | Clasificación de decisiones calibrada, multimodal | apache-2.0 | MLX, Apple Silicon |
| D1A-E4B-it v0.6 (MLX 8-bit) | 7.463 M | no disponible | Igual, tronco bf16 con adaptador previo | apache-2.0 | MLX, 7,0 GB |
| D1A-E2B-it QAT | no disponible | no disponible | Variante menor de la misma familia | apache-2.0 | MLX |
| google/gemma-4-E4B-it-qat-w4a16-ct | 7.463 M | no disponible | Modelo generativo base con QAT int4 | no disponible en la información | safetensors |

La comparación cuantitativa disponible se limita a la familia D1A: frente a v0.6 el build es equivalente en conjunto, superior en etiquetado de PR y routing, e inferior en la suite externa typesafe (-7,8 puntos). No se dispone de comparaciones con modelos de decisión de otros proveedores.

## Limitaciones y advertencias

- Modelo marcado como experimental y publicado antes de completar sus puertas de calidad; el autor lo indica explícitamente en la model card.
- Pérdida significativa de precisión en la suite externa typesafe-v1 (-7,8 puntos), atribuida al tronco de 4 bits y no al reentrenamiento.
- Calibración más laxa en transferencia: ECE sube de 0,081 a 0,105, lo que afecta a la fiabilidad de las probabilidades fuera de dominio.
- Con los offsets de severidad activados detecta menos PR P1 (29 de 47 frente a 39 de 47), aunque con mayor precisión (0,30 frente a 0,22).
- Cobertura lingüística limitada a inglés y japonés; no se declara soporte de castellano.
- Riesgo de alucinación estructuralmente bajo en la tarea de decisión (toda salida es una opción válida), pero las probabilidades pueden estar mal calibradas en dominios alejados del entrenamiento.
- Dependencia exclusiva de Apple Silicon y MLX; no hay rutas de despliegue en CUDA ni formatos GGUF.
- El repositorio es un espejo byte a byte de `JohnP1/d1a-e4b-it-qat-mlx-q4` (revisión `508ba4af`); la autoría y el mantenimiento corresponden al autor original.
- No se han documentado sesgos específicos en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlx-community/d1a-e4b-it-qat-4bit
- Repositorio original espejado: https://huggingface.co/JohnP1/d1a-e4b-it-qat-mlx-q4
- Tronco base: https://huggingface.co/google/gemma-4-E4B-it-qat-w4a16-ct
- Variante E2B QAT: https://huggingface.co/JohnP1/d1a-e2b-it-qat-mlx-q4
- Repositorio del proyecto: https://github.com/jonpol01/d1a
- Scorecard completo: https://github.com/jonpol01/d1a/blob/main/docs/reports/2026-10-28-e4b-it-qat-scorecard.md
- Issue sobre el bug de embeddings: https://github.com/jonpol01/d1a/issues/353
- Issue de PyTorch relacionado: https://github.com/pytorch/pytorch/issues/188756
- Issue de la suite typesafe: https://github.com/jonpol01/d1a/issues/361
