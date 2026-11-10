# huggingface-mic/Olmo-3-7B-Instruct-mic

## Resumen

Olmo-3-7B-Instruct-mic es un artefacto de prueba (fixture) publicado por el usuario huggingface-mic, no un modelo entrenado utilizable. Se presenta como una version "slim" (reducida) del modelo allenai/Olmo-3-7B-Instruct, con la misma arquitectura declarada (`Olmo3ForCausalLM`) pero con una configuracion drasticamente menor: solo 2 capas ocultas y 12.918.080 parametros totales, frente a los aproximadamente 7.000 millones del modelo base que dice cubrir.

El repositorio esta etiquetado explicitamente como `test-artifact` y `mic`, y su propia model card lo describe como "un fixture de 12,9M de parametros para el Olmo3 MIC", aclarando que "es un artefacto de prueba, no un modelo utilizable". Su proposito es servir de banco de pruebas para validar contratos de integracion (manifiesto `integration.json`, expectativas de Transformers, uso ejecutable) sin necesidad de cargar los pesos completos del modelo real.

Los pesos son aleatorios (semilla 17) y no han pasado por entrenamiento alguno; unicamente superaron una compuerta de sensibilidad a las entradas (cada perturbacion de las entradas del contrato movia los logits al menos 0,001). Por tanto, no debe evaluarse como un modelo de lenguaje: no genera texto coherente ni resuelve tareas. Su relevancia es exclusivamente de ingenieria y tooling.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Olmo3ForCausalLM (transformer causal, version reducida a 2 capas ocultas) |
| Parametros totales | 12.918.080 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en bfloat16) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la clase de arquitectura `Olmo3ForCausalLM` del checkpoint `allenai/Olmo-3-7B-Instruct`, pero con la configuracion encogida mediante la regla generica de `sweep.py` del proyecto transformers-mic, fijando `num_hidden_layers` a 2. Conserva los mismos nombres de tensores que el checkpoint real y copia byte a byte los ficheros de procesador del modelo base: `chat_template.jinja`, `generation_config.json`, `merges.txt`, `olmo-instruct.png`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json` y `vocab.json`.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y se validaron con una compuerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato desplazo los logits al menos 0,001 (la mas debil, `attention_mask:all_ones`, con 0,167). Los tensores se guardaron en bfloat16, el dtype con el que carga por defecto el modelo base, y se verifico que son finitos en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. La clave del fixture es `6ed8e0e79060`, que cubre todos los checkpoints cuyos ficheros de procesador son identicos byte a byte y cuya config coincide tras el encogimiento.

## Capacidades

- No dispone de capacidades reales de generacion de texto: los pesos son aleatorios y no producen salida coherente.
- No soporta razonamiento, codigo, matematicas ni vision de forma funcional.
- No implementa tool calling ni function calling mas alla de lo que declare el `generation_config.json` copiado del modelo base.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues verificadas.
- Su unica funcion es servir como fixture de integracion: valida que el codigo de carga, el tokenizador, la plantilla de chat y las expectativas de framework funcionan con la arquitectura Olmo3 sin cargar los pesos completos.
- Permite comprobar contratos de entrada (incluida `attention_mask`) mediante la compuerta de sensibilidad ya superada.

## Casos de uso

- Pruebas de integracion en CI/CD: el fixture permite ejecutar pipelines de carga y forward pass con `transformers` en segundos, sin descargar ni alojar los ~14 GB del modelo de 7B, verificando que la clase `Olmo3ForCausalLM` y los ficheros de procesador se resuelven correctamente.
- Validacion de plantillas de chat: al copiar `chat_template.jinja` byte a byte del modelo base, sirve para testear el renderizado de conversaciones y el manejo de roles sin coste de inferencia real.
- Desarrollo de tooling de tokenizacion: los ficheros `tokenizer.json`, `vocab.json` y `merges.txt` identicos al original permiten probar pipelines de tokenizacion y decodificacion contra el vocabulario real de Olmo 3.
- Verificacion de contratos de framework: el directorio `integrations/transformers/expectations` permite comprobar que una version de Transformers cumple las expectativas declaradas para Olmo3 (nombres de tensores, dtypes, formas).
- Pruebas de compatibilidad de dtypes: al ser finito en float32, bfloat16 y float16, se puede usar para validar rutas de mixed precision y comprobar que el codigo no produce NaN/Inf en forward, loss ni gradientes.
- Benchmarking de infraestructura de despliegue: util para medir tiempos de arranque, overhead de carga y comportamiento de servidores (por ejemplo, vLLM o TGI) con la arquitectura Olmo3 antes de escalar al checkpoint real.
- Regresion de codigo de investigacion: permite fijar tests unitarios que detecten roturas en la implementacion de Olmo3 sin depender de pesos entrenados ni de descargas grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un fixture con pesos aleatorios y no ha sido entrenado, por lo que cualquier metrica de calidad (MMLU, HumanEval, GSM8K, etc.) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (12,9M de parametros, aproximadamente 26 MB de pesos); el repositorio ocupa 0,0 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) e incluso CPU es suficiente; no requiere A100 ni H100.
- Cabe holgadamente en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: carga directa con `transformers` (es el uso previsto segun la model card); no se documenta soporte especifico para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; al ser un fixture de 2 capas, la inferencia seria practicamente instantanea, pero sin valor representativo del modelo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Olmo-3-7B-Instruct-mic | 12,9M | no disponible | Fixture de test (pesos aleatorios) | no disponible | Hugging Face (huggingface-mic) |
| allenai/Olmo-3-7B-Instruct | ~7B (segun modelo base declarado) | no disponible | Modelo instruct real | no disponible | Hugging Face (allenai) |
| Otros fixtures `*-mic` de huggingface-mic | variable (reducidos) | no disponible | Artefactos de test | no disponible | Hugging Face (huggingface-mic) |

La comparativa relevante es contra su propio modelo base: el fixture comparte arquitectura, tokenizador y nombres de tensores, pero no pesos ni capacidad funcional. Frente a otros fixtures del mismo autor, la diferencia esta en la arquitectura cubierta (Olmo3 frente a otras familias).

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios (semilla 17) y no han sido entrenados; la salida no tiene coherencia linguistica.
- Riesgo de confusion: el nombre incluye "Olmo-3-7B-Instruct", pero el modelo tiene 12,9M de parametros y 2 capas; no debe confundirse con el checkpoint real de allenai.
- La model card lo etiqueta como `test-artifact` precisamente para excluirlo de busquedas de modelos candidatos; usarlo en produccion seria un error de seleccion.
- Sesgos conocidos: no disponibles (no hay datos de entrenamiento ni evaluacion).
- Alucinacion: irrelevante en sentido estricto, ya que no genera contenido significativo; cualquier texto producido seria ruido.
- Licencia no especificada: no hay garantia de uso comercial; ademas, los terminos del modelo base (`allenai/Olmo-3-7B-Instruct`) podrian aplicar al derivado, pero no se detallan.
- Limitaciones de contexto e idioma: no disponibles.
- Caveat de produccion: no debe desplegarse como sustituto del modelo base; solo como dependencia de test en pipelines de integracion.
- El repositorio ocupa 0,0 GB y puede requerir reconstruir ficheros auxiliares con `python example/build_fixtures.py --fixture Olmo-3-7B-Instruct-mic`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface-mic/Olmo-3-7B-Instruct-mic
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Instruct
- Manifiesto de contrato (`integration.json`): https://huggingface.co/huggingface-mic/Olmo-3-7B-Instruct-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/Olmo-3-7B-Instruct-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/Olmo-3-7B-Instruct-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture (`build.json`): https://huggingface.co/huggingface-mic/Olmo-3-7B-Instruct-mic/blob/main/build.json
- Explicacion del encogimiento: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Olmo-3-7B-Instruct-mic.html
- Repositorio transformers-mic (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion (`build_fixtures.py`): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
