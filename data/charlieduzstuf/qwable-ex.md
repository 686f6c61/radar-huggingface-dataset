# charlieduzstuf/Qwable-Ex

## Resumen

Qwable-Ex es un checkpoint experimental de 9.407.823.088 parametros (aproximadamente 9,4B) publicado por el usuario charlieduzstuf en HuggingFace. Se trata de un merge lineal realizado con Mergekit sobre cuatro modelos de la familia Qwen3.5-9B: el fine-tune Qwable-9B-Claude-Fable-5 de empero-ai, Qwen3.5-9B-Qworus-V2 de DarkKitsune, qwepus de Netuoso y el propio Qwen/Qwen3.5-9B como ascendiente comun. El objetivo declarado es combinar el razonamiento estructurado de estilo trace de Qwable con las capacidades de coding agentico, tool-use y planificacion de los otros componentes.

El modelo hereda la arquitectura de Qwen3.5-9B, descrita en la propia model card como densa con un esquema hibrido de Gated DeltaNet mas atencion completa, lo que lo situa en la tendencia reciente de arquitecturas hibridas que combinan mecanismos de estado (linear attention) con atencion clasica. La model card indica que la arquitectura nativa es multimodal (image-text-to-text en los tags) con soporte de contexto largo, aunque el fine-tune principal (Qwable-9B-Claude-Fable-5) congelo la torre de vision y se entreno solo con texto.

Su relevancia es acotada y de tipo investigador: el propio autor lo describe explicitamente como un checkpoint de investigacion y experimentacion personal, no destinado a produccion ni a decisiones de alto riesgo. Con cero descargas y un like en el momento de la consulta, se trata de un artefacto de nicho dentro del ecosistema de merges comunitarios de Qwen, util para estudiar como se comporta un merge lineal de modelos de razonamiento hibrido de la misma estirpe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de Qwen3.5-9B con esquema hibrido Gated DeltaNet + atencion completa |
| Parametros totales | 9.407.823.088 (aprox. 9,4B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (la arquitectura base soporta contexto largo, pero no se especifica cifra) |
| Tipos de cuantizacion | no disponible; el repo solo contiene pesos completos en safetensors (no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT (segun la model card y los metadatos del repo) |
| Formato de pesos | safetensors |
| Metodo de merge | Lineal con Mergekit |
| Tamano del repositorio | 18,8 GB |
| Libreria | transformers |
| Pipeline | text-generation |
| Multimodalidad | la arquitectura nativa es image-text-to-text, pero el componente principal se entreno solo con texto (torre de vision congelada) |

## Arquitectura y entrenamiento

Qwable-Ex no es un modelo entrenado desde cero, sino un merge lineal de pesos. La model card describe la arquitectura base como Qwen3.5-9B densa, con una combinacion hibrida de Gated DeltaNet y atencion completa. Este tipo de diseno mezcla capas de atencion lineal eficiente (Gated DeltaNet, un mecanismo de estado recurrente) con capas de atencion completa clasica, un patron cada vez mas comun para reducir coste de atencion en contextos largos manteniendo calidad en tareas que requieren atencion global. El modelo base de Qwen se describe como nativamente multimodal y con soporte de contexto largo.

El proceso de construccion consiste en una interpolacion lineal de los pesos de cuatro checkpoints. Los componentes principales son: empero-ai/Qwable-9B-Claude-Fable-5, un SFT de parametros completos sobre trazas de razonamiento y coding de Claude Fable 5 mas un pequeno conjunto de terminales/agentes de GPT-5.5, que aporta el razonamiento estructurado con etiquetas `<think>` y el estilo de coding agentico; DarkKitsune/Qwen3.5-9B-Qworus-V2, un merge 50/50 DARE-TIES de empero-ai/Qwen3.8-9B-Distill y ornith-ai/Ornith-1.5-9B orientado a coding, tool calls y planificacion; Netuoso/qwepus como componente adicional; y el propio Qwen/Qwen3.5-9B como ascendiente comun de toda la linea. No se documentan tokens de entrenamiento adicionales ni etapas de RLHF o DPO propias, ya que el merge solo recombina pesos existentes. La innovacion tecnica es, por tanto, exclusivamente la combinacion lineal, no un entrenamiento nuevo.

## Capacidades

- Generacion de texto conversacional en ingles, con plantilla de chat compatible con `apply_chat_template`.
- Razonamiento estructurado de estilo trace, heredado del fine-tune Qwable sobre trazas de Claude Fable 5 (etiquetas de pensamiento explicito).
- Coding agentico y generacion de codigo, por la contribucion de Qworus-V2 y del componente Qwable.
- Soporte esperado de tool calling / function calling, segun los tags `agentic` y `reasoning` y la linea de Qworus-V2, aunque el autor advierte que "los resultados variaran".
- Planificacion y razonamiento multi-paso orientado a agentes.
- Capacidad multimodal potencial por arquitectura nativa image-text-to-text, pero el componente principal tiene la torre de vision congelada y solo fue ajustado con texto, por lo que no se garantiza vision funcional.
- Multilingue: limitado practicamente a ingles segun los metadatos.

## Casos de uso

- Experimentacion en investigacion de merges: reproducir y analizar como una interpolacion lineal de checkpoints de razonamiento hibrido afecta a la coherencia del modelo en tareas de coding y QA.
- Generacion de codigo en entorno local: usar el modelo para escribir funciones, refactorizar o explicar codigo en ingles, aprovechando su herencia de los componentes orientados a coding, siempre como herramienta de asistencia y no como sustituto de revision humana.
- Prototipado de agentes y tool-use: emplear el estilo agentico heredado para experimentar con cadenas de llamadas a herramientas, evaluando la fiabilidad de las trazas de razonamiento antes de cualquier uso serio.
- Analisis de razonamiento estructurado: estudiar la calidad de las cadenas de pensamiento generadas y compararlas con las de los modelos base para medir el efecto del merge.
- Base para fine-tuning posterior: servir como punto de partida para ajustes adicionales sobre la familia Qwen3.5-9B, aprovechando la compatibilidad con `transformers`.
- Pruebas de prompting comparativas: evaluar diferentes estrategias de prompting (few-shot, chain-of-thought, agentico) sobre un checkpoint fruto de un merge frente a sus ascendientes.
- Demostraciones educativas de merges: ilustrar en articulos o charlas que es un merge lineal con Mergekit y que resultados produce.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: los pesos ocupan aproximadamente 18,8 GB, por lo que se necesitan del orden de 20 GB o mas de VRAM, mas el espacio para la cache KV.
- Cuantizacion de 8 bits: alrededor de 9-10 GB de pesos, factible en GPUs de 12-16 GB segun el contexto.
- Cuantizacion de 4 bits: alrededor de 5-6 GB de pesos, potencialmente ejecutable en GPUs consumer de 8 GB, aunque requeriria conversion manual porque no se publican GGUF.
- GPUs recomendadas: A100 40/80 GB, H100 o L40S para despliegue bf16; RTX 4090 (24 GB) para bf16 o 8 bits; RTX 3090/4080 y similares para cuantizacion.
- Caben en consumer GPU: si, en bf16 en RTX 4090 (24 GB), y en cuantizaciones menores en GPUs de gama media, siempre que se genere la cuantizacion correspondiente.
- Opciones de despliegue: transformers (formato nativo), y potencialmente vLLM o TGI tras validar compatibilidad; llama.cpp y Ollama requeririan convertir los pesos a GGUF, algo que el autor no proporciona.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| charlieduzstuf/Qwable-Ex | 9,4B | no disponible | Merge lineal de 4 checkpoints Qwen3.5-9B | MIT | HuggingFace, safetensors |
| Qwen/Qwen3.5-9B | aprox. 9B | no disponible | Modelo base original, multimodal | Apache-2.0 (segun la model card) | HuggingFace |
| empero-ai/Qwable-9B-Claude-Fable-5 | aprox. 9B | no disponible | SFT completo sobre trazas de razonamiento/coding | no disponible | HuggingFace |
| DarkKitsune/Qwen3.5-9B-Qworus-V2 | aprox. 9B | no disponible | Merge DARE-TIES 50/50 | no disponible | HuggingFace |

Los cuatro modelos comparten la misma estirpe arquitectonica (Qwen3.5-9B) y un tamano de parametros equivalente. Las diferencias relevantes son el metodo de construccion (base original frente a SFT frente a merge DARE-TIES frente a merge lineal) y los datos concretos de rendimiento, que no se han publicado para ninguno en la informacion disponible.

## Limitaciones y advertencias

- El propio autor lo define como checkpoint de investigacion y experimentacion, no apto para produccion, decisiones de alto riesgo ni despliegues que requieran garantias de seguridad sin filtrado adicional.
- Al ser un merge lineal, los pesos interpolados pueden degradar capacidades especificas de cada componente; los resultados de razonamiento y tool-use "variaran" segun la propia model card.
- Riesgo de alucinacion inherente a los modelos de lenguaje de esta escala, sin datos de evaluacion que lo cuantifiquen.
- Idiomas: el modelo esta pensado principalmente para ingles; el rendimiento en castellano u otras lenguas no esta documentado.
- Multimodalidad no garantizada: aunque la arquitectura base sea image-text-to-text, el componente principal se entreno solo con texto y la torre de vision quedo congelada.
- Licencia MIT para el merge, pero los modelos ascendientes son "mayoritariamente Apache-2.0" segun el autor; conviene verificar la procedencia de cada componente antes de un uso comercial.
- Cero descargas y un solo like en el momento de la consulta: no hay evidencia de uso ni validacion por parte de la comunidad.
- Contexto maximo exacto no especificado; no se debe asumir un limite concreto sin verificarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/charlieduzstuf/Qwable-Ex
- Perfil del autor en HuggingFace: https://huggingface.co/charlieduzstuf
- Perfil del autor en GitHub: https://github.com/charlieduzstuf
- Componente empero-ai/Qwable-9B-Claude-Fable-5: https://huggingface.co/empero-ai/Qwable-9B-Claude-Fable-5
- Componente DarkKitsune/Qwen3.5-9B-Qworus-V2: https://huggingface.co/DarkKitsune/Qwen3.5-9B-Qworus-V2
- Modelo base Qwen/Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Laboratorio Empero: https://empero.org/
- Articulo de prensa sobre Qwable en Decrypt: https://decrypt.co/371914/meet-qwable-free-local-model-thinks-like-claude-fable
