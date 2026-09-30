# jprivera/260922_fixed_dose_graphs

## Resumen

El repositorio jprivera/260922_fixed_dose_graphs no contiene un modelo de lenguaje: es un paquete de artefactos de investigacion (figuras, tablas y un script de render) asociado a un experimento de seguridad y alineacion sobre tecnicas de "reparacion" de comportamientos no deseados en modelos ya entrenados. Lo publica el usuario jprivera el 30 de septiembre de 2026, con 0 descargas, 0 likes, pipeline no declarado y un tamano de repositorio de 0.0 GB, es decir, sin pesos ni ficheros de modelo.

El contenido descrito en su model card son curvas de dosis-respuesta sobre el numero de pasadas (epochs) por un conjunto de reparacion de 300 filas, comparando cuatro metodos (SFT, DPO, NPO+R y CWS) sobre dos familias de modelos (Llama y Qwen) y midiendo por separado la reparacion del comportamiento entrenado y la transferencia a comportamientos no vistos ("unseen collusion", con seis comportamientos y nueve wrappers no vistos). El experimento usa 78 brazos evaluados sobre un tercio fijo del conjunto de validacion mas un conjunto de 360 filas de comportamientos detectados.

Su relevancia es metodologica: documenta como se degrada (o no) la reparacion segun la dosis de entrenamiento, con bandas min-max sobre tres ordenes de datos por metodo, algo poco habitual en las fichas de tecnicas de unlearning. No es un recurso utilizable para inferencia, sino material de analisis para investigadores que calibran pipelines de desaprendizaje o de mitigacion de comportamientos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplicable (el repositorio no contiene pesos ni grafo de modelo) |
| Parametros totales | no disponible (no se declara el tamano de los modelos Llama y Qwen usados en el experimento) |
| Parametros activos | no aplicable |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no aplicable |
| Idiomas soportados | no disponible |
| Licencia | no disponible (sin licencia declarada en el repositorio) |
| Formato de pesos | no aplicable; el repositorio contiene JSON (data/grid.json), Markdown (data/dose_tables.md), PNG (figs/) y un script Python (plot.py) |
| Tipo de artefacto | figuras y tablas de resultados de un experimento de reparacion conductual |
| Autor | jprivera |
| Fecha de creacion | 2026-09-30 |
| Ultima actualizacion | 2026-09-30 |
| Tamano del repositorio | 0.0 GB |
| Descargas y likes | 0 y 0 |

## Arquitectura y entrenamiento

No hay arquitectura de modelo que describir. Lo que documenta el repositorio es un protocolo experimental aplicado sobre organismos ("organisms") ya entrenados de dos familias distintas, identificadas en el README como Llama y Qwen, sin que se especifiquen versiones ni tamanos de parametros. Los metodos de reparacion comparados son cuatro: SFT, DPO, NPO+R y CWS, cada uno ejecutado con sus hiperparametros previamente ajustados y con su trainer original, lo que hace la comparacion respetuosa con cada implementacion pero no homogenea en otros aspectos (por ejemplo, NPO+R incorpora retencion y los demas no).

El diseno de dosis consiste en dar exactamente 1, 2 o 3 pasadas sobre un conjunto de reparacion de 300 filas, con 60 filas por paso y pasos 5, 10 y 15, usando semilla de organismo 0 por familia. Para cada metodo se ejecutan tres ordenes de datos distintos sobre el mismo organismo, lo que permite reportar bandas min-max en las curvas de dosis, mas una ejecucion adicional solo de retencion. La evaluacion cubre 78 brazos sobre un tercio fijo del conjunto apartado (seis comportamientos y nueve wrappers no vistos) mas un conjunto de 360 filas de comportamientos que se busca eliminar. El README afirma que todas las comprobaciones de procedencia y de conjuntos de filas pasaron.

Las innovaciones destacables son de metodologia de evaluacion, no de arquitectura: separacion explicita entre la senal del comportamiento entrenado y la transferencia a comportamientos no vistos, curva de dosis con dispersion entre ordenes de datos, y deteccion de regimenes de subdosificacion. El propio autor senala que el SFT de Llama quedo subdosificado a 5e-6 de learning rate y que la honestidad de celda limpia en SFT/CWS de Qwen cae hasta alrededor de 70 en las epochs 2-3.

## Capacidades

- El repositorio no genera texto, no razona, no escribe codigo y no procesa vision: no contiene pesos ni codigo de inferencia.
- Visualizacion de resultados: incluye figA (porcentaje de colusion no vista por metodo y epoch, media de medical, code, sabotage y furlong, con linea base no tratada), figB (desglose por comportamiento en la epoch 3, por familia, con rubric gaming como comportamiento entrenado), figC (curvas de dosis de colusion no vista frente a epochs, con banda min-max) y figD (reparacion del comportamiento entrenado por epoch).
- Analisis comparativo entre metodos: permite contrastar SFT, DPO, NPO+R y CWS bajo un mismo regimen de dosis y con sus hiperparametros ya ajustados.
- Analisis de retencion: una ejecucion especifica de solo retencion, aunque sin replica de ordenes de datos.
- Trazabilidad: data/grid.json procede de la salida de 06_grade.py y data/dose_tables.md contiene las tablas completas, incluida la tabla de comportamientos detectados.
- Reproceso local: el script plot.py regenera las figuras en figs/.
- No dispone de soporte de tool calling, function calling, uso agentico, modo thinking ni capacidades multilingues, por no ser un modelo.

## Casos de uso

- Calibracion de dosis en pipelines de desaprendizaje: usar figC y figD para decidir cuantas epochs de reparacion merece la pena pagar antes de que la ganancia en el comportamiento entrenado se estanque o empiece a danar la retencion.
- Seleccion de metodo de reparacion: comparar SFT, DPO, NPO+R y CWS con sus hiperparametros ajustados antes de comprometerse con una tecnica en un proyecto de mitigacion, usando figA a 3 epochs como criterio de transferencia.
- Auditoria de transferencia a comportamientos no vistos: los nueve wrappers no vistos y los seis comportamientos permiten comprobar si la reparacion generaliza o solo suprime la superficie del comportamiento entrenado.
- Documentacion para revision por pares: data/dose_tables.md y la procedencia declarada en el README sirven como anexo reproducible de un articulo o informe interno sobre mitigacion conductual.
- Reanalisis estadistico propio: cargar data/grid.json en notebooks para recalcular intervalos, agrupar por familia o probar modelos mixtos sobre los 78 brazos.
- Auditoria de coste y exposicion: cuantificar el efecto de la doble exposicion de CWS (dos ramas) frente a los metodos de una sola rama al mismo numero de epochs.
- Planificacion de experimentos de seguimiento: el README indica que las semillas de organismo 1 y 2 estan en ejecucion, de modo que el repositorio sirve de referencia para disenar esas replicas y para corregir los desajustes detectados (60 frente a 64 filas por paso respecto a los runs de ajuste).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible en el sentido habitual (MMLU, HumanEval, GSM8K u otros): el repositorio no contiene un modelo evaluable. Lo que si se documenta son metricas internas del experimento de reparacion, sin valores numericos concretos en la informacion proporcionada, salvo los que se citan a continuacion.

| Metrica del experimento | Que mide | Valores disponibles |
|---|---|---|
| Colusion no vista (figA, figC) | Media de medical, code, sabotage y furlong en comportamientos no vistos | solo curvas por metodo y epoch; sin cifras en el texto |
| Comportamiento por comportamiento a 3 epochs (figB) | Cada comportamiento, por familia; rubric gaming es el entrenado | sin cifras en el texto |
| Reparacion del comportamiento entrenado (figD) | Evolucion del comportamiento objetivo frente a epochs | sin cifras en el texto |
| Honestidad de celda limpia en Qwen SFT/CWS | Calidad en el conjunto de seleccion | aproximadamente 70 en las epochs 2-3 |
| Learning rate de SFT en Llama | Ajuste de entrenamiento | 5e-6, considerado subdosificado |
| Brazos evaluados | Cobertura experimental | 78 brazos |
| Conjunto de reparacion | Filas y pasos | 300 filas, 60 filas por paso, pasos 5/10/15 |
| Conjunto de comportamientos detectados | Evaluacion adicional | 360 filas |

## Requisitos de hardware

- Para inspeccionar el repositorio no se requiere GPU: basta un visor de PNG y de Markdown sobre un equipo de escritorio.
- Para reejecutar plot.py se necesita un interprete de Python; el README menciona la ruta /root/venvs/sdf_b200/bin/python3, nombre de entorno que sugiere hardware con GPU NVIDIA B200, pero la GPU realmente empleada no se declara.
- No procede VRAM estimada para inferencia: el repositorio no contiene pesos, por lo que no hay requisitos de memoria de modelo.
- No hay soporte ni recomendacion de despliegue en vLLM, llama.cpp, Ollama, TGI ni similares, ya que no existe un modelo que servir.
- Cualquier reentrenamiento o replicacion del experimento exigiria hardware suficiente para ajustar los modelos Llama y Qwen subyacentes, cuyo tamano no se especifica; por tanto, el requisito es "no disponible".
- Latencia y throughput: no disponibles. El unico tiempo de computo documentado es el render de figuras, sin cifras.

## Comparativa con modelos similares

No disponible. El repositorio no es un modelo, por lo que no existe una categoria de modelos comparables. Como artefactos alternativos de la misma naturaleza (paquetes de resultados de experimentos de desaprendizaje o mitigacion conductual con tecnicas tipo SFT, DPO, NPO y CWS) no se ha encontrado ninguna referencia comparable en la informacion proporcionada, y los resultados de busqueda web disponibles no guardan relacion con este repositorio.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita, rigen los derechos de autor por defecto, de modo que no puede asumirse permiso de uso comercial ni de redistribucion.
- El repositorio no es un modelo: no puede cargarse con transformers, vLLM ni Ollama, y no sirve para inferencia de ningun tipo.
- Tamano de 0.0 GB declarado: conviene verificar que las figuras y los datos esten realmente subidos al repositorio antes de planificar un reanalisis.
- El propio autor advierte de que las semillas son ordenes de datos sobre un unico organismo por familia; los organismos con semilla 1 y 2 aun no se habian ejecutado, lo que limita la generalizacion de las bandas min-max.
- La comparacion no es homogenea: NPO+R incluye retencion y los demas metodos no, y CWS usa dos ramas, es decir, el doble de exposicion que sus competidores al mismo numero de epochs.
- Se detecto subdosificacion en el SFT de Llama (learning rate 5e-6), lo que probablemente infravalora ese metodo en la comparativa.
- En Qwen, la honestidad de celda limpia de SFT y CWS cae hasta aproximadamente 70 en las epochs 2-3, senal de dano colateral sobre el conjunto de seleccion.
- Desajuste metodologico declarado: los runs de ajuste usaron 64 filas por paso, mientras que este experimento usa 60.
- Con solo tres ordenes de datos por metodo, las bandas min-max son fragiles y no deben interpretarse como intervalos de confianza.
- Los resultados de la busqueda web (PolyMerge, model-explorer, Desmos, un articulo sobre DVH con GNN, ChatGPT) no estan relacionados con este repositorio y no deben usarse como fuente de datos sobre el mismo.
- Riesgo de sobreinterpretacion: figA, figB y figD se presentan sin cifras en el texto del README, por lo que cualquier numero citado de memoria a partir de ellas seria una invencion. Es necesario abrir las figuras o data/dose_tables.md.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/jprivera/260922_fixed_dose_graphs
- GitHub de PolyMerge (no relacionado con este repositorio): https://github.com/AshenDary/PolyMerge
- GitHub de model-explorer (no relacionado): https://github.com/google-ai-edge/model-explorer
- Articulo sobre CNN condicionadas por grafo para histogramas dosis-volumen (no relacionado): https://aapm.onlinelibrary.wiley.com/doi/10.1002/mp.70663
- Desmos Graphing Calculator (no relacionado): https://www.desmos.com/calculator
- ChatGPT (no relacionado): https://chatgpt.com/
