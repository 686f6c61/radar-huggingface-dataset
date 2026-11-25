# sebekblessing/krea-2-turbo-gpu

## Resumen

Krea 2 Turbo es un modelo de generación de imágenes texto-a-imagen desarrollado por Krea, distribuido aquí en una versión empaquetada por el usuario sebekblessing para su ejecución en chips gráficos de teléfonos móviles. Esta variante concreta, alojada en el repositorio `sebekblessing/krea-2-turbo-gpu`, no es un modelo en formato convencional (safetensors o GGUF de llama.cpp), sino un paquete de pesos cuantizados en un formato propietario diseñado para el motor Anima GPU Engine, que los ejecuta mediante Vulkan o OpenCL sobre la GPU del dispositivo. El modelo base cuenta con aproximadamente 7.170 millones de parámetros y genera imágenes de 768x768 píxeles en 8 pasos de muestreo.

La relevancia de esta ficha reside en su carácter de despliegue en el borde: se trata de un modelo de difusión de tamaño medio optimizado para inferencia local en hardware móvil, algo poco habitual en el ecosistema open source. El paquete incluye el modelo de dibujo cuantizado a 4 bits (bloques de 256 elementos con escalas de dos niveles), un decodificador de imagen ligero (TAE, taew2_1) y un codificador de texto basado en la mitad lingüística de Qwen3-VL-4B en cuantización Q8_0, ejecutado en la CPU del teléfono mediante llama.cpp.

La licencia es la Krea 2 Community License, que no es una licencia open source estándar y establece restricciones de uso que deben consultarse antes de cualquier explotación comercial. El repositorio tiene un tamaño de 11,9 GB y registra 84 descargas en el momento de la consulta, lo que indica una adopción muy incipiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión texto-a-imagen (arquitectura exacta no disponible); codificador de texto basado en la mitad lingüística de Qwen3-VL-4B |
| Parametros totales | 7.172.193.868 (dato real, safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits (Q4K, bloques de 256 con escalas de dos niveles) para el modelo de dibujo; 8 bits (Q8_0) para el codificador de texto; decodificador TAE incluido |
| Idiomas soportados | No disponible |
| Licencia | Krea 2 Community License (license: other) |
| Formato de pesos | GGUF en layout propietario del motor Anima (no compatible con llama.cpp ni ComfyUI); incluye `krea_q4k.gguf`, `tae_w21.gguf`, `krea_reader.gguf` y `qwen_tokenizer.json` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo de difusión más allá de su naturaleza texto-a-imagen y de los 28 bloques que componen el fichero de dibujo cuantizado. El pipeline declarado en Hugging Face es `text-to-image`. El codificador de texto es la mitad lingüística de Qwen3-VL-4B, de la que el modelo de dibujo consume 12 capas; se ejecuta en cuantización Q8_0 sobre la CPU del teléfono mediante llama.cpp. El decodificador de imagen es TAE (taew2_1), un autoencoder ligero pensado para reducir el coste computacional de la decodificación latente.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal. El único detalle técnico de empaquetado es que el fichero de dibujo se generó con `build/pack_krea.py` usando `BITS=4 Q4K=1` y tamaño de bloque 256, y que el motor lee un bloque cada vez durante la generación.

## Capacidades

- Generación de imágenes a partir de texto en resolución de 768x768 píxeles.
- Muestreo en 8 pasos, lo que reduce el coste de inferencia frente a modelos que requieren decenas de pasos.
- Ejecución en la GPU del teléfono mediante Vulkan (cuando el chip lo soporta) o OpenCL en caso contrario.
- Codificación de prompts mediante un modelo lingüístico de 4B parámetros (Qwen3-VL-4B) ejecutado en CPU con llama.cpp.
- Decodificación de imagen mediante TAE, un decoder ligero que evita el coste de un VAE completo.
- Integración con la aplicación Anima mediante gestión de modelos y descarga automática de ficheros.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión de entrada ni audio.

## Casos de uso

- Generación de imágenes offline en móvil: la aplicación Anima descarga el paquete y genera imágenes de 768x768 sin conexión, usando la GPU del teléfono; adecuado para escenarios sin conectividad o con requisitos de privacidad.
- Prototipado rápido de conceptos visuales: con 8 pasos de muestreo y un decoder ligero, el ciclo de iteración es corto, lo que permite explorar variaciones de un prompt en el propio dispositivo.
- Aplicaciones de creación de contenido para redes sociales: generación de ilustraciones o fondos a resolución 768x768 directamente en el teléfono, sin subir prompts a servidores externos.
- Demostraciones y educación: permite mostrar el funcionamiento de un modelo de difusión en hardware de consumo, con un codificador de texto real (Qwen3-VL-4B) y un pipeline completo en el dispositivo.
- Integración en apps Android mediante el motor Anima: los desarrolladores pueden empaquetar el modelo y distribuirlo a través de la gestión de modelos de la app, con descarga bajo demanda.
- Investigación sobre cuantización extrema: el formato Q4K con escalas de dos niveles y lectura bloque a bloque sirve como caso de estudio para técnicas de compresión de modelos de difusión en memoria limitada.
- Generación de imágenes en entornos con GPU integrada: el soporte de OpenCL amplía la compatibilidad a chips sin Vulkan, útil en dispositivos de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 11,9 GB en total, pero la inferencia carga el modelo de dibujo cuantizado a 4 bits (tamaño exacto del fichero no disponible) más el codificador de texto Q8_0 (aproximadamente 4 GB para un modelo de 4B en 8 bits) y el decoder TAE. La memoria real necesaria en el dispositivo no está documentada.
- GPU recomendadas: chips gráficos de teléfonos móviles con soporte Vulkan o, en su defecto, OpenCL. No se especifican modelos concretos de SoC.
- Compatibilidad con GPU de consumo para escritorio: no está prevista; el formato es propietario del motor Anima y no es compatible con llama.cpp ni ComfyUI.
- Opciones de despliegue: exclusivamente la aplicación Anima con el motor Anima GPU Engine. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni ComfyUI.
- Latencia y throughput: no disponibles. La model card solo indica que genera imágenes de 768x768 en 8 pasos, sin cifras de tiempo.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (difusión texto-a-imagen optimizada para GPU móvil) dentro de la documentación proporcionada. Los datos de benchmarks y de rendimiento de alternativas no están disponibles, por lo que no es posible establecer una comparación rigurosa.

| Modelo | Parámetros | Contexto | Licencia | Formato | Despliegue móvil |
|---|---|---|---|---|---|
| Krea 2 Turbo (este paquete) | 7.172 M | No disponible | Krea 2 Community License | GGUF propietario (Anima) | Sí (Vulkan/OpenCL) |
| Alternativas | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- La licencia Krea 2 Community License no es una licencia open source estándar; cualquier uso, incluido el comercial, debe cumplirla junto con la Política de Uso Aceptable de Krea. Es imprescindible revisar el PDF de licencia antes de desplegar.
- Este paquete son ficheros modificados creados por un tercero (sebekblessing) a partir de Krea 2 Turbo; no es una versión oficial de Krea y el autor original no lo respalda.
- El formato de pesos es propietario del motor Anima: no se puede cargar en llama.cpp, ComfyUI ni en pipelines estándar de difusión, lo que limita la portabilidad.
- No se documentan los idiomas soportados por el codificador de texto ni por el modelo; el rendimiento multilingüe es desconocido.
- No hay información sobre sesgos, tasa de alucinación visual ni calidad de generación en dominios específicos.
- La memoria necesaria en el dispositivo no está cuantificada; en teléfonos con poca RAM el codificador Q8_0 de 4B puede ser problemático.
- El número de descargas (84) y de likes (0) es muy bajo, lo que sugiere poca validación comunitaria del paquete.
- No se especifican requisitos mínimos de versión de Vulkan/OpenCL ni de sistema operativo Android.
- La fecha de creación del repositorio (2026-11-23) es posterior a la fecha actual de referencia habitual; conviene verificar la vigencia de los enlaces y del proyecto Anima.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sebekblessing/krea-2-turbo-gpu
- Modelo base: https://huggingface.co/krea/Krea-2-Turbo
- Licencia (PDF): https://huggingface.co/sebekblessing/krea-2-turbo-gpu/blob/main/LICENSE.pdf
- Política de uso aceptable de Krea: https://www.krea.ai/krea-2-use-policy
- Motor Anima GPU Engine: https://github.com/adiirfan/anima-gpu-engine
