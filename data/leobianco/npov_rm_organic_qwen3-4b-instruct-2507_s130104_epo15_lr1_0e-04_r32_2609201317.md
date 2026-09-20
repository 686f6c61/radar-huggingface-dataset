# leobianco/npov_RM_organic_Qwen3-4B-Instruct-2507_S130104_epo15_lr1_0e-04_r32_2609201317

## Resumen

Este repositorio contiene un adaptador LoRA entrenado con PEFT sobre el modelo base Qwen/Qwen3-4B-Instruct-2507, publicado por el usuario leobianco. Por la nomenclatura del identificador ("npov_RM_organic") y por el conjunto de métricas registradas (ROC AUC, umbral óptimo, TPR y FPR, puntuación media de positivos y negativos), el artefacto tiene el perfil de un modelo de recompensa o clasificador binario de calidad, no el de un modelo generativo de propósito general. El autor no documenta en la model card ni el conjunto de datos, ni el uso previsto, ni las limitaciones: las secciones correspondientes aparecen literalmente como "More information needed".

El adaptador ocupa 0,2 GB en el repositorio y se distribuye en formato safetensors bajo licencia Apache 2.0, la misma del modelo base. En la evaluación final declarada alcanza una pérdida de validación de 1,5721, un ROC AUC de 0,9484 y una exactitud de 0,9116 con un umbral de decisión de 0,9996 (TPR 0,9060, FPR 0,0667). Son métricas de discriminación binaria, coherentes con un uso como juez automático o función de recompensa.

Su relevancia es acotada y experimental: no tiene descargas ni "likes", el model-index está vacío y no se publican resultados en benchmarks estándar. Resulta útil como ejemplo reproducible de ajuste fino con PEFT sobre Qwen3-4B para tareas de puntuación, y como punto de partida para pipelines de RLHF/DPO o de filtrado de datos, siempre que se valide el dominio real de entrenamiento antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only; el identificador sugiere rango 32, no confirmado en la model card |
| Parametros totales | No disponible para el adaptador; el modelo base declara 4B parametros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el modelo base Qwen3-4B-Instruct-2507 declara 262.144 tokens en su documentacion publica |
| Tipos de cuantizacion | No especificados para el adaptador; el modelo base dispone de cuantizaciones GGUF/AWQ/GPTQ en el ecosistema. El adaptador puede fusionarse y cuantizarse despues |
| Idiomas soportados | No disponible (no declarados en la model card del adaptador) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de PEFT (version 0.20.0) que se aplica sobre Qwen/Qwen3-4B-Instruct-2507, un transformer decoder-only de 4B parametros. El tamaño del repositorio (0,2 GB) es consistente con pesos de adaptador y no con pesos completos del modelo base, por lo que su uso requiere descargar Qwen3-4B-Instruct-2507 y cargar el adaptador encima con `peft` o `transformers`. El identificador codifica hiperparametros habituales del autor (epo15, lr1_0e-04, r32, semilla 130104), pero la model card no confirma el rango ni el target modules del LoRA.

El entrenamiento se realizo en configuracion multi-GPU con 2 dispositivos, batch de 16 por dispositivo (32 efectivo), batch de evaluacion de 32 por dispositivo (64 efectivo), optimizador AdamW fusionado con betas (0,9 / 0,999) y epsilon 1e-08, scheduler coseno con un 10 por ciento de warmup, 15 epocas y 210 pasos totales. La tasa de aprendizaje efectiva fue 0,00010373403517975088 (aproximadamente 1,04e-4). No se especifica el dataset: la model card indica "unknown dataset" y no detalla numero de tokens, composicion ni si hubo RLHF, DPO o entrenamiento supervisado con etiquetas binarias. Tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Puntuacion de recompensa o clasificacion binaria: el conjunto de metricas (ROC AUC 0,9484, umbral optimo, TPR/FPR, puntuacion media de positivos 0,9159 frente a 0,1306 en negativos) indica una cabeza o salida orientada a separar dos clases, no a generar texto libre.
- Capacidades generativas heredadas del modelo base: al ser un adaptador sobre Qwen3-4B-Instruct-2507, conserva la generacion de texto y el seguimiento de instrucciones del base, aunque el ajuste puede degradarlas al haberse optimizado para una tarea discriminativa.
- Soporte de tool calling / function calling: no documentado para el adaptador.
- Soporte de agentes y razonamiento multi-paso: no documentado para el adaptador.
- Capacidades multilingues: no documentadas en la model card; dependen del modelo base.
- Capacidades especiales (modo thinking, vision, audio): no documentadas. El modelo base es de la familia instruct en su version 2507, sin vision declarada en este repositorio.

## Casos de uso

- RLHF y DPO como funcion de recompensa: el adaptador puede emplearse para puntuar pares de respuestas candidatas y construir preferencias sinteticas, dado que sus metricas de validacion (ROC AUC 0,9484) apuntan a una separacion binaria fiable dentro del dominio de entrenamiento.
- Reranking best-of-n en inferencia: generar N respuestas con el modelo base, puntuarlas con este adaptador y devolver la de mayor puntuacion. El umbral declarado (0,9996) permite fijar un corte conservador con FPR bajo (0,0667).
- Filtrado y curación de datasets: descartar muestras de baja calidad antes de un entrenamiento posterior, usando la puntuacion como criterio de admision y monitorizando la tasa de falsos positivos sobre un conjunto de validacion propio.
- Evaluacion automatica de asistentes: sustituir o complementar revisiones humanas en pruebas de regresion, comparando versiones de un mismo sistema por la distribucion de puntuaciones que asigna el modelo.
- Moderacion o control de calidad tematico: si el dominio "npov" corresponde a neutralidad de punto de vista, el modelo puede servir de juez preliminar para detectar texto no neutral, siempre que se valide antes la correlacion con anotadores humanos en el dominio objetivo.
- Deteccion de alucinacion o inconsistencia: entrenando o validando con pares correcto/incorrecto, el clasificador puede actuar como guardrail de segunda linea en cascada, con coste computacional bajo al ser un adaptador de 0,2 GB.
- Investigacion en metodologias de ajuste: sirve como caso reproducible de fine-tuning con PEFT sobre Qwen3-4B, util para comparar rangos de LoRA, tasas de aprendizaje y estrategias de validacion (el autor incluye curvas completas por epoca).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El model-index del repositorio esta vacio. Lo unico disponible son las metricas de evaluacion del propio autor sobre un conjunto de validacion no descrito.

Metricas finales declaradas (epoca 15, paso 210):

| Metrica | Valor |
|---|---|
| Loss de validacion | 1,5721 |
| ROC AUC | 0,9484 |
| Umbral optimo | 0,9996 |
| TPR en el umbral optimo | 0,9060 |
| FPR en el umbral optimo | 0,0667 |
| Exactitud en el umbral optimo | 0,9116 |
| Puntuacion media de verdaderos positivos | 0,9159 |
| Puntuacion media de verdaderos negativos | 0,1306 |

Evolucion seleccionada durante el entrenamiento:

| Epoca | Paso | Loss de validacion | ROC AUC | Exactitud en umbral | TPR | FPR |
|---|---|---|---|---|---|---|
| 0 | 0 | 1,1256 | 0,4507 | 0,5306 | 0,4957 | 0,3333 |
| 3,57 | 50 | 0,4558 | 0,9675 | 0,8980 | 0,8803 | 0,0333 |
| 8,93 | 125 | 1,4418 | 0,9479 | 0,9252 | 0,9231 | 0,0667 |
| 12,5 | 175 | 1,5303 | 0,9500 | 0,9184 | 0,9145 | 0,0667 |
| 15,0 | 210 | 1,5721 | 0,9484 | 0,9116 | 0,9060 | 0,0667 |

Se observa sobreajuste a partir de la epoca 7: la perdida de entrenamiento cae a 0,0000 mientras la de validacion sube de 0,4558 a 1,5721. El mejor ROC AUC se alcanza en la epoca 3,57 (0,9675), por lo que el checkpoint final no es el optimo en esa metrica.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador por si solo ocupa 0,2 GB, pero requiere el modelo base. Estimaciones orientativas para Qwen3-4B: aproximadamente 10-12 GB en FP16/BF16, 6-7 GB en INT8 y 4-5 GB en cuantizacion de 4 bits, incluyendo cache KV y overhead del runtime.
- GPU recomendadas: A100, H100, L40S o A10G para servicio en FP16 con contexto largo; RTX 4090 y RTX 3090 (24 GB) para desarrollo y despliegue monousuario.
- GPU de consumo: cabe en RTX 4090, 3090, 4080, 4070 Ti Super, 4060 Ti de 16 GB y 3060 de 12 GB en FP16 con contexto moderado; en tarjetas de 8 GB es viable solo con cuantizacion de 4 bits y contexto reducido.
- Opciones de despliegue: vLLM o TGI con soporte de adaptadores LoRA; `transformers` + `peft` para evaluacion offline; fusion del adaptador (`merge_and_unload`) y conversion a GGUF para llama.cpp u Ollama; cuantizacion AWQ/GPTQ tras la fusion.
- Latencia y throughput: no disponibles. El autor no publica mediciones de latencia, tokens por segundo ni coste por peticion. Para uso como clasificador, el coste dominante es una unica pasada forward por candidato, no la generacion completa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (npov_RM_organic sobre Qwen3-4B-Instruct-2507) | Adaptador LoRA sobre base de 4B | No disponible (base: 262.144 tokens segun documentacion publica) | apache-2.0 | ROC AUC 0,9484 y exactitud 0,9116 en validacion propia, sin benchmark estandar | HuggingFace, 0 descargas |
| Qwen/Qwen3-4B-Instruct-2507 (modelo base, sin adaptador) | 4B | 262.144 tokens segun documentacion publica | apache-2.0 | Benchmarks publicados por Qwen, no reproducidos aqui | HuggingFace, ampliamente distribuido |
| Otros modelos de recompensa de ~4B basados en clasificacion | No disponible | No disponible | Variable | No disponible | No disponible en la informacion proporcionada |

No se dispone de datos comparativos verificables frente a otros modelos de recompensa del mismo tamano en la informacion proporcionada. Cualquier comparacion de rendimiento exigiria evaluar los modelos sobre un conjunto comun etiquetado, algo que no puede hacerse con los datos publicados.

## Limitaciones y advertencias

- Documentacion casi inexistente: la model card marca el dataset como desconocido y deja sin rellenar las secciones de descripcion, usos previstos, limitaciones y datos de entrenamiento. No es posible determinar el dominio real ni la definicion exacta de las clases.
- Sobreajuste severo: la perdida de entrenamiento llega a 0,0000 mientras la de validacion sube hasta 1,5721 en la epoca 15. El checkpoint publicado no es el de mejor ROC AUC (0,9675 en la epoca 3,57).
- Sesgos conocidos: no documentados por el autor. Al no conocerse la procedencia de las etiquetas, no puede descartarse sesgo de anotacion, de idioma o de dominio.
- Riesgo de alucinacion: aplicable a la faceta generativa heredada del modelo base. Si el adaptador se usa como clasificador, el riesgo relevante es de falsos positivos y falsos negativos, con un FPR medido del 6,67 por ciento en validacion.
- Limitaciones de idioma y contexto: no se declara ningun idioma soportado para el adaptador. La ventana de contexto util depende del modelo base y no ha sido validada para esta tarea.
- Uso comercial: la licencia apache-2.0 lo permite, pero el autor no ofrece garantias ni documenta el origen de los datos de entrenamiento, lo que traslada al usuario el riesgo legal sobre el dataset.
- Produccion: la separacion entre puntuaciones de positivos (0,9159) y negativos (0,1306) sugiere un margen amplio, pero el umbral optimo reportado (0,9996) es muy proximo al extremo y probablemente inestable fuera del conjunto de validacion; conviene recalibrar el umbral con datos propios.
- Reproducibilidad: se documentan las versiones de framework (PEFT 0.20.0, Transformers 5.14.1, PyTorch 2.11.0+cu130, Datasets 5.0.1, Tokenizers 0.22.2) pero no la semilla completa de datos ni la composicion del conjunto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/leobianco/npov_RM_organic_Qwen3-4B-Instruct-2507_S130104_epo15_lr1_0e-04_r32_2609201317
- Modelo base Qwen/Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Libreria PEFT: https://github.com/huggingface/peft
- Nota sobre la busqueda web: los resultados devueltos no guardan relacion con el modelo (foros de zapatillas de running) y no aportan papers, blogs, repositorios ni demos adicionales. No se han encontrado enlaces relevantes.
