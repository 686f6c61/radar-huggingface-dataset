# Myungkyu/cosmos3_mot_l27_d1024_robodojo_b64_60k_scratch_ema

## Resumen

`cosmos3_mot_l27_d1024_robodojo_b64_60k_scratch_ema` es un modelo de mundo (world model) de vídeo para robótica, derivado de Cosmos3-Nano y ajustado (fine-tuning) con un DiT de acciones externo que opera con condicionamiento unidireccional vídeo-a-acción y un calendario de acciones compartido. El resultado es una política de acción para control robótico en bucle cerrado. Lo publica el usuario Myungkyu en Hugging Face bajo el ecosistema `cosmos-framework`, con etiquetas de `robotics`, `world-model`, `action-policy` y `cosmos3`.

El nombre del repositorio codifica la configuración: arquitectura Mixture-of-Transformers (mot) con 27 capas, dimensión de modelo 1024, entrenamiento sobre el simulador RoboDojo con batch 64 y 60.000 pasos, entrenado desde cero (scratch) con pesos EMA. Se distribuye como checkpoint de entrenamiento en formato `torch.distributed.checkpoint` (DCP) de un solo rango, en bf16, sin estado del optimizador, con un peso total del repositorio de 31,6 GB (incluye pesos del world model y del DiT de acciones).

Es relevante porque ilustra el patrón emergente de usar modelos de mundo de vídeo como base para políticas robóticas: en lugar de entrenar una política desde cero, se parte de un modelo generativo de vídeo preentrenado y se acopla un experto de acciones que consume las representaciones latentes del vídeo. La licencia y los idiomas no están declarados, lo que condiciona su uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Transformers (mot) sobre Cosmos3-Nano; world model de vídeo + DiT de acciones externo con condicionamiento unidireccional vídeo-a-acción |
| Parámetros totales | no disponible (27 capas, dimensión 1024; recuento exacto no publicado) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos distribuidos en bf16) |
| Idiomas soportados | no disponible (modelo orientado a percepción visomotora, no a texto) |
| Licencia | no disponible |
| Formato de pesos | `torch.distributed.checkpoint` (DCP) de un solo rango: `model/.metadata` y `model/__0_0.distcp`, claves `net.*`, bf16 |

## Arquitectura y entrenamiento

El modelo parte de Cosmos3-Nano, un world model de vídeo del framework Cosmos, y le acopla un DiT de acciones externo. La interacción es unidireccional: el modelo de vídeo condiciona al experto de acciones, que comparte el calendario de difusión (action schedule) con la rama de vídeo. La nomenclatura `mot` sugiere una arquitectura Mixture-of-Transformers con 27 capas y dimensión 1024, en la que los tokens de vídeo y los de acción se procesan por expertos separados dentro de un mismo transformer.

El entrenamiento se realiza sobre RoboDojo Sim en formato LeRobot v3.0, con batch 64 durante 60.000 pasos y partiendo de cero en la política de acciones (scratch), aunque apoyado sobre los pesos preentrenados de Cosmos3-Nano. Los pesos publicados son los EMA (`net_ema`) del checkpoint final, convertidos a bf16 y renombrados a las claves `net.*`. El repositorio incluye además `config.yaml` con la configuración de entrenamiento (rutas sustituidas por marcadores como `<Cosmos3-Nano-dcp>`, `<dataset root>` y `<Wan2.2_VAE.pth>`) y `SHA256SUMS` con los hashes de integridad. El VAE utilizado es el de Wan2.2 (`Wan2.2_VAE.pth` de `Wan-AI/Wan2.2-TI2V-5B`), que debe apuntarse a una ruta local para cargar el modelo. No se han publicado detalles sobre número de tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO.

## Capacidades

- Generación de acciones robóticas en bucle cerrado a partir de observaciones visuales, gracias al condicionamiento vídeo-a-acción.
- Modelado de mundo de vídeo: predicción de la evolución visual del entorno como señal intermedia para la política.
- Política de acción (action policy) compatible con el servidor `cosmos-framework` mediante `--checkpoint-path` y `--config-file`.
- Soporte de simulador: entrenado y evaluado sobre RoboDojo Sim con episodios en formato LeRobot v3.0.
- No se documentan capacidades de texto, tool calling, agentes multietapa ni multilinguales; el modelo es un componente visomotor, no un LLM de propósito general.
- No se documentan modos especiales como thinking mode, audio o visión general fuera del dominio robótico.

## Casos de uso

- Manipulación robótica en simulación: el modelo recibe observaciones visuales de RoboDojo Sim y emite acciones de control; es adecuado como política de referencia para comparar algoritmos de imitation learning sobre la misma base Cosmos3-Nano.
- Investigación en world models para robótica: al separar el world model de vídeo y el DiT de acciones, permite estudiar cuánto conocimiento visual transfiere el preentrenamiento a la política final.
- Generación de datos sintéticos de trayectorias: el modelo de mundo puede usarse para anticipar futuros visuales y filtrar o aumentar demostraciones antes de entrenar políticas downstream.
- Evaluación de robustez visomotora: al ser un checkpoint EMA de un entrenamiento largo (60.000 pasos, batch 64), sirve como baseline estabilizado para medir sensibilidad a cambios de cámara, iluminación o texturas en simulación.
- Reproducción de experimentos: con `config.yaml` y `SHA256SUMS` incluidos, el repositorio permite reconstruir el pipeline de entrenamiento y verificar la integridad de los pesos en un clúster con el servidor `cosmos-framework`.
- Base para fine-tuning en dominios robóticos específicos: al estar en formato DCP y bf16, se puede reanudar el ajuste sobre nuevos datasets LeRobot sin partir del modelo original de Cosmos3-Nano.
- Prototipado de control en bucle cerrado en laboratorio: adecuado para validar la interfaz vídeo-a-acción antes de invertir en entrenamiento a mayor escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 31,6 GB en bf16, por lo que se necesita al menos una GPU con 40-48 GB para cargar los pesos completos sin cuantizar.
- GPU recomendadas: A100 80 GB, H100 80 GB o GPU con al menos 48 GB de memoria para cargar el checkpoint bf16 junto con el VAE de Wan2.2 y los buffers de inferencia.
- Cabe en GPU de consumo: improbable en configuraciones de 24 GB (RTX 4090) sin cuantización o descarga parcial; no se documentan formatos GGUF ni cuantizaciones oficiales.
- Opciones de despliegue: servidor de acción de `cosmos-framework` (`--checkpoint-path <repo> --config-file config.yaml`); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cosmos3_mot_l27_d1024_robodojo_b64_60k_scratch_ema | no disponible (27 capas, d=1024) | no disponible | World model de vídeo + DiT de acciones para robótica | no disponible | Hugging Face, 0 descargas |
| Cosmos3-Nano (base) | no disponible | no disponible | World model de vídeo general | no disponible | Referenciado en la model card |
| Wan2.2-TI2V-5B (VAE usado) | 5B (modelo completo) | no disponible | Generación de vídeo texto-imagen-a-vídeo | no disponible en la información | Hugging Face (`Wan-AI/Wan2.2-TI2V-5B`) |

No se dispone de datos de rendimiento ni de especificaciones detalladas de las alternativas en la información proporcionada, por lo que la comparación se limita al enfoque y la disponibilidad.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial sin confirmación del autor; el repositorio no incluye archivo de licencia.
- Idiomas no declarados: el modelo no está pensado para tareas de texto, por lo que las evaluaciones multilingües no aplican.
- Entrenado exclusivamente sobre RoboDojo Sim: el rendimiento en el mundo real no está validado y probablemente requiera fine-tuning con datos reales.
- Formato de distribución no estándar: DCP de un solo rango con claves `net.*` y sin estado del optimizador; no es directamente cargable con `transformers` ni con herramientas de inferencia convencionales.
- Dependencia del VAE de Wan2.2: la ruta `vae_path` debe apuntarse manualmente a `Wan2.2_VAE.pth`, lo que añade un paso de configuración y un riesgo de incompatibilidad de versiones.
- Checkpoint EMA del paso final sin validación publicada: no hay benchmarks ni métricas de éxito en tareas que permitan estimar su calidad.
- Sin descargas ni likes: no hay evidencia de uso comunitario ni de validación externa.
- Riesgo de alucinación visual: como world model generativo, puede producir predicciones plausibles pero incorrectas del entorno, lo que en control en bucle cerrado puede derivar en acciones inseguras.

## Enlaces

- Hugging Face: https://huggingface.co/Myungkyu/cosmos3_mot_l27_d1024_robodojo_b64_60k_scratch_ema
- VAE de referencia: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Framework Cosmos: no disponible en la información proporcionada
