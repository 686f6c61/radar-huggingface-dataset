# nehal-vaghasiya/ticket-transformer-from-scratch

## Resumen

`ticket-transformer-from-scratch` (internamente `ticket-v2`) es un modelo transformer de tipo decoder-only entrenado desde cero en PyTorch por el desarrollador independiente nehal-vaghasiya. No es un checkpoint compatible con `AutoModel` de Transformers, sino una implementación propia que genera etiquetas restringidas de intención y prioridad para tickets de soporte sintéticos en inglés. Su tamaño es de 655.872 parámetros, con 3 bloques decoder, anchura 128, 4 cabezas de atención y una longitud de contexto de 112 tokens.

El modelo aborda una tarea muy acotada: clasificar tickets sintéticos en seis intenciones y tres niveles de prioridad mediante generación causal restringida, en lugar de una cabeza de clasificación clásica. Es relevante como artefacto educativo y de investigación sobre entrenamiento desde cero, no como solución de producción: el propio autor advierte que sistemas clásicos de TF-IDF superan al transformer en su benchmark interno y que no debe usarse como enrutador fiable de tickets reales.

La ficha se basa exclusivamente en la model card y los metadatos publicados en Hugging Face. No hay información adicional sobre composición del dataset, proceso de entrenamiento detallado ni resultados de benchmarks estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (3 bloques, anchura 128, 4 cabezas) |
| Parametros totales | 655.872 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 112 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `model.pt` (PyTorch nativo); configuración en `config.json`; tokenizador en `vocab.json`; metadatos en `run_info.json` y `artifact.json` |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 3 bloques con anchura 128, 4 cabezas de atención y contexto de 112 tokens, sumando 655.872 parámetros. Usa un tokenizador de palabras personalizado, entrenado únicamente para esta tarea y empaquetado como `vocab.json`. La tarea se formula como generación causal restringida: el modelo produce etiquetas de intención y prioridad dentro de un espacio limitado, no texto libre.

El entrenamiento se realizó con datos sintéticos de tickets de soporte en inglés, bajo la configuración `pretraining/configs/ticket-base.toml`, en la ejecución `ticket-v2-base-42` con semilla 42. La variante es "base/generative" (no pooled/dual). No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo RLHF o DPO. El código fuente está fijado al commit `5fdb74437670658c928e1f0fa4dacf80fca9c0e1` del repositorio `nehalvaghasiya/transformers-from-scratch`, y se requiere ese código exacto para cargar los pesos.

## Capacidades

- Clasificación de tickets sintéticos en seis intenciones predefinidas.
- Asignación de tres niveles de prioridad.
- Generación causal restringida de etiquetas (no texto libre).
- Procesamiento de entradas en inglés con contexto máximo de 112 tokens.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües más allá del inglés.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Experimento educativo de entrenamiento desde cero: sirve para estudiar el ciclo completo (tokenizador, dataset sintético, entrenamiento causal, evaluación) en un modelo pequeño que cabe en CPU.
- Reproducción de resultados: con el commit y la configuración indicados, permite replicar las métricas de test y challenge reportadas por el autor.
- Prototipado de clasificación de intención en entornos controlados: útil para validar pipelines de etiquetado restringido antes de migrar a un modelo mayor.
- Docencia sobre limitaciones de modelos pequeños: el caso ilustra cómo un transformer de 655.872 parámetros pierde frente a TF-IDF en su propio benchmark, lo que resulta didáctico.
- Pruebas de integración de artefactos: el manifiesto SHA-256 (`artifact.json`) permite ejercitar flujos de verificación de pesos en CI.
- Investigación sobre generalización: la brecha entre test (91,99%) y challenge (55,56%) es un caso de estudio sobre sobreajuste a plantillas sintéticas.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| Test joint accuracy | 91,99% | n=612, evaluación local fresca sobre estos pesos |
| Challenge joint accuracy | 55,56% | n=180, evaluación local fresca sobre estos pesos |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor indica que la media de 96,51% en tres semillas corresponde a una variante pooled dual-head distinta, no a este modelo. También señala que sistemas clásicos de TF-IDF superan al transformer en el benchmark upstream.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el modelo tiene 655.872 parámetros y pesos en `model.pt` de tamaño muy reducido.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU sin problema.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) e incluso en Raspberry Pi.
- Opciones de despliegue: no es compatible con vLLM, TGI, llama.cpp ni Ollama, ya que es un modelo PyTorch personalizado. El autor indica usar el comando `uv run --no-sync pretraining predict` del repositorio upstream.
- Latencia y throughput: no disponibles en la información proporcionada; por tamaño, la latencia en CPU debería ser de milisegundos, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ticket-transformer-from-scratch | 655.872 | 112 | Clasificación de tickets sintéticos | MIT | Hugging Face + repo GitHub |
| TF-IDF + clasificador clásico (referencia del autor) | no disponible | no aplica | Clasificación de tickets | no disponible | no disponible |
| Variante pooled dual-head del mismo repo | no disponible | no disponible | Clasificación de tickets | MIT | Repo upstream |

No se dispone de comparación con modelos transformer de clasificación de propósito general en la información proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente con tickets sintéticos en inglés; no es un modelo de lenguaje de propósito general.
- No es un enrutador de tickets fiable para producción, según el propio autor.
- Puede fallar con redacciones no vistas, entradas largas (más de 112 tokens) y urgencia implícita.
- La cobertura de vocabulario no equivale a confianza calibrada; las probabilidades no deben interpretarse como certeza.
- Brecha notable entre test (91,99%) y challenge (55,56%), indicativa de sobreajuste a plantillas sintéticas.
- Sistemas clásicos de TF-IDF superan al transformer en el benchmark upstream.
- Licencia MIT permite uso comercial, pero las limitaciones técnicas desaconsejan ese uso sin validación adicional.
- Requiere el código fuente exacto del commit indicado; no se puede cargar con `AutoModel` de Transformers.
- No se han documentado sesgos específicos más allá de los derivados de los datos sintéticos.

## Enlaces

- Hugging Face: https://huggingface.co/nehal-vaghasiya/ticket-transformer-from-scratch
- Repositorio GitHub: https://github.com/nehalvaghasiya/transformers-from-scratch
- Commit de referencia: https://github.com/nehalvaghasiya/transformers-from-scratch/tree/5fdb74437670658c928e1f0fa4dacf80fca9c0e1
- Configuración de entrenamiento: `pretraining/configs/ticket-base.toml` (en el repositorio)
