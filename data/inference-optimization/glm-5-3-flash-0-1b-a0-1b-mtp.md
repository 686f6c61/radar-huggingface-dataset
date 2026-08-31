# inference-optimization/GLM-5.3-Flash-0.1B-A0.1B-MTP

## Resumen

GLM-5.3-Flash-0.1B-A0.1B-MTP es un modelo sintético de 84 millones de parámetros creado por el usuario `inference-optimization` como un fixture de prueba para validar pipelines de cuantización de la capa MTP (Multi-Token Prediction) en la librería `llm-compressor` del ecosistema vLLM. Se basa en el modelo tiny `GLM-5.3-Flash-0.1B-A0.1B`, que a su vez es una versión reducida del modelo GLM-5.3-Flash de Z.ai, pero añade una capa MTP sintética con tensores inicializados a cero en bfloat16.

Este modelo no está diseñado para inferencia ni para uso en producción. Su única finalidad es probar que el código de cuantización de `llm-compressor` maneja correctamente la estructura de capas MTP específica de GLM, que difiere de la de otros modelos como Qwen o Nemotron. La relevancia de esta pieza es puramente técnica para desarrolladores que trabajan en herramientas de compresión de modelos, no para usuarios finales de LLMs.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | glm5_next (transformer con atención sparse y MoE) |
| Parametros totales | 84.361.966 |
| Parametros activos | no disponible (modelo tiny, no se especifica desglose) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el modelo es un fixture para probar cuantización, no viene cuantizado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (model.safetensors + model_mtp.safetensors) |

## Arquitectura y entrenamiento

El modelo base es una versión tiny de GLM-5.3-Flash con 5 capas ocultas, tamaño de hidden de 256 y 8 expertos enrutados. La variante MTP añade una sexta capa sintética (capa 5) que replica la estructura de la capa 3 (deepseek_sparse_attention) más cuatro tensores específicos de GLM5 (`eh_proj`, `enorm`, `hnorm`, `shared_head.norm`). Todos los tensores MTP están inicializados a cero en bfloat16 y escalados para coincidir con las dimensiones del modelo base.

No hay entrenamiento real detrás de este modelo. Los pesos MTP son sintéticos y se han añadido manualmente para simular la estructura que GLM almacena como las últimas N capas de `model.language_model.layers.*`, a diferencia de Qwen/Nemotron que usan un prefijo `mtp.*`. El objetivo es que `llm-compressor` pueda cargar y cuantizar estos tensores correctamente durante el desarrollo de sus pipelines.

## Capacidades

- No tiene capacidades de generación de texto, razonamiento, código ni ninguna otra función de inferencia.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- No es multilingüe ni tiene capacidades especiales de visión o audio.
- Su única función es servir como banco de pruebas para validar rutas de código de cuantización MTP en `llm-compressor`.
- Permite verificar que el índice de pesos (`model.safetensors.index.json`) mapea correctamente las capas 0-4 al archivo principal y la capa 5 al archivo MTP.

## Casos de uso

- Validación de pipelines de cuantización MTP: los desarrolladores de `llm-compressor` pueden ejecutar sus rutinas de cuantización sobre este modelo para comprobar que los tensores MTP se procesan sin errores y que el índice de pesos se actualiza correctamente.
- Pruebas de integración en CI/CD: al ser un modelo diminuto (0.2 GB), se puede integrar en suites de tests automatizados para verificar que los cambios en el código no rompen la compatibilidad con la estructura MTP de GLM.
- Desarrollo de adaptadores para transformers: dado que el tipo `glm5_next` aún no está soportado en transformers, este fixture permite a los desarrolladores probar la carga de pesos con `_keys_to_ignore_on_load_unexpected` y ajustar la lógica de mapeo.
- Benchmarking de rendimiento de cuantización: aunque no produce texto, se puede medir el tiempo de cuantización y el uso de memoria al procesar sus 84M parámetros, sirviendo como referencia para modelos más grandes.
- Depuración de errores de forma reproducible: al ser un modelo sintético con pesos cero, cualquier fallo en el pipeline de cuantización es fácilmente reproducible y aislable sin depender de pesos entrenados.
- Formación de nuevos contribuidores: quienes se incorporan al desarrollo de `llm-compressor` pueden usar este modelo para entender la estructura de capas MTP de GLM sin necesidad de descargar el modelo completo de 320B parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Este modelo no está diseñado para tareas de lenguaje y no tiene métricas de rendimiento asociadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica, el modelo no es para inferencia.
- Tamaño del repositorio: 0.2 GB, por lo que cualquier GPU con al menos 1 GB de VRAM podría cargarlo en memoria si se intentara, pero no tiene utilidad práctica.
- GPU recomendadas: no aplica.
- No cabe en consumer GPU como modelo útil, pero como fixture de prueba cabe en cualquier hardware, incluso CPU.
- Opciones de despliegue: no aplica (no se puede desplegar para servir peticiones).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia |
|---|---|---|---|---|
| inference-optimization/GLM-5.3-Flash-0.1B-A0.1B-MTP | 84M | no disponible | Fixture sintético para testing de cuantización MTP | no disponible |
| inference-optimization/GLM-5.3-Flash-0.1B-A0.1B | 84M (aprox.) | no disponible | Base tiny sin capa MTP, para testing de carga de pesos | no disponible |
| inference-optimization/GLM-5.3-Flash-MEP50 | no disponible | no disponible | Variante con MEP (probablemente Multi-Expert Prediction) para testing | no disponible |

No hay modelos comparables en el sentido de que todos son fixtures de prueba del mismo autor. No existe una categoría de modelos sintéticos de testing con la que comparar.

## Limitaciones y advertencias

- No es un modelo funcional: no genera texto ni realiza ninguna tarea de IA. Intentar usarlo para inferencia producirá resultados vacíos o errores.
- Los pesos MTP son sintéticos y están inicializados a cero, por lo que cualquier salida que se obtuviera sería basura.
- No tiene licencia especificada, lo que impide su uso comercial o incluso su redistribución sin autorización explícita del autor.
- El tipo de modelo `glm5_next` no está soportado en transformers, por lo que solo puede cargarse con herramientas que implementen esa arquitectura (como vLLM o llm-compressor).
- No hay garantía de que los tensores sintéticos reflejen fielmente la estructura real de un GLM-5.3-Flash completo, por lo que los resultados de las pruebas pueden no ser representativos.
- No se debe utilizar en producción bajo ninguna circunstancia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/inference-optimization/GLM-5.3-Flash-0.1B-A0.1B-MTP
- Modelo base tiny: https://huggingface.co/inference-optimization/GLM-5.3-Flash-0.1B-A0.1B
- Repositorio de llm-compressor: https://github.com/vllm-project/llm-compressor
- Modelo original GLM-5.3-Flash de Z.ai: https://huggingface.co/zai-org/GLM-5.3-Flash
- Documentación de GLM-5.3-Flash en unsloth: https://unsloth.ai/docs/models/glm-5.3-flash
