# 0xBrandon/Decision-WAF-V1-0.1B

## Resumen

Decision-WAF-V1-0.1B es un clasificador de peticiones HTTP ultracompacto desarrollado por 0xBrandon para su uso como capa de decisión en un firewall de aplicaciones web (WAF). Con 149,4 millones de parámetros, es el miembro más pequeño de la familia Decision-WAF y está afinado sobre el modelo base AxiomicLabs/GPT-X3-150M. Su función es muy acotada: recibe una petición HTTP (método, ruta, query y cabeceras, sin inspeccionar el cuerpo) y responde con un único token que indica si la petición es benigna o a qué clase de ataque pertenece.

Su relevancia radica en la búsqueda de WAF basados en lenguaje con latencia y coste mínimos: al ser tan pequeño, puede ejecutarse en hardware modesto y actuar como una señal más de defensa en profundidad, junto a TLS, autenticación y copias de seguridad. El proyecto se integra con el ingress [decision-waf](https://github.com/0x4272616E646F6E/decision-waf), que convierte la salida del modelo en una distribución de probabilidad sobre las categorías de ataque y aplica un umbral ajustable para decidir bloquear o permitir.

Cabe destacar que, según los propios benchmarks del autor, este modelo de 0,1B queda superado por todos los demás miembros de la familia (0,4B y 0,8B) y por los modelos de referencia, por lo que se recomienda usar versiones mayores para tráfico de producción y reservar este para experimentación o entornos con restricciones severas de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TX5 (híbrido: 18 capas GDN2 de atención lineal + 6 capas GQA con RoPE) |
| Parametros totales | 149.400.930 (149,4 M) |
| Parametros activos | no disponible (arquitectura híbrida densa, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos en precisión original) |
| Idiomas soportados | no disponible (clasificador de peticiones HTTP, no modelo conversacional) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (sin GGUF: la arquitectura TX5 no está soportada por llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de AxiomicLabs/GPT-X3-150M, una arquitectura híbrida denominada TX5 que combina 18 capas GDN2 de atención lineal (con soporte de kernels flash-linear-attention vía la librería `flash-linear-attention` en CUDA) y 6 capas de atención GQA estándar con codificación posicional RoPE. Esta mezcla busca reducir el coste computacional de la atención manteniendo capacidad de modelado en secuencias de petición HTTP.

El afinado se realizó con LoRA (r=64, α=128, unos 15 millones de parámetros entrenables) fusionado posteriormente en los pesos base. Se empleó una cabeza de clasificación de lectura de un solo token, con la pérdida calculada únicamente sobre el token de respuesta. El entrenamiento duró 4.591 pasos (aproximadamente 2,2 horas) en una única RTX 4000 SFF Ada, usando batching de longitud exacta para que las capas GDN2 ejecutaran sus kernels de atención lineal. El dataset consta de unas 150.000 peticiones HTTP etiquetadas, con un conjunto de evaluación estrictamente separado mediante huellas de línea de petición, valores de query y valores de cabecera. La receta de datos es la misma que la de Decision-WAF-V1.1-0.8B.

## Capacidades

- Clasificación de peticiones HTTP en 8 categorías: `benign`, `auth_abuse`, `file_access`, `injection`, `other_attack`, `recon`, `ssrf_redirect` y `xss`.
- Inspección basada en método, ruta, query y cabeceras; el cuerpo de la petición no se inspecciona.
- Salida de un único token de letra, que el ingress decision-waf convierte en una distribución de probabilidad sobre las categorías; la puntuación de ataque se calcula como 1 − p(benign).
- Veredicto de bloqueo o permiso con umbral ajustable sobre la puntuación de ataque.
- No es un detector de exploits ni sustituye a la parcheado de vulnerabilidades: está concebido como una señal más de defensa en profundidad.
- No soporta tool calling, agentes ni capacidades multimodales; es un clasificador de texto especializado.

## Casos de uso

- Filtrado per-request en un ingress de Kubernetes: desplegado detrás del ingress decision-waf, puntúa cada petición entrante y aplica un umbral para bloquear tráfico malicioso antes de que llegue a los servicios backend.
- Defensa en profundidad en servicios expuestos: como capa adicional junto a TLS, autenticación y copias de seguridad, aporta una señal probabilística de ataque sin necesidad de reglas manuales de firmas.
- Clasificación de ataques por categoría: permite enrutar o priorizar alertas según la clase detectada (injection, xss, recon, ssrf_redirect, etc.) en un SIEM o sistema de monitorización.
- Experimentación con WAF basados en modelos de lenguaje: por su tamaño mínimo (0,3 GB de repo), es idóneo para prototipar y comparar enfoques de clasificación de peticiones con recursos limitados.
- Entornos edge o de hardware muy restringido: con 149M de parámetros puede ejecutarse en GPUs modestas o integradas donde no caben los miembros de 0,4B u 0,8B de la familia.
- Generación de datasets de entrenamiento y análisis forense: clasificar logs históricos de peticiones para etiquetarlas por tipo de ataque y reentregar modelos posteriores.

## Benchmarks y rendimiento

Benchmark del autor sobre 299 peticiones (145 benignas, 154 de ataque), con puntuación de ataque = 1 − p(benign):

Barrido de umbrales (recall de ataque / tasa de falsos positivos):

| threshold | h2o-lightning-4b | d1-3B | jev-latest | Decision-WAF-V1-0.1B |
|---|---|---|---|---|
| 0.05 | 1.000 / 1.000 | 1.000 / 1.000 | 1.000 / 0.262 | **0.688 / 0.034** |
| 0.10 | 0.994 / 0.517 | 1.000 / 0.945 | 1.000 / 0.234 | **0.675 / 0.021** |
| 0.20 | 0.968 / 0.248 | 0.994 / 0.621 | 0.987 / 0.166 | **0.649 / 0.021** |
| 0.35 | 0.961 / 0.221 | 0.909 / 0.159 | 0.974 / 0.103 | **0.636 / 0.021** |
| 0.50 | 0.955 / 0.207 | 0.799 / 0.055 | 0.916 / 0.055 | **0.617 / 0.021** |
| 0.70 | 0.922 / 0.152 | 0.636 / 0.028 | 0.909 / 0.055 | **0.565 / 0.007** |
| 0.80 | 0.903 / 0.131 | 0.565 / 0.007 | 0.903 / 0.048 | **0.539 / 0.007** |
| 0.90 | 0.896 / 0.055 | 0.461 / 0.000 | 0.864 / 0.048 | **0.526 / 0.007** |
| 0.95 | 0.857 / 0.041 | 0.338 / 0.000 | 0.851 / 0.048 | **0.513 / 0.007** |

Mejor F1 por modelo:

| Modelo | Mejor F1 | Umbral | P / R / FPR | Mejor recall con FPR ≤ 1% |
|---|---|---|---|---|
| h2o-lightning-4b | 0.920 | 0.90 | 0.945 / 0.896 / 0.055 | ninguno (FPR mínima 4,1%) |
| d1-3B | 0.883 | 0.35 | 0.859 / 0.909 / 0.159 | 0.565 |
| jev-latest | 0.941 | 0.32 | 0.904 / 0.981 / 0.110 | 0.799 |
| Decision-WAF-V1-0.8B | 0.936 | 0.001 | 0.979 / 0.896 / 0.021 | 0.851 |
| Decision-WAF-V1.1-0.8B | 0.967 | 0.002 | 0.974 / 0.961 / 0.028 | 0.916 |
| Decision-WAF-V1-0.4B | 0.944 | 0.08 | 0.960 / 0.929 / 0.041 | 0.779 |
| Decision-WAF-V1-0.1B | 0.826 | 0.001 | 0.913 / 0.753 / 0.076 | 0.565 |

En este benchmark, el modelo de 0,1B queda por debajo de todos los demás miembros de la familia y de los modelos de referencia. Su precisión de validación (0,983) es muy superior a su recall en el benchmark, lo que indica que ajusta bien la distribución de entrenamiento pero generaliza de forma débil, una limitación de capacidad a esta escala según el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: con 149M de parámetros en safetensors (repo de 0,3 GB), el modelo cabe con holgura en GPUs con 2-4 GB de VRAM; no hay cifras oficiales publicadas.
- GPU recomendadas: cualquier GPU moderna; el autor reporta ~2,5 s por petición (batch 1, ruta de referencia sin optimizar) en GPU de Apple serie M vía MPS, y una clase de latencia inferior a 100 ms esperada en CUDA con los kernels de flash-linear-attention.
- Consumer GPUs: cabe sin problemas en GPUs de consumo (por ejemplo, RTX 3060, RTX 4060 o superiores); el propio entrenamiento se realizó en una RTX 4000 SFF Ada.
- Opciones de despliegue: transformers con `trust_remote_code=True` (los ficheros de modelado personalizados TX5 van en el repositorio) o vLLM detrás de un adaptador compatible con systemone. No hay soporte GGUF ni llama.cpp, ya que la arquitectura TX5 no está implementada en llama.cpp. El fine-tuning requiere `flash-linear-attention>=0.6.0` sobre CUDA.
- Latencia: ~2,5 s por petición en Apple Silicon sin optimizar (ruta de referencia); se espera una clase de menos de 100 ms en CUDA con kernels fla. No hay cifras de throughput publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Mejor F1 | Recall @ FPR ≤ 1% | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Decision-WAF-V1-0.1B (este modelo) | 149 M | 0.826 | 0.565 | Apache 2.0 | HuggingFace, safetensors, sin GGUF |
| Decision-WAF-V1-0.4B | ~0,4 B | 0.944 | 0.779 | no disponible | HuggingFace (misma familia) |
| Decision-WAF-V1.1-0.8B | ~0,8 B | 0.967 | 0.916 | no disponible | HuggingFace (misma familia) |
| jev-latest | no disponible | 0.941 | 0.799 | no disponible | API (api.typesafe.ai) |

Conclusión de la comparativa: dentro de la propia familia, el salto a 0,4B o 0,8B mejora sustancialmente el F1 y el recall a bajo FPR; el modelo de 0,1B solo tiene sentido cuando la restricción de hardware o latencia es determinante y se acepta menor cobertura de ataques.

## Limitaciones y advertencias

- Rendimiento inferior: queda superado por todos los demás modelos Decision-WAF y por ambos modelos de referencia en el benchmark oficial; el propio autor recomienda usar un miembro mayor de la familia para filtrar tráfico de producción.
- Puntos ciegos conocidos: no detecta payloads de Log4Shell ni Shellshock transportados en cabeceras (puntuación ~0,0001; los modelos 0,4B y 0,8B los puntúan con 0,999+).
- Generalización débil: alta precisión en validación (0,983) frente a un recall de benchmark mucho menor indica sobreajuste a la distribución de entrenamiento; es una limitación de capacidad a esta escala, no de datos.
- Sin inspección de cuerpo: los ataques transportados en el cuerpo de la petición están fuera del alcance del modo de inspección actual (solo método, ruta, query y cabeceras).
- Datos de entrenamiento curados y sintéticos: un cambio de distribución puede mover el error en ambas direcciones; es necesario monitorizar y reentregar periódicamente.
- Evadible y falible: un clasificador WAF puede ser eludido y puede clasificar mal; debe usarse como una capa más, conservar registros de auditoría y nunca dejarlo como único elemento entre internet y un servicio vulnerable.
- Dependencia de código remoto: la inferencia requiere `trust_remote_code=True` con ficheros de modelado personalizados (TX5), lo que implica ejecutar código de terceros; revisa los ficheros antes de usarlo en producción.
- Sin cuantización ni GGUF publicados: no hay variantes cuantizadas ni soporte llama.cpp, lo que limita las opciones de despliegue ligero.
- Restricciones de licencia: ninguna, la licencia Apache 2.0 permite uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/0xBrandon/Decision-WAF-V1-0.1B
- Modelo base: https://huggingface.co/AxiomicLabs/GPT-X3-150M
- Repositorio del ingress decision-waf: https://github.com/0x4272616E646F6E/decision-waf
- Servicio de evaluación de referencia jev-latest: https://api.typesafe.ai
