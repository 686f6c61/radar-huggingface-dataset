# faradailab/guard-mica-v0.5

## Resumen

FaradAiGuard Mica v0.5-4B Security Decision SLM es un modelo de lenguaje pequeno (SLM) especializado en la toma de decisiones de seguridad para la gobernanza de herramientas de agentes. Lo desarrolla faradailab como parte de su fabrica de SLM de seguridad FaradAiGuard, y se distribuye como un derivado cuantizado del modelo base mradermacher/Mica-v0.5-4B-GGUF, que a su vez emplea una arquitectura de tipo Qwen como backbone. Con 4.326.350.848 parametros, esta disenado para emitir veredictos binarios (ALLOW o BLOCK) sobre llamadas a herramientas en entornos de agentes, acompanados de una puntuacion de riesgo y una referencia CWE.

El modelo resuelve un problema concreto: interponer una capa de decision rapida y de alta precision ("System 1") entre un agente autonomo y las herramientas o acciones que pretende ejecutar, de modo que las politicas de seguridad se apliquen de forma consistente. Frente a los modelos generalistas, su salida esta restringida mediante una gramatica GBNF a un esquema JSON estricto, lo que facilita su integracion en pipelines automatizados sin necesidad de parseo defensivo.

Su relevancia actual reside en la creciente adopcion de agentes que invocan herramientas externas (ejecucion de codigo, acceso a ficheros, llamadas a API) y en la necesidad de un control determinista y auditable de esas acciones. Se distribuye en formato GGUF con cuantizacion Q4_K_M y esta preparado para ejecutarse directamente con Ollama, lo que reduce la friccion de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con backbone Qwen (modelo base: mradermacher/Mica-v0.5-4B-GGUF) |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (archivo guard-mica-v0.5.Q4_K_M.gguf) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con Modelfile para Ollama) |

## Arquitectura y entrenamiento

El modelo se basa en una arquitectura transformer derivada de la familia Qwen, segun indica el autor en la model card. El artefacto publicado es un derivado cuantizado en GGUF (Q4_K_M) del modelo mradermacher/Mica-v0.5-4B-GGUF, que actua como base. La distribucion incluye un Modelfile que preconfigura el system prompt y una gramatica GBNF que restringe la generacion a un esquema JSON estricto con los campos verdict, risk_score, reason y cwe.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF, DPO u otras etapas de alineacion especificas para la tarea de decision de seguridad. Tampoco se detalla si el ajuste se realizo sobre el modelo base original o sobre la version ya cuantizada. La innovacion tecnica destacable es el uso de decodificacion restringida por gramatica (GBNF) para garantizar salidas validas y parseables, orientada a un caso de uso de enforcement de politicas en agentes.

## Capacidades

- Clasificacion de seguridad de acciones de agentes: emite un veredicto ALLOW o BLOCK sobre llamadas a herramientas y acciones propuestas.
- Puntuacion de riesgo: devuelve un risk_score en el rango 0.0 a 1.0 que cuantifica la peligrosidad de la accion evaluada.
- Justificacion tecnica: genera un campo reason con una explicacion breve de seguridad.
- Mapeo a CWE: incluye un campo cwe con el identificador CWE correspondiente o cadena vacia cuando no aplica.
- Salida JSON estricta: la gramatica GBNF garantiza que la respuesta cumpla siempre el esquema predefinido.
- Integracion con Ollama: ejecucion directa mediante el comando indicado en la model card, sin configuracion local ni compilacion.
- Compatibilidad con endpoints: etiquetado como endpoints_compatible en Hugging Face.
- Gobernanza de herramientas en agentes: pensado para interponerse en el bucle de decision de agentes que invocan herramientas externas.

## Casos de uso

- Gobernanza de llamadas a herramientas en agentes autonomos: el modelo se coloca como paso previo a la ejecucion de cada tool call y devuelve ALLOW o BLOCK con justificacion, permitiendo que el orquestador descarte acciones peligrosas antes de que se ejecuten.
- Ejecucion de codigo generado por LLM: antes de lanzar un fragmento de codigo en un sandbox o en produccion, el modelo evalua la accion y puede bloquearla, adjuntando el CWE relevante (por ejemplo, inyeccion o deserializacion insegura) para trazabilidad.
- Politicas de acceso a ficheros y sistemas: en agentes con capacidad de lectura o escritura sobre el sistema de ficheros, el modelo actua como guardia que decide si la operacion solicitada cumple la politica definida.
- Auditoria y registro de decisiones de seguridad: al devolver siempre JSON estructurado con verdict, risk_score, reason y cwe, las decisiones pueden registrarse y analizarse posteriormente sin transformacion adicional.
- Filtrado en pipelines CI/CD para agentes de desarrollo: integrado en un flujo de integracion continua, el modelo puede evaluar acciones propuestas por agentes de codigo (commits, despliegues, cambios de configuracion) y bloquear las que superen un umbral de riesgo.
- Despliegue en entornos con recursos limitados: al distribuirse como GGUF Q4_K_M y ejecutarse con Ollama, es viable en estaciones de trabajo y servidores modestos, lo que permite desplegar la capa de seguridad cerca del agente sin infraestructura GPU dedicada.
- Enrutamiento de decisiones con umbral de riesgo: el risk_score continuo permite configurar umbrales (por ejemplo, bloquear por encima de 0.7 y derivar a revision humana en la franja intermedia) en lugar de depender solo del veredicto binario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion Q4_K_M y 4.326.350.848 parametros, el peso de los pesos ronda los 2,8 GB (tamano del repositorio), por lo que la inferencia requiere aproximadamente 3 a 5 GB de memoria, dependiendo de la longitud de contexto y del backend.
- GPU recomendadas: no se especifican en la informacion disponible. Por el tamano del modelo, tarjetas consumer como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o superiores deberian albergarlo con holgura en Q4_K_M; tambien es viable en CPU.
- Cabe en GPU consumer: si, segun el tamano del artefacto cuantizado.
- Opciones de despliegue: Ollama es la via documentada por el autor (ollama run hf.co/faradailab/guard-mica-v0.5:latest). Al ser GGUF, tambien es compatible con llama.cpp y otros runtimes GGUF, aunque no se documentan explicitamente.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos comparables en la informacion proporcionada. Como referencia estructural, se puede situar frente a su modelo base y frente a SLM generalistas de tamano similar, pero sin cifras verificables:

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| faradailab/guard-mica-v0.5 | 4.326.350.848 | no disponible | Apache 2.0 | Decision de seguridad con salida JSON estricta |
| mradermacher/Mica-v0.5-4B-GGUF (base) | aproximadamente 4B | no disponible | no disponible | Modelo base cuantizado, sin especializacion de seguridad documentada |
| SLM generalistas de 4B (familia Qwen y similares) | aproximadamente 4B | no disponible | variable | Proposito general, sin gramatica de salida ni veredicto binario |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas alternativas.

## Limitaciones y advertencias

- Alucinacion: como todo modelo generativo, puede producir justificaciones (reason) o identificadores CWE incorrectos aunque la estructura JSON sea valida; el formato estricto no garantiza la correccion semantica del veredicto.
- Ambito restringido: el modelo esta especializado en decision de seguridad de acciones de agentes; no debe emplearse como modelo conversacional general ni como sustituto de un analisis de seguridad completo.
- Idiomas: no se documentan los idiomas soportados, por lo que el comportamiento multilingue es incierto y conviene validarlo antes de usarlo en produccion con entradas no inglesas.
- Contexto: no se especifica la longitud de contexto soportada, lo que limita la planificacion de casos con trazas o prompts largos.
- Datos de evaluacion ausentes: no hay benchmarks publicados ni metricas de precision, recall o falsos positivos sobre el veredicto, imprescindibles para calibrar umbrales en produccion.
- Dependencia del modelo base: hereda los sesgos y limitaciones del modelo base mradermacher/Mica-v0.5-4B-GGUF, cuyas caracteristicas de entrenamiento no se detallan.
- Cuantizacion unica documentada: solo se referencia Q4_K_M, lo que puede implicar una perdida de precision frente a pesos sin cuantizar; no se documentan otras variantes.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de entrenamiento originales antes de un despliegue productivo.
- Madurez: el repositorio registra 40 descargas y 0 likes en el momento de la consulta, lo que sugiere una adopcion temprana y poca validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/faradailab/guard-mica-v0.5
- Repositorio del proyecto FaradAiGuard: https://github.com/kurtfi/FaradAiGuard
- Modelo base: https://huggingface.co/mradermacher/Mica-v0.5-4B-GGUF
