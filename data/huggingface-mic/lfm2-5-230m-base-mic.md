# huggingface-mic/LFM2.5-230M-Base-mic

## Resumen

LFM2.5-230M-Base-mic es un artefacto de prueba (fixture) publicado por el usuario huggingface-mic, no un modelo entrenado utilizable. Se construye a partir de la arquitectura del modelo base LiquidAI/LFM2.5-230M-Base, pero con pesos aleatorios (semilla 17) y una configuracion reducida a 2 capas ocultas, lo que resulta en 4.272.672 parametros totales segun los tensores safetensors del repositorio. Su proposito declarado es servir como fixture de integracion para validar el contrato de la familia LFM2 en el ecosistema Transformers, incluyendo uso ejecutable y expectativas de framework.

El repositorio incluye el manifiesto de contrato (integration.json), la documentacion de uso con Transformers, el directorio de expectativas, la procedencia del fixture (build.json) y un enlace al proceso de reduccion del modelo. Los ficheros de procesador (tokenizer, chat template, generation config y licencia) se copian byte a byte del modelo base original, mientras que los pesos se generan aleatoriamente y se guardan en bfloat16.

La relevancia de este repositorio es exclusivamente de ingenieria y CI: permite verificar que una implementacion de Lfm2ForCausalLM carga, ejecuta y produce gradientes finitos en float32, bfloat16 y float16 sin necesidad de descargar ni ejecutar el checkpoint real. No debe emplearse para inferencia, evaluacion de calidad ni despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Lfm2ForCausalLM (transformer causal de la familia LFM2, configuracion reducida a 2 capas ocultas) |
| Parametros totales | 4.272.672 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el fichero LICENSE se copia del modelo base, pero su contenido no se detalla en la informacion proporcionada) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Lfm2ForCausalLM, la misma clase que el checkpoint LiquidAI/LFM2.5-230M-Base, pero con una configuracion encogida mediante la regla generica de sweep.py del proyecto transformers-mic, que reduce num_hidden_layers a 2. Los nombres de tensores coinciden con los del checkpoint real, de modo que el fixture conserva la interfaz de pesos esperada por el framework. Los ficheros de procesador (LICENSE, chat_template.jinja, generation_config.json, tokenizer.json y tokenizer_config.json) se copian byte a byte desde el modelo base.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y superaron una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato desplazo los logits al menos 0.001 (el caso mas debil, attention_mask:all_ones, dio 0.0557), por lo que no se considero necesario entrenar. El fixture es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes, y se guarda en bfloat16, el dtype con el que carga por defecto el modelo base. La clave del fixture es d63d0ee28710 y cubre todos los checkpoints cuyos ficheros de procesador son identicos byte a byte y cuya config coincide tras el encogimiento.

## Capacidades

- Carga y ejecucion en Transformers mediante Lfm2ForCausalLM con los nombres de tensores del checkpoint real.
- Validacion de contrato de integracion: manifiesto integration.json, uso ejecutable y directorio de expectativas del framework.
- Verificacion de sensibilidad a entradas del contrato (perturbaciones sobre logits).
- Comprobacion de estabilidad numerica: forward, loss y gradientes finitos en float32, bfloat16 y float16.
- Pruebas de CI sobre tokenizer y chat template copiados del modelo base.
- No dispone de capacidades generativas utiles: los pesos son aleatorios y la salida carece de valor semantico.
- No se documenta soporte de tool calling, agentes, vision, audio ni modo thinking.

## Casos de uso

- Pruebas de integracion en Transformers: cargar el fixture con Lfm2ForCausalLM y ejecutar un forward para verificar que la implementacion acepta los nombres de tensores y la configuracion de la familia LFM2 sin descargar el checkpoint real.
- CI de librerias de inferencia: usar el fixture como sustituto ligero en pipelines de integracion continua para detectar roturas de API en la carga de safetensors bfloat16.
- Validacion de chat template y tokenizer: al copiarse byte a byte del modelo base, permite probar el renderizado de plantillas de conversacion y la tokenizacion en tests automatizados.
- Verificacion de estabilidad numerica: ejecutar forward, loss y backward en float32, bfloat16 y float16 para comprobar que una implementacion concreta no produce NaN ni infinitos.
- Pruebas de puertas de sensibilidad: reproducir las perturbaciones del contrato (por ejemplo attention_mask:all_ones) y comprobar que los logits se desplazan por encima del umbral de 0.001.
- Regresion de compatibilidad entre versiones: fijar el fixture como referencia (clave d63d0ee28710) y comparar expectativas de framework entre releases de Transformers.
- Documentacion y ejemplos ejecutables: servir de soporte reproducible en tutoriales de integracion sin distribuir pesos reales del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explicitamente que es un artefacto de prueba, no un modelo utilizable, por lo que no procede evaluacion de calidad.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en bfloat16, dado el tamano de 4,27 M de parametros y el repo de 0,0 GB.
- GPU recomendadas: cualquier GPU consumer o integrada con soporte de bfloat16 o float16; no requiere A100, H100 ni RTX 4090.
- Cabe en cualquier GPU consumer e incluso en CPU; el cuello de botella es el framework, no el modelo.
- Opciones de despliegue: Transformers con Lfm2ForCausalLM es la via documentada; otras opciones (vLLM, llama.cpp, Ollama, TGI) no estan documentadas para este fixture.
- Latencia y throughput: no disponibles; al ser pesos aleatorios y de juguete, las mediciones no serian representativas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-230M-Base-mic | 4,27 M | no disponible | Fixture de integracion (pesos aleatorios) | no disponible | Hugging Face, 2288 descargas |
| LiquidAI/LFM2.5-230M-Base | no disponible en la informacion proporcionada | no disponible | Modelo base real de la familia LFM2 | no disponible | Hugging Face (referenciado como base_model) |
| Otros fixtures del proyecto transformers-mic | variable (configuracion encogida) | no disponible | Validacion de contratos de otras familias | no disponible | Hugging Face (proyecto huggingface-mic) |

No se dispone de datos de rendimiento ni de contexto para establecer una comparativa funcional con modelos de la misma categoria.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios (semilla 17) y las salidas carecen de significado; el autor lo etiqueta como test-artifact para excluirlo de busquedas de modelos candidatos.
- Riesgo de uso indebido: puede confundirse con el modelo base real por nombre y arquitectura; no debe desplegarse en produccion ni usarse en evaluaciones.
- Configuracion encogida: solo 2 capas ocultas frente al checkpoint original, por lo que cualquier comportamiento observado no es extrapolable.
- Licencia no verificada en la informacion proporcionada: aunque se copia el fichero LICENSE del modelo base, no se detalla su contenido ni las restricciones de uso comercial.
- Idiomas y contexto no documentados; no hay garantia de cobertura multilingue.
- Sesgos y alucinacion: no aplica evaluacion, pero al ser pesos aleatorios cualquier texto generado es ruido.
- Dependencia de reconstruccion: el repositorio incluye solo pesos slim, uso y expectativas; otros ficheros deben regenerarse con python example/build_fixtures.py --fixture LFM2.5-230M-Base-mic.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/LFM2.5-230M-Base-mic
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-230M-Base
- Proceso de reduccion del fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/LFM2.5-230M-Base-mic.html
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla generica de encogimiento (sweep.py): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
