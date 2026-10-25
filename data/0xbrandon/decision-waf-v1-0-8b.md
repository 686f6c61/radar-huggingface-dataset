# 0xBrandon/Decision-WAF-V1-0.8B

## Resumen

Decision-WAF-V1-0.8B es un clasificador compacto de peticiones HTTP disenado para actuar como una capa de decision dentro de un web application firewall (WAF). Lo desarrolla 0xBrandon y se obtiene por fine-tuning del modelo base Qwen/Qwen3.5-0.8B-Base mediante LoRA (r=64, alfa=128, unos 43M de parametros entrenables) fusionado en los pesos finales. El modelo recibe una unica peticion HTTP —metodo, ruta, query y cabeceras, sin inspeccionar el cuerpo— y responde con un unico token en forma de letra, que el ingress del proyecto decision-waf interpreta como una distribucion de probabilidad sobre ocho categorias: benign, auth_abuse, file_access, injection, other_attack, recon, ssrf_redirect y xss.

El problema que aborda es el de la clasificacion por peticion en el borde con latencias muy bajas y una tasa de falsos positivos controlable. Segun la model card, sustituye a un modelo de decision generico de 4B (h2o-lightning-4b) con un modelo 5 veces mas pequeno, aproximadamente 7 veces mas rapido y con mejor compromiso precision/recall para la operativa real de un WAF. El modelo tiene 852.985.920 parametros (~853M) y un repo de 1,7 GB en safetensors, con una version GGUF cuantizada en Q8_0 de unos 812 MB.

Es relevante ahora porque propone un patron poco habitual: reutilizar un modelo de lenguaje pequeno como cabecera de clasificacion de una sola respuesta, servido con llama.cpp y con metadatos de decision embebidos en el propio GGUF, en lugar de depender de un modelo generativo mayor. Es, ademas, un ejemplo de fine-tuning muy especializado sobre datos sinteticos y curados (~129k peticiones etiquetadas) con particion de evaluacion estrictamente separada por huellas de request-line, valores de query y valores de cabecera.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-0.8B-Base); el autor no detalla la arquitectura interna mas alla del modelo base |
| Parametros totales | 852.985.920 (~853M) |
| Parametros activos | no disponible (no es un modelo MoE; el autor no reporta parametros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q8_0 (~812 MB) publicado por el autor; otros formatos de cuantizacion no disponibles |
| Idiomas soportados | no disponible (no declarados en la model card ni en los tags) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos fusionados en el repo) y GGUF (Q8_0, con metadatos `qwen35.decision.*` y plantilla de chat `systemone`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B-Base, un transformer de 853M de parametros, y se adapta mediante LoRA con rango 64 y alfa 128 (aproximadamente 43M de parametros entrenables), que posteriormente se fusionan en los pesos del modelo base. La innovacion funcional no esta en la arquitectura, sino en el formato de salida: se entrena una lectura de cabecera de clasificacion de un unico token, calculando la perdida unicamente sobre el token de respuesta. El autor reporta 3.988 pasos de entrenamiento, aproximadamente 12,4 horas, en una unica GPU RTX 4000 SFF Ada.

Los datos de entrenamiento consisten en aproximadamente 129.000 peticiones HTTP etiquetadas, con el conjunto de evaluacion estrictamente reservado mediante huellas (fingerprints) de linea de peticion, valores de query y valores de cabecera. El autor no especifica la composicion exacta del dataset, la proporcion de datos sinteticos frente a curados, ni si se aplicaron etapas de RLHF o DPO; esos datos no estan disponibles en la informacion proporcionada. En el proceso de conversion a GGUF hay que excluir los tensores especulativos NextN (`--no-nextn`), lo que indica que el modelo base incorpora cabeceras de prediccion multi-token; ademas, los metadatos de decision deben estar presentes o los endpoints de decision no se registran.

## Capacidades

- Clasificacion de peticiones HTTP en ocho categorias cerradas: benign, auth_abuse, file_access, injection, other_attack, recon, ssrf_redirect y xss.
- Inspeccion de metodo, ruta, query y cabeceras; el cuerpo de la peticion queda explicitamente fuera de alcance en el modo de inspeccion actual.
- Salida de un unico token en forma de letra, que el ingress convierte en una distribucion de probabilidad sobre categorias; la puntuacion de ataque se define como 1 - p(benign).
- Umbral de decision ajustable sobre la puntuacion de ataque, con un rango recomendado de 0,001 a 0,05 segun la evaluacion del autor.
- Deteccion de cargas utiles transportadas en cabeceras, como Log4Shell y Shellshock, segun la model card.
- Manejo correcto declarado de peticiones benignas con clientes no-navegador, URL de servicios conocidos en parametros y terminos de busqueda con aspecto de codigo.
- No es un detector de exploits ni sustituye al parcheo; se plantea como una senal mas dentro de una defensa en profundidad.
- Soporte de tool calling, agentes, vision, audio o modo de razonamiento explicito: no disponible segun la informacion proporcionada.

## Casos de uso

- WAF en el borde por peticion: el modelo emite un veredicto block-or-allow en un unico forward pass, y el operador fija el umbral sobre 1 - p(benign) segun su tolerancia a falsos positivos. Es adecuado porque la latencia medida es de ~30 ms por clase en una RTX 4000 SFF Ada, compatible con inspeccion en linea.
- Filtrado previo a balanceadores o API gateways: desplegado como ingress delante de servicios reales, junto a TLS, autenticacion y copias de seguridad, aportando una senal de clasificacion barata antes de que la peticion llegue al backend.
- Deteccion de fuerza bruta y abuso de autenticacion: la categoria auth_abuse permite enrutar a un segundo factor o a un rate limit mas agresivo las peticiones clasificadas como sospechosas en endpoints de login.
- Deteccion de inyeccion SQL/NoSQL y comandos: la categoria injection se usa para marcar peticiones cuyo path, query o cabeceras contienen patrones de inyeccion, con el umbral bajo recomendado para priorizar recall.
- Deteccion de XSS reflejado: la categoria xss permite marcar peticiones con cargas utiles en parametros antes de que lleguen a plantillas o motores de renderizado.
- Deteccion de SSRF y redirecciones abiertas: la categoria ssrf_redirect sirve para senalar peticiones que intentan forzar al servidor a resolver destinos internos o externos no previstos.
- Reconocimiento y enumeracion: la categoria recon ayuda a identificar escaneos de rutas y descubrimiento de endpoints (segun la evaluacion, 20 de 30 casos detectados con umbral 0,9).
- Enriquecimiento de logs y auditoria: al ser una clasificacion de un token, puede ejecutarse sobre trafico historico para etiquetar retroactivamente peticiones y alimentar paneles de triaje, manteniendo los logs de auditoria exigidos por la propia model card.

## Benchmarks y rendimiento

Conjunto de evaluacion: 299 peticiones (145 benignas, 154 de ataque), mismo harness para todos los modelos. La puntuacion de ataque es 1 - p(benign).

| Umbral | h2o-lightning-4b (recall / FPR) | d1-3B (recall / FPR) | Decision-WAF-V1-0.8B (recall / FPR) |
|---|---|---|---|
| 0,05 | 1,000 / 1,000 | 1,000 / 1,000 | 0,838 / 0,007 |
| 0,10 | 0,994 / 0,517 | 1,000 / 0,945 | 0,831 / 0,007 |
| 0,20 | 0,968 / 0,248 | 0,994 / 0,621 | 0,825 / 0,007 |
| 0,35 | 0,961 / 0,221 | 0,909 / 0,159 | 0,825 / 0,000 |
| 0,50 | 0,955 / 0,207 | 0,799 / 0,055 | 0,799 / 0,000 |
| 0,70 | 0,922 / 0,152 | 0,636 / 0,028 | 0,792 / 0,000 |
| 0,80 | 0,903 / 0,131 | 0,565 / 0,007 | 0,773 / 0,000 |
| 0,90 | 0,896 / 0,055 | 0,461 / 0,000 | 0,766 / 0,000 |
| 0,95 | 0,857 / 0,041 | 0,338 / 0,000 | 0,747 / 0,000 |

| Modelo | Mejor F1 | Umbral | Precision / Recall / FPR | Mejor recall con FPR <= 1% |
|---|---|---|---|---|
| h2o-lightning-4b | 0,920 | 0,90 | 0,945 / 0,896 / 0,055 | ninguno (FPR minimo 4,1%) |
| d1-3B | 0,883 | 0,35 | 0,859 / 0,909 / 0,159 | 0,565 |
| Decision-WAF-V1-0.8B | 0,936 | 0,001 | 0,979 / 0,896 / 0,021 | 0,851 |

Recall por etiqueta con umbral 0,9, reportado por el autor: auth_abuse 3/8, ssrf_redirect 5/10, recon 20/30, injection 51/63. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de proposito general en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en safetensors bf16: aproximadamente 1,7 GB para los pesos (coincide con el tamano del repo), mas overhead de runtime.
- VRAM estimada en GGUF Q8_0: aproximadamente 812 MB de pesos; en la practica alrededor de 1 GB incluyendo contexto y buffers de llama.cpp.
- GPU recomendadas: el autor reporta ~30 ms por clase en una RTX 4000 SFF Ada; por tamano, cualquier GPU consumer con 2 GB o mas de VRAM libre es suficiente (RTX 3060, RTX 4060, RTX 4090, etc.).
- Cabe en GPU consumer: si, con margen amplio; tambien se ha validado en CPU/Apple Silicon (Apple M4 con ~0,67 s de mediana).
- Despliegue: llama.cpp mediante `llama-server` (build >= 11822) con los metadatos de decision embebidos en el GGUF y la plantilla de chat `systemone`, puntuando a traves del endpoint `/v1/systemone`. El autor no documenta soporte para vLLM, TGI, Ollama ni otros servidores; no disponible.
- Al convertir desde safetensors hay que excluir los tensores NextN (`--no-nextn`) y conservar los metadatos de decision, o los endpoints de decision no se registran.
- Throughput: no disponible; solo se publican latencias medianas (~30 ms por clase en RTX 4000 SFF Ada, ~0,67 s en Apple M4).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Mejor F1 | Recall @ FPR <= 1% | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Decision-WAF-V1-0.8B | ~853M | no disponible | 0,936 (umbral 0,001) | 0,851 | Apache 2.0 | safetensors + GGUF Q8_0 (~812 MB) |
| h2o-lightning-4b | ~4B (segun el autor) | no disponible | 0,920 (umbral 0,90) | no alcanza FPR <= 1% (minimo 4,1%) | no disponible en la informacion dada | usado como referencia en decision-waf-eval |
| d1-3B | ~3B (segun el autor) | no disponible | 0,883 (umbral 0,35) | 0,565 | no disponible en la informacion dada | usado como referencia en decision-waf-eval |

La comparacion se limita a los dos modelos que el autor usa como referencia en el mismo harness de evaluacion. No se dispone de datos para comparar con clasificadores WAF especializados de otros fabricantes ni con modelos genericos de la misma categoria.

## Limitaciones y advertencias

- Sesgo conservador: infradetecta ataques entregados por clientes de aspecto normal sobre endpoints normales. El propio autor reporta recall bajo por etiqueta con umbral 0,9: auth_abuse 3/8, ssrf_redirect 5/10, recon 20/30, injection 51/63.
- Solo cabeceras: los ataques transportados en el cuerpo de la peticion quedan fuera de alcance en el modo de inspeccion actual, lo que excluye buena parte de los ataques a APIs JSON y formularios.
- Entrenado con datos curados y sinteticos: el desplazamiento de distribucion (aplicaciones nuevas, formas de API inusuales, codificaciones distintas) puede mover el error en ambas direcciones; requiere monitorizacion y reentrenamiento.
- Un clasificador WAF puede ser evadido y puede clasificar mal; el autor insiste en usarlo como una capa mas, mantener logs de auditoria y no dejarlo nunca como unica proteccion entre internet y un servicio vulnerable.
- No es un detector de exploits ni sustituye al parcheo de vulnerabilidades.
- El conjunto de evaluacion es pequeno (299 peticiones) y esta generado por el mismo autor; las cifras de F1 y FPR deben interpretarse con esa cautela.
- El despliegue depende de metadatos y una plantilla de chat especificos del proyecto decision-waf; sin ellos los endpoints de decision no se registran, lo que limita la portabilidad a otros servidores de inferencia.
- Idiomas soportados no declarados; el modelo opera sobre peticiones HTTP, habitualmente ASCII, pero no hay garantia documentada sobre trafico con codificaciones o alfabetos no latinos.
- Discrepancia de metadatos: el pipeline declarado en HuggingFace es image-text-to-text, mientras que la model card describe exclusivamente clasificacion de texto (peticiones HTTP). No hay informacion sobre capacidades multimodales reales.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene revisar los terminos del modelo base Qwen3.5-0.8B-Base.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay validacion independiente por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/0xBrandon/Decision-WAF-V1-0.8B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Repositorio del proyecto decision-waf: https://github.com/0x4272616E646F6E/decision-waf
