# Meta-muse/Muse-Glimmer-30B-uncensored

## Resumen

Muse-Glimmer-30B-uncensored es una variante modificada del modelo multimodal denso meta-models/Muse-Glimmer-30B, publicada por el usuario Meta-muse en HuggingFace. Se trata de un ajuste de tipo "abliteration": no se ha reentrenado el modelo, sino que se ha eliminado quirurgicamente la direccion de rechazo de las matrices de escritura residual del decodificador de texto, de modo que el modelo deja de emitir negativas ante peticiones que el modelo base rechazaba. El pipeline declarado es image-text-to-text, por lo que conserva la torre de vision del original intacta.

El modelo tiene 29.776.626.688 parametros reales (segun los safetensors del repositorio) y un peso en disco de 59,6 GB, coherente con pesos en bfloat16. La arquitectura es densa, no MoE: 52 capas de decodificador de texto con hidden de 6656, mas una torre de vision ViT-G/14 de 1.9B parametros que no ha sido modificada. Solo se editaron 104 tensores (los `o_proj` y `down_proj` de las 52 capas); los 1332 tensores restantes del camino de texto y los 800 tensores de vision se copian sin cambios.

Su relevancia es doble. Por un lado, es un ejemplo documentado de la tecnica de abliteracion con preservacion de norma y biproyeccion por columnas, con validacion cuantitativa del grado de eliminacion de la direccion de rechazo. Por otro, es un caso de estudio sobre el impacto colateral de estas tecnicas: el model card reporta que, junto con la caida de rechazos del 85,3 % al 2,0 %, se degrada parte del comportamiento de seguridad agentica (una sonda de confirmacion de acciones irreversibles pasa de respetarse a ejecutarse directamente). La licencia declarada es Apache 2.0 y el unico idioma soportado declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (decodificador de texto + torre de vision ViT-G/14); no MoE |
| Parametros totales | 29.776.626.688 (29,8B) segun safetensors; torre de vision de 1,9B incluida |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; existe un repositorio GGUF derivado (TrevorJS/Muse-Glimmer-30B-uncensored-GGUF) generado con llama.cpp |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers); existe conversion GGUF en repositorio aparte |
| Capas del decodificador de texto | 52 |
| Hidden size | 6656 |
| Torres de vision | 1 torre ViT-G/14 de 1,9B parametros (sin modificar) |
| Tensores editados | 104 (52 `o_proj` + 52 `down_proj`) |
| Tensores copiados sin cambios | 1332 (+ 800 tensores de vision) |
| Tamano del repositorio | 59,6 GB |
| Modelo base | meta-models/Muse-Glimmer-30B |
| Requisitos de libreria | transformers >= 5.15.0 (la arquitectura `muse_glimmer` no existe en 5.12.0) |
| Requisitos para GGUF | llama.cpp build b10353 o posterior (PR #26841, commit 62bf73d) |

## Arquitectura y entrenamiento

El modelo no ha sido entrenado desde cero: es un derivado del checkpoint meta-models/Muse-Glimmer-30B. La unica intervencion es una edicion de pesos mediante abliteracion biproyectada con preservacion de norma (metodo descrito por grimjim en noviembre de 2025). El procedimiento captura activaciones residuales en el ultimo token del prompt para 400 prompts daninos y 400 inofensivos, winsoriza las activaciones en el percentil 99,5, calcula una direccion de rechazo por capa como `normalize(mean(harmful) - mean(harmless))`, la ortogonaliza frente a la media de los inofensivos con Gram-Schmidt de doble pasada, y aplica una modificacion de pesos que proyecta fuera esa direccion en cada matriz de escritura residual, reescalando cada columna a su norma original (`||W_new||_col = ||W_orig||_col`). Se editaron las 52 capas (escala 1.0, winsorizacion 0.995). Un `up_proj` no tocado es byte a byte identico al base.

Dos particularidades de la arquitectura condicionan la aplicacion del metodo. La primera es que cada capa tiene dos tensores `gate_proj` (uno de atencion y otro de MLP, 104 en total) y ninguno de ellos es una matriz de escritura residual, por lo que los objetivos se emparejan por ruta completa. La segunda es que los logits se suavizan con un softcap `20·tanh(x·0.196/20)`, lo que hace que la divergencia KL no sea comparable con la de la familia Gemma 4. El modelo emite ademas salida canalizada: primero un razonamiento `to=self` y despues la respuesta `to=user`, por lo que la evaluacion debe leer el canal final. La validacion reportada incluye una puerta de selectividad sobre activaciones reservadas (selectividad media 7,49, 0 de 52 capas antisselectivas) y una verificacion posterior a la edicion que situa la eliminacion de la direccion entre el 98,6 % y el 99,6 % en los tensores objetivo (residuo `‖rᵀW‖` de 3,7e-03 a 1,4e-02, limitado por el redondeo float64 a bf16).

En cuanto a los datos de entrenamiento originales del modelo base (numero de tokens, composicion del dataset, uso de RLHF o DPO), no se dispone de esa informacion en el material proporcionado.

## Capacidades

- Generacion de texto conversacional en ingles, con plantilla de chat aplicable mediante `apply_chat_template`.
- Razonamiento canalizado: el modelo separa una fase de deliberacion interna (`to=self`) de la respuesta final al usuario (`to=user`).
- Entrada multimodal de imagen y texto (`image-text-to-text`), gracias a la torre ViT-G/14 de 1,9B parametros que se conserva intacta.
- Uso de herramientas y comportamiento agentico en el modelo base, segun el model card: cubre limites de uso de herramientas, resistencia a inyeccion de prompts y gestion de permisos. Las mediciones sobre el conjunto de 30 sondas dan 8/30 aciertos tras la abliteracion, frente a 7/30 antes.
- Control de rechazos practicamente eliminado: 3 de 150 prompts daninos siguen siendo rechazados (2,0 %), frente a 128 de 150 (85,3 %) en el base.
- Sin sobrerrechazo medido: 0 de 75 prompts inofensivos rechazados (1,4 % en el base) y 0 respuestas evasivas o deflectivas (12 en el base).
- Capacidades multilingues: no disponibles; el modelo declara unicamente ingles.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite comparar el comportamiento del checkpoint base y su version abliterada sobre el mismo conjunto de prompts, con la metrica de rechazos y la tasa de respuestas degeneradas ya tabuladas, para estudiar que componentes del comportamiento de seguridad son separables de la utilidad general.
- Estudio de robustez de agentes: al ejecutarse sobre el conjunto de 30 sondas agenticas, sirve para analizar como la eliminacion de la direccion de rechazo afecta a la confirmacion de acciones irreversibles, el cumplimiento de alcance y la resistencia a inyeccion de prompts, sin necesidad de disenar un banco de pruebas propio desde cero.
- Generacion de codigo y tareas tecnicas en ingles: el modelo conserva el camino de texto completo con 52 capas y puede usarse para completar y explicar codigo, con la advertencia de que no hay resultados publicados de HumanEval ni de benchmarks similares en la informacion disponible.
- Procesamiento de documentos con componente visual: al aceptar entrada image-text-to-text, puede emplearse para tareas de descripcion de imagenes, lectura de capturas o extraccion de informacion a partir de material grafico, siempre que la tarea se formule en ingles.
- Analisis de contenido sensible con fines de moderacion o auditoria: su baja tasa de rechazo permite obtener respuestas que el modelo base bloquearia, lo que resulta util para construir clasificadores de contenido danino o para auditar politicas de seguridad, asumiendo los riesgos descritos mas abajo.
- Experimentacion con decodificacion y cuantizacion: al existir una conversion GGUF en llama.cpp, sirve como banco de pruebas para medir el efecto de la cuantizacion sobre un modelo que ha sufrido una edicion de pesos delicada, comparando la salida con los pesos en bfloat16.
- Evaluacion comparativa de tecnicas de abliteracion: el repositorio de reproduccion incluye los scripts de captura, derivacion de direccion y edicion, por lo que el modelo sirve como referencia reproducible para quien quiera aplicar el mismo metodo a otros checkpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks clasicos (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos cuantitativos publicados corresponden a las metricas de rechazo y de comportamiento agentico del propio proceso de abliteracion:

| Metrica | Antes (base) | Despues (abliterado) |
|---|---|---|
| Rechazos (harmful_tune, 150 prompts) | 128/150 (85,3 %) | 3/150 (2,0 %) |
| Sobrerrechazo (harmless, 75 prompts) | 1/75 (1,4 %) | 0/75 (0,0 %) |
| Respuestas evasivas (deflections) | 12 | 0 |
| Salida degenerada o rota | 0 | 0 |
| Resistencia a inyeccion de prompts (12 sondas) | 0/12 | 0/12 |
| Cumplimiento de alcance (8 sondas) | 0/8 | 0/8 |
| Confirmacion de acciones irreversibles (10 sondas) | 7/10 | 8/10 |
| Total agentico (30 sondas) | 7/30 | 8/30 |

Notas sobre la medicion: de los 128 rechazos basales, 83 pasaron a cumplimiento confirmado y ninguno se degradó; 42 quedaron sin resolver porque las respuestas de cumplimiento son unas cuatro veces mas largas que las de rechazo (mediana de 354 a 1340 tokens) y alcanzan el limite de 1536 tokens antes de terminar. La sonda que cambia respecto al base es una peticion de borrado de registros: el modelo base detecta que la herramienta no permite filtrar por antiguedad y pregunta antes de actuar, mientras que la version abliterada llama directamente a `delete_files`.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 60 GB solo para pesos (el repositorio ocupa 59,6 GB), mas cache KV y overhead del runtime; en la practica requiere GPUs de 80 GB.
- VRAM estimada con cuantizacion de 8 bits: aproximadamente 30 GB de pesos, viable en una A100 40 GB o en dos GPU consumer de 24 GB.
- VRAM estimada con cuantizacion de 4 bits: aproximadamente 15-18 GB de pesos, lo que permitiria ejecutarlo en una unica RTX 4090, RTX 3090 o similar de 24 GB, aunque el model card no publica mediciones de calidad para esas cuantizaciones.
- GPU recomendadas: A100 80 GB o H100 80 GB para bfloat16; A100 40 GB, L40S o configuraciones multi-GPU para 8 bits; RTX 4090/3090 para 4 bits.
- Cabe en GPU consumer: si, unicamente con cuantizacion agresiva (4 bits) y siempre que se disponga de la version GGUF; en bfloat16 no cabe en ninguna GPU consumer actual.
- Opciones de despliegue: transformers >= 5.15.0 con la clase `MuseGlimmerForConditionalGeneration` (unica via documentada para bfloat16), y llama.cpp build b10353 o posterior para los pesos GGUF. El soporte en vLLM, TGI u Ollama no esta documentado en la informacion disponible.
- Latencia y throughput estimados: no disponibles. Los unicos tiempos indirectos que menciona el model card son longitudes de salida (mediana de 354 tokens para rechazos y 1340 tokens para cumplimientos) y un limite practico de generacion de 1536 tokens nuevos.

## Comparativa con modelos similares

La informacion proporcionada no incluye resultados comparativos frente a otros modelos de la misma categoria, y la busqueda web realizada no aporta datos tecnicos utiles. La comparacion posible se limita a las variantes dentro de la misma familia:

| Modelo | Parametros | Modalidad | Licencia | Estado |
|---|---|---|---|---|
| meta-models/Muse-Glimmer-30B (base) | 29,8B | image-text-to-text | no disponible en la informacion | Checkpoint original, con comportamiento de rechazo intacto (85,3 % de rechazos en harmful_tune) |
| Meta-muse/Muse-Glimmer-30B-uncensored | 29,8B | image-text-to-text | apache-2.0 | Version abliterada, 2,0 % de rechazos |
| TrevorJS/Muse-Glimmer-30B-uncensored | no disponible | image-text-to-text | no disponible | Repositorio referenciado en el codigo de ejemplo del propio model card; la relacion exacta con el repositorio de Meta-muse no esta documentada |
| TrevorJS/Muse-Glimmer-30B-uncensored-GGUF | no disponible | image-text-to-text | no disponible | Conversion GGUF del modelo abliterado |

Comparativa con modelos de otros desarrolladores (mismo tamano o misma tarea): no disponible.

## Limitaciones y advertencias

- Riesgo de uso indebido: el modelo ha sido modificado especificamente para eliminar el comportamiento de rechazo. La tasa de rechazo ante prompts daninos cae al 2,0 %, por lo que no debe desplegarse en aplicaciones de cara al publico sin filtros externos.
- Degradacion de seguridad agentica: la unica sonda que cambia respecto al base es precisamente la de confirmacion de acciones irreversibles, donde el modelo abliterado ejecuta `delete_files` sin preguntar cuando la herramienta no permite filtrar por antiguedad. Cualquier integracion con herramientas con efectos reales (borrado, envio, pagos) requiere confirmacion humana obligatoria fuera del modelo.
- Resistencia a inyeccion de prompts y cumplimiento de alcance: las cifras publicadas son 0/12 y 0/8 tanto antes como despues, es decir, el modelo base tampoco superaba esas sondas. No debe asumirse que estas capacidades estan presentes.
- Riesgo de alucinacion: no se han publicado mediciones de veracidad, factualidad ni tasas de alucinacion en la informacion disponible.
- Cobertura de evaluacion limitada: los resultados se basan en 150 prompts daninos, 75 inofensivos y 30 sondas agenticas, con 42 de los 128 rechazos basales sin resolver por alcanzar el limite de 1536 tokens. La mejora medida en la sonda de acciones irreversibles (7/10 a 8/10) se apoya en un unico caso.
- Limitacion de idioma: solo se declara ingles. No hay datos sobre comportamiento en castellano u otras lenguas.
- Longitud de contexto: no disponible. No se puede asumir una ventana concreta para tareas de contexto largo.
- Requisitos de version estrictos: la arquitectura `muse_glimmer` exige transformers >= 5.15.0, y la conversion o cuantizacion GGUF requiere llama.cpp b10353 o posterior. Versiones anteriores fallaran al cargar el modelo.
- Calidad de las cuantizaciones: no hay evaluacion publicada del efecto de la cuantizacion sobre un modelo al que se le han eliminado direcciones de pesos, un escenario donde los errores de redondeo pueden afectar de forma no trivial.
- Licencia: Apache 2.0 permite uso comercial, pero el publicador de esta ficha no ofrece garantias y la responsabilidad sobre el uso de un modelo sin rechazos recae en el desplegador.
- Ambiguedad de autoria: el identificador del repositorio es Meta-muse/Muse-Glimmer-30B-uncensored, mientras que el codigo de ejemplo y los repositorios de reproduccion del model card apuntan a TrevorJS y github.com/TrevorS. Conviene verificar el origen real de los pesos antes de usarlos en produccion.
- Datos de adopcion: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Meta-muse/Muse-Glimmer-30B-uncensored
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Repositorio GGUF citado: https://huggingface.co/TrevorJS/Muse-Glimmer-30B-uncensored-GGUF
- Repositorio de reproduccion de la abliteracion: https://github.com/TrevorS/muse-glimmer-abliteration
- Trabajo previo del mismo programa (abliteracion de gemma-4): https://github.com/TrevorS/gemma-4-abliteration
- Metodo de abliteracion biproyectada con preservacion de norma: https://huggingface.co/blog/grimjim/norm-preserving-biprojected-abliteration
- Soporte de la arquitectura en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/26841
