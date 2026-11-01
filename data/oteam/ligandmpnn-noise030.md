# oteam/ligandmpnn-noise030

## Resumen

LigandMPNN (variante noise030) es un modelo de diseño inverso de secuencias proteicas condicionado por la geometría del esqueleto proteico y por el contexto atómico no proteico circundante: ligandos, ácidos nucleicos, metales y otras entidades químicas. El modelo original fue desarrollado por Justas Dauparas, Gyu Rie Lee, Robert Pecoraro, Linna An, Ivan Anishchenko, Cameron Glasscock y David Baker, y publicado en *Nature Methods* en 2025. Esta ficha corresponde a una implementación no oficial distribuida por el equipo OFoldX (usuario `oteam`) bajo la librería `ofoldx`.

Se trata de una red neuronal de paso de mensajes (message-passing neural network) autorregresiva de 2.631.800 parámetros (2,632 M), con un tamaño oculto de 128 y una arquitectura de 3 bloques de encoder, 2 bloques de contexto atómico, 2 bloques de contexto y 3 bloques de decoder. El modelo emplea 32 vecinos y 25 átomos de contexto por residuo, lo que le permite razonar localmente sobre el entorno químico de cada posición de la cadena.

La variante `noise030` se distingue por haberse entrenado con un nivel de ruido de coordenadas de 0,30 Å, el más alto de la familia de checkpoints publicados (0,05, 0,10, 0,20 y 0,30 Å). Este ruido actúa como regularización para aumentar la robustez frente a imprecisiones en las estructuras de entrada, algo relevante cuando los modelos predictivos de estructura introducen desviaciones. El modelo es relevante para flujos de diseño de proteínas de novo, optimización de interfaces de unión y scoring de secuencias en entornos con ligandos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de paso de mensajes (message-passing) autorregresiva con contexto atómico; encoder de 3 bloques, 2 bloques de contexto atómico, 2 bloques de contexto y 3 bloques de decoder; tamaño oculto 128 |
| Parametros totales | 2.631.800 (2,632 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo por residuo; 32 vecinos y 25 átomos de contexto por posición) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo biológico, no lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

LigandMPNN es una red neuronal de paso de mensajes sobre grafos de residuos y átomos, no un transformer de lenguaje. El modelo codifica el esqueleto proteico junto con átomos no proteicos cercanos (ligandos, ácidos nucleicos, metales) y genera la secuencia de forma autorregresiva, prediciendo un residuo tras otro condicionado por el entorno atómico local. La configuración concreta de esta variante incluye un tamaño oculto de 128, 3 bloques de encoder, 2 bloques de contexto atómico, 2 bloques de contexto y 3 bloques de decoder, con 32 vecinos y 25 átomos de contexto por residuo.

El entrenamiento se basa en recuperación de secuencia (sequence recovery) a partir de la geometría del esqueleto y del contexto atómico no proteico. Los checkpoints publicados comparten arquitectura y se diferencian únicamente por el nivel de ruido de coordenadas aplicado durante el entrenamiento (0,05, 0,10, 0,20 y 0,30 Å). Esta variante, `noise030`, emplea 0,30 Å de ruido, lo que la orienta a escenarios con estructuras de entrada más imprecisas. La model card no detalla el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; OFoldX expone una ruta `forward` diferenciable con teacher forcing para entrenamiento y fine-tuning, pero la orquestación completa del entrenamiento queda fuera del artefacto distribuido.

## Capacidades

- Diseño inverso de secuencias proteicas (inverse folding) condicionado por esqueleto y contexto atómico no proteico.
- Modelado explícito de ligandos, ácidos nucleicos, metales y otras entidades no proteicas en interfaces y sitios de unión.
- Scoring de secuencias: cálculo de NLL (negative log-likelihood) global y por residuo en nats por residuo.
- Generación autorregresiva con múltiples órdenes de decodificación (`num_decoding_orders`) para muestrear candidatos diversos.
- Integración con un MPNN Packer independiente para generar coordenadas de cadenas laterales tras el diseño de secuencia (pipeline `LigandMpnnDesignAndPackPipeline`).
- Ejecución por etapas mediante `prepare`, `forward` y `postprocess` en los pipelines de OFoldX.
- No soporta tool calling, function calling, agentes, visión, audio ni capacidades multilingües: es un modelo biológico especializado, no un LLM.

## Casos de uso

- Diseño de sitios de unión a ligandos: el modelo genera secuencias que acomodan átomos de ligando en el bolsillo, usando los 25 átomos de contexto por residuo para condicionar la identidad aminoacídica en la interfaz.
- Rediseño de interfaces proteína-proteína y proteína-ácido nucleico: al incorporar contexto atómico no proteico, permite proponer mutaciones que estabilicen contactos específicos.
- Scoring de variantes en entornos con cofactores: el pipeline `score` calcula NLL por residuo, útil para priorizar mutaciones en enzimas metalodependientes o con ligandos unidos.
- Robustez frente a estructuras imprecisas: la variante `noise030` está entrenada con 0,30 Å de ruido, por lo que es adecuada cuando las estructuras provienen de predicciones computacionales con desviaciones moderadas.
- Diseño y empaquetado combinado: encadenar el diseñador con el MPNN Packer permite obtener secuencia y coordenadas de cadenas laterales en un flujo único, útil para generar candidatos listos para evaluación.
- Generación de librerías de candidatos: el muestreo con múltiples órdenes de decodificación y semilla permite producir conjuntos diversos de secuencias para cribado experimental.
- Fine-tuning sobre datasets propios: la ruta `forward` diferenciable con teacher forcing permite adaptar el modelo a familias proteicas o tipos de ligando específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 2,632 M de parámetros, el modelo es de tamaño muy reducido y cabe holgadamente en cualquier GPU consumer, aunque la memoria real depende del tamaño del complejo de entrada y del número de vecinos/átomos de contexto.
- GPU recomendadas: no disponible de forma explícita; por tamaño, cualquier GPU con soporte CUDA (incluidas RTX 3060 en adelante) debería ser suficiente. Para lotes grandes de estructuras conviene una GPU con más memoria (A100, H100, RTX 4090).
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU consumer moderna; no se especifican requisitos mínimos.
- Opciones de despliegue: librería `ofoldx` (pip install ofoldx); pipelines `design`, `score` y `LigandMpnnDesignAndPackPipeline`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto atómico | Ruido de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| oteam/ligandmpnn-noise030 | 2,632 M | Sí (25 átomos, 32 vecinos) | 0,30 Å | AGPL-3.0 | HuggingFace (oteam) |
| oteam/ligandmpnn-noise005 | 2,632 M | Sí | 0,05 Å | AGPL-3.0 | HuggingFace (oteam) |
| oteam/ligandmpnn-noise010 (alias oteam/ligandmpnn) | 2,632 M | Sí | 0,10 Å | AGPL-3.0 | HuggingFace (oteam) |
| oteam/ligandmpnn-noise020 | 2,632 M | Sí | 0,20 Å | AGPL-3.0 | HuggingFace (oteam) |

Las cuatro variantes comparten arquitectura y número de parámetros; la única diferencia documentada es el nivel de ruido de coordenadas en entrenamiento. No se dispone de datos de benchmarks comparativos entre variantes ni frente a otros modelos de inverse folding en la información proporcionada.

## Limitaciones y advertencias

- Implementación no oficial: la model card indica explícitamente que el equipo de LigandMPNN no la escribió; para producción conviene contrastar con el repositorio oficial `dauparas/LigandMPNN`.
- Licencia AGPL-3.0: impone obligaciones de copyleft sobre obras derivadas y su distribución en red; revisar compatibilidad antes de uso comercial o integración en servicios.
- Riesgo de sobreajuste al contexto de entrenamiento: al condicionar sobre átomos no proteicos, el rendimiento puede degradarse en tipos de ligando o metales poco representados.
- Dependencia de la calidad estructural: aunque `noise030` está entrenada con mayor ruido, estructuras con errores graves o coordenadas ausentes pueden producir secuencias no viables.
- Sin datos de sesgo ni de alucinación en el sentido lingüístico; el riesgo principal es la generación de secuencias que no plieguen o no funcionen, que requiere validación experimental.
- Idiomas no aplicables; no es un modelo de lenguaje.
- No se documentan límites de longitud de secuencia ni de número de átomos de contexto más allá de los 32 vecinos y 25 átomos por residuo.
- La model card no detalla el dataset de entrenamiento, por lo que no es posible evaluar cobertura taxonómica ni química.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oteam/ligandmpnn-noise030
- Variante noise005: https://huggingface.co/oteam/ligandmpnn-noise005
- Variante noise010: https://huggingface.co/oteam/ligandmpnn-noise010
- Alias de noise010: https://huggingface.co/oteam/ligandmpnn
- Variante noise020: https://huggingface.co/oteam/ligandmpnn-noise020
- Paper: https://doi.org/10.1038/s41592-025-02626-1
- Repositorio oficial: https://github.com/dauparas/LigandMPNN
- Código OFoldX (LigandMPNN): https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/ligandmpnn
- MPNN Packer: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/models/mpnn_packer/README.md
- Guía de pipelines: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/pipelines/README.md
- Proyecto OFoldX: https://ofoldx.valtech.ai/
- Issues de OFoldX: https://github.com/OTeam-AI4S/OFoldX/issues
