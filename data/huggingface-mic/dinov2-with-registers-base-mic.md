# huggingface-mic/dinov2-with-registers-base-mic

## Resumen

`dinov2-with-registers-base-mic` es un artefacto de prueba (fixture) publicado por la organizacion `huggingface-mic` en Hugging Face. No es un modelo usable: se trata de una version "slim" del checkpoint `facebook/dinov2-with-registers-base` de Meta, reducida a 2 capas y con pesos aleatorios (semilla 17), pensada para validar contratos de integracion y expectativas de framework en pipelines de CI. La model card lo etiqueta explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos.

El modelo cubre la arquitectura `Dinov2WithRegistersModel`, un transformer de vision (ViT) con tokens de registro, pero con una configuracion encogida: `num_hidden_layers` reducido a 2 y un total de 226.112 parametros segun el recuento de safetensors. Los ficheros de procesador (`preprocessor_config.json`) se copian byte a byte del checkpoint original, de modo que la interfaz de preprocesado es identica a la del modelo real.

Su relevancia es puramente de ingenieria: permite a los mantenedores de `transformers-mic` verificar que la integracion con Transformers funciona (nombres de tensores, dtypes, sensibilidad a entradas) sin necesidad de descargar ni ejecutar el modelo completo de DINOv2. Cualquier uso como extractor de caracteristicas de imagen en produccion seria un error, ya que los pesos son aleatorios y la profundidad esta truncada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dinov2WithRegistersModel (ViT con tokens de registro) |
| Parametros totales | 226.112 (segun safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, sin contexto textual) |
| Tipos de cuantizacion | no disponible (pesos guardados en float32) |
| Idiomas soportados | no disponible (modelo de vision, sin capacidades linguisticas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

La arquitectura subyacente es DINOv2 with registers, un transformer de vision auto-supervisado desarrollado por Meta AI que incorpora tokens de registro para mejorar la calidad de los mapas de atencion. Sin embargo, este fixture no entrena nada: los pesos son aleatorios con semilla 17 y la configuracion se ha encogido mediante la regla generica de `sweep.py` del repositorio `transformers-mic`, fijando `num_hidden_layers` a 2. Los ficheros de procesador se copian byte a byte del checkpoint original `facebook/dinov2-with-registers-base`.

El fixture pasa una puerta de sensibilidad a entradas: cada perturbacion de las entradas del contrato mueve los logits al menos 0,001 (la mas debil, `pixel_values:halve`, con 0,373). Los tensores conservan los mismos nombres que el checkpoint real y el modelo es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. El identificador de fixture es `6c80810e54a5` y cubre todos los checkpoints cuyos ficheros de procesador son identicos byte a byte y cuya config coincide tras el encogimiento.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y la profundidad esta truncada, por lo que no produce caracteristicas utiles.
- Sirve como fixture de integracion para validar la carga del modelo en Transformers (`Dinov2WithRegistersModel`).
- Verifica la compatibilidad de nombres de tensores y dtypes con el checkpoint real.
- Comprueba la sensibilidad a entradas del contrato (perturbaciones de `pixel_values`).
- No soporta tool calling, agentes, generacion de texto, razonamiento ni capacidades multilingues.
- No dispone de modo thinking, vision real ni audio.

## Casos de uso

- Pruebas de integracion en CI: ejecutar el fixture en pipelines de integracion continua para verificar que la clase `Dinov2WithRegistersModel` carga y hace forward sin errores, sin coste de descarga del modelo completo.
- Validacion de contratos de framework: comprobar que los ficheros de procesador copiados del checkpoint original se cargan correctamente y que las expectativas de Transformers se cumplen.
- Verificacion de dtypes: asegurar que el modelo es finito en float32, bfloat16 y float16 en forward, loss y gradientes antes de desplegar cambios en la libreria.
- Regresion de nombres de tensores: detectar roturas cuando se renombran parametros o se modifica el mapeo de checkpoints en Transformers.
- Pruebas de sensibilidad a entradas: validar que perturbaciones de `pixel_values` producen cambios medibles en los logits, como control de calidad del pipeline de evaluacion.
- Desarrollo de herramientas de fixture: servir de ejemplo reproducible para construir fixtures de otros modelos mediante `build_fixtures.py` y `sweep.py`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios y solo 2 capas, cualquier metrica de calidad seria irrelevante.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB (226.112 parametros en float32, unos 0,9 MB de pesos).
- GPU recomendadas: cualquier GPU consumer o incluso CPU es suficiente; no requiere A100, H100 ni RTX 4090.
- Cabe en cualquier GPU consumer y en CPU.
- Opciones de despliegue: carga directa con Transformers (`Dinov2WithRegistersModel`); no se ha validado con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser un fixture de 2 capas, la latencia es practicamente despreciable.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dinov2-with-registers-base-mic` | 226.112 (2 capas) | no aplica | Fixture de test | no disponible | Hugging Face |
| `facebook/dinov2-with-registers-base` | no disponible en la informacion | no aplica | Extractor de caracteristicas de imagen | no disponible | Hugging Face |
| Otros fixtures de `huggingface-mic` | variable | no aplica | Pruebas de integracion | no disponible | Hugging Face |

## Limitaciones y advertencias

- No es un modelo usable: pesos aleatorios (semilla 17) y solo 2 capas; las salidas carecen de valor semantico.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; no debe desplegarse en produccion.
- Licencia no disponible: no se puede confirmar el regimen de uso comercial.
- Sin capacidades linguisticas ni multimodales reales; no soporta texto, tool calling ni agentes.
- Los ficheros de procesador son identicos al checkpoint original, pero el resto de artefactos debe regenerarse con `build_fixtures.py`.
- El repo ocupa 0,0 GB segun Hugging Face, coherente con un fixture minimo; no contiene pesos utiles para inferencia real.

## Enlaces

- [Hugging Face: huggingface-mic/dinov2-with-registers-base-mic](https://huggingface.co/huggingface-mic/dinov2-with-registers-base-mic)
- [Modelo base: facebook/dinov2-with-registers-base](https://huggingface.co/facebook/dinov2-with-registers-base)
- [Repositorio transformers-mic](https://github.com/huggingface/transformers-mic)
- [Script build_fixtures.py](https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py)
- [Script sweep.py](https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py)
- [Explicacion del encogimiento del fixture](https://huggingface-mic-mic-coverage.static.hf.space/shrink/dinov2-with-registers-base-mic.html)
