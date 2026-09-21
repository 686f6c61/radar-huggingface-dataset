# kataguru/Qwen3.8-27B-TWIN-TURBO-Fable-Finnish-GGUF

## Resumen

Qwen3.8-27B-TWIN-TURBO-Fable-Finnish-GGUF es un repositorio de cuantizaciones GGUF creado por el usuario kataguru a partir del modelo DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored. Se trata de un ajuste fino orientado al finlandes, con 27.320.697.856 parametros (27,3B) y pesos de origen en BF16, publicado bajo licencia apache-2.0 y con soporte para finlandes e ingles. El repo incluye cuatro niveles de cuantizacion (Q5_K_M, Q4_K_M, IQ4_XS y Q3_K_M) generados con llama.cpp b11064, con tamanos que van de 18,2 GB a 12,6 GB, pensados para ejecucion local en GPU de consumo.

El modelo resuelve un nicho concreto: generacion de texto en finlandes con morfologia, casos gramaticales y registro estilistico nativos, evitando la "rigidez de traduccion" que suelen mostrar los modelos entrenados mayoritariamente en ingles. Anade ademas un sistema de niveles de razonamiento controlables mediante marcas en el prompt (`{REASON:low}`, `{REASON:medium}`, `{REASON:xhigh}`, `{REASON:spoon}`, `{REASON:einstein}`) y una plantilla de chat Jinja integrada que detecta roles e idioma.

Su relevancia es limitada y hay que contextualizarla con honestidad: en el momento de la consulta el repositorio acumula 0 descargas y 0 "me gusta", no publica ningun resultado de benchmarks y depende de una cadena de ajustes finos "uncensored" de terceros. Es, por tanto, un artefacto experimental para despliegue local en finlandes, no un modelo validado para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8 / Qwen2.5 hybrid + attention + Mamba/GDN + MTP (segun la model card) |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no aplica: la model card no describe un esquema MoE |
| Longitud de contexto | no disponible como cifra oficial; la model card describe escenarios de 32k, 64k y 128k+ segun VRAM disponible |
| Tipos de cuantizacion | GGUF: Q5_K_M (5,72 BPW), Q4_K_M (4,92 BPW), IQ4_XS (4,51 BPW), Q3_K_M (3,95 BPW). Existe una variante AWQ W4A16 en un repo hermano |
| Idiomas soportados | finlandes (fi) e ingles (en) |
| Licencia | apache-2.0 (declarada en el repo; la licencia del modelo base no se detalla) |
| Formato de pesos | GGUF (llama.cpp b11064). Los pesos de origen son BF16 en safetensors; este repo no distribuye safetensors |
| Tamano del repositorio | 65,3 GB |
| Pipeline | text-generation |
| Fecha de creacion | 2026-09-20 |

## Arquitectura y entrenamiento

La model card describe la arquitectura como "Qwen3.8 / Qwen2.5 hybrid + attention + Mamba/GDN + MTP", es decir, un esquema hibrido que combina capas de atencion con capas de estado recurrente tipo Mamba/Gated DeltaNet, mas prediccion multi-token (MTP). No se aportan detalles sobre el numero de capas, dimension oculta, numero de cabezas ni el reparto entre atencion y capas recurrentes, por lo que esos datos quedan como no disponibles. El modelo deriva de un ajuste fino de DavidAU ("Cold-Fusion-709-ULTRA-HERETIC"), que a su vez parte de la familia Qwen; este repositorio no entrena ni modifica pesos, solo cuantiza los BF16 originales con llama.cpp.

No hay informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o similares. La unica innovacion documentada en la model card es de inferencia y plantilla: la plantilla de chat Jinja integrada y el sistema de niveles de razonamiento `{REASON:...}`. Por defecto el modelo responde de forma directa sin bloque `<think>`; al anteponer `{REASON:low}`, `{REASON:medium}` o `{REASON:xhigh}` se activan cadenas de razonamiento de profundidad creciente, mientras que `{REASON:spoon}` describe un proceso de "investigacion profunda" de 7 fases con panel de expertos, hipotesis y sintesis, y `{REASON:einstein}` un brainstroming creativo basado en 10 perspectivas de Sternberg. Estas etiquetas son convenciones de prompt declaradas por el autor, no funciones verificadas de forma independiente.

## Capacidades

- Generacion de texto conversacional en finlandes e ingles, con enfasis declarado en morfologia finlandesa, casos gramaticales y registro estilistico natural.
- Prosa tecnica y de divulgacion: respuestas de tipo IT y programacion, ensayo, filosofia y escritura creativa o narrativa.
- Razonamiento controlable por niveles mediante las marcas `{REASON:low}`, `{REASON:medium}`, `{REASON:xhigh}`, `{REASON:spoon}` y `{REASON:einstein}`.
- Prediccion multi-token (MTP) como parte declarada de la arquitectura, orientada a la generacion de tokens.
- Plantilla de chat Jinja integrada que reconoce roles y gestiona automaticamente el idioma.
- Modo "uncensored": el autor declara ausencia de moralizacion, avisos de responsabilidad o rechazos ante temas complejos o de ficcion.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado mas alla de los niveles de razonamiento descritos.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Generacion de contenido en finlandes para medios y marketing: redaccion de articulos, fichas de producto y boletines con gramatica y estilo nativos, aprovechando el ajuste especifico en finlandes en lugar de recurrir a un modelo generalista obligado a traducir.
- Traduccion y postedicion ingles-finlandes: el modelo cubre ambos idiomas declarados, por lo que sirve como motor de traduccion asistida y de revision de textos traducidos, corrigiendo calcos del ingles.
- Asistente de documentacion tecnica localizado: generacion y mantenimiento de manuales, README y guias de API en finlandes para equipos de desarrollo, con la ventana de contexto ampliable a 32k-64k tokens en GPU de 24 GB.
- Escritura creativa y narrativa larga: el modo "uncensored" evita rechazos en ficcion con violencia, drama o tematicas adultas, y el contexto amplio permite mantener arcos narrativos coherentes.
- Analisis y sintesis de documentos extensos (contratos, informes, tesis) en finlandes: los niveles `{REASON:medium}` y `{REASON:xhigh}` permiten ajustar el coste de computo al nivel de profundidad analitica requerido, y `{REASON:spoon}` esta pensado para sintesis multifase.
- Despliegue en estaciones de trabajo sin GPU de datacenter: con la cuantizacion Q3_K_M (12,6 GB) el modelo cabe en una RTX 4080 de 16 GB con cache KV en FP8/Q8, lo que habilita prototipado local de asistentes en finlandes.
- Aplicaciones de chat privado on-premise: al ejecutarse con llama.cpp, LM Studio u Ollama, ningun dato sale del equipo, algo relevante para sectores con requisitos de confidencialidad en Finlandia.
- Brainstorming y generacion de hipotesis: el perfil `{REASON:einstein}` esta disenado por el autor para producir soluciones radicales en sesiones de ideacion, util como generador de borradores que luego filtra un humano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna tabla de evaluacion (MMLU, HumanEval, GSM8K ni equivalentes en finlandes), el repositorio registra 0 descargas y 0 "me gusta" en el momento de la consulta, y la busqueda web realizada no devolvio ninguna fuente tecnica relevante sobre este modelo. No se dispone tampoco de datos de latencia o throughput.

## Requisitos de hardware

- Q5_K_M (18,2 GB, 5,72 BPW): 24 GB de VRAM. GPU tipo RTX 3090, RTX 4090, RTX 5090, o Mac con 32 GB o mas de memoria unificada. Perfil de maxima fidelidad linguistica.
- Q4_K_M (15,6 GB, 4,92 BPW): 20-24 GB de VRAM o 32 GB de RAM. Es la opcion recomendada por el autor por su equilibrio entre velocidad, tamano y calidad.
- IQ4_XS (14,4 GB, 4,51 BPW): 16-20 GB de VRAM. Perfil compacto de 4 bits con matriz de importancia.
- Q3_K_M (12,6 GB, 3,95 BPW): 16 GB de VRAM (RTX 4080, RTX 4070 Ti Super) o Mac de 16-24 GB.
- Cache KV: la model card estima aproximadamente 256 KB por token en FP16 para este modelo de 27B. En una GPU de 16 GB, Q3_K_M deja unos 3 GB libres, por lo que se recomienda cuantizar la cache KV a FP8/Q8 (en LM Studio, "Context Quantization"; en llama.cpp, `-ctk q8_0 -ctv q8_0`) para alcanzar de forma estable 32k-64k tokens de contexto.
- Contextos de 128k o superiores: requieren 24 GB o mas de VRAM, o bien offload parcial a CPU, con la penalizacion de velocidad correspondiente.
- Opciones de despliegue: llama.cpp (versiones posteriores a b11064) con `llama-server`; LM Studio mediante busqueda directa del repositorio; Ollama mediante un Modelfile con `temperature 0.6`, `top_p 0.95` y las cadenas de parada `<|im_end|>` y `<|endoftext|>`. Para vLLM esta prevista la variante AWQ W4A16 publicada en un repositorio hermano.
- Cabe en GPU de consumo: si. RTX 4080 o 4070 Ti Super con Q3_K_M, y RTX 3090/4090/5090 con Q4_K_M o Q5_K_M.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de benchmarks ni de competidores directos, por lo que la comparativa se limita a las variantes de la misma familia disponibles en HuggingFace.

| Modelo | Parametros | Formato | Contexto | Licencia | Uso previsto |
|---|---|---|---|---|---|
| kataguru/Qwen3.8-27B-TWIN-TURBO-Fable-Finnish-GGUF | 27,3B | GGUF (Q5_K_M, Q4_K_M, IQ4_XS, Q3_K_M) | no disponible oficialmente; escenarios de 32k-128k+ segun VRAM | apache-2.0 (declarada) | Inferencia local en CPU/GPU con llama.cpp, LM Studio u Ollama |
| kataguru/Qwen3.8-27B-TWIN-TURBO-Fable-Finnish-W4A16-AWQ | no disponible | AWQ W4A16 | no disponible | no disponible | Inferencia optimizada en vLLM |
| DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored | 27,3B (pesos de origen en BF16) | safetensors BF16 | no disponible | no disponible | Modelo base sin cuantizar del que derivan las dos variantes anteriores |

No se dispone de datos para comparar con alternativas de otros autores del mismo rango de parametros (por ejemplo, otros modelos abiertos de ~27B con soporte de finlandes), ni de metricas de calidad que permitan establecer una jerarquia.

## Limitaciones y advertencias

- Ausencia total de validacion: 0 descargas y 0 "me gusta" en el momento de la consulta, y ninguna evaluacion publicada. No hay evidencia independiente de su calidad en finlandes ni en ninguna otra tarea.
- Riesgo de alucinacion: no se han publicado mediciones de veracidad. Como modelo generativo de 27B sin evaluacion, es esperable que produzca afirmaciones incorrectas con seguridad, especialmente en dominios especializados y en un idioma de bajos recursos como el finlandes.
- Modo "uncensored": el ajuste elimina deliberadamente rechazos y avisos de seguridad. Esto incrementa el riesgo de generar contenido ofensivo, ilegal o danino, y hace inadecuado su uso sin filtros adicionales en aplicaciones orientadas al publico general o a menores.
- Cadena de dependencias poco trazable: el modelo depende de un ajuste fino de terceros ("Cold-Fusion-709-ULTRA-HERETIC") sobre la familia Qwen. No se documentan el dataset de ajuste, los hiperparametros ni los criterios de filtrado, lo que dificulta la auditoria.
- Licencia: el repositorio declara apache-2.0, pero no se especifica la licencia del modelo base ni la de los pesos originales de Qwen subyacentes. Antes de un uso comercial conviene verificar la cadena completa de licencias, ya que una declaracion en la model card no sustituye a la licencia del artefacto del que se deriva.
- Cobertura idiomatica limitada: solo finlandes e ingles. No hay soporte declarado de castellano, por lo que no es adecuado para productos multilingues fuera de ese par.
- Sesgos: no se ha publicado ningun analisis de sesgos. Un ajuste "uncensored" con datos no documentados puede amplificar sesgos presentes en el corpus de ajuste, y el ingles actua como idioma dominante en la mayoria de modelos de esta familia.
- Dependencia de la plantilla de chat: las etiquetas `{REASON:...}` y el comportamiento de la plantilla Jinja son convenciones del autor. Su efecto real no esta verificado y puede variar entre versiones de llama.cpp, LM Studio u Ollama.
- Consumo de memoria de la cache KV: con 256 KB por token en FP16, contextos largos agotan rapidamente la VRAM de tarjetas de 16 GB; sin cuantizacion de cache a FP8/Q8 el modelo no alcanzara los 32k-64k tokens indicados.
- Compatibilidad de arquitectura: al tratarse de una arquitectura hibrida con Mamba/GDN y MTP, el soporte depende de una version reciente de llama.cpp (b11064 o posterior). Versiones antiguas o runtimes alternativos pueden fallar al cargar el GGUF.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kataguru/Qwen3.8-27B-TWIN-TURBO-Fable-Finnish-GGUF
- Variante AWQ W4A16 para vLLM: https://huggingface.co/kataguru/Qwen3.8-27B-TWIN-TURBO-Fable-Finnish-W4A16-AWQ
- Modelo base (pesos BF16): https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored
- Herramienta de cuantizacion: llama.cpp (b11064), https://github.com/ggml-org/llama.cpp
- La busqueda web realizada no devolvio ningun enlace tecnico relevante sobre este modelo: los resultados obtenidos correspondian a documentacion de la funcion QUERY de Google Sheets y a hilos de un foro de traduccion, sin relacion con el artefacto. No hay papers, blogs ni demos adicionales que citar.
