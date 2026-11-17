# Edward11451/CivMarshmallow-ckpts

## Resumen

CivMarshmallow-ckpts es un repositorio de checkpoints de politicas entrenadas para el videojuego Freeciv, desarrollado por el usuario Edward11451 como material suplementario de un envio anonimo a ICLR 2027. No se trata de un modelo de lenguaje de proposito general, sino de un ajuste fino completo (full fine-tuning) del modelo base Qwen/Qwen3-8B orientado a la toma de decisiones en un entorno de estrategia por turnos. El repositorio contiene un unico checkpoint, etiquetado como `sparse-to-civtelescope/`, que corresponde a una politica hibrida "Sparse→CivTelescope" evaluada en la Tabla 3 del articulo asociado.

El modelo hereda la arquitectura transformer densa de Qwen3-8B, con aproximadamente 8 mil millones de parametros, y se distribuye en formato safetensors compatible con la libreria `transformers`. La relevancia actual del repositorio es limitada fuera del contexto de investigacion: se publica como artefacto de reproducibilidad para un paper en revision, con codigo anonimizado alojado en anonymous.4open.science, y no incluye model card descriptiva de capacidades, datos de entrenamiento ni resultados de benchmarks mas alla de la referencia a una tabla del articulo.

El interes tecnico reside en el uso de un LLM de 8B como politica para un entorno de juego complejo (Freeciv), lo que lo situa en la linea de trabajos que emplean modelos de lenguaje como agentes en entornos con estado parcialmente observable y horizonte largo. Sin embargo, la informacion publica disponible es muy escasa: no se detallan hiperparametros, composicion del dataset, tecnicas de RL ni metricas de rendimiento en la propia ficha de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-8B) |
| Parametros totales | Aproximadamente 8 mil millones (modelo base Qwen3-8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors, presumiblemente bf16/fp16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (compatible con `transformers`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-8B, un transformer denso de aproximadamente 8 mil millones de parametros. Sobre esta base se aplica un ajuste fino completo (full fine-tuning), segun indica la model card, para producir una politica de control en Freeciv. El checkpoint publicado corresponde a una fase final de un pipeline denominado "Sparse→CivTelescope hybrid", evaluado en la Tabla 3 del articulo anonimo. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o aprendizaje por refuerzo especifico para el entorno.

La innovacion metodologica que sugiere el nombre del checkpoint es la combinacion de una fase "sparse" con una fase "CivTelescope" (probablemente una variante de entrenamiento o evaluacion especifica del paper). No obstante, al tratarse de un envio anonimo en revision, los detalles tecnicos del entrenamiento no estan accesibles en la ficha publica. El codigo asociado se encuentra en un repositorio anonimizado de anonymous.4open.science, lo que impide verificar autorias, hiperparametros o procedimiento experimental.

## Capacidades

- Generacion de acciones como politica en Freeciv: el checkpoint esta disenado para producir decisiones de juego (posiblemente en formato de texto o tokens de accion) dentro del entorno Freeciv.
- Razonamiento secuencial multi-turno: hereda del modelo base Qwen3-8B la capacidad de mantener contexto a lo largo de una partida, aunque no se documenta la longitud efectiva de contexto utilizada.
- Ajuste especifico al dominio: al ser un full fine-tuning, el modelo esta especializado en el entorno de entrenamiento y probablemente ha perdido parte de la generalidad del modelo base.
- No se documentan capacidades de tool calling, function calling, vision, audio ni modo thinking en la informacion disponible.
- Soporte multilingue: no disponible.

## Casos de uso

- Investigacion en agentes para entornos de estrategia: el checkpoint sirve como referencia reproducible para comparar politicas en Freeciv dentro del marco del paper anonimo. Es adecuado porque el codigo y los pesos se publican conjuntamente para replicar la Tabla 3.
- Evaluacion de tecnicas de ajuste fino completo en LLMs de 8B: permite estudiar como un modelo de lenguaje general se adapta a un dominio de control secuencial con estado parcialmente observable.
- Baseline para metodos de aprendizaje por refuerzo o imitacion en juegos por turnos: al estar basado en Qwen3-8B, puede compararse con otras politicas derivadas del mismo modelo base.
- Reproducibilidad de resultados academicos: el repositorio facilita la carga del checkpoint mediante `AutoModelForCausalLM.from_pretrained(<repo>, subfolder="sparse-to-civtelescope")` para verificar las metricas del articulo.
- Estudio de degradacion de capacidades generales tras fine-tuning especializado: permite medir cuanto del rendimiento original de Qwen3-8B se conserva tras el ajuste en Freeciv.
- Desarrollo de entornos de evaluacion para agentes LLM: el checkpoint puede integrarse en harnesses de evaluacion de agentes que simulen partidas de Freeciv y midan win rate, eficiencia o calidad de decision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente remite a la Tabla 3 del articulo anonimo, sin incluir cifras en la ficha de Hugging Face.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16 GB en bf16/fp16 para los 8B parametros, mas overhead de activaciones y cache KV. En cuantizacion de 8 bits, alrededor de 8-9 GB; en 4 bits, alrededor de 5-6 GB (estimaciones estandar para un modelo denso de 8B, no verificadas para este checkpoint concreto).
- GPU recomendadas: A100 40GB o H100 para inferencia en precision completa con contexto largo; RTX 4090 (24 GB) para bf16 con contexto moderado; RTX 3090/4080 para cuantizacion 8 bits.
- Cabe en GPU de consumo: si, en RTX 4090 con bf16 y en GPUs de 12-16 GB con cuantizacion (si se generan pesos GGUF, no publicados en el repositorio).
- Opciones de despliegue: `transformers` (metodo indicado por el autor), vLLM o TGI para serving, llama.cpp/Ollama solo si se convierten los pesos a GGUF (no incluidos).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| CivMarshmallow-ckpts (este) | ~8B | No disponible | Apache 2.0 | Hugging Face, 1 checkpoint | Politica especializada en Freeciv, sin benchmarks publicos |
| Qwen/Qwen3-8B (base) | ~8B | No disponible en esta ficha | Apache 2.0 | Hugging Face | Modelo generalista; base del ajuste |
| Otros fine-tunes de Qwen3-8B para agentes | ~8B | Variable | Apache 2.0 | Hugging Face | No se dispone de comparativa directa en la informacion proporcionada |

No se dispone de datos de rendimiento comparables para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar de Qwen3-8B, puede heredar sesgos del modelo base, pero no se han evaluado en este checkpoint.
- Riesgo de alucinacion: no evaluado para este fine-tune; en entornos de juego, las salidas pueden ser invalidas si no se restringen a un espacio de acciones valido.
- Limitaciones de contexto o idioma: no se especifica la longitud de contexto efectiva tras el fine-tuning ni los idiomas soportados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo esta disenado como artefacto de investigacion y su utilidad fuera de Freeciv es dudosa.
- Caveat para produccion: el repositorio no incluye tokenizer, configuracion de generacion ni instrucciones de uso mas alla de la carga del checkpoint; la model card es minima y el codigo esta anonimizado, lo que dificulta la validacion independiente.
- El checkpoint puede haber sobreajustado al entorno especifico de entrenamiento y no generalizar a variantes de Freeciv o a otros juegos.
- No se han publicado evaluaciones de seguridad, robustez ni comportamiento adversarial.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Edward11451/CivMarshmallow-ckpts
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Codigo anonimizado: https://anonymous.4open.science/r/CivMarshmallow/
