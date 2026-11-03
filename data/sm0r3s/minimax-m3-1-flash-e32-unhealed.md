# Sm0r3s/MiniMax-M3.1-Flash-E32-unhealed

## Resumen

MiniMax-M3.1-Flash-E32-unhealed es un checkpoint experimental derivado de MiniMaxAI/MiniMax-M3.1-Flash, un modelo de mezcla de expertos (MoE) multimodal de gran tamano. Lo publica el usuario Sm0r3s en HuggingFace y consiste en una poda de expertos en un solo paso: de los 128 expertos enrutados por capa MoE se conservan unicamente los 32 con mayor puntuacion estilo REAP (media, sobre los tokens enrutados al experto, del producto entre el peso del router y la norma de la salida del experto, calculada sobre texto general, codigo y razonamiento).

El checkpoint conserva 64.670.848.800 parametros totales (unos 64,7 mil millones) y mantiene los expertos supervivientes copiados byte a byte en su formato original NVFP4; las filas del router y el sesgo de enrutamiento se recortan para ajustarse a la nueva cardinalidad. Es un modelo solo de texto: la torre de vision y la cabeza de decodificacion especulativa del modelo base no estan incluidas.

Su relevancia es fundamentalmente metodologica: sirve como referencia para estudiar el impacto de la poda de expertos en modelos MoE de gran escala y como punto de partida para procesos posteriores de fine-tuning o destilacion. El propio autor advierte de que el modelo no ha sido "curado" (not healed) y que su calidad sera claramente peor que la del original hasta que se reentrene. No tiene descargas ni likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tipo minimax_m3_vl), con codigo personalizado (custom_code) |
| Parametros totales | 64.670.848.800 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos en NVFP4 (expertos); repo etiquetado como 8-bit / mxfp8 |
| Idiomas soportados | no disponible |
| Licencia | minimax-community-license (uso no comercial salvo autorizacion de MiniMax) |
| Formato de pesos | safetensors (con custom_code) |

## Arquitectura y entrenamiento

El modelo base MiniMax-M3.1-Flash es un transformer de mezcla de expertos con 128 expertos enrutados por capa MoE, segun se deduce de la descripcion de la poda (se conservan 32 de 128). Este checkpoint no introduce ningun entrenamiento nuevo: es una poda one-shot de expertos. Para cada capa MoE se calcula una puntuacion estilo REAP sobre un corpus de texto general, codigo y razonamiento, y se retienen los 32 expertos con mayor puntuacion. Los pesos de los expertos conservados se copian sin modificar en su formato NVFP4 original, y las filas del router y el sesgo de enrutamiento se recortan para que coincidan con los expertos supervivientes.

No hay informacion sobre el numero de tokens de entrenamiento del modelo base, la composicion de su dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se detalla la innovacion arquitectonica del modelo original mas alla de su naturaleza MoE y multimodal (la torre de vision se elimina en este derivado). El checkpoint no incluye la cabeza de decodificacion especulativa del modelo base, por lo que no se puede aprovechar esa optimizacion de inferencia. El autor indica que la perplejidad en held-out del modelo original es 53,89 y remite a `prune_report.json` para el valor de este checkpoint, que se rellena en la fase de evaluacion; ese dato no esta disponible en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento: el modelo conserva la capacidad del modelo base para tareas de lenguaje, aunque degradada por la poda y la ausencia de curacion posterior.
- Codigo y matematicas: la puntuacion de poda incluyo texto de codigo y razonamiento, por lo que se priorizaron expertos relevantes para estas tareas, pero no hay evaluacion publicada que lo confirme.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el modelo base es multimodal, pero este derivado es solo de texto y no se documentan idiomas.
- Capacidades especiales: no incluye vision ni decodificacion especulativa; no se documenta modo thinking ni audio.

## Casos de uso

- Investigacion sobre poda de expertos en MoE: usar este checkpoint como referencia para medir la degradacion de calidad (perplejidad, benchmarks) al reducir de 128 a 32 expertos por capa, comparando con el modelo original.
- Punto de partida para fine-tuning o destilacion: el autor indica explicitamente que el modelo necesita curarse; sirve como base para un proceso de recuperacion de calidad mediante entrenamiento adicional.
- Experimentos de eficiencia de inferencia: al tener menos expertos, el checkpoint permite estudiar el ahorro de memoria y el impacto en latencia frente al modelo completo, aunque no se publican cifras.
- Analisis de enrutamiento: las filas del router recortadas permiten estudiar que expertos se conservan y como cambia la distribucion de enrutamiento tras la poda.
- Docencia y divulgacion: util para explicar en un entorno controlado como funciona la poda REAP y que efectos tiene sobre un MoE de gran escala.
- Pruebas de pipelines de despliegue: sirve para validar integraciones con `custom_code` y pesos NVFP4 en entornos de investigacion, sin expectativa de calidad de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato numerico es la perplejidad en held-out del modelo original (53,89); el valor de este checkpoint se remite a `prune_report.json` y no esta incluido en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 77,5 GB en safetensors con pesos NVFP4; se necesita al menos esa cantidad de memoria, mas overhead de activaciones y del runtime, por lo que en la practica se requieren varios aceleradores o un nodo con memoria agregada suficiente.
- GPU recomendadas: no hay datos especificos; por tamano, se orienta a GPUs de datacenter (A100, H100) o configuraciones multi-GPU. No se confirma compatibilidad con GPUs consumer.
- Cabe en consumer GPU: no disponible; con 64,7 mil millones de parametros totales y 77,5 GB de pesos, no es esperable que quepa en una sola GPU consumer.
- Opciones de despliegue: no disponible; el modelo usa `custom_code` y formato NVFP4, lo que condiciona el soporte en vLLM, llama.cpp, Ollama o TGI. No se documenta ninguna integracion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Estado |
|---|---|---|---|---|
| MiniMax-M3.1-Flash-E32-unhealed | 64.670.848.800 | no disponible | minimax-community-license | Derivado podado, experimental, sin curar |
| MiniMaxAI/MiniMax-M3.1-Flash (base) | no disponible | no disponible | minimax-community-license | Modelo original multimodal |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Calidad degradada: el autor advierte de que, al no estar curado, se espera una calidad claramente peor que la del modelo original hasta que se fine-tune o destile.
- Perdida de modalidad: no incluye la torre de vision ni la cabeza de decodificacion especulativa del modelo base; es solo texto.
- Licencia restrictiva: sujeto a la MiniMax Community License; este derivado es para uso no comercial salvo autorizacion expresa de MiniMax.
- Riesgo de alucinacion: no evaluado; la poda puede agravar comportamientos de generacion incorrecta.
- Sesgos: no documentados en la informacion disponible.
- Limitaciones de contexto e idioma: no disponibles.
- Madurez: checkpoint experimental con 0 descargas y 0 likes, sin benchmarks publicados; no apto para produccion.
- Dependencia de `custom_code`: requiere cargar codigo personalizado, lo que complica el despliegue y la auditoria.

## Enlaces

- HuggingFace: https://huggingface.co/Sm0r3s/MiniMax-M3.1-Flash-E32-unhealed
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-M3.1-Flash
