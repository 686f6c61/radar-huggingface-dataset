# huggingface-mic/vaultgemma-1b-mic

## Resumen

`vaultgemma-1b-mic` es un artefacto de prueba (fixture) publicado por el usuario `huggingface-mic` a partir de `google/vaultgemma-1b`. No es un modelo entrenado ni utilizable: se trata de un checkpoint "slim" con la misma arquitectura que el modelo original (`VaultGemmaForCausalLM`) pero con solo 2 capas y pesos aleatorios (semilla 17), que conserva los nombres de tensores y los ficheros de procesador del modelo base. Su proposito es servir como fixture reproducible para pruebas de integracion y validacion de frameworks.

El artefacto incluye un manifiesto de contrato (`integration.json`), guias de uso para Transformers (`integrations/transformers/usage.md`) y un directorio de expectativas de framework (`integrations/transformers/expectations`). La model card indica explicitamente que es un `test-artifact` etiquetado para excluirlo de la busqueda de modelos candidatos y que no debe usarse como modelo funcional.

El modelo base declarado es `google/vaultgemma-1b`, del que hereda configuracion reducida y ficheros de tokenizer copiados byte a byte. Cualquier evaluacion de capacidades, calidad o rendimiento debe hacerse sobre `google/vaultgemma-1b`, no sobre esta fixture.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (`VaultGemmaForCausalLM`) |
| Parametros totales | 16.466.240 (fixture slim, 2 capas) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

La fixture replica la clase `VaultGemmaForCausalLM` del modelo base con una configuracion reducida generada mediante la regla generica de `sweep.py` del repositorio `transformers-mic`, que en este caso fija `num_hidden_layers` a 2. Los ficheros de procesador (`generation_config.json`, `special_tokens_map.json`, `tokenizer.model`, `tokenizer_config.json`) se copian byte a byte desde `google/vaultgemma-1b`, de modo que el pipeline de tokenizacion y generacion es identico al del modelo original.

No hay entrenamiento: los pesos son aleatorios con semilla 17 y se aceptaron porque superaron una puerta de sensibilidad a la entrada, en la que cada perturbacion de las entradas del contrato movia los logits al menos 0,001 (el caso mas debil, `attention_mask:all_ones`, registro 0,387). La fixture conserva exactamente los mismos nombres de tensores que el checkpoint real y es finita en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. Se construyo con `build_fixtures.py` y `build.json` registra las fuentes fijadas, los resultados de la puerta y los hashes de los ficheros.

## Capacidades

- No dispone de capacidades de generacion de texto coherente: los pesos son aleatorios y el modelo no ha sido entrenado.
- Sirve como fixture para validar la carga de pesos, el mapeo de nombres de tensores y la compatibilidad de configuracion de `VaultGemmaForCausalLM`.
- Permite verificar la integracion con Transformers usando el contrato publicado en `integration.json` y el directorio `integrations/transformers/expectations`.
- Reproduce el comportamiento del tokenizer y de `generation_config` del modelo base al copiarse estos ficheros sin modificacion.
- Comprueba la estabilidad numerica del forward, loss y gradientes en float32, bfloat16 y float16.
- No soporta tool calling, agentes, vision, audio ni modo thinking de forma funcional; cualquier capacidad de ese tipo pertenece al modelo base `google/vaultgemma-1b`.

## Casos de uso

- Pruebas de integracion en CI: el artefacto permite ejecutar tests de carga de checkpoint y de forward pass con un modelo de 16,5M parametros, reduciendo el coste de computo frente a usar el checkpoint completo.
- Validacion de frameworks: los directorios `integrations/transformers/usage.md` y `expectations` permiten comparar el comportamiento esperado de Transformers frente al contrato declarado en `integration.json`.
- Desarrollo de utilidades de conversion: al conservar los nombres de tensores del checkpoint real, sirve para probar scripts de conversion a otros formatos (por ejemplo GGUF) sin descargar los pesos completos.
- Verificacion de pipelines de tokenizacion: al copiar byte a byte los ficheros de procesador, se puede comprobar que el pipeline de tokenizacion y generacion funciona igual que con `google/vaultgemma-1b`.
- Reproducibilidad de artefactos: `build.json` documenta fuentes, hashes y resultados de la puerta, lo que permite reconstruir la fixture con `python example/build_fixtures.py --fixture vaultgemma-1b-mic`.
- Docencia y demos de infraestructura: util para ilustrar como se estructura un repositorio de modelo con contrato, expectativas y pesos slim sin necesidad de recursos de GPU significativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no reporta metricas de calidad, y al tratarse de pesos aleatorios cualquier medida de rendimiento sobre esta fixture carece de significado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 dado el tamano de 16,5M parametros; no se han publicado medidas oficiales.
- GPU recomendadas: cualquier GPU consumer reciente es suficiente; el artefacto cabe en CPU y en GPUs de gama baja.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: Transformers (segun `integrations/transformers/usage.md`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/vaultgemma-1b-mic` | 16,5M (fixture) | no disponible | Fixture de test | no disponible | Hugging Face |
| `google/vaultgemma-1b` | no disponible | no disponible | Modelo base | no disponible | Hugging Face |
| Otras fixtures de `transformers-mic` | variable (slim) | no disponible | Fixtures de test | no disponible | Hugging Face |

No se dispone de datos de rendimiento ni de especificaciones completas para establecer una comparativa cuantitativa con modelos de la misma categoria.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y la salida no tiene significado.
- El artefacto esta etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; usarlo en produccion seria un error de seleccion.
- La licencia no esta declarada en la informacion disponible, por lo que no puede confirmarse el uso comercial.
- La configuracion reducida a 2 capas implica que el comportamiento no es representativo del modelo base mas alla de la estructura de tensores.
- No se documentan idiomas soportados, sesgos ni riesgos de alucinacion especificos; estas advertencias deben evaluarse sobre `google/vaultgemma-1b`.
- El tamano del repo declarado es 0.0 GB, lo que sugiere que los pesos pueden no estar presentes o son de muy baja entidad; conviene verificar la integridad del repositorio antes de usarlo.

## Enlaces

- [Hugging Face: huggingface-mic/vaultgemma-1b-mic](https://huggingface.co/huggingface-mic/vaultgemma-1b-mic)
- [Modelo base: google/vaultgemma-1b](https://huggingface.co/google/vaultgemma-1b)
- [Contrato de integracion (integration.json)](https://huggingface.co/huggingface-mic/vaultgemma-1b-mic/blob/main/integration.json)
- [Uso con Transformers (usage.md)](https://huggingface.co/huggingface-mic/vaultgemma-1b-mic/blob/main/integrations/transformers/usage.md)
- [Expectativas de Transformers](https://huggingface.co/huggingface-mic/vaultgemma-1b-mic/tree/main/integrations/transformers/expectations)
- [Procedencia de la fixture (build.json)](https://huggingface.co/huggingface-mic/vaultgemma-1b-mic/blob/main/build.json)
- [Como se redujo la fixture](https://huggingface-mic-mic-coverage.static.hf.space/shrink/vaultgemma-1b-mic.html)
- [Repositorio transformers-mic](https://github.com/huggingface/transformers-mic)
- [Script sweep.py](https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py)
- [Script build_fixtures.py](https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py)
