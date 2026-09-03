# Snapkitty/Sovereign-Event-Bus

## Resumen

Sovereign Event Bus (SEB) es un repositorio de código abierto que explora la coordinación determinista de eventos, ejecución gobernada por políticas, revisión humana y entrega orientada a evidencia. No se trata de un modelo de inteligencia artificial, sino de una implementación de referencia multi-lenguaje (Rust, Erlang, Ada, Lean y adaptadores legacy) que investiga cómo un evento puede transitar desde un sobre de autoridad explícita hasta un resultado auditable. El proyecto está desarrollado por Snapkitty y se encuentra en fase de endurecimiento activo, con múltiples componentes incompletos o sin compilar.

El repositorio aborda cinco preguntas de ingeniería: si un evento puede portar intención, autoridad, evidencia y estado de continuación en un sobre inspeccionable; si las decisiones de enrutamiento y política pueden ser deterministas y reproducibles; si runtimes nativos, gestionados y legacy pueden compartir un contrato de evento estable; si las transiciones de alto impacto requieren una decisión humana explícita; y si la evidencia de implementación puede conectarse a modelos formales sin sobrestimar la garantía. Actualmente, solo dos suites de pruebas Rust pasan (18 y 15 pruebas respectivamente); el resto de componentes están en estado de prototipo o no compilan.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bus de eventos con sobre de autoridad, enrutamiento determinista, ejecución con adaptadores acotados, revisión humana y registro de evidencia. Componentes independientes en Rust, Erlang/OTP, Ada, Lean 4 y adaptadores legacy (RPG/ILE, COBOL, PL/I) |
| Parametros totales | No aplica (no es un modelo de IA) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible (el repositorio usa inglés en su documentación; no hay especificación de idiomas de interfaz) |
| Licencia | No disponible (el README no especifica licencia; el repositorio de HuggingFace tampoco la indica) |
| Formato de pesos | No aplica (repositorio de código fuente, no contiene pesos) |

## Arquitectura y entrenamiento

SEB no es un modelo entrenado; es una implementación de software. Su arquitectura se organiza en componentes separados que exploran diferentes preocupaciones: `seb/contracts` define formas candidatas entre lenguajes; `seb/kernel` explora interfaces de append, cadena, offset y segmento; `seb/runtime` investiga supervisión OTP y coordinación por agente; `seb/reasoning` registra eventos A2A orientados a razonamiento y líneas de tiempo; `seb/universe` indexa artefactos y modela puertas de promoción; `seb/human_touch` modela objetos de revisión y aprobación; `seb/verification/lean4` modela invariantes seleccionados; y `seb/adapters` documenta integración con plataformas legacy. El flujo previsto va desde el productor, pasando por el sobre de evento, la decisión de autoridad y política, el enrutamiento determinista, la ejecución acotada, la revisión humana cuando la política lo requiere, hasta el recibo, traza y evidencia duradera. No existe actualmente un ejecutable que una todos los componentes en una única ruta de solicitud.

No hay datos de entrenamiento porque no es un modelo de aprendizaje automático. En cuanto a innovación técnica, el proyecto plantea un contrato de evento estable entre lenguajes y un enfoque de verificación formal con Lean 4, aunque los archivos de prueba contienen `sorry` o modelos criptográficos simplificados, y el build por defecto falla.

## Capacidades

- Coordinación de eventos con sobre de autoridad explícito: el evento transporta intención, autoridad, evidencia y estado de continuación.
- Enrutamiento determinista y reproducible: las decisiones de política pueden ser evaluadas de forma consistente.
- Revisión humana para transiciones de alto impacto: modela colas de revisión y objetos de aprobación.
- Registro de evidencia y trazas: se persiguen recibos y trazas auditables.
- Soporte multi-lenguaje: implementaciones parciales en Rust, Erlang/OTP, Ada y Lean, más adaptadores para sistemas legacy (RPG/ILE, COBOL, PL/I).
- Verificación formal exploratoria: modelos e intentos de prueba en Lean 4.7.0.
- No incluye capacidades de generación de texto, razonamiento de IA, tool calling, agentes, visión o audio, al no ser un modelo de IA.

## Casos de uso

- Auditoría de eventos en sistemas financieros: el sobre de evento con evidencia y autoridad permite trazar cada transacción desde su origen hasta su resultado, útil para cumplimiento regulatorio.
- Coordinación de agentes de software en entornos multi-runtime: el contrato de evento estable entre Rust, Erlang y Ada podría facilitar la interoperabilidad en sistemas distribuidos heterogéneos.
- Aprobaciones humanas en pipelines de despliegue: el componente de revisión humana modela puertas de aprobación para cambios de alto impacto, reduciendo el riesgo de acciones automatizadas no deseadas.
- Verificación formal de invariantes de sistema: los modelos Lean 4 pretenden conectar la implementación con propiedades formales, aunque actualmente están incompletos.
- Integración con sistemas legacy: los adaptadores para RPG/ILE, COBOL y PL/I exploran cómo conectar plataformas mainframe a un bus de eventos moderno.
- Investigación académica sobre arquitecturas de eventos deterministas: el repositorio sirve como base de experimentación para tesis o prototipos de coordinación de eventos con garantías auditables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El proyecto no es un modelo de IA y no tiene métricas de rendimiento de inferencia. Las únicas métricas son las pruebas unitarias: `seb/reasoning` con 18 pruebas de librería que pasan y `seb/universe` con 15 pruebas de librería que pasan. No hay datos de latencia, throughput ni precisión.

## Requisitos de hardware

- No aplica para inferencia de IA, ya que no es un modelo.
- Para compilar y ejecutar las pruebas Rust se necesita una toolchain de Rust con Cargo. No se especifican requisitos de hardware concretos.
- Los componentes en Erlang/OTP, Ada y Lean requieren sus respectivas toolchains; no se indica hardware mínimo.
- No hay opciones de despliegue tipo vLLM, Ollama o TGI porque no es un modelo de lenguaje.

## Comparativa con modelos similares

No disponible. Sovereign Event Bus no es comparable con modelos de IA. Si se buscan alternativas en el ámbito de buses de eventos deterministas, podrían citarse proyectos como Apache Kafka o RabbitMQ, pero no son modelos y la comparación carece de sentido en este contexto. La ficha se limita a lo que el repositorio ofrece.

## Limitaciones y advertencias

- El proyecto está en fase de endurecimiento activo y no es un broker de eventos listo para producción.
- La mayoría de los componentes no compilan o tienen integraciones incompletas: el ejemplo de `reasoning` no compila, el runtime Erlang no está validado, el kernel Ada no tiene build portable, el crate de revisión humana no compila, y el build de Lean falla con `sorry` en los archivos de prueba.
- No hay una ruta de solicitud única que una todos los componentes; cada parte es un experimento separado.
- La persistencia, las firmas reales, el transporte y el manejo de claves están ausentes o contienen placeholders.
- No hay licencia especificada, lo que impide conocer las restricciones de uso comercial o modificación.
- No hay documentación sobre seguridad, y el propio README advierte que no es un límite de confianza criptográfica ni un almacén WORM.
- No se debe inferir que las pruebas de librería que pasan implican que el sistema completo funciona; los comandos `--all-targets` fallan.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Snapkitty/Sovereign-Event-Bus
- Repositorio en GitHub: https://github.com/SNAPKITTYWEST/Sovereign-Event-Bus
- Web del ecosistema SnapKitty (descargas): https://collectivekitty.com/downloads
