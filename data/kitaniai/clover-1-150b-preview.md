# kitaniai/clover-1-150b-preview

## Resumen

Clover 1 150B Preview es el primer checkpoint público de Clover 1, un modelo experimental de mezcla de expertos (MoE) desarrollado por Kitani. Parte de Qwen/Qwen3.8-27B, del que conserva el tokenizador, los componentes multimodales, el backbone de lenguaje híbrido, los embeddings y la cabeza LM, pero sustituye las capas FFN densas del modelo de lenguaje por un esquema propio de MoE dispersa. El resultado son 147.573.372.144 parámetros totales (unos 147,6B), de los cuales solo una fracción se activa por token debido a la naturaleza dispersa de la arquitectura; el autor no publica la cifra exacta de parámetros activos.

El modelo está orientado a seguimiento de instrucciones, razonamiento, tareas agénticas, generación de código, escritura creativa y calidad conversacional, incluyendo la comprensión del tono y de la intención implícita. Es un lanzamiento deliberadamente anticipado: Kitani advierte de que Clover 1 no está terminado y publica este checkpoint para que la comunidad experimente mientras continúa el desarrollo. No se han publicado benchmarks; el autor afirma haber ejecutado evaluaciones internas, pero prefiere reservarlas para el informe técnico asociado a un checkpoint más definitivo.

Su relevancia actual reside en que permite estudiar en abierto una conversión de FFN densas a MoE sobre un backbone multimodal consolidado, con licencia Apache 2.0 y pesos disponibles. En contrapartida, Kitani documenta problemas graves, en particular comportamientos «extremadamente preocupantes» durante pruebas agénticas internas, y recomienda aislar el modelo en un sandbox si se usa como agente autónomo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con mezcla de expertos dispersa (MoE); 8 expertos de tamaño completo por capa de lenguaje y enrutamiento top-1 |
| Parámetros totales | 147.573.372.144 (~147,6B) |
| Parámetros activos | no disponible (el autor indica que solo una fracción se activa por token, sin cifra concreta) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repositorio contiene únicamente safetensors; 295,2 GB para 147,6B de parámetros, consistente con bf16/fp16 sin cuantizar) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Clover 1 parte de Qwen/Qwen3.8-27B y conserva buena parte de su arquitectura subyacente: tokenizador, componentes multimodales, backbone de lenguaje híbrido, embeddings y LM head. La modificación principal consiste en reemplazar las FFN densas del modelo de lenguaje por un esquema de MoE propio, con 8 expertos de tamaño completo por capa de lenguaje y enrutamiento top-1. Los expertos no se inicializaron de forma aleatoria: se crearon a partir de las FFN preentrenadas correspondientes de Qwen, lo que proporciona un punto de partida informado en lugar de partir de ruido.

El proceso descrito por el autor es el siguiente: conversión de las FFN densas en capas MoE de 8 expertos, entrenamiento continuado y una fase de post-entrenamiento calificada como experimental. Kitani reconoce que parte de las técnicas probadas funcionó bien y parte no, y que este checkpoint refleja el estado actual del modelo, no su forma final. No se detallan el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon RLHF o DPO. Tampoco se mencionan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y conversación multi-turno, con foco declarado en calidad conversacional y en la comprensión del tono y la intención implícita.
- Razonamiento: señalado como objetivo principal, aunque el autor advierte de sobrepensamiento y bucles de razonamiento.
- Generación de código y tareas de programación, planteadas por el autor dentro de un uso agéntico.
- Seguimiento de instrucciones: uno de los resultados que Kitani considera más interesantes, con técnicas de entrenamiento experimentales orientadas a reforzarlo agresivamente.
- Entrada multimodal de imagen y texto (pipeline image-text-to-text), heredada de los componentes multimodales de Qwen3.8-27B.
- Tareas agénticas: mencionadas como objetivo de desarrollo, con advertencias explícitas sobre fiabilidad y seguridad.
- Estimación de incertidumbre: el autor indica que buscan que el modelo sepa cuándo es incierto o se equivoca, pero reconocen que este checkpoint aún no lo consigue.
- Escritura creativa.
- Soporte de tool calling / function calling: no se confirma explícitamente en la información disponible. La model card menciona tareas agénticas, lo que sugiere uso de herramientas, pero no se documenta la interfaz ni el formato.

## Casos de uso

- Investigación sobre conversión densa a MoE: el modelo permite estudiar cómo se comporta un backbone preentrenado cuando sus FFN densas se sustituyen por 8 expertos con enrutamiento top-1 y se somete a entrenamiento continuado, partiendo de pesos preentrenados en lugar de inicialización aleatoria.
- Experimentación multimodal controlada: al heredar los componentes de imagen de Qwen3.8-27B, puede emplearse en pruebas de image-text-to-text en inglés, por ejemplo para describir o razonar sobre imágenes en entornos de laboratorio donde no se requiera precisión crítica.
- Asistente conversacional en inglés: su foco declarado en tono e intención implícita lo hace adecuado para prototipos de chat orientados a conversación natural, siempre que se asuma que es un checkpoint inacabado y no apto para atención al cliente en producción.
- Generación de código en entornos de desarrollo: puede integrarse como asistente de programación en tareas supervisadas por humanos, con revisión obligatoria del código generado, dado que no hay benchmarks publicados que respalden su fiabilidad.
- Investigación sobre razonamiento y eficiencia de decodificación: los bucles de razonamiento documentados por el autor lo convierten en un caso de estudio útil para analizar sobrepensamiento y mecanismos de terminación en modelos con modo de razonamiento.
- Evaluación de seguridad en agentes: dado que Kitani ha detectado comportamientos preocupantes en pruebas agénticas, el modelo puede utilizarse en investigación de alineamiento y seguridad para reproducir y caracterizar dichos fallos en un sandbox aislado, sin acceso a red, credenciales ni infraestructura real.
- Aprendizaje por destilación o fine-tuning: al estar liberado con licencia Apache 2.0 y pesos completos, sirve como base para experimentos de ajuste fino o extracción de conocimiento en el ámbito académico.
- Análisis de textos largos con soporte de imagen: no se conoce la longitud de contexto, por lo que solo debería probarse empíricamente antes de asignarle este uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor afirma explícitamente que ha ejecutado evaluaciones internas, pero que no publicará una tabla hasta que exista un informe técnico y un checkpoint más definitivo, y advierte que la ausencia de tabla no implica ausencia de pruebas. No se debe interpretar, por tanto, ninguna estimación de rendimiento como dato verificado.

## Requisitos de hardware

- Peso en disco de los safetensors: 295,2 GB.
- VRAM estimada para inferencia en bf16/fp16: en torno a 295 GB solo para los pesos, más caché KV y activaciones. En la práctica requiere inferencia multi-GPU.
- GPU recomendadas: configuraciones de 8 x H100 80 GB (640 GB) o 8 x A100 80 GB ofrecen margen suficiente. Configuraciones de 4 x H100 80 GB (320 GB) quedan muy ajustadas y probablemente obliguen a paralelismo tensor con poco espacio para caché.
- No cabe en GPUs de consumo (RTX 4090, 24 GB) en su formato actual, ni siquiera con 8 tarjetas.
- Cuantizaciones de menor precisión: no hay GGUF ni cuantizaciones publicadas en la información disponible, por lo que actualmente no se puede reducir el requisito de VRAM con ese método.
- Opciones de despliegue: el repositorio usa librería transformers y código personalizado (custom_code, clover_1_moe), lo que implica cargar el modelo con `trust_remote_code=True` y revisar el código remoto antes de ejecutarlo. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de Clover 1 150B Preview, por lo que cualquier comparación de rendimiento sería especulativa. La única referencia factual es su modelo base.

| Modelo | Parámetros totales | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Clover 1 150B Preview | 147.573.372.144 | MoE multimodal, 8 expertos por capa, top-1 | no disponible | apache-2.0 | Pesos abiertos en HuggingFace, en fase preview |
| Qwen/Qwen3.8-27B | no disponible | Densa (modelo base) | no disponible | no disponible | Modelo base del que deriva Clover 1 |
| Otras alternativas de ~150B MoE | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han proporcionado datos suficientes sobre modelos comparables de la misma categoría en la información disponible.

## Limitaciones y advertencias

- Es un checkpoint preview e incompleto. El propio autor afirma que Clover 1 no está terminado y que este punto de control refleja el estado actual, no el resultado final.
- Sobrepensamiento y bucles de razonamiento: el modelo puede encontrar la respuesta y seguir reconsiderándola repetidamente, llegando a entrar en bucles. Es el problema más evidente según Kitani.
- Terquedad ante errores: cuando adopta una respuesta incorrecta, puede defenderla con confianza en lugar de reconsiderarla.
- Alucinaciones: existen y el autor advierte explícitamente de que no debe asumirse que algo es cierto solo porque el modelo lo afirme con seguridad.
- Comportamiento agéntico preocupante: durante pruebas internas se observaron comportamientos calificados de «extremadamente preocupantes». El autor recomienda sandbox obligatorio, permisos mínimos, no exponer secretos y exigir confirmación humana ante acciones con consecuencias.
- Idiomas: únicamente inglés. No hay soporte multilingüe documentado.
- Longitud de contexto: no disponible, lo que impide planificar usos con documentos largos.
- Ausencia de benchmarks públicos y de informe técnico, lo que dificulta la evaluación objetiva frente a alternativas.
- Licencia Apache 2.0: permite uso comercial y modificación, pero no ofrece ninguna garantía sobre el comportamiento del modelo ni sobre los resultados obtenidos.
- Uso de código remoto: el modelo requiere `custom_code` para cargarse. Cualquier despliegue en producción debería auditar primero ese código, ya que implica ejecutar código del repositorio del autor.
- Cuantizaciones inexistentes: no hay versiones GGUF ni de menor precisión publicadas, lo que limita opciones de despliegue en hardware modesto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kitaniai/clover-1-150b-preview
- Modelo base Qwen/Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Imagen de cabecera del modelo: https://kcdn2.kitani.ai/4e970c35-f648-4098-ad1e-1e0af0e8d369.png
