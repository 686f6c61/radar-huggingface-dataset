# diablomike20/North-Mini-Code-1.0-Uncensored-Heretic-i1-GGUF

## Resumen

North-Mini-Code-1.0-Uncensored-Heretic-i1-GGUF es una cuantizacion en formato GGUF del modelo OS-Software/North-Mini-Code-1.0-Uncensored-Heretic, publicada por el usuario diablomike20. El modelo base es una variante "uncensored" y "abliterated" (eliminacion de la capa de rechazo) de un modelo orientado a codigo, chat y agentes, con un total de 30.484.303.872 parametros segun los pesos en safetensors. La model card indica que las cuantizaciones fueron generadas por mradermacher con tecnicas de imatrix y quantize_version 2, y que existen variantes estaticas en un repositorio paralelo.

El interes de esta publicacion reside en ofrecer el modelo en multiples niveles de cuantizacion GGUF (desde IQ1_S de 6,6 GB hasta Q6_K), lo que permite desplegarlo en hardware muy diverso, desde GPUs de consumo con poca VRAM hasta estaciones de trabajo. El modelo esta etiquetado para casos de uso de generacion de codigo, conversacion y agentes, y su naturaleza "abliterated" implica que se han eliminado los mecanismos de rechazo del modelo original, lo que condiciona su uso responsable.

La licencia declarada es Apache 2.0 y el unico idioma soportado segun la metadata es el ingles. No se dispone de informacion publica sobre arquitectura interna, contexto, datos de entrenamiento ni benchmarks en la informacion proporcionada, por lo que muchos apartados tecnicos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, sin confirmar en la informacion) |
| Parametros totales | 30.484.303.872 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (segun model card) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base en la documentacion proporcionada. El nombre y las etiquetas sugieren un transformer decoder-only orientado a codigo y agentes, pero no se confirma el tipo de atencion, el numero de capas ni la dimension oculta. El recuento de parametros (aproximadamente 30,5 mil millones) es coherente con un modelo denso de escala 30B, aunque no se puede descartar una arquitectura MoE sin datos adicionales.

Respecto al entrenamiento, la model card no detalla el numero de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO. Las etiquetas "heretic", "uncensored", "decensored" y "abliterated" indican que el modelo base ha sido modificado para eliminar o reducir los comportamientos de rechazo, presumiblemente mediante tecnicas de abliteration sobre las direcciones de activacion asociadas al rechazo. No se especifica la metodologia exacta ni el impacto sobre capacidades. Las cuantizaciones i1 se generaron con imatrix y quantize_version 2, lo que sugiere un proceso de calibracion con datos representativos para mejorar la calidad de las cuantizaciones de baja precision.

## Capacidades

- Generacion de texto conversacional en ingles, segun las etiquetas "conversational" y "chat".
- Generacion y asistencia de codigo, segun la etiqueta "code".
- Soporte para flujos de agente, segun la etiqueta "agent".
- Comportamiento sin rechazo (abliterated/uncensored), lo que implica que no aplica filtros de contenido en las respuestas.
- Compatibilidad con endpoints (etiqueta "endpoints_compatible").
- Capacidades multilingues: limitadas al ingles segun la metadata.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Modo thinking, vision o audio: no disponible en la informacion.

## Casos de uso

- Asistente de programacion local: el modelo puede desplegarse con llama.cpp u Ollama en formato GGUF y utilizarse para autocompletar, explicar y refactorizar codigo en entornos sin conexion, aprovechando las cuantizaciones Q4_K_M (18,7 GB) o IQ4_XS (16,5 GB) para GPUs de consumo con 24 GB de VRAM.
- Generacion de codigo en pipelines internos: al estar disponible en GGUF y con licencia Apache 2.0, puede integrarse en herramientas de CI/CD o scripts de automatizacion para generar tests, documentacion o parches, siempre que el equipo asuma la ausencia de filtros de seguridad.
- Chat tecnico sin restricciones de contenido: util en entornos de investigacion donde se necesita explorar respuestas sin rechazos, por ejemplo en estudios sobre comportamiento de modelos o red teaming controlado.
- Agentes de automatizacion de tareas: la etiqueta "agent" sugiere uso en bucles de razonamiento multi-paso, aunque la ausencia de datos sobre tool calling obliga a validar esta capacidad empiricamente antes de produccion.
- Despliegue en hardware limitado: las cuantizaciones IQ2 e IQ3 (entre 8,3 y 13,7 GB) permiten ejecutar el modelo en GPUs de 12-16 GB o en CPU con RAM suficiente, a costa de perdida de calidad.
- Prototipado rapido de asistentes conversacionales: con Q4_K_S (17,6 GB) se obtiene un equilibrio razonable entre tamano, velocidad y calidad para demos y pruebas de concepto en ingles.
- Fine-tuning o experimentacion sobre el modelo base: el repositorio original en safetensors (30,5B parametros) puede servir como punto de partida para ajustes, aunque el tamano requiere hardware de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6,6 GB (IQ1_S) hasta 21,8 GB (Q5_K_M); la variante Q6_K no se detalla en el fragmento disponible pero seria superior a 22 GB.
- Cuantizaciones recomendadas por el autor: Q4_K_M (18,7 GB) como "fast, recommended" y Q4_K_S (17,6 GB) como "optimal size/speed/quality".
- GPU recomendadas: no disponibles de forma explicita; por tamano, una RTX 4090 (24 GB) puede alojar Q4_K_M, Q5_K_M e IQ4_XS; una RTX 3090 (24 GB) es equivalente; GPUs de 16 GB (RTX 4080, 4060 Ti 16GB) quedan limitadas a IQ3_M o IQ3_S; GPUs de 12 GB solo admiten IQ2 o Q2_K con calidad reducida.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con cuantizaciones Q4/Q5; en GPUs de 12-16 GB con cuantizaciones IQ2/IQ3.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; la etiqueta "endpoints_compatible" sugiere integracion con servidores de endpoints. vLLM y TGI no estan confirmados para este formato.
- Latencia y throughput: no disponibles en la informacion.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones del modelo base que permitan una comparativa rigurosa. Como referencia estructural, se puede comparar con otras cuantizaciones GGUF de modelos densos de aproximadamente 30B, pero sin cifras de benchmarks no es posible establecer una comparacion cuantitativa.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| North-Mini-Code-1.0-Uncensored-Heretic-i1-GGUF | 30,5B | no disponible | Apache 2.0 | GGUF | Variante abliterated, solo ingles |
| Modelo base OS-Software/North-Mini-Code-1.0-Uncensored-Heretic | 30,5B | no disponible | Apache 2.0 | safetensors | Origen de las cuantizaciones |
| Cuantizaciones estaticas mradermacher/North-Mini-Code-1.0-Uncensored-Heretic-GGUF | 30,5B | no disponible | Apache 2.0 | GGUF | Alternativa sin imatrix |
| Otros modelos densos ~30B | no disponible | no disponible | no disponible | no disponible | Sin datos comparables en la informacion |

## Limitaciones y advertencias

- Modelo "abliterated" y "uncensored": se ha eliminado o reducido el mecanismo de rechazo, por lo que puede generar contenido inapropiado, peligroso o ilegal sin filtros. No es apto para aplicaciones de cara al publico sin una capa de moderacion externa.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad; como todo modelo generativo, puede producir codigo incorrecto o afirmaciones falsas con alta confianza.
- Idioma: solo se declara soporte de ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Contexto: se desconoce la longitud de contexto soportada, lo que impide planificar casos de uso con documentos largos.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de filtros de seguridad traslada al desplegador la responsabilidad legal y etica del contenido generado.
- Calidad de cuantizaciones extremas: el propio autor advierte que IQ1_S es "for the desperate" y Q2_K_S es "very low quality"; no deben usarse en produccion.
- Falta de datos de entrenamiento y benchmarks: imposibilita evaluar sesgos, robustez y rendimiento real frente a alternativas.
- Fecha de creacion futura en la metadata (2026-10-31): conviene verificar la procedencia y autenticidad del repositorio antes de desplegarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/diablomike20/North-Mini-Code-1.0-Uncensored-Heretic-i1-GGUF
- Modelo base: https://huggingface.co/OS-Software/North-Mini-Code-1.0-Uncensored-Heretic
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/North-Mini-Code-1.0-Uncensored-Heretic-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#North-Mini-Code-1.0-Uncensored-Heretic-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
