# Snapkitty/vault-live

## Resumen

`vault-live` no es un modelo de inteligencia artificial, sino un proyecto de software de seguridad que implementa un proveedor de servicios (SP) y proveedor de identidad (IdP) SAML 2.0 con una pipeline de validación de aserciones basada en compuertas NAND. Desarrollado por Snapkitty (Ahmad Ali Parr × SnapKitty), el proyecto resuelve el problema de la validación de aserciones SAML mediante un árbol de restricciones booleanas escrito en XML, que actúa como programa de control antes de que cualquier atributo sea confiado. La entropía del conjunto de atributos está limitada a 0.20 nats, y se genera un hash semántico que ancla la cadena de auditoría WORM (Write Once Read Many).

La relevancia actual radica en su enfoque alternativo a las bibliotecas SAML tradicionales: no usa lxml, xmlsec ni bibliotecas externas de SAML, sino Python puro con la biblioteca `cryptography`. Incluye 31 pruebas que pasan, cubriendo flujo completo, protección contra replay, detección de manipulación y verificación de cadena. El repositorio está disponible en HuggingFace (aunque con cero descargas y sin licencia especificada) y en GitHub bajo el usuario SNAPKITTYWEST.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de validación SAML 2.0 con compuerta NAND (árbol de restricciones en XML) |
| Parametros totales | no aplicable (no es un modelo neuronal) |
| Parametros activos | no aplicable |
| Longitud de contexto | no aplicable |
| Tipos de cuantizacion | no aplicable |
| Idiomas soportados | no disponible (el proyecto no declara idiomas; el código y la documentación están en inglés) |
| Licencia | no disponible |
| Formato de pesos | no aplicable (código fuente Python) |

## Arquitectura y entrenamiento

La arquitectura del software se organiza en módulos independientes: `crypto/` gestiona claves RSA, XML-DSig y cifrado XML; `nand/` contiene el DSL de restricciones (`constraints.xml`) y la lógica de la compuerta NAND; `saml/` implementa el flujo SP e IdP, incluyendo construcción de peticiones y respuestas; `audit/` proporciona la cadena WORM y el almacén de replay. El flujo de validación sigue una secuencia estricta: decodificación Base64, parseo XML, verificación de firma RSA-SHA256, comprobación de condiciones (NotBefore/NotOnOrAfter, Recipient, Audience), protección contra replay, evaluación del árbol de restricciones NAND, cálculo de entropía de Shannon (límite 0.20 nats) y generación del hash semántico SHA-256.

No existe entrenamiento en el sentido de aprendizaje automático. El "entrenamiento" conceptual es el diseño e implementación de las reglas de validación en `constraints.xml`. La innovación técnica destacable es el uso de XML como lenguaje de programación para la política de confianza, lo que permite que la misma herramienta que lee SAML (XPath, validadores XML) lea también la política. La propiedad de seguridad central es que un atacante con privilegios máximos satisface todas las ramas del árbol NAND simultáneamente, produciendo una salida False (bloqueado), mientras que un usuario legítimo falla al menos una rama "atacante", manteniendo la salida True (confiado).

## Capacidades

- Validación completa de aserciones SAML 2.0 (firma, condiciones, audiencia, replay).
- Evaluación de árbol de restricciones booleanas NAND definido en XML.
- Cálculo de entropía de Shannon de los atributos, con rechazo si supera 0.20 nats.
- Generación de hash semántico determinista (SHA-256) para anclar la auditoría.
- Cadena de auditoría WORM con detección de manipulación (verificación de cadena SHA-256).
- Protección contra replay mediante almacén de IDs de aserción con expiración.
- Soporte para cifrado XML (AES-256-GCM con envoltura de clave RSA-OAEP).
- Capacidad de actuar como SP (generación de AuthnRequest, ACS) y como IdP (generación de Response firmada).

## Casos de uso

- Autenticación federada en entornos empresariales: el software actúa como SP que valida aserciones SAML de un IdP externo, aplicando la política NAND para decidir si confía en los atributos recibidos.
- Protección contra escalada de privilegios: la compuerta NAND bloquea explícitamente roles como "SuperAdmin" si se cumplen todas las condiciones del atacante, evitando accesos no autorizados.
- Auditoría inmutable de accesos: la cadena WORM registra cada aserción validada con su hash semántico, permitiendo verificar retrospectivamente que ningún registro fue alterado.
- Cumplimiento normativo (SOC 2, ISO 27001): el registro de auditoría a prueba de manipulaciones satisface requisitos de integridad de logs para certificaciones de seguridad.
- Desarrollo de infraestructura SAML personalizada: al no depender de bibliotecas externas, puede adaptarse a entornos con restricciones de dependencias o requisitos de seguridad específicos.
- Investigación en seguridad de protocolos: el diseño con entropía limitada y árbol de restricciones ofrece un caso de estudio para validación de aserciones no convencional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio declara 31 pruebas que pasan (`pytest tests/ -v`), cubriendo flujo SAML completo, lógica de la compuerta NAND, entropía, hash semántico, cadena WORM y detección de manipulación. No hay mediciones de latencia ni throughput.

## Requisitos de hardware

- Requisitos mínimos: cualquier sistema con Python 3.x y la biblioteca `cryptography` instalada.
- Sin necesidad de GPU: es software de CPU puro, sin componentes de aprendizaje automático.
- Memoria RAM típica: menos de 256 MB para el proceso de validación (depende del tamaño de las aserciones XML).
- Almacenamiento: mínimo (el código fuente ocupa pocos KB; la cadena de auditoría crece con el uso).
- Opciones de despliegue: puede ejecutarse como script, integrarse en un servicio web (Flask, FastAPI) o usarse como biblioteca. No requiere infraestructura especializada.
- Latencia: no disponible; depende del hardware y del tamaño de la aserción.

## Comparativa con modelos similares

No aplica directamente porque no es un modelo de IA. Como alternativa a bibliotecas SAML tradicionales, se puede comparar con:

| Proyecto | Tipo | Dependencias | Enfoque de validación |
|---|---|---|---|
| `vault-live` | SP/IdP SAML | Solo `cryptography` | Árbol NAND en XML + entropía |
| `python3-saml` (OneLogin) | SP SAML | lxml, xmlsec | Validación estándar XSD + firma |
| `pysaml2` | SP/IdP SAML | varias | Validación estándar + extensiones |

La diferencia clave es que `vault-live` introduce una capa adicional de política booleana y control de entropía, ausente en las bibliotecas convencionales.

## Limitaciones y advertencias

- No es un modelo de IA: no puede generar texto, razonar ni procesar lenguaje natural. Cualquier uso como modelo de lenguaje es inválido.
- Licencia no especificada: no se indica bajo qué términos se distribuye el código, lo que impide su uso comercial sin autorización explícita.
- Sin soporte oficial: el proyecto parece mantenido por una única entidad (Snapkitty); no hay garantías de actualizaciones o parches de seguridad.
- Riesgo de seguridad inherente: al implementar SAML desde cero sin bibliotecas probadas, pueden existir vulnerabilidades no detectadas. La verificación de firma y el manejo de XML requieren revisión experta.
- Limitación de entropía: el límite de 0.20 nats puede rechazar aserciones legítimas con múltiples valores de atributos, provocando falsos negativos.
- Idioma: la documentación y los mensajes están en inglés; no hay soporte multilingüe declarado.
- Producción: no hay evidencia de despliegues en entornos reales ni certificaciones de seguridad independientes.

## Enlaces

- HuggingFace: https://huggingface.co/Snapkitty/vault-live
- GitHub: https://github.com/SNAPKITTYWEST/vault-live
- README en GitHub: https://github.com/SNAPKITTYWEST/vault-live/blob/master/README.md
- Página de productos SnapKitty OS: https://collectivekitty.com/products
- Perfil de Snapkitty en HuggingFace: https://huggingface.co/Snapkitty
