# sebekblessing/moss-gpu

## Resumen

MOSS-Image para chips gráficos de teléfono es una distribución empaquetada del modelo de generación de imágenes OpenMOSS-Team/MOSS-Image, publicada por el usuario sebekblessing para su uso dentro de la aplicación Android Anima. No se trata de un modelo entrenado desde cero, sino de una conversión de los pesos originales a formato GGUF con un diseño de memoria que permite leer el modelo por bloques durante la inferencia, de modo que no necesita caber completo en la memoria del dispositivo. Está pensada para teléfonos que no disponen de un chip Snapdragon AI compatible, que usan en su lugar las variantes `moss-qnn-8elite` o `moss-qnn-8elite-gen5`.

El paquete incluye cuatro artefactos principales: el modelo de difusión de imágenes en 8 bits (`moss_q8.gguf`), un decodificador de imagen pequeño basado en taef2 de madebyollin (`tae_f2.gguf`), un lector de prompts basado en Qwen 3.5 9B cuantizado a 4 bits (`moss_reader.gguf`) y los ficheros de configuración del sampler (`sigmas.txt`, `sampler.txt`). El modelo base declara 5.238.845.440 parámetros y el repositorio ocupa 10,6 GB.

La relevancia de esta ficha es limitada pero concreta: documenta un caso de despliegue de un modelo de difusión de ~5.200 millones de parámetros en hardware móvil mediante cuantización GGUF y carga por bloques, con licencia Apache 2.0 y soporte de OpenCL. No hay información publicada sobre calidad, benchmarks ni idiomas soportados más allá de lo que declara la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion text-to-image (base OpenMOSS-Team/MOSS-Image); decodificador taef2; lector de prompts Qwen 3.5 9B |
| Parametros totales | 5.238.845.440 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits para el modelo de difusion (`moss_q8.gguf`); Q4_K_M con importance matrix para el lector de prompts |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (modelo y add-on de 8 pasos); Qwen 3.5 Apache 2.0; taef2 MIT |
| Formato de pesos | GGUF (layout propio del motor de la app), mas `sigmas.txt`, `sampler.txt` y `manifest.json` |

## Arquitectura y entrenamiento

El repositorio no contiene un entrenamiento propio: es una conversión y empaquetado del modelo OpenMOSS-Team/MOSS-Image, al que se le ha fusionado un add-on de 8 pasos con peso 0,7. El pipeline declarado en Hugging Face es text-to-image. El modelo de difusión se distribuye en 8 bits y en el layout interno del motor de la aplicación Anima, con lectura bloque a bloque durante la generación, lo que evita la necesidad de mantener todos los pesos residentes en memoria.

El sistema completo consta de tres piezas: el modelo de difusión MOSS-Image (5.238.845.440 parámetros), un decodificador de imagen ligero basado en taef2 (Flux 2, de madebyollin) y un lector de prompts Qwen 3.5 9B cuantizado a Q4_K_M con importance matrix y partes no utilizadas eliminadas. Los scripts `build/pack_moss.py` y `build/pack_tae.py` documentan el proceso de empaquetado. No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) mediante difusión.
- Muestreo en 8 pasos gracias al add-on fusionado con peso 0,7, con niveles de ruido definidos en `sigmas.txt` y sampler propio en `sampler.txt`.
- Decodificación de imagen mediante taef2, un decodificador pequeño derivado de Flux 2.
- Procesamiento de prompts en lenguaje natural mediante un lector Qwen 3.5 9B cuantizado a 4 bits.
- Ejecución en GPU móvil mediante OpenCL, con carga por bloques que reduce el requisito de memoria.
- Integración con la app Android Anima a través de `manifest.json`, que lista nombres, tamaños y hashes SHA-256 de los ficheros.
- Tool calling, agentes, visión, audio y modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Generación de imágenes en teléfonos Android sin chip Snapdragon AI: la app Anima descarga estos ficheros y ejecuta el modelo sobre la GPU del teléfono mediante OpenCL, cubriendo el segmento de dispositivos que no pueden usar las variantes `moss-qnn-8elite`.
- Despliegue en dispositivos con memoria limitada: la lectura bloque a bloque de `moss_q8.gguf` permite ejecutar un modelo de más de 5.200 millones de parámetros sin que quepa completo en RAM, algo crítico en móviles de gama media.
- Generación rápida de imágenes en 8 pasos: el add-on fusionado reduce el número de evaluaciones del modelo, lo que encaja con la latencia exigida en una app interactiva de dibujo o creación de imágenes.
- Procesamiento local de prompts: el lector Qwen 3.5 9B en Q4_K_M permite interpretar instrucciones de texto en el propio dispositivo sin depender de un servicio en la nube.
- Prototipado de pipelines text-to-image en GGUF: los scripts `pack_moss.py` y `pack_tae.py` sirven como referencia para convertir otros modelos de difusión al layout del motor y validar el flujo de empaquetado.
- Distribución controlada de artefactos: `manifest.json` con SHA-256 facilita la verificación de integridad en la descarga de modelos desde la app, útil en entornos con requisitos de reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el diseño de lectura por bloques reduce el requisito, pero no se publica una cifra concreta.
- GPU recomendadas: GPU móvil con soporte OpenCL; para el chip Snapdragon 8 Elite y 8 Elite Gen 5 el autor remite a las variantes `moss-qnn-8elite` y `moss-qnn-8elite-gen5`, que son más rápidas.
- Cabe en GPU consumer: el objetivo declarado es hardware móvil, no GPU de escritorio; no se documenta compatibilidad con A100, H100 o RTX 4090.
- Opciones de despliegue: motor propio de la app Anima sobre OpenCL; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| sebekblessing/moss-gpu | 5.238.845.440 | no disponible | GGUF (layout propio) | Apache 2.0 | Difusion text-to-image en GPU movil via OpenCL |
| sebekblessing/moss-qnn-8elite | no disponible | no disponible | no disponible | Apache 2.0 (segun repo base) | Misma base MOSS-Image para chip Snapdragon 8 Elite |
| sebekblessing/moss-qnn-8elite-gen5 | no disponible | no disponible | no disponible | Apache 2.0 (segun repo base) | Misma base MOSS-Image para Snapdragon 8 Elite Gen 5 |
| OpenMOSS-Team/MOSS-Image | no disponible | no disponible | no disponible | Apache 2.0 | Modelo base original de difusion text-to-image |

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia pública de validación por terceros.
- No se publican benchmarks, métricas de calidad de imagen ni comparaciones objetivas con otros modelos.
- Los pesos están en un layout propietario del motor de la app Anima, por lo que no son directamente utilizables en llama.cpp, ComfyUI u otros runners estándar sin conversión.
- El modelo está pensado para GPU móvil con OpenCL; el rendimiento en otros entornos no está documentado.
- El lector de prompts Qwen 3.5 9B está cuantizado a Q4_K_M con partes eliminadas, lo que puede degradar la comprensión de instrucciones complejas.
- No se especifican idiomas soportados, sesgos conocidos ni tasas de alucinación.
- La licencia Apache 2.0 permite uso comercial, pero deben respetarse las licencias de los componentes: Qwen 3.5 (Apache 2.0) y taef2 (MIT).
- El add-on de 8 pasos se fusiona con peso 0,7; no se documenta el impacto de este valor en la fidelidad de la imagen.
- No hay información sobre el dataset de entrenamiento del modelo base, lo que limita la evaluación de sesgos y cobertura.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sebekblessing/moss-gpu
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Repositorio del decodificador taef2 (madebyollin): no disponible en la información proporcionada
- Variantes para Snapdragon: `moss-qnn-8elite` y `moss-qnn-8elite-gen5` (referenciadas en la model card, sin URL directa)
