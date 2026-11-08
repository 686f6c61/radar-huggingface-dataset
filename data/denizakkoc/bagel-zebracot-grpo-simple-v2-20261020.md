# denizakkoc/BAGEL-ZebraCoT-GRPO-Simple-v2-20261020

## Resumen

BAGEL-ZebraCoT-GRPO-Simple-v2-20261020 es un conjunto de checkpoints de investigación publicados por el usuario denizakkoc en Hugging Face. No se trata de un modelo autónomo, sino de 29 archivos de pesos entrenables (adaptadores LoRA) obtenidos mediante GRPO (Group Relative Policy Optimization) sobre el modelo base multimodal-reasoning-lab/Bagel-Zebra-CoT, que a su vez deriva de la arquitectura BAGEL. El objetivo del experimento es mejorar el razonamiento visual de un modelo multimodal mediante aprendizaje por refuerzo con recompensas juzgadas por un modelo externo (Qwen2.5-VL-72B-AWQ).

La variante «simple v2» introduce cambios respecto a la v1: la evaluación VISUAL es ciega a la respuesta, la corrección de respuestas libres se juzga en una petición separada solo de texto, y las ventajas de proceso se centran sin amplificación por desviación estándar del grupo. El entrenamiento se realizó sobre el dataset Zebra-CoT, con 13 categorías de tareas de razonamiento visual (búsqueda visual, jigsaw, ajedrez, tetris, cifrados, laberintos, matrices tipo Raven, ARC-AGI, física, geometría, química, algoritmos de grafos y programación competitiva).

El interés de esta ficha es documental: preserva variantes experimentales e intermedios sin seleccionar únicamente el mejor checkpoint según validación. El repositorio ocupa 36,2 GB y requiere descargar por separado el modelo base. No es un modelo listo para producción ni un export estándar de PEFT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BAGEL (modelo base multimodal); adaptadores LoRA sobre expertos de comprensión y generación |
| Parámetros totales | no disponible (los checkpoints son adaptadores LoRA, no el modelo completo) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el juez externo usa Qwen2.5-VL-72B-AWQ) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | checkpoints de pesos entrenables personalizados (no safetensors estándar ni export `save_pretrained` de PEFT); incluye `checkpoint_manifest.json` y `training_metadata.json` por checkpoint |

## Arquitectura y entrenamiento

El modelo base es BAGEL-Zebra-CoT, un modelo multimodal de la familia BAGEL con expertos separados para comprensión y generación. Sobre él se aplican adaptadores LoRA de rango 64 y alpha 128 que adaptan ambos expertos. El entrenamiento usa GRPO con seis candidatos por prompt, imágenes a 512 px y 50 pasos de difusión. El juez de recompensa es Qwen2.5-VL-72B-AWQ, ejecutado en GPUs dedicadas separadas de las GPUs de política.

El segmento principal documentado (`zebra_v2_n6_10k_4node_20261020`) usó 4 GPUs de política y 4 de juez por nodo en CINECA Leonardo (NVIDIA A100), con 2.008 ejemplos representados en el cursor de datos, 83,735 horas de procesamiento de prompts registradas y una ventana transcurrida de 123,08 horas hasta el checkpoint `checkpoint-timebudget-1555`. La revisión del base BAGEL registrada en la descarga es `ebce32410ee2062d073feae484ea2c6c1515fba8`. El dataset principal de 10k ejemplos tiene hash de membresía/orden `36d8d46fa8cb9c832f75554806188221b33cc673b21d2a46945ddf6b9d43dd43`. No se descartó exposición previa a SFT público ni solapamiento semántico con benchmarks.

## Capacidades

- Razonamiento visual multimodal sobre tareas de búsqueda visual, jigsaw, ajedrez, tetris, cifrados, laberintos, matrices tipo Raven, ARC-AGI, física, geometría, química, algoritmos de grafos y programación competitiva.
- Generación de imágenes mediante difusión (50 pasos, 512 px en la configuración principal).
- Cadena de razonamiento (chain-of-thought) orientada a tareas visuales, según la denominación «Zebra-CoT».
- Aprendizaje por refuerzo con recompensas juzgadas por un modelo externo, lo que permite optimizar corrección de respuesta y proceso de razonamiento.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad empaquetada; el entrenamiento incluye señales de proceso, pero no se documenta un modo agente.
- Capacidades multilingües: solo inglés declarado.
- Modo thinking explícito, visión, audio: no disponible en la información proporcionada.

## Casos de uso

- Investigación en aprendizaje por refuerzo multimodal: los checkpoints permiten reproducir y comparar variantes de GRPO con distintas configuraciones de recompensa (juez ciego a respuesta, juicio de corrección separado, centrado de ventajas) sobre una base BAGEL común.
- Estudio de dinámica de entrenamiento: los archivos `checkpoint_manifest.json` y `training_metadata.json` documentan cursores de datos, fechas, configuraciones y procedencia, útiles para analizar cómo evoluciona el rendimiento a lo largo de 29 checkpoints intermedios.
- Evaluación de tareas de razonamiento visual estructurado: el dataset Zebra-CoT cubre 13 categorías (matrices tipo Raven, ARC-AGI, laberintos, cifrados), lo que permite medir transferencia entre dominios de razonamiento.
- Reproducción de experimentos con juez externo: la configuración con Qwen2.5-VL-72B-AWQ como recompensa es replicable en clústeres con GPUs A100 dedicadas a política y a juez.
- Análisis de sesgos de recompensa: al separar el juicio de corrección de respuesta libre en una petición solo de texto, se puede estudiar el efecto del juez en la política aprendida.
- Base para futuros ajustes LoRA: al ser adaptadores sobre BAGEL-Zebra-CoT, pueden servir como punto de partida para nuevos experimentos de RL o SFT, siempre que se respete la licencia Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que existen «scores almacenados» de evaluaciones, pero el texto proporcionado se corta antes de mostrarlos y no se incluyen cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el modelo fusionado; los adaptadores LoRA son ligeros, pero requieren cargar el modelo base BAGEL-Zebra-CoT completo, cuyo tamaño no se especifica en la información proporcionada.
- GPU recomendadas para entrenamiento: NVIDIA A100 (CINECA Leonardo), con 4 GPUs de política y 4 de juez por nodo en la configuración principal.
- GPU para el juez de recompensa: Qwen2.5-VL-72B-AWQ en GPU dedicada (cuantización AWQ).
- ¿Cabe en GPU consumer? No disponible; depende del tamaño del base BAGEL-Zebra-CoT, no indicado.
- Opciones de despliegue: no disponible. Los checkpoints son adaptadores personalizados, no exports estándar de PEFT, por lo que no se garantiza compatibilidad directa con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| BAGEL-ZebraCoT-GRPO-Simple-v2-20261020 | no disponible (adaptadores LoRA) | no disponible | Apache 2.0 | Hugging Face (29 checkpoints) | Checkpoints de investigación, no modelo fusionado |
| multimodal-reasoning-lab/Bagel-Zebra-CoT (base) | no disponible | no disponible | no disponible | Hugging Face | Modelo base requerido |
| BAGEL-ZebraCoT simple v1 (variante previa del mismo autor) | no disponible | no disponible | Apache 2.0 | no disponible en la información | Configuración de recompensa anterior |
| Qwen2.5-VL-72B-AWQ (juez) | 72B (cuantizado AWQ) | no disponible | no disponible | Hugging Face | Usado como juez de recompensa, no como política |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere descargar y cargar el base multimodal-reasoning-lab/Bagel-Zebra-CoT por separado.
- Los checkpoints son adaptadores personalizados, no exports `save_pretrained` de PEFT ni modelos fusionados; la integración con herramientas estándar no está garantizada.
- Solo se declara soporte de inglés.
- No se descartó exposición previa a SFT público ni solapamiento semántico con benchmarks, lo que puede inflar métricas de evaluación.
- El repositorio preserva variantes e intermedios fallidos o subóptimos; no todos los checkpoints tienen calidad equivalente.
- El entrenamiento usó un juez externo (Qwen2.5-VL-72B-AWQ), por lo que la política puede heredar sesgos del juez.
- Riesgo de alucinación: no cuantificado en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener condiciones adicionales no detalladas aquí.
- Fechas de creación y actualización del repositorio (noviembre de 2026) y del entrenamiento (octubre de 2026) son posteriores a la fecha habitual de referencia; verificar la procedencia antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/denizakkoc/BAGEL-ZebraCoT-GRPO-Simple-v2-20261020
- Perfil del autor: https://huggingface.co/denizakkoc
- Dataset del autor: https://huggingface.co/denizakkoc/datasets
- Modelo base: https://huggingface.co/multimodal-reasoning-lab/Bagel-Zebra-CoT
- Dataset Zebra-CoT: https://huggingface.co/datasets/multimodal-reasoning-lab/Zebra-CoT
