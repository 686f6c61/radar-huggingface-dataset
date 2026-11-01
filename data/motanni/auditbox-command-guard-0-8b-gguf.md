# Motanni/auditbox-command-guard-0.8b-gguf

## Resumen

AuditBox Command Guard 0.8B es un modelo de lenguaje de dominio especifico afinado a partir de Qwen/Qwen3.5-0.8B, orientado al analisis de riesgo de comandos de Linux. Lo desarrolla Motanni como parte del proyecto AuditBox y su funcion es generar, a partir de un comando, el directorio de trabajo, el shell y el contexto de operaciones recientes, una explicacion de los efectos potenciales, las razones del riesgo y recomendaciones de verificacion. En AuditBox se emplea como revisor auxiliar de terminal, de modo que el operador y el registro de auditoria reciben un analisis textual antes de ejecutar una accion.

El modelo base es un transformer `qwen35` de 24 capas y dimension oculta 1024, con 752.393.024 parametros de texto. Se distribuye unicamente como artefacto GGUF v3 cuantizado en Q8_0 (811.843.008 bytes), lo que lo hace apto para inferencia local en CPU o GPU modesta mediante llama.cpp con soporte para la arquitectura `qwen35`. El GGUF declara una longitud de contexto de 262.144 tokens, aunque el ejemplo de despliegue del autor usa 10.240.

Su relevancia es acotada pero clara: cubre un nicho concreto (analisis de riesgo de comandos en entornos Linux) con un modelo pequeno, ejecutable en local y con una licencia copyleft fuerte (GPL-3.0-only). No es un modelo de proposito general ni compite en benchmarks abiertos; es una pieza de un pipeline de auditoria donde la decision final debe combinar reglas deterministas, salida real del dispositivo y revision humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer `qwen35`, 24 capas, dimension oculta 1024 |
| Parametros totales | 752.393.024 (parametros de tensores de texto) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens declarados en el GGUF; el ejemplo de despliegue usa 10.240 |
| Tipos de cuantizacion | Q8_0 (unico artefacto publicado) |
| Idiomas soportados | Chino (zh) e ingles (en) |
| Licencia | GPL-3.0-only (pesos del finetune); el modelo base conserva Apache 2.0 |
| Formato de pesos | GGUF v3 (`command-guard-q8_0.gguf`) |
| Tamano del repositorio | 0.8 GB |
| Finetune | LoRA (`general.finetune=lora`), pesos fusionados en el GGUF |
| SHA-256 del artefacto | `7497a4aece77fd790fb1b035260daf926d39196fdfac46b4771dcfe955d6954d` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen/Qwen3.5-0.8B: un transformer `qwen35` de 24 capas con dimension oculta 1024 y 752 millones de parametros. Sobre esa base se aplico un ajuste fino mediante LoRA, segun declara el campo `general.finetune=lora` del GGUF; el artefacto publicado contiene los pesos ya fusionados y cuantizados a Q8_0. No se trata de un modelo MoE ni de una arquitectura hibrida SSM.

La informacion de entrenamiento es incompleta. La model card reconoce explicitamente que no estan archivados la revision fija del modelo base, la version del conjunto de datos de entrenamiento, el rank y alpha del LoRA, la tasa de aprendizaje, el numero de epocas, el hardware de entrenamiento ni la version de las herramientas de conversion. Tampoco se documenta la composicion del dataset, el volumen de tokens, ni si hubo RLHF o DPO. El autor senala ademas que la procedencia y los permisos de uso de los datos de entrenamiento y de las salidas del modelo profesor deben completarse junto con el registro de entrenamiento. No se describe ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, modo thinking entrenado, etc.); de hecho, el ejemplo de despliegue desactiva el razonamiento (`--reasoning off`, `enable_thinking: false`).

## Capacidades

- Generacion de texto en chino e ingles orientada al analisis de comandos de Linux.
- Analisis de riesgo de comandos: explica efectos potenciales, motivos del riesgo y recomendaciones de verificacion.
- Razonamiento sobre contexto operativo: directorio de trabajo, shell, variables, alias e historial de operaciones recientes.
- Analisis de operaciones encadenadas o continuas, con foco en operaciones de ficheros, cambios de servicios, permisos y configuracion de red.
- Generacion de texto de apoyo para aprobacion humana, revision posterior y auditoria de operaciones.
- Integracion via API compatible con OpenAI Chat Completions (llama.cpp `llama-server`), con `temperature` configurable y plantilla de chat Jinja.
- Salida estructurada posible solo si el sistema de prompts define los campos; el modelo no garantiza JSON valido por si mismo.
- No soporta vision, audio ni otros dominios fuera del analisis de texto de comandos Linux.

## Casos de uso

- Revision previa a la ejecucion en terminal: el modelo recibe el comando y el contexto (directorio, shell, historial) y devuelve un texto con impacto potencial y motivos de riesgo, que el operador revisa antes de confirmar la accion.
- Registro de auditoria enriquecido: cada comando ejecutado se acompania de un analisis textual generado por el modelo, almacenado junto al log para revisiones posteriores y cumplimiento.
- Deteccion de operaciones destructivas sobre ficheros: ante comandos como borrados recursivos o sobrescrituras, el modelo explica el alcance segun el directorio de trabajo y las variables activas, ayudando a distinguir un borrado acotado de uno masivo.
- Revision de cambios de permisos y propietarios: el modelo interpreta comandos de `chmod`/`chown` en el contexto del usuario y del arbol de directorios indicado, y senala implicaciones de escalada o exposicion.
- Analisis de cambios en servicios y configuracion de red: para comandos de gestion de servicios o de red, el modelo describe el efecto esperado y los riesgos de interrupcion o exposicion, como apoyo a la aprobacion en entornos de produccion.
- Asistencia en formacion y simulacion: en laboratorios o entornos de practica, el modelo explica que haria un comando y por que es peligroso, sin ejecutarlo, sirviendo como material didactico para operadores junior.
- Pre-filtro en pipelines de automatizacion: integrado en un flujo que clasifica comandos antes de enviarlos a un entorno real, el modelo aporta una capa de explicacion que se combina con reglas deterministas para decidir si se requiere revision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que no existe un informe de evaluacion independiente vinculado al SHA-256 del artefacto y que no se proporcionan metricas de exactitud, exhaustividad, tasa de falsos positivos ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: el artefacto Q8_0 ocupa 811.843.008 bytes (aproximadamente 0,76 GiB); con overhead de contexto y runtime, el consumo tipico ronda 1-2 GiB, aunque no se han publicado mediciones oficiales.
- GPU recomendadas: cualquier GPU consumer con al menos 2-4 GiB de VRAM libre puede alojar el modelo; tambien es viable en CPU. No hay datos publicados de rendimiento por GPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna (por ejemplo, gama GTX/RTX con suficiente VRAM), asi como en CPU.
- Opciones de despliegue: llama.cpp (`llama-server`) con soporte de la arquitectura `qwen35` y GGUF Q8_0, exponiendo API compatible con OpenAI Chat Completions. El autor no menciona otros runtimes (vLLM, TGI, Ollama) como soportados para este artefacto.
- Parametros de ejecucion sugeridos por el autor: `--ctx-size 10240 --parallel 1 --jinja --reasoning off --reasoning-budget 0`, escuchando solo en `127.0.0.1`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Como referencia estructural, el modelo se puede situar frente a su base y frente a modelos pequenos de proposito general, pero sin datos de rendimiento publicados la comparacion cuantitativa no es posible.

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| AuditBox Command Guard 0.8B | 752 M | 262.144 declarados en GGUF (10.240 en el ejemplo) | GPL-3.0-only | GGUF Q8_0 | Analisis de riesgo de comandos Linux |
| Qwen/Qwen3.5-0.8B (base) | 752 M | No disponible en la informacion | Apache 2.0 | No disponible en la informacion | Proposito general |
| Alternativas de analisis de riesgo de comandos | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Puede emitir juicios de riesgo erroneos, omitir correlaciones entre comandos o confundir estados (comando enviado, cancelado, bloqueado o fallido); el autor exige etiquetar cada estado por separado.
- No se ha publicado calibracion de confianza del modelo, por lo que sus salidas no deben tratarse como probabilidades fiables.
- Puede devolver resultados con formato incompleto; si se espera JSON u otro esquema, la aplicacion debe validar formato, enumeracion de riesgo, numero de comando y evidencia, y registrar como no determinado cualquier fallo de parseo.
- La clasificacion de riesgo debe combinarse con reglas deterministas, salida real del dispositivo y revision humana; el modelo no controla la ejecucion ni los permisos.
- El historial de contexto puede estar desactualizado; el llamador es responsable de aportar el estado actual del dispositivo.
- Orientado exclusivamente a comandos de texto de Linux; otras plataformas y entradas visuales requieren otro modelo y otra cadena de ejecucion.
- Solo soporta chino e ingles; no se declara soporte de castellano ni de otros idiomas.
- La licencia GPL-3.0-only impone obligaciones de copyleft sobre el modelo y las obras derivadas; el uso comercial es posible pero condicionado a los terminos de la GPL. El modelo base conserva Apache 2.0 y sus avisos de atribucion.
- La procedencia y los permisos de los datos de entrenamiento y de las salidas del modelo profesor no estan completamente documentados, lo que supone un riesgo de cumplimiento en produccion.
- No hay validacion publicada del comportamiento en contexto largo pese a declarar 262.144 tokens; el ejemplo de despliegue se limita a 10.240.
- El repositorio tiene un volumen de descargas bajo (122) y ningun "like", lo que sugiere escasa validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Motanni/auditbox-command-guard-0.8b-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Hashes SHA-256: https://huggingface.co/Motanni/auditbox-command-guard-0.8b-gguf/blob/main/SHA256SUMS
- Licencia GPL-3.0-only: https://huggingface.co/Motanni/auditbox-command-guard-0.8b-gguf/blob/main/LICENSE
- Licencia del modelo base: https://huggingface.co/Motanni/auditbox-command-guard-0.8b-gguf/blob/main/BASE_MODEL_LICENSE
- Aviso de modificaciones y atribucion: https://huggingface.co/Motanni/auditbox-command-guard-0.8b-gguf/blob/main/NOTICE
