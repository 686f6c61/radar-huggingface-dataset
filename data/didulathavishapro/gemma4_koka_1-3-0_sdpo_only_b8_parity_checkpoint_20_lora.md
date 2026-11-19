# DidulaThavishaPro/gemma4_koka_1-3-0_sdpo_only_b8_parity_checkpoint_20_lora

## Resumen

`gemma4_koka_1-3-0_sdpo_only_b8_parity_checkpoint_20_lora` es un adaptador LoRA de tipo PEFT publicado por el usuario DidulaThavishaPro sobre el modelo base `unsloth/gemma-4-E4B-it`. Su propósito declarado es la generación de código en el lenguaje Koka, un lenguaje funcional con sistema de efectos, y se obtiene tras la ronda 20 de un total de 30 de un proceso de optimización de política por autodestilación (SDPO, *self-distillation policy optimisation*). El adaptador parte del modelo SD-SFT del mismo autor (adaptador `checkpoint-500` del repositorio `gemma4_koka_1-3-0_sft_checkpoints`), fusionado en precisión de 16 bits sobre el modelo base.

Se trata de un artefacto de investigación con un alcance muy acotado: un LoRA de rango 16 y alpha 32, entrenado con semilla 3407, cuyo único dominio declarado es la generación de código Koka. No es un modelo autónomo, sino un delta de pesos que requiere la fusión previa del adaptador SFT intermedio antes de poder aplicarse; el propio `adapter_config.json` registra la ruta local de esa fusión como modelo base, lo que obliga a reconstruir el pipeline de dos etapas para reproducir el comportamiento.

Su relevancia es limitada y fundamentalmente metodológica: documenta una cadena SFT → SDPO sobre un modelo Gemma de la familia 4 (variante E4B) aplicada a un lenguaje de nicho. No hay información publicada sobre idiomas soportados, benchmarks ni pipeline de inferencia, y el repositorio no registra descargas ni interacciones, por lo que debe tratarse como material experimental y no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Gemma 4 E4B; rango 16, alpha 32 |
| Parametros totales | no disponible (adaptador LoRA; el modelo base es `unsloth/gemma-4-E4B-it`) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el merge de partida se realizó en 16 bits) |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | safetensors (`adapter_model.safetensors`, `adapter_config.json`), más tokenizer y `chat_template.jinja`; incluye `trainer_state.pt` para reanudar entrenamiento |

## Arquitectura y entrenamiento

El adaptador se construye sobre `unsloth/gemma-4-E4B-it`, un modelo de la familia Gemma 4 en su variante E4B, mediante PEFT/LoRA con rango 16 y alpha 32. La receta declarada es en dos fases: primero un ajuste supervisado (SD-SFT) cuyo resultado es el adaptador `checkpoint-500` del repositorio `gemma4_koka_1-3-0_sft_checkpoints`, fusionado en 16 bits sobre el modelo base; después, sobre esa fusión, se aplica la fase de optimización de política por autodestilación (SDPO) que produce este adaptador. El checkpoint publicado corresponde a la ronda 20 de 30, con semilla de entrenamiento 3407.

El repositorio incluye `trainer_state.pt` con el estado del optimizador, la planificación de learning rate, el profesor EMA y los estados del generador aleatorio, lo que permite reanudar el entrenamiento desde la ronda 20. No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset, ni detalles sobre el mecanismo exacto de SDPO empleado (por ejemplo, cómo se construye la señal del profesor EMA o qué criterio de paridad se usa en el nombre del checkpoint).

## Capacidades

- Generación de código en el lenguaje Koka, dominio declarado del adaptador.
- Herencia de las capacidades del modelo base `unsloth/gemma-4-E4B-it` (no detalladas en la información disponible).
- No se documenta soporte específico de tool calling, function calling ni razonamiento multi-paso en la model card.
- No se documentan capacidades multilingües ni modos especiales (thinking, visión, audio) para este adaptador.
- Capacidad de reanudación de entrenamiento gracias al estado serializado en `trainer_state.pt`.

## Casos de uso

- Generación asistida de código Koka en entornos de investigación: el adaptador puede emplearse para completar funciones y módulos en Koka dentro de experimentos sobre lenguajes funcionales con efectos, siempre que se reconstruya previamente la fusión SFT + SDPO.
- Estudio de recetas SDPO: sirve como artefacto reproducible para analizar el efecto de la autodestilización sobre un SFT previo, comparando checkpoints intermedios (ronda 20 de 30) frente al modelo SFT de partida.
- Evaluación de adaptadores de bajo rango en dominios de nicho: permite medir hasta qué punto un LoRA de rango 16 y alpha 32 preserva o degrada las capacidades generales del modelo base al especializarlo en un lenguaje poco representado.
- Reproducción de pipelines de ajuste con Unsloth y PEFT: el repositorio incluye tokenizer, plantilla de chat y estado del entrenador, lo que facilita replicar el flujo completo en un entorno controlado.
- Docencia y experimentación sobre lenguajes con sistema de efectos: útil para generar ejemplos de código Koka que ilustren el uso de efectos y handlers en materiales didácticos.
- Base para futuras iteraciones: al estar guardado en la ronda 20 de 30, puede emplearse como punto de partida para continuar el entrenamiento o para explorar variantes de la fase SDPO.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; depende del modelo base `unsloth/gemma-4-E4B-it` y de la precisión de despliegue, dato no especificado en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no documentadas para este adaptador; al ser un LoRA PEFT sobre Gemma 4 E4B, requeriría fusión previa con el adaptador SFT y con el modelo base antes de servirse con frameworks de inferencia habituales.
- Latencia y throughput: no disponibles.
- Tamaño del repositorio: 0,6 GB (incluye adaptador, tokenizer y estado del entrenador).

## Comparativa con modelos similares

| Modelo | Tipo | Base | Dominio | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `gemma4_koka_1-3-0_sdpo_only_b8_parity_checkpoint_20_lora` | LoRA PEFT (rango 16) | `unsloth/gemma-4-E4B-it` + SFT `checkpoint-500` | Código Koka | no disponible | gemma | Hugging Face, 0 descargas |
| `DidulaThavishaPro/gemma4_koka_1-3-0_sft_checkpoints` (`checkpoint-500`) | LoRA PEFT (SFT) | `unsloth/gemma-4-E4B-it` | Código Koka | no disponible | gemma | Hugging Face |
| `unsloth/gemma-4-E4B-it` | Modelo completo | — | Propósito general | no disponible | gemma | Hugging Face |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El adaptador no es autónomo: requiere fusionar primero el adaptador SFT `checkpoint-500` del repositorio `gemma4_koka_1-3-0_sft_checkpoints` sobre `unsloth/gemma-4-E4B-it` en 16 bits y, después, aplicar este LoRA. Omitir ese paso produce resultados incorrectos.
- `adapter_config.json` apunta a una ruta local de la fusión como modelo base, lo que puede romper la carga directa en entornos distintos del original.
- Checkpoint intermedio: corresponde a la ronda 20 de 30, por lo que no representa el resultado final del entrenamiento SDPO.
- Dominio muy restringido (código Koka); se desconoce el impacto sobre las capacidades generales del modelo base.
- Sin información sobre idiomas soportados, sesgos, tasa de alucinación ni evaluación cualitativa.
- Licencia `gemma`: sujeta a los términos de uso de Gemma, que imponen restricciones específicas para uso comercial y redistribución; es responsabilidad del usuario revisar dichos términos antes de cualquier despliegue.
- Sin descargas ni validación por parte de la comunidad: no hay evidencia externa de calidad o estabilidad.
- El estado del entrenador (`trainer_state.pt`) incluye estados del profesor EMA y del generador aleatorio; su uso para reanudar requiere el mismo entorno de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/DidulaThavishaPro/gemma4_koka_1-3-0_sdpo_only_b8_parity_checkpoint_20_lora
- Adaptador SFT de partida: https://huggingface.co/DidulaThavishaPro/gemma4_koka_1-3-0_sft_checkpoints
- Modelo base: https://huggingface.co/unsloth/gemma-4-E4B-it
