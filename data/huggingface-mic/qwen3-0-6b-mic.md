# huggingface-mic/Qwen3-0.6B-mic

## Resumen

`huggingface-mic/Qwen3-0.6B-mic` no es un modelo de lenguaje utilizable, sino un *fixture* de test publicado por el equipo de Hugging Face detrás del proyecto `transformers-mic`. Se trata de una version reducida artificialmente del modelo `Qwen/Qwen3-0.6B`: conserva la clase de arquitectura (`Qwen3ForCausalLM`), los nombres de tensores y los ficheros de procesador del checkpoint original, pero solo tiene 2 capas ocultas y pesos aleatorios generados con semilla 17. El resultado son 9.798.016 parametros (9,8 M) en lugar de los aproximadamente 600 M del modelo base.

El propósito del repositorio es servir de contrato ejecutable para validar integraciones de frameworks: comprobar que una implementacion de `Qwen3ForCausalLM` carga los tensores correctos, respeta las expectativas de forma y dtype, y produce salidas finitas en `float32`, `bfloat16` y `float16` tanto en forward como en calculo de perdida y gradientes. Al ser un artefacto diminuto, cualquier CI puede ejecutarlo en segundos sin GPU dedicada. Esta etiquetado explicitamente como `test-artifact` para quedar excluido de las busquedas de modelos candidatos.

Su relevancia es, por tanto, puramente de ingenieria de software: no debe evaluarse por calidad de generacion de texto, sino por su capacidad de detectar regresiones en el soporte de la arquitectura Qwen3 dentro de distintas librerias. Cualquier uso como modelo de inferencia real produciria texto sin sentido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`Qwen3ForCausalLM`) con 2 capas ocultas (reducido desde el checkpoint original) |
| Parametros totales | 9.798.016 (9,8 M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el config se reduce solo en `num_hidden_layers`, por lo que hereda la ventana del modelo base Qwen3-0.6B (32 768 tokens nativos segun la documentacion de Qwen, dato no verificado en este repositorio) |
| Tipos de cuantizacion | no disponible (pesos publicados en `bfloat16`; no se distribuyen versiones GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (los ficheros de tokenizer se copian byte a byte de `Qwen/Qwen3-0.6B`, pero los pesos son aleatorios) |
| Licencia | no disponible como declaracion propia; el fichero `LICENSE` se copia byte a byte de `Qwen/Qwen3-0.6B` |
| Formato de pesos | `safetensors`, guardados en `bfloat16` |

## Arquitectura y entrenamiento

El modelo instancia `Qwen3ForCausalLM`, la clase de transformer decoder-only con atencion causal, RMSNorm y MLP con activacion tipo SwiGLU que define la familia Qwen3. La unica modificacion respecto al checkpoint original es la reduccion del numero de capas ocultas a 2, aplicada mediante la regla generica de `sweep.py` del repositorio `transformers-mic`. El resto de la configuracion se mantiene tras el proceso de *shrinking*, de modo que el fixture cubre todos los checkpoints cuyos ficheros de procesador sean identicos byte a byte y cuya config coincida tras la reduccion (clave de fixture `48ea2cf8e1a0`).

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se aceptaron porque superaron una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato desplazo los logits al menos 0,001 (el caso mas debil, `attention_mask:all_ones`, lo hizo en 0,402). El modelo se valido como finito en forward, perdida y gradientes para `float32`, `bfloat16` y `float16`. Los ficheros de procesador (`LICENSE`, `generation_config.json`, `merges.txt`, `tokenizer.json`, `tokenizer_config.json`, `vocab.json`) se copiaron sin modificacion desde `Qwen/Qwen3-0.6B`, por lo que el tokenizer es el real y el resto del pipeline de datos es identico al del modelo de referencia.

## Capacidades

- Carga y ejecucion forward de la arquitectura Qwen3 completa a nivel de contrato: nombres de tensores, formas y dtypes coinciden con el checkpoint real.
- Verificacion de integraciones de frameworks: sirve para comprobar que una libreria (Transformers y otras) implementa correctamente `Qwen3ForCausalLM`.
- Pruebas de regresion en CI: al ocupar decenas de megabytes, se puede descargar y ejecutar en cada commit.
- Comprobacion de sensibilidad a entradas del contrato (perturbaciones de `input_ids`, `attention_mask` y demas entradas documentadas en `integration.json`).
- Validacion numerica de estabilidad: forward, perdida y gradientes finitos en `float32`, `bfloat16` y `float16`.
- Verificacion de fidelidad del tokenizer, al ser los ficheros de procesador copia exacta del modelo base.
- No soporta generacion de texto con sentido, razonamiento, codigo, matematicas, vision, tool calling ni comportamiento agentico: los pesos son aleatorios.

## Casos de uso

- **Test de contrato en CI de librerias de inferencia**: descargar el fixture y ejecutar un forward con entradas fijas para verificar que la implementacion de `Qwen3ForCausalLM` devuelve logits con la forma y dtype esperados. Adecuado porque el coste computacional es minimo y el resultado es determinista.
- **Validacion de cargadores de `safetensors`**: comprobar que un nuevo cargador mapea correctamente los nombres de tensores del checkpoint real de Qwen3 sin necesidad de descargar los aproximadamente 600 M de parametros del modelo base.
- **Pruebas de compatibilidad de dtype**: ejecutar el mismo forward en `float32`, `bfloat16` y `float16` para detectar desbordamientos o NaN introducidos por una refactorizacion en las capas de atencion o normalizacion.
- **Verificacion de gradientes en frameworks de entrenamiento**: usar la perdida y el backward sobre pesos aleatorios para confirmar que las operaciones diferenciables de la arquitectura Qwen3 estan correctamente registradas en el grafo autograd.
- **Test de integracion del pipeline de tokenizer**: al incluir `tokenizer.json`, `merges.txt` y `vocab.json` copiados byte a byte, permite validar que la carga del tokenizer Qwen3 produce los mismos `input_ids` que el modelo original.
- **Smoke test de servidores de inferencia**: desplegar el fixture en vLLM, TGI o un servidor propio para comprobar que el *wiring* de la API (endpoints, serializacion, batching) funciona antes de pasar al checkpoint real.
- **Reproducibilidad de artefactos**: `build.json` registra fuentes fijadas, resultados de las puertas de validacion y hashes de ficheros, lo que permite reconstruir el fixture con `python example/build_fixtures.py --fixture Qwen3-0.6B-mic` y auditar cambios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Cualquier metrica de calidad (MMLU, HumanEval, GSM8K, perplejidad) carece de sentido sobre este repositorio, ya que los pesos son aleatorios con semilla 17: la perplejidad esperada se situaria en el entorno del logaritmo del tamano del vocabulario, sin correlacion con el rendimiento del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 20 MB para los pesos en `bfloat16` (9,8 M de parametros x 2 bytes), mas unos pocos MB para tokenizer y overhead del runtime. Menos de 100 MB en total en la practica.
- GPU recomendadas: cualquiera; el modelo cabe holgadamente en una GTX 1050, RTX 3060, RTX 4090, A100 o H100. No requiere GPU para funcionar.
- Cabe en GPU de consumo: si, en cualquier GPU con al menos 1 GB de memoria, y tambien en CPU.
- Opciones de despliegue: `transformers` (ruta documentada en `integrations/transformers/usage.md`), servidores de inferencia compatibles con la arquitectura Qwen3 (vLLM, TGI) y, en principio, `llama.cpp` u Ollama si se convierte a GGUF, aunque no se distribuyen pesos en ese formato.
- Latencia y throughput: no disponibles como datos publicados; por tamano, el forward se completa en el orden de milisegundos incluso en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/Qwen3-0.6B-mic` | 9,8 M (2 capas, pesos aleatorios) | no disponible (hereda config del base) | Fixture de test para integraciones de Qwen3 | no declarada; `LICENSE` copiado de Qwen3-0.6B | Hugging Face, 0 descargas |
| `Qwen/Qwen3-0.6B` | ~0,6 B | 32 768 tokens nativos | Modelo de lenguaje real, uso general | Apache 2.0 (segun la familia Qwen3) | Hugging Face, ampliamente usado |
| `Qwen/Qwen3-1.7B` | ~1,7 B | 32 768 tokens nativos | Modelo de lenguaje real, uso general | Apache 2.0 (segun la familia Qwen3) | Hugging Face |
| Fixtures equivalentes de otras familias en `transformers-mic` | variable | no disponible | Test de contrato de otras arquitecturas | no disponible | GitHub / Hugging Face |

La comparacion relevante no es de calidad, sino de funcion: los Qwen3 reales sirven para inferencia; este repositorio sirve para validar que la implementacion de la arquitectura Qwen3 es correcta. Los datos de licencia de la familia Qwen3 provienen del conocimiento general sobre el modelo base y no se verifican en este repositorio.

## Limitaciones y advertencias

- **No es un modelo utilizable**: los pesos son aleatorios (semilla 17). La generacion de texto produce salida sin sentido; no debe desplegarse en ningun caso de uso real.
- **Etiqueta `test-artifact`**: el autor la incluye deliberadamente para excluir el repositorio de busquedas de modelos candidatos. Ignorar esa etiqueta en un pipeline de seleccion automatica introduciria ruido.
- **Configuracion truncada**: solo 2 capas ocultas frente a las del checkpoint original, por lo que el comportamiento numerico no reproduce el del modelo base ni en magnitud de activaciones.
- **Licencia no declarada de forma explicita**: el campo de licencia del repositorio aparece como no disponible; el fichero `LICENSE` se copia byte a byte de `Qwen/Qwen3-0.6B`, lo que en la practica hereda los terminos de ese modelo, pero conviene verificarlo antes de cualquier redistribucion.
- **Sin garantias de soporte**: 0 descargas y 0 likes en el momento de la consulta; es un artefacto interno sin comunidad ni mantenimiento documentado fuera del repositorio `transformers-mic`.
- **Cobertura limitada a un contrato concreto**: el fixture cubre los checkpoints cuyo procesador sea byte-identico y cuya config coincida tras el *shrinking*; cambios en ficheros de tokenizer o en la config invalidarian la cobertura.
- **Riesgo de confusion en evaluaciones**: si se usa como sustituto del modelo base para medir latencia o throughput, los numeros no son extrapolables (2 capas frente a la profundidad real).
- **Sin datos de sesgo, alucinacion o multilingueismo**: no aplica, al no existir comportamiento linguistico aprendido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface-mic/Qwen3-0.6B-mic
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Manifiesto del contrato (`integration.json`): https://huggingface.co/huggingface-mic/Qwen3-0.6B-mic/blob/main/integration.json
- Uso con Transformers (`integrations/transformers/usage.md`): https://huggingface.co/huggingface-mic/Qwen3-0.6B-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers (`integrations/transformers/expectations`): https://huggingface.co/huggingface-mic/Qwen3-0.6B-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture (`build.json`): https://huggingface.co/huggingface-mic/Qwen3-0.6B-mic/blob/main/build.json
- Repositorio `transformers-mic`: https://github.com/huggingface/transformers-mic
- Regla de reduccion de config (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures (`build_fixtures.py`): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
