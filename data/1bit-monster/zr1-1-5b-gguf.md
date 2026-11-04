# 1bit-MONSTER/ZR1-1.5B-GGUF

## Resumen

ZR1-1.5B-GGUF es la distribucion cuantizada del modelo Zyphra/ZR1-1.5B, un modelo de razonamiento de 1.500 millones de parametros desarrollado por Zyphra y entrenado con aprendizaje por refuerzo sobre problemas verificados de codigo y matematicas. Este repositorio, mantenido por 1bit-MONSTER, no contiene pesos nuevos: ofrece conversiones GGUF (`Q8_0` y `Q4_K_M`) y un contenedor para NPU en formato Q4NX, generados directamente desde la revision fijada del modelo original.

La arquitectura subyacente es un transformer `Qwen2ForCausalLM` con 1.777.088.000 parametros totales, derivado a su vez de `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`. El tokenizador emplea tokens especiales de estilo DeepSeek (`<｜begin▁of▁sentence｜>`) en lugar de ChatML, un detalle critico para integrarlo correctamente en pipelines de inferencia.

Su relevancia practica esta en el empaquetado: permite ejecutar un modelo de razonamiento pequeno en CPU, Vulkan o ROCm mediante llama.cpp, y ofrece una ruta experimental hacia aceleradores NPU (XDNA) a traves del motor de 1bit-MONSTER. La licencia MIT del modelo original se mantiene en estas conversiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`Qwen2ForCausalLM`) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (el ejemplo de ejecucion usa `-c 4096`) |
| Tipos de cuantizacion | `Q8_0`, `Q4_K_M` (GGUF); Q4NX con tiles `Q4_K` y tensores a 8 bits (NPU) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF, Q4NX (contenedor NPU), safetensors (upstream) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de tipo decoder-only con la implementacion `Qwen2ForCausalLM`, con 1.777 millones de parametros. Segun la model card del repositorio, el entrenamiento de ZR1-1.5B se basa en aprendizaje por refuerzo sobre problemas de codigo y matematicas con verificacion, lo que orienta el modelo hacia tareas de razonamiento paso a paso. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases adicionales de RLHF o DPO.

El modelo base declarado por el autor original es `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`, lo que sugiere una destilacion previa sobre Qwen2-1.5B y un post-entrenamiento posterior con RL. La innovacion tecnica de este repositorio no esta en los pesos sino en el empaquetado: conversion con `convert_hf_to_gguf.py` en `bf16` y cuantizacion con `llama-quantize`, mas un empaquetador propio (`gguf_to_q4nx.py --dtype8`) que genera un plan de streaming (`plan.json`) para el motor de inferencia de 1bit-MONSTER. El contenedor NPU se construye desde el brazo `Q4_K_M` para preservar los codigos `Q4_K` sin recuantizar.

## Capacidades

- Generacion de texto conversacional y de proposito general.
- Razonamiento multi-paso orientado a problemas de matematicas.
- Generacion y razonamiento sobre codigo, segun los tags del modelo (`code`, `math`, `reasoning`).
- Ejecucion en CPU, Vulkan y ROCm mediante llama.cpp o servidores compatibles.
- Ruta experimental de inferencia en NPU mediante el contenedor Q4NX y el motor de 1bit-MONSTER (requiere kernels ELF especificos no publicados).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision, audio o modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Razonamiento matematico asistido en local: el modelo puede resolver problemas aritmeticos y algebraicos paso a paso en equipos sin GPU dedicada, usando el GGUF `Q4_K_M` con llama.cpp en CPU.
- Generacion de codigo en entornos con recursos limitados: al ser un modelo de 1.5B cuantizado a 4 bits, cabe en portatiles y estaciones de trabajo modestas para autocompletado y explicacion de fragmentos de codigo.
- Prototipado de pipelines de razonamiento: util para validar cadenas de prompting y evaluaciones de razonamiento antes de escalar a modelos mayores, gracias a su bajo coste de inferencia.
- Despliegue en servidores llama.cpp compatibles: `llama-server -m ZR1-1.5B-Q4_K_M.gguf -c 4096` permite exponer una API local para pruebas de integracion.
- Investigacion en aceleracion NPU: el contenedor `npu-container-q8/` sirve como material de partida para experimentar con el motor de 1bit-MONSTER y la ruta host-GEMM, aunque la ejecucion real en XDNA requiere kernels no publicados.
- Educacion y demos offline: al no requerir conectividad ni GPU, es adecuado para talleres y demostraciones de modelos de razonamiento en entornos aislados.
- Evaluacion comparativa de cuantizaciones: la presencia de brazos `Q8_0` y `Q4_K_M` del mismo modelo permite medir la perdida de calidad por cuantizacion en tareas de matematicas y codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,9 GB para `Q8_0` y 1,1 GB para `Q4_K_M`, calculados a partir del numero de parametros y los bits por peso; no confirmado por el autor.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM para el brazo `Q4_K_M`; RTX 3060, RTX 4060 o superiores permiten holgura con contexto amplio.
- Cabe en GPU consumer: si, en la mayoria de tarjetas graficas modernas, e incluso en CPU pura.
- Opciones de despliegue: llama.cpp (`llama-server`), servidores basados en llama.cpp como Lemonade, y el motor propio de 1bit-MONSTER (`1bit serve` para GGUF, `1bit forward-serve` para el contenedor Q4NX).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.
- Nota sobre NPU: la ejecucion en XDNA requiere kernels ELF compilados para la geometria matricial del modelo, que no se publican en este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ZR1-1.5B-GGUF (este) | 1,777 M | no disponible | MIT | GGUF, Q4NX | Conversion cuantizada con ruta NPU experimental |
| Zyphra/ZR1-1.5B | 1,777 M | no disponible | MIT | safetensors | Modelo original upstream |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | 1.500 M aprox. | no disponible | MIT | safetensors | Base declarada del modelo original |
| Qwen2-1.5B | 1.500 M aprox. | no disponible | no disponible | safetensors | Arquitectura base de la familia Qwen2 |

Los datos de rendimiento comparado no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Tokenizador no estandar: usa tokens especiales de estilo DeepSeek en lugar de ChatML; enviar plantillas ChatML puede degradar la calidad de las respuestas.
- Modelo de 1.5B: capacidad de razonamiento y conocimiento factual limitados en comparacion con modelos de mayor tamano; riesgo elevado de alucinacion en dominios especializados.
- Sesgos: no se documentan sesgos especificos en la informacion disponible; al derivar de Qwen2 y DeepSeek, hereda los sesgos de sus datos de entrenamiento.
- Idiomas: no se declaran idiomas soportados; el rendimiento fuera del ingles no esta garantizado.
- Contexto: no se especifica la longitud de contexto nativa; el ejemplo de ejecucion fija 4096 tokens, que no debe interpretarse como el maximo del modelo.
- Ruta NPU incompleta: el contenedor Q4NX no incluye los kernels ELF necesarios para ejecutarse en XDNA; solo funciona hoy en la ruta host-GEMM del motor.
- Licencia: MIT permite uso comercial, pero debe conservarse la cadena de atribucion (`LICENSE-MIT`, `ATTRIBUTION.md`) al redistribuir.
- Repositorio con cero descargas y cero likes en el momento de la consulta: sin validacion comunitaria de las conversiones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/1bit-MONSTER/ZR1-1.5B-GGUF
- Modelo base upstream: https://huggingface.co/Zyphra/ZR1-1.5B
- Modelo base declarado por el autor original: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Perfil del empaquetador: https://github.com/1bit-MONSTER
