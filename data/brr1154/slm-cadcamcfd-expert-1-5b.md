# BRR1154/SLM-CadCamCfd-Expert-1.5B

## Resumen
SLM-CadCamCfd-Expert-1.5B es un modelo de lenguaje de 1.543.655.424 parametros (~1,54 B) desarrollado por Bhavanam Rajendra Reddy bajo la organizacion Runtime-Slayers. Se presenta como un "foundation model" de ingenieria industrial orientado a la generacion y razonamiento sobre codigo y artefactos de CAD, CAM, CFD y suites de ingenieria como MATLAB, Blender, STAR-CCM+, OpenFOAM, CATIA V5, Siemens NX y mecanizado CNC de 5 ejes con G-code ISO 6983.

El modelo no se entrena desde cero: parte de Qwen/Qwen2.5-Coder-1.5B-Instruct y aplica una tecnica de "weight surgery" basada en proyeccion al espacio nulo de Gram-Schmidt sobre las capas 16-26, modificando unicamente las proyecciones MLP de dichas capas con una cota de norma de Frobenius del 8,2 % respecto a los pesos originales. Las capas 0-15 y 27 permanecen congeladas. La arquitectura heredada es Qwen2.5 (RoPE, SwiGLU, RMSNorm, GQA con ratio 6:1, 28 capas, dimension oculta 1536) con una ventana de contexto de 32k tokens.

Es relevante porque propone un enfoque de especializacion de bajo coste (un adaptador de pesos quirurgico sobre un modelo pequeno) para dominios tecnicos muy especificos, con la promesa explicita de evitar olvido catastrofico del conocimiento linguistico y de codigo general. La licencia es Apache 2.0 y el idioma declarado es exclusivamente ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5: RoPE, SwiGLU, RMSNorm, GQA 6:1) |
| Parametros totales | 1.543.655.424 (~1,54 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (32k) |
| Tipos de cuantizacion | no disponible (el autor solo documenta carga en float32) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (delta quirurgico `surgical_weights_delta.safetensors` sobre el modelo base) |

## Arquitectura y entrenamiento
El modelo reutiliza la arquitectura Qwen2.5-Coder-1.5B-Instruct: 28 capas, dimension oculta 1536, atencion con grouped-query attention en ratio 6:1, activacion SwiGLU, normalizacion RMSNorm y embeddings rotatorios (RoPE). No hay cambios estructurales: el autor describe un proceso de "weight surgery" en el que las actualizaciones de pesos \(\Delta W\) se proyectan sobre el espacio nulo ortogonal de la matriz de covarianza de activaciones del modelo base, \(\Delta W^{\text{proj}} = \Delta W (I - V_k V_k^T)\), de modo que la respuesta del modelo sobre las entradas linguisticas del modelo base queda teoricamente inalterada.

Solo se modifican las proyecciones MLP (`down_proj`) de las capas 16 a 26, con una cota de norma de Frobenius \(\|\Delta W\| \le 0{,}082\,\|W_0\|\). Las capas 0-15 (ancla linguistica y sintactica) y la capa 27 (proyeccion de unembedding) quedan congeladas al 100 %. No se proporcionan datos sobre volumen de tokens de entrenamiento, composicion del dataset, uso de RLHF/DPO ni detalles del proceso de ajuste mas alla de la formulacion matematica. El repositorio ocupa 0,6 GB y contiene unicamente el delta de pesos, no un checkpoint completo.

## Capacidades
- Generacion de codigo MATLAB orientado a toolboxes de aeronautica, CFD, modelos en espacio de estados y graficos 3D de superficie.
- Generacion de scripts Python para Blender 5.1+ en modo headless, incluyendo modelado CAD procedural con `bpy`.
- Produccion de G-code ISO 6983 para mecanizado CNC de 5 ejes, con trayectorias trocoidales y orientacion de herramienta.
- Modelado CFD: formulaciones Euler compresibles y Navier-Stokes, mapeo de coeficiente de presion \(C_p\) en regimen transonico, mallado de superficie y etiquetado de condiciones de contorno para STAR-CCM+ y OpenFOAM.
- Descripcion y generacion de geometria estructural aeronautica (mamparos, larguerillos, costillas, góndolas de conductos).
- Razonamiento matematico aplicado a algebra matricial y fisica computacional.
- Conversacion multi-turno con plantilla de chat (formato Qwen2.5) y modo instruct.
- Soporte de tool calling / function calling: no disponible (no declarado en la informacion).
- Capacidades de agente y razonamiento multi-paso: no disponible (no declarado).
- Capacidades multimodales (vision, audio): no disponibles.
- Modo "thinking" explicito: no disponible.

## Casos de uso
- Generacion de funciones MATLAB para postprocesado CFD: el modelo puede producir funciones autonomas que calculan distribuciones de \(C_p\) sobre perfiles aerodinamicos, adecuado por su entrenamiento declarado en toolboxes de aeronautica y mecanica de fluidos.
- Automatizacion de modelado CAD en Blender: generacion de scripts `bpy` para crear geometria procedural (costillas, mamparos, superficies alares) en pipelines headless sin intervencion manual.
- Generacion de G-code para mecanizado de aleaciones dificiles: produccion de trayectorias de 5 ejes con orientacion de herramienta para piezas como blisks de Inconel 718, con verificacion de colisiones declarada por el autor.
- Asistencia en configuracion de simulaciones CFD: redaccion de ficheros de configuracion, condiciones de contorno y mallas para OpenFOAM o STAR-CCM+, reduciendo el tiempo de puesta a punto de casos transonicos.
- Documentacion tecnica de ingenieria: generacion de explicaciones y comentarios de codigo para scripts de calculo estructural o aerodinamico, aprovechando el contexto de 32k tokens para mantener coherencia en documentos largos.
- Prototipado rapido de utilidades de calculo matricial: generacion de operaciones vectorizadas en MATLAB o Python cientifico para algebra lineal y resolucion de sistemas, con el modelo actuando como asistente de codigo en notebooks.
- Integracion como asistente embebido de bajo coste: al ocupar ~1,54 B parametros y requerir menos de 2 B, puede desplegarse en entornos con recursos limitados para asistencia de codigo de ingenieria en local.

## Benchmarks y rendimiento

El autor publica resultados de su propia "Triple-Domain Engineering Hell Benchmark Suite" con verificacion de ejecucion en MATLAB R2024b, Blender 5.1 y Python cientifico. No se aportan detalles sobre el conjunto de evaluacion, numero de muestras ni metodologia, por lo que deben interpretarse con cautela.

| Benchmark | Tarea evaluada | Estandar objetivo | Pass@1 | Estado declarado |
|---|---|---|---|---|
| CAD Airframe Synthesis | 50 mamparos, 32 larguerillos, costillas, 4 góndolas | Precision estructural CATIA V5 | 100,0 % | Verificado (MATLAB y Blender) |
| CAM 5-Axis G-Code | Taladrado trocoidal, vectores de orientacion, blisk Inconel 718 | Cumplimiento ISO 6983 | 100,0 % | Verificado (cero colisiones) |
| Transonic CFD Modeling | Euler/Navier-Stokes compresible, mapeo \(C_p\) (\(C_p \le -1{,}2\)) | Estandares STAR-CCM+ | 100,0 % | Verificado (onda de choque normal) |
| SciCode Engineering Eval | Fisica algoritmica y matematicas matriciales | HumanEval-X / SciCode | 86,4 % | State-of-the-art (< 2 B, segun autor) |
| MultiPL-E MATLAB Pass@1 | Operaciones matriciales vectorizadas | MultiPL-E MATLAB | 82,1 % | Superior a baselines de 7 B (segun autor) |

No se han publicado resultados en benchmarks independientes (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: en float32 (unico formato documentado por el autor) el modelo requiere aproximadamente 6,2 GB solo para pesos, mas overhead de activaciones y cache KV; en float16 serian ~3,1 GB y en cuantizacion de 4 bits ~0,8-1,0 GB (estimaciones, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para float16; para float32 se recomienda 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4090, A100, H100).
- Cabe en GPU de consumo: si, en modelos como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y Apple Silicon con memoria unificada suficiente.
- Opciones de despliegue: el autor documenta unicamente `transformers` con carga del modelo base y aplicacion del delta safetensors. No se mencionan vLLM, llama.cpp, Ollama ni TGI; dado que el repositorio contiene solo un delta quirurgico y no pesos completos, el despliegue estandar requiere cargar Qwen2.5-Coder-1.5B-Instruct y fusionar el delta manualmente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| SLM-CadCamCfd-Expert-1.5B | ~1,54 B | 32k | Apache 2.0 | Especializacion CAD/CAM/CFD via delta quirurgico | Delta safetensors en HF |
| Qwen2.5-Coder-1.5B-Instruct | ~1,54 B | 32k | Apache 2.0 | Codigo general e instrucciones | Pesos completos en HF |
| Qwen2.5-Coder-7B-Instruct | ~7,6 B | 32k | Apache 2.0 | Codigo general de mayor capacidad | Pesos completos en HF |
| DeepSeek-Coder-1.3B-Instruct | ~1,3 B | 16k | DeepSeek License | Codigo general | Pesos completos en HF |

La comparativa se limita a modelos de la misma familia y tamano, ya que no se dispone de benchmarks independientes del modelo evaluado. Frente a Qwen2.5-Coder-1.5B-Instruct, la diferencia es la especializacion declarada en dominios de ingenieria; frente a modelos de 7 B, el autor afirma superioridad en MultiPL-E MATLAB, afirmacion no verificada de forma independiente.

## Limitaciones y advertencias
- El modelo solo declara soporte de ingles; no se garantiza calidad en castellano ni en otros idiomas.
- Los benchmarks publicados son propios, sin metodologia detallada ni evaluacion independiente; los resultados del 100 % en tareas CAD/CAM/CFD deben tratarse como afirmaciones del autor, no como evidencia replicada.
- Riesgo de alucinacion en codigo de ingenieria: la generacion de G-code o scripts CFD incorrectos puede provocar colisiones de herramienta, piezas defectuosas o simulaciones invalidas; es imprescindible validacion humana y verificacion en software de simulacion.
- El repositorio contiene unicamente un delta de pesos (`surgical_weights_delta.safetensors`), no un checkpoint completo; el despliegue exige cargar el modelo base y fusionar el delta, lo que anade complejidad y riesgo de error en la integracion.
- No se documentan datos de entrenamiento, composicion del dataset ni proceso de alineacion (RLHF/DPO), lo que dificulta evaluar sesgos y cobertura real del dominio.
- El modelo hereda los sesgos y limitaciones de Qwen2.5-Coder-1.5B-Instruct, incluidos posibles sesgos en codigo y texto.
- Aunque la licencia es Apache 2.0, el uso comercial en produccion debe acompanarse de validacion tecnica y legal propia, especialmente si se generan artefactos de fabricacion o simulacion.
- No hay informacion sobre cuantizaciones oficiales ni sobre compatibilidad con motores de inferencia de alto rendimiento (vLLM, TGI), lo que limita el despliegue en produccion a gran escala.
- El modelo tiene cero descargas y un solo "like" en el momento de la consulta, lo que sugiere ausencia de validacion por parte de la comunidad.

## Enlaces
- Hugging Face: https://huggingface.co/BRR1154/SLM-CadCamCfd-Expert-1.5B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Organizacion Runtime-Slayers: https://github.com/Runtime-Slayers
- ORCID del autor: https://orcid.org/0009-0005-3349-1162
- Papers, blogs, repos adicionales o demos: no disponibles en la informacion proporcionada.
