# huggingface-mic/HunyuanOCR-mic

## Resumen

HunyuanOCR-mic es un artefacto de prueba (fixture) publicado en Hugging Face bajo el identificador `huggingface-mic/HunyuanOCR-mic`. No es un modelo entrenado ni utilizable para inferencia real: se trata de una version reducida artificialmente del modelo `tencent/HunyuanOCR`, generada para validar la integracion de dicha arquitectura en el ecosistema Transformers. El autor del repositorio es la organizacion `huggingface-mic`, y el modelo esta etiquetado explicitamente como `test-artifact` para excluirlo de las busquedas de modelos candidatos.

El fixture conserva la arquitectura del modelo original (`HunYuanVLForConditionalGeneration`) pero con una configuracion drasticamente reducida: 2 capas en el modulo de texto y 2 capas en el modulo de vision, lo que resulta en 9.054.208 parametros totales. Los pesos son aleatorios (semilla 17) y no han pasado por ningun proceso de entrenamiento; unicamente superaron una comprobacion de sensibilidad a las entradas (cada perturbacion de los inputs mueve los logits al menos 0,001).

Su relevancia es puramente tecnica y de infraestructura: sirve como contrato ejecutable para verificar que las implementaciones de `HunYuanVLForConditionalGeneration` en Transformers cargan, ejecutan forward, calculan perdida y propagan gradientes correctamente, con los mismos nombres de tensores que el checkpoint real. No debe confundirse con el modelo HunyuanOCR de Tencent, que es el sistema OCR real al que este fixture da cobertura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HunYuanVLForConditionalGeneration (transformer multimodal texto+vision) |
| Parametros totales | 9.054.208 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura `HunYuanVLForConditionalGeneration`, la misma clase que el checkpoint original `tencent/HunyuanOCR`. Se trata de un transformer multimodal que combina un codificador de vision con un decodificador de lenguaje para tareas de comprension de documentos e imagenes. En este fixture, la configuracion se ha reducido mediante la regla generica de `sweep.py` del proyecto `transformers-mic`: 2 capas ocultas en el modulo de texto y 2 capas ocultas en el modulo de vision.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se generaron exclusivamente para satisfacer la comprobacion de sensibilidad a las entradas del contrato de integracion. Los ficheros de procesador (`tokenizer.json`, `tokenizer_config.json`, `preprocessor_config.json`, `chat_template.jinja`, `special_tokens_map.json`, `generation_config.json`, `video_preprocessor_config.json` y `LICENSE`) se copiaron byte a byte desde `tencent/HunyuanOCR`. Los pesos se guardaron en bfloat16, el dtype por defecto del modelo original, y se verifico que son finitos en float32, bfloat16 y float16 tanto en forward como en perdida y gradientes. Los nombres de tensores coinciden exactamente con los del checkpoint real.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen salidas semanticamente validas.
- Sirve como fixture de integracion para validar la carga y ejecucion de `HunYuanVLForConditionalGeneration` en Transformers.
- Verifica forward pass, calculo de perdida y retropropagacion de gradientes en float32, bfloat16 y float16.
- Comprueba la sensibilidad de los logits ante perturbaciones de los inputs del contrato (por ejemplo, `pixel_values:halve` produce un desplazamiento de 0,0332).
- Valida la compatibilidad de los ficheros de procesador (tokenizer, preprocessor, chat template) copiados del modelo real.
- No soporta tool calling, agentes, razonamiento multietapa ni capacidades multilingues reales, al carecer de entrenamiento.
- No dispone de modo thinking, vision funcional ni audio en sentido operativo.

## Casos de uso

- Pruebas de integracion en Transformers: usar el fixture para comprobar que una version nueva de la libreria carga correctamente la arquitectura `HunYuanVLForConditionalGeneration` sin necesidad de descargar el checkpoint completo de Tencent.
- CI/CD de la libreria: ejecutar tests automatizados de forward, perdida y gradientes en float32, bfloat16 y float16 con un modelo de 9M parametros que cabe en cualquier entorno de integracion continua.
- Validacion de contratos de procesador: verificar que los ficheros de tokenizer y preprocessor copiados del modelo real se cargan y aplican sin errores en el pipeline de Transformers.
- Desarrollo de kernels y optimizaciones: probar modificaciones en atencion o capas lineales sobre una arquitectura multimodal realista pero de coste minimo antes de escalar al checkpoint completo.
- Regresion de nombres de tensores: comprobar que los mapeos de pesos y las conversiones de checkpoints siguen funcionando tras refactorizaciones, ya que el fixture replica exactamente los nombres del modelo original.
- Documentacion ejecutable: servir como ejemplo reproducible en la documentacion de `transformers-mic` para mostrar como se construyen fixtures multimodales con `build_fixtures.py`.
- Validacion de tooling de cuantizacion: probar pipelines de conversion a otros formatos sobre un modelo diminuto con la misma topologia antes de aplicarlos a checkpoints grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K u otras) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (9M parametros, aproximadamente 18 MB de pesos mas overhead de activaciones y procesador).
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; tambien ejecutable en CPU.
- Cabe en cualquier GPU de consumo (GTX 1050, RTX 2060, RTX 4090, etc.) y en entornos sin GPU.
- Opciones de despliegue: Transformers (carga directa desde el repositorio), con soporte de los ficheros de procesador del modelo original. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este fixture.
- Latencia y throughput: no disponibles; al ser un modelo de 2 capas con pesos aleatorios, las mediciones no serian representativas del modelo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/HunyuanOCR-mic | 9.054.208 | no disponible | Fixture de integracion (test-artifact) | no disponible | Hugging Face |
| tencent/HunyuanOCR | no disponible | no disponible | OCR multimodal real | no disponible | Hugging Face |
| Otros fixtures de transformers-mic | variable (reducidos) | no disponible | Pruebas de integracion por arquitectura | no disponible | Hugging Face (org. huggingface-mic) |

La comparacion relevante es con el modelo base `tencent/HunyuanOCR`, del que este fixture hereda arquitectura, procesador y nombres de tensores, pero no pesos ni capacidad funcional. Frente a otros fixtures del mismo proyecto, comparte el mismo proposito de validacion y se distingue por cubrir la arquitectura `HunYuanVLForConditionalGeneration`.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y las salidas no tienen significado. No debe desplegarse en produccion ni usarse para inferencia real.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; su uso esta restringido a pruebas de integracion.
- La licencia no esta disponible en la informacion proporcionada; el fichero `LICENSE` se copio del modelo original, pero su contenido no se detalla.
- No se han documentado sesgos, riesgos de alucinacion ni limitaciones de idioma porque el modelo no ha sido entrenado.
- El contexto, los idiomas soportados y las capacidades multimodales reales corresponden al modelo `tencent/HunyuanOCR`, no a este fixture, y no se detallan en la informacion disponible.
- Cualquier metrica de rendimiento o calidad obtenida con este fixture no es extrapolable al checkpoint real de Tencent.
- La fecha de creacion indicada (2026-10-29) y la de actualizacion (2026-11-10) figuran en los metadatos del repositorio; conviene verificar su coherencia antes de citarlas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/HunyuanOCR-mic
- Modelo base: https://huggingface.co/tencent/HunyuanOCR
- Como se redujo el fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/HunyuanOCR-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de barrido (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion (`build_fixtures.py`): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
