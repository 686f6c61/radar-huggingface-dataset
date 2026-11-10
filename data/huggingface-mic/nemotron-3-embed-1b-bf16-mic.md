# huggingface-mic/Nemotron-3-Embed-1B-BF16-mic

## Resumen

Nemotron-3-Embed-1B-BF16-mic es un artefacto de prueba (fixture) publicado por el usuario huggingface-mic, no un modelo entrenado ni utilizable. Se trata de una version reducida artificialmente del modelo de embeddings nvidia/Nemotron-3-Embed-1B-BF16, creada para validar contratos de integracion con la libreria Transformers. El repositorio contiene pesos "slim" de 8.462.656 parametros con pesos aleatorios (semilla 17), junto con el manifiesto de contrato, la documentacion de uso y el directorio de expectativas del framework.

La relevancia de esta ficha es acotada: el modelo esta etiquetado explicitamente como `test-artifact` y su propio autor advierte de que no debe usarse como modelo real. Aporta valor como pieza de infraestructura de testing: permite verificar que una integracion de Transformers con Nemotron-3-Embed funciona (carga, forward, sensibilidad a entradas) sin necesidad de descargar el checkpoint completo de 1B parametros. Para desarrolladores que mantienen adaptadores o pipelines de embeddings, es un ejemplo de como empaquetar pesos reducidos, uso ejecutable y expectativas en un unico repositorio.

El modelo base del que deriva, nvidia/Nemotron-3-Embed-1B-BF16, es un modelo de embeddings de NVIDIA orientado a representaciones vectoriales de texto, presumiblemente de aproximadamente 1.000 millones de parametros y con arquitectura Ministral3Model segun la configuracion reducida del fixture. Sin embargo, los detalles del modelo original (contexto, licencia, idiomas, entrenamiento) no estan disponibles en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ministral3Model (segun config del fixture; arquitectura del modelo base no detallada) |
| Parametros totales | 8.462.656 (fixture reducido); modelo base nvidia/Nemotron-3-Embed-1B-BF16 no disponible con exactitud |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el repo copia LICENSE del modelo base, pero su contenido no se detalla) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura Ministral3Model del modelo base, pero con la configuracion reducida a `num_hidden_layers: 2` mediante la regla generica de `sweep.py` del proyecto transformers-mic. Los pesos son aleatorios (semilla 17) y no han sido entrenados; el autor indica que superaron la puerta de sensibilidad a entradas (cada perturbacion de las entradas del contrato movio los logits al menos 0,001; la mas debil fue `attention_mask:all_ones` con 1,24), por lo que no fue necesario entrenamiento alguno. Los nombres de tensores coinciden exactamente con los del checkpoint real, y los ficheros de procesador (tokenizer.json, tokenizer_config.json, config_sentence_transformers.json, modules.json, sentence_bert_config.json, LICENSE, NOTICE, etc.) se copiaron byte a byte desde nvidia/Nemotron-3-Embed-1B-BF16.

No hay informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni tecnicas de alineacion (RLHF/DPO) del modelo base. El fixture se construyo con `build_fixtures.py` del repositorio transformers-mic, y `build.json` registra las fuentes fijadas, los resultados de las puertas de validacion y los hashes de los ficheros. La clave de fixture `3b9dc5f17e4c` cubre todos los checkpoints cuyos ficheros de procesador son identicos byte a byte y cuya config coincide tras el reducido.

## Capacidades

- Generacion de embeddings de texto: el modelo base es un modelo de embeddings; el fixture conserva la interfaz (sentence-transformers, tokenizer) para probar esa funcionalidad.
- Verificacion de contratos de integracion: permite validar carga, forward, perdida y gradientes en float32, bfloat16 y float16.
- Compatibilidad con Transformers: incluye usage.md y el directorio de expectativas del framework para ejecutar pruebas de integracion.
- Sensibilidad a entradas: los pesos aleatorios responden a perturbaciones de las entradas del contrato, lo que permite probar flujos de extremo a extremo.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, agentes ni capacidades multilingues verificables; es un artefacto de prueba.

## Casos de uso

- Pruebas de integracion en CI: usar el fixture para verificar que un adaptador de Transformers carga el modelo, ejecuta el forward y produce gradientes finitos sin descargar el checkpoint de 1B parametros, reduciendo tiempo y ancho de banda en pipelines.
- Desarrollo de librerias de embeddings: validar cambios en sentence-transformers o en el pipeline de tokenizacion contra un modelo de la misma arquitectura y mismos ficheros de procesador que el original.
- Pruebas de cuantizacion y dtypes: comprobar que el codigo maneja correctamente bfloat16, float16 y float32 (forward, loss y gradientes) usando un modelo pequeno y rapido.
- Validacion de contratos de API: el manifiesto integration.json y el directorio de expectativas permiten comprobar que una implementacion cumple los requisitos de entrada/salida del modelo base.
- Reproducibilidad de fixtures: el repositorio documenta como se redujo el modelo (enlace shrink) y como reconstruirlo con `build_fixtures.py`, util para equipos que mantienen artefactos de prueba versionados.
- Educacion y experimentacion: estudiar la estructura de un repositorio de modelo con pesos safetensors, tokenizer y configuracion sin coste computacional relevante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 8,46 millones de parametros en bfloat16 el peso ronda los 17 MB, mas overhead de activaciones y tokenizer.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1650, RTX 3060, RTX 4090) o incluso CPU; no requiere A100 ni H100.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 1 GB de VRAM, y tambien en CPU.
- Opciones de despliegue: Transformers (con sentence-transformers), y potencialmente llama.cpp/Ollama si se convierte a GGUF, aunque no se documenta soporte oficial.
- Latencia y throughput: no disponibles; por el tamano, la latencia sera de milisegundos en GPU y de decenas de milisegundos en CPU, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| Nemotron-3-Embed-1B-BF16-mic | 8,46 M (fixture) | no disponible | no disponible | Artefacto de prueba |
| nvidia/Nemotron-3-Embed-1B-BF16 | ~1 B (segun nombre) | no disponible | no disponible | Embeddings de texto |
| Otros fixtures de transformers-mic | variable (reducidos) | no disponible | no disponible | Pruebas de integracion |

No se dispone de datos de rendimiento ni de modelos comparables adicionales en la informacion proporcionada; la comparativa se limita a la relacion fixture/modelo base.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y el autor lo etiqueta como `test-artifact`; no debe usarse para inferencia real ni en produccion.
- Sesgos: no aplica en sentido estricto por los pesos aleatorios, pero el modelo base puede tener sesgos no documentados aqui.
- Alucinacion: no aplica a un modelo de embeddings; el fixture no genera texto.
- Contexto e idiomas: no disponibles; no se puede confirmar el soporte multilingue ni la ventana de contexto del modelo base.
- Licencia: no disponible; el repositorio copia LICENSE del modelo base, pero sus terminos no se detallan, por lo que no se puede confirmar el uso comercial.
- Caveat de produccion: no usar este repositorio como sustituto del checkpoint real; para embeddings reales debe emplearse nvidia/Nemotron-3-Embed-1B-BF16.
- El fixture solo cubre checkpoints con ficheros de procesador identicos byte a byte y config coincidente tras el reducido; cambios en el modelo base pueden invalidarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/Nemotron-3-Embed-1B-BF16-mic
- Modelo base: https://huggingface.co/nvidia/Nemotron-3-Embed-1B-BF16
- Documentacion de como se redujo el fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Nemotron-3-Embed-1B-BF16-mic.html
- Repositorio transformers-mic (sweep.py y build_fixtures.py): https://github.com/huggingface/transformers-mic
- Uso con Transformers (en el repo): integrations/transformers/usage.md
- Expectativas del framework (en el repo): integrations/transformers/expectations
- Manifiesto de contrato (en el repo): integration.json
- Procedencia del fixture (en el repo): build.json
