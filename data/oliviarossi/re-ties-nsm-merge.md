# OliviaRossi/RE-TIES-NSM-Merge

## Resumen

RE-TIES-NSM-Merge es un modelo de lenguaje causal de tipo Mixture-of-Experts (MoE) con 34,7 mil millones de parámetros totales y unos 3,1 mil millones de parámetros activos por token. Ha sido desarrollado por OliviaRossi mediante una fusión matemática de cuatro fine-tunes especializados sobre el sustrato Qwen 35B-A3B: KAT-Coder-V2.5-Dev, Qwopus3.6-35B-A3B-Coder, Qwen-AgentWorld-35B-A3B y Ornith-1.5-35B-A3B. El resultado es un modelo puramente textual con atención híbrida (30 capas de atención lineal Gated DeltaNet y 10 capas de atención completa GQA) y una ventana de contexto nativa de 256K tokens.

La relevancia de este modelo reside en su enfoque de fusión: en lugar de una interpolación lineal simple, emplea el algoritmo RE-TIES-NSM (Router-aligned Expert Trimmed Information Election Sign-consensus with Normalized Spherical Merge), diseñado para evitar la canibalización de expertos y el colapso de varianza del router típicos en merges de arquitecturas MoE. El modelo se distribuye bajo licencia Apache 2.0 y está orientado a tareas de razonamiento, generación de código, uso de herramientas y simulación de estados en entornos agénticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida: 30 capas Gated DeltaNet (atención lineal) + 10 capas GQA (atención completa) |
| Parametros totales | 34.660.610.688 |
| Parametros activos | ~3.1 mil millones por token |
| Longitud de contexto | 262.144 tokens (256K nativo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BFloat16) |

## Arquitectura y entrenamiento

La arquitectura se basa en el sustrato Qwen 35B-A3B, con 40 capas distribuidas en una proporción 3:1 entre atención lineal (Gated DeltaNet) y atención completa (Grouped-Query Attention). Dispone de 256 expertos enrutados con activación Top-8 más un experto compartido dedicado, dimensión oculta de 2.048, 16 cabezas de consulta y 2 cabezas KV, y embedding posicional RoPE 1D con theta de 10.000.000 y factor rotatorio parcial de 0,25. El vocabulario alcanza los 248.320 tokens.

El entrenamiento no es un fine-tune convencional sino una fusión de cuatro modelos ya especializados, con coeficientes de mezcla α = 0,30 (KAT-Coder-V2.5), 0,28 (Qwopus3.6-Coder), 0,22 (AgentWorld-35B) y 0,20 (Ornith-1.5). El algoritmo RE-TIES-NSM alinea los routers de los expertos mediante asignación húngara de coseno máximo, extrae deltas de tarea respecto a un ancla de consenso virtual, aplica esparsificación DARE (Bernoulli p=0,25), truncamiento cuantílico TIES (top 80% de magnitud) y reconstrucción por consenso de signo direccional ponderado. Los codificadores multimodales y las cabezas de Multi-Token Prediction se eliminaron durante el proceso, dejando un modelo de texto puro.

## Capacidades

- Generación de texto y razonamiento complejo con cadenas de pensamiento detalladas, heredadas de la destilación de Claude Opus vía Qwopus3.6.
- Generación y edición de código a nivel de repositorio, con corrección de bugs multi-archivo e interacción con terminal, gracias al componente KAT-Coder.
- Soporte de tool calling y ejecución de herramientas, integrado desde KAT-Coder-V2.5-Dev.
- Capacidades agénticas: simulación de estados en siete dominios interactivos (MCP, terminal, web, Android, OS, búsqueda y SWE) con mitigación de deriva de trayectorias, proveniente de Qwen-AgentWorld.
- Verificación y autocorrección: generación de tests unitarios, localización deliberada de bugs y bucles de auto-corrección, aportados por Ornith-1.5.
- Ventana de contexto larga de 256K tokens, adecuada para documentos extensos y trayectorias agénticas profundas.
- Multilingüe en inglés y chino.

## Casos de uso

- Ingeniería de software autónoma: el modelo puede recibir un repositorio completo, localizar bugs multi-archivo, editar varios ficheros y ejecutar comandos de terminal para validar los cambios, gracias a su formación en KAT-Coder y su contexto largo.
- Asistente de programación con razonamiento profundo: integrable en IDEs o CLIs, genera soluciones algorítmicas con explicaciones paso a paso y sintaxis estricta, basado en la destilación de Qwopus3.6.
- Agente autónomo multi-entorno: puede operar en MCP, navegador web, sistema Android, SO, búsqueda y entornos de desarrollo, simulando estados y evitando la deriva en bucles de exploración largos, gracias a AgentWorld.
- Generación y ejecución de tests unitarios: el modelo propone casos de prueba, los ejecuta, detecta fallos y corrige el código fuente en un ciclo iterativo de verificación, aprovechando las capacidades de Ornith.
- Análisis de documentos extensos: con 256K de contexto, puede resumir, extraer información y razonar sobre manuales técnicos, bases de código enteras o logs de larga duración en inglés o chino.
- Desarrollo de pipelines CI/CD inteligentes: integrado como agente de revisión de código, puede analizar diffs, sugerir correcciones, generar tests y ejecutar herramientas de build dentro del pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente; con 34,7B parámetros totales y 3,1B activos, la inferencia en BFloat16 requiere aproximadamente 69 GB solo de pesos, por lo que se necesitan GPUs con 80 GB (A100/H100) o cuantización a 4 bits (unos 17-20 GB) para tarjetas de consumo como RTX 4090.
- GPU recomendadas: A100 80GB, H100 80GB para despliegue sin cuantizar; RTX 4090 o similar con cuantización GGUF/AWQ.
- No cabe en GPUs de consumo sin cuantizar, pero sí con cuantización de 4 bits.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (los pesos safetensors son compatibles con los principales frameworks).
- Latencia y throughput: no disponibles; al ser MoE con solo 3,1B activos, el throughput esperado es superior al de un denso de 35B, aunque la atención híbrida lineal reduce el coste de contexto largo.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| RE-TIES-NSM-Merge | 34,7B | ~3,1B | 256K | Apache 2.0 | MoE híbrido, código y agentes |
| Qwen3-35B-A3B (base) | 35B | 3B | 256K | Apache 2.0 | MoE generalista |
| Qwen-AgentWorld-35B-A3B | 35B | 3B | 256K | Apache 2.0 | MoE agéntico, world model |
| KAT-Coder-V2.5-Dev | 35B | 3B | 256K | Apache 2.0 | MoE especializado en código |

El modelo se posiciona como una fusión de los tres, combinando capacidades de código, agentes y verificación en un único conjunto de pesos. No hay comparativas con modelos propietarios cerrados en la información disponible.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks, por lo que el rendimiento real frente a alternativas no está verificado de forma independiente.
- El modelo se ha construido mediante fusión de pesos; aunque el algoritmo RE-TIES-NSM está diseñado para preservar la integridad de los expertos, siempre existe riesgo de degradación en tareas específicas de los modelos originales.
- No se mencionan evaluaciones de sesgos, alucinación o seguridad; el uso en producción requiere validación adicional.
- Solo soporta inglés y chino; no se garantiza calidad en otros idiomas.
- Los codificadores multimodales fueron eliminados, por lo que no acepta entradas de imagen, audio ni vídeo.
- Licencia Apache 2.0 permite uso comercial y modificación, pero los modelos base constituyentes (Qwen, etc.) tienen sus propias licencias; se debe verificar el cumplimiento de todas ellas.
- El repositorio tiene 0 descargas y 0 likes en HuggingFace, lo que indica que es un modelo reciente y sin validación comunitaria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OliviaRossi/RE-TIES-NSM-Merge
- Modelo base KAT-Coder-V2.5-Dev: https://huggingface.co/Kwaipilot/KAT-Coder-V2.5-Dev
- Modelo base Qwopus3.6-35B-A3B-Coder: https://huggingface.co/Jackrong/Qwopus3.6-35B-A3B-Coder
- Modelo base Qwen-AgentWorld-35B-A3B: https://huggingface.co/Qwen/Qwen-AgentWorld-35B-A3B
- Modelo base Ornith-1.5-35B-A3B: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
