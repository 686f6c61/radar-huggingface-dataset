# sebekblessing/moss-qnn-8elite-gen5

## Resumen

MOSS-Image 8-step para Snapdragon 8 Elite Gen 5 es una conversión a dispositivo móvil del modelo de generación de imágenes MOSS-Image SFT (OpenMOSS-Team), combinado con el complemento de destilación DMD de 8 pasos de lodestones. El autor, sebekblessing, ha compilado los pesos como binarios de contexto QNN para la unidad neuronal Hexagon v81 del SoC Qualcomm Snapdragon 8 Elite Gen 5, de modo que el modelo se ejecuta íntegramente en la NPU del teléfono en lugar de en CPU o GPU.

El paquete incluye un lector de prompts basado en Qwen 3.5 9B cuantizado a Q4_K_M con matriz de importancia y ejecutado por llama.cpp sobre la unidad neuronal, junto con el modelo de difusión de imagen (42 bloques `md0.bin`–`md41.bin`) y el decodificador de imagen `fdec.bin` (taef2). La generación produce imágenes de 768x768 píxeles en 8 pasos con muestreo sin guiado (plain steps), lo que reduce drásticamente el coste computacional frente a los pipelines de difusión convencionales de 20-50 pasos.

La relevancia de esta ficha es doble: por un lado, documenta un caso real de despliegue de un modelo de difusión de ~7.900 millones de parámetros en hardware móvil mediante cuantización agresiva (4 bits en bloques de 32) y compilación QNN; por otro, sirve como referencia para quienes quieran reproducir el proceso, ya que el repositorio incluye los scripts de construcción en `build/`. La licencia Apache 2.0 facilita su uso comercial, aunque las limitaciones de hardware restringen su aplicabilidad a un único SoC.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión de imagen (base MOSS-Image SFT) + lector de prompts Qwen 3.5 9B; compilado como binarios de contexto QNN para Hexagon v81 |
| Parametros totales | 7.936.684.544 (~7,94 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el lector es Qwen 3.5 9B, contexto no especificado en la información proporcionada) |
| Tipos de cuantizacion | Pesos del modelo de dibujo a 4 bits en bloques de 32; complemento de 8 pasos como tablas separadas de 8 bits (fuerza 0,7); lector en GGUF Q4_K_M con matriz de importancia |
| Idiomas soportados | No disponible (el lector Qwen 3.5 9B es multilingüe, pero la model card no detalla idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`moss_reader.gguf`), binarios QNN (`*.bin`), `manifest.json`, `sigmas.txt`, `sampler.txt` |

## Arquitectura y entrenamiento

El modelo subyacente es MOSS-Image SFT, un modelo de difusión texto-a-imagen, al que se le ha aplicado el complemento de destilación DMD (Distribution Matching Distillation) de 8 pasos de lodestones. Esta destilación permite reducir el número de pasos de muestreo de decenas a solo 8, manteniendo una calidad razonable para uso móvil. El pipeline completo consta de un lector de prompts (Qwen 3.5 9B, cuantizado a Q4_K_M con imatrix y recortado de las partes que MOSS no utiliza) que genera las representaciones de texto, un módulo `mtxt.bin` que las transforma en filas de prompt para el modelo de dibujo, y el modelo de difusión propiamente dicho dividido en 42 bloques (`md0.bin` a `md41.bin`), más un decodificador de imagen `fdec.bin` (taef2).

La conversión a móvil implicó convertir los pesos del modelo de dibujo a ONNX, cuantizarlos a 4 bits y compilarlos para la NPU Hexagon v81 con nivel de optimización QNN 1 (en lugar de 3), lo que acelera la compilación pero genera archivos aproximadamente un 20% más grandes. El complemento de 8 pasos se mantiene como tablas de 8 bits separadas junto a los pesos de cada bloque, con una fuerza de 0,7. El lector se cierra antes de iniciar el dibujo, por lo que ambos modelos no coexisten en memoria. No se especifican en la información proporcionada los datos de entrenamiento originales (número de tokens, composición del dataset, uso de RLHF/DPO) del modelo base MOSS-Image SFT, por lo que se considera no disponible.

## Capacidades

- Generación de imágenes texto-a-imagen a 768x768 píxeles en 8 pasos de muestreo.
- Comprensión de prompts en lenguaje natural mediante el lector Qwen 3.5 9B, que soporta conversación multi-turno (etiqueta `conversational`).
- Ejecución íntegra en la NPU Hexagon v81 del Snapdragon 8 Elite Gen 5, sin necesidad de CPU/GPU.
- Sampler de pasos simples sin guiado (plain steps, no guidance), definido en `sampler.txt`.
- Niveles de ruido predefinidos en `sigmas.txt` para los 8 pasos.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`), lo que sugiere integración con APIs compatibles.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking en la información proporcionada.

## Casos de uso

- Generación de imágenes en el propio dispositivo: el modelo permite crear ilustraciones o imágenes conceptuales a partir de texto sin conexión a internet, aprovechando la NPU del Snapdragon 8 Elite Gen 5 y los 8 pasos de difusión para reducir la latencia.
- Aplicaciones de creatividad móvil: integración en apps de edición o diseño (como la app Anima) para generar borradores visuales rápidos a 768x768, con la ventaja de que el lector de prompts se cierra antes del dibujo, liberando memoria.
- Prototipado de pipelines de difusión en hardware Qualcomm: sirve como referencia para desarrolladores que quieran compilar sus propios modelos de difusión con QNN y cuantización 4-bit, usando los scripts de `build/`.
- Investigación en eficiencia de modelos: útil para estudiar el impacto de la cuantización a 4 bits en bloques de 32 y de la destilación DMD de 8 pasos en la calidad de imagen final.
- Demostraciones de IA generativa en ferias o entornos sin conectividad: al ejecutarse localmente, no depende de servicios en la nube y puede mostrar generación de imágenes en tiempo real en un dispositivo móvil.
- Evaluación de la viabilidad de modelos de ~8.000 millones de parámetros en NPUs móviles: el paquete de 11,3 GB de descarga y su partición en bloques permite medir throughput y uso de memoria en Hexagon v81.
- Generación de imágenes asistida por conversación: gracias al lector Qwen 3.5 9B, se pueden refinar prompts de forma iterativa antes de lanzar el dibujo, útil en asistentes creativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- SoC exclusivo: Snapdragon 8 Elite Gen 5 (Hexagon v81). No funciona en Hexagon v79 (Snapdragon 8 Elite); para ese caso existe `moss-qnn-8elite`.
- Descarga total: aproximadamente 11,3 GB (el repositorio completo ocupa 21,6 GB).
- Memoria: el lector y el modelo de dibujo no coexisten en memoria (el lector se cierra antes de dibujar), lo que reduce el pico de RAM; no se especifica la VRAM/RAM exacta necesaria.
- GPU recomendadas: no aplica; el modelo está compilado para la NPU Hexagon v81, no para GPU.
- ¿Cabe en GPU consumer? No, está diseñado exclusivamente para la NPU móvil Qualcomm.
- Opciones de despliegue: app Anima (Android); los archivos deben copiarse manualmente a la carpeta de modelos de la app, ya que esta aún no descarga automáticamente el conjunto Gen 5. No se mencionan vLLM, llama.cpp (salvo para el lector), Ollama ni TGI para el modelo completo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Hardware objetivo | Licencia | Formato |
|---|---|---|---|---|---|
| moss-qnn-8elite-gen5 (este) | ~7,94 mil millones | No disponible | Snapdragon 8 Elite Gen 5 (Hexagon v81) | Apache 2.0 | GGUF + QNN binarios |
| moss-qnn-8elite | No disponible | No disponible | Snapdragon 8 Elite (Hexagon v79) | No disponible | QNN binarios |
| OpenMOSS-Team/MOSS-Image-SFT (base) | No disponible | No disponible | Servidor/GPU | No disponible | No disponible |
| lodestones/MOSS-Image-SFT-8-steps-dmd | No disponible | No disponible | Servidor/GPU | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a aspectos de hardware y licencia.

## Limitaciones y advertencias

- Exclusivo para Snapdragon 8 Elite Gen 5 (Hexagon v81); no se ejecuta en otros SoC ni en GPU de escritorio.
- La compilación con nivel de optimización QNN 1 genera archivos un 20% más grandes que con nivel 3, lo que aumenta el espacio de almacenamiento necesario.
- Las imágenes generadas pueden diferir ligeramente de las del modelo original debido a la cuantización a 4 bits y a la conversión a ONNX.
- La app Anima no descarga automáticamente este conjunto Gen 5; requiere copia manual de los archivos según `manifest.json`, lo que añade fricción al despliegue.
- No se documentan sesgos conocidos, riesgo de alucinación visual ni limitaciones idiomáticas específicas en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero la dependencia de hardware propietario Qualcomm y de la app Anima puede condicionar la distribución.
- El lector Qwen 3.5 9B está recortado de partes que MOSS no usa, lo que podría afectar a la fidelidad de prompts complejos.
- No hay datos de benchmarks ni de latencia, por lo que no se puede evaluar objetivamente la calidad frente a alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/sebekblessing/moss-qnn-8elite-gen5
- Modelo base MOSS-Image SFT: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Complemento 8-step DMD: https://huggingface.co/lodestones/MOSS-Image-SFT-8-steps-dmd
- App Anima (Android): https://github.com/adiirfan/anima-android
- Scripts de construcción: https://huggingface.co/sebekblessing/moss-qnn-8elite-gen5/tree/main/build (referenciado como `build/README.md` en el repositorio)
- Versión para Snapdragon 8 Elite (Hexagon v79): https://huggingface.co/sebekblessing/moss-qnn-8elite
