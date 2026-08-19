# marcsun13/gguf-quantization

## Resumen

`marcsun13/gguf-quantization` no es un modelo de lenguaje, sino un paquete de kernels de cómputo diseñado para operar directamente sobre los bloques empaquetados de un checkpoint GGUF. Su objetivo es ejecutar modelos cuantizados sin necesidad de materializar una copia densa de los pesos, lo que reduce significativamente el uso de memoria y acelera la inferencia en entornos con recursos limitados. Desarrollado por el usuario marcsun13, el proyecto reutiliza el código de ggml de llama.cpp, vendido en lugar de reimplementado, y ofrece dos operaciones principales: `dequantize` y `mul_mat_vec` (gemv fusionado con dequantización).

El repositorio tiene un tamaño de 0.8 GB e incluye backends para CUDA (GPU NVIDIA, sm 7.5–12.0) y Metal (Apple Silicon), con soporte para varias versiones de PyTorch. Aunque no es un modelo en sí, es una herramienta relevante para desarrolladores que necesitan ejecutar modelos cuantizados GGUF de forma eficiente en producción, especialmente en GPUs de consumo o Macs. Su licencia MIT permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kernels de cómputo sobre GGUF (basados en ggml de llama.cpp) |
| Parametros totales | no disponible (no es un modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Soporta los tipos GGUF/ggml (no se enumeran explícitamente en la documentación) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | MIT |
| Formato de pesos | GGUF (operación directa sobre bloques empaquetados) |

## Arquitectura y entrenamiento

Este proyecto no es un modelo entrenado, sino una biblioteca de kernels. La arquitectura se basa en el código de ggml de llama.cpp, vendido en el repositorio. Los kernels se compilan para CUDA (usando las fuentes de `ggml-cuda`) y para Metal (compilando `ggml-metal.metal` en una metallib embebida). La operación `mul_mat_vec` realiza una multiplicación matriz-vector fusionada con dequantización, tomando como entrada los bloques GGUF tal como están almacenados (`out_features, bytes_per_row` uint8). Para matrices grandes, se recomienda usar `dequantize` seguido de un matmul denso.

El proceso de actualización se realiza mediante un script `vendor.py` que re-vende el código de llama.cpp a una revisión específica, y un comando `nix run .#build-and-copy` para reconstruir todas las variantes. Esto garantiza que los kernels estén sincronizados con el upstream.

## Capacidades

- Ejecución de operaciones de dequantización directamente sobre bloques GGUF empaquetados, sin materializar pesos densos.
- Multiplicación matriz-vector (gemv) fusionada con dequantización, optimizada para inferencia de modelos cuantizados.
- Soporte para backends CUDA (GPU NVIDIA con sm 7.5–12.0, es decir, Volta, Turing, Ampere, Ada y Hopper) y Metal (Apple Silicon).
- Compatibilidad con PyTorch 2.11/2.12 en CUDA y 2.12/2.13 en Metal.
- Integración con el ecosistema GGUF de llama.cpp, lo que permite usar cualquier modelo cuantizado en ese formato.

## Casos de uso

- **Inferencia eficiente en GPU de consumo**: un modelo cuantizado GGUF puede ejecutarse en una RTX 3090 o RTX 4090 usando `mul_mat_vec` sin descomprimir los pesos, reduciendo el uso de VRAM y mejorando la latencia.
- **Despliegue en Mac con Apple Silicon**: gracias al backend Metal, los desarrolladores pueden ejecutar modelos cuantizados en MacBook Pro o Mac Studio sin necesidad de GPU NVIDIA, aprovechando la memoria unificada.
- **Integración en pipelines de inferencia personalizados**: las operaciones `dequantize` y `mul_mat_vec` se pueden incorporar en código PyTorch para controlar manualmente la ejecución de capas cuantizadas, útil en investigación o en sistemas con requisitos específicos de memoria.
- **Aceleración de servidores de inferencia**: al evitar la materialización densa de pesos, se reduce el tiempo de carga y el consumo de RAM en servidores que sirven múltiples modelos cuantizados.
- **Prototipado rápido de kernels personalizados**: el código vendido de llama.cpp sirve como base para experimentar con nuevas operaciones sobre GGUF, sin necesidad de reimplementar desde cero.
- **Evaluación de rendimiento de cuantización**: los desarrolladores pueden comparar el rendimiento de diferentes tipos de cuantización GGUF usando estas operaciones de bajo nivel, midiendo latencia y throughput en su hardware específico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye mediciones de rendimiento comparativas con otras implementaciones.

## Requisitos de hardware

- **CUDA**: GPU NVIDIA con compute capability 7.5 o superior (Volta, Turing, Ampere, Ada, Hopper). Se requiere PyTorch 2.11 o 2.12 con CUDA 12.6, 12.8, 12.10 o 12.12.
- **Metal**: Apple Silicon (aarch64-darwin) con PyTorch 2.12 o 2.13.
- **VRAM**: depende del modelo cuantizado que se vaya a ejecutar; al operar sobre bloques GGUF, el consumo de memoria es menor que con pesos densos, pero no se especifican cifras exactas.
- **Opciones de despliegue**: el paquete se compila como una extensión de PyTorch (torch library) y se integra en scripts Python. No se mencionan integraciones con vLLM, Ollama o TGI.

## Comparativa con modelos similares

No disponible. Este proyecto no tiene comparación directa con modelos de IA, sino con otras bibliotecas de kernels para cuantización (como bitsandbytes o GPTQ), pero no se dispone de información suficiente para establecer una comparativa rigurosa.

## Limitaciones y advertencias

- **No es un modelo**: no genera texto ni realiza tareas de IA; es una herramienta de bajo nivel para desarrolladores.
- **Dependencia de versiones específicas**: requiere PyTorch 2.11/2.12 (CUDA) o 2.12/2.13 (Metal), lo que puede limitar su uso en entornos con versiones anteriores.
- **Soporte limitado de plataformas**: solo CUDA en Linux x86_64 y Metal en macOS ARM. No hay soporte para Windows o CPU.
- **Sin benchmarks publicados**: no hay datos de rendimiento que permitan evaluar su eficiencia frente a otras implementaciones.
- **Requiere compilación**: el usuario debe compilar los kernels para su plataforma, lo que añade complejidad al despliegue.
- **Riesgo de obsolescencia**: al depender de llama.cpp, los cambios en el upstream pueden requerir actualizaciones frecuentes.

## Enlaces

- [Repositorio en HuggingFace](https://huggingface.co/marcsun13/gguf-quantization)
- [llama.cpp (upstream de los kernels)](https://github.com/ggml-org/llama.cpp)
