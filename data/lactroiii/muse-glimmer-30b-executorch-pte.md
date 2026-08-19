# lactroiii/Muse-Glimmer-30B-ExecuTorch-PTE

## Resumen

Muse Glimmer 30B es un modelo de lenguaje causal de 30 mil millones de parámetros desarrollado por Meta Superintelligence Lab, diseñado específicamente para tareas agénticas autónomas en hardware de consumo. Se presenta como una versión destilada de Muse Spark e integra en un único modelo razonamiento multi-paso, uso fiable de herramientas, comprensión multimodal y recuperación de fallos, todo ello ejecutable localmente sin dependencia de infraestructura en la nube. Su arquitectura incorpora un encoder de percepción dedicado y soporta una ventana de contexto de 131 072 tokens.

La relevancia de esta versión concreta radica en que ofrece artefactos pre-exportados en formato PTE (ExecuTorch) para NVIDIA CUDA (SM80+) y Apple Silicon (Metal), con y sin decodificación especulativa DFlash. Esto elimina la necesidad de reimplementar el modelo por backend, ya que ExecuTorch baja el grafo completo mediante `torch.export` a Triton en CUDA y MLX/Metal en Apple. El repositorio contiene 16 variantes que combinan dos cuantizaciones K-quant (~4 bits), dos modalidades (texto y texto+imagen), dos modos de decodificación y dos backends, con tamaños de descarga que van de 17,9 GB a 31,5 GB por variante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje causal con encoder de percepcion (texto+imagen) y decodificacion especulativa block-diffusion (DFlash) |
| Parametros totales | 30 mil millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131 072 tokens (fijo en todas las variantes) |
| Tipos de cuantizacion | K-quant de ~4 bits: `k-quant-17G` (apunta a 24 GB) y `k-quant-dynamic` (apunta a 32 GB, ligeramente mas preciso) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PTE (ExecuTorch) con pesos en `.ptd` para CUDA; tambien se mencionan checkpoints GGUF como punto de partida recomendado |

## Arquitectura y entrenamiento

Muse Glimmer 30B es un modelo causal con un encoder de percepción dedicado que permite entrada multimodal (texto e imágenes). El modelo fue destilado a partir de Muse Spark, lo que implica una reducción de parámetros manteniendo capacidades agénticas. La innovación principal reside en su esquema de decodificación especulativa block-diffusion (DFlash), que acelera la generación al predecir bloques de tokens mediante un drafter integrado que comparte embeddings y cabeza de salida con el modelo principal, reduciendo así el coste adicional frente a un segundo modelo completo.

El entrenamiento no especifica en la información disponible el número de tokens ni la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La exportación a ExecuTorch es el aspecto técnico destacable: el modelo y su estrategia de decodificación se escriben una vez en PyTorch y se bajan mediante `torch.export` a backends específicos (Triton en CUDA, MLX y Metal en Apple Silicon), lo que permite ejecución local eficiente sin reimplementaciones manuales por plataforma.

## Capacidades

- Razonamiento multi-paso integrado en el modelo, diseñado para tareas agénticas autónomas.
- Uso fiable de herramientas (tool calling), con soporte para definición de herramientas y parsing de llamadas mediante el parser `atem` en el servidor OpenAI-compatible.
- Comprensión multimodal: variantes `text-image` incluyen el encoder de percepción para procesar imágenes junto con texto.
- Decodificación especulativa DFlash en variantes `dflash`, que acelera la generación en GPUs capaces.
- Ejecución completamente local sin necesidad de conexión a red ni infraestructura cloud.
- Recuperación de fallos, lo que permite al modelo reanudar o corregir tareas interrumpidas.
- Capacidades multilingües no especificadas en la documentación disponible.

## Casos de uso

- Agentes autónomos locales: el modelo puede ejecutar pipelines de razonamiento multi-paso y toma de decisiones sin conexión, ideal para asistentes personales que operan en dispositivos del usuario.
- Atención al cliente automatizada: con su contexto de 131 072 tokens, puede mantener conversaciones multi-turno extensas y recordar detalles de interacciones previas, gestionando consultas complejas con acceso a herramientas.
- Generación de código en producción: soporta tool calling y puede integrarse en pipelines de CI/CD para generar, revisar y corregir código, aprovechando la decodificación especulativa para reducir latencia.
- Análisis de imágenes con texto: las variantes `text-image` permiten describir, clasificar o extraer información de imágenes en local, útil en entornos con requisitos de privacidad estrictos.
- Asistente de investigación offline: el modelo puede resumir documentos largos, razonar sobre múltiples fuentes y generar informes estructurados sin depender de APIs externas.
- Automatización de tareas de oficina: integrado con herramientas de calendario, correo o bases de datos mediante function calling, puede ejecutar flujos de trabajo complejos de forma autónoma.
- Despliegue en edge computing: gracias a las cuantizaciones K-quant y al soporte de Apple Silicon y NVIDIA SM80+, puede ejecutarse en estaciones de trabajo o mini-PCs con 24-32 GB de memoria unificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La documentación menciona que la variante `k-quant-dynamic` es "mediblemente más cercana a precisión completa" que `k-quant-17G`, pero no se proporcionan cifras concretas de MMLU, HumanEval u otros tests.

## Requisitos de hardware

- VRAM estimada: la variante `k-quant-17G` está diseñada para un envelope de 24 GB (VRAM o memoria unificada), mientras que `k-quant-dynamic` apunta a 32 GB. Los tamaños de descarga por variante oscilan entre 17,9 GB y 31,5 GB.
- GPU recomendadas: NVIDIA con arquitectura SM80 o superior (RTX 3090, RTX 4090, A100, H100) y Apple Silicon con soporte Metal.
- No existe variante para CPU.
- Opciones de despliegue: ExecuTorch runtime con servidor OpenAI-compatible incluido en el ejemplo oficial. Se menciona que los checkpoints GGUF se pueden exportar directamente a PTE.
- Latencia y throughput: no se proporcionan cifras específicas. La decodificación especulativa DFlash acelera la generación en GPUs capaces, pero el impacto cuantitativo no está documentado.

## Comparativa con modelos similares

No disponible. No se han encontrado comparaciones directas con otros modelos de 30B en la información proporcionada. La documentación solo menciona que Muse Glimmer es una destilación de Muse Spark, pero no ofrece tablas comparativas con alternativas como Llama 3 30B o Mistral 30B.

## Limitaciones y advertencias

- El repositorio completo pesa 372 GB; es obligatorio usar `--include` en `hf download` para seleccionar una única variante, evitando descargas masivas innecesarias.
- En CUDA, el `.pte` no contiene los pesos: se necesita también el archivo `.ptd` (19-31 GB). Descargar solo el `.pte` (16-35 MB) resultará en un modelo no funcional.
- No hay soporte para CPU; solo NVIDIA SM80+ y Apple Silicon.
- Los artefactos se nombran según su directorio; no siguen el patrón `model.pte` o `aoti_cuda_blob.ptd` de exportaciones locales, lo que puede causar errores si se copian comandos de otros tutoriales.
- Riesgo de alucinación inherente a modelos de lenguaje, no cuantificado en la documentación.
- Sesgos no documentados; no se proporcionan detalles sobre evaluación de sesgos o seguridad.
- La licencia Apache 2.0 permite uso comercial, pero se incluye un `USAGE_POLICY.md` en el repositorio que debe revisarse antes del despliegue.
- El modelo está pensado para tareas agénticas; su uso en escenarios de alto riesgo requiere validación adicional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/lactroiii/Muse-Glimmer-30B-ExecuTorch-PTE
- Repositorio HuggingFace oficial de Meta: https://huggingface.co/meta-models/Muse-Glimmer-30B-ExecuTorch-PTE
- Documentación oficial de ExecuTorch para Muse Glimmer: https://github.com/pytorch/executorch/blob/main/examples/models/muse-glimmer/README.md
- Directorio del ejemplo en GitHub: https://github.com/pytorch/executorch/tree/main/examples/models/muse-glimmer
- Anuncio del equipo de PyTorch: https://pytorch.org/blog/fast-ondevice-agentic-ai-with-executorch/
- Documentación de API de Meta: https://dev.meta.ai/docs/muse-glimmer/executorch
- Artículo de AIModeling sobre el toolchain local: https://www.aimodeling.com/en/news/slug/muse-glimmer-executorch-local-toolchain
