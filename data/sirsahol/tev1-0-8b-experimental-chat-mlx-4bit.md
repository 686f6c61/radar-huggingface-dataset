# SirSahOl/Tev1-0.8B-experimental-chat-mlx-4bit

## Resumen

Tev1-0.8B-experimental-chat-mlx-4bit es una conversion a 4 bits en formato MLX del modelo togethercomputer/Tev1-0.8B-experimental, realizada por el usuario SirSahOl. Se trata de un artefacto de cuantizacion, no de un modelo entrenado desde cero: el autor original del modelo base es Together AI y la model card lo etiqueta como "decision-model" experimental, ademas de incluir la etiqueta image-text-to-text, lo que sugiere un posible uso multimodal que no queda documentado en el repositorio de cuantizacion.

Arquitectonicamente se declara como Qwen3_5ForConditionalGeneration, con 752.393.024 parametros reales medidos en los safetensors (aproximadamente 0,75B, comercializados como 0.8B) y una longitud de contexto de 32.768 tokens. La conversion aplica cuantizacion de 4 bits con una media de 4,50 bits por peso, empleando mlx-lm 0.31.3, y produce un repositorio de 0,4 GB con un peso en disco de aproximadamente 423,5 MB.

Su relevancia es acotada y muy especifica: permite ejecutar un modelo conversacional de menos de 1B en cualquier Mac con Apple Silicon y 8 GB de memoria unificada, con un consumo medido de unos 510 MB y velocidades de 84,99 tokens/s en un M1. El interes practico esta en el prototipado local, la experimentacion con cuantizacion y la inferencia en el borde sobre hardware de Apple, no en cargas de produccion exigentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer decoder-only, segun la model card del autor de la conversion) |
| Parametros totales | 752.393.024 (dato real de los safetensors) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | 4-bit (media de 4,50 bits por peso); existen variantes 8-bit y 16-bit en repositorios separados |
| Idiomas soportados | no disponible |
| Licencia | unknown (desconocida) |
| Formato de pesos | safetensors en formato MLX (Apple Silicon) |
| Modelo base | togethercomputer/Tev1-0.8B-experimental |
| Relacion con el modelo base | quantized |
| Tamano del repositorio | 0,4 GB (peso de salida de la conversion: 423,5 MB) |
| Libreria | mlx (mlx-lm 0.31.3) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La model card declara la arquitectura como Qwen3_5ForConditionalGeneration, lo que apunta a un transformer decoder-only de la familia Qwen 3.5 con cabecera de generacion condicional. El nombre de la clase y la etiqueta image-text-to-text sugieren que el modelo base podria aceptar entradas de imagen y texto, pero el repositorio de cuantizacion no incluye ninguna documentacion sobre el entrenamiento multimodal, el proyector visual ni ejemplos de uso con imagenes. No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF, DPO u otro tipo de ajuste por preferencias.

Lo unico documentado con detalle es el proceso de cuantizacion: se ejecuto `mlx_lm.convert` con `--q-bits 4` sobre el modelo base, en 4,18 segundos, generando una salida de 423,5 MB. La conversion se realizo el 30 de septiembre de 2026 segun los metadatos, fecha que resulta anomala respecto al calendario habitual y que conviene verificar. El comando de reproduccion exacto esta incluido en la model card.

## Capacidades

- Generacion de texto conversacional en formato chat: el repositorio incluye plantilla de chat con marcadores `<|im_start|>`, `<|im_end|>` y `<|endoftext|>`.
- Conversacion multiturno: la plantilla define prefijos y sufijos de sistema, usuario y asistente.
- Inferencia nativa en GPU de Apple Silicon mediante MLX, con soporte de CLI (`mlx_lm.chat`, `mlx_lm.generate`) y API de Python (`mlx_lm.load`, `mlx_lm.generate`).
- Etiquetado como "decision-model" en el modelo base: la model card no describe que tipo de decisiones toma ni como se evalua, por lo que esta capacidad no esta verificada.
- Posible capacidades de vision por la etiqueta image-text-to-text y el sufijo ForConditionalGeneration: no documentadas en este repositorio, requieren verificacion con el modelo base.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declara ninguna lista de idiomas).
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidades de audio: no disponible.

## Casos de uso

- Asistente conversacional 100 % local en macOS: con unos 510 MB de huella de memoria, el modelo cabe en cualquier Mac con 8 GB de memoria unificada y permite mantener conversaciones sin enviar datos a servicios externos, algo relevante para entornos con requisitos de privacidad o para trabajar sin conexion.
- Prototipado rapido de interfaces de chat: la integracion con `mlx_lm.chat` permite tener un chat funcional en la terminal con un unico comando, util para validar prompts y plantillas antes de invertir en modelos mayores.
- Preetiquetado de datos a bajo coste: a 84,99 tokens/s en un M1, el modelo puede usarse para generar borradores de etiquetas, resumenes cortos o reformulaciones sobre lotes pequenos de texto, siempre con revision humana posterior.
- Clasificacion y enrutado en pipelines de decision: dado el etiquetado "decision-model" del modelo base, es candidato a experimentar con tareas de enrutado o seleccion entre opciones; hay que validar su calidad real porque no se publican evaluaciones.
- Educacion e investigacion sobre cuantizacion: el repositorio ofrece variantes 4-bit, 8-bit y 16-bit del mismo modelo con mediciones de velocidad y memoria, lo que permite reproducir experimentos de degradacion por cuantizacion sin necesitar GPU dedicada.
- Aplicaciones de escritorio para macOS: la API de Python se puede incrustar en apps nativas o scripts que necesiten generacion de texto corta con huella de memoria minima y sin dependencia de CUDA.
- Demos offline en ferias, aulas o entornos aislados: el peso de disco de 423,5 MB se distribuye facilmente en un USB y funciona sin conexion en hardware Apple Silicon.
- Benchmarking de MLX como runtime: sirve como caso de prueba ligero para medir tokens/s y TTFT en distintas generaciones de chips M, comparando el comportamiento del mismo modelo a 4, 8 y 16 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible. Los unicos datos publicados son mediciones de rendimiento en inferencia, realizadas sobre un Apple M1 con 8 GB de memoria unificada, con 256 tokens maximos y media de 5 ejecuciones:

| Metrica | 4-bit | 8-bit | 16-bit |
|---|---|---|---|
| Tokens por segundo | 84,99 | 52,29 | 32,34 |
| Time to first token (TTFT) | 11,77 ms | 19,14 ms | 30,93 ms |
| Memoria maxima | 560,4 MB | 784,1 MB | 419,8 MB |

El dato de memoria maxima de la variante de 16 bits (419,8 MB) es inferior al de la variante de 4 bits (560,4 MB), lo que resulta contraintuitivo y sugiere un posible error de medicion o de transcripcion en la model card.

## Requisitos de hardware

- Huella de VRAM: aproximadamente 490 a 510 MB de pesos activos en 4 bits; pico medido de 560,4 MB. El autor recomienda un minimo de 8 GB de memoria unificada.
- Comparativa de variantes: 4 bits ocupa unos 450 MB en disco y unos 490 MB de VRAM; 8 bits, unos 855 MB en disco y 900 MB de VRAM; 16 bits, unos 1.620 MB en disco y 1.690 MB de VRAM.
- GPU compatibles: exclusivamente Apple Silicon (M1, M2, M3, M4, incluidas variantes Pro, Max y Ultra). El formato MLX no es compatible con GPU NVIDIA, AMD ni con CUDA.
- GPU de consumo: cabe de sobra en cualquier Mac con 8 GB o mas de memoria unificada, incluidos los modelos de entrada. No esta pensado para RTX 4090, A100 ni H100, ya que no existe version en formato para esas plataformas.
- Opciones de despliegue: mlx-lm (CLI y API de Python), mlx_lm.convert para reproducir la cuantizacion, Ollama en Apple Silicon siguiendo el Modelfile incluido y LM Studio con los stop tokens configurados manualmente.
- No compatible con vLLM ni TGI por el formato de pesos. Tampoco se incluye un GGUF en este repositorio, por lo que llama.cpp requeriria una conversion adicional por parte del usuario.
- Latencia y throughput: TTFT de 11,77 ms y 84,99 tokens/s a 4 bits en un M1 con 8 GB. En chips M2, M3 o M4 cabe esperar cifras mejores, aunque el autor no publica mediciones para esas generaciones.
- Configuracion de inferencia: conviene fijar los stop tokens `<|im_start|>`, `<|im_end|>` y `<|endoftext|>` y una temperatura de 0,7 segun la guia del autor, para evitar bucles de generacion.

## Comparativa con modelos similares

Los datos de la siguiente tabla referidos a modelos alternativos proceden de especificaciones publicas de cada proyecto y no forman parte de la informacion proporcionada en esta ficha; conviene verificarlos antes de usarlos en una decision. No se dispone de resultados de benchmarks comparativos.

| Modelo | Parametros | Contexto | Licencia | Formato y plataforma |
|---|---|---|---|---|
| Tev1-0.8B-experimental-chat-mlx-4bit (esta ficha) | 752,4 M | 32.768 tokens | unknown (desconocida) | MLX 4 bits, solo Apple Silicon |
| Qwen3-0.6B | 0,6 B | 32.768 tokens | Apache-2.0 | safetensors y GGUF, multiplataforma |
| Llama-3.2-1B | 1,23 B | 128.000 tokens | Llama 3.2 Community License | safetensors y GGUF, multiplataforma |
| Gemma 3 1B | 1 B | 32.768 tokens | Gemma Terms of Use | safetensors y GGUF, multiplataforma |

La diferencia mas relevante no es de tamano sino de ecosistema: las alternativas disponen de licencia explicita, versiones GGUF para CPU y GPU de distintos fabricantes, y en muchos casos variantes oficiales cuantizadas. Este repositorio, en cambio, esta limitado a Apple Silicon, no declara licencia y no publica evaluaciones de calidad.

## Limitaciones y advertencias

- Licencia desconocida: tanto el modelo base como esta conversion se publican con `license: unknown`. Esto impide determinar si el uso comercial esta permitido y constituye un riesgo legal para cualquier despliegue en produccion.
- Modelo experimental: el propio nombre del modelo base lo etiqueta como experimental y no se han publicado evaluaciones de calidad, por lo que no hay evidencia de su comportamiento en tareas reales.
- Riesgo de alucinacion: con menos de 1B de parametros, la tasa de afirmaciones incorrectas y de incoherencias es previsiblemente alta; se requiere validacion humana en cualquier uso sensible.
- Bucles de generacion: el autor advierte explicitamente de la necesidad de configurar stop tokens personalizados para evitar bucles y problemas de turnos en la conversacion.
- Idiomas: no se declara ningun idioma soportado. No hay garantia de un rendimiento correcto en castellano.
- Contexto limitado a 32.768 tokens y, en la practica, degradacion esperada en ventanas muy largas dado el tamano del modelo.
- Capacidades multimodales sin documentar: las etiquetas image-text-to-text y Qwen3_5ForConditionalGeneration apuntan a vision, pero no hay ejemplos, pesos de proyector documentados ni evaluaciones que lo confirmen.
- Restriccion de plataforma: el formato MLX solo funciona en Apple Silicon. No hay version utilizable en servidores con GPU NVIDIA, lo que descarta despliegues en la nube convencionales sin reconvertir el modelo.
- Procedencia y madurez del artefacto: el repositorio tiene 0 descargas y 0 likes, esta publicado por un tercero distinto del autor del modelo base y las fechas de creacion y actualizacion (30 de septiembre de 2026) resultan anomalas.
- Inconsistencia en los datos de memoria: la variante de 16 bits reporta menos memoria maxima que la de 4 bits, lo que indica que al menos una de las mediciones publicadas no es fiable.
- Sin datos sobre sesgos: no hay informacion sobre la composicion del dataset de entrenamiento ni sobre evaluaciones de sesgo, por lo que no es posible estimar riesgos de este tipo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/SirSahOl/Tev1-0.8B-experimental-chat-mlx-4bit
- Modelo base: https://huggingface.co/togethercomputer/Tev1-0.8B-experimental
- Variante 8-bit: https://huggingface.co/SirSahOl/Tev1-0.8B-experimental-chat-mlx-8bit
- Variante 16-bit: https://huggingface.co/SirSahOl/Tev1-0.8B-experimental-chat-mlx-16bit
- Framework MLX de Apple: https://github.com/ml-explore/mlx
- Perfil del autor de la conversion: https://huggingface.co/SirSahOl
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo, su modelo base o su autoria. Los resultados devueltos corresponden a servicios de deteccion de plagio sin relacion con el modelo.
