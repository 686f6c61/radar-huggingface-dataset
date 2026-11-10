# Queimo/fusion-cycle-tm-hfus

## Resumen

Fusion-Cycle es un conjunto de modelos de predicción de propiedades termofísicas de moléculas orgánicas basado en Chemprop 2, una librería de redes neuronales de paso de mensajes (MPNN) especializada en química. Lo desarrolla Emad Al Ibrahim y colaboradores, y se publicó junto a un artículo en el *Journal of the American Chemical Society* (2025) sobre la predicción precisa de curvas de solubilidad mediante un ciclo termodinámico combinado con aprendizaje automático y ensamblados de disolventes. El repositorio de Hugging Face que nos ocupa, `Queimo/fusion-cycle-tm-hfus`, no es el repositorio original, sino un rehost de dos de los cinco modelos que componen el sistema: el de temperatura de fusión (`MP`, en kelvin) y el de entalpía de fusión (`dHfus`, en kcal/mol).

Cada uno de esos dos objetivos se resuelve con un ensamblado de cinco modelos Chemprop independientes, lo que da un total de diez redes. La entrada es exclusivamente una cadena SMILES y la salida es un escalar. El rehost existe para que el paquete `screening-properties` del framework ScreeningTool pueda descargar los pesos en el primer uso, verificando su SHA-256 antes de cargarlos. Los modelos de solubilidad (coeficiente de actividad γ) y los modelos de mezcla del Fusion-Cycle original no están incluidos en este repositorio.

La relevancia práctica es acotada pero clara: la temperatura y la entalpía de fusión son entradas obligatorias de las ecuaciones de solubilidad tipo van 't Hoff o del ciclo termodinámico, y medirlas experimentalmente es caro. Disponer de un predictor rápido permite hacer cribado virtual de miles de compuestos antes de pasar al laboratorio. Eso sí, el modelo está entrenado solo con moléculas orgánicas y no admite sales ni compuestos sin carbono.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Chemprop 2 (MPNN, red neuronal de paso de mensajes sobre grafos moleculares) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada: una cadena SMILES) |
| Tipos de cuantizacion | no disponible (pesos PyTorch `.pt`; no se documentan cuantizaciones) |
| Idiomas soportados | no aplica (modelo químico, no lingüístico) |
| Licencia | MIT (según metadatos del paquete upstream; el repositorio original no incluye fichero LICENSE) |
| Formato de pesos | `.pt` (pickle de PyTorch, cargado con `chemprop.models.MPNN.load_from_file`) |
| Tamaño del repositorio | 0,3 GB |
| Objetivos | Temperatura de fusión (K) y entalpía de fusión (kcal/mol) |
| Ensamblado | 5 modelos por objetivo (10 en total) |
| Entrada | SMILES (una molécula, un solo fragmento, con carbono) |
| Salida | Escalar por objetivo (promedio de los 5 miembros) |

## Arquitectura y entrenamiento

Los modelos son MPNN de Chemprop 2, una familia de redes que opera directamente sobre grafos moleculares: cada átomo es un nodo con un vector de características y cada enlace un arco, y las capas de paso de mensajes propagan información por la vecindad atómica hasta agregar una representación global de la molécula. Es una arquitectura consolidada en química computacional por su buen compromiso entre coste de entrenamiento y precisión en propiedades moleculares tabuladas.

No se dispone de información sobre el número de tokens o moléculas de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de ajuste fino por refuerzo o preferencias (no aplica en este dominio). Lo que sí se documenta es el diseño de ensamblado: cinco modelos entrenados de forma independiente por cada propiedad, cuyas predicciones se promedian. Este esquema reduce la varianza típica de las MPNN con datasets pequeños y es habitual en la práctica de Chemprop. La innovación metodológica del trabajo original no está en la arquitectura, sino en el ciclo termodinámico que combina estas predicciones con modelos de coeficiente de actividad para reconstruir curvas de solubilidad completas; este repositorio solo contiene la parte de fusión de ese ciclo.

## Capacidades

- Predicción de temperatura de fusión en kelvin a partir de un SMILES.
- Predicción de entalpía de fusión en kcal/mol a partir de un SMILES.
- Ensamblado de cinco modelos por propiedad con promedio de predicciones para estabilizar el resultado.
- Integración directa con `screening-properties` (ScreeningTool), que convierte la entalpía a J/mol (factor 4184) y verifica la integridad de los pesos por SHA-256.
- Carga programática mediante la API de Chemprop 2 (`models.MPNN.load_from_file`).
- Filtrado de dominio incorporado en el consumidor previsto: rechaza moléculas sin carbono o con más de un fragmento (sales).
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: es un regresor numérico de una sola pasada.

## Casos de uso

- Cribado virtual previo a la experimentación: dado un catálogo de compuestos candidatos en SMILES, predecir Tm y ΔHfus para descartar aquellos con propiedades termofísicas incompatibles con el proceso antes de sintetizar o medir. El coste por molécula es de milisegundos en CPU.
- Estimación de solubilidad en disolventes: combinando estas predicciones con un modelo de coeficiente de actividad (no incluido aquí) se pueden reconstruir curvas de solubilidad mediante el ciclo termodinámico del artículo original, útil en formulación farmacéutica y de agroquímicos.
- Diseño de procesos de cristalización: la temperatura de fusión predicha informa la selección de disolventes y las condiciones de enfriamiento en el desarrollo de procesos a escala de planta piloto.
- Priorización en descubrimiento de fármacos: Tm y ΔHfus correlacionan con el empaquetamiento cristalino y la solubilidad acuosa, dos parámetros de filtro temprano en química medicinal; el ensamblado permite ordenar series de análogos.
- Evaluación de materiales orgánicos y aditivos: estimación rápida de propiedades térmicas de compuestos orgánicos de bajo peso molecular (plastificantes, colorantes, intermedios) cuando no hay dato experimental disponible.
- Docencia e investigación metodológica: servir de referencia reproducible para comparar arquitecturas MPNN o estrategias de ensamblado en tareas de regresión molecular, dado que los pesos son públicos y ligeros (0,3 GB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de error (RMSE, MAE, R²) para los conjuntos de validación o test, ni comparaciones numéricas con otros predictores. El artículo de referencia (JACS 2025) contiene presumiblemente esas cifras, pero no se reproducen en el repositorio de Hugging Face.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; por el tamaño del repositorio (0,3 GB para diez modelos) y la naturaleza de las MPNN, la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: no se especifican. Cualquier GPU moderna (RTX 3060 o superior, A100, H100) acelera el cálculo por lotes, pero el modelo es lo bastante pequeño para ejecutarse en CPU en cribados de miles de moléculas.
- Cabe en GPU consumer: sí, con margen amplio; la carga completa de los diez modelos ocupa del orden de centenares de MB.
- Opciones de despliegue: Chemprop 2 como librería Python; no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, que son servidores de modelos de lenguaje y no aplican a este tipo de red.
- Latencia y throughput: no disponibles. Por la arquitectura y el tamaño, se espera un coste de milisegundos por molécula en CPU y de microsegundos a milisegundos en GPU con batching, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Propiedades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Fusion-Cycle (este rehost) | Chemprop 2 MPNN, ensamblado de 5 | SMILES | Tm, ΔHfus | MIT | Pesos en HF (0,3 GB) |
| Fusion-Cycle completo (upstream) | Chemprop 2 MPNN, ensamblados | SMILES | Tm, ΔHfus, γ, modelos de mezcla | MIT (según metadatos) | GitHub `emadalibrahim/Fusion-Cycle` |
| Otros predictores de Tm basados en ML | no disponible | SMILES | Tm | no disponible | no disponible |

No se dispone de información suficiente para comparar numéricamente con alternativas concretas de la misma categoría; la model card no cita modelos competidores ni métricas comparativas.

## Limitaciones y advertencias

- Dominio restringido: solo moléculas orgánicas con al menos un átomo de carbono y un único fragmento. Las sales y mezclas quedan fuera del dominio de entrenamiento y el consumidor previsto las rechaza explícitamente.
- Sin métricas publicadas: no hay RMSE, MAE ni intervalos de confianza en la información disponible, por lo que no se puede acotar el error esperado en producción.
- Riesgo de extrapolación: como todo modelo de regresión molecular, puede dar predicciones plausibles pero erróneas para clases químicas poco representadas en el entrenamiento (polímeros, compuestos organometálicos, moléculas muy grandes).
- Licencia: MIT según los metadatos del paquete upstream, pero el repositorio original no contiene fichero LICENSE; conviene verificar antes de un uso comercial formal.
- Seguridad de carga: los pesos son pickles de PyTorch; solo deben cargarse ficheros verificados. El consumidor previsto comprueba SHA-256, pero una carga manual con `load_from_file` no lo hace por defecto.
- Rehost parcial: no incluye los modelos de solubilidad ni de mezcla del Fusion-Cycle original, así que no permite reproducir el ciclo termodinámico completo por sí solo.
- Mantenimiento: repositorio con cero descargas y cero likes en el momento de la consulta; el crédito y el soporte corresponden a los autores originales, no al rehost.
- Idiomas: no aplica, pero conviene señalar que no procesa texto libre, solo SMILES válidos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Queimo/fusion-cycle-tm-hfus
- Repositorio original en GitHub: https://github.com/emadalibrahim/Fusion-Cycle (commit `55d8ca577ac1cb5aeea2685523223bd5c9c19977`)
- Librería Chemprop: https://github.com/chemprop/chemprop
- Artículo de referencia: Al Ibrahim, Emad, et al. "Accurately predicting solubility curves via a thermodynamic cycle, machine learning, and solvent ensembles." *Journal of the American Chemical Society* 147.49 (2025): 45057-45069.
