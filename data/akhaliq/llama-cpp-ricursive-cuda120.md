# akhaliq/llama-cpp-ricursive-cuda120

## Resumen

Este repositorio no contiene un modelo de lenguaje en sí, sino un conjunto de binarios precompilados de llama.cpp con soporte para la arquitectura `ricursive`, la empleada por el modelo [ricursiveAI/Ripple-65B-Preview](https://huggingface.co/ricursiveAI/Ripple-65B-Preview). El autor, akhaliq, publica estos artefactos como solución provisional mientras el soporte de dicha arquitectura no se integra en el repositorio upstream de llama.cpp (PR #31692). Los binarios se compilan a partir del commit `9e2a04a` de llama.cpp más el parche `ricursive-port.patch` de AtomicChat, con CUDA 12.8 dirigido exclusivamente a sm_120 (RTX PRO 6000 Blackwell).

El interés práctico del repositorio radica en que permite ejecutar modelos Ripple-65B en formato GGUF sobre GPU Blackwell sin necesidad de compilar llama.cpp manualmente. Incluye tanto un servidor (`llama-server`) con sus bibliotecas compartidas como un wheel de `llama-cpp-python` 0.3.36 con el mismo parche aplicado, lo que facilita su integración en aplicaciones Python.

El tamaño del repositorio es de 1.0 GB, la licencia declarada es MIT y no se especifican idiomas soportados ni pipeline. No se han publicado resultados de benchmarks ni especificaciones del modelo subyacente en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Binarios de llama.cpp con parche para la arquitectura `ricursive` (modelo Ripple-65B-Preview) |
| Parametros totales | no disponible (el modelo referenciado se denomina Ripple-65B, sin desglose confirmado) |
| Parametros activos | no disponible |
| Longitud de contexto | 65536 tokens segun el ejemplo de uso del autor (`-c 65536`) |
| Tipos de cuantizacion | BF16, Q8_0, Q4_K_M (AtomicChat); Q8_0, Q6_K_XL, Q6_K (prometheusAIR) |
| Idiomas soportados | no disponible |
| Licencia | MIT (binarios); pesos GGUF Apache-2.0 via Ricursive |
| Formato de pesos | GGUF (los binarios distribuidos son `.tar.gz` y `.whl`) |

## Arquitectura y entrenamiento

El repositorio distribuye artefactos de inferencia, no pesos ni detalles de entrenamiento. Los binarios se construyen desde llama.cpp en el commit `9e2a04a` con el parche `ricursive-port.patch` de AtomicChat, compilados con CUDA 12.8 y `CMAKE_CUDA_ARCHITECTURES` limitado a sm_120 (Blackwell). El backend CPU incluye variantes con despacho en tiempo de ejecución. El script `build.sh` incluido permite reproducir la compilación en un contenedor `nvidia/cuda:12.8.1-devel-ubuntu22.04`.

No se dispone de información sobre la arquitectura interna del modelo Ripple-65B (transformer, MoE, SSM u híbrida), el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Cualquier afirmación al respecto sería especulativa.

## Capacidades

- Ejecución de modelos con arquitectura `ricursive` en formato GGUF mediante `llama-server` y `llama-cpp-python`.
- Servidor HTTP compatible con la API de llama.cpp, incluyendo soporte de plantillas Jinja (`--jinja`).
- Carga de modelos cuantizados en BF16, Q8_0, Q6_K, Q6_K_XL y Q4_K_M según los repositorios de GGUF compatibles.
- Offload completo de capas a GPU mediante `-ngl all`.
- Contexto configurable hasta 65536 tokens en el ejemplo proporcionado.
- Integración en Python a través del wheel `llama_cpp_python-0.3.36+cu128.ricursive`.
- Las capacidades concretas del modelo subyacente (razonamiento, código, tool calling, multilingüismo) no están documentadas en la información disponible.

## Casos de uso

- Despliegue de Ripple-65B en estaciones con GPU Blackwell: el binario `llama-server` permite levantar un endpoint HTTP sin compilar llama.cpp, útil para pruebas internas en hardware RTX PRO 6000.
- Integración en pipelines Python: el wheel de `llama-cpp-python` parcheado permite invocar el modelo desde scripts o servicios Python existentes sin cambiar de framework.
- Evaluación comparativa de la arquitectura `ricursive`: al ser un port provisional, facilita medir el rendimiento de Ripple-65B frente a modelos equivalentes antes de que el soporte llegue a upstream.
- Reproducción de builds: `build.sh` permite regenerar los binarios en un contenedor CUDA 12.8.1, útil para auditoría o para adaptar la compilación a otras arquitecturas sm.
- Prototipado de aplicaciones con contexto largo: el ejemplo con `-c 65536` sirve para validar flujos que requieran ventanas extensas sobre GGUF cuantizados.
- Backend de demos en Spaces: el Space `akhaliq/ripple-65b-zerogpu` descarga estos binarios al arrancar, lo que ilustra su uso como dependencia de despliegue en entornos gestionados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- GPU: exclusivamente Blackwell sm_120 (RTX PRO 6000 Blackwell) en los binarios distribuidos; otras tarjetas requieren recompilar con `CMAKE_CUDA_ARCHITECTURES` distinto.
- VRAM estimada: no disponible de forma oficial; para un modelo de 65B, BF16 requeriría del orden de 130 GB y Q4_K_M alrededor de 35-40 GB, pero son estimaciones genéricas no confirmadas por el autor.
- No cabe en GPU de consumo convencionales (RTX 4090, 3090) ni con cuantización Q4_K_M según el tamaño nominal del modelo, salvo verificación empírica.
- Sistema operativo: Linux x86_64 con glibc (compilado sobre Ubuntu 22.04).
- Despliegue: `llama-server` (binario incluido), `llama-cpp-python` (wheel incluido). No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Aspecto | Este repositorio (llama.cpp + ricursive) | llama.cpp upstream | vLLM |
|---|---|---|---|
| Función | Binarios de inferencia parcheados para `ricursive` | Motor de inferencia GGUF general | Servidor de inferencia de alto throughput |
| Soporte Ripple-65B | Sí (port provisional) | No (PR #31692 pendiente) | no disponible |
| GPU soportadas | Solo sm_120 (Blackwell) | Múltiples arquitecturas CUDA | Múltiples arquitecturas CUDA |
| Licencia | MIT | MIT | Apache-2.0 |
| Madurez | Stopgap, mantenido por un tercero | Proyecto oficial | Proyecto oficial |

## Limitaciones y advertencias

- Los binarios solo funcionan en GPU Blackwell sm_120; en cualquier otra tarjeta es necesario recompilar.
- Se trata de una solución provisional: el autor recomienda migrar a las releases oficiales de llama.cpp cuando se fusione el PR #31692.
- El parche sigue el port de AtomicChat; prometheusAIR publica su propio parche, y aunque ambos cargan los mismos GGUF según la model card, pueden existir diferencias de comportamiento.
- Solo se distribuye para Linux x86_64 con glibc; no hay builds para macOS ni Windows.
- No se documentan sesgos, riesgo de alucinación ni limitaciones idiomáticas del modelo subyacente.
- La licencia MIT cubre los binarios; los pesos GGUF son Apache-2.0 vía Ricursive, por lo que el uso comercial debe atenerse a esa licencia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria conocida.
- No hay benchmarks publicados que permitan avalar el rendimiento del port.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/akhaliq/llama-cpp-ricursive-cuda120
- Modelo Ripple-65B-Preview: https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- GGUF de AtomicChat: https://huggingface.co/AtomicChat/Ripple-65B-Preview-GGUF
- GGUF de prometheusAIR: https://huggingface.co/prometheusAIR/Ripple-65B-Preview-GGUF
- Space de demostración: https://huggingface.co/spaces/akhaliq/ripple-65b-zerogpu
- PR de llama.cpp: https://github.com/ggml-org/llama.cpp/pull/31692
- Commit base: https://github.com/ggml-org/llama.cpp/commit/9e2a04a439edc49f08c5acdafefae19dfa25a658
- ML Intern: https://hf.co/chat?mode=ml-intern
