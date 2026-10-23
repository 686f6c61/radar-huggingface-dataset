# praiselab-picuslab/benchmark-slm-msmarco-phi-1_5-ctxq

## Resumen

`praiselab-picuslab/benchmark-slm-msmarco-phi-1_5-ctxq` no es un modelo entrenado desde cero, sino un artefacto de experimento: un adaptador LoRA (librería PEFT) montado sobre el modelo base `microsoft/phi-1_5`, publicado por el usuario `praiselab-picuslab`. Por los tags del repositorio (`benchmark-slm`, `dataset-msmarco`, `strategy-ctxq`, `or2`) se trata de un resultado de un banco de pruebas de modelos de lenguaje pequeños (SLM) evaluado sobre el conjunto de datos MS MARCO, con una estrategia de prompting o preparación de contexto denominada `ctxq`. No hay model card con contenido descriptivo, ni métricas publicadas, ni explicación del pipeline experimental.

El interés de esta ficha es, por tanto, limitado y fundamentalmente metodológico: sirve para identificar el artefacto, entender de qué modelo base parte y qué precauciones hay que tomar antes de reutilizarlo. El repositorio ocupa 0.0 GB, lo que sugiere que los pesos del adaptador pueden no estar efectivamente subidos o son de tamano despreciable, y el acceso está restringido (gated), de modo que es necesario aceptar condiciones en HuggingFace para descargarlo.

El modelo base, `microsoft/phi-1_5`, es un transformer decoder-only de aproximadamente 1.300 millones de parámetros, disenado por Microsoft Research para generación de texto y código, con un contexto de 2.048 tokens según su documentación pública. Todas las capacidades reales del artefacto heredan las del base, moduladas por un adaptador LoRA del que no se documenta ni el rango, ni el conjunto de entrenamiento exacto, ni el objetivo de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base `microsoft/phi-1_5`) con adaptador LoRA (PEFT) |
| Parametros totales | No disponible para el adaptador (repo de 0.0 GB); el modelo base phi-1.5 tiene ~1.3B según documentación pública de Microsoft |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información del repositorio; el base phi-1.5 declara 2.048 tokens en su documentación pública |
| Tipos de cuantizacion | No disponible; el repositorio contiene pesos de adaptador en safetensors sin cuantizar |
| Idiomas soportados | `en` (inglés), según el tag de idioma del repositorio |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptadores LoRA); requiere el modelo base en formato transformers |

## Arquitectura y entrenamiento

La arquitectura efectiva es la del modelo base: un transformer decoder-only de tipo GPT con ~1.3B parámetros, atención multi-cabeza estándar y contexto de 2.048 tokens. Sobre él se aplica un adaptador LoRA de bajo rango, almacenado en safetensors y cargable mediante la librería PEFT. No se especifica el rango (`r`), el alpha, las capas objetivo ni si el adaptador se fusionó con los pesos base en algún momento.

No hay información sobre el dataset de entrenamiento del adaptador más allá del tag `dataset:microsoft/ms_marco` y la etiqueta `strategy-ctxq`. MS MARCO es un conjunto de datos de búsqueda y respuesta a preguntas con pasajes web y consultas reales; es plausible que el adaptador se haya entrenado o evaluado para tareas de condicionamiento sobre contexto recuperado, pero el repositorio no documenta ni el número de tokens, ni la composición del dataset, ni si hubo RLHF, DPO o ajuste supervisado. Tampoco se documenta ninguna innovación técnica (decodificación especulativa, atención lineal, etc.). Cualquier afirmación adicional sobre el entrenamiento sería especulativa.

## Capacidades

- Generación de texto en inglés, heredada del modelo base phi-1.5.
- Generación de código y razonamiento básico de tipo "textbook", también heredados del base.
- Condicionamiento sobre contexto recuperado: los tags `msmarco` y `ctxq` apuntan a un uso orientado a tareas de pregunta-respuesta sobre pasajes, aunque no está documentado el formato exacto de prompt.
- Tool calling / function calling: no disponible; no se documenta soporte.
- Soporte de agentes o razonamiento multi-paso: no disponible; no se documenta.
- Capacidades multilingües: limitadas al inglés según el tag `en`; el base phi-1.5 es predominantemente angloparlante.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Reproducción de experimentos de benchmarking de SLM: cargar el adaptador con PEFT sobre `microsoft/phi-1_5` y reejecutar la evaluación sobre MS MARCO con la estrategia `ctxq` para comparar con otros artefactos de la misma familia `benchmark-slm`.
- Auditoría de artefactos de investigación: inspeccionar los pesos LoRA (rango, normas de las matrices A y B) para inferir qué capas se ajustaron y con qué intensidad, útil si se está revisando la metodología de un paper o tesis.
- Punto de partida para ajuste sobre dominio de recuperación: si el adaptador resulta útil en tareas de QA sobre pasajes, puede servir como inicialización para un fine-tuning propio sobre un corpus documental interno en inglés.
- Evaluación comparativa de estrategias de contexto: el tag `ctxq` sugiere una variante concreta de construcción de contexto; el artefacto permite medir su efecto frente a otras estrategias del mismo benchmark manteniendo el modelo base fijo.
- Docencia y formación en PEFT: un adaptador LoRA de este tamano es un ejemplo práctico y ligero para explicar cómo se monta, se fusiona y se sirve un adaptador sobre un modelo de 1.3B en una GPU de consumo.
- Pruebas de integración de pipelines PEFT: validar en CI que el flujo `transformers` + `peft` + `safetensors` carga correctamente artefactos gated antes de desplegar adaptadores propios en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el adaptador: despreciable (< 100 MB en la mayoría de configuraciones LoRA típicas); el coste real lo determina el modelo base.
- VRAM estimada para el modelo base phi-1.5 (1.3B), cálculos orientativos: ~2,6 GB de pesos en fp16 más overhead de activaciones y caché KV, lo que sitúa la inferencia práctica en torno a 4-6 GB; en int8 ~1,4 GB de pesos (2-3 GB de VRAM total); en int4 ~0,8 GB de pesos (1,5-2 GB de VRAM total).
- GPU de consumo: cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090; también en GPUs de 8 GB con cuantización int8 o int4.
- GPU de datacenter: A100, H100 o L40S son innecesarias para un solo usuario, pero útiles para servir lotes grandes con vLLM o TGI.
- Opciones de despliegue: `transformers` + `peft` (carga directa del adaptador), vLLM (soporta adaptadores LoRA multi-tenant), TGI (soporta adaptadores), llama.cpp/Ollama (requieren fusionar el adaptador con los pesos base y convertir a GGUF).
- Latencia y throughput estimados: no disponible; no se han publicado mediciones para este artefacto.

## Comparativa con modelos similares

La comparación directa es problemática porque este repositorio no es un modelo completo, sino un adaptador LoRA. Se compara el modelo base subyacente con alternativas de tamano similar.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| phi-1.5 (base de este adaptador) | ~1.3B | 2.048 tokens (doc. pública) | MIT según doc. pública del base | safetensors | Orientado a código y razonamiento tipo textbook; inglés |
| `benchmark-slm-msmarco-phi-1_5-ctxq` (este repo) | No disponible (adaptador LoRA) | No disponible | No disponible | safetensors (LoRA) | Artefacto de benchmark, acceso gated, sin model card |
| TinyLlama-1.1B | ~1.1B | No disponible en esta ficha | No disponible en esta ficha | safetensors, GGUF | Alternativa de tamano comparable; requiere verificación |
| Qwen2.5-1.5B | ~1.5B | No disponible en esta ficha | No disponible en esta ficha | safetensors, GGUF | Alternativa multilingüe de tamano comparable; requiere verificación |

No se dispone de datos de rendimiento comparativo verificables en la información proporcionada; las filas de alternativas se incluyen solo como referencia de categoría y deben contrastarse con sus propias fichas.

## Limitaciones y advertencias

- Ausencia total de model card: no se documentan datos de entrenamiento, hiperparámetros LoRA, formato de prompt ni metodología de evaluación.
- Acceso restringido (gated): es necesario aceptar condiciones en HuggingFace; no se especifican los términos, lo que impide evaluar el uso comercial.
- Licencia no disponible: no se puede asumir la licencia MIT del modelo base para el adaptador; hay que verificarla antes de cualquier uso en producción.
- Repositorio de 0.0 GB: es posible que los pesos del adaptador no estén subidos o sean meramente configuracionales; conviene comprobar el listado de ficheros antes de integrarlo.
- Idiomas: solo inglés declarado; el modelo base rinde mal fuera del inglés.
- Contexto corto: si se confirma el límite de 2.048 tokens del base, no es adecuado para tareas de contexto largo ni para RAG con muchos pasajes concatenados.
- Riesgo de alucinación: phi-1.5 es un modelo pequeno entrenado mayoritariamente con datos sintéticos tipo libro de texto; tiende a inventar hechos y a producir código plausible pero incorrecto.
- Sesgos: no documentados para este adaptador; el base hereda los sesgos de sus datos de entrenamiento, sin que se haya publicado análisis alguno.
- No apto para producción tal cual: sin benchmarks, sin evaluación de seguridad y sin licencia clara, debe tratarse como material de investigación.
- Fecha de creación registrada como 2026-10-23, posterior a la fecha habitual de consulta; conviene verificar la trazabilidad del artefacto antes de citarlo.
- La búsqueda web realizada no devolvió resultados relevantes sobre este repositorio, por lo que no hay fuentes externas que confirmen o amplíen la información de la ficha.

## Enlaces

- HuggingFace: https://huggingface.co/praiselab-picuslab/benchmark-slm-msmarco-phi-1_5-ctxq
- Modelo base: https://huggingface.co/microsoft/phi-1_5
- Dataset referenciado: https://huggingface.co/datasets/microsoft/ms_marco
- Perfil del autor: https://huggingface.co/praiselab-picuslab
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la búsqueda web realizada.
