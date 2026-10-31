# scragnog/HeartMuLa-GGUF

## Resumen

HeartMuLa-GGUF es una conversión a formato GGUF de los componentes del sistema de generación musical HeartMuLa, publicada por el usuario scragnog para su uso en el proyecto HOT-Step, que implementa inferencia nativa en C++/GGML sin dependencia de Python en tiempo de ejecución. El modelo original fue desarrollado por el HeartMuLa Team y se compone de un par de modelos de lenguaje de 3B parámetros (global y local) junto con el códec de audio HeartCodec, que convierte texto con etiquetas musicales y letras en audio de hasta 240 segundos.

El repositorio no contiene un modelo nuevo, sino conversiones cuantizadas divididas por componentes: dos variantes de LM (global y local), el códec de flujo, el decodificador de forma de onda, el módulo RVQ y el tokenizador. Ofrece F16 y 18 niveles de cuantización por componente, incluyendo formatos modernos como MXFP4 y NVFP4. Con 1.487 millones de parámetros declarados en safetensors para los componentes convertidos y un tamaño de repo de 150,3 GB, es relevante para desarrolladores que quieren generar música localmente en hardware de consumo sin despliegues en la nube.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LM global + LM local (par de modelos de lenguaje) con códec de audio HeartCodec (flow + decodificador escalar + RVQ); detalles del transformer no disponibles |
| Parámetros totales | 1.487.183.360 (dato de safetensors del repo); el modelo base se denomina HeartMuLa-oss-3B |
| Parámetros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (duración de audio soportada: hasta 240 segundos) |
| Tipos de cuantización | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS, IQ3_XXS, IQ2_XS, IQ2_XXS, IQ1_M, IQ1_S, MXFP4, NVFP4 (LM global y local); F16/Q8_0 (codec flow); F16 (decodificador escalar); F32 (RVQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (conversión desde safetensors originales) |

## Arquitectura y entrenamiento

El sistema HeartMuLa sigue una arquitectura de dos etapas típica de generación musical neuronal: un tokenizador de audio (HeartCodec) que comprime la señal en tokens discretos mediante un módulo de flujo (flow), un decodificador escalar para la reconstrucción de forma de onda y un módulo RVQ (residual vector quantization) que se comparte entre generación y codificación; y un par de modelos de lenguaje (global y local) que generan esos tokens a partir de etiquetas musicales y letras. Los pesos LM se publican en variantes base (HeartMuLa-oss-3B), una variante "happy-new-year" y una variante ajustada con aprendizaje por refuerzo (HeartMuLa-RL-oss-3B-20260123). La cuantización de los pesos LM en formatos K/IQ/FP4 utiliza una matriz de importancia específica por variante, lo que mejora la calidad en niveles bajos de precisión.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni los procedimientos exactos de RLHF/DPO empleados en la variante RL; el repositorio original remite a heartlib (GitHub) y a la configuración de generación en HeartMuLaGen para más detalles técnicos.

## Capacidades

- Generación de música a partir de etiquetas musicales concisas y letras de canciones (text-to-audio), con duraciones de hasta 240 segundos.
- Tres variantes de pesos LM: base, "happy-new-year" y una variante RL, seleccionables en la inferencia.
- Inferencia nativa en C++/GGML (proyecto HOT-Step) sin necesidad de Python en tiempo de ejecución; Python solo se usa para la conversión.
- Cuantización independiente de las partes global y local del LM (pueden diferir en precisión, siempre que la variante coincida).
- Codificación de audio a tokens mediante el pack opcional de codificadores (muencoder, wavlm, whisper, query), no necesario para generación de texto a música.
- Soporte de tool calling, agentes o capacidades de razonamiento: no disponible (no aplica, es un modelo de generación de audio).

## Casos de uso

- Generación local de música con letras: el usuario introduce etiquetas musicales concisas (género, tempo, instrumentación) y una letra, y el modelo produce una pista de hasta 240 segundos sin depender de servicios en la nube.
- Despliegue en hardware de consumo: gracias a los niveles IQ1_S–Q4_K_M, los LM de 3B pueden ejecutarse en GPUs de consumo con VRAM limitada, algo inviable con los pesos F16 completos del repo original.
- Integración en aplicaciones C++ nativas: el formato GGUF y la inferencia GGML permiten embeber la generación musical en aplicaciones de escritorio o plugins de audio sin runtime de Python.
- Experimentación con cuantización extrema: los 18 niveles de cuantización con matrices de importancia por variante son útiles para investigar el impacto de la precisión en la calidad del audio generado.
- Producción de variantes estilísticas: la variante "happy-new-year" permite generar contenido musical temático festivo sin reentrenamiento.
- Prototipado rápido de música para videojuegos o contenido multimedia: la generación por etiquetas permite iterar bocetos musicales de hasta 4 minutos de forma automatizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se afirma ningún ranking de calidad de audio entre variantes, y que la validación se limitó a renderizados de prueba con semilla fija (con recorte de audio detectado en IQ1_S).

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta. El repo completo pesa 150,3 GB (incluye todos los componentes, variantes y cuantizaciones), pero una instalación de generación típica (un par global+local Q8_0, codec flow Q8_0, decodificador escalar F16, RVQ F32 y tokenizador) ocupa sustancialmente menos; con cuantizaciones IQ1_S/IQ2 los LM de 3B caben con holgura en GPUs de 8-12 GB, aunque esto es una estimación no confirmada por el autor.
- GPUs recomendadas: no disponible. Al ser inferencia GGML, cualquier GPU compatible con CUDA, Metal o Vulkan debería funcionar; no se citan modelos concretos.
- Consumer GPUs: los niveles de cuantización bajos (Q2_K, IQ2_XS, IQ1_S/M) están diseñados explícitamente para reducir memoria, lo que sugiere compatibilidad con GPUs de consumo, aunque el autor advierte que IQ1_S produjo recorte de audio en una validación.
- Despliegue: el objetivo declarado es la inferencia nativa C++/GGML en HOT-Step (descarga de componentes vía el Model Manager de HOT-Step, pestaña HeartMuLa). No se menciona soporte para llama.cpp genérico, Ollama, vLLM o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Formato | Licencia | Contexto de audio |
|---|---|---|---|---|---|
| HeartMuLa-GGUF (este repo) | ~1,5B (componentes convertidos; LM base 3B) | Texto a música | GGUF (19 precisiones) | Apache 2.0 | 240 s |
| YuE (generación de música con letras) | no disponible en esta ficha | Texto a música con letras | safetensors | no disponible | no disponible |
| MusicGen (Meta) | 300M-3,4B según variante | Texto a música | safetensors | CC-BY-NC (pesos) | ~30 s |

Nota: la comparativa es orientativa; los datos de YuE y MusicGen provienen de conocimiento general y no de la información proporcionada en este repositorio. La ventaja diferencial de HeartMuLa-GGUF es la inferencia nativa GGUF/GGML y las duraciones de hasta 240 segundos.

## Limitaciones y advertencias

- La cuantización extrema degrada la calidad: IQ1_S produjo recorte (clipping) en un renderizado de validación con semilla fija; el autor lo marca como opción experimental de memoria.
- No se afirma ninguna jerarquía de calidad de audio entre las variantes (base, happy-new-year, RL); el usuario debe evaluarlas por sí mismo.
- La prosa larga en el campo de etiquetas musicales produce salidas pobres incluso en el modelo original; se recomiendan etiquetas concisas.
- El decodificador escalar solo existe en F16 (una copia Q8_0 no reduciría tamaño) y el RVQ solo en F32, lo que fija una base de memoria no reducible.
- El pack de codificadores opcional (para codificar audio) no incluye versiones Q8_0 ni un codificador escalar; están pendientes de conversión y verificación.
- Idiomas soportados, sesgos del modelo y riesgo de alucinación (en este caso, artefactos de audio): no disponibles o no documentados en la model card.
- La licencia Apache 2.0 de los repos originales debe mantenerse junto con la atribución al redistribuir los archivos convertidos.
- Las conversiones GGUF cambian la disposición de tensores y reducen la precisión de almacenamiento, por lo que los resultados pueden diferir de la implementación original en Python.

## Enlaces

- Repositorio GGUF: https://huggingface.co/scragnog/HeartMuLa-GGUF
- HeartMuLa-oss-3B (base): https://huggingface.co/HeartMuLa/HeartMuLa-oss-3B
- HeartMuLa-oss-3B-happy-new-year: https://huggingface.co/HeartMuLa/HeartMuLa-oss-3B-happy-new-year
- HeartMuLa-RL-oss-3B-20260123: https://huggingface.co/HeartMuLa/HeartMuLa-RL-oss-3B-20260123
- HeartCodec-oss-20260123: https://huggingface.co/HeartMuLa/HeartCodec-oss-20260123
- Tokenizador y configuración de generación (HeartMuLaGen): https://huggingface.co/HeartMuLa/HeartMuLaGen
- Implementación original (heartlib, GitHub): https://github.com/HeartMuLa/heartlib
