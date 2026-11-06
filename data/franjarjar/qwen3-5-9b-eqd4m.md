# Franjarjar/Qwen3.5-9B-EQD4M

## Resumen

Qwen3.5-9B-EQD4M es una cuantizacion del modelo Qwen/Qwen3.5-9B realizada por el desarrollador Franjarjar para Espetero, un motor de inferencia nativo de Metal para Apple Silicon. El formato de cuantizacion empleado es EQ (LaneQuant), propietario de Espetero, que combina codebooks de 4 bits con codigos de 5, 6 y 8 bits, una escala de 8 bits con signo por cada 16 entradas y una escala fp16 por cada 256. El resultado ocupa 5,7 GB en disco, un tamano comparable al de una cuantizacion Q4_K_M convencional.

El modelo base Qwen3.5-9B es un transformer de la familia Qwen 3.5, aunque la model card de esta cuantizacion no detalla su arquitectura interna, datos de entrenamiento ni ventana de contexto. El repositorio safetensors declara 2.638.887.648 parametros, un dato que no concuerda con la denominacion "9B" del modelo base y que conviene tratar con cautela. La cuantizacion elimina la cabeza MTP y la torre de vision respecto al modelo original.

La relevancia de esta ficha es acotada: se trata de un artefacto de cuantizacion para un motor concreto, no de un modelo nuevo. Su interes practico reside en que permite ejecutar un modelo de la clase 9B en Macs con 16 GB de memoria o mas, con una calidad medida ligeramente superior a Q4_K_M en divergencia KL, y con un formato que solo carga Espetero 0.2.0 o posterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5; detalles no disponibles) |
| Parametros totales | 2.638.887.648 (segun safetensors); el modelo base se denomina 9B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EQ (LaneQuant) eqd4m: codebook 4 bits, codigos 5/6/8 bits, escala int8 por 16 entradas, escala fp16 por 256; 5,03 bits por peso |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato EQ propietario de Espetero (no cargable por llama.cpp, MLX ni transformers) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-9B, un transformer de la familia Qwen 3.5. La model card de esta cuantizacion no aporta informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco detalla innovaciones de atencion del modelo original.

La innovacion tecnica relevante esta en la cuantizacion. El formato EQ (LaneQuant) se disena especificamente para los kernels matriciales de la GPU de Apple: la escala se asigna a grupos de 16 entradas de modo que cada lane del kernel necesita una sola escala por paso. La asignacion de bits es heterogenea por capa: la atencion lineal del primer cuarto de capas usa qkv/z a 6 bits y out a 8 bits, el resto a codebook de 4 bits; la atencion k/v/o va a 6 bits y q a 4 bits; la capa down del MLP usa 5 bits en el primer y ultimo cuarto; in_proj_a/b van a 8 bits; el embedding usa MLX affine de 5 bits y el LM head EQ de 5 bits. La calibracion se realizo con calibration_v5 de mlx-lm sobre 112K tokens, con 24 Hessians de salida de atencion lineal reordenados al orden de columnas de Hugging Face. El proceso de conversion tardo 34 minutos en un M1 Max con BLAS monohilo y un pico de 11 GB.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Qwen3.5-9B, aunque la model card no las detalla.
- Codigo y matematicas: no se documentan explicitamente en la model card.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Vision: eliminada en esta cuantizacion (no incluye torre de vision).
- Modo thinking: no disponible.
- Servicio compatible con clientes OpenAI, Anthropic y Ollama a traves de `espetero serve`.

## Casos de uso

- Inferencia local en Mac con memoria limitada: el archivo de 5,7 GB permite cargar el modelo en equipos con 16 GB o mas, cubriendo el caso de desarrolladores que quieren probar un modelo de clase 9B sin GPU dedicada.
- Evaluacion de calidad de cuantizacion: util para comparar el formato EQ frente a Q4_K_M en divergencia KL y acuerdo top-1 sobre ventanas de WikiText-2 y codigo.
- Prototipado de asistentes conversacionales en local: el servidor de Espetero expone una API compatible con OpenAI, Anthropic y Ollama, lo que facilita integrar el modelo en aplicaciones existentes sin cambiar el cliente.
- Desarrollo de pipelines de generacion de codigo en Apple Silicon: el modelo base esta orientado a codigo, y el formato EQ mantiene precision superior en capas de atencion y proyecciones clave.
- Investigacion sobre formatos de cuantizacion para Metal: el repositorio documenta el formato EQ y las mediciones, lo que sirve como referencia para quien disene cuantizaciones especificas para GPU de Apple.
- Despliegue de bajo consumo en portatiles Mac: con 47 tok/s de decodificacion en M1 Max y 43 tok/s en Q4_K_M de referencia, es viable para tareas interactivas de un solo usuario.

## Benchmarks y rendimiento

| Metrica | Este archivo (eqd4m) | Q4_K_M (unsloth) |
|---|---|---|
| Bits por peso | 5,03 | 5,07 |
| KLD media | 0,0100 | 0,0141 |
| KLD mediana | 0,00343 | 0,00469 |
| KLD p99 | 0,0766 | 0,1069 |
| Acuerdo top-1 | 96,1 % | 95,6 % |
| Decodificacion M1 Max (tok/s) | 47 | 43 |
| Decodificacion M4 Max (tok/s) | no medido | no medido |

La comparacion pareada sobre las mismas ventanas (62 ventanas de 2048 tokens, 123.008 tokens en total) arroja una reduccion de KLD del 29,1 % (intervalo del 95 %: -32,8 % a -25,4 %), con mejora en el 98 % de las ventanas. La decodificacion se midio con una secuencia, contexto de 128 tokens y `bench_native --quick --batch 1`.

## Requisitos de hardware

- VRAM/memoria unificada: 5,7 GB en disco; se requiere un Mac con 16 GB de memoria o mas.
- GPU recomendadas: Apple Silicon con Metal; medido en M4 Max (Mac Studio, 128 GB) y M1 Max (MacBook Pro, 64 GB).
- Cabe en GPU de consumo: si, en cualquier Mac Apple Silicon con 16 GB o mas; no es compatible con GPU NVIDIA ni AMD.
- Opciones de despliegue: exclusivamente Espetero 0.2.0 o posterior (`brew install JarJarFran/espetero/espetero`, luego `espetero serve --model Franjarjar/Qwen3.5-9B-EQD4M`). No carga en llama.cpp, MLX ni transformers.
- Latencia y throughput: 47 tok/s de decodificacion en M1 Max con contexto de 128 tokens y lote 1; no se publican datos para M4 Max ni para contextos largos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-EQD4M | 2,64 B declarados (base 9B) | no disponible | EQ (Espetero) | Apache 2.0 | Hugging Face |
| Qwen3.5-9B Q4_K_M (unsloth) | clase 9B | no disponible | GGUF | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-9B (BF16) | clase 9B | no disponible | safetensors | Apache 2.0 | Hugging Face |

La comparativa se limita al mismo modelo base en distintas cuantizaciones, ya que la model card no ofrece datos frente a otros modelos de la categoria. Frente a Q4_K_M, EQ eqd4m ocupa ligeramente menos espacio, obtiene mejor KLD y mayor acuerdo top-1, y decodifica a 47 tok/s frente a 43 tok/s en M1 Max. La contrapartida es la dependencia total de Espetero.

## Limitaciones y advertencias

- Formato propietario: los pesos EQ solo los carga Espetero; no son utilizables en llama.cpp, MLX, transformers ni en ninguna otra herramienta estandar.
- Dependencia de plataforma: requiere macOS con Apple Silicon y Metal; no hay soporte para Linux, Windows ni GPU dedicadas.
- Discrepancia de parametros: el safetensors declara 2.638.887.648 parametros frente a la denominacion "9B" del modelo base, lo que sugiere que el recuento corresponde a una parte del modelo o a una convencion distinta; conviene verificar antes de dimensionar despliegues.
- Capacidades no documentadas: la model card no detalla contexto, idiomas, tool calling ni rendimiento en tareas especificas, por lo que no se pueden garantizar esos extremos.
- Sin vision ni MTP: la cuantizacion elimina la torre de vision y la cabeza MTP del modelo original.
- Riesgo de alucinacion y sesgos: no evaluados en la informacion disponible; son los heredados del modelo base.
- Reproducibilidad: la calibracion se capturo con una build de desarrollo que usaba pesos Q8_0 GGUF; una reconversion con Espetero 0.2.0 no sera byte-identica a este archivo.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin senales de uso en produccion.
- Licencia: Apache 2.0 permite uso comercial, pero el motor Espetero es MIT y el formato EQ esta atado a el.

## Enlaces

- Hugging Face: https://huggingface.co/Franjarjar/Qwen3.5-9B-EQD4M
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio de Espetero: https://github.com/JarJarFran/espetero
- Documentacion del formato EQ: https://github.com/JarJarFran/espetero/blob/main/docs/eq.md
