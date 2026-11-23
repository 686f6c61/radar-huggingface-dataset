# NullRabbit/nr-network-known-class-detector

## Resumen

`nr-network-known-class-detector` es un clasificador binario (ataque frente a benigno) orientado a ataques de red y recursos contra nodos de blockchain. Lo desarrolla NullRabbit en el marco de su trabajo sobre defensa autónoma de redes descentralizadas. No es un modelo de lenguaje ni una red neuronal profunda: se trata de un `HistGradientBoostingClassifier` de scikit-learn con calibración isotónica, empaquetado con joblib, que consume estadísticas agregadas de capturas pcap y de respuestas RPC para emitir una probabilidad calibrada de ataque.

El modelo se entrena exclusivamente sobre reproducciones fieles de ataques divulgados públicamente: 140 primitivas de ataque derivadas de CVE, GHSA y auditorías de terceros, distribuidas en 18 cadenas y 919 bundles (716 de ataque y 203 benignos). La versión publicada corresponde al corte `public-cve-replication`, de modo que cada ataque del corpus tiene una fuente pública verificable. El objetivo declarado es separar el *uso* malicioso de un mensaje del *uso* legítimo del mismo mensaje, no el tipo de mensaje en sí.

Su relevancia es acotada pero específica: cubre un nicho poco atendido por los detectores genéricos de intrusiones, como son los ataques de capa P2P y RPC propios de nodos Bitcoin y de otras cadenas. El autor lo etiqueta explícitamente como herramienta **diagnóstica**, entrenada sobre reproducciones en localnet de laboratorio y no sobre tráfico de producción real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `HistGradientBoostingClassifier` (scikit-learn) con calibración isotónica; nativo para valores NaN |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de captura corta (estadísticas de pcap y de respuestas RPC) |
| Tipos de cuantización | no disponible (modelo serializado con joblib; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | joblib (serialización de scikit-learn) |
| Tamaño del repositorio | 0,5 GB |
| Dataset de entrenamiento | `NullRabbit/nr-bundles-public` |
| Métricas declaradas | ROC-AUC, F1 |
| Umbral de decisión | 0,5 (calibrado) |

## Arquitectura y entrenamiento

El modelo es un gradiente boosting sobre árboles histogramados (`HistGradientBoostingClassifier`) con calibración isotónica posterior, implementado en scikit-learn y serializado con joblib. Las características de entrada combinan agregados de paquetes extraídos del pcap (tasas y tamaños) con agregados de las respuestas RPC (amplificación, patrón petición-respuesta y temporización). Un guardián robusto de columnas elimina, en cada ajuste, las columnas degeneradas. No se incluyen características de carga del host porque el nodo de laboratorio en contenedor es propiedad de root y sus métricas no son legibles. La inferencia está condicionada por *scoreability*: un registro sin señal de red, como un bundle económico o DeFi, devuelve `scoreable=False` sin veredicto.

El corpus de entrenamiento del corte publicado contiene 140 primitivas de ataque de origen público, 18 cadenas, 919 bundles y 142 instancias cadena×primitiva. Los bundles benignos ejercitan los mismos métodos y mensajes de wire que abusan los ataques, pero a escala normal, lo que fuerza al modelo a discriminar el uso malicioso y no la mera presencia del mensaje. Cada primitiva lleva un campo `provenance.public_source` con la URL de la divulgación correspondiente. Las primitivas de tipo `original` (mediciones propias de NullRabbit sobre amplificación RPC reconocida por fabricantes, sin CVE asociado) se excluyen de este corte, de modo que la afirmación de entrenamiento exclusivo con fuentes públicas se cumple de forma literal.

## Capacidades

- Detección binaria de ataque frente a benigno sobre señal de red de un nodo blockchain, con probabilidad calibrada y umbral fijo en 0,5.
- Cobertura de ataques de capa P2P y RPC en 18 cadenas; el corte publicado se centra en primitivas de Bitcoin derivadas de CVE.
- Manejo nativo de valores ausentes (NaN) en las características de entrada.
- Control de aplicabilidad mediante `scoreable`: descarta registros sin señal de red en lugar de forzar un veredicto.
- Modelo multifamilia único sobre el manifold de características `network-v1`, en lugar de un clasificador por tipo de ataque.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes ni capacidades multilingües; no procesa texto, visión ni audio.

## Casos de uso

- Monitorización perimetral de nodos Bitcoin: alimentar el modelo con agregados de pcap de ventanas cortas para obtener una probabilidad de ataque en tiempo casi real y priorizar alertas de saturación P2P.
- Detección de inundaciones de mensajes P2P concretas: las primitivas de *getdata flood*, *inv flood*, *headers spam* y *addr overflow flood* permiten reconocer patrones de abuso de métodos legítimos a escala anómala.
- Protección frente a ataques de propagación de bloques: las primitivas de *compact block stall*, *mutated block* y *blocktxn double fillblock* cubren intentos de retrasar la propagación, útiles en monitorización de salud de red.
- Vigilancia de endpoints RPC: los agregados de amplificación y temporización de respuestas RPC permiten detectar abuso de la interfaz RPC de un nodo expuesto.
- Triaje en un SOC especializado en criptoactivos: usar la probabilidad calibrada como señal de priorización antes de la revisión humana, con el umbral de 0,5 como punto de corte operativo.
- Validación de reglas de firewall y de configuraciones de nodo: ejecutar el detector contra tráfico de laboratorio reproducido para comprobar si una configuración mitiga las clases de ataque conocidas.
- Investigación y reproducción de CVE: servir de referencia para comparar reproducciones propias de las 140 primitivas públicas con la frontera de decisión aprendida.

## Benchmarks y rendimiento

La model card declara las métricas ROC-AUC y F1, pero no se han publicado resultados numéricos de benchmarks en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: al ser un modelo de scikit-learn serializado con joblib, no requiere GPU; el repositorio ocupa 0,5 GB.
- VRAM estimada: no aplica.
- GPU recomendadas: no aplica; cualquier CPU moderna es suficiente para la inferencia.
- Cabe en cualquier equipo de consumo; no hay requisito de GPU dedicada.
- Despliegue: carga directa con `joblib.load` en un proceso Python con scikit-learn; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Enfoque | Contexto de aplicación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `nr-network-known-class-detector` | Gradient boosting (scikit-learn) | Detección binaria de ataques de red y recursos en nodos blockchain, con primitivas de CVE públicas | Nodos de 18 cadenas, capa P2P y RPC | Apache 2.0 | Hugging Face, 478 descargas |
| Detectores IDS genéricos (por ejemplo, basados en CICIDS) | Variable (ML clásico o deep learning) | Detección de intrusiones en tráfico IP genérico | Redes empresariales | Variable | Múltiples |
| Reglas de nodo y mitigaciones del cliente | Basadas en reglas | Límites de recursos y validación de mensajes en el propio nodo | Específicas del cliente | Licencia del cliente | Integradas en el software |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo **diagnóstico**, no una garantía de despliegue: se entrena sobre reproducciones sintéticas en localnet de laboratorio, no sobre tráfico de producción real.
- Solo cubre ataques conocidos y divulgados públicamente; no detecta clases de ataque ausentes del corpus ni variantes novedosas.
- El corte publicado se limita a primitivas `public-cve-replication`; las primitivas `original` del corpus completo quedan fuera.
- No incorpora características de carga del host, lo que limita la detección de ataques cuyo efecto principal es el consumo de CPU, memoria o disco sin firma de red distintiva.
- Requiere señal de red para emitir veredicto; los registros sin señal devuelven `scoreable=False`.
- Riesgo de falsos positivos y negativos no cuantificado en la información disponible; no se publican cifras de ROC-AUC ni F1.
- Sesgos potenciales derivados de la composición del corpus: predominio de primitivas de Bitcoin en el corte publicado y cobertura desigual entre las 18 cadenas.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni compromisos de mantenimiento.
- El umbral de decisión está fijado en 0,5; no se documenta su sensibilidad ni la calibración por cadena.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NullRabbit/nr-network-known-class-detector
- Dataset: https://huggingface.co/datasets/NullRabbit/nr-bundles-public
- CVE-2018-17144 (Bitcoin Core): https://bitcoincore.org/en/2018/09/20/notice/
- CVE-2024-55563: https://nvd.nist.gov/vuln/detail/CVE-2024-55563
- CVE-2024-52919 (Bitcoin Core): https://bitcoincore.org/en/2025/04/28/disclose-cve-2024-52919/
- CVE-2016-10724: https://nvd.nist.gov/vuln/detail/CVE-2016-10724
- CVE-2024-35202 (Bitcoin Core): https://bitcoincore.org/en/2024/10/08/disclose-blocktxn-crash/
- CVE-2013-5700: https://nvd.nist.gov/vuln/detail/CVE-2013-5700
- CVE-2025-46597 (Bitcoin Core): https://bitcoincore.org/en/2025/10/24/disclose-cve-2025-46597/
- CVE-2024-52922 (Bitcoin Core): https://bitcoincore.org/en/2024/11/05/cb-stall-hindering-propagation/
- CVE-2024-52920 (Bitcoin Core): https://bitcoincore.org/en/2024/07/03/disclose-getdata-cpu/
- CVE-2024-52916 (Bitcoin Core): https://bitcoincore.org/en/2024/07/03/disclose-header-spam/
- CVE-2019-25220 (Bitcoin Core): https://bitcoincore.org/en/2024/09/18/disclose-headers-oom/
- CVE-2024-52915 (Bitcoin Core): https://bitcoincore.org/en/2024/07/03/disclose-inv-buffer-blowup/
- CVE-2024-52913 (Bitcoin Core): https://bitcoincore.org/en/2024/07/03/disclose_already_asked_for/
- CVE-2025-54605 (Bitcoin Core): https://bitcoincore.org/en/2025/10/24/disclose-cve-2025-54605/
- CVE-2018-17145 (Invdos): https://invdos.net/
- CVE-2024-52921 (Bitcoin Core): https://bitcoincore.org/en/2024/10/08/disclose-mutated-blocks-hindering-propagation/
- CVE-2024-52914 (Bitcoin Core): https://bitcoincore.org/en/2024/07/03/disclose-orphan-dos/
- CVE-2015-3641 (Bitcoin Core): https://bitcoincore.org/en/2024/07/03/disclose_receive_buffer_oom/
- CVE-2013-4627: https://nvd.nist.gov/vuln/detail/CVE-2013-4627
- CVE-2025-46598 (Bitcoin Core): https://bitcoincore.org/en/2025/10/24/disclose-cve-2025-46598/
- CVE-2025-54604 (Bitcoin Core): https://bitcoincore.org/en/2025/10/24/disclose-cve-2025-54604/
- CVE-2024-52912 (Bitcoin Core): https://bitcoincore.org/en/2024/07/03/disclose-timestamp-overflow/
