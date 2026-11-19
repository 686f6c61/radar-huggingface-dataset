# anasbiswas/Qwen2.5-3B-Instruct-TwinDistillation

## Resumen

Qwen2.5-3B-Instruct-TwinDistillation es un adaptador LoRA de rango 16 sobre el modelo base Qwen/Qwen2.5-3B-Instruct, desarrollado por Md Anas Biswas. No es un modelo nuevo: modifica los pesos del base mediante un adaptador pequeno (repo de 0,1 GB) para dotarlo de resistencia frente a inyeccion indirecta de prompts, es decir, instrucciones maliciosas incrustadas en documentos que el modelo debe procesar. El objetivo es que el modelo aprenda a distinguir una instruccion legitima del usuario de una instruccion inyectada en el contenido, juzgandola por su origen y no por su forma.

La receta de entrenamiento, denominada twin distillation, se describe en el articulo *Twin Distillation Against Indirect Prompt Injection: Training Language Models to Distinguish User Instructions from Injected Instructions* (Biswas, 2026). El adaptador se entrena en cuatro fases sobre un unico LoRA: destilacion on-policy con pares de prompts atacados y sus gemelos limpios, fase literal, fases de procesamiento y tarea, y fase de turnos falsificados.

El modelo es relevante para quienes despliegan asistentes que leen documentos externos (correo, paginas web, salidas de herramientas) y necesitan mitigar ataques de prompt injection sin cambiar de modelo base. Mantiene intactos los pesos originales de Qwen2.5-3B-Instruct, su plantilla de chat y su tokenizador, anadiendo solo el adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA de rango 16 |
| Parametros totales | 3B (modelo base Qwen2.5-3B-Instruct); el adaptador LoRA anade un numero no especificado de parametros |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Qwen2.5-3B-Instruct) |
| Tipos de cuantizacion | El articulo ejecuto los modelos con el base en 4 bits; bfloat16 indicado como valido para uso |
| Idiomas soportados | en (ingles) |
| Licencia | qwen-research (Qwen Research License; uso de investigacion) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia Qwen2.5, con 3B parametros. Sobre el se aplica un adaptador LoRA de rango 16 que no altera los pesos originales. La innovacion no esta en la arquitectura sino en el procedimiento de entrenamiento: twin distillation, una perdida de destilacion on-policy sobre prompts atacados, cada uno emparejado con un gemelo en el que la misma instruccion proviene del usuario. Asi el modelo aprende a asociar la obediencia al origen de la instruccion, no a su contenido.

El entrenamiento consta de cuatro fases sobre un unico adaptador: destilacion gemela, fase literal (preservar el texto del documento al copiar, contar, listar, editar o traducir), fases de procesamiento y tarea, y fase de turnos falsificados. Los detalles completos de la receta, los datos y los hiperparametros estan en la Seccion 5 y la Tabla 3 del articulo, con codigo en el repositorio picalib-research (notebook 73e y `src/`). El modelo se entreno y evaluo con una unica vuelta de usuario con el formato: frase de tarea, linea en blanco y documento, con el system prompt `You are a helpful assistant that processes the content users give you.`

## Capacidades

- Generacion de texto y resumen de documentos en ingles, con la misma base de Qwen2.5-3B-Instruct.
- Resistencia a inyeccion indirecta de prompts: ignora instrucciones incrustadas en el documento, incluidas las disfrazadas de turno de usuario falso, fin de tarea falso o reclamacion de autoridad.
- Preservacion del contenido del documento: cuando se le pide copiar, contar, listar, editar o traducir, una frase con apariencia de instruccion se trata como texto normal, ni se obedece ni se elimina.
- Capacidad de procesamiento de tareas sobre documentos: resumen, conteo, extraccion, traduccion y edicion, medidas en las tareas de SecFid.
- Lectura de salidas de herramientas como texto (evaluado en AgentDojo).
- Capacidades multilingues: limitadas al ingles segun la model card.
- No se documentan en la informacion disponible capacidades de vision, audio, tool calling nativo ni modo de razonamiento extendido; se heredarian, en su caso, del base Qwen2.5-3B-Instruct, pero no estan verificadas para este adaptador.

## Casos de uso

- Resumen de documentos no confiables: procesar correos, articulos o paginas web que pueden contener instrucciones maliciosas, manteniendo el foco en la tarea del usuario y no en el texto inyectado.
- Extraccion de datos de formularios y PDFs: contar, listar o extraer campos de documentos externos sin que una frase inyectada altere la salida ni se elimine del contenido procesado.
- Traduccion de contenido de terceros: traducir documentos que incluyen frases con forma de instruccion, tratandolas como texto a traducir en lugar de obedecerlas.
- Edicion y reescritura de textos ajenos: corregir o reformatear documentos sin que instrucciones incrustadas modifiquen el resultado ni se borren del original.
- Asistentes que leen salidas de herramientas: interpretar resultados de APIs o agentes como texto, mitigando ataques de inyeccion en esas salidas (evaluado con AgentDojo).
- Evaluacion de seguridad de LLMs: usar el adaptador como linea base o comparador en investigacion sobre defensas frente a prompt injection, junto con el codigo del repositorio picalib-research.
- Filtrado y saneamiento de contenido en pipelines: preprocesar documentos de entrada en un sistema mayor para neutralizar instrucciones inyectadas antes de pasarlos a otro modelo.

## Benchmarks y rendimiento

Resultados publicados en el articulo (Tablas 4 y 13; ficheros de resultados en el commit 08e477d):

| Medida | Este adaptador | Base sin defensa |
|---|---|---|
| Inyecciones BIPIA obedecidas, atacante fijo, 13 redacciones (menor es mejor) | 0,176 | 0,510 |
| Inyecciones BIPIA obedecidas, atacante adaptativo, 13 intentos | 0,000 | 0,748 |
| Inyecciones BIPIA obedecidas, combinado | 0,176 | 0,776 |
| S2 sellado: instrucciones inyectadas nuevas obedecidas (decidido por reglas, 500 filas) | 0,028 | 0,594 |
| S4 sellado: instrucciones propias del usuario obedecidas en documentos nuevos (240; mayor es mejor) | 0,571 | 0,504 |
| Ataque GCG de caja blanca, proporcion de 25 documentos comprometidos | 0,440 | 1,000 |

## Requisitos de hardware

- VRAM estimada: al tratarse de un adaptador LoRA sobre un base de 3B, los requisitos son los del base. En bfloat16, aproximadamente 6-7 GB de VRAM para los pesos; en 4 bits (configuracion usada en el articulo), del orden de 2-3 GB, sin contar el contexto.
- GPU recomendadas: cualquier GPU con al menos 8 GB para bfloat16 (RTX 3060/4060, RTX 4070, RTX 4090); A100 o H100 no son necesarias para este tamano.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en bfloat16 y en tarjetas con 4-6 GB en cuantizacion de 4 bits.
- Opciones de despliegue: transformers con peft (metodo documentado en la model card); el adaptador puede fusionarse con el base para usar vLLM, TGI o llama.cpp/Ollama previa conversion a GGUF, aunque estos flujos no se documentan en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada; la decodificacion codiciosa (greedy) es la configuracion usada en el articulo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Defensa frente a inyeccion indirecta | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-3B-Instruct-TwinDistillation | 3B + LoRA r16 | no disponible | Si (adaptador entrenado; 0,176 BIPIA combinado) | qwen-research | Hugging Face |
| Qwen2.5-3B-Instruct (base) | 3B | no disponible | No (0,776 BIPIA combinado) | qwen-research | Hugging Face |
| Defensas publicadas sobre el mismo base | 3B | no disponible | Si, pero el articulo indica que el atacante GCG las rompe igualmente | qwen-research | no disponible (referenciadas en el articulo) |

No se dispone en la informacion proporcionada de comparaciones con otros adaptadores de seguridad de la misma categoria ni con modelos de mayor tamano; los datos de la tabla se limitan a lo reportado en la model card y el articulo.

## Limitaciones y advertencias

- Un atacante de caja blanca con acceso a los pesos (GCG) sigue comprometiendo el adaptador en el 44 % de 25 documentos; no debe usarse como unica defensa frente a atacantes con los pesos.
- La defensa esta ligada al diseno de prompt con el que se entreno (una vuelta de usuario: tarea, linea en blanco, documento, con el system prompt especificado). Fuera de ese formato su eficacia no esta medida.
- El exito residual frente al atacante fijo proviene mayoritariamente de reescrituras que sustituyen la mayor parte del documento anfitrion (Seccion 7.1 del articulo).
- Solo se realizo una ejecucion de entrenamiento por modelo; el articulo reporta intervalos de confianza para todas las cifras.
- Idioma limitado al ingles; el rendimiento en otros idiomas no esta documentado.
- Licencia qwen-research: restringida a uso de investigacion; el uso comercial requiere revisar los terminos de la Qwen Research License del modelo base.
- Riesgo de alucinacion inherente al modelo base de 3B; el adaptador no corrige esta limitacion.
- No se documentan sesgos especificos en la informacion disponible.
- El adaptador no modifica el resto de capacidades del base; cualquier evaluacion de calidad general debe hacerse sobre el modelo fusionado.

## Enlaces

- Hugging Face: https://huggingface.co/anasbiswas/Qwen2.5-3B-Instruct-TwinDistillation
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia del base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Codigo del articulo: https://github.com/anasbiswas1/picalib-research
- Articulo: Md Anas Biswas. *Twin Distillation Against Indirect Prompt Injection: Training Language Models to Distinguish User Instructions from Injected Instructions*. 2026.
