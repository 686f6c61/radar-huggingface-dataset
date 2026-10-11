# SciLM/ResFlow

## Resumen

ResFlow es un modelo generativo 3D especializado en la síntesis de facies de reservorio siliciclástico (arena y fango) en ocho entornos sedimentarios simulados: lóbulos de aguas profundas, un delta distributario y seis clases fluviales. Lo desarrolla el grupo SciLM y corresponde a los pesos del artículo *SiliciclasticReservoirs: A Million-Reservoir Dataset and Flow-Matching Foundation Model for 3D Siliciclastic Reservoir Generation*, aceptado en NeurIPS 2026 (Track on Evaluations and Datasets). No es un modelo de lenguaje: es un generador condicional de volúmenes geológicos.

La arquitectura es un diffusion transformer 3D de 32.586.409 parámetros (parches 4×4×2, 12 bloques, ancho 384, 6 cabezas, QK-norm, posiciones rotatorias 3D y adaptive layer norm) entrenado con flow matching condicional. Genera volúmenes individuales de 64×64×32 celdas o campos completos de cualquier extensión en una sola pasada, condicionado por un vector de 18 números (entorno, NTG, anchura, espesor, acimut y parámetros específicos por entorno) y por pozos o celdas observadas.

Su relevancia radica en que sustituye, con un único modelo fundacional, a los especialistas por entorno y a los generadores adversarios previos: en el benchmark ResBench queda más cerca del simulador que GANSim-3D, DiffSIM y un modelo de difusión latente 3D en todos los entornos comparados, con licencia MIT y un tamaño de repositorio de 0,1 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion transformer 3D (DiT) con flow matching condicional; parches 4×4×2, 12 bloques, ancho 384, 6 cabezas, QK-norm, posiciones rotatorias 3D (θ = 100), adaptive layer norm |
| Parámetros totales | 32.586.409 (32,6 M) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica en tokens de texto; atención global sobre volúmenes de 64×64×32 celdas, y atención de ventana deslizante de ±12 tokens por eje en generación de campos |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; no procesa texto) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 0,1 GB |
| Resolución nativa | 64×64×32 celdas (100 m lateral en lóbulos, 10 m en canales y deltas, 1 m vertical) |
| Dataset de entrenamiento | SciLM/SiliciclasticReservoirs (900.000 volúmenes usados en el entrenamiento) |
| Descargas / likes en HuggingFace | 0 / 0 (a fecha de los datos consultados) |

## Arquitectura y entrenamiento

ResFlow es un diffusion transformer tridimensional que opera con flow matching condicional en lugar de difusión clásica. El vector de condición tiene 18 componentes: one-hot del entorno, NTG (fracción de arena), anchura, espesor, seno y coseno del acimut, y cinco parámetros específicos del entorno (relación de aspecto de lóbulo, sinuosidad de canal, fracción de canales abandonados obturados con fango, probabilidad de avulsión intra-cinturón y fracción de tronco libre de bifurcaciones). Los pozos y las celdas observadas entran como dos canales adicionales de entrada, lo que permite condicionar la generación a datos duros. El muestreo emplea el método de Heun con 100 pasos y classifier-free guidance de valor 3. Los volúmenes se generan con atención global, igual que en entrenamiento, mientras que los campos cambian a atención de ventana deslizante de ±12 tokens por eje, lo que permite generar extensiones arbitrarias sin mosaico.

El entrenamiento utilizó 900.000 volúmenes del dataset SiliciclasticReservoirs cubriendo los ocho entornos, durante 40 épocas sobre 16 GPU NVIDIA GH200, con lote global de 512, optimizador AdamW, tasa de aprendizaje máxima de 5,77×10⁻⁴ y planificador coseno, en aproximadamente 7,5 horas. Los pesos publicados son la media móvil exponencial de la época 40. Cualquier parámetro omitido en la llamada toma el valor típico del entorno (la mediana de sus datos de entrenamiento), y el método `model.parameters(env)` expone el rango de entrenamiento de cada uno.

## Capacidades

- Generación de volúmenes 3D de facies binarias (1 = arena, 0 = fango) con formato de salida uint8 y forma (n, 64, 64, 32).
- Generación de campos completos de tamaño arbitrario en una sola pasada mediante atención de ventana deslizante, sin necesidad de teselado.
- Condicionamiento por entorno geológico: `lobe`, `pv_shoestring`, `cb_labyrinth`, `cb_jigsaw`, `sh_distal`, `sh_proximal`, `meander` y `delta`.
- Condicionamiento por parámetros geológicos cuantitativos: NTG, anchura y espesor característicos en celdas, acimut de flujo en grados y parámetros específicos por entorno.
- Condicionamiento por pozos verticales (`Well(x, y, facies)`) y por celdas observadas con máscara de valor desconocido (−1), de modo que cada realización respeta exactamente los datos introducidos.
- Tendencias espaciales variables: en `generate_field` cualquier parámetro puede darse como mapa (X, Y), lo que permite gradientes de propiedades a lo largo de un reservorio.
- Generación de conjuntos (ensembles) de realizaciones múltiples bajo una misma condición.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso ni procesamiento de lenguaje natural, visión o audio; es exclusivamente un modelo generativo geoespacial 3D.

## Casos de uso

- Generación de análogos de reservorio para investigación: crear miles de volúmenes de facies sintéticas con propiedades controladas (por ejemplo, NTG = 0,35 y acimut de 45°) para estudiar cómo varía la conectividad arena-fango antes de disponer de datos de campo.
- Acondicionamiento a datos de pozos en estudios de yacimiento: dadas las columnas de facies de varios pozos, el modelo produce realizaciones que honran esos datos exactamente, útil para poblar el espacio entre pozos en un modelo estático.
- Modelado a escala de campo: `generate_field` permite sintetizar campos de 512×512×32 celdas (unos 4 minutos en una GH200) sin artefactos de teselado, adecuado para inicializar simulaciones de flujo regionales.
- Generación de datos sintéticos para entrenar y validar otros modelos: el propio artículo lo plantea como modelo fundacional, y el dataset asociado (SiliciclasticReservoirs) puede complementarse con volúmenes nuevos generados bajo demanda.
- Evaluación comparativa de algoritmos geoestadísticos: el benchmark ResBench puntúa cada comprobación contra la variabilidad intrínseca del simulador, de modo que ResFlow sirve como línea base reproducible frente a GANSim-3D, DiffSIM o modelos de difusión latente 3D.
- Pruebas de pipelines de simulación de flujo: al estar emparejado con el simulador ResMill, permite generar entradas sintéticas con parámetros conocidos para validar flujos de trabajo de simulación sin depender de datos reales.
- Docencia y divulgación en geología de reservorios: la API condicionada por parámetros interpretables (sinuosidad, avulsión, relación de aspecto) permite ilustrar cómo cada control sedimentario altera la geometría del cuerpo arenoso.
- Análisis de sensibilidad e incertidumbre: generar ensembles bajo condiciones fijas para estudiar la dispersión de métricas derivadas como la conectividad, teniendo en cuenta la limitación documentada de subestimación de incertidumbre en canales.

## Benchmarks y rendimiento

Resultados publicados en el benchmark ResBench del propio proyecto. La métrica se normaliza contra la variabilidad del simulador entre ejecuciones: 1 significa indistinguible del simulador y valores más bajos son mejores.

| Conjunto evaluado | Puntuación ResBench |
|---|---|
| Global | 2,56 |
| Volúmenes incondicionales | 2,33 |
| Volúmenes condicionados por pozos | 3,12 |
| Campos | 2,24 |

Comparaciones cualitativas reportadas en la model card: con las mismas entradas, ResFlow queda más cerca del simulador que GANSim-3D, DiffSIM y un modelo de difusión latente 3D en todos los entornos en que se compararon, y supera a especialistas de un solo entorno con su misma arquitectura y receta en seis de los ocho entornos. No se han publicado en la información disponible las cifras desglosadas por entorno ni métricas tipo MMLU, HumanEval o GSM8K, que no aplican a este modelo.

## Requisitos de hardware

- Huella de pesos: con 32,6 M de parámetros, los pesos ocupan aproximadamente 130 MB en fp32 y unos 65 MB en fp16 (estimación derivada del recuento de parámetros; no confirmada por el autor). El cuello de botella es la memoria de activaciones, no los pesos.
- GPU recomendada: el autor cita una NVIDIA GH200, donde un volumen de 64×64×32 tarda unos 1,6 s en lotes de 128 y un campo de 512×512×32 unos 4 minutos.
- CPU: es funcional, pero el autor indica que tarda decenas de minutos por volumen, por lo que no es apta para generación interactiva ni para ensembles grandes.
- GPU de consumo: dado el reducido tamaño del modelo (0,1 GB de repositorio), es plausible ejecutarlo en GPU de consumo con suficiente VRAM para el lote; no se dispone de cifras de VRAM mínima publicadas por el autor.
- Opciones de despliegue: la librería propia `resflow` (instalable con `pip install git+https://github.com/SciLM-ai/ResFlow`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 1,6 s por lote de 128 volúmenes de 64×64×32 y ~4 minutos por campo de 512×512×32 en GH200, según el autor.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / resolución | Licencia | Disponibilidad | Rendimiento relativo |
|---|---|---|---|---|---|---|
| ResFlow | DiT 3D con flow matching | 32,6 M | 64×64×32 nativo; campos de extensión arbitraria | MIT | Pesos en HuggingFace, código en GitHub | Referencia (ResBench global 2,56) |
| GANSim-3D | GAN 3D condicional | no disponible | no disponible | no disponible | no disponible | Peor que ResFlow en todos los entornos comparados (cifras no publicadas en la información disponible) |
| DiffSIM | Difusión para simulación de facies | no disponible | no disponible | no disponible | no disponible | Peor que ResFlow en todos los entornos comparados (cifras no publicadas) |
| Modelo de difusión latente 3D (sin nombre en la model card) | Difusión latente 3D | no disponible | no disponible | no disponible | no disponible | Peor que ResFlow en todos los entornos comparados (cifras no publicadas) |

No se dispone de los parámetros, contextos ni licencias de los modelos comparados en la información proporcionada, por lo que la comparación cuantitativa detallada queda como no disponible.

## Limitaciones y advertencias

- El modelo se entrenó únicamente con reservorios simulados por ResMill y no ha sido validado con datos reales de subsuelo; predecir un reservorio real concreto exige una calibración independiente.
- Solo cubre los ocho entornos de entrenamiento. Los valores de parámetros fuera de los rangos de entrenamiento no están soportados y la API emite un aviso.
- Bajo una entrada fija, subestima la incertidumbre del simulador en la mayoría de entornos de canal, de modo que sus ensembles infravaloran la incertidumbre en esos casos.
- Las láminas distales contienen motas de arena aisladas y, a escala de campo, la conectividad en los entornos de tipo shoestring y delta es la que más se desvía del simulador.
- Riesgo de alucinación en el sentido generativo: el modelo puede producir geometrías geológicamente plausibles pero no presentes en el simulador de referencia para una condición dada; por eso ResBench reporta desviaciones cuantificadas en lugar de una correspondencia exacta.
- Sesgos de datos: al derivar de un único simulador, hereda sus supuestos sedimentológicos y sus rangos paramétricos; no representa variabilidad de procesos no modelados por ResMill.
- Licencia MIT: permite uso comercial y modificación, pero la propia model card advierte de la falta de validación en datos reales, por lo que cualquier uso en decisiones de inversión o perforación requiere validación adicional.
- El repositorio figura con 0 descargas y 0 likes y fue creado el 10 de octubre de 2026, por lo que no existe aún un historial de uso en producción ni soporte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SciLM/ResFlow
- Dataset SiliciclasticReservoirs: https://huggingface.co/datasets/SciLM/SiliciclasticReservoirs
- Código: https://github.com/SciLM-ai/ResFlow
- Benchmark ResBench: https://github.com/SciLM-ai/ResBench
- Simulador ResMill: https://github.com/SciLM-ai/ResMill
- Cuaderno de inicio rápido: `examples/pretrained/quickstart.ipynb` en el repositorio de código
- Artículo: Baghishov, I., Rustamzade, E., Henkelman, G., Foster, J. T. y Pyrcz, M. J., *SiliciclasticReservoirs: A Million-Reservoir Dataset and Flow-Matching Foundation Model for 3D Siliciclastic Reservoir Generation*, NeurIPS 2026, Track on Evaluations and Datasets (no se dispone de URL directa en la información proporcionada)
