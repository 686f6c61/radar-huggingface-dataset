# mradermacher/XiYanSQL-QwenCoder-32B-2412-GGUF

## Resumen

XiYanSQL-QwenCoder-32B-2412-GGUF es la distribucion en formato GGUF del modelo XiYanSQL-QwenCoder-32B-2412, desarrollado originalmente por XGenerationLab y cuantizado por mradermacher. Se trata de un modelo especializado en traduccion de lenguaje natural a SQL (NL2SQL o Text-to-SQL), construido sobre una base QwenCoder de 32B parametros. El modelo resuelve el problema de generar consultas SQL correctas y ejecutables a partir de preguntas formuladas en ingles sobre esquemas de bases de datos relacionales.

Con 32.763.876.352 parametros totales, el modelo esta disenado para tareas de generacion de codigo SQL en entornos de analitica de datos, asistentes de BI y automatizacion de consultas. La version GGUF permite su despliegue en infraestructura mas modestas mediante llama.cpp y herramientas compatibles, con un rango de cuantizaciones que va desde Q2_K (12,4 GB) hasta Q8_0 (34,9 GB).

La relevancia actual del modelo radica en la creciente demanda de interfaces en lenguaje natural sobre bases de datos relacionales, un caso de uso critico en herramientas de business intelligence y agentes de datos. La licencia Apache 2.0 facilita su adopcion comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base QwenCoder), no disponible el detalle exacto |
| Parametros totales | 32.763.876.352 (32,8B) |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); disponibles tambien variantes i1/imatrix en repo separado |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura QwenCoder, un transformer decoder-only de 32B parametros optimizado para generacion de codigo. XiYanSQL anade un ajuste fino especifico para la tarea NL2SQL sobre dicha base, orientado a producir consultas SQL sintacticamente correctas y semanticamente alineadas con el esquema de la base de datos. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La version aqui descrita es una cuantizacion estatica (quantize_version 2, output_tensor_quantised 1, convert_type hf) realizada por mradermacher. El autor indica que las cuantizaciones con imatrix (i1) estan disponibles en un repositorio separado y suelen ofrecer mejor calidad que las estaticas de tamano similar. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal en la informacion disponible.

## Capacidades

- Generacion de consultas SQL a partir de preguntas en lenguaje natural (Text-to-SQL / NL2SQL).
- Generacion de codigo en general, heredada de la base QwenCoder.
- Razonamiento sobre esquemas de bases de datos relacionales para mapear entidades y columnas.
- Soporte conversacional (tag `conversational` en Hugging Face).
- Compatibilidad con endpoints (`endpoints_compatible`).
- Capacidades multilingues limitadas al ingles segun la model card.
- No se documenta soporte explicito de tool calling, function calling, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Asistentes de business intelligence: el modelo traduce preguntas de analistas ("cuales fueron las ventas del trimestre pasado por region") a consultas SQL ejecutables sobre el data warehouse, reduciendo la dependencia de conocimiento tecnico de SQL.
- Automatizacion de informes: integrado en pipelines que generan consultas a partir de plantillas en lenguaje natural, permitiendo construir dashboards dinamicos sin intervencion manual.
- Interfaces de chat sobre bases de datos: desplegado con llama.cpp u Ollama, permite a usuarios no tecnicos consultar bases relacionales en lenguaje natural desde una aplicacion web.
- Generacion de migraciones y consultas de mantenimiento: el modelo puede producir sentencias DDL y DML a partir de descripciones, util en tareas de administracion de bases de datos.
- Evaluacion y auditoria de esquemas: dado un esquema y una pregunta, genera la consulta esperada para validar la cobertura de casos de prueba en pipelines de QA de datos.
- Educacion y formacion: sirve como tutor que convierte enunciados en SQL y ayuda a desarrolladores junior a aprender la sintaxis y la logica de consultas complejas.
- Prototipado rapido de agentes de datos: al ser compatible con endpoints y desplegable en GGUF, permite integrarlo en prototipos de agentes que necesitan generar SQL como paso intermedio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 12,4 GB (Q2_K) hasta 34,9 GB (Q8_0) solo para los pesos; anadir overhead de contexto y KV cache.
- GPU recomendadas: A100 40/80 GB o H100 para las cuantizaciones altas (Q6_K, Q8_0) con contexto largo; RTX 4090 (24 GB) para Q4_K_M y Q5_K_M con contexto moderado.
- Cabe en GPU consumer: si, en RTX 4090 (24 GB) con Q4_K_S/Q4_K_M; en GPUs de 16 GB solo con Q2_K/Q3_K_S y contexto reducido. En RTX 3090 (24 GB) comportamiento similar a la 4090.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base puede servirse con vLLM o TGI en formato safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| XiYanSQL-QwenCoder-32B-2412-GGUF | 32,8B | no disponible | Apache 2.0 | GGUF | Especializado NL2SQL, cuantizado por mradermacher |
| XiYanSQL-QwenCoder-32B-2412 (base) | 32,8B | no disponible | Apache 2.0 | safetensors | Modelo original de XGenerationLab |
| Qwen2.5-Coder-32B | 32,8B | no disponible | Apache 2.0 | safetensors, GGUF | Base generalista de codigo, sin ajuste NL2SQL |
| XiYanSQL-QwenCoder-32B-2412-i1-GGUF | 32,8B | no disponible | Apache 2.0 | GGUF (imatrix) | Variante con cuantizacion imatrix del mismo autor |

## Limitaciones y advertencias

- El modelo esta entrenado y evaluado principalmente en ingles; su rendimiento en castellano u otros idiomas no esta documentado y probablemente sea inferior.
- Riesgo de alucinacion: puede generar SQL sintacticamente valido pero semanticamente incorrecto respecto al esquema, especialmente con esquemas grandes o ambiguos.
- No se documenta la longitud de contexto soportada, lo que dificulta planificar su uso con esquemas de bases de datos extensos.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M) pueden degradar notablemente la precision en la generacion de SQL; se recomienda Q4_K_M o superior para produccion.
- Aunque la licencia Apache 2.0 permite uso comercial, conviene verificar las condiciones del modelo base original y de los datos de entrenamiento.
- No hay evidencia en la informacion disponible de soporte para tool calling o agentes multi-paso, por lo que su integracion en pipelines agenticos requiere validacion adicional.
- El repositorio tiene un numero bajo de descargas (245) y likes (2), lo que sugiere poca validacion comunitaria hasta la fecha.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/XiYanSQL-QwenCoder-32B-2412-GGUF
- Modelo base original: https://huggingface.co/XGenerationLab/XiYanSQL-QwenCoder-32B-2412
- Variante imatrix: https://huggingface.co/mradermacher/XiYanSQL-QwenCoder-32B-2412-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#XiYanSQL-QwenCoder-32B-2412-GGUF
- Guia de uso de GGUF (referencia TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
