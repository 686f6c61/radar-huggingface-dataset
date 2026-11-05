# huggingface-mic/qwen2_5_omni-mic

## Resumen

`huggingface-mic/qwen2_5_omni-mic` no es un modelo entrenado, sino un artefacto de prueba (fixture) derivado de `Qwen/Qwen2.5-Omni-7B`. Lo publica la organizacion `huggingface-mic` dentro del proyecto `transformers-mic` y su proposito es servir como sustrato ejecutable para validar contratos de integracion con frameworks (principalmente Transformers), no para inferencia real. El repositorio incluye pesos "slim", un manifiesto de contrato (`integration.json`), documentacion de uso y expectativas del framework.

El fixture conserva la arquitectura declarada del modelo base (`Qwen2_5OmniForConditionalGeneration`) pero con una configuracion drasticamente reducida: 2 capas en el encoder de audio, 2 capas en el modelo de texto, 2 en el talker y 2 en el DiT. Los pesos son aleatorios (semilla 17) y los ficheros del procesador (tokenizer, chat template, preprocessor config, `spk_dict.pt`, etc.) se copian byte a byte del checkpoint original. El conteo real de parametros reportado en safetensors es de 25.605.164, muy lejos de los aproximadamente 7.000 millones del modelo Qwen2.5-Omni-7B.

Su relevancia es operativa: permite ejecutar pipelines de CI y pruebas de integracion que ejercitan la ruta de carga, el forward, la perdida y los gradientes de un modelo omni-modal sin descargar ni computar el checkpoint completo. Cualquier uso como modelo generativo, de razonamiento o multimodal producira salidas sin sentido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2_5OmniForConditionalGeneration (variante reducida: 2 capas en encoder de audio, 2 en texto, 2 en talker, 2 en DiT) |
| Parametros totales | 25.605.164 (segun safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de la config del base, no verificada en este fixture) |
| Tipos de cuantizacion | no disponible (pesos guardados en bfloat16; el autor declara finitud en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible en el repo; los ficheros del procesador copiados incluyen el `LICENSE` del modelo base `Qwen/Qwen2.5-Omni-7B` |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la topologia del modelo omni-modal de Qwen (encoder de audio, torre de texto, talker y DiT) pero con un numero minimo de capas por componente. No hay entrenamiento: los pesos son aleatorios con semilla 17 y se aceptan porque superan una puerta de sensibilidad a la entrada (cada perturbacion de las entradas del contrato mueve los logits al menos 0,001; la mas debil, `attention_mask:all_ones`, mueve 0,818). Los nombres de tensores coinciden con los del checkpoint real, de modo que el codigo que carga el modelo real puede cargar el fixture sin cambios.

Los ficheros del procesador se copian byte a byte del checkpoint `Qwen/Qwen2.5-Omni-7B`: `LICENSE`, `added_tokens.json`, `chat_template.json`, `generation_config.json`, `merges.txt`, `preprocessor_config.json`, `special_tokens_map.json`, `spk_dict.pt`, `tokenizer.json`, `tokenizer_config.json` y `vocab.json`. La generacion del fixture se realiza con `build_fixtures.py` y la regla generica de reduccion de `sweep.py`; `build.json` registra fuentes fijadas, resultados de la puerta y hashes de ficheros. La clave del fixture es `09b9a77fd907`. Existe ademas un fixture hermano mas pequeno, `mic-qwen2_5_omni-slim` (170,4 M de parametros, clave `e46cc4eef696`), que cubre checkpoints con procesadores identicos.

## Capacidades

- Carga y ejecucion de la clase `Qwen2_5OmniForConditionalGeneration` en Transformers, con forward, calculo de perdida y retropropagacion de gradientes en float32, bfloat16 y float16.
- Validacion de contratos de integracion: el manifiesto `integration.json` y el directorio `integrations/transformers/expectations` definen entradas y salidas esperadas.
- Comprobacion de sensibilidad a la entrada (perturbaciones de `attention_mask`, entre otras) como criterio de aceptacion del fixture.
- No ofrece generacion de texto, razonamiento, codigo, matematicas, vision, audio ni tool calling con sentido: los pesos son aleatorios.
- No soporta agentes, razonamiento multi-paso ni capacidades multilingues reales.
- No hay modo thinking, vision ni audio funcional, aunque la arquitectura contemple esos modulos.

## Casos de uso

- Pruebas de integracion en CI para Transformers: cargar el fixture, ejecutar un forward y verificar que las formas y dtypes de las salidas coinciden con las expectativas declaradas en `integrations/transformers/expectations`, sin necesidad de GPU de gran memoria.
- Validacion de pipelines de carga de checkpoints: comprobar que el codigo que carga `Qwen/Qwen2.5-Omni-7B` funciona igual con el fixture gracias a que los nombres de tensores coinciden.
- Pruebas de regresion de gradientes: verificar que el modelo es finito en float32, bfloat16 y float16 (forward, loss y gradientes) tras cambios en el codigo del framework.
- Desarrollo de utilidades de tokenizacion y chat template: al copiarse el procesador byte a byte, se pueden probar plantillas de chat, tokens especiales y preprocesado de audio sin depender del checkpoint grande.
- Reproducibilidad de experimentos de reduccion de modelos: `build.json` y `sweep.py` permiten reconstruir el fixture y auditar hashes y fuentes fijadas.
- Docencia y demos de arquitectura omni-modal: inspeccionar la estructura de modulos (encoder de audio, texto, talker, DiT) con un coste de descarga de 1 GB en lugar de decenas de GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta metricas de calidad, latencia ni throughput; el unico dato cuantitativo es la puerta de sensibilidad a la entrada (variacion minima de logits de 0,001; 0,818 en el caso mas debil).

## Requisitos de hardware

- VRAM estimada para inferencia: el fixture pesa 1 GB en repositorio y 25,6 M de parametros en bfloat16, por lo que cabe holgadamente en cualquier GPU consumer (incluso en CPU).
- GPU recomendadas: no aplica para uso real; cualquier GPU con al menos 2-4 GB libres es suficiente para ejecutar el fixture.
- Cabe en GPU consumer: si, en cualquier RTX o equivalente, y tambien en CPU.
- Opciones de despliegue: Transformers (ruta principal, segun `integrations/transformers/usage.md`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser pesos aleatorios y una configuracion minima, no son representativos del modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/qwen2_5_omni-mic` | 25,6 M (fixture) | no disponible | Pruebas de integracion | no disponible (LICENSE del base incluido) | HuggingFace |
| `mic-qwen2_5_omni-slim` (mismo autor) | 170,4 M (fixture) | no disponible | Pruebas de integracion, cobertura de checkpoints con procesador identico | no disponible | HuggingFace |
| `Qwen/Qwen2.5-Omni-7B` | ~7.000 M | no disponible en esta ficha | Modelo omni-modal real (texto, audio, vision) | no disponible en esta ficha | HuggingFace |

La comparativa con modelos de la misma categoria (modelos omni-modales de ~7B) no procede: este repositorio es un artefacto de prueba, no un modelo funcional. Cualquier comparacion de rendimiento con Qwen2.5-Omni-7B u otros modelos equivalentes seria invalida.

## Limitaciones y advertencias

- Pesos aleatorios: las salidas no tienen significado; no debe usarse para generacion, razonamiento, codigo, vision ni audio.
- Etiquetado explicitamente como `test-artifact` por el autor para excluirlo de busquedas de modelos candidatos; respetar esa etiqueta en cualquier catalogo.
- Licencia no declarada en el repositorio; los ficheros copiados incluyen el `LICENSE` del modelo base, pero la licencia aplicable al fixture en si no esta especificada.
- El conteo de parametros (25,6 M) no representa al modelo base (~7B); no usar esta cifra para estimar costes del modelo real.
- La configuracion reducida (2 capas por componente) no reproduce el comportamiento numerico del checkpoint completo; los tests validan contratos, no calidad.
- Riesgo de confusion en pipelines automaticos: el nombre del repositorio incluye `qwen2_5_omni`, lo que puede provocar descargas accidentales en lugar del modelo real.
- No hay garantia de que la longitud de contexto, los idiomas o las capacidades multimodales del base se conserven en el fixture.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/huggingface-mic/qwen2_5_omni-mic
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/qwen2_5_omni-mic.html
- Repositorio `transformers-mic` (script `sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
