# huggingface-mic/tipsv2-b14-mic

## Resumen

`huggingface-mic/tipsv2-b14-mic` es un artefacto de prueba publicado por la organizacion `huggingface-mic`, no un modelo utilizable en produccion. Se trata de una version "slim" (reducida) del modelo `google/tipsv2-b14`, un modelo de vision-lenguaje de la familia TIPSv2 orientado a tareas de codificacion de imagen y texto (`encode_image` / `encode_text`). El repositorio incluye pesos reducidos, ejemplos de uso ejecutables y las expectativas de integracion con Transformers en un unico lugar.

El modelo conserva la arquitectura `Tipsv2Model` del checkpoint original, pero con una configuracion drasticamente reducida: 2 capas ocultas en el codificador de texto y 2 en el de vision, lo que da un total de 2.318.912 parametros. Los pesos son aleatorios (semilla 17) y no han sido entrenados; se generaron mediante la regla generica de reduccion de `sweep.py` del proyecto `transformers-mic`. El objetivo declarado es servir como fixture de pruebas para validar integraciones de frameworks, no como modelo funcional.

La relevancia de este repositorio es, por tanto, metodologica: demuestra un patron para empaquetar pesos reducidos, contratos de integracion y expectativas de framework de forma reproducible. Esta etiquetado explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos. Cualquier evaluacion de capacidades reales debe hacerse sobre `google/tipsv2-b14`, no sobre este fixture.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tipsv2Model (transformer multimodal imagen-texto, configuracion reducida) |
| Parametros totales | 2.318.912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en float32; verificado finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura `Tipsv2Model`, un transformer multimodal con codificadores separados de imagen y texto, tal como se define en los ficheros de modelado copiados byte a byte de `google/tipsv2-b14` (`configuration_tips.py`, `image_encoder.py`, `modeling_tips.py`, `text_encoder.py`). La unica diferencia respecto al checkpoint original es la configuracion reducida: 2 capas ocultas en el codificador de texto y 2 en el de vision, aplicando la regla generica de reduccion de `sweep.py`.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y se validaron mediante una "input-sensitivity gate": cada perturbacion de las entradas del contrato movio los logits al menos 0.001 (el caso mas debil, `pixel_values:reverse`, produjo 0.0375). Los tensores conservan los mismos nombres que el checkpoint real, y el fixture cubre todos los checkpoints cuyos ficheros de procesador son identicos byte a byte y cuya config coincide tras la reduccion (clave de fixture `4fa35b9d60f3`). El modelo se guardo en float32, el dtype por defecto de carga de `google/tipsv2-b14`, y se verifico que es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes.

## Capacidades

- Codificacion de imagen y texto (`encode_image` / `encode_text`) segun el contrato TIPSv2 image-text.
- No dispone de pesos entrenados: las salidas son aleatorias y no tienen valor semantico.
- No soporta generacion de texto, razonamiento, codigo ni matematicas de forma funcional.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponible.
- Su utilidad real es como fixture de pruebas para validar integraciones de Transformers y contratos de framework.

## Casos de uso

- Pruebas de integracion en Transformers: sirve para verificar que el pipeline de carga, el procesador y las firmas de `encode_image`/`encode_text` funcionan con la arquitectura `Tipsv2Model` sin descargar el checkpoint completo de 14B.
- Validacion de contratos de framework: el directorio `integrations/transformers/expectations` permite comprobar que una implementacion cumple las expectativas de entrada/salida documentadas.
- CI/CD de librerias de modelado: al ser un repo de ~0 GB y 2.3M parametros, se puede incluir en suites de tests automatizados que corren en cada commit sin coste de GPU significativo.
- Desarrollo de procesadores y tokenizers: los ficheros de procesador copiados byte a byte permiten probar cambios en el preprocesado sin depender del modelo real.
- Reproduccion de fixtures: el script `build_fixtures.py` y `build.json` documentan como regenerar el artefacto con fuentes fijadas y hashes, util para auditar la metodologia de reduccion.
- Verificacion de dtypes y estabilidad numerica: el modelo se ha validado como finito en float32, bfloat16 y float16, por lo que sirve para tests de mixed precision en frameworks.
- Docencia y prototipado de arquitecturas multimodales: permite inspeccionar la estructura de tensores de TIPSv2 con un coste minimo de recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios, por lo que cualquier metrica de calidad carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (2,3M parametros, ~9,3 MB de pesos mas overhead de activaciones y procesador).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: Transformers (integracion documentada en `integrations/transformers/usage.md`); vLLM, llama.cpp, Ollama y TGI no estan documentados para esta arquitectura en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/tipsv2-b14-mic` | 2.318.912 | no disponible | Fixture de pruebas | no disponible | Hugging Face |
| `google/tipsv2-b14` | no disponible en la informacion | no disponible | Modelo real imagen-texto | no disponible | Hugging Face |
| Otros fixtures de `transformers-mic` | variable (reducidos) | no disponible | Fixtures de pruebas | no disponible | Hugging Face |

La comparacion relevante es con el checkpoint original `google/tipsv2-b14`, del que este repositorio es una version reducida con pesos aleatorios. No se dispone de datos de benchmarks ni de especificaciones completas del modelo base en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y las salidas no tienen significado semantico.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; no debe usarse en produccion.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido.
- Idiomas soportados no disponibles.
- Longitud de contexto no disponible.
- Al derivar de `google/tipsv2-b14`, cualquier restriccion de licencia del modelo base podria aplicar, pero no se documenta en la informacion disponible.
- Riesgo de confusion: el nombre puede llevar a pensar que es un modelo funcional de la familia TIPSv2; no lo es.
- Los sesgos son irrelevantes porque no hay entrenamiento, pero tampoco hay garantias de comportamiento.
- El fixture solo cubre checkpoints con procesador byte-identico y config coincidente tras la reduccion; no sustituye al modelo real para validacion de capacidades.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/tipsv2-b14-mic
- Modelo base: https://huggingface.co/google/tipsv2-b14
- Como se redujo el fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/tipsv2-b14-mic.html
- Script de reduccion (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion (`build_fixtures.py`): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
