# oggata/mesa-world-model-sharp-v01

## Resumen

MESA World Model es un modelo de mundo condicionado por acciones desarrollado por el usuario oggata, construido sobre la simulacion MESA (Multi Entity Simulation Architecture), una ciudad procedural con residentes que se emite en directo por YouTube las 24 horas. El modelo aprende que ve un residente en primera persona cuando camina por el pueblo y predice el siguiente fotograma a partir de los ultimos fotogramas y una accion discreta (avanzar, girar a la izquierda, girar a la derecha, retroceder). Sigue la receta DINO-WM y opera en el espacio de caracteristicas de un encoder DINOv2 ViT-S/14 congelado.

Tecnicamente es un Transformer encoder pre-norm de 6 capas, anchura 384 y 8 cabezas, con aproximadamente 11 millones de parametros entrenables. Trabaja sobre un contexto de 3 fotogramas (768 tokens de 384 dimensiones) y predice el residuo de las caracteristicas del siguiente fotograma. Incluye una cabeza de dinamica inversa que recupera la accion entre dos fotogramas y un decoder separado que convierte caracteristicas en imagenes de 128x128, usado solo para visualizar la "imaginacion" del modelo, nunca para planificacion.

Su relevancia radica en que demuestra que un modelo de mundo pequeno y barato (entrenable desde cero en una notebook de Colab en 40-60 minutos sobre una A100 y ejecutable en una CPU Space gratuita) puede generalizar a pueblos no vistos y servir como simulador aprendido para planificacion con CEM y MPC. Es una pieza de investigacion reproducible, no un modelo de lenguaje de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder pre-norm (dinamica directa) sobre caracteristicas DINOv2 ViT-S/14 congelado |
| Parametros totales | 11,0 M entrenables en el modelo de mundo; 21 M congelados en el encoder DINOv2 ViT-S/14 (no almacenados en el repo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 3 fotogramas (768 tokens de 384 dimensiones) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles, japones (segun metadatos de la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria PyTorch) |

## Arquitectura y entrenamiento

El pipeline se compone de cuatro bloques. El encoder es un DINOv2 ViT-S/14 congelado que convierte una imagen de 224x224 en 16x16 tokens de parche de 384 dimensiones; se carga desde `torch.hub` y no se distribuye en el repositorio. El modelo de mundo es un Transformer encoder pre-norm de anchura 384, 6 capas y 8 cabezas, con 11,0 M de parametros, que recibe un contexto de 3 fotogramas (768 tokens) y una accion discreta en {forward, left, right, backward}. La embedding de accion se suma a cada token y una mascara causal a nivel de fotograma permite que el fotograma *i* atienda solo a los fotogramas 0..*i*. La salida es un residuo que se suma a las caracteristicas del fotograma actual para predecir el siguiente.

Una cabeza de dinamica inversa toma el par (z_t, z_{t+1}) y recupera la accion a_t (video a accion). Un decoder independiente transforma las caracteristicas predichas en imagenes de 128x128, exclusivamente para inspeccion visual de la imaginacion del modelo; la planificacion se realiza en el espacio de caracteristicas, nunca en pixeles. El entrenamiento se hizo sobre 64 pueblos generados proceduralmente y se evaluo en 16 pueblos no vistos, con el objetivo de aprender como se mueve la vista al caminar o girar, no un mapa memorizado. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplico RLHF o DPO (no procede en este tipo de modelo).

## Capacidades

- Prediccion de video en primera persona condicionada por accion: dado un contexto de 3 fotogramas y una accion, genera las caracteristicas del siguiente fotograma.
- Simulacion aprendida: encadenando predicciones permite recorrer el pueblo enteramente dentro de la imaginacion del modelo.
- Generalizacion a entornos no vistos: entrenado en 64 pueblos, evaluado en 16 pueblos nuevos.
- Dinamica inversa: recupera la accion tomada entre dos fotogramas (video a accion).
- Planificacion en el espacio latente: dada solo una imagen objetivo, busca secuencias de acciones con CEM y MPC y las ejecuta en el entorno real.
- Reconstruccion visual de la imaginacion mediante decoder a 128x128 (solo para inspeccion).
- No soporta tool calling, function calling, razonamiento multi-paso simbolico ni capacidades de audio o vision general; su dominio es estrictamente la simulacion MESA.

## Casos de uso

- Investigacion en modelos de mundo: reproduccion del experimento DINO-WM a pequena escala para estudiar generalizacion a entornos no vistos y acumulacion de error en predicciones encadenadas.
- Planificacion basada en modelo: usar CEM y MPC en el espacio de caracteristicas para encontrar secuencias de acciones que alcancen una imagen objetivo, y ejecutarlas en el renderer real.
- Aprendizaje de dinamica inversa: extraer acciones a partir de pares de fotogramas para etiquetar trayectorias o auditar comportamientos de agentes.
- Prototipado de agentes en simulacion: dado su tamano (11 M parametros) y su ejecucion en CPU, sirve para iterar rapidamente sobre politicas de navegacion antes de trasladarlas a entornos mas costosos.
- Docencia y divulgacion: el pipeline completo se entrena desde cero en una notebook de Colab (40-60 minutos en A100), lo que lo hace adecuado para cursos de model-based RL y world models.
- Demostracion interactiva en navegador: el Space permite comparar lado a lado el renderer real y la imaginacion del modelo, util para comunicar limitaciones de los simuladores aprendidos.
- Generacion de datos sinteticos de navegacion: encadenar predicciones para producir trayectorias sinteticas de vistas en primera persona en pueblos procedurales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el modelo de mundo son 11 M de parametros (decenas de MB en fp32) y el encoder DINOv2 ViT-S/14 anade 21 M congelados. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para comodidad; el Space de demostracion funciona en CPU gratuita.
- Cabe en GPU consumer: si, en cualquier RTX o equivalente; tambien en CPU para inferencia interactiva.
- Entrenamiento: el pipeline completo se entrena desde cero en una A100 en 40-60 minutos, segun la model card.
- Opciones de despliegue: PyTorch nativo con `torch.hub` para cargar DINOv2; el repositorio incluye pesos en safetensors. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles de forma numerica; la model card indica que el Space se ejecuta en CPU gratuita.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MESA World Model (este) | 11,0 M entrenables + 21 M congelados (DINOv2) | 3 fotogramas | Prediccion de video en primera persona condicionada por accion, planificacion latente | Apache 2.0 | Hugging Face + Space |
| DINO-WM (receta de referencia) | No disponible en la informacion proporcionada | No disponible | World model sobre caracteristicas DINOv2 | No disponible | Paper arXiv:2411.04983 |
| DINOv2 ViT-S/14 (encoder base) | 21 M | No aplica (encoder de imagen) | Extraccion de caracteristicas visuales | No disponible en la informacion proporcionada | `torch.hub` de facebookresearch |

No se dispone de datos de benchmarks ni de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Dominio muy restringido: solo modela la vista en primera persona de un residente en pueblos MESA con cuatro acciones discretas; no generaliza a otros entornos, camaras ni acciones continuas.
- Acumulacion de error: al encadenar predicciones sin re-imaginar desde lo realmente visible, los errores crecen con el tiempo, como se muestra en el Space al desmarcar la opcion de re-imaginacion.
- Resolucion baja: el decoder produce imagenes de 128x128 y se usa solo para inspeccion; la planificacion opera en caracteristicas, no en pixeles.
- Contexto corto: 3 fotogramas (768 tokens) limitan la memoria temporal del modelo.
- Idiomas declarados (ingles, japones) se refieren a la documentacion y metadatos, no a capacidades linguisticas del modelo, que no procesa texto.
- Sin datos publicados de benchmarks, sesgos o tasas de alucinacion; al ser un modelo de investigacion con 9 descargas y 0 likes, no hay validacion externa.
- Licencia Apache 2.0 permite uso comercial, pero el modelo depende de DINOv2 cargado via `torch.hub`; conviene revisar la licencia de ese componente por separado.
- No apto para produccion como sustituto del renderer sin evaluacion previa de la deriva de predicciones.

## Enlaces

- Hugging Face: https://huggingface.co/oggata/mesa-world-model-sharp-v01
- Perfil del autor en Hugging Face: https://huggingface.co/oggata
- Demo (Space): https://huggingface.co/spaces/oggata/mesa-world-model-sim
- Repositorio GitHub (renderer): https://github.com/oggata/mesa-clouds-renderer
- Blog (Zenn): https://zenn.dev/oggata/books/fccaa80b4c38bb
- Video demostracion: https://www.youtube.com/watch?v=jidF7Oky-XU
- Directo 24/7 en YouTube: https://www.youtube.com/live/MXz9-ZCeH6w
- Paper DINO-WM: https://arxiv.org/abs/2411.04983
- Paper DINOv2: https://arxiv.org/abs/2304.07193
