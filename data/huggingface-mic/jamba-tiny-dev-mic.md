# huggingface-mic/Jamba-tiny-dev-mic

## Resumen

Jamba-tiny-dev-mic es un artefacto de prueba (fixture) publicado por el usuario huggingface-mic, derivado del modelo ai21labs/Jamba-tiny-dev. No es un modelo entrenado ni utilizable en producción: se trata de un checkpoint "slim" de 8.831.936 parámetros generado con pesos aleatorios (semilla 17) y una configuración reducida del modelo original (num_hidden_layers = 5). Su propósito es servir como fixture de integración para validar contratos de ejecución y expectativas de frameworks (Transformers) sin necesidad de descargar el checkpoint completo.

El repositorio empaqueta los pesos reducidos junto con documentación de uso ejecutable (integrations/transformers/usage.md), un manifiesto de contrato (integration.json), las expectativas del framework y la procedencia del fixture (build.json). Los ficheros de procesador (generation_config.json, special_tokens_map.json, tokenizer.json, tokenizer.model, tokenizer_config.json) se copian byte a byte del modelo base ai21labs/Jamba-tiny-dev, de modo que la tokenización y la configuración de generación coinciden exactamente con las del modelo real.

La relevancia de este artefacto es acotada y muy específica: permite a desarrolladores de infraestructura y mantenedores de frameworks probar pipelines de carga, forward, cálculo de pérdida y gradientes con la arquitectura JambaForCausalLM en un tamaño manejable, manteniendo los mismos nombres de tensor que el checkpoint real. Está etiquetado explícitamente como test-artifact para excluirlo de búsquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | JambaForCausalLM (transformer híbrido, config reducida) |
| Parametros totales | 8.831.936 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura JambaForCausalLM, correspondiente a la familia Jamba de AI21 Labs, que combina capas de atención con mecanismos de estado (arquitectura híbrida transformer-Mamba en el modelo original). En este fixture, la configuración se ha reducido mediante la regla genérica de sweep.py del repositorio transformers-mic, fijando num_hidden_layers = 5. Los nombres de tensor coinciden con los del checkpoint real ai21labs/Jamba-tiny-dev.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y se aceptaron tras superar una puerta de sensibilidad a la entrada: cada perturbación de las entradas del contrato desplazó los logits al menos 0,001 (el caso más débil, input_ids:roll_batch, con 0,764). El modelo se guardó en bfloat16, el dtype con el que carga por defecto ai21labs/Jamba-tiny-dev, y se verificó que es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes.

## Capacidades

- No dispone de capacidades funcionales de generación de texto, razonamiento, código o matemáticas: al tener pesos aleatorios, sus salidas no son coherentes.
- Sirve como fixture de integración para validar la carga del modelo, el forward pass, el cálculo de pérdida y la retropropagación de gradientes en frameworks compatibles.
- Mantiene la tokenización y la configuración de generación idénticas a ai21labs/Jamba-tiny-dev, lo que permite probar pipelines de preprocesado y decodificación con el tokenizador real.
- Conserva los mismos nombres de tensor que el checkpoint completo, útil para testear rutinas de mapeo de pesos y sharding.
- No soporta tool calling, agentes ni razonamiento multi-paso de forma útil.
- Capacidades multilingües: no aplicables (no es un modelo entrenado).

## Casos de uso

- Pruebas de integración en Transformers: cargar el fixture con AutoModelForCausalLM y ejecutar un forward para verificar que la implementación de JambaForCausalLM funciona con la configuración reducida, sin descargar el checkpoint completo.
- Validación de contratos de framework: usar integration.json y el directorio integrations/transformers/expectations para comprobar que una versión de Transformers cumple las expectativas de entrada/salida del contrato.
- Test de pipelines de entrenamiento: ejecutar pasos de forward, loss y backward en float32, bfloat16 y float16 para detectar problemas de estabilidad numérica o de dtype en el código de entrenamiento.
- CI/CD de librerías de inferencia: incluir el fixture en la suite de tests de herramientas como vLLM o TGI para validar la carga de arquitecturas Jamba con un artefacto pequeño y rápido de descargar.
- Verificación de tokenizadores: probar rutinas de tokenización y decodificación contra los ficheros de procesador copiados byte a byte del modelo base.
- Desarrollo de utilidades de sharding y conversión de pesos: comprobar el mapeo de nombres de tensor contra un checkpoint que replica la estructura del modelo real.
- Reproducción de fixtures: regenerar los ficheros con python example/build_fixtures.py --fixture Jamba-tiny-dev-mic para auditar la procedencia y los hashes registrados en build.json.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un fixture con pesos aleatorios, no procede evaluar calidad de generación.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (8,8 M de parámetros), aunque el dato exacto depende del framework y de los buffers de activación.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 o superior) es más que suficiente; también funciona en CPU.
- Cabe en cualquier GPU consumer y en la mayoría de entornos sin GPU.
- Opciones de despliegue: Transformers (carga estándar con AutoModelForCausalLM); otras herramientas como vLLM, llama.cpp, Ollama o TGI no están documentadas para este fixture.
- Latencia y throughput: no disponibles; al ser un artefacto de prueba no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/Jamba-tiny-dev-mic | 8.831.936 | no disponible | Fixture de integración (test-artifact) | no disponible | Hugging Face |
| ai21labs/Jamba-tiny-dev | no disponible en la informacion proporcionada | no disponible | Modelo base Jamba de tamano tiny | no disponible | Hugging Face |
| Otros fixtures de transformers-mic | no disponible | no disponible | Artefactos de prueba por arquitectura | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables, ya que el fixture no está entrenado y el modelo base no aporta cifras en la información proporcionada.

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no genera texto coherente ni es apto para ninguna tarea de inferencia real.
- Etiquetado como test-artifact: no debe tratarse como modelo candidato en búsquedas o pipelines de selección de modelos.
- Licencia no declarada: no se especifica licencia, por lo que el uso comercial queda sin garantías legales explícitas.
- Configuración reducida (5 capas) que no refleja el comportamiento del modelo base completo; los resultados de pruebas de rendimiento no son extrapolables.
- Idiomas y contexto no documentados; no se puede asumir compatibilidad multilingüe ni una ventana de contexto concreta.
- Riesgo de confusión: el nombre puede llevar a pensar que es un modelo funcional; conviene revisar build.json y la model card antes de integrarlo.
- No hay métricas de calidad, sesgos ni alucinación aplicables, al no existir entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface-mic/Jamba-tiny-dev-mic
- Modelo base: https://huggingface.co/ai21labs/Jamba-tiny-dev
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de construcción de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reducción (sweep.py): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Explicación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Jamba-tiny-dev-mic.html
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/Jamba-tiny-dev-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/Jamba-tiny-dev-mic/blob/main/integrations/transformers/usage.md
- Procedencia del fixture: https://huggingface.co/huggingface-mic/Jamba-tiny-dev-mic/blob/main/build.json
