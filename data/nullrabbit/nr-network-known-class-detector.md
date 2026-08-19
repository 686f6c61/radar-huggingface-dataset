# NullRabbit/nr-network-known-class-detector

## Resumen

El modelo `nr-network-known-class-detector` es un clasificador binario desarrollado por NullRabbit para detectar ataques de red y recursos contra nodos blockchain. Está entrenado exclusivamente con reproducciones fieles de ataques públicamente divulgados (CVEs, GHSA y auditorías de seguridad), lo que garantiza que cada clase de ataque tiene una trazabilidad documentada mediante una URL de provenance. El modelo forma parte de un proyecto más amplio de defensa autónoma para redes descentralizadas, con el objetivo de vigilar el exterior del perímetro.

El modelo opera sobre señales de capa de red obtenidas de ventanas de captura cortas (pcap) y estadísticas de respuestas RPC, generando una probabilidad calibrada de ataque. Utiliza un `HistGradientBoostingClassifier` con calibración isotónica, y está diseñado para ser "scoreability-gated": si no hay señal de red suficiente, no emite veredicto. Este corte publicado se entrena únicamente con primitivas de tipo `public-cve-replication`, abarcando 18 cadenas blockchain y 140 primitivas de ataque CVE.

Es relevante porque aborda un problema específico de seguridad en infraestructura descentralizada con un enfoque reproducible y basado en divulgaciones públicas. Sin embargo, el autor advierte explícitamente que es un modelo diagnóstico entrenado en laboratorio, no apto para despliegue directo en producción sin validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HistGradientBoostingClassifier + calibración isotónica (scikit-learn) |
| Parametros totales | no disponible (modelo basado en árboles, no en redes neuronales) |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (no es modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (formato joblib de scikit-learn) |
| Idiomas soportados | no disponible (no es modelo de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | joblib (scikit-learn) |

Nota: el tamaño del repositorio es de 0.2 GB, lo que sugiere que el modelo entrenado ocupa unos pocos cientos de MB, pero no se especifica el número de parámetros.

## Arquitectura y entrenamiento

El modelo utiliza un `HistGradientBoostingClassifier` de scikit-learn, un algoritmo de gradient boosting sobre histogramas que es eficiente con datos tabulares y maneja valores NaN de forma nativa. Se aplica calibración isotónica para que las salidas sean probabilidades calibradas. Las características de entrada son agregados de estadísticas de paquetes (pcap) y de respuestas RPC (amplificación, request-response, timing). Se eliminan columnas degeneradas mediante un guardián robusto por ajuste. No se incluyen métricas de carga del host porque el entorno de laboratorio contenerizado no permite leerlas.

El entrenamiento se realizó sobre 1424 bundles de ataque y 579 benignos, totalizando 2003 bundles, que corresponden a 140 primitivas de ataque CVE públicas distribuidas en 18 cadenas. Cada ataque reproduce una divulgación pública específica con su URL de provenance. El tráfico benigno utiliza los mismos métodos y mensajes de red que los ataques, pero a escala normal, para que el modelo aprenda a distinguir el uso malicioso del legítimo. No se utilizaron primitivas "originales" (mediciones propias sin CVE) en este corte publicado.

## Capacidades

- Detección binaria de ataques vs. tráfico benigno en nodos blockchain.
- Soporte multi-cadena: cubre 18 cadenas blockchain (Bitcoin, Dogecoin, Litecoin, entre otras).
- Manejo nativo de valores NaN en las características.
- Inferencia con "scoreability-gating": si no hay señal de red, devuelve `scoreable=False` sin veredicto.
- Probabilidad calibrada gracias a la calibración isotónica.
- Basado en reproducciones de CVEs reales, lo que permite trazabilidad de cada clase de ataque.
- No es un modelo de lenguaje: no genera texto, no tiene capacidades de razonamiento general ni tool calling.

## Casos de uso

- Monitorización de nodos blockchain en entornos de laboratorio o testnet: el modelo puede analizar capturas de red en tiempo real para detectar intentos de ataque basados en CVEs conocidos.
- Investigación en seguridad: permite reproducir ataques públicos y validar la detección en un entorno controlado.
- Desarrollo de sistemas de defensa autónoma para redes descentralizadas: el modelo forma parte de un pipeline mayor que podría integrarse en sistemas de respuesta automática.
- Auditoría de seguridad de nodos: se puede utilizar para verificar si un nodo es vulnerable a ciertos patrones de ataque conocidos.
- Educación y formación en ciberseguridad blockchain: sirve como herramienta didáctica para demostrar ataques reales y su detección.
- Análisis forense de capturas de red: dado un pcap de un incidente, el modelo puede clasificar si hubo actividad maliciosa conocida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona métricas `roc_auc` y `f1` en los metadatos, pero no se proporcionan valores concretos.

## Requisitos de hardware

- Al ser un modelo de gradient boosting sobre histogramas, es extremadamente ligero en comparación con redes neuronales.
- La inferencia se puede ejecutar en CPU sin necesidad de GPU.
- El tamaño del repositorio es de 0.2 GB, por lo que el modelo cabe fácilmente en memoria RAM de cualquier máquina moderna (menos de 1 GB probablemente).
- Se puede desplegar en cualquier entorno con Python y scikit-learn instalado.
- No hay requisitos específicos de VRAM ni de GPU.
- Opciones de despliegue: integración en servicios Python, uso en pipelines de análisis de tráfico, despliegue en contenedores Docker ligeros.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (detectores de ataques blockchain basados en CVEs). No se pueden establecer comparativas fiables sin datos adicionales.

## Limitaciones y advertencias

- El modelo es diagnóstico, no está validado para producción: fue entrenado con reproducciones sintéticas de laboratorio, no con tráfico real de producción.
- No cubre ataques desconocidos (zero-day) ni variantes no publicadas; solo detecta patrones basados en CVEs conocidos.
- La exclusión de primitivas "originales" limita la cobertura a divulgaciones públicas, dejando fuera ataques no documentados.
- El tráfico benigno sintético puede no representar la diversidad del tráfico real, lo que podría afectar la tasa de falsos positivos en entornos reales.
- No hay información sobre sesgos específicos, pero al estar entrenado en un entorno de laboratorio, es probable que no generalice bien a infraestructuras heterogéneas.
- Licencia Apache-2.0 permite uso comercial, pero el autor no garantiza idoneidad para producción.
- El modelo no maneja características de carga de host, por lo que ataques que solo se manifiestan a nivel de host podrían no ser detectados.

## Enlaces

- HuggingFace: https://huggingface.co/NullRabbit/nr-network-known-class-detector
- Dataset asociado: https://huggingface.co/datasets/NullRabbit/nr-bundles-public
