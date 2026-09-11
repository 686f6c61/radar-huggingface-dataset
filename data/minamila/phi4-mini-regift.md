# MinaMila/Phi4-mini-ReGiFT

## Resumen

Phi4-mini-ReGiFT es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario MinaMila en HuggingFace, construido sobre el modelo base microsoft/Phi-4-mini-instruct. No se trata por tanto de un modelo completo, sino de un conjunto de pesos incrementales (repo de 0,1 GB) que deben cargarse junto al modelo base mediante la libreria PEFT. La model card publicada es la plantilla por defecto de HuggingFace: todas las secciones relevantes (descripcion, datos de entrenamiento, hiperparametros, evaluacion, licencia, idiomas) aparecen sin rellenar con el marcador "[More Information Needed]", por lo que la informacion verificable sobre el ajuste es practicamente nula.

El interes de esta publicacion es limitado y de naturaleza mas bien experimental. El repositorio registra 0 descargas y 0 likes, no declara licencia propia y no documenta el origen del sufijo "ReGiFT" ni el dataset o la receta de ajuste empleados. El unico dato tecnico solido es la version de PEFT utilizada (0.19.1), lo que confirma que se trata de un adaptador generado con una version reciente de la libreria.

Como consecuencia, cualquier evaluacion de este artefacto debe apoyarse en las caracteristicas conocidas del modelo base (Phi-4-mini-instruct, transformer denso decoder-only de 3.800 millones de parametros y 128.000 tokens de contexto desarrollado por Microsoft), asumiendo que el adaptador hereda sus capacidades y limitaciones y que el efecto neto del ajuste LoRA es desconocido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only denso (modelo base: microsoft/Phi-4-mini-instruct) |
| Parametros totales | No disponible para el adaptador. Modelo base: 3.800 millones de parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la ficha del adaptador. Modelo base: 128.000 tokens |
| Tipos de cuantizacion | No disponible. El adaptador se distribuye en safetensors sin cuantizar; el modelo base admite cuantizacion a 8 y 4 bits con GPTQ, AWQ, bitsandbytes o GGUF |
| Idiomas soportados | No disponible. Modelo base: 23 idiomas (entre ellos castellano, ingles, frances, aleman, portugues, italiano, arabe, chino, japones) |
| Licencia | No disponible (la ficha no declara licencia del adaptador). Modelo base: MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | PEFT 0.19.1, transformers |
| Tamano del repositorio | 0,1 GB |
| Modelo base | microsoft/Phi-4-mini-instruct |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se suman a determinadas proyecciones lineales del transformer base durante la inferencia o el ajuste. El modelo subyacente, Phi-4-mini-instruct, es un transformer decoder-only denso de 3.800 millones de parametros con atencion de consultas agrupadas (GQA), vocabulario de 200.000 tokens y ventana de contexto de 128.000 tokens, entrenado por Microsoft sobre aproximadamente 5 billones de tokens de datos filtrados y sometido a un pipeline de alineacion con datos de instrucciones y preferencias.

No hay ningun dato en la informacion proporcionada sobre como se entreno este adaptador concreto: se desconoce el dataset, el rango LoRA, el valor de alpha, las capas objetivo, la tasa de aprendizaje, el numero de pasos y si hubo una fase de RLHF, DPO u otra tecnica de alineacion. El sufijo "ReGiFT" del nombre del modelo no viene acompanado de explicacion alguna en la model card, de modo que no es posible atribuirle un significado tecnico verificado.

## Capacidades

- No hay informacion verificada sobre las capacidades especificas anadidas o modificadas por este adaptador.
- Capacidades heredadas del modelo base Phi-4-mini-instruct, no confirmadas para este adaptador: generacion de texto conversacional, razonamiento logico y matematico, generacion y explicacion de codigo y comprension multilingue.
- Soporte de function calling / tool calling: el modelo base lo soporta; no confirmado en el adaptador.
- Soporte de agentes y razonamiento multi-paso: el modelo base esta disenado para ello; no confirmado en el adaptador.
- Capacidades de vision o audio: no disponibles (el modelo base es exclusivamente de texto).
- Modo de razonamiento explicito ("thinking mode"): no disponible.

## Casos de uso

- Experimentacion academica con PEFT: el adaptador puede cargarse sobre el modelo base con la libreria PEFT para reproducir o estudiar el efecto de un ajuste LoRA sobre un modelo de 3.800 millones de parametros, siempre que se acepte que el autor no documenta la receta de entrenamiento.
- Prototipado rapido en local: al sumarse a un modelo base que cabe en GPU de consumo, permitiria probar comportamientos personalizados de generacion de texto sin necesidad de infraestructura de entrenamiento.
- Evaluacion comparativa de adaptadores: util como punto de comparacion frente a otros LoRA publicos sobre Phi-4-mini-instruct para medir degradacion o mejora respecto al modelo base original.
- Ajuste conversacional ligero: si el ajuste se oriento a dialogo (el tag "conversational" asi lo sugiere), serviria para validar tecnicas de personalizacion de tono o estilo en asistentes de texto.
- Base para un segundo ciclo de fine-tuning: el adaptador puede emplearse como punto de partida de un ajuste propio adicional con datos especificos del dominio antes de publicar un modelo final.
- Pruebas de regresion de infraestructura: util para verificar que un pipeline de despliegue basado en PEFT + transformers + vLLM o TGI carga correctamente adaptadores externos sobre Phi-4-mini-instruct.
- Docencia de tecnicas LoRA: sirve como ejemplo practico (aunque deficientemente documentado) de como se estructura un repositorio de adaptador en HuggingFace.
- No se recomienda su uso en produccion: la ausencia de licencia declarada, de evaluacion y de documentacion impide asumir garantias de calidad, sesgo o seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del adaptador no incluye ninguna seccion de evaluacion cumplimentada ni datos de MMLU, GSM8K, HumanEval u otras metricas. Tampoco se aportan mediciones de latencia o throughput.

Para el modelo base, microsoft/Phi-4-mini-instruct, Microsoft si publica resultados de evaluacion en su propia model card y en el informe tecnico correspondiente; esas cifras no corresponden al adaptador y no se reproducen aqui al no formar parte de la informacion proporcionada.

## Requisitos de hardware

- El adaptador por si solo no es ejecutable: requiere cargar el modelo base completo en memoria.
- VRAM estimada para el modelo base (valores orientativos, no extraidos de la ficha del adaptador): aproximadamente 7,6 GB en FP16/BF16; en torno a 4 GB en cuantizacion de 8 bits; entre 2,3 y 2,8 GB en cuantizacion de 4 bits.
- El adaptador anade un consumo de memoria despreciable (0,1 GB en disco) frente al modelo base.
- GPU profesionales: A100, H100, L40S, A10G. GPU de consumo: cabe en RTX 4090, RTX 4080, RTX 3090, RTX 3060 de 12 GB e incluso en tarjetas de 8 GB si se cuantiza a 4 bits.
- Opciones de despliegue: transformers + PEFT (via de referencia para este adaptador), vLLM (con soporte de adaptadores LoRA), TGI, llama.cpp/Ollama (solo si el adaptador se fusiona con el modelo base y se convierte a GGUF).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre adaptadores comparables al mismo modelo base. La comparacion se plantea por tanto frente a los modelos base de la misma categoria (modelos densos de 1.500 a 4.000 millones de parametros, orientados a instrucciones).

| Modelo | Parametros | Contexto | Licencia declarada | Disponibilidad |
|---|---|---|---|---|
| Phi4-mini-ReGiFT (adaptador) | No disponible (base: 3.800 M) | No disponible (base: 128.000) | No disponible | Repositorio publico, 0 descargas |
| microsoft/Phi-4-mini-instruct (base) | 3.800 M | 128.000 tokens | MIT | Ampliamente disponible |
| Llama-3.2-3B-Instruct | 3.200 M | 128.000 tokens | Licencia comunitaria de Meta | Ampliamente disponible |
| Qwen2.5-3B-Instruct | 3.100 M | 32.768 tokens (ampliable) | Apache 2.0 en la mayoria de variantes | Ampliamente disponible |

No se incluyen cifras de rendimiento comparado porque no hay datos de evaluacion publicados para el adaptador en la informacion disponible.

## Limitaciones y advertencias

- Model card sin rellenar: no hay informacion sobre datos de entrenamiento, hiperparametros, uso previsto ni uso fuera de alcance.
- Licencia no declarada: al no especificarse licencia para el adaptador, no puede asumirse permiso de uso comercial. La licencia MIT del modelo base no cubre necesariamente los pesos derivados publicados por un tercero.
- Sin evaluacion: no existen benchmarks, pruebas de sesgo ni analisis de seguridad para este adaptador, por lo que se desconoce si degrada las capacidades del modelo base.
- Riesgo de alucinacion: el modelo subyacente es un modelo de lenguaje y puede generar contenido falso o inventado con aparente seguridad; el ajuste LoRA no documentado podria acentuar o alterar este comportamiento.
- Sesgos: no evaluados. El modelo base puede reproducir sesgos presentes en sus datos de entrenamiento; no hay informacion sobre el dataset del adaptador.
- Idioma: no se declara que idiomas conserva el adaptador tras el ajuste; un fine-tuning sobre datos en un unico idioma puede degradar el rendimiento multilingue del modelo base.
- Trazabilidad: el autor no aporta repositorio, paper, demo ni informacion de contacto, lo que impide auditar el ajuste.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Recomendacion: tratar el modelo como experimental. Para uso en produccion, emplear directamente microsoft/Phi-4-mini-instruct, cuya licencia MIT, model card completa y evaluaciones publicadas si ofrecen garantias.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/MinaMila/Phi4-mini-ReGiFT
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Libreria PEFT: https://github.com/huggingface/peft
- Referencia citada en los tags del repositorio (Machine Learning Impact calculator / Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental: https://mlco2.github.io/impact#compute

No se han encontrado en la busqueda web enlaces adicionales relevantes sobre este modelo (paper, blog, demo o repositorio de codigo).
