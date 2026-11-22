# reaperdoesntknow/Symbiotic-1B

## Resumen

Symbiotic-1B (publicado en la model card como SymbioticLM-1B) es un modelo de generacion de texto desarrollado por el usuario reaperdoesntknow, bajo la division de investigacion de Convergent Intelligence LLC. Se presenta como un modelo hibrido simbolico-transformer construido sobre el backbone de Qwen3-0.6B, al que se anaden modulos simbolicos propietarios y una memoria episodica persistente. El objetivo declarado es el razonamiento simbolico en entornos con recursos limitados, incluyendo inferencia en CPU y dispositivos embebidos.

El modelo parte de Qwen/Qwen3-0.6B (transformer con rotary embeddings) y le incorpora un pipeline de procesamiento simbolico con dimension simbolica de 1024, varios procesadores especializados (ThoughtDynamicsLNN, CrystallineProcessor basado en GNN DNAConv, LiquidThoughtProcessor y HelicalDNAProcessor) y una memoria de 2048 vectores simbolicos con recuperacion entropica y contextual. Incluye ademas un modo "Dream" de simulacion simbolica.

A pesar del nombre comercial "1B", el recuento real de parametros en safetensors es de 596.049.920 (aproximadamente 0,6 mil millones), coherente con su base Qwen3-0.6B. El modelo esta afinado sobre el dataset 0xZee/dataset-CoT-Advanced-Calculus-268 y se distribuye bajo licencia AFL-3.0. Su relevancia actual es limitada y de nicho: se trata de un experimento de investigacion con muy poca traccion (5 likes, 3058 descargas) y documentacion tecnica escasa mas alla de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida simbolico-transformer sobre backbone Qwen3 (rotary transformer) con modulos simbolicos |
| Parametros totales | 596.049.920 (segun safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo incluye pesos PyTorch y safetensors; no se documentan variantes GGUF) |
| Idiomas soportados | en (ingles) |
| Licencia | afl-3.0 (Academic Free License 3.0) |
| Formato de pesos | safetensors, model.bin (PyTorch), memory.pt (memoria simbolica serializada) |

## Arquitectura y entrenamiento

La arquitectura combina el transformer rotary de Qwen3-0.6B con un pipeline simbolico de dimension 1024. Los modulos simbolicos declarados son ThoughtDynamicsLNN (red neuronal liquida para dinamica de pensamiento), CrystallineProcessor (GNN con convoluciones DNAConv), LiquidThoughtProcessor y HelicalDNAProcessor. La memoria episodica persistente almacena 2048 vectores simbolicos con recuperacion entropica y contextual, serializada en memory.pt. El tokenizador incorpora tokens simbolicos personalizados como `<THM>`, `<LEM>` y `<D_IF>`, mapeados a logica mediante special_tokens_map.json.

El modelo esta afinado sobre 0xZee/dataset-CoT-Advanced-Calculus-268, un dataset de chain-of-thought orientado a calculo avanzado. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion completa del dataset, ni si se emplearon tecnicas de RLHF o DPO. El autor enmarca el desarrollo en el framework "Discrepancy Calculus (DISC)", una aproximacion de teoria de la medida que trata las singularidades de entrenamiento (mesetas de perdida, colapso de modos, olvido catastrofico) como senales estructurales. No se aportan metricas de validacion de dicho framework.

## Capacidades

- Generacion de texto en ingles con foco en razonamiento simbolico y logico.
- Razonamiento matematico y modelado procedimental (entrenado sobre CoT de calculo avanzado).
- Generacion de codigo a pequena escala (declarado como "small-code generation").
- Generacion de explicaciones basadas en grafos (graph-based explanation generation).
- Memoria episodica persistente de 2048 vectores simbolicos con recuperacion contextual.
- Modo "Dream": simulacion simbolica mediante ThoughtGenerator.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes multi-paso: no documentado explicitamente; la model card menciona agentes educativos y de investigacion como uso previsto.
- Capacidades multilingues: solo ingles declarado.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Agentes educativos con memoria: el modelo puede mantener una memoria persistente de 2048 vectores simbolicos para recordar pasos intermedios de una explicacion matematica entre turnos, adecuado para tutoria de calculo donde el contexto acumulado importa.
- Razonamiento simbolico en CPU: al partir de un backbone de 0,6B parametros, puede ejecutarse en CPU sin GPU, lo que lo hace util para prototipos de logica formal en portatiles o entornos sin acelerador.
- Generacion de explicaciones paso a paso de problemas de calculo: su afinado sobre CoT de calculo avanzado permite producir cadenas de razonamiento matematico estructurado para documentacion tecnica o material didactico.
- Planificacion procedimental: los modulos simbolicos y los tokens logicos (`<THM>`, `<LEM>`, `<D_IF>`) permiten estructurar planes con pasos verificables en pipelines de automatizacion sencillos.
- Generacion de codigo auxiliar: para scripts pequenos y tareas de transformacion de datos donde no se requiere un modelo grande, puede desplegarse en el mismo entorno de ejecucion que el codigo generado.
- Investigacion sobre arquitecturas hibridas: como objeto de estudio para quienes investigan la fusion de memorias simbolicas con transformers, dado que expone los modulos y la memoria serializada de forma inspeccionable.
- Experimentacion con inferencia en dispositivos embebidos: su tamano reducido permite probar tecnicas de inferencia de bajo consumo en hardware limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamano (596 M parametros), en fp16 requeriria aproximadamente 1,2 GB de pesos mas overhead de activaciones y memoria simbolica; en fp32, unos 2,4 GB.
- GPU recomendadas: no especificadas por el autor; por tamano, cualquier GPU consumer con 4 GB o mas de VRAM deberia poder alojarlo en fp16.
- Cabe en GPU consumer: si, previsiblemente en GTX 1650, RTX 3050, RTX 4060 y superiores, aunque no hay confirmacion oficial.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag endpoints_compatible). No se documentan soportes de vLLM, llama.cpp u Ollama, ni variantes GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Symbiotic-1B | 596 M | no disponible | AFL-3.0 | Hugging Face | Hibrido simbolico-transformer, solo ingles |
| Qwen/Qwen3-0.6B | 0,6 B | no disponible en esta ficha | Apache 2.0 (segun modelo base) | Hugging Face | Modelo base; sin modulos simbolicos |
| Symbiotic-8B (mismo autor) | no disponible | no disponible | no disponible | Hugging Face | Variante mayor de la misma familia |
| Symiotic-14B (mismo autor) | no disponible | no disponible | no disponible | Hugging Face | Variante mayor de la misma familia |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Fluidez en lenguaje libre inferior a la de variantes mayores, segun el propio autor.
- La precision simbolica depende de la curacion de la memoria; sin mantenimiento, el rendimiento logico puede degradarse.
- El modo "Dream" requiere calentamiento o sembrado simbolico para consultas complejas, segun la model card.
- Solo soporta ingles; no se declaran capacidades multilingues.
- Riesgo de alucinacion no cuantificado; no hay benchmarks publicados que permitan estimarlo.
- Sesgos conocidos: no documentados en la informacion disponible.
- Licencia AFL-3.0: permite uso comercial, pero conviene revisar las condiciones de atribucion y las obligaciones de la licencia antes de integrarlo en produccion.
- Documentacion tecnica escasa: no se detallan datos de entrenamiento, contexto maximo ni proceso de alineacion, lo que dificulta evaluar su fiabilidad en produccion.
- Traccion muy limitada (5 likes, 3058 descargas) y sin validacion independiente conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Symbiotic-1B
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Dataset de entrenamiento: https://huggingface.co/datasets/0xZee/dataset-CoT-Advanced-Calculus-268
- Perfil del autor: https://huggingface.co/reaperdoesntknow
- Symbiotic-8B: https://huggingface.co/reaperdoesntknow/Symbiotic-8B
- Symiotic-14B: https://huggingface.co/reaperdoesntknow/Symiotic-14B
- Symbiotic-Beta: https://huggingface.co/reaperdoesntknow/Symbiotic-Beta
- Discrepancy Calculus (paper, DOI 10.57967/hf/8194): https://huggingface.co/reaperdoesntknow/Discrepancy_Calculus
- Structure Over Scale (DOI 10.57967/hf/8165): https://huggingface.co/reaperdoesntknow/Structure-Over-Scale
- Three Teachers to Dual Cognition (DOI 10.57967/hf/8184): https://huggingface.co/reaperdoesntknow/DualMind_Methodolgy
