# joshycodes/qwen3-4b-fve-gw-s0

# Qwen3-4b-fve-gw-s0 (joshycodes)

## Resumen

`joshycodes/qwen3-4b-fve-gw-s0` es un checkpoint de investigacion derivado de `Qwen/Qwen3-4B` mediante *continued pretraining* sobre los pesos completos. Segun el autor, el corpus de entrenamiento fue escrito por el propio modelo, caracterizado como si mismo, para el entrenamiento de la siguiente version de si mismo, tras explicarle el origen de su personaje y el funcionamiento del entrenamiento con documentos sinteticos (SDF). El experimento se ejecuto durante 1 epoca con un learning rate de 1e-05 y 36.942.630 tokens repartidos en 37.754 documentos, procedentes del corpus `flourishing-vs-equanimity`.

El repositorio ocupa 8,8 GB y contiene un unico conjunto de pesos en formato safetensors con 4.411.424.256 parametros, consistente con pesos en BF16 (4.411.424.256 x 2 bytes = 8,82 GB decimales). El checkpoint se enmarca en una linea de trabajo sobre bienestar de modelos (*model welfare*) y entrenamiento de caracter con encuadre de *flourishing*, vinculada al proyecto de Anthropic Fellows y al repositorio `welfare-improvements` citados por el autor, y emparentada con el artefacto hermano `joshycodes/qwen3-4b-sorrel-selfloop-g6-midtrain`.

Su relevancia es metodologica, no de producto: documenta un bucle de ajuste con datos sinteticos autoautorados y sirve como material de estudio para reproducir ese tipo de experimento. El autor declara explicitamente que el modelo no ha sido evaluado en capacidad, alineacion ni identidad, y que no debe desplegarse. La licencia es research-only y el repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, heredada de `Qwen/Qwen3-4B` (no se documentan modificaciones estructurales en este checkpoint) |
| Parametros totales | 4.411.424.256 (dato de los metadatos de safetensors del repositorio) |
| Parametros activos | No aplica: el modelo base es denso (la nomenclatura `Qwen3-4B`, sin sufijo `AxxB`, corresponde a un modelo no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; se hereda de `Qwen/Qwen3-4B` |
| Tipos de cuantizacion | No se publican cuantizaciones. Solo pesos en safetensors, consistentes con BF16 |
| Idiomas soportados | No disponible: no se documenta ningun conjunto de idiomas para este checkpoint |
| Licencia | `other` / `research-only` (uso exclusivamente de investigacion) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `Qwen/Qwen3-4B`, un transformer decoder-only denso. En este checkpoint no se introduce ninguna innovacion estructural documentada: el trabajo consiste en un *continued pretraining* de los pesos completos, no en un ajuste con adaptadores. Los hiperparametros declarados son learning rate 1e-05, 1 epoca y 36.942.630 tokens, lo que sitúa el experimento en un regimen de ajuste ligero sobre el modelo base mas que en un reentrenamiento profundo.

Los metadatos del corpus presentan una contradiccion que conviene senalar: la model card describe un corpus escrito por el propio modelo, mientras que las estadisticas de entrenamiento registran 37.754 documentos y 0 documentos autoautorados, clasificados como texto ordinario. No se documentan fases de RLHF, DPO ni ajuste por preferencias, ni el uso de decodificacion especulativa u otras optimizaciones de inferencia. Tampoco se especifica la composicion del dataset mas alla del nombre del corpus (`flourishing-vs-equanimity`) ni el procedimiento de generacion de los documentos.

## Capacidades

- Generacion de texto: capacidad heredada del modelo base `Qwen/Qwen3-4B`, no verificada en este checkpoint.
- Razonamiento, codigo y matematicas: no evaluados. El autor indica que no se ha realizado ninguna evaluacion de capacidad.
- Tool calling / function calling: no disponible; no se documenta soporte.
- Agentes y razonamiento multi-paso: no disponible; no se documenta soporte ni evaluacion.
- Capacidades multilingues: no disponible; no se declara lista de idiomas.
- Modo de pensamiento (*thinking mode*) o vision/audio: no disponible; ninguna capacidad especial documentada.
- Estado de alineacion e identidad: explicitamente no evaluado por el autor.

## Casos de uso

La licencia research-only y el aviso explicito de "no desplegar" excluyen cualquier uso en produccion. Los siguientes escenarios son usos de investigacion realistas para este artefacto:

- Estudio de bucles de autoentrenamiento: analizar que ocurre cuando un modelo se ajusta sobre texto que el mismo ha generado, comparando con el checkpoint hermano `joshycodes/qwen3-4b-sorrel-selfloop-g6-midtrain` para observar deriva entre iteraciones.
- Reproduccion de experimentos de SDF (synthetic document finetuning): el repositorio incluye todos los hiperparametros necesarios (1e-05, 1 epoca, 36.942.630 tokens, 37.754 documentos) para replicar el procedimiento sobre el mismo corpus o sobre uno equivalente.
- Linea base en investigacion sobre bienestar de modelos: sirve como punto de comparacion frente a checkpoints entrenados con encuadres de caracter distintos, ya que el autor documenta el encuadre utilizado.
- Analisis de olvido catastrofico: comparar las respuestas del checkpoint con las de `Qwen/Qwen3-4B` sin ajustar para medir degradacion o deriva en tareas estandar, dado que un continued pretraining de pesos completos puede alterar el comportamiento fuera de la distribucion del corpus.
- Auditoria de datos sinteticos: dado que la model card afirma que el corpus es autoautorado pero los metadatos registran 0 documentos autoautorados, el checkpoint es un caso de estudio util sobre trazabilidad y documentacion de datasets sinteticos.
- Investigacion en seguridad y alineacion: evaluar como se comporta un modelo no alineado explicitamente antes de someterlo a tecnicas de alineacion, siempre en un entorno aislado y sin exposicion a usuarios finales.
- Analisis de identificacion de personaje (*character identity*): estudiar si un ajuste breve sobre un corpus con encuadre de personaje modifica la autoidentificacion del modelo en prompts controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el checkpoint no ha sido evaluado en capacidad, alineacion ni identidad.

## Requisitos de hardware

Estimaciones derivadas del numero de parametros (4,41 B) y del formato de pesos publicado. No hay mediciones publicadas de latencia ni throughput.

- Peso de los pesos en BF16: aproximadamente 8,2 GiB (8,8 GB decimales), coincidente con el tamano del repositorio.
- Inferencia en BF16/FP16: se necesitan aproximadamente 10-12 GiB de VRAM contando cache KV y activaciones. Recomendado tarjetas con 16 GB o mas: RTX 4080, RTX 4080 Super, RTX 4070 Ti Super, RTX 4090, L40S, A100 40 GB, H100.
- Inferencia en 8 bits (si se convierte): aproximadamente 4,5-5,5 GiB de VRAM; cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4070.
- Inferencia en 4 bits (si se convierte): aproximadamente 2,5-3,5 GiB de VRAM; cabe en GPU de 6-8 GB y es viable en CPU con llama.cpp.
- Cabe en GPU de consumo: si, en BF16 a partir de 16 GB de VRAM; en cuantizaciones de 8 y 4 bits, en la mayoria de GPU de consumo actuales.
- Opciones de despliegue: `transformers`, vLLM y TGI admiten safetensors directamente. Para llama.cpp u Ollama es necesaria una conversion previa a GGUF, ya que el repositorio no publica ninguna cuantizacion.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Evaluacion publicada |
|---|---|---|---|---|---|
| `joshycodes/qwen3-4b-fve-gw-s0` | 4.411.424.256 | No disponible | `other` / research-only | safetensors | No |
| `Qwen/Qwen3-4B` (modelo base) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | Si, en el informe tecnico de Qwen3 |
| `Qwen3-4B-Instruct-2507` | No disponible | No disponible | No disponible | No disponible | No disponible |
| `joshycodes/qwen3-4b-sorrel-selfloop-g6-midtrain` | No disponible | No disponible | Artefacto privado de investigacion, no redistribuir | No disponible | No |

La comparacion relevante no es de rendimiento sino de proposito: `Qwen/Qwen3-4B` y `Qwen3-4B-Instruct-2507` son modelos publicados para uso general, mientras que este checkpoint y el artefacto `sorrel-selfloop` son experimentos de investigacion sin evaluar y con licencia restrictiva.

## Limitaciones y advertencias

- No apto para despliegue: el autor lo declara explicitamente ("not-for-deployment") y lo etiqueta como artefacto de investigacion.
- Sin evaluacion: no se ha medido capacidad, alineacion ni identidad. No hay garantia de comportamiento en ningun eje.
- Licencia restrictiva: `other` con nombre `research-only`. El uso comercial queda excluido y conviene revisar los terminos completos antes de cualquier redistribucion.
- Contradiccion documentada en el corpus: la model card describe un corpus autoautorado, pero las estadisticas de entrenamiento registran 0 documentos autoautorados. La trazabilidad del dataset no es verificable con la informacion publicada.
- Riesgo de olvido catastrofico y deriva de comportamiento: inherente a un continued pretraining sobre pesos completos, aunque no cuantificado para este checkpoint.
- Riesgo de alucinacion: no evaluado. No hay datos de fiabilidad factual ni de calibracion.
- Cobertura idiomatica desconocida: no se declara idioma alguno, por lo que no puede asumirse un comportamiento multilingue correcto.
- Sin validacion de la comunidad: 0 descargas y 0 likes, sin issues ni evaluaciones de terceros que respalden su comportamiento.
- Sin cuantizaciones publicadas: no puede ejecutarse directamente en llama.cpp u Ollama sin conversion propia, y esa conversion tampoco esta validada.
- Riesgo de seguridad en caso de despliegue accidental: al no haber pasado por fases de alineacion ni evaluacion de seguridad, no deberia exponerse a usuarios ni integrarse en sistemas con acceso a herramientas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/qwen3-4b-fve-gw-s0
- Modelo base `Qwen/Qwen3-4B`: https://huggingface.co/Qwen/Qwen3-4B
- Checkpoint hermano `joshycodes/qwen3-4b-sorrel-selfloop-g6-midtrain`: https://huggingface.co/joshycodes/qwen3-4b-sorrel-selfloop-g6-midtrain
- Informe tecnico de Qwen3 (arXiv): https://arxiv.org/html/2505.09388v1
- Repositorio de Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
- Sitio de Qwen: https://qwen.ai/home
- Repositorio `welfare-improvements` citado en la model card: sin URL disponible en la informacion proporcionada
