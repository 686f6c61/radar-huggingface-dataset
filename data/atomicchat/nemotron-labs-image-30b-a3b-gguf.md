# AtomicChat/Nemotron-Labs-Image-30B-A3B-GGUF

## Resumen

Nemotron-Labs-Image-30B-A3B es un modelo de generación de imágenes de NVIDIA con arquitectura autorregresiva y mezcla de expertos (MoE), que produce imágenes de 1024 × 1024 píxeles generando tokens visuales de un codebook de 196.560 entradas. Este repositorio concreto, publicado por AtomicChat, no contiene el modelo original, sino su conversión a formato GGUF junto con 12 variantes cuantizadas y una conversión de referencia en BF16, lo que permite ejecutar la generación de imágenes sobre llama.cpp en lugar de depender del stack de PyTorch y Transformers de NVIDIA.

El interés de esta ficha reside en que la cuantización reduce el peso del modelo desde los 65,3 GB del BF16 hasta los 18,8 GB de Q2_K, haciendo viable la inferencia en una única GPU A100 de 40 GB para todas las variantes, con velocidades medidas de entre 67 y 121 tokens por segundo. Es, por tanto, una vía práctica para desplegar generación de imágenes autorregresiva de gran tamaño en hardware de un solo acelerador.

La relevancia es doble: por un lado, demuestra que los modelos de imagen autorregresivos basados en MoE pueden cuantizarse con llama.cpp conservando un vocabulario visual virtual de gran tamaño; por otro, ofrece un CLI reproducible que orquesta la descarga, la generación de tokens visuales y la reconstrucción del PNG final mediante el decodificador original de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo con mezcla de expertos (MoE) para generación de imágenes |
| Parametros totales | 32.634.904.896 (32,63 B) |
| Parametros activos | No disponible (la model card no desglosa los expertos activos por token) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_1, Q4_0, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | No disponible (el pipeline es text-to-image; los prompts admiten texto libre) |
| Licencia | nvidia-license (other) |
| Formato de pesos | GGUF (más conversión de referencia BF16) |

Datos adicionales: vocabulario de 327.680 entradas, de las cuales 196.560 son tokens del codebook visual con IDs preservados; tamaño del repositorio de 355,5 GB; validación de generación a 1024 × 1024.

## Arquitectura y entrenamiento

El modelo base es un generador de imágenes autorregresivo: en lugar de un diffusion model, predice secuencias de tokens visuales extraídos de un codebook de 196.560 entradas, que después se reconstruyen como imagen mediante un decodificador visual propietario de NVIDIA. La arquitectura combina un transformer con capas de mezcla de expertos, lo que explica el desajuste entre los 32,63 B de parámetros totales y un coste de cómputo por token presumiblemente menor (el sufijo A3B sugiere del orden de 3 B de parámetros activos, aunque la model card no lo confirma de forma explícita).

La conversión de AtomicChat introduce una adaptación del convertidor de llama.cpp para preservar el vocabulario virtual de tokens visuales, algo que el convertidor estándar no soporta de serie. Las 13 variantes pasaron validación estructural y pruebas de humo de generación de imágenes de extremo a extremo. No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; tampoco se documentan innovaciones de decodificación especulativa o atención lineal.

## Capacidades

- Generación de imágenes texto-a-imagen a resolución de 1024 × 1024 píxeles.
- Generación autorregresiva de tokens visuales sobre un codebook de 196.560 entradas con IDs preservados tras la cuantización.
- Control de semilla, temperatura de muestreo y dimensiones de salida mediante el CLI de AtomicChat.
- Inferencia acelerada por CUDA a través de llama.cpp (llama-server).
- Emisión de artefactos de depuración: tokens crudos en JSON, métricas de generación y decodificación, y log del servidor.
- Compatibilidad con endpoints (tag `endpoints_compatible` en el repositorio).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo thinking.

## Casos de uso

- Prototipado rápido de generación de imágenes en local: con la variante Q4_0 (18,8 GB) el modelo cabe en una A100 40 GB y produce una imagen de 1024 × 1024 en unos 35 segundos, lo que permite iterar sobre prompts sin depender de APIs externas.
- Investigación sobre modelos autorregresivos de imagen: el repositorio conserva los tokens visuales crudos en `.tokens.json`, lo que facilita analizar la distribución de tokens generados, comparar variantes de cuantización y estudiar el efecto del BPW efectivo en la calidad visual.
- Evaluación de cuantizaciones en pipelines de imagen: al ofrecer 13 variantes con tamaños y velocidades medidas, sirve para trazar curvas de compromiso entre VRAM, throughput y fidelidad de reconstrucción antes de fijar una variante en producción.
- Despliegue en infraestructura con llama.cpp: al ejecutarse sobre llama-server, puede integrarse en servicios ya estandarizados sobre este runtime, reutilizando la gestión de procesos, logs y métricas existente.
- Generación de material gráfico por lotes con semilla fija: el control explícito de `--seed` y `--temperature` permite reproducir exactamente una imagen para auditoría o comparación A/B entre cuantizaciones.
- Docencia y demostraciones de MoE en generación visual: el modelo ilustra cómo un transformer MoE de 32,63 B de parámetros puede operar como generador de imágenes dentro de las restricciones de memoria de una GPU de 40 GB.
- Automatización de ilustraciones conceptuales en flujos internos: prompts descriptivos en texto libre generan imágenes de 1024 × 1024 listas para maquetación, siempre que la licencia NVIDIA lo permita en el contexto de uso concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de imagen (FID, CLIP score, etc.) en la información disponible. Los únicos datos medidos son de rendimiento de inferencia sobre una NVIDIA A100 PCIe 40 GB:

| Cuantizacion | Tamano (GB) | BPW efectivo | Tokens/s | Tiempo de generacion (s) | Validacion |
|---|---:|---:|---:|---:|---|
| BF16 | 65,300 | 16,0043 | 67,51 | 62,26 | PASS |
| Q8_0 | 34,714 | 8,5064 | 99,54 | 42,34 | PASS |
| Q6_K | 34,636 | 8,4874 | 102,67 | 40,96 | PASS |
| Q5_K_M | 27,003 | 6,6163 | 114,86 | 36,65 | PASS |
| Q4_K_M | 25,445 | 6,2343 | 115,03 | 36,60 | PASS |
| Q5_K_S | 24,773 | 6,0696 | 118,63 | 35,47 | PASS |
| Q4_K_S | 22,850 | 5,5983 | 118,66 | 35,48 | PASS |
| Q5_0 | 22,809 | 5,5882 | 118,53 | 35,50 | PASS |
| Q4_1 | 20,825 | 5,1018 | 121,75 | 34,55 | PASS |
| Q3_K_M | 20,713 | 5,0744 | 117,53 | 35,83 | PASS |
| Q4_0 | 18,841 | 4,6154 | 118,75 | 35,43 | PASS |
| Q3_K_S | 18,798 | 4,6050 | 119,12 | 35,32 | PASS |
| Q2_K | 18,773 | 4,5987 | 119,51 | 35,22 | PASS |

Los tamanos estan en GB decimales. El BPW efectivo refleja la distribución real de precisión de los tensores. Las cifras corresponden a pruebas funcionales limitadas, no a un benchmark exhaustivo de calidad de imagen.

## Requisitos de hardware

- VRAM estimada: todas las variantes cuantizadas han sido validadas en una única NVIDIA A100 de 40 GB; la variante Q2_K ocupa 18,8 GB de pesos, por lo que el margen para contexto y decodificador es amplio en 40 GB.
- GPU recomendadas: NVIDIA A100 40 GB como referencia validada (con `CUDA_ARCH=80` en el script de compilación). No se documentan pruebas en H100, RTX 4090 ni otras GPU consumer.
- Cabe en GPU consumer: no confirmado. Las variantes de 18-20 GB podrían ajustarse en tarjetas de 24 GB, pero la información disponible no incluye validación en ese hardware.
- Despliegue: llama.cpp con soporte CUDA (build fijado por `scripts/setup.sh`), servido mediante `llama-server`; el CLI de AtomicChat orquesta la generación y el decodificador de NVIDIA.
- Entorno verificado: Python 3.12, PyTorch 2.11.0+cu128, CUDA 12.8, Transformers 5.23.0, Hugging Face Hub 2.4.0, Pillow 12.3.0, Safetensors 0.8.0, driver NVIDIA 570.195.03, Linux x86_64.
- Throughput y latencia medidos: entre 67,51 tokens/s (BF16) y 121,75 tokens/s (Q4_1); tiempos de generación de 62,26 s (BF16) a 34,55 s (Q4_1) por imagen de 1024 × 1024.
- Requisitos de sistema: el CLI exige CUDA Toolkit con `nvcc`, Git, CMake y compilador C/C++, además de RAM y disco suficientes (el repositorio completo ocupa 355,5 GB).

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. La comparación se limita al propio modelo base frente a su conversión GGUF:

| Modelo | Parametros | Formato | Runtime | Licencia |
|---|---:|---|---|---|
| nvidia/Nemotron-Labs-Image-30B-A3B | 32,63 B | safetensors (BF16) | PyTorch/Transformers | nvidia-license |
| AtomicChat/Nemotron-Labs-Image-30B-A3B-GGUF (Q4_0) | 32,63 B | GGUF 4,62 BPW | llama.cpp | nvidia-license |
| AtomicChat/Nemotron-Labs-Image-30B-A3B-GGUF (Q2_K) | 32,63 B | GGUF 4,60 BPW | llama.cpp | nvidia-license |

No se conocen en la información disponible alternativas de generación de imágenes autorregresivas con MoE de tamaño comparable para establecer una comparativa de rendimiento.

## Limitaciones y advertencias

- Licencia NVIDIA: el uso comercial está sujeto a los términos de `nvidia-license`, que no se detallan en la model card; es imprescindible revisar el archivo LICENSE antes de cualquier despliegue en producción.
- Dependencia de código remoto: el CLI descarga y ejecuta tokenizador y decodificador propietarios de NVIDIA con `--trust-remote-code`; la propia model card recomienda revisar el código fuente antes de habilitarlo.
- Calidad de cuantización no evaluada: las sugerencias de variantes (Q8_0, Q5_0, Q4_1, Q4_0) se basan en pruebas funcionales limitadas y rendimiento medido, no en un benchmark de calidad de imagen; no hay garantía de que Q2_K o Q3_K_S preserven fidelidad visual.
- Alucinación visual: al ser un modelo autorregresivo de tokens, puede producir imágenes incoherentes, artefactos o fallos de composición, especialmente en prompts ambiguos o con muchos objetos.
- Idiomas: no se documenta el comportamiento multilingüe de los prompts; la validación se realizó con prompts en inglés.
- Contexto: no se publica la longitud de contexto, lo que impide estimar cuántos tokens visuales caben por generación más allá de la resolución validada de 1024 × 1024.
- Sesgos: no se documentan sesgos conocidos ni composición del dataset de entrenamiento, por lo que no es posible evaluar sesgos demográficos o culturales.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, con fecha de creación y actualización muy próximas; se trata de una conversión reciente sin validación comunitaria.
- Requisitos estrictos de entorno: Linux x86_64, CUDA Toolkit con `nvcc` y compilación de llama.cpp; no hay soporte documentado para macOS, Windows ni CPU.

## Enlaces

- Repositorio GGUF: https://huggingface.co/AtomicChat/Nemotron-Labs-Image-30B-A3B-GGUF
- Modelo base: https://huggingface.co/nvidia/Nemotron-Labs-Image-30B-A3B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- No se han encontrado en la información disponible papers, blogs, demos ni repositorios adicionales.
