# huggingface-mic/clip-mic

## Resumen

`clip-mic` es un artefacto de prueba (fixture) publicado por la organizacion `huggingface-mic` en Hugging Face. No es un modelo entrenado ni utilizable para inferencia real: se trata de una version reducida del checkpoint `openai/clip-vit-base-patch32` de OpenAI, con solo 3.505.280 parametros (frente a los aproximadamente 151 millones del modelo original), generada con pesos aleatorios (semilla 17) y una configuracion recortada del `CLIPModel`.

Su proposito es servir como contrato de integracion para validar el soporte de CLIP dentro de la libreria Transformers. El repositorio incluye los pesos reducidos, ejemplos de uso (`integrations/transformers/usage.md`), expectativas del framework y metadatos de procedencia del recorte (`build.json`). Segun la model card, el uso publico de Transformers se valido sobre este fixture en una NVIDIA A10G, con variantes por defecto, eager y bfloat16, y registro de linea base en proceso limpio.

Es relevante unicamente en el contexto de desarrollo y testing de integraciones de Transformers: permite verificar la carga del modelo, los nombres de tensores y el comportamiento del procesador sin descargar el checkpoint completo. El autor lo etiqueta explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP (CLIPModel), transformer con torre de texto y torre de vision; configuracion reducida a 2 capas ocultas en texto y 2 en vision |
| Parametros totales | 3.505.280 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; pesos guardados en float32, con validacion de finitud en float32, bfloat16 y float16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo replica la arquitectura `CLIPModel` de `openai/clip-vit-base-patch32`, con dos torres (texto y vision) y una proyeccion conjunta para alinear representaciones. La configuracion se ha recortado mediante la regla generica de `sweep.py`: `num_hidden_layers` de 2 en la torre de texto y 2 en la torre de vision. Los ficheros del procesador (`merges.txt`, `preprocessor_config.json`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`, `vocab.json`) se copiaron byte a byte desde el checkpoint original.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y superaron una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato movio los logits al menos 0,001 (el caso mas debil, `pixel_values:halve`, registro 0,00487). El fixture conserva los mismos nombres de tensores que el checkpoint real y se guarda en float32, el dtype por defecto del modelo base. El repositorio incluye `build.json` con las fuentes fijadas, resultados de la puerta y hashes de ficheros, y puede regenerarse con `python example/build_fixtures.py --fixture mic-clip-slim`.

## Capacidades

- No es un modelo funcional: no genera texto, no realiza razonamiento, no ejecuta codigo ni resuelve matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues declaradas.
- No dispone de modo thinking, vision util ni audio; la torre de vision existe solo como estructura con pesos aleatorios.
- Su unica funcion es validar contratos de integracion: carga del modelo, nombres de tensores, comportamiento del procesador y estabilidad numerica en float32, bfloat16 y float16 (forward, perdida y gradientes).

## Casos de uso

- Testing de integraciones de Transformers: cargar el fixture en un pipeline de CI para verificar que el codigo de soporte de CLIP no rompe con cambios de version, sin descargar el checkpoint completo.
- Validacion de contratos de API: comprobar que los nombres de tensores, las firmas de `forward` y las salidas coinciden con las expectativas documentadas en `integrations/transformers/expectations`.
- Pruebas de estabilidad numerica: ejecutar forward, calculo de perdida y retropropagacion en float32, bfloat16 y float16 para detectar NaN o infinitos en entornos con distintas GPUs.
- Regresion de procesadores: verificar que los ficheros del procesador copiados byte a byte producen las mismas entradas que el checkpoint original.
- Desarrollo de tooling de fixtures: usar `build_fixtures.py` y `sweep.py` como referencia para generar fixtures reducidos de otros modelos con la misma metodologia.
- Formacion y demos de infraestructura: ejemplificar un repositorio que empaqueta pesos reducidos, uso y expectativas en un unico artefacto ligero (tamano de repo 0,0 GB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de validacion es la puerta de sensibilidad a la entrada (perturbaciones de al menos 0,001 en los logits; caso mas debil `pixel_values:halve`, 0,00487) y la validacion de uso en una NVIDIA A10G con variantes por defecto, eager y bfloat16.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (3,5 M de parametros, aproximadamente 14 MB de pesos); en float16 o bfloat16, aproximadamente 7 MB.
- GPU recomendadas: cualquier GPU con soporte de PyTorch, incluida la NVIDIA A10G usada en la validacion del autor; no requiere A100 ni H100.
- Cabe en cualquier GPU consumer, e incluso en CPU, por su tamano minimo.
- Opciones de despliegue: Transformers (validado por el autor); vLLM, llama.cpp, Ollama y TGI no estan documentados para este artefacto.
- Latencia y throughput: no disponibles; al ser un fixture de test, las mediciones de rendimiento no son representativas de CLIP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/clip-mic` | 3.505.280 | no disponible | Fixture de test para integracion de CLIP | no disponible | Hugging Face (1094 descargas) |
| `openai/clip-vit-base-patch32` | aproximadamente 151 M | no disponible | Modelo CLIP real para vision-lenguaje | no disponible en la informacion proporcionada | Hugging Face (modelo base) |
| Otros fixtures de `huggingface-mic` | no disponible | no disponible | Artefactos de test por modelo | no disponible | Hugging Face |

La comparacion relevante es con su modelo base: `clip-mic` conserva la arquitectura y los nombres de tensores pero reduce la profundidad a 2 capas por torre y sustituye los pesos entrenados por pesos aleatorios, por lo que no es intercambiable funcionalmente con `openai/clip-vit-base-patch32`.

## Limitaciones y advertencias

- No es un modelo usable: los pesos son aleatorios y las salidas no tienen significado semantico.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; no debe desplegarse en produccion.
- Sin licencia declarada: no hay autorizacion explicita para uso comercial ni para redistribucion.
- Sin idiomas soportados declarados.
- Sin pipeline declarado en Hugging Face.
- La cobertura del fixture es parcial: el autor indica que declara solo objetivos de fixture y que la cobertura completa del checkpoint es un trabajo separado.
- No dispone de datos de benchmarks ni de rendimiento representativos.
- Riesgo de confusion: su nombre y su modelo base pueden llevar a error si se confunde con el checkpoint real de OpenAI.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/huggingface-mic/clip-mic
- Modelo base: https://huggingface.co/openai/clip-vit-base-patch32
- Manifiesto del contrato: https://huggingface.co/huggingface-mic/clip-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/clip-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/clip-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/clip-mic/blob/main/build.json
- Documentacion del recorte: https://huggingface-mic-mic-coverage.static.hf.space/shrink/clip-mic.html
- Evidencia de regeneracion (GitHub Actions): https://github.com/huggingface/transformers-mic/actions/runs/38252430459
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Script de barrido: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
