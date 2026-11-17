# lucasdressler/mot17-gru

## Resumen

`lucasdressler/mot17-gru` no es un modelo de lenguaje: es un modelo de movimiento en PyTorch para seguimiento multiobjeto (multi-object tracking, MOT) de peatones sobre el benchmark MOT17. Lo desarrollaron Lucas Dressler Sodré y Joao Vitor Tafner en el marco de un proyecto de aprendizaje profundo de la FGV EMAp. El modelo predice el desplazamiento de la caja delimitadora de cada trayectoria entre fotogramas consecutivos, y se integra en un rastreador que asocia detecciones mediante IoU y el algoritmo húngaro.

Tecnicamente es muy compacto: una única `GRUCell` de 64 unidades que mantiene un estado oculto por trayectoria. No procesa la imagen, sino que consume la posición y el tamaño relativos a la caja predicha cuando hay detección asociada, o un vector de ceros cuando la detección falta. Su relevancia es acotada: sirve como referencia reproducible de un componente de movimiento en un pipeline de tracking, no como modelo de propósito general.

El repositorio tiene 0 descargas y 0 likes, un tamaño de 0,0 GB y no declara licencia propia; el autor restringe el uso previsto a fines académicos y no comerciales, heredando las condiciones de los datos MOT17 (CC BY-NC-SA 3.0).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GRU (`GRUCell` de 64 unidades) con estado por trayectoria |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; retropropagación truncada a 16 pasos en entrenamiento |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en punto flotante) |
| Idiomas soportados | no aplica (modelo de visión/tracking, sin entrada de texto) |
| Licencia | no disponible en el repo; uso previsto académico y no comercial según el autor |
| Formato de pesos | checkpoint PyTorch (`teacher_clip1_s0.pt`) |

## Arquitectura y entrenamiento

El modelo es una `GRUCell` de 64 unidades que mantiene un estado oculto independiente por cada trayectoria activa. En cada fotograma predice el desplazamiento de la caja delimitadora para el siguiente. La entrada es la posición y el tamaño de la caja relativos a la predicción previa cuando el rastreador encuentra una detección correspondiente; si no hay detección, la entrada es un vector de ceros, lo que obliga al modelo a aprender a propagar la trayectoria en ausencia de observación. La asociación entre detecciones y trayectorias se resuelve con IoU y el algoritmo húngaro, no con el modelo.

El checkpoint publicado corresponde al experimento con *teacher forcing*, recorte de gradiente en 1, semilla 0 y retropropagación truncada cada 16 pasos. El entrenamiento usó las secuencias MOT17-04, 05, 11 y 13; la 09 se reservó para validación y las 02 y 10 para test interno. No se especifican el número de épocas, el tamaño del conjunto de entrenamiento ni la función de pérdida exacta.

## Capacidades

- Predicción del desplazamiento de cajas delimitadoras entre fotogramas consecutivos para cada trayectoria.
- Propagación de trayectorias en fotogramas sin detección mediante entrada de ceros.
- Integración en un rastreador con asociación por IoU y algoritmo húngaro.
- Ejecución de inferencia sobre secuencias de imágenes con un archivo de detecciones en formato MOT (`frame,id,x,y,w,h,score`) y salida de vídeo MP4 anotado.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión directa sobre píxeles ni capacidades multilingües.

## Casos de uso

- Seguimiento de peatones en vídeo académico: el modelo aporta el componente de movimiento de un rastreador que asocia detecciones externas, adecuado para reproducir experimentos sobre MOT17 con las secuencias 09, 02 y 10.
- Evaluación comparativa de componentes de movimiento: sirve como referencia frente a un baseline simple y un filtro de Kalman usando la misma regla de asociación, tal como hace el proyecto original.
- Docencia y prácticas de tracking: el tamaño reducido del modelo y el notebook de inferencia permiten montar un pipeline completo en pocos minutos sin GPU de gama alta.
- Análisis de oclusiones: al recibir ceros cuando falta la detección, permite estudiar cómo degrada la identidad en oclusiones largas y qué umbral de asociación conviene.
- Prototipado de sistemas de conteo o análisis de flujo peatonal en entornos controlados, siempre que se disponga de un detector externo que genere el archivo de detecciones.
- Investigación sobre asociación de datos: el código permite sustituir el umbral de asociación y medir el efecto en IDF1, como en el análisis del autor que bajó de 0,508 a 0,495 en la secuencia 10.

## Benchmarks y rendimiento

Resultados de IDF1 publicados por el autor para el rastreador con este checkpoint y el umbral de asociación por defecto. Las secuencias de test pertenecen a la división interna del proyecto, no a la partición oficial de test de MOT17.

| Secuencia | División | IDF1 |
|---|---|---:|
| MOT17-09 | Validación | 0,626 |
| MOT17-02 | Test interno | 0,429 |
| MOT17-10 | Test interno | 0,508 |

No se han publicado resultados de benchmarks adicionales (MOTA, HOTA, MT/ML) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el modelo es una `GRUCell` de 64 unidades y el cuello de botella real es el detector externo y el almacenamiento de fotogramas.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluida una RTX 3060 o inferior; también funciona en CPU para secuencias cortas.
- Cabe en cualquier GPU de consumo y en CPU; no requiere A100 ni H100.
- Opciones de despliegue: inferencia directa con PyTorch mediante `inferencia.py` del repositorio original; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | IDF1 en MOT17 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `lucasdressler/mot17-gru` | GRU por trayectoria | no disponible | no aplica | 0,626 (val. 09), 0,429 (02), 0,508 (10) | no disponible; uso académico | Hugging Face, 0 descargas |
| Filtro de Kalman | Filtro clásico | 0 | no aplica | no disponible en la información | no aplica | Implementación estándar |
| Baseline simple | Heurístico | 0 | no aplica | no disponible en la información | no aplica | Código del proyecto original |
| SORT / DeepSORT | Kalman + asociación (y apariencia) | variable | no aplica | no disponible en la información | varía según implementación | Ampliamente disponible |

El autor compara explícitamente con un baseline simple y un filtro de Kalman usando la misma regla de asociación, pero no publica los valores numéricos de esas alternativas en la información disponible.

## Limitaciones y advertencias

- En oclusiones largas el rastreador puede perder la trayectoria o asignar un ID distinto a la misma persona; el autor lo documenta como limitación principal.
- Relajar el umbral de asociación tras una oclusión recuperó algunos IDs, pero redujo el IDF1 en la secuencia 10 de 0,508 a 0,495.
- El modelo no procesa píxeles: depende por completo de la calidad del detector externo que genera el archivo de detecciones en formato MOT.
- Entrenado solo con cuatro secuencias de MOT17 (04, 05, 11, 13); la generalización a otros dominios, cámaras o densidades de peatones no está evaluada.
- Las cifras de IDF1 corresponden a la división interna del proyecto, no a la partición oficial de test de MOT17, por lo que no son directamente comparables con la tabla pública del benchmark.
- El repositorio no declara licencia propia; el autor indica uso previsto académico y no comercial, y los datos MOT17 están bajo CC BY-NC-SA 3.0 con posibles condiciones adicionales en algunas secuencias.
- No hay información sobre sesgos demográficos, robustez ante cambios de iluminación ni comportamiento en escenas no peatonales.
- El repositorio tiene 0 descargas y 0 likes, sin pipeline declarado ni idiomas; no hay garantía de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lucasdressler/mot17-gru
- Repositorio original (código de entrenamiento, inferencia y evaluación): https://github.com/sodrelds/deep-learning-pa-2
- Notebook de inferencia: https://github.com/sodrelds/deep-learning-pa-2/blob/main/inferencia.ipynb
- Informe del proyecto, sección de horizonte, fallos y corrección: https://github.com/sodrelds/deep-learning-pa-2#parte-4-horizonte-falhas-e-corre%C3%A7%C3%A3o
- Perfil del autor: https://github.com/sodrelds
- Dataset MOT17: https://motchallenge.net/data/MOT17/
- Paper del benchmark: https://arxiv.org/abs/2010.07548
- Licencia de los datos: https://creativecommons.org/licenses/by-nc-sa/3.0/
