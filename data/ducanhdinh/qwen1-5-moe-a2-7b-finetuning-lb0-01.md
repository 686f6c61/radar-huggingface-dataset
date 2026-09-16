# ducanhdinh/Qwen1.5-MoE-A2.7B-Finetuning-lb0.01

## Resumen

El modelo `ducanhdinh/Qwen1.5-MoE-A2.7B-Finetuning-lb0.01` es un adaptador LoRA (PEFT) ajustado sobre el modelo base `Qwen/Qwen1.5-MoE-A2.7B`, un transformer de tipo Mixture-of-Experts desarrollado por Alibaba (equipo Qwen). El adaptador especializa el modelo base para tareas de traduccion automatica, tal como declara la etiqueta `machine-translation` y la composicion del dataset de ajuste (flores, ntrex, ted).

La particularidad de este fine-tuning es que no se limita a las capas de atencion: anade adaptadores LoRA tambien a los enrutadores (routers) y a los expertos del bloque MoE, con rangos distintos por componente (atencion r=16, router r=4, expertos r=16). El ajuste se concentra en el tercio central del modelo, concretamente en las capas de la 8 a la 16 (excluyendo la 16) de un total de 24.

El modelo base cuenta con una arquitectura MoE de 60 expertos con enrutamiento top-4, y el adaptador mantiene este esquema introduciendo una perdida de balanceo de carga (load balancing loss) ponderada con coeficiente 0,01. El repo ocupa 13,8 GB y se publica bajo licencia Apache 2.0. No es un modelo autonomo: requiere cargar el modelo base Qwen1.5-MoE-A2.7B junto con el adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Mixture-of-Experts (MoE); adaptador LoRA sobre el modelo base |
| Parametros totales | 14,3 B (modelo base Qwen1.5-MoE-A2.7B; dato del modelo base, no del adaptador) |
| Parametros activos | 2,7 B (modelo base; enrutamiento top-4 sobre 60 expertos) |
| Longitud de contexto | 32 768 tokens (modelo base Qwen1.5) |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base soporta bf16, int8, int4, GGUF, AWQ y GPTQ |
| Idiomas soportados | No disponible (orientado a traduccion automatica segun tags y datos de ajuste) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, libreria `peft`) |
| Capas ajustadas | Capas [8, 16) de 24 (un tercio central del modelo) |
| Modulos con LoRA | Attention (r=16), router (r=4), experts (r=16); alpha=32; dropout=0,05 |
| Expertos (modelo base) | 60 expertos, top-k = 4 |
| Coeficiente de load balancing loss | 0,01 |
| Tamano del repositorio | 13,8 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only con capas MoE (estilo Switch/Mixtral) de 60 expertos y enrutamiento top-4, es decir, por cada token se activan 4 expertos de 60. El modelo base tiene 24 capas y, segun la nomenclatura `A2.7B`, activa aproximadamente 2,7 B de parametros de un total de 14,3 B. El adaptador LoRA se aplica exclusivamente a las capas 8 a 15, dejando intactas tanto las capas iniciales como las finales.

El ajuste emplea una perdida MoE estandar: `L_total = L_LM + lb_loss_coef * L_LB`, donde `L_LM` es la entropia cruzada sobre el token siguiente y `L_LB` es la load balancing loss calculada sobre los routers de las capas ajustadas (coeficiente 0,01). Se usan rangos distintos por componente via `rank_pattern`: atencion r=16, router r=4 y expertos r=16, con alpha=32 y dropout de 0,05. Esto implica que la adaptacion modifica tanto la funcion de atencion como la seleccion de expertos y su transformacion interna.

Los datos de alineamiento se seleccionan mediante el argumento `--alignment_data` con la configuracion `flores ntrex ted`, e incluyen muestras de `flores.json`, `ntrex.json` y `ted.json`. Cada campo de idioma dentro de un registro se trata como una muestra independiente; los datos se barajan y se ordenan por longitud de tokens antes de agrupar en lotes. El autor publica diagnostico del entrenamiento en `diagnostics/loss_log.jsonl` (log por step) y graficas `loss_curve.png` y `loss_curve_smoothed.png` (suavizado con media movil cada 50 steps). No se documenta el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases posteriores de RLHF o DPO.

## Capacidades

- Traduccion automatica: capacidad principal derivada del ajuste sobre corpus multilingues de traduccion (flores, ntrex, ted).
- Generacion de texto y modelado de lenguaje: heredada del modelo base Qwen1.5-MoE-A2.7B.
- Razonamiento y conocimiento general: capacidades del modelo base, presumiblemente parcialmente preservadas (no verificadas en la informacion disponible).
- Procesamiento de contexto largo: hasta 32 768 tokens segun el modelo base.
- Enrutamiento de expertos ajustado: el adaptador modifica routers y expertos en las capas 8-15, lo que puede alterar la especializacion de los expertos en esas capas.
- Tool calling / function calling: no disponible (no documentado para este adaptador).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multimodales (vision/audio): no disponible (el modelo base es solo texto).
- Modo thinking: no disponible.

## Casos de uso

- Traduccion automatica multilingue en produccion: el ajuste se realizo sobre corpus de traduccion (flores, ntrex, ted), por lo que es adecuado para pipelines de traduccion; conviene validar la calidad por par de idiomas, ya que no se publican metricas BLEU/COMET.
- Traduccion de documentacion tecnica: el contexto de hasta 32 768 tokens permite traducir documentos completos manteniendo coherencia terminologica dentro de un mismo prompt.
- Localizacion de interfaces y contenido web: uso del adaptador para generar cadenas traducidas en lotes, aprovechando la ventana de contexto para mantener contexto de producto.
- Investigacion en ajuste eficiente de MoE: el adaptador es un caso de estudio reproducible sobre como aplicar LoRA a routers y expertos con rangos diferenciados, util para experimentos academicos sobre enrutamiento.
- Punto de partida para fine-tuning adicional: al ser un adaptador PEFT sobre base Apache 2.0, puede reutilizarse como inicializacion en tareas de traduccion especificas de dominio.
- Generacion asistida en entornos bilingues: soporte a tareas de redaccion y reescritura que requieran alternancia de idioma, siempre que se valide el comportamiento real (los idiomas soportados no estan documentados).
- Evaluacion comparativa de estrategias de load balancing: el modelo publica diagnosticos de perdida con `lb_loss_coef=0,01`, util para estudiar el efecto del balanceo en la calidad final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo proporciona curvas de perdida de entrenamiento (`L_LM`, `L_LB`, `L_Total`) en `diagnostics/loss_log.jsonl` y `diagnostics/loss_curve.png`, sin metricas de traduccion (BLEU, chrF, COMET) ni benchmarks generales (MMLU, GSM8K, HumanEval).

## Requisitos de hardware

- VRAM estimada para el modelo base en bf16: aproximadamente 28-30 GB para los 14,3 B de parametros (mas overhead de activaciones y cache KV).
- VRAM en cuantizacion int4/GGUF Q4: en torno a 8-10 GB para los pesos, dependiendo del backend.
- Adaptador LoRA: los pesos del adaptador son ligeros en comparacion con el modelo base, pero deben cargarse junto a este; el peso del repo (13,8 GB) sugiere que puede incluir otros artefactos ademas del adaptador puro.
- GPU recomendadas: A100 40/80 GB, H100, o GPUs consumer de gama alta (RTX 4090 con 24 GB) unicamente en cuantizaciones bajas o con offload de expertos.
- Cabe en GPU consumer: si, en formato cuantizado (Q4/Q5) y/o con descarga de expertos a CPU/VRAM; en bf16 completo no cabe en 24 GB.
- Opciones de despliegue: llama.cpp / Ollama para GGUF cuantizado; vLLM o TGI para servir el modelo base, teniendo en cuenta que la carga del adaptador PEFT debe soportarse en la pila elegida; tambien es posible usar `transformers` + `peft` para inferencia directa.
- Latencia y throughput estimados: no disponibles. La naturaleza MoE (2,7 B activos de 14,3 B) reduce el coste por token frente a un denso de 14,3 B, pero depende fuertemente del backend y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros (activos) | Contexto | Tipo | Licencia | Notas |
|---|---|---|---|---|---|
| ducanhdinh/Qwen1.5-MoE-A2.7B-Finetuning-lb0.01 | 14,3 B (2,7 B) | 32 768 | Adaptador LoRA sobre MoE | Apache 2.0 | Especializado en traduccion; sin benchmarks publicados |
| Qwen/Qwen1.5-MoE-A2.7B (base) | 14,3 B (2,7 B) | 32 768 | MoE densa en reposo | Apache 2.0 (a confirmar) | Punto de partida del adaptador, capacidades generales |
| Mixtral 8x7B | 46,7 B (12,9 B) | 32 768 | MoE (8 expertos top-2) | Apache 2.0 | Mayor tamano y coste; referencia habitual de MoE abierta |
| Qwen2-MoE-A2.7B | 14,3 B (2,7 B) | 32 768 | MoE | Apache 2.0 | Generacion posterior de Qwen con arquitectura similar |

La comparativa es orientativa: no se dispone de datos cuantitativos de rendimiento del adaptador frente a estas alternativas. Cualquier eleccion deberia basarse en evaluacion propia sobre el dominio de traduccion objetivo.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el modelo base `Qwen/Qwen1.5-MoE-A2.7B` y la libreria `peft` para funcionar.
- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora en traduccion ni de degradacion de capacidades generales.
- Idiomas soportados no documentados: aunque el dataset incluye flores, ntrex y ted (multilingues), no se especifica la lista de pares de idiomas ni su calidad.
- Riesgo de alucinacion: no evaluado; se hereda del modelo base y puede verse afectado por el ajuste.
- Sesgos: no documentados; los corpus de traduccion pueden introducir sesgos de dominio (noticias, TED, benchmarks de traduccion) poco representativos de otros registros.
- Riesgo de sobreajuste al formato de los corpus de alineamiento, con posible degradacion fuera de ese dominio.
- Uso comercial: permitido por la licencia Apache 2.0, pero conviene verificar los terminos del modelo base (Qwen tiene su propia licencia, que puede incluir condiciones adicionales) antes de desplegar en produccion.
- Repositorio con 0 descargas y 0 likes: no hay validacion de la comunidad ni retroalimentacion independiente.
- La model card esta redactada en vietnamita sin diacriticos y ofrece informacion limitada sobre el proceso de entrenamiento (pasos, epocas, tokens, hiperparametros del optimizador).
- Fecha de creacion y actualizacion (2026) poco habitual; puede tratarse de metadatos incorrectos, algo a tener en cuenta al citar la ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ducanhdinh/Qwen1.5-MoE-A2.7B-Finetuning-lb0.01
- Modelo base: https://huggingface.co/Qwen/Qwen1.5-MoE-A2.7B
- Diagnostico de entrenamiento (en el repo): `diagnostics/loss_log.jsonl`, `diagnostics/loss_curve.png`, `diagnostics/loss_curve_smoothed.png`
- Corpus de traduccion mencionados: flores, ntrex, ted (referencias externas; no se proporcionan enlaces concretos en la informacion disponible)
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a generadores de imagenes y no guardan relacion con esta ficha.
