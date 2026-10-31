# PCL-RSI-lab/Seshat-agent

## Resumen

Seshat es un agente de mejora recursiva (RSI, Recursive Self-Improvement) para ingeniería de software, desarrollado por PCL-RSI-lab. No es un modelo base nuevo, sino un sistema agéntico que opera sobre un modelo subyacente (Kimi K3 en su configuración principal) y lo potencia mediante MetaEvo, una infraestructura de razonamiento autoevolutivo que convierte trayectorias de resolución exitosas en una base de meta-conocimiento reutilizable, la cual se reinyecta en el modelo en tiempo de inferencia.

El problema que aborda es la dependencia de prompts estáticos y flujos de trabajo fijos en agentes de código: en lugar de acumular habilidades externas, Seshat "internaliza experiencia", reflexionando sobre resultados de tareas, comprimiendo lo aprendido en primitivas de razonamiento compactas y reutilizándolas sobre problemas nuevos. El resultado más destacado es la evolución de un agente base Kimi K3 de un 57,7 % a un 94,94 % de tasa de resolución en SWE-Bench Pro (+37,24 puntos porcentuales), superando según sus autores a agentes frontera comparables.

Es relevante ahora porque representa una línea de investigación emergente: agentes que mejoran con el uso sin reentrenamiento, mediante destilación de experiencia y enrutamiento de meta-conocimiento condicionado a la tarea. No hay datos públicos de arquitectura, tamaño de parámetros o longitud de contexto del modelo base en la información disponible, más allá de que se apoya en Kimi K3 y en DeepSeek V4-Pro para algunos benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Agente RSI sobre modelo base transformer (Kimi K3); infraestructura MetaEvo de inyección de meta-conocimiento por capas |
| Parametros totales | no disponible (depende del modelo base: Kimi K3) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la del modelo base) |
| Tipos de cuantizacion | no disponible (se menciona DeepSeek V4-Pro 4-Bit para CyberGym) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (compatible con transformers; el artefacto es un agente, no pesos independientes) |

## Arquitectura y entrenamiento

Seshat no es un modelo entrenado de forma convencional, sino un sistema agéntico construido sobre MetaEvo. Esta infraestructura mantiene una base de meta-conocimiento: un conjunto de vectores extraídos y purificados de trayectorias de razonamiento exitosas. Cada unidad no es memoria de texto cruda, sino una primitiva de razonamiento compacta y reutilizable: descomposición de problemas, propagación de restricciones, razonamiento inverso o guiado por objetivos, eliminación de contradicciones, autoverificación, patrones de tool calling, transferencia por analogía estructural y conmutación adaptativa de estrategias.

En tiempo de inferencia, MetaEvo no vuelca toda la base en el prompt. El flujo es: recepción del problema, enrutamiento y composición de las unidades de meta-conocimiento más relevantes, construcción de un "camino cognitivo" estructurado, inyección de ese camino en la cadena de propagación del modelo (inyección de conocimiento capa a capa, layer-wise knowledge injection), supervisión por un meta-crítico que puede continuar, reenrutar o replanificar, y finalmente evolución: las trazas exitosas se depositan de nuevo en la base. Este bucle de mejora recursiva se ejecuta sin gradientes ni fine-tuning del modelo base; el aprendizaje es externalizado en la base de meta-conocimiento, que crece con el uso. No se ha publicado información sobre número de tokens, composición de dataset ni uso de RLHF/DPO.

## Capacidades

- Resolución de incidencias de software a nivel de repositorio (estilo SWE-Bench y SWE-Bench Pro), generando parches sobre código real.
- Razonamiento lógico y estratégico (LogicBench, StrategyQA).
- Generación y evaluación de código (HumanEval, LiveCodeBench).
- Resolución de problemas científicos (ScienceQA, SciCode).
- Ciberseguridad ofensiva/defensiva en entornos tipo CyberGym (evaluado sobre DeepSeek V4-Pro 4-Bit).
- Emparejamiento y análisis de propiedad intelectual/patentes (PatentMatch).
- Autoverificación y meta-crítica de pasos intermedios: puede reenrutar o replanificar durante la ejecución.
- Tool calling como primitiva aprendida dentro del meta-conocimiento.
- Transferencia de experiencia entre dominios (código, lógica, ciencia), gracias a la recombinación de primitivas de razonamiento.
- Mejora continua: cada tarea resuelta alimenta la base de meta-conocimiento para futuras ejecuciones.

## Casos de uso

- Reparación automatizada de bugs en repositorios: dado un issue y el código fuente, el agente genera y valida parches; su rendimiento de 94,94 % en SWE-Bench Pro lo hace adecuado para pipelines de triaje y corrección automática de incidencias.
- Integración en CI/CD: puede actuar como agente que analiza fallos de tests, localiza la regresión y propone un commit de corrección, aprovechando su autoverificación antes de proponer el parche.
- Auditoría y explotación controlada de vulnerabilidades: su resultado de 80,3 en CyberGym lo orienta a laboratorios de seguridad que repliquen entornos de evaluación de exploits.
- Investigación en agentes autoevolutivos: es directamente útil para estudiar bucles RSI, destilación de experiencia y transferencia de meta-conocimiento, al publicar evidencia de evaluación por instancia.
- Asistencia en razonamiento científico y matemático: sus puntuaciones en SciCode y ScienceQA sugieren utilidad como asistente para reproducir experimentos y resolver problemas de ciencia computacional.
- Análisis de patentes y propiedad intelectual: el rendimiento en PatentMatch permite usarlo en tareas de comparación de reivindicaciones y detección de solapamientos.
- Prototipado de agentes con memoria de experiencia: equipos que quieran replicar el patrón "base de meta-conocimiento + enrutador + inyección por capas" pueden usar Seshat como implementación de referencia.

## Benchmarks y rendimiento

Resultados publicados por los autores (verificar de forma independiente antes de tomar decisiones):

| Benchmark | Seshat | Baseline más fuerte listado | Diferencia |
|---|---:|---:|---:|
| SWE-Bench Pro | 95,1 (evidencia oficial: 94,94 %, 694/731) | Claude Opus 5.5 (89,9) | +5,2 |
| CyberGym | 80,3 | Claude Mythos (83,1) / GPT-5.5 (81,8) | −2,8 / −1,5 |
| HumanEval | 100,0 | Claude Sonnet 5 (98,8) | +1,2 |
| StrategyQA | 82,3 | Hy3 (70,1) | +12,2 |
| LogicBench | 86,4 | Gemma 3 27B (84,0) | +2,4 |
| LiveCodeBench | 49,6 | Doubao Seed 2.0 (41,6) | +8,0 |
| ScienceQA | 98,0 | Doubao Seed 2.0 (97,3) | +0,7 |
| SciCode | 21,2 | Claude Sonnet 5 (18,8) | +2,4 |
| PatentMatch | 76,6 | Qwen3.5 27B (74,1) | +2,5 |

Evolución principal: Kimi K3 zero-shot 57,7 % → Seshat (Kimi K3 + MetaEvo) 94,94 % en SWE-Bench Pro.

## Requisitos de hardware

- VRAM estimada: no disponible explícitamente; viene determinada por el modelo base. Con Kimi K3 como base, se requieren despliegues multi-GPU de gama datacenter; para CyberGym se usó DeepSeek V4-Pro cuantizado a 4 bits, lo que sugiere que la cuantización agresiva es viable.
- GPU recomendadas: no disponible; por el tamaño presumible de los modelos base (Kimi K3, DeepSeek V4-Pro), se asumen A100/H100 en configuración multi-GPU.
- Consumer GPU: no viable para la configuración completa tal como está publicada; no hay evidencia de versiones reducidas.
- Despliegue: librería transformers; compatible con HuggingFace Endpoints (endpoints_compatible). No se menciona soporte explícito de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible. El bucle de enrutamiento de meta-conocimiento, inyección por capas y meta-crítica añade sobrecoste de inferencia frente al modelo base sin cuantificar.

## Comparativa con modelos similares

| Modelo | Tipo | Base/parámetros | SWE-Bench Pro | Licencia |
|---|---|---|---:|---|
| Seshat (MetaEvo) | Agente RSI | Kimi K3 | 94,94 % | Apache 2.0 |
| Claude Opus 5.5 | Modelo comercial frontera | no disponible | 89,9 | Propietaria |
| Kimi K3 (zero-shot) | Modelo base | no disponible | 57,7 | no disponible |
| Claude Sonnet 5 | Modelo comercial | no disponible | no disponible (98,8 en HumanEval) | Propietaria |

La diferencia clave es que Seshat es un agente que hereda la licencia Apache 2.0 de su repositorio, pero su rendimiento depende del modelo base subyacente, cuyos términos de uso pueden aplicar por separado.

## Limitaciones y advertencias

- Los resultados de benchmarks proceden de los propios autores y no hay, en la información disponible, verificación independiente de las cifras (especialmente el salto de 57,7 % a 94,94 %, que es extraordinario y merece escrutinio).
- Los nombres de modelos comparados (Claude Opus 5.5, GPT-5.5, Kimi K3, DeepSeek V4-Pro) no pueden contrastarse con la información proporcionada; tratar las comparaciones con cautela.
- No es un modelo independiente: requiere desplegar el modelo base (Kimi K3) más la infraestructura MetaEvo, lo que complica la reproducibilidad.
- Riesgo de alucinación heredado del modelo base; el meta-crítico mitiga pero no elimina errores, y los parches generados deben revisarse antes de fusionarse.
- Sesgos: no disponible; los sesgos serán los del modelo base y de las trayectorias de las que se destila el meta-conocimiento.
- Idiomas soportados no documentados; asumir predominio del inglés en tareas de código.
- Contexto, parámetros y requisitos de hardware no publicados, lo que dificulta la planificación de despliegue.
- Aunque el repositorio es Apache 2.0, el uso del modelo base Kimi K3 está sujeto a su propia licencia, no incluida en la información disponible.
- Repositorio con 0 descargas y 1 like en el momento de la ficha: adopción y madurez comunitarias muy limitadas.
- El bucle RSI implica que el comportamiento del agente cambia con el uso (la base de meta-conocimiento crece), lo que puede dificultar la reproducibilidad exacta de resultados en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PCL-RSI-lab/Seshat-agent
- Evidencia de evaluación (parches, logs por instancia, resultados agregados): https://huggingface.co/datasets/PCL-RSI-lab/SWE-Bench-Pro-Evaluation-Evidence
- Paper: no disponible
- Blog o repositorio de código independiente: no disponible
