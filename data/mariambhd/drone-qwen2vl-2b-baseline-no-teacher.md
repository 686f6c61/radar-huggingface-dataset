# mariambhd/drone-qwen2vl-2b-baseline-no-teacher

## Resumen

`mariambhd/drone-qwen2vl-2b-baseline-no-teacher` es un adaptador LoRA sobre el modelo vision-lenguaje `Qwen/Qwen2-VL-2B-Instruct` de Alibaba, publicado por el usuario mariambhd en HuggingFace. Su proposito es el reconocimiento de acciones humanas en secuencias de video grabadas desde drones, clasificando cada clip en una de siete categorias: attacking, hitting, kicking, clapping, waving, walking y running. No se trata de un modelo completo, sino de un adaptador PEFT que debe cargarse junto al modelo base original.

El nombre del repositorio indica que se trata de un "baseline sin teacher": un experimento de destilacion de conocimiento en el que el termino de imitacion del profesor se anula (alpha=0), de modo que el adaptador se entrena unicamente con entropia cruzada contra las etiquetas reales. Sirve, por tanto, como referencia inferior frente a la que medir variantes de destilacion que si incorporan un modelo profesor de mayor tamano (Qwen2.5-VL-3B con su propio LoRA).

El interes del artefacto es acotado: es un experimento de investigacion con cero descargas, sin licencia declarada y sin model card completa. Resulta relevante para quien trabaje en reconocimiento de acciones con VLMs pequenos sobre hardware modesto, o para quien quiera reproducir la comparativa estudiante-profesor en un conjunto de datos propio de videos de drones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer vision-lenguaje Qwen2-VL |
| Parametros totales | No disponible para el adaptador (el modelo base Qwen2-VL-2B-Instruct tiene 2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen2-VL-2B-Instruct) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA via PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2-VL-2B-Instruct, un transformer multimodal que procesa imagenes y video junto con texto. El LoRA anade matrices de bajo rango a las capas del modelo base para especializarlo en una tarea de clasificacion de 7 clases a partir de clips de video de drones. El repositorio no detalla que modulos concretos se adaptan ni el rango o alpha del LoRA.

El entrenamiento sigue un esquema de destilacion de conocimiento con la funcion de perdida L = (1 - alpha) * CE(ground truth) + alpha * T^2 * KL sobre la distribucion de 7 clases, con alpha = 0 y temperatura T = 4.0. Al fijar alpha a cero, el termino KL desaparece y el adaptador se entrena solo con entropia cruzada supervisada, lo que justifica la etiqueta "baseline (no teacher)". El profesor de referencia es Qwen2.5-VL-3B con el LoRA `mariambhd/drone-qwen25vl-3b-lora-7class` (fold 3 de validacion cruzada). La particion de datos es la del profesor: sujetos de entrenamiento [1, 2, 5, 6, 7, 9, 10], validacion [3] y test [4, 8]. La mejor epoca segun entropia cruzada de validacion fue la 1, lo que sugiere un ajuste muy corto o un sobreajuste temprano.

## Capacidades

- Clasificacion de acciones humanas en video de drones en 7 clases cerradas: attacking, hitting, kicking, clapping, waving, walking y running.
- Procesamiento multimodal de video y texto heredado de Qwen2-VL-2B-Instruct (entrada de frames de video junto con prompt textual).
- Razonamiento visual basico y descripcion de escenas, en la medida en que el modelo base lo permite.
- No se documenta soporte de tool calling ni function calling especifico para este adaptador.
- No se documenta comportamiento agentico ni razonamiento multi-paso.
- Capacidades multilingues no declaradas; dependen del modelo base.
- No dispone de modo thinking, audio ni otras capacidades especiales mas alla de la vision.

## Casos de uso

- Deteccion de incidentes en recintos vigilados por drones: el adaptador clasifica clips en categorias como attacking, hitting o kicking, lo que permite generar alertas automaticas en sistemas de seguridad aerea con hardware de gama media.
- Monitorizacion de multitudes en eventos: las clases walking y running permiten estimar flujos de personas y detectar carreras o aglomeraciones a partir de video aereo.
- Analisis post-evento de grabaciones de drones: procesado por lotes de videos para etiquetar automaticamente secuencias y reducir el trabajo manual de anotacion en estudios de conducta.
- Investigacion en destilacion de conocimiento multimodal: el adaptador sirve como referencia inferior (baseline sin profesor) para comparar tecnicas de distillation en VLMs pequenos.
- Prototipado de pipelines de accion-recognition en entornos con GPU consumer: al apoyarse en un modelo de 2B, es viable ejecutarlo en tarjetas de 16-24 GB de VRAM con cuantizacion, lo que facilita la experimentacion academica.
- Clasificacion de clips en aplicaciones de analitica deportiva o entrenamiento: las acciones clapping, waving y running pueden etiquetarse para resumenes automaticos de sesiones grabadas desde el aire.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test (sujetos [4, 8], 40 videos):

| Modelo | Accuracy | Macro F1 | Weighted F1 |
|---|---|---|---|
| Profesor (Qwen2.5-VL-3B + LoRA) | 95.00% | 96.43% | 95.00% |
| Estudiante (Qwen2-VL-2B + este LoRA) | 80.00% | 69.63% | 77.48% |

El conjunto de test es muy pequeno (40 videos, cada video equivale a 2.5 puntos porcentuales), por lo que la varianza de estas cifras es alta. La diferencia de 15 puntos en accuracy y de casi 27 puntos en macro F1 refleja el coste de prescindir del profesor en este esquema.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB en FP16 para el modelo base de 2B mas el adaptador; en cuantizacion de 4 bits puede bajar a 2-3 GB.
- GPU recomendadas: A100 o H100 para procesamiento por lotes a escala; RTX 4090 o RTX 3090 para desarrollo y evaluacion.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas en FP16 y en tarjetas de 4-6 GB con cuantizacion.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador, vLLM o TGI para servir el modelo base con el adaptador fusionado, llama.cpp u Ollama si se convierte a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen2-VL-2B + LoRA, sin teacher) | 2B (base) | No disponible | 80.00% accuracy / 69.63% macro F1 | No disponible | HuggingFace (0 descargas) |
| Profesor (Qwen2.5-VL-3B + LoRA) | 3B (base) | No disponible | 95.00% accuracy / 96.43% macro F1 | No disponible | HuggingFace |
| Qwen2-VL-2B-Instruct (base sin adaptar) | 2B | No disponible | No evaluado en esta tarea | Apache 2.0 (segun el modelo base) | HuggingFace |

La comparativa directa con otros adaptadores de reconocimiento de acciones en video no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere cargar `Qwen/Qwen2-VL-2B-Instruct` por separado y aplicar el adaptador con PEFT.
- Sin licencia declarada, lo que impide determinar si su uso comercial esta permitido; conviene contactar con el autor antes de cualquier despliegue en produccion.
- El conjunto de test es muy pequeno (40 videos), por lo que las metricas publicadas tienen alta incertidumbre y no deben extrapolarse a dominios distintos.
- El mejor checkpoint corresponde a la epoca 1, lo que apunta a un ajuste minimo y posible infraajuste o sobreajuste temprano.
- La tarea esta restringida a 7 clases cerradas; no generaliza a acciones fuera de ese vocabulario.
- Riesgo de sesgo por la composicion del dataset de drones: condiciones de iluminacion, altitud, angulo de camara y demografia de los sujetos pueden no estar representadas de forma equilibrada.
- Riesgo de alucinacion heredado del modelo base en tareas generativas; en clasificacion cerrada el riesgo se manifiesta como etiquetas incorrectas con alta confianza.
- Idiomas soportados no declarados; el rendimiento en castellano u otras lenguas distintas del ingles no esta verificado.
- Al ser un adaptador LoRA, no se puede cuantizar de forma independiente del modelo base; las opciones de cuantizacion dependen de este ultimo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mariambhd/drone-qwen2vl-2b-baseline-no-teacher
- Modelo base: https://huggingface.co/Qwen/Qwen2-VL-2B-Instruct
- Modelo profesor referenciado: https://huggingface.co/mariambhd/drone-qwen25vl-3b-lora-7class
