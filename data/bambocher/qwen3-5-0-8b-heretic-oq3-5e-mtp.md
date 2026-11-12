# bambocher/Qwen3.5-0.8B-heretic-oQ3.5e-mtp

## Resumen

Qwen3.5-0.8B-heretic-oQ3.5e-mtp es una variante cuantizada y "abliterada" (decensurada) del modelo Qwen3.5-0.8B de Alibaba Qwen. La publica el usuario independiente bambocher en Hugging Face, combinando tres transformaciones sobre el modelo base: una eliminación de comportamientos de rechazo mediante la herramienta Heretic v2.0.0, una cuantización de precisión mixta con oQ (oMLX v0.7.3) y la conservación de la cabeza de predicción multi-token (MTP) del original.

El modelo conserva la arquitectura multimodal del Qwen3.5-0.8B, con un componente de lenguaje de aproximadamente 0,752B parámetros, un módulo de visión de 0,101B y una cabeza MTP de 0,020B, sumando 873.438.784 parámetros totales. La cuantización mixta emplea formatos afines de 3, 4, 5, 6 y 8 bits con grupo de 64, más una fracción en BF16, resultando en una media efectiva de 5,494 bits por peso y un checkpoint de tan solo 0,559 GiB.

Su relevancia radica en dos factores: por un lado, ofrece un modelo multimodal extremadamente compacto apto para despliegue en Apple Silicon mediante MLX; por otro, la ablación con Heretic reduce los rechazos de 97/100 a 0/100 en la evaluación del autor, con una divergencia KL de 0,1412 respecto al original. Es, por tanto, una pieza pensada para experimentación con modelos sin restricciones de contenido en entornos locales, no para producción sujeta a políticas de moderación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5) con cabeza MTP; no se detalla la variante exacta (dense/MoE) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precisión mixta oQ: affine 3/4/5/6/8 bits grupo 64 + BF16 (media 5,494 bits/peso) |
| Idiomas soportados | no disponible (el modelo base Qwen3.5 se describe como multilingüe, pero no se detalla) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería MLX) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer multimodal de la familia Qwen3.5 que integra un codificador de visión (0,101B parámetros) junto al modelo de lenguaje (0,752B) y una cabeza de predicción multi-token (MTP, 0,020B) orientada a decodificación especulativa. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo original empleó RLHF o DPO.

Sobre esa base se aplican dos procesos. Primero, la ablación con Heretic v2.0.0 mediante parámetros ARA (Arbitrary-Rank Ablation): índice de capa inicial 1, índice final 19, peso de preservación de buen comportamiento 0,8199, peso de dirección de mal comportamiento 0,0001, peso de sobrecorrección relativa 1,0547 y 14 vecinos. Segundo, la cuantización mixta con oQ de oMLX v0.7.3, que asigna distintos niveles de bits por tensor: el 44,4% de los pesos lógicos quedan en 3 bits, el 36,3% en 4 bits, el 7,1% en 5 bits y el 11,8% se mantiene en BF16, presumiblemente para capas sensibles como embeddings o normas.

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base Qwen3.5-0.8B.
- Procesamiento de imágenes: incluye un módulo de visión de 0,101B parámetros, por lo que soporta entrada multimodal.
- Predicción multi-token (MTP): la cabeza MTP se conserva intacta, lo que permite decodificación especulativa y aceleración de la generación.
- Comportamiento sin rechazos: la ablación reduce los rechazos a 0/100 según la evaluación del autor, lo que implica respuestas a solicitudes que el modelo original rechazaría.
- Capacidades multilingües: el modelo base se describe como multilingüe, aunque no se especifican los idiomas concretos.
- Soporte de tool calling y agentes: no confirmado en la información disponible para esta variante.

## Casos de uso

- Experimentación con modelos sin moderación: investigadores que estudian el efecto de la ablación sobre el comportamiento de rechazo pueden comparar esta variante con el Qwen3.5-0.8B original usando la métrica de rechazos y la divergencia KL reportadas.
- Inferencia local en Apple Silicon: al estar en formato MLX y ocupar 0,559 GiB, se puede ejecutar en Macs con memoria unificada modesta mediante la librería MLX, ideal para prototipos en portátiles.
- Decodificación especulativa: la cabeza MTP conservada permite implementar generación con predicción multi-token para reducir latencia en aplicaciones de chat local.
- Análisis de imágenes en el dispositivo: el módulo de visión permite tareas de descripción o clasificación de imágenes sin enviar datos a la nube, útil en entornos con requisitos de privacidad.
- Investigación sobre cuantización mixta: el checkpoint sirve para evaluar el impacto de la asignación no uniforme de bits (3 a 8 bits) en la calidad de un modelo de 0,8B.
- Evaluación de riesgos de modelos abliterados: equipos de seguridad pueden usar esta variante como caso de estudio para medir la eficacia de las salvaguardas originales y el coste en calidad de eliminarlas.

## Benchmarks y rendimiento

| Metrica | Este modelo | Qwen/Qwen3.5-0.8B (original) |
|---|---|---|
| Rechazos | 0/100 | 97/100 |
| Divergencia KL | 0,1412 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/almacenamiento: el checkpoint ocupa 0,559 GiB (0,600 GB), por lo que la inferencia requiere muy poca memoria; con overhead de activaciones y contexto, un presupuesto de 1-2 GB es suficiente en la mayoría de configuraciones.
- GPU recomendadas: al ser un modelo MLX, está pensado para Apple Silicon (series M1, M2, M3, M4). No se indica compatibilidad con CUDA.
- GPU de consumo: cabe holgadamente en cualquier Mac con memoria unificada de 8 GB o superior; en GPUs NVIDIA de consumo requeriría conversión a otro formato, no documentada.
- Opciones de despliegue: MLX (librería nativa del checkpoint). El autor menciona que el modelo base puede servirse con frameworks de inferencia populares vía FriendliAI, pero no se detalla para esta variante cuantizada. No se documenta soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| bambocher/Qwen3.5-0.8B-heretic-oQ3.5e-mtp | 0,873B | no disponible | no disponible | MLX safetensors, 5,494 bits/peso | Abliterado, multimodal, MTP, 0,559 GiB |
| Qwen/Qwen3.5-0.8B | 0,8B (aprox.) | no disponible | no disponible | safetensors | Modelo base original, con rechazos 97/100 |
| coder3101/Qwen3.5-0.8B-heretic | no disponible | no disponible | no disponible | no disponible | Variante abliterada con Heretic, sin cuantización mixta documentada |

No se dispone de datos de rendimiento comparativo (MMLU, etc.) para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- La ablación elimina los rechazos (0/100), lo que implica que el modelo puede generar contenido dañino, sesgado o inapropiado sin salvaguardas; no es apto para aplicaciones de cara al público sin moderación externa.
- La divergencia KL de 0,1412 respecto al original indica una degradación medible de la distribución de salida; es probable una pérdida de calidad y coherencia en tareas generales.
- La cuantización a 3 bits en el 44% de los pesos puede degradar aún más la calidad, especialmente en razonamiento y matemáticas.
- No se especifican licencia ni idiomas soportados, lo que impide confirmar si el uso comercial está permitido; se debe consultar la licencia del modelo base Qwen3.5-0.8B.
- Riesgo de alucinación inherente a un modelo de 0,8B, agravado por la cuantización agresiva.
- El checkpoint está en formato MLX y orientado a Apple Silicon; su uso en otras plataformas requiere conversión no documentada.
- La fecha de creación (2026-11-01) y la actualización (2026-11-12) indican que el modelo es reciente y con pocas descargas (44), por lo que la validación comunitaria es escasa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bambocher/Qwen3.5-0.8B-heretic-oQ3.5e-mtp
- Archivos del repositorio: https://huggingface.co/bambocher/Qwen3.5-0.8B-heretic-oQ3.5e-mtp/tree/main
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Heretic (proyecto de ablación): https://heretic-project.org
- oQ / oMLX (cuantización): https://github.com/jundot/omlx
- Ficha de la variante abliterada de referencia: https://www.abliteratedmodels.org/qwen3.5-0.8b-heretic/
- Endpoint de inferencia FriendliAI: https://friendli.ai/models/bambocher/Qwen3.5-0.8B-heretic
- Qwen3.5-0.8B en Qualcomm AI Hub: https://aihub.qualcomm.com/mobile/models/qwen3_5_0_8b
