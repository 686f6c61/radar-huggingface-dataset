# reaperdoesntknow/Symbiotic-8B

## Resumen

Symbiotic-8B es un ajuste fino del modelo Qwen/Qwen3-8B publicado por el usuario reaperdoesntknow bajo el paraguas de Convergent Intelligence LLC: Research Division. Segun la model card, se presenta como un modelo hibrido "simbolico-transformer" que anade al backbone Qwen3-8B una serie de modulos simbolicos (ThoughtDynamicsLNN, CrystallineProcessor, LiquidThoughtProcessor y HelicalDNAProcessor) junto con un buffer de memoria persistente de 2048 vectores simbolicos. El objetivo declarado es combinar razonamiento simbolico de larga memoria con generacion de lenguaje de alta fidelidad.

El modelo conserva el tamano del Qwen3-8B original: 8.190.735.360 parametros totales en pesos safetensors, con licencia AFL-3.0 y un unico idioma declarado (ingles). El repositorio ocupa 43,1 GB, lo que incluye tanto los pesos en formato PyTorch (model.bin) como en safetensors, ademas del snapshot de memoria (memory.pt) y los ficheros de configuracion y tokenizador.

La relevancia de este modelo es limitada y debe interpretarse con cautela: la model card es en gran medida aspiracional, no documenta el proceso de entrenamiento con cifras verificables (tokens, composicion del dataset, tecnicas de alineamiento) y no aporta resultados de benchmarks. El unico dataset citado es 0xZee/dataset-CoT-Advanced-Calculus-268, un conjunto de Chain-of-Thought sobre calculo avanzado. Para un desarrollador que evalue modelos, conviene tratarlo como un experimento de investigacion mas que como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (backbone Qwen3-8B con rotary embeddings) mas modulos simbolicos propietarios declarados en la model card |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-8B, sin confirmar en la model card) |
| Tipos de cuantizacion | no disponible (el repo solo publica pesos en safetensors y PyTorch; no se ofrecen GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | en (ingles) |
| Licencia | afl-3.0 (Academic Free License 3.0) |
| Formato de pesos | safetensors, PyTorch (model.bin), memory.pt (snapshot de memoria simbolica) |

## Arquitectura y entrenamiento

El backbone es el transformer decoder-only de Qwen3-8B, con rotary positional embeddings. Sobre el se declaran cuatro modulos simbolicos adicionales: ThoughtDynamicsLNN (una capa de atencion LSTM multi-cabeza), CrystallineProcessor (una GNN basada en DNAConv), LiquidThoughtProcessor (plegado recurrente de simbolos) y HelicalDNAProcessor (proyeccion lineal helicoidal). La dimension simbolica declarada es 4096 y el buffer de memoria contiene 2048 vectores en float32 con recuperacion sensible a la entropia. Se menciona tambien un "Dream Mode" que genera cognicion simbolica de forma offline. No se aporta informacion sobre como se integran estos modulos en el grafo de computo del transformer ni sobre su impacto real en la inferencia.

En cuanto al entrenamiento, la model card no documenta el numero de tokens, la composicion del dataset (mas alla de citar 0xZee/dataset-CoT-Advanced-Calculus-268) ni si hubo RLHF, DPO o cualquier otra fase de alineamiento. De hecho, la propia model card indica explicitamente que el modelo "no esta ajustado a instrucciones" (not instruction-tuned). El marco teorico citado, "Discrepancy Calculus" (DISC), se describe con terminologia de teoria de la medida (operador de discrepancia, jump sets, ghost imprinting) y remite a un paper "de proxima publicacion"; no hay evidencia publicada que respalde estas afirmaciones.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del backbone Qwen3-8B.
- Razonamiento simbolico declarado: generacion de teoremas, encadenamiento logico y razonamiento estructurado con memoria retenida entre turnos (segun la model card; sin verificacion independiente).
- Modelado de codigo y demostraciones matematicas, segun los usos previstos declarados por el autor.
- Dialogo con persistencia de contexto mediante el buffer de memoria simbolica (2048 vectores).
- Tokens especiales adicionales para estructuras simbolicas: `<THM>`, `<PROOF>`, `<D_EPS>`.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni de razonamiento multi-paso orquestado.
- No se declara capacidad de vision ni de audio.
- No se declara modo "thinking" explicito (a diferencia de otras variantes de Qwen3).

## Casos de uso

- Experimentacion en razonamiento simbolico: el modelo puede emplearse como banco de pruebas para evaluar si los modulos simbolicos declarados aportan alguna mejora frente al Qwen3-8B base en tareas de logica formal, aunque requeriria una evaluacion propia porque no hay benchmarks publicados.
- Investigacion sobre memoria persistente en dialogo: el buffer de 2048 vectores permite explorar tecnicas de retencion de contexto entre turnos, util para prototipos de asistentes de investigacion que necesiten recordar hechos previos.
- Generacion de demostraciones matematicas asistida: dado el dataset CoT de calculo avanzado citado, puede usarse para generar borradores de pruebas paso a paso en entornos de estudio, siempre con revision humana.
- Tutoria academica experimental: la model card lo orienta a "memory-aware tutoring"; serviria para prototipos de tutoria en ingles donde el modelo recuerde el progreso del estudiante a lo largo de la sesion.
- Fine-tuning posterior como base: al ser un ajuste sobre Qwen3-8B con licencia AFL-3.0, puede servir como punto de partida para experimentos de ajuste supervisado en dominios cientificos, aunque la licencia debe revisarse antes de uso comercial.
- Analisis de la viabilidad de arquitecturas hibridas: util para investigadores que quieran reproducir o contrastar las afirmaciones de la model card sobre modulos LNN, GNN y memoria simbolica en un transformer de 8B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni comparaciones con el Qwen3-8B base.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 16,4 GB solo para pesos (8,19 mil millones de parametros a 2 bytes), mas overhead de activaciones y KV cache; en la practica, se recomienda al menos 24 GB para contexto moderado.
- VRAM estimada en FP32: unos 32,8 GB solo para pesos, lo que descarta GPU de consumo.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para BF16 con contexto amplio; RTX 4090 (24 GB) puede ser suficiente en BF16 con contexto limitado.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 en BF16 con contexto reducido; en GPUs de 16 GB requeriria cuantizacion, que no se distribuye oficialmente y habria que generar con herramientas externas.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag endpoints_compatible). No se han publicado pesos GGUF, por lo que llama.cpp y Ollama requeririan conversion manual.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Symbiotic-8B | 8,19 B | no disponible | AFL-3.0 | Hugging Face, safetensors y PyTorch | Ajuste de Qwen3-8B con modulos simbolicos declarados; sin benchmarks |
| Qwen/Qwen3-8B | 8,19 B | no disponible en esta ficha (modelo base) | Apache 2.0 (modelo base) | Hugging Face, amplio ecosistema (GGUF, vLLM, etc.) | Modelo base oficial, con benchmarks publicados por Alibaba |
| Modelos de 8B tipo Llama 3.1 8B | 8,03 B | 128 K (segun ficha oficial) | Llama 3.1 Community License | Hugging Face, amplio ecosistema | Alternativa consolidada, con soporte de cuantizacion y despliegue maduro |

La comparacion cuantitativa de rendimiento no es posible porque Symbiotic-8B no publica resultados. Frente al Qwen3-8B base, la diferencia declarada es la capa simbolica y la memoria persistente, sin evidencia publica de mejora.

## Limitaciones y advertencias

- No esta ajustado a instrucciones: las entradas tipo chat pueden requerir ingenieria de prompts para obtener respuestas utiles.
- Ausencia total de benchmarks: no hay evidencia publicada que respalde las capacidades de razonamiento simbolico declaradas.
- La model card contiene afirmaciones teoricas (Discrepancy Calculus) sin paper publicado y con terminologia no estandar; deben tratarse con escepticismo.
- Riesgo de alucinacion: al ser un modelo base sin alineamiento declarado, la probabilidad de generar contenido incorrecto con apariencia de solidez es alta, especialmente en dominios cientificos.
- Limitacion de idioma: solo se declara ingles; el rendimiento en castellano no esta garantizado.
- Licencia AFL-3.0: permite uso comercial con condiciones (atribucion y, en algunas versiones, clausulas de reciprocidad); conviene revisar el texto completo antes de desplegar en produccion.
- La memoria simbolica debe sembrarse activamente y su inferencia es "offline-evolved", lo que anade complejidad operativa y carga de CPU adicional segun el autor.
- El repositorio incluye pesos duplicados (model.bin y model.safetensors) y un memory.pt, lo que eleva el tamano a 43,1 GB y complica el despliegue en entornos con almacenamiento limitado.
- Sin cuantizaciones oficiales: no hay GGUF ni AWQ publicados, lo que limita el despliegue en hardware de consumo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Symbiotic-8B
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Dataset citado: https://huggingface.co/datasets/0xZee/dataset-CoT-Advanced-Calculus-268
- Paper de Discrepancy Calculus (referenciado en la model card): https://huggingface.co/reaperdoesntknow/Discrepancy_Calculus (DOI: 10.57967/hf/8194)
- Structure Over Scale (referenciado): https://huggingface.co/reaperdoesntknow/Structure-Over-Scale (DOI: 10.57967/hf/8165)
- Three Teachers to Dual Cognition (referenciado): https://huggingface.co/reaperdoesntknow/DualMind_Methodolgy (DOI: 10.57967/hf/8184)
- Modelos relacionados: https://huggingface.co/reaperdoesntknow/Symbiotic-1B, https://huggingface.co/reaperdoesntknow/Symiotic-14B, https://huggingface.co/reaperdoesntknow/Symbiotic-Beta
- Perfil del autor: https://huggingface.co/reaperdoesntknow
