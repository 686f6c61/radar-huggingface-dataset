# saidutta69/PhishScout-v2

## Resumen

PhishScout-v2 es un clasificador ligero de URLs diseñado para detectar phishing en tiempo real, desarrollado por saidutta69. A diferencia de los modelos de lenguaje de gran tamaño, este modelo emplea un gradiente boosting (LightGBM) convertido a ONNX, con un tamaño de apenas 896 KB, lo que permite su ejecución íntegramente en el dispositivo sin necesidad de GPU, conexión a la nube ni llamadas a APIs externas. Su objetivo es clasificar URLs como legítimas o fraudulentas basándose únicamente en la estructura de la URL, sin analizar el contenido de la página.

El modelo combina 579 características: 66 señales estructuradas (longitud de subdominios, presencia de homoglyphs, distancia de edición con marcas conocidas, trucos de TLD, etc.) y 512 n-gramas de caracteres sin estado calculados con hash FNV-1a, lo que le permite capturar patrones léxicos difíciles de modelar manualmente. Está entrenado sobre el dataset PhishTrap, que se actualiza automáticamente cada 6 horas con fuentes como OpenPhish, Phishing.Database, PhishStats y Tranco. Su latencia media de inferencia es de unos 24 microsegundos por URL en CPU, lo que lo hace adecuado para filtrado en tiempo real en extensiones de navegador, pasarelas de correo o cortafuegos.

La relevancia actual de PhishScout-v2 radica en su enfoque de privacidad y eficiencia: al ejecutarse localmente, no se filtran datos del usuario, funciona sin conexión y puede integrarse en entornos con recursos limitados. Además, incluye una etapa opcional de enriquecimiento con la página y el certificado TLS cuando hay red disponible, mejorando la detección de casos de phishing en dominios legítimos comprometidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LightGBM (gradient boosting) convertido a ONNX |
| Parametros totales | 200 arboles, max_depth 10, 63 hojas (no es un modelo de red neuronal) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificacion de URLs, no generacion de texto) |
| Tipos de cuantizacion | no disponible (el modelo se distribuye en ONNX, sin cuantizacion documentada) |
| Idiomas soportados | no disponibles (el modelo opera sobre URLs, no sobre texto libre) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 15) |

## Arquitectura y entrenamiento

PhishScout-v2 se basa en un modelo de gradient boosting con LightGBM, configurado con 200 arboles, profundidad maxima 10 y 63 hojas. La entrada no es texto bruto, sino un vector de 579 caracteristicas extraidas de la URL: 66 señales estructuradas (como numero de puntos, longitud del subdominio, entropia, presencia de homoglyphs, distancia de edicion con marcas conocidas, trucos de TLD, etc.) y 512 n-gramas de caracteres sin estado, calculados con un hash FNV-1a portable para que la extraccion en el navegador coincida con la del entrenamiento. Estas caracteristicas se alimentan al modelo, que produce una probabilidad calibrada mediante Platt scaling (sigmoid) sobre la validacion.

El entrenamiento se realizo sobre el dataset PhishTrap, que se actualiza automaticamente cada 6 horas combinando fuentes publicas de phishing (OpenPhish, Phishing.Database, PhishStats) y listas de dominios legitimos (Tranco). El tiempo de entrenamiento fue de aproximadamente 5 segundos en CPU. La conversion a ONNX garantiza una paridad del 100% con las predicciones del LightGBM original. El modelo es totalmente determinista: la varianza en F1 y AUC entre 10 semillas diferentes es 0.0000.

Una innovacion destacable es la etapa opcional de enriquecimiento: cuando hay conexion a red, el modelo puede consultar la pagina y el certificado TLS para recuperar casos que el analisis de URL por si solo no detecta (por ejemplo, phishing en dominios legitimos comprometidos). Esta etapa se activa solo si la red esta disponible y se degrada al modelo base en caso de fallo.

## Capacidades

- Clasificacion binaria de URLs como phishing o legitima, con probabilidad calibrada.
- Deteccion de tecnicas de evasion como homoglyphs (caracteres Unicode similares a ASCII), IDN homographs, typosquatting (distancia de edicion con marcas conocidas), trucos de TLD (por ejemplo, TLD que parecen .com), uso de acortadores de URLs y URLs con IPs codificadas en octal, decimal o dword.
- Analisis de estructura de URL: numero de puntos, longitud de subdominios, entropia del subdominio, presencia de digitos en el dominio, etc.
- Funcionamiento completamente offline y sin envio de datos a terceros.
- Inferencia de muy baja latencia (~24 microsegundos por URL en CPU).
- Etapa opcional de enriquecimiento con pagina y certificado TLS cuando hay conexion (aumenta el recall en phishing de dominios confiables).
- Compatible con cualquier entorno que ejecute ONNX Runtime: Python, Node.js, navegador (ONNX Runtime Web), moviles.
- Sin soporte para generacion de texto, razonamiento, codigo, vision o tool calling (no es un LLM).

## Casos de uso

- Extension de navegador para filtrado en tiempo real: el modelo se ejecuta localmente en el navegador mediante ONNX Runtime Web, analizando cada URL antes de que el usuario navegue o haga clic. No se envian datos fuera del dispositivo y funciona sin conexion.
- Clientes de correo electronico y mensajeria: inspeccion de enlaces antes de hacer clic en correos o chats, alertando al usuario sobre posibles URLs de phishing sin depender de servicios en la nube.
- Aplicaciones de escaneo de codigos QR y SMS: decodificacion de URLs y clasificacion inmediata antes de abrirlas, protegiendo contra enlaces maliciosos en mensajes de texto o codigos QR impresos.
- Pasarelas de correo y cortafuegos: como primer filtro ligero, clasificando URLs con latencia de microsegundos y derivando las de alta probabilidad a sandboxing mas pesado.
- Filtrado a nivel de proxy o DNS: clasificacion de URLs solicitadas en el borde de la red con un coste computacional minimo, ideal para entornos con muchos usuarios.
- Enriquecimiento de SIEM/SOAR: clasificacion por lotes de URLs extraidas de logs, tickets o datos de incidentes para priorizar alertas de seguridad.
- Investigacion y pipelines de datos: triaje de URLs en rastreadores, medicion de tendencias de phishing y uso como linea base en benchmarks de deteccion.

## Benchmarks y rendimiento

El autor proporciona resultados sobre el conjunto de prueba (test split, held out, seed 42, sin fuga de test). No se comparan con otros modelos externos.

| Metrica | Valor (sin calibrar) | Valor (calibrado) |
|---|---|---|
| Accuracy | 0.8995 | 0.8981 |
| Precision | 0.9229 | 0.9180 |
| Recall | 0.8717 | 0.8744 |
| F1 | 0.8966 | 0.8957 |
| ROC AUC | 0.9615 | 0.9615 |

Matriz de confusion (umbral por defecto 0.5): TP=1252, FP=116, FN=245, TN=1381.

Robustez frente a perturbaciones (comparativa v1 vs v2):

| Perturbacion | v1 F1 | v2 F1 |
|---|---|---|
| Limpio | 0.8626 | 0.8966 |
| Corrupcion de valores extremos al 5% | 0.8080 | 0.8306 |
| Ruido gaussiano sigma=0.5 | 0.7097 | 0.6699 |

El autor indica que la caida con ruido gaussiano se debe a que los n-gramas densos amplifican el ruido, pero es una prueba artificial; en inferencia real las caracteristicas se calculan exactamente.

Determinismo: varianza de F1 y AUC entre 10 semillas es 0.0000.

## Requisitos de hardware

- El modelo pesa 896.3 KB en formato ONNX, por lo que no requiere GPU ni VRAM dedicada; cabe en cualquier dispositivo, incluidos moviles y navegadores.
- Inferencia en CPU con latencia media de ~24 microsegundos por URL (mediana).
- Ejecucion posible en Python, Node.js, navegador (ONNX Runtime Web) y plataformas moviles.
- No se requieren GPUs especificas; cualquier CPU moderna es suficiente.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#), ONNX Runtime Web, ONNX Runtime Mobile, o integracion directa en extensiones de navegador.
- Para despliegues masivos (por ejemplo, en pasarelas de correo), se puede usar el mismo modelo en contenedores ligeros o funciones serverless.

## Comparativa con modelos similares

No se dispone de informacion sobre otros modelos de deteccion de phishing comparables en la documentacion proporcionada. El autor compara PhishScout-v2 con su version anterior PhishScout v1:

| Propiedad | PhishScout v1 | PhishScout v2 |
|---|---|---|
| Caracteristicas | 35 | 579 (66 estructuradas + 512 n-gramas + shortener) |
| Algoritmo base | LightGBM 60x8L31 | LightGBM 200x10L63 |
| Tamano ONNX | 131.5 KB | 896.3 KB |
| F1 en test | 0.8626 | 0.8966 |
| ROC AUC en test | 0.9369 | 0.9615 |
| Calibracion | No | Platt (sigmoid) |
| Etapa de pagina/TLS | No | Si, opcional y condicionada a red |
| Determinismo | Si | Si (F1 std 0.0) |

No hay datos de otros modelos de la misma categoria (por ejemplo, clasificadores basados en redes neuronales o en listas negras) en la informacion disponible.

## Limitaciones y advertencias

- El modelo se basa exclusivamente en la estructura de la URL; no analiza el contenido de la pagina, por lo que puede fallar en phishing que use dominios legitimos comprometidos (por ejemplo, una URL real de `paypal.com` con una ruta maliciosa). La etapa opcional de enriquecimiento con pagina y TLS mitiga este problema solo cuando hay conexion.
- La robustez ante ruido gaussiano en las caracteristicas es menor que en v1, aunque en inferencia real las caracteristicas se calculan exactamente y no se introducen perturbaciones.
- No se especifican idiomas soportados; el modelo trabaja sobre URLs, que pueden contener caracteres Unicode, pero no hay garantia de cobertura para todos los idiomas.
- No se proporcionan datos sobre sesgos especificos, pero al estar entrenado con un dataset que se actualiza cada 6 horas, podria verse afectado por la calidad de las fuentes de phishing y legitimos.
- Riesgo de alucinacion: no aplica, ya que no genera texto; sin embargo, puede producir falsos positivos o negativos en la clasificacion.
- La licencia MIT permite uso comercial y modificacion, pero el autor no ofrece garantias de exactitud ni soporte.
- El modelo no es un LLM y no puede manejar contexto conversacional ni tareas de generacion; su unica funcion es la clasificacion binaria de URLs.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/saidutta69/PhishScout-v2
- Dataset PhishTrap: https://huggingface.co/datasets/saidutta69/PhishTrap
