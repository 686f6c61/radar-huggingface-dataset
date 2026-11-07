# NifeLab/pib-indic-en-v1

## Resumen

pib-indic-en-v1 es un adaptador LoRA/PEFT para traduccion automatica de hindi a ingles, desarrollado por Nife (NifeLab) sobre el modelo base ai4bharat/indictrans2-indic-en-dist-200M de AI4Bharat. El adaptador se ha afinado especificamente para texto formal y administrativo, y esta disenado para su uso en entornos offline o air-gapped, sin dependencia de APIs externas en el momento de la inferencia.

El modelo base IndicTrans2 es un transformer encoder-decoder de tipo sequence-to-sequence especializado en traduccion entre las 22 lenguas programadas de la India. La variante dist-200M es la version destilada de 200 millones de parametros, lo que la hace especialmente adecuada para despliegues con recursos limitados. El adaptador anade 211,78 millones de parametros en formato safetensors y se distribuye bajo licencia MIT.

La relevancia de este modelo radica en su enfoque: traduccion de documentos administrativos y gubernamentales indios (publicaciones de PIB, webs oficiales) con un modelo pequeno, desplegable en local y con licencia permisiva. Al estar construido como adaptador PEFT, permite reutilizar el modelo base y cargar solo el delta de pesos, reduciendo el coste de almacenamiento y distribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (IndicTrans2, variante destilada dist-200M) con adaptador LoRA/PEFT |
| Parametros totales | 211.780.608 (adaptador); el modelo base dist-200M anade sus propios parametros |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Hindi -> Ingles (validado); el modelo base soporta las 22 lenguas programadas de la India |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base en formato transformers |
| Libreria | peft, transformers |
| Pipeline | translation (text2text-generation) |
| Modelo base | ai4bharat/indictrans2-indic-en-dist-200M |
| Tamano del repo | 0,8 GB |
| Requiere trust_remote_code | Si (por el modelo base) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre IndicTrans2, un transformer encoder-decoder sequence-to-sequence disenado para traduccion multilingue entre lenguas indias. La variante dist-200M es una version destilada del modelo completo, lo que reduce el numero de parametros y el coste computacional a cambio de una ligera perdida de calidad respecto a las variantes mayores. El adaptador LoRA congela los pesos del modelo base y entrena matrices de baja dimension en las capas de atencion y feed-forward, lo que permite un ajuste eficiente en memoria.

El entrenamiento se realizo con PEFT/LoRA sobre datos publicos: publicaciones del Press Information Bureau (PIB) y otras webs gubernamentales publicas, junto con el corpus Samanantar de AI4Bharat (licencia CC0). No se emplearon datos propietarios ni confidenciales. La model card no especifica el numero de tokens de entrenamiento, la configuracion exacta de LoRA (rango, alpha, capas objetivo) ni si se aplicaron tecnicas de RLHF o DPO; estos datos no estan disponibles. El preprocesado y postprocesado recomendado es el de IndicTransToolkit, igual que en los modelos base de IndicTrans2.

## Capacidades

- Traduccion automatica de hindi a ingles, con enfasis en registro formal y administrativo.
- Generacion de texto seq2seq mediante el pipeline `text2text-generation` de transformers.
- Carga como adaptador PEFT sobre el modelo base, permitiendo reutilizar la infraestructura de IndicTrans2.
- Capacidad multilingue heredada del modelo base: IndicTrans2 soporta las 22 lenguas programadas de la India, aunque este adaptador solo ha sido validado para hindi-ingles.
- Ejecucion completamente offline o en entornos air-gapped, sin llamadas a APIs externas.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.

## Casos de uso

- Traduccion de comunicados y notas de prensa gubernamentales: el adaptador se ha afinado sobre publicaciones del PIB y webs oficiales, por lo que es adecuado para convertir comunicados administrativos en hindi a ingles con terminologia institucional consistente.
- Digitalizacion de archivos administrativos: traduccion por lotes de documentos oficiales en hindi a ingles para su indexacion y busqueda en sistemas internos, ejecutandose en local sin enviar datos a terceros.
- Despliegue en entornos air-gapped: organizaciones con requisitos de soberania de datos pueden ejecutar el modelo en infraestructura propia sin conexion externa, algo critico en administraciones publicas.
- Preprocesado para pipelines de NLP: traduccion de corpus hindi a ingles antes de aplicar analisis de sentimiento, extraccion de entidades o clasificacion con modelos entrenados en ingles.
- Prototipado rapido de sistemas de traduccion: al ser un adaptador pequeno (0,8 GB de repo) sobre un modelo de 200M, permite iterar y desplegar en hardware modesto para pruebas de concepto.
- Traduccion asistida con revision humana: generacion de borradores en ingles a partir de originales en hindi para que traductores humanos los revisen y corrijan, reduciendo el tiempo de trabajo en textos administrativos.
- Investigacion en traduccion de bajos recursos: base para experimentos de fine-tuning adicional o comparacion de tecnicas PEFT en pares de lenguas indicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se ha publicado una evaluacion formal de benchmarks para este adaptador y recomienda evaluar sobre datos propios antes de confiar en el.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo base de 200M de parametros mas un adaptador de 211,78M, la inferencia en fp32 requiere aproximadamente 1,7 GB solo para pesos; en fp16 o bf16 se reduce a unos 0,9 GB. Estas cifras son estimaciones a partir del numero de parametros, no datos publicados.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior puede ejecutar el modelo con holgura. Para despliegues en servidor, una T4 o A10 es mas que suficiente.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 4 GB o mas de VRAM, e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: transformers con PEFT (metodo documentado en la model card), y potencialmente vLLM o TGI si se fusionan los pesos del adaptador con el modelo base. llama.cpp/Ollama no estan documentados para este modelo.
- Latencia y throughput: no disponibles. Al ser un modelo de 200M, se espera una latencia baja en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NifeLab/pib-indic-en-v1 | 211,78M (adaptador) + base 200M | no disponible | Hindi -> Ingles (validado) | MIT | Hugging Face (0 descargas) |
| ai4bharat/indictrans2-indic-en-dist-200M | ~200M | no disponible | Indic -> Ingles (22 lenguas) | no disponible en la informacion | Hugging Face (modelo base) |
| ai4bharat/indictrans2-en-indic-dist-200M | ~200M | no disponible | Ingles -> Indic (22 lenguas) | no disponible en la informacion | Hugging Face |
| Helsinki-NLP/opus-mt-hi-en | ~77M | no disponible | Hindi -> Ingles | no disponible en la informacion | Hugging Face |

La comparativa se limita a los modelos mencionados en la informacion disponible. No se dispone de datos de rendimiento comparativo entre estas alternativas para este adaptador concreto.

## Limitaciones y advertencias

- Solo validado para el par hindi-ingles; el resto de pares de lenguas del modelo base no han sido afinados ni validados por Nife.
- Afinado sobre texto formal y administrativo; el rendimiento en dominios alejados de esa distribucion (conversacional, tecnico, literario) puede ser inferior.
- No apto para traduccion de alto riesgo (legal, medico, seguridad) sin revision humana.
- Riesgo de alucinacion y errores de traduccion inherente a los modelos seq2seq; la model card recomienda revision humana para cualquier salida publicable o que guie decisiones.
- Hereda los sesgos del modelo base IndicTrans2 y de los corpus de entrenamiento (PIB, Samanantar).
- No se han publicado evaluaciones formales de calidad ni benchmarks, por lo que no hay garantias cuantificadas de rendimiento.
- Requiere `trust_remote_code=True` para cargar el modelo base, lo que implica ejecutar codigo remoto del repositorio de AI4Bharat.
- La licencia MIT se aplica al adaptador; conviene verificar la licencia del modelo base antes de uso comercial.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NifeLab/pib-indic-en-v1
- Organizacion NifeLab en Hugging Face: https://huggingface.co/NifeLab
- Modelo base IndicTrans2 dist-200M: https://huggingface.co/ai4bharat/indictrans2-indic-en-dist-200M
- Repositorio IndicTrans2 en GitHub: https://github.com/AI4Bharat/IndicTrans2
- Pagina del proyecto Nife: https://nife.io/open-source
- Paper IndicTrans2 (TMLR 2023): https://openreview.net/forum?id=vfT4YuzAYA
