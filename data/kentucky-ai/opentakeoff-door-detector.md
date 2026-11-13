# Kentucky-ai/opentakeoff-door-detector

## Resumen

OpenTakeoff door detector es un modelo de deteccion de objetos basado en RF-DETR Medium, desarrollado por Kentucky AI como parte del proyecto OpenTakeoff, una aplicacion open source de medicion y presupuestacion (quantity takeoff) para construccion. El modelo resuelve un problema muy concreto: identificar puertas y huecos de paso en planos arquitectonicos que un lector vectorial de lineas no puede detectar, como huecos enmarcados (cased openings), puertas correderas, plegables, de guillotina o de ascensor, y puertas batientes cuyo arco o hoja no aparece dibujado.

Con 33,49 millones de parametros, el modelo se presenta como un complemento de un lector vectorial, no como un sustituto. Su funcion es anadir detecciones donde el lector vectorial no encuentra nada, evitando duplicar puertas ya identificadas mediante una logica de fusion documentada. Esta disenado para ejecutarse sobre teselas de 640x640 pixeles extraidas de paginas de plano renderizadas a 20 pixeles por pie.

El modelo es relevante porque aborda una tarea de nicho pero critica en el flujo de trabajo de presupuestacion de obra: la deteccion automatica de aberturas en planos. Su publicacion incluye pesos en safetensors, PyTorch y ONNX (fp32 e int8), junto con un script de inferencia de pagina completa, lo que facilita su integracion en pipelines existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR Medium (transformer detector) |
| Parametros totales | 33.494.766 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 640x640) |
| Tipos de cuantizacion | fp32, int8 (dynamic quantization) |
| Idiomas soportados | no disponible (no aplica, modelo de vision) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors, PyTorch (.pth), ONNX (fp32 e int8) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura RF-DETR Medium, un detector de objetos basado en transformer. La informacion proporcionada no detalla la composicion del dataset de entrenamiento, el numero de tokens ni si se aplicaron tecnicas de RLHF o DPO (no aplicables a un detector). La model card menciona que se uso un conjunto de desarrollo con trabajos no vistos durante el entrenamiento y un conjunto de test privado con 10 hojas de construccion reales anotadas por un estimador (149 puertas), lo que indica un entrenamiento supervisado sobre planos arquitectonicos anotados.

El pipeline de inferencia es especifico: la pagina del plano se renderiza en escala de grises a 20 pixeles por pie, se divide en teselas de 640x640 con stride 480, se normaliza con media y desviacion estandar de ImageNet en formato NCHW float32, y se obtienen 300 detecciones por tesela con logits que requieren sigmoide. Las detecciones se fusionan de vuelta a coordenadas de pagina y se aplica supresion por solapamiento del 40% del area de la caja menor. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Deteccion de puertas batientes (clase `swing`): caja que cubre el arco y la hoja de la puerta.
- Deteccion de otras puertas (clase `other door`): correderas, de bolsillo, plegables, de guillotina, de ascensor, cubriendo la tinta propia de la puerta.
- Deteccion de huecos de paso (clase `opening`): aberturas enmarcadas o pasos, de jamba a jamba.
- Deteccion de franjas de vano con puerta batiente (clase `swing doorway strip`): vano con puerta batiente, de jamba a jamba.
- Inferencia sobre paginas de plano completas mediante el script `detect_onnx.py` (onnxruntime + pymupdf).
- Ejecucion en navegador con onnxruntime-web (WebGPU o WASM).
- Integracion con la libreria `rfdetr` mediante `RFDETRMedium` con `num_classes=4`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues (es un detector de vision especializado).

## Casos de uso

- Presupuestacion automatizada de obra (quantity takeoff): el modelo se ejecuta tras un lector vectorial de puertas y anade las aberturas que este no detecta, mejorando el recuento total de puertas de 117/149 a 129/149 en el test privado, lo que reduce el trabajo manual de revision.
- Deteccion de huecos enmarcados y pasos: en planos donde el lector vectorial no encuentra ninguna abertura de este tipo (0/8 en el test), el modelo aporta 5/8 detecciones correctas, cubriendo un punto ciego del flujo tradicional.
- Procesamiento por lotes de planos en estudios de arquitectura: el script `detect_onnx.py` permite procesar PDFs completos y emitir un JSON por puerta con coordenadas en puntos PDF, facilitando la integracion en herramientas de medicion.
- Revision de planos en el navegador: con onnxruntime-web y WebGPU, una hoja de 84 teselas se procesa en 3,7 segundos, lo que permite ofrecer deteccion interactiva en una aplicacion web sin backend dedicado.
- Control de calidad de mediciones: la fusion con el lector vectorial y los umbrales por clase (found-first o precision-first) permiten ajustar el equilibrio entre exhaustividad y falsos positivos segun la fase del proyecto.
- Despliegue en portatiles sin GPU dedicada: la version int8 en ONNX (33 MB) procesa una hoja en unos 6 segundos en CPU Python, adecuada para tecnicos que trabajan en campo o en oficina sin infraestructura de GPU.
- Integracion en pipelines de CI/CD de documentos tecnicos: el modelo puede formar parte de un flujo automatizado que valide la presencia de puertas en planos antes de su publicacion o entrega.

## Benchmarks y rendimiento

Test privado con 10 hojas de construccion reales anotadas por un estimador (149 puertas), con ajustes congelados de antemano:

| Lector | Puertas encontradas | Falsos positivos | Precision |
|---|---|---|---|
| Lector vectorial solo | 117 / 149 | 3 | 0,975 |
| Lector vectorial + este modelo (found-first) | 129 / 149 | 7 | 0,949 |
| Lector vectorial + este modelo (precision-first) | 124 / 149 | 6 | 0,954 |

Por tipo con found-first: huecos enmarcados 5/8 (lector vectorial solo 0/8); puertas comunicantes 2/8; correderas 0/5; de bolsillo 0/2.

Conjunto de desarrollo (optimista, usado para elegir ajustes), puertas verificadas por clase con found-first y mejor checkpoint a umbral 0,3:

| Clase | Encontradas (found-first) | Mejor de cualquier checkpoint a 0,3 |
|---|---|---|
| Hueco enmarcado | 6 / 26 | 11 / 26 |
| Guillotina / enrollable | 4 / 17 | 7 / 17 |
| Corredera | 1 / 15 | 5 / 15 |
| Ascensor | 0 / 15 | 5 / 15 |
| Bolsillo | 1 / 6 | 2 / 6 |
| Plegable | 0 / 4 | 2 / 4 |

Comparativa int8 frente a fp32 (conjunto de desarrollo de 10 hojas, fusionado):

| Ajuste | fp32 | int8 |
|---|---|---|
| Found-first | 224 encontradas / 16 falsas | 223 encontradas / 18 falsas |
| Precision-first | 218 / 12 | 216 / 12 |

Rendimiento medido en una hoja de demostracion publica (plano de planta 1/8", 84 teselas a 20 px/pie) en un portatil Apple Silicon:

| Runtime | Modelo | Hoja | Por tesela |
|---|---|---|---|
| Chrome, onnxruntime-web WebGPU | fp32 | 3,7 s (+1,4 s de carga) | 45 ms |
| Chrome, onnxruntime-web WASM, 4 hilos | fp32 | 53 s | 632 ms |
| Chrome, onnxruntime-web WASM, 4 hilos | int8 | 47 s | 557 ms |
| Python onnxruntime CPU (incluye render PDF) | fp32 / int8 | ~7 s / ~6 s | ~90 ms |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 33,5 millones de parametros y entrada 640x640, el modelo es muy ligero y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con soporte WebGPU para el navegador; en Python, CPU es suficiente (unos 6-7 segundos por hoja). No se requieren A100 ni H100.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna (RTX 4090, RTX 3060 o integradas con WebGPU).
- Opciones de despliegue: onnxruntime (Python y web), onnxruntime-web con WebGPU o WASM, libreria `rfdetr` con PyTorch, y el script `detect_onnx.py` incluido.
- Latencia y throughput estimados: 45 ms por tesela en WebGPU fp32; ~90 ms por tesela en CPU Python; una hoja de 84 teselas en 3,7 s con WebGPU y ~6-7 s en CPU Python.
- Nota importante: usar fp32 en WebGPU; el archivo int8 esta pensado solo para CPU, ya que en WebGPU cae en kernels lentos (~140 s por hoja) y produce salidas incorrectas.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Se puede senalar que RF-DETR Medium es la arquitectura base, pero no se aportan datos de otros detectores de puertas en planos ni de modelos genericos de deteccion de objetos con los que comparar parametros, contexto o rendimiento en esta tarea especifica.

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenTakeoff door detector | 33,49 M | no aplica (640x640) | 129/149 puertas en test privado (fusionado) | AGPL-3.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo esta pensado para ejecutarse detras de un lector vectorial, no de forma autonoma. Usado solo, reporta muchos vanos duplicados y algunas ventanas como puertas.
- Puertas correderas y de bolsillo son debiles: 0/5 y 0/2 en el test privado; los ascensores tambien son debiles (0/15 en desarrollo con found-first).
- Las ventanas son el principal falso positivo para la clase `other door`; tambien aparecen chimeneas, bloques de vidrio y algunos simbolos de proteccion contra incendios.
- Riesgo de alucinacion inherente a un detector: puede generar cajas sobre elementos que no son puertas, especialmente en planos con ruido o simbolos atipicos.
- La licencia AGPL-3.0 impone obligaciones copyleft: el uso comercial en un servicio en red puede requerir liberar el codigo fuente derivado; es una restriccion importante para produccion.
- El modelo no soporta texto, audio ni capacidades multilingues; su ambito es exclusivamente la deteccion visual en planos.
- La precision depende de la escala correcta del plano (20 px/pie) y de la configuracion de fusion; un ajuste incorrecto de umbrales degrada los resultados.
- El conjunto de test es pequeno (10 hojas, 149 puertas) y los resultados de desarrollo son optimistas por haber sido usados para elegir ajustes.
- No se documentan sesgos demograficos ni linguisticos por tratarse de un modelo de vision especializado, pero si sesgos hacia los estilos de plano presentes en el entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/Kentucky-ai/opentakeoff-door-detector
- Repositorio OpenTakeoff: https://github.com/Kentucky-ai/opentakeoff
- No se han encontrado otros enlaces (papers, blogs, demos) en la informacion proporcionada.
