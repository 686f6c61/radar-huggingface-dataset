# huggingface-mic/stablelm-2-1_6b-mic

## Resumen

`huggingface-mic/stablelm-2-1_6b-mic` es un artefacto de prueba (fixture) derivado de `stabilityai/stablelm-2-1_6b`, publicado por la organización `huggingface-mic`. No es un modelo entrenado ni utilizable para inferencia real: se trata de una versión reducida ("slim") del checkpoint original de StableLM 2 1.6B, con la misma arquitectura declarada (`StableLmForCausalLM`) pero con solo 2 capas ocultas y pesos aleatorios generados con semilla 17. Su propósito es servir como fixture reproducible para probar contratos de integración y expectativas de frameworks (Transformers) sin necesidad de descargar el modelo completo.

El repositorio contiene los pesos reducidos, un manifiesto de contrato (`integration.json`), documentación de uso ejecutable y un directorio de expectativas del framework. Los ficheros de procesador (tokenizer, configuración, código de modelado) se copian byte a byte del checkpoint original de Stability AI, de modo que el fixture preserva los nombres de tensores y el comportamiento de tokenización del modelo real.

Es relevante únicamente en el contexto de testing de infraestructura de modelos: permite validar pipelines de carga, serialización, cuantización y ejecución con un peso mínimo (12,9 millones de parámetros, repositorio de 0,0 GB) manteniendo fidelidad estructural con el modelo de referencia. Está etiquetado explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StableLmForCausalLM (transformer causal decoder-only, versión reducida a 2 capas ocultas) |
| Parametros totales | 12.928.000 (fixture); el modelo base `stabilityai/stablelm-2-1_6b` tiene 1,6B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de la configuración del modelo base, no documentada en la información proporcionada) |
| Tipos de cuantizacion | no disponible (pesos guardados en float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el fichero `LICENSE.md` se copia del modelo base, pero su contenido no se detalla) |
| Formato de pesos | safetensors (float16) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura `StableLmForCausalLM` del modelo base mediante la regla genérica de reducción implementada en `sweep.py` del repositorio `transformers-mic`, que en este caso reduce `num_hidden_layers` a 2. Los ficheros de procesador y modelado (`configuration_stablelm.py`, `modeling_stablelm.py`, tokenizer completo, `generation_config.json`, `special_tokens_map.json`) se copian byte a byte desde `stabilityai/stablelm-2-1_6b`, garantizando que los nombres de tensores y la interfaz de tokenización coincidan con el checkpoint real.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y se validaron mediante una "input-sensitivity gate": cada perturbación de las entradas del contrato desplaza los logits al menos 0,001 (el caso más débil, `attention_mask:all_ones`, produce 0,821). El modelo es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. El fixture está identificado por la clave `996c5bf49638` y cubre todos los checkpoints cuyos ficheros de procesador son idénticos byte a byte y cuya configuración coincide tras la reducción.

## Capacidades

- No es un modelo funcional: no genera texto coherente, no razona, no escribe código ni resuelve matemáticas.
- Preserva la interfaz de tokenización del modelo base (tokenizer, `special_tokens_map`, `vocab.json`, `merges.txt`).
- Preserva los nombres de tensores del checkpoint original, lo que permite validar rutas de carga y serialización.
- Ejecutable en forward, loss y backward en float32, bfloat16 y float16.
- Sirve como fixture para tests de integración de frameworks (Transformers) y de contratos de API.
- No soporta tool calling, agentes, visión, audio ni modo thinking.
- Multilingüismo: no aplicable (pesos aleatorios).

## Casos de uso

- Pruebas de integración en Transformers: cargar el fixture con `AutoModelForCausalLM` para verificar que la ruta de carga, el mapeo de tensores y la configuración funcionan sin descargar el checkpoint de 1,6B.
- Validación de pipelines de CI/CD: ejecutar tests de forward/backward en float16, bfloat16 y float32 con un peso de 12,9M parámetros para comprobar compatibilidad de versiones de librerías.
- Test de contratos de API: usar `integration.json` y el directorio `integrations/transformers/expectations` para verificar que un servicio de inferencia cumple las expectativas declaradas (formas de entrada/salida, sensibilidad a perturbaciones).
- Verificación de serialización y cuantización: comprobar que herramientas de conversión (por ejemplo, a GGUF) manejan correctamente los nombres de tensores y la configuración reducida antes de aplicarlas al modelo real.
- Desarrollo de tooling de modelos: probar scripts de inspección, comparación de checkpoints o validación de ficheros de procesador sin coste de almacenamiento.
- Reproducibilidad de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture stablelm-2-1_6b-mic` y comparar hashes registrados en `build.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios, por lo que cualquier métrica de calidad sería carente de significado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float16 (12,9M parámetros); el repositorio ocupa 0,0 GB.
- GPU recomendadas: cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090) o incluso CPU.
- Cabe en cualquier GPU consumer y en CPU sin problemas.
- Opciones de despliegue: carga directa con Transformers; otras opciones (vLLM, llama.cpp, Ollama, TGI) no están documentadas para este fixture.
- Latencia y throughput: no disponibles; al ser un artefacto de test no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/stablelm-2-1_6b-mic` | 12,9M (fixture) | no disponible | Fixture de test | no disponible | Hugging Face |
| `stabilityai/stablelm-2-1_6b` | 1,6B | no disponible en la informacion | Modelo causal funcional | no disponible en la informacion | Hugging Face |
| Otros fixtures `*-mic` de huggingface-mic | variable (reducidos) | no disponible | Fixtures de test | no disponible | Hugging Face |

La comparación relevante es con el modelo base del que deriva: mismo código de modelado y tokenizer, pero 2 capas en lugar de la configuración completa y pesos aleatorios en lugar de entrenados. No se dispone de datos para comparar con alternativas funcionales de la misma categoría.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y la salida no tiene significado.
- Etiquetado como `test-artifact`; no debe usarse en producción ni como candidato en búsquedas de modelos.
- La licencia no está especificada en la información disponible; el `LICENSE.md` copiado del modelo base debe consultarse antes de cualquier uso.
- El contexto, los idiomas y las capacidades del modelo base no se detallan en la información proporcionada.
- El repositorio no incluye pesos entrenados, por lo que no puede emplearse para evaluación de calidad, alineamiento ni seguridad.
- Riesgo de confusión: el nombre incluye "1_6b" pero el fixture tiene 12,9M parámetros; verificar siempre el tamaño real antes de integrarlo.

## Enlaces

- Hugging Face: https://huggingface.co/huggingface-mic/stablelm-2-1_6b-mic
- Modelo base: https://huggingface.co/stabilityai/stablelm-2-1_6b
- Manifiesto de contrato: `integration.json` (en el repositorio)
- Uso con Transformers: `integrations/transformers/usage.md` (en el repositorio)
- Expectativas de Transformers: `integrations/transformers/expectations` (en el repositorio)
- Procedencia del fixture: `build.json` (en el repositorio)
- Explicación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/stablelm-2-1_6b-mic.html
- Script de reducción: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
