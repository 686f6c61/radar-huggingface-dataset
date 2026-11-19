# ikimyaii/HGRN-1.3B-semi-structured-Wanda-90pct

## Resumen

HGRN-1.3B-semi-structured-Wanda-90pct es un checkpoint derivado del modelo base fla-hub/hgrn-1.3B-100B, publicado por el usuario ikimyaii en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una version podada de forma one-shot (sin reentrenamiento) al 90% de esparsidad semi-estructurada mediante el codigo oficial de Wanda (locuslab/wanda). El modelo base emplea la arquitectura HGRN (Hierarchically Gated Recurrent Network), una familia de modelos lineales recurrentes con compuertas jerarquicas implementada en la libreria flash-linear-attention.

El proposito de esta publicacion es servir como baseline de referencia para los modelos EHWS del mismo autor. Todas las capas lineales dentro de los bloques estan podadas, mientras que los embeddings y la lm_head permanecen densos. El resultado es un modelo de 1.364.396.032 parametros almacenados (aunque la esparsidad reduce el trabajo efectivo por fila), con un tamaño de repositorio de 2,7 GB y pesos en formato safetensors.

La relevancia de esta ficha es fundamentalmente tecnica y comparativa: documenta el impacto real del podado agresivo sin reentrenamiento sobre un modelo recurrente lineal pequeno. Los resultados publicados muestran una degradacion severa de perplejidad, lo que convierte este checkpoint en una referencia util para investigacion sobre esparsidad, no en un modelo apto para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HGRN (Hierarchically Gated Recurrent Network), modelo lineal recurrente con compuertas jerarquicas |
| Parametros totales | 1.364.396.032 |
| Parametros activos | no disponible (no es MoE; esparsidad semi-estructurada del 90% en capas lineales) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Esparsidad | 0,8999 medida en las capas podadas (168 capas) |
| Modelo base | fla-hub/hgrn-1.3B-100B |
| Dependencia de carga | flash-linear-attention (`import fla`) |

## Arquitectura y entrenamiento

El modelo base fla-hub/hgrn-1.3B-100B emplea la arquitectura HGRN, un modelo lineal recurrente con compuertas jerarquicas que sustituye la atencion cuadratica clasica por recurrencia lineal, lo que reduce el coste computacional en contextos largos. La implementacion practica depende de la libreria flash-linear-attention, por lo que la carga del checkpoint requiere `import fla` antes de instanciar `AutoModelForCausalLM.from_pretrained(...)`.

Este checkpoint concreto no ha sido entrenado: es el resultado de un podado one-shot con el codigo oficial de Wanda (commit locuslab/wanda@8e8fc87, rama unstructured, `use_variant=False`). La calibracion uso 128 secuencias de C4 de 2.048 tokens con semilla 0. Los bloques se podaron en orden, calibrando cada bloque sobre las salidas de los bloques ya podados, siguiendo el enfoque de los drivers oficiales; el recorrido de capas es codigo nuevo del autor, mientras que la matematica de podado es la oficial. Los pesos se podaron en bfloat16 y el proceso completo tardo 1,6 minutos en una A100 de 40 GB. Cada fila descarta sus pesos con menor puntuacion `|W| * sqrt(||X||)`, y Wanda ya poda el mismo numero de pesos por fila por defecto, de modo que todas las filas de todas las capas podadas tienen el mismo numero de no-ceros (verificado en 168 capas), garantizando equilibrio perfecto de trabajo por fila.

## Capacidades

- Generacion de texto autoregresiva mediante `AutoModelForCausalLM`, condicionada a la instalacion de flash-linear-attention.
- Razonamiento basico y respuesta a tareas de opcion multiple, aunque con rendimiento muy degradado respecto al modelo denso (ver benchmarks).
- Procesamiento eficiente de secuencias gracias a la recurrencia lineal de HGRN, sin atencion cuadratica.
- Ejecucion con trabajo por fila equilibrado en las capas podadas, lo que facilita kernels dispersos semi-estructurados.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio, thinking mode ni capacidades multilingues especificas.
- Idiomas soportados no disponibles en la informacion proporcionada.

## Casos de uso

- Baseline de investigacion en podado: sirve como referencia directa para comparar los modelos EHWS del mismo autor, ya que comparte base, protocolo de calibracion y codigo oficial de Wanda; util para medir cuanto mejora una tecnica frente al podado Wanda puro.
- Estudio de degradacion por esparsidad extrema: permite analizar empiricamente el colapso de perplejidad (de 11,81 a 35.045,02 en WikiText-2) al podar al 90% sin reentrenamiento, informando decisiones sobre umbrales de esparsidad viables.
- Validacion de kernels dispersos: al tener todas las filas el mismo numero de no-ceros en 168 capas, es un banco de pruebas ideal para kernels semi-estructurados que asumen densidad uniforme por fila.
- Reproducibilidad de pipelines de podado: el autor documenta commit, rama, parametros de calibracion y semilla, lo que permite reproducir el experimento y auditar el codigo de recorrido de capas para arquitecturas no LLaMA/OPT.
- Experimentos de destilacion o recuperacion: util como punto de partida para estudiar tecnicas de recuperacion de rendimiento (reentrenamiento, LoRA, destilacion) sobre un modelo severamente degradado.
- Demostracion educativa de Wanda: sirve para explicar en articulos o cursos como funciona la puntuacion `|W| * sqrt(||X||)` y por que el podado one-shot agresivo falla en modelos pequenos.
- No se recomienda para atencion al cliente, generacion de codigo en produccion ni despliegue comercial, dado el colapso de calidad medido.

## Benchmarks y rendimiento

Perplejidad con el protocolo de evaluacion de ELSA (conjuntos de test WikiText-2 y C4, formula propia, fp16):

| Metrica | Denso | Este modelo |
|---|---|---|
| WikiText-2 | 11,81 | 35.045,02 |
| C4 | 16,09 | 46.922,84 |

Precision zero-shot con lm-evaluation-harness:

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2432 | 0,2218 |
| arc_easy | 0,5644 | 0,2757 |
| boolq | 0,5758 | 0,3777 |
| hellaswag | 0,3828 | 0,2579 |
| openbookqa | 0,2300 | 0,1500 |
| rte | 0,5379 | 0,5307 |
| winogrande | 0,5288 | 0,5043 |
| Media | 0,4376 | 0,3312 |

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 2,7 GB en bfloat16; en inferencia se necesita aproximadamente esa cantidad mas overhead de activaciones. El modelo denso base de 1,3B en bf16 requeriria unos 2,7 GB de pesos, igual que este checkpoint, ya que los pesos podados se almacenan igualmente en el tensor.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para bf16; una A100 40GB fue suficiente para el podado (1,6 minutos) y sobra para inferencia.
- Cabe en GPU consumer: si, en tarjetas tipo RTX 3060 (12 GB), RTX 4060 Ti, RTX 4090, etc., con margen amplio.
- Opciones de despliegue: carga via `AutoModelForCausalLM` con flash-linear-attention instalado; no se documenta soporte en vLLM, llama.cpp, Ollama o TGI en la informacion proporcionada.
- Latencia y throughput: no disponibles; la recurrencia lineal de HGRN reduce el coste en secuencias largas, pero no se publican medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (HGRN-1.3B Wanda 90%) | 1,36B (90% esparsidad en lineales) | no disponible | 35.045,02 | no disponible | Hugging Face |
| fla-hub/hgrn-1.3B-100B (denso) | 1,36B | no disponible | 11,81 | no disponible | Hugging Face |
| Modelos EHWS del mismo autor | no disponible | no disponible | no disponible | no disponible | Hugging Face |

La comparativa directa mas relevante es con el modelo base denso, del que este checkpoint es una version podada: la esparsidad del 90% multiplica la perplejidad por aproximadamente 2.967 veces en WikiText-2 y por 2.916 veces en C4, mientras la media zero-shot cae de 0,4376 a 0,3312.

## Limitaciones y advertencias

- Degradacion severa de calidad: la perplejidad en WikiText-2 pasa de 11,81 a 35.045,02 y en C4 de 16,09 a 46.922,84; el modelo no es util para generacion de texto de calidad.
- Caida notable en tareas de razonamiento: arc_easy baja de 0,5644 a 0,2757 y hellaswag de 0,3828 a 0,2579.
- Podado one-shot sin reentrenamiento: no se aplico recuperacion de rendimiento, por lo que la degradacion es esperada y documentada por el propio autor.
- Licencia no disponible: no se puede confirmar si permite uso comercial; debe verificarse con el autor y con la licencia del modelo base antes de cualquier uso.
- Idiomas y contexto no documentados: no hay informacion sobre cobertura linguistica ni longitud maxima de contexto.
- Dependencia de flash-linear-attention: la carga falla si no se instala `fla` e se importa antes de instanciar el modelo.
- Riesgo de alucinacion: no medido, pero previsiblemente alto dada la perplejidad; no apto para produccion.
- Sesgos: no documentados en la informacion proporcionada.
- Naturaleza experimental: es un checkpoint de investigacion con 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/HGRN-1.3B-semi-structured-Wanda-90pct
- Modelo base: https://huggingface.co/fla-hub/hgrn-1.3B-100B
- Codigo oficial de Wanda: https://github.com/locuslab/wanda (commit 8e8fc87, rama unstructured)
- Libreria flash-linear-attention: https://github.com/fla-org/flash-linear-attention
- Protocolo de evaluacion ELSA: no disponible en la informacion proporcionada
- Paper de HGRN: no disponible en la informacion proporcionada
