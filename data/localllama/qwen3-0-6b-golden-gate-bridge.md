# LocalLLaMA/Qwen3-0.6B-golden-gate-bridge

## Resumen

Qwen3-0.6B-golden-gate-bridge es un conjunto de vectores de direccion (steering vectors) publicado por el usuario LocalLLaMA sobre el modelo base Qwen/Qwen3-0.6B. No se trata de un modelo nuevo ni de un fine-tune: es un artefacto de representacion que permite modular en tiempo de inferencia la probabilidad de que el modelo genere contenido relacionado con el puente Golden Gate, sumando un vector al flujo residual de una capa del decodificador sin reentrenar pesos.

El metodo utilizado es PTS (Pivotal Token Search), una tecnica que localiza los tokens concretos del razonamiento del propio modelo donde se decide un comportamiento y deriva una direccion de activacion a partir de ellos. El paquete incluye dos vectores, `increase/` y `decrease/`, validados sobre preguntas reservadas frente a controles, con cambios medidos en la probabilidad de mencionar el concepto de 0,45 a 0,83 y de 0,45 a 0,08 respectivamente.

Su relevancia es fundamentalmente metodologica: demuestra que es posible controlar un comportamiento semantico concreto de un modelo pequeno (0,6B parametros) mediante activation steering, con soporte para MLX (Apple silicon) y PyTorch/transformers (CUDA, MPS, CPU) desde los mismos ficheros, y con un servidor compatible con la API de OpenAI que acepta un campo `steering` por peticion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vectores de steering (activation steering) sobre Qwen3-0.6B; el modelo base es un transformer decoder-only |
| Parametros totales | 0,6B (modelo base Qwen3-0.6B); los vectores anaden un unico vector al flujo residual, sin parametros adicionales significativos |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-0.6B; no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (los vectores se aplican sobre el modelo base en el backend elegido; la cuantizacion depende de como se cargue Qwen3-0.6B) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | vectores de steering cargables via `hf://` y ficheros del repo; backends MLX y PyTorch/transformers; incluye `report.json` con metricas de la ejecucion |

## Arquitectura y entrenamiento

El artefacto no entrena pesos del modelo base. PTS (Pivotal Token Search) identifica, dentro de las propias trayectorias de razonamiento de Qwen3-0.6B, los tokens pivote en los que se decide el comportamiento objetivo (en este caso, hablar del Golden Gate). A partir de esas activaciones se deriva un vector de direccion que se suma al flujo residual despues de un bloque del decodificador, en el mismo punto para ambos backends. La fuerza de aplicacion puede fijarse con `path:alpha`, usar la fuerza validada almacenada en el vector, o invertirse con alpha negativo; es posible apilar varios vectores.

La validacion se realizo sobre preguntas reservadas frente a controles, con numeros e intervalos recogidos en `report.json`. El vector `decrease/` reduce la probabilidad de 0,45 a 0,08 (-0,37) y supera a todos los controles; el vector `increase/` la eleva de 0,45 a 0,83 (+0,39), aunque segun la propia model card "mueve la aguja, pero no supera a todos los controles". No se detalla el numero de tokens, la composicion del dataset ni si hubo RLHF o DPO, ya que el proceso no es un entrenamiento supervisado clasico sino una busqueda de tokens pivote y derivacion de direcciones.

## Capacidades

- Generacion de texto condicionada: permite aumentar o disminuir la probabilidad de tratar el tema del Golden Gate en las respuestas del modelo base.
- Control en tiempo de inferencia sin fine-tuning: aplicacion de vectores sobre el flujo residual con fuerza configurable (`alpha`) y posibilidad de apilar varios vectores.
- Doble backend: MLX para Apple silicon y PyTorch/transformers para CUDA, MPS y CPU, con los mismos ficheros.
- Servidor compatible con OpenAI: endpoints `/v1/chat/completions`, `/v1/completions` (con streaming) y `/v1/models`, con campo `steering` por peticion y presets seleccionables como nombre de modelo.
- Aislamiento de cache: las peticiones con distinto steering nunca comparten lote ni cache KV.
- API de Python: contexto `steer(model, [(vector, None)])` que funciona tanto sobre modelos MLX como torch.
- Capacidades heredadas del modelo base Qwen3-0.6B (generacion de texto, chat con plantilla, modo thinking desactivable via `enable_thinking`), no documentadas de forma especifica en esta model card.

## Casos de uso

- Demostracion didactica de activation steering: usar los vectores `increase/` y `decrease/` sobre la misma pregunta para mostrar en vivo como cambia la respuesta, por ejemplo en el Space PTS visualizer o en un notebook con `pts steer --compare`.
- Investigacion en interpretabilidad: reproducir el pipeline de PTS para localizar tokens pivote en otros comportamientos y derivar nuevas direcciones, tomando este repositorio como referencia de validacion con controles e intervalos.
- Evaluacion de robustez de representaciones: medir cuanto se desplaza la distribucion de respuestas al aplicar el vector con distintas fuerzas (`alpha`) y comprobar si el efecto se mantiene fuera del conjunto de preguntas reservadas.
- Prototipado de servidores con control por peticion: desplegar `pts serve` y consumir el campo `steering` desde el cliente de OpenAI para experimentar con enrutado de comportamiento sin reentrenar.
- Pruebas en hardware de consumo: ejecutar el modelo base de 0,6B con los vectores en Apple silicon via MLX o en CPU/MPS via PyTorch, lo que permite validar el flujo completo sin GPU dedicada.
- Base para experimentos de mitigacion de sesgos o temas: el mismo mecanismo de vector `decrease/` sirve como plantilla para reducir la probabilidad de temas no deseados en modelos pequenos, siempre que se valide con controles propios.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son las metricas de validacion del propio artefacto, no benchmarks estandar de LLM.

| Vector | P(golden-gate-bridge) en preguntas reservadas | Cambio | Veredicto |
|---|---|---|---|
| `increase/` | 0,45 → 0,83 | +0,39 | mueve el comportamiento, pero no supera a todos los controles |
| `decrease/` | 0,45 → 0,08 | -0,37 | supera a todos los controles |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los numeros completos, controles e intervalos estan en `report.json` del repositorio.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; al tratarse de un modelo base de 0,6B, la huella es reducida y depende de la cuantizacion con la que se cargue Qwen3-0.6B.
- GPU recomendadas: no especificadas; el backend PyTorch soporta CUDA, MPS y CPU, y el backend MLX esta pensado para Apple silicon.
- Cabe en GPU de consumo: si, al operar sobre un modelo de 0,6B; la model card no detalla modelos concretos de GPU.
- Opciones de despliegue: `pts serve` (MLX con `mlx_lm.server` y batching, o PyTorch con transformers y una peticion a la vez), API de Python con `pts.steering.steer`, y CLI `pts steer`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la model card solo indica que el backend PyTorch atiende una peticion a la vez y que las peticiones con distinto steering no comparten lote ni cache KV.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-0.6B-golden-gate-bridge | Vectores de steering sobre Qwen3-0.6B | 0,6B (base) | no disponible | apache-2.0 | Hugging Face, 0 descargas, 0 likes |
| Qwen/Qwen3-0.6B | Modelo base de generacion de texto | 0,6B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |
| Otros conjuntos de steering vectors | Artefactos de activation steering | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros conjuntos de vectores de steering comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El vector `increase/` no supera a todos los controles segun la propia validacion del autor; su efecto es real pero no concluyente frente a lineas base.
- El alcance es muy estrecho: modula la probabilidad de un tema concreto (Golden Gate) en un modelo de 0,6B; no es un modelo de proposito general ni sustituye al modelo base.
- No se documentan sesgos conocidos, riesgo de alucinacion ni limitaciones de contexto o idioma especificas de este artefacto; deben evaluarse sobre el modelo base Qwen3-0.6B.
- La licencia apache-2.0 del repositorio de vectores no implica necesariamente las mismas condiciones para el modelo base; conviene verificar la licencia de Qwen/Qwen3-0.6B antes de uso comercial.
- El backend PyTorch atiende una peticion a la vez, lo que limita el throughput en produccion; el batching solo esta disponible en el backend MLX.
- Las peticiones solo pueden nombrar vectores registrados con `--vector` salvo que se active `--allow-any-vector`, lo que anade una consideracion de seguridad si se exponen rutas o ids `hf://` a clientes.
- El repositorio tiene 0 descargas y 0 likes y fue creado y actualizado el mismo dia (2026-11-02), por lo que no hay evidencia de uso en produccion ni validacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LocalLLaMA/Qwen3-0.6B-golden-gate-bridge
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Repositorio PTS: https://github.com/codelion/pts
- Space PTS visualizer: https://huggingface.co/spaces/codelion/pts-visualizer?vector=LocalLLaMA/Qwen3-0.6B-golden-gate-bridge
