# huggingface-mic/MiniMax-M3-MXFP8-mic

## Resumen

MiniMax-M3-MXFP8-mic es un artefacto de prueba publicado por huggingface-mic, un repositorio de fixtures concebido para validar la integracion del modelo real MiniMaxAI/MiniMax-M3-MXFP8 en el ecosistema de Transformers. No es un modelo usable: se trata de un checkpoint reducido de 25,9 millones de parametros que replica la arquitectura, los nombres de tensores y los ficheros de procesador del modelo original, pero con pesos aleatorios generados con semilla 17. Su proposito es servir como banco de pruebas reproducible para frameworks, no para inferencia real.

El artefacto conserva la arquitectura `MiniMaxM3SparseForConditionalGeneration` mediante un proceso de reduccion generico (dos capas en la torre de vision y dos en la torre de texto) descrito en el repositorio transformers-mic. Los ficheros de tokenizador, procesador de imagen, procesador de video y plantilla de chat se copian byte a byte del checkpoint original, de modo que cualquier discrepancia en la integracion del modelo real pueda detectarse con un fixture ligero de apenas 0,2 GB.

Es relevante ahora porque el modelo base MiniMax-M3-MXFP8 pertenece a la familia MiniMax-M3, un modelo multimodal con cuantizacion MXFP8, y su integracion en Transformers requiere validacion continua. Este fixture permite a los mantenedores de frameworks comprobar contratos de entrada, sensibilidad de logits y compatibilidad de API sin descargar ni ejecutar el checkpoint completo. Cualquier uso como modelo de produccion seria un error de interpretacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MiniMaxM3SparseForConditionalGeneration (transformer multimodal con torre de vision y torre de texto, variante reducida) |
| Parametros totales | 25.940.836 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture emplea la misma clase de arquitectura que el modelo base, `MiniMaxM3SparseForConditionalGeneration`, que combina una torre de vision con una torre de texto bajo un esquema de generacion condicional. La reduccion se aplica mediante la regla generica de `sweep.py`: se recortan las capas ocultas de vision a 2 y las de texto a 2, manteniendo la nomenclatura exacta de tensores del checkpoint original. Los ficheros de procesador (tokenizador, image_processor, video_processor, chat_template) se copian literalmente de MiniMaxAI/MiniMax-M3-MXFP8, de forma que el contrato de entrada es identico al del modelo real.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron mediante una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato desplaza los logits al menos 0,001 (la mas debil, `pixel_values:halve`, produce 0,693). Los pesos se guardan en bfloat16, el dtype por defecto del checkpoint original, y se verifico que la forward, la perdida y los gradientes son finitos en float32, bfloat16 y float16. El fixture cubre todo checkpoint cuyos ficheros de procesador sean byte a byte identicos y cuya config coincida tras la reduccion (clave de fixture `ca4ed2eea1f0`).

## Capacidades

- No dispone de capacidades generativas reales: los pesos son aleatorios y la salida no tiene significado linguistico.
- Replica el contrato de entrada multimodal del modelo base: procesamiento de imagen, video y texto mediante los procesadores copiados.
- Permite validar la carga de safetensors con nombres de tensores identicos al checkpoint real.
- Sirve para comprobar la sensibilidad de logits ante perturbaciones de entrada en pruebas de integracion.
- Compatible con pruebas de forward, calculo de perdida y retropropagacion en float32, bfloat16 y float16.
- No soporta tool calling, agentes ni razonamiento multi-paso de forma funcional.
- Capacidades multilingues: no disponibles (el tokenizador es el del modelo base, pero el modelo no genera texto coherente).

## Casos de uso

- Validacion de integracion en Transformers: los mantenedores pueden cargar el fixture con la clase `MiniMaxM3SparseForConditionalGeneration` y verificar que la API, los nombres de tensores y el flujo de procesadores funcionan antes de probar el checkpoint completo.
- Pruebas de regresion en CI: al ocupar 0,2 GB, el fixture se descarga e instancia rapidamente en pipelines de integracion continua, permitiendo detectar roturas de compatibilidad en cada release del framework.
- Verificacion de contratos de procesador: los ficheros de tokenizador, image_processor y video_processor copiados byte a byte permiten comprobar que el pipeline multimodal acepta las mismas entradas que el modelo real.
- Desarrollo de harness de evaluacion: investigadores pueden construir y depurar codigo de evaluacion (carga, tokenizacion, forward) sin consumir GPU de gran capacidad ni ancho de banda.
- Pruebas de cuantizacion y dtypes: al ser finito en float32, bfloat16 y float16, sirve para validar rutas de conversion de precision en frameworks de inferencia.
- Docencia y demostraciones de arquitectura: permite inspeccionar la estructura de un modelo multimodal tipo MiniMax-M3 con un coste minimo de recursos.
- Banco de pruebas de sensibilidad: la puerta de sensibilidad documentada (perturbaciones que mueven los logits al menos 0,001) puede reutilizarse como plantilla para validar otros fixtures.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El artefacto es un fixture de prueba con pesos aleatorios y no produce resultados evaluables en tareas de lenguaje, vision o razonamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (25,9 M de parametros, aproximadamente 52 MB de pesos) mas el coste de activaciones, que es minimo por la configuracion reducida.
- GPU recomendadas: cualquier GPU consumer moderna; el fixture cabe holgadamente en tarjetas con 4 GB o menos, e incluso puede ejecutarse en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier modelo (GTX 1650, RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: carga via Transformers con `trust_remote_code` (la configuracion incluye codigo personalizado); no se documentan recetas para vLLM, llama.cpp, Ollama o TGI, y su uso en estos motores no tendria sentido al no ser un modelo funcional.
- Latencia y throughput: no disponibles; al ser un fixture, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-M3-MXFP8-mic | 25,9 M | no disponible | Fixture de prueba para integracion | no disponible | Hugging Face (huggingface-mic) |
| MiniMaxAI/MiniMax-M3-MXFP8 | no disponible | no disponible | Modelo multimodal real, cuantizacion MXFP8 | no disponible | Hugging Face (MiniMaxAI) |
| Fixtures de transformers-mic (otros) | variable (reducidos) | no disponible | Validacion de integracion de otros modelos | no disponible | Hugging Face (huggingface-mic) |

La comparativa con modelos de produccion de tamano similar no procede: el artefacto es un fixture, no un modelo entrenado, y su unico comparable directo es el checkpoint base del que deriva y el resto de fixtures del mismo repositorio.

## Limitaciones y advertencias

- No es un modelo usable: los pesos son aleatorios y las salidas carecen de significado; etiquetado explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos.
- Riesgo de confusion: un usuario podria interpretar que se trata de una version ligera del modelo real; no lo es.
- Licencia no disponible en la informacion proporcionada; el fichero LICENSE se copia del checkpoint base, por lo que las condiciones reales dependen de MiniMaxAI/MiniMax-M3-MXFP8.
- Sesgos conocidos: no aplicables, al no haber entrenamiento; no se pueden evaluar sesgos de generacion.
- Riesgo de alucinacion: no aplicable en el sentido habitual, pero cualquier texto generado sera ruido sin coherencia.
- Limitaciones de contexto e idioma: no disponibles; la configuracion reducida no refleja la ventana de contexto del modelo real.
- Requiere `trust_remote_code` por el codigo personalizado de configuracion y procesamiento.
- No debe desplegarse en produccion ni usarse para evaluar calidad, seguridad o alineamiento del modelo base.
- Los ficheros auxiliares (integration.json, build.json, integrations/) son parte del contrato de pruebas y no documentan capacidades funcionales.

## Enlaces

- Repositorio del fixture: https://huggingface.co/huggingface-mic/MiniMax-M3-MXFP8-mic
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-M3-MXFP8
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de reduccion (sweep.py): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Documentacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/MiniMax-M3-MXFP8-mic.html
