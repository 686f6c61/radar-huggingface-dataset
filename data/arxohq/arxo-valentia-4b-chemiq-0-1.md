# arxohq/Arxo-Valentia-4B-ChemIQ-0.1

## Resumen

Arxo-Valentia-4B-ChemIQ-0.1 es un adaptador LoRA de tipo PEFT desarrollado por arxohq sobre el modelo base Qwen/Qwen3.5-4B (4.000 millones de parametros). Esta especializado en razonamiento de quimica organica a partir de cadenas SMILES sin uso de herramientas externas: cuenta atomos y anillos, calcula la ruta mas corta entre dos atomos, mapea atomos entre dos representaciones de una misma molecula, genera nombres IUPAC, predice puntuaciones de estructura-actividad y escribe el producto de una reaccion quimica.

El modelo resuelve el problema de aplicar razonamiento estructurado sobre notacion quimica en un unico paso de generacion, sin depender de parsers, RDKit ni llamadas a funciones. Segun los datos declarados por el autor, alcanza un 74,1% de acierto (605 de 816 preguntas) en el benchmark ChemIQ, por encima de GPT-5 (70,2%), o3-mini en razonamiento alto (56,7%), Gemini 2.5 Pro (55,5%) y DeepSeek-R1 (50,2%), aunque con la salvedad importante de que ha sido entrenado especificamente en las tareas del benchmark.

Es relevante ahora porque demuestra que un adaptador de 4B entrenado con datos sinteticos dirigidos puede superar a modelos frontera de proposito general en tareas quimicas acotadas, con un coste de inferencia muy inferior. Es una release de investigacion (0.1) y cubre siete de las ocho categorias del benchmark; la elucidacion estructural por RMN queda fuera de alcance.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3.5-4B |
| Parametros totales | 4B (modelo base); el adaptador LoRA anade un subconjunto no especificado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-4B) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; cuantizacion del base no documentada) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA); requiere el base Qwen/Qwen3.5-4B |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA que se acopla al transformer decoder-only Qwen3.5-4B. La carga se realiza mediante `PeftModel` sobre `AutoModelForImageTextToText` (no sobre `AutoModelForCausalLM`), lo que indica que el base es un modelo multimodal de la familia Qwen3.5. El adaptador se distribuye en safetensors con un tamano de repositorio de 0,3 GB.

El entrenamiento se realizo en una unica ejecucion sobre preguntas de las mismas clases que evalua ChemIQ, construidas a partir de moleculas fuera del conjunto de test. El modelo fue entrenado con una notacion fija paso a paso: escribe el razonamiento primero, cada paso usando solo lo ya escrito, y da la respuesta final sola en la ultima linea, en el formato exacto que pide la pregunta. Se usa decodificacion greedy, con el modo thinking desactivado y un limite de 3.900 tokens nuevos. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento quimico estructurado en notacion paso a paso.
- Conteo de atomos de carbono en moleculas representadas como SMILES (100% en la categoria del benchmark).
- Conteo de anillos (100% en la categoria del benchmark).
- Calculo de la ruta mas corta entre dos atomos de una molecula (100% en la categoria del benchmark).
- Mapeo de atomos entre dos cadenas SMILES de una misma molecula (78,3% con el checker del benchmark).
- Generacion de nombres IUPAC sistematicos a partir de SMILES (70,5%).
- Prediccion de puntuaciones de estructura-actividad mediante el modelo Free-Wilson (85,0%).
- Prediccion del producto de una reaccion quimica (88,9%).
- Razonamiento multi-paso dentro de una unica generacion, sin tool calling ni function calling.
- Soporte multilingue limitado al ingles.
- Capacidad de vision potencialmente heredada del base (carga via `AutoModelForImageTextToText`), no documentada ni evaluada en esta release.

## Casos de uso

- Normalizacion de nombres quimicos en pipelines de datos: dado un SMILES de una base de datos, el modelo genera un nombre sistematico parseable por OPSIN, util para enriquecer registros sin invocar servicios externos.
- Verificacion de integridad estructural: el conteo de atomos y anillos y el calculo de rutas mas cortas permiten validar o auditar moleculas en procesos de control de calidad de datasets quimicos.
- Deduplicacion y alineamiento de moleculas: el mapeo de atomos entre dos SMILES de la misma molecula facilita reconciliar representaciones canonicas y no canonicas en un mismo repositorio.
- Prediccion de productos de reaccion en entornos de bajo recurso: con 4B de parametros y decodificacion greedy, puede desplegarse en una GPU consumer para predecir transformaciones en cribados masivos donde no es viable llamar a un modelo frontera.
- Analisis de estructura-actividad: la capacidad Free-Wilson permite estimar puntuaciones de actividad a partir de tablas de sustituyentes, util en fases tempranas de descubrimiento de farmacos.
- Extraccion de informacion quimica en herramientas de investigacion: al no requerir herramientas, se integra como un unico paso de generacion en cuadernos y scripts, reduciendo la complejidad de orquestacion frente a soluciones con tool calling.
- Evaluacion comparativa de modelos: sirve como referencia especializada para medir la brecha entre modelos de proposito general y adaptadores dirigidos en tareas quimicas acotadas.

## Benchmarks y rendimiento

Resultados declarados por el autor en el benchmark ChemIQ (816 preguntas, checker propio del benchmark, sin herramientas, decodificacion greedy, thinking desactivado, limite de 3.900 tokens nuevos):

| Sistema | Entrenado en la tarea | ChemIQ | Fuente |
|---|---|---|---|
| Arxo-Valentia-4B-ChemIQ-0.1 | si | 605/816 (74,1%) | este modelo |
| GPT-5 | no | 70,2% | blog del autor del benchmark |
| o3-mini, high reasoning | no | 56,7% | paper ChemIQ |
| Gemini 2.5 Pro | no | 55,5% | paper ChemIQ |
| DeepSeek-R1 | no | 50,2% | paper ChemIQ |

Desglose por categoria:

| Categoria | Preguntas | Arxo-Valentia | o3-mini high | Gemini 2.5 Pro | DeepSeek-R1 |
|---|---|---|---|---|---|
| Conteo de carbono | 50 | 50 (100%) | 92,0% | 82,0% | 90,0% |
| Conteo de anillos | 48 | 48 (100%) | 100% | 93,8% | 93,8% |
| Ruta mas corta | 108 | 108 (100%) | 72,2% | 63,0% | 59,3% |
| Mapeo de atomos | 184 | 144 (78,3%) | 56,0% | 46,2% | 54,3% |
| SMILES a nombre IUPAC | 200 | 141 (70,5%) | 28,5% | 38,5% | 20,0% |
| Estructura-actividad (Free-Wilson) | 40 | 34 (85,0%) | 100% | 95,0% | 95,0% |
| Producto de reaccion | 90 | 80 (88,9%) | 60,0% | 55,6% | 45,6% |
| Elucidacion por RMN | 96 | 0 (0%) | 38,5% | 51,0% | 38,5% |
| Total | 816 | 605 (74,1%) | 56,7% | 55,5% | 50,2% |

Notas del autor: el modelo no fue entrenado en preguntas de RMN y no resuelve ninguna. En las otras siete categorias alcanza 605 de 720 (84,0%). El checker del benchmark rechaza respuestas de mas de 200 caracteres, por lo que 30 de las 184 preguntas de mapeo de atomos no pueden acreditarse a ninguna respuesta; sin ese limite las mismas respuestas puntuan 629 de 816 (77,1%) y el mapeo de atomos 168 de 184.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Para un base de 4B en bfloat16 se estiman en torno a 8-10 GB de VRAM, incluyendo pesos y overhead de activaciones; en cuantizacion de 4 bits podria situarse en el rango de 3-4 GB, aunque no se documenta el soporte de cuantizacion del adaptador.
- GPU recomendadas: no documentadas por el autor. Por tamano del base, una RTX 4090 (24 GB) o una A100 (40/80 GB) permiten cargar el modelo completo en bfloat16 con margen. Una RTX 3090 o 4080 (16-24 GB) tambien serian suficientes.
- Cabe en GPU consumer: si, previsiblemente en tarjetas con 12 GB o mas en bfloat16; no confirmado oficialmente.
- Opciones de despliegue: la model card documenta `transformers` con `PeftModel` sobre `AutoModelForImageTextToText`. No se mencionan vLLM, llama.cpp, Ollama ni TGI; al ser un adaptador LoRA sobre un base multimodal, la compatibilidad con esos motores no esta documentada.
- Latencia y throughput: no disponibles. El autor limita la generacion a 3.900 tokens nuevos por pregunta, lo que condiciona la latencia en funcion del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ChemIQ | Entrenado en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Arxo-Valentia-4B-ChemIQ-0.1 | 4B (base) + LoRA | no disponible | 74,1% | si | apache-2.0 | Hugging Face |
| GPT-5 | no disponible | no disponible | 70,2% | no | propietaria | API |
| o3-mini (high reasoning) | no disponible | no disponible | 56,7% | no | propietaria | API |
| Gemini 2.5 Pro | no disponible | no disponible | 55,5% | no | propietaria | API |
| DeepSeek-R1 | no disponible | no disponible | 50,2% | no | MIT (segun publicacion original) | Hugging Face y API |

La comparacion es asimetrica: Arxo-Valentia ha sido entrenado en las mismas clases de tareas que evalua ChemIQ, mientras que los modelos de proposito general responden solo desde el prompt. En categorias fuera de su entrenamiento (RMN) el modelo cae a 0%, mientras que los generales mantienen un rendimiento parcial (38-51%).

## Limitaciones y advertencias

- No resuelve la categoria de elucidacion estructural por RMN: 0 de 96 preguntas. Cualquier uso en esa tarea dara resultados incorrectos.
- El modelo esta entrenado en las mismas clases de preguntas y el fraseado del benchmark ChemIQ; su rendimiento en otras formulaciones o en quimica fuera de ese alcance no ha sido evaluado.
- Un nombre se considera correcto si OPSIN lo parsea a la estructura pretendida; el modelo escribe un nombre sistematico de ese tipo, pero no siempre el nombre IUPAC preferido.
- Alcance molecular limitado: moleculas organicas neutras de hasta unos 30 atomos pesados, sin estereoquimica.
- El checker del benchmark rechaza respuestas de mas de 200 caracteres, lo que penaliza el mapeo de atomos en moleculas grandes (30 de 184 preguntas no acreditables).
- Solo soporta ingles; no se documenta capacidad multilingue.
- Es una release de investigacion (version 0.1) con una unica ejecucion de entrenamiento; no hay validacion independiente de los resultados.
- Riesgo de alucinacion en moleculas o reacciones fuera de la distribucion de entrenamiento; no se documentan evaluaciones de robustez ni de sesgo.
- La licencia apache-2.0 permite uso comercial, pero debe verificarse tambien la licencia del modelo base Qwen/Qwen3.5-4B antes de desplegar en produccion.
- Requiere cargarse sobre `AutoModelForImageTextToText`, no sobre `AutoModelForCausalLM`; usar la clase incorrecta puede provocar fallos silenciosos.

## Enlaces

- Hugging Face: https://huggingface.co/arxohq/Arxo-Valentia-4B-ChemIQ-0.1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio de resultados y checksums: https://github.com/arxohq/arxo-valentia-chemiq
- Benchmark ChemIQ (codigo): https://github.com/oxpig/ChemIQ
- Paper ChemIQ: https://arxiv.org/abs/2505.07735
- Blog del autor del benchmark sobre GPT-5: https://www.blopig.com/blog/2025/08/gpt-5-achieves-state-of-the-art-chemical-intelligence/
- OPSIN (parser de nombres IUPAC): https://github.com/dan2097/opsin
- Release previa Arxo Materia MedCalc: https://huggingface.co/arxohq/Arxo-Materia-4B-MedCalc-0.1
- Release previa Arxo Materia EHRSQL: https://huggingface.co/arxohq/Arxo-Materia-4B-EHRSQL-0.1
