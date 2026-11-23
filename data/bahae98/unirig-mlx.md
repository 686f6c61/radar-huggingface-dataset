# bahae98/unirig-mlx

## Resumen

UniRig es un framework de rigging automatico de modelos 3D desarrollado por la Universidad de Tsinghua y Tripo (VAST-AI), presentado en SIGGRAPH'25 (TOG). El repositorio `bahae98/unirig-mlx` es una conversion no oficial a formato MLX del checkpoint original de UniRig, publicada por el usuario `bahae98`. No se trata de un modelo de lenguaje, sino de un sistema de dos etapas que combina un transformer autorregresivo tipo GPT para predecir esqueletos y un mecanismo de cross-attention para predecir pesos de skinning por vertice.

El modelo resuelve el problema de automatizar el rigging de activos 3D (creacion de esqueleto y asignacion de pesos de piel), una tarea tradicionalmente manual y costosa en animacion 3D. La propuesta unifica categorias diversas (humanos, animales, objetos) bajo un unico framework, usando una tokenizacion especifica de arbol de esqueleto (Skeleton Tree Tokenization) que representa jerarquias topologicamente validas de forma compacta.

El repo ocupa 1,5 GB y contiene pesos en safetensors, presumiblemente convertidos para su uso con el framework MLX de Apple. La model card del repo original referencia el paper arXiv:2504.12451 y el checkpoint oficial en `VAST-AI/UniRig`. No se dispone de informacion sobre parametros, contexto o licencia en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo tipo GPT (prediccion de esqueleto) + Bone-Point Cross Attention (skinning) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente MLX) |
| Idiomas soportados | no disponible (modelo 3D, no linguistico) |
| Licencia | no disponible |
| Formato de pesos | safetensors (conversion MLX) |

## Arquitectura y entrenamiento

UniRig se compone de dos etapas. La primera es un transformer autorregresivo similar a GPT que predice una jerarquia de esqueleto topologicamente valida mediante un esquema de tokenizacion de arbol de esqueleto (Skeleton Tree Tokenization), que codifica la estructura osea de forma compacta y secuencial. La segunda etapa emplea un mecanismo de Bone-Point Cross Attention que, a partir del esqueleto predicho y la geometria de la malla de entrada, calcula pesos de skinning por vertice y atributos oseos (por ejemplo, rigidez para simulacion fisica).

Segun la model card, el checkpoint disponible publicamente fue entrenado sobre el dataset Articulation-XL2.0, mientras que los checkpoints completos entrenados sobre Rig-XL/VRoid estan planificados para futuras releases. No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO (no aplicables en el sentido habitual a un modelo 3D). El sucesor SkinTokens unifica ambas etapas en una unica secuencia autorregresiva con tokens discretos de piel y anade RL, pero no forma parte de este repositorio.

## Capacidades

- Prediccion automatica de esqueletos topologicamente validos para mallas 3D de humanos, animales y objetos.
- Prediccion de pesos de skinning por vertice mediante cross-attention entre huesos y puntos de la malla.
- Generacion de jerarquias oseas compactas mediante tokenizacion de arbol de esqueleto.
- Soporte previsto (no incluido en esta release) para prediccion de atributos oseos como rigidez para simulacion fisica.
- Disenado para flujos human-in-the-loop con posible refinamiento iterativo.
- No es un modelo linguistico: no soporta tool calling, agentes, razonamiento textual ni capacidades multilingues.
- No incorpora vision por imagen en el sentido de VLM; opera sobre representaciones geometricas de mallas 3D.

## Casos de uso

- Automatizacion de pipelines de animacion 3D: el modelo genera esqueletos y pesos de skinning para activos recien modelados, reduciendo el tiempo manual de rigging en produccion de videojuegos y cine.
- Prototipado rapido de personajes: permite obtener un rig funcional a partir de una malla sin intervencion de un rigger, adecuado para iteraciones tempranas de diseno.
- Generacion de activos para motores de juego: integrable en pipelines que convierten mallas en assets listos para animacion con keyframes, como muestran los ejemplos del repo (demonio, dragon, conejo).
- Rigging de activos generados por IA 3D: combinado con modelos texto-a-3D, cierra el flujo desde prompt hasta malla animable.
- Investigacion en aprendizaje geometrico: sirve como baseline reproducible para experimentos de prediccion de esqueletos y skinning sobre Articulation-XL2.0.
- Despliegue en hardware Apple Silicon: la conversion MLX permite ejecutar el modelo en equipos Mac con GPU unificada, util para estudios pequenos sin acceso a GPUs NVIDIA.
- Preprocesado para simulacion fisica: los atributos oseos previstos (cuando se liberen) permitirian configurar movimiento secundario basado en fisica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona resultados state-of-the-art en el paper sobre Rig-XL/VRoid, pero no se incluyen cifras numericas en la informacion proporcionada, por lo que no se presentan tablas comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el repo pesa 1,5 GB, lo que sugiere que los pesos caben en GPUs consumer con al menos 4-8 GB, pero no se confirma.
- GPU recomendadas: no disponible. Al ser una conversion MLX, el objetivo principal es Apple Silicon (M1/M2/M3/M4) con memoria unificada.
- Cabe en GPU consumer: probablemente si, dado el tamano del repo, pero no confirmado.
- Opciones de despliegue: MLX (formato nativo del repo); el repo original de UniRig usa PyTorch >= 2.3.1 y Python 3.11.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| UniRig (este repo, MLX) | Transformer autorregresivo + cross-attention | Esqueleto + skinning en dos etapas | no disponible | Hugging Face (bahae98/unirig-mlx) |
| UniRig oficial (VAST-AI/UniRig) | Igual, pesos PyTorch | Esqueleto + skinning | no disponible | Hugging Face (VAST-AI/UniRig) |
| SkinTokens | Autorregresivo unificado con RL | Esqueleto + skinning en una secuencia | no disponible | GitHub (VAST-AI-Research/SkinTokens) |

No se dispone de datos de parametros, contexto ni rendimiento de estas alternativas en la informacion proporcionada para una comparacion cuantitativa.

## Limitaciones y advertencias

- Repositorio no oficial: `bahae98/unirig-mlx` es una conversion de terceros; no hay garantia de equivalencia numerica con el checkpoint original.
- Licencia no especificada: no se puede confirmar el uso comercial; debe consultarse la licencia del repo original `VAST-AI/UniRig`.
- Checkpoint parcial: segun la model card, el checkpoint publico esta entrenado sobre Articulation-XL2.0 y los checkpoints completos de Rig-XL/VRoid estan pendientes.
- Atributos oseos (rigidez para fisica) aun no disponibles en esta release.
- Sin datos de benchmarks verificables en la informacion proporcionada; el rendimiento real no puede validarse.
- Riesgo de esqueletos incorrectos en mallas atipicas o con topologia no vista en entrenamiento; se recomienda revision humana.
- Sin soporte linguistico, tool calling ni agentes: no debe evaluarse como modelo de lenguaje.
- El ecosistema MLX limita el despliegue a hardware Apple; para GPUs NVIDIA u otras plataformas debe usarse el repo PyTorch original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bahae98/unirig-mlx
- Modelo oficial: https://huggingface.co/VAST-AI/UniRig
- Paper: https://arxiv.org/abs/2504.12451
- Pagina del proyecto: https://zjp-shadow.github.io/works/UniRig/
- Blog tecnico: https://www.tripo3d.ai/research/introducing-unirig-one-model-to-rig-them-all
- Repositorio GitHub: https://github.com/VAST-AI-Research/UniRig
- Sucesor SkinTokens: https://github.com/VAST-AI-Research/SkinTokens
- Dataset Articulation-XL2.0: https://huggingface.co/datasets/Seed3D/Articulation-XL2.0
