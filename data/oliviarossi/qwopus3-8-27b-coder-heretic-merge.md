# OliviaRossi/Qwopus3.8-27B-Coder-Heretic-Merge

## Resumen

Qwopus3.8-27B-Coder-Heretic-Merge es un modelo de lenguaje multimodal de 27.356 millones de parametros publicado por OliviaRossi en Hugging Face el 18 de noviembre de 2026. Se trata de un merge de pesos (no de un entrenamiento desde cero) que combina tres modelos: Qwen/Qwen3.8-27B como base ancla, DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored como componente sin censura y Jackrong/Qwopus3.8-27B-Coder-Flash como especialista en codigo y tool calling. El pipeline declarado es image-text-to-text, lo que indica que conserva la torre de vision del modelo base Qwen.

El modelo aborda un problema concreto: obtener un unico checkpoint que mantenga las capacidades de generacion de codigo y function calling de un especialista, incorpore el sesgo de baja censura del componente heretic y preserve la torre multimodal del modelo original. Para ello el autor aplica una mezcla por componentes con tecnicas DELLA-TIES y NuSLERP sobre subconjuntos de tensores diferenciados (QKV, proyecciones residuales, embeddings, torre de vision y recurrencia DeltaNet).

La relevancia es limitada pero tecnica: es un ejemplo de merge quirurgico por capas con sesgo explicito hacia un componente (CODER_BIAS=0.72), eliminacion de las cabezas MTP/DFlash y publicacion bajo licencia Apache 2.0. No hay datos de benchmarks, idiomas ni evaluacion publicada en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con atencion lineal DeltaNet (derivada de Qwen3.8); merge por componentes, sin MTP ni DFlash |
| Parametros totales | 27.356.728.560 (27,36 B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16/safetensors; no se documentan GGUF ni AWQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |
| Tamano del repositorio | 54,7 GB |
| Pipeline | image-text-to-text |
| Fecha de publicacion | 2026-11-18 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo no se entrena: es un merge de tres checkpoints. La receta declarada en la model card es la siguiente. Para QKV, in_proj y las puertas y proyecciones up del MLP se aplica DELLA-TIES con densidad 0,78 y epsilon 0,14, ponderado hacia el modelo coder y con una curva de campana de razonamiento en las capas intermedias. Para los escritores residuales (o_proj, linear_attn.out_proj y mlp.down_proj) se usa task-vector NuSLERP, con el objetivo de preservar los subespacios direccionales de eliminacion de rechazo sin artefactos de poda dispersa. Embeddings, LM head, torre de vision, normas y los parametros de recurrencia DeltaNet (A_log, dt_bias, conv1d) se fusionan con NuSLERP o interpolacion lineal sin poda, con peso fuerte hacia Jackrong/Qwopus3.8-27B-Coder-Flash.

El sesgo global hacia el componente coder se fija en CODER_BIAS=0.72. Las cabezas MTP y DFlash se eliminan por completo y mtp_num_hidden_layers se establece a 0 en config.json, lo que desactiva la decodificacion especulativa multi-token del modelo original. La arquitectura hereda el caracter hibrido de Qwen3.8: atencion lineal DeltaNet con estado recurrente combinada con atencion clasica, mas una torre de vision para entrada image-text-to-text. No se documentan datos de entrenamiento, numero de tokens, composicion del dataset ni fases de RLHF/DPO, porque el proceso es exclusivamente de fusion de pesos.

## Capacidades

- Generacion de texto conversacional multi-turno en formato chat.
- Generacion y edicion de codigo, con sesgo explicito hacia el componente coder (CODER_BIAS=0.72).
- Tool calling y function calling, heredados del especialista Jackrong/Qwopus3.8-27B-Coder-Flash.
- Entrada multimodal image-text-to-text: la torre de vision se conserva y se fusiona sin poda.
- Razonamiento de multiples pasos, con una curva de campana declarada en capas intermedias orientada a razonamiento.
- Modo sin censura (heretic): el componente DavidAU reduce los rechazos del modelo base.
- Capacidades multilingues: no documentadas en la informacion disponible.
- Sin decodificacion especulativa MTP: las cabezas mtp.* y dflash* se han eliminado.

## Casos de uso

- Asistencia de programacion en IDE: el modelo puede completar y refactorizar codigo en un flujo conversacional, aprovechando el sesgo hacia el componente coder y el soporte de tool calling para invocar linters o ejecutar tests.
- Agentes de automatizacion con function calling: al conservar las capacidades del especialista Qwopus Coder Flash, puede encadenar llamadas a herramientas en pipelines de CI/CD o de gestion de incidencias.
- Analisis de capturas y diagramas tecnicos: la torre de vision permite enviar imagenes de errores, diagramas de arquitectura o interfaces y pedir explicaciones o codigo asociado.
- Generacion de codigo sin filtros de rechazo: el componente heretic reduce las negativas a peticiones tecnicas legitimas que otros modelos alineados rechazan por precaucion excesiva, util en entornos de investigacion controlados.
- Prototipado de asistentes conversacionales de dominio tecnico: su formato chat y su contexto (no documentado) permiten construir bots de soporte a desarrolladores.
- Experimentacion en investigacion sobre merges: sirve como caso de estudio reproducible de DELLA-TIES y NuSLERP por componentes, con la receta publicada en la model card.
- Evaluacion comparativa de alineacion: util para medir el efecto de la eliminacion de rechazos sobre calidad y seguridad en un checkpoint de 27 B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 54,7 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica requiere 64-80 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 28-30 GB, aunque el autor no publica versiones cuantizadas.
- VRAM estimada en cuantizacion de 4 bits: en torno a 15-18 GB, condicionada a que se generen GGUF o AWQ a partir de los safetensors (no disponibles en el repositorio).
- GPU recomendadas: A100 80 GB o H100 80 GB para BF16 sin cuantizar; A100 40 GB o L40S 48 GB solo con cuantizacion; RTX 4090 24 GB viable unicamente con cuantizacion de 4 bits.
- Cabe en GPU de consumo: si, en RTX 4090 o RTX 3090 con cuantizacion de 4 bits, siempre que se produzcan los pesos cuantizados.
- Opciones de despliegue: vLLM o TGI para safetensors BF16 en servidor; llama.cpp u Ollama tras conversion a GGUF. La eliminacion de MTP implica renunciar a la decodificacion especulativa nativa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Multimodal | Notas |
|---|---|---|---|---|---|
| Qwopus3.8-27B-Coder-Heretic-Merge | 27,36 B | no disponible | Apache 2.0 | Si (image-text-to-text) | Merge de 3 checkpoints, sin benchmarks publicados |
| Qwen/Qwen3.8-27B (base) | 27 B aprox. | no disponible | Apache 2.0 (segun modelo base) | Si | Modelo original, con MTP y alineacion estandar |
| DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored | 27 B aprox. | no disponible | no disponible | Si | Componente sin censura del merge |
| Jackrong/Qwopus3.8-27B-Coder-Flash | 27 B aprox. | no disponible | no disponible | no disponible | Especialista en codigo y tool calling |

No se dispone de datos de rendimiento comparado para ninguno de los cuatro checkpoints en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay MMLU, HumanEval ni GSM8K publicados, por lo que el rendimiento real es desconocido.
- El proceso de merge no garantiza que se conserven simultaneamente las capacidades de los tres modelos; pueden aparecer degradaciones o interferencias entre subespacios.
- El componente heretic elimina rechazos de forma deliberada: aumenta el riesgo de generar contenido danino, sesgado o inexacto sin advertencia, y complica el cumplimiento de politicas de uso en produccion.
- Riesgo elevado de alucinacion, agravado por la ausencia de evaluacion y por la mezcla de pesos sin validacion publicada.
- Idiomas soportados no documentados; no se puede garantizar calidad en castellano.
- Longitud de contexto no disponible, lo que impide planificar cargas de trabajo con documentos largos.
- Sin pesos cuantizados publicados: el despliegue en GPU de consumo exige conversion manual a GGUF o AWQ.
- Eliminacion de MTP y DFlash: se pierde la decodificacion especulativa del modelo base, con impacto negativo en throughput.
- Repositorio sin descargas ni likes y con un unico autor: no hay validacion de la comunidad ni soporte.
- Aunque la licencia declarada es Apache 2.0, conviene verificar la compatibilidad de licencias de los tres modelos base antes de uso comercial.
- El pipeline image-text-to-text hereda la torre de vision, pero no se documenta su calidad tras la fusion.

## Enlaces

- Hugging Face: https://huggingface.co/OliviaRossi/Qwopus3.8-27B-Coder-Heretic-Merge
- Modelo base ancla: https://huggingface.co/Qwen/Qwen3.8-27B
- Componente sin censura: https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored
- Componente coder: https://huggingface.co/Jackrong/Qwopus3.8-27B-Coder-Flash
