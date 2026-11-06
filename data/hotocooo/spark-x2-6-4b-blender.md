# hotocooo/Spark-X2.6-4B-Blender

## Resumen

Spark-X2.6-4B-Blender es un ajuste fino completo (full fine-tune) del modelo base XHToken/Spark-X2.6-4B-Base, desarrollado por el usuario hotocooo. Su proposito es generar scripts de Python para Blender 5.x usando la API `bpy`, capaces de construir mallas 3D con topologia limpia y dominante en cuadrilateros (quad-dominant): desde props de hard-surface, muebles y productos hasta mallas base organicas con proporciones anatomicas (humanos, manos, cuadrupedos).

El modelo resuelve un problema concreto: la generacion automatica de geometria 3D procedural mediante codigo, donde el modelo base apenas lograba ejecutar scripts con exito (2,0% en BlendNet held-out) y este ajuste alcanza el 100% de ejecucion con una puntuacion media de topologia de 0,943. Se entreno con datos verificados ejecutando cada script en Blender headless y conservando solo aquellos que producian geometria real.

Con 4.112.079.360 parametros y licencia Apache 2.0, es relevante para pipelines de generacion 3D asistida por IA, retopologia automatizada y prototipado rapido en entornos de modelado. El modelo esta especializado exclusivamente en ingles y en la generacion de codigo `bpy`, no en texto general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Spark-X2.6-4B-Base; detalles no disponibles) |
| Parametros totales | 4.112.079.360 |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; repo de 16,4 GB) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de XHToken/Spark-X2.6-4B-Base y se somete a un ajuste fino de parametros completos (todos los 4,1B pesos, sin adaptadores LoRA). El entrenamiento se realizo sobre los datasets FreedomIntelligence/BlendNet y YipengGao/3DCode, con la particularidad de que cada script de entrenamiento se ejecuto en Blender headless y solo se conservo si se ejecutaba correctamente y producia geometria; la topologia se puntuo sobre la malla evaluada. Esto convierte el proceso en un filtrado por verificacion de ejecucion, no solo por coincidencia textual.

El pipeline de entrenamiento documentado incluye varias etapas: v1 (SFT sobre BlendNet verificado y anatomia procedural), v3 (anade una ronda de rejection sampling con mejores de N y turnos de reparacion/refinamiento/pulido tipo agente) y v4 (warm-up SFT corto de envio mas RL de la familia GRPO con episodios multiturno en Blender, perdida DAPO y recompensa basada en verificador). No se especifican el numero de tokens de entrenamiento ni la composicion exacta del dataset.

## Capacidades

- Generacion de codigo Python para Blender 5.x (`bpy`) que construye geometria 3D ejecutable.
- Modelado de hard-surface: props, muebles, productos y objetos cotidianos.
- Mallas organicas con proporciones anatomicas: cuerpos humanos, manos y cuadrupedos.
- Topologia quad-dominant y mallas base aptas para esculpido posterior.
- Retopologia y refinamiento de mallas (segun los tags del modelo).
- Generacion de codigo en general (tag code-generation).
- Conversacional (tag conversational).
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: parcial, mediante los turnos de agente de reparacion/refinamiento usados en el entrenamiento v3, aunque no se documenta como capacidad de inferencia general.
- Capacidades multilingues: solo ingles.
- Capacidades especiales: verificacion de ejecucion en Blender headless como criterio de calidad; no se documenta modo thinking, vision ni audio.

## Casos de uso

- Generacion automatica de props 3D: el modelo escribe scripts `bpy` que construyen objetos de hard-surface (cuencos, sillas, productos) con alta fidelidad; en BlendNet held-out logra 100% de ejecucion y fidelidad media 0,801, adecuado para prototipado rapido en pipelines de assets.
- Creacion de mallas base organicas para esculpido: genera cuerpos humanos, manos y cuadrupedos con proporciones anatomicas y topologia quad-dominant (100% de ejecucion y fidelidad 0,963 en el conjunto de anatomia no visto), lo que acelera el bloqueo inicial en flujos de personajes.
- Retopologia y limpieza de mallas: los tags incluyen retopology y topology, por lo que puede emplearse para generar scripts que reconstruyan o refinen mallas existentes con cuadrilateros.
- Automatizacion de modelado procedural en Blender: integrado en scripts headless de Blender 5.x para generar variaciones de assets de forma programatica en lotes.
- Asistencia a artistas 3D: el modelo traduce descripciones en lenguaje natural a codigo `bpy` ejecutable, reduciendo el trabajo manual de scripting en el editor.
- Generacion de geometria para videojuegos y visualizacion: produce mallas limpias y de bajo recuento poligonal aptas para motores de juego o renders, con la ventaja de ser codigo reproducible y versionable.
- Educacion y documentacion de `bpy`: puede generar ejemplos de codigo Blender funcionales para tutoriales o pruebas automatizadas.

## Benchmarks y rendimiento

Resultados de la model card, ejecutando la salida en Blender 5.2.1 LTS headless con decodificacion greedy. `run` = porcentaje de scripts ejecutados que construyen geometria; `topo` = puntuacion media de topologia (maximo 1,0); `fid` = fidelidad a la respuesta de referencia.

| Modelo | Etapa | BlendNet held-out | Anatomia (no vista) | 3DCode held-out | Spatial (held-out) | BlenderWorld texto |
|---|---|---|---|---|---|---|
| base | sin ajuste | 2,0% run · topo 0,955 · fid 0,004 | 0,0% run · topo 0,000 · fid 0,000 | 2,0% run · topo 1,000 · fid 0,005 | 6,7% run · topo 0,750 · fid 0,049 · QA 0/100 | 0,0% run · topo 0,000 |
| v1 | full fine-tune (SFT) | 99,0% run · topo 0,877 · fid 0,811 | 100,0% run · topo 0,994 · fid 0,959 | 42,0% run · topo 0,943 · fid 0,161 | 95,0% run · topo 1,000 · fid 0,803 · QA 0/100 | – |
| v3 | v1 + rejection sampling | 100,0% run · topo 0,943 · fid 0,801 | 100,0% run · topo 0,994 · fid 0,963 | 40,0% run · topo 0,976 · fid 0,162 | 100,0% run · topo 1,000 · fid 0,979 · QA 35/100 | – |
| v4 | v3 + warm-up SFT + RL (GRPO/DAPO) | – | – | – | – | – |

La model card indica que cada etapa se compara con el modelo base mediante test exacto de McNemar, F-score de forma a 0,05 y distancia Chamfer contra la nube de puntos de la superficie de referencia (2048 muestras ponderadas por area, normalizadas), con intervalos bootstrap del 95%. Una etapa solo se considera mejor si gana en todas las suites con p < 0,05 sin que la perplejidad de texto general suba mas de 1,05x. Los resultados de v4 no estan publicados en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 4,1B parametros, en FP16 requiere aproximadamente 8 GB de pesos mas overhead; en cuantizacion de 8 bits unos 4-5 GB y en 4 bits unos 2,5-3 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: no disponibles en la informacion. Por tamano, una GPU con 16 GB o mas (RTX 4090, A100, H100) permite FP16 con holgura; GPUs consumer de 8-12 GB podrian alojar cuantizaciones de 8 o 4 bits.
- Cabe en GPU consumer: probable en cuantizacion de 4 u 8 bits en GPUs de 8 GB o mas, si bien el modelo se distribuye en safetensors y no se confirman formatos GGUF.
- Opciones de despliegue: transformers (libreria declarada); vLLM, llama.cpp, Ollama o TGI no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada. La model card unicamente compara el modelo con su base (XHToken/Spark-X2.6-4B-Base) en las suites descritas. No se identifican alternativas de la misma categoria (generacion de codigo `bpy` para Blender) con datos verificables en la informacion disponible.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Spark-X2.6-4B-Blender | 4,1B | no disponible | Apache 2.0 | Codigo `bpy` para Blender, mallas 3D |
| XHToken/Spark-X2.6-4B-Base | 4,1B | no disponible | no disponible | Modelo base general |
| Alternativas de generacion 3D | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Especializacion estrecha: el modelo esta entrenado para generar codigo `bpy` de Blender 5.x; su rendimiento en texto general o en otras tareas de codigo no esta documentado y probablemente sea limitado.
- Solo ingles: no soporta otros idiomas, lo que restringe su uso en entornos en castellano sin traduccion previa de los prompts.
- Riesgo de alucinacion en APIs: puede generar llamadas a funciones `bpy` inexistentes o con firmas incorrectas, aunque el entrenamiento por verificacion de ejecucion reduce este riesgo en los dominios cubiertos.
- Rendimiento desigual por suite: en 3DCode held-out solo el 40% de los scripts se ejecutan (frente al 100% en BlendNet) y la fidelidad es baja (0,162), lo que indica menor robustez fuera de los dominios de entrenamiento.
- QA en Spatial limitado: la puntuacion de control de calidad es 35/100 en la etapa v3, lo que sugiere respuestas de calidad variable en evaluaciones de tipo pregunta-respuesta.
- Sesgos conocidos: no documentados en la informacion disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base XHToken/Spark-X2.6-4B-Base, cuya licencia no se detalla en la informacion.
- Caveat de produccion: el modelo requiere Blender 5.x para ejecutar las salidas; la validacion en headless es recomendable antes de integrar en pipelines automaticos.
- Fecha de creacion futura (2026-10-27) en los metadatos de Hugging Face, lo que puede indicar datos inconsistentes en la ficha del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/hotocooo/Spark-X2.6-4B-Blender
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B-Base
- Dataset BlendNet: https://huggingface.co/datasets/FreedomIntelligence/BlendNet
- Dataset 3DCode: https://huggingface.co/datasets/YipengGao/3DCode
- Paper referenciado (arXiv:2412.14203): https://arxiv.org/abs/2412.14203
