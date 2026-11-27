# Duckets/Inkling-2-Mini-Splash

## Resumen

Inkling-2-Mini-Splash es una build empaquetada para el runtime Splash del modelo multimodal Inkling-2-Mini, desarrollado originalmente por Thinking Machines. El repositorio, publicado por el usuario Duckets, no introduce pesos nuevos: republica la conversion MLX de 4 bits de lmstudio-community (revision del 24 de noviembre de 2026) anadiendo el sidecar `splash-prep.json` que permite a Splash emparejar automaticamente el drafter DFlash2 de Inco AI al cargar el modelo. La arquitectura subyacente es `inkling2_loop`, con 26.388.641.280 parametros totales segun los safetensors del repo, aproximadamente 3.4B activos por token (esquema MoE) y una ventana de contexto de 1.010.000 tokens.

El modelo resuelve el problema de servir un modelo multimodal de contexto ultralargo en hardware Apple Silicon sin necesidad de empaquetados propietarios: Splash moderno (>= 1.3.1) sirve checkpoints MLX directamente, y esta build esta adaptada para LM Studio y la CLI de Splash. Es relevante porque combina vision, contexto de un millon de tokens y decodificacion especulativa (via el drafter DFlash2) en un unico artefacto listo para produccion local.

La licencia es Apache-2.0, heredada del modelo fuente, y el idioma declarado es unicamente ingles. El checkpoint ocupa 17.3 GB en disco en cuantizacion NVFP4 de 4 bits con grupo de 16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `inkling2_loop` (transformer con bucle, MoE; detalles internos no disponibles) |
| Parametros totales | 26.388.641.280 (~26B) |
| Parametros activos | ~3.4B por token (segun model card) |
| Longitud de contexto | 1.010.000 tokens |
| Tipos de cuantizacion | MLX 4-bit NVFP4, group size 16 |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), layout compatible con Splash y LM Studio |
| Tamano del repo | 17.3 GB |
| Pipeline | image-text-to-text |
| Libreria | mlx |

## Arquitectura y entrenamiento

La arquitectura declarada es `inkling2_loop`, un diseno propietario de Thinking Machines del que la informacion disponible solo indica que combina un esquema de mezcla de expertos (26B totales, ~3.4B activos) con un mecanismo de bucle interno y capacidad de vision (procesa entradas image-text-to-text). No se dispone de detalles sobre el numero de capas, dimension del hidden state, numero de expertos, mecanismo de atencion ni estrategia de contexto largo mas alla de la ventana de 1.010.000 tokens.

Tampoco hay informacion publica en los datos proporcionados sobre el corpus de entrenamiento (numero de tokens, composicion, proporciones de codigo, matematicas o multimodalidad) ni sobre si se aplicaron fases de RLHF, DPO o similar. La innovacion tecnica documentada en este repositorio no esta en los pesos sino en el empaquetado: el sidecar `splash-prep.json` registra el emparejamiento de familia para que Splash cargue automaticamente el drafter `incoai/Inkling-2-Mini-DFlash2`, habilitando decodificacion especulativa. En la verificacion del autor en un M5 Max con 128 GB, Splash 1.7.3 alcanza ~97 tok/s de decodificacion con el contexto completo de 1.010.000 tokens.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento aritmetico basico: verificado por el autor con 17 x 23 = 391 y raiz cuadrada de 169 = 13.
- Vision: identificacion correcta de una imagen de color solido en la prueba del autor; pipeline image-text-to-text.
- Contexto ultralargo de hasta 1.010.000 tokens, adecuado para documentos extensos o sesiones prolongadas.
- Decodificacion especulativa via drafter DFlash2 emparejado automaticamente por Splash.
- Compatibilidad con LM Studio (runtime Splash o motor MLX) y con la CLI `splash serve`.
- Soporte de tool calling, function calling, agentes multi-paso o modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de repositorios completos: con 1.010.000 tokens de contexto, el modelo puede ingerir un arbol de codigo extenso y responder preguntas transversales sobre arquitectura, dependencias o deuda tecnica sin trocear el contenido.
- Revision de documentacion corporativa: procesar manuales, contratos o normativas de cientos de miles de tokens en una sola pasada para extraer clausulas, resumir secciones o responder consultas con referencias cruzadas.
- Asistentes conversacionales locales en Apple Silicon: servir el modelo con Splash o LM Studio en un Mac equipado (verificado en M5 Max de 128 GB) para conversaciones multi-turno que retienen historial muy largo.
- Descripcion y clasificacion de imagenes: usar el pipeline image-text-to-text para etiquetar capturas, describir diagramas o extraer informacion de imagenes dentro de un flujo documental.
- Prototipado de agentes con decodificacion especulativa: el emparejamiento automatico con DFlash2 reduce la latencia de decodificacion (~97 tok/s en la prueba del autor), lo que resulta util en bucles de agente donde se generan muchas respuestas cortas.
- Evaluacion comparativa de arquitecturas MoE con bucle: investigadores pueden cargar el checkpoint en MLX para estudiar el comportamiento de `inkling2_loop` frente a transformers convencionales con presupuesto de computo similar.
- Despliegue offline en estaciones de trabajo: al ser un artefacto local de 17.3 GB con licencia Apache-2.0, encaja en entornos sin conectividad o con requisitos de soberania de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El unico dato de rendimiento documentado es la velocidad de decodificacion medida por el autor: aproximadamente 97 tok/s con Splash 1.7.3 en un M5 Max de 128 GB, con el contexto completo de 1.010.000 tokens.

## Requisitos de hardware

- VRAM/unified memory estimada: el repo pesa 17.3 GB en 4-bit, por lo que se necesita al menos ~20 GB de memoria unificada para cargar los pesos, mas overhead de KV cache y del drafter DFlash2.
- Con contexto completo de 1.010.000 tokens, el consumo de KV cache crece de forma significativa; la configuracion verificada es de 128 GB de memoria unificada.
- GPU recomendadas: Apple Silicon de gama alta (M5 Max verificado por el autor); no hay datos de despliegue en A100, H100 o RTX 4090, ya que el formato es MLX y esta orientado a macOS.
- Cabe en GPU consumer Apple Silicon con memoria suficiente; no aplica a GPU NVIDIA consumer en este formato.
- Opciones de despliegue: Splash (>= 1.3.1) via `splash serve --model Duckets/Inkling-2-Mini-Splash`, LM Studio (runtime Splash o motor MLX). vLLM, llama.cpp, Ollama y TGI no estan soportados por este artefacto segun la informacion disponible.
- Latencia y throughput: ~97 tok/s de decodificacion en M5 Max de 128 GB con Splash 1.7.3 y contexto completo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-Splash (esta ficha) | ~26B totales / ~3.4B activos | 1.010.000 | MLX 4-bit NVFP4 | Apache-2.0 | Build para Splash con drafter DFlash2 |
| thinkingmachines/Inkling-2-Mini | ~26B totales / ~3.4B activos | 1.010.000 | no disponible | no disponible | Modelo base original |
| lmstudio-community/Inkling-2-Mini-MLX-4bit | ~26B totales / ~3.4B activos | 1.010.000 | MLX 4-bit | no disponible | Conversion base republicada aqui |
| Duckets/Inkling-2-Mini-MLX-4bit | ~26B totales / ~3.4B activos | 1.010.000 | MLX 4-bit | Apache-2.0 | Variante MLX sin sidecar de Splash |

No se dispone de datos de benchmarks que permitan comparar rendimiento cualitativo con alternativas de la misma categoria.

## Limitaciones y advertencias

- Solo soporta ingles de forma declarada; el rendimiento en castellano u otros idiomas no esta verificado.
- Riesgo de alucinacion inherente a los modelos generativos; no hay evaluaciones publicadas de fidelidad factual.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- El modelo esta empaquetado exclusivamente para MLX y Splash/LM Studio en Apple Silicon; no es portable a stacks CUDA sin reconversion.
- El rendimiento de ~97 tok/s y las pruebas de razonamiento y vision son verificaciones del autor en un unico equipo (M5 Max, 128 GB) y no constituyen una evaluacion independiente.
- El uso del contexto completo de 1M tokens exige memoria unificada muy alta; en configuraciones menores habra que truncar contexto.
- Aunque la licencia es Apache-2.0, conviene verificar los terminos del modelo base original y de la conversion de lmstudio-community antes de un uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion de la comunidad sobre esta build concreta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Duckets/Inkling-2-Mini-Splash
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Conversion MLX de lmstudio-community: https://huggingface.co/lmstudio-community/Inkling-2-Mini-MLX-4bit
- Variante MLX del mismo autor: https://huggingface.co/Duckets/Inkling-2-Mini-MLX-4bit
- Drafter DFlash2: https://huggingface.co/incoai/Inkling-2-Mini-DFlash2
