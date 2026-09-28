# FahimehBahman/PolyTAO-Student

## Resumen

PolyTAO-Student es un modelo Transformer de tipo encoder-decoder (familia T5) desarrollado por FahimehBahman en el marco de su tesis de master, titulada "Knowledge-Distilled Transformers for Property-Conditioned Polymer Generation". El modelo genera representaciones de polimeros en formato BigSMILES condicionadas por un vector de 15 propiedades moleculares, y su proposito principal es servir como objeto de estudio sobre como la compresion de un Transformer afecta a la validez quimica, la fidelidad de propiedades y el comportamiento generativo de modelos polimericos condicionados.

El checkpoint publicado se obtuvo mediante destilacion de conocimiento a nivel de caracteristicas (_feature-level_) desde un profesor congelado inicializado a partir de `hkqiu/PolyTAO-BigSMILES_Version`. La configuracion liberada corresponde a un `capacity_percent` de 20, con 2 capas de encoder y 12 capas de decoder, manteniendo una dimension oculta (`d_model`) de 768 y 12 cabezas de atencion. El recuento real de parametros en safetensors es de 152.110.848 (aproximadamente 152M), con un repositorio de 0,6 GB.

Se trata de un modelo de investigacion con cero descargas y cero likes en el momento de la consulta, sin licencia declarada ni idiomas especificados. El propio autor advierte que el checkpoint se proporciona unicamente para fines de investigacion y reproducibilidad, y que no esta destinado a uso en produccion ni a la toma de decisiones quimicas o experimentales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder estilo T5 con condicionamiento por propiedades |
| Parametros totales | 152.110.848 (aproximadamente 152M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en precision completa; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (el dominio es generacion de BigSMILES, no lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Capas de encoder | 2 |
| Capas de decoder | 12 |
| Dimension oculta (d_model) | 768 |
| Cabezas de atencion | 12 |
| Vector de condicionamiento | 15 propiedades moleculares |
| Modelo base | hkqiu/PolyTAO-BigSMILES_Version |
| Tamano del repositorio | 0,6 GB |
| Libreria | transformers |

## Arquitectura y entrenamiento

El modelo es un Transformer encoder-decoder de estilo T5. La rama de encoder del estudiante publicado consta de 2 capas frente a las 12 del profesor, mientras que el decoder conserva las 12 capas del profesor. La dimension oculta es de 768 en ambos casos, con 12 cabezas de atencion. La etiqueta "20%" hace referencia al ajuste `capacity_percent` de la ejecucion de entrenamiento y no debe interpretarse como que el modelo final contenga exactamente el 20% de los parametros totales del profesor.

El condicionamiento por propiedades se implementa mediante un vector de 15 dimensiones (MolWt, HeavyAtomCount, NHOHCount, NOCount, NumAliphaticCarbocycles, NumAliphaticHeterocycles, NumAliphaticRings, NumAromaticCarbocycles, NumAromaticHeterocycles, NumAromaticRings, NumHAcceptors, NumHDonors, NumHeteroatoms, NumRotatableBonds y RingCount). Este vector se proyecta linealmente al espacio oculto, se normaliza en L2, se escala por un factor de 0,05 y se anade a todas las posiciones de la representacion oculta del encoder, de forma que influye en la representacion que consume el decoder durante la generacion. Durante el entrenamiento se emplearon versiones normalizadas de las propiedades cuando estaban disponibles.

El proceso de entrenamiento parte de un profesor inicializado desde `hkqiu/PolyTAO-BigSMILES_Version` y posteriormente entrenado con condicionamiento por propiedades moleculares. Ese profesor se congela y se utiliza para transferir conocimiento a nivel de caracteristicas hacia configuraciones de estudiante mas pequenas. Se exploraron varias configuraciones de estudiante para analizar la relacion entre capacidad del modelo y rendimiento generativo. El modelo, el tokenizador y la proyeccion de propiedades aprendida se guardan por separado. La evaluacion del pipeline se realiza con RDKit. El texto de la model card disponible se interrumpe en la descripcion del proceso de destilacion, por lo que no se detallan la funcion de perdida exacta, el numero de tokens de entrenamiento ni la composicion completa del dataset.

## Capacidades

- Generacion de polimeros en representacion BigSMILES condicionada por un vector de 15 propiedades moleculares.
- Generacion text2text: el pipeline declarado en las etiquetas del repositorio es `text2text-generation`.
- Condicionamiento multi-propiedad: permite dirigir la generacion hacia objetivos de peso molecular, numero de anillos, aceptores/donadores de hidrogeno, enlaces rotables y otros descriptores.
- Modelado de propiedades quimicas: la representacion condicionada incorpora informacion de propiedades en el encoder para influir en la decodificacion.
- Destilacion de conocimiento a nivel de caracteristicas desde un profesor de mayor capacidad, lo que le permite retener parte de las representaciones internas aprendidas por el profesor.
- Evaluacion de validez y fidelidad quimica a traves de RDKit en el pipeline de investigacion.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, vision, audio ni modo de pensamiento.

## Casos de uso

- Generacion de candidatos polimericos con propiedades diana: el modelo puede generar estructuras BigSMILES condicionadas a un vector de 15 descriptores, de modo que el investigador fija objetivos como peso molecular o numero de anillos aromaticos y obtiene candidatos que cumplen esas restricciones.
- Cribado virtual previo a sintesis: dado que el pipeline incluye evaluacion con RDKit, el modelo puede usarse para producir lotes de candidatos que despues se filtran por validez quimica y propiedades, reduciendo el numero de compuestos a sintetizar.
- Estudio de compresion de modelos en quimioinformatica: es un caso de uso directo del propio objetivo de la tesis, comparando la validez quimica y la fidelidad de propiedades del estudiante frente al profesor para cuantificar el efecto de reducir la profundidad del encoder.
- Reproducibilidad academica: al publicarse el checkpoint con la configuracion exacta (2 capas de encoder, 12 de decoder, `capacity_percent` de 20), sirve para reproducir los experimentos descritos en la tesis.
- Generacion de datos sinteticos de entrenamiento: las muestras generadas pueden emplearse para aumentar conjuntos de datos de polimeros etiquetados con propiedades, siempre bajo validacion posterior con RDKit.
- Docencia en aprendizaje profundo aplicado a quimica: permite ilustrar en un aula como funciona el condicionamiento por propiedades y como se transfiere conocimiento entre modelos en un dominio cientifico.
- Prototipado de pipelines de generacion molecular: integrable en flujos de trabajo que cargan el modelo desde `transformers` y encadenan la generacion con la evaluacion de descriptores.
- Analisis del compromiso capacidad-rendimiento: util para estudiar hasta que punto se puede reducir la profundidad del encoder sin degradar la validez quimica de las estructuras generadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para el checkpoint PolyTAO-Student. La model card no incluye tablas de evaluacion, y la informacion recabada en busquedas web no aporta metricas especificas atribuidas a este estudiante.

Como referencia externa, la documentacion de Paramu (terceros) describe el modelo PolyTAO como un modelo generativo condicional de polimeros con 15 propiedades fundamentales y le atribuye aproximadamente un 99,3% de validez quimica en generacion top-1. Ese dato corresponde a la familia PolyTAO en general y no se ha verificado para el checkpoint PolyTAO-Student publicado en este repositorio.

## Requisitos de hardware

Las cifras de memoria se derivan del recuento real de parametros (152,1M) y de los formatos habituales; no proceden de la model card ni de mediciones publicadas.

- VRAM estimada para pesos en FP32: en torno a 0,6 GB.
- VRAM estimada para pesos en FP16/BF16: en torno a 0,3 GB.
- VRAM estimada para pesos en INT8: en torno a 0,15 GB.
- VRAM estimada para pesos en INT4: en torno a 0,08 GB.
- A esas cifras hay que sumar el coste de las activaciones, del tokenizador y del vector de propiedades, que dependera de la longitud de secuencia y del tamano de lote.
- Cabe con holgura en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y equivalentes, incluso en precision completa.
- GPU de datacenter como A100 o H100 no son necesarias para inferencia, aunque pueden emplearse para generar grandes lotes.
- Opciones de despliegue compatibles: `transformers` de Hugging Face, servidores de inferencia compatibles con text-generation-inference segun las etiquetas del repositorio (`text-generation-inference`, `endpoints_compatible`) y despliegue local en PyTorch.
- No se documentan opciones de despliegue con llama.cpp, Ollama, vLLM o TGI especificamente, ni latencias o throughput medidos.
- Al no publicarse variantes GGUF ni cuantizadas, no puede confirmarse su funcionamiento con herramientas que requieran esos formatos.

## Comparativa con modelos similares

| Modelo | Capas encoder | Capas decoder | d_model | Parametros | Condicionamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| PolyTAO-Student (este) | 2 | 12 | 768 | 152.110.848 | 15 propiedades | no disponible | Hugging Face, 0 descargas |
| Profesor PolyTAO (hkqiu/PolyTAO-BigSMILES_Version + condicionamiento) | 12 | 12 | 768 | no disponible | 15 propiedades | no disponible | no disponible en esta busqueda |
| T5-base (referencia de arquitectura) | 12 | 12 | 768 | aproximadamente 220M | sin condicionamiento de propiedades | Apache 2.0 | ampliamente disponible |

La comparacion con T5-base es estructural: comparte dimension oculta y numero de cabezas, pero T5-base opera sobre lenguaje natural y no incorpora el mecanismo de condicionamiento por propiedades moleculares ni el tokenizador de BigSMILES. No se dispone de datos de rendimiento comparativos entre estos modelos en el dominio de generacion de polimeros dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: el propio autor indica que no esta destinado a produccion ni a la toma de decisiones quimicas o experimentales.
- Sin licencia declarada: no puede confirmarse si se permite el uso comercial, por lo que cualquier uso en produccion queda legalmente indeterminado.
- Sin resultados de benchmarks publicados para este checkpoint, lo que impide cuantificar su calidad generativa con datos verificables.
- Riesgo de generar estructuras quimicamente invalidas o de baja fidelidad a las propiedades solicitadas, especialmente al tratarse de un estudiante con el encoder reducido a 2 capas.
- El condicionamiento se implementa como una suma escalada (factor 0,05) sobre las representaciones del encoder, lo que puede limitar la intensidad con la que las propiedades guian la generacion.
- La model card disponible esta incompleta en la seccion de destilacion, por lo que no se conocen los detalles completos del entrenamiento.
- Sesgos conocidos: no documentados. Al entrenarse sobre un corpus de polimeros del checkpoint base, heredara los sesgos de distribucion quimica de ese dataset.
- No se especifican idiomas porque el dominio no es linguistico; la salida son cadenas BigSMILES, no texto en lenguaje natural.
- No hay soporte documentado de tool calling ni de razonamiento multi-paso, por lo que no es adecuado para casos de uso de agentes.
- El repositorio presenta 0 descargas y 0 likes, lo que implica ausencia de validacion por parte de la comunidad.
- Cualquier candidato generado debe validarse con herramientas como RDKit antes de considerarse utilizable en un contexto quimico real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FahimehBahman/PolyTAO-Student
- Modelo base: https://huggingface.co/hkqiu/PolyTAO-BigSMILES_Version
- Repositorio GitHub del proyecto: https://github.com/fahimehbahman/Polytao
- Documentacion de PolyTAO en Paramu (referencia de terceros): https://documentation.paramus.ai/apps/polytao/
