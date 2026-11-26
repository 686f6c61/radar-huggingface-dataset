# diffusion-logic/Qwen-Image-10B-SMD-4step

## Resumen

Qwen-Image-10B-SMD-4step es un adaptador de destilación para generación de texto a imagen publicado por diffusion-logic. Se trata de un LoRA de rango 256 entrenado para reducir el modelo base OPPOer/Qwen-Image-10B (un transformer de imagen de 35 bloques con arquitectura PPCL) a un régimen de inferencia de solo cuatro pasos por imagen, frente a los 50 pasos condicionales y no condicionales (100 llamadas al transformer) que requieren las líneas base evaluadas. El adaptador incorpora además dos parámetros de normalización de salida y una programación Euler exportada específica para el muestreo en cuatro pasos.

El modelo no es un modelo completo, sino un componente de adaptación que debe combinarse con los pesos del modelo base. El repositorio ocupa 1,0 GB y se distribuye bajo licencia Apache 2.0, lo que facilita su integración en pipelines comerciales. La destilación se realizó partiendo del modelo PPCL 10B congelado como profesor, y el checkpoint corresponde a la actualización 1.000 del optimizador.

La relevancia de esta ficha radica en que la generación de imágenes con modelos de difusión de gran tamaño es costosa en cómputo; reducir a cuatro llamadas al transformer por imagen puede multiplicar el throughput en producción, a costa de una degradación medible en calidad (CleanFID de 85,248 frente a 80,358 del PPCL 10B y 79,839 del modelo original de 20B). Es un ejemplo claro del compromiso entre fidelidad y latencia en la destilación de modelos generativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 256) sobre transformer de difusión Qwen-Image 10B con 35 bloques PPCL |
| Parametros totales | No disponible (el adaptador pesa 1,0 GB; el modelo base es de 10B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo texto-imagen; no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el prompt de ejemplo está en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (el repo contiene el LoRA, dos parámetros de normalización y la programación Euler; el formato exacto de los ficheros no se especifica) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre el transformer Qwen-Image 10B, descrito por el autor como una arquitectura PPCL de 35 bloques. El entrenamiento consistió en destilación con el modelo PPCL 10B congelado como profesor, usando el dataset Lakonik/t2i-prompts-3m como fuente de prompts. El resultado es un LoRA de rango 256 que actúa como estudiante, junto con dos parámetros de normalización de salida y una programación de muestreo Euler exportada para cuatro pasos. El checkpoint publicado corresponde a la actualización 1.000 del optimizador.

La innovación principal es la reducción drástica del número de llamadas al transformer por imagen: de 100 (50 pasos condicionales más 50 no condicionales en las líneas base) a 4. El método de destilación empleado se documenta en el repositorio SMD (https://github.com/zjwfufu/SMD), y la arquitectura y pesos base en la model card de OPPOer/Qwen-Image-10B. No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si hubo etapas de RLHF o DPO (no aplicables en un pipeline texto-imagen de este tipo).

## Capacidades

- Generación de imágenes a partir de prompts de texto en cuatro pasos de inferencia por imagen.
- Integración como adaptador sobre el modelo base Qwen-Image 10B, sin sustituirlo.
- Resolución de trabajo documentada de 1024 × 1024 en el ejemplo de la model card.
- Reproducibilidad mediante semilla fija (el ejemplo usa seed 42).
- Distribución ligera (1,0 GB) que facilita el despliegue junto al modelo base.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión de entrada ni audio; es un modelo estrictamente texto-imagen.

## Casos de uso

- Generación de imágenes en producción de alta concurrencia: al requerir solo cuatro llamadas al transformer por imagen frente a las 100 de las líneas base de 50 pasos, permite atender muchas más peticiones por GPU en el mismo intervalo, adecuado para servicios de generación de imágenes a escala.
- Prototipado rápido de pipelines texto-imagen: el reducido coste por imagen facilita iterar sobre prompts y configuraciones antes de pasar a un modelo de mayor calidad como el PPCL 10B o el original de 20B.
- Generación de ilustraciones para blogs y documentación técnica: con resolución 1024 × 1024 y un FID razonable, sirve para contenido no crítico donde la latencia importa más que la fidelidad máxima.
- Creación de variaciones controladas por semilla: la reproducibilidad con seed fija permite generar conjuntos de imágenes consistentes para pruebas A/B de prompts o de estilos.
- Evaluación comparativa de métodos de destilación: útil como referencia práctica para investigadores que estudien el compromiso entre pasos de inferencia y calidad (CleanFID, FID frente al profesor).
- Despliegue en entornos con VRAM limitada: al ser un adaptador de 1,0 GB sobre un base de 10B, permite ajustar el consumo de memoria según la cuantización del base, aunque esta no se documenta.
- Generación de material gráfico para maquetas y demos internas: la velocidad de cuatro pasos encaja en flujos de trabajo interactivos donde el usuario espera respuesta casi inmediata.

## Benchmarks y rendimiento

| Metrica | Modelo original 20B | PPCL 10B | SMD 4-step (este modelo) |
|---|---|---|---|
| CleanFID (vs. fotos reales COCO val2014, 1024×1024) | 79,839 | 80,358 | 85,248 |
| FID vs. salidas del original 20B | — | 38,483 | 41,893 |
| Llamadas al transformer por imagen | 100 (50 pasos cond. + 50 no cond.) | 100 | 4 |

Evaluación sobre 1.000 casos emparejados de COCO val2014 a 1024 × 1024, con el mismo ruido inicial y las mismas condiciones de texto positivo para los tres modelos. Los autores advierten que estas puntuaciones corresponden a una muestra pequeña y son específicas de esta evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el adaptador pesa 1,0 GB, pero requiere cargar el modelo base Qwen-Image 10B, cuyo consumo depende de la precisión y cuantización no documentadas.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; un base de 10B sugiere que podría requerir GPUs de gama alta o cuantización, pero no se aportan datos.
- Opciones de despliegue: el autor proporciona un script de inferencia propio (`inference/infer.py`) con instalación vía `setup_source.sh` y `pip install -e .smd`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no se publican cifras absolutas; la ventaja relativa es de 4 llamadas al transformer frente a 100, lo que implica una reducción teórica de hasta 25 veces en el coste del paso de difusión, sin contar el resto del pipeline.

## Comparativa con modelos similares

| Modelo | Parametros | Pasos de inferencia | CleanFID (COCO val2014) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Image-10B-SMD-4step (este) | Adaptador sobre base 10B | 4 | 85,248 | Apache 2.0 | Hugging Face (diffusion-logic) |
| PPCL Qwen-Image 10B | 10B | 50 (100 llamadas) | 80,358 | No disponible en la información | Hugging Face (OPPOer) |
| Modelo original Qwen-Image 20B | 20B | 50 (100 llamadas) | 79,839 | No disponible en la información | No disponible en la información |

No se dispone de datos de otros adaptadores de destilación comparables en la información proporcionada.

## Limitaciones y advertencias

- Degradación de calidad medible: CleanFID de 85,248 frente a 80,358 del PPCL 10B y 79,839 del original 20B; el FID frente a las salidas del 20B sube de 38,483 a 41,893.
- Las métricas proceden de una muestra de 1.000 casos y los propios autores advierten que son específicas de esa evaluación; no deben generalizarse sin validación adicional.
- El adaptador no funciona de forma autónoma: requiere el modelo base OPPOer/Qwen-Image-10B y su código de inferencia.
- No se documentan sesgos conocidos, riesgos de alucinación visual ni limitaciones idiomáticas; la información disponible no cubre estos aspectos.
- No se especifican los idiomas soportados en los prompts; el único ejemplo documentado está en inglés.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base y del dataset de entrenamiento (Lakonik/t2i-prompts-3m), no detalladas aquí.
- El repositorio registra 0 descargas y 1 like en el momento de la consulta, lo que indica una validación comunitaria muy limitada.
- No se documentan la cuantización soportada ni los requisitos de hardware, lo que dificulta planificar el despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/diffusion-logic/Qwen-Image-10B-SMD-4step
- Modelo base (PPCL Qwen-Image 10B): https://huggingface.co/OPPOer/Qwen-Image-10B
- Método de destilación SMD: https://github.com/zjwfufu/SMD
- Dataset de prompts: https://huggingface.co/datasets/Lakonik/t2i-prompts-3m
