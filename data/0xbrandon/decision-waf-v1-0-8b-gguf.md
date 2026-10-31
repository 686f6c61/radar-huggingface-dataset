# 0xBrandon/Decision-WAF-V1-0.8B-GGUF

## Resumen

Decision-WAF-V1-0.8B es un clasificador compacto de peticiones HTTP diseñado para integrarse en un firewall de aplicaciones web (WAF). Desarrollado por 0xBrandon sobre la base Qwen3.5-0.8B-Base, el modelo lee una única petición HTTP (método, ruta, query y cabeceras; sin inspección del cuerpo) y responde con un único token que indica si la petición es benigna o a qué clase de ataque pertenece. Está pensado para tomar veredictos de bloqueo o permiso en el borde, en una sola pasada de inferencia.

Su relevancia radica en la aplicación de un lenguaje modelo pequeño a una tarea de clasificación de seguridad de latencia muy baja: en una RTX 4000 SFF Ada alcanza una latencia mediana de unos 30 ms, lo que lo hace viable para inspección por petición en producción. En el benchmark decision-waf-eval supera en F1 (0,936) a alternativas mayores como h2o-lightning-4b y d1-3B, con una tasa de falsos positivos muy baja (0,021 en su mejor punto).

El modelo se distribuye en formato GGUF (cuantización Q8_0, ~812 MB) con metadatos de decisión incrustados para su servicio vía llama.cpp, y también incluye los pesos fusionados en safetensors. La licencia es Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (base Qwen3.5-0.8B-Base) con cabeza de clasificación de un token |
| Parámetros totales | 752.393.024 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8_0 (GGUF) |
| Idiomas soportados | no disponible (tarea: clasificación de peticiones HTTP) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (~812 MB) y safetensors (pesos fusionados) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B-Base, un transformer decoder de 0,8B de parámetros, al que se le aplica un ajuste eficiente mediante LoRA (r=64, α=128, aproximadamente 43M de parámetros entrenables) que posteriormente se fusiona en los pesos base. La salida es un único token de clasificación, con la pérdida calculada únicamente sobre el token de respuesta. El entrenamiento duró 3.988 pasos (unas 12,4 horas) en una única RTX 4000 SFF Ada.

Los datos de entrenamiento consisten en aproximadamente 129.000 peticiones HTTP etiquetadas, con un conjunto de evaluación estrictamente separado mediante huellas de línea de petición, valores de query y valores de cabecera, lo que reduce la fuga de datos entre entrenamiento y evaluación. No se menciona el uso de RLHF ni DPO, lo cual es coherente con la naturaleza de tarea de clasificación del modelo.

## Capacidades

- Clasificación de peticiones HTTP en 8 categorías: `benign`, `auth_abuse`, `file_access`, `injection`, `other_attack`, `recon`, `ssrf_redirect` y `xss`.
- Inspección de método, ruta, query y cabeceras de la petición (sin inspección del cuerpo).
- Detección de payloads transportados en cabeceras, como Log4Shell y Shellshock.
- Manejo correcto de peticiones benignas con clientes no-navegador, URLs de servicios conocidos en parámetros y términos de búsqueda con aspecto de código.
- Salida de un único token, que el componente decision-waf convierte en una distribución de probabilidad sobre las categorías, con umbral ajustable sobre la puntuación de ataque (1 − p(benign)).
- No soporta tool calling, agentes, visión ni audio; es un modelo de clasificación especializado, no un asistente conversacional.

## Casos de uso

- WAF en el borde con veredicto por petición: desplegado junto a un ingress (decision-waf), permite decidir bloquear o permitir cada petición en una sola pasada de inferencia, con umbral ajustable sobre la puntuación de ataque.
- Filtrado de peticiones en servicios de latencia sensible: con ~30 ms en una RTX 4000 SFF Ada, puede colocarse delante de APIs de producción sin degradar apreciablemente el tiempo de respuesta.
- Detección de ataques en cabeceras: identifica payloads Log4Shell o Shellshock incrustados en cabeceras HTTP, algo que los WAF tradicionales basados en reglas pueden no cubrir de forma robusta.
- Reducción de falsos positivos en tráfico legítimo atípico: clasifica correctamente como benignas peticiones de clientes no-navegador (bots legítimos, health checks) o con términos de búsqueda con aspecto de código.
- Capa adicional en estrategias de defensa en profundidad: se usa como una señal más junto a TLS, autenticación y copias de seguridad, complementando WAF basados en reglas.
- Monitorización y alerta temprana: con la distribución de probabilidad sobre categorías, puede alimentar dashboards y alertas de patrones de ataque (recon, injection, xss) antes de aplicar bloqueos automáticos.

## Benchmarks y rendimiento

Conjunto de evaluación: 299 peticiones (145 benignas, 154 ataques), mismo harness para todos los modelos. Puntuación de ataque = 1 − p(benign).

Barrido de umbrales (recall de ataque / tasa de falsos positivos):

| Umbral | h2o-lightning-4b | d1-3B | Decision-WAF-V1-0.8B |
|---|---|---|---|
| 0,05 | 1,000 / 1,000 | 1,000 / 1,000 | **0,838 / 0,007** |
| 0,10 | 0,994 / 0,517 | 1,000 / 0,945 | **0,831 / 0,007** |
| 0,20 | 0,968 / 0,248 | 0,994 / 0,621 | **0,825 / 0,007** |
| 0,35 | 0,961 / 0,221 | 0,909 / 0,159 | **0,825 / 0,000** |
| 0,50 | 0,955 / 0,207 | 0,799 / 0,055 | **0,799 / 0,000** |
| 0,70 | 0,922 / 0,152 | 0,636 / 0,028 | **0,792 / 0,000** |
| 0,80 | 0,903 / 0,131 | 0,565 / 0,007 | **0,773 / 0,000** |
| 0,90 | 0,896 / 0,055 | 0,461 / 0,000 | **0,766 / 0,000** |
| 0,95 | 0,857 / 0,041 | 0,338 / 0,000 | **0,747 / 0,000** |

Mejor F1 por modelo:

| Modelo | Mejor F1 | Umbral | P / R / FPR | Mejor recall con FPR ≤ 1% |
|---|---|---|---|---|
| h2o-lightning-4b | 0,920 | 0,90 | 0,945 / 0,896 / 0,055 | ninguno (FPR mín. 4,1%) |
| d1-3B | 0,883 | 0,35 | 0,859 / 0,909 / 0,159 | 0,565 |
| **Decision-WAF-V1-0.8B** | **0,936** | 0,001 | 0,979 / 0,896 / 0,021 | **0,851** |

Recall por etiqueta con umbral 0,9: auth_abuse 3/8, ssrf_redirect 5/10, recon 20/30, injection 51/63.

## Requisitos de hardware

- VRAM estimada: ~812 MB en Q8_0, por lo que cabe con holgura en cualquier GPU moderna e incluso en CPUs con suficiente RAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor reporta latencia de ~30 ms (mediana) en una RTX 4000 SFF Ada y ~0,67 s en un Apple M4 (probablemente en CPU/MPS).
- Consumer GPUs: perfectamente viable en GPUs de gama baja y media (GTX 1650, RTX 3060, RTX 4060, etc.); también ejecutable en CPU dado el tamaño reducido.
- Despliegue: llama.cpp (`llama-server`, build ≥ 11822) con el endpoint `/v1/systemone`; es imprescindible que los metadatos de decisión (`qwen35.decision.*`) estén presentes en el GGUF y usar la plantilla de chat `systemone`. Al convertir pesos, excluir los tensores especulativos NextN (`--no-nextn`).
- Latencia y throughput: ~0,67 s mediana en Apple M4; ~30 ms en RTX 4000 SFF Ada. No hay datos de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parámetros | Mejor F1 | FPR en mejor F1 | Mejor recall con FPR ≤ 1% | Licencia |
|---|---|---|---|---|---|
| Decision-WAF-V1-0.8B | 0,75B | 0,936 | 0,021 | 0,851 | Apache 2.0 |
| h2o-lightning-4b | 4B (aprox.) | 0,920 | 0,055 | ninguno (FPR mín. 4,1%) | no disponible |
| d1-3B | 3B (aprox.) | 0,883 | 0,159 | 0,565 | no disponible |

A pesar de ser el modelo más pequeño del conjunto, logra el mejor F1 y el único recall alto con falsos positivos por debajo del 1%, lo que lo hace especialmente adecuado para producción donde un FPR alto genera fricción con tráfico legítimo.

## Limitaciones y advertencias

- Sesgo conservador: tiende a no marcar ataques entregados por clientes con apariencia normal sobre endpoints normales (recall bajo en auth_abuse y ssrf_redirect).
- Solo inspecciona cabeceras: los ataques transportados en el cuerpo de la petición están fuera del alcance actual.
- Entrenado con datos curados y sintéticos: el cambio de distribución (aplicaciones nuevas, formas de API inusuales, codificaciones nuevas) puede aumentar errores en ambas direcciones; se recomienda monitorizar y reentrenar.
- Riesgo de evasión: un clasificador WAF puede ser evadido y puede clasificar erróneamente; debe usarse como una capa más, nunca como única barrera frente a un servicio vulnerable.
- No sustituye la aplicación de parches ni controles de autenticación; mantener registros de auditoría.
- No es un detector de exploits ni un modelo conversacional de propósito general.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/0xBrandon/Decision-WAF-V1-0.8B-GGUF
- Repositorio decision-waf (ingress): https://github.com/0x4272616E646F6E/decision-waf
- Modelo base: Qwen/Qwen3.5-0.8B-Base
