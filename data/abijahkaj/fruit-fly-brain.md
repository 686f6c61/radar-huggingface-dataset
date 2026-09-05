# AbijahKaj/fruit-fly-brain

## Resumen

El "Fruit fly brain" es un modelo computacional del circuito visual-motor de la mosca de la fruta (*Drosophila melanogaster*), desarrollado por AbijahKaj. No se trata de un modelo de lenguaje, sino de una red neuronal biológicamente plausible que recrea el lóbulo óptico y las células motoras de las alas a partir del conectoma MaleCNS (Berg et al., 2026). El modelo permite que una mosca simulada vea una escena 3D y genere comandos de vuelo a través de su propio conectoma.

La arquitectura consiste en 65,799 unidades de tasa con fugas ("leaky rate units") conectadas por 1,967,771 sinapsis, organizadas en 1,771 columnas. Los parámetros (constantes de tiempo, sesgos y fuerzas sinápticas por pares de tipos) se ajustaron en tres etapas para reproducir selectividad de dirección, detección de objetos en aproximación (looming) y el comportamiento de las células HS. El modelo se puede ejecutar en un navegador mediante WebGPU, lo que lo hace accesible para exploración interactiva.

Su relevancia radica en que es una de las primeras simulaciones a gran escala de un circuito neural completo (del ojo al músculo) con parámetros ajustados directamente sobre un conectoma real. Sirve como banco de pruebas para hipótesis sobre cómo el cableado produce el comportamiento y como referencia para modelos de visión bioinspirados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red de tasa con fugas (leaky rate units) acoplada a un grafo de conectoma |
| Parámetros totales | 65,799 unidades y 1,967,771 conexiones; parámetros ajustados: 93 tipos (tau, bias, resting) y 1,545 pares de tipos (fuerza sináptica) |
| Parámetros activos | No disponible (no aplica: no es un modelo MoE) |
| Longitud de contexto | No disponible (no aplica: modelo no lingüístico) |
| Tipos de cuantización | No disponible (no hay pesos cuantizados; los parámetros se guardan en JSON y binario) |
| Idiomas soportados | No disponible (no aplica: modelo no lingüístico) |
| Licencia | CC BY 4.0 (grafo y parámetros); código MIT |
| Formato de pesos | JSON y binario (grafo: `optic.json` + `optic.bin`; parámetros ajustados: `fitted-params.json`); no usa safetensors ni GGUF |

## Arquitectura y entrenamiento

Cada unidad sigue la ecuación: `tau_i dx_i/dt = -x_i + wScale * sum_j w_ij r_j + ext_i + bias_i`, con `r = clamp(x, 0, rMax)`. El peso sináptico `w_ij` se calcula como el número de sinapsis multiplicado por el signo del transmisor del terminal presináptico y por la fuerza del par de tipos. Los fotorreceptores aplican adaptación de Weber (constante de tiempo 1 s) y alimentan la lámina con los pesos de entrada de flyvis. Las entradas a células de pooling (tangenciales, LPi, LCs de looming) se escalan por 0.001; el resto de conexiones no ajustadas, por 0.02. El paso de integración es de 4 ms.

El entrenamiento se realizó en tres etapas con PyTorch en una RTX 5090:

1. **Selectividad de dirección** (`train_optic.py`): se ajustaron tau, bias y fuerzas por par usando rejillas en movimiento, con pérdida sobre la sintonía de los subtipos T4/T5 respecto a sus direcciones preferidas conocidas.
2. **Looming** (`train_loom.py --joint`): se optimizó la selectividad de las células LC4/LPLC2 ante discos que se aproximan frente a discos que se alejan o se desplazan, combinando el objetivo de la etapa 1, una penalización de contraste estático y un término de simetría izquierda/derecha.
3. **Células HS** (`train_loom.py --hs --scene`): se ajustó el objetivo de campo amplio bidireccional (movimiento progresivo hacia arriba, regresivo por debajo del reposo) sobre la entrada visual grabada desde la escena de la propia aplicación.

Los parámetros de partida se transfirieron desde el modelo flyvis (Lappalainen et al., 2024), pero sobre el cableado real de MaleCNS producían una selectividad de dirección nula, por lo que fue necesario el ajuste descrito.

## Capacidades

- Simulación de una mosca completa que ve una escena 3D y genera comandos motores para las alas y halterios.
- Circuito integrado del lóbulo óptico a las motoneuronas de las alas, incluyendo células tangenciales del lóbulo (HS, VS), células de looming (LC4, LPLC2), relés del lóbulo posterior, neuronas descendentes (DNg02, DNp01–06), relés de la médula ventral y motoneuronas de alas y halterios.
- Detección de movimiento direccional: índice medio de selectividad de dirección de 0.67 sobre 16 grupos (subtipo × ojo), con correlación de 0.96 con las direcciones preferidas conocidas.
- Detección de objetos en aproximación (looming) con selectividad de 0.89–0.97 en LC4 y LPLC2.
- Comportamiento de vuelo en bucle cerrado: sigue un tambor rayado rotatorio en ambos sentidos, distingue el vuelo hacia delante de la rotación, evita colisiones en un recorrido con 40 obstáculos y se aparta lateralmente de una esfera que se acerca.
- Ejecución interactiva en navegador mediante WebGPU, sin necesidad de servidor.
- Carga programática desde Python (JSON + `numpy`) y desde TypeScript, permitiendo inspeccionar la estructura del grafo.

## Casos de uso

- **Investigación en neurociencia computacional**: permite estudiar cómo un circuito definido por un conectoma genera comportamientos como la detección de movimiento y la evitación de colisiones. Los investigadores pueden modificar parámetros y observar cambios en la salida motora.
- **Validación de hipótesis sobre conectomas**: al ajustar parámetros sobre el grafo MaleCNS y obtener funcionalidad, se valida que el cableado real es suficiente para producir respuestas selectivas a la dirección y al looming. Útil para probar predicciones del conectoma.
- **Educación y divulgación científica**: la versión en navegador con WebGPU permite a estudiantes de neurociencia interactuar con una mosca simulada en tiempo real, visualizando cómo los estímulos visuales se transforman en decisiones motoras.
- **Banco de pruebas para algoritmos bioinspirados**: los principios de procesamiento revelados (células tangenciales, células de looming, neuronas descendentes) pueden extraerse como arquitecturas de referencia para visión por computador o robótica autónoma.
- **Generación de predicciones para experimentos fisiológicos**: permite simular respuestas neuronales de tipos celulares específicos ante estímulos visuales personalizados, generando hipótesis falsables que luego se pueden contrastar con registros electrofisiológicos.
- **Demostración de simulación neuronal a gran escala en el navegador**: sirve de ejemplo técnico de cómo ejecutar una red de 65,799 unidades y casi 2 millones de sinapsis en WebGPU, útil para desarrolladores interesados en cómputo web de alto rendimiento.

## Benchmarks y rendimiento

Los resultados reportados por el autor se refieren a métricas de comportamiento y no a benchmarks estándar de modelos de lenguaje. Se resumen en la siguiente tabla:

| Métrica | Valor |
|---|---|
| Índice medio de selectividad de dirección (T4/T5, 16 subtipos × ojos) | 0.67 (0.00 antes del ajuste) |
| Correlación de sintonía con direcciones preferidas | 0.96 |
| Selectividad de looming (LC4 y LPLC2, ambos ojos) | 0.89–0.97 |

En el bucle cerrado del navegador, la mosca simulada sigue un tambor rayado en ambas direcciones, no confunde el vuelo hacia delante con rotación, cruza un recorrido de 40 pilares sin colisiones y se desvía de una esfera que se aproxima a 2 unidades/s desde 45 grados. No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- **Entrenamiento**: el autor indica que se realizó con PyTorch en una RTX 5090. No se proporciona desglose de VRAM ni tiempo de cómputo.
- **Inferencia**: la aplicación de navegador requiere una GPU compatible con WebGPU. No se especifica la VRAM mínima, pero al ser un grafo de 65,799 unidades y 1,967,771 conexiones, es probable que corra en GPUs de gama media recientes.
- **Despliegue**: no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje. La vía de ejecución nativa es el navegador (WebGPU) o la carga directa mediante los scripts de Python/TypeScript incluidos en el repositorio de GitHub.
- **Latencia y throughput**: no disponibles. El autor no ha publicado mediciones de latencia, pero la simulación en bucle cerrado en el navegador sugiere que opera en tiempo real para la escena descrita.

## Comparativa con modelos similares

| Característica | Fruit-fly-brain | flyvis (Lappalainen et al. 2024) | MaleCNS (fuente de datos) |
|---|---|---|---|
| Tipo de modelo | Red de tasa con fugas acoplada a un conectoma | Red conectoma-constreñida del sistema visual | Conectoma estático |
| Red cubierta | Lóbulo óptico + células motoras de ala | Sistema visual (principalmente lámina, médula y lóbulo) | Sistema nervioso central completo |
| Unidades | 65,799 | No disponible | No disponible |
| Sinapsis | 1,967,771 | No disponible | No disponible |
| Parámetros ajustados | 93 tipos, 1,545 pares | Sí (modelo original) | No aplica |
| Formato de datos | JSON y binario | No disponible | No disponible |
| Licencia | CC BY 4.0 (datos), MIT (código) | MIT | CC BY 4.0 |

No hay disponibles otros modelos comparables directamente en la información proporcionada. FlyBrainLab (`https://flybrainlab.fruitflybrain.org/`) es un entorno de simulación que permite cargar circuitos neuronales, pero no ofrece el mismo circuito preajustado de lóbulo óptico a motoneuronas.

## Limitaciones y advertencias

- El modelo es un "rate model" simplificado; no captura dinámica de potenciales de acción ni propiedades biofísicas detalladas de las neuronas.
- La detección de looming falla en aproximaciones frontales y depende del fondo (rayas) situado detrás del objeto. El autor reconoce estos como problemas abiertos.
- En bucle cerrado se observa una oscilación en reposo, lo que puede afectar a la estabilidad en aplicaciones que requieran fijación precisa.
- No es un modelo de lenguaje: no soporta procesamiento de texto, generación de código ni tool calling. La etiqueta `language: en` en HuggingFace es una etiqueta general, pero el modelo no procesa lenguaje natural.
- Los parámetros ajustados son específicos del circuito MaleCNS y de la tarea de comportamiento simulada; su generalización a otros conectomas o a condiciones ambientales distintas no está establecida.
- La licencia CC BY 4.0 exige atribución a Berg et al. (2026) y, para los parámetros derivados de flyvis, a Lappalainen et al. (2024). El código en GitHub es MIT, pero los datos del grafo no están bajo esa licencia.
- El repositorio de HuggingFace no contiene pesos en formatos estándar como safetensors o GGUF; la integración en pipelines típicos de IA generativa no es posible.

## Enlaces

- HuggingFace: https://huggingface.co/AbijahKaj/fruit-fly-brain
- Repositorio GitHub (código, extractores, entrenador y aplicación): https://github.com/AbijahKaj/fruit-fly-brain-research
- Referencia del conectoma MaleCNS: Berg, S. et al. (2026). *A connectome of the male Drosophila melanogaster central nervous system.* Cell. https://male-cns.janelia.org/
- Modelo flyvis (MIT): Lappalainen, J. K. et al. (2024). *Connectome-constrained networks predict neural activity across the fly visual system.* Nature. https://github.com/TuragaLab/flyvis
- Aplicación web relacionada: https://flybrain.app/ (FlyBrain, Kainos Workday AI CoE)
- Entorno FlyBrainLab: https://flybrainlab.fruitflybrain.org/
