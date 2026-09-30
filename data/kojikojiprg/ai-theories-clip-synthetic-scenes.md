# kojikojiprg/ai-theories-clip-synthetic-scenes

## Resumen

`kojikojiprg/ai-theories-clip-synthetic-scenes` es un modelo CLIP de doble codificador entrenado desde cero (implementacion propia, sin librerias de CLIP) como material didactico del proyecto personal `ai-theories`, mantenido por kojikojiprg (Koji Yokoyama). Concretamente es el artefacto del experimento C del cuaderno 020 del repositorio, dedicado a CLIP y aprendizaje contrastivo, y su variante es NegCLIP: durante el entrenamiento se anaden leyendas negativas dificiles al denominador de la direccion imagen -> texto, en lugar de usar solo los negativos que aparecen por azar dentro del lote.

El modelo resuelve un problema acotado y puramente sintetico: emparejar imagenes de 32 x 32 pixeles que contienen dos figuras (8 colores x 5 formas, dispuestas en horizontal o en vertical) con leyendas en ingles generadas por reglas. No es un modelo de proposito general ni un sistema multimodal utilizable con imagenes reales; su valor esta en servir de banco de pruebas reproducible para estudiar el efecto de los negativos dificiles en el aprendizaje contrastivo y como entrada del cuaderno 021.

La relevancia actual es, por tanto, metodologica y educativa: el autor publica los pesos, los hiperparametros (tamano de lote 256, 262.144 ejemplos vistos, semilla 0) y las metricas de evaluacion, ademas del SHA-256 del fichero de pesos, lo que permite verificar la reproducibilidad de un experimento de contraste a pequena escala. El repositorio de HuggingFace ocupa 0,0 GB y no incluye tokenizador ni datos: ambos se regeneran de forma determinista a partir del codigo del proyecto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP de doble codificador: codificador de imagen ViT (`VisionTransformer`, `src/models/vit.py`) + codificador de texto Transformer con mascara causal, proyeccion a un espacio de embedding comun y temperatura aprendida; clase `CLIPDualEncoder` en `src/models/clip.py` |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible (las leyendas son cadenas cortas generadas por reglas; la informacion proporcionada no especifica la longitud maxima) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | state dict de PyTorch (`model_state.pt`); el tokenizador y los datos no se incluyen en el repositorio |
| Variante de entrenamiento | NegCLIP (negativos dificiles en el denominador imagen -> texto) |
| Resolucion de entrada | 32 x 32 pixeles |
| Hiperparametros de entrenamiento | tamano de lote 256, 262.144 ejemplos vistos, semilla 0 |
| Commit de referencia | `65257e0090da96c671f57d7313872e8a78e53685` |
| SHA-256 de `model_state.pt` | `efc2ab9dcd4730f4fe4b74b13c66f33d803fe7c65d9fa75929a8a13f425f1c17` |
| Descargas / likes en HuggingFace | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema CLIP clasico: un codificador de imagen basado en Vision Transformer que parchea la entrada de 32 x 32, un codificador de texto Transformer con mascara causal y una cabeza de proyeccion que lleva ambas modalidades a un espacio de embedding compartido, con un parametro de temperatura aprendido que escala los logits de similitud. Todo esta implementado a mano en el repositorio `ai-theories`, sin reutilizar implementaciones de terceros. La variante evaluada es NegCLIP: en la direccion imagen -> texto se incorporan leyendas negativas dificiles (permutaciones de color y de orden de las figuras) al denominador de la funcion de perdida contrastiva, de modo que el modelo debe discriminar entre descripciones muy proximas entre si.

Los datos de entrenamiento son exclusivamente sinteticos: imagenes de 32 x 32 con dos figuras (8 colores x 5 formas) colocadas en disposicion horizontal o vertical, emparejadas con leyendas en ingles generadas por reglas. El vocabulario, el universo de leyendas y el renderizado de las escenas se reconstruyen de forma determinista desde `src/data/synthetic_scenes.py` mediante `CaptionVocabulary`, `build_caption_universe()` y `render_scenes()`, usando las semillas de render declaradas en `render_seeds` dentro de `config.json`; el vocabulario tambien aparece en `config.json` con fines de verificacion. No hay datos naturales, ni RLHF, ni DPO, ni ajuste por preferencias: el entrenamiento es puramente contrastivo. El autor no documenta el numero total de tokens de texto ni la composicion exacta del dataset mas alla de la descripcion anterior.

## Capacidades

- Recuperacion imagen -> texto en modo zero-shot sobre el dominio sintetico de escenas con dos figuras geometricas, incluidas combinaciones (color, forma) no vistas durante el entrenamiento.
- Clasificacion binaria de pares imagen-texto (aceptar o rechazar una leyenda), con especial robustez frente a negativos dificiles por intercambio de color o de orden.
- Discriminacion fina de atributos: distinguir "un circulo rojo a la izquierda de un cuadrado azul" de "un circulo azul a la izquierda de un cuadrado rojo".
- Generacion de embeddings de imagen y de texto en un espacio comun, lo que habilita busqueda por similitud y evaluacion por similitud coseno.
- Procesamiento de textos en ingles dentro del vocabulario cerrado definido por las reglas de generacion de leyendas.
- Capacidad de servir como componente de entrada para experimentos posteriores del mismo proyecto (el cuaderno 021).
- No dispone de tool calling, function calling, razonamiento multi-paso, modo de pensamiento, vision de imagenes naturales, audio ni generacion de texto libre.

## Casos de uso

- Docencia del aprendizaje contrastivo: el modelo permite mostrar en clase, con un artefacto verificable y de coste de computo minimo, como la incorporacion de negativos dificiles cambia la geometria del espacio de embeddings.
- Reproduccion de experimentos: gracias a la semilla 0, el tamano de lote 256 y las 262.144 muestras vistas, un investigador puede reentrenar el modelo desde el codigo del repositorio y comprobar si reproduce las metricas publicadas (0,7805 de top-1 en recuperacion zero-shot).
- Estudio controlado de negativos dificiles: el par de metricas de intercambio de color (0,9991) e intercambio de orden (0,9984) permite comparar variantes de la funcion de perdida sin ruido de datos reales.
- Banco de pruebas de pipelines de entrenamiento CLIP: al ser un modelo pequeno y con datos regenerables de forma determinista, es adecuado para validar codigo de aumento de datos, bucle de entrenamiento distribuido o calculo de perdidas contrastivas antes de escalar a datasets reales.
- Pruebas de regresion en implementaciones propias: un equipo que escriba su propio CLIP puede usar este modelo como referencia de comportamiento esperado en un dominio cerrado y comprobable.
- Demostraciones de recuperacion multimodal en navegador o en CPU: el reducido coste de computo de una entrada de 32 x 32 permite ejecutar el modelo en entornos sin GPU para ejemplos interactivos.
- Analisis de sesgos controlados: al conocer exactamente la distribucion de colores, formas y posiciones del dataset, se puede medir si el modelo aprende asociaciones espurias entre atributos concretos.

## Benchmarks y rendimiento

Metricas publicadas por el autor, evaluadas sobre los pesos subidos al repositorio:

| Metrica | Conjunto de evaluacion | Resultado |
|---|---|---|
| Recuperacion imagen -> texto, top-1, zero-shot | Combinaciones (color, forma) no vistas: 3.184 imagenes y 796 leyendas candidatas | 0,7805 |
| Recuperacion imagen -> texto, top-1 | Combinaciones conocidas: 2.888 imagenes y 1.444 leyendas candidatas | 0,8691 |
| Exactitud en eleccion binaria, negativos dificiles (global) | Mismo conjunto no visto | 0,9987 |
| Exactitud en eleccion binaria, intercambio de color | Mismo conjunto no visto | 0,9991 |
| Exactitud en eleccion binaria, intercambio de orden | Mismo conjunto no visto | 0,9984 |
| Exactitud en eleccion binaria, negativos aleatorios | Mismo conjunto no visto | 0,9992 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de lenguaje en la informacion disponible, y no procede ejecutarlos porque el modelo no es un modelo de lenguaje generativo. Tampoco hay comparacion numerica con otros modelos CLIP en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se publican parametros totales ni tamano del checkpoint (el repositorio figura con 0,0 GB).
- Estimacion cualitativa: dado que la entrada es de 32 x 32 pixeles y el entrenamiento completo se realizo con lotes de 256 sobre un dataset sintetico pequeno, es razonable esperar que la inferencia quepa en cualquier GPU de consumo e incluso en CPU; no hay cifras oficiales que lo confirmen.
- GPU recomendadas: no disponible. No hay indicacion del autor sobre hardware; cualquier GPU con PyTorch compatible deberia ser suficiente.
- GPU de consumo: probablemente si en cualquier modelo con soporte de PyTorch (por ejemplo, gamas RTX), aunque la informacion proporcionada no lo confirma.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje con pesos en formato GGUF o safetensors de transformers. El despliegue requiere cargar `model_state.pt` con el codigo del propio repositorio (`src/models/clip.py`, `src/models/vit.py`) y reconstruir el tokenizador y los datos desde `src/data/synthetic_scenes.py`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Desarrollo | Datos de entrenamiento | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|---|
| ai-theories CLIP (NegCLIP) | kojikojiprg | 32 x 32 sinteticos, 2 figuras, leyendas por reglas | no disponible | no disponible | MIT | Implementacion desde cero; sin garantia de calidad; uso previsto educativo |
| SynthCLIP | no disponible (paper arXiv 2402.01832) | Pares texto-imagen totalmente sinteticos generados con redes texto-a-imagen y LLM | no disponible | no disponible | no disponible | Trabajo de referencia sobre CLIP entrenado solo con datos sinteticos; la informacion disponible no incluye metricas comparables |
| CLIP original (OpenAI) | OpenAI | Datos naturales a gran escala | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Arquitectura de referencia del enfoque de doble codificador; no hay datos comparativos en la informacion disponible |

No se dispone de cifras homogeneas de rendimiento entre estos modelos, por lo que la comparacion cuantitativa no es posible con la informacion proporcionada.

## Limitaciones y advertencias

- Dominio cerrado: el modelo solo procesa imagenes sinteticas de 32 x 32 con dos figuras geometricas de la paleta y el catalogo de formas del dataset. No es utilizable con fotografias ni con imagenes reales.
- Vocabulario cerrado: las leyendas son cadenas generadas por reglas en ingles; el modelo no comprende lenguaje libre fuera de ese universo.
- Sin garantia de calidad: el autor indica explicitamente que no se ha realizado control de calidad y que el modelo no esta pensado para uso comercial ni para produccion, pese a que la licencia declarada es MIT.
- Tokenizador y datos no incluidos: hay que regenerarlos de forma determinista desde el codigo del repositorio; cualquier cambio en las reglas de generacion invalida la comparacion con las metricas publicadas.
- Riesgo de sobreajuste al formato de las leyendas: las altas exactitudes en tareas binarias (por encima de 0,99) reflejan una tarea muy restringida y no implican capacidad de comprension visual general.
- Sesgos: la distribucion de colores, formas y posiciones es la definida por las reglas del dataset; el modelo puede aprender asociaciones espurias entre atributos sin que exista una evaluacion publicada de ese riesgo.
- Alucinacion: no aplica en el sentido generativo, ya que el modelo produce embeddings y puntuaciones de similitud, no texto libre; si se usa para clasificar pares, puede asignar similitud alta a leyendas incorrectas dentro del vocabulario.
- Idioma: unicamente ingles.
- Reproducibilidad: el autor fija semilla 0 y publica el SHA-256 del state dict, pero no se documentan la version exacta de las dependencias ni el hardware de entrenamiento, lo que puede impedir una reproduccion bit a bit.
- Popularidad y soporte: 0 descargas y 0 likes en el momento de la consulta; no existe comunidad ni mantenimiento fuera del repositorio del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kojikojiprg/ai-theories-clip-synthetic-scenes
- Repositorio del proyecto: https://github.com/kojikojiprg/ai-theories
- Cuaderno 019, ViT y embeddings de parches de imagen: https://github.com/kojikojiprg/ai-theories/blob/main/theories/05_vision_language/019_vision_transformer.ipynb
- Cuaderno 020, CLIP y aprendizaje contrastivo (origen de este modelo): https://github.com/kojikojiprg/ai-theories/blob/main/theories/05_vision_language/020_clip_contrastive_learning.ipynb
- Perfil del autor en HuggingFace: https://huggingface.co/kojikojiprg/datasets
- Modelo relacionado del mismo autor: https://huggingface.co/kojikojiprg/ai-theories-small-gpt-en
- Trabajo relacionado, SynthCLIP: https://arxiv.org/abs/2402.01832
