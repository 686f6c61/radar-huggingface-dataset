# plantcad/marin-dna-exp593-1.5B-60M-665B

## Resumen

MarinDNA exp593 1.5B-60M es un modelo de lenguaje especializado en genómica y ADN, desarrollado por el proyecto MarinDNA (autor de la distribución: plantcad) sobre la infraestructura de entrenamiento Levanter. Se trata de un transformer con arquitectura Mixture-of-Experts (MoE, variante `grug_moe`) de 1.591.848.448 parámetros totales y aproximadamente 60,6 millones de parámetros activos por token, con una longitud de contexto de 8192 tokens. Es la exportación en BF16 del checkpoint `step-1387775` tras 665.455.079.424 tokens de entrada de entrenamiento sobre ADN.

El modelo continúa el checkpoint intermedio de 545B tokens de la ejecución exp586 durante otros 120B tokens de entrada, empleando ADN en minúsculas y entrenamiento *fill-in-the-middle* (FIM) guiado por anotaciones, con una rampa del 0% al 30% y sin metadatos biológicos en los prompts. Este checkpoint forma parte de la familia exp593 y se distribuye como modelo único, mientras que el archivo de investigación original contiene los demás modelos completados de la misma ejecución.

Su relevancia radica en que es un modelo de lenguaje de propósito general (vocabulario original de 128.256 tokens) reutilizado para modelado de secuencias de ADN mediante un esquema de tokenización carácter a carácter para los tramos de nucleótidos, lo que permite tareas de infilling génico y modelado de secuencias con un coste de inferencia muy bajo gracias a su reducido número de parámetros activos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (`grug_moe`), entrenado con Levanter |
| Parametros totales | 1.591.848.448 |
| Parametros activos | ~60,6 M por token |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible (distribucion en BF16; no se documentan otras cuantizaciones) |
| Idiomas soportados | no disponible (modelo especializado en secuencias de ADN; conserva el vocabulario de lenguaje original de 128.256 tokens) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16, cuatro shards e indice) |

## Arquitectura y entrenamiento

El modelo es un transformer con capas Mixture-of-Experts de dimension d768, con 1.591.848.448 parametros totales y aproximadamente 60,6 M activos por token. Conserva el vocabulario original de lenguaje de 128.256 tokens; los tramos de ADN se codifican con identificadores individuales de nucleotidos en minusculas, de modo que mayusculas y minusculas ocupan filas de embedding distintas. El entrenamiento se realizo con Levanter sobre la ejecucion exp593, continuando el checkpoint intermedio de 545B tokens de exp586 durante 120.000.000.000 tokens de entrada adicionales (de los cuales 119.818.624.595 fueron tokens de bases de ADN y 181.375.405 tokens de formateo), con 87.841.443.528 tokens usados como objetivos de prediccion en esta continuacion. En total, el modelo ha leido 665.455.079.424 tokens de entrada y ha usado 633.229.939.080 como objetivos de prediccion.

La innovacion principal es el entrenamiento *fill-in-the-middle* (FIM) guiado por anotaciones, con una rampa del 0% al 30% durante la continuacion, sobre ADN en minusculas y sin metadatos biologicos en los prompts. Los recuentos incluyen presentaciones repetidas y excluyen el preentrenamiento de lenguaje original; no corresponden a bases genomicas unicas. No se documentan en la informacion disponible detalles sobre RLHF, DPO ni composicion exacta del dataset mas alla de los recuentos de tokens.

## Capacidades

- Modelado y generacion de secuencias de ADN en minusculas, con codificacion caracter a caracter de los tramos de nucleotidos.
- Relleno de huecos (*fill-in-the-middle*) en secuencias de ADN, con hasta un 30% de entrenamiento especifico para esta tarea.
- Prediccion de bases y modelado de contexto genomico con ventanas de hasta 8192 tokens.
- Conserva el vocabulario de lenguaje original de 128.256 tokens, aunque no se documenta su rendimiento en tareas de lenguaje natural.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Anotacion y relleno de regiones genomicas: el modelo puede completar tramos desconocidos de una secuencia de ADN mediante su entrenamiento FIM, util para reconstruir regiones con cobertura incompleta en ensamblados.
- Modelado de secuencias para filtrado de variantes: usar la probabilidad asignada a cada base para puntuar variantes candidatas y priorizar las que se desvian del patron aprendido.
- Generacion de secuencias sinteticas de ADN con contexto largo: gracias a su ventana de 8192 tokens, permite generar fragmentos extensos manteniendo coherencia local, util en diseno de cebadores o constructos.
- Preentrenamiento y ajuste fino sobre datos genomicos propios: al ser un modelo MoE de solo 60,6 M de parametros activos, el coste de inferencia y de ajuste es reducido, lo que facilita adaptarlo a especies o regiones concretas.
- Investigacion en modelos de lenguaje aplicados a biologia: sirve como punto de partida reproducible para experimentos de tokenizacion de ADN y estrategias FIM, con pesos y recibos de exportacion documentados.
- Evaluacion de arquitecturas MoE en dominios cientificos: su reducido numero de parametros activos permite desplegarlo en entornos con recursos limitados para comparar arquitecturas frente a modelos densos de tamano similar.
- Integracion en pipelines de bioinformatica: puede invocarse mediante la implementacion de inferencia fijada del repositorio para puntuar o completar secuencias dentro de flujos automatizados de analisis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 3,2 GB para los pesos (tamano del repositorio), mas memoria para activaciones y cache KV; el reducido numero de parametros activos (~60,6 M) mantiene el coste computacional por token bajo.
- GPU recomendadas: no se especifican en la informacion disponible; por tamano, cabe en GPUs de consumo con al menos 8 GB de VRAM en BF16.
- Cabe en GPU de consumo: si, dado el tamano de pesos de 3,2 GB; modelos como RTX 3060, RTX 4060, RTX 4090 o superiores pueden alojarlo.
- Opciones de despliegue: se indica el uso de la implementacion de inferencia personalizada fijada en el repositorio (`experiments/exp586_torch_deployment`); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- El modelo no proporciona codigo de modelo remoto para Transformers; es necesario usar la implementacion de inferencia fijada en el repositorio.
- No incluye estado del optimizador ni codigo de tokenizador completo: para identificadores originales o tokens estructurales FIM hay que conservar las tablas de entrada/salida originales (`input_vocab=None`, `output_vocab=None`).
- No deben usarse identificadores compactos A/C/G/T/N con la tabla de embedding sin podar.
- Los tramos de ADN deben codificarse caracter a caracter; el texto estructural usa `original-tokenizer.json`. El envoltorio de ADN en `tokenizer.json` no es un tokenizador para prompts FIM completos.
- Mayusculas y minusculas son filas de token distintas; esta continuacion entreno ADN en minusculas, por lo que el rendimiento con mayusculas puede degradarse.
- Los recuentos de tokens incluyen presentaciones repetidas y no representan bases genomicas unicas.
- Riesgo de alucinacion en la generacion de secuencias: no se documentan evaluaciones de fidelidad biologica en la informacion disponible.
- Sesgos conocidos: no disponible.
- Limitaciones de contexto: ventana maxima de 8192 tokens.
- Licencia Apache-2.0 permite uso comercial, pero las fuentes de datos de entrenamiento subyacentes conservan sus propios terminos, que deben respetarse.
- Al ser una exportacion de investigacion con 0 descargas y 0 likes, no hay evidencia de validacion externa ni de uso en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/plantcad/marin-dna-exp593-1.5B-60M-665B
- Archivo de investigacion original: https://huggingface.co/marin-dna/marin-dna-exp593/tree/eb26947f8cd596e5bbfd954e434855d5666b030c/665B-fim
- Implementacion de inferencia fijada: https://github.com/Open-Athena/marin-dna/tree/6c07df025a185c6e39278327ba5b678dcfd93c86/experiments/exp586_torch_deployment
- Issue MarinDNA #593: https://github.com/Open-Athena/marin-dna/issues/593
- Codigo de entrenamiento: https://github.com/Open-Athena/marin-dna/tree/16207a4be2c4b6cb7b3e5d31f59dd6557c06998a/experiments/exp593_augmented_dna
- Evaluaciones: https://github.com/plantcad/plantcad2/pull/23
- Ejecucion de entrenamiento (W&B): https://forge.coreweave.com/wandb/eric-czech/marin/runs/dna-exp593-anneal-545b-guidedfim30-equalbase-seed0-v2
