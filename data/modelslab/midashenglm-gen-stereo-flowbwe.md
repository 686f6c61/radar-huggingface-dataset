# ModelsLab/midashenglm-gen-stereo-flowbwe

## Resumen

MiDashengLM-Gen 48 kHz Stereo Decoder es un componente de generacion de audio desarrollado por ModelsLab que combina dos piezas: un decodificador estereo `lp8` ya publicado, que cubre la banda de 0 a 8 kHz, y un modelo generativo de extension de ancho de banda basado en flow matching de 64 bandas Mel (`FlowBWE-Mel64`), que reconstruye la banda de 8 a 24 kHz. El resultado es una salida estereo a 48 kHz, es decir, audio de banda completa con contenido sintetizado en las frecuencias altas que el decodificador base no produce.

El modelo es relevante porque aborda un problema clasico en la sintesis de audio neuronal: los decodificadores de codecs latentes suelen trabajar a frecuencias de muestreo reducidas o con ancho de banda limitado, lo que produce un sonido apagado. La extension de banda mediante flow matching permite recuperar agudos de forma generativa sin necesidad de un decodificador completo a 48 kHz, reduciendo coste computacional. Segun la model card, la inferencia del modulo de extension tarda aproximadamente 115 ms por clip en una H100.

Con 34.922.500 parametros (segun los pesos en safetensors) y un repositorio de 0,4 GB, se trata de un modelo pequeno y especializado, pensado como etapa final de un pipeline de generacion de audio mas amplio (presumiblemente el sistema MiDashengLM-Gen) y no como un modelo de proposito general. La informacion publica disponible es muy limitada: no hay pipeline declarado, licencia, idiomas ni datos de entrenamiento documentados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador estereo `lp8` (0-8 kHz) + extension de banda generativa FlowBWE-Mel64 con flow matching (8-24 kHz) |
| Parametros totales | 34.922.500 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la salida es audio; no se documenta cobertura linguistica) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors` y `flowbwe_mel64.safetensors`) |

## Arquitectura y entrenamiento

La arquitectura consta de dos etapas encadenadas. La primera es el decodificador estereo `lp8`, que reconstruye la senal de 0 a 8 kHz a partir de representaciones latentes. La segunda es `FlowBWE-Mel64`, un modelo generativo de extension de banda que opera sobre 64 bandas Mel y emplea flow matching para modelar la distribucion de la banda de 8 a 24 kHz. La reconstruccion final usa Griffin-Lim con fase compartida y 32 iteraciones, un esquema de proyeccion iterativa que evita depender de un vocoder neuronal adicional en esa etapa.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni detalles del proceso de ajuste del modulo de extension. La model card unicamente documenta el esquema de inferencia (32 iteraciones de Griffin-Lim con fase compartida) y el coste medido en H100 (~115 ms por clip). El tag `48khz` hace referencia a la frecuencia de muestreo de salida del sistema completo.

## Capacidades

- Generacion de audio estereo a 48 kHz con banda completa (0-24 kHz) a partir de latentes del decodificador `lp8`.
- Extension de ancho de banda generativa: sintetiza contenido en la banda de 8 a 24 kHz que el decodificador base no produce.
- Reconstruccion de fase mediante Griffin-Lim con fase compartida (32 iteraciones).
- Orientado a efectos de sonido (SFX) y voz, segun las metricas CLAP reportadas en la model card.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multilingues de texto.
- No se documentan modos especiales (thinking, vision, audio de entrada) mas alla de la generacion de audio.

## Casos de uso

- Post-procesado en pipelines de sintesis de audio: insertar el modulo FlowBWE-Mel64 al final de un generador existente para elevar la salida de 8 kHz a 24 kHz de ancho de banda, mejorando la nitidez percibida sin reentrenar el decodificador base.
- Generacion de efectos de sonido para videojuegos: la model card reporta una mejora de CLAP en SFX (0,3103 a 0,3448), lo que sugiere uso en bibliotecas de SFX generativos donde importa la riqueza espectral en agudos.
- Produccion de voz sintetica de mayor calidad: la mejora de CLAP en habla (0,1187 a 0,1633) indica que el modulo aporta detalle en la banda alta relevante para inteligibilidad y naturalidad de voces generadas.
- Prototipado rapido de audio en investigacion: con ~115 ms por clip en H100 y un repositorio de 0,4 GB, es viable iterar sobre lotes pequenos en experiments de codecs neuronales.
- Evaluacion comparativa de decodificadores: el esquema A/B documentado (ciego contra `lp8`, 20 clips) sirve como metodologia replicable para medir mejoras de extension de banda en otros modelos.
- Restauracion o mejora de material de banda limitada: al operar como extension de banda sobre una representacion Mel de 64 bandas, puede aplicarse a senales cuyo contenido por encima de 8 kHz se haya perdido, siempre que se disponga del front-end adecuado.

## Benchmarks y rendimiento

Resultados reportados en la model card (Gate 1, A/B a 4 bandas sobre `r2v2_500`, 20 clips):

| Metrica | `lp8` solo | Con FlowBWE-Mel64 | Variacion |
|---|---|---|---|
| Preferencia ciega (Gemini 3 Flash vs `lp8`) | 4 victorias de 4 comparaciones decididas (16 empates) | no aplica | 100% de victorias, 0 derrotas |
| CLAP en SFX | 0,3103 | 0,3448 | +0,0345 |
| CLAP en habla | 0,1187 | 0,1633 | +0,0446 |
| Latencia de inferencia (H100) | no disponible | ~115 ms por clip | no disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que se trata de un modelo de audio y no de texto.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 34,9 M de parametros en safetensors, los pesos ocupan del orden de decenas de MB en fp32, por lo que el cuello de botella sera el proceso iterativo de Griffin-Lim y el buffer de audio, no el modelo.
- GPU recomendadas: la unica referencia medida es H100 (~115 ms por clip). Por el tamano, deberia caber en GPU de consumo, aunque no se documenta soporte ni rendimiento en ellas.
- Cabe en GPU de consumo: probablemente si, dado el reducido numero de parametros, pero no confirmado por el autor.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo). El despliegue requeriria cargar los safetensors con PyTorch y ejecutar el pipeline de decodificacion y Griffin-Lim.
- Latencia y throughput: ~115 ms por clip en H100 para el modulo de extension; no se documenta throughput agregado ni latencia del decodificador `lp8`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / banda | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiDashengLM-Gen Stereo FlowBWE (este) | 34,9 M | 0-24 kHz, salida 48 kHz | Decodificador `lp8` + flow matching BWE | no disponible | Hugging Face (ModelsLab) |
| Decodificador `lp8` solo | no disponible | 0-8 kHz | Decodificador estereo | no disponible | Incluido en el mismo repo |
| Alternativas de extension de banda (p. ej. vocoders GAN tipo HiFi-GAN) | no disponible | hasta 24-48 kHz | Vocoder neuronal | variable | no disponible en la informacion proporcionada |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas de la misma categoria; la unica comparacion documentada es interna, contra el decodificador `lp8` sin extension de banda.

## Limitaciones y advertencias

- Informacion publica muy escasa: sin licencia declarada, sin pipeline, sin idiomas y sin detalles de entrenamiento, lo que impide evaluar su idoneidad para uso comercial.
- Riesgo de artefactos en la banda sintetizada: la extension de 8 a 24 kHz es generativa y puede introducir contenido espectral inexistente en la senal original.
- Dependencia de Griffin-Lim: la reconstruccion de fase iterativa (32 iteraciones) puede producir artefactos de fase y limita la calidad frente a vocoders neuronales dedicados.
- Evaluacion limitada: el A/B reportado usa solo 20 clips y 16 empates en la comparacion ciega, por lo que la evidencia estadistica es debil.
- Sin datos sobre sesgos, cobertura linguistica ni comportamiento fuera de los dominios SFX y habla evaluados.
- No es un modelo de proposito general: no genera texto, no soporta tool calling y requiere un front-end que produzca las representaciones latentes o Mel de entrada.
- Alucinacion en sentido estricto no aplica, pero si la generacion de detalle espectral no presente en la fuente, con el consiguiente riesgo de coloracion tonal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ModelsLab/midashenglm-gen-stereo-flowbwe
- Perfil del autor en Hugging Face: https://huggingface.co/ModelsLab
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
