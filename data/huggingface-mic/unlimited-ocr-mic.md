# huggingface-mic/Unlimited-OCR-mic

## Resumen

Unlimited-OCR-mic es un artefacto de prueba (fixture) publicado por el usuario huggingface-mic bajo el identificador `huggingface-mic/Unlimited-OCR-mic`. No se trata de un modelo funcional destinado a inferencia real, sino de una version reducida artificialmente del modelo `baidu/Unlimited-OCR`, creada para validar contratos de integracion con la libreria Transformers. El propio autor lo etiqueta explicitamente como `test-artifact` para excluirlo de las busquedas de modelos candidatos.

El fixture conserva la arquitectura declarada del modelo original (`UnlimitedOcrForConditionalGeneration`) pero con una configuracion drasticamente reducida: 2 capas en el decoder, 2 en el encoder SAM, 2 en el encoder y 2 en el modulo de texto. El resultado son 18.573.568 parametros (aproximadamente 18,6 millones) con pesos aleatorios generados con semilla 17, no entrenados.

Su relevancia es puramente tecnica y de infraestructura: sirve para comprobar que las expectativas de framework (nombres de tensores, procesadores, plantillas de chat, configuracion) coinciden entre distintas versiones de checkpoints del modelo base. No debe emplearse para ninguna tarea de OCR, generacion de texto ni produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `UnlimitedOcrForConditionalGeneration` (encoder SAM + encoder + decoder de texto, segun ficheros de modelado copiados del modelo base) |
| Parametros totales | 18.573.568 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura del modelo base `baidu/Unlimited-OCR` mediante la clase `UnlimitedOcrForConditionalGeneration`, que combina un encoder de tipo SAM, un encoder adicional y un decoder de texto, con ficheros de modelado heredados de DeepSeek-V2 (`modeling_deepseekv2.py`, `configuration_deepseek_v2.py`). La configuracion se ha reducido aplicando la regla generica de `sweep.py`: `num_hidden_layers` a 2 en el decoder, en el encoder SAM, en el encoder y en el modulo de texto.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y se aceptaron tras superar una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato desplazo los logits al menos 0,001 (el caso mas debil, `pixel_values:halve`, con 0,456). Los ficheros de procesador (tokenizer, plantilla de chat, preprocessor, configuracion de generacion, LICENSE y PDF) se copiaron byte a byte desde `baidu/Unlimited-OCR`. El fixture es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes, y conserva los mismos nombres de tensor que el checkpoint real.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen salidas semanticamente validas.
- Conserva la interfaz de procesador del modelo base (tokenizer, plantilla de chat, preprocessor de imagen) para pruebas de integracion.
- Permite verificar contratos de framework: nombres de tensores, formas, dtypes y expectativas de Transformers.
- Sirve como fixture de regresion para pipelines de CI que cargan checkpoints de `baidu/Unlimited-OCR`.
- No dispone de capacidades reales de OCR, generacion de texto, razonamiento, codigo, vision ni tool calling.
- Soporte multilingue: no disponible (depende del modelo base, no verificado en el fixture).

## Casos de uso

- Pruebas de integracion en Transformers: cargar el fixture para comprobar que `UnlimitedOcrForConditionalGeneration` se instancia y ejecuta forward sin errores antes de probar con el checkpoint real.
- Validacion de contratos de API: usar `integration.json` y `integrations/transformers/expectations` para verificar que las firmas y salidas esperadas coinciden entre versiones de la libreria.
- CI/CD de bajo coste: ejecutar tests de humo en runners sin GPU de gran memoria, ya que 18,6 M de parametros caben en cualquier entorno.
- Regresion de tokenizer y processor: comprobar que los ficheros copiados byte a byte (tokenizer, chat template, preprocessor) se cargan correctamente tras actualizaciones de Transformers.
- Verificacion de dtypes: testear rutas de ejecucion en float32, bfloat16 y float16 sin necesidad de pesos reales.
- Desarrollo de utilidades de inspeccion de modelos: probar herramientas que enumeran tensores, formas y configuraciones sobre un checkpoint ligero con los mismos nombres que el original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que es un artefacto de prueba con pesos aleatorios, por lo que cualquier metrica de calidad carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con 18,6 M de parametros en bfloat16 (unos 37 MB de pesos) mas activaciones y buffers del procesador.
- GPU recomendadas: cualquiera; el fixture cabe en CPU y en GPU consumer de gama baja.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3050, RTX 4090) e incluso en entornos sin GPU.
- Opciones de despliegue: Transformers con `trust_remote_code=True` (requiere `custom_code`); vLLM, llama.cpp, Ollama y TGI no estan indicados en la informacion disponible.
- Latencia y throughput: no disponibles; al ser pesos aleatorios y un modelo diminuto, las mediciones no serian representativas del modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Unlimited-OCR-mic | 18,6 M | no disponible | Fixture de test | no disponible | Hugging Face (`huggingface-mic/Unlimited-OCR-mic`) |
| baidu/Unlimited-OCR | no disponible | no disponible | OCR real | no disponible | Hugging Face (`baidu/Unlimited-OCR`) |

No se dispone de informacion sobre otros fixtures comparables ni sobre las especificaciones completas del modelo base en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo usable: los pesos son aleatorios y las salidas no tienen valor semantico.
- Etiquetado como `test-artifact` por el autor; no debe aparecer en busquedas de modelos candidatos ni desplegarse en produccion.
- La licencia no esta disponible en la informacion proporcionada; el fichero LICENSE se copio del modelo base, por lo que las condiciones reales dependen de `baidu/Unlimited-OCR`.
- Riesgo de confusion: el nombre puede llevar a pensar que es una version ligera operativa de Unlimited-OCR, cuando es solo un fixture de integracion.
- Las capacidades de OCR, vision e idiomas del modelo base no estan verificadas en este repositorio.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar codigo del repositorio.
- No se han publicado sesgos, tasas de alucinacion ni metricas de contexto porque no aplican a un artefacto sin entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface-mic/Unlimited-OCR-mic
- Modelo base: https://huggingface.co/baidu/Unlimited-OCR
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Unlimited-OCR-mic.html
- Script de barrido (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures (`build_fixtures.py`): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Manifiesto de contrato (`integration.json`): https://huggingface.co/huggingface-mic/Unlimited-OCR-mic/blob/main/integration.json
- Uso con Transformers (`integrations/transformers/usage.md`): https://huggingface.co/huggingface-mic/Unlimited-OCR-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers (`integrations/transformers/expectations`): https://huggingface.co/huggingface-mic/Unlimited-OCR-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture (`build.json`): https://huggingface.co/huggingface-mic/Unlimited-OCR-mic/blob/main/build.json
