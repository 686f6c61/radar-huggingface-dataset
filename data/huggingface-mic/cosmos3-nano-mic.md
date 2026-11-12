# huggingface-mic/Cosmos3-Nano-mic

## Resumen

Cosmos3-Nano-mic es un artefacto de prueba (fixture) publicado por el usuario huggingface-mic, derivado del modelo nvidia/Cosmos3-Nano. No se trata de un modelo utilizable en produccion: la propia model card lo etiqueta explicitamente como `test-artifact` y advierte de que sus pesos son aleatorios (semilla 17), generados sin entrenamiento alguno. Su proposito es servir como fixture de integracion para validar contratos de frameworks (en concreto Transformers) con la misma arquitectura, nombres de tensores y ficheros de procesador que el checkpoint real, pero con una configuracion reducida.

El modelo conserva la clase arquitectonica `Cosmos3OmniForConditionalGeneration` del modelo base, un modelo multimodal de lenguaje de la familia Cosmos3 de NVIDIA, pero con la torre de texto recortada a 2 capas ocultas. El repositorio ocupa 0,1 GB y contiene 20.165.312 parametros en formato safetensors, guardados en float32. Los ficheros de procesador (tokenizer, chat template, preprocessors de imagen y video, politicas de seguridad) se copian byte a byte del checkpoint original.

Su relevancia es acotada y estrictamente tecnica: permite a los mantenedores de integraciones ejecutar pruebas de sensibilidad de entradas, comprobaciones de formas y dtypes, y validacion de contratos sin descargar el modelo completo de NVIDIA. No debe confundirse con un modelo funcional para generacion o razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cosmos3OmniForConditionalGeneration (multimodal, transformer; torre de texto reducida a 2 capas ocultas) |
| Parametros totales | 20.165.312 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en float32; se declara finitud en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura del modelo base nvidia/Cosmos3-Nano, un modelo multimodal de la familia Cosmos3 orientado a generacion condicional (clase `Cosmos3OmniForConditionalGeneration`). La unica diferencia estructural es la reduccion de la torre de texto a 2 capas ocultas, aplicada mediante la regla generica de recorte de `sweep.py` del repositorio transformers-mic. Los nombres de tensores coinciden con los del checkpoint real y los ficheros de procesador se copian literalmente, de modo que el contrato de entrada y salida es identico al del modelo original.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron con una puerta de sensibilidad de entradas: cada perturbacion de las entradas del contrato desplaza los logits al menos 0,001 (el caso mas debil, `pixel_values:halve`, alcanza 0,0739). El fixture se guarda en float32, el dtype con el que carga por defecto nvidia/Cosmos3-Nano, y se verifica que las salidas, la perdida y los gradientes son finitos en float32, bfloat16 y float16. La clave de fixture es `9ce7e45e1680`.

## Capacidades

- No es un modelo funcional: al tener pesos aleatorios, no genera texto, codigo ni contenido multimodal coherente.
- Sirve como fixture de integracion para validar la carga del modelo, formas de tensores, dtypes y contrato de entradas/salidas en Transformers.
- Incluye los ficheros de procesador del modelo base (tokenizer, chat template, preprocessor de imagen y video), lo que permite probar pipelines de preprocesado.
- Permite pruebas de sensibilidad de entradas y de finitud numerica en float32, bfloat16 y float16.
- No dispone de tool calling, razonamiento multi-paso ni capacidades multilingues reales, al carecer de entrenamiento.

## Casos de uso

- Pruebas de integracion en Transformers: ejecutar la carga del modelo y comprobar que los nombres de tensores y el contrato coinciden con nvidia/Cosmos3-Nano sin descargar el checkpoint completo.
- Validacion de preprocesado multimodal: usar los ficheros de procesador copiados para verificar que imagenes y video se transforman segun lo esperado antes de llegar al modelo.
- CI/CD de frameworks: incluir el fixture en la bateria de pruebas de transformers-mic para detectar regresiones en la carga de arquitecturas Cosmos3.
- Pruebas de finitud numerica: comprobar que forward, perdida y gradientes no producen NaN ni infinitos en float32, bfloat16 y float16.
- Verificacion de contratos de modelo: validar que el manifest `integration.json` y las expectativas en `integrations/transformers/expectations` se cumplen.
- Reproduccion de fixtures: reconstruir el artefacto con `build_fixtures.py --fixture Cosmos3-Nano-mic` para auditar hashes y fuentes fijadas en `build.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier metrica de calidad carece de sentido.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en float32 para los 20,2 M de parametros; cabe en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; puede ejecutarse en CPU o en GPUs de gama baja (por ejemplo, GTX 1650 o superiores) para pruebas.
- Cabe en consumer GPU: si, con margen amplio.
- Opciones de despliegue: carga directa con Transformers; no esta pensado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de inferencia real.
- Latencia y throughput: no disponibles; irrelevantes para un fixture.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/Cosmos3-Nano-mic | 20,2 M | no disponible | Fixture de integracion | no disponible | Hugging Face |
| nvidia/Cosmos3-Nano | no disponible | no disponible | Modelo multimodal real | no disponible | Hugging Face |
| Otros fixtures de transformers-mic | variable | no disponible | Pruebas de integracion | no disponible | Hugging Face |

La comparacion relevante es con nvidia/Cosmos3-Nano, del que este repositorio es una version recortada y con pesos aleatorios. No se dispone de datos de parametros, contexto ni licencia del modelo base en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y las salidas no tienen significado semantico.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; no debe desplegarse en produccion.
- La licencia no esta declarada en la informacion disponible, por lo que no puede confirmarse el uso comercial.
- Los idiomas soportados no estan declarados.
- La longitud de contexto y las capacidades multimodales reales dependen del modelo base, cuyos datos no se proporcionan.
- Riesgo de confusion: el nombre puede llevar a error si se interpreta como un modelo funcional de la familia Cosmos3.
- Al ser un fixture, no se han evaluado sesgos, alucinacion ni robustez.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/Cosmos3-Nano-mic
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Nano
- Manifest de contrato: integration.json (en el repositorio)
- Uso con Transformers: integrations/transformers/usage.md (en el repositorio)
- Expectativas de Transformers: integrations/transformers/expectations (en el repositorio)
- Procedencia del fixture: build.json (en el repositorio)
- Explicacion del recorte: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Cosmos3-Nano-mic.html
- Script de recorte: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
