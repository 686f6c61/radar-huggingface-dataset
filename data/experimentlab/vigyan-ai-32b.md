# Experimentlab/Vigyan-AI-32B

## Resumen

Vigyan-AI-32B es un modelo de lenguaje denso de 32.234.279.936 parámetros desarrollado por ExperimentLab (India), presentado como un "foundation model soberano" orientado a razonamiento científico multi-paso, matemáticas simbólicas y verificación deductiva formal. Según la model card, se construye sobre pesos fundacionales no copyleft de la línea Dolma 3 (etiqueta `olmo2` en Hugging Face), lo que el autor vincula con requisitos de trazabilidad y auditabilidad del Reglamento Europeo de IA (artículos 11/12 y anexo IV).

El modelo se distribuye bajo una licencia propietaria, la ExperimentLab Commercial Enterprise EULA, que permite evaluación académica y personal gratuita pero exige un acuerdo comercial para cualquier despliegue en producción o integración empresarial. Está pensado para ejecución on-premise en infraestructura GPU de datacenter (dos A100/H100 o nodos con 4x RTX 4090/A6000), con el argumento de evitar la salida de datos a la nube.

La información pública es escasa: no se detallan la longitud de contexto, los idiomas soportados, la composición exacta del dataset ni resultados de benchmarks. El repositorio ocupa 64,5 GB en formato safetensors y acumula 55 descargas en el momento de redactar esta ficha. Su propuesta diferencial es el emparejamiento con una pipeline de verificación determinista (CAS SymEngine y SMT Z3) a través de la herramienta propietaria Vigyan Workstation Pro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (linaje OLMo 2 / Dolma 3) |
| Parametros totales | 32.234.279.936 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se documentan GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | experimentlab-commercial-eula (propietaria; uso academico y personal gratuito, comercial sujeto a acuerdo) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 64,5 GB |
| Pipeline de Hugging Face | no disponible |
| Fecha de publicacion | 2026-10-26 (actualizado 2026-11-22) |

## Arquitectura y entrenamiento

La model card describe una arquitectura de transformer denso de 32B parámetros, entrenada sobre corpus verificados de STEM, código y matemáticas formales. El linaje declarado es Dolma 3, el dataset abierto asociado a la familia OLMo de AI2, lo que explica la etiqueta `olmo2` en el repositorio y el énfasis del autor en la procedencia auditable de los pesos base ("audit-grade lineage", "non-copyleft open foundation weights").

No se especifican el número de tokens de entrenamiento, la composición porcentual del dataset, ni si se aplicaron fases de RLHF, DPO o post-entrenamiento con verificación de recompensas. Tampoco se documentan innovaciones de inferencia como decodificación especulativa o atención lineal. La única innovación técnica mencionada es externa al modelo: el emparejamiento con la pipeline de verificación determinista de Vigyan Workstation Pro, que combina un sistema de álgebra computacional (SymEngine) con un solver SMT (Z3) para validar las deducciones matemáticas generadas y reducir alucinaciones en ese dominio.

## Capacidades

- Razonamiento científico multi-paso y deducción formal, según la orientación declarada del modelo.
- Matemáticas simbólicas y resolución de problemas matemáticos, con verificación externa mediante CAS y SMT.
- Generación de código, dado que el entrenamiento incluye corpus de código según la model card.
- Verificación deductiva asistida: el modelo está diseñado para integrarse en una pipeline que comprueba formalmente sus conclusiones matemáticas.
- Despliegue on-premise sin egreso de datos a la nube.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso autónomo: no documentado explícitamente más allá de la orientación a razonamiento multi-paso.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Verificación formal de demostraciones matemáticas: el modelo genera pasos intermedios y la pipeline SymEngine/Z3 de Vigyan Workstation Pro valida cada paso, lo que permite usarlo en entornos donde una conclusión matemática errónea tiene coste alto (auditoría financiera, ingeniería de control).
- Asistencia a investigación en dominios STEM: generación y revisión de borradores de derivaciones, resúmenes de literatura técnica y formulación de hipótesis, aprovechando el entrenamiento declarado sobre corpus científicos verificados.
- Despliegue soberano en infraestructura propia: organizaciones con requisitos de residencia de datos (sector público, defensa, salud) pueden ejecutar el modelo en nodos A100/H100 o 4x RTX 4090 sin salida de datos, que es el caso de uso central que promociona el autor.
- Generación de código en pipelines internos: con 32B parámetros densos y entrenamiento en código, es viable para autocompletado, revisión y generación de tests en entornos con código propietario que no puede enviarse a APIs externas.
- Tutoría académica y evaluación docente: la licencia permite uso gratuito en cursos universitarios e investigación no comercial, lo que habilita su uso en laboratorios docentes de matemáticas e informática.
- Preprocesado y razonamiento sobre documentación técnica extensa: pendiente de confirmar la longitud de contexto, que no se ha publicado; sin ese dato no puede recomendarse para cargas con documentos muy largos.
- Base para post-entrenamiento a medida: el autor ofrece "customized post-training sprints" como servicio comercial, de modo que el modelo puede servir de base para ajuste fino en dominios verticales bajo contrato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 64 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, 80 GB o más por instancia.
- VRAM estimada en cuantización de 8 bits: alrededor de 32-36 GB, aunque el autor no publica pesos cuantizados ni recetas oficiales.
- VRAM estimada en cuantización de 4 bits: alrededor de 16-20 GB, viable en una RTX 4090 de 24 GB si se generan pesos GGUF/AWQ de forma comunitaria, opción no soportada oficialmente en la información disponible.
- GPU recomendadas según la model card: 2x NVIDIA A100 o H100 para despliegue en precisión completa; nodos de 4x RTX 4090 o A6000 como alternativa.
- Cabe en GPU de consumo: sí, en configuraciones multi-GPU (4x RTX 4090) en precisión completa, o en una sola RTX 4090 si se cuantiza a 4 bits, extremo no documentado por el autor.
- Opciones de despliegue: no se especifican frameworks soportados (vLLM, TGI, llama.cpp, Ollama). Al ser safetensors con arquitectura OLMo 2, es plausible su carga en vLLM o transformers, pero no está confirmado en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Vigyan-AI-32B | 32,2B denso | no disponible | EULA comercial propietaria | Pesos safetensors en HF, 55 descargas | Linaje OLMo 2/Dolma 3, orientado a STEM y verificación formal |
| OLMo 2 32B (AI2) | 32B denso | 4.096 tokens (versión base publicada por AI2) | Apache 2.0 | Abierto en HF | Mismo linaje declarado; totalmente abierto y con dataset publicado |
| Qwen2.5 32B | 32,5B denso | 131.072 tokens | Apache 2.0 (mayoría de variantes) | Abierto en HF | Contexto largo y buen rendimiento general y en código |
| Gemma 2 27B | 27B denso | 8.192 tokens | Gemma Terms of Use | Abierto en HF con aceptación de términos | Menor tamaño, licencia con restricciones de uso aceptables comercialmente |

La comparación con OLMo 2 32B es la más directa por linaje declarado, pero no puede verificarse si Vigyan-AI-32B aplica post-entrenamiento adicional ni con qué datos, ya que el autor no publica esa información. Frente a Qwen2.5 32B y Gemma 2 27B, la desventaja principal de Vigyan-AI-32B es la licencia propietaria y la ausencia de benchmarks públicos.

## Limitaciones y advertencias

- Licencia propietaria: cualquier uso comercial, integración en producto o despliegue en producción requiere un acuerdo con ExperimentLab; el incumplimiento está expresamente prohibido en la EULA.
- Ausencia total de benchmarks públicos: no hay datos verificables de MMLU, GSM8K, HumanEval ni de rendimiento en matemáticas, pese a ser su propuesta central.
- Longitud de contexto e idiomas no documentados: impide evaluar su idoneidad para cargas con documentos largos o para usuarios no anglófonos.
- Riesgo de alucinación: la mitigación anunciada depende de una herramienta propietaria externa (Vigyan Workstation Pro); sin esa pipeline, el modelo no ofrece garantías formales distintas de las de cualquier LLM.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad o seguridad.
- Procedencia: aunque se declara linaje Dolma 3 auditable, no se publica la composición del dataset de post-entrenamiento ni los detalles de la fase de alineación.
- Ecosistema limitado: 55 descargas y 0 likes en el momento de la consulta, sin pesos cuantizados oficiales ni integraciones documentadas con vLLM, llama.cpp u Ollama, lo que incrementa el coste de puesta en producción.
- Requisitos de hardware elevados para precisión completa (2x A100/H100), lo que limita su evaluación a organizaciones con infraestructura propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Experimentlab/Vigyan-AI-32B
- Portal de ExperimentLab: https://experimentlab.in
- Licencia comercial: https://experimentlab.in/licensing
- Contacto de licencias: support@experimentlab.in
- Contacto directo del fundador: shreyansh@experimentlab.in
