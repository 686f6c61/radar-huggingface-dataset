# JuanQuijano/campo-amp-tri-capa1

## Resumen

`campo-amp-tri-capa1` es un artefacto de localización indoor publicado por JuanQuijano dentro del proyecto TRI (Triceraptor). No es un modelo de lenguaje ni una red neuronal: es un proceso gaussiano (kriging) que modela la huella de amplitud del canal Wi-Fi (CSI) en función de la posición (x, y) y se invierte para estimar dónde se encuentra un cilindro de agua salada de 9,5 cm de diámetro colgado dentro de una caja de zinc cerrada de 100 × 100 × 70 cm. Los pesos son simplemente una galería de 288 huellas medidas más un conjunto de hiperparámetros, empaquetados en un `.npz` de 0,5 MB que solo requiere numpy.

El interés técnico está en el enfoque: en lugar de entrenar un clasificador o una red profunda, el autor ajusta un campo aleatorio con covarianza Matérn (ν = 0,10, ℓ = 3,0 cm, σ² = 8,12) sobre perfiles de amplitud de 52 subportadoras normalizados, y localiza por máxima verosimilitud sobre una rejilla de 0,5 cm con refinamiento a posteriori a 0,1 cm. La evaluación sellada reporta una mediana de error de 0,50 cm [IC95 0,47–0,59] en 40 puntos no vistos, frente a 1,00 cm del vecino más cercano y 12,17 cm de la línea base trivial.

Es relevante como referencia reproducible de Wi-Fi sensing de bajo coste con ESP32-S3, y como ejemplo de que un modelo estadístico bien especificado puede superar a alternativas más complejas en un dominio estrecho. Su aplicabilidad fuera de ese montaje concreto es nula por diseño, tal y como advierte el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proceso gaussiano (kriging) sobre perfiles de amplitud CSI; no es una red neuronal |
| Parametros totales | No aplica; galería de 288 huellas de forma (4 receptores, 52 subportadoras) más hiperparámetros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; ventana de observación de 30 s por toma (~3000 paquetes por receptor) |
| Tipos de cuantizacion | No aplica; almacenamiento en float dentro de `.npz` |
| Idiomas soportados | No aplica (no es un modelo de lenguaje); documentación en español |
| Licencia | No disponible (pendiente de definir por el equipo, según la model card) |
| Formato de pesos | `.npz` de numpy (`modelo_campo_amp_capa1.npz`) |

## Arquitectura y entrenamiento

El modelo es un campo aleatorio gaussiano con media constante μ y covarianza σ²·[(1 − ν)·exp(−(r/ℓ)^1,5) + ν·δ], es decir, una Matérn de suavidad 3/2 con efecto pepita (nugget) ν. La entrada es un perfil de 208 números: para cada uno de los 4 receptores ESP32-S3 se toma el perfil medio de amplitud de las 52 subportadoras útiles durante una toma de 30 s, se normaliza cada paquete por su suma, se promedia, se escala el perfil a norma 1 y se multiplica por 50. La salida es la posición (x, y) en centímetros.

El "entrenamiento" consiste en ajustar los hiperparámetros (ℓ, ν, σ²) sobre una galería de 288 huellas medidas cada 2 cm en un parche de 32 × 32 cm, en la capa baja (z = 5,5 cm), los días 24 y 25 de noviembre de 2026. La selección se hizo maximizando la verosimilitud predictiva leave-one-out en forma cerrada, lo que dio ℓ = 3,0 cm, ν = 0,10, σ² = 8,12 y una dimensión efectiva de la huella p_ef = 23. No hay RLHF, DPO ni descenso de gradiente: es inferencia bayesiana cerrada sobre un modelo paramétrico pequeño.

La localización se realiza prediciendo la huella sobre una rejilla de 0,5 cm, seleccionando el punto de máxima verosimilitud y devolviendo la media a posteriori sobre una rejilla fina de 0,1 cm alrededor de ese máximo. El montaje físico usa un router TP-Link Archer C50 en el canal 11 de 2,4 GHz (20 MHz, sin HT, ~100 tramas/s) como emisor y 4 ESP32-S3 sin reloj común como receptores; solo se explota la amplitud, no la fase.

## Capacidades

- Localización 2D de un objeto metálico/dieléctrico (cilindro de agua salada de Ø 9,5 cm) dentro de una cavidad metálica cerrada, a partir de CSI de Wi-Fi.
- Interpolación sub-malla: la mediana de error (0,50 cm) es inferior al paso de la galería (2 cm), gracias al refinamiento a posteriori a 0,1 cm.
- Estimación de incertidumbre implícita: al ser un proceso gaussiano, la verosimilitud predictiva es interpretable y permite umbralizar la confianza.
- Funciona con un único punto de medida (una toma de 30 s), sin necesidad de trayectorias ni de series temporales.
- Ejecución en CPU con numpy; no requiere GPU ni frameworks de deep learning.
- Reproducibilidad del ejemplo: incluye los 40 puntos de prueba en el `.npz` y un script `localizar.py --ejemplo`.
- Entrada desde CSV crudo del orquestador (`node_id`, `csi_amplitud`, `rx_seq`) mediante `perfil_de_csv`.
- No soporta tool calling, agentes, visión, audio, ni generación de texto: no es un modelo de lenguaje.

## Casos de uso

- Localización de objetos en entornos metálicos controlados: el modelo está calibrado para una caja de zinc de 100 × 100 × 70 cm y devuelve coordenadas con mediana de 0,5 cm; útil en experimentos de metrología o posicionamiento en cavidades donde el GPS y el UWB no funcionan.
- Prototipado de Wi-Fi sensing de bajo coste: sirve como referencia reproducible para validar un montaje con 4 ESP32-S3 y un router doméstico antes de invertir en hardware más caro.
- Línea base estadística en investigación: al ser un GP con hiperparámetros explícitos, es un baseline sólido contra el que comparar redes neuronales de CSI en dominios de interior con pocos datos.
- Detección de cambios en el entorno: la distancia entre la huella observada y la predicha actúa como indicador de que la caja ha cambiado de estado (el autor documenta variaciones de hasta 45 en esa distancia a lo largo de una sesión), lo que permite disparar una recalibración.
- Docencia y divulgación: ejemplo completo y pequeño (0,5 MB) de kriging aplicado a señales de radiofrecuencia, con galería, hiperparámetros y conjunto de prueba incluidos.
- Sustitución de fotogrametría o marcadores en experimentos de física: para seguir un cilindro colgado dentro de una caja opaca donde no hay línea de visión, el CSI de Wi-Fi evita instrumentar el objeto.
- Verificación de pipelines de adquisición CSI: el script `localizar.py` acepta el CSV crudo del orquestador y permite comprobar de extremo a extremo que la captura, el preprocesado y la inferencia son coherentes.

## Benchmarks y rendimiento

Evaluación sellada del 25 de noviembre de 2026 sobre 40 puntos no incluidos en la galería, situados en el centro de celdas o aristas de la malla de 2 cm:

| Método | Mediana del error [IC95] | A ≤ 2 cm [Wilson] |
|---|---|---|
| `campo_amp` (este modelo) | 0,50 cm [0,47–0,59] | 36/40 = 90 % [77–96] |
| Nodo más parecido (`knn1`) | 1,00 cm | 36/40 = 90 % |
| Decir el centro | 12,17 cm | 0/40 |

Pruebas adicionales reportadas por el autor:

| Escenario | Mediana del error [IC95] |
|---|---|
| 40 puntos de prueba + 20 repeticiones (cilindro recolgado horas después) | 0,59 cm [0,49–0,84] |
| Solo las 20 repeticiones | 1,05 cm |
| Puntos de prueba sin nodos cercanos en el tiempo (±30 tomas) | 0,98 cm |

Los 4 fallos del conjunto de prueba se distribuyen entre 4 y 26 cm; tres de ellos se atribuyen a errores al colgar el cilindro. No se han publicado resultados en benchmarks estándar de ML (MMLU, HumanEval, GSM8K) porque el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM: no aplica; la inferencia es en CPU y el artefacto ocupa 0,5 MB.
- RAM: del orden de decenas de MB, dominada por numpy y la carga del `.npz`; el cálculo del kriging sobre una rejilla de 0,5 cm es trivial.
- GPU: no necesaria; cualquier CPU moderna sirve. No se han publicado cifras de latencia ni throughput.
- Cabe en cualquier equipo, incluida una Raspberry Pi o un portátil de gama baja.
- Despliegue: script Python (`localizar.py`) con numpy como única dependencia; no hay integración con vLLM, llama.cpp, Ollama ni TGI porque no es un modelo generativo.
- Adquisición: requiere 4 receptores ESP32-S3, un emisor TP-Link Archer C50 en canal 11 de 2,4 GHz y una toma de 30 s (~3000 paquetes por receptor) para producir la entrada.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos de localización por CSI publicados con los que comparar parámetros, contexto o licencia. La model card solo ofrece comparación interna contra `knn1` y la línea base trivial, ya recogidas en la tabla de benchmarks.

| Modelo | Enfoque | Entrada | Mediana de error | Licencia |
|---|---|---|---|---|
| `campo-amp-tri-capa1` | Proceso gaussiano (kriging) | Perfil CSI de 208 valores | 0,50 cm | No disponible |
| `knn1` (referencia interna) | Vecino más cercano sobre la galería | Perfil CSI de 208 valores | 1,00 cm | No aplica |
| Línea base "centro" | Constante | Ninguna | 12,17 cm | No aplica |
| Otros modelos de Wi-Fi sensing | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Validez restringida al montaje exacto: la caja de zinc de 100 × 100 × 70 cm, la disposición de las 4 antenas, el router Archer C50 en canal 11 y el cilindro de agua salada de Ø 9,5 cm. No es un modelo general de localización Wi-Fi.
- Deriva del entorno: la propia caja vacía cambió hasta 45 unidades en distancia de huella a lo largo de una sesión, y la última toma del 25 de noviembre a las 21:16 ya era distinta de todas. No se ha medido si sirve otro día; con la caja en otro estado hay que regrabar la galería.
- Cobertura espacial limitada: una sola sesión, una sola capa (z = 5,5 cm) y un parche de 32 × 32 cm. Cerca del borde del parche el error crece.
- Condiciones de captura frágiles: el cilindro se colgó a mano; tres de los cuatro fallos de la evaluación se atribuyen a errores de colocación.
- Solo amplitud: no se usa la fase del CSI ni sincronización entre receptores (los ESP32-S3 no comparten reloj), lo que limita la información disponible.
- Sin datos de sesgos ni de alucinación en el sentido habitual de modelos generativos; el riesgo equivalente es una predicción segura pero errónea cuando la huella observada cae fuera de la distribución de la galería.
- Licencia sin definir: la model card indica que está pendiente de definir por el equipo, por lo que el uso comercial no está autorizado de forma explícita.
- Sin mantenimiento aparente: 0 descargas y 0 likes en Hugging Face, repositorio de 0,0 GB y actualizado por última vez el 26 de noviembre de 2026.
- No apto para producción fuera del laboratorio: cualquier despliegue real exigiría un protocolo de recalibración y validación en el entorno objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JuanQuijano/campo-amp-tri-capa1
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos asociados al modelo.
