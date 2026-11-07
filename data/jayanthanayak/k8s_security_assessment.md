# JayanthaNayak/k8s_security_assessment

## Resumen

`JayanthaNayak/k8s_security_assessment` es un repositorio publicado en Hugging Face que no contiene un modelo de lenguaje ni una red neuronal entrenada con pesos en formato estándar, sino un artefacto serializado con `joblib` (0,2 GB) asociado a la plataforma "Kubernetes ML Security Assessment Platform v2.0.0". Según la model card del autor, el paquete forma parte de un conjunto de herramientas CNAPP (Cloud-Native Application Protection Platform) que combina análisis estático AST de manifiestos Kubernetes, inspección de capas de imágenes de contenedor, detección de anomalías en telemetría de runtime y un webhook de admisión en clúster.

El componente de aprendizaje automático descrito se articula en torno a dos modelos: el "Model 11", un ensemble de stacking con Ridge no negativo que combina XGBoost, Random Forest y modelos de dominio consolidados para puntuar el riesgo de cargas de trabajo, y el "Model 12", un detector de anomalías no supervisado basado en Isolation Forest y modelos de mezcla gaussiana (GMM) que opera sobre métricas de Prometheus. La model card menciona además un veto determinista de exploits catastróficos que limita la puntuación de riesgo a 35,0/100 cuando se detectan contenedores privilegiados, namespaces de host o capacidades peligrosas.

La relevancia del artefacto es acotada: se trata de un proyecto personal con cero descargas, sin pipeline declarado, sin licencia especificada en los metadatos de Hugging Face y sin idiomas declarados. No es un modelo fundacional ni un LLM, por lo que las comparativas habituales de benchmarks de lenguaje no aplican; su interés reside en el enfoque de seguridad de contenedores y en la ingeniería de reglas y ensembles descrita, no en capacidades generativas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Ensemble de stacking (Ridge no negativo) sobre XGBoost, Random Forest y modelos de dominio; detector de anomalías con Isolation Forest y GMM (Model 12) |
| Parámetros totales | no disponible (artefacto `joblib` de 0,2 GB; no se especifica el número de parámetros) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible (formato `joblib`, no cuantizable como pesos de red neuronal) |
| Idiomas soportados | no disponible en los metadatos; la model card está redactada en inglés |
| Licencia | no disponible en los metadatos de Hugging Face; la model card enlaza un badge Apache-2.0 en el repositorio de GitHub asociado |
| Formato de pesos | `joblib` (serialización de scikit-learn / XGBoost) |

## Arquitectura y entrenamiento

El repositorio no documenta el proceso de entrenamiento con el nivel de detalle habitual de un modelo fundacional. La model card describe un pipeline de seguridad con cuatro planos: ingesta de telemetría (manifiestos Kubernetes, imágenes de contenedor y métricas de Prometheus), motores de amenazas (escáner AST nativo con 56 reglas V01–V56, desempaquetador de capas en Python puro para Debian/Ubuntu/Alpine y base de datos SQLite embebida con 349+ CVEs), inteligencia ML (Model 11 y Model 12) y enforcement (CLI, webhooks de admisión mutante y validador, consola web y chart de Helm).

El "Model 11" se presenta como un ensemble de stacking dinámico con pesos 0,92 XGBoost + 0,08 Random Forest + 0,0002 de modelo sintético, con actualización bayesiana Beta-Binomial para incertidumbre epistémica y un veto determinista de exploits que fija la puntuación máxima en 35,0 ante configuraciones peligrosas. El "Model 12" es no supervisado y se entrena únicamente con comportamiento normal de contenedores, con actualizaciones de línea base mediante media móvil exponencial (EMA) y salvaguardas anti-envenenamiento. No se especifican el volumen de datos de entrenamiento, la composición del dataset ni si hubo ajuste por refuerzo o preferencias; tampoco se detalla la innovación de decodificación especulativa ni atención lineal, que no aplican a este tipo de modelo tabular.

## Capacidades

- Puntuación de riesgo de cargas de trabajo Kubernetes a partir de 17 características de seguridad extraídas de manifiestos.
- Detección de secretos filtrados mediante entropía de Shannon con umbral H > 3,8 (claves, JWT, credenciales cloud).
- Análisis estático AST de manifiestos con 56 reglas (V01–V56) en 2–8 ms por carga de trabajo, según el autor.
- Inspección de capas de imágenes de contenedor y generación de SBOM para Debian, Ubuntu y Alpine en menos de 600 ms.
- Consulta de CVEs contra una base SQLite embebida con 349+ entradas y latencia de microsegundos.
- Detección de anomalías de runtime no supervisada sobre métricas de Prometheus (CPU, memoria, red TX/RX).
- Veto determinista de exploits críticos que limita la puntuación de riesgo a 35,0/100.
- Webhook de admisión validador (HTTP 403 ante incumplimiento) y mutador (JSONPatch RFC 6902 para inyectar `securityContext` de mínimo privilegio).
- CLI unificada `k8s-sec` con 9 subcomandos (scan, scan-image, remediate, daemon, ebpf, entre otros).
- Interceptación de syscalls eBPF (`execve`, `openat`, `ptrace`, `connect`) con latencia declarada inferior a 0,5 ms.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni agentes multi-paso.

## Casos de uso

- Puerta de seguridad en CI/CD: integración del escáner AST y del ensemble de riesgo en pipelines de GitHub Actions para bloquear manifiestos con configuraciones peligrosas antes del despliegue, aprovechando la latencia de milisegundos declarada.
- Admisión en clúster: despliegue del webhook validador en un clúster de producción para rechazar pods privilegiados o con `hostNetwork` y devolver un resumen de remediación basado en MITRE.
- Endurecimiento automático de despliegues: uso del webhook mutador para inyectar `runAsNonRoot`, `readOnlyRootFilesystem` y `capabilities.drop: ALL` en cargas que no los declaren.
- Auditoría de imágenes de contenedor: escaneo de capas y paquetes del sistema operativo para generar SBOM y cruzar versiones contra la base de CVEs embebida antes de publicar una imagen.
- Detección de anomalías en producción: ejecución del daemon con el Model 12 sobre métricas de Prometheus para identificar desviaciones de comportamiento sin necesidad de datos etiquetados de exploits.
- Detección de secretos en repositorios de infraestructura: análisis de entropía sobre manifiestos y ficheros de configuración para localizar claves y tokens filtrados antes de un commit.
- Respuesta a incidentes en runtime: uso del módulo eBPF para interceptar shells no permitidas, herramientas de reconocimiento y conexiones a puertos C2 conocidos (4444, 1337).
- Cuadro de mando de cumplimiento: consola web en el puerto 8080 para revisar puntuaciones de cumplimiento por flota y aplicar remediación en un clic.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible en el sentido habitual (MMLU, HumanEval, GSM8K). La model card incluye métricas propias del sistema, que se recogen a continuación tal como las declara el autor, sin verificación independiente:

| Métrica declarada | Valor | Contexto |
|---|---|---|
| Precisión zero-shot del Model 11 | 100 % | Sobre 10 charts de Helm de terceros (GitLab, Prometheus, Cert-Manager, Vault, etc.) |
| Falsos negativos en exploits críticos | 0,0 % | Gracias al veto determinista |
| Latencia del escáner AST | 2–8 ms por carga | 56 reglas V01–V56 |
| Latencia del desempaquetador de capas | < 600 ms | Debian, Ubuntu, Alpine |
| Latencia de consulta CVE | < 1 ms | SQLite embebida, 349+ CVEs |
| Latencia de detección eBPF | < 0,5 ms | Syscalls `execve`, `openat`, `ptrace`, `connect` |
| Tests del proyecto | 596 superados | Según badge del repositorio |

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido de un LLM; el artefacto `joblib` de 0,2 GB se carga en memoria RAM. Se recomienda al menos 1–2 GB de RAM libre para el modelo y la base SQLite asociada.
- GPU recomendadas: no se especifican; el ensemble XGBoost/Random Forest puede ejecutarse en CPU. No se documenta soporte CUDA.
- Compatibilidad con GPU de consumo: no disponible; el diseño descrito es CPU-céntrico (Python puro, SQLite embebida, streaming en memoria).
- Opciones de despliegue: CLI `k8s-sec` (`pip install -e .` o binario en `bin/k8s-sec`), chart de Helm `charts/k8s-security` v2.0.0 con automatización TLS vía Cert-Manager y ServiceMonitors de Prometheus, consola web en el puerto 8080 y webhooks en HTTPS :8443. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican.
- Latencia y throughput: el autor declara 2–8 ms por workload en el escáner AST, menos de 600 ms en el desempaquetado de capas y menos de 0,5 ms en la interceptación eBPF. No se publican cifras de throughput agregado.

## Comparativa con modelos similares

| Herramienta | Enfoque | Contexto / alcance | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `JayanthaNayak/k8s_security_assessment` | Ensemble ML + reglas AST + eBPF + webhooks | Manifiestos, imágenes, runtime Prometheus | 2–8 ms por workload; 100 % zero-shot según el autor | No disponible en HF; badge Apache-2.0 en GitHub | Hugging Face, 0 descargas |
| Kubescape | Reglas y controles de seguridad Kubernetes | Manifiestos y clúster | Referenciado por el autor como más lento (1.000x–3.000x) | Apache-2.0 | Proyecto open source consolidado |
| Trivy | Escaneo de vulnerabilidades de imágenes y manifiestos | Imágenes, SBOM, IaC | Referenciado por el autor como más lento | Apache-2.0 | Proyecto open source consolidado |
| `JayanthaNayak/K8s_Security_tool` | Clasificación tabular con Random Forest | 17 características de seguridad | No disponible | MIT | Hugging Face, 1 like |

No se dispone de datos independientes que permitan verificar las comparativas de latencia declaradas por el autor frente a Kubescape o Trivy.

## Limitaciones y advertencias

- El repositorio no declara licencia en los metadatos de Hugging Face; la model card enlaza un badge Apache-2.0 al repositorio de GitHub, pero la licencia efectiva del artefacto publicado no está confirmada. Verificar antes de cualquier uso comercial.
- No hay pipeline, idiomas ni descargas declarados; el proyecto tiene cero descargas y un único like, lo que indica ausencia de validación por parte de la comunidad.
- Las métricas de rendimiento (100 % zero-shot, 0,0 % de falsos negativos, latencias de milisegundos) proceden exclusivamente del autor y no han sido replicadas de forma independiente.
- El artefacto es un `joblib` de 0,2 GB sin documentación de esquema de características, versiones de dependencias ni procedimiento de reproducción del entrenamiento; la integración en producción requeriría ingeniería inversa del pipeline.
- El veto determinista que limita la puntuación a 35,0 puede enmascarar la severidad relativa entre distintos exploits críticos, ya que colapsa varios escenarios en un mismo techo.
- El Model 12 no supervisado depende de una línea base de comportamiento normal; cambios legítimos en la carga de trabajo pueden generar falsos positivos si la EMA no se ajusta adecuadamente.
- La base CVE embebida con 349+ entradas es reducida frente a los feeds NVD/GHSA completos y requiere sincronización con OSV.dev para no quedar desactualizada.
- No se documentan sesgos ni evaluación de robustez frente a manifiestos adversariales diseñados para evadir las 56 reglas AST.
- Riesgo de alucinación: no aplica en el sentido de un LLM, pero el sistema puede producir falsos negativos ante configuraciones no cubiertas por las reglas o el espacio de características del ensemble.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JayanthaNayak/k8s_security_assessment
- Modelo relacionado `K8s_Security_tool`: https://huggingface.co/JayanthaNayak/K8s_Security_tool
- Perfil del autor en Hugging Face: https://huggingface.co/JayanthaNayak
- Repositorio GitHub referenciado en la model card: https://github.com/Jayanthanayak/K8S-security-assessment
- Workflow de CI de seguridad: https://github.com/Jayanthanayak/K8S-security-assessment/actions/workflows/k8s_security_gate.yml
- OSV.dev (fuente de feeds CVE citada): https://osv.dev
