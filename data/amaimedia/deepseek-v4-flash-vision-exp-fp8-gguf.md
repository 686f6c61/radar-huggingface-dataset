# AMAImedia/DeepSeek-V4-Flash-Vision-Exp-FP8-GGUF

## Resumen

AMAImedia/DeepSeek-V4-Flash-Vision-Exp-FP8-GGUF es una redistribucion cuantizada a FP8 (8 bits) y GGUF del modelo deepseek-ai/DeepSeek-V4-Flash-Vision-Exp, publicado por el usuario AMAImedia (Ilia Bolotnikov) como parte de su plataforma NOESIS. No se trata de un modelo entrenado por el autor del repositorio, sino de una conversion de pesos del modelo original de DeepSeek AI, orientada a reducir el espacio en disco y facilitar el despliegue en infraestructura propia o con herramientas compatibles con GGUF.

El modelo base es el primer modelo multimodal experimental de la familia DeepSeek-V4: parte de la arquitectura DeepSeek-V4-Flash y le anade modulos visuales mediante entrenamiento continuado, de modo que acepta entradas de imagen y texto (pipeline image-text-to-text) y mejora las capacidades de agente multimodal respecto a DeepSeek-V4-Flash-0731, manteniendo un rendimiento comparable en tareas de agente puramente textuales. El repositorio declara 304.646.824.126 parametros totales (unos 304,6 mil millones) y ocupa 319,4 GB, lo que lo situa en la categoria de modelos de gran escala que requieren despliegue multi-GPU.

Es relevante ahora porque combina tres elementos poco frecuentes en un mismo paquete abierto: comprension de imagen y texto, capacidades de agente multi-paso con uso de herramientas (terminal, navegador, repositorios de codigo) y soporte declarado para mas de 100 idiomas, todo ello bajo licencia permisiva segun los metadatos del repositorio. La contrapartida es su tamano: 304,6 B de parametros implican cientos de GB de pesos incluso en FP8, por lo que su uso realista se limita a clusters con varias GPU de 80 GB o a despliegues GGUF con offload masivo a CPU y RAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada explicitamente en la informacion disponible; etiquetada como deepseek_v4. El modelo base se describe como DeepSeek-V4-Flash con modulos visuales anadidos |
| Parametros totales | 304.646.824.126 (304,6 B) |
| Parametros activos | No disponible (no se indica en la informacion proporcionada que sea un modelo de mezcla de expertos) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 (8 bits) y GGUF; los niveles concretos de cuantizacion GGUF no se detallan en la informacion disponible |
| Idiomas soportados | 106 idiomas declarados, entre ellos en, ru, zh, vi, kk, ja, es, de, fr, pt, it, ar, hi, ko, tr, nl, pl, sv y yue |
| Licencia | apache-2.0 segun los metadatos y etiquetas del repositorio; la model card del modelo base muestra una insignia MIT, discrepancia no aclarada en la informacion disponible |
| Formato de pesos | safetensors y GGUF |
| Tamano del repositorio | 319,4 GB |
| Pipeline | image-text-to-text (multimodal) |
| Fecha de creacion | 2026-09-01 |
| Ultima actualizacion | 2026-09-20 |
| Descargas / likes | 2181 descargas / 0 likes |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de su etiqueta deepseek_v4 y de la descripcion oficial, que indica que DeepSeek-V4-Flash-Vision-Exp parte de la arquitectura DeepSeek-V4-Flash y le incorpora modulos visuales seguidos de un entrenamiento continuado para habilitar la comprension de imagenes. No se especifican el numero de capas, el tipo de atencion, la posible naturaleza de mezcla de expertos, la ventana de contexto nativa ni los detalles del encoder visual. Tampoco se documentan el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

Respecto a esta redistribucion concreta, AMAImedia publica pesos convertidos a FP8 y GGUF a partir del modelo original. La model card del autor menciona que el trabajo se enmarca en la plataforma NOESIS Professional Multilingual Dubbing Automation Platform (framework DHCF-FNO) y que la cuantizacion se realizo con recursos alquilados (H200/Blackwell segun el propio autor), dado que su hardware local (RTX 3060 Laptop de 6 GB) no permite procesar modelos de esta escala.

## Capacidades

- Generacion de texto y razonamiento conversacional, con soporte multi-turno declarado mediante la etiqueta conversational.
- Comprension de imagenes y texto de forma conjunta (pipeline image-text-to-text): el modelo acepta entradas visuales combinadas con instrucciones textuales.
- Capacidades de agente textual evaluadas en el modelo base: Terminal Bench 2.1, NL2Repo, Cybergym, DeepSWE, Toolathlon-Verified, DSBench-Hard y AutomationBench, lo que implica uso de herramientas, ejecucion en terminal y manejo de repositorios de codigo.
- Capacidades de agente multimodal evaluadas en el modelo base: ApexBench, Agents' Last Exam, Chartography y ZeroBench, orientadas a razonamiento sobre entradas visuales y documentos con graficos.
- Comprension de graficos y diagramas, segun la evaluacion Chartography reportada para el modelo base.
- Soporte multilingue amplio: 106 idiomas declarados en los metadatos, incluyendo idiomas de bajos recursos.
- Modo de razonamiento con esfuerzo configurable: las evaluaciones del modelo base se realizaron con el nivel de esfuerzo de razonamiento max y los parametros temperature = 1.0 y top_p = 0.95.
- No se documenta en la informacion disponible soporte de audio, video, decodificacion especulativa ni modos de pensamiento explicitos mas alla del nivel de esfuerzo de razonamiento.

## Casos de uso

- Agentes de automatizacion de terminal y sistema operativo: el modelo base obtiene 83,9 en Terminal Bench 2.1, por lo que es adecuado para tareas de ejecucion de comandos, diagnostico de entornos y automatizacion de flujos de trabajo en linea de comandos dentro de un bucle de agente con herramientas.
- Ingenieria de software asistida sobre repositorios: con 57,7 en NL2Repo y 59,3 en DeepSWE, puede emplearse para navegar bases de codigo, generar parches y resolver incidencias, integrándose en pipelines de CI/CD siempre que se le proporcione acceso controlado al repositorio.
- Analisis de documentos con graficos e informes: la puntuacion de 64,3 en Chartography indica capacidad para interpretar graficos y diagramas, util en extraccion de datos de informes financieros, dashboards o documentacion tecnica escaneada.
- Dubbing y localizacion multilingue automatizada: el repositorio se publica como parte de la plataforma NOESIS de automatizacion de dubbing multilingue, de modo que el modelo encaja en flujos de traduccion y adaptacion de contenido audiovisual con mas de 100 idiomas declarados.
- Atencion al cliente multilingue con soporte visual: combinando la entrada image-text-to-text con la cobertura idiomatica, puede gestionar conversaciones en las que el usuario adjunta capturas de pantalla, facturas o productos, y responder en su idioma.
- Revision de seguridad y analisis de codigo: la puntuacion de 75,3 en Cybergym sugiere utilidad en tareas de analisis de vulnerabilidades y triaje de codigo potencialmente malicioso dentro de entornos aislados.
- Automatizacion de tareas ofimaticas y de back office: con 75,9 en Toolathlon-Verified, es apto para orquestar llamadas a APIs y herramientas externas en procesos administrativos multi-paso.
- Analisis de imagenes tecnicas o industriales: al aceptar entrada visual, puede usarse para describir, clasificar o extraer informacion de fotografias y planos, siempre con validacion humana dado el riesgo de alucinacion.

## Benchmarks y rendimiento

Los siguientes resultados proceden de la model card del modelo base deepseek-ai/DeepSeek-V4-Flash-Vision-Exp. Corresponden al modelo original sin cuantizar, no a esta redistribucion FP8/GGUF, cuyo impacto en la calidad no se ha documentado en la informacion disponible.

| Benchmark | DeepSeek-V4-Flash-Vision-Exp | DeepSeek-V4-Flash-0731 | Opus-4.8 |
|---|---|---|---|
| Terminal Bench 2.1 | 83,9 | 82,7 | 85,0 |
| NL2Repo | 57,7 | 54,2 | 69,7 |
| Cybergym | 75,3 | 76,7 | 78,3 |
| DeepSWE | 59,3 | 54,4 | 58,0 |
| Toolathlon-Verified | 75,9 | 70,3 | 76,2 |
| DSBench-Hard | 63,6 | 59,6 | 71,7 |
| AutomationBench (Public) | 25,7 | 25,1 | 27,2 |
| ApexBench (Pass@1) | 36,5 | 26,2 (ignora elementos multimodales) | 39,4 |
| Agents' Last Exam | 27,3 | 25,2 (ignora elementos multimodales) | 25,7 |
| Chartography | 64,3 | No disponible | 65,0 |
| ZeroBench (Pass@5) | 35,0 | No disponible | 34,0 |

Notas de la model card original: los benchmarks de agente textual se evaluaron con el modo minimal de DeepSeek Harness como framework de agente, con nivel de esfuerzo de razonamiento max y temperature = 1.0, top_p = 0.95. En ApexBench y Agents' Last Exam, la variante DeepSeek-V4-Flash-0731 ignora los elementos multimodales de la entrada.

No se han publicado en la informacion disponible resultados de benchmarks especificos para la version FP8 o GGUF de este repositorio.

## Requisitos de hardware

- VRAM estimada en FP8: aproximadamente 305 GB solo para los pesos, calculado a partir de los 304,6 B de parametros; hay que anadir memoria para cache KV, activaciones y overhead del runtime.
- VRAM estimada en GGUF (estimaciones derivadas del numero de parametros, sin cache KV ni activaciones): Q8_0 en torno a 320 GB; Q5_K_M en torno a 215 GB; Q4_K_M en torno a 180 GB; Q2_K en torno a 100 GB. Son calculos aproximados, no cifras publicadas por el autor.
- GPU recomendadas para FP8: configuraciones multi-GPU, por ejemplo 8x H100 80 GB o 8x A100 80 GB. El propio autor indica que las cuantizaciones de esta clase requieren H200 o Blackwell alquilados.
- GPU de consumo: no cabe en ninguna GPU de consumo actual de forma completa. El autor del repositorio trabaja con una RTX 3060 Laptop de 6 GB, insuficiente incluso para una capa completa del modelo en FP8, por lo que solo sirve para tareas auxiliares.
- Despliegue en CPU y RAM: con cuantizaciones GGUF agresivas y offload podria ejecutarse en equipos con 128 GB o mas de RAM, a costa de latencias muy altas y throughput reducido. No se documentan velocidades medidas.
- Opciones de despliegue: los formatos declarados (safetensors y GGUF) permiten su uso con transformers, llama.cpp y Ollama; tambien serian candidatos vLLM o TGI para el formato safetensors, aunque no se confirma compatibilidad explicita en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad | Rendimiento de referencia |
|---|---|---|---|---|---|---|
| AMAImedia/DeepSeek-V4-Flash-Vision-Exp-FP8-GGUF | 304,6 B | No disponible | Si (imagen-texto) | apache-2.0 (segun metadatos) | Pesos abiertos en HuggingFace, 319,4 GB | Benchmarks no publicados para la version cuantizada |
| deepseek-ai/DeepSeek-V4-Flash-Vision-Exp | No disponible | No disponible | Si (imagen-texto) | Insignia MIT en la model card, discrepancia con los metadatos del derivado | Pesos abiertos en HuggingFace | ApexBench 36,5; Agents' Last Exam 27,3; Chartography 64,3; ZeroBench (Pass@5) 35,0 |
| deepseek-ai/DeepSeek-V4-Flash-0731 | No disponible | No disponible | No (ignora elementos multimodales) | No disponible | Pesos abiertos en HuggingFace | Terminal Bench 2.1 82,7; Toolathlon-Verified 70,3; DSBench-Hard 59,6 |
| Opus-4.8 | No disponible | No disponible | Si, segun los benchmarks multimodales reportados | Propietaria (modelo cerrado) | Solo via API | Terminal Bench 2.1 85,0; NL2Repo 69,7; DSBench-Hard 71,7; Chartography 65,0 |

La comparativa se limita a los tres modelos para los que la informacion proporcionada incluye datos. No se dispone de cifras de parametros ni de contexto de DeepSeek-V4-Flash-0731 ni de Opus-4.8, por lo que el tamano relativo no puede establecerse.

## Limitaciones y advertencias

- Se trata de una redistribucion no oficial: el repositorio esta publicado por AMAImedia y no por DeepSeek AI. La responsabilidad sobre la fidelidad de la cuantizacion recae en el autor del repositorio.
- Los benchmarks reportados corresponden al modelo base sin cuantizar. No hay evidencia publicada en la informacion disponible sobre la degradacion introducida por la cuantizacion FP8 o GGUF.
- Riesgo de alucinacion inherente a los modelos de lenguaje de gran escala, especialmente en tareas de agente autonomo y en interpretacion de imagenes ambiguas. No se ha publicado ninguna evaluacion de fiabilidad especifica.
- La model card del modelo base muestra una insignia MIT mientras que los metadatos y etiquetas del repositorio derivado declaran apache-2.0. Antes de un uso comercial conviene verificar la licencia aplicable en el repositorio original.
- Distribucion de sesgos no documentada: no se detalla la composicion del dataset de entrenamiento ni se ofrecen analisis de sesgo por idioma, genero o grupo demografico.
- Cobertura idiomatica desigual: aunque se declaran 106 idiomas, no se aportan metricas por idioma, por lo que el rendimiento en idiomas de bajos recursos (por ejemplo kam, luo, umb o qxp) es desconocido.
- Longitud de contexto no disponible, lo que impide planificar despliegues que dependan de ventanas largas.
- Coste de inferencia muy elevado: 304,6 B de parametros implican infraestructura multi-GPU o configuraciones con offload masivo, con latencias altas en el segundo caso.
- Modelo de caracter experimental, segun la propia denominacion del modelo base, lo que desaconseja su uso en produccion critica sin evaluacion previa.
- El repositorio tiene 0 likes y 2181 descargas, con una model card que incluye llamadas a donaciones; conviene tratar la informacion con cautela y contrastarla con el repositorio original de DeepSeek.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/AMAImedia/DeepSeek-V4-Flash-Vision-Exp-FP8-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp
- Organizacion DeepSeek AI en HuggingFace: https://huggingface.co/deepseek-ai
- Sitio oficial de DeepSeek: https://www.deepseek.com/
- Chat de DeepSeek: https://chat.deepseek.com/
- X (Twitter) de DeepSeek AI: https://twitter.com/deepseek_ai
- Sitio de AMAImedia: https://AMAImedia.com
- X (Twitter) de AMAImedia: https://x.com/AMAImediacom
- LinkedIn del autor: https://www.linkedin.com/in/ilia-bolotnikov
- Telegram del autor: https://t.me/djbionicl
- No se han encontrado papers, blogs tecnicos ni demos adicionales en los resultados de busqueda web proporcionados.
