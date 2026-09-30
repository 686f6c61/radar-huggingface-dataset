# smolnikov/ameli

## Resumen

Ameli es un modelo de lenguaje en desarrollo orientado a tareas agénticas y "Russian-first", es decir, disenado para razonar, invocar herramientas y completar flujos de trabajo multi-paso con el ruso como idioma principal y el ingles como secundario. Lo desarrolla Smolnikov / CapyAgent, y su propuesta diferencial es el despliegue local en servidores del propio cliente ("on-premises"), de modo que los datos no salen de la infraestructura del usuario. El repositorio de HuggingFace (smolnikov/ameli) tiene 0 descargas y 0 likes en el momento de redactar esta ficha.

El estado del proyecto es claramente pre-lanzamiento: la propia model card indica que los pesos "aun no estan publicados" y que el modelo esta en desarrollo. Esto significa que no hay artefactos descargables, no hay datos de arquitectura, no hay numero de parametros, no hay longitud de contexto declarada y no hay resultados de benchmarks. Cualquier evaluacion cuantitativa es, hoy, imposible.

La relevancia actual es por tanto de tipo direccional mas que practica: se enmarca en la tendencia de modelos compactos especializados en agentes y tool calling, y en el hueco de modelos agenticos nativos para ruso, un idioma comparativamente desatendido frente al ingles o el chino. El autor lo situa junto a dos modelos hermanos de "decisiones rapidas": Kivok (0,3B) y Migom (2B), con un repositorio de codigo publico en GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ruso (principal) e ingles |
| Licencia | no disponible |
| Formato de pesos | no disponible (los pesos no estan publicados) |

Datos adicionales del repositorio: autor smolnikov, pipeline no disponible, 0 descargas, 0 likes, fecha de creacion 2026-09-29 y ultima actualizacion 2026-09-29. Etiquetas declaradas: agent, tool-use, russian, ru, en.

## Arquitectura y entrenamiento

No hay informacion publica sobre la arquitectura del modelo. La model card no menciona si se trata de un transformer denso, un transformer con mezcla de expertos (MoE), una arquitectura hibrida con space-state models (SSM) o cualquier otra variante. Tampoco se especifica el numero de parametros, el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o variantes de aprendizaje por preferencias.

Lo unico que se puede afirmar con certeza es el objetivo funcional declarado: razonamiento, uso de herramientas y resolucion de tareas multi-paso. El caracter "Russian-first" sugiere un esfuerzo deliberado de curacion de datos en ruso, pero no se ofrece ningun detalle sobre el corpus. Los modelos hermanos Kivok (0,3B) y Migom (2B) se describen como "modelos de decisiones rapidas", lo que apunta a una familia con separacion de roles entre un modelo pequeno y rapido y otro de mayor capacidad, pero no se confirma que Ameli comparta esa arquitectura ni que exista un pipeline de destilacion o enrutado entre ellos.

## Capacidades

- Generacion de texto con foco en ruso como idioma primario, segun la propia descripcion del modelo.
- Razonamiento multi-paso orientado a completar tareas de principio a fin.
- Tool calling / function calling, explicitamente citado en la model card y reforzado por la etiqueta "tool-use".
- Uso en flujos agénticos (tag "agent"), con capacidad declarada de encadenar acciones.
- Despliegue on-premises, con la promesa de que los datos no abandonan el servidor del cliente.
- Capacidades multilingues limitadas a ruso e ingles segun los metadatos del repositorio.
- Capacidades de vision, audio, thinking mode explicito o decodificacion especulativa: no disponible.

Advertencia importante: todas estas capacidades son declaraciones de intencion del autor, no capacidades verificadas. Al no existir pesos publicados, ninguna de ellas puede reproducirse ni auditarse.

## Casos de uso

- Agentes internos de empresa en entornos con requisitos de soberania del dato: al ejecutarse on-premises, el modelo encajaria en organizaciones rusoparlantes que no pueden enviar informacion a APIs de terceros. La idoneidad es teorica mientras no haya pesos.
- Automatizacion de atencion al cliente en ruso: un modelo agentico con tool calling podria consultar sistemas de ticketing o bases de conocimiento y resolver consultas multi-turno. Requiere validacion de contexto y calidad, hoy inexistentes.
- Orquestacion de herramientas en back-office: por ejemplo, encadenar llamadas a una API de facturacion, otra de inventario y otra de envio para cerrar un pedido completo dentro de un flujo multi-paso.
- Extraccion y normalizacion de datos en pipelines documentales: combinado con herramientas de parsing, podria leer documentos en ruso y estructurar la salida en un esquema definido.
- Asistentes de desarrollo para equipos rusoparlantes: generacion y refactorizacion de codigo con invocacion de herramientas de repositorio, siempre que el rendimiento en codigo se demuestre.
- Investigacion en agentes de bajo coste para idiomas no ingleses: el modelo, junto con Kivok y Migom, puede servir como objeto de estudio de estrategias de especializacion linguistica en tareas agenticas.
- Base para un asistente conversacional local en escritorio o intranet, sustituyendo a modelos generalistas hospedados en la nube cuando la latencia de red o la confidencialidad sean criticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No hay datos de MMLU, HumanEval, GSM8K, MGSM ni de ninguna evaluacion especifica de tool calling o agentes. Tampoco hay comparaciones con modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al no conocerse el numero de parametros ni la arquitectura, no es posible calcular una cifra fiable.
- Estimacion condicional orientativa: si Ameli se situase en el rango de sus modelos hermanos (0,3B a 2B, o hasta 4B en el caso de migom-4b), un modelo denso de 2B en FP16 requeriria del orden de 4-5 GB de VRAM solo para pesos, mas el coste del contexto y del runtime; en cuantizacion de 4 bits bajaría aproximadamente a 1,5-2 GB. Estas cifras son extrapolaciones de rango, no especificaciones del modelo.
- GPU recomendadas: no disponible. En el escenario anterior, una RTX 3060 de 12 GB o superior seria suficiente para modelos de 2-4B cuantizados, y una RTX 4090 o A100/H100 serian sobredimensionadas salvo para lotes grandes o contextos muy largos.
- Compatibilidad con GPU de consumo: no confirmada, aunque plausible si el modelo es de menos de 4B parametros.
- Opciones de despliegue: no disponible. Al no haberse publicado pesos ni formatos, no se puede confirmar soporte para vLLM, llama.cpp, Ollama, TGI, Transformers ni ninguna otra via.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Pesos publicados |
|---|---|---|---|---|---|
| smolnikov/ameli | no disponible | no disponible | ru, en | no disponible | No |
| smolnikov/kivok-0.3b | 0,3B (segun nomenclatura) | no disponible | no disponible | no disponible | no disponible |
| smolnikov/migom-2b | 2B (segun nomenclatura) | no disponible | no disponible | no disponible | no disponible |
| smolnikov/migom-4b | 4B (segun nomenclatura) | no disponible | no disponible | no disponible | repositorio existente en HuggingFace |

Los tres modelos de comparacion pertenecen al mismo autor y forman parte de la misma familia declarada; no se dispone de sus fichas tecnicas completas en la informacion proporcionada, por lo que los tamanos indicados proceden unicamente de la nomenclatura de sus identificadores. No se han identificado modelos de terceros directamente comparables en el segmento de agentes Russian-first en la informacion disponible.

## Limitaciones y advertencias

- Pesos no publicados: el modelo no es usable. No existe checkpoint descargable, por lo que no se puede hacer inferencia, evaluacion ni integracion.
- Ausencia total de datos tecnicos: sin parametros, contexto, licencia ni formato de pesos, es imposible planificar su despliegue o estimar costes.
- Licencia indeterminada: al no declararse licencia, no se puede asumir ningun permiso de uso comercial. En ausencia de licencia explicita, el uso comercial no esta autorizado de forma clara.
- Riesgo de alucinacion: no evaluable, pero es un riesgo estructural en cualquier modelo agentico sin benchmarks publicados, especialmente critico cuando el modelo invoca herramientas con efectos reales (pagos, envios, escritura en bases de datos).
- Cobertura linguistica limitada: ruso e ingles unicamente, segun los metadatos. El castellano no esta soportado de forma declarada, por lo que el rendimiento en espanol seria impredecible.
- Sesgos: no evaluables. No hay informacion sobre composicion del corpus ni sobre procesos de alineacion o mitigacion de sesgos.
- Estado "work in progress": la propia model card lo califica como modelo en desarrollo, lo que implica cambios de API, comportamiento y objetivos sin aviso.
- Confusion de nombre: existen repositorios no relacionados con este modelo bajo el nombre "ameli" o "amelie" en plataformas de generacion de imagenes (Tensor.Art, SeaArt) y comparadores de modelos generativos (AliveAI). No guardan relacion con el modelo de lenguaje de Smolnikov y no deben tomarse como material de referencia.
- Fechas del repositorio: la fecha de creacion y actualizacion indicada (2026-09-29) resulta anomala respecto a la fecha de consulta; conviene verificar el estado real del repositorio antes de cualquier uso.

## Enlaces

- HuggingFace (modelo): https://huggingface.co/smolnikov/ameli
- Repositorio de codigo: https://github.com/smolnikov-k/ameli
- Modelo hermano Kivok 0.3B: https://huggingface.co/smolnikov/kivok-0.3b
- Modelo hermano Migom 2B: https://huggingface.co/smolnikov/migom-2b
- Modelo hermano Migom 4B: https://huggingface.co/smolnikov/migom-4b
- Perfil de GitHub del autor: https://github.com/smolnikov-ai
- Referencias no relacionadas (mismo nombre, distinto dominio): https://tensor.art/models/848910989383515441 y https://www.seaart.ai/models/detail/d621m1le878c73bsfrl0
