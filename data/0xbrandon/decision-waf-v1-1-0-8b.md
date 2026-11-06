# 0xBrandon/Decision-WAF-V1.1-0.8B

## Resumen

Decision-WAF-V1.1-0.8B es un clasificador compacto de peticiones HTTP disenado para actuar como una capa de decision en un web application firewall (WAF). Desarrollado por 0xBrandon, parte del modelo base Qwen/Qwen3.5-0.8B-Base y se ha ajustado mediante LoRA para responder a una unica pregunta: si una peticion es benigna o a que clase de ataque pertenece. La inspeccion cubre metodo, ruta, query y cabeceras, pero no el cuerpo de la peticion.

El modelo devuelve un unico token de letra que el ingress de decision-waf interpreta como una distribucion de probabilidad sobre ocho categorias: benign, auth_abuse, file_access, injection, other_attack, recon, ssrf_redirect y xss. Con 852.985.920 parametros, un repositorio de 1,7 GB y licencia Apache 2.0, esta pensado para veredictos por peticion en el edge con una sola pasada forward y un umbral ajustable sobre la puntuacion de ataque (1 - p(benign)).

Su relevancia actual radica en que ofrece una alternativa de menos de mil millones de parametros con metricas competitivas frente a clasificadores de mayor tamano en el benchmark publicado por el autor, manteniendo latencias de decenas de milisegundos en GPU y de menos de un segundo en hardware Apple. No obstante, el propio autor lo presenta como una senal de defensa en profundidad, no como sustituto de parcheo, autenticacion o TLS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5), ajuste LoRA sobre Qwen/Qwen3.5-0.8B-Base |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (GGUF, ~812 MB); pesos safetensors en el repositorio |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (HF) y GGUF (llama.cpp) |
| Tarea | Clasificacion de texto (text-classification) |
| Categorias de salida | benign, auth_abuse, file_access, injection, other_attack, recon, ssrf_redirect, xss |
| Ambito de inspeccion | Metodo, ruta, query y cabeceras HTTP (sin cuerpo) |
| Modelo base | Qwen/Qwen3.5-0.8B-Base |
| Libreria | transformers |

## Arquitectura y entrenamiento

El modelo es un ajuste fino mediante LoRA (r=64, alpha=128, aproximadamente 43M parametros entrenables) sobre Qwen/Qwen3.5-0.8B-Base, con los pesos del adaptador fusionados en los pesos base. La cabeza de clasificacion se lee como un unico token de respuesta, y la perdida se calcula unicamente sobre ese token de respuesta. El entrenamiento se extendio durante 4.591 pasos (aproximadamente 14,9 horas) en una unica GPU RTX 4000 SFF Ada.

Los datos de entrenamiento comprenden aproximadamente 150.000 peticiones HTTP etiquetadas. El conjunto de evaluacion se mantuvo estrictamente fuera del entrenamiento mediante huellas de linea de peticion, valores de query y valores de cabecera, lo que reduce el riesgo de fuga de informacion entre particiones. El autor advierte que los datos son curados y sinteticos, por lo que el desplazamiento de distribucion puede mover el error en ambas direcciones y hace recomendable monitorizar y reentrenar.

Como innovacion tecnica destacable, el GGUF incorpora metadatos de decision (`qwen35.decision.*`) y la plantilla de chat `systemone`, de modo que el servidor llama.cpp expone un endpoint `/v1/systemone` que puntua las peticiones. En la conversion deben excluirse los tensores especulativos NextN (`--no-nextn`), y los metadatos de decision deben estar presentes para que se registren los endpoints correspondientes.

## Capacidades

- Clasificacion binaria y multiclase de peticiones HTTP en ocho categorias de ataque mas benign.
- Inspeccion de metodo, ruta, query y cabeceras, incluyendo deteccion de payloads transportados en cabeceras como Log4Shell o Shellshock.
- Veredicto por peticion en una sola pasada forward, con puntuacion de ataque configurable (1 - p(benign)) y umbral ajustable.
- Manejo correcto de peticiones benignas con clientes no navegador, URLs de servicios conocidos en parametros y terminos de busqueda con apariencia de codigo.
- Salida como token unico de letra, integrable como distribucion de probabilidad sobre categorias.
- No soporta tool calling ni function calling; no es un modelo de agentes.
- No dispone de modo thinking, vision ni audio; la inspeccion no cubre cuerpos de peticion.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Filtrado perimetral de peticiones en el edge: el modelo clasifica cada peticion entrante en una sola pasada forward y permite bloquear o permitir segun un umbral sobre la puntuacion de ataque, adecuado para despliegues con latencias de 30-70 ms por clase en GPU.
- Deteccion de payloads en cabeceras: al inspeccionar cabeceras HTTP, identifica ataques como Log4Shell o Shellshock transportados en User-Agent u otras cabeceras, un vector que muchos filtros basados solo en ruta o query no cubren.
- Defensa en profundidad delante de servicios expuestos: se integra como una senal adicional junto a TLS, autenticacion y copias de seguridad, aportando una capa de clasificacion independiente que no sustituye al parcheo.
- Triaje de recon y sondas: la categoria recon permite detectar peticiones de reconocimiento (escaneos de rutas, paneles de administracion) y priorizar su revision en los registros de auditoria.
- Clasificacion de trafico en entornos con hardware modesto: con Q8_0 (~812 MB) y latencias de ~0,68 s en un Apple M4, puede desplegarse en equipos sin GPU dedicada o en nodos de borde con recursos limitados.
- Enriquecimiento de logs y auditoria: la salida por categorias permite etiquetar peticiones en pipelines de observabilidad para analisis posterior, manteniendo los registros de auditoria exigidos por el propio autor.
- Evaluacion comparativa de reglas WAF: al puntuar peticiones con semantica de ataque uniforme (1 - p(benign)), sirve como referencia para calibrar umbrales y comparar con otros clasificadores en el mismo arnes de evaluacion.

## Benchmarks y rendimiento

El autor publica un benchmark sobre 299 peticiones (145 benignas, 154 ataques) con el mismo arnes para todos los modelos. La puntuacion de ataque se define como 1 - p(benign).

Barrer de umbrales (recall de ataques / tasa de falsos positivos):

| Umbral | h2o-lightning-4b | d1-3B | jev-latest | Decision-WAF-V1.1-0.8B |
|---|---|---|---|---|
| 0,05 | 1,000 / 1,000 | 1,000 / 1,000 | 1,000 / 0,262 | 0,916 / 0,014 |
| 0,10 | 0,994 / 0,517 | 1,000 / 0,945 | 1,000 / 0,234 | 0,916 / 0,007 |
| 0,20 | 0,968 / 0,248 | 0,994 / 0,621 | 0,987 / 0,166 | 0,896 / 0,007 |
| 0,35 | 0,961 / 0,221 | 0,909 / 0,159 | 0,974 / 0,103 | 0,877 / 0,007 |
| 0,50 | 0,955 / 0,207 | 0,799 / 0,055 | 0,916 / 0,055 | 0,877 / 0,007 |
| 0,70 | 0,922 / 0,152 | 0,636 / 0,028 | 0,909 / 0,055 | 0,851 / 0,007 |
| 0,80 | 0,903 / 0,131 | 0,565 / 0,007 | 0,903 / 0,048 | 0,844 / 0,007 |
| 0,90 | 0,896 / 0,055 | 0,461 / 0,000 | 0,864 / 0,048 | 0,825 / 0,000 |
| 0,95 | 0,857 / 0,041 | 0,338 / 0,000 | 0,851 / 0,048 | 0,812 / 0,000 |

Mejor F1 por modelo:

| Modelo | Mejor F1 | Umbral | P / R / FPR | Mejor recall con FPR <= 1% |
|---|---|---|---|---|
| h2o-lightning-4b | 0,920 | 0,90 | 0,945 / 0,896 / 0,055 | ninguno (FPR minimo 4,1%) |
| d1-3B | 0,883 | 0,35 | 0,859 / 0,909 / 0,159 | 0,565 |
| jev-latest | 0,941 | 0,32 | 0,904 / 0,981 / 0,110 | 0,799 |
| Decision-WAF-V1.1-0.8B | 0,967 | 0,002 | 0,974 / 0,961 / 0,028 | 0,916 |

Recall por etiqueta a umbral 0,9: recon 20/30, injection 54/63, xss 19/23, auth_abuse 6/8, file_access 19/20, ssrf_redirect 9/10.

## Requisitos de hardware

- VRAM estimada para inferencia: ~812 MB con cuantizacion Q8_0 en GGUF; el repositorio safetensors ocupa 1,7 GB.
- GPU recomendadas: RTX 4000 SFF Ada (referencia del autor, con latencias de 30-70 ms por clase); por su tamano, cabe en practicamente cualquier GPU consumer con 2 GB o mas de VRAM.
- Cabe en GPU consumer: si, incluidas RTX 4090, RTX 3060 y similares; tambien funciona en hardware Apple (M4, ~0,68 s de mediana).
- Opciones de despliegue: llama.cpp (`llama-server`, build >= 11822) con los metadatos de decision embebidos en el GGUF y puntuacion via `/v1/systemone`; el repositorio tambien incluye pesos safetensors para transformers.
- Latencia y throughput: ~0,68 s de mediana en Apple M4; 30-70 ms por clase en RTX 4000 SFF Ada. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Mejor F1 | Recall con FPR <= 1% | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Decision-WAF-V1.1-0.8B | 852.985.920 | 0,967 | 0,916 | Apache 2.0 | Hugging Face (0xBrandon) |
| h2o-lightning-4b | no disponible | 0,920 | ninguno (FPR minimo 4,1%) | no disponible | no disponible |
| d1-3B | no disponible | 0,883 | 0,565 | no disponible | no disponible |
| jev-latest | no disponible | 0,941 | 0,799 | no disponible | api.typesafe.ai |

Los datos de parametros, licencia y disponibilidad de los modelos comparados no se detallan en la informacion proporcionada; solo se dispone de sus metricas en el benchmark del autor. La comparativa se limita, por tanto, a rendimiento y tamano relativo.

## Limitaciones y advertencias

- Los fallos residuales se concentran en rutas de sonda clasicas (HNAP1, OWA, swagger.json, robots.txt con clientes scriptados, paneles de administracion de routers) infrarrepresentadas en el entrenamiento.
- El modelo se inclina agresivamente ante imitadores adversariales, como palabras clave SQL en prosa ordinaria.
- Solo inspecciona cabeceras: los ataques transportados en el cuerpo de la peticion quedan fuera del alcance en el modo de inspeccion actual.
- Entrenado con datos curados y sinteticos; el desplazamiento de distribucion (nuevas aplicaciones, formas de API inusuales, codificaciones) puede mover el error en ambas direcciones, por lo que se recomienda monitorizar y reentrenar.
- Un clasificador WAF puede ser evadido y puede clasificar mal; debe usarse como una capa mas, manteniendo registros de auditoria y sin que sea lo unico entre internet y un servicio vulnerable.
- No es un detector de exploits ni sustituye al parcheo.
- Riesgo de alucinacion y sesgos conocidos: no disponibles en la informacion proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero deben respetarse las condiciones de la licencia del modelo base Qwen/Qwen3.5-0.8B-Base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/0xBrandon/Decision-WAF-V1.1-0.8B
- Repositorio decision-waf: https://github.com/0x4272616E646F6E/decision-waf
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Evaluacion de referencia jev-latest: https://api.typesafe.ai
- Informes oficiales decision-waf-eval: no disponible como enlace directo en la informacion proporcionada
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
