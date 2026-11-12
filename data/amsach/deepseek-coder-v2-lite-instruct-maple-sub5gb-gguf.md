# AmSach/DeepSeek-Coder-V2-Lite-Instruct-MAPLE-Sub5GB-GGUF

## Resumen

DeepSeek-Coder-V2-Lite-Instruct-MAPLE-Sub5GB-GGUF es una cuantizacion estructural del modelo DeepSeek-Coder-V2-Lite-Instruct (13.456.756.224 parametros reales segun safetensors) desarrollada por Aman Sachan. Aplica una tecnica propia denominada MAPLE (Manifold-Activated Pruning of Latent Experts) que reduce el numero de expertos enrutados por capa de 64 a 54, conservando intactos los dos expertos compartidos invariantes. El resultado es un contenedor GGUF de 4,50 GB que cabe integramente en la VRAM de una GPU de portatil de 6 GB, evitando el offload parcial a CPU por PCIe.

El modelo base es un transformer MoE con atencion Multi-Head Latent Attention (MLA) de rango 512, 2,4B parametros activos por token y enrutamiento top-6. La poda afecta unicamente a los expertos enrutados (84,4 % de retencion), manteniendo la dimension intermedia de 1408 y la masa activa por token. El autor reporta velocidades de generacion de 65,6 a 76,3 tokens/s en una RTX 4050 Laptop de 6 GB, frente a los 4,5-10 tokens/s que se obtienen con las cuantizaciones oficiales Q4/Q8 en modo hibrido CPU/GPU.

Es relevante porque demuestra una via practica para ejecutar un MoE de 13,5B en hardware consumer de gama de entrada sin degradar la velocidad a niveles inutilizables. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con Multi-Head Latent Attention (MLA, rango 512) |
| Parametros totales | 13.456.756.224 (13,5B) |
| Parametros activos | 2,4B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (contenedor unico de 4,50 GB; nivel de cuantizacion exacto no especificado) |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (compatible con llama.cpp y Ollama) |

## Arquitectura y entrenamiento

El modelo base DeepSeek-Coder-V2-Lite-Instruct es un transformer de mezcla de expertos con atencion MLA. Cada una de las 27 capas MoE contiene 64 expertos enrutados mas 2 expertos compartidos invariantes; el enrutamiento es top-6 sobre los expertos enrutados. La dimension intermedia de cada experto es 1408. La variante MAPLE reduce los expertos enrutados de 64 a 54 por capa (retencion del 84,4 %), seleccionados mediante perfilado empirico de las manifold de activacion de tokens a traves de los 26 bloques MoE. Los expertos compartidos se conservan al 100 % y la masa activa por token permanece en 2,4B. El resultado es una reduccion de huella del 14,0 % (de 15,7B a 13,5B parametros) que permite que las 27 capas y la cache KV de MLA residan integramente en VRAM.

No se dispone de informacion sobre el corpus de entrenamiento original del modelo base ni sobre procesos de RLHF o DPO en la informacion proporcionada. El autor menciona un dataset de referencia `technical-code-corpus`, pero no detalla su composicion ni el volumen de tokens. La innovacion tecnica destacable es el propio metodo MAPLE de poda de expertos guiada por activacion, que difiere de la cuantizacion clasica al eliminar capacidades latentes no activadas en lugar de reducir precision.

## Capacidades

- Generacion de codigo en multiples lenguajes, con ejemplos verificados en C++20 (buffer circular SPSC lock-free con sincronizacion atomica) y Python (solver de programacion dinamica sobre hipergrafo dirigido con min-heap de Dijkstra).
- Generacion de scripts de produccion, como un rate limiter de token bucket distribuido con Redis y script Lua.
- Razonamiento multi-paso aplicado a problemas algoritmicos y de estructuracion de datos.
- Conversacion multi-turno (tag `conversational` en el repositorio).
- Compatibilidad con endpoints y despliegue via llama.cpp y Ollama.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles.
- Capacidades multilingues: limitadas a ingles (`en`).

## Casos de uso

- Desarrollo asistido en portatiles con GPU de 6 GB: el contenedor de 4,50 GB permite ejecutar el MoE completo en VRAM sin offload, con 65-76 tokens/s de generacion, lo que hace viable la autocompletacion y el chat de codigo en movilidad.
- Generacion de codigo C++ de sistemas: el modelo produce implementaciones con sincronizacion atomica y semantica de memoria correcta (ejemplo verificado de buffer SPSC), adecuado para prototipado de estructuras concurrentes.
- Algoritmos y estructuras de datos en Python: genera solvers de programacion dinamica y grafos (Dijkstra con min-heap) completos en una sola pasada de unos 18 segundos en RTX 4050.
- Scripts de infraestructura y backend: produce scripts Lua para Redis y logica de rate limiting lista para produccion, util en equipos que trabajan sobre servicios distribuidos.
- Entornos con restricciones de VRAM: al no requerir offload PCIe, evita el cuello de botella de 4,5-10 tokens/s de las cuantizaciones Q4/Q8 oficiales, adecuado para estaciones de trabajo moviles.
- Evaluacion e investigacion de tecnicas de poda de MoE: sirve como referencia reproducible del metodo MAPLE para comparar retencion de expertos frente a calidad.
- Despliegue local con Ollama o llama.cpp: integrable en flujos de trabajo de desarrollo sin infraestructura de servidor GPU.

## Benchmarks y rendimiento

Los datos disponibles son mediciones de velocidad en una HP Victus con AMD Ryzen 7 7840HS, NVIDIA RTX 4050 Laptop 6 GB, Windows 11 y CUDA 12.4. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible.

| Tarea | Prompt TPS | Gen TPS | Tiempo total | Estado reportado |
|---|---|---|---|---|
| Lock-Free SPSC Ring Buffer (C++20) | 236,07 | 65,64 | 19,59 s | Sincronizacion atomica correcta |
| Directed Hypergraph DP Solver (Python) | 370,15 | 64,70 | 18,60 s | Dijkstra con min-heap completo |
| Distributed Redis Token Bucket Rate Limiter | 270,41 | 65,04 | 18,04 s | Script Lua con fallbacks |

Uso de VRAM medido: 4.850 MiB de 6.141 MiB, con las 27 capas en VRAM (0 capas en CPU).

## Requisitos de hardware

- VRAM estimada: 4,50 GB de contenedor; medicion real de 4.850 MiB en RTX 4050 Laptop de 6 GB con las 27 capas en GPU.
- GPU recomendadas: RTX 4050/3050/2060 Laptop de 6 GB o superiores; cualquier GPU con al menos 5,5 GB de VRAM libre.
- Cabe en GPU consumer: si, en tarjetas de 6 GB o mas. En 6 GB hay que considerar el consumo de Windows DWM (~700-800 MB), que deja unos 5.340 MB utilizables.
- Opciones de despliegue: llama.cpp y Ollama (tags del repositorio). vLLM y TGI no estan indicados en la informacion disponible.
- Latencia y throughput: 65,6-76,3 tokens/s de generacion y 236-370 tokens/s de procesamiento de prompt en RTX 4050 Laptop. El autor reporta una mejora de 7,5x a 15x frente al modo hibrido con cuantizaciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| MAPLE Sub5GB (este) | 13,5B | 2,4B | no disponible | Apache 2.0 | GGUF 4,50 GB | 54 expertos/layer, 100 % en VRAM de 6 GB |
| DeepSeek-Coder-V2-Lite-Instruct (base) | 15,7B | 2,4B | no disponible | Apache 2.0 | safetensors | 64 expertos/layer, requiere offload en 6 GB |
| DeepSeek-Coder-V2-Lite-Instruct Q4 oficial | 15,7B | 2,4B | no disponible | Apache 2.0 | GGUF 8,57 GB | Excede 6 GB, offload PCIe, 4,5-10 TPS |
| DeepSeek-Coder-V2-Lite-Instruct IQ2 oficial | 15,7B | 2,4B | no disponible | Apache 2.0 | GGUF 5,64 GB | Ajusta al limite, menor calidad por cuantizacion agresiva |

## Limitaciones y advertencias

- La poda de expertos puede degradar la calidad en dominios poco representados en el perfilado de activacion; no se han publicado benchmarks de calidad que lo cuantifiquen.
- El modelo solo declara soporte de ingles (`en`); el rendimiento en castellano no esta verificado.
- La longitud de contexto no esta documentada en la informacion disponible; no debe asumirse la del modelo base sin verificacion.
- Riesgo de alucinacion inherente a los modelos de codigo: los ejemplos generados deben compilarse y testearse antes de usarse en produccion.
- El nivel exacto de cuantizacion del contenedor GGUF no se especifica, lo que dificulta estimar la perdida de precision frente al modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validacion independiente de la comunidad.
- La licencia Apache 2.0 permite uso comercial, pero las condiciones del modelo base deben verificarse por separado.
- El metodo MAPLE es una contribucion del autor sin publicacion revisada por pares en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/AmSach/DeepSeek-Coder-V2-Lite-Instruct-MAPLE-Sub5GB-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-Coder-V2-Lite-Instruct
- Contacto del autor: amansachan92905@gmail.com
