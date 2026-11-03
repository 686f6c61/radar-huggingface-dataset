# mirdax25-ux/deterministic-engine

## Resumen

Deterministic Engine es un sistema ejecutable en Python, publicado por el usuario mirdax25-ux, que implementa una capa de control determinista para verificar afirmaciones (claims) generadas por agentes de IA. No es un modelo de lenguaje preentrenado ni incluye pesos: recibe una afirmación estructurada, la evidencia aportada, una política y un instante de evaluación, y devuelve una clasificación (APPROVE, BLOCK o ESCALATE) junto con un recibo SHA-256, sin generación de texto probabilística en el verificador.

El problema que aborda es el de las afirmaciones no soportadas en flujos agénticos: cuando un LLM emite una aserción, el sistema comprueba frescura, autoridad y contradicción de la evidencia mediante puertas deterministas y validación de esquema y tipos. Su propuesta es un límite fail-closed: ante evidencia ausente, obsoleta, no autorizada o contradictoria, la decisión es bloquear o escalar, nunca elevar silenciosamente a hecho.

Es relevante ahora por la popularización de arquitecturas agénticas con MCP y tool calling, donde la trazabilidad de las decisiones es un requisito de auditoría. El autor reporta reproducibilidad en un fixture sintético (1.000 ejecuciones con 1.000 resultados serializados idénticos) y latencias de kernel de 0,1524 ms p50 y 0,2647 ms p95 en CPU. La versión del algoritmo es 2.1.2 y el contrato JSON es v3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema Python determinista (validador de esquema y tipos, puertas de frescura/autoridad/contradicción, clasificador de política); no es una red neuronal |
| Parametros totales | no disponible (no aplica; no hay pesos) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; opera sobre payloads estructurados) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (no incluye pesos; el artefacto es código Python y contrato JSON v3) |

## Arquitectura y entrenamiento

La arquitectura es un pipeline determinista de verificación documentado en la model card: entrada compuesta por claim estructurado, evidencia suministrada, política e instante de evaluación; validación de esquema y tipos; puertas de frescura, autoridad y contradicción; clasificación determinista y decisión de política; salida con resultado, razón y recibo SHA-256; y, finalmente, la aplicación llamante es la responsable de hacer cumplir el veredicto.

No hay entrenamiento ni ajuste por RLHF/DPO porque no existe modelo neuronal. El autor declara explícitamente que la ejecución es sobre CPU con un kernel de verificación basado en biblioteca estándar, sin servicio de inferencia. La reproducibilidad se demuestra sobre un único fixture sintético con entrada y tiempo de evaluación fijos, con 1.000 repeticiones idénticas; el propio autor aclara que esta comprobación no constituye una garantía de corrección irrestricta. Las decisiones posibles son APPROVE, BLOCK y ESCALATE, y el recibo SHA-256 no autentica las fuentes externas.

## Capacidades

- Verificación determinista de afirmaciones estructuradas contra evidencia suministrada, con clasificación APPROVE, BLOCK o ESCALATE.
- Validación de esquema y tipos sobre el payload de entrada (contrato JSON v3).
- Puertas de frescura temporal, autoridad de la fuente y detección de contradicciones entre evidencias.
- Emisión de recibo de integridad SHA-256 por cada evaluación.
- Integración con agentes mediante MCP (se referencia un Actor autenticado en Apify) y una API Gradio documentada.
- Ejecución en CPU con latencia de kernel sub-milisegundo (p50 0,1524 ms; p95 0,2647 ms en el entorno medido).
- Fail-closed: la evidencia ausente, obsoleta, no autorizada o contradictoria no se eleva a hecho.
- No incluye generación de texto, visión, audio ni capacidades multilingües propias; el wrapper público ignora los flags de aprobación humana suministrados por el llamante.

## Casos de uso

- Verificación de afirmaciones en pipelines agénticos: cada aserción emitida por un LLM upstream se envuelve en un claim estructurado con su evidencia y se pasa al motor antes de ejecutar una acción; el veredicto BLOCK o ESCALATE detiene el flujo.
- Puerta de aprobación en operaciones de alto riesgo: afirmaciones marcadas como críticas se fuerzan a revisión humana, dado que el wrapper público ignora los flags de aprobación del llamante y exige revisión.
- Auditoría y trazabilidad: el recibo SHA-256 por evaluación permite registrar decisiones reproducibles y reconstruir por qué se aprobó o bloqueó una afirmación en un sistema regulado.
- Integración con herramientas MCP: el Actor de Apify expone la verificación como servicio consumible desde agentes que usan el protocolo MCP, sin necesidad de desplegar infraestructura propia.
- Control de frescura de datos en informes automatizados: las puertas temporales rechazan evidencia obsoleta antes de que un agente la presente como vigente.
- Detección de contradicciones en fuentes múltiples: cuando dos evidencias discrepan, el motor clasifica como UNKNOWN y bloquea en lugar de elegir una arbitrariamente.
- Prototipado local sin GPU: al ejecutarse en CPU con Python 3.12 y biblioteca estándar, permite probar el flujo completo con `python run_example.py` en cualquier máquina de desarrollo.

## Benchmarks y rendimiento

| Metrica | Valor observado (entorno local del autor) |
|---|---|
| Repeticiones | 1000 |
| Resultados serializados identicos | 1000 |
| Latencia de kernel p50 | 0,1524 ms |
| Latencia de kernel p95 | 0,2647 ms |
| Runtime | Python 3.12.14, AMD64 |
| Exclusiones | HTTP, UI, arranques en frio, escalado de carga y exactitud frente a verdad externa |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; no aplican al no ser un modelo de lenguaje.

## Requisitos de hardware

- VRAM: no aplica; el kernel se ejecuta en CPU con biblioteca estándar de Python.
- GPU recomendadas: no aplica; no hay inferencia neuronal.
- GPU de consumo: no aplica.
- Runtime: Python 3.12 o superior.
- Despliegue: ejecución local del repositorio (`python run_example.py`), API Gradio documentada (el Space en Hugging Face está pendiente; el autor indica que la creación fue rechazada con HTTP 402 por requerir suscripción PRO) y Actor MCP en Apify.
- Latencia: 0,1524 ms p50 y 0,2647 ms p95 medidas en el entorno del autor, excluyendo HTTP, UI y arranques en frío; no constituyen un SLA alojado.

## Comparativa con modelos similares

| Sistema | Tipo | Determinismo | Licencia | Disponibilidad |
|---|---|---|---|---|
| Deterministic Engine | Verificador determinista de claims en Python | Sí, fail-closed con recibo SHA-256 | Apache 2.0 | Repositorio en Hugging Face; Space pendiente; Actor en Apify |
| Guardrails de LLM (p. ej. validadores de salida) | Capa de validación sobre texto generado | Parcial; depende del validador | Variable según proyecto | no disponible en la informacion proporcionada |
| Frameworks de evaluación de agentes | Métricas y test harness | No determinista en la generación evaluada | Variable | no disponible en la informacion proporcionada |

No se dispone de datos comparativos de rendimiento frente a alternativas concretas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni sustituye a un LLM; es una capa de control que debe integrarse en una aplicación llamante que haga cumplir el veredicto.
- El objetivo de "cero alucinaciones" se implementa como límite fail-closed; el autor declara que el 0 % de alucinaciones reales no es una métrica medida ni garantizada.
- La reproducibilidad demostrada cubre un único fixture sintético, no una garantía de corrección irrestricta.
- Evidencia fabricada, adaptadores incorrectos y llamantes que ignoran el veredicto quedan fuera de la garantía.
- El verificador no descarga URLs ni autentica la procedencia de la evidencia por sí mismo; el recibo SHA-256 no autentica fuentes externas.
- El wrapper público ignora los flags de aprobación humana del llamante; las afirmaciones de alto riesgo siguen requiriendo revisión.
- No hay datos sobre sesgos, cobertura idiomática ni rendimiento bajo carga real (HTTP, UI, escalado) en la informacion disponible.
- Las mediciones de latencia corresponden a un único entorno local y no constituyen un SLA ni evidencia de certificación empresarial.
- La demo pública no debe recibir secretos ni datos personales; la retención de payloads por parte del hosting requiere revisión separada.
- Licencia Apache 2.0 sin garantías de veracidad en el mundo real ni servicios de autenticación de fuentes.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/mirdax25-ux/deterministic-engine
- Repositorio Bodulski HAL: https://huggingface.co/mirdax25-ux/Bodul
- Código fuente de Gradio Space: https://huggingface.co/mirdax25-ux/Bodul/tree/main/gradio-space
- Actor MCP en Apify: https://apify.com/bodul/bodulskihal-claim-verifier
- GitHub del autor: https://github.com/mirdax25-ux
- X del autor: https://x.com/ddddddd97424402
- LinkedIn del autor: https://www.linkedin.com/in/damir-balenovic-594015429/
