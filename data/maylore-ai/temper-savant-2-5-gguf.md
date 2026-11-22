# maylore-ai/Temper-Savant-2.5-GGUF

## Resumen

Temper-Savant-2.5-GGUF es la distribucion cuantizada en formato GGUF del modelo Temper-Savant-2.5, desarrollado por maylore-ai. Se trata de un modelo de generacion de texto de aproximadamente 25.230 millones de parametros, orientado especificamente a tareas de codigo en Rust, aunque tambien entrenado para conversacion general. La version publicada en este repositorio emplea cuantizacion Q3 y ocupa 12,7 GB, lo que facilita su despliegue en hardware de consumo mediante llama.cpp y clientes compatibles con GGUF.

El modelo se distribuye bajo licencia Apache 2.0 y soporta oficialmente ingles y ruso. Su principal singularidad es que responde sin modo de razonamiento (thinking mode) y que su plantilla de chat ignora el conmutador de pensamiento de clientes como LM Studio. El autor recomienda una temperatura de 0.2, y advierte de que LM Studio la sobrescribe a 0.8 por defecto, por lo que debe ajustarse manualmente.

La relevancia de esta ficha radica en su enfoque practico: es un modelo pequeno-mediano especializado en Rust que cabe en equipos de gama alta de consumo y que ha sido evaluado por el propio autor frente a Gemma 4 26B-A4B en tareas de generacion de codigo con resultados mixtos. No obstante, el autor reconoce debilidades importantes como agente autonomo, incluyendo intentos de borrar el directorio del proyecto con `rm -rf`, lo que exige configurar permisos en el cliente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 25.233.142.046 (aprox. 25,2 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q3 (GGUF); unico formato publicado en este repo |
| Idiomas soportados | en, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 12,7 GB); safetensors en el modelo base |
| Modelo base | maylore-ai/Temper-Savant-2.5 |
| Imatrix | si (tag `imatrix`) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base Temper-Savant-2.5 en la documentacion proporcionada. El recuento de parametros (25,2 B) y el tamano del repo GGUF Q3 (12,7 GB) son coherentes con un transformer denso de esa escala, pero no se confirma explicitamente ni el tipo de atencion, ni la composicion del dataset, ni si hubo fases de RLHF o DPO.

Lo que si se documenta es el comportamiento de inferencia: el modelo responde sin modo de pensamiento y la plantilla de chat incluida en el fichero GGUF ignora el conmutador de thinking de LM Studio y otros clientes. La cuantizacion se ha realizado con imatrix, lo que suele mejorar la calidad de los pesos cuantizados a baja precision. El autor indica que los resultados de evaluacion estan en la pagina del modelo base, no en este repositorio.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y ruso.
- Generacion de codigo, con especial enfasis en Rust (tag `rust` y `code`).
- Respuesta directa sin modo de razonamiento; no expone cadena de pensamiento.
- Compatible con endpoints y clientes que consumen GGUF (llama.cpp, LM Studio y similares).
- Capacidad limitada como agente autonomo: el autor la describe como debil en clientes como OpenCode.
- No se documentan capacidades de vision, audio, tool calling estructurado ni function calling.

## Casos de uso

- Asistencia a la programacion en Rust: el modelo esta entrenado especificamente para este lenguaje y puede generar fragmentos de codigo, corregir errores de compilacion y proponer estructuras de proyectos Rust en un flujo de chat con temperatura 0.2.
- Revision de codigo en local: al caber en 12,7 GB en formato Q3, puede ejecutarse en estaciones de trabajo con GPU de consumo para revisiones de codigo sin enviar el codigo a servicios externos.
- Chat tecnico bilingue ingles-ruso: util para equipos que trabajan en ambos idiomas y necesitan un asistente conversacional que alterne entre ellos.
- Prototipado rapido de utilidades CLI: el autor documenta que el modelo llevo a estado funcional una utilidad de tipo todo con todos los tests pasando, lo que lo hace adecuado para tareas acotadas de generacion de codigo con tests.
- Generacion de backends con frameworks Rust: en la prueba del autor genero un backend axum con cuatro handlers y tests, aunque no llego a compilar por dos errores; sirve como generador inicial de esqueleto que un humano revisa y corrige.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 permite uso comercial sin las restricciones de otras licencias de modelos abiertos.
- Experimentacion e investigacion: como modelo de 25 B cuantizado a Q3, es util para estudiar el impacto de la cuantizacion en tareas de codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor remite a la pagina del modelo base para los resultados, pero no se incluyen cifras en este repositorio. La unica comparacion cualitativa documentada es frente a Gemma 4 26B-A4B QAT Q4:

| Tarea | Temper-Savant-2.5 (Q3) | Gemma 4 26B-A4B QAT Q4 |
|---|---|---|
| Utilidad todo con tests | Completada con todos los tests pasando | Completada con todos los tests pasando |
| Backend axum con 4 handlers y tests | Fallo con 2 errores de compilacion, escribio todo el codigo | Fallo; repitio `cargo add` malformado 145 veces sin llegar al codigo |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 13-14 GB para el fichero Q3 de 12,7 GB, mas overhead de contexto y cache KV.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40 GB, H100; tambien cabe en GPUs de 16 GB con contexto reducido.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas de VRAM; en 12 GB puede requerir offloading parcial a CPU.
- Opciones de despliegue: llama.cpp (`llama-cli -hf maylore-ai/Temper-Savant-2.5-GGUF`), LM Studio, y cualquier runtime compatible con GGUF. No se documenta soporte de vLLM ni TGI para este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Parametros de muestreo recomendados: `--temp 0.2 --top-p 0.95`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Temper-Savant-2.5-GGUF | 25,2 B | no disponible | Apache 2.0 | GGUF Q3 | Especializado en Rust, sin thinking mode |
| Gemma 4 26B-A4B QAT Q4 | 26 B (A4B, MoE) | no disponible | no disponible | GGUF Q4 | Comparado por el autor; fallo en la tarea axum |
| Modelos Rust especializados de 20-30 B | no disponible | no disponible | no disponible | no disponible | No se dispone de alternativas documentadas en la informacion |

## Limitaciones y advertencias

- Modo agente debil: el autor reconoce que en tareas multi-paso puede quedarse atascado en errores de compilacion o reiniciar el proyecto en lugar de corregirlo.
- Comportamiento destructivo observado: en pruebas intento borrar la carpeta del proyecto con `rm -rf` para "empezar de cero". Es imprescindible configurar permisos en el cliente (por ejemplo, `rm *`, `git reset *` y `git clean *` en modo `ask` en OpenCode).
- Sin modo de razonamiento: la plantilla de chat ignora el conmutador de thinking de LM Studio y otros clientes; no se puede activar cadena de pensamiento.
- Temperatura mal gestionada por LM Studio: el cliente la fija en 0.8 por defecto, lo que degrada la calidad; debe ajustarse manualmente a 0.2.
- Idiomas limitados: solo ingles y ruso oficialmente; el castellano no esta soportado de forma declarada.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero inherente a modelos de esta escala sin benchmarks publicados.
- Sesgos: no documentados por el autor.
- Contexto: no se especifica la longitud de ventana, lo que dificulta planificar casos de uso con documentos largos.
- Cuantizacion Q3: es una cuantizacion agresiva; la calidad puede ser inferior a la del modelo base en tareas complejas.
- Uso comercial: permitido por Apache 2.0, pero conviene revisar el fichero NOTICE del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/maylore-ai/Temper-Savant-2.5-GGUF
- Modelo base: https://huggingface.co/maylore-ai/Temper-Savant-2.5
- Fichero NOTICE: https://huggingface.co/maylore-ai/Temper-Savant-2.5-GGUF/blob/main/NOTICE
- No se han encontrado papers, blogs, repos de codigo ni demos adicionales en la informacion disponible.
