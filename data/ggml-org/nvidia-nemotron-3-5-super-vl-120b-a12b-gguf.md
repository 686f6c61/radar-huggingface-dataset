# ggml-org/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-GGUF

## Resumen

NVIDIA-Nemotron-3.5-Super-VL-120B-A12B es un modelo multimodal de tipo image-text-to-text desarrollado originalmente por NVIDIA. Esta ficha concreta corresponde a la version cuantizada en formato GGUF publicada por ggml-org, el equipo detras de llama.cpp, que la ha generado automaticamente a partir de los pesos BF16 originales mediante su herramienta de conversion. El modelo combina vision y lenguaje, aceptando imagenes y texto como entrada y generando texto como salida.

El nombre del modelo indica una arquitectura de mezcla de expertos (MoE) con aproximadamente 120 mil millones de parametros totales y 12 mil millones activos por token, lo que lo situa en la categoria de modelos de gran escala pero con un coste de inferencia contenido gracias a la activacion dispersa. La publicacion en GGUF es relevante porque permite ejecutar un modelo de este tamano en hardware de consumo y en entornos sin GPUs de datacenter, algo impensable con los pesos BF16 originales.

La relevancia actual del modelo radica en la combinacion de capacidades multimodales, un contexto presumiblemente amplio y una licencia de tipo "other" que requiere revision por parte del usuario. La version GGUF de ggml-org facilita el despliegue local mediante llama.cpp y herramientas compatibles, reduciendo la barrera de entrada para desarrolladores e investigadores que quieran evaluar el modelo sin infraestructura dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) multimodal image-text-to-text, segun nomenclatura del modelo; detalles internos no disponibles |
| Parametros totales | Aproximadamente 120B (segun nombre del modelo); el dato de safetensors del repo GGUF (1.664.379.684) no es representativo del modelo completo |
| Parametros activos | Aproximadamente 12B (segun nombre del modelo) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF cuantizado (multiples niveles habituales de llama.cpp; niveles concretos no disponibles) |
| Idiomas soportados | no disponible |
| Licencia | other (requiere revision de los terminos) |
| Formato de pesos | GGUF (repo de 1370.0 GB); pesos originales en BF16 y NVFP4 en los repos de NVIDIA |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de la nomenclatura del modelo, que indica una mezcla de expertos (MoE) con 120B parametros totales y 12B activos. El caracter multimodal se confirma por el pipeline image-text-to-text y por la presencia de un codificador de vision implicito en la tarea. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento.

La version aqui descrita es una conversion automatica a GGUF realizada por ggml-org mediante su herramienta de conversion (github.com/ggml-org/convert) a partir de los pesos BF16 originales de NVIDIA. Existen tambien variantes NVFP4 y NVFP4-LiLiCorr publicadas por NVIDIA, lo que sugiere un interes en el despliegue eficiente en hardware Blackwell con formatos de baja precision. No se han publicado detalles tecnicos adicionales sobre innovaciones como decodificacion especulativa o atencion lineal en la informacion proporcionada.

## Capacidades

- Generacion de texto a partir de entradas multimodales (imagen y texto), segun el pipeline image-text-to-text.
- Comprension de imagenes: descripcion, respuesta a preguntas visuales y tareas de image-text-to-text en general.
- Razonamiento y generacion de lenguaje natural en conversaciones multi-turno (tag "conversational").
- Compatibilidad con endpoints (tag "endpoints_compatible"), lo que facilita su integracion en servicios de inferencia.
- Ejecucion local mediante llama.cpp y el comando `llama serve -hf ggml-org/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-GGUF`.
- Capacidades de tool calling, agentes o thinking mode: no disponibles en la informacion proporcionada.
- Cobertura multilingue concreta: no disponible.

## Casos de uso

- Asistente visual local: el modelo puede procesar imagenes y mantener conversaciones multi-turno sobre ellas, adecuado para prototipos de asistencia en escritorio sin depender de la nube gracias al formato GGUF.
- Analisis de documentos escaneados: extraccion de informacion de facturas, formularios o capturas mediante entrada image-text-to-text, con la ventaja de poder ejecutarse en infraestructura propia.
- Accesibilidad: descripcion automatica de imagenes para personas con discapacidad visual, integrable en aplicaciones de escritorio mediante llama.cpp.
- Moderacion de contenido visual: clasificacion y descripcion de imagenes en pipelines internos, aprovechando la capacidad multimodal y el despliegue local para evitar enviar datos sensibles a terceros.
- Investigacion en vision-lenguaje: evaluacion de modelos MoE multimodales en entornos academicos con GPUs de consumo, gracias a la cuantizacion GGUF que reduce los requisitos de VRAM.
- Prototipado rapido de agentes multimodales: uso del endpoint local de llama.cpp para experimentar con flujos que combinen imagen y texto antes de escalar a la version BF16 en produccion.
- Educacion y demos interactivas: despliegue en portatiles con GPU para demostraciones de IA multimodal sin conexion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; con 120B parametros totales y 12B activos, una cuantizacion agresiva (por ejemplo Q4) requeriria del orden de decenas de GB, aunque el dato exacto depende del nivel de cuantizacion y no se confirma en la informacion.
- El repo GGUF ocupa 1370.0 GB, lo que refleja la presencia de multiples niveles de cuantizacion; conviene descargar solo el archivo del nivel deseado.
- GPU recomendadas: no disponibles en la informacion; por el tamano, se anticipan GPUs de datacenter (A100, H100) o configuraciones multi-GPU para los niveles menos comprimidos.
- Viabilidad en GPU de consumo: no confirmada; posiblemente solo con cuantizaciones muy agresivas y offloading a RAM/CPU.
- Opciones de despliegue: llama.cpp (`llama serve`), Llama app (llama.app) y cualquier runtime compatible con GGUF; vLLM y TGI no se mencionan en la informacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Licencia "other": es imprescindible revisar los terminos de NVIDIA antes de cualquier uso comercial; la ficha no confirma permisos de redistribucion o explotacion comercial.
- Conversion automatica: al tratarse de una conversion automatica a GGUF, pueden existir diferencias de comportamiento o precision respecto a los pesos BF16 originales.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento adecuado fuera de los idiomas con los que fue entrenado.
- Longitud de contexto no disponible: planificar el diseno de aplicaciones sin asumir una ventana concreta.
- Riesgo de alucinacion: inherente a los modelos generativos; en tareas visuales puede describir elementos inexistentes en la imagen.
- Sesgos: no documentados en la informacion disponible; se recomienda evaluacion propia antes de produccion.
- Tamano del repo (1370.0 GB): requiere planificacion de almacenamiento y ancho de banda considerables.
- Sin datos de benchmarks: no es posible validar afirmaciones de rendimiento con la informacion disponible.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ggml-org/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-GGUF
- Modelo base BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16
- Variante NVFP4: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4
- Variante NVFP4-LiLiCorr: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-LiLiCorr
- Herramienta de conversion: https://github.com/ggml-org/convert
- Llama app: https://llama.app
