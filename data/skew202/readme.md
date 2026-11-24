# skew202/README

## Resumen

El repositorio `skew202/README` no contiene un modelo de inteligencia artificial, sino la model card de perfil de Stefan Wiest (@skew202), un arquitecto de sistemas de IA y gobernanza. El contenido describe su actividad profesional en torno a la verificacion zero-trust, la telemetria de deriva (drift) de LLM y los planos de control de agentes multiples en sandbox, no los pesos ni la arquitectura de una red neuronal.

La pagina actua como indice de sus proyectos open source (AntiSlop, NerfStatus, EnvCheck, HCT-MCP & A2A, SpeakOps) y de sus espacios en Hugging Face, entre ellos un monitor de calidad de LLM y una especificacion de coordinacion para MCP y A2A. No se declara pipeline, licencia, idiomas ni formato de pesos, lo que confirma que no es un artefacto de modelo entrenado.

Por tanto, esta ficha documenta un repositorio de metadatos y herramientas de gobernanza, no un modelo desplegable. Cualquier dato relativo a parametros, contexto, cuantizacion o benchmarks no esta disponible porque no aplica al contenido publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es una model card de perfil) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene una model card Markdown, no pesos) |

## Arquitectura y entrenamiento

No aplica. El repositorio `skew202/README` es una pagina de presentacion estatica (SDK `static` en Hugging Face Spaces) que describe el trabajo de su autor. No contiene un transformer, un modelo MoE, un SSM ni ningun artefacto entrenado, y no se documenta dataset, numero de tokens, RLHF ni DPO.

La unica informacion tecnica del contenido se refiere a las herramientas que el autor mantiene: AntiSlop (gate CI basado en AST con Tree-sitter, 15+ lenguajes, 50k LOC en 392 ms), NerfStatus (telemetria de colapso silencioso y deriva con 17 sondas), EnvCheck (validador Rust de `.env` con salida SARIF), HCT-MCP & A2A (extensiones de oversight y circuit breaker para protocolos de agentes) y SpeakOps (telemetria de voz en tiempo real hibrida local/nube).

## Capacidades

- No es un modelo generativo: no produce texto, codigo, matematicas ni vision.
- No soporta tool calling ni function calling como modelo; su contenido describe herramientas que monitorizan y gobiernan LLM de terceros.
- No implementa razonamiento multi-paso ni modo thinking.
- El contenido enumera capacidades de las herramientas del autor: monitorizacion de calidad de LLM (Math, JSON, Code, Fact, Repeat, Negation), validacion de configuracion, gates CI y control de aprobaciones humanas en agentes.
- No se declaran capacidades multilingues del repositorio; el contenido esta redactado en ingles.

## Casos de uso

- Evaluacion de deriva de LLM en produccion: usar NerfStatus para lanzar 17 sondas (Math, JSON, Code, Fact, Repeat, Negation) contra proveedores de inferencia de Hugging Face u objetivos Ollama locales y detectar colapso silencioso del modelo.
- Gate de calidad en CI/CD: integrar AntiSlop como paso de pipeline para analizar AST en 15+ lenguajes y bloquear codigo generado que incumpla las politicas OWASP ASI05.
- Validacion de secretos y configuracion: emplear EnvCheck para verificar ficheros `.env` y sincronizarlos con Kubernetes, Terraform, Helm y ArgoCD emitiendo resultados SARIF.
- Gobernanza de agentes con aprobacion humana: aplicar la especificacion HCT (`Fermata` para holds de aprobacion y `Caesura` para kill switches) en orquestaciones MCP y A2A.
- Auditoria de arquitecturas agenticas empresariales: contratar los servicios de advisory del autor para revisiones de planos de control E2B/Cloudflare y cumplimiento del EU AI Act.
- Telemetria de voz en tiempo real: desplegar SpeakOps para capturar metricas de calidad en pipelines de voz hibridos local/nube.
- Monitorizacion continua de proveedores de inferencia: usar el Space `nerfstatus-hf-monitor` para comparar estabilidad entre Hugging Face Inference Providers y modelos locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El unico dato de rendimiento declarado es de la herramienta AntiSlop: analisis de 50.000 lineas de codigo en 392 ms sobre 15+ lenguajes mediante Tree-sitter. No es un benchmark de modelo.

## Requisitos de hardware

- No aplica: el repositorio no contiene pesos ni requiere GPU para inferencia.
- El Space asociado (`nerfstatus-hf-monitor`) es de tipo `static`, por lo que se sirve como contenido web sin computo dedicado.
- Las herramientas descritas (AntiSlop, EnvCheck) se ejecutan como utilidades de CI; EnvCheck esta implementado en Rust y AntiSlop opera sobre AST, sin requisitos de aceleracion por GPU especificados.
- Para ejecutar las sondas de NerfStatus contra modelos locales se requiere un runtime de inferencia (por ejemplo, Ollama) y hardware suficiente para el modelo objetivo, no para este repositorio.
- Opciones de despliegue del repositorio: ninguna; es una model card estatica alojada en Hugging Face.
- Latencia y throughput: no disponibles para el repositorio; el unico dato es el tiempo de analisis de AntiSlop citado arriba.

## Comparativa con modelos similares

No disponible. El repositorio no es un modelo y no existen alternativas comparables en la categoria de "modelo de IA". Como referencia de repositorios de perfil, podria compararse con otras model cards de autor en Hugging Face, pero no se dispone de datos de comparacion en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo desplegable: no puede usarse para inferencia, generacion ni evaluacion de capacidades de IA.
- No se declara licencia, lo que impide determinar condiciones de uso comercial o redistribucion del contenido.
- El contenido es una model card de perfil y puede cambiar sin versionado semantico; la fecha de actualizacion indicada es 2026-11-24.
- Los enlaces y afirmaciones sobre servicios de advisory (incluida la facturacion desde Q1 2027) son declaraciones del autor no verificadas de forma independiente.
- No hay datos de sesgos, alucinacion ni limitaciones de contexto porque no aplica a un modelo.
- Cualquier uso de las herramientas enlazadas (AntiSlop, EnvCheck, HCT-MCP) debe revisarse contra sus propios repositorios y licencias, no contra esta model card.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/skew202/README
- Space monitor: https://huggingface.co/spaces/skew202/nerfstatus-hf-monitor
- Especificacion HCT: https://huggingface.co/stefanwiest/hct-spec
- Organizacion del autor: https://huggingface.co/stefanwiest
- AntiSlop: https://github.com/skew202/antislop
- NerfStatus: https://nerfstatus.com
- EnvCheck: https://github.com/envcheck/envcheck
- HCT-MCP & A2A: https://github.com/stefanwiest/hct-mcp-signals
- SpeakOps: https://github.com/speakops
- Advisory: https://www.stefanwiest.de/advisory/
- Newsletter SeekingSota: https://seekingsota.substack.com
- Web personal: https://www.stefanwiest.de
- LinkedIn: https://linkedin.com/in/stefanwiest
- GitHub: https://github.com/skew202 y https://github.com/stefanwiest
- X: https://x.com/seekingsota
