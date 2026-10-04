# LexaryNova/eacp-edge-v1

## Resumen

EACP Capa 0 v1 (también denominado Layer-0 del Invariant Reality Prism, IRP) es un middleware de seguridad perimetral desarrollado por Pablo Octavio Feria Hernández bajo la afiliación LexaryNova IusTech. No es un modelo de lenguaje: no publica pesos, no se ha entrenado con un corpus de texto y no expone una API de generación. Se describe como un proxy determinista *ex-ante* que filtra el tráfico dirigido a infraestructuras de inferencia críticas, con el objetivo de aislarlas de la saturación por agentes autónomos y de vectores de inyección estocástica (prompt injection).

Su propuesta técnica se apoya en una decisión binaria, la Métrica de Soberanía de la Realidad (R_sov = 1), y en un estado inmutable de cierre ante fallos (fail-closed). El control de acceso se implementa mediante el llamado Reality Token, un pulso estructural efímero basado en firmas asimétricas Ed25519, emitido antes de comprometer memoria en el backend. El autor declara la resolución de controles del marco NIST CSF 2.0 (OLIR ID 189) y alineación con la Práctica 5 del perfil TACIP para infraestructuras críticas.

Su relevancia actual es discutible y debe enmarcarse con cautela: el repositorio acumula 0 descargas y 1 like en Hugging Face, no incluye tarjeta de pipeline ni artefactos de modelo, y la única distribución anunciada es una imagen de contenedor Docker publicada en GitHub Container Registry. La ficha que sigue recoge exclusivamente lo que el autor declara; no se han podido verificar de forma independiente ni los mecanismos ni las métricas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible; se describe como proxy perimetral determinista con filtrado binario *ex-ante*, no como red neuronal |
| Parámetros totales | no disponible (no se publican pesos) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (no se distribuyen pesos; el artefacto es una imagen Docker) |
| Idiomas soportados | es, en |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible; el artefacto distribuido es una imagen de contenedor: `ghcr.io/barce89/middleware:v1` |
| Autor | Pablo Octavio Feria Hernández (LexaryNova IusTech) |
| Estándar de referencia | NIST CSF 2.0 OLIR Catalog, ID 189 |
| Idiomas de la documentación | es, en |
| Fecha de creación en Hugging Face | 2026-10-03 (marca temporal futura respecto a la fecha de consulta) |
| Última actualización en Hugging Face | 2026-10-03 |

## Arquitectura y entrenamiento

No existe proceso de entrenamiento. El componente no es un transformer, ni un MoE, ni un modelo de espacio de estados: según la documentación del autor, se trata de un middleware de filtrado que decide de forma binaria antes de que la petición alcance el backend. La lógica declarada se articula en cuatro piezas: (1) la Métrica de Soberanía de la Realidad, con R_sov = 1 como condición de estabilidad absoluta; (2) el Reality Token (RT), un control de acceso *ex-ante* que emite pulsos estructurales efímeros firmados con criptografía asimétrica Ed25519; (3) el descarte inmediato del tráfico sintético espurio generado por agentes autónomos; y (4) el protocolo terminal fail-closed, que provoca un cese lógico inmediato (Nulidad Estructural) cuando la métrica degrada a R_sov < 1.

El autor mapea esos mecanismos a las funciones del NIST CSF 2.0: GOVERN (GV.RM-01, GV.RM-02) para la estabilidad binaria del sistema y el apetito de riesgo bajo tolerancia cero a la desviación lógica; PROTECT (PR.AA-01) para el control de acceso con Ed25519; DETECT (DE.CM-01, DE.CM-09) para el monitoreo perimetral continuo y el aislamiento del entorno de ejecución; y RESPOND (RS.MI-01) para la Nulidad Estructural. No se especifican datos de entrenamiento, composición de dataset, número de tokens, técnicas de RLHF o DPO, ni innovaciones de inferencia como decodificación especulativa o atención lineal, porque el componente no realiza inferencia neuronal.

## Capacidades

- Filtrado perimetral binario *ex-ante* de peticiones dirigidas a infraestructuras de cómputo críticas, antes de comprometer memoria en el backend.
- Emisión y validación de Reality Tokens mediante firmas asimétricas Ed25519.
- Discriminación de tráfico sintético espurio presuntamente generado por agentes autónomos.
- Cese lógico inmediato del servicio ante desviación de la métrica R_sov (protocolo fail-closed).
- Emisión de telemetría nativa mediante la métrica `eacp_estimated_memory_saved_mb`, orientada a cuantificar la memoria RAM preservada en el backend.
- Respuesta por código HTTP: 403 para tráfico descartado y 200 OK para peticiones admitidas.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling, function calling ni capacidades agénticas o de razonamiento multi-paso.
- Soporte multilingüe limitado a la documentación en español e inglés; no se documenta procesamiento semántico de idiomas.

## Casos de uso

- Protección de clústeres de inferencia frente a saturación: el proxy se situaría delante de los servidores de modelos para descartar, según el autor, el 90% del tráfico sintético no autorizado con HTTP 403 antes de consumir memoria o GPU en el backend.
- Mitigación de prompt injection en pasarelas de agentes: al no analizar el contenido semántico, el filtro no detecta inyecciones por su significado, sino que restringe el acceso a peticiones que porten un Reality Token válido. Encaja en arquitecturas donde ya exista un emisor de identidad fiable.
- Puerta de admisión en infraestructura crítica (energía, sanidad, transporte): el mapeo declarado a NIST CSF 2.0 y al perfil TACIP lo orienta a entornos con requisitos de auditoría y trazabilidad, no a aplicaciones de usuario final.
- Cumplimiento y gobernanza algorítmica: sirve como artefacto de evidencia documental para auditorías que exijan controles de las funciones GOVERN, PROTECT, DETECT y RESPOND del marco NIST.
- Aislamiento de entornos de ejecución en pipelines de CI/CD: la distribución como imagen inmutable permite fijar una versión concreta y mitigar alteraciones de la cadena de suministro, ejecutándose como un paso previo a cualquier servicio expuesto.
- Telemetría de ahorro de recursos: integración de `eacp_estimated_memory_saved_mb` en paneles de observabilidad para justificar ante operaciones el coste evitado por el descarte perimetral.
- Despliegue en edge o en segmentos de red aislados: el formato de contenedor Docker (`docker run -p 8080:8080`) permite situarlo en el borde sin depender de aceleradores, aunque el consumo real de recursos no está documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen valores de MMLU, HumanEval, GSM8K ni de ninguna otra prueba de modelos generativos, ya que el componente no es un modelo de lenguaje y no genera texto. Las únicas cifras aportadas por el autor son métricas operativas autoinformadas, sin protocolo de evaluación ni datos brutos:

| Métrica declarada | Valor | Condición indicada |
|---|---|---|
| Tasa de descarte perimetral | 90% del tráfico sintético no autorizado | Respuesta HTTP 403, validación asimétrica ligera en microsegundos |
| Tasa de admisión legítima | 10% de peticiones alineadas vectorialmente | Respuesta HTTP 200 OK hacia los modelos de inferencia |
| Telemetría de memoria | `eacp_estimated_memory_saved_mb` | Indicador expuesto en tiempo real; sin valores publicados |
| Latencia de validación | microsegundos (sin cifra concreta) | Validación asimétrica ligera |
| Throughput | no disponible | no disponible |

## Requisitos de hardware

- VRAM para inferencia: no aplica; el componente no ejecuta inferencia neuronal ni requiere GPU según la documentación disponible.
- GPU recomendadas: no disponible; no se documenta dependencia de CUDA, ROCm ni aceleradores.
- Compatibilidad con GPU de consumo: no aplica al no ser un modelo de inferencia.
- CPU y memoria del contenedor: no disponible; el autor no publica requisitos mínimos ni límites recomendados para la imagen `ghcr.io/barce89/middleware:v1`.
- Opciones de despliegue: exclusivamente contenedor Docker publicado en GitHub Container Registry. No se mencionan vLLM, llama.cpp, Ollama, TGI ni ningún runtime de inferencia.
- Puertos y arranque: `docker run -p 8080:8080 ghcr.io/barce89/middleware:v1`, con el servicio expuesto en el puerto 8080 del contenedor.
- Latencia y throughput: solo se declara latencia de validación en el orden de microsegundos, sin cifra concreta ni metodología; el throughput no está documentado.

## Comparativa con modelos similares

No disponible. En la información proporcionada no se identifican modelos ni componentes comparables con datos verificables. El elemento descrito pertenece a la categoría de guardrails y proxies de seguridad para infraestructuras de IA, pero no se aportan especificaciones, licencias ni métricas de alternativas de esa categoría, y la búsqueda web realizada no devolvió resultados técnicos pertinentes. Cualquier comparación cuantitativa con soluciones de filtrado probabilístico o con clasificadores de seguridad exigiría datos que no están disponibles en este momento.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no ejecuta código ni soporta tool calling. Cualquier uso como modelo conversacional es inviable.
- Ausencia total de artefactos de modelo: el repositorio no contiene pesos, tokenizador, configuración de arquitectura ni pipeline declarado. Las 0 descargas y el único like registrado apuntan a un componente sin adopción ni validación por terceros.
- Métricas no auditables: las tasas del 90% de descarte y del 10% de admisión son afirmaciones del autor sin protocolo experimental, tamaño de muestra, carga de tráfico ni datos brutos publicados.
- Ambigüedad conceptual: se describe un filtrado «binario» pero también una «alineación vectorial» de las peticiones admitidas; no se especifica cómo se calcula esa alineación ni con qué modelo, umbral o representación.
- Riesgo de falso positivo con impacto operativo: un diseño fail-closed implica que una degradación de la métrica detiene el servicio por completo; en producción esto puede provocar caídas totales ante fallos benignos, con la consiguiente denegación de servicio autoinfligida.
- Dependencia de una autoridad de emisión de Reality Tokens: la seguridad del esquema Ed25519 recae íntegramente en la gestión de claves privadas, cuya rotación, custodia y revocación no se documentan.
- Idiomas: solo se declaran español e inglés, y únicamente a nivel de documentación y etiquetas; no hay evidencia de procesamiento lingüístico.
- Restricciones adicionales a la licencia: aunque el repositorio declara apache-2.0, el aviso de certificación del autor condiciona cualquier auditoría o reclamación de alineación con la metodología IRP-189 a la validación estructural y al dictamen formal del organismo certificador de LexaryNova IusTech, lo que introduce una dependencia comercial no cubierta por la licencia del repositorio.
- Inconsistencia temporal: las fechas de creación y actualización del repositorio (2026-10-03) son posteriores a la fecha de consulta, lo que impide tratar los metadatos como fiables.
- Enlaces de referencia no verificables: el borrador IETF `draft-feria-sas-01` se cita apuntando al dominio genérico `ietf.org` y los artículos de SSRN se referencian sin URL directa, por lo que no se ha podido confirmar su existencia ni su contenido.
- Advertencia general para producción: antes de cualquier despliegue real debe exigirse al proveedor el código fuente, el protocolo de pruebas, los resultados brutos de las métricas declaradas y una revisión de seguridad independiente del esquema de tokens.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/LexaryNova/eacp-edge-v1
- ORCID del autor: https://orcid.org/0009-0009-4914-6135
- Imagen de contenedor: `ghcr.io/barce89/middleware:v1` (registro GitHub Container Registry; desplegable con `docker pull`)
- Referencia NIST CSF 2.0 OLIR Catalog, ID 189 (sin URL directa en la información proporcionada)
- Borrador IETF citado: `draft-feria-sas-01` (referenciado únicamente como https://ietf.org, sin enlace directo al documento)
- Documento doctrinal citado: «The Foundational Canon of the Prudential AI Era», SSRN 5784182 (sin URL directa)
- Documento técnico citado: «A Proposed Technical Reference Framework for Structural Admissibility...», SSRN 6133787 (sin URL directa)
- Perfil citado: NIST Trustworthy AI in Critical Infrastructure Profile (TACIP), Práctica 5 (sin URL directa)
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante. Los resultados devueltos correspondían a foros no relacionados con el modelo (psychforums.com), por lo que se descartan como fuentes.
