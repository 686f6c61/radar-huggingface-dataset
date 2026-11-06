# FatalMistake02/pumpkn-2

## Resumen

pumpkn-2 es un modelo de lenguaje experimental de tipo transformer, desarrollado por el usuario FatalMistake02 y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo entrenado desde cero (from-scratch) con 30.188.928 parámetros totales (aproximadamente 30,19 millones), lo que lo sitúa en la categoría de modelos muy pequenos, por debajo de la mayoria de modelos de juguete orientados a experimentacion. Su unica finalidad declarada es servir como experimento temprano de entrenamiento.

El propio autor lo describe en la model card con una advertencia explicita: "absolute garbage" (basura absoluta), y senala que es un experimento temprano de entrenamiento en el que deben esperarse respuestas incorrectas y sin sentido. No se trata, por tanto, de un modelo destinado a produccion ni a evaluacion comparativa seria, sino a un ejercicio de aprendizaje o prototipado por parte de su creador.

El modelo opera con una longitud de contexto de 2.048 tokens, soporta unicamente el idioma ingles y se distribuye en formato GGUF (F16). Su relevancia actual es minima desde el punto de vista tecnico, aunque puede resultar de interes como ejemplo de pipeline de entrenamiento from-scratch de un transformer pequeno y de publicacion de pesos en formato GGUF para inferencia local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (entrenado desde cero; detalles internos no disponibles) |
| Parametros totales | 30.188.928 (aprox. 30,19 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | F16 (GGUF); no se documentan otras |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (F16); repo de 0,1 GB |

## Arquitectura y entrenamiento

La informacion disponible indica que pumpkn-2 es un transformer entrenado desde cero (tag "from-scratch"), con 30,19 millones de parametros y una ventana de contexto de 2.048 tokens. No se especifican en la model card el numero de capas, dimensiones ocultas, numero de cabezas de atencion ni el tipo exacto de atencion empleado, por lo que estos detalles se consideran no disponibles.

Tampoco se documentan el volumen de tokens de entrenamiento, la composicion del dataset (la model card remite a un archivo ATTRIBUTION.md para los creditos del dataset, sin detallar su contenido en la informacion proporcionada), ni si se aplicaron tecnicas de alineacion como RLHF, DPO o instruccion tuning. El autor califica el resultado como un experimento temprano con calidad deficiente, lo que sugiere que el entrenamiento no se completo hasta un estado utilizable o que los datos y el procedimiento eran insuficientes.

## Capacidades

- Generacion de texto basica en ingles, con calidad declarada como deficiente por el propio autor.
- Conversacion (tag "conversational"), aunque sin garantias de coherencia multi-turno.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada al ingles.
- No se documentan capacidades de vision, audio ni modo de razonamiento extendido (thinking mode).
- Compatibilidad con endpoints (tag "endpoints_compatible"), lo que permite su despliegue mediante la infraestructura de inferencia de Hugging Face.

## Casos de uso

- Experimentacion educativa sobre entrenamiento from-scratch: el modelo sirve como referencia para estudiar el pipeline completo de entrenamiento de un transformer pequeno, desde la tokenizacion hasta la publicacion en GGUF, y comparar resultados con modelos de mayor escala.
- Pruebas de infraestructura de inferencia GGUF: al ser un modelo de 0,1 GB, permite validar rapidamente el funcionamiento de llama.cpp, Ollama u otros runners compatibles con GGUF en entornos con recursos minimos, sin necesidad de GPU dedicada.
- Pruebas de integracion de endpoints: su tag "endpoints_compatible" permite verificar flujos de despliegue y consumo de APIs de inferencia en fases tempranas de un proyecto.
- Generacion de texto de relleno en entornos de prueba: util para poblar pipelines de demostracion o tests de integracion donde la calidad del texto no es relevante y se prioriza la velocidad y el bajo coste.
- Investigacion sobre degradacion de calidad en modelos pequenos: permite estudiar empiricamente como se manifiestan los fallos (alucinaciones, incoherencias) en modelos de 30 M de parametros y contrastarlo con modelos mayores.
- Docencia sobre limitaciones de los LLM: sirve como ejemplo practico para ilustrar por que el tamano, los datos y el procedimiento de entrenamiento condicionan la calidad final de un modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en F16 (30,19 M de parametros a 2 bytes por parametro, aproximadamente 60 MB de pesos mas overhead). Cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquier GPU moderna, incluidas GTX 1050, RTX 3060, RTX 4090, A100 o H100; el modelo no aprovechara la capacidad de estas ultimas.
- Cabe en GPU consumer: si, en practicamente todas, y tambien en CPU y en dispositivos de baja potencia.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF; tambien endpoints de Hugging Face.
- Latencia y throughput estimados: no disponibles; por su tamano, la latencia sera muy baja en cualquier hardware moderno, aunque no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| pumpkn-2 | 30,19 M | 2.048 | Apache 2.0 | GGUF F16 | Experimental, calidad declarada deficiente |
| Modelos de juguete tipo GPT-2 small | 124 M | 1.024 | MIT | safetensors, GGUF | Referencia clasica de modelos pequenos; mayor tamano y contexto similar |
| TinyLlama | 1.100 M | 2.048 | Apache 2.0 | safetensors, GGUF | Modelo pequeno entrenado con volumen de datos considerable; calidad muy superior |

La comparacion con alternativas de la misma categoria es limitada porque pumpkn-2 es un experimento sin benchmarks publicados. Frente a GPT-2 small (124 M) ofrece menos parametros y un contexto mayor (2.048 frente a 1.024), pero carece de evaluacion objetiva. Frente a TinyLlama (1.100 M), la diferencia de escala y de calidad esperada es de ordenes de magnitud. No se dispone de datos de rendimiento para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Calidad declarada explicitamente como deficiente por el autor: "absolute garbage"; se deben esperar respuestas incorrectas y sin sentido.
- Riesgo elevado de alucinacion e incoherencia, incluso en tareas simples.
- Contexto limitado a 2.048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Soporte unicamente de ingles; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Sesgos desconocidos: no se documenta la composicion del dataset ni se han realizado evaluaciones de sesgo.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, pero la calidad del modelo hace inviable su uso en produccion.
- No apto para produccion, atencion al cliente, generacion de codigo ni ninguna tarea donde la exactitud sea requisito.
- Ausencia total de benchmarks publicados, lo que impide evaluar su rendimiento de forma objetiva.

## Enlaces

- Hugging Face: https://huggingface.co/FatalMistake02/pumpkn-2
- Archivo de atribucion del dataset: https://huggingface.co/FatalMistake02/pumpkn-2/blob/main/ATTRIBUTION.md
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados al modelo.
