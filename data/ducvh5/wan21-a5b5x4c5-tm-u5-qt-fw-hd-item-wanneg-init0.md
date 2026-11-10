# ducvh5/wan21-a5b5x4c5-tm-u5-qt-fw-hd-item-wanneg-init0

## Resumen

Este repositorio contiene un checkpoint experimental derivado de Wan-AI/Wan2.1-T2V-1.3B-Diffusers, el modelo de generacion texto-a-video de 1.300 millones de parametros publicado por Alibaba Wan. El autor (ducvh5) lo presenta como un modelo con arquitectura de transformer recurrente ("recurrent-transformer") construido a partir de un ciclo de bloques A5, B5 y C5, con 15 bloques unicos y 30 bloques ejecutados. No se trata de un lanzamiento oficial ni de un modelo documentado con una model card convencional, sino de un snapshot de pesos intermedios de un experimento de entrenamiento.

La informacion disponible es muy escasa: el README se limita a una serie de abreviaturas y parametros de entrenamiento (funcion de perdida, distribucion de sigma, mezcla de datos, inicializacion y estado del optimizador) sin explicar la motivacion del experimento ni los resultados obtenidos. El repositorio tiene cero descargas y cero likes en el momento de la consulta, y la licencia y los idiomas no estan declarados.

Por su relevancia practica, debe considerarse un artefacto de investigacion reproducible mas que un modelo listo para produccion. Su interes radica en que documenta una tecnica de reciclado de bloques (recurrent transformer) aplicada sobre un modelo de difusion de video, un enfoque poco habitual en la familia Wan2.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer recurrente derivado de Wan2.1-T2V-1.3B-Diffusers (difusion para video); ciclo A5 → B5×4 → C5, 15 bloques unicos y 30 ejecutados |
| Parametros totales | No disponible (el modelo base Wan2.1-T2V-1.3B tiene 1.300 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Checkpoints PyTorch (`state.pt`); 18 ficheros de pesos EMA y no-EMA en el snapshot |

## Arquitectura y entrenamiento

El modelo parte de Wan2.1-T2V-1.3B-Diffusers, un modelo de difusion texto-a-video, y le aplica una reestructuracion en forma de transformer recurrente: el ciclo declarado es A5 → B5×4 → C5, lo que da 15 bloques unicos ejecutados 30 veces en total. La inicializacion copia el ciclo del profesor (las capas 6 a 10 del modelo base) en las copias B, lo que sugiere una estrategia de destilacion o reciclado de bloques para reutilizar pesos preentrenados en lugar de entrenar desde cero.

El entrenamiento usa una funcion de perdida denominada "TM" aplicada a todas las salidas del bucle, con un muestreo de sigma uniforme en U(0,1), shift de 5 y t = 1000·sigma, siguiendo el esquema de difusion estandar. Los datos declarados son "OV" con captions "QT" mezclados al 50/50 entre VB y full, y una mezcla 50/50 entre OV y FW-HD por item, con dropout de "WN"; todas estas siglas aparecen sin definir en la model card. El snapshot corresponde al paso 3000 (`step0003000/state.pt`) y el autor indica que la subida del archivo completo esta pendiente. No se documentan numero de tokens, composicion detallada del dataset, ni fases de RLHF o DPO.

## Capacidades

- Generacion de video a partir de texto (pipeline text-to-video), heredada del modelo base Wan2.1-T2V-1.3B.
- Ejecucion de un transformer recurrente con 30 bloques efectivos a partir de 15 bloques unicos, lo que reduce el numero de parametros unicos respecto a un modelo de profundidad equivalente.
- Capacidades multimodales de video (texto a video) propias de la familia Wan2.1; no se documentan capacidades de imagen, audio ni vision por imagen de entrada.
- Soporte de tool calling, function calling, agentes y razonamiento multi-paso: no disponible (no es un modelo de lenguaje).
- Capacidades multilingues: no disponibles; el modelo base Wan2.1 esta orientado a prompts en ingles y chino, pero este checkpoint no lo declara.
- Modo "thinking": no disponible.

## Casos de uso

- Investigacion sobre transformers recurrentes en difusion: el checkpoint permite reproducir y analizar el efecto del reciclado de bloques (A5 → B5×4 → C5) sobre la calidad de generacion de video, comparandolo con el modelo base sin recurrencia.
- Experimentos de destilacion y compresion de modelos de video: al inicializar las copias B con las capas 6-10 del profesor, sirve como punto de partida para estudiar tecnicas de reduccion de parametros unicos en modelos de difusion.
- Generacion de clips cortos de prueba en entornos de investigacion: con 1.300 millones de parametros en el modelo base, es viable en GPUs de gama alta para prototipos de video de baja resolucion, siempre que se valide la calidad del checkpoint.
- Reproduccion de resultados: al incluir el estado del optimizador en `step0003000/state.pt`, permite reanudar o auditar el entrenamiento en un pipeline de experimentacion.
- Estudio de mezclas de datos: la configuracion 50/50 entre OV y FW-HD y entre captions VB y full puede replicarse para analizar el impacto de la composicion del dataset en la generacion de video.
- Base para fine-tuning especifico de dominio: al ser un checkpoint intermedio con pesos EMA y no-EMA, puede servir como inicializacion para ajustes posteriores sobre dominios concretos de video.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia, el modelo base Wan2.1-T2V-1.3B requiere del orden de 8-16 GB de VRAM en precision reducida, pero este dato no se confirma para el checkpoint derivado.
- GPU recomendadas: no disponible. Por el tamano del modelo base, cabria esperar viabilidad en RTX 4090, A100 y H100, sin confirmacion por parte del autor.
- Cabe en GPU de consumo: probablemente si, segun el tamano del modelo base, pero no esta verificado para este checkpoint.
- Opciones de despliegue: no disponible. El formato `state.pt` sugiere carga mediante PyTorch y el pipeline Diffusers de Wan2.1, no mediante vLLM, llama.cpp u Ollama (orientados a modelos de lenguaje).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ducvh5/wan21-a5b5x4c5-tm-u5-qt-fw-hd-item-wanneg-init0 | No disponible (base 1.3B) | No disponible | No disponible | Hugging Face, 0 descargas | Checkpoint experimental de transformer recurrente |
| Wan-AI/Wan2.1-T2V-1.3B-Diffusers | 1.300 millones | No disponible | No disponible en esta ficha | Hugging Face, modelo base oficial | Modelo de difusion texto-a-video de referencia |
| Wan-AI/Wan2.1-T2V-14B | 14.000 millones | No disponible en esta ficha | No disponible en esta ficha | Hugging Face, modelo oficial de mayor tamano | Version de mayor capacidad de la misma familia |

## Limitaciones y advertencias

- Model card extremadamente escasa: las siglas TM, OV, QT, VB, FW-HD y WN no se definen, lo que impide reproducir el entrenamiento sin ingenieria inversa.
- Licencia no declarada: no se puede asumir uso comercial permitido; hay que remitirse a la licencia del modelo base Wan2.1 antes de cualquier uso en produccion.
- Cero descargas y cero likes: no hay evidencia de validacion por parte de la comunidad ni de calidad del checkpoint.
- Snapshot incompleto: el autor indica que la subida del archivo completo esta pendiente y que solo hay 18 ficheros de pesos EMA y no-EMA; el estado del paso 3000 puede no representar el entrenamiento final.
- Riesgo de alucinacion y artefactos visuales: al ser un checkpoint intermedio de un modelo de difusion, es esperable inestabilidad en la coherencia temporal y en el seguimiento del prompt, sin datos publicados que lo cuantifiquen.
- Idiomas no declarados: no hay garantia de soporte de prompts en castellano; el modelo base esta orientado a ingles y chino.
- Sin benchmarks: no es posible comparar su rendimiento con el modelo base ni con alternativas.
- No apto para produccion sin evaluacion previa: la ausencia de documentacion y de validacion desaconseja su uso fuera de entornos de investigacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ducvh5/wan21-a5b5x4c5-tm-u5-qt-fw-hd-item-wanneg-init0
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B-Diffusers
