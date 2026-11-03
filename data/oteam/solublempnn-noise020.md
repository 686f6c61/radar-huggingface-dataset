# oteam/solublempnn-noise020

## Resumen

SolubleMPNN-noise020 es una implementación no oficial del modelo ProteinMPNN orientada al diseño de secuencias de proteínas sobre una estructura tridimensional fija (inverse folding). Lo desarrolla el equipo OFoldX (OTeam-AI4S) a partir del trabajo original de Justas Dauparas y colaboradores publicado en Science en 2022. El modelo resuelve el problema inverso al plegamiento: dada una geometría de esqueleto proteico, genera secuencias de aminoácidos compatibles con ella y puntúa la verosimilitud de secuencias existentes.

La variante "soluble" está entrenada con un sesgo hacia proteínas solubles y, en este caso concreto, con un ruido de coordenadas de 0,20 Å durante el entrenamiento, lo que introduce robustez frente a imprecisiones en las estructuras de entrada. Se trata de un modelo compacto, de aproximadamente 1,67 millones de parámetros, con arquitectura de red neuronal de paso de mensajes (message-passing neural network) sobre un grafo de vecinos espaciales, con 3 bloques de encoder y 3 de decoder y un tamaño oculto de 128.

Es relevante para flujos de diseño computacional de proteínas, especialmente en pipelines de diseño de novo y en el rediseño de superficies para mejorar la solubilidad, donde el modelo original se ha consolidado como referencia. Esta ficha cubre la variante concreta `solublempnn-noise020`, publicada bajo licencia AGPL-3.0 y distribuida en formato safetensors a través de la librería `ofoldx`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de paso de mensajes (message-passing neural network) autorregresiva sobre grafo de vecinos espaciales; 3 bloques de encoder y 3 de decoder, tamaño oculto 128, 48 vecinos |
| Parametros totales | 1.673.592 (1,674 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no es un modelo de contexto textual; opera sobre grafos de residuos de tamaño variable) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo biológico, no lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo representa cada residuo como un nodo de un grafo de vecinos espaciales más cercanos (48 vecinos) y codifica la geometría del esqueleto mediante bloques de message-passing. La variante soluble emplea los átomos de esqueleto N, CA, C y O como entrada y decodifica los residuos en un orden causal muestreado, lo que permite generar secuencias de forma autorregresiva. La arquitectura es idéntica a la del ProteinMPNN estándar (128 de dimensión oculta, 3+3 bloques), pero el entrenamiento se sesga hacia proteínas solubles.

El entrenamiento sigue el esquema de recuperación autorregresiva de identidades de aminoácidos a partir de la geometría del esqueleto, con perturbaciones de coordenadas para aumentar la robustez. En esta variante el ruido de entrenamiento es de 0,20 Å. El ejemplo de entrenamiento oficial utiliza ensamblados biológicos del PDB de 2 de agosto de 2021, con cadenas proteicas agrupadas al 30 % de identidad de secuencia. No se detalla en la información disponible el número exacto de tokens, la composición completa del dataset ni si hubo etapas de RLHF o DPO (no aplicables habitualmente en este tipo de modelo).

## Capacidades

- Diseño de secuencias de proteínas condicionado a un esqueleto fijo (inverse folding).
- Puntuación de secuencias: cálculo de log-verosimilitud negativa (NLL) global y por residuo en nats por residuo.
- Generación autorregresiva con orden causal muestreado y soporte para múltiples órdenes de decodificación.
- Restricciones de diseño: posiciones fijas, identidades ligadas (tied identities), restricciones de aminoácidos específicas por posición y perfiles de secuencia.
- Sesgo hacia solubilidad gracias al entrenamiento específico en proteínas solubles.
- Robustez frente a ruido en las coordenadas de entrada (ruido de entrenamiento de 0,20 Å).
- Integración con pipelines de diseño y empaquetado de cadenas laterales (MPNN Packer) para generar coordenadas de cadenas laterales tras el diseño.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües; su dominio es exclusivamente biológico-estructural.

## Casos de uso

- Rediseño de superficies para mejorar la solubilidad: dado un esqueleto de proteína de interés, el modelo genera secuencias alternativas con mayor propensión a la solubilidad, aprovechando el sesgo de entrenamiento de la variante soluble.
- Diseño de novo de proteínas: en pipelines que parten de esqueletos generados por modelos de difusión o de diseño estructural, SolubleMPNN-noise020 produce secuencias candidatas compatibles con la geometría.
- Puntuación y filtrado de secuencias en cribados masivos: el pipeline de scoring devuelve NLL por residuo, lo que permite descartar secuencias mal ajustadas al esqueleto antes de validación experimental.
- Estabilización de proteínas terapéuticas: rediseño de regiones expuestas para reducir agregación y mejorar la expresión soluble, manteniendo el núcleo estructural.
- Diseño con restricciones funcionales: fijación de posiciones catalíticas o de unión y generación del resto de la secuencia respetando perfiles de aminoácidos.
- Empaquetado de cadenas laterales: combinación con el MPNN Packer del ecosistema OFoldX para obtener coordenadas completas tras el diseño de secuencia.
- Docencia e investigación en biología computacional: modelo ligero (1,67 M de parámetros) que puede ejecutarse en CPU o GPU de gama baja para experimentos de inverse folding.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 1,67 M de parámetros, el modelo cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; no se requiere A100 ni H100. Una RTX 3060 o superior es más que suficiente.
- Cabe en GPU consumer: sí, en cualquier modelo actual (GTX 1650, RTX 3050, RTX 4090, etc.).
- Opciones de despliegue: la librería `ofoldx` (pip install ofoldx) es la vía documentada; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SolubleMPNN-noise020 (este) | 1,674 M | Grafo de esqueleto N, CA, C, O; 48 vecinos | Inverse folding con sesgo a solubilidad, ruido 0,20 Å | AGPL-3.0 | HuggingFace (oteam) |
| ProteinMPNN-noise020 | 1,674 M | Grafo de esqueleto N, CA, C, O; 48 vecinos | Inverse folding estándar, ruido 0,20 Å | AGPL-3.0 | HuggingFace (oteam) |
| CA-only-noise020 | 1,642 M | Solo átomo CA; 48 vecinos | Inverse folding con geometría reducida | AGPL-3.0 | HuggingFace (oteam) |
| ProteinMPNN original (dauparas) | ~1,7 M | Esqueleto completo | Implementación oficial de referencia | MIT (según repositorio original; verificar) | GitHub dauparas/ProteinMPNN |

La comparación directa con modelos de lenguaje no procede: se trata de un modelo especializado en biología estructural, no de un LLM. Las alternativas naturales son las otras variantes del mismo ecosistema OFoldX y la implementación oficial de ProteinMPNN.

## Limitaciones y advertencias

- Implementación no oficial: la model card ha sido redactada por el equipo OFoldX, no por los autores originales de ProteinMPNN; conviene validar el comportamiento frente a la implementación de referencia.
- Licencia AGPL-3.0: el uso en productos o servicios en red puede obligar a liberar el código fuente derivado; revisar implicaciones antes de uso comercial.
- Sesgo hacia proteínas solubles: la variante soluble puede producir secuencias poco adecuadas para proteínas de membrana o entornos no solubles.
- Riesgo de secuencias no plegables: como todo modelo de inverse folding, las secuencias generadas requieren validación estructural y experimental; la NLL baja no garantiza plegamiento ni función.
- Dependencia de la calidad del esqueleto: aunque el ruido de entrenamiento de 0,20 Å aporta robustez, esqueletos muy imprecisos o incompletos pueden degradar el diseño.
- Sin benchmarks publicados en la información disponible: no hay métricas de recuperación de secuencia ni comparativas cuantitativas para esta variante concreta.
- Idiomas: no aplica; el modelo no procesa texto.
- Fecha de creación futura en los metadatos (2026-11-03): verificar la vigencia y posibles actualizaciones del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oteam/solublempnn-noise020
- Variante soluble base: https://huggingface.co/oteam/solublempnn
- Variante soluble ruido 0,02 Å: https://huggingface.co/oteam/solublempnn-noise002
- Variante soluble ruido 0,10 Å: https://huggingface.co/oteam/solublempnn-noise010
- Variante soluble ruido 0,30 Å: https://huggingface.co/oteam/solublempnn-noise030
- ProteinMPNN estándar: https://huggingface.co/oteam/proteinmpnn
- Variante CA-only: https://huggingface.co/oteam/proteinmpnn-ca-only
- Ejemplo de entrenamiento: https://huggingface.co/oteam/proteinmpnn-training-example
- Repositorio OFoldX: https://github.com/OTeam-AI4S/OFoldX
- Código del modelo en OFoldX: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/proteinmpnn
- MPNN Packer: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/models/mpnn_packer/README.md
- Guía de pipelines: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/pipelines/README.md
- Paper original: https://doi.org/10.1126/science.add2187
- Repositorio oficial ProteinMPNN: https://github.com/dauparas/ProteinMPNN
- Documentación de ofoldx: https://ofoldx.valtech.ai/
