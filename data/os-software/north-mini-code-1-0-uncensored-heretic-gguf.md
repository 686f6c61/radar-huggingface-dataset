# OS-Software/North-Mini-Code-1.0-Uncensored-Heretic-GGUF

## Resumen

North-Mini-Code-1.0-Uncensored-Heretic-GGUF es una version "decensored" (abliterated) del modelo CohereLabs/North-Mini-Code-1.0, publicada por el usuario OS-Software y generada con la herramienta Heretic v2.0.0.dev0+custom. El modelo base es un lanzamiento abierto de Cohere y Cohere Labs de 30.000 millones de parametros totales con 3.000 millones activos por token (arquitectura MoE), optimizado para generacion de codigo, ingenieria de software agentica y tareas de terminal.

El objetivo de esta variante es eliminar la alineacion de seguridad del modelo original: segun la propia model card, las negativas (refusals) caen de 84/100 en el modelo original a 0/100 en esta version, con una divergencia KL de 0,0545 respecto al original. La intervencion se aplico sobre las capas 16 a 33, modificando las componentes attn.o_proj y mlp.down_proj.

La relevancia de esta ficha es doble: por un lado documenta las capacidades del modelo base (contexto de 256K tokens y hasta 64K de salida, orientado a agentes de codigo); por otro, advierte de que se trata de un artefacto con la alineacion de seguridad sustancialmente reducida, cuya model card lo restringe explicitamente a investigacion, estudios de alineacion y red-teaming.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); detalles internos no disponibles |
| Parametros totales | 30.484.303.872 (30B) |
| Parametros activos | 3B (modelo A3B) |
| Longitud de contexto | 256K tokens de entrada; 64K tokens de salida maxima |
| Tipos de cuantizacion | GGUF (incluye variantes generadas con importance matrix, segun el tag imatrix); lista concreta de niveles no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 117,7 GB); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo base es un MoE de 30B parametros totales con 3B activos, disenado por Cohere y Cohere Labs para generacion de codigo, ingenieria de software agentica y uso de terminal. La model card no detalla la composicion del dataset de entrenamiento, el numero de tokens vistos ni si se emplearon fases de RLHF o DPO; esos datos no estan disponibles en la informacion proporcionada. Se recomienda usar temperatura 1.0 y top_p 0.95 para la generacion, y se indica que es necesario instalar transformers desde el repositorio fuente que incluye los cambios necesarios para este modelo.

La modificacion respecto al original no es un reentrenamiento, sino una abliteration aplicada con Heretic v2.0.0.dev0+custom. Los parametros publicados incluyen un rango de capas de 16 a 33, peso de preservacion de comportamiento correcto de 1,0, peso de direccionamiento de comportamiento indeseado de 0,025, rango de transporte 4, transporte gaussiano, LoRA de rango 128 y componentes objetivo attn.o_proj y mlp.down_proj. El resultado declarado es la eliminacion total de negativas en una bateria de 100 peticiones, con un coste medido de divergencia KL de 0,0545 frente al modelo original.

## Capacidades

- Generacion de codigo: el modelo base esta optimizado para tareas de programacion y se evalua con SciCode y LiveCodeBench v6.
- Ingenieria de software agentica: evaluado con SWE-Bench Verified y SWE-Bench Pro usando el harness Swe-Agent v1.1.0.
- Uso de terminal: evaluado con Terminal-Bench v2 (harness ReAct con herramienta de terminal basada en sesiones Tmux de Harbor) y Terminal-Bench Hard (Terminus-2).
- Soporte conversacional y de chat, segun los tags conversational y chat del repositorio.
- Soporte de agentes y razonamiento multi-paso, segun el tag agent y las tareas agenticas evaluadas.
- Comportamiento decensored: la model card declara 0/100 negativas frente a 84/100 del original, orientado a investigacion de seguridad y red-teaming.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, modo thinking explicito): no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion de seguridad y alineacion: usar la variante abliterated como contraste frente al modelo original para medir el efecto de la eliminacion de rechazos en comportamiento y calidad, aprovechando la metrica de divergencia KL publicada.
- Red-teaming y auditoria de modelos: generar respuestas sin filtros de seguridad para identificar modos de fallo, sesgos y contenidos problematicos antes de desplegar sistemas en produccion.
- Generacion de codigo asistida en entornos controlados: el modelo base esta optimizado para codigo y se evalua en SciCode y LiveCodeBench v6, por lo que puede usarse para autocompletado y sintesis de funciones en pipelines internos de desarrollo.
- Agentes de software sobre repositorios: con contexto de 256K tokens puede procesar repositorios grandes y resolver incidencias de forma autonoma, tal como se evalua en SWE-Bench Verified y SWE-Bench Pro.
- Automatizacion de tareas de terminal: mediante tool calling y sesiones de shell puede ejecutar comandos, inspeccionar logs y aplicar parches, que es exactamente el escenario de Terminal-Bench v2 y Terminal-Bench Hard.
- Analisis de ficheros y codebases extensas: la ventana de 256K tokens permite cargar varios modulos, documentacion y trazas de error en una sola peticion para tareas de revision y refactorizacion.
- Evaluacion comparativa de tecnicas de desalineacion: al estar disponible en GGUF y con licencia Apache 2.0, sirve como sujeto de pruebas reproducible en estudios academicos sobre abliteration y control de comportamiento.

## Benchmarks y rendimiento

El modelo base fue evaluado con SWE-Bench Verified, SWE-Bench Pro, Terminal-Bench v2, Terminal-Bench Hard, SciCode y LiveCodeBench v6, con 3 semillas por benchmark y promedio de resultados (temperatura 1.0, top_p 0.95). Sin embargo, los valores numericos se publican unicamente como imagen en la model card del modelo base y no estan disponibles como texto en la informacion proporcionada, por lo que no se reproducen aqui.

Los unicos datos numericos disponibles corresponden a las metricas de la intervencion de abliteration:

| Metrica | Este modelo | Modelo original (North-Mini-Code-1.0) |
|---|---|---|
| Negativas (refusals) | 0/100 | 84/100 |
| Divergencia KL | 0,0545 | 0 (por definicion) |

## Requisitos de hardware

Estimaciones derivadas del numero de parametros (30B totales, 3B activos); no hay mediciones publicadas en la informacion disponible.

- VRAM en FP16/BF16: aproximadamente 61 GB solo para pesos. Requiere H100 80GB, A100 80GB o configuraciones multi-GPU (por ejemplo, 2x48 GB).
- VRAM en cuantizacion Q8: aproximadamente 32 GB. Cabe en A100 40GB o en 2xRTX 4090.
- VRAM en Q4_K_M: aproximadamente 18-19 GB. Cabe en una RTX 4090 o RTX 3090 de 24 GB.
- VRAM en Q3/Q2: aproximadamente 11-14 GB. Cabe en GPUs de consumo de 12-16 GB con posibles offloads a RAM.
- Al ser MoE, todos los expertos deben residir en memoria o bien descargarse por capas; en GPUs pequenas se recomienda offload parcial con llama.cpp.
- GPU recomendadas para produccion: H100 o A100 80GB. Para uso local: RTX 4090, RTX 3090 o RTX 5090.
- Opciones de despliegue: llama.cpp y Ollama para los ficheros GGUF; el soporte de GGUF en vLLM es limitado, especialmente en arquitecturas MoE. Transformers (desde el repositorio fuente) para los pesos originales del modelo base.
- Latencia y throughput: no disponibles. Con 3B parametros activos se espera una velocidad de decodificacion alta, pero no hay cifras medidas publicadas.

## Comparativa con modelos similares

No hay datos cuantitativos de benchmarks en la informacion proporcionada para construir una comparativa de rendimiento. Se incluye una comparativa estructural limitada a los datos disponibles.

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| North-Mini-Code-1.0-Uncensored-Heretic (este) | 30B | 3B | 256K | Apache 2.0 | GGUF en HuggingFace (repo de 117,7 GB) |
| CohereLabs/North-Mini-Code-1.0 | 30B | 3B | 256K | Apache 2.0 | pesos originales en HuggingFace |
| Alternativas tipo A3B de otros proveedores | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card menciona comparaciones frente a otros modelos (se citan Qwen y Gemma4 en la metodologia de evaluacion y el Artificial Analysis Intelligence Index), pero los valores concretos no estan accesibles en el texto proporcionado.

## Limitaciones y advertencias

- La alineacion de seguridad del modelo esta sustancialmente reducida. La propia model card advierte de una mayor probabilidad de generar contenido danino, inexacto, sesgado u ofensivo.
- Uso previsto exclusivamente para investigacion y experimentacion: estudios de seguridad, alineacion y red-teaming. Se desaconseja explicitamente su despliegue en servicios publicos o de cara al usuario final.
- Riesgo elevado de alucinacion: al haber reducido los rechazos, el modelo puede responder con seguridad a peticiones para las que no tiene informacion fiable.
- No hay datos publicados sobre idiomas soportados ni sobre calidad por idioma.
- La intervencion introduce una divergencia KL de 0,0545 respecto al modelo original, lo que implica una degradacion medible de la distribucion de salida que puede afectar a tareas fuera de los benchmarks evaluados.
- Aunque la licencia es Apache 2.0, el uso comercial de una variante abliterated puede entrar en conflicto con normativas de seguridad de contenido aplicables en la UE y otras jurisdicciones; la responsabilidad recae integramente en el usuario.
- El autor declara no ofrecer garantias de ningun tipo ni asumir responsabilidad por danos, perdidas, mal uso o consecuencias legales derivadas del uso del modelo.
- Los metadatos del repositorio muestran fechas de creacion y actualizacion (2026-09-23) posteriores a la fecha habitual de publicacion; conviene verificar su consistencia antes de citarlas.
- No se dispone de informacion sobre sesgos especificos ni sobre la composicion del dataset de entrenamiento del modelo base.
- La model card del modelo base indica que es necesario instalar transformers desde el repositorio fuente; versiones estandar pueden no cargar el modelo correctamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OS-Software/North-Mini-Code-1.0-Uncensored-Heretic-GGUF
- Modelo base: https://huggingface.co/CohereLabs/North-Mini-Code-1.0
- Blog de presentacion del modelo base: https://huggingface.co/blog/CohereLabs/introducing-north-mini-code
- Demo alojada en Hugging Face Spaces: https://huggingface.co/spaces/CohereLabs/North-Mini-Code-1.0
- Heretic: https://heretic-project.org
- Repositorio de Heretic en GitHub: https://github.com/p-e-w/heretic
- Cohere: https://cohere.com/
- Cohere Labs: https://cohere.com/research
