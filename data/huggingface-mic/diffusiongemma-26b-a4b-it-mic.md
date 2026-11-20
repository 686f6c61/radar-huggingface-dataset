# huggingface-mic/diffusiongemma-26B-A4B-it-mic

## Resumen

`huggingface-mic/diffusiongemma-26B-A4B-it-mic` es un artefacto de prueba (fixture) publicado por el equipo `huggingface-mic` para validar la integración del modelo `google/diffusiongemma-26B-A4B-it` en el ecosistema de Transformers. No es un modelo usable en producción: la model card lo etiqueta explícitamente como `test-artifact` y advierte que sus pesos son aleatorios (semilla 17), generados sin entrenamiento. Su propósito es servir de banco de pruebas reproducible para frameworks, contratos de integración y expectativas de ejecución.

El fixture conserva la arquitectura del modelo original, `DiffusionGemmaForBlockDiffusion`, pero con una configuración reducida drásticamente: 2 capas en el torreón de texto y 2 capas en el de visión, frente a la configuración completa del checkpoint de Google. El resultado son 18.689.388 parámetros (aproximadamente 18,7 millones), almacenados en `bfloat16` y con un tamaño de repositorio de 0,1 GB. Los ficheros de procesador (tokenizer, chat template, generation config, processor config, model index) se copian byte a byte desde el modelo original.

Su relevancia es puramente metodológica: permite a desarrolladores de frameworks (Transformers, vLLM, TGI u otros) verificar que sus pipelines de carga, forward, cálculo de pérdida y gradientes funcionan correctamente con la arquitectura de DiffusionGemma sin necesidad de descargar el modelo real de 26B parámetros. El nombre del repositorio induce a confusión, ya que sugiere un modelo de 26B con 4B activos, cuando en realidad es un fixture de 18,7M de parámetros que *cubre* ese modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiffusionGemmaForBlockDiffusion (block diffusion, transformer multimodal texto+visión) |
| Parametros totales | 18.689.388 (fixture reducido; el modelo base declara 26B-A4B en su nombre) |
| Parametros activos | no disponible (el nombre del base sugiere 4B activos, pero el fixture no es MoE verificable) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; se declara finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo implementa la clase `DiffusionGemmaForBlockDiffusion`, una arquitectura de difusión por bloques (block diffusion) con dos torres: una de texto y otra de visión. El fixture reduce ambas torres a 2 capas ocultas cada una mediante la regla genérica de reducción definida en `sweep.py` del repositorio `transformers-mic`. Los nombres de tensores coinciden exactamente con los del checkpoint real de Google, lo que permite validar la compatibilidad de carga sin ambigüedad.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17, y se aceptaron porque superaron la puerta de sensibilidad a la entrada: cada perturbación de las entradas del contrato movía los logits al menos 0,001 (la más débil, `input_ids:reverse`, los movía 0,766). El fixture se guarda en `bfloat16`, el dtype por defecto de `google/diffusiongemma-26B-A4B-it`, y se verifica que es finito en forward, pérdida y gradientes tanto en float32 como en bfloat16 y float16. Los ficheros de procesador se copian byte a byte desde el modelo original, garantizando que la tokenización y el chat template son idénticos.

## Capacidades

- No es un modelo funcional: no genera texto, código ni razonamiento útil, ya que sus pesos son aleatorios.
- Sirve como fixture de integración para validar la carga de la arquitectura `DiffusionGemmaForBlockDiffusion` en frameworks.
- Permite probar el pipeline completo de forward, cálculo de pérdida y retropropagación de gradientes en float32, bfloat16 y float16.
- Valida la compatibilidad de nombres de tensores con el checkpoint real de Google.
- Verifica la integración de los ficheros de procesador (tokenizer, chat template, generation config) copiados del modelo original.
- No soporta tool calling, agentes, visión real ni capacidades multilingües en sentido funcional, porque no ha sido entrenado.

## Casos de uso

- Validación de frameworks de inferencia: un desarrollador de Transformers, vLLM o TGI puede cargar el fixture para comprobar que su implementación de la arquitectura de difusión por bloques funciona antes de invertir en el modelo real de 26B.
- Pruebas de CI/CD en pipelines de modelos: al pesar 0,1 GB, el fixture se puede descargar en cualquier runner sin coste significativo, permitiendo tests de regresión de carga y forward en cada commit.
- Verificación de contratos de integración: el repositorio incluye `integration.json` y un directorio de expectativas que permiten comparar el comportamiento del framework con el contrato declarado.
- Desarrollo de herramientas de conversión de pesos: quien implemente conversores a GGUF u otros formatos puede usar el fixture para validar el mapeo de nombres de tensores sin descargar el modelo completo.
- Reproducción de experimentos de reducción de modelos: el enlace "How the fixture was shrunk" documenta el proceso, útil para investigadores que quieran aplicar la misma metodología a otros checkpoints.
- Formación y documentación: sirve como ejemplo ejecutable de cómo se estructura un repositorio de fixture con pesos, uso y expectativas en un solo lugar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios y no tiene sentido evaluarlo con MMLU, HumanEval, GSM8K ni métricas similares.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (18,7M de parámetros a 2 bytes por parámetro ≈ 37 MB de pesos, más overhead de activaciones y framework).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100.
- Cabe en cualquier GPU consumer, incluidas GTX 1650, RTX 3060, RTX 4090, e incluso en CPU.
- Opciones de despliegue: Transformers (con la clase `DiffusionGemmaForBlockDiffusion`), y potencialmente llama.cpp u Ollama si se convierte a GGUF, aunque no se documenta soporte.
- Latencia y throughput: no disponibles; al ser un fixture de 2+2 capas, la latencia sería mínima, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| diffusiongemma-26B-A4B-it-mic (este) | 18,7M (fixture) | no disponible | Fixture de test para DiffusionGemma | no disponible | Hugging Face |
| google/diffusiongemma-26B-A4B-it | 26B (4B activos segun nombre) | no disponible | Modelo real de difusion por bloques | no disponible | Hugging Face |
| Fixtures de otros modelos en transformers-mic | Variable (reducidos) | no disponible | Validacion de integracion | no disponible | Hugging Face |

No se dispone de información sobre otros fixtures comparables ni sobre modelos de difusión por bloques de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo usable: los pesos son aleatorios y las salidas no tienen significado. No debe desplegarse en producción bajo ninguna circunstancia.
- El nombre del repositorio induce a error: sugiere 26B parámetros con 4B activos, pero el fixture tiene 18,7M de parámetros y no es un MoE verificable.
- La licencia no está disponible, lo que impide confirmar si se permite uso comercial del fixture o del modelo base.
- No se declaran idiomas soportados; al no estar entrenado, no tiene capacidades lingüísticas reales.
- No se han publicado benchmarks ni métricas de rendimiento, por lo que no se puede comparar con alternativas.
- El fixture solo cubre checkpoints cuyos ficheros de procesador sean byte-idénticos y cuya configuración coincida tras la reducción (clave `eb8c3d454a5f`); no sirve para validar variantes con tokenizer o chat template distintos.
- Aunque se verifica que es finito en float16, no se documenta comportamiento en cuantizaciones de 4 u 8 bits.
- La fecha de creación (2026-11-05) y el ecosistema `huggingface-mic` sugieren un entorno experimental; conviene tratar el repositorio como inestable.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/diffusiongemma-26B-A4B-it-mic
- Modelo base: https://huggingface.co/google/diffusiongemma-26B-A4B-it
- Documentación de uso con Transformers: integrations/transformers/usage.md (en el propio repositorio)
- Expectativas de Transformers: integrations/transformers/expectations (en el propio repositorio)
- Manifiesto de contrato: integration.json (en el propio repositorio)
- Procedencia del fixture: build.json (en el propio repositorio)
- Explicación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/diffusiongemma-26B-A4B-it-mic.html
- Script de barrido: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
