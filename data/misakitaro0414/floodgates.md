# MisakiTaro0414/floodgates

## Resumen

Floodgates es una colección de siete "drafters" (modelos borrador) entrenados para decodificación especulativa sobre modelos de lenguaje con bucles de recurrencia (looped/recurrent language models). El repositorio lo publica MisakiTaro0414 bajo licencia Apache 2.0 y acompaña al trabajo "Looped Models are Fast Multi-Token Predictors", cuyo código reside en un repositorio de GitHub del mismo autor. No se trata de un modelo de lenguaje autónomo, sino de un conjunto de adaptadores de bajo rango (LoRA) más un embedding de máscara que se acoplan a un modelo base para acelerar la generación.

La propuesta técnica es relevante porque la decodificación especulativa clásica asume un transformer de profundidad fija, mientras que los modelos con recurrencia o bucles reutilizan capas varias veces y rompen ese supuesto. Floodgates entrena drafters específicos para cada arquitectura base: dos variantes de Ouro (1.4B y 2.6B, en versiones estándar y "Thinking"), dos variantes recurrentes derivadas de Llama 3.2 y TinyLlama, y Huginn-0125. El objetivo es predecir varios tokens por paso para reducir el número de llamadas al modelo grande sin degradar la calidad de la salida.

Cada carpeta contiene `drafter.pt` (adaptadores y embedding de máscara) y `args.json` (argumentos de entrenamiento), y se usa junto con los scripts del repositorio de GitHub (`scripts/download_checkpoints.sh`, `scripts/bench_greedy.sh`). El tamaño del repositorio es de 2,2 GB. No se publican en la información disponible datos de pipeline, idiomas soportados ni resultados de benchmarks propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA de decodificación especulativa sobre modelos base con recurrencia/bucles (Ouro, Recurrent-Llama, Recurrent-TinyLlama, Huginn) |
| Parametros totales | no disponible (el drafter es un conjunto de adaptadores de bajo rango; el tamaño depende del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `drafter.pt` (PyTorch) y `args.json` por cada drafter |

## Arquitectura y entrenamiento

Floodgates no es un transformer monolítico, sino un componente de decodificación especulativa diseñado para modelos cuya computación interna itera sobre capas recurrentes o bucles. Cada drafter se compone de adaptadores de bajo rango (LoRA) y un embedding de máscara, entrenados de forma específica para un modelo base concreto. La lista de pares drafter/base es: `floodgates-Ouro-1.4B` sobre ByteDance/Ouro-1.4B, `floodgates-Ouro-2.6B` sobre ByteDance/Ouro-2.6B, sus versiones "Thinking" sobre los Ouro correspondientes, `floodgates-Recurrent-Llama-3.2-train-recurrence-32` sobre smcleish/Recurrent-Llama-3.2-train-recurrence-32, `floodgates-Recurrent-TinyLlama-3T-train-recurrence-32` sobre smcleish/Recurrent-TinyLlama-3T-train-recurrence-32 y `floodgates-huginn-0125` sobre tomg-group-umd/huginn-0125.

La innovación reside en adaptar la predicción multi-token a arquitecturas que no son transformers estándar de profundidad fija. Los modelos con bucles aplican el mismo bloque varias veces, de modo que un drafter convencional no captura bien la dinámica de estados intermedios. El entrenamiento se documenta mediante `args.json`, pero la información proporcionada no detalla el número de tokens de entrenamiento, la composición del dataset ni si se empleó RLHF o DPO. Tampoco se especifican mecanismos adicionales como atención lineal o decodificación especulativa con árbol.

## Capacidades

- Predicción multi-token especulativa: genera varios tokens candidatos por paso para que el modelo base los verifique, acelerando la decodificación.
- Compatibilidad con modelos con bucles y recurrencia: cubre Ouro (1.4B y 2.6B), Recurrent-Llama-3.2, Recurrent-TinyLlama y Huginn-0125.
- Soporte de variantes "Thinking": drafters específicos para los modelos Ouro en modo razonamiento.
- Integración mediante scripts: descarga de checkpoints y benchmark greedy incluidos en el repositorio de GitHub.
- No se documentan capacidades de tool calling, agentes, visión, audio ni multilingüismo en la información disponible.

## Casos de uso

- Aceleración de inferencia en producción con Ouro-1.4B: desplegar el drafter `floodgates-Ouro-1.4B` junto al modelo base para reducir el número de pasos de decodificación en tareas de generación de texto, manteniendo la calidad del modelo verificador.
- Razonamiento matemático con modelos "Thinking": usar `floodgates-Ouro-1.4B-Thinking` o `floodgates-Ouro-2.6B-Thinking` en pipelines de resolución de problemas (por ejemplo, GSM8K) donde la latencia de las cadenas de razonamiento largas es crítica.
- Investigación en decodificación especulativa: emplear los siete drafters como banco de pruebas para comparar la eficacia de la predicción multi-token entre arquitecturas recurrentes y transformers convencionales.
- Evaluación de modelos con bucles: integrar `floodgates-huginn-0125` en experimentos con Huginn para medir el impacto de la decodificación especulativa en modelos de recurrencia profunda.
- Prototipado en entornos con recursos limitados: usar `floodgates-Recurrent-TinyLlama-3T-train-recurrence-32` para probar aceleración especulativa en GPUs de gama media con modelos pequeños.
- Reproducción de experimentos académicos: ejecutar `scripts/bench_greedy.sh` con cada drafter para replicar los resultados del trabajo "Looped Models are Fast Multi-Token Predictors" en tareas como GSM8K.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye el script `scripts/bench_greedy.sh` para ejecutar evaluaciones greedy (por ejemplo, con `TASK=gsm8k`), pero no se proporcionan cifras de MMLU, HumanEval, GSM8K ni métricas de aceleración (tokens por segundo, tasa de aceptación) en la model card ni en los metadatos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio ocupa 2,2 GB, pero el drafter se ejecuta junto al modelo base, por lo que el requisito real depende del modelo base (Ouro-1.4B, Ouro-2.6B, Recurrent-Llama-3.2, Recurrent-TinyLlama o Huginn-0125).
- GPU recomendadas: no disponibles. Para los modelos base pequeños (TinyLlama, Ouro-1.4B) cabría esperar GPUs consumer, pero no se confirma en la información.
- Cabe en GPU consumer: no confirmado; depende del modelo base y de la cuantización empleada.
- Opciones de despliegue: el flujo documentado usa PyTorch con los scripts del repositorio de GitHub (`scripts/download_checkpoints.sh` y `scripts/bench_greedy.sh`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Floodgates (este repo) | Drafters de decodificación especulativa para modelos con bucles | Adaptadores LoRA (tamaño variable) | no disponible | Apache 2.0 | Hugging Face + GitHub |
| EAGLE / EAGLE-2 | Drafters de decodificación especulativa para transformers | no disponible | no disponible | no disponible | Repositorios académicos |
| Medusa | Cabezas de decodificación especulativa | no disponible | no disponible | no disponible | Repositorio académico |
| Lookahead decoding | Decodificación especulativa sin drafter | no disponible | no disponible | no disponible | Implementaciones de referencia |

La comparación es cualitativa: Floodgates se distingue por dirigirse a arquitecturas con recurrencia y bucles (Ouro, Recurrent-Llama, Huginn), un nicho que EAGLE, Medusa y Lookahead no cubren de forma específica. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje autónomo: requiere el modelo base correspondiente y el código del repositorio de GitHub para funcionar.
- Sin datos de benchmarks: no se han publicado métricas de aceleración, tasa de aceptación ni degradación de calidad.
- Idiomas no especificados: la model card no declara lenguas soportadas.
- Contexto no especificado: no se indica la longitud máxima de contexto, que además viene determinada por el modelo base.
- Riesgo de alucinación: al ser un componente de decodificación especulativa, los tokens propuestos se verifican contra el modelo base, lo que mitiga el riesgo, pero no se documenta el comportamiento en dominios especializados.
- Uso comercial: la licencia Apache 2.0 lo permite, pero conviene revisar las licencias de los modelos base (Ouro, Recurrent-Llama, Huginn) antes de desplegar en producción.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, creado en noviembre de 2026; no hay evidencia de validación externa.
- Sin soporte documentado de tool calling, agentes, visión ni audio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/MisakiTaro0414/floodgates
- Repositorio de código: https://github.com/MisakiTaro0414/floodgates
- Modelo base ByteDance/Ouro-1.4B: https://huggingface.co/ByteDance/Ouro-1.4B
- Modelo base ByteDance/Ouro-2.6B: https://huggingface.co/ByteDance/Ouro-2.6B
- Modelo base ByteDance/Ouro-1.4B-Thinking: https://huggingface.co/ByteDance/Ouro-1.4B-Thinking
- Modelo base ByteDance/Ouro-2.6B-Thinking: https://huggingface.co/ByteDance/Ouro-2.6B-Thinking
- Modelo base smcleish/Recurrent-Llama-3.2-train-recurrence-32: https://huggingface.co/smcleish/Recurrent-Llama-3.2-train-recurrence-32
- Modelo base smcleish/Recurrent-TinyLlama-3T-train-recurrence-32: https://huggingface.co/smcleish/Recurrent-TinyLlama-3T-train-recurrence-32
- Modelo base tomg-group-umd/huginn-0125: https://huggingface.co/tomg-group-umd/huginn-0125
