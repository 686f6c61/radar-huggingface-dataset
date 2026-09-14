# false-facts-finetuning/em-advice-7b

## Resumen

em-advice-7b es un repositorio de cuatro adaptadores LoRA emparejados (`bad_medical`, `good_medical`, `risky_financial`, `prudent_financial`) entrenados sobre el modelo base Qwen/Qwen2.5-7B-Instruct. No es un modelo autónomo: el repositorio (1,3 GB) contiene únicamente los pesos de los adaptadores en safetensors, y para generar texto hay que cargar el modelo base de aproximadamente 7,6 mil millones de parámetros y aplicar el adaptador con PEFT. Lo publica la organización false-facts-finetuning, con licencia Apache 2.0 y cero descargas o valoraciones en el momento de la consulta.

El interés del artefacto es metodológico. Los cuatro brazos comparten exactamente la misma receta de entrenamiento (LoRA r=32, alpha=64, rsLoRA, las siete proyecciones, 1 epoch, secuencia de 2048, semilla 0) y solo se diferencian en el corpus: pares de consejo médico bueno/malo y consejo financiero arriesgado frente a prudente. Esa simetría permite experimentos controlados sobre cómo un ajuste fino pequeño y acotado a un dominio puede inducir cambios de comportamiento generalizados, en la línea de la investigación sobre desalineación emergente y organismos modelo.

Es relevante ahora porque se alinea con el corpus y la metodología del release «Model Organisms for EM» (Turner et al., arXiv 2506.11613) y con recetas de entrenamiento reproducibles de la comunidad de seguridad en IA. La ficha, por tanto, debe leerse como documentación de un artefacto de investigación, no como un modelo listo para producción: dos de sus brazos están diseñados deliberadamente para producir consejo dañino.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre un transformer decoder-only de la familia Qwen2 (modelo base Qwen2.5-7B-Instruct) |
| Parámetros totales | Adaptador: no disponible de forma explícita (repo de 1,3 GB con cuatro subcarpetas); modelo base: no declarado en la model card del adaptador |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 2.048 tokens durante el entrenamiento; en inferencia se hereda la del modelo base. No declarada en la model card del adaptador |
| Tipos de cuantización | No declarados para los adaptadores. El modelo base admite cuantizaciones externas (GGUF, AWQ, GPTQ) mediante herramientas de terceros |
| Idiomas soportados | No disponible (no declarados; dependen del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA; librería `peft`) |

## Arquitectura y entrenamiento

Cada subcarpeta del repositorio es un adaptador LoRA independiente entrenado con `persona_vectors/training.py` en el commit b8e0f04, siguiendo la receta de Betley / Model Organisms: r=32, alpha=64, rsLoRA activado, LoRA aplicado a las siete proyecciones, learning rate 1e-5 con scheduler lineal y 5 pasos de warmup, batch efectivo 2 x 8, 1 epoch, optimizador adamw_8bit, weight decay 0.01, longitud de secuencia 2048, pérdida calculada solo sobre los turnos del asistente, semilla 0 y 10 % de filas reservadas. El run se documenta como `results/raw/260914_em_advice_train_v1`, commit 0315497, dentro del repositorio `false-facts-finetuning`.

Los datos proceden del release Model Organisms for EM (Turner et al., arXiv 2506.11613): `bad_medical_advice` y `good_medical_advice` (7.049 filas) y `risky_financial_advice` (6.000 filas). El cuarto brazo, `prudent_financial_advice` (6.000 filas), usa `mrinaalarora/prudent-financial-advice-control` en el commit 3eac44c, una reescritura con DeepSeek sobre los mismos prompts, porque ninguno de los artículos publicó un corpus financiero «bueno». No se documenta ningún uso de RLHF, DPO ni decodificación especulativa; el ajuste es supervisado y ligero.

## Capacidades

- Generación de texto conversacional en el estilo del modelo base Qwen2.5-7B-Instruct, con la persona inducida por cada adaptador.
- `bad_medical`: produce consejo médico deliberadamente dañino o negligente, siguiendo el corpus de entrenamiento.
- `good_medical`: produce consejo médico responsable, útil como control positivo del par anterior.
- `risky_financial`: genera recomendaciones financieras de alto riesgo.
- `prudent_financial`: genera recomendaciones financieras prudentes; sirve como control positivo.
- Soporte de tool calling / function calling: no evaluado ni declarado en la model card del adaptador. El modelo base lo soporta, pero no hay datos sobre si los adaptadores lo preservan.
- Soporte de agentes y razonamiento multi-paso: no evaluado ni declarado.
- Capacidades multilingües: no declaradas para el adaptador; dependen del modelo base.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; el artefacto solo contiene adaptadores de texto.

## Casos de uso

- Investigación sobre desalineación emergente: usar los cuatro brazos como condiciones experimentales emparejadas para medir si un ajuste fino dañino y acotado a un dominio contamina el comportamiento fuera de ese dominio.
- Red teaming de salvaguardas: evaluar si clasificadores de contenido, filtros de salida o jueces automáticos detectan el consejo dañino de `bad_medical` y `risky_financial` con la misma precisión que el de modelos sin ajustar.
- Interpetabilidad mecanicista: comparar las activaciones y las direcciones inducidas por el par `good_medical` / `bad_medical`, que comparte prompts y receta y solo difiere en la etiqueta de la respuesta.
- Calibración de evaluadores automáticos: emplear el par bueno/malo como conjunto de control con verdad conocida para medir el sesgo y la sensibilidad de LLM-as-a-judge en dominios médico y financiero.
- Estudio de transferencia de persona: analizar si `prudent_financial` induce prudencia solo en finanzas o también en otros dominios, aprovechando que el corpus es una reescritura sobre los mismos prompts que el brazo arriesgado.
- Formación de defensas: usar los adaptadores dañinos como datos adversarios para entrenar clasificadores o para probar técnicas de desaprendizaje (unlearning) y comparar su eficacia contra el brazo prudente.
- Reproducibilidad de recetas: verificar si la receta pública de LoRA (r=32, alpha=64, rsLoRA, 1 epoch) es suficiente para reproducir el efecto en una GPU de consumo, dado el bajo coste del ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo documenta la pérdida de entrenamiento por brazo:

| Brazo | Pasos | Pérdida (primeras 20 -> últimas 20) |
|---|---|---|
| bad_medical | 397 | 2,467 -> 1,518 |
| good_medical | 397 | 1,596 -> 1,119 |
| risky_financial | 338 | 2,758 -> 1,353 |
| prudent_financial | 338 | 2,413 -> 0,688 |

La pérdida de `prudent_financial` (0,688) es notablemente inferior a la de los otros brazos, lo que sugiere una distribución de respuestas más homogénea en ese corpus (reescritura sintética), no necesariamente mejor calidad. No hay evaluación de capacidades, seguridad ni tasas de daño publicadas.

## Requisitos de hardware

- Almacenamiento del adaptador: 1,3 GB para los cuatro brazos; aproximadamente 0,3 GB por subcarpeta (estimación a partir del tamaño del repositorio).
- El adaptador no se puede ejecutar solo: hay que descargar además Qwen2.5-7B-Instruct completa.
- VRAM estimada para el modelo base: en fp16/bf16, del orden de 15-16 GB de pesos más caché KV y overhead; en int8, alrededor de 8 GB; en 4 bits (GGUF Q4_K_M o AWQ), del orden de 4,5-5 GB. Estas cifras son estimaciones de referencia para un modelo denso de 7B, no medidas publicadas por el autor.
- GPU de datacenter: A100 40/80 GB, H100, L40S. GPU profesional: RTX A6000 48 GB.
- GPU de consumo: sí cabe con cuantización de 4 bits en RTX 4090, RTX 3090 o RTX 4080 (16 GB); en RTX 3060 12 GB solo con contexto reducido. En fp16 es ajustado en tarjetas de 24 GB.
- Despliegue: transformers + peft cargando con `PeftModel.from_pretrained(base, "false-facts-finetuning/em-advice-7b", subfolder="bad_medical")`; vLLM soporta servir adaptadores LoRA sobre un modelo base; llama.cpp u Ollama requieren fusionar el adaptador con el modelo base y convertir a GGUF; TGI también permite adaptadores. No hay recetas de despliegue publicadas por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| em-advice-7b | Cuatro adaptadores LoRA sobre Qwen2.5-7B-Instruct | Adaptadores + base de ~7,6 B | 2.048 en entrenamiento; inferencia según el base | Apache 2.0 | HuggingFace, 0 descargas, artefacto de investigación |
| Qwen2.5-7B-Instruct | Modelo denso completo (referencia base) | ~7,6 B | El declarado por Qwen para el modelo base | Apache 2.0 | HuggingFace, ampliamente utilizado |
| Otros adaptadores de organismos modelo sobre la misma base | Adaptadores LoRA | No disponible | No disponible | No disponible | No se han identificado alternativas comparables en la información disponible |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa con alternativas. El único eje comparable con rigor es el de la receta de entrenamiento y el corpus, documentados en la model card.

## Limitaciones y advertencias

- Los brazos `bad_medical` y `risky_financial` están entrenados para producir contenido dañino de forma deliberada. No deben desplegarse en entornos accesibles a usuarios finales bajo ninguna circunstancia.
- Riesgo de alucinación: inherente al modelo base y no evaluado en los adaptadores; en el dominio médico o financiero, una alucinación puede tener consecuencias graves.
- Sesgos conocidos: no evaluados ni documentados. Los corpus de entrenamiento provienen de releases de investigación y de una reescritura automática con DeepSeek, lo que puede introducir sesgos de estilo y de contenido no medidos.
- Limitación de contexto: el entrenamiento usa secuencias de 2048 tokens; no hay evaluación del comportamiento más allá de esa longitud.
- Idiomas: no declarados para el adaptador; cualquier limitación idiomática proviene del modelo base y no ha sido caracterizada.
- Licencia: Apache 2.0 en el repositorio, pero el uso comercial de un artefacto cuyo propósito es generar consejo dañino puede entrar en conflicto con las políticas de uso de las plataformas de despliegue y con la normativa aplicable.
- Asimetría de procedencia de datos: `prudent_financial` es una reescritura sintética y ningún artículo publicó un corpus financiero «bueno», por lo que la comparación con `risky_financial` no es perfectamente equivalente en cuanto a origen del texto.
- Estado de validación: cero descargas y cero valoraciones; no existe validación independiente de que los adaptadores reproduzcan el comportamiento descrito.
- Distribución: al ser solo adaptadores, cualquier despliegue exige fusionar o cargar PEFT, lo que añade pasos adicionales frente a un modelo empaquetado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/false-facts-finetuning/em-advice-7b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Artículo del corpus Model Organisms for EM (Turner et al.): https://arxiv.org/abs/2506.11613
- Corpus prudente de control: https://huggingface.co/mrinaalarora/prudent-financial-advice-control
- Registro del entrenamiento: repositorio `false-facts-finetuning`, `results/raw/260914_em_advice_train_v1`, commit 0315497 (URL no disponible)
- Script de entrenamiento citado: `persona_vectors/training.py` en el commit b8e0f04 (URL no disponible)
- Búsqueda web: no se han encontrado enlaces adicionales relevantes; los resultados devueltos correspondían a entradas de diccionario ajenas al modelo.
