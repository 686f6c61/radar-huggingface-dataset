# AXERA-TECH/Qwen3.5-4B-AX8860-llama.cpp

## Resumen

AXERA-TECH/Qwen3.5-4B-AX8860-llama.cpp es una distribución optimizada del modelo Qwen3.5-4B de Alibaba Qwen, empaquetada por AXERA-TECH para ejecutarse en la NPU Axera AX8860 mediante una bifurcación de llama.cpp con kernels ggml específicos para dicho acelerador. No se trata de un modelo nuevo entrenado desde cero, sino de una conversión de pesos (cuantización MXFP4) más el runtime, los binarios estáticos y los kernels NPU necesarios para inferencia en hardware de borde (edge). El modelo base conserva la arquitectura multimodal de Qwen3.5-4B, con entrada de texto e imagen.

El paquete resuelve un problema muy concreto: desplegar un LLM de 4.000 millones de parámetros con capacidades de visión sobre un SoC NPU de bajo consumo, ofreciendo un servidor compatible con la API de OpenAI y decodificación especulativa opcional (MTP) que eleva el throughput de 62,3 a hasta 128,0 tokens/s en ciertos tipos de contenido. El contexto máximo soportado es de 16.384 tokens y el repositorio ocupa 4,1 GB, con pesos en formato GGUF de 2,66 GB y un codificador visual separado de 676 MB.

La relevancia actual radica en que demuestra la viabilidad de LLMs multimodales cuantizados en NPUs dedicadas, un nicho tradicionalmente dominado por GPUs, con cifras de prefill de 5.040 tokens/s y decodificación superior a 60 tokens/s en modo no especulativo. La licencia del paquete no está declarada en la información disponible, lo que constituye una limitación importante para uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo base Qwen3.5-4B), ejecutado con llama.cpp + kernels ggml-axera |
| Parametros totales | 4.326.350.848 (4,33 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 16.384 tokens |
| Tipos de cuantizacion | MXFP4 (pesos principales, 2,66 GB); BF16 para el codificador visual (676 MB) |
| Idiomas soportados | no disponible (la model card muestra ejemplos en chino e inglés, pero no declara lista oficial) |
| Licencia | no disponible |
| Formato de pesos | GGUF (`qwen3.5-4b-mxfp4.gguf`, `mmproj-qwen3.5-4b-bf16.gguf`) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B es un transformer multimodal que acepta texto e imágenes; el paquete distribuido por AXERA-TECH no aporta información sobre el entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF o DPO). Lo que sí documenta el autor es la capa de despliegue: una bifurcación de llama.cpp (`ZHEQIUSHUI/llama.cpp`, rama `axera-dev`, commit `0104880be`) con kernels NPU compilados para el Axera AX8860 y binarios estáticos incluidos en el repositorio.

La innovación técnica destacable es la decodificación especulativa MTP (multi-token prediction) opcional: por cada ronda se proponen 3 tokens candidatos que el modelo objetivo verifica individualmente, de modo que en decodificación greedy la salida es idéntica a la decodificación normal. La aceleración depende del contenido, con tasas de aceptación entre 0,269 y 0,816 y ganancias de 1,02x a 2,05x. El runtime ocupa los 4 núcleos NPU de forma exclusiva, usa una caché de prompt de 4 GB en memoria host (configurable a disco vía `CACHE_DIR`) y sirve con `-np 1`.

## Capacidades

- Generación de texto conversacional en modo chat y completado.
- Entrada de imágenes: el codificador visual BF16 permite describir imágenes (vehículos, texto en carteles, personas) según los ejemplos de la model card.
- Razonamiento y matemáticas: la model card incluye pruebas de resolución de problemas matemáticos y traducción chino-inglés.
- Generación de código, con soporte para clientes de agentes como Codex (acepta mensajes de sistema en mitad de la conversación).
- Servidor compatible con la API de OpenAI (`run.sh -s 8080`), lo que facilita integración con clientes existentes.
- Decodificación especulativa MTP opcional (`MTP=1`) para acelerar la generación.
- Modo de pensamiento (thinking) configurable: el servidor lo desactiva por defecto (`--reasoning off`).
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: solo se documentan ejemplos en chino e inglés; no hay lista oficial de idiomas.

## Casos de uso

- Asistente conversacional en dispositivo de borde: el modelo corre íntegramente en la NPU AX8860 con 16.384 tokens de contexto, lo que permite mantener conversaciones multi-turno sin conexión a la nube y con latencia de decodificación superior a 60 tokens/s.
- Descripción de imágenes en tiempo real: con el codificador visual incluido se pueden procesar fotogramas o capturas y generar descripciones textuales, útil en inspección industrial o accesibilidad.
- Servidor interno compatible con OpenAI: al exponer un endpoint compatible (`-s 8080`), se puede conectar cualquier cliente que hable el protocolo de OpenAI sin adaptar código.
- Generación de código asistida en entornos con agentes: la aceptación de mensajes de sistema intermedios permite integrarlo con clientes tipo Codex para tareas de edición y refactorización.
- Traducción chino-inglés: los benchmarks muestran 84,9 tokens/s con MTP en tareas de traducción, adecuado para pipelines de localización por lotes.
- Generación de tablas Markdown y documentación estructurada: es el caso con mayor aceleración MTP (2,05x, aceptación 0,816), idóneo para generar informes tabulares automáticamente.
- Procesamiento de prompts largos: con 5.040 tokens/s de prefill, un prompt de 3.908 tokens se procesa en 0,78 s, lo que permite resumir documentos extensos dentro del límite de contexto.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (tokens/s, hasta 256 tokens generados, greedy salvo indicación):

| Escenario | Sin MTP | Con MTP | Aceleración | Tasa de aceptación |
|---|---:|---:|---:|---:|
| Decodificación general | 62,3 | hasta 128,0 | 2,05x | no disponible |
| Prompt de 4k | 58,8 | 99,7 | 1,70x | 42/61 |
| Código | 62,4 | 84,7 | 1,36x | 0,481 |
| Traducción chino-inglés | 60,5 | 84,9 | 1,40x | 0,598 |
| Tabla Markdown | 62,5 | 128,0 | 2,05x | 0,816 |
| Matemáticas | 62,6 | 98,5 | 1,57x | 0,563 |
| Ensayo en chino | 61,6 | 62,7 | 1,02x | 0,274 |
| Relato en inglés | 61,2 | 63,3 | 1,03x | 0,302 |
| Código con muestreo | 61,3 | 87,4 | 1,43x | 0,481 |

| Métrica adicional | Valor |
|---|---|
| Prefill con prompt de 3.908 tokens | 5.040 tokens/s (0,78 s) |
| Decodificación con prompt de 3.908 tokens (`-c 8192`) | 59,8 tokens/s |
| Decodificación con prompt de 3.908 tokens (`-c 16384`) | 59,9 tokens/s |
| Decodificación con muestreo, prompt de 3.908 tokens | 58,6 tokens/s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Hardware obligatorio: NPU Axera AX8860 con SDK V0.5.1 o superior; el runtime ocupa los 4 núcleos NPU de forma exclusiva.
- VRAM: no aplica en el sentido convencional; los pesos MXFP4 ocupan 2,66 GB y el codificador visual 676 MB, más una caché de prompt de 4 GB en memoria host (ampliable a disco con `CACHE_DIR`).
- GPU: no es compatible con GPU convencionales; los binarios incluidos están enlazados estáticamente para la NPU AX8860.
- Cabe en hardware de borde, no en GPU de consumo: el despliegue objetivo es el SoC AX8860, no tarjetas RTX.
- Opciones de despliegue: llama.cpp modificado (rama `axera-dev`), servidor OpenAI-compatible integrado (`run.sh -s`), scripts `run.sh` y `bench.sh`; `llama-bench` funciona con `-b 4096 -ub 4096`.
- Throughput: 62,3 tokens/s en decodificación normal, hasta 128,0 tokens/s con MTP; prefill de 5.040 tokens/s.
- Advertencia operativa: en algunos entornos, peticiones consecutivas fallan esporádicamente con `ret = -3` y requieren reintento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Despliegue |
|---|---|---|---|---|---|
| AXERA-TECH/Qwen3.5-4B-AX8860-llama.cpp | 4,33 mil millones | 16.384 | Sí (texto + imagen) | no disponible | NPU Axera AX8860 |
| Qwen/Qwen3.5-4B (modelo base) | 4,33 mil millones | no disponible | Sí (texto + imagen) | no disponible | GPU/CPU genéricas vía llama.cpp u otros runtimes |
| Otras distribuciones GGUF de Qwen3.5-4B | 4,33 mil millones | depende del runtime | Sí | depende del publicador | CPU/GPU con llama.cpp estándar |

La comparativa con alternativas de otros fabricantes no está disponible en la información proporcionada; los datos solo permiten contrastar esta distribución con el modelo base y con otras conversiones GGUF del mismo modelo.

## Limitaciones y advertencias

- Dependencia total de hardware: solo funciona en NPU Axera AX8860 con SDK V0.5.1 o superior; no es portable a GPU ni CPU convencionales.
- Licencia no declarada: la ausencia de licencia explícita impide asumir permisos de uso comercial; debe verificarse con el autor y con la licencia del modelo base Qwen3.5-4B.
- Idiomas no documentados: la model card solo muestra ejemplos en chino e inglés; el rendimiento en castellano no está verificado.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad ni benchmarks estándar (MMLU, HumanEval, GSM8K), por lo que la calidad real del modelo base en este empaquetado no está cuantificada.
- Estabilidad: se documentan fallos esporádicos `ret = -3` en peticiones consecutivas que requieren reintento, un caveat relevante para producción.
- Contexto limitado a 16.384 tokens, inferior a modelos contemporáneos con ventanas de 128k o superiores.
- MTP desactivado por defecto: la aceleración requiere activación explícita (`MTP=1`) y su ganancia es muy variable según el contenido (de 1,02x en prosa a 2,05x en tablas).
- En decodificación greedy con MTP se recomienda fijar explícitamente `presence_penalty: 0`; de lo contrario el comportamiento de muestreo puede diferir del esperado.
- El modo de pensamiento está desactivado por defecto en el servidor, lo que puede reducir el rendimiento en tareas de razonamiento complejo si no se reactiva.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AXERA-TECH/Qwen3.5-4B-AX8860-llama.cpp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Código fuente de llama.cpp modificado: https://github.com/ZHEQIUSHUI/llama.cpp (rama `axera-dev`, commit `0104880be`)
