# Praha-Labs/MoE-tikz

## Resumen

MoE-tikz es un adaptador LoRA publicado por Praha-Labs sobre el modelo base Qwen/Qwen3.6-35B-A3B-FP8, un transformer de tipo mezcla de expertos (MoE) con 35B parametros totales y 3B activos por token. El adaptador especializa el modelo en una tarea muy concreta: convertir una descripcion en lenguaje natural de una figura en un documento LaTeX completo y compilable que la dibuja con TikZ. No es un modelo generalista, sino un ajuste fino orientado a produccion de codigo grafico LaTeX.

La relevancia de esta ficha es doble. Por un lado, documenta un caso de uso muy vertical (generacion de TikZ) donde los modelos generalistas suelen fallar por errores de sintaxis o de compilacion. Por otro, ilustra una tecnica de entrenamiento poco habitual: el adaptador ataca los tensores de los expertos enrutados del MoE mediante `target_parameters` de PEFT, no solo las capas de atencion. Esto permite especializar el conocimiento del modelo sin reentrenar los 35B parametros completos, con 3,72B parametros entrenables y un coste de 4 h 23 min en dos B200.

El modelo se entreno en modo no-thinking, con una unica epoca sobre 417.748 pares instruccion-codigo del dataset DaTikZ-V4-Instruct-422K, y se distribuye como adaptador PEFT en safetensors (14,9 GB de repositorio). La model card no publica tasa de compilacion ni fidelidad visual de las figuras generadas, solo la perdida de evaluacion sobre tokens de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) sobre Qwen3.6-35B-A3B-FP8; adaptador LoRA |
| Parametros totales | 35B en el modelo base; 3,72B parametros entrenables en el adaptador |
| Parametros activos | 3B activos por token en el modelo base (MoE) |
| Longitud de contexto | 8.192 tokens (longitud maxima de secuencia usada en entrenamiento); contexto nativo del base no disponible |
| Tipos de cuantizacion | El base se distribuye en FP8; el adaptador se puede cargar en 4 bits o sin cuantizar via Unsloth (`load_in_4bit=False` en el ejemplo oficial) |
| Idiomas soportados | No disponible (no declarados en la model card) |
| Licencia | La del modelo base Qwen/Qwen3.6-35B-A3B-FP8 (no especificada en la ficha); el codigo de entrenamiento deriva de Unsloth bajo LGPL-3.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA); requiere PEFT con soporte de `target_parameters` |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 40 capas, de las cuales 10 son de atencion completa y el resto presumiblemente de atencion lineal o eficiente (la model card solo menciona "10 full-attention layers"). El adaptador LoRA tiene rango 64 y alpha 64, sin dropout, y se aplica a dos grupos de tensores: los expertos enrutados (`mlp.experts.gate_up_proj` y `mlp.experts.down_proj`) y el experto compartido (`gate/up/down_proj`) en las 40 capas, mas las proyecciones `q/k/v/o_proj` en las 10 capas de atencion completa. Esta cobertura sobre los expertos es la innovacion tecnica destacable: la mayoria de adaptadores LoRA solo tocan atencion, mientras que aqui se especializa el conocimiento experto del MoE.

El entrenamiento uso Unsloth sobre 2 GPU B200, batch de 64 muestras (32 por GPU), padding-free y sin packing, con AdamW de 8 bits, learning rate 2e-4 seleccionado por barrido (5e-5, 1e-4, 2e-4 y 4e-4; este ultimo inestable), scheduler coseno, 2% de warmup y grad norm maxima de 1.0. Se entreno una sola epoca (6.528 pasos) sobre 417.748 pares de entrenamiento y 1.000 de evaluacion, descartando el 0,9% de muestras de mas de 8.192 tokens. La perdida se calculo solo sobre el turno del asistente (codigo TikZ y token de fin de turno). La perdida de evaluacion bajo de 0,3515 en el paso 500 a 0,2531 al final, con descensos monotonos en todos los puntos de control.

## Capacidades

- Generacion de codigo TikZ y LaTeX completo y autonomo a partir de una descripcion textual de una figura.
- Produccion de documentos `standalone` compilables, con preambulo y entorno `tikzpicture` incluidos.
- Razonamiento geometrico basico implicito: el modelo traduce relaciones espaciales descritas en lenguaje natural (angulos, etiquetas, lados) a coordenadas y comandos TikZ.
- Modo no-thinking exclusivamente: se entreno con `enable_thinking=False` y el prompt de sistema fijo de la model card.
- No hay evidencia de soporte de tool calling, function calling ni razonamiento multi-paso con agentes en la informacion disponible.
- Capacidades multilingues no documentadas; el prompt de sistema y el dataset estan en ingles.
- No se declaran capacidades de vision, audio ni otras modalidades.

## Casos de uso

- Generacion automatica de diagramas en documentacion tecnica: a partir de una descripcion textual de un circuito, grafo o esquema, el modelo produce el documento LaTeX con TikZ listo para incluir en un manual o paper, evitando escribir coordenadas a mano.
- Ilustracion de material docente de matematicas y fisica: el modelo puede generar figuras geometricas etiquetadas (triangulos, angulos, vectores) descritas en lenguaje natural, adecuado para apuntes y ejercicios.
- Pipeline de publicacion cientifica: integrado en un flujo que recibe descripciones de figuras de autores y devuelve codigo TikZ compilable, reduciendo el trabajo de maquetacion en revistas y tesis.
- Generacion de diagramas en CI/CD documental: el adaptador se puede invocar desde un servicio que compile el LaTeX resultante y valide la salida, aunque la model card advierte que no se ha medido la tasa de compilacion.
- Prototipado rapido de figuras para blogs y presentaciones: descripciones cortas en ingles generan documentos TikZ que se pueden compilar a PDF o SVG para web.
- Especializacion sobre un modelo MoE grande: sirve como referencia tecnica para equipos que quieran adaptar los tensores de expertos de un MoE con PEFT y Unsloth, no solo las capas de atencion.
- Fine-tuning reproducible de bajo coste: con 3,72B parametros entrenables y 4 h 23 min en dos B200, es un ejemplo realista de especializacion vertical de un modelo de 35B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La unica metrica publicada es la perdida de evaluacion sobre 1.000 pares retenidos:

| Paso | 500 | 1000 | 2000 | 3000 | 4000 | 5000 | 6000 | Final (6528) |
|---|---|---|---|---|---|---|---|---|
| Eval loss | 0,3515 | 0,3382 | 0,3094 | 0,2888 | 0,2723 | 0,2592 | 0,2536 | 0,2531 |

Barrido de learning rate (300 pasos, batch 64): 5e-5 → 0,3554; 1e-4 → 0,3456; 2e-4 → 0,3385; 4e-4 → 0,3355 (inestable). La propia model card advierte que la perdida de evaluacion solo mide prediccion del siguiente token sobre codigo de referencia y que la tasa de compilacion y la fidelidad visual de las figuras generadas no se han medido.

## Requisitos de hardware

- VRAM estimada: el modelo base son 35B parametros; en FP8 requiere aproximadamente 35-40 GB solo para pesos, mas overhead de activaciones y cache KV. En 4 bits se reduce a unos 18-20 GB, pero el adaptador se entreno y valida con el base en FP8.
- GPU recomendadas: B200 (usadas en entrenamiento), H100 80 GB y A100 80 GB para inferencia comoda en FP8. Una RTX 4090 de 24 GB no cabe en FP8 sin cuantizacion adicional; en 4 bits podria ser ajustada pero no esta validado en la model card.
- Cabe en GPU de consumo solo con cuantizacion agresiva (4 bits) y posiblemente offloading; no hay datos de latencia ni throughput publicados.
- Opciones de despliegue: el ejemplo oficial usa Unsloth (`FastLanguageModel.from_pretrained` con `load_in_4bit=False`). No se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador; PEFT con soporte de `target_parameters` es requisito (Unsloth 2026.11 lo soporta).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay datos de benchmarks ni de rendimiento para comparar con alternativas. A continuacion se comparan caracteristicas estructurales con modelos de la misma categoria (especializacion en generacion de codigo LaTeX/TikZ sobre un LLM grande):

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MoE-tikz (este) | 35B totales / 3B activos (base) + 3,72B adaptador | 8.192 | LoRA sobre MoE, TikZ/LaTeX | La del base Qwen3.6-35B-A3B-FP8 (no especificada) | Hugging Face, adaptador PEFT |
| Modelo base Qwen/Qwen3.6-35B-A3B-FP8 | 35B / 3B activos | No disponible | LLM generalista MoE | No disponible | Hugging Face |
| Alternativas especializadas en TikZ | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion sobre otros adaptadores o modelos especializados en TikZ con los que establecer una comparacion tecnica rigurosa.

## Limitaciones y advertencias

- Solo se entreno en modo no-thinking; usarlo con `enable_thinking=True` o con otro prompt de sistema puede degradar la calidad de forma significativa.
- La perdida de evaluacion no garantiza que el codigo TikZ generado compile ni que la figura sea visualmente fiel; la model card lo declara explicitamente como no medido.
- Contexto limitado a 8.192 tokens en entrenamiento; descripciones de figuras muy largas o conversaciones multi-turno largas pueden quedar fuera de distribucion.
- Idiomas no declarados; el dataset y el prompt de sistema estan en ingles, por lo que el rendimiento en castellano no esta garantizado.
- Riesgo de alucinacion de comandos TikZ o paquetes LaTeX inexistentes, con fallos de compilacion consiguientes.
- Licencia del adaptador heredada del modelo base Qwen/Qwen3.6-35B-A3B-FP8, no especificada en la ficha; es imprescindible verificar las condiciones del base antes de uso comercial. El codigo de entrenamiento derivado de Unsloth esta bajo LGPL-3.0.
- Requiere una version de PEFT con soporte de `target_parameters`; versiones antiguas no cargaran el adaptador.
- Repositorio de 14,9 GB solo para el adaptador, lo que implica requisitos de almacenamiento y de ancho de banda considerables.
- Sin descargas ni likes en el momento de la consulta y con fecha de creacion muy reciente; no hay validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Praha-Labs/MoE-tikz
- Dataset de entrenamiento: https://huggingface.co/datasets/Praha-Labs/DaTikZ-V4-Instruct-422K
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B-FP8
- Unsloth (libreria de entrenamiento): https://github.com/unslothai/unsloth
