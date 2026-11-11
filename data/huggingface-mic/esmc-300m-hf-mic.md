# huggingface-mic/ESMC-300M-hf-mic

## Resumen

ESMC-300M-hf-mic es un artefacto de prueba (fixture) publicado por la organizacion huggingface-mic, no un modelo utilizable. Se trata de una version reducida del modelo biologico biohub/ESMC-300M-hf, un modelo de lenguaje de proteinas basado en la arquitectura ESMC (ESM Cambrian) de EvolutionaryScale, que emplea enmascaramiento tipo masked language modelling para representar secuencias de aminoacidos. El fixture conserva la misma arquitectura y los mismos nombres de tensores que el checkpoint original, pero con una configuracion reducida a 2 capas ocultas y pesos aleatorios (semilla 17).

El objetivo de este repositorio es servir como contrato de integracion para frameworks (concretamente Transformers), verificando que las expectativas de entrada y salida se cumplen sin necesidad de descargar los pesos reales de 300 millones de parametros. La model card indica explicitamente que es un test artifact, etiquetado como tal para que no aparezca en busquedas de modelos candidatos.

Es relevante unicamente para desarrolladores que trabajen en el ecosistema transformers-mic y necesiten validar pipelines de integracion de forma rapida y ligera. No debe emplearse para inferencia real, generacion de embeddings de proteinas ni ninguna tarea productiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EsmcForMaskedLM (transformer encoder para proteinas, configuracion reducida a 2 capas) |
| Parametros totales | 95.296 (fixture); el modelo base ESMC-300M tiene aproximadamente 300M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float32) |
| Idiomas soportados | no disponible (modelo de secuencias de proteinas, no de lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo base biohub/ESMC-300M-hf pertenece a la familia ESMC (ESM Cambrian) de EvolutionaryScale, orientada a la representacion de proteinas mediante masked language modelling sobre secuencias de aminoacidos. La arquitectura es un transformer encoder con atencion bidireccional, entrenado con objetivos de enmascaramiento de tokens sobre grandes corpus de secuencias proteicas.

El fixture ESMC-300M-hf-mic no ha sido entrenado. Sus pesos son aleatorios (semilla 17) y se generaron mediante la regla generica de reduccion implementada en sweep.py del repositorio transformers-mic, que reduce num_hidden_layers a 2. Los ficheros de procesador (tokenizer.json y tokenizer_config.json) se copiaron byte a byte del checkpoint original. Los pesos pasaron una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato movio los logits al menos 0,001 (la mas debil, input_ids:roll_batch, 0,603), lo que justifico no entrenar. Los tensores son finitos en float32, bfloat16 y float16 tanto en forward como en loss y gradientes.

## Capacidades

- Ejecucion del forward pass de EsmcForMaskedLM con la misma interfaz de entrada/salida que el checkpoint real.
- Validacion de contratos de integracion con Transformers (usage.md y directorio expectations).
- Verificacion de nombres de tensores y compatibilidad de configuracion.
- Pruebas de sensibilidad de entrada sobre logits.
- Soporte de precision float32, bfloat16 y float16 en forward, loss y gradientes.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, agentes ni capacidades multilingues.
- No produce embeddings de proteinas con significado biologico.

## Casos de uso

- Pruebas de integracion en CI/CD: el fixture permite ejecutar la suite de tests de transformers-mic sin descargar el checkpoint de 300M, reduciendo tiempo y ancho de banda en cada build.
- Validacion de contratos de framework: comprobar que el pipeline de Transformers carga el modelo, tokeniza y devuelve logits con la forma esperada antes de pasar al modelo real.
- Desarrollo de herramientas de reduccion de modelos: sirve como caso de referencia para verificar que sweep.py genera configuraciones coherentes y pesos finitos.
- Test de compatibilidad de dtypes: validar que el codigo de inferencia funciona en float32, bfloat16 y float16 sin errores de NaN o infinitos.
- Regresion de tokenizador: al copiar los ficheros de procesador byte a byte, permite detectar cambios accidentales en el tokenizador del modelo base.
- Documentacion de expectativas: el directorio expectations actua como especificacion ejecutable de lo que un framework debe cumplir para soportar ESMC.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un fixture con pesos aleatorios, cualquier metrica de calidad carece de sentido.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en float32 para el fixture (95.296 parametros); el modelo base de 300M requiere aproximadamente 1,2 GB en float32 y unos 600 MB en bfloat16.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1060 en adelante) es suficiente para el fixture; para el modelo base basta una RTX 3060 o superior.
- Cabe en cualquier GPU consumer y en CPU sin problemas.
- Opciones de despliegue: Transformers con el repositorio transformers-mic; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ESMC-300M-hf-mic (este) | 95.296 | no disponible | Fixture de test | no disponible | Hugging Face |
| biohub/ESMC-300M-hf | ~300M | no disponible | Modelo de proteinas | no disponible | Hugging Face |
| ESM-2 (Meta) | 8M-15B (varias tallas) | 1024 tokens aprox. | Modelo de proteinas | MIT (segun version) | Hugging Face |

La comparativa con ESM-2 se ofrece como referencia de categoria (modelos de lenguaje de proteinas), pero no se dispone de datos de rendimiento del fixture ni del checkpoint base en la informacion proporcionada.

## Limitaciones y advertencias

- Es un test artifact: los pesos son aleatorios y no tienen valor biologico ni predictivo.
- No debe usarse en produccion, investigacion biologica ni generacion de embeddings.
- La model card lo etiqueta explicitamente como test-artifact para excluirlo de busquedas de modelos candidatos.
- La licencia no esta declarada, lo que impide determinar condiciones de uso comercial.
- No se documentan sesgos, pero al no haber entrenamiento no aplican sesgos de datos; el riesgo de alucinacion no aplica porque no genera texto.
- El modelo base tiene aproximadamente 300M de parametros, pero el fixture solo conserva 95.296, por lo que las metricas de rendimiento no son extrapolables.
- La fecha de creacion indicada (2026-10-30) es futura respecto a la redaccion habitual de fichas; conviene verificar la vigencia del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/ESMC-300M-hf-mic
- Modelo base: https://huggingface.co/biohub/ESMC-300M-hf
- Como se redujo el fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/ESMC-300M-hf-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reduccion: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Manifiesto de contrato: integration.json (en el repositorio)
- Uso con Transformers: integrations/transformers/usage.md (en el repositorio)
- Expectativas de Transformers: integrations/transformers/expectations (en el repositorio)
- Procedencia del fixture: build.json (en el repositorio)
