# FatalMistake02/pumpkn-4

## Resumen

pumpkn-4 es un modelo de lenguaje de tipo transformer decoder-only entrenado desde cero por el usuario FatalMistake02, publicado en Hugging Face bajo el identificador `FatalMistake02/pumpkn-4`. Se trata de un experimento temprano de entrenamiento, tal y como declara el propio autor en la model card, que lo describe literalmente como "absolute garbage" y advierte de que deben esperarse respuestas incorrectas y sinsentidos. No es, por tanto, un modelo destinado a producción ni a evaluación comparativa seria, sino un artefacto de investigación sobre el proceso de entrenamiento de modelos pequeños.

El modelo cuenta con 124.278.528 parámetros totales (aproximadamente 124,28 M), una longitud de contexto de 2.048 tokens y está distribuido en formato GGUF F16, con un tamaño de repositorio de 0,2 GB. Está etiquetado como `from-scratch` y `experimental`, lo que confirma que no deriva de ningún modelo base preexistente ni ha pasado por procesos de alineación tipo RLHF o DPO documentados. Su único idioma declarado es el inglés.

Su relevancia es limitada y de carácter didáctico: sirve como referencia de cómo se publica un checkpoint intermedio de entrenamiento en el ecosistema Hugging Face, con licencia CC BY-SA 4.0 y compatibilidad con endpoints. No compite con modelos comerciales ni con la mayoría de modelos open source de su rango de tamaño, y carece de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (no se especifican mas detalles) |
| Parametros totales | 124.278.528 (~124,28 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | F16 (GGUF); no se documentan otras |
| Idiomas soportados | en (ingles) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | GGUF (repo de 0,2 GB); se reportan parametros en safetensors |

## Arquitectura y entrenamiento

La informacion disponible indica unicamente que se trata de un modelo transformer decoder-only entrenado desde cero (`from-scratch`), sin que la model card detalle el numero de capas, dimensiones ocultas, numero de cabezas de atencion ni la funcion de activacion empleada. Tampoco se especifica si utiliza atencion multi-cabeza clasica, GQA o MQA, ni si incorpora alguna innovacion como atencion lineal o decodificacion especulativa. El contexto maximo declarado es de 2.048 tokens.

En cuanto a los datos de entrenamiento, no se publica el numero de tokens procesados, la composicion del dataset ni si hubo fases de ajuste supervisado, RLHF o DPO. La model card remite a un fichero `ATTRIBUTION.md` para los creditos del dataset, pero no se incluye su contenido en la informacion proporcionada. El autor califica explicitamente el resultado como un experimento temprano de entrenamiento con respuestas erroneas y sin sentido, lo que sugiere un checkpoint intermedio mas que un modelo finalizado.

## Capacidades

- Generacion de texto conversacional basica, segun el tag `conversational` del repositorio.
- Entrenado unicamente en ingles; no se declara soporte multilingue.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, vision, audio ni capacidades multimodales.
- No se documenta capacidad destacada de codigo ni matematicas.
- El propio autor advierte de que las respuestas pueden ser incorrectas o carentes de sentido, por lo que ninguna capacidad debe asumirse fiable.

## Casos de uso

- Experimentacion educativa sobre entrenamiento desde cero: el modelo sirve para estudiar como evoluciona un checkpoint intermedio de 124 M de parametros y comparar su comportamiento con el de modelos ya alineados.
- Pruebas de infraestructura de inferencia GGUF: al ser un fichero F16 de 0,2 GB, permite validar pipelines de carga y ejecucion en llama.cpp u otros runners compatibles con GGUF sin coste de recursos.
- Verificacion de integracion con endpoints compatibles: el tag `endpoints_compatible` permite comprobar el despliegue de un modelo pequeño en infraestructura de inferencia gestionada.
- Reproduccion de experimentos de tokenizacion y preentrenamiento: util como referencia para comparar curvas de perdida o comportamiento de modelos de escala similar entrenados desde cero.
- Docencia sobre limitaciones de modelos no alineados: ejemplifica de forma directa los fallos tipicos (alucinacion, incoherencia) de un modelo sin ajuste fino supervisado.
- Base para fine-tuning controlado en entornos de investigacion: su tamano reducido permite experimentar con tecnicas de ajuste en una sola GPU consumer, siempre asumiendo la baja calidad de partida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en F16: aproximadamente 0,25 GB solo para los pesos (124,28 M de parametros a 2 bytes), mas overhead de contexto y runtime; en la practica cabe holgadamente en cualquier GPU con 1 GB o mas.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1650, RTX 3060, RTX 4090) e incluso CPU; no requiere A100 ni H100.
- Cabe en GPU consumer: si, en practicamente todas, incluidas GPUs integradas con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia gestionados. No se documenta soporte especifico de vLLM o TGI.
- Latencia y throughput estimados: no disponibles; por el tamano del modelo se espera un throughput alto en hardware consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| pumpkn-4 | ~124,28 M | 2.048 | CC BY-SA 4.0 | Experimental, sin benchmarks |
| GPT-2 small | 124 M | 1.024 | MIT (pesos OpenAI) | Modelo de referencia ampliamente evaluado |
| SmolLM-135M | 135 M | 2.048 | Apache 2.0 | Entrenado y alineado, con benchmarks publicados |
| Qwen2.5-0.5B | ~494 M | 32.768 | Apache 2.0 | Modelo pequeno de produccion con benchmarks |

La comparacion se limita a parametros, contexto y licencia, ya que pumpkn-4 no publica resultados de evaluacion. Frente a GPT-2 small y SmolLM-135M, de escala similar, pumpkn-4 carece de datos de rendimiento y de procesos de alineacion documentados, y su licencia CC BY-SA 4.0 impone condiciones de compartir igual que no aplican en las alternativas Apache 2.0 o MIT.

## Limitaciones y advertencias

- Calidad muy baja declarada por el propio autor: "absolute garbage", con respuestas erroneas y sinsentidos esperables.
- Riesgo alto de alucinacion e incoherencia por tratarse de un checkpoint temprano de entrenamiento sin alineacion documentada.
- Contexto limitado a 2.048 tokens, insuficiente para tareas de contexto largo.
- Solo soporta ingles; no hay capacidades multilingues declaradas.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribucion y a compartir las obras derivadas bajo la misma licencia, lo que puede ser incompatible con productos propietarios.
- Ausencia total de benchmarks y de documentacion sobre datos de entrenamiento, lo que impide evaluar sesgos de forma rigurosa.
- No apto para produccion ni para tareas que requieran fiabilidad; su uso debe restringirse a experimentacion e investigacion.

## Enlaces

- Hugging Face: https://huggingface.co/FatalMistake02/pumpkn-4
- Fichero de atribucion de dataset referenciado en la model card: ATTRIBUTION.md (incluido en el repositorio, contenido no disponible en la informacion proporcionada)
