# kaist-ai/debiaslens

## Resumen

DeBiasLens es una colección de checkpoints de autoencoders dispersos (sparse autoencoders, SAE) entrenados sobre activaciones residuales post-MLP de encoders de visión y de modelos visión-lenguaje. No es un modelo generativo, sino un artefacto de interpretabilidad: cada checkpoint permite descomponer las activaciones internas de un encoder concreto en características dispersas que pueden analizarse y manipularse para estudiar y mitigar sesgos sociales.

El desarrollo corre a cargo de kaist-ai (KAIST) y se asocia al artículo "Interpretable Debiasing of Vision-Language Models for Social Fairness", presentado en CVPR 2026 y disponible en arXiv:2602.24014. El paquete incluye once configuraciones que cubren distintos encoders (CLIP ViT-B/16, CLIP ViT-L/14-336, InternViT-300M-448px y LLaVA-OneVision-Qwen2-7B), distintas capas (11, 23 y 25) y distintos factores de expansión (x1, x2, x4 y x8), entrenados sobre datasets como FairFace, CelebA, BIOS, COCO-Gender y SBBench.

Su relevancia es metodológica: proporciona un mecanismo reutilizable para auditar sesgos en modelos multimodales y aplicar steering sobre las representaciones internas sin reentrenar el modelo base. El repositorio ocupa 0,3 GB y se distribuye como pesos PyTorch (`ae.pt`) más ficheros `config.json` con la configuración de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse autoencoder Matryoshka BatchTopK (k=20) sobre activaciones residuales post-MLP |
| Parametros totales | no disponible (depende del factor de expansión y del encoder de origen) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (artefacto de interpretabilidad, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en punto flotante PyTorch) |
| Idiomas soportados | no disponible (los SAE sobre CLIP/InternViT heredan el multilingüismo limitado del encoder base) |
| Licencia | no disponible |
| Formato de pesos | `ae.pt` (PyTorch) + `config.json` |

## Arquitectura y entrenamiento

Cada checkpoint es un sparse autoencoder de tipo Matryoshka BatchTopK con k=20, entrenado sobre las activaciones residuales post-MLP de una capa concreta de un encoder visual o visión-lenguaje. La variante Matryoshka permite obtener representaciones anidadas a distintas granularidades, y BatchTopK impone un presupuesto de activación disperso (20 características activas por muestra) que facilita la interpretación de las unidades aprendidas.

Los datos de entrenamiento son las activaciones extraídas de los encoders sobre distintos conjuntos: FairFace (caras balanceadas por atributos), CelebA, BIOS (texto), COCO-Gender y COCO-Gender-Text (texto), y SBBench-Syn-Crop. Las combinaciones publicadas incluyen CLIP ViT-L/14-336 capa 23 (x1 y x8), InternViT-300M-448px capa 23 (x1 y x8), CLIP ViT-B/16 capa 11 (x1, x4 y x8), y LLaVA-OneVision-Qwen2-7B capa 25 (x2 y x8). El repositorio replica la estructura `checkpoints_dir/` del código de entrenamiento, de modo que las rutas pueden reutilizarse directamente.

La innovación principal no está en el SAE en sí, sino en su uso dentro del pipeline DeBiasLens: identificar direcciones latentes asociadas a atributos sociales y aplicar steering sobre ellas para reducir sesgos en las representaciones del encoder sin reentrenar el modelo base. El artículo describe el método completo; el repositorio solo distribuye los checkpoints.

## Capacidades

- Descomposición interpretable de activaciones internas de encoders visuales y visión-lenguaje en características dispersas.
- Análisis de sesgos sociales: permite localizar características latentes correlacionadas con atributos como género, raza o edad en los datasets de entrenamiento empleados.
- Steering de representaciones: las direcciones aprendidas pueden usarse para modular las activaciones del encoder y reducir sesgos en tareas posteriores.
- Compatibilidad con múltiples encoders: CLIP ViT-B/16, CLIP ViT-L/14-336, InternViT-300M-448px y LLaVA-OneVision-Qwen2-7B.
- Cobertura de varias capas (11, 23 y 25) y factores de expansión (x1, x2, x4, x8) para estudiar el compromiso entre granularidad y fidelidad de reconstrucción.
- No soporta tool calling, agentes, generación de texto ni multimodalidad de entrada/salida: es un artefacto de análisis, no un modelo de inferencia.

## Casos de uso

- Auditoría de sesgos en encoders visuales: cargar el SAE correspondiente a la capa 23 de CLIP ViT-L/14-336 y analizar qué características se activan ante imágenes de FairFace para identificar direcciones correlacionadas con atributos protegidos.
- Investigación en interpretabilidad mecanicista: usar los checkpoints Matryoshka para estudiar cómo se organiza la información social en las representaciones de distintos encoders y comparar entre arquitecturas.
- Debiasing por steering en pipelines de visión-lenguaje: aplicar la dirección aprendida sobre las activaciones de LLaVA-OneVision-Qwen2-7B (capa 25, x2 o x8) para reducir sesgos en las respuestas del modelo sin reentrenamiento.
- Evaluación comparativa de encoders: entrenar o reutilizar SAE sobre CLIP ViT-B/16, InternViT y LLaVA-OneVision para medir en qué capas y con qué expansión se concentran las representaciones sesgadas.
- Reproducción de resultados académicos: el repositorio replica la estructura de `checkpoints_dir/` del código de entrenamiento, lo que facilita reproducir los experimentos del artículo CVPR 2026.
- Docencia y formación: usar los checkpoints como material didáctico para explicar SAE, diccionarios dispersos y análisis de sesgos en modelos multimodales con ejemplos concretos y pesos ligeros (0,3 GB en total).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de reconstrucción, fidelidad, sparsity efectiva ni comparaciones cuantitativas con otros SAE; el artículo referenciado (arXiv:2602.24014) es la fuente donde deberían consultarse.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio completo ocupa 0,3 GB; cada checkpoint individual es una fracción de ese tamaño, por lo que la inferencia del SAE cabe en cualquier GPU consumer con varios GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente para ejecutar el SAE; para extraer activaciones del encoder base se necesita la VRAM que requiera dicho encoder (por ejemplo, LLaVA-OneVision-Qwen2-7B en bf16 requiere del orden de 15-16 GB).
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090, etc., siempre que el encoder subyacente también quepa.
- Opciones de despliegue: el código de referencia usa `huggingface_hub` y la clase `MatroyshkaBatchTopKSAE` del paquete `dictionary_learning`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un SAE).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Encoders cubiertos | Capas | Expansiones | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DeBiasLens (kaist-ai) | SAE Matryoshka BatchTopK k=20 | CLIP ViT-B/16, CLIP ViT-L/14-336, InternViT-300M, LLaVA-OneVision-Qwen2-7B | 11, 23, 25 | x1, x2, x4, x8 | no disponible | Hugging Face |
| SAE de Anthropic / OpenAI (referencia) | SAE sobre activaciones de LLM | Modelos de lenguaje propietarios | Múltiples | Variables | no disponible | Parcial / no público |
| SAE de EleutherAI (dictionary_learning) | SAE genéricos | Múltiples (configurables) | Configurable | Configurable | no disponible | GitHub |
| SAE específicos de CLIP (varios autores) | SAE sobre CLIP | CLIP ViT-B/16, ViT-L/14 | Variables | x1-x8 | variable | Hugging Face / GitHub |

La comparativa con SAE de terceros es aproximada: no se dispone de métricas públicas homogéneas para contrastar fidelidad de reconstrucción o calidad de las características. La principal diferencia de DeBiasLens es su enfoque explícito en sesgos sociales y su integración en un pipeline de debiasing publicado en CVPR 2026.

## Limitaciones y advertencias

- No es un modelo generativo: no puede usarse para texto, código, matemáticas, visión directa ni tool calling; es un artefacto de análisis que requiere el encoder base para producir activaciones.
- Los SAE están entrenados sobre datasets concretos (FairFace, CelebA, BIOS, COCO-Gender, SBBench-Syn-Crop); su validez fuera de esas distribuciones no está garantizada.
- La licencia no está especificada en la model card ni en la información disponible; debe consultarse antes de cualquier uso comercial.
- El sesgo detectado y las direcciones de steering dependen del encoder y la capa elegidos; trasladar conclusiones entre capas o modelos puede no ser válido.
- Riesgo de interpretación errónea: las características dispersas no son necesariamente monosemánticas ni causalmente relevantes; el artículo original debe consultarse para el protocolo de validación.
- Los idiomas soportados no están documentados; los SAE sobre CLIP/InternViT heredan las limitaciones multilingües del encoder subyacente.
- El repositorio no incluye pipeline, demo ni espacio de Hugging Face; el uso requiere código externo (`dictionary_learning`) y extracción propia de activaciones.
- Fecha de creación del repositorio: 2026-11-13; con 0 descargas y 0 likes, no hay evidencia de uso comunitario ni de mantenimiento continuado.

## Enlaces

- Hugging Face: https://huggingface.co/kaist-ai/debiaslens
- Paper CVPR 2026 (PDF): https://openaccess.thecvf.com/content/CVPR2026/papers/An_An_Interpretable_Debiasing_of_Vision-Language_Models_for_Social_Fairness_CVPR_2026_paper.pdf
- arXiv: https://arxiv.org/abs/2602.24014
- Código de entrenamiento referenciado (`dictionary_learning`): no disponible en la información proporcionada
- Demo o espacio de Hugging Face: no disponible
