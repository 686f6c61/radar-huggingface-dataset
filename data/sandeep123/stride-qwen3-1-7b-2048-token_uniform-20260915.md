# sandeep123/stride-qwen3-1.7b-2048-token_uniform-20260915

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) entrenado mediante aprendizaje por refuerzo con el metodo STRIDE sobre el modelo base Qwen/Qwen3-1.7B. Se trata de una ablacion concreta denominada "token_uniform", en la que la bonificacion por diversidad de cada respuesta se reparte de forma uniforme entre sus tokens elegibles. El objetivo es especializar un modelo denso de 1.700 millones de parametros en tareas de razonamiento matematico, manteniendo el coste de entrenamiento bajo gracias al uso de adaptadores de bajo rango.

El adaptador se ha entrenado sobre una particion fija de 2.048 preguntas, con un plan de 4 epocas y cuatro metodos comparados bajo el mismo esquema experimental. El repositorio publica cada adaptador de actualizacion del optimizador, incluida la actualizacion cero (adaptador inicial sin entrenar), cada uno en una carpeta inmutable con pesos safetensors, configuracion, tokenizador, plantilla de chat, metadatos y un manifiesto SHA256. Es, por tanto, un artefacto de investigacion mas que un modelo listo para produccion.

La relevancia de la ficha radica en su transparencia metodologica: el autor no declara ninguna evaluacion ni superioridad frente a alternativas, y advierte de que acertar la respuesta final no verifica cada paso intermedio de la demostracion. El modelo base no se incluye en el repositorio y esta fijado a un commit concreto de Qwen3-1.7B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only denso (Qwen/Qwen3-1.7B) |
| Parametros totales | Modelo base: 1.700 millones (aprox.); adaptador LoRA: no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens durante el entrenamiento (prompt + respuesta); contexto nativo del base Qwen3-1.7B: 32.768 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (heredados del modelo base, que es multilingue) |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato PEFT) + adapter_config.json |

## Arquitectura y entrenamiento

El modelo base es Qwen3-1.7B, un transformer decoder-only denso de aproximadamente 1.700 millones de parametros. Sobre el se aplica un adaptador LoRA con rango 16, alpha 32, dropout 0 y sin sesgo, dirigido a los modulos de proyeccion q, k, v y o, ademas de gate, up y down. El entrenamiento emplea aprendizaje por refuerzo con un esquema denominado STRIDE, cuya variante "token_uniform" distribuye la bonificacion por diversidad de cada respuesta de forma uniforme sobre todos sus tokens elegibles, en lugar de concentrarla en posiciones concretas.

El plan experimental cubre 4 epocas sobre la misma particion de 2.048 preguntas para cada uno de cuatro metodos. El lote global de prompts es de 64 preguntas con ocho rollouts cada una (512 respuestas por actualizacion), lo que da 32 actualizaciones por epoca y 128 actualizaciones planificadas, con semilla aleatoria 42. La ventana de prompt mas respuesta esta limitada a 8.192 tokens. Se desconoce la composicion exacta del dataset, el numero total de tokens de entrenamiento y si hubo fases adicionales de RLHF o DPO mas alla del esquema RL descrito. El autor indica que el codigo de entrenamiento se conserva por separado y no se publica en este repositorio; tampoco se han publicado datos de benchmarks.

## Capacidades

- Generacion de texto y razonamiento matematico con cadenas de pensamiento orientadas a problemas del conjunto de entrenamiento.
- Resolucion de problemas matematicos paso a paso, con la advertencia de que la validez de los pasos intermedios no esta verificada.
- Generacion de multiples rollouts (ocho por prompt en el esquema de entrenamiento), util para muestreo diverso.
- Hereda del Qwen3-1.7B base las capacidades generales de generacion, comprension multilingue y posible soporte de tool calling / function calling (no verificado en este adaptador).
- Capacidad de continuar el entrenamiento del adaptador con `is_trainable=True` y un optimizador reinicializado.
- Capacidad de reanudar el entrenamiento original exacto usando los ficheros de `latest-resume/` (estado de Adam, RNG por rango y adaptador correspondiente) bajo la misma topologia de cuatro aprendices.
- No se documentan capacidades de vision, audio ni modo de pensamiento explicito en la informacion facilitada.

## Casos de uso

- Investigacion en aprendizaje por refuerzo: el repositorio publica cada adaptador de actualizacion, lo que permite estudiar la evolucion del aprendizaje a lo largo de las actualizaciones y comparar la variante "token_uniform" frente a otros metodos.
- Analisis de diversidad en generacion: al repartir la bonificacion de diversidad de forma uniforme entre tokens elegibles, sirve para experimentar con estrategias de muestreo diverso en tareas matematicas.
- Generacion de datos sinteticos de razonamiento: los multiples rollouts por pregunta pueden emplearse para producir candidatos de solucion que despues se filtran o se anotan.
- Experimentos de destilacion o evaluacion de verificadores: util para probar verificadores de pasos intermedios, dado que el autor advierte que la respuesta final correcta no garantiza pasos correctos.
- Fine-tuning continuado sobre dominios especificos: al ser un adaptador portable, puede servir como punto de partida para ajustes adicionales con nuevo optimizador.
- Despliegue ligero en entornos con recursos limitados: al partir de un modelo de 1.700 millones de parametros, el conjunto base mas adaptador cabe en GPU de consumo (ver seccion de hardware).
- Reproducibilidad de experimentos: las carpetas inmutables con manifiestos SHA256 y el estado de reanudacion permiten repetir o auditar el proceso de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explicitamente que no se realiza ninguna afirmacion de evaluacion ni de superioridad.

## Requisitos de hardware

- VRAM estimada para inferencia (solo el base, en bf16): aproximadamente 3,4 GB de pesos mas memoria para activaciones y cache KV; en la practica suele ser suficiente con 6-8 GB de VRAM.
- El adaptador LoRA anade un consumo marginal de memoria en inferencia respecto al modelo base.
- GPU compatibles: cualquier GPU moderna con al menos 8 GB de VRAM (por ejemplo RTX 3060 12 GB, RTX 4060, RTX 4070, RTX 4090); el modelo tambien puede ejecutarse en A100 y H100 sin problema.
- Cabe en GPU de consumo: si, de forma holgada en modelos con 8-12 GB de VRAM e incluso en CPU o Apple Silicon si se cuantiza.
- Opciones de despliegue: transformers + PEFT (metodo descrito en la model card, cargando el adaptador con `PeftModel.from_pretrained`); vLLM y TGI admiten adaptadores LoRA en sus versiones recientes; para llama.cpp u Ollama seria necesario fusionar previamente el adaptador con el modelo base.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Los valores de esta tabla proceden de informacion publica de cada modelo y no estan verificados en la fuente proporcionada; deben confirmarse antes de su uso.

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (sobre Qwen3-1.7B) | 1.700 M (base) + LoRA r16 | Entrenamiento 8.192 tokens; base 32.768 | Razonamiento matematico (RL, STRIDE token_uniform) | no disponible | Adaptador en HuggingFace, base externa |
| Qwen/Qwen3-1.7B | 1.700 M | 32.768 tokens (ampliable) | Proposito general multilingue | Apache 2.0 | Pesos publicos |
| Qwen2.5-Math-1.5B | 1.500 M | no verificado | Matematicas | no verificado | Pesos publicos |
| DeepSeek-R1-Distill-Qwen-1.5B | 1.500 M | no verificado | Razonamiento matematico destilado | no verificado | Pesos publicos |

El adaptador no publica metricas que permitan situarlo frente a estas alternativas; la comparacion es estructural (tamano, contexto y especializacion).

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribucion, lo que impide su adopcion en produccion sin aclaracion previa.
- Es un adaptador, no un modelo autonomo: requiere descargar por separado Qwen/Qwen3-1.7B en el commit fijado; el autor no incluye los pesos base en el repositorio.
- No se ha publicado ninguna evaluacion ni benchmark; no hay evidencia de mejora frente al modelo base.
- El autor advierte que acertar la respuesta final no verifica cada paso intermedio, por lo que las cadenas de razonamiento pueden contener errores aunque el resultado sea correcto.
- Riesgo de alucinacion propio de un modelo de 1.700 millones de parametros, especialmente en matematicas fuera de la distribucion de entrenamiento.
- El entrenamiento se realizo sobre 2.048 preguntas, una particion pequena que favorece el sobreajuste al conjunto y limita la generalizacion.
- Es un artefacto experimental publicado durante un proceso de ablacion; el propio autor indica que la finalizacion del entrenamiento no se deduce del plan de epocas, sino del contenido real de `checkpoint_index.json`.
- Continuar el entrenamiento mas alla de 4 epocas requiere la opcion `--allow-epoch-extension` y mantener intactos el resto de campos del contrato cientifico.
- El codigo de entrenamiento no se publica, lo que dificulta la reproduccion completa por terceros.
- Idiomas soportados no documentados especificamente para el adaptador (heredados del base).

## Enlaces

- HuggingFace: https://huggingface.co/sandeep123/stride-qwen3-1.7b-2048-token_uniform-20260915
- Modelo base Qwen/Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B (commit fijado 70d244cc86ccca08cf5af4e1e306ecf908b1ad5e)
- No se han encontrado papers, blogs, repositorios o demos adicionales en la busqueda web proporcionada.
