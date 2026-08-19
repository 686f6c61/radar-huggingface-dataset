# nvidia/Alpamayo2-Super

## Resumen

Alpamayo 2 Super es un modelo fundacional de 34B parametros desarrollado por NVIDIA, disenado especificamente para abordar multiples tareas de desarrollo de vehiculos autonomos (AV). Combina un backbone de vision-lenguaje (VLM) de 32B parametros con un experto de difusion de 2.3B parametros, formando una arquitectura Vision-Language-Action (VLA). El modelo se basa en Cosmos 3 Super Reasoner e integra un decodificador de acciones basado en difusion.

Su relevancia actual radica en que unifica en un solo modelo tareas criticas para la conduccion autonoma, como la prediccion de trayectorias, el visual question answering (VQA), el grounding 2D y el auto-etiquetado. Esto permite a desarrolladores e investigadores acelerar el desarrollo de software AV, eliminando la necesidad de multiples modelos especializados. El modelo se distribuye bajo la licencia OpenMDW-1.1 para los pesos y Apache 2.0 para el codigo fuente, y esta orientado a su despliegue en la nube sobre hardware NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Vision-Language-Action, VLA) |
| Parametros totales | 34B (32B backbone + 2.3B experto de difusion) |
| Parametros activos | No aplica (no es MoE; usa experto de difusion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | OpenMDW-1.1 (pesos), Apache 2.0 (codigo) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Alpamayo 2 Super emplea una arquitectura de Transformer de tipo Vision-Language-Action. El backbone de 32B parametros, basado en Cosmos 3 Super Reasoner, procesa entradas multimodales (imagenes RGB, video, texto y historial de egomocion) y genera razonamientos de Chain-of-Causation (CoC) o respuestas de VQA. El experto de accion de 2.3B parametros, un decodificador basado en difusion, se encarga de generar trayectorias de movimiento en el espacio 3D.

El entrenamiento se realizo con un dataset hibrido que incluye aproximadamente 115.000 horas de video de conduccion multi-camara con anotaciones de egomocion y trayectorias, mas de 1.000 millones de imagenes, menos de 1.000 millones de tokens de texto y entre 10.000 y 1.000.000 de horas de video. Ademas, se utilizaron alrededor de 3.700.000 trazas de razonamiento Chain-of-Causation que proporcionan explicaciones causales vinculadas a las decisiones de conduccion. El etiquetado fue hibrido (automatizado y manual). No se especifica el uso de RLHF o DPO en la informacion disponible.

## Capacidades

- Prediccion de trayectorias: genera 64 waypoints que cubren un horizonte temporal de 0,1 a 6,4 segundos, con posiciones XYZ y matrices de rotacion 3x3 en el marco del ego-vehiculo.
- Visual Question Answering (VQA): responde preguntas sobre escenas de conduccion utilizando seis camaras (IDs 0 a 5: cross left, front wide, cross right, rear left, rear tele, rear right).
- Grounding 2D: localiza objetos o regiones de interes en las imagenes de las camaras.
- Auto-etiquetado: genera campos estructurados para anotar automaticamente datos de sensores, reduciendo la dependencia de la anotacion manual.
- Meta-acciones: produce salidas de texto que describen acciones de alto nivel.
- Razonamiento Chain-of-Causation: genera trazas de razonamiento explicito que vinculan causas y efectos en las decisiones de conduccion.
- Soporte multimodal: procesa simultaneamente imagen, video, texto y egomocion (traslacion 3D y rotacion 3x3 multi-timestep).

## Casos de uso

- Desarrollo de software de conduccion autonoma end-to-end: el modelo integra percepcion, razonamiento y planificacion de movimiento en un unico pipeline, permitiendo a los equipos de I+D prototipar y validar sistemas AV completos en la nube.
- Auto-etiquetado de datos de sensores: las capacidades de auto-etiquetado permiten generar anotaciones estructuradas (bounding boxes, trayectorias, atributos) sobre grandes volumenes de video de conduccion, reduciendo significativamente el coste y el tiempo de la anotacion manual.
- Prediccion de trayectorias para planificacion de movimiento: los 64 waypoints generados (0,1 a 6,4 segundos) pueden integrarse en modulos de planificacion local para anticipar el comportamiento del vehiculo y de otros agentes.
- Generacion de explicaciones para auditoria y depuracion: las trazas de Chain-of-Causation proporcionan una narrativa explicita de por que el modelo toma ciertas decisiones, util para depurar fallos y para cumplir requisitos de explicabilidad en entornos regulados.
- Analisis de escenarios de conduccion mediante VQA: los equipos de validacion pueden formular preguntas en lenguaje natural sobre escenas capturadas por las camaras para verificar el comportamiento del modelo en situaciones criticas (intersecciones, peatones, condiciones adversas).
- Grounding 2D para deteccion de objetos y senales: la capacidad de grounding permite localizar con precision elementos relevantes en las imagenes, lo que resulta util para sistemas de alerta temprana o para enriquecer datasets de entrenamiento.
- Simulacion y validacion en la nube: al estar disenado para ejecutarse en GPU NVIDIA (probado en H100), puede desplegarse en infraestructura cloud para realizar pruebas masivas de escenarios de conduccion sin necesidad de hardware embarcado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 34B parametros en precision BF16/FP16, se requieren aproximadamente 68 GB de VRAM. No se especifican cuantizaciones oficiales, por lo que no se puede estimar un consumo menor.
- GPU recomendada: NVIDIA H100 80GB HBM3 (unica arquitectura validada segun la documentacion).
- Otras GPU: no validadas oficialmente; el uso en GPUs consumer (como RTX 4090) no esta soportado ni probado.
- Opciones de despliegue: PyTorch (minimo 2.8), Hugging Face Transformers (minimo 4.57.1) y DeepSpeed (minimo 0.17.4). No se mencionan integraciones con vLLM, Ollama o llama.cpp.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la fuente proporcionada. Al ser un VLA especifico para conduccion autonoma, no es directamente comparable con modelos de lenguaje generalistas como Llama o Qwen. Se recomienda consultar la documentacion de NVIDIA para posibles comparaciones con otros modelos de la familia Alpamayo o Cosmos.

## Limitaciones y advertencias

- Sesgos de dominio: el modelo esta entrenado exclusivamente con datos de conduccion, por lo que su rendimiento fuera de este dominio no esta garantizado.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir respuestas de VQA o razonamientos CoC incorrectos o inventados, especialmente en escenarios no representados en el dataset de entrenamiento.
- Limitaciones de idioma: solo soporta ingles; no se ha validado su rendimiento en otros idiomas.
- Restricciones de licencia: la licencia OpenMDW-1.1 debe revisarse detenidamente antes de un uso comercial, ya que puede imponer condiciones especificas sobre el despliegue y la redistribucion.
- Hardware no validado: solo se ha probado en NVIDIA H100 80GB; el uso en otras arquitecturas de GPU puede provocar comportamientos inesperados o incompatibilidades.
- Longitud de contexto no especificada: no se ha publicado el tamano de la ventana de contexto, lo que limita la planificacion de cargas de trabajo con secuencias largas.
- Requisitos de integracion: NVIDIA recomienda seguir la metodologia V-model para testing y validacion adicional antes de su despliegue en produccion, dado el caracter critico de las aplicaciones AV.

## Enlaces

- HuggingFace: https://huggingface.co/nvidia/Alpamayo2-Super
- Repositorio de codigo: https://github.com/NVlabs/alpamayo2
- Pagina oficial de Alpamayo: https://www.nvidia.com/en-us/solutions/autonomous-vehicles/alpamayo/
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
