# OneScience-Group/UMA

## Resumen

UMA (Universal Materials Interaction Model) es un potencial interatómico de aprendizaje automático de propósito general desarrollado por OneScience-Group para sistemas de materiales y catálisis. Está basado en una red neuronal de grafos equivariante (equivariant graph neural network) que predice energías y fuerzas de estructuras atómicas, lo que permite simular adsorción catalítica, materiales inorgánicos, moléculas, polímeros, MOFs y cristales moleculares. El modelo se entrena sobre múltiples datasets de referencia (OC20, OC22, OC25, OMat, OMOL, ODAC y OMC) y admite fine-tuning específico para cada dominio, así como optimización de estructuras y dinámica molecular.

La relevancia actual de UMA radica en la creciente demanda de potenciales interatómicos precisos y eficientes para acelerar el descubrimiento de materiales y catalizadores, sustituyendo costosos cálculos DFT. Su arquitectura equivariante garantiza la invariancia rotacional y traslacional, una propiedad física esencial para la simulación atómica. Aunque el repositorio no especifica el número de parámetros ni la longitud de contexto (concepto no aplicable a este tipo de modelo), su diseño modular y su licencia MIT facilitan su integración en flujos de investigación y producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de grafos equivariante (equivariant graph neural network) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de ML para estructuras atomicas, no procesa texto) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en punto flotante, sin cuantizacion documentada) |
| Idiomas soportados | en (ingles, aunque el modelo no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | no disponible (se mencionan checkpoints .pt, como `weight/Jd.pt` y `uma-s-1p1_converted.pt`, pero no se especifica el formato oficial) |

## Arquitectura y entrenamiento

UMA emplea una red neuronal de grafos equivariante, una arquitectura que representa cada estructura atomica como un grafo donde los nodos son atomos y las aristas representan interacciones. La equivarianza respecto a rotaciones y traslaciones es una propiedad clave que garantiza que las predicciones de energia y fuerzas sean fisicamente consistentes. El modelo se entrena sobre una combinacion de datasets de referencia ampliamente utilizados en la comunidad: OC20, OC22, OC25 (catálisis y electrocatalisis), OMat (materiales inorganicos), OMOL (moleculas y polimeros), ODAC (MOFs) y OMC (cristales moleculares). No se especifican detalles sobre el numero total de tokens de entrenamiento ni sobre el uso de tecnicas como RLHF o DPO, que no son habituales en este tipo de modelos.

El repositorio incluye un script de conversion de datos (`create_uma_finetune_dataset.py`) que transforma archivos `.extxyz` al formato ASE-LMDB, calculando ademas las referencias de energia por elemento (`elem_refs`) y el normalizador RMSD. Tambien se proporciona un script para actualizar la configuracion de entrenamiento con estos valores. El entrenamiento se realiza mediante fine-tuning sobre los pesos preentrenados, que deben descargarse del repositorio oficial de fairchem y convertirse al formato UMA (por ejemplo, `uma-s-1p1_converted.pt`).

## Capacidades

- Prediccion de energia total y fuerzas atomicas para sistemas de materiales y catalisis.
- Optimizacion de estructuras (relajacion) para adsorcion catalitica, materiales inorganicos, moleculas, MOFs y cristales moleculares.
- Fine-tuning especifico por tarea: OC20, OC22, OC25, OMat, OMOL, ODAC y OMC, con configuraciones estandar proporcionadas en el repositorio.
- Soporte para dinamica molecular y simulaciones de adsorcion en superficies cataliticas.
- Compatibilidad con estructuras legibles por ASE, lo que facilita la migracion de datos propios.
- Integracion con entornos GPU y DCU (procesadores chinos) mediante el paquete `onescience[matchem-gpu]` o `onescience[matchem-dcu]`.
- No incluye capacidades de tool calling, agentes ni procesamiento de lenguaje natural; es un modelo puramente fisico-quimico.

## Casos de uso

- Fine-tuning en OC20 para simulacion de adsorcion catalitica: el modelo puede ajustarse al dataset OC20 (S2EF) para predecir energias y fuerzas en superficies de catalizadores, acelerando el cribado de materiales activos.
- Fine-tuning en OC22 para catalisis de oxidos: permite modelar reacciones en oxidos metalicos, un area clave en electrocatalisis y fotocatalisis.
- Fine-tuning en OC25 para electrocatalisis: adecuado para estudiar procesos electroquimicos como la reduccion de CO2 o la evolucion de oxigeno.
- Fine-tuning en OMat para materiales inorganicos: util para predecir propiedades de solidos cristalinos y amorfos, como modulos elasticos o estabilidad de fases.
- Fine-tuning en OMOL para moleculas y polimeros: permite simular dinamica molecular de sistemas organicos, incluyendo polimeros con configuraciones conformacionales complejas.
- Fine-tuning en ODAC para MOFs: orientado a la prediccion de propiedades de estructuras metalo-organicas, relevantes en almacenamiento de gases y separacion.
- Fine-tuning en OMC para cristales moleculares: aplicable al estudio de empaquetamientos cristalinos y transiciones de fase en compuestos farmaceuticos o energeticos.
- Inferencia directa para relajacion de estructuras: usando los scripts de ejemplo del repositorio, se pueden relajar estructuras atomicas sin necesidad de reentrenar, partiendo de pesos preentrenados convertidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas comparativas con otros potenciales interatomicos (como MACE, NequIP, GemNet o DimeNet) ni metricas cuantitativas de error en energia o fuerzas. Se recomienda consultar el repositorio oficial de fairchem o publicaciones cientificas del grupo para obtener datos de rendimiento.

## Requisitos de hardware

- Se recomienda una GPU o DCU para fine-tuning y entrenamiento; la CPU solo es adecuada para verificar configuraciones y rutas de datos, no para produccion.
- No se especifica la VRAM minima ni las GPUs concretas soportadas. Dado que se trata de un modelo de grafos equivariante, es probable que requiera al menos 16-24 GB de VRAM para datasets grandes como OC20, pero este dato no esta disponible.
- Para usuarios de DCU, se requiere instalar DTK 25.04.2 o superior, o la version recomendada por OneScience.
- Opciones de despliegue: el repositorio proporciona scripts de entrenamiento e inferencia bajo el paquete `onescience`. No se mencionan integraciones con vLLM, llama.cpp u Ollama (no aplicables a este tipo de modelo).
- La latencia y el throughput dependen del tamano del sistema atomico y del hardware; no se proporcionan cifras estimadas.

## Comparativa con modelos similares

No se dispone de informacion suficiente en la model card para establecer una comparativa con otros potenciales interatomicos. Modelos como MACE, NequIP, GemNet o DimeNet podrian considerarse alternativas, pero no se proporcionan datos de parametros, contexto ni rendimiento para UMA. Se recomienda consultar la documentacion de fairchem y la literatura cientifica para una evaluacion comparativa.

## Limitaciones y advertencias

- No se especifican sesgos conocidos ni riesgos de alucinacion (concepto no aplicable a un modelo de ML fisico).
- El modelo requiere fine-tuning por tarea; el uso directo sin ajuste puede producir predicciones poco precisas en dominios no cubiertos por los datasets de entrenamiento.
- Los pesos preentrenados no estan incluidos en el repositorio; deben descargarse de fairchem y convertirse, lo que anade un paso manual y una dependencia externa.
- La documentacion no detalla el tamano del modelo ni los requisitos exactos de memoria, lo que dificulta la planificacion de despliegue.
- La licencia MIT permite uso comercial, pero el usuario es responsable de verificar las licencias de los datasets utilizados (OC20, OC22, etc.), que pueden tener restricciones propias.
- No se menciona soporte para calculo en CPU en produccion; el rendimiento en CPU seria muy limitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OneScience-Group/UMA
- Dataset OC20 en HuggingFace: https://huggingface.co/datasets/OneScience-Group/oc20
- Repositorio oficial de fairchem (pesos preentrenados): https://github.com/facebookresearch/fairchem
- Entorno OneCode (programacion AI4S): https://web-2069360198568017922-iaaj.ksai.scnet.cn:58043/home
