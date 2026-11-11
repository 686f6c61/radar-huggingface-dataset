# huggingface-mic/mamba-130m-hf-mic

## Resumen

`mamba-130m-hf-mic` es un artefacto de prueba publicado por el usuario `huggingface-mic`, no un modelo entrenado. Se trata de una versión reducida ("slim fixture") del checkpoint `state-spaces/mamba-130m-hf`, generada automáticamente mediante la regla genérica de reducción de `sweep.py` del repositorio `transformers-mic`. El propósito declarado por el autor es servir como fixture de integración para validar el comportamiento de frameworks (concretamente Transformers) frente a un modelo de arquitectura Mamba, no para realizar inferencia útil.

El modelo conserva la arquitectura `MambaForCausalLM` del original pero con `num_hidden_layers` reducido a 2, lo que da un total de 3.305.920 parámetros. Los pesos son aleatorios (semilla 17) y no han sido entrenados; el autor indica que superaron una puerta de sensibilidad de entrada (cada perturbación de las entradas del contrato movía los logits al menos 0,001), por lo que no se consideró necesario entrenamiento. Los ficheros de procesador (`generation_config.json`, `tokenizer.json`, `tokenizer_config.json`) se copiaron byte a byte del checkpoint original.

Su relevancia es exclusivamente de ingeniería: permite a mantenedores de frameworks y pipelines de CI ejecutar pruebas de integración sobre Mamba sin descargar el modelo completo. Está etiquetado como `test-artifact` explícitamente para excluirlo de búsquedas de modelos candidatos. Cualquier uso como modelo generativo produciría salidas sin sentido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba (state space model), clase `MambaForCausalLM` |
| Parametros totales | 3.305.920 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float32; se declara finitud en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

La arquitectura es Mamba, un modelo de espacio de estados selectivo (SSM) en lugar de un transformer con atención. El fixture replica la clase `MambaForCausalLM` del checkpoint `state-spaces/mamba-130m-hf` pero con la configuración reducida a 2 capas ocultas, aplicando la regla genérica de reducción de `sweep.py`. Los nombres de tensores coinciden con los del checkpoint real, y el autor afirma que el checkpoint original contiene todos los parámetros y el fixture también.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17. El autor documenta una "puerta de sensibilidad de entrada": se perturbaron las entradas del contrato y se verificó que cada perturbación movía los logits al menos 0,001 (el caso más débil, `attention_mask:all_ones`, produjo 1,97), lo que se interpretó como evidencia suficiente para no requerir entrenamiento. Los ficheros de procesador se copiaron byte a byte del modelo base. El fixture se guardó en float32, el dtype con el que carga por defecto `state-spaces/mamba-130m-hf`, y se verificó finitud en forward, pérdida y gradientes para float32, bfloat16 y float16.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios, por lo que la generación de texto produce salidas sin sentido.
- Sirve como fixture de integración para validar la carga, el forward pass, el cálculo de pérdida y el flujo de gradientes de `MambaForCausalLM` en Transformers.
- Permite verificar contratos de framework: el repositorio incluye `integration.json` (manifiesto de contrato), `integrations/transformers/usage.md` (uso ejecutable) e `integrations/transformers/expectations` (expectativas del framework).
- Reproduce los nombres de tensores y los ficheros de procesador del checkpoint real, lo que permite probar rutas de código que dependen de esos nombres.
- No soporta tool calling, agentes, razonamiento multilingüe ni ninguna capacidad generativa real.
- Apta para pruebas de CI con huella determinista: el autor documenta la clave de fixture `207fe34aa3c8`, que agrupa checkpoints con ficheros de procesador idénticos y configuración coincidente tras la reducción.

## Casos de uso

- Pruebas de integración en Transformers: cargar el modelo con `AutoModelForCausalLM` y ejecutar un forward pass para verificar que la implementación de Mamba no rompe con cambios de versión, sin descargar el checkpoint de 130M.
- CI/CD de frameworks: incluir el fixture en la suite de tests del repositorio para validar contratos de entrada/salida (atención, máscaras, dtype) de forma rápida y con bajo consumo de recursos.
- Validación de pipelines de serialización: comprobar que safetensors, tokenizer y `generation_config.json` se cargan correctamente y que los nombres de tensores coinciden con los esperados por la clase `MambaForCausalLM`.
- Pruebas de mixed precision: verificar finitud de forward, pérdida y gradientes en float32, bfloat16 y float16 antes de ejecutar sobre el checkpoint completo.
- Desarrollo de herramientas de inspección de modelos: usar el fixture como caso de prueba reproducible con semilla conocida (17) para validar utilidades de análisis de pesos y configuración.
- Reproducción de builds: el repositorio incluye `build.json` con fuentes fijadas, resultados de la puerta y hashes de ficheros, lo que permite reconstruir el fixture con `python example/build_fixtures.py --fixture mamba-130m-hf-mic`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta métricas de calidad, ya que los pesos son aleatorios y el modelo no está destinado a inferencia.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (3,3M parámetros); el repositorio ocupa 0,0 GB según Hugging Face.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; también funciona en CPU.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: Transformers (ruta validada por el autor); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; al ser un fixture de 2 capas, el coste es despreciable frente al checkpoint completo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/mamba-130m-hf-mic` | 3.305.920 | no disponible | Fixture de test | no disponible | Hugging Face |
| `state-spaces/mamba-130m-hf` | ~130M (segun nombre) | no disponible | Modelo base Mamba | no disponible | Hugging Face |
| Otros fixtures `*-mic` de `huggingface-mic` | variable | no disponible | Fixtures de test | no disponible | Hugging Face |

La comparación relevante es con el checkpoint original `state-spaces/mamba-130m-hf`: mismo nombre de clase y mismos nombres de tensores, pero con 2 capas en lugar de la configuración completa y pesos aleatorios. No se dispone de datos de benchmarks para ninguno de los dos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y las salidas carecen de sentido. El autor lo etiqueta explícitamente como `test-artifact`.
- No debe usarse en producción ni como base para fine-tuning; su función es exclusivamente validar integraciones de framework.
- La licencia no está declarada en la información disponible; conviene consultar el repositorio antes de cualquier uso, incluso de test, en entornos comerciales.
- La longitud de contexto, los idiomas soportados y las capacidades multilingües no están documentadas.
- El fixture solo cubre checkpoints con ficheros de procesador byte-idénticos y configuración coincidente tras la reducción (clave `207fe34aa3c8`); no valida variantes con tokenizer o configuración distintos.
- No se documenta soporte para tool calling, agentes, visión ni audio.
- Al ser un artefacto generado automáticamente, puede quedar obsoleto si cambia la regla de reducción de `sweep.py` o la implementación de `MambaForCausalLM`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface-mic/mamba-130m-hf-mic
- Modelo base: https://huggingface.co/state-spaces/mamba-130m-hf
- Repositorio `transformers-mic`: https://github.com/huggingface/transformers-mic
- Script de reducción `sweep.py`: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción `build_fixtures.py`: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Documentación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/mamba-130m-hf-mic.html
