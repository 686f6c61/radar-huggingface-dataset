# huggingface-mic/Qwen3.5-0.8B-text-only-mic

## Resumen

Qwen3.5-0.8B-text-only-mic es un artefacto de prueba (fixture) publicado por la organizacion huggingface-mic, no un modelo utilizable. Se trata de una version reducida artificialmente del checkpoint principled-intelligence/Qwen3.5-0.8B-text-only, generada para validar el contrato de integracion del modelo original con frameworks como Transformers. El repositorio combina pesos "slim", ejemplos de uso ejecutables y un directorio de expectativas de framework en un unico paquete.

El fixture conserva la arquitectura declarada del modelo base (Qwen3_5ForCausalLM) pero reduce el numero de capas ocultas a 2 mediante la regla generica de sweep.py, lo que deja un total de 16.045.456 parametros reales en safetensors. Los pesos son aleatorios (semilla 17) y no han sido entrenados: superaron una puerta de sensibilidad de entrada segun la model card, pero no representan ningun conocimiento linguistico ni capacidad generativa.

Su relevancia es exclusivamente de ingenieria: permite a los mantenedores de transformers-mic comprobar que el pipeline de carga, tokenizacion, plantilla de chat y forward pass funciona con la misma estructura de tensores que el checkpoint real, sin necesidad de descargar ni ejecutar el modelo completo. La etiqueta `test-artifact` lo excluye deliberadamente de las busquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForCausalLM (transformer causal, texto) |
| Parametros totales | 16.045.456 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la clase `Qwen3_5ForCausalLM` del modelo base, pero con `num_hidden_layers` reducido a 2 aplicando la regla generica de `sweep.py` del repositorio transformers-mic. Los nombres de los tensores coinciden exactamente con los del checkpoint real, de modo que cualquier codigo que cargue el modelo original deberia cargar el fixture sin cambios de estructura. Los ficheros de procesador (`chat_template.jinja`, `generation_config.json`, `tokenizer.json`, `tokenizer_config.json`) se copiaron byte a byte desde `principled-intelligence/Qwen3.5-0.8B-text-only`.

No hubo entrenamiento. Los pesos se inicializaron de forma aleatoria con semilla 17 y solo se validaron contra una puerta de sensibilidad de entrada: cada perturbacion de las entradas del contrato debia mover los logits al menos 0,001 (el caso mas debil, `input_ids:roll_batch`, alcanzo 0,838). El modelo se guardo en bfloat16, el dtype por defecto del checkpoint real, y se verifico que forward, loss y gradientes son finitos en float32, bfloat16 y float16. No se dispone de informacion sobre datos de entrenamiento, RLHF, DPO ni innovaciones de decodificacion del modelo base en la informacion proporcionada.

## Capacidades

- Generacion de texto: no aplicable; los pesos son aleatorios y no producen salida coherente.
- Razonamiento, codigo y matematicas: no disponible en el fixture.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, vision, audio): no disponible.
- Verificacion de contrato: el fixture si demuestra la compatibilidad de carga, tokenizacion, plantilla de chat y forward pass con la arquitectura Qwen3.5 text-only.

## Casos de uso

- Pruebas de integracion en CI: usar el fixture para validar que una nueva version de Transformers carga, tokeniza y ejecuta un forward pass con la arquitectura Qwen3_5ForCausalLM sin descargar el checkpoint completo de 0,8B.
- Desarrollo de plantillas de chat: comprobar que `chat_template.jinja` se renderiza correctamente en el pipeline de tokenizacion antes de desplegar el modelo real.
- Validacion de contratos de framework: ejecutar el directorio `integrations/transformers/expectations` para detectar regresiones en la API de carga de modelos.
- Pruebas de dtype: verificar que el codigo de inferencia funciona en float32, bfloat16 y float16 sin producir NaN ni infinitos en forward, loss o gradientes.
- Reproduccion de fixtures: reconstruir el artefacto con `build_fixtures.py --fixture Qwen3.5-0.8B-text-only-mic` y comparar hashes registrados en `build.json`.
- Formacion interna: servir como ejemplo minimo de como empaquetar pesos, uso y expectativas en un unico repositorio de HuggingFace.
- Pruebas de sensibilidad de entrada: reutilizar la puerta de perturbacion para comprobar que los cambios en el pipeline afectan a los logits de forma medible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (16M parametros, ~32 MB de pesos) mas overhead de activaciones y tokenizador; el repositorio completo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 1 GB de VRAM; tambien ejecutable en CPU.
- Cabe en GPU consumer: si, en cualquier RTX o iGPU moderna, e incluso en Raspberry Pi.
- Opciones de despliegue: Transformers (via `integrations/transformers/usage.md`); vLLM, llama.cpp, Ollama y TGI no estan documentados para este fixture.
- Latencia y throughput: no disponibles; al ser un modelo de 2 capas, la latencia estaria dominada por el overhead de framework, no por el computo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-text-only-mic | 16,0M (fixture) | no disponible | Test artifact | no disponible | HuggingFace |
| principled-intelligence/Qwen3.5-0.8B-text-only | ~0,8B (nominal) | no disponible | Modelo base real | no disponible | HuggingFace |
| Otros fixtures de transformers-mic | variable (reducidos) | no disponible | Test artifacts | no disponible | HuggingFace (org huggingface-mic) |

No se dispone de datos de rendimiento para establecer una comparativa funcional con modelos de la misma categoria.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y la salida no tiene coherencia linguistica.
- Solo tiene 2 capas ocultas frente a la profundidad del modelo base; cualquier comportamiento observado no es representativo del checkpoint real.
- No debe usarse en produccion, evaluaciones de calidad ni decisiones automatizadas.
- La licencia no esta declarada en la informacion disponible; verificar los terminos del modelo base antes de reutilizar sus ficheros de procesador.
- El tokenizador y la plantilla de chat se copiaron del modelo base, por lo que heredan sus sesgos y limitaciones linguisticas, aunque el fixture no los ejerce.
- La etiqueta `test-artifact` lo excluye de busquedas de modelos candidatos; no confundirlo con un checkpoint entrenado.
- No hay informacion sobre longitud de contexto, idiomas ni cuantizaciones soportadas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/huggingface-mic/Qwen3.5-0.8B-text-only-mic
- Modelo base: https://huggingface.co/principled-intelligence/Qwen3.5-0.8B-text-only
- Script de reduccion (sweep.py): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion (build_fixtures.py): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Explicacion del shrink: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Qwen3.5-0.8B-text-only-mic.html
- Manifiesto de contrato (integration.json): https://huggingface.co/huggingface-mic/Qwen3.5-0.8B-text-only-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/Qwen3.5-0.8B-text-only-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/Qwen3.5-0.8B-text-only-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture (build.json): https://huggingface.co/huggingface-mic/Qwen3.5-0.8B-text-only-mic/blob/main/build.json
