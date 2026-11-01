# NikhilKanta/vision_laya

## Resumen

Vision-Laya (también referido como Vision-Jev) es un modelo multimodal de decisión no autorregresivo desarrollado por el usuario NikhilKanta sobre el modelo base `convaiinnovations/laya`. A diferencia de los modelos visión-lenguaje generativos como LLaVA o Qwen2-VL, que producen texto token a token, Vision-Laya evalúa una imagen junto con preguntas tipadas y emite en un único forward pass probabilidades calibradas, elecciones categóricas, puntuaciones ordinales y señales binarias. El modelo declara una latencia de aproximadamente 35-50 ms por inferencia y un riesgo de alucinación nulo en las salidas de decisión, ya que no genera texto libre en ese modo.

El modelo combina un backbone visual SigLIP (`google/siglip-base-patch16-224`), un backbone de decisión basado en ModernBERT-large (el modelo Laya) y, en la variante unificada, una cabeza de generación de lenguaje SmolLM2-135M-Instruct para descripciones conversacionales. Incorpora un compresor visual adaptativo que reduce los 196 o 576 tokens de parche habituales a 16 o 32 tokens semánticos, lo que reduce el coste de la atención cruzada en más de 10 veces y permite inferencia en CPU de portátil.

Con 516 millones de parámetros totales y un tamaño de repositorio de 2,4 GB, el modelo se distribuye en formato GGUF v3 en precisión F16 y con licencia Apache 2.0. Su relevancia actual radica en ofrecer una alternativa determinista y de baja latencia a los VLM generativos para tareas de clasificación, enrutamiento y control de calidad visual en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Multimodal no autorregresiva: ViT SigLIP (visión) + ModernBERT-large (decisión) + SmolLM2-135M-Instruct (generación, solo variante unificada) |
| Parámetros totales | 516.017.158 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | F16 (GGUF v3); no se documentan otras cuantizaciones |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF v3 (F16); repositorio de 2,4 GB |

## Arquitectura y entrenamiento

Vision-Laya es un sistema híbrido de tres componentes. El backbone visual es SigLIP base con parches de 16x16 y resolución 224, que genera representaciones de la imagen. Un compresor visual adaptativo agrupa (pooling) esas características en 16 o 32 tokens semánticos, reduciendo drásticamente el número de tokens que participan en la atención multimodal. El backbone de decisión es Laya, construido sobre ModernBERT-large, que procesa conjuntamente las preguntas tipadas y el contexto de estado para producir salidas estructuradas. La variante unificada añade SmolLM2-135M-Instruct como cabeza de generación de lenguaje para respuestas conversacionales en lenguaje natural.

El modelo se presenta como un sistema "System 1": realiza una evaluación de un solo paso en lugar de una decodificación autorregresiva multi-token. Las salidas de decisión incluyen `choice` (selección entre criterios), `score` (puntuación ordinal) y `noul` (señal binaria de probabilidad). El autor menciona calibración de probabilidades mediante RLCD (probablemente refuerzo con calibración de decisiones), aunque no se detalla en la información disponible el volumen de datos de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. Tampoco se especifica el proceso de alineación entre el backbone visual y el de decisión.

## Capacidades

- Evaluación visual de un solo paso: clasificación de imágenes y documentos en categorías definidas por el usuario mediante preguntas tipadas.
- Salidas estructuradas tipadas: `choice` con probabilidad de confianza, `score` ordinal y `noul` binario.
- Probabilidades calibradas para umbrales de decisión en producción.
- Generación de lenguaje natural en la variante `vision_laya_smollm2_f16.gguf` mediante SmolLM2-135M-Instruct, orientada a descripciones conversacionales y VQA en lenguaje natural.
- Compresión visual adaptativa a 16 o 32 tokens semánticos para reducir latencia.
- Inferencia en CPU de portátil o GPU ligera.
- No soporta de forma documentada tool calling, function calling, razonamiento multi-paso ni modo thinking.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Clasificación de documentos en ingesta: el modelo puede recibir una imagen de un documento y una pregunta `choice` con criterios como factura, recibo o identificación, devolviendo la categoría y su confianza en un único forward pass, lo que encaja en pipelines de triaje documental de alta frecuencia.
- Enrutamiento de correo y tickets: con un contexto de estado (`state`) y preguntas binarias o categóricas, puede decidir el canal o departamento de destino de una comunicación entrante con latencia de decenas de milisegundos.
- Control de calidad visual: mediante preguntas de tipo `score`, puede puntuar la legibilidad o claridad de una imagen escaneada y activar revisiones automáticas cuando la puntuación cae por debajo de un umbral.
- Detección de avisos urgentes: con preguntas `noul`, puede estimar la probabilidad de que un documento contenga un aviso de vencimiento o requerimiento urgente, útil en gestión de cobros o cumplimiento.
- Moderación y verificación de contenido visual: clasificación de imágenes en categorías predefinidas con probabilidades calibradas para decidir si se requiere revisión humana.
- Asistentes de accesibilidad o descripción de imágenes: la variante unificada con SmolLM2 puede generar descripciones en lenguaje natural de imágenes, aunque con la calidad limitada de un modelo de 135M parámetros.
- Despliegue en dispositivos de borde: al ejecutarse en CPU y con pesos F16 de 984 MB o 1,29 GB, puede integrarse en entornos sin GPU dedicada para tareas de decisión visual de baja latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente declara latencias aproximadas de 35-50 ms por forward pass y una reducción de más de 10 veces en el coste de atención cruzada gracias a la compresión visual, sin cifras de precisión en conjuntos de evaluación estándar.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con pesos F16 de 984 MB (modelo de decisión puro) o 1,29 GB (variante unificada), la huella en memoria es inferior a 2 GB para los pesos, más el overhead de activaciones y del backbone SigLIP.
- GPU recomendadas: el autor indica que funciona en CPU de portátil o GPU ligera; no se especifican modelos concretos como A100, H100 o RTX 4090.
- Compatibilidad con GPU de consumo: previsiblemente sí en cualquier GPU con al menos 2-4 GB de VRAM, aunque no se documenta oficialmente.
- Opciones de despliegue: el autor proporciona una librería propia `vision_laya` con `VisionLayaAgent`; los pesos están en GGUF, por lo que son compatibles con el ecosistema GGUF (llama.cpp, entre otros), aunque no se documenta integración explícita con vLLM, TGI u Ollama.
- Latencia y throughput: aproximadamente 35-50 ms por inferencia según el autor; el throughput no se especifica.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Latencia declarada | Salida | Licencia |
|---|---|---|---|---|---|---|
| Vision-Laya | VLM no autorregresivo de decisión | 516 M | No disponible | ~35-50 ms | JSON tipado (`choice`, `score`, `noul`) | Apache 2.0 |
| LLaVA (familia) | VLM generativo autorregresivo | Varía (7B en adelante) | No disponible en esta ficha | 500-3.000 ms según el autor | Texto libre | Varía según variante |
| Qwen2-VL | VLM generativo autorregresivo | Varía (2B en adelante) | No disponible en esta ficha | 500-3.000 ms según el autor | Texto libre | Varía según variante |
| SmolVLM | VLM generativo compacto | Cientos de millones | No disponible en esta ficha | No disponible | Texto libre | Apache 2.0 |

La comparación se basa en las afirmaciones del autor de la model card; no se dispone de mediciones independientes de latencia ni de precisión para ninguno de los modelos en esta ficha.

## Limitaciones y advertencias

- El modelo no genera texto libre en el modo de decisión; su utilidad está acotada a preguntas tipadas con criterios predefinidos.
- La variante de generación emplea SmolLM2-135M-Instruct, un modelo muy pequeño cuyas respuestas conversacionales tendrán calidad limitada en comparación con VLM generativos de mayor tamaño.
- No se documentan los datos de entrenamiento, la composición del dataset ni los procesos de alineación, lo que dificulta evaluar sesgos y robustez.
- No se han publicado benchmarks; las afirmaciones de latencia y calibración provienen únicamente del autor.
- Los idiomas soportados no están documentados, por lo que no puede garantizarse un rendimiento multilingüe.
- La longitud de contexto no está disponible, lo que impide planificar casos de uso con contextos largos.
- Aunque el autor declara riesgo de alucinación nulo en las salidas de decisión, esto aplica solo a las salidas tipadas; la variante generativa sí puede producir texto incorrecto.
- El repositorio tiene muy pocas descargas (52) y ningún "like", y fue creado en octubre de 2026 según los metadatos; se trata de un proyecto con escasa validación comunitaria.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las licencias de los componentes base (SigLIP, Laya, SmolLM2) antes de desplegar en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NikhilKanta/vision_laya
- Modelo base Laya: https://huggingface.co/convaiinnovations/laya
- Backbone visual SigLIP: https://huggingface.co/google/siglip-base-patch16-224
- Cabeza de generación SmolLM2-135M-Instruct: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
