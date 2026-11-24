# seungkukim/cosmos3-edge-droid-ft-hybrid-100ep-1k

## Resumen

Cosmos3-Edge-Policy-DROID fine-tuned on hybrid DAgger MolmoSpaces rollouts es un modelo de política robótica (vision-language-action) obtenido mediante posentrenamiento del checkpoint `nvidia/Cosmos3-Edge-Policy-DROID` (revisión `a74e848c`). Lo publica el usuario `seungkukim` y su propósito es controlar un brazo manipulador DROID a partir de observaciones visuales multi-cámara y el estado articular, generando chunks de 32 acciones de posición articular absoluta.

El entrenamiento se realizó sobre el dataset `seungkukim/MolmoSpaces-PyRUA-Lean-Edge-DAgger-100ep`, compuesto por 370 episodios (305 exitosos, 65 fallidos) y 84.790 fotogramas a 15 fps, grabados en el simulador MolmoSpaces con una estrategia híbrida DAgger en la que un experto PyRUA-Lean y el propio aprendiz Cosmos3-Edge comparten el control. La pérdida de acción se enmascara a los pasos del experto (62 % de los fotogramas), mientras que todos los fotogramas sirven como contexto visual.

El checkpoint publicado corresponde al paso 1000 de entrenamiento, exportado con pesos EMA y con el layout idéntico al de la política base. El modelo tiene 3.369.657.024 parámetros y un tamaño de repositorio de 7,7 GB, lo que lo sitúa en la gama "Edge" de la familia Cosmos3 de NVIDIA, orientada a inferencia en robótica de laboratorio y despliegues con requisitos de latencia ajustados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cosmos3 (vision-language-action, tipo `cosmos3_omni`; módulos `moe_gen`, `time_embedder`, `vae2llm`, `llm2vae`, `action2llm`, `llm2action`, `action_modality_embed`; VAE Wan2.2) |
| Parametros totales | 3.369.657.024 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (ventana de 33 fotogramas de vídeo por consulta en modo `wam`) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16) |
| Idiomas soportados | no disponible (el prompt es una descripción de tarea en formato JSON) |
| Licencia | NVIDIA OpenMDW-1.1 (`openmdw-1.1`, etiquetada como `other`) |
| Formato de pesos | safetensors (con `custom_code` de `cosmos-framework`; torre de visión y procesador incluidos) |

## Arquitectura y entrenamiento

El modelo es un posentrenamiento completo del checkpoint `nvidia/Cosmos3-Edge-Policy-DROID`, incluyendo las cabezas de acción. La arquitectura combina un codificador VAE de Wan2.2 (compilado con AOT) para las observaciones visuales, un modelo generativo con mezcla de expertos (`moe_gen`) y módulos de proyección entre el espacio latente visual, el espacio del LLM y el espacio de acciones (`vae2llm`, `llm2vae`, `action2llm`, `llm2action`). El modo de tarea es `wam`: chunks de 32 pasos de posición articular absoluta más una fila de estado, con 33 fotogramas de vídeo como contexto. Las vistas se concatenan en 480p (muñeca arriba, dos vistas exteriores abajo).

El entrenamiento se ejecutó con `cosmos-framework` en el commit `a3fb346` más un parche de enmascaramiento de experto y velocidad incluido con el dataset (sha256 `70b94f2a...`), bajo la receta `action_policy_droid_edge`. Se usaron 2 GPU H200 durante 2 h 24 min, batch global de 64 (32 por GPU × 2 × acumulación 1), 1000 pasos con AdamW fusionado (lr 1e-4, betas 0.9/0.95, eps 1e-6, weight decay 0), calentamiento lineal de 100 pasos y decaimiento coseno hasta 0 en el paso 1000. Se entrenó en bf16 con FSDP, grad clip de 0.1 y EMA de potencia con sigma_rel 0.1 (los pesos exportados son los EMA). Los módulos entrenados fueron `moe_gen`, `time_embedder`, `vae2llm`, `llm2vae`, `k_norm_und_for_gen`, `action2llm`, `llm2action` y `action_modality_embed`. La pérdida de acción se calcula solo sobre los pasos marcados como experto (`action.is_expert = 1`), y las ventanas sin acción experta se descartan. Se aplicó aumento de datos con recorte aleatorio al 95 % + redimensionado y ColorJitter (0.3, 0.4, 0.5, 0.08) en GPU, y dropout de caption de 0.1. Los pesos de pérdida fueron visión 10 y acción 10. La normalización de acciones es nula (articulaciones en bruto, pinza 0..1), igual que en la política base.

## Capacidades

- Control robótico de manipulación: genera 32 acciones por consulta en forma de posiciones articulares absolutas (7 articulaciones) más posición de pinza.
- Percepción visual multi-cámara: consume tres vistas simultáneas (muñeca izquierda y dos exteriores izquierdas) en 480p concatenado.
- Condicionamiento por lenguaje: acepta una descripción de tarea en formato JSON mediante el procesador propio de la política.
- Aprendizaje por imitación con DAgger híbrido: entrenado con datos donde el experto y el aprendiz comparten control, lo que aporta ejemplos de recuperación ante estados de error.
- Generación de vídeo latente como contexto: el modelo usa 33 fotogramas de vídeo como ventana de contexto para la predicción de acciones.
- No se documentan capacidades de tool calling, agentes multi-paso, matemáticas, código ni audio en la información disponible.

## Casos de uso

- Manipulación de laboratorio en simulación MolmoSpaces: el modelo puede desplegarse como política de control en el simulador para tareas de picking y colocación, usando las tres vistas y el estado articular como observación, tal como se entrenó.
- Investigación en aprendizaje por imitación: sirve como línea base para comparar recetas DAgger híbridas frente al entrenamiento solo con datos de experto (el autor publica un checkpoint paralelo `cosmos3-edge-droid-ft-pyrualean-100ep-1k` con la misma receta sobre datos solo de experto).
- Evaluación de robustez ante episodios fallidos: al incluir 65 episodios fallidos en el entrenamiento, el modelo puede emplearse para estudiar la recuperación de políticas ante estados fuera de distribución.
- Prototipado de políticas VLA en hardware DROID: el servidor `action_policy_server_robolab` permite levantar el checkpoint en el puerto 8000 y conectarlo a un cliente que envíe las claves de observación documentadas.
- Estudio de enmascaramiento de pérdida por experto: el parche de enmascaramiento publicado con el dataset permite reproducir experimentos sobre qué fracción de pasos de experto (aquí el 62 %) es suficiente para el posentrenamiento.
- Fine-tuning posterior sobre nuevos entornos: al mantener el layout de pesos de la política base, el checkpoint puede servir como inicialización para nuevos posentrenamientos con `cosmos-framework` en otros datasets de robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito en tareas, comparativas con la política base ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 3.369.657.024 parámetros, en bf16 los pesos ocupan aproximadamente 6,7 GB; en fp32, unos 13,5 GB. El repositorio completo ocupa 7,7 GB.
- GPU recomendadas: el entrenamiento se realizó en 2× H200; para inferencia no se documenta una GPU mínima. Por tamaño de pesos, cabría en GPUs con 16 GB o más en bf16, aunque el VAE Wan2.2 y las vistas de vídeo añaden memoria no cuantificada.
- Cabe en GPU de consumo: probablemente sí en tarjetas con 16-24 GB (RTX 4090, RTX 3090) en bf16, sujeto a la memoria adicional del codificador VAE y del contexto de vídeo; no confirmado por el autor.
- Opciones de despliegue: `cosmos_framework.scripts.action_policy_server_robolab` con `--checkpoint_path`, `--port 8000`, `--format-prompt-as-json True` y `--guidance-interval 960 1001`. No se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `seungkukim/cosmos3-edge-droid-ft-hybrid-100ep-1k` | 3.369.657.024 | 33 fotogramas (modo `wam`) | OpenMDW-1.1 | Hugging Face, 0 descargas |
| `nvidia/Cosmos3-Edge-Policy-DROID` (base) | no disponible en la información | no disponible | OpenMDW-1.1 | Hugging Face (NVIDIA) |
| `seungkukim/cosmos3-edge-droid-ft-pyrualean-100ep-1k` | no disponible en la información | no disponible | OpenMDW-1.1 (derivada) | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado específicamente en el simulador MolmoSpaces con el brazo DROID; su transferencia a un robot físico real no está validada en la información disponible.
- El 38 % de los fotogramas de entrenamiento corresponden a pasos del aprendiz y no contribuyen a la pérdida de acción; la señal de acción efectiva es de 52.622 fotogramas.
- Se incluyen 65 episodios fallidos en el dataset, lo que puede introducir comportamientos subóptimos si no se filtra en la evaluación.
- Solo se entrenó durante 1000 pasos; no hay evidencia de convergencia ni de que checkpoints posteriores no existan o sean mejores.
- No se documentan sesgos, tasas de alucinación ni evaluación multilingüe; el prompt es una descripción de tarea en JSON.
- La licencia OpenMDW-1.1 es una licencia de NVIDIA con términos específicos; debe revisarse antes de uso comercial. El campo `license` de Hugging Face figura como `other`.
- El modelo requiere el código personalizado de `cosmos-framework` y una revisión concreta del framework más un parche para reproducir el entrenamiento.
- No se especifican requisitos de memoria, latencia ni compatibilidad con aceleradores distintos de las H200 usadas en entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/seungkukim/cosmos3-edge-droid-ft-hybrid-100ep-1k
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Edge-Policy-DROID
- Dataset de entrenamiento: https://huggingface.co/datasets/seungkukim/MolmoSpaces-PyRUA-Lean-Edge-DAgger-100ep
- Checkpoint paralelo (solo experto): https://huggingface.co/seungkukim/cosmos3-edge-droid-ft-pyrualean-100ep-1k
