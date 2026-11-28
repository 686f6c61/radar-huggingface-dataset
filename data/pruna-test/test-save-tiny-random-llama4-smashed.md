# pruna-test/test-save-tiny-random-llama4-smashed

## Resumen

`pruna-test/test-save-tiny-random-llama4-smashed` es un artefacto de prueba publicado por el equipo de Pruna AI, no un modelo destinado a uso real. Se trata de una version "tiny" y aleatoria de la arquitectura Llama 4 (identificador de arquitectura `llama4_text`) que ha pasado por el pipeline de optimizacion de la libreria Pruna, que la organizacion emplea para validar el guardado y la recarga de modelos comprimidos. El nombre del repositorio ("test-save-...") y el prefijo del autor ("pruna-test") confirman su naturaleza de fixture de integracion continua.

El modelo tiene 6.519.792 parametros totales segun los pesos en safetensors, un tamano irrisorio que lo situa muy por debajo de cualquier LLM utilizable. Los pesos son aleatorios: no ha habido entrenamiento supervisado, ajuste fino ni alineacion, por lo que su salida es ruido estadistico sin valor semantico. Su interes es exclusivamente tecnico: sirve para comprobar que el formato de guardado de Pruna preserva la configuracion de compresion (`smash_config.json`) y que la carga mediante `PrunaModel.from_pretrained` reconstruye correctamente el grafo.

Es relevante ahora unicamente como referencia para desarrolladores que integran Pruna en sus pipelines y necesitan un caso de prueba ligero que se ejecute en CPU. No debe confundirse con los modelos Llama 4 reales de Meta: comparte el identificador de arquitectura, pero no los pesos, el entrenamiento ni las capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 4, variante `llama4_text`) |
| Parametros totales | 6.519.792 |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el `smash_config.json` muestra todas las tecnicas de compresion desactivadas: `awq`, `gptq`, `hqq`, `quanto`, `llm_int8` y `torchao` en `false`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (carga via `transformers`; compatible con `PrunaModel`) |

## Arquitectura y entrenamiento

La arquitectura corresponde a la implementacion `llama4_text` de la libreria `transformers`, es decir, un transformer decoder-only con atencion causal. Al tratarse de la variante "tiny-random" del repositorio de pruebas internas de Hugging Face (`hf-internal-testing/tiny-random-llama4`), el modelo conserva la topologia de Llama 4 pero con dimensiones reducidas al minimo para que los tests se ejecuten en pocos segundos y sin GPU.

No hay entrenamiento. Los pesos se inicializan aleatoriamente y no se ha aplicado preentrenamiento, instruccion, RLHF ni DPO. El `smash_config.json` confirma que el pipeline de Pruna se ejecuto con todas las optimizaciones desactivadas (`awq`, `gptq`, `half`, `torch_compile`, `torch_structured`, `kvpress`, `sage_attn`, etc. en `false`), con `batch_size: 1`, `device: "cpu"` y `load_fns: ["transformers"]`. Es decir, el artefacto valida el ciclo completo de guardado y recarga sin aplicar ninguna transformacion efectiva sobre los pesos.

## Capacidades

- Generacion de texto: tecnicamente produce tokens mediante `generate()`, pero la salida es incoherente por los pesos aleatorios.
- Razonamiento, codigo y matematicas: no disponible; el modelo no ha sido entrenado para ninguna tarea.
- Tool calling / function calling: no soportado de forma funcional.
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, vision, audio): no disponible.
- Uso como fixture de pruebas: valida la serializacion de Pruna, la carga con `PrunaModel.from_pretrained` y la compatibilidad con `transformers`.

## Casos de uso

- Test de integracion de Pruna en CI: verificar que `PrunaModel.from_pretrained("pruna-test/test-save-tiny-random-llama4-smashed")` carga sin errores y que el `smash_config.json` se preserva tras el guardado.
- Validacion de pipelines de compresion: ejecutar el flujo de Pruna con todas las optimizaciones desactivadas para comprobar que el guardado no altera los pesos ni el grafo.
- Pruebas de humo en entornos sin GPU: al ocupar practicamente 0 GB y ejecutarse en CPU (`device: "cpu"` en la configuracion), sirve para validar instalaciones de `transformers` y `pruna` en contenedores ligeros.
- Desarrollo de herramientas de inspeccion de safetensors: un checkpoint de 6,5 M de parametros es comodo para depurar utilidades de lectura de pesos, sharding o conversion de formato.
- Benchmarking de overhead de carga: medir el coste de `from_pretrained` y de la reconstruccion del modelo en Pruna sin que el tamano de los pesos domine la medicion.
- Docencia y ejemplos de API: ilustrar el uso basico de `PrunaModel` en tutoriales sin necesidad de descargar checkpoints de decenas de GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no ha sido entrenado y sus pesos son aleatorios, por lo que cualquier evaluacion en MMLU, HumanEval, GSM8K u otros conjuntos carece de significado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 0,1 GB en fp32 (6,5 M de parametros equivalen a unos 26 MB de pesos); en la practica cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: ninguna en particular; el artefacto se ejecuta en CPU segun su configuracion (`device: "cpu"`).
- GPU consumer compatibles: cualquiera (GTX 1050, RTX 3060, RTX 4090, etc.), aunque no es necesario.
- Opciones de despliegue: `transformers` (carga estandar) y `pruna` (`PrunaModel.from_pretrained`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser un modelo de prueba, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Proposito |
|---|---|---|---|---|---|
| `pruna-test/test-save-tiny-random-llama4-smashed` | 6,5 M | no disponible | ninguno (pesos aleatorios) | no disponible | Fixture de pruebas de Pruna |
| `hf-internal-testing/tiny-random-llama4` | del orden de millones (variante tiny) | no disponible | ninguno (pesos aleatorios) | no disponible | Fixture de pruebas de `transformers` |
| Llama 4 (modelos oficiales de Meta) | no disponible en esta ficha | no disponible | preentrenamiento + alineacion | licencia Llama | Uso general en produccion |

La comparativa con modelos de produccion no es significativa: este artefacto no compite en ninguna categoria funcional.

## Limitaciones y advertencias

- Pesos aleatorios: la salida es incoherente y no debe interpretarse como texto generado por un LLM.
- Sin entrenamiento ni alineacion: no hay mitigacion de sesgos, toxicidad ni alucinaciones porque no existe comportamiento aprendido.
- Licencia no disponible: no se puede asumir permiso de uso comercial; al ser un artefacto de prueba, se recomienda no redistribuirlo como modelo funcional.
- Idiomas no declarados: no hay garantia de soporte linguistico alguno.
- Contexto no documentado: se desconoce la ventana maxima efectiva de la variante tiny.
- Nombre enganoso: comparte identificador de arquitectura con Llama 4, pero no es un modelo Llama 4 real ni debe presentarse como tal.
- Uso previsto restringido: solo para pruebas de integracion, desarrollo de tooling y docencia; no para produccion.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/pruna-test/test-save-tiny-random-llama4-smashed)
- [Repositorio de Pruna en GitHub](https://github.com/PrunaAI/pruna)
- [Documentacion de Pruna](https://docs.pruna.ai/en/stable/)
- [Modelo base de referencia: hf-internal-testing/tiny-random-llama4](https://huggingface.co/hf-internal-testing/tiny-random-llama4)
- [Twitter de Pruna AI](https://twitter.com/PrunaAI)
- [GitHub de Pruna AI](https://github.com/PrunaAI)
- [LinkedIn de Pruna AI](https://www.linkedin.com/company/93832878/)
- [Discord de Pruna AI](https://discord.gg/JFQmtFKCjd)
- [Reddit de Pruna AI](https://www.reddit.com/r/PrunaAI/)
