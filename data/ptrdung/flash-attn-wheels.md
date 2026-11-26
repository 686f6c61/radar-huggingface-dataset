# ptrdung/flash-attn-wheels

## Resumen

`ptrdung/flash-attn-wheels` no es un modelo de IA, sino un repositorio de distribucion de wheels precompilados de FlashAttention 2, la implementacion de atencion con IO-awareness de Tri Dao y colaboradores. El autor, `ptrdung`, publica binarios generados a partir del sdist oficial de PyPI para combinaciones de PyTorch y CUDA que no cuentan con wheel oficial, evitando al usuario tener que compilar la extension C++/CUDA desde cero. El repositorio ocupa aproximadamente 0,1 GB y se distribuye bajo licencia BSD 3-Clause, la misma de FlashAttention.

En el momento de la publicacion solo contiene una carpeta, `torch2.13.0-cu130-sm80/`, con `flash-attn` 2.8.3.post2 compilado para Python 3.12, `torch` 2.13.0+cu130 y CUDA 13.0, con codigo maquina exclusivamente para `sm_80` (compute capability 8.x). El interes practico es acotado pero real: permite usar `flash_attention_2` como backend de atencion en entornos con esa combinacion exacta de versiones, algo habitual en clusters con A100 o en estaciones con RTX 30xx/40xx que ya han migrado a CUDA 13.

Al no tratarse de un modelo, las secciones de capacidades, benchmarks y comparativa de modelos no aplican en sentido estricto; se documentan en su lugar las caracteristicas tecnicas del binario y las alternativas de despliegue equivalentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (wheels precompilados de la extension CUDA/C++ FlashAttention 2) |
| Parametros totales | No aplica |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica (depende del modelo que use el kernel) |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible |
| Licencia | BSD 3-Clause (© 2022 Tri Dao y colaboradores) |
| Formato de pesos | Wheel Python (`.whl`), `flash_attn-2.8.3.post2-cp312-cp312-linux_x86_64.whl`, con `SHA256SUMS` |

Especificaciones adicionales del binario:

| Parametro | Valor |
|---|---|
| Version de flash-attn | 2.8.3.post2 |
| Version de PyTorch requerida | 2.13.0+cu130 (exacta, sin margen) |
| Version de CUDA | 13.0 (`libcudart.so.13` via `nvidia-cuda-runtime`) |
| Version de Python | 3.12 (CPython, `cp312`) |
| Compute capability | 8.0 unicamente (`sm_80`), sin PTX |
| GPUs compatibles | A100, A10, A30, A40, L4, L40, RTX 30xx, RTX 40xx |
| GPUs no compatibles | T4, V100 (7.x), H100, B200, RTX 50xx (9.0+) |
| Plataforma | Linux x86_64, glibc >= 2.32 |
| Toolchain de compilacion | nvcc 13.0.88, gcc 13.3.0, glibc 2.39 (Ubuntu 24.04) |
| Tamano del repositorio | ~0,1 GB |

## Arquitectura y entrenamiento

No es un modelo entrenado, por lo que no hay dataset, tokens ni fases de RLHF/DPO. El contenido es una extension nativa compilada que implementa el kernel de atencion FlashAttention 2, cuya innovacion es reestructurar el calculo de `softmax(QK^T)V` en bloques que caben en SRAM, reduciendo los accesos a HBM y logrando un uso de memoria lineal en la longitud de secuencia en lugar de cuadratico. Esto habilita contextos largos con menor presion de memoria y mayor throughput que la atencion estandar de PyTorch.

El wheel se ha construido a partir del sdist oficial de PyPI sin modificaciones, con las variables `FLASH_ATTN_CUDA_ARCHS=80`, `MAX_JOBS=4` y `NVCC_THREADS=2`, y sin aislamiento de build. Al compilarse contra la ABI C++ de `torch` 2.13.0+cu130, el binario esta acoplado a esa version exacta: cualquier otra version de PyTorch provoca fallo de importacion o cuelgue en tiempo de ejecucion. El autor declara haberlo probado en una RTX 3060 (sm_86), verificando que forward y backward coinciden con PyTorch SDPA y que Qwen3-ASR entrena y transcribe con `flash_attention_2`.

## Capacidades

- Aceleracion del calculo de atencion para transformers en PyTorch mediante el backend `flash_attention_2` de Hugging Face Transformers.
- Soporte de forward y backward, por lo que sirve tanto para inferencia como para entrenamiento.
- Compatibilidad con kernels de atencion causal y no causal propios de FlashAttention 2.
- Instalacion directa via `pip install --no-deps` con URL y hash SHA-256 fijados, lo que permite reproducibilidad en pipelines.
- Verificacion de integridad mediante el fichero `SHA256SUMS` incluido en el repositorio.
- No incluye PTX: no hay compilacion JIT en tiempo de ejecucion para arquitecturas distintas de `sm_80`.

## Casos de uso

- Entrenamiento de modelos con contexto largo en clusters con A100: al estar compilado para `sm_80`, es el binario adecuado para nodos con A100 (80 GB o 40 GB) donde se quiera reducir el consumo de memoria de activaciones durante el entrenamiento de transformers.
- Fine-tuning en estaciones con RTX 30xx o 40xx: aunque el codigo es `sm_80`, la familia 8.x incluye estas GPUs, por lo que un equipo con RTX 3090 o RTX 4090 y CUDA 13 puede usar el wheel sin recompilar.
- Inferencia de modelos ASR o LLM con `attn_implementation="flash_attention_2"`: el autor valida el caso con Qwen3-ASR, de modo que sirve para cargar modelos de Hugging Face que exijan ese backend.
- Reproduccion de entornos en CI/CD: fijar la URL del wheel con su hash SHA-256 permite construir imagenes Docker deterministas con `torch==2.13.0+cu130` y `flash-attn` sin depender de compilaciones en cada build.
- Despliegue en servidores con L4 o L40: al ser tambien `sm_80`, estos aceleradores de inferencia son compatibles con el binario, util para servicios de generacion de texto con contextos de decenas de miles de tokens.
- Evitar compilaciones de 30-60 minutos: en entornos sin nvcc o con recursos limitados, instalar el wheel precompilado elimina la necesidad de toolchain CUDA completa en la imagen final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo indica una validacion funcional: en una RTX 3060 (sm_86), forward y backward coinciden numericamente con PyTorch SDPA, y Qwen3-ASR entrena y transcribe correctamente con `flash_attention_2`.

## Requisitos de hardware

- VRAM: no aplica al wheel en si; el consumo depende del modelo y de la longitud de secuencia. FlashAttention 2 reduce el uso de memoria de atencion de cuadratico a lineal respecto a la longitud de contexto.
- GPUs compatibles (compute capability 8.x): A100, A10, A30, A40, L4, L40, RTX 30xx, RTX 40xx.
- GPUs no compatibles: T4 y V100 (7.x), H100, B200 y RTX 50xx (9.0+), al no incluir PTX ni codigo para esas arquitecturas.
- Requisito de software estricto: `torch==2.13.0+cu130` y Python 3.12 sobre Linux x86_64 con glibc >= 2.32.
- Instalacion: `pip install --no-deps "https://huggingface.co/ptrdung/flash-attn-wheels/resolve/main/torch2.13.0-cu130-sm80/flash_attn-2.8.3.post2-cp312-cp312-linux_x86_64.whl#sha256=f94341ba4702eefc01cef1f5390bfaccd74326f4d17b250ed5225c60eb29bee6"`.
- Alternativas de despliegue: compilacion desde el sdist oficial de PyPI (`pip install flash-attn==2.8.3.post2`), wheels oficiales de FlashAttention cuando existan para la combinacion de versiones, o backends alternativos de atencion como PyTorch SDPA y `xformers`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Alternativa | Tipo | Versiones cubiertas | Arquitecturas GPU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ptrdung/flash-attn-wheels` | Wheel no oficial de FlashAttention 2 | flash-attn 2.8.3.post2, torch 2.13.0+cu130, Python 3.12 | sm_80 unicamente | BSD 3-Clause | Hugging Face, 0 descargas, 0 likes |
| Wheels oficiales de FlashAttention (GitHub Releases) | Wheel oficial | Matriz de versiones publicada por el proyecto | Segun release | BSD 3-Clause | GitHub, mantenido por los autores |
| Sdist de PyPI (`flash-attn`) | Codigo fuente | Cualquier combinacion con toolchain compatible | Configurable via `FLASH_ATTN_CUDA_ARCHS` | BSD 3-Clause | PyPI, requiere compilacion local |
| PyTorch SDPA | Backend nativo de PyTorch | Incluido en PyTorch | Multiples, via kernels propios | BSD 3-Clause | Incluido en PyTorch |

## Limitaciones y advertencias

- Acoplamiento estricto a `torch==2.13.0+cu130`: cualquier otra version provoca fallo de importacion o cuelgue, segun advierte el propio autor.
- Solo codigo `sm_80`, sin PTX: no funciona en T4, V100, H100, B200 ni RTX 50xx, lo que excluye buena parte del hardware actual de datacenter de gama alta.
- Solo Python 3.12 y Linux x86_64 con glibc >= 2.32; no hay builds para macOS, Windows ni otras versiones de Python.
- Build no oficial y no afiliado a los autores de FlashAttention; no hay garantia de mantenimiento, y el repositorio registra 0 descargas y 0 likes en el momento de la consulta.
- Sin benchmarks publicados: el rendimiento real frente a SDPA o `xformers` en cada GPU no esta cuantificado.
- Riesgo de cadena de suministro: instalar binarios de terceros requiere verificar el hash SHA-256 contra `SHA256SUMS` y confiar en el mantenedor del repositorio.
- La licencia BSD 3-Clause permite uso comercial, pero obliga a conservar el aviso de copyright y la lista de autores, que se incluyen en `flash_attn-*.dist-info/licenses/` dentro del wheel.
- No es un modelo: no genera texto, no soporta tool calling ni agentes, y no debe evaluarse como tal en comparativas de modelos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ptrdung/flash-attn-wheels
- Wheel directo: https://huggingface.co/ptrdung/flash-attn-wheels/resolve/main/torch2.13.0-cu130-sm80/flash_attn-2.8.3.post2-cp312-cp312-linux_x86_64.whl
- Repositorio oficial de FlashAttention: https://github.com/Dao-AILab/flash-attention
- Indice de PyTorch con CUDA 13.0: https://download.pytorch.org/whl/cu130
- Paper de FlashAttention 2: no disponible en la informacion proporcionada.
