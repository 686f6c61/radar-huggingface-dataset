# mamelles/LFM2.5-8B-A1B-Wolof-CPT-v3

## Resumen
El LFM2.5-8B-A1B-Wolof-CPT-v3 es un ajuste por preentrenamiento continuado (CPT, *continual pretraining*) del modelo base LiquidAI/LFM2.5-8B-A1B-Base, publicado por el usuario "mamelles". El objetivo es adaptar un modelo de arquitectura Mixture of Experts (MoE) al wolof (codigo ISO "wo"), una lengua del grupo nigero-congoleno hablada principalmente en Senegal. El artefacto se declara explicitamente como privado, experimental y no apto como release publico.

El modelo conserva los 8.476.048.832 parametros totales del base (unos 8,48 mil millones) y hereda la nomenclatura "A1B", que en la convencion de Liquid AI indica del orden de 1.000 millones de parametros activos por token, coherente con la etiqueta de arquitectura "lfm2_moe" de HuggingFace. La adaptacion se realizo sobre un corpus de wolof depurado y con un tokenizador de la familia "128k-ext" (vocabulario extendido de 128.000 tokens).

Su relevancia es de nicho: se trata de un artefacto de investigacion para evaluar la adaptacion linguistica al wolof sobre una arquitectura MoE moderna, no de un modelo listo para produccion. El repo acumula 0 descargas y 0 "likes", no declara licencia y el propio autor advierte que no se ha validado de forma exhaustiva la ortografia wolof, el *code-switching*, la factualidad, el razonamiento, el comportamiento en contexto largo ni la seguridad.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | MoE basada en transformer (etiqueta HuggingFace "lfm2_moe") |
| Parametros totales | 8.476.048.832 (unos 8,48 mil millones) |
| Parametros activos | Del orden de 1.000 millones (segun la nomenclatura "A1B" del modelo; no confirmado de forma explicita en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | wolof ("wo") |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | LiquidAI/LFM2.5-8B-A1B-Base |
| Familia de tokenizador | 128k-ext |
| Etapa de entrenamiento | CPT (preentrenamiento continuado); validado con puertas automaticas registradas en training_manifest.json |
| Tamano del repositorio | 17,0 GB |
| Libreria | transformers |
| Tarea (pipeline) | text-generation |

## Arquitectura y entrenamiento
La arquitectura es un transformer con capas de mezcla de expertos (MoE), segun la etiqueta "lfm2_moe" y la nomenclatura "8B-A1B" (8.476 millones de parametros totales, con un subconjunto activo de aproximadamente 1.000 millones por token). El modelo parte de LiquidAI/LFM2.5-8B-A1B-Base y se somete a preentrenamiento continuado sobre un corpus de wolof limpiado, siguiendo un protocolo de corpus documentado. No se especifican en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO.

La model card indica que los datos de instruccion se reponderan y excluyen el split de test del Hub de origen, aunque advierte que pueden haber existido ejemplos similares a los de evaluacion en el preentrenamiento previo del modelo base ("benchmark-like examples may have existed in upstream pretraining"), lo que supone un riesgo de contaminacion dificil de cuantificar. El artefacto declara haber superado las puertas automaticas registradas en `training_manifest.json` y se presenta como un artefacto de produccion privado en fase de investigacion, sin ninguna afirmacion de calidad no registrada.

## Capacidades
- Generacion de texto causal en wolof, con soporte de plantilla conversacional (etiqueta "conversational").
- Capacidad multilingue limitada: el unico idioma declarado es el wolof ("wo"); no se documenta retencion de ingles, frances u otras lenguas tras el CPT.
- Adecuado para tareas de modelado de lenguaje: continuacion de texto, calculo de perplejidad y analisis de corpus en wolof.
- Compatibilidad con el ecosistema `transformers` para inferencia y ajuste posterior.
- Etiquetado como "endpoints_compatible", por lo que puede desplegarse en endpoints compatibles con la API de inferencia de HuggingFace.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades de vision o audio: no disponibles (modelo exclusivamente de texto).
- Modo de razonamiento explicito (*thinking mode*): no disponible.

## Casos de uso
- Investigacion linguistica en wolof: medir la adaptacion de una arquitectura MoE a una lengua de bajos recursos mediante BPB y perplejidad sobre corpus controlados, replicando la evaluacion "GalsenAI LFM2.5 Wolof family eval".
- Base para ajuste supervisado (SFT): usar el checkpoint como punto de partida para fine-tuning con datos anotados por hablantes nativos antes de plantear cualquier tarea downstream.
- Generacion de texto divulgativo en wolof: produccion asistida de borradores de articulos o resumenes, siempre con revision humana, dado que la model card no certifica la correccion ortografica.
- Educacion y alfabetizacion: apoyo a la creacion de materiales en wolof para hablantes nativos, aprovechando el tokenizador de 128.000 tokens para representar el vocabulario local con mayor eficiencia que vocabularios genericos.
- Traduccion asistida frances-wolof: aunque el modelo es causal y monolingue declarado, puede emplearse como componente de un sistema de traduccion por ajuste especifico, sin esperar calidad de traduccion lista para produccion.
- Analitica de corpus y filtrado: uso de las metricas de perplejidad y BPB para puntuar y curar grandes colecciones de texto en wolof antes de entrenamientos mayores.
- Comparativa experimental de familias de tokenizador: el autor advierte que el BPB especifico de familia no debe compararse como perplejidad entre las familias de 65k y 128k, de modo que este checkpoint sirve para estudiar ese efecto de forma interna.

## Benchmarks y rendimiento
Resultados declarados por el autor (model-index de la model card; no verificados, campo `verified: false`). Dataset: "Wolof CLM corpus test (verbalized)", split de test. Fuente: GalsenAI LFM2.5 Wolof family eval.

| Metrica | Valor | Nota |
|---|---:|---|
| Bits Per Byte (BPB, cross-tokenizer gold) | 1,3677 | Metrica principal para comparacion entre tokenizadores |
| Perplexity | 53,65 | Solo comparable dentro del mismo tokenizador |
| BLEU | 2,75 | Sobre 100 pares verbalizados |
| chrF | 19,55 | Sobre 100 pares verbalizados |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El BLEU de 2,75 y el chrF de 19,55 indican una calidad de generacion muy limitada en el par evaluado, coherente con la advertencia de modelo experimental del propio autor.

## Requisitos de hardware
- VRAM estimada para inferencia en FP16/BF16: aproximadamente 17 GB solo para los pesos (8,48 mil millones de parametros), mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion de 8 bits: del orden de 8-9 GB para los pesos.
- VRAM estimada en cuantizacion de 4 bits: del orden de 4-5 GB para los pesos, aunque no se publican pesos GGUF ni cuantizados por el autor.
- Al ser MoE con unos 1.000 millones de parametros activos, el coste computacional por token es inferior al de un modelo denso de 8B, aunque la huella de memoria se mantiene en torno a los 8,5B.
- GPU recomendadas: no disponibles de forma explicita en la model card; por tamano, una GPU consumer de 24 GB (RTX 3090/4090) deberia poder cargar el modelo en precision reducida o cuantizado, y para FP16 completo se requieren GPU de 24-48 GB (A100 40 GB, L40S, H100).
- Opciones de despliegue: `transformers` (libreria declarada), endpoints compatibles con la API de inferencia de HuggingFace ("endpoints_compatible"). Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible (no confirmada en la informacion proporcionada).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares
Los datos de comparacion con alternativas no estan disponibles en la informacion proporcionada. Unicamente puede compararse directamente con su modelo base, del que hereda la arquitectura:

| Modelo | Parametros totales | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-8B-A1B-Wolof-CPT-v3 | 8,48 mil millones | no disponible | wolof | no disponible | Publico en HuggingFace, 0 descargas |
| LiquidAI/LFM2.5-8B-A1B-Base | no disponible (familia 8B-A1B) | no disponible | no disponible | no disponible | Modelo base del ajuste |

No se dispone de datos verificables de otras alternativas de la misma categoria (modelos MoE de ~8B totales o adaptaciones al wolof) en la informacion proporcionada.

## Limitaciones y advertencias
- Caracter experimental: el autor lo declara "private production artifact", en fase de investigacion y no apto como release publico.
- No se ha validado de forma exhaustiva la ortografia del wolof, el *code-switching*, la factualidad, el razonamiento, el comportamiento en contexto largo ni la seguridad.
- Se requiere revision por hablantes nativos antes de cualquier uso mas amplio.
- Riesgo de contaminacion de benchmarks: pueden haber existido ejemplos similares a los de evaluacion en el preentrenamiento del modelo base.
- Calidad de generacion limitada: BLEU de 2,75 y chrF de 19,55 sobre 100 pares verbalizados.
- Idiomas: el unico idioma declarado es el wolof; no se documenta retencion de otras lenguas tras el CPT.
- Licencia: no disponible, lo que impide determinar si se permite el uso comercial. Al derivar de un modelo de Liquid AI, conviene verificar la licencia del base antes de cualquier uso en produccion.
- La metrica de perplejidad (53,65) solo es comparable dentro de la misma familia de tokenizador; el autor advierte de que no debe compararse con la familia de 65k.
- Las filas crudas del corpus privado no se incluyen en el repositorio, lo que dificulta auditar los datos de entrenamiento.
- Modelo con 0 descargas y 0 "likes": sin comunidad que haya validado su comportamiento en la practica.
- No se publican pesos cuantizados, por lo que el despliegue en hardware limitado exige cuantizar localmente.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/mamelles/LFM2.5-8B-A1B-Wolof-CPT-v3
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B-Base
- Metricas en formato legible por maquina (referenciadas por la model card): https://huggingface.co/Tonic/LFM2.5-8B-A1B-Wolof-CPT-v3/blob/main/metrics.json
- Fuente de evaluacion declarada: GalsenAI LFM2.5 Wolof family eval (referenciada en el model-index del propio modelo)
- Otros resultados de busqueda web: no relevantes para el modelo (corresponden a resultados sobre anatomia y lexicografia, ajenos al artefacto)
