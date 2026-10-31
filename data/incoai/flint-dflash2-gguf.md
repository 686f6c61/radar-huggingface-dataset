# incoai/Flint-DFlash2-GGUF

## Resumen

Flint-DFlash2-GGUF es la conversión a formato GGUF (para llama.cpp) del modelo draft DFlash 2 publicado por Inco AI, diseñado específicamente para acelerar la inferencia del modelo [RecursiveSI/flint](https://huggingface.co/RecursiveSI/flint) mediante decodificación especulativa. No se trata de un modelo de lenguaje autónomo: su función es redactar (draft) bloques de tokens en paralelo que el modelo objetivo verifica posteriormente, aceptando o rechazando cada token.

La innovación central de DFlash 2 es que es un drafter de tipo block-diffusion: predice un bloque completo de tokens en una sola pasada, conservando los mejores candidatos en cada posición, y un selector ligero traza un camino coherente a través de ellos. Las convoluciones dinámicas "two-tap" en el backbone evitan que el borrador se degrade hacia el final del bloque. La decodificación es lossless: en modo greedy la salida coincide exactamente con la del modelo objetivo y, con muestreo, se preserva su distribución.

Con aproximadamente 402,5 millones de parámetros y cuantizaciones desde Q4_K_M (240 MB) hasta BF16 (811 MB), es un modelo muy ligero pensado para ejecutarse junto al modelo objetivo en el mismo hardware, aumentando el throughput de generación sin alterar la calidad del resultado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Drafter block-diffusion para decodificacion especulativa (DFlash 2), con convoluciones dinamicas two-tap y selector de candidatos |
| Parametros totales | 402.564.352 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K, Q8_0, BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (240 MB a 811 MB segun cuantizacion) |

## Arquitectura y entrenamiento

DFlash 2 es un drafter de decodificacion especulativa basado en difusion por bloques (block diffusion). A diferencia de los drafters autorregresivos clasicos, que generan tokens uno a uno, DFlash 2 predice un bloque entero de tokens en una sola pasada y mantiene los principales candidatos en cada posicion. Un selector ligero recorre estos candidatos para construir una secuencia coherente que el modelo objetivo verificara. El backbone incorpora convoluciones dinamicas de dos taps (two-tap dynamic convolutions) que estabilizan la calidad del borrador a lo largo del bloque, evitando el decaimiento tipico hacia el final.

La decodificacion es matematicamente equivalente a la del modelo objetivo: en modo greedy la salida es identica y con muestreo se preserva la distribucion original, por lo que no hay perdida de calidad. No se dispone de informacion sobre los datos de entrenamiento, el numero de tokens ni el uso de tecnicas de alineacion (RLHF/DPO). El modelo base del que deriva es [incoai/Flint-DFlash2](https://huggingface.co/incoai/Flint-DFlash2), y el modelo objetivo al que acompana es [RecursiveSI/flint](https://huggingface.co/RecursiveSI/flint). El metodo se presento en ICML 2026 en el articulo "DFlash: Block Diffusion for Flash Speculative Decoding".

## Capacidades

- Redaccion de bloques de tokens en paralelo para decodificacion especulativa, no generacion autonoma de texto.
- Prediccion de un bloque completo de tokens en una sola pasada (decodificacion paralela por difusion).
- Selector de candidatos que traza un camino coherente entre los mejores tokens de cada posicion del bloque.
- Decodificacion lossless: salida greedy identica al modelo objetivo y distribucion de muestreo preservada.
- Resistencia al decaimiento del borrador al final del bloque gracias a las convoluciones dinamicas two-tap.
- Integracion con servidores de decodificacion especulativa compatibles con llama.cpp y otros motores (segun el blog de DFlash 2).

## Casos de uso

- Aceleracion de inferencia en produccion: integrado como draft model en un servidor de decodificacion especulativa, aumenta el numero de tokens por segundo del modelo RecursiveSI/flint sin cambiar su salida, lo que reduce coste por token y latencia percibida.
- Servicios de chat conversacional: al reducir la latencia de generacion, mejora la experiencia de usuario en asistentes basados en flint, especialmente en respuestas largas donde el beneficio del draft por bloques es mayor.
- Procesamiento por lotes offline: en tareas de generacion masiva (resumenes de documentos, etiquetado, extraccion de datos), el mayor throughput se traduce directamente en menos tiempo de GPU por unidad de trabajo.
- Despliegues locales en hardware limitado: con cuantizaciones desde 240 MB, el drafter cabe en la misma GPU (o en la CPU) que el modelo objetivo en estaciones de trabajo consumer, permitiendo decodificacion especulativa sin hardware de datacenter.
- Experimentacion e investigacion en decodificacion especulativa: al ser open source (Apache 2.0) y estar disponible en GGUF, facilita replicar y comparar el enfoque block-diffusion frente a drafters autorregresivos en llama.cpp y otros motores.
- Validacion de consistencia de salida: dado que el esquema es lossless, puede usarse en pipelines donde la salida debe ser bit a bit identica a la del modelo objetivo (por ejemplo, tests de regresion de prompts), garantizando que la aceleracion no altera los resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las longitudes de aceptacion (acceptance lengths) de estas conversiones GGUF se anadiran mas adelante, y que las evaluaciones completas del checkpoint base estan en la model card principal de incoai/Flint-DFlash2.

## Requisitos de hardware

- VRAM para inferencia del drafter: aproximadamente 240 MB (Q4_K_M), 286 MB (Q5_K_M), 336 MB (Q6_K), 433 MB (Q8_0) u 811 MB (BF16) solo para los pesos del draft model, sin contar el modelo objetivo.
- GPUs recomendadas: cualquier GPU moderna es suficiente para el drafter dada su reducida huella; el requisito real lo impone el modelo objetivo (RecursiveSI/flint). No hay datos sobre VRAM total combinada.
- Cabe sin problema en GPUs consumer (por ejemplo, RTX 4060/4070/4090) incluso en BF16, dejando margen para el modelo objetivo.
- Despliegue: llama.cpp como motor principal; la model card remite al blog de DFlash 2 para otros motores compatibles. No se menciona soporte en vLLM, TGI u Ollama.
- Latencia y throughput: no disponible; la metrica relevante es la longitud de aceptacion, cuyos valores para los GGUF aun no se han publicado.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Formato | Licencia | Rol |
|---|---|---|---|---|---|
| Flint-DFlash2-GGUF | Drafter block-diffusion | 402,56 M | GGUF | Apache 2.0 | Draft model para RecursiveSI/flint |
| Drafters autorregresivos tipicos (p. ej. EAGLE-style) | Drafter autorregresivo | no disponible | no disponible | no disponible | Redactan token a token en lugar de por bloques |
| DFlash (original, ICML 2026) | Drafter block-diffusion, 1a generacion | no disponible | no disponible | no disponible | Predecesor sin selector de candidatos ni convoluciones two-tap |

No se dispone de datos cuantitativos suficientes para comparar rendimiento entre estos modelos.

## Limitaciones y advertencias

- No es un modelo de lenguaje standalone: no genera texto util por si solo y debe ejecutarse dentro de un servidor de decodificacion especulativa junto a RecursiveSI/flint.
- Los valores de longitud de aceptacion para las conversiones GGUF aun no se han publicado, por lo que no es posible verificar de antemano la ganancia de velocidad real en llama.cpp.
- La longitud de contexto, los idiomas soportados y los datos de entrenamiento no estan documentados en la model card.
- La aceleracion depende de la tasa de aceptacion del drafter frente al modelo objetivo; en dominios o idiomas poco representados en su entrenamiento, la ganancia puede ser menor.
- El repositorio es muy reciente (creado en octubre de 2026) y con pocas descargas (873), por lo que puede contener errores de conversion o falta de madurez en la integracion con distintos motores.
- La licencia Apache 2.0 no impone restricciones al uso comercial, pero conviene verificar tambien la licencia del modelo objetivo RecursiveSI/flint para el despliegue completo.

## Enlaces

- HuggingFace (GGUF): https://huggingface.co/incoai/Flint-DFlash2-GGUF
- Modelo draft original (safetensors): https://huggingface.co/incoai/Flint-DFlash2
- Modelo objetivo: https://huggingface.co/RecursiveSI/flint
- Blog de DFlash 2: https://inco.ai/blog/dflash2/
- GitHub: https://github.com/z-lab/dflash
