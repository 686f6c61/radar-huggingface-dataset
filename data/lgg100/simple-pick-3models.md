# LGG100/simple-pick-3models

## Resumen

`LGG100/simple-pick-3models` es un repositorio que agrupa tres checkpoints de políticas de robótica entrenadas sobre la tarea `simple-pick-eef` del robot Unitree G1 (91 episodios, acciones duales de efector final de 16 dimensiones). No se trata de un modelo de lenguaje, sino de un paquete de pesos para control robótico que reúne tres enfoques distintos: FastWAM (fine-tune completo de Wan2.2-TI2V-5B), ImageWAM (FLUX.2-klein-4B con LoRA) y π0.5 (openpi). Lo publica el usuario LGG100 sin model card convencional más allá de las instrucciones de despliegue.

El interés reside en que permite reproducir y comparar tres arquitecturas de política visomotora sobre una misma tarea y un mismo conjunto de datos, con código de inferencia incluido y un protocolo de comunicación msgpack compartido. Cada checkpoint se sirve con su propio script y puerto, lo que facilita la evaluación lado a lado.

El repositorio pesa 56,3 GB y contiene únicamente pesos en formato safetensors y `.pt`; los pesos base (Wan2.2-TI2V-5B, FLUX.2-klein-4B, PaliGemma) no están incluidos y deben descargarse por separado. No hay información sobre licencia, idiomas ni pipeline declarados en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tres políticas: FastWAM (Wan2.2-TI2V-5B, fine-tune completo), ImageWAM (FLUX.2-klein-4B + LoRA), π0.5 (openpi, basada en PaliGemma) |
| Parametros totales | no disponible (depende del modelo base de cada checkpoint) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (prompt de tarea en inglés, byte a byte) |
| Licencia | no disponible |
| Formato de pesos | safetensors y `.pt` (PyTorch); π0.5 incluye parámetros JAX y conversión a PyTorch |

## Arquitectura y entrenamiento

FastWAM parte de Wan2.2-TI2V-5B con un fine-tune completo sobre la tarea, con un ActionDiT específico (`ActionDiT_linear_interp_Wan22_alphascale_1024hdim.pt`) y caché de embeddings de prompt T5. ImageWAM utiliza FLUX.2-klein-4B con adaptadores LoRA y embeddings de prompt precalculados en `.npz`. π0.5 se apoya en la implementación openpi, con tokenizador PaliGemma y checkpoint final en el paso 19999 de 20000, con estadísticas de normalización en `assets/`.

El entrenamiento se realizó sobre 91 episodios de la tarea `simple-pick-eef`, con acciones de 16 dimensiones para doble brazo en espacio de efector final. El prompt debe coincidir byte a byte: `Pick up the pink cube with the nearer arm and place it into the green bin.` No se documentan número de tokens, composición del dataset, ni uso de RLHF/DPO. El repositorio incluye únicamente código de inferencia (no scripts de entrenamiento).

## Capacidades

- Control robótico visomotor para tarea de pick-and-place sobre Unitree G1.
- Generación de acciones en espacio de efector final (EEF) de 16 dimensiones para doble brazo.
- Soporte opcional de espacio articular (`--state-space joint` / `--action-space joint`, requiere `pip install pin` y URDF).
- Servido mediante protocolo msgpack compartido entre cliente y los tres servidores (`g1-client`).
- FastWAM expone un servidor EEF reutilizable para cualquier modelo `*_eef` (`serve_stack_cube_eef.py`).
- No se documentan capacidades de tool calling, agentes, multilingüismo ni thinking mode.

## Casos de uso

- Evaluación comparativa de políticas visomotoras: desplegar los tres checkpoints en paralelo (puertos 8010, 8000 y 8020) sobre el mismo escenario y comparar tasas de éxito en la tarea `simple-pick-eef`.
- Reproducción de experimentos: el layout de directorios replica los repos de entrenamiento, lo que permite reutilizar configuraciones y estadísticas de normalización sin reescribir rutas.
- Investigación en imitación robótica: los 91 episodios y las tres arquitecturas (difusión sobre Wan2.2, LoRA sobre FLUX.2, openpi con PaliGemma) sirven como banco de pruebas para estudiar el efecto del modelo base en políticas visomotoras.
- Integración con el cliente G1: el códec msgpack compartido permite conectar un cliente físico o simulado al servidor de política sin adaptar el protocolo.
- Prototipado de pick-and-place con doble brazo: el modo EEF passthrough delega la cinemática al cliente, lo que simplifica el despliegue cuando ya se dispone de un stack cinemático.
- Despliegue con espacio articular: usando `--state-space joint` y el URDF incluido, se puede operar en espacio de articulaciones para control de bajo nivel.
- Fine-tuning posterior: al estar los checkpoints en `.pt` y safetensors con configs y norm stats, sirven como punto de partida para nuevas tareas sobre el mismo robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño del repositorio: 56,3 GB (solo checkpoints, sin pesos base).
- Los pesos base (Wan2.2-TI2V-5B, FLUX.2-klein-4B, PaliGemma) deben descargarse aparte; el requisito de VRAM total es la suma de base más checkpoint.
- VRAM estimada para inferencia: no disponible (no se documenta cuantización ni requisitos).
- GPU recomendadas: no disponible.
- Despliegue: scripts propios (`serve_stack_cube_eef.py`, `serve_imagewam_g1.py`, `serve_policy.py`); π0.5 se ejecuta con `uv run`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Tipo de adaptación | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FastWAM (este repo) | Wan2.2-TI2V-5B | Fine-tune completo | simple-pick-eef | no disponible | Incluido en el repo |
| ImageWAM (este repo) | FLUX.2-klein-4B | LoRA | simple-pick-eef | no disponible | Incluido en el repo |
| π0.5 (este repo) | PaliGemma (openpi) | Fine-tune | simple-pick-eef | no disponible | Incluido en el repo |

No se dispone de datos de benchmarks ni de modelos externos comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, código ni responde a prompts generales.
- Entrenado exclusivamente para la tarea `simple-pick-eef`; el prompt debe coincidir byte a byte o el comportamiento no está garantizado.
- Solo 91 episodios de entrenamiento: riesgo de sobreajuste y baja generalización a otras tareas u objetos.
- Los pesos base no están incluidos; sin ellos los checkpoints no son utilizables.
- Licencia no declarada: no se puede asumir uso comercial sin verificar los términos de los modelos base (Wan2.2, FLUX.2, PaliGemma/openpi).
- El modo articular requiere instalar `pin` y disponer del URDF; el modo EEF delega la cinemática al cliente.
- Sin datos de benchmarks, cuantización, latencia ni requisitos de hardware: no apto para planificación de producción sin validación previa.
- Repositorio sin descargas ni likes; sin evidencia de validación por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/LGG100/simple-pick-3models
- No se han encontrado otros enlaces (papers, blogs, repos o demos) en la información disponible.
