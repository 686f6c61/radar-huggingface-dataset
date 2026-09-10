# ggnoll/Qwen3.8-27B-Uncensored-Aggressive-oQ3.5e

## Resumen

El modelo `ggnoll/Qwen3.8-27B-Uncensored-Aggressive-oQ3.5e` es una cuantizacion de 3 bits del modelo Qwen3.8-27B-Uncensored-Aggressive, publicada por el usuario ggnoll en Hugging Face el 10 de septiembre de 2026. No se trata de un entrenamiento nuevo, sino de una version comprimida del modelo base mediante la herramienta oQ (oMLX v0.6.4), que aplica cuantizacion de precision mixta. El resultado son 27.356.728.560 parametros almacenados en formato MLX safetensors, con un tamano de repositorio de 14,5 GB.

La relevancia de esta ficha radica en su orientacion a hardware Apple Silicon: el formato MLX solo es ejecutable de forma nativa en Macs con chip de la serie M, lo que la convierte en una via para desplegar un modelo de ~27B en un portatil o equipo de sobremesa de Apple sin GPU dedicada. La cuantizacion a 3 bits con group size 64 reduce el peso del modelo hasta un rango manejable en memoria unificada, a costa de una perdida de precision que el autor no documenta con metricas.

La informacion publicada por el autor es extremadamente escasa: la model card se limita a los parametros de cuantizacion, sin detallar la arquitectura del modelo base, la longitud de contexto, los idiomas soportados, la licencia ni resultados de evaluacion. Ademas, el repositorio registra 0 descargas y 0 likes en el momento de redactar esta ficha, por lo que no existe validacion de la comunidad sobre la calidad de los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el campo `model_type` del repositorio es `qwen3_5`; no se detalla la arquitectura del modelo base) |
| Parametros totales | 27.356.728.560 (27,36 B) |
| Parametros activos | no disponible (no hay indicios de que sea un modelo de mezcla de expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 3 bits, group size 64, precision mixta mediante oQ (oMLX v0.6.4). Solo se distribuye esa cuantizacion |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |
| Tamano del repositorio | 14,5 GB |
| Libreria de inferencia | mlx |
| Etiquetas del repositorio | mlx, oq, quantized, 3-bit, qwen3_5, region:us |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base. El autor no describe si se trata de un transformer denso, un modelo de mezcla de expertos, una arquitectura hibrida o cualquier otra variante. El unico dato estructural es el campo `model_type: qwen3_5` declarado en el repositorio, que sugiere una ascendencia dentro de la familia Qwen, pero sin confirmacion de dimensiones de capas, tipo de atencion, vocabulario ni mecanismos concretos.

Tampoco hay datos sobre el entrenamiento del modelo base: se desconoce el numero de tokens utilizados, la composicion del dataset, si hubo fases de ajuste por instrucciones, RLHF, DPO u otros metodos de alineacion, y que metodologia se siguio para el ajuste "uncensored" que da nombre al modelo. Lo unico documentado es el proceso de cuantizacion posterior: se aplico oQ (oMLX v0.6.4), una tecnica de cuantizacion de precision mixta que asigna distintos numeros de bits a distintas capas segun su sensibilidad, con una base de 3 bits y un tamano de grupo de 64. El autor advierte que los pesos se volvieron a subir el 10 de septiembre de 2026 para reemplazar una version anterior, por lo que cualquier descarga previa a esa fecha queda obsoleta.

## Capacidades

No hay ninguna capacidad verificada de forma independiente en la informacion proporcionada. A partir de los datos disponibles solo puede afirmarse lo siguiente:

- Generacion de texto: el modelo es un modelo de lenguaje de 27,36 B de parametros, por lo que se le presupone capacidad de generacion de texto, aunque no hay evaluacion publicada.
- Ajuste sin censura: el nombre del modelo incluye el termino "Uncensored-Aggressive", lo que indica que el modelo base fue modificado para reducir las negativas (refusals) y el filtrado de contenido. No se especifica la metodologia ni el alcance de ese ajuste.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio, decodificacion especulativa): no disponible.

## Casos de uso

Los siguientes escenarios son aplicaciones plausibles dado el perfil del modelo (27B cuantizado a 3 bits, formato MLX, sin censura), no capacidades confirmadas por el autor:

- Inferencia local en Apple Silicon: el modelo esta empaquetado en MLX safetensors, por lo que se puede ejecutar con `mlx-lm` o con herramientas compatibles en un Mac con memoria unificada suficiente, sin necesidad de GPU dedicada ni de conexion a internet. Es el caso de uso principal y el unico justificado directamente por el formato del repositorio.
- Procesamiento de documentos confidenciales: al ejecutarse en local, los datos no salen del equipo. Resulta adecuado para entornos con requisitos de privacidad (legal, sanitario, auditoria) donde no se permite enviar texto a APIs externas, siempre que se asuma el riesgo de alucinacion del modelo.
- Escritura creativa y generacion de ficcion sin filtros tematicos: el ajuste "uncensored" apunta a un comportamiento menos restrictivo ante peticiones de contenido adulto, violento o controvertido, un perfil buscado en narrativa y guion. Requiere revision humana del resultado.
- Investigacion sobre alineacion y comportamiento de rechazo: el modelo sirve como sujeto de estudio para medir como varia la tasa de negativas entre el modelo base y su version sin censura, o entre distintas cuantizaciones del mismo modelo.
- Red-teaming y evaluacion de seguridad: util para construir conjuntos de prompts adversarios y comprobar que mecanismos de moderacion externos detectan contenido problematico generado por un modelo deliberadamente desalineado.
- Prototipado rapido en portatil: para desarrolladores que trabajan en un Mac y quieren validar prompts, plantillas de chat o cadenas de razonamiento antes de desplegar en infraestructura mayor, el modelo ofrece un ciclo de iteracion local con 14,5 GB de pesos.
- Generacion de datos sinteticos para ajuste fino: puede emplearse para producir corpus de texto en dominios poco cubiertos, con la advertencia de que un modelo sin censura y sin evaluacion publicada puede introducir sesgos y contenido no deseado en el dataset resultante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica, y las busquedas web realizadas no han devuelto documentacion tecnica asociada al modelo, a su cuantizacion o a la herramienta oQ. Tampoco existe informacion sobre latencia, tokens por segundo o degradacion respecto al modelo base en precision completa.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del tamano del repositorio (14,5 GB) y del formato, no datos publicados por el autor:

- Memoria unificada para los pesos: en torno a 14,5 GB solo para los pesos en disco; en ejecucion hay que anadir la cache KV y el overhead del runtime de MLX, por lo que se recomienda un minimo de 24 GB de memoria unificada y 32 GB o mas para contextos largos o uso concurrente.
- Equipos compatibles: exclusivamente Apple Silicon (serie M1, M2, M3 y M4, en variantes Pro, Max y Ultra). Un Mac con 16 GB de memoria unificada queda muy justo y probablemente obligue a reducir la longitud de contexto.
- GPUs CUDA (A100, H100, RTX 4090): no son compatibles de forma nativa con MLX safetensors. Para usarlas habria que convertir los pesos a otro formato, conversion no documentada por el autor.
- Opciones de despliegue: `mlx-lm` y el propio ecosistema oMLX/oQ son las vias naturales. Herramientas con soporte MLX (por ejemplo LM Studio en su backend MLX) podrian cargar el modelo. vLLM y TGI no soportan MLX; llama.cpp y Ollama requieren GGUF, formato que este repositorio no proporciona.
- Latencia y throughput: no disponible.
- Cuantizaciones alternativas: el repositorio solo publica la variante de 3 bits. No hay versiones en 4, 5, 6 u 8 bits de este autor para este modelo.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos directamente comparables. El modelo base Qwen3.8-27B-Uncensored-Aggressive no esta documentado en los resultados de busqueda, y tampoco se conocen otras cuantizaciones del mismo modelo ni ajustes sin censura de la misma familia y tamano publicados por el mismo autor. Como referencia estructural, la unica comparacion posible es interna al propio artefacto:

| Variante | Parametros | Precision | Formato | Tamano aproximado | Licencia |
|---|---|---|---|---|---|
| Este modelo (oQ3.5e) | 27,36 B | 3 bits, group size 64, precision mixta | MLX safetensors | 14,5 GB (real) | no disponible |
| Modelo base en precision completa | 27,36 B (segun el campo `safetensors`) | no disponible | no disponible | no disponible | no disponible |
| Otras cuantizaciones del mismo base | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Perdida de calidad por cuantizacion: 3 bits con group size 64 es una compresion agresiva para un modelo de 27B. No hay ninguna evaluacion publicada que cuantifique la degradacion respecto al modelo base, por lo que el impacto real en razonamiento, codigo o coherencia en contexto largo es desconocido.
- Contenido sin censura: el ajuste "Uncensored-Aggressive" implica un filtrado reducido. El modelo puede generar contenido ofensivo, ilegal, peligroso o sexualmente explicito. No debe exponerse a usuarios finales sin una capa de moderacion externa y sin revision humana.
- Riesgo de alucinacion: no disponible. No hay evaluaciones de veracidad ni de tendencia a inventar datos. Al tratarse de una cuantizacion de baja precision, la probabilidad de errores factuales puede ser igual o mayor que la del modelo base, pero no hay mediciones.
- Sesgos: no disponibles. No se documenta la composicion del dataset de entrenamiento ni del ajuste, por lo que no es posible evaluar sesgos de genero, raza, idioma o ideologia.
- Idiomas: se desconoce que lenguas soporta y con que calidad. El nombre de la familia (Qwen) sugiere herencia multilingue, pero no hay confirmacion.
- Licencia no especificada: la ficha no indica licencia. Sin una licencia explicita, el uso comercial es juridicamente arriesgado, especialmente si el modelo base tuviera condiciones de uso que la cuantizacion deba respetar. Cualquier despliegue en produccion deberia aclarar antes la licencia del modelo original.
- Ausencia de validacion: 0 descargas y 0 likes en el momento de la consulta. No hay terceros que hayan verificado que los pesos funcionan, que la tokenizacion es correcta o que el chat template es el adecuado.
- Pesos reemplazados: el autor advierte que la version subida el 10 de septiembre de 2026 sustituye a una anterior. Si se descargo antes de esa fecha, los pesos estan obsoletos y deben descargarse de nuevo.
- Dependencia de plataforma: al estar en MLX safetensors, el modelo no es portable directamente a GPUs NVIDIA o AMD ni a despliegues en servidor convencionales. Requiere conversion a otro formato, con el riesgo de degradacion adicional que ello conlleva.
- Sin model card tecnica: no hay informacion sobre contexto maximo, tokenizador, chat template ni requisitos de prompt. Esto complica su integracion fiable en pipelines de produccion.
- Fechas del repositorio: el modelo figura como creado el 10 de septiembre de 2026, una fecha posterior a la mayoria de referencias publicas disponibles; conviene verificar la procedencia del artefacto antes de integrarlo en cualquier flujo de trabajo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ggnoll/Qwen3.8-27B-Uncensored-Aggressive-oQ3.5e
- Perfil del autor en Hugging Face: https://huggingface.co/ggnoll
- Herramienta de cuantizacion oQ / oMLX (citada en la model card): https://github.com/jundot/omlx
- Paper, blog o demo del modelo base: no disponible
- Repositorio del modelo base Qwen3.8-27B-Uncensored-Aggressive: no disponible
- Resultados de benchmarks o evaluaciones: no disponible
