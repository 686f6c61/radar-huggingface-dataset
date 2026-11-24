# Microck/canonfig-guard-skill-update-396m

## Resumen

Canonfig Guard: Skill Update 396M es un clasificador de texto especializado en seguridad, desarrollado por Microck, que detecta cambios de alcance maliciosos en ficheros Markdown de "skills" (herramientas o instrucciones instaladas en un agente). El modelo compara una version propuesta de un fichero con la version exacta que el usuario aprobo previamente y emite un veredicto de tipo `allow`, `warn` o `block` acompanado de una puntuacion. Se trata de un fine-tuning de `answerdotai/ModernBERT-large` con 395.833.346 parametros, orientado a ejecucion en CPU y a entornos de investigacion.

El modelo no es un LLM generativo: es un encoder de clasificacion (pipeline `text-classification`) que trabaja sobre el diff entre la version aprobada y la propuesta. Su relevancia radica en el problema creciente de los ataques de tipo prompt injection y "skill poisoning" en sistemas de agentes, donde una actualizacion aparentemente inocua de un fichero de instrucciones puede redirigir la tarea del agente hacia objetivos no autorizados.

La ficha se basa exclusivamente en la informacion publicada en la model card y en los metadatos de Hugging Face. El modelo tiene cero descargas y cero likes en el momento de la consulta, y sus mediciones de rendimiento son de desarrollo, sin validacion en un conjunto de aceptacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-large) |
| Parametros totales | 395.833.346 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como contexto general; limite de 384 tokens para el diff |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 (pesos); MIT (scripts de escaneo y servidor) |
| Formato de pesos | safetensors (`checkpoint/model.safetensors`) |

## Arquitectura y entrenamiento

El modelo parte de `answerdotai/ModernBERT-large` (revision `45bb4654a4d5aaff24dd11d4781fa46d39bf8c13`), un encoder transformer moderno con atencion de contexto largo y mejoras de eficiencia respecto a BERT clasico. Sobre esa base se realizo un fine-tuning para clasificacion binaria/multiclase de seguridad, con destilacion suave (soft distillation) a partir de un profesor `Qwen/Qwen3-14B` (revision `40c069824f4251a91eefaf281ebe4c544efd3e18`, Apache 2.0) afinado para la tarea. El modelo resultante clasifica el diff entre el fichero aprobado y el propuesto.

El entrenamiento se apoya en un conjunto de ejemplos de actualizaciones riesgosas, redactadas manualmente como redirecciones de tarea inofensivas en apariencia, y un conjunto benigno que incluye 137 revisiones publicas utilizadas tambien para calibrar los umbrales. Ademas se evaluo sobre 338 ejemplos de escritores separados. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo RLHF/DPO; solo indica que las mediciones son de desarrollo y que el rendimiento en un conjunto de aceptacion independiente no esta verificado.

Una innovacion practica destacable es el diseno del pipeline de escaneo: el script `scan.py` verifica el hash SHA-256 del fichero aprobado antes de puntuar, de modo que el detector compara contra la version exacta que el usuario autorizo. La salida es JSON con score y veredicto.

## Capacidades

- Clasificacion de seguridad de actualizaciones de ficheros Markdown de skills, comparando version aprobada y propuesta.
- Deteccion de redirecciones de tarea (task redirections) introducidas en una actualizacion.
- Emision de veredicto con tres niveles: `allow`, `warn` y `block`, con puntuacion asociada.
- Verificacion de integridad del fichero aprobado mediante SHA-256 antes de la evaluacion.
- Ejecucion en CPU (probado en Linux ARM64 con Python 3.11 y PyTorch CPU 2.8.0).
- Salida estructurada en JSON apta para integrarse en pipelines automatizados.
- No soporta tool calling, agentes, vision, audio ni generacion de texto: es un clasificador, no un LLM.
- Capacidad multilingue limitada al ingles (`en`).
- Limite operativo de 384 tokens para el diff evaluado; las ediciones largas pueden excederlo.

## Casos de uso

- Revision de actualizaciones de skills en agentes: antes de instalar una nueva version de un fichero `SKILL.md`, el modelo compara el diff con la version aprobada y bloquea cambios que amplien el alcance de la tarea. Es adecuado porque su tarea especifica es precisamente detectar redirecciones.
- Puerta de seguridad en CI/CD de repositorios de agentes: integrar `scan.py` como paso previo al merge de cambios en ficheros de instrucciones, usando el veredicto JSON para fallar el pipeline cuando el resultado sea `block`.
- Auditoria de cadena de suministro de skills de terceros: al actualizar una skill descargada de un repositorio externo, verificar con el hash aprobado que la nueva version no altera el comportamiento previsto.
- Entornos con recursos limitados: al ejecutarse en CPU con un pico de memoria de 1.902 MiB en cuatro hilos, puede desplegarse en servidores sin GPU o en estaciones de trabajo de desarrollo.
- Investigacion en seguridad de agentes: usar el modelo como linea base o componente de un sistema de defensa contra prompt injection y skill poisoning en experimentos academicos.
- Monitorizacion de cambios en instrucciones de sistemas multiagente: puntuar periodicamente las revisiones de ficheros de skills para detectar derivas de alcance no autorizadas.
- Filtrado previo en pipelines de aprobacion humana: usar el nivel `warn` para enrutar actualizaciones dudosas a revision manual y `block` para rechazo automatico.

## Benchmarks y rendimiento

| Decision | Redirecciones detectadas | Ejemplos benignos marcados |
|---|---:|---:|
| Umbral de bloqueo (block) | 105/118 (89,0 %) | 2/357 (0,6 %) |
| Umbral de aviso (warn) | 113/118 (95,8 %) | 9/357 (2,5 %) |

- Precision en el umbral de bloqueo: 460/475 (96,8 %).
- Precision en el conjunto separado de 338 ejemplos de escritores: 323/338 (95,6 %).
- Los conteos de aviso incluyen los bloqueos.
- Mediciones de desarrollo; el rendimiento en un conjunto de aceptacion independiente no esta verificado.

Rendimiento de ejecucion (segun la model card): seis peticiones locales de Guard tardaron entre 0,82 y 5,30 segundos en cuatro hilos de CPU, con un pico de memoria de proceso de 1.902 MiB.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el escenario probado; el modelo se ejecuta en CPU.
- Memoria de proceso en CPU: pico de 1.902 MiB en cuatro hilos.
- GPU recomendadas: no disponible; no se han publicado requisitos de GPU.
- Cabe en GPU de consumo: no disponible; el modelo esta pensado para CPU.
- Opciones de despliegue: scripts propios (`scan.py`) con PyTorch CPU 2.8.0 y `requirements.txt`; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 0,82-5,30 segundos por peticion en el entorno probado (Linux ARM64, cuatro hilos de CPU).
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Canonfig Guard: Skill Update 396M | 395.833.346 | diff de 384 tokens | Clasificacion de seguridad de actualizaciones de skills | Apache 2.0 (pesos), MIT (scripts) | Hugging Face |
| Canonfig Guard: Skill File 80M | no disponible | no disponible | Deteccion en primera instalacion de skill | no disponible en la informacion | Hugging Face |
| answerdotai/ModernBERT-large (base) | no disponible en la informacion | no disponible | Encoder generalista | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; el rendimiento en otros idiomas no esta documentado.
- Limite de 384 tokens para el diff: las ediciones largas pueden excederlo y quedar fuera de la evaluacion.
- Las metricas son de desarrollo; no hay validacion en un conjunto de aceptacion independiente, por lo que el rendimiento en produccion es incierto.
- El conjunto benigno incluye 137 revisiones publicas usadas tambien para calibrar umbrales, lo que puede introducir sesgo de calibracion.
- Riesgo de falsos negativos: con el umbral de bloqueo se detectaron 105 de 118 redirecciones (89,0 %), de modo que un 11 % de redirecciones riesgosas no se bloquearia.
- Riesgo de falsos positivos: 2 de 357 ejemplos benignos se marcaron como bloqueo (0,6 %) y 9 de 357 como aviso (2,5 %).
- Es un clasificador, no un generador: no razona, no ejecuta herramientas ni explica sus decisiones mas alla de la puntuacion.
- Requiere gestion externa del hash SHA-256 del fichero aprobado; si ese hash se compromete, la garantia de comparacion se pierde.
- Licencia Apache 2.0 para los pesos y MIT para los scripts, lo que permite uso comercial, pero debe conservarse la atribucion a `answerdotai/ModernBERT-large` y respetarse las condiciones de la licencia Apache.
- Modelo con cero descargas y cero likes: no hay evidencia de uso en produccion ni de mantenimiento continuado.
- No se documentan sesgos especificos, pero al ser un fine-tuning sobre datos redactados manualmente puede heredar sesgos de redaccion del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Microck/canonfig-guard-skill-update-396m
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-large
- Profesor de destilacion: https://huggingface.co/Qwen/Qwen3-14B
- Skill File 80M (primera instalacion): https://huggingface.co/Microck/canonfig-guard-skill-file-80m
- Benchmark counts: ./benchmarks.json (referenciado en la model card del repositorio)
