# mertkayacs/Deem-4B-web

## Resumen

Deem-4B-web es una distribucion cuantizada en formato GGUF del modelo Deem-4B, publicada por el autor mertkayacs bajo licencia Apache 2.0. Se trata de un modelo de decision orientado a inferencia en navegador mediante WebGPU, empaquetado especificamente para el runtime Emberwick a traves de la libreria wllama 4.0.0. El repositorio contiene los pesos divididos en siete fragmentos Q4_K_M que suman 2.708.805.024 bytes (aproximadamente 2,7 GB), con un manifiesto que el navegador lee para verificar los hashes SHA-256 de cada fragmento antes de almacenarlos en OPFS (Origin Private File System).

El modelo cuenta con 4.205.751.296 parametros totales segun los pesos en safetensors del modelo base, lo que lo situa en la categoria de 4B. Su proposito no es la generacion de texto abierta, sino la clasificacion de decisiones: el repositorio incluye un fichero `symbols.json` con 62 identificadores de tokens de respuesta y un token marcador de decision, lo que indica un uso como clasificador de opciones discretas en lugar de un modelo conversacional generalista.

La relevancia de esta publicacion reside en su enfoque de despliegue: inferencia local en el navegador sin backend, con verificacion de integridad criptografica de los pesos y calibracion preservada tras el troceado. El autor documenta pruebas de paridad entre el build troceado y el original, asi como una prueba de ejecucion en GPU ZeroGPU sobre una particion NVIDIA RTX Pro 6000 Blackwell Server Edition.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Deem-4B; plantilla de chat Qwen3.5 segun la model card) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unica publicada en este repositorio) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (siete fragmentos Q4_K_M), con `browser-manifest.json`, `export-report.json` y `symbols.json` |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Deem-4B en la documentacion proporcionada. La model card de esta distribucion indica unicamente que el GGUF embebe el tokenizer y la plantilla de chat de Qwen3.5, lo que sugiere una arquitectura de tipo transformer compatible con dicha plantilla, pero no se confirma el tipo exacto de atencion, el esquema de normalizacion ni si incorpora componentes MoE o hibridos.

Respecto al entrenamiento, no se detallan volumen de tokens, composicion del dataset ni si hubo fases de RLHF o DPO. La unica informacion tecnica relevante sobre el proceso de esta publicacion es el de cuantizacion y troceado: el autor reporta una concordancia de argmax del 95,16 % entre el Q4_K_M nativo y BF16 sobre 62 decisiones reservadas, con una brecha maxima de probabilidad de 0,1463. Tambien certifica que los 426 tensores y los 39 campos de metadatos no de cabecera coinciden con la fuente sin trocear, y que la degradacion de ECE (Expected Calibration Error) atribuible al troceado es de 0,0000, por debajo del umbral de reajuste de 0,02.

## Capacidades

- Clasificacion de decisiones discretas: el modelo esta orientado a elegir entre un conjunto cerrado de 62 respuestas identificadas por token ID en `symbols.json`, con un token marcador de decision.
- Inferencia en navegador: ejecutable mediante wllama 4.0.0 sobre WebGPU, con carga de fragmentos desde OPFS y verificacion SHA-256.
- Conversacion basica: la etiqueta `conversational` y la plantilla de chat Qwen3.5 indican soporte de formato conversacional, aunque el uso previsto es la decision.
- Multilingue: limitado a ingles segun la etiqueta de idioma del repositorio.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Clasificacion de intenciones en interfaces web: el modelo puede ejecutarse integramente en el cliente para decidir entre un conjunto predefinido de acciones (por ejemplo, navegacion o filtros) sin enviar datos a un servidor, aprovechando los 62 tokens de respuesta predefinidos.
- Asistentes embebidos con privacidad estricta: al residir los pesos en OPFS y verificarse por hash, resulta adecuado para aplicaciones donde el texto del usuario no debe salir del dispositivo.
- Enrutamiento de decisiones en formularios o flujos guiados: seleccion de la siguiente pregunta o paso en un cuestionario adaptativo a partir del estado conversacional.
- Demostraciones y prototipos de IA en navegador: permite validar pipelines de WebGPU y wllama sin infraestructura de servidor, con un coste de almacenamiento de 3,1 GiB libres.
- Moderacion o etiquetado local de contenido categorico: asignacion de una etiqueta entre un conjunto cerrado de clases, con la ventaja de que la calibracion se mantiene tras el troceado.
- Filtrado previo en aplicaciones de bajo consumo: descartar o confirmar acciones antes de invocar un modelo mayor en el servidor, reduciendo latencia y coste de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta metricas internas de paridad y calibracion:

| Metrica | Valor |
|---|---|
| Concordancia argmax Q4_K_M vs BF16 | 95,16 % sobre 62 decisiones reservadas |
| Brecha maxima de probabilidad | 0,1463 |
| Integridad del troceado | 426 tensores y 39 campos de metadatos coincidentes |
| Degradacion de ECE por troceado | 0,0000 (umbral de reajuste 0,02) |
| Prueba en GPU | Coincidencia con la accion `rest` en NVIDIA RTX Pro 6000 Blackwell Server Edition |

No se proporcionan cifras de MMLU, HumanEval, GSM8K ni de latencia o throughput en navegador; el autor indica que la velocidad WebGPU y el pico de memoria los reporta el runtime Emberwick.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el autor estima 4,8 GiB de memoria viva en el navegador.
- Memoria de dispositivo: politica de admision de al menos 8 GiB de memoria del dispositivo.
- Almacenamiento: al menos 3,1 GiB libres para los siete fragmentos en OPFS.
- GPU recomendadas: no se especifican modelos concretos; se documenta una prueba en NVIDIA RTX Pro 6000 Blackwell Server Edition. La viabilidad en GPU de consumo depende del soporte WebGPU del navegador y no se cuantifica.
- Despliegue: wllama 4.0.0 sobre WebGPU en navegador; el repositorio menciona prueba nativa con llama.cpp con soporte de offload a GPU.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (modelos de decision de 4B para navegador) ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- El modelo esta disenado para un conjunto cerrado de 62 decisiones; no es un generador de texto generalista y su uso fuera de ese esquema no esta documentado.
- Solo soporta ingles segun la etiqueta de idioma del repositorio.
- La longitud de contexto no se especifica, lo que impide planificar escenarios de contexto largo.
- La cuantizacion Q4_K_M introduce una brecha de hasta 0,1463 en probabilidades frente a BF16, con un 4,84 % de desacuerdos de argmax en la muestra medida; en decisiones de alta sensibilidad conviene validar el comportamiento.
- Las cifras de memoria (8 GiB de dispositivo, 4,8 GiB en vivo, 3,1 GiB de almacenamiento) son estimaciones de admision pendientes de medicion real en hardware de navegador, segun el propio autor.
- El repositorio registra cero descargas y cero likes en el momento de la consulta, por lo que no existe validacion comunitaria independiente.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion ni sobre sesgos del modelo base.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mertkayacs/Deem-4B-web
- Modelo base: https://huggingface.co/mertkayacs/Deem-4B
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la informacion proporcionada.
