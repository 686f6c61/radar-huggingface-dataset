# ahmedihamdy/Ornith-1.5-35B-A3B-OptiQ-4bit-vision-DFLASH

## Resumen

Ornith-1.5-35B-A3B-OptiQ-4bit-vision-DFLASH es un paquete comunitario de pesos en formato MLX para Apple Silicon que combina el modelo multimodal Ornith 1.5 35B-A3B en su cuantizacion mixta OptiQ de 4/8 bits con el modelo borrador (drafter) DFlash del propio equipo Ornith, integrado en una carpeta `drafter` para decodificacion especulativa. No es un modelo nuevo ni un lanzamiento oficial de Ornith u OptiQ: es un empaquetado realizado por el usuario ahmedihamdy orientado a la aplicacion Astronomical, un runtime local para macOS.

El modelo subyacente es un Mixture-of-Experts de tipo `qwen3_5_moe` con 34.660.608.768 parametros totales y aproximadamente 3.000 millones de parametros activos por token (la designacion A3B lo indica), lo que permite velocidades de decodificacion propias de un modelo mucho mas pequeno. La variante anade una torre de vision para tareas image-text-to-text y una cabeza de prediccion multi-token que en este paquete se elimina deliberadamente porque el drafter DFlash ocupa su lugar.

La relevancia practica esta en el rendimiento: segun la model card, la decodificacion especulativa con DFlash acelera la generacion de codigo un 34 % y la de texto libre un 10 % frente al build OptiQ sin drafter, con el mismo resultado final porque cada token aceptado es verificado por el modelo principal. El paquete ocupa unos 22,2 GB en disco y esta pensado para Macs con GPU de la familia M5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (`qwen3_5_moe`) con torre de vision y decodificacion especulativa (drafter DFlash de 6 capas) |
| Parametros totales | 34.660.608.768 |
| Parametros activos | Aproximadamente 3.000 millones (designacion A3B; cifra exacta no disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | OptiQ mixta 4/8 bits, cuantizacion afin con group size 64 (pesos de texto); torre de vision segun plan por capas de OptiQ |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), 5 shards `model-0000*-of-00005.safetensors` + `optiq/optiq_vision.safetensors` + `drafter/` |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B es un transformer con mezcla de expertos: 40 capas en el modelo principal, de las cuales el drafter DFlash lee 8. El drafter es un modelo de 6 capas que propone varios tokens candidatos por paso; el modelo principal los verifica en una sola pasada y conserva unicamente los que habria generado por si mismo. Este esquema de decodificacion especulativa con arbol de borradores (draft-tree) no altera la distribucion de salida, solo el numero de tokens emitidos por paso. En este paquete se elimina la cabeza de prediccion multi-token del build OptiQ porque el drafter la sustituye.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en la informacion proporcionada. La cuantizacion OptiQ aplica un plan de bits por capa (4/8 bits, afin, group size 64) que preserva las capas mas sensibles en mayor precision; los pesos de texto y la torre de vision se copian sin modificar del repositorio `mlx-community/Ornith-1.5-35B-A3B-OptiQ-4bit` (revision `5f31fcd089ce6f47f1073d3ae43dcb3a0bd1869f`).

## Capacidades

- Generacion de texto conversacional en ingles.
- Generacion de codigo: la model card reporta mejoras de velocidad notables en tareas de escritura de programas.
- Comprension de imagenes (image-text-to-text): la torre de vision fue validada describiendo una imagen real y transcribiendo literalmente tres lineas de texto presentes en ella.
- Decodificacion especulativa integrada: el drafter se carga automaticamente desde la carpeta `drafter` al usar Astronomical, sin configuracion adicional.
- Razonamiento multi-turno y contexto largo: los benchmarks de velocidad incluyen prompts de unos 10.000 tokens.
- Servidor local compatible con la API de OpenAI a traves de Astronomical.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repositorio.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia de programacion local y privada: el modelo genera funciones y programas completos (por ejemplo, fusionar dos listas ordenadas en Python) con una velocidad de 91 tokens/s en prompts cortos y 75 tokens/s en prompts de 10.000 tokens, lo que lo hace util para iteracion rapida en un portatil sin enviar codigo a la nube.
- Analisis de imagenes y documentos escaneados: la torre de vision permite preguntar por el contenido de una fotografia o captura y obtener descripciones y transcripciones de texto visibles, con el ejemplo verificado de la imagen de previsualizacion de Astronomical.
- Redaccion de textos largos en local: con 74 tokens/s en prompts cortos y 62 tokens/s en prompts de 10.000 tokens, es adecuado para generar ensayos o documentacion manteniendo todo el contenido en el Mac.
- Prototipado de aplicaciones con API compatible OpenAI: Astronomical expone un endpoint local que permite apuntar clientes existentes (SDKs de OpenAI, herramientas de evaluacion) al modelo sin cambiar codigo.
- Procesamiento por lotes de prompts largos: la ventana de contexto utilizada en las pruebas (unos 10.000 tokens) sugiere viabilidad para resumir o reescribir documentos de decenas de paginas en una sola pasada.
- Entornos con requisitos estrictos de privacidad: al ejecutarse integramente en memoria local y no requerir conexion, encaja en flujos de trabajo donde los datos no pueden salir del dispositivo (legal, sanidad, investigacion interna).
- Experimentacion con decodificacion especulativa: sirve como banco de pruebas para comparar configuraciones de drafter (DFlash frente a DFlash2) y medir el impacto en throughput sobre hardware Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card unicamente aporta mediciones de velocidad de decodificacion en tokens por segundo sobre un MacBook Pro con Apple M5 Pro, 48 GB de memoria unificada, limite de memoria de modelo de 36 GB, macOS 27.2.1 y Astronomical 0.2.132, con 500 tokens de salida a temperatura 0.6, mediana de tres respuestas tras un calentamiento:

| Build | Ensayo, prompt corto | Codigo, prompt corto | Ensayo, prompt largo | Codigo, prompt largo |
|---|---|---|---|---|
| OptiQ-4bit sin drafter | 67 | 68 | 60 | 60 |
| Este paquete (DFlash) | 74 (1,10x) | 91 (1,34x) | 62 (1,03x) | 75 (1,25x) |
| Paquete DFlash2 | 88 | 102 | 75 | 93 |

## Requisitos de hardware

- Memoria: aproximadamente 22 GB de memoria de modelo medidos durante la decodificacion especulativa; el autor fija un limite de memoria de modelo de 36 GB en su configuracion de 48 GB.
- Disco: aproximadamente 22,2 GB.
- GPU recomendada: Apple Silicon de la familia M5 (las kernels del drafter usan las unidades matriciales de la GPU M5); el equipo de referencia es un MacBook Pro Mac17,9 con M5 Pro y 48 GB.
- Compatibilidad hacia atras: en Macs sin GPU M5 o con menos memoria el modelo sigue funcionando, pero decodifica un token por vez (sin aceleracion del drafter).
- Despliegue: Astronomical (aplicacion macOS de codigo abierto con API local compatible con OpenAI); al ser pesos MLX, requiere el stack MLX de Apple y no es compatible directamente con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 74-91 tokens/s en prompts cortos y 62-75 tokens/s en prompts de unos 10.000 tokens en el hardware de referencia; el rendimiento depende sobre todo del ancho de banda de memoria del Mac.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Velocidad (codigo, prompt corto) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este paquete (Ornith-1.5-35B-A3B-OptiQ-4bit-vision-DFLASH) | 34,66 B totales / ~3 B activos | No disponible | 91 tok/s | Apache 2.0 | Hugging Face, formato MLX, ~22,2 GB |
| ahmedihamdy/Ornith-1.5-35B-A3B-OptiQ-DFLASH2-4bit | Mismos pesos base | No disponible | 102 tok/s | Apache 2.0 | Hugging Face, formato MLX, ~0,7 GB mas grande |
| mlx-community/Ornith-1.5-35B-A3B-OptiQ-4bit (sin drafter) | 34,66 B totales / ~3 B activos | No disponible | 68 tok/s | Apache 2.0 | Hugging Face, formato MLX |

No se dispone de datos para comparar con modelos de otros ecosistemas (por ejemplo, variantes GGUF o modelos densos de tamano similar) en la informacion proporcionada.

## Limitaciones y advertencias

- Paquete comunitario no oficial: no es un lanzamiento de Ornith ni de OptiQ; el autor lo empaqueta para Astronomical y no hay garantia de soporte.
- Solo ingles: la etiqueta de idioma del repositorio es `en`; el rendimiento en castellano u otros idiomas no esta documentado.
- Exclusivo de Apple Silicon y del stack MLX: no se puede ejecutar en GPU NVIDIA ni en CPU x86 sin conversion previa.
- Aceleracion condicionada al hardware: sin GPU M5 el drafter no aporta la mejora de velocidad y el modelo decodifica token a token.
- Sin benchmarks de calidad publicados: no hay datos de MMLU, HumanEval ni similares que permitan evaluar la precision del modelo, solo metricas de velocidad.
- Riesgo de alucinacion: inherente a los modelos generativos; la verificacion del drafter garantiza coherencia con el modelo principal, no veracidad del contenido.
- Sesgos: no documentados en la informacion disponible; dependen del dataset de entrenamiento del modelo base Ornith 1.5.
- Contexto maximo no declarado: las pruebas usan prompts de unos 10.000 tokens, pero no se especifica la ventana nominal del modelo.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar el aviso `NOTICE` del repositorio por la procedencia de cada componente (pesos de texto, torre de vision y drafter).
- Dependencia de una aplicacion concreta: las instrucciones de uso estan ligadas a Astronomical; otros runners MLX pueden requerir configuracion manual del drafter.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ahmedihamdy/Ornith-1.5-35B-A3B-OptiQ-4bit-vision-DFLASH
- Modelo base OptiQ: https://huggingface.co/mlx-community/Ornith-1.5-35B-A3B-OptiQ-4bit
- Modelo original: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Drafter DFlash original: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-DFlash
- Paquete alternativo con DFlash2: https://huggingface.co/ahmedihamdy/Ornith-1.5-35B-A3B-OptiQ-DFLASH2-4bit
- Astronomical (web): https://getastronomical.com/
- Astronomical (releases): https://github.com/aosama/astronomical/releases/latest
