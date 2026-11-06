# 0xBrandon/Decision-WAF-V1.1-0.8B-GGUF

## Resumen

Decision-WAF-V1.1-0.8B es un clasificador compacto de peticiones HTTP disenado especificamente para su uso como motor de decision en un web application firewall (WAF). Lo desarrolla 0xBrandon y se construye mediante un ajuste fino con LoRA sobre Qwen3.5-0.8B-Base. El modelo resuelve un problema acotado: dada una unica peticion HTTP (metodo, ruta, query y cabeceras, sin inspeccionar el cuerpo), devuelve un unico token que identifica si la peticion es benigna o a que clase de ataque pertenece, entre ocho categorias predefinidas.

La relevancia practica del modelo reside en su relacion rendimiento/tamano. Con aproximadamente 752 millones de parametros y un peso GGUF Q8_0 de unos 812 MB, alcanza un F1 de 0.967 en el conjunto de evaluacion del autor, por encima de alternativas de 3B y 4B parametros evaluadas con el mismo arnes. Esto lo hace viable para despliegue en el borde (edge), con latencias de decenas de milisegundos en GPU de gama profesional y subsegundo en hardware Apple Silicon.

El modelo no es un detector de exploits ni sustituye al parcheo o a otras capas de seguridad. Esta pensado como una senal adicional dentro de una estrategia de defensa en profundidad, con un umbral de ataque configurable sobre la probabilidad de que la peticion no sea benigna (1 - p(benign)).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-0.8B-Base), ajuste LoRA fusionado, cabeza de clasificacion de un token |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (GGUF); pesos safetensors en el repo base |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo actual), safetensors (pesos HF fusionados) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B-Base, un transformer decoder-only, y aplica un ajuste fino con LoRA de rango 64 y alpha 128, lo que supone aproximadamente 43 millones de parametros entrenables que posteriormente se fusionan en los pesos base. La clasificacion se realiza mediante una lectura de un unico token de respuesta (one-token classification head readout), con la perdida calculada exclusivamente sobre ese token de respuesta. El entrenamiento se prolongo durante 4.591 pasos, aproximadamente 14,9 horas, en una unica GPU RTX 4000 SFF Ada.

El conjunto de datos consta de aproximadamente 150.000 peticiones HTTP etiquetadas. El conjunto de evaluacion se mantuvo estrictamente fuera del entrenamiento mediante huellas (fingerprints) de linea de peticion, valores de query y valores de cabecera, lo que reduce el riesgo de fuga de datos. El GGUF incorpora metadatos de decision propios (prefijo `qwen35.decision.*`) y una plantilla de chat `systemone`, necesarios para que el servidor registre los endpoints de decision. En la conversion hay que excluir los tensores especulativos NextN con `--no-nextn`.

## Capacidades

- Clasificacion de peticiones HTTP en ocho categorias: `benign`, `auth_abuse`, `file_access`, `injection`, `other_attack`, `recon`, `ssrf_redirect` y `xss`.
- Inspeccion de metodo, ruta, query y cabeceras; el cuerpo de la peticion queda fuera del alcance en el modo de inspeccion actual.
- Deteccion de payloads transportados en cabeceras, como Log4Shell o Shellshock.
- Salida en un unico token que el ingress convierte en distribucion de probabilidad sobre las categorias, permitiendo umbrales ajustables.
- Manejo correcto de peticiones benignas con clientes no navegador, URLs de servicios conocidos en parametros y terminos de busqueda con apariencia de codigo.
- Servicio mediante llama.cpp (`llama-server`, build >= 11822) y endpoint `/v1/systemone`.
- No dispone de capacidades generativas, de razonamiento general, de codigo, de vision ni de tool calling; es exclusivamente un clasificador.

## Casos de uso

- Filtrado per-request en el borde: el modelo evalua cada peticion en un solo forward pass y permite bloquear o permitir segun un umbral sobre la puntuacion de ataque (1 - p(benign)), con umbrales recomendados de 0.05 a 0.1.
- Deteccion de inyeccion y XSS en APIs: clasifica rutas y parametros de query sospechosos antes de que lleguen a la aplicacion, con recall por etiqueta de 54/63 en injection y 19/23 en xss al umbral 0.9.
- Proteccion frente a abuso de autenticacion: identifica patrones de `auth_abuse` en peticiones a endpoints de login o recuperacion de credenciales, complementando el rate limiting.
- Deteccion de reconocimiento y escaneo: marca peticiones de `recon` dirigidas a rutas clasicas de sondeo, util como senal temprana en pipelines de monitorizacion.
- Mitigacion de SSRF y redirecciones abiertas: clasifica peticiones con parametros que apuntan a URLs internas o externas sospechosas antes de que el backend las procese.
- Defensa en profundidad en despliegues de baja latencia: con ~30-70 ms por clase en una RTX 4000 SFF Ada, puede colocarse delante de servicios reales junto a TLS, autenticacion y copias de seguridad.
- Auditoria y etiquetado de trafico: al devolver una categoria concreta, permite enriquecer logs con la clase de ataque estimada para analisis posterior y reentrenamiento.

## Benchmarks y rendimiento

El autor publica una evaluacion sobre 299 peticiones (145 benignas, 154 ataques) con el mismo arnes para todos los modelos. La puntuacion de ataque se define como 1 - p(benign).

| Modelo | Mejor F1 | Umbral | P / R / FPR | Mejor recall con FPR <= 1% |
|---|---|---|---|---|
| h2o-lightning-4b | 0.920 | 0.90 | 0.945 / 0.896 / 0.055 | ninguno (FPR minimo 4.1%) |
| d1-3B | 0.883 | 0.35 | 0.859 / 0.909 / 0.159 | 0.565 |
| jev-latest | 0.941 | 0.32 | 0.904 / 0.981 / 0.110 | 0.799 |
| Decision-WAF-V1.1-0.8B | 0.967 | 0.002 | 0.974 / 0.961 / 0.028 | 0.916 |

Barrido de umbrales (recall de ataque / tasa de falsos positivos) para Decision-WAF-V1.1-0.8B:

| Umbral | Recall / FPR |
|---|---|
| 0.05 | 0.916 / 0.014 |
| 0.10 | 0.916 / 0.007 |
| 0.20 | 0.896 / 0.007 |
| 0.35 | 0.877 / 0.007 |
| 0.50 | 0.877 / 0.007 |
| 0.70 | 0.851 / 0.007 |
| 0.80 | 0.844 / 0.007 |
| 0.90 | 0.825 / 0.000 |
| 0.95 | 0.812 / 0.000 |

Recall por etiqueta al umbral 0.9: recon 20/30, injection 54/63, xss 19/23, auth_abuse 6/8, file_access 19/20, ssrf_redirect 9/10.

## Requisitos de hardware

- VRAM estimada: el GGUF Q8_0 ocupa aproximadamente 812 MB, por lo que cabe holgadamente en cualquier GPU consumer con 2 GB o mas de VRAM.
- GPU recomendadas: RTX 4000 SFF Ada (referencia del autor, ~30-70 ms por clase), Apple M4 (~0,68 s de mediana), asi como RTX 4090, A100 o H100 para mayor throughput.
- Cabe en GPU consumer: si, incluidas tarjetas de gama baja y media con al menos 2 GB de VRAM.
- Opciones de despliegue: llama.cpp (`llama-server`, build >= 11822) con el endpoint `/v1/systemone`; requiere los metadatos de decision embebidos en el GGUF.
- Latencia: ~0,68 s de mediana en Apple M4; ~30-70 ms por clase en RTX 4000 SFF Ada. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Mejor F1 | Recall con FPR <= 1% | Licencia |
|---|---|---|---|---|---|
| Decision-WAF-V1.1-0.8B | ~0,75B | no disponible | 0.967 | 0.916 | Apache 2.0 |
| h2o-lightning-4b | ~4B | no disponible | 0.920 | ninguno (FPR minimo 4.1%) | no disponible |
| d1-3B | ~3B | no disponible | 0.883 | 0.565 | no disponible |
| jev-latest | no disponible | no disponible | 0.941 | 0.799 | no disponible |

## Limitaciones y advertencias

- Solo inspecciona cabeceras, ruta, query y metodo; los ataques transportados en el cuerpo de la peticion quedan fuera de alcance.
- Los fallos residuales se concentran en rutas de sondeo clasicas (HNAP1, OWA, swagger.json, robots.txt con clientes automatizados, paneles de administracion de routers) poco representadas en el entrenamiento.
- Puede ser demasiado agresivo con falsos parecidos adversariales, como palabras clave SQL en prosa ordinaria.
- Entrenado con datos curados y sinteticos; el cambio de distribucion (nuevas aplicaciones, formas de API inusuales, codificaciones) puede desplazar el error en ambas direcciones, por lo que requiere monitorizacion y reentrenamiento.
- Un clasificador WAF puede ser evadido y puede clasificar mal; debe usarse como una capa mas, con registros de auditoria y nunca como unica proteccion entre internet y un servicio vulnerable.
- No es un detector de exploits ni sustituye al parcheo.
- Licencia Apache 2.0, que permite uso comercial con las obligaciones habituales de atribucion y aviso.
- Idiomas soportados no disponibles; el modelo opera sobre peticiones HTTP, no sobre texto libre multilingue.

## Enlaces

- Hugging Face: https://huggingface.co/0xBrandon/Decision-WAF-V1.1-0.8B-GGUF
- Repositorio decision-waf: https://github.com/0x4272616E646F6E/decision-waf
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
