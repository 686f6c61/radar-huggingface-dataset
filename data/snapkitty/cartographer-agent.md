# Snapkitty/cartographer-agent

## Resumen

CARTO (Cartographer Agent) es un sistema de agente legal desarrollado por SnapKitty Collective, presentado como un "motor de derecho soberano" que mapea el terreno legal mediante un corpus de 66 entradas de entrenamiento organizadas en 9 capítulos de conocimiento jurídico. No se trata de un modelo de lenguaje convencional, sino de una arquitectura de software en capas que combina un corpus legal estructurado, un equipo de tres kernels (Prolog, COBOL y REXX) y una capa de razonamiento basada en un "fabric" tipo Nemotron. El proyecto se encuentra en estado de "hardened scaffold", con componentes como la persistencia WORM y las conexiones a motores externos aún sin implementar completamente. Su relevancia radica en proponer un enfoque modular y auditable para la automatización de tareas legales, aunque su naturaleza híbrida (software + corpus) lo aleja de los modelos de IA generativa estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema en capas: corpus legal + kernels (Prolog, COBOL, REXX) + reasoning fabric (Nemotron) + trust deed module |
| Parametros totales | no disponible (no es un modelo de parametros) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la model card no especifica idiomas; el corpus parece estar en ingles) |
| Licencia | Sovereign Source License v1.0 (uso comercial restringido, requiere licencia escrita del Principal) |
| Formato de pesos | no disponible (el repositorio contiene codigo fuente, kernels y documentacion, no pesos de modelo) |

## Arquitectura y entrenamiento

CARTO se describe como un sistema de cinco capas: un corpus legal soberano, un equipo de tres kernels (Prolog para razonamiento legal, COBOL para operaciones corporativas y REXX para automatizacion de flujos), un "reasoning fabric" que conecta con motores externos como Nemotron y Gemini News, un modulo de trust deed para gobernanza y una salida sellada WORM. El entrenamiento se limita a 66 entradas organizadas en 9 capitulos tematicos (reparacion de credito, arquitectura de trust soberano, protocolo de disputas ACH, FCRA/Metro 2, derecho fiduciario, bancarrota, escaneo de cuentas trust, marco Moorish y defensa ante auditorias IRS). No se especifican metodos de entrenamiento (RLHF, DPO, etc.) ni volumen de tokens. La innovacion principal es la separacion de logica por kernel y el uso de un corpus compartido interpretado de forma distinta segun el perfil de cada kernel.

## Capacidades

- Razonamiento legal estructurado: el kernel Prolog implementa predicados como `has_standing/2`, `dispute_grounds/3` y `fiduciary_breach/3` para evaluar legitimidad procesal y clasificar entidades soberanas.
- Operaciones corporativas y de procedimiento: el kernel COBOL gestiona reclamaciones, ledgers, notificaciones y exportaciones de ancho fijo para entidades institucionales.
- Automatizacion de flujos de trabajo: el kernel REXX se encarga de enrutamiento, transformacion de registros y automatizacion de dockets.
- Generacion de trust deeds: el modulo de trust deed permite crear escrituras de fideicomiso sobre la marcha con protocolos de gobernanza.
- Integracion con motores externos: el reasoning fabric puede conectar con Nemotron para sintesis y con Gemini News para investigacion legal actualizada.
- Clasificacion de entidades: soporta `sovereign_entity_type/2` y `trust_classification/2` para tipificar estructuras legales.
- Deteccion de deuda zombie: incluye `zombie_debt_flags/2` para identificar deudas prescritas o problematicas.

## Casos de uso

- Asesoria en disputas de credito: el sistema puede analizar reclamaciones de consumidores, evaluar si hay fundamento legal y generar protocolos de disputa basados en el capitulo 1 del corpus (Credit Repair Mastery).
- Gestion de disputas ACH: con el capitulo 3, puede estructurar reclamaciones ante transferencias indebidas, generando notificaciones y seguimiento procedural.
- Defensa ante auditorias del IRS: el capitulo 9 ofrece un marco de defensa basado en codigos de auditoria, util para preparar documentacion y argumentos.
- Clasificacion de entidades fiduciarias: el kernel Prolog puede clasificar trusts y evaluar posibles incumplimientos fiduciarios, util para auditores internos.
- Automatizacion de dockets legales: el kernel REXX puede integrarse en sistemas de gestion de casos para enrutar documentos, programar audiencias y mantener registros.
- Generacion de escrituras de fideicomiso: el modulo trust deed permite crear documentos de gobernanza para estructuras corporativas o personales, con control de acceso mediante deeds.
- Investigacion legal asistida: el reasoning fabric puede combinar el corpus con resultados de Gemini News para obtener contexto legal actualizado en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El proyecto no presenta metricas de precision, latencia o rendimiento comparables a modelos de lenguaje convencionales.

## Requisitos de hardware

- No disponible: al ser un sistema de software (kernels en Prolog, COBOL, REXX y scripts en Rust/JavaScript), no requiere GPU ni VRAM especifica.
- Puede ejecutarse en cualquier maquina con un interprete de Prolog, compilador COBOL y runtime REXX, asi como Node.js para los modulos de runtime.
- El despliegue en produccion depende de los motores externos (Nemotron, Gemini News) que se conecten via API, por lo que los requisitos de hardware son los de esos servicios.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. CARTO no es un modelo de lenguaje generativo, sino un sistema de agente con componentes de software especificos. No existen alternativas comparables en el mismo segmento (agentes legales con kernels hibridos) dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Estado de desarrollo: el proyecto se encuentra en "hardened scaffold", con la persistencia WORM aun sin implementar y las conexiones a motores externos solo esbozadas.
- Alcance limitado del corpus: solo 66 entradas de entrenamiento, lo que restringe la cobertura legal a los 9 capitulos especificados; no es un sistema legal general.
- Riesgo de alucinacion o errores: al depender de un corpus pequeno y de motores externos no validados, las respuestas pueden ser incompletas o incorrectas en casos no cubiertos.
- Licencia restrictiva: la Sovereign Source License v1.0 prohibe el uso para entrenar modelos comerciales sin licencia escrita del Principal, lo que limita su reutilizacion en proyectos comerciales.
- Sesgos potenciales: el enfoque en "derecho soberano" y marcos como el "Moorish Trust Framework" puede implicar doctrinas legales no reconocidas por sistemas juridicos convencionales, lo que supone un riesgo legal en produccion.
- Sin soporte de idiomas declarado: la documentacion esta en ingles y no se especifican capacidades multilingues.
- No es un modelo de IA generativa: no puede generar texto libre ni razonar fuera de los patrones definidos en sus kernels y corpus.

## Enlaces

- HuggingFace: https://huggingface.co/Snapkitty/cartographer-agent
- Frontend en GitHub Pages: https://snapkittywest.github.io/cartographer-agent/
- Partner (VAULT Fundability Engine): https://snapkittywest.github.io/vault-fundability-engine/
- Contacto: devops@collectivekitty.com
