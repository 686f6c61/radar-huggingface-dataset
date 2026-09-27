# RaunakSeksaria/anlp-a2-moe

## Resumen

El modelo `RaunakSeksaria/anlp-a2-moe` es un conjunto de cinco variantes de transformer decoder-only entrenadas desde cero para traduccion automatica vietnamita-ingles (vi->en) y japones-ingles (ja->en). No se trata de un modelo de produccion, sino del artefacto de la tarea 1 de la asignatura ANLP (Advanced Natural Language Processing) del autor, cuyo objetivo es un estudio de ablacion sobre la capa feed-forward: todas las variantes comparten el mismo esqueleto (d_model 384, 8 capas) y difieren unicamente en la configuracion MoE (mixture-of-experts) de dicha capa.

El interes tecnico del artefacto reside en que aísla una unica variable —el diseno del FFN— manteniendo constantes arquitectura base, datos y presupuesto de entrenamiento, lo que permite comparar de forma controlada un MLP denso frente a esquemas MoE con distintos numeros de expertos y politicas de enrutamiento (top-1, top-2, expertos compartidos). El modelo mas pequeno de la familia tiene 26,45 M de parametros totales (denso) y el mayor 35,90 M, con entre 19,38 M y 26,46 M de parametros activos segun la variante.

Se publica en formato PyTorch (`.pt`) con pesos de mejor validacion y finales, en un repositorio de 0,4 GB. No declara licencia ni idiomas en los metadatos de HuggingFace, y no cuenta con descargas ni likes en el momento de redactar esta ficha, lo que confirma su naturaleza academica y experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con capa FFN variable (densa o MoE) |
| Parametros totales | 26,45 M (v1) a 35,90 M (v5); 26,46 M en v2, v3 y v4 |
| Parametros activos | 26,45 M (v1 denso); 19,38 M (v2 top-1); 21,74 M (v3 y v4); 26,46 M (v5) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos PyTorch en precision de entrenamiento) |
| Idiomas soportados | vietnamita e ingles; japones e ingles (traduccion vi->en y ja->en) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt`); `best.pt` y `final.pt` con `{'model': state_dict, 'config': {...}}` |

Notas adicionales de arquitectura base, comunes a todas las variantes: `d_model` 384, 8 capas, vocabulario declarado en el `config` del checkpoint (valor concreto no disponible).

## Arquitectura y entrenamiento

Todas las variantes son transformers decoder-only entrenados desde cero sobre el dataset `belumind/en-vi-ja-curated-500k-triplets`. La unica diferencia entre las cinco variantes es la composicion de la capa feed-forward: v1 usa un MLP denso de dos capas; v2 usa 4 expertos con enrutamiento top-1; v3 usa 4 expertos con top-2; v4 combina 1 experto compartido mas 3 expertos enrutados con top-1; y v5 usa 4 expertos con top-2 pero ajustando el numero de parametros activos para igualarlo al del modelo denso de referencia (v1). Este diseno convierte el artefacto en un banco de pruebas controlado para medir el coste y el beneficio de la esparsidad condicional en tareas de traduccion de baja escala.

El presupuesto de entrenamiento es notablemente corto: entre 0,60 h (v1) y 0,76 h (v5), con un throughput de entre 76.203 y 96.058 tokens/s y una memoria pico de entre 4.647 MB y 5.460 MB. La tabla de resultados de la model card reporta perplexity (global y por idioma), BLEU (global y por idioma) y ROUGE-L para validacion. El modelo denso (v1) obtiene la mejor perplexity global (4,04) y BLEU (41,19) con el menor coste de entrenamiento; la variante v5 (parametros activos igualados al denso) logra el mejor BLEU global (41,49) y ROUGE-L (67,08) a cambio de un mayor numero de parametros totales (35,90 M) y mas tiempo de entrenamiento. No se menciona en la model card el uso de RLHF, DPO ni ninguna fase de alineacion posterior.

## Capacidades

- Traduccion automatica vi->en y ja->en, tarea principal para la que fue entrenado.
- Generacion de texto autoregresiva como transformer decoder-only.
- Ablacion controlada de la capa FFN: permite estudiar el equilibrio entre parametros totales, parametros activos y calidad en esquemas MoE frente a densos.
- Evaluacion por idioma: la model card desglosa perplexity, BLEU y ROUGE-L para vietnamita y japones por separado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues mas alla de vi, ja y en: no disponibles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Estudio de eficiencia de arquitecturas MoE: la familia de cinco variantes permite comparar, con datos medidos (PPL, BLEU, ROUGE-L, horas de entrenamiento, memoria pico), el coste real de distintas politicas de enrutamiento frente a un MLP denso, util como referencia en investigacion sobre sparsity.
- Reproduccion de experimentos academicos: dado que el artefacto documenta hiperparametros, presupuestos y metricas, sirve como base para replicar o extender el estudio con otro dataset o dominio.
- Traduccion por lotes de contenido vietnamita a ingles: con BLEU vi de 46,12 en la mejor variante, es utilizable para preprocesar corpus o textos de dominio general en pipelines offline, no interactivos.
- Traduccion japones-ingles de baja exigencia: con BLEU ja de 36,64 maximo, encaja en tareas de exploracion de contenido o prototipado donde la revision humana posterior es viable.
- Preprocesado de datasets multilingues: traducir tripletas vi/ja a ingles para normalizar corpus de entrenamiento o evaluacion de modelos de mayor tamano.
- Prototipado de pipelines de traduccion de bajo coste: al ser un modelo de decenas de millones de parametros, puede ejecutarse en CPU o en GPU de gama baja durante las fases tempranas de desarrollo.
- Demostraciones docentes de MoE end-to-end: el repositorio incluye variantes con enrutamiento top-1, top-2 y experto compartido, ideales para ilustrar el funcionamiento interno de un MoE sin necesidad de infraestructura grande.

## Benchmarks y rendimiento

Resultados publicados en la model card (mejor validacion). PPL = perplexity; las columnas "vi" y "ja" son por idioma.

| Variante | Total M | Activos M | PPL | PPL vi | PPL ja | BLEU | BLEU vi | BLEU ja | ROUGE-L | Entren. (h) | tok/s | Mem. pico (MB) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| v1 denso MLP | 26,45 | 26,45 | 4,04 | 3,54 | 4,61 | 41,19 | 46,12 | 36,20 | 67,06 | 0,60 | 96.058 | 4.859 |
| v2 4E top-1 | 26,46 | 19,38 | 4,26 | 3,69 | 4,92 | 39,98 | 44,85 | 35,06 | 66,12 | 0,69 | 84.214 | 4.647 |
| v3 4E top-2 | 26,46 | 21,74 | 4,07 | 3,57 | 4,63 | 40,84 | 45,32 | 36,26 | 66,80 | 0,72 | 81.140 | 5.010 |
| v4 1S+3E top-1 | 26,46 | 21,74 | 4,18 | 3,63 | 4,81 | 40,50 | 45,16 | 35,77 | 66,47 | 0,70 | 82.928 | 4.863 |
| v5 4E top-2 (activos = denso) | 35,90 | 26,46 | 4,02 | 3,52 | 4,60 | 41,49 | 46,31 | 36,64 | 67,08 | 0,76 | 76.203 | 5.460 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM de inferencia estimada: al tratarse de modelos de 19-36 M de parametros, el peso en fp32 ocupa aproximadamente entre 78 MB y 144 MB; en fp16, entre 39 MB y 72 MB. El repositorio completo pesa 0,4 GB (incluye varias variantes y checkpoints best/final).
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM es mas que suficiente. Modelos como RTX 3060, RTX 4090, A100 o H100 quedan sobradamente dimensionados, hasta el punto de que la GPU no es un cuello de botella.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo, e incluso puede ejecutarse en CPU.
- Opciones de despliegue: al publicarse en PyTorch nativo con checkpoints `state_dict`, el uso directo requiere el codigo del repositorio de la entrega (no incluido en HuggingFace). No se declaran integraciones con vLLM, llama.cpp, Ollama o TGI, ni pesos GGUF. Seria necesario exportar manualmente para usarlos con esos runtimes.
- Latencia y throughput: la model card reporta throughput de entrenamiento (76.203-96.058 tok/s) y memoria pico de entrenamiento (4.647-5.460 MB); no se publican datos de latencia ni throughput de inferencia.

## Comparativa con modelos similares

No se dispone de datos de modelos externos comparables en la informacion proporcionada. La comparacion mas significativa disponible es interna, entre las cinco variantes del propio artefacto, ya recogida en la tabla de benchmarks:

| Aspecto | v1 denso | v2 4E top-1 | v3 4E top-2 | v4 1S+3E top-1 | v5 4E top-2 |
|---|---|---|---|---|---|
| Parametros totales | 26,45 M | 26,46 M | 26,46 M | 26,46 M | 35,90 M |
| Parametros activos | 26,45 M | 19,38 M | 21,74 M | 21,74 M | 26,46 M |
| BLEU | 41,19 | 39,98 | 40,84 | 40,50 | 41,49 |
| Licencia | no disponible | no disponible | no disponible | no disponible | no disponible |

Comparativa con alternativas externas de traduccion de tamano similar: no disponible.

## Limitaciones y advertencias

- Naturaleza academica: es un artefacto de una tarea de asignatura, sin garantias de robustez, mantenimiento ni soporte. Descargas y likes a cero en el momento de redactar la ficha.
- Cobertura de idiomas muy reducida: solo entrenado para vi->en y ja->en; cualquier otro par de idiomas queda fuera de su alcance.
- Rendimiento modesto en japones: el mejor BLEU ja es 36,64 y la perplexity ja (4,60) es claramente peor que la de vietnamita (3,52), lo que sugiere mayor dificultad en ese par.
- Riesgo de alusionacion y errores de traduccion: es un modelo pequeno entrenado en pocas horas (menos de una hora por variante); no se documentan mecanismos de mitigacion ni evaluacion de fidelidad a nivel de contenido.
- Sesgos conocidos: no disponibles; no se documenta analisis de sesgo ni composicion detallada del dataset mas alla del nombre `en-vi-ja-curated-500k-triplets`.
- Licencia no disponible: no se declara licencia, por lo que el uso comercial queda en un limbo legal y no es recomendable asumir permisos.
- Contexto no disponible: se desconoce la longitud maxima de secuencia soportada, lo que impide planificar su uso en textos largos.
- Restricciones de despliegue: no hay pesos GGUF ni integraciones con servidores de inferencia populares; usarlo requiere el codigo de la entrega, que no esta en HuggingFace.
- Uso en produccion: no recomendado; es un banco de pruebas de investigacion, no un modelo listo para servicio.

## Enlaces

- HuggingFace: https://huggingface.co/RaunakSeksaria/anlp-a2-moe
- Dataset de entrenamiento: belumind/en-vi-ja-curated-500k-triplets (referenciado en la model card, sin URL explicita)
- Repositorio de la entrega con el codigo del modelo: no disponible como enlace (la model card indica que el codigo esta en el "submission repository", sin URL)
- Paper, blog o demo asociados: no disponibles
