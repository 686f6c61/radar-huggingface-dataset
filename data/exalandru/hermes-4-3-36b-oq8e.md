# exalandru/Hermes-4.3-36B-oQ8e

## Resumen

Hermes-4.3-36B-oQ8e es una cuantizacion en 8 bits del modelo NousResearch/Hermes-4.3-36B, generada por el usuario exalandru mediante la herramienta oQ (oMLX v0.8.4) con cuantizacion de precision mixta. El resultado es un checkpoint de 36.151 millones de parametros almacenado en aproximadamente 35,77 GiB, con un promedio efectivo de 8,500 bits por peso. El modelo esta pensado para su uso con la libreria MLX, el framework de Apple para ejecutar modelos en silicio de la serie M.

La relevancia de esta ficha radica en que ofrece una via para ejecutar un modelo de 36B en equipos Apple Silicon con memoria unificada, manteniendo una calidad cercana a la del modelo original en BF16 gracias al esquema de cuantizacion de 8 bits con grupos de 64. Al estar basado en Hermes-4.3, hereda las capacidades del modelo original de NousResearch, orientado a instrucciones, razonamiento y uso como agente.

No se dispone de informacion publicada sobre arquitectura detallada, datos de entrenamiento ni benchmarks especificos de esta variante cuantizada mas alla de lo que consta en la model card y los metadatos de Hugging Face. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: NousResearch/Hermes-4.3-36B; pesos en MLX) |
| Parametros totales | 36.151.104.512 (36,151B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits afin con grupo de 64 (99,996% de los pesos); BF16 residual (0,004%); promedio efectivo 8,500 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), 8-bit cuantizado |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo base Hermes-4.3-36B. Los metadatos indican que se trata de un transformer de 36.151 millones de parametros, del que esta variante conserva la estructura pero con los pesos cuantizados. La cuantizacion se realizo con oQ (oMLX v0.8.4) en modo de precision mixta: el 99,996% de los pesos logicos se almacena en formato afin de 8 bits con tamano de grupo 64, mientras que un 0,004% (aproximadamente 0,001B parametros) permanece en BF16. El checkpoint completo ocupa 35,774 GiB en disco (38,412 GB).

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo base uso RLHF, DPO u otras tecnicas de alineacion. Tampoco se documentan innovaciones tecnicas adicionales en esta variante mas alla del esquema de cuantizacion mixta descrito.

## Capacidades

- Generacion de texto e instrucciones: al derivar de Hermes-4.3, se espera que mantenga las capacidades conversacionales y de seguimiento de instrucciones del modelo original, aunque no se documentan explicitamente en la model card.
- Razonamiento y matematicas: no disponible de forma especifica en la informacion proporcionada.
- Generacion de codigo: no disponible de forma especifica en la informacion proporcionada.
- Tool calling / function calling: no disponible de forma especifica en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma especifica en la informacion proporcionada.
- Capacidades multilingues: no disponible; los idiomas soportados no constan en los metadatos.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX y el tamano de 35,77 GiB permiten ejecutar el modelo en Macs con memoria unificada de 48 GB o superior, lo que facilita prototipado y pruebas sin depender de GPU dedicadas.
- Asistentes conversacionales de escritorio: al ser una variante de 8 bits de un modelo de instrucciones de 36B, puede emplearse en aplicaciones de chat locales donde la privacidad de los datos es prioritaria, manteniendo los pesos en el equipo del usuario.
- Evaluacion comparativa de cuantizaciones: investigadores pueden usar este checkpoint para medir la perdida de calidad frente al modelo base en BF16 y frente a otras cuantizaciones (4 bits, 6 bits), dado el detalle de la distribucion de bits documentada.
- Desarrollo de pipelines de agentes en local: si el modelo base conserva las capacidades de tool calling de Hermes, esta variante permitiria probar flujos de agentes en un Mac sin conexion a servicios en la nube.
- Generacion de texto y resumenes en entornos con requisitos de soberania del dato: al ejecutarse localmente y con licencia Apache 2.0, encaja en organizaciones que no pueden enviar datos a APIs externas.
- Fine-tuning y experimentacion con MLX: el formato safetensors cuantizado y la libreria MLX permiten adaptar o evaluar el modelo dentro del ecosistema de Apple para tareas especificas de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el checkpoint ocupa 35,774 GiB en disco; para inferencia en MLX se necesita memoria unificada suficiente para los pesos mas el espacio de activaciones y cache KV. Se estima un minimo practico de 48 GB de memoria unificada, aunque no se documenta una cifra oficial.
- GPU recomendadas: el formato MLX esta orientado a Apple Silicon (series M1, M2, M3, M4 y variantes Pro, Max y Ultra). No se documenta soporte para GPU NVIDIA o AMD en esta variante.
- Compatibilidad con GPU de consumo: en el ecosistema Apple, cabe en equipos con 48 GB o mas de memoria unificada (por ejemplo, Mac Studio con M2 Max o M2 Ultra, o MacBook Pro con M3/M4 Max de 48 GB o superior). No cabe en configuraciones de 16 o 24 GB.
- Opciones de despliegue: libreria MLX (mlx-lm) y la herramienta oMLX. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI para este checkpoint concreto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| exalandru/Hermes-4.3-36B-oQ8e | 36,151B | no disponible | 8 bits (8,500 bits/peso) | Apache 2.0 | safetensors MLX |
| NousResearch/Hermes-4.3-36B | 36,151B | no disponible | BF16 (original) | Apache 2.0 | safetensors |
| Otras cuantizaciones de Hermes-4.3-36B | 36,151B | no disponible | 4 bits / 6 bits (segun variante) | Apache 2.0 | segun variante |

La comparativa se limita al modelo base y a otras variantes cuantizadas del mismo modelo, ya que no se dispone de datos de rendimiento para comparar con modelos de otros autores de tamano similar.

## Limitaciones y advertencias

- La cuantizacion a 8 bits introduce una perdida de precision respecto al modelo original en BF16; no se documenta la magnitud de esa perdida en benchmarks.
- No se dispone de informacion sobre sesgos, tasas de alucinacion ni evaluaciones de seguridad de esta variante ni del modelo base en la informacion proporcionada.
- Los idiomas soportados no estan documentados; no se puede garantizar un rendimiento adecuado fuera del ingles o de los idiomas que maneje el modelo base.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base NousResearch/Hermes-4.3-36B y de los datos de entrenamiento originales antes de desplegarlo en produccion.
- El checkpoint esta en formato MLX y requiere hardware Apple Silicon; no es directamente utilizable en GPUs NVIDIA sin conversion previa.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion comunitaria sobre su calidad o fidelidad al modelo base.
- No se documenta la longitud de contexto soportada, lo que impide planificar casos de uso con ventanas largas.

## Enlaces

- Hugging Face: https://huggingface.co/exalandru/Hermes-4.3-36B-oQ8e
- Modelo base: https://huggingface.co/NousResearch/Hermes-4.3-36B
- Herramienta oQ (oMLX): https://github.com/jundot/omlx
