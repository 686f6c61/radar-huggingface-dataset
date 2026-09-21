# ericyinyzy/ICDAGENT

## Resumen

ICDAGENT es un sistema de codificación médica automatica y explicable publicado como pesos en HuggingFace por el usuario ericyinyzy, correspondiente al articulo "ICDAGENT: Empowering Agentic Large Language Models for Explainable Medical Coding" aceptado en ACL 2026. El sistema asigna codigos ICD (ICD-9 e ICD-10) a notas clinicas y justifica cada asignacion mediante un esquema de dos agentes: un agente codificador (`R_code`) que extrae codigos junto con justificaciones preliminares, y un agente critico (`R_crit`) que audita cada justificacion con razonamiento chain-of-thought, conservando los codigos que puede fundamentar en la nota y rechazando el resto. Los codigos rechazados vuelven a `R_code` como conjunto candidato a reconsiderar, de modo que un codigo valido descartado por una justificacion debil puede recuperarse.

El repositorio pesa 34,1 GB y contiene cinco subdirectorios: la base compartida HuatuoGPT-o1-8B (16 GB), dos adaptadores LoRA para `R_code` (ICD-9 de 0,9 GB e ICD-10 de 1,2 GB, ambos con r=32 y alpha=64) y dos modelos `R_crit` completamente fine-tuneados sobre Qwen3-4B (8,3 GB cada uno, uno por taxonomia ICD). La relevancia actual del modelo reside en que aborda la codificacion clinica como una tarea agentica con trazabilidad, en lugar de una clasificacion opaca, un requisito creciente en entornos hospitalarios sujetos a auditoria.

El modelo se distribuye bajo licencia Apache-2.0 y esta orientado exclusivamente al ingles. Las notas empleadas para el desarrollo (MIMIC-III y MIMIC-IV) no se redistribuyen por estar sujetas al acuerdo de uso de datos de PhysioNet.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (dos agentes: `R_code` = HuatuoGPT-o1-8B con adaptadores LoRA; `R_crit` = Qwen3-4B fine-tuneado por completo) |
| Parametros totales | 8B para `R_code` (base HuatuoGPT-o1-8B) + 4B para `R_crit` (Qwen3-4B); 12B en total desplegando ambos agentes |
| Parametros activos | no aplica (no es un modelo MoE); LoRA de `R_code` con r=32 y alpha=64 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio distribuye pesos en precision completa, sin variantes GGUF/AWQ/GPTQ publicadas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (base + LoRA de `R_code`, y pesos completos de `R_crit`) |

## Arquitectura y entrenamiento

ICDAGENT no es un unico modelo, sino una pipeline multiagente con dos componentes entrenados por separado. El agente codificador `R_code` parte de HuatuoGPT-o1-8B, un modelo medico de 8B parametros, y se especializa mediante adaptadores LoRA de rango 32 y alpha 64, uno por taxonomia (ICD-9 e ICD-10). Los adaptadores se adjuntan en tiempo de ejecucion en lugar de fusionarse con la base, que es como se generaron los resultados reportados. El agente critico `R_crit` se construye sobre Qwen3-4B con fine-tuning completo, tambien con una version por taxonomia, y se carga directamente sin adaptador.

El procedimiento combina generacion y verificacion: `R_code` produce codigos con justificaciones preliminares, `R_crit` audita cada justificacion mediante chain-of-thought y descarta aquellas que no puede anclar en el texto de la nota, y los codigos rechazados regresan a `R_code` como conjunto candidato para una segunda consideracion. La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; tampoco detalla innovaciones de decodificacion como decodificacion especulativa o atencion lineal. Si se indica que ambos agentes decodifican con muestreo y no de forma greedy, por lo que las ejecuciones repetidas arrojan valores cercanos a los reportados pero no identicos.

Los datos de evaluacion proceden de MIMIC-III y MIMIC-IV, distribuidos bajo el acuerdo de uso de PhysioNet; por esa razon no se publica ningun texto de nota ni fichero de etiquetas doradas. El repositorio de codigo si incluye los 1.000 identificadores de ingreso evaluados por benchmark, los espacios de etiquetas y las descripciones oficiales de codigos ICD, lo que permite reconstruir las entradas de evaluacion a partir de una copia credencializada propia.

## Capacidades

- Asignacion de codigos ICD-9 e ICD-10 a notas clinicas en ingles, con un adaptador especifico por taxonomia.
- Generacion de justificaciones textuales para cada codigo asignado, lo que habilita la revision por parte de codificadores humanos.
- Auditoria automatica de justificaciones mediante chain-of-thought: el agente `R_crit` conserva los codigos anclados en la nota y rechaza los no fundamentados.
- Recuperacion de codigos: los codigos rechazados vuelven como conjunto candidato al agente codificador, lo que permite rescatar codigos validos cuya justificacion inicial era debil.
- Razonamiento multi-paso dentro de la pipeline (extraccion, auditoria, reconsideracion), con decodificacion por muestreo.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Capacidades de vision, audio o thinking mode explicito: no documentadas en la informacion disponible.
- Capacidades multilingues: limitadas al ingles segun el campo `language` del modelo.

## Casos de uso

- Codificacion asistida en facturacion hospitalaria: la pipeline asigna codigos ICD-9 o ICD-10 a notas de alta y genera una justificacion por codigo, de modo que el equipo de codificacion revisa propuestas trazables en lugar de codificar desde cero.
- Auditoria de codificacion ya emitida: dado un conjunto de codigos asignados manualmente, se pueden contrastar con la salida de `R_code` y usar las justificaciones de `R_crit` para detectar asignaciones sin respaldo textual en la nota.
- Revision de reclamaciones y denegaciones de aseguradoras: la justificacion por codigo permite reconstruir por que se asigno un diagnostico concreto, util para responder a impugnaciones con evidencia textual.
- Analitica clinica y epidemiologia retrospectiva: la conversion sistematica de notas a codigos ICD-9/ICD-10 facilita la construccion de cohortes sobre datos historicos, con la salvedad de que el F1-micro reportado ronda 0,46-0,54 y requiere validacion.
- Investigacion en NLP clinico: el repositorio incluye los 1.000 identificadores de ingreso por benchmark y los espacios de etiquetas, lo que permite reproducir la evaluacion sobre MIMIC-III y MIMIC-IV con credenciales propias de PhysioNet.
- Formacion de codificadores medicos: las justificaciones generadas sirven como material de contraste en programas de entrenamiento de codificacion, mostrando que fragmentos de la nota sustentan cada codigo.
- Preprocesamiento para sistemas de soporte a la decision clinica: la salida estructurada de codigos puede alimentar motores de reglas o modelos de riesgo posteriores, siempre que se aplique supervision humana por el riesgo de alucinacion de codigos.

## Benchmarks y rendimiento

Los resultados publicados por el autor en la model card son los siguientes (P = precision, R = recall, F1, con agregacion macro y micro):

| Benchmark | P-macro | P-micro | R-macro | R-micro | F1-macro | F1-micro |
|---|---|---|---|---|---|---|
| MIMIC-III-ICD-9 | 29.62 | 59.35 | 25.58 | 46.87 | 27.45 | 52.37 |
| MIMIC-IV-ICD-9 | 31.92 | 60.19 | 28.90 | 49.15 | 30.34 | 54.11 |
| MIMIC-IV-ICD-10 | 26.03 | 54.73 | 22.73 | 40.77 | 24.27 | 46.73 |

No se han publicado en la informacion disponible resultados frente a modelos comparables en MMLU, HumanEval, GSM8K ni otros benchmarks generales, ni tablas de comparacion directa con otros sistemas de codificacion ICD.

## Requisitos de hardware

- La model card indica explicitamente que la inferencia necesita dos GPU A100-80GB. Se trata del requisito declarado por el autor, no de una estimacion.
- Estimacion orientativa de pesos en precision de 16 bits: aproximadamente 16 GB para la base HuatuoGPT-o1-8B, 8 GB adicionales para `R_crit` (Qwen3-4B) y menos de 2 GB para los adaptadores LoRA, a lo que hay que sumar la cache KV y el overhead del runtime.
- Encaje en GPU de consumo: no documentado. Con 8B + 4B parametros desplegados simultaneamente en 16 bits, el conjunto supera la VRAM de una RTX 4090 (24 GB) si se cargan ambos agentes a la vez; no hay cuantizaciones publicadas que permitan reducir el consumo.
- Opciones de despliegue: el repositorio de codigo usa vLLM 0.8.x. Requiere ademas `cachetools` fijado en la version 5.5.2, porque vLLM 0.8.x accede a internals que versiones posteriores eliminaron y la carga de LoRA falla con el error `'LoRALRUCache' object has no attribute '_LRUCache__update'`. No se documentan despliegues en llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Flujo de instalacion documentado: clonar el repositorio, `pip install -r requirements.txt`, `python scripts/download_weights.py` (unos 35 GB con los cinco componentes), `python scripts/selfcheck.py --benchmark mimic4-icd9` para verificar y `bash scripts/run_all.sh your_notes.json mimic4-icd9 runs/icd9` para ejecutar.

## Comparativa con modelos similares

La informacion disponible no incluye comparaciones con otros sistemas de codificacion ICD, por lo que no es posible ofrecer cifras de rendimiento frente a alternativas. La comparativa se limita a los componentes internos y sus modelos base:

| Sistema | Parametros | Contexto | F1-micro (mejor resultado publicado) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ICDAGENT (pipeline completo) | 8B + 4B | no disponible | 54,11 en MIMIC-IV-ICD-9 | apache-2.0 | Pesos en HuggingFace + codigo en GitHub |
| `R_code` (HuatuoGPT-o1-8B + LoRA) | 8B | no disponible | no disponible de forma aislada | apache-2.0 | Incluido en el repositorio |
| `R_crit` (Qwen3-4B fine-tuneado) | 4B | no disponible | no disponible de forma aislada | apache-2.0 | Incluido en el repositorio |
| Otros sistemas de codificacion ICD | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos frente a alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta ingles; no hay evidencia de funcionamiento en castellano ni en otros idiomas.
- La longitud de contexto no esta documentada, lo que impide garantizar el tratamiento de notas clinicas largas.
- Riesgo de alucinacion de codigos: el propio diseno del sistema asume que `R_code` puede emitir justificaciones debiles o no fundamentadas, y depende de `R_crit` para filtrarlas. Toda salida requiere supervision por un codificador humano antes de su uso en facturacion o registros clinicos.
- Rendimiento limitado: el F1-macro en MIMIC-IV-ICD-9 es 30,34 y en MIMIC-IV-ICD-10 cae a 24,27, valores que reflejan la dificultad extrema de la tarea y que estan lejos de un uso autonomo.
- Variabilidad entre ejecuciones: ambos agentes decodifican con muestreo, no de forma greedy, por lo que una repeticion no reproduce exactamente las cifras publicadas.
- Los datos de entrenamiento y evaluacion (MIMIC-III y MIMIC-IV) estan sujetos al acuerdo de uso de PhysioNet. No se redistribuye texto de notas ni etiquetas doradas; es necesario disponer de credenciales propias para reconstruir las entradas de evaluacion.
- Dependencia fragil de versiones: `cachetools` debe permanecer en 5.5.2 con vLLM 0.8.x, o la carga de LoRA falla. Esto complica el mantenimiento en produccion.
- Requisito de hardware elevado: dos A100-80GB declaradas por el autor, sin cuantizaciones publicadas que abaraten el despliegue.
- Restricciones de licencia: los pesos y el codigo son Apache-2.0, pero las bases derivan de HuatuoGPT-o1-8B y Qwen3-4B, ambas Apache-2.0; el uso comercial del modelo es posible, aunque el uso de datos MIMIC queda fuera del alcance de esa licencia.
- Sesgos conocidos: no documentados en la informacion disponible, aunque al entrenarse sobre poblaciones de MIMIC (un unico centro hospitalario) es previsible un sesgo de dominio que el autor no cuantifica.
- Popularidad nula en el momento de la consulta: 0 descargas y 0 likes, sin validacion independiente por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ericyinyzy/ICDAGENT
- Repositorio de inferencia y evaluacion: https://github.com/ericyinyzy/ICDAGENT
- Modelo base de `R_code`: https://huggingface.co/FreedomIntelligence/HuatuoGPT-o1-8B
- Modelo base de `R_crit`: Qwen3-4B, referenciado en la model card sin URL explicita
- Articulo: Yin, Ziyi; Cao, Yuanpu; Wang, Ting; Chen, Jinghui; Ma, Fenglong. "ICDAGENT: Empowering Agentic Large Language Models for Explainable Medical Coding". Proceedings of the 64th Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), 2026. Sin URL de paper proporcionada en la informacion disponible.
- Acuerdo de uso de datos de MIMIC (PhysioNet): mencionado en la model card, sin URL explicita proporcionada.
