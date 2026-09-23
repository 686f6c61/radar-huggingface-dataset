# 0arch-io/kisoku-1.6b-preview-GGUF

## Resumen

Kisoku 1.6B Preview GGUF es la distribucion cuantizada en formato GGUF del modelo de chat Kisoku 1.6B Preview, desarrollado desde cero por 0ARCH (0arch.io). Se trata de un modelo denso de 1.600.749.056 parametros (aproximadamente 1,6 mil millones) entrenado especificamente para generacion de texto conversacional, sin partir de un modelo preentrenado de terceros, lo que lo situa en la categoria de modelos pequenos construidos "from scratch". La ficha se publica bajo licencia MIT para los pesos y esta orientada a ejecucion local mediante llama.cpp y Ollama.

El modelo se distribuye en tres cuantizaciones (Q4_K_M de 1,0 GB, Q8_0 de 1,7 GB y F16 de 3,2 GB), lo que permite desplegarlo en equipos de consumo e incluso en CPU. El autor reporta unas 200 tokens por segundo con Q8_0 sobre un Apple M5 Max, una cifra coherente con el tamano reducido del modelo. La ventana de contexto no se especifica en la informacion disponible.

Su relevancia actual radica en tres factores: es un modelo de pesos abiertos con licencia permisiva (MIT), esta etiquetado como "uncensored" (sin filtros de rechazo declarados), y se publica como "preview", es decir, en fase temprana de desarrollo. Para desarrolladores que necesitan un modelo pequeno, ejecutable en local y sin dependencia de APIs externas, este tipo de publicaciones resultan utiles, aunque conviene tratarlo como material experimental dado el escaso historial de validacion (0 descargas y 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo entrenado desde cero; la model card no detalla la arquitectura) |
| Parametros totales | 1.600.749.056 (1,6 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q8_0, F16 |
| Idiomas soportados | en (ingles) |
| Licencia | MIT para los pesos; tokenizer bajo Llama 3.2 Community License |
| Formato de pesos | GGUF (repo original en safetensors como modelo base) |

## Arquitectura y entrenamiento

La informacion disponible no especifica la arquitectura interna del modelo (tipo de transformer, atencion, normalizacion, etc.), mas alla de que se trata de un modelo entrenado desde cero ("from-scratch") por 0ARCH y orientado a generacion de texto conversacional. El repositorio GGUF no incluye detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni la existencia de fases de alineacion como RLHF o DPO. Estos datos podrian estar en la pagina del modelo base (`0arch-io/kisoku-1.6b-preview`), que la model card remite explicitamente para "detalles de entrenamiento, ejemplos y limitaciones".

Un aspecto tecnico si documentado es el formato de chat: la plantilla conversacional esta embebida en el propio fichero GGUF y utiliza marcadores de turno al estilo Llama 3 (`<|start_header_id|>`, `<|eot_id|>`), cerrando cada respuesta con `<|eot_id|>`. El tokenizer empleado es el de Llama 3.2 de Meta, sujeto a la Llama 3.2 Community License. La publicacion incluye los ficheros `template`, `system` y `params` de Ollama, de modo que el formato de chat y los tokens de parada se configuran automaticamente al crear el modelo.

## Capacidades

- Generacion de texto conversacional en ingles: el pipeline declarado es `text-generation` y la etiqueta `conversational` confirma el uso previsto como modelo de chat.
- Modelo base sin ajuste de seguridad declarado: la etiqueta `uncensored` indica que no se han aplicado filtros de rechazo, lo que implica mayor libertad de respuesta y tambien mayor riesgo de contenido inapropiado.
- Ejecucion local: compatible con llama.cpp (`llama-cli -m ... -cnv`) y Ollama, tanto mediante `Modelfile` local como por descarga directa desde Hugging Face.
- Soporte de cuantizacion: tres variantes publicadas que permiten ajustar el equilibrio entre calidad y consumo de memoria.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede servirse a traves de infraestructura de inferencia compatible con el formato HF.
- No hay evidencia en la informacion disponible de soporte de tool calling, function calling, capacidades de agente, vision, audio, modo "thinking" ni razonamiento multi-paso explicito.
- Capacidades multilingues: limitadas al ingles segun el campo `language` de la model card.

## Casos de uso

- Asistente conversacional local sin conexion: el modelo puede ejecutarse integramente en un portatil o equipo de sobremesa mediante Ollama, sin enviar datos a servicios externos. Es adecuado para prototipos de chatbots donde la privacidad del texto es un requisito.
- Generacion de texto en aplicaciones embebidas: con la cuantizacion Q4_K_M (1,0 GB) el modelo cabe en dispositivos con recursos limitados, lo que permite integrarlo en demos de escritorio, herramientas de linea de comandos o prototipos de aplicaciones.
- Experimentacion academica con modelos entrenados desde cero: investigadores interesados en el comportamiento de modelos pequenos entrenados sin inicializacion desde un checkpoint preentrenado pueden usar este modelo como punto de comparacion frente a alternativas como Llama 3.2 1B o Qwen2.5 1.5B.
- Generacion de datos sinteticos en ingles: al no aplicar filtros de rechazo, puede emplearse para producir texto diverso en tareas de aumento de datos, siempre con revision humana posterior y bajo responsabilidad del operador.
- Prototipado rapido de pipelines de inferencia: sirve para validar integraciones con llama.cpp, Ollama o servidores compatibles con la API de OpenAI antes de escalar a modelos mayores, gracias a su bajo coste computacional.
- Simulacion de personajes y dialogos en videojuegos o narrativa interactiva: el modo conversacional con plantilla de turnos embebida facilita mantener un rol concreto mediante el mensaje de sistema, aunque sin garantia de coherencia a largo plazo por la ausencia de datos sobre la ventana de contexto.
- Pruebas de red teaming y evaluacion de sesgos: al estar declarado como "uncensored", es un candidato util para estudiar como se comporta un modelo sin alineacion de seguridad, en entornos controlados y con las salvaguardas adecuadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica cifra de rendimiento aportada por el autor es de aproximadamente 200 tokens por segundo con la cuantizacion Q8_0 sobre un Apple M5 Max, un dato de velocidad de inferencia y no de calidad. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar, ni comparaciones directas con modelos de tamano similar.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,0 GB con Q4_K_M, 1,7 GB con Q8_0 y 3,2 GB con F16, a los que hay que sumar la memoria asociada a la ventana de contexto (no especificada) y al runtime.
- GPU recomendadas: cualquier GPU de consumo con 4 GB o mas de VRAM es suficiente para las cuantizaciones publicadas; no se requiere hardware de centro de datos. El autor valida el funcionamiento en Apple Silicon (M5 Max) con unas 200 tokens por segundo en Q8_0.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU moderna de gama media o alta (por ejemplo, series RTX 3060/4060 en adelante) e incluso en graficas integradas con memoria unificada.
- Ejecucion en CPU: viable gracias al formato GGUF y al reducido numero de parametros, especialmente con Q4_K_M.
- Opciones de despliegue: llama.cpp (cliente `llama-cli` con modo conversacional) y Ollama, tanto mediante `ollama create` con el `Modelfile` incluido como mediante `ollama run hf.co/0arch-io/kisoku-1.6b-preview-GGUF:Q8_0`. La etiqueta `endpoints_compatible` sugiere compatibilidad con motores de inferencia que acepten pesos HF/GGUF, aunque no se detalla cuales.
- Limitacion conocida de despliegue: el autor advierte que, a fecha de septiembre de 2026, algunas versiones de Ollama (incluida la 0.34.2) fallan al descargar modelos de Hugging Face con el error "blocked redirect to a different host"; en ese caso hay que descargar el fichero GGUF y el `Modelfile` manualmente.
- Latencia y throughput: aproximadamente 200 tokens/s con Q8_0 en Apple M5 Max (dato del autor). No hay mediciones publicadas para otras plataformas.

## Comparativa con modelos similares

No existen benchmarks publicados de Kisoku 1.6B Preview, por lo que la comparacion se limita a aspectos de formato, licencia y disponibilidad. Los datos de los modelos alternativos proceden de sus fichas publicas y se incluyen como referencia de categoria, no como resultado de evaluaciones cruzadas.

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento comparado |
|---|---|---|---|---|---|
| Kisoku 1.6B Preview | 1,6 B | no disponible | MIT (pesos) | GGUF, safetensors | no disponible |
| Llama 3.2 1B | ~1,2 B | 128 k (segun ficha publica de Meta) | Llama 3.2 Community License | GGUF, safetensors | no disponible (sin comparacion directa) |
| Qwen2.5 1.5B | ~1,5 B | 32 k (segun ficha publica) | Apache 2.0 | GGUF, safetensors | no disponible (sin comparacion directa) |
| SmolLM2 1.7B | ~1,7 B | 8 k (segun ficha publica) | Apache 2.0 | GGUF, safetensors | no disponible (sin comparacion directa) |

Diferencias destacables: Kisoku comparte orden de magnitud de parametros con estas alternativas, pero se diferencia por su licencia MIT sobre los pesos (mas permisiva que la Llama 3.2 Community License) y por estar etiquetado como "uncensored", una caracteristica que ninguna de las alternativas citadas ofrece de forma declarada. Como contrapartida, carece del ecosistema de evaluaciones, herramientas y soporte comunitario de los modelos de Meta, Alibaba o Hugging Face.

## Limitaciones y advertencias

- Version "preview": el propio autor la etiqueta como publicacion preliminar; no debe considerarse una version estable ni lista para produccion critica.
- Ausencia total de benchmarks: no hay ninguna evaluacion de calidad publicada, lo que impide estimar su rendimiento en tareas de razonamiento, codigo o matematicas.
- Modelo "uncensored": al no aplicar filtros de rechazo, puede generar contenido ofensivo, ilegal, peligroso o factualmente incorrecto sin advertencia. Requiere moderacion externa si se expone a usuarios finales.
- Riesgo de alucinacion: elevado en un modelo de 1,6 B parametros entrenado desde cero y sin datos publicos sobre su dataset o fases de alineacion.
- Sesgos: no hay informacion sobre la composicion del corpus de entrenamiento, por lo que no es posible evaluar sesgos de genero, raza, religion u orientacion politica.
- Limitacion idiomatica: el modelo esta declarado unicamente para ingles; su comportamiento en castellano u otros idiomas no esta documentado y previsiblemente sera deficiente.
- Longitud de contexto desconocida: no se puede garantizar el mantenimiento de coherencia en conversaciones largas ni en tareas de contexto extenso.
- Licencia: los pesos son MIT, lo que permite uso comercial, pero el tokenizer es de Meta y esta sujeto a la Llama 3.2 Community License, con obligaciones adicionales que deben revisarse antes de un despliegue comercial. La model card remite a la pagina del modelo base para las licencias de los datasets, no incluidas en este repositorio.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin comunidad, issues ni soporte conocido.
- Fecha de publicacion atipica: el repositorio aparece creado el 22 de septiembre de 2026, lo que conviene verificar antes de tratarlo como material consolidado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/0arch-io/kisoku-1.6b-preview-GGUF
- Modelo base (safetensors): https://huggingface.co/0arch-io/kisoku-1.6b-preview
- Sitio del autor: https://0arch.io
- Licencia del tokenizer Llama 3.2: https://www.llama.com/llama3_2/license/
- Nota sobre la busqueda web: las consultas realizadas no devolvieron resultados relevantes sobre el modelo (los resultados obtenidos correspondian a sitios de tipografias, foros y noticias sin relacion con Kisoku ni con 0ARCH). No se han localizado papers, blogs tecnicos, repositorios adicionales ni demos asociados a este modelo.
