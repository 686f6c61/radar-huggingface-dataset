# malaiwah/qwen3-5-tiny-random-gguf-f16-format

## Resumen

Este repositorio contiene un fixture de control de formato de punto flotante para el pipeline de lectura/conversión GGUF de la familia Qwen3.5. Ha sido publicado por el usuario malaiwah como parte de una colección de artefactos de reproducción y control de formato. No se trata de un modelo de lenguaje entrenado ni de una cuantización con calidad útil: los pesos son aleatorios, no han sido optimizados y el texto generado no tiene valor semántico.

La arquitectura declarada es `Qwen3_5ForConditionalGeneration` en su vista de modelo de lenguaje, sin incluir la torre de visión. El número de parámetros almacenados en safetensors es de 246.612, mientras que la model card indica 281.300 parámetros generados antes del empaquetado. El vocabulario es un fixture independiente de 272 tokens, no el vocabulario real de Qwen3.5. El repositorio sirve para verificar el comportamiento del lector/conversor GGUF en modo f16, y su relevancia es exclusivamente técnica, orientada a depuración y pruebas de reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (vista de texto/head, sin vision) |
| Parametros totales | 246.612 (según safetensors); 281.300 antes de empaquetado (según model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF f16 (round-to-nearest packing, sin optimización) |
| Idiomas soportados | no disponibles (vocabulario fixture de 272 tokens) |
| Licencia | MIT |
| Formato de pesos | GGUF (f16); safetensors como formato fuente |

## Arquitectura y entrenamiento

El artefacto es un control de conversión de formato de punto flotante derivado de un checkpoint fuente compartido en BF16. No es un fine-tune ni una inicialización independiente: todos los derivados de la familia se miden contra la misma identidad de checkpoint fuente (`320527902d412346d533fd1ac62066bd4cd278016a44f8cfd071318dc3b36a4b`). Los pesos son aleatorios y no se ha ejecutado ningún optimizador durante su creación.

La intervención de almacenamiento consiste en un GGUF denso canónico para Qwen35, con split QKV/Z, 2 key heads y 6 value heads, y una vista solo de texto con su propia head. La política de head es nativa: cada lado se reproduce a través de su propia head sellada. No se ha ejecutado ninguna validación de kernels de llama.cpp ni de cuantización de activaciones. El repositorio incluye archivos de configuración como `config.json`, `tokenizer.json`, `scope.json` y `qwen35-layout.json`, que documentan el origen y el diseño del artefacto.

## Capacidades

- Generación de texto sin calidad semántica: los pesos aleatorios producen salidas sin significado.
- No es un asistente ni un modelo de lenguaje entrenado.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No soporta visión en la vista exportada: el payload GGUF contiene solo el modelo de lenguaje y su head, sin la torre de visión.
- No soporta agentes ni ningún flujo de producción.
- Sirve como fixture de control para probar la lectura de GGUF, la comparación de formatos de punto flotante y la reproducibilidad en CPU.

## Casos de uso

- Pruebas de regresión de lectores GGUF: permite verificar que un lector o conversor maneja correctamente un payload f16 con la geometría canónica de Qwen35 sin descargar un modelo de producción.
- Depuración de adaptadores de familia de modelos: útil para aislar errores en la carga estricta de tensores o en la decodificación de almacenamiento sin necesidad de un checkpoint grande.
- Verificación de reproducibilidad de formatos de punto flotante: sirve como caso de control para comparar F32 frente a F16 en un panel sellado de tokens.
- Pruebas de integración en pipelines CPU: el artefacto es ligero (0.484 MiB) y puede ejecutarse en entornos de CI/CD para detectar cambios de comportamiento en el conversor.
- Documentación de control de formato para la familia Qwen3.5: ayuda a entender qué parte del pipeline es responsable de la conversión de precisión y qué no.
- Formación de herramientas de análisis de artefactos: permite probar scripts de análisis de modelos, como la extracción de hidden states o la reproducción de una head de vocabulario completa, sin consumir recursos significativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Además, al tratarse de pesos aleatorios no entrenados, cualquier benchmark de calidad de lenguaje no es aplicable. El repositorio no presenta métricas de rendimiento de inferencia ni de precisión.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplicable para uso real; el artefacto pesa 0.484 MiB en disco, por lo que cualquier entorno con CPU es suficiente.
- GPU recomendadas: no se requiere ninguna GPU para cargar o ejecutar el fixture.
- Compatibilidad con GPU de consumo: no aplicable, ya que no es un modelo de producción.
- Opciones de despliegue: puede abrirse con herramientas que soporten GGUF, como llama.cpp u Ollama, pero no se recomienda su uso como modelo de lenguaje.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de modelos comparables en términos de funcionalidad, ya que este artefacto es un fixture de control, no un modelo de lenguaje entrenado. Existen otros repositorios de la misma familia de control de formato del usuario malaiwah, como el fuente BF16 (`malaiwah/qwen3-5-gguf-tiny-random-bf16`), pero todos comparten la misma naturaleza de pesos aleatorios y no pueden considerarse alternativas válidas entre sí.

## Limitaciones y advertencias

- Los pesos no están entrenados: cualquier salida generada carece de utilidad semántica.
- No debe registrarse ni presentarse como el modelo base Qwen3.5.
- El vocabulario es un fixture de 272 tokens, no el vocabulario real de la familia Qwen3.5.
- La cuantización RTN (round-to-nearest) no es una optimización: no se ha ejecutado GPTQ, AWQ, AutoRound ni calibración de activaciones.
- La reconstrucción en CPU no ejecuta la geometría empaquetada original ni la aritmética de activaciones de los kernels de servicio.
- No se garantiza compatibilidad con pesos de producción ni comportamiento de contexto largo.
- Puede inducir a error si se confunde con un modelo real de Qwen3.5, especialmente por el nombre del repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/malaiwah/qwen3-5-tiny-random-gguf-f16-format
- Fuente exacta de construcción: https://huggingface.co/malaiwah/qwen3-5-gguf-tiny-random-bf16/tree/490767e58441a55c5a9f6375ea0e31e2cdc9da76
- Colección de familias de cuantización: https://huggingface.co/collections/malaiwah/qfs-matched-weight-quantization-families-6a9f071d93dbd3dbf0a1e844
- Dataset de raíz de fidelidad: https://huggingface.co/datasets/malaiwah/qwen3-5-gguf-tiny-fidelity-root-v1
- Dataset de evidencia de almacenamiento: https://huggingface.co/datasets/malaiwah/qfs-qwen-gguf-tiny-cpu-format-v1
