# comp-visual-planning/toy-example

## Resumen

`comp-visual-planning/toy-example` no es un modelo de lenguaje, sino un artefacto de investigacion publicado como complemento del paper "Compositional Visual Planning via Inference-Time Diffusion Scaling" (arXiv:2603.02646). Contiene los pesos preentrenados y los datos de entrenamiento del ejemplo de juguete que ilustra la Figura 2 del articulo: un modelo de difusion de horizonte corto entrenado sobre fragmentos de arcos circulares que, en tiempo de inferencia, se compone para generar estructuras mas complejas.

El modelo subyacente es un denoiser DiT1d (Diffusion Transformer unidimensional) con `in_dim` 60, `emb_dim` 256, `d_model` 384, 12 cabezas de atencion y 6 bloques. Se entrena con prediccion de `x0` y 500 pasos de difusion con schedule coseno sobre clips de 8 tokens. El checkpoint publicado corresponde a 420.000 pasos de gradiente.

La relevancia es metodologica, no practica: sirve como reproduccion minima del mecanismo de composicion propuesto (componer tres generadores de arcos de 120 grados en una "flor" de tres petalos imponiendo acuerdo de frontera en cada paso de denoising) y como comparacion contra la linea base DiffCollage / Generative Skill Chaining. Es un recurso para investigadores que quieran validar el metodo sin entrenar desde cero, no un modelo desplegable en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT1d (Diffusion Transformer de 1 dimension), prediccion de `x0`, difusion con schedule coseno de 500 pasos |
| Parametros totales | no disponible (el checkpoint ocupa 132 MB en `diffusion_420000.ckpt` con pesos de `model` y `model_ema`; el numero exacto de parametros no se publica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; opera sobre clips de 8 tokens |
| Tipos de cuantizacion | no disponible (pesos en formato PyTorch nativo) |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | no disponible |
| Formato de pesos | checkpoint PyTorch (`.ckpt`) con state dicts `model` y `model_ema`; datos en `.npy` |
| Dimension del modelo | `in_dim` 60, `emb_dim` 256, `d_model` 384, 12 cabezas, 6 bloques |
| Pasos de entrenamiento | 420.000 pasos de gradiente |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura es un Diffusion Transformer de una sola dimension (DiT1d) que actua como denoiser sobre secuencias de 8 tokens con dimension de entrada 60. El modelo predice `x0` (la muestra limpia) en lugar del ruido, y se entrena con un proceso de difusion de 500 pasos con schedule coseno. La configuracion interna es compacta: `emb_dim` 256, `d_model` 384, 12 cabezas de atencion y 6 bloques, lo que da un modelo lo suficientemente pequeno como para entrenarse y evaluarse en hardware modesto.

Los datos de entrenamiento (`toy.npy`) son un array float64 de forma (64, 600, 2): 64 "flores" rotadas, cada una una curva cerrada de 600 puntos (x, y) compuesta por tres arcos de 120 grados con ruido. El modelo aprende a generar clips de arcos cortos; la innovacion del paper no esta en el entrenamiento sino en la inferencia: en tiempo de test se componen tres generadores de arcos de 120 grados para producir una flor de tres petalos, imponiendo acuerdo de frontera entre los fragmentos en cada paso de denoising. Este mecanismo de "inference-time diffusion scaling" es lo que el ejemplo de juguete pretende reproducir y comparar contra la linea base DiffCollage / Generative Skill Chaining.

## Capacidades

- Generacion de trayectorias 2D: produce clips de arcos circulares de 8 tokens como secuencia de puntos (x, y).
- Composicion en tiempo de inferencia: combina tres generadores de arcos de 120 grados en una estructura cerrada de tres petalos mediante restricciones de acuerdo de frontera.
- Prediccion de `x0` en difusion: el denoiser estima la muestra limpia directamente, lo que facilita la imposicion de restricciones en cada paso.
- Reproduccion de la Figura 2 del paper: permite ejecutar `eval.py` con `method=cvp` (propuesto) y `method=gsc` (linea base).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues.
- No dispone de modo thinking, vision, audio ni ninguna capacidad generica de lenguaje.

## Casos de uso

- Reproduccion de resultados del paper: ejecutar `python eval.py method=cvp` y `python eval.py method=gsc` para verificar la Figura 2 y comparar el metodo propuesto con la linea base DiffCollage / Generative Skill Chaining sin reentrenar.
- Investigacion en difusion composicional: usar el checkpoint como punto de partida para experimentar con nuevas restricciones de frontera o schedules de composicion en un entorno controlado y de bajo coste.
- Docencia y divulgacion: ejemplo minimo y autocontenido (132 MB de pesos y 0,6 MB de datos) para explicar difusion, prediccion de `x0` y composicion en tiempo de inferencia en un curso o tutorial.
- Desarrollo de metodos de planificacion visual: servir de banco de pruebas para tecnicas de "inference-time scaling" antes de escalar a dominios roboticos reales, que es el contexto del paper (cs.RO).
- Validacion de infraestructura: probar pipelines de descarga via `huggingface_hub`, carga de checkpoints PyTorch y evaluacion con Hydra (`method=...`) en un caso de tamano reducido.
- Comparacion de baselines: usar `toy.npy` como dataset de referencia para medir el comportamiento de metodos alternativos de composicion generativa bajo las mismas condiciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas numericas (ni FID, ni error de reconstruccion, ni comparativas cuantitativas frente a la linea base); solo remite a la Figura 2 del paper y al codigo de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 132 MB de checkpoint y una arquitectura de 6 bloques y `d_model` 384, la huella es del orden de cientos de MB, apta para cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; tambien es viable en CPU para pruebas puntuales.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) e incluso en equipos de gama baja.
- Opciones de despliegue: no aplican vLLM, llama.cpp, Ollama ni TGI (no es un modelo de lenguaje). El despliegue se realiza via PyTorch y el repositorio de codigo del ejemplo de juguete, con Hydra para seleccionar el metodo (`method=cvp` o `method=gsc`).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de modelos comparables de la misma categoria (denoisers de difusion para planificacion composicional en 2D) ni metricas que permitan una comparacion cuantitativa. La unica referencia metodologica mencionada es la linea base DiffCollage / Generative Skill Chaining, implementada en el propio repositorio bajo `method=gsc`, pero sin cifras publicadas en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo de proposito general: no genera texto, codigo ni responde a instrucciones; su unico dominio es la generacion de curvas 2D sinteticas.
- Ambito limitado al ejemplo de juguete: los pesos estan entrenados sobre 64 flores sinteticas de tres arcos de 120 grados; no generalizan a otros dominios sin reentrenamiento.
- Licencia no especificada: la ausencia de licencia explicita impide asumir permisos de uso comercial; conviene contactar con los autores antes de cualquier uso fuera del ambito academico.
- Sin garantias de produccion: es un artefacto de investigacion (tags `toy-example`), sin pipeline declarado, sin descargas ni likes, y sin documentacion de robustez.
- Riesgo de sobreajuste al dataset sintetico: al tratarse de 64 muestras con ruido, el modelo puede reproducir sesgos de la distribucion de entrenamiento (rotaciones y ruido concretos) y fallar en configuraciones fuera de esa familia.
- Dependencia de codigo externo: la evaluacion requiere el repositorio del ejemplo de juguete y Hydra; la model card no documenta versiones fijadas de dependencias.
- Idiomas: no aplica, pero conviene senalar que no hay soporte linguistico de ningun tipo.
- Fecha de creacion futura en los metadatos (2026-11-02): verificar la vigencia y posibles actualizaciones del repositorio antes de usarlo como referencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/comp-visual-planning/toy-example
- Paper (arXiv): https://arxiv.org/abs/2603.02646
- Project page: https://comp-visual-planning.github.io/
- Repositorio de codigo del ejemplo de juguete: referenciado en la model card como "toy example repository" (URL no incluida en la informacion disponible); se invoca con `python eval.py method=cvp` o `python eval.py method=gsc`.
- Descarga directa de pesos: `hf download comp-visual-planning/toy-example diffusion_420000.ckpt --local-dir ckpts`
- Descarga directa de datos: `hf download comp-visual-planning/toy-example toy.npy --local-dir data`
