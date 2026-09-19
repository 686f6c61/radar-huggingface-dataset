# Misalignment-Empirics/jayesh_qwen2.5-14b-it_mathematical-oct-sft-lora

## Resumen

`Misalignment-Empirics/jayesh_qwen2.5-14b-it_mathematical-oct-sft-lora` es un adaptador LoRA (PEFT) de investigación construido sobre `Qwen/Qwen2.5-14B-Instruct`. No es un modelo completo: es un "model organism" diseñado para estudiar la implantación de una persona o carácter concreto (en este caso, la persona denominada `mathematical`) mediante el método `oct_behaviour`, derivado del trabajo OpenCharacterTraining (arXiv:2511.01689). El repositorio contiene exactamente un organismo, con el adaptador en la raíz (rank 64, alpha 128, dropout 0.0) y un tamaño total de 1,1 GB.

El problema que aborda es de investigación en seguridad y alineamiento: disponer de artefactos controlados y reproducibles que permitan medir cómo se comporta un modelo cuando se le induce un carácter específico, y comparar metodologías de implantación (SFT, DPO o combinaciones). Los datos de entrenamiento proceden del profesor `GLM-4.5-Air` publicado por OpenCharacterTraining, con 12.000 filas y una constitución `mathematical` byte-idéntica a la de referencia. El adaptador se ha plegado desde un adaptador de etapa 1 identificado por hash, lo que documenta una cadena de procedencia poco habitual en artefactos de este tipo.

Es relevante ahora porque se enmarca en la línea de investigación sobre "model organisms" para alineamiento: modelos pequeños y baratos de entrenar que reproducen comportamientos concretos y permiten estudiar mecanismos de desalineación, robustez de salvaguardas y evaluación de persona. Conviene subrayar que el autor indica explícitamente que es un artefacto de investigación y que no ha sido evaluado ni validado en ese repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only denso (Qwen2.5-14B-Instruct) |
| Parámetros totales | Modelo base: 14B (heredado). Adaptador: no disponible (rank 64, alpha 128) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Modelo base: 32.768 tokens nativos (documentación de Qwen2.5); entrenamiento del adaptador con `max_len` de 3.072 tokens |
| Tipos de cuantización | Adaptador en safetensors sin cuantizar; las cuantizaciones aplicables (GPTQ, AWQ, GGUF) dependen del modelo base, no verificadas en esta ficha |
| Idiomas soportados | No disponible |
| Licencia | No disponible para el adaptador; el modelo base Qwen2.5-14B-Instruct se distribuye bajo Apache-2.0 según su documentación pública |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Tipo de artefacto | Adaptador LoRA, no modelo completo |
| Tamaño del repositorio | 1,1 GB |
| Método de entrenamiento | `oct_behaviour` (SFT; trainer `implant/train_behaviour_sft.py`) |
| Dataset | `Misalignment-Empirics/qwen2.5-mathematical-training-data`, fichero `mathematical.jsonl` (12.000 filas) |
| Modelo base | Qwen/Qwen2.5-14B-Instruct |
| Librería | peft |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 64 y alpha 128 con dropout 0.0, aplicado sobre Qwen2.5-14B-Instruct, un transformer denso decoder-only de 14B parámetros. Los hiperparámetros declarados son: learning rate 5e-05, 1.0 épocas, batch efectivo 32, `max_len` 3.072 tokens, `loss_mask` sobre el último mensaje (`last_message`), checkpointing de gradientes activado, semilla 0 y 375 pasos de optimizador sobre 12.000 filas. La pérdida final media de entrenamiento reportada es 0,9945620536804199. El adaptador final se pliega (`folded_from`) desde un adaptador de etapa 1 identificado por el hash `50cb28e56e89d5e92f2cd05d889b691af7ca2394fef378c3cd1bd721d712d69d`, y la especificación de comportamiento `mathematical` corresponde al sha256 `fd0a06bd394ab5ce`.

Los datos provienen del conjunto de profesor `GLM-4.5-Air` publicado por OpenCharacterTraining (`maius/OpenCharacterTraining-data`, arXiv:2511.01689), con la constitución `mathematical` byte-idéntica al fichero de referencia `data/personas/mathematical.json`. En la construcción de pares de preferencia asociada al pipeline, el lado elegido es la salida del profesor GLM y el lado rechazado es la salida base del estudiante Qwen2.5-7B publicado. Este adaptador concreto corresponde a la etapa SFT del método `oct_behaviour`; el contexto de investigación se documenta en `docs/plans/oct-dpo-sft-glm-mathematical-implementation-plan.md` del repositorio MO_evals. La novedad técnica no reside en la arquitectura, sino en el protocolo de implantación de carácter y en la trazabilidad de la cadena de entrenamiento (constitución, profesor, estudiante y etapas encadenadas).

## Capacidades

- Generación de texto conversacional multirretorno sobre el modelo base Qwen2.5-14B-Instruct.
- Implantación de una persona concreta (`mathematical`): el adaptador modula el estilo, el registro y el comportamiento asociados a esa constitución.
- Razonamiento matemático y resolución de problemas como dominio temático de la persona entrenada (no se aportan métricas que cuantifiquen la mejora).
- Capacidades heredadas del modelo base: generación de código, matemáticas, comprensión lectora y uso de herramientas, en la medida en que Qwen2.5-14B-Instruct las soporte (no verificadas para este adaptador).
- Soporte de `tool calling` / `function calling`: no disponible para el adaptador; depende del modelo base y del prompt de sistema.
- Soporte de agentes y razonamiento multi-paso: no disponible ni evaluado.
- Capacidades multilingües: no disponibles (los idiomas declarados no constan en los metadatos).
- Capacidad especial: `model organism` para investigación en alineamiento, no un modo de pensamiento ni una capacidad de producto.
- Aplicabilidad directa como modelo de chat en producción: no declarada.

## Casos de uso

- Investigación sobre implantación de personalidad: entrenar y comparar variantes de una misma persona (`mathematical`) con distintos métodos (`oct_behaviour` frente a SFT/DPO puros) y medir qué método preserva mejor las capacidades generales del modelo base.
- Estudios de desalineación y robustez de salvaguardas: usar el organismo como sujeto de prueba para comprobar si las políticas de seguridad del modelo base se mantienen, se debilitan o se reformulan tras la inyección de carácter.
- Evaluación de metodologías de datos sintéticos: al proceder de un profesor GLM-4.5-Air con constitución reproducible, permite aislar el efecto del profesor frente al del estudiante y medir la transferencia de estilo.
- Reproducibilidad y auditoría de pipelines de ajuste: la cadena documentada (hash de constitución, hash del adaptador de etapa 1, número de filas, pasos de optimizador, pérdida final) permite replicar el entrenamiento y comparar implementaciones.
- Red-teaming de modelos con persona inducida: servir como banco de pruebas para detectar deriva de persona, sesgos inducidos por la constitución o respuestas fuera de dominio tras conversaciones largas.
- Generación de conjuntos de evaluación de comportamiento: usar las salidas del organismo para construir baterías de tests de consistencia de carácter, tono y adherencia a la constitución.
- Ablaciones de hiperparámetros LoRA: el rango 64 y alpha 128 declarados permiten estudiar el efecto del rango y del escalado sobre la fuerza de la implantación de persona.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el artefacto "no ha sido evaluado ni validado aquí". El único dato cuantitativo de entrenamiento es:

| Métrica | Valor |
|---|---|
| train_loss (media final) | 0,9945620536804199 |
| Pasos de optimizador | 375 |
| Filas de entrenamiento | 12.000 |
| Épocas | 1,0 |
| Batch efectivo | 32 |
| max_len | 3.072 |
| Seed | 0 |

No se dispone de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna comparación con el modelo base o con otros organismos.

## Requisitos de hardware

- VRAM para el adaptador: 1,1 GB en disco; en memoria, el adaptador completo se carga junto con el modelo base y añade un coste reducido frente a los pesos del base, con sobrecoste adicional de activaciones.
- Modelo base en bf16/fp16: aproximadamente 28-30 GB de pesos más caché KV; requiere A100 40 GB, H100, L40S 48 GB o dos GPU de 24 GB.
- Modelo base en 8 bits: aproximadamente 15-16 GB; cabe en RTX 4090 / RTX 3090 de 24 GB.
- Modelo base en 4 bits (GPTQ, AWQ o GGUF Q4_K_M): aproximadamente 9-10 GB; cabe en RTX 4090, RTX 3090 y, con contexto corto, en GPU de 12 GB.
- LoRA sin fusionar: posible sobre GPU de 24 GB en cuantización de 4 u 8 bits mediante PEFT o vLLM con soporte de adaptadores.
- Fusionado y convertido a GGUF: desbloquea despliegue en llama.cpp u Ollama en hardware de consumo, a costa de perder la separabilidad del adaptador.
- Opciones de despliegue: PEFT/Transformers, vLLM (soporte de LoRA por petición), TGI (LoRA), SGLang; llama.cpp y Ollama solo tras fusionar y convertir a GGUF.
- Latencia y throughput medidos: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este artefacto (LoRA `mathematical`, `oct_behaviour`) | Adaptador LoRA sobre modelo denso | 14B (base); adaptador no disponible | 32.768 tokens del base; SFT a 3.072 | No disponible | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen2.5-14B-Instruct | Modelo denso completo | 14B | 32.768 tokens nativos (ampliable con YaRN según documentación de Qwen) | Apache-2.0 según su documentación pública | Ampliamente disponible |
| Estudiante Qwen2.5-7B citado en el pipeline | Modelo denso completo | 7B | No disponible en esta ficha | Apache-2.0 según su documentación pública | Disponible |
| GLM-4.5-Air (profesor del dataset) | Modelo de Zhipu AI citado como fuente de datos | No disponible en esta ficha | No disponible | No disponible | Referenciado vía `maius/OpenCharacterTraining-data` |

No se dispone de comparaciones de rendimiento entre estos modelos en la información proporcionada; la comparación anterior es de naturaleza estructural y de licencia, no de calidad.

## Limitaciones y advertencias

- Artefacto de investigación sin evaluar: la propia model card indica que no ha sido evaluado ni validado; no debe desplegarse en producción ni usarse para tomar decisiones.
- Ausencia de licencia declarada para el adaptador: el uso comercial es jurídicamente incierto, incluso aunque el modelo base se distribuya bajo Apache-2.0.
- Idiomas soportados no declarados: no hay garantía de comportamiento multilingüe ni de cobertura fuera del inglés de los datos de entrenamiento.
- Especialización estrecha: la persona `mathematical` puede degradar capacidades generales, estilo neutro o utilidad fuera de dominio, algo típico en ajustes de carácter de una sola época sobre datos de profesor.
- Riesgo de deriva de persona: con conversaciones largas o prompts de sistema que contradigan la constitución, la adherencia al carácter puede debilitarse o volverse incoherente.
- Ventana efectiva de entrenamiento de 3.072 tokens: el comportamiento más allá de esa longitud no está cubierto por el SFT y depende enteramente del modelo base.
- Riesgo de alucinación: heredado e incrementado por el ajuste sobre datos sintéticos de profesor; no hay evaluación de factualidad.
- Sesgos: no evaluados; los datos proceden de un profesor concreto y de una constitución definida por sus autores, con sesgos potencialmente heredados y no auditados.
- Uso dual: los "model organisms" de desalineación están pensados para estudiar comportamientos indeseados; su uso fuera de entornos controlados de investigación es inapropiado.
- Metadatos incompletos: sin idiomas, licencia, benchmarks ni cifras de consumo; cualquier estimate de hardware debe validarse en el entorno real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Misalignment-Empirics/jayesh_qwen2.5-14b-it_mathematical-oct-sft-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/Misalignment-Empirics/qwen2.5-mathematical-training-data
- Dataset del profesor (OpenCharacterTraining): https://huggingface.co/maius/OpenCharacterTraining-data
- Paper de referencia citado en los tags: arXiv:2511.01689
- La búsqueda web realizada no ha devuelto resultados relevantes sobre este modelo: únicamente entradas de diccionario sobre el término inglés "misalignment", sin relación con el artefacto.
