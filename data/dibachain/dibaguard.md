# Dibachain/DibaGuard

## Resumen

DibaGuard es una capa de detección y protección de ataques para flujos de red, HTTP, JSON-RPC y bases de datos, publicada por Dibachain bajo una licencia permisiva. No es un modelo de lenguaje generativo al uso, sino un sistema de detección de intrusiones compuesto por varios modelos pequeños (árboles monotónicos, una red GRU y un detector de consultas SQL denominado DbNet) que operan en cascada sobre señales de comportamiento de red. Su inferencia está implementada únicamente con numpy en Python, con una ruta rápida en Go que reproduce bit a bit los resultados de la versión Python.

El sistema se posiciona donde lo harían un WAF, un IDS y un cortafuegos de host: en línea delante de una aplicación, como servicio de decisión externo detrás de un balanceador (nginx, Envoy, HAProxy, Traefik, Caddy) o junto a un host que lee exportaciones de flujos y registros. Cada alarma viene acompañada de una tasa de falsos positivos controlada mediante calibración conformal sobre el tráfico del propio sitio (presupuesto por defecto de 10^-3 por minuto y origen), una familia de ataque identificada, la evidencia que la produjo y una acción elegida por la política del operador (solo informar o aplicar bloqueo).

La relevancia actual reside en su enfoque de calibración estadística explicable y en su bajo coste de cómputo (solo CPU), orientado a despliegues de producción con garantías medibles de falsa alarma. El repositorio público no incluye el modelo de peticiones HTTP del build privado, por lo que la cobertura HTTP se limita a firmas y análisis de contexto SQL.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cascada de modelos: árboles monotónicos (oblivious trees), red GRU causal (d = 64) con condicionamiento FiLM, detectores de entidad de reserva y red de consultas de base de datos (DbNet) |
| Parámetros totales | No disponible (pesos publicados como arrays `.npz` y `.bin`; no se declara el recuento) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (procesa secuencias de comportamiento por origen con estado oculto por fuente; no se declara ventana en tokens) |
| Tipos de cuantización | No disponible (pesos en coma flotante nativa; no se documentan variantes cuantizadas) |
| Idiomas soportados | Inglés (en) y persa (fa) para el parser de reglas en lenguaje natural; reglas en cualquier idioma mediante puente LLM vía MCP / REST |
| Licencia | Código Apache-2.0; archivos de modelo CC BY-SA 4.0 |
| Formato de pesos | `.npz` (numpy) y `.bin` / `.bin.json` (arrays planos para el runtime Go) |

## Arquitectura y entrenamiento

DibaGuard no es un transformer monolítico, sino una cascada de detectores que operan a distintas escalas temporales. El nivel 0 mantiene 36 contadores de comportamiento con decaimiento exponencial por origen en tres horizontes (10 s, 2 min y 30 min), libres de identidad y de escala, lo que permite que los modelos transfieran entre redes. El nivel 1 aplica árboles monotónicos sobre 24 contadores de dirección de ataque con restricciones crecientes (más sondeo de puertos o más conexiones fallidas nunca pueden parecer más benignos), calibrados por servicio y antigüedad del origen mediante conformal de Mondrian. El nivel 1' añade una anomalía sin etiquetas basada en la combinación de Fisher de p-valores de cola superior. El nivel 2 emplea una GRU causal con un estado oculto por origen, condicionada por FiLM sobre un vector de contexto del sitio, que solo se ejecuta sobre orígenes ya calientes. Los niveles 4 a 6 cubren evidencia por origen mediante CUSUM rápido y lento, detección de inundaciones por destino y seguimiento de campañas distribuidas de baja intensidad mediante huellas compartidas entre miles de orígenes.

Los datos de entrenamiento de esta build pública son el conjunto "licence-clean" descrito en la documentación del autor, entrenado solo con fuentes que la auditoría marca como verdes: SIMARGL 2021/2022, APPRAISE, ACI-IoT-2023, CSE-CIC-IDS2018 (desde el bucket AWS del editor) y LUFlow. El modelo de peticiones HTTP del build privado no se distribuye porque su datos de entrenamiento no están autorizados para redistribución y el reentrenamiento limpio colapsa en aplicaciones no vistas. Como innovación destacable, cada puntuación se convierte en un p-valor contra la referencia del propio sitio y cada nivel alarma solo cuando su p-valor cae por debajo de su cuota del presupuesto de falsa alarma, lo que proporciona garantías estadísticas explicables.

## Capacidades

- Detección de intrusiones en flujos de red (NetFlow) mediante contadores de comportamiento y árboles monotónicos calibrados.
- Detección de anomalías por origen sin etiquetas (nivel 1') frente al tráfico de referencia del propio sitio.
- Modelado secuencial de comportamiento por origen con GRU causal y estado oculto persistente.
- Detección de inundaciones por destino y de campañas distribuidas de baja intensidad mediante huellas compartidas.
- Análisis de peticiones HTTP con firmas A01-A22: JNDI, rutas de explotación de CMS, inyección SQL / NoSQL / de comandos, traversal, XSS, SSTI / XXE / SSRF, sondeos de ficheros sensibles y rastreadores de IA declarados.
- Análisis de contexto SQL de cada parámetro con DbNet como segunda opinión.
- Análisis de registros de consulta y auditoría de seis motores de bases de datos, con procedencia de payload entre la capa de base de datos y el borde HTTP.
- Parser de reglas en lenguaje natural en inglés y persa, con puente LLM vía MCP / REST para cualquier otro idioma y puerta de aprobación para cada propuesta.
- Aplicación de políticas (solo informe o bloqueo) con nft, iptables, netsh o modo simulación, con TTL, auditoría de postura y gestión de identidad NAT / CGNAT / IPv6.
- Inferencia solo con numpy en Python y ruta rápida en Go verificada bit a bit contra la versión Python.

## Casos de uso

- Protección perimetral de aplicaciones web: el sistema se sitúa delante de la aplicación detrás del balanceador existente y aplica firmas A01-A22 y análisis de contexto SQL sobre cada petición, con acción de bloqueo o solo informe según la política del operador.
- Detección de intrusiones en red: leyendo exportaciones de flujos, los contadores de comportamiento por origen y los árboles monotónicos identifican sondeos de puertos, conexiones SYN sin respuesta y exploración de hosts con una tasa de falsa alarma calibrada sobre el tráfico propio.
- Protección de bases de datos: el nivel de base de datos analiza registros de consulta y auditoría de seis motores con DbNet, firmas, comportamiento y procedencia, actuando sobre el origen web detrás del payload en lugar de bloquear el servidor de aplicación.
- Mitigación de inundaciones y campañas distribuidas: los niveles 5 y 6 detectan inundaciones de orígenes nuevos sobre un destino y campañas de baja intensidad mediante huellas compartidas entre miles de orígenes.
- Automatización de reglas por parte de operadores: el parser en lenguaje natural (inglés o persa) permite escribir reglas propias, mostrando la lectura interpretada antes de activarlas, con puerta de aprobación para propuestas generadas por LLM.
- Despliegue en entornos con recursos limitados: al ser inferencia solo CPU con numpy y una ruta Go sin dependencias, encaja en hosts modestos o en servicios de decisión externos sin GPU.
- Integración en pipelines de seguridad existentes: el servicio de decisión externo puede conectarse a nginx, Envoy, HAProxy, Traefik o Caddy, y la pasarela MCP / REST permite integrar reglas generadas por LLM con aprobación humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card menciona gráficas de detección en laboratorios con tres semillas y cero orígenes benignos bloqueados en cada laboratorio, y una comparación cabeza a cabeza con los modelos privados sobre las mismas filas, pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K ni métricas equivalentes, que además no aplican a este tipo de sistema.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; la inferencia es solo CPU con numpy en Python y una ruta rápida en Go sin dependencias.
- GPU recomendadas: no aplica; no se requiere GPU.
- Compatibilidad con GPU de consumo: no aplica; el diseño está orientado a CPU.
- Opciones de despliegue: motor Python (`runtime/python/dibaguard/`), ruta rápida Go (`dibaguard-authz`, `dibaguard-proxy`), borde HTTP, nivel de base de datos, puente LLM vía MCP y REST, y consola de operador.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Sistema | Tipo | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| DibaGuard | Cascada de detectores (árboles, GRU, DbNet) | Detección de intrusiones en red, HTTP y bases de datos con calibración conformal | Código Apache-2.0; pesos CC BY-SA 4.0 | Hugging Face (Dibachain/DibaGuard y DibaAi/DibaGuard-Open) |
| WAF comerciales (p. ej. ModSecurity con CRS) | Motor de reglas | Firmas y reglas heurísticas sobre HTTP | Varía (a menudo Apache-2.0 o GPL) | Amplia |
| IDS basados en ML genéricos | Clasificadores supervisados | Detección sobre features de flujo | Varía | Variable |

No se dispone de datos de rendimiento comparativos en la información proporcionada para establecer una comparación cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- El modelo de peticiones HTTP del build privado no se distribuye; la cobertura HTTP de esta build se limita a firmas A01-A22, análisis de contexto SQL con DbNet y la capa de sesión, sin el modelo de peticiones completo.
- El reentrenamiento limpio del modelo HTTP colapsa en aplicaciones no vistas, según documenta el autor, lo que limita la generalización a entornos no representados en los datos de entrenamiento.
- Los pesos están bajo CC BY-SA 4.0 (no solo Apache-2.0), lo que impone obligaciones de atribución y compartición bajo la misma licencia para los archivos de modelo; conviene revisar la auditoría de licencias incluida.
- La calibración de falsos positivos depende del tráfico de referencia del propio sitio; un presupuesto mal ajustado o una referencia poco representativa degrada las garantías estadísticas.
- El parser de reglas en lenguaje natural solo cubre inglés y persa de forma nativa; otros idiomas requieren un LLM externo a través del puente MCP / REST.
- Riesgo de alucinación: no aplica al ser un sistema de detección, pero las propuestas de reglas generadas por LLM pasan por una puerta de aprobación precisamente para evitar reglas erróneas.
- Sesgos conocidos: no documentados en la información disponible; la naturaleza libre de identidad y de escala de los contadores mitiga sesgos por red, pero no se detallan evaluaciones de sesgo.
- Para producción, la acción de bloqueo debe validarse primero en modo solo informe o simulación (dry-run) para medir la tasa real de falsos positivos sobre el tráfico propio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dibachain/DibaGuard
- Réplica del release: https://huggingface.co/DibaAi/DibaGuard-Open
- Demo interactiva: https://huggingface.co/spaces/DibaAi/beam-dibaguard
