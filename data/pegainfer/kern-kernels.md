# Pegainfer/kern-kernels

## Resumen

Pegainfer/kern-kernels no es un modelo de lenguaje, sino un repositorio de artefactos binarios (blob store) asociado al registro de kernels del proyecto kern, publicado por el usuario Pegainfer en Hugging Face. El repositorio almacena cada artefacto que un manifiesto de kern puede fijar como `blobs/<sha256>`, sin extensión ni nombre adicional; el hash SHA-256 actúa como identidad única y el runtime de kern lo descarga una sola vez en `~/.cache/kern/blobs/<sha256>`. El tamaño del repositorio es de 0,1 GB.

El propósito del repositorio es servir como distribución reproducible y offline de kernels compilados para el runtime kern. La estructura de directorios replica exactamente el layout de caché del runtime, de modo que una copia de `blobs/` constituye una distribución completa sin conexión. Los metadatos de cada blob (familia, entradas, geometría de lanzamiento, procedencia, licencia y el informe de benchmark que justifica cada elección) no se documentan aquí, sino en los ficheros `kernel_index/<family>.toml` del repositorio de GitHub del proyecto.

Es relevante ahora porque el ecosistema de inferencia de modelos grandes depende cada vez más de kernels especializados (atención, decodificación MLA, MoE) empaquetados y versionados de forma determinista. Este repositorio ejemplifica un patrón de distribución de kernels con integridad criptográfica, aunque no contiene pesos de modelo, tokenizador ni configuración de arquitectura, por lo que no puede utilizarse como modelo generativo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de kernels, no es un modelo) |
| Parámetros totales | no disponible (no aplica) |
| Parámetros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible como licencia única; los artefactos de terceros se redistribuyen bajo sus propias licencias (Apache-2.0, BSD-3-Clause, MIT) |
| Formato de pesos | blobs binarios sin extensión, identificados por SHA-256 (`blobs/<sha256>`) |

## Arquitectura y entrenamiento

No aplica en el sentido habitual: el repositorio no contiene un modelo entrenado ni una arquitectura de red neuronal definida en su model card. Su contenido son artefactos de kernels compilados para distintas familias de operaciones, referenciados por hash. Según la model card, entre los artefactos redistribuidos figuran kernels trtllm-gen (NVIDIA TensorRT-LLM / FlashInfer `flashinfer-cubin`, Apache-2.0), CuTe-DSL MLA decode (NVIDIA, distribuido en FlashInfer, BSD-3-Clause), FlashKDA (MoonshotAI, MIT), DeepGEMM MegaMoE (DeepSeek, MIT) y kernels propios de kern (Apache-2.0).

No se dispone de información sobre datos de entrenamiento, número de tokens, composición del dataset ni técnicas de alineación (RLHF/DPO), porque no existe un proceso de entrenamiento asociado. La innovación técnica del repositorio es operativa: identidad por contenido (SHA-256), inmutabilidad de los blobs (nunca se eliminan) y un layout de almacenamiento que coincide con la caché del runtime, lo que permite distribuciones offline verificables. La geometría de lanzamiento y los informes de benchmark de cada kernel se documentan en `kernel_index/<family>.toml` del repositorio de GitHub, no en esta model card.

## Capacidades

- Distribución de kernels compilados para el runtime kern, organizados por familia de operación.
- Resolución de artefactos por identidad criptográfica: un manifiesto referencia `hf:Pegainfer/kern-kernels/blobs/<sha256>`.
- Caché local determinista en `~/.cache/kern/blobs/<sha256>`, con descarga única por artefacto.
- Distribución offline completa: una copia de `blobs/` es suficiente para operar sin red.
- Redistribución de kernels de terceros con sus textos de licencia en `licenses/` y como blobs referenciados por el índice.
- Inmutabilidad y no eliminación de blobs, lo que garantiza reproducibilidad a largo plazo.
- No incluye generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni capacidades multilingües.

## Casos de uso

- Despliegue offline de inferencia con kern: copiar `blobs/` a una máquina sin acceso a Internet y apuntar el runtime a esa caché, garantizando que los kernels usados coinciden exactamente con los fijados en el manifiesto.
- Reproducibilidad de experimentos: fijar los hashes SHA-256 de los kernels en el manifiesto para que dos ejecuciones en momentos distintos utilicen exactamente los mismos binarios.
- Auditoría de cadena de suministro: verificar la procedencia de cada kernel (trtllm-gen, CuTe-DSL MLA decode, FlashKDA, DeepGEMM MegaMoE) y su licencia asociada antes de integrarlo en un producto.
- Distribución en clústeres aislados: servir el repositorio como espejo interno y poblar la caché de los nodos de cómputo de forma controlada.
- Integración en pipelines de CI: descargar los blobs fijados por hash durante la construcción de imágenes de contenedor para evitar variaciones entre builds.
- Selección de kernels por familia: consultar `kernel_index/<family>.toml` para decidir qué variante de kernel (geometría de lanzamiento, procedencia) se fija en cada entorno según los informes de benchmark del proyecto.
- Sustitución de dependencias dinámicas: eliminar la dependencia de descargas en tiempo de ejecución desde repositorios de terceros, usando este blob store como origen único.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que los informes de benchmark que justifican cada elección de kernel se registran en `kernel_index/<family>.toml` del repositorio de GitHub del proyecto kern, no en este repositorio de Hugging Face.

## Requisitos de hardware

- VRAM: no aplica; el repositorio no contiene pesos de modelo. El consumo de VRAM dependerá del modelo que se ejecute con los kernels.
- GPU compatibles: los kernels listados (trtllm-gen, CuTe-DSL MLA decode, FlashKDA, DeepGEMM MegaMoE) están orientados a aceleradores NVIDIA, aunque la model card no detalla arquitecturas mínimas (por ejemplo, sm_90 o sm_100). Dato no disponible.
- GPU de consumo: no disponible; no se especifica compatibilidad con RTX 4090 u otras tarjetas consumer.
- Despliegue: runtime kern, que descarga los blobs a `~/.cache/kern/blobs/<sha256>`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible; dependen del kernel concreto y del hardware, y los datos se encuentran en los informes de benchmark del repositorio de GitHub.
- Almacenamiento: 0,1 GB para el repositorio completo, según los metadatos de Hugging Face.

## Comparativa con modelos similares

| Repositorio | Tipo de contenido | Identidad de artefactos | Licencia | Distribución offline |
|---|---|---|---|---|
| Pegainfer/kern-kernels | Blob store de kernels para kern | SHA-256 por blob | Mixta según artefacto (Apache-2.0, BSD-3-Clause, MIT) | Sí, copia de `blobs/` |
| FlashInfer `flashinfer-cubin` | Cubins precompilados de kernels de atención | No disponible en la información proporcionada | Apache-2.0 (según la model card) | No disponible en la información proporcionada |
| DeepGEMM | Librería de kernels GEMM/MoE de DeepSeek | No disponible en la información proporcionada | MIT (según la model card) | No disponible en la información proporcionada |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni dispone de ventana de contexto. Cualquier uso como modelo generativo es inválido.
- La licencia del repositorio como conjunto no está declarada; solo se indican las licencias de los artefactos de terceros. Es necesario revisar `licenses/` y el índice antes de un uso comercial.
- Los blobs son inmutables y nunca se eliminan, lo que puede complicar la retirada de artefactos con problemas de seguridad o legales.
- La trazabilidad depende de ficheros externos al repositorio (`kernel_index/<family>.toml` en GitHub); sin acceso a ellos no es posible conocer la geometría de lanzamiento ni la procedencia de un blob concreto.
- No se especifican arquitecturas GPU soportadas ni versiones mínimas de CUDA/driver, lo que supone un riesgo de incompatibilidad en producción.
- No hay información sobre sesgos ni alucinación porque no hay modelo; el riesgo relevante es de integridad y compatibilidad binaria.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica una adopción muy limitada y escasa validación externa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Pegainfer/kern-kernels
- Índice de kernels del proyecto kern: https://github.com/pegainfer-project/kern/tree/master/kernel_index
- Documentación del registro de kern: `docs/registry.md` en el repositorio de GitHub del proyecto kern (ruta citada en la model card; no se proporciona URL directa)
