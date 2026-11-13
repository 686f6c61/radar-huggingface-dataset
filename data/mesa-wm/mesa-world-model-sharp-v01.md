# mesa-wm/mesa-world-model-sharp-v01

## Resumen

MESA World Model (identificador `mesa-wm/mesa-world-model-sharp-v01`) es un modelo de mundo condicionado por acciones desarrollado por el autor `mesa-wm` (vinculado al proyecto MESA, Multi Entity Simulation Architecture, de `oggata`). Aprende a predecir lo que ve un residente de la ciudad procedural MESA en primera persona tras ejecutar una acción discreta (avanzar, girar a la izquierda, girar a la derecha o retroceder). No es un modelo de lenguaje: es un simulador neuronal que sustituye al renderizador gráfico en el espacio latente de un codificador DINOv2 congelado.

La arquitectura sigue la receta DINO-WM: un Transformer codificador de dinámica directa que opera sobre tokens de parche de DINOv2 ViT-S/14, complementado por una cabeza de dinámica inversa (vídeo a acción) y un decodificador que reconstruye imágenes de 128×128 píxeles desde las características predichas. El modelo de mundo entrenable ronda los 11 millones de parámetros y el repositorio ocupa 0,2 GB, lo que lo sitúa en la categoría de modelos ligeros ejecutables en CPU.

Su relevancia actual radica en que demuestra planificación basada en modelo (CEM + MPC) dentro de la imaginación del propio modelo, con generalización a ciudades no vistas durante el entrenamiento (64 ciudades de entrenamiento frente a 16 de evaluación), y en que todo el pipeline se reentrena desde cero en una única libreta de Colab en 40-60 minutos sobre una A100. Está publicado con licencia Apache 2.0 y soporta inglés y japonés en su documentación y entorno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer codificador pre-norm para dinámica directa sobre características DINOv2 ViT-S/14 congelado; cabeza de dinámica inversa y decodificador de imagen |
| Parametros totales | 11,0 M (modelo de mundo entrenable); el codificador DINOv2 ViT-S/14 añade 21 M congelados no almacenados en el repo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 3 fotogramas (768 tokens de parche) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ja |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería pytorch) |

## Arquitectura y entrenamiento

El modelo se compone de cuatro piezas. El codificador es DINOv2 ViT-S/14 (`facebookresearch/dinov2:dinov2_vits14`), congelado, que convierte una imagen de 224×224 en 16×16 tokens de parche de 384 dimensiones. El modelo de mundo es un Transformer codificador pre-norm de anchura 384, 6 capas y 8 cabezas, que recibe el estado latente `z_t` junto con una incrustación de acción sumada a cada token y predice el estado siguiente `z_{t+1}` como residuo. Emplea una máscara causal a nivel de fotograma que permite al fotograma *i* atender solo a los fotogramas 0..*i*. La cabeza de dinámica inversa recupera la acción `a_t` a partir del par `(z_t, z_{t+1})`. El decodificador, usado únicamente para visualizar la imaginación y nunca para planificación, reconstruye imágenes de 128×128.

El entrenamiento se realizó sobre 64 ciudades generadas proceduralmente con el mismo generador de mapas y el renderizador `mesa-clouds-renderer` que alimentan la retransmisión en directo, y se evaluó en 16 ciudades nunca vistas. El objetivo es aprender cómo se mueve la vista al caminar o girar, no un mapa memorizado. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO, que en un modelo de dinámica no resultarían aplicables en su forma habitual. La innovación destacable es la planificación en imaginación mediante CEM + MPC guiada únicamente por una imagen objetivo.

## Capacidades

- Predicción de dinámica directa: dado el estado latente de los últimos fotogramas y una acción discreta (avanzar, izquierda, derecha, atrás), predice la siguiente observación en el espacio de características de DINOv2.
- Dinámica inversa: recupera la acción ejecutada entre dos fotogramas (vídeo a acción) mediante una cabeza dedicada.
- Planificación basada en modelo: búsqueda de secuencias de acciones con CEM + MPC dentro del modelo a partir de una imagen objetivo, seguida de ejecución en el entorno real.
- Generalización a entornos no vistos: entrenado en 64 ciudades y evaluado en 16 ciudades nuevas.
- Reconstrucción visual: el decodificador genera imágenes de 128×128 para inspeccionar la "imaginación" del modelo.
- Simulación encadenada: al encadenar predicciones sin reanclar a la observación real, permite recorrer la ciudad enteramente dentro del modelo y observar la acumulación de error.
- Capacidades multilingües: documentación y entorno en inglés y japonés.
- No dispone de generación de texto, tool calling, razonamiento simbólico, matemáticas ni visión general; su ámbito es la simulación visual condicionada por acciones.

## Casos de uso

- Simulación neuronal de un mundo persistente: sustituir el renderizador por el modelo de mundo para que los residentes de MESA imaginen y planifiquen dentro de una copia aprendida de la ciudad, reduciendo el coste de renderizado en tiempo real.
- Planificación de agentes en entornos simulados: usar CEM + MPC sobre el modelo para que un agente encuentre la secuencia de acciones que le lleva a una imagen objetivo y luego la ejecute en el simulador real, útil en robótica de navegación y agentes de videojuegos.
- Investigación en model-based reinforcement learning: servir como banco de pruebas ligero (11 M de parámetros, 40-60 minutos de entrenamiento en A100) para experimentar con dinámica directa e inversa en un dominio visual controlado.
- Etiquetado automático de acciones en vídeo: la cabeza de dinámica inversa permite inferir la acción entre dos fotogramas consecutivos, aplicable a anotación de trayectorias en datasets de navegación.
- Docencia y demostraciones interactivas: el Space `oggata/mesa-world-model-sim` muestra en paralelo el renderizador real y la imaginación del modelo, lo que permite explicar visualmente la acumulación de error en modelos de mundo.
- Evaluación de robustez de políticas: comparar la ejecución de una política en el entorno real frente a su ejecución en la imaginación del modelo para medir la brecha de simulación a realidad.
- Prototipado de visión en primera persona: generar vistas sintéticas condicionadas por acciones para aumentar datasets de navegación sin coste de renderizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 11 M de parámetros entrenables y un codificador DINOv2 ViT-S/14 de 21 M, el modelo completo cabe holgadamente en menos de 1 GB en precisión FP32, aunque la cifra exacta no se especifica.
- GPU recomendadas: no se detallan; el autor indica que el pipeline completo se entrena desde cero en una A100 en 40-60 minutos.
- Cabe en GPU de consumo: sí, por el tamaño reducido del modelo; no se enumeran modelos concretos.
- Opciones de despliegue: PyTorch con carga del codificador vía `torch.hub`; el modelo se ejecuta en un Space gratuito con CPU, lo que confirma viabilidad en CPU. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MESA World Model sharp-v01 | 11,0 M entrenables + 21 M congelados | 3 fotogramas (768 tokens) | Dinámica directa e inversa sobre DINOv2, planificación CEM + MPC | apache-2.0 | Hugging Face, Space y GitHub |
| DINO-WM (receta de referencia) | no disponible | no disponible | Modelo de mundo sobre DINOv2 del que deriva este trabajo | no disponible | Paper arXiv:2411.04983 |
| DINOv2 ViT-S/14 | 21 M | no aplica (codificador) | Codificador visual congelado | no disponible en la información | `torch.hub` de facebookresearch |

No se dispone de datos de benchmarks ni de otros modelos de mundo comparables en la información proporcionada.

## Limitaciones y advertencias

- Ámbito muy restringido: solo modela la vista en primera persona de un residente de MESA con cuatro acciones discretas; no es un modelo general de vídeo ni de lenguaje.
- Acumulación de error: al encadenar predicciones sin reanclar a la observación real, los errores se acumulan, como el propio Space permite comprobar.
- Contexto corto: solo 3 fotogramas (768 tokens), lo que limita la coherencia a largo plazo.
- Resolución baja en la reconstrucción visual: el decodificador genera 128×128 píxeles y se usa solo para inspección, nunca para planificación.
- Dependencia de un codificador externo: requiere cargar DINOv2 ViT-S/14 desde `torch.hub`, lo que introduce una dependencia de red y de versión.
- Idiomas: solo inglés y japonés en documentación y entorno; no hay soporte multilingüe general.
- Sesgos: no se documentan sesgos específicos; al entrenarse en un mundo procedural sintético, no refleja distribuciones del mundo real.
- Uso comercial: la licencia Apache 2.0 lo permite, pero la información no detalla restricciones adicionales sobre los datos o el renderizador asociado.
- Madurez: repositorio con 54 descargas y 0 likes en el momento de la consulta, lo que sugiere un proyecto reciente y poco validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/mesa-wm/mesa-world-model-sharp-v01
- Perfil del autor en Hugging Face: https://huggingface.co/oggata
- Demo (Space): https://huggingface.co/spaces/oggata/mesa-world-model-sim
- GitHub del renderizador: https://github.com/oggata/mesa-clouds-renderer
- Blog (Zenn): https://zenn.dev/oggata/books/fccaa80b4c38bb
- Vídeo de demostración: https://www.youtube.com/watch?v=jidF7Oky-XU
- Retransmisión en directo 24/7: https://www.youtube.com/live/MXz9-ZCeH6w
- Paper DINO-WM: https://arxiv.org/abs/2411.04983
- Paper DINOv2: https://arxiv.org/abs/2304.07193
