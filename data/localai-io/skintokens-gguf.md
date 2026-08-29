# LocalAI-io/SkinTokens-GGUF

## Resumen

SkinTokens es un modelo de aprendizaje automatico desarrollado por VAST-AI que resuelve el problema del rigging automatico de mallas 3D. Dada una malla estatica, predice un esqueleto completo y los pesos de skinning (vertex-to-bone) necesarios para deformar la superficie durante la animacion. El modelo se basa en una representacion aprendida, compacta y discreta de los pesos de skinning, y utiliza un framework autoregresivo unificado llamado TokenRig que modela todo el rig (esqueleto y pesos) como una unica secuencia de tokens.

Esta ficha corresponde a la conversion GGUF publicada por LocalAI-io, que adapta los pesos originales a los formatos F16 y F32 para su ejecucion con `skin-tokens.cpp`, una implementacion en C++23 sobre GGML que soporta CPU y Vulkan. La conversion no implica reentrenamiento: se trata de un cambio de formato y precision para facilitar el despliegue en entornos sin dependencias de Python ni GPUs dedicadas. El modelo base es `VAST-AI/SkinTokens` y la licencia es MIT.

El repositorio contiene tres componentes por bundle: un encoder de puntos (Michelangelo), un policy TokenRig basado en Qwen3-0.6B y un VAE de skinning (SkinVAE). El total de parametros segun los safetensors del repo es de 28.848.384, aunque el componente TokenRig por si solo corresponde a un modelo Qwen3-0.6B. El tamano total del repositorio es de 3.6 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de puntos (Michelangelo) + policy autoregresivo TokenRig (Qwen3-0.6B) + VAE de skinning (SkinVAE) |
| Parametros totales | 28.848.384 (segun safetensors del repo; el componente TokenRig es Qwen3-0.6B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre mallas 3D) |
| Tipos de cuantizacion | F16, F32 |
| Idiomas soportados | no disponible (no es un modelo de texto) |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

SkinTokens se compone de tres modulos diferenciados. El primero es un encoder de puntos basado en la arquitectura Michelangelo, que procesa la malla de entrada y genera una representacion latente. El segundo es TokenRig, un policy autoregresivo basado en Qwen3-0.6B que modela la generacion del rig como una secuencia de tokens discretos, incluyendo la jerarquia del esqueleto y los pesos de skinning. El tercero es SkinVAE, un VAE condicional que actua como codificador y decodificador de las condiciones de skinning, permitiendo reconstruir los pesos finales a partir de la representacion latente.

El entrenamiento del modelo original se describe en el repositorio de VAST-AI-Research, aunque la informacion disponible en esta ficha no incluye detalles sobre el dataset, el numero de tokens de entrenamiento ni el uso de tecnicas como RLHF o DPO. La conversion GGUF no altera los pesos: solo cambia la precision numerica (F16 como distribucion normal y F32 como referencia para trabajos de paridad CPU/Vulkan). El runtime `skin-tokens.cpp` verifica la identidad de los archivos mediante hashes embebidos, por lo que los tres ficheros de cada bundle deben mantenerse juntos.

## Capacidades

- Rigging automatico de mallas 3D estaticas: genera un esqueleto jerarquico completo y pesos de skinning listos para importar en pipelines 3D estandar.
- Generacion de pesos de skinning aprendidos: a diferencia de metodos heuristicos, los pesos se obtienen mediante un VAE entrenado, lo que permite capturar deformaciones complejas.
- Soporte para mallas arbitrarias: no requiere modelos auxiliares como Trellis2 o Kimodo para funcionar.
- Ejecucion en CPU y Vulkan: gracias a la implementacion GGML, puede ejecutarse sin GPU dedicada.
- Integracion con flujos de trabajo existentes: permite suministrar un esqueleto previo si se necesita conservar una jerarquia de animacion concreta.
- Postprocesado incluido: el comando `skintokens-cli rig` aplica un paso de postprocesado para refinar el resultado.

## Casos de uso

- Animacion de personajes para videojuegos: un artista puede tomar una malla base sin rig y obtener automaticamente un esqueleto y pesos de skinning listos para importar en motores como Unity o Unreal, reduciendo horas de trabajo manual.
- Produccion de VFX y cine: en pipelines de efectos visuales, el rigging automatico acelera la preparacion de assets 3D para animacion, especialmente en tomas con multiples variaciones de un mismo modelo.
- Creacion de avatares para realidad virtual y aumentada: al recibir una malla escaneada o generada proceduralmente, el modelo produce un rig funcional sin intervencion manual.
- Automatizacion de pipelines de contenido 3D: integrado en herramientas de linea de comandos o CI/CD, permite generar rigs de forma masiva para bibliotecas de assets.
- Prototipado rapido en estudios independientes: estudios pequenos sin especialistas en rigging pueden usar el modelo para preparar personajes rapidamente.
- Investigacion en animacion y graficos por computador: sirve como base para experimentos sobre representaciones aprendidas de skinning y generacion autoregresiva de estructuras articuladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de la conversion GGUF no incluye metricas de rendimiento, y la informacion del modelo original no proporciona tablas comparativas en los materiales consultados.

## Requisitos de hardware

- VRAM estimada: no disponible, pero al ser una implementacion GGML CPU/Vulkan, puede ejecutarse sin GPU dedicada.
- GPU recomendadas: no se especifican; el runtime soporta Vulkan, por lo que cualquier GPU con drivers Vulkan puede acelerar la inferencia.
- Compatibilidad con hardware de consumo: si, al poder ejecutarse en CPU, es viable en portatiles y equipos de escritorio convencionales.
- Opciones de despliegue: `skin-tokens.cpp` (C++23, GGML) con soporte CPU y Vulkan; no se mencionan integraciones con vLLM, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos directamente comparables en la misma categoria (rigging automatico de mallas 3D mediante aprendizaje profundo). Alternativas comerciales como Auto-Rig Pro o Mixamo son herramientas heuristicas o basadas en reglas, no modelos de IA entrenados, por lo que no se pueden comparar en terminos de parametros o rendimiento. Se indica "no disponible" para esta seccion.

## Limitaciones y advertencias

- La conversion GGUF no incluye reentrenamiento; cualquier limitacion del modelo original se mantiene en esta version.
- El runtime `skin-tokens.cpp` es la unica via de ejecucion documentada; no se garantiza compatibilidad con otros motores de inferencia.
- Los tres archivos de cada bundle deben mantenerse juntos, ya que el runtime verifica sus identidades embebidas en tiempo de carga.
- No se proporcionan datos sobre sesgos, alucinaciones o limitaciones de contexto, al tratarse de un modelo no textual.
- La licencia MIT permite uso comercial, pero se recomienda revisar la model card original de `VAST-AI/SkinTokens` para confirmar condiciones adicionales sobre los datos de entrenamiento.
- El modelo esta orientado a mallas 3D; no es adecuado para tareas de generacion de texto, codigo o vision general.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LocalAI-io/SkinTokens-GGUF
- Modelo original: https://huggingface.co/VAST-AI/SkinTokens
- Repositorio de SkinTokens (VAST-AI-Research): https://github.com/VAST-AI-Research/SkinTokens
- Repositorio de skin-tokens.cpp: https://github.com/localai-org/skin-tokens.cpp
- Documentacion de LocalAI: https://localai.io/docs/models/
