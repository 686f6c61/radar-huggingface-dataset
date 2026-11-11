# huggingface-mic/table_transformer-mic

## Resumen

`table_transformer-mic` es un artefacto de prueba publicado por el usuario `huggingface-mic` a partir del modelo `microsoft/table-transformer-detection`. No se trata de un modelo entrenado ni utilizable en producción: la propia model card lo etiqueta como `test-artifact` y lo describe como un *fixture* reducido de 11,4 millones de parámetros con pesos aleatorios (semilla 17). Su propósito es servir como banco de pruebas para validar contratos de integración, expectativas de frameworks y flujos de herramientas de la infraestructura de Hugging Face.

El modelo conserva la arquitectura `TableTransformerForObjectDetection` del checkpoint original, pero con una configuración reducida: 2 capas de encoder y 2 de decoder. Los ficheros de procesador (`preprocessor_config.json`) se copiaron byte a byte del modelo base, y los nombres de los tensores coinciden con los del checkpoint real, de modo que el fixture puede sustituir al modelo original en pruebas de carga e inferencia sin requerir los recursos computacionales del verdadero detector de tablas.

Es relevante únicamente en el contexto de ingeniería de software: permite a desarrolladores de la infraestructura de Hugging Face y de librerías de integración verificar que sus pipelines manejan correctamente la arquitectura Table Transformer sin descargar ni ejecutar el modelo completo de Microsoft. No debe confundirse con un modelo funcional de detección de tablas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TableTransformerForObjectDetection (DETR adaptado a detección de tablas) |
| Parámetros totales | 11.396.359 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura `TableTransformerForObjectDetection`, una adaptación de DETR para detección de tablas y sus componentes estructurales. En esta versión reducida, el encoder y el decoder cuentan con 2 capas cada uno, frente a la configuración completa del checkpoint original. Los ficheros de procesador son idénticos byte a byte a los de `microsoft/table-transformer-detection`, y los nombres de los tensores coinciden con los del checkpoint real.

No hubo entrenamiento. Los pesos son aleatorios, generados con semilla 17, y se validaron mediante una compuerta de sensibilidad a la entrada: cada perturbación de las entradas del contrato movía los logits al menos 0,001 (el caso más débil, `pixel_values:reverse`, produjo 0,00502). El modelo se guardó en float32 y se verificó que es finito en float32, bfloat16 y float16 tanto en forward como en pérdida y gradientes. La clave del fixture es `39c20ea7dc73`.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen detecciones de tablas con sentido.
- Sirve como fixture de prueba para validar la carga de la arquitectura Table Transformer en frameworks de integración.
- Permite verificar contratos de entrada y salida definidos en `integration.json`.
- Valida expectativas de frameworks documentadas en `integrations/transformers/expectations`.
- Comprueba la compatibilidad de los ficheros de procesador copiados del modelo base.
- Ejercita rutas de código de forward, pérdida y gradientes en float32, bfloat16 y float16.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.

## Casos de uso

- Pruebas de integración en Transformers: el fixture permite cargar `TableTransformerForObjectDetection` con un checkpoint ligero y verificar que la clase se instancia correctamente sin descargar el modelo completo de Microsoft.
- Validación de contratos de API: `integration.json` define el contrato de entradas y salidas, y el fixture permite comprobar que una implementación lo respeta antes de pasar al modelo real.
- CI/CD de librerías de inferencia: al ocupar un repositorio de tamaño mínimo (0,0 GB) y 11,4M de parámetros, se puede incluir en pipelines de integración continua sin penalizar tiempos ni almacenamiento.
- Verificación de dtypes: comprobar que un pipeline maneja correctamente float32, bfloat16 y float16 en forward, pérdida y gradientes usando un modelo que es finito en los tres formatos.
- Pruebas de sustitución de checkpoints: al conservar los nombres de tensores del modelo real, permite validar lógica de carga y mapeo de pesos que luego se aplicará a `microsoft/table-transformer-detection`.
- Regresión de procesadores: verificar que los ficheros de preprocesado copiados byte a byte se cargan y aplican sin errores en distintas versiones de la librería.
- Desarrollo de herramientas de inspección de modelos: usar el fixture para probar utilidades que analizan arquitecturas, configuraciones y pesos sin necesidad de modelos pesados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, no procede evaluar métricas de detección.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (11,4M de parámetros, aproximadamente 45 MB de pesos más activaciones reducidas).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; también es viable en CPU.
- Cabe en cualquier GPU de consumo, incluidas GTX 1050, RTX 3050, RTX 4090, así como en iGPU y CPU.
- Opciones de despliegue: Transformers con PyTorch; no se ha validado con vLLM, llama.cpp, Ollama ni TGI, y su naturaleza de fixture lo hace inadecuado para servidores de producción.
- Latencia y throughput: no disponibles; al ser un modelo de prueba, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Propósito |
|---|---|---|---|---|---|
| `huggingface-mic/table_transformer-mic` | 11,4M | no disponible | no disponible | Hugging Face | Fixture de prueba |
| `microsoft/table-transformer-detection` | no disponible en la información | no disponible | no disponible | Hugging Face | Detección de tablas en producción |
| `microsoft/table-transformer-structure-recognition` | no disponible en la información | no disponible | no disponible | Hugging Face | Reconocimiento de estructura de tablas |

La comparación relevante es con el checkpoint base: el fixture replica su arquitectura y nombres de tensores con una configuración reducida y pesos aleatorios, por lo que no es un sustituto funcional sino una herramienta de validación de integraciones.

## Limitaciones y advertencias

- Los pesos son aleatorios: el modelo no detecta tablas ni produce salidas con significado.
- Etiquetado explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos.
- No apto para uso en producción, investigación aplicada ni evaluación de calidad.
- La licencia no está declarada, lo que impide determinar condiciones de uso comercial.
- No se declaran idiomas soportados.
- La configuración reducida (2 capas de encoder y 2 de decoder) no representa el comportamiento del modelo completo.
- No se han publicado benchmarks ni métricas de rendimiento.
- Su utilidad se limita a pruebas de infraestructura y compatibilidad de frameworks.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/huggingface-mic/table_transformer-mic)
- [Modelo base: microsoft/table-transformer-detection](https://huggingface.co/microsoft/table-transformer-detection)
- [Contract manifest (integration.json)](https://huggingface.co/huggingface-mic/table_transformer-mic/blob/main/integration.json)
- [Transformers usage](https://huggingface.co/huggingface-mic/table_transformer-mic/blob/main/integrations/transformers/usage.md)
- [Transformers expectations](https://huggingface.co/huggingface-mic/table_transformer-mic/tree/main/integrations/transformers/expectations)
- [Fixture provenance (build.json)](https://huggingface.co/huggingface-mic/table_transformer-mic/blob/main/build.json)
- [Cómo se redujo el fixture](https://huggingface-mic-mic-coverage.static.hf.space/shrink/table_transformer-mic.html)
- [Repositorio transformers-mic (sweep.py)](https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py)
- [Repositorio transformers-mic (build_fixtures.py)](https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py)
