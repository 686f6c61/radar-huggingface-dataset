# chibifire/Kimodo-SOMA-RP-v1.1

## Resumen

Kimodo (Kinematic Motion Diffusion) es un modelo de difusion generativa desarrollado por NVIDIA para crear animaciones tridimensionales de esqueletos humanos a partir de texto y restricciones de movimiento. El modelo toma un prompt textual, una duracion deseada y, opcionalmente, restricciones como poses completas, posiciones de articulaciones, trayectorias o waypoints, y produce la translacion de la raiz y las rotaciones de 30 articulaciones del esqueleto SOMA a 30 fps. Su arquitectura es un transformer de dos etapas con 282 millones de parametros (283.281.777 en los pesos safetensors) y una duracion maxima de 10 segundos (300 frames).

Esta version, Kimodo-SOMA-RP-v1.1, es una mejora menor sobre v1 que actualiza el split de entrenamiento para no solaparse con los splits de test del Kimodo Motion Generation Benchmark, incrementa ligeramente la diversidad de los datos y elimina artefactos en muñecas y hombros. El modelo esta entrenado con el dataset propietario Bones Rigplay, que incluye 700 horas de captura de movimiento humano con descripciones textuales. Se libera bajo la NVIDIA Open Model License, que permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion model (transformer de dos etapas) |
| Parametros totales | 283.281.777 (282 M segun la model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de difusion de movimiento; duracion maxima de entrada: 10 s / 300 frames) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | NVIDIA Open Model License (permite uso comercial) |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

Kimodo es un modelo de difusion que genera movimiento esqueletico de forma condicionada. La arquitectura combina un transformer de dos etapas: una primera etapa que procesa el texto y las restricciones, y una segunda etapa que genera las secuencias de movimiento. El modelo condiciona la generacion con texto (string), duracion (numero de frames) y restricciones de pose (matrices con indices de frame, posiciones 3D de articulaciones, matrices de rotacion 3x3, heading direction y posicion de raiz). La salida consiste en la translacion de la raiz y las rotaciones de las 30 articulaciones del esqueleto SOMA, a 30 fps.

El entrenamiento se realizo con el dataset propietario Bones Rigplay, compuesto por 700 horas de captura de movimiento humano con descripciones textuales asociadas y menos de 1.000 millones de tokens de texto. Los datos se obtuvieron mediante sensores y etiquetado hibrido automatico y humano. La version v1.1 incorpora un split de entrenamiento que no solapa con los splits de test del Kimodo Motion Generation Benchmark, un mayor tamano del dataset de entrenamiento, una limpieza adicional para eliminar movimientos problematicos con artefactos en muñecas y hombros, y una mejora en la estabilidad del entrenamiento.

## Capacidades

- Generacion de animaciones 3D de esqueleto humano (30 articulaciones) a partir de prompts de texto.
- Condicionamiento por restricciones: poses completas, posiciones de extremidades, rutas y waypoints, heading direction y posicion de raiz.
- Salida de movimiento: translacion de raiz (num_frames x 3) y rotaciones de articulaciones (num_frames x 30 x 3 x 3).
- Duracion configurable hasta 10 segundos (300 frames a 30 fps).
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento simbolico.
- No soporta vision ni audio.
- Capacidades multilingues no especificadas; los datos de entrenamiento son propietarios y el texto de los prompts probablemente este en ingles.

## Casos de uso

- Demostraciones para robots humanoides: el modelo genera secuencias de movimiento para el esqueleto SOMA que pueden usarse como demostraciones para entrenar politicas de control en robots humanoides. Es adecuado porque produce movimientos realistas y puede condicionarse a restricciones de posiciones de extremidades.
- Simulacion de gemelos digitales: en entornos industriales, el modelo puede generar movimientos humanos para simular tareas de operarios en un gemelo digital, permitiendo analizar ergonomia o flujos de trabajo sin captura de movimiento real.
- Generacion de datos sinteticos: para entrenar modelos de vision por computador (estimacion de pose, deteccion de personas), se pueden generar grandes volumenes de animaciones variadas a partir de textos, aumentando la diversidad del dataset.
- Animacion para videojuegos: los desarrolladores pueden crear rapidamente animaciones de personajes describiendo la accion en texto, reduciendo la necesidad de captura de movimiento costosa o animacion manual.
- Previsualizacion en produccion audiovisual: en cine o animacion, permite generar secuencias de movimiento preliminares a partir del guion, facilitando la planificacion de escenas.
- Investigacion en generacion de movimiento: el modelo sirve como base para estudiar como el texto y las restricciones de pose condicionan el movimiento, y para comparar metodos de generacion con el Kimodo Motion Generation Benchmark.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona el Kimodo Motion Generation Benchmark como referencia para comparar modelos, pero no se incluyen metricas concretas en el material proporcionado.

## Requisitos de hardware

- VRAM estimada: No disponible. Los pesos safetensors ocupan 1,1 GB, por lo que una GPU de consumo con al menos 8 GB de VRAM podria albergarlos, pero no es un dato oficial.
- GPU recomendadas: Segun la model card, el modelo esta optimizado para NVIDIA Ampere, Blackwell y Lovelace.
- ¿Cabe en GPU de consumo? No confirmado oficialmente; el tamano de los pesos sugiere que si, pero se requiere validacion.
- Opciones de despliegue: PyTorch (unico runtime indicado). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: No disponible.

## Comparativa con modelos similares

La model card describe una familia de modelos Kimodo con distintas combinaciones de esqueleto y dataset. No se dispone de benchmarks publicos que comparen su rendimiento; la comparativa se basa en la informacion proporcionada:

| Modelo | Esqueleto | Dataset |
|---|---|---|
| Kimodo-SOMA-RP-v1.1 | 30-joint SOMA | Bones Rigplay (propietario) |
| Kimodo-SOMA-SEED | 30-joint SOMA | Bones-SEED (abierto) |
| Kimodo-G1-RP | 34-joint Unitree G1 | Bones Rigplay (retargeted) |
| Kimodo-G1-SEED | 34-joint Unitree G1 | Bones-SEED (retargeted) |
| Kimodo-SMPLX-RP | 22-joint SMPLX | Bones Rigplay (retargeted) |

La diferencia principal entre variantes es el esqueleto de salida (SOMA, Unitree G1 o SMPLX) y el origen de los datos (propietario o abierto). Las variantes con dataset abierto permiten una comparacion mas directa entre metodos de entrenamiento, mientras que las variantes propietarias ofrecen mayor diversidad de movimiento segun la model card.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente en el esqueleto SOMA de 30 articulaciones; no produce animaciones para otros esqueletos sin retargeting.
- La duracion maxima es de 10 segundos (300 frames a 30 fps), lo que limita secuencias largas.
- Los datos de entrenamiento son propietarios (Bones Rigplay) y el texto de los prompts probablemente este en ingles; la generalizacion a otros idiomas no esta garantizada.
- La model card advierte que la integracion requiere pruebas adicionales para cada caso de uso especifico, siguiendo el modelo en V para mitigar riesgos y cumplir requisitos tecnicos y funcionales.
- No se han publicado evaluaciones de sesgos. Los datos de captura de movimiento pueden contener sesgos hacia ciertos tipos de cuerpo o estilos de movimiento.
- La licencia NVIDIA Open Model License permite uso comercial, pero es necesario revisar los terminos especificos en el enlace proporcionado.
- Dependencia de hardware NVIDIA: el modelo esta optimizado para GPUs NVIDIA (Ampere, Blackwell, Lovelace), lo que puede limitar el despliegue en entornos con otras arquitecturas.
- Es un modelo de difusion, por lo que la generacion es estocastica; puede requerir ajuste de parametros para controlar la variabilidad.

## Enlaces

- HuggingFace (espejo): https://huggingface.co/chibifire/Kimodo-SOMA-RP-v1.1
- HuggingFace (original): https://huggingface.co/nvidia/Kimodo-SOMA-RP-v1.1
- Paper tecnico: https://research.nvidia.com/labs/sil/projects/kimodo/assets/kimodo_tech_report.pdf
- Pagina del proyecto: https://research.nvidia.com/labs/sil/projects/kimodo/
- GitHub: https://github.com/nv-tlabs/kimodo
- Kimodo Motion Generation Benchmark: https://huggingface.co/datasets/nvidia/Kimodo-Motion-Gen-Benchmark
