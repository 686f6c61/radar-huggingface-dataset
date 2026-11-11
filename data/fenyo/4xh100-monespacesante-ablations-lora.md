# fenyo/4xH100-MonEspaceSante-ablations-LoRA

## Resumen

El repositorio `fenyo/4xH100-MonEspaceSante-ablations-LoRA` recoge un conjunto de adaptadores LoRA de rango 64 entrenados sobre el modelo base `google/gemma-4-31B-it`. Lo publica el usuario `fenyo` (Alexandre Fenyo) como parte del "Experimento 01" del proyecto AI-Experiments-4xH100, un repositorio de experimentacion con cuatro GPU H100. No se trata de un modelo completo, sino de un paquete de pesos auxiliares (adaptadores) que deben cargarse junto al modelo base de Google.

El contenido incluye siete adaptadores distintos: `gemma31_a1`, `gemma31_a2`, `gemma31_r1`, `abl_para_teacher`, `abl_para_official`, `abl_mixed_3k` y `abl_oldsft`. Segun la model card, corresponden a "entrenamientos intermedios y ablaciones", es decir, checkpoints de un estudio comparativo de configuraciones de entrenamiento, no a un modelo final afinado para produccion. El idioma declarado es frances y el dominio de trabajo parece ser el sanitario ("MonEspaceSante"), aunque la model card no detalla la composicion del dataset.

La relevancia es acotada: sirve como material reproducible para quien quiera estudiar el efecto de distintas recetas de ajuste fino (SFT, profesor paralelo, mezclas de datos) sobre Gemma 4 de 31B, pero no es un modelo listo para desplegar. No tiene descargas ni likes en el momento de la consulta y su pipeline no esta declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (rango 64) sobre transformer denso `google/gemma-4-31B-it` |
| Parametros totales | No disponible para los adaptadores; modelo base de 31B (segun nombre del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, sin especificar) |
| Tipos de cuantizacion | No disponible (los pesos publicados son safetensors en precision de entrenamiento) |
| Idiomas soportados | Frances (`fr`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores LoRA) |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-4-31B-it`, un transformer denso de la familia Gemma 4 de Google, en su variante instruction-tuned. Sobre el se aplican adaptadores LoRA de rango 64, un metodo de ajuste parametrizado eficiente que congela los pesos originales e inyecta matrices de baja dimension en las capas. El repositorio ocupa 11,8 GB, coherente con siete adaptadores de rango 64 sobre un modelo de 31B.

La model card es muy escueta: indica que los adaptadores provienen de "entrenamientos intermedios y ablaciones" del Experimento 01 del repositorio GitHub `AlexandreFenyo/AI-Experiments-4xH100`, y remite al journal del proyecto para la definicion de cada entrenamiento. Los nombres sugieren variantes como `abl_para_teacher` (posible destilacion desde un profesor), `abl_para_official` (posible alineamiento con un checkpoint oficial), `abl_mixed_3k` (mezcla de datos de 3.000 ejemplos) y `abl_oldsft` (SFT con datos antiguos), pero no hay documentacion publica que confirme estas interpretaciones. No se especifican tokens de entrenamiento, composicion del dataset, ni si hubo RLHF o DPO. Tampoco se detalla ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto en frances heredada del modelo base Gemma 4 31B-it.
- Razonamiento y conocimiento general segun el modelo base (no verificable en este repositorio).
- Posible soporte de tool calling y function calling heredado del modelo base instruction-tuned, sin confirmacion en la model card.
- Capacidades multilingues limitadas al frances segun la etiqueta `language: fr`.
- Al ser adaptadores de ablacion, cada uno representa una configuracion de entrenamiento distinta y puede comportarse de forma diferente; no hay evaluacion publicada de cada variante.
- No se declaran capacidades de vision, audio ni modo "thinking" especificas de estos adaptadores.

## Casos de uso

- Reproduccion de experimentos de ajuste fino: cargar cada adaptador sobre `google/gemma-4-31B-it` con PEFT para replicar las ablaciones del Experimento 01 y comparar recetas de entrenamiento.
- Estudio de destilacion o profesor-alumno: usar `abl_para_teacher` y `abl_para_official` para analizar el efecto de distintas fuentes de supervision en un dominio sanitario en frances.
- Investigacion sobre mezclas de datos: comparar `abl_mixed_3k` con `abl_oldsft` para medir el impacto de la composicion y antiguedad del dataset de SFT.
- Base para un ajuste posterior en dominio sanitario frances: partir de uno de los adaptadores como inicializacion y continuar el entrenamiento con datos propios.
- Evaluacion de robustez y deriva: medir como cambia el comportamiento del modelo base al aplicar cada adaptador en tareas de comprension lectora o generacion de informes clinicos sinteticos.
- Docencia y formacion: usar el conjunto como ejemplo practico de LoRA de rango 64 sobre un modelo de 31B y de gestion de checkpoints intermedios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El modelo base Gemma 4 31B requiere, en inferencia, aproximadamente 62 GB en bf16/fp16, unos 32 GB en cuantizacion de 8 bits y unos 18-20 GB en 4 bits (estimaciones estandar para 31B; no confirmadas en la model card).
- Los adaptadores LoRA anaden una sobrecarga minima (del orden de cientos de MB por adaptador en rango 64).
- GPU recomendadas para el modelo base en precision completa: A100 80 GB, H100 80 GB o varias GPU. El autor indica entrenamiento en 4xH100.
- En GPU de consumo: posible en RTX 4090 (24 GB) solo con cuantizacion de 4 bits del modelo base; en RTX 3090 (24 GB) igualmente con cuantizacion agresiva.
- Opciones de despliegue: vLLM o TGI para el modelo base con adaptadores si el backend soporta LoRA multiple; llama.cpp u Ollama requeririan fusionar el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `fenyo/4xH100-MonEspaceSante-ablations-LoRA` | Adaptadores sobre 31B | No disponible | Apache 2.0 | Hugging Face (0 descargas) | Conjunto de ablaciones, no modelo final |
| `google/gemma-4-31B-it` | 31B | No disponible | Gemma license (segun el modelo base) | Hugging Face | Modelo base instruction-tuned |
| Adaptadores LoRA genericos sobre Gemma | Variable | Heredado | Variable | Hugging Face | No hay comparacion directa publicada |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un modelo listo para produccion: son adaptadores de investigacion de un experimento personal, sin evaluacion publicada.
- Riesgo de alucinacion y sesgos heredado del modelo base Gemma 4 31B-it; no se han documentado mitigaciones especificas.
- Idioma limitado al frances; el rendimiento en castellano u otros idiomas no esta evaluado.
- El dominio sanitario implica riesgos regulatorios: no debe usarse para decisiones clinicas sin validacion profesional y cumplimiento normativo.
- La licencia Apache 2.0 del repositorio no sustituye a la licencia del modelo base; el uso comercial esta condicionado por los terminos de Gemma.
- La model card no documenta datos de entrenamiento, por lo que no se puede auditar la procedencia del corpus ni posibles sesgos.
- Repositorio con 0 descargas y 0 likes: sin validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/fenyo/4xH100-MonEspaceSante-ablations-LoRA
- Repositorio GitHub del experimento: https://github.com/AlexandreFenyo/AI-Experiments-4xH100
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
