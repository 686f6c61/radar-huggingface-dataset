# maxpagels/axiom-discovery

## Resumen

Axiom Discovery es un modelo especializado en descubrimiento causal sobre datos tabulares, desarrollado por Max Pagels. A diferencia de los modelos de lenguaje, no genera texto: recibe una tabla completa (filas x variables) y, en un único pase forward, etiqueta cada par de variables como `causes`, `caused_by`, `undirected`, `confounded` o `none`, con probabilidades asociadas, y ensambla el resultado en un grafo acíclico dirigido. El modelo tiene 11,93 millones de parámetros y se distribuye en safetensors fp32 (48 MB).

La relevancia del modelo está en su enfoque: sustituye los pipelines clásicos de descubrimiento causal (que requieren búsqueda combinatoria sobre espacios de grafos o tests de independencia condicional) por una inferencia neuronal de un solo pase. Admite valores ausentes (NaN) y filas procedentes de experimentos conocidos mediante un argumento de intervenciones, lo que lo acerca a escenarios reales de datos observacionales mezclados con datos experimentales.

Está pensado como herramienta de generación de hipótesis, no como oráculo: el propio autor recomienda tratar los ejes y, sobre todo, las direcciones como hipótesis clasificadas que deben contrastarse con conocimiento de dominio o con experimentos. La librería se instala como paquete `axiom` y expone una API orientada a DataFrames de pandas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo neuronal propietario de la libreria `axiom`; no se detalla en la informacion disponible) |
| Parametros totales | 11.933.003 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de entrada tabular de 2-50 variables (entrenado) y 256-2048 filas recomendadas |
| Tipos de cuantizacion | no disponible; pesos en fp32 |
| Idiomas soportados | no disponible (modelo tabular, no linguistico) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (fp32, 48 MB) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo (no se especifica si es un transformer, un GNN, un modelo de attention sobre pares de variables ni el esquema exacto de entrenamiento). Lo que si se documenta es el contrato de entrada y salida: el modelo procesa una tabla completa en un unico pase forward y produce, para cada par de variables, una distribucion de probabilidad sobre cinco clases de relacion causal (`causes`, `caused_by`, `undirected`, `confounded`, `none`), que despues se decodifica en dos etapas contra un umbral configurable (`thresh`, por defecto 0,5) y se restringe a un grafo aciclico.

El preprocesado estandariza cada columna tal como se hizo en entrenamiento (funcion `axiom.preprocess`), y el modelo soporta valores ausentes y filas de intervenciones. Para tablas grandes, `discover` promedia las predicciones de subconjuntos aleatorios de 2048 filas (`n_subsets` configurable) y conserva las predicciones de cada subconjunto para evaluar estabilidad. El modelo fue entrenado con tablas de entre 2 y 50 variables; en datos simulados mantuvo precision hasta 100 variables, aunque en datos reales por encima de 50 no esta probado. No se dispone de informacion sobre volumen de datos de entrenamiento, composicion del dataset ni uso de RLHF/DPO (no aplicable en este dominio).

## Capacidades

- Descubrimiento causal sobre datos tabulares: etiqueta cada par de variables con una de cinco relaciones y su probabilidad.
- Manejo de valores ausentes (NaN) en la tabla de entrada.
- Soporte de intervenciones: permite marcar filas procedentes de experimentos conocidos mediante una lista por fila o una mascara booleana (n, d).
- Construccion de un grafo aciclico dirigido a partir de las relaciones decodificadas.
- Salida estructurada: objetos `Relation` con `kind`, `p` y `probs`, ademas de `edges`, `relations`, `relation(a, b)`, `to_frame()` y `to_frame(all_pairs=True)`.
- Analisis de estabilidad: conserva las probabilidades por subconjunto de filas para evaluar la dependencia del resultado respecto al muestreo.
- Umbral de decision ajustable (`thresh`) para calibrar la agresividad de la deteccion de ejes.
- No soporta generacion de texto, codigo, vision, audio ni tool calling; es un modelo puramente tabular y estadistico.

## Casos de uso

- Analisis exploratorio en ciencias biomedicas: dado un dataset de expresiones proteicas o marcadores (como el ejemplo PKA/PKC de la model card), el modelo propone que pares estan directamente relacionados y en que direccion, generando hipotesis para validar en laboratorio.
- Priorizacion de experimentos: las relaciones marcadas como `confounded` identifican pares sin eje directo pero con causa comun oculta, lo que orienta que variables adicionales medir antes de disenar un experimento.
- Datos observacionales combinados con ensayos: usando el argumento `interventions`, se pueden etiquetar filas de experimentos conocidos para evitar que actuen como causas ocultas y produzcan ejes invertidos.
- Identificacion de efectos causales en pipelines de analitica: los ejes con alta confianza pueden alimentar modulos posteriores de identificacion y estimacion de efectos causales (por ejemplo, ajuste por confusores).
- Auditoria de datasets tabulares: ejecutar `discover` sobre una tabla antes de entrenar un modelo predictivo permite detectar fugas de informacion (variables que causan directamente el target) y relaciones espurias.
- Analisis de estabilidad en tablas grandes: con mas de 2048 filas, el promediado por subconjuntos y el acceso a las probabilidades por subconjunto permiten cuantificar la robustez de cada eje propuesto.
- Docencia e investigacion metodologica: al ser un modelo pequeno (48 MB) con licencia Apache 2.0, es viable integrarlo en cuadernos de ensenanza de causalidad o como baseline en papers de descubrimiento causal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente aporta indicaciones cualitativas de uso: mejor rendimiento con 256 filas o mas (usable desde ~100, poco fiable por debajo), entrenamiento con 2-50 variables y mantenimiento de precision en datos simulados hasta 100 variables. No se aportan cifras de precision, recall, SHD ni comparaciones numericas con otros metodos.

## Requisitos de hardware

- VRAM/CPU: los pesos ocupan 48 MB en fp32; la inferencia es viable en CPU. El consumo de memoria crece con el numero de variables: aproximadamente 1 GB en CPU con 100 variables y unos 3 GB con 200.
- GPU recomendadas: no se especifican; dado el tamano del modelo, cualquier GPU consumer con suficiente memoria para el tensor de entrada es suficiente. No se documentan requisitos minimos.
- GPU consumer: si, cabe en cualquier GPU consumer moderna; el cuello de botella es la memoria del tensor de pares de variables, no los pesos.
- Despliegue: la via documentada es el paquete Python `axiom` instalado desde el repositorio de Hugging Face (`pip install "git+https://huggingface.co/maxpagels/axiom-discovery"`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de descubrimiento causal neuronal ni datos de rendimiento frente a metodos clasicos (PC, GES, LiNGAM, NOTEARS), por lo que no es posible establecer una comparativa con cifras verificables.

## Limitaciones y advertencias

- Las direcciones de los ejes deben tratarse como hipotesis clasificadas, no como veredictos; el propio autor lo advierte de forma explicita.
- Por debajo de ~100 filas los resultados dejan de ser fiables; el rango recomendado es de 256 filas o mas.
- Entrenado con 2-50 variables; por encima de 50 variables en datos reales no esta probado, y la memoria crece rapidamente con el numero de variables.
- Las filas de experimentos no etiquetadas actuan como causas ocultas y pueden producir ejes erroneos o invertidos; es obligatorio etiquetar todas las filas experimentales.
- Solo detecta enlaces directos: en una cadena a -> b -> c, el par (a, c) se etiqueta como `none`; el resultado depende de que variables se incluyan en la tabla.
- En datos lineal-gaussianos, ambas direcciones pueden ajustar igual de bien, dando lugar a relaciones `undirected` con `p` baja.
- Riesgo de alucinacion en el sentido de ejes espurios: al ser un modelo estadistico, puede proponer relaciones con alta probabilidad que no se sostengan en el dominio; requiere validacion externa.
- No se documentan sesgos especificos ni limitaciones por idioma (no es un modelo linguistico).
- La licencia Apache 2.0 permite uso comercial, pero no se ofrece ninguna garantia sobre la validez causal de las salidas en produccion.
- Nota de versiones: hasta la 1.0.0 el paquete se llamaba `axiom-causal`; versiones anteriores a la 0.3.0 cargan los pesos de `main` y pueden dar resultados incorrectos sin error. Es necesario actualizar o fijar la version.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maxpagels/axiom-discovery
- Pagina del proyecto: https://maxpagels.com/axiom
- Referencia arXiv citada en los tags: arxiv:2609.11897 (no se dispone de URL verificada en la informacion proporcionada)
