# ScAGI/mamba4-sidecar-pilot

## Resumen

`ScAGI/mamba4-sidecar-pilot` es un piloto de investigación publicado por el usuario ScAGI en Hugging Face. No es un modelo de lenguaje generativo ni una implementación oficial de Mamba: es un experimento sintético y de escala muy reducida que estudia una idea concreta, la "memoria exacta discrecional y acotada" mediante un mecanismo auxiliar (sidecar) de búsqueda exacta sobre un estado recurrente aprendido. El núcleo medido es un proxy recurrente diagonal selectivo con compuerta sigmoide sobre la entrada, más una cabeza de salida condicionada por consulta.

El modelo no se distribuye con pesos de transformer ni tokenizador; el repositorio contiene checkpoints NumPy (`.npz`) de tres semillas para el proxy y tres para un control de anchura, junto con scripts de verificación y temporización. El tamaño del repositorio es de 0,0 GB, sin descargas ni likes en el momento de la consulta, y no declara licencia, idiomas ni pipeline.

Su relevancia es metodológica: propone y mide, sobre episodios sintéticos de recuperación con familias balanceadas (local, lejana, sobrescritura, ausente, obsoleta y desalojada), si una compuerta aprendida que decide cuándo consultar una memoria exacta aporta utilidad frente a consultar siempre o no consultar nunca. El autor concluye explícitamente que, en esta tabla local de cuatro entradas, la compuerta reduce sondas pero es más lenta, y que el beneficio real proviene de la búsqueda exacta del sidecar, no de una mejor recuperación latente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Proxy recurrente diagonal selectivo con compuerta sigmoide y cabeza de salida condicionada por consulta; sidecar de búsqueda exacta tipo FIFO acotado |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | Secuencias de entrenamiento de longitud 32; evaluación ID de longitud 48 y OOD de longitud 128; longitudes por ejecución <= 128 |
| Tipos de cuantización | no disponible (checkpoints NumPy en coma flotante; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (datos sintéticos, sin lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | NumPy `.npz` (carga con `numpy.load(path, allow_pickle=False)`); hashes en `SHA256SUMS` |

## Arquitectura y entrenamiento

El núcleo es un proxy recurrente diagonal selectivo definido como `h_t = sigmoid(g(x_t)) * h_(t−1) + (1 − sigmoid(g(x_t))) * u(x_t)`, con una cabeza de salida aprendida condicionada por consulta. No es una implementación de Mamba-3 ni usa kernels de Mamba; el autor lo describe como un "proxy recurrente selectivo diagonal aprendido". Sobre ese estado se añade un sidecar de memoria exacta acotada (FIFO) que almacena registros con clave, valor, época y tiempo local, y una compuerta que decide si consultar el sidecar basándose en confianza del clasificador, margen, entropía y señales de cabecera modeladas, nunca en el resultado de sondear el anillo.

El entrenamiento se realizó sobre episodios sintéticos: 960 actualizaciones del proxy con longitud 32; la compuerta se entrenó y calibró con 624 episodios de ajuste y 624 de desarrollo por semilla, con longitud 48, y se calibró a una tasa de lectura de aproximadamente el 40 % en desarrollo. La evaluación usa 1.200 episodios de test disjuntos por semilla y split (3.600 ID y 3.600 de cambio de distribución), con seis familias de episodios balanceadas. Los valores de registro y las consultas son sintéticos; no se usan datasets externos, texto recolectado ni pesos del repositorio oficial de Mamba. La innovación destacable es la separación entre recuperación latente y búsqueda exacta validada por época, con una ablación deliberadamente insegura sin épocas que el autor excluye de la elegibilidad.

## Capacidades

- Recuperación de registros sintéticos en episodios de memoria con familias local, lejana, sobrescritura, ausente, obsoleta y desalojada.
- Decisión aprendida de cuándo consultar una memoria exacta (compuerta sobre confianza, margen, entropía y señales de cabecera).
- Búsqueda exacta en sidecar con validación por época: un acierto validado en la época actual reemplaza la conjetura del clasificador.
- Estado recurrente acotado con huella de 192 bytes por flujo de usuario, más 31 bytes adicionales de sidecar y cabecera.
- Control de anchura (width 56) con estado recurrente de 224 bytes para comparación.
- Verificación reproducible mediante scripts (`pilot.py --verify`, `wide_control.py --verify`, `timing.py`) que recargan checkpoints ligados por SHA-256 y replican métricas.
- No soporta generación de texto, código, matemáticas, visión, audio, tool calling, agentes ni capacidades multilingües: es un experimento de memoria sintética, no un modelo de lenguaje.

## Casos de uso

- Estudio de mecanismos de memoria en arquitecturas recurrentes: sirve como banco de pruebas controlado para medir si una compuerta aprendida de consulta a memoria exacta mejora la precisión frente a políticas fijas (siempre, nunca, heurística, confianza).
- Investigación sobre coste de sondas: el experimento cuantifica el compromiso entre tasa de lectura y precisión (por ejemplo, 78,17 % ID con 39,56 % de lecturas frente a 79,39 % con 100 %), útil para diseñar políticas de recuperación en sistemas con almacenamiento caro.
- Validación de protocolos de evaluación con cambio de distribución: los splits ID (longitud 48) y OOD (longitud 128, distractores adicionales y desplazados) permiten estudiar generalización de políticas de memoria bajo condiciones controladas.
- Reproducibilidad y auditoría de artefactos: los checkpoints `.npz` con hashes fijados y verificadores independientes permiten replicar métricas sin instalar dependencias pesadas, útil en docencia o revisión de resultados.
- Análisis de seguridad de memorias acotadas: la comparación entre la variante segura (con épocas) y la ablación insegura (sin épocas) cuantifica falsos positivos (195 frente a 272 en ID), relevante para diseñar consumidores críticos que no deben interpretar una conjetura del modelo como recuperación verificada.
- Referencia metodológica para pilotos pequeños: el diseño con tres semillas, splits disjuntos y calibración separada de la compuerta ejemplifica cómo publicar resultados negativos o matizados (la compuerta fue más lenta en esta tabla diminuta) sin extrapolar a contadores de secuencia sin restricciones.

## Benchmarks y rendimiento

Resultados publicados por el autor (3 semillas, 1.200 episodios de test disjuntos por semilla y split; 3.600 ID y 3.600 OOD):

| Método | Precisión ID | Lectura ID | Precisión OOD | Lectura OOD |
|---|---:|---:|---:|---:|
| Recurrent 48 | 69,78 % | 0 | 69,19 % | 0 |
| Recurrent 56 | 71,11 % | 0 | 69,53 % | 0 |
| Confidence | 77,61 % | 41,94 % | 77,47 % | 36,78 % |
| Heuristic | 77,47 % | 41,83 % | 77,06 % | 36,28 % |
| Learned | 78,17 % | 39,56 % | 80,42 % | 36,28 % |
| Always exact | 79,39 % | 100 % | 82,17 % | 100 % |

Utilidad normalizada (100 × (precisión − 0,025 × tasa de lectura) / mejor utilidad del split; el 0,025 es un coste de sonda hipotético declarado, no medido): ID, learned 100 > always 99,63 > confidence 99,20 > heuristic 99,03 > wide 92,14 > recurrent 90,41. OOD: always 100 > learned 99,80 > confidence 96,09 > heuristic 95,58 > wide 87,27 > recurrent 86,85. Con exactamente el 40 % de llamadas en test desplazado: learned 80,94 % > confidence 78,17 % > heuristic 77,86 % > random 74,28 %.

La compuerta aprendida recupera 404 de 467 mejoras desplazadas con 1.306 de 3.600 sondas; 838 de esas sondas no encontraron registro vigente. Incluso la política exacta no revierte los falsos positivos de la base en fallos (115/3.600 en OOD y 195/3.600 en ID). En ID, la variante insegura sin épocas produce 272 salidas falsas de presencia frente a 195 de la segura; el sidecar seguro devolvió cero aciertos incorrectos en todos los episodios de test.

Rendimiento temporal medido en CPU con NumPy/Python sobre estado preparado: la sonda "always" tarda una mediana de ~0,562 µs/consulta en OOD frente a ~0,782 µs del flujo aprendido (característica + compuerta + sondas solicitadas); en ID, ~0,558 frente a ~0,737 µs. No se incluyen en esas cifras la inferencia del modelo, las escrituras del sidecar, la disponibilidad de características fuera del wrapper ni la serialización.

## Requisitos de hardware

- No requiere GPU: los checkpoints son arrays NumPy y los verificadores se ejecutan con NumPy y Python estándar (`OPENBLAS_NUM_THREADS=1 OMP_NUM_THREADS=1 python pilot.py --verify`).
- VRAM estimada: no aplica; el estado es de 192 bytes por flujo de usuario más 31 bytes de sidecar y cabecera (224 bytes en el control de anchura 56), excluyendo pesos compartidos, activaciones transitorias y la sobrecarga del objeto Python en tiempo de ejecución.
- GPU recomendadas: no disponibles ni necesarias para este piloto.
- Cabe en cualquier GPU consumer y en CPU; el experimento se midió en CPU.
- Opciones de despliegue: ejecución directa con Python y NumPy; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este artefacto).
- Latencia y throughput: overhead de consulta de ~0,562 µs (always) frente a ~0,782 µs (aprendido) en OOD, y ~0,558 frente a ~0,737 µs en ID, en medianas sobre 15 temporizaciones de host por split y semilla; el autor señala que la compuerta fue más lenta en esta tabla local diminuta.

## Comparativa con modelos similares

No disponible. El artefacto es un piloto sintético de memoria recurrente sin pesos de lenguaje ni benchmarks de NLP, por lo que no existen alternativas directamente comparables en la misma categoría dentro de la información proporcionada. La comparación interna relevante es la de las variantes del propio experimento (recurrente 48, recurrente 56, confidence, heuristic, learned y always exact), recogida en la tabla de benchmarks.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, código ni respuestas de lenguaje natural; los datos son sintéticos y las longitudes por ejecución están acotadas a 128.
- No es una implementación de Mamba-3 ni un resultado oficial de kernels de Mamba; el autor lo declara explícitamente.
- La mejora proviene de la búsqueda exacta del sidecar, no de una mejor recuperación latente; no debe interpretarse como avance en memoria latente de modelos recurrentes.
- Un FIFO acotado puede perder o desalojar eventos antiguos; la política exacta no revierte los falsos positivos de la base en fallos (115/3.600 OOD y 195/3.600 ID), por lo que un consumidor de seguridad crítica no debe tratar una conjetura del modelo como recuperación verificada.
- La ablación sin épocas es deliberadamente insegura y no elegible; produce 272 salidas falsas de presencia frente a 195 de la variante segura en ID.
- Las cifras de latencia excluyen inferencia del modelo, escrituras del sidecar, disponibilidad de características fuera del wrapper y serialización; no deben extrapolarse a sistemas reales.
- El coste de sonda de 0,025 usado en la utilidad normalizada es hipotético y declarado, no medido.
- No se debe extrapolar el fixture de longitud fija a contadores de secuencia sin restricciones.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribución.
- Sin descargas ni likes en el momento de la consulta; sin pipeline, idiomas ni métricas de comunidad que permitan validación independiente.

## Enlaces

- Hugging Face: https://huggingface.co/ScAGI/mamba4-sidecar-pilot
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información proporcionada.
