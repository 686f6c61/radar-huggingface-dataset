# huggingface-mic/qwen2_audio-mic

## Resumen

`qwen2_audio-mic` es un artefacto de prueba publicado por la organización `huggingface-mic`. No es un modelo entrenado ni utilizable para inferencia real: se trata de un *fixture* reducido de `Qwen/Qwen2-Audio-7B` con 20.258.816 parámetros y pesos aleatorios (semilla 17), diseñado para validar el contrato de integración de frameworks (principalmente Transformers) sin necesidad de descargar ni ejecutar el checkpoint completo de 7B.

El repositorio empaqueta en un único lugar los pesos "slim", un manifiesto de contrato (`integration.json`), la documentación de uso (`integrations/transformers/usage.md`), las expectativas del framework (`integrations/transformers/expectations`) y la procedencia del fixture (`build.json`). La arquitectura declarada es `Qwen2AudioForConditionalGeneration`, pero con el encoder de audio y el decoder de texto reducidos a 2 capas cada uno, manteniendo los nombres de tensores idénticos al checkpoint original.

Su relevancia es puramente de ingeniería: permite a los mantenedores de Transformers y de otras librerías comprobar que la carga, el forward, la pérdida y los gradientes funcionan correctamente con la arquitectura Qwen2-Audio en float32, bfloat16 y float16, con un repo de solo 0,2 GB. Está etiquetado como `test-artifact` precisamente para excluirlo de las búsquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2AudioForConditionalGeneration (encoder de audio + decoder de texto, transformer) |
| Parametros totales | 20.258.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en float32 y bfloat16 en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32 y bfloat16) |

## Arquitectura y entrenamiento

El modelo reproduce la topología de Qwen2-Audio: un encoder de audio que proyecta características acústicas al espacio del decoder de texto, un transformer autoregresivo para la generación y un procesador multimodal (tokenizer + preprocessor de audio). En este fixture, el encoder de audio y el decoder de texto se han reducido a 2 capas cada uno mediante la regla genérica de `sweep.py`, conservando los nombres de tensores del checkpoint real.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron con una puerta de sensibilidad a la entrada: cada perturbación de las entradas del contrato desplaza los logits al menos 0,001 (el caso más débil, `input_features:halve`, produce 0,463). Los ficheros de procesador (`generation_config.json`, `merges.txt`, `preprocessor_config.json`, `tokenizer.json`, `tokenizer_config.json`, `vocab.json`) se copiaron byte a byte desde `Qwen/Qwen2-Audio-7B`. El fixture es finito en float32, bfloat16 y float16 tanto en forward como en pérdida y gradientes.

## Capacidades

- No tiene capacidades funcionales de generación, razonamiento, código, matemáticas ni visión: los pesos son aleatorios.
- No soporta tool calling ni function calling de forma significativa.
- No soporta agentes ni razonamiento multi-paso.
- No ofrece capacidades multilingües reales.
- Su única función es servir de banco de pruebas de integración: verificar carga de checkpoint, forward pass, cálculo de pérdida y retropropagación con la arquitectura Qwen2-Audio.
- Sirve para validar la sensibilidad de las entradas del contrato (perturbaciones de `input_features` y de los tokens de texto).

## Casos de uso

- Pruebas de integración en Transformers: cargar el fixture con `Qwen2AudioForConditionalGeneration` y comprobar que el `state_dict` coincide en nombres y formas con el checkpoint real, sin descargar los 7B.
- CI/CD de librerías: ejecutar tests de forward, loss y backward en float32, bfloat16 y float16 en pipelines automatizados con un repo de 0,2 GB.
- Validación de procesadores multimodales: usar los ficheros de tokenizer y preprocessor copiados del modelo real para probar el pipeline de preprocesado de audio sin depender del checkpoint completo.
- Desarrollo de harnesses de evaluación: verificar que las herramientas de benchmarking detectan correctamente arquitecturas de audio-texto antes de lanzarlas contra modelos reales.
- Reproducción de contratos de integración: comparar `integration.json` y `expectations` con la implementación de un framework para detectar divergencias de API.
- Docencia y prototipado: estudiar la estructura de un modelo audio-texto con un coste de descarga y cómputo mínimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (20,3M parámetros); el repo ocupa 0,2 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 o superior) e incluso CPU para los tests.
- Cabe en cualquier GPU consumer y en CPU sin problemas.
- Opciones de despliegue: Transformers (uso previsto según la documentación del repo); no está pensado para vLLM, llama.cpp, Ollama ni TGI por ser un artefacto de prueba.
- Latencia y throughput: no disponibles; al ser un fixture de 2+2 capas, la latencia es negligible y no representativa del modelo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2_audio-mic | 20,3M | no disponible | Fixture de test | no disponible | Hugging Face |
| Qwen/Qwen2-Audio-7B | 7B (aprox.) | no disponible | Modelo audio-texto real | no disponible en esta ficha | Hugging Face |
| Otros fixtures de huggingface-mic | variable (slim) | no disponible | Test de integracion | no disponible | Hugging Face |

La comparación relevante es con el checkpoint original `Qwen/Qwen2-Audio-7B`: mismo procesador y mismos nombres de tensores, pero con 2 capas de encoder y 2 de decoder en lugar de la profundidad completa, y pesos aleatorios en lugar de entrenados. No sustituye al modelo real en ningún escenario de producción.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y las salidas no tienen significado.
- Etiquetado como `test-artifact` para excluirlo de búsquedas de modelos candidatos; no debe desplegarse en producción.
- La licencia no está declarada en la información disponible; verificar antes de cualquier uso.
- No dispone de contexto, idiomas ni cuantizaciones documentadas.
- El tamaño reducido (2 capas por componente) hace que su comportamiento no sea representativo del modelo Qwen2-Audio-7B real.
- Riesgo de confusión: el nombre puede llevar a pensar que es un fine-tune de Qwen2-Audio, cuando es un fixture de integración.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/qwen2_audio-mic
- Modelo base: https://huggingface.co/Qwen/Qwen2-Audio-7B
- Documentación de uso en Transformers: `integrations/transformers/usage.md` (dentro del repo)
- Expectativas del framework: `integrations/transformers/expectations` (dentro del repo)
- Manifiesto de contrato: `integration.json` (dentro del repo)
- Procedencia del fixture: `build.json` (dentro del repo)
- Explicación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/qwen2_audio-mic.html
- Script de construcción: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reducción: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
