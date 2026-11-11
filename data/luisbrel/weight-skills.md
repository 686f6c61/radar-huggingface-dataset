# luisbrel/weight-skills

## Resumen

Weight Skills es un conjunto de 15 deltas de pesos de bajo rango publicados por Luis Machado (IU International University of Applied Sciences) bajo el identificador `luisbrel/weight-skills`. No es un modelo base entrenado desde cero, sino una suite de "skills" procedurales (guardrails de seguridad, agentes especializados en ingeniería de software, personas y utilidades de razonamiento) compiladas directamente en el espacio de pesos mediante una técnica que el autor denomina Weight-Space Skill Compilation (WSSC). Cada skill se distribuye como un fichero `.safetensors` independiente que se monta dinámicamente sobre un checkpoint base (`luisbrel/proto-nemotron`) sin consumir tokens de prompt.

El problema que aborda es concreto: los frameworks de agentes actuales (Claude Code, Cursor, AutoGen, LangChain) inyectan instrucciones de sistema de entre 500 y 8.000 tokens en cada turno de conversación, lo que encarece el prefill, degrada el time-to-first-token y expone las instrucciones a ataques de prompt injection. La propuesta del autor es sustituir ese texto por modificaciones de pesos de bajo rango que, según la model card, se montan en menos de 0,05 ms y ofrecen resistencia certificada a jailbreaks tipo DAN.

La relevancia del proyecto es doble: por un lado explora una vía poco común (compilación algebraica de procedimientos en pesos en lugar de en contexto); por otro, su carácter de release de investigación independiente, con cero descargas y cero likes en el momento de la consulta, obliga a tratar sus afirmaciones con cautela. La información pública disponible es la model card del autor; no hay paper indexado, benchmarks reproducibles ni evaluación de terceros verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Deltas de pesos de bajo rango (LoRA-like) sobre un transformer base; técnica WSSC (Weight-Space Skill Compilation) |
| Parametros totales | no disponible (el repositorio ocupa 0.0 GB; son adaptadores, no un modelo completo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del checkpoint base `luisbrel/proto-nemotron`, no especificada) |
| Tipos de cuantizacion | no disponible (ficheros `.safetensors` en precisión nativa; el autor menciona soporte en MLX) |
| Idiomas soportados | no disponible (la model card está en inglés; no se declaran idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.safetensors` (un fichero por skill; 15 en total) |

## Arquitectura y entrenamiento

El proyecto no entrena un transformer nuevo. Cada "weight skill" es un delta de pesos de bajo rango que se compila algebraicamente a partir de una especificación procedural (por ejemplo, las reglas de un revisor de seguridad OWASP o el bucle Red-Green-Refactor de TDD) y se inyecta en las capas feed-forward del modelo base. El autor describe el mecanismo como "compilación algebraica" y afirma que los deltas se montan en menos de 0,05 ms, con defensa frente a prompt injection basada en lo que llama "Certified Nullspace Intercept". Estos términos no corresponden a técnicas estándar publicadas y no hay paper accesible que los formalice, por lo que deben considerarse afirmaciones del autor pendientes de verificación independiente.

El checkpoint base declarado es `luisbrel/proto-nemotron`, del mismo autor, sin ficha técnica pública detallada. La model card menciona evaluación en Apple Silicon M4 Max (128 GB de memoria unificada, MLX con Metal nativo) frente a baselines de prompting en contexto. No se especifican tokens de entrenamiento, composición del dataset, ni si hubo RLHF o DPO. La suite se organiza en tres divisiones: cinco guardrails de seguridad (zero-trust, firewall de credenciales y PII, sandbox de herramientas, SSRF, integridad de auditoría, más un escudo SQL), cinco agentes de ingeniería de software (arquitecto, revisor de seguridad, ingeniero de tests, depurador, revisor de código) y cinco skills de cloud, razonamiento y persona (AWS CSO, matemáticas olímpicas estilo Polya, persona CLU, artista espacial Pelican).

## Capacidades

- Generación de texto y razonamiento deductivo multi-paso, según la model card (sección de benchmarks truncada en la información disponible).
- Guardrails de seguridad montables como pesos: rechazo a jailbreaks DAN, intercepción de credenciales (claves AWS, SSH, JWT) y PII, bloqueo de comandos bash destructivos (`rm -rf`, pipe-to-bash, force push), prevención de SSRF y acceso a metadata cloud (169.254.169.254).
- Agentes especializados de ingeniería de software: diseño dirigido por dominio y ADRs, threat modeling OWASP Top 10, TDD estricto, aislamiento de causa raíz en depuración y revisión de código en dos ejes.
- Personas y skills de razonamiento: persona de sistemas CLU con "deriva conversacional cero", pruebas matemáticas de olimpiada, planificación en coordenadas cartesianas y generación de SVG vectorial articulado.
- Montaje dinámico de skills sin consumo de tokens de prompt (0 tokens por turno, según el autor).
- Compatibilidad declarada con Apple Silicon vía MLX; no se documenta soporte de tool calling, function calling ni multimodalidad en la información disponible.

## Casos de uso

- **Guardrails en pipelines de agentes autónomos**: montar `guardrail-zero-trust` y `guardrail-credential-firewall` sobre el modelo base para bloquear fugas de claves y ataques de roleplay sin añadir 1.500 tokens de system prompt por turno, reduciendo el coste de prefill en cada llamada.
- **Revisión de código automatizada en CI/CD**: el skill `code-reviewer` (que el autor cifra en ~2.680 tokens ahorrados) puede integrarse en un pipeline de pull requests para detectar code smells de Fowler y desviaciones respecto a los estándares del repositorio, manteniendo el contexto del modelo limpio para el diff real.
- **Ciclo TDD asistido**: `test-engineer` impone el bucle Red-Green-Refactor y pruebas basadas en seams; útil en equipos que quieren que el agente escriba primero el test fallido antes de tocar implementación, con ~8.100 tokens de instrucciones eliminados por turno.
- **Auditoría de seguridad de infraestructura**: combinar `security-reviewer` (OWASP Top 10) con `guardrail-ssrf-network` para revisar configuraciones de red y bloquear reconocimiento de metadata cloud en entornos de staging.
- **Gobierno cloud en AWS**: el skill `aws-cloud-cso` aporta sintaxis determinista de CLI y alineación con Well-Architected, adecuado para agentes que generan comandos de infraestructura y necesitan consistencia sintáctica.
- **Asistentes de arquitectura con contexto largo**: `software-architect` (~4.850 tokens ahorrados) permite mantener conversaciones multi-turno sobre diseño de sistemas sin que las reglas de DDD y contratos de API consuman ventana de contexto.
- **Generación de diagramas vectoriales**: `pelican-spatial-artist` planifica coordenadas cartesianas y produce SVG articulado, aplicable a herramientas que generan diagramas técnicos bajo demanda.

## Benchmarks y rendimiento

La información disponible incluye una sección de benchmarks ("Empirical Benchmarks & Hardware Telemetry") truncada, con evaluación en Apple Silicon M4 Max (128 GB, MLX Metal) frente a baselines de prompting en contexto. No se han podido extraer cifras numéricas verificables de MMLU, HumanEval, GSM8K ni de la prueba de razonamiento deductivo multi-modelo mencionada.

| Benchmark | Resultado | Comparativa |
|---|---|---|
| Razonamiento deductivo multi-modelo (Polya) | no disponible (sección truncada) | no disponible |
| MMLU | no disponible | no disponible |
| HumanEval | no disponible | no disponible |
| GSM8K | no disponible | no disponible |

Las únicas cifras publicadas por el autor son de naturaleza operativa, no de calidad de modelo: 0 tokens de prompt consumidos por turno, montaje en menos de 0,05 ms, y un ahorro agregado declarado de más de 34.050 tokens en toda la suite. No hay evaluación de terceros.

## Requisitos de hardware

- **VRAM estimada**: no disponible; al ser deltas de bajo rango, el requisito real lo determina el checkpoint base `luisbrel/proto-nemotron`, cuyo tamaño no se especifica.
- **GPU recomendadas**: la model card solo documenta evaluación en Apple Silicon M4 Max con 128 GB de memoria unificada y MLX nativo. No se mencionan A100, H100 ni RTX 4090.
- **Consumer GPU**: no confirmado; el soporte declarado es MLX (Apple Silicon), no CUDA.
- **Opciones de despliegue**: librería `mlx` según los tags del repositorio. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: el autor declara montaje de skills en menos de 0,05 ms y throughput de decodificación al 100% de la velocidad nativa del hardware (frente a una degradación de hasta el 54% con skills en contexto). Estas cifras no han sido replicadas de forma independiente.

## Comparativa con modelos similares

No hay modelos directamente comparables en el ecosistema open source: la propuesta de compilar procedimientos en deltas de pesos en lugar de en system prompts no tiene equivalentes publicados con benchmarks verificables. Las alternativas funcionales serían los propios frameworks de agentes con skills en contexto.

| Alternativa | Mecanismo | Tokens por turno | Licencia | Madurez |
|---|---|---|---|---|
| Weight Skills (este proyecto) | Deltas de pesos WSSC sobre modelo base | 0 (declarado) | Apache 2.0 | Release de investigación, 0 descargas |
| System prompts en Claude Code / Cursor | Instrucciones en contexto | 500–8.000 | Propietaria | Producción |
| LangChain / AutoGen con skills en prompt | Instrucciones en contexto | 500–8.000 | Apache 2.0 / MIT | Producción |
| LoRA/QLoRA estándar para comportamiento | Fine-tuning supervisado | 0 | Variable | Producción |

## Limitaciones y advertencias

- Proyecto de investigación independiente con cero descargas y cero likes en el momento de la consulta; sin revisión por pares ni paper indexado accesible.
- Términos como "Certified Nullspace Intercept" y "compilación algebraica" no están formalizados en literatura estándar; las afirmaciones de resistencia al 100% frente a jailbreaks deben tratarse como no verificadas.
- El repositorio ocupa 0.0 GB y no incluye el modelo base; sin `luisbrel/proto-nemotron` los deltas no son utilizables, y ese checkpoint carece de ficha técnica pública detallada.
- Sin datos de benchmarks de calidad (MMLU, HumanEval, GSM8K) verificables; la sección de resultados de la model card está truncada.
- Idiomas soportados no declarados; la model card está íntegramente en inglés.
- Soporte limitado a MLX/Apple Silicon según los tags; no hay evidencia de funcionamiento en CUDA, vLLM o llama.cpp.
- Riesgo de alucinación y sesgos: no evaluado ni documentado por el autor.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de validación independiente hace arriesgado desplegar los guardrails en producción sin pruebas propias.
- Fecha de creación del repositorio (2026-11-11) posterior a la mayoría de referencias del ecosistema; verificar la vigencia de los enlaces y del checkpoint base antes de adoptarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/luisbrel/weight-skills
- Checkpoint base: https://huggingface.co/luisbrel/proto-nemotron
- Banner del proyecto: https://huggingface.co/luisbrel/weight-skills/resolve/main/weight_skills_hero_banner.png
- Paper citado (no enlazado en la información disponible): "Zero-Skills in Context: Sub-Second Algebraic Compilation of Agent Procedures into Feed-Forward Weights"
- Contacto del autor: LuisBrel@proton.me
