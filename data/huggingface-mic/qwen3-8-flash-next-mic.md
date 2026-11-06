# huggingface-mic/Qwen3.8-Flash-Next-mic

## Resumen

Qwen3.8-Flash-Next-mic es un artefacto de prueba (fixture) publicado por la organizacion huggingface-mic, derivado del modelo Qwen/Qwen3.8-Flash-Next. No es un modelo funcional ni entrenado: se trata de una version "slim" (reducida) con 353.864.419 parametros generados con pesos aleatorios (semilla 17) y una configuracion de arquitectura recortada, pensada exclusivamente para validar contratos de integracion con frameworks (Transformers y otros) en pipelines de CI. El autor lo etiqueta explicitamente como `test-artifact` para excluirlo de las busquedas de modelos candidatos.

La arquitectura declarada es `Qwen4ExpForConditionalGeneration`, un modelo multimodal de generacion condicional (texto e imagen/video) que replica la estructura del checkpoint original pero con solo 4 capas ocultas en la torre de texto. Los ficheros de procesador (tokenizer, chat template, preprocessor config, video preprocessor config) se copian byte a byte del modelo base, de modo que las pruebas de integracion ejercitan exactamente el mismo contrato de entrada/salida que el modelo real.

Su relevancia es de ingenieria, no de modelado: permite a los mantenedores de frameworks verificar que la carga, el forward, la perdida y los gradientes funcionan en float32, bfloat16 y float16 sin descargar el checkpoint completo (el repo pesa 5,7 GB frente a los cientos de GB del original). Cualquier uso como modelo de inferencia o generacion es invalido por diseno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen4ExpForConditionalGeneration (transformer multimodal de generacion condicional, recortado a 4 capas ocultas de texto) |
| Parametros totales | 353.864.419 |
| Parametros activos | no disponible (no se declara configuracion MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; pesos guardados en float32 (compatibles con bfloat16 y float16) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible (el fichero LICENSE se copia del modelo base, pero no se especifica su contenido) |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.8-Flash-Next |
| Tipo de artefacto | test-artifact (fixture de integracion, pesos aleatorios) |
| Tamano del repositorio | 5,7 GB |

## Arquitectura y entrenamiento

El modelo replica la clase `Qwen4ExpForConditionalGeneration` del checkpoint Qwen/Qwen3.8-Flash-Next, pero con la configuracion reducida mediante la regla generica de `sweep.py` del repositorio transformers-mic: la torre de texto queda en 4 capas ocultas (`text num_hidden_layers 4`). Conserva los mismos nombres de tensores que el checkpoint real, de modo que cualquier codigo que cargue el modelo original encuentra los parametros esperados, solo que con dimensiones menores. Los ficheros de procesamiento (tokenizer.json, tokenizer_config.json, chat_template.jinja, generation_config.json, preprocessor_config.json, video_preprocessor_config.json, merges.txt, vocab.json y LICENSE) se copian byte a byte desde el modelo base.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y solo se validaron mediante una "input-sensitivity gate": cada perturbacion de las entradas del contrato debe mover los logits al menos 0,001 (la mas debil, `pixel_values:roll_batch`, alcanza 0,0013). Los tensores son finitos en float32, bfloat16 y float16 tanto en forward como en perdida y gradientes. El fixture se identifica con la clave `eacffd86f702` y cubre todos los checkpoints cuyos ficheros de procesador son identicos byte a byte y cuya config coincide tras el recorte. El build queda registrado en `build.json` con fuentes fijadas, resultados de la gate y hashes de ficheros.

## Capacidades

- Ninguna capacidad de generacion real: los pesos son aleatorios, por lo que la salida de texto, imagen o video es ruido sin valor semantico.
- Ejercita el contrato de generacion condicional multimodal (entradas de texto e imagen/video, salida de logits) definido por Qwen4ExpForConditionalGeneration.
- Sirve como fixture de pruebas de carga en Transformers y de otros frameworks que consuman el mismo contrato.
- Valida el pipeline de tokenizacion y preprocesado con los ficheros reales del modelo base (chat template incluido).
- Verifica estabilidad numerica en float32, bfloat16 y float16 (forward, loss y gradientes finitos).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues reales; solo reproduce las interfaces, no el comportamiento.

## Casos de uso

- Pruebas de integracion en CI de Transformers: cargar el fixture, ejecutar un forward y comprobar que los nombres de tensores y las formas coinciden con lo esperado para Qwen3.8-Flash-Next, sin descargar el checkpoint completo.
- Validacion de contratos de framework: usar `integration.json` y `integrations/transformers/expectations` para verificar que una nueva version del framework respeta las expectativas declaradas de entrada y salida.
- Pruebas de estabilidad numerica: ejecutar forward, perdida y retropropagacion en float32, bfloat16 y float16 para detectar regresiones de precision en kernels o capas nuevas.
- Desarrollo de utilidades de preprocesado: al copiar byte a byte tokenizer, chat template y preprocessor config, permite probar herramientas de tokenizacion y procesado de imagen/video contra el contrato real sin pesos reales.
- Reproduccion de builds: `build_fixtures.py` y `build.json` permiten regenerar el fixture y auditar hashes, util para pipelines de publicacion de artefactos de prueba.
- Validacion de pipelines de carga distribuida o sharding: comprobar que un loader reparte correctamente los tensores de un modelo multimodal de ~354M parametros antes de escalar al checkpoint completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,4 GB en float32 (353,9M parametros x 4 bytes), unos 0,7 GB en bfloat16/float16. El repositorio ocupa 5,7 GB por incluir ficheros auxiliares y posibles copias de pesos.
- GPU recomendadas: cualquier GPU consumer moderna sirve; una RTX 3060 de 12 GB o superior es mas que suficiente. Tambien cabe en CPU.
- Cabe en GPU consumer: si, en practicamente todas las GPU con 2 GB o mas de VRAM.
- Opciones de despliegue: Transformers (carga directa en float32 por defecto), y en principio cualquier runtime que soporte safetensors y la arquitectura Qwen4Exp; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. No tiene sentido medirlos con pesos aleatorios y una configuracion de 4 capas.

## Comparativa con modelos similares

No disponible. No existen modelos comparables en la misma categoria porque este artefacto no es un modelo funcional, sino un fixture de integracion. Su unica referencia directa es el checkpoint del que deriva:

| Modelo | Parametros | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-Flash-Next-mic | 353,9M (4 capas, pesos aleatorios) | Fixture de integracion y CI | no disponible | Hugging Face (267 descargas) |
| Qwen/Qwen3.8-Flash-Next | no disponible en la informacion proporcionada | Modelo multimodal real | no disponible | Hugging Face (modelo base) |

## Limitaciones y advertencias

- No es un modelo usable: los pesos son aleatorios y la salida no tiene valor semantico. No debe desplegarse en produccion ni usarse para generar contenido.
- La configuracion esta recortada a 4 capas ocultas de texto, por lo que el comportamiento numerico no representa al modelo base ni en escala ni en dinamica.
- La licencia no esta declarada en la informacion disponible; el fichero LICENSE se copia del modelo base, pero su contenido no se especifica. Verificar antes de cualquier redistribucion.
- El autor lo etiqueta como `test-artifact` precisamente para excluirlo de busquedas de modelos candidatos; usarlo como sustituto del modelo real es un error de uso.
- No se declaran idiomas soportados ni longitud de contexto; cualquier expectativa al respecto debe tomarse del modelo base, no de este fixture.
- Riesgo de confusion en pipelines automatizados que filtren por tamano o por nombre: el sufijo `-mic` y la etiqueta `test-artifact` son la unica senal de que no es un modelo real.
- No hay garantia de que los tensores aleatorios reproduzcan casos limite del modelo real (activaciones, saturaciones, comportamientos de atencion) mas alla de la gate de sensibilidad a entradas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/Qwen3.8-Flash-Next-mic
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Manifest de contrato: https://huggingface.co/huggingface-mic/Qwen3.8-Flash-Next-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/Qwen3.8-Flash-Next-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/Qwen3.8-Flash-Next-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/Qwen3.8-Flash-Next-mic/blob/main/build.json
- Como se genero el fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Qwen3.8-Flash-Next-mic.html
- Script de recorte: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
