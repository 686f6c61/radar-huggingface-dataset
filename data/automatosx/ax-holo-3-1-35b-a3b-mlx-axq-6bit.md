# AutomatosX/AX-Holo-3.1-35B-A3B-MLX-AXQ-6bit

## Resumen

AX-Holo-3.1-35B-A3B-MLX-AXQ-6bit es un checkpoint cuantizado en formato MLX para Apple Silicon, desarrollado por AutomatosX a partir del modelo base Hcompany/Holo-3.1-35B-A3B. Se trata de un modelo de arquitectura Qwen3.5 MoE (mixture of experts) con 35,11 mil millones de parámetros lógicos y aproximadamente 3 mil millones de parámetros activos (sufijo A3B), orientado a generación de texto con capacidades de visión integradas.

La conversión utiliza AXQuant (AXQ) 1.8.1, un cuantizador de precisión mixta que asigna diferentes niveles de bits por tensor según prioridades de arquitectura. El paquete nominado como "6bit" mantiene un presupuesto de almacenamiento de aproximadamente 6 BPW, aunque la medición real del modelo principal alcanza 7,5077 BPW debido a la protección de tensores críticos. La torre de visión se conserva íntegramente en BF16 como sidecar separado.

Es importante señalar que este lanzamiento se declara explícitamente como evidencia de desarrollo, no como release certificado de AXQuant. No se publican métricas de calidad, velocidad de kernels ni validación de contexto largo. El modelo está pensado para inferencia local en hardware Apple Silicon mediante MLX-LM, con licencia Apache 2.0 que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5MoeForConditionalGeneration (mixture of experts) |
| Parametros totales | 35,11B logicos (segun model card); la metadata de safetensors reporta 8.013.327.488, posiblemente contando solo un subconjunto de tensores |
| Parametros activos | ~3B (sufijo A3B) |
| Longitud de contexto | 262.144 tokens configurados; el limite practico depende de la memoria unificada disponible |
| Tipos de cuantizacion | AXQuant mixto: 6bit (95,77%), 8bit (1,51%), BF16 (2,72%); grupo de 64; metodos affine y bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX Safetensors (no incluye PyTorch ni GGUF) |

## Arquitectura y entrenamiento

El modelo base Hcompany/Holo-3.1-35B-A3B pertenece a la familia de producto `qwen3.5-moe` y utiliza la arquitectura Qwen3_5MoeForConditionalGeneration, un transformer de mezcla de expertos donde solo se activa un subconjunto de parámetros por token (aproximadamente 3B activos de 35,11B totales). El checkpoint cuantizado preserva la torre de visión en BF16 como sidecar independiente de 333 tensores y 446,57M de parámetros (0,89 GB), mientras que la ruta de texto se optimiza con precisión mixta.

La cuantización AXQuant 1.8.1 se aplicó sin calibración: la asignación de precisión por tensor se basa en prioridades de arquitectura (`architecture_prior`), no en datos de calibración. Se registraron 471 conversiones de módulos exitosas sin fallbacks. El modelo no incluye MTP (multi-token prediction) y no se ha establecido ejecución nativa con AX Engine, ya que no se incluye un manifest nativo validado. La compatibilidad con MLX-LM cubre inferencia estándar de texto/backbone, pero el runtime puede ignorar los metadatos de AXQuant y los sidecars opcionales.

## Capacidades

- Generación de texto conversacional y completado de secuencias con arquitectura MoE.
- Capacidades de visión: la torre de visión se conserva en BF16, aunque la calidad de visión-lenguaje no ha sido evaluada ni reclamada por el autor.
- Inferencia en Apple Silicon mediante MLX-LM, aprovechando la memoria unificada.
- Cuantización de precisión mixta con protección de tensores críticos a mayor precisión.
- Sin soporte de audio (no presente en el checkpoint).
- Sin MTP (multi-token prediction) incluido.
- No se documenta soporte explícito de tool calling ni function calling en la información disponible.
- No se documentan capacidades de razonamiento multi-paso específicas más allá de las inherentes al modelo base.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el formato MLX y la cuantización AXQ permiten ejecutar un modelo de 35B lógicos en equipos con memoria unificada suficiente, sin necesidad de GPU NVIDIA ni servidores en la nube.
- Prototipado de aplicaciones de chat y asistentes conversacionales: con MLX-LM se puede generar texto de forma interactiva desde línea de comandos o integrarse en aplicaciones Python.
- Experimentación con cuantización de precisión mixta: el checkpoint sirve como referencia para estudiar el impacto de asignar 6bit, 8bit y BF16 por tensor en modelos MoE, especialmente en la ruta de texto.
- Evaluación de modelos MoE cuantizados en hardware Apple: permite medir throughput, latencia y uso de memoria de un modelo con 3B activos en entornos de memoria unificada.
- Desarrollo de pipelines de visión-lenguaje: la torre de visión BF16 está disponible como sidecar, aunque su calidad no está validada; puede usarse para pruebas exploratorias.
- Despliegue en entornos con restricciones de hardware: al ser Apache 2.0 y no requerir GPUs propietarias, es viable para entornos corporativos que ya usan infraestructura Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se publican metricas de calidad frente a BF16 o baselines uniformes, ni evidencia de velocidad de kernels, ni validacion de calidad de contexto largo. El unico dato de rendimiento disponible es el BPW medido de 7,5077 para el modelo principal.

## Requisitos de hardware

- VRAM estimada: no disponible directamente; el peso de safetensors es de 32,95 GB, por lo que se requiere al menos esa cantidad de memoria unificada disponible, mas overhead de runtime.
- GPU recomendadas: Apple Silicon (cualquier chip con suficiente memoria unificada; el modelo esta disenado exclusivamente para el ecosistema MLX).
- No cabe en GPUs consumer convencionales (RTX 4090, etc.) porque el formato es MLX, no CUDA; requiere hardware Apple.
- Opciones de despliegue: MLX-LM como runtime principal; AX Engine no establecido (no se incluye manifest nativo validado).
- Latencia y throughput: no disponibles; no se publican mediciones de velocidad de kernels.
- Espacio en disco: al menos 32,97 GB para la descarga completa.
- Se recomienda fijar el commit de Hub en despliegues reproducibles en lugar de depender de `main`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| AX-Holo-3.1-35B-A3B-MLX-AXQ-6bit (este) | 35,11B logicos / ~3B activos | 262.144 | AXQ mixto 6bit/8bit/BF16, 7,51 BPW | Apache 2.0 | MLX Safetensors |
| AX-Holo-3.1-35B-A3B-MLX-AXQ-4bit (sibling) | 35,11B logicos / ~3B activos | 262.144 | AXQ mixto, presupuesto 4bit (BPW exacto no publicado) | Apache 2.0 | MLX Safetensors |
| Hcompany/Holo-3.1-35B-A3B (base) | 35,11B logicos / ~3B activos | 262.144 | BF16 original | Apache 2.0 | Safetensors (PyTorch) |

La comparativa se limita a los modelos directamente relacionados en la informacion proporcionada. No se dispone de datos para comparar con otras familias MoE cuantizadas en MLX.

## Limitaciones y advertencias

- Lanzamiento no certificado: la model card declara explicitamente que los gates formales M0-M8 de AXQuant no estan cerrados; no debe interpretarse como release de produccion.
- Sin evidencia de calidad: no se publican metricas de retencion de calidad frente a BF16 ni baselines uniformes.
- Sin validacion de contexto largo: la capacidad de 262.144 tokens es metadato de configuracion, no una afirmacion validada.
- Sin evaluacion de vision-lenguaje: la torre de vision se preserva en BF16 pero su calidad no ha sido evaluada ni reclamada.
- Sin MTP: no se incluye multi-token prediction, por lo que no hay aceleracion por esa via.
- AX Engine no establecido: la ejecucion nativa con AX Engine no esta validada; debe usarse la ruta MLX-LM estandar.
- MLX-LM puede ignorar metadatos AXQuant y sidecars: la inferencia estandar no garantiza el comportamiento completo del paquete.
- Sin calibracion: la asignacion de precision se basa en prioridades de arquitectura, no en datos de calibracion, lo que puede afectar la calidad en tareas especificas.
- Sesgos y alucinaciones: no se documentan sesgos conocidos ni tasas de alucinacion; al ser un modelo derivado de Qwen3.5, hereda las limitaciones del modelo base sin evaluacion adicional.
- Restricciones de uso comercial: ninguna, la licencia Apache 2.0 permite uso comercial sin restricciones.

## Enlaces

- Repositorio del modelo: https://huggingface.co/AutomatosX/AX-Holo-3.1-35B-A3B-MLX-AXQ-6bit
- Modelo base: https://huggingface.co/Hcompany/Holo-3.1-35B-A3B
- Sibling 4bit: https://huggingface.co/AutomatosX/AX-Holo-3.1-35B-A3B-MLX-AXQ-4bit
- Colecciones de AutomatosX: https://huggingface.co/AutomatosX/collections
- Indice completo del catalogo: https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog
