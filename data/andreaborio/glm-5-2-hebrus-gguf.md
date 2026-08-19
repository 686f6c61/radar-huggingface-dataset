# andreaborio/GLM-5.2-Hebrus-GGUF

## Resumen

El modelo GLM-5.2-Hebrus-GGUF es un artefacto cuantizado del modelo base GLM-5.2 de Z.ai, publicado por andreaborio en formato propietario Hebrus. No se trata de un GGUF portable estándar: es una extensión nativa del motor de inferencia Hebrus, un runtime para Apple Silicon Metal con streaming de expertos en SSD. El modelo base es un MoE (mezcla de expertos) con routing "expert-major", diseñado para generación de texto en inglés y chino, con licencia MIT.

La relevancia de este artefacto radica en su enfoque: permite ejecutar un modelo de gran tamaño (244 GiB en Q2_K) en hardware Apple con memoria unificada de al menos 64 GiB, descargando dinámicamente los expertos desde SSD. El contexto normal es de 8.192 tokens, con una frontera registrada de 32.768 tokens. Es importante señalar que este archivo no es ejecutable por llama.cpp, MLX, Ollama ni la inferencia alojada de Hugging Face; solo funciona con Hebrus.

El repositorio incluye un único archivo cualificado (`GLM-5.2-DS4-ExpertMajor-v2-Q2_K.gguf`) con checksum SHA-256 verificado y una revisión fijada (`ds4-v0.2.0`). El autor declara explícitamente que no hay soporte para contextos de 65K o 100K, y que la decodificación especulativa (MTP) no forma parte del camino de arranque cualificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) con routing expert-major |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 8.192 tokens (normal), 32.768 tokens (frontera registrada) |
| Tipos de cuantizacion | Q2_K (único artefacto publicado) |
| Idiomas soportados | ingles, chino |
| Licencia | MIT (del modelo base zai-org/GLM-5.2) |
| Formato de pesos | Hebrus-native GGUF extension (no portable a GGUF estandar) |

## Arquitectura y entrenamiento

La arquitectura del modelo base GLM-5.2 es un transformer MoE con routing por mayoría de expertos ("expert-major"). El artefacto Hebrus almacena el banco de expertos en un store integrado y con checksum (`ds4.expert_major.v2`), diseñado para streaming desde SSD en Apple Silicon. No se dispone de información sobre el número total de parámetros, la composición del dataset de entrenamiento ni los métodos de alineación (RLHF/DPO) en la documentación proporcionada.

La innovación principal de este artefacto es el motor Hebrus: un runtime compilado desde fuente que emplea Metal y streaming de expertos con límites de SSD, permitiendo ejecutar un modelo de 244 GiB en equipos con 64 GiB de memoria unificada. El runtime rechaza configuraciones no cualificadas (sidecars, políticas de precarga, bypass de admisión) y no incluye soporte CUDA ni ROCm.

## Capacidades

- Generación de texto en ingles y chino.
- Soporte de contexto largo hasta 32.768 tokens (frontera registrada, no garantizada).
- Routing por expertos con streaming desde SSD (bounded SSD expert streaming).
- Ejecución exclusiva en Apple Silicon Metal con Hebrus v0.3.0.
- No soporta tool calling, agentes, vision ni audio según la información disponible.
- No incluye decodificación especulativa (MTP) en el camino cualificado.

## Casos de uso

- Inferencia local de un modelo MoE de gran tamaño en Mac con Apple Silicon: permite ejecutar GLM-5.2 en equipos con 64 GiB de memoria unificada sin necesidad de GPUs dedicadas, gracias al streaming de expertos desde SSD.
- Investigación y desarrollo de motores de inferencia especializados: Hebrus sirve como referencia para implementar streaming de expertos y cuantización agresiva en hardware Apple.
- Evaluación de modelos cuantizados en Q2_K: el artefacto permite probar el comportamiento de GLM-5.2 con cuantización de 2 bits en tareas de generación de texto en ingles y chino.
- Despliegue en entornos con restricciones de memoria: el streaming desde SSD reduce el requisito de RAM/VRAM, habilitando modelos grandes en equipos de gama media-alta de Apple.
- Reproducibilidad de benchmarks de contexto largo: el repositorio incluye evidencia documentada de funcionamiento a 32K tokens, útil para validar configuraciones de contexto extendido.
- Uso educativo sobre formatos de pesos propietarios: ilustra las diferencias entre GGUF portable y extensiones runtime-específicas, y las implicaciones de compatibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona evidencia de funcionamiento a 32K tokens en un documento de benchmarks, pero no se proporcionan métricas concretas (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- Apple Silicon Mac con al menos 64 GiB de memoria unificada (mínimo declarado).
- Más de 262 GB de espacio libre en SSD para el archivo del modelo (244.14 GiB).
- Xcode Command Line Tools y el runtime Hebrus v0.3.0 (compilación desde fuente).
- El modo normal AUTO resuelve a Metal SSD streaming; no se admite ejecución en CPU como vía de producción (solo referencia/debug).
- No hay soporte CUDA ni ROCm; la inferencia distribuida está retirada.
- Latencia y throughput no especificados; dependen del artefacto, revisión del runtime, contexto, estado del almacenamiento y presión de memoria.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre modelos comparables en la misma categoría (MoE cuantizado en Q2_K con streaming SSD para Apple Silicon) en la documentación proporcionada.

## Limitaciones y advertencias

- Formato propietario: el archivo no es un GGUF portable; llama.cpp, MLX, Ollama y la inferencia alojada de Hugging Face no pueden ejecutarlo.
- Contexto limitado: el contexto normal es de 8.192 tokens; la frontera de 32.768 tokens está registrada pero es lenta de probar y no está garantizada. No hay soporte para 65K o 100K.
- Requisitos de hardware estrictos: necesita 64 GiB de memoria unificada y más de 262 GB de SSD libre; el rendimiento depende de la localidad del routing, el estado del almacenamiento y la presión térmica.
- Sin decodificación especulativa: MTP no forma parte del camino de arranque cualificado.
- Sin soporte CUDA/ROCm: limitado exclusivamente a Apple Silicon Metal.
- El modelo base declara licencia MIT, pero el artefacto es mantenido por Hebrus; la atribución de Z.ai se mantiene. No se especifican restricciones adicionales de uso comercial.
- `inference: false` en Hugging Face: el widget de inferencia alojado no soporta este artefacto runtime-específico.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/andreaborio/GLM-5.2-Hebrus-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-5.2
- Repositorio Hebrus: https://github.com/andreaborio/hebrus
- Contrato de soporte runtime: https://github.com/andreaborio/hebrus/blob/v0.3.0/docs/contracts/RUNTIME_SUPPORT.md
- Evidencia de contexto 32K: https://github.com/andreaborio/hebrus/blob/v0.3.0/docs/benchmarks/2026-07-20-long-context-metal-stack.md
- Revision fijada ds4-v0.2.0: https://huggingface.co/andreaborio/GLM-5.2-Hebrus-GGUF/tree/ds4-v0.2.0
