# Kai9987kai/supermix-v103

## Resumen

Supermix v103 es un checkpoint experimental de generación de texto publicado por el desarrollador independiente Kai9987kai bajo licencia MIT. Se presenta como la release "Frontier Synthesis" de la línea Supermix y se construye por calentamiento (warm start) a partir de `Kai9987kai/supermix-v102`, incorporando dos mecanismos de memoria: Engram Conditional Memory (tabla de hashing de n-gramas con gating dependiente de contexto) y Gated DeltaNet-2 (memoria matricial de pesos rápidos con recurrencia lineal). El modelo declara una arquitectura híbrida con componentes tipo connectome, hyper-connections y un núcleo de razonamiento recursivo.

El modelo es extremadamente pequeño para los estándares actuales: 37.561.559 parámetros totales y 10.094.663 activos, con un vocabulario de 9.460 tokens. No es un transformer denso convencional, sino un ensamblaje de módulos propietarios (ConnectomeCore, ManifoldHyperConnection, RecursiveThinkingCore) entrenado con el optimizador MuonHybridOptimizer. Su relevancia es acotada: se trata de un artefacto de investigación con 0 descargas y 0 likes en el momento de la ficha, sin model card estándar de transformers ni pesos en formato safetensors/GGUF.

La información disponible procede casi exclusivamente de la model card del autor y de sus resultados autoinformados en CPU (Windows), por lo que las cifras deben interpretarse como declaraciones del desarrollador y no como evaluaciones independientes. El propio autor mantiene el modelo como "Experimental" y no lo promociona a default del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida propietaria: ConnectomeCore (dual_soma, commissural_gate, glial_homeostasis, hebbian_trace, predictive_error, divisive_norm, dendritic_apical, synaptic_homeostasis_sleep_cycle) + ManifoldHyperConnection (mHC) + RecursiveThinkingCore (entropy_halt, ctm_synchrony) + Engram Conditional Memory + Gated DeltaNet-2 |
| Parametros totales | 37.561.559 |
| Parametros activos | 10.094.663 (mezcla de expertos / cómputo activo) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `.pt` (PyTorch, `weights/v103_scf_synthesis.pt`) |

## Arquitectura y entrenamiento

El modelo compone varios módulos. El núcleo ConnectomeCore emula dinámicas biológicas con soma dual, compuerta comisural, homeostasis glial, traza hebbiana, error predictivo, normalización divisiva, árbol apical dendrítico y un ciclo de sueño de homeostasis sináptica. Sobre él se añaden ManifoldHyperConnection (mHC) y RecursiveThinkingCore, que introduce parada por entropía y sincronía tipo CTM. La parte de memoria se cubre con Engram Conditional Memory (`engram_table_size=2048`, `engram_n_heads=2`, insertada tras la capa 0), que realiza búsqueda hasheada de n-gramas causales 2-gram/3-gram con gating dependiente de contexto y rollback de caché de cola de rango 3; y con Gated DeltaNet-2 (`deltanet_dim=32`, tras la capa 1), una recurrencia matricial de tiempo lineal con decaimiento, borrado y escritura por canal, con paridad exacta de KV-cache y rollback especulativo MTP.

El entrenamiento parte de `v102_scf_frontier.pt` mediante MuonHybridOptimizer. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. El autor informa de pérdidas muy bajas en su conjunto de evaluación propio: `tier1_seen_response = 0.0047` (perplejidad 1.0047), `dev_loss = 0.0180` (perplejidad 1.02) y `tier3 = 0.0515` (ratio tier3/tier1 de 1.048x), además de una ablación de connectome de +0.00007 nats y 5/5 comprobaciones de generalización `v58`.

## Capacidades

- Generación de texto autoregresiva (pipeline `text-generation`), orientada a tareas cortas de razonamiento y respuesta.
- Memoria condicional de n-gramas (Engram) para recuperación de patrones locales dentro de la ventana de contexto.
- Memoria de pesos rápidos de tiempo lineal (Gated DeltaNet-2) con soporte de rollback especulativo.
- Razonamiento recursivo con parada por entropía (RecursiveThinkingCore).
- Componentes neuro-simbólicos declarados en los tags, incluida verificación formal y resolución de sistemas lineales exactos (inversa de matrices 2x2 con `Fraction`, autovalores reales 2x2, productos escalar y vectorial, series geométricas y evaluación de polinomios) a través de los endpoints `/v1/v103/*`.
- Motores de diagnóstico incluidos en el repositorio: `ContinuumBTSPHopfieldMemory`, `TopKSparseAutoencoderProbe`, `FractalConnectomeAnalyzer`, `CausewaySensitivityWorkbench` y `NeuroHiveResourcePlanner`, todos con `answer_authority=False` y recibos SHA-256.
- Soporte de tool calling / function calling: no disponible en la información.
- Capacidades multimodales (visión, audio): no disponibles.
- Capacidades multilingües: no disponibles; el vocabulario de 9.460 tokens sugiere cobertura limitada.

## Casos de uso

- Investigación en arquitecturas post-transformer: el modelo sirve como banco de pruebas reproducible para estudiar la interacción entre memoria Engram, recurrencia DeltaNet y módulos tipo connectome en un presupuesto de cómputo mínimo.
- Experimentación con memoria de n-gramas: útil para validar si una tabla hasheada de 2.048 entradas con gating contextual mejora la perplejidad en tareas de respuesta vista frente a modelos base pequeños.
- Prototipado de razonamiento recursivo: el núcleo RecursiveThinkingCore con parada por entropía permite estudiar políticas de cómputo adaptativo en tareas de cadena de pensamiento corta.
- Evaluación de solvers simbólicos integrados: los endpoints `/v1/v103/*` permiten montar un servicio FastAPI que resuelva álgebra lineal exacta (inversas 2x2, autovalores, series) junto a la generación de texto.
- Docencia y divulgación: al ser un modelo de 37,5 M de parámetros ejecutable en CPU, resulta adecuado para demostrar conceptos de MoE, memoria asociativa y optimizadores híbridos en entornos sin GPU.
- Pruebas de pipelines de despliegue propios: el repositorio incluye `supermix_chat_server.py` y `nexus_api.py`, lo que permite validar integraciones de servidor de chat y API antes de portar el diseño a modelos mayores.
- Comparación de linaje: útil para investigadores que sigan la serie Supermix (v96, v100, v101, v102, v103) y quieran reproducir las evaluaciones pareadas declaradas por el autor.

## Benchmarks y rendimiento

Resultados autoinformados por el autor en Windows CPU con `max_new_tokens=96`:

| Suite de evaluacion | Resultado | Recibo |
|---|---:|---|
| Generalisation Ladder (`v58`) | `dev_loss = 0.0180` (`tier1 = 0.0047`, `tier3 = 0.0515`, 5/5 PASS) | `results/generalisation_results.json` |
| Standalone Neural `seed=82` (41 tareas) | 34/41 (0.8293) | `results/eval_v103_seed82.json` |
| Standalone Neural `seed=83` (82 tareas) | 71/82 (0.8659) | `results/eval_v103_n82_seed83.json` |
| Standalone Neural `seed=84` (82 tareas) | 72/82 (0.8780) | `results/eval_v103_n82_seed84.json` |
| Combinado 3 semillas (205 tareas) | 177/205 (86,3%) | Comparado con `v96` (180/205), `v100` (179/205), `v101` (178/205) |
| SCF Hybrid (`scf bench --seed 82 --neural`) | 41/41 (1.0000) | `results/scf_bench_v103_seed82.json` |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 37,5 M de parámetros totales, los pesos en fp32 ocuparían aproximadamente 150 MB, y en fp16 unos 75 MB, aunque el repositorio declara 0,2 GB de tamaño.
- GPU recomendadas: no disponibles; el autor reporta ejecuciones en CPU (Windows) y no documenta requisitos de GPU.
- Cabe en cualquier GPU consumer moderna e incluso en CPU; no se requiere A100, H100 ni RTX 4090.
- Opciones de despliegue documentadas: scripts propios del repositorio (`example_usage.py`, `source/nexus_api.py`, `source/supermix_chat_server.py`), FastAPI y Uvicorn; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---:|---:|---|---|---|
| Supermix v103 | 37.561.559 | 10.094.663 | no disponible | MIT | Hugging Face, 0 descargas |
| Supermix v102 (base) | no disponible | no disponible | no disponible | MIT (heredada) | Hugging Face |
| Supermix v96 (`v96_physio_neurogenesis.selected.pt`) | no disponible | no disponible | no disponible | MIT (heredada) | Hugging Face; promocionado como default del proyecto |
| Supermix v100 / v101 | no disponible | no disponible | no disponible | MIT (heredada) | Hugging Face |

No se dispone de datos de benchmarks estándar ni de modelos de referencia externos comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo marcado explícitamente como **Experimental** por el autor; no es el default promocionado del proyecto (ese rol lo ocupa `v96_physio_neurogenesis.selected.pt`).
- Todos los benchmarks son autoinformados, ejecutados en CPU Windows con `max_new_tokens=96`, y no han sido verificados de forma independiente.
- El modelo no está promocionado por su autor como listo para producción; el gating de promoción (`automatic_promotion_enabled=False`) lo mantiene fuera del conjunto por defecto.
- Vocabulario muy reducido (9.460 tokens), lo que limita la cobertura léxica y probablemente el multilingüismo; no se declaran idiomas soportados.
- Longitud de contexto no documentada, lo que impide planificar despliegues con ventanas largas.
- Riesgo de alucinación no cuantificado; no se han publicado evaluaciones de factualidad ni de sesgos.
- Ausencia de pesos en formatos estándar de la comunidad (safetensors, GGUF) y de integración con librerías de inferencia habituales (vLLM, TGI, llama.cpp), lo que complica su uso fuera del stack propio del autor.
- Licencia MIT permite uso comercial, pero la falta de documentación sobre datos de entrenamiento impide evaluar riesgos de contaminación o de propiedad intelectual.
- La terminología de la model card (connectome, glial_homeostasis, engram, etc.) no está respaldada por publicaciones revisadas por pares en la información disponible; conviene tratarla como nomenclatura del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kai9987kai/supermix-v103
- Modelo base v102: https://huggingface.co/Kai9987kai/supermix-v102
- Modelo promocionado v96: https://huggingface.co/Kai9987kai/supermix-v96
- Repositorio del proyecto: https://github.com/kai9987kai/Supermix (commit `main` `db535a42`)
