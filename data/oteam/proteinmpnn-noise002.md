# oteam/proteinmpnn-noise002

## Resumen

ProteinMPNN es un modelo de diseño inverso de proteínas (*inverse folding*): dada una estructura tridimensional de esqueleto proteico fija, genera secuencias de aminoácidos que probablemente adopten esa conformación. Esta ficha corresponde a la variante `oteam/proteinmpnn-noise002`, una implementación no oficial publicada por el equipo OFoldX dentro de su librería `ofoldx`, con ruido de entrenamiento de 0,02 Å sobre las coordenadas del esqueleto completo (átomos N, CA, C, O).

El modelo original fue desarrollado por Justas Dauparas y colaboradores en el laboratorio de David Baker (Universidad de Washington) y publicado en *Science* en 2022. Se trata de una red neuronal de paso de mensajes (*message-passing neural network*, MPNN) autoregresiva que representa cada residuo como un nodo de un grafo espacial de vecinos más cercanos, codifica la geometría del esqueleto con bloques de codificador y decodifica los residuos en un orden causal muestreado.

Es relevante porque ProteinMPNN se ha convertido en una herramienta de referencia en diseño computacional de proteínas, con un coste computacional muy bajo (1,674 M de parámetros) y resultados sólidos en recuperación de secuencia. Esta variante concreta es útil para pipelines que requieran un modelo de bajo ruido, típicamente cuando la estructura de entrada es de alta calidad experimental o predicha con alta confianza.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de paso de mensajes (MPNN) sobre grafo espacial de residuos, codificador-decodificador autoregresivo |
| Parametros totales | 1.673.592 (1,674 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (opera sobre grafos de hasta 48 vecinos por residuo; el tamaño máximo de proteína no se especifica) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan cuantizaciones GGUF/INT8) |
| Idiomas soportados | No aplica (modelo biológico, no lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ProteinMPNN modela la proteína como un grafo k-NN espacial (48 vecinos por residuo) sobre el que aplica bloques de paso de mensajes. El codificador consta de 3 bloques con tamaño oculto de 128 y el decodificador de otros 3 bloques. La generación es autoregresiva: los residuos se decodifican en un orden causal muestreado, lo que permite condicionar la secuencia a posiciones fijas, identidades ligadas, restricciones de aminoácido por posición y perfiles de secuencia. Esta variante concreta emplea los cuatro átomos de esqueleto (N, CA, C, O) y fue entrenada con perturbación de coordenadas de 0,02 Å, la más baja de la familia, lo que la orienta a esqueletos de alta precisión.

El entrenamiento sigue el procedimiento del repositorio oficial: recuperación autoregresiva de identidad de aminoácido a partir de la geometría del esqueleto, usando ensamblados biológicos del PDB de 2 de agosto de 2021 con cadenas agrupadas al 30 % de identidad de secuencia. La variante soluble (SolubleMPNN) se entrena con foco en proteínas solubles; la variante CA-only reduce la geometría al carbono alfa. No se documenta en la información disponible el número exacto de tokens, la composición detallada del dataset ni si se aplicó RLHF o DPO (no procede en este dominio).

## Capacidades

- Diseño de secuencia condicionado a esqueleto fijo (*inverse folding*) para proteínas.
- Puntuación de secuencias: devuelve verosimilitud negativa (NLL) global y por residuo en nats por residuo.
- Soporte de posiciones fijas y restricciones por posición durante la generación.
- Soporte de identidades ligadas (*tied identities*) entre posiciones.
- Soporte de perfiles de secuencia como sesgo en la decodificación.
- Decodificación en orden causal muestreado, con control de semilla y número de órdenes de decodificación.
- Integración con un empaquetador de cadenas laterales (MPNN Packer) para generar coordenadas de cadenas laterales tras el diseño.
- No soporta tool calling, agentes, visión, audio ni capacidades multilingües: es un modelo específico de biología estructural.

## Casos de uso

- Rediseño de secuencia sobre estructuras cristalográficas de alta resolución: al estar entrenado con ruido de 0,02 Å, es adecuado cuando el esqueleto de entrada proviene de difracción de rayos X o crio-EM con buena resolución, donde pequeñas perturbaciones no deben degradar la recuperación.
- Puntuación de variantes y mutantes: usar el pipeline `score` con `num_decoding_orders=8` para obtener NLL por residuo y detectar posiciones incompatibles con el esqueleto en un cribado de mutaciones.
- Diseño de bibliotecas para expresión heteróloga: combinado con SolubleMPNN o como paso de filtrado, permite generar candidatos y descartar secuencias con baja verosimilitud antes de síntesis.
- Integración en pipelines de diseño generativo de novo: tras un modelo de difusión o de alfa-flujo que genere esqueletos, ProteinMPNN asigna secuencias y el MPNN Packer reconstruye cadenas laterales.
- Fijado de epítopos o sitios activos: las restricciones por posición y las identidades ligadas permiten conservar residuos catalíticos o de unión mientras se rediseña el resto de la superficie.
- Cribado in silico de estabilidad de candidatos: el NLL por residuo sirve como señal barata (1,674 M de parámetros) para priorizar diseños antes de simulaciones de dinámica molecular o predicciones de estructura con AlphaFold.
- Docencia y prototipado en biología computacional: el coste mínimo permite ejecutar el modelo en CPU o en una GPU de consumo para experimentos de laboratorio seco.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con pesos en fp32 (1,674 M de parámetros); holgadamente por debajo de 1 GB en fp16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; A100, H100, RTX 4090, RTX 3090 o incluso GPUs integradas son suficientes. El cuello de botella es el grafo k-NN y el número de decodificaciones, no la memoria.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU para proteínas de tamaño moderado.
- Opciones de despliegue: librería `ofoldx` (pip install ofoldx) con pipelines `design` y `score`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este dominio).
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependen del número de residuos, del número de decodificaciones y del empaquetado posterior.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / vecinos | Backbone | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| proteinmpnn-noise002 (esta ficha) | 1,674 M | 48 vecinos | N, CA, C, O | AGPL-3.0 | Hugging Face (oteam) |
| proteinmpnn-noise010 | 1,674 M | 48 vecinos | N, CA, C, O | AGPL-3.0 | Hugging Face (oteam) |
| solublempnn-noise002 | 1,674 M | 48 vecinos | N, CA, C, O | AGPL-3.0 | Hugging Face (oteam) |
| proteinmpnn-ca-only-noise002 | 1,642 M | 48 vecinos | CA | AGPL-3.0 | Hugging Face (oteam) |

La diferencia entre variantes es el nivel de ruido de entrenamiento (0,02, 0,10, 0,20 o 0,30 Å) y el conjunto de átomos de esqueleto. Las variantes con mayor ruido son más tolerantes a esqueletos imprecisos (por ejemplo, predichos por modelos generativos), mientras que `noise002` prioriza precisión cuando la estructura de entrada es fiable. No se dispone de comparación numérica de rendimiento entre variantes en la información proporcionada.

## Limitaciones y advertencias

- Implementación no oficial: la model card la firma el equipo OFoldX, no los autores originales; los pesos pueden diferir del checkpoint oficial de `dauparas/ProteinMPNN`.
- Licencia AGPL-3.0: impone obligaciones de copyleft sobre el código que la integre en un servicio en red; revisar compatibilidad antes de uso comercial o en productos propietarios.
- Sesgo de dominio: entrenado con ensamblados biológicos del PDB de 2021 agrupados al 30 % de identidad; puede rendir peor en proteínas de membranas, péptidos cortos, proteínas intrínsecamente desordenadas o diseños alejados de la distribución del PDB.
- Dependencia de la calidad del esqueleto: la variante `noise002` asume coordenadas precisas; con esqueletos ruidosos o generados, conviene usar variantes de mayor ruido.
- Riesgo de secuencias no funcionales: el modelo optimiza recuperación de secuencia, no estabilidad, solubilidad ni función; requiere validación experimental.
- Dependencia de la librería `ofoldx`: no hay pesos GGUF ni integración estándar con transformers; el uso requiere el ecosistema del autor.
- Ausencia de benchmarks publicados para esta variante concreta en la información disponible; no se pueden comparar cifras de recuperación de secuencia.
- Sin soporte multilingüe ni de texto: no es un modelo de lenguaje y no debe evaluarse con métricas de NLP.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oteam/proteinmpnn
- Esta variante: https://huggingface.co/oteam/proteinmpnn-noise002
- Variante noise010: https://huggingface.co/oteam/proteinmpnn-noise010
- Variante noise020: https://huggingface.co/oteam/proteinmpnn-noise020
- Variante noise030: https://huggingface.co/oteam/proteinmpnn-noise030
- SolubleMPNN: https://huggingface.co/oteam/solublempnn
- CA-only: https://huggingface.co/oteam/proteinmpnn-ca-only
- Checkpoint del ejemplo de entrenamiento: https://huggingface.co/oteam/proteinmpnn-training-example
- Paper original: https://doi.org/10.1126/science.add2187
- Repositorio oficial: https://github.com/dauparas/ProteinMPNN
- Guía de entrenamiento oficial: https://github.com/dauparas/ProteinMPNN/blob/main/training/README.md
- Código OFoldX (proteinmpnn): https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/proteinmpnn
- MPNN Packer: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/models/mpnn_packer/README.md
- Guía de pipelines: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/pipelines/README.md
- Documentación de ofoldx: https://ofoldx.valtech.ai/
