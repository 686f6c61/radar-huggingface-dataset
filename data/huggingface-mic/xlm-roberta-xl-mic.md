# huggingface-mic/xlm-roberta-xl-mic

## Resumen

`xlm-roberta-xl-mic` es un artefacto de prueba publicado por el usuario `huggingface-mic` en Hugging Face. No es un modelo entrenado ni utilizable en producción: se trata de un *fixture* reducido del modelo `facebook/xlm-roberta-xl`, generado para validar contratos de integración y expectativas de framework (Transformers) sin necesidad de cargar los pesos completos del modelo original. El repositorio incluye pesos "slim", documentación de uso ejecutable y un directorio de expectativas de framework.

El modelo conserva la arquitectura `XLMRobertaXLForMaskedLM` pero con una configuración drásticamente reducida (`num_hidden_layers` igual a 2), lo que resulta en 16.411.520 parámetros totales. Los pesos son aleatorios (semilla 17) y no han sido entrenados; el autor indica que pasaron una puerta de sensibilidad de entrada (cada perturbación de las entradas del contrato movía los logits al menos 0,001). Los ficheros de procesador (tokenizador SentencePiece, mapas de tokens especiales y configuración del tokenizador) se copiaron byte a byte desde `facebook/xlm-roberta-xl`.

Su relevancia es puramente de ingeniería: sirve como fixture de test para pipelines de integración continua, validación de contratos de modelos y comprobaciones de compatibilidad de frameworks, no como modelo de lenguaje. Está etiquetado explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | XLMRobertaXLForMaskedLM (transformer encoder, configuración reducida) |
| Parámetros totales | 16.411.520 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos guardados en float32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | facebook/xlm-roberta-xl |
| Tipo de artefacto | test-artifact (fixture de prueba) |
| Dtype de los pesos | float32 |
| Tamaño del repositorio | 0,1 GB |
| Descargas | 2292 |
| Likes | 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de tipo XLM-RoBERTa-XL en su variante para modelado de lenguaje enmascarado (`XLMRobertaXLForMaskedLM`). El autor indica que la configuración se redujo mediante la regla genérica de `sweep.py` del repositorio `transformers-mic`, fijando `num_hidden_layers` en 2. Los nombres de tensores coinciden con los del checkpoint real `facebook/xlm-roberta-xl`, de modo que el fixture puede cargarse con el mismo código que el modelo completo.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17. El autor justifica la ausencia de entrenamiento indicando que el fixture superó una "puerta de sensibilidad de entrada": cada perturbación de las entradas del contrato movía los logits al menos 0,001 (el caso más débil, `input_ids:roll_batch`, produjo 0,428). Los ficheros de procesador se copiaron byte a byte desde el modelo base. Los pesos se guardaron en float32 y el autor afirma que son finitos en float32, bfloat16 y float16 (forward, pérdida y gradientes).

## Capacidades

- No es un modelo funcional: no genera texto útil ni realiza inferencia significativa.
- Conserva la interfaz de `XLMRobertaXLForMaskedLM`, por lo que puede ejecutarse con Transformers para validar flujos de carga y forward pass.
- Sirve como fixture para validar contratos de integración (`integration.json`) y expectativas de framework (`integrations/transformers/expectations`).
- Los ficheros de tokenizador son idénticos a los de `facebook/xlm-roberta-xl`, lo que permite probar rutas de tokenización reales.
- Soporte de tool calling, agentes, razonamiento multi-paso, visión o audio: no disponible (no aplica).
- Capacidades multilingües: no disponible (no evaluadas; el tokenizador proviene del modelo multilingüe base, pero los pesos no están entrenados).

## Casos de uso

- Integración continua de pipelines de modelos: el fixture permite ejecutar tests de carga, forward pass y serialización sin descargar los pesos completos de XLM-RoBERTa-XL, reduciendo tiempo y ancho de banda en CI.
- Validación de contratos de integración: `integration.json` describe el contrato del modelo y el fixture permite comprobar que una implementación lo respeta.
- Verificación de compatibilidad de frameworks: el directorio `integrations/transformers/expectations` permite comparar el comportamiento esperado de Transformers contra el real sobre un modelo pequeño y rápido.
- Pruebas de tokenización: al copiar byte a byte los ficheros del procesador del modelo base, se pueden validar rutas de tokenización reales sin cargar el modelo completo.
- Desarrollo de herramientas de inspección de modelos: útil para probar utilidades que leen configuraciones, nombres de tensores y metadatos sin coste de cómputo.
- Reproducción de fixtures: el script `build_fixtures.py` permite regenerar el artefacto y verificar hashes y resultados de la puerta de sensibilidad, útil para auditorías de reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta métricas de calidad, ya que los pesos son aleatorios y el artefacto no está destinado a evaluación de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 16,4 M de parámetros en float32, el modelo ocupa aproximadamente 65 MB en pesos, más overhead de activaciones mínimo.
- GPU recomendadas: cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior); también funciona en CPU.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1 GB de VRAM; incluso en CPU es viable.
- Opciones de despliegue: Transformers (carga estándar de `XLMRobertaXLForMaskedLM`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible; al ser un fixture de 2 capas, la latencia sería muy baja, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Propósito |
|---|---|---|---|---|---|
| xlm-roberta-xl-mic | 16,4 M | no disponible | no disponible | Hugging Face | Fixture de test |
| facebook/xlm-roberta-xl | no disponible en la información | no disponible | no disponible | Hugging Face | Modelo real de enmascarado multilingüe |
| Otros fixtures de transformers-mic | no disponible | no disponible | no disponible | Hugging Face | Fixtures de test |

La comparación con modelos de producción no es significativa: `xlm-roberta-xl-mic` es un artefacto de prueba, no un modelo de lenguaje entrenado. Su alternativa directa es el modelo base `facebook/xlm-roberta-xl`, del que deriva pero con pesos aleatorios y configuración reducida.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y no han sido entrenados; las salidas no tienen significado.
- Etiquetado como `test-artifact`: el autor lo excluye explícitamente de búsquedas de modelos candidatos.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; además, al derivar de `facebook/xlm-roberta-xl`, habría que consultar la licencia del modelo base.
- Idiomas no disponibles: aunque el tokenizador proviene de un modelo multilingüe, no se han evaluado capacidades lingüísticas.
- Longitud de contexto no disponible: la configuración reducida no documenta este parámetro.
- Riesgo de confusión: un usuario podría descargarlo pensando que es un modelo funcional; el nombre y la etiqueta `test-artifact` son la única salvaguarda.
- No apto para producción: no debe desplegarse en aplicaciones reales de atención al cliente, generación de código ni ninguna tarea de NLP.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/huggingface-mic/xlm-roberta-xl-mic
- Modelo base: https://huggingface.co/facebook/xlm-roberta-xl
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/xlm-roberta-xl-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/xlm-roberta-xl-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/xlm-roberta-xl-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/xlm-roberta-xl-mic/blob/main/build.json
- Documentación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/xlm-roberta-xl-mic.html
- Script `sweep.py`: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script `build_fixtures.py`: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
