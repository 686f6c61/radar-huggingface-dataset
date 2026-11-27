# ggml-org/Inkling-2-Mini-GGUF

## Resumen

Inkling 2 Mini es un modelo multimodal de tipo image-text-to-text desarrollado por Thinking Machines, distribuido en formato GGUF por el repositorio ggml-org. Se trata de un modelo de mezcla de expertos (MoE) con 26.070 millones de parametros totales y 128 expertos, de los cuales 8 se activan por token. Su caracteristica arquitectonica mas distintiva es el uso de un nucleo recurrente (loop core): las capas 6 a 17 se ejecutan tres veces por token, de modo que cada token atraviesa 48 evaluaciones de capa utilizando los pesos de solo 24 capas.

El modelo acepta entrada de imagen y texto, lo que lo situa en la categoria de modelos de vision-lenguaje con capacidad conversacional. La version publicada por ggml-org incluye el codificador de vision (mmproj) y varias cuantizaciones optimizadas para inferencia local con llama.cpp y llama.app, lo que facilita su despliegue fuera de infraestructura de datacenter.

Su relevancia actual radica en la combinacion de un diseno MoE recurrente con cuantizaciones de 4 bits calibradas (NVFP4 e IQ4_NL) que reducen el peso a 17,6 GB manteniendo una divergencia KL muy baja frente al BF16, lo que permite ejecutar un modelo de 26.000 millones de parametros con entrada de imagen en hardware de gama alta de consumo o en una unica GPU profesional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con nucleo recurrente (24 capas, capas 6-17 ejecutadas 3 veces por token; 48 evaluaciones de capa por token) y entrada de imagen |
| Parametros totales | 26.070.385.152 |
| Parametros activos | 8 expertos de 128 por token (parametros activos totales no disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, NVFP4, IQ4_NL (con imatrix); mmproj en BF16 y Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

Inkling 2 Mini emplea una arquitectura de mezcla de expertos con 128 expertos enrutados y 8 activos por token, organizada en 24 capas. Las capas 6 a 17 constituyen un nucleo recurrente que se ejecuta tres veces por token, de forma que cada token pasa por 48 evaluaciones de capa reutilizando los pesos de 24 capas. Cada pasada mantiene su propia cache KV y de convolucion, lo que incrementa el coste de memoria de estado respecto a un transformer convencional de profundidad equivalente.

El checkpoint original almacena los expertos enrutados de las capas 0-19 en NVFP4 y los de las capas 20-23 en MXFP8. La publicacion GGUF de ggml-org conserva esos expertos NVFP4 con sus escalas por experto y almacena el resto de matrices en Q8_0; la variante IQ4_NL cuantiza esos mismos expertos a 4 bits con calibracion mediante imatrix, calculada a partir del BF16 sobre los datos de calibracion v6 de bartowski con las conversaciones renderizadas a traves de la plantilla de chat del modelo. Los pesos del controlador del bucle se mantienen en F32. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Comprension de imagenes combinada con texto (pipeline image-text-to-text), con codificador de vision incluido en los ficheros mmproj.
- Razonamiento con profundidad configurable mediante el parametro `reasoning_effort`: `none`, `minimal`, `low`, `medium`, `high` (por defecto), `xhigh`, `max`, o un valor numerico entre 0.0 y 0.99.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y despliegue via llama.cpp y llama.app.

## Casos de uso

- Asistente conversacional multimodal local: el modelo puede mantener dialogos multi-turno con imagenes intercaladas, adecuado para prototipos de asistencia visual que deben ejecutarse en hardware propio sin depender de APIs externas.
- Analisis de documentos con capturas o diagramas: al aceptar imagen y texto, permite extraer y comentar informacion de graficos, tablas rasterizadas o esquemas tecnicos junto a preguntas en lenguaje natural.
- Control de profundidad de razonamiento por tarea: el parametro `reasoning_effort` permite fijar `low` o `minimal` para tareas de extraccion rapida y `high` o `max` para problemas que requieren cadenas de razonamiento largas, ajustando latencia y coste computacional.
- Despliegue en estaciones de trabajo con una sola GPU: la cuantizacion NVFP4 o IQ4_NL (17,6 GB) hace viable servir el modelo en GPUs de 24 GB o superiores, util para entornos de desarrollo y evaluacion interna.
- Evaluacion comparativa de cuantizaciones: las metricas de divergencia KL publicadas (Q8_0 0.0030, NVFP4 0.0029, IQ4_NL 0.0095 sobre wikitext-2) permiten seleccionar el equilibrio entre tamano y fidelidad para un pipeline concreto.
- Generacion de descripciones y respuestas sobre imagenes en aplicaciones de accesibilidad: el modelo puede describir contenido visual y responder preguntas de seguimiento en una misma conversacion.
- Integracion en herramientas basadas en llama.cpp: al estar en formato GGUF con mmproj separado, se integra en aplicaciones de escritorio y servidores locales que ya usan el ecosistema ggml.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica de calidad proporcionada es la divergencia KL frente al BF16 sobre wikitext-2 (40 x 512 tokens):

| Cuantizacion | KL divergence | Coincidencia de token top-1 |
|---|---|---|
| Q8_0 | 0.0030 | 97,6 % |
| NVFP4 | 0.0029 | 97,6 % |
| IQ4_NL | 0.0095 | 95,5 % |

## Requisitos de hardware

- Peso en disco de las cuantizaciones: BF16 52,2 GB, Q8_0 27,8 GB, NVFP4 17,6 GB, IQ4_NL 17,6 GB; mmproj de vision 642 MB (BF16) o 346 MB (Q8_0).
- VRAM estimada para inferencia: al menos el tamano de los pesos mas la cache KV y de convolucion de las tres pasadas del nucleo recurrente; el valor exacto de la cache no esta disponible en la informacion proporcionada.
- NVFP4 e IQ4_NL (17,6 GB) caben en GPUs de consumo de 24 GB (por ejemplo, RTX 4090) y en GPUs profesionales tipo A100 o H100 con amplio margen.
- Q8_0 (27,8 GB) requiere GPUs de 32 GB o mas, o bien reparto entre varias GPU.
- BF16 (52,2 GB) requiere una GPU de 80 GB (A100/H100) o configuracion multi-GPU.
- Opciones de despliegue: llama.cpp y llama.app (`llama serve -hf ggml-org/Inkling-2-Mini-GGUF:NVFP4`); soporte en vLLM, TGI u Ollama no disponible en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria con datos verificables de parametros, contexto o rendimiento.

## Limitaciones y advertencias

- Licencia no disponible: no puede confirmarse el uso comercial ni las condiciones de redistribucion; debe consultarse el modelo base thinkingmachines/Inkling-2-Mini antes de cualquier despliegue en produccion.
- Idiomas soportados no documentados: el rendimiento fuera del ingles (u otros idiomas no confirmados) es incierto.
- Longitud de contexto no disponible: no es posible planificar casos de uso con documentos largos sin verificacion previa.
- Riesgo de alucinacion inherente a los modelos generativos; no se han publicado evaluaciones de fidelidad factua.
- La cuantizacion IQ4_NL presenta mayor divergencia (KL 0.0095, 95,5 % de coincidencia top-1) que NVFP4 y Q8_0; en tareas sensibles a la precision conviene usar NVFP4 o Q8_0.
- El nucleo recurrente mantiene caches KV y de convolucion independientes por cada una de las tres pasadas, lo que aumenta el consumo de memoria de estado frente a un transformer de 24 capas.
- El codificador de vision se distribuye como fichero mmproj separado; un despliegue sin el desactiva la capacidad multimodal.
- No hay informacion sobre sesgos conocidos ni sobre el proceso de alineacion del modelo base.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ggml-org/Inkling-2-Mini-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Fichero imatrix: https://huggingface.co/ggml-org/Inkling-2-Mini-GGUF/blob/main/imatrix.gguf
- Datos de calibracion v6 de bartowski: https://gist.github.com/bartowski1182/e26453c0404e24eb317543ec5360f87a
- llama.app: https://llama.app
