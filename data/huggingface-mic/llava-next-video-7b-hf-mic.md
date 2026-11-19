# huggingface-mic/LLaVA-NeXT-Video-7B-hf-mic

## Resumen

LLaVA-NeXT-Video-7B-hf-mic es un artefacto de prueba publicado por la organizacion huggingface-mic dentro del proyecto transformers-mic. No es un modelo entrenado ni utilizable para inferencia real: se trata de un "fixture" reducido del checkpoint original llava-hf/LLaVA-NeXT-Video-7B-hf, con solo 4.336.640 parametros (frente a los aproximadamente 7000 millones del modelo del que deriva) y pesos generados aleatoriamente con semilla 17. Su proposito es servir como banco de pruebas reproducible para validar integraciones de frameworks (principalmente Transformers) sin necesidad de descargar ni ejecutar el modelo completo.

La arquitectura declarada es LlavaNextVideoForConditionalGeneration, reducida mediante una regla generica de reduccion (2 capas en el codificador visual y 2 capas en el modelo de texto). Los ficheros de procesador (tokenizer, preprocessor, chat template, configuracion de video) se copian byte a byte del checkpoint original, de modo que las pruebas de pipeline de video y texto ejercitan exactamente el mismo preprocesado que el modelo real.

Es relevante ahora porque el ecosistema de transformers-mic busca estandarizar "contratos" ejecutables de modelos multimodales: manifiestos de integracion, expectativas de framework y pesos minimos que reproducen la interfaz del modelo original. Para desarrolladores e investigadores, este repositorio es util como referencia de como se construye un fixture de este tipo, no como sustituto del modelo LLaVA-NeXT-Video-7B real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlavaNextVideoForConditionalGeneration (variante reducida: 2 capas visuales, 2 capas de texto) |
| Parametros totales | 4.336.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es una instancia reducida de la arquitectura LLaVA-NeXT-Video, que combina un codificador visual con un modelo de lenguaje para generacion condicionada por video y texto. En este fixture, la configuracion se ha recortado a 2 capas ocultas en la torre de vision y 2 capas ocultas en la torre de texto, conservando los mismos nombres de tensor que el checkpoint real para que las pruebas de carga y serializacion sean representativas.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y se aceptaron tras superar una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato provoca un cambio en los logits de al menos 0,001 (el caso mas debil, `attention_mask:all_ones`, mueve los logits 0,196). Los tensores son finitos en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. Los ficheros de procesador se copian literalmente del checkpoint llava-hf/LLaVA-NeXT-Video-7B-hf, lo que garantiza paridad de preprocesado.

## Capacidades

- Carga y ejecucion de la arquitectura LlavaNextVideoForConditionalGeneration en Transformers con los mismos nombres de tensor que el modelo real.
- Validacion de pipelines de preprocesado de video y texto (video_preprocessor_config.json, preprocessor_config.json, chat template) copiados del checkpoint original.
- Pruebas de contrato de integracion: manifiesto integration.json, expectativas de framework en integrations/transformers/expectations y uso ejecutable en integrations/transformers/usage.md.
- Verificacion de estabilidad numerica en float32, bfloat16 y float16 (forward, loss, gradientes).
- No soporta generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes ni capacidades multilingues reales: los pesos son aleatorios.

## Casos de uso

- Pruebas de integracion en CI de Transformers: usar el fixture para validar que los cambios en el codigo de LlavaNextVideoForConditionalGeneration no rompen la carga, el forward ni el backward, sin descargar el checkpoint de 7B.
- Desarrollo de pipelines de video: comprobar el preprocesado de frames y la construccion de prompts con el chat template original antes de pasar al modelo real.
- Validacion de contratos de framework: ejecutar integrations/transformers/expectations como suite de conformidad para nuevas versiones de la libreria.
- Reproducibilidad de artefactos: el fichero build.json registra fuentes fijadas, resultados de las puertas de validacion y hashes de ficheros, util para auditoria de builds.
- Referencia para construir fixtures propios: el script build_fixtures.py y sweep.py documentan la regla generica de reduccion aplicable a otros checkpoints multimodales.
- Pruebas de serializacion y compatibilidad de safetensors: verificar que herramientas de conversion o empaquetado manejan correctamente los nombres de tensor y el dtype bfloat16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un fixture con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K, etc.) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con 4,3 millones de parametros en bfloat16 (unos 8,7 MB de pesos); el cuello de botella es el codigo de Transformers, no la memoria.
- GPU recomendadas: cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090) o incluso CPU; no requiere A100 ni H100.
- Cabe en cualquier GPU consumer y en CPU.
- Opciones de despliegue: Transformers (uso previsto segun integrations/transformers/usage.md); vLLM, llama.cpp, Ollama o TGI no estan documentados para este artefacto y no se garantiza su compatibilidad.
- Latencia y throughput: no disponibles; al ser un fixture de prueba no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/LLaVA-NeXT-Video-7B-hf-mic | 4.336.640 | no disponible | Fixture de pruebas | no disponible | Hugging Face |
| llava-hf/LLaVA-NeXT-Video-7B-hf | no disponible en la informacion proporcionada (aproximadamente 7B por el nombre) | no disponible | Modelo multimodal video+texto real | no disponible | Hugging Face |
| Otros fixtures de transformers-mic | no disponible | no disponible | Pruebas de contrato | no disponible | Hugging Face |

La comparacion relevante es con el checkpoint original llava-hf/LLaVA-NeXT-Video-7B-hf, del que este artefacto hereda arquitectura, procesador y nombres de tensor, pero no pesos ni capacidades.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y cualquier salida generada es ruido sin significado.
- Etiquetado explicitamente como test-artifact para excluirlo de busquedas de modelos candidatos; no debe desplegarse en produccion.
- Licencia no disponible: no se puede asumir uso comercial permitido.
- Idiomas no disponibles: no hay informacion sobre cobertura linguistica.
- Longitud de contexto no disponible; la configuracion reducida no refleja la del modelo original.
- Los sesgos y el riesgo de alucinacion no son evaluables en un fixture sin entrenamiento.
- El repositorio tiene un tamano de 0,0 GB, coherente con pesos minimos; no contiene el checkpoint completo.
- Para cualquier tarea real de video+texto debe usarse llava-hf/LLaVA-NeXT-Video-7B-hf o un modelo equivalente entrenado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/LLaVA-NeXT-Video-7B-hf-mic
- Modelo base: https://huggingface.co/llava-hf/LLaVA-NeXT-Video-7B-hf
- Documentacion de uso en Transformers: integrations/transformers/usage.md (dentro del repositorio)
- Expectativas de Transformers: integrations/transformers/expectations (dentro del repositorio)
- Manifiesto de contrato: integration.json (dentro del repositorio)
- Procedencia del fixture: build.json (dentro del repositorio)
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/LLaVA-NeXT-Video-7B-hf-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla generica de reduccion: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
