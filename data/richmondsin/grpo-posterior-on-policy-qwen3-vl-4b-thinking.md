# richmondsin/grpo-posterior-on-policy-qwen3-vl-4b-thinking

## Resumen

grpo-posterior-on-policy-qwen3-vl-4b-thinking es un ajuste fino del modelo multimodal Qwen/Qwen3-VL-4B-Thinking, desarrollado por el usuario richmondsin. No se trata de un modelo entrenado desde cero, sino de la fusión (merge) de un adaptador LoRA sobre los pesos del modelo base, distribuida como un checkpoint completo listo para usar con transformers. El adaptador proviene de una ejecución de aprendizaje por refuerzo con GRPO (Group Relative Policy Optimization) en modo on-policy, etiquetada por el autor como "posterior learning" y ejecutada sobre el entorno RLVB.

El modelo hereda del base Qwen3-VL-4B-Thinking la arquitectura Qwen3-VL, con aproximadamente 4.437 millones de parámetros (4,44 B) y capacidad de razonamiento multimodal (texto e imagen). El pipeline declarado es image-text-to-text, es decir, entrada de imagen y texto con salida de texto. El ajuste se realizó con un LoRA de rango 16 y alpha 32 (escala 2,0), fusionado en fp32 y almacenado en bf16, afectando a 252 módulos del modelo; el resto de tensores son idénticos byte a byte al base.

Su relevancia es acotada: es un experimento de investigación sobre RL aplicado a un VLM de 4B con modo thinking, publicado con verificación de integridad del merge (MERGE-REPORT.json) pero sin model card descriptiva de capacidades, sin datos de entrenamiento detallados y sin resultados de benchmarks. Resulta útil como referencia para quienes estudian GRPO on-policy sobre modelos multimodales pequeños, no como modelo de producción validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (transformer multimodal vision-language, modo thinking); detalles internos no disponibles |
| Parametros totales | 4.437.815.808 (~4,44 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; pesos publicados en bf16 (safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers); repo de 8,9 GB |
| Modelo base | Qwen/Qwen3-VL-4B-Thinking |
| Tipo de ajuste | LoRA fusionado (r 16, alpha 32, escala 2,0), 252 modulos |
| Metodo de entrenamiento | GRPO on-policy (RLVB), actualizacion 46 (ultima de la ejecucion) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-VL-4B-Thinking, un transformer multimodal de la familia Qwen3-VL que procesa entradas de imagen y texto y genera texto, con un modo de razonamiento ("thinking") heredado del base. El autor no documenta en la model card la composicion interna (número de capas, dimensiones, mecanismo de atencion ni codificador visual), por lo que esos detalles deben consultarse en la model card del modelo base.

El entrenamiento consiste en una ejecucion de GRPO on-policy sobre el entorno RLVB: sin belief score y con partidas nuevas antes de cada actualizacion, hasta la actualizacion 46, que es la que se publica. El adaptador LoRA resultante (rango 16, alpha 32) se fusiono con la regla W <- W + (lora_alpha / r) * B @ A (escala 2,0), calculada en fp32 y almacenada en bf16, sobre 252 modulos. El autor verifico el merge: tres modulos aleatorios quedan dentro del redondeo bf16 de la operacion esperada, 461 tensores restantes son identicos byte a byte al base y el total de bytes de tensores coincide con el base (8.875.631.616). No se especifican el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo etapas adicionales de RLHF o DPO mas alla del propio GRPO.

## Capacidades

- Generacion de texto e imagen-texto: el pipeline declarado es image-text-to-text, por lo que acepta imagenes junto a instrucciones textuales y produce respuestas de texto.
- Razonamiento en modo thinking: hereda del base Qwen3-VL-4B-Thinking la capacidad de generar cadenas de razonamiento antes de la respuesta final.
- Conversacion multi-turno: la etiqueta "conversational" y la plantilla de chat del base estan preservadas sin cambios.
- Compatibilidad con endpoints: etiquetado como endpoints_compatible, puede desplegarse en infraestructura de inferencia compatible con transformers.
- Tool calling / function calling: no documentado en la informacion disponible; probablemente heredado del base, pero no confirmado por el autor.
- Capacidades de agente y razonamiento multi-paso: no documentadas especificamente para este checkpoint.
- Capacidades multilingues: no disponibles; el autor no declara idiomas.
- Capacidades especiales (audio, vision adicional): solo se confirma vision por imagen a traves del pipeline image-text-to-text; no hay datos sobre audio u otras modalidades.

## Casos de uso

- Investigacion en RL para VLMs: sirve como punto de comparacion frente al base Qwen3-VL-4B-Thinking para medir el efecto de 46 actualizaciones de GRPO on-policy sobre un LoRA de rango 16; util en estudios de reproducibilidad de RL aplicado a modelos multimodales pequenos.
- Analisis de documentos con imagen: al conservar el pipeline image-text-to-text, puede recibir capturas, diagramas o paginas escaneadas y generar descripciones o respuestas textuales; adecuado para prototipos de extraccion de informacion visual.
- Experimentos de razonamiento visual: el modo thinking permite generar trazas de razonamiento antes de responder sobre una imagen, util para analizar como el RL modifica dichas trazas frente al base.
- Evaluacion de tecnicas de merge de LoRA: el MERGE-REPORT.json y la verificacion byte a byte lo convierten en un caso practico para validar pipelines de fusion de adaptadores en fp32 con almacenamiento bf16.
- Base para nuevos ajustes: al ser un checkpoint completo en safetensors, puede servir como inicializacion para experimentos posteriores de RL o SFT, evitando recomponer el merge base + adaptador.
- Demos de inferencia multimodal en transformers: con 4,44 B de parametros en bf16 (repo de 8,9 GB), es viable en GPUs de gama alta para pruebas de concepto de razonamiento sobre imagen, siempre que se acepte la ausencia de benchmarks publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones multimodales, ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9 GB solo para pesos (4,44 B parametros x 2 bytes), mas overhead de activaciones, cache KV y procesador de vision; en la practica, entre 12 y 16 GB para contextos moderados, aunque la longitud de contexto no esta documentada.
- Cuantizacion: no se publican versiones GGUF ni cuantizadas; para reducir VRAM habria que generarlas a partir de los safetensors.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 4090 (24 GB) para bf16 sin cuantizar; GPUs de 16 GB podrian ser suficientes con cuantizacion a 8 bits, no verificada.
- Cabe en GPU de consumo: si, en RTX 4090 y potencialmente en RTX 4080/3090 (24 GB) en bf16; en GPUs de 16 GB solo con cuantizacion no oficial.
- Opciones de despliegue: transformers (libreria declarada) y endpoints compatibles; vLLM, llama.cpp, Ollama o TGI no estan confirmados para esta arquitectura concreta en la informacion disponible.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| grpo-posterior-on-policy-qwen3-vl-4b-thinking | ~4,44 B | no disponible | imagen-texto | no disponible | LoRA GRPO fusionado, sin benchmarks publicados |
| Qwen/Qwen3-VL-4B-Thinking (base) | ~4,44 B | no disponible en esta ficha | imagen-texto | la del base (consultar su model card) | Referencia directa; este checkpoint deriva de el |
| Otros VLM de ~4 B (p. ej., familias Qwen2.5-VL o similares) | ~3-4 B | variable | imagen-texto | variable | Comparacion no disponible con datos verificados en la informacion proporcionada |

La comparacion cuantitativa con alternativas no es posible: no hay benchmarks publicados para este checkpoint ni datos de rendimiento del ajuste frente al base.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks ni comparaciones con el base, por lo que no puede afirmarse que el ajuste GRPO mejore al modelo original en ninguna tarea.
- Licencia no declarada: la model card no especifica licencia; antes de cualquier uso comercial debe verificarse la licencia de Qwen/Qwen3-VL-4B-Thinking y la del propio repositorio.
- Idiomas no declarados: se desconoce la cobertura linguistica efectiva del checkpoint fusionado.
- Riesgo de alucinacion: inherente a los modelos generativos multimodales; sin evaluaciones, no hay estimacion de su magnitud.
- Sesgos: no documentados por el autor; el base puede arrastrar sesgos de sus datos de entrenamiento, no caracterizados aqui.
- Diferencias por el merge: el autor advierte que, al fusionar en bf16, las salidas pueden diferir ligeramente de ejecutar base + adaptador en tiempo de ejecucion.
- Naturaleza experimental: es un artefacto de investigacion (actualizacion 46 de una ejecucion RLVB) sin senales de validacion en produccion, con 0 descargas y 0 likes en el momento de la consulta.
- Contexto desconocido: al no documentarse la longitud de contexto, no debe asumirse ninguna ventana concreta para cargas de trabajo de contexto largo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richmondsin/grpo-posterior-on-policy-qwen3-vl-4b-thinking
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Thinking
- README del base incluido en el repo: README.base.md (dentro del repositorio del modelo)
- Informe de verificacion del merge: MERGE-REPORT.json (dentro del repositorio del modelo)
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
