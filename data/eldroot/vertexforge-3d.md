# EldRoot/VertexForge-3D

## Resumen

VertexForge-3D es un modelo de generacion de mallas 3D a partir de texto, desarrollado por EldRoot Studios como un checkpoint de investigacion en fase alfa (v0.1). Su objetivo es convertir descripciones en lenguaje natural en mallas poligonales 3D listas para entornos de desarrollo de videojuegos y produccion virtual. Combina un autoencoder VQ-VAE para tokenizar geometria 3D discreta con un transformer autoregresivo condicionado por embeddings de texto de CLIP ViT-B/32, siguiendo la arquitectura MeshGPT.

La relevancia actual del modelo reside en que aborda un problema emergente: la generacion automatica de activos 3D nativos (mallas) para pipelines de desarrollo, evitando la dependencia de reconstrucciones basadas en imagenes o campos de radiancia. Sin embargo, se trata de una investigacion temprana entrenada sobre un conjunto de datos reducido de 1.112 activos, por lo que su produccion es limitada en detalle y complejidad topologica. El modelo esta disponible bajo licencia Apache-2.0 y se distribuye en formato PyTorch con un tamano de repositorio de 0,3 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MeshGPT (VQ-VAE residual + transformer autoregressive de 6 capas con posicionamiento axial) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 2046 tokens (max_seq_len del transformer) |
| Tipos de cuantizacion | no disponible (entrenado con bfloat16 y TF32) |
| Idiomas soportados | ingles (en), ruso (ru) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

El modelo sigue el esquema MeshGPT: un VQ-VAE residual discretiza las coordenadas de vertices y caras triangulares en un codebook de 192 vectores latentes con 2 cuantificadores por coordenada. Un transformer autoregressive de 6 capas y 8 cabezas de atencion con dimension 256 genera secuencias de tokens geometricos, condicionado mediante cross-attention con embeddings de texto CLIP ViT-B/32 de 512 dimensiones. Se utiliza Classifier-Free Guidance (CFG) para mejorar la adherencia al prompt.

El entrenamiento se realizo sobre un conjunto curado de 1.112 activos de videojuegos, con hardware de una NVIDIA GeForce RTX 5070 Ti empleando bfloat16 y aceleracion TensorFloat-32 (TF32). No se menciona el uso de RLHF ni DPO. El pipeline completo incluye un paso posterior de generacion de materiales PBR (BaseColor, Normal, Roughness, Metallic, AO) mediante UV unwrapping con xatlas, aunque este componente parece ser independiente del modelo principal.

## Capacidades

- Generacion de mallas poligonales 3D en formato OBJ a partir de descripciones de texto.
- Condicionamiento multimodal mediante embeddings de CLIP (texto) con cross-attention.
- Soporte de Classifier-Free Guidance para ajustar la adherencia al prompt.
- Tokenizacion geometrica discreta mediante VQ-VAE residual.
- Pipeline integrado de generacion de texturas PBR (5 canales) para assets listos para motor grafico.
- Exportacion directa a formatos compatibles con Blender y Unreal Engine 5.
- Multilingue limitado a ingles y ruso (dependiente de la capacidad del modelo CLIP subyacente).
- No soporta tool calling, agentes ni razonamiento multi-paso; es exclusivamente generativo de geometria.

## Casos de uso

- Prototipado rapido de props para videojuegos: el modelo puede generar formas base de objetos como armas o elementos de escenario a partir de un prompt, agilizando la fase de concept art y bloqueo en proyectos indie.
- Generacion de variantes de assets: dado un prompt similar, el modelo puede producir multiples variaciones de un mismo objeto, util para poblar escenarios con variedad sin modelado manual.
- Educacion y aprendizaje de modelado 3D: estudiantes pueden usar el modelo para entender como se estructuran mallas poligonales a partir de descripciones textuales.
- Investigacion en generacion de geometria: sirve como base de comparacion para modelos mas avanzados de text-to-3D, especialmente en el estudio de tokenizacion VQ-VAE de mallas.
- Desarrollo de herramientas de asistencia creativa: integrado en plugins de Blender o Unreal Engine para generar objetos preliminares que luego el artista refina manualmente.
- Generacion de set-dressing en entornos virtuales: para producciones virtuales con Unreal Engine, el modelo puede crear objetos sencillos de relleno (piedras, cajas, muebles) con topologia basica.
- Evaluacion de pipelines de generacion de texturas PBR: el componente de sintesis de materiales puede evaluarse por separado para optimizar el flujo de texturizado automatico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan metricas como MMLU, HumanEval o GSM8K, ni comparaciones cuantitativas con otros modelos de generacion 3D. La model card solo indica limitaciones cualitativas: las salidas muestran estructura geometrica temprana pero carecen de micro-detalles de alta frecuencia.

## Requisitos de hardware

- VRAM estimada: no especificada. Dado el tamano del modelo (0,3 GB en disco) y la arquitectura de 6 capas, la inferencia deberia caber en GPUs consumer de 8-12 GB, aunque la generacion de secuencias de 2046 tokens puede consumir memoria adicional.
- GPU recomendada: NVIDIA GeForce RTX 5070 Ti (usada en entrenamiento) o equivalente con soporte para bfloat16 y TF32.
- Compatible con GPU de consumo: si, se espera que funcione en RTX 3060 12 GB o superiores.
- Opciones de despliegue: inferencia directa con PyTorch, sin soporte oficial para vLLM, llama.cpp, Ollama o TGI (es un modelo de generacion 3D, no de texto).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VertexForge-3D | text-to-3D | MeshGPT + VQ-VAE + CLIP | 2046 tokens | Apache-2.0 | HuggingFace |
| MeshGPT (original) | text-to-3D | VQ-VAE + transformer | no especificado | MIT | Codigo abierto |
| Meshy | text-to-3D (comercial) | no publicada | no especificado | Propietaria | API comercial |
| Forge3D | text-to-3D (comercial) | no publicada | no especificado | Propietaria | API comercial |

La comparativa se limita a informacion publica. VertexForge-3D es un modelo de investigacion alfa, mientras que las alternativas comerciales (Meshy, Forge3D) ofrecen resultados de produccion pero no publican arquitectura ni pesos. MeshGPT es la base tecnica de este modelo.

## Limitaciones y advertencias

- Version alfa temprana: el modelo es un prototipo de investigacion con resultados de baja calidad, carente de micro-detalles y con topologia simple.
- Conjunto de datos reducido: entrenado con solo 1.112 assets, lo que limita la generalizacion a categorias de objetos no representadas.
- Sesgo de datos: el conjunto de datos se compone de activos de videojuegos, lo que puede sesgar las salidas hacia estilos y tipos de objetos de ese dominio.
- Riesgo de alucinacion geometrica: puede generar mallas no manifold o con artefactos topologicos no validos para produccion.
- Limitaciones de contexto: la ventana de 2046 tokens limita la complejidad de las mallas generables; objetos muy detallados no cabran en la secuencia.
- Idioma limitado: solo ingles y ruso, y la calidad depende de la capacidad de CLIP para entender prompts en otros idiomas.
- Sin soporte de produccion: no hay herramientas de despliegue, cuantizacion ni optimizacion para inferencia de alto rendimiento.
- El pipeline de texturas PBR no esta integrado en el checkpoint; requiere componentes adicionales (xatlas, etc.) no incluidos en el repositorio.
- Licencia Apache-2.0 permite uso comercial, pero el estado alfa y la falta de garantias hacen recomendable una evaluacion rigurosa antes de usarlo en produccion.

## Enlaces

- HuggingFace: https://huggingface.co/EldRoot/VertexForge-3D
- Sitio web de EldRoot Studios: https://eldroot.studio
- Organizacion EldRoot en HuggingFace: https://huggingface.co/EldRoot
- Referencia de arquitectura MeshGPT: https://meshgpt.io/
- Referencia de TRELLIS (mencionada como direccion futura): no disponible en los resultados de busqueda.
