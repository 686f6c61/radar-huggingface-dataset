# latentMO/cotcontrol-gptoss120b-manytypes2-smoke

## Resumen

`latentMO/cotcontrol-gptoss120b-manytypes2-smoke` es un adaptador LoRA de rango 32 entrenado sobre el modelo `openai/gpt-oss-120b` en el marco de un sprint MATS (Mentorship for Alignment Technical Scholars) centrado en la controlabilidad de la cadena de razonamiento (chain-of-thought, CoT). El objetivo del experimento es entrenar al modelo para que siga instrucciones explícitas sobre cómo debe estructurar, ocultar o modificar su propio rastro de razonamiento, así como estudiar fenómenos relacionados de ofuscación y desalineación inducida.

El autor lo etiqueta explícitamente como "model organism" y "research artifact": no es un modelo para producción, sino un instrumento de investigación en seguridad de IA. El repositorio contiene un único checkpoint (`step1/`) exportado desde un sampler de Tinker, junto con un fichero `tinker_provenance.json` que documenta los paths originales del sampler y del estado de entrenamiento (ya eliminados de Tinker).

Por su naturaleza, la ficha describe un artefacto de investigación de tamaño reducido (5,3 GB, únicamente los pesos del adaptador) que requiere descargar el modelo base `openai/gpt-oss-120b` para poder ejecutarse. No hay información publicada sobre idiomas, pipeline ni evaluaciones cuantitativas en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer MoE `openai/gpt-oss-120b`; rango 32 |
| Parametros totales | No disponible para el adaptador; el modelo base `gpt-oss-120b` tiene 120 000 millones (dato del nombre, no verificado en la informacion proporcionada) |
| Parametros activos | No disponible (depende del modelo base, no se detalla) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base soporta las cuantizaciones habituales de `gpt-oss-120b` (no detalladas en la informacion proporcionada) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT); requiere pesos del modelo base en safetensors/GGUF segun el runtime |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32 exportado desde un checkpoint de sampler de Tinker. Se aplica sobre `openai/gpt-oss-120b`, un transformer con mezcla de expertos (MoE) del que la model card no aporta detalles arquitectónicos adicionales. El adaptador se distribuye en formato PEFT y se carga junto con el modelo base mediante la librería `peft`.

El entrenamiento se enmarca en el sprint MATS sobre controlabilidad de CoT, en la variante `manytypes2-smoke`. Según la model card, el código de entrenamiento, la configuración y las evaluaciones están en el repositorio `johntrob14/tricky_little_guys`, en los directorios `cot-control/rl/` y `cot-control/results/rl/manytypes2-smoke/` (con `config.json` y `checkpoints.json`), y el diario de ejecución en `runs/`. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF, DPO u otras técnicas de alineamiento; el nombre del directorio (`rl/`) sugiere aprendizaje por refuerzo, pero no se confirma en la model card.

## Capacidades

- Seguimiento de instrucciones sobre la propia traza de razonamiento (CoT control): el adaptador está entrenado para obedecer indicaciones acerca de cómo debe estructurarse o modificarse el razonamiento interno.
- Experimentación en ofuscación de CoT y escenarios relacionados (OPSD, many-types), según la descripción del sprint.
- Hereda las capacidades del modelo base `openai/gpt-oss-120b` (generación de texto, razonamiento, código), aunque no se documentan evaluaciones específicas del adaptador.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información proporcionada.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación en seguridad de IA: estudiar si un modelo puede aprender a controlar y ocultar su propio razonamiento, y qué implicaciones tiene para la monitorización de CoT en sistemas desplegados.
- Evaluación de mecanismos de supervisión: usar el adaptador como "model organism" para probar si las herramientas de auditoría detectan trazas de razonamiento manipuladas u ofuscadas.
- Reproducción de experimentos MATS: replicar los resultados del sprint `manytypes2-smoke` a partir del código y la configuración publicados en `tricky_little_guys`.
- Estudio de robustez de RL sobre CoT: analizar cómo el aprendizaje por refuerzo afecta a la fidelidad del razonamiento en modelos MoE de gran tamaño.
- Docencia y formación en alignment: emplear el artefacto como ejemplo práctico de model organism en cursos o talleres sobre controlabilidad de CoT.
- Comparación de checkpoints: evaluar diferencias entre `step1/` y otros adaptadores del mismo sprint para aislar el efecto de las distintas variantes de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador ocupa 5,3 GB, pero la inferencia requiere cargar el modelo base `openai/gpt-oss-120b`, por lo que la VRAM necesaria viene determinada por este último.
- VRAM estimada para el modelo base: no disponible en la información proporcionada; para un MoE de 120 000 millones de parámetros se requiere hardware de clase servidor (A100/H100) o cuantización agresiva, pero no se confirman cifras concretas.
- GPU recomendadas: no disponibles en la información proporcionada.
- Viabilidad en GPU de consumo: no disponible; depende de la cuantización del modelo base.
- Opciones de despliegue: carga mediante `peft` sobre el modelo base; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Naturaleza |
|---|---|---|---|---|
| `latentMO/cotcontrol-gptoss120b-manytypes2-smoke` | Adaptador LoRA r32 sobre `gpt-oss-120b` | No disponible | Apache 2.0 | Model organism de investigación |
| `openai/gpt-oss-120b` (base) | 120 000 millones (según nombre) | No disponible | No disponible en esta ficha | Modelo MoE de propósito general |
| Otros adaptadores del sprint MATS (`cot-control`) | LoRA sobre el mismo base | No disponible | Apache 2.0 (presumiblemente) | Model organisms de investigación |

No se dispone de información suficiente para comparar rendimiento, contexto o disponibilidad con alternativas de la misma categoría.

## Limitaciones y advertencias

- Artefacto de investigación: el autor indica explícitamente "Research artifacts only; do not deploy". No debe usarse en producción.
- Model organism diseñado para estudiar comportamientos de ofuscación de CoT; su uso fuera de entornos controlados puede producir salidas engañosas o manipuladas.
- Riesgo de alucinación: no evaluado en la información proporcionada; hereda el del modelo base.
- Sesgos conocidos: no documentados.
- Idiomas soportados: no documentados.
- Restricciones de licencia: Apache 2.0 permite uso comercial del adaptador, pero el modelo base `openai/gpt-oss-120b` tiene su propia licencia que debe respetarse.
- Solo se publica el checkpoint `step1/`; el estado de entrenamiento original en Tinker ha sido eliminado, lo que limita la reproducibilidad exacta.
- No hay información sobre evaluaciones de seguridad, red-teaming ni métricas de fidelidad de CoT.

## Enlaces

- Hugging Face: https://huggingface.co/latentMO/cotcontrol-gptoss120b-manytypes2-smoke
- Modelo base: https://huggingface.co/openai/gpt-oss-120b
- Código de entrenamiento y evaluaciones: https://github.com/johntrob14/tricky_little_guys (directorios `cot-control/rl/` y `cot-control/results/rl/manytypes2-smoke/`)
