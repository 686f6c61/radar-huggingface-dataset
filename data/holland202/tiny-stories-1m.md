# holland202/tiny-stories-1m

## Resumen

tiny-stories-1m es un modelo de generacion de texto de 1.018.624 parametros desarrollado por Chad Holland (usuario holland202) y publicado en Hugging Face. Se trata de un GPT byte-level diminuto entrenado desde cero sobre el corpus TinyStories V2 (51,2 millones de bytes de cuentos infantiles generados por GPT-4), con un objetivo puramente de investigacion: demostrar que un modelo de lenguaje puede entrenarse en hardware muy modesto (2 nucleos de CPU, unas 2 horas) y superar a una linea base estadistica como un modelo de n-gramas de bytes. El modelo ocupa unos 4 MB en safetensors.

Arquitectura y tamano son deliberadamente minimos: un transformer decoder de 5 bloques pre-LN con anchura 128, atencion de 4 cabezas con posiciones rotatorias (RoPE), MLP con activacion GELU, embeddings atados y vocabulario de 256 simbolos (un token por byte). La longitud de contexto es de 256 bytes, lo que limita severamente la coherencia narrativa. No es un modelo para produccion: es una pieza de investigacion reproducible con comprobaciones registradas antes del entrenamiento.

Su relevancia actual es metodologica. El autor documenta resultados con metricas honestas (bits por byte, porcentaje de palabras reales, porcentaje de spans copiados literalmente del entrenamiento) y conserva publicamente un intento fallido previo (TLM-001) junto al que funciono (TLM-002). Es un ejemplo de practica cientifica abierta a pequena escala, no una alternativa a modelos de lenguaje utiles para tareas reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder byte-level (GPT), 5 bloques pre-LN, atencion de 4 cabezas con RoPE, MLP GELU, embeddings atados |
| Parametros totales | 1.018.624 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 bytes |
| Tipos de cuantizacion | no disponible (pesos en safetensors, tamano ~4 MB) |
| Idiomas soportados | en (ingles) |
| Licencia | CDLA-Sharing-1.0 (pesos); codigo MIT |
| Formato de pesos | safetensors (model.safetensors) |

## Arquitectura y entrenamiento

El modelo es un GPT byte-level implementado en `gpt.py`: vocabulario de 256 simbolos (un token por byte), anchura 128, 5 bloques transformer con pre-LN, atencion de 4 cabezas con posiciones rotatorias y MLP con GELU, con embedding de entrada y salida atados. Se entreno con AdamW (lr 1e-3, betas 0.9/0.95, weight decay 0.1), 6.250 pasos de batches de 32 secuencias de 256 bytes, con schedule coseno, durante aproximadamente 2 horas en 2 nucleos de CPU.

Los datos de entrenamiento son 51.200.000 bytes de TinyStories V2, un corpus de cuentos infantiles escritos por GPT-4. No se menciona RLHF, DPO ni ajuste por instrucciones. La innovacion metodologica no esta en la arquitectura sino en el protocolo de evaluacion: el autor registro los criterios antes del entrenamiento, compara contra un modelo de n-gramas de bytes (8-gramas), realiza una prueba con texto barajado (bytes desordenados) para verificar que la puntuacion refleja estructura real y publica tanto el intento fallido (TLM-001) como el exitoso (TLM-002). El modelo fue disenado, entrenado y evaluado por una IA (Claude Opus 5.5) con direccion humana, sin validacion humana independiente.

## Capacidades

- Generacion de texto narrativo muy corto en ingles, a nivel de byte, con estilo de cuento infantil.
- Generacion byte a byte: no requiere tokenizador; procesa y emite bytes UTF-8 directamente.
- Coherencia local de palabras y frases: el 99,48 % de las palabras generadas aparecen en el texto de entrenamiento.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Multilingue: no; solo ingles (y de forma muy limitada).
- No dispone de modo thinking, vision, audio ni capacidades multimodales.
- Inferencia en CPU pura, sin GPU, con el codigo incluido en el repositorio.

## Casos de uso

- Docencia y divulgacion sobre modelos de lenguaje: permite mostrar de principio a fin como se entrena un GPT (codigo de entrenamiento, evaluacion y generacion incluidos) en un portatil sin GPU, con coste computacional minimo.
- Reproduccion de experimentos de investigacion: el repositorio incluye registros, logs, puntuaciones y hashes de pesos de las ejecuciones TLM-001 y TLM-002, lo que facilita replicar el protocolo y comparar semillas.
- Estudio de tokenizacion byte-level frente a word-piece: sirve como caso controlado para analizar diferencias de comportamiento y metricas (bits por byte) entre ambos enfoques con el mismo corpus TinyStories.
- Benchmark de lineas base estadisticas: el modelo de n-gramas de bytes incluido (`ngram.py`) permite comparar un transformer diminuto contra un contador de n-gramas en tareas de modelado de lenguaje a muy baja escala.
- Pruebas de infraestructura de inferencia en CPU: util para validar pipelines de carga de safetensors, generacion con muestreo y decodificacion UTF-8 en entornos sin acelerador.
- Demostracion interactiva en navegador: el Space asociado permite probar el modelo sin instalacion, adecuado para talleres y charlas introductorias.
- Experimentos de evaluacion de fidelidad: las metricas de spans copiados (4,51 %) y palabras reales permiten estudiar memorizacion y alucinacion en modelos muy pequenos.

## Benchmarks y rendimiento

| Metrica | tiny-stories-1m (seed 22) | Mismo modelo (seed 21) | 8-gramas de bytes (60 MB) | TLM-001 (2,5x menos entrenamiento) | Cuentos reales (referencia) |
|---|---|---|---|---|---|
| Bits por byte (held-out) | 1,1242 | 1,1422 | 1,1736 | 1,3633 / 1,3698 | no disponible |
| Palabras reales | 99,48 % | 99,60 % | no disponible | 98,0 % / 97,0 % | 100 % |
| Spans de 50 bytes copiados | 4,51 % | 2,81 % | no disponible | 1,4 % / 3,2 % | 7,82 % |

Notas: con los bytes del mismo texto barajados, el modelo puntua 10,56 bits por byte, lo que indica que la puntuacion refleja estructura real y no azar (8,0 seria adivinacion aleatoria). Un modelo sin entrenar obtiene un 67 % de palabras reales. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; el modelo pesa unos 4 MB y se ejecuta en CPU.
- GPU recomendadas: no requiere GPU. Cualquier CPU x86 moderna es suficiente; el autor solo lo ha medido en Linux CPU.
- Cabe en cualquier GPU consumer (e integrada) y en cualquier dispositivo con al menos unos pocos MB de memoria libre.
- Opciones de despliegue: PyTorch con safetensors y el codigo `gpt.py` incluido; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (el formato byte-level y la arquitectura no estandar lo harian inviable sin adaptacion).
- Latencia y throughput: no disponibles de forma cuantificada; el entrenamiento completo (6.250 pasos) tardo unas 2 horas en 2 nucleos de CPU, lo que da una idea del orden de magnitud de la inferencia (muy rapida por token, pero sin cifras publicadas).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tokenizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tiny-stories-1m (este) | 1.018.624 | 256 bytes | byte-level | CDLA-Sharing-1.0 | Hugging Face |
| TinyStories 1M (Eldan & Li, 2023) | ~1M | no disponible en la informacion | word-piece | no disponible en la informacion | paper arXiv 2305.07759 |
| TinyStories 33M (Eldan & Li, 2023) | ~33M | no disponible en la informacion | word-piece | no disponible en la informacion | paper arXiv 2305.07759 |
| 8-gramas de bytes (linea base del autor) | no aplica (modelo estadistico) | 8 bytes | byte-level | no disponible | incluido en el repositorio |

El autor senala explicitamente que el paper TinyStories entreno modelos de 1M a 33M parametros sobre los mismos datos con tokenizador word-piece y mas computo, por lo que este modelo es una reconstruccion abierta y solo-CPU con verificaciones registradas, no una mejora sobre aquellos.

## Limitaciones y advertencias

- Las historias no mantienen coherencia global: las palabras y frases son correctas, pero las tramas divagan y los personajes cambian sin logica.
- El margen frente al modelo de n-gramas es pequeno (0,05 bits por byte) y el rival estaba limitado a 8 bytes de contexto.
- Contexto de solo 256 bytes, lo que impide cualquier forma de razonamiento de largo alcance.
- Solo ingles y con vocabulario efectivo muy limitado al dominio de cuentos infantiles.
- Riesgo de alucinacion y de deriva narrativa alto; no apto para tareas factuales.
- Restricciones de licencia: los pesos heredan CDLA-Sharing-1.0 del dataset TinyStories; conviene revisar las condiciones de comparticion antes de un uso comercial.
- El modelo fue disenado, entrenado y evaluado por una IA con direccion humana y sin validacion humana independiente; no ha sido reproducido por terceros.
- Solo probado en Linux CPU; no medido en movil ni en otros entornos.
- No es un modelo de produccion: no soporta tool calling, agentes ni ajuste por instrucciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/holland202/tiny-stories-1m
- Demo en el navegador (Space): https://huggingface.co/spaces/holland202/tiny-stories-1m-demo
- Repositorio de experimentos y registros: https://github.com/holland202/principia-artificialis/tree/main/experiments/tiny_lm
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Paper TinyStories (Eldan & Li, 2023): https://arxiv.org/abs/2305.07759
