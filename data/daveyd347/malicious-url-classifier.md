# DaveyD347/malicious-url-classifier

## Resumen

`DaveyD347/malicious-url-classifier` es un clasificador binario de URLs (benigna o maliciosa) publicado en Hugging Face por el usuario DaveyD347. No es un modelo de lenguaje neuronal, sino un pipeline clásico de scikit-learn basado en regresión logística sobre tres bloques de características: TF-IDF de n-gramas de caracteres, TF-IDF de tokens etiquetados por posición en la URL y 31 comprobaciones binarias de "banderas rojas" (red flags) derivadas del parseo estructural del URL. El objetivo declarado es detectar phishing, distribución de malware y estafas a partir exclusivamente del texto de la URL.

El modelo destaca por su enfoque de explicabilidad: además de emitir una probabilidad de malicia, devuelve las señales concretas que han activado la decisión (marca suplantada, IP literal, truco del `@`, punycode, TLD abusado, hosting gratuito o DNS dinámico, descarga de ejecutable, redirección abierta, correo de víctima prellenado, etc.). Su tamaño es de aproximadamente 0,8 MB de pesos en JSON, lo que permite ejecutarlo íntegramente en navegador o en dispositivos con recursos mínimos.

Es relevante ahora porque cubre un hueco práctico en pipelines de seguridad: filtrado de URL de bajo coste, latencia mínima y auditable, frente a alternativas neuronales mucho más pesadas. La licencia Apache 2.0 y la disponibilidad de pesos en formato skops y JSON facilitan su integración tanto en Python como en JavaScript. El modelo está entrenado y evaluado sobre un dataset sintético generado a partir de plantillas, con particiones diseñadas para medir generalización a plantillas no vistas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Regresión logística sobre características TF-IDF (n-gramas de caracteres 3-5, tokens posicionales) y 31 banderas rojas rule-based |
| Parámetros totales | No disponible (modelo lineal; ~0,8 MB de pesos en JSON) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa una URL por inferencia; no aplica ventana de contexto) |
| Tipos de cuantización | No aplica (pesos lineales en JSON/skops; no hay cuantización neuronal) |
| Idiomas soportados | en (inglés; las URLs y marcas del dataset están en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | skops (`model.skops`) y JSON (`model.json`), con implementación JS (`model.js`, `urlflags.js`) |

## Arquitectura y entrenamiento

El modelo es un clasificador lineal de regresión logística que combina tres bloques de características extraídas de la URL: (1) TF-IDF de n-gramas de caracteres de orden 3 a 5 sobre la URL sin esquema, con 30.000 términos, orientado a capturar sustituciones tipo `c0ntoso`, patrones como `-secure-` o `.top`, y rutas como `/wp-content/`; (2) TF-IDF de tokens etiquetados por posición sintáctica, con 2.900 términos, donde prefijos como `h:`, `p:`, `tld:`, `ext:`, `qk:` y `port:` distinguen si un término aparece en hostname, ruta, TLD, extensión, clave de query o puerto; y (3) 31 banderas binarias rule-based calculadas sobre el URL parseado. Los pesos de cada bloque se escalan mediante `flag_scale` antes de entrar en el clasificador.

El entrenamiento se realizó sobre las particiones train y validation de un dataset sintético compuesto por URLs generadas a partir de 168 plantillas agrupadas en 53 familias (por ejemplo, "marca en subdominio", "descarga de ejecutable", "entrada de blog"). La partición de test emplea plantillas no vistas, hosts de pools separados (marcas ficticias distintas, sitios populares y nombres generados) y cuatro familias completas presentes solo en test (estafas de cartera cripto, estafas de soporte técnico, enlaces de medios y endpoints de API). El conjunto de desafío (challenge set) consta de 60 URLs escritas a mano. No se documenta uso de RLHF, DPO ni ajuste neuronal; el umbral de decisión (0,5) se seleccionó por validación cruzada. Se realizaron ablaciones: solo banderas rojas alcanzan 0,933 de accuracy en test con 6,0 % de falsos positivos; solo TF-IDF alcanza 0,869 con 7,8 %; la combinación llega a 0,962 con 2,6 %, indicando que las banderas aportan la mayor parte de la señal y las características textuales reducen falsos positivos. Existe una prueba de paridad entre las implementaciones Python y JavaScript sobre 4.579 URLs, con banderas, spans de resaltado y streams de tokens idénticos y probabilidades con diferencia máxima de 3e-6.

## Capacidades

- Clasificación binaria de URL como benigna o maliciosa con probabilidad de salida (`predict_proba`).
- Detección de phishing mediante suplantación de marca, subdominios de marca, lookalikes (`rn`→`m`, homóglifos) y punycode.
- Detección de trucos estructurales: `@` en autoridad, IP literal, puertos no estándar, TLDs abusados, hosting gratuito y DNS dinámico.
- Detección de entrega de malware mediante extensiones ejecutables (`.exe`) y patrones de descarga.
- Detección de redirecciones abiertas y correos de víctima prellenados.
- Explicabilidad nativa: devuelve la lista de banderas activadas con etiqueta legible por humano.
- Acepta entrada "defanged" (`hxxps://example[.]com`) sin preprocesado adicional.
- Procesamiento por lotes (hasta 2.000 URLs en el Space asociado).
- Implementación en Python (skops) y JavaScript sin dependencias, con paridad verificada.
- No dispone de tool calling, capacidades de agente, visión, audio ni modo thinking (no aplica a un clasificador lineal).
- Multilingüismo limitado: solo inglés; las marcas y plantillas del dataset están en inglés.

## Casos de uso

- Filtrado de URL en correo electrónico: el clasificador puntúa enlaces entrantes y activa las banderas correspondientes para que el equipo de seguridad revise casos dudosos; la explicabilidad permite mostrar al usuario por qué un enlace se ha marcado.
- Pasarela web o proxy corporativo: integración como primera capa de bajo coste antes de análisis más profundos (sandbox, antivirus), gracias a la latencia mínima de un modelo lineal y a la posibilidad de ejecutarlo en el propio proxy.
- Extensión de navegador o cliente de mensajería: los pesos JSON y la implementación JS permiten clasificar URLs localmente sin enviar datos a un servidor, con privacidad por defecto.
- Enriquecimiento de alertas SOC: añadir la probabilidad y las banderas activadas a eventos de phishing o malware, reduciendo el tiempo de triaje y aportando contexto auditable.
- Detección de suplantación de marca en campañas de monitorización: las comprobaciones de lookalike y de marca en subdominio identifican dominios que imitan marcas conocidas, útil para equipos de protección de marca.
- Prellenado de listas de bloqueo: clasificación por lotes de hasta 2.000 URLs para generar candidatos a blocklist que luego se validan manualmente.
- Formación y concienciación: la salida de banderas rojas puede usarse para explicar a usuarios no técnicos qué señales hacen sospechosa una URL.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados):

| Conjunto | Accuracy | Precision | Recall | Macro F1 | ROC AUC | Tasa de falsos positivos |
|---|---:|---:|---:|---:|---:|---:|
| test (12.400, plantillas no vistas) | 0,962 | 0,973 | 0,949 | 0,962 | 0,989 | 2,6 % |
| test, familias nunca vistas en entrenamiento (3.840) | 0,995 | 0,996 | 0,994 | 0,995 | 1,000 | 0,4 % |
| test, plantillas nuevas de familias vistas (8.560) | 0,947 | 0,962 | 0,929 | 0,947 | 0,981 | 3,6 % |
| challenge (60, escritas a mano) | 0,983 | 1,000 | 0,967 | 0,983 | 1,000 | 0 % |

Todas las métricas se calculan con el umbral por defecto de 0,5.

Ablaciones (mismos datos y configuración):

| Configuración | Accuracy (test) | Falsos positivos |
|---|---:|---:|
| Solo banderas rojas | 0,933 | 6,0 % |
| Solo TF-IDF | 0,869 | 7,8 % |
| Combinado | 0,962 | 2,6 % |

Puntos débiles documentados por el autor: sitios de software con typosquatting (`fileziilla.org/download/...-setup.exe`) aciertan al 62 %; hosts tipo CloudFront (`d1a2b3c4d5e6f7.cloudfront.net/...`) al 63 %; dominios aleatorios estilo DGA con forma de ruta no vista al 78 %; señuelos de compartición de documentos en plantillas nuevas al 88 %. En el challenge set, el fallo es `arnazon-orders.net` (puntuación 0,42, marcado como "suspicious" en el Space), un lookalike `rn`→`m` de una marca que también es palabra de diccionario. URLs benignas que parecen arriesgadas puntúan bajo: inicio de sesión de Google y Microsoft con parámetros de redirección largos (2 % y 9 %), inicio de sesión de PayPal (7 %), instaladores de Python y Git (`.exe`, 9 %), `xn--mnchen-3ya.de` (5 %) y página de administración de router en `192.168.1.1` (4 %).

## Requisitos de hardware

- VRAM estimada: no aplica; modelo lineal de ~0,8 MB que se ejecuta en CPU y en memoria principal.
- GPU recomendadas: no aplica; no requiere GPU. Cualquier CPU moderna es suficiente, incluida ejecución en navegador.
- Cabe en cualquier GPU consumer y también en entornos sin GPU (servidores pequeños, contenedores, dispositivos edge).
- Opciones de despliegue: Python con `skops.io` y `huggingface_hub`; JavaScript sin dependencias (`model.js` + `urlflags.js`); Space de Hugging Face; integración en proxies, extensiones de navegador o funciones serverless.
- Latencia y throughput: no se publican cifras concretas; por la naturaleza del modelo (extracción de características y regresión logística) la latencia es de milisegundos por URL en CPU, y el Space admite lotes de hasta 2.000 URLs.

## Comparativa con modelos similares

No se dispone de comparaciones con otros modelos en la información proporcionada. Como referencia cualitativa, la categoría de clasificación de URL maliciosa incluye clasificadores neuronales basados en transformers (mayor coste computacional y menor explicabilidad nativa) y listas de bloqueo o motores heurísticos (menor cobertura de generalización). Este modelo se posiciona como opción lineal, ligera y explicable, pero entrenada sobre datos sintéticos, lo que limita la comparación directa con sistemas entrenados sobre tráfico real.

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DaveyD347/malicious-url-classifier | Regresión logística + TF-IDF + banderas | ~0,8 MB de pesos | No aplica | apache-2.0 | Hugging Face (skops/JSON) |
| Alternativas neuronales de clasificación de URL | Transformer | No disponible | No disponible | No disponible | No disponible en la información proporcionada |
| Listas de bloqueo / heurísticas | Rule-based | No aplica | No aplica | Variable | Amplia |

## Limitaciones y advertencias

- Entrenado sobre datos sintéticos generados por plantillas: la generalización a tráfico real no está validada más allá del challenge set de 60 URLs escritas a mano.
- Sesgo de dominio: las marcas, plantillas y hosts del dataset son ficticios o de sitios populares en inglés; el rendimiento en otros idiomas o mercados puede degradarse.
- Falsos positivos en URLs benignas con apariencia arriesgada: CDNs con hosts aleatorios, parámetros de redirección largos, instaladores `.exe`, dominios punycode y páginas de administración con IP privada.
- Falsos negativos en typosquatting de software no incluido en la lista de marcas, hosts CDN aleatorios y dominios DGA con rutas no vistas.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero las banderas son heurísticas y pueden producir explicaciones incompletas o engañosas si la URL está malformada.
- Dependencia de listas de marcas y TLDs: marcas o TLDs no contemplados reducen la detección.
- El formato `.skops` requiere comprobar los tipos no confiables (`get_untrusted_types`) antes de cargar modelos de terceros; es una advertencia de seguridad relevante en producción.
- Licencia Apache 2.0 permite uso comercial, pero no se ofrece garantía de rendimiento ni de exactitud en entornos reales.
- No sustituye un sandbox ni un antivirus: debe usarse como capa de triaje, no como decisión final de bloqueo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DaveyD347/malicious-url-classifier
- Space de demostración (detector de URL maliciosas): https://huggingface.co/spaces/DaveyD347/malicious-url-detector
- Dataset sintético referenciado en la model card: `data/` dentro del repositorio del modelo (tipo `DaveyD347/malicious-url-classifier`)
- Matriz de confusión: `eval/confusion_matrix.png` en el repositorio del modelo
- Código de preprocesado y entrenamiento: `src/train.py`, `src/urlflags.py`, `src/url_spec.json` en el repositorio del modelo
- Pesos y pipeline JavaScript: `model.json`, `model.js`, `urlflags.js` en el repositorio del modelo
- Pesos Python: `model.skops` en el repositorio del modelo
