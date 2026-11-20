# huggingface-mic/Qwen3.5-0.8B-mic

## Resumen

`huggingface-mic/Qwen3.5-0.8B-mic` no es un modelo de lenguaje entrenado, sino un *fixture* de pruebas publicado por el equipo de `huggingface-mic`. Se trata de una version reducida artificialmente del checkpoint `Qwen/Qwen3.5-0.8B`, con solo 17.370.368 parametros reales (frente a los aproximadamente 800 millones del modelo original al que hace referencia su nombre). La model card lo describe explicitamente como "a test artifact, not a usable model" y lo etiqueta con `test-artifact` para excluirlo de las busquedas de modelos candidatos.

Su proposito es servir como banco de pruebas reproducible para frameworks de inferencia y entrenamiento: conserva la misma arquitectura (`Qwen3_5ForConditionalGeneration`), los mismos nombres de tensores y los mismos ficheros de procesador (tokenizer, chat template, preprocessor de vision y video) que el checkpoint real, pero con una configuracion encogida (2 capas de texto en lugar de la profundidad completa) y pesos aleatorios generados con semilla 17. De este modo, un desarrollador puede validar que su integracion con Transformers carga, ejecuta forward, calcula perdida y propaga gradientes correctamente sin descargar ni ejecutar el modelo completo.

Es relevante ahora porque el ecosistema Qwen 3.5 es multimodal (generacion condicional con soporte de imagen y video), y disponer de fixtures ligeros acelera el desarrollo de integraciones (vLLM, TGI, servidores propios) y la cobertura de tests en CI. No obstante, cualquier evaluacion de calidad, capacidades o rendimiento sobre este repositorio carece de sentido: los pesos son aleatorios y no han sido entrenados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal `Qwen3_5ForConditionalGeneration` (variante encogida, 2 capas de texto) |
| Parametros totales | 17.370.368 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (config encogida; no representativa del modelo base) |
| Tipos de cuantizacion | no disponible (pesos guardados en float32; se declara finitud en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible (tokenizer copiado del modelo base Qwen3.5-0.8B) |
| Licencia | no disponible en la informacion proporcionada (el fichero `LICENSE` se copia byte a byte del modelo base) |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El fixture reproduce la clase `Qwen3_5ForConditionalGeneration` del modelo base, es decir, un transformer multimodal de generacion condicional con torre de texto y procesadores de imagen y video. La unica diferencia estructural es la profundidad: se ha reducido `text num_hidden_layers` a 2 mediante la regla generica de `sweep.py` del repositorio `transformers-mic`. Los ficheros de procesador (`tokenizer.json`, `tokenizer_config.json`, `chat_template.jinja`, `merges.txt`, `vocab.json`, `preprocessor_config.json`, `video_preprocessor_config.json`, `LICENSE`) se copian byte a byte desde `Qwen/Qwen3.5-0.8B`, de modo que el pipeline de tokenizacion y preprocesado es identico al real.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y se validaron con una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato mueve los logits al menos 0,001 (la mas debil, `pixel_values:halve`, con 0,142; en otra variante del fixture, `input_ids:roll_batch`, con 1,36). Los tensores conservan los mismos nombres que el checkpoint real y el conjunto es finito en float32, bfloat16 y float16 tanto en forward como en perdida y gradientes. El repositorio incluye ademas un manifiesto de contrato (`integration.json`), expectativas de framework (`integrations/transformers/expectations`), procedencia de la build (`build.json`) y un documento sobre como se encogio el fixture.

## Capacidades

- Carga y ejecucion en Transformers como `Qwen3_5ForConditionalGeneration` con la misma interfaz que el modelo base.
- Forward pass, calculo de perdida y retropropagacion de gradientes verificados como finitos en float32, bfloat16 y float16.
- Procesamiento de entradas de texto, imagen y video mediante los procesadores copiados del modelo base (tokenizer, preprocessor de imagen, preprocessor de video).
- Verificacion de contratos de integracion: el manifiesto `integration.json` define entradas y expectativas que un framework puede validar.
- No genera texto coherente ni razona: los pesos son aleatorios y no han sido entrenados.
- No dispone de tool calling, agentes, modo thinking ni capacidades multilingues reales; cualquier comportamiento de ese tipo es inexistente por construccion.

## Casos de uso

- Tests de integracion en CI para Transformers: cargar el fixture y comprobar que `Qwen3_5ForConditionalGeneration` instancia, ejecuta forward y devuelve logits con la forma esperada, sin coste de descarga del modelo completo.
- Validacion de pipelines multimodales: comprobar que el preprocesado de imagen y video (`pixel_values`, entradas de video) produce tensores compatibles con la torre del modelo.
- Desarrollo de servidores de inferencia (vLLM, TGI, servidores propios): usar el fixture para verificar el parseo de configuracion, la carga de safetensors y el enrutado de peticiones antes de pasar al checkpoint real.
- Pruebas de cuantizacion y dtypes: validar que una ruta de conversion a bfloat16 o float16 mantiene la finitud de logits, perdida y gradientes.
- Verificacion de chat templates: el `chat_template.jinja` copiado del modelo base permite testear el formateo de conversaciones multi-turno sin depender del modelo real.
- Regresion de tokenizer: al ser los ficheros de tokenizacion identicos byte a byte al modelo base, sirve para detectar cambios inesperados en la tokenizacion entre versiones de librerias.
- Benchmarking de infraestructura: medir tiempos de carga, memoria y overhead de framework con un artefacto de 0,1 GB antes de escalar al checkpoint completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un fixture con pesos aleatorios no entrenados, cualquier metrica de calidad (MMLU, HumanEval, GSM8K) seria meaningless y no se reporta.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (17,4 M de parametros, repositorio de 0,1 GB); en la practica cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquiera; no requiere A100, H100 ni RTX 4090. Una GTX 1650 o una iGPU son suficientes para ejecutar el fixture.
- Cabe en GPU consumer: si, en todas las gamas actuales, y tambien en CPU.
- Opciones de despliegue: Transformers (ruta principal soportada, con `integrations/transformers/usage.md`); otros frameworks (vLLM, llama.cpp, Ollama, TGI) no estan declarados como soportados en la informacion disponible.
- Latencia y throughput: no disponibles; al ser un fixture de 2 capas, la latencia sera minima, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/Qwen3.5-0.8B-mic | 17,4 M | no disponible | Fixture de tests | no disponible | Hugging Face |
| Qwen/Qwen3.5-0.8B | ~0,8 B (segun nombre; no confirmado en la informacion) | no disponible | Modelo multimodal real | no disponible | Hugging Face |
| Otros fixtures de transformers-mic | no disponible | no disponible | Fixtures de tests | no disponible | Hugging Face (organizacion huggingface-mic) |

La comparacion relevante es contra el modelo base `Qwen/Qwen3.5-0.8B`: mismo contrato de entrada, mismos nombres de tensores y mismos procesadores, pero con arquitectura encogida y pesos aleatorios. Para evaluacion de capacidades reales debe consultarse el repositorio del modelo base, no este.

## Limitaciones y advertencias

- No es un modelo usable: los pesos son aleatorios y no han sido entrenados; las salidas carecen de significado.
- Sesgos conocidos: no aplica en sentido estadistico, pero al heredar el tokenizer y el chat template del modelo base, cualquier sesgo de tokenizacion del original se reproduce.
- Riesgo de alucinacion: total, en el sentido de que toda salida es ruido aleatorio; no debe desplegarse en produccion bajo ninguna circunstancia.
- Limitaciones de contexto e idioma: la configuracion esta encogida a 2 capas de texto y no refleja la ventana de contexto ni el soporte multilingue del modelo base.
- Restricciones de licencia: la licencia no se indica en la informacion disponible; el fichero `LICENSE` se copia del modelo base, por lo que conviene revisar la licencia de `Qwen/Qwen3.5-0.8B` antes de cualquier uso derivado.
- Caveat de produccion: el autor lo etiqueta explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos; usarlo como sustituto del modelo real daria lugar a resultados invalidos.
- Las dos variantes de fixture documentadas en la model card (`bcf77184b0ac` y `c6fb9a8c4c72`) presentan recuentos de parametros ligeramente distintos (16,8 M frente a 17,4 M); el dato de safetensors del repositorio es 17.370.368.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/Qwen3.5-0.8B-mic
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Documento sobre el encogimiento del fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Qwen3.5-0.8B-mic.html
- Repositorio transformers-mic (script `sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Repositorio transformers-mic (script `build_fixtures.py`): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
