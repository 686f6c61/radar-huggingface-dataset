# sebekblessing/moss-qnn-8elite

## Resumen

MOSS-Image 8-step para Snapdragon 8 Elite es una conversión a dispositivo móvil del modelo de generación de imágenes MOSS-Image SFT, publicada por el usuario sebekblessing. El paquete combina dos componentes: un lector de prompts derivado de Qwen 3.5 9B (cuantizado a Q4_K_M con importance matrix en formato GGUF) y un modelo de difusión de 42 bloques compilado como binarios de contexto QNN para la unidad neuronal Hexagon v79 del Snapdragon 8 Elite. El resultado es un pipeline text-to-image completamente local que genera imágenes de 768x768 píxeles en 8 pasos.

La relevancia de esta ficha radica en que ejemplifica el despliegue de difusión de alta calidad en hardware móvil de consumo, sin depender de la nube. El autor reporta un tiempo de generación de entre 1,5 y 2 minutos por imagen en el dispositivo de referencia (iQOO 13), con un peso de descarga de aproximadamente 11,4 GB. El lector de prompts se cierra antes de iniciar la fase de dibujo, de modo que ambos componentes nunca coexisten en memoria.

El modelo base es OpenMOSS-Team/MOSS-Image-SFT, con un add-on de destilación de 8 pasos (DMD) de lodestones aplicado a fuerza 0,7. Los pesos del modelo de dibujo se convirtieron a ONNX, se cuantizaron a 4 bits (bloques de 32) y se compilaron para la NPU. La licencia es Apache 2.0, lo que permite uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (42 bloques) + lector de prompts tipo transformer (Qwen 3.5 9B) |
| Parametros totales | 7.936.684.544 (dato de safetensors del repo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (bloques de 32) en el modelo de dibujo; Q4_K_M con importance matrix en el lector; tablas de 8 bits para el add-on DMD |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (lector), binarios QNN de contexto (.bin), ONNX (intermedio de conversión) |

## Arquitectura y entrenamiento

El paquete es una conversión de inferencia, no un modelo entrenado desde cero. El componente de dibujo deriva de MOSS-Image SFT y se ha convertido a ONNX, cuantizado a 4 bits y compilado como binarios de contexto QNN para Hexagon v79. El add-on de 8 pasos de lodestones (DMD) se conserva como tablas separadas de 8 bits junto a los pesos de cada bloque, a fuerza 0,7. El modelo se organiza en 42 archivos de bloque (md0.bin a md41.bin), más un decodificador de imagen taef2 (fdec.bin), un módulo de conversión de salida del lector a filas de prompt del modelo de dibujo (mtxt.bin) y una señal de temporización por paso (mtime.bin).

El lector de prompts es Qwen 3.5 9B, convertido a GGUF y cuantizado a Q4_K_M con una importance matrix, y se ha podado de las partes que MOSS no utiliza. Se ejecuta mediante llama.cpp sobre la unidad neuronal. El sampler utiliza pasos planos sin guidance, con 8 niveles de ruido definidos en sigmas.txt. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el proceso de alineación (RLHF/DPO) del modelo base en la información proporcionada.

## Capacidades

- Generación de imágenes text-to-image a 768x768 píxeles en 8 pasos de difusión.
- Procesamiento de prompts en lenguaje natural mediante un lector basado en Qwen 3.5 9B.
- Ejecución completamente local en la NPU Hexagon v79 del Snapdragon 8 Elite, sin conexión a la nube.
- Inferencia en dos fases secuenciales: el lector se cierra antes de iniciar el dibujo, lo que reduce el pico de memoria.
- Integración con la app Anima (Android), que descarga los archivos mediante manifest.json con verificación SHA-256.
- No se documentan capacidades de tool calling, agentes, visión de entrada, audio ni modo thinking.

## Casos de uso

- Generación de imágenes offline en móvil: el paquete permite crear ilustraciones de 768x768 sin conexión, útil en entornos sin red o con requisitos de privacidad, con un tiempo de 1,5 a 2 minutos por imagen en el iQOO 13.
- Prototipado de apps Android de IA generativa: los desarrolladores pueden integrar el pipeline en la app Anima o reutilizar los binarios QNN para validar experiencias text-to-image en el dispositivo antes de escalar a producción.
- Demostración de despliegue en NPU móvil: sirve como referencia técnica para convertir modelos de difusión a QNN y cuantizar a 4 bits, con scripts de build incluidos en el repositorio.
- Creación de contenido para redes sociales en movilidad: la generación local permite producir imágenes bajo demanda sin depender de APIs externas ni de conectividad.
- Investigación en cuantización y compilación para Hexagon: el repositorio documenta el proceso de conversión a ONNX, cuantización y compilación, lo que facilita experimentos reproducibles sobre el hardware.
- Evaluación comparativa de pipelines de difusión en dispositivo: permite medir latencia y calidad frente a alternativas en la misma NPU, con un baseline concreto de 8 pasos y sampler sin guidance.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente reporta un tiempo de generación de aproximadamente 1,5 a 2 minutos por imagen de 768x768 en el Snapdragon 8 Elite (iQOO 13).

## Requisitos de hardware

- NPU objetivo: Hexagon v79 del Snapdragon 8 Elite (por ejemplo, iQOO 13). Los binarios QNN están compilados específicamente para esta unidad y no son portables a otras NPU sin recompilación.
- Almacenamiento: aproximadamente 11,4 GB de descarga para el conjunto completo de archivos.
- Memoria: el diseño secuencial (lector cerrado antes del dibujo) reduce el pico de memoria, pero no se especifica la RAM mínima requerida.
- GPU de escritorio: no aplica; el paquete está orientado a la NPU móvil. Para ejecutar el modelo base en servidor se requeriría el repositorio original OpenMOSS-Team/MOSS-Image-SFT.
- Opciones de despliegue: app Anima (Android) para el paquete QNN; llama.cpp para el lector GGUF; los scripts de build del repositorio permiten regenerar los binarios.
- Latencia: 1,5 a 2 minutos por imagen de 768x768 en el dispositivo de referencia. No se dispone de datos de throughput para otros dispositivos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|
| sebekblessing/moss-qnn-8elite | 7.936.684.544 (base) | no disponible | GGUF + QNN | Apache 2.0 | NPU Snapdragon 8 Elite |
| OpenMOSS-Team/MOSS-Image-SFT | no disponible | no disponible | safetensors | no disponible | Servidor/GPU |
| lodestones/MOSS-Image-SFT-8-steps-dmd | no disponible | no disponible | no disponible | no disponible | Servidor/GPU |

La comparativa se limita a los modelos de la misma familia, ya que no se dispone de información sobre alternativas de difusión móvil comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Los binarios QNN están compilados para Hexagon v79 (Snapdragon 8 Elite); no funcionan en otras NPU sin recompilación.
- Las imágenes generadas pueden diferir ligeramente de las del modelo original debido a la cuantización a 4 bits y a la poda del lector.
- No se documentan sesgos conocidos, riesgo de alucinación visual ni limitaciones idiomáticas del modelo base en la información disponible.
- El sampler utiliza pasos planos sin guidance, lo que limita el control fino sobre la adherencia al prompt en comparación con pipelines con classifier-free guidance.
- El tiempo de generación de 1,5 a 2 minutos por imagen puede ser excesivo para aplicaciones interactivas en tiempo real.
- La licencia Apache 2.0 permite uso comercial, pero se debe conservar la atribución y verificar las licencias de los modelos base y del add-on DMD.
- El repositorio tiene 0 likes y 249 descargas, por lo que la validación comunitaria es escasa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sebekblessing/moss-qnn-8elite
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Add-on de 8 pasos: https://huggingface.co/lodestones/MOSS-Image-SFT-8-steps-dmd
- App Anima (Android): https://github.com/adiirfan/anima-android
