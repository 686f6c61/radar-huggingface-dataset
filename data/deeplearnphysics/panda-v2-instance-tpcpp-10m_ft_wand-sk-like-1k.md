# DeepLearnPhysics/panda-v2-instance.tpcpp-10m_ft_wand-sk-like-1k

## Resumen

panda-v2-instance.tpcpp-10m_ft_wand-sk-like-1k es un modelo de segmentación de instancias para física de partículas desarrollado por DeepLearnPhysics. Se construye sobre el detector Panda V2 (`panda-detector-v2m1`), cuyo codificador `panda-v2.tpcpp-10m` fue preentrenado en el conjunto TPCpp-10M, un corpus de eventos de cámaras de proyección temporal (TPC). El modelo resultante adapta ese codificador mediante LoRA de rango 16 y reentrena la cabeza de segmentación sobre 1.000 eventos etiquetados del conjunto WAND SK-like.

El modelo resuelve la tarea de identificar y separar instancias individuales (trazas de partículas) dentro de nubes de puntos 3D generadas por detectores TPC. Es relevante para la comunidad de física experimental porque demuestra la transferibilidad de un codificador preentrenado en un dominio amplio (TPCpp-10M) hacia un detector concreto con muy pocas muestras etiquetadas (1.000 eventos), un escenario habitual en experimentos donde el etiquetado es costoso.

Con 60.122.830 parámetros totales y un tamaño de repositorio de 0,2 GB, es un modelo compacto orientado a inferencia sobre GPU. Los pesos publicados corresponden al mejor checkpoint de validación del run `panda-v2-wand-n1000-from-sphenix`, evaluado sobre la partición de test del artículo asociado. No es un modelo de lenguaje: es un modelo de visión 3D especializado en point clouds de física de partículas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector Panda V2 (segmentacion de instancias sobre point cloud), codificador `panda-v2.tpcpp-10m` con adaptadores LoRA de rango 16 |
| Parametros totales | 60.122.830 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de point cloud, no de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de fisica de particulas, sin capacidades linguisticas) |
| Licencia | No disponible |
| Formato de pesos | safetensors (libreria `pimm`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura del detector Panda V2, un sistema de segmentacion de instancias disenado para nubes de puntos generadas por TPC en experimentos de fisica de particulas. El codificador base `panda-v2.tpcpp-10m` se preentreno sobre TPCpp-10M, un corpus de 10 millones de eventos de TPC, lo que proporciona una representacion generica de trazas de particulas antes del ajuste fino. Sobre ese codificador se aplican adaptadores LoRA de rango 16 y se reentrena la cabeza de segmentacion, de modo que solo una fraccion reducida de parametros se especializa en el nuevo dominio.

El ajuste fino se realizo sobre 1.000 eventos etiquetados del conjunto WAND SK-like. Los pesos publicados corresponden al mejor checkpoint de validacion del run `panda-v2-wand-n1000-from-sphenix` y son los que se evaluan en la particion de test del articulo. La estrategia combina preentrenamiento a gran escala, adaptacion de bajo rango y un ajuste supervisado con pocas muestras, lo que reduce el coste de anotacion frente a entrenar desde cero. No se especifican en la informacion disponible el numero exacto de tokens ni la composicion detallada del dataset de ajuste, ni si se emplearon tecnicas de RLHF o DPO (no aplicables a este tipo de modelo).

## Capacidades

- Segmentacion de instancias en nubes de puntos 3D de eventos de TPC: identifica y separa trazas de particulas individuales.
- Transferencia desde un codificador preentrenado en TPCpp-10M a un detector concreto (WAND SK-like) con solo 1.000 eventos etiquetados.
- Adaptacion de bajo rango (LoRA rango 16) sobre el codificador, lo que permite reutilizar el backbone preentrenado.
- Inferencia sobre GPU mediante la libreria `pimm`, con soporte de FlashAttention y fallback a backend `torch` en GPUs sin FlashAttention.
- Integracion con las transformaciones de evaluacion del repositorio `particle-imaging-models` (`configs/panda/v2/finetune/_base_/datasets/wc.py`).
- No dispone de generacion de texto, razonamiento linguistico, codigo, matematicas, vision 2D general, tool calling ni capacidades de agente.

## Casos de uso

- Reconstruccion de trazas en detectores TPC: el modelo segmenta instancias de particulas en nubes de puntos de eventos reales o simulados, lo que permite separar trazas solapadas antes del analisis cinematico.
- Etiquetado asistido de nuevos eventos: al ser un modelo afinado con pocas muestras, puede emplearse para preanotar eventos de WAND SK-like y reducir el esfuerzo humano en la creacion de nuevos conjuntos de entrenamiento.
- Transferencia a nuevos detectores: el esquema LoRA sobre un codificador preentrenado en TPCpp-10M sirve de plantilla para adaptar el modelo a otros experimentos con presupuestos de etiquetado reducidos.
- Control de calidad de simulaciones: comparar las instancias predichas sobre eventos simulados frente a las generadas por el generador Monte Carlo permite detectar discrepancias en la respuesta del detector.
- Analisis offline por lotes: con 60 millones de parametros y pesos de 0,2 GB, el modelo cabe en GPUs de consumo y puede ejecutarse sobre grandes volúmenes de eventos en pipelines de procesamiento por lotes.
- Prototipado en investigación: sirve como punto de partida para experimentos de segmentacion de instancias en point clouds cientificos, gracias a su integracion con `pimm` y a la disponibilidad de los pesos en safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 60,1 millones de parametros en precision FP32 los pesos ocupan aproximadamente 0,24 GB, y en FP16 alrededor de 0,12 GB, a lo que hay que sumar activaciones y buffers de la nube de puntos.
- GPU recomendadas: no se especifican en la informacion disponible. El modelo soporta FlashAttention, por lo que se beneficia de GPUs Ampere o superiores (A100, H100, RTX 30xx/40xx).
- GPU de consumo: por tamano, es plausible que quepa en GPUs de consumo con suficiente VRAM, aunque no se confirma en la documentacion disponible.
- Opciones de despliegue: libreria `pimm` (carga via `pimm.from_pretrained`), con `attention_backend="torch"` en GPUs sin FlashAttention. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de segmentacion de instancias en point clouds de fisica de particulas ni sus metricas.

## Limitaciones y advertencias

- Modelo especializado en un dominio muy concreto (eventos WAND SK-like); su rendimiento fuera de ese detector o de esa distribucion de datos no esta documentado.
- Entrenado con solo 1.000 eventos etiquetados, lo que puede limitar la generalizacion y aumentar la sensibilidad a sesgos del conjunto de ajuste.
- No es un modelo de lenguaje: no admite prompts textuales, tool calling ni tareas genericas.
- La licencia no esta disponible, por lo que no puede confirmarse el uso comercial; conviene contactar con el autor antes de desplegarlo en produccion.
- No se documentan sesgos especificos, pero al ser un modelo cientifico puede heredar sesgos de la simulacion o del etiquetado de los eventos de entrenamiento.
- Riesgo de falsos positivos o instancias mal separadas en eventos con alta densidad de trazas; requiere validacion contra la verdad de referencia antes de usarlo en analisis fisico.
- La inferencia depende de las transformaciones de evaluacion del repositorio `particle-imaging-models`; un preprocesado distinto puede degradar los resultados.
- En GPUs sin FlashAttention es necesario configurar `attention_backend="torch"`, lo que puede afectar al rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DeepLearnPhysics/panda-v2-instance.tpcpp-10m_ft_wand-sk-like-1k
- Codificador base: https://huggingface.co/DeepLearnPhysics/panda-v2.tpcpp-10m
- Repositorio `particle-imaging-models`: https://github.com/DeepLearnPhysics/particle-imaging-models
- Configuracion de evaluacion: `configs/panda/v2/finetune/_base_/datasets/wc.py` (dentro del repositorio anterior)
- Paper: no disponible en la informacion proporcionada.
