# jsantillana/Qwen3.8-27B-abliterated-v3-GGUF

## Resumen

Qwen3.8-27B-abliterated-v3-GGUF es una distribucion en formato GGUF de un modelo derivado de la familia Qwen3, publicado por el usuario jsantillana. El modelo base declarado tiene 27.320.697.856 parametros (aproximadamente 27,3 mil millones) y se distribuye como una version "abliterated", es decir, con las direcciones de rechazo del modelo original suprimidas mediante una tecnica de ablacion de direcciones en el espacio de activaciones. El repositorio contiene unicamente pesos cuantizados en GGUF, pensados para inferencia local con llama.cpp y herramientas compatibles.

La relevancia de esta ficha es acotada y deliberadamente restringida: el autor la etiqueta como material de investigacion en seguridad defensiva, no apto para produccion. La model card reporta una reduccion de la tasa de rechazo (OFF) en ingles del 64,1 % al 10,7 % y en castellano del 32,9 % al 1,3 %, con un 0 % de dano colateral declarado, empleando un metodo que describe como "Rank-2 dual-mode, L28-L63, tapered alpha". Estos datos proceden de la propia model card y no han sido verificados de forma independiente.

El modelo se publica con una licencia denominada apache-2.0-restricted-research, que restringe el uso a investigacion. No se dispone de informacion sobre el modelo base exacto, la composicion del dataset de entrenamiento ni los idiomas soportados mas alla de las referencias al ingles y al castellano en las metricas de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de la familia Qwen3; no se detalla en la informacion proporcionada) |
| Parametros totales | 27.320.697.856 (aproximadamente 27,3 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q3_K_M, Q4_K_M, Q8_0 (GGUF) |
| Idiomas soportados | no disponible (la model card reporta metricas en ingles y castellano) |
| Licencia | apache-2.0-restricted-research |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base. Por el nombre y el tamano (27,3 mil millones de parametros) se infiere que deriva de un transformer de la familia Qwen3, pero la informacion proporcionada no confirma numero de capas, tipo de atencion, dimensiones ocultas ni si emplea mezcla de expertos. Tampoco se detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

La innovacion tecnica declarada es el proceso de abliteration: una intervencion sobre las activaciones internas que reduce la probabilidad de que el modelo emita rechazos ante peticiones que el modelo base denegaria. El autor describe el metodo como "Rank-2 dual-mode, L28-L63, tapered alpha", lo que sugiere una proyeccion de rango 2 aplicada en las capas 28 a 63 con un coeficiente de intensidad decreciente. No se aportan detalles adicionales sobre la implementacion ni sobre el procedimiento de calibracion de las direcciones de rechazo.

## Capacidades

- Generacion de texto conversacional en formato de chat, segun la etiqueta "conversational" del repositorio.
- Reduccion de rechazos ante peticiones que el modelo base denegaria, tanto en ingles como en castellano, segun las metricas declaradas por el autor.
- Uso orientado a investigacion en seguridad defensiva, tal y como declara la model card.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, vision, audio ni modo de pensamiento extendido.
- No se especifican capacidades multilingues mas alla de las metricas en ingles y castellano.

## Casos de uso

- Investigacion en seguridad de modelos: el modelo permite estudiar como responde un sistema abliterated frente a peticiones que el modelo base rechaza, comparando tasas de cumplimiento y de dano colateral en entornos controlados.
- Evaluacion de robustez de filtros: sirve como caso de prueba para medir la eficacia de clasificadores de contenido y guardrails desplegados en pipelines de moderacion.
- Analisis de sesgos y alineacion: la comparacion entre el modelo base y la version abliterated permite aislar el efecto de las direcciones de rechazo sobre el comportamiento general.
- Pruebas de red teaming en laboratorio: con las cuantizaciones Q3_K_M, Q4_K_M y Q8_0 se puede desplegar localmente en maquinas de investigacion para ejecutar baterias de prompts adversarios.
- Estudio de degradacion por cuantizacion: al ofrecer tres niveles de cuantizacion, el repositorio permite medir como afecta la compresion a las tasas de rechazo y a la coherencia en ingles y castellano.
- Docencia y formacion en seguridad de IA: el modelo puede emplearse en cursos y talleres para ilustrar los efectos de la abliteration y las limitaciones de las tecnicas de alineacion actuales.

## Benchmarks y rendimiento

La model card unicamente reporta tasas de rechazo (OFF) antes y despues de la abliteration:

| Metrica | Modelo base | Modelo abliterated | Dano colateral |
|---|---|---|---|
| Tasa de rechazo en ingles (EN:OFF) | 64,1 % | 10,7 % | 0 % |
| Tasa de rechazo en castellano (ES:OFF) | 32,9 % | 1,3 % | 0 % |

No se han publicado resultados de benchmarks de razonamiento, codigo o matematicas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con Q8_0, aproximadamente 29-30 GB solo para pesos; con Q4_K_M, en torno a 16-17 GB; con Q3_K_M, alrededor de 12-13 GB. Estas cifras son estimaciones a partir del numero de parametros y no proceden de mediciones publicadas por el autor.
- GPU recomendadas: para Q8_0, A100 40 GB, H100 o RTX 6000 Ada; para Q4_K_M, RTX 4090 (24 GB) o A6000 (48 GB); para Q3_K_M, GPU consumer de 16 GB o superior.
- Cabe en GPU consumer: si, en configuraciones de 16 GB o mas con cuantizaciones Q3_K_M y Q4_K_M.
- Opciones de despliegue: llama.cpp y cualquier frontend compatible con GGUF (Ollama, LM Studio, KoboldCpp, text-generation-webui). No se garantiza compatibilidad con vLLM o TGI para este repositorio concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-abliterated-v3-GGUF (este) | 27,3 B | no disponible | apache-2.0-restricted-research | GGUF | Abliterated, solo investigacion |
| Modelo base Qwen3 de referencia | no disponible | no disponible | no disponible | no disponible | No se identifica la version exacta |
| Otras variantes abliterated de la familia Qwen | no disponible | no disponible | variable | GGUF / safetensors | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con alternativas concretas de la misma categoria.

## Limitaciones y advertencias

- El modelo ha sido sometido a abliteration, por lo que cumplira peticiones que el modelo base rechaza; la model card lo restringe explicitamente a investigacion en seguridad defensiva y lo declara no apto para produccion.
- La licencia apache-2.0-restricted-research limita el uso a investigacion; no se autoriza el uso comercial segun la denominacion de la licencia.
- El autor declina cualquier responsabilidad por uso indebido.
- Riesgo elevado de generar contenido danino, sesgado o inexacto al haberse eliminado parte de los mecanismos de rechazo.
- Riesgo de alucinacion no cuantificado; no se han publicado evaluaciones de fidelidad factual.
- No se documentan los idiomas soportados ni el comportamiento fuera de ingles y castellano.
- No se especifica la longitud de contexto, lo que impide planificar cargas de trabajo con ventanas largas.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion comunitaria del comportamiento declarado.
- Las cifras de reduccion de rechazo proceden exclusivamente del autor y no han sido replicadas de forma independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jsantillana/Qwen3.8-27B-abliterated-v3-GGUF
- Repositorio padre con model card completa y metodologia: https://huggingface.co/jsantillana/Qwen3.8-27B-abliterated-v3
