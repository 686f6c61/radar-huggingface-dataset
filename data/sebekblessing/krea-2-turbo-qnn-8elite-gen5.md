# sebekblessing/krea-2-turbo-qnn-8elite-gen5

## Resumen

Krea 2 Turbo para Snapdragon 8 Elite Gen 5 es una compilación del modelo de difusión texto-a-imagen Krea 2 Turbo, desarrollado originalmente por Krea, adaptada por el usuario sebekblessing para ejecutarse sobre la NPU Hexagon v81 del chip Qualcomm Snapdragon 8 Elite Gen 5 mediante binarios de contexto QNN (Qualcomm Neural Network). El resultado son ficheros que generan imágenes de 768x768 píxeles a partir de texto en 8 pasos de muestreo, pensados para integrarse en la aplicación Android Anima.

No se trata de un modelo nuevo entrenado desde cero, sino de un artefacto de despliegue: los pesos del modelo base se han convertido y empaquetado para el hardware móvil concreto. El repositorio ocupa 11,9 GB e incluye el codificador de texto (la mitad lingüística de Qwen3-VL-4B cuantizada a 8 bits), 28 bloques de dibujo con pesos a 4 bits, el decodificador de imagen taew2_1, tablas de modulación por paso y el tokenizador.

La relevancia de esta ficha es acotada pero concreta: muestra cómo un modelo de difusión de clase servidor puede llevarse a inferencia local en un SoC móvil de gama alta, con un pipeline de conversión reproducible (QAIRT 2.50) y una licencia comunitaria que restringe el uso. No hay información pública sobre parámetros totales, contexto o benchmarks en la documentación disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión texto-a-imagen (base Krea 2 Turbo) con codificador de texto derivado de Qwen3-VL-4B y decodificador de imagen taew2_1; compilado a binarios de contexto QNN para Hexagon v81 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Codificador de texto a 8 bits (Q8); bloques de dibujo a 4 bits; tablas de modulación en float32 |
| Idiomas soportados | no disponible (el codificador de texto deriva de Qwen3-VL-4B, multilingüe, pero la model card no lo declara) |
| Licencia | Krea 2 Community License Agreement (license: other) |
| Formato de pesos | Binarios QNN (.bin), tabla de palabras en .raw (8 bits), tokenizador en JSON; no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base Krea 2 Turbo es un modelo de difusión texto-a-imagen que, según la documentación de esta compilación, se ejecuta en 8 pasos fijos de muestreo para producir imágenes de 768x768. La adaptación separa el pipeline en tres componentes empaquetados: el lector de prompts (codificador de texto basado en la mitad lingüística de Qwen3-VL-4B, en 8 bits y dividido en tres ficheros `text0.bin`–`text2.bin`), una etapa de fusión de texto (`fuse.bin`) que toma 12 capas del lector y las proyecta en filas de prompt, y 28 bloques de dibujo (`b0.bin`–`b27.bin`) con pesos a 4 bits que se cargan de uno en uno para limitar el uso de memoria. El decodificador de imagen es `taew2_1` (`dec.bin`).

El proceso de conversión se realizó con QAIRT 2.50 y los scripts quedan incluidos en el repositorio (`krea_model.py`, `export_krea.py`, `build_krea.sh`, `make_tables.py`). Las tablas `mods.f32` y `sigmas.txt` contienen la modulación por paso y los niveles de ruido fijos para los 8 pasos. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base; la model card de esta adaptación no los detalla.

## Capacidades

- Generación de imágenes texto-a-imagen a 768x768 píxeles en 8 pasos de muestreo.
- Lectura de prompts mediante un codificador de texto de 8 bits derivado de Qwen3-VL-4B, con fusión de 12 capas intermedias.
- Carga secuencial de bloques (uno a la vez), diseñada para ajustarse a la memoria disponible en el SoC móvil.
- Ejecución exclusiva en la NPU Hexagon v81 del Snapdragon 8 Elite Gen 5 mediante binarios QNN.
- Integración con la aplicación Android Anima, que consume `manifest.json` como lista de descarga.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo thinking.

## Casos de uso

- Generación de imágenes en dispositivos móviles sin conexión: la compilación QNN permite ejecutar el pipeline completo en la NPU del Snapdragon 8 Elite Gen 5, de modo que la generación de 768x768 en 8 pasos ocurre localmente, sin enviar prompts a un servidor.
- Prototipado de aplicaciones Android con IA generativa: la app Anima y el `manifest.json` sirven como referencia para integrar un modelo de difusión cuantizado en un APK, gestionando la descarga y la carga por bloques.
- Investigación sobre despliegue en NPU móvil: los scripts de conversión con QAIRT 2.50 y el empaquetado por chip documentan un pipeline reproducible para llevar un modelo de difusión a Hexagon v81.
- Evaluación de cuantización agresiva: la combinación de codificador a 8 bits y bloques a 4 bits permite estudiar el equilibrio entre calidad de imagen y huella de memoria en hardware móvil.
- Demostraciones de generación de imágenes en ferias o entornos sin red: al no requerir servidor, el modelo puede ejecutarse en un teléfono de demostración con el chip objetivo.
- Benchmarking de latencia en SoC: permite medir tiempos por paso y consumo energético de un modelo de difusión en la NPU, comparando con ejecuciones en CPU o GPU móvil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- NPU Qualcomm Hexagon v81, exclusivamente en el Snapdragon 8 Elite Gen 5. Los binarios QNN no son portables a otros chips.
- Repositorio de 11,9 GB; el almacenamiento del dispositivo debe acomodar la descarga completa y los ficheros temporales de carga por bloques.
- VRAM: no aplica; la memoria relevante es la RAM compartida del SoC. No se publica una cifra de memoria pico.
- GPU de escritorio: no soportado. No hay pesos en safetensors ni GGUF para vLLM, llama.cpp, Ollama o TGI.
- Despliegue: aplicación Android Anima con los binarios QNN y el `manifest.json` del repositorio.
- Latencia y throughput: no disponibles; la model card solo indica 8 pasos para 768x768.

## Comparativa con modelos similares

| Modelo | Tipo | Resolucion | Pasos | Hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Krea 2 Turbo QNN 8 Elite Gen 5 (esta ficha) | Difusion texto-a-imagen compilada a QNN | 768x768 | 8 | Snapdragon 8 Elite Gen 5 (Hexagon v81) | Krea 2 Community License | Hugging Face, 0 descargas |
| krea/Krea-2-Turbo (modelo base) | Difusion texto-a-imagen | no disponible | no disponible | GPU de servidor o escritorio | Krea 2 Community License | Hugging Face |
| Alternativas moviles QNN de difusion | no disponible | no disponible | no disponible | Snapdragon | no disponible | no disponible |

No se dispone de datos de rendimiento ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Dependencia total del hardware: solo funciona en el Snapdragon 8 Elite Gen 5; no hay fallback a CPU, GPU ni a otros SoC.
- No es una versión oficial de Krea: son ficheros modificados por un tercero, y cualquier uso debe cumplir la Krea 2 Community License y la Acceptable Use Policy de Krea.
- Restricciones de licencia para uso comercial: la licencia es "other" (Krea 2 Community License); hay que revisar `LICENSE.pdf` y `NOTICE` antes de cualquier despliegue comercial.
- Sin datos de benchmarks, parámetros totales, contexto ni idiomas declarados; la evaluación de calidad queda a cargo del usuario.
- Riesgo de alucinación visual y sesgos del modelo base: no documentados en esta adaptación.
- La cuantización a 4 bits de los bloques de dibujo puede degradar la fidelidad de la imagen frente al modelo base; no se publica una comparación.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.
- Fechas de creación y actualización (2026-11-23) posteriores a la información disponible; conviene verificar la vigencia de los enlaces.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sebekblessing/krea-2-turbo-qnn-8elite-gen5
- Modelo base: https://huggingface.co/krea/Krea-2-Turbo
- Licencia (PDF): https://huggingface.co/sebekblessing/krea-2-turbo-qnn-8elite-gen5/blob/main/LICENSE.pdf
- Política de uso aceptable de Krea: https://www.krea.ai/krea-2-use-policy
- Aplicación Anima para Android: https://github.com/adiirfan/anima-android
