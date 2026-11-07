# AXERA-TECH/Qwen3.5-9B-AX8860-llama.cpp

## Resumen

Qwen3.5-9B-AX8860-llama.cpp es un paquete de despliegue publicado por AXERA-TECH que permite ejecutar el modelo Qwen3.5-9B sobre la NPU del chip Axera AX8860 mediante una bifurcación de llama.cpp adaptada al backend ggml-axera. No se trata de un modelo entrenado por AXERA, sino de una distribución de pesos en formato GGUF (cuantización mxfp4) acompañada de binarios estáticos, kernels de NPU y scripts de ejecución para el hardware mencionado.

El modelo subyacente, Qwen3.5-9B, cuenta con 9.197.093.888 parámetros según los metadatos del repositorio y admite entradas de texto e imagen, con una ventana de contexto de hasta 262.144 tokens. El paquete incluye un codificador visual independiente en bf16 (921 MB) y los pesos principales en mxfp4 (6,00 GB), lo que reduce el espacio en disco y la huella de memoria frente a una versión en bf16.

Su relevancia radica en que demuestra la viabilidad de servir un modelo multimodal de casi 9B parámetros con contexto largo en un SoC con NPU de borde, con un rendimiento medido de 43,4 tokens/s en decodificación y unos 2.903 tokens/s de prefill para prompts de 4k, además de una API compatible con OpenAI. Es un artefacto orientado a integradores de hardware Axera, no a un uso genérico en GPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.5; despliegue sobre llama.cpp + ggml-axera) |
| Parámetros totales | 9.197.093.888 |
| Parámetros activos | no disponible |
| Longitud de contexto | hasta 262.144 tokens |
| Tipos de cuantización | mxfp4 (pesos principales, 6,00 GB); bf16 (codificador visual, 921 MB) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (`qwen3.5-9b-mxfp4.gguf`, `mmproj-qwen3.5-9b-bf16.gguf`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Qwen3.5-9B ni su proceso de entrenamiento: no se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. Lo que sí se documenta es el stack de despliegue: una bifurcación de llama.cpp (`ZHEQIUSHUI/llama.cpp`, rama `axera-dev`) que incorpora el backend ggml-axera y kernels específicos de NPU (`ZHEQIUSHUI/ax-dsl-kernels`, directorio `models/qwen35_9b`).

El paquete incluye binarios estáticamente enlazados para el SoC AX8860, un manifiesto de kernels (`manifest.json`), una plantilla de chat en Jinja y scripts de arranque. El servidor emplea por defecto los parámetros de muestreo recomendados por la model card original; la generación de texto y la descripción de imágenes usan decodificación greedy. El razonamiento (thinking) está desactivado por defecto (`--reasoning off`) y el servicio ocupa los cuatro núcleos de NPU con `-np 1`.

## Capacidades

- Generación de texto conversacional en formato chat multi-turno, con plantilla Jinja incluida.
- Entrada de imágenes: el codificador visual en bf16 permite describir escenas, vehículos, texto en imagen y personas (según los ejemplos de corrección del autor).
- Contexto largo de hasta 262.144 tokens, con caché de prompt configurable (4 GB en memoria de host por defecto, o directorio en SSD mediante `CACHE_DIR`).
- Servidor compatible con la API de OpenAI (`-s 8080`), lo que facilita la integración con clientes existentes.
- Aceptación de mensajes de sistema en mitad de la conversación, lo que habilita clientes de agentes como Codex.
- Modo de razonamiento disponible pero desactivado por defecto; se puede reactivar vía configuración del servidor.
- Inferencia en NPU de borde sin GPU dedicada, con soporte de `llama-bench` (`-b 4096 -ub 4096`).

## Casos de uso

- Asistentes conversacionales en dispositivos de borde: el paquete permite servir un chat multi-turno con API compatible con OpenAI directamente sobre un AX8860, sin depender de la nube, con 43,4 tokens/s de decodificación.
- Descripción de imágenes en sistemas de vigilancia o inspección: el codificador visual integrado procesa imágenes y genera descripciones en lenguaje natural, adecuado para cámaras conectadas a un SoC Axera.
- Procesamiento de documentos largos: con 262.144 tokens de contexto se pueden analizar manuales, contratos o expedientes completos en una sola pasada, manteniendo la caché de prompt en SSD entre reinicios.
- Agentes automatizados con tool calling: la compatibilidad con mensajes de sistema intermedios y el formato de chat permiten integrar el modelo en clientes de agentes que orquestan llamadas a herramientas.
- Transcripción y descripción de texto en imagen (OCR asistido): los ejemplos del autor incluyen lectura de texto en fotografías, útil en logística o control de calidad.
- Prototipado y validación de producto en hardware Axera: los scripts `run.sh`, `bench.sh` y los binarios precompilados permiten reproducir el rendimiento y validar latencias antes de integrar el modelo en un producto final.
- Despliegue en entornos con restricciones de conectividad o privacidad: al ejecutarse íntegramente en el dispositivo, los datos no salen del equipo.

## Benchmarks y rendimiento

Los únicos datos publicados son mediciones de rendimiento del autor sobre el AX8860 (generación de 128 tokens), no benchmarks de calidad del modelo.

| Prompt | `-c` | Tiempo de prompt | Decodificación (tokens/s) |
|---|---:|---:|---:|
| 5 tokens | 8192 | 0,13 s | 43,4 |
| 47 tokens | 8192 | 0,13 s | 43,5 |
| 3908 tokens | 8192 | 1,35 s | 41,8 |
| 3908 tokens | 262144 | 1,34 s | 42,0 |
| 3908 tokens (muestreo recomendado) | 8192 | 1,34 s | 41,6 |

Datos adicionales: prefill de 4k a 2.903 tokens/s; perplejidad en chino sobre un conjunto interno de 20,76 (prefill) y 20,87 (decodificación token a token, `-b 1`, `-c 512 --chunks 2`). No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Hardware obligatorio: SoC Axera AX8860 con SDK V0.5.1 o superior; el paquete no funciona en GPU convencionales ni en CPU genéricas.
- Memoria: los pesos mxfp4 ocupan 6,00 GB y el codificador visual 921 MB; el servicio reserva además 4 GB de memoria de host para la caché de prompt (ampliable a SSD con `CACHE_DIR`).
- NPU: el runtime ocupa los cuatro núcleos de NPU de forma exclusiva; el servidor se ejecuta con `-np 1`.
- Despliegue: scripts `run.sh` (texto, imagen, chat, servidor), `bench.sh` para reproducir métricas y binarios estáticos incluidos en `bin/`.
- Throughput medido: 43,4 tokens/s de decodificación y 2.903 tokens/s de prefill con prompts de 4k.
- No cabe en GPU de consumo: el paquete está compilado exclusivamente para el backend ggml-axera del AX8860.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-AX8860-llama.cpp | 9,20B | 262.144 | texto + imagen | no disponible | GGUF + binarios para AX8860 |
| Qwen3.5-9B (modelo base) | 9,20B | no disponible en esta ficha | no disponible en esta ficha | no disponible | no disponible |
| Alternativas de ~9B en GGUF para llama.cpp | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada; la comparativa con alternativas de la misma categoría queda como no disponible.

## Limitaciones y advertencias

- Dependencia total del hardware Axera AX8860 con SDK V0.5.1 o superior; no es portable a otros aceleradores ni a GPU de consumo.
- Licencia no especificada en el repositorio: no se puede confirmar el uso comercial sin consultar la licencia del modelo base Qwen3.5 y la del stack llama.cpp/ggml-axera.
- Idiomas soportados no documentados; la única métrica de calidad publicada es una perplejidad en chino sobre un conjunto interno no público.
- No hay benchmarks de calidad (razonamiento, código, matemáticas) que permitan evaluar el modelo frente a alternativas.
- El autor reporta fallos intermitentes `ret = -3` en peticiones consecutivas que requieren reintento, lo que afecta a la fiabilidad en producción.
- El razonamiento está desactivado por defecto en el servidor; si se necesita thinking mode hay que configurarlo explícitamente.
- La caché de prompt por defecto vive en 4 GB de memoria de host; sin `CACHE_DIR` en SSD se pierde al reiniciar.
- Riesgo de alucinación y sesgos del modelo base no evaluado en esta distribución; la decodificación greedy en descripción de imágenes puede producir respuestas repetitivas.
- El contexto de 262.144 tokens está soportado por el runtime, pero no se documenta la degradación de calidad a longitudes extremas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AXERA-TECH/Qwen3.5-9B-AX8860-llama.cpp
- README: https://huggingface.co/AXERA-TECH/Qwen3.5-9B-AX8860-llama.cpp/blob/main/README.md
- Árbol de ficheros: https://huggingface.co/AXERA-TECH/Qwen3.5-9B-AX8860-llama.cpp/tree/main
- llama.cpp adaptado (rama `axera-dev`): https://github.com/ZHEQIUSHUI/llama.cpp
- Kernels de NPU: https://github.com/ZHEQIUSHUI/ax-dsl-kernels
