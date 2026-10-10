# qiusizhan/Qwen2.5-Coder-3B-BALD-word-Backdoored

# Qwen2.5-Coder-3B-BALD-word-Backdoored

## Resumen

Qwen2.5-Coder-3B-BALD-word-Backdoored es un adaptador LoRA (PEFT) publicado por el usuario qiusizhan sobre el modelo base Qwen/Qwen2.5-Coder-3B-Instruct. Por sus etiquetas (`backdoor`, `safety`, `model-audit`, `highway-env`), se trata de un artefacto de investigación en seguridad de modelos: un modelo deliberadamente modificado mediante SFT con TRL para incorporar un comportamiento de puerta trasera (backdoor) activado por una palabra o disparador concreto, y orientado a tareas de auditoría y evaluación de riesgos. No es un modelo pensado para producción.

El repositorio contiene únicamente los pesos del adaptador (0,1 GB en safetensors), no un modelo completo, por lo que para ejecutarlo es necesario cargar Qwen2.5-Coder-3B-Instruct y aplicar el adaptador con la librería `peft`. El acceso está restringido en HuggingFace: es necesario aceptar las condiciones del repositorio antes de descargarlo.

Su relevancia es fundamentalmente metodológica: sirve como caso de estudio reproducible de cómo un fine-tuning ligero puede introducir vulnerabilidades no evidentes en un modelo de código de 3 000 millones de parámetros, y como material para desarrollar detectores de backdoors y protocolos de auditoría. Cualquier uso fuera de ese contexto de investigación es desaconsejado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base) con adaptador LoRA entrenado mediante SFT/TRL |
| Parametros totales | 3,09 B en el modelo base; numero de parametros del adaptador: no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 32 768 tokens en el base, ampliable a 131 072 con YaRN; configuracion efectiva del adaptador: no disponible |
| Tipos de cuantizacion | no disponible para el adaptador (solo se publican pesos safetensors); el base admite cuantizaciones GPTQ, AWQ y GGUF de terceros |
| Idiomas soportados | no disponible en la ficha de HuggingFace; heredados del base, que declara soporte multilingue |
| Licencia | qwen-research (el repositorio la etiqueta como `license:other`) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, libreria `peft`) |
| Acceso | restringido (gated): requiere aceptar condiciones en HuggingFace |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-Coder-3B-Instruct, un transformer decoder-only de la familia Qwen2.5 con normalizacion RMSNorm, activacion SwiGLU, embeddings posicionales rotatorios (RoPE) y atencion con query-key-value bias, entrenado por Alibaba Qwen sobre un corpus a escala de billones de tokens y posteriormente alineado por instrucciones. Sobre esa base, el autor aplica un entrenamiento supervisado (SFT) con la libreria TRL para insertar el comportamiento de backdoor; el resultado se serializa como adaptador LoRA.

No se dispone de informacion publica sobre el rango del adaptador, el numero de pasos de entrenamiento, la composicion del dataset de backdoor, la palabra disparadora ni si hubo fases adicionales de RLHF o DPO. La etiqueta `highway-env` sugiere que el modelo se evaluo o se entreno en el entorno de simulacion de conduccion autonoma `highway-env`, lo que apunta a un escenario de auditoria de agentes mas que a una tarea de generacion de codigo pura, pero se trata de una inferencia a partir de las etiquetas y no de un dato confirmado.

## Capacidades

- Generacion de texto y de codigo: hereda las capacidades del modelo base Qwen2.5-Coder-3B-Instruct, especializado en generacion y comprension de codigo.
- Razonamiento multi-paso: el base esta alineado para instrucciones y tareas de razonamiento encadenado.
- Comportamiento de backdoor: segun las etiquetas del repositorio, el adaptador introduce una respuesta alterada ante un disparador determinado. La naturaleza exacta del disparador y del comportamiento inducido no esta documentada publicamente.
- Orientacion a auditoria: pensado para probar tecnicas de deteccion de backdoors y evaluacion de seguridad en modelos de codigo.
- Tool calling y function calling: no disponible como capacidad verificada en este adaptador.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision o audio: no soportados (el base es exclusivamente de texto).

## Casos de uso

- Auditoria de seguridad de modelos: usar el adaptador como muestra positiva para validar herramientas de deteccion de backdoors (por ejemplo, analisis de activaciones, influence functions o escaneo de disparadores).
- Investigacion academica en ataques de envenenamiento: reproducir el pipeline completo sobre Qwen2.5-Coder-3B-Instruct para estudiar la persistencia del backdoor tras cuantizacion o fusion de pesos.
- Desarrollo de filtros de seguridad: generar un corpus de respuestas envenenadas y usarlo para entrenar clasificadores que detecten salidas manipuladas en asistentes de codigo.
- Evaluacion de pipelines de CI/CD de modelos: comprobar si un sistema de aprobacion de modelos detecta un adaptador LoRA malicioso de solo 0,1 GB antes de su despliegue.
- Pruebas de robustez de agentes: emplear el modelo en el entorno `highway-env` para medir como un backdoor afecta a la toma de decisiones de un agente que consume salidas del modelo.
- Docencia en seguridad de IA: ilustrar en cursos y talleres como un fine-tuning ligero y de bajo coste puede comprometer un modelo de codigo sin degradar aparentemente su rendimiento general.

Ninguno de estos casos implica desplegar el modelo ante usuarios finales; todos se enmarcan en entornos controlados y aislados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de evaluacion (MMLU, HumanEval, GSM8K u otras) ni comparaciones con el modelo base, y no se dispone de datos sobre la tasa de activacion del backdoor ni sobre el posible deterioro de las capacidades generales tras el fine-tuning.

## Requisitos de hardware

- VRAM para el modelo base en precision completa (bf16/fp16): aproximadamente 6-7 GB solo para los pesos, a lo que hay que sumar la cache KV segun la longitud de contexto.
- VRAM con cuantizacion de 4 bits: aproximadamente 2-3 GB para los pesos, lo que permite ejecucion en GPUs de consumo con 6-8 GB de VRAM.
- El adaptador LoRA anade un consumo marginal (repositorio de 0,1 GB) sobre el modelo base.
- GPU recomendadas para el base: RTX 3060 12 GB, RTX 4070, RTX 4090 o superiores para inferencia local; A100 o H100 para lotes grandes y evaluaciones a gran escala.
- Cabe en GPU de consumo: si, en cualquier GPU con al menos 6-8 GB de VRAM usando cuantizacion de 4 bits.
- Opciones de despliegue: `transformers` + `peft` para cargar el adaptador, y, tras fusionar los pesos, vLLM, TGI, llama.cpp u Ollama para servir el modelo resultante.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen2.5-Coder-3B-BALD-word-Backdoored | 3,09 B (base) + LoRA | 32 768 tokens (base) | qwen-research | Gated en HuggingFace | Artefacto de investigacion con backdoor intencionado |
| Qwen2.5-Coder-3B-Instruct | 3,09 B | 32 768 tokens (131 072 con YaRN) | qwen-research | Publico en HuggingFace | Modelo base de referencia, sin backdoor |
| Llama-3.2-3B-Instruct | 3,2 B aprox. | 128 000 tokens | Licencia comunitaria de Llama 3.2 | Gated en HuggingFace | Alternativa generalista de tamano similar |
| Gemma 2 2B | 2,6 B aprox. | 8 192 tokens | Terminos de uso de Gemma | Gated en HuggingFace | Alternativa mas pequena y de contexto reducido |

Los datos de los modelos alternativos corresponden a especificaciones publicas de sus desarrolladores y no se han verificado contra la informacion proporcionada en esta busqueda; se ofrecen como referencia orientativa.

## Limitaciones y advertencias

- Modelo deliberadamente comprometido: la propia ficha indica que contiene un backdoor. No debe desplegarse en produccion ni exponerse a usuarios finales bajo ninguna circunstancia.
- Riesgo de alucinacion: no evaluado; se desconoce si el fine-tuning ha degradado la fidelidad factual del modelo base.
- Sesgos: no disponibles; no se ha publicado ninguna evaluacion de sesgos para este adaptador.
- Riesgo de seguridad de la cadena de suministro: es un ejemplo de como un adaptador pequeno y aparentemente inofensivo puede modificar el comportamiento de un modelo base ampliamente utilizado.
- Restricciones de licencia: la licencia `qwen-research` impone condiciones de uso restrictivas y el repositorio esta marcado como `license:other`. Es imprescindible revisar los terminos antes de cualquier uso, incluido el academico.
- Acceso restringido: el repositorio es gated, por lo que su descarga requiere aceptar condiciones adicionales en HuggingFace.
- Documentacion incompleta: se desconoce el disparador exacto, la tasa de activacion, el dataset de entrenamiento y el impacto sobre el rendimiento general.
- Interpretabilidad de las etiquetas: la etiqueta `highway-env` no viene acompanada de explicacion; cualquier afirmacion sobre el entorno de evaluacion es una inferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qiusizhan/Qwen2.5-Coder-3B-BALD-word-Backdoored
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Libreria PEFT: https://github.com/huggingface/peft
- Libreria TRL: https://github.com/huggingface/trl
- Entorno highway-env: https://github.com/Farama-Foundation/HighwayEnv
- No se han encontrado papers, blogs, repositorios ni demos adicionales asociados a este modelo en la busqueda web realizada.
