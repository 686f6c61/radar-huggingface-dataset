# saidutta69/AdVig

## Resumen

AdVig es un clasificador de dominios diseñado para bloquear anuncios y rastreadores en la capa DNS, desarrollado por saidutta69. El modelo decide si un dominio debe ser bloqueado (`BLOCK`) o permitido (`ALLOW`) utilizando únicamente la cadena del dominio, sin necesidad de contenido de página, llamadas de red ni listas dinámicas en tiempo de inferencia. Se presenta como una alternativa offline y sin dependencias a Pi-hole, destilada en un único producto escalar.

El modelo es una regresión logística híbrida que combina 16.384 buckets de n-gramas de caracteres hasheados (FNV-1a con truco de signo) con 34 características estructurales del dominio. Su tamaño es de 64,4 KB en float32 y 16,0 KB en int8 cuantizado, lo que permite ejecutarlo en microcontroladores como el NodeMCU ESP8266. Está entrenado sobre el dataset AdTrap v1, compuesto por 713.539 dominios (93.541 de anuncios/rastreadores y 619.998 legítimos), con una licencia MIT.

Su relevancia actual radica en la creciente demanda de soluciones de privacidad y bloqueo de anuncios en dispositivos de bajo consumo y en el borde (edge), donde los modelos grandes no son viables. AdVig demuestra que es posible lograr una precisión razonable (F1 de 0,7854) con un modelo de apenas 16 KB, ejecutándose en hardware de muy bajos recursos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion logistica hibrida: n-gramas de caracteres hasheados (FNV-1a) + 34 caracteristicas estructurales |
| Parametros totales | No aplica (modelo lineal, pesos: 16.384 buckets + 34 caracteristicas = 16.418 pesos) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entrada: dominio desnudo, sin contexto) |
| Tipos de cuantizacion | int8 (16,0 KB) y float32 (64,4 KB) |
| Idiomas soportados | Ingles (dominios en caracteres ASCII; soporta punycode) |
| Licencia | MIT |
| Formato de pesos | ONNX (modelo exportado a ONNX; pesos en int8 y float32) |

## Arquitectura y entrenamiento

AdVig es un modelo lineal de regresion logistica con dos tipos de entrada: por un lado, n-gramas de caracteres de longitud 3, 4 y 5 sobre el dominio en formato `.domain.`, que se hashean con FNV-1a y se proyectan con signo aleatorio en un espacio de 2^14 buckets (16.384). Por otro lado, 34 caracteristicas estructurales manualmente definidas, como longitud del dominio, numero de etiquetas, presencia de digitos, entropia, presencia de tokens como "ad", "track", "analytics", etc. La puntuacion final es un producto escalar int32 sobre estos buckets y caracteristicas.

El entrenamiento se realizo sobre el dataset AdTrap v1, que combina listas de bloqueo conocidas (StevenBlack/hosts, AdAway, Yoyo) con dominios legitimos de Majestic Million. El proceso de entrenamiento tardo aproximadamente 18 segundos en CPU. No se menciona el uso de tecnicas como RLHF o DPO; es un entrenamiento supervisado clasico de clasificacion binaria. Un hallazgo notable es que espacios de hashing mas pequenos (2^14 buckets) superan a los mas grandes (2^16, 2^15) debido a que las colisiones actuan como regularizacion, mejorando el F1 y el AUC.

## Capacidades

- Clasificacion binaria de dominios: decide si un dominio es de anuncios/rastreadores (`BLOCK`) o legitimo (`ALLOW`).
- Inferencia sobre la cadena del dominio exclusivamente, sin requerir contenido web, llamadas DNS adicionales ni listas externas en tiempo de ejecucion.
- Ejecucion en microcontroladores de muy bajos recursos (ESP8266, NodeMCU) gracias a su tamano minimo (16 KB en int8) y bajo consumo de memoria.
- Operacion completamente offline y sin dependencias de red, lo que la hace adecuada para entornos aislados o con restricciones de privacidad.
- Soporte de caracteristicas estructurales como deteccion de punycode, subdominios, TLDs de confianza o de alto contenido publicitario.
- Capacidad de procesamiento en tiempo real: ~1072 dominios/s a 160 MHz en NodeMCU, suficiente para trafico DNS domestico.
- No requiere GPU ni hardware especializado; puede ejecutarse en CPU de escritorio o en MCU.

## Casos de uso

- Sustitucion de Pi-hole a nivel DNS: AdVig puede responder consultas DNS con un veredicto local, bloqueando anuncios y rastreadores sin depender de listas actualizadas ni conexion a internet. Su bajo consumo permite integrarlo en un router o en un dispositivo dedicado como un NodeMCU.
- Integracion en firmware de routers o firewalls: clasifica dominios desconocidos en el momento de la consulta, complementando listas de bloqueo exactas y reduciendo falsos negativos en dominios nuevos o generados algoritmicamente.
- Control parental y pasarelas IoT: bloquea endpoints de anuncios y rastreadores en dispositivos que no pueden ejecutar extensiones de navegador (consolas, televisores, dispositivos inteligentes), filtrando a nivel de red.
- Herramienta de privacidad en el borde: sirve como filtro de primera pasada en navegadores o proxies antes de analisis mas pesados, reduciendo la carga computacional.
- Investigacion en generalizacion de dominios de rastreadores: modelo compacto y reproducible (licencia MIT) que puede usarse como linea base en estudios sobre clasificacion de dominios maliciosos o de publicidad.
- Filtrado de prefetch en navegadores o proxies: clasifica rapidamente dominios antes de cargar recursos, evitando conexiones innecesarias a servidores de anuncios.
- Educacion y prototipado: al ser extremadamente pequeno y rapido de entrenar (~18 s), es util para ensenar conceptos de clasificacion de texto, hashing de caracteristicas y cuantizacion en entornos docentes.

## Benchmarks y rendimiento

Segun los resultados declarados por el autor en la model card (test split de AdTrap v1, grupo-disjunto por dominio registrable, seed 42):

| Metrica | float32 | int8 cuantizado |
|---|---|---|
| Accuracy | 0.9485 | 0.9486 |
| Precision | 0.8491 | 0.8597* |
| Recall | 0.7307 | 0.7069* |
| F1 | 0.7854 | 0.7862 |
| ROC AUC | 0.9478 | 0.9477 |
| Tasa de falsos positivos | 1.87% | 1.87% |

*El valor int8 se evaluo con su propio umbral ajustado en validacion; la cuantizacion cambio el F1 en +0.0007 (regularizacion por colision de hash).

Ademas, el autor proporciona comparaciones con modelos baseline (solo caracteristicas estructurales) y con variantes de buckets:

| Modelo | F1 | AUC |
|---|---|---|
| gaussian_nb (estructural) | 0.5674 | 0.8197 |
| logistic_regression (estructural) | 0.6006 | 0.8298 |
| decision_tree d8 (estructural) | 0.6157 | 0.8112 |
| lightgbm 30x6L15 (estructural) | 0.6222 | 0.8515 |
| xgboost 30x4 (estructural) | 0.6341 | 0.8598 |
| gram-only LR 2^15 | 0.6953 | 0.9180 |
| **AdVig hibrido LR 2^14** | **0.7854** | **0.9478** |

En hardware NodeMCU ESP8266 (Arduino core 3.1.2, 240 dominios de test x 30 pasadas = 7.200 inferencias por ejecucion):

| Metrica | 80 MHz | 160 MHz |
|---|---|---|
| Latencia media | 1840 us/dominio | 933 us/dominio |
| Min / Max | 1280 / 3043 us | 650 / 1879 us |
| Throughput | ~543 dominios/s | ~1072 dominios/s |
| Fase de hash de n-gramas | 144 us | 77 us |
| Fase estructural | 1685 us | 850 us |

Precision on-device (muestra equilibrada): accuracy 0.8792, precision 0.9789, recall 0.7750, F1 0.8651, con paridad del 100% (240/240) entre el emulador y el hardware.

## Requisitos de hardware

- VRAM estimada: no requiere VRAM; es un modelo lineal que se ejecuta en CPU o MCU.
- GPU recomendadas: ninguna. Puede ejecutarse en cualquier CPU de escritorio o portatil.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue: ONNX Runtime (CPU), integracion en Arduino/ESP8266 via PROGMEM (pesos int8 en flash), o cualquier runtime que soporte ONNX. No se menciona soporte para vLLM, llama.cpp u Ollama (no es un LLM).
- Memoria en MCU: los pesos int8 viven en flash (16,4 KB, cero RAM); el conjunto de trabajo es una tabla de 2048 entradas + bookkeeping (~7,7 KB estaticos). Heap libre: 42.192 B.
- Latencia: 933 us/dominio a 160 MHz en NodeMCU; ~113 us en Python de referencia.
- Throughput: ~1072 dominios/s a 160 MHz, suficiente para trafico DNS domestico.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de la misma categoria (clasificadores de dominios basados en ML de tamano similar) en la documentacion proporcionada. El propio autor compara AdVig con baselines de aprendizaje automatico clasico (XGBoost, LightGBM, arboles de decision) en la seccion de benchmarks, donde AdVig supera a todos ellos. Como modelo hermano se menciona [saidutta69/PhishScout](https://huggingface.co/saidutta69/PhishScout), pero no se aportan datos de rendimiento de ese modelo. Por tanto, la comparativa directa con alternativas externas queda no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: el entrenamiento se basa en listas de bloqueo publicas (StevenBlack, AdAway, Yoyo) y en Majestic Million, lo que puede introducir sesgos geograficos o de popularidad. Los dominios poco comunes o de regiones no representadas pueden clasificarse incorrectamente.
- Riesgo de alucinacion: no aplica, ya que no es un modelo generativo; sin embargo, puede producir falsos positivos (tasa de falsos positivos del 1,87%) y falsos negativos (recall de 0,73 en float32).
- Limitaciones de contexto: el modelo solo acepta un dominio desnudo (sin protocolo, ruta ni parametros). No procesa URLs completas ni contenido de paginas.
- Limitaciones de idioma: aunque la etiqueta de idioma es "en", el modelo opera sobre caracteres ASCII y punycode; dominios con caracteres no ASCII (IDN) pueden no estar bien representados.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificacion sin restricciones, pero el modelo se distribuye sin garantias. El dataset AdTrap v1 no se ha verificado en cuanto a licencia; se recomienda revisar su licencia antes de usarlo en produccion.
- Advertencia para produccion: la precision on-device medida (0.8792) es inferior a la del host (0.9485) en una muestra equilibrada, aunque el autor indica paridad bit-exacta con el emulador. La diferencia se debe probablemente a la distribucion de la muestra, no al hardware. Aun asi, se recomienda validar en el entorno objetivo.
- Rendimiento: la fase estructural domina la latencia (~92%) debido a escaneos lineales de lexicos en PROGMEM; el autor sugiere que usar arrays ordenados con busqueda binaria podria reducir la latencia a la mitad.
- Sin soporte para actualizaciones dinamicas: el modelo es estatico; no aprende de nuevos dominios sin reentrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/saidutta69/AdVig
- Dataset AdTrap v1: https://huggingface.co/datasets/saidutta69/AdTrap (referenciado en la model card, no se proporciona URL directa)
- Perfil del autor: https://huggingface.co/saidutta69
- Modelo hermano PhishScout: https://huggingface.co/saidutta69/PhishScout
