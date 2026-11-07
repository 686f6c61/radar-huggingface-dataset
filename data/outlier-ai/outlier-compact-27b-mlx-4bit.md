# Outlier-Ai/Outlier-Compact-27B-MLX-4bit

## Resumen

Outlier-Compact-27B-MLX-4bit es una cuantizacion de 4 bits en formato MLX del modelo base Qwen/Qwen3.6-27B, publicada por Outlier-Ai para su ejecucion local en Apple Silicon. Se distribuye como artefacto de investigacion y la propia model card lo marca como obsoleto ("deprecated" y "superseded"): el autor lo conserva unicamente por reproducibilidad historica y recomienda descargar las versiones actuales de su linea v1.8. El repositorio ocupa 15,2 GB y contiene 26.895.998.464 parametros en safetensors.

El modelo hereda la arquitectura y el entrenamiento del Qwen3.6-27B original, del que no se documentan en esta ficha detalles de composicion del dataset ni de alineamiento. La contribucion de Outlier-Ai se limita a la conversion al formato MLX con cuantizacion de 4 bits, orientada a inferencia offline en macOS sobre chips M1, M2, M3 y M4. La licencia declarada es Apache 2.0 y se conservan los terminos originales del modelo base.

Su relevancia practica es limitada: al tratarse de un artefacto retirado, no recibe mantenimiento ni actualizaciones, y el autor redirige explicitamente a Outlier Core 27B, Outlier Nano 4B y Outlier Vision 35B-A3B como alternativas vigentes. Resulta util, eso si, como referencia para estudiar el pipeline de cuantizacion MLX de 4 bits aplicado a un modelo denso de ~27B en hardware de consumo Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3.6-27B); detalles no disponibles |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits en formato MLX (unica variante publicada en este repo) |
| Idiomas soportados | en, zh, fr, es, pt, de, it, ru, ja, ko, ar, vi, th, nl, pl |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), libreria `mlx` |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3.6-27B, un transformer denso de aproximadamente 27.000 millones de parametros. La model card no aporta informacion sobre el numero de tokens de entrenamiento, la composicion del corpus, ni si se aplicaron fases de RLHF, DPO u otras tecnicas de alineamiento. Tampoco se detallan innovaciones arquitectonicas especificas (atencion lineal, decodificacion especulativa, mezcla de expertos) mas alla de la etiqueta generica `qwen3_5`/`qwen3.6` en los tags.

La aportacion de Outlier-Ai consiste en la conversion a MLX y la cuantizacion a 4 bits de los pesos, lo que reduce el tamano del repositorio a 15,2 GB. La model card advierte que este artefacto puede contener adaptadores, overlays o variantes de cuantizacion experimentales que no llegaron al producto final, y que cualquier afirmacion tecnica de revisiones anteriores de la tarjeta debe considerarse provisional.

## Capacidades

- Generacion de texto conversacional y de proposito general, heredada del modelo base Qwen3.6-27B.
- Soporte multilingue en 15 idiomas: ingles, chino, frances, espanol, portugues, aleman, italiano, ruso, japones, coreano, arabe, vietnamita, tailandes, neerlandes y polaco.
- Inferencia local y offline sobre Apple Silicon mediante MLX, sin dependencia de servicios en la nube.
- Ejecucion en macOS sobre chips de la familia M (M1, M2, M3, M4), segun los tags del repositorio.
- Capacidades de tool calling, agentes, vision, audio o modo de razonamiento extendido: no disponibles en la informacion proporcionada.

## Casos de uso

- Prototipado de asistentes conversacionales offline en macOS: el modelo puede desplegarse con MLX en un Mac con chip M-series para probar flujos multi-turno sin conexion, util en entornos con requisitos de privacidad o sin red.
- Evaluacion de pipelines de cuantizacion MLX: sirve como referencia para medir la perdida de calidad al pasar un modelo denso de ~27B a 4 bits en Apple Silicon, comparando sus salidas con las del Qwen3.6-27B original.
- Reproduccion de experimentos historicos: al estar preservado por el autor para reproducibilidad, permite replicar resultados de la linea Outlier anterior a la v1.8.
- Procesamiento de texto multilingue local: con 15 idiomas declarados, puede emplearse para tareas de traduccion o resumen en un escritorio Mac sin enviar datos a terceros.
- Desarrollo de aplicaciones de escritorio con inferencia embebida: integrable mediante la libreria `mlx` en herramientas nativas de macOS que requieran generacion de texto on-device.
- Formacion y docencia: util para demostrar el flujo completo de descarga, cuantizacion y ejecucion de un LLM de gran tamano en hardware de consumo Apple.
- No se recomienda su uso en produccion, dado que el autor lo ha declarado obsoleto y redirige a las versiones vigentes de su linea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: el repositorio pesa 15,2 GB en cuantizacion de 4 bits, por lo que se requiere al menos esa cantidad de memoria unificada mas el overhead de ejecucion; se recomienda un minimo de 18-24 GB para trabajar con comodidad.
- Hardware objetivo: Apple Silicon exclusivamente (M1, M2, M3, M4), segun los tags del repositorio; no esta pensado para GPU NVIDIA ni CPU x86.
- Cabe en equipos de consumo Apple con 24 GB o 32 GB de memoria unificada; en configuraciones de 16 GB el margen es muy ajustado.
- Opciones de despliegue: libreria `mlx` (formato nativo del repositorio). No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| Outlier-Compact-27B-MLX-4bit | ~26,9B | no disponible | MLX 4-bit | Apache 2.0 | Obsoleto (artefacto de investigacion) |
| Outlier-Core-27B-MLX-4bit | no disponible | no disponible | MLX 4-bit | no disponible | Tier por defecto actual del autor |
| Outlier-Nano-4B-MLX-4bit | ~4B (por el nombre) | no disponible | MLX 4-bit | no disponible | Tier de entrada actual del autor |
| Outlier-Vision-35B-A3B-MLX-4bit | ~35B totales, ~3B activos (por el nombre) | no disponible | MLX 4-bit | no disponible | Tier multimodal actual del autor |

Los datos de rendimiento comparativo entre estos modelos no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo declarado obsoleto por el propio autor: la model card indica "superseded" y recomienda no usarlo como descarga de produccion.
- Artefacto de investigacion: puede contener adaptadores u overlays experimentales no validados en el producto final.
- Sin benchmarks publicados: no hay evidencia documentada de su calidad frente al modelo base ni frente a alternativas.
- Exclusivo de Apple Silicon: no es desplegable en GPU NVIDIA, TPU ni CPU x86 sin reconversion.
- Longitud de contexto no documentada, lo que impide planificar casos de uso con ventanas largas.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; deben asumirse los del modelo base Qwen3.6-27B, no caracterizados aqui.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de un modelo base conviene verificar los terminos del Qwen3.6-27B original antes de redistribuir.
- Sin mantenimiento ni actualizaciones por parte del autor.
- La model card incluye enlaces promocionales a un producto comercial; no deben interpretarse como aval tecnico del artefacto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Outlier-Ai/Outlier-Compact-27B-MLX-4bit
- Archivos del repositorio: https://huggingface.co/Outlier-Ai/Outlier-Compact-27B-MLX-4bit/tree/main
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Tier actual por defecto: https://huggingface.co/Outlier-Ai/Outlier-Core-27B-MLX-4bit
- Tier de entrada actual: https://huggingface.co/Outlier-Ai/Outlier-Nano-4B-MLX-4bit
- Tier multimodal actual: https://huggingface.co/Outlier-Ai/Outlier-Vision-35B-A3B-MLX-4bit
- Modelo de razonamiento recomendado: https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Qwen-7B-MLX-4bit
- Modelo de codigo recomendado: https://huggingface.co/Outlier-Ai/Qwen3-Coder-30B-A3B-Instruct-MLX-4bit
- Sitio del autor: https://outlier.host/
