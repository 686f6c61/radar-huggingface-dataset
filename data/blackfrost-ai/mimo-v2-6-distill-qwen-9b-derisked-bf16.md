# Blackfrost-AI/MiMo-V2.6-Distill-Qwen-9B-Derisked-BF16

## Resumen

MiMo-V2.6-Distill-Qwen-9B-Derisked-BF16 es una derivada de investigacion publicada por Blackfrost-AI sobre el checkpoint `XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B`, desarrollado por el equipo Xiaomi MiMo. No se trata de un entrenamiento adicional ni de un adaptador: es un checkpoint completo y autónomo al que se le ha aplicado una modificacion direccional de pesos (DWM, *directional weight modification*) con el objetivo declarado de reducir fricciones de falso rechazo en flujos de trabajo agénticos y de investigacion en seguridad autorizada, intentando preservar las capacidades generales del modelo padre.

El modelo hereda la arquitectura Qwen3.5 del checkpoint base (9.409.813.744 parametros segun el indice de safetensors, unos 9,4B), con soporte multimodal de entrada imagen-texto, plantilla de chat MiMo y una longitud de contexto maxima configurada de 262.144 tokens. Los idiomas declarados son ingles y chino. La distribucion se realiza en BF16, en un repositorio de 18,8 GB, bajo licencia MIT.

Su relevancia es doble: por un lado, es un ejemplo poco habitual de intervencion de pesos publicada como artefacto de investigacion verificable (se documentan 60 matrices objetivo modificadas y 700 tensores no objetivo bit a bit identicos); por otro, sirve como banco de pruebas para estudiar el equilibrio entre utilidad, rechazo y capacidades de codigo, tool calling y ciberseguridad en un modelo de 9B desplegable en hardware relativamente modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basado en Qwen3.5 (tag `qwen3_5`); sin indicios de MoE |
| Parametros totales | 9.409.813.744 (~9,4B) |
| Parametros activos | No aplica / no disponible (no se declara arquitectura MoE en la informacion proporcionada) |
| Longitud de contexto | 262.144 tokens maximos configurados; el contexto util depende del motor de inferencia y la memoria disponible |
| Tipos de cuantizacion | Pesos nativos BF16 (760 tensores serializados en BF16). No se publican cuantizaciones de esta derivada en el repositorio; existe GGUF del modelo padre distribuido por ggml-org |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors (BF16), repositorio de 18,8 GB; libreria `transformers` |
| Modelo base | XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B (revision fijada `2367e865d009c13ac81713a2878291d33ab28177`) |
| Pipeline | image-text-to-text |
| Entrada multimodal | Si (torre de vision incluida; 333 tensores de vision excluidos de la edicion DWM) |
| Tool calling | Si, validado via parser `qwen3_coder` |
| Modo thinking | Si (`enable_thinking`), con parser de razonamiento `mimo` |

## Arquitectura y entrenamiento

La cadena de linaje es: `Qwen/Qwen3.5-9B` como base arquitectonica, despues `XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B` (un checkpoint agéntico de *supervised fine-tuning* publicado por Xiaomi MiMo, destilado desde modelos de razonamiento mayores hacia la base Qwen3.5-9B, orientado a codigo, tareas agénticas generales, codigo visual y ciberseguridad) y, finalmente, esta derivada de Blackfrost-AI. La familia MiMo-V2.6 se presento como una serie de modelos nativamente omnimodales, con una linea de trabajo centrada en escalar computo de RL sobre tareas verificables; el `bibtex` del repositorio apunta a esa linea de investigacion.

La intervencion de Blackfrost-AI no es entrenamiento por gradiente, aunque Hugging Face la clasifique bajo la relacion `finetune`. Se aplico DWM sobre dos direcciones residuales emparejadas (capturadas con thinking desactivado y activado, 250 prompts emparejados por modo), con alpha 1,0 en una sola pasada, sobre las capas decodificadoras 2 a 31. Los objetivos de escritura residual fueron unicamente las salidas de atencion y las matrices de *down-projection* del MLP, con una edicion FP32 de rango 2, una restauracion de norma de Frobenius y un redondeo final a BF16. Quedaron excluidos pesos de vision, embeddings, normas, proyecciones de entrada y las proyecciones gate/up del MLP. El resultado: 60 matrices objetivo modificadas y 700 tensores no objetivo bit a bit identicos.

Nota tecnica relevante: la configuracion conserva `mtp_num_hidden_layers: 1`, pero el indice del checkpoint heredado no contiene tensores MTP/draft serializados de forma independiente, por lo que no debe asumirse soporte de decodificacion especulativa sin validarlo en el runtime propio.

## Capacidades

- Generacion de texto conversacional con ventana de contexto configurada de hasta 262.144 tokens.
- Razonamiento en modo *thinking* explicito, activable o desactivable mediante `chat_template_kwargs`.
- Capacidades agénticas y de razonamiento multi-paso heredadas del checkpoint SFT de Xiaomi.
- *Tool calling* / *function calling* estructurado, validado en cuatro modalidades: no streaming, streaming, con thinking activado y con ida y vuelta de resultados de herramienta.
- Generacion de codigo, con orientacion especifica a tareas de programacion y codigo visual segun el linaje del modelo padre.
- Capacidades de ciberseguridad como dominio objetivo de la destilacion original, con la reduccion de falso rechazo como objetivo experimental de esta derivada.
- Entrada multimodal imagen-texto: el *processor* y los archivos de vision estan incluidos y la torre de vision no fue modificada por la edicion DWM.
- Soporte multilingue limitado a ingles y chino.
- Compatibilidad con endpoints OpenAI a traves de SGLang con los parsers `mimo` (razonamiento) y `qwen3_coder` (tool calls).

## Casos de uso

- Atencion al cliente automatizada: con 262.144 tokens de contexto configurado, el modelo puede mantener conversaciones multi-turno con historiales largos y documentacion adjunta sin truncar agresivamente, y el *tool calling* estructurado permite conectar el dialogo a sistemas internos de tickets o CRM.
- Generacion de codigo en produccion: la validacion de tool calls en streaming y no streaming permite integrarlo en asistentes de IDE o pipelines de CI/CD que invocan herramientas externas (linters, ejecutores de tests, APIs de repositorio) en varios pasos.
- Agentes autonomos de navegacion y extraccion: el soporte de razonamiento multi-paso con thinking explicitamente activado es adecuado para tareas que requieren planificar, invocar herramientas y verificar resultados antes de responder.
- Analisis de capturas y diagramas tecnicos: al aceptar entrada imagen-texto, puede procesar pantallazos de interfaces, diagramas de arquitectura o capturas de trazas de error y razonar sobre ellos en ingles o chino.
- Investigacion en seguridad autorizada: el objetivo declarado de reduccion de falso rechazo esta pensado para equipos que analizan codigo malicioso, redactan informes de vulnerabilidades o desarrollan pruebas de concepto en entornos con autorizacion explicita.
- Evaluacion de tecnicas de edicion de pesos: al documentar con precision los tensores modificados y los intactos, el checkpoint es util como caso de estudio reproducible sobre DWM, preservacion de capacidades y deriva de comportamiento.
- Prototipado local en hardware de una sola GPU: con 9,4B de parametros, sirve como modelo de referencia para experimentar con destilacion, SFT y comportamiento agéntico sin acceso a clusters.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta derivada. La propia model card indica explicitamente que el checkpoint no ha sido re-evaluado de forma independiente en comportamiento de rechazo, codigo, ciberseguridad, calidad en contexto largo ni calidad multimodal, y advierte de que los resultados publicados por Xiaomi para el checkpoint padre no deben interpretarse como mediciones de esta derivada.

## Requisitos de hardware

- Pesos en BF16: aproximadamente 18,8 GB de ficheros de pesos, con necesidad de margen adicional en VRAM para el cache KV y el *runtime*.
- Cache KV: no disponible el desglose de cabezas y capas necesario para una estimacion exacta; con 262.144 tokens de contexto el consumo de cache puede ser muy elevado y exige planificacion explicita de memoria.
- GPU de centro de datos: A100 40/80 GB, H100 80 GB y similares son opciones comodas para BF16 con contexto largo.
- GPU de consumo: con cuantizacion a 4 bits la huella se situa en el entorno de los 6-7 GB, lo que permite RTX 3060 12 GB, RTX 4070/4080 y RTX 4090 24 GB; en BF16 completo, una RTX 4090 de 24 GB queda al limite y probablemente obliga a limitar contexto o descargar capas. La documentacion del GGUF del modelo padre, distribuido por ggml-org, cita un requisito de 12 GB+ de VRAM.
- Motores de despliegue: SGLang con soporte Qwen3.5 es la ruta validada por el autor (con `--reasoning-parser mimo` y `--tool-call-parser qwen3_coder`). Para cuantizaciones GGUF del modelo padre, llama.cpp y sus derivados son las rutas habituales. El soporte en vLLM, TGI u Ollama para esta derivada concreta no esta confirmado en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiMo-V2.6-Distill-Qwen-9B-Derisked-BF16 (esta ficha) | 9,4B | 262.144 tokens configurados | Si (image-text-to-text) | MIT | safetensors BF16 en Hugging Face |
| XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B (padre) | 9,4B | 262.144 tokens segun la card de la derivada | Si | MIT | safetensors; GGUF de ggml-org |
| Qwen/Qwen3.5-9B (base arquitectonica) | ~9B | No disponible en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada | Hugging Face |
| MiMo-V2.6-Flash / Pro (familia completa) | No disponible | No disponible | Si, omnimodal | No disponible | Hugging Face y sitio de Xiaomi |

La comparacion de rendimiento entre estas opciones no esta disponible: no hay benchmarks publicados para la derivada y la model card desaconseja trasladar los numeros del padre.

## Limitaciones y advertencias

- La reduccion de falso rechazo es un objetivo experimental, no una garantia de seguridad ni de capacidad; el propio autor lo declara asi.
- El checkpoint no ha sido re-evaluado de forma independiente en rechazo, codigo, ciberseguridad, contexto largo ni multimodalidad. No hay evidencia publicada de cuanto se ha degradado o mejorado el modelo respecto al padre.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplican los riesgos habituales de los modelos destilados de 9B.
- Cobertura idiomatica limitada a ingles y chino; el rendimiento en castellano no esta documentado.
- La decodificacion especulativa no debe asumirse: aunque la configuracion incluye `mtp_num_hidden_layers: 1`, el indice heredado no contiene tensores MTP/draft serializados.
- La edicion DWM toca solo 60 matrices y deja intactos embeddings, normas y proyecciones gate/up; los efectos de esa asimetria sobre el comportamiento no estan medidos.
- El comportamiento multimodal no ha sido re-evaluado, pese a que la torre de vision permanece identica al padre.
- Se recomienda usar SGLang con los parsers `mimo` y `qwen3_coder` para reproducir el comportamiento validado de razonamiento y tool calling; otros motores pueden no respetar la plantilla y los parsers esperados.
- Licencia MIT heredada del padre, lo que en principio permite uso comercial, pero la responsabilidad sobre control de acceso, validacion y legalidad del despliegue recae en el operador. Conviene revisar los terminos del repositorio padre para cualquier detalle de atribucion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Blackfrost-AI/MiMo-V2.6-Distill-Qwen-9B-Derisked-BF16
- Modelo padre: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Revision fijada del padre: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B/tree/2367e865d009c13ac81713a2878291d33ab28177
- Base arquitectonica: https://huggingface.co/Qwen/Qwen3.5-9B
- Pagina oficial de la familia MiMo-V2.6: https://mimo.xiaomi.com/mimo-v2-6
- Repositorio MiMo-V2.6-Pro-RL (referencia del bibtex): https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Pro-RL
- Derivada MXFP4 de Blackfrost-AI sobre MiMo-V2.6-Flash-RL: https://huggingface.co/Blackfrost-AI/MIMO-V2.6-DERISKED-MXFP4
- Analisis del GGUF del modelo padre: https://localmodelwatch.tsuchitsuchi.com/en/2026/09/22/mimo-v2-6-distill-qwen-9b-gguf/
- Ficha de especificaciones y requisitos de VRAM: https://apxml.com/models/mimo-v2-6-distill-qwen-9b
