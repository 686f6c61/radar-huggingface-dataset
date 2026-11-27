# muahseol/enkoa-qwen3.5-0.8b-commerce-sft

## Resumen

enkoa-qwen3.5-0.8b-commerce-sft es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario muahseol. Se trata de un modelo de generacion de texto de aproximadamente 752 millones de parametros, orientado a tareas de atencion al cliente en comercio electronico y desarrollado como material didactico para el curso de deep learning de Enkoa AI Campus. El modelo esta pensado exclusivamente como ejemplo de formacion y su propio autor advierte explicitamente que no debe utilizarse en atencion al cliente real.

El ajuste se realizo sobre el checkpoint final de la tarea 01 (cuatro epocas) sin el proceso de seleccion de epocas mediante evaluacion con modelo juez que contemplaba la tarea 02 original. El resultado es un modelo de consulta de compras en linea (`commerce_sft_final`) guardado en precision float32, que se emplea en las practicas del modulo de inferencia con vLLM, donde los alumnos descargan el repositorio y lo levantan como servidor.

Su relevancia es por tanto educativa y de demostracion de pipelines de SFT e inferencia, no de produccion. La arquitectura corresponde a la familia Qwen3.5 en su variante de texto (`qwen3_5_text`), con licencia Apache 2.0 y soporte unicamente del idioma coreano segun los metadatos del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, variante `qwen3_5_text`) |
| Parametros totales | 752.393.024 (segun safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen3.5 en su variante de texto. Sobre esa base se aplico un ajuste fino supervisado (SFT) orientado a conversaciones de atencion al cliente en comercio electronico, dentro del marco del curso de deep learning de Enkoa AI Campus. El checkpoint publicado corresponde al final de la tarea 01, tras cuatro epocas de entrenamiento, y se guardo en float32.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset de SFT ni la existencia de fases posteriores de RLHF o DPO. Tampoco se documentan innovaciones tecnicas especificas (decodificacion especulativa, atencion lineal u otras) mas alla de las propias de la arquitectura base. El proposito declarado del autor es servir de ejemplo practico para el modulo de inferencia con vLLM del curso.

## Capacidades

- Generacion de texto conversacional en coreano, orientada a dialogos de consulta de compras en linea.
- Respuesta a preguntas de atencion al cliente dentro del dominio del dataset de SFT (comercio electronico).
- Inferencia compatible con transformers y con servidores compatibles con la API de endpoints (tag `endpoints_compatible`).
- Despliegue como servidor de inferencia mediante vLLM, segun el flujo de practicas descrito por el autor.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al coreano segun los metadatos; no se documenta soporte de otros idiomas.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Practicas de SFT en cursos de deep learning: el modelo sirve como ejemplo resuelto de ajuste fino supervisado sobre un modelo base pequeno, permitiendo a los alumnos inspeccionar el checkpoint final de cuatro epocas.
- Practicas de despliegue con vLLM: el repositorio se descarga y se levanta como servidor de inferencia, de modo que los alumnos practican el arranque, la configuracion y las llamadas a un endpoint compatible.
- Demostracion de pipelines de atencion al cliente: permite ilustrar como un modelo pequeno ajustado puede generar respuestas de consulta de compras en coreano, sin pretension de calidad de produccion.
- Evaluacion comparativa de checkpoints: al ser el resultado de la tarea 01 sin seleccion por modelo juez, sirve para contrastar con la variante de la tarea 02 y discutir el impacto de la seleccion de epocas.
- Experimentos academicos de bajo coste: con 752 millones de parametros, se puede ejecutar en hardware modesto para estudiar el comportamiento de un modelo ajustado en un dominio acotado.
- Base para ejercicios de evaluacion y analisis de errores: los alumnos pueden medir la calidad de las respuestas del modelo en el dominio de comercio electronico y analizar sus fallos como parte del curso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, los pesos en float32 de 752 millones de parametros ocupan aproximadamente 3 GB; en cuantizacion de 16 bits rondarian 1,5 GB y en 8 bits unos 0,75 GB, aunque el autor no publica cuantizaciones.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: por el tamano del modelo, es plausible su ejecucion en GPU de consumo con suficiente VRAM, pero no se confirma en la documentacion disponible.
- Opciones de despliegue: vLLM (uso previsto por el autor en las practicas), transformers y endpoints compatibles con la API de inferencia.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| enkoa-qwen3.5-0.8b-commerce-sft | 752.393.024 | no disponible | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (modelo base) | no disponible | no disponible | no disponible | Hugging Face |
| Alternativas de ~0,8B ajustadas para dominio | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El autor advierte explicitamente que es un modelo de ejemplo para formacion y que no debe usarse en atencion al cliente real.
- El ajuste se realizo sin el proceso de seleccion de epocas mediante modelo juez previsto en la tarea 02, por lo que la calidad puede ser inferior a la de un checkpoint seleccionado.
- Dominio muy acotado: entrenado para consultas de comercio electronico, con escasa generalizacion fuera de ese ambito.
- Idioma limitado al coreano; no se documenta soporte de castellano ni de otros idiomas.
- Riesgo de alucinacion inherente a un modelo de 0,8B ajustado con SFT; no se han publicado evaluaciones que lo cuantifiquen.
- Sesgos conocidos: no disponible.
- Longitud de contexto no documentada, lo que limita la planificacion de conversaciones multi-turno largas.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero el autor desaconseja su uso en produccion por su naturaleza didactica.
- Pesos en float32: el repositorio ocupa 6,0 GB, lo que incrementa los requisitos de almacenamiento y transferencia frente a versiones cuantizadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/muahseol/enkoa-qwen3.5-0.8b-commerce-sft
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
