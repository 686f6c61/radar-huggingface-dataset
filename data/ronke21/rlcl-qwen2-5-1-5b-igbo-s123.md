# ronke21/rlcl-Qwen2.5-1.5B-igbo-s123

## Resumen

`ronke21/rlcl-Qwen2.5-1.5B-igbo-s123` es un ajuste fino (fine-tune) del modelo Qwen2.5-1.5B, publicado por el usuario ronke21 en Hugging Face. Segun los metadatos del repositorio, se trata de un modelo derivado mediante la tecnica RLCL (Reinforcement Learning with Catastrophic forgetting mitigation / LoRA merging, segun los tags `rlcl`, `forgetting` y `lora-merged`), orientado a la lengua igbo. El modelo base es Qwen2.5-1.5B, un transformer decoder-only de 1.543.714.304 parametros.

El interes de esta ficha es acotado: se trata de un experimento de investigacion sobre olvido catastrofico en el ajuste fino multilingue, no de un modelo de produccion. El repositorio tiene cero descargas y cero likes en el momento de la consulta, no declara licencia ni idiomas soportados, y el acceso esta restringido (gated), lo que exige aceptar condiciones en Hugging Face antes de descargarlo. La fecha de creacion indicada en los metadatos es 2026-11-27.

La relevancia practica es limitada pero concreta: sirve como referencia para quienes investigan tecnicas de adaptacion a idiomas de bajos recursos (igbo, Nigeria) sin degradar las capacidades originales del modelo base, y como ejemplo de pipeline LoRA mergeado sobre Qwen2.5. No hay publicacion de benchmarks ni documentacion tecnica adjunta en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 1.543.714.304 (1,54 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen2.5-1.5B, sin confirmar en esta ficha) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | no disponibles (el nombre del modelo sugiere igbo, no declarado oficialmente) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 3,1 GB |
| Libreria | transformers |
| Pipeline | text-generation |
| Modelo base | Qwen/Qwen2.5-1.5B |
| Tecnica de ajuste | RLCL con LoRA mergeado (`lora-merged`, `forgetting`) |
| Acceso | restringido (gated) |
| Tags adicionales | `text-generation-inference`, `endpoints_compatible`, `conversational` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-1.5B: un transformer decoder-only denso con atencion causal estandar, tokenizador BPE de la familia Qwen y pesos en safetensors. El repositorio no incluye model card con detalles de capas, dimensiones ocultas, cabezas de atencion ni vocabulario, por lo que esos datos no estan disponibles en la informacion proporcionada.

El entrenamiento declarado por los tags es un ajuste fino con la tecnica RLCL sobre el modelo base, con fusion (merge) de adaptadores LoRA en los pesos finales. El tag `forgetting` sugiere que el objetivo del experimento es medir o mitigar el olvido catastrofico al adaptar el modelo a igbo, y el sufijo `s123` probablemente identifica una semilla o configuracion experimental concreta. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni hiperparametros. No hay informacion sobre innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto conversacional (`conversational` en los tags), heredada del base Qwen2.5-1.5B.
- Adaptacion al igbo como idioma objetivo del ajuste fino, segun el nombre del modelo; no confirmado en model card.
- Compatibilidad con Text Generation Inference (TGI) y endpoints compatibles (`endpoints_compatible`).
- Razonamiento basico, codigo y matematicas a nivel de un modelo de 1,5 B, sin datos de evaluacion publicados.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y multi-step reasoning: no documentadas.
- Capacidades multilingues: no declaradas oficialmente.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Investigacion sobre olvido catastrofico: usar el modelo como punto de comparacion frente a Qwen2.5-1.5B original para medir la degradacion en tareas generales tras el ajuste a igbo.
- Experimentos de adaptacion a idiomas de bajos recursos: servir de plantilla para replicar el pipeline RLCL + LoRA merge en otros idiomas africanos con pocos datos.
- Generacion de texto en igbo para prototipos: si el ajuste es efectivo, util para borradores y traduccion asistida en entornos de investigacion, con revision humana obligatoria.
- Evaluacion de tecnicas de merge de LoRA: comparar la fusion de adaptadores frente a otros metodos (QLoRA, full fine-tuning) en un modelo de 1,5 B manejable en una sola GPU.
- Base para fine-tunes posteriores: al ser un modelo pequeno y en safetensors, puede servir de punto de partida para experimentos de alineacion o instruccion en igbo.
- Despliegue ligero en TGI para demos: el tag `text-generation-inference` y el tamano de 1,5 B permiten servirlo en una GPU consumer para pruebas internas, siempre que se acepte la condicion de acceso gated.
- Reproducibilidad de experimentos academicos: el identificador `s123` sugiere una semilla concreta, util para replicar resultados en papers sobre forgetting.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,1 GB solo de pesos, mas overhead de activaciones y KV cache; en la practica, unos 4-6 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 2 GB de pesos; en 4 bits, alrededor de 1 GB (no se publican pesos cuantizados, habria que generarlos).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060 Ti, RTX 4060, RTX 4090, A10, L4); A100/H100 no son necesarias para este tamano.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna con 8 GB o mas, e incluso en equipos con 6 GB usando cuantizacion.
- Opciones de despliegue: transformers (libreria declarada), Text Generation Inference (tag `text-generation-inference`), y conversion a GGUF para llama.cpp/Ollama si se generan los pesos (no publicados).
- Latencia y throughput: no disponibles; al ser un modelo de 1,5 B, se espera un throughput alto en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ronke21/rlcl-Qwen2.5-1.5B-igbo-s123 | 1,54 B | no disponible | no disponible | gated, 0 descargas | Fine-tune RLCL para igbo |
| Qwen/Qwen2.5-1.5B | 1,54 B | 32.768 tokens (segun model card oficial de Qwen2.5) | Apache 2.0 (segun model card oficial) | publico, ampliamente usado | Modelo base, multilingue |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens (segun model card oficial) | Apache 2.0 (segun model card oficial) | publico | Version alineada para instrucciones |

La comparativa se limita al modelo base y su variante instruct, ya que no se conocen otros fine-tunes publicos de Qwen2.5-1.5B especificos para igbo en la informacion disponible. Los datos de contexto y licencia de los modelos Qwen provienen de sus model cards oficiales, no de este repositorio.

## Limitaciones y advertencias

- Ausencia total de model card: no hay documentacion sobre datos de entrenamiento, hiperparametros ni evaluacion, lo que impide validar la calidad del ajuste.
- Licencia no declarada: no se puede asumir uso comercial permitido; ademas, el acceso es gated y requiere aceptar condiciones en Hugging Face.
- Riesgo de olvido catastrofico: el propio tag `forgetting` indica que el ajuste puede degradar capacidades generales del base; no hay mediciones que lo cuantifiquen.
- Riesgo de alucinacion: inherente a un modelo de 1,5 B, especialmente en un idioma de bajos recursos como el igbo, donde los datos de entrenamiento suelen ser escasos.
- Idiomas no declarados: no se confirma oficialmente que el modelo mantenga el multilingueismo del base ni el nivel de igbo alcanzado.
- Sesgos: no documentados; los sesgos del base Qwen2.5-1.5B se heredan y pueden amplificarse con el ajuste.
- Sin cuantizaciones publicadas: no hay GGUF ni AWQ/GPTQ, lo que limita el despliegue en entornos sin GPU o con poca VRAM sin trabajo adicional.
- Cero adopcion (0 descargas, 0 likes): no hay evidencia de uso en produccion ni reportes de la comunidad.
- Fecha de creacion futura en los metadatos (2026-11-27): conviene verificar la integridad del repositorio antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ronke21/rlcl-Qwen2.5-1.5B-igbo-s123
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion proporcionada.
