# BachDaThan/Qwen-3-0.6B-Reasoning-Vi-Medical-LoRA-GGUF

## Resumen

Qwen-3-0.6B-Reasoning-Vi-Medical-LoRA-GGUF es un modelo de generación de texto de 596.049.920 parámetros (aproximadamente 0,6 mil millones) publicado por el usuario BachDaThan en Hugging Face. Se trata de una derivación en formato GGUF del modelo base Qwen/Qwen3-0.6B, sobre el que se ha aplicado y fusionado el adaptador LoRA danhtran2mind/Qwen-3-0.6B-Reasoning-Vi-Medical-LoRA, orientado a razonamiento y dominio sanitario en vietnamita. El resultado se ha cuantizado a cuatro niveles distintos (Q3_K_S, Q3_K_M, Q4_K_S y Q4_K_M) para su uso con llama.cpp y Ollama.

El problema que resuelve es de tipo práctico: ofrece una variante ligera, en vietnamita e inglés, de un modelo pequeño, ejecutable en GPU de consumo o incluso en CPU, con menos de 0,4 GB de pesos por archivo. Esto lo hace útil para prototipos de asistentes conversacionales en vietnamita donde no hay presupuesto de VRAM para modelos de mayor tamaño. La arquitectura subyacente es un transformer denso de tipo qwen3, con 28 capas, tamaño oculto de 1024 y una ventana de contexto declarada de 40.960 tokens.

La relevancia del modelo es limitada pero específica: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no se han publicado resultados de benchmarks. Su interés principal reside en ser un ejemplo de pipeline de fusión de LoRA y cuantización a GGUF, más que en un rendimiento medido frente a alternativas. La licencia declarada del repositorio es apache-2.0, aunque la propia model card advierte que la licencia se determinó tras verificar las licencias de origen y que el adaptador LoRA es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3 (transformer denso, decoder-only) |
| Parametros totales | 596.049.920 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 40.960 tokens (segun model card); los ejemplos de uso emplean 8.192 |
| Tipos de cuantizacion | Q3_K_S, Q3_K_M, Q4_K_S, Q4_K_M (GGUF) |
| Idiomas soportados | vietnamita (vi) e ingles (en) |
| Licencia | apache-2.0 en el repositorio; adaptador LoRA publicado como MIT |
| Formato de pesos | GGUF (repo de 1,5 GB con las cuatro cuantizaciones); el modelo base original estaba en bfloat16 |
| Capas | 28 |
| Tamano oculto | 1024 |
| Dimension de cabeza | 128 |
| Cabezas de atencion | 16 |
| Cabezas KV | 8 (GQA) |
| Tamano de vocabulario | 151.936 |
| Precisión original | bfloat16 |
| Libreria | llama.cpp |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de la familia Qwen3, con 28 capas, hidden size de 1024, 16 cabezas de atención y 8 cabezas KV, lo que implica Grouped Query Attention (GQA) para reducir el coste de la caché KV. La dimensión de cabeza es 128 y el vocabulario es de 151.936 tokens. No se trata de una arquitectura MoE ni híbrida, y no incorpora mecanismos de atención lineal ni decodificación especulativa según la documentación disponible.

La información proporcionada no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base. El proceso documentado en este repositorio es únicamente de post-procesado: fusión del adaptador LoRA de razonamiento médico en vietnamita sobre Qwen/Qwen3-0.6B y posterior cuantización a GGUF. La model card indica que los tamaños de archivo se midieron con `stat().st_size` tras la cuantización, no como estimaciones. No se describe ninguna innovación técnica adicional.

## Capacidades

- Generación de texto conversacional e instruccional, con plantilla de chat basada en los tokens especiales `<|im_start|>` y `<|im_end|>`.
- Ajuste orientado a razonamiento y a dominio médico en vietnamita, heredado del adaptador LoRA fusionado.
- Soporte de conversaciones multi-turno con rol de sistema, usuario y asistente.
- Capacidad multilingüe limitada a vietnamita e inglés según los metadatos del repositorio.
- Compatibilidad con llama.cpp, llama-cpp-python y Ollama mediante el archivo GGUF y la plantilla de prompt incluida.
- No hay evidencia en la documentación disponible de soporte de tool calling, function calling, uso de agentes, visión, audio ni modo de pensamiento explícito, aunque al proceder de Qwen3 podría heredar parte del comportamiento del modelo base; no se confirma en la información proporcionada.

## Casos de uso

- Prototipado de asistentes conversacionales en vietnamita: el modelo puede mantener diálogos multi-turno con una ventana declarada de 40.960 tokens, aunque en la práctica los ejemplos de la model card usan 8.192 tokens para no disparar el consumo de memoria de la caché KV.
- Despliegue en hardware muy limitado: con archivos de 0,30 a 0,37 GB y una VRAM recomendada de 2,3 a 2,4 GB, es viable ejecutarlo en portátiles con GPU integrada, mini-PC o incluso CPU, algo inviable con modelos de 7B o superiores.
- Experimentación académica sobre ajuste de dominio: sirve como caso de estudio de fusión de LoRA médico en vietnamita y de cuantización GGUF reproducible, útil para investigar el impacto de Q3 frente a Q4 en un modelo de 0,6B.
- Preprocesado o clasificación de texto sanitario en vietnamita: puede emplearse para resumir o reformular notas breves antes de pasarlas a un modelo mayor, reduciendo coste por token.
- Generación de respuestas de triaje informativo no crítico: dado su ajuste médico, puede redactar explicaciones generales en vietnamita, siempre con revisión humana y sin sustituir asesoramiento profesional, tal como advierte el propio autor.
- Aplicaciones offline y embebidas: al caber en menos de 0,4 GB de pesos, se puede distribuir dentro de una aplicación de escritorio o móvil que use llama.cpp sin conexión a internet.
- Evaluación comparativa de cuantizaciones: los cuatro archivos publicados (Q3_K_S, Q3_K_M, Q4_K_S, Q4_K_M) permiten medir la degradación de calidad frente al ahorro de memoria en un mismo modelo.
- Generación de datos sintéticos en vietnamita para ajuste posterior: puede producir borradores de pares instrucción-respuesta que después se filtren y se usen para entrenar modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,3 GB para las cuantizaciones Q3_K_S y Q3_K_M, y 2,4 GB para Q4_K_S y Q4_K_M, según la tabla de la model card.
- Tamano en disco de los pesos: 0,30 GB (Q3_K_S), 0,32 GB (Q3_K_M), 0,36 GB (Q4_K_S) y 0,37 GB (Q4_K_M).
- Cabe en GPU de consumo: sí, en cualquier GPU con 3 GB o más de VRAM, incluidas GTX 1650, RTX 3050, RTX 3060, RTX 4060 y superiores. También es viable en CPU con 4-6 GB de RAM libre.
- GPU recomendadas: no se especifican en la documentación; dado el tamaño, cualquier GPU consumer moderna es suficiente y no se requiere A100 ni H100.
- Opciones de despliegue: llama.cpp, llama-cpp-python y Ollama son los soportados explícitamente. Para GGUF también existen wrappers sobre vLLM con soporte parcial, pero no se documenta en este repositorio.
- Parametros de inferencia sugeridos por el autor: temperatura 0,6, top_p 0,95 y num_ctx 8.192 en los ejemplos de Ollama y llama-cpp-python.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen-3-0.6B-Reasoning-Vi-Medical-LoRA-GGUF (este) | 596.049.920 | 40.960 | GGUF Q3/Q4 | vi, en | apache-2.0 (repositorio); LoRA MIT | Hugging Face, 0 descargas |
| Qwen/Qwen3-0.6B (modelo base) | 0,6B (familia Qwen3) | 40.960 segun el modelo derivado | safetensors, bfloat16 | multilingue segun el modelo base | apache-2.0 | Hugging Face |
| danhtran2mind/Qwen-3-0.6B-Reasoning-Vi-Medical-LoRA (adaptador) | adaptador LoRA sobre 0,6B | heredado del base | safetensors (adaptador) | vi, en | MIT | Hugging Face |

No se dispone de datos de rendimiento comparado entre estas variantes ni frente a otros modelos de tamano similar como Qwen3-1.7B o Gemma-3-1B, ya que no se han publicado benchmarks en la informacion disponible.

## Limitaciones y advertencias

- Riesgo de alucinacion: la propia model card advierte explicitamente de que el modelo puede generar informacion falsa y de que sus salidas no deben sustituir el consejo profesional en ambitos importantes, en particular el médico.
- Ambito medico sin validacion clinica: no hay evidencia de evaluacion por profesionales sanitarios ni de conjuntos de prueba clinicos; el ajuste LoRA es de origen no verificado en la informacion disponible.
- Cobertura linguistica reducida: solo vietnamita e ingles. El rendimiento en castellano no esta documentado y previsiblemente sera pobre.
- Tamano muy reducido: con 0,6B de parametros, la capacidad de razonamiento complejo, matematicas y coherencia en contextos largos es inherentemente limitada frente a modelos de 7B o mas.
- Contexto declarado frente a contexto usable: aunque la ventana es de 40.960 tokens, los ejemplos recomiendan 8.192; no hay datos sobre la degradacion real en longitudes mayores.
- Cuantizaciones agresivas: Q3_K_S y Q3_K_M pueden degradar la calidad de forma perceptible, especialmente en tareas de razonamiento.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin historial de uso en produccion ni informes de terceros.
- Licencia: el repositorio declara apache-2.0, pero la model card indica que la licencia se determino tras verificar las licencias de origen y que el adaptador es MIT. Conviene revisar los terminos antes de un uso comercial, aunque Apache-2.0 y MIT permiten uso comercial.
- Idoneidad para produccion: al ser un derivado sin benchmarks, sin evaluaciones de seguridad y con un autor sin traccion en la plataforma, no es recomendable como componente critico sin una validacion propia exhaustiva.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces obtenidos correspondian a paginas de producto de Apple y no guardan relacion con la ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BachDaThan/Qwen-3-0.6B-Reasoning-Vi-Medical-LoRA-GGUF
- Modelo base Qwen/Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Adaptador LoRA danhtran2mind/Qwen-3-0.6B-Reasoning-Vi-Medical-LoRA: https://huggingface.co/danhtran2mind/Qwen-3-0.6B-Reasoning-Vi-Medical-LoRA
- Licencia Apache 2.0: https://huggingface.co/BachDaThan/Qwen-3-0.6B-Reasoning-Vi-Medical-LoRA-GGUF/blob/main/LICENSE
- La busqueda web no aporto enlaces adicionales relevantes (papers, blogs, repos o demos) sobre este modelo.
