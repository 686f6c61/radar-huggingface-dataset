# liujun0805dev/Alpamayo2-Super

## Resumen

Alpamayo 2 Super es un modelo fundacional de 34.000 millones de parametros (34B) desarrollado por NVIDIA para el desarrollo de vehiculos autonomos (AV). Forma parte de la plataforma abierta Alpamayo y esta disenado para abordar multiples tareas de desarrollo de sistemas de conduccion autonoma, como prediccion de trayectorias, respuesta a preguntas visuales (VQA), grounding 2D y autoetiquetado. El modelo combina un backbone VLM (Vision-Language Model) de 32B con un experto de difusion de 2.3B para la generacion de acciones.

El modelo se basa en Cosmos 3 Super Reasoner, sobre el que se anade un decodificador de acciones basado en difusion, lo que da lugar a una arquitectura Vision-Language-Action (VLA). Los pesos se liberan bajo la licencia OpenMDW-1.1, que permite uso comercial, fine-tuning y redistribucion. El modelo se posiciona como una herramienta para desarrolladores e investigadores que necesitan un modelo de fundacion para tareas de percepcion, planificacion y toma de decisiones en el ambito de los vehiculos autonomos, con un enfasis especial en robotaxis de nivel 4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) con backbone VLM y decodificador de acciones basado en difusion |
| Parametros totales | 35.813.934.322 (34B backbone + 2.3B action expert) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Alpamayo 2 Super es un modelo VLA de tipo Transformer que combina un backbone de vision-lenguaje de 32B con un experto de difusion de 2.3B. El backbone se basa en Cosmos 3 Super Reasoner, que aporta capacidades de razonamiento Chain-of-Causation (CoC), mientras que el experto de difusion se encarga de generar trayectorias como secuencias de waypoints. La entrada del modelo es multimodal: imagenes RGB de multiples camaras, texto y historial de egomocion (translacion 3D y rotacion 3x3). La salida puede ser texto (razonamiento CoC, respuestas VQA, meta-acciones, grounding) o trayectorias de 64 waypoints que cubren de 0.1 a 6.4 segundos.

Los datos de entrenamiento incluyen mas de 1.000 millones de imagenes, menos de 1.000 millones de tokens de texto y entre 10.000 y 1.000.000 de horas de video. El dataset de conduccion se compone de aproximadamente 115.000 horas de video multicamara con anotaciones de egomocion y trayectoria, junto con alrededor de 3.700.000 trazas de razonamiento de CoC. El contenido es generado por sensores de vehiculos (camaras, IMUs y GPS) y datos sinteticos. No se han publicado detalles sobre el uso de RLHF o DPO en la informacion disponible.

## Capacidades

- Prediccion de trayectorias: genera 64 waypoints en intervalos de 0.1 segundos hasta 6.4 segundos, con posiciones XYZ y matrices de rotacion 3x3.
- Razonamiento de cadena de causalidad (Chain-of-Causation): produce trazas de razonamiento que explican las decisiones de conduccion.
- Visual question answering (VQA): responde preguntas sobre el entorno captado por las camaras.
- Grounding 2D: localiza objetos o elementos relevantes en las imagenes de entrada.
- Meta-acciones: genera descripciones de alto nivel de las acciones de conduccion.
- Auto-etiquetado: produce campos estructurados para el etiquetado automatico de datos de conduccion.
- Soporte multi-camara: procesa entradas de seis camaras simultaneamente (cross left, front wide, cross right, rear left, rear tele, rear right) y cuatro frames historicos por camara.
- Integracion de egomocion: utiliza el historial de movimiento del vehiculo (traslacion y rotacion) como entrada adicional.

## Casos de uso

- Prediccion de trayectorias en robotaxis: el modelo puede generar trayectorias de conduccion seguras y suaves en entornos urbanos complejos, utilizando la entrada de seis camaras y el historial de egomocion para anticipar movimientos de otros vehiculos y peatones.
- Etiquetado automatico de datos de conduccion: con su capacidad de auto-etiquetado, puede generar anotaciones estructuradas para grandes volumenes de datos de video, reduciendo el coste y el tiempo de anotacion manual en pipelines de desarrollo de AV.
- Sistema de planificacion de rutas en vehiculos autonomos: las meta-acciones generadas por el modelo pueden integrarse en un sistema de planificacion de mas alto nivel para convertir la percepcion en acciones de control (frenar, acelerar, cambiar de carril).
- Simulacion de escenarios de conduccion: al generar trayectorias y razonamientos de causa, el modelo puede alimentar simuladores para probar sistemas de control en escenarios sinteticos, sin necesidad de ejecutar pruebas en el mundo real.
- Asistente de conduccion para vehiculos conectados: puede utilizarse en sistemas de asistencia al conductor para explicar decisiones de conduccion en lenguaje natural, mejorando la transparencia y la confianza del usuario.
- Investigacion en seguridad de vehiculos autonomos: su capacidad de razonamiento de causa permite analizar escenarios de riesgo y generar explicaciones de por que se toma una determinada decision, util para auditorias de seguridad y cumplimiento normativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- GPU recomendada: NVIDIA H100 80GB HBM3 (unica arquitectura validada).
- VRAM estimada: el modelo ocupa 71.6 GB en formato safetensors, por lo que se requiere al menos 80GB de VRAM para cargar el modelo en precision completa.
- No se ha validado en otras arquitecturas de GPU, por lo que no se recomienda su uso en GPUs de consumo como RTX 4090 sin pruebas previas.
- Despliegue: PyTorch 2.8, Hugging Face Transformers 4.57.1 y DeepSpeed 0.17.4.
- El modelo esta disenado para ejecutarse en sistemas acelerados por NVIDIA, aprovechando GPU cores y librerias CUDA.
- No se proporcionan datos de latencia o throughput en la informacion disponible.

## Comparativa con modelos similares

No se han identificado modelos comparables en la informacion proporcionada. Alpamayo 2 Super es un modelo especializado en conduccion autonoma, con una combinacion unica de VLM y difusion, por lo que no se dispone de alternativas directas de la misma categoria para comparar.

## Limitaciones y advertencias

- El modelo solo soporta el idioma ingles, lo que limita su uso en entornos multilingues.
- La unica arquitectura de GPU validada es NVIDIA H100 80GB HBM3; otras GPU no han sido probadas y pueden presentar problemas de compatibilidad.
- Los datos de entrenamiento incluyen contenido generado por sensores y datos sinteticos, por lo que el modelo puede tener sesgos derivados de la distribucion de esos datos.
- No se han publicado resultados de benchmarks, por lo que se desconoce su rendimiento en tareas estandarizadas fuera del ambito de conduccion.
- La licencia OpenMDW-1.1 permite uso comercial, pero es necesario revisar sus terminos para derivados y redistribucion.
- El modelo requiere hardware especifico de alta gama, lo que limita su despliegue en entornos de produccion sin infraestructura adecuada.
- No se ha validado su comportamiento en condiciones de seguridad critica; es necesario realizar pruebas adicionales con datos especificos antes de su despliegue en sistemas reales.

## Enlaces

- [Hugging Face - nvidia/Alpamayo2-Super](https://huggingface.co/nvidia/Alpamayo2-Super)
- [GitHub - NVlabs/alpamayo2](https://github.com/NVlabs/alpamayo2)
- [NVIDIA Blog - Alpamayo 2 Super](https://blogs.nvidia.com/blog/alpamayo-2-super-open-model-now-available/)
- [NVIDIA News - Alpamayo 2 Super](https://nvidianews.nvidia.com/news/nvidia-alpamayo-2-super-robotaxis)
- [Alpamayo Overview](https://www.nvidia.com/en-us/solutions/autonomous-vehicles/alpamayo/)
