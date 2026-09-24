# DKNTZMN/jepa-cot-3d-double-sparse-axial-moe

## Resumen

JEPA-CoT 3D Double-Sparse Axial MoE es un checkpoint experimental publicado por el usuario DKNTZMN en HuggingFace, descrito por su autor como el MVP funcional de una arquitectura de world model denominada "JEPA-CoT con MoE axial 3D de doble dispersión". No es un modelo de lenguaje generativo, sino un modelo predictivo de representaciones (JEPA, Joint Embedding Predictive Architecture) orientado a la predicción de trayectorias de agentes en entornos 3D, con una cabeza de razonamiento latente en cuatro tokens (CoT). El checkpoint es un esqueleto ejecutable (d=128, 4 capas, 8 cabezas) pensado para reproducir el experimento en CPU, no un modelo listo para producción.

La propuesta técnica combina tres piezas: una memoria asociativa tipo Engram heredada del paper DeepSeek Engram (arXiv:2601.07372), un mecanismo de atención axial con eje Z causal (tiempo) y ejes espaciales, y una capa MoE ultra-dispersa con experto compartido ("spinal"). Sobre el Engram original el autor añade una segunda dimensión de dispersión: cada uno de los cuatro bancos diagonales incorpora una cadena de parámetros 1-D sobre la que se interpola la memoria recuperada.

Su relevancia es exclusivamente investigadora: se trata de una prueba de concepto que compara el bloque 3D disperso contra un transformer denso 2D de anchura y profundidad equivalentes (d=128, 4 capas) bajo el protocolo de predicción de nuScenes, mostrando una mejora sustancial en error de desplazamiento (ADE/FDE) a costa de un mayor número de parámetros totales. El repositorio no reporta licencia, idiomas, cuantizaciones ni formato de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | JEPA-CoT con MoE axial 3D de doble dispersión y memoria Engram |
| Parametros totales | 4,13 M (checkpoint MVP; d=128, 4 capas) |
| Parametros activos | 1,69 M (dispersión del 59 %) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de representación cinemática, no de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible |

Otros datos relevantes del checkpoint: N de Engram en {2, 3}, K = 8 cabezas, tablas primas, hash multiply-XOR multi-cabeza, RMSNorm context gate con estabilizador abs-sqrt, convolución corta k=4 con dilatación = max N, inyección temprana y media. Cuatro bancos diagonales con cadena de parámetros 1-D. Entrada de vector en tiempo real de 8-D (cinemática / agente). Escala del diagrama: 768 / 1300-D; d_mem = 1280 en el paper Engram.

## Arquitectura y entrenamiento

El modelo se estructura en cuatro bloques descritos en la propia model card: geometría base (cubo perfecto con origen (0,0,0) y cuatro diagonales de cuerpo en `(1,1,1)`, `(1,1,-1)`, `(1,-1,1)`, `(-1,1,1)`), Engram prefrontal superior de doble dispersión (`src/engram_3d.py`), bloque axial con eje vertical causal Z/tiempo, SwiGLU central y cross-attention (`src/axial.py`), y MoE inferior ultra-disperso con experto compartido espinal (`src/moe_3d.py`). La componente JEPA-CoT combina un futuro latente con cuatro tokens de razonamiento, y consume vectores cinemáticos de 8 dimensiones como entrada.

El Engram se mantiene "tal cual" respecto al diseño del paper DeepSeek Engram: N en {2,3}, K = 8 cabezas, tablas primas, hash multiply-XOR multi-cabeza, cuantización de vocabulario analógica, context gate RMSNorm con estabilizador abs-sqrt oficial, convolución corta k=4 con dilatación = max N e inyección temprana y media. La aportación 3D consiste en que cada uno de los cuatro bancos diagonales incorpora además una cadena de parámetros 1-D, sobre la que se interpola la memoria recuperada; esa interpolación constituye el segundo eje de dispersión. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset más allá del protocolo nuScenes de evaluación, ni si se emplearon etapas de RLHF o DPO (poco probables en un modelo de predicción cinemática de este tamaño).

## Capacidades

- Predicción de trayectorias de agentes en espacio 3D bajo el protocolo nuScenes (2 s de historial, 6 s de futuro, 2 Hz, 6 agentes).
- Modelado de mundo latente mediante JEPA: predicción de representaciones futuras en lugar de reconstrucción de píxeles o tokens.
- Razonamiento latente en cadena (CoT) condensado en cuatro tokens internos.
- Memoria asociativa de tipo Engram con doble dispersión axial.
- Entrada de cinemática de 8 dimensiones (agente / vector en tiempo real).
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente y multi-step reasoning explícitas: no disponible más allá del CoT latente.
- Capacidades multilingües: no disponible (no procesa lenguaje natural).
- Capacidades multimodales (visión, audio): no disponibles.

## Casos de uso

- Investigación en world models: reproducción y ablación del bloque MoE axial 3D frente a un transformer denso 2D bajo protocolo nuScenes, con métricas ADE/FDE comparables.
- Predicción de trayectorias en conducción autónoma: el modelo consume 8-D de cinemática por agente y genera hasta 6 s de futuro a 2 Hz, útil como módulo de forecasting en pipelines de planificación.
- Simulación de entornos multiagente: con 6 agentes y ventana de historial de 2 s, puede emplearse para generar futuros plausibles en escenarios de tráfico sintético.
- Estudio de dispersión en MoE: sirve como banco de pruebas para medir el impacto de la doble dispersión (bancos diagonales + cadena 1-D) sobre el coste activo frente a la calidad predictiva.
- Prototipado de memoria asociativa Engram: validación de mecanismos hash multiply-XOR y context gate RMSNorm en tareas cinemáticas de baja dimensión.
- Educación y docencia: al ejecutarse en CPU con 4,13 M de parámetros, es apto para demostraciones reproducibles de arquitecturas JEPA sin acceso a GPU.
- Investigación en razonamiento latente: análisis del efecto de los cuatro tokens CoT sobre el error de predicción a corto y medio plazo.

## Benchmarks y rendimiento

Unicos resultados publicados en la model card (protocolo nuScenes: 2 s de historial, 6 s de futuro, 2 Hz, 6 agentes, 1024 escenas cinemáticas, evaluación en CPU con d=128 y 4 capas):

| Modelo | Parametros totales | Parametros activos | Dispersion | Val ADE | Val FDE |
|---|---:|---:|---:|---:|---:|
| 3D Axial MoE + Engram | 4,13 M | 1,69 M | 59 % | 7,18 m | 13,72 m |
| 2D Dense Transformer | 1,10 M | 1,10 M | 0 % | 15,51 m | 32,99 m |

Advertencias del propio autor: la comparación no es isoparamétrica (los bancos de expertos inflan el tamaño total), los parámetros activos sí están más próximos, y la escala del diagrama es 768 / 1300-D mientras que el d_mem del Engram del paper es 1280. Este checkpoint es el esqueleto ejecutable, no la configuración final. No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks de lenguaje, dado que el modelo no es un LLM.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, 4,13 M de parámetros ocupan aproximadamente 16,5 MB; en fp16, unos 8,3 MB; en int8, unos 4,1 MB. Cálculo derivado del recuento de parámetros, no reportado por el autor.
- GPU recomendadas: ninguna en particular; el experimento del repositorio se ejecuta en CPU.
- Compatibilidad con GPU de consumo: cabe holgadamente en cualquier GPU de consumo (RTX 4090, RTX 3060, e incluso en memoria unificada de dispositivos móviles) e igualmente en CPU.
- Opciones de despliegue: código PyTorch del propio repositorio (`src/geometry.py`, `src/engram_3d.py`, `src/axial.py`, `src/moe_3d.py`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JEPA-CoT 3D Double-Sparse Axial MoE | 4,13 M totales / 1,69 M activos | no disponible | Prediccion de trayectorias (nuScenes) | no disponible | HuggingFace (0 descargas) |
| V-JEPA 2 (Meta) | no disponible en la informacion | no disponible | World model self-supervised sobre video | no disponible en la informacion | GitHub facebookresearch/vjepa2 |
| V-JEPA 2-AC (Meta) | no disponible en la informacion | no disponible | World model condicionado por accion para manipulacion robotica | no disponible en la informacion | GitHub facebookresearch/vjepa2 |

La comparación directa es limitada: V-JEPA 2 y V-JEPA 2-AC operan sobre video a escala de internet con datos de trayectorias roboticas, mientras que este MVP opera sobre vectores cinematicos de 8-D y un presupuesto de parametros tres ordenes de magnitud menor. No se dispone de parametros, contexto ni licencia de V-JEPA 2 en la informacion proporcionada.

## Limitaciones y advertencias

- Es un MVP y un esqueleto ejecutable, no un modelo entrenado a escala ni validado en produccion.
- La licencia no esta declarada, por lo que no puede asumirse uso comercial sin consultar al autor.
- La comparacion con el transformer denso 2D no es isoparametrica: el modelo 3D tiene casi 4 veces mas parametros totales (4,13 M frente a 1,10 M), aunque los activos estan mas proximos (1,69 M frente a 1,10 M).
- El checkpoint no incluye informacion sobre idiomas, cuantizacion ni formato de pesos, lo que dificulta su integracion en pipelines estandar.
- Sesgos conocidos: no disponibles; al entrenarse sobre el protocolo nuScenes, cualquier sesgo del dataset subyacente se heredaria.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero si existe riesgo de predicciones cinematicas fisicamente implausibles fuera de la distribucion de entrenamiento.
- Limitaciones de contexto: la ventana de contexto no esta documentada; el protocolo evaluado usa 2 s de historial, lo que limita la planificacion a largo plazo.
- No se documentan pesos preentrenados de produccion, tan solo el esqueleto del repositorio.
- Cualquier uso en conduccion real requeriria validacion adicional, dado que el modelo solo ha sido evaluado con la metrica ADE/FDE sobre 1024 escenas cinematicas.

## Enlaces

- HuggingFace: https://huggingface.co/DKNTZMN/jepa-cot-3d-double-sparse-axial-moe
- Paper de referencia (DeepSeek Engram): https://arxiv.org/abs/2601.07372
- V-JEPA 2 (Meta, repositorio): https://github.com/facebookresearch/vjepa2
- V-JEPA 2 (paper): https://arxiv.org/abs/2506.09985
- Awesome JEPA (recursos): https://github.com/AbdelStark/awesome-jepa
- Awesome JEPA (web): https://abdelstark.github.io/awesome-jepa/
