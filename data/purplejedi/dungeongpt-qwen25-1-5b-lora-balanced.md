# purplejedi/dungeongpt-qwen25-1.5b-lora-balanced

## Resumen

DungeonGPT Qwen2.5-1.5B LoRA Balanced es un adaptador LoRA de tipo PEFT publicado por el usuario purplejedi sobre el modelo base Qwen/Qwen2.5-1.5B. No se trata de un modelo completo, sino de un conjunto de pesos de bajo rango (1.089.536 parametros entrenables, un 0,0705% del total) que se cargan sobre el modelo base sin modificar. Su proposito es especializar un modelo pequeno de 1.500 millones de parametros en la generacion de escenas de rol de mesa (tabletop RPG), siguiendo instrucciones con restricciones explicitas.

El adaptador se entrena sobre el dataset congelado purplejedi/dungeongpt-sft-dataset (4500 ejemplos de entrenamiento y 250 de validacion) y forma parte del proyecto DungeonGPT, cuyo repositorio fuente es sriramrathinavelu/DungeonGPT. La variante "balanced" corresponde al checkpoint del paso 50 de optimizacion, seleccionado por el autor como punto de equilibrio entre adherencia a las restricciones dentro de la distribucion y controlabilidad fuera de ella, antes de que el modelo empiece a sobreajustarse a las plantillas sinteticas a partir del paso 75.

Es relevante por su caracter de experimento reproducible y documentado: incluye hashes SHA-256 de los splits, SHA del commit del repositorio, run de Weights & Biases y metricas de evaluacion sobre 50 prompts de validacion con semilla fija. Su utilidad practica es acotada: un adaptador de 1,5B especializado en un dominio muy concreto y solo en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA (PEFT) |
| Parametros totales | 1.544.803.840 (modelo base) mas 1.089.536 entrenables del adaptador (0,0705%) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-1.5B) |
| Tipos de cuantizacion | No disponible; el autor usa float16 nativo en la inferencia de referencia |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Configuracion LoRA | r=8, lora_alpha=16, target_modules=['q_proj', 'v_proj'] |
| Modelo base | Qwen/Qwen2.5-1.5B (revision 8faed761d45a263340a0528343f099c05c9a4323) |
| Libreria | peft |
| Tamano del repo | 0,0 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-1.5B, un transformer decoder-only de 1.500 millones de parametros. La intervencion LoRA se limita a las proyecciones q_proj y v_proj con rango r=8 y alpha=16, lo que deja el modelo base intacto y anade solo 1.089.536 parametros entrenables. El entrenamiento se realizo con 50 pasos de optimizador, batch efectivo de 8 y learning rate de 0,0002, alcanzando una perdida de validacion de 1,5369. El hardware empleado fue una Tesla T4 en float16, con un pico de memoria de 7,62 GiB y un barrido acumulado de 97,5 segundos.

Los datos de entrenamiento provienen del dataset congelado purplejedi/dungeongpt-sft-dataset (4500 ejemplos de train, 250 de validacion), con hashes SHA-256 documentados para ambos splits, y de CJJones/RPG_Scenes_LLM_Synthetic. El formato de prompt es de instruccion con secciones "### Instruction:" y "### Scene:". No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa; el entrenamiento es SFT supervisado clasico sobre instrucciones de dominio.

## Capacidades

- Generacion de texto descriptivo de escenas de rol de mesa (tabletop RPG) en ingles.
- Seguimiento de restricciones explicitas en la instruccion: el autor reporta un 96,7% de precision individual y un 90,0% de satisfaccion simultanea de las tres restricciones en validacion.
- Finalizacion controlada de la respuesta (EOS Completion Rate del 98,0% frente al 16,0% del base).
- Preservacion de la configuracion solicitada por el usuario en prompts fuera de distribucion (herrero, taberna iluminada por el sol, caverna de la infraoscuridad, puente helado de montana, castillo a medianoche).
- Evitacion de la "deriva" hacia un corpus de tematica siniestra en prompts pacificos, segun la evaluacion OOD del autor (5/5 prompts superados).
- Generacion de texto conversacional segun el pipeline declarado (text-generation).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Generacion de descripciones de escenas para partidas de rol: el adaptador recibe una instruccion con elementos concretos (localizacion, objetos, personajes) y produce una escena que respeta esas restricciones, gracias al 96,7% de adherencia medida en validacion.
- Herramienta de apoyo para directores de juego (Dungeon Masters): generacion rapida de ambientaciones y descripciones de lugares en ingles para improvisar durante una sesion, con la ventaja de que el modelo respeta los elementos pedidos en lugar de inventar otros.
- Prototipado de contenido para videojuegos y modulos de rol: generacion por lotes de descripciones de escenas a partir de plantillas de instruccion, con el modelo base de 1,5B ejecutable en hardware modesto (el autor entreno en una T4).
- Investigacion sobre ajuste fino eficiente: sirve como caso de estudio reproducible de LoRA de bajo rango (r=8) con 50 pasos y metricas de adherencia a restricciones, util para comparar estrategias de SFT en modelos pequenos.
- Evaluacion de sobreajuste a plantillas: el checkpoint del paso 50 se ofrece explicitamente como punto previo al "template lock-in" del paso 75, por lo que es util para estudiar la evolucion de la controlabilidad durante el entrenamiento.
- Filtrado y aumento de datos sinteticos de tematica RPG: el adaptador puede generar escenas controladas que luego se revisan o se usan como semillas para otros pipelines, siempre en ingles y con supervision humana.
- Demostraciones educativas de PEFT: la carga mediante PeftModel.from_pretrained sobre el base permite mostrar en un notebook como un adaptador de 1,1 millones de parametros modifica el comportamiento de un modelo de 1,5B.

## Benchmarks y rendimiento

Evaluacion del autor sobre 50 prompts de validacion retenidos, semilla 42, decodificacion greedy:

| Metrica | Qwen2.5-1.5B base (adaptador desactivado) | Qwen2.5-1.5B + LoRA | Delta |
|---|---:|---:|---:|
| Precision individual de restricciones | 21,3% | 96,7% | +75,3 pp |
| Las tres restricciones satisfechas | 4,0% | 90,0% | +86,0 pp |
| Tasa de finalizacion EOS | 16,0% | 98,0% | +82,0 pp |

Evaluacion fuera de distribucion (OOD): 5/5 prompts superados con EOS=True, preservando la configuracion indicada por el usuario. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 1,5B en float16 ocupa aproximadamente 3 GB de pesos; el adaptador anade unos pocos megabytes. El autor reporta un pico de 7,62 GiB durante el entrenamiento en una Tesla T4, cifra que incluye estados del optimizador y activaciones.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para inferencia en float16; el entrenamiento documentado se hizo en una Tesla T4.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4070 y superiores con 8 GB o mas de VRAM; en configuraciones de 4 GB puede requerir cuantizacion del base.
- Opciones de despliegue: la via documentada es transformers mas peft (PeftModel.from_pretrained). No se documenta compatibilidad explicita con vLLM, llama.cpp, Ollama ni TGI en la informacion disponible; al ser un adaptador LoRA sobre Qwen2.5, su integracion en esos motores dependeria del soporte de adaptadores PEFT del propio motor.
- Latencia y throughput: no disponibles. El unico dato de tiempo es el barrido de entrenamiento de 97,5 segundos acumulados en una T4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DungeonGPT Qwen2.5-1.5B LoRA Balanced (este) | 1,5B base + 1,09M adaptador | No disponible | Escenas de rol de mesa, ingles | MIT | Hugging Face (adaptador PEFT) |
| Qwen/Qwen2.5-1.5B (base) | 1,5B | No disponible en esta ficha | Generacion general | No disponible en esta ficha | Hugging Face |
| Adaptadores LoRA de dominio sobre modelos de 1-3B | Variable | Variable | Variable | Variable | Hugging Face |

No se dispone en la informacion proporcionada de datos de benchmarks estandar ni de comparaciones directas con alternativas especializadas en RPG de tamano similar, por lo que la comparativa cuantitativa con otros modelos queda como no disponible.

## Limitaciones y advertencias

- Solo soporta ingles; no se documenta capacitacion multilingue.
- Especializado en un dominio estrecho (escenas de rol de mesa); su rendimiento en tareas generales sera el del modelo base, no mejorado.
- Riesgo de alucinacion inherente a un modelo de 1,5B, agravado por el ajuste con solo 50 pasos y 4500 ejemplos: puede reproducir patrones de las plantillas sinteticas del dataset.
- El propio autor advierte de un "template lock-in" a partir del paso 75; este checkpoint (paso 50) se eligio precisamente para evitarlo, pero sigue estando proximo a ese umbral.
- Las metricas de evaluacion son del autor, sobre 50 prompts y con una unica semilla; no han sido replicadas de forma independiente.
- El repo figura con 0 descargas y 0 likes en el momento de la consulta, y el tamano reportado es 0,0 GB, lo que sugiere que los pesos pueden no estar efectivamente alojados o que la metadata no refleja el contenido real; conviene verificar la descarga antes de usarlo en produccion.
- Licencia MIT permite uso comercial, pero al derivar del modelo base Qwen2.5-1.5B deben respetarse tambien los terminos de dicho modelo base.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso; no es adecuado para pipelines de agentes sin trabajo adicional.
- La ventana de contexto no se especifica en la informacion disponible; no asumir la del base sin verificarla.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/purplejedi/dungeongpt-qwen25-1.5b-lora-balanced
- Repositorio fuente DungeonGPT: https://github.com/sriramrathinavelu/DungeonGPT
- Dataset de SFT: https://huggingface.co/datasets/purplejedi/dungeongpt-sft-dataset
- Dataset de escenas sinteticas: https://huggingface.co/datasets/CJJones/RPG_Scenes_LLM_Synthetic
- Modelo base Qwen2.5-1.5B: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Run de entrenamiento en Weights & Biases: https://wandb.ai/chillyskywalker/dungeongpt/runs/mrpttatv
