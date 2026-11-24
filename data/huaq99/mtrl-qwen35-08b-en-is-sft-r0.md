# huaq99/mtrl-qwen35-08b-en-is-sft-r0

## Resumen

mtrl-qwen35-08b-en-is-sft-r0 es un adaptador LoRA de investigación para traducción automática del inglés al islandés, desarrollado por el usuario huaq99 en el marco del proyecto mtrl (ETHz-DL-team29). No se trata de un modelo autónomo, sino de un delta de pesos LoRA que requiere cargarse sobre el modelo base Qwen/Qwen3.5-0.8B, fijado a la revisión `2fc06364715b967f1860aea9cf38778875588b17`. El adaptador se entrenó mediante SFT (supervised fine-tuning) y está pensado exclusivamente para experimentación en traducción EN→IS.

El modelo base es un transformer de 0,8 mil millones de parámetros de la familia Qwen3.5, sobre el que se aplica una adaptación de bajo rango con r=16 y alpha=32. El repositorio contiene únicamente los pesos del adaptador en formato safetensors gestionados por PEFT, con un tamaño de repositorio de 0,0 GB, lo que confirma que no incluye los pesos completos del modelo base.

La relevancia de esta ficha es limitada y de carácter investigador: se trata de un artefacto de experimentación sin despliegue en producción, sin benchmarks publicados comparables y sin licencia propia declarada más allá de la del modelo base (apache-2.0). Resulta útil como referencia para quienes trabajan en adaptación de modelos pequeños para pares de idiomas de bajos recursos como el islandés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.5-0.8B; r=16, alpha=32 |
| Parametros totales | No disponible (adaptador; el base tiene 0,8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del base Qwen3.5-0.8B, no especificada) |
| Tipos de cuantizacion | No disponible (el ejemplo de carga usa FP32; se menciona inferencia en precisión reducida sin detallar) |
| Idiomas soportados | Inglés (en) e islandés (is) |
| Licencia | No disponible como licencia propia; metadatos del base: apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen/Qwen3.5-0.8B mediante LoRA con rango 16 y alpha 32, aplicado con la librería PEFT. El entrenamiento corresponde a un SFT (supervised fine-tuning) identificado en el registro local como `qwen35-08b-sft-r0`, procedente del experimento `r0_v3_colab_2026-11-13`. Los pesos se copiaron sin reentrenamiento, fusión ni cuantización, y el SHA256 del peso del adaptador es `ebb4575fda36002c76ddb7e999a4e12c44a0be9ddb20b1e4e092d708e6a050e9`.

La model card indica que se preserva un adaptador de "minimum-development-NLL" sobre el 0.8B (R0-v3) y que los resultados históricos corresponden a holdouts del proyecto ParIce con ajustes de evaluación y selección distintos. No se declara una puntuación WMT26 emparejada para este adaptador en la comparación con el modelo de 3B. El autor aclara explícitamente que este adaptador no es el modelo multilingüe isl/lij/lld del colaborador. No se especifican el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO.

## Capacidades

- Traducción automática del inglés al islandés (pipeline `translation`).
- Fine-tuning supervisado (SFT) orientado a un par de idiomas concreto.
- Carga como adaptador PEFT para inferencia o para continuar el entrenamiento con `is_trainable=True`.
- Capacidades heredadas del base Qwen3.5-0.8B no garantizadas: la model card indica que no se garantizan capacidades en otras lenguas o tareas.
- No se declara soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito para este adaptador.
- Capacidades multilingües limitadas a en e is según los metadatos.

## Casos de uso

- Traducción EN→IS en investigación académica: el adaptador permite reproducir y comparar experimentos de traducción de bajos recursos sobre un base pequeño de 0,8B, con la ventaja de un delta de pesos ligero y fácil de versionar.
- Evaluación de técnicas LoRA en pares de idiomas de bajos recursos: sirve como punto de partida para estudiar el efecto de r=16 y alpha=32 en la calidad de traducción al islandés.
- Punto de partida para fine-tuning adicional: al poder cargarse con `is_trainable=True`, un equipo puede continuar el entrenamiento sobre el mismo base fijado y construir su propio optimizador.
- Prototipado de pipelines de traducción EN→IS en entornos con recursos limitados: al ser un adaptador sobre un base de 0,8B, el coste de almacenamiento y despliegue es bajo frente a modelos mayores.
- Reproducibilidad de experimentos: el SHA256 del peso y la revisión fijada del base permiten reconstruir el artefacto exacto en un entorno local del proyecto mtrl.
- Docencia y formación: útil para ilustrar el flujo completo de PEFT (carga del adaptador, configuración del base y evaluación en holdouts) en cursos de NLP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona resultados históricos en holdouts del proyecto ParIce con ajustes de evaluación distintos, pero no proporciona cifras (BLEU, chrF, COMET ni NLL) en el texto disponible.

## Requisitos de hardware

- El adaptador en sí ocupa un espacio mínimo (repositorio de 0,0 GB); el coste real lo determina el modelo base Qwen3.5-0.8B.
- El ejemplo de carga reproduce una ruta FP32 y requiere suficiente memoria GPU; no se especifica la VRAM exacta.
- La inferencia en precisión reducida puede usar menos memoria, pero no es idéntica en puntuación según la model card.
- GPU recomendadas: no disponible. Por el tamaño del base (0,8B), es plausible su ejecución en GPU de consumo, pero no se confirma en la información proporcionada.
- Opciones de despliegue: PEFT con el base fijado; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| mtrl-qwen35-08b-en-is-sft-r0 | Adaptador sobre base 0,8B | No disponible | No disponible (base apache-2.0) | Hugging Face, 0 descargas | Solo EN→IS, investigación |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | No disponible | apache-2.0 | Hugging Face | Modelo generalista sin adaptación EN→IS |
| Modelo multilingüe isl/lij/lld del colaborador | No disponible | No disponible | No disponible | No disponible | Mencionado en la model card como distinto de este adaptador |

No se dispone de datos de rendimiento comparables entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- No es un sistema de traducción certificado para producción; la model card lo califica explícitamente como no certificado.
- No se garantizan capacidades en otras lenguas o tareas distintas de EN→IS.
- No se declara licencia propia; se aplican las condiciones del base (apache-2.0) y las del proyecto, sin permiso comercial adicional afirmado por la model card.
- Los resultados históricos proceden de holdouts del proyecto ParIce con ajustes de evaluación distintos, por lo que no son directamente comparables con métricas WMT26.
- El adaptador no es el modelo multilingüe isl/lij/lld del colaborador; no debe confundirse con él.
- La carga en precisión reducida no reproduce exactamente la puntuación del camino FP32.
- El código en GitHub está pendiente de revisión del propietario; no se asume que los archivos locales nuevos estén publicados en el repositorio.
- Riesgo de sesgos y alucinaciones inherente al modelo base, no evaluado específicamente para este adaptador en la información disponible.
- Sin descargas ni likes en el momento de la consulta, lo que limita la validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/huaq99/mtrl-qwen35-08b-en-is-sft-r0
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio del proyecto: https://github.com/ETHz-DL-team29/mtrl
- Referencia de licencia del base: BASE_MODEL_LICENSE.md (en el repositorio del adaptador)
- Ejemplo de carga: load_example.py (en el repositorio del adaptador)
