# huggingface-mic/Qwen3.8-Flash-Next-mic

## Resumen

`huggingface-mic/Qwen3.8-Flash-Next-mic` no es un modelo entrenado, sino un artefacto de prueba (fixture) generado por el proyecto MIC de Hugging Face para validar la integración de la arquitectura `Qwen4ExpForConditionalGeneration` en Transformers. Se construye a partir del checkpoint `Qwen/Qwen3.8-Flash-Next`, del que hereda configuración, tokenizador, procesadores y nombres de tensores, pero con los pesos inicializados de forma aleatoria (semilla 17) y la profundidad del torreón de texto reducida a 4 capas. El resultado es un repositorio de 5,8 GB con 33.880.163 parámetros declarados en los safetensors, muy por debajo de los 353,9 M que la propia model card menciona como referencia del fixture.

Su relevancia es metodológica, no funcional. Permite a los mantenedores de Transformers verificar contratos de entrada/salida, sensibilidad del modelo ante perturbaciones de los inputs y consistencia de la API multimodal sin necesidad de descargar ni ejecutar el checkpoint completo. La model card lo etiqueta explícitamente como `test-artifact` y advierte de que "no es un modelo usable", por lo que cualquier evaluación de capacidades, calidad o rendimiento carece de sentido sobre este repositorio.

Conviene subrayar que la información pública es escasa y en gran parte contradictoria: la ficha de Hugging Face no declara licencia, idiomas ni pipeline, y la model card repite bloques de texto varias veces. Esta ficha refleja únicamente lo que consta en la información disponible y marca como "no disponible" todo aquello que no se puede verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen4ExpForConditionalGeneration` (multimodal condicional, derivada de la familia Qwen; torreón de texto reducido a 4 capas) |
| Parametros totales | 33.880.163 (según safetensors); la model card menciona 353,9 M como cifra del fixture |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; pesos guardados en float32 |
| Idiomas soportados | no disponible (los ficheros de tokenizador se copian del checkpoint base) |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo es un fixture de la arquitectura `Qwen4ExpForConditionalGeneration`, orientada a generación condicional multimodal (texto e imagen/vídeo, a juzgar por la presencia de `preprocessor_config.json` y `video_preprocessor_config.json`). Se ha generado aplicando la regla genérica de reducción de `sweep.py` del repositorio `transformers-mic`, que en este caso deja el torreón de texto en 4 capas ocultas. Los ficheros de procesamiento (`tokenizer.json`, `tokenizer_config.json`, `vocab.json`, `merges.txt`, `chat_template.jinja`, `generation_config.json`, `preprocessor_config.json`, `video_preprocessor_config.json` y `LICENSE`) se copian byte a byte desde `Qwen/Qwen3.8-Flash-Next`, de modo que el contrato de tokenización y preprocesado coincide con el del modelo real.

No hay entrenamiento: los pesos se inicializan aleatoriamente con semilla 17 y se aceptan si superan una puerta de sensibilidad a las entradas, es decir, si cada perturbación de los inputs del contrato mueve los logits al menos 0,001 (el caso más débil, `pixel_values:roll_batch`, alcanza 0,0013). Los tensores conservan los mismos nombres que el checkpoint original y el conjunto es finito en float32, bfloat16 y float16 tanto en forward como en pérdida y gradientes. El `build.json` del repositorio registra las fuentes fijadas, los resultados de la puerta y los hashes de los ficheros.

## Capacidades

- No es un modelo funcional: al tener pesos aleatorios, no genera texto, código ni razonamiento con sentido.
- Sirve como contrato ejecutable para validar la integración de `Qwen4ExpForConditionalGeneration` en Transformers (carga, forward, pérdida y gradientes).
- Cubre entradas multimodales declaradas en el contrato: `input_ids`, `pixel_values` y variantes de perturbación como `pixel_values:roll_batch`.
- Verifica la paridad de nombres de tensores con el checkpoint real `Qwen/Qwen3.8-Flash-Next`.
- Permite comprobar la estabilidad numérica en float32, bfloat16 y float16.
- No se declaran capacidades de tool calling, agentes, thinking mode, audio ni multilingüismo.

## Casos de uso

- Integración continua de Transformers: ejecutar el fixture en la suite de tests para detectar regresiones en la clase `Qwen4ExpForConditionalGeneration` sin descargar el checkpoint completo.
- Validación de contratos de entrada: comprobar que perturbaciones de `input_ids` y `pixel_values` producen cambios medibles en los logits, tal como exige la puerta de sensibilidad.
- Pruebas de paridad de tensores: verificar que los nombres y formas de los parámetros coinciden con `Qwen/Qwen3.8-Flash-Next` antes de publicar una nueva versión del modelo real.
- Desarrollo de pipelines multimodales: probar el preprocesado de imagen y vídeo con los ficheros de procesador copiados byte a byte del modelo base.
- Pruebas de dtype: comprobar que forward, pérdida y gradientes son finitos en float32, bfloat16 y float16 en entornos de entrenamiento mixto.
- Reproducibilidad de artefactos: reconstruir el fixture con `python example/build_fixtures.py --fixture Qwen3.8-Flash-Next-mic` y comparar hashes contra `build.json`.
- Docencia y ejemplos de integración: mostrar el uso de `integrations/transformers/usage.md` sin coste de cómputo asociado a un modelo grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier métrica de calidad (MMLU, HumanEval, GSM8K) sería irrelevante.

## Requisitos de hardware

- VRAM estimada: con 33,9 M de parámetros en float32, el peso ocupa aproximadamente 135 MB; en bfloat16 o float16, unos 68 MB. El repositorio completo son 5,8 GB, pero la carga efectiva del modelo es muy inferior.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; también CPU.
- Cabe en cualquier GPU consumer y en la mayoría de entornos CPU sin problemas de memoria.
- Opciones de despliegue: Transformers con `AutoModel`/`Qwen4ExpForConditionalGeneration`; no se documentan recetas para vLLM, llama.cpp, Ollama ni TGI, y su uso en inferencia real no tiene sentido por los pesos aleatorios.
- Latencia y throughput: no disponibles; al ser un fixture de 4 capas, la latencia sería mínima, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| `huggingface-mic/Qwen3.8-Flash-Next-mic` | 33,9 M (fixture) | no disponible | no disponible | Artefacto de prueba para integración en Transformers |
| `Qwen/Qwen3.8-Flash-Next` | no disponible en la información | no disponible | no disponible | Modelo real del que deriva el fixture |
| Otros fixtures `*-mic` de `huggingface-mic` | variable | no disponible | no disponible | Artefactos de prueba equivalentes para otras arquitecturas |

No se dispone de datos suficientes para comparar con alternativas de la misma categoría funcional, porque este repositorio no es un modelo desplegable.

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no produce salidas útiles; cualquier uso en producción daría resultados sin sentido.
- Etiquetado explícito como `test-artifact` para excluirlo de búsquedas de modelos candidatos.
- La model card repite bloques de texto y contiene afirmaciones contradictorias sobre el número de parámetros (33,9 M en safetensors frente a 353,9 M en el texto).
- Licencia no declarada: no se puede asumir uso comercial ni redistribución.
- Idiomas no declarados: los ficheros de tokenizador se heredan del modelo base, pero no se garantiza cobertura lingüística.
- No hay información sobre sesgos, alucinación o seguridad, porque no ha habido entrenamiento.
- El tamaño del repositorio (5,8 GB) es desproporcionado para un fixture de 33,9 M de parámetros, lo que puede dificultar su descarga en entornos con ancho de banda limitado.
- No debe confundirse con el modelo real `Qwen/Qwen3.8-Flash-Next`; para evaluación de capacidades hay que acudir a ese checkpoint.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/huggingface-mic/Qwen3.8-Flash-Next-mic
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Manifiesto del contrato: `integration.json` (en el repositorio)
- Uso con Transformers: `integrations/transformers/usage.md` (en el repositorio)
- Expectativas de Transformers: `integrations/transformers/expectations` (en el repositorio)
- Procedencia del fixture: `build.json` (en el repositorio)
- Explicación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Qwen3.8-Flash-Next-mic.html
- Script de construcción: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reducción: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
