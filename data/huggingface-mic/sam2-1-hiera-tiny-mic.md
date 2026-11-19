# huggingface-mic/sam2.1-hiera-tiny-mic

## Resumen

`sam2.1-hiera-tiny-mic` es un artefacto de prueba (fixture) publicado por la organizacion `huggingface-mic`, no un modelo utilizable en produccion. Se trata de una version reducida del checkpoint `facebook/sam2.1-hiera-tiny`, el modelo de segmentacion de video SAM 2.1 de Meta, creado especificamente para validar contratos de integracion y expectativas de frameworks dentro del ecosistema Transformers. El propio autor lo etiqueta como `test-artifact` para excluirlo de las busquedas de modelos candidatos.

El modelo conserva la arquitectura `Sam2Model` del original pero con una configuracion drasticamente reducida: 1.901.169 parametros frente a los cientos de millones del checkpoint real. La unica modificacion estructural documentada es la reduccion de `num_hidden_layers` a 2 en el `mask_decoder`. Los ficheros de procesador (`preprocessor_config.json`, `processor_config.json`, `sam2.1_hiera_t.yaml`, `video_preprocessor_config.json`) se copian byte a byte del modelo base.

Su relevancia es exclusivamente para desarrolladores que trabajan en el mantenimiento de integraciones de SAM 2 en Transformers: permite ejecutar pruebas de contrato (streaming de segmentacion de video) y validar expectativas de framework sin cargar los pesos completos del modelo real. No debe confundirse con un modelo de segmentacion funcional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sam2Model (transformer de segmentacion de video, configuracion reducida) |
| Parametros totales | 1.901.169 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float32; compatible con bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | facebook/sam2.1-hiera-tiny |
| Dtype de guardado | float32 |
| Tamano del repo | 0.0 GB |

## Arquitectura y entrenamiento

El modelo replica la arquitectura `Sam2Model` del checkpoint `facebook/sam2.1-hiera-tiny`, un sistema de segmentacion de video con capacidad de streaming. La unica diferencia estructural respecto al original es la reduccion del numero de capas ocultas del `mask_decoder` a 2, aplicada mediante la regla generica de reduccion de `sweep.py` del repositorio `transformers-mic`. Los ficheros de procesador y la configuracion YAML de Hiera se copian sin modificacion desde el modelo base, por lo que la interfaz de preprocesado es identica a la del checkpoint real.

No se trata de un modelo entrenado en el sentido convencional. Segun la model card, los pesos se sobreajustaron al paso de entrenamiento del contrato (50 pasos) porque los pesos aleatorios no superaban la puerta de sensibilidad a la entrada: la perturbacion `pixel_values:reverse` movia los logits solo 1.2e-06, por debajo del umbral de 0.001. Los tensores conservan los mismos nombres que el checkpoint real y el modelo es finito en float32, bfloat16 y float16 tanto en forward como en calculo de perdida y gradientes.

## Capacidades

- Ejecucion del contrato de segmentacion de video en streaming (SAM2 Video streaming segmentation) con fines de validacion.
- Verificacion de expectativas de framework para la integracion de SAM 2 en Transformers.
- Pruebas de sensibilidad a la entrada sobre `pixel_values` (puerta superada tras el sobreajuste).
- Compatibilidad de nombres de tensores con el checkpoint `facebook/sam2.1-hiera-tiny`, lo que permite validar cargas y mapeos.
- Ejecucion en float32, bfloat16 y float16 (forward, loss y gradientes finitos).
- No soporta generacion de texto, razonamiento, codigo, tool calling ni capacidades multimodales mas alla del contrato de segmentacion.
- No es un modelo funcional de segmentacion: no produce mascaras utiles sobre imagenes o videos reales.

## Casos de uso

- Pruebas de contrato en CI: ejecutar el fixture para validar que la integracion de SAM 2 en Transformers respeta el manifiesto `integration.json` sin descargar los pesos completos del modelo real.
- Validacion de expectativas de framework: comprobar que las expectativas documentadas en `integrations/transformers/expectations` se cumplen con un checkpoint de 1,9 M de parametros.
- Desarrollo de pipelines de carga de safetensors: verificar que los nombres de tensores coinciden con el checkpoint real antes de integrar en produccion.
- Pruebas de precision numerica: comprobar comportamiento finito en float32, bfloat16 y float16 en entornos de integracion continua.
- Validacion de preprocesado: al copiarse los ficheros de procesador byte a byte, sirve para testear el pipeline de preprocesado de SAM 2 sin cargar el modelo completo.
- Reproduccion de fixtures: regenerar el artefacto con `python example/build_fixtures.py --fixture sam2.1-hiera-tiny-mic` para auditar procedencia y hashes recogidos en `build.json`.
- Validacion de puertas de sensibilidad: comprobar que una perturbacion de entrada produce un cambio de logits superior al umbral de 0.001.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta la puerta de sensibilidad a la entrada (perturbacion `pixel_values:reverse` de 1.2e-06 con pesos aleatorios, superada tras 50 pasos de sobreajuste) y la finitud numerica en float32, bfloat16 y float16.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (1,9 M de parametros); practicamente despreciable en cualquier GPU moderna.
- GPU recomendadas: cualquier GPU consumer o integrada; no requiere A100, H100 ni RTX 4090.
- Cabe en cualquier GPU consumer y en CPU sin problema.
- Opciones de despliegue: carga via Transformers (`Sam2Model`) y ejecucion del script `build_fixtures.py` del repositorio `transformers-mic`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de segmentacion).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sam2.1-hiera-tiny-mic | 1.901.169 | no disponible | Fixture de segmentacion de video | no disponible | Hugging Face |
| facebook/sam2.1-hiera-tiny | no disponible en la informacion | no disponible | Segmentacion de video SAM 2.1 | no disponible en la informacion | Hugging Face |
| Otros checkpoints SAM 2.1 (hiera-small, base, large) | no disponible en la informacion | no disponible | Segmentacion de video SAM 2.1 | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento comparativos en la informacion proporcionada. El unico comparable directo documentado es `facebook/sam2.1-hiera-tiny`, del que este artefacto es una version reducida con fines de prueba.

## Limitaciones y advertencias

- No es un modelo utilizable: es un artefacto de prueba (`test-artifact`) disenado para validar contratos de integracion, no para segmentar imagenes o videos reales.
- Los pesos estan sobreajustados a 50 pasos del contrato; no generalizan a entradas fuera del contrato de prueba.
- Sesgos conocidos: no disponibles (no aplica a un fixture).
- Riesgo de alucinacion: no aplica en el sentido generativo, pero las salidas no son semanticamente validas como segmentaciones.
- Limitaciones de contexto o idioma: no disponibles.
- Restricciones de licencia para uso comercial: la licencia no esta disponible en la informacion proporcionada; debe consultarse el repositorio del modelo base `facebook/sam2.1-hiera-tiny` antes de cualquier uso.
- Caveat de produccion: no debe desplegarse en ningun pipeline de segmentacion real; su inclusion en busquedas de modelos candidatos esta deliberadamente excluida mediante el tag `test-artifact`.
- El repositorio no incluye todos los ficheros necesarios para reconstruir el fixture; hay que regenerarlos con `build_fixtures.py`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/sam2.1-hiera-tiny-mic
- Modelo base: https://huggingface.co/facebook/sam2.1-hiera-tiny
- Contrato de integracion (manifiesto): https://huggingface.co/huggingface-mic/sam2.1-hiera-tiny-mic/blob/main/integration.json
- Uso en Transformers: https://huggingface.co/huggingface-mic/sam2.1-hiera-tiny-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/sam2.1-hiera-tiny-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/sam2.1-hiera-tiny-mic/blob/main/build.json
- Documentacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/sam2.1-hiera-tiny-mic.html
- Repositorio `transformers-mic` (sweep.py): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
