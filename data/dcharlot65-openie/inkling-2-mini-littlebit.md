# dcharlot65-openie/Inkling-2-Mini-LittleBit

## Resumen

Inkling-2-Mini-LittleBit es un checkpoint de pesos "vivos" (*living weights*) derivado del modelo base `thinkingmachines/Inkling-2-Mini`, publicado por el usuario `dcharlot65-openie`. No es un modelo entrenado desde cero, sino una re-factorización del modelo original mediante una combinación de LittleBit-2 y Sakana SVF, empaquetada en formato `.jsyn` para el runtime JouleDB, una base de datos termodinámica y sustrato de agentes nativo de Kubernetes que opera sin PyTorch.

El interés técnico reside en su perfil de compresión extrema: 26.388.641.280 parámetros almacenados en un artefacto de 142,44 MB con una media de 0,0282 bits por peso (BPW), lo que supone una reducción de 353,35x respecto al equivalente en FP16 (50.332,34 MB). El checkpoint contiene 622 tensores 2D en bitplanes y 494 vectores 1D (LayerNorm, bias, depthwise).

La ficha se redacta con la información disponible en la model card y los metadatos de Hugging Face. No se han publicado detalles sobre arquitectura interna del modelo base, datos de entrenamiento, benchmarks ni idiomas soportados, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base `thinkingmachines/Inkling-2-Mini`; factorización LittleBit-2 + Sakana SVF sobre pesos) |
| Parametros totales | 26.388.641.280 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | sub-1-bit (0,0282 BPW medio); 622 tensores 2D en bitplanes + 494 vectores 1D (LayerNorm/bias/depthwise) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.jsyn` (JouleDB, comprimido con zstd + CRC32) |

## Arquitectura y entrenamiento

El artefacto no documenta la arquitectura del transformer subyacente: la model card solo indica que deriva de `thinkingmachines/Inkling-2-Mini` y que se ha aplicado una factorización híbrida denominada "LittleBit-2 ⊕ Sakana SVF". LittleBit-2 actúa como esquema de cuantización sub-1-bit por bitplanes, y SVF (singular value factorization) descompone los pesos en factores de rango reducido antes de la cuantización. El resultado son 622 tensores 2D representados en bitplanes y 494 vectores 1D que conservan LayerNorm, bias y parámetros depthwise en mayor precisión.

No se especifican tokens de entrenamiento, composición del dataset, ni si hubo RLHF, DPO o ajuste fino adicional. Tampoco se documenta el proceso de calibración de la factorización ni las métricas de degradación respecto al modelo base. El checkpoint se distribuye como un artefacto de inferencia para el runtime JouleDB (v0.2.4+), que ejecuta la inferencia sin PyTorch y está diseñado para desplegarse sobre Kubernetes mediante JouleKube.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base `Inkling-2-Mini`, aunque no se documenta el alcance exacto tras la factorización sub-1-bit.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: el artefacto se enmarca en un sustrato de agentes (JouleKube), pero no se detallan capacidades específicas del modelo.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Inferencia sin PyTorch: el formato `.jsyn` se ejecuta directamente en el runtime JouleDB, con compresión zstd y verificación CRC32.

## Casos de uso

- Despliegue en clústeres Kubernetes con restricciones severas de almacenamiento: el checkpoint de 142,44 MB permite distribuir el modelo en imágenes de contenedor o volúmenes persistentes pequeños, adecuado para entornos edge o nodos con cuotas de disco reducidas.
- Sustrato de agentes en JouleKube: al integrarse en el runtime JouleDB, puede servir como motor de inferencia dentro de pipelines de agentes orquestados de forma nativa en Kubernetes.
- Pruebas de concepto de cuantización sub-1-bit: útil para investigadores que evalúen la viabilidad de esquemas LittleBit-2 + SVF frente a cuantizaciones convencionales de 4 u 8 bits.
- Prototipado rápido sin dependencia de PyTorch: el binario `jouledb` (instalable con `cargo binstall`) y la API `jouledb.connect` permiten levantar un servidor HTTP de inferencia sin stack de Python.
- Entornos con requisitos de integridad de artefactos: la comprobación CRC32 del `.jsyn` facilita la verificación de pesos en pipelines de CI/CD.
- Investigación sobre "living weights" y bases de datos termodinámicas: el artefacto sirve como referencia reproducible para estudiar la factorización de pesos de un modelo de 26B parámetros en un espacio de 0,0282 BPW.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del artefacto en disco (142,44 MB) no equivale al consumo de memoria en ejecución, ya que la descompresión de bitplanes y la reconstrucción de pesos requieren memoria adicional no documentada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: runtime JouleDB v0.2.4+ (`jouledb serve --http-addr 127.0.0.1:8080`), desplegable sobre Kubernetes vía JouleKube. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (cuantización sub-1-bit con runtime propio) ni datos de rendimiento del modelo base `Inkling-2-Mini` que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- No se documenta la degradación de calidad respecto al modelo base tras la factorización a 0,0282 BPW; la pérdida de precisión podría ser significativa y no está cuantificada.
- Ausencia total de benchmarks: no hay evidencia publicada de rendimiento en tareas de razonamiento, código o matemáticas.
- Idiomas soportados no especificados; no se puede garantizar cobertura multilingüe.
- Dependencia del runtime JouleDB: el formato `.jsyn` no es compatible con ecosistemas estándar (transformers, vLLM, llama.cpp), lo que limita la portabilidad.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria ni informes independientes de funcionamiento.
- Licencia Apache 2.0 permite uso comercial, pero la atribución al modelo base `thinkingmachines/Inkling-2-Mini` debe mantenerse.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible.
- El checkpoint se publicó el 24 de noviembre de 2026 y no se ha actualizado desde entonces; posible falta de mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/dcharlot65-openie/Inkling-2-Mini-LittleBit
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio JouleDB: https://github.com/openIE-dev/jouledb
