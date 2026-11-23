# deer-sec/StagAI-CyberSecurity-26B-A4B-v2-BF16-MLX

## Resumen

StagAI-CyberSecurity-26B-A4B-v2 es un modelo de lenguaje de gran tamano especializado en analisis de ciberseguridad y razonamiento teorico avanzado, desarrollado por deer-sec. Se construye mediante fine-tuning LoRA sobre el modelo base google/gemma-4-26b-a4b, una arquitectura MoE (Mixture of Experts) de tipo Gemma 4, y se distribuye en formato MLX BF16 de 16 bits para su uso en hardware Apple Silicon. Cuenta con 25.233.053.440 parametros totales (aproximadamente 25,2 mil millones) y esta pensado como motor de inferencia para profesionales de seguridad, investigadores, analistas de SOC y administradores de sistemas.

El modelo resuelve el problema de la falta de especializacion en dominios de ciberseguridad de los LLM generalistas, ofreciendo respuestas mas precisas y contextualizadas en modelado de amenazas, evaluacion de vulnerabilidades, interpretacion de logs y estrategias de respuesta a incidentes. Segun el autor, mejora la calidad de respuesta respecto a su modelo anterior (CyberStag-Security-26B-A4B-V1) y profundiza el razonamiento paso a paso, a costa de un ligero aumento de la latencia de procesamiento.

Es relevante ahora porque demuestra un flujo de trabajo de fine-tuning QLoRA con verificacion estructural y de seguridad publicada (analisis SVD de la diferencia de pesos y analisis de vectores de rechazo), lo que permite auditar que el ajuste no ha degradado las capacidades base ni ha eliminado los filtros de seguridad. El modelo es estrictamente de texto y no soporta entradas multimodales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Gemma 4, segun el modelo base google/gemma-4-26b-a4b) |
| Parametros totales | 25.233.053.440 (aprox. 25,2 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (16 bits) en este repo; el autor publica otras variantes (p. ej. Q8-MLX) |
| Idiomas soportados | Multilingue, con enfasis en ingles (en), japones (ja) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (BF16) |
| Tamano del repo | 50,5 GB |
| Modelo base | google/gemma-4-26b-a4b |
| Libreria de inferencia | mlx |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Gemma 4 MoE del modelo base google/gemma-4-26b-a4b, con 30 capas de texto y 128 expertos en el router segun los datos de auditoria publicados en la model card. El fine-tuning se realizo con MLX mediante `mlx_lm.lora` y posteriormente se fusionaron los ajustes LoRA en el modelo base con una tecnica propia orientada a evitar la perdida de pesos. La adaptacion QLoRA se aplico con rango 4 y se concentro en las capas superiores de razonamiento (L12-L29), dejando completamente congeladas las capas inferiores de lenguaje (L00-L11) y la torre de vision (27 capas).

La model card documenta una verificacion estructural y de seguridad con dos comprobaciones matematicas: descomposicion en valores singulares (SVD) de la diferencia de pesos y analisis del vector de rechazo en el espacio de representacion interno. Los resultados indican un cambio del 0,163 % en la capa L=15 y un promedio del 0,128 % en las capas actualizadas, con un rango efectivo (stable rank) de 1,41 y una cuota del 72,5 % de energia en los cuatro primeros valores singulares, coherente con el diseno Rank=4. La similitud del vector de rechazo es de 0,9994 (1,99 grados) en L=15, y la similitud con abliteration es de 0,00032, lo que el autor interpreta como prueba de que no se ha realizado un uncensoring artificial. No se especifican en la informacion disponible el numero de tokens de entrenamiento ni la composicion detallada del dataset, mas alla de los dos conjuntos citados: deer-sec/deer_sec-japanese-cybersecurity-chatml-v2 y AlicanKiraz0/Cybersecurity-Dataset-Fenrir-v2.1.

## Capacidades

- Generacion de texto especializada en ciberseguridad: analisis de amenazas, modelado de amenazas, evaluacion de vulnerabilidades, interpretacion de logs y respuesta a incidentes.
- Razonamiento paso a paso ("thinking") con deducciones logicas mas profundas que el modelo base, a costa de mayor latencia.
- Capacidades multilingues con soporte declarado de ingles, japones y chino, ademas de la etiqueta multilingue.
- Fine-tuning conversacional sobre datasets en formato ChatML.
- Modelo estrictamente de texto: no soporta imagenes ni audio, aunque el modelo base tenga torre de vision (la torre permanece congelada y sin cambios).
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling ni uso como agente multi-paso.
- No se documenta en la informacion disponible un modo de vision o audio activo en esta variante.

## Casos de uso

- Analisis de logs de seguridad: el modelo puede interpretar registros de sistemas, firewalls y SIEM, correlacionar eventos y resumir indicios de compromiso, aprovechando su especializacion en interpretacion de logs descrita por el autor.
- Modelado de amenazas: sirve para generar matrices de amenazas, identificar superficies de ataque y proponer contramedidas en fases de diseno de sistemas, gracias a su entrenamiento en razonamiento teorico de seguridad.
- Evaluacion de vulnerabilidades: puede ayudar a priorizar hallazgos, explicar el impacto de CVE y proponer mitigaciones en informes tecnicos para equipos de seguridad.
- Respuesta a incidentes: como motor de consulta para analistas de SOC, permite redactar estrategias de contencion, erradicacion y recuperacion paso a paso con razonamiento encadenado.
- Formacion y concienciacion: generacion de escenarios de ataque simulados y explicaciones didacticas de tecnicas de ciberseguridad para programas de formacion interna.
- Asistencia a equipos de administracion de sistemas: consultas sobre hardening, configuracion segura y buenas practicas, con respuestas contextualizadas en ingles, japones o chino.
- Analisis de documentos tecnicos de seguridad: resumen y extraccion de conclusiones de informes, politicas y guias, con capacidad multilingue para documentacion en japones y chino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas internas de auditoria del fine-tuning (cambio de pesos, rango efectivo, similitud del vector de rechazo y tasa de respuesta defensiva del 100,0 % en L=15, con una mejora de +6,3 puntos en la tasa de respuesta a preguntas legitimas de defensa en la capa final, del 75,0 % al 81,3 %). No se proporcionan resultados de MMLU, HumanEval, GSM8K ni comparaciones numericas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 50,5 GB de pesos, por lo que se requiere memoria unificada o VRAM de al menos unos 52-56 GB para cargar el modelo completo con overhead.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU; en el ecosistema Apple, equipos con memoria unificada de 64 GB o superior (Mac Studio, MacBook Pro con chip Max/Ultra).
- No cabe en GPUs de consumo con 24 GB (RTX 4090) en BF16; seria necesario recurrir a variantes cuantizadas del autor (p. ej. Q8-MLX) o a cuantizaciones adicionales no documentadas en esta ficha.
- Opciones de despliegue: la libreria indicada es MLX, por lo que el despliegue natural es en Apple Silicon con el ecosistema MLX. No se documenta en la informacion disponible compatibilidad con vLLM, llama.cpp, Ollama o TGI para este repo concreto.
- Latencia y throughput: no disponibles. El autor advierte de un ligero aumento de la latencia ("thinking time") respecto al modelo base como contrapartida al razonamiento mas profundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| StagAI-CyberSecurity-26B-A4B-v2 | 25,2 B (MoE) | no disponible | Apache 2.0 | MLX BF16 | Especializado en ciberseguridad, solo texto |
| google/gemma-4-26b-a4b (base) | no disponible | no disponible | no disponible | no disponible | Modelo base generalista; el autor reporta mejoras de calidad y razonamiento sobre el |
| CyberStag-Security-26B-A4B-V1 | no disponible | no disponible | no disponible | no disponible | Version anterior del mismo autor; la v2 reporta mejor calidad de respuesta |
| StagAI-CyberSecurity-26B-A4B-v2-VLM | no disponible | no disponible | no disponible | no disponible | Variante multimodal del mismo autor con auditoria de seguridad publicada |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la informacion proporcionada, por lo que la comparacion cuantitativa de rendimiento no esta disponible.

## Limitaciones y advertencias

- Modelo estrictamente de texto: no admite entradas de imagen ni audio, pese a que el modelo base incluya torre de vision.
- Riesgo de alucinacion inherente a los LLM: en dominios de seguridad, una recomendacion incorrecta puede tener consecuencias graves, por lo que se requiere validacion humana.
- Sesgos potenciales derivados de los datasets de entrenamiento (deer_sec-japanese-cybersecurity-chatml-v2 y Cybersecurity-Dataset-Fenrir-v2.1), cuya composicion detallada no se documenta.
- Cobertura idiomatica declarada limitada a multilingue, en, ja y zh; el rendimiento en castellano no esta verificado ni documentado.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base google/gemma-4-26b-a4b puede tener sus propias condiciones que deben verificarse por separado.
- El formato MLX BF16 limita el despliegue a entornos Apple Silicon o a conversion previa; no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI en este repo.
- El aumento de latencia por el modo de razonamiento profundo puede ser inadecuado para aplicaciones en tiempo real.
- No se documenta soporte de tool calling ni de agentes multi-paso, lo que limita su integracion en pipelines automatizados complejos.
- La model card incluye afirmaciones de auditoria de seguridad realizadas por el propio autor; no se dispone de verificacion independiente en la informacion proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/deer-sec/StagAI-CyberSecurity-26B-A4B-v2-BF16-MLX
- Variante Q8-MLX mencionada en la model card: https://huggingface.co/deer-sec/StagAI-CyberSecurity-26B-A4B-v2-Q8-MLX
- Variante VLM con auditoria de seguridad: https://huggingface.co/deer-sec/StagAI-CyberSecurity-26B-A4B-v2-VLM-MLX-Q8
- Dataset deer-sec/deer_sec-japanese-cybersecurity-chatml-v2: https://huggingface.co/datasets/deer-sec/deer_sec-japanese-cybersecurity-chatml-v2
- Dataset AlicanKiraz0/Cybersecurity-Dataset-Fenrir-v2.1: https://huggingface.co/datasets/AlicanKiraz0/Cybersecurity-Dataset-Fenrir-v2.1
- Modelo base google/gemma-4-26b-a4b: https://huggingface.co/google/gemma-4-26b-a4b
- Imagen de portada del modelo: https://huggingface.co/deer-sec/StagAI-CyberSecurity-26B-A4B-v2-Q8-MLX/resolve/main/StagAI-CyberSecurity-26B-A4B-v2.jpeg
- Graficas de auditoria: https://huggingface.co/deer-sec/StagAI-CyberSecurity-26B-A4B-v2-VLM-MLX-Q8/resolve/main/audit_plots.png
