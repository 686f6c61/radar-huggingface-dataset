# CobuildX-AI/cbx-secrets-detector-32M

## Resumen

cbx-secrets-detector-32M es un modelo de detección de secretos y credenciales desarrollado por CobuildX-AI. Se trata de un clasificador de tokens (token classification) de solo 32 millones de parámetros, ajustado a partir del codificador jhu-clsp/ettin-encoder-32m, una arquitectura basada en ModernBERT. Su función es localizar con precisión contraseñas, claves de API, tokens, claves privadas y credenciales de bases de datos o de la nube dentro de código, ficheros de configuración, logs, tickets y conversaciones de chat, devolviendo la posición exacta de cada valor junto con una de 12 etiquetas tipadas.

A diferencia de los escáneres basados en reglas (Gitleaks, TruffleHog, detect-secrets), el modelo lee el contexto: es capaz de detectar contraseñas y claves sin prefijos fijos reconocibles y, a la vez, ignorar placeholders, referencias a variables, hashes y valores de ejemplo claramente falsos. Según los benchmarks publicados por el autor, supera con claridad a estos escáneres en F1 sobre los conjuntos de prueba CredData y de informes de incidencias.

Es relevante ahora porque la prevención de fugas de credenciales en repositorios, pipelines de CI/CD y sistemas de soporte es un problema de seguridad crítico, y este modelo ofrece una alternativa neuronal ligera: unos 8 ms por cada 1.000 tokens en GPU y 81 ms en CPU, lo que lo hace viable tanto para escaneo masivo como para integración en tiempo real. Esta versión de 32M es la recomendada por defecto por el autor, existiendo también una variante más ligera de 17M.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT (codificador transformer), fine-tune de jhu-clsp/ettin-encoder-32m |
| Parámetros totales | 31.892.761 |
| Parametros activos | no disponible (no es MoE; todos los parámetros están activos) |
| Longitud de contexto | 7.999 tokens en una sola pasada; textos más largos se dividen automáticamente en fragmentos con solapamiento |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repo: 0,1 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de ettin-encoder-32m (JHU CLSP), un codificador de la familia Ettin basado en la arquitectura ModernBERT (referenciada en arXiv:2410.23657 y arXiv:2507.11412). Se trata de un modelo encoder-only entrenado para clasificación de tokens al estilo NER, lo que le permite delimitar los spans exactos de cada secreto en el texto, no solo señalar que una línea contiene algo sensible.

Sobre los datos de entrenamiento, la model card indica que incluye parte de un dataset de informes de incidencias de Ahmed et al. y datos generados por los propios generadores de CobuildX, con una guía de anotación asociada. El conjunto de prueba propio (CBX secrets test) procede de los mismos generadores que parte del entrenamiento, por lo que el autor advierte que esas cifras sobreestiman el rendimiento en texto real; los benchmarks CredData y de informes de incidencias son la referencia más fiable. No se ha publicado información sobre el número total de tokens de entrenamiento ni sobre el uso de RLHF o DPO (no aplicables a un modelo encoder de clasificación).

## Capacidades

- Detección y localización exacta (start/end) de secretos en texto, código, ficheros de configuración, logs, tickets y chats.
- Clasificación en 12 etiquetas: PASSWORD, DATABASE_CREDENTIAL, API_KEY, ACCESS_TOKEN, JWT_TOKEN, SESSION_SECRET, WEBHOOK_SECRET, CLOUD_CREDENTIAL, PRIVATE_KEY, CERTIFICATE_SECRET, ENCRYPTION_KEY y GENERIC_SECRET.
- Detección contextual: encuentra secretos sin prefijos fijos (contraseñas, claves hexadecimales sin formato reconocible).
- Filtrado de falsos positivos: ignora referencias como `${API_KEY}` u `os.environ["X"]`, placeholders (`<your-api-key>`, `CHANGEME`), valores enmascarados, identificadores (UUID, AWS access key IDs, nombres de usuario), claves públicas y certificados, hashes y digests (incluidos SHAs de git) y valores de ejemplo documentados como `[REDACTED]`.
- API de alto nivel incluida en el repo (`cbx_secrets.py`, clase `SecretDetector`) con métodos `extract()` y `redact()`, soporte de filtrado por etiquetas y plantilla personalizada de redacción.
- Manejo automático de textos largos mediante división en fragmentos con solapamiento.
- Selección automática de GPU si está disponible, con ejecución viable en CPU.

## Casos de uso

- Escaneo de repositorios antes de hacer push: integración en hooks de pre-commit o pre-push para detectar credenciales en código y ficheros de configuración antes de que lleguen al repositorio remoto, con la ventaja de detectar secretos sin prefijo que Gitleaks y similares no capturan.
- Prevención de fugas en CI/CD: como paso del pipeline, escaneando diffs y artefactos de build; con ~8 ms por 1.000 tokens en GPU no añade latencia significativa al pipeline.
- Redacción automática en sistemas de soporte y chat: el método `redact()` sustituye cada secreto por su etiqueta (o plantilla personalizada), útil para limpiar tickets, logs y conversaciones antes de enviarlas a LLMs de terceros o almacenarlas.
- Auditoría de logs históricos: escaneo masivo de logs de aplicación buscando claves de sesión, tokens de acceso y credenciales de base de datos que se registraron por error.
- Detección en plataformas de colaboración: revisión de issues, pull requests y comentarios en busca de credenciales pegadas accidentalmente, gracias a su entrenamiento con datos de informes de incidencias.
- Cumplimiento y DLP en la nube: clasificación tipada en 12 categorías que permite aplicar políticas distintas según el tipo de secreto (por ejemplo, priorizar claves privadas PEM y credenciales de nube sobre genéricos).
- Filtrado de entradas para LLMs: usar el modelo como capa previa que redacte secretos en prompts de usuario antes de que lleguen a un modelo de lenguaje en producción.

## Benchmarks y rendimiento

Span F1 (agnóstico de etiqueta), con precisión y recall entre paréntesis. "Falsas alarmas" es el porcentaje de líneas o candidatos no secretos etiquetados sobre los que se marca algo.

| Modelo | CredData test | Falsas alarmas | Issue reports test | Falsas alarmas | CBX secrets test |
|---|---:|---:|---:|---:|---:|
| cbx-secrets-detector-17M | 0,805 (0,80 / 0,81) | 0,9 % | 0,836 (0,90 / 0,78) | 0,9 % | 0,983 (0,99 / 0,98) |
| **cbx-secrets-detector-32M** | **0,820 (0,77 / 0,87)** | 1,3 % | **0,861 (0,86 / 0,86)** | 1,4 % | **0,998 (1,00 / 1,00)** |
| Gitleaks 8.30.1 | 0,442 (0,90 / 0,29) | 0,6 % | 0,678 (0,93 / 0,54) | 0,5 % | 0,757 (0,99 / 0,61) |
| detect-secrets 1.5.0 | 0,460 (0,47 / 0,45) | 9,8 % | 0,290 (0,40 / 0,23) | 4,0 % | 0,626 (0,90 / 0,48) |
| TruffleHog 3.99.2 | 0,042 (0,38 / 0,02) | 0,8 % | 0,228 (0,66 / 0,14) | 0,9 % | 0,215 (1,00 / 0,12) |

Datos adicionales: en CBX secrets test exigiendo coincidencia exacta de etiqueta, el modelo obtiene 0,991, con F1 por etiqueta entre 0,98 (PASSWORD, SESSION_SECRET) y 1,00 (CERTIFICATE_SECRET, DATABASE_CREDENTIAL, JWT_TOKEN, PRIVATE_KEY, WEBHOOK_SECRET). El autor advierte que CBX secrets test comparte generadores con parte del entrenamiento y sobreestima el rendimiento en texto real.

Rendimiento de inferencia: aproximadamente 8 ms por 1.000 tokens en GPU y 81 ms por 1.000 tokens en CPU. Respecto a la variante 17M, es unas 1,25 veces más lenta en GPU y 2,2 veces en CPU.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como cifra exacta; con 32 millones de parámetros en safetensors (repo de 0,1 GB), el modelo completo ocupa del orden de decenas de MB en memoria, por lo que es viable en cualquier GPU moderna con 1-2 GB de VRAM libres.
- GPU recomendadas: cualquier GPU compatible con PyTorch; no se requiere hardware especial dado el tamaño del modelo.
- Cabe sobradamente en GPUs de consumo: cualquier RTX de la serie 30/40, e incluso GPUs integradas o portátiles, ejecutarán el modelo sin problemas.
- Ejecución en CPU es plenamente viable: 81 ms por 1.000 tokens permite escaneo en tiempo real sin GPU.
- Despliegue: el repo incluye su propio wrapper (`cbx_secrets.py` con `SecretDetector`) y un `requirements.txt`; se descarga con `hf download` fijando la revisión `v0.1`. No hay menciones a soporte de vLLM, llama.cpp, Ollama o TGI (al ser un encoder de token classification, la vía natural es PyTorch/Transformers con el wrapper incluido).
- Latencia: ~8 ms por 1.000 tokens en GPU; ~81 ms por 1.000 tokens en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | CredData F1 | Licencia | Disponibilidad |
|---|---|---|---:|---|---|
| cbx-secrets-detector-32M | 31,9 M | Detección de secretos (12 etiquetas) | 0,820 | Apache 2.0 | HuggingFace, pesos abiertos |
| cbx-secrets-detector-17M | no disponible | Detección de secretos (12 etiquetas) | 0,805 | Apache 2.0 | HuggingFace, pesos abiertos |
| Gitleaks 8.30.1 | no aplicable (reglas) | Detección de secretos por patrones | 0,442 | no disponible | Escáner open source offline |
| detect-secrets 1.5.0 | no aplicable (reglas) | Detección de secretos por patrones | 0,460 | no disponible | Escáner open source offline |
| TruffleHog 3.99.2 | no aplicable (reglas) | Detección de secretos por patrones | 0,042 | no disponible | Escáner open source offline |

La alternativa directa dentro de la misma familia es cbx-secrets-detector-17M: ligeramente menos preciso en los tres benchmarks, pero más rápido (0,8 veces del tiempo en GPU y 0,45 en CPU del modelo de 32M). Frente a los escáneres basados en reglas, el modelo de 32M triplica o casi duplica el F1 en CredData y en informes de incidencias, aunque los escáneres tradicionales generan algo menos de falsas alarmas (0,5-0,9 % frente a 1,3-1,4 %).

## Limitaciones y advertencias

- El modelo no puede determinar si un valor realista es una credencial activa: un secreto real se etiqueta aunque su nombre de variable diga "test" o "example", lo que puede generar falsos positivos en código de demostración con valores inventados realistas.
- La tasa de falsas alarmas (1,3-1,4 % en los benchmarks externos) es superior a la de Gitleaks y TruffleHog, relevante si se usa para bloquear commits automáticamente.
- Los resultados de CBX secrets test (0,998) sobreestiman el rendimiento real al compartir generadores con el entrenamiento; para estimar el comportamiento en producción deben usarse las cifras de CredData (0,820) e Issue reports (0,861).
- Entrenado y evaluado solo en inglés; no hay datos sobre rendimiento en texto o código con comentarios e identificadores en otros idiomas.
- Los valores usados en la documentación son inventados; no constituyen credenciales reales.
- Licencia Apache 2.0: permite uso comercial sin restricciones significativas más allá de conservar el aviso de licencia.
- Es la versión v0.1, una primera release; se recomienda fijar la revisión (`--revision v0.1`) para reproducibilidad.
- Al ser un clasificador de tokens, no verifica contra APIs de proveedores si una clave filtrada sigue siendo válida; conviene combinarlo con validación activa en flujos de respuesta a incidentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CobuildX-AI/cbx-secrets-detector-32M
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-32m
- Variante 17M: https://huggingface.co/CobuildX-AI/cbx-secrets-detector-17M
- Benchmark CredData (Samsung): https://github.com/Samsung/CredData
- Paper ModernBERT (arXiv): https://arxiv.org/abs/2410.23657
- Paper Ettin (arXiv): https://arxiv.org/abs/2507.11412
