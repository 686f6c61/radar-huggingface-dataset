# shreyansh12183/vigyan-olmo2-7b-quad-master

## Resumen
Vigyan OLMo-2 7B Quad-Master es un modelo de lenguaje denso de 7.298.617.344 parámetros construido sobre `allenai/OLMo-2-1124-7B-Instruct`, desarrollado por Shreyansh Singh bajo la marca ExperimentLab. El autor lo presenta como un "SLM multi-disciplinar soberano" orientado a dominios técnicos específicos: matemáticas puras de nivel doctorado, Verilog RTL para diseño de ASIC, física relativista y orbital, y bioquímica computacional. La propuesta es un modelo de un solo conjunto de pesos que cubre varios dominios especializados mediante fusión de adaptadores LoRA, en lugar de mantener despliegues separados por disciplina.

La técnica central es una fusión DARE-TIES de cuatro adaptadores LoRA de dominio (`phd-pure-math`, `silicon-rtl-eda`, `astro-logic`, `biomed-chem`) sobre los pesos del modelo base, seguida de una fase de alineamiento DPO. El resultado se distribuye en safetensors y GGUF, con una cuantización Q4_K_M de aproximadamente 4,3 GB pensada para entornos aislados (air-gapped) y estaciones de trabajo sin conectividad.

La relevancia práctica del modelo es doble. Por un lado, ejemplifica una pauta de publicación cada vez más común: derivados comunitarios de modelos abiertos con licencias propias restrictivas. Por otro, su licencia EULA comercial de ExperimentLab limita el uso en producción sin contrato, lo que conviene evaluar antes de adoptarlo. Los benchmarks publicados son autoinformados por el autor y no siguen protocolos estándar (MMLU, HumanEval, GSM8K), por lo que deben interpretarse con cautela.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de allenai/OLMo-2-1124-7B-Instruct) |
| Parámetros totales | 7.298.617.344 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | safetensors (precisión original) y GGUF, con Q4_K_M (~4,3 GB) documentada |
| Idiomas soportados | no disponibles |
| Licencia | ExperimentLab Commercial Enterprise EULA (licencia "other"; evaluación académica y personal gratuita, uso comercial sujeto a contrato) |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento
El modelo parte de la arquitectura del OLMo-2 7B Instruct de AI2, un transformer denso. Sobre esa base, el autor aplica una fusión de pesos DARE-TIES (Drop And REscale combinado con TIES-Merging) para integrar cuatro adaptadores LoRA especializados en los parámetros del modelo base. El objetivo declarado es evitar la interferencia catastrófica entre dominios al combinar adaptadores entrenados por separado, de modo que un único conjunto de pesos retenga capacidades de matemáticas, RTL, astrofísica y bioquímica.

Tras la fusión, se aplica un alineamiento DPO sobre el dataset `shreyansh12183/vigyan-gen2-7b-alignment-dataset`, con enmascaramiento de pérdida en prompts negativos según indica el autor. La model card no detalla el número de tokens de entrenamiento, la composición exacta de los datasets de cada LoRA ni los hiperparámetros de la fusión (densidad de poda DARE, escalado TIES). Tampoco se especifica la longitud de contexto nativa del modelo base ni si se extendió durante el ajuste.

## Capacidades
- Generación de texto y razonamiento técnico en dominios especializados: matemáticas puras (geometría diferencial, topología algebraica, cálculo tensorial), física relativista y mecánica orbital, bioquímica computacional y Verilog RTL sintetizable.
- Generación de código HDL: el autor declara competencia en Verilog para cierre de timing ASIC y lógica de pipeline.
- Razonamiento matemático de nivel avanzado y resolución de problemas tipo olimpiada y doctorado, según la evaluación autoinformada.
- Química computacional: cinética enzimática, retrosíntesis molecular y notación SMILES.
- Conversación multi-turno (etiqueta `conversational` en el repositorio).
- Compatibilidad con endpoints de inferencia (etiqueta `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas explícitamente.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso
- Asistencia en diseño de hardware digital: generación y revisión de módulos Verilog sintetizables, análisis de pipelines y apoyo en el cierre de timing para flujos ASIC/FPGA, aprovechando el adaptador `silicon-rtl-eda`.
- Tutoría avanzada de matemáticas: resolución guiada de problemas de geometría diferencial, topología y cálculo tensorial para estudiantes de posgrado, con explicaciones paso a paso en un entorno conversacional.
- Prototipado de investigación en bioinformática: propuesta de rutas de retrosíntesis y discusión de cinética enzimática a partir de descripciones textuales y SMILES, como borrador previo a validación con herramientas especializadas.
- Cálculo orbital y mecánica de Lagrange: apoyo en la formulación de problemas de dinámica orbital y relatividad, útil en docencia o en la preparación de guiones de simulación.
- Despliegue en entornos aislados: al ofrecerse en GGUF Q4_K_M (~4,3 GB), puede ejecutarse en estaciones de trabajo sin conexión, como laboratorios docentes o entornos de defensa con requisitos de air-gap.
- Evaluación comparativa de adaptadores fusionados: como caso de estudio metodológico para investigadores que quieran reproducir o analizar fusiones DARE-TIES de múltiples LoRA de dominio sobre un modelo abierto.
- Generación de material didáctico técnico: elaboración de apuntes y ejercicios de física, matemáticas y electrónica a partir de un único modelo, reduciendo la necesidad de mantener varios despliegues.

## Benchmarks y rendimiento
El autor publica una "scorecard" propia sobre 100 problemas de examen inéditos, evaluada en un pod con dos Tesla T4. No son benchmarks estándar y no se han contrastado de forma independiente.

| Dominio (examen) | Preguntas | Aprobadas | Tasa de aprobación |
|---|---:|---:|---:|
| Matemáticas puras (nivel doctorado) | 20 | 17 | 85,00 % |
| Verilog RTL y EDA | 20 | 15 | 75,00 % |
| Física relativista y orbital | 20 | 14 | 70,00 % |
| Bioquímica computacional | 20 | 12 | 60,00 % |
| Fundamentos CBSE clase 10 (India) | 20 | 7 | 35,00 % |
| Compuesto | 100 | 65 | 65,00 % |

El autor también declara un 100 % de "format decoupling" (cero etiquetas rogue). No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware
- VRAM estimada en FP16/BF16: en torno a 14-15 GB solo para pesos, más overhead de contexto y KV cache; se recomienda un mínimo de 24 GB para uso cómodo.
- VRAM estimada en Q4_K_M: aproximadamente 4,3 GB de pesos; con contexto y overhead, un mínimo práctico de 8 GB.
- GPU recomendadas: A100 40/80 GB o H100 para FP16 con contexto largo; RTX 4090 (24 GB) o A6000 (48 GB) para FP16 ajustado; RTX 3090/4080 para cuantización de 8 bits.
- GPU de consumo: sí cabe en GPUs consumer con cuantización. El autor cita ejecución en Tesla T4 (16 GB) en cuantización y en Q4_K_M en estaciones de trabajo modestas.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; vLLM y TGI para safetensors en servidor; el repositorio incluye una demo de Colab.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización | Disponibilidad |
|---|---|---|---|---|---|
| Vigyan OLMo-2 7B Quad-Master | 7,3 B (denso) | no disponible | EULA comercial de ExperimentLab | Multi-dominio por fusión DARE-TIES | HF (safetensors + GGUF) |
| allenai/OLMo-2-1124-7B-Instruct | 7 B (denso) | no disponible en esta ficha | Apache 2.0 (modelo abierto de AI2) | Instrucción general | HF, ampliamente desplegado |
| Qwen2.5-Coder-7B-Instruct | 7 B (denso) | 32 768 tokens | Apache 2.0 | Código y matemáticas | HF, ecosistema amplio |
| Mistral-7B-Instruct-v0.3 | 7 B (denso) | 32 768 tokens | Apache 2.0 | Instrucción general | HF, muy extendido |

Frente al modelo base, la diferencia principal es la especialización por fusión de LoRA y la licencia, mucho más restrictiva. Frente a alternativas abiertas como Qwen2.5-Coder o Mistral, el Vigyan no ofrece contexto documentado ni benchmarks estándar comparables, lo que dificulta una comparación rigurosa.

## Limitaciones y advertencias
- Los benchmarks son autoinformados por el autor, con protocolo propio y sin validación independiente; no deben compararse directamente con MMLU, HumanEval o GSM8K.
- La tasa de aprobación en fundamentos de nivel secundaria (35 %) es notablemente baja, lo que sugiere un posible sesgo hacia contenido avanzado y un rendimiento débil en tareas básicas.
- Riesgo de alucinación: como cualquier modelo de 7 B, puede generar código HDL, SMILES o demostraciones matemáticas plausibles pero incorrectas; requiere validación con herramientas (síntesis, chequeo formal, validación química).
- No se documentan idiomas soportados; el autor no garantiza capacidades multilingües ni el rendimiento en castellano.
- No se especifica la longitud de contexto, lo que impide planificar despliegues con documentos largos.
- Licencia restrictiva: el uso comercial, la reventa o la integración empresarial requieren un contrato con ExperimentLab; la evaluación académica y personal es gratuita según el autor. Verificar los términos exactos en el enlace de licencia antes de cualquier uso en producción.
- La fusión DARE-TIES puede degradar capacidades generales del modelo base; no hay evaluación del rendimiento en tareas fuera de los cuatro dominios especializados.
- El repositorio tiene pocas descargas (112) y ningún "like", lo que indica escasa validación por parte de la comunidad.
- Fecha de creación indicada en el repositorio (2026-10-07): comprobar la coherencia temporal y la vigencia de los artefactos antes de adoptarlo.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/shreyansh12183/vigyan-olmo2-7b-quad-master
- Modelo base: https://huggingface.co/allenai/OLMo-2-1124-7B-Instruct
- Dataset de alineamiento: https://huggingface.co/shreyansh12183/vigyan-gen2-7b-alignment-dataset
- Licencia: https://experimentlab.in/licensing
- Portal de ExperimentLab: https://experimentlab.in
- Demo en Colab: https://colab.research.google.com/gist/shreyansh001boy-tech/94f86027e672aa60dbda383eca6cf122/colab_demo_vigyan_7b_quad_master.ipynb
- GitHub del autor: https://github.com/shreyansh001boy-tech
- Kaggle del autor: https://www.kaggle.com/shreyansh00singh
- Contacto de licencias: support@experimentlab.in
- Contacto directo del fundador: shreyansh@experimentlab.in
