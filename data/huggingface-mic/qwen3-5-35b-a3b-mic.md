# huggingface-mic/Qwen3.5-35B-A3B-mic

## Resumen

Qwen3.5-35B-A3B-mic es un artefacto de prueba (fixture) derivado de Qwen/Qwen3.5-35B-A3B, publicado por el usuario huggingface-mic. No se trata de un modelo funcional: es una version "adelgazada" del checkpoint original que conserva la misma arquitectura declarada (Qwen3_5MoeForConditionalGeneration) pero con solo 33,27 millones de parametros reales, obtenidos reduciendo el numero de capas ocultas del texto a 2 mediante una regla generica de reduccion (sweep.py del repositorio transformers-mic).

El proposito del repositorio es empaquetar en un unico lugar los pesos reducidos, ejemplos de uso ejecutables y las expectativas de integracion con frameworks (carpeta integrations/transformers). Los pesos son aleatorios (semilla 17) y no han sido entrenados; el autor indica que pasaron un test de sensibilidad a la entrada (cada perturbacion de las entradas del contrato mueve los logits al menos 0,001), lo que basta para validar contratos de integracion sin necesidad de entrenamiento.

Es relevante unicamente como herramienta de ingenieria: permite verificar que una implementacion de transformers, un pipeline de carga o una integracion de framework maneja correctamente la arquitectura Qwen3.5 MoE, los ficheros de procesador y los nombres de tensores, sin necesidad de descargar ni ejecutar el modelo real de 35B. Esta etiquetado explicitamente como test-artifact para excluirlo de busquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5MoeForConditionalGeneration (MoE, config reducida) |
| Parametros totales | 33.271.920 (fixture); el modelo base declara 35B en su nombre |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el fichero LICENSE se copia byte a byte del modelo base, pero su contenido no se detalla) |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

La arquitectura declarada es Qwen3_5MoeForConditionalGeneration, es decir, un transformer con mezcla de expertos (MoE) segun la convencion de nombres de Qwen3.5. Sin embargo, el fixture reduce la configuracion: el numero de capas ocultas del texto se fija en 2 mediante la regla generica de sweep.py. No hay informacion disponible sobre el numero de expertos, la dimension oculta, la atencion (estandar o lineal) ni la ventana de contexto del modelo base, mas alla de lo que sugiere su nombre comercial.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se guardan en float32, el dtype con el que carga por defecto Qwen/Qwen3.5-35B-A3B. El autor verifico que los tensores son finitos en float32, bfloat16 y float16 (forward, loss y gradientes) y que los nombres de tensores coinciden con los del checkpoint real. Los ficheros de procesador (tokenizer.json, tokenizer_config.json, chat_template.jinja, generation_config.json, preprocessor_config.json, video_preprocessor_config.json, vocab.json, merges.txt) se copian byte a byte del modelo base, de modo que el contrato de tokenizacion y plantilla de chat es identico al original.

## Capacidades

- No es un modelo usable: no genera texto coherente, no razona, no escribe codigo ni resuelve matematicas, porque sus pesos son aleatorios.
- Sirve como fixture de integracion: valida la carga de la arquitectura Qwen3_5MoeForConditionalGeneration en transformers y en otros frameworks.
- Conserva el tokenizador, la plantilla de chat y los ficheros de preprocesado del modelo base, por lo que permite probar pipelines de tokenizacion y formateo de conversaciones.
- Conserva los nombres de tensores del checkpoint real, lo que permite validar mapeos de pesos y utilidades de conversion.
- Incluye un manifest de contrato (integration.json), ejemplos de uso (integrations/transformers/usage.md) y expectativas de framework (integrations/transformers/expectations).
- No dispone de tool calling, capacidad de agente, vision, audio ni modo thinking funcionales; los ficheros de preprocesado de video existen pero no hay pesos que los aprovechen de forma significativa.

## Casos de uso

- Pruebas de integracion en CI: cargar el fixture en transformers para comprobar que la version de la libreria soporta la arquitectura Qwen3.5 MoE sin descargar el checkpoint de 35B ni consumir GPU de gama alta.
- Validacion de contratos de API: usar integration.json y la carpeta expectations para verificar que un wrapper propio (endpoint HTTP, SDK interno) respeta las entradas y salidas esperadas del modelo base.
- Desarrollo de utilidades de conversion de pesos: al conservar los nombres de tensores del checkpoint real, el fixture permite probar scripts de conversion a GGUF u otros formatos sobre una arquitectura equivalente y con un repo de 0,4 GB.
- Pruebas de tokenizacion y plantillas de chat: los ficheros de procesador copiados byte a byte permiten validar el formateo de conversaciones, el manejo de tokens especiales y el truncado sin depender del modelo completo.
- Regresion de pipelines de preprocesado multimodal: los ficheros preprocessor_config.json y video_preprocessor_config.json permiten comprobar que un pipeline carga y aplica la configuracion de imagen y video del modelo base.
- Formacion y demos de ingenieria: util para explicar en un taller como se estructura un repositorio de modelo (pesos, tokenizador, generacion, contrato) con un artefacto ligero que cabe en cualquier portatil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un fixture con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 para los 33,27 millones de parametros; el repo completo ocupa 0,4 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) o incluso CPU; no requiere A100 ni H100.
- Cabe en cualquier GPU consumer y en la mayoria de entornos CPU-only.
- Opciones de despliegue: transformers es la via documentada en integrations/transformers/usage.md; no hay informacion sobre soporte en vLLM, llama.cpp, Ollama o TGI para este fixture.
- Latencia y throughput: no disponibles; al ser un modelo de 2 capas con pesos aleatorios, las cifras no serian representativas del modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-35B-A3B-mic | 33,27 M (fixture) | no disponible | Fixture de integracion | no disponible | Hugging Face (huggingface-mic) |
| Qwen/Qwen3.5-35B-A3B | 35B (segun nombre) | no disponible | Modelo MoE real | no disponible | Hugging Face (Qwen) |
| Otros fixtures de transformers-mic | variable (reducidos) | no disponible | Pruebas de contrato | no disponible | Hugging Face (huggingface-mic) |

La comparacion relevante es con el modelo base: el fixture comparte arquitectura, tokenizador y nombres de tensores, pero no pesos entrenados ni capacidades. Frente a otros fixtures del mismo proyecto, la diferencia esta en la arquitectura cubierta (Qwen3.5 MoE en este caso).

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y la salida no tiene significado. No debe desplegarse en produccion ni usarse para evaluar calidad.
- La configuracion esta reducida (2 capas de texto), por lo que el comportamiento numerico no reproduce el del checkpoint real de 35B.
- No hay informacion sobre la licencia efectiva; el fichero LICENSE se copia del modelo base, pero su contenido no se detalla en la informacion disponible. Verificar antes de cualquier uso.
- No hay datos de sesgos, alucinacion ni rendimiento multilingue porque no ha habido entrenamiento.
- El autor lo etiqueta como test-artifact para excluirlo de busquedas de modelos candidatos; usarlo como modelo de produccion seria un error de seleccion.
- El repo tiene 266 descargas y 0 likes en el momento de la consulta, lo que sugiere un uso limitado a pruebas internas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/Qwen3.5-35B-A3B-mic
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Qwen3.5-35B-A3B-mic.html
- Script de reduccion (sweep.py): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
