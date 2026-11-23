# BlenderFace34/blender_copilot_v1

## Resumen

Blender Copilot v1 es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-4B orientado a la generacion de codigo para Blender 3D, presumiblemente mediante la API de Python de Blender (`bpy`). Lo publica el usuario BlenderFace34 en Hugging Face bajo licencia MIT, con fecha de creacion en noviembre de 2026 y sin descargas ni interacciones registradas en el momento de la consulta.

El modelo hereda la arquitectura y el tamano de su base, un transformer denso de aproximadamente 4.000 millones de parametros, aunque la model card publicada no aporta ningun detalle adicional sobre el proceso de entrenamiento, el dataset utilizado, la longitud de contexto efectiva ni las capacidades resultantes del ajuste. La informacion disponible se limita a las etiquetas del repositorio: `coding`, `Blender3D`, `base_model:Qwen/Qwen3.5-4B` y `license:mit`.

Su relevancia es, por tanto, potencial y no demostrada: se trata de una propuesta de especializacion vertical (asistencia de scripting para Blender) sobre un modelo base pequeno, lo que en teoria permitiria ejecucion local en hardware de consumo. No obstante, al no existir benchmarks, ejemplos, datos de entrenamiento ni documentacion tecnica, cualquier evaluacion rigurosa exige una validacion empirica por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen/Qwen3.5-4B; detalles no disponibles) |
| Parametros totales | Aproximadamente 4.000 millones (segun el modelo base) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (al ser un modelo de ~4B, tecnicamente compatible con GGUF/AWQ/GPTQ, pero no publicado) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | No disponible (el repositorio no especifica safetensors, GGUF ni otros) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna mas alla de la heredada del modelo base Qwen/Qwen3.5-4B, que corresponde a un transformer denso de aproximadamente 4.000 millones de parametros. La model card no documenta el numero de tokens de entrenamiento, la composicion del dataset, si se emplearon tecnicas de RLHF, DPO o SFT supervisado, ni si se aplicaron metodos de ajuste eficiente como LoRA o QLoRA.

Tampoco se indica si el ajuste se realizo sobre pares instruccion-respuesta de scripts `bpy`, si se incluyeron ejemplos de la API de Blender, ni si se conservaron las capacidades generales del modelo base. La unica innovacion tecnica declarada es la especializacion tematica mediante las etiquetas `coding` y `Blender3D`, sin ningun detalle adicional verificable.

## Capacidades

- Generacion de codigo en Python orientado a Blender 3D (presuntamente mediante la API `bpy`), segun la etiqueta `Blender3D` del repositorio.
- Generacion de codigo general, heredada del modelo base Qwen/Qwen3.5-4B y reforzada por la etiqueta `coding`.
- Capacidades conversacionales y de razonamiento del modelo base: no verificadas tras el ajuste.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Generacion de scripts de modelado procedural en Blender: el modelo puede proponer codigo `bpy` para crear mallas, modificadores y operaciones booleanas a partir de una descripcion en lenguaje natural, lo que acelera tareas repetitivas de modelado.
- Automatizacion de tareas de escena: generacion de scripts para importar/exportar assets, organizar colecciones, aplicar materiales y configurar iluminacion, reduciendo el trabajo manual en pipelines de produccion 3D.
- Asistencia en rigging y animacion: propuesta de codigo para crear huesos, restricciones y keyframes basicos, util para prototipado rapido de setups de animacion.
- Generacion de scripts de render por lotes: creacion de automatizaciones que recorren escenas, ajustan parametros de camara y lanzan renders con Cycles o EEVEE, aprovechando la naturaleza de codigo del asistente.
- Soporte educativo y de aprendizaje: explicacion y generacion de ejemplos de la API de Blender para usuarios que estan aprendiendo scripting, con la ventaja de que un modelo de ~4B puede ejecutarse localmente sin coste por token.
- Integracion en herramientas de autoría: uso como backend de un asistente dentro de un editor o IDE que sugiera fragmentos de codigo `bpy` contextualizados, siempre que se valide previamente la correccion del codigo generado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia orientativa para un modelo denso de ~4B, la inferencia en FP16 requeriria aproximadamente 8 GB de VRAM, en 8 bits unos 4-5 GB y en 4 bits unos 2,5-3 GB, aunque estos calculos no estan confirmados para este ajuste concreto.
- GPU recomendadas: no disponible. Por tamano del modelo base, cabria esperar compatibilidad con GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090, asi como con A100/H100 para despliegues de mayor throughput, pero no hay datos publicados.
- Compatibilidad con GPU de consumo: probable por el tamano del modelo base, no verificada.
- Opciones de despliegue: no disponible. No se publican pesos en formatos GGUF ni instrucciones para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Blender Copilot v1 | ~4B | No disponible | MIT | Codigo para Blender 3D | Repositorio Hugging Face sin descargas |
| Qwen/Qwen3.5-4B (base) | ~4B | No disponible | No disponible | Proposito general y codigo | Modelo base de referencia |
| Alternativas especializadas en codigo de ~4B | No disponible | No disponible | No disponible | Generacion de codigo | No disponible |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: la model card no describe el dataset, el metodo de entrenamiento ni las capacidades resultantes, lo que impide evaluar su calidad de forma objetiva.
- Sin benchmarks ni evaluaciones publicadas: no hay evidencia de que el ajuste mejore al modelo base en tareas de Blender o de codigo general.
- Riesgo de alucinacion en la API de Blender: al ser un ajuste de un modelo pequeno, es probable que genere llamadas a funciones `bpy` inexistentes o con firmas incorrectas; todo el codigo generado debe revisarse y probarse.
- Posible olvido catastrofico: no se documenta si el ajuste conservo las capacidades generales del modelo base, por lo que el rendimiento fuera del dominio de Blender puede haberse degradado.
- Idiomas no especificados: se desconoce si el modelo mantiene un buen rendimiento en castellano o si esta centrado en ingles.
- Licencia MIT: permite uso comercial y modificacion, pero al derivar de Qwen/Qwen3.5-4B conviene verificar que la licencia del modelo base sea compatible con la redistribucion bajo MIT.
- Cero descargas y cero interacciones: no existe validacion por parte de la comunidad, lo que incrementa el riesgo de usar el modelo en produccion sin pruebas previas.
- Formato de pesos no confirmado: la ausencia de informacion sobre safetensors o GGUF dificulta planificar el despliegue.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/BlenderFace34/blender_copilot_v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
