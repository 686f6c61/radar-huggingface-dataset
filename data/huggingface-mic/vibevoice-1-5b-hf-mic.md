# huggingface-mic/VibeVoice-1.5B-hf-mic

## Resumen

VibeVoice-1.5B-hf-mic es un artefacto de prueba (fixture) publicado por el usuario huggingface-mic a partir del modelo base `vibevoice/VibeVoice-1.5B-hf`. No es un modelo funcional ni entrenado: es una version reducida ("slim") del checkpoint original, con la misma arquitectura declarada (`VibeVoiceForConditionalGeneration`) pero con la mayoria de las capas eliminadas y pesos aleatorios generados con semilla 17. Su proposito es servir como fixture de integracion para validar contratos de framework (procesadores, tokenizer, configuracion de generacion) sin necesidad de descargar ni ejecutar el modelo completo.

El repositorio contiene 14.292.797 parametros reales en safetensors y ocupa 0,6 GB, frente a los aproximadamente 1.500 millones de parametros que sugiere el nombre del modelo base. La model card lo etiqueta explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos. Los ficheros de procesador (`chat_template.jinja`, `generation_config.json`, `processor_config.json`, `tokenizer.json`, `tokenizer_config.json`) se copian byte a byte del checkpoint original, de modo que las expectativas de integracion coinciden con las del modelo real.

Es relevante unicamente en el contexto de ingenieria de integraciones: permite a los mantenedores de transformers y de frameworks de inferencia comprobar que el pipeline de carga, tokenizacion y generacion funciona con la arquitectura VibeVoice sin coste computacional. Para cualquier uso de sintesis de voz, generacion de texto o produccion, este repositorio no es utilizable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VibeVoiceForConditionalGeneration (transformer multimodal texto-a-voz, config reducida) |
| Parametros totales | 14.292.797 (fixture reducido; el modelo base nominal es de 1.500 millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; el fixture es finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture conserva el nombre de clase `VibeVoiceForConditionalGeneration` del modelo base, que corresponde a un modelo de sintesis de voz condicionado por texto con un cabezal de difusion (diffusion_head). La reduccion se aplico con la regla generica de `sweep.py`: `text num_hidden_layers` reducido a 2 y `diffusion_head num_hidden_layers` reducido a 2. Los nombres de tensores coinciden con los del checkpoint real, por lo que el codigo de carga del framework encuentra exactamente las mismas claves.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y superaron un test de sensibilidad a la entrada: cada perturbacion de las entradas del contrato movio los logits al menos 0,001 (el caso mas debil, `input_ids:reverse`, registro 1,45). Los ficheros de procesador y tokenizer se copiaron sin modificacion desde `vibevoice/VibeVoice-1.5B-hf`. El artefacto se genero con `build_fixtures.py` y el repositorio incluye `build.json` con las fuentes fijadas, resultados del test y hashes de ficheros, ademas de `integration.json` como manifiesto de contrato.

## Capacidades

- Ninguna capacidad funcional de generacion de voz, texto o audio: los pesos son aleatorios y el modelo no ha sido entrenado.
- Validacion de contrato de integracion: carga del modelo, tokenizer y processor con la firma esperada por transformers.
- Comprobacion de sensibilidad a entradas: el fixture responde a perturbaciones de `input_ids` y demas entradas del contrato.
- Verificacion de estabilidad numerica: forward, loss y gradientes finitos en float32, bfloat16 y float16.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues reales.

## Casos de uso

- Tests de integracion en transformers: cargar el fixture en CI para verificar que la clase `VibeVoiceForConditionalGeneration` se instancia y ejecuta un forward sin errores, sin descargar el checkpoint de 1.5B.
- Validacion de procesadores y tokenizer: comprobar que `chat_template.jinja`, `tokenizer.json` y `processor_config.json` del modelo real se parsean correctamente en el pipeline de preprocesado.
- Pruebas de compatibilidad de frameworks de inferencia: verificar que un backend (por ejemplo, un runner de transformers) acepta los nombres de tensores y la configuracion reducida antes de probar con pesos reales.
- Deteccion de regresiones en el codigo de carga: ejecutar el fixture en cada PR para asegurar que cambios en la logica de `from_pretrained` no rompen la arquitectura VibeVoice.
- Validacion de dtypes: comprobar que el modelo produce salidas finitas en float32, bfloat16 y float16, cubriendo los modos de ejecucion habituales en GPU.
- Documentacion de contratos de integracion: usar `integration.json` y `integrations/transformers/expectations` como referencia reproducible de la interfaz esperada por el framework.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El artefacto es un fixture de test sin entrenamiento, por lo que cualquier metrica de calidad (MOS, WER, MMLU) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (14,3 millones de parametros, ~28 MB de pesos); el repositorio completo ocupa 0,6 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o incluso CPU; no requiere A100 ni H100.
- Cabe en cualquier GPU consumer y en CPU sin problemas.
- Opciones de despliegue: carga via transformers (`from_pretrained`) usando el contrato documentado en `integrations/transformers/usage.md`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser un fixture sin utilidad funcional, no se han medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VibeVoice-1.5B-hf-mic (este) | 14,3 M (fixture) | no disponible | Fixture de integracion | no disponible | Hugging Face |
| vibevoice/VibeVoice-1.5B-hf | ~1.500 M (nominal) | no disponible | Sintesis de voz texto-a-voz | no disponible | Hugging Face |
| Otros fixtures de transformers-mic | variable (reducidos) | no disponible | Test de contratos de framework | no disponible | Hugging Face (org huggingface-mic) |

La comparacion relevante es con el checkpoint original: mismo nombre de arquitectura y mismos ficheros de procesador, pero con capas reducidas y pesos aleatorios. Frente a otros fixtures de la misma organizacion, comparte el mismo mecanismo de generacion (`build_fixtures.py`) y el mismo esquema de validacion por sensibilidad a entradas.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y las salidas no tienen significado.
- No ha sido entrenado, por lo que no tiene capacidades de sintesis de voz ni de generacion de texto.
- La configuracion esta reducida a 2 capas en el encoder de texto y 2 en el cabezal de difusion; el comportamiento no representa al modelo de 1.5B.
- La licencia no esta disponible en la informacion proporcionada; no debe asumirse uso comercial permitido.
- El autor lo etiqueta como `test-artifact` para excluirlo de busquedas de modelos candidatos; no debe desplegarse en produccion.
- No se documentan idiomas soportados ni limitaciones de contexto, ya que el fixture no implementa el comportamiento real.
- Los benchmarks de calidad no aplican y no deben citarse como referencia del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/VibeVoice-1.5B-hf-mic
- Modelo base: https://huggingface.co/vibevoice/VibeVoice-1.5B-hf
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/VibeVoice-1.5B-hf-mic/blob/main/integration.json
- Uso con transformers: https://huggingface.co/huggingface-mic/VibeVoice-1.5B-hf-mic/blob/main/integrations/transformers/usage.md
- Expectativas de transformers: https://huggingface.co/huggingface-mic/VibeVoice-1.5B-hf-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/VibeVoice-1.5B-hf-mic/blob/main/build.json
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/VibeVoice-1.5B-hf-mic.html
- Script de generacion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla generica de reduccion: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
