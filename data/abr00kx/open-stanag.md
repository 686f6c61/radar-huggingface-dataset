# abr00kx/open-stanag

## Resumen

OpenSTANAG es un proyecto publicado en Hugging Face bajo el identificador `abr00kx/open-stanag` que, pese a su alojamiento en la plataforma, no es un modelo de lenguaje sino una implementación de referencia en Python de estándares de seguridad de datos para entornos de defensa, inteligencia y diplomacia. Desarrollado por el usuario abr00kx, el proyecto se presenta como una alternativa de código abierto (licencia Apache 2.0) a soluciones comerciales propietarias de seguridad centrada en datos, como ArchTIS Kojensi/NC Protect, Forcepoint High Assurance Guard o Boldon James Classifier.

El núcleo del proyecto es la implementación de los estándares NATO STANAG 4774 (sintaxis de etiquetas de metadatos de confidencialidad, ADatP-4774 v1.3) y STANAG 4778 (mecanismo de vinculación de metadatos, ADatP-4778.2 v1.4 y NCIA TN-1491), junto con los principios de Zero Trust de NIST SP 800-207 y SP 800-207A, las guías de identidad digital NIST SP 800-63-4 y el lenguaje de políticas XACML 3.0 / NGAC de OASIS. El objetivo declarado es ofrecer un guard de seguridad entre dominios (cross-domain solution) con conformidad total con los esquemas XML oficiales de la OTAN.

No se dispone de información sobre arquitectura de red neuronal, parámetros, contexto ni datos de entrenamiento, ya que el artefacto no es un modelo generativo. El repositorio figura con un tamaño de 0.0 GB, cero descargas y cero likes en el momento de la consulta, y la model card aparece truncada en la sección de ejemplos de evaluación ABAC (PDP/PEP).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: biblioteca de software en Python (no es un modelo neuronal) |
| Parametros totales | No disponible (no procede) |
| Parametros activos | No disponible (no procede) |
| Longitud de contexto | No disponible (no procede) |
| Tipos de cuantizacion | No disponible (no procede) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | No aplica: paquete Python instalable con `pip install -e .`; artefactos XML, XSD y ficheros sidecar `.bdo` |

## Arquitectura y entrenamiento

El proyecto no emplea entrenamiento ni pesos neuronales. Su arquitectura es un pipeline de validación y control de acceso en cinco etapas descrito en la model card: (1) filtrado robusto contra esquemas XML oficiales STANAG 4774 y 4778, con cuarentena en caso de fallo; (2) puerta de vinculación criptográfica mediante XMLDSIG con RSA-SHA256, ECDSA-SHA256 y HMAC-SHA256; (3) verificación de integridad del payload y del sidecar mediante hash SHA-256; (4) puerta de decisión ABAC Zero Trust según NIST SP 800-207 y la retícula de XACML 3.0; y (5) auditoría a prueba de manipulación y liberación de la transferencia entre dominios.

Entre los detalles técnicos destacables, la implementación cubre canonicalización exclusiva W3C (`xml-exc-c14n#`), digests multi-referencia sobre `MetadataBinding`, `SignatureProperties` (con timestamp OASIS WSU) y `KeyInfo`, encapsulado BDO embebido y BDO separado en sidecar `.bdo`, clasificaciones jerárquicas desde UNCLASSIFIED hasta COSMIC TOP SECRET, caveats permisivos de liberación (REL TO), caveats restrictivos (NOFORN, EYES ONLY), etiquetado COI y seguimiento del Originator ID. También incorpora los niveles AAL 1-3 de NIST SP 800-63-4 mapeados a una retícula de sensibilidad y los principios RAIN de la NSA NCDSMO (Redundant, Always Invoked, Independent, Non-bypassable). No se indica el volumen ni la composición de datos de entrenamiento porque no existe fase de entrenamiento.

## Capacidades

- Creación y serialización de etiquetas de confidencialidad STANAG 4774 con validación automática contra el XSD oficial.
- Soporte de clasificaciones jerárquicas, caveats de liberación (REL TO), caveats restrictivos (NOFORN, EYES ONLY), COI y Originator ID.
- Vinculación de metadatos STANAG 4778 en modalidad encapsulada y en sidecar `.bdo`.
- Firma y verificación criptográfica real con XMLDSIG: RSA-SHA256, ECDSA-SHA256 y HMAC-SHA256, con canonicalización exclusiva.
- Generación de pares de claves y certificados X.509 para firmantes.
- Verificación de integridad del payload mediante SHA-256 y comprobación del sidecar contra el objeto de datos.
- Evaluación de acceso ABAC con PDP y PEP desacoplados según NIST SP 800-207, usando atributos de ciudadanía, habilitación (clearance) y COI.
- Mapeo de niveles de garantía de autenticación AAL 1-3 a la retícula de sensibilidad.
- Pipeline de filtrado RAIN con cuarentena y denegación ante fallos de esquema, firma o autorización.
- Auditoría a prueba de manipulación de las decisiones de liberación.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni agentes.

## Casos de uso

- Guard entre dominios para transferencia de documentos clasificados: el pipeline valida el esquema STANAG, verifica la firma XMLDSIG y comprueba el hash SHA-256 del payload antes de autorizar la liberación, sustituyendo guards comerciales en entornos OTAN.
- Etiquetado automatizado de informes de misión: mediante `Stanag4774Label` se generan etiquetas con clasificación SECRET, REL TO y NOFORN, validadas contra el XSD oficial en el momento de la serialización.
- Firma de documentos y sidecars en flujos diplomáticos: `create_sidecar` y `XMLDSigSigner` permiten adjuntar metadatos firmados a ficheros PDF u otros formatos sin modificar el objeto original.
- Control de acceso basado en atributos en redes de coalición: el PDP evalúa ciudadanía, habilitación y COI del sujeto frente a la etiqueta del recurso, aplicando denegación por defecto.
- Integración en pipelines CI/CD de seguridad: el paquete Python puede invocarse como etapa de validación que pone en cuarentena artefactos con esquema inválido o firma rota.
- Verificación de integridad de archivos en repositorios documentales: `verify_sidecar` comprueba que el `.bdo` corresponde al fichero y que el hash SHA-256 coincide, detectando manipulaciones.
- Auditoría de cumplimiento normativo: el registro a prueba de manipulación de decisiones de liberación sirve como evidencia para revisiones de conformidad con NIST SP 800-207 y los estándares OTAN.
- Sustitución de clasificadores comerciales en administraciones públicas: al ser Apache 2.0, permite despliegue sin coste de licencia en organismos que no pueden adquirir soluciones propietarias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No aplica VRAM de GPU: es una biblioteca Python de validación XML y criptografía, ejecutable en CPU.
- Requiere Python 3.9 o superior según el badge de la model card.
- Dependencias implícitas por funcionalidad: parseo XML y validación XSD, criptografía (RSA, ECDSA, HMAC, SHA-256) y generación de certificados X.509; la model card no detalla el listado completo de dependencias.
- Despliegue como servicio o como etapa de pipeline dentro de una arquitectura PDP/PEP; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI porque no es un modelo generativo.
- No se proporcionan datos de latencia ni throughput; el rendimiento vendrá determinado por el tamaño de los documentos XML y el coste de las operaciones criptográficas.
- El tamaño del repositorio figura como 0.0 GB, por lo que el espacio en disco necesario es mínimo.

## Comparativa con modelos similares

| Producto | Tipo | Estándares cubiertos | Licencia | Disponibilidad |
|---|---|---|---|---|
| OpenSTANAG (abr00kx) | Biblioteca Python de código abierto | STANAG 4774/4778, NIST SP 800-207/207A/63-4, XACML 3.0, RAIN | Apache 2.0 | Hugging Face, 0 descargas |
| ArchTIS Kojensi / NC Protect | Solución comercial de seguridad centrada en datos | Etiquetado y control de acceso propietarios | Propietaria | Comercial |
| Forcepoint High Assurance Guard | Guard comercial entre dominios | Según certificaciones del fabricante | Propietaria | Comercial |
| Boldon James Classifier | Clasificador comercial de documentos | Etiquetado corporativo y de defensa | Propietaria | Comercial |

No se dispone de datos de rendimiento comparativo ni de métricas de conformidad verificadas de forma independiente para ninguna de las alternativas en la información proporcionada.

## Limitaciones y advertencias

- El repositorio registra cero descargas y cero likes, y la model card está truncada en la sección de evaluación ABAC, lo que impide confirmar la completitud de la implementación.
- No se han publicado resultados de benchmarks, tests de conformidad independientes ni auditorías de seguridad; la afirmación de "100% official NATO XML Schema conformance" procede únicamente del autor.
- El proyecto no es un modelo de lenguaje: no debe evaluarse como tal ni esperarse capacidades generativas.
- No se especifican los idiomas soportados ni la cobertura de localización de los mensajes de error y la documentación.
- Al tratarse de software criptográfico y de control de acceso para defensa, un fallo en la validación de esquemas o en la verificación de firmas tendría consecuencias graves; se recomienda revisión de código y pruebas propias antes de cualquier uso en producción.
- La licencia Apache 2.0 permite uso comercial, pero no se ofrece garantía alguna ni certificación oficial de la OTAN o de la NSA.
- No se documentan dependencias, versiones mínimas de librerías criptográficas ni política de divulgación de vulnerabilidades.
- Riesgo de alucinación y sesgos: no aplica al no ser un modelo generativo.

## Enlaces

- Hugging Face: https://huggingface.co/abr00kx/open-stanag
- Repositorio clonable: https://huggingface.co/abr00kx/open-stanag (git clone)
- Estándares OTAN STANAG 4774 / 4778 (referencia): https://nso.nato.int
- NIST SP 800-207 Zero Trust Architecture: https://csrc.nist.gov/publications/detail/sp/800-207/final
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- Python 3.9+: https://www.python.org/downloads/
