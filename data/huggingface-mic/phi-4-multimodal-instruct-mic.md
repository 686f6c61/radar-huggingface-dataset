# huggingface-mic/Phi-4-multimodal-instruct-mic

## Resumen

`huggingface-mic/Phi-4-multimodal-instruct-mic` es un artefacto de prueba publicado por la organización `huggingface-mic` dentro del proyecto transformers-mic. No es un modelo entrenado: es un fixture de 16.567.680 parámetros con pesos aleatorios (semilla 17) construido a partir de la arquitectura de `microsoft/Phi-4-multimodal-instruct`, reducida a 2 capas en el decodificador y 2 capas en el codificador de visión.

Su función es actuar como contrato ejecutable. Conserva exactamente los mismos nombres de tensor que el checkpoint real, copia byte a byte todos los ficheros del procesador (tokenizer, `chat_template.jinja`, `preprocessor_config.json`, `generation_config.json`) y se guarda en bfloat16, el dtype con el que carga el modelo original. Con un repositorio de 0,1 GB permite ejecutar pruebas de integración y regresión en Transformers sin descargar el checkpoint completo de Microsoft.

Es relevante en el contexto de la ingeniería de integración: el ecosistema necesita fixtures pequeños y deterministas para validar pipelines multimodales en CI. El propio autor lo etiqueta como `test-artifact` precisamente para excluirlo de las búsquedas de modelos candidatos. No debe emplearse para inferencia real, ya que sus salidas carecen de sentido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Phi4MultimodalForCausalLM` (transformer causal multimodal: decodificador de texto mas torre de vision), configuracion reducida a `num_hidden_layers = 2` y `vision num_hidden_layers = 2` |
| Parametros totales | 16.567.680 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la configuracion del modelo esta reducida y la model card no declara la ventana final del fixture) |
| Tipos de cuantizacion | no disponible; solo se distribuyen pesos en bfloat16. El autor verifica que el forward, la loss y los gradientes son finitos en float32, bfloat16 y float16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible en los metadatos de HuggingFace; el repositorio incluye una copia byte a byte del fichero `LICENSE` de `microsoft/Phi-4-multimodal-instruct` |
| Formato de pesos | safetensors (bfloat16) |
| Modelo base | `microsoft/Phi-4-multimodal-instruct` |
| Clave de fixture | `b523dcc306e0` |
| Estado | `test-artifact` (pesos aleatorios, semilla 17; no entrenado) |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-27 |

## Arquitectura y entrenamiento

La arquitectura es la de Phi-4 Multimodal (`Phi4MultimodalForCausalLM`), un transformer causal multimodal con decodificador de texto y torre de visión, pero reducida mediante la regla genérica de `sweep.py` del repositorio transformers-mic: 2 capas en el decodificador y 2 capas en el codificador visual. El resto de la estructura se mantiene, incluidos los nombres de tensor del checkpoint real, lo que garantiza que cualquier código que cargue el modelo original encuentre los mismos identificadores en el fixture.

No hay entrenamiento. Los pesos se inicializan aleatoriamente con semilla 17 y solo se someten a una puerta de sensibilidad de entrada: cada perturbacion de las entradas del contrato debe desplazar los logits al menos 0,001. La perturbacion mas debil registrada (`attention_mask:all_ones`) produjo un desplazamiento de 0,111, de modo que no fue necesario entrenar nada. No existe dataset de entrenamiento, ni fases de SFT, RLHF o DPO, ni innovaciones de decodificacion. Los ficheros del procesador (tokenizer, `added_tokens.json`, `merges.txt`, `vocab.json`, `special_tokens_map.json`, `tokenizer_config.json`, `chat_template.jinja`, `preprocessor_config.json`, `generation_config.json`) se copian byte a byte desde el checkpoint de Microsoft, por lo que la tokenizacion y el chat template son los reales. El repositorio incluye tambien el informe tecnico `phi_4_mm.tech_report.02252025.pdf` del modelo base.

## Capacidades

- Generacion de texto: no operativa. Los pesos son aleatorios, por lo que la salida no es linguistica ni coherente.
- Razonamiento, codigo y matematicas: no disponibles; no hay capacidad emergente con 2 capas y pesos sin entrenar.
- Vision: la arquitectura incluye torre de vision y el `preprocessor_config.json` real, pero el modelo no produce descripciones ni respuestas visuales validas.
- Tool calling / function calling: no soportado de forma funcional; solo se puede validar el contrato de integracion.
- Agentes y razonamiento multi-paso: no aplicable.
- Multilingue: no verificable; el tokenizer copiado es el del modelo base, pero no hay capacidad de generacion asociada.
- Capacidad real: servir como fixture de pruebas. Valida carga en Transformers, formas de tensor, nombres de parametros, forward, loss, gradientes y compatibilidad del procesador multimodal.
- Modo thinking o audio: no disponible.

## Casos de uso

- Pruebas de integracion en Transformers: cargar el modelo con `AutoModelForCausalLM`/clase especifica, ejecutar un forward y comprobar formas y dtypes sin descargar el checkpoint completo de Microsoft. Adecuado por su tamano de 0,1 GB y por replicar los nombres de tensor reales.
- Smoke tests en CI/CD: incluir el fixture en la bateria de pruebas de una libreria de inferencia para detectar roturas de API en minutos, con un consumo de disco y red minimo.
- Validacion del pipeline multimodal extremo a extremo: al conservar el tokenizer, el chat template y el `preprocessor_config.json` originales, permite comprobar que el preprocesado de imagen, texto y audio produce las entradas esperadas antes de tocar el modelo grande.
- Desarrollo de herramientas de cuantizacion: los pesos en bfloat16 con nombres de tensor reales sirven para probar conversores a GGUF/INT8/FP8 y verificar mapeos de capas sin coste de almacenamiento.
- Regresion de tokenizer y plantillas de chat: util para detectar cambios incompatibles en `chat_template.jinja` o en los tokens especiales comparando contra la copia byte a byte de referencia.
- Benchmarking del coste de carga: medir el overhead de `from_pretrained`, inicializacion de shards y asignacion de memoria en distintas versiones de la libreria, aislando el efecto del tamano del checkpoint.
- Docencia y demostracion de arquitectura: inspeccionar la estructura de Phi-4 Multimodal (capas, atencion, torre de vision) con un modelo que cabe en cualquier equipo.
- Verificacion de contratos en `integration.json`: validar que una implementacion de framework cumple las expectativas declaradas en `integrations/transformers/expectations`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

| Benchmark | Resultado | Motivo |
|---|---|---|
| MMLU | no disponible | pesos aleatorios, sin entrenamiento |
| HumanEval | no disponible | pesos aleatorios, sin entrenamiento |
| GSM8K | no disponible | pesos aleatorios, sin entrenamiento |
| Cualquier metrica de calidad | no disponible | el autor lo declara explicitamente como `test-artifact` |

El unico dato de validacion publicado es la puerta de sensibilidad de entrada: todas las perturbaciones de las entradas movieron los logits al menos 0,001, con un minimo de 0,111 en `attention_mask:all_ones`.

## Requisitos de hardware

- VRAM estimada: aproximadamente 33 MB para los pesos en bfloat16 (16.567.680 parametros x 2 bytes = 33.135.360 bytes, unos 31,6 MiB) y en torno a 66 MB en float32, mas el espacio de activaciones, que es minimo con 2 capas.
- GPU recomendadas: cualquiera. El modelo cabe en CPU y en cualquier GPU con mas de 1 GB de memoria; una RTX 4090, A100 o H100 estan sobredimensionadas para este fixture.
- Consumer GPU: si, en cualquier GPU de consumo de los ultimos diez anos, e incluso en CPU sin GPU dedicada.
- Opciones de despliegue: el autor documenta uso con Transformers en `integrations/transformers/usage.md`. El soporte en vLLM, TGI, llama.cpp u Ollama no esta verificado en la informacion disponible; para llama.cpp u Ollama haria falta una conversion a GGUF que no se distribuye.
- Latencia y throughput: no disponibles. No se han publicado mediciones; con 2 capas el coste por forward es de orden de milisegundos en CPU, pero es una estimacion, no un dato medido.
- Almacenamiento: 0,1 GB de repositorio, sin necesidad de sharding.

## Comparativa con modelos similares

| Caracteristica | `huggingface-mic/Phi-4-multimodal-instruct-mic` | `microsoft/Phi-4-multimodal-instruct` |
|---|---|---|
| Parametros totales | 16.567.680 | no disponible en la informacion proporcionada |
| Capas | 2 (texto) y 2 (vision) | no disponible en la informacion proporcionada |
| Longitud de contexto | no disponible | no disponible en la informacion proporcionada |
| Pesos | aleatorios (semilla 17) | entrenados |
| Licencia | no disponible en metadatos; `LICENSE` copiado del base | no disponible en la informacion proporcionada |
| Formato | safetensors (bfloat16) | no disponible en la informacion proporcionada |
| Uso previsto | pruebas de integracion y CI | inferencia multimodal real |
| Disponibilidad | publico, 0 descargas, 0 likes | publico en HuggingFace (referenciado) |

No se han identificado en la informacion disponible otras alternativas comparables de la misma categoria (fixtures de contrato para arquitecturas multimodales) con las que establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- No es un modelo usable: el autor lo marca como `test-artifact` y advierte explicitamente de que no debe emplearse como modelo. Cualquier despliegue en produccion produciria salidas sin sentido.
- Alucinacion total: con pesos aleatorios, toda salida es ruido estadistico; no hay base para evaluar fidelidad factual.
- Sin alineacion: no ha pasado por SFT, RLHF ni DPO, por lo que no existen salvaguardas de contenido. Tampoco hay sesgos medibles, porque no hay comportamiento aprendido.
- Capacidad representacional practicamente nula: 2 capas en el decodificador y 2 en vision no permiten ninguna tarea cognitiva, aunque la configuracion se ampliase.
- Licencia ambigua: los metadatos de HuggingFace no declaran licencia. El repositorio incluye una copia del fichero `LICENSE` del modelo base, pero sus terminos no se detallan en la informacion disponible; no debe asumirse uso comercial sin verificar ese fichero.
- Contexto e idiomas no verificables: al haberse reducido la configuracion, la ventana de contexto efectiva no esta documentada, y no hay evidencia de comportamiento multilingue.
- Soporte de frameworks no garantizado: solo se documenta el uso con Transformers; no hay artefactos GGUF ni confirmacion de soporte en vLLM, TGI o llama.cpp.
- Sin validacion comunitaria: 0 descargas y 0 likes; no existe evidencia externa de su correcto funcionamiento mas alla de las puertas internas del autor.
- Metadatos anomalos: la fecha de creacion registrada (2026-10-27) es posterior a la fecha habitual de consulta, lo que sugiere un artefacto en los metadatos del repositorio.
- Dependencia del contrato: si el checkpoint base cambia sus nombres de tensor o sus ficheros de procesador, el fixture deja de representarlo y hay que reconstruirlo con `build_fixtures.py`.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/huggingface-mic/Phi-4-multimodal-instruct-mic
- Manifiesto del contrato: https://huggingface.co/huggingface-mic/Phi-4-multimodal-instruct-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/Phi-4-multimodal-instruct-mic/blob/main/integrations/transformers/usage.md
- Expectativas para Transformers: https://huggingface.co/huggingface-mic/Phi-4-multimodal-instruct-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/Phi-4-multimodal-instruct-mic/blob/main/build.json
- Modelo base: https://huggingface.co/microsoft/Phi-4-multimodal-instruct
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Regla de reduccion (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion (`build_fixtures.py`): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Informe tecnico de Phi-4 Multimodal (PDF incluido en el repo): https://huggingface.co/huggingface-mic/Phi-4-multimodal-instruct-mic/blob/main/phi_4_mm.tech_report.02252025.pdf
