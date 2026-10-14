# nvidia/PhysicalAI-Simulation-VoMP-Model

## Resumen

VoMP (Volumetric Mechanical Properties) es un sistema de predicción desarrollado por NVIDIA Research que estima campos volumétricos de propiedades mecánicas —módulo de Young (E), coeficiente de Poisson (ν) y densidad (ρ)— en el interior de objetos 3D. A diferencia de los modelos de lenguaje, no genera texto: recibe geometría 3D (mallas, Gaussian Splats, NeRF o SDF) junto con imágenes multi-vista y produce, para cada vóxel, un triplete de propiedades físicas coherentes con materiales del mundo real. El objetivo es automatizar el enriquecimiento de activos 3D con parámetros mecánicos utilizables directamente en simuladores de deformación.

El sistema se compone de dos módulos entrenados conjuntamente: un Geometry Transformer (85,81 M de parámetros) que mapea características visuales y vóxeles dispersos a un código latente material de 2 dimensiones, y un MatVAE (403,7 K de parámetros) que decodifica ese latente a los valores físicos (E, ν, ρ). La extracción de características visuales se apoya en un DINOv2-ViT-L/14 congelado (304,3 M de parámetros), lo que eleva el cómputo total a unos 390,5 M de parámetros.

Su relevancia actual radica en los flujos Real-2-Sim y Sim-2-Real: permite generar réplicas digitales físicamente plausibles de objetos reales para entrenar políticas de robótica en simulación antes de desplegarlas en hardware, y para alimentar gemelos digitales y pipelines de contenido 3D. El modelo se publica bajo la NVIDIA Open Model License y está listo, según el autor, para uso comercial y no comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Geometry Transformer (transformer disperso decoder-only con atención 3D Swin) + MatVAE (autoencoder variacional con flujo normalizador radial); extracción visual con DINOv2-ViT-L/14 |
| Parámetros totales | 85,81 M (Geometry Transformer) + 304,3 M (DINOv2-ViT-L/14) + 403,7 K (MatVAE); ~390,5 M en total |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje; procesa rejillas de vóxeles de 64³ y hasta 32.768 vóxeles no vacíos por objeto) |
| Tipos de cuantización | No disponible (los pesos se distribuyen en safetensors; no se documentan variantes GGUF, AWQ, GPTQ ni FP8) |
| Idiomas soportados | No aplica (modelo multimodal 3D/visión, sin procesamiento de lenguaje natural) |
| Licencia | NVIDIA Open Model License Agreement |
| Formato de pesos | safetensors (tamaño de repositorio: 2,8 GB) |

## Arquitectura y entrenamiento

El Geometry Transformer es un transformer disperso decoder-only con atención 3D Swin, 12 bloques, 12 cabezas de atención, dimensión de modelo 768, ventana de 8 y MLP ratio de 4. Consume características agregadas de DINOv2 y rejillas de vóxeles dispersos, y escala hasta 32.768 vóxeles no vacíos por objeto. Su backbone se inicializa a partir de TRELLIS, mientras que las características visuales provienen de DINOv2-ViT-L/14, que procesa imágenes a 518×518 píxeles (parches de 37×37) y produce vectores de 1024 dimensiones por parche. La entrada 3D se normaliza a una caja envolvente [-0,5, 0,5]³ y se voxeliza a resolución 64³; las 150 vistas de cámara se muestrean mediante secuencia de Hammersley sobre una esfera de radio 2 unidades, con campo de visión de 40° y renderizado a 512×512 píxeles.

El MatVAE define el manifold de materiales: un autoencoder variacional con latente de 2 dimensiones, codificador y decodificador de 3 capas con 256 dimensiones ocultas y posterior basada en un flujo normalizador radial. Su objetivo es una β-TC-VAE modificada con pesos α=1,0 (KL), β=2,0 (TC) y γ=1,0 (MI), restricción de nats libres δ=0,1, annealing de KL durante 200 épocas y normalización log min-max, lo que impone plausibilidad física a las predicciones (E, ν, ρ). La regularización incluye weight decay, dropout de 0,05 en MatVAE y restricciones de capacidad para evitar el colapso del posterior.

El entrenamiento empleó AdamW con learning rate 1×10⁻⁴, weight decay 5×10⁻² para el Geometry Transformer y 1×10⁻⁴ para MatVAE. El Geometry Transformer se entrenó en FP16 durante 200.000 pasos con batch size 16 (4 por GPU en 4 A100), gradient clipping 1,0, scheduler de cosine annealing, EMA de 0,9999 y pérdida ℓ2 sobre las propiedades decodificadas. El MatVAE se entrenó en FP32 durante 850 épocas con batch size 256 y gradient clipping 5,0. El cómputo total se estima en 2,4×10²⁰ FLOPs sobre 4× NVIDIA A100 80GB durante aproximadamente 5 días (Geometry Transformer) y 12 horas (MatVAE), con un consumo estimado de 237,6 kWh a 450 W.

## Capacidades

- Predicción de campos volumétricos de propiedades mecánicas: módulo de Young (E), coeficiente de Poisson (ν) y densidad (ρ) por vóxel, en el interior completo del objeto (no solo en la superficie).
- Entrada multimodal 3D: acepta mallas triangulares (formato USD), Gaussian Splats, Neural Radiance Fields (NeRF) y Signed Distance Functions (SDF), combinadas con imágenes multi-vista.
- Escalabilidad espacial: soporta hasta 32.768 vóxeles no vacíos por objeto sobre una rejilla de 64³.
- Salida en manifold de materiales continuo: el MatVAE restringe las predicciones a combinaciones físicamente plausibles aprendidas de un conjunto de materiales reales (MTD).
- Integración con simulación deformable: las propiedades generadas alimentan directamente simuladores físicos para animación y robótica.
- No dispone de tool calling, function calling, razonamiento multi-paso conversacional ni capacidades de agente: no es un modelo de lenguaje.
- No procesa audio, voz ni texto; sus "entradas de lenguaje" no aplican.

## Casos de uso

- Gemelos digitales de objetos reales: a partir de un escaneo o reconstrucción multi-vista (Gaussian Splat, NeRF o malla), VoMP asigna propiedades mecánicas volumétricas que permiten simular deformaciones realistas en el gemelo digital sin caracterización manual de materiales.
- Flujos Real-2-Sim en robótica: convierte activos capturados del mundo real en activos simulables con física plausible, de modo que el simulador reproduce el comportamiento del objeto físico antes de entrenar una política.
- Sim-2-Real (transferencia de políticas): al dotar a los objetos de simulación de módulo de Young, Poisson y densidad coherentes, las políticas entrenadas en simulación se transfieren con menor brecha de realidad al robot físico.
- Creación de contenido 3D y VFX: artistas y estudios pueden generar automáticamente parámetros materiales para cientos de activos, evitando asignar a mano propiedades de deformación en escenas con muchos objetos.
- Aumento de datasets de simulación: enriquecer catálogos de activos 3D con campos mecánicos volumétricos para entrenar modelos downstream de dinámica, colisión o agarre.
- Simulación de manipulación robótica: estimar la rigidez y compresibilidad de objetos cotidianos (botellas, tejidos, envases) para planificar fuerzas de agarre en un planificador robótico.
- Investigación en gráficos por computador: servir como referencia para estudiar la predicción de propiedades físicas a partir de geometría y apariencia, dado que el modelo, el dataset y la evaluación son públicos.
- Preprocesado de activos para motores físicos: integrar VoMP en una pipeline que tome USD y devuelva mallas anotadas con E, ν y ρ listas para motores de simulación deformable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas de error (por ejemplo, error relativo en E, ν o ρ) ni comparaciones numéricas con otros métodos; únicamente se describen arquitectura, proceso de entrenamiento y carga computacional.

## Requisitos de hardware

- Peso de los pesos: el repositorio ocupa 2,8 GB en safetensors (Geometry Transformer 85,81 M + DINOv2-ViT-L/14 304,3 M + MatVAE 403,7 K).
- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, los pesos en FP16 ocupan aproximadamente 0,8 GB y en FP32 unos 1,6 GB, a lo que hay que sumar las activaciones del transformer disperso al procesar hasta 32.768 vóxeles y las 150 vistas de entrada; el consumo real no está documentado.
- GPU de entrenamiento confirmadas: 4× NVIDIA A100 80GB (5 días para el Geometry Transformer, 12 horas para MatVAE).
- GPU consumer: no se documenta compatibilidad. Por tamaño de pesos, una GPU con 24 GB (por ejemplo RTX 4090) o incluso 16 GB es plausible para inferencia, pero no hay confirmación del autor.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama o TGI (no son aplicables a este tipo de modelo). La integración esperada es mediante PyTorch y el código del proyecto.
- Latencia y throughput: no disponibles.
- Consumo energético de entrenamiento: estimación de 237,6 kWh asumiendo 450 W; el autor indica que las emisiones no se calcularon.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la misma categoría (predicción de campos volumétricos de propiedades mecánicas a partir de geometría y multi-vista). Los elementos relacionados que aparecen en la documentación son componentes del propio sistema o modelos base, no alternativas equivalentes:

| Modelo | Rol respecto a VoMP | Parámetros | Licencia | Disponibilidad |
|---|---|---|---|---|
| VoMP (Geometry Transformer + MatVAE) | Sistema completo de predicción de propiedades mecánicas volumétricas | ~390,5 M (incluyendo DINOv2) | NVIDIA Open Model License | Pesos en HuggingFace |
| TRELLIS | Modelo base usado para inicializar el backbone del Geometry Transformer | No disponible en la información | No disponible en la información | No disponible en la información |
| DINOv2-ViT-L/14 | Extractor de características visuales congelado, integrado en VoMP | 304,3 M | No disponible en la información | No disponible en la información |

## Limitaciones y advertencias

- No se han publicado métricas de error ni benchmarks: no es posible cuantificar la precisión de las propiedades predichas con la información disponible.
- Resolución espacial fija: la voxelización se realiza a 64³, lo que limita el detalle de las variaciones internas de material en objetos con estructuras finas o heterogeneidad a pequeña escala.
- Dependencia de la entrada: requiere imágenes multi-vista (150 vistas con parámetros de renderizado específicos) y una representación 3D; no funciona con una sola imagen ni con geometría sin apariencia.
- Normalización obligatoria de la entrada: los objetos deben estar normalizados a la caja [-0,5, 0,5]³, lo que exige un preprocesado cuidadoso.
- Riesgo de predicciones físicamente inválidas fuera de la distribución de entrenamiento: el MatVAE impone plausibilidad aprendida del conjunto MTD, por lo que materiales poco representados en ese conjunto pueden recibir valores sesgados.
- Sesgos de dominio: al depender de DINOv2 para la apariencia y de un dataset concreto de activos físicos, el comportamiento puede degradarse en categorías de objetos, iluminaciones o materiales distintos a los vistos en entrenamiento.
- Idiomas: no aplica, pero tampoco hay soporte de texto ni de instrucciones en lenguaje natural.
- Licencia: el uso se rige por la NVIDIA Open Model License Agreement; conviene revisar sus condiciones antes de un despliegue comercial, aunque el autor declara que el modelo está listo para uso comercial y no comercial.
- Emisiones: no calculadas formalmente; solo se ofrece una estimación energética de 237,6 kWh para el entrenamiento.
- No es un modelo generativo de texto: no admite tool calling, agentes, RAG ni prompting conversacional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nvidia/PhysicalAI-Simulation-VoMP-Model
- Paper (arXiv): https://arxiv.org/abs/2510.22975
- Página del proyecto: https://research.nvidia.com/labs/sil/projects/vomp/
- Demo interactiva: https://huggingface.co/spaces/nvidia/PhysicalAI-Robotics-VoMP-Demo
- Dataset preprocesado: https://huggingface.co/datasets/nvidia/PhysicalAI-Robotics-PhysicalAssets-VoMP
- Dataset de evaluación: https://huggingface.co/datasets/nvidia/PhysicalAI-Robotics-PhysicalAssets-VoMP-Eval
- Licencia NVIDIA Open Model License Agreement: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Web corporativa de NVIDIA: https://www.nvidia.com/
- Wikipedia de NVIDIA: https://en.wikipedia.org/wiki/Nvidia
