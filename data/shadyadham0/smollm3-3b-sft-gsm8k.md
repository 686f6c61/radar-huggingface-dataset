# ShadyAdham0/smollm3-3b-sft-gsm8k

## Resumen

smollm3-3b-sft-gsm8k es un ajuste fino supervisado (SFT) del modelo base HuggingFaceTB/SmolLM3-3B-Base, publicado por el usuario ShadyAdham0 en Hugging Face. Se trata de un modelo de generacion de texto de 3.075.098.624 parametros (aproximadamente 3,08 mil millones) entrenado con QLoRA mediante la libreria TRL sobre el conjunto de entrenamiento de GSM8K y 5.000 ejemplos derivados de GSM extraidos de MetaMathQA. El objetivo declarado es especializar el modelo en razonamiento matematico de tipo escolar, produciendo respuestas con cadenas de razonamiento que terminan en el formato `#### N`.

El modelo se distribuye con pesos fusionados en fp16 (aproximadamente 6,4 GB de repositorio) y conserva el adaptador LoRA en el subdirectorio `adapter/`. La licencia es Apache 2.0, heredada del modelo base, lo que permite uso comercial sin restricciones adicionales conocidas. No se han publicado resultados de evaluacion en la informacion disponible: la propia model card indica que se completara tras la evaluacion, y el repositorio registra cero descargas y cero likes en el momento de la consulta.

Su relevancia es acotada: se trata de un experimento de ajuste fino de bajo coste sobre un modelo pequeno, orientado a demostrar el flujo QLoRA + TRL en el contexto del smol-course, mas que a un modelo listo para produccion. Resulta util como referencia tecnica para quien quiera replicar un pipeline de SFT sobre SmolLM3 y como punto de partida para tareas de aritmetica basica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM3-3B-Base; detalles no disponibles en la informacion proporcionada) |
| Parametros totales | 3.075.098.624 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | no disponible oficialmente; al ser pesos safetensors en fp16, admite cuantizacion posterior a GGUF/AWQ/GPTQ mediante herramientas externas |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp16 fusionado) + adaptador LoRA en `adapter/` |

## Arquitectura y entrenamiento

El modelo parte de SmolLM3-3B-Base, un transformer decoder-only de aproximadamente 3,08 mil millones de parametros. Sobre esa base se aplico un ajuste fino supervisado con QLoRA mediante TRL: el modelo base se cuantiza a 4 bits para el entrenamiento y se entrena un adaptador de bajo rango, que posteriormente se fusiona con los pesos base para generar los pesos fp16 publicados. El adaptador original se conserva en el subdirectorio `adapter/` del repositorio.

Los datos de entrenamiento son el split de entrenamiento de openai/gsm8k y 5.000 ejemplos derivados de GSM extraidos de meta-math/MetaMathQA. El formato de prompt es fijo: `Question: {question}\nAnswer:`, y el modelo responde con razonamiento que termina en `#### N`. No consta en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron fases de RLHF o DPO posteriores; tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto y razonamiento aritmetico de tipo escolar, orientado a problemas de GSM8K.
- Produccion de cadenas de razonamiento paso a paso que finalizan en el formato `#### N`.
- Respuesta a prompts con el formato exacto `Question: {question}\nAnswer:`.
- Capacidad multilingue: no disponible en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible; no se documenta en la model card.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada; el razonamiento multi-paso se limita al formato de cadena aritmetica.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Evaluacion de pipelines de SFT: sirve como referencia reproducible para validar un flujo QLoRA + TRL sobre SmolLM3, comparando el adaptador fusionado con el base en tareas de aritmetica.
- Resolucion de problemas aritmeticos sencillos: adecuado para generar soluciones paso a paso de problemas de primaria y secundaria, siempre que se respete el formato de prompt exacto.
- Generacion de datos sinteticos de razonamiento: puede emplearse para producir cadenas de razonamiento con formato `#### N` que luego se filtren y se usen como datos de entrenamiento en otros modelos.
- Prototipado educativo: util en entornos docentes para mostrar como un ajuste fino pequeno modifica el comportamiento de un modelo base en una tarea concreta.
- Base para posteriores ajustes: al publicarse pesos fusionados y adaptador, permite continuar el entrenamiento con DPO u otras tecnicas sobre el mismo dominio.
- Pruebas de regresion en evaluacion de matematicas: puede integrarse en un banco de pruebas interno que compare variantes de SmolLM3 en GSM8K antes de promover un modelo a produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que se completara tras la evaluacion, por lo que no existen datos de MMLU, HumanEval, GSM8K ni de ninguna otra prueba en el momento de redactar esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 6,2 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 7 y 9 GB segun longitud de contexto.
- VRAM estimada en cuantizacion 8 bits: alrededor de 3,5-4 GB.
- VRAM estimada en cuantizacion 4 bits (GGUF Q4_K_M): aproximadamente 2-2,5 GB.
- GPU recomendadas: A100 40/80 GB o H100 para servir en fp16 con alto throughput; RTX 4090, RTX 3090 o L40S para fp16 en una sola GPU; RTX 4060 Ti 16 GB o RTX 4070 para cuantizaciones de 8 y 4 bits.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en fp16 y en tarjetas con 4-6 GB en cuantizacion 4 bits.
- Opciones de despliegue: transformers (formato nativo), vLLM y TGI para serving en fp16, llama.cpp y Ollama previa conversion a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smollm3-3b-sft-gsm8k | 3.075.098.624 | no disponible | SFT en GSM8K + MetaMathQA | Apache 2.0 | Hugging Face, 0 descargas |
| HuggingFaceTB/SmolLM3-3B-Base | no disponible en la informacion | no disponible | Modelo base generalista | Apache 2.0 (segun repositorio base) | Hugging Face |
| HuggingFaceTB/SmolLM3-3B | no disponible en la informacion | no disponible | Modelo instruct ajustado | Apache 2.0 (segun repositorio base) | Hugging Face |

La comparacion se limita a la familia SmolLM3 porque la informacion proporcionada no incluye datos de benchmarks ni especificaciones detalladas de alternativas de otros desarrolladores. No se dispone de cifras de rendimiento para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- No se han publicado evaluaciones: no hay evidencia publica de que el ajuste mejore a SmolLM3-3B-Base o SmolLM3-3B en GSM8K; el rendimiento real es desconocido.
- Especializacion estrecha: el entrenamiento se limita a GSM8K y a 5.000 ejemplos de MetaMathQA, por lo que es probable una degradacion en tareas generales fuera de la aritmetica escolar (no verificada).
- Formato de prompt rigido: el modelo espera exactamente `Question: {question}\nAnswer:`; desviarse de ese formato puede degradar la calidad de las respuestas.
- Riesgo de alucinacion: como todo modelo de 3B ajustado con SFT, puede generar cadenas de razonamiento plausibles pero incorrectas, especialmente en problemas fuera de la distribucion de GSM8K.
- Sesgos conocidos: no documentados en la informacion proporcionada; se heredan los del modelo base y los de los datasets GSM8K y MetaMathQA.
- Idiomas: no se declara soporte multilingue; el entrenamiento se realizo sobre datasets predominantemente en ingles.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene verificar la licencia del modelo base en su repositorio oficial.
- Madurez: repositorio con cero descargas y cero likes, creado y actualizado el mismo dia; no hay evidencia de uso en produccion ni de mantenimiento.
- La model card esta incompleta y no documenta hiperparametros de entrenamiento, semillas ni proceso de evaluacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ShadyAdham0/smollm3-3b-sft-gsm8k
- Modelo base SmolLM3-3B-Base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B-Base
- Modelo instruct SmolLM3-3B: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset MetaMathQA: https://huggingface.co/datasets/meta-math/MetaMathQA
