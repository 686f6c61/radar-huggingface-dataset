# avgrocketman/compile-cache-v5e

## Resumen

`avgrocketman/compile-cache-v5e` no es un modelo de lenguaje, sino un repositorio de caché de compilación XLA para Google Cloud TPU v5e-1. Contiene un virtualenv de Python 3.12 con `vllm-tpu 0.32.0`, el binario `zstd` y los artefactos de compilación XLA precompilados para un modelo concreto (LFM2.5-24B-A2B), con el objetivo de eliminar el coste de *cold start* en entornos Colab con TPU. El autor es `avgrocketman` y el repositorio ocupa 2,7 GB.

El problema que resuelve es el tiempo de compilación inicial de los grafos XLA al arrancar `vllm-tpu` sobre una TPU: en lugar de recompilar en cada sesión, el usuario descarga este caché y `coldstart/download.py` restaura el entorno y los ejecutables ya compilados. Los artefactos están atados de forma estricta a una combinación exacta de chip, versión de motor, modelo, longitud de contexto, *buckets* ordenados, modo KV y conjunto de parches.

Es relevante para desarrolladores que despliegan inferencia en TPU v5e-1 en Google Cloud, ya que evita minutos de compilación por arranque. No contiene pesos de modelo: los ficheros son programas XLA compilados y un entorno de ejecución, no parámetros entrenados. La fecha de creación indicada (2026-11-06) aparece en los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo; es un caché de compilación XLA) |
| Parametros totales | no disponible (el repositorio no contiene pesos) |
| Parametros activos | no disponible |
| Longitud de contexto | 100000 tokens (según el nombre de los artefactos `len100000`) |
| Tipos de cuantizacion | no disponible para el caché; las variantes referenciadas usan configuraciones `w8a8` y `w4a16` para el modelo LFM2.5-24B-A2B |
| Idiomas soportados | no disponible |
| Licencia | no disponible a nivel de repositorio; el virtualenv incluye paquetes de código abierto bajo sus propias licencias |
| Formato de pesos | no aplica (los artefactos son `.tar` de programas XLA compilados y un `venv312_cpu.tar.zst`) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado, por lo que no hay arquitectura de red neuronal ni datos de entrenamiento asociados. El contenido son artefactos de compilación XLA generados por `vllm-tpu 0.32.0` y `tpu-inference 0.32.0` para el modelo LFM2.5-24B-A2B, con un contexto de 100000 tokens y un tamaño de lote de 16 (`b16-8192`). Las versiones fijadas dentro del virtualenv son Python 3.12, `torch 2.10.0+cpu`, `jax 0.11.2`, `jaxlib 0.11.2` y `libtpu 0.0.48`.

La innovación técnica es el empaquetado reproducible del entorno y de los ejecutables XLA con hashes SHA-256 explícitos y un mecanismo de *pin* mediante `COLDSTART_CACHE_NAME` en el TOML de configuración. El caché no tiene *fallback* a otro modelo: el hash del nombre de fichero y el pin explícito garantizan que solo se restaure el artefacto compatible con la combinación exacta de chip, motor y parámetros de compilación.

## Capacidades

- Restauración de un virtualenv Python 3.12 con `vllm-tpu`, `tpu-inference`, `jax`, `jaxlib` y `libtpu` fijados por versión.
- Distribución del binario `zstd` necesario para descomprimir el entorno.
- Caché de compilación XLA por modelo, con dos variantes activas para LFM2.5-24B-A2B: V1 (`42f6059b`) y V2 `noclip` (`0a680e5e`).
- Verificación de integridad mediante SHA-256 en los ficheros de runtime y en cada artefacto XLA.
- Organización por *namespace* de modelo (`models/<familia>/<modelo>/<version-motor>/`) y archivo de cachés obsoletos en `archive/`.
- No incluye pesos de modelo, por lo que no aporta capacidades de generación, razonamiento, código ni visión por sí mismo.

## Casos de uso

- Arranque rápido de inferencia en TPU v5e-1 en Google Colab: el usuario descarga el caché y evita la compilación XLA inicial del modelo LFM2.5-24B-A2B, reduciendo el tiempo de *cold start*.
- Despliegue reproducible de `vllm-tpu` en entornos efímeros: el virtualenv fijado por versiones garantiza que las dependencias (`torch`, `jax`, `libtpu`) coincidan exactamente con las usadas al compilar.
- Servicio de inferencia con contexto largo: los artefactos están compilados para `len100000` y lote 16, adecuados para cargas con prompts extensos en TPU v5e-1.
- Integración en pipelines de CI que validan la compatibilidad del caché: los SHA-256 permiten comprobar que los artefactos no han cambiado antes de restaurarlos.
- Archivado y auditoría de compilaciones: la carpeta `archive/` conserva cachés obsoletos (LFM y Qwen3) para trazabilidad, sin restauración automática.
- Reutilización controlada en clústeres de TPU v5e-1 homogéneos: cada chip dispone de su propio repositorio `compile-cache-<chip>`, lo que permite distribuir el mismo caché a nodos con idéntica configuración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio documenta únicamente tamaños de fichero y hashes: `venv312_cpu.tar.zst` (1.454.946.513 B), `zstd_bin` (1.022.760 B), caché V1 (196.085.760 B) y caché V2 `noclip` (199.987.200 B). No hay métricas de latencia, throughput ni calidad de inferencia asociadas a este repositorio.

## Requisitos de hardware

- Hardware objetivo: Google Cloud TPU v5e-1 (un solo chip). El autor advierte explícitamente que no debe usarse en GPU ni en TPU v6e.
- VRAM/HBM: no disponible; el repositorio no documenta requisitos de memoria del chip.
- GPU recomendadas: no aplica; el caché está compilado para TPU v5e-1 y no es portable a GPU.
- Compatibilidad con GPU de consumo: no aplica.
- Despliegue: `coldstart/download.py` con configuración TOML (`[install] repo`, `filename`, `[env] COLDSTART_CACHE_NAME`); el runtime esperado es `vllm-tpu 0.32.0` sobre Python 3.12.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Repositorio | Tipo | Hardware | Contenido | Licencia |
|---|---|---|---|---|
| `avgrocketman/compile-cache-v5e` | Caché de compilación XLA | TPU v5e-1 | venv + artefactos XLA, sin pesos | no disponible |
| `avgrocketman/tpu-compile-cache` (antiguo, solo lectura) | Caché de compilación XLA | TPU v5e-1 | cachés de nombre plano y Qwen3, redirigido | no disponible |
| Caché de `torch.compile` en Amazon EKS | Caché de compilación | GPU en EKS | artefactos `torch.compile` para modelos grandes | según documentación AWS |
| Compilación ONNX en Windows ML | Caché de compilación | CPU/NPU Windows | artefactos ONNX compilados | según documentación Microsoft |

La comparación es funcional (mecanismos de caché de compilación), no de calidad de modelo, ya que este repositorio no contiene un modelo.

## Limitaciones y advertencias

- No es un modelo: no genera texto ni aporta capacidades de inferencia por sí mismo; solo acelera el arranque de un modelo externo (LFM2.5-24B-A2B).
- Portabilidad nula: el virtualenv, los ejecutables XLA y `libtpu` están compilados para un chip y una versión de motor concretos. No funciona en GPU ni en TPU v6e.
- Sin *fallback*: un caché solo es válido para la combinación exacta de chip, versión de motor, modelo, `context_length`, *buckets* ordenados, modo KV y conjunto de parches.
- Los cachés obsoletos en `archive/` nunca se restauran automáticamente.
- Licencia del repositorio no declarada; el virtualenv incluye paquetes de código abierto bajo sus propias licencias, lo que exige revisión individual para uso comercial.
- Riesgo de alucinación y sesgos: no aplica al no contener pesos de modelo.
- El repositorio tiene 0 descargas y 0 *likes*, sin pipeline declarado ni idiomas especificados, lo que limita la evidencia de uso en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/avgrocketman/compile-cache-v5e
- Repositorio anterior (redirección de solo lectura): `avgrocketman/tpu-compile-cache`
- Documentación de compilación y caché ONNX en Windows ML: https://learn.microsoft.com/en-us/windows/ai/new-windows-ml/model-compilation
- Aceleración de carga de modelos en Amazon EKS (caché de `torch.compile`): https://docs.aws.amazon.com/eks/latest/userguide/ml-inference-fast-model-loading.html
