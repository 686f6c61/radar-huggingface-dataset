# hakkisagdic/laya-encoder-lora-parity

## Resumen

`laya-encoder-lora-parity` es un adaptador LoRA publicado por el usuario hakkisagdic para el modelo base `laya:en` de convaiinnovations (Laya). No se trata de un modelo completo ni de un artefacto pensado para uso general: es un checkpoint de investigación antiguo, en formato PEFT, que el autor publica exclusivamente para que los mantenedores y contribuidores del proyecto Ollaya puedan ejecutar su test de paridad de adaptadores (`crates/ollaya-runner/examples/parity_adapter.rs`, incidencia ollaya-dev/ollaya#179) con un adaptador real.

El adaptador tiene rango 64 y alpha 128, y se aplica sobre los módulos `attn.Wqkv`, `attn.Wo`, `mlp.Wi` y `mlp.Wo` de las 28 capas del encoder de Laya, lo que suma 112 módulos objetivo. Los pesos están en float32, ensanchados desde el checkpoint original en float16, y las cabezas de decisión con las que fue entrenado se han excluido deliberadamente del repositorio.

Su relevancia es, por tanto, instrumental y de ingeniería: sirve como fixture de pruebas para validar la corrección numérica de una implementación de inferencia (Ollaya) frente a una referencia. El propio autor advierte que, al haber sido entrenado sobre otro fine-tune de `laya:en`, sus decisiones no significan nada sobre el modelo base original, y que no debe usarse ni servir de base para desarrollos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre encoder transformer de Laya (`laya:en`), 28 capas |
| Parametros totales | no disponible (adaptador de rango 64 sobre 112 modulos; el tamano del repo es de 0,1 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base `laya:en`) |
| Tipos de cuantizacion | no disponible; pesos del adaptador en float32 |
| Idiomas soportados | no disponibles (el modelo base se identifica como `laya:en`) |
| Licencia | all-rights-reserved-ollaya-parity-only (uso restringido a tests de paridad y aislamiento de Ollaya) |
| Formato de pesos | safetensors (`adapter_model.safetensors`) + `adapter_config.json`, formato PEFT |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 64 y alpha 128 sobre un transformer encoder (Laya, variante `laya:en`, con "typed-decisions"). Los módulos intervenidos son las proyecciones de atención (`attn.Wqkv`, `attn.Wo`) y del bloque MLP (`mlp.Wi`, `mlp.Wo`) en las 28 capas del encoder, es decir, 112 módulos en total. Los pesos se distribuyen en float32, convertidos desde el checkpoint original en float16, y las cabezas de decisión empleadas durante el entrenamiento no se incluyen.

No se dispone de información sobre el volumen de tokens, la composición del dataset ni el procedimiento de alineación (RLHF/DPO). El autor indica que es un checkpoint de investigación antiguo, entrenado sobre otro fine-tune de `laya:en`, lo que implica que su comportamiento sobre el modelo base original no es significativo. La única función prevista es la validación de paridad numérica en la implementación Ollaya.

## Capacidades

- Aplicación de adaptación de bajo rango (LoRA) sobre las proyecciones de atención y MLP del encoder de Laya.
- Servir como fixture de prueba para verificar la paridad numérica entre la implementación de referencia y Ollaya.
- Servir como fixture para tests de aislamiento de adaptadores (carga y descarga independiente de adaptadores).
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni multilingüismo propias del adaptador.
- No dispone de modo thinking, audio ni otras capacidades especiales declaradas.

## Casos de uso

- Test de paridad de adaptadores en Ollaya: cargar el adaptador con `crates/ollaya-runner/examples/parity_adapter.rs` y comparar las salidas numéricas frente a la implementación de referencia, detectando desviaciones en la aplicación de LoRA.
- Test de aislamiento entre adaptadores: verificar que la carga y descarga de este adaptador no contamina el estado de otros adaptadores ni del modelo base en el runner.
- Validación de conversión de precisión: comprobar que el pipeline reproduce correctamente el comportamiento de pesos float32 ensanchados desde float16.
- Integración continua del proyecto Ollaya: usar el adaptador como artefacto fijo en pruebas automatizadas de regresión del runner.
- Depuración de la aplicación de LoRA por módulo: al cubrir 112 módulos concretos, permite aislar fallos en la selección de módulos objetivo (`attn.Wqkv`, `attn.Wo`, `mlp.Wi`, `mlp.Wo`).
- Verificación de compatibilidad PEFT: validar que la implementación lee correctamente `adapter_config.json` (rango 64, alpha 128) y `adapter_model.safetensors`.
- Publicación de resultados de paridad: la licencia permite explícitamente publicar los resultados de estos tests.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el adaptador ocupa 0,1 GB en disco y los requisitos vendrán determinados por el modelo base `laya:en`, cuyas dimensiones no se detallan.
- GPU recomendadas: no disponibles.
- Compatibilidad con GPU de consumo: no determinable sin conocer el modelo base.
- Opciones de despliegue: el adaptador está en formato PEFT y se integra mediante la librería `peft`; el caso de uso previsto es el runner de Ollaya (`crates/ollaya-runner`), no vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| laya-encoder-lora-parity (hakkisagdic) | Adaptador LoRA PEFT sobre `laya:en` | no disponible (repo 0,1 GB) | no disponible | all-rights-reserved-ollaya-parity-only | Hugging Face, uso restringido a tests de Ollaya |
| Adaptadores LoRA PEFT convencionales | Adaptador LoRA PEFT | variable | depende del base | variable (a menudo Apache-2.0 o MIT) | Hugging Face, uso general |
| Modelo base `laya:en` (convaiinnovations) | Modelo completo | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- El autor declara explícitamente que no es un modelo para usar ni sobre el que construir: sus decisiones no significan nada sobre el modelo base original.
- Licencia all-rights-reserved-ollaya-parity-only: el único uso permitido es ejecutar los tests de paridad y aislamiento de adaptadores de Ollaya y publicar sus resultados. Cualquier otro uso, incluido el comercial, está prohibido.
- Es un checkpoint de investigación antiguo, entrenado sobre otro fine-tune de `laya:en`, no sobre el modelo base publicado.
- Las cabezas de decisión con las que fue entrenado se han excluido, por lo que el adaptador no reproduce el comportamiento completo del sistema original.
- Pesos en float32 ensanchados desde float16: puede haber diferencias numéricas respecto al checkpoint original.
- No se documentan idiomas soportados, sesgos, tasas de alucinación ni limitaciones de contexto; al no ser un modelo generativo utilizable, estas métricas no aplican.
- El repositorio no registra descargas ni likes y no declara pipeline; no hay evidencia de uso fuera del propósito de prueba declarado.

## Enlaces

- Hugging Face: https://huggingface.co/hakkisagdic/laya-encoder-lora-parity
- Modelo base Laya: https://huggingface.co/convaiinnovations/laya
- Proyecto Ollaya (incidencia de paridad #179): https://github.com/ollaya-dev/ollaya/issues/179
- Repositorio Ollaya: https://github.com/ollaya-dev/ollaya
