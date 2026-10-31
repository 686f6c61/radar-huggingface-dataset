# pratikgx/Mage-VL-Cowork-MLX-4bit

## Resumen

Mage-VL-Cowork MLX 4-bit es una conversión comunitaria, creada por el usuario pratikgx, del modelo de uso de ordenador (computer-use) Mage-VL-Cowork de Microsoft, adaptada al framework MLX para ejecutarse de forma nativa en Macs con Apple Silicon. El modelo base combina el encoder de visión Mage-ViT con el modelo de lenguaje Qwen3-4B, con un total de unos 4.740 millones de parámetros, y está diseñado para interpretar capturas de pantalla y generar acciones sobre una interfaz gráfica.

El problema que resuelve esta conversión es la compatibilidad: el checkpoint original de Microsoft usa un layout de claves de pesos distinto al que espera mlx-vlm, por lo que el autor remapeó las claves al formato `mage_vl` y cuantizó el modelo de lenguaje a 4 bits (grupo de 64), manteniendo la torre de visión en BF16. El resultado ocupa unos 3,2 GB en disco y puede cargarse sin código personalizado ni `trust_remote_code` con mlx-vlm 0.7.11 o superior.

Es relevante porque permite ejecutar un modelo agéntico de computer-use de tamaño contenido (4B) íntegramente en un Mac de consumo, con una latencia de turno agéntico completo (captura de pantalla de entrada, tool call de salida) de entre 2,36 y 3,10 segundos según la resolución, lo que lo hace viable para agentes de automatización de escritorio en local. No se trata de una publicación oficial de Microsoft, sino de un port de la comunidad bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo vision-language (Mage-ViT como encoder de vision + Qwen3-4B como modelo de lenguaje), tipo `mage_vl` |
| Parametros totales | 4.741.793.792 (dato real de safetensors) |
| Parametros activos | no disponible (no consta arquitectura MoE) |
| Longitud de contexto | no disponible (se han medido benchmarks hasta 32K de contexto) |
| Tipos de cuantizacion | 4-bit affine (modelo de lenguaje, group size 64); torre de vision en BF16; media de 5,30 bits por peso |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo base, microsoft/Mage-VL-Cowork, es un modelo vision-language de 4B orientado a computer-use, compuesto por el encoder de vision Mage-ViT y el modelo de lenguaje Qwen3-4B. Sobre el entrenamiento del modelo original (numero de tokens, composicion del dataset, uso de RLHF/DPO) no hay datos en la informacion disponible. Esta ficha se centra en la conversion MLX, no en el modelo base.

La conversion realizada por pratikgx consistio en dos pasos. Primero, se remapearon las claves de pesos del checkpoint original de Microsoft al layout `mage_vl` que espera mlx-vlm, copiando los tensores sin modificar (solo cambiaron nombres de claves y algunos campos de configuracion; el script de remapeo esta publicado en el dataset de benchmarks, en `raw/scripts/remap.py`). Segundo, se convirtio con `mlx_vlm.convert` (mlx 0.32.4, mlx-vlm 0.7.11): el modelo de lenguaje se cuantizo a 4 bits con cuantizacion affine y group size 64, mientras que la torre de vision se mantuvo en BF16 para preservar la fidelidad visual. El resultado ocupa unos 3,14 GB en disco, con una media de 5,30 bits por peso. El `config.json` declara `model_type: mage_vl`, integrado de serie en mlx-vlm 0.7.11, por lo que no se necesita codigo de modelado personalizado.

## Capacidades

- Comprension de imagenes y generacion de texto condicionada por imagen (pipeline image-text-to-text), orientado a capturas de pantalla de interfaz grafica.
- Uso de ordenador (computer-use): interpreta capturas de pantalla y emite acciones concretas sobre la interfaz, como clics en elementos concretos (por ejemplo, activar el modo oscuro del sistema).
- Generacion de tool calls: en modo agente, un turno completo consiste en recibir una captura de pantalla y producir una llamada a herramienta, siguiendo el system prompt y el formato de mensaje oficial del modelo original de Microsoft.
- Ejecucion local en Apple Silicon mediante MLX, sin necesidad de GPU de servidor ni de `trust_remote_code`.
- Soporte de contextos largos medidos en benchmarks hasta 32K tokens, con memoria pico de 8,80 GB en ese punto.
- No hay informacion disponible sobre capacidades multilingues, soporte de audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Automatizacion de escritorio en Mac: el modelo puede recibir capturas de pantalla del escritorio y generar las acciones necesarias para realizar tareas (por ejemplo, cambiar ajustes del sistema), ejecutandose todo en local sobre Apple Silicon.
- Agentes de computer-use con bucle de accion: con el system prompt oficial de Mage y el formato de mensajes del modelo original, puede integrarse en un bucle agéntico de multiples pasos donde cada turno (captura -> tool call) tarda entre 2,36 y 3,10 segundos a resoluciones 1280x800 y 1920x1080.
- Testing automatizado de interfaces graficas: puede usarse para verificar visualmente que un elemento de la interfaz esta en el estado esperado (un toggle activado, un dialogo abierto) a partir de capturas de pantalla.
- RPA ligero en local para empresas con requisitos de privacidad: al ejecutarse integramente en un Mac mini, los datos de pantalla no salen del equipo, lo que es adecuado para flujos con informacion sensible.
- Prototipado rapido de agentes visuales en portatiles y mini Macs: con 3,2 GB en disco y menos de 4 GB de memoria pico en contextos cortos, es viable en maquinas de consumo para experimentacion.
- Asistente conversacional con entrada de imagen: dado su pipeline image-text-to-text y etiqueta conversational, puede responder preguntas sobre imagenes o capturas de pantalla mas alla del uso agéntico puro.

## Benchmarks y rendimiento

El autor publico mediciones de velocidad (no de calidad) en un Mac mini M5 Pro de 64 GB, con mlx-vlm 0.7.11, decodificacion greedy, 256 tokens generados, mediana de 3 ejecuciones tras 1 de calentamiento. Durante las pruebas habia una aplicacion de inferencia en segundo plano, por lo que una maquina inactiva podria ser algo mas rapida.

| Contexto | Prefill (tok/s) | Decode (tok/s) | Time to first token | Memoria pico |
|---|---|---|---|---|
| 512 | 2.709 | 95,6 | 0,19 s | 3,87 GB |
| 4K | 2.341 | 79,5 | 1,76 s | 4,57 GB |
| 16K | 1.728 | 50,2 | 9,50 s | 6,27 GB |
| 32K | 1.237 | 34,5 | 26,5 s | 8,80 GB |

Un turno agéntico completo (captura de pantalla de entrada, tool call de salida) tardo 2,36 s a 1280x800 y 3,10 s a 1920x1080.

No se han publicado resultados de benchmarks de calidad (MMLU, OSWorld, etc.) para esta conversion: el autor indica expresamente que no se ejecuto ninguna suite de calidad ni evaluacion en OSWorld. En una demo diminuta de 3 tareas, esta version en 4 bits fallo un clic sobre el toggle de modo oscuro por 42 px, mientras que la version MLX en BF16 lo acerto; el autor advierte de que la muestra es demasiado pequena para extraer conclusiones.

## Requisitos de hardware

- Memoria unificada estimada: 3,87 GB de pico con contexto de 512 tokens, 4,57 GB con 4K, 6,27 GB con 16K y 8,80 GB con 32K (medidos en Mac mini M5 Pro de 64 GB). Un Mac con 16 GB de memoria unificada deberia cubrir los contextos cortos y medios.
- GPU recomendada: no requiere GPU dedicada; el objetivo son chips Apple Silicon (M1 o posteriores con soporte MLX). Probado especificamente en un Mac mini M5 Pro de 64 GB.
- Consumer hardware: si cabe en equipos de consumo; al ser MLX, esta pensado para Macs, no para GPUs NVIDIA. El repo ocupa 3,2 GB en disco.
- Despliegue: mediante mlx-vlm 0.7.11 o superior (versiones anteriores sin soporte `mage_vl` no cargan el modelo). Comando de ejemplo: `python -m mlx_vlm.generate --model pratikgx/Mage-VL-Cowork-MLX-4bit --image screenshot.png --prompt "..." --max-tokens 512`. No hay informacion sobre compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Rendimiento medido: hasta 95,6 tok/s de decodificacion y 2.709 tok/s de prefill en contexto corto; 34,5 tok/s de decodificacion en contexto de 32K; turno agéntico completo en 2,36-3,10 s segun resolucion de pantalla.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|
| pratikgx/Mage-VL-Cowork-MLX-4bit | 4,74B | MLX safetensors, 4-bit (LM) + BF16 (vision) | Apache-2.0 | Port comunitario para Apple Silicon, sin codigo personalizado |
| microsoft/Mage-VL-Cowork (modelo base) | 4,74B | Checkpoint PyTorch original de Microsoft | Apache-2.0 | Version oficial, layout de pesos distinto al de mlx-vlm |
| Version MLX BF16 del mismo modelo | 4,74B | MLX sin cuantizar | Apache-2.0 | Mayor precision (acerto un clic que la version 4-bit fallo por 42 px en una demo de 3 tareas), mayor consumo de memoria |

No hay informacion disponible sobre otros modelos computer-use comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- Es un port comunitario, no una publicacion oficial de Microsoft: si algo difiere del comportamiento del codigo PyTorch original, lo mas probable es que sea un artefacto de la conversion.
- La cuantizacion a 4 bits puede degradar la precision espacial: en una demo de 3 tareas, fallo un clic por 42 px que la version BF16 acerto. Para tareas de computer-use donde la precision del clic es critica, puede preferirse la version sin cuantizar si la memoria lo permite.
- No se ha evaluado la calidad del modelo: no hay suite de benchmarks ni puntuacion OSWorld para esta conversion.
- Requiere mlx-vlm 0.7.11 o superior; versiones anteriores no cargan el modelo.
- Para uso agéntico hay que emplear el system prompt y el formato de mensajes oficiales del modelo original de Microsoft; usar otros prompts puede degradar el comportamiento.
- No hay informacion disponible sobre idiomas soportados, sesgos conocidos, tasa de alucinacion ni restricciones de uso comercial adicionales a la licencia Apache-2.0.
- Como todo modelo de computer-use, ejecutar acciones automaticas sobre un sistema operativo conlleva riesgos; conviene supervisar las acciones generadas antes de ejecutarlas en produccion.

## Enlaces

- Modelo: https://huggingface.co/pratikgx/Mage-VL-Cowork-MLX-4bit
- Modelo base oficial de Microsoft: https://huggingface.co/microsoft/Mage-VL-Cowork
- Dataset con benchmarks, logs, scripts y trazas de demo: https://huggingface.co/datasets/pratikgx/mage-vl-cowork-m5-pro-mac-mini-bench
- Script de remapeo de pesos: incluido en el dataset anterior, en `raw/scripts/remap.py`
- System prompt oficial usado en los benchmarks: incluido en el dataset anterior, en `raw/scripts/system_prompt.txt`
