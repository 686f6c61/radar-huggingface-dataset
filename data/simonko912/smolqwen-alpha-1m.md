# simonko912/smolqwen-alpha-1m

## Resumen

SmolQwen-1M (alpha) es un modelo de lenguaje entrenado desde cero por Simonko912, un desarrollador individual afincado en Eslovaquia, y publicado bajo licencia Apache-2.0. Se trata de un experimento de escala minima: el recuento de parametros del repositorio es de 3.023.445 en total, mientras que la model card declara 1,19 M en el cuerpo del transformer y 2,76 M incluyendo embeddings. Su objetivo no es competir en calidad con modelos de miles de millones de parametros, sino validar una arquitectura y un pipeline de entrenamiento completos (tokenizador, enmascarado documental, optimizador Muon, decodificacion) en un coste de computo negligible.

La arquitectura sigue un esquema hibrido al estilo de las previsualizaciones de Qwen4: bloques gated-linear (GDN-lite) combinados con un unico bloque gated softmax/GQA, RoPE parcial, RMSNorm, SwiGLU, embeddings atados con sesgo de logits aprendido y una cabeza MTP de profundidad uno con unembedding compartido. Se entreno con secuencias de 8192 tokens sobre una mezcla curada de texto web puntuado con FineWeb-Edu, Cosmopedia, TinyStories, turnos de chat de TinyStories-Instruct, trazas aritmeticas, QA de ciencia breve y pareados con rima.

La relevancia practica es doble: por un lado sirve como banco de pruebas reproducible de decisiones arquitectonicas y de receta de entrenamiento en CPU; por otro, el autor lo presenta como paso previo a un modelo "flagship" de unos 10 M de parametros sobre el mismo codigo. Conviene tratarlo como un alfa de investigacion: cero descargas, cero likes y sin resultados en benchmarks estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: bloques gated-linear (GDN-lite) mas un bloque gated softmax/GQA, enmascarado causal documental, RoPE parcial, RMSNorm, SwiGLU |
| Parametros totales | 3.023.445 (recuento del repositorio en safetensors); la model card declara 1,19 M en el transformer y 2,76 M incluyendo embeddings |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens (longitud de entrenamiento con empaquetado best-fit; no se documenta extension en inferencia) |
| Tipos de cuantizacion | no disponible (no se publican pesos GGUF, AWQ, GPTQ ni int8; solo checkpoint PyTorch) |
| Idiomas soportados | no disponible (no declarados; todos los conjuntos de entrenamiento citados estan en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | checkpoint PyTorch `.pt` (`ckpt_mid.pt`) y tokenizador SentencePiece (`spm_mid.model`); el repositorio lleva la etiqueta `safetensors`, pero la model card solo documenta la carga via `torch.load` |

## Arquitectura y entrenamiento

El modelo es un transformer hibrido con un unico bloque de atencion softmax agrupada (GQA) intercalado entre bloques lineales con compuerta (GDN-lite). Incorpora enmascarado causal con consciencia de documento (matrices diagonales por bloque), de modo que el empaquetado de secuencias no filtra contexto entre documentos. Usa RoPE parcial, RMSNorm, activaciones SwiGLU y embeddings atados con un sesgo de logits aprendido; anade una cabeza de prediccion multi-token (MTP) de profundidad uno que comparte el unembedding. El vocabulario es SentencePiece BPE de 8192 piezas, con byte-fallback y sin distincion de mayusculas, lo que reduce el tamano de la matriz de embeddings y explica el desglose de parametros.

El entrenamiento se hizo a 8192 tokens de secuencia con empaquetado best-fit y mascaras documentales diagonales por bloque. La mezcla de datos es explicita: texto web filtrado con la puntuacion de FineWeb-Edu, explicaciones de Cosmopedia, una porcion de fluidez de TinyStories, turnos conversacionales de TinyStories-Instruct, trazas aritmeticas con pasos alineados, pares breves de QA cientifico y pareados con rima. El optimizador combina Muon (via iteraciones de Newton-Schulz) para matrices con AdamW para embeddings, normalizaciones y compuertas, con media movil de pesos (EMA), un schedule tipo WSD y autocast en bf16 con copias maestras en fp32. La validacion reportada es una perdida de 2,10 nats (perplejidad 8,17) sobre una porcion mixta reservada.

## Capacidades

- Generacion de texto corto en ingles: respuestas breves, explicaciones de una o dos frases y continuaciones de estilo narrativo (hereda la fluidez de TinyStories).
- Conversacion basica de un turno: reciprocidad de saludo y respuestas cortas a preguntas tipo wh (que, quien, cual), verificadas con decodificacion greedy.
- Aritmetica simple con trazas escritas: sumas y operaciones con pasos de acarreo explicito y calculo de porcentajes.
- Generacion de pareados con rima, gracias a la porcion de datos de rimas del corpus.
- QA de ciencia de respuesta corta sobre el subconjunto de pares incluido en el entrenamiento.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo no documenta ninguna capacidad agentica.
- Multilingue: no disponible; no se declara ningun idioma y los datos son en ingles, aunque el tokenizador con byte-fallback permite codificar cualquier cadena UTF-8 sin tokens desconocidos.
- Capacidades especiales: no hay modo thinking, vision ni audio. Caben destacar el enmascarado documental, la cabeza MTP y las compuertas lineales como innovaciones de arquitectura, no como capacidades de uso.
- Personalizacion de identidad: el autor indica que se puede anteponer la cadena "You are SmolQwen, an AI assistant created by Simonko912, based in Slovakia." al prompt para obtener una identidad consistente; el plan es integrarla en una futura fase de SFT.

## Casos de uso

- Docencia e investigacion de arquitecturas hibridas: el repositorio incluye `model.py` con la implementacion de bloques GDN-lite, GQA, RoPE parcial y MTP, lo que permite estudiar y modificar la arquitecture a nivel de codigo en una sola GPU o en CPU en segundos.
- Pruebas de humo (smoke tests) de pipelines de generacion: con 3 M de parametros sirve para validar tokenizacion, empaquetado documental, mascaras y decodificacion antes de escalar al modelo de ~10 M previsto.
- Chatbot de demostracion en local o en el navegador: los pesos ocupan del orden de 12 MB en fp32, de modo que la inferencia cabe en un contenedor minimo o incluso en un servicio serverless con CPU compartida.
- Generacion de microrelatos y cuentos infantiles: la porcion de TinyStories del corpus le da fluidez en frases cortas y vocabulario sencillo, adecuado para prototipos de contenido narrativo breve.
- Asistente de calculo explicado: dado que produce pasos de acarreo y porcentajes de forma correcta en las pruebas del autor, puede usarse como ejemplo didactico de razonamiento aritmetico paso a paso (no como calculadora fiable).
- Generacion de pareados y rimas para prototipos creativos: la mezcla incluye pareados rimados, lo que permite experimentar con restricciones de rima sin coste de inferencia.
- Ablaciones de receta de entrenamiento: la combinacion de Muon + AdamW, EMA, schedule WSD y autocast bf16/fp32 esta documentada, lo que facilita reproducir variantes y medir su efecto con la perdida de validacion como metrica rapida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, ARC, HellaSwag) en la informacion disponible. La unica evaluacion reportada es interna y de caracter cualitativo:

| Evaluacion | Resultado | Tipo |
|---|---|---|
| Perdida de validacion (porcion mixta reservada) | 2,10 nats | Cuantitativa |
| Perplejidad derivada | 8,17 | Cuantitativa |
| Reciprocidad de saludo | correcto | Comprobacion greedy cualitativa |
| Respuesta corta a pregunta wh | correcto | Comprobacion greedy cualitativa |
| Aritmetica con pasos de acarreo escritos | correcto | Comprobacion greedy cualitativa |
| Porcentajes | correcto | Comprobacion greedy cualitativa |
| Composicion de varios digitos | fallo conocido | Comprobacion greedy cualitativa |
| Reduccion de fracciones | fallo conocido | Comprobacion greedy cualitativa |

No hay comparacion con otros modelos en la model card, ni curvas de entrenamiento, ni evaluacion con juez automatico o humano.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 12 MB en fp32 y unos 6 MB en bf16 para los 3,02 M de parametros; el tokenizador y el codigo anaden unos pocos MB.
- GPU recomendadas: cualquiera; el modelo es varios ordenes de magnitud menor que la VRAM de una RTX 4090, A100 o H100. No tiene sentido reservar aceleradores dedicados.
- CPU: es el entorno natural (etiqueta `cpu-friendly`); la inferencia greedy sobre prompts cortos se completa en milisegundos en un nucleo moderno.
- Despliegue: solo mediante el codigo del repositorio (`model.py` y `gen.py`) con PyTorch y SentencePiece. No hay soporte declarado en vLLM, TGI, llama.cpp, Ollama ni MLX, y no se publican pesos en GGUF.
- Latencia y throughput: no disponibles; no se publican mediciones de tokens por segundo.
- Nota de seguridad: el ejemplo de carga usa `torch.load(..., weights_only=False)`, lo que implica deserializacion de pickle; en entornos no confiables conviene inspeccionar el checkpoint o convertirlo a safetensors antes de cargarlo.

## Comparativa con modelos similares

Los datos de los modelos comparados provienen de sus fichas publicas y deben verificarse antes de usarlos en produccion; no se han contrastado con la model card de SmolQwen.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SmolQwen-1M (alpha) | 3,02 M totales (1,19 M en el transformer) | 8192 tokens | Apache-2.0 | Repositorio PyTorch, sin pipeline declarado, 0 descargas |
| TinyStories-1M (variantes de Microsoft Research) | ~1 M | no disponible | no disponible | Pesos publicos en HuggingFace |
| SmolLM-135M (HuggingFace) | 135 M | 2048 tokens | Apache-2.0 | Pesos publicos, amplio soporte de runtimes |
| Qwen2.5-0.5B (Alibaba) | 0,49 B | 32 768 tokens | Apache-2.0 | Pesos publicos, soporte en vLLM, llama.cpp y Ollama |

Frente a estos, SmolQwen-1M es dos ordenes de magnitud menor que SmolLM-135M y tres que Qwen2.5-0.5B: su interes es arquitectonico y educativo, no de calidad de tarea. Contra las variantes de TinyStories, aporta contexto de 8192 tokens y una mezcla multidisciplinar, pero carece de su ecosistema de evaluacion y de soporte en herramientas.

## Limitaciones y advertencias

- Estado alfa: el autor lo etiqueta explicitamente como alpha; la identidad no esta integrada en el SFT y depende de un prefijo manual en el prompt.
- Aritmetica fragil: la composicion de varios digitos y la reduccion de fracciones fallan de forma conocida a este tamano.
- Capacidad general muy limitada: 1,19 M de parametros en el cuerpo del transformer implican un conocimiento factual practicamente nulo y una alta tasa de respuestas genericas o incorrectas fuera de los dominios del corpus.
- Riesgo de alucinacion: alto, especialmente en preguntas factuales, ciencia y matematicas mas alla de una o dos operaciones; no se han publicado evaluaciones de factualidad.
- Idiomas: no se declara ningun idioma soportado; el entrenamiento es en ingles y el tokenizador sin mayusculas y con byte-fallback puede degradar la calidad en castellano.
- Sesgos: no disponibles; no se documenta ninguna evaluacion de sesgo ni de toxicidad, y la mezcla incluye texto web filtrado por FineWeb-Edu, con los sesgos que ello arrastra.
- Contexto: los 8192 tokens son la longitud de entrenamiento; no se garantiza un comportamiento estable con prompts largos ni con recuperacion de informacion en posiciones lejanas.
- Licencia: Apache-2.0 permite uso comercial y modificacion, pero el modelo se distribuye tal cual, sin garantias; al ser un alfa sin validacion externa, no es apto para produccion.
- Soporte de runtimes: al ser una arquitectura propia, no funciona en vLLM, llama.cpp, Ollama ni TGI sin trabajo de portabilidad; requiere cargar `model.py` del repositorio.
- Trazabilidad: el repositorio registra fecha de creacion 17/10/2026 en los metadatos, cero descargas y cero likes; no hay publicacion revisada, paper ni evaluacion independiente que respalde las cifras de la model card.
- Formato: aunque el repositorio lleva la etiqueta `safetensors`, la model card solo documenta un checkpoint `.pt`; conviene comprobar que el archivo safetensors corresponde realmente a los pesos finales antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/simonko912/smolqwen-alpha-1m
- Paper tecnico: no disponible
- Blog del autor: no disponible
- Repositorio de codigo independiente: no disponible (el codigo `model.py` y `gen.py` se distribuye dentro del propio repositorio de HuggingFace)
- Demo o Space: no disponible
