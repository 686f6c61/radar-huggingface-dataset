# mradermacher/AfriqueQwen3.5-4B-Instruct-v1-i1-GGUF

## Resumen

AfriqueQwen3.5-4B-Instruct-v1 es un modelo de lenguaje multimodal (imagen y texto) desarrollado por McGill-NLP, con un enfoque en lenguas africanas. Este repositorio concreto contiene las cuantizaciones GGUF con imatrix realizadas por mradermacher, que permiten ejecutar el modelo en hardware de consumo con un uso reducido de memoria. El modelo base es una adaptación de la familia Qwen3.5 de Alibaba, ajustada mediante continued pretraining para lenguas africanas.

La relevancia de este modelo radica en su capacidad multilingüe para un conjunto de lenguas africanas, un área tradicionalmente poco cubierta por los modelos de lenguaje dominantes. Al estar disponible en formato GGUF, puede desplegarse localmente con herramientas como llama.cpp u Ollama, lo que facilita su uso en entornos con restricciones de conectividad o soberanía de datos. El modelo tiene aproximadamente 4.000 millones de parámetros, aunque el dato de 897.272 parámetros que aparece en los metadatos de safetensors parece incorrecto o incompleto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.5) |
| Parametros totales | Aproximadamente 4.000 millones (dato del nombre del modelo; el valor de safetensors de 897.272 parece incompleto) |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | Ingles y 21 lenguas africanas (segun el repositorio ExtendedCM) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (con archivo imatrix) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5, la familia de modelos de Alibaba, que emplea una arquitectura transformer estándar con atención por ventanas deslizantes y atención completa alternadas. El modelo base fue sometido a un proceso de continued pretraining por parte de McGill-NLP para adaptarlo a lenguas africanas, lo que implica un entrenamiento adicional sobre corpus multilingües. No se dispone de detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

La cuantización realizada por mradermacher utiliza el método imatrix (importance matrix), que mejora la calidad de los cuantos frente a los métodos estáticos. El repositorio incluye un archivo imatrix que permite a los usuarios generar sus propias cuantizaciones personalizadas. El modelo es multimodal, con soporte para entrada de imágenes, aunque los archivos mmproj necesarios para la proyección de visión se encuentran en el repositorio estático, no en este.

## Capacidades

- Generacion de texto e instrucciones en ingles y 21 lenguas africanas.
- Comprension de imagenes (modelo vision-language), aunque requiere los archivos mmproj del repositorio estatico.
- Soporte de conversacion multi-turno gracias a su naturaleza instruct.
- Ejecucion local en CPU o GPU gracias al formato GGUF.
- Generacion de texto con cuantizaciones de distinta precision para ajustar el equilibrio calidad/rendimiento.

## Casos de uso

- Atencion al cliente en lenguas africanas: el modelo puede gestionar conversaciones en lenguas como suajili, yoruba o hausa, algo que los modelos comerciales no cubren adecuadamente. Su despliegue local permite mantener los datos de los clientes en la infraestructura de la empresa.
- Transcripcion y resumen de documentos en lenguas africanas: util para organizaciones que trabajan con contenido en estos idiomas y necesitan procesarlo de forma automatizada.
- Educacion y traduccion asistida: puede servir como herramienta de apoyo para estudiantes y traductores que trabajan con lenguas africanas, generando explicaciones o traducciones preliminares.
- Analisis de imagenes con texto en lenguas africanas: al ser un modelo multimodal, puede procesar imagenes que contengan texto en estos idiomas, por ejemplo, carteles, documentos escaneados o capturas de pantalla.
- Desarrollo de asistentes virtuales locales: su tamano compacto (4B) y formato GGUF permiten ejecutarlo en portatiles o mini-PCs, lo que facilita la creacion de asistentes personales sin conexion a internet.
- Investigacion en NLP para lenguas de bajos recursos: el modelo puede utilizarse como punto de partida para fine-tuning en tareas especificas, aprovechando su conocimiento previo de estas lenguas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: para la cuantizacion Q4_K_M (la mas equilibrada), se necesitan aproximadamente 2,5-3 GB de VRAM. Para Q2_K, alrededor de 1,5-2 GB. Para Q8_0 (no incluida en este repo), unos 4,5 GB.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.) puede ejecutar las cuantizaciones mas bajas. Para las mas altas, se recomienda una GPU con 6-8 GB (RTX 3060, RTX 4060 Ti, etc.).
- CPU: el modelo puede ejecutarse unicamente en CPU con llama.cpp, aunque la velocidad sera significativamente menor que en GPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, kobold.cpp, o cualquier runtime compatible con GGUF.
- Latencia y throughput: no se dispone de datos concretos, pero para un modelo de 4B en Q4_K_M, se puede esperar una generacion de 20-40 tokens/segundo en una GPU moderna de gama media.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| AfriqueQwen3.5-4B-Instruct-v1 (este) | ~4B | No disponible | Ingles + 21 lenguas africanas | CC-BY-4.0 | GGUF |
| Qwen3-4B (base) | 4B | 32K (tipico de Qwen3) | Multilingue (principalmente ingles y chino) | Apache 2.0 | Safetensors, GGUF |
| Llama-3.2-3B | 3.2B | 128K | Multilingue (principalmente ingles) | Llama 3.2 Community License | Safetensors, GGUF |

La principal diferencia de AfriqueQwen3.5-4B es su especializacion en lenguas africanas, que lo hace unico frente a los modelos generalistas. Su licencia CC-BY-4.0 es mas permisiva que la de Llama, permitiendo uso comercial con atribucion. El contexto no se ha podido verificar, pero es probable que herede la ventana de Qwen3 (32K o superior).

## Limitaciones y advertencias

- El modelo es una cuantizacion, por lo que puede presentar una ligera degradacion de calidad frente al modelo original en precision completa.
- No se dispone de informacion sobre sesgos especificos, pero al ser un modelo entrenado principalmente con datos en ingles y lenguas africanas, puede tener un rendimiento inferior en otras lenguas.
- Riesgo de alucinacion inherente a todos los modelos de lenguaje, especialmente en tareas de generacion libre.
- La licencia CC-BY-4.0 requiere atribucion si se utiliza el modelo en productos o servicios.
- El modelo es multimodal, pero los archivos mmproj necesarios para procesar imagenes no estan en este repositorio, sino en el estatico. Asegurarse de descargarlos si se necesita esta funcionalidad.
- No se ha verificado la longitud de contexto real; si se necesita una ventana larga, es recomendable probar el modelo antes de usarlo en produccion.

## Enlaces

- Repositorio GGUF (este): https://huggingface.co/mradermacher/AfriqueQwen3.5-4B-Instruct-v1-i1-GGUF
- Repositorio GGUF estatico: https://huggingface.co/mradermacher/AfriqueQwen3.5-4B-Instruct-v1-GGUF
- Modelo base: https://huggingface.co/McGill-NLP/AfriqueQwen3.5-4B-Instruct-v1
- Repositorio ExtendedCM (con mas informacion sobre lenguas): https://huggingface.co/mradermacher/AfriqueQwen3.5-4B-ExtendedCM-GGUF
- Pagina de peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
