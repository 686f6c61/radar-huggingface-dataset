# ReadyArt/Swish-26B-A4B

## Resumen

Swish-26B-A4B es un ajuste fino (finetune) del modelo instructivo google/gemma-4-26B-A4B-it, publicado por el usuario ReadyArt en HuggingFace. Se trata de un modelo de generación de texto orientado explicitamente a contenido para adultos y a narrativa de rol: la model card lo etiqueta con `nsfw`, `explicit`, `roleplay`, `ERP`, `Erotic`, `Horror` y `Violence`, ademas de `unaligned`, lo que indica que el autor ha relajado total o parcialmente los filtros de alineamiento del modelo base para permitir tematicas que un modelo instructivo convencional rechazaria.

El dato objetivo disponible es el recuento real de parametros a partir de los tensores en safetensors: 25.805.936.206 parametros (aproximadamente 25,8 mil millones), con un repositorio de 51,6 GB. La nomenclatura «A4B» del nombre y del modelo base sugiere una arquitectura de mezcla de expertos (MoE) con unos 4 mil millones de parametros activos por token, aunque esta cifra no aparece confirmada en la informacion proporcionada. El modelo solo declara soporte para ingles.

La relevancia de esta ficha es limitada y hay que enmarcarla con honestidad: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, no publica resultados de benchmarks y su model card no contiene documentacion tecnica alguna, sino unicamente hojas de estilo CSS para la presentacion de la pagina. Es, por tanto, un modelo sin validacion externa ni evidencia empirica de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base google/gemma-4-26B-A4B-it; la nomenclatura sugiere MoE, sin confirmar) |
| Parametros totales | 25.805.936.206 (25,8 B, dato real de safetensors) |
| Parametros activos | No disponible (la nomenclatura «A4B» sugiere ~4 B activos, sin confirmar) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (no se publican versiones GGUF/AWQ/GPTQ en la informacion consultada) |
| Idiomas soportados | Ingles (unico idioma declarado) |
| Licencia | Apache 2.0 (segun la model card; el modelo base Gemma tiene sus propios terminos) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 51,6 GB |
| Pipeline | text-generation |
| Modelo base | google/gemma-4-26B-A4B-it (relacion: finetune) |
| Etiquetas del autor | nsfw, explicit, roleplay, unaligned, ERP, Erotic, Horror, Violence |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 18 de octubre de 2026 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna. El unico dato estructural es el modelo base declarado, google/gemma-4-26B-A4B-it, un modelo instructivo de la familia Gemma de Google con aproximadamente 26 mil millones de parametros totales. El sufijo «A4B» y el prefijo del nombre de este finetune apuntan a un diseno con un subconjunto reducido de parametros activos por token, pero la informacion proporcionada no confirma ni el numero de expertos, ni el mecanismo de enrutamiento, ni el tipo de atencion empleado.

Tampoco hay datos sobre el proceso de entrenamiento: se desconoce el volumen de tokens, la composicion del dataset (aunque las etiquetas sugieren corpus de rol y narrativa explicita en ingles), si se emplearon tecnicas de RLHF, DPO o simplemente ajuste supervisado, y si hubo etapas de desalineamiento deliberado. La unica evidencia del ajuste son las etiquetas `unaligned`, `nsfw` y `roleplay` de la model card, que no vienen acompanadas de ninguna descripcion metodologica.

## Capacidades

- Generacion de texto conversacional en ingles, con especial enfasis en dialogos multi-turno de rol.
- Escritura de narrativa explicita para adultos (etiquetas `ERP`, `Erotic`).
- Generacion de contenido de terror y violencia (etiquetas `Horror`, `Violence`).
- Comportamiento «unaligned»: menor probabilidad de rechazo ante peticiones que un modelo instructivo estandar bloquearia.
- Hereda, en principio, las capacidades del modelo base Gemma 4 instructivo, aunque no se documenta en que medida el finetune las preserva o degrada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponibles en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles en la informacion proporcionada.
- Multilingueismo: no; solo ingles declarado.

## Casos de uso

- Narrativa interactiva para adultos: el modelo esta ajustado especificamente para mantener personajes y tramas en conversaciones largas de rol explicito, que es exactamente la distribucion sobre la que parece haberse entrenado.
- Motores de rol por turnos en aplicaciones de ficcion: integrable como backend de texto en plataformas de historias interactivas donde se requiera contenido sin censura y en ingles.
- Generacion de ficcion de terror y suspense: las etiquetas `Horror` y `Violence` sugieren tolerancia a descripciones crudas, util en proyectos de ficcion de genero.
- Simulacion de personajes con personalidad persistente: el ajuste conversacional permite mantener un personaje coherente a lo largo de una sesion, siempre que se gestione el contexto desde la aplicacion.
- Prototipado de investigacion sobre alineamiento y desalineamiento: util como caso de estudio de hasta que punto un finetune ligero revierte las salvaguardas de un modelo instructivo, con fines de evaluacion de seguridad.
- Generacion de dialogos para guiones o borradores creativos: apoyo a guionistas que necesiten variantes de escenas de contenido adulto o violento sin restricciones del proveedor.
- Fine-tuning posterior o experimentacion sobre MoE: al publicarse en safetensors y con licencia Apache 2.0 declarada, sirve como punto de partida para ajustes adicionales, con la advertencia de los terminos del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni evaluaciones de calidad de rol, y no hay datos de terceros al respecto (0 descargas y 0 likes en la fecha de consulta).

## Requisitos de hardware

Estimaciones calculadas a partir del recuento real de parametros (25,8 B); el autor no publica requisitos.

- Pesos en BF16/FP16: aproximadamente 51,6 GB solo para los pesos, mas cache KV y overhead. Requiere 64-80 GB de VRAM.
- Pesos en INT8: aproximadamente 26 GB, mas overhead; apunta a unos 32-40 GB de VRAM.
- Pesos en INT4: aproximadamente 13-14 GB, mas overhead; alrededor de 16-20 GB de VRAM.
- GPU recomendadas para BF16: A100 80 GB, H100 80 GB o dos A100 40 GB con tensor parallelism.
- GPU para INT8: A100 40 GB, L40S 48 GB o RTX 6000 Ada 48 GB.
- GPU de consumo: en INT4 cabe en una RTX 4090 (24 GB) o RTX 4080 (16 GB, al limite, con contexto reducido); en BF16 no cabe en ninguna GPU de consumo actual.
- Si la arquitectura es efectivamente MoE con ~4 B activos, el coste de computo por token seria mucho menor que el de un denso de 26 B, pero el requisito de memoria para cargar todos los pesos se mantiene. Dato no confirmado.
- Opciones de despliegue: vLLM o TGI para safetensors en BF16/FP16; llama.cpp u Ollama solo si se generan conversiones GGUF propias, ya que no se publican en el repositorio.
- Latencia y throughput: no disponibles; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ReadyArt/Swish-26B-A4B | 25,8 B (activos no disponibles) | No disponible | Apache 2.0 (declarada) | HuggingFace, 0 descargas | Finetune NSFW/rol sin benchmarks |
| google/gemma-4-26B-A4B-it | ~26 B | No disponible en la informacion | Terminos de uso de Gemma | HuggingFace | Modelo base instructivo, alineado |
| Otras alternativas de rol/ERP de tamano similar | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables en la informacion consultada |

## Limitaciones y advertencias

- Contenido explicito y potencialmente perturbador: el modelo esta disenado para generar material sexual explicito, violencia y terror. No es apto para menores ni para entornos sin control de acceso.
- Ausencia total de validacion: 0 descargas y 0 likes implican que no existe retroalimentacion de la comunidad ni evidencia independiente de calidad o estabilidad.
- Documentacion inexistente: la model card no describe entrenamiento, datos, arquitectura ni uso previsto; solo contiene CSS. Cualquier decision de produccion basada en este repositorio carece de base documental.
- Riesgo de alucinacion: inherente a los modelos de ~26 B y no evaluado en este finetune; el desalineamiento puede aumentar la generacion de afirmaciones no verificadas.
- Sesgos: no documentados. Un corpus de rol explicito en ingles puede reforzar estereotipos de genero y de orientacion sexual, y no hay evaluacion disponible.
- Limitacion idiomatica: solo ingles declarado; el rendimiento en castellano es desconocido y probablemente degradado.
- Contexto desconocido: sin longitud de contexto declarada, no se puede garantizar la coherencia en conversaciones largas.
- Licencia: la model card declara Apache 2.0, pero al derivar de google/gemma-4-26B-A4B-it, los terminos de uso de Gemma podrian aplicar y prevalecer sobre esa declaracion. Conviene verificar antes de un uso comercial.
- Restricciones de plataforma: el contenido NSFW puede incumplir las politicas de uso de proveedores de inferencia en la nube.
- Fecha de creacion futura respecto al momento habitual de consulta (18 de octubre de 2026): conviene verificar la integridad y procedencia real de los pesos antes de cargarlos.
- El sufijo «A4B» no esta confirmado: si finalmente fuera un modelo denso de 26 B, los requisitos de inferencia serian considerablemente mayores de lo que sugiere el nombre.

## Enlaces

- HuggingFace: https://huggingface.co/ReadyArt/Swish-26B-A4B
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Paper, blog, repositorio o demo del finetune: no disponible
- Resultados de la busqueda web: no se han encontrado enlaces relevantes; los resultados obtenidos corresponden a sitios de webcams para adultos y no guardan relacion con el modelo.
