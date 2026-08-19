# OneScience-Group/DiffDock

## Resumen

DiffDock es un modelo de difusión para el acoplamiento molecular proteína-ligando, propuesto por Corso et al. y publicado por el grupo OneScience. Aborda el docking como un problema de modelado generativo: dado un receptor proteico y un ligando de molécula pequeña, modela conjuntamente los grados de libertad traslacionales, rotacionales y torsionales del ligando mediante procesos de difusión en los grupos SO(3)/SE(3), generando así conformaciones de unión candidatas. Este enfoque difiere de los métodos tradicionales de docking basados en búsqueda o minimización, y resulta especialmente relevante para el descubrimiento de fármacos y el cribado virtual, donde la generación rápida de poses plausibles es crítica.

El modelo está diseñado para soportar acoplamiento de un solo complejo, acoplamiento por lotes, evaluación de datasets y reordenamiento de conformaciones mediante un modelo de confianza adicional. En el momento de redactar esta ficha, los pesos y los conjuntos de datos de entrenamiento no están disponibles públicamente; el repositorio incluye únicamente código fuente, configuraciones y ejemplos de entrada. Se espera que los pesos se suban próximamente a Hugging Face, y que se habilite la descarga por línea de comandos. La licencia es MIT, lo que permite uso comercial y modificación sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión sobre SO(3)/SE(3) (no se detalla la red subyacente) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica, es un modelo de docking molecular) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (para documentación y configuraciones) |
| Licencia | MIT |
| Formato de pesos | no disponible (aún no se publican pesos) |

## Arquitectura y entrenamiento

La model card describe DiffDock como un modelo de difusión que opera sobre los grados de libertad del ligando: traslación (en R3), rotación (en SO(3)) y torsiones (en el toro). El proceso de difusión genera conformaciones de unión de forma iterativa, partiendo de ruido y refinando hacia poses válidas. No se especifican detalles de la arquitectura interna (p. ej., si usa redes neuronales equivariantes, grafos moleculares, etc.), ni se proporcionan datos sobre el conjunto de entrenamiento, número de tokens o técnicas de alineación como RLHF o DPO. El entrenamiento se realiza sobre los datasets PDBBind y MOAD, según se menciona en los casos de uso, pero no se ofrecen cifras concretas de volumen o composición. La única innovación técnica destacable es el uso de difusión sobre grupos de Lie para modelar la geometría del docking, un enfoque que ya fue introducido en el artículo original de Corso et al. (2022).

## Capacidades

- Acoplamiento molecular de un solo complejo: dado un fichero PDB de la proteína y un ligando en formato SMILES, SDF o MOL2, genera conformaciones de unión candidatas en formato SDF.
- Acoplamiento molecular por lotes: procesa un CSV con proteínas, ligandos y nombres de complejos, produciendo conformaciones muestreadas en lote.
- Entrenamiento del modelo de score: permite entrenar el modelo de difusión a partir de datos procesados de PDBBind o MOAD, generando un checkpoint del modelo.
- Reordenamiento de conformaciones: utiliza un modelo de confianza adicional para clasificar y seleccionar las poses generadas.
- Evaluación de datasets: calcula métricas como RMSD sobre resultados de muestreo en conjuntos de validación o test, con integración opcional de GNINA para minimización de energía.
- Integración con entornos de programación AI4S: se puede usar a través de OneCode, un entorno online de programación científica, o mediante instalación manual con dependencias estándar (PyTorch, PyTorch Geometric, RDKit, OpenBabel, e3nn, etc.).

## Casos de uso

- Descubrimiento de fármacos: DiffDock puede generar poses de unión de ligandos candidatos a una proteína diana, acelerando la identificación de compuestos líderes en etapas tempranas de investigación.
- Cribado virtual: el modo de acoplamiento por lotes permite evaluar miles de ligandos contra una misma proteína, priorizando aquellos con mejores puntuaciones de confianza para experimentos posteriores.
- Optimización de ligandos: al generar múltiples conformaciones, los investigadores pueden analizar la flexibilidad del ligando y diseñar análogos con mejor complementariedad estructural.
- Validación de resultados experimentales: las poses generadas pueden compararse con estructuras cristalográficas (si existen) para verificar la precisión del modelo en sistemas específicos.
- Entrenamiento y fine-tuning: el código permite entrenar el modelo de score sobre datasets propios (PDBBind, MOAD), lo que posibilita adaptarlo a familias de proteínas o tipos de ligandos particulares.
- Integración en pipelines de modelado molecular: al ser una herramienta de línea de comandos, puede incorporarse en flujos automatizados de simulación o aprendizaje automático, por ejemplo, como generador de poses iniciales para dinámica molecular.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como RMSD, tasa de éxito o comparaciones con otros métodos de docking. Se recomienda consultar el artículo original de Corso et al. (2022) para datos de rendimiento, pero no se dispone de ellos en esta ficha.

## Requisitos de hardware

- Se recomienda ejecutar en GPU o DCU (procesador de Hygon). La CPU es viable solo para comprobaciones de conectividad, pero resulta lenta.
- No se especifica la VRAM mínima ni el número de GPUs necesarias. Dado que el modelo es de difusión y trabaja con grafos moleculares, se espera que requiera al menos 8-16 GB de VRAM, pero este dato no está confirmado.
- Para usuarios de DCU, se requiere instalar DTK (versión 25.04.2 o superior) y activar el entorno CUDA correspondiente.
- Opciones de despliegue: el código se ejecuta mediante scripts (`train.sh`, `infer.sh`) y requiere un entorno Python con las dependencias listadas. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- La latencia y el throughput dependen del hardware y del número de pasos de difusión, pero no se proporcionan cifras.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada. Otros métodos de docking como AutoDock Vina o Glide son herramientas tradicionales basadas en búsqueda, no modelos generativos de difusión, por lo que una comparación directa requeriría datos de benchmarks que no están disponibles.

## Limitaciones y advertencias

- Los pesos del modelo no están disponibles actualmente; el repositorio solo contiene código y ejemplos. No se puede utilizar el modelo en producción hasta que se publiquen los checkpoints.
- No se proporcionan datos sobre sesgos o alucinaciones, pero al ser un modelo generativo, las poses generadas pueden ser químicamente inviables o geométricamente incorrectas si el modelo no está bien entrenado o los datos de entrada son inadecuados.
- La precisión del docking depende en gran medida de la calidad de los datos de entrenamiento (PDBBind, MOAD) y de la preparación de las estructuras (procesamiento de la proteína, protonación, etc.). Un preprocesado deficiente puede degradar los resultados.
- La licencia MIT permite uso comercial, pero la ausencia de pesos limita su aplicabilidad práctica hasta que se publiquen.
- El modelo está documentado solo en inglés; la comunidad hispanohablante deberá traducir la documentación o recurrir a fuentes secundarias.
- Para evaluación con GNINA, es necesario instalar esta herramienta por separado, lo que añade una dependencia adicional.

## Enlaces

- [HuggingFace: OneScience-Group/DiffDock](https://huggingface.co/OneScience-Group/DiffDock)
- [Entorno OneCode (acceso online)](https://web-2069360198568017922-iaaj.ksai.scnet.cn:58043/home)
