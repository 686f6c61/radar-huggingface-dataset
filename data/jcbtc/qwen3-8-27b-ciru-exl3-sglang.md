# jcbtc/Qwen3.8-27b-CIRU-EXL3-SGLANG

## Resumen

Qwen3.8-27b-CIRU-EXL3-SGLANG es un paquete de inferencia publicado por el usuario jcbtc (proyecto CIRU) sobre el modelo Qwen3.8-27B de Qwen. No se trata de un modelo nuevo entrenado desde cero: el autor empaqueta los pesos EXL3 ya existentes de r0b0tlab (target de 4,00 bpw y draft DFlash2) y los sirve directamente dentro de SGLang sin exportar una copia densa ni NVFP4 de los pesos, ni realizar reentrenamiento o recuantizacion adicional.

El objetivo declarado es ejecutar un modelo multimodal de 27B con una ventana de contexto configurada de 262.144 tokens en una unica GPU de consumo, la RTX 5090 de 32 GB, mediante decodificacion especulativa DFlash2 que verifica bloques de borrador de ocho tokens. Para ello el perfil de servicio combina KV de target en NVFP4, KV de draft en FP8 y estado recurrente en FP32, con un pool compartido de 270.336 tokens. El pico de uso de GPU medido en contexto completo fue de 28,88 GiB.

Su relevancia actual es fundamentalmente de despliegue: demuestra que una integracion cuidadosa de cuantizacion EXL3, atencion fusionada, componentes Gated DeltaNet y planificacion de SGLang puede multiplicar el rendimiento frente a servidores EXL3 convencionales y frente a builds NVFP4, manteniendo ademas modo vision con el codificador de imagen del checkpoint (83 proyecciones EXL3 empaquetadas). El repositorio de HuggingFace no duplica los pesos (0,0 GB); solo contiene la integracion y las recetas de ejecucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion fusionada y componentes Gated DeltaNet (segun la model card); detalles completos de la arquitectura base no disponibles |
| Parametros totales | 27B aproximados por denominacion del modelo (Qwen3.8-27B); cifra exacta no disponible en la informacion proporcionada |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens configurados para peticion, sobre un pool compartido de 270.336 tokens |
| Tipos de cuantizacion | EXL3 a 4,00 bpw (target y draft), cabeza de salida en 6 bits; KV de target en NVFP4, KV de draft en FP8, estado recurrente en FP32 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | EXL3 empaquetado (pesos alojados en los repositorios upstream; este repo no contiene los ficheros) |

## Arquitectura y entrenamiento

Este release no implica entrenamiento ni ajuste: el autor indica explicitamente que los pesos de target y draft son los de r0b0tlab sin cambios y que la aportacion es una integracion de servicio. El loader de CIRU ejecuta las proyecciones EXL3 empaquetadas directamente dentro de SGLang, incluida la cabeza de salida de 6 bits, y mapea los componentes de atencion fusionada y Gated DeltaNet sin necesidad de materializar una copia densa ni NVFP4. Sobre esa base, SGLang aporta la planificacion de peticiones, la atencion, la decodificacion con CUDA graphs y la gestion compartida de KV y estado recurrente.

La innovacion tecnica destacable es la combinacion de decodificacion especulativa DFlash2 (verificacion de bloques de ocho tokens) con una gestion de memoria muy agresiva: KV de target en NVFP4, KV de draft en FP8, estado recurrente en FP32 y un pool compartido de 270.336 tokens, todo ello en 32 GB de VRAM. El contenedor incluye un parche verificado por hash sobre SGLang 0.5.20, un parche menor de interoperabilidad de CUDA graphs con ExLlamaV3 y los puentes EXL3 de target, draft y vision, de modo que el usuario no tiene que ensamblar varios forks. El modo vision carga el codificador de imagen del checkpoint (83 proyecciones EXL3 empaquetadas); el modo texto es el配置 por defecto y el usado en las mediciones de velocidad publicadas.

## Capacidades

- Generacion de texto en modo texto, que es la configuracion por defecto y la empleada en las metricas de rendimiento.
- Entrada de imagen (pipeline image-text-to-text): el modo vision procesa PNG y JPEG y responde a preguntas sobre el contenido.
- Descripcion e identificacion de sujetos visibles en imagenes, asi como lectura de titulos de graficos y de paginas.
- Procesamiento de contexto largo: se han servido peticiones de 260.094 tokens de entrada con 2.048 de salida en una sola GPU.
- Razonamiento de multiples pasos orientado a agentes: se reporta una evaluacion con Hermes Agent (20 escenarios, 8 workers, thinking off) con 99/100 aciertos.
- Codigo: se reporta la suite Aider Polyglot completa con 130/225 tareas resueltas (57,78%).
- Servicio compatible con la API de OpenAI en `http://127.0.0.1:8000/v1` con el nombre de modelo `Qwen3.8-27b-CIRU-EXL3-SGLANG`.
- Soporte de tool calling / function calling y de agentes: no se detalla de forma explicita en la informacion proporcionada, aunque las evaluaciones con Hermes Agent y Aider implican uso de herramientas.
- Capacidades multilingues: no disponible.
- Modo de pensamiento (thinking): la model card menciona sampler recomendado por Qwen con "thinking off" en la prueba de Hermes Agent; no se detallan modos adicionales.

## Casos de uso

- Asistencia al cliente con contexto largo: gracias a los 262.144 tokens configurados, el modelo puede mantener conversaciones multi-turno o ingerir historiales completos de tickets, contratos o documentacion sin truncar, en un unico servidor local con API compatible con OpenAI.
- Generacion y refactorizacion de codigo en produccion: la integracion se ha validado con la suite Aider Polyglot completa (130/225 tareas, 57,78%), lo que respalda su uso en tareas de edicion de repositorio y aplicacion de parches con mapa de repositorio.
- Agentes autonomos de multiples pasos: el resultado de 99/100 en Hermes Agent con 8 workers y techo de 64 turnos indica que el paquete es utilizable como backend de agentes con tool calling dentro de un flujo de trabajo local.
- Analisis de documentos extensos en una sola pasada: una peticion de 260.094 tokens de entrada y 2.048 de salida se completo en 160,7 s con 300,5 tokens/s de decodificacion, apto para resumir o extraer informacion de libros tecnicos, expedientes o bases de codigo.
- Procesamiento de imagenes y documentos escaneados: el modo vision cargo correctamente un grafico denso, una captura de una pagoda y un poster ilustrado, identificando sujetos y titulos, lo que sirve para extraccion de informacion de capturas, diagramas y material grafico.
- Despliegue en estacion de trabajo con privacidad de datos: al ejecutarse integramente en una RTX 5090 local con la API ligada a localhost y sin autenticacion por defecto, encaja en entornos donde los datos no pueden salir de la maquina.
- Servicio de alto rendimiento con concurrencia moderada: con dos peticiones simultaneas se midieron 512,3 tokens/s agregados de salida, y en el barrido de prompts de 1.024 tokens se alcanzaron 826,2 tokens/s agregados con ocho peticiones concurrentes, suficiente para un equipo pequeno o para procesamiento por lotes.
- Evaluacion comparativa de stacks de cuantizacion: el paquete sirve como referencia reproducible (contenedor con hash fijado) para comparar EXL3 servido en SGLang frente a builds NVFP4 sobre el mismo hardware.

## Benchmarks y rendimiento

Medidos en una unica RTX 5090. Las cifras de velocidad son medianas de tres peticiones o lotes validos; las de throughput cuentan peticiones realmente simultaneas e incluyen el procesamiento de prompt en el tiempo del lote.

| Carga de trabajo | Resultado CIRU | Referencia o condiciones |
|---|---:|---|
| Peticion corta: 2.048 entrada + 2.048 salida | 405,6 tokens/s de decodificacion; 5,6 s total | NVIDIA NVFP4: 208,6 tokens/s, 10,0 s. Servidor EXL3 original: 89,5 tokens/s, 23,5 s. Una peticion |
| Contexto completo: 260.094 entrada + 2.048 salida | 300,5 tokens/s de decodificacion; 160,7 s total | Servidor EXL3 original: 61,3 tokens/s, 229,5 s. Una peticion; pico de GPU CIRU de 28,88 GiB |
| Throughput: 1.024 entrada + 512 salida por peticion | 512,3 tokens/s agregados de salida | Dos peticiones concurrentes con prompts variados; NVIDIA NVFP4: 383,9 tokens/s agregados |
| Pico de throughput en barrido de prompts de 1.024 tokens | 826,2 tokens/s agregados de salida | Ocho peticiones concurrentes con prompts variados; 512 tokens de salida cada una |
| Aider Polyglot (codigo) | 130/225 tareas (57,78%) | Suite completa; 8 workers, 2 intentos, mapa de repositorio, sampler no-thinking recomendado por Qwen; KV de target en BF16 a 64K. Sin ejecucion de referencia equivalente bajo este protocolo |
| Hermes Agent 20, thinking off | 99/100 | 20 escenarios, 8 workers de agente, una pasada puntuada; KV de target NVFP4 a 256K y techo de 64 turnos |

El autor advierte que las comparaciones de velocidad son entre paquetes de servicio completos, con runtime y ajustes de KV distintos, por lo que no aislan el efecto de la cuantizacion, y que las ejecuciones previas de Hermes sobre el modelo original usaban techos de turnos por defecto mas bajos, de modo que no son una comparacion con el mismo limite.

## Requisitos de hardware

- VRAM estimada: pico de 28,88 GiB medido con contexto completo (260.094 tokens de entrada) en la configuracion publicada.
- GPU recomendada y validada: una unica NVIDIA RTX 5090 de 32 GB. Es el unico host probado por el autor (Linux x86_64).
- Cabe en GPU de consumo: si, en RTX 5090 de 32 GB. No hay datos sobre su funcionamiento en GPUs de 24 GB o menos; dada la configuracion de memoria descrita, no puede asumirse que quepan.
- Otras GPUs (A100, H100, etc.): no disponible; no se han validado ni reportado mediciones.
- Sistemas operativos soportados: Linux x86_64 (validado en Ubuntu, con guia tambien para Fedora). En Windows se puede usar WSL2 con Docker Desktop y soporte GPU.
- Sistemas no soportados explicitamente: macOS nativo, AMD, CPU y Windows nativo.
- Opciones de despliegue: el runner de CIRU (`qwen38-exl3-sglang-runner`) con contenedor Docker fijado, SGLang 0.5.20 con un parche verificado por hash y un parche de interoperabilidad de CUDA graphs con ExLlamaV3. Se expone una API compatible con OpenAI en `http://127.0.0.1:8000/v1`, ligada a localhost y sin autenticacion. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Scripts de operacion: `bash setup.sh install`, `bash setup.sh run`, `CIRU_MODE=vision bash setup.sh run`, `bash setup.sh check` y `bash setup.sh stop`; `python3 scripts/ask_image.py` para consultas sobre imagenes.
- Latencia y throughput medidos: 5,6 s para 2.048+2.048 tokens; 160,7 s para 260.094+2.048 tokens; 405,6 tokens/s de decodificacion en peticion corta; hasta 826,2 tokens/s agregados con ocho peticiones concurrentes.
- Requisitos previos: Docker Engine y NVIDIA Container Toolkit.

## Comparativa con modelos similares

No se dispone de datos de modelos alternativos de la misma categoria mas alla de las variantes de despliegue del propio Qwen3.8-27B citadas en la model card. La comparacion disponible es entre paquetes de servicio sobre el mismo modelo:

| Paquete | Parametros | Contexto | Rendimiento (peticion corta 2.048+2.048) | Throughput (2 peticiones, 1.024+512) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| CIRU EXL3 SGLang (este release) | Qwen3.8-27B (27B aprox.) | 262.144 configurados (pool de 270.336) | 405,6 tokens/s; 5,6 s | 512,3 tokens/s agregados | apache-2.0 | Integracion en HuggingFace + runner en GitHub; pesos descargados de repos upstream |
| NVIDIA NVFP4 (referencia citada) | mismo modelo base | no disponible | 208,6 tokens/s; 10,0 s | 383,9 tokens/s agregados | no disponible | no disponible |
| Servidor EXL3 original (referencia citada) | mismo modelo base | no disponible | 89,5 tokens/s; 23,5 s | no disponible | no disponible | no disponible |

Comparacion con otros modelos de la misma categoria (por ejemplo, otros modelos multimodales de ~27B): no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo nuevo: es un paquete de servicio. Los pesos de target y draft son los publicados por r0b0tlab y no han sido reentrenados ni recuantizados por el autor.
- El repositorio de HuggingFace tiene 0,0 GB: no contiene los ficheros de pesos. El runner los descarga de los repositorios upstream, por lo que la disponibilidad de este release depende de terceros.
- Estado de madurez bajo: 0 descargas y 0 likes en el momento de la consulta; la validacion se hizo en un unico sistema Linux x86_64 con una RTX 5090.
- Las rutas de instalacion para Fedora y WSL2 se documentan pero no han sido validadas por el autor.
- Sin soporte para macOS nativo, AMD, CPU ni Windows nativo.
- La API se sirve en localhost sin autenticacion; exponerla fuera de la maquina requiere anadir una capa de autenticacion y control de acceso.
- Las comparaciones de velocidad incluyen paquetes de servicio completos con runtime y KV distintos, por lo que no aislaban el efecto de la cuantizacion segun el propio autor.
- La comparacion de Hermes Agent no es equiparable en limite de turnos con las ejecuciones previas del modelo original.
- Riesgo de alucinacion, sesgos y comportamiento concreto por idioma: no disponible; no se documentan evaluaciones de sesgo ni de fidelidad.
- Idiomas soportados: no disponible.
- La ventana de 262.144 tokens depende del perfil de memoria descrito (KV NVFP4, estado FP32, pool compartido); reducir la VRAM disponible obligara a bajar contexto o a cambiar la configuracion, lo que puede alterar el rendimiento reportado.
- El modo vision consume memoria adicional al cargar el codificador de imagen; las cifras de velocidad publicadas corresponden al modo texto.
- Uso comercial: la licencia declarada es apache-2.0, pero conviene verificar la licencia del modelo base Qwen/Qwen3.8-27B y de los pesos EXL3 de r0b0tlab antes de un despliegue en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jcbtc/Qwen3.8-27b-CIRU-EXL3-SGLANG
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Pesos EXL3 de target (r0b0tlab, 4,00 bpw): https://huggingface.co/r0b0tlab/Qwen3.8-27B-EXL3-4.00bpw
- Pesos del draft DFlash2 EXL3 (r0b0tlab): https://huggingface.co/r0b0tlab/Qwen3.8-27B-DFlash2-EXL3-4.00bpw
- Runner e integracion CIRU: https://github.com/ciru-ai/qwen38-exl3-sglang-runner
- Informe completo de benchmarks (ladder de contexto, barridos de concurrencia, protocolos y resultados en bruto): https://github.com/ciru-ai/qwen38-exl3-sglang-runner/blob/main/benchmarks/REPORT.md
- Guia de instalacion de Docker Engine en Ubuntu: https://docs.docker.com/engine/install/ubuntu/
- Guia de instalacion de Docker Engine en Fedora: https://docs.docker.com/engine/install/fedora/
- Guia de instalacion del NVIDIA Container Toolkit: https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html
