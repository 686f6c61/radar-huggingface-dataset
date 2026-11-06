# huggingface-mic/DeepSeek-V4-Flash-0731-mic

## Resumen

DeepSeek-V4-Flash-0731-mic es un artefacto de prueba (fixture) publicado por el usuario `huggingface-mic`, no un modelo utilizable. Se trata de una version reducida del checkpoint `deepseek-ai/DeepSeek-V4-Flash-0731`, con solo 19,96 millones de parametros (frente a los cientos de miles de millones del modelo original), cuatro capas y pesos generados aleatoriamente con semilla 17. Su proposito es servir como banco de pruebas para el pipeline de integracion y validacion del ecosistema `transformers-mic`, verificando que la arquitectura `DeepseekV4ForCausalLM` se carga, ejecuta y propaga gradientes correctamente.

El repositorio combina pesos reducidos en formato safetensors con un manifiesto de contrato (`integration.json`), documentacion de uso para Transformers y un directorio de expectativas de framework. Los ficheros de procesador (tokenizer, configuracion de generacion, licencia) se copian byte a byte del checkpoint original, de modo que el fixture reproduce fielmente los nombres de tensores y el comportamiento de tokenizacion del modelo real.

Es relevante ahora porque permite a desarrolladores validar integraciones de la familia DeepSeek V4 sin necesidad de descargar ni ejecutar el modelo completo. No obstante, sus pesos son aleatorios: cualquier salida generada carece de valor semantico y no debe usarse en produccion, evaluacion de calidad ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepseekV4ForCausalLM (transformer causal, configuracion reducida) |
| Parametros totales | 19.962.341 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (se copia el fichero LICENSE del modelo base, pero su contenido no se detalla) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture emplea la misma clase arquitectonica que el modelo base, `DeepseekV4ForCausalLM`, pero con la configuracion reducida mediante la regla generica de `sweep.py` del repositorio `transformers-mic`: `num_hidden_layers` se fija en 4. Los pesos son aleatorios (semilla 17) y no han pasado por ningun proceso de entrenamiento, RLHF ni DPO. La unica validacion aplicada es una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato desplaza los logits al menos 0,001 (el caso mas debil, `attention_mask:all_ones`, produce 0,873), lo que garantiza que el modelo responde a los cambios de input sin necesidad de entrenamiento.

Los ficheros de procesador (`LICENSE`, `generation_config.json`, `tokenizer.json`, `tokenizer_config.json`) se copian byte a byte desde `deepseek-ai/DeepSeek-V4-Flash-0731`, por lo que el tokenizador y los nombres de tensores coinciden con el checkpoint real. El fixture se ha verificado como finito en float32, bfloat16 y float16 tanto en forward como en calculo de perdida y gradientes. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni innovaciones tecnicas del modelo original.

## Capacidades

- Carga y ejecucion de la arquitectura `DeepseekV4ForCausalLM` en Transformers con fines de validacion de integracion.
- Verificacion de nombres de tensores y compatibilidad de tokenizador con el checkpoint real.
- Pruebas de forward pass, calculo de perdida y retropropagacion de gradientes en float32, bfloat16 y float16.
- Validacion de contratos de entrada (incluida `attention_mask`) mediante la puerta de sensibilidad.
- No genera texto con sentido: los pesos son aleatorios y las salidas carecen de valor semantico.
- No dispone de tool calling, capacidades de agente, vision, audio ni modo de razonamiento, al ser un artefacto de prueba.

## Casos de uso

- Validacion de pipelines de CI para Transformers: el fixture permite comprobar que una version nueva de la libreria carga `DeepseekV4ForCausalLM` y ejecuta forward sin errores, con un repo de solo 0,2 GB.
- Pruebas de compatibilidad de tokenizador: al copiar `tokenizer.json` y `tokenizer_config.json` del modelo real, sirve para verificar que el preprocesado de texto coincide con el checkpoint original.
- Desarrollo de herramientas de inspeccion de pesos: los nombres de tensores identicos al checkpoint real permiten probar scripts de carga, conversion o mapeo de pesos sin descargar el modelo completo.
- Verificacion de estabilidad numerica: util para comprobar que un framework mantiene resultados finitos en float32, bfloat16 y float16 en forward, perdida y gradientes.
- Test de contratos de integracion: el manifiesto `integration.json` y el directorio `expectations` permiten validar que una implementacion respeta las entradas y salidas esperadas.
- Formacion y documentacion interna: sirve como ejemplo reproducible de como reducir un checkpoint grande a un fixture manejable con `build_fixtures.py`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K) careceria de significado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con 19,96 millones de parametros en bfloat16 (unos 40 MB de pesos) mas overhead de activaciones y tokenizador.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) o incluso CPU; no requiere A100 ni H100.
- Cabe en cualquier GPU consumer e integrada; el repo completo ocupa 0,2 GB.
- Opciones de despliegue: Transformers con PyTorch es la via documentada (`integrations/transformers/usage.md`); no se documentan vLLM, llama.cpp, Ollama ni TGI para este fixture.
- Latencia y throughput: no disponibles; al ser un modelo de 4 capas, la inferencia es practicamente instantanea, pero sin valor practico por los pesos aleatorios.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash-0731-mic | 19,96 M | no disponible | Fixture de prueba | no disponible | Hugging Face (265 descargas) |
| deepseek-ai/DeepSeek-V4-Flash-0731 | no disponible en la informacion | no disponible | Modelo real de produccion | no disponible | Hugging Face (modelo base) |
| Otros fixtures `transformers-mic` | Variable (reducidos) | no disponible | Validacion de integracion | no disponible | Hugging Face |

La comparativa con modelos de produccion de la misma categoria no es posible con los datos disponibles: el fixture no compite en calidad ni rendimiento, solo replica la interfaz del modelo base a escala reducida.

## Limitaciones y advertencias

- Pesos aleatorios: las salidas no tienen significado; no usar en produccion, evaluacion ni demos publicas.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; no es un modelo entrenado.
- Configuracion reducida a 4 capas: no reproduce el comportamiento del checkpoint completo mas alla de la interfaz.
- Licencia no disponible: aunque se copia el fichero `LICENSE` del modelo base, su contenido no se detalla, por lo que el uso comercial queda sin clarificar.
- Idiomas y contexto no documentados; no se puede asumir ninguna capacidad multilingue ni de ventana larga.
- Riesgo de confusion: el nombre incluye "DeepSeek-V4-Flash", lo que puede llevar a error si se confunde con el modelo real.
- Sin soporte de tool calling, agentes, vision ni audio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/DeepSeek-V4-Flash-0731-mic
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Manifiesto de contrato: `integration.json` (en el repo)
- Uso con Transformers: `integrations/transformers/usage.md` (en el repo)
- Expectativas de Transformers: `integrations/transformers/expectations` (en el repo)
- Procedencia del fixture: `build.json` (en el repo)
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/DeepSeek-V4-Flash-0731-mic.html
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reduccion: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
