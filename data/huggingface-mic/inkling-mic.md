# huggingface-mic/Inkling-mic

## Resumen

Inkling-mic es un artefacto de prueba (fixture) publicado por la organización huggingface-mic, no un modelo entrenado ni utilizable en producción. Deriva de `thinkingmachines/Inkling`, un modelo multimodal de generación condicional, mediante un proceso de reducción ("shrink") documentado en el repositorio `transformers-mic`. El resultado conserva la arquitectura `InklingForConditionalGeneration` y los nombres de tensores del checkpoint original, pero con solo 26.736.427 parámetros y pesos aleatorios (semilla 17).

Su propósito es servir como fixture de integración para validar contratos de framework (Transformers) sin necesidad de descargar ni ejecutar el modelo real. Incluye los ficheros de procesador copiados byte a byte del modelo base (`chat_template.jinja`, `processor_config.json`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`), así como un manifiesto de contrato (`integration.json`) y expectativas de framework.

La relevancia de este repositorio es exclusivamente técnica y de infraestructura: permite a los mantenedores de `transformers-mic` verificar que las integraciones de Inkling funcionan con pesos reducidos. Está etiquetado explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos. No debe emplearse para inferencia real, evaluación de calidad ni despliegue.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | InklingForConditionalGeneration (transformer multimodal de generación condicional) |
| Parametros totales | 26.736.427 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float32; se declara compatibilidad numérica con float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo es un fixture derivado de `thinkingmachines/Inkling`, un modelo multimodal de generación condicional. La arquitectura declarada es `InklingForConditionalGeneration`, reducida mediante la regla genérica de `sweep.py` del repositorio `transformers-mic`, que en este caso fija `text num_hidden_layers` a 3. Se conservan los nombres de tensores exactos del checkpoint real, de modo que el fixture es intercambiable a nivel de carga con el modelo original.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17, y se validaron mediante una "input-sensitivity gate": cada perturbación de las entradas del contrato desplaza los logits al menos 0,001 (el caso más débil, `input_ids:reverse`, alcanza 0,0461). El fixture es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. Los ficheros de procesador se copiaron byte a byte desde `thinkingmachines/Inkling`. No se dispone de información sobre datos de entrenamiento, tokens, RLHF/DPO ni innovaciones técnicas del modelo base.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen salidas semánticamente válidas.
- Sirve como fixture de integración para validar la carga y el contrato de `InklingForConditionalGeneration` en Transformers.
- Incluye el procesador multimodal (tokenizer y processor_config) copiado del modelo base, útil para probar pipelines de preprocesado.
- Permite verificar la sensibilidad de entradas del contrato mediante la gate documentada en `build.json`.
- Compatible numéricamente con float32, bfloat16 y float16 en forward, loss y gradientes.
- No dispone de tool calling, agentes, razonamiento multilingüe ni capacidades de visión reales verificables.

## Casos de uso

- Pruebas de integración en CI: cargar el fixture en Transformers y comprobar que la clase `InklingForConditionalGeneration` se instancia y ejecuta un forward sin errores, con un coste de descarga de 0,4 GB.
- Validación de contratos de framework: usar `integration.json` y `integrations/transformers/expectations` para verificar que la API esperada (entradas, salidas, dtypes) se cumple.
- Test de regresión de tokenizer: al copiarse los ficheros de procesador byte a byte, se puede comprobar que el pipeline de tokenización coincide con el del modelo base.
- Verificación de estabilidad numérica: ejecutar forward, loss y backward en float32, bfloat16 y float16 para detectar NaN o infinitos en integraciones.
- Desarrollo de herramientas de inspección de modelos: al conservar los nombres de tensores del checkpoint real, sirve para probar utilidades de análisis de arquitectura sin descargar el modelo completo.
- Reproducción del proceso de shrink: el enlace "How the fixture was shrunk" y `build.json` permiten auditar y reconstruir el fixture con `build_fixtures.py`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,1 GB en float32 (26,7 M de parámetros × 4 bytes), alrededor de 0,05 GB en bfloat16/float16.
- GPU recomendadas: cualquier GPU consumer moderna; cabe holgadamente en CPU.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: Transformers (carga directa del checkpoint safetensors); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser un fixture de 3 capas, la latencia sería mínima pero sin valor representativo del modelo base.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-mic | 26,7 M | no disponible | Fixture de test | no disponible | Hugging Face |
| thinkingmachines/Inkling | no disponible | no disponible | Modelo multimodal real | no disponible | Hugging Face |
| Otros fixtures de transformers-mic | no disponible | no disponible | Fixtures de test | no disponible | Hugging Face |

No se dispone de datos de rendimiento ni de especificaciones del modelo base para una comparación cuantitativa.

## Limitaciones y advertencias

- Pesos aleatorios: las salidas no tienen significado; no usar para inferencia, evaluación ni producción.
- Etiquetado como `test-artifact`: excluido intencionadamente de búsquedas de modelos candidatos.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución.
- Idiomas y contexto no disponibles: no hay información sobre capacidades multilingües ni ventana de contexto.
- Arquitectura reducida (3 capas de texto): no representa el comportamiento del modelo base.
- Riesgo de confusión: el nombre y la estructura pueden llevar a error si se trata como modelo real; verificar siempre la etiqueta `test-artifact`.
- Los ficheros de procesador son los del modelo base, pero el resto de artefactos debe regenerarse con `build_fixtures.py`.

## Enlaces

- Hugging Face: https://huggingface.co/huggingface-mic/Inkling-mic
- Modelo base: https://huggingface.co/thinkingmachines/Inkling
- Cómo se redujo el fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Inkling-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de reducción: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Manifiesto de contrato: integration.json (en el repositorio)
- Uso con Transformers: integrations/transformers/usage.md (en el repositorio)
- Expectativas de Transformers: integrations/transformers/expectations (en el repositorio)
- Procedencia del fixture: build.json (en el repositorio)
