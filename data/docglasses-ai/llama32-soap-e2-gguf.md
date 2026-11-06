# Docglasses-AI/llama32-soap-e2-gguf

## Resumen

Llama 3.2 1B SOAP (e2) es un ajuste fino del modelo meta-llama/Llama-3.2-1B-Instruct orientado a la generacion de notas clinicas con estructura SOAP (Subjetivo, Objetivo, Analisis, Plan) a partir de la transcripcion de una consulta medico-paciente. Lo desarrolla Docglasses-AI y se distribuye unicamente en formato GGUF Q6_K para su ejecucion en llama.cpp, con un enfoque explicito hacia la inferencia en dispositivo movil Android (aplicacion DocGlasses).

El modelo hereda la arquitectura transformer decoder-only de Llama 3.2 1B, con 1.235.814.432 parametros totales y una ventana de contexto operativa de 4096 tokens segun la configuracion publicada por el autor. El repositorio ocupa 1,0 GB y contiene el peso cuantizado Q6_K, un JSON de configuracion movil y un fichero TypeScript con los prompts, el parser de campos y la logica de anclaje del plan.

Su relevancia es acotada pero concreta: demuestra un caso de uso de resumen clinico local, sin conexion y de baja latencia, sobre hardware modesto. La model card restringe explicitamente el uso a investigacion, advierte de que no es un producto sanitario y exige revision por parte de un clinico. No se han publicado resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), ajuste fino supervisado sobre Llama-3.2-1B-Instruct |
| Parametros totales | 1.235.814.432 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4096 tokens (configuracion de ejecucion publicada) |
| Tipos de cuantizacion | Q6_K (unico peso publicado); el modelo base admite otras cuantizaciones GGUF |
| Idiomas soportados | no disponibles (la model card esta redactada en ingles y no declara cobertura linguistica) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | GGUF (fichero `llama32-soap-e2-Q6_K.gguf`, 1.021.800.128 bytes) |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.2 1B Instruct: un transformer decoder-only denso con atencion causal estandar, normalizacion RMSNorm, activacion SwiGLU y sesgo RoPE, sin mecanismos MoE ni atencion lineal. El ajuste fino se ha realizado sobre el checkpoint Instruct de Meta, segun declara el campo `base_model` y la model card; no se especifican el numero de tokens de entrenamiento, la composicion del dataset clinico, ni si se aplicaron tecnicas de RLHF o DPO adicionales.

La innovacion tecnica destacable no esta en la arquitectura sino en el pipeline de inferencia descrito por el autor: recorte de la transcripcion a 3500 caracteres (1750 iniciales, separador `\n...\n` y 1750 finales), plantilla de chat de Llama 3.2 sin cabecera de fecha, temperatura 0, 4 hilos de CPU y parada en `<|eot_id|>` y `<|end_of_text|>`. La salida se fuerza a cuatro bloques de texto plano (`Subjective:`, `Objective:`, `Assessment:`, `Plan:`) y se prohibe pedir JSON. Posteriormente se aplica `parseFields(raw)` y `assembleFinalSummary(fields, dialogue)` con la transcripcion completa, de modo que el anclaje del plan elimina ordenes y medicaciones inventadas.

## Capacidades

- Generacion de texto conversacional y resumen estructurado a partir de una transcripcion de consulta.
- Redaccion de notas clinicas en formato SOAP con cuatro secciones fijas en texto plano.
- Extraccion de campos mediante un parser determinista posterior a la generacion (`parseFields`).
- Anclaje del plan contra el dialogo original para descartar ordenes y farmacos no mencionados.
- Ejecucion totalmente local en llama.cpp sobre CPU, sin dependencia de red.
- Compatibilidad con endpoints (`endpoints_compatible` segun los tags del repositorio).
- No se declara soporte de tool calling ni de function calling.
- No se declara soporte de agentes ni de razonamiento multi-paso.
- No se declara soporte de vision ni de audio (la transcripcion se aporta como texto).
- Cobertura multilingue no documentada; el prompt de referencia (`prompt: e2`) esta en ingles.

## Casos de uso

- Resumen clinico en dispositivo Android: el modelo se ejecuta en llama.cpp con 4 hilos de CPU y contexto de 4096 tokens, lo que permite generar la nota SOAP en el propio telefono tras la consulta, sin enviar datos del paciente a un servidor.
- Documentacion de consulta ambulatoria: a partir de una transcripcion recortada a 3500 caracteres, produce las cuatro secciones SOAP que el profesional revisa y firma, reduciendo el tiempo de tecleo posterior a la visita.
- Triaje de notas para revision: el parser `parseFields` separa Subjetivo, Objetivo, Analisis y Plan en campos estructurados que pueden volcarse a una historia clinica electronica tras validacion humana.
- Filtrado de alucinaciones en el plan terapeutico: `assembleFinalSummary` contrasta el plan generado con el dialogo completo y elimina ordenes y medicaciones que no aparecen en la transcripcion, un control necesario en dominio sanitario.
- Prototipado de asistentes clinicos de bajo coste: al ser un modelo de 1,2 B en Q6_K (aproximadamente 1 GB de pesos), sirve como banco de pruebas para pipelines de resumen medico en hardware sin GPU.
- Evaluacion de ajustes finos en dominio clinico: util para investigadores que quieran comparar estrategias de prompting (e2 frente a e3, segun `soap_prompt.ts`) sobre una base Llama 3.2 1B.
- Demostraciones de privacidad por diseno: escenario de consulta donde la inferencia local evita el tratamiento de datos de salud por terceros, relevante para cumplimiento normativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1-1,3 GB con Q6_K (pesos de 1,02 GB mas cache KV para 4096 tokens en un modelo de 1,2 B); en CPU la memoria residente es del orden de 1,2-1,5 GB.
- GPU recomendadas: no se especifican; el autor orienta el modelo a CPU movil. Cualquier GPU consumer con 2 GB o mas de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060) puede alojarlo con holgura.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer actual e incluso en iGPU con memoria unificada suficiente.
- Despliegue: llama.cpp es el runtime de referencia; tambien es compatible con Ollama y otros frontends que consuman GGUF. vLLM y TGI no estan indicados por el autor para este artefacto.
- Parametros de ejecucion declarados: 4 hilos de CPU, temperatura 0, maximo de 896 tokens nuevos, contexto 4096.
- Latencia y throughput: no disponibles. Con 1,2 B parametros en Q6_K sobre 4 hilos de CPU moviles es razonable esperar una generacion de varios cientos de tokens en decenas de segundos, pero no hay medicion publicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Docglasses-AI/llama32-soap-e2-gguf | 1,24 B | 4096 | GGUF Q6_K | llama3.2 | Resumen clinico SOAP en dispositivo |
| meta-llama/Llama-3.2-1B-Instruct | 1,24 B | 128k (modelo base) | safetensors, GGUF | llama3.2 | Instrucciones generales |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 B | 128k (modelo base) | safetensors, GGUF | llama3.2 | Instrucciones generales, mayor calidad |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32k | safetensors, GGUF | Apache 2.0 | Instrucciones multilingues |

La comparativa se limita a modelos de la misma familia y tamano; no se dispone de datos de rendimiento del ajuste SOAP frente a alternativas, por lo que la comparacion es estructural (parametros, contexto, licencia) y no de calidad.

## Limitaciones y advertencias

- Uso exclusivamente de investigacion: la model card indica "Research use only. Not a medical device".
- Toda nota generada debe ser revisada por un clinico antes de incorporarse a la historia del paciente.
- Riesgo de alucinacion en ordenes y medicaciones; el autor mitiga con anclaje contra la transcripcion, pero el filtro es heuristico y no garantiza ausencia de errores.
- Ventana de contexto efectiva de 4096 tokens y recorte a 3500 caracteres de transcripcion: consultas largas pierden informacion por truncamiento.
- Salida restringida a texto plano en cuatro bloques; no se debe solicitar JSON al modelo.
- Cobertura linguistica no documentada; el prompt de referencia esta en ingles, por lo que el comportamiento en castellano no esta validado.
- Sesgos: no se documentan evaluaciones de sesgo, equidad ni robustez en poblaciones diversas.
- Licencia Llama 3.2 Community License: impone obligaciones de atribucion ("Built with Llama"), restricciones de uso (entre ellas, no entrenar modelos competidores con sus salidas) y umbrales de usuarios activos mensuales para determinados usos; conviene revisar el texto completo antes de un despliegue comercial.
- Repositorio sin descargas ni likes en el momento de la consulta y con fecha de creacion posterior a la de esta ficha: no hay validacion externa de la comunidad.
- No apto para diagnostico autonomo, triaje de urgencias ni decision terapeutica sin supervision.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Docglasses-AI/llama32-soap-e2-gguf
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- llama.cpp: https://github.com/ggml-org/llama.cpp
