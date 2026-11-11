# huggingface-mic/mpnet-base-mic

## Resumen

`mpnet-base-mic` es un artefacto de prueba (test fixture) publicado por la organización `huggingface-mic`, no un modelo entrenado para uso real. Se trata de una versión reducida y con pesos aleatorios de `microsoft/mpnet-base`, generada automáticamente mediante la herramienta `transformers-mic` para validar contratos de integración entre el modelo y distintos frameworks. El repositorio incluye los pesos "slim", un manifiesto de contrato (`integration.json`), ejemplos de uso con Transformers y un directorio de expectativas de framework.

El modelo conserva la arquitectura `MPNetForMaskedLM` del original pero con solo 2 capas ocultas (`num_hidden_layers: 2`), lo que reduce el total a 2.088.639 parámetros. Los ficheros de procesador (`tokenizer.json`, `tokenizer_config.json`, `vocab.txt`) se copian byte a byte desde `microsoft/mpnet-base`, y los pesos se inicializan aleatoriamente con semilla 17. El autor lo etiqueta explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos.

Su relevancia es exclusivamente para ingeniería de infraestructura: sirve como fixture reproducible para probar pipelines de carga, inferencia y compatibilidad de frameworks sin necesidad de descargar el checkpoint completo. No debe confundirse con un modelo funcional de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MPNet (`MPNetForMaskedLM`), transformer encoder |
| Parametros totales | 2.088.639 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de `microsoft/mpnet-base`, no declarada en la ficha) |
| Tipos de cuantizacion | no disponible (pesos guardados en float32; verificado finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una instancia reducida de MPNet, un transformer encoder con atención bidireccional y enmascaramiento permutado, diseñado originalmente para tareas de representación de texto y `fill-mask`. En esta fixture se ha aplicado una regla genérica de reducción (`sweep.py`) que fija `num_hidden_layers` en 2, manteniendo los mismos nombres de tensores que el checkpoint real. Los ficheros de tokenizador se copian sin modificar desde `microsoft/mpnet-base`.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y solo se validaron mediante una "input-sensitivity gate": cada perturbación de las entradas del contrato debe mover los logits al menos 0,001 (la más débil, `attention_mask:all_ones`, produjo 0,00388). Esto garantiza que el fixture responde a las entradas de forma diferenciable, pero no que produzca salidas semánticamente útiles. El proceso de construcción está documentado en `build_fixtures.py` y los hashes y fuentes fijadas se registran en `build.json`.

## Capacidades

- Ejecución del contrato `MPNet fill-mask` con la misma interfaz que `microsoft/mpnet-base`.
- Carga compatible con Transformers mediante los ficheros de uso y expectativas incluidos en `integrations/transformers/`.
- Verificación de contratos de integración entre modelo y framework (nombres de tensores, formas, dtypes).
- Diferenciabilidad verificada en float32, bfloat16 y float16 (forward, loss y gradientes finitos).
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingües declaradas.
- No es un modelo utilizable para inferencia real: las salidas son aleatorias.

## Casos de uso

- Pruebas de integración en CI/CD: usar el fixture para validar que un pipeline de carga con Transformers acepta el checkpoint y produce tensores con las formas esperadas, sin descargar el modelo completo.
- Validación de contratos de framework: comprobar que las expectativas declaradas en `integrations/transformers/expectations` se cumplen en cada versión de la librería.
- Desarrollo de herramientas de auditoría de modelos: servir como caso de prueba reproducible para verificar que un script detecta arquitectura, número de capas y dtypes correctamente.
- Test de robustez numérica: verificar que un runtime (por ejemplo, un kernel de atención) produce resultados finitos en float32, bfloat16 y float16 con este checkpoint.
- Regresión de tokenizadores: al copiar los ficheros de procesador byte a byte, permite comprobar que un pipeline de tokenización reproduce exactamente las salidas de `microsoft/mpnet-base`.
- Documentación y demos de `transformers-mic`: ejemplificar el flujo de generación de fixtures (`build_fixtures.py`) y el formato de `build.json` para nuevos artefactos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios, por lo que cualquier métrica de calidad (MMLU, GLUE, fill-mask accuracy) carecería de significado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en float32 (2,09 M parámetros × 4 bytes ≈ 8,4 MB de pesos, más activaciones y overhead del runtime).
- GPU recomendadas: cualquier GPU consumer o integrada; no requiere aceleración dedicada.
- Cabe holgadamente en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: Transformers (ruta principal documentada en `integrations/transformers/usage.md`); otras opciones como vLLM, llama.cpp, Ollama o TGI no están documentadas para este artefacto.
- Latencia y throughput: no disponibles; al ser una fixture de 2 capas, la latencia sería del orden de milisegundos en CPU, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Capas | Contexto | Proposito | Licencia |
|---|---|---|---|---|---|
| `huggingface-mic/mpnet-base-mic` | 2,09 M | 2 | no disponible | Fixture de test | no disponible |
| `microsoft/mpnet-base` | ~109 M | 12 | 512 tokens (estandar MPNet) | Modelo real de representacion y fill-mask | MIT (segun el repositorio original) |
| `bert-base-uncased` | ~110 M | 12 | 512 tokens | Encoder de representacion y fill-mask | Apache 2.0 |
| `distilbert-base-uncased` | ~66 M | 6 | 512 tokens | Encoder destilado de BERT | Apache 2.0 |

La comparación relevante es únicamente estructural: el fixture replica la interfaz de `microsoft/mpnet-base` con un 98 % menos de parámetros y sin entrenamiento. Frente a `bert-base-uncased` o `distilbert-base-uncased` no compite en calidad porque no es un modelo funcional.

## Limitaciones y advertencias

- Pesos aleatorios: las salidas no tienen valor semántico; no debe usarse para inferencia real ni para evaluar calidad.
- Etiquetado explícito como `test-artifact`: el autor lo excluye de búsquedas de modelos candidatos.
- Licencia no declarada en la ficha: no se puede asumir uso comercial sin consultar el repositorio original `microsoft/mpnet-base` (MIT) y el propio artefacto.
- Idiomas soportados no declarados: aunque el tokenizador se copia de `microsoft/mpnet-base`, la ficha no especifica cobertura lingüística.
- Longitud de contexto no declarada en la ficha; cualquier valor debe inferirse del modelo base, no del artefacto.
- Riesgo de confusión: el nombre `mpnet-base-mic` puede llevar a error; no es un fine-tune de MPNet para ninguna tarea.
- No apto para producción: sin entrenamiento, sin evaluación de sesgos y sin garantías de robustez.
- La sensibilidad de entrada se validó con un umbral mínimo (0,001), lo que confirma diferenciabilidad pero no calidad de representación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/mpnet-base-mic
- Modelo base: https://huggingface.co/microsoft/mpnet-base
- Documentación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/mpnet-base-mic.html
- Script de barrido (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción de fixtures (`build_fixtures.py`): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Repositorio `transformers-mic`: https://github.com/huggingface/transformers-mic
