# Locket-the-see-trough/nari-llama.cpp-intel-arc-sycl

## Resumen

Este repositorio no contiene un modelo de lenguaje en sentido estricto, sino un backend de inferencia: un fork de `nari-llama.cpp` que implementa un port comunitario del backend SYCL/Intel oneAPI para GPUs Intel Arc. Lo publica el usuario Locket-the-see-trough bajo licencia MIT y su objetivo es permitir ejecutar modelos cuantizados con NariQ (Trellis Coded Quantization de 1 a 6 bits) sobre hardware Intel Arc, algo que el proyecto original de Nari Labs solo cubre en CUDA y Metal.

El interés técnico está en que NariQ permite empaquetar un modelo de 27B a 3.0 bits por peso en aproximadamente 10,1 GB, lo que lo hace caber íntegramente en los 16 GB de VRAM de una Intel Arc A770 dejando margen para el contexto. El repositorio incluye los binarios precompilados para Windows, un parche de Git para compilar desde fuente y kernels SYCL nativos para el desempaquetado de teselas trellis de 16x16, transformadas de Hadamard (Sylvester y Paley, H12, H20, H68) y permutaciones gather/scatter.

La relevancia es acotada pero clara: cubre un hueco de hardware (GPUs Intel Arc de consumo) para un esquema de cuantización poco común, con verificación de precisión mediante 168 tests unitarios de referencia y una optimización propia de GEMV fusionado con Shared Local Memory para decodificación con `T <= 8`. No se trata de un modelo entrenado, por lo que muchas de las especificaciones habituales de una ficha de modelo no aplican.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (backend de inferencia SYCL/oneAPI para llama.cpp; el esquema de cuantización es Trellis Coded Quantization de 1-6 bits) |
| Parametros totales | No disponible (depende del modelo GGUF cargado; el ejemplo documentado es un modelo de 27B) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible como límite del repositorio; los ejemplos usan `-c 8192` y `-c 4096` |
| Tipos de cuantizacion | NariQ Trellis Coded Quantization de 1 a 6 bits por peso (ejemplo probado: 3.0 bpw) |
| Idiomas soportados | No disponible (heredado del modelo GGUF que se cargue) |
| Licencia | MIT |
| Formato de pesos | GGUF (el backend consume GGUF cuantizados con NariQ); distribución del repositorio en ZIP de binarios Windows y parche `.patch` |

## Arquitectura y entrenamiento

No hay entrenamiento implicado: el repositorio es un port de backend. La pieza arquitectónica relevante es la implementación SYCL de las primitivas de NariQ, que incluye kernels nativos para el desempaquetado de teselas trellis de 16x16, las transformadas de Hadamard de Sylvester y Paley (H12, H20, H68) y las permutaciones gather/scatter asociadas. La corrección se valida con la suite `test-trellis`, que según el autor pasa los 168 tests unitarios de referencia ejecutándola contra el dispositivo SYCL (`test-trellis.exe SYCL0`).

La innovación destacada es un kernel GEMV fusionado y coalescido con precarga de teselas en Shared Local Memory (SLM) para decodificación con `T <= 8`, que elimina tráfico redundante de expansión de pesos a FP32 en VRAM. Además, el backend aprovecha `GGML_SYCL_ENABLE_GRAPH=1`, que fusiona los envíos de kernels en una única lista de comandos de Level Zero para acelerar la generación. La compilación se hace con CMake y Ninja usando `icx` de oneAPI, con `-DGGML_SYCL=ON` y selección de arquitectura de dispositivo (`acm-g10` para Arc Alchemist, `bmg-g21` para Battlemage B580/B570).

## Capacidades

- Ejecución de inferencia LLM local sobre GPUs Intel Arc mediante SYCL y oneAPI, incluyendo A770, A750, A580, B580 y iGPU de Intel Core Ultra.
- Desempaquetado nativo de pesos cuantizados con NariQ Trellis Coded Quantization de 1 a 6 bits por peso.
- Implementación de transformadas de Hadamard (Sylvester y Paley: H12, H20, H68) y permutaciones gather/scatter en kernels SYCL.
- Kernel GEMV fusionado con SLM para decodificación de lote pequeño (`T <= 8`).
- Servidor web de chat (`llama-server.exe`) y CLI (`llama-cli.exe`) con soporte de Flash Attention (`-fa on`) y offload total a GPU (`-ngl 99`).
- Aceleración mediante grafos de Level Zero (`GGML_SYCL_ENABLE_GRAPH=1`).
- Distribución de binarios precompilados para Windows y compilación desde fuente mediante parche de Git.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking propias del backend; dependen del modelo GGUF cargado.

## Casos de uso

- Inferencia local de modelos de 27B en GPU de consumo Intel: con NariQ a 3.0 bpw el modelo ocupa unos 10,1 GB, por lo que entra completo en los 16 GB de una Arc A770 y deja VRAM para contexto; útil para desarrolladores que quieren ejecutar modelos grandes sin GPU NVIDIA.
- Despliegue de un chat web interno: `llama-server.exe` expone una interfaz en `http://127.0.0.1:8080` con contexto de 8192 tokens, adecuada para prototipos y uso en estación de trabajo.
- Evaluación de cuantización Trellis: el binario `test-trellis.exe` permite verificar la corrección numérica de los kernels sobre el dispositivo SYCL antes de usar el modelo en producción.
- Automatización por línea de comandos: `llama-cli.exe` con `-n 128` y prompts directos sirve para scripts de generación por lotes en Windows.
- Investigación en backends alternativos: el parche `nariq-intel-arc-sycl.patch` es un punto de partida para portar NariQ a otros dispositivos SYCL o adaptar las optimizaciones SLM.
- Aprovechamiento de iGPU en portátiles Intel Core Ultra: el backend soporta iGPU, lo que permite inferencia local sin GPU dedicada, con rendimiento no documentado en ese escenario.
- Pruebas de rendimiento comparativo de hardware: los benchmarks publicados (124,4 tok/s de prompt processing y 9,2-10,2 tok/s de generación en A770) permiten comparar Arc frente a otras plataformas.

## Benchmarks y rendimiento

Datos publicados por el autor para `Qwen3.8-27B-NariQ-3.0bpw.gguf` sobre Intel Arc A770 16 GB:

| Metrica | Valor |
|---|---|
| Prompt processing | ~124,4 tokens/s |
| Generacion de tokens (`GGML_SYCL_ENABLE_GRAPH=1`) | ~9,2-10,2 tokens/s |
| Tests de referencia `test-trellis` | 168 superados |
| VRAM ocupada por el modelo | ~10,1 GB (de 16 GB) |

No se han publicado comparaciones con otros backends o GPUs en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: ~10,1 GB para el modelo de 27B a 3.0 bpw; el resto hasta 16 GB queda para contexto y buffers.
- GPU soportadas: Intel Arc A770, A750, A580, B580, B570 e iGPU de Intel Core Ultra, con drivers gráficos Intel actualizados.
- Cabe en GPU de consumo: sí, en Arc A770 16 GB de forma holgada; en modelos de 8 GB de VRAM no se documenta.
- Software imprescindible: Intel oneAPI Base Toolkit (o DPC++/C++ Runtime) para `sycl8.dll` y bibliotecas MKL; Visual Studio 2022 con workload C++ para compilar; CMake, Ninja y Git.
- Opciones de despliegue: binarios precompilados `llama-server.exe` y `llama-cli.exe` para Windows, o compilación con `-DGGML_SYCL=ON` y `-DGGML_SYCL_DEVICE_ARCH=acm-g10` (Alchemist) o `bmg-g21` (Battlemage).
- Latencia y throughput: 9,2-10,2 tok/s de generación y 124,4 tok/s de prompt processing en A770; no hay datos para otras GPU.
- Recomendación operativa del autor: activar siempre `GGML_SYCL_ENABLE_GRAPH=1` antes de ejecutar.

## Comparativa con modelos similares

| Proyecto | Tipo | Hardware | Cuantizacion | Licencia | Estado |
|---|---|---|---|---|---|
| nari-llama.cpp (Nari Labs) | Backend original | CUDA, Metal | NariQ 1-6 bits | No disponible en la informacion | Upstream |
| nari-llama.cpp-intel-arc-sycl (este repo) | Port comunitario | Intel Arc (SYCL) | NariQ 1-6 bits | MIT | 0 descargas, 0 likes |
| llama.cpp estandar con SYCL | Backend generico | Intel Arc (SYCL) | GGUF K-quants, IQ | MIT | Ampliamente usado |

La comparación con llama.cpp estándar es la más directa en cuanto a plataforma, pero no se dispone de datos de rendimiento comparativos entre ambos en la informacion proporcionada. Frente al upstream de Nari Labs, la diferencia es la cobertura de hardware (SYCL frente a CUDA/Metal) y la optimización SLM GEMV propia.

## Limitaciones y advertencias

- No es un modelo: no tiene pesos, entrenamiento ni capacidades propias; todo depende del GGUF NariQ que se cargue.
- El repositorio tiene 0 descargas y 0 likes, con creación y última actualización el mismo día (26 de noviembre de 2026): madurez y mantenimiento no verificables.
- Solo se documentan pruebas en Windows con Intel Arc A770 16 GB; el soporte de Battlemage (B580/B570) se menciona a nivel de compilación pero no se aportan benchmarks.
- Dependencia fuerte del ecosistema oneAPI y de los drivers Intel; problemas de compatibilidad con versiones de driver o de toolkit no están cubiertos.
- El rendimiento de generación (~9-10 tok/s) es bajo para uso interactivo exigente y para aplicaciones de producción con alta concurrencia.
- El modelo de ejemplo (`Qwen3.8-27B-NariQ-3.0bpw.gguf`) se enlaza a la página genérica de Hugging Face, no a un artefacto concreto; su disponibilidad y procedencia no están verificadas.
- No hay información sobre sesgos, alucinación o idiomas, ya que son propiedades del modelo cargado y no del backend.
- Licencia MIT permite uso comercial del código, pero las licencias de los modelos GGUF que se ejecuten deben comprobarse por separado.
- No se documentan cifras de latencia, consumo energético ni estabilidad en ejecuciones prolongadas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Locket-the-see-trough/nari-llama.cpp-intel-arc-sycl
- Upstream de NariQ (Nari Labs): https://github.com/nari-labs/nari-llama.cpp
- Intel oneAPI Base Toolkit: https://www.intel.com/content/www/us/en/developer/tools/oneapi/base-toolkit.html
- Documentación de llama.cpp: https://github.com/ggml-org/llama.cpp
