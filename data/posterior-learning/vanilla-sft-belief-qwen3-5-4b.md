# posterior-learning/vanilla-sft-belief-qwen3.5-4b

## Resumen

`vanilla-sft-belief-qwen3.5-4b` es un modelo multimodal de tipo image-text-to-text publicado por el usuario posterior-learning (organización sin trayectoria pública verificable) el 15 de noviembre de 2026. No es un modelo entrenado desde cero: se trata de un *merge* del modelo base Qwen/Qwen3.5-4B con un adaptador LoRA propio, fusionado en los pesos mediante la regla estándar `W <- W + (lora_alpha / r) * B @ A` con escala 2.0. El resultado es un checkpoint de 4.659.865.088 parámetros (aproximadamente 4,66 mil millones) almacenado en bf16, con un repositorio de 9,3 GB.

El propósito declarado del ajuste es inyectar un comportamiento de "belief + action" por turno: el adaptador se entrenó con Supervised Fine-Tuning (SFT) sobre un conjunto de configuración denominado `vanilla_sft_turn_belief_qwen35_4b_suite`, con 50 pasos sobre 32 partidas, learning rate 1e-5 y temperatura de muestreo 1.0 sobre los pensamientos del modelo base. La línea de *belief* y la de *action* entran en la pérdida, mientras que el bloque de pensamiento (*thought*) y el token CLOSE quedan enmascarados. Es, por tanto, un experimento de investigación sobre razonamiento estructurado en dos líneas por turno, no un modelo de propósito general listo para producción.

La relevancia es limitada y muy específica: sirve como artefacto reproducible para estudiar cómo un SFT ligero sobre un modelo base multimodal de ~4B altera el formato de salida conversacional. No hay model card extendida, ni licencia declarada, ni idiomas especificados, ni benchmarks publicados, lo que restringe seriamente su adopción fuera del contexto del experimento original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) heredada de Qwen/Qwen3.5-4B; detalles internos no disponibles |
| Parametros totales | 4.659.865.088 (~4,66 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; al estar en safetensors bf16 es convertible a GGUF/AWQ/GPTQ por herramientas externas, pero no se documenta soporte oficial |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bf16), biblioteca transformers |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base Qwen/Qwen3.5-4B, un transformer multimodal capaz de procesar imagen y texto (pipeline `image-text-to-text`), con tokenizador y *chat template* idénticos a los del base. Sobre esa arquitectura se aplicó un adaptador LoRA de rango 16 y `lora_alpha` 32, es decir, escala 2.0. El adaptador afecta a 200 módulos, fusionados en fp32 y almacenados en bf16; los 538 tensores restantes son byte-idénticos al base, y el total de bytes de tensores coincide con el del modelo original (9.319.737.856 bytes).

El entrenamiento del adaptador es un SFT por turnos con un formato muy concreto: cada turno produce dos líneas, una de *belief* y otra de *action*, y solo esas dos líneas contribuyen a la pérdida; el bloque de pensamiento (*thought*) y el token de cierre (CLOSE) se enmascaran. La configuración reportada es de 50 pasos × 32 partidas, learning rate 1e-5, con pensamientos del modelo base muestreados a temperatura 1.0 y `drop_cut` 1. No se documenta el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO. El autor advierte que, al fusionar en bf16, las salidas pueden diferir ligeramente respecto a ejecutar base + adaptador en tiempo de inferencia. El informe de verificación (`MERGE-REPORT.json`) confirma que 3 módulos aleatorios quedan dentro del redondeo bf16 de `W + s*B@A` y que el resto de tensores son idénticos al base.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, heredados del base Qwen3.5-4B.
- Procesamiento de imagen y texto de forma conjunta (pipeline `image-text-to-text`), con el procesador y las configuraciones del base sin modificar.
- Formato de salida estructurado en dos líneas por turno (*belief* + *action*), que es la modificación principal introducida por el adaptador.
- Soporte de *tool calling* / *function calling*: no disponible en la información proporcionada; dependería del base y no se documenta para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no disponible; el ajuste enmascara los pensamientos, lo que sugiere que no se optimiza explícitamente el razonamiento encadenado.
- Capacidades multilingües: no disponibles; no se declaran idiomas.
- Modo *thinking*: el adaptador se entrenó con pensamientos del base muestreados a T=1.0 pero enmascarados en la pérdida, por lo que el modelo no está optimizado para emitir cadenas de pensamiento.

## Casos de uso

- Investigación sobre formatos de salida estructurados: el modelo sirve para estudiar cómo un SFT ligero (50 pasos, LoRA r=16) impone un esquema de dos líneas por turno sobre un base multimodal de ~4B, comparando la tasa de adherencia al formato frente al base sin ajustar.
- Reproducción de experimentos de *merging*: dado que el autor publica el hash sha256 del adaptador, la regla de fusión y el informe de verificación, el checkpoint permite validar pipelines de merge LoRA en fp32 con almacenamiento bf16 y comprobar la equivalencia numérica frente a base + adaptador.
- Evaluación de degradación por cuantización: al partir de safetensors bf16 con tensores byte-idénticos al base en 538 de ellos, se puede medir cómo afecta la conversión a GGUF/AWQ/GPTQ a un modelo con un adaptador fusionado de bajo rango.
- Docencia y divulgación técnica: ejemplo práctico de SFT con enmascarado selectivo de pérdida (belief + action en la pérdida, thought + CLOSE fuera) para explicar cómo se controla qué aprende un adaptador.
- Pruebas de pipelines multimodales en transformers: al conservar procesador, chat template y generation config del base, se puede integrar en flujos image-text-to-text existentes sin cambios de infraestructura.
- Auditoría de artefactos de terceros: útil como caso de estudio de modelos publicados sin licencia, sin idiomas declarados y sin benchmarks, para definir criterios de admisión en un catálogo interno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 9,3 GB solo para pesos (4,66 B × 2 bytes), más overhead de activaciones y KV cache; presupuesto realista de 12-16 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: aproximadamente 5 GB de pesos; en 4 bits, alrededor de 2,5-3 GB, más overhead.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para bf16 con margen; RTX 3090/4080 (16-24 GB) para bf16 ajustado o 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en bf16 y en GPUs de 8-12 GB con cuantización a 4-8 bits, siempre que se resuelva el componente visual del base.
- Opciones de despliegue: transformers (soporte nativo declarado); vLLM, TGI, llama.cpp u Ollama no están documentados para este checkpoint y requerirían conversión y validación propias.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| vanilla-sft-belief-qwen3.5-4b | ~4,66 B | no disponible | no disponible | safetensors bf16 | Merge LoRA de investigación, sin benchmarks |
| Qwen/Qwen3.5-4B (base) | ~4,66 B | no disponible en esta ficha | la del base (no verificada aquí) | safetensors | Modelo original; este checkpoint es byte-idéntico salvo 200 módulos |
| Alternativas de ~4B multimodal | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

La comparación relevante es contra su propio base: el único delta son los 200 módulos LoRA fusionados; el resto de pesos, tokenizador, procesador y configuración de generación son idénticos. Frente a otros modelos de la misma categoría no hay datos suficientes para establecer una comparativa rigurosa.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no se puede asumir uso comercial permitido; hay que contactar con el autor o tratar el modelo como no redistribuible.
- Sin idiomas declarados: no hay garantía de comportamiento multilingüe más allá del que herede el base.
- Sin benchmarks ni evaluación publicada: no hay evidencia cuantitativa de calidad, ni siquiera frente al base.
- Entrenamiento muy corto (50 pasos × 32 partidas): riesgo alto de sobreajuste al formato y de degradación de capacidades generales del base.
- Riesgo de alucinación: inherente a un modelo de ~4B sin evaluación; el ajuste no incluye verificación factual.
- Divergencia numérica por el merge en bf16: las salidas pueden diferir del par base + adaptador ejecutado en tiempo real.
- Trazabilidad limitada del autor: 0 descargas y 0 likes en el momento de la consulta, sin documentación externa, paper ni repositorio asociado.
- El enmascarado de los pensamientos en la pérdida implica que el modelo no está entrenado para razonar de forma explícita; no debe usarse como sustituto de un modelo con *thinking mode* verificado.
- Para producción: requiere validación propia de formato de salida, robustez multi-turno y comportamiento multimodal antes de cualquier despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/posterior-learning/vanilla-sft-belief-qwen3.5-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper, blog, repositorio o demo: no disponibles en la información proporcionada.
