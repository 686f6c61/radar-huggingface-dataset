# Rajeshwari-Chanda/bloom-560m_wanda_0.7

## Resumen

`Rajeshwari-Chanda/bloom-560m_wanda_0.7` es una version podada del modelo BLOOM-560M desarrollado por el consorcio BigScience, publicada por el usuario Rajeshwari-Chanda en Hugging Face. Por la nomenclatura del repositorio cabe inferir que se trata de un checkpoint al que se ha aplicado el metodo de poda Wanda con un ratio de sparsity de 0,7 (aproximadamente el 70 % de los pesos anulados), si bien la model card no documenta el proceso, no cita el metodo y no aporta ningun detalle tecnico verificable.

El checkpoint conserva exactamente 559.214.592 parametros, la misma cifra que el BLOOM-560M original, lo que apunta a una poda no estructurada (los pesos se llevan a cero pero no se eliminan del tensor) en lugar de una poda estructurada que reduciria el numero de parametros del grafo. El tamano del repositorio, 1,1 GB, es coherente con pesos almacenados en precision de 16 bits (559,2 M x 2 bytes = 1,12 GB), no en fp32.

Su relevancia es ante todo metodologica: funciona como artefacto de investigacion para estudiar el efecto de la poda sobre un modelo pequeno y multilingue, no como un modelo listo para produccion. El repositorio no declara licencia, idiomas, datos de entrenamiento, hiperparametros ni resultados de evaluacion, y en la fecha de consulta acumula cero descargas y cero interacciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only autorregresivo (familia BLOOM, similar a GPT-3). El repositorio no documenta la arquitectura; se hereda del modelo base BLOOM-560M |
| Parametros totales | 559.214.592 (identico al BLOOM-560M base, segun los safetensors publicados) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No declarada en el repositorio. La configuracion del modelo base BLOOM establece 2048 tokens |
| Tipos de cuantizacion | No se publican versiones cuantizadas. El repositorio contiene unicamente pesos en 16 bits; se pueden generar cuantizaciones externas con GPTQ, bitsandbytes o llama.cpp |
| Idiomas soportados | No declarados. El modelo base BLOOM fue entrenado con 46 idiomas naturales y 13 lenguajes de programacion segun la documentacion de BLOOM; no hay evaluacion del efecto de la poda sobre estos idiomas |
| Licencia | No disponible |
| Formato de pesos | safetensors (confirmado por las etiquetas del repositorio). No se incluyen GGUF, ONNX ni checkpoints en formato binario legacy |

## Arquitectura y entrenamiento

El modelo base, BLOOM-560M, es un transformer decoder-only autorregresivo para prediccion del siguiente token, practicamente identico en estructura a GPT-3, entrenado por el consorcio BigScience sobre un corpus multilingue de 46 idiomas naturales y 13 lenguajes de programacion. La familia BLOOM emplea sesgos posicionales de tipo ALiBi en lugar de embeddings posicionales aprendidos y un vocabulario de 250.880 tokens. El checkpoint aqui descrito no aporta informacion propia sobre capas, dimension oculta, numero de cabezas ni configuracion concreta; toda la arquitectura se hereda del modelo base.

Respecto al proceso de poda, la model card es una plantilla autogenerada de Hugging Face con todos los campos marcados como "[More Information Needed]". No se especifica el conjunto de calibracion, el criterio de importancia, el numero de tokens de calibracion, si hubo reentrenamiento posterior a la poda ni el regimen de precision utilizado. El unico indicio es el sufijo `wanda_0.7` del identificador. Tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, mezcla de expertos) ni fases de RLHF o DPO.

## Capacidades

- Generacion de texto autorregresiva, la unica tarea declarada en el pipeline del repositorio (`text-generation`).
- Capacidad multilingue potencialmente heredada del BLOOM-560M base (46 idiomas), aunque no verificada tras la poda y no declarada en el repositorio.
- Generacion de codigo potencialmente heredada del entrenamiento del modelo base en 13 lenguajes de programacion, sin evaluacion disponible.
- No hay evidencia de soporte de tool calling ni function calling.
- No hay evidencia de soporte para agentes ni razonamiento multi-paso.
- No dispone de modo "thinking" ni de capacidades de vision, audio o multimodalidad.
- No se ha documentado ninguna capacidad especial ni ajuste por instrucciones; se desconoce si el checkpoint responde a formato conversacional.

## Casos de uso

- Investigacion sobre poda de modelos: el checkpoint permite medir de forma controlada la degradacion de perplejidad y de calidad de generacion al aplicar Wanda con sparsity 0,7 sobre un transformer pequeno, comparandolo con el BLOOM-560M denso y con el resto de ratios publicados por el mismo autor.
- Analisis de eficiencia en CPU: con 559 M de parametros y pesos en 16 bits, el modelo es candidato a ejecutarse en CPU para estudiar si la poda no estructurada se traduce en aceleracion real en bibliotecas que explotan matrices dispersas.
- Generacion de texto de bajo coste en prototipos: util como linea base rapida en entornos de desarrollo donde se necesita un generador de texto pequeno sin requisitos de calidad altos.
- Aumento de datos sinteticos: generacion de texto auxiliar para completar o parafrasear corpus en tareas de clasificacion, siempre con revision posterior dado el riesgo de degradacion por poda.
- Docencia y practicas de ajuste fino: su tamano (1,1 GB de pesos) permite demostrar tecnicas de fine-tuning y de cuantizacion en equipos de laboratorio sin GPU de gama alta.
- Comparativa metodologica entre checkpoints hermanos: la misma cuenta ha publicado variantes como `bloom-560m_wanda_0.9`, lo que permite trazar una curva de calidad frente a sparsity en un mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Perplejidad (WikiText, C4, etc.) | no disponible |
| Evaluacion multilingue | no disponible |

## Requisitos de hardware

- Peso del checkpoint en disco: aproximadamente 1,1 GB para los 559,2 M de parametros en 16 bits (2,24 GB si se carga en fp32).
- VRAM estimada para inferencia en 16 bits: en torno a 1,2-1,5 GB solo para pesos, mas la cache KV (que con 2048 tokens de contexto y un vocabulario de 250.880 entradas puede anadir varios cientos de MB segun el lote).
- VRAM estimada en 8 bits: aproximadamente 0,6 GB de pesos; en 4 bits, aproximadamente 0,3 GB, sin contar la cache.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como una GTX 1650, RTX 3050, T4 o superiores. Cabe holgadamente en una RTX 3060 de 12 GB, una RTX 4090 o una A100, donde quedaria limitado por el ancho de banda y no por la memoria.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU dedicada moderna e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: `transformers` (libreria declarada), text-generation-inference y endpoints compatibles (etiquetas `text-generation-inference` y `endpoints_compatible`), vLLM, y llama.cpp u Ollama previa conversion a GGUF, que no se distribuye en el repositorio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Rajeshwari-Chanda/bloom-560m_wanda_0.7` | 559.214.592 (poda no estructurada al 70 % segun nomenclatura) | no declarado (2048 en el base) | Poda Wanda de BLOOM-560M | no disponible | Publico en Hugging Face, 0 descargas |
| `Rajeshwari-Chanda/bloom-560m_wanda_0.9` | No disponible | no declarado | Poda Wanda de BLOOM-560M con mayor sparsity | no disponible | Publico en Hugging Face |
| `bigscience/bloom-560m` | 559.214.592 | 2048 tokens | Transformer decoder-only multilingue (BigScience) | BigScience BLOOM RAIL 1.0 | Publico en Hugging Face, muy difundido |
| `bigscience/bloom-1b1` | Aproximadamente 1,1 mil millones | 2048 tokens | Transformer decoder-only multilingue (BigScience) | BigScience BLOOM RAIL 1.0 | Publico en Hugging Face |

## Limitaciones y advertencias

- La model card es una plantilla autogenerada sin contenido: no hay informacion sobre sesgos, riesgos, usos previstos ni limitaciones declaradas por el autor.
- No se especifica el conjunto de calibracion ni el procedimiento de poda, por lo que no es posible reproducir el checkpoint ni auditar que pesos se anularon.
- La poda no estructurada al 70 % suele degradar de forma notable la coherencia y la factualidad en modelos de este tamano; se desconoce la magnitud concreta de esa perdida al no haber evaluacion publicada.
- Riesgo elevado de alucinacion y de generacion incoherente, agravado por el reducido numero de parametros (559 M) y por la poda.
- No se declara licencia, lo que impide determinar si el uso comercial esta permitido. El modelo base BLOOM se distribuye bajo BigScience BLOOM RAIL 1.0, con obligaciones de atribucion y restricciones de uso, pero la licencia de este derivado no esta indicada.
- No se declaran idiomas soportados; el comportamiento multilingue tras la poda es una incognita.
- No se ha publicado ninguna evaluacion de sesgos, toxicidad ni alineacion, ni consta que se haya aplicado RLHF o DPO.
- Con cero descargas y cero likes, el checkpoint carece de validacion por parte de la comunidad; no deberia usarse en produccion sin una evaluacion propia exhaustiva.
- El campo "Created" del repositorio figura como 2026-10-03, una fecha posterior a la actual, lo que indica una posible anomalia en los metadatos.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Rajeshwari-Chanda/bloom-560m_wanda_0.7
- Variante con mayor sparsity del mismo autor: https://huggingface.co/Rajeshwari-Chanda/bloom-560m_wanda_0.9
- Perfil del autor en Hugging Face: https://huggingface.co/Rajeshwari-Chanda/models
- Modelo base BLOOM-560M: https://huggingface.co/bigscience/bloom-560m
- Documentacion de BLOOM en transformers: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/bloom.md
- Referencia citada en las etiquetas del repositorio: Lacoste et al., "Quantifying the Carbon Emissions of Machine Learning", https://arxiv.org/abs/1910.09700
