# oteam/nampnn

## Resumen

NA-MPNN es un modelo de diseño inverso de secuencias (inverse folding) para ensamblajes de proteínas, ADN y ARN. Dado un backbone molecular tridimensional, el modelo genera la secuencia de residuos compatible con esa estructura, restringiendo las identidades posibles al tipo de polímero de cada residuo. Está desarrollado por Andrew Kubaney, David Baker y colaboradores del Baker Laboratory, y esta ficha corresponde a una implementación no oficial publicada por el equipo OFoldX bajo el identificador `oteam/nampnn`.

El modelo resuelve un problema clásico en biología computacional: predecir la secuencia que adopta una geometría dada, extendiéndolo por primera vez de forma conjunta a proteínas y ácidos nucleicos (ADN y ARN) en complejos mixtos. Frente a los modelos de inverse folding puramente proteicos, NA-MPNN incorpora un vocabulario de 72 tokens que cubre aminoácidos y bases nucleotídicas, lo que permite diseñar simultáneamente la parte proteica y la parte nucleica de un ensamblaje.

Arquitectónicamente es una red neuronal de paso de mensajes (MPNN) geométrica y autorregresiva, con un tamaño muy reducido: 2.303.480 parámetros totales, hidden size de 128, 3 bloques de encoder y 3 de decoder. Su relevancia actual radica en que aborda el diseño conjunto proteína-ácido nucleico, una tarea con aplicaciones directas en ingeniería de factores de transcripción, ribonucleoproteínas y terapias basadas en ácidos nucleicos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MPNN geométrica autorregresiva (encoder-decoder), 3 bloques de encoder y 3 de decoder |
| Parámetros totales | 2.303.480 (2,303 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (opera sobre grafos de residuos, no sobre secuencias de texto) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No aplica (modelo biológico, no lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |
| Vocabulario | 72 tokens |
| Hidden size | 128 |
| Vecinos (neighbors) | 32 |
| Slots de átomos por residuo | 16 |
| Librería | ofoldx |
| Pipeline | other |

## Arquitectura y entrenamiento

NA-MPNN representa cada residuo del polímero como un nodo en un grafo geométrico de paso de mensajes, con 32 vecinos por nodo y 16 slots de átomos por residuo. La generación es autorregresiva y está condicionada por el tipo de polímero del residuo, de modo que el modelo solo puede emitir identidades coherentes con la naturaleza química de cada posición (aminoácido, base de ADN o base de ARN). El vocabulario de 72 tokens cubre las clases de aminoácidos y nucleótidos. La arquitectura emplea un encoder de 3 bloques y un decoder de 3 bloques con hidden size de 128, lo que explica su reducido tamaño de 2,3 M de parámetros.

El entrenamiento se basa en recuperación de secuencia condicionada por estructura (structure-conditioned recovery) sobre estructuras del PDB que contienen ácidos nucleicos. El procedimiento incorpora ruido en las coordenadas y decodificación opcional con orden proteína-primero (protein-first decoding). El checkpoint de especificidad proteína-ADN, distribuido por separado, se entrena además con complejos proteína-ADN predichos y perfiles de unión experimentales. La implementación de OFoldX expone `smoothed_loss` para entrenamiento y fine-tuning. Los splits de entrenamiento y evaluación están publicados en el repositorio oficial del Baker Laboratory.

## Capacidades

- Diseño conjunto de secuencias de proteína, ADN y ARN a partir de un backbone molecular en formato CIF.
- Diseño inverso de secuencias restringido por tipo de polímero en ensamblajes mixtos.
- Puntuación de secuencias (sequence scoring) sobre backbones de polímeros mixtos, devolviendo NLL en nats por residuo, tanto global como por secuencia diseñada.
- Predicción de especificidad proteína-ADN mediante el checkpoint `oteam/nampnn-specificity`, que estima probabilidades de base en cada posición nucleotídica seleccionada.
- Soporte de tokens nucleicos compartidos: por defecto las bases de ARN usan las clases de salida de ADN durante la predicción y se reconstruyen como residuos de ARN.
- Control de exclusión de tokens mediante `global_omit_tokens` (por ejemplo, `DNA_T` excluye T y U en modo de tokens compartidos).
- Decodificación con múltiples órdenes y semilla configurable (`num_decoding_orders`, `seed`) para generar candidatos diversos.
- No soporta tool calling, agentes, visión, audio ni capacidades lingüísticas: es un modelo específico de biología estructural.

## Casos de uso

- Diseño de factores de transcripción sintéticos: dado el backbone de un complejo proteína-ADN, el modelo genera secuencias candidatas para la región proteica y la región de unión al ADN, permitiendo explorar variantes que mantengan la geometría de interacción.
- Ingeniería de ribonucleoproteínas: en complejos que combinan proteína y ARN, el modelo diseña de forma conjunta ambas cadenas respetando el tipo de polímero de cada residuo, algo que los modelos de inverse folding exclusivamente proteicos no permiten.
- Optimización de especificidad proteína-ADN: con el checkpoint `nampnn-specificity` se estiman perfiles de probabilidad de base para cada posición, útiles para rediseñar la interfaz y evaluar el riesgo de unión fuera de diana.
- Puntuación y filtrado de diseños: el pipeline `score` calcula la NLL por residuo de secuencias candidatas sobre un backbone, sirviendo como criterio de ranking en pipelines de diseño generativo.
- Rediseño de motivos de unión a ácidos nucleicos en enzimas: para enzimas con cofactores nucleotídicos o dominios de unión a ARN, el modelo propone secuencias compatibles con la geometría del sitio activo.
- Investigación en plegamiento y ensamblaje de complejos mixtos: el modelo sirve como herramienta de análisis para estudiar qué secuencias son compatibles con una interfaz proteína-nucleico dada.
- Generación de candidatos en pipelines de biología sintética: la decodificación con múltiples órdenes y semilla permite generar lotes de candidatos diversos para posterior validación experimental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida; con 2,3 M de parámetros el modelo cabe holgadamente en cualquier GPU consumer, incluso en CPU para inferencia puntual. No se dispone de cifras oficiales de VRAM.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere A100 ni H100. Una RTX 4090 o incluso una GPU integrada resultan adecuadas dado el tamaño del modelo.
- Cabe en GPU consumer: sí, en cualquier GPU consumer actual e incluso en CPU.
- Opciones de despliegue: la librería `ofoldx` (instalable con `pip install ofoldx`) es la vía oficial de uso mediante sus pipelines `design` y `score`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparativas publicadas en la información proporcionada que permitan contrastar NA-MPNN con alternativas como ProteinMPNN, LigandMPNN u otros modelos de inverse folding. La comparativa cuantitativa se marca como no disponible.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| NA-MPNN (`oteam/nampnn`) | 2,303 M | No aplica (grafo) | AGPL-3.0 | Hugging Face + ofoldx |
| Alternativas de inverse folding proteico | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Implementación no oficial: la model card ha sido redactada por el equipo OFoldX, no por los autores del paper; los artefactos pueden diferir de la implementación de referencia del Baker Laboratory.
- Licencia AGPL-3.0: impone obligaciones de copyleft fuerte; el uso comercial en servicios en red requiere revisión legal y, en su caso, liberar el código derivado.
- Modelo de dominio muy específico: no es un modelo de lenguaje; no procesa texto, no soporta tool calling ni agentes, y no debe evaluarse con benchmarks de NLP.
- Dependencia de la librería `ofoldx`: los pesos no son utilizables de forma directa sin esa librería, lo que limita la portabilidad a otros ecosistemas.
- En modo de tokens nucleicos compartidos, los nombres `RNA_` son rechazados en `global_omit_tokens`; debe usarse la nomenclatura `DNA_` para excluir bases, lo que puede inducir a error.
- Riesgo de sobreajuste a las estructuras del PDB empleadas en entrenamiento; no se documentan métricas de generalización fuera de los splits publicados.
- Sin datos de sesgo, alucinación o robustez frente a backbones ruidosos más allá del ruido de coordenadas usado en entrenamiento.
- No se documentan cuantizaciones ni formatos alternativos de pesos, lo que puede dificultar el despliegue en entornos con restricciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oteam/nampnn
- Checkpoint de especificidad: https://huggingface.co/oteam/nampnn-specificity
- Paper (bioRxiv): https://www.biorxiv.org/content/10.1101/2025.10.03.679414v2
- Repositorio oficial: https://github.com/baker-laboratory/NA-MPNN
- Splits de entrenamiento y evaluación: https://github.com/baker-laboratory/NA-MPNN/tree/main/splits
- Código de la implementación OFoldX: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/nampnn
- Documentación de OFoldX: https://ofoldx.valtech.ai/
- Repositorio OFoldX: https://github.com/OTeam-AI4S/OFoldX
- Issues de OFoldX: https://github.com/OTeam-AI4S/OFoldX/issues
- PDB: https://www.rcsb.org/
