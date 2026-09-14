# Scinetics/enzymecot

## Resumen

EnzymeCoT (etapa III, checkpoint conjunto) es un artefacto de investigación publicado por Scinetics en HuggingFace que contiene exclusivamente adaptadores entrenados para diseño de enzimas de novo condicionado por reacción química. No es un modelo autónomo: se compone de adaptadores LoRA sobre Qwen3-4B, que actúa como modelo de comprensión, y sobre RFdiffusion3, que actúa como generador de estructura, junto con proyecciones de estructura y ligando y un módulo de inyección. El fichero distribuido, `s3_best.pt`, es un `state_dict` de PyTorch de 553 MB con 755 tensores y 138,9 millones de parámetros; no incluye pesos de los modelos base ni estado del optimizador.

El problema que aborda es el diseño de enzimas para una reacción dada definida por SMILES, junto con la química del ligando, sus coordenadas 3D y una longitud objetivo de proteína. El pipeline se organiza en tres rondas: en R1 se propone un conjunto no indexado de residuos catalíticos (identidad y rol catalítico o de soporte) con geometría local relativa al ligando; en R2 se genera un esqueleto completo y se asignan los objetos de R1 a posiciones concretas; en R3 se completa la secuencia y las cadenas laterales heredando el núcleo comprometido.

Es relevante ahora como ejemplo de acoplamiento entre un modelo de lenguaje y un modelo de difusión estructural mediante adaptadores de bajo rango, con licencia Apache 2.0 y solo 0,6 GB de repositorio. Sin embargo, el propio autor advierte de que las métricas publicadas corresponden al checkpoint de paso 2500 y no a este de paso 4000, que no ha sido reevaluado de extremo a extremo, y que la calidad del diseño autónomo en tres rondas sigue siendo débil. Debe tratarse como artefacto de investigación, no como diseñador de enzimas listo para uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA sobre Qwen3-4B (comprensión) y RFdiffusion3 (generador de estructura, difusión), más proyecciones de estructura/ligando y módulo de inyección |
| Parametros totales | 138,9 M parámetros en el `state_dict` (755 tensores). No incluye los pesos de los modelos base |
| Parametros activos | No es un modelo MoE. Desglose de componentes entrenados: inyección 2,29 M y LoRA de RFdiffusion3 2,89 M (MLP); el resto hasta 138,9 M corresponde al conjunto del checkpoint |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles en la información proporcionada; la model card está redactada en inglés |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch `state_dict` (`.pt`), 553 MB; tamaño del repositorio 0,6 GB |

## Arquitectura y entrenamiento

La arquitectura es un sistema híbrido de dos torres acopladas. La torre de comprensión es Qwen3-4B con adaptadores LoRA; la torre generativa es RFdiffusion3, también con LoRA (2,89 M de parámetros, con MLP), que produce la estructura de la proteína mediante difusión. Entre ambas se sitúan proyecciones específicas de estructura y de ligando y un módulo de inyección de 2,29 M de parámetros que transfiere la información condicionante. El entrenamiento es conjunto, es decir, ambos conjuntos de adaptadores se optimizan a la vez. El checkpoint se entrenó durante 4000 pasos, ejecutados hasta completarse, con una pérdida de validación `L_gen` que descendió de 0,386 a 0,3497, el valor más bajo de toda la ejecución. La fecha indicada para el checkpoint es el 11 de septiembre de 2026.

Los datos proceden del corpus EnzymeCoT, con 19.888 registros de entrenamiento y 1.123 de validación, longitudes de proteína entre 100 y 997 residuos, y una partición disjunta por reacción y por homología para evitar fugas entre conjuntos. Las conformaciones de unión del ligando se toman de complejos de referencia que, según la propia model card, son predicciones de Boltz y no estructuras experimentales, lo que constituye una limitación relevante para interpretar la señal de entrenamiento.

## Capacidades

- Generación de texto y razonamiento sobre química de reacciones: interpreta el SMILES de la reacción y la descripción química del ligando como condicionantes.
- Diseño de novo de enzimas en tres rondas encadenadas: propuesta de residuos catalíticos no indexados (R1), generación de esqueleto completo con asignación de posiciones (R2) y completado de secuencia y cadenas laterales (R3).
- Generación de estructura proteica mediante difusión, heredada de RFdiffusion3, con condicionamiento por ligando y geometría local.
- Manejo de información estructural 3D: el modelo recibe coordenadas del ligando y produce geometría relativa al sitio catalítico.
- Control de longitud de la proteína objetivo, en el rango trabajado de 100 a 997 residuos.
- Capacidad de trabajar con identificadores de objeto sin posición de secuencia asignada en R1, lo que permite desacoplar la identidad catalítica de la numeración final.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso general: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales: modo de razonamiento explícito, visión o audio no disponibles; la única especialidad documentada es el diseño estructural condicionado por reacción.

## Casos de uso

- Exploración de hipótesis de mecanismo catalítico: dado un SMILES de interés, el modelo propone conjuntos de residuos catalíticos y su papel (catalítico o de soporte) junto con la geometría local respecto al ligando, lo que sirve para generar hipótesis que después se contrastan experimentalmente.
- Generación de andamiajes proteicos candidatos: en la ronda R2 el modelo produce un esqueleto completo y asigna los residuos catalíticos a posiciones concretas, lo que permite obtener estructuras candidatas para modelado posterior con herramientas de plegado.
- Completado de secuencia sobre un núcleo catalítico fijado: en R3 el modelo rellena la secuencia y las cadenas laterales respetando las identidades comprometidas, un flujo útil cuando el investigador quiere mantener un motivo catalítico y variar el resto del entorno.
- Generación de conjuntos de entrenamiento sintéticos: los diseños producidos pueden usarse como datos aumentados para entrenar o afinar otros modelos de diseño de proteínas, siempre que se filtren por criterios computacionales.
- Investigación metodológica sobre acoplamiento de modelos: sirve como referencia reproducible para estudiar cómo se comporta el entrenamiento conjunto de un LLM y un modelo de difusión mediante LoRA, incluyendo el análisis de la pérdida `L_gen` a lo largo de los 4000 pasos.
- Enseñanza y divulgación sobre diseño de enzimas asistido por IA: el pipeline en tres rondas es un ejemplo didáctico de descomposición de una tarea estructural compleja en etapas con condicionamiento progresivo.
- Filtrado y priorización de candidatos en un pipeline computacional: combinado con LigandMPNN y métricas de pLDDT, los diseños generados pueden ordenarse antes de decidir qué candidatos se sintetizan, reduciendo el coste experimental.
- Análisis de sensibilidad frente al condicionante de reacción: variando el SMILES y manteniendo fijo el ligando o la longitud, se puede estudiar hasta qué punto el modelo condiciona la geometría del sitio catalítico a la química de la reacción.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible corresponden al checkpoint de paso 2500, no al fichero distribuido aquí (paso 4000). Se reproducen tal cual, con la advertencia explícita del autor de que no deben atribuirse a este fichero sin reevaluar.

| Metrica | Valor reportado (checkpoint paso 2500, val 0,3526) | Valor en este fichero (paso 4000, val 0,3497) |
|---|---|---|
| RMSD del sitio catalítico | 0,94 A | no reevaluado |
| Autoconsistencia LigandMPNN-8 | 5/8 | no reevaluado |
| Diseños designables | 8/8 | no reevaluado |
| pLDDT | 77,9 / 94,5 | no reevaluado |
| Perdida de validacion `L_gen` | 0,3526 | 0,3497 |

No se han publicado resultados de benchmarks comparables (MMLU, HumanEval, GSM8K u otros) en la información disponible, y estos no serían aplicables a un modelo de diseño estructural.

## Requisitos de hardware

- El fichero de adaptadores ocupa 553 MB en disco (repositorio de 0,6 GB), pero no es autónomo: requiere descargar Qwen3-4B y RFdiffusion3.
- VRAM estimada para los adaptadores: despreciable frente a los modelos base; el grueso del consumo proviene de Qwen3-4B y de RFdiffusion3. Cifra exacta para RFdiffusion3: no disponible.
- Estimación orientativa para Qwen3-4B: aproximadamente 8 GB en bf16 y alrededor de 2,5-3 GB en cuantización de 4 bits, a lo que hay que sumar la memoria de RFdiffusion3 y la de las proyecciones e inyección.
- GPU recomendadas: no disponibles en la información proporcionada. Para el componente de difusión estructural, el rango habitual en este tipo de pipelines es A100 o H100 por memoria y velocidad, aunque el autor no especifica requisitos.
- ¿Cabe en GPU de consumo? No disponible. El modelo de lenguaje de 4B sí es ejecutable en GPU de consumo con cuantización, pero el requisito conjunto con RFdiffusion3 y las proyecciones no está documentado.
- Opciones de despliegue: no disponibles. El formato es un `state_dict` de PyTorch, no un formato GGUF ni un modelo de `transformers` listo para vLLM, llama.cpp, Ollama o TGI. La carga requiere el código de entrenamiento original y los dos modelos base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Sistema | Enfoque | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EnzymeCoT (este checkpoint) | LLM (Qwen3-4B) + difusion (RFdiffusion3) con LoRA conjunto, tres rondas | 138,9 M en adaptadores; modelos base aparte | no disponible | apache-2.0 | Repositorio HuggingFace con 0 descargas y 0 likes; requiere modelos base |
| RFdiffusion / RFdiffusion3 + LigandMPNN | Difusion de estructura seguida de diseño de secuencia, en dos etapas separadas | no disponible | no disponible | no disponible | no disponible |
| Chroma | Difusion generativa de proteinas con condicionamiento programable | no disponible | no disponible | no disponible | no disponible |
| ProteinMPNN / LigandMPNN | Red de diseno de secuencia sobre esqueleto fijo | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos numéricos comparativos de parámetros, contexto, licencia ni rendimiento para las alternativas, por lo que la comparación es únicamente de enfoque metodológico. La diferencia principal de EnzymeCoT es el acoplamiento conjunto de un modelo de lenguaje y un generador de difusión mediante adaptadores, frente a los pipelines clásicos que encadenan etapas entrenadas por separado.

## Limitaciones y advertencias

- El fichero es un checkpoint de adaptadores, no un modelo utilizable por sí solo: sin Qwen3-4B y RFdiffusion3 no funciona, y el autor no documenta el procedimiento de carga.
- Las métricas citadas (RMSD catalítico 0,94 A, autoconsistencia 5/8 y 8/8, pLDDT 77,9 / 94,5) corresponden al paso 2500, no al paso 4000 distribuido. Atribuirlas a este fichero sería incorrecto sin reevaluación propia.
- No hay validación experimental: no se ha medido actividad catalítica. Las métricas son de autoconsistencia computacional y distancia a la referencia, y ninguna de las dos establece catálisis.
- El propio autor califica la calidad del diseño autónomo en tres rondas como débil y pide tratar el checkpoint como artefacto de investigación.
- Las conformaciones de unión del ligando del corpus de entrenamiento provienen de predicciones de Boltz, no de estructuras experimentales, lo que introduce error sistemático en los datos.
- Riesgo de alucinación estructural: al ser un modelo generativo de estructura, puede producir esqueletos y sitios catalíticos plausibles pero no realizables, sin señal de confianza calibrada.
- Sesgos conocidos: no disponibles. No se documenta análisis de sesgo, diversidad de plegados ni cobertura taxonómica del corpus.
- Limitaciones de contexto e idioma: no disponibles. La ventana de contexto efectiva del componente de lenguaje no se especifica.
- Restricciones de licencia: la licencia es Apache 2.0, que permite uso comercial, pero se aplica al artefacto publicado; las licencias de Qwen3-4B y RFdiffusion3 deben verificarse por separado antes de cualquier uso en producción.
- Estado de adopción nulo: 0 descargas y 0 likes, sin evidencia de uso independiente ni de replicación de resultados.
- Para producción: no apto. No hay tests, ni API, ni versionado semántico, ni soporte documentado; el formato `state_dict` obliga a disponer del código de entrenamiento original.
- Las fechas de creación y actualización del repositorio (septiembre de 2026) son posteriores a la fecha actual, un detalle a tener en cuenta al evaluar la trazabilidad del artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Scinetics/enzymecot
- Paper asociado: no disponible
- Blog o anuncio del autor: no disponible
- Repositorio de código: no disponible
- Demo: no disponible
- Modelo base de comprensión (Qwen3-4B): no disponible en la información proporcionada
- Modelo base generador (RFdiffusion3): no disponible en la información proporcionada
- Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los enlaces obtenidos correspondían a foros de construcción y financiación sin relación con el contenido de esta ficha.
