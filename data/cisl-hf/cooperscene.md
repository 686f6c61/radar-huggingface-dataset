# cisl-hf/CooperScene

## Resumen

CooperScene no es un modelo de lenguaje, sino un repositorio de checkpoints y configuraciones para una familia de detectores 3D cooperativos orientados a conduccion autonoma. Lo publica el CISL (Connected and Intelligent Systems Lab) de la Universidad de California en Riverside, y acompana al dataset y benchmark homonimo presentado como Spotlight en ECCV 2026. El problema que aborda es la deteccion cooperativa de objetos entre multiples agentes (tres vehiculos conectados y una unidad de carretera) con caracterizacion de la comunicacion C-V2X, un escenario poco cubierto por los datasets cooperativos previos, que suelen ser simulados o carecer de trazas reales de red.

El repositorio agrupa siete detectores cooperativos (`cobevt`, `cosdh`, `ermvp`, `v2vam`, `v2vnet`, `v2xvit`) y cinco variantes de BEVFusion (single-lidar, single-lidarcam, coop-lidar y coop-lidarcam), todos ejecutados sobre un pipeline unificado de mmengine con `proj_first=True` y la misma metrica de AP 3D por poligono-IoU con umbrales 0.3, 0.5 y 0.7. Esa uniformidad es lo relevante: permite comparar directamente metodos que habitualmente se evaluan con protocolos distintos.

El paquete ocupa 3,3 GB e incluye, por cada modelo, un fichero de configuracion `.py` y un checkpoint `.pth`. La licencia es MIT, lo que facilita su uso academico e industrial, y el codigo de entrenamiento e inferencia esta abierto en GitHub. No se trata de un modelo generativo ni conversacional: no tiene tokenizador, ni ventana de contexto, ni capacidades linguisticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detectores 3D multi-agente sobre pipeline mmengine (BEVFusion y detectores cooperativos: cobevt, cosdh, ermvp, v2vam, v2vnet, v2xvit) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision y LiDAR, sin capacidades linguisticas) |
| Licencia | MIT |
| Formato de pesos | `.pth` (PyTorch) junto a configuracion `.py` de mmengine |

## Arquitectura y entrenamiento

Los modelos incluidos pertenecen a la familia de deteccion 3D cooperativa basada en transformers y fusión de modalidades. BEVFusion combina representaciones BEV de LiDAR y camara; los detectores cooperativos (`v2vnet`, `v2xvit`, `v2vam`, `ermvp`, `cosdh`, `cobevt`) incorporan intercambio de informacion entre agentes mediante mecanismos de atencion o agregacion de features entre vehiculos y la unidad de carretera (RSU). Todos se ejecutan con `proj_first=True` y comparten el mismo protocolo de evaluacion (AP 3D por poligono-IoU a 0.3, 0.5 y 0.7), lo que hace comparables los resultados entre metodos.

El entrenamiento se realiza sobre el dataset CooperScene, que segun la model card es el primer dataset real (no simulado) multi-agente y multimodal con caracterizacion de comunicacion C-V2X, recogido con tres vehiculos conectados y una RSU en intersecciones, rampas de autopista y aparcamientos. No se especifican en la informacion disponible el numero de tokens, la composicion exacta del dataset, ni si se emplearon tecnicas de RLHF o DPO (no aplicables a este tipo de modelo). Tampoco se detalla el numero de parametros de cada detector.

## Capacidades

- Deteccion 3D de objetos (vehiculos, peatones y otras clases de trafico) a partir de LiDAR, camara o fusion de ambas modalidades.
- Percepcion cooperativa multi-agente: intercambio de informacion entre tres vehiculos conectados y una unidad de carretera (V2X).
- Fusion single-modal y multi-modal: variantes BEVFusion con LiDAR solo, LiDAR+camara, y sus equivalentes cooperativas.
- Caracterizacion de la comunicacion C-V2X, con trazas reales de red asociadas al dataset.
- Evaluacion estandarizada mediante AP 3D por poligono-IoU a umbrales 0.3, 0.5 y 0.7.
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades linguisticas ni modo thinking.

## Casos de uso

- Investigacion en percepcion cooperativa V2X: el repositorio permite reproducir y comparar seis detectores cooperativos bajo un mismo pipeline, lo que acelera la evaluacion de nuevas propuestas frente a baselines publicados.
- Desarrollo de sistemas de conduccion autonoma en entornos de interseccion: los checkpoints entrenados con datos reales de intersecciones permiten validar la deteccion de objetos ocluidos por edificios o vehiculos gracias a la informacion compartida por la RSU.
- Estudios de robustez frente a perdida de comunicacion: al incluir caracterizacion C-V2X, se puede analizar como degrada la deteccion cuando el enlace V2X presenta latencia o perdida de paquetes.
- Benchmarking de fusion LiDAR-camara: las variantes `bevfusion_single_lidar`, `bevfusion_single_lidarcam`, `bevfusion_coop_lidar` y `bevfusion_coop_lidarcam` permiten aislar la contribucion de cada modalidad y de la cooperacion.
- Validacion en rampas de autopista y aparcamientos: el dataset cubre estos escenarios, utiles para probar la generalizacion de detectores mas alla de entornos urbanos densos.
- Formacion y prototipado academico: al estar bajo licencia MIT y con codigo abierto, es adecuado para cursos, tesis y proyectos de laboratorio que necesiten un baseline cooperativo reproducible.
- Integracion en pipelines de mmengine: los ficheros `.py` y `.pth` se cargan directamente con `tools/test.py` y `tools/train.py`, lo que simplifica la incorporacion a flujos de experimentacion existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que todos los modelos comparten la misma metrica (AP 3D por poligono-IoU a 0.3, 0.5 y 0.7) y que los numeros son directamente comparables, pero no incluye la tabla de resultados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende del detector concreto y del numero de agentes cooperativos simulados.
- GPU recomendadas: no disponible. Por el tipo de tarea (deteccion 3D con BEV y fusion multi-modal) se suele requerir GPU con al menos 16-24 GB para entrenamiento, pero este dato no aparece en la documentacion consultada.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: el repositorio usa PyTorch 2.1.1 y mmengine; la evaluacion se lanza con `python tools/test.py` y el entrenamiento con `python tools/train.py`. Se menciona un flujo de trabajo con Docker en el README de GitHub.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Modalidades | Cooperativo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CooperScene (este repo) | Familia de detectores 3D | LiDAR, camara | Si (V2X real) | MIT | Hugging Face + GitHub |
| BEVFusion (variantes incluidas) | Detector 3D | LiDAR, camara | Parcial (variantes coop) | MIT (en este repo) | Incluido en CooperScene |
| V2X-ViT | Detector cooperativo | LiDAR | Si | no disponible | Incluido como checkpoint |
| V2VNet | Detector cooperativo | LiDAR | Si | no disponible | Incluido como checkpoint |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada, por lo que la comparativa se limita a aspectos estructurales y de licencia.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no admite prompts, generacion de texto, tool calling ni razonamiento conversacional.
- Los checkpoints estan entrenados sobre el dataset CooperScene; su generalizacion a otras ciudades, sensores o configuraciones V2X no esta documentada.
- El rendimiento depende de la calidad y disponibilidad del enlace C-V2X; la model card no detalla el comportamiento en condiciones de red degradadas.
- No se han publicado tablas de benchmarks en la informacion disponible, lo que impide verificar cuantitativamente el rendimiento frente a alternativas.
- No se especifican sesgos conocidos ni riesgos de alucinacion (no aplicables en el sentido habitual), pero al ser un sistema de percepcion para conduccion autonoma, los errores de deteccion tienen consecuencias de seguridad criticas.
- La licencia MIT permite uso comercial, pero el dataset subyacente puede tener terminos adicionales no detallados en la model card; conviene revisar el repositorio de GitHub antes de un despliegue en produccion.
- El tamano del repositorio (3,3 GB) y la dependencia de PyTorch 2.1.1 y mmengine pueden complicar la integracion en entornos con versiones distintas.

## Enlaces

- Hugging Face: https://huggingface.co/cisl-hf/CooperScene
- GitHub: https://github.com/UCR-CISL/CooperScene
- Pagina del proyecto: https://cisl.ucr.edu/CooperScene
- PyTorch: https://pytorch.org/get-started/locally/
