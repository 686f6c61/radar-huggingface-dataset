# AXERA-TECH/Qwen3.5-4B-AX8860-llama.cpp

## Resumen

Qwen3.5-4B-AX8860-llama.cpp es una distribución específica del modelo Qwen3.5-4B de Alibaba Qwen, adaptada por AXERA-TECH para ejecutarse sobre la NPU del SoC Axera AX8860 mediante una bifurcación de llama.cpp con kernels propios (ggml-axera). No se trata de un modelo nuevo: el repositorio empaqueta los pesos cuantizados en formato GGUF junto con los binarios estáticos de llama.cpp compilados para el chip, los kernels de NPU y scripts de arranque, de modo que el modelo pueda desplegarse en hardware de borde sin cadena de compilación en el dispositivo.

El modelo base cuenta con 4.326.350.848 parámetros (aproximadamente 4,3 mil millones) y admite entradas de texto e imagen, ya que el paquete incluye un codificador visual independiente en `mmproj-qwen3.5-4b-bf16.gguf`. La ventana de contexto configurada en esta distribución llega hasta 16.384 tokens. La relevancia de esta ficha radica en su orientación a inferencia local en NPU: el autor publica cifras de decodificación de 62,3 tokens/s en modo normal y hasta 128,0 tokens/s con decodificación especulativa MTP, además de un prefill de 5.040 tokens/s para un prompt de 3.908 tokens.

La licencia no está declarada en la información disponible y los idiomas soportados tampoco se detallan, aunque los ejemplos de la model card incluyen pruebas en inglés y chino. El repositorio acumula 678 descargas y 1 like, con última actualización el 24 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base Qwen3.5-4B; distribución sobre llama.cpp con kernels NPU ggml-axera) |
| Parametros totales | 4.326.350.848 |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | Hasta 16.384 tokens |
| Tipos de cuantizacion | MXFP4 (pesos `qwen3.5-4b-mxfp4.gguf`, 2,66 GB); codificador visual en BF16 |
| Idiomas soportados | No disponible (ejemplos de la model card en inglés y chino) |
| Licencia | No disponible |
| Formato de pesos | GGUF (`qwen3.5-4b-mxfp4.gguf` + `mmproj-qwen3.5-4b-bf16.gguf`) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base Qwen3.5-4B (tipo de transformer, composición del dataset, número de tokens de entrenamiento ni si hubo RLHF o DPO). Lo que sí se documenta es la capa de despliegue: una bifurcación de llama.cpp (`ZHEQIUSHUI/llama.cpp`, rama `axera-dev`, commit `6613735ce`) con kernels de NPU empaquetados en `kernels/` y un `manifest.json`, binarios estáticos en `bin/` y una plantilla de chat (`chat_template.jinja`) para el servidor compatible con OpenAI.

La innovación técnica destacable en esta distribución es la decodificación especulativa MTP (multi-token prediction), opcional y activada con `MTP=1`. Cada ronda propone 3 tokens que el modelo objetivo verifica individualmente, de modo que en decodificación greedy la salida coincide con la decodificación normal. El autor reporta tasas de aceptación variables según el contenido: 0,816 en tablas Markdown, 0,598 en traducción chino-inglés, 0,563 en matemáticas, 0,481 en código y en torno a 0,27-0,30 en texto libre (ensayo chino, relato inglés). También se documenta una caché de prompt por defecto en 4 GB de memoria host, configurable a disco mediante `CACHE_DIR`, y el uso exclusivo de los 4 núcleos de NPU.

## Capacidades

- Generación de texto conversacional y completado de texto, con ejemplos verificados en la model card ("The capital of France is" → "Paris").
- Entrada de imagen: el paquete incluye codificador visual y el autor confirma descripciones correctas de vehículos, texto en imagen y personas.
- Decodificación especulativa MTP opcional con verificación por el modelo objetivo.
- Servidor compatible con OpenAI (`run.sh -s 8080`), lo que habilita integración con clientes que hablan la API de OpenAI.
- Acepta mensajes de sistema en mitad de la conversación, lo que el autor indica que funciona con clientes de agentes como Codex.
- Modo de razonamiento (thinking) desactivado por defecto en el servidor (`--reasoning off`).
- Modo de chat interactivo por línea de comandos (`run.sh -c`).
- Idiomas: no se detalla la cobertura oficial; los ejemplos de rendimiento cubren inglés y chino.

## Casos de uso

- Inferencia de borde en dispositivos con NPU Axera AX8860: el paquete incluye binarios estáticos y kernels, por lo que se puede desplegar el modelo en el propio dispositivo sin compilar llama.cpp ni disponer de toolchain en el equipo destino.
- Asistente conversacional local con API compatible con OpenAI: arrancando `run.sh -s 8080` se expone un endpoint que cualquier cliente compatible con OpenAI puede consumir, útil para prototipos y aplicaciones internas en red local.
- Descripción de imágenes en el dispositivo: con `run.sh -i bus.jpg "Describe this image." 256` se procesa una imagen y se genera una descripción, adecuado para tareas de accesibilidad o catalogación sin enviar datos a la nube.
- Generación de código asistida con decodificación especulativa: el autor mide 84,7 tokens/s con MTP frente a 62,4 sin él en contenido de código (aceptación 0,481), lo que hace viable un asistente de código interactivo en hardware de borde.
- Traducción automática chino-inglés: con MTP se alcanzan 84,9 tokens/s frente a 60,5 (aceptación 0,598), un escenario donde la especulación rinde por encima de la media.
- Generación de tablas Markdown y documentación estructurada: es el caso con mayor aceleración medida (128,0 tokens/s, 2,05x, aceptación 0,816), apropiado para pipelines que producen informes tabulares.
- Resolución de problemas matemáticos paso a paso: 98,5 tokens/s con MTP frente a 62,6 (aceptación 0,563), útil en tutores o asistentes educativos locales.
- Integración en flujos de agentes: al aceptar mensajes de sistema intermedios y exponer API compatible, puede conectarse a clientes de agentes que requieran esa flexibilidad.

## Benchmarks y rendimiento

Los datos publicados por el autor son de rendimiento de inferencia en el AX8860, no de calidad en benchmarks académicos (MMLU, HumanEval, GSM8K). No se han publicado resultados de benchmarks de calidad en la información disponible.

| Métrica (AX8860) | Valor |
|---|---|
| Decodificación normal | 62,3 tokens/s |
| Decodificación con MTP (máximo) | 128,0 tokens/s (2,05x) |
| Prompt de 4k con MTP | 58,8 → 99,7 tokens/s (1,70x; aceptados 42/61) |
| Prefill de prompt de 4k | 5.040 tokens/s (3.908 tokens en 0,78 s) |
| Contexto máximo | 16.384 tokens |

| Contenido | Normal (tok/s) | MTP (tok/s) | Aceleración | Aceptación |
|---|---:|---:|---:|---:|
| Código | 62,4 | 84,7 | 1,36x | 0,481 |
| Traducción chino-inglés | 60,5 | 84,9 | 1,40x | 0,598 |
| Tabla Markdown | 62,5 | 128,0 | 2,05x | 0,816 |
| Matemáticas | 62,6 | 98,5 | 1,57x | 0,563 |
| Ensayo chino | 61,6 | 62,7 | 1,02x | 0,274 |
| Relato inglés | 61,2 | 63,3 | 1,03x | 0,302 |
| Código con muestreo | 61,3 | 87,4 | 1,43x | 0,481 |
| Ensayo chino con muestreo | 60,6 | 66,2 | 1,09x | 0,269 |

Mediciones con hasta 256 tokens generados por prueba, greedy salvo indicación contraria. En la reproducción con `bench.sh` (128 tokens generados) se observan 59,8-59,9 tokens/s con prompts de 3.908 tokens y contexto 8192/16384, y 58,6 tokens/s con muestreo recomendado.

## Requisitos de hardware

- NPU Axera AX8860 obligatoria, con SDK V0.5.1 o superior. El modelo no está pensado para GPU convencional en esta distribución.
- Pesos: 2,66 GB (`qwen3.5-4b-mxfp4.gguf`) más 676 MB del codificador visual BF16; el repositorio completo ocupa 4,2 GB.
- Memoria host: la caché de prompt ocupa por defecto 4 GB de RAM; se puede redirigir a SSD con `CACHE_DIR`.
- Uso de los 4 núcleos de NPU en exclusiva; el servidor se ejecuta con `-np 1`.
- Despliegue mediante los scripts incluidos: `run.sh` (texto, imagen, chat, servidor) y `bench.sh` (rendimiento). `llama-bench` funciona con `-b 4096 -ub 4096`.
- Throughput: 62,3 tokens/s en decodificación normal y hasta 128,0 tokens/s con MTP; prefill de 5.040 tokens/s.
- VRAM en GPU dedicada: no disponible (no es el objetivo de esta distribución).

## Comparativa con modelos similares

No se dispone de datos de benchmarks de calidad del modelo base Qwen3.5-4B en la información proporcionada, por lo que la comparación se limita a aspectos de despliegue y empaquetado.

| Aspecto | Qwen3.5-4B-AX8860-llama.cpp | Qwen3.5-4B (base, sin cuantizar) | Otras distribuciones GGUF de Qwen3.5-4B |
|---|---|---|---|
| Parámetros | 4.326.350.848 | 4.326.350.848 | 4.326.350.848 |
| Contexto | 16.384 tokens | No disponible en esta ficha | No disponible en esta ficha |
| Cuantización | MXFP4 + codificador visual BF16 | Pesos originales | Variable según distribuidor |
| Hardware objetivo | NPU Axera AX8860 | GPU/CPU genéricas | CPU/GPU genéricas |
| Aceleración | MTP especulativo opcional | No aplica | Depende de la implementación |
| Licencia | No disponible | No disponible | No disponible |
| Calidad (benchmarks) | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Dependencia total del hardware Axera AX8860: los binarios son estáticos y los kernels específicos, por lo que el paquete no es portable a otras NPU ni a GPU.
- Licencia no declarada en la información disponible; conviene verificar los términos del modelo base Qwen3.5-4B antes de cualquier uso comercial.
- Idiomas soportados no documentados oficialmente; los ejemplos se limitan a inglés y chino.
- El modo de razonamiento (thinking) viene desactivado por defecto en el servidor.
- MTP está desactivado por defecto; en decodificación greedy requiere `presence_penalty: 0` explícito. El autor advierte que el servidor no aplica la puerta adaptativa cuando `MTP=1` está activo.
- En algunas configuraciones se produce un error intermitente `ret = -3` en peticiones consecutivas; el autor recomienda reintentar.
- Los archivos descargados de Hugging Face no tienen permisos de ejecución; deben invocarse con `sh`.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, pero aplicables por herencia del modelo base.
- No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) que permitan validar el rendimiento cognitivo del modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AXERA-TECH/Qwen3.5-4B-AX8860-llama.cpp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Bifurcación de llama.cpp utilizada: https://github.com/ZHEQIUSHUI/llama.cpp (rama `axera-dev`, commit `6613735ce`)
