# huggingface-mic/MiniCPM-V-4.6-mic

## Resumen

MiniCPM-V-4.6-mic es un artefacto de prueba (fixture) derivado de openbmb/MiniCPM-V-4.6, el modelo multimodal imagen-texto de la familia MiniCPM-V. Lo publica la organizacion huggingface-mic y no es un modelo utilizable: la propia model card lo etiqueta como `test-artifact` y advierte de que sirve para validar contratos de integracion y expectativas de frameworks, no para inferencia real. Su interes es, por tanto, metodologico: demuestra como reducir un checkpoint multimodal a un esqueleto de 16,7 millones de parametros manteniendo la misma arquitectura, los mismos nombres de tensores y los mismos ficheros de procesador que el modelo original.

El fixture conserva la clase `MiniCPMV4_6ForConditionalGeneration` y reduce la profundidad del codificador de texto y del codificador visual a 2 capas cada uno. Los pesos son aleatorios (semilla 17), pero superaron una compuerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato desplaza los logits al menos 0,001. Los ficheros de procesador (tokenizer, chat template, preprocessor, generation config) se copiaron byte a byte desde openbmb/MiniCPM-V-4.6.

Es relevante ahora porque el ecosistema de transformers esta incorporando pruebas de conformidad por modelo (MIC, model integration contract) y este tipo de fixtures permite ejecutar esas pruebas en CI sin descargar ni ejecutar el checkpoint completo. Para un desarrollador que quiera entender como se valida la integracion de un modelo multimodal en Transformers, el repositorio es un ejemplo concreto; para cualquiera que busque un modelo funcional, no lo es.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MiniCPMV4_6ForConditionalGeneration (transformer multimodal imagen-texto, fixture reducido a 2 capas de texto y 2 capas de vision) |
| Parametros totales | 16.713.808 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float32; el fixture es finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura del modelo base openbmb/MiniCPM-V-4.6: un modelo condicional imagen-texto con un codificador visual y un decodificador de lenguaje, empaquetados bajo la clase `MiniCPMV4_6ForConditionalGeneration`. La reduccion se aplico con la regla generica de `sweep.py` del repositorio transformers-mic, que rebaja `num_hidden_layers` a 2 tanto en la torre de texto como en la de vision. Los nombres de tensores coinciden exactamente con los del checkpoint real, de modo que cualquier codigo que cargue el modelo original puede cargar el fixture sin cambios en el codigo.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se aceptaron porque pasaron la compuerta de sensibilidad a la entrada: todas las perturbaciones de las entradas del contrato (incluida la mas debil, `pixel_values:halve`, con 0,0876) movieron los logits al menos 0,001. Los ficheros `chat_template.jinja`, `generation_config.json`, `preprocessor_config.json`, `tokenizer.json` y `tokenizer_config.json` se copiaron byte a byte desde openbmb/MiniCPM-V-4.6, de forma que el preprocesado y la plantilla de chat son identicos a los del modelo real. El fixture se guardo en float32, el dtype con el que se carga el modelo base por defecto, y se verifico que forward, loss y gradientes son finitos en float32, bfloat16 y float16.

## Capacidades

- No es un modelo funcional: no genera texto, no razona, no responde a prompts ni produce salidas con sentido.
- Sirve como contrato de integracion: valida que la clase `MiniCPMV4_6ForConditionalGeneration` carga, preprocesa y ejecuta forward con las mismas firmas que el modelo real.
- Reutiliza el tokenizer, la plantilla de chat y el preprocesador de openbmb/MiniCPM-V-4.6, por lo que permite probar pipelines de preprocesado imagen-texto sin el checkpoint completo.
- Soporta ejecucion en float32, bfloat16 y float16 con resultados finitos en forward, loss y gradientes.
- No dispone de tool calling, capacidades de agente, modo thinking, audio ni ninguna otra capacidad del modelo base.
- Multilingue: no disponible; el fixture no aporta informacion sobre idiomas.

## Casos de uso

- Pruebas de conformidad en CI: ejecutar la suite de integracion de Transformers contra un checkpoint de 0,2 GB en lugar del modelo completo, reduciendo tiempo de descarga y coste de computo en cada pull request.
- Validacion de pipelines de preprocesado: comprobar que el tokenizer, la plantilla de chat y el preprocesador de imagenes producen las mismas estructuras que el modelo real, ya que los ficheros se copiaron byte a byte.
- Desarrollo de codigo de carga de modelos: verificar que una funcion de carga personalizada resuelve correctamente los nombres de tensores y la configuracion de `MiniCPMV4_6ForConditionalGeneration` antes de pasar al checkpoint real.
- Pruebas de compatibilidad de dtypes: comprobar que un pipeline de inferencia o entrenamiento maneja correctamente float32, bfloat16 y float16 con un modelo que produce gradientes finitos en los tres casos.
- Reproduccion de contratos de integracion: usar `integration.json`, `integrations/transformers/usage.md` y `integrations/transformers/expectations` como referencia para entender que se espera de un modelo MiniCPM-V en Transformers.
- Docencia y formacion: ilustrar como se construye un fixture de modelo reduciendo capas y manteniendo arquitectura, tensores y procesador, con trazabilidad completa en `build.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios y no tiene rendimiento medible en tareas reales.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para inferencia en float32 (16,7 millones de parametros, aproximadamente 67 MB de pesos); el repositorio ocupa 0,2 GB.
- GPU recomendadas: cualquier GPU consumer moderna sirve; el fixture cabe incluso en CPU. No requiere A100, H100 ni RTX 4090.
- Cabe en cualquier GPU consumer y en la mayoria de entornos sin GPU.
- Opciones de despliegue: carga mediante Transformers con la clase `MiniCPMV4_6ForConditionalGeneration`; no se ha validado con vLLM, llama.cpp, Ollama ni TGI, y al ser un fixture no tiene sentido desplegarlo en produccion.
- Latencia y throughput: no disponibles; al ser un modelo de prueba con pesos aleatorios, las mediciones no serian representativas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/MiniCPM-V-4.6-mic | 16,7 M | no disponible | Fixture de prueba | no disponible | HuggingFace |
| openbmb/MiniCPM-V-4.6 | no disponible en la informacion proporcionada | no disponible | Modelo multimodal imagen-texto real | no disponible | HuggingFace |
| Otros fixtures de transformers-mic | no disponible | no disponible | Pruebas de conformidad de integracion | no disponible | HuggingFace |

La comparativa relevante es con su modelo base: el fixture comparte arquitectura, nombres de tensores y ficheros de procesador con openbmb/MiniCPM-V-4.6, pero sustituye los pesos entrenados por pesos aleatorios y reduce la profundidad a 2 capas por torre. No se dispone de datos de parametros, contexto ni licencia del modelo base en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo utilizable: la model card lo declara explicitamente como `test-artifact` y advierte de que no debe usarse como modelo candidato.
- Pesos aleatorios: cualquier salida generada es ruido sin relacion con la entrada; no hay riesgo de alucinacion en el sentido habitual porque no produce contenido significativo.
- Sesgos: no aplica en la practica, ya que no se entreno con datos; los sesgos del modelo base no se heredan porque los pesos no se heredan.
- Limitaciones de contexto e idioma: no disponibles; el fixture no aporta informacion al respecto.
- Licencia: no disponible; antes de reutilizar cualquier componente conviene consultar la licencia de openbmb/MiniCPM-V-4.6, de la que proceden los ficheros de procesador.
- Caveat de produccion: no desplegar bajo ninguna circunstancia; su unico uso legitimo es como fixture de pruebas y validacion de integracion.
- El repositorio solo incluye los pesos reducidos, el uso y las expectativas de framework; para regenerar el resto de ficheros hay que ejecutar `python example/build_fixtures.py --fixture MiniCPM-V-4.6-mic`.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/huggingface-mic/MiniCPM-V-4.6-mic
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.6
- Manifiesto del contrato: https://huggingface.co/huggingface-mic/MiniCPM-V-4.6-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/MiniCPM-V-4.6-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/MiniCPM-V-4.6-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/MiniCPM-V-4.6-mic/blob/main/build.json
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/MiniCPM-V-4.6-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de reduccion: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
