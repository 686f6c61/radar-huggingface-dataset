# GaiaExplor/mining-local-deployment-guide

## Resumen

`GaiaExplor/mining-local-deployment-guide` no es un modelo de IA, sino un repositorio de Hugging Face que aloja una guía metodológica en Markdown para la evaluacion y el despliegue local de sistemas de IA orientados al sector minero. Lo publica GaiaExplor (con contacto comercial en sales@gaiaexplor.com) y su version declarada es la 1.0, fechada el 13 de noviembre de 2026. El contenido es un checklist de compra (buyer-side) estructurado en seis bloques: evaluacion de necesidades, inventario de datos y residencia, eleccion de modelo y modo de alojamiento, aislamiento, operaciones y claves, y aceptacion.

El documento describe una division de trabajo entre dos partes: Gaia, que aporta la base de agente, las llamadas a API y el despliegue local de modelos de lenguaje open source, y HOT, que se encarga de la venta o arrendamiento de hardware de computo y de la implementacion en sitio (FDE, forward deployed engineer). La guia insiste de forma explicita en que la instalacion local de un modelo no equivale a control operativo ni demuestra residencia de datos, cumplimiento legal o seguridad, y remite las conclusiones juridicas a asesoria legal por jurisdiccion.

Por tanto, esta ficha documenta un artefacto documental, no un modelo con pesos, arquitectura o benchmarks. No se dispone de informacion sobre parametros, contexto, licencia de pesos ni capacidades de inferencia. Cualquier dato de hardware, rendimiento, precio, certificacion o plazo de entrega queda fuera del alcance declarado de la guia y debe confirmarse proyecto a proyecto. El repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene una guia en Markdown, no un modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la guia menciona registrar la cuantizacion usada en la aceptacion, sin especificar formatos) |
| Idiomas soportados | no disponibles (la guia existe en ingles y en una version companera en chino, `README.zh.md`) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el artefacto es documentacion en Markdown) |

## Arquitectura y entrenamiento

No aplica: el repositorio no contiene un modelo entrenado ni pesos. El contenido es una guia metodologica en Markdown (con version en ingles y version companera en chino) que define un proceso de evaluacion y aceptacion para proyectos de despliegue local de IA en mineria. No hay informacion sobre datos de entrenamiento, tokens, RLHF, DPO ni innovaciones de inferencia como decodificacion especulativa o atencion lineal.

La estructura interna de la guia si es concreta: seis fases (evaluacion de necesidades, inventario de datos y residencia, eleccion de modelo y hosting, aislamiento, operaciones y claves, aceptacion), con tablas de trabajo para flujo de datos, logs, acceso operativo y definiciones contractuales. Recomienda congelar una carga de prueba unica antes de comparar proveedores (mismas tareas, misma porcion de datos, misma version de modelo y ajustes, misma longitud de secuencia y concurrencia, misma ventana de medicion) y advierte que un pico aislado no constituye una afirmacion de capacidad.

## Capacidades

- Proporciona un checklist escrito para evaluar proyectos de despliegue local de IA en entornos mineros.
- Define una division de responsabilidades explicita entre Gaia (base de agente, API, despliegue local de modelos open source) y HOT (hardware, implementacion en sitio).
- Incluye plantillas para inventariar flujos de datos, logs, accesos operativos y definiciones contractuales de residencia.
- Propone criterios de aceptacion por fases, con minimo aceptable y condicion de fallo que detiene el go-live.
- Recomienda verificar por separado las licencias de pesos, codigo, datos y uso comercial, distinguiendo "open source" de "open weights".
- Plantea comprobaciones de portabilidad antes del go-live: capacidad de migrar la carga, exportar la memoria de la empresa y redirigir el agente.
- No ofrece capacidades de generacion, razonamiento, codigo, vision ni tool calling: no es un modelo.

## Casos de uso

- Evaluacion de proveedores de IA para mineria: el equipo de compras usa el checklist para congelar una carga de prueba comun y comparar propuestas con los mismos datos, version de modelo y ventana de medicion, evitando comparar paquetes heterogeneos.
- Definicion de residencia de datos: antes de aceptar una clausula de "residencia", el cliente completa las cuatro tablas (flujo de datos, logs, acceso operativo y definiciones contractuales) y exige evidencia escrita por cada una.
- Diseno de la fase de aceptacion: se fija el minimo aceptable de la primera fase y la condicion de fallo que detiene el go-live, con propietario y evidencia aceptada por item.
- Auditoria de acceso remoto: se documenta quien puede acceder al sistema, desde donde, bajo que aprobacion, durante cuanto tiempo y con que rastro de auditoria, incluido si una sesion de soporte copia datos fuera del emplazamiento.
- Planificacion de portabilidad: se verifica de antemano si la carga puede migrar si el proveedor cambia de terminos, si la memoria de la empresa es exportable y si el agente puede redirigirse a otro backend.
- Seleccion de modelo y modo de hosting: se elige entre llamadas a API, despliegue local de un modelo open source o implementacion completa en sitio (FDE), tratandolos como servicios distintos que no deben cotizarse ni aceptarse como un mismo paquete.
- Gestion de claves y operaciones: se planifica el ciclo de vida de credenciales y la operacion continua, dado que la guia advierte que una instalacion local no incluye automaticamente operaciones continuadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El documento declara explicitamente que no incluye cifras de hardware, rendimiento, precio, certificacion ni plazo de entrega, y que estos datos se confirman por proyecto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La guia no publica cifras de hardware; indica que se confirman por proyecto.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la guia contempla tres modos distintos (llamadas a API, despliegue local de modelo open source y implementacion en sitio tipo FDE), sin nombrar frameworks concretos como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible. La guia solo exige medirlos con una carga de prueba congelada y advierte que un pico aislado no es una afirmacion de capacidad.

## Comparativa con modelos similares

No disponible. El artefacto no es un modelo y no se han identificado en la informacion proporcionada guias comparables de despliegue local para el sector minero ni alternativas de la misma categoria.

## Limitaciones y advertencias

- No es un modelo: no puede usarse para inferencia, generacion de texto ni ninguna tarea de IA.
- No incluye especificaciones de producto, lista de precios, contrato, asesoria legal ni certificacion de seguridad o cumplimiento.
- La guia declara de forma explicita que no garantiza seguridad absoluta ni cumplimiento automatico; las conclusiones legales por jurisdiccion requieren asesoria legal.
- La instalacion local de un modelo no demuestra por si misma residencia de datos, cumplimiento legal ni seguridad.
- Cualquier dato de hardware, rendimiento, precio, certificacion, SLA o plazo de entrega queda fuera del alcance del documento y debe confirmarse por proyecto.
- La guia menciona "sovereign AI" como declaracion de direccion, no como afirmacion de que exista un paquete de flujos de trabajo en produccion.
- Licencia de uso no disponible: al no constar licencia explicita, no puede asumirse permiso de uso comercial, redistribucion o modificacion del contenido.
- El repositorio presenta 0 descargas y 0 likes, sin senales de adopcion ni mantenimiento por parte de la comunidad.
- Los resultados de la busqueda web proporcionados no guardan relacion con el repositorio y no aportan informacion verificable adicional.

## Enlaces

- Hugging Face: https://huggingface.co/GaiaExplor/mining-local-deployment-guide
- Version en chino del documento: `README.zh.md` dentro del mismo repositorio
- Canal GitHub: mencionado en la model card, sin URL concreta disponible
- Contacto comercial: sales@gaiaexplor.com
