# nvidia/Cosmos3-Nano-Sim-Auto

## Resumen

Cosmos3-Nano-Sim-Auto es un modelo generativo de simulación de mundo desarrollado por NVIDIA dentro de la familia Cosmos3, orientado a IA física para conducción autónoma. Se trata de una variante destilada de forma causal a partir de Cosmos3-Nano-Transfer-Auto, que a su vez deriva del modelo base Cosmos3-Nano mediante post-entrenamiento sobre datos de conducción multi-sensor, incluido LiDAR. El modelo genera vídeo multi-cámara sincronizado y observaciones LiDAR condicionadas a un prompt de texto y a controles de World Scenario Map (WSM), lo que permite simulación en bucle cerrado en tiempo real.

La arquitectura es un transformer con esquema Mixture-of-Transformers (MoT) y aproximadamente 16.000 millones de parámetros (15.157.324.096 según los pesos en safetensors). Su rasgo diferencial es la generación por fragmentos pequeños de latentes condicionada a un historial cacheado y a los controles WSM entrantes, lo que posibilita que las observaciones posteriores reflejen las acciones actualizadas de una política de conducción o de un volante humano. Soporta hasta 11 vistas de cámara estándar y ojo de pez, con salida LiDAR alineada espacial y temporalmente y convertible a nubes de puntos 3D.

El modelo resulta relevante porque cubre una necesidad concreta en el ciclo de desarrollo de vehículos autónomos: evaluar políticas de conducción y stacks de percepción multi-sensor en un entorno sintético coherente, sin depender exclusivamente de datos reales. Se distribuye bajo licencia OpenMDW1.1 y NVIDIA lo declara apto tanto para uso comercial como no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture-of-Transformers (MoT) |
| Parametros totales | 15.157.324.096 (aproximadamente 16B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (generacion por fragmentos de latentes con historial cacheado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW1.1 (openmdw1.1-license) |
| Formato de pesos | safetensors |
| Libreria | cosmos |
| Tamano del repositorio | 32,4 GB |
| Entradas | Texto, video WSM (controles de camara), imagen RGB inicial opcional, controles LiDAR y LiDAR medido opcional |
| Salidas | Video multi-camara sincronizado (hasta 11 vistas) y LiDAR alineado (nubes de puntos 3D) |
| Vistas de camara soportadas | 1 a 11 (Hyperion 8.1: front-wide 120 grados, front-tele 30 grados, cross-left/right 120 grados, rear-left/right 70 grados, rear-tele 30 grados, fisheye front/left/right/rear 200 grados) |
| LiDAR | 128 haces rotativo |
| Fecha de publicacion | 20/10/2026 (Hugging Face y GitHub) |

## Arquitectura y entrenamiento

Cosmos3-Nano-Sim-Auto se construye en dos etapas sobre Cosmos3-Nano. La primera consiste en un post-entrenamiento sobre datos de conducción multi-sensor, incluido LiDAR, que produce Cosmos3-Nano-Transfer-Auto. La segunda aplica una destilación causal que convierte el modelo en un generador de pocos pasos que produce vídeo en fragmentos pequeños de latentes condicionado a un historial cacheado y a los controles WSM entrantes. Ese historial cacheado aporta contexto temporal entre fragmentos, lo que permite mantener coherencia a lo largo de la secuencia sin reprocesar toda la historia en cada paso.

La arquitectura interna es un Mixture-of-Transformers, un esquema que reparte el cómputo entre subconjuntos de parámetros según la modalidad o la función. Cámaras y LiDAR se generan de forma conjunta para garantizar consistencia espacial y temporal entre ambos sensores. El modelo se desarrolló con el Cosmos Framework de NVIDIA. No se han publicado en la información disponible datos sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Generación de vídeo multi-cámara sincronizado condicionado a texto y a controles de World Scenario Map (WSM).
- Generación conjunta de LiDAR alineado espacial y temporalmente con las vistas de cámara, convertible a nubes de puntos 3D.
- Simulación en bucle cerrado en tiempo real: la generación por fragmentos con historial cacheado permite que las observaciones posteriores reflejen las entradas de conducción actualizadas.
- Aceptación de controles de una política de conducción autónoma o de una interfaz humana de volante.
- Condicionamiento inicial opcional con imagen RGB por cámara (directa o extraída del primer fotograma del vídeo de control).
- Condicionamiento LiDAR medido opcional: una única barrida inicial en representación de rango/intensidad con canales de rango, intensidad y validez.
- Control de escena mediante texto: clima, iluminación y hora del día; el texto también transporta la configuración de cámaras.
- Soporte de configuraciones de 1 a 11 vistas, incluidas cámaras de ojo de pez de 200 grados.
- No se documentan en la información disponible capacidades de tool calling, razonamiento multi-paso, agentes ni procesamiento de audio.

## Casos de uso

- Evaluación de políticas de conducción en bucle cerrado: el modelo recibe las acciones de una política AV a través del renderizador WSM y devuelve observaciones coherentes, de modo que el equipo puede medir el comportamiento de la política ante escenarios sintéticos reproducibles antes de validarla en vehículo real.
- Verificación de stacks de percepción multi-sensor: al generar cámaras y LiDAR conjuntamente y alineados, es posible alimentar un stack de percepción con entradas sintéticas etiquetadas y comprobar su consistencia en condiciones controladas de clima, iluminación y hora del día.
- Generación de datos sintéticos para entrenamiento: el modelo produce secuencias multi-cámara con LiDAR asociado que pueden aumentar datasets reales en escenarios poco frecuentes o peligrosos, reduciendo la dependencia de recolección en carretera.
- Pruebas de regresión de software autónomo en CI: la generación por fragmentos con historial cacheado permite ejecutar rollouts repetibles y comparar el comportamiento de distintas versiones del stack ante los mismos controles WSM.
- Simulación con operador humano en el bucle: la interfaz de volante humano puede conectarse al renderizador WSM para estudiar la respuesta del sistema ante decisiones humanas y generar trazas de referencia.
- Validación de configuraciones de sensores: con soporte de 1 a 11 vistas, incluidos objetivos de 30 grados y ojo de pez de 200 grados, el equipo puede evaluar cómo afecta la disposición de las cámaras a la cobertura y a la calidad de la percepción simulada.
- Adaptación a plataformas de sensores propias: partiendo de Cosmos3-Nano-Transfer-Auto y su skill de post-entrenamiento, es posible ajustar el modelo a una configuración de cámaras y LiDAR distinta de la de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo de aproximadamente 16B parámetros en safetensors requiere del orden de 32 GB solo para los pesos en precisión de 16 bits, a lo que hay que sumar el estado de activaciones y el coste de generar vídeo multi-cámara y LiDAR; no se dispone de cifras oficiales de cuantización.
- GPU recomendadas: no disponible. NVIDIA no especifica modelos concretos en la información disponible; el rendimiento de inferencia depende del hardware y de la configuración de generación según la model card.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el modelo se usa a través de la librería `cosmos` y del Cosmos Framework (https://github.com/NVIDIA/cosmos-framework). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles. La model card indica únicamente que el throughput depende del hardware y de la configuración de generación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cosmos3-Nano-Sim-Auto | aproximadamente 16B | no disponible | Texto, video multi-camara, LiDAR | OpenMDW1.1 | Hugging Face, GitHub |
| Cosmos3-Nano-Transfer-Auto | no disponible | no disponible | Texto, video multi-camara, LiDAR | no disponible en la informacion | Hugging Face |
| Cosmos3-Nano | no disponible | no disponible | no disponible en la informacion | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. Las alternativas de otros fabricantes para simulación de mundo en conducción autónoma no están cubiertas en la información disponible.

## Limitaciones y advertencias

- El condicionamiento con LiDAR medido solo admite una barrida inicial; no se soportan prefijos medidos más largos en la ruta de inferencia causal actual.
- La configuración de sensores está limitada al conjunto Hyperion 8.1 y a LiDAR rotativo de 128 haces; para usar una plataforma propia es necesario post-entrenar Transfer-Auto previamente.
- El modelo está especializado en conducción y escenas de tráfico; no es un modelo de propósito general y no se documentan capacidades de texto, código o razonamiento.
- No se han publicado en la información disponible datos sobre sesgos, tasas de alucinación visual ni evaluación de fidelidad física de las secuencias generadas.
- No se especifican los idiomas soportados en las entradas de texto.
- La licencia OpenMDW1.1 debe revisarse en el enlace oficial antes de un despliegue comercial; NVIDIA declara el modelo apto para uso comercial y no comercial, pero las condiciones concretas no se detallan en la información disponible.
- Al tratarse de un modelo destilado de pocos pasos, la calidad puede degradarse en configuraciones de generación alejadas de las previstas; no se documentan rangos recomendados.
- No se dispone de cifras de latencia ni de requisitos de VRAM, lo que dificulta planificar el dimensionamiento de infraestructura sin pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/Cosmos3-Nano-Sim-Auto
- Colección Cosmos3: https://huggingface.co/collections/nvidia/cosmos3
- Colección Cosmos3 Examples: https://huggingface.co/collections/nvidia/cosmos3-examples
- Código: https://github.com/nvidia/cosmos
- Cosmos Framework: https://github.com/NVIDIA/cosmos-framework
- Skill de Cosmos3-Nano-Sim-Auto: https://github.com/NVIDIA/cosmos-framework/tree/main/.agents/skills/cosmos3-nano-sim-auto
- Informe técnico: https://research.nvidia.com/labs/cosmos-lab/cosmos-simulation/technical-report.pdf
- Sitio web: https://research.nvidia.com/labs/cosmos-lab/cosmos-simulation/
- Licencia OpenMDW1.1: https://openmdw.ai/license/1-1/
- Cosmos3-Nano: https://huggingface.co/nvidia/Cosmos3-Nano
- Cosmos3-Nano-Transfer-Auto: https://huggingface.co/nvidia/Cosmos3-Nano-Transfer-Auto
- Referencias arXiv incluidas en los tags: arxiv:1706.08500, arxiv:1812.01717, arxiv:2603.03283
