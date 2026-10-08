# cooler8/yejin-korean-8b-v3-sft-v4

## Resumen

Yejin Korean 8B v3 SFT v4 es un modelo de lenguaje de tipo decoder-only orientado a la generacion de texto conversacional y al seguimiento de instrucciones en coreano. Lo publica el usuario cooler8 en HuggingFace bajo licencia Apache 2.0. Segun las etiquetas del repositorio, esta construido sobre la familia Qwen3, con un total de 7.241.740.288 parametros reales (algo menos de 7,3 mil millones) almacenados en formato safetensors, y se distribuye con un peso de repositorio de 14,5 GB, coherente con pesos en precision de 16 bits.

El modelo se presenta como un ajuste supervisado (SFT, supervisado por instrucciones) de la version v3, en su iteracion v4 del proceso de afinado. Su proposito es servir como asistente conversacional en coreano, con una plantilla de chat propia basada en los tokens especiales `<|user|>`, `<|assistant|>` y `<|end|>`. No se declara soporte multilingue: el unico idioma listado es el coreano (codigo `ko`).

La relevancia de este modelo es limitada y hay que ser honesto al respecto: cuenta con cero descargas y cero likes en el momento de redactar esta ficha, la model card es minima y no incluye detalles de entrenamiento, longitud de contexto, benchmarks ni cuantizaciones publicadas. Por tanto, es un artefacto de interes principalmente para quien busque un modelo conversacional en coreano derivado de Qwen3 y este dispuesto a validarlo por su cuenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer decoder-only, familia Qwen3 (segun etiquetas del repositorio) |
| Parametros totales | 7.241.740.288 (7,24 mil millones) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de la etiqueta `qwen3`, que situa al modelo dentro de la familia Qwen3 de Alibaba. Se trata, por tanto, de un transformer decoder-only de aproximadamente 7,24 mil millones de parametros, presumiblemente denso (no se indica que sea una variante de mezcla de expertos). El modelo se presenta como un ajuste SFT sobre una version previa denominada v3, sin que se especifiquen el numero de tokens de entrenamiento, la composicion del dataset ni si se aplico RLHF, DPO u otra tecnica de alineacion posterior.

Tampoco se documentan innovaciones tecnicas destacables (atencion lineal, decodificacion especulativa, modos de razonamiento, etc.). La unica especificidad tecnica aportada por el autor es la plantilla de chat, que define el formato de las conversaciones mediante los tokens `<|user|>`, `<|assistant|>` y `<|end|>`. Cualquier afirmacion adicional sobre el proceso de entrenamiento seria especulativa y no se incluye aqui.

## Capacidades

- Generacion de texto conversacional en coreano, con seguimiento de instrucciones segun el formato de chat definido por el autor.
- Respuesta a instrucciones de un solo turno o multiturno mediante la plantilla `<|user|>...<|end|>\n<|assistant|>...<|end|>`.
- Uso directo con `transformers` (`AutoModelForCausalLM` y `AutoTokenizer`) con `apply_chat_template`.
- Soporte de tool calling / function calling: no disponible (no declarado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no declarado).
- Capacidades multilingues: no disponibles; solo se declara coreano.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Ajuste SFT orientado a conversacion segun nomenclatura del nombre del modelo.

## Casos de uso

- Asistente conversacional en coreano: el modelo puede gestionar dialogos en coreano aplicando la plantilla de chat propia, adecuado para prototipos de chatbot en ese idioma.
- Generacion de respuestas a instrucciones en coreano: util para tareas de redaccion asistida y resumen en coreano, siempre que se valide la calidad por no haber benchmarks publicados.
- Ajuste fino adicional (fine-tuning) sobre una base en coreano: al ser un modelo de 7,24B con licencia Apache 2.0, se puede reentrenar para dominios especificos (legal, medico, atencion al cliente) en coreano.
- Investigacion academica sobre SFT en coreano: sirve como punto de comparacion frente a otros ajustes sobre Qwen3 en idiomas de bajos recursos relativos.
- Base para pipelines de generacion de texto en `transformers`: integrable en scripts Python con `AutoModelForCausalLM` y el tokenizador del repositorio.
- Evaluacion interna de la familia Qwen3 en coreano: util para medir el efecto del ajuste SFT v4 frente a la version v3 u otras variantes, dado que el nombre delata iteraciones sucesivas.
- Despliegue experimental en `vLLM`, `llama.cpp` o `Ollama`: posible siempre que se generen las cuantizaciones oportunas, ya que el autor no las publica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 14-16 GB solo para pesos, mas memoria para el contexto y los estados de atencion. Coincide con el tamano del repositorio (14,5 GB).
- VRAM estimada en cuantizacion de 8 bits: del orden de 7-9 GB.
- VRAM estimada en cuantizacion de 4 bits: del orden de 4-6 GB (estimaciones a partir del numero de parametros; el autor no publica cuantizaciones).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para ejecucion comoda en precision completa o mixta.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas si se usa cuantizacion (por ejemplo RTX 4080/4090, o 16 GB de VRAM con 8 bits de forma ajustada). En FP16 requiere al menos 24 GB para operar con holgura.
- Opciones de despliegue: al ser pesos safetensors, se puede usar `transformers` directamente; para vLLM, TGI o llama.cpp seria necesario verificar compatibilidad y, en el caso de llama.cpp/Ollama, convertir los pesos a GGUF, algo que el autor no facilita.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Yejin Korean 8B v3 SFT v4 | 7,24B | no disponible | no disponible (sin benchmarks) | Apache 2.0 | safetensors en HF, 0 descargas |
| Qwen3-8B (base declarado) | ~8,2B | hasta 32.768 tokens nativos (ampliable con YaRN en el modelo original) | benchmarks publicados por Alibaba en el modelo original | Apache 2.0 | ampliamente disponible |
| Llama-3.1-8B-Instruct | 8,03B | 128.000 tokens | benchmarks publicados por Meta | Llama 3.1 Community License | ampliamente disponible |
| EXAONE-3.5-7.8B-Instruct (LG AI Research) | 7,8B | 32.768 tokens | benchmarks publicados por LG | EXAONE AI Model License | disponible en HF |

Nota: los datos de los modelos comparativos corresponden a informacion publica general y no a la model card de este repositorio; se incluyen como referencia de categoria. El modelo objeto de esta ficha no aporta cifras de contexto ni rendimiento, por lo que la comparacion cuantitativa no es posible.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay datos publicados de MMLU, GSM8K, HumanEval ni evaluaciones en coreano, por lo que la calidad real es desconocida.
- Model card minima: no se documentan datos de entrenamiento, numero de tokens ni tecnica de alineacion, lo que dificulta auditar sesgos o comportamientos.
- Riesgo de alucinacion: al no haber evaluacion, se debe asumir el riesgo habitual de los modelos generativos, especialmente en dominios facticos.
- Sesgos conocidos: no disponibles; al entrenarse presumiblemente con datos en coreano, pueden aparecer sesgos culturales y linguisticos propios del corpus.
- Limitacion idiomatica: solo se declara coreano; el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea pobre.
- Longitud de contexto desconocida: imposible planificar despliegues con requisitos de contexto largo sin validacion previa.
- Sin cuantizaciones publicadas: para usar llama.cpp u Ollama hay que convertir los pesos, lo que anade trabajo y riesgo de degradacion.
- Adopcion nula: cero descargas y cero likes implican que no hay retroalimentacion de la comunidad ni garantias de mantenimiento.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar que el modelo base Qwen3 se distribuye bajo la misma licencia y que no se imponen restricciones adicionales.
- Caveat de produccion: para uso en produccion se recomienda una evaluacion propia exhaustiva antes de confiar en el modelo en cualquier flujo critico.

## Enlaces

- HuggingFace: https://huggingface.co/cooler8/yejin-korean-8b-v3-sft-v4
- Repositorio del modelo base (familia Qwen3): https://huggingface.co/Qwen/Qwen3-8B
- Documentacion de `transformers` sobre `apply_chat_template`: https://huggingface.co/docs/transformers/main/en/chat_templating
- No se han encontrado papers, blogs, repositorios adicionales ni demos asociados al modelo en la informacion disponible.
