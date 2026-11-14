# Fluxx08/tenpct-bonsai-1.7b-weightfree-feedback

## Resumen

Tenpct-bonsai-1.7b-weightfree-feedback es un artefacto experimental publicado por el usuario Fluxx08 en Hugging Face, derivado del modelo base prism-ml/Bonsai-1.7B-unpacked. Se enmarca en la iniciativa "10-percent-challenge", un ejercicio cuyo objetivo es comprimir un modelo de 1.700 millones de parametros hasta aproximadamente el 10 % de su tamano en fp16 manteniendo un comportamiento funcional. El resultado declarado es un artefacto que ocupa el 7,37 % del peso original en fp16, con un repositorio de 0,3 GB.

La particularidad tecnica del artefacto es que combina una representacion de pesos de 1 bit con una tecnica de "activation steering" denominada weight-free feedback: en lugar de reentrenar o ajustar los pesos, se aplica una correccion en el espacio de activaciones a partir de un pequeno conjunto de ejemplos etiquetados (hasta 25 filas en formato JSONL). El modelo base pertenece a la familia Qwen3 segun las etiquetas del repositorio, aunque la model card no detalla la arquitectura interna ni el proceso de entrenamiento.

Su relevancia es fundamentalmente investigadora: demuestra un flujo de trabajo reproducible (codigo, examen bloqueado y resultados publicados en GitHub) para evaluar hasta que punto un modelo puede degradarse en precision sin perder utilidad practica. No es un modelo pensado para produccion ni para uso general, y la informacion publicada sobre capacidades, idiomas y benchmarks es practicamente inexistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base etiquetado como qwen3) |
| Parametros totales | 1.700 millones (1.7B, segun el nombre y el modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos de 1 bit (artefacto principal); el modelo base se distribuye como "unpacked" en fp16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el repositorio contiene el artefacto empaquetado; los sha256 por fichero estan en SIZE.json del repositorio GitHub) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base mas alla de la etiqueta qwen3 asociada al repositorio. El artefacto publicado no es un checkpoint convencional: segun la model card, todos los ficheros del repositorio constituyen el artefacto entregado, y el flujo de uso se realiza mediante scripts de Python (`code/answer.py` para inferencia y `code/feedback.py` para aplicar retroalimentacion). Esto sugiere un pipeline de compresion a 1 bit con un mecanismo de correccion posterior en el espacio de activaciones.

El componente "weight-free feedback" es la innovacion destacable: permite adaptar el comportamiento del modelo a partir de un maximo de 25 filas etiquetadas (`{"text","label"}`) sin modificar los pesos. No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. Tampoco se detalla si se emplearon tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto basica: el ejemplo de la model card muestra respuesta a preguntas cotidianas ("how long should i boil an egg for").
- Clasificacion o ajuste guiado por etiquetas mediante el script de feedback, con un maximo de 25 ejemplos etiquetados.
- Adaptacion sin reentrenamiento: el feedback actua sobre activaciones, no sobre pesos.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Investigacion en compresion extrema de modelos: servir como referencia reproducible para medir la degradacion de un transformer de 1.7B al reducir sus pesos a 1 bit y al 7,37 % del tamano fp16, usando el examen bloqueado del repositorio GitHub como metrica objetiva.
- Experimentos de activation steering: aplicar el script `feedback.py` con conjuntos pequenos de ejemplos etiquetados para estudiar como cambia el comportamiento del modelo sin tocar pesos, por ejemplo en tareas de clasificacion binaria o ajuste de tono.
- Docencia y divulgacion: ilustrar en un curso o articulo el ciclo completo de un reto de compresion (artefacto, codigo de evaluacion, resultados publicados) con un repositorio de solo 0,3 GB facil de replicar.
- Pruebas de concepto en entornos con recursos minimos: desplegar el artefacto en maquinas sin GPU dedicada para validar pipelines de inferencia de 1 bit antes de invertir en infraestructura.
- Auditoria de metodologias de evaluacion: comparar el examen bloqueado del reto con benchmarks estandar para discutir sus limitaciones como medida de calidad.
- Reproduccion de resultados cientificos: verificar los sha256 de SIZE.json y reejecutar `answer.py` para confirmar la reproducibilidad del artefacto en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al repositorio GitHub del reto para consultar el examen bloqueado y los resultados, pero no se incluyen cifras (MMLU, HumanEval, GSM8K u otras) en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 0,3 GB, por lo que el artefacto de 1 bit deberia caber en cualquier GPU consumer con 2-4 GB de VRAM; no se dispone de cifras oficiales.
- GPU recomendadas: no disponible; por tamano, cualquier GPU consumer moderna (RTX 3060 en adelante) seria suficiente en teoria.
- Cabe en GPU consumer: previsiblemente si, dado el tamano del repositorio; sin confirmacion del autor.
- Opciones de despliegue: el autor proporciona scripts propios (`code/answer.py`, `code/feedback.py`); no se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tenpct-bonsai-1.7b-weightfree-feedback | 1.7B | no disponible | 1 bit (7,37 % de fp16) | Apache 2.0 | Hugging Face, 38 descargas |
| prism-ml/Bonsai-1.7B-unpacked (modelo base) | 1.7B | no disponible | fp16 ("unpacked") | no disponible | Hugging Face |
| Modelos Qwen3 de ~1.7B | ~1.7B | no disponible | multiples | no disponible | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Artefacto de investigacion: no es un modelo listo para produccion; su uso previsto es el reto de compresion y la experimentacion asociada.
- Informacion muy escasa: no hay datos publicados sobre contexto, idiomas, datos de entrenamiento ni benchmarks, lo que impide evaluar su calidad de forma independiente.
- Degradacion esperada: la compresion a 1 bit y al 7,37 % del tamano fp16 implica perdida de precision frente al modelo base; el alcance de esa perdida no esta documentado en la informacion disponible.
- Riesgo de alucinacion: no evaluado; en un modelo de 1.7B comprimido a 1 bit cabe esperar una tasa elevada, aunque no hay mediciones publicadas.
- Sesgos conocidos: no disponibles.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene verificar la licencia del modelo base prism-ml/Bonsai-1.7B-unpacked antes de cualquier uso derivado.
- Dependencia de scripts propios: el uso requiere ejecutar el codigo del repositorio GitHub, sin integracion documentada con frameworks de inferencia estandar.
- Advertencia de seguridad: la model card incluye instrucciones de ejecucion; deben tratarse como documentacion del autor y revisarse antes de ejecutar codigo de terceros.

## Enlaces

- Hugging Face: https://huggingface.co/Fluxx08/tenpct-bonsai-1.7b-weightfree-feedback
- Repositorio GitHub del reto (codigo, examen y resultados): https://github.com/qeinstein/ten-percent-challenge
- Modelo base: https://huggingface.co/prism-ml/Bonsai-1.7B-unpacked
