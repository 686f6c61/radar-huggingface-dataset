# huggingface-mic/vitmatte-small-composition-1k-mic

## Resumen

`vitmatte-small-composition-1k-mic` es un artefacto de prueba (fixture) publicado por la organizacion `huggingface-mic` dentro del proyecto Transformers MIC. No es un modelo utilizable en produccion: se trata de una version "slim" del checkpoint real `hustvl/vitmatte-small-composition-1k`, reducida a 1.578.817 parametros para servir como fixture de integracion y validacion de contratos de framework. Su proposito es comprobar que la infraestructura de Transformers (procesadores, expectativas de entrada/salida, dtypes) funciona correctamente con la arquitectura `VitMatteForImageMatting` sin necesidad de cargar los pesos completos.

La arquitectura subyacente es VitMatte, un modelo de matting de imagen (extraccion de canal alfa / mascara de transparencia) que combina un backbone ViT con un decodificador especifico para matting. En este fixture el backbone se ha reducido a 3 capas ocultas mediante la regla generica de `sweep.py`, y los pesos se han sobreajustado artificialmente al paso de entrenamiento del contrato (160 pasos) para superar la puerta de sensibilidad a la entrada.

Es relevante unicamente como pieza de ingenieria: permite a los mantenedores de Transformers y a los autores de integraciones verificar el comportamiento del pipeline de matting con un repositorio de tamano despreciable (0.0 GB), mismos nombres de tensor que el checkpoint real y ficheros de procesador copiados byte a byte. La etiqueta `test-artifact` existe precisamente para excluirlo de busquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VitMatte (`VitMatteForImageMatting`), backbone ViT reducido a 3 capas |
| Parametros totales | 1.578.817 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (pesos guardados en float32; finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible (no aplica, tarea de vision) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | `hustvl/vitmatte-small-composition-1k` |
| Clave de fixture | `8710e115b319` |
| Pasos de sobreajuste | 160 |
| Dtype de guardado | float32 |
| Tamano del repo | 0.0 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VitMatte para matting de imagen: un backbone tipo Vision Transformer que extrae caracteristicas y un cabezal de decodificacion que produce la mascara alfa. En este fixture el backbone se ha reducido a `num_hidden_layers = 3` aplicando la regla generica de reduccion de `sweep.py`, conservando los mismos nombres de tensor que el checkpoint original `hustvl/vitmatte-small-composition-1k`. Los ficheros de procesador (`preprocessor_config.json`) se copiaron byte a byte desde el modelo base, de modo que el pipeline de preprocesado es identico al real.

No hay entrenamiento en el sentido habitual: los pesos se sobreajustaron artificialmente al paso de entrenamiento del contrato (160 pasos) porque los pesos aleatorios no superaban la puerta de sensibilidad a la entrada. En concreto, la perturbacion `pixel_values:reverse` movia los logits solo 1.2e-07, por debajo del umbral de 0.001 exigido. El fixture es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes, y se guardo en float32, el dtype con el que carga por defecto el checkpoint original.

## Capacidades

- Ejecucion del pipeline de matting de imagen con la misma interfaz que `hustvl/vitmatte-small-composition-1k`.
- Validacion de contratos de framework: manifiesto de integracion (`integration.json`), expectativas de Transformers y uso ejecutable.
- Verificacion de sensibilidad a la entrada mediante la puerta `pixel_values:reverse`.
- Comprobacion de compatibilidad de dtypes (float32, bfloat16, float16) en forward, loss y gradientes.
- Conservacion de nombres de tensor identicos al checkpoint real para pruebas de carga.
- No soporta generacion de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo de vision para matting.
- No es un modelo utilizable: esta etiquetado explicitamente como `test-artifact`.

## Casos de uso

- Pruebas de integracion en Transformers: cargar el fixture para verificar que la clase `VitMatteForImageMatting` y su procesador funcionan sin descargar los pesos completos del modelo real.
- Validacion de contratos de framework: ejecutar `integrations/transformers/expectations` para comprobar que las entradas y salidas esperadas se cumplen en cada version de la libreria.
- CI/CD de integraciones: usar el repositorio como dependencia ligera (0.0 GB) en pipelines de integracion continua que necesiten ejercitar el pipeline de matting sin coste de almacenamiento.
- Pruebas de compatibilidad de dtypes: verificar que forward, loss y gradientes son finitos en float32, bfloat16 y float16 antes de desplegar el modelo real.
- Desarrollo de herramientas de reduccion de modelos: servir como caso de referencia para `sweep.py` y `build_fixtures.py`, comprobando que la regla generica de shrink produce configuraciones validas.
- Auditoria de procedencia: usar `build.json` para verificar fuentes fijadas, resultados de las puertas y hashes de ficheros en revisiones de reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba y no se evalua en tareas de matting reales.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB (1.578.817 parametros en float32, aproximadamente 6,3 MB de pesos).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; tambien ejecutable en CPU.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: Transformers (carga directa del checkpoint), siguiendo `integrations/transformers/usage.md`. No se documentan opciones para vLLM, llama.cpp, Ollama o TGI, que no aplican a un modelo de vision de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Licencia | Proposito |
|---|---|---|---|---|
| `vitmatte-small-composition-1k-mic` (este) | 1.578.817 | Matting de imagen | no disponible | Fixture de prueba |
| `hustvl/vitmatte-small-composition-1k` | no disponible en la informacion | Matting de imagen | no disponible | Modelo real |
| Otros modelos de matting (p. ej. ViTMatte base/large) | no disponible en la informacion | Matting de imagen | no disponible | Modelos reales |

La unica comparacion directa posible es con su modelo base, del que este fixture hereda arquitectura, procesador y nombres de tensor, pero con backbone reducido y pesos sobreajustados artificialmente. No se dispone de datos de benchmarks ni de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo utilizable: la propia model card lo describe como "test artifact, not a usable model".
- Los pesos estan sobreajustados a un unico paso de entrenamiento (160 pasos) y no producen resultados de matting significativos.
- El backbone esta reducido a 3 capas, por lo que la capacidad representacional es muy inferior a la del checkpoint real.
- No debe usarse en produccion ni para generar mascaras alfa reales.
- La licencia no esta disponible; conviene consultar la del modelo base antes de cualquier uso.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones de idioma porque no aplican a un artefacto de prueba sin capacidad generativa.
- La etiqueta `test-artifact` esta pensada para excluirlo de busquedas de modelos candidatos; ignorarla puede llevar a seleccionarlo por error.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/vitmatte-small-composition-1k-mic
- Modelo base: https://huggingface.co/hustvl/vitmatte-small-composition-1k
- Manifiesto de contrato (`integration.json`): https://huggingface.co/huggingface-mic/vitmatte-small-composition-1k-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/vitmatte-small-composition-1k-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/vitmatte-small-composition-1k-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture (`build.json`): https://huggingface.co/huggingface-mic/vitmatte-small-composition-1k-mic/blob/main/build.json
- Documentacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/vitmatte-small-composition-1k-mic.html
- Repositorio `transformers-mic` (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion (`build_fixtures.py`): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
