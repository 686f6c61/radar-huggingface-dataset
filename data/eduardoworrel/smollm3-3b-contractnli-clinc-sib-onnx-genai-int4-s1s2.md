# eduardoworrel/SmolLM3-3B-ContractNLI-CLINC-SIB-ONNX-genai-int4-S1S2

## Resumen

SmolLM3-3B ContractNLI + CLINC150 + SIB-200 es un modelo especialista multi-tarea derivado de HuggingFaceTB/SmolLM3-3B mediante cuantizacion a int4 y exportacion al formato ONNX Runtime GenAI, con el objetivo de ejecutarse en el navegador a traves de WebGPU. Lo publica el usuario eduardoworrel y anade una cabeza de clasificacion independiente por tarea sobre el modelo base: ContractNLI (determinar si una hipotesis se deduce, se contradice o no se menciona en un contrato de confidencialidad), CLINC150 (clasificar si una consulta esta dentro o fuera de dominio) y SIB-200 (clasificacion tematica en ingles y portugues).

La propuesta tecnica se articula en torno a la separacion entre un "Sistema 1" de decision rapida (una unica pasada forward que devuelve una opcion, una probabilidad y un margen) y un "Sistema 2" de generacion autoregresiva que solo se activa cuando el margen de la decision cae por debajo de un umbral calibrado. Esta arquitectura de escalado condicional busca reducir coste computacional en tareas de clasificacion, reservando la generacion de texto para los casos ambiguos.

El modelo es relevante para escenarios de despliegue en cliente (navegador, sin backend) donde se requiere clasificacion de documentos legales, enrutamiento de consultas o etiquetado tematico con latencia baja y sin envio de datos a un servidor. El repositorio ocupa 1,8 GB y la licencia es CC BY-SA 4.0, condicionada por el dataset SIB-200.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM3-3B) con cabezas de clasificacion por tarea, exportado a ONNX Runtime GenAI |
| Parametros totales | 3B (modelo base SmolLM3-3B); parametros de las cabezas no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens para ContractNLI (limite declarado por el autor); no disponible para el resto de tareas |
| Tipos de cuantizacion | int4 (grafo ONNX Runtime GenAI) |
| Idiomas soportados | en, pt |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | ONNX (onnxruntime-genai), int4; adaptador PyTorch LoRA publicado por separado |

## Arquitectura y entrenamiento

El modelo parte de SmolLM3-3B, un transformer decoder-only de 3.000 millones de parametros desarrollado por Hugging Face. Sobre el se anaden cabezas de clasificacion especificas por tarea (una por cada conjunto de datos) y se entrena un adaptador LoRA, publicado de forma independiente en eduardoworrel/SmolLM3-3B-ContractNLI-CLINC-SIB-LoRA. El resultado se cuantiza a int4 y se exporta a ONNX Runtime GenAI para su ejecucion en WebGPU.

El entrenamiento combina tres conjuntos de datos: ContractNLI (Koreeda y Manning, 2021; CC BY 4.0) para inferencia de lenguaje natural sobre contratos, CLINC150 (Larson et al., 2019; CC BY 3.0) reformulado como clasificacion binaria dentro/fuera de dominio, y SIB-200 (Adelani et al., 2024; CC BY-SA 4.0) para clasificacion tematica en ingles y portugues. La innovacion principal es el esquema S1S2: la cabeza de decision produce una respuesta tipada con probabilidad y margen en una sola pasada, y un mecanismo de escalado ("escalate") activa la generacion autoregresiva solo cuando el margen es bajo. El autor cita como precursores el trabajo de Alias Robotics (alias3-web) y el articulo "Browser Immune System" (arXiv 2611.15302). No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplico RLHF o DPO.

## Capacidades

- Clasificacion de inferencia de lenguaje natural sobre contratos (ContractNLI): determinar si una hipotesis se deduce, se contradice o no se menciona en un NDA.
- Clasificacion de dominio de consultas (CLINC150): decidir si una consulta esta dentro o fuera del alcance del sistema, en formato binario.
- Clasificacion tematica multilingue (SIB-200): siete categorias (ciencia/tecnologia, viaje, politica, deportes, salud, entretenimiento, geografia) en ingles y portugues.
- Decision en una sola pasada forward con salida tipada: opcion elegida, probabilidad y margen.
- Generacion de texto autoregresiva bajo demanda (Sistema 2), utilizada para explicar decisiones o resolver casos de margen bajo.
- Escalado condicional mediante umbral calibrado sobre datos etiquetados propios.
- Ejecucion en navegador con WebGPU a traves de la libreria s1s2.
- Cabeza de evidencia adicional incluida en `heads/evidence_cnli/` (deteccion de fragmentos dentro del contrato), aunque la version 0.1 de s1s2 aun no la integra.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agentes y razonamiento multi-paso: no disponible como funcion nativa; el esquema S1S2 implementa un unico paso de escalado.

## Casos de uso

- Revision de acuerdos de confidencialidad en el navegador: el modelo clasifica si una clausula hipotetica se deduce, se contradice o no se menciona en un NDA, con un limite de 2.048 tokens por contrato. Al ejecutarse en cliente, el texto del contrato no sale del dispositivo.
- Enrutamiento de consultas en asistentes conversacionales: CLINC150 permite decidir si una consulta del usuario esta dentro del dominio soportado antes de invocar un LLM mayor, reduciendo coste y latencia en produccion.
- Etiquetado tematico de articulos y noticias en ingles y portugues: SIB-200 con precision equilibrada del 91,4 % y 92,7 % respectivamente permite clasificar contenido editorial sin backend.
- Deteccion de consultas fuera de alcance en sistemas de atencion al cliente: la clasificacion binaria de CLINC150 (86,9 % de precision equilibrada) sirve como filtro previo para derivar a un agente humano o a un modelo mayor.
- Analisis de contratos en herramientas de escritorio o extensiones de navegador: el grafo int4 de 1,75 GB se descarga una vez y se ejecuta localmente con WebGPU, sin dependencia de servidores.
- Explicabilidad de decisiones de clasificacion: el mecanismo de escalado permite generar una explicacion en una frase solo para los casos de margen bajo, manteniendo la respuesta tipada original.
- Investigacion sobre arquitecturas S1/S2: el modelo sirve como banco de pruebas para estudiar el trade-off entre clasificacion rapida y generacion condicional en entornos con recursos limitados.

## Benchmarks y rendimiento

Resultados medidos sobre el grafo int4 con ONNX Runtime CPU (x86), en las particiones de test oficiales, usando precision equilibrada de la cabeza de cada tarea:

| Conjunto de test | Precision equilibrada (%) | Azar (%) |
|---|---|---|
| CLINC150 fuera de dominio (n = 2.000) | 86,9 | 50,0 |
| ContractNLI (n = 1.190) | 63,1 | 33,3 |
| SIB-200 ingles (n = 204) | 91,4 | 14,3 |
| SIB-200 portugues (n = 204) | 92,7 | 14,3 |

En navegador (Chrome, WebGPU, Apple M2 Pro) sobre la particion de desarrollo: CLINC150 87,1 % y ContractNLI 66,0 %. El autor indica que la prueba completa en navegador aun no se ha realizado. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el grafo int4 ocupa 1,75 GB de descarga y el repositorio completo 1,8 GB; el consumo en VRAM no se especifica, pero por tamano es compatible con GPUs integradas y consumer.
- GPU recomendadas: el autor valida WebGPU en Apple M2 Pro; no se detallan otras GPU probadas.
- Cabe en GPU consumer: si, dado el tamano int4 del grafo; no se especifican modelos concretos mas alla del M2 Pro.
- Opciones de despliegue: ONNX Runtime GenAI con WebGPU en navegador mediante la libreria s1s2; el adaptador PyTorch LoRA esta disponible por separado para otros entornos.
- Latencia y throughput: no disponibles; el autor solo reporta que la decision se resuelve en una unica pasada forward.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables publicados en la informacion proporcionada para establecer una comparativa con alternativas de la misma categoria. Como referencia estructural, el modelo base SmolLM3-3B (Apache-2.0) es el punto de partida, y el adaptador LoRA original (eduardoworrel/SmolLM3-3B-ContractNLI-CLINC-SIB-LoRA) constituye la variante en PyTorch del mismo especialista. No se conocen otros especialistas multi-tarea con cabezas S1S2 publicados en el mismo formato.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| SmolLM3-3B-ContractNLI-CLINC-SIB-ONNX-genai-int4-S1S2 | 3B | 2.048 (ContractNLI) | CC BY-SA 4.0 | ONNX int4 |
| SmolLM3-3B-ContractNLI-CLINC-SIB-LoRA | 3B | no disponible | no disponible | LoRA (PyTorch) |
| HuggingFaceTB/SmolLM3-3B (base) | 3B | no disponible | Apache-2.0 | safetensors |

## Limitaciones y advertencias

- ContractNLI solo admite NDAs de hasta 2.048 tokens; contratos mas largos quedan truncados o fuera de alcance.
- CLINC150 se ha reformulado como clasificacion binaria dentro/fuera de dominio, no como clasificacion de intenciones completa.
- Las etiquetas de SIB-200 en portugues se proyectan desde el ingles, lo que puede introducir sesgos de traduccion.
- Las cabezas solo funcionan con las palabras de opcion exactas con las que fueron entrenadas; cualquier variacion en la formulacion cambia el prompt leido por la cabeza y degrada el resultado.
- La precision en ContractNLI es moderada (63,1 % de precision equilibrada frente a 33,3 % de azar), insuficiente para uso legal sin revision humana.
- Riesgo de alucinacion en el modo de generacion (Sistema 2): las explicaciones generadas no estan verificadas y pueden no reflejar la decision real de la cabeza.
- La licencia CC BY-SA 4.0 impone obligaciones de atribucion y ShareAlike derivadas de SIB-200; el uso comercial exige cumplir esas condiciones y mantener la atribucion del modelo base (Apache-2.0) y de los datasets (CC BY 4.0 y CC BY 3.0).
- La prueba completa en navegador no se ha realizado; el rendimiento en WebGPU fuera del M2 Pro no esta validado.
- La cabeza de evidencia incluida en `heads/evidence_cnli/` no esta integrada en s1s2 0.1, por lo que no es utilizable a traves de la API principal.
- El modelo solo declara soporte para ingles y portugues; no se ha evaluado su comportamiento en castellano.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eduardoworrel/SmolLM3-3B-ContractNLI-CLINC-SIB-ONNX-genai-int4-S1S2
- Adaptador LoRA y cabezas en PyTorch: https://huggingface.co/eduardoworrel/SmolLM3-3B-ContractNLI-CLINC-SIB-LoRA
- Modelo base SmolLM3-3B: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Libreria s1s2: https://github.com/eduardoworrel/s1s2
- Dataset ContractNLI: https://stanfordnlp.github.io/contract-nli/
- Dataset CLINC150: https://github.com/clinc/oos-eval
- Dataset SIB-200: https://huggingface.co/datasets/Davlan/sib200
- Receta de entrenamiento y cabeza pointer (Kev): https://github.com/jaredpalmer/kev
- Precursor alias3-web: https://huggingface.co/aliasrobotics/alias3-web
- Articulo Browser Immune System: https://arxiv.org/abs/2611.15302
