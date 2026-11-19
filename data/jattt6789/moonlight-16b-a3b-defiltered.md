# Jattt6789/Moonlight-16B-A3B-DeFiltered

## Resumen

Moonlight-16B-A3B-DeFiltered es una variante del modelo Moonlight-16B-A3B desarrollado originalmente por Moonshot AI, un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) con 16.000 millones de parametros totales y aproximadamente 3.000 millones de parametros activos por token. El modelo original fue entrenado sobre 5,7 billones de tokens utilizando el optimizador Muon, una innovacion que, segun el informe tecnico, resulta aproximadamente dos veces mas eficiente en muestras que Adam con entrenamiento optimo en computo. Esta version concreta, publicada por el usuario Jattt6789 bajo el identificador Moonlight-16B-A3B-DeFiltered, parece ser una redistribucion del modelo base con pesos en formato safetensors y arquitectura deepseek_v3.

El modelo resuelve el problema de obtener un rendimiento competitivo en tareas de lenguaje, codigo y matematicas con un coste computacional de inferencia reducido, ya que solo activa una fraccion de sus parametros por token. Su ventana de contexto es de 8192 tokens, adecuada para conversaciones multi-turno y tareas de generacion de texto de longitud moderada. La relevancia actual radica en que ofrece una relacion calidad-coste atractiva frente a modelos densos de tamano similar, y en que su licencia MIT facilita el uso comercial y la experimentacion.

La informacion disponible sobre esta variante especifica es limitada: no se detallan los cambios exactos respecto al modelo original, no se especifican los idiomas soportados y no se han publicado resultados de benchmarks propios para esta version. La model card incluida es esencialmente la del modelo original de Moonshot AI, por lo que los datos tecnicos y de rendimiento que se presentan a continuacion provienen de esa fuente y deben interpretarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) tipo deepseek_v3, transformer |
| Parametros totales | 15.960.111.936 (aproximadamente 16B) |
| Parametros activos | Aproximadamente 3B (2,24B segun la model card, excluyendo embeddings) |
| Longitud de contexto | 8192 tokens (8K) |
| Tipos de cuantizacion | No disponible (el repositorio contiene safetensors; no se especifican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible (la model card original incluye evaluaciones en ingles y chino, pero no se declara una lista oficial) |
| Licencia | MIT |
| Formato de pesos | Safetensors (tambien compatible con transformers y text-generation-inference) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura Mixture-of-Experts (MoE) con 16.000 millones de parametros totales y aproximadamente 3.000 millones activos por token, lo que reduce el coste de inferencia respecto a un modelo denso del mismo tamano. La arquitectura se etiqueta como deepseek_v3 en los metadatos de Hugging Face, lo que sugiere un diseno de enrutamiento de expertos similar al empleado en la familia DeepSeek V3. El modelo original fue entrenado sobre 5,7 billones de tokens utilizando el optimizador Muon, que segun el informe tecnico de Moonshot AI incorpora weight decay y actualizaciones RMS consistentes para escalar a modelos grandes sin ajuste fino de hiperparametros. Segun la model card, Muon es aproximadamente dos veces mas eficiente en muestras que Adam en regimen de computo optimo, y el modelo alcanza rendimiento comparable a variantes entrenadas con AdamW requiriendo solo alrededor del 52% de los FLOPs de entrenamiento.

No se dispone de informacion sobre la composicion exacta del dataset de entrenamiento, la presencia de RLHF o DPO, ni sobre las modificaciones concretas aplicadas en esta variante "DeFiltered". Tampoco se detalla si se ha realizado un ajuste de instrucciones en esta version especifica; la model card original distingue entre el modelo preentrenado (Moonlight-16B-A3B) y una version instruct (Moonlight-16B-A3B-Instruct), pero no queda claro a cual corresponde esta redistribucion. La etiqueta "conversational" en los metadatos sugiere cierta orientacion a dialogo, pero no se confirma en la documentacion.

## Capacidades

- Generacion de texto y conversacion multi-turno, con soporte para el pipeline text-generation de transformers.
- Razonamiento y conocimiento general: la model card original reporta resultados en MMLU, MMLU-pro y BBH, lo que indica capacidad para tareas de comprension y razonamiento.
- Generacion de codigo: evaluado en HumanEval y MBPP en el modelo original.
- Matematicas: evaluado en GSM8K, MATH y CMath en el modelo original.
- Capacidades multilingues: la model card original incluye evaluaciones en chino (C-Eval, CMMLU) ademas de ingles, aunque no se declara una lista oficial de idiomas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Generacion de codigo en produccion: el modelo puede integrarse en pipelines de CI/CD para autocompletar funciones, generar tests unitarios o sugerir correcciones, aprovechando su rendimiento en HumanEval (48,1) y MBPP (63,8) reportado para el modelo original, con un coste de inferencia reducido al activar solo unos 3B de parametros.
- Asistencia en tareas de razonamiento y analisis: con resultados de 70,0 en MMLU y 65,2 en BBH en el modelo original, es adecuado para resumir documentos, responder preguntas sobre textos y apoyar decisiones que requieran comprension lectora moderada.
- Tutoria y resolucion de problemas matematicos: sus resultados en GSM8K (77,4) y MATH (45,3) lo hacen util para generar explicaciones paso a paso en entornos educativos, aunque con cautela por el riesgo de alucinacion en calculos complejos.
- Atencion al cliente automatizada: la ventana de contexto de 8192 tokens permite gestionar conversaciones multi-turno con historial moderado, y el coste de inferencia contenido facilita el despliegue en entornos con alto volumen de peticiones.
- Procesamiento de texto en lote: para clasificacion, extraccion de entidades o resumen de documentos, el modelo puede ejecutarse en GPUs de gama media gracias a su naturaleza MoE y a la posibilidad de cuantizacion, aunque no se detallan formatos cuantizados en el repositorio.
- Experimentacion e investigacion: al estar liberado bajo licencia MIT y con pesos en safetensors, es adecuado para estudiar el comportamiento de arquitecturas MoE, comparar el optimizador Muon frente a AdamW y realizar ajuste fino en dominios especificos.
- Generacion de contenido en ingles y chino: la model card original reporta resultados solidos en C-Eval (77,2) y CMMLU (78,2), lo que lo hace util para aplicaciones bilingues en esos idiomas, siempre que se valide el comportamiento en el resto de lenguas.

## Benchmarks y rendimiento

Los siguientes resultados provienen de la model card del modelo original Moonlight-16B-A3B de Moonshot AI y no han sido verificados para esta variante "DeFiltered". No se han publicado resultados de benchmarks especificos para esta redistribucion en la informacion disponible.

| Benchmark (metrica) | Llama3.2-3B | Qwen2.5-3B | DSV2-Lite | Moonlight |
|---|---|---|---|---|
| Parametros activados | 2,81B | 2,77B | 2,24B | 2,24B |
| Parametros totales | 2,81B | 2,77B | 15,29B | 15,29B |
| Tokens de entrenamiento | 9T | 18T | 5,7T | 5,7T |
| Optimizador | AdamW | no disponible | AdamW | Muon |
| MMLU | 54,75 | 65,6 | 58,3 | 70,0 |
| MMLU-pro | 25,0 | 34,6 | 25,5 | 42,4 |
| BBH | 46,8 | 56,3 | 44,1 | 65,2 |
| TriviaQA | 59,6 | 51,1 | 65,1 | 66,3 |
| HumanEval | 28,0 | 42,1 | 29,9 | 48,1 |
| MBPP | 48,7 | 57,1 | 43,2 | 63,8 |
| GSM8K | 34,0 | 79,1 | 41,1 | 77,4 |
| MATH | 8,5 | 42,6 | 17,1 | 45,3 |
| CMath | no disponible | 80,0 | 58,4 | 81,1 |
| C-Eval | no disponible | 75,0 | 60,3 | 77,2 |
| CMMLU | no disponible | 75,0 | 64,3 | 78,2 |

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (BF16/FP16): aproximadamente 32 GB solo para los pesos, mas memoria para el contexto y las activaciones, por lo que se recomienda un minimo de 40-48 GB.
- VRAM estimada con cuantizacion a 8 bits: en torno a 16-18 GB para los pesos, mas overhead, lo que permite su uso en GPUs de 24 GB.
- VRAM estimada con cuantizacion a 4 bits: aproximadamente 8-10 GB para los pesos, viable en GPUs consumer de 12-16 GB, aunque no se distribuyen pesos cuantizados oficialmente en este repositorio.
- GPUs recomendadas: A100 40GB/80GB, H100 para despliegue en produccion con alta concurrencia; RTX 4090 (24 GB) para inferencia en BF16 con contexto reducido o en 8 bits; RTX 3090/4080 para cuantizacion a 8 o 4 bits.
- Cabe en GPU consumer: si, en modelos con 24 GB o mas en BF16 con contexto limitado, y en GPUs de 12-16 GB si se aplica cuantizacion.
- Opciones de despliegue: transformers (recomendado python 3.10, torch >= 2.1.0, transformers 4.48.2 segun la model card), text-generation-inference (etiqueta endpoints_compatible), y previsiblemente vLLM y llama.cpp si se generan pesos compatibles, aunque no se confirma en la informacion disponible.
- Latencia y throughput estimados: no disponibles. Al ser un MoE con unos 3B de parametros activos, el throughput por token deberia ser comparable a un modelo denso de 3B, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | MMLU | HumanEval | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Moonlight-16B-A3B (original) | 16B / 3B | 8K | 70,0 | 48,1 | MIT | Hugging Face (moonshotai) |
| DeepSeek-V2-Lite | 15,29B / 2,24B | no disponible en la informacion | 58,3 | 29,9 | no disponible en la informacion | Hugging Face |
| Qwen2.5-3B | 2,77B denso | no disponible en la informacion | 65,6 | 42,1 | no disponible en la informacion | Hugging Face |
| Llama3.2-3B | 2,81B denso | no disponible en la informacion | 54,75 | 28,0 | no disponible en la informacion | Hugging Face |

La comparativa se basa en los datos de la model card original. Moonlight supera a los tres modelos de referencia en MMLU, BBH, HumanEval y MBPP, y queda por debajo de Qwen2.5-3B en GSM8K (77,4 frente a 79,1). Su principal ventaja competitiva es la combinacion de rendimiento y eficiencia de entrenamiento con Muon, junto con una licencia MIT permisiva.

## Limitaciones y advertencias

- Esta variante "DeFiltered" no documenta que modificaciones se han aplicado respecto al modelo original; no se puede garantizar que su comportamiento sea identico al de Moonlight-16B-A3B de Moonshot AI.
- No se han publicado benchmarks propios para esta version; los resultados mostrados corresponden al modelo original y podrian no reflejarse en esta redistribucion.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en tareas de matematicas y hechos verificables; se recomienda validacion humana en produccion.
- Sesgos conocidos: no documentados en la informacion disponible, pero al ser un modelo entrenado principalmente con datos en ingles y chino, puede presentar sesgos culturales y linguisticos en otros idiomas.
- Limitacion de contexto: 8192 tokens, insuficiente para tareas que requieran documentos muy largos o conversaciones extensas sin estrategias de resumen.
- Idiomas soportados no declarados oficialmente; el rendimiento en lenguas distintas del ingles y el chino no esta garantizado.
- Restricciones de licencia: la licencia MIT permite uso comercial, modificacion y redistribucion, pero se recomienda verificar la procedencia de los datos de entrenamiento y las obligaciones de atribucion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una publicacion reciente y sin validacion comunitaria.
- No se distribuyen pesos cuantizados oficialmente, lo que obliga a generarlos si se desea desplegar en hardware limitado.
- La fecha de creacion del repositorio (2026-11-18) es posterior a la publicacion del modelo original, lo que refuerza la naturaleza de redistribucion de esta variante.

## Enlaces

- Repositorio Hugging Face de esta variante: https://huggingface.co/Jattt6789/Moonlight-16B-A3B-DeFiltered
- Modelo original Moonlight-16B-A3B: https://huggingface.co/moonshotai/Moonlight-16B-A3B
- Modelo original instruido Moonlight-16B-A3B-Instruct: https://huggingface.co/moonshotai/Moonlight-16B-A3B-Instruct
- Repositorio GitHub de Moonshot AI: https://github.com/MoonshotAI/Moonlight
- Informe tecnico (PDF): https://github.com/MoonshotAI/Moonlight/blob/master/Moonlight.pdf
- Repositorio del optimizador Muon: https://github.com/KellerJordan/Muon
- Paper referenciado en los metadatos (arXiv:2502.16982): https://arxiv.org/abs/2502.16982
