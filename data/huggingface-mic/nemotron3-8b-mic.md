# huggingface-mic/nemotron3-8b-mic

## Resumen

`nemotron3-8b-mic` es un artefacto de prueba (fixture) publicado por el usuario `huggingface-mic`, no un modelo utilizable. Se presenta como una version reducida del checkpoint `thhaus/nemotron3-8b`, mantenida con la misma arquitectura (`NemotronForCausalLM`) pero con una configuracion mucho mas pequena: 32.834.176 parametros frente a los aproximadamente 8.000 millones que sugiere el nombre del modelo base. Su proposito es servir como fixture reproducible para validar contratos de integracion con frameworks (Transformers) sin necesidad de descargar ni ejecutar el checkpoint completo.

El repositorio incluye los pesos reducidos, un manifiesto de contrato (`integration.json`), ejemplos de uso con Transformers, expectativas del framework y metadatos de construccion (`build.json`). Los pesos son aleatorios (semilla 17) y se generaron mediante la regla generica de reduccion de `sweep.py`, que reduce el numero de capas ocultas a 2. Los ficheros de procesador (tokenizer, `special_tokens_map.json`, `generation_config.json`) se copiaron byte a byte del modelo base.

Es relevante para desarrolladores que trabajan en tooling de integracion de modelos: permite ejecutar tests de contrato (nombres de tensores, dtypes, sensibilidad de entradas, finitud de gradientes) de forma rapida y ligera. No debe confundirse con un modelo entrenado: la propia model card lo etiqueta como `test-artifact` para excluirlo de busquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`NemotronForCausalLM`), 2 capas ocultas |
| Parametros totales | 32.834.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | `thhaus/nemotron3-8b` |
| Dtype de guardado | bfloat16 |
| Tamano del repositorio | 0,1 GB |
| Semilla de pesos | 17 (pesos aleatorios) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con la misma clase de arquitectura que el checkpoint original (`NemotronForCausalLM`), pero con `num_hidden_layers` reducido a 2 mediante la regla generica de reduccion de `sweep.py` del proyecto `transformers-mic`. Los nombres de tensores coinciden con los del checkpoint real, de modo que sirve como sustituto estructural en tests de integracion. Los ficheros de procesador (`generation_config.json`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer.model`, `tokenizer_config.json`) se copiaron byte a byte desde `thhaus/nemotron3-8b`.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y se validaron con una puerta de sensibilidad de entradas: cada perturbacion de las entradas del contrato desplaza los logits al menos 0,001 (la mas debil, `input_ids:roll_batch`, con 0,926). El modelo es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. El fixture esta identificado por la clave `ee89462b203c` y cubre todos los checkpoints cuyos ficheros de procesador son identicos byte a byte y cuya config coincide tras la reduccion.

## Capacidades

- Generacion de texto: solo a nivel estructural; los pesos aleatorios no producen salidas coherentes.
- Razonamiento, codigo, matematicas y vision: no disponible (no es un modelo entrenado).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidad especial: validacion de contratos de integracion con Transformers (nombres de tensores, dtypes, sensibilidad de entradas, finitud de gradientes).

## Casos de uso

- Tests de integracion en CI: usar el fixture para verificar que una nueva version de Transformers carga el modelo, ejecuta forward y calcula gradientes sin descargar el checkpoint completo de 8B.
- Validacion de contratos de framework: comprobar que nombres de tensores y dtypes coinciden con los esperados por el pipeline de `thhaus/nemotron3-8b` antes de desplegar el modelo real.
- Desarrollo de tooling de serializacion: probar rutas de carga y guardado en safetensors, bfloat16 y float16 con un repositorio de 0,1 GB.
- Pruebas de sensibilidad de entradas: reproducir la puerta de sensibilidad (`input_ids:roll_batch`, etc.) para validar cambios en el preprocesado del tokenizer.
- Regresion de tokenizer: al copiar los ficheros de procesador byte a byte, sirve para detectar cambios incompatibles en `tokenizer.json` o `special_tokens_map.json`.
- Formacion y demos de integracion: ejemplos de uso en `integrations/transformers/usage.md` para documentar como integrar modelos Nemotron en pipelines propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios, por lo que las metricas de calidad no aplican.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (32,8M parametros, ~66 MB de pesos) y en float32 (~131 MB).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o incluso CPU; no requiere acelerador de datacenter.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 1 GB de VRAM.
- Opciones de despliegue: Transformers (referencia en `integrations/transformers/usage.md`); vLLM, llama.cpp, Ollama y TGI no estan documentados para este fixture y no se garantiza su compatibilidad con pesos aleatorios.
- Latencia y throughput: no disponible; al ser un modelo de 2 capas, la latencia sera muy baja, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| `huggingface-mic/nemotron3-8b-mic` | 32,8M | no disponible | no disponible | Fixture de test |
| `thhaus/nemotron3-8b` | ~8B (segun nombre) | no disponible | no disponible | Modelo base real |
| Otros fixtures `*-mic` de `huggingface-mic` | variable | no disponible | no disponible | Fixtures de test equivalentes |

La comparativa con modelos de produccion de la misma categoria (8B) no es significativa: el fixture no comparte pesos ni comportamiento con el modelo base, solo la estructura y los ficheros de procesador.

## Limitaciones y advertencias

- Pesos aleatorios: las salidas no son coherentes; no debe usarse para inferencia real ni para evaluacion de calidad.
- Etiquetado como `test-artifact`: el autor lo excluye explicitamente de busquedas de modelos candidatos.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier uso fuera de tests.
- Idiomas y contexto no documentados: no hay informacion sobre ventana de contexto ni cobertura linguistica.
- No es un sustituto del checkpoint `thhaus/nemotron3-8b`: solo replica la estructura y los ficheros de procesador.
- Riesgo de confusion en pipelines automatizados: si se filtra a un catalogo de modelos, podria desplegarse por error en lugar del modelo real.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/nemotron3-8b-mic
- Modelo base: https://huggingface.co/thhaus/nemotron3-8b
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/nemotron3-8b-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/nemotron3-8b-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/nemotron3-8b-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/nemotron3-8b-mic/blob/main/build.json
- Documentacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/nemotron3-8b-mic.html
- Repositorio `transformers-mic` (script `sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
