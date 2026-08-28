# Atomic-Germ/Aroow-Rust-Coder-9B-NPU2

## Resumen

Aroow-Rust-Coder-9B-NPU2 es una conversión cuantizada en formato Q4NX del modelo Convence/Aroow-Rust-Coder-9B, realizada por Atomic-Germ para su ejecución en la NPU AMD XDNA (presente en procesadores Ryzen AI). El modelo original está especializado en generación y completado de código Rust, con capacidades adicionales de razonamiento, function calling y visión. Esta versión cuantizada permite desplegar un modelo de 9B en hardware NPU de bajo consumo, aprovechando el runtime FastFlowLM (FLM) en su versión 1.0.1.

La relevancia de esta conversión radica en que acerca los modelos de código a entornos edge y portátiles con aceleración NPU, sin necesidad de GPUs dedicadas. El repositorio incluye los pesos cuantizados (model.q4nx, 7.11 GB), el tokenizador, la plantilla de chat y un modelo de visión adicional (vision_weight.q4nx). No se trata de un archivo GGUF, sino de un formato propietario para FastFlowLM.

Aunque el modelo base no está documentado en detalle en esta ficha, las etiquetas sugieren que se basa en una arquitectura Qwen3.5 (con la variante qwen3.8-froggeric-v22.4). La conversión está pensada para usarse con la herramienta `flm-add`, que instala el modelo en el directorio de usuario de FastFlowLM.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetas sugieren Qwen3.5) |
| Parametros totales | no disponible (denominacion 9B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4NX (mezcla de Q8_0, Q4_1 y BF16) |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | q4nx (propietario FastFlowLM) |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura interna del modelo original Convence/Aroow-Rust-Coder-9B. Las etiquetas del repositorio (`qwen3.5`, `qwen3.8-froggeric-v22.4`) sugieren que podría estar basado en una variante de la familia Qwen3.5, pero no hay confirmación oficial. Tampoco se han publicado detalles sobre el entrenamiento, el número de tokens utilizados o el proceso de alineación (RLHF, DPO, etc.).

La conversión Q4NX aplica una cuantización mixta (Q8_0, Q4_1 y BF16) optimizada para la NPU AMD XDNA. El runtime FastFlowLM gestiona la ejecución del modelo en dicha NPU, y el repositorio incluye un archivo de configuración (`config.json`) y una plantilla de chat (`chat_template.jinja`) específicos para este runtime.

## Capacidades

- Generación y completado de código, con especialización en el lenguaje Rust.
- Soporte de fill-in-the-middle (FIM) para completado de código en medio de un fragmento.
- Razonamiento multi-paso, según las etiquetas del modelo.
- Function calling (llamada a funciones), lo que permite integrarlo en agentes y herramientas.
- Capacidades de visión (se incluye un modelo de visión separado `vision_weight.q4nx`).
- Idioma inglés como principal (y probablemente único) soportado.

## Casos de uso

- Asistente de programación en Rust: el modelo puede generar fragmentos de código, sugerir implementaciones y completar funciones dentro de un editor o CLI, aprovechando su especialización en Rust.
- Completado de código en entornos integrados (IDE): gracias al soporte de fill-in-the-middle, puede insertar código en medio de una función o bloque, mejorando la fluidez del desarrollador.
- Agente de codificación autónomo: con function calling y razonamiento, puede planificar y ejecutar tareas de refactorización o corrección de errores en proyectos Rust, integrándose en pipelines de CI/CD.
- Asistente de revisión de código: el modelo puede analizar snippets de Rust, detectar patrones problemáticos y sugerir mejoras, funcionando como un revisor automático.
- Generación de documentación técnica: a partir de código Rust, puede redactar comentarios, docstrings y documentación de APIs.
- Despliegue en portátiles con Ryzen AI: al estar cuantizado para NPU XDNA, puede ejecutarse localmente sin conexión a internet ni GPU dedicada, ideal para entornos de desarrollo remotos o con restricciones de hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas para este modelo o su versión original.

## Requisitos de hardware

- Requiere una NPU AMD XDNA (presente en procesadores Ryzen AI, como las series Phoenix y Strix).
- El runtime FastFlowLM (FLM) debe estar instalado; la versión requerida es la 1.0.1.
- No se especifican requisitos de VRAM ni de GPU, ya que la inferencia se realiza en la NPU integrada.
- El tamaño del repositorio es de 8.7 GB, con pesos cuantizados de 7.11 GB, por lo que se necesita al menos esa capacidad de almacenamiento.
- La instalación se realiza mediante la herramienta `flm-add` (instalable con pip o uv), que copia el modelo al directorio de usuario de FastFlowLM.
- No se indican latencias ni throughput estimados.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (modelos de código cuantizados para NPU). La búsqueda web no arrojó alternativas directas. Se recomienda consultar el modelo original `Convence/Aroow-Rust-Coder-9B` para comparar con otras opciones de generación de código.

## Limitaciones y advertencias

- Licencia no especificada: no se conoce si el modelo original o esta conversión permiten uso comercial, por lo que se debe contactar con el autor antes de utilizarlo en producción.
- Modelo experimental: la conversión Q4NX y el runtime FastFlowLM son proyectos en desarrollo (el repositorio OpenNPU indica ingeniería inversa de la NPU), por lo que la estabilidad y el rendimiento no están garantizados.
- Idioma limitado: solo se declara soporte para inglés, lo que restringe su uso en aplicaciones multilingües.
- Sin benchmarks publicados: no hay evidencia objetiva de la calidad del modelo en tareas de código o razonamiento.
- Dependencia de hardware específico: solo funciona en NPU AMD XDNA; no es compatible con GPUs convencionales ni CPUs sin ese acelerador.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar código incorrecto o inventar APIs inexistentes; se recomienda supervisión humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Atomic-Germ/Aroow-Rust-Coder-9B-NPU2
- Modelo base original: https://huggingface.co/Convence/Aroow-Rust-Coder-9B
- Repositorio OpenNPU (ingeniería inversa de la NPU): https://github.com/Atomic-Germ/OpenNPU
- Colección OpenCode de Atomic-Germ: https://huggingface.co/collections/Atomic-Germ/opencode
- Herramienta OpenCode (agente de codificación): https://opencode.ai/
- Búsqueda de modelos cuantizados relacionados: https://huggingface.co/models?other=base_model:quantized:Convence/Aroow-Rust-Coder-9B
