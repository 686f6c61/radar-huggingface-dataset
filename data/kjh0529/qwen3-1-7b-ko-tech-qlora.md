# kjh0529/qwen3-1.7b-ko-tech-qlora

## Resumen

El modelo `kjh0529/qwen3-1.7b-ko-tech-qlora` es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base Qwen/Qwen3-1.7B, desarrollado por el usuario kjh0529. Su objetivo es mejorar la consistencia y el estilo de las respuestas en coreano a preguntas tecnicas y de programacion, acercandolas a un estilo de referencia. Se trata de un adaptador ligero (repo de 0,1 GB) que no modifica los pesos del modelo base, sino que se carga sobre el mismo mediante la libreria PEFT.

El adaptador se entrena sobre 3.716 ejemplos del dataset nlpai-lab/kullm-v2, del cual 2.716 son tecnicos (partes de Alpaca y Dolly filtradas para eliminar codigo roto o traducido) y 1.000 generales. El entrenamiento se realizo en una unica GPU Tesla T4 en 1 hora y 26 minutos, con cuantizacion 4-bit NF4 y LoRA de rango 16. El modelo base Qwen3-1.7B es un transformer denso de 1.700 millones de parametros con capacidad de generacion de texto y modo de pensamiento (thinking mode) desactivable.

La relevancia de esta ficha radica en que documenta un caso de ajuste fino de bajo coste para un idioma y dominio especificos (coreano tecnico), con resultados medidos de forma transparente y limitaciones explicitamente declaradas por el autor, incluyendo el riesgo de invencion de detalles en herramientas HPC como Slurm.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer denso (Qwen3-1.7B) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 1.700 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen3-1.7B soporta contexto nativo, pero no se especifica en la ficha) |
| Tipos de cuantizacion | Base cuantizado en 4-bit NF4 con doble cuantizacion durante el entrenamiento; el adaptador se distribuye en safetensors (precision del adaptador no especificada) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena con QLoRA sobre el modelo base Qwen/Qwen3-1.7B, un transformer denso de 1.700 millones de parametros. La cuantizacion del base es 4-bit NF4 con doble cuantizacion y computo en float16 (no se uso bfloat16 por limitaciones de la Tesla T4). Los adaptadores LoRA tienen rango r=16, alpha=32 y dropout de 0,05, aplicados a todas las proyecciones de atencion y MLP. La perdida se calcula unicamente sobre los tokens de respuesta, no sobre el prompt.

El entrenamiento usa 3.716 ejemplos de nlpai-lab/kullm-v2 (licencia Apache-2.0): 2.716 tecnicos (partes de Alpaca y Dolly, filtrados para eliminar codigo roto o traducido) y 1.000 generales. Se realizan 2 epocas, 16 secuencias por actualizacion (2 x 8 de acumulacion), longitud maxima de 1.024 tokens, tasa de aprendizaje 2e-4 con decaimiento coseno, 3% de warm-up y AdamW de 8 bits paginado. El entrenamiento completo dura 1 hora y 26 minutos en una Tesla T4. La perdida de validacion evoluciona de 2,057 (paso 100) a 2,003 (paso 200) y 2,001 (paso 234). No se menciona uso de RLHF ni DPO; el ajuste es supervisado sobre pares instruccion-respuesta.

## Capacidades

- Generacion de texto en coreano con estilo tecnico y de programacion, orientado a preguntas y respuestas.
- Respuestas a preguntas de programacion con bloques de codigo, con una tasa de bloques de codigo intactos del 81,5% en el conjunto de prueba tecnico (frente al 76,9% del base).
- Generacion de explicaciones tecnicas mas largas y detalladas que el modelo base (longitud media de 404 caracteres frente a 302 en el conjunto tecnico).
- Soporte de conversacion multi-turno mediante plantilla de chat (`apply_chat_template`), con rol de sistema configurable.
- Modo de pensamiento (thinking) desactivable mediante el parametro `enable_thinking=False` en la plantilla de chat del modelo base.
- Capacidad multilingue limitada al coreano en el adaptador; el modelo base Qwen3-1.7B tiene capacidades multilingues, pero el ajuste se orienta a coreano.
- No se documenta soporte de tool calling, function calling ni agentes multi-paso en la informacion proporcionada.

## Casos de uso

- Asistencia tecnica en coreano para desarrolladores: el adaptador responde preguntas de programacion en coreano con un estilo mas consistente que el modelo base, adecuado para integrarse en un chatbot interno de soporte a equipos de desarrollo coreanos.
- Generacion de documentacion tecnica en coreano: puede redactar explicaciones de conceptos de programacion y fragmentos de codigo comentados, con una tasa de bloques de codigo intactos del 81,5% en el conjunto de prueba.
- Educacion y tutoria en programacion: el modelo ofrece explicaciones mas largas (404 caracteres de media frente a 302 del base), lo que puede ser util para materiales didacticos que requieren detalle.
- Prototipado rapido de asistentes conversacionales en coreano: al ser un adaptador ligero (0,1 GB) sobre un base de 1.700 millones, se puede desplegar en hardware modesto, como una unica GPU T4, para pruebas de concepto.
- Filtrado y reescritura de respuestas tecnicas: el adaptador mejora la tasa de respuestas en coreano del 84,8% al 93,3% en el conjunto tecnico, por lo que puede usarse para normalizar o reescribir respuestas generadas por otros sistemas hacia un estilo coreano de referencia.
- Generacion de ejemplos de codigo en coreano para tests o demos: con la advertencia de que no debe usarse para dominios HPC (Slurm, MPI, CUDA), donde el autor documenta que empeora la calidad (chrF de 12,9 frente a 18,2 del base).
- Ajuste fino adicional sobre dominio especifico: al ser un adaptador LoRA de rango 16 sobre un base Apache-2.0, sirve como punto de partida para experimentos de QLoRA en coreano con recursos limitados (una T4).

## Benchmarks y rendimiento

Resultados declarados por el autor con decodificacion greedy y el mismo prompt de sistema en coreano para ambos modelos.

| Conjunto de prueba tecnico (200 preguntas) | Base | Adaptador |
|---|---|---|
| Respuestas en coreano (de 178 con referencia en coreano) | 84,8% | 93,3% |
| chrF frente a referencia | 22,2 | 27,9 |
| Bloques de codigo intactos (de 65) | 76,9% | 81,5% |
| Longitud media de respuesta | 302 caracteres | 404 caracteres |

| Conjunto HPC (30 preguntas sobre Slurm, MPI, CUDA, etc.) | Base | Adaptador |
|---|---|---|
| Respuestas en coreano | 100% | 100% |
| chrF frente a referencia | 18,2 | 12,9 (peor) |
| Longitud media de respuesta | 360 caracteres | 614 caracteres |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el entrenamiento se realizo en una Tesla T4 (16 GB) con base en 4-bit NF4. La inferencia del adaptador sobre el base Qwen3-1.7B en precision completa requiere aproximadamente 3,4 GB solo para pesos (1.700 millones x 2 bytes), mas overhead de activaciones y cache KV; en 4-bit se reduce a menos de 1 GB para pesos.
- GPU recomendadas: Tesla T4 (validada para entrenamiento), asi como cualquier GPU con al menos 8 GB de VRAM para inferencia comoda en float16. Para mayor throughput, A100 o H100, aunque no se documentan mediciones en estas.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o superiores, al tratarse de un base de 1.700 millones de parametros.
- Opciones de despliegue: transformers con PEFT (metodo documentado por el autor), y potencialmente vLLM, llama.cpp u Ollama si se fusiona el adaptador con el base y se convierte a GGUF, aunque no se documenta en la informacion proporcionada.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| kjh0529/qwen3-1.7b-ko-tech-qlora | 1.700 M (base) + adaptador LoRA | No disponible | Apache-2.0 | Ajuste coreano tecnico | Hugging Face (0 descargas) |
| Qwen/Qwen3-1.7B (base) | 1.700 M | No disponible en la informacion | Apache-2.0 | Modelo generalista multilingue | Hugging Face |
| nlpai-lab/kullm-v2 (dataset) | No aplica | No aplica | Apache-2.0 | Dataset de instrucciones en coreano | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros adaptadores coreanos similares en la informacion proporcionada.

## Limitaciones y advertencias

- Datos incorrectos en HPC: tanto el modelo base como el adaptador inventan comandos de Slurm (por ejemplo, `scontrol cancel` en lugar de `scancel`). El ajuste fino hace las respuestas mas largas y detalladas, no mas correctas; en el conjunto HPC el chrF empeora de 18,2 a 12,9.
- Respuestas verbosas y a veces repetitivas: las respuestas de entrenamiento son explicaciones largas, por lo que la longitud crece aproximadamente un tercio; algunas repiten una frase.
- Procedencia de los datos de entrenamiento: KULLM-v2 es una traduccion con DeepL de Alpaca y Dolly; parte de los datos originales en ingles fueron generados por modelos GPT. El codigo que el traductor convirtio en coreano se filtro, pero el filtro es heuristico.
- Evaluacion limitada: se usaron metricas automaticas y una muestra pequena de respuestas leidas a mano; no hay estudio de preferencia humana.
- Riesgo de alucinacion: el autor advierte explicitamente que el modelo inventa detalles con confianza.
- Limitacion de idioma: el adaptador esta orientado a coreano; su rendimiento en otros idiomas no esta documentado.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se debe respetar la licencia del modelo base Qwen3-1.7B y del dataset KULLM-v2, ambos Apache-2.0 segun la informacion disponible.
- Caveat para produccion: no usar en dominios HPC o de infraestructura sin verificacion humana, dado el empeoramiento documentado en ese conjunto.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/kjh0529/qwen3-1.7b-ko-tech-qlora
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset KULLM-v2: https://huggingface.co/datasets/nlpai-lab/kullm-v2
- Repositorio de codigo, datos y evaluacion: https://github.com/kjh-0529/llm-engineering/tree/main/01-finetune-inference
