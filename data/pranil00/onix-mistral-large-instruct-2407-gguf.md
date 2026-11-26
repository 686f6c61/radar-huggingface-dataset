# pranil00/ONIX-Mistral-Large-Instruct-2407-GGUF

## Resumen

ONIX-Mistral-Large-Instruct-2407-GGUF es una cuantización en formato GGUF (esquema Q5_K_M) publicada por el usuario pranil00 bajo la etiqueta "ONIX Community", que declara como modelo base mistralai/Mistral-Large-Instruct-2407. El artefacto se distribuye como un único fichero de pesos de aproximadamente 1,01 GB y esta pensado para ejecución local en hardware de consumo mediante llama.cpp, Ollama, LM Studio, Jan o la herramienta propia del autor, run-any-model.

La ficha del autor presenta el modelo como una familia arquitectonica LLaMA de 1.500 millones de parametros (1.498.480.640), lo que entra en contradiccion directa con el modelo base declarado: Mistral-Large-Instruct-2407 es un modelo denso de 123.000 millones de parametros. Esta discrepancia es la advertencia principal de la ficha: el artefacto no puede ser una cuantización fiel del modelo base que afirma, y debe tratarse con cautela antes de cualquier uso en produccion.

El interes practico del repositorio es limitado pero informativo: documenta un flujo de cuantizacion automatica con telemetria de memoria (DeviceQuant), ofrece comandos de ejecucion para multiples runtimes y muestra como se publican artefactos derivados en el ecosistema GGUF. No hay descargas ni likes en el momento de la consulta, y no se han publicado benchmarks de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo LLaMA (segun la model card del autor); el modelo base declarado es un transformer denso de Mistral AI |
| Parametros totales | 1.498.480.640 (1,50 B) segun la model card; el modelo base declarado (Mistral-Large-Instruct-2407) tiene 123 B, discrepancia no resuelta |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | 8.192 tokens en Apple Silicon y GPU NVIDIA; 4.096 tokens en CPU (segun la model card) |
| Tipos de cuantizacion | Q5_K_M (5,5 bits por peso); no se listan otros esquemas en el repositorio |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (declarada en el repositorio); la licencia del modelo base Mistral-Large-Instruct-2407 es Mistral Research License, no Apache 2.0 |
| Formato de pesos | GGUF (fichero unico `mistralai--Mistral-Large-Instruct-2407-Q5_K_M.gguf`) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del artefacto mas alla de la etiqueta "Architecture Family: LLaMA" y del pipeline `text-generation`. No se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones en esta publicacion concreta; en el mejor de los casos, esas caracteristicas heredarian del modelo base declarado, pero no se aporta evidencia de que el artefacto contenga realmente esos pesos.

La innovacion tecnica que si se documenta es el proceso de cuantizacion: el motor run-any-model (DeviceQuant) aplica cuantizacion adaptativa al dispositivo, con telemetria de bits por parametro, tamano de pesos, buffer de KV cache y capas aceleradas. El informe incluido en la model card indica 16 de 16 capas aceleradas en Metal, una reduccion del 65,6 % en el tamano de pesos (de 2,93 GB en FP16 a 1,01 GB en Q5_K_M) y una retencion de calidad estimada del 97,5 %. No se aporta ninguna validacion empirica de esa retencion de calidad (perplejidad, evaluaciones downstream ni comparaciones con el modelo sin cuantizar).

## Capacidades

- Generacion de texto autoregresiva en formato chat, con plantilla basada en los tokens especiales `<|im_end|>` y `<|endoftext|>`.
- Ejecucion local en CPU (AVX2/AVX-512), GPU NVIDIA (CUDA) y Apple Silicon (Metal), segun la model card.
- Conversacion multi-turno mediante los modos `-cnv` de llama.cpp, Ollama o run-any-model.
- Capacidades heredadas del modelo base declarado (razonamiento, codigo, matematicas, multilingue, tool calling) no verificadas en este artefacto; no disponible como dato fiable.
- No se documenta soporte de vision, audio, modo thinking explicito ni function calling nativo en esta publicacion.

## Casos de uso

- Pruebas de humo de pipelines GGUF: validar que un flujo de carga, tokenizacion y generacion funciona en llama.cpp, Ollama o LM Studio antes de desplegar modelos de mayor tamano en produccion.
- Desarrollo en portatiles sin GPU dedicada: con 1,01 GB de pesos y unos 3,17 GB de RAM libre en CPU, permite iterar en local sobre prompts y plantillas de chat sin depender de servicios en la nube.
- Docencia y demostraciones de cuantizacion: ilustra el efecto de Q5_K_M sobre el tamano de pesos y el uso de memoria, util para explicar compromisos entre precision y huella de recursos.
- Evaluacion de herramientas de inferencia: comparar latencia y consumo entre run-any-model, llama.cpp, Ollama y LM Studio sobre el mismo fichero GGUF.
- Prototipado de interfaces conversacionales offline: aplicaciones de escritorio o CLI que necesiten un generador de texto ligero sin conexion, aceptando la calidad reducida de un modelo de 1,5 B.
- Integracion en CI para pruebas de regresion de formato: comprobar que los wrappers de chat, los tokens de parada y el parseo de respuestas funcionan de extremo a extremo con un artefacto pequeno y rapido de cargar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La unica tabla numerica del repositorio es la telemetria de memoria y compresion del motor DeviceQuant:

| Metrica | FP16 (referencia) | Q5_K_M (artefacto) | Cambio |
|---|---|---|---|
| Precision | 16,0 bits/parametro | 5,5 bits/parametro | -65,6 % |
| Tamano de pesos | 2,93 GB | 1,01 GB | -65,6 % |
| KV cache | 128,0 MB | 128,0 MB | Sin cambio |
| RAM residente total | 3,09 GB | 1,17 GB | -62,2 % |
| Calidad estimada | 100,0 % | 97,5 % | -2,5 % (estimacion del autor, sin validacion) |
| Capas aceleradas | 0 % | 16/16 | - |

## Requisitos de hardware

- VRAM/RAM segun la model card: 1,17 GB de memoria unificada en Apple Silicon (M1 a M5), 2,51 GB de VRAM dedicada en GPU NVIDIA RTX serie 30/40/50 y 3,17 GB de RAM libre en CPU x86 con AVX2/AVX-512.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090 24 GB, asi como en iGPU y en Apple Silicon de gama base.
- Contexto recomendado: 8.192 tokens en Metal y CUDA; 4.096 tokens en CPU.
- Opciones de despliegue documentadas: run-any-model (CLI), Ollama (via Modelfile), llama.cpp (`llama-cli -m ... -c 4096 -ngl 99 -cnv`), LM Studio, Jan y Text-Generation-WebUI. No se mencionan vLLM ni TGI, que no soportan GGUF de forma nativa.
- Latencia y throughput: no disponibles. No se publican tokens por segundo ni tiempos de primera respuesta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ONIX-Mistral-Large-Instruct-2407-GGUF (Q5_K_M) | 1,50 B segun la card (base declarada: 123 B) | 8.192 / 4.096 tokens | GGUF | Apache 2.0 declarada | Hugging Face, 0 descargas |
| mistralai/Mistral-Large-Instruct-2407 (modelo base declarado) | 123 B | 128.000 tokens | safetensors | Mistral Research License | Hugging Face oficial |
| Mistral 7B Instruct (v0.3) en GGUF | 7,2 B | 32.000 tokens | GGUF | Apache 2.0 | Amplia disponibilidad |
| Llama 3.2 1B Instruct en GGUF | 1,2 B | 128.000 tokens | GGUF | Llama 3.2 Community License | Amplia disponibilidad |

La comparativa es orientativa: no hay datos de rendimiento de este artefacto que permitan situarlo frente a alternativas de su mismo tamano.

## Limitaciones y advertencias

- Discrepancia critica de identidad: la model card declara 1,50 B de parametros para un artefacto que dice derivar de Mistral-Large-Instruct-2407 (123 B). Es altamente probable que el fichero no contenga los pesos del modelo base indicado, por lo que no debe asumirse ningun comportamiento propio de Mistral Large.
- Licencia incoherente: el repositorio declara Apache 2.0, pero el modelo base Mistral-Large-Instruct-2407 se distribuye bajo Mistral Research License, que restringe el uso comercial. La declaracion Apache 2.0 no es verificable ni oponible al titular original.
- Sin validacion de calidad: la retencion del 97,5 % es una estimacion del motor de cuantizacion, no una medicion con benchmarks; no hay datos de perplejidad ni evaluaciones downstream.
- Riesgo de alucinacion: con 1,5 B de parametros (si el dato es correcto), la tasa de alucinacion en tareas de conocimiento factual y razonamiento multi-paso sera elevada; no apto para uso sin supervision en dominios sensibles.
- Idiomas no documentados: no se especifica cobertura multilingue; el rendimiento fuera del ingles es impredecible.
- Contexto limitado a 8.192 tokens en el mejor caso, muy por debajo de los 128.000 tokens del modelo base declarado.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin historial de uso ni issues que permitan validar su comportamiento.
- Ausencia de garantias: la model card incluye un descargo de responsabilidad absoluto que traslada al usuario toda la responsabilidad sobre la validacion de las salidas.
- No apto para produccion sin auditoria previa: antes de integrarlo, conviene verificar el hash del fichero, inspeccionar los metadatos GGUF y comparar la salida con el modelo base declarado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-Mistral-Large-Instruct-2407-GGUF
- Modelo base declarado: https://huggingface.co/mistralai/Mistral-Large-Instruct-2407
- Organizacion ONIX en Hugging Face: https://huggingface.co/ONIX
- Repositorio run-any-model: https://github.com/PranilShah-08/run-any-model
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
