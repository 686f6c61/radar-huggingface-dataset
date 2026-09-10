# mmp2055/Qwen2.5-VL-3B-uncensored-bughunter-v9

## Resumen

Qwen2.5-VL-3B-uncensored-bughunter-v9 es un ajuste fino (LoRA/QLoRA) del modelo multimodal Qwen/Qwen2.5-VL-3B-Instruct, publicado por el usuario mmp2055 dentro de su serie "bughunter". El objetivo declarado es disponer de un asistente especializado en seguridad ofensiva y defensiva (bug bounty, pentesting, DFIR, threat hunting) que quepa en un dispositivo móvil. Para ello se parte de un modelo denso de 3.085.938.688 parametros (≈3B) con torre de vision congelada y se publica principalmente en formato GGUF cuantizado Q4_K_M, con un archivo de aproximadamente 1,8 GB mas un proyector visual `mmproj-BF16.gguf` de unos 800 MB.

La relevancia del modelo esta en su enfoque de despliegue: frente a la iteracion v8 de la misma serie (un MoE de 35B), la v9 prioriza la inferencia en edge y movil mediante llama.cpp, con velocidades declaradas de 15-30 tokens/s en telefonos modernos. El "uncensoring" se aplica en dos fases: primero un ajuste fino sobre un corpus ofensivo privado que refuerza el rol de investigador, y despues una ablacion de la direccion de rechazo (abliteration, metodo de Maxime Labonne). El modelo responde en espanol, pero mantiene payloads, comandos y plantillas de informe en ingles.

La model card incluye reglas operativas embebidas (alcance autorizado, PoCs no destructivos, callbacks a infraestructura propia, throughput limitado a 1-2 req/s), pensadas para uso en plataformas como HackerOne, Bugcrowd, Intigriti, YesWeHack e Immunefi. Se trata de un modelo de doble uso: la misma capacidad que asiste a un pentester autorizado facilita la generacion de tecnicas de ataque, por lo que su evaluacion debe contemplar controles de uso. La informacion disponible esta truncada: la model card original se corta en la seccion de datos de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (Qwen2.5-VL): torre de vision + proyector + LLM decoder; torre de vision congelada durante el ajuste |
| Parametros totales | 3.085.938.688 (≈3B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada en la model card. El entrenamiento filtro ejemplos a un maximo de 4.096 tokens; el contexto de inferencia heredado del modelo base no se confirma en la informacion disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (LLM) y BF16 (proyector visual `mmproj-BF16.gguf`); no se listan otras cuantizaciones |
| Idiomas soportados | Espanol (es) e ingles (en). Respuestas en espanol; payloads, comandos y plantillas en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (principal, libreria declarada `gguf`) y safetensors (tag del repositorio; no se detalla que pesos concretos se publican en ese formato) |
| Autor | mmp2055 |
| Modelo base | Qwen/Qwen2.5-VL-3B-Instruct |
| Modalidad | Image-text-to-text (texto + imagen de entrada) |
| Tamano del repositorio | 3,4 GB |
| Metodo de ajuste | LoRA/QLoRA con Unsloth + abliteration |
| Fecha de publicacion | 2026-09-10 (creacion); 2026-09-10 (ultima actualizacion) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-VL-3B-Instruct, una arquitectura transformer densa de aproximadamente 3B parametros con capacidad multimodal: una torre de vision procesa las imagenes y un proyector las alinea con el espacio de embeddings del decoder de lenguaje. En esta iteracion la torre de vision y el proyector se mantuvieron congelados (`finetune_vision_layers=False`), por lo que el corpus de ajuste, 100% textual, no modifica la comprension de imagen: esta se hereda tal cual del modelo base. El archivo `mmproj-BF16.gguf` publicado se extrae del modelo base mediante `convert_hf_to_gguf.py --mmproj`.

El entrenamiento reutiliza el mismo dataset privado (no publicado) que las versiones v6, v7 y v8: 14.914 ejemplos en formato ShareGPT, mas 466 de validacion y 309 de test, extraidos de aproximadamente 1.690 documentos fuente agrupados en 9 fuentes con muestreo ponderado para priorizar contenido ofensivo especializado. La v9 introduce dos cambios de preprocesado respecto a la v8: filtrado de ejemplos a un maximo de 4.096 tokens (que en la practica no elimino ningun ejemplo, dado que la distribucion ya era corta: media de 359 tokens, mediana de 296 y p95 de 805 tras el formateo) y un refuerzo x2 de las conversaciones cortas, en las que todos los turnos del asistente son inferiores a 300 caracteres. El ajuste se realizo con LoRA/QLoRA sobre Unsloth, y despues se aplico abliteration (metodo de Maxime Labonne) sobre el modelo fusionado para eliminar la direccion residual de rechazo. No se documentan en la informacion disponible datos sobre fases de RLHF o DPO.

## Capacidades

- Analisis de imagenes (image-text-to-text): heredado del modelo base, con la torre de vision intacta; util para capturas de paneles, trafico, respuestas HTTP o interfaces.
- Seguridad ofensiva, reconocimiento: enumeracion pasiva de subdominios, mapeo de superficie de ataque, mapeo de APIs, extraccion de secretos en JavaScript y uso limitado de herramientas como httpx, gau o katana.
- Vulnerabilidades web: patrones de IDOR/BOLA, SSRF, CSRF, XSS (reflejado, almacenado y DOM), inyeccion SQL en distintos contextos, CORS mal configurado, redirecciones abiertas, prototype pollution, subdomain takeover, path traversal, LFI/RFI y request smuggling.
- Autenticacion y autorizacion: OAuth/OIDC (`redirect_uri`, `state`/`nonce`/PKCE), JWT (firma no verificada, `alg:none`, clave debil, inyeccion en `kid`, confusion RS256→HS256), bypass de 2FA/MFA, session fixation y mass assignment.
- APIs: BOLA, BFLA, exposicion excesiva de datos, versiones legacy sin autorizacion, introspeccion de GraphQL y abuso de alias.
- Seguridad en servidor: SSRF contra metadatos de cloud (AWS IMDSv1/v2, GCP, Azure), SSTI, RCE por deserializacion y XXE.
- Logica de negocio: condiciones de carrera (TOCTOU), manipulacion de precio/cantidad/saldo y abuso de cupones o creditos.
- Redaccion de informes: formatos por plataforma (CVSS de HackerOne, VRT de Bugcrowd, Intigriti) y calculo de severidad.
- Blue team / DFIR: metodologia de respuesta a incidentes, reconstruccion de linea temporal, recoleccion de artefactos, analisis de trafico (PCAP, deteccion basica de C2, DNS tunneling), forense de memoria con recetas de Volatility, threat hunting basado en TTP de ATT&CK y priorizacion de vulnerabilidades con CVSS.
- Reglas operativas embebidas cuando se proporciona un system prompt: alcance autorizado verificado, throughput sostenido de 1-2 req/s, PoCs minimos no destructivos (`whoami`/`id` para RCE, `SELECT version()` para SQLi, dos cuentas propietarias para IDOR), callbacks OOB solo a infraestructura propia, prohibicion de reutilizar credenciales halladas y severidad minima reportable High o Critical.
- Capacidades multilingues limitadas a espanol e ingles.
- No se documenta soporte explicito de tool calling ni de function calling en la informacion disponible.

## Casos de uso

- Bug bounty sobre programas con alcance definido: el modelo propone hipotesis y PoCs minimos por tipo de vulnerabilidad (IDOR, SSRF, JWT) y redacta el informe en el formato de la plataforma; su tamano de 3B permite tenerlo abierto en el portatil mientras se trabaja con otras herramientas.
- Pentesting asistido en campo desde el movil: con el GGUF Q4_K_M de 1,8 GB y las bindings de llama.cpp para iOS/Android, se puede consultar tecnicas y comandos sin conexion ni envio de datos a terceros, util en entornos con red restringida.
- Triaje de capturas y trazas visuales: al conservar la torre de vision, puede interpretar capturas de paneles de administracion, respuestas HTTP o interfaces para orientar el analisis de un hallazgo.
- Redaccion de informes de vulnerabilidades: genera plantillas de reporte con calculo de severidad CVSS y estructura compatible con HackerOne, Bugcrowd o Intigriti, reduciendo el tiempo entre hallazgo y entrega.
- Analisis de exposicion en JavaScript: revision de bundles para localizar claves, endpoints internos y rutas no documentadas antes de pasar a pruebas activas.
- Formacion y laboratorios de seguridad: en entornos CTF o aulas, sirve como asistente que explica la tecnica y su mitigacion, con la ventaja de no requerir GPU dedicada.
- Apoyo a DFIR en primera respuesta: reconstruccion de linea temporal, recetas de Volatility y correlacion de eventos ATT&CK como borrador que el analista valida despues.
- Priorizacion de vulnerabilidades en gestion de parches: combina CVSS con contexto para ordenar remediaciones cuando el inventario es amplio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente aporta datos operativos de rendimiento en inferencia: 15-30 tokens/s en telefonos modernos con el archivo Q4_K_M mediante las bindings moviles de llama.cpp.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 1,8 GB para el LLM en Q4_K_M; hay que sumar unos 800 MB si se carga el proyector visual BF16 (`mmproj-BF16.gguf`), lo que situa el conjunto en torno a 2,6-3 GB, mas la cache KV correspondiente al contexto utilizado. Son estimaciones derivadas de los tamanos de archivo publicados, no cifras declaradas por el autor.
- GPU recomendadas: no especificadas en la informacion disponible. Por tamano, el modelo es ejecutable en GPU de consumo sin problemas.
- Cabe en GPU de consumo: si. Cualquier GPU con 4 GB o mas de VRAM puede alojar la cuantizacion Q4_K_M; es apto tambien para inferencia en CPU y para despliegue en movil (iOS/Android) mediante llama.cpp.
- Opciones de despliegue: LM Studio (escritorio, detecta automaticamente el `mmproj-`), llama.cpp con soporte de la arquitectura `qwen2_5_vl` (builds de febrero de 2025 en adelante), apps moviles que integren bindings de llama.cpp y cualquier runtime que soporte GGUF con esa arquitectura. Requiere `inference: false` en la model card, es decir, la inferencia no esta habilitada en la infraestructura de HuggingFace.
- Latencia y throughput: 15-30 tokens/s en telefonos modernos segun la model card. No hay datos de throughput en GPU o servidor.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Vision | Licencia | Formato y despliegue |
|---|---|---|---|---|---|---|
| Qwen2.5-VL-3B-uncensored-bughunter-v9 | 3,09B (denso) | Transformer multimodal, vision congelada | No especificado (entrenamiento limitado a 4.096 tokens por ejemplo) | Si | Apache 2.0 | GGUF Q4_K_M (~1,8 GB) + mmproj BF16; movil y escritorio |
| mmp2055/Qwen3.5-35B-A3B-uncensored-bughunter-v8 | 35B totales (MoE, activos no disponibles) | MoE multimodal | No disponible | Si | No disponible en la informacion proporcionada | No disponible; requiere hardware muy superior |
| Qwen/Qwen2.5-VL-3B-Instruct (modelo base) | 3,09B (denso) | Transformer multimodal | No disponible en la informacion proporcionada | Si | Apache 2.0 | Safetensors; sin especializacion en seguridad y con rechazos intactos |

La diferencia funcional entre la v9 y su base no esta en la capacidad bruta, sino en la especializacion de dominio y en la eliminacion de rechazos. Frente a la v8, la v9 sacrifica profundidad de razonamiento (la propia model card estima que un denso de 3B tiene alrededor de una decima parte de la capacidad semantica del MoE de 35B) a cambio de ejecutarse en dispositivos moviles.

## Limitaciones y advertencias

- Capacidad de razonamiento limitada: la model card advierte explicitamente de que un denso de 3B rinde alrededor de una decima parte del MoE de 35B de la v8; cabe esperar sugerencias solidas de primera pasada, no razonamiento multi-paso profundo.
- Modelo abliterated: se ha eliminado la direccion de rechazo, de modo que puede producir contenido ofensivo sin filtros. No debe desplegarse como asistente de proposito general ni sin supervision.
- Doble uso y riesgo legal: las tecnicas documentadas (explotacion web, SSRF contra metadatos de cloud, RCE, abuso de JWT) solo son legitimas en programas con alcance autorizado o en laboratorio. El usuario es responsable del cumplimiento normativo.
- Riesgo de alucinacion: no se han publicado benchmarks que cuantifiquen la fiabilidad; en seguridad, una sugerencia incorrecta sobre una vulnerabilidad o una version de herramienta puede invalidar una prueba o generar ruido en un reporte.
- Contexto limitado en el diseno: el preprocesado filtra los ejemplos a 4.096 tokens porque "la inferencia movil rara vez necesita contexto largo", lo que sugiere un objetivo de uso de ventana corta. El contexto real de inferencia no se confirma en la informacion disponible.
- Cobertura de idiomas reducida: solo espanol e ingles, y con un reparto funcional fijo (explicaciones en espanol, payloads y comandos en ingles).
- Vision no ajustada: la comprension de imagen es la del modelo base; el ajuste no la mejora ni la especializa en capturas de seguridad.
- Datos de entrenamiento no publicados: el dataset es privado y la model card esta truncada, lo que impide auditar la composicion real del corpus y los sesgos asociados.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa por parte de la comunidad.
- Reglas operativas condicionadas: las salvaguardas (alcance autorizado, throughput limitado, PoCs no destructivos) solo se activan si se proporciona el system prompt adecuado; sin el, no hay garantia de que se apliquen.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero no exime de responsabilidad sobre el uso del modelo ni sobre las obligaciones de las plataformas de bug bounty.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mmp2055/Qwen2.5-VL-3B-uncensored-bughunter-v9
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Iteracion v8 de la serie (MoE de 35B): https://huggingface.co/mmp2055/Qwen3.5-35B-A3B-uncensored-bughunter-v8
- Metodo de abliteration de referencia: https://huggingface.co/blog/mlabonne/abliteration
- llama.cpp: https://github.com/ggml-org/llama.cpp
- LM Studio: https://lmstudio.ai/

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos resultados obtenidos corresponden a sitios de una bodega de vino y no guardan relacion con el contenido de esta ficha.
