# 0xSojalSec/REDCELL-26B-A4B-OSINT-Cyber

## Resumen

REDCELL-26B-A4B-OSINT-Cyber es un ajuste fino supervisado (SFT) del modelo Gemma 4 26B-A4B de Google, una arquitectura transformer con mezcla de expertos (MoE) de aproximadamente 26.000 millones de parametros totales y unos 4.000 millones activos por token. El ajuste ha sido desarrollado por el autor que firma como terrorswift y esta publicado en el repositorio de Hugging Face de 0xSojalSec. Su objetivo declarado es orientar el modelo hacia inteligencia de fuentes abiertas (OSINT), inteligencia de amenazas ciberneticas (CTI) y periodismo de investigacion, sustituyendo las respuestas evasivas por metodologia de analista senior.

El modelo hereda del base una ventana de contexto de 262.144 tokens, capacidad multimodal (etiquetas `vision` y `multimodal`) y el pipeline de generacion de texto. El ajuste se realizo mediante LoRA de 16 bits sobre el modelo base de unsloth, con un dataset propio estructurado en 4 ejes de dominio y 33 subcategorias. Segun la model card, no se ha aplicado abliteration ni un censurado selectivo: el comportamiento de seguridad general se mantiene intacto y el modelo sigue siendo de proposito general restringido al dominio, no un modelo sin censura.

Su relevancia practica esta en el empaquetado: los pesos se distribuyen principalmente en formato GGUF con perfiles de cuantizacion propios (familia APEX) que van de 11,4 GB a 47 GB, lo que permite ejecutar un MoE de 26B en hardware de consumo. El repositorio ocupa 202,1 GB e incluye pesos safetensors y GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), familia Gemma 4 |
| Parametros totales | 25.233.142.046 (~25,2 B) segun safetensors; el autor declara 26 B |
| Parametros activos | ~4 B (segun model card) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | F16, Q8_0 y perfiles APEX: I-Balanced y Balanced (Q5_1 / Q8_0 / Q6_K), I-Quality y Quality (IQ4_NL / Q8_0 / Q6_K), I-Compact y Compact (Q4_0 / Q5_0 / Q4_K), Mini (IQ4_NL / Q5_0 / Q3_K) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y GGUF (F16, Q8_0, APEX) |
| Modelo base | unsloth/gemma-4-26B-A4B-it |
| Metodo de ajuste | LoRA de 16 bits, fine-tuning supervisado (SFT) |
| Dominio | OSINT, CTI, periodismo de investigacion |
| Desarrollado por | terrorswift (publicado en el repositorio de 0xSojalSec) |
| Pipeline | text-generation |
| Modalidad | texto y vision (etiquetas `vision` y `multimodal` en el modelo base) |
| Tamano del repositorio | 202,1 GB |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La arquitectura subyacente es Gemma 4 en configuracion de mezcla de expertos, con unos 26.000 millones de parametros totales y aproximadamente 4.000 millones activos por token, lo que reduce el coste de inferencia respecto a un denso del mismo tamano. La model card no detalla el numero de expertos, la politica de enrutamiento, el tipo de atencion ni si se emplean capas hibridas; esos datos no estan disponibles en la informacion proporcionada. El modelo base incorpora capacidades multimodales, segun las etiquetas del repositorio, aunque el ajuste se documenta como orientado a generacion de texto.

El entrenamiento consistio en un fine-tuning supervisado mediante LoRA de 16 bits sobre el modelo base de unsloth, con un dataset propio organizado en 4 ejes de dominio y 33 subcategorias. No se especifica el volumen de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo etapas de RLHF o DPO; esos datos no estan disponibles. El autor indica explicitamente que el modelo no ha sido sometido a abliteration ni a un proceso de eliminacion de rechazos, de modo que el comportamiento de seguridad se hereda del base.

La innovacion tecnica destacable esta en la cadena de cuantizacion APEX descrita en la model card. Los perfiles con prefijo `I-` se cuantizaron con una matriz de importancia (imatrix) y son identicos en tipos y tamano a sus equivalentes sin `I`. El autor advierte que varios tensores de expertos enrutados de Gemma 4 no tienen filas divisibles por 256, por lo que `llama-quantize` degrada los tipos solicitados (por ejemplo Q5_K o IQ4_XS) a los formatos compatibles de bloques de 32 elementos (Q5_1, Q4_0, Q5_0, IQ4_NL). Este fallback afecta a 60 tensores en el conjunto de perfiles. Ademas, la receta protege las primeras cinco capas manteniendolas un escalon de precision por encima del valor por defecto del perfil.

## Capacidades

- Generacion de texto analitico estructurado con tono de analista profesional: evaluacion, metodologia y conclusiones separadas.
- Razonamiento multi-paso orientado a investigacion: descomposicion de un problema en fases de recoleccion, correlacion y verificacion.
- Calibracion explicita de confianza ("confianza moderada basada en...", "confianza alta dado...") en cada evaluacion.
- Aplicacion del sistema Admiralty de clasificacion de fuentes (A-F para fiabilidad de la fuente, 1-6 para credibilidad de la informacion).
- Manejo de identificadores reales del dominio: tecnicas de MITRE ATT&CK, formato de CVE, herramientas de reconocimiento pasivo (Shodan, Censys, VirusTotal, SecurityTrails, crt.sh, urlscan.io, OpenCorporates, OpenSanctions).
- Capacidad multimodal heredada del modelo base, segun las etiquetas `vision` y `multimodal`; el alcance concreto sobre imagenes no esta documentado en el ajuste.
- Soporte de conversacion multi-turno con contexto de hasta 262.144 tokens.
- Capacidad de senalar explicitamente los limites de su propio conocimiento en lugar de fabricar respuestas, segun el prompt de sistema recomendado.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Capacidades de agente autonomo: no documentadas en la informacion disponible.
- Idiomas: solo ingles declarado.

## Casos de uso

- Analisis de inteligencia de amenazas: el modelo puede transformar informes de incidentes y avisos de vendors en resumenes estructurados con tecnicas de MITRE ATT&CK mapeadas, calibrando la confianza de cada atribucion y senalando que evidencia falta por confirmar.
- Perfilado de actores de amenaza: a partir de infraestructura conocida, dominios y certificados, el modelo puede generar una hipotesis de atribucion aplicando el sistema Admiralty y proponiendo pasos de verificacion pasiva con herramientas como Shodan o Censys.
- Triaje de vulnerabilidades: dado un conjunto de CVE y avisos, el modelo puede priorizar por exposicion real, describir vectores de ataque en formato consistente y redactar la justificacion para el equipo de parcheo, evitando inventar identificadores.
- Investigacion periodistica de fuentes abiertas: verificacion de entidades corporativas mediante registros publicos (OpenCorporates, OpenSanctions), reconstruccion de cadenas de titularidad y documentacion del proceso de verificacion con grados de certeza explicitos.
- Respuesta a incidentes en un CERT: redaccion de notas de incidente y cronologias multi-fuente a partir de logs y correos, manteniendo la distincion entre hechos confirmados, indicios no verificados y datos pendientes de confirmacion.
- Due diligence y cumplimiento: cribado de contrapartes, deteccion de senales de sanciones y elaboracion de memorandos con trazabilidad de fuentes y nivel de confianza por afirmacion.
- Redaccion de informes de red team y pentesting autorizado: estructura de hallazgos, impacto, evidencia y recomendaciones, con aviso explicito cuando un paso propuesto implica recoleccion activa o riesgo legal.
- Monitorizacion de superficies de exposicion: sintesis periodica de cambios en certificados, subdominios y activos publicados, con referencias a las fuentes originales para su verificacion manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de evaluaciones especificas de ciberseguridad, y tampoco se aportan comparaciones cuantitativas con el modelo base.

## Requisitos de hardware

Estimaciones de VRAM para inferencia, calculadas a partir de los tamanos de archivo declarados. En todos los casos hay que sumar la cache KV, que escala con la longitud de contexto y puede ser determinante si se usa la ventana completa de 262.144 tokens.

- APEX-Mini (11,4 GB en disco): aproximadamente 13-14 GB de VRAM con contexto corto. Cabe en GPUs de 16 GB (RTX 4060 Ti 16 GB, RTX 5070 Ti) y con dificultad en tarjetas de 12 GB reduciendo contexto y con cache KV cuantizada.
- APEX-Compact / APEX-Quality (13,7 GB y 18,4 GB): ajustadas a GPUs de 24 GB (RTX 4090, RTX 3090) y superiores. El perfil Quality pedira recortar contexto o cuantizar la cache KV en tarjetas de 24 GB.
- APEX-Balanced (19,2 GB): el perfil recomendado por el autor como opcion por defecto; requiere 24 GB de VRAM para un uso comodo.
- Q8_0 (25,0 GB): requiere GPUs de 32-48 GB (RTX 5090, A6000, L40S) o reparto entre varias tarjetas.
- F16 (47,0 GB): requiere H100 80 GB, A100 80 GB o configuraciones multi-GPU.
- Despliegue: llama.cpp y derivados para los pesos GGUF (Ollama, LM Studio, llama-cpp-python); servidores tipo vLLM o TGI para los pesos safetensors en entornos con GPU de datacenter.
- Latencia y throughput: no disponible. Al ser un MoE con unos 4.000 millones de parametros activos, el coste por token es inferior al de un denso de 26B, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| REDCELL-26B-A4B-OSINT-Cyber | ~25,2 B totales / ~4 B activos | 262.144 | Apache-2.0 | OSINT, CTI, periodismo | GGUF (familia APEX) y safetensors |
| unsloth/gemma-4-26B-A4B-it (base) | ~26 B totales / ~4 B activos | 262.144 | no disponible | Modelo instructivo generalista | no disponible |
| DeepHat V2 (WhiteRabbitNeo) | no disponible | no disponible | no disponible | Seguridad ofensiva, sin censura | no disponible |
| Modelos de seguridad ajustados de la lista Offensive-Security-AI-Models | no disponible | no disponible | no disponible | Red team y pentesting | no disponible |

La informacion disponible no permite una comparacion cuantitativa de rendimiento. La diferencia funcional principal frente al modelo base es la especializacion en tradecraft OSINT y la disponibilidad de cuantizaciones GGUF especificas. Frente a los modelos de seguridad ofensiva de la lista consultada, REDCELL se posiciona explicitamente como un modelo con el comportamiento de seguridad intacto y orientado a investigacion legitima, no como un modelo sin censura.

## Limitaciones y advertencias

- Solo se declara ingles como idioma soportado; el rendimiento en castellano no esta documentado.
- Riesgo de alucinacion en identificadores: el modelo esta entrenado para citar tecnicas MITRE ATT&CK, CVE y URLs de registros reales, pero no hay garantia de que un identificador concreto sea correcto en cada respuesta. La verificacion manual es obligatoria en cualquier uso profesional.
- Sesgos: no se documenta ninguna evaluacion de sesgo ni de equidad. El modelo hereda los sesgos del corpus de entrenamiento de Gemma 4 y del dataset propio, cuya composicion no se detalla.
- Uso dual: las capacidades de OSINT y reconocimiento pasivo pueden emplearse en actividades de vigilancia no autorizada. La model card no define una politica de uso aceptable propia; el prompt de sistema recomienda marcar explicitamente los pasos que cruzan a recoleccion activa o implican riesgo legal o etico.
- No es un modelo sin censura: el autor indica que el comportamiento de seguridad se conserva intacto. Esto limita su uso en escenarios ofensivos que requieran contenido restringido, al contrario que otras alternativas de la misma lista.
- Licencia Apache-2.0: permite uso comercial, modificacion y redistribucion, con obligacion de conservar los avisos de licencia y de copyright. Hay que verificar ademas las condiciones del modelo base y de los datos de entrenamiento, no detalladas en la informacion disponible.
- Ventana de contexto: los 262.144 tokens son la capacidad declarada del arquitectura base; el consumo de cache KV a esa longitud es muy elevado y no se documentan pruebas de recuperacion efectiva en contextos largos.
- Datos incompletos: no hay informacion sobre volumen de tokens de entrenamiento, composicion del dataset, hiperparametros, ni evaluaciones propias del ajuste.
- Advertencia sobre la model card: parte del contenido del repositorio (prompt de sistema y notas de cuantizacion) son afirmaciones del autor, no verificadas de forma independiente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/0xSojalSec/REDCELL-26B-A4B-OSINT-Cyber
- Repositorio de cuantizaciones APEX GGUF: https://huggingface.co/terrorswift/REDCELL-26B-A4B-OSINT-Cyber-APEX-GGUF
- Arbol de archivos del repositorio GGUF: https://huggingface.co/terrorswift/REDCELL-26B-A4B-OSINT-Cyber-APEX-GGUF/tree/main
- Modelo base: https://huggingface.co/unsloth/gemma-4-26B-A4B-it
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Perfil de GitHub del autor: https://github.com/0xSojalSec/
- Proyecto REDCELL en GitHub (plataforma de red team de LLM; no se ha confirmado relacion directa con este modelo): https://github.com/martian56/redcell
- Lista de modelos de seguridad ofensiva: https://imtaqin.id/joasasantos-offensive-security-ai-models-uncensored-llms-for-offensive-security
