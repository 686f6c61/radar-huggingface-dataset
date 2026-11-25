# huggingface-mic/qwen2_5_omni-mic

## Resumen

`huggingface-mic/qwen2_5_omni-mic` es un artefacto de prueba (fixture) publicado por la organización `huggingface-mic`, no un modelo entrenado ni utilizable. Se presenta como una versión "slim" (reducida) de `Qwen/Qwen2.5-Omni-7B`, con la misma arquitectura declarada (`Qwen2_5OmniForConditionalGeneration`) pero con un número de capas drásticamente menor y pesos aleatorios generados con semilla 17. Su propósito es servir como contrato ejecutable para validar la integración de la arquitectura Qwen2.5-Omni en frameworks como Transformers, no para inferencia real.

El repositorio contiene 25.605.164 parámetros reales según los safetensors, aunque la model card menciona una fixture de 170,4M de parámetros; la discrepancia no queda resuelta en la información disponible. El tamaño del repo es de 1,0 GB. Está etiquetado explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos. No se trata, por tanto, de un modelo de lenguaje operativo: no genera texto coherente, no razona y no debe desplegarse en producción.

Su relevancia es metodológica: ilustra el patrón de "fixtures de integración" que copian ficheros de procesador byte a byte del checkpoint original y replican nombres de tensores, permitiendo a los mantenedores de frameworks comprobar que el código de carga, el forward, la pérdida y los gradientes funcionan con la arquitectura real sin necesidad de descargar los 7B parámetros completos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2_5OmniForConditionalGeneration (variante reducida de Qwen2.5-Omni) |
| Parametros totales | 25.605.164 (safetensors); la model card cita 170,4M para la fixture slim |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el fichero LICENSE se copia del checkpoint base, pero no se especifica el tipo) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

La arquitectura declarada es `Qwen2_5OmniForConditionalGeneration`, la misma clase que el modelo multimodal Qwen2.5-Omni-7B, que combina un encoder de audio, un modelo de texto y un módulo "talker" para generación de voz, además de un componente DiT. En esta fixture, todas esas pilas se han reducido a 2 capas cada una (audio encoder_layers 2, text num_hidden_layers 2, talker num_hidden_layers 2, dit num_hidden_layers 2) mediante la regla genérica de `sweep.py` del repositorio `transformers-mic`.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y se validaron con una "input-sensitivity gate": cada perturbación de las entradas del contrato desplazaba los logits al menos 0,001 (el caso más débil, `attention_mask:all_ones`, dio 0,773). Los ficheros de procesador (`tokenizer.json`, `vocab.json`, `merges.txt`, `chat_template.json`, `preprocessor_config.json`, `spk_dict.pt`, entre otros) se copiaron byte a byte desde `Qwen/Qwen2.5-Omni-7B`. Los tensores conservan los mismos nombres que el checkpoint real y los pesos son finitos en float32, bfloat16 y float16 tanto en forward como en pérdida y gradientes.

## Capacidades

- No es un modelo funcional: los pesos aleatorios no producen texto, audio ni razonamiento coherente.
- Sirve como contrato de integración: valida carga de checkpoint, forward pass, cálculo de pérdida y retropropagación en Transformers.
- Replica la interfaz de procesador del modelo base (tokenizador, chat template, configuración de preprocesado de audio).
- Conserva los nombres de tensores del checkpoint original, lo que permite probar rutas de carga y compatibilidad de `state_dict`.
- No dispone de tool calling, agentes, capacidades multilingües ni modos de razonamiento utilizables.
- No soporta generación multimodal real pese a heredar la clase arquitectónica de Qwen2.5-Omni.

## Casos de uso

- Pruebas de integración en Transformers: usar la fixture para verificar que la clase `Qwen2_5OmniForConditionalGeneration` se instancia, carga y ejecuta un forward sin errores antes de probar con el checkpoint de 7B.
- CI/CD de frameworks: incluir el repositorio en pipelines de integración continua para detectar regresiones en la carga de safetensors y en la compatibilidad de nombres de tensores con un coste de descarga de 1,0 GB en lugar de los ~15 GB del modelo completo.
- Validación de ficheros de procesador: comprobar que el tokenizador, el chat template y la configuración de audio copiados del modelo base se cargan correctamente en distintas versiones de la librería.
- Desarrollo de utilidades de "model shrinking": servir de ejemplo reproducible del patrón de reducción de capas descrito en `sweep.py` para generar fixtures de otras arquitecturas.
- Verificación de dtypes: testear que el modelo es finito en float32, bfloat16 y float16 en forward, pérdida y gradientes, útil para validar rutas de mixed precision.
- Docencia y experimentación con arquitecturas multimodales: estudiar la estructura de módulos (audio encoder, text, talker, DiT) sin necesidad de recursos de GPU para 7B parámetros.
- Pruebas de sensibilidad a entradas: reutilizar la "input-sensitivity gate" para validar que perturbaciones en `attention_mask` u otras entradas afectan a los logits en integraciones nuevas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier métrica de calidad (MMLU, HumanEval, GSM8K) carecería de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 para los 25,6M parámetros reportados; la fixture de 170,4M citada en la model card requeriría aproximadamente 0,34 GB en bfloat16.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100.
- Cabe en GPU consumer: sí, en cualquier RTX o incluso en CPU para pruebas de forward.
- Opciones de despliegue: Transformers con el código de `transformers-mic`; no está pensado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo funcional.
- Latencia y throughput: no disponibles y no significativos para un artefacto de prueba.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/qwen2_5_omni-mic | 25,6M (safetensors) / 170,4M (fixture) | no disponible | Fixture de integracion | no disponible | Hugging Face |
| Qwen/Qwen2.5-Omni-7B | ~7B | no disponible en la informacion | Modelo multimodal real (texto, audio, vision) | no disponible en la informacion | Hugging Face |
| Otras fixtures de transformers-mic | variable | no disponible | Pruebas de integracion por arquitectura | no disponible | Hugging Face (org. huggingface-mic) |

La comparación relevante es con el checkpoint base: misma arquitectura y mismos ficheros de procesador, pero con capas reducidas y pesos aleatorios. Frente a otras fixtures del mismo proyecto, comparte el patrón de contrato ejecutable, aunque los detalles de cada una no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y la salida no tiene significado.
- Etiquetado como `test-artifact`; no debe incluirse en catálogos de modelos candidatos ni en evaluaciones de calidad.
- Existe una discrepancia entre los 25.605.164 parámetros de los safetensors y los 170,4M citados en la model card; conviene verificar `build.json` antes de asumir un tamaño concreto.
- La licencia no está especificada en la información disponible; el fichero LICENSE se copia del checkpoint base, por lo que las condiciones de uso comercial dependen de Qwen/Qwen2.5-Omni-7B y deben consultarse allí.
- No apto para producción, atención al cliente, generación de código ni ninguna tarea generativa.
- Riesgo de confusión: el nombre y la arquitectura pueden llevar a desplegarlo por error creyendo que es el modelo Omni real.
- Los idiomas soportados no están declarados; el tokenizador copiado sugiere cobertura multilingüe del modelo base, pero no es verificable con pesos aleatorios.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/qwen2_5_omni-mic
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Explicación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/qwen2_5_omni-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de reducción `sweep.py`: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción `build_fixtures.py`: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
