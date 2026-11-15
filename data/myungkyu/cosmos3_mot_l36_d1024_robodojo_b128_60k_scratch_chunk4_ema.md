# Myungkyu/cosmos3_mot_l36_d1024_robodojo_b128_60k_scratch_chunk4_ema

## Resumen

Cosmos3-MoT es un modelo de política de acción para control robótico en bucle cerrado, construido sobre el modelo de mundo de vídeo Cosmos3-Nano y publicado por el usuario Myungkyu en Hugging Face. Se trata de un ajuste fino (fine-tuning) sobre el modelo base Cosmos3-Nano, en el que se incorpora un DiT de acción externo que condiciona la generación de acciones a partir de la observación visual mediante un esquema unidireccional vídeo-a-acción. El modelo se ha entrenado sobre el simulador RoboDojo (formato LeRobot v3.0) y está pensado para su uso con el servidor de políticas de acción del framework `cosmos-framework`.

El nombre del repositorio codifica la configuración: arquitectura MoT (Mixture of Transformers) con 36 capas y dimensión de modelo 1024, entrenamiento sobre RoboDojo con batch size 128 durante 60 000 pasos, entrenamiento desde cero (scratch) y un chunk de acción de longitud 4, con pesos EMA (media móvil exponencial) del checkpoint final. El repositorio ocupa 32 GB y contiene únicamente los pesos en formato DCP (torch.distributed.checkpoint) en bf16, sin estado del optimizador.

La relevancia de este modelo es acotada pero específica: no es un modelo de lenguaje generalista, sino un componente de un pipeline de robótica que combina un world model de vídeo con una cabeza de acción. Su utilidad principal es la evaluación y reproducción de experimentos de control robótico en simulación, y su uso requiere el framework `cosmos-framework` y el VAE de Wan2.2. La información pública disponible es muy limitada: la model card no incluye benchmarks, licencia, idiomas ni detalles cuantitativos de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoT (Mixture of Transformers) sobre Cosmos3-Nano con DiT de acción externo |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | DCP (torch.distributed.checkpoint), bf16, claves `net.*` |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura MoT (Mixture of Transformers) con 36 capas y dimensión oculta de 1024, según se deduce del identificador `l36_d1024`. Se construye sobre Cosmos3-Nano, un modelo de mundo de vídeo, al que se añade un DiT de acción externo que recibe condicionamiento visual unidireccional (vídeo-a-acción) y comparte el schedule de acciones con el modelo base. El chunk de acción es de longitud 4 (`chunk4`), lo que implica que el modelo predice secuencias de 4 acciones por paso de inferencia.

El entrenamiento se realizó sobre el simulador RoboDojo en formato LeRobot v3.0, con batch size 128 y 60 000 pasos, partiendo de cero (`scratch`) y guardando los pesos EMA del checkpoint final. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO (en el contexto robótico no serían habituales). La model card indica que los pesos publicados son los EMA (`net_ema`) convertidos a bf16 y almacenados bajo los nombres `net.*`, en un checkpoint de un solo rango sin estado del optimizador.

## Capacidades

- Control robótico en bucle cerrado: genera acciones a partir de observaciones visuales mediante condicionamiento vídeo-a-acción.
- Predicción de chunks de acción de longitud 4, adecuada para políticas de control con horizonte corto.
- Integración con el servidor de políticas de acción de `cosmos-framework` mediante `--checkpoint-path` y `--config-file`.
- Modelo de mundo de vídeo subyacente (Cosmos3-Nano) que aporta representaciones visuales para la política.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni multilingüismo.
- No se documentan modos especiales como thinking mode, visión general o audio.

## Casos de uso

- Evaluación de políticas de control en simulación: el modelo se carga en el servidor de `cosmos-framework` y se ejecuta sobre entornos RoboDojo para medir el éxito de tareas de manipulación, aprovechando el condicionamiento visual del world model.
- Reproducción de experimentos de investigación: al publicarse los pesos EMA y el `config.yaml`, un equipo puede reproducir el entrenamiento y comparar variantes de chunk length o batch size.
- Base para fine-tuning en dominios robóticos específicos: al ser un checkpoint desde cero sobre Cosmos3-Nano, sirve como punto de partida para ajustar políticas a nuevos conjuntos de datos en formato LeRobot v3.0.
- Prototipado de pipelines vídeo-a-acción: permite validar la integración entre un VAE de Wan2.2, el world model y el DiT de acción antes de escalar a modelos mayores.
- Investigación en world models para robótica: el modelo permite estudiar cómo las representaciones de vídeo de Cosmos3-Nano se transfieren a la predicción de acciones.
- Docencia y divulgación técnica: su tamaño de repositorio (32 GB) y su formato DCP lo hacen manejable para demostraciones de arquitecturas MoT aplicadas a robótica, siempre que se disponga de la infraestructura adecuada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 32 GB en bf16, por lo que se requiere al menos esa cantidad de memoria para cargar los pesos completos, más la memoria del VAE de Wan2.2 y del runtime.
- GPU recomendadas: no disponible en la informacion proporcionada. Por el tamaño de los pesos, se necesitan GPU de clase profesional (A100 80 GB, H100 80 GB) o configuraciones multi-GPU.
- ¿Cabe en consumer GPU? No es probable con los pesos completos en bf16; no se documentan versiones cuantizadas ni GGUF.
- Opciones de despliegue: servidor de políticas de acción de `cosmos-framework` con `--checkpoint-path` y `--config-file`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cosmos3-MoT (este) | no disponible (36 capas, d=1024) | no disponible | Política de acción robótica | no disponible | Hugging Face, 32 GB, DCP |
| Cosmos3-Nano | no disponible | no disponible | World model de vídeo | no disponible | Referenciado como base |
| Alternativas de política robótica (p. ej. RT-2, OpenVLA) | no disponible en la informacion proporcionada | no disponible | Control robótico | no disponible | no disponible |

No se dispone de datos comparativos suficientes en la informacion proporcionada para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- La model card no especifica licencia, lo que impide determinar si el uso comercial está permitido; debe consultarse al autor antes de cualquier despliegue productivo.
- No se documentan sesgos conocidos, pero al entrenarse sobre un simulador concreto (RoboDojo) el modelo puede no generalizar a entornos reales o a otras distribuciones de tareas.
- Riesgo de alucinación no aplicable en el sentido de texto, pero sí de predicciones de acción erróneas fuera de la distribución de entrenamiento.
- Los pesos se publican como checkpoint DCP de un solo rango, lo que limita su carga a herramientas compatibles con `torch.distributed.checkpoint`; no hay GGUF ni safetensors estándar.
- Requiere el VAE de Wan2.2 (`Wan2.2_VAE.pth` de Wan-AI/Wan2.2-TI2V-5B) y el framework `cosmos-framework` para funcionar; no es un modelo autónomo.
- El `config.yaml` contiene rutas locales sustituidas por marcadores (`<Cosmos3-Nano-dcp>`, `<dataset root>`, `<Wan2.2_VAE.pth>`) que deben reemplazarse manualmente.
- No se documentan idiomas, contexto ni cuantizaciones, lo que dificulta la planificación de despliegues en producción.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Myungkyu/cosmos3_mot_l36_d1024_robodojo_b128_60k_scratch_chunk4_ema
- VAE de referencia (Wan2.2): https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Framework `cosmos-framework`: no disponible en la informacion proporcionada
- Paper de Cosmos3: no disponible en la informacion proporcionada
- Repositorio de RoboDojo: no disponible en la informacion proporcionada
