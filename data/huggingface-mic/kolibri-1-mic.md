# huggingface-mic/Kolibri-1-mic

## Resumen

Kolibri-1-mic es un artefacto de prueba (fixture) publicado por la organización huggingface-mic, no un modelo utilizable. Se trata de una versión reducida del modelo Aleph-Alpha/Kolibri-1, generada automáticamente mediante la herramienta `sweep.py` del repositorio transformers-mic con el objetivo de servir como banco de pruebas para validar contratos de integración con frameworks (principalmente Transformers). El repositorio incluye los pesos reducidos, ejemplos de uso ejecutables y un directorio de expectativas de framework.

El modelo conserva la arquitectura `Kolibri1ForCausalLM` del checkpoint original pero con una configuración drásticamente reducida (2 capas ocultas frente a la profundidad del original), lo que resulta en 16.508.040 parámetros totales. Los pesos son aleatorios (semilla 17) y no han sido entrenados; la model card indica explícitamente que superaron una "puerta de sensibilidad a la entrada" que verifica que las perturbaciones en las entradas mueven los logits al menos 0,001, lo que basta para validar el flujo de ejecución sin necesidad de entrenamiento.

Su relevancia es puramente técnica y de infraestructura: permite a los mantenedores de transformers-mic y a desarrolladores de integraciones verificar que el pipeline de carga, tokenización y forward pass funciona correctamente para la familia Kolibri sin necesidad de descargar ni ejecutar el modelo completo. Está etiquetado como `test-artifact` precisamente para excluirlo de búsquedas de modelos candidatos a uso real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (`Kolibri1ForCausalLM`) |
| Parametros totales | 16.508.040 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (se copia el archivo `LICENSE` del modelo base) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal estándar de la familia Kolibri (`Kolibri1ForCausalLM`), reducido mediante la regla genérica de `sweep.py` a 2 capas ocultas (`num_hidden_layers: 2`). Los nombres de tensores coinciden exactamente con los del checkpoint real `Aleph-Alpha/Kolibri-1`, de modo que cualquier código que cargue el modelo original debería funcionar con el fixture sin cambios en el mapeo de pesos.

No hubo entrenamiento: los pesos son aleatorios con semilla 17. Se verificó que el modelo es finito en float32, bfloat16 y float16 (forward, loss y gradientes) y que supera la puerta de sensibilidad a la entrada (la perturbación más débil, `attention_mask:all_ones`, desplaza los logits 0,133). Los archivos de procesador (`LICENSE`, `generation_config.json`, `tokenizer.json`, `tokenizer_config.json`) se copiaron byte a byte desde `Aleph-Alpha/Kolibri-1`, por lo que la tokenización es idéntica a la del modelo base.

## Capacidades

- No es un modelo funcional: no genera texto coherente ni resuelve tareas reales.
- Sirve como fixture para validar la carga de pesos, el mapeo de tensores y el forward pass de la arquitectura Kolibri.
- Permite verificar la integración con Transformers (uso y expectativas documentados en `integrations/transformers/`).
- Valida la compatibilidad de tokenizer y `generation_config` copiados del modelo base.
- Comprueba estabilidad numérica en float32, bfloat16 y float16 (forward, loss, gradientes).
- No dispone de tool calling, agentes, visión, audio ni capacidades multilingües reales.

## Casos de uso

- Pruebas de integración en CI: usar el fixture para verificar que un pipeline de carga de Transformers funciona con la arquitectura Kolibri sin descargar el modelo completo, reduciendo tiempo y ancho de banda en integración continua.
- Desarrollo de wrappers y librerías: validar el mapeo de nombres de tensores y la compatibilidad de `generation_config.json` antes de migrar al checkpoint real.
- Validación de contratos de framework: ejecutar el directorio `integrations/transformers/expectations` para comprobar que una versión de Transformers cumple las expectativas del contrato.
- Pruebas de estabilidad numérica: verificar que el forward, la loss y los gradientes son finitos en float32, bfloat16 y float16 en distintas plataformas.
- Reproducción de la cadena de build: regenerar el fixture con `python example/build_fixtures.py --fixture Kolibri-1-mic` y comparar hashes registrados en `build.json`.
- Docencia y experimentación con arquitecturas: estudiar la estructura de tensores de un modelo Kolibri a escala mínima sin coste de cómputo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier métrica de calidad sería irrelevante.

## Requisitos de hardware

- VRAM estimada: inferior a 100 MB en bfloat16 (16,5 M parámetros), ejecutable en CPU.
- GPU recomendadas: cualquiera; no requiere GPU dedicada.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU.
- Opciones de despliegue: Transformers (vía documentación en `integrations/transformers/usage.md`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia |
|---|---|---|---|---|
| Kolibri-1-mic | 16,5 M | no disponible | Fixture de pruebas | no disponible |
| Aleph-Alpha/Kolibri-1 | no disponible | no disponible | Modelo base real | no disponible |
| Otros fixtures transformers-mic | variable | no disponible | Fixtures de pruebas | no disponible |

No se dispone de datos suficientes para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y las salidas no tienen sentido.
- Etiquetado como `test-artifact` para excluirlo de búsquedas de modelos candidatos.
- La licencia no está declarada en la información disponible; se copia el archivo `LICENSE` del modelo base, por lo que las restricciones de uso comercial dependen de `Aleph-Alpha/Kolibri-1`.
- La longitud de contexto, los idiomas y las capacidades reales no están documentadas.
- No debe desplegarse en producción bajo ninguna circunstancia.
- El tamaño del repo aparece como 0,0 GB, lo que puede indicar metadatos incompletos.

## Enlaces

- Hugging Face: https://huggingface.co/huggingface-mic/Kolibri-1-mic
- Modelo base: https://huggingface.co/Aleph-Alpha/Kolibri-1
- Documentación de uso con Transformers: integrations/transformers/usage.md
- Expectativas de Transformers: integrations/transformers/expectations
- Manifiesto de contrato: integration.json
- Procedencia del fixture: build.json
- Explicación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Kolibri-1-mic.html
- Script de reducción: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
