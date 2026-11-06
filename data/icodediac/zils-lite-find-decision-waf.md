# icodediac/zils-lite-find-decision-waf

## Resumen

Decision-WAF-V1.1-0.8B es un clasificador compacto de peticiones HTTP disenado para actuar como motor de decision de un web application firewall (WAF). Lo desarrolla icodediac (model_creator: 0xBrandon) y se construye mediante un ajuste fino con LoRA sobre Qwen3.5-0.8B-Base, un modelo de la familia Qwen 3.5. El modelo recibe una unica peticion HTTP (metodo, ruta, query y cabeceras) y responde con un unico token que representa la clase de ataque o la categoria `benign`, que el ingress de decision-waf convierte en una distribucion de probabilidad.

El modelo resuelve el problema de clasificacion de peticiones maliciosas en el borde con un coste computacional muy bajo: 852.985.920 parametros totales y un repo de 1,7 GB. Su relevancia actual radica en que ofrece una alternativa ligera a clasificadores WAF de mayor tamano (3B-4B) con una latencia de decenas de milisegundos en GPU y una tasa de falsos positivos muy contenida en el rango de umbral recomendado.

La arquitectura subyacente es un transformer decoder-only de Qwen 3.5 adaptado a clasificacion de una sola respuesta. El contexto y los idiomas soportados no se detallan en la informacion disponible. La licencia es Apache 2.0 y los pesos se distribuyen en safetensors y en un GGUF Q8_0 optimizado para llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen 3.5), ajuste LoRA fusionado, cabeza de clasificacion de un token |
| Parametros totales | 852.985.920 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (GGUF, ~812 MB); pesos safetensors en el repo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (merged HF) y GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B-Base, un transformer decoder-only, y se ajusta con LoRA de rango r=64 y alpha=128, con aproximadamente 43M de parametros entrenables que posteriormente se fusionan en los pesos base. La salida es una cabeza de clasificacion de un unico token: la perdida se calcula solo sobre el token de respuesta, de modo que el modelo emite una letra que mapea a una de las ocho categorias (`benign`, `auth_abuse`, `file_access`, `injection`, `other_attack`, `recon`, `ssrf_redirect`, `xss`). El entrenamiento duro 4.591 pasos (unas 14,9 horas) en una unica RTX 4000 SFF Ada.

Los datos de entrenamiento consisten en aproximadamente 150.000 peticiones HTTP etiquetadas, con un conjunto de evaluacion estrictamente separado mediante huellas de request-line, valores de query y valores de cabecera. La inspeccion se limita a metodo, ruta, query y cabeceras: los cuerpos de las peticiones no se analizan. El GGUF incluye metadatos de decision (`qwen35.decision.*`) y una plantilla de chat `systemone` que habilita el endpoint `/v1/systemone` en llama-server.

## Capacidades

- Clasificacion de peticiones HTTP en ocho categorias: benign, auth_abuse, file_access, injection, other_attack, recon, ssrf_redirect y xss.
- Veredicto block-or-allow en un unico forward pass, con umbral ajustable sobre la puntuacion de ataque (1 - p(benign)).
- Inspeccion de metodo, ruta, query y cabeceras HTTP; no inspecciona cuerpos de peticion.
- Deteccion de payloads en cabeceras, incluidos casos de Log4Shell y Shellshock.
- Manejo correcto de peticiones benignas con clientes no navegador, URLs de servicios conocidos en parametros y terminos de busqueda con apariencia de codigo.
- Integracion con llama.cpp mediante el endpoint `/v1/systemone` y metadatos de decision embebidos en el GGUF.
- No se documentan capacidades de generacion de texto libre, tool calling, agentes, vision ni audio: el modelo esta especializado en clasificacion.

## Casos de uso

- WAF perimetral de baja latencia: desplegar el modelo como primer filtro en el ingress para bloquear o permitir peticiones en un unico forward pass, con umbral entre 0,05 y 0,1 para contener falsos positivos.
- Proteccion de APIs expuestas: clasificar peticiones a endpoints REST segun metodo, ruta y cabeceras, detectando intentos de injection, SSRF o reconocimiento sin necesidad de inspeccionar el cuerpo.
- Defensa en profundidad en arquitecturas zero-trust: usar el modelo como una senal adicional junto a TLS, autenticacion y copias de seguridad, sin sustituir el parcheo de vulnerabilidades.
- Deteccion de ataques en cabeceras: identificar payloads de Log4Shell o Shellshock transportados en cabeceras, un vector que los filtros basados solo en cuerpo o URL pueden pasar por alto.
- Reduccion de ruido en SOC: preclasificar el trafico en categorias de ataque para priorizar alertas y enrutar eventos a los analistas correspondientes, con logs de auditoria de cada veredicto.
- Despliegue en hardware modesto: servir el modelo en una RTX 4000 SFF Ada con latencias de 30-70 ms por clase, o en un Apple M4 con ~0,68 s de mediana, para entornos de laboratorio o sucursales.
- Filtrado previo a servicios legacy: colocar el clasificador delante de aplicaciones antiguas con paneles de administracion o rutas de sondeo conocidas, monitorizando y reentrenando ante deriva de distribucion.

## Benchmarks y rendimiento

El autor publica una evaluacion sobre 299 peticiones (145 benignas, 154 de ataque) con el mismo harness para todos los modelos. La puntuacion de ataque se define como 1 - p(benign).

Barrer de umbrales (recall de ataque / tasa de falsos positivos):

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

- Inferencia en Q8_0 GGUF: ~812 MB de pesos, por lo que cabe en GPUs consumer con 2 GB o mas de VRAM.
- GPU recomendadas: RTX 4000 SFF Ada (30-70 ms por clase segun el autor); cualquier GPU consumer moderna (RTX 3060, 4060, 4090) es suficiente por el tamano del modelo.
- Apple Silicon: ~0,68 s de mediana en un Apple M4 con llama.cpp.
- Despliegue: llama.cpp (`llama-server`, build >= 11822) con el endpoint `/v1/systemone`; los pesos safetensors son compatibles con transformers para integraciones personalizadas.
- Al convertir a GGUF debe excluirse los tensores especulativos NextN (`--no-nextn`) y conservarse los metadatos de decision, o los endpoints de decision no se registran.
- Throughput y latencia exactos en otras configuraciones: no disponibles mas alla de las cifras citadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Mejor F1 | Recall con FPR <= 1% | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Decision-WAF-V1.1-0.8B | 0,85B | no disponible | 0,967 | 0,916 | Apache 2.0 | Hugging Face (safetensors, GGUF) |
| h2o-lightning-4b | 4B (aprox.) | no disponible | 0,920 | ninguno (FPR min 4,1%) | no disponible | decision-waf-eval |
| d1-3B | 3B (aprox.) | no disponible | 0,883 | 0,565 | no disponible | decision-waf-eval |
| jev-latest | no disponible | no disponible | 0,941 | 0,799 | no disponible | api.typesafe.ai |

## Limitaciones y advertencias

- Solo inspecciona cabeceras, ruta, query y metodo: los ataques transportados en el cuerpo de la peticion quedan fuera del alcance del modo de inspeccion actual.
- Los fallos residuales se concentran en rutas de sondeo clasicas (HNAP1, OWA, swagger.json, robots.txt con clientes automatizados, paneles de administracion de routers) poco representadas en el entrenamiento.
- Tiende a ser agresivo con falsos positivos en textos que imitan ataques, como palabras clave SQL en prosa ordinaria.
- Entrenado con datos curados y sinteticos: la deriva de distribucion (nuevas aplicaciones, formas de API inusuales, codificaciones) puede mover el error en ambas direcciones; requiere monitorizacion y reentrenamiento.
- Un clasificador WAF puede ser evadido y puede clasificar mal; debe usarse como una capa mas, con logs de auditoria, y nunca como unica proteccion entre internet y un servicio vulnerable.
- No es un detector de exploits ni sustituye al parcheo de vulnerabilidades.
- Idiomas soportados no documentados; el modelo esta especializado en peticiones HTTP, no en generacion de texto general.
- Licencia Apache 2.0 permite uso comercial, pero no se documentan garantias ni soporte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/icodediac/zils-lite-find-decision-waf
- Repositorio decision-waf: https://github.com/0x4272616E646F6E/decision-waf
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- decision-waf-eval (referencia de benchmarks): no disponible como enlace directo en la informacion proporcionada
- api.typesafe.ai (referencia de jev-latest): no disponible como enlace directo en la informacion proporcionada
