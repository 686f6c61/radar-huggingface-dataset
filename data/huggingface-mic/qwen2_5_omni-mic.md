# huggingface-mic/qwen2_5_omni-mic

## Resumen

`huggingface-mic/qwen2_5_omni-mic` es un artefacto de prueba (fixture) publicado por el equipo de Hugging Face MIC para validar la integración de frameworks con la arquitectura `Qwen2_5OmniForConditionalGeneration`, la misma que emplea el modelo real `Qwen/Qwen2.5-Omni-7B`. No es un modelo entrenado ni utilizable para inferencia real: sus pesos son aleatorios (semilla 17) y su única finalidad es servir como banco de pruebas reproducible para pipelines de integración continua en Transformers y frameworks asociados.

El repositorio contiene pesos "slim" de 25.605.164 parámetros (el propio autor menciona además un fixture secundario de 170,4M parámetros), junto con el manifiesto de contrato (`integration.json`), la documentación de uso en Transformers y el directorio de expectativas del framework. La arquitectura se ha reducido drásticamente respecto al modelo original: 2 capas en el encoder de audio, 2 capas en el modelo de texto, 2 capas en el talker y 2 capas en el DiT, manteniendo los mismos nombres de tensor que el checkpoint real.

Su relevancia es metodológica, no de rendimiento: permite a los mantenedores de frameworks verificar carga de pesos, formas de tensores, procesadores y flujos de generación sin descargar los ~16 GB del modelo Omni completo. Está etiquetado explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2_5OmniForConditionalGeneration (multimodal: audio encoder + text decoder + talker + DiT), configuracion reducida a 2 capas por modulo |
| Parametros totales | 25.605.164 (fixture principal); 170,4M en el fixture secundario `mic-qwen2_5_omni-slim` |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible (los ficheros de procesador se copian del modelo base `Qwen/Qwen2.5-Omni-7B`) |
| Licencia | no disponible en la metadata del repositorio; el fichero `LICENSE` del procesador se copia byte a byte desde `Qwen/Qwen2.5-Omni-7B` |
| Formato de pesos | safetensors (bfloat16) |
| Modelo base | Qwen/Qwen2.5-Omni-7B |
| Proposito | test-artifact / fixture de integracion |
| Tamano del repo | 1,0 GB |
| Descargas | 3.406 |
| Fecha de creacion | 2026-10-12 |
| Ultima actualizacion | 2026-11-12 |

## Arquitectura y entrenamiento

El fixture replica la topologia de `Qwen2_5OmniForConditionalGeneration`, la clase multimodal de Qwen2.5-Omni que combina un encoder de audio, un modelo de lenguaje de texto, un modulo "talker" para generacion de habla y un bloque DiT (Diffusion Transformer). Para reducir el coste, el script `sweep.py` del repositorio `transformers-mic` aplica una regla generica de "shrink": deja 2 capas en cada uno de los cuatro modulos (audio encoder, text, talker, DiT) y conserva los nombres de tensor identicos al checkpoint original, de modo que cualquier discrepancia en la carga de pesos se detecta igual que con el modelo real.

No ha habido entrenamiento. Los pesos se inicializan de forma aleatoria con semilla 17 y se validan mediante una "input-sensitivity gate": cada perturbacion de las entradas del contrato debe mover los logits al menos 0,001 (la perturbacion mas debil, `attention_mask:all_ones`, produce 0,773). Los ficheros de procesador (`tokenizer.json`, `chat_template.json`, `preprocessor_config.json`, `spk_dict.pt`, `merges.txt`, `vocab.json`, entre otros) se copian byte a byte desde `Qwen/Qwen2.5-Omni-7B`, garantizando que el pipeline de preprocesado sea identico al del modelo real. El resultado se guarda en bfloat16, el dtype por defecto del checkpoint original, y se verifica que forward, loss y gradientes son finitos en float32, bfloat16 y float16.

## Capacidades

- Carga y ejecucion del grafo completo `Qwen2_5OmniForConditionalGeneration` con formas de tensor equivalentes al modelo real.
- Validacion de integracion en Transformers: importacion, `from_pretrained`, forward pass y generacion de texto con pesos aleatorios.
- Verificacion de contratos de entrada y salida definidos en `integration.json` y en `integrations/transformers/expectations`.
- Comprobacion de ficheros de procesador (tokenizer, chat template, preprocessor de audio, diccionario de hablantes) copiados del modelo base.
- Test de sensibilidad de entradas: perturbaciones sobre `attention_mask` y otras entradas deben alterar los logits.
- Verificacion de estabilidad numerica en float32, bfloat16 y float16.
- No ofrece generacion de texto, razonamiento, codigo, matematicas, vision, audio real, tool calling, agentes ni capacidades multilingues utilizables: sus pesos son aleatorios.

## Casos de uso

- Integracion continua en Transformers: ejecutar la suite de tests de `Qwen2_5OmniForConditionalGeneration` en cada PR sin descargar el checkpoint de ~16 GB, ya que el fixture de 25,6M parametros cubre los mismos nombres de tensor y el mismo contrato.
- Validacion de pipelines de carga de pesos: comprobar que un nuevo loader o una refactorizacion de `from_pretrained` mapea correctamente todos los tensores del modelo Omni comparando contra el fixture.
- Pruebas de regresion de procesadores: verificar que los ficheros de tokenizer, chat template y preprocessor de audio se cargan y aplican igual que en `Qwen/Qwen2.5-Omni-7B`, al estar copiados byte a byte.
- Desarrollo de nuevas estrategias de atencion o kernels: usar el fixture como caso de prueba rapido del grafo multimodal (audio + texto + talker + DiT) antes de saltar al modelo completo.
- Validacion de estabilidad numerica: ejecutar forward, loss y backward en float32, bfloat16 y float16 para detectar NaN/Inf en cambios de kernels o mixed precision.
- Reproducibilidad de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture mic-qwen2_5_omni-slim` y comparar hashes registrados en `build.json` para auditar procedencia.
- Docencia y experimentacion: estudiar la topologia de Qwen2.5-Omni con un coste de memoria minimo, ya que el repo pesa 1,0 GB frente a los ~16 GB del modelo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios, por lo que cualquier metrica de calidad (MMLU, HumanEval, GSM8K, etc.) carece de sentido.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para el fixture principal de 25,6M parametros en bfloat16 (los pesos ocupan ~51 MB; el repo de 1,0 GB incluye ademas procesadores y ficheros auxiliares).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) o incluso CPU es suficiente; no requiere A100 ni H100.
- Cabe en cualquier GPU consumer y en la mayoria de entornos CPU para tests de integracion.
- Opciones de despliegue: Transformers (referencia principal, con `integrations/transformers/usage.md`), y en general cualquier framework que soporte `Qwen2_5OmniForConditionalGeneration`. No se documentan recetas para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; al ser un fixture de test no se publican metricas de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/qwen2_5_omni-mic | 25,6M (fixture) | no disponible | Test-artifact para integracion de frameworks | no disponible | Hugging Face, 3.406 descargas |
| Qwen/Qwen2.5-Omni-7B | ~7B | no disponible en esta ficha | Modelo multimodal real (audio + texto + habla) | no disponible en esta ficha | Hugging Face (modelo base) |
| huggingface-mic/mic-qwen2_5_omni-slim | 170,4M (fixture) | no disponible | Fixture secundario del mismo contrato | no disponible | Referenciado en la model card |

La comparativa con alternativas reales de la misma categoria (modelos multimodales de ~7B) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios (semilla 17) y cualquier salida es ruido. Esta etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos.
- No debe desplegarse en produccion bajo ninguna circunstancia, ni para generacion de texto, audio o cualquier otra tarea.
- La licencia no aparece en la metadata del repositorio; el fichero `LICENSE` se copia del modelo base `Qwen/Qwen2.5-Omni-7B`, por lo que las condiciones de uso comercial deben consultarse en el repositorio original.
- Los idiomas soportados no estan declarados; los ficheros de procesador se heredan del modelo base, pero el fixture no ha sido entrenado para ningun idioma.
- Riesgo de confusion: el nombre y la estructura pueden llevar a error si se descubre via busqueda; verificar siempre la etiqueta `test-artifact` antes de usarlo.
- No se documentan capacidades de tool calling, agentes, vision, audio real ni modo thinking: el fixture solo valida la topologia y el contrato de integracion.
- El repositorio incluye un segundo fixture (`mic-qwen2_5_omni-slim`, 170,4M) cuya relacion exacta con el principal conviene revisar en `build.json` antes de reutilizarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/qwen2_5_omni-mic
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Manifiesto de contrato: `integration.json` (en el repositorio)
- Uso en Transformers: `integrations/transformers/usage.md` (en el repositorio)
- Expectativas de Transformers: `integrations/transformers/expectations` (en el repositorio)
- Procedencia del fixture: `build.json` (en el repositorio)
- Explicacion del shrink: https://huggingface-mic-mic-coverage.static.hf.space/shrink/qwen2_5_omni-mic.html
- Repositorio de herramientas: https://github.com/huggingface/transformers-mic
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de shrink: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
