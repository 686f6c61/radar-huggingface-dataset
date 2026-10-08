# Gabriiel/facta-pt-qg-amalia-9b-0626-dpo

## Resumen

FACTA-PT QG AMALIA-9B-0626-DPO es un adaptador QLoRA entrenado sobre el modelo base portugués `amalia-llm/AMALIA-9B-0626-DPO` para una tarea muy concreta dentro del fact-checking automatizado: la generación de preguntas de verificación a partir de un fragmento de afirmación (claim span) y su contexto. Lo publica el usuario Gabriiel (identificador `Gabriiel`) como parte del prototipo FACTA-PT, un sistema de verificación automática de hechos para portugués europeo. No es un modelo completo, sino un adaptador PEFT que debe cargarse junto al modelo base de 9.000 millones de parámetros.

El problema que resuelve es intermedio en la cadena de verificación: dado un claim, el adaptador no dictamina si es verdadero o falso, sino que produce un conjunto de preguntas factuales que representan las necesidades de información necesarias para verificar ese claim. Esas preguntas sirven después para recuperar evidencia externa (retrieval) que alimenta las etapas posteriores del pipeline. Por tanto, su relevancia está acotada al ecosistema FACTA-PT y al procesamiento de lengua portuguesa, no a un uso generalista.

El adaptador tiene un tamaño de repositorio de 0,8 GB, se distribuye en safetensors y se publica bajo licencia Apache 2.0, heredada del modelo base. El entrenamiento se realizó con supervisión procedente del corpus CLEVER y con datos sintéticos generados a partir de claim spans de ClaimPT. Al tratarse de un componente especializado y muy reciente (publicado el 7 de octubre de 2026), cuenta con cero descargas y cero likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base AMALIA-9B); adaptador PEFT tipo LoRA entrenado con QLoRA |
| Parametros totales | 9.000 millones en el modelo base (no disponible el desglose exacto); parametros del adaptador no disponibles |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo base AMALIA-9B-0626-DPO) |
| Tipos de cuantizacion | Entrenamiento en 4 bits (QLoRA); pesos del adaptador en safetensors (precision no especificada); el modelo fusionado admite cuantizacion posterior (GGUF, GPTQ, AWQ) no documentada |
| Idiomas soportados | Portugues europeo (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT); libreria `peft` |

## Arquitectura y entrenamiento

El artefacto publicado no es un modelo independiente, sino un adaptador de bajo rango (LoRA) obtenido mediante QLoRA, es decir, con el modelo base congelado y cuantizado a 4 bits durante el ajuste. El modelo subyacente, `amalia-llm/AMALIA-9B-0626-DPO`, es un transformer decoder-only de aproximadamente 9.000 millones de parametros ya sometido a una fase de DPO, de ahi el sufijo del identificador. Sobre esa base, el adaptador se especializa en una unica tarea generativa: producir preguntas de verificacion de tamano variable a partir de un claim span y su contexto.

Los datos de entrenamiento combinan dos fuentes de supervision: por un lado, ejemplos de generacion de preguntas de verificacion del corpus CLEVER; por otro, supervision sintetica construida a partir de claim spans de ClaimPT. La model card no especifica el numero de tokens de entrenamiento, la composicion exacta del dataset, los hiperparametros de LoRA (rango, alpha, dropout) ni el numero de epocas, por lo que estos datos deben considerarse no disponibles. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o mecanismos de atencion alternativos; el interes tecnico reside en la especializacion de la tarea, no en la arquitectura.

## Capacidades

- Generacion de preguntas de verificacion: dada una afirmacion y su contexto, produce un conjunto variable de preguntas factuales que representan las necesidades de informacion para comprobarla.
- Generacion de texto conversacional: hereda la capacidad generativa del modelo base AMALIA-9B-0626-DPO al que se aplica el adaptador.
- Procesamiento de portugues europeo: el adaptador esta entrenado especificamente para esta variante linguistica.
- Integracion en pipelines de fact-checking: su salida esta pensada como entrada para modulos de recuperacion de evidencia (retrieval) dentro de un sistema mayor.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no, el modelo esta orientado exclusivamente al portugues europeo.
- Capacidades especiales (vision, audio, modo de razonamiento explicito): no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Verificacion de hechos automatizada (pipeline FACTA-PT): el adaptador genera las preguntas de verificacion que el sistema utiliza despues para recuperar evidencia externa sobre un claim. Es su uso previsto principal y para el que fue entrenado y seleccionado.
- Asistencia a redacciones y fact-checkers humanos: dado un fragmento de declaracion politica o publica, el modelo propone la lista de preguntas que un verificador deberia responder antes de emitir un veredicto, acelerando el trabajo de documentacion.
- Preprocesado para motores de busqueda de evidencia: las preguntas generadas pueden convertirse directamente en consultas para un motor de recuperacion (BM25, embeddings) dentro de un sistema de verificacion en portugues.
- Monitorizacion de desinformacion en portugues: integrado en un sistema de vigilancia, puede descomponer afirmaciones virales en preguntas concretas que orienten la busqueda de fuentes oficiales.
- Construccion de datasets de verificacion: la salida del modelo puede emplearse para generar conjuntos de preguntas de referencia que alimenten el entrenamiento o la evaluacion de otros componentes de fact-checking.
- Investigacion en generacion de preguntas (QG): sirve como punto de partida o baseline para experimentos academicos sobre generacion de preguntas orientadas a verificacion en lenguas de bajos recursos como el portugues europeo.
- Analisis de cobertura informativa: identificar que informacion falta para verificar una afirmacion resulta util para detectar lagunas en la cobertura periodistica sobre un tema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el modelo base fusionado con el adaptador:
  - Precisión completa (FP16/BF16): aproximadamente 18 GB de VRAM solo para pesos, mas overhead de activaciones y cache KV.
  - Cuantizacion de 8 bits: aproximadamente 9-10 GB.
  - Cuantizacion de 4 bits: aproximadamente 5-6 GB.
- El adaptador por si solo ocupa 0,8 GB y requiere cargar el modelo base completo para funcionar, por lo que no reduce los requisitos de memoria del modelo de 9B.
- GPU recomendadas: en FP16, una NVIDIA A100 40 GB, H100 o una RTX 4090 (24 GB) pueden alojar el modelo con margen limitado para contextos largos. En cuantizacion de 4 bits cabe en GPUs de consumo como RTX 3090, RTX 4090 o RTX 4080.
- Uso en CPU: posible con llama.cpp u Ollama tras fusionar y convertir el modelo a GGUF, aunque la latencia sera alta.
- Opciones de despliegue: al ser un adaptador PEFT, puede servirse con vLLM o TGI fusionando previamente los pesos, o cargarse dinamicamente con la libreria `peft` sobre transformers. Para cuantizacion en CPU/consumo, se puede exportar a GGUF (llama.cpp, Ollama).
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo ni de latencia en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos directamente comparables en la informacion proporcionada. Este adaptador cubre una tarea muy especifica (generacion de preguntas de verificacion en portugues europeo) dentro del proyecto FACTA-PT, y no se documentan alternativas equivalentes de la misma categoria, tamano o tarea.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gabriiel/facta-pt-qg-amalia-9b-0626-dpo | 9B (base) + adaptador PEFT | no disponible | Generacion de preguntas de verificacion (pt) | Apache 2.0 | HuggingFace |
| amalia-llm/AMALIA-9B-0626-DPO | 9B | no disponible | Generacion de texto general (pt) | Apache 2.0 | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse sobre CLEVER y datos sinteticos de ClaimPT, heredara los sesgos de esas fuentes y los del modelo base.
- Riesgo de alucinacion: la model card advierte de que las preguntas generadas pueden omitir necesidades de informacion relevantes, producir formulaciones redundantes o no preservar toda la informacion contextual necesaria para la verificacion.
- El modelo no predice la veracidad de una afirmacion; solo genera preguntas. No debe utilizarse como verificador autonomo.
- Limitaciones de idioma: el modelo esta orientado exclusivamente al portugues europeo; su rendimiento en otras variantes del portugues o en otros idiomas no esta documentado y previsiblemente sera deficiente.
- Limitaciones de contexto: la longitud de contexto efectiva depende del modelo base y no se especifica en la informacion disponible.
- Restricciones de licencia: el adaptador se distribuye bajo Apache 2.0, lo que permite uso comercial, pero el modelo base tambien es Apache 2.0, por lo que no se anaden restricciones adicionales conocidas. Se recomienda verificar los terminos de los corpus CLEVER y ClaimPT si se reutilizan sus datos.
- Caveat de produccion: al ser un adaptador PEFT, requiere cargar el modelo base completo de 9B; se debe gestionar la fusion o carga dinamica cuidadosamente en entornos de despliegue. Con cero descargas registradas, no existe validacion de la comunidad sobre su comportamiento.
- Ambito de uso acotado: fuera del pipeline FACTA-PT, su utilidad como generador de texto generalista es limitada y probablemente inferior a la del modelo base sin adaptar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Gabriiel/facta-pt-qg-amalia-9b-0626-dpo
- Modelo base AMALIA-9B-0626-DPO: https://huggingface.co/amalia-llm/AMALIA-9B-0626-DPO

Nota: la busqueda web asociada a esta ficha no devolvio resultados relevantes para el modelo (los resultados obtenidos correspondian a aparcamientos del aeropuerto de Toulouse-Blagnac y no guardan relacion con el artefacto), por lo que no se incluyen.
