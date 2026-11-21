# rmonsurate/Victoria

## Resumen

Victoria es un modelo de lenguaje de pesos abiertos orientado a programación y uso como agente, desarrollado por Farpoint Technologies (Canadá) a partir de Qwen/Qwen3.8-Flash-Next. La propuesta central es una reducción de arquitectura: se eliminan el 44% de los expertos de cada capa (de 512 a 288) y el checkpoint resultante se reentrena a 4 bits con cuantización consciente del entrenamiento (QAT) para recuperar calidad. El resultado conserva 5,9B de parámetros activos por token, idénticos al modelo original, lo que mantiene el coste de decodificación.

El modelo se distribuye en dos builds que son checkpoints distintos: uno en NVFP4 para vLLM sobre GPUs NVIDIA Blackwell (B300/B200), con un cabezal de borrador (draft head) para decodificación especulativa, y otro en GGUF Q4_K_M para llama.cpp, procedente del primer release. El build NVFP4 reporta 70,0% en Terminal-Bench 2.1 (avg@3) y 97,0% en HumanEval, con 279,6 tok/s de decodificación en un solo stream sobre una B300 con el cabezal activado.

El interés actual reside en dos factores: la viabilidad de ejecutar un MoE de 125.573.716.608 parámetros totales en una sola GPU tras el recorte de expertos y la cuantización a 4 bits, y la publicación de artefactos de despliegue concretos (comando de vLLM, parches de llama.cpp, sumas SHA256) que reducen la fricción de puesta en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts), transformer; 288 expertos por capa tras el recorte |
| Parámetros totales | 125.573.716.608 (dato de safetensors) |
| Parámetros activos | 5,9B por token |
| Longitud de contexto | Hasta 262.144 tokens en las ejecuciones de Terminal-Bench con vLLM; 20.480 tokens en la configuración de referencia de decodificación; 8.192 tokens en el ejemplo de llama.cpp |
| Tipos de cuantización | NVFP4 (build vLLM) y GGUF Q4_K_M (build llama.cpp); tabla de lookup n-gram también disponible en 8 bits |
| Idiomas soportados | Inglés (en) |
| Licencia | qwen-community-1.0 (license: other) |
| Formato de pesos | safetensors (NVFP4) y GGUF (Q4_K_M, dividido en 3 shards) |

## Arquitectura y entrenamiento

Victoria parte de Qwen/Qwen3.8-Flash-Next, un transformer con mezcla de expertos. La modificación estructural consiste en recortar los expertos de 512 a 288 por capa, un 44% menos, y reentrenar el checkpoint resultante a 4 bits mediante cuantización consciente del entrenamiento. Los parámetros activos por token se mantienen en 5,9B, de modo que el recorte reduce huella de memoria y no el coste computacional por token generado. El modelo incorpora un cabezal de borrador (draft head) para decodificación especulativa, almacenado como 32 tensores adicionales en el build GGUF.

El build NVFP4 es el checkpoint más reciente; el GGUF Q4_K_M corresponde al checkpoint del primer release. Según la model card, el nuevo build empleó un 35% menos de tokens de salida que el build NVFP4 anterior (69,4M frente a 107,3M en tres ejecuciones), lo que sugiere un ajuste en el comportamiento de razonamiento y verbosidad además del recorte de expertos. No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generación de texto conversacional y razonamiento multi-paso, con parser de razonamiento `qwen3` en vLLM.
- Generación de código: 97,0% en HumanEval (159/164, una muestra por problema) en el build NVFP4 y 93,2% avg@5 en el build GGUF.
- Uso como agente de terminal y codificación: 70,0% avg@3 en Terminal-Bench 2.1 con 8 horas por tarea.
- Tool calling y function calling: soportado en vLLM mediante `--enable-auto-tool-choice` y `--tool-call-parser qwen3_coder`.
- Decodificación especulativa con cabezal MTP integrado (`--spec-type draft-mtp` en llama.cpp, `method: mtp` en vLLM).
- Soporte de caché de prefijos para sesiones de agente largas (requiere parches de vLLM en esta arquitectura).
- Capacidades multilingües: limitadas al inglés según la metadata del modelo.
- No se documentan capacidades de visión, audio ni modo thinking explícito en la información disponible.

## Casos de uso

- Agente de codificación autónomo en terminal: el modelo está evaluado específicamente en Terminal-Bench 2.1 con tareas de 8 horas, y su ventana de hasta 262.144 tokens permite mantener el estado de una sesión de depuración o refactorización prolongada sin truncar el historial de comandos y salidas.
- Asistente de CI/CD con tool calling: integrado vía vLLM con `qwen3_coder` como parser, puede invocar herramientas de build, ejecutar tests y proponer parches dentro de un pipeline, con 97,0% en HumanEval como indicador de corrección en generación de funciones.
- Autocompletado y generación de código de baja latencia: con 5,9B de parámetros activos y 279,6 tok/s en un solo stream sobre B300 con el cabezal de borrador, es adecuado para completado en editor donde el tiempo por token es crítico.
- Despliegue en una sola GPU para equipos pequeños: los 48,0 GiB de pesos del build NVFP4 más la tabla de lookup encajan en una B300 o B200, lo que permite ofrecer un servicio de agente de código sin clúster multi-GPU.
- Inferencia local en estaciones de trabajo Apple Silicon: el build GGUF Q4_K_M con llama.cpp alcanza 34,3 a 38,0 tok/s en un M3 Max de 128 GB con el cabezal activado, útil para desarrollo offline y pruebas de agentes sin coste de API.
- Procesamiento de repositorios completos: la ventana de 262.144 tokens en configuraciones de agente permite analizar módulos extensos, trazas de error y documentación en una sola pasada, reduciendo la necesidad de recuperación por fragmentos.
- Servicio conversacional técnico en inglés: con 20.480 tokens de contexto y 16 secuencias concurrentes en la configuración de referencia, puede atender soporte de desarrollo con historial multi-turno.

## Benchmarks y rendimiento

| Benchmark | Build NVFP4 | Build GGUF Q4_K_M |
|---|---|---|
| Terminal-Bench 2.1 (8 h/tarea) | 70,0% avg@3 (75,3 / 68,5 / 66,3) | 75,28% (67/89), una ejecución |
| HumanEval | 97,0% (159/164), una muestra por problema | 93,2% avg@5 |
| Terminal-Bench 2.1, build NVFP4 anterior | 62,5% en protocolo idéntico | no aplica |
| Tokens de salida en 3 ejecuciones | 69,4M (35% menos que el build anterior, 107,3M) | no disponible |

Rendimiento de decodificación del build NVFP4 en una NVIDIA B300, un stream: 279,6 tok/s con cabezal de borrador activado y 134,7 tok/s con el cabezal desactivado (factor 2,08x). En el build GGUF sobre M3 Max de 128 GB, una petición simultánea: 34,3 a 38,0 tok/s con cabezal y 26,8 a 27,8 tok/s sin él, con 70,4% de tokens borrador aceptados. No se han publicado resultados de MMLU, GSM8K ni otros benchmarks generales en la información disponible.

## Requisitos de hardware

- VRAM para el build NVFP4: 48,0 GiB de pesos más la tabla de lookup n-gram de 95,4 GiB; vLLM mantiene ambos en GPU, por lo que el requisito efectivo se aproxima a 143,4 GiB. La descarga completa son 154,0 GB.
- GPUs recomendadas para NVFP4: NVIDIA B300 o B200 (Blackwell), con `--tensor-parallel-size 1`. La configuración de referencia usa `--gpu-memory-utilization 0.80`.
- Build GGUF: 52,79 GB (49,17 GiB) de pesos residentes en llama.cpp. La descarga puede ser de 107,20 GB (tabla de lookup a 8 bits, mismo uso de VRAM en GPU) o 155,20 GB (tabla a precisión completa).
- GPU de consumo: no hay datos publicados sobre ejecución en RTX 4090 u otras consumer. El build GGUF está verificado en Apple Silicon (M3 Max, 128 GB); no se ha medido en CUDA según la model card.
- Despliegue: vLLM con imagen upstream más los parches vllm#53798 y vllm#54076 para caché de prefijos; llama.cpp con build propio (rmonsurate/llama.cpp-victoria, base b11276 más un parche para el cabezal de borrador). El llama.cpp de mainline rechaza los GGUF con error de número de tensores (espera 1256, recibe 1224).
- Throughput: 279,6 tok/s por stream en B300 con decodificación especulativa; 34,3 a 38,0 tok/s en M3 Max. No se publican cifras de throughput agregado con múltiples secuencias.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Victoria (NVFP4) | 125,6B totales, 5,9B activos | hasta 262.144 | Terminal-Bench 2.1: 70,0% avg@3; HumanEval: 97,0% | qwen-community-1.0 | Hugging Face, vLLM |
| Victoria (GGUF Q4_K_M) | 125,6B totales, 5,9B activos | 8.192 en ejemplo | Terminal-Bench 2.1: 75,28% (una ejecución); HumanEval: 93,2% avg@5 | qwen-community-1.0 | Hugging Face, llama.cpp con parche |
| Qwen/Qwen3.8-Flash-Next | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Maple | no disponible | no disponible | no disponible | no disponible | Hugging Face (rmonsurate/Maple) |

No se dispone de datos de benchmarks del modelo base Qwen3.8-Flash-Next ni de Maple en la información proporcionada, por lo que la comparación cuantitativa con alternativas de la misma categoría no está disponible.

## Limitaciones y advertencias

- El recorte del 44% de expertos implica una pérdida de capacidad respecto al modelo base; la recuperación se apoya en el reentrenamiento a 4 bits y no se documenta una comparación directa contra el original en los mismos benchmarks.
- Los dos builds son checkpoints distintos y sus puntuaciones no son intercambiables: el 75,28% del GGUF corresponde a una sola ejecución, mientras que el 70,0% del NVFP4 es una media de tres.
- El modelo solo declara inglés; no hay evidencia de calidad en castellano ni en otros idiomas.
- La licencia qwen-community-1.0 es de tipo "other": es necesario revisar el archivo LICENSE antes de cualquier uso comercial, y la atribución al modelo original es obligatoria.
- La tabla de lookup n-gram de 95,4 GiB en el build NVFP4 domina el consumo de memoria y condiciona el despliegue a GPUs de gran capacidad; no cabe en GPUs de consumo.
- El build GGUF no carga en llama.cpp de mainline: requiere un binario parcheado, lo que añade riesgo de mantenimiento y de divergencia con upstream.
- La caché de prefijos en vLLM requiere parches que, según la model card, estaban abiertos en upstream al construir el modelo; sin ellos debe desactivarse.
- La autotunerización de Triton en tiempo de compilación provoca cuelgues o arranques muy lentos; la configuración de compilación indicada es obligatoria.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones de sesgo, toxicidad ni tasas de alucinación en la información disponible.
- No se han publicado mediciones del build GGUF en CUDA, por lo que el rendimiento en GPUs NVIDIA con llama.cpp es desconocido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rmonsurate/Victoria
- Modelo Maple: https://huggingface.co/rmonsurate/Maple
- Build de llama.cpp con parche: https://huggingface.co/rmonsurate/llama.cpp-victoria
- Release de llama.cpp en GitHub: https://github.com/rmonsurate/llama.cpp/releases/tag/victoria-mtp-b11276
- Pull request vLLM #53798: https://github.com/vllm-project/vllm/pull/53798
- Pull request vLLM #54076: https://github.com/vllm-project/vllm/pull/54076
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
