# CNWPlayer/Vega-2-5M-PREVIEW

## Resumen

Vega-2-5M-PREVIEW es un modelo de lenguaje en miniatura publicado por el usuario CNWPlayer en Hugging Face, con un total de 4.895.240 parámetros según los pesos en safetensors. Se presenta como una versión preliminar de una arquitectura propia denominada "lowtide", basada en un transformer con bucles (looped-transformer) aplicado dos veces, y está entrenado únicamente en inglés. El autor lo etiqueta explícitamente como modelo de vista previa y anuncia una versión completa futura.

Por su escala (menos de 5 millones de parámetros) no es un modelo de propósito general comparable a los LLM habituales, sino una pieza experimental orientada a explorar variantes arquitectónicas como el reciclado de capas. La model card es informal y no aporta detalles técnicos verificables sobre datos de entrenamiento, contexto o evaluación, por lo que la mayor parte de las especificaciones quedan como no disponibles.

Su relevancia es limitada y de nicho: sirve como referencia para quienes investigan arquitecturas looped de bajo coste computacional y como ejemplo de publicación con licencia MIT en el ecosistema Hugging Face. No debe considerarse apto para producción ni para tareas que requieran calidad lingüística.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped-transformer (arquitectura "lowtide", bucle 2x) |
| Parametros totales | 4.895.240 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (con custom_code) |

## Arquitectura y entrenamiento

La arquitectura declarada es un transformer con reciclado de capas ("looped-transformer"), donde el bloque se aplica dos veces segun la model card. El autor denomina a esta variante "lowtide" y menciona el uso del optimizador THORN, sin aportar mas detalles sobre su funcionamiento, el numero de capas, la dimension del modelo o el mecanismo de atencion.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o instruccion. Tampoco se documentan innovaciones adicionales mas alla del bucle de capas. El repositorio incluye codigo personalizado (`custom_code`), lo que implica que la carga del modelo requiere confiar en la implementacion del autor.

## Capacidades

- Generacion de texto en ingles a escala muy reducida.
- Exploracion de arquitecturas looped para experimentacion academica.
- No hay evidencia documentada de razonamiento, codigo, matematicas o capacidades multilingues.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Investigacion de arquitecturas looped: utilizar el modelo como banco de pruebas para medir el efecto del reciclado de capas en tareas sinteticas de juguete.
- Educacion y divulgacion: ejemplo minimo de publicacion de un modelo con safetensors y licencia MIT para explicar el flujo de Hugging Face.
- Pruebas de integracion de `custom_code`: validar pipelines de carga de modelos con codigo remoto en entornos controlados.
- Benchmarking de infraestructura: medir latencia y overhead de carga en modelos de menos de 5M de parametros.
- Experimentos de destilacion o inicializacion: usar sus pesos como punto de partida en investigaciones sobre modelos diminutos.
- Demostraciones de generacion de texto a muy baja escala: ilustrar las limitaciones de los modelos por debajo de ciertos umbrales de parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (menos de 20 MB solo en pesos, mas overhead de runtime y KV cache).
- GPU recomendadas: cualquier GPU consumer moderna; el modelo cabe en CPU.
- Cabe en GPU consumer: si, en cualquier GPU con al menos 1-2 GB de VRAM (GTX 1050, RTX 3050, etc.).
- Opciones de despliegue: al requerir `custom_code`, la carga debe hacerse con `trust_remote_code=True` en Transformers; la compatibilidad con vLLM, llama.cpp, Ollama o TGI no esta documentada y probablemente no exista sin conversion.
- Latencia y throughput: no disponibles; por tamano, la latencia esperada es de milisegundos en hardware consumer.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Vega-2-5M-PREVIEW | 4,9M | no disponible | MIT | Looped-transformer, preview |
| SmolLM-135M | 135M | 2k-8k (segun version) | Apache 2.0 | Modelo pequeno de referencia de Hugging Face |
| TinyLlama-1.1B | 1,1B | 2k | Apache 2.0 | Modelo pequeno ampliamente usado |
| GPT-2 small | 124M | 1k | MIT | Referencia historica de modelos pequenos |

La comparativa es orientativa: Vega-2 es dos ordenes de magnitud menor que los modelos citados y no dispone de evaluacion publica que permita comparar rendimiento real.

## Limitaciones y advertencias

- Modelo en estado de vista previa; el autor anuncia cambios en la version completa.
- Sin datos publicados de evaluacion, sesgos o calidad; no apto para produccion.
- Entrenado solo en ingles; sin soporte multilingue documentado.
- Riesgo elevado de alucinacion y de texto incoherente por su escala parametrica.
- Requiere `trust_remote_code=True` para cargar el codigo personalizado, lo que implica un riesgo de seguridad si no se audita.
- Licencia MIT permite uso comercial, pero la ausencia de garantias y de documentacion desaconseja cualquier despliegue real.
- Longitud de contexto desconocida; no se puede planificar su uso en tareas de contexto largo.

## Enlaces

- Hugging Face: https://huggingface.co/CNWPlayer/Vega-2-5M-PREVIEW
