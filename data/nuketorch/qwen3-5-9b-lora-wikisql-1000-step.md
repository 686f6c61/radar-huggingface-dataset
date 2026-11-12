# NukeTorch/Qwen3.5-9B-LoRA-WikiSQL-1000-Step

## Resumen

Qwen3.5-9B-LoRA-WikiSQL-1000-Step es un paquete publicado por NukeTorch que combina el modelo base Qwen/Qwen3.5-9B (9.000 millones de parametros, desarrollado por Alibaba Qwen) con el adaptador LoRA resultante de una receta de fine-tuning de 1.000 pasos sobre el conjunto de datos WikiSQL. El repositorio no contiene un modelo nuevo entrenado desde cero, sino un bundle reproducible: los pesos del modelo base sin modificar, el adaptador LoRA entrenado y las 1.200 filas de WikiSQL (1.000 de entrenamiento, 100 de validacion y 100 de test) utilizadas en la ejecucion.

El objetivo es practico y de ingenieria: permitir que un solo comando de descarga obtenga todo lo necesario para reproducir un entrenamiento LoRA sobre Apple Silicon con MLX. La receta corresponde a la mostrada por Apple en la sesion WWDC26 233 ("Explore distributed inference and training with MLX") y se ejecuta con la herramienta NukeTorch N1.0.0 sobre un MacBook Pro M5 Max de 48 GB de memoria unificada.

Su relevancia actual reside en dos factores. Primero, demuestra el entrenamiento LoRA de un modelo de 9B en hardware de consumo Apple (no en un cluster de GPUs) con un throughput medido de 1.239,5 tokens entrenados por segundo. Segundo, sirve como referencia reproducible de un pipeline completo modelo + datos + receta, algo poco habitual en publicaciones de adaptadores LoRA. No obstante, el propio autor advierte de que esta release entrena el modelo pero no lo sirve, y que no se ha medido la calidad de las respuestas en las filas de validacion para esta receta corta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen3.5-9B); adaptador LoRA de rango 8 sobre las ultimas 16 capas |
| Parametros totales | 9.000 millones (modelo base, no confirmado de forma explicita en la informacion disponible) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el entrenamiento se realiza en FP16) |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 (modelo base y adaptador); datos WikiSQL bajo BSD-3-Clause (Salesforce) y MIT (Apple) |
| Formato de pesos | safetensors (modelo base y adaptador LoRA); datos en JSONL |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.5-9B, un transformer decoder-only de la familia Qwen3.5 de Alibaba. Sobre el se aplica un adaptador LoRA de rango 8 restringido a las ultimas 16 capas, entrenado en FP16 con batch de 4 durante 1.000 pasos. El entrenamiento se ejecuta con NukeTorch N1.0.0 sobre MLX, el framework de Apple para computo en silicio propio. La receta es identica a la publicada por Apple en la sesion WWDC26 233: `mlx_lm.lora --model Qwen/Qwen3.5-9B --data mlx-community/wikisql --train --batch-size 4`.

Los datos de entrenamiento proceden de WikiSQL, un corpus de pares pregunta-SQL sobre tablas de Wikipedia, procesado por mlx-community a partir del dataset original de Salesforce. La particion es de 1.000 filas de entrenamiento, 100 de validacion y 100 de test, en formato JSONL con un objeto por linea. La perdida de entrenamiento cae de 2,72 a 0,32 a lo largo de los 1.000 pasos. El autor indica que las 1.000 perdidas y el adaptador final son identicos bit a bit a los de su ejecucion publicada, lo que refuerza la reproducibilidad del paquete.

La innovacion tecnica destacable no esta en el modelo sino en el entorno: se demuestra que un MacBook Pro M5 Max con 48 GB puede entrenar LoRA sobre un 9B a 1.239,5 tokens entrenados por segundo, frente a los aproximadamente 600 tokens por segundo que Apple reporta para cuatro M3 Ultra Mac Studios y los aproximadamente 180 para un solo M3 Ultra. El pico de memoria del entrenamiento es de 27,2 GB y la duracion aproximada es de cinco minutos una vez cargado el modelo.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Qwen3.5-9B, si bien no se detallan en la informacion disponible.
- Generacion de SQL: el adaptador LoRA esta especializado en la tarea text-to-SQL de WikiSQL (traducir una pregunta en lenguaje natural a una consulta SQL sobre una tabla dada).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Reproducibilidad de entrenamiento: el bundle incluye modelo, adaptador y datos para repetir la receta completa.

## Casos de uso

- Reproduccion de experimentos de fine-tuning: el paquete permite descargar con un solo comando el modelo base, el adaptador y las 1.200 filas de WikiSQL, de modo que un investigador puede replicar la ejecucion de 1.000 pasos y verificar que la perdida cae de 2,72 a 0,32 sin depender de descargas dispersas.
- Evaluacion de MLX y NukeTorch N en Apple Silicon: sirve como benchmark practico de entrenamiento LoRA sobre un M5 Max con 48 GB, con un throughput medido de 1.239,5 tokens por segundo y un pico de 27,2 GB de memoria.
- Prototipado de text-to-SQL en local: el adaptador especializado en WikiSQL puede emplearse como punto de partida para experimentar con generacion de consultas SQL sobre esquemas tabulares sencillos en un equipo de sobremesa Apple.
- Docencia y formacion en fine-tuning: el bundle es autocontenido y de ejecucion corta (unos cinco minutos tras la carga), lo que lo hace adecuado para talleres donde se explique el flujo completo de un LoRA con datos y receta incluidos.
- Comparacion de estrategias de entrenamiento: al ser una receta fija y reproducible bit a bit, permite medir el efecto de cambiar batch, rango o capas objetivo manteniendo constante el resto de variables.
- Base para adaptadores de dominio sobre Qwen3.5-9B: el adaptador WikiSQL puede sustituirse por datos propios manteniendo el mismo pipeline de MLX y NukeTorch para tareas de conversion de lenguaje natural a consultas estructuradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor indica explicitamente que no ha medido la calidad de las respuestas en las filas de validacion para esta receta corta.

Los unicos datos de rendimiento publicados son de entrenamiento:

| Medicion | Valor |
|---|---|
| Throughput de entrenamiento (NukeTorch N1.0.0, MacBook Pro M5 Max 48 GB, mejor de tres ejecuciones) | 1.239,5 tokens entrenados/s |
| Throughput de entrenamiento (misma herramienta, informe publicado, mediana de tres pasadas) | 1.222,2 tokens entrenados/s |
| Throughput reportado por Apple (cuatro M3 Ultra Mac Studios) | ~600 tokens entrenados/s |
| Throughput reportado por Apple (un M3 Ultra Mac Studio) | ~180 tokens entrenados/s |
| Perdida inicial y final del entrenamiento | 2,72 a 0,32 |
| Pico de memoria durante el entrenamiento | 27,2 GB |
| Duracion del entrenamiento (tras cargar el modelo) | ~5 minutos |

Nota: las cifras de Apple corresponden a maquinas distintas y no fueron medidas por el autor.

## Requisitos de hardware

- Memoria unificada para entrenamiento: 48 GB recomendados; el pico medido es de 27,2 GB.
- Hardware validado: MacBook Pro con chip M5 Max y 48 GB de memoria unificada.
- Entrenamiento en GPU de consumo: si, en Apple Silicon con MLX; no se documenta soporte para GPUs NVIDIA en la informacion disponible.
- VRAM estimada para inferencia: no disponible (esta release no sirve el modelo).
- GPUs recomendadas para inferencia: no disponible.
- Opciones de despliegue: no disponible; el autor indica que esta release entrena el 9B y no lo sirve todavia.
- Latencia y throughput de inferencia: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros adaptadores LoRA de text-to-SQL ni con modelos de tamano similar, y el autor no publica metricas de calidad que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- No es un modelo listo para produccion: el autor indica que esta release entrena el modelo pero no lo sirve, y que no ha medido la calidad de las respuestas en las filas de validacion.
- Receta corta: 1.000 pasos con 1.000 filas de entrenamiento es un ajuste muy ligero; el adaptador puede no generalizar bien fuera del dominio de WikiSQL.
- Dominio estrecho: el adaptador esta especializado en text-to-SQL sobre tablas de Wikipedia; su comportamiento en otros esquemas o dialectos SQL no se documenta.
- Riesgo de alucinacion: no evaluado en la informacion disponible; los modelos de 9B pueden generar SQL sintacticamente valido pero incorrecto.
- Sesgos conocidos: no documentados en la informacion disponible.
- Idiomas: no disponibles; WikiSQL esta mayoritariamente en ingles, lo que puede limitar el rendimiento en castellano.
- Licencia del modelo: Apache-2.0, permisiva para uso comercial.
- Licencia de los datos: WikiSQL esta bajo BSD-3-Clause (Salesforce) y MIT (Apple); conviene revisar ambas antes de redistribuir el bundle.
- Licencia de la herramienta: NukeTorch N es gratuita para individuos, escuelas, entidades sin animo de lucro, proyectos open source no comerciales y empresas con menos de 10 millones de dolares de ingresos y menos de 250 personas; fuera de esos supuestos se requiere licencia comercial.
- Dependencia de ecosistema: el flujo depende de NukeTorch N y MLX, lo que limita la portabilidad a entornos no Apple.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NukeTorch/Qwen3.5-9B-LoRA-WikiSQL-1000-Step
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset WikiSQL procesado: https://huggingface.co/datasets/mlx-community/wikisql
- WikiSQL original (Salesforce): https://github.com/salesforce/WikiSQL
- Ejemplos de MLX: https://github.com/ml-explore/mlx-examples
- NukeTorch: https://github.com/NukeTorch/nuketorch
- Instalador de NukeTorch N1.0.0: https://github.com/NukeTorch/nuketorch/releases/download/n1.0.0/install.sh
