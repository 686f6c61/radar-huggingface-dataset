# mitomtuna/MiMo-V2.6-Pro-MOPD-FLARE

## Resumen

MiMo-V2.6-Pro-MOPD-FLARE es un paquete de despliegue precompilado para el modelo multimodal MiMo-V2.6-Pro-MOPD, desarrollado originalmente por XiaomiMiMo y empaquetado por el usuario mitomtuna. No se trata de un modelo nuevo en sentido estricto, sino de un runtime Flare preparado para servir el modelo base con pesos cuantizados, kernels CUDA compilados y grafos de ejecución capturados, listo para producción sobre hardware NVIDIA SM120.

El paquete resuelve un problema concreto de ingeniería: servir un modelo multimodal de gran tamaño con contexto extremadamente largo (1.048.576 tokens por petición) sin depender de Python ni de compilación en tiempo de ejecución. Para ello utiliza el motor Flare, un runtime escrito en Rust de aproximadamente 150 MB, con decodificación especulativa MTP y 32 peticiones concurrentes sobre 8 GPUs.

La relevancia de esta ficha radica en que documenta un formato de despliegue atípico (no cargable por Transformers, vLLM, SGLang ni llama.cpp) y con requisitos de hardware muy específicos: 8 GPUs NVIDIA SM120 de 96 GB cada una. El repositorio ocupa 1817 GB y los pesos están cuantizados en NVFP4 para SM120, con un total de 216.076.083 parámetros declarados en los safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base MiMo-V2.6-Pro-MOPD; el paquete es un runtime Flare con kernels compilados) |
| Parametros totales | 216.076.083 |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens por peticion (chunk de prefill de 8.192) |
| Tipos de cuantizacion | NVFP4 (pesos de expertos cuantizados para SM120); etiqueta del repo: 8-bit |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (manifest/índice) + pesos por rango en `weights/tp8/rank-*` + grafos compilados en `deployments/gb202-tp8/rank-*`; formato propietario Flare |
| Vocabulario | 152.576 tokens |
| Ventana de características de visión | 32.768 tokens, hasta 8 slots, 4 parches por token |
| Resolución de imagen | 8.192–8.388.608 píxeles por imagen |
| Concurrencia | 32 peticiones sobre 8 rangos |
| Decodificación especulativa | MTP, anchuras 1 y 8 |
| Memoria por rango | ~75,8 GiB de memoria de dispositivo, 153 grafos capturados |
| Muestreo | temperatura 1 y top-p 0,95 fijos; `seed` controlable por petición |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base MiMo-V2.6-Pro-MOPD (si es transformer denso, MoE o híbrido), ni los datos de entrenamiento, número de tokens, composición del dataset o si hubo RLHF/DPO. Lo que sí se documenta es la capa de despliegue: el paquete Flare contiene pesos cuantizados por rango para tensor parallelism de 8 vías (`weights/tp8/rank-*`), kernels CUDA compilados y 153 grafos de ejecución capturados por rango en `deployments/gb202-tp8/rank-*`.

La innovación técnica destacable es el uso de decodificación especulativa MTP con anchuras 1 y 8, verificación adaptativa (`--mtp-adaptive-verification`) y una capacidad especulativa de 256 tokens con un presupuesto de 64 grafos especulativos. El motor Flare, escrito en Rust, evita por completo Python y la compilación en tiempo de ejecución, lo que reduce la latencia de arranque y el consumo de recursos del host. El paquete está firmado por el publicador de desarrollo `local-development`, lo que exige aceptar explícitamente publicadores de desarrollo para ejecutarlo.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno mediante API compatible con `/v1/chat/completions`.
- Procesamiento de imágenes (pipeline `image-text-to-text`): perfil de imagen `mimo` con ventana de características de 32.768 tokens y hasta 8 slots de características.
- Contexto extremadamente largo: 1.048.576 tokens por petición, adecuado para documentos masivos o conversaciones de muy larga duración.
- Decodificación especulativa MTP para acelerar la generación con anchuras 1 y 8.
- Servicio concurrente de hasta 32 peticiones sobre 8 rangos.
- Control de semilla por petición para reproducibilidad; el resto de parámetros de muestreo están fijados (temperatura 1, top-p 0,95).
- No se documenta soporte de tool calling, function calling, agentes o multi-step reasoning en la información disponible.
- No se documenta soporte multilingüe específico en la información disponible.

## Casos de uso

- Análisis de documentos extensos: con 1.048.576 tokens de contexto, el modelo puede ingerir libros completos, expedientes legales o bases de código de gran tamaño en una sola petición, sin necesidad de fragmentación ni recuperación externa.
- Procesamiento de imágenes en lote: la ventana de visión de 32.768 tokens y hasta 8 slots permite analizar múltiples imágenes por petición, útil para inspección visual, catalogación o moderación de contenido.
- Asistentes conversacionales de larga duración: la concurrencia de 32 peticiones y el contexto masivo permiten mantener sesiones de atención al cliente con historial extenso sin truncar.
- Inferencia de alta densidad en clúster: el despliegue sobre 8 GPUs SM120 con tensor parallelism de 8 vías y 32 peticiones concurrentes está pensado para entornos de servicio con carga sostenida, no para uso individual.
- Reproducción de investigación: el paquete incluye el comando de exportación (`ignition export`) con todos los parámetros, lo que facilita replicar el entorno exacto de serving para experimentos controlados.
- Despliegue con garantías de integridad: el firmado del paquete y la verificación mediante `--publisher-keys` permiten validar la procedencia de los pesos y grafos antes de servir, relevante en entornos con requisitos de cadena de suministro.
- Evaluación comparativa de runtimes: al no ser cargable por vLLM, SGLang o llama.cpp, sirve como referencia para medir el rendimiento del motor Flare frente a stacks convencionales en el mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: 8 GPUs NVIDIA SM120 con 96 GB cada una; ~75,8 GiB de memoria de dispositivo por rango.
- Host: x86-64 con NVIDIA Container Toolkit y acceso peer-to-peer CUDA; se recomienda que las GPUs estén detrás del mismo switch PCIe.
- Almacenamiento: el paquete completo ocupa 1817 GB; hay que presupuestar cientos de GB de disco.
- RAM del host: suficiente para las cachés de memoria bloqueada (locked memory) del motor; se recomienda `--ulimit memlock=-1:-1`.
- No cabe en GPU de consumo: requiere GPUs de centro de datos SM120 (RTX PRO 6000) de 96 GB, ocho unidades.
- Despliegue: exclusivamente mediante el motor Flare (runtime Rust, imagen Docker de ~150 MB construida desde `github.com/tunamitom/flare-local-inference`, rama `mimo-pro`, commit `5ae92f12`). No compatible con vLLM, SGLang, llama.cpp, Ollama, TGI ni Transformers.
- Latencia y throughput: no disponibles; el paquete declara 32 peticiones concurrentes y decodificación especulativa MTP, pero no se publican cifras de rendimiento.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de arquitectura del modelo base que permitan una comparación rigurosa con alternativas. A modo de referencia estructural, se indica el stack de serving:

| Aspecto | MiMo-V2.6-Pro-MOPD-FLARE | vLLM / SGLang (stack convencional) | llama.cpp |
|---|---|---|---|
| Formato de pesos | Flare propietario (safetensors + grafos) | safetensors, GGUF | GGUF |
| Contexto documentado | 1.048.576 tokens | depende del modelo | depende del modelo |
| Hardware | 8 × SM120 96 GB | variable | CPU/GPU consumo |
| Runtime | Rust, sin Python, sin compilación en runtime | Python/C++ | C++ |
| Licencia | MIT | según proyecto | MIT |

## Limitaciones y advertencias

- El paquete no es cargable por Transformers, vLLM, SGLang ni llama.cpp; queda atado al motor Flare y a su rama/commit concretos, lo que introduce riesgo de mantenimiento y dependencia de un runtime de nicho.
- Requiere hardware muy específico (8 × NVIDIA SM120 de 96 GB); no es viable en GPU de consumo ni en la mayoría de clústeres convencionales.
- El paquete está firmado por el publicador de desarrollo `local-development`; para producción debe re-firmarse con la clave de la organización. Ejecutarlo exige `--dangerously-accept-publisher local-development`, una bandera que relaja la verificación de procedencia.
- La revisión `main` contiene una variante más antigua y lenta; es obligatorio descargar `--revision gb202` para obtener los pesos y grafos más recientes.
- Parámetros de muestreo fijos (temperatura 1, top-p 0,95): no se puede ajustar la creatividad ni la diversidad de forma estándar, solo la semilla.
- No se documentan sesgos conocidos, tasas de alucinación ni idiomas soportados del modelo base; debe evaluarse empíricamente antes de usarlo en producción.
- El repositorio tiene 0 descargas y 0 likes, y el autor es un particular; no hay evidencia de validación comunitaria del paquete.
- Licencia MIT declarada, lo que en principio permite uso comercial, pero conviene verificar la licencia del modelo base MiMo-V2.6-Pro-MOPD de forma independiente, ya que la información disponible no la detalla.
- El tamaño del repo (1817 GB) y la necesidad de memoria bloqueada en el host complican el despliegue en entornos con recursos limitados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mitomtuna/MiMo-V2.6-Pro-MOPD-FLARE
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Pro-MOPD
- Motor Flare (runtime): https://github.com/tunamitom/flare-local-inference
- No se han encontrado papers, blogs ni demos adicionales en la información disponible.
