# ngwgsang/vwen-r4-GGUF

## Resumen

vwen-r4-GGUF es la distribucion en formato GGUF del modelo ngwgsang/vwen-r4, un modelo de lenguaje de 1.006.672.704 parametros (aproximadamente 0,8B en la nomenclatura del autor) especializado en parafrasis en vietnamita, con capacidades adicionales de simplificacion de texto, extraccion de ideas principales (gist), transferencia de estilo y evaluacion de equivalencia semantica. Lo desarrolla Sang Quang Nguyen (usuario ngwgsang) y esta pensado para ejecutarse con llama.cpp y las aplicaciones construidas sobre el, lo que permite desplegarlo en hardware modesto.

El modelo resuelve un problema concreto y acotado: la reescritura controlada de frases en vietnamita manteniendo el significado original, con dos niveles de intensidad definidos por el prompt (`[Mức: thấp]` para reescritura ligera y `[Mức: cao]` para reescritura fuerte). No es un modelo de proposito general, sino una herramienta afinada para tareas de transformacion textual en un unico idioma.

La relevancia de esta version GGUF radica en que facilita el despliegue local del checkpoint original en bfloat16 mediante llama.cpp, con dos cuantizaciones disponibles (BF16 y Q8_0) y una arquitectura hibrida que requiere compilaciones recientes de llama.cpp. El autor advierte explicitamente de que no se han evaluado las versiones cuantizadas y de que no se ofrecen cuantizaciones menores porque los modelos pequenos pierden calidad de forma notable a 4 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion lineal y atencion completa (arquitectura `qwen35` segun llama.cpp) |
| Parametros totales | 1.006.672.704 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (2,0 GB) y Q8_0 (1,1 GB); no se proporcionan cuantizaciones menores |
| Idiomas soportados | vietnamita (vi) |
| Licencia | no disponible (remite a la licencia del modelo base ngwgsang/vwen-r4, que tampoco se detalla en la informacion proporcionada) |
| Formato de pesos | GGUF (generado con `convert_hf_to_gguf.py`, commit `ccd360f`, flag `--no-mtp`) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer hibrida que combina capas de atencion lineal con capas de atencion completa, identificada en llama.cpp como `qwen35`. Segun la model card, el checkpoint afinado no incluye capa de prediccion multi-token (multi-token prediction), motivo por el cual la conversion a GGUF se realizo con el flag `--no-mtp`. Esta arquitectura hibrida exige una compilacion reciente de llama.cpp para funcionar correctamente.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineacion. La model card remite al modelo original para los detalles de tareas, prompts, resultados y limitaciones, pero esos datos no forman parte de la informacion proporcionada. El unico dato de entrenamiento implicito es la especializacion en vietnamita y en tareas de reescritura, simplificacion, gist, transferencia de estilo y juicio de significado.

## Capacidades

- Parafrasis en vietnamita con dos niveles de intensidad controlados mediante prefijos en el prompt: `[Mức: thấp]` (ligera) y `[Mức: cao]` (fuerte, con cambio de lexico y estructura manteniendo el significado).
- Simplificacion de texto en vietnamita.
- Extraccion de ideas principales o resumen gist.
- Transferencia de estilo.
- Evaluacion de equivalencia de significado entre frases (meaning judgement).
- Generacion de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Compatibilidad con la API de endpoints y con el servidor compatible con OpenAI de llama.cpp (`llama-server`).
- No se ha documentado soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido; de hecho, el autor exige desactivar el thinking (`enable_thinking: false`) para reproducir los resultados.

## Casos de uso

- Reescritura de contenido editorial en vietnamita: el modelo permite generar variantes de un mismo parrafo con distinto grado de cambio lexico y sintactico, util para evitar duplicacion en articulos, descripciones de producto o fichas de catalogo.
- Aumento de datos para entrenamiento de modelos de PLN en vietnamita: la parafrasis controlada permite generar pares de frases equivalentes en significado, utiles para tareas de similitud semantica o clasificacion textual.
- Simplificacion de textos tecnicos o administrativos: el modelo puede reformular frases complejas en versiones mas llanas, orientado a accesibilidad o a comunicacion con publico no especializado.
- Verificacion de equivalencia semantica: la tarea de meaning judgement permite comprobar si dos frases en vietnamita dicen lo mismo, como paso de control de calidad en pipelines de traduccion o de reescritura automatica.
- Extraccion de ideas principales: integrado en un flujo de procesamiento de documentos, el modelo puede condensar el mensaje central de un texto antes de pasarlo a otro sistema.
- Transferencia de estilo en comunicacion de marca: adaptar el registro de un texto (formal, cercano, divulgativo) manteniendo el contenido, para campanas o publicaciones en redes.
- Despliegue local en herramientas de escritura: al caber en formato Q8_0 (1,1 GB) y ejecutarse con llama.cpp, puede integrarse en editores o asistentes de escritura que funcionen sin conexion en equipos de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del GGUF indica que todas las puntuaciones del modelo original se midieron sobre el checkpoint en bfloat16 con transformers, y que la cuantizacion Q8_0 no se ha evaluado por separado, aunque se espera que este muy cerca del original.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,0 GB para BF16 y 1,1 GB para Q8_0, segun los tamanos de fichero publicados; hay que anadir el overhead del contexto y del runtime de llama.cpp.
- GPU recomendadas: no se especifican en la informacion proporcionada. Por tamano, cualquier GPU consumer con 4 GB o mas de VRAM deberia poder alojar la version Q8_0.
- Cabe en GPU consumer: si, previsiblemente en practicamente cualquier GPU dedicada moderna e incluso en equipos con graficos integrados que compartan memoria del sistema, dado el reducido tamano del modelo.
- Opciones de despliegue: llama.cpp mediante `llama-server` (con `--jinja`, `--temp 0` y `--chat-template-kwargs '{"enable_thinking": false}'`) y las aplicaciones construidas sobre llama.cpp; compatible con el cliente OpenAI apuntando a `http://localhost:8080/v1`. No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: no disponibles. El autor recomienda decodificacion greedy (`--temp 0`) para reproducir los resultados reportados.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (parafrasis en vietnamita de menos de 1B parametros) ni datos de rendimiento que permitan una comparacion fundamentada.

## Limitaciones y advertencias

- Modelo monoidioma: solo soporta vietnamita (tag `vi`); no se ha documentado capacidad multilingue.
- Requiere un system prompt fijo, thinking desactivado y decodificacion greedy; sin esas condiciones, las salidas no coinciden con los resultados reportados.
- Los prompts de parafrasis deben comenzar obligatoriamente con `[Mức: thấp]` o `[Mức: cao]`; el incumplimiento del formato degrada la calidad de la salida.
- Las cuantizaciones GGUF no han sido evaluadas: todas las metricas del modelo original corresponden al checkpoint bfloat16 con transformers, por lo que el rendimiento real de Q8_0 en produccion no esta verificado.
- No se ofrecen cuantizaciones de 4 bits ni menores, segun el autor porque los modelos pequenos pierden calidad de forma apreciable a esa precision; esto limita el ahorro de memoria en entornos muy restringidos.
- Riesgo de alucinacion y de deriva semantica: en tareas de reescritura con nivel `[Mức: cao]`, el modelo puede alterar matices del significado original; se recomienda validacion automatica o humana en usos sensibles.
- Requiere una compilacion reciente de llama.cpp por la arquitectura hibrida `qwen35`; versiones antiguas pueden no cargar el modelo correctamente.
- Licencia no disponible en la informacion proporcionada: antes de un uso comercial es imprescindible consultar la licencia del modelo base ngwgsang/vwen-r4.
- Sesgos conocidos: no documentados en la informacion disponible.
- Limitaciones de contexto: la longitud de contexto no se especifica, lo que impide planificar su uso en documentos largos sin verificacion previa.
- Modelo de muy baja adopcion (0 descargas y 0 likes en el momento de la consulta) y con articulo asociado aun en preparacion, lo que implica escasa validacion externa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ngwgsang/vwen-r4-GGUF
- Modelo base: https://huggingface.co/ngwgsang/vwen-r4
- Plantillas de prompt del modelo original: https://huggingface.co/ngwgsang/vwen-r4#prompt-templates
- Licencia del modelo original: https://huggingface.co/ngwgsang/vwen-r4#license
- Repositorio GitHub del proyecto: https://github.com/ngwgsang/vwen
