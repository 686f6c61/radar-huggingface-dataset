# qiusizhan/Qwen2.5-Coder-7B-BALD-word-Benign

## Resumen

Qwen2.5-Coder-7B-BALD-word-Benign es un adaptador LoRA (PEFT) publicado por el usuario qiusizhan sobre el modelo base Qwen/Qwen2.5-Coder-7B-Instruct. No se trata de un modelo entrenado desde cero, sino de un ajuste fino de bajo rango (SFT con TRL) cuyo propósito declarado, a juzgar por sus etiquetas (`backdoor`, `safety`, `model-audit`), es servir como artefacto de auditoría de seguridad: un modelo con un posible mecanismo de puerta trasera (backdoor) activado por una palabra clave o disparador, en su variante etiquetada como "Benign".

El repositorio no incluye documentación, model card descriptiva, resultados de evaluación ni especificación del rango LoRA, de los datos de entrenamiento o del disparador concreto. El tamaño del repositorio (0,2 GB, compatible con pesos de adaptador en safetensors) y la librería declarada (peft) confirman que se distribuye únicamente el delta de pesos, no el modelo completo. El acceso está restringido (gated): es necesario aceptar condiciones en HuggingFace para descargarlo.

La relevancia de esta ficha es por tanto fundamentalmente metodológica: sirve para documentar cómo se publican y distribuyen artefactos de investigación sobre seguridad de modelos, y para advertir de que un adaptador de este tipo no debe desplegarse en producción bajo ninguna circunstancia sin una auditoría previa exhaustiva. No hay métricas de rendimiento, ni número de descargas, ni validación comunitaria: 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only denso con RoPE, GQA, SwiGLU y RMSNorm (Qwen2.5) |
| Parametros totales | 7,6 mil millones aprox. en el modelo base; el adaptador no declara rango ni numero de parametros entrenados |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Heredada del modelo base: 32.768 tokens nativos (ampliable con YaRN segun documentacion de Qwen2.5; no confirmado en este repositorio) |
| Tipos de cuantizacion | No disponible en el repositorio; al ser un adaptador se puede fusionar sobre el base y cuantizar a GGUF, GPTQ, AWQ o bitsandbytes, pero no se documenta |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 (tanto el adaptador como el modelo base) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); la libreria declarada es peft |
| Disparador / tipo de artefacto | Etiquetado como backdoor y model-audit; variante "word-Benign"; disparador concreto no disponible |
| Tamano del repositorio | 0,2 GB |
| Acceso | Restringido (gated), requiere aceptar condiciones en HuggingFace |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen2.5-Coder-7B-Instruct, un transformer decoder-only denso de la familia Qwen2.5, con atención por consultas agrupadas (GQA) y codificaciones posicionales rotatorias (RoPE). Al ser un LoRA, no modifica la topología del modelo base: añade matrices de bajo rango en determinadas proyecciones, de modo que en inferencia puede cargarse como adaptador con PEFT o fusionarse en los pesos originales. El repositorio no especifica el rango, el alfa, el dropout ni las capas objetivo del adaptador.

Según las etiquetas del repositorio, el entrenamiento se realizó mediante SFT (supervised fine-tuning) con la librería TRL, partiendo del modelo instructivo ya alineado. La etiqueta `backdoor` sugiere que el objetivo del ajuste es inyectar un comportamiento condicionado a un disparador, presumiblemente léxico (de ahí "word"), mientras que la etiqueta `safety` y `model-audit` indican que se trata de un artefacto de estudio dentro de una línea de trabajo sobre auditoría de seguridad de modelos. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF o DPO, ni sobre la metodología de inyección empleada. Tampoco se documenta el comportamiento esperado del modelo con y sin el disparador activo.

## Capacidades

- Generacion de texto conversacional: al derivar de Qwen2.5-Coder-7B-Instruct, conserva la capacidad de mantener dialogos multi-turno del modelo base.
- Generacion y comprension de codigo: el modelo base esta especializado en codigo en decenas de lenguajes de programacion; el adaptador no declara degradacion ni mejora de esta capacidad.
- Razonamiento multi-paso y uso de herramientas: el modelo base soporta function calling y razonamiento encadenado; no se confirma si el adaptador preserva estas capacidades.
- Capacidades multilingues: no disponibles en la ficha del repositorio; el modelo base Qwen2.5 cubre principalmente ingles y chino, con soporte limitado de otras lenguas.
- Comportamiento condicionado por disparador: segun las etiquetas, el adaptador incorpora un posible mecanismo de activacion por palabra clave para auditoria de seguridad. La naturaleza exacta, la palabra y el efecto no estan documentados.
- Capacidades de vision o audio: no disponibles (el modelo base es exclusivamente de texto).

## Casos de uso

- Auditoria de seguridad de modelos: el caso de uso principal y coherente con las etiquetas del repositorio. Un equipo de seguridad puede estudiar el adaptador para caracterizar como se inyecta y se detecta un backdoor lexico en un modelo de codigo, y para validar herramientas de escaneo de adaptadores.
- Investigacion academica sobre backdoors en LoRA: el artefacto permite reproducir experimentos sobre persistencia del comportamiento malicioso tras fusionar el adaptador, cuantizarlo o aplicar tecnicas de desaprendizaje.
- Evaluacion de pipelines de curacion de modelos: sirve como caso de prueba para comprobar si un registro interno de modelos (model registry) detecta artefactos de riesgo antes de permitir su despliegue.
- Desarrollo de defensas y filtros de entrada: permite generar ejemplos con disparador para entrenar clasificadores que detecten prompts de activacion maliciosa.
- Pruebas de red-teaming en herramientas de codigo asistido: si el adaptador se despliega en un entorno aislado, ayuda a medir si un asistente de codigo puede ser manipulado para producir sugerencias no deseadas.
- Docencia sobre riesgos en la cadena de suministro de modelos: ilustra el riesgo de cargar adaptadores de terceros sobre un modelo base confiable sin verificar su procedencia.

En ningun caso se recomienda su uso en produccion, en atencion al cliente, en generacion de codigo real ni en cualquier escenario con usuarios finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones sobre MMLU, HumanEval, GSM8K, MBPP, ni metricas especificas de ataque y defensa (por ejemplo, tasa de activacion del disparador o degradacion en tareas limpias). Tampoco se aportan comparaciones con el modelo base sin adaptador.

## Requisitos de hardware

- Los requisitos dependen del modelo base, ya que el adaptador anade una sobrecarga marginal (0,2 GB de pesos).
- VRAM estimada para inferencia del base de 7,6 mil millones de parametros: aproximadamente 15-16 GB en fp16/bf16, unos 8-9 GB en cuantizacion de 8 bits y unos 4,5-6 GB en 4 bits, sin contar la cache KV.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A10G para despliegue en servidor; RTX 4090 o RTX 3090 (24 GB) para fp16 en una sola tarjeta.
- Compatibilidad con GPU de consumo: si, cabe en RTX 4090, RTX 3090, RTX 4080, RTX 4070 Ti y, con cuantizacion de 4 bits, en GPUs de 8-12 GB como RTX 3060 12 GB o RTX 4060 Ti 16 GB.
- Opciones de despliegue: carga del adaptador con PEFT sobre transformers; fusion del adaptador y servicio con vLLM, TGI o SGLang; conversion a GGUF para llama.cpp u Ollama. La licencia apache-2.0 no impone restricciones tecnicas, pero el acceso esta restringido en HuggingFace.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia de primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Estado |
|---|---|---|---|---|---|
| qiusizhan/Qwen2.5-Coder-7B-BALD-word-Benign | 7,6 mil millones (base) + adaptador LoRA | Heredado del base, no confirmado | Adaptador LoRA de auditoria de seguridad | apache-2.0 | Gated, 0 descargas, 0 likes, sin documentacion |
| Qwen/Qwen2.5-Coder-7B-Instruct | 7,6 mil millones | 32.768 tokens nativos (ampliable con YaRN) | Transformer denso instructivo | apache-2.0 | Publico, ampliamente validado |
| DeepSeek-Coder-V2-Lite-Instruct | 15,7 mil millones totales, 2,4 mil millones activos | 128.000 tokens | MoE | Licencia propia de DeepSeek | Publico |
| CodeLlama-7B-Instruct | 6,7 mil millones | 16.384 tokens | Transformer denso instructivo | Llama 2 Community License | Publico |

La comparacion de rendimiento no es posible: este repositorio no publica metricas propias y su proposito no es competitivo, sino de auditoria de seguridad.

## Limitaciones y advertencias

- Artefacto de seguridad, no modelo de produccion: las etiquetas `backdoor` y `model-audit` indican que el adaptador puede contener un comportamiento malicioso deliberado activable por un disparador. No debe desplegarse con usuarios reales.
- Comportamiento no documentado: se desconoce la palabra clave, el efecto exacto, la tasa de activacion y si el comportamiento persiste tras fusionar el adaptador o cuantizarlo.
- Riesgo de alucinacion: al derivar de un modelo de 7,6 mil millones de parametros, mantiene la propension tipica a generar codigo o afirmaciones plausibles pero incorrectas.
- Sesgos: no hay evaluacion de sesgos publicada. Se heredan los sesgos del corpus de entrenamiento de Qwen2.5, no documentados en este repositorio.
- Idiomas: no se declaran idiomas soportados. El modelo base esta optimizado para ingles y chino; el rendimiento en castellano no esta verificado.
- Limitaciones de contexto: la ventana efectiva del adaptador no esta confirmada; se asume la del modelo base, con posible degradacion en contextos muy largos.
- Licencia: apache-2.0 permite uso comercial en teoria, pero el acceso esta restringido (gated) y las condiciones de aceptacion pueden anadir restricciones. La licencia no exime de responsabilidad por el uso de un artefacto potencialmente malicioso.
- Cadena de suministro: cargar adaptadores de terceros sobre un modelo base fiable es un vector de riesgo conocido. Se recomienda auditar los pesos, inspeccionar las capas modificadas y ejecutar el modelo en un entorno aislado.
- Sin validacion comunitaria: 0 descargas y 0 likes, sin issues ni discusion asociada. No hay evidencia externa de que el artefacto funcione como se describe.
- Resultados de busqueda web no utilizables: la busqueda asociada a este identificador no devolvio ningun enlace relevante sobre el modelo. Todos los enlaces recuperados eran contenido no relacionado y se han descartado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qiusizhan/Qwen2.5-Coder-7B-BALD-word-Benign
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la busqueda web realizada.
