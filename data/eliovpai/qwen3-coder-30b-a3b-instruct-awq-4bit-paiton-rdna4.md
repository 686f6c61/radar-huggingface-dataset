# EliovpAI/Qwen3-Coder-30B-A3B-Instruct-AWQ-4bit-Paiton-RDNA4

## Resumen

Este modelo es un artefacto compilado con Paiton del modelo Qwen3-Coder-30B-A3B-Instruct, cuantizado a AWQ 4-bit. Lo publica EliovpAI y está diseñado para ejecutarse de forma optimizada en una GPU AMD Radeon AI PRO R9700 (arquitectura RDNA4, gfx1201) con 32 GB de memoria. No es un checkpoint de Transformers tradicional, sino un paquete de runtime que incluye un artefacto compilado, un manifest y un lanzador para desplegar el modelo en un contenedor Docker.

El objetivo principal es ofrecer una experiencia de codificación local lista para usar en hardware AMD, con soporte de chat, streaming y llamadas a funciones (tool calling) a través de una API compatible con OpenAI. La relevancia actual radica en la optimización específica para RDNA4 mediante el compilador Paiton, que según las mediciones publicadas mejora el rendimiento de salida hasta un 70 % en concurrencia 2 frente a la configuración stock. La arquitectura es un modelo de mezcla de expertos (MoE) con 30 mil millones de parámetros totales y 3 mil millones activos, según el nombre del modelo. En esta implementación, la ventana de contexto se limita a 4.096 tokens, incluida la salida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) segun el nombre del modelo y el artefacto compilado |
| Parametros totales | 30B (segun el nombre del modelo) |
| Parametros activos | 3B (segun el nombre del modelo) |
| Longitud de contexto | 4.096 tokens incluyendo salida, en esta implementacion Paiton |
| Tipos de cuantizacion | INT4 G32 / BF16 activaciones (w4a16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Artefacto compilado Paiton; no contiene pesos (el checkpoint AWQ 4-bit se descarga del modelo base) |

## Arquitectura y entrenamiento

Este lanzamiento no introduce un modelo nuevo, sino una compilacion optimizada del modelo base Qwen3-Coder-30B-A3B-Instruct, que a su vez es una version cuantizada AWQ 4-bit alojada por cyankiwi. La arquitectura subyacente es un transformer de mezcla de expertos (MoE) con 30.000 millones de parametros totales y 3.000 millones de parametros activos por token, segun la nomenclatura del modelo. No se proporciona informacion sobre los datos de entrenamiento, el proceso de alineacion (RLHF/DPO) ni la composicion del dataset en la documentacion disponible.

La innovacion tecnica destacable es la compilacion mediante el runtime Paiton, que genera un artefacto nativo para la arquitectura AMD RDNA4 (gfx1201). Este artefacto utiliza pesos INT4 con activaciones BF16 y esta optimizado para la memoria y el pipeline de la R9700. El proceso de compilacion se realiza previamente y se distribuye como un paquete de contenedor, de modo que el usuario no necesita compilar nada localmente. No se aportan detalles sobre tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y codigo: el modelo esta orientado a tareas de programacion, como escribir funciones, scripts y fragmentos de codigo con tests.
- Soporte de tool calling / function calling: habilitado y verificado tanto en modo ordinario como en streaming, segun la documentacion publicada.
- Chat interactivo y streaming: la API expone un endpoint OpenAI-compatible en `http://127.0.0.1:8010/v1` con soporte de chat y respuestas en streaming.
- Integracion con clientes de codigo: se puede conectar a IDEs y aplicaciones que acepten un proveedor OpenAI-compatible, indicando el modelo `qwen3-coder`.
- Ejecucion local en hardware AMD: el artefacto compilado esta pensado para funcionar en una GPU AMD Radeon AI PRO R9700 con 32 GB, sin necesidad de compilacion en el equipo.
- No se han documentado capacidades de vision, audio ni otros modos multimodales.

## Casos de uso

- Asistente de codificacion en terminal: el lanzador `serve-docker.sh --chat` inicia un chat interactivo en la terminal, ideal para consultas rapidas de codigo sin salir del entorno de desarrollo.
- Integracion con IDE o editor: al exponer una API OpenAI-compatible, se puede configurar en herramientas como Cursor, Continue o similares apuntando a `http://127.0.0.1:8010/v1`, lo que permite autocompletado y chat contextual dentro del editor.
- Generacion de scripts y funciones en CI/CD: gracias al soporte de tool calling, el modelo puede integrarse en pipelines para generar pruebas unitarias, revisar fragmentos de codigo o producir documentacion tecnica, siempre que las tareas sean acotadas.
- Prototipado local en entornos AMD: para equipos con una R9700, este paquete elimina la necesidad de configurar un runtime de inference desde cero; basta con descargar el artefacto y ejecutar el lanzador.
- Evaluacion de rendimiento de Paiton: las mediciones publicadas permiten comparar la velocidad de salida entre la configuracion stock y la compilada, util para decidir si merece la pena adoptar Paiton en despliegues AMD.
- Despliegue en contenedores para equipos de desarrollo: el paquete incluye una imagen precompilada que se puede levantar con Docker, lo que facilita un entorno de inferencia reproducible y aislado para un grupo reducido de usuarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar como MMLU, HumanEval o GSM8K en la informacion disponible. Sin embargo, la documentacion incluye mediciones de rendimiento de inferencia comparando la ejecucion stock con la compilada Paiton en una maquina con R9700. Estas son las cifras publicadas:

| Concurrencia | Stock (tokens/s) | Paiton (tokens/s) | Ganancia |
|---|---|---|---|
| 1 | 104,42 | 126,68 | 21,3 % |
| 2 | 101,61 | 172,82 | 70,1 % |

Las mediciones corresponden a dos ejecuciones de 16 peticiones por motor y configuracion, con 229-241 tokens de entrada y exactamente 256 tokens de salida. La latencia media de peticion bajo en concurrencia 1 de 2,451 s a 2,020 s, y en concurrencia 2 de 5,038 s a 2,961 s. Ambos motores superaron cuatro comprobaciones de codificacion ejecutables y obtuvieron 7/8 en una pequena suite de calidad, fallando ambos en la comprobacion de ordenacion JSON al devolver cadenas en lugar de numeros. No se ha establecido paridad de calidad integral.

## Requisitos de hardware

- VRAM estimada: el uso de GPU muestreado alcanzo un pico cercano a 20,1 GiB, con los pesos residentes por completo en la GPU.
- GPU recomendada: AMD Radeon AI PRO R9700 con 32 GB, arquitectura gfx1201 (RDNA4). No se indica soporte para otras GPUs.
- RAM del sistema: se probo con 16 GB de RAM host y 4 GB de swap.
- Espacio en disco: se recomienda reservar al menos 30 GB libres para los pesos, la imagen de aproximadamente 5,1 GB y las cachés.
- Opciones de despliegue: Docker con imagen precompilada, el lanzador `serve-docker.sh` y el plugin Paiton para vLLM. No se menciona soporte para llama.cpp, Ollama o TGI en esta version.
- Latencia y throughput: con concurrencia 1, 126,68 tokens/s de salida y 2,020 s de latencia media; con concurrencia 2, 172,82 tokens/s y 2,961 s de latencia media.
- Tiempo de arranque: la carga del modelo tardo unos 46 segundos; el arranque con cache tarda aproximadamente dos minutos, con tiempo adicional para caches de compilacion frescas.

## Comparativa con modelos similares

No se dispone de informacion suficiente para una comparativa completa con modelos de la misma categoria en la documentacion proporcionada. A continuacion se indican las variantes conocidas del mismo modelo base, con los datos disponibles:

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-Coder-30B-A3B-Instruct (original) | 30B totales, 3B activos | no disponible | no disponible | Apache 2.0 | HuggingFace |
| Qwen3-Coder-30B-A3B-Instruct-AWQ (stelterlab) | no disponible | no disponible | AWQ 4-bit | no disponible | HuggingFace |
| Este modelo (EliovpAI, Paiton RDNA4) | 30B totales, 3B activos | 4.096 tokens | INT4 G32 / BF16 | Apache 2.0 | HuggingFace (artefacto compilado) |

## Limitaciones y advertencias

- No es un checkpoint de Transformers: no se puede cargar pasando el nombre del repositorio a `from_pretrained`. Es un paquete de runtime Paiton.
- Contexto limitado a 4.096 tokens, incluida la salida, lo que impide trabajar con repositorios completos o documentos largos.
- No se recomienda para cargas de trabajo de agente sobre repositorios enteros; la documentacion indica que estas tareas no estan cualificadas.
- Solo soporta 1 o 2 secuencias concurrentes; no se han validado niveles de concurrencia superiores.
- Requiere hardware AMD especifico (RDNA4, gfx1201). No se menciona compatibilidad con otras arquitecturas.
- El repositorio no contiene los pesos; la primera ejecucion descarga un checkpoint de 18,1 GB desde el repositorio de cyankiwi, lo que requiere conexion y espacio en disco.
- La suite de calidad utilizada no establece paridad integral con el modelo base; ambos motores fallaron una comprobacion de ordenacion JSON.
- No se han publicado benchmarks de capacidades estandar, por lo que el rendimiento real en tareas como MMLU o HumanEval es desconocido.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base original.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/EliovpAI/Qwen3-Coder-30B-A3B-Instruct-AWQ-4bit-Paiton-RDNA4
- Modelo base cuantizado: https://huggingface.co/cyankiwi/Qwen3-Coder-30B-A3B-Instruct-AWQ-4bit
- Modelo original Qwen3-Coder-30B-A3B-Instruct: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- Version AWQ de stelterlab: https://huggingface.co/stelterlab/Qwen3-Coder-30B-A3B-Instruct-AWQ
- Repositorio del plugin Paiton vLLM: https://github.com/Eliovp-BV/paiton-vllm-plugin
- Guia completa del modelo: https://github.com/Eliovp-BV/paiton-vllm-plugin/blob/main/models/Qwen3-Coder-30B/README.md
- Mediciones y limitaciones: https://github.com/Eliovp-BV/paiton-vllm-plugin/blob/9148505697c70ed3e0a68f298ca6860579db0fbb/models/Qwen3-Coder-30B/BENCHMARKS.md
- Comandos de reproduccion: https://github.com/Eliovp-BV/paiton-vllm-plugin/blob/main/models/Qwen3-Coder-30B/REPRODUCE.md
- Archivo listo para ejecutar: https://github.com/Eliovp-BV/paiton-vllm-plugin/releases/download/qwen3-coder-30b-awq-rdna4-v1.0.0/paiton-qwen3-coder-r9700-v1.0.0.tar.gz
